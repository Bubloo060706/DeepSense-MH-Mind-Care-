# MindCare Mobile App - API Integration Guide

## Overview

This guide covers API integration for mobile applications (iOS, Android, React Native) consuming MindCare Backend services. It addresses mobile-specific concerns like offline functionality, data persistence, battery optimization, and network reliability.

---

## Quick Start

### iOS (Swift)

```swift
import Foundation

class MindCareAPIClient {
    let baseURL = "http://api.mindcare.local:5000"
    
    func request<T: Decodable>(
        method: String,
        endpoint: String,
        body: Encodable? = nil,
        responseType: T.Type
    ) async throws -> T {
        var urlComponents = URLComponents(string: baseURL + endpoint)!
        var request = URLRequest(url: urlComponents.url!)
        
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard 200...299 ~= httpResponse.statusCode else {
            let error = try JSONDecoder().decode(ErrorResponse.self, from: data)
            throw APIError.serverError(error.error)
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    // Convenience methods
    func getHealth() async throws -> HealthResponse {
        try await request(method: "GET", endpoint: "/health", responseType: HealthResponse.self)
    }
    
    func getLatestScore(userId: String) async throws -> RiskScore {
        try await request(method: "GET", endpoint: "/api/scores/\(userId)/latest", 
                         responseType: RiskScore.self)
    }
    
    func getAlerts(userId: String) async throws -> [Alert] {
        try await request(method: "GET", endpoint: "/api/alerts/\(userId)?limit=50", 
                         responseType: [Alert].self)
    }
}

enum APIError: Error {
    case invalidResponse
    case serverError(String)
    case decodingError(Error)
    case networkError(Error)
}

struct ErrorResponse: Codable {
    let error: String
}
```

### Android (Kotlin)

```kotlin
import retrofit2.http.*
import kotlinx.coroutines.Dispatchers
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

interface MindCareAPI {
    @GET("/health")
    suspend fun getHealth(): HealthResponse
    
    @GET("/api/model/info")
    suspend fun getModelInfo(): ModelInfo
    
    @GET("/api/scores/{userId}/latest")
    suspend fun getLatestScore(@Path("userId") userId: String): RiskScore
    
    @POST("/api/scores")
    suspend fun predictRisk(@Body request: RiskPredictionRequest): RiskScore
    
    @GET("/api/alerts/{userId}")
    suspend fun getAlerts(@Path("userId") userId: String): List<Alert>
    
    @PATCH("/api/alerts/{alertId}/read")
    suspend fun markAlertRead(@Path("alertId") alertId: String): SuccessResponse
    
    @GET("/api/trends/{userId}/summary")
    suspend fun getTrendsSummary(@Path("userId") userId: String): TrendsSummary
}

object RetrofitClient {
    private const val BASE_URL = "http://api.mindcare.local:5000/"
    
    val apiService: MindCareAPI by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(MindCareAPI::class.java)
    }
}

// Usage
class MainActivity : AppCompatActivity() {
    private val api = RetrofitClient.apiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            try {
                val score = api.getLatestScore("user-001")
                updateUI(score)
            } catch (e: Exception) {
                showError(e.message)
            }
        }
    }
}

data class RiskScore(
    val id: String,
    val user_id: String,
    val score: Float,
    val risk_level: String, // "low", "moderate", "high"
    val recorded_at: String
)

data class RiskPredictionRequest(
    val user_id: String,
    val features: List<Float>
)

data class SuccessResponse(
    val success: Boolean
)
```

### React Native / Expo

