"""
Configuration and constants for NetCoop AI Temporal Network Pattern Analysis.
"""

from pathlib import Path
from typing import Dict, List

from ml.config import PROCESSED_DATA_DIR

# Directory paths
TEMPORAL_DIR = Path(__file__).resolve().parent
MODELS_DIR = TEMPORAL_DIR / "models"
REPORTS_DIR = TEMPORAL_DIR / "reports"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

METADATA_FILE = MODELS_DIR / "temporal_metadata.json"
REPORT_FILE = REPORTS_DIR / "temporal_analysis_report.md"

# Dataset paths
TRAIN_DATA_PATH = PROCESSED_DATA_DIR / "train.csv"
VAL_DATA_PATH = PROCESSED_DATA_DIR / "val.csv"
TEST_DATA_PATH = PROCESSED_DATA_DIR / "test.csv"

# Temporal window parameters
DEFAULT_WINDOW_SIZE: int = 5
MIN_SEQUENCE_LENGTH: int = 2

# Core telemetry metrics analyzed for temporal dynamics
TEMPORAL_METRICS: List[str] = [
    "latency_ms",
    "packet_loss_pct",
    "jitter_ms",
    "throughput_mbps",
    "bandwidth_utilization_pct",
    "cpu_usage_pct",
    "memory_usage_pct",
    "queue_drops",
    "interface_errors",
]

# Baseline threshold boundaries for normal behavior
NORMAL_BASELINES: Dict[str, float] = {
    "latency_ms": 25.0,
    "packet_loss_pct": 0.05,
    "jitter_ms": 6.0,
    "throughput_mbps": 50.0,  # Minimum healthy throughput
    "cpu_usage_pct": 50.0,
    "memory_usage_pct": 60.0,
    "bandwidth_utilization_pct": 60.0,
    "queue_drops": 5.0,
    "interface_errors": 2.0,
}

# Trend thresholds
SLOPE_DEGRADATION_THRESHOLD: float = 0.05  # Normalized upward slope indicating degradation
VOLATILITY_CV_THRESHOLD: float = 0.40      # Coefficient of variation indicating volatility
PERSISTENCE_MIN_STEPS: int = 2            # Minimum consecutive steps to declare persistent anomaly
