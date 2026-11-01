"""
Device inventory and telemetry history API router for NetCoop AI.
"""

from typing import Any, Dict, List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import repository

devices_router = APIRouter(prefix="/devices", tags=["Devices"])


class DeviceItem(BaseModel):
    device_id: str
    device_name: str
    device_type: str
    network_segment: str
    location: Optional[str] = None
    created_at: str


class DevicesListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    devices: List[DeviceItem]


class TelemetryItem(BaseModel):
    record_id: int
    device_id: str
    incident_id: Optional[str] = None
    timestamp: str
    latency_ms: Optional[float] = None
    packet_loss_pct: Optional[float] = None
    jitter_ms: Optional[float] = None
    throughput_mbps: Optional[float] = None
    bandwidth_utilization_pct: Optional[float] = None
    cpu_usage_pct: Optional[float] = None
    memory_usage_pct: Optional[float] = None
    temperature_celsius: Optional[float] = None
    device_uptime_seconds: Optional[float] = None
    dns_response_time_ms: Optional[float] = None
    queue_drops: Optional[int] = None
    interface_errors: Optional[int] = None
    retransmissions: Optional[int] = None
    wireless_signal_strength_dbm: Optional[float] = None


class DeviceTelemetryResponse(BaseModel):
    device_id: str
    total: int
    page: int
    page_size: int
    telemetry: List[TelemetryItem]


@devices_router.get(
    "",
    response_model=DevicesListResponse,
    status_code=status.HTTP_200_OK,
    summary="List network devices in inventory",
    description="Returns registered network devices with segment, device type, and location details.",
)
def list_devices(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    segment: Optional[str] = Query(None, description="Filter by network segment"),
    db: Session = Depends(get_db),
) -> DevicesListResponse:
    skip = (page - 1) * page_size
    items_raw, total = repository.get_devices(db, skip=skip, limit=page_size, segment=segment)
    items = [
        DeviceItem(
            device_id=d.device_id,
            device_name=d.device_name,
            device_type=d.device_type,
            network_segment=d.network_segment,
            location=d.location,
            created_at=d.created_at.isoformat(),
        )
        for d in items_raw
    ]
    return DevicesListResponse(
        total=total,
        page=page,
        page_size=page_size,
        devices=items,
    )


@devices_router.get(
    "/{device_id}",
    response_model=DeviceItem,
    status_code=status.HTTP_200_OK,
    summary="Get single device inventory record",
    description="Returns metadata and network segment for a specified device ID.",
)
def get_device(
    device_id: str,
    db: Session = Depends(get_db),
) -> DeviceItem:
    dev = repository.get_device_by_id(db, device_id)
    if not dev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{device_id}' not found.",
        )
    return DeviceItem(
        device_id=dev.device_id,
        device_name=dev.device_name,
        device_type=dev.device_type,
        network_segment=dev.network_segment,
        location=dev.location,
        created_at=dev.created_at.isoformat(),
    )


@devices_router.get(
    "/{device_id}/telemetry",
    response_model=DeviceTelemetryResponse,
    status_code=status.HTTP_200_OK,
    summary="Query device telemetry history",
    description="Returns chronological telemetry observations for a specific device.",
)
def get_device_telemetry(
    device_id: str,
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(50, ge=1, le=200, description="Page size"),
    db: Session = Depends(get_db),
) -> DeviceTelemetryResponse:
    dev = repository.get_device_by_id(db, device_id)
    if not dev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{device_id}' not found.",
        )
    skip = (page - 1) * page_size
    items_raw, total = repository.get_device_telemetry(db, device_id=device_id, skip=skip, limit=page_size)
    items = [
        TelemetryItem(
            record_id=t.record_id,
            device_id=t.device_id,
            incident_id=t.incident_id,
            timestamp=t.timestamp.isoformat(),
            latency_ms=t.latency_ms,
            packet_loss_pct=t.packet_loss_pct,
            jitter_ms=t.jitter_ms,
            throughput_mbps=t.throughput_mbps,
            bandwidth_utilization_pct=t.bandwidth_utilization_pct,
            cpu_usage_pct=t.cpu_usage_pct,
            memory_usage_pct=t.memory_usage_pct,
            temperature_celsius=t.temperature_celsius,
            device_uptime_seconds=t.device_uptime_seconds,
            dns_response_time_ms=t.dns_response_time_ms,
            queue_drops=t.queue_drops,
            interface_errors=t.interface_errors,
            retransmissions=t.retransmissions,
            wireless_signal_strength_dbm=t.wireless_signal_strength_dbm,
        )
        for t in items_raw
    ]
    return DeviceTelemetryResponse(
        device_id=device_id,
        total=total,
        page=page,
        page_size=page_size,
        telemetry=items,
    )


@devices_router.get(
    "/{device_id}/incidents",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Get incidents affecting device",
    description="Returns past and active incidents associated with this device.",
)
def get_device_incidents(
    device_id: str,
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    dev = repository.get_device_by_id(db, device_id)
    if not dev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{device_id}' not found.",
        )
    incidents, _ = repository.get_incidents(db, skip=0, limit=100)
    matching = []
    for inc in incidents:
        devs = json.loads(inc.affected_devices) if inc.affected_devices else []
        if device_id in devs:
            matching.append({
                "incident_id": inc.incident_id,
                "incident_type": inc.incident_type,
                "severity": inc.severity,
                "status": inc.status,
                "start_time": inc.start_time.isoformat(),
            })
    return matching
