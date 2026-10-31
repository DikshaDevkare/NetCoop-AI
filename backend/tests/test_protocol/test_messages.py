"""
Unit and integration tests for the universal AgentMessage envelope and payload validation.
"""

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.common import PROTOCOL_VERSION
from app.schemas.device import Device
from app.schemas.enums import (
    AgentId,
    ConfidenceLevel,
    DeviceType,
    MessageType,
    MetricCategory,
    MetricName,
    MetricUnit,
    Severity,
)
from app.schemas.evidence import Evidence, Observation
from app.schemas.findings import DiagnosticFinding
from app.schemas.messages import (
    AgentMessage,
    ConnectivityPayload,
    DeviceHealthPayload,
    ErrorPayload,
    StatusPayload,
    TelemetryBatchPayload,
)
from app.schemas.telemetry import TelemetryRecord


@pytest.fixture
def client() -> TestClient:
    """FastAPI TestClient fixture."""
    return TestClient(app, raise_server_exceptions=False)


def test_valid_observation_message() -> None:
    """Verify standard observation message envelope with nested observation payload."""
    msg = AgentMessage(
        message_id="msg-001",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.TELEMETRY_PERFORMANCE,
        receiver=AgentId.FAULT_CORRELATION,
        message_type=MessageType.OBSERVATION,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={
            "observation_id": "OBS-001",
            "incident_id": "INC-1001",
            "device_id": "AP-101",
            "source_agent": "telemetry_performance",
            "observation_type": "high_packet_loss",
            "description": "Packet loss exceeded configured 5% threshold.",
            "observed_at": "2026-10-31T17:29:00Z",
            "related_telemetry_ids": ["TEL-001"],
        },
        metadata={"priority": "high"},
    )
    assert msg.message_id == "msg-001"
    assert msg.protocol_version == "1.0"
    assert isinstance(msg.payload, Observation)
    assert msg.payload.observation_id == "OBS-001"


def test_valid_telemetry_message() -> None:
    """Verify message envelope containing a TelemetryRecord payload."""
    msg = AgentMessage(
        message_id="msg-002",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.TELEMETRY_PERFORMANCE,
        receiver=AgentId.FAULT_CORRELATION,
        message_type=MessageType.TELEMETRY,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={
            "telemetry_id": "TEL-001",
            "device_id": "AP-101",
            "metric_name": "latency",
            "metric_category": "performance",
            "value": 142.0,
            "unit": "ms",
            "timestamp": "2026-10-31T17:30:00Z",
            "source": "collector",
        },
    )
    assert isinstance(msg.payload, TelemetryRecord)
    assert msg.payload.value == 142.0


def test_valid_telemetry_batch_message() -> None:
    """Verify message envelope containing a batch of telemetry records."""
    msg = AgentMessage(
        message_id="msg-003",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.TELEMETRY_PERFORMANCE,
        receiver=AgentId.FAULT_CORRELATION,
        message_type=MessageType.TELEMETRY,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={
            "records": [
                {
                    "telemetry_id": "TEL-001",
                    "device_id": "AP-101",
                    "metric_name": "latency",
                    "metric_category": "performance",
                    "value": 142.0,
                    "unit": "ms",
                    "timestamp": "2026-10-31T17:30:00Z",
                    "source": "collector",
                },
                {
                    "telemetry_id": "TEL-002",
                    "device_id": "AP-101",
                    "metric_name": "packet_loss",
                    "metric_category": "performance",
                    "value": 12.5,
                    "unit": "%",
                    "timestamp": "2026-10-31T17:30:00Z",
                    "source": "collector",
                },
            ]
        },
    )
    assert isinstance(msg.payload, TelemetryBatchPayload)
    assert len(msg.payload.records) == 2


def test_valid_evidence_message() -> None:
    """Verify message envelope containing an Evidence payload."""
    msg = AgentMessage(
        message_id="msg-004",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.INFRASTRUCTURE_HEALTH,
        receiver=AgentId.FAULT_CORRELATION,
        message_type=MessageType.EVIDENCE,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={
            "evidence_id": "EVD-001",
            "incident_id": "INC-1001",
            "source_agent": "infrastructure_health",
            "evidence_type": "high_cpu",
            "description": "Switch CPU hit 95%.",
            "observed_at": "2026-10-31T17:30:00Z",
            "supports_hypothesis": True,
        },
    )
    assert isinstance(msg.payload, Evidence)
    assert msg.payload.supports_hypothesis is True


