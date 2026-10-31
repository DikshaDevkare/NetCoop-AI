"""
Integration tests for AnomalyDetectionPipeline in Phase 3.2.
Verifies end-to-end fit, threshold optimization, inference, persistence, and test evaluation.
"""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from ml.anomaly_detection.config import FEATURE_COLUMNS
from ml.anomaly_detection.pipeline import AnomalyDetectionPipeline


@pytest.fixture
def train_and_val_dfs() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Generate small train and val DataFrames for integration testing."""
    train_rows = []
    # 60 normal records in train
    for i in range(60):
        r = {f: 15.0 + (i % 3) for f in FEATURE_COLUMNS}
        r["scenario_label"] = "normal"
        train_rows.append(r)
    # 20 fault records in train (should be ignored by baseline fit)
    for i in range(20):
        r = {f: 85.0 + (i % 4) for f in FEATURE_COLUMNS}
        r["scenario_label"] = "congestion"
        train_rows.append(r)

    val_rows = []
    # 30 normal, 30 fault in val
    for i in range(30):
        r = {f: 15.0 + (i % 3) for f in FEATURE_COLUMNS}
        r["scenario_label"] = "normal"
        val_rows.append(r)
    for i in range(30):
        r = {f: 85.0 + (i % 4) for f in FEATURE_COLUMNS}
        r["scenario_label"] = "hardware_failure"
        val_rows.append(r)

    return pd.DataFrame(train_rows), pd.DataFrame(val_rows)


def test_pipeline_fit_and_threshold_tuning(train_and_val_dfs: tuple[pd.DataFrame, pd.DataFrame]) -> None:
    """Verify pipeline fits on normal train records and tunes threshold on val records."""
    train_df, val_df = train_and_val_dfs

    pipeline = AnomalyDetectionPipeline()
    pipeline.fit(train_df=train_df, val_df=val_df, tune_threshold=True)

    assert pipeline.detector.is_fitted is True
    assert pipeline.detector.train_samples_count == 60  # Only normal records
    assert pipeline.validation_summary is not None
    assert pipeline.detector.threshold_selection_method == "validation_f2_tuning"


def test_pipeline_predict_and_evaluate(train_and_val_dfs: tuple[pd.DataFrame, pd.DataFrame]) -> None:
    """Verify predict_with_scores and evaluate() return well-formed outputs."""
    train_df, val_df = train_and_val_dfs

    pipeline = AnomalyDetectionPipeline()
    pipeline.fit(train_df=train_df, val_df=val_df, tune_threshold=True)

    preds, scores = pipeline.predict_with_scores(val_df)
    assert len(preds) == len(val_df)
    assert len(scores) == len(val_df)
    assert set(np.unique(preds)).issubset({0, 1})

    metrics = pipeline.evaluate(val_df)
    assert "accuracy" in metrics
    assert "f2_score" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["total_samples"] == len(val_df)


def test_pipeline_save_and_load_roundtrip(
    train_and_val_dfs: tuple[pd.DataFrame, pd.DataFrame],
    tmp_path: Path,
) -> None:
    """Verify pipeline save() and load() preserve model state and threshold."""
    train_df, val_df = train_and_val_dfs

    pipeline = AnomalyDetectionPipeline()
    pipeline.fit(train_df=train_df, val_df=val_df, tune_threshold=True)

    saved = pipeline.save(models_dir=tmp_path)
    assert saved["model_path"].exists()
    assert saved["metadata_path"].exists()

    loaded_pipeline = AnomalyDetectionPipeline.load(models_dir=tmp_path)
    assert loaded_pipeline.detector.is_fitted is True
    assert loaded_pipeline.detector.threshold == pipeline.detector.threshold

    preds_orig = pipeline.predict(val_df)
    preds_loaded = loaded_pipeline.predict(val_df)
    np.testing.assert_array_equal(preds_orig, preds_loaded)
