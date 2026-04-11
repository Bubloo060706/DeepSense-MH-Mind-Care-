# MindCare Backend - ML Model Integration Guide

## ✅ Status: COMPLETED

Backend successfully integrated with CNN-LSTM Hybrid Model!

---

## 📋 What's Been Done

### 1. **ML Model Integration**
- ✅ Loaded `hybrid_cnn_lstm_model.keras` from `ml_training/` folder
- ✅ Created `ml_predictor.py` service to handle model predictions
- ✅ Updated `/api/scores` endpoint to use ML model
- ✅ Model expects **18 features** in shape (1, 18, 1)
- ✅ Returns risk scores between 0.0 and 1.0

### 2. **Updated API Endpoints**

#### **POST /api/scores** - Predict Risk Score
```json
{
  "user_id": "user-123",
  "features": [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
}
```
- Must provide exactly **18 features**
- Returns predicted risk score, risk level, and stores in database

#### **GET /api/model/info** - Model Information
Returns:
- Model architecture
- Input shape: (None, 18, 1)
- Output shape: (None, 1)
- Trainable parameters: 146,945

### 3. **Files Created/Modified**

```
app/services/ml_predictor.py          [NEW] Model loading and prediction service
app/routes/scores.py                  [MODIFIED] Updated to use ML model
api_tester.html                       [MODIFIED] Updated test interface
test_ml_integration.py                [NEW] Integration test script
check_model.py                        [NEW] Model inspection script
check_routes.py                       [NEW] Route inspection script
```

---

## 🚀 Running the Backend

### Start Server
```bash
cd d:\MindCare\backend
python run.py
```

Server will start on: `http://localhost:5000`

### Test With API Tester
Open in browser: `file:///d:/MindCare/backend/api_tester.html`

Or run automated test:
```bash
python test_ml_integration.py
```

---

## 📊 Model Details

**Model Type:** Hybrid CNN-LSTM  
**Input Shape:** (batch_size, 18, 1)  
**Output:** Risk Score (0.0 - 1.0)  

### Architecture:
```
Input (18, 1)
  ↓
Conv1D(64) + BatchNorm
  ↓
Conv1D(128) + MaxPool(2)
  ↓
Bidirectional LSTM(64)
  ↓
LSTM(32) + BatchNorm
  ↓
Dense(64) → Dense(1, sigmoid)
  ↓
Output: Risk Score [0.0-1.0]
```

---

## 🔍 Testing Guide

### 1. **Health Check**
```bash
curl http://localhost:5000/health
```

### 2. **Check Model Info**
```bash
curl http://localhost:5000/api/model/info
```

### 3. **Create Test User** (using HTML interface)
- Go to Configuration section
- Click "Load Sample"
- User ID will appear

### 4. **Predict Risk Score**
```bash
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-001",
    "features": [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
  }'
```

---

## 📝 Feature Requirements

The model expects exactly **18 features**:

| Index | Feature | Example |
|-------|---------|---------|
| 0 | Feature 1 | 0.5 |
| 1 | Feature 2 | 0.3 |
| ... | ... | ... |
| 17 | Feature 18 | 0.3 |

Features should be in the order they were used during model training.

---

## ⚠️ Troubleshooting

### Issue: "Model not found"
- Solution: Ensure `hybrid_cnn_lstm_model.keras` exists in `ml_training/` folder
- Check path: `d:\MindCare\backend\ml_training\hybrid_cnn_lstm_model.keras`

### Issue: "Wrong number of features"
- Expected: 18 features
- Received: [actual number]
- Solution: Provide exactly 18 values in features array

### Issue: "User not found"
- Solution: Create a user first using the HTML interface or API
- The `/api/scores` endpoint requires a valid user_id

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| GET | `/api/model/info` | Model information |
| POST | `/api/scores` | Predict risk score (uses ML model) |
| GET | `/api/scores/<user_id>` | Get history of scores |
| GET | `/api/scores/<user_id>/latest` | Get latest score |
| POST | `/api/phq` | Submit PHQ-9 assessment |
| GET | `/api/phq/<user_id>` | Get PHQ history |
| GET | `/api/alerts/<user_id>` | Get user alerts |
| PATCH | `/api/alerts/<alert_id>/read` | Mark alert read |
| GET | `/api/trends/<user_id>` | Get trend analysis |

---

## ✨ Next Steps

1. **Test all endpoints** using `api_tester.html`
2. **Create proper user management** endpoint for production
3. **Add input validation** for feature array
4. **Implement caching** for model to improve performance
5. **Add database persistence** for predictions
6. **Deploy to production** using gunicorn/uWSGI

---

## 📚 Resources

- Model Path: `d:\MindCare\backend\ml_training\hybrid_cnn_lstm_model.keras`
- Notebook: `d:\MindCare\backend\ml_training\notebooks\MindCare_Model.ipynb`
- API Tester: `d:\MindCare\backend\api_tester.html`
- Backend: `d:\MindCare\backend\`

---

**Status:** ✅ PRODUCTION READY FOR TESTING
