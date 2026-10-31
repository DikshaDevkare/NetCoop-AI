"""
Evaluation utilities and metrics computation for multi-class fault classification.
"""

from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from ml.fault_classification.config import INDEX_TO_LABEL, TARGET_CLASSES


class FaultEvaluator:
    """
    Computes comprehensive multi-class evaluation metrics for fault classification.
    """

    @staticmethod
    def evaluate(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray] = None,
        target_names: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Computes accuracy, precision, recall, F1 (macro and weighted),
        per-class metrics, confusion matrix, and ROC-AUC.
        """
        names = target_names or TARGET_CLASSES

        acc = float(accuracy_score(y_true, y_pred))
        prec_macro = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
        prec_weighted = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
        rec_macro = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
        rec_weighted = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
        f1_macro = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
        f1_weighted = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

        # Confusion Matrix
        cm = confusion_matrix(y_true, y_pred, labels=list(range(len(names))))
        cm_dict = {
            names[i]: {names[j]: int(cm[i, j]) for j in range(len(names))}
            for i in range(len(names))
        }

        # Per-class breakdown
        per_class: Dict[str, Dict[str, Any]] = {}
        report_dict = classification_report(
            y_true,
            y_pred,
            labels=list(range(len(names))),
            target_names=names,
            output_dict=True,
            zero_division=0,
        )

        for name in names:
            if name in report_dict:
                per_class[name] = {
                    "precision": round(float(report_dict[name]["precision"]), 4),
                    "recall": round(float(report_dict[name]["recall"]), 4),
                    "f1_score": round(float(report_dict[name]["f1-score"]), 4),
                    "support": int(report_dict[name]["support"]),
                }

        # Multi-class ROC-AUC (OvR)
        roc_auc: Optional[float] = None
        if y_prob is not None:
            try:
                unique_y = np.unique(y_true)
                if len(unique_y) == len(names):
                    roc_auc = float(
                        roc_auc_score(
                            y_true, y_prob, multi_class="ovr", average="weighted"
                        )
                    )
            except Exception:
                roc_auc = None

        return {
            "total_samples": int(len(y_true)),
            "accuracy": round(acc, 4),
            "precision_macro": round(prec_macro, 4),
            "precision_weighted": round(prec_weighted, 4),
            "recall_macro": round(rec_macro, 4),
            "recall_weighted": round(rec_weighted, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "roc_auc_weighted": round(roc_auc, 4) if roc_auc is not None else None,
            "confusion_matrix": cm_dict,
            "confusion_matrix_raw": cm.tolist(),
            "per_class_metrics": per_class,
        }
