# Setup Guide

## Prerequisites

| Tool         | Version   |
|--------------|-----------|
| Python       | 3.10+     |
| Node.js      | 18+       |
| Android SDK  | API 26+   |
| Docker       | 24+       |
| PostgreSQL   | 15+ (prod)|

---

## 1. Clone the Repository
```bash
git clone https://github.com/yourname/iot-depression-detection.git
cd iot-depression-detection
cp .env.example .env
```

---

## 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Backend runs at `http://localhost:5000`

### Train the ML Model (optional)
```bash
cd backend/ml_training
python train.py                   # outputs models/random_forest.pkl
python evaluate.py                # outputs reports/
python export_tflite.py           # outputs models/model.tflite
```

Copy the TFLite model to the Android app:
```bash
cp backend/ml_training/models/model.tflite         android-app/assets/
cp backend/ml_training/models/model_metadata.json  android-app/assets/
```

---

## 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Dashboard runs at `http://localhost:3000`

---

## 4. Android App Setup
```bash
cd android-app
npm install
npx react-native run-android
```

> **Note**: Ensure Android emulator is running (API 26+) or a physical device
> is connected with USB debugging enabled.

Update the backend URL in `android-app/src/api/BackendClient.js`:
```javascript
// Emulator
const BASE_URL = "http://10.0.2.2:5000/api";

// Physical device (replace with your machine's local IP)
const BASE_URL = "http://192.168.1.x:5000/api";
```

---

## 5. Docker (Full Stack)
```bash
docker-compose up --build
```

| Service   | URL                     |
|-----------|-------------------------|
| Backend   | http://localhost:5000   |
| Frontend  | http://localhost:3000   |
| Postgres  | localhost:5432          |

---

## 6. Running Tests
```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test

# Android
cd android-app
npm test
```

---

## 7. Environment Variables

| Variable           | Description                        | Default                  |
|--------------------|------------------------------------|--------------------------|
| `FLASK_ENV`        | development / production           | development              |
| `DATABASE_URL`     | SQLAlchemy DB connection string    | sqlite:///depression.db  |
| `SECRET_KEY`       | Flask secret key                   | dev-secret-key           |
| `JWT_SECRET`       | JWT signing secret                 | dev-jwt-secret           |
| `VITE_API_BASE_URL`| Frontend API base URL              | http://localhost:5000/api|

---

## 8. Project Structure Quick Reference
```
iot-depression-detection/
├── android-app/     React Native app (sensors, ML, local DB)
├── backend/         Flask API + ML training pipeline
├── frontend/        React.js clinician dashboard
└── docs/            Architecture, API reference, setup
```

---

## Troubleshooting

**GPS not working on emulator**
→ Open emulator → Extended Controls → Location → Set coordinates manually

**TFLite model not found**
→ Ensure `model.tflite` is in `android-app/assets/` and listed in `android/app/build.gradle` assets

**CORS errors from frontend**
→ Confirm `FLASK_ENV=development` and Flask-CORS is installed

**SQLite locked error**
→ Only one process should access the DB at a time — stop duplicate Flask instances