"""
Pydantic schemas for synthetic telemetry dataset generation and tabular ML records.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import UTCDatetime


class RawTelemetryRecord(BaseModel):
    """
    Representation of an individual synthetic observation generated during an incident.
    """

    incident_id: str = Field(..., description="Unique simulation incident ID (e.g. 'INC-NORM-001')")
    scenario_id: str = Field(..., description="Scenario identifier (e.g. 'SCN-NORMAL')")
    scenario_label: str = Field(..., description="Target scenario label (e.g. 'normal', 'latency_spike')")
    device_id: str = Field(..., description="Network device identifier (e.g. 'SW_CAMPUS_01')")
    device_type: str = Field(..., description="Device classification (e.g. 'switch', 'access_point')")
    hostname: str = Field(..., description="Synthetic device hostname")
    network_segment: str = Field(..., description="Network segment/VLAN location")
    timestamp: UTCDatetime = Field(..., description="Timezone-aware UTC timestamp")
    source_generator: str = Field("netcoop_synthetic_v1", description="Generator provenance tag")
    synthetic_data: bool = Field(True, description="Explicit flag indicating synthetic data")
    status: str = Field(..., description="Reported health status (Healthy, Warning, Critical)")
    metrics: Dict[str, Any] = Field(..., description="Raw metric key-value pairs from generator")

    model_config = ConfigDict(extra="ignore")


class SupplementaryMetrics(BaseModel):
    """
    Supplementary network metrics preserved alongside canonical Phase 2 metrics.
    """

    queue_drops: Optional[int] = Field(None, ge=0, description="Egress queue drop count")
    interface_errors: Optional[int] = Field(None, ge=0, description="Interface CRC/frame error count")
    wireless_signal_strength_dbm: Optional[float] = Field(
        None, le=0.0, description="Wi-Fi RSSI in dBm (e.g. -65.0 dBm)"
    )
    retransmissions: Optional[int] = Field(None, ge=0, description="TCP or Wi-Fi frame retransmission count")

    model_config = ConfigDict(extra="ignore")


class NormalizedTelemetryRecord(BaseModel):
    """
    Canonical tabular record combining standardized Phase 2 metrics with supplementary fields.
    """

    # Identifiers & Provenance
    incident_id: str
    scenario_id: str
    scenario_label: str
    device_id: str
    device_type: str
    hostname: str
    network_segment: str
    timestamp: UTCDatetime
    status: str

    # Standard Phase 2 Performance Metrics
    latency_ms: float = Field(..., ge=0.0)
    packet_loss_pct: float = Field(..., ge=0.0, le=100.0)
    jitter_ms: float = Field(..., ge=0.0)
    throughput_mbps: float = Field(..., ge=0.0)
    bandwidth_utilization_pct: float = Field(..., ge=0.0, le=100.0)

    # Standard Phase 2 Infrastructure Metrics
    cpu_usage_pct: float = Field(..., ge=0.0, le=100.0)
    memory_usage_pct: float = Field(..., ge=0.0, le=100.0)
    interface_status: str
    device_uptime_seconds: float = Field(..., ge=0.0)
    temperature_celsius: Optional[float] = None

    # Standard Phase 2 Connectivity Metrics
    dns_response_time_ms: float = Field(..., ge=0.0)
    dns_resolution_status: str
    dhcp_status: str
    gateway_reachability: str
    interface_connectivity: str

    # Supplementary metrics (preserved without forcing into Phase 2 schemas)
    queue_drops: int = Field(0, ge=0)
    interface_errors: int = Field(0, ge=0)
    wireless_signal_strength_dbm: Optional[float] = None
    retransmissions: int = Field(0, ge=0)

    model_config = ConfigDict(extra="ignore")
