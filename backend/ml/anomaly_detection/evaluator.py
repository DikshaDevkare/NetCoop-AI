"""
Evaluation and Threshold Tuning Engine for NetCoop AI Anomaly Detection.
"""

from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    fbeta_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from ml.anomaly_detection.config import DEFAULT_F_BETA, DEFAULT_THRESHOLD_CANDIDATES


class AnomalyEvaluator:
    """
    Computes rigorous evaluation metrics and tunes decision thresholds for anomaly detection.
    """

    @classmethod
    def evaluate_predictions(
        cls,
        y_true: Union[np.ndarray, List[int]],
        y_pred: Union[np.ndarray, List[int]],
        y_scores: Optional[Union[np.ndarray, List[float]]] = None,
        beta: float = DEFAULT_F_BETA,
    ) -> Dict[str, Any]:
        """
        Compute binary classification metrics for anomaly detection.

        Convention:
            1 = Anomaly (Positive Class)
            0 = Normal (Negative Class)

        Args:
            y_true: Ground truth binary labels (0 or 1).
            y_pred: Predicted binary labels (0 or 1).
            y_scores: Optional continuous anomaly scores for ROC-AUC and PR-AUC.
            beta: Beta weight for F-beta score (default 2.0).

        Returns:
            Dictionary containing metrics and confusion matrix elements.
        """
        y_true = np.asarray(y_true, dtype=int)
        y_pred = np.asarray(y_pred, dtype=int)

        # Confusion Matrix
        # [[TN, FP], [FN, TP]]
        if len(np.unique(y_true)) == 1:
            # Single class edge case
            single_val = y_true[0]
            if single_val == 0:
                tn = int(np.sum(y_pred == 0))
                fp = int(np.sum(y_pred == 1))
                fn, tp = 0, 0
            else:
                tp = int(np.sum(y_pred == 1))
                fn = int(np.sum(y_pred == 0))
                tn, fp = 0, 0
        else:
            tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
            tn, fp, fn, tp = int(tn), int(fp), int(fn), int(tp)

        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0.0))
        rec = float(recall_score(y_true, y_pred, zero_division=0.0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0.0))
        f2 = float(fbeta_score(y_true, y_pred, beta=beta, zero_division=0.0))

        # ROC-AUC and PR-AUC
        roc_auc: Optional[float] = None
        pr_auc: Optional[float] = None

        if y_scores is not None and len(np.unique(y_true)) > 1:
            scores_arr = np.asarray(y_scores, dtype=float)
            try:
                roc_auc = float(roc_auc_score(y_true, scores_arr))
                pr_auc = float(average_precision_score(y_true, scores_arr))
            except Exception:
                roc_auc = None
                pr_auc = None

        return {
            "total_samples": len(y_true),
            "total_anomalies_actual": int(np.sum(y_true == 1)),
            "total_normals_actual": int(np.sum(y_true == 0)),
            "confusion_matrix": {
                "true_positives": tp,
                "false_positives": fp,
                "true_negatives": tn,
                "false_negatives": fn,
            },
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            f"f{int(beta)}_score": round(f2, 4),
            "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
            "pr_auc": round(pr_auc, 4) if pr_auc is not None else None,
        }

    @classmethod
    def tune_threshold(
        cls,
        detector: Any,
        val_df: pd.DataFrame,
        beta: float = DEFAULT_F_BETA,
        num_candidates: int = DEFAULT_THRESHOLD_CANDIDATES,
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Evaluate candidate thresholds on validation data to select the optimal cutoff.
        Primary objective: Maximize F2-score to prioritize fault recall while maintaining precision.

        Args:
            detector: Fitted TelemetryIsolationForest instance.
            val_df: Validation DataFrame containing features and 'scenario_label'.
            beta: Beta parameter for F-beta score (default 2.0).
            num_candidates: Number of threshold evaluation points.

        Returns:
            Tuple of (optimal_threshold, validation_tuning_summary_dict).
        """
        if "scenario_label" not in val_df.columns:
            raise ValueError("Validation DataFrame must contain 'scenario_label' to derive ground truth.")

        y_true = (val_df["scenario_label"] != "normal").astype(int).to_numpy()
        scores = detector.anomaly_scores(val_df)

        # Check edge case: single class
        if len(np.unique(y_true)) < 2:
            default_t = 0.0
            metrics = cls.evaluate_predictions(y_true, (scores >= default_t).astype(int), scores, beta=beta)
            return default_t, {
                "best_threshold": default_t,
                "tuning_metric": f"F{int(beta)}_score",
                "best_score": metrics[f"f{int(beta)}_score"],
                "note": "Single-class validation set; defaulted to 0.0 threshold.",
                "metrics": metrics,
            }

        # Generate candidate thresholds across the score distribution percentiles
        percentiles = np.linspace(1, 99, num_candidates)
        candidate_thresholds = np.percentile(scores, percentiles)
        candidate_thresholds = np.unique(candidate_thresholds)

        best_threshold = 0.0
        best_fbeta = -1.0
        best_metrics: Dict[str, Any] = {}

        for t in candidate_thresholds:
            y_pred = (scores >= t).astype(int)
            current_fbeta = fbeta_score(y_true, y_pred, beta=beta, zero_division=0.0)

            if current_fbeta > best_fbeta:
                best_fbeta = current_fbeta
                best_threshold = float(t)

        # Re-evaluate full metrics at the chosen threshold
        final_preds = (scores >= best_threshold).astype(int)
        best_metrics = cls.evaluate_predictions(y_true, final_preds, scores, beta=beta)

        summary = {
            "selected_threshold": round(best_threshold, 6),
            "tuning_objective": f"Maximize F{int(beta)}_score (prioritizing fault recall)",
            "beta": beta,
            "best_f_beta_score": round(best_fbeta, 4),
            "candidates_evaluated": len(candidate_thresholds),
            "validation_metrics_at_threshold": best_metrics,
        }

        return best_threshold, summary
