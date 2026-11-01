"""
Integration tests for Device Inventory API endpoints.
"""

from fastapi.testclient import TestClient
import pytest
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_list_devices_endpoint(client: TestClient) -> None:
    # First ingest telemetry to ensure at least one device is in inventory
    client.post(
        "/api/telemetry/ingest",
        json={
            "device_id": "SW-CORE-TEST-01",
            "device_type": "switch",
            "latency_ms": 15.0,
            "packet_loss_pct": 0.0,
        },
    )
    res = client.get("/api/devices")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "devices" in data
    assert data["total"] >= 1
    assert any(d["device_id"] == "SW-CORE-TEST-01" for d in data["devices"])


def test_get_device_detail_success(client: TestClient) -> None:
    res = client.get("/api/devices/SW-CORE-TEST-01")
    assert res.status_code == 200
    data = res.json()
    assert data["device_id"] == "SW-CORE-TEST-01"
    assert "network_segment" in data


def test_get_device_detail_not_found(client: TestClient) -> None:
    res = client.get("/api/devices/NON-EXISTENT-DEVICE-999")
    assert res.status_code == 404


def test_get_device_telemetry(client: TestClient) -> None:
    res = client.get("/api/devices/SW-CORE-TEST-01/telemetry")
    assert res.status_code == 200
    data = res.json()
    assert data["device_id"] == "SW-CORE-TEST-01"
    assert data["total"] >= 1
    assert len(data["telemetry"]) >= 1


def test_get_device_incidents(client: TestClient) -> None:
    res = client.get("/api/devices/SW-CORE-TEST-01/incidents")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
