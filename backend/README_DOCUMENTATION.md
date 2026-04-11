# MindCare Backend Documentation - Complete Guide

**Version**: 1.0.0 | **Date**: March 29, 2026 | **Backend Status**: ✅ Running

---

## 📚 Documentation Overview

This folder contains comprehensive API documentation for the MindCare mental health monitoring backend. Choose the right guide based on your role and platform.

---

## 🎯 Quick Navigation by Role

### 👨‍💼 For Project Managers / Product Owners
**Start here**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Overview of all 12 API endpoints
- Response models and data structures
- Risk level interpretations
- PHQ-9 scoring guidelines

### 🌐 For Web Dashboard Developers
**Start here**: [WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md)
- Complete setup and initialization
- All dashboard components (Risk Cards, Charts, Alerts)
- Real-time data updates and polling
- Performance optimization techniques
- Responsive design patterns
- Error handling UI patterns
- Production checklist

**Then read**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint specs

### 📱 For Mobile App Developers (iOS/Android/React Native)
**Start here**: [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md)
- Platform-specific implementations (Swift, Kotlin, React Native)
- Offline functionality and data persistence
- Health data collection from device sensors
- Battery and network optimization
- Push notifications setup
- Background task scheduling
- Secure token storage
- Production checklist

**Then read**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint specs

### 🔌 For Backend/DevOps Engineers
**Start here**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Complete endpoint reference
- Authentication setup
- Database schema
- Environment variables
- Deployment configuration
- Rate limiting guidelines

### 🚀 For API Integration Specialists
**Start here**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for overview
**Then**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete specs
**Also**: Platform-specific guides ([WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md) or [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md))

---

## 📖 Document Descriptions

### 1️⃣ API_DOCUMENTATION.md (Main Reference)
**54 KB | Comprehensive | 12 endpoints**

Complete API reference for all supported endpoints:
- Health & Status checks
- Risk Score Prediction (18-feature ML model)
- PHQ-9 Assessment management
- Alert system
- Trend & Analytics
- Error handling
- Response formats
- Authentication guidelines
- CORS configuration
- Environment variables
- Best practices
- Rate limiting
- Support information

**Use this for**: Full technical specifications, exact request/response formats, error codes, status codes

### 2️⃣ WEB_DASHBOARD_GUIDE.md (Web-Specific)
**32 KB | Web developers | Practical examples**

Web dashboard specific integration guide:
- Quick start with Fetch API
- API client implementation
- Dashboard components (5 types)
  - Risk Score Card
  - Score Trend Chart
  - Risk Distribution
  - Alerts Panel
  - PHQ-9 History Table
- Real-time update strategies (polling)
- Data visualization recommendations
- Chart library comparisons
- Error handling UI patterns
- Performance optimization
  - Request batching
  - Caching strategies
  - Response time tracking
- Responsive design CSS
- Authentication setup (JWT)
- Dashboard layout template

**Use this for**: Web dashboard implementation, React/Vue/Angular examples, chart setup, real-time updates

### 3️⃣ MOBILE_APP_GUIDE.md (Mobile-Specific)
**45 KB | Mobile developers | Platform guides**

Mobile app specific integration guide:
- Platform implementations
  - iOS (Swift)
  - Android (Kotlin)
  - React Native / Expo
- Data Models (TypeScript)
- Offline functionality
  - SQLite local persistence
  - Request queuing
  - Automatic sync
- Health data collection
  - Step count
  - Sleep data
  - Heart rate
- Battery & network optimization
  - Request batching
  - Background sync
  - Smart scheduling
- Push notifications
  - Alert handling
  - Notification display
  - Tap response
- Performance monitoring
  - Crash reporting (Sentry)
  - Analytics instrumentation
  - Error tracking
- Secure storage (SecureStore)
- App lifecycle management
- Production checklist

**Use this for**: Mobile app implementation, platform-specific code, offline support, push notifications

### 4️⃣ QUICK_REFERENCE.md (Cheat Sheet)
**15 KB | Quick lookup | Copy-paste snippets**

