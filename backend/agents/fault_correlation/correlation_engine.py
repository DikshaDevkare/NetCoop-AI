"""
Multi-device and multi-agent fault correlation engine.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
from app.schemas.enums import ConfidenceLevel, Severity
from agents.fault_correlation.conflict_resolver import ConflictResolver


class CorrelationEngine:
    """
    Correlates evidence and findings across specialized agents, network topology,
    and machine learning predictions to formulate evidence-based hypotheses.
    """

    @classmethod
    def infer_network_segment(cls, device_id: str, device_type: Optional[str] = None) -> str:
        """
        Maps device identifier or role to a campus network segment.
        """
        did = device_id.upper()
        dtype = (device_type or "").upper()

        if "CORE" in did or "RTR" in did or "ROUTER" in dtype:
            return "Core Routing Tier"
        if "DIST" in did or "AGG" in did:
            return "Distribution Aggregation Tier"
        if "ACC" in did or "EDGE" in did or "SW" in did:
            return "Building Access Switch Tier"
        if "AP" in did or "WIFI" in did or "WIRELESS" in dtype:
            return "Campus Wireless AP Tier"
        return "General Campus Segment"

    def correlate(
        self,
        agent_messages: List[Any],
        ml_prediction: Optional[Dict[str, Any]] = None,
        temporal_analysis: Optional[Dict[str, Any]] = None,
        incident_id: str = "INC-UNKNOWN",
    ) -> Dict[str, Any]:
        """
        Synthesizes a unified correlated diagnosis from raw agent messages and ML signals.
        """
        findings: List[Dict[str, Any]] = []
        evidence_items: List[Dict[str, Any]] = []
        affected_devices: Set[str] = set()

        # 1. Unpack messages from domain agents
        for msg in agent_messages:
            payload = getattr(msg, "payload", msg)
            p_dict = payload.model_dump() if hasattr(payload, "model_dump") else (payload if isinstance(payload, dict) else {})
            m_type = getattr(msg, "message_type", None) or p_dict.get("message_type")

            if hasattr(payload, "evidence_id") or "evidence_id" in p_dict:
                evidence_items.append(p_dict)
                if p_dict.get("device_id"):
                    affected_devices.add(p_dict["device_id"])
            elif hasattr(payload, "finding_id") or "finding_id" in p_dict:
                findings.append(p_dict)
                for did in p_dict.get("affected_devices", []):
                    affected_devices.add(did)

        # 2. Map affected devices to network segments
        affected_segments = sorted(list(set(self.infer_network_segment(did) for did in affected_devices)))

        # 3. Resolve conflicts
        conflict_res = ConflictResolver.resolve_conflicts(
            findings=findings,
            evidence_items=evidence_items,
            ml_prediction=ml_prediction,
        )

        # 4. Formulate primary and alternative hypotheses
        primary_hypo, alt_hypos, explanation, severity = self._synthesize_hypotheses(
            findings=findings,
            evidence_items=evidence_items,
            ml_prediction=ml_prediction,
            temporal_analysis=temporal_analysis,
            affected_devices=affected_devices,
            affected_segments=affected_segments,
        )

        confidence = conflict_res["adjusted_confidence"]
        uncertainty_notes: List[str] = []

        if conflict_res["has_conflict"]:
            uncertainty_notes.append("Multiple competing agent hypotheses observed; confidence downgraded.")
        if len(affected_devices) <= 1 and primary_hypo != "Normal Operational State":
            uncertainty_notes.append("Condition isolated to a single device; potential device-local anomaly.")
        if not evidence_items:
            uncertainty_notes.append("No empirical threshold breaches detected; telemetry conforms to normal bounds.")

        return {
            "incident_id": incident_id,
            "primary_hypothesis": primary_hypo,
            "alternative_hypotheses": alt_hypos,
            "correlation_explanation": explanation,
            "severity": severity,
            "confidence": confidence,
            "affected_devices": sorted(list(affected_devices)),
            "affected_segments": affected_segments,
            "supporting_evidence": evidence_items,
            "conflicting_evidence": conflict_res["conflicts"],
            "uncertainty_notes": uncertainty_notes,
            "agent_findings_summary": findings,
        }

    def _synthesize_hypotheses(
        self,
        findings: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
        ml_prediction: Optional[Dict[str, Any]],
        temporal_analysis: Optional[Dict[str, Any]],
        affected_devices: Set[str],
        affected_segments: List[str],
    ) -> Tuple[str, List[str], str, Severity]:
        """
        Synthesizes primary and alternative root-cause hypotheses with explainability.
        """
        ml_fault = (ml_prediction or {}).get("predicted_fault", "normal")
        evd_types = [e.get("evidence_type", "") for e in evidence_items]

        # Scenario 1: Normal operational state
        if not findings and not evidence_items and ml_fault == "normal":
            return (
                "Normal Operational State",
                ["Transient minor metric jitter"],
                "All telemetry metrics remain within acceptable baseline operating limits across all monitored devices.",
                Severity.INFORMATIONAL,
            )

        # Scenario 2: Hardware failure / CPU Peg
        if "cpu_lockup_overload" in evd_types:
            return (
                "Device Hardware Failure or Control Plane CPU Lockup",
                ["BGP/Routing protocol storm", "Firmware kernel panic"],
                f"Severe CPU lockup (>95%) isolated to {', '.join(sorted(list(affected_devices)))} in {', '.join(affected_segments)}.",
                Severity.CRITICAL,
            )

        # Scenario 3: Physical interface / cable fault
        if "physical_interface_errors_high" in evd_types or ml_fault == "interface_fault":
            return (
                "Physical Interface or Layer-1 Cabling Fault",
                ["Optical SFP transceiver degradation", "Duplex negotiation mismatch"],
                f"High CRC interface error counters observed on {', '.join(sorted(list(affected_devices)))}.",
                Severity.HIGH,
            )

        # Scenario 4: Core congestion / buffer saturation
        if "buffer_overflow_queue_drops" in evd_types or "link_bandwidth_saturation" in evd_types or ml_fault == "congestion":
            return (
                "Network Uplink Congestion & Queue Buffer Saturation",
                ["Upstream transit provider throttling", "Microburst traffic surge exceeding queue depth"],
                f"Simultaneous link saturation and buffer queue overflow affecting {len(affected_devices)} devices across {', '.join(affected_segments)}.",
                Severity.HIGH,
            )

        # Scenario 5: DNS / DHCP service failure
        if "dns_resolution_timeout" in evd_types or ml_fault == "dns_dhcp_failure":
            return (
                "Core DNS Resolution Service Failure",
                ["DHCP lease pool exhaustion", "Campus recursive DNS cache poisoning/dos"],
                f"Severe DNS lookup timeouts observed impacting device connectivity in {', '.join(affected_segments)}.",
                Severity.HIGH,
            )

        # Scenario 6: Weak Wi-Fi RF attenuation
        if "critical_weak_wifi_signal" in evd_types or "degraded_wifi_signal" in evd_types or ml_fault == "weak_wifi":
            return (
                "Wireless RF Path Loss / Severe Wi-Fi Signal Attenuation",
                ["Access point co-channel interference", "AP radio power misconfiguration"],
                f"Severe wireless attenuation (RSSI <= -75 dBm) observed on {', '.join(sorted(list(affected_devices)))}.",
                Severity.MEDIUM,
            )

        # Scenario 7: Latency spike / transit degradation
        if "critical_latency_spike" in evd_types or ml_fault == "latency_spike":
            return (
                "Transit Latency Degradation / Upstream Peering Path Delay",
                ["Intermediate routing loop / asymmetric routing", "Core router queuing delay"],
                f"Elevated round-trip latency detected across {', '.join(sorted(list(affected_devices)))} without local queue drops.",
                Severity.MEDIUM,
            )

        # Default fallback synthesis
        first_cause = findings[0].get("suspected_cause") if findings else "Unclassified Telemetry Anomaly"
        return (
            str(first_cause),
            ["Multi-factor intermittent network degradation", "Device resource pressure"],
            f"Anomalous telemetry patterns detected across {len(affected_devices)} devices.",
            Severity.MEDIUM,
        )
