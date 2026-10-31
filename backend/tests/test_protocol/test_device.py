"""
Unit tests for the standard Device identification schema.
"""

import pytest
from pydantic import ValidationError

from app.schemas.device import Device
from app.schemas.enums import DeviceType


def test_valid_device_minimal() -> None:
    """Verify minimal valid device with only mandatory fields."""
    dev = Device(
        device_id="RTR-01",
        device_type=DeviceType.ROUTER,
    )
    assert dev.device_id == "RTR-01"
    assert dev.device_type == DeviceType.ROUTER
    assert dev.ip_address is None
    assert dev.mac_address is None


def test_valid_device_full() -> None:
    """Verify device with all optional fields specified."""
    dev = Device(
        device_id="AP-101",
        device_type=DeviceType.ACCESS_POINT,
        hostname="ap-floor-1",
        ip_address="192.168.1.10",
        mac_address="AA:BB:CC:DD:EE:FF",
        network_segment="FLOOR-1",
        location="Building A - 1st Floor",
        vendor="Aruba",
        model="AP-515",
    )
    assert dev.device_id == "AP-101"
    assert dev.ip_address == "192.168.1.10"
    assert dev.mac_address == "AA:BB:CC:DD:EE:FF"


def test_valid_ipv6_device() -> None:
    """Verify valid IPv6 device address."""
    dev = Device(
        device_id="SRV-01",
        device_type=DeviceType.SERVER,
        ip_address="2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    )
    assert dev.ip_address == "2001:0db8:85a3:0000:0000:8a2e:0370:7334"


def test_invalid_ip_address_rejected() -> None:
    """Verify malformed or invalid IP addresses are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        Device(
            device_id="RTR-02",
            device_type=DeviceType.ROUTER,
            ip_address="999.999.999.999",
        )
    assert "Invalid IP address format" in str(exc_info.value)


def test_invalid_mac_address_rejected() -> None:
    """Verify malformed MAC addresses are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        Device(
            device_id="SW-01",
            device_type=DeviceType.SWITCH,
            mac_address="NOT-A-MAC-ADDR",
        )
    assert "Invalid MAC address format" in str(exc_info.value)


def test_mac_address_normalization() -> None:
    """Verify lowercase and hyphenated MAC addresses normalize to uppercase colon format."""
    dev = Device(
        device_id="SW-02",
        device_type=DeviceType.SWITCH,
        mac_address="aa-bb-cc-dd-ee-ff",
    )
    assert dev.mac_address == "AA:BB:CC:DD:EE:FF"


def test_missing_device_id_rejected() -> None:
    """Verify missing device_id triggers ValidationError."""
    with pytest.raises(ValidationError):
        Device(device_type=DeviceType.FIREWALL)  # type: ignore[call-arg]


def test_empty_device_id_rejected() -> None:
    """Verify empty string device_id triggers ValidationError."""
    with pytest.raises(ValidationError):
        Device(device_id="", device_type=DeviceType.FIREWALL)


def test_extra_field_rejected() -> None:
    """Verify extra fields trigger ValidationError."""
    with pytest.raises(ValidationError):
        Device(
            device_id="FW-01",
            device_type=DeviceType.FIREWALL,
            custom_unauthorized_key="value",  # type: ignore[call-arg]
        )
