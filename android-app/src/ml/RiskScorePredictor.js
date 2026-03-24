import { loadTensorflowModel } from "react-native-fast-tflite";
import { preprocessFeatureVector } from "../preprocessing/NoiseFilter";
import LocalDatabase  from "../storage/LocalDatabase";
import BackendClient  from "../api/BackendClient";
import LocationFeatures  from "../features/LocationFeatures";
import SleepFeatures     from "../features/SleepFeatures";
import CircadianFeatures from "../features/CircadianFeatures";
import AccelerometerSensor from "../sensors/AccelerometerSensor";
import ScreenEventListener from "../sensors/ScreenEventListener";
import CallLogReader       from "../sensors/CallLogReader";

const MODEL_PATH    = require("../../assets/model.tflite");
const METADATA_PATH = require("../../assets/model_metadata.json");
const RISK_THRESHOLD = 0.65

class RiskScorePredictor {
  constructor() {
    this.model        = null
    this.metadata     = null
    this.isLoaded     = false
    this.inferenceLog = []
  }

  async load() {
    try {
      this.model    = await loadTensorflowModel(MODEL_PATH)
      this.metadata = METADATA_PATH
      this.isLoaded = true
      console.log("[RiskScorePredictor] TFLite model loaded")
      console.log(`[RiskScorePredictor] Features: ${this.metadata.num_features}`)
    } catch (err) {
      console.error("[RiskScorePredictor] Failed to load model:", err)
      this.isLoaded = false
    }
  }

  async runInference(date = new Date()) {
    if (!this.isLoaded) {
      console.warn("[RiskScorePredictor] Model not loaded, attempting reload...")
      await this.load()
      if (!this.isLoaded) return null
    }

    try {
      // Collect all features for the day
      const [
        locationFeats,
        sleepFeats,
        circadianFeats,
        movementFeats,
        screenFeats,
        callFeats,
      ] = await Promise.all([
        LocationFeatures.extract(date),
        SleepFeatures.extract(date),
        CircadianFeatures.extract(date),
        AccelerometerSensor.getDailySummary(date),
        ScreenEventListener.getDailySummary(date),
        CallLogReader.getDailySummary(date),
      ])

      // Assemble feature vector in the exact order from training
      const rawFeatures = [
        locationFeats.radius_of_gyration,
        locationFeats.home_stay_pct,
        locationFeats.location_entropy,
        locationFeats.num_places_visited,
        movementFeats.total_steps,
        movementFeats.sedentary_bouts,
        movementFeats.sedentary_mins,
        circadianFeats.circadian_index,
        circadianFeats.interdaily_stability,
        circadianFeats.intradaily_variability,
        sleepFeats.sleep_duration_hrs,
        sleepFeats.sleep_midpoint_hr,
        sleepFeats.sleep_disruption_count,
        callFeats.call_frequency,
        callFeats.call_duration_avg,
        screenFeats.screen_unlock_count,
        screenFeats.screen_on_duration_mins,
      ]

      // Preprocess using scaler params from metadata
      const scalerParams = {
        mean:  this.metadata.scaler_mean,
        scale: this.metadata.scaler_scale,
      }
      const processedFeatures = preprocessFeatureVector(rawFeatures, scalerParams)

      // Run TFLite inference
      const inputTensor = new Float32Array(processedFeatures)
      const output      = await this.model.run([inputTensor])
      const riskScore   = output[0][0]   // single probability output

      const windowStart = new Date(date)
      windowStart.setHours(0, 0, 0, 0)

      const result = {
        score:        parseFloat(riskScore.toFixed(4)),
        window_start: windowStart.toISOString(),
        window_end:   date.toISOString(),
        features:     rawFeatures,
        is_high_risk: riskScore >= RISK_THRESHOLD,
        timestamp:    new Date().toISOString(),
      }

      // Store locally
      await LocalDatabase.insert("risk_scores", result)
      this.inferenceLog.push(result)

      // Sync to backend
      await BackendClient.submitRiskScore(result)

      console.log(`[RiskScorePredictor] Score: ${result.score} (${result.is_high_risk ? "HIGH RISK" : "normal"})`)
      return result

    } catch (err) {
      console.error("[RiskScorePredictor] Inference failed:", err)
      return null
    }
  }

  getLastScore() {
    return this.inferenceLog[this.inferenceLog.length - 1] || null
  }

  async getScoreHistory(days = 7) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return LocalDatabase.query("risk_scores", {
      since: since.toISOString()
    })
  }
}

export default new RiskScorePredictor()