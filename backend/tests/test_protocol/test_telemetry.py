"""
Unit tests for the TelemetryRecord schema and metric validation rules.
"""

import pytest
from pydantic import ValidationError

from app.schemas.enums import MetricCategory, MetricName, MetricUnit
from app.schemas.telemetry import TelemetryRecord


def test_valid_latency_record() -> None:
    """Verify valid latency telemetry record."""
    record = TelemetryRecord(
        telemetry_id="TEL-001",
        device_id="AP-101",
        metric_name=MetricName.LATENCY,
        metric_category=MetricCategory.PERFORMANCE,
        value=125.5,
        unit=MetricUnit.MILLISECONDS,
        timestamp="2026-10-31T17:30:00Z",
        source="ping_collector",
    )
    assert record.value == 125.5
    assert record.unit == MetricUnit.MILLISECONDS


def test_valid_packet_loss_record() -> None:
    """Verify valid packet loss telemetry record."""
    record = TelemetryRecord(
        telemetry_id="TEL-002",
        device_id="AP-101",
        metric_name=MetricName.PACKET_LOSS,
        metric_category=MetricCategory.PERFORMANCE,
        value=18.0,
        unit=MetricUnit.PERCENTAGE,
        timestamp="2026-10-31T17:30:00Z",
        source="probe_01",
    )
    assert record.value == 18.0


def test_valid_cpu_usage_record() -> None:
    """Verify valid CPU usage infrastructure record."""
    record = TelemetryRecord(
        telemetry_id="TEL-003",
        device_id="SW-CORE-01",
        metric_name=MetricName.CPU_USAGE,
        metric_category=MetricCategory.INFRASTRUCTURE,
        value=82.0,
        unit=MetricUnit.PERCENTAGE,
        timestamp="2026-10-31T17:30:00Z",
        source="snmp_agent",
    )
    assert record.value == 82.0


def test_valid_interface_status_record() -> None:
    """Verify valid interface status string record."""
    record = TelemetryRecord(
        telemetry_id="TEL-004",
        device_id="SW-CORE-01",
        metric_name=MetricName.INTERFACE_STATUS,
        metric_category=MetricCategory.INFRASTRUCTURE,
        value="down",
        unit=MetricUnit.STATUS,
        timestamp="2026-10-31T17:30:00Z",
        source="link_monitor",
    )
    assert record.value == "down"


def test_negative_latency_rejected() -> None:
    """Verify negative latency values are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        TelemetryRecord(
            telemetry_id="TEL-005",
            device_id="AP-101",
            metric_name=MetricName.LATENCY,
            metric_category=MetricCategory.PERFORMANCE,
            value=-15.0,
            unit=MetricUnit.MILLISECONDS,
            timestamp="2026-10-31T17:30:00Z",
            source="ping_collector",
        )
    assert "cannot be less than 0.0" in str(exc_info.value)


def test_packet_loss_above_100_rejected() -> None:
    """Verify packet loss exceeding 100% is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        TelemetryRecord(
            telemetry_id="TEL-006",
            device_id="AP-101",
            metric_name=MetricName.PACKET_LOSS,
            metric_category=MetricCategory.PERFORMANCE,
            value=105.0,
            unit=MetricUnit.PERCENTAGE,
            timestamp="2026-10-31T17:30:00Z",
            source="probe_01",
        )
    assert "cannot exceed 100.0" in str(exc_info.value)


def test_cpu_usage_above_100_rejected() -> None:
    """Verify CPU usage exceeding 100% is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        TelemetryRecord(
            telemetry_id="TEL-007",
            device_id="SW-01",
            metric_name=MetricName.CPU_USAGE,
            metric_category=MetricCategory.INFRASTRUCTURE,
            value=125.0,
            unit=MetricUnit.PERCENTAGE,
            timestamp="2026-10-31T17:30:00Z",
            source="snmp_agent",
        )
    assert "cannot exceed 100.0" in str(exc_info.value)


def test_unsupported_unit_rejected() -> None:
    """Verify mismatch between metric and unit is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        TelemetryRecord(
            telemetry_id="TEL-008",
            device_id="AP-101",
            metric_name=MetricName.LATENCY,
            metric_category=MetricCategory.PERFORMANCE,
            value=50.0,
            unit=MetricUnit.PERCENTAGE,  # Latency cannot be %
            timestamp="2026-10-31T17:30:00Z",
            source="probe",
        )
    assert "Unsupported unit '%'" in str(exc_info.value)


def test_metric_and_category_mismatch_rejected() -> None:
    """Verify metric assigned to wrong category is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        TelemetryRecord(
            telemetry_id="TEL-009",
            device_id="AP-101",
            metric_name=MetricName.LATENCY,
            metric_category=MetricCategory.INFRASTRUCTURE,  # Latency is Performance
            value=25.0,
            unit=MetricUnit.MILLISECONDS,
            timestamp="2026-10-31T17:30:00Z",
            source="probe",
        )
    assert "Metric category mismatch" in str(exc_info.value)


def test_incorrect_value_type_rejected() -> None:
    """Verify non-numeric value for numeric metric is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        TelemetryRecord(
            telemetry_id="TEL-010",
            device_id="AP-101",
            metric_name=MetricName.THROUGHPUT,
            metric_category=MetricCategory.PERFORMANCE,
            value="very_fast",  # Non-numeric
            unit=MetricUnit.MEGABITS_PER_SECOND,
            timestamp="2026-10-31T17:30:00Z",
            source="iperf",
        )
    assert "requires a numeric value" in str(exc_info.value)


def test_invalid_status_value_rejected() -> None:
    """Verify unrecognized status value is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        TelemetryRecord(
            telemetry_id="TEL-011",
            device_id="SW-01",
            metric_name=MetricName.INTERFACE_STATUS,
            metric_category=MetricCategory.INFRASTRUCTURE,
            value="partially_working_maybe",  # Invalid status string
            unit=MetricUnit.STATUS,
            timestamp="2026-10-31T17:30:00Z",
            source="snmp",
        )
    assert "Invalid status value" in str(exc_info.value)
