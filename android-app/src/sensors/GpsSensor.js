import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import LocalDatabase from "../storage/LocalDatabase";

const GPS_INTERVAL_MS    = 5 * 60 * 1000;   // 5 minutes
const GPS_DISTANCE_M     = 50;               // min distance to trigger update
const MAX_STORED_ENTRIES = 2000;

class GpsSensor {
  constructor() {
    this.watchId      = null;
    this.isRunning    = false;
    this.lastLocation = null;
  }

  async requestPermission() {
    if (Platform.OS !== "android") return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title:   "Location Permission",
        message: "This app needs location access for depression risk monitoring.",
        buttonPositive: "Allow",
        buttonNegative: "Deny",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  async start() {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn("[GpsSensor] Location permission denied");
      return false;
    }

    if (this.isRunning) return true;

    this.watchId = Geolocation.watchPosition(
      (position) => this._onLocation(position),
      (error)    => this._onError(error),
      {
        enableHighAccuracy: true,
        distanceFilter:     GPS_DISTANCE_M,
        interval:           GPS_INTERVAL_MS,
        fastestInterval:    GPS_INTERVAL_MS / 2,
      }
    );

    this.isRunning = true;
    console.log("[GpsSensor] Started watching position");
    return true;
  }

  stop() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId   = null;
      this.isRunning = false;
      console.log("[GpsSensor] Stopped");
    }
  }

  async _onLocation(position) {
    const { latitude, longitude, accuracy, altitude } = position.coords;
    const timestamp = position.timestamp;

    // Skip low-accuracy readings
    if (accuracy > 100) return;

    const entry = {
      type:      "gps",
      latitude,
      longitude,
      accuracy,
      altitude:  altitude || 0,
      timestamp: new Date(timestamp).toISOString(),
    };

    this.lastLocation = entry;
    await LocalDatabase.insert("sensor_readings", entry);
    await this._pruneOldEntries();
  }

  _onError(error) {
    console.warn("[GpsSensor] Error:", error.message);
  }

  async _pruneOldEntries() {
    const count = await LocalDatabase.count("sensor_readings", { type: "gps" });
    if (count > MAX_STORED_ENTRIES) {
      await LocalDatabase.deleteOldest("sensor_readings", { type: "gps" }, 200);
    }
  }

  getLastLocation() {
    return this.lastLocation;
  }

  async getRecentReadings(hours = 24) {
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    return LocalDatabase.query(
      "sensor_readings",
      { type: "gps" },
      { since }
    );
  }
}

export default new GpsSensor();