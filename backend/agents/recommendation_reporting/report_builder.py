"""
Unified diagnostic report builder for NetCoop AI.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class DiagnosticReportBuilder:
    """
    Assembles the final, unified diagnostic report with evidence traceability,
    confidence ratings, recommendations, and explicit uncertainty boundaries.
    """

    @classmethod
    def build_report(
        cls,
        incident_id: str,
        correlation_result: Dict[str, Any],
        recommendations: List[Dict[str, Any]],
        ml_prediction: Optional[Dict[str, Any]] = None,
        anomaly_detection: Optional[Dict[str, Any]] = None,
        temporal_analysis: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Builds the canonical end-to-end diagnostic report.
        """
        now_utc = datetime.now(timezone.utc).isoformat()
        primary_hypo = correlation_result.get("primary_hypothesis", "Unknown Condition")
        affected_devices = correlation_result.get("affected_devices", [])
        affected_segments = correlation_result.get("affected_segments", [])
        severity = correlation_result.get("severity", "medium")
        confidence = correlation_result.get("confidence", "medium")

        # Determine overall incident status
        is_normal = "normal" in primary_hypo.lower() or not affected_devices
        sev_str = str(severity).lower().replace("severity.", "")
        status = "HEALTHY" if is_normal else ("CRITICAL" if "critical" in sev_str else "DEGRADED")

        # Collect evidence list with formatting
        evidence_list = []
        for evd in correlation_result.get("supporting_evidence", []):
            evidence_list.append({
                "evidence_id": evd.get("evidence_id"),
                "source_agent": evd.get("source_agent"),
                "evidence_type": evd.get("evidence_type"),
                "device_id": evd.get("device_id"),
                "description": evd.get("description"),
                "observed_at": evd.get("observed_at", now_utc),
                "metadata": evd.get("metadata", {}),
            })

        # Uncertainty and limitations section
        uncertainty_notes = list(correlation_result.get("uncertainty_notes", []))
        if confidence == "low" or str(confidence).lower() == "confidencelevel.low":
            uncertainty_notes.append("Confidence is low due to limited or sparse telemetry samples.")
        uncertainty_notes.append(
            "This diagnosis represents an evidence-weighted hypothesis based on current telemetry; "
            "it is not guaranteed to be 100% conclusive without on-site physical/packet verification."
        )

        return {
            "incident_summary": {
                "incident_id": incident_id,
                "timestamp": now_utc,
                "overall_status": status,
                "severity": str(severity).lower().replace("severity.", ""),
                "affected_devices": affected_devices,
                "affected_device_count": len(affected_devices),
                "affected_network_segments": affected_segments,
            },
            "probable_root_cause": {
                "primary_hypothesis": primary_hypo,
                "confidence": str(confidence).lower().replace("confidencelevel.", ""),
                "alternative_hypotheses": correlation_result.get("alternative_hypotheses", []),
                "explanation": correlation_result.get("correlation_explanation", ""),
            },
            "machine_learning_signals": {
                "anomaly_detection": anomaly_detection or {},
                "fault_classification": ml_prediction or {},
                "temporal_trajectory": temporal_analysis or {},
            },
            "evidence_trail": evidence_list,
            "agent_findings": correlation_result.get("agent_findings_summary", []),
            "recommended_corrective_actions": recommendations,
            "uncertainty_and_limitations": {
                "confidence_assessment": str(confidence).lower().replace("confidencelevel.", ""),
                "limitations": uncertainty_notes,
                "conflicting_evidence": correlation_result.get("conflicting_evidence", []),
            },
        }
