"""
Incident Generator for NetCoop AI.

Coordinates multi-device, multi-timestamp simulated network incidents across
realistic campus network topology segments with chronological ordering.
"""

from datetime import datetime, timedelta, timezone
import random
from typing import Any, Dict, List, Optional

from ml.config import (
    CAMPUS_NETWORK_SEGMENTS,
    CLEAN_SCENARIOS,
    DEFAULT_DEVICES_PER_INCIDENT,
    DEFAULT_OBSERVATIONS_PER_DEVICE,
    DEFAULT_SAMPLING_INTERVAL_SECONDS,
)
from ml.generators.scenario_generator import ScenarioGenerator


# Representative device templates per segment
CAMPUS_TOPOLOGY: Dict[str, List[Dict[str, str]]] = {
    "CAMPUS_CORE": [
        {"device_id": "SW_CORE_01", "device_type": "switch", "hostname": "core-sw01.campus.net"},
        {"device_id": "SW_CORE_02", "device_type": "switch", "hostname": "core-sw02.campus.net"},
        {"device_id": "RTR_GATEWAY_01", "device_type": "router", "hostname": "gw-border01.campus.net"},
    ],
    "DEPARTMENT_ETHERNET": [
        {"device_id": "SW_DEPT_CS01", "device_type": "switch", "hostname": "dept-cs-sw01.campus.net"},
        {"device_id": "SW_DEPT_EE01", "device_type": "switch", "hostname": "dept-ee-sw01.campus.net"},
        {"device_id": "CLIENT_LAB_01", "device_type": "client", "hostname": "cs-lab-pc01.campus.net"},
    ],
    "HOSTEL_WIFI": [
        {"device_id": "AP_HOSTEL_101", "device_type": "access_point", "hostname": "ap-h1-fl1.campus.net"},
        {"device_id": "AP_HOSTEL_102", "device_type": "access_point", "hostname": "ap-h1-fl2.campus.net"},
        {"device_id": "CLIENT_WIFI_01", "device_type": "client", "hostname": "student-laptop01.campus.net"},
    ],
    "SERVER_NETWORK": [
        {"device_id": "SRV_DNS_DHCP_01", "device_type": "server", "hostname": "dns-dhcp01.campus.net"},
        {"device_id": "SRV_APP_PORTAL_01", "device_type": "server", "hostname": "portal01.campus.net"},
        {"device_id": "SW_SERVER_RACK01", "device_type": "switch", "hostname": "rack-sw01.campus.net"},
    ],
    "LECTURE_HALL_NETWORK": [
        {"device_id": "AP_LH_AUDITORIUM", "device_type": "access_point", "hostname": "ap-lh-aud.campus.net"},
        {"device_id": "SW_LH_DIST_01", "device_type": "switch", "hostname": "lh-dist-sw01.campus.net"},
    ],
}


class IncidentGenerator:
    """
    Generates coherent, chronologically ordered multi-device incidents.
    """

    def __init__(self, seed: Optional[int] = None):
        self.seed = seed
        self.rng = random.Random(seed) if seed is not None else random.Random()
        self.scenario_gen = ScenarioGenerator(seed=self.rng.randint(0, 1000000) if seed is not None else None)

    def generate_incident(
        self,
        incident_id: str,
        scenario_label: str,
        base_timestamp: Optional[datetime] = None,
        num_devices: int = DEFAULT_DEVICES_PER_INCIDENT,
        observations_per_device: int = DEFAULT_OBSERVATIONS_PER_DEVICE,
        sampling_interval_seconds: int = DEFAULT_SAMPLING_INTERVAL_SECONDS,
    ) -> List[Dict[str, Any]]:
        """
        Generate all timestamped observations for a single simulated incident.

        Returns:
            List of raw observation dictionaries sorted chronologically.
        """
        if base_timestamp is None:
            base_timestamp = datetime.now(timezone.utc)
        elif base_timestamp.tzinfo is None:
            base_timestamp = base_timestamp.replace(tzinfo=timezone.utc)

        # Select relevant network segment based on scenario
        if scenario_label == "weak_wifi":
            primary_segment = "HOSTEL_WIFI"
        elif scenario_label == "dns_dhcp_failure":
            primary_segment = "SERVER_NETWORK"
        elif scenario_label in ["hardware_failure", "congestion"]:
            primary_segment = self.rng.choice(["CAMPUS_CORE", "DEPARTMENT_ETHERNET"])
        else:
            primary_segment = self.rng.choice(CAMPUS_NETWORK_SEGMENTS)

        available_devices = CAMPUS_TOPOLOGY.get(primary_segment, CAMPUS_TOPOLOGY["CAMPUS_CORE"])
        chosen_devices = self.rng.sample(available_devices, min(num_devices, len(available_devices)))

        records: List[Dict[str, Any]] = []

        # Chronological generation
        for step in range(observations_per_device):
            current_time = base_timestamp + timedelta(seconds=step * sampling_interval_seconds)
            progress_ratio = step / max(1, observations_per_device - 1)

            for dev in chosen_devices:
                # Primary faulted device exhibits scenario fault; secondary devices may exhibit collateral or normal state
                is_primary_faulted = (dev == chosen_devices[0])
                current_scenario = scenario_label if is_primary_faulted else (
                    "normal" if self.rng.random() > 0.4 else scenario_label
                )

                metric_result = self.scenario_gen.generate_scenario_metrics(
                    scenario_label=current_scenario,
                    device_type=dev["device_type"],
                    progress_ratio=progress_ratio,
                )

                record: Dict[str, Any] = {
                    "incident_id": incident_id,
                    "scenario_id": f"SCN-{scenario_label.upper()}",
                    "scenario_label": scenario_label,
                    "device_id": dev["device_id"],
                    "device_type": dev["device_type"],
                    "hostname": dev["hostname"],
                    "network_segment": primary_segment,
                    "timestamp": current_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "source_generator": "netcoop_incident_engine_v1",
                    "synthetic_data": True,
                    "status": metric_result["status"],
                    "metrics": metric_result["metrics"],
                }
                records.append(record)

        # Ensure strict chronological sorting
        records.sort(key=lambda r: (r["timestamp"], r["device_id"]))
        return records

    def generate_dataset_incidents(
        self,
        incidents_per_scenario: int,
        scenarios: Optional[List[str]] = None,
        base_timestamp: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate multiple independent incidents across all designated scenarios.
        """
        if scenarios is None:
            scenarios = CLEAN_SCENARIOS

        if base_timestamp is None:
            base_timestamp = datetime(2026, 11, 1, 8, 0, 0, tzinfo=timezone.utc)

        all_records: List[Dict[str, Any]] = []
        incident_counter = 1

        for scenario in scenarios:
            for i in range(incidents_per_scenario):
                inc_id = f"INC-{scenario[:4].upper()}-{incident_counter:04d}"
                incident_start = base_timestamp + timedelta(minutes=incident_counter * 30)

                inc_records = self.generate_incident(
                    incident_id=inc_id,
                    scenario_label=scenario,
                    base_timestamp=incident_start,
                )
                all_records.extend(inc_records)
                incident_counter += 1

        # Final sort by incident_id, timestamp, device_id
        all_records.sort(key=lambda r: (r["incident_id"], r["timestamp"], r["device_id"]))
        return all_records
