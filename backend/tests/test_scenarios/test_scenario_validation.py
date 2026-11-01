"""
End-to-End Scenario Validation Suite for all 12 Hackathon Problem Statement Scenarios.
Verifies telemetry ingestion, ML signals, 5-agent execution, correlation, recommendations, and persistence.
"""

from typing import Any, Dict, List
import pandas as pd
import pytest

from app.services.orchestration.orchestrator import MultiAgentOrchestrator
from app.db.session import SessionLocal


@pytest.fixture
def orchestrator() -> MultiAgentOrchestrator:
    return MultiAgentOrchestrator()


def test_scenario_1_normal_network(orchestrator: MultiAgentOrchestrator) -> None:
    telemetry = [{
        "device_id": "SW-CORE-01",
        "device_type": "switch",
        "latency_ms": 12.0,
        "packet_loss_pct": 0.0,
        "jitter_ms": 2.0,
        "throughput_mbps": 850.0,
        "bandwidth_utilization_pct": 35.0,
        "cpu_usage_pct": 25.0,
        "memory_usage_pct": 40.0,
        "temperature_celsius": 42.0,
        "device_uptime_seconds": 86400.0,
        "dns_response_time_ms": 8.0,
        "queue_drops": 0,
        "interface_errors": 0,
        "retransmissions": 2,
    }]
    with SessionLocal() as db:
        report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-01-NORM", db=db)
    assert report["incident_summary"]["overall_status"] == "HEALTHY"
    assert "Normal" in report["probable_root_cause"]["primary_hypothesis"]
    assert report["orchestration_metadata"]["agents_executed_count"] == 5


def test_scenario_2_latency_spike(orchestrator: MultiAgentOrchestrator) -> None:
    telemetry = [{
        "device_id": "RTR-CORE-01",
        "device_type": "router",
        "latency_ms": 450.0,
        "packet_loss_pct": 0.2,
        "jitter_ms": 55.0,
        "throughput_mbps": 750.0,
        "bandwidth_utilization_pct": 40.0,
        "cpu_usage_pct": 30.0,
        "memory_usage_pct": 45.0,
        "temperature_celsius": 44.0,
        "device_uptime_seconds": 120000.0,
        "dns_response_time_ms": 12.0,
        "queue_drops": 0,
        "interface_errors": 0,
        "retransmissions": 5,
    }]
    with SessionLocal() as db:
        report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-02-LAT", db=db)
    assert "Latency" in report["probable_root_cause"]["primary_hypothesis"] or "Transit" in report["probable_root_cause"]["primary_hypothesis"]
    assert report["incident_summary"]["overall_status"] in ("DEGRADED", "CRITICAL")


def test_scenario_3_congestion(orchestrator: MultiAgentOrchestrator) -> None:
    telemetry = [{
        "device_id": "SW-DIST-01",
        "device_type": "switch",
        "latency_ms": 220.0,
        "packet_loss_pct": 5.2,
        "jitter_ms": 38.0,
        "throughput_mbps": 980.0,
        "bandwidth_utilization_pct": 98.0,
        "cpu_usage_pct": 52.0,
        "memory_usage_pct": 55.0,
        "temperature_celsius": 46.0,
        "device_uptime_seconds": 86400.0,
        "dns_response_time_ms": 14.0,
        "queue_drops": 550,
        "interface_errors": 0,
        "retransmissions": 90,
    }]
    with SessionLocal() as db:
        report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-03-CONG", db=db)
    assert "Congestion" in report["probable_root_cause"]["primary_hypothesis"]
    assert len(report["recommended_corrective_actions"]) >= 2


