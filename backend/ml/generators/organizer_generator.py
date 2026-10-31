"""
Official Organizer-Provided Synthetic Telemetry Generator.

Preserves the exact scenario logic, status values, and metric distributions
from the organizer's baseline implementation while upgrading deprecated datetime.utcnow()
to timezone-aware UTC datetime and supporting configurable random seeds.
"""

from datetime import datetime, timezone
import random
from typing import Any, Dict, Optional


def generate_telemetry(
    fault_type: str = "normal",
    seed: Optional[int] = None,
    rng: Optional[random.Random] = None,
) -> Dict[str, Any]:
    """
    Generate synthetic telemetry adhering to the organizer's reference specification.

    Args:
        fault_type: One of "normal", "latency_spike", "hardware_failure".
        seed: Optional integer seed for reproducibility.
        rng: Optional random.Random instance for controlled multi-call generation.

    Returns:
        Dictionary containing timestamp, device_id, metrics, and status.
    """
    if rng is None:
        rng = random.Random(seed) if seed is not None else random

    data: Dict[str, Any] = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "device_id": f"SW_CAMPUS_{rng.randint(1, 10)}",
        "metrics": {},
    }

    if fault_type == "latency_spike":
        data["metrics"] = {
            "cpu_utilization_pct": round(rng.uniform(40, 70), 2),
            "link_utilization_pct": round(rng.uniform(60, 85), 2),
            "packet_loss_pct": round(rng.uniform(0.1, 1.5), 2),
            "latency_ms": round(rng.uniform(150, 400), 2),
            "jitter_ms": round(rng.uniform(30, 80), 2),
            "queue_drops": rng.randint(0, 50),
        }
        data["status"] = "Warning"

    elif fault_type == "hardware_failure":
        data["metrics"] = {
            "cpu_utilization_pct": 99.9,
            "link_utilization_pct": 100.0,
            "packet_loss_pct": round(rng.uniform(15, 30), 2),
            "latency_ms": round(rng.uniform(500, 1000), 2),
            "queue_drops": rng.randint(5000, 15000),
            "interface_errors": rng.randint(100, 500),
        }
        data["status"] = "Critical"

    else:
        # Default scenario: "normal"
        data["metrics"] = {
            "cpu_utilization_pct": round(rng.uniform(10, 35), 2),
            "link_utilization_pct": round(rng.uniform(20, 50), 2),
            "packet_loss_pct": 0.0,
            "latency_ms": round(rng.uniform(5, 20), 2),
            "jitter_ms": round(rng.uniform(1, 5), 2),
            "queue_drops": 0,
        }
        data["status"] = "Healthy"

    return data
