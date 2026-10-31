"""
NetCoop AI Interoperability Protocol Schemas (v1.0).

Exposes standardized data contracts, enumerations, validation rules,
and message envelopes for multi-agent network fault diagnosis.
"""

from app.schemas.common import PROTOCOL_VERSION, ProtocolBaseModel, UTCDatetime
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
    ProtocolPayload,
    StatusPayload,
    TelemetryBatchPayload,
)
from app.schemas.diagnosis import (
    DiagnosisRequest,
    DiagnosisResponse,
    AgentsListResponse,
    ModelsListResponse,
)
from app.schemas.telemetry import METRIC_REGISTRY, MetricSpecification, TelemetryRecord

__all__ = [
    # Common
    "PROTOCOL_VERSION",
    "ProtocolBaseModel",
    "UTCDatetime",
    # Enums
    "MessageType",
    "AgentId",
    "Severity",
    "ConfidenceLevel",
    "MetricCategory",
    "DeviceType",
    "MetricName",
    "MetricUnit",
    # Models
    "Device",
    "TelemetryRecord",
    "METRIC_REGISTRY",
    "MetricSpecification",
    "Observation",
    "Evidence",
    "DiagnosticFinding",
    # Message Envelope & Payloads
    "AgentMessage",
    "ProtocolPayload",
    "StatusPayload",
    "ErrorPayload",
    "DeviceHealthPayload",
    "ConnectivityPayload",
    "TelemetryBatchPayload",
]