One-page reference for quick lookups:
- All 12 endpoints in table format
- 18-element feature array specification
- PHQ-9 response format (9 questions)
- Response models (JSON examples)
- Risk level chart
- Error codes and messages
- Code examples (JavaScript, cURL, Python)
- PHQ-9 score interpretation
- Query parameters
- Best practices checklist
- Common troubleshooting
- Quick links to full docs

**Use this for**: Quick endpoint lookups, error debugging, copying curl commands, score interpretation

---

## 🏗️ Backend Architecture Overview

```
MindCare Backend
├── Framework: Flask 3.0.3 + CORS
├── Database: SQLite (WAL mode)
├── ML Model: TensorFlow/Keras CNN-LSTM
│   ├── Input: 18 features, shape (1, 18, 1)
│   ├── Output: Risk score (0.0-1.0)
│   └── Trainable params: 146,945
├── API Layer: 12 RESTful endpoints
├── Service Layer: ML predictions, alerts, trends
└── Data Layer: SQLite with foreign keys
```

### Technology Stack
- **Framework**: Flask 3.0.3
- **CORS**: Flask-CORS 4.0.0
- **Database**: SQLite3
- **ML/AI**: TensorFlow 2.x, Keras
- **Serialization**: JSON
- **API Type**: REST/JSON

### Supported Platforms
- ✅ Web Browsers (Chrome, Firefox, Safari, Edge)
- ✅ iOS (Swift) via HTTP
- ✅ Android (Kotlin) via HTTP/Retrofit
- ✅ React Native / Expo

---

## 🔑 Key Features & Capabilities

### 1. Risk Prediction (ML Model)
- **Input**: 18 normalized features (0.0-1.0)
- **Output**: Risk score (0.0-1.0) + risk_level (low/moderate/high)
- **Model**: CNN-LSTM Hybrid architecture
- **Endpoint**: `POST /api/scores`
- **Latency**: <500ms

### 2. PHQ-9 Assessment
- **Input**: 9 responses (each 0-3)
- **Output**: Total score (0-27) + severity level
- **Standard**: Patient Health Questionnaire-9
- **Endpoint**: `POST /api/phq`
- **Interpretation**: 5 severity levels

### 3. Alert System
- **Types**: high_risk, sustained_risk, phq_spike
- **Severity**: critical, warning, info
- **Delivery**: RESTful API (ready for push notifications)
- **Endpoints**: Get, mark read (single/all)

### 4. Trend Analysis
- **Period**: Configurable 1-365 days
- **Data**: Daily averages, risk distribution
- **Metrics**: Trend direction, PHQ history
- **Endpoints**: Full trends, summary

---

## 📊 Endpoints Summary

| Category | Count | Endpoints |
|----------|-------|-----------|
| Health & Status | 2 | `/health`, `/api/model/info` |
| Risk Scores | 3 | POST/GET history/GET latest |
| PHQ-9 | 2 | POST/GET history |
| Alerts | 3 | GET/mark read/mark all read |
| Trends | 2 | GET trends/GET summary |
| **TOTAL** | **12** | |

---

## 🚀 Getting Started

