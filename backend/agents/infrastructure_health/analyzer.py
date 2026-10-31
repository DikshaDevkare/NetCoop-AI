"""
Analyzer engine for Infrastructure Health Agent.
"""

from typing import Any, Dict, List, Optional
import pandas as pd

from app.schemas.enums import ConfidenceLevel, Severity
from agents.infrastructure_health.rules import evaluate_infrastructure_rules


class InfrastructureHealthAnalyzer:
    """
    Evaluates hardware health, CPU/memory pressure, thermal limits, and physical errors.
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
            row_anomalies = evaluate_infrastructure_rules(row)
            for anom in row_anomalies:
                anom["device_id"] = dev_id
                all_anomalies.append(anom)
                affected_devices.add(dev_id)

        findings: List[Dict[str, Any]] = []
        if all_anomalies:
            types = [a["type"] for a in all_anomalies]
            has_cpu_lock = "cpu_lockup_overload" in types
            has_interface_err = "physical_interface_errors_high" in types or "physical_interface_errors_moderate" in types
            has_thermal = "thermal_throttling" in types

            if has_cpu_lock:
                title = "Hardware Processing Lockup / CPU Saturation"
                desc = f"Critical CPU pegging (>95%) detected on device(s): {', '.join(sorted(list(affected_devices)))}."
                suspected = "Control plane process runaway or hardware failure"
                alts = ["BGP/OSPF route flapping storm", "Broadcast storm saturating CPU interrupt handlers"]
                sev = Severity.CRITICAL
                conf = ConfidenceLevel.HIGH
            elif has_interface_err and not has_cpu_lock:
                title = "Physical Layer Interface / Transceiver Fault"
                desc = f"High physical layer CRC error counters detected on: {', '.join(sorted(list(affected_devices)))}."
                suspected = "Damaged patch cabling, dirty optical connector, or SFP transceiver degradation"
                alts = ["Duplex/speed auto-negotiation mismatch", "Electromagnetic interference on unshielded cable"]
                sev = Severity.HIGH
                conf = ConfidenceLevel.HIGH
            elif has_thermal:
                title = "Thermal Overheating Warning"
                desc = f"Chassis temperatures exceeded safe operating threshold on: {', '.join(sorted(list(affected_devices)))}."
                suspected = "Fan tray failure or rack airflow obstruction"
                alts = ["Ambient server room HVAC failure", "Overclocked ASIC"]
                sev = Severity.CRITICAL
                conf = ConfidenceLevel.MEDIUM
            else:
                title = "Infrastructure Health Anomaly"
                desc = f"Sub-optimal hardware telemetry observed on: {', '.join(sorted(list(affected_devices)))}."
                suspected = "Device resource contention"
                alts = ["Transient workload burst", "Telemetry polling jitter"]
                sev = Severity.MEDIUM
                conf = ConfidenceLevel.LOW

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