```javascript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.1.100:5000'; // Use your network IP in dev

class MindCareAPIClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Axios interceptor for token injection
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getHealth() {
    return this.client.get('/health');
  }

  async getLatestScore(userId) {
    return this.client.get(`/api/scores/${userId}/latest`);
  }

  async predictRisk(userId, features) {
    return this.client.post('/api/scores', {
      user_id: userId,
      features,
    });
  }

  async getAlerts(userId) {
    return this.client.get(`/api/alerts/${userId}`);
  }

  async getTrendsSummary(userId) {
    return this.client.get(`/api/trends/${userId}/summary`);
  }

  async markAlertRead(alertId) {
    return this.client.patch(`/api/alerts/${alertId}/read`);
  }
}

export const api = new MindCareAPIClient();

// Usage in component
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export function RiskScoreScreen({ userId }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScore();
  }, [userId]);

  const loadScore = async () => {
    try {
      setLoading(true);
      const response = await api.getLatestScore(userId);
      setScore(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  
  return (
    <View>
      <Text style={{ fontSize: 24 }}>Risk: {(score.score * 100).toFixed(1)}%</Text>
      <Text>{score.risk_level.toUpperCase()}</Text>
    </View>
  );
}
```

---

## Data Models

### TypeScript Interfaces

```typescript
// Core Models
interface RiskScore {
  id: string;
  user_id: string;
  score: number;        // 0.0 - 1.0
  risk_level: "low" | "moderate" | "high";
  features: number[];   // 18 feature array
  recorded_at: string;  // ISO 8601
}

interface RiskPredictionRequest {
  user_id: string;
  features: number[];   // Exactly 18 values
}

interface PHQEntry {
  id: string;
  user_id: string;
  score: number;        // 0-27
  responses: number[];  // 9 values, 0-3 each
  submitted_at: string;
}

interface Alert {
  id: string;
  user_id: string;
  alert_type: "high_risk" | "sustained_risk" | "phq_spike";
  message: string;
  severity: "critical" | "warning" | "info";
  is_read: 0 | 1;      // 0 = unread, 1 = read
  created_at: string;
}

interface TrendsSummary {
  user_id: string;
  week_avg_score: number;
  trend_direction: "improving" | "stable" | "worsening";
  latest_score: RiskScore;
  risk_distribution_7d: {
    low: number;
    moderate: number;
    high: number;
  };
}

interface HealthResponse {
  status: "ok";
  service: string;
}

interface ModelInfo {
  model_path: string;
  model_type: string;
  input_shape: string;
  output_shape: string;
  trainable_params: number;
}
```

---

## Offline Functionality

### Local Data Persistence

#### SQLite (React Native with Expo)

```javascript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mindcare.db');

class LocalDatabase {
  init() {
    db.transaction(tx => {
      // Create tables
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS risk_scores (id TEXT PRIMARY KEY, user_id TEXT, score REAL, risk_level TEXT, recorded_at TEXT, synced INTEGER DEFAULT 0);'
      );
      
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, user_id TEXT, alert_type TEXT, message TEXT, is_read INTEGER, created_at TEXT, synced INTEGER DEFAULT 0);'
      );
      
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS pending_requests (id TEXT PRIMARY KEY, endpoint TEXT, method TEXT, body TEXT, created_at TEXT);'
      );
    });
  }

  // Save risk score locally
  saveRiskScore(score) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO risk_scores (id, user_id, score, risk_level, recorded_at, synced) VALUES (?, ?, ?, ?, ?, ?)',
          [score.id, score.user_id, score.score, score.risk_level, score.recorded_at, 1],
          () => resolve(),
          (_, err) => reject(err)
        );
      });
    });
  }

  // Get all local scores
  getLocalScores(userId) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM risk_scores WHERE user_id = ? ORDER BY recorded_at DESC',
          [userId],
          (_, result) => resolve(result.rows._array),
          (_, err) => reject(err)
        );
      });
    });
  }

  // Queue pending request for later sync
  queueRequest(endpoint, method, body) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO pending_requests (id, endpoint, method, body, created_at) VALUES (?, ?, ?, ?, ?)',
          [
            Math.random().toString(36).slice(2),
            endpoint,
            method,
            JSON.stringify(body),
            new Date().toISOString()
          ],
          () => resolve(),
          (_, err) => reject(err)
        );
      });
    });
  }

  // Get all pending requests
  getPendingRequests() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM pending_requests ORDER BY created_at ASC',
          [],
          (_, result) => resolve(result.rows._array),
          (_, err) => reject(err)
        );
      });
    });
  }

  // Mark request as synced and remove
  removePendingRequest(id) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM pending_requests WHERE id = ?',
          [id],
          () => resolve(),
          (_, err) => reject(err)
        );
      });
    });
  }
}

export const localDb = new LocalDatabase();
localDb.init();
```

