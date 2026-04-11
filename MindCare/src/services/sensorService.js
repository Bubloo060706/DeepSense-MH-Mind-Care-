// ─────────────────────────────────────────────
//  Sensor Service (Demo - All data is mocked)
// ─────────────────────────────────────────────

import { generateMockSensorData } from '../utils/helpers';
import ENV from '../config/env';

class SensorService {
  constructor() {
    this.listeners = [];
    this.isActive = false;
    this.mockInterval = null;
  }

  /**
   * Initialize sensor tracking (mock)
   */
  async initialize() {
    if (!ENV.DEMO_MODE) {
      console.log('Real sensor integration would happen here');
      return false;
    }
    console.log('Sensor Service initialized in DEMO mode');
    return true;
  }

  /**
   * Start monitoring sensors
   */
  startMonitoring(interval = 5000) {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Simulate sensor data updates
    this.mockInterval = setInterval(() => {
      const data = generateMockSensorData();
      this.notifyListeners(data);
    }, interval);
  }

  /**
   * Stop monitoring sensors
   */
  stopMonitoring() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    this.isActive = false;
  }

  /**
   * Subscribe to sensor updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Notify all listeners of new data
   */
  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Sensor callback error:', error);
      }
    });
  }

  /**
   * Get current sensor reading (mock)
   */
  async getCurrentReading() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockSensorData());
      }, 300);
    });
  }

  /**
   * Get heart rate data
   */
  async getHeartRateData(hours = 24) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [];
        const now = Date.now();
        for (let i = 0; i < hours; i++) {
          data.push({
            timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
            value: Math.floor(Math.random() * 30 + 60),
          });
        }
        resolve(data.reverse());
      }, 500);
    });
  }

  /**
   * Get activity data
   */
  async getActivityData(days = 7) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [];
        const now = Date.now();
        for (let i = 0; i < days; i++) {
          data.push({
            date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
            steps: Math.floor(Math.random() * 8000 + 3000),
            calories: Math.floor(Math.random() * 2000 + 1500),
          });
        }
        resolve(data.reverse());
      }, 600);
    });
  }

  /**
   * Get sleep data
   */
  async getSleepData(days = 7) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [];
        const now = Date.now();
        for (let i = 0; i < days; i++) {
          data.push({
            date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
            hours: (Math.random() * 3 + 5).toFixed(1),
            quality: Math.floor(Math.random() * 40 + 60),
          });
        }
        resolve(data.reverse());
      }, 600);
    });
  }

  /**
   * Get stress level (demo)
   */
  async getStressLevel() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          level: Math.floor(Math.random() * 100),
          trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
          timestamp: new Date().toISOString(),
        });
      }, 300);
    });
  }

  /**
   * Request permission (mock)
   */
  async requestPermission(type) {
    return new Promise((resolve) => {
      console.log(`Permission requested for: ${type}`);
      resolve(true);
    });
  }

  /**
   * Check if sensor is available
   */
  isAvailable(type) {
    return ENV.DEMO_MODE; // Always available in demo
  }
}

export default new SensorService();
