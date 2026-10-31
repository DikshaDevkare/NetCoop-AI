"""
Recommendation & Reporting Agent for NetCoop AI.
"""

from typing import Any, Dict, List, Optional
import pandas as pd

from app.schemas.enums import AgentId, MessageType
from app.schemas.messages import AgentMessage
from agents.base import BaseAgent
from agents.recommendation_reporting.recommendation_engine import RecommendationEngine
from agents.recommendation_reporting.report_builder import DiagnosticReportBuilder


class RecommendationReportingAgent(BaseAgent):
    """
    Synthesizes the final unified diagnostic report, evidence trail,
    remediation recommendations, and uncertainty boundaries.
    """

    def __init__(self) -> None:
        super().__init__(
            agent_id=AgentId.RECOMMENDATION_REPORTING,
            name="Recommendation & Reporting Agent",
            description="Compiles actionable remediation plans and unified diagnostic reports.",
        )
        self.rec_engine = RecommendationEngine()
        self.report_builder = DiagnosticReportBuilder()

    def analyze(
        self,
        telemetry: pd.DataFrame,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[AgentMessage]:
        ctx = context or {}
        incident_id = str(ctx.get("incident_id") or "INC-UNKNOWN")
        correlation_result = ctx.get("correlation_result", {})
        ml_prediction = ctx.get("ml_prediction")
        anomaly_detection = ctx.get("anomaly_detection")
        temporal_analysis = ctx.get("temporal_analysis")
        receiver = ctx.get("receiver", AgentId.ORCHESTRATOR)

        recs = self.rec_engine.generate_recommendations(
            primary_hypothesis=correlation_result.get("primary_hypothesis", "Normal"),
            affected_devices=correlation_result.get("affected_devices", []),
            affected_segments=correlation_result.get("affected_segments", []),
            evidence_items=correlation_result.get("supporting_evidence", []),
        )

        report = self.report_builder.build_report(
            incident_id=incident_id,
            correlation_result=correlation_result,
            recommendations=recs,
            ml_prediction=ml_prediction,
            anomaly_detection=anomaly_detection,
            temporal_analysis=temporal_analysis,
        )

        fnd = self.create_finding(
            incident_id=incident_id,
            title=f"Final Diagnostic Report: {report['probable_root_cause']['primary_hypothesis']}",
            description=report["probable_root_cause"]["explanation"],
            severity=correlation_result.get("severity", "medium"),
            confidence=correlation_result.get("confidence", "medium"),
            affected_devices=report["incident_summary"]["affected_devices"],
            suspected_cause=report["probable_root_cause"]["primary_hypothesis"],
            supporting_evidence_ids=[e.get("evidence_id", "") for e in report["evidence_trail"] if e.get("evidence_id")],
            alternative_causes=report["probable_root_cause"]["alternative_hypotheses"],
            limitations=report["uncertainty_and_limitations"]["limitations"],
            metadata={"report_payload": report},
        )

        msg = self.create_message(
            receiver=receiver,
            message_type=MessageType.DIAGNOSTIC_FINDING,
            correlation_id=incident_id,
            payload=fnd,
        )

        return [msg]