### Offline-Aware API Client

```javascript
import NetInfo from '@react-native-community/netinfo';

class OfflineAwareAPIClient {
  constructor() {
    this.isOnline = true;
    this.setupNetworkListener();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      console.log('Network status:', this.isOnline ? 'ONLINE' : 'OFFLINE');
      
      if (this.isOnline) {
        this.syncPendingRequests();
      }
    });
  }

  async predictRisk(userId, features) {
    const request = {
      user_id: userId,
      features
    };

    if (!this.isOnline) {
      // Queue locally
      await localDb.queueRequest('/api/scores', 'POST', request);
      
      // Optimistic response from ML model (local inference if available)
      return {
        id: 'pending-' + Date.now(),
        ...request,
        score: this.getOptimisticScore(features),
        risk_level: this.calculateRiskLevel(this.getOptimisticScore(features)),
        recorded_at: new Date().toISOString(),
        pending: true
      };
    }

    // Normal online flow
    try {
      const response = await api.predictRisk(userId, features);
      await localDb.saveRiskScore(response.data);
      return response.data;
    } catch (error) {
      // Fallback to local on error
      await localDb.queueRequest('/api/scores', 'POST', request);
      return { ...request, pending: true, error: error.message };
    }
  }

  async syncPendingRequests() {
    console.log('Starting sync of pending requests...');
    const pending = await localDb.getPendingRequests();
    
    for (const req of pending) {
      try {
        const body = JSON.parse(req.body);
        
        if (req.method === 'POST' && req.endpoint === '/api/scores') {
          await api.predictRisk(body.user_id, body.features);
        }
        
        await localDb.removePendingRequest(req.id);
        console.log(`Synced: ${req.endpoint}`);
      } catch (error) {
        console.error(`Failed to sync request: ${req.id}`, error);
      }
    }
  }

  getOptimisticScore(features) {
    // Simple local estimation before server response
    // Replace with actual local ML model if available
    return features.reduce((a, b) => a + b, 0) / features.length;
  }

  calculateRiskLevel(score) {
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'moderate';
    return 'high';
  }
}
```

---

## Feature Array Collection (Mobile)

### Health Data Integration

```javascript
// Collect features from device sensors
class HealthDataCollector {
  async collectFeatures(userId) {
    // This example uses react-native-health or similar library
    const [steps, sleep, heart] = await Promise.all([
      this.getStepCount(),
      this.getSleepDuration(),
      this.getHeartRateVariability()
    ]);

    // Normalize values to 0-1 range
    const features = [
      this.normalize(steps, 0, 30000),           // Step count (0-30k)
      this.normalize(sleep.duration, 0, 24),    // Sleep hours (0-24)
      this.normalize(sleep.quality, 0, 100),    // Sleep quality %
      // ... collect remaining 15 features from various sensors
      // Including: screen time, location entropy, movement patterns,
      // social interactions, app usage, etc.
    ];

    return { user_id: userId, features };
  }

  async getStepCount() {
    // Implementation depends on library
    // react-native-pedometer, expo-motion, Apple HealthKit, Google Fit
  }

  async getSleepDuration() {
    // Get from health data sources
  }

  async getHeartRateVariability() {
    // Requires health kit access
  }

  normalize(value, min, max) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }
}

// Usage
const healthCollector = new HealthDataCollector();

// Daily collection job
async function collectDailyFeatures(userId) {
  try {
    const data = await healthCollector.collectFeatures(userId);
    const score = await offlineAwareAPI.predictRisk(userId, data.features);
    
    showNotification(`Risk Updated: ${score.risk_level}`, score.risk_level);
  } catch (error) {
    console.error('Feature collection failed:', error);
  }
}
```

---

