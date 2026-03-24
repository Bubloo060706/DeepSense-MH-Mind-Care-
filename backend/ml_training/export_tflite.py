import pickle
import numpy as np
import os
import json

MODEL_PATH   = "models/random_forest.pkl"
TFLITE_PATH  = "models/model.tflite"
METADATA_PATH = "models/model_metadata.json"

"""
sklearn RandomForest → TFLite conversion pipeline.

Strategy:
  1. Load trained sklearn pipeline (scaler + RF)
  2. Wrap inference in a TensorFlow @tf.function
  3. Convert to TFLite FlatBuffer
  4. Save metadata (feature order, threshold) alongside

Note: TFLite does not natively support sklearn.
We use tf-df (TensorFlow Decision Forests) for RF export,
or alternatively wrap the sklearn model in a TF Keras model
using a Lambda layer for small prototypes.
"""

def load_sklearn_pipeline(path: str):
    with open(path, "rb") as f:
        return pickle.load(f)


def export_via_tf_savedmodel(pipeline, output_dir: str = "models/saved_model"):
    """
    Wraps sklearn pipeline predict_proba in a TF SavedModel,
    then converts to TFLite.
    """
    import tensorflow as tf

    scaler = pipeline.named_steps["scaler"]
    clf    = pipeline.named_steps["clf"]

    # Precompute scaler params as TF constants
    mean  = tf.constant(scaler.mean_,  dtype=tf.float32)
    scale = tf.constant(scaler.scale_, dtype=tf.float32)

    # Approximate RF using leaf value lookup via numpy (prototype approach)
    # For production: use tf-df or ONNX → TFLite pipeline
    class RFWrapper(tf.Module):
        def __init__(self, mean, scale, sklearn_clf):
            self.mean  = mean
            self.scale = scale
            self._clf  = sklearn_clf

        @tf.function(input_signature=[
            tf.TensorSpec(shape=[1, 17], dtype=tf.float32, name="features")
        ])
        def predict(self, features):
            scaled = (features - self.mean) / self.scale
            # Call sklearn inside tf.py_function for prototype
            def _infer(x):
                prob = self._clf.predict_proba(x.numpy())[0][1]
                return np.array([[prob]], dtype=np.float32)

            result = tf.py_function(_infer, [scaled], tf.float32)
            result.set_shape([1, 1])
            return result

    wrapper = RFWrapper(mean, scale, clf)
    tf.saved_model.save(wrapper, output_dir)
    print(f"SavedModel saved to {output_dir}")

    # Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_saved_model(output_dir)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    os.makedirs(os.path.dirname(TFLITE_PATH), exist_ok=True)
    with open(TFLITE_PATH, "wb") as f:
        f.write(tflite_model)

    print(f"TFLite model saved to {TFLITE_PATH} ({len(tflite_model)/1024:.1f} KB)")
    return tflite_model


def save_metadata(pipeline, feature_cols: list):
    scaler   = pipeline.named_steps["scaler"]
    metadata = {
        "feature_names":  feature_cols,
        "num_features":   len(feature_cols),
        "scaler_mean":    scaler.mean_.tolist(),
        "scaler_scale":   scaler.scale_.tolist(),
        "risk_threshold": 0.65,
        "output":         "depression_risk_probability"
    }
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {METADATA_PATH}")


if __name__ == "__main__":
    from train import FEATURE_COLS
    pipeline = load_sklearn_pipeline(MODEL_PATH)
    export_via_tf_savedmodel(pipeline)
    save_metadata(pipeline, FEATURE_COLS)