"""
Unit and integration tests for XGBoost Multi-Class Fault Classification.
"""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest

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


@pytest.fixture
def synthetic_fault_df() -> pd.DataFrame:
    """Creates synthetic DataFrame with all 18 features and 7 scenarios."""
    np.random.seed(42)
    n_per_class = 15
    records = []

    for label in TARGET_CLASSES:
        for _ in range(n_per_class):
            row = {
                "scenario_label": label,
                "incident_id": "INC-TEST",
                "device_id": "SW-TEST",
                "latency_ms": np.random.uniform(10.0, 300.0),
                "packet_loss_pct": np.random.uniform(0.0, 10.0),
                "jitter_ms": np.random.uniform(1.0, 50.0),
                "throughput_mbps": np.random.uniform(50.0, 950.0),
                "bandwidth_utilization_pct": np.random.uniform(20.0, 95.0),
                "cpu_usage_pct": np.random.uniform(15.0, 99.0),
                "memory_usage_pct": np.random.uniform(20.0, 90.0),
                "device_uptime_seconds": np.random.uniform(1000.0, 86400.0),
                "temperature_celsius": np.random.uniform(35.0, 75.0),
                "dns_response_time_ms": np.random.uniform(2.0, 250.0),
                "queue_drops": np.random.randint(0, 500),
                "interface_errors": np.random.randint(0, 100),
                "retransmissions": np.random.randint(0, 80),
                "rolling_latency_mean": np.random.uniform(10.0, 300.0),
                "rolling_latency_std": np.random.uniform(0.5, 30.0),
                "rolling_packet_loss_mean": np.random.uniform(0.0, 8.0),
                "latency_change_rate": np.random.uniform(-5.0, 50.0),
                "queue_drop_rate": np.random.uniform(0.0, 20.0),
            }
            records.append(row)

    return pd.DataFrame(records)


def test_feature_selector_valid_and_ordered(synthetic_fault_df: pd.DataFrame) -> None:
    selector = FaultFeatureSelector()
    X = selector.transform(synthetic_fault_df)
    assert list(X.columns) == FEATURE_COLUMNS
    assert X.shape == (len(synthetic_fault_df), len(FEATURE_COLUMNS))


def test_feature_selector_rejects_missing_column(synthetic_fault_df: pd.DataFrame) -> None:
    selector = FaultFeatureSelector()
    df_missing = synthetic_fault_df.drop(columns=["latency_ms"])
    with pytest.raises(ValueError, match="Missing required feature columns"):
        selector.transform(df_missing)


def test_feature_selector_rejects_nan(synthetic_fault_df: pd.DataFrame) -> None:
    selector = FaultFeatureSelector()
    df_nan = synthetic_fault_df.copy()
    df_nan.loc[0, "cpu_usage_pct"] = np.nan
    with pytest.raises(ValueError, match="NaN/null"):
        selector.transform(df_nan)


def test_feature_selector_rejects_inf(synthetic_fault_df: pd.DataFrame) -> None:
    selector = FaultFeatureSelector()
    df_inf = synthetic_fault_df.copy()
    df_inf.loc[0, "latency_ms"] = np.inf
    with pytest.raises(ValueError, match="Infinite"):
        selector.transform(df_inf)


def test_feature_selector_extract_labels(synthetic_fault_df: pd.DataFrame) -> None:
    selector = FaultFeatureSelector()
    labels = selector.extract_labels(synthetic_fault_df)
    assert len(labels) == len(synthetic_fault_df)
    assert set(labels) == set(range(len(TARGET_CLASSES)))


def test_classifier_fit_predict_and_probabilities(synthetic_fault_df: pd.DataFrame) -> None:
    classifier = TelemetryXGBoostClassifier(n_estimators=10, max_depth=3)
    selector = FaultFeatureSelector()
    X, y = selector.transform_with_labels(synthetic_fault_df)

    classifier.fit(X, y)
    assert classifier.is_fitted is True

    probs = classifier.predict_proba(X)
    assert probs.shape == (len(synthetic_fault_df), len(TARGET_CLASSES))
    # Check probabilities sum to 1
    np.testing.assert_allclose(probs.sum(axis=1), 1.0, rtol=1e-5)

    preds = classifier.predict(X)
    assert preds.shape == (len(synthetic_fault_df),)
    assert set(preds).issubset(set(range(len(TARGET_CLASSES))))

    label_names = classifier.predict_labels(synthetic_fault_df)
    assert len(label_names) == len(synthetic_fault_df)
    assert set(label_names).issubset(set(TARGET_CLASSES))


def test_classifier_structured_predictions(synthetic_fault_df: pd.DataFrame) -> None:
    classifier = TelemetryXGBoostClassifier(n_estimators=10, max_depth=3)
    selector = FaultFeatureSelector()
    X, y = selector.transform_with_labels(synthetic_fault_df)
    classifier.fit(X, y)

    structured = classifier.predict_structured(synthetic_fault_df.head(5))
    assert len(structured) == 5

    first = structured[0]
    assert "predicted_fault" in first
    assert first["predicted_fault"] in TARGET_CLASSES
    assert "confidence" in first
    assert 0.0 <= first["confidence"] <= 1.0
    assert "class_probabilities" in first
    assert len(first["class_probabilities"]) == len(TARGET_CLASSES)
    assert "top_alternative_faults" in first


def test_classifier_save_and_load_roundtrip(synthetic_fault_df: pd.DataFrame, tmp_path: Path) -> None:
    classifier = TelemetryXGBoostClassifier(n_estimators=10, max_depth=3)
    selector = FaultFeatureSelector()
    X, y = selector.transform_with_labels(synthetic_fault_df)
    classifier.fit(X, y)

    save_path = tmp_path / "model.joblib"
    classifier.save(save_path)
    assert save_path.exists()

    loaded = TelemetryXGBoostClassifier.load(save_path)
    assert loaded.is_fitted is True
    assert loaded.training_samples_count == len(X)

    orig_probs = classifier.predict_proba(X[:5])
    loaded_probs = loaded.predict_proba(X[:5])
    np.testing.assert_allclose(orig_probs, loaded_probs, rtol=1e-5)


def test_pipeline_fit_evaluate_and_save(synthetic_fault_df: pd.DataFrame, tmp_path: Path) -> None:
    pipeline = FaultClassificationPipeline(
        classifier=TelemetryXGBoostClassifier(n_estimators=10, max_depth=3)
    )
    pipeline.fit(train_df=synthetic_fault_df, val_df=synthetic_fault_df)

    metrics = pipeline.evaluate(synthetic_fault_df)
    assert "accuracy" in metrics
    assert "f1_macro" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["accuracy"] > 0.5

    paths = pipeline.save(models_dir=tmp_path)
    assert paths["model_path"].exists()
    assert paths["metadata_path"].exists()

    loaded_pipe = FaultClassificationPipeline.load(models_dir=tmp_path)
    preds = loaded_pipe.predict(synthetic_fault_df.head(5))
    assert len(preds) == 5
