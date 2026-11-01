"""
Integration tests for Reports API endpoints (JSON and CSV report exports).
"""

from fastapi.testclient import TestClient
import pytest
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_download_diagnosis_json_and_csv(client: TestClient) -> None:
    # 1. Run diagnosis to create a persisted record
    diag_res = client.post(
        "/api/diagnosis/analyze",
        json={
            "incident_id": "INC-REPORT-EXPORT-01",
            "telemetry_records": [
                {
                    "device_id": "SW-CORE-REP-01",
                    "device_type": "switch",
                    "latency_ms": 195.0,
                    "packet_loss_pct": 3.8,
                    "jitter_ms": 28.0,
                    "throughput_mbps": 950.0,
                    "bandwidth_utilization_pct": 92.0,
                    "queue_drops": 380,
                    "interface_errors": 0,
                    "retransmissions": 65,
                }
            ],
        },
    )
    assert diag_res.status_code == 200
    diag_id = diag_res.json()["diagnosis_id"]

    # 2. Download JSON report
    json_res = client.get(f"/api/reports/diagnosis/{diag_id}/json")
    assert json_res.status_code == 200
    assert json_res.headers["content-type"] == "application/json"
    assert "attachment; filename=" in json_res.headers["content-disposition"]
    data = json_res.json()
    assert data["incident_summary"]["incident_id"] == "INC-REPORT-EXPORT-01"

    # 3. Download CSV report
    csv_res = client.get(f"/api/reports/diagnosis/{diag_id}/csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "attachment; filename=" in csv_res.headers["content-disposition"]
    csv_text = csv_res.text
    assert "diagnosis_id" in csv_text
    assert "incident_id" in csv_text
    assert "INC-REPORT-EXPORT-01" in csv_text


def test_download_report_not_found(client: TestClient) -> None:
    res = client.get("/api/reports/diagnosis/DIAG-NON-EXISTENT/json")
    assert res.status_code == 404
    res_csv = client.get("/api/reports/diagnosis/DIAG-NON-EXISTENT/csv")
    assert res_csv.status_code == 404
