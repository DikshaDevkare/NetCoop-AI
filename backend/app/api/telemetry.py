"""
Standardized telemetry ingestion API router for NetCoop AI.
"""

from io import StringIO
from typing import Any, Dict, List, Optional
import json
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
import pandas as pd
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import repository
from app.services.ingestion.normalizer import TelemetryNormalizer

telemetry_router = APIRouter(prefix="/telemetry", tags=["Telemetry Ingestion"])

MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_UPLOAD_ROWS = 5000


class TelemetryIngestResponse(BaseModel):
    success: bool
    records_ingested: int
    message: str


class TelemetryBatchRequest(BaseModel):
    incident_id: Optional[str] = Field(None, description="Optional incident correlation ID")
    records: List[Dict[str, Any]] = Field(..., min_length=1, description="List of telemetry records")


@telemetry_router.post(
    "/ingest",
    response_model=TelemetryIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest single telemetry record",
    description="Ingests a single standardized telemetry observation and stores it in the database.",
)
def ingest_telemetry_record(
    record: Dict[str, Any],
    db: Session = Depends(get_db),
) -> TelemetryIngestResponse:
    if not record:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Telemetry payload cannot be empty.",
        )
    # Normalize aliases if present
    for orig, mapped in TelemetryNormalizer.ORGANIZER_FIELD_MAP.items():
        if orig in record and mapped not in record:
            record[mapped] = record[orig]

    count = repository.save_telemetry_batch(db, [record])
    return TelemetryIngestResponse(
        success=True,
        records_ingested=count,
        message=f"Successfully ingested 1 telemetry record for device '{record.get('device_id', 'DEV-UNKNOWN')}'.",
    )


@telemetry_router.post(
    "/batch",
    response_model=TelemetryIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Batch ingest telemetry records",
    description="Ingests multiple standardized telemetry observations in a single transaction.",
)
def ingest_telemetry_batch(
    payload: TelemetryBatchRequest,
    db: Session = Depends(get_db),
) -> TelemetryIngestResponse:
    if not payload.records:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Batch records list cannot be empty.",
        )
    if len(payload.records) > MAX_UPLOAD_ROWS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch size exceeds maximum limit of {MAX_UPLOAD_ROWS} records.",
        )

    # Normalize aliases across batch
    for r in payload.records:
        for orig, mapped in TelemetryNormalizer.ORGANIZER_FIELD_MAP.items():
            if orig in r and mapped not in r:
                r[mapped] = r[orig]

    count = repository.save_telemetry_batch(db, payload.records, incident_id=payload.incident_id)
    return TelemetryIngestResponse(
        success=True,
        records_ingested=count,
        message=f"Successfully ingested {count} telemetry records.",
    )


@telemetry_router.post(
    "/upload",
    response_model=TelemetryIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload telemetry dataset file (CSV or JSON)",
    description="Accepts CSV or JSON file uploads, validates format and limits, and stores normalized telemetry.",
)
async def upload_telemetry_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> TelemetryIngestResponse:
    filename = (file.filename or "").lower()
    if not (filename.endswith(".csv") or filename.endswith(".json")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only .csv and .json files are supported.",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed limit of {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB.",
        )

    try:
        text_data = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file encoding. File must be UTF-8 encoded.",
        )

    records: List[Dict[str, Any]] = []
    if filename.endswith(".csv"):
        try:
            df = pd.read_csv(StringIO(text_data))
            if len(df) > MAX_UPLOAD_ROWS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"CSV row count ({len(df)}) exceeds limit of {MAX_UPLOAD_ROWS} rows.",
                )
            records = df.to_dict(orient="records")
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Malformed CSV content: {str(exc)}",
            )
    elif filename.endswith(".json"):
        try:
            parsed = json.loads(text_data)
            if isinstance(parsed, list):
                records = parsed
            elif isinstance(parsed, dict) and "records" in parsed and isinstance(parsed["records"], list):
                records = parsed["records"]
            elif isinstance(parsed, dict):
                records = [parsed]
            else:
                raise ValueError("JSON must be a list of records or an object containing 'records'.")

            if len(records) > MAX_UPLOAD_ROWS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"JSON record count ({len(records)}) exceeds limit of {MAX_UPLOAD_ROWS} records.",
                )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Malformed JSON content: {str(exc)}",
            )

    if not records:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file contained no valid telemetry records.",
        )

    # Normalize aliases
    for r in records:
        for orig, mapped in TelemetryNormalizer.ORGANIZER_FIELD_MAP.items():
            if orig in r and mapped not in r:
                r[mapped] = r[orig]

    count = repository.save_telemetry_batch(db, records)
    return TelemetryIngestResponse(
        success=True,
        records_ingested=count,
        message=f"Successfully processed and ingested {count} telemetry records from '{file.filename}'.",
    )