## Battery & Network Optimization

### Request Batching

```javascript
class BatchedRequestQueue {
  constructor(flushInterval = 60000) { // 1 minute
    this.queue = [];
    this.flushInterval = flushInterval;
    this.resetTimer();
  }

  add(request) {
    this.queue.push(request);
    
    // Flush if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.flushInterval);
  }

  async flush() {
    if (this.queue.length === 0) return;
    
    const requests = this.queue;
    this.queue = [];
    
    console.log(`Flushing ${requests.length} requests`);
    // Send all at once
    await Promise.allSettled(requests);
  }
}
```

### Background Sync

```javascript
// React Native with react-native-background-task
import BackgroundTask from 'react-native-background-task';

BackgroundTask.define(async () => {
  try {
    // Sync pending requests
    await offlineAwareAPI.syncPendingRequests();
    
    // Collect fresh health data
    const { user_id, features } = await healthCollector.collectFeatures('user-001');
    
    // Send prediction
    await api.predictRisk(user_id, features);
    
    BackgroundTask.finish();
  } catch (error) {
    console.error('Background task failed:', error);
    BackgroundTask.finish();
  }
});

// Register task
BackgroundTask.schedule({
  period: 900  // Every 15 minutes (900 seconds)
});
```

---

## Push Notifications

### Alert Notification Handling

```javascript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { alert_type, severity } = notification.request.content.data;
    
    // High severity alerts should interrupt even in silent mode
    return {
      shouldShowAlert: severity === 'critical',
      shouldPlaySound: severity === 'critical',
      shouldSetBadge: true,
    };
  },
});

async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === 'granted') {
    console.log('Notifications enabled');
  }
}

// Listen for received notifications
Notifications.addNotificationReceivedListener(notification => {
  console.log('Alert received:', notification.request.content.data);
});

// Listen for taps
Notifications.addNotificationResponseReceivedListener(response => {
  const alertId = response.notification.request.content.data.alert_id;
  
  // Navigate to alert detail and mark as read
  markAlertRead(alertId);
  navigateToAlertDetail(alertId);
});
```

---

## Performance Monitoring

### Crash Reporting & Analytics

```javascript
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project",
  tracesSampleRate: 1.0,
  enableInExpoDevelopment: true,
});

// Automatic error capture
try {
  const score = await api.getLatestScore(userId);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      userId,
      endpoint: '/api/scores/latest'
    }
  });
}

// Track performance
async function trackAPICall(name, fn) {
  const transaction = Sentry.startTransaction({
    name,
    op: "http.client"
  });

  try {
    const result = await fn();
    transaction.finish();
    return result;
  } catch (error) {
    transaction.status = "internal_error";
    transaction.finish();
    throw error;
  }
}

// Usage
const score = await trackAPICall('getLatestScore', 
  () => api.getLatestScore(userId)
);
```

---

## Push Notification Setup (Backend Integration)

### Receiving Alerts on Mobile

```javascript
// After receiving alert notification (from backend push service)
async function handleAlertNotification(alert) {
  // Save to local database
  await localDb.saveAlert(alert);
  
  // Show local notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "MindCare Alert",
      body: alert.message,
      data: {
        alert_id: alert.id,
        alert_type: alert.alert_type,
        severity: alert.severity
      },
      sound: alert.severity === 'critical' ? 'default' : null,
    },
    trigger: { seconds: 1 }
  });
}
```

---

## Error Handling Best Practices

```javascript
class ErrorHandler {
  static handle(error, context) {
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    if (error.response?.status === 422) {
      return `Validation error: ${error.response.data.error}`;
    }
    if (error.response?.status === 500) {
      return 'Server error - please try again later';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout - check your connection';
    }
    if (error.message === 'Network Error') {
      return 'No internet connection';
    }
    
    // Unknown error - log for debugging
    Sentry.captureException(error, { contexts: { context } });
    return 'An unexpected error occurred';
  }
}

// Usage
try {
  const score = await api.getLatestScore(userId);
} catch (error) {
  const errorMsg = ErrorHandler.handle(error, { action: 'getLatestScore', userId });
  showNotification(errorMsg, 'error');
}
```

