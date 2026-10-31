"""
Connectivity Analysis Agent for NetCoop AI.
"""

from typing import Any, Dict, List, Optional
import pandas as pd

from app.schemas.enums import AgentId, MessageType
from app.schemas.messages import AgentMessage
from agents.base import BaseAgent
from agents.connectivity.analyzer import ConnectivityAnalyzer


class ConnectivityAnalysisAgent(BaseAgent):
    """
    Analyzes DNS resolution, DHCP status, gateway reachability, and wireless signal strength.
    """

    def __init__(self) -> None:
        super().__init__(
            agent_id=AgentId.CONNECTIVITY_ANALYSIS,
            name="Connectivity Analysis Agent",
            description="Evaluates DNS/DHCP reachability, gateway paths, and Wi-Fi signal propagation.",
        )
        self.analyzer = ConnectivityAnalyzer()

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

        evidence_ids: List[str] = []
        for anom in analysis["anomalies"][:10]:
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
