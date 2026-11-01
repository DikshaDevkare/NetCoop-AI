"""
Repository methods for querying and persisting NetCoop AI domain entities.
"""

from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Optional, Tuple
import uuid
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.models import (
    AgentFindingModel,
    DeviceModel,
    DiagnosisModel,
    IncidentModel,
    ModelPredictionModel,
    NetworkSegmentModel,
    RecommendationModel,
    TelemetryRecordModel,
)


def ensure_device_exists(
    db: Session,
    device_id: str,
    device_type: Optional[str] = None,
    network_segment: Optional[str] = None,
) -> DeviceModel:
    """Ensures device is registered in the database catalog."""
    dev = db.query(DeviceModel).filter(DeviceModel.device_id == device_id).first()
    if not dev:
        dtype = device_type or ("router" if "CORE" in device_id or "RTR" in device_id else ("access_point" if "AP" in device_id else "switch"))
        from agents.fault_correlation.correlation_engine import CorrelationEngine
        seg = network_segment or CorrelationEngine.infer_network_segment(device_id, dtype)
        dev = DeviceModel(
            device_id=device_id,
            device_name=device_id,
            device_type=dtype,
            network_segment=seg,
            location="Campus Zone A",
        )
        db.add(dev)
        db.flush()
    return dev


def save_diagnosis_result(
    db: Session,
    report: Dict[str, Any],
) -> DiagnosisModel:
    """
    Persists a complete multi-agent diagnosis report into relational tables.
    """
    inc_summary = report.get("incident_summary", {})
    inc_id = inc_summary.get("incident_id") or f"INC-{uuid.uuid4().hex[:8].upper()}"
    diag_id = report.get("diagnosis_id") or inc_summary.get("diagnosis_id") or f"DIAG-{uuid.uuid4().hex[:8].upper()}"

    affected_devs = inc_summary.get("affected_devices", [])
    affected_segs = inc_summary.get("affected_network_segments", [])
    primary_hypo = report.get("probable_root_cause", {}).get("primary_hypothesis", "Unknown")
    confidence = str(report.get("probable_root_cause", {}).get("confidence", "medium"))
    severity = str(inc_summary.get("severity", "medium"))
    status = str(inc_summary.get("overall_status", "DEGRADED"))

    # 1. Ensure devices exist
    for did in affected_devs:
        ensure_device_exists(db, did)

    # 2. Upsert Incident
    incident = db.query(IncidentModel).filter(IncidentModel.incident_id == inc_id).first()
    if not incident:
        incident = IncidentModel(
            incident_id=inc_id,
            incident_type=primary_hypo,
            severity=severity,
            status="active" if status != "HEALTHY" else "resolved",
            affected_devices=json.dumps(affected_devs, default=str),
        )
        db.add(incident)
        db.flush()
    else:
        incident.severity = severity
        incident.incident_type = primary_hypo
        incident.affected_devices = json.dumps(affected_devs, default=str)

    # 3. Create Diagnosis
    temporal_trend = report.get("machine_learning_signals", {}).get("temporal_trajectory", {}).get("overall_trend", "stable")
    diagnosis = DiagnosisModel(
        diagnosis_id=diag_id,
        incident_id=inc_id,
        primary_hypothesis=primary_hypo,
        confidence=confidence,
        severity=severity,
        overall_status=status,
        affected_devices=json.dumps(affected_devs, default=str),
        affected_segments=json.dumps(affected_segs, default=str),
        temporal_trend=temporal_trend,
        report_payload=json.dumps(report, default=str),
    )
    db.add(diagnosis)
    db.flush()

    # 4. Save Recommendations
    for rec in report.get("recommended_corrective_actions", []):
        r_model = RecommendationModel(
            recommendation_id=f"REC-{uuid.uuid4().hex[:8].upper()}",
            diagnosis_id=diag_id,
            priority=rec.get("priority", "High"),
            action=rec.get("action", "Inspect Telemetry"),
            rationale=rec.get("rationale", ""),
            target_devices=json.dumps(rec.get("target_devices", []), default=str),
            step_order=rec.get("step_order", 1),
            supporting_evidence_ids=json.dumps(rec.get("supporting_evidence_ids", []), default=str),
            automated=rec.get("automated", False),
        )
        db.add(r_model)

    # 5. Save Agent Findings
    for fnd in report.get("agent_findings", []):
        fnd_model = AgentFindingModel(
            finding_id=fnd.get("finding_id") or f"FND-{uuid.uuid4().hex[:8].upper()}",
            incident_id=inc_id,
            agent_name=fnd.get("source_agent", "Agent"),
            finding_type=fnd.get("message_type", "diagnostic_finding"),
            severity=str(fnd.get("severity", "medium")),
            confidence=str(fnd.get("confidence", "medium")),
            title=fnd.get("title", "Observation"),
            description=fnd.get("description", ""),
            suspected_cause=fnd.get("suspected_cause"),
            evidence_ids=json.dumps(fnd.get("supporting_evidence_ids", []), default=str),
        )
        db.add(fnd_model)

    # 6. Save ML Predictions
    ml_signals = report.get("machine_learning_signals", {})
    if "fault_classification" in ml_signals and ml_signals["fault_classification"].get("available"):
        clf = ml_signals["fault_classification"]
        p_model = ModelPredictionModel(
            prediction_id=f"PRED-{uuid.uuid4().hex[:8].upper()}",
            diagnosis_id=diag_id,
            model_name="XGBoost Multi-Class Fault Classifier",
            model_version="1.0.0",
            predicted_class=clf.get("predicted_fault", "normal"),
            confidence=float(clf.get("confidence", 0.0)),
            scores=json.dumps(clf.get("class_probabilities", {}), default=str),
        )
        db.add(p_model)

    if "anomaly_detection" in ml_signals and ml_signals["anomaly_detection"].get("available"):
        anom = ml_signals["anomaly_detection"]
        a_model = ModelPredictionModel(
            prediction_id=f"PRED-{uuid.uuid4().hex[:8].upper()}",
            diagnosis_id=diag_id,
            model_name="Isolation Forest Anomaly Detector",
            model_version="1.0.0",
            predicted_class="anomaly" if anom.get("is_anomalous") else "normal",
            confidence=0.85 if anom.get("is_anomalous") else 0.70,
            scores=json.dumps({"max_anomaly_score": anom.get("max_anomaly_score")}, default=str),
        )
        db.add(a_model)

    db.commit()
    return diagnosis


