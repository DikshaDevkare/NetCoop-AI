"""
Unit tests for protocol common base models and UTC timestamp validation.
"""

from datetime import datetime, timezone
import pytest
from pydantic import Field, ValidationError

from app.schemas.common import PROTOCOL_VERSION, ProtocolBaseModel, UTCDatetime


class SampleModel(ProtocolBaseModel):
    """Concrete test model derived from ProtocolBaseModel."""

    item_id: str = Field(..., min_length=1)
    timestamp: UTCDatetime


def test_protocol_version_constant() -> None:
    """Verify standard protocol version is 1.0."""
    assert PROTOCOL_VERSION == "1.0"


def test_valid_common_model_with_iso_z_timestamp() -> None:
    """Verify model instantiation with valid ISO 8601 UTC timestamp ending in Z."""
    model = SampleModel(item_id="item-01", timestamp="2026-10-31T17:30:00Z")
    assert model.item_id == "item-01"
    assert model.timestamp.tzinfo is not None
    assert model.timestamp.year == 2026
    assert model.timestamp.month == 10
    assert model.timestamp.day == 31


def test_valid_common_model_with_utc_offset() -> None:
    """Verify that timestamps with explicit offsets are normalized to UTC."""
    # 19:30:00+02:00 corresponds to 17:30:00 UTC
    model = SampleModel(item_id="item-02", timestamp="2026-10-31T19:30:00+02:00")
    assert model.timestamp.tzinfo == timezone.utc
    assert model.timestamp.hour == 17
    assert model.timestamp.minute == 30


def test_valid_common_model_with_datetime_object() -> None:
    """Verify model accepts a timezone-aware datetime instance."""
    now_utc = datetime.now(timezone.utc)
    model = SampleModel(item_id="item-03", timestamp=now_utc)
    assert model.timestamp == now_utc


def test_reject_naive_timestamp_string() -> None:
    """Verify that naive timestamps without timezone indicators are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        SampleModel(item_id="item-04", timestamp="2026-10-31T17:30:00")
    assert "timezone-aware" in str(exc_info.value)


def test_reject_naive_datetime_object() -> None:
    """Verify that naive datetime objects without tzinfo are rejected."""
    naive_dt = datetime(2026, 10, 31, 17, 30, 0)
    with pytest.raises(ValidationError) as exc_info:
        SampleModel(item_id="item-05", timestamp=naive_dt)
    assert "Naive timestamps" in str(exc_info.value) or "timezone" in str(exc_info.value)


def test_reject_missing_required_fields() -> None:
    """Verify ValidationError when mandatory fields are omitted."""
    with pytest.raises(ValidationError):
        SampleModel()  # type: ignore[call-arg]


def test_reject_unexpected_extra_fields() -> None:
    """Verify strict extra='forbid' rejects unknown fields."""
    with pytest.raises(ValidationError) as exc_info:
        SampleModel(
            item_id="item-06",
            timestamp="2026-10-31T17:30:00Z",
            unexpected_field="unauthorized_data",  # type: ignore[call-arg]
        )
    assert "extra_forbidden" in str(exc_info.value) or "unexpected_field" in str(exc_info.value)


def test_json_serialization_and_deserialization() -> None:
    """Verify roundtrip JSON serialization produces standard UTC representation."""
    model = SampleModel(item_id="item-07", timestamp="2026-10-31T17:30:00Z")
    json_str = model.model_dump_json()
    assert '"timestamp":"2026-10-31T17:30:00Z"' in json_str

    deserialized = SampleModel.model_validate_json(json_str)
    assert deserialized.item_id == model.item_id
    assert deserialized.timestamp == model.timestamp
