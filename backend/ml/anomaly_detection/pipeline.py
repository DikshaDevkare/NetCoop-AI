"""
End-to-end Anomaly Detection Pipeline for NetCoop AI.
Integrates feature validation, normal-baseline training, validation threshold optimization,
continuous scoring, binary predictions, and model serialization.
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union
import numpy as np
import pandas as pd

from ml.anomaly_detection.config import (
    DEFAULT_F_BETA,
    DEFAULT_THRESHOLD_CANDIDATES,
    METADATA_FILE,
    MODEL_FILE,
    MODELS_DIR,
)
from ml.anomaly_detection.detector import TelemetryIsolationForest
from ml.anomaly_detection.evaluator import AnomalyEvaluator
from ml.anomaly_detection.feature_selector import TelemetryFeatureSelector


class AnomalyDetectionPipeline:
    """
    High-level orchestration pipeline for network telemetry anomaly detection.
    Guarantees clean normal-baseline training, causal threshold tuning, and reproducible inference.
    """

    def __init__(
        self,
        detector: Optional[TelemetryIsolationForest] = None,
        feature_selector: Optional[TelemetryFeatureSelector] = None,
    ):
        self.detector = detector if detector is not None else TelemetryIsolationForest()
        self.feature_selector = feature_selector if feature_selector is not None else TelemetryFeatureSelector()
        self.evaluator = AnomalyEvaluator()
        self.validation_summary: Optional[Dict[str, Any]] = None

    def fit(
        self,
        train_df: pd.DataFrame,
        val_df: Optional[pd.DataFrame] = None,
        tune_threshold: bool = True,
        beta: float = DEFAULT_F_BETA,
        num_candidates: int = DEFAULT_THRESHOLD_CANDIDATES,
    ) -> "AnomalyDetectionPipeline":
        """
        Train Isolation Forest on normal records and tune decision threshold on validation data.

        Args:
            train_df: Training DataFrame containing telemetry records and 'scenario_label'.
            val_df: Optional validation DataFrame for threshold optimization.
            tune_threshold: Whether to tune decision threshold on validation data.
            beta: Beta parameter for F-beta threshold tuning (default 2.0).
            num_candidates: Number of candidate thresholds to test.

        Returns:
            self: The fitted pipeline.
        """
        if not isinstance(train_df, pd.DataFrame):
            raise TypeError(f"train_df must be a pandas DataFrame, got {type(train_df).__name__}")

        if train_df.empty:
            raise ValueError("train_df is empty; cannot fit pipeline.")

        # 1. Fit detector strictly on normal records
        self.detector.fit(train_df)

        # 2. Tune decision threshold on validation data if provided
        if val_df is not None and tune_threshold:
            if not isinstance(val_df, pd.DataFrame):
                raise TypeError(f"val_df must be a pandas DataFrame, got {type(val_df).__name__}")
            if val_df.empty:
                raise ValueError("val_df is empty; cannot tune threshold.")

            best_threshold, tuning_summary = self.evaluator.tune_threshold(
                detector=self.detector,
                val_df=val_df,
                beta=beta,
                num_candidates=num_candidates,
            )
            self.detector.set_threshold(
                threshold=best_threshold,
                selection_method=f"validation_f{int(beta)}_tuning",
            )
            self.validation_summary = tuning_summary

        return self

    def anomaly_scores(self, df: pd.DataFrame) -> np.ndarray:
        """
        Compute continuous anomaly scores for telemetry records.
        Higher scores indicate greater degree of abnormality.
        """
        return self.detector.anomaly_scores(df)

    def predict(
        self,
        df: pd.DataFrame,
        threshold: Optional[float] = None,
    ) -> np.ndarray:
        """
        Generate application-level binary anomaly predictions:
        1 = Anomalous / Fault, 0 = Normal / Healthy.
        """
        return self.detector.predict(df, threshold=threshold)

    def predict_with_scores(
        self,
        df: pd.DataFrame,
        threshold: Optional[float] = None,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Return both application binary predictions and continuous anomaly scores.

        Returns:
            Tuple of (binary_predictions_array, anomaly_scores_array).
        """
        scores = self.anomaly_scores(df)
        cutoff = self.detector.threshold if threshold is None else threshold
        predictions = (scores >= cutoff).astype(int)
        return predictions, scores

    def evaluate(
        self,
        df: pd.DataFrame,
        threshold: Optional[float] = None,
        beta: float = DEFAULT_F_BETA,
    ) -> Dict[str, Any]:
        """
        Evaluate anomaly detection performance on labelled telemetry data.

        Ground truth convention:
            scenario_label == 'normal' -> 0 (Normal)
            scenario_label != 'normal' -> 1 (Anomaly)
        """
        if "scenario_label" not in df.columns:
            raise ValueError("Evaluation DataFrame must contain 'scenario_label' column.")

        y_true = (df["scenario_label"] != "normal").astype(int).to_numpy()
        preds, scores = self.predict_with_scores(df, threshold=threshold)

        return self.evaluator.evaluate_predictions(
            y_true=y_true,
            y_pred=preds,
            y_scores=scores,
            beta=beta,
        )

    def save(
        self,
        models_dir: Optional[Union[str, Path]] = None,
        model_filename: str = "isolation_forest.joblib",
        metadata_filename: str = "model_metadata.json",
    ) -> Dict[str, Path]:
        """
        Serialize detector and export model metadata.
        Uses safe write semantics to prevent file corruption.
        """
        out_dir = Path(models_dir) if models_dir is not None else MODELS_DIR
        out_dir.mkdir(parents=True, exist_ok=True)

        model_path = out_dir / model_filename
        metadata_path = out_dir / metadata_filename

        # Save model joblib
        self.detector.save(model_path)

        # Build comprehensive metadata
        metadata = self.detector.get_metadata()
        metadata["validation_tuning_summary"] = self.validation_summary

        # Safe atomic write for metadata JSON
        tmp_metadata_path = metadata_path.with_suffix(".tmp")
        with open(tmp_metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        tmp_metadata_path.replace(metadata_path)

        return {
            "model_path": model_path,
            "metadata_path": metadata_path,
        }

    @classmethod
    def load(
        cls,
        models_dir: Optional[Union[str, Path]] = None,
        model_filename: str = "isolation_forest.joblib",
    ) -> "AnomalyDetectionPipeline":
        """Deserialize an AnomalyDetectionPipeline from saved joblib artifacts."""
        in_dir = Path(models_dir) if models_dir is not None else MODELS_DIR
        model_path = in_dir / model_filename

        detector = TelemetryIsolationForest.load(model_path)
        pipeline = cls(detector=detector)

        # Attempt to load metadata if present
        metadata_path = in_dir / "model_metadata.json"
        if metadata_path.exists():
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
                pipeline.validation_summary = metadata.get("validation_tuning_summary")

        return pipeline