---

## Testing APIs

### Mock Data for Development

```javascript
// Mock API for development without backend
class MockAPIClient {
  async getLatestScore(userId) {
    return {
      id: 'mock-score-1',
      user_id: userId,
      score: 0.654,
      risk_level: 'moderate',
      recorded_at: new Date().toISOString()
    };
  }

  async getAlerts(userId) {
    return [
      {
        id: 'mock-alert-1',
        user_id: userId,
        alert_type: 'sustained_risk',
        message: 'Risk remained elevated over past week',
        severity: 'warning',
        is_read: 0,
        created_at: new Date().toISOString()
      }
    ];
  }

  async getTrendsSummary(userId) {
    return {
      user_id: userId,
      week_avg_score: 0.589,
      trend_direction: 'stable',
      risk_distribution_7d: { low: 2, moderate: 4, high: 1 }
    };
  }
}

// Use in development
const api = process.env.NODE_ENV === 'development' 
  ? new MockAPIClient() 
  : new MindCareAPIClient();
```

---

## App Lifecycle Integration

### Handle App States

```javascript
import { AppState } from 'react-native';

class AppLifecycleManager {
  constructor(api) {
    this.api = api;
    this.appState = AppState.currentState;
    
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (state) => {
    if (state === 'background') {
      this.onAppBackground();
    } else if (state === 'active') {
      this.onAppActive();
    }
  }

  async onAppActive() {
    // Sync pending requests
    await this.api.syncPendingRequests();
    
    // Refresh dashboard data
    this.refreshDashboard();
  }

  onAppBackground() {
    // Clean up listeners
    // Stop background tasks
  }

  cleanup() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
}
```

---

## Security Considerations

### Secure Storage

```javascript
import * as SecureStore from 'expo-secure-store';

class SecureTokenManager {
  async saveToken(token) {
    await SecureStore.setItemAsync('auth_token', token);
  }

  async getToken() {
    return SecureStore.getItemAsync('auth_token');
  }

  async clearToken() {
    await SecureStore.deleteItemAsync('auth_token');
  }
}

// Never store sensitive data in:
// - AsyncStorage (unencrypted)
// - Shared preferences (unencrypted)
// - App cache
```

### Certificate Pinning

```javascript
// For production: implement certificate pinning
// Example with react-native-ssl-certificate-fingerprint

export async function setupCertificatePinning() {
  // Verify server certificate matches known fingerprint
  // Prevents man-in-the-middle attacks
}
```

---

## Production Checklist

- [ ] API base URL configurable per environment
- [ ] Error handling comprehensive with user messages
- [ ] Offline functionality tested thoroughly
- [ ] Push notifications tested on real devices
- [ ] Secure token storage implemented
- [ ] Certificate pinning enabled
- [ ] Crash reporting configured
- [ ] Analytics instrumented
- [ ] Battery optimization (background tasks, batching)
- [ ] Network optimization (compression, caching)
- [ ] Data persistence (SQLite) operational
- [ ] Sync mechanism tested with various network conditions
- [ ] Performance acceptable on low-end devices
- [ ] Memory usage monitored
- [ ] Device permissions requested properly

---

## Troubleshooting

### Common Issues

**Q: API calls fail on Android but work on iOS**
- Check network security configuration (Android 9+)
- Ensure cleartext traffic allowed for dev server
- Verify firewall/network permissions

**Q: High battery drain**
- Reduce background task frequency
- Batch requests instead of individual calls
- Disable unnecessary sensors
- Implement smart syncing

**Q: Offline features not working**
- Verify local database initialization
- Check network status listener setup
- Ensure pending request queue implementation

**Q: Push notifications not received**
- Verify permissions granted
- Check push service configuration
- Test on physical device (emulators may not work)
- Verify FCM/APNs setup

---

**Version**: 1.0.0  
**For Mobile App Developers**  
**Updated**: March 29, 2026
