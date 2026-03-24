import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score

DATA_PATH  = "data/processed/features.csv"
MODEL_PATH = "models/random_forest.pkl"
LABEL_COL  = "phq_label"   # 0 = not depressed, 1 = depressed (PHQ-9 >= 10)

FEATURE_COLS = [
    # Location features
    "radius_of_gyration",
    "home_stay_pct",
    "location_entropy",
    "num_places_visited",

    # Movement features
    "daily_step_count",
    "sedentary_bout_count",
    "sedentary_total_mins",

    # Circadian rhythm
    "circadian_index",
    "interdaily_stability",
    "intradaily_variability",

    # Sleep features
    "sleep_duration_hrs",
    "sleep_midpoint_hr",
    "sleep_disruption_count",

    # Social features
    "call_frequency",
    "call_duration_avg",
    "screen_unlock_count",
    "screen_on_duration_mins"
]


def load_data():
    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=FEATURE_COLS + [LABEL_COL])

    X = df[FEATURE_COLS].values
    y = df[LABEL_COL].values

    print(f"Loaded {len(df)} samples | Depressed: {y.sum()} | Not: {(y==0).sum()}")
    return X, y


def build_pipeline(model_type: str = "rf") -> Pipeline:
    if model_type == "rf":
        clf = RandomForestClassifier(
            n_estimators = 200,
            max_depth    = 10,
            min_samples_split = 5,
            class_weight = "balanced",
            random_state = 42,
            n_jobs       = -1
        )
    elif model_type == "svm":
        clf = SVC(
            kernel       = "rbf",
            C            = 1.0,
            probability  = True,
            class_weight = "balanced",
            random_state = 42
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")

    return Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    clf)
    ])


def train_and_evaluate(X, y, model_type: str = "rf"):
    pipeline = build_pipeline(model_type)
    cv       = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    results = cross_validate(
        pipeline, X, y,
        cv            = cv,
        scoring       = ["accuracy", "f1", "roc_auc"],
        return_train_score = True
    )

    print(f"\n=== {model_type.upper()} Cross-Validation Results ===")
    print(f"Accuracy : {results['test_accuracy'].mean():.3f} ± {results['test_accuracy'].std():.3f}")
    print(f"F1 Score : {results['test_f1'].mean():.3f} ± {results['test_f1'].std():.3f}")
    print(f"AUC-ROC  : {results['test_roc_auc'].mean():.3f} ± {results['test_roc_auc'].std():.3f}")

    # Fit final model on full data
    pipeline.fit(X, y)
    return pipeline


def save_model(pipeline, path: str = MODEL_PATH):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"\nModel saved to {path}")


if __name__ == "__main__":
    X, y     = load_data()
    pipeline = train_and_evaluate(X, y, model_type="rf")
    save_model(pipeline)