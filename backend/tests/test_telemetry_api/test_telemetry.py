"""
Integration tests for Telemetry Ingestion API endpoints (ingest, batch, upload).
"""

from io import BytesIO
from fastapi.testclient import TestClient
import pytest
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_single_telemetry_ingest(client: TestClient) -> None:
    payload = {
        "device_id": "AP-DORM-TEST-01",
        "device_type": "access_point",
        "latency_ms": 18.0,
        "packet_loss_pct": 0.5,
        "wireless_signal_strength_dbm": -62.0,
    }
    res = client.post("/api/telemetry/ingest", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["records_ingested"] == 1


def test_batch_telemetry_ingest(client: TestClient) -> None:
    payload = {
        "incident_id": "INC-BATCH-TEST",
        "records": [
            {
                "device_id": "SW-1",
                "latency_ms": 10.0,
                "packet_loss_pct": 0.0,
            },
            {
                "device_id": "SW-2",
                "latency_ms": 12.0,
                "packet_loss_pct": 0.0,
            },
        ],
    }
    res = client.post("/api/telemetry/batch", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["records_ingested"] == 2


def test_csv_upload_telemetry(client: TestClient) -> None:
    csv_content = (
        "device_id,device_type,latency_ms,packet_loss_pct,jitter_ms\n"
        "SW-UPLOAD-01,switch,15.5,0.0,2.1\n"
        "SW-UPLOAD-02,switch,16.2,0.1,2.4\n"
    ).encode("utf-8")

    files = {"file": ("telemetry_data.csv", BytesIO(csv_content), "text/csv")}
    res = client.post("/api/telemetry/upload", files=files)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["records_ingested"] == 2


def test_json_upload_telemetry(client: TestClient) -> None:
    json_content = b'[{"device_id": "AP-JSON-01", "latency_ms": 22.0, "packet_loss_pct": 0.0}]'
    files = {"file": ("telemetry_data.json", BytesIO(json_content), "application/json")}
    res = client.post("/api/telemetry/upload", files=files)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["records_ingested"] == 1


def test_invalid_upload_extension(client: TestClient) -> None:
    files = {"file": ("malicious.exe", BytesIO(b"binary"), "application/octet-stream")}
    res = client.post("/api/telemetry/upload", files=files)
    assert res.status_code == 400
    data = res.json()
    msg = data.get("error", {}).get("message") or data.get("detail", "")
    assert "Unsupported file format" in msg
