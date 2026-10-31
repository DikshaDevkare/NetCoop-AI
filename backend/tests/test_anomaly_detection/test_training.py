"""
Integration tests for the training CLI workflow in Phase 3.2.
Tests dataset loading from actual Phase 3.1 paths, baseline training, artifact persistence, and JSON report validity.
"""

import json
from pathlib import Path
import pytest

from ml.anomaly_detection.config import (
    MODEL_FILE,
    MODELS_DIR,
    REPORTS_DIR,
    TEST_DATA_PATH,
    TEST_METRICS_FILE,
    TRAIN_DATA_PATH,
    VAL_DATA_PATH,
    VAL_METRICS_FILE,
)
from ml.anomaly_detection.pipeline import AnomalyDetectionPipeline
from ml.anomaly_detection.train import run_training_pipeline


def test_training_pipeline_execution_and_artifacts(tmp_path: Path) -> None:
    """
    Test running the complete training pipeline using actual dataset files
    and saving to temporary directories.
    """
    pytest.importorskip("sklearn")

    if not TRAIN_DATA_PATH.exists() or not VAL_DATA_PATH.exists() or not TEST_DATA_PATH.exists():
        pytest.skip("Phase 3.1 processed dataset files not present on disk.")

    models_dir = tmp_path / "models"
    reports_dir = tmp_path / "reports"

    res = run_training_pipeline(
        train_path=TRAIN_DATA_PATH,
        val_path=VAL_DATA_PATH,
        test_path=TEST_DATA_PATH,
        models_dir=models_dir,
        reports_dir=reports_dir,
        n_estimators=30,  # Fast run for tests
        random_state=42,
    )

    # 1. Verify pipeline was returned and fitted
    pipeline = res["pipeline"]
    assert isinstance(pipeline, AnomalyDetectionPipeline)
    assert pipeline.detector.is_fitted is True
    # Exactly 750 normal records from train.csv
    assert pipeline.detector.train_samples_count == 750

    # 2. Verify all expected artifact files were created on disk
    model_path = models_dir / "isolation_forest.joblib"
    meta_path = models_dir / "model_metadata.json"
    analysis_json = reports_dir / "model_analysis_report.json"
    analysis_md = reports_dir / "model_analysis_report.md"

    assert model_path.exists()
    assert meta_path.exists()
    assert analysis_json.exists()
    assert analysis_md.exists()

    # 3. Verify JSON contents are valid and well-formed
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
        assert meta["model_type"] == "IsolationForest"
        assert meta["feature_count"] == 18
        assert meta["training_samples_count"] == 750
        assert "threshold" in meta

    with open(analysis_json, "r", encoding="utf-8") as f:
        analysis = json.load(f)
        assert "validation_metrics" in analysis
        assert "test_metrics" in analysis
        assert "per_scenario_breakdown_test" in analysis
        # Verify all 7 scenarios exist in breakdown
        scenarios = list(analysis["per_scenario_breakdown_test"].keys())
        assert len(scenarios) == 7
        assert "normal" in scenarios
        assert "congestion" in scenarios
