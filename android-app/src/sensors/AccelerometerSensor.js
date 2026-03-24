import { accelerometer, setUpdateIntervalForType, SensorTypes } from "react-native-sensors";
import { Subscription } from "rxjs";
import LocalDatabase from "../storage/LocalDatabase";

const SAMPLE_RATE_MS     = 20;       // 50 Hz
const BATCH_SIZE         = 250;      // flush every 250 samples (~5 seconds)
const STEP_THRESHOLD     = 1.2;      // g-force delta to count a step
const SEDENTARY_MINS     = 30;       // minutes of inactivity = sedentary bout

class AccelerometerSensor {
  constructor() {
    this.subscription  = null;
    this.buffer        = [];
    this.stepCount     = 0;
    this.lastMagnitude = 0;
    this.isRunning     = false;
  }

  start() {
    if (this.isRunning) return;

    setUpdateIntervalForType(SensorTypes.accelerometer, SAMPLE_RATE_MS);

    this.subscription = accelerometer.subscribe({
      next:  (data) => this._onSample(data),
      error: (err)  => console.warn("[Accelerometer] Error:", err),
    });

    this.isRunning = true;
    console.log("[AccelerometerSensor] Started at 50Hz");
  }

  stop() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      this.isRunning    = false;
      console.log("[AccelerometerSensor] Stopped");
    }
  }

  _onSample({ x, y, z, timestamp }) {
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Simple step detection via peak detection
    const delta = Math.abs(magnitude - this.lastMagnitude);
    if (delta > STEP_THRESHOLD) {
      this.stepCount++;
    }
    this.lastMagnitude = magnitude;

    this.buffer.push({ x, y, z, magnitude, timestamp });

    if (this.buffer.length >= BATCH_SIZE) {
      this._flushBuffer();
    }
  }

  async _flushBuffer() {
    if (!this.buffer.length) return;

    const batch = [...this.buffer];
    this.buffer = [];

    const magnitudes = batch.map((s) => s.magnitude);
    const summary = {
      type:        "accelerometer",
      mean_mag:    _mean(magnitudes),
      std_mag:     _std(magnitudes),
      max_mag:     Math.max(...magnitudes),
      min_mag:     Math.min(...magnitudes),
      step_count:  this.stepCount,
      is_sedentary: _mean(magnitudes) < 0.1,
      sample_count: batch.length,
      timestamp:   new Date().toISOString(),
    };

    await LocalDatabase.insert("sensor_readings", summary);
    this.stepCount = 0;
  }

  async getDailySummary(date = new Date()) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const readings = await LocalDatabase.query("sensor_readings", {
      type:  "accelerometer",
      since: dayStart.toISOString(),
      until: dayEnd.toISOString(),
    });

    const totalSteps     = readings.reduce((sum, r) => sum + (r.step_count || 0), 0);
    const sedentaryCount = readings.filter((r) => r.is_sedentary).length;
    const sedentaryMins  = (sedentaryCount * BATCH_SIZE * SAMPLE_RATE_MS) / 60000;

    return {
      date:             date.toISOString().slice(0, 10),
      total_steps:      totalSteps,
      sedentary_bouts:  Math.floor(sedentaryMins / SEDENTARY_MINS),
      sedentary_mins:   Math.round(sedentaryMins),
      mean_activity:    _mean(readings.map((r) => r.mean_mag)),
    };
  }
}

// --- Helpers ---
function _mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function _std(arr) {
  if (arr.length < 2) return 0;
  const m = _mean(arr);
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

export default new AccelerometerSensor();