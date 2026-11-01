"""
Pydantic schemas for NetCoop AI Unified Diagnosis API endpoints.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DiagnosisRequest(BaseModel):
    """
    Request payload for end-to-end multi-agent network fault diagnosis.
    """

    incident_id: Optional[str] = Field(
        None,
        description="Optional correlation identifier for the incident investigation (e.g. 'INC-1001'). Generated if omitted.",
        examples=["INC-1001"],
    )
    telemetry_records: List[Dict[str, Any]] = Field(
        ...,
        min_length=1,
        description="Collection of telemetry records from one or more network devices.",
        examples=[
            [
                {
                    "device_id": "SW-CORE-01",
                    "device_type": "switch",
                    "latency_ms": 195.0,
                    "packet_loss_pct": 3.8,
                    "jitter_ms": 28.0,
                    "throughput_mbps": 950.0,
                    "bandwidth_utilization_pct": 92.0,
                    "cpu_usage_pct": 45.0,
                    "memory_usage_pct": 52.0,
                    "queue_drops": 380,
                    "interface_errors": 0,
                    "retransmissions": 65,
                }
            ]
        ],
    )
    context: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional operational context (e.g., maintenance windows, topology tier notes).",
        examples=[{"campus_zone": "Engineering Quad", "scheduled_maintenance": False}],
    )


class IncidentSummary(BaseModel):
    incident_id: str
    diagnosis_id: Optional[str] = Field(None, description="Unique diagnosis run correlation identifier.")
    timestamp: str
    overall_status: str
    severity: str
    affected_devices: List[str]
    affected_device_count: int
    affected_network_segments: List[str]
    topology_scope: Optional[str] = Field(None, description="Scope of fault: device_local, shared_infrastructure, segment_wide.")
    is_shared_infrastructure_fault: Optional[bool] = Field(None, description="Whether multiple devices share common root cause.")
    scope_summary: Optional[str] = Field(None, description="Topology scoping narrative.")


class ProbableRootCause(BaseModel):
    primary_hypothesis: str
    confidence: str
    alternative_hypotheses: List[str]
    explanation: str


class ActionRecommendation(BaseModel):
    action: str
    priority: str
    target_devices: List[str]
    rationale: str
    step_order: int
    supporting_evidence_ids: List[str] = Field(
        default_factory=list,
        description="List of empirical evidence identifiers supporting this recommendation.",
    )
    automated: bool = Field(
        False,
        description="Whether this remediation action is automated or requires manual engineer execution.",
    )


class DiagnosisResponse(BaseModel):
    """
    Standardized unified diagnostic response containing evidence, root-cause hypothesis,
    agent findings, and actionable remediation recommendations.
    """

    diagnosis_id: Optional[str] = Field(None, description="Unique diagnosis execution record identifier.")
    incident_summary: IncidentSummary
    probable_root_cause: ProbableRootCause
    machine_learning_signals: Dict[str, Any]
    evidence_trail: List[Dict[str, Any]]
    agent_findings: List[Dict[str, Any]]
    recommended_corrective_actions: List[ActionRecommendation]
    uncertainty_and_limitations: Dict[str, Any]
    orchestration_metadata: Dict[str, Any]


class AgentInfo(BaseModel):
    agent_id: str
    name: str
    description: str
    status: str
    protocol_version: str


class AgentsListResponse(BaseModel):
    total_agents: int
    agents: List[AgentInfo]


class ModelInfo(BaseModel):
    name: str
    type: str
    algorithm: str
    version: str
    available: bool
    status: str
    notes: str
    threshold: Optional[float] = None
    target_classes: Optional[List[str]] = None
    feature_count: Optional[int] = None
    window_size: Optional[int] = None


class ModelsListResponse(BaseModel):
    total_models: int
    models: List[ModelInfo]


class DiagnosisHistoryItem(BaseModel):
    diagnosis_id: str
    incident_id: str
    primary_hypothesis: str
    confidence: str
    severity: str
    overall_status: str
    affected_devices: List[str]
    affected_segments: List[str]
    temporal_trend: Optional[str] = None
    created_at: str


class DiagnosisHistoryResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[DiagnosisHistoryItem]
