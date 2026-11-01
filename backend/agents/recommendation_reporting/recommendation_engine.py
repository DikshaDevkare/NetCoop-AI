"""
Actionable recommendation engine for network fault remediation.
"""

from typing import Any, Dict, List


class RecommendationEngine:
    """
    Generates tailored, evidence-backed corrective action plans based on correlated findings.
    """

    @classmethod
    def generate_recommendations(
        cls,
        primary_hypothesis: str,
        affected_devices: List[str],
        affected_segments: List[str],
        evidence_items: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Derives specific engineering action steps mapped directly to diagnostic evidence.
        """
        hypo = primary_hypothesis.lower()
        dev_str = ", ".join(affected_devices) if affected_devices else "affected devices"
        recs: List[Dict[str, Any]] = []

        if "normal" in hypo or not affected_devices:
            recs.append({
                "action": "Maintain Routine Network Telemetry Monitoring",
                "priority": "Low",
                "target_devices": affected_devices or ["All"],
                "rationale": "Telemetry metrics are operating within acceptable baseline bounds.",
                "step_order": 1,
            })
            return recs

        if "congestion" in hypo or "buffer" in hypo:
            recs.extend([
                {
                    "action": "Inspect Uplink Capacity and Top Bandwidth Consumers",
                    "priority": "Immediate",
                    "target_devices": affected_devices,
                    "rationale": f"Uplink bandwidth saturation and buffer drops detected on {dev_str}.",
                    "step_order": 1,
                },
                {
                    "action": "Audit and Tune Interface Queue Depth / QoS Policies",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": "Adjust Weighted Random Early Detection (WRED) or queue buffer allocations.",
                    "step_order": 2,
                },
                {
                    "action": "Evaluate Traffic Shaping or Path Re-routing via Secondary Trunk",
                    "priority": "Medium",
                    "target_devices": affected_devices,
                    "rationale": "Divert non-critical bulk flows to alleviate core bottleneck.",
                    "step_order": 3,
                },
            ])

        elif "hardware" in hypo or "cpu" in hypo:
            recs.extend([
                {
                    "action": "Inspect Device Process Tree and CPU Interrupt Handlers",
                    "priority": "Immediate",
                    "target_devices": affected_devices,
                    "rationale": f"Sustained CPU peg (>95%) observed on {dev_str}.",
                    "step_order": 1,
                },
                {
                    "action": "Check Device Temperature, Fan Trays, and Thermal Status",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": "Verify chassis cooling to prevent hardware thermal shutdown.",
                    "step_order": 2,
                },
                {
                    "action": "Prepare Standby Redundant Supervisor / Plan Controlled Failover",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": "Mitigate risk of complete control plane freeze.",
                    "step_order": 3,
                },
            ])

        elif "interface" in hypo or "cabling" in hypo or "transceiver" in hypo:
            recs.extend([
                {
                    "action": "Inspect Physical Patch Cable and Optical Connectors",
                    "priority": "Immediate",
                    "target_devices": affected_devices,
                    "rationale": f"High CRC / FCS interface error counts detected on {dev_str}.",
                    "step_order": 1,
                },
                {
                    "action": "Verify SFP Transceiver Optical TX/RX Power Levels via DDM",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": "Rule out optic degradation or dirty fiber ferrule.",
                    "step_order": 2,
                },
                {
                    "action": "Verify Switch Port Speed and Duplex Auto-negotiation",
                    "priority": "Medium",
                    "target_devices": affected_devices,
                    "rationale": "Ensure no duplex mismatch between connected peer interfaces.",
                    "step_order": 3,
                },
            ])

        elif "dns" in hypo or "dhcp" in hypo:
            recs.extend([
                {
                    "action": "Verify Core DNS Resolver Health and Query Response Time",
                    "priority": "Immediate",
                    "target_devices": affected_devices,
                    "rationale": f"DNS resolution timeout / latency observed by clients in {', '.join(affected_segments)}.",
                    "step_order": 1,
                },
                {
                    "action": "Inspect DHCP Scope Lease Pool Utilization",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": "Ensure client IP allocation pools have available capacity.",
                    "step_order": 2,
                },
                {
                    "action": "Verify Secondary DNS Forwarder and Upstream Peering Reachability",
                    "priority": "Medium",
                    "target_devices": affected_devices,
                    "rationale": "Confirm recursive query path to root and authoritative nameservers.",
                    "step_order": 3,
                },
            ])

        elif "wireless" in hypo or "wifi" in hypo or "attenuation" in hypo:
            recs.extend([
                {
                    "action": "Conduct RF Spectrum Analysis and Check 2.4/5GHz Channel Utilization",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": f"Severe Wi-Fi signal attenuation (RSSI <= -75 dBm) on {dev_str}.",
                    "step_order": 1,
                },
                {
                    "action": "Verify Access Point Transmit Power and Antenna Alignment",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": "Ensure adequate radio coverage without co-channel interference overlap.",
                    "step_order": 2,
                },
                {
                    "action": "Evaluate Additional AP Placement in Weak Coverage Zone",
                    "priority": "Medium",
                    "target_devices": affected_devices,
                    "rationale": "Eliminate RF dead spots caused by physical structural walls.",
                    "step_order": 3,
                },
            ])

        elif "latency" in hypo:
            recs.extend([
                {
                    "action": "Perform Hop-by-Hop Traceroute / MTR to Identify Delay Ingress",
                    "priority": "Immediate",
                    "target_devices": affected_devices,
                    "rationale": f"High latency (>200 ms) observed on {dev_str} without local drops.",
                    "step_order": 1,
                },
                {
                    "action": "Review BGP / OSPF Routing Tables for Suboptimal Path Selection",
                    "priority": "High",
                    "target_devices": affected_devices,
                    "rationale": "Identify upstream routing loops or asymmetric detour paths.",
                    "step_order": 2,
                },
            ])

        else:
            recs.append({
                "action": "Perform In-depth Diagnostic Trace on Impacted Nodes",
                "priority": "High",
                "target_devices": affected_devices,
                "rationale": f"Investigate multi-metric telemetry degradation on {dev_str}.",
                "step_order": 1,
            })

        # Attach supporting evidence IDs and operational advisory metadata
        evd_ids = [str(e.get("evidence_id")) for e in evidence_items if e.get("evidence_id")]
        for r in recs:
            if "supporting_evidence_ids" not in r:
                r["supporting_evidence_ids"] = evd_ids[:3]
            if "automated" not in r:
                r["automated"] = False

        return recs
