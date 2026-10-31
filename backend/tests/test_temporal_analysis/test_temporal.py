"""
Unit and integration tests for Temporal Network Pattern Analysis.
"""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from ml.temporal_analysis.pipeline import TemporalAnalysisPipeline
from ml.temporal_analysis.sequence_builder import SequenceBuilder
from ml.temporal_analysis.temporal_analyzer import TemporalAnalyzer


@pytest.fixture
def sample_temporal_df() -> pd.DataFrame:
    """Creates a controlled chronological multi-step telemetry DataFrame."""
    rows = []
    # Device 1: Worsening latency and queue drops over 5 steps
    for i in range(5):
        rows.append({
            "incident_id": "INC-01",
            "device_id": "SW-CORE",
            "timestamp": f"2026-10-31T12:0{i}:00Z",
            "latency_ms": 20.0 + i * 35.0,  # 20 -> 160
            "packet_loss_pct": 0.0 if i < 2 else 2.5,
            "jitter_ms": 2.0 + i * 5.0,
            "throughput_mbps": 800.0,
            "bandwidth_utilization_pct": 50.0 + i * 10.0,
            "cpu_usage_pct": 30.0 + i * 12.0,
            "memory_usage_pct": 40.0,
            "queue_drops": i * 50,
            "interface_errors": 0,
        })
    # Device 2: Stable healthy baseline over 5 steps
    for i in range(5):
        rows.append({
            "incident_id": "INC-01",
            "device_id": "AP-101",
            "timestamp": f"2026-10-31T12:0{i}:00Z",
            "latency_ms": 12.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 2.0,
            "throughput_mbps": 400.0,
            "bandwidth_utilization_pct": 25.0,
            "cpu_usage_pct": 20.0,
            "memory_usage_pct": 30.0,
            "queue_drops": 0,
            "interface_errors": 0,
        })
    return pd.DataFrame(rows)


def test_sequence_builder_grouping_and_ordering(sample_temporal_df: pd.DataFrame) -> None:
    builder = SequenceBuilder(window_size=5)
    grouped = builder.group_and_sort(sample_temporal_df)

    assert len(grouped) == 2
    assert ("INC-01", "SW-CORE") in grouped
    assert ("INC-01", "AP-101") in grouped

    sw_df = grouped[("INC-01", "SW-CORE")]
    assert len(sw_df) == 5
    # Confirm strictly chronological
    assert list(sw_df["latency_ms"]) == [20.0, 55.0, 90.0, 125.0, 160.0]


def test_sequence_builder_sliding_windows(sample_temporal_df: pd.DataFrame) -> None:
    builder = SequenceBuilder(window_size=3)
    windows = builder.build_sliding_windows(sample_temporal_df)
    assert len(windows) == 10  # 5 windows per device
    first_w = windows[0]
    assert first_w["window_size"] == 1
    last_w = windows[4]
    assert last_w["window_size"] == 3


def test_temporal_analyzer_worsening_trend(sample_temporal_df: pd.DataFrame) -> None:
    builder = SequenceBuilder(window_size=5)
    grouped = builder.group_and_sort(sample_temporal_df)
    sw_df = grouped[("INC-01", "SW-CORE")]

    analyzer = TemporalAnalyzer()
    res = analyzer.analyze_sequence(sw_df)

    assert res["sequence_length"] == 5
    assert res["temporal_anomaly"] is True
    assert res["overall_trend"] in ("worsening", "degrading")
    assert res["max_persistence_steps"] >= 2
    assert res["confidence"] == 0.95
    assert "latency_ms" in res["anomalous_metrics"]
    assert len(res["sequence_evidence"]) > 0


def test_temporal_analyzer_stable_healthy_trend(sample_temporal_df: pd.DataFrame) -> None:
    builder = SequenceBuilder(window_size=5)
    grouped = builder.group_and_sort(sample_temporal_df)
    ap_df = grouped[("INC-01", "AP-101")]

    analyzer = TemporalAnalyzer()
    res = analyzer.analyze_sequence(ap_df)

    assert res["sequence_length"] == 5
    assert res["temporal_anomaly"] is False
    assert res["overall_trend"] == "stable"
    assert res["recovery_pattern"] == "stable_healthy"


def test_temporal_analyzer_single_record_edge_case() -> None:
    df_single = pd.DataFrame([{
        "latency_ms": 250.0,
        "packet_loss_pct": 5.0,
        "queue_drops": 200,
    }])
    analyzer = TemporalAnalyzer()
    res = analyzer.analyze_sequence(df_single)

    assert res["sequence_length"] == 1
    assert res["confidence"] == 0.40  # Limited confidence for single tick
    assert res["recovery_pattern"] == "indeterminate_single_sample"


def test_temporal_pipeline_multi_device(sample_temporal_df: pd.DataFrame, tmp_path: Path) -> None:
    pipeline = TemporalAnalysisPipeline(window_size=5)
    batch_res = pipeline.analyze_dataframe(sample_temporal_df)

    assert batch_res["total_records"] == 10
    assert batch_res["total_series"] == 2
    assert batch_res["summary"]["anomalous_series_count"] == 1
    assert batch_res["summary"]["worsening_count"] == 1

    # Device stream helper
    sw_only = sample_temporal_df[sample_temporal_df["device_id"] == "SW-CORE"]
    stream_res = pipeline.analyze_device_stream(sw_only)
    assert stream_res["temporal_anomaly"] is True

    # Metadata saving
    meta_path = pipeline.save_metadata(models_dir=tmp_path)
    assert meta_path.exists()
