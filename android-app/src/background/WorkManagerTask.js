import BackgroundFetch from "react-native-background-fetch";
import RiskScorePredictor  from "../ml/RiskScorePredictor";
import GpsSensor           from "../sensors/GpsSensor";
import AccelerometerSensor from "../sensors/AccelerometerSensor";
import ScreenEventListener from "../sensors/ScreenEventListener";
import CallLogReader       from "../sensors/CallLogReader";
import BackendClient       from "../api/BackendClient";
import LocalDatabase       from "../storage/LocalDatabase";

/**
 * WorkManagerTask.js
 *
 * Manages background task scheduling using react-native-background-fetch.
 * Android equivalent of WorkManager periodic tasks.
 *
 * Tasks scheduled:
 *   - SENSOR_COLLECTION  : every 15 minutes (minimum Android interval)
 *   - RISK_INFERENCE     : every 6 hours (daily window analysis)
 *   - BACKEND_SYNC       : every 1 hour (flush queued scores)
 *   - DB_CLEANUP         : daily (prune old raw readings)
 */

const TASK_SENSOR_COLLECTION = "com.iotdepression.sensor_collection";
const TASK_RISK_INFERENCE    = "com.iotdepression.risk_inference";
const TASK_BACKEND_SYNC      = "com.iotdepression.backend_sync";
const TASK_DB_CLEANUP        = "com.iotdepression.db_cleanup";

class WorkManagerTask {

  async configure() {
    // Main background fetch config
    await BackgroundFetch.configure(
      {
        minimumFetchInterval:    15,     // minutes
        stopOnTerminate:         false,
        startOnBoot:             true,
        enableHeadless:          true,
        requiredNetworkType:     BackgroundFetch.NETWORK_TYPE_ANY,
        requiresCharging:        false,
        requiresDeviceIdle:      false,
        requiresBatteryNotLow:   false,
        requiresStorageNotLow:   false,
      },
      async (taskId) => {
        console.log(`[WorkManagerTask] Background task fired: ${taskId}`);
        await this._handleTask(taskId);
        BackgroundFetch.finish(taskId);
      },
      (taskId) => {
        console.warn(`[WorkManagerTask] Task timeout: ${taskId}`);
        BackgroundFetch.finish(taskId);
      }
    );

    // Register periodic tasks
    await this._registerTasks();
    console.log("[WorkManagerTask] All tasks registered");
  }

  async _registerTasks() {
    // Sensor collection — every 15 min
    await BackgroundFetch.scheduleTask({
      taskId:               TASK_SENSOR_COLLECTION,
      delay:                15 * 60 * 1000,
      periodic:             true,
      stopOnTerminate:      false,
      startOnBoot:          true,
    });

    // Risk inference — every 6 hours
    await BackgroundFetch.scheduleTask({
      taskId:               TASK_RISK_INFERENCE,
      delay:                6 * 60 * 60 * 1000,
      periodic:             true,
      stopOnTerminate:      false,
      startOnBoot:          true,
      requiredNetworkType:  BackgroundFetch.NETWORK_TYPE_ANY,
    });

    // Backend sync — every 1 hour
    await BackgroundFetch.scheduleTask({
      taskId:               TASK_BACKEND_SYNC,
      delay:                60 * 60 * 1000,
      periodic:             true,
      stopOnTerminate:      false,
      startOnBoot:          true,
      requiredNetworkType:  BackgroundFetch.NETWORK_TYPE_ANY,
    });

    // DB cleanup — every 24 hours
    await BackgroundFetch.scheduleTask({
      taskId:               TASK_DB_CLEANUP,
      delay:                24 * 60 * 60 * 1000,
      periodic:             true,
      stopOnTerminate:      false,
      startOnBoot:          true,
    });
  }

  async _handleTask(taskId) {
    switch (taskId) {
      case TASK_SENSOR_COLLECTION:
        await this._runSensorCollection();
        break;
      case TASK_RISK_INFERENCE:
        await this._runRiskInference();
        break;
      case TASK_BACKEND_SYNC:
        await this._runBackendSync();
        break;
      case TASK_DB_CLEANUP:
        await this._runDbCleanup();
        break;
      default:
        // Default background fetch — run sensor collection
        await this._runSensorCollection();
    }
  }

  async _runSensorCollection() {
    console.log("[WorkManagerTask] Running sensor collection...");
    try {
      await Promise.all([
        CallLogReader.syncToday(),
      ]);
      // GPS and accelerometer run continuously via their own listeners
      // Screen events are captured via AppState listener
      console.log("[WorkManagerTask] Sensor collection complete");
    } catch (err) {
      console.error("[WorkManagerTask] Sensor collection error:", err);
    }
  }

  async _runRiskInference() {
    console.log("[WorkManagerTask] Running risk inference...");
    try {
      if (!RiskScorePredictor.isLoaded) {
        await RiskScorePredictor.load();
      }
      const result = await RiskScorePredictor.runInference(new Date());
      if (result?.is_high_risk) {
        await this._sendHighRiskNotification(result.score);
      }
      console.log("[WorkManagerTask] Inference complete. Score:", result?.score);
    } catch (err) {
      console.error("[WorkManagerTask] Inference error:", err);
    }
  }

  async _runBackendSync() {
    console.log("[WorkManagerTask] Flushing backend queue...");
    try {
      await BackendClient.init();
      await BackendClient.flushQueue();
      console.log("[WorkManagerTask] Backend sync complete");
    } catch (err) {
      console.error("[WorkManagerTask] Backend sync error:", err);
    }
  }

  async _runDbCleanup() {
    console.log("[WorkManagerTask] Running DB cleanup...");
    try {
      // Keep only last 14 days of raw sensor readings
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);

      await LocalDatabase.db?.executeSql(
        `DELETE FROM sensor_readings WHERE timestamp < ?`,
        [cutoff.toISOString()]
      );
      console.log("[WorkManagerTask] DB cleanup complete");
    } catch (err) {
      console.error("[WorkManagerTask] DB cleanup error:", err);
    }
  }

  async _sendHighRiskNotification(score) {
    // Push notification via react-native-push-notification
    try {
      const PushNotification = require("@react-native-community/push-notification-ios");
      PushNotification.presentLocalNotification({
        alertTitle:   "Depression Risk Alert",
        alertBody:    `Your risk score is ${(score * 100).toFixed(0)}%. Consider reaching out to your clinician.`,
        applicationIconBadgeNumber: 1,
      });
    } catch {
      console.warn("[WorkManagerTask] Push notification not available");
    }
  }

  async stop() {
    await BackgroundFetch.stop();
    console.log("[WorkManagerTask] All tasks stopped");
  }
}

export default new WorkManagerTask();