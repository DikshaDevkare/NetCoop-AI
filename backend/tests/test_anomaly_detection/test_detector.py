"""
Unit tests for TelemetryIsolationForest in Phase 3.2.
Verifies normal-baseline training, score orientation, binary predictions, reproducibility, and persistence.
"""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from ml.anomaly_detection.config import FEATURE_COLUMNS
from ml.anomaly_detection.detector import TelemetryIsolationForest


@pytest.fixture
def mixed_telemetry_df() -> pd.DataFrame:
    """Fixture with a mix of normal and fault telemetry records."""
    rows = []
    # 50 normal records
    for i in range(50):
        row = {f: 10.0 + (i % 5) for f in FEATURE_COLUMNS}
        row["latency_ms"] = 12.0 + (i % 3)
        row["packet_loss_pct"] = 0.0
        row["queue_drops"] = 0
        row["scenario_label"] = "normal"
        rows.append(row)

    # 50 fault records
    for i in range(50):
        row = {f: 80.0 + (i % 10) for f in FEATURE_COLUMNS}
        row["latency_ms"] = 350.0 + i
        row["packet_loss_pct"] = 15.0
        row["queue_drops"] = 5000
        row["scenario_label"] = "hardware_failure"
        rows.append(row)

    return pd.DataFrame(rows)


def test_detector_fits_only_on_normal_records(mixed_telemetry_df: pd.DataFrame) -> None:
    """Verify fit() automatically extracts ONLY records where scenario_label == 'normal'."""
    detector = TelemetryIsolationForest(random_state=42, n_estimators=50)
    detector.fit(mixed_telemetry_df)

    assert detector.is_fitted is True
    # Exactly 50 normal records should have been used, excluding the 50 fault records
    assert detector.train_samples_count == 50


def test_detector_rejects_empty_data() -> None:
    """Verify ValueError is raised on empty training DataFrame or array."""
    detector = TelemetryIsolationForest()
    with pytest.raises(ValueError, match="Training DataFrame is empty"):
        detector.fit(pd.DataFrame())

    with pytest.raises(ValueError, match="Training array is empty"):
        detector.fit(np.array([]))


def test_detector_rejects_zero_normal_records() -> None:
    """Verify ValueError is raised when DataFrame contains only faults and 0 normal records."""
    detector = TelemetryIsolationForest()
    fault_df = pd.DataFrame({
        f: [50.0] for f in FEATURE_COLUMNS
    })
    fault_df["scenario_label"] = "congestion"

    with pytest.raises(ValueError, match="contains 0 records where scenario_label == 'normal'"):
        detector.fit(fault_df)


def test_detector_anomaly_score_orientation(mixed_telemetry_df: pd.DataFrame) -> None:
    """
    Verify score orientation: higher score denotes higher abnormality.
    Fault records must have higher anomaly scores than normal records.
    """
    detector = TelemetryIsolationForest(random_state=42, n_estimators=50)
    detector.fit(mixed_telemetry_df)

    normal_subset = mixed_telemetry_df[mixed_telemetry_df["scenario_label"] == "normal"]
    fault_subset = mixed_telemetry_df[mixed_telemetry_df["scenario_label"] == "hardware_failure"]

    normal_scores = detector.anomaly_scores(normal_subset)
    fault_scores = detector.anomaly_scores(fault_subset)

    assert isinstance(normal_scores, np.ndarray)
    assert len(normal_scores) == 50
    assert len(fault_scores) == 50

    # Mean score for faults must be significantly greater than for normal
    assert np.mean(fault_scores) > np.mean(normal_scores)
    # Check max fault score exceeds median normal score
    assert np.max(fault_scores) > np.median(normal_scores)


def test_detector_predictions_binary_and_raw(mixed_telemetry_df: pd.DataFrame) -> None:
    """Verify application-level predict() returns 0 or 1, and predict_raw() returns -1 or +1."""
    detector = TelemetryIsolationForest(random_state=42, n_estimators=50)
    detector.fit(mixed_telemetry_df)

    binary_preds = detector.predict(mixed_telemetry_df)
    raw_preds = detector.predict_raw(mixed_telemetry_df)

    assert set(np.unique(binary_preds)).issubset({0, 1})
    assert set(np.unique(raw_preds)).issubset({-1, 1})
    assert len(binary_preds) == len(mixed_telemetry_df)
    assert len(raw_preds) == len(mixed_telemetry_df)


def test_detector_reproducibility(mixed_telemetry_df: pd.DataFrame) -> None:
    """Verify same seed produces identical scores and predictions across runs."""
    det1 = TelemetryIsolationForest(random_state=999, n_estimators=40)
    det2 = TelemetryIsolationForest(random_state=999, n_estimators=40)

    det1.fit(mixed_telemetry_df)
    det2.fit(mixed_telemetry_df)

    scores1 = det1.anomaly_scores(mixed_telemetry_df)
    scores2 = det2.anomaly_scores(mixed_telemetry_df)

    np.testing.assert_allclose(scores1, scores2, rtol=1e-5)


def test_detector_save_and_load_roundtrip(mixed_telemetry_df: pd.DataFrame, tmp_path: Path) -> None:
    """Verify model can be serialized with joblib and reloaded with identical predictions."""
    detector = TelemetryIsolationForest(random_state=42, n_estimators=30)
    detector.fit(mixed_telemetry_df)
    detector.set_threshold(0.05, selection_method="test_custom")

    save_path = tmp_path / "test_iso.joblib"
    detector.save(save_path)

    assert save_path.exists()

    loaded = TelemetryIsolationForest.load(save_path)
    assert loaded.is_fitted is True
    assert loaded.threshold == 0.05
    assert loaded.threshold_selection_method == "test_custom"

    scores_orig = detector.anomaly_scores(mixed_telemetry_df)
    scores_loaded = loaded.anomaly_scores(mixed_telemetry_df)
    np.testing.assert_allclose(scores_orig, scores_loaded)


def test_detector_metadata_completeness(mixed_telemetry_df: pd.DataFrame) -> None:
    """Verify metadata captures all required fields without storing raw telemetry."""
    detector = TelemetryIsolationForest(random_state=42, n_estimators=25)
    detector.fit(mixed_telemetry_df)

    meta = detector.get_metadata()
    assert meta["model_type"] == "IsolationForest"
    assert meta["is_fitted"] is True
    assert meta["training_samples_count"] == 50
    assert meta["feature_count"] == 18
    assert meta["feature_columns"] == FEATURE_COLUMNS
    assert "hyperparameters" in meta
    assert meta["hyperparameters"]["n_estimators"] == 25
    assert "dependency_versions" in meta
    assert "scikit-learn" in meta["dependency_versions"]
