"""
Telemetry Normalization Engine for NetCoop AI.

Maps raw organizer fields to standardized Phase 2 telemetry metric names and units,
preserves supplementary metrics (queue drops, interface errors, Wi-Fi RSSI), and provides
validation against Phase 2 schemas.
"""

from typing import Any, Dict, List, Optional
from pydantic import ValidationError

from app.schemas.enums import MetricCategory, MetricName, MetricUnit
from app.schemas.telemetry import METRIC_REGISTRY, TelemetryRecord
from ml.schemas import NormalizedTelemetryRecord, RawTelemetryRecord


class TelemetryNormalizer:
    """
    Normalizes heterogeneous raw telemetry into standardized tabular and schema-compliant records.
    """

    ORGANIZER_FIELD_MAP = {
        "cpu_utilization_pct": "cpu_usage_pct",
        "link_utilization_pct": "bandwidth_utilization_pct",
        "latency_ms": "latency_ms",
        "packet_loss_pct": "packet_loss_pct",
        "jitter_ms": "jitter_ms",
    }

    @classmethod
    def normalize_record(cls, raw: Dict[str, Any]) -> NormalizedTelemetryRecord:
        """
        Convert a raw synthetic or organizer telemetry dictionary into NormalizedTelemetryRecord.
        """
        metrics = raw.get("metrics", {})

        # Extract mapped organizer metrics with fallbacks
        latency = float(metrics.get("latency_ms", 10.0))
        packet_loss = float(metrics.get("packet_loss_pct", 0.0))
        jitter = float(metrics.get("jitter_ms", 2.0))
        throughput = float(metrics.get("throughput_mbps", 90.0))
        bandwidth_util = float(metrics.get("link_utilization_pct", 25.0))

        cpu_usage = float(metrics.get("cpu_utilization_pct", 20.0))
        memory_usage = float(metrics.get("memory_usage_pct", 30.0))
        interface_status = str(metrics.get("interface_status", "up"))
        device_uptime = float(metrics.get("device_uptime_seconds", 86400.0))
        temperature = metrics.get("temperature_celsius")

        dns_time = float(metrics.get("dns_response_time_ms", 15.0))
        dns_status = str(metrics.get("dns_resolution_status", "success"))
        dhcp_status = str(metrics.get("dhcp_status", "assigned"))
        gateway_reach = str(metrics.get("gateway_reachability", "reachable"))
        interface_conn = str(metrics.get("interface_connectivity", "connected"))

        # Supplementary metrics
        queue_drops = int(metrics.get("queue_drops", 0))
        interface_errors = int(metrics.get("interface_errors", 0))
        wifi_signal = metrics.get("wireless_signal_strength_dbm")
        retrans = int(metrics.get("retransmissions", 0))

        return NormalizedTelemetryRecord(
            incident_id=raw.get("incident_id", "INC-UNKNOWN"),
            scenario_id=raw.get("scenario_id", "SCN-UNKNOWN"),
            scenario_label=raw.get("scenario_label", "normal"),
            device_id=raw.get("device_id", "SW_CAMPUS_01"),
            device_type=raw.get("device_type", "switch"),
            hostname=raw.get("hostname", "switch01.campus.net"),
            network_segment=raw.get("network_segment", "CAMPUS_CORE"),
            timestamp=raw.get("timestamp"),
            status=raw.get("status", "Healthy"),
            latency_ms=latency,
            packet_loss_pct=packet_loss,
            jitter_ms=jitter,
            throughput_mbps=throughput,
            bandwidth_utilization_pct=bandwidth_util,
            cpu_usage_pct=cpu_usage,
            memory_usage_pct=memory_usage,
            interface_status=interface_status,
            device_uptime_seconds=device_uptime,
            temperature_celsius=float(temperature) if temperature is not None else None,
            dns_response_time_ms=dns_time,
            dns_resolution_status=dns_status,
            dhcp_status=dhcp_status,
            gateway_reachability=gateway_reach,
            interface_connectivity=interface_conn,
            queue_drops=queue_drops,
            interface_errors=interface_errors,
            wireless_signal_strength_dbm=float(wifi_signal) if wifi_signal is not None else None,
            retransmissions=retrans,
        )

    @classmethod
    def to_phase2_telemetry_records(
        cls,
        normalized: NormalizedTelemetryRecord,
        source: str = "collector_ingestion",
    ) -> List[TelemetryRecord]:
        """
        Convert a normalized record into individual canonical Phase 2 TelemetryRecord instances.
        Each record is validated strictly against Phase 2 METRIC_REGISTRY.
        """
        records: List[TelemetryRecord] = []
        base_id = f"{normalized.incident_id}_{normalized.device_id}"

        # Performance metrics
        perf_metrics = [
            (MetricName.LATENCY, MetricCategory.PERFORMANCE, normalized.latency_ms, MetricUnit.MILLISECONDS),
            (MetricName.PACKET_LOSS, MetricCategory.PERFORMANCE, normalized.packet_loss_pct, MetricUnit.PERCENTAGE),
            (MetricName.JITTER, MetricCategory.PERFORMANCE, normalized.jitter_ms, MetricUnit.MILLISECONDS),
            (MetricName.THROUGHPUT, MetricCategory.PERFORMANCE, normalized.throughput_mbps, MetricUnit.MEGABITS_PER_SECOND),
            (MetricName.BANDWIDTH_UTILIZATION, MetricCategory.PERFORMANCE, normalized.bandwidth_utilization_pct, MetricUnit.PERCENTAGE),
        ]
        for idx, (m_name, m_cat, val, m_unit) in enumerate(perf_metrics):
            rec = TelemetryRecord(
                telemetry_id=f"TEL-{base_id}-P{idx}",
                device_id=normalized.device_id,
                metric_name=m_name,
                metric_category=m_cat,
                value=val,
                unit=m_unit,
                timestamp=normalized.timestamp,
                source=source,
            )
            records.append(rec)

        # Infrastructure metrics
        infra_metrics = [
            (MetricName.CPU_USAGE, MetricCategory.INFRASTRUCTURE, normalized.cpu_usage_pct, MetricUnit.PERCENTAGE),
            (MetricName.MEMORY_USAGE, MetricCategory.INFRASTRUCTURE, normalized.memory_usage_pct, MetricUnit.PERCENTAGE),
            (MetricName.INTERFACE_STATUS, MetricCategory.INFRASTRUCTURE, normalized.interface_status, MetricUnit.STATUS),
            (MetricName.DEVICE_UPTIME, MetricCategory.INFRASTRUCTURE, normalized.device_uptime_seconds, MetricUnit.SECONDS),
        ]
        for idx, (m_name, m_cat, val, m_unit) in enumerate(infra_metrics):
            rec = TelemetryRecord(
                telemetry_id=f"TEL-{base_id}-I{idx}",
                device_id=normalized.device_id,
                metric_name=m_name,
                metric_category=m_cat,
                value=val,
                unit=m_unit,
                timestamp=normalized.timestamp,
                source=source,
            )
            records.append(rec)

        # Connectivity metrics
        conn_metrics = [
            (MetricName.DNS_RESPONSE_TIME, MetricCategory.CONNECTIVITY, normalized.dns_response_time_ms, MetricUnit.MILLISECONDS),
            (MetricName.DNS_RESOLUTION_STATUS, MetricCategory.CONNECTIVITY, normalized.dns_resolution_status, MetricUnit.STATUS),
            (MetricName.DHCP_STATUS, MetricCategory.CONNECTIVITY, normalized.dhcp_status, MetricUnit.STATUS),
            (MetricName.GATEWAY_REACHABILITY, MetricCategory.CONNECTIVITY, normalized.gateway_reachability, MetricUnit.STATUS),
            (MetricName.INTERFACE_CONNECTIVITY, MetricCategory.CONNECTIVITY, normalized.interface_connectivity, MetricUnit.STATUS),
        ]
        for idx, (m_name, m_cat, val, m_unit) in enumerate(conn_metrics):
            rec = TelemetryRecord(
                telemetry_id=f"TEL-{base_id}-C{idx}",
                device_id=normalized.device_id,
                metric_name=m_name,
                metric_category=m_cat,
                value=val,
                unit=m_unit,
                timestamp=normalized.timestamp,
                source=source,
            )
            records.append(rec)

        return records
