"""
Unit tests for AnomalyEvaluator in Phase 3.2.
Verifies metric formulas, confusion matrix calculations, ROC/PR curves, single-class handling, and F2 threshold tuning.
"""

import numpy as np
import pandas as pd
import pytest

from ml.anomaly_detection.config import FEATURE_COLUMNS
from ml.anomaly_detection.detector import TelemetryIsolationForest
from ml.anomaly_detection.evaluator import AnomalyEvaluator


def test_evaluator_metrics_computation() -> None:
    """Verify evaluation metric calculations against known ground truth."""
    # 6 true anomalies (1), 4 true normals (0)
    y_true = np.array([1, 1, 1, 1, 1, 1, 0, 0, 0, 0])
    # Predictions:
    # 5 TP (indices 0..4), 1 FN (index 5)
    # 3 TN (indices 6..8), 1 FP (index 9)
    y_pred = np.array([1, 1, 1, 1, 1, 0, 0, 0, 0, 1])
    y_scores = np.array([0.9, 0.8, 0.7, 0.6, 0.5, 0.2, -0.4, -0.3, -0.2, 0.3])

    res = AnomalyEvaluator.evaluate_predictions(y_true, y_pred, y_scores, beta=2.0)

    cm = res["confusion_matrix"]
    assert cm["true_positives"] == 5
    assert cm["false_negatives"] == 1
    assert cm["true_negatives"] == 3
    assert cm["false_positives"] == 1

    # Accuracy: (5 + 3) / 10 = 0.80
    assert res["accuracy"] == 0.80
    # Precision: 5 / (5 + 1) = 5/6 = 0.8333
    assert round(res["precision"], 2) == 0.83
    # Recall: 5 / (5 + 1) = 5/6 = 0.8333
    assert round(res["recall"], 2) == 0.83
    # F1 score: 0.8333
    assert round(res["f1_score"], 2) == 0.83
    # F2 score: 5 * (P * R) / (4*P + R) = 0.8333
    assert round(res["f2_score"], 2) == 0.83

    # ROC-AUC should be high because high scores align with positive class
    assert res["roc_auc"] is not None
    assert res["roc_auc"] > 0.85
    assert res["pr_auc"] is not None


def test_evaluator_single_class_edge_case() -> None:
    """Verify single-class inputs (all normals) are handled without raising exceptions."""
    y_true_all_normal = np.array([0, 0, 0, 0, 0])
    y_pred = np.array([0, 0, 1, 0, 0])  # 4 TN, 1 FP

    res = AnomalyEvaluator.evaluate_predictions(y_true_all_normal, y_pred)
    assert res["total_anomalies_actual"] == 0
    assert res["total_normals_actual"] == 5
    assert res["confusion_matrix"]["true_negatives"] == 4
    assert res["confusion_matrix"]["false_positives"] == 1
    assert res["confusion_matrix"]["true_positives"] == 0
    assert res["confusion_matrix"]["false_negatives"] == 0
    # ROC-AUC is undefined for single class, evaluator must return None safely
    assert res["roc_auc"] is None


def test_evaluator_threshold_tuning() -> None:
    """Verify tune_threshold evaluates candidates and selects cutoff maximizing F2."""
    # Create synthetic dataset with clear bimodal scores
    rows = []
    for i in range(40):
        # Normal
        r = {f: 10.0 for f in FEATURE_COLUMNS}
        r["scenario_label"] = "normal"
        rows.append(r)
    for i in range(40):
        # Fault
        r = {f: 90.0 for f in FEATURE_COLUMNS}
        r["scenario_label"] = "congestion"
        rows.append(r)

    val_df = pd.DataFrame(rows)

    detector = TelemetryIsolationForest(random_state=42, n_estimators=30)
    detector.fit(val_df)

    best_thresh, summary = AnomalyEvaluator.tune_threshold(detector, val_df, beta=2.0, num_candidates=20)

    assert isinstance(best_thresh, float)
    assert "best_f_beta_score" in summary
    assert summary["best_f_beta_score"] > 0.80
    assert "validation_metrics_at_threshold" in summary
