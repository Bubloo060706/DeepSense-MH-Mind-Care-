# MindCare Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Health & Status](#health--status)
5. [User Management](#user-management)
6. [Risk Score Prediction](#risk-score-prediction)
7. [PHQ-9 Assessment](#phq-9-assessment)
8. [Alerts](#alerts)
9. [Trends & Analytics](#trends--analytics)
10. [Response Formats](#response-formats)
11. [Error Handling](#error-handling)

---

## Overview

MindCare Backend provides REST APIs for mental health monitoring and depression risk assessment. The backend features:

- **ML-powered Risk Prediction**: Uses hybrid CNN-LSTM model for accurate risk scoring
- **PHQ-9 Assessment**: Standard depression assessment questionnaire
- **Real-time Alerts**: Automatic alerts for high-risk conditions
- **Trend Analysis**: Historical trend tracking and analytics
- **Cross-platform Support**: Works with both mobile apps and web dashboards

**Version**: 1.0.0  
**Last Updated**: March 29, 2026

---

## Base URL

```
http://api.mindcare.local:5000
```

**For Development:**
```
http://localhost:5000
```

All API requests should be made to this base URL followed by the endpoint path.

---

## Authentication

Currently, the API uses **user_id** based identification. In production, implement:
- JWT tokens
- API keys
- OAuth 2.0

**Future Implementation:**
```
Authorization: Bearer <jwt_token>
```

---

## Health & Status

### GET /health

Check if backend service is online and operational.

**Method:** `GET`  
**Path:** `/health`  
**Auth:** None

#### Request
```bash
curl -X GET http://localhost:5000/health
```

#### Response (200 OK)
```json
{
  "status": "ok",
  "service": "DeepSense-MH Backend"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Service is operational |

---

### GET /api/model/info

Get information about the ML model used for risk prediction.

**Method:** `GET`  
**Path:** `/api/model/info`  
**Auth:** None

#### Request
```bash
curl -X GET http://localhost:5000/api/model/info
```

#### Response (200 OK)
```json
{
  "model_path": "D:\\MindCare\\backend\\ml_training\\hybrid_cnn_lstm_model.keras",
  "model_type": "Functional",
  "input_shape": "(None, 18, 1)",
  "output_shape": "(None, 1)",
  "trainable_params": 146945
}
```

#### Fields
| Field | Type | Description |
|-------|------|-------------|
| model_path | string | Path to model file |
| model_type | string | Model architecture type |
| input_shape | string | Expected input dimensions |
| output_shape | string | Output dimensions |
| trainable_params | integer | Number of trainable parameters |

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Model info retrieved successfully |
| 500 | Model loading failed |

---

## Risk Score Prediction

### POST /api/scores

Predict mental health risk score using the ML model.

**Method:** `POST`  
**Path:** `/api/scores`  
**Auth:** None (user_id based)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "user_id": "user-12345",
  "features": [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
}
```

#### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | Yes | Unique user identifier |
| features | array[float] | Yes | Exactly 18 feature values (0.0-1.0 normalized) |

#### Feature Description
| Index | Feature | Range | Example |
|-------|---------|-------|---------|
| 0-2 | Movement metrics (step count, sedentary, sleep hours) | 0-100 | 0.5 |
| 3-5 | Sleep quality metrics | 0-24 | 0.3 |
| 6-8 | Location/mobility metrics | 0-1 | 0.8 |
| 9-14 | Behavioral metrics | 0-1 | 0.5 |
| 15-17 | Environmental metrics | varied | 0.4 |

#### Example Request (cURL)
```bash
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-001",
    "features": [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
  }'
```

#### Example Request (JavaScript/Fetch)
```javascript
const response = await fetch('http://localhost:5000/api/scores', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 'user-001',
    features: [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
  })
});
const data = await response.json();
console.log(data);
```

#### Example Request (Python)
```python
import requests

payload = {
    "user_id": "user-001",
    "features": [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
}

response = requests.post('http://localhost:5000/api/scores', json=payload)
data = response.json()
print(data)
```

#### Success Response (201 Created)
```json
{
  "id": "risk-score-abc123",
  "user_id": "user-001",
  "score": 0.6532,
  "risk_level": "moderate",
  "features": [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3],
  "recorded_at": "2026-03-29T21:56:00"
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique score ID |
| user_id | string | Associated user |
| score | float | Risk score (0.0-1.0) |
| risk_level | string | "low", "moderate", or "high" |
| features | array | Input features array |
| recorded_at | string | ISO 8601 timestamp |

#### Risk Level Interpretation
| Risk Level | Score Range | Recommendation |
|------------|-------------|-----------------|
| low | 0.0 - 0.3 | Monitor regularly |
| moderate | 0.3 - 0.7 | Schedule check-in |
| high | 0.7 - 1.0 | Urgent clinical review |

#### Error Responses

**400 Bad Request** - Invalid JSON
```json
{
  "error": "Invalid JSON body"
}
```

**422 Unprocessable Entity** - Missing required fields
```json
{
  "error": "user_id and features are required"
}
```

**422 Unprocessable Entity** - Wrong feature count
```json
{
  "error": "Expected 18 features, got 12. Features: [0.5, 0.3, ...]"
}
```

**404 Not Found** - User not found
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error** - Prediction failed
```json
{
  "error": "Prediction failed: [error details]"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 201 | Score created successfully |
| 400 | Invalid JSON body |
| 404 | User not found |
| 422 | Validation error |
| 500 | Server error |

---

### GET /api/scores/:user_id

Get historical risk scores for a user.

**Method:** `GET`  
**Path:** `/api/scores/{user_id}`  
**Auth:** None  
**Query Parameters:** Optional

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 30 | Max records to return |

#### Request
```bash
curl -X GET "http://localhost:5000/api/scores/user-001?limit=10"
```

#### Success Response (200 OK)
```json
[
  {
    "id": "risk-score-1",
    "user_id": "user-001",
    "score": 0.6532,
    "risk_level": "moderate",
    "recorded_at": "2026-03-29T21:56:00"
  },
  {
    "id": "risk-score-2",
    "user_id": "user-001",
    "score": 0.5234,
    "risk_level": "moderate",
    "recorded_at": "2026-03-29T20:15:00"
  }
]
```

#### Error Response (404 Not Found)
```json
{
  "error": "User not found"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Scores retrieved successfully |
| 404 | User not found |

---

### GET /api/scores/:user_id/latest

Get the most recent risk score for a user.

**Method:** `GET`  
**Path:** `/api/scores/{user_id}/latest`  
**Auth:** None

#### Request
```bash
curl -X GET "http://localhost:5000/api/scores/user-001/latest"
```

#### Success Response (200 OK)
```json
{
  "id": "risk-score-1",
  "user_id": "user-001",
  "score": 0.6532,
  "risk_level": "moderate",
  "recorded_at": "2026-03-29T21:56:00"
}
```

#### Error Responses

**404 Not Found** - No scores found
```json
{
  "error": "No scores found"
}
```

**404 Not Found** - User not found
```json
{
  "error": "User not found"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Latest score retrieved |
| 404 | User or scores not found |

---

## PHQ-9 Assessment

### POST /api/phq

Submit a PHQ-9 (Patient Health Questionnaire-9) depression assessment.

**Method:** `POST`  
**Path:** `/api/phq`  
**Auth:** None  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "user_id": "user-001",
  "responses": [1, 2, 1, 0, 2, 1, 0, 1, 2]
}
```

#### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | Yes | Unique user identifier |
| responses | array[int] | Yes | 9 values, each 0-3 |

#### PHQ-9 Questions
| Q# | Question | Responses |
|----|----------|-----------|
| 1 | Little interest/pleasure in activities | 0=Not at all, 1=Several days, 2=More than half, 3=Nearly every day |
| 2 | Feeling down/depressed/hopeless | " |
| 3 | Trouble falling/staying asleep | " |
| 4 | Feeling tired/low energy | " |
| 5 | Poor appetite/overeating | " |
| 6 | Feeling bad about yourself | " |
| 7 | Trouble concentrating | " |
| 8 | Moving/speaking slowly or agitated | " |
| 9 | Thoughts of self-harm | " |

#### Example Request
```bash
curl -X POST http://localhost:5000/api/phq \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-001",
    "responses": [1, 2, 1, 0, 2, 1, 0, 1, 2]
  }'
```

#### Success Response (201 Created)
```json
{
  "id": "phq-entry-xyz789",
  "user_id": "user-001",
  "score": 11,
  "responses": [1, 2, 1, 0, 2, 1, 0, 1, 2],
  "submitted_at": "2026-03-29T22:00:00"
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique PHQ entry ID |
| user_id | string | Associated user |
| score | integer | Total PHQ-9 score (0-27) |
| responses | array | Input responses |
| submitted_at | string | ISO 8601 timestamp |

#### PHQ-9 Score Interpretation
| Score | Severity | Recommendation |
|-------|----------|-----------------|
| 0-4 | Minimal | No intervention needed |
| 5-9 | Mild | Monitor and self-help |
| 10-14 | Moderate | Medication or psychotherapy |
| 15-19 | Moderately Severe | Medication and psychotherapy |
| 20-27 | Severe | Medication and psychotherapy, may need hospitalization |

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid JSON body"
}
```

**422 Unprocessable Entity** - Missing fields
```json
{
  "error": "user_id and responses are required"
}
```

**422 Unprocessable Entity** - Wrong response count
```json
{
  "error": "PHQ-9 requires exactly 9 responses"
}
```

**422 Unprocessable Entity** - Invalid response value
```json
{
  "error": "Each response must be 0, 1, 2, or 3"
}
```

**404 Not Found**
```json
{
  "error": "User not found"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 201 | Assessment created successfully |
| 400 | Invalid JSON |
| 404 | User not found |
| 422 | Validation error |

---

### GET /api/phq/:user_id

Get PHQ-9 assessment history for a user.

**Method:** `GET`  
**Path:** `/api/phq/{user_id}`  
**Auth:** None  
**Query Parameters:** Optional

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 20 | Max records to return |

#### Request
```bash
curl -X GET "http://localhost:5000/api/phq/user-001?limit=10"
```

#### Success Response (200 OK)
```json
[
  {
    "id": "phq-entry-1",
    "score": 11,
    "submitted_at": "2026-03-29T22:00:00"
  },
  {
    "id": "phq-entry-2",
    "score": 8,
    "submitted_at": "2026-03-22T21:00:00"
  }
]
```

#### Error Response (404 Not Found)
```json
{
  "error": "User not found"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | History retrieved successfully |
| 404 | User not found |

---

## Alerts

### GET /api/alerts/:user_id

Get alerts for a user.

**Method:** `GET`  
**Path:** `/api/alerts/{user_id}`  
**Auth:** None  
**Query Parameters:** Optional

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 20 | Max alerts to return |
| unread | boolean | false | Filter by unread status |

#### Request
```bash
# Get all alerts
curl -X GET "http://localhost:5000/api/alerts/user-001?limit=10"

# Get unread alerts only
curl -X GET "http://localhost:5000/api/alerts/user-001?limit=10&unread=true"
```

#### Success Response (200 OK)
```json
[
  {
    "id": "alert-001",
    "user_id": "user-001",
    "alert_type": "high_risk",
    "message": "High depression risk detected (score: 0.85). Immediate clinician review recommended.",
    "severity": "critical",
    "is_read": 0,
    "created_at": "2026-03-29T21:56:00"
  },
  {
    "id": "alert-002",
    "user_id": "user-001",
    "alert_type": "sustained_risk",
    "message": "Sustained elevated risk over last 5 readings (avg: 0.72). Consider scheduling a check-in.",
    "severity": "warning",
    "is_read": 1,
    "created_at": "2026-03-29T20:15:00"
  }
]
```

#### Alert Types
| Type | Severity | Description |
|------|----------|-------------|
| high_risk | critical | Single reading with very high risk |
| sustained_risk | warning | Consistently elevated risk over time |
| phq_spike | critical/warning | High PHQ-9 score submission |

#### Error Response (404 Not Found)
```json
{
  "error": "User not found"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Alerts retrieved successfully |
| 404 | User not found |

---

### PATCH /api/alerts/:alert_id/read

Mark a single alert as read.

**Method:** `PATCH`  
**Path:** `/api/alerts/{alert_id}/read`  
**Auth:** None

#### Request
```bash
curl -X PATCH http://localhost:5000/api/alerts/alert-001/read
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "alert_id": "alert-001"
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Alert not found"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Alert marked as read |
| 404 | Alert not found |

---

### PATCH /api/alerts/:user_id/read-all

Mark all alerts for a user as read.

**Method:** `PATCH`  
**Path:** `/api/alerts/{user_id}/read-all`  
**Auth:** None

#### Request
```bash
curl -X PATCH http://localhost:5000/api/alerts/user-001/read-all
```

#### Success Response (200 OK)
```json
{
  "success": true
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "User not found"
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | All alerts marked as read |
| 404 | User not found |

---

## Trends & Analytics

### GET /api/trends/:user_id

Get longitudinal trend analysis for a user.

**Method:** `GET`  
**Path:** `/api/trends/{user_id}`  
**Auth:** None  
**Query Parameters:** Optional

#### Query Parameters
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| days | integer | 30 | 1-365 | Number of days to analyze |

#### Request
```bash
# Get 30-day trend
curl -X GET "http://localhost:5000/api/trends/user-001"

# Get custom period
curl -X GET "http://localhost:5000/api/trends/user-001?days=90"
```

#### Success Response (200 OK)
```json
{
  "user_id": "user-001",
  "days_analyzed": 30,
  "overall_avg_score": 0.5234,
  "trend_direction": "stable",
  "daily_averages": [
    {
      "day": "2026-03-01",
      "avg_score": 0.4521,
      "reading_count": 3
    },
    {
      "day": "2026-03-02",
      "avg_score": 0.5123,
      "reading_count": 2
    }
  ],
  "risk_level_distribution": {
    "low": 15,
    "moderate": 10,
    "high": 2
  },
  "phq_history": [
    {
      "score": 11,
      "submitted_at": "2026-03-29T22:00:00"
    }
  ]
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| user_id | string | User identifier |
| days_analyzed | integer | Number of days analyzed |
| overall_avg_score | float | Average risk score |
| trend_direction | string | "improving", "stable", or "worsening" |
| daily_averages | array | Daily aggregated data |
| risk_level_distribution | object | Count by risk level |
| phq_history | array | PHQ-9 submissions in period |

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Trends retrieved successfully |
| 404 | User not found |

---

### GET /api/trends/:user_id/summary

Get a brief trend summary for dashboard display.

**Method:** `GET`  
**Path:** `/api/trends/{user_id}/summary`  
**Auth:** None

#### Request
```bash
curl -X GET "http://localhost:5000/api/trends/user-001/summary"
```

#### Success Response (200 OK)
```json
{
  "user_id": "user-001",
  "week_avg_score": 0.5892,
  "trend_direction": "stable",
  "latest_score": {
    "score": 0.6532,
    "risk_level": "moderate",
    "recorded_at": "2026-03-29T21:56:00"
  },
  "risk_distribution_7d": {
    "low": 2,
    "moderate": 4,
    "high": 1
  }
}
```

#### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Summary retrieved successfully |
| 404 | User not found |

---

## Response Formats

### Standard Success Response

All successful API responses follow this format:

```json
{
  "field1": "value1",
  "field2": "value2",
  "nested": {
    "subfield": "value"
  }
}
```

### Standard Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

### Array Response

```json
[
  { "item": 1 },
  { "item": 2 },
  { "item": 3 }
]
```

### Timestamps

All timestamps use ISO 8601 format:
```
2026-03-29T21:56:00
```

### Numeric Types

- **Scores**: Floating point (0.0 - 1.0)
- **PHQ Responses**: Integer (0, 1, 2, 3)
- **Record IDs**: String (UUID format)

---

## Error Handling

### HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

#### Invalid JSON
```json
{
  "error": "Invalid JSON body"
}
```
**Status**: 400

#### Missing Required Fields
```json
{
  "error": "user_id and features are required"
}
```
**Status**: 422

#### Invalid Data
```json
{
  "error": "Each response must be 0, 1, 2, or 3"
}
```
**Status**: 422

#### Resource Not Found
```json
{
  "error": "User not found"
}
```
**Status**: 404

#### Server Error
```json
{
  "error": "Prediction failed: [error details]"
}
```
**Status**: 500

### Client Error Handling

**Best Practice Pseudocode:**
```javascript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${response.status}: ${error.error}`);
    // Handle specific status codes
    switch(response.status) {
      case 404:
        // Handle not found
        break;
      case 422:
        // Handle validation error
        break;
      case 500:
        // Handle server error
        break;
    }
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Implement per-user rate limits
- Use token bucket algorithm
- Return `429 Too Many Requests` when limit exceeded

---

## CORS (Cross-Origin Resource Sharing)

API supports CORS for web dashboard:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Environment Variables

Configure these for your deployment:

```env
FLASK_ENV=development          # production or development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///mindcare.db
DEBUG=false
CORS_ORIGINS=http://localhost:5173
RISK_LOW_THRESHOLD=0.3
RISK_HIGH_THRESHOLD=0.7
ALERT_COOLDOWN_HOURS=24
```

---

## Best Practices for Clients

### Mobile App
1. **Batch Requests**: Combine multiple calls when possible
2. **Cache Results**: Store frequently accessed data locally
3. **Handle Offline**: Implement offline queue for submissions
4. **Retry Logic**: Implement exponential backoff for failed requests
5. **Data Validation**: Validate all inputs before sending

### Web Dashboard
1. **Pagination**: Use limit parameter for large datasets
2. **Real-time Updates**: Implement polling or websockets
3. **Error UI**: Show user-friendly error messages
4. **Loading States**: Display loading indicators
5. **Animations**: Smooth transitions between data states

### General
1. **API Keys**: Store securely, never in client code
2. **HTTPS**: Always use HTTPS in production
3. **Timeouts**: Set request timeouts (30 seconds recommended)
4. **Logging**: Log all API interactions for debugging
5. **Monitoring**: Track error rates and response times

---

## Testing

### Test Credentials

For development testing:
```
user_id: test-user-<random>
```

### Sample Requests

Full collection available in `api_tester.html` web interface.

---

## Support & Issues

For API issues or questions:
- Check error response message
- Review this documentation
- Check backend logs: `docker logs mindcare-backend`
- Report bugs with: timestamp, endpoint, request, response

---

**Version**: 1.0.0  
**Last Updated**: March 29, 2026  
**Backend Status**: ✅ Running  
**ML Model**: ✅ Loaded (CNN-LSTM Hybrid)
