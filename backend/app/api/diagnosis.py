"""
Unified Multi-Agent Network Fault Diagnosis API Router for NetCoop AI.
Provides endpoints to trigger full five-agent diagnosis, query registered agents,
and inspect machine learning model operational readiness.
"""

from typing import Any, Dict, List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.logging_config import get_logger
from app.db.session import get_db
from app.db import repository
from app.schemas.diagnosis import (
    AgentsListResponse,
    DiagnosisHistoryItem,
    DiagnosisHistoryResponse,
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
def analyze_network_telemetry(
    request: DiagnosisRequest,
    db: Session = Depends(get_db),
) -> DiagnosisResponse:
    """
    Triggers end-to-end multi-agent network fault diagnosis and persists report to database.
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
            db=db,
        )
        return DiagnosisResponse(**report)
    except Exception as exc:
        logger.error("Diagnostic execution error on incident %s: %s", request.incident_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diagnostic pipeline encountered an unexpected error: {str(exc)}",
        )


@diagnosis_router.get(
    "/history",
    response_model=DiagnosisHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Query historical multi-agent diagnoses",
    description="Returns paginated diagnosis records with optional status and severity filtering.",
)
def get_diagnosis_history(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (e.g. CRITICAL, DEGRADED, HEALTHY)"),
    severity_filter: Optional[str] = Query(None, alias="severity", description="Filter by severity (e.g. critical, high, medium)"),
    db: Session = Depends(get_db),
) -> DiagnosisHistoryResponse:
    skip = (page - 1) * page_size
    items_raw, total = repository.get_diagnoses(
        db,
        skip=skip,
        limit=page_size,
        status=status_filter,
        severity=severity_filter,
    )
    items = []
    for d in items_raw:
        devs = json.loads(d.affected_devices) if d.affected_devices else []
        segs = json.loads(d.affected_segments) if d.affected_segments else []
        items.append(
            DiagnosisHistoryItem(
                diagnosis_id=d.diagnosis_id,
                incident_id=d.incident_id,
                primary_hypothesis=d.primary_hypothesis,
                confidence=d.confidence,
                severity=d.severity,
                overall_status=d.overall_status,
                affected_devices=devs,
                affected_segments=segs,
                temporal_trend=d.temporal_trend,
                created_at=d.created_at.isoformat(),
            )
        )
    return DiagnosisHistoryResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=items,
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


@diagnosis_router.get(
    "/{diagnosis_id}",
    response_model=DiagnosisResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve complete diagnosis record by ID",
    description="Returns full diagnostic payload, root cause hypothesis, and recommendations for a given diagnosis ID.",
)
def get_diagnosis_record(
    diagnosis_id: str,
    db: Session = Depends(get_db),
) -> DiagnosisResponse:
    diag = repository.get_diagnosis_by_id(db, diagnosis_id)
    if not diag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis '{diagnosis_id}' not found.",
        )
    payload = json.loads(diag.report_payload)
    return DiagnosisResponse(**payload)


@diagnosis_router.get(
    "/{diagnosis_id}/report",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Retrieve structured report for diagnosis",
    description="Returns full structured report payload including evidence trail and uncertainty limitations.",
)
def get_diagnosis_report(
    diagnosis_id: str,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    diag = repository.get_diagnosis_by_id(db, diagnosis_id)
    if not diag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis '{diagnosis_id}' not found.",
        )
    return json.loads(diag.report_payload)
