"""
Fault Correlation Agent for NetCoop AI.
"""

from typing import Any, Dict, List, Optional
import pandas as pd

from app.schemas.enums import AgentId, MessageType
from app.schemas.messages import AgentMessage
from agents.base import BaseAgent
from agents.fault_correlation.correlation_engine import CorrelationEngine


class FaultCorrelationAgent(BaseAgent):
    """
    Synthesizes findings across all domain agents, network topology,
    and ML classifiers into correlated diagnostic hypotheses.
    """

    def __init__(self) -> None:
        super().__init__(
            agent_id=AgentId.FAULT_CORRELATION,
            name="Fault Correlation Agent",
            description="Correlates multi-device evidence, resolves conflicts, and deduces root-cause hypotheses.",
        )
        self.engine = CorrelationEngine()

    def analyze(
        self,
        telemetry: pd.DataFrame,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[AgentMessage]:
        ctx = context or {}
        incident_id = str(ctx.get("incident_id") or "INC-UNKNOWN")
        agent_messages = ctx.get("agent_messages", [])
        ml_prediction = ctx.get("ml_prediction")
        temporal_analysis = ctx.get("temporal_analysis")
        receiver = ctx.get("receiver", AgentId.RECOMMENDATION_REPORTING)

        correlation = self.engine.correlate(
            agent_messages=agent_messages,
            ml_prediction=ml_prediction,
            temporal_analysis=temporal_analysis,
            incident_id=incident_id,
        )

        fnd = self.create_finding(
            incident_id=incident_id,
            title=f"Correlated Diagnosis: {correlation['primary_hypothesis']}",
            description=correlation["correlation_explanation"],
            severity=correlation["severity"],
            confidence=correlation["confidence"],
            affected_devices=correlation["affected_devices"],
            suspected_cause=correlation["primary_hypothesis"],
            supporting_evidence_ids=[e.get("evidence_id", "") for e in correlation["supporting_evidence"] if e.get("evidence_id")],
            alternative_causes=correlation["alternative_hypotheses"],
            limitations=correlation["uncertainty_notes"],
            metadata={
                "affected_segments": correlation["affected_segments"],
                "conflicts_count": len(correlation["conflicting_evidence"]),
            },
        )

        msg = self.create_message(
            receiver=receiver,
            message_type=MessageType.DIAGNOSTIC_FINDING,
            correlation_id=incident_id,
            payload=fnd,
        )

        return [msg]
