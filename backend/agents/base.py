"""
Base agent architecture for NetCoop AI multi-agent fault diagnosis system.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
import uuid
import pandas as pd

from app.schemas.common import PROTOCOL_VERSION
from app.schemas.enums import AgentId, ConfidenceLevel, MessageType, Severity
from app.schemas.evidence import Evidence, Observation
from app.schemas.findings import DiagnosticFinding
from app.schemas.messages import AgentMessage


class BaseAgent(ABC):
    """
    Abstract base class for all specialized diagnostic agents in NetCoop AI.
    Enforces standardized protocol envelopes, evidence generation, and structured outputs.
    """

    def __init__(self, agent_id: AgentId, name: str, description: str) -> None:
        self.agent_id = agent_id
        self.name = name
        self.description = description

    @abstractmethod
    def analyze(
        self,
        telemetry: pd.DataFrame,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[AgentMessage]:
        """
        Executes domain-specific analysis on telemetry records.

        Args:
            telemetry: Telemetry records as a pandas DataFrame.
            context: Optional diagnostic context (e.g. incident_id, ML predictions, temporal trends).

        Returns:
            List of AgentMessage envelopes containing domain findings, observations, or evidence.
        """
        pass

    def create_message(
        self,
        receiver: AgentId,
        message_type: MessageType,
        correlation_id: str,
        payload: Any,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AgentMessage:
        """
        Constructs a protocol-compliant AgentMessage envelope.
        """
        return AgentMessage(
            message_id=f"MSG-{uuid.uuid4().hex[:8].upper()}",
            protocol_version=PROTOCOL_VERSION,
            sender=self.agent_id,
            receiver=receiver,
            message_type=message_type,
            timestamp=datetime.now(timezone.utc),
            correlation_id=correlation_id,
            payload=payload,
            metadata=metadata,
        )

    def create_observation(
        self,
        incident_id: str,
        device_id: str,
        observation_type: str,
        description: str,
        related_telemetry_ids: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Observation:
        """
        Constructs a standard Observation artifact.
        """
        return Observation(
            observation_id=f"OBS-{uuid.uuid4().hex[:8].upper()}",
            incident_id=incident_id,
            device_id=device_id,
            source_agent=self.agent_id,
            observation_type=observation_type,
            description=description,
            observed_at=datetime.now(timezone.utc),
            related_telemetry_ids=related_telemetry_ids or [],
            metadata=metadata,
        )

    def create_evidence(
        self,
        incident_id: str,
        evidence_type: str,
        description: str,
        device_id: Optional[str] = None,
        telemetry_ids: Optional[List[str]] = None,
        supports_hypothesis: Optional[bool] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Evidence:
        """
        Constructs a standard Evidence artifact.
        """
        return Evidence(
            evidence_id=f"EVD-{uuid.uuid4().hex[:8].upper()}",
            incident_id=incident_id,
            source_agent=self.agent_id,
            evidence_type=evidence_type,
            description=description,
            device_id=device_id,
            telemetry_ids=telemetry_ids or [],
            observed_at=datetime.now(timezone.utc),
            supports_hypothesis=supports_hypothesis,
            metadata=metadata,
        )

    def create_finding(
        self,
        incident_id: str,
        title: str,
        description: str,
        severity: Severity,
        confidence: ConfidenceLevel,
        affected_devices: Optional[List[str]] = None,
        suspected_cause: Optional[str] = None,
        supporting_evidence_ids: Optional[List[str]] = None,
        alternative_causes: Optional[List[str]] = None,
        limitations: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> DiagnosticFinding:
        """
        Constructs a standard DiagnosticFinding artifact.
        """
        return DiagnosticFinding(
            finding_id=f"FND-{uuid.uuid4().hex[:8].upper()}",
            incident_id=incident_id,
            source_agent=self.agent_id,
            title=title,
            description=description,
            suspected_cause=suspected_cause,
            severity=severity,
            confidence=confidence,
            affected_devices=affected_devices or [],
            supporting_evidence_ids=supporting_evidence_ids or [],
            alternative_causes=alternative_causes or [],
            limitations=limitations or [],
            timestamp=datetime.now(timezone.utc),
            metadata=metadata,
        )
