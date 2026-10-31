"""
Unit tests for causal temporal feature engineering.
"""

import pandas as pd
from ml.preprocessing.feature_engineering import TelemetryFeatureEngineer


def test_feature_engineering_rolling_and_differentials() -> None:
    """Verify rolling averages and rate-of-change features calculate correctly."""
    df = pd.DataFrame([
        {
            "incident_id": "INC-01",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": 10.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 2.0,
            "cpu_usage_pct": 20.0,
            "memory_usage_pct": 30.0,
            "bandwidth_utilization_pct": 40.0,
            "queue_drops": 0,
            "interface_errors": 0,
        },
        {
            "incident_id": "INC-01",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:10Z",
            "latency_ms": 20.0,
            "packet_loss_pct": 1.0,
            "jitter_ms": 4.0,
            "cpu_usage_pct": 30.0,
            "memory_usage_pct": 35.0,
            "bandwidth_utilization_pct": 50.0,
            "queue_drops": 10,
            "interface_errors": 1,
        },
        {
            "incident_id": "INC-01",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:20Z",
            "latency_ms": 30.0,
            "packet_loss_pct": 2.0,
            "jitter_ms": 6.0,
            "cpu_usage_pct": 40.0,
            "memory_usage_pct": 40.0,
            "bandwidth_utilization_pct": 60.0,
            "queue_drops": 20,
            "interface_errors": 2,
        },
    ])

    featured = TelemetryFeatureEngineer.compute_features(df, window_size=3)

    # First row: min_periods=1 -> mean == 10.0, diff == 0.0
    assert featured["rolling_latency_mean"].iloc[0] == 10.0
    assert featured["latency_change_rate"].iloc[0] == 0.0

    # Second row: mean of [10, 20] == 15.0, diff == 10.0
    assert featured["rolling_latency_mean"].iloc[1] == 15.0
    assert featured["latency_change_rate"].iloc[1] == 10.0

    # Third row: mean of [10, 20, 30] == 20.0, diff == 10.0
    assert featured["rolling_latency_mean"].iloc[2] == 20.0
    assert featured["latency_change_rate"].iloc[2] == 10.0

    assert "bandwidth_pressure_indicator" in featured.columns


def test_feature_engineering_device_and_incident_isolation() -> None:
    """Verify rolling windows and diffs do NOT cross device or incident boundaries."""
    df = pd.DataFrame([
        # Incident 1, Device A
        {
            "incident_id": "INC-01",
            "device_id": "DEV-A",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": 100.0,
            "packet_loss_pct": 5.0,
            "jitter_ms": 10.0,
            "cpu_usage_pct": 50.0,
            "memory_usage_pct": 50.0,
            "bandwidth_utilization_pct": 80.0,
            "queue_drops": 50,
            "interface_errors": 5,
        },
        # Incident 1, Device B (Separate device -> diff must reset to 0, not diff from Device A!)
        {
            "incident_id": "INC-01",
            "device_id": "DEV-B",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": 10.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 1.0,
            "cpu_usage_pct": 15.0,
            "memory_usage_pct": 20.0,
            "bandwidth_utilization_pct": 20.0,
            "queue_drops": 0,
            "interface_errors": 0,
        },
    ])

    featured = TelemetryFeatureEngineer.compute_features(df, window_size=3)

    # Device B's latency change rate must be 0.0 (boundary preserved)
    dev_b_row = featured[featured["device_id"] == "DEV-B"].iloc[0]
    assert dev_b_row["latency_change_rate"] == 0.0
    assert dev_b_row["rolling_latency_mean"] == 10.0
