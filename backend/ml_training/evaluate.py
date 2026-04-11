"""
DeepSense-MH — Model Evaluation
Loads saved model and produces full evaluation report with SHAP explanations.
Run: python -m ml_training.evaluate
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    ConfusionMatrixDisplay,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed", "features.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
REPORT_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

FEATURE_COLS = [
    "step_count", "sedentary_minutes", "sleep_duration_hours",
    "sleep_midpoint_hour", "sleep_disruptions", "radius_of_gyration",
    "home_stay_pct", "location_entropy", "circadian_rhythm_index",
    "screen_unlocks", "call_frequency", "ambient_light_mean",
]
LABEL_COL = "depressed"


def load_artifacts():
    model_path = os.path.join(MODEL_DIR, "best_model.pkl")
    meta_path = os.path.join(MODEL_DIR, "training_meta.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError("No trained model found. Run train.py first.")

    pipeline = joblib.load(model_path)
    with open(meta_path) as f:
        meta = json.load(f)
    return pipeline, meta


def load_test_data():
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_COLS].values
    y = df[LABEL_COL].values
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    return X_test, y_test


def plot_roc_curve(y_test, y_prob, model_name):
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    auc = roc_auc_score(y_test, y_prob)

    plt.figure(figsize=(7, 5))
    plt.plot(fpr, tpr, label=f"AUC = {auc:.4f}", linewidth=2)
    plt.plot([0, 1], [0, 1], "k--", linewidth=1)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"ROC Curve — {model_name}")
    plt.legend(loc="lower right")
    plt.tight_layout()
    path = os.path.join(REPORT_DIR, "roc_curve.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  ROC curve saved → {path}")


def plot_confusion_matrix(y_test, y_pred, model_name):
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(cm, display_labels=["Non-depressed", "Depressed"])
    fig, ax = plt.subplots(figsize=(6, 5))
    disp.plot(ax=ax, colorbar=False, cmap="Blues")
    ax.set_title(f"Confusion Matrix — {model_name}")
    plt.tight_layout()
    path = os.path.join(REPORT_DIR, "confusion_matrix.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  Confusion matrix saved → {path}")


def plot_shap_summary(pipeline, X_test):
    """Extract the underlying classifier and run SHAP on scaled features."""
    scaler = pipeline.named_steps["scaler"]
    clf = pipeline.named_steps["clf"]
    X_scaled = scaler.transform(X_test)

    try:
        explainer = shap.TreeExplainer(clf)
    except Exception:
        explainer = shap.KernelExplainer(clf.predict_proba, X_scaled[:50])

    shap_values = explainer.shap_values(X_scaled)

    # For binary classifiers shap_values is a list [class0, class1]
    sv = shap_values[1] if isinstance(shap_values, list) else shap_values

    plt.figure()
    shap.summary_plot(sv, X_scaled, feature_names=FEATURE_COLS, show=False)
    path = os.path.join(REPORT_DIR, "shap_summary.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  SHAP summary saved → {path}")


def evaluate():
    print("=== DeepSense-MH Evaluation Report ===\n")
    pipeline, meta = load_artifacts()
    model_name = meta["best_model"]
    X_test, y_test = load_test_data()

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    auc   = roc_auc_score(y_test, y_prob)
    f1    = f1_score(y_test, y_pred)
    prec  = precision_score(y_test, y_pred)
    rec   = recall_score(y_test, y_pred)

    print(f"Model        : {model_name}")
    print(f"AUC-ROC      : {auc:.4f}")
    print(f"F1-Score     : {f1:.4f}")
    print(f"Precision    : {prec:.4f}")
    print(f"Recall       : {rec:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Non-depressed", "Depressed"]))

    # Plots
    plot_roc_curve(y_test, y_prob, model_name)
    plot_confusion_matrix(y_test, y_pred, model_name)
    plot_shap_summary(pipeline, X_test)

    # Save metrics JSON
    metrics = {
        "model": model_name,
        "auc_roc": auc,
        "f1": f1,
        "precision": prec,
        "recall": rec,
    }
    with open(os.path.join(REPORT_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\n  Metrics JSON saved → {REPORT_DIR}/metrics.json")


if __name__ == "__main__":
    evaluate()