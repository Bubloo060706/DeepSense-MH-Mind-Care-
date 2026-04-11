# MindCare Web Dashboard - API Integration Guide

## Overview

This guide is specifically for web dashboard developers integrating with the MindCare Backend API. It covers dashboard-specific concerns like real-time updates, data visualization, and responsive design patterns.

---

## Quick Start

### 1. Setup API Client

**JavaScript (Fetch API)**
```javascript
class MindCareAPI {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }

  // Model info
  async getModelInfo() {
    return this.request('/api/model/info');
  }

  // Risk scores
  async getUserScores(userId, limit = 30) {
    return this.request(`/api/scores/${userId}?limit=${limit}`);
  }

  async getLatestScore(userId) {
    return this.request(`/api/scores/${userId}/latest`);
  }

  // PHQ-9
  async getPHQHistory(userId, limit = 20) {
    return this.request(`/api/phq/${userId}?limit=${limit}`);
  }

  // Alerts
  async getAlerts(userId, unreadOnly = false) {
    const filter = unreadOnly ? '&unread=true' : '';
    return this.request(`/api/alerts/${userId}?limit=50${filter}`);
  }

  async markAlertRead(alertId) {
    return this.request(`/api/alerts/${alertId}/read`, { method: 'PATCH' });
  }

  async markAllAlertsRead(userId) {
    return this.request(`/api/alerts/${userId}/read-all`, { method: 'PATCH' });
  }

  // Trends
  async getTrends(userId, days = 30) {
    return this.request(`/api/trends/${userId}?days=${days}`);
  }

  async getTrendsSummary(userId) {
    return this.request(`/api/trends/${userId}/summary`);
  }
}

// Usage
const api = new MindCareAPI('http://localhost:5000');
```

### 2. Check Backend Status

```javascript
// On app load, verify backend is running
async function initializeDashboard() {
  try {
    const health = await api.getHealth();
    console.log('Backend connected:', health);
    
    const modelInfo = await api.getModelInfo();
    console.log('ML Model loaded:', modelInfo);
  } catch (error) {
    console.error('Backend connection failed:', error);
    showOfflineMessage();
  }
}
```

---

## Dashboard Components

### 1. Risk Score Card

Displays the latest risk score with visual indicators.

```javascript
async function loadRiskScoreCard(userId) {
  try {
    const score = await api.getLatestScore(userId);
    
    const riskColor = {
      'low': '#4CAF50',      // Green
      'moderate': '#FF9800',  // Orange
      'high': '#F44336'       // Red
    };
    
    document.getElementById('risk-card').innerHTML = `
      <div style="background-color: ${riskColor[score.risk_level]}; padding: 20px; border-radius: 8px;">
        <h3>Current Risk Level</h3>
        <p style="font-size: 32px; font-weight: bold;">${(score.score * 100).toFixed(1)}%</p>
        <p>${score.risk_level.toUpperCase()}</p>
        <p style="font-size: 12px; color: #666;">${score.recorded_at}</p>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load risk score:', error);
  }
}
```

### 2. Score Trend Chart

Display historical scores with trend visualization.

```javascript
async function loadScoreTrendChart(userId) {
  try {
    const trends = await api.getTrends(userId, 30);
    
    // Data for chart library (Chart.js, Recharts, etc.)
    const chartData = {
      labels: trends.daily_averages.map(d => d.day),
      datasets: [{
        label: 'Daily Average Risk Score',
        data: trends.daily_averages.map(d => d.avg_score * 100),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.3,
        fill: true
      }]
    };
    
    // Render with Chart.js, Recharts, or your preferred library
    renderChart('trendChart', chartData);
  } catch (error) {
    console.error('Failed to load trend chart:', error);
  }
}
```

### 3. Risk Distribution

Show breakdown of risk levels over time period.

```javascript
async function loadRiskDistribution(userId) {
  try {
    const trends = await api.getTrends(userId, 30);
    const dist = trends.risk_level_distribution;
    
    const pieData = {
      labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
      datasets: [{
        data: [dist.low, dist.moderate, dist.high],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
      }]
    };
    
    renderChart('riskDistribution', pieData);
  } catch (error) {
    console.error('Failed to load risk distribution:', error);
  }
}
```

### 4. Alerts Panel

Display real-time alerts with dismissal.

```javascript
async function loadAlertsPanel(userId) {
  try {
    const alerts = await api.getAlerts(userId, false); // All alerts
    
    const alertsHtml = alerts.map(alert => `
      <div class="alert-item alert-${alert.severity}" data-alert-id="${alert.id}">
        <div class="alert-header">
          <span class="alert-type">${alert.alert_type}</span>
          <span class="alert-time">${formatTime(alert.created_at)}</span>
        </div>
        <div class="alert-message">${alert.message}</div>
        <button onclick="markAsRead('${alert.id}')" class="btn-small">
          Mark as Read
        </button>
      </div>
    `).join('');
    
    document.getElementById('alerts-panel').innerHTML = alertsHtml || '<p>No alerts</p>';
  } catch (error) {
    console.error('Failed to load alerts:', error);
  }
}

async function markAsRead(alertId) {
  try {
    await api.markAlertRead(alertId);
    // Remove from UI
    document.querySelector(`[data-alert-id="${alertId}"]`).remove();
  } catch (error) {
    console.error('Failed to mark alert as read:', error);
  }
}
```

### 5. PHQ-9 History Table

Display assessment history with trends.

```javascript
async function loadPHQHistory(userId) {
  try {
    const phqHistory = await api.getPHQHistory(userId, 12);
    
    const tableHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Score</th>
            <th>Severity</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          ${phqHistory.map((entry, idx) => {
            const severity = getPHQSeverity(entry.score);
            const trend = idx > 0 ? 
              (entry.score > phqHistory[idx-1].score ? '↑' : 
               entry.score < phqHistory[idx-1].score ? '↓' : '→') : 
              '—';
            
            return `
              <tr>
                <td>${new Date(entry.submitted_at).toLocaleDateString()}</td>
                <td>${entry.score}</td>
                <td><span class="badge badge-${severity}">${severity}</span></td>
                <td>${trend}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('phq-history').innerHTML = tableHtml;
  } catch (error) {
    console.error('Failed to load PHQ history:', error);
  }
}

function getPHQSeverity(score) {
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  if (score <= 19) return 'moderately-severe';
  return 'severe';
}
```

---

## Real-Time Updates

### Polling Strategy

```javascript
class DashboardUpdater {
  constructor(userId, api, refreshIntervalMs = 300000) { // 5min default
    this.userId = userId;
    this.api = api;
    this.refreshInterval = refreshIntervalMs;
    this.intervalId = null;
  }

  start() {
    this.refresh(); // Initial load
    this.intervalId = setInterval(() => this.refresh(), this.refreshInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async refresh() {
    try {
      // Load all dashboard sections
      await Promise.all([
        loadRiskScoreCard(this.userId),
        loadAlertsPanel(this.userId),
        loadTrendsSummary(this.userId)
      ]);
      console.log('Dashboard updated:', new Date());
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    }
  }
}

// Usage
const updater = new DashboardUpdater('user-001', api);
updater.start();

// Stop on logout
document.getElementById('logout-btn').addEventListener('click', () => {
  updater.stop();
});
```

---

## Data Visualization Recommendations

### Chart Library Comparison

| Library | Best For | Complexity |
|---------|----------|-----------|
| Chart.js | Simple line/bar charts, lightweight | Low |
| Recharts | React dashboards, interactive | Medium |
| D3.js | Custom visualizations, advanced | High |
| ApexCharts | Modern dashboards, animations | Medium |
| Plotly.js | Scientific data, 3D charts | High |

### Recommended Setup (Recharts + React)

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function ScoreTrendChart({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTrendData(userId).then(setData);
  }, [userId]);

  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="day" />
      <YAxis domain={[0, 100]} />
      <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
      <Legend />
      <Line type="monotone" dataKey="avg_score" stroke="#2196F3" />
    </LineChart>
  );
}
```

---

## Error Handling UI

### Toast Notifications

```javascript
function showNotification(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Usage
try {
  await updateRiskScore();
  showNotification('Risk score updated', 'success');
} catch (error) {
  showNotification(`Error: ${error.message}`, 'error');
}
```

### Error Recovery

```javascript
async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
      console.log(`Retry ${i + 1} after ${waitTime}ms`);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
}

// Usage
const scores = await fetchWithRetry(() => api.getUserScores(userId));
```

---

## Performance Optimization

### Request Batching

```javascript
class RequestBatcher {
  constructor(flushIntervalMs = 1000) {
    this.queue = [];
    this.flushInterval = flushIntervalMs;
    this.timerId = null;
  }

  batch(request) {
    this.queue.push(request);
    
    if (!this.timerId) {
      this.timerId = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  async flush() {
    if (this.queue.length === 0) return;
    
    const requests = this.queue;
    this.queue = [];
    this.timerId = null;
    
    return Promise.all(requests);
  }
}
```

### Caching Strategy

```javascript
class APICache {
  constructor(ttlMs = 60000) { // 1 minute TTL
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const cache = new APICache(60000); // 1 minute cache

async function getCachedLatestScore(userId) {
  const cacheKey = `latest-score-${userId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Using cached score');
    return cached;
  }
  
  const score = await api.getLatestScore(userId);
  cache.set(cacheKey, score);
  return score;
}
```

---

## Responsive Design

### Mobile-First CSS

```css
/* Mobile */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.card {
  flex: 1;
  min-height: 200px;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .dashboard {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .card-full {
    grid-column: 1 / -1;
  }
}
```

---

## Authentication Setup (Future)

When implementing JWT authentication:

```javascript
class AuthenticatedAPI extends MindCareAPI {
  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    return super.request(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
}

// Usage
const api = new AuthenticatedAPI();
api.setToken(localStorage.getItem('auth_token'));
```

---

## Dashboard Layout Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MindCare Dashboard</title>
  <link rel="stylesheet" href="dashboard.css">
</head>
<body>
  <header>
    <h1>MindCare Dashboard</h1>
    <div id="status">Connecting...</div>
  </header>

  <main class="dashboard">
    <!-- Risk Score Card -->
    <div class="card card-risk">
      <h2>Current Risk</h2>
      <div id="risk-card">Loading...</div>
    </div>

    <!-- Alerts -->
    <div class="card card-alerts">
      <h2>Alerts</h2>
      <div id="alerts-panel">Loading...</div>
    </div>

    <!-- Trend Summary -->
    <div class="card card-summary">
      <h2>This Week</h2>
      <div id="trend-summary">Loading...</div>
    </div>

    <!-- Score Trend Chart -->
    <div class="card card-chart card-full">
      <h2>30-Day Trend</h2>
      <canvas id="trendChart"></canvas>
    </div>

    <!-- PHQ-9 History -->
    <div class="card card-phq card-full">
      <h2>PHQ-9 Assessment History</h2>
      <div id="phq-history">Loading...</div>
    </div>

    <!-- Risk Distribution -->
    <div class="card card-distribution">
      <h2>Risk Distribution</h2>
      <canvas id="riskDistribution"></canvas>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="api-client.js"></script>
  <script src="dashboard.js"></script>
</body>
</html>
```

---

## Query Parameter Reference

```javascript
// Score history with limit
GET /api/scores/{user_id}?limit=50

// Trends with custom period
GET /api/trends/{user_id}?days=90

// Alerts filtered by status
GET /api/alerts/{user_id}?limit=20&unread=true

// PHQ history with limit
GET /api/phq/{user_id}?limit=12

// Trends summary (no params)
GET /api/trends/{user_id}/summary
```

---

## Troubleshooting

### CORS Errors
```javascript
// Check if running on same domain/port
// For local development, ensure:
// - API: http://localhost:5000
// - Dashboard: http://localhost:5173 (or your dev port)

// Check backend logs for CORS configuration
```

### Authentication Issues
```javascript
// Check Authorization header format
headers: {
  'Authorization': 'Bearer token-value'  // Correct
  // NOT: 'Authorization': 'token-value' (missing Bearer)
}
```

### Slow Data Loading
```javascript
// Implement caching and pagination
// Use smaller date ranges
// Batch multiple requests
```

---

## Production Checklist

- [ ] HTTPS enabled
- [ ] CORS configured for correct domain
- [ ] Error boundaries implemented
- [ ] Loading states visible
- [ ] Offline mode handled
- [ ] Performance monitored
- [ ] Sensitive data not logged
- [ ] API responses validated
- [ ] Rate limiting considered
- [ ] Caching strategy in place

---

**Version**: 1.0.0  
**For Web Dashboard Developers**  
**Updated**: March 29, 2026
