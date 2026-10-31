"""
Centralized exception handling for NetCoop AI Backend.

Provides structured and consistent JSON error responses across all API endpoints,
safeguarding internal implementation details and logging server-side diagnostic information.
"""

import http
from typing import Any, Dict
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger("netcoop.exceptions")


def format_error_response(
    code: str,
    message: str,
    details: Any = None,
) -> Dict[str, Any]:
    """
    Generate a standardized JSON error envelope.

    Structure:
    {
        "success": false,
        "error": {
            "code": "<CODE>",
            "message": "<MESSAGE>",
            "details": ... (optional)
        }
    }
    """
    error_body: Dict[str, Any] = {
        "code": code,
        "message": message,
    }
    if details is not None:
        error_body["details"] = details

    return {
        "success": False,
        "error": error_body,
    }


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """
    Handle standard HTTP exceptions with consistent error JSON.
    Maps status codes to standardized string representations.
    """
    try:
        code_name = http.HTTPStatus(exc.status_code).name
    except ValueError:
        code_name = f"HTTP_{exc.status_code}"

    message = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    logger.warning("HTTP %d on %s: %s", exc.status_code, request.url.path, message)

    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(code=code_name, message=message),
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Handle incoming request validation errors.
    Returns structured error without crashing the server.
    """
    logger.warning("Validation error on %s: %s", request.url.path, exc.errors())
    settings = get_settings()
    details = jsonable_encoder(exc.errors()) if settings.DEBUG else None

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=format_error_response(
            code="VALIDATION_ERROR",
            message="Request validation failed.",
            details=details,
        ),
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Catch-all handler for unhandled server errors.

    Logs full diagnostic stack traces server-side while ensuring clients
    receive safe, non-leaking responses in production environments.
    """
    logger.exception("Unhandled server exception processing %s: %s", request.url.path, str(exc))

    settings = get_settings()
    # In production, never expose internal exception details to clients
    message = (
        f"Internal server error: {exc}"
        if (settings.DEBUG and settings.APP_ENV != "production")
        else "An unexpected error occurred."
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            code="INTERNAL_SERVER_ERROR",
            message=message,
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all application-level exception handlers with the FastAPI app."""
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
