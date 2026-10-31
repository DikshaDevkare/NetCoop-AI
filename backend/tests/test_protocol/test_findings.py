"""
Unit tests for the DiagnosticFinding schema.
"""

import pytest
from pydantic import ValidationError

from app.schemas.enums import AgentId, ConfidenceLevel, Severity
from app.schemas.findings import DiagnosticFinding


def test_valid_diagnostic_finding_full() -> None:
    """Verify diagnostic finding with complete empirical grounding and alternatives."""
    finding = DiagnosticFinding(
        finding_id="FND-001",
        incident_id="INC-1001",
        source_agent=AgentId.FAULT_CORRELATION,
        title="Uplink Port Buffer Saturation",
        description="Heavy egress microbursts saturated switch buffers, producing packet drops.",
        suspected_cause="Uplink capacity saturation",
        severity=Severity.HIGH,
        confidence=ConfidenceLevel.HIGH,
        affected_devices=["SW-CORE-01", "AP-101"],
        supporting_evidence_ids=["EVD-001", "EVD-002"],
        alternative_causes=["Optical transceiver failure on port eth1"],
        limitations=["NetFlow sampling rate was 1:1000 during the incident"],
        timestamp="2026-10-31T17:35:00Z",
    )
    assert finding.finding_id == "FND-001"
    assert finding.severity == Severity.HIGH
    assert finding.confidence == ConfidenceLevel.HIGH
    assert len(finding.affected_devices) == 2
    assert len(finding.supporting_evidence_ids) == 2
    assert len(finding.alternative_causes) == 1
    assert len(finding.limitations) == 1


def test_inconclusive_diagnostic_finding() -> None:
    """Verify diagnostic finding handles inconclusive investigations with low confidence."""
    finding = DiagnosticFinding(
        finding_id="FND-002",
        incident_id="INC-1002",
        source_agent=AgentId.FAULT_CORRELATION,
        title="Intermittent Wireless Drop - Root Cause Inconclusive",
        description="Telemetry signals sporadic drops without correlated infrastructure failures.",
        suspected_cause=None,  # Root cause genuinely unknown
        severity=Severity.MEDIUM,
        confidence=ConfidenceLevel.LOW,
        affected_devices=["AP-102"],
        supporting_evidence_ids=[],
        alternative_causes=["RF interference", "Hidden terminal problem"],
        limitations=["Spectrum analyzer data not collected"],
        timestamp="2026-10-31T17:36:00Z",
    )
    assert finding.suspected_cause is None
    assert finding.confidence == ConfidenceLevel.LOW


def test_missing_confidence_rejected() -> None:
    """Verify omitting confidence rating triggers ValidationError."""
    with pytest.raises(ValidationError):
        DiagnosticFinding(
            finding_id="FND-003",
            incident_id="INC-1003",
            source_agent=AgentId.FAULT_CORRELATION,
            title="Fault Finding",
            description="Finding description",
            severity=Severity.LOW,
            # Missing confidence
            timestamp="2026-10-31T17:37:00Z",
        )  # type: ignore[call-arg]


def test_invalid_severity_rejected() -> None:
    """Verify invalid severity string is rejected."""
    with pytest.raises(ValidationError):
        DiagnosticFinding(
            finding_id="FND-004",
            incident_id="INC-1004",
            source_agent=AgentId.FAULT_CORRELATION,
            title="Fault Finding",
            description="Finding description",
            severity="apocalyptic",  # Invalid severity enum
            confidence=ConfidenceLevel.MEDIUM,
            timestamp="2026-10-31T17:37:00Z",
        )


def test_extra_field_rejected() -> None:
    """Verify unexpected fields are rejected strictly."""
    with pytest.raises(ValidationError):
        DiagnosticFinding(
            finding_id="FND-005",
            incident_id="INC-1005",
            source_agent=AgentId.FAULT_CORRELATION,
            title="Fault Finding",
            description="Finding description",
            severity=Severity.LOW,
            confidence=ConfidenceLevel.LOW,
            timestamp="2026-10-31T17:37:00Z",
            fabricated_custom_field="not_allowed",  # type: ignore[call-arg]
        )
