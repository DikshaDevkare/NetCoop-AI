"""
Analyzer engine for Connectivity Analysis Agent.
"""

from typing import Any, Dict, List, Optional
import pandas as pd

from app.schemas.enums import ConfidenceLevel, Severity
from agents.connectivity.rules import evaluate_connectivity_rules


class ConnectivityAnalyzer:
    """
    Evaluates end-to-end reachability, name resolution, and wireless RF link health.
    """

    def analyze(
        self,
        telemetry: pd.DataFrame,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        if telemetry.empty:
            return {"anomalies": [], "findings": [], "affected_devices": []}

        all_anomalies: List[Dict[str, Any]] = []
        affected_devices: set = set()

        records = telemetry.to_dict(orient="records")
        for row in records:
            dev_id = str(row.get("device_id", "DEV-UNKNOWN"))
            row_anomalies = evaluate_connectivity_rules(row)
            for anom in row_anomalies:
                anom["device_id"] = dev_id
                all_anomalies.append(anom)
                affected_devices.add(dev_id)

        findings: List[Dict[str, Any]] = []
        if all_anomalies:
            types = [a["type"] for a in all_anomalies]
            has_dns = "dns_resolution_timeout" in types or "dns_latency_elevated" in types
            has_wifi = "critical_weak_wifi_signal" in types or "degraded_wifi_signal" in types

            if has_dns and not has_wifi:
                title = "DNS Resolution Latency or Resolver Outage"
                desc = f"DNS query degradation detected across devices: {', '.join(sorted(list(affected_devices)))}."
                suspected = "Core DNS server unreachability or resolver query timeout"
                alts = ["Upstream ISP recursive resolver timeout", "Local DNS service crash"]
                sev = Severity.HIGH
                conf = ConfidenceLevel.HIGH
            elif has_wifi:
                title = "Wireless RF Signal Degradation"
                desc = f"Excessive wireless path loss / weak RSSI detected on AP(s): {', '.join(sorted(list(affected_devices)))}."
                suspected = "Client distance from AP, physical wall attenuation, or co-channel RF interference"
                alts = ["Access Point transmit power misconfiguration", "Client antenna failure"]
                sev = Severity.MEDIUM
                conf = ConfidenceLevel.HIGH
            else:
                title = "Network Connectivity Degradation"
                desc = f"Intermittent reachability issues observed on: {', '.join(sorted(list(affected_devices)))}."
                suspected = "Layer-2 / Layer-3 connectivity disruption"
                alts = ["ARP cache expiration", "Firewall state table saturation"]
                sev = Severity.MEDIUM
                conf = ConfidenceLevel.MEDIUM

            findings.append({
                "title": title,
                "description": desc,
                "suspected_cause": suspected,
                "severity": sev,
                "confidence": conf,
                "affected_devices": sorted(list(affected_devices)),
                "alternative_causes": alts,
                "anomalies": all_anomalies,
            })

        return {
            "anomalies": all_anomalies,
            "findings": findings,
            "affected_devices": sorted(list(affected_devices)),
        }
