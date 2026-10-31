"""
Configuration and constants for NetCoop AI synthetic telemetry dataset generation.
"""

from pathlib import Path
from typing import Dict, List

# Base directory for ML artifacts
ML_BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = ML_BASE_DIR / "datasets"
RAW_DATA_DIR = DATASETS_DIR / "raw"
PROCESSED_DATA_DIR = DATASETS_DIR / "processed"
TEST_CORPUS_DIR = DATASETS_DIR / "test_corpus"
REPORTS_DIR = ML_BASE_DIR / "reports"

# Ensure all target directories exist
for directory in [RAW_DATA_DIR, PROCESSED_DATA_DIR, TEST_CORPUS_DIR, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Default random seed for reproducible generation and partitioning
DEFAULT_RANDOM_SEED: int = 42

# Campus network segments (Problem Statement inspired)
CAMPUS_NETWORK_SEGMENTS: List[str] = [
    "CAMPUS_CORE",
    "DEPARTMENT_ETHERNET",
    "HOSTEL_WIFI",
    "SERVER_NETWORK",
    "LECTURE_HALL_NETWORK",
]

# Standard Clean Fault Scenarios (Scenarios A - G)
CLEAN_SCENARIOS: List[str] = [
    "normal",
    "latency_spike",
    "hardware_failure",
    "congestion",
    "weak_wifi",
    "interface_fault",
    "dns_dhcp_failure",
]

# Special Robustness Scenario (Scenario H - isolated from clean ML data)
ROBUSTNESS_SCENARIOS: List[str] = [
    "interoperability_failure",
]

# Default generation parameters
DEFAULT_INCIDENTS_PER_SCENARIO: int = 15  # Moderate, fast CPU-friendly default
DEFAULT_DEVICES_PER_INCIDENT: int = 3
DEFAULT_OBSERVATIONS_PER_DEVICE: int = 25
DEFAULT_SAMPLING_INTERVAL_SECONDS: int = 10

# Train / Validation / Test incident-wise split ratios
TRAIN_RATIO: float = 0.70
VAL_RATIO: float = 0.15
TEST_RATIO: float = 0.15
