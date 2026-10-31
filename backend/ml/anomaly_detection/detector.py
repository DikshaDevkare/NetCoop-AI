"""
Isolation Forest Detector for Network Telemetry Anomaly Detection.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from ml.anomaly_detection.config import (
    DEFAULT_CONTAMINATION,
    DEFAULT_MAX_FEATURES,
    DEFAULT_MAX_SAMPLES,
    DEFAULT_N_ESTIMATORS,
    DEFAULT_RANDOM_STATE,
    FEATURE_COLUMNS,
)
from ml.anomaly_detection.feature_selector import TelemetryFeatureSelector


class TelemetryIsolationForest:
    """
    Production-grade Isolation Forest anomaly detector trained on clean normal telemetry.
    Adheres strictly to the convention: higher anomaly scores indicate higher abnormality.
    """

    def __init__(
        self,
        n_estimators: int = DEFAULT_N_ESTIMATORS,
        max_samples: Union[str, int, float] = DEFAULT_MAX_SAMPLES,
        max_features: Union[int, float] = DEFAULT_MAX_FEATURES,
        contamination: Union[str, float] = DEFAULT_CONTAMINATION,
        random_state: Optional[int] = DEFAULT_RANDOM_STATE,
        threshold: float = 0.0,
        feature_columns: Optional[List[str]] = None,
    ):
        self.n_estimators = n_estimators
        self.max_samples = max_samples
        self.max_features = max_features
        self.contamination = contamination
        self.random_state = random_state
        self.threshold = threshold
        self.feature_columns = list(feature_columns) if feature_columns else list(FEATURE_COLUMNS)

        self.feature_selector = TelemetryFeatureSelector(feature_columns=self.feature_columns)
        self.model: Optional[IsolationForest] = None
        self.is_fitted: bool = False
        self.train_samples_count: int = 0
        self.fitted_at: Optional[str] = None
        self.threshold_selection_method: str = "default_zero"

    def fit(self, data: Union[pd.DataFrame, np.ndarray]) -> "TelemetryIsolationForest":
        """
        Fit Isolation Forest strictly on clean normal telemetry records.

        If a DataFrame with 'scenario_label' is provided, it automatically filters for
        scenario_label == 'normal' to prevent fault contamination in the baseline.
        If a numeric matrix is provided, it assumes pre-filtered normal samples.

        Args:
            data: pd.DataFrame or np.ndarray containing training telemetry.

        Returns:
            self: The fitted detector.

        Raises:
            ValueError: If input is empty or contains zero normal records.
        """
        if isinstance(data, pd.DataFrame):
            if data.empty:
                raise ValueError("Training DataFrame is empty; cannot fit model.")

            # Filter for normal baseline if label column exists
            if "scenario_label" in data.columns:
                normal_df = data[data["scenario_label"] == "normal"]
                if normal_df.empty:
                    raise ValueError(
                        "Input training DataFrame contains 0 records where scenario_label == 'normal'. "
                        "The clean baseline Isolation Forest requires healthy normal records for fitting."
                    )
                X = self.feature_selector.transform(normal_df)
            else:
                X = self.feature_selector.transform(data)
        elif isinstance(data, np.ndarray):
            if data.size == 0 or len(data) == 0:
                raise ValueError("Training array is empty; cannot fit model.")
            if np.isnan(data).any() or np.isinf(data).any():
                raise ValueError("Training array contains NaN or Inf values.")
            X = data
        else:
            raise TypeError(f"Unsupported data type for fit: {type(data).__name__}")

        if len(X) == 0:
            raise ValueError("Zero valid training samples available after feature extraction.")

        # Initialize scikit-learn IsolationForest
        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            max_samples=self.max_samples,
            max_features=self.max_features,
            contamination=self.contamination,
            random_state=self.random_state,
            n_jobs=-1,
        )

        self.model.fit(X)
        self.is_fitted = True
        self.train_samples_count = int(len(X))
        self.fitted_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        return self

    def _prepare_matrix(self, data: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """Internal helper to extract and validate 2D feature matrix."""
        if not self.is_fitted or self.model is None:
            raise RuntimeError("Model is not fitted yet. Call fit() before scoring or predicting.")

        if isinstance(data, pd.DataFrame):
            return self.feature_selector.transform(data)
        elif isinstance(data, np.ndarray):
            if np.isnan(data).any() or np.isinf(data).any():
                raise ValueError("Input feature array contains NaN or Inf values.")
            if data.ndim == 1:
                return data.reshape(1, -1)
            return data
        else:
            raise TypeError(f"Unsupported input data type: {type(data).__name__}")

    def score_samples(self, data: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Compute scikit-learn raw decision_function scores.
        (Positive = inlier, Negative = outlier).
        """
        X = self._prepare_matrix(data)
        return self.model.decision_function(X)

    def anomaly_scores(self, data: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Compute continuous anomaly score where higher score indicates higher abnormality.
        Defined as the negative decision_function: S(x) = -decision_function(x).

        Inlier/normal points typically yield S(x) < 0.
        Outlier/anomalous points typically yield S(x) > 0.
        """
        raw_scores = self.score_samples(data)
        return -raw_scores

    def predict_raw(self, data: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Return standard scikit-learn discrete predictions:
        +1 for inlier / normal, -1 for outlier / anomalous.
        """
        X = self._prepare_matrix(data)
        return self.model.predict(X)

    def predict(
        self,
        data: Union[pd.DataFrame, np.ndarray],
        threshold: Optional[float] = None,
    ) -> np.ndarray:
        """
        Predict application-level binary anomaly labels:
        1 = Anomalous / Fault, 0 = Normal / Healthy.

        Args:
            data: Telemetry data (DataFrame or numpy array).
            threshold: Optional decision threshold. If None, uses self.threshold.

        Returns:
            np.ndarray of integers (0 or 1).
        """
        cutoff = self.threshold if threshold is None else threshold
        scores = self.anomaly_scores(data)
        return (scores >= cutoff).astype(int)

    def set_threshold(self, threshold: float, selection_method: str = "validation_f2_tuning") -> None:
        """Update decision threshold from validation tuning."""
        self.threshold = float(threshold)
        self.threshold_selection_method = selection_method

    def save(self, filepath: Union[str, Path]) -> Path:
        """Serialize detector to joblib file."""
        if not self.is_fitted or self.model is None:
            raise RuntimeError("Cannot save an unfitted model.")

        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, path)
        return path

    @classmethod
    def load(cls, filepath: Union[str, Path]) -> "TelemetryIsolationForest":
        """Deserialize detector from joblib file."""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Model file does not exist: {path}")

        detector = joblib.load(path)
        if not isinstance(detector, cls):
            raise TypeError(f"Loaded object is not a TelemetryIsolationForest instance: {type(detector)}")
        return detector

    def get_metadata(self) -> Dict[str, Any]:
        """Return full model metadata dictionary without storing raw telemetry."""
        import sklearn

        return {
            "model_type": "IsolationForest",
            "algorithm": "sklearn.ensemble.IsolationForest",
            "is_fitted": self.is_fitted,
            "fitted_at": self.fitted_at,
            "training_samples_count": self.train_samples_count,
            "training_filter": "scenario_label == 'normal'",
            "feature_columns": self.feature_columns,
            "feature_count": len(self.feature_columns),
            "hyperparameters": {
                "n_estimators": self.n_estimators,
                "max_samples": self.max_samples,
                "max_features": self.max_features,
                "contamination": self.contamination,
                "random_state": self.random_state,
            },
            "threshold": self.threshold,
            "threshold_selection_method": self.threshold_selection_method,
            "dependency_versions": {
                "scikit-learn": sklearn.__version__,
                "joblib": joblib.__version__,
                "numpy": np.__version__,
            },
        }
