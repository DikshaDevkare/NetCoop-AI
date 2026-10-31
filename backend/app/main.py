"""
Main FastAPI application entry point for NetCoop AI Backend.

Initializes the core FastAPI application using centralized configuration settings,
structured logging, environment-aware CORS middleware, centralized exception handling,
and modular router registrations.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.logging_config import setup_logging, get_logger
from app.core.exceptions import register_exception_handlers
from app.api.health import health_router, root_router
from app.api.protocol import protocol_router

logger = get_logger("netcoop.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager handling startup and shutdown events.
    Logs lifecycle milestones with appropriate configuration context.
    """
    settings = get_settings()
    setup_logging(settings.LOG_LEVEL)
    logger.info(
        "Starting %s v%s [Env: %s, Debug: %s]",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.APP_ENV,
        settings.DEBUG,
    )
    yield
    logger.info("Shutting down %s", settings.APP_NAME)


def create_application() -> FastAPI:
    """
    Application factory that initializes and configures the FastAPI application.

    Pulls application metadata from centralized settings, attaches CORS middleware,
    binds error handlers, and registers modular API routers.
    """
    settings = get_settings()

    # Pre-configure logging
    setup_logging(settings.LOG_LEVEL)

    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "NetCoop AI is a multi-agent network fault diagnosis and interoperability system. "
            "It correlates telemetry across heterogeneous network devices and segments to detect "
            "anomalies, orchestrates evidence collection among specialized agents, and generates "
            "explainable diagnostic reports."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    # 1. CORS Configuration
    # Safe credentials handling: Never combine wildcard origins with allow_credentials=True
    origins = settings.allowed_origins_list
    allow_credentials = False if "*" in origins else True

    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )

    # 2. Register centralized exception handlers
    register_exception_handlers(application)

    # 3. Router registrations
    # Welcome endpoint registered at root (/)
    application.include_router(root_router)
    # Health and diagnostic checks registered under configured prefix (/api/health)
    application.include_router(health_router, prefix=settings.API_PREFIX)
    # Interoperability protocol validation registered under configured prefix (/api/protocol)
    application.include_router(protocol_router, prefix=settings.API_PREFIX)

    return application


# Global application instance accessible for ASGI web servers (e.g., Uvicorn)
app: FastAPI = create_application()
