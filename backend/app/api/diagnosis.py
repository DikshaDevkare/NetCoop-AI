"""
Unified Multi-Agent Network Fault Diagnosis API Router for NetCoop AI.
Provides endpoints to trigger full five-agent diagnosis, query registered agents,
and inspect machine learning model operational readiness.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status

from app.core.logging_config import get_logger
from app.schemas.diagnosis import (
    AgentsListResponse,
    DiagnosisRequest,
    DiagnosisResponse,
    ModelsListResponse,
)
from app.services.orchestration.orchestrator import MultiAgentOrchestrator

logger = get_logger("netcoop.api.diagnosis")

diagnosis_router = APIRouter(prefix="/diagnosis", tags=["Diagnosis"])

# Shared orchestrator instance
orchestrator = MultiAgentOrchestrator()


@diagnosis_router.post(
    "/analyze",
    response_model=DiagnosisResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute multi-agent network fault diagnosis",
    description=(
        "Accepts standardized network telemetry records and executes the complete "
        "multi-agent diagnostic pipeline: ML anomaly detection, XGBoost fault classification, "
        "temporal sequence analysis, domain agent evaluations, fault correlation, and remediation planning."
    ),
)
def analyze_network_telemetry(request: DiagnosisRequest) -> DiagnosisResponse:
    """
    Triggers end-to-end multi-agent network fault diagnosis.
    """
    if not request.telemetry_records:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="telemetry_records must contain at least one telemetry observation.",
        )

    try:
        report = orchestrator.diagnose(
            telemetry=request.telemetry_records,
            incident_id=request.incident_id,
            context=request.context,
        )
        return DiagnosisResponse(**report)
    except Exception as exc:
        logger.error("Diagnostic execution error on incident %s: %s", request.incident_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diagnostic pipeline encountered an unexpected error: {str(exc)}",
        )


@diagnosis_router.get(
    "/agents",
    response_model=AgentsListResponse,
    status_code=status.HTTP_200_OK,
    summary="List registered diagnostic agents",
    description="Returns metadata, operational status, and protocol versions for all five specialized diagnostic agents.",
)
def get_registered_agents() -> AgentsListResponse:
    """
    Queries the central orchestrator for registered agents and operational status.
    """
    agents = orchestrator.get_agent_statuses()
    return AgentsListResponse(total_agents=len(agents), agents=agents)


@diagnosis_router.get(
    "/models",
    response_model=ModelsListResponse,
    status_code=status.HTTP_200_OK,
    summary="List registered ML diagnostic models",
    description="Returns readiness, feature requirements, and operational notes for Isolation Forest, XGBoost, and Temporal models.",
)
def get_registered_models() -> ModelsListResponse:
    """
    Queries the model service for ML artifact availability and pipeline readiness.
    """
    models = orchestrator.model_service.get_model_statuses()
    return ModelsListResponse(total_models=len(models), models=models)
