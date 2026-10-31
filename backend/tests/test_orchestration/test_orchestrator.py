"""
Unit and integration tests for MultiAgentOrchestrator and ModelService.
"""

from typing import Any, Dict, List
import pandas as pd
import pytest

from app.schemas.enums import AgentId
from app.services.orchestration.model_service import ModelService
from app.services.orchestration.orchestrator import MultiAgentOrchestrator


@pytest.fixture
def orchestrator() -> MultiAgentOrchestrator:
    return MultiAgentOrchestrator()


@pytest.fixture
def congestion_telemetry() -> List[Dict[str, Any]]:
    return [
        {
            "device_id": "SW-DIST-01",
            "device_type": "switch",
            "timestamp": "2026-10-31T12:00:00Z",
            "latency_ms": 195.0,
            "packet_loss_pct": 4.2,
            "jitter_ms": 32.0,
            "throughput_mbps": 940.0,
            "bandwidth_utilization_pct": 95.0,
            "cpu_usage_pct": 48.0,
            "memory_usage_pct": 52.0,
            "temperature_celsius": 45.0,
            "device_uptime_seconds": 86400.0,
            "dns_response_time_ms": 12.0,
            "queue_drops": 420,
            "interface_errors": 0,
            "retransmissions": 75,
        },
        {
            "device_id": "SW-DIST-01",
            "device_type": "switch",
            "timestamp": "2026-10-31T12:01:00Z",
            "latency_ms": 220.0,
            "packet_loss_pct": 5.1,
            "jitter_ms": 38.0,
            "throughput_mbps": 960.0,
            "bandwidth_utilization_pct": 98.0,
            "cpu_usage_pct": 52.0,
            "memory_usage_pct": 55.0,
            "temperature_celsius": 46.0,
            "device_uptime_seconds": 86460.0,
            "dns_response_time_ms": 14.0,
            "queue_drops": 550,
            "interface_errors": 0,
            "retransmissions": 90,
        },
    ]


@pytest.fixture
def hardware_failure_telemetry() -> List[Dict[str, Any]]:
    return [
        {
            "device_id": "RTR-CORE-01",
            "device_type": "router",
            "timestamp": "2026-10-31T12:00:00Z",
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
        }
    ]


def test_successful_five_agent_execution(
    orchestrator: MultiAgentOrchestrator,
    congestion_telemetry: List[Dict[str, Any]],
) -> None:
    report = orchestrator.diagnose(congestion_telemetry, incident_id="INC-TEST-01")

    # 1. Summary verification
    assert report["incident_summary"]["incident_id"] == "INC-TEST-01"
    assert report["incident_summary"]["overall_status"] in ("DEGRADED", "CRITICAL")
    assert "SW-DIST-01" in report["incident_summary"]["affected_devices"]

    # 2. Root cause hypothesis
    root_cause = report["probable_root_cause"]
    assert "Congestion" in root_cause["primary_hypothesis"]
    assert len(root_cause["alternative_hypotheses"]) > 0

    # 3. ML signals
    ml_signals = report["machine_learning_signals"]
    assert "anomaly_detection" in ml_signals
    assert "fault_classification" in ml_signals
    assert "temporal_trajectory" in ml_signals

    # 4. Remediation actions
    recs = report["recommended_corrective_actions"]
    assert len(recs) >= 2
    assert any("QoS" in r["action"] or "Uplink" in r["action"] for r in recs)

    # 5. Agent execution summary
    meta = report["orchestration_metadata"]
    assert meta["agents_executed_count"] == 5
    summary = meta["agent_execution_summary"]
    assert summary["telemetry_performance"]["status"] == "success"
    assert summary["infrastructure_health"]["status"] == "success"
    assert summary["connectivity_analysis"]["status"] == "success"
    assert summary["fault_correlation"]["status"] == "success"
    assert summary["recommendation_reporting"]["status"] == "success"


def test_hardware_failure_diagnosis(
    orchestrator: MultiAgentOrchestrator,
    hardware_failure_telemetry: List[Dict[str, Any]],
) -> None:
    report = orchestrator.diagnose(hardware_failure_telemetry, incident_id="INC-HW-01")
    assert report["incident_summary"]["overall_status"] == "CRITICAL"
    assert "Hardware" in report["probable_root_cause"]["primary_hypothesis"] or "CPU" in report["probable_root_cause"]["primary_hypothesis"]
    assert report["incident_summary"]["severity"] == "critical"


def test_empty_telemetry_handling(orchestrator: MultiAgentOrchestrator) -> None:
    report = orchestrator.diagnose([], incident_id="INC-EMPTY-01")
    assert report["incident_summary"]["overall_status"] == "UNKNOWN"
    assert report["probable_root_cause"]["primary_hypothesis"] == "Insufficient Telemetry"
    assert report["probable_root_cause"]["confidence"] == "low"
    assert len(report["evidence_trail"]) == 0


def test_partial_agent_failure_resilience(
    orchestrator: MultiAgentOrchestrator,
    congestion_telemetry: List[Dict[str, Any]],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Force infrastructure agent to raise an error
    def mock_fail(*args: Any, **kwargs: Any) -> Any:
        raise RuntimeError("Simulated transient sensor fault in Infra agent")

    monkeypatch.setattr(orchestrator.infrastructure_agent, "analyze", mock_fail)

    report = orchestrator.diagnose(congestion_telemetry, incident_id="INC-PARTIAL-01")

    # Workflow still succeeds and provides diagnosis from surviving agents
    assert report["incident_summary"]["incident_id"] == "INC-PARTIAL-01"
    summary = report["orchestration_metadata"]["agent_execution_summary"]
    assert summary["infrastructure_health"]["status"] == "failed"
    assert summary["telemetry_performance"]["status"] == "success"
    assert summary["fault_correlation"]["status"] == "success"
    assert summary["recommendation_reporting"]["status"] == "success"


def test_model_service_caching_and_statuses() -> None:
    service = ModelService.get_instance()
    statuses = service.get_model_statuses()
    assert len(statuses) == 3

    names = [s["name"] for s in statuses]
    assert "Isolation Forest Anomaly Detector" in names
    assert "XGBoost Multi-Class Fault Classifier" in names
    assert "Sequence Temporal Pattern Analyzer" in names

    # All three should be ready
    for s in statuses:
        assert s["available"] is True
        assert s["status"] == "ready"


def test_agent_statuses(orchestrator: MultiAgentOrchestrator) -> None:
    agents = orchestrator.get_agent_statuses()
    assert len(agents) == 5
    ids = [a["agent_id"] for a in agents]
    assert AgentId.TELEMETRY_PERFORMANCE.value in ids
    assert AgentId.INFRASTRUCTURE_HEALTH.value in ids
    assert AgentId.CONNECTIVITY_ANALYSIS.value in ids
    assert AgentId.FAULT_CORRELATION.value in ids
    assert AgentId.RECOMMENDATION_REPORTING.value in ids