def test_valid_diagnostic_finding_message() -> None:
    """Verify message envelope containing a DiagnosticFinding payload."""
    msg = AgentMessage(
        message_id="msg-005",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.FAULT_CORRELATION,
        receiver=AgentId.RECOMMENDATION_REPORTING,
        message_type=MessageType.DIAGNOSTIC_FINDING,
        timestamp="2026-10-31T17:35:00Z",
        correlation_id="INC-1001",
        payload={
            "finding_id": "FND-001",
            "incident_id": "INC-1001",
            "source_agent": "fault_correlation",
            "title": "Core Uplink Congestion",
            "description": "Buffer saturation on core switch produced drops.",
            "suspected_cause": "Bandwidth saturation",
            "severity": "high",
            "confidence": "high",
            "affected_devices": ["SW-CORE-01"],
            "supporting_evidence_ids": ["EVD-001"],
            "alternative_causes": [],
            "limitations": [],
            "timestamp": "2026-10-31T17:35:00Z",
        },
    )
    assert isinstance(msg.payload, DiagnosticFinding)
    assert msg.payload.finding_id == "FND-001"


def test_valid_device_health_message() -> None:
    """Verify message envelope containing a DeviceHealthPayload."""
    msg = AgentMessage(
        message_id="msg-006",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.INFRASTRUCTURE_HEALTH,
        receiver=AgentId.FAULT_CORRELATION,
        message_type=MessageType.DEVICE_HEALTH,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={
            "device": {
                "device_id": "RTR-01",
                "device_type": "router",
                "ip_address": "10.0.0.1",
            },
            "health_status": "degraded",
            "details": "High CPU utilization on control plane.",
        },
    )
    assert isinstance(msg.payload, DeviceHealthPayload)
    assert msg.payload.health_status == "degraded"


def test_valid_connectivity_message() -> None:
    """Verify message envelope containing a ConnectivityPayload."""
    msg = AgentMessage(
        message_id="msg-007",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.CONNECTIVITY_ANALYSIS,
        receiver=AgentId.FAULT_CORRELATION,
        message_type=MessageType.CONNECTIVITY,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={
            "source_device_id": "AP-101",
            "target_destination": "192.168.1.1",
            "connectivity_type": "gateway_ping",
            "status": "unreachable",
            "details": "ARP resolution timed out after 3 retries.",
        },
    )
    assert isinstance(msg.payload, ConnectivityPayload)
    assert msg.payload.status == "unreachable"


def test_valid_status_and_error_messages() -> None:
    """Verify StatusPayload and ErrorPayload envelopes."""
    status_msg = AgentMessage(
        message_id="msg-008",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.FAULT_CORRELATION,
        receiver=AgentId.ORCHESTRATOR,
        message_type=MessageType.STATUS,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={"status": "correlating", "message": "Evaluating evidence window."},
    )
    assert isinstance(status_msg.payload, StatusPayload)

    error_msg = AgentMessage(
        message_id="msg-009",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.CONNECTIVITY_ANALYSIS,
        receiver=AgentId.ORCHESTRATOR,
        message_type=MessageType.ERROR,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={"error_code": "PROBE_TIMEOUT", "message": "Remote probe did not respond."},
    )
    assert isinstance(error_msg.payload, ErrorPayload)


def test_unsupported_protocol_version_rejected() -> None:
    """Verify version other than 1.0 is rejected strictly."""
    with pytest.raises(ValidationError) as exc_info:
        AgentMessage(
            message_id="msg-010",
            protocol_version="2.0",  # Unsupported version
            sender=AgentId.TELEMETRY_PERFORMANCE,
            receiver=AgentId.FAULT_CORRELATION,
            message_type=MessageType.STATUS,
            timestamp="2026-10-31T17:30:00Z",
            correlation_id="INC-1001",
            payload={"status": "idle"},
        )
    assert "Unsupported protocol version '2.0'" in str(exc_info.value)


