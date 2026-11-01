"""
Health and status endpoints for NetCoop AI Backend.

Provides root welcome and application health-check endpoints using
centralized configuration and real-time UTC timestamps.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.config import get_settings


class WelcomeResponse(BaseModel):
    """Schema for root welcome endpoint response."""

    message: str = Field(..., description="Greeting message from the service")
    status: str = Field(..., description="Operational status of the backend")


class HealthResponse(BaseModel):
    """Schema for application health-check response."""

    status: str = Field(..., description="Current health status of the application")
    application: str = Field(..., description="Name of the backend service")
    version: str = Field(..., description="Application semantic version")
    environment: str = Field(..., description="Runtime environment")
    timestamp: str = Field(..., description="UTC ISO 8601 timestamp of request evaluation")


class SystemStatusResponse(BaseModel):
    """Comprehensive system status schema for frontend integration."""

    api_status: str = Field("healthy", description="Status of API endpoints")
    database_status: str = Field(..., description="Status of database connectivity")
    protocol_version: str = Field("1.0", description="Interoperability protocol version")
    backend_version: str = Field(..., description="Semantic backend version")
    environment: str = Field(..., description="Runtime environment")
    models: list[dict] = Field(default_factory=list, description="Loaded machine learning pipelines status")
    agents: list[dict] = Field(default_factory=list, description="Registered specialized diagnostic agents")
    timestamp: str = Field(..., description="UTC ISO 8601 evaluation timestamp")


root_router = APIRouter(tags=["General"])
health_router = APIRouter(tags=["Health"])

# Reusable alias for standard router imports
router = health_router


@root_router.get(
    "/",
    response_model=WelcomeResponse,
    status_code=status.HTTP_200_OK,
    summary="Root Welcome Endpoint",
    description="Returns a welcome message confirming that the NetCoop AI backend is online.",
)
async def get_root() -> WelcomeResponse:
    """Return welcome message and basic running status."""
    return WelcomeResponse(
        message="Welcome to NetCoop AI Backend",
        status="running",
    )


@health_router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Application Health Check",
    description="Returns current health status, application metadata, and UTC evaluation timestamp.",
)
async def get_health() -> HealthResponse:
    """
    Return basic backend application health information.

    Reports only verified application runtime components. External dependencies
    such as agents or databases are not reported as healthy when not yet present.
    """
    settings = get_settings()
    current_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    return HealthResponse(
        status="healthy",
        application=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        timestamp=current_utc,
    )


@health_router.get(
    "/system/status",
    response_model=SystemStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Complete System Operational Status",
    description="Returns verified live status for database, ML pipelines, diagnostic agents, and protocol version.",
)
async def get_system_status() -> SystemStatusResponse:
    """Return consolidated system status across backend components."""
    settings = get_settings()
    current_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Check database
    db_status = "connected"
    try:
        from sqlalchemy import text
        from app.db.session import SessionLocal
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unavailable: {str(exc)}"

    # Get ML models
    from app.services.orchestration.model_service import ModelService
    model_statuses = ModelService.get_instance().get_model_statuses()

    # Get Agents
    from app.services.orchestration.orchestrator import MultiAgentOrchestrator
    agent_statuses = MultiAgentOrchestrator().get_agent_statuses()

    return SystemStatusResponse(
        api_status="healthy",
        database_status=db_status,
        protocol_version="1.0",
        backend_version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        models=model_statuses,
        agents=agent_statuses,
        timestamp=current_utc,
    )
