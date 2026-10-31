"""
XGBoost multi-class fault classifier for network telemetry fault diagnosis.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb

from ml.fault_classification.config import (
    DEFAULT_HYPERPARAMETERS,
    FEATURE_COLUMNS,
    INDEX_TO_LABEL,
    LABEL_TO_INDEX,
    TARGET_CLASSES,
)
from ml.fault_classification.feature_selector import FaultFeatureSelector


class TelemetryXGBoostClassifier:
    """
    Supervised XGBoost multi-class classifier predicting 7 distinct network fault categories:
    normal, congestion, dns_dhcp_failure, hardware_failure, weak_wifi, interface_fault, latency_spike.
    """

    MODEL_VERSION = "1.0.0"

    def __init__(
        self,
        n_estimators: int = 120,
        max_depth: int = 5,
        learning_rate: float = 0.08,
        subsample: float = 0.85,
        colsample_bytree: float = 0.85,
        random_state: int = 42,
        **kwargs: Any,
    ) -> None:
        self.hyperparameters = {
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "learning_rate": learning_rate,
            "subsample": subsample,
            "colsample_bytree": colsample_bytree,
            "objective": "multi:softprob",
            "eval_metric": "mlogloss",
            "random_state": random_state,
            "n_jobs": -1,
            **kwargs,
        }

        self.model = xgb.XGBClassifier(**self.hyperparameters)
        self.selector = FaultFeatureSelector()
        self.is_fitted: bool = False
        self.fitted_at: Optional[str] = None
        self.training_samples_count: int = 0
        self.class_labels: List[str] = list(TARGET_CLASSES)

    def fit(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray],
        eval_set: Optional[List[tuple]] = None,
        verbose: bool = False,
    ) -> "TelemetryXGBoostClassifier":
        """
        Fits the XGBoost classifier on supervised feature matrix and labels.
        """
        if isinstance(X, pd.DataFrame):
            X_mat = self.selector.transform(X).to_numpy(dtype=float)
        else:
            X_mat = np.asarray(X, dtype=float)

        y_arr = np.asarray(y, dtype=int)

        if len(X_mat) == 0:
            raise ValueError("Cannot fit model on empty feature matrix.")
        if len(X_mat) != len(y_arr):
            raise ValueError(
                f"Feature matrix length ({len(X_mat)}) != labels length ({len(y_arr)})."
            )

        unique_classes = np.unique(y_arr)
        if len(unique_classes) < 2:
            raise ValueError(
                f"Training data must contain multiple classes, found {len(unique_classes)}."
            )

        self.model.fit(X_mat, y_arr, eval_set=eval_set, verbose=verbose)
        self.is_fitted = True
        self.fitted_at = datetime.now(timezone.utc).isoformat()
        self.training_samples_count = len(X_mat)
        return self

    def predict_proba(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Predicts class probabilities for input telemetry records.
        Returns shape (N, num_classes).
        """
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() or load() first.")

        if isinstance(X, pd.DataFrame):
            X_mat = self.selector.transform(X).to_numpy(dtype=float)
        else:
            X_mat = np.asarray(X, dtype=float)

        return self.model.predict_proba(X_mat)

    def predict(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Predicts integer class labels.
        """
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)

    def predict_labels(self, X: Union[pd.DataFrame, np.ndarray]) -> List[str]:
        """
        Predicts canonical scenario label strings.
        """
        class_indices = self.predict(X)
        return [INDEX_TO_LABEL.get(idx, "unknown") for idx in class_indices]

    def predict_structured(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        top_k: int = 3,
        uncertainty_threshold: float = 0.50,
    ) -> List[Dict[str, Any]]:
        """
        Returns structured diagnostic predictions with confidence, alternative hypotheses,
        and uncertainty flagging when the top confidence is below threshold.
        """
        probs = self.predict_proba(X)
        results = []

        feature_importances = self.get_feature_importances()

        for prob_vec in probs:
            sorted_indices = np.argsort(prob_vec)[::-1]
            top_idx = int(sorted_indices[0])
            top_prob = float(prob_vec[top_idx])
            top_label = INDEX_TO_LABEL.get(top_idx, "unknown")

            class_probs = {
                INDEX_TO_LABEL[idx]: round(float(prob_vec[idx]), 4)
                for idx in range(len(TARGET_CLASSES))
            }

            alternatives = []
            for alt_rank in range(1, min(top_k + 1, len(TARGET_CLASSES))):
                alt_idx = int(sorted_indices[alt_rank])
                alt_prob = float(prob_vec[alt_idx])
                if alt_prob > 0.01:  # Only report plausible alternatives
                    alternatives.append({
                        "fault": INDEX_TO_LABEL.get(alt_idx, "unknown"),
                        "probability": round(alt_prob, 4),
                        "margin_to_primary": round(top_prob - alt_prob, 4),
                    })

            is_uncertain = top_prob < uncertainty_threshold

            results.append({
                "predicted_fault": top_label,
                "confidence": round(top_prob, 4),
                "is_uncertain": is_uncertain,
                "model_version": self.MODEL_VERSION,
                "class_probabilities": class_probs,
                "top_alternative_faults": alternatives,
                "top_contributing_features": list(feature_importances.keys())[:5],
            })

        return results

    def get_feature_importances(self) -> Dict[str, float]:
        """
        Returns normalized feature importances from the fitted XGBoost model.
        """
        if not self.is_fitted:
            return {}

        importances = self.model.feature_importances_
        feature_dict = {
            FEATURE_COLUMNS[i]: round(float(importances[i]), 6)
            for i in range(len(FEATURE_COLUMNS))
        }
        return dict(sorted(feature_dict.items(), key=lambda x: x[1], reverse=True))

    def save(self, filepath: Union[str, Path]) -> None:
        """
        Persists the fitted classifier to disk using joblib.
        """
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "model": self.model,
                "hyperparameters": self.hyperparameters,
                "is_fitted": self.is_fitted,
                "fitted_at": self.fitted_at,
                "training_samples_count": self.training_samples_count,
                "class_labels": self.class_labels,
                "feature_columns": FEATURE_COLUMNS,
                "model_version": self.MODEL_VERSION,
            },
            path,
        )

    @classmethod
    def load(cls, filepath: Union[str, Path]) -> "TelemetryXGBoostClassifier":
        """
        Loads a serialized classifier from disk.
        """
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Model file not found at {path}")

        data = joblib.load(path)
        instance = cls(**data.get("hyperparameters", {}))
        instance.model = data["model"]
        instance.is_fitted = data["is_fitted"]
        instance.fitted_at = data["fitted_at"]
        instance.training_samples_count = data["training_samples_count"]
        instance.class_labels = data.get("class_labels", list(TARGET_CLASSES))
        return instance

    def get_metadata(self) -> Dict[str, Any]:
        """
        Returns model metadata dictionary for serialization and auditing.
        """
        return {
            "model_type": "XGBoostClassifier",
            "algorithm": "xgboost.XGBClassifier",
            "model_version": self.MODEL_VERSION,
            "is_fitted": self.is_fitted,
            "fitted_at": self.fitted_at,
            "training_samples_count": self.training_samples_count,
            "target_classes": TARGET_CLASSES,
            "feature_columns": FEATURE_COLUMNS,
            "feature_count": len(FEATURE_COLUMNS),
            "hyperparameters": {
                k: v for k, v in self.hyperparameters.items() if k != "n_jobs"
            },
            "dependency_versions": {
                "xgboost": xgb.__version__,
                "scikit-learn": "1.9.1",
                "joblib": joblib.__version__,
            },
        }
