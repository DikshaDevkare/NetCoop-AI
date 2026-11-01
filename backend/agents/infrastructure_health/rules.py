"""
Deterministic rules for Infrastructure Health Agent.
"""

from typing import Any, Dict, List
from app.schemas.enums import Severity


CPU_CRITICAL_PCT: float = 95.0
CPU_ELEVATED_PCT: float = 80.0

MEMORY_CRITICAL_PCT: float = 90.0
MEMORY_ELEVATED_PCT: float = 80.0

TEMP_CRITICAL_C: float = 75.0
TEMP_ELEVATED_C: float = 65.0

INTERFACE_ERRORS_CRITICAL: int = 100
INTERFACE_ERRORS_ELEVATED: int = 10

UPTIME_RECENT_REBOOT_SEC: float = 300.0


def evaluate_infrastructure_rules(row: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluates infrastructure health metrics against physical hardware thresholds.
    """
    anomalies: List[Dict[str, Any]] = []

    # 1. CPU usage check
    cpu = row.get("cpu_usage_pct")
    if cpu is not None:
        cpu = float(cpu)
        if cpu >= CPU_CRITICAL_PCT:
            anomalies.append({
                "type": "cpu_lockup_overload",
                "metric": "cpu_usage_pct",
                "observed": cpu,
                "expected": "< 60.0%",
                "severity": Severity.CRITICAL,
                "description": f"Critical CPU peg/lockup detected at {cpu:.1f}%.",
            })
        elif cpu >= CPU_ELEVATED_PCT:
            anomalies.append({
                "type": "cpu_elevated",
                "metric": "cpu_usage_pct",
                "observed": cpu,
                "expected": "< 60.0%",
                "severity": Severity.HIGH,
                "description": f"High CPU utilization observed at {cpu:.1f}%.",
            })

    # 2. Memory usage check
    mem = row.get("memory_usage_pct")
    if mem is not None:
        mem = float(mem)
        if mem >= MEMORY_CRITICAL_PCT:
            anomalies.append({
                "type": "memory_exhaustion",
                "metric": "memory_usage_pct",
                "observed": mem,
                "expected": "< 75.0%",
                "severity": Severity.CRITICAL,
                "description": f"Severe memory pressure/exhaustion at {mem:.1f}%.",
            })
        elif mem >= MEMORY_ELEVATED_PCT:
            anomalies.append({
                "type": "memory_elevated",
                "metric": "memory_usage_pct",
                "observed": mem,
                "expected": "< 75.0%",
                "severity": Severity.MEDIUM,
                "description": f"Elevated memory consumption at {mem:.1f}%.",
            })

    # 3. Temperature check
    temp = row.get("temperature_celsius")
    if temp is not None:
        temp = float(temp)
        if temp >= TEMP_CRITICAL_C:
            anomalies.append({
                "type": "thermal_throttling",
                "metric": "temperature_celsius",
                "observed": temp,
                "expected": "< 60.0 °C",
                "severity": Severity.CRITICAL,
                "description": f"Chassis thermal critical alert: {temp:.1f} °C.",
            })
        elif temp >= TEMP_ELEVATED_C:
            anomalies.append({
                "type": "temperature_elevated",
                "metric": "temperature_celsius",
                "observed": temp,
                "expected": "< 60.0 °C",
                "severity": Severity.HIGH,
                "description": f"Elevated device temperature at {temp:.1f} °C.",
            })

    # 4. Interface physical errors check
    errs = row.get("interface_errors")
    if errs is not None:
        try:
            import pandas as pd
            if pd.notna(errs):
                errs_val = int(float(errs))
                if errs_val >= INTERFACE_ERRORS_CRITICAL:
                    anomalies.append({
                        "type": "physical_interface_errors_high",
                        "metric": "interface_errors",
                        "observed": errs_val,
                        "expected": "0 errors",
                        "severity": Severity.CRITICAL,
                        "description": f"Severe physical interface CRC/FCS error rate: {errs_val} errors.",
                    })
                elif errs_val >= INTERFACE_ERRORS_ELEVATED:
                    anomalies.append({
                        "type": "physical_interface_errors_moderate",
                        "metric": "interface_errors",
                        "observed": errs_val,
                        "expected": "0 errors",
                        "severity": Severity.HIGH,
                        "description": f"Elevated physical interface errors detected: {errs_val} errors.",
                    })
        except (ValueError, TypeError):
            pass

    # 5. Uptime / unexpected reboot check
    uptime = row.get("device_uptime_seconds")
    if uptime is not None:
        uptime = float(uptime)
        if 0 < uptime < UPTIME_RECENT_REBOOT_SEC:
            anomalies.append({
                "type": "recent_device_reboot",
                "metric": "device_uptime_seconds",
                "observed": uptime,
                "expected": "> 3600 s",
                "severity": Severity.MEDIUM,
                "description": f"Device recently rebooted {uptime:.0f} seconds ago.",
            })

    return anomalies
