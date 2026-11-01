"""
SQLAlchemy ORM models for NetCoop AI persistence layer.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class DeviceModel(Base):
    """Network device catalog and operational status."""
    __tablename__ = "devices"

    device_id = Column(String(64), primary_key=True, index=True)
    device_name = Column(String(128), nullable=False)
    device_type = Column(String(64), nullable=False, default="switch")
    network_segment = Column(String(128), nullable=False, default="General Campus Segment")
    location = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    telemetry_records = relationship("TelemetryRecordModel", back_populates="device", cascade="all, delete-orphan")


class NetworkSegmentModel(Base):
    """Network campus topology segment."""
    __tablename__ = "network_segments"

    segment_id = Column(String(64), primary_key=True, index=True)
    segment_name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)


class IncidentModel(Base):
    """Tracked network diagnostic incidents."""
    __tablename__ = "incidents"

    incident_id = Column(String(64), primary_key=True, index=True)
    incident_type = Column(String(64), nullable=False, default="Performance Degradation")
    severity = Column(String(32), nullable=False, default="medium")
    status = Column(String(32), nullable=False, default="active")
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    affected_devices = Column(Text, nullable=True)  # JSON-serialized list

    diagnoses = relationship("DiagnosisModel", back_populates="incident", cascade="all, delete-orphan")
    findings = relationship("AgentFindingModel", back_populates="incident", cascade="all, delete-orphan")


class TelemetryRecordModel(Base):
    """Historical telemetry observations ingested from network nodes."""
    __tablename__ = "telemetry_records"

    record_id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(64), ForeignKey("devices.device_id"), nullable=False, index=True)
    incident_id = Column(String(64), nullable=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)

    latency_ms = Column(Float, nullable=True)
    packet_loss_pct = Column(Float, nullable=True)
    jitter_ms = Column(Float, nullable=True)
    throughput_mbps = Column(Float, nullable=True)
    bandwidth_utilization_pct = Column(Float, nullable=True)
    cpu_usage_pct = Column(Float, nullable=True)
    memory_usage_pct = Column(Float, nullable=True)
    temperature_celsius = Column(Float, nullable=True)
    device_uptime_seconds = Column(Float, nullable=True)
    dns_response_time_ms = Column(Float, nullable=True)
    queue_drops = Column(Integer, nullable=True)
    interface_errors = Column(Integer, nullable=True)
    retransmissions = Column(Integer, nullable=True)
    wireless_signal_strength_dbm = Column(Float, nullable=True)

    raw_payload = Column(Text, nullable=True)

    device = relationship("DeviceModel", back_populates="telemetry_records")

    __table_args__ = (
        Index("ix_telemetry_device_time", "device_id", "timestamp"),
        Index("ix_telemetry_incident_device", "incident_id", "device_id"),
    )


class DiagnosisModel(Base):
    """Correlated multi-agent diagnostic assessments."""
    __tablename__ = "diagnoses"

    diagnosis_id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=False, index=True)
    primary_hypothesis = Column(String(256), nullable=False)
    confidence = Column(String(32), nullable=False, default="medium")
    severity = Column(String(32), nullable=False, default="medium")
    overall_status = Column(String(32), nullable=False, default="DEGRADED")
    affected_devices = Column(Text, nullable=True)  # JSON-serialized list
    affected_segments = Column(Text, nullable=True)  # JSON-serialized list
    temporal_trend = Column(String(64), nullable=True)
    report_payload = Column(Text, nullable=False)  # Complete JSON report
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    incident = relationship("IncidentModel", back_populates="diagnoses")
    recommendations = relationship("RecommendationModel", back_populates="diagnosis", cascade="all, delete-orphan")
    model_predictions = relationship("ModelPredictionModel", back_populates="diagnosis", cascade="all, delete-orphan")


class AgentFindingModel(Base):
    """Structured observations and findings emitted by specialized agents."""
    __tablename__ = "agent_findings"

    finding_id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=False, index=True)
    agent_name = Column(String(64), nullable=False)
    finding_type = Column(String(64), nullable=False, default="diagnostic_finding")
    severity = Column(String(32), nullable=False, default="medium")
    confidence = Column(String(32), nullable=False, default="medium")
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    suspected_cause = Column(String(256), nullable=True)
    evidence_ids = Column(Text, nullable=True)  # JSON-serialized list
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    incident = relationship("IncidentModel", back_populates="findings")


class RecommendationModel(Base):
    """Actionable remediation directives generated from diagnosis."""
    __tablename__ = "recommendations"

    recommendation_id = Column(String(64), primary_key=True, index=True)
    diagnosis_id = Column(String(64), ForeignKey("diagnoses.diagnosis_id"), nullable=False, index=True)
    priority = Column(String(32), nullable=False, default="High")
    action = Column(String(256), nullable=False)
    rationale = Column(Text, nullable=False)
    target_devices = Column(Text, nullable=True)  # JSON-serialized list
    step_order = Column(Integer, nullable=False, default=1)
    supporting_evidence_ids = Column(Text, nullable=True)  # JSON-serialized list
    automated = Column(Boolean, nullable=False, default=False)

    diagnosis = relationship("DiagnosisModel", back_populates="recommendations")


class ModelPredictionModel(Base):
    """Machine learning inference telemetry signals captured during diagnosis."""
    __tablename__ = "model_predictions"

    prediction_id = Column(String(64), primary_key=True, index=True)
    diagnosis_id = Column(String(64), ForeignKey("diagnoses.diagnosis_id"), nullable=False, index=True)
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(32), nullable=False, default="1.0.0")
    predicted_class = Column(String(64), nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    scores = Column(Text, nullable=True)  # JSON-serialized scores or probabilities

    diagnosis = relationship("DiagnosisModel", back_populates="model_predictions")
