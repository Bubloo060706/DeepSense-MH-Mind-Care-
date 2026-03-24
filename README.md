# IoT-Based Mental Health & Depression Detection

A privacy-first IoT system using smartphone digital phenotyping to detect depression risk in real time.

## Stack
- **Mobile**: React Native (Android)
- **Backend**: Flask REST API
- **ML**: scikit-learn → TFLite (on-device)
- **Dashboard**: React.js + Chart.js
- **DB**: SQLite (dev) / PostgreSQL (prod)

## Quickstart

### 1. Clone
```bash
git clone https://github.com/yourname/iot-depression-detection.git
cd iot-depression-detection
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Android App
```bash
cd android-app
npm install
npx react-native run-android
```

## Architecture
See `docs/architecture_diagram.png` and `docs/api_reference.md`

## Dataset
Self-collected pilot dataset with PHQ-9 labels. Anonymized. See `backend/ml_training/data/`.

## License
MIT