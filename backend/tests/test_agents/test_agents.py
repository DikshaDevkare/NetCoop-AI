"""
Unit tests for all 5 specialized diagnostic agents in NetCoop AI.
"""

import pandas as pd
import pytest

from app.schemas.enums import AgentId, ConfidenceLevel, MessageType, Severity
from agents.connectivity.agent import ConnectivityAnalysisAgent
from agents.fault_correlation.agent import FaultCorrelationAgent
from agents.infrastructure_health.agent import InfrastructureHealthAgent
from agents.recommendation_reporting.agent import RecommendationReportingAgent
from agents.telemetry_performance.agent import TelemetryPerformanceAgent


@pytest.fixture
def normal_telemetry_df() -> pd.DataFrame:
    return pd.DataFrame([{
        "incident_id": "INC-01",
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
    }])


@pytest.fixture
def congestion_telemetry_df() -> pd.DataFrame:
    return pd.DataFrame([{
        "incident_id": "INC-02",
        "device_id": "SW-DIST-01",
        "device_type": "switch",
        "latency_ms": 180.0,
        "packet_loss_pct": 4.5,
        "jitter_ms": 35.0,
        "throughput_mbps": 950.0,
        "bandwidth_utilization_pct": 94.0,
        "cpu_usage_pct": 45.0,
        "memory_usage_pct": 50.0,
        "temperature_celsius": 48.0,
        "device_uptime_seconds": 54000.0,
        "dns_response_time_ms": 15.0,
        "queue_drops": 450,
        "interface_errors": 0,
        "retransmissions": 80,
    }])


@pytest.fixture
def hardware_failure_df() -> pd.DataFrame:
    return pd.DataFrame([{
        "incident_id": "INC-03",
        "device_id": "RTR-CORE-01",
        "device_type": "router",
        "latency_ms": 600.0,
        "packet_loss_pct": 22.0,
        "jitter_ms": 40.0,
        "throughput_mbps": 100.0,
        "bandwidth_utilization_pct": 100.0,
        "cpu_usage_pct": 99.9,
        "memory_usage_pct": 95.0,
        "temperature_celsius": 78.0,
        "device_uptime_seconds": 120.0,
        "dns_response_time_ms": 200.0,
        "queue_drops": 8000,
        "interface_errors": 250,
        "retransmissions": 120,
    }])


def test_telemetry_performance_agent_normal(normal_telemetry_df: pd.DataFrame) -> None:
    agent = TelemetryPerformanceAgent()
    msgs = agent.analyze(normal_telemetry_df, context={"incident_id": "INC-01"})
    # Normal data produces no anomalous evidence or findings
    assert len(msgs) == 0


def test_telemetry_performance_agent_congestion(congestion_telemetry_df: pd.DataFrame) -> None:
    agent = TelemetryPerformanceAgent()
    msgs = agent.analyze(congestion_telemetry_df, context={"incident_id": "INC-02"})
    assert len(msgs) > 0

    evidence_msgs = [m for m in msgs if m.message_type == MessageType.EVIDENCE]
    finding_msgs = [m for m in msgs if m.message_type == MessageType.DIAGNOSTIC_FINDING]

    assert len(evidence_msgs) >= 3
    assert len(finding_msgs) == 1
    fnd = finding_msgs[0].payload
    assert "Congestion" in fnd.title
    assert "SW-DIST-01" in fnd.affected_devices


def test_infrastructure_health_agent_hardware_failure(hardware_failure_df: pd.DataFrame) -> None:
    agent = InfrastructureHealthAgent()
    msgs = agent.analyze(hardware_failure_df, context={"incident_id": "INC-03"})
    assert len(msgs) > 0

    finding_msgs = [m for m in msgs if m.message_type == MessageType.DIAGNOSTIC_FINDING]
    assert len(finding_msgs) == 1
    fnd = finding_msgs[0].payload
    assert fnd.severity == Severity.CRITICAL
    assert "CPU" in fnd.title or "Hardware" in fnd.title


def test_connectivity_agent_missing_rssi_on_wired_switch_is_normal(normal_telemetry_df: pd.DataFrame) -> None:
    agent = ConnectivityAnalysisAgent()
    # On a wired switch, missing wireless RSSI must NOT produce a fault
    msgs = agent.analyze(normal_telemetry_df, context={"incident_id": "INC-01"})
    assert len(msgs) == 0


def test_connectivity_agent_weak_wifi() -> None:
    wifi_df = pd.DataFrame([{
        "incident_id": "INC-04",
        "device_id": "AP-DORM-01",
        "device_type": "access_point",
        "latency_ms": 25.0,
        "packet_loss_pct": 1.2,
        "wireless_signal_strength_dbm": -84.0,  # Severe attenuation
        "dns_response_time_ms": 10.0,
    }])
    agent = ConnectivityAnalysisAgent()
    msgs = agent.analyze(wifi_df, context={"incident_id": "INC-04"})
    assert len(msgs) > 0
    fnd = [m.payload for m in msgs if m.message_type == MessageType.DIAGNOSTIC_FINDING][0]
    assert "Wireless" in fnd.title or "Wi-Fi" in fnd.title


def test_fault_correlation_agent_end_to_end(congestion_telemetry_df: pd.DataFrame) -> None:
    telem_agent = TelemetryPerformanceAgent()
    telem_msgs = telem_agent.analyze(congestion_telemetry_df, context={"incident_id": "INC-02"})

    corr_agent = FaultCorrelationAgent()
    corr_msgs = corr_agent.analyze(
        congestion_telemetry_df,
        context={
            "incident_id": "INC-02",
            "agent_messages": telem_msgs,
            "ml_prediction": {"predicted_fault": "congestion", "confidence": 0.95},
        },
    )
    assert len(corr_msgs) == 1
    msg = corr_msgs[0]
    assert msg.message_type == MessageType.DIAGNOSTIC_FINDING
    fnd = msg.payload
    assert "Congestion" in fnd.suspected_cause
    assert "SW-DIST-01" in fnd.affected_devices


def test_recommendation_reporting_agent_generates_plan() -> None:
    rec_agent = RecommendationReportingAgent()
    correlation_result = {
        "primary_hypothesis": "Network Uplink Congestion & Queue Buffer Saturation",
        "alternative_hypotheses": ["ISP throttling"],
        "correlation_explanation": "Uplink queue drops detected.",
        "severity": Severity.HIGH,
        "confidence": ConfidenceLevel.HIGH,
        "affected_devices": ["SW-DIST-01"],
        "affected_segments": ["Distribution Aggregation Tier"],
        "supporting_evidence": [{"evidence_id": "EVD-01", "description": "Queue drops exceeded 400"}],
        "conflicting_evidence": [],
        "uncertainty_notes": [],
    }

    msgs = rec_agent.analyze(
        pd.DataFrame(),
        context={"incident_id": "INC-02", "correlation_result": correlation_result},
    )
    assert len(msgs) == 1
    fnd = msgs[0].payload
    report = fnd.metadata["report_payload"]
    assert report["incident_summary"]["incident_id"] == "INC-02"
    assert len(report["recommended_corrective_actions"]) >= 2
    assert report["probable_root_cause"]["primary_hypothesis"] == correlation_result["primary_hypothesis"]
