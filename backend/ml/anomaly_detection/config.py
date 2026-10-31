"""
Configuration and constants for NetCoop AI Isolation Forest Anomaly Detection.
"""

from pathlib import Path
from typing import List

from ml.config import PROCESSED_DATA_DIR

# Directory paths
ANOMALY_DETECTION_DIR = Path(__file__).resolve().parent
MODELS_DIR = ANOMALY_DETECTION_DIR / "models"
REPORTS_DIR = ANOMALY_DETECTION_DIR / "reports"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Model artifact paths
MODEL_FILE = MODELS_DIR / "isolation_forest.joblib"
METADATA_FILE = MODELS_DIR / "model_metadata.json"
VAL_METRICS_FILE = MODELS_DIR / "validation_metrics.json"
TEST_METRICS_FILE = MODELS_DIR / "test_metrics.json"

# Dataset paths
TRAIN_DATA_PATH = PROCESSED_DATA_DIR / "train.csv"
VAL_DATA_PATH = PROCESSED_DATA_DIR / "val.csv"
TEST_DATA_PATH = PROCESSED_DATA_DIR / "test.csv"

# Strict 18-feature allowlist in deterministic order
FEATURE_COLUMNS: List[str] = [
    # Performance (5)
    "latency_ms",
    "packet_loss_pct",
    "jitter_ms",
    "throughput_mbps",
    "bandwidth_utilization_pct",
    # Infrastructure (4)
    "cpu_usage_pct",
    "memory_usage_pct",
    "device_uptime_seconds",
    "temperature_celsius",
    # Connectivity and errors (4)
    "dns_response_time_ms",
    "queue_drops",
    "interface_errors",
    "retransmissions",
    # Temporal (5)
    "rolling_latency_mean",
    "rolling_latency_std",
    "rolling_packet_loss_mean",
    "latency_change_rate",
    "queue_drop_rate",
]

# Prohibited columns that must never be passed to the model
EXCLUDED_METADATA_COLUMNS: List[str] = [
    "incident_id",
    "scenario_id",
    "scenario_label",
    "device_id",
    "device_type",
    "hostname",
    "network_segment",
    "timestamp",
    "status",
    "interface_status",
    "dns_resolution_status",
    "dhcp_status",
    "gateway_reachability",
    "interface_connectivity",
    "wireless_signal_strength_dbm",
    "bandwidth_pressure_indicator",
    "synthetic_data",
]

# Default Isolation Forest hyperparameters
DEFAULT_N_ESTIMATORS: int = 100
DEFAULT_MAX_SAMPLES: str = "auto"
DEFAULT_MAX_FEATURES: float = 1.0
DEFAULT_CONTAMINATION: str = "auto"
DEFAULT_RANDOM_STATE: int = 42

# Validation threshold tuning configuration
DEFAULT_F_BETA: float = 2.0  # F2-score prioritizes fault recall over precision
DEFAULT_THRESHOLD_CANDIDATES: int = 100
