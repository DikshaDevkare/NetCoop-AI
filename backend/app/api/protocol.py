"""
Protocol validation endpoint for NetCoop AI.

Provides an HTTP interface for external clients (e.g. frontend, ingestion probes)
to validate AgentMessage payloads against the canonical protocol specifications
without performing diagnostic execution.
"""

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.schemas.enums import AgentId, MessageType
from app.schemas.messages import AgentMessage

protocol_router = APIRouter(prefix="/protocol", tags=["Protocol"])


class ValidationSuccessResponse(BaseModel):
    """Schema for successful protocol message validation."""

    valid: bool = Field(True, description="Indicates the message is fully protocol-compliant")
    message_id: str = Field(..., description="Echoed identifier of validated message")
    message_type: MessageType = Field(..., description="Validated message type")
    protocol_version: str = Field(..., description="Protocol version verified")
    sender: AgentId = Field(..., description="Validated sender identifier")
    receiver: AgentId = Field(..., description="Validated receiver identifier")


@protocol_router.post(
    "/validate",
    response_model=ValidationSuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate Protocol AgentMessage",
    description=(
        "Validates an AgentMessage envelope and payload against the NetCoop AI "
        "interoperability specification. Rejects unsupported versions, mismatched payloads, "
        "and metric bounds violations."
    ),
)
async def validate_agent_message(message: AgentMessage) -> ValidationSuccessResponse:
    """
    Validate incoming AgentMessage envelope and payload against canonical protocol schemas.
    Does not execute agent logic or initiate diagnosis workflows.
    """
    return ValidationSuccessResponse(
        valid=True,
        message_id=message.message_id,
        message_type=message.message_type,
        protocol_version=message.protocol_version,
        sender=message.sender,
        receiver=message.receiver,
    )
