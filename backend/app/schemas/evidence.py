"""
Standard observation and evidence schemas for NetCoop AI.

Observations represent specific anomalies or patterns detected by domain agents.
Evidence records represent verified empirical artifacts that support or contradict
diagnostic hypotheses during fault correlation.
"""

from typing import Any, Dict, List, Optional
from pydantic import Field

from app.schemas.common import ProtocolBaseModel, UTCDatetime
from app.schemas.enums import AgentId


class Observation(ProtocolBaseModel):
    """
    Standard observation structure reported by a monitoring agent or data source.
    Represents an observed condition or threshold breach on a specific device.
    """

    observation_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the observation (e.g. 'OBS-001')",
        examples=["OBS-001"],
    )
    incident_id: str = Field(
        ...,
        min_length=1,
        description="Incident or correlation workflow identifier (e.g. 'INC-1001')",
        examples=["INC-1001"],
    )
    device_id: str = Field(
        ...,
        min_length=1,
        description="Network device where anomaly was observed",
        examples=["AP-101"],
    )
    source_agent: AgentId = Field(
        ...,
        description="Agent that generated this observation",
        examples=[AgentId.TELEMETRY_PERFORMANCE],
    )
    observation_type: str = Field(
        ...,
        min_length=1,
        description="Canonical classification of the observation (e.g. 'high_packet_loss')",
        examples=["high_packet_loss"],
    )
    description: str = Field(
        ...,
        min_length=1,
        description="Human-readable description of the observed condition",
        examples=["Packet loss exceeded the configured threshold of 5%."],
    )
    observed_at: UTCDatetime = Field(
        ...,
        description="Timezone-aware UTC timestamp when condition was observed",
        examples=["2026-10-31T17:29:00Z"],
    )
    related_telemetry_ids: List[str] = Field(
        default_factory=list,
        description="List of raw telemetry record IDs supporting this observation",
        examples=[["TEL-001", "TEL-002"]],
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional contextual key-value pairs",
        examples=[{"threshold": 5.0, "consecutive_samples": 3}],
    )


class Evidence(ProtocolBaseModel):
    """
    Standard evidence artifact used in fault correlation.
    Can either support or contradict a diagnostic hypothesis.
    """

    evidence_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the evidence artifact (e.g. 'EVD-001')",
        examples=["EVD-001"],
    )
    incident_id: str = Field(
        ...,
        min_length=1,
        description="Incident or workflow correlation identifier",
        examples=["INC-1001"],
    )
    source_agent: AgentId = Field(
        ...,
        description="Agent that submitted or validated this evidence",
        examples=[AgentId.INFRASTRUCTURE_HEALTH],
    )
    evidence_type: str = Field(
        ...,
        min_length=1,
        description="Type of evidence artifact (e.g. 'cpu_spike', 'link_flap_log', 'arp_loss')",
        examples=["cpu_spike"],
    )
    description: str = Field(
        ...,
        min_length=1,
        description="Factual description of the evidence",
        examples=["Device CPU reached 98% utilization during the packet drop window."],
    )
    device_id: Optional[str] = Field(
        None,
        description="Associated network device, if applicable",
        examples=["SW-CORE-01"],
    )
    telemetry_ids: List[str] = Field(
        default_factory=list,
        description="Associated telemetry observation IDs providing empirical proof",
        examples=[["TEL-101", "TEL-102"]],
    )
    observed_at: UTCDatetime = Field(
        ...,
        description="Timezone-aware UTC timestamp of evidence occurrence",
        examples=["2026-10-31T17:29:30Z"],
    )
    supports_hypothesis: Optional[bool] = Field(
        None,
        description=(
            "True if evidence supports a given fault hypothesis, False if it contradicts it, "
            "or None if purely factual/unaligned."
        ),
        examples=[True],
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional context or raw collector metadata",
        examples=[{"process": "bgp_routing", "core_count": 4}],
    )
