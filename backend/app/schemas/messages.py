"""
Standard AgentMessage envelope and payload validation for NetCoop AI.

Defines the universal interoperability envelope for inter-agent communication,
enforcing protocol version verification, type-checked payloads, and strict alignment
between message_type and payload structure.
"""

from typing import Any, Dict, List, Optional, Tuple, Type, Union
from pydantic import Field, ValidationError, model_validator

from app.schemas.common import PROTOCOL_VERSION, ProtocolBaseModel, UTCDatetime
from app.schemas.device import Device
from app.schemas.enums import AgentId, MessageType
from app.schemas.evidence import Evidence, Observation
from app.schemas.findings import DiagnosticFinding
from app.schemas.telemetry import TelemetryRecord


# ==============================================================================
# Specialized Protocol Payloads
# ==============================================================================

class StatusPayload(ProtocolBaseModel):
    """Payload for operational status updates between agents and orchestrator."""

    status: str = Field(..., min_length=1, description="Current operational state (e.g. 'idle', 'busy', 'ready')")
    message: Optional[str] = Field(None, description="Descriptive status note")
    details: Optional[Dict[str, Any]] = Field(None, description="Auxiliary operational metrics or state")


class ErrorPayload(ProtocolBaseModel):
    """Payload for protocol-level or processing errors communicated across agents."""

    error_code: str = Field(..., min_length=1, description="Machine-readable error classification")
    message: str = Field(..., min_length=1, description="Human-readable error description")
    details: Optional[Any] = Field(None, description="Structured diagnostics or error context")


class DeviceHealthPayload(ProtocolBaseModel):
    """Payload for device health assessments emitted by the Infrastructure Health Agent."""

    device: Device = Field(..., description="Target device specifications")
    health_status: str = Field(
        ...,
        min_length=1,
        description="Assessed device health ('healthy', 'degraded', 'critical', 'offline')",
    )
    metrics: List[TelemetryRecord] = Field(
        default_factory=list,
        description="Key infrastructure metrics contributing to the health status",
    )
    details: Optional[str] = Field(None, description="Diagnostic commentary on device state")


class ConnectivityPayload(ProtocolBaseModel):
    """Payload for connectivity path and reachability evaluations."""

    source_device_id: str = Field(..., min_length=1, description="Originating device identifier")
    target_destination: str = Field(
        ...,
        min_length=1,
        description="Target IP, hostname, gateway, or service destination",
    )
    connectivity_type: str = Field(
        ...,
        min_length=1,
        description="Evaluation protocol or method ('icmp_ping', 'dns_query', 'tcp_syn', 'gateway_arp')",
    )
    status: str = Field(
        ...,
        min_length=1,
        description="Path evaluation outcome ('reachable', 'unreachable', 'degraded', 'timeout')",
    )
    latency_ms: Optional[float] = Field(None, ge=0.0, description="Round-trip latency in milliseconds")
    packet_loss_percent: Optional[float] = Field(None, ge=0.0, le=100.0, description="Packet loss percentage")
    details: Optional[str] = Field(None, description="Diagnostic commentary or error logs")


class TelemetryBatchPayload(ProtocolBaseModel):
    """Payload for transmitting a batch of telemetry observations in a single message."""

    records: List[TelemetryRecord] = Field(..., min_length=1, description="Non-empty list of telemetry observations")


# Union of all strictly validated payload models
ProtocolPayload = Union[
    TelemetryRecord,
    TelemetryBatchPayload,
    DeviceHealthPayload,
    ConnectivityPayload,
    Observation,
    Evidence,
    DiagnosticFinding,
    StatusPayload,
    ErrorPayload,
]

# Mapping each MessageType to its permitted payload model class(es)
MESSAGE_TYPE_PAYLOAD_MAP: Dict[MessageType, Tuple[Type[ProtocolBaseModel], ...]] = {
    MessageType.TELEMETRY: (TelemetryRecord, TelemetryBatchPayload),
    MessageType.DEVICE_HEALTH: (DeviceHealthPayload, Device),
    MessageType.CONNECTIVITY: (ConnectivityPayload,),
    MessageType.OBSERVATION: (Observation,),
    MessageType.EVIDENCE: (Evidence,),
    MessageType.DIAGNOSTIC_FINDING: (DiagnosticFinding,),
    MessageType.STATUS: (StatusPayload,),
    MessageType.ERROR: (ErrorPayload,),
}


