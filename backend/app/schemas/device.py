"""
Standard device identification schema for NetCoop AI.

Provides canonical representation of network devices with strict validation
for IP addresses (IPv4/IPv6) and MAC addresses.
"""

import ipaddress
import re
from typing import Optional
from pydantic import Field, field_validator

from app.schemas.common import ProtocolBaseModel
from app.schemas.enums import DeviceType

MAC_REGEX = re.compile(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$")


class Device(ProtocolBaseModel):
    """
    Standard network device representation across all protocol interactions.
    """

    device_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the device (e.g. 'AP-101', 'RTR-CORE-01')",
        examples=["AP-101"],
    )
    device_type: DeviceType = Field(
        ...,
        description="Hardware or network classification of the device",
        examples=[DeviceType.ACCESS_POINT],
    )
    hostname: Optional[str] = Field(
        None,
        min_length=1,
        description="Device network hostname if resolved",
        examples=["ap-floor-1"],
    )
    ip_address: Optional[str] = Field(
        None,
        description="Valid IPv4 or IPv6 network address",
        examples=["192.168.1.10"],
    )
    mac_address: Optional[str] = Field(
        None,
        description="Canonical hardware MAC address (normalized to XX:XX:XX:XX:XX:XX)",
        examples=["AA:BB:CC:DD:EE:FF"],
    )
    network_segment: Optional[str] = Field(
        None,
        description="VLAN, subnet, or zone identifier",
        examples=["FLOOR-1"],
    )
    location: Optional[str] = Field(
        None,
        description="Physical or logical location description",
        examples=["Building A - Floor 1"],
    )
    vendor: Optional[str] = Field(
        None,
        description="Hardware manufacturer or vendor",
        examples=["Cisco"],
    )
    model: Optional[str] = Field(
        None,
        description="Hardware model name or number",
        examples=["Catalyst 9115"],
    )

    @field_validator("ip_address")
    @classmethod
    def validate_ip_address(cls, v: Optional[str]) -> Optional[str]:
        """Validate that ip_address is a valid IPv4 or IPv6 address."""
        if v is None:
            return v
        v_clean = v.strip()
        try:
            ipaddress.ip_address(v_clean)
        except ValueError as exc:
            raise ValueError(f"Invalid IP address format: '{v_clean}'") from exc
        return v_clean

    @field_validator("mac_address")
    @classmethod
    def validate_mac_address(cls, v: Optional[str]) -> Optional[str]:
        """Validate and normalize MAC address to uppercase colon-separated format."""
        if v is None:
            return v
        v_clean = v.strip()
        if not MAC_REGEX.match(v_clean):
            raise ValueError(
                f"Invalid MAC address format: '{v_clean}'. Expected 6 pairs of hex digits (e.g. AA:BB:CC:DD:EE:FF)."
            )
        # Normalize delimiters to colons and uppercase
        normalized = v_clean.replace("-", ":").upper()
        return normalized
