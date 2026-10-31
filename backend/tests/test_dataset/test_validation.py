"""
Unit tests for data validation, quality audits, and measurement noise.
"""

import pandas as pd
from ml.preprocessing.cleaning import TelemetryDataValidator


def test_audit_dataframe_clean_data() -> None:
    """Verify clean dataset passes audit with zero duplicates and zero out-of-bounds."""
    df = pd.DataFrame([
        {
            "incident_id": "INC-01",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": 15.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 2.0,
            "cpu_usage_pct": 20.0,
            "bandwidth_utilization_pct": 30.0,
        },
        {
            "incident_id": "INC-01",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:10Z",
            "latency_ms": 18.0,
            "packet_loss_pct": 0.5,
            "jitter_ms": 3.0,
            "cpu_usage_pct": 25.0,
            "bandwidth_utilization_pct": 35.0,
        },
    ])
    audit = TelemetryDataValidator.audit_dataframe(df)
    assert audit["is_clean"] is True
    assert audit["duplicate_records"] == 0
    assert len(audit["out_of_bounds_records"]) == 0


def test_audit_dataframe_detects_duplicates_and_out_of_bounds() -> None:
    """Verify audit catches duplicate rows and bounded violations."""
    df = pd.DataFrame([
        {
            "incident_id": "INC-01",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": -50.0,  # Negative latency (invalid)
            "packet_loss_pct": 140.0,  # >100% loss (invalid)
            "jitter_ms": 2.0,
            "cpu_usage_pct": 20.0,
            "bandwidth_utilization_pct": 30.0,
        },
        {
            # Exact duplicate timestamp, device, and incident
            "incident_id": "INC-01",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": 15.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 2.0,
            "cpu_usage_pct": 20.0,
            "bandwidth_utilization_pct": 30.0,
        },
    ])
    audit = TelemetryDataValidator.audit_dataframe(df)
    assert audit["is_clean"] is False
    assert audit["duplicate_records"] == 1
    assert "latency_ms" in audit["out_of_bounds_records"]
    assert "packet_loss_pct" in audit["out_of_bounds_records"]


def test_measurement_noise_bounds_preservation() -> None:
    """Verify measurement noise respects physical bounds."""
    df = pd.DataFrame([
        {
            "latency_ms": 10.0,
            "jitter_ms": 2.0,
            "throughput_mbps": 50.0,
            "bandwidth_utilization_pct": 99.0,
            "cpu_usage_pct": 98.0,
            "memory_usage_pct": 50.0,
        }
    ])
    noisy_df = TelemetryDataValidator.apply_measurement_noise(df, noise_level=0.1, seed=42)
    assert noisy_df["latency_ms"].iloc[0] >= 0.0
    assert noisy_df["bandwidth_utilization_pct"].iloc[0] <= 100.0
    assert noisy_df["cpu_usage_pct"].iloc[0] <= 100.0