def save_telemetry_batch(
    db: Session,
    records: List[Dict[str, Any]],
    incident_id: Optional[str] = None,
) -> int:
    """Ingests and stores a batch of telemetry records."""
    count = 0
    for r in records:
        dev_id = str(r.get("device_id") or "DEV-UNKNOWN")
        ensure_device_exists(db, dev_id, device_type=r.get("device_type"))

        ts_raw = r.get("timestamp")
        if isinstance(ts_raw, str):
            try:
                ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
            except ValueError:
                ts = datetime.now(timezone.utc)
        elif isinstance(ts_raw, datetime):
            ts = ts_raw
        else:
            ts = datetime.now(timezone.utc)

        t_model = TelemetryRecordModel(
            device_id=dev_id,
            incident_id=incident_id or r.get("incident_id"),
            timestamp=ts,
            latency_ms=float(r["latency_ms"]) if r.get("latency_ms") is not None else None,
            packet_loss_pct=float(r["packet_loss_pct"]) if r.get("packet_loss_pct") is not None else None,
            jitter_ms=float(r["jitter_ms"]) if r.get("jitter_ms") is not None else None,
            throughput_mbps=float(r["throughput_mbps"]) if r.get("throughput_mbps") is not None else None,
            bandwidth_utilization_pct=float(r["bandwidth_utilization_pct"]) if r.get("bandwidth_utilization_pct") is not None else None,
            cpu_usage_pct=float(r["cpu_usage_pct"]) if r.get("cpu_usage_pct") is not None else None,
            memory_usage_pct=float(r["memory_usage_pct"]) if r.get("memory_usage_pct") is not None else None,
            temperature_celsius=float(r["temperature_celsius"]) if r.get("temperature_celsius") is not None else None,
            device_uptime_seconds=float(r["device_uptime_seconds"]) if r.get("device_uptime_seconds") is not None else None,
            dns_response_time_ms=float(r["dns_response_time_ms"]) if r.get("dns_response_time_ms") is not None else None,
            queue_drops=int(r["queue_drops"]) if r.get("queue_drops") is not None else None,
            interface_errors=int(r["interface_errors"]) if r.get("interface_errors") is not None else None,
            retransmissions=int(r["retransmissions"]) if r.get("retransmissions") is not None else None,
            wireless_signal_strength_dbm=float(r["wireless_signal_strength_dbm"]) if r.get("wireless_signal_strength_dbm") is not None else None,
            raw_payload=json.dumps(r, default=str),
        )
        db.add(t_model)
        count += 1
    db.commit()
    return count