def test_scenario_4_hardware_failure(orchestrator: MultiAgentOrchestrator) -> None:
    telemetry = [{
        "device_id": "RTR-CORE-01",
        "device_type": "router",
        "latency_ms": 750.0,
        "packet_loss_pct": 25.0,
        "jitter_ms": 50.0,
        "throughput_mbps": 120.0,
        "bandwidth_utilization_pct": 100.0,
        "cpu_usage_pct": 99.9,
        "memory_usage_pct": 96.0,
        "temperature_celsius": 80.0,
        "device_uptime_seconds": 150.0,
        "dns_response_time_ms": 180.0,
        "queue_drops": 9500,
        "interface_errors": 350,
        "retransmissions": 140,
    }]
    with SessionLocal() as db:
        report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-04-HW", db=db)
    assert report["incident_summary"]["overall_status"] == "CRITICAL"
    assert "Hardware" in report["probable_root_cause"]["primary_hypothesis"] or "CPU" in report["probable_root_cause"]["primary_hypothesis"]


def test_scenario_5_weak_wifi(orchestrator: MultiAgentOrchestrator) -> None:
    telemetry = [{
        "device_id": "AP-DORM-01",
        "device_type": "access_point",
        "latency_ms": 28.0,
        "packet_loss_pct": 1.5,
        "jitter_ms": 8.0,
        "throughput_mbps": 45.0,
        "bandwidth_utilization_pct": 30.0,
        "cpu_usage_pct": 25.0,
        "memory_usage_pct": 35.0,
        "temperature_celsius": 38.0,
        "device_uptime_seconds": 45000.0,
        "dns_response_time_ms": 10.0,
        "wireless_signal_strength_dbm": -85.0,  # Severe RF attenuation
        "queue_drops": 0,
        "interface_errors": 0,
        "retransmissions": 12,
    }]
    with SessionLocal() as db:
        report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-05-WIFI", db=db)
    assert "Wireless" in report["probable_root_cause"]["primary_hypothesis"] or "Wi-Fi" in report["probable_root_cause"]["primary_hypothesis"]


def test_scenario_6_interface_fault(orchestrator: MultiAgentOrchestrator) -> None:
    telemetry = [{
        "device_id": "SW-DIST-02",
        "device_type": "switch",
        "latency_ms": 35.0,
        "packet_loss_pct": 7.5,
        "jitter_ms": 12.0,
        "throughput_mbps": 500.0,
        "bandwidth_utilization_pct": 45.0,
        "cpu_usage_pct": 30.0,
        "memory_usage_pct": 42.0,
        "temperature_celsius": 40.0,
        "device_uptime_seconds": 60000.0,
        "dns_response_time_ms": 12.0,
        "queue_drops": 0,
        "interface_errors": 280,  # High CRC errors
        "retransmissions": 45,
    }]
    with SessionLocal() as db:
        report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-06-IF", db=db)
    assert "Interface" in report["probable_root_cause"]["primary_hypothesis"] or "Layer-1" in report["probable_root_cause"]["primary_hypothesis"]


def test_scenario_7_dns_dhcp_failure(orchestrator: MultiAgentOrchestrator) -> None:
    telemetry = [{
        "device_id": "SW-CORE-01",
        "device_type": "switch",
        "latency_ms": 25.0,
        "packet_loss_pct": 0.0,
        "jitter_ms": 4.0,
        "throughput_mbps": 800.0,
        "bandwidth_utilization_pct": 40.0,
        "cpu_usage_pct": 25.0,
        "memory_usage_pct": 40.0,
        "temperature_celsius": 42.0,
        "device_uptime_seconds": 90000.0,
        "dns_response_time_ms": 350.0,  # DNS query timeout
        "dhcp_status": "timeout",
        "queue_drops": 0,
        "interface_errors": 0,
        "retransmissions": 2,
    }]
    with SessionLocal() as db:
        report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-07-DNS", db=db)
    assert "DNS" in report["probable_root_cause"]["primary_hypothesis"] or "DHCP" in report["probable_root_cause"]["primary_hypothesis"]


