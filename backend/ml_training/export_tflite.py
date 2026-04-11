"""
DeepSense-MH — Export sklearn model to TFLite
Wraps the best sklearn pipeline in a small Keras model and converts to .tflite
Run: python -m ml_training.export_tflite
"""

import os
import json
import joblib
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
import pandas as pd

MODEL_DIR  = os.path.join(os.path.dirname(__file__), "models")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "tflite")
os.makedirs(OUTPUT_DIR, exist_ok=True)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed", "features.csv")

FEATURE_COLS = [
    "step_count", "sedentary_minutes", "sleep_duration_hours",
    "sleep_midpoint_hour", "sleep_disruptions", "radius_of_gyration",
    "home_stay_pct", "location_entropy", "circadian_rhythm_index",
    "screen_unlocks", "call_frequency", "ambient_light_mean",
]
LABEL_COL = "depressed"
N_FEATURES = len(FEATURE_COLS)


def load_sklearn_pipeline():
    path = os.path.join(MODEL_DIR, "best_model.pkl")
    if not os.path.exists(path):
        raise FileNotFoundError("Run train.py first.")
    return joblib.load(path)


def generate_soft_labels(pipeline, X):
    """Use sklearn pipeline to produce soft probability labels for distillation."""
    return pipeline.predict_proba(X)[:, 1].astype(np.float32)


def build_keras_model():
    inputs = tf.keras.Input(shape=(N_FEATURES,), name="features")
    x = tf.keras.layers.Dense(64, activation="relu")(inputs)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    x = tf.keras.layers.Dense(32, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    output = tf.keras.layers.Dense(1, activation="sigmoid", name="risk_score")(x)
    model = tf.keras.Model(inputs, output)
    return model


def export():
    print("=== DeepSense-MH TFLite Export ===\n")

    pipeline = load_sklearn_pipeline()
    scaler   = pipeline.named_steps["scaler"]

    df = pd.read_csv(DATA_PATH)
    X  = df[FEATURE_COLS].values
    y  = df[LABEL_COL].values

    X_train, X_test, y_train, _ = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    # Scale with existing sklearn scaler
    X_train_sc = scaler.transform(X_train).astype(np.float32)
    X_test_sc  = scaler.transform(X_test).astype(np.float32)

    # Soft labels from sklearn model (knowledge distillation)
    y_soft_train = generate_soft_labels(pipeline, X_train)
    y_soft_test  = generate_soft_labels(pipeline, X_test)

    # Build and train Keras surrogate
    keras_model = build_keras_model()
    keras_model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="binary_crossentropy",
        metrics=["AUC"],
    )

    print("Training Keras surrogate model...")
    keras_model.fit(
        X_train_sc, y_soft_train,
        validation_data=(X_test_sc, y_soft_test),
        epochs=40,
        batch_size=32,
        verbose=1,
    )

    # Save Keras model
    keras_path = os.path.join(OUTPUT_DIR, "surrogate_model")
    keras_model.save(keras_path)
    print(f"\nKeras model saved → {keras_path}")

    # Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_saved_model(keras_path)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]   # dynamic range quant
    tflite_model = converter.convert()

    tflite_path = os.path.join(OUTPUT_DIR, "model.tflite")
    with open(tflite_path, "wb") as f:
        f.write(tflite_model)
    size_kb = os.path.getsize(tflite_path) / 1024
    print(f"TFLite model saved → {tflite_path} ({size_kb:.1f} KB)")

    # Save scaler params for on-device normalisation
    scaler_meta = {
        "mean": scaler.mean_.tolist(),
        "scale": scaler.scale_.tolist(),
        "feature_cols": FEATURE_COLS,
    }
    meta_path = os.path.join(OUTPUT_DIR, "scaler_meta.json")
    with open(meta_path, "w") as f:
        json.dump(scaler_meta, f, indent=2)
    print(f"Scaler metadata saved → {meta_path}")


if __name__ == "__main__":
    export()