# =============================================================================
# Query Functions
# =============================================================================

def get_diagnoses(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    severity: Optional[str] = None,
) -> Tuple[List[DiagnosisModel], int]:
    """Retrieves paginated diagnosis records."""
    q = db.query(DiagnosisModel)
    if status:
        q = q.filter(DiagnosisModel.overall_status.ilike(f"%{status}%"))
    if severity:
        q = q.filter(DiagnosisModel.severity.ilike(f"%{severity}%"))
    total = q.count()
    items = q.order_by(desc(DiagnosisModel.created_at)).offset(skip).limit(limit).all()
    return items, total


def get_diagnosis_by_id(db: Session, diagnosis_id: str) -> Optional[DiagnosisModel]:
    return db.query(DiagnosisModel).filter(DiagnosisModel.diagnosis_id == diagnosis_id).first()


def get_devices(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    segment: Optional[str] = None,
) -> Tuple[List[DeviceModel], int]:
    q = db.query(DeviceModel)
    if segment:
        q = q.filter(DeviceModel.network_segment.ilike(f"%{segment}%"))
    total = q.count()
    items = q.order_by(DeviceModel.device_id).offset(skip).limit(limit).all()
    return items, total


def get_device_by_id(db: Session, device_id: str) -> Optional[DeviceModel]:
    return db.query(DeviceModel).filter(DeviceModel.device_id == device_id).first()


def get_device_telemetry(
    db: Session,
    device_id: str,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[TelemetryRecordModel], int]:
    q = db.query(TelemetryRecordModel).filter(TelemetryRecordModel.device_id == device_id)
    total = q.count()
    items = q.order_by(desc(TelemetryRecordModel.timestamp)).offset(skip).limit(limit).all()
    return items, total


def get_incidents(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    severity: Optional[str] = None,
) -> Tuple[List[IncidentModel], int]:
    q = db.query(IncidentModel)
    if status:
        q = q.filter(IncidentModel.status == status)
    if severity:
        q = q.filter(IncidentModel.severity == severity)
    total = q.count()
    items = q.order_by(desc(IncidentModel.start_time)).offset(skip).limit(limit).all()
    return items, total


def get_incident_by_id(db: Session, incident_id: str) -> Optional[IncidentModel]:
    return db.query(IncidentModel).filter(IncidentModel.incident_id == incident_id).first()


def get_incident_findings(db: Session, incident_id: str) -> List[AgentFindingModel]:
    return db.query(AgentFindingModel).filter(AgentFindingModel.incident_id == incident_id).all()


def get_incident_recommendations(db: Session, incident_id: str) -> List[RecommendationModel]:
    diags = db.query(DiagnosisModel).filter(DiagnosisModel.incident_id == incident_id).all()
    diag_ids = [d.diagnosis_id for d in diags]
    if not diag_ids:
        return []
    return db.query(RecommendationModel).filter(RecommendationModel.diagnosis_id.in_(diag_ids)).all()
