"""
DeepSense-MH — ML Training Pipeline
Trains RF, XGBoost, SVM + exports the best model for TFLite conversion.
Run: python -m ml_training.train
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed", "features.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURE_COLS = [
    "step_count",
    "sedentary_minutes",
    "sleep_duration_hours",
    "sleep_midpoint_hour",
    "sleep_disruptions",
    "radius_of_gyration",
    "home_stay_pct",
    "location_entropy",
    "circadian_rhythm_index",
    "screen_unlocks",
    "call_frequency",
    "ambient_light_mean",
]
LABEL_COL = "depressed"


def load_data():
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_COLS].values
    y = df[LABEL_COL].values
    return X, y


def apply_smote(X_train, y_train):
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X_train, y_train)
    print(f"  After SMOTE: {np.bincount(y_res.astype(int))}")
    return X_res, y_res


def build_pipelines():
    return {
        "RandomForest": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(
                n_estimators=200,
                max_depth=8,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1,
            )),
        ]),
        "XGBoost": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.05,
                use_label_encoder=False,
                eval_metric="logloss",
                random_state=42,
            )),
        ]),
        "SVM": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(
                kernel="rbf",
                C=1.0,
                probability=True,
                class_weight="balanced",
                random_state=42,
            )),
        ]),
    }


def train():
    print("=== DeepSense-MH Training Pipeline ===\n")
    X, y = load_data()
    print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features")
    print(f"Class distribution: {np.bincount(y.astype(int))}\n")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    X_train_res, y_train_res = apply_smote(X_train, y_train)

    pipelines = build_pipelines()
    results = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, pipe in pipelines.items():
        print(f"\n--- {name} ---")
        cv_auc = cross_val_score(pipe, X_train_res, y_train_res, cv=cv, scoring="roc_auc")
        print(f"  CV AUC: {cv_auc.mean():.4f} ± {cv_auc.std():.4f}")

        pipe.fit(X_train_res, y_train_res)
        y_pred = pipe.predict(X_test)
        y_prob = pipe.predict_proba(X_test)[:, 1]
        test_auc = roc_auc_score(y_test, y_prob)

        print(f"  Test AUC: {test_auc:.4f}")
        print(classification_report(y_test, y_pred, target_names=["Non-depressed", "Depressed"]))

        results[name] = {"cv_auc": cv_auc.mean(), "test_auc": test_auc, "pipeline": pipe}

    # Save best model
    best_name = max(results, key=lambda k: results[k]["test_auc"])
    best_pipe = results[best_name]["pipeline"]
    print(f"\n✅ Best model: {best_name} (Test AUC: {results[best_name]['test_auc']:.4f})")

    model_path = os.path.join(MODEL_DIR, "best_model.pkl")
    joblib.dump(best_pipe, model_path)
    print(f"   Saved → {model_path}")

    meta = {
        "best_model": best_name,
        "feature_cols": FEATURE_COLS,
        "results": {k: {"cv_auc": v["cv_auc"], "test_auc": v["test_auc"]} for k, v in results.items()},
    }
    with open(os.path.join(MODEL_DIR, "training_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    return best_pipe


if __name__ == "__main__":
    train()