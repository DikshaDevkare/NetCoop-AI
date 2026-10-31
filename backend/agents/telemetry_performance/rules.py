"""
Deterministic threshold rules and evaluation criteria for Telemetry & Performance Agent.
"""

from typing import Any, Dict, List, Optional
from app.schemas.enums import Severity


# Telemetry baseline thresholds
LATENCY_CRITICAL_MS: float = 200.0
LATENCY_ELEVATED_MS: float = 50.0
LATENCY_BASELINE_MS: float = 20.0

PACKET_LOSS_CRITICAL_PCT: float = 5.0
PACKET_LOSS_MODERATE_PCT: float = 1.0
PACKET_LOSS_TRACE_PCT: float = 0.05

QUEUE_DROPS_CRITICAL: int = 200
QUEUE_DROPS_ELEVATED: int = 20

BANDWIDTH_SATURATION_PCT: float = 85.0
BANDWIDTH_ELEVATED_PCT: float = 70.0

JITTER_ELEVATED_MS: float = 15.0
RETRANSMISSIONS_ELEVATED: int = 25


def evaluate_performance_rules(row: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluates individual telemetry record against deterministic network performance rules.
    Returns list of detected anomalies with empirical evidence details.
    """
    anomalies: List[Dict[str, Any]] = []

    # 1. Latency check
    lat = float(row.get("latency_ms", 0.0) or 0.0)
    if lat > LATENCY_CRITICAL_MS:
        anomalies.append({
            "type": "critical_latency_spike",
            "metric": "latency_ms",
            "observed": lat,
            "expected": f"5–{LATENCY_BASELINE_MS:.0f} ms",
            "severity": Severity.HIGH,
            "description": f"Severe latency spike observed at {lat:.1f} ms (expected baseline <= {LATENCY_BASELINE_MS:.0f} ms).",
        })
    elif lat > LATENCY_ELEVATED_MS:
        anomalies.append({
            "type": "elevated_latency",
            "metric": "latency_ms",
            "observed": lat,
            "expected": f"5–{LATENCY_BASELINE_MS:.0f} ms",
            "severity": Severity.MEDIUM,
            "description": f"Elevated latency observed at {lat:.1f} ms (expected baseline <= {LATENCY_BASELINE_MS:.0f} ms).",
        })

    # 2. Packet loss check
    loss = float(row.get("packet_loss_pct", 0.0) or 0.0)
    if loss > PACKET_LOSS_CRITICAL_PCT:
        anomalies.append({
            "type": "critical_packet_loss",
            "metric": "packet_loss_pct",
            "observed": loss,
            "expected": "0.0%",
            "severity": Severity.CRITICAL,
            "description": f"Critical packet loss observed at {loss:.2f}% (acceptable baseline is 0.0%).",
        })
    elif loss > PACKET_LOSS_MODERATE_PCT:
        anomalies.append({
            "type": "moderate_packet_loss",
            "metric": "packet_loss_pct",
            "observed": loss,
            "expected": "0.0%",
            "severity": Severity.HIGH,
            "description": f"Degraded packet loss observed at {loss:.2f}% (acceptable baseline is 0.0%).",
        })
    elif loss > PACKET_LOSS_TRACE_PCT:
        anomalies.append({
            "type": "trace_packet_loss",
            "metric": "packet_loss_pct",
            "observed": loss,
            "expected": "0.0%",
            "severity": Severity.LOW,
            "description": f"Trace packet loss observed at {loss:.2f}%.",
        })

    # 3. Queue drops check
    q_drops = int(row.get("queue_drops", 0) or 0)
    if q_drops > QUEUE_DROPS_CRITICAL:
        anomalies.append({
            "type": "buffer_overflow_queue_drops",
            "metric": "queue_drops",
            "observed": q_drops,
            "expected": "0 drops",
            "severity": Severity.HIGH,
            "description": f"Severe buffer saturation detected with {q_drops} interface queue drops.",
        })
    elif q_drops > QUEUE_DROPS_ELEVATED:
        anomalies.append({
            "type": "elevated_queue_drops",
            "metric": "queue_drops",
            "observed": q_drops,
            "expected": "0 drops",
            "severity": Severity.MEDIUM,
            "description": f"Buffer pressure detected with {q_drops} interface queue drops.",
        })

    # 4. Bandwidth utilization check
    bw = float(row.get("bandwidth_utilization_pct", 0.0) or 0.0)
    if bw > BANDWIDTH_SATURATION_PCT:
        anomalies.append({
            "type": "link_bandwidth_saturation",
            "metric": "bandwidth_utilization_pct",
            "observed": bw,
            "expected": "< 70.0%",
            "severity": Severity.HIGH,
            "description": f"Link bandwidth near saturation at {bw:.1f}% utilization.",
        })

    # 5. Jitter check
    jitter = float(row.get("jitter_ms", 0.0) or 0.0)
    if jitter > JITTER_ELEVATED_MS:
        anomalies.append({
            "type": "jitter_variation",
            "metric": "jitter_ms",
            "observed": jitter,
            "expected": "1–5 ms",
            "severity": Severity.LOW,
            "description": f"Packet jitter elevated at {jitter:.1f} ms.",
        })

    # 6. Retransmissions check
    retx = int(row.get("retransmissions", 0) or 0)
    if retx > RETRANSMISSIONS_ELEVATED:
        anomalies.append({
            "type": "tcp_retransmissions",
            "metric": "retransmissions",
            "observed": retx,
            "expected": "< 10 packets",
            "severity": Severity.MEDIUM,
            "description": f"High TCP retransmission count observed: {retx} packets.",
        })

    return anomalies
