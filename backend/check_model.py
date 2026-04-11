"""
Check what the saved Keras model expects as input
"""
import tensorflow as tf
from pathlib import Path

MODEL_PATH = Path(r"d:\MindCare\backend\ml_training\hybrid_cnn_lstm_model.keras")

if MODEL_PATH.exists():
    print(f"Loading model from: {MODEL_PATH}")
    model = tf.keras.models.load_model(str(MODEL_PATH))
    
    print("\n" + "="*60)
    print("MODEL ARCHITECTURE & INPUT REQUIREMENTS")
    print("="*60)
    print(f"\nInput Shape: {model.input_shape}")
    print(f"Output Shape: {model.output_shape}")
    print(f"\nModel Summary:")
    model.summary()
    
    print("\n" + "="*60)
    print("EXAMPLE INPUT")
    print("="*60)
    print(f"Expected input: Array of shape {model.input_shape}")
    print(f"  - Batch size: {model.input_shape[0]}")
    print(f"  - Timesteps/Features: {model.input_shape[1]}")
    print(f"  - Channels: {model.input_shape[2]}")
    
else:
    print(f"Model not found at: {MODEL_PATH}")
