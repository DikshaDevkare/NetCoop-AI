"""
Configuration and constants for NetCoop AI XGBoost Multi-Class Fault Classification.
"""

from pathlib import Path
from typing import Dict, List

from ml.config import PROCESSED_DATA_DIR

# Directory paths
FAULT_CLASSIFICATION_DIR = Path(__file__).resolve().parent
MODELS_DIR = FAULT_CLASSIFICATION_DIR / "models"
REPORTS_DIR = FAULT_CLASSIFICATION_DIR / "reports"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Model artifact paths
MODEL_FILE = MODELS_DIR / "xgboost_classifier.joblib"
METADATA_FILE = MODELS_DIR / "classifier_metadata.json"
METRICS_FILE = MODELS_DIR / "classification_metrics.json"

# Dataset paths
TRAIN_DATA_PATH = PROCESSED_DATA_DIR / "train.csv"
VAL_DATA_PATH = PROCESSED_DATA_DIR / "val.csv"
TEST_DATA_PATH = PROCESSED_DATA_DIR / "test.csv"

# Strict 18-feature allowlist in deterministic order (matching Phase 3.2)
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

# Excluded metadata columns
EXCLUDED_METADATA_COLUMNS: List[str] = [
    "incident_id",
    "scenario_id",
    "scenario_label",
    "device_id",
    "timestamp",
    "device_type",
    "device_role",
    "hostname",
    "ip_address",
    "firmware_version",
    "topology_tier",
    "network_segment",
    "mac_address",
    "cleanliness_flags",
]

TARGET_COLUMN = "scenario_label"

# Target classes in canonical ordering
TARGET_CLASSES: List[str] = [
    "normal",
    "congestion",
    "dns_dhcp_failure",
    "hardware_failure",
    "weak_wifi",
    "interface_fault",
    "latency_spike",
]

LABEL_TO_INDEX: Dict[str, int] = {label: idx for idx, label in enumerate(TARGET_CLASSES)}
INDEX_TO_LABEL: Dict[int, str] = {idx: label for idx, label in enumerate(TARGET_CLASSES)}

# Default XGBoost hyperparameters
DEFAULT_HYPERPARAMETERS = {
    "n_estimators": 120,
    "max_depth": 5,
    "learning_rate": 0.08,
    "subsample": 0.85,
    "colsample_bytree": 0.85,
    "objective": "multi:softprob",
    "eval_metric": "mlogloss",
    "random_state": 42,
    "n_jobs": -1,
}