### Step 1: Review Your Role's Guide
- Web dashboard? → [WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md)
- Mobile app? → [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md)
- Need quick lookup? → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Full technical specs? → [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Step 2: Check API Status
```bash
curl -X GET http://localhost:5000/health
# Response: { "status": "ok", "service": "DeepSense-MH Backend" }
```

### Step 3: Verify ML Model
```bash
curl -X GET http://localhost:5000/api/model/info
# Response includes input shape, parameters, etc.
```

### Step 4: Start Integrating
- Set up your HTTP client (Fetch, Axios, Retrofit, URLSession, etc.)
- Implement feature collection (18 features)
- Add error handling and offline support
- Implement UI components (charts, alerts, cards)

---

## 💡 Feature Array (18 Values)

All values must be normalized to 0.0-1.0 range:

```javascript
const features = [
  0.5,  // [0]  Movement/Steps normalized
  0.3,  // [1]  Sleep duration normalized
  0.6,  // [2]  Sleep quality percentage
  0.7,  // [3]  Heart rate normalized
  0.4,  // [4]  Activity level
  0.8,  // [5]  Physical activity
  0.9,  // [6]  Location entropy
  0.4,  // [7]  Movement patterns
  0.6,  // [8]  Social interaction
  0.5,  // [9]  Screen time
  0.3,  // [10] App switching frequency
  0.8,  // [11] Battery drain percentage
  0.5,  // [12] WiFi connectivity
  0.7,  // [13] Location stability
  0.6,  // [14] Circadian rhythm
  0.4,  // [15] Communication frequency
  0.8,  // [16] Routine consistency
  0.3   // [17] Environmental stress
];
```

**Important**: Exactly 18 values required. If you have different features, consult the ML training notebook.

---

## 📋 Response Format Reference

### Success Response (Risk Score)
```json
{
  "id": "score-abc123",
  "user_id": "user-001",
  "score": 0.6543,
  "risk_level": "moderate",
  "features": [...],
  "recorded_at": "2026-03-29T21:56:00"
}
```

### Error Response
```json
{
  "error": "Expected 18 features, got 12"
}
```

### Risk Level Mapping
| Score Range | Level | Color | Action |
|-------------|-------|-------|--------|
| 0.0 - 0.3 | low | 🟢 Green | Monitor |
| 0.3 - 0.7 | moderate | 🟠 Orange | Check-in |
| 0.7 - 1.0 | high | 🔴 Red | Urgent Review |

---

## 🔐 Security Guidelines

### Authentication (Future Implementation)
- Currently uses `user_id` based identification
- Production: Implement JWT tokens
- Endpoints will require: `Authorization: Bearer <token>`

### Data Protection
- Always use HTTPS in production
- Store tokens in secure storage (never localStorage)
- Implement certificate pinning for mobile
- Validate all inputs server-side
- Never expose API credentials in client code

### Compliance
- Follow HIPAA guidelines for health data
- Implement proper access controls
- Audit all data access
- Encrypt data at rest
- Encrypt data in transit (HTTPS/TLS)

---

## 🧪 Testing

### Interactive Web Interface
Open `api_tester.html` in your browser:
- Test all 12 endpoints
- Live response display
- Sample data provided
- Status indicator

### Postman Collection
Export from API_Documentation.md:
- All endpoints configured
- Environment setup
- Pre-request scripts
- Response validation

### Unit Testing Examples
See platform-specific guides:
- [WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md#testing-apis) - Mock API client
- [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md#testing-apis) - Mock implementation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md#testing) - Test credentials

---

## 📞 Support & Troubleshooting

### Common Issues & Solutions

**CORS Error in Browser**
- Backend running but CORS not enabled?
- Check: `app/routes/__init__.py` has CORS setup
- Solution: Restart backend

**"Expected 18 features, got X"**
- Feature array wrong length
- Solution: Verify array has exactly 18 values
- Consult: Feature array section above

**Connection Refused**
- Backend not running?
- Solution: Run `python run.py` in backend folder
- Verify port 5000 is available

**Model Not Loading**
- ML model file missing?
- Path incorrect?
- Solution: Check `ml_training/hybrid_cnn_lstm_model.keras` exists

**Offline Features Not Working**
- Mobile app offline mode issues?
- Solution: Check SQLite initialization and queue implementation
- Reference: [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md#offline-functionality)

### Getting Help
1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md#quick-troubleshooting)
2. Review platform-specific guide (Web/Mobile)
3. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md#error-handling) for error details
4. Check backend logs: `docker logs mindcare-backend` (if dockerized)

---

## 📈 Performance Metrics

### Expected Response Times
- Health check: <10ms
- Model info: <10ms
- Risk prediction: 200-500ms (ML inference)
- Score history: 50-200ms (database query)
- Trends analysis: 100-300ms (aggregation)
- Alerts: <100ms

### Throughput
- Single backend instance: ~100 requests/sec
- Database: ~1000 connections recommended max
- ML model: Single batch (model designed for batch inference)

### Storage
- Database (sqlite): ~1KB per score entry
- 1 year of daily data: ~365KB
- ML model file: ~2.5MB

---

## 🗺️ Development Workflow

### 1. Setup Phase
```
1. Install Python dependencies (requirements.txt)
2. Verify database (app/db/database.py)
3. Check ML model exists
4. Start backend (python run.py)
5. Verify health check (curl /health)
```

### 2. Integration Phase
```
1. Choose your platform (web/mobile)
2. Read platform-specific guide
3. Implement HTTP client
4. Collect 18 features
5. Add error handling
```

### 3. Feature Implementation
```
1. Risk score prediction
2. Alert management
3. PHQ-9 assessment
4. Trend visualization
5. Offline support (mobile)
```

### 4. Testing & Validation
```
1. Unit tests for API client
2. Integration tests with backend
3. Performance testing
4. Error scenario testing
5. Security review
```

### 5. Deployment
```
1. Production environment setup
2. HTTPS/SSL configuration
3. Rate limiting setup
4. Monitoring and logging
5. Backup strategy
```

---

## 📚 Additional Resources

### Notebooks (ML Training)
- `ml_training/01_eda.ipynb` - Exploratory Data Analysis
- `ml_training/02_feature_engineering.ipynb` - Feature Engineering
- `ml_training/03_model_training.ipynb` - Model Training

### Testing Tools
- `api_tester.html` - Interactive API testing (open in browser)
- `check_model.py` - Verify ML model structure
- `check_routes.py` - Verify all endpoints registered

### Source Code Structure
```
app/
├── routes/           # API endpoints
│   ├── alerts.py
│   ├── phq.py
│   ├── scores.py
│   └── trends.py
├── services/         # Business logic
│   ├── alert_generator.py
│   ├── ml_predictor.py
│   ├── score_aggregator.py
│   └── trend_analyzer.py
├── models/           # Data models
│   ├── alert.py
│   ├── phq_entry.py
│   ├── risk_score.py
│   └── user.py
└── db/               # Database
    ├── database.py
    └── migrations/
```

---

## ✅ Implementation Checklist

### Before Going Live
- [ ] All 12 endpoints tested
- [ ] Error handling implemented
- [ ] Offline mode working (mobile)
- [ ] Push notifications configured
- [ ] HTTPS enabled
- [ ] CORS configured for correct domain
- [ ] Database backups enabled
- [ ] Monitoring/logging in place
- [ ] Performance acceptable
- [ ] Security audit completed
- [ ] Rate limiting configured
- [ ] Documentation reviewed by team

---

## 🎓 Learning Path

**New to MindCare API?**
1. Read this overview (you are here)
2. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for endpoints
3. Read your role's guide (Web/Mobile)
4. Implement HTTP client
5. Test with `api_tester.html`

**Experienced Developer?**
1. Jump to [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Copy relevant curl examples
3. Implement in your framework
4. Reference [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for details

**Need Advanced Features?**
1. Check platform-specific guides for:
   - Real-time updates (web)
   - Offline support (mobile)
   - Performance optimization
   - Security implementation

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial release - Complete API documentation |

---

## 🤝 Contributing

To update these docs:
1. Backend team: Update [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
2. Web team: Update [WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md)
3. Mobile team: Update [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md)
4. QA/DevOps: Update [QUICK_REFERENCE.md](QUICK_REFERENCE.md) and examples

---

## 📄 Quick Links

- **Main Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Web Developers**: [WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md)
- **Mobile Developers**: [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md)
- **Quick Lookup**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Interactive Testing**: `api_tester.html`

---

**Backend Status**: ✅ Running on http://localhost:5000  
**ML Model**: ✅ Loaded (CNN-LSTM Hybrid)  
**Database**: ✅ SQLite (mindcare.db)  
**Last Updated**: March 29, 2026

For questions or issues, refer to the appropriate guide above or check the troubleshooting section.
