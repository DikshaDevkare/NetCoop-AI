"""
Analysis engine for Telemetry & Performance Agent.
"""

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from app.schemas.enums import AgentId, ConfidenceLevel, Severity
from agents.telemetry_performance.rules import evaluate_performance_rules


class TelemetryPerformanceAnalyzer:
    """
    Evaluates network performance telemetry batches, generating empirical findings
    without jumping to definitive unverified root causes.
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
        all_devices = sorted(list(set(str(r.get("device_id", "DEV-UNKNOWN")) for r in records)))
        for row in records:
            dev_id = str(row.get("device_id", "DEV-UNKNOWN"))
            row_anomalies = evaluate_performance_rules(row)
            for anom in row_anomalies:
                anom["device_id"] = dev_id
                all_anomalies.append(anom)
                affected_devices.add(dev_id)

        # Synthesize domain hypothesis
        findings: List[Dict[str, Any]] = []
        if all_anomalies:
            types = [a["type"] for a in all_anomalies]
            severities = [a["severity"] for a in all_anomalies]
            max_severity = Severity.CRITICAL if Severity.CRITICAL in severities else (
                Severity.HIGH if Severity.HIGH in severities else Severity.MEDIUM
            )

            # Determine suspected category
            has_drops = "buffer_overflow_queue_drops" in types or "elevated_queue_drops" in types
            has_bw = "link_bandwidth_saturation" in types
            has_high_lat = "critical_latency_spike" in types or "elevated_latency" in types
            has_loss = "critical_packet_loss" in types or "moderate_packet_loss" in types

            if has_drops and (has_bw or has_loss):
                title = "Network Link Congestion & Buffer Saturation"
                desc = (
                    f"Observed simultaneous link bandwidth saturation ({len([a for a in all_anomalies if a['type'] == 'link_bandwidth_saturation'])} events) "
                    f"and queue buffer drops across {len(affected_devices)} devices."
                )
                suspected = "Network link congestion / throughput bottleneck"
                alts = ["Upstream ISP throttling", "Hardware switch fabric buffer exhaustion"]
            elif has_high_lat and not has_drops:
                title = "Transient or Upstream Latency Spikes"
                desc = f"Significantly elevated latency across {len(affected_devices)} devices without significant buffer queue drops."
                suspected = "Path latency degradation / routing detour"
                alts = ["DNS lookup delay", "Intermediate peering node congestion"]
            else:
                title = "Network Performance Degradation"
                desc = f"Multiple performance threshold breaches detected across {len(affected_devices)} devices."
                suspected = "General network performance degradation"
                alts = ["Physical link degradation", "Device resource starvation"]

            # Incorporate temporal trend context if present
            temporal_ctx = (context or {}).get("temporal_analysis", {})
            if temporal_ctx.get("overall_trend") == "worsening":
                desc += " Temporal trajectory indicates actively worsening performance."
                confidence = ConfidenceLevel.HIGH
            elif temporal_ctx.get("overall_trend") == "recovering":
                desc += " Temporal trajectory indicates recent metric recovery."
                confidence = ConfidenceLevel.MEDIUM
            else:
                confidence = ConfidenceLevel.MEDIUM if len(all_anomalies) > 2 else ConfidenceLevel.LOW

            findings.append({
                "title": title,
                "description": desc,
                "suspected_cause": suspected,
                "severity": max_severity,
                "confidence": confidence,
                "affected_devices": sorted(list(affected_devices)),
                "alternative_causes": alts,
                "anomalies": all_anomalies,
            })
        else:
            findings.append({
                "title": "Network Telemetry & Performance Nominal",
                "description": f"Latency, jitter, packet loss, and queue depths remain within acceptable SLA baseline bounds across device(s): {', '.join(all_devices)}.",
                "suspected_cause": "Normal Performance Baseline",
                "severity": Severity.INFORMATIONAL,
                "confidence": ConfidenceLevel.HIGH,
                "affected_devices": all_devices,
                "alternative_causes": [],
                "anomalies": [],
            })

        return {
            "anomalies": all_anomalies,
            "findings": findings,
            "affected_devices": sorted(list(affected_devices)),
        }