def test_invalid_sender_rejected() -> None:
    """Verify unknown sender agent is rejected."""
    with pytest.raises(ValidationError):
        AgentMessage(
            message_id="msg-011",
            protocol_version=PROTOCOL_VERSION,
            sender="unauthorized_rogue_agent",  # Invalid sender  # type: ignore[arg-type]
            receiver=AgentId.FAULT_CORRELATION,
            message_type=MessageType.STATUS,
            timestamp="2026-10-31T17:30:00Z",
            correlation_id="INC-1001",
            payload={"status": "idle"},
        )


def test_invalid_message_type_rejected() -> None:
    """Verify unknown message type is rejected."""
    with pytest.raises(ValidationError):
        AgentMessage(
            message_id="msg-012",
            protocol_version=PROTOCOL_VERSION,
            sender=AgentId.TELEMETRY_PERFORMANCE,
            receiver=AgentId.FAULT_CORRELATION,
            message_type="telepathic_telemetry",  # Invalid type  # type: ignore[arg-type]
            timestamp="2026-10-31T17:30:00Z",
            correlation_id="INC-1001",
            payload={"status": "idle"},
        )


def test_message_type_and_payload_mismatch_rejected() -> None:
    """Verify that payload not conforming to declared message_type is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        AgentMessage(
            message_id="msg-013",
            protocol_version=PROTOCOL_VERSION,
            sender=AgentId.TELEMETRY_PERFORMANCE,
            receiver=AgentId.FAULT_CORRELATION,
            message_type=MessageType.OBSERVATION,  # Declared Observation
            timestamp="2026-10-31T17:30:00Z",
            correlation_id="INC-1001",
            payload={
                # But payload is a DiagnosticFinding (missing observation fields like device_id, etc.)
                "finding_id": "FND-001",
                "title": "Misplaced finding",
            },
        )
    assert "Payload structure does not match message_type 'observation'" in str(exc_info.value)


def test_json_roundtrip_agent_message() -> None:
    """Verify complete JSON serialization and deserialization of an AgentMessage."""
    msg = AgentMessage(
        message_id="msg-014",
        protocol_version=PROTOCOL_VERSION,
        sender=AgentId.TELEMETRY_PERFORMANCE,
        receiver=AgentId.FAULT_CORRELATION,
        message_type=MessageType.STATUS,
        timestamp="2026-10-31T17:30:00Z",
        correlation_id="INC-1001",
        payload={"status": "processing", "message": "In progress"},
    )
    json_data = msg.model_dump_json()
    reconstructed = AgentMessage.model_validate_json(json_data)
    assert reconstructed.message_id == msg.message_id
    assert reconstructed.protocol_version == msg.protocol_version
    assert reconstructed.message_type == msg.message_type
    assert isinstance(reconstructed.payload, StatusPayload)
    assert reconstructed.payload.status == "processing"


# ==============================================================================
# HTTP Protocol Validation Endpoint Tests
# ==============================================================================

def test_api_protocol_validation_success(client: TestClient) -> None:
    """Test POST /api/protocol/validate with valid message."""
    valid_payload = {
        "message_id": "msg-api-001",
        "protocol_version": "1.0",
        "sender": "telemetry_performance",
        "receiver": "fault_correlation",
        "message_type": "status",
        "timestamp": "2026-10-31T17:30:00Z",
        "correlation_id": "INC-1001",
        "payload": {
            "status": "ready",
            "message": "Telemetry collector active",
        },
    }
    response = client.post("/api/protocol/validate", json=valid_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["message_id"] == "msg-api-001"
    assert data["protocol_version"] == "1.0"
    assert data["sender"] == "telemetry_performance"


def test_api_protocol_validation_failure_bad_version(client: TestClient) -> None:
    """Test POST /api/protocol/validate with invalid protocol version."""
    invalid_payload = {
        "message_id": "msg-api-002",
        "protocol_version": "9.9",  # Invalid version
        "sender": "telemetry_performance",
        "receiver": "fault_correlation",
        "message_type": "status",
        "timestamp": "2026-10-31T17:30:00Z",
        "correlation_id": "INC-1001",
        "payload": {"status": "ready"},
    }
    response = client.post("/api/protocol/validate", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"
