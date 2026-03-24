import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    roc_curve,
    ConfusionMatrixDisplay
)
from sklearn.model_selection import train_test_split
from train import load_data, FEATURE_COLS, LABEL_COL

MODEL_PATH  = "models/random_forest.pkl"
REPORT_PATH = "reports/"

import os
os.makedirs(REPORT_PATH, exist_ok=True)


def load_model(path: str = MODEL_PATH):
    with open(path, "rb") as f:
        return pickle.load(f)


def evaluate(pipeline, X_test, y_test):
    y_pred      = pipeline.predict(X_test)
    y_pred_prob = pipeline.predict_proba(X_test)[:, 1]

    print("\n=== Classification Report ===")
    print(classification_report(y_test, y_pred, target_names=["Not Depressed", "Depressed"]))

    auc = roc_auc_score(y_test, y_pred_prob)
    print(f"AUC-ROC: {auc:.4f}")

    return y_pred, y_pred_prob


def plot_confusion_matrix(y_test, y_pred):
    cm  = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots(figsize=(6, 5))
    disp = ConfusionMatrixDisplay(cm, display_labels=["Not Depressed", "Depressed"])
    disp.plot(ax=ax, cmap="Blues")
    ax.set_title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig(f"{REPORT_PATH}confusion_matrix.png", dpi=150)
    print(f"Saved confusion matrix → {REPORT_PATH}confusion_matrix.png")
    plt.close()


def plot_roc_curve(y_test, y_pred_prob):
    fpr, tpr, _ = roc_curve(y_test, y_pred_prob)
    auc         = roc_auc_score(y_test, y_pred_prob)

    plt.figure(figsize=(7, 5))
    plt.plot(fpr, tpr, label=f"AUC = {auc:.3f}", color="steelblue", lw=2)
    plt.plot([0, 1], [0, 1], "k--", lw=1)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve — Depression Risk Classifier")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(f"{REPORT_PATH}roc_curve.png", dpi=150)
    print(f"Saved ROC curve → {REPORT_PATH}roc_curve.png")
    plt.close()


def plot_feature_importance(pipeline, feature_names):
    rf   = pipeline.named_steps["clf"]
    imps = rf.feature_importances_
    idx  = np.argsort(imps)[::-1]

    plt.figure(figsize=(10, 6))
    sns.barplot(
        x = imps[idx],
        y = [feature_names[i] for i in idx],
        palette = "Blues_r"
    )
    plt.title("Feature Importances — Random Forest")
    plt.xlabel("Importance Score")
    plt.tight_layout()
    plt.savefig(f"{REPORT_PATH}feature_importance.png", dpi=150)
    print(f"Saved feature importance → {REPORT_PATH}feature_importance.png")
    plt.close()


if __name__ == "__main__":
    X, y        = load_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    pipeline            = load_model()
    y_pred, y_pred_prob = evaluate(pipeline, X_test, y_test)

    plot_confusion_matrix(y_test, y_pred)
    plot_roc_curve(y_test, y_pred_prob)
    plot_feature_importance(pipeline, FEATURE_COLS)