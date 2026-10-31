"""
Unit tests for the Observation and Evidence schemas.
"""

import pytest
from pydantic import ValidationError

from app.schemas.enums import AgentId
from app.schemas.evidence import Evidence, Observation


def test_valid_observation() -> None:
    """Verify standard valid observation created by domain agent."""
    obs = Observation(
        observation_id="OBS-001",
        incident_id="INC-1001",
        device_id="AP-101",
        source_agent=AgentId.TELEMETRY_PERFORMANCE,
        observation_type="high_packet_loss",
        description="Packet loss exceeded configured 5% baseline.",
        observed_at="2026-10-31T17:29:00Z",
        related_telemetry_ids=["TEL-001", "TEL-002"],
        metadata={"threshold": 5.0},
    )
    assert obs.observation_id == "OBS-001"
    assert obs.source_agent == AgentId.TELEMETRY_PERFORMANCE
    assert len(obs.related_telemetry_ids) == 2


def test_valid_evidence_supporting_hypothesis() -> None:
    """Verify evidence model with supporting hypothesis indicated."""
    evd = Evidence(
        evidence_id="EVD-001",
        incident_id="INC-1001",
        source_agent=AgentId.INFRASTRUCTURE_HEALTH,
        evidence_type="cpu_spike",
        description="Core switch CPU reached 98% during drop window.",
        device_id="SW-CORE-01",
        telemetry_ids=["TEL-101"],
        observed_at="2026-10-31T17:29:30Z",
        supports_hypothesis=True,
    )
    assert evd.supports_hypothesis is True
    assert evd.device_id == "SW-CORE-01"


def test_valid_evidence_contradicting_hypothesis() -> None:
    """Verify evidence model supporting explicit contradiction of a hypothesis."""
    evd = Evidence(
        evidence_id="EVD-002",
        incident_id="INC-1001",
        source_agent=AgentId.CONNECTIVITY_ANALYSIS,
        evidence_type="gateway_reachability",
        description="Default gateway remained reachable with 0% loss during the incident window.",
        device_id="GW-01",
        telemetry_ids=["TEL-201"],
        observed_at="2026-10-31T17:30:00Z",
        supports_hypothesis=False,  # Contradicts gateway failure hypothesis
    )
    assert evd.supports_hypothesis is False


def test_evidence_without_device_id() -> None:
    """Verify evidence can be accepted when device_id is genuinely unknown or omitted."""
    evd = Evidence(
        evidence_id="EVD-003",
        incident_id="INC-1001",
        source_agent=AgentId.CONNECTIVITY_ANALYSIS,
        evidence_type="external_dns_timeout",
        description="Public upstream DNS resolvers 8.8.8.8 timed out.",
        observed_at="2026-10-31T17:30:00Z",
        device_id=None,
    )
    assert evd.device_id is None
    assert evd.supports_hypothesis is None


def test_missing_required_evidence_fields_rejected() -> None:
    """Verify missing mandatory fields triggers ValidationError."""
    with pytest.raises(ValidationError):
        Evidence(
            evidence_id="EVD-004",
            # Missing incident_id, source_agent, evidence_type, description, observed_at
        )  # type: ignore[call-arg]


def test_missing_required_observation_fields_rejected() -> None:
    """Verify missing mandatory observation fields triggers ValidationError."""
    with pytest.raises(ValidationError):
        Observation(
            observation_id="OBS-002",
            # Missing incident_id, device_id, source_agent, observation_type, etc.
        )  # type: ignore[call-arg]
