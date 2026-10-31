"""
ML Model Integration and Inference Service for NetCoop AI Orchestration.
Loads, caches, validates features, and coordinates inference for Isolation Forest,
XGBoost Multi-Class Fault Classification, and Sequence Temporal Pattern Analysis.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from app.core.logging_config import get_logger
from ml.anomaly_detection.config import FEATURE_COLUMNS as ANOMALY_FEATURES, MODELS_DIR as ANOMALY_MODELS_DIR
from ml.anomaly_detection.pipeline import AnomalyDetectionPipeline
from ml.fault_classification.config import FEATURE_COLUMNS as CLASSIFIER_FEATURES, MODELS_DIR as CLASSIFIER_MODELS_DIR, TARGET_CLASSES
from ml.fault_classification.pipeline import FaultClassificationPipeline
from ml.temporal_analysis.pipeline import TemporalAnalysisPipeline

logger = get_logger("netcoop.orchestration.model_service")


class ModelService:
    """
    Singleton service managing in-memory caching and inference execution
    for all NetCoop AI ML pipelines.
    """

    _instance: Optional["ModelService"] = None

    def __init__(self) -> None:
        self._anomaly_pipeline: Optional[AnomalyDetectionPipeline] = None
        self._classifier_pipeline: Optional[FaultClassificationPipeline] = None
        self._temporal_pipeline: Optional[TemporalAnalysisPipeline] = None
        self._load_all_models()

    @classmethod
    def get_instance(cls) -> "ModelService":
        """Returns the singleton instance of ModelService."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_all_models(self) -> None:
        """Loads and initializes all three ML pipelines into memory."""
        # 1. Anomaly Detection (Isolation Forest)
        try:
            model_joblib = ANOMALY_MODELS_DIR / "isolation_forest.joblib"
            if model_joblib.exists():
                self._anomaly_pipeline = AnomalyDetectionPipeline.load(models_dir=ANOMALY_MODELS_DIR)
                logger.info("Isolation Forest anomaly detector loaded successfully from %s", model_joblib)
            else:
                logger.warning("Anomaly model file not found at %s. Pipeline unavailable.", model_joblib)
        except Exception as exc:
            logger.error("Failed to load Isolation Forest pipeline: %s", exc)
            self._anomaly_pipeline = None

        # 2. Fault Classification (XGBoost)
        try:
            clf_joblib = CLASSIFIER_MODELS_DIR / "xgboost_classifier.joblib"
            if clf_joblib.exists():
                self._classifier_pipeline = FaultClassificationPipeline.load(models_dir=CLASSIFIER_MODELS_DIR)
                logger.info("XGBoost fault classifier loaded successfully from %s", clf_joblib)
            else:
                logger.warning("Classifier model file not found at %s. Pipeline unavailable.", clf_joblib)
        except Exception as exc:
            logger.error("Failed to load XGBoost classifier pipeline: %s", exc)
            self._classifier_pipeline = None

        # 3. Temporal Sequence Analysis
        try:
            self._temporal_pipeline = TemporalAnalysisPipeline(window_size=5)
            logger.info("Temporal analysis pipeline initialized successfully.")
        except Exception as exc:
            logger.error("Failed to initialize Temporal pipeline: %s", exc)
            self._temporal_pipeline = None

    # =========================================================================
    # Inference Methods
    # =========================================================================

    def run_anomaly_detection(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Executes Isolation Forest anomaly scoring on telemetry DataFrame.
        """
        if self._anomaly_pipeline is None:
            return {
                "available": False,
                "error": "Isolation Forest model artifact unavailable.",
                "is_anomalous": False,
                "anomaly_score": None,
                "threshold": None,
            }

        try:
            # Check for required numerical features
            missing = [c for c in ANOMALY_FEATURES if c not in df.columns]
            if missing:
                return {
                    "available": True,
                    "error": f"Missing required numerical features for anomaly detection: {missing}",
                    "is_anomalous": False,
                    "anomaly_score": None,
                    "threshold": self._anomaly_pipeline.detector.threshold,
                }

            preds, scores = self._anomaly_pipeline.predict_with_scores(df)
            has_anomaly = bool(np.any(preds == 1))
            max_score = float(np.max(scores)) if len(scores) > 0 else 0.0
            mean_score = float(np.mean(scores)) if len(scores) > 0 else 0.0

            return {
                "available": True,
                "model_type": "IsolationForest",
                "is_anomalous": has_anomaly,
                "anomaly_count": int(np.sum(preds == 1)),
                "total_records": len(df),
                "max_anomaly_score": round(max_score, 6),
                "mean_anomaly_score": round(mean_score, 6),
                "decision_threshold": round(float(self._anomaly_pipeline.detector.threshold), 6),
                "predictions": preds.tolist(),
                "scores": [round(float(s), 6) for s in scores],
                "limitations": [
                    "Threshold optimized for high fault recall (99.85%); elevated false-positive rate on normal telemetry.",
                    "Isolation Forest provides anomaly indicator signal; does not diagnose specific root cause.",
                ],
            }
        except Exception as exc:
            logger.error("Anomaly detection execution error: %s", exc)
            return {
                "available": True,
                "error": f"Inference execution failed: {str(exc)}",
                "is_anomalous": False,
                "anomaly_score": None,
            }

    def run_fault_classification(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Executes XGBoost multi-class fault classification on telemetry DataFrame.
        """
        if self._classifier_pipeline is None:
            return {
                "available": False,
                "error": "XGBoost classifier artifact unavailable.",
                "predicted_fault": "unknown",
                "confidence": 0.0,
            }

        try:
            missing = [c for c in CLASSIFIER_FEATURES if c not in df.columns]
            if missing:
                return {
                    "available": True,
                    "error": f"Missing required numerical features for fault classification: {missing}",
                    "predicted_fault": "unknown",
                    "confidence": 0.0,
                }

            structured_preds = self._classifier_pipeline.predict_structured(df)
            if not structured_preds:
                return {
                    "available": True,
                    "predicted_fault": "normal",
                    "confidence": 0.50,
                    "is_uncertain": True,
                }

            # Take aggregated consensus or latest prediction
            # If multiple records, take highest confidence non-normal prediction, or first
            non_normals = [p for p in structured_preds if p["predicted_fault"] != "normal"]
            primary = non_normals[0] if non_normals else structured_preds[0]

            return {
                "available": True,
                "model_type": "XGBoostClassifier",
                "predicted_fault": primary["predicted_fault"],
                "confidence": primary["confidence"],
                "is_uncertain": primary["is_uncertain"],
                "class_probabilities": primary["class_probabilities"],
                "top_alternative_faults": primary["top_alternative_faults"],
                "top_contributing_features": primary.get("top_contributing_features", []),
                "records_evaluated": len(df),
                "limitations": [
                    "Probabilities reflect model tree score distribution, not absolute empirical certainty.",
                    "Requires multi-agent evidence correlation for confirmation.",
                ],
            }
        except Exception as exc:
            logger.error("Fault classification execution error: %s", exc)
            return {
                "available": True,
                "error": f"Classification inference failed: {str(exc)}",
                "predicted_fault": "unknown",
                "confidence": 0.0,
            }

    def run_temporal_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Executes sequence-based temporal trajectory analysis.
        """
        if self._temporal_pipeline is None:
            return {
                "available": False,
                "error": "Temporal analysis pipeline unavailable.",
                "overall_trend": "unknown",
            }

        try:
            res = self._temporal_pipeline.analyze_dataframe(df)
            # Find dominant series trend
            summary = res.get("summary", {})
            worsening = summary.get("worsening_count", 0)
            anom_series = summary.get("anomalous_series_count", 0)
            total_series = res.get("total_series", 1)

            overall_trend = "worsening" if worsening > 0 else ("stable_healthy" if anom_series == 0 else "active_anomalies")

            # Extract collective sequence evidence items
            collective_evidence = []
            for s_info in res.get("series_results", {}).values():
                analysis = s_info.get("analysis", {})
                for evd in analysis.get("sequence_evidence", []):
                    evd["device_id"] = s_info.get("device_id")
                    collective_evidence.append(evd)

            return {
                "available": True,
                "methodology": "Deterministic Sequence Trajectory Regression",
                "total_series": total_series,
                "anomalous_series_count": anom_series,
                "overall_trend": overall_trend,
                "worsening_series_count": worsening,
                "sequence_evidence": collective_evidence[:10],
                "limitations": [
                    "Deterministic linear slope and persistence evaluation; non-deep learning model.",
                    "Shorter series (<3 steps) yield reduced confidence due to limited historical depth.",
                ],
            }
        except Exception as exc:
            logger.error("Temporal analysis execution error: %s", exc)
            return {
                "available": True,
                "error": f"Temporal analysis failed: {str(exc)}",
                "overall_trend": "unknown",
            }

    def get_model_statuses(self) -> List[Dict[str, Any]]:
        """
        Returns metadata and operational status for all registered ML models.
        """
        anom_avail = self._anomaly_pipeline is not None
        clf_avail = self._classifier_pipeline is not None
        temp_avail = self._temporal_pipeline is not None

        return [
            {
                "name": "Isolation Forest Anomaly Detector",
                "type": "Unsupervised Anomaly Detection",
                "algorithm": "sklearn.ensemble.IsolationForest",
                "version": "1.0.0",
                "available": anom_avail,
                "status": "ready" if anom_avail else "artifact_missing",
                "feature_count": len(ANOMALY_FEATURES),
                "threshold": round(float(self._anomaly_pipeline.detector.threshold), 6) if anom_avail else None,
                "notes": "Tuned for high recall (99.85%) on validation data. High false-positive rate on normal telemetry.",
            },
            {
                "name": "XGBoost Multi-Class Fault Classifier",
                "type": "Supervised Multi-Class Classification",
                "algorithm": "xgboost.XGBClassifier",
                "version": "1.0.0",
                "available": clf_avail,
                "status": "ready" if clf_avail else "artifact_missing",
                "target_classes": TARGET_CLASSES,
                "feature_count": len(CLASSIFIER_FEATURES),
                "notes": "7-class fault classifier (test accuracy: 86.52%, macro F1: 0.8747, ROC-AUC: 0.9730).",
            },
            {
                "name": "Sequence Temporal Pattern Analyzer",
                "type": "Deterministic Time-Series Trajectory Analysis",
                "algorithm": "Chronological Windowed OLS Slope & Persistence Engine",
                "version": "1.0.0",
                "available": temp_avail,
                "status": "ready" if temp_avail else "unavailable",
                "window_size": 5,
                "notes": "Evaluates trend slopes, persistence counters, and recovery dynamics across chronological series.",
            },
        ]
