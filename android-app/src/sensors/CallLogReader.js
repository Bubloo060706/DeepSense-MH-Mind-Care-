import { AppState, NativeEventEmitter, NativeModules } from "react-native";
import LocalDatabase from "../storage/LocalDatabase";

/**
 * Tracks screen on/off events and computes:
 * - unlock count per day
 * - total screen-on duration
 * - session lengths
 *
 * Uses AppState for foreground/background detection.
 * For true screen lock/unlock events, a native module
 * (ScreenStateModule) is required — stub provided below.
 */

class ScreenEventListener {
  constructor() {
    this.appStateSubscription = null;
    this.currentState         = AppState.currentState;
    this.sessionStart         = null;
    this.unlockCount          = 0;
    this.totalOnMs            = 0;
    this.isRunning            = false;
  }

  start() {
    if (this.isRunning) return;

    this.appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => this._onAppStateChange(nextState)
    );

    // Native screen lock/unlock events (requires ScreenStateModule)
    try {
      const emitter = new NativeEventEmitter(NativeModules.ScreenStateModule);
      this.screenOnSub  = emitter.addListener("screenOn",  () => this._onScreenOn());
      this.screenOffSub = emitter.addListener("screenOff", () => this._onScreenOff());
    } catch {
      console.warn("[ScreenEventListener] Native ScreenStateModule not available, using AppState only");
    }

    this.isRunning = true;
    console.log("[ScreenEventListener] Started");
  }

  stop() {
    this.appStateSubscription?.remove();
    this.screenOnSub?.remove();
    this.screenOffSub?.remove();
    this.isRunning = false;
    console.log("[ScreenEventListener] Stopped");
  }

  _onAppStateChange(nextState) {
    if (
      this.currentState.match(/inactive|background/) &&
      nextState === "active"
    ) {
      this._onScreenOn();
    }

    if (
      this.currentState === "active" &&
      nextState.match(/inactive|background/)
    ) {
      this._onScreenOff();
    }

    this.currentState = nextState;
  }

  _onScreenOn() {
    this.sessionStart = Date.now();
    this.unlockCount++;

    LocalDatabase.insert("sensor_readings", {
      type:      "screen_event",
      event:     "screen_on",
      timestamp: new Date().toISOString(),
    });
  }

  async _onScreenOff() {
    if (!this.sessionStart) return;

    const durationMs       = Date.now() - this.sessionStart;
    this.totalOnMs        += durationMs;
    this.sessionStart      = null;

    await LocalDatabase.insert("sensor_readings", {
      type:        "screen_event",
      event:       "screen_off",
      duration_ms: durationMs,
      timestamp:   new Date().toISOString(),
    });
  }

  async getDailySummary(date = new Date()) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const events = await LocalDatabase.query("sensor_readings", {
      type:  "screen_event",
      since: dayStart.toISOString(),
    });

    const unlocks    = events.filter((e) => e.event === "screen_on").length;
    const offEvents  = events.filter((e) => e.event === "screen_off");
    const totalOnMin = offEvents.reduce(
      (sum, e) => sum + (e.duration_ms || 0), 0
    ) / 60000;

    return {
      date:              date.toISOString().slice(0, 10),
      screen_unlock_count: unlocks,
      screen_on_duration_mins: Math.round(totalOnMin),
      avg_session_mins:  unlocks > 0
        ? Math.round(totalOnMin / unlocks)
        : 0,
    };
  }
}

export default new ScreenEventListener();