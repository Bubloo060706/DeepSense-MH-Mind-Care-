# MindCare API - Quick Reference

## Base URL
```
http://localhost:5000
```

---

## Endpoints Summary

### Health & Status
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check backend status |
| GET | `/api/model/info` | Get ML model information |

### Risk Scores (ML Predictions)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/scores` | Predict risk from 18 features |
| GET | `/api/scores/:user_id` | Get score history |
| GET | `/api/scores/:user_id/latest` | Get most recent score |

### PHQ-9 Assessment
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/phq` | Submit PHQ-9 assessment (9 responses) |
| GET | `/api/phq/:user_id` | Get PHQ assessment history |

### Alerts
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/alerts/:user_id` | Get all alerts |
| PATCH | `/api/alerts/:alert_id/read` | Mark single alert read |
| PATCH | `/api/alerts/:user_id/read-all` | Mark all alerts read |

### Trends & Analytics
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/trends/:user_id` | Get historical trends (customizable days) |
| GET | `/api/trends/:user_id/summary` | Get week summary for dashboard |

---

## Feature Array (18 values, 0.0-1.0 normalized)

```javascript
const features = [
  0.5,  // [0] Movement/Steps (0-30k normalized)
  0.3,  // [1] Sleep Duration (0-24h normalized)
  6,    // [2] Sleep Quality %
  23,   // [3] Heart Rate (bpm)
  2,    // [4] Activity Level
  0.8,  // [5] Physical Activity
  0.9,  // [6] Location Entropy
  0.4,  // [7] Movement Patterns
  0.6,  // [8] Social Interaction
  10,   // [9] Screen Time (hours)
  2,    // [10] App Switching Frequency
  100,  // [11] Battery Drain %
  0.5,  // [12] WiFi Connectivity
  0.7,  // [13] Location Stability
  0.6,  // [14] Circadian Rhythm
  0.4,  // [15] Communication Frequency
  0.8,  // [16] Routine Consistency
  0.3   // [17] Environmental Stress
];
```

---

## PHQ-9 Responses (0-3 per question)

```javascript
const phq9Responses = [
  0,  // Q1: Little interest in activities (0: Never, 3: Nearly every day) 
  1,  // Q2: Feeling down/depressed
  2,  // Q3: Trouble sleeping
  1,  // Q4: Feeling tired/low energy
  0,  // Q5: Poor appetite/overeating
  2,  // Q6: Feeling bad about yourself
  1,  // Q7: Trouble concentrating
  0,  // Q8: Moving/speaking slow or agitated
  2   // Q9: Thoughts of self-harm
];
// Total Score: 10 (Moderate Depression)
```

---

## Response Models

### Risk Score Response
```json
{
  "id": "score-123",
  "user_id": "user-001",
  "score": 0.6543,
  "risk_level": "moderate",      // "low" | "moderate" | "high"
  "features": [...],              // 18-element array
  "recorded_at": "2026-03-29T21:56:00"
}
```

### Risk Level Chart
| Level | Score Range | Color | Action |
|-------|-------------|-------|--------|
| low | 0.0-0.3 | Green | Monitor |
| moderate | 0.3-0.7 | Orange | Check-in |
| high | 0.7-1.0 | Red | Clinical Review |

### Alert Response
```json
{
  "id": "alert-001",
  "user_id": "user-001",
  "alert_type": "high_risk",      // "high_risk" | "sustained_risk" | "phq_spike"
  "message": "Alert description",
  "severity": "critical",         // "critical" | "warning" | "info"
  "is_read": 0,                   // 0 = unread, 1 = read
  "created_at": "2026-03-29T20:15:00"
}
```

### PHQ Entry Response
```json
{
  "id": "phq-001",
  "user_id": "user-001",
  "score": 11,                    // 0-27 total score
  "responses": [1, 2, 1, 0, 2, 1, 0, 1, 2],  // 9 responses
  "submitted_at": "2026-03-29T22:00:00"
}
```

### Trends Response
```json
{
  "user_id": "user-001",
  "days_analyzed": 30,
  "overall_avg_score": 0.5234,
  "trend_direction": "stable",    // "improving" | "stable" | "worsening"
  "daily_averages": [
    { "day": "2026-03-01", "avg_score": 0.45, "reading_count": 3 }
  ],
  "risk_level_distribution": {
    "low": 15,
    "moderate": 10,
    "high": 2
  },
  "phq_history": [...]
}
```

---

## Error Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | GET request succeeded |
| 201 | Created | POST request created resource |
| 400 | Bad Request | Malformed JSON |
| 404 | Not Found | User/resource not found |
| 422 | Validation Error | Wrong data format |
| 500 | Server Error | Backend failure |

### Error Response Format
```json
{
  "error": "Error message describing the problem"
}
```

---

## Common Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| "user_id and features are required" | Missing POST fields | Include both fields |
| "Expected 18 features, got X" | Wrong feature array length | Provide exactly 18 values |
| "Each response must be 0, 1, 2, or 3" | Invalid PHQ response | Use only 0, 1, 2, or 3 |
| "PHQ-9 requires exactly 9 responses" | Wrong PHQ array length | Provide exactly 9 responses |
| "User not found" | User doesn't exist | Create user first |
| "Invalid JSON body" | Malformed request | Check JSON syntax |

---

## Code Examples

### JavaScript Fetch
```javascript
// Get latest score
const response = await fetch('http://localhost:5000/api/scores/user-001/latest');
const score = await response.json();
console.log(`Risk: ${(score.score * 100).toFixed(1)}%`);

// Predict risk with 18 features
const features = [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3];
const res = await fetch('http://localhost:5000/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 'user-001', features })
});
const result = await res.json();
```

### cURL
```bash
# Health check
curl -X GET http://localhost:5000/health

# Get latest score
curl -X GET http://localhost:5000/api/scores/user-001/latest

# Submit PHQ-9
curl -X POST http://localhost:5000/api/phq \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-001","responses":[1,2,1,0,2,1,0,1,2]}'

# Predict risk
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-001","features":[0.5,0.3,6,23,2,0.8,0.9,0.4,0.6,10,2,100,0.5,0.7,0.6,0.4,0.8,0.3]}'
```

### Python Requests
```python
import requests

BASE_URL = 'http://localhost:5000'

# Get latest score
response = requests.get(f'{BASE_URL}/api/scores/user-001/latest')
score = response.json()
print(f"Risk: {score['score']:.2%}")

# Predict risk
features = [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
response = requests.post(f'{BASE_URL}/api/scores', json={
    'user_id': 'user-001',
    'features': features
})
result = response.json()
print(result['risk_level'])
```

---

## PHQ-9 Score Interpretation

| Score | Category | Severity | Recommendation |
|-------|----------|----------|-----------------|
| 0-4 | None-minimal | Minimal | No intervention |
| 5-9 | Mild | Mild | Self-help resources |
| 10-14 | Moderate | Moderate | Therapy or medication |
| 15-19 | Moderate-severe | Moderately Severe | Medication + therapy |
| 20-27 | Severe | Severe | Urgent evaluation |

---

## Query Parameters

```bash
# Scores history with limit
GET /api/scores/user-001?limit=50

# Trends for custom period
GET /api/trends/user-001?days=90

# Alerts with filters
GET /api/alerts/user-001?limit=20&unread=true

# PHQ history with limit
GET /api/phq/user-001?limit=12
```

---

## Best Practices

✅ **DO:**
- Validate feature array has exactly 18 values
- Validate PHQ responses are 0-3
- Handle offline scenarios with local cache
- Implement retry logic with exponential backoff
- Use HTTPS in production
- Store tokens securely
- Log errors with context
- Set request timeouts (30s recommended)

❌ **DON'T:**
- Store auth tokens in localStorage (use secure storage)
- Expose API credentials in frontend code
- Make synchronous API calls
- Ignore error responses
- Store sensitive data unencrypted
- Use excessive polling (batch requests instead)
- Trust client-side data validation alone

---

## Quick Troubleshooting

**Q: "Cannot reach API"**
- Check backend is running (`python run.py`)
- Verify correct URL and port (default: `localhost:5000`)
- Check firewall/network

**Q: "22 features required, got 18"**
- Old version of API - update API_DOCUMENTATION.md shows 18
- OR: You're sending wrong data - verify your feature array

**Q: CORS error in browser**
- Backend must be on same origin or CORS enabled
- Check `Access-Control-Allow-Origin` headers

**Q: "Prediction failed"**
- Features likely out of valid range
- Check all values are 0.0-1.0 (normalized)
- Verify array has exactly 18 values

**Q: Returns empty array but data exists**
- May be database/persistence issue
- Refresh page or restart backend
- Check user_id matches exactly

---

## Support

Full documentation available:
- `API_DOCUMENTATION.md` - Complete API reference
- `WEB_DASHBOARD_GUIDE.md` - Web-specific integration
- `MOBILE_APP_GUIDE.md` - Mobile-specific best practices
- `api_tester.html` - Interactive API testing interface

---

**Version**: 1.0.0  
**Updated**: March 29, 2026  
**Backend Status**: ✅ Running  
**ML Model**: ✅ Loaded
