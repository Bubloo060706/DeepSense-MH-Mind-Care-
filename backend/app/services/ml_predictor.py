"""
ML Model Predictor Service
Loads the hybrid CNN-LSTM model and provides predictions for risk scores.
"""

import os
import numpy as np
import tensorflow as tf
from pathlib import Path

# Model path
MODEL_DIR = Path(__file__).parent.parent.parent / "ml_training"
MODEL_PATH = MODEL_DIR / "hybrid_cnn_lstm_model.keras"

# Global model instance (loaded once)
_model = None
FEATURE_ORDER = [
    "step_count",
    "sleep_hours",
    "heart_rate",
    "stress_level",
    "calories",
    "distance",
    "active_minutes",
    "resting_hr",
    "spo2",
    "respiration",
    "mood_score",
    "anxiety_score",
    "screen_time",
    "water_intake",
    "sleep_quality",
    "fatigue_level",
    "focus_level",
    "social_interaction"
]

def load_model():
    """Load the Keras model (cached)."""
    global _model
    
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                "Please ensure hybrid_cnn_lstm_model.keras exists in ml_training folder."
            )
        
        try:
            _model = tf.keras.models.load_model(str(MODEL_PATH))
            print(f"✓ Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {str(e)}")
    
    return _model


def predict_risk_score(features):
    """
    Predict risk score from features.
    
    Args:
        features (dict or list/array): Input features for prediction (expected: 18 features)
        
    Returns:
        float: Risk score between 0.0 and 1.0
    """
    try:
        model = load_model()
        EXPECTED_FEATURES = 18  # CNN-LSTM model trained on 18 features
        
        # Convert features to proper format
        # Convert features
        if isinstance(features, dict):
            feature_list = [features.get(f, 0) for f in FEATURE_ORDER]
        else:
            feature_list = list(features) if not isinstance(features, np.ndarray) else features

        features_array = np.array(feature_list, dtype=np.float32)

        # Ensure correct size
        if len(features_array) < EXPECTED_FEATURES:
            features_array = np.pad(features_array, (0, EXPECTED_FEATURES - len(features_array)))
        elif len(features_array) > EXPECTED_FEATURES:
            features_array = features_array[:EXPECTED_FEATURES]
                # Reshape for CNN-LSTM model: (batch, timesteps, channels) = (1, 18, 1)
        features_reshaped = features_array.reshape((1, EXPECTED_FEATURES, 1))
        
        # Make prediction
        prediction = model.predict(features_reshaped, verbose=0)
        
        # Extract score (should be between 0 and 1)
        risk_score = float(prediction[0][0])
        
        # Ensure it's in valid range
        risk_score = max(0.0, min(1.0, risk_score))
        
        return risk_score
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise RuntimeError(f"Prediction failed: {str(e)}")


def get_model_info():
    """Get model architecture information."""
    try:
        model = load_model()
        return {
            "model_path": str(MODEL_PATH),
            "model_type": str(type(model).__name__),
            "input_shape": str(model.input_shape),
            "output_shape": str(model.output_shape),
            "trainable_params": model.count_params(),
        }
    except Exception as e:
        return {"error": str(e)}
