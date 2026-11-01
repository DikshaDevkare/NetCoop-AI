"""
Central Multi-Agent Diagnostic Orchestrator for NetCoop AI.
Coordinates ingestion, feature engineering, ML models, domain diagnostic agents,
fault correlation, and actionable remediation reporting.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
import uuid
import numpy as np
import pandas as pd

from app.core.logging_config import get_logger
from app.schemas.enums import AgentId, ConfidenceLevel, MessageType, Severity
from app.schemas.messages import AgentMessage
from app.services.ingestion.feature_engineering import TelemetryFeatureEngineer
from app.services.ingestion.normalizer import TelemetryNormalizer
from app.services.orchestration.model_service import ModelService
from agents.connectivity.agent import ConnectivityAnalysisAgent
from agents.fault_correlation.agent import FaultCorrelationAgent
from agents.infrastructure_health.agent import InfrastructureHealthAgent
from agents.recommendation_reporting.agent import RecommendationReportingAgent
from agents.telemetry_performance.agent import TelemetryPerformanceAgent

logger = get_logger("netcoop.orchestration.orchestrator")


class MultiAgentOrchestrator:
    """
    Coordinates the complete multi-agent network fault diagnostic pipeline:
    Telemetry -> ML Signals -> Domain Agents -> Correlation -> Unified Report.
    """

    def __init__(self, model_service: Optional[ModelService] = None) -> None:
        self.model_service = model_service or ModelService.get_instance()

        # Instantiate all 5 specialized agents
        self.telemetry_agent = TelemetryPerformanceAgent()
        self.infrastructure_agent = InfrastructureHealthAgent()
        self.connectivity_agent = ConnectivityAnalysisAgent()
        self.correlation_agent = FaultCorrelationAgent()
        self.reporting_agent = RecommendationReportingAgent()

        self._agents_registry = {
            AgentId.TELEMETRY_PERFORMANCE: self.telemetry_agent,
            AgentId.INFRASTRUCTURE_HEALTH: self.infrastructure_agent,
            AgentId.CONNECTIVITY_ANALYSIS: self.connectivity_agent,
            AgentId.FAULT_CORRELATION: self.correlation_agent,
            AgentId.RECOMMENDATION_REPORTING: self.reporting_agent,
        }

    def diagnose(
        self,
        telemetry: Union[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]],
        incident_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end multi-agent network fault diagnosis.

        Args:
            telemetry: Telemetry records as DataFrame, list of dicts, or single dict.
            incident_id: Optional incident correlation ID. Generated if omitted.
            context: Optional diagnostic context or user parameters.
            db: Optional SQLAlchemy Session for persisting diagnosis and telemetry.

        Returns:
            Unified diagnostic report conforming to NetCoop AI interoperability protocol.
        """
        inc_id = incident_id or f"INC-{uuid.uuid4().hex[:8].upper()}"
        diag_id = f"DIAG-{uuid.uuid4().hex[:8].upper()}"
        start_time = datetime.now(timezone.utc)
        logger.info("Initiating multi-agent diagnosis for incident %s", inc_id)

        # -------------------------------------------------------------
        # STEP 1: Preprocess & Prepare Telemetry DataFrame
        # -------------------------------------------------------------
        df = self._prepare_telemetry_dataframe(telemetry, inc_id)
        if df.empty:
            logger.warning("Empty telemetry provided for incident %s", inc_id)
            return self._build_empty_response(inc_id)

        # -------------------------------------------------------------
        # STEP 2: Execute ML Models (Anomaly, Classifier, Temporal)
        # -------------------------------------------------------------
        anomaly_result = self.model_service.run_anomaly_detection(df)
        classifier_result = self.model_service.run_fault_classification(df)
        temporal_result = self.model_service.run_temporal_analysis(df)

        logger.info(
            "Incident %s ML signals: Anomaly=%s, Classifier=%s (conf=%.2f), Temporal=%s",
            inc_id,
            anomaly_result.get("is_anomalous", False),
            classifier_result.get("predicted_fault", "unknown"),
            classifier_result.get("confidence", 0.0),
            temporal_result.get("overall_trend", "unknown"),
        )

        # -------------------------------------------------------------
        # STEP 3: Shared Diagnostic Context
        # -------------------------------------------------------------
        shared_context = {
            "incident_id": inc_id,
            "receiver": AgentId.FAULT_CORRELATION,
            "anomaly_detection": anomaly_result,
            "ml_prediction": classifier_result,
            "temporal_analysis": temporal_result,
            "user_context": context or {},
        }

        # -------------------------------------------------------------
        # STEP 4: Execute Domain Agents (Telemetry, Infra, Connectivity)
        # -------------------------------------------------------------
        agent_execution_summary: Dict[str, Any] = {}
        domain_messages: List[AgentMessage] = []

        domain_agents = [
            (self.telemetry_agent, "telemetry_performance"),
            (self.infrastructure_agent, "infrastructure_health"),
            (self.connectivity_agent, "connectivity_analysis"),
        ]

        for agent, name in domain_agents:
            agent_start = datetime.now(timezone.utc)
            try:
                msgs = agent.analyze(df, context=shared_context)
                domain_messages.extend(msgs)
                agent_execution_summary[name] = {
                    "status": "success",
                    "messages_emitted": len(msgs),
                    "duration_ms": round((datetime.now(timezone.utc) - agent_start).total_seconds() * 1000, 2),
                }
            except Exception as exc:
                logger.error("Agent %s failed on incident %s: %s", name, inc_id, exc)
                agent_execution_summary[name] = {
                    "status": "failed",
                    "error": str(exc),
                    "messages_emitted": 0,
                    "duration_ms": round((datetime.now(timezone.utc) - agent_start).total_seconds() * 1000, 2),
                }

        # -------------------------------------------------------------
        # STEP 5: Execute Fault Correlation Agent
        # -------------------------------------------------------------
        corr_start = datetime.now(timezone.utc)
        correlation_context = {
            "incident_id": inc_id,
            "agent_messages": domain_messages,
            "ml_prediction": classifier_result,
            "anomaly_detection": anomaly_result,
            "temporal_analysis": temporal_result,
            "receiver": AgentId.RECOMMENDATION_REPORTING,
        }

        try:
            # We call the correlation engine to obtain the complete correlation structure
            correlation_result = self.correlation_agent.engine.correlate(
                agent_messages=domain_messages,
                ml_prediction=classifier_result,
                temporal_analysis=temporal_result,
                incident_id=inc_id,
            )
            # Emit correlation agent message
            corr_msgs = self.correlation_agent.analyze(df, context=correlation_context)
            agent_execution_summary["fault_correlation"] = {
                "status": "success",
                "messages_emitted": len(corr_msgs),
                "duration_ms": round((datetime.now(timezone.utc) - corr_start).total_seconds() * 1000, 2),
            }
        except Exception as exc:
            logger.error("Fault Correlation Agent failed on incident %s: %s", inc_id, exc)
            correlation_result = {
                "primary_hypothesis": "Inconclusive - Correlation Error",
                "alternative_hypotheses": ["Diagnostic engine exception"],
                "correlation_explanation": f"Correlation engine encountered error: {str(exc)}",
                "severity": Severity.MEDIUM,
                "confidence": ConfidenceLevel.LOW,
                "affected_devices": [],
                "affected_segments": [],
                "supporting_evidence": [],
                "conflicting_evidence": [],
                "uncertainty_notes": [f"Correlation failure: {str(exc)}"],
                "agent_findings_summary": [],
            }
            agent_execution_summary["fault_correlation"] = {
                "status": "failed",
                "error": str(exc),
                "messages_emitted": 0,
                "duration_ms": round((datetime.now(timezone.utc) - corr_start).total_seconds() * 1000, 2),
            }

        # -------------------------------------------------------------
        # STEP 6: Execute Recommendation & Reporting Agent
        # -------------------------------------------------------------
        rec_start = datetime.now(timezone.utc)
        reporting_context = {
            "incident_id": inc_id,
            "correlation_result": correlation_result,
            "ml_prediction": classifier_result,
            "anomaly_detection": anomaly_result,
            "temporal_analysis": temporal_result,
            "receiver": AgentId.ORCHESTRATOR,
        }

        try:
            rep_msgs = self.reporting_agent.analyze(df, context=reporting_context)
            # Extract final report payload
            if rep_msgs and rep_msgs[0].payload.metadata and "report_payload" in rep_msgs[0].payload.metadata:
                final_report = rep_msgs[0].payload.metadata["report_payload"]
            else:
                # Direct fallback via report builder
                recs = self.reporting_agent.rec_engine.generate_recommendations(
                    primary_hypothesis=correlation_result.get("primary_hypothesis", "Normal"),
                    affected_devices=correlation_result.get("affected_devices", []),
                    affected_segments=correlation_result.get("affected_segments", []),
                    evidence_items=correlation_result.get("supporting_evidence", []),
                )
                final_report = self.reporting_agent.report_builder.build_report(
                    incident_id=inc_id,
                    correlation_result=correlation_result,
                    recommendations=recs,
                    ml_prediction=classifier_result,
                    anomaly_detection=anomaly_result,
                    temporal_analysis=temporal_result,
                )

            agent_execution_summary["recommendation_reporting"] = {
                "status": "success",
                "messages_emitted": len(rep_msgs),
                "duration_ms": round((datetime.now(timezone.utc) - rec_start).total_seconds() * 1000, 2),
            }
        except Exception as exc:
            logger.error("Recommendation & Reporting Agent failed on incident %s: %s", inc_id, exc)
            final_report = self._build_fallback_report(inc_id, correlation_result, exc)
            agent_execution_summary["recommendation_reporting"] = {
                "status": "failed",
                "error": str(exc),
                "messages_emitted": 0,
                "duration_ms": round((datetime.now(timezone.utc) - rec_start).total_seconds() * 1000, 2),
            }

        # -------------------------------------------------------------
        # STEP 7: Attach Metadata, Topology Scoping, and Return
        # -------------------------------------------------------------
        total_duration_ms = round((datetime.now(timezone.utc) - start_time).total_seconds() * 1000, 2)
        final_report["diagnosis_id"] = diag_id
        if "incident_summary" in final_report:
            final_report["incident_summary"]["diagnosis_id"] = diag_id

            from app.services.topology import CampusTopologyService
            affected_devs = final_report["incident_summary"].get("affected_devices", [])
            scope_analysis = CampusTopologyService.analyze_fault_scope(affected_devs)
            final_report["incident_summary"]["topology_scope"] = scope_analysis["scope"]
            final_report["incident_summary"]["is_shared_infrastructure_fault"] = scope_analysis["is_shared_infrastructure_fault"]
            final_report["incident_summary"]["scope_summary"] = scope_analysis["summary"]

        final_report["orchestration_metadata"] = {
            "orchestrator_version": "1.0.0",
            "protocol_version": "1.0",
            "execution_time_ms": total_duration_ms,
            "agents_executed_count": len([s for s in agent_execution_summary.values() if s.get("status") == "success"]),
            "total_domain_messages": len(domain_messages),
            "agent_execution_summary": agent_execution_summary,
        }

        # -------------------------------------------------------------
        # STEP 8: Database Persistence (If DB session provided)
        # -------------------------------------------------------------
        if db is not None:
            try:
                from app.db.repository import save_diagnosis_result, save_telemetry_batch
                save_diagnosis_result(db, final_report)
                if not df.empty:
                    save_telemetry_batch(db, df.to_dict(orient="records"), incident_id=inc_id)
            except Exception as db_exc:
                logger.warning("Database persistence skipped or encountered non-fatal error: %s", db_exc)

        logger.info("Completed diagnosis for incident %s (%s) in %s ms", inc_id, diag_id, total_duration_ms)
        return final_report

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _prepare_telemetry_dataframe(
        self,
        telemetry: Union[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]],
        incident_id: str,
    ) -> pd.DataFrame:
        """
        Transforms heterogeneous incoming telemetry inputs into a normalized DataFrame
        with calculated rolling features.
        """
        if isinstance(telemetry, pd.DataFrame):
            df = telemetry.copy()
        elif isinstance(telemetry, list):
            df = pd.DataFrame(telemetry)
        elif isinstance(telemetry, dict):
            # Check if dict wraps a list (e.g. {"records": [...]})
            if "records" in telemetry and isinstance(telemetry["records"], list):
                df = pd.DataFrame(telemetry["records"])
            else:
                df = pd.DataFrame([telemetry])
        else:
            df = pd.DataFrame()

        if df.empty:
            return df

        # Ensure required identifiers exist
        if "incident_id" not in df.columns:
            df["incident_id"] = incident_id
        if "device_id" not in df.columns:
            df["device_id"] = "DEV-UNKNOWN"
        if "timestamp" not in df.columns:
            df["timestamp"] = datetime.now(timezone.utc).isoformat()

        # Handle organizer field mappings if present (e.g. cpu_utilization_pct -> cpu_usage_pct)
        for orig, mapped in TelemetryNormalizer.ORGANIZER_FIELD_MAP.items():
            if orig in df.columns and mapped not in df.columns:
                df[mapped] = df[orig]

        # Calculate engineered rolling features if missing
        if "rolling_latency_mean" not in df.columns and "latency_ms" in df.columns:
            try:
                df = TelemetryFeatureEngineer.compute_features(df, window_size=3)
            except Exception as exc:
                logger.warning("Feature engineering derivation skipped/failed: %s", exc)

        return df

    def _build_empty_response(self, incident_id: str) -> Dict[str, Any]:
        """Builds an explicit response when telemetry input is empty."""
        diag_id = f"DIAG-{uuid.uuid4().hex[:8].upper()}"
        return {
            "diagnosis_id": diag_id,
            "incident_summary": {
                "incident_id": incident_id,
                "diagnosis_id": diag_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "overall_status": "UNKNOWN",
                "severity": "informational",
                "affected_devices": [],
                "affected_device_count": 0,
                "affected_network_segments": [],
                "topology_scope": "none",
                "is_shared_infrastructure_fault": False,
                "scope_summary": "Empty telemetry provided; no device nodes identified.",
            },
            "probable_root_cause": {
                "primary_hypothesis": "Insufficient Telemetry",
                "confidence": "low",
                "alternative_hypotheses": [],
                "explanation": "No telemetry records were provided for diagnostic analysis.",
            },
            "machine_learning_signals": {
                "anomaly_detection": {"available": False, "error": "No records"},
                "fault_classification": {"available": False, "error": "No records"},
                "temporal_trajectory": {"available": False, "error": "No records"},
            },
            "evidence_trail": [],
            "agent_findings": [],
            "recommended_corrective_actions": [
                {
                    "action": "Submit Valid Telemetry Stream",
                    "priority": "High",
                    "target_devices": [],
                    "rationale": "Empty payload received; cannot compute network metrics.",
                    "step_order": 1,
                }
            ],
            "uncertainty_and_limitations": {
                "confidence_assessment": "low",
                "limitations": ["Input telemetry payload was empty."],
                "conflicting_evidence": [],
            },
            "orchestration_metadata": {
                "orchestrator_version": "1.0.0",
                "protocol_version": "1.0",
                "execution_time_ms": 0.0,
                "agents_executed_count": 0,
                "total_domain_messages": 0,
                "agent_execution_summary": {},
            },
        }

    def _build_fallback_report(
        self,
        incident_id: str,
        correlation_result: Dict[str, Any],
        error: Exception,
    ) -> Dict[str, Any]:
        """Builds a graceful diagnostic report when reporting agent fails."""
        return {
            "incident_summary": {
                "incident_id": incident_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "overall_status": "DEGRADED",
                "severity": str(correlation_result.get("severity", "medium")),
                "affected_devices": correlation_result.get("affected_devices", []),
                "affected_device_count": len(correlation_result.get("affected_devices", [])),
                "affected_network_segments": correlation_result.get("affected_segments", []),
            },
            "probable_root_cause": {
                "primary_hypothesis": correlation_result.get("primary_hypothesis", "Unknown"),
                "confidence": str(correlation_result.get("confidence", "low")),
                "alternative_hypotheses": correlation_result.get("alternative_hypotheses", []),
                "explanation": correlation_result.get("correlation_explanation", "Diagnostic synthesis fallback."),
            },
            "machine_learning_signals": {},
            "evidence_trail": correlation_result.get("supporting_evidence", []),
            "agent_findings": correlation_result.get("agent_findings_summary", []),
            "recommended_corrective_actions": [],
            "uncertainty_and_limitations": {
                "confidence_assessment": "low",
                "limitations": [f"Reporting agent encountered error: {str(error)}"],
                "conflicting_evidence": correlation_result.get("conflicting_evidence", []),
            },
        }

    def get_agent_statuses(self) -> List[Dict[str, Any]]:
        """
        Returns registration and operational status for all 5 specialized agents.
        """
        return [
            {
                "agent_id": agent.agent_id.value,
                "name": agent.name,
                "description": agent.description,
                "status": "active",
                "protocol_version": "1.0",
            }
            for agent in self._agents_registry.values()
        ]