# ==============================================================================
# Canonical AgentMessage Envelope
# ==============================================================================

class AgentMessage(ProtocolBaseModel):
    """
    Universal interoperability envelope for all agent-to-agent communications.

    Enforces strict protocol version validation and guarantees that the payload
    structure matches the declared message_type.
    """

    message_id: str = Field(
        ...,
        min_length=1,
        description="Unique message identifier (e.g. 'MSG-1001')",
        examples=["MSG-1001"],
    )
    protocol_version: str = Field(
        ...,
        description="Canonical protocol version. Must match current standard '1.0'",
        examples=[PROTOCOL_VERSION],
    )
    sender: AgentId = Field(
        ...,
        description="Standardized identifier of the emitting agent or component",
        examples=[AgentId.TELEMETRY_PERFORMANCE],
    )
    receiver: AgentId = Field(
        ...,
        description="Standardized identifier of the intended recipient agent or component",
        examples=[AgentId.FAULT_CORRELATION],
    )
    message_type: MessageType = Field(
        ...,
        description="Standardized message classification governing expected payload schema",
        examples=[MessageType.OBSERVATION],
    )
    timestamp: UTCDatetime = Field(
        ...,
        description="Timezone-aware UTC timestamp when message was generated",
        examples=["2026-10-31T17:30:00Z"],
    )
    correlation_id: str = Field(
        ...,
        min_length=1,
        description="Correlation identifier binding all messages within an incident investigation",
        examples=["INC-1001"],
    )
    payload: ProtocolPayload = Field(
        ...,
        description="Structured, type-safe message payload conforming to message_type",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional auxiliary routing or telemetry metadata",
        examples=[{"priority": "high", "retry_count": 0}],
    )

    @model_validator(mode="before")
    @classmethod
    def validate_envelope_and_payload(cls, data: Any) -> Any:
        """
        Validate protocol version and coerce payload into the appropriate schema
        strictly associated with declared message_type.
        """
        if not isinstance(data, dict):
            return data

        # 1. Validate Protocol Version
        version = data.get("protocol_version")
        if version != PROTOCOL_VERSION:
            raise ValueError(
                f"Unsupported protocol version '{version}'. Expected '{PROTOCOL_VERSION}'."
            )

        # 2. Extract and Validate Message Type
        raw_msg_type = data.get("message_type")
        try:
            msg_type = MessageType(raw_msg_type)
        except ValueError:
            # Let field validation handle unknown enum error
            return data

        raw_payload = data.get("payload")
        if raw_payload is None:
            raise ValueError(f"Payload cannot be null for message_type '{msg_type.value}'.")

        allowed_models = MESSAGE_TYPE_PAYLOAD_MAP.get(msg_type, ())
        if not allowed_models:
            raise ValueError(f"No payload schema registered for message_type '{msg_type.value}'.")

        # If payload is already an instance of an allowed model, accept it
        if isinstance(raw_payload, allowed_models):
            return data

        # If payload is a dictionary, validate against the allowed model classes
        if isinstance(raw_payload, dict):
            last_error: Optional[Exception] = None
            for model_cls in allowed_models:
                try:
                    data["payload"] = model_cls.model_validate(raw_payload)
                    return data
                except ValidationError as exc:
                    last_error = exc

            allowed_names = " or ".join(m.__name__ for m in allowed_models)
            err_msg = (
                f"Payload structure does not match message_type '{msg_type.value}'. "
                f"Expected schema: {allowed_names}."
            )
            if last_error:
                err_msg += f" Validation errors: {last_error.errors()}"
            raise ValueError(err_msg)

        # If payload is of unexpected type (e.g. primitive string when object expected)
        allowed_names = " or ".join(m.__name__ for m in allowed_models)
        raise ValueError(
            f"Invalid payload type '{type(raw_payload).__name__}' for message_type '{msg_type.value}'. "
            f"Expected schema: {allowed_names}."
        )
