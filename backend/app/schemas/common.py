"""
Common base models, version constants, and timestamp validation for the protocol.

Enforces strict schema validation (rejecting unexpected fields) and timezone-aware
UTC normalization across all protocol messages and domain models.
"""

from datetime import datetime, timezone
from typing import Annotated, Any
from pydantic import BaseModel, BeforeValidator, ConfigDict, PlainSerializer

# Centralized protocol version constant (Phase 2 canonical standard)
PROTOCOL_VERSION: str = "1.0"


def validate_utc_datetime(value: Any) -> datetime:
    """
    Validate that an input datetime or string is timezone-aware and normalize to UTC.

    Rejects naive timestamps lacking timezone or offset information.
    """
    if isinstance(value, str):
        raw_str = value.strip()
        # Verify timezone indicator is present ('Z', '+', or '-' in the time segment)
        time_part = raw_str[10:] if len(raw_str) > 10 else ""
        has_tz = raw_str.endswith("Z") or ("+" in time_part) or ("-" in time_part)
        if not has_tz:
            raise ValueError(
                "Timestamp must be timezone-aware (e.g. ISO 8601 ending in 'Z' or offset like '+00:00')."
            )
        try:
            dt = datetime.fromisoformat(raw_str.replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError(f"Malformed ISO 8601 timestamp string: {raw_str}") from exc
    elif isinstance(value, datetime):
        dt = value
    else:
        raise ValueError(f"Expected datetime object or ISO string, got {type(value).__name__}.")

    if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
        raise ValueError("Naive timestamps without timezone information are rejected.")

    return dt.astimezone(timezone.utc)


def serialize_utc_datetime(dt: datetime) -> str:
    """Serialize UTC datetime to standardized ISO 8601 string ending in 'Z'."""
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# Reusable Annotated type enforcing timezone-aware UTC datetime across all models
UTCDatetime = Annotated[
    datetime,
    BeforeValidator(validate_utc_datetime),
    PlainSerializer(serialize_utc_datetime, return_type=str, when_used="json"),
]


class ProtocolBaseModel(BaseModel):
    """
    Base model for all NetCoop AI protocol contracts.

    Configuration:
    - extra="forbid": strictly rejects unknown/unexpected fields.
    - populate_by_name=True: enables alias population if aliases are defined.
    - validate_assignment=True: ensures field-level validation on assignment.
    """

    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
        validate_assignment=True,
    )
