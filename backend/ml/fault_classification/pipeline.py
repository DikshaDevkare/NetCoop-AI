"""
End-to-end pipeline for telemetry multi-class fault classification.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import json
import pandas as pd

from ml.fault_classification.classifier import TelemetryXGBoostClassifier
from ml.fault_classification.config import (
    METADATA_FILE,
    MODEL_FILE,
    MODELS_DIR,
    TARGET_COLUMN,
)
from ml.fault_classification.evaluator import FaultEvaluator
from ml.fault_classification.feature_selector import FaultFeatureSelector


class FaultClassificationPipeline:
    """
    Unified pipeline encapsulating feature extraction, XGBoost classification,
    evaluation, structured inference, and serialization.
    """

    def __init__(
        self,
        classifier: Optional[TelemetryXGBoostClassifier] = None,
    ) -> None:
        self.classifier = classifier or TelemetryXGBoostClassifier()
        self.selector = FaultFeatureSelector()
        self.evaluator = FaultEvaluator()
        self.val_metrics: Optional[Dict[str, Any]] = None

    def fit(
        self,
        train_df: pd.DataFrame,
        val_df: Optional[pd.DataFrame] = None,
        verbose: bool = False,
    ) -> "FaultClassificationPipeline":
        """
        Extracts features and labels from train_df and fits the classifier.
        Optionally uses val_df for validation monitoring.
        """
        X_train, y_train = self.selector.transform_with_labels(train_df)

        eval_set = None
        if val_df is not None and not val_df.empty:
            X_val, y_val = self.selector.transform_with_labels(val_df)
            eval_set = [(X_val.to_numpy(dtype=float), y_val)]

        self.classifier.fit(X_train, y_train, eval_set=eval_set, verbose=verbose)

        if val_df is not None and not val_df.empty:
            self.val_metrics = self.evaluate(val_df)

        return self

    def predict(self, df: pd.DataFrame) -> List[str]:
        """
        Predicts string fault labels for input DataFrame.
        """
        return self.classifier.predict_labels(df)

    def predict_structured(
        self,
        df: pd.DataFrame,
        top_k: int = 3,
        uncertainty_threshold: float = 0.50,
    ) -> List[Dict[str, Any]]:
        """
        Returns rich structured diagnostic predictions.
        """
        return self.classifier.predict_structured(
            df,
            top_k=top_k,
            uncertainty_threshold=uncertainty_threshold,
        )

    def evaluate(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Evaluates classifier on a labelled DataFrame.
        """
        if TARGET_COLUMN not in df.columns:
            raise ValueError(f"Evaluation DataFrame must contain '{TARGET_COLUMN}' column.")

        X = self.selector.transform(df)
        y_true = self.selector.extract_labels(df)
        y_pred = self.classifier.predict(X)
        y_prob = self.classifier.predict_proba(X)

        return self.evaluator.evaluate(y_true=y_true, y_pred=y_pred, y_prob=y_prob)

    def save(
        self,
        models_dir: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Path]:
        """
        Persists model binary and metadata JSON to disk.
        """
        out_dir = Path(models_dir) if models_dir else MODELS_DIR
        out_dir.mkdir(parents=True, exist_ok=True)

        model_path = out_dir / "xgboost_classifier.joblib"
        metadata_path = out_dir / "classifier_metadata.json"

        self.classifier.save(model_path)

        metadata = self.classifier.get_metadata()
        if self.val_metrics:
            metadata["validation_summary"] = {
                "accuracy": self.val_metrics["accuracy"],
                "f1_macro": self.val_metrics["f1_macro"],
                "f1_weighted": self.val_metrics["f1_weighted"],
            }

        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        return {
            "model_path": model_path,
            "metadata_path": metadata_path,
        }

    @classmethod
    def load(
        cls,
        models_dir: Optional[Union[str, Path]] = None,
    ) -> "FaultClassificationPipeline":
        """
        Loads the saved classifier pipeline from disk.
        """
        dir_path = Path(models_dir) if models_dir else MODELS_DIR
        model_path = dir_path / "xgboost_classifier.joblib"
        classifier = TelemetryXGBoostClassifier.load(model_path)
        return cls(classifier=classifier)
