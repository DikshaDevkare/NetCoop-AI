"""
Telemetry & Performance Agent for NetCoop AI.
"""

from typing import Any, Dict, List, Optional
import pandas as pd

from app.schemas.enums import AgentId, MessageType
from app.schemas.messages import AgentMessage
from agents.base import BaseAgent
from agents.telemetry_performance.analyzer import TelemetryPerformanceAnalyzer


class TelemetryPerformanceAgent(BaseAgent):
    """
    Specialized agent monitoring latency, packet loss, jitter, throughput,
    bandwidth utilization, queue drops, and retransmissions.
    """

    def __init__(self) -> None:
        super().__init__(
            agent_id=AgentId.TELEMETRY_PERFORMANCE,
            name="Telemetry & Performance Agent",
            description="Analyzes traffic performance, buffer dynamics, and throughput bottlenecks.",
        )
        self.analyzer = TelemetryPerformanceAnalyzer()

    def analyze(
        self,
        telemetry: pd.DataFrame,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[AgentMessage]:
        ctx = context or {}
        incident_id = str(ctx.get("incident_id") or "INC-UNKNOWN")
        receiver = ctx.get("receiver", AgentId.FAULT_CORRELATION)

        analysis = self.analyzer.analyze(telemetry, context=ctx)
        messages: List[AgentMessage] = []

        # 1. Generate Evidence messages for empirical anomalies
        evidence_ids: List[str] = []
        for anom in analysis["anomalies"][:10]:  # Cap to avoid message flooding
            evd = self.create_evidence(
                incident_id=incident_id,
                evidence_type=anom["type"],
                description=anom["description"],
                device_id=anom.get("device_id"),
                metadata={"metric": anom["metric"], "observed": anom["observed"], "expected": anom["expected"]},
            )
            evidence_ids.append(evd.evidence_id)
            messages.append(
                self.create_message(
                    receiver=receiver,
                    message_type=MessageType.EVIDENCE,
                    correlation_id=incident_id,
                    payload=evd,
                )
            )

        # 2. Generate DiagnosticFinding messages
        for fnd_data in analysis["findings"]:
            fnd = self.create_finding(
                incident_id=incident_id,
                title=fnd_data["title"],
                description=fnd_data["description"],
                severity=fnd_data["severity"],
                confidence=fnd_data["confidence"],
                affected_devices=fnd_data["affected_devices"],
                suspected_cause=fnd_data["suspected_cause"],
                supporting_evidence_ids=evidence_ids,
                alternative_causes=fnd_data["alternative_causes"],
            )
            messages.append(
                self.create_message(
                    receiver=receiver,
                    message_type=MessageType.DIAGNOSTIC_FINDING,
                    correlation_id=incident_id,
                    payload=fnd,
                )
            )

        return messages
