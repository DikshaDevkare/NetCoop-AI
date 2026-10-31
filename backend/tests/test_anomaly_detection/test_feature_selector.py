"""
Unit tests for TelemetryFeatureSelector in Phase 3.2.
Verifies strict 18-feature allowlist, deterministic ordering, NaN/Inf rejection, and metadata safety.
"""

import numpy as np
import pandas as pd
import pytest

from ml.anomaly_detection.config import EXCLUDED_METADATA_COLUMNS, FEATURE_COLUMNS
from ml.anomaly_detection.feature_selector import TelemetryFeatureSelector


@pytest.fixture
def sample_valid_telemetry_df() -> pd.DataFrame:
    """Fixture returning a valid synthetic DataFrame with all 18 features and metadata."""
    data = {
        # Metadata / Identifiers
        "incident_id": ["INC-001", "INC-001"],
        "scenario_id": ["SCN-NORMAL", "SCN-NORMAL"],
        "scenario_label": ["normal", "normal"],
        "device_id": ["SW_CORE_01", "SW_CORE_01"],
        "device_type": ["switch", "switch"],
        "hostname": ["core-sw01", "core-sw01"],
        "network_segment": ["CAMPUS_CORE", "CAMPUS_CORE"],
        "timestamp": ["2026-11-01T08:00:00Z", "2026-11-01T08:00:10Z"],
        "status": ["Healthy", "Healthy"],
        "interface_status": ["up", "up"],
        "dns_resolution_status": ["success", "success"],
        "dhcp_status": ["assigned", "assigned"],
        "gateway_reachability": ["reachable", "reachable"],
        "interface_connectivity": ["connected", "connected"],
        "wireless_signal_strength_dbm": [None, None],
        "bandwidth_pressure_indicator": [0.4, 0.5],
        "synthetic_data": [True, True],
        # 18 Features
        "latency_ms": [12.5, 14.0],
        "packet_loss_pct": [0.0, 0.0],
        "jitter_ms": [2.1, 2.3],
        "throughput_mbps": [95.0, 92.0],
        "bandwidth_utilization_pct": [35.0, 38.0],
        "cpu_usage_pct": [22.0, 24.5],
        "memory_usage_pct": [30.0, 31.0],
        "device_uptime_seconds": [86400.0, 86410.0],
        "temperature_celsius": [42.0, 42.5],
        "dns_response_time_ms": [15.0, 16.0],
        "queue_drops": [0, 0],
        "interface_errors": [0, 0],
        "retransmissions": [0, 0],
        "rolling_latency_mean": [12.5, 13.25],
        "rolling_latency_std": [0.0, 1.06],
        "rolling_packet_loss_mean": [0.0, 0.0],
        "latency_change_rate": [0.0, 1.5],
        "queue_drop_rate": [0.0, 0.0],
    }
    return pd.DataFrame(data)


def test_feature_selector_exact_18_features_and_ordering(sample_valid_telemetry_df: pd.DataFrame) -> None:
    """Verify exactly 18 numeric features are extracted in deterministic order."""
    selector = TelemetryFeatureSelector()
    X_df = selector.select_features(sample_valid_telemetry_df)

    assert len(X_df.columns) == 18
    assert list(X_df.columns) == FEATURE_COLUMNS
    assert list(X_df.columns) == selector.get_feature_names()

    # Check numpy transform output
    X_mat = selector.transform(sample_valid_telemetry_df)
    assert isinstance(X_mat, np.ndarray)
    assert X_mat.shape == (2, 18)
    assert X_mat.dtype == np.float64


def test_feature_selector_rejects_missing_column(sample_valid_telemetry_df: pd.DataFrame) -> None:
    """Verify ValueError is raised if any allowlisted feature is missing."""
    selector = TelemetryFeatureSelector()
    incomplete_df = sample_valid_telemetry_df.drop(columns=["temperature_celsius"])

    with pytest.raises(ValueError, match="Missing required feature columns.*temperature_celsius"):
        selector.select_features(incomplete_df)


def test_feature_selector_rejects_nan_values(sample_valid_telemetry_df: pd.DataFrame) -> None:
    """Verify ValueError is raised when NaNs are present without silent zero imputation."""
    selector = TelemetryFeatureSelector()
    df_with_nan = sample_valid_telemetry_df.copy()
    df_with_nan.loc[0, "latency_ms"] = np.nan

    with pytest.raises(ValueError, match="Input features contain missing.*latency_ms"):
        selector.select_features(df_with_nan)


def test_feature_selector_rejects_infinite_values(sample_valid_telemetry_df: pd.DataFrame) -> None:
    """Verify ValueError is raised when infinite values are present."""
    selector = TelemetryFeatureSelector()
    df_with_inf = sample_valid_telemetry_df.copy()
    df_with_inf.loc[0, "latency_ms"] = np.inf

    with pytest.raises(ValueError, match="Input features contain infinite values.*latency_ms"):
        selector.select_features(df_with_inf)


def test_feature_selector_rejects_non_numeric_column(sample_valid_telemetry_df: pd.DataFrame) -> None:
    """Verify ValueError is raised if a feature column is formatted as strings."""
    selector = TelemetryFeatureSelector()
    df_str = sample_valid_telemetry_df.copy()
    df_str["dns_response_time_ms"] = ["fast", "slow"]

    with pytest.raises(ValueError, match="Features must be purely numeric.*dns_response_time_ms"):
        selector.select_features(df_str)


def test_feature_selector_rejects_empty_dataframe() -> None:
    """Verify ValueError is raised for empty DataFrame."""
    selector = TelemetryFeatureSelector()
    empty_df = pd.DataFrame()

    with pytest.raises(ValueError, match="Input DataFrame is empty"):
        selector.select_features(empty_df)


def test_excluded_metadata_columns_not_in_features() -> None:
    """Verify none of the excluded metadata columns appear in the feature allowlist."""
    for col in EXCLUDED_METADATA_COLUMNS:
        assert col not in FEATURE_COLUMNS, f"Prohibited column {col} found in FEATURE_COLUMNS allowlist!"
