"""
Standard diagnostic finding schema for NetCoop AI.

Encapsulates synthesized diagnostic hypotheses produced by the Fault Correlation Agent
or domain agents, preserving uncertainty, limitations, and empirical evidence links.
"""

from typing import Any, Dict, List, Optional
from pydantic import Field

from app.schemas.common import ProtocolBaseModel, UTCDatetime
from app.schemas.enums import AgentId, ConfidenceLevel, Severity


class DiagnosticFinding(ProtocolBaseModel):
    """
    Standard diagnostic finding model.
    Represents an evidence-backed hypothesis rather than an unverified absolute claim.
    """

    finding_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for this diagnostic finding (e.g. 'FND-001')",
        examples=["FND-001"],
    )
    incident_id: str = Field(
        ...,
        min_length=1,
        description="Associated incident identifier (e.g. 'INC-1001')",
        examples=["INC-1001"],
    )
    source_agent: AgentId = Field(
        ...,
        description="Agent that synthesized or concluded this finding",
        examples=[AgentId.FAULT_CORRELATION],
    )
    title: str = Field(
        ...,
        min_length=1,
        description="Brief diagnostic summary title",
        examples=["High Packet Loss Caused by Core Switch Uplink Congestion"],
    )
    description: str = Field(
        ...,
        min_length=1,
        description="Detailed explanation of the observed fault dynamics and progression",
        examples=[
            "Uplink interface eth1 on SW-CORE-01 reached 99% bandwidth utilization, "
            "triggering buffer saturation and downstream drop rates."
        ],
    )
    suspected_cause: Optional[str] = Field(
        None,
        description=(
            "Primary suspected root-cause condition, or None if current findings "
            "are inconclusive or under active investigation."
        ),
        examples=["Core uplink bandwidth saturation"],
    )
    severity: Severity = Field(
        ...,
        description="Assessed impact severity of the finding",
        examples=[Severity.HIGH],
    )
    confidence: ConfidenceLevel = Field(
        ...,
        description="Categorical confidence rating (low, medium, high) backed by evidence density",
        examples=[ConfidenceLevel.HIGH],
    )
    affected_devices: List[str] = Field(
        default_factory=list,
        description="Identifiers of network devices directly impacted by the condition",
        examples=[["SW-CORE-01", "AP-101", "AP-102"]],
    )
    supporting_evidence_ids: List[str] = Field(
        default_factory=list,
        description="References to verified evidence records (e.g. 'EVD-001') supporting this finding",
        examples=[["EVD-001", "EVD-002"]],
    )
    alternative_causes: List[str] = Field(
        default_factory=list,
        description="Plausible alternative hypotheses that cannot yet be ruled out",
        examples=[["Potential optical transceiver degradation on port eth1", "Intermittent ISP peering drop"]],
    )
    limitations: List[str] = Field(
        default_factory=list,
        description="Data collection constraints, missing telemetry streams, or evaluation gaps",
        examples=[["NetFlow sampling unavailable on secondary gateway during incident"]],
    )
    timestamp: UTCDatetime = Field(
        ...,
        description="Timezone-aware UTC timestamp when finding was concluded",
        examples=["2026-10-31T17:35:00Z"],
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional auxiliary diagnostic context",
        examples=[{"correlation_window_sec": 300, "ruleset_version": "2.1"}],
    )
