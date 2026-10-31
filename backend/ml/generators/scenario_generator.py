"""
Scenario Generator for NetCoop AI.

Extends the organizer baseline to generate all 7 clean network fault scenarios
(Scenarios A-G) plus the separate malformed interoperability corpus (Scenario H).
"""

from datetime import datetime, timezone
import random
from typing import Any, Dict, List, Optional


class ScenarioGenerator:
    """
    Generates synthetic telemetry metrics conforming to specific network fault scenarios.
    """

    def __init__(self, seed: Optional[int] = None):
        self.rng = random.Random(seed) if seed is not None else random.Random()

    def generate_scenario_metrics(
        self,
        scenario_label: str,
        device_type: str = "switch",
        progress_ratio: float = 0.5,
    ) -> Dict[str, Any]:
        """
        Generate raw metrics for a given scenario.

        Args:
            scenario_label: One of normal, latency_spike, hardware_failure,
                           congestion, weak_wifi, interface_fault, dns_dhcp_failure.
            device_type: Classification of the monitored device.
            progress_ratio: Timeline progression (0.0=start, 1.0=peak) for degradation modeling.

        Returns:
            Dictionary containing metrics, status, and scenario-specific values.
        """
        rng = self.rng

        if scenario_label == "normal":
            return {
                "metrics": {
                    "cpu_utilization_pct": round(rng.uniform(10.0, 35.0), 2),
                    "link_utilization_pct": round(rng.uniform(20.0, 50.0), 2),
                    "packet_loss_pct": 0.0,
                    "latency_ms": round(rng.uniform(5.0, 20.0), 2),
                    "jitter_ms": round(rng.uniform(1.0, 5.0), 2),
                    "throughput_mbps": round(rng.uniform(85.0, 100.0), 2),
                    "queue_drops": 0,
                    "interface_errors": 0,
                    "memory_usage_pct": round(rng.uniform(20.0, 45.0), 2),
                    "interface_status": "up",
                    "device_uptime_seconds": round(rng.uniform(36000.0, 864000.0), 1),
                    "temperature_celsius": round(rng.uniform(32.0, 48.0), 1),
                    "dns_response_time_ms": round(rng.uniform(8.0, 25.0), 1),
                    "dns_resolution_status": "success",
                    "dhcp_status": "assigned",
                    "gateway_reachability": "reachable",
                    "interface_connectivity": "connected",
                    "retransmissions": 0,
                    "wireless_signal_strength_dbm": -45.0 if device_type == "access_point" else None,
                },
                "status": "Healthy",
            }

        elif scenario_label == "latency_spike":
            # Organizer reference ranges
            return {
                "metrics": {
                    "cpu_utilization_pct": round(rng.uniform(40.0, 70.0), 2),
                    "link_utilization_pct": round(rng.uniform(60.0, 85.0), 2),
                    "packet_loss_pct": round(rng.uniform(0.1, 1.5), 2),
                    "latency_ms": round(rng.uniform(150.0, 400.0), 2),
                    "jitter_ms": round(rng.uniform(30.0, 80.0), 2),
                    "throughput_mbps": round(rng.uniform(45.0, 75.0), 2),
                    "queue_drops": rng.randint(0, 50),
                    "interface_errors": rng.randint(0, 5),
                    "memory_usage_pct": round(rng.uniform(40.0, 65.0), 2),
                    "interface_status": "up",
                    "device_uptime_seconds": round(rng.uniform(36000.0, 864000.0), 1),
                    "temperature_celsius": round(rng.uniform(40.0, 55.0), 1),
                    "dns_response_time_ms": round(rng.uniform(30.0, 70.0), 1),
                    "dns_resolution_status": "success",
                    "dhcp_status": "assigned",
                    "gateway_reachability": "reachable",
                    "interface_connectivity": "connected",
                    "retransmissions": rng.randint(1, 15),
                    "wireless_signal_strength_dbm": -55.0 if device_type == "access_point" else None,
                },
                "status": "Warning",
            }

        elif scenario_label == "hardware_failure":
            # Organizer reference ranges
            return {
                "metrics": {
                    "cpu_utilization_pct": 99.9,
                    "link_utilization_pct": 100.0,
                    "packet_loss_pct": round(rng.uniform(15.0, 30.0), 2),
                    "latency_ms": round(rng.uniform(500.0, 1000.0), 2),
                    "jitter_ms": round(rng.uniform(60.0, 150.0), 2),
                    "throughput_mbps": round(rng.uniform(0.5, 5.0), 2),
                    "queue_drops": rng.randint(5000, 15000),
                    "interface_errors": rng.randint(100, 500),
                    "memory_usage_pct": round(rng.uniform(92.0, 99.5), 2),
                    "interface_status": "degraded",
                    "device_uptime_seconds": round(rng.uniform(100.0, 3600.0), 1),
                    "temperature_celsius": round(rng.uniform(75.0, 95.0), 1),
                    "dns_response_time_ms": round(rng.uniform(250.0, 800.0), 1),
                    "dns_resolution_status": "timeout",
                    "dhcp_status": "timeout",
                    "gateway_reachability": "degraded",
                    "interface_connectivity": "degraded",
                    "retransmissions": rng.randint(200, 1200),
                    "wireless_signal_strength_dbm": -88.0 if device_type == "access_point" else None,
                },
                "status": "Critical",
            }

        elif scenario_label == "congestion":
            # High link utilization and queue saturation
            link_util = round(rng.uniform(85.0, 98.0), 2)
            queue_drops = rng.randint(200, 2500)
            latency = round(rng.uniform(120.0, 350.0), 2)
            loss = round(rng.uniform(2.0, 8.0), 2)
            return {
                "metrics": {
                    "cpu_utilization_pct": round(rng.uniform(45.0, 75.0), 2),
                    "link_utilization_pct": link_util,
                    "packet_loss_pct": loss,
                    "latency_ms": latency,
                    "jitter_ms": round(rng.uniform(20.0, 60.0), 2),
                    "throughput_mbps": round(rng.uniform(15.0, 40.0), 2),
                    "queue_drops": queue_drops,
                    "interface_errors": rng.randint(5, 50),
                    "memory_usage_pct": round(rng.uniform(50.0, 75.0), 2),
                    "interface_status": "up",
                    "device_uptime_seconds": round(rng.uniform(10000.0, 500000.0), 1),
                    "temperature_celsius": round(rng.uniform(45.0, 62.0), 1),
                    "dns_response_time_ms": round(rng.uniform(35.0, 90.0), 1),
                    "dns_resolution_status": "success",
                    "dhcp_status": "assigned",
                    "gateway_reachability": "reachable",
                    "interface_connectivity": "connected",
                    "retransmissions": rng.randint(50, 400),
                    "wireless_signal_strength_dbm": -52.0 if device_type == "access_point" else None,
                },
                "status": "Warning",
            }

        elif scenario_label == "weak_wifi":
            # Wireless signal attenuation and frame retransmissions
            signal_dbm = round(rng.uniform(-85.0, -72.0), 1)
            retrans = rng.randint(40, 300)
            loss = round(rng.uniform(3.0, 15.0), 2)
            latency = round(rng.uniform(60.0, 250.0), 2)
            return {
                "metrics": {
                    "cpu_utilization_pct": round(rng.uniform(20.0, 45.0), 2),
                    "link_utilization_pct": round(rng.uniform(30.0, 60.0), 2),
                    "packet_loss_pct": loss,
                    "latency_ms": latency,
                    "jitter_ms": round(rng.uniform(25.0, 90.0), 2),
                    "throughput_mbps": round(rng.uniform(2.0, 20.0), 2),
                    "queue_drops": rng.randint(0, 30),
                    "interface_errors": rng.randint(2, 25),
                    "memory_usage_pct": round(rng.uniform(25.0, 50.0), 2),
                    "interface_status": "up",
                    "device_uptime_seconds": round(rng.uniform(10000.0, 400000.0), 1),
                    "temperature_celsius": round(rng.uniform(35.0, 50.0), 1),
                    "dns_response_time_ms": round(rng.uniform(20.0, 80.0), 1),
                    "dns_resolution_status": "success",
                    "dhcp_status": "assigned",
                    "gateway_reachability": "reachable",
                    "interface_connectivity": "connected",
                    "retransmissions": retrans,
                    "wireless_signal_strength_dbm": signal_dbm,
                },
                "status": "Warning",
            }

        elif scenario_label == "interface_fault":
            # Physical interface CRC errors or link degradation
            status_val = rng.choice(["degraded", "down"])
            conn_val = "disconnected" if status_val == "down" else "degraded"
            gw_val = "unreachable" if status_val == "down" else "degraded"
            return {
                "metrics": {
                    "cpu_utilization_pct": round(rng.uniform(25.0, 55.0), 2),
                    "link_utilization_pct": round(rng.uniform(5.0, 40.0), 2),
                    "packet_loss_pct": round(rng.uniform(5.0, 40.0), 2),
                    "latency_ms": round(rng.uniform(80.0, 450.0), 2),
                    "jitter_ms": round(rng.uniform(20.0, 80.0), 2),
                    "throughput_mbps": round(rng.uniform(0.1, 15.0), 2),
                    "queue_drops": rng.randint(10, 150),
                    "interface_errors": rng.randint(50, 800),
                    "memory_usage_pct": round(rng.uniform(30.0, 55.0), 2),
                    "interface_status": status_val,
                    "device_uptime_seconds": round(rng.uniform(1000.0, 200000.0), 1),
                    "temperature_celsius": round(rng.uniform(38.0, 55.0), 1),
                    "dns_response_time_ms": round(rng.uniform(40.0, 200.0), 1),
                    "dns_resolution_status": "failed" if status_val == "down" else "success",
                    "dhcp_status": "expired" if status_val == "down" else "assigned",
                    "gateway_reachability": gw_val,
                    "interface_connectivity": conn_val,
                    "retransmissions": rng.randint(80, 500),
                    "wireless_signal_strength_dbm": -60.0 if device_type == "access_point" else None,
                },
                "status": "Critical",
            }

        elif scenario_label == "dns_dhcp_failure":
            # DNS/DHCP core service failure while physical links remain healthy
            dns_fail = rng.choice([True, False])
            dhcp_fail = not dns_fail or rng.choice([True, False])

            dns_time = round(rng.uniform(800.0, 3000.0), 1) if dns_fail else round(rng.uniform(10.0, 30.0), 1)
            dns_status = rng.choice(["failed", "timeout"]) if dns_fail else "success"
            dhcp_status = rng.choice(["failed", "timeout", "expired"]) if dhcp_fail else "assigned"

            return {
                "metrics": {
                    "cpu_utilization_pct": round(rng.uniform(15.0, 40.0), 2),
                    "link_utilization_pct": round(rng.uniform(20.0, 45.0), 2),
                    "packet_loss_pct": round(rng.uniform(0.0, 2.0), 2),
                    "latency_ms": round(rng.uniform(10.0, 40.0), 2),
                    "jitter_ms": round(rng.uniform(2.0, 8.0), 2),
                    "throughput_mbps": round(rng.uniform(70.0, 95.0), 2),
                    "queue_drops": 0,
                    "interface_errors": 0,
                    "memory_usage_pct": round(rng.uniform(25.0, 50.0), 2),
                    "interface_status": "up",
                    "device_uptime_seconds": round(rng.uniform(20000.0, 600000.0), 1),
                    "temperature_celsius": round(rng.uniform(35.0, 50.0), 1),
                    "dns_response_time_ms": dns_time,
                    "dns_resolution_status": dns_status,
                    "dhcp_status": dhcp_status,
                    "gateway_reachability": "reachable",
                    "interface_connectivity": "connected",
                    "retransmissions": rng.randint(0, 10),
                    "wireless_signal_strength_dbm": -50.0 if device_type == "access_point" else None,
                },
                "status": "Warning" if not (dns_fail and dhcp_fail) else "Critical",
            }

        else:
            raise ValueError(f"Unknown scenario label: '{scenario_label}'")

    def generate_interoperability_failure_corpus(self, count: int = 15) -> List[Dict[str, Any]]:
        """
        Generate malformed and non-compliant samples for protocol robustness testing.
        These samples test schema rejection and must NOT contaminate clean ML datasets.
        """
        rng = self.rng
        malformed_samples: List[Dict[str, Any]] = []

        flaws = [
            ("unsupported_metric_name", {"unknown_quantum_flux_metric": 42.0}),
            ("invalid_unit", {"latency_ms": -50.0}),  # Negative latency
            ("packet_loss_over_100", {"packet_loss_pct": 140.0}),
            ("cpu_over_100", {"cpu_utilization_pct": 200.0}),
            ("naive_timestamp", {"timestamp": "2026-10-31 12:00:00"}),
            ("missing_device_id", {"device_id": ""}),
            ("unsupported_protocol_version", {"protocol_version": "9.9"}),
            ("invalid_status_enum", {"interface_status": "floating_in_space"}),
            ("type_mismatch", {"latency_ms": "super_slow"}),
            ("missing_required_fields", {}),
        ]

        for idx in range(count):
            flaw_name, flaw_data = flaws[idx % len(flaws)]
            sample: Dict[str, Any] = {
                "test_id": f"MALFORMED-{idx+1:03d}",
                "flaw_category": flaw_name,
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "device_id": f"DEV_ERR_{rng.randint(1, 5)}",
                "metrics": {
                    "cpu_utilization_pct": 25.0,
                    "latency_ms": 15.0,
                    "packet_loss_pct": 0.0,
                },
                "status": "Healthy",
            }
            # Inject specific flaw
            if flaw_name == "naive_timestamp":
                sample["timestamp"] = flaw_data["timestamp"]
            elif flaw_name == "missing_device_id":
                sample["device_id"] = flaw_data["device_id"]
            elif flaw_name == "missing_required_fields":
                sample.pop("metrics")
            else:
                sample["metrics"].update(flaw_data)

            malformed_samples.append(sample)

        return malformed_samples
