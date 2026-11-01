"""
Incident management API router for NetCoop AI.
"""

from typing import Any, Dict, List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import repository

incidents_router = APIRouter(prefix="/incidents", tags=["Incidents"])


class IncidentItem(BaseModel):
    incident_id: str
    incident_type: str
    severity: str
    status: str
    start_time: str
    end_time: Optional[str] = None
    affected_devices: List[str]


class IncidentsListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    incidents: List[IncidentItem]


class FindingItem(BaseModel):
    finding_id: str
    incident_id: str
    agent_name: str
    finding_type: str
    severity: str
    confidence: str
    title: str
    description: str
    suspected_cause: Optional[str] = None
    evidence_ids: List[str]
    created_at: str


class RecommendationItem(BaseModel):
    recommendation_id: str
    diagnosis_id: str
    priority: str
    action: str
    rationale: str
    target_devices: List[str]
    step_order: int
    supporting_evidence_ids: List[str]
    automated: bool


@incidents_router.get(
    "",
    response_model=IncidentsListResponse,
    status_code=status.HTTP_200_OK,
    summary="List network incidents",
    description="Returns tracked network incidents with status, severity, and impacted device nodes.",
)
def list_incidents(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (e.g. active, resolved)"),
    severity_filter: Optional[str] = Query(None, alias="severity", description="Filter by severity (e.g. critical, high, medium)"),
    db: Session = Depends(get_db),
) -> IncidentsListResponse:
    skip = (page - 1) * page_size
    items_raw, total = repository.get_incidents(
        db,
        skip=skip,
        limit=page_size,
        status=status_filter,
        severity=severity_filter,
    )
    items = [
        IncidentItem(
            incident_id=inc.incident_id,
            incident_type=inc.incident_type,
            severity=inc.severity,
            status=inc.status,
            start_time=inc.start_time.isoformat(),
            end_time=inc.end_time.isoformat() if inc.end_time else None,
            affected_devices=json.loads(inc.affected_devices) if inc.affected_devices else [],
        )
        for inc in items_raw
    ]
    return IncidentsListResponse(
        total=total,
        page=page,
        page_size=page_size,
        incidents=items,
    )


@incidents_router.get(
    "/{incident_id}",
    response_model=IncidentItem,
    status_code=status.HTTP_200_OK,
    summary="Get single incident details",
    description="Returns complete details for a specified incident ID.",
)
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
) -> IncidentItem:
    inc = repository.get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found.",
        )
    return IncidentItem(
        incident_id=inc.incident_id,
        incident_type=inc.incident_type,
        severity=inc.severity,
        status=inc.status,
        start_time=inc.start_time.isoformat(),
        end_time=inc.end_time.isoformat() if inc.end_time else None,
        affected_devices=json.loads(inc.affected_devices) if inc.affected_devices else [],
    )


@incidents_router.get(
    "/{incident_id}/findings",
    response_model=List[FindingItem],
    status_code=status.HTTP_200_OK,
    summary="Get agent findings for incident",
    description="Returns all structured findings emitted by specialized agents during this incident.",
)
def get_incident_findings(
    incident_id: str,
    db: Session = Depends(get_db),
) -> List[FindingItem]:
    inc = repository.get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found.",
        )
    findings_raw = repository.get_incident_findings(db, incident_id)
    return [
        FindingItem(
            finding_id=f.finding_id,
            incident_id=f.incident_id,
            agent_name=f.agent_name,
            finding_type=f.finding_type,
            severity=f.severity,
            confidence=f.confidence,
            title=f.title,
            description=f.description,
            suspected_cause=f.suspected_cause,
            evidence_ids=json.loads(f.evidence_ids) if f.evidence_ids else [],
            created_at=f.created_at.isoformat(),
        )
        for f in findings_raw
    ]


@incidents_router.get(
    "/{incident_id}/recommendations",
    response_model=List[RecommendationItem],
    status_code=status.HTTP_200_OK,
    summary="Get recommendations for incident",
    description="Returns prioritized remediation directives associated with this incident.",
)
def get_incident_recommendations(
    incident_id: str,
    db: Session = Depends(get_db),
) -> List[RecommendationItem]:
    inc = repository.get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found.",
        )
    recs_raw = repository.get_incident_recommendations(db, incident_id)
    return [
        RecommendationItem(
            recommendation_id=r.recommendation_id,
            diagnosis_id=r.diagnosis_id,
            priority=r.priority,
            action=r.action,
            rationale=r.rationale,
            target_devices=json.loads(r.target_devices) if r.target_devices else [],
            step_order=r.step_order,
            supporting_evidence_ids=json.loads(r.supporting_evidence_ids) if r.supporting_evidence_ids else [],
            automated=r.automated,
        )
        for r in recs_raw
    ]
