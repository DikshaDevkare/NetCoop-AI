"""
NetCoop AI XGBoost Multi-Class Fault Classification Package.
"""

from ml.fault_classification.classifier import TelemetryXGBoostClassifier
from ml.fault_classification.config import (
    FEATURE_COLUMNS,
    INDEX_TO_LABEL,
    LABEL_TO_INDEX,
    TARGET_CLASSES,
)
from ml.fault_classification.evaluator import FaultEvaluator
from ml.fault_classification.feature_selector import FaultFeatureSelector
from ml.fault_classification.pipeline import FaultClassificationPipeline

__all__ = [
    "TelemetryXGBoostClassifier",
    "FaultFeatureSelector",
    "FaultEvaluator",
    "FaultClassificationPipeline",
    "FEATURE_COLUMNS",
    "TARGET_CLASSES",
    "LABEL_TO_INDEX",
    "INDEX_TO_LABEL",
]
