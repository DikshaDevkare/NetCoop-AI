"""
Deterministic rules for Connectivity Analysis Agent.
"""

from typing import Any, Dict, List
from app.schemas.enums import Severity


DNS_TIMEOUT_CRITICAL_MS: float = 150.0
DNS_LATENCY_ELEVATED_MS: float = 50.0
DNS_BASELINE_MS: float = 15.0

WIFI_RSSI_CRITICAL_DBM: float = -80.0
WIFI_RSSI_DEGRADED_DBM: float = -75.0
WIFI_RSSI_GOOD_DBM: float = -60.0


def evaluate_connectivity_rules(row: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluates connectivity, name resolution, and RF link metrics.
    Preserves awareness of device roles (e.g., switches vs APs).
    """
    anomalies: List[Dict[str, Any]] = []
    dev_type = str(row.get("device_type", "")).lower()

    # 1. DNS response time check
    dns_time = row.get("dns_response_time_ms")
    if dns_time is not None:
        dns_time = float(dns_time)
        if dns_time >= DNS_TIMEOUT_CRITICAL_MS:
            anomalies.append({
                "type": "dns_resolution_timeout",
                "metric": "dns_response_time_ms",
                "observed": dns_time,
                "expected": f"< {DNS_BASELINE_MS:.0f} ms",
                "severity": Severity.CRITICAL,
                "description": f"DNS resolution timeout / failure observed at {dns_time:.1f} ms (expected < {DNS_BASELINE_MS:.0f} ms).",
            })
        elif dns_time >= DNS_LATENCY_ELEVATED_MS:
            anomalies.append({
                "type": "dns_latency_elevated",
                "metric": "dns_response_time_ms",
                "observed": dns_time,
                "expected": f"< {DNS_BASELINE_MS:.0f} ms",
                "severity": Severity.MEDIUM,
                "description": f"Elevated DNS query response time: {dns_time:.1f} ms.",
            })

    # 2. Wireless signal strength check
    # CRITICAL: Missing RSSI on non-wireless devices is normal, NOT a fault!
    rssi = row.get("wireless_signal_strength_dbm")
    is_wireless_device = "ap" in dev_type or "wireless" in dev_type or "wifi" in str(row.get("device_id", "")).lower()

    if rssi is not None and not pd_isna(rssi):
        rssi_val = float(rssi)
        if rssi_val <= WIFI_RSSI_CRITICAL_DBM:
            anomalies.append({
                "type": "critical_weak_wifi_signal",
                "metric": "wireless_signal_strength_dbm",
                "observed": rssi_val,
                "expected": f">= {WIFI_RSSI_GOOD_DBM:.0f} dBm",
                "severity": Severity.HIGH,
                "description": f"Severe Wi-Fi signal attenuation detected at {rssi_val:.1f} dBm (frequent frame drops).",
            })
        elif rssi_val <= WIFI_RSSI_DEGRADED_DBM:
            anomalies.append({
                "type": "degraded_wifi_signal",
                "metric": "wireless_signal_strength_dbm",
                "observed": rssi_val,
                "expected": f">= {WIFI_RSSI_GOOD_DBM:.0f} dBm",
                "severity": Severity.MEDIUM,
                "description": f"Degraded Wi-Fi signal strength: {rssi_val:.1f} dBm.",
            })
    elif is_wireless_device:
        # Only flag missing RSSI if the device is explicitly designated an Access Point
        anomalies.append({
            "type": "missing_wireless_telemetry",
            "metric": "wireless_signal_strength_dbm",
            "observed": "None / Missing",
            "expected": "-30 to -70 dBm",
            "severity": Severity.LOW,
            "description": "Wireless AP telemetry missing RSSI radio measurements.",
        })

    # 3. Gateway / DHCP explicit status check if present
    gw_status = row.get("gateway_reachability")
    if gw_status is not None and str(gw_status).lower() in ("unreachable", "down", "failed"):
        anomalies.append({
            "type": "gateway_unreachable",
            "metric": "gateway_reachability",
            "observed": str(gw_status),
            "expected": "reachable",
            "severity": Severity.CRITICAL,
            "description": "Default gateway unreachability detected.",
        })

    dhcp_status = row.get("dhcp_status")
    if dhcp_status is not None and str(dhcp_status).lower() in ("timeout", "nack", "failed"):
        anomalies.append({
            "type": "dhcp_lease_failure",
            "metric": "dhcp_status",
            "observed": str(dhcp_status),
            "expected": "bound",
            "severity": Severity.HIGH,
            "description": "DHCP lease negotiation timeout / failure.",
        })

    return anomalies


def pd_isna(val: Any) -> bool:
    try:
        import numpy as np
        return bool(np.isnan(val))
    except (TypeError, ValueError):
        return val is None
