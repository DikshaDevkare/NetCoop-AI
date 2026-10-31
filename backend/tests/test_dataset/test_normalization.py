"""
Unit tests for telemetry normalization and Phase 2 schema mapping.
"""

from ml.preprocessing.normalizer import TelemetryNormalizer


def test_organizer_field_mapping() -> None:
    """Verify organizer keys map to standardized Phase 2 field names."""
    raw = {
        "incident_id": "INC-001",
        "scenario_id": "SCN-001",
        "scenario_label": "normal",
        "device_id": "SW_CAMPUS_01",
        "timestamp": "2026-11-01T08:00:00Z",
        "metrics": {
            "cpu_utilization_pct": 22.5,
            "link_utilization_pct": 35.0,
            "latency_ms": 12.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 2.5,
            "queue_drops": 5,
            "interface_errors": 2,
        },
    }
    normalized = TelemetryNormalizer.normalize_record(raw)
    assert normalized.cpu_usage_pct == 22.5
    assert normalized.bandwidth_utilization_pct == 35.0
    assert normalized.latency_ms == 12.0
    assert normalized.packet_loss_pct == 0.0
    assert normalized.jitter_ms == 2.5
    assert normalized.queue_drops == 5
    assert normalized.interface_errors == 2


def test_to_phase2_telemetry_records_validity() -> None:
    """Verify converted records validate against Phase 2 TelemetryRecord schema."""
    raw = {
        "incident_id": "INC-P2-01",
        "scenario_id": "SCN-P2",
        "scenario_label": "normal",
        "device_id": "SW_CAMPUS_01",
        "timestamp": "2026-11-01T08:00:00Z",
        "metrics": {
            "latency_ms": 15.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 3.0,
            "link_utilization_pct": 40.0,
            "cpu_utilization_pct": 25.0,
            "throughput_mbps": 95.0,
            "interface_status": "up",
        },
    }
    normalized = TelemetryNormalizer.normalize_record(raw)
    p2_records = TelemetryNormalizer.to_phase2_telemetry_records(normalized)

    assert len(p2_records) >= 10
    metric_names = [r.metric_name.value for r in p2_records]
    assert "latency" in metric_names
    assert "cpu_usage" in metric_names
    assert "packet_loss" in metric_names
    assert "interface_status" in metric_names