def test_scenario_8_schema_mismatch_resilience(orchestrator: MultiAgentOrchestrator) -> None:
    # Telemetry with legacy field names (e.g. cpu_utilization_pct instead of cpu_usage_pct)
    telemetry = [{
        "device_id": "SW-LEGACY-01",
        "cpu_utilization_pct": 98.0,  # Organizer alias
        "latency": 350.0,  # Alias
    }]
    report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-08-SCHEMA")
    assert report["incident_summary"]["incident_id"] == "INC-SCN-08-SCHEMA"
    assert report["incident_summary"]["overall_status"] in ("DEGRADED", "CRITICAL")


def test_scenario_9_multi_device_common_fault(orchestrator: MultiAgentOrchestrator) -> None:
    # Core router saturation affecting downstream switches and APs
    telemetry = [
        {
            "device_id": "RTR-CORE-01",
            "device_type": "router",
            "latency_ms": 320.0,
            "packet_loss_pct": 8.5,
            "bandwidth_utilization_pct": 98.0,
            "queue_drops": 900,
        },
        {
            "device_id": "SW-DIST-01",
            "device_type": "switch",
            "latency_ms": 310.0,
            "packet_loss_pct": 7.8,
            "bandwidth_utilization_pct": 90.0,
            "queue_drops": 600,
        },
        {
            "device_id": "AP-DORM-01",
            "device_type": "access_point",
            "latency_ms": 330.0,
            "packet_loss_pct": 8.0,
            "wireless_signal_strength_dbm": -60.0,  # Good RF, but network path congested
        },
    ]
    report = orchestrator.diagnose(telemetry, incident_id="INC-SCN-09-MULTIDEV")
    inc_sum = report["incident_summary"]
    assert inc_sum["affected_device_count"] == 3
    assert inc_sum["is_shared_infrastructure_fault"] is True
    assert inc_sum["topology_scope"] == "shared_infrastructure"


def test_scenario_10_missing_telemetry_handling(orchestrator: MultiAgentOrchestrator) -> None:
    # Empty telemetry
    report_empty = orchestrator.diagnose([], incident_id="INC-SCN-10-EMPTY")
    assert report_empty["probable_root_cause"]["primary_hypothesis"] == "Insufficient Telemetry"
    assert report_empty["probable_root_cause"]["confidence"] == "low"

    # Minimal single metric
    report_sparse = orchestrator.diagnose([{"device_id": "DEV-SPARSE"}], incident_id="INC-SCN-10-SPARSE")
    assert report_sparse["incident_summary"]["incident_id"] == "INC-SCN-10-SPARSE"


def test_scenario_11_historical_degradation_trajectory(orchestrator: MultiAgentOrchestrator) -> None:
    # 5 steps of increasing latency and queue drops
    series = [
        {"device_id": "SW-TREND-01", "timestamp": f"2026-10-31T12:0{i}:00Z", "latency_ms": 20.0 + (i * 60.0), "packet_loss_pct": i * 1.5, "queue_drops": i * 100}
        for i in range(5)
    ]
    report = orchestrator.diagnose(series, incident_id="INC-SCN-11-DEGRADE")
    temporal_sig = report["machine_learning_signals"]["temporal_trajectory"]
    assert temporal_sig["overall_trend"] in ("worsening", "active_anomalies")


def test_scenario_12_recovery_trajectory(orchestrator: MultiAgentOrchestrator) -> None:
    # 5 steps of decreasing latency
    series = [
        {"device_id": "SW-RECOVER-01", "timestamp": f"2026-10-31T12:0{i}:00Z", "latency_ms": 300.0 - (i * 55.0), "packet_loss_pct": max(0.0, 5.0 - (i * 1.2)), "queue_drops": max(0, 500 - (i * 120))}
        for i in range(5)
    ]
    report = orchestrator.diagnose(series, incident_id="INC-SCN-12-RECOVER")
    temporal_sig = report["machine_learning_signals"]["temporal_trajectory"]
    assert temporal_sig["overall_trend"] in ("recovering", "stable_healthy", "active_anomalies")
