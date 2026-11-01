"""
Report export API router for NetCoop AI.
Provides downloadable JSON and CSV reports for multi-agent diagnoses.
"""

from io import StringIO
import json
from fastapi import APIRouter, Depends, HTTPException, Response, status
import pandas as pd
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import repository

reports_router = APIRouter(prefix="/reports", tags=["Reports"])


@reports_router.get(
    "/diagnosis/{diagnosis_id}/json",
    status_code=status.HTTP_200_OK,
    summary="Download diagnosis report as JSON",
    description="Returns complete diagnostic report payload as a downloadable JSON file.",
)
def download_diagnosis_json(
    diagnosis_id: str,
    db: Session = Depends(get_db),
) -> Response:
    diag = repository.get_diagnosis_by_id(db, diagnosis_id)
    if not diag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis '{diagnosis_id}' not found.",
        )
    filename = f"netcoop_diagnosis_{diagnosis_id}.json"
    return Response(
        content=diag.report_payload,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@reports_router.get(
    "/diagnosis/{diagnosis_id}/csv",
    status_code=status.HTTP_200_OK,
    summary="Download diagnosis summary and evidence as CSV",
    description="Returns flattened diagnostic summary and evidence trail as a downloadable CSV spreadsheet.",
)
def download_diagnosis_csv(
    diagnosis_id: str,
    db: Session = Depends(get_db),
) -> Response:
    diag = repository.get_diagnosis_by_id(db, diagnosis_id)
    if not diag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis '{diagnosis_id}' not found.",
        )
    payload = json.loads(diag.report_payload)
    evidence_trail = payload.get("evidence_trail", [])

    rows = []
    if evidence_trail:
        for evd in evidence_trail:
            rows.append({
                "diagnosis_id": diagnosis_id,
                "incident_id": diag.incident_id,
                "overall_status": diag.overall_status,
                "primary_hypothesis": diag.primary_hypothesis,
                "confidence": diag.confidence,
                "severity": diag.severity,
                "evidence_id": evd.get("evidence_id"),
                "source_agent": evd.get("source_agent"),
                "evidence_type": evd.get("evidence_type"),
                "device_id": evd.get("device_id"),
                "description": evd.get("description"),
            })
    else:
        rows.append({
            "diagnosis_id": diagnosis_id,
            "incident_id": diag.incident_id,
            "overall_status": diag.overall_status,
            "primary_hypothesis": diag.primary_hypothesis,
            "confidence": diag.confidence,
            "severity": diag.severity,
            "evidence_id": "None",
            "source_agent": "None",
            "evidence_type": "None",
            "device_id": "All",
            "description": "No abnormal evidence detected.",
        })

    df = pd.DataFrame(rows)
    buf = StringIO()
    df.to_csv(buf, index=False)
    csv_text = buf.getvalue()

    filename = f"netcoop_diagnosis_{diagnosis_id}.csv"
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
