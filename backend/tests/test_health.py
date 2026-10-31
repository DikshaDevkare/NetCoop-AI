"""
Automated test suite for NetCoop AI Backend.

Verifies:
- Root welcome endpoint (GET /)
- Health-check endpoint (GET /api/health)
- 404 error handling and structured error envelopes
- CORS allowed vs disallowed origins and preflight requests
- Centralized exception handlers under development and production environments
"""

from datetime import datetime, timezone
import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app, create_application


@pytest.fixture
def client() -> TestClient:
    """Fixture providing a TestClient for the primary application."""
    return TestClient(app, raise_server_exceptions=False)


# ==============================================================================
# A. Root Endpoint Tests
# ==============================================================================

def test_root_endpoint_status_and_payload(client: TestClient) -> None:
    """Test that GET / returns HTTP 200 with expected welcome payload."""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["message"] == "Welcome to NetCoop AI Backend"
    assert data["status"] == "running"


# ==============================================================================
# B. Health Endpoint Tests
# ==============================================================================

def test_health_endpoint_metadata_and_timestamp(client: TestClient) -> None:
    """Test that GET /api/health returns HTTP 200 with valid metadata and UTC ISO timestamp."""
    settings = get_settings()
    response = client.get(f"{settings.API_PREFIX}/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["application"] == settings.APP_NAME
    assert data["version"] == settings.APP_VERSION
    assert data["environment"] == settings.APP_ENV

    # Verify timestamp format is valid ISO 8601 UTC
    timestamp_str = data["timestamp"]
    parsed_time = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    assert parsed_time.tzinfo is not None
    # Ensure timestamp is within the last 5 minutes of current UTC
    now_utc = datetime.now(timezone.utc)
    delta = abs((now_utc - parsed_time).total_seconds())
    assert delta < 300, f"Timestamp {timestamp_str} differs too much from now {now_utc}"


# ==============================================================================
# C. Invalid Endpoint Tests (404 Not Found)
# ==============================================================================

def test_invalid_endpoint_returns_structured_404(client: TestClient) -> None:
    """Test that accessing an unknown route returns HTTP 404 with standard error envelope."""
    response = client.get("/api/non-existent-route-404")
    assert response.status_code == 404

    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "Not Found" in data["error"]["message"]


# ==============================================================================
# D. CORS Behavior Tests
# ==============================================================================

def test_cors_allowed_origin(client: TestClient) -> None:
    """Test that requests from configured frontend origins receive CORS allow header."""
    settings = get_settings()
    allowed_origin = settings.allowed_origins_list[0]

    response = client.get("/", headers={"Origin": allowed_origin})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == allowed_origin


def test_cors_unapproved_origin(client: TestClient) -> None:
    """Test that requests from unapproved origins do not receive CORS allow header."""
    unapproved_origin = "http://untrusted-external-site.com"

    response = client.get("/", headers={"Origin": unapproved_origin})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") is None


def test_cors_preflight_options(client: TestClient) -> None:
    """Test preflight OPTIONS request from allowed frontend origin."""
    settings = get_settings()
    allowed_origin = settings.allowed_origins_list[0]

    response = client.options(
        f"{settings.API_PREFIX}/health",
        headers={
            "Origin": allowed_origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == allowed_origin
    assert "GET" in response.headers.get("access-control-allow-methods", "")


# ==============================================================================
# E. Exception Handling Tests
# ==============================================================================

def test_explicit_http_exception_structure() -> None:
    """Test that explicit HTTPExceptions return standardized JSON envelope."""
    test_app = create_application()

    @test_app.get("/test-forbidden")
    def forbidden_route():
        raise HTTPException(status_code=403, detail="Custom access denied message")

    custom_client = TestClient(test_app, raise_server_exceptions=False)
    response = custom_client.get("/test-forbidden")

    assert response.status_code == 403
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "FORBIDDEN"
    assert data["error"]["message"] == "Custom access denied message"


def test_unhandled_exception_safe_production_response(monkeypatch: pytest.MonkeyPatch) -> None:
    """Test that unhandled exceptions in production mode do not leak stack traces."""
    settings = get_settings()
    monkeypatch.setattr(settings, "DEBUG", False)
    monkeypatch.setattr(settings, "APP_ENV", "production")

    test_app = create_application()

    @test_app.get("/test-internal-error")
    def crashing_route():
        raise RuntimeError("Secret database connection string or sensitive trace")

    custom_client = TestClient(test_app, raise_server_exceptions=False)
    response = custom_client.get("/test-internal-error")

    assert response.status_code == 500
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INTERNAL_SERVER_ERROR"
    # Verify sensitive error text is obscured
    assert data["error"]["message"] == "An unexpected error occurred."
    assert "Secret database connection string" not in response.text
