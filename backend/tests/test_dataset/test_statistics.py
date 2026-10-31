"""
Unit tests for dataset statistics and reporting engine.
"""

import pandas as pd
from ml.dataset_statistics import DatasetStatisticsReporter


def test_statistics_generation() -> None:
    """Verify statistical report contains expected keys and metrics."""
    df = pd.DataFrame([
        {
            "incident_id": "INC-01",
            "device_id": "DEV-01",
            "scenario_label": "normal",
            "network_segment": "CAMPUS_CORE",
            "device_type": "switch",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": 10.0,
            "packet_loss_pct": 0.0,
            "bandwidth_utilization_pct": 30.0,
        },
        {
            "incident_id": "INC-01",
            "device_id": "DEV-01",
            "scenario_label": "normal",
            "network_segment": "CAMPUS_CORE",
            "device_type": "switch",
            "timestamp": "2026-11-01T08:00:10Z",
            "latency_ms": 20.0,
            "packet_loss_pct": 1.0,
            "bandwidth_utilization_pct": 40.0,
        },
    ])

    stats = DatasetStatisticsReporter.generate_statistics(df)

    assert stats["is_synthetic"] is True
    assert stats["total_records"] == 2
    assert stats["total_incidents"] == 1
    assert stats["total_devices"] == 1
    assert stats["scenarios_distribution"]["normal"] == 2
    assert stats["numeric_metrics_summary"]["latency_ms"]["mean"] == 15.0
    assert stats["numeric_metrics_summary"]["latency_ms"]["min"] == 10.0
    assert stats["numeric_metrics_summary"]["latency_ms"]["max"] == 20.0
