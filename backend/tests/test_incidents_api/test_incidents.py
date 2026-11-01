"""
Integration tests for Incidents API endpoints.
"""

from fastapi.testclient import TestClient
import pytest
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_incident_lifecycle_and_endpoints(client: TestClient) -> None:
    # 1. Trigger diagnosis to generate an incident record
    diag_res = client.post(
        "/api/diagnosis/analyze",
        json={
            "incident_id": "INC-TEST-INCIDENTS-01",
            "telemetry_records": [
                {
                    "device_id": "SW-DIST-INC-01",
                    "device_type": "switch",
                    "latency_ms": 210.0,
                    "packet_loss_pct": 5.0,
                    "jitter_ms": 35.0,
                    "throughput_mbps": 960.0,
                    "bandwidth_utilization_pct": 97.0,
                    "queue_drops": 450,
                    "interface_errors": 0,
                    "retransmissions": 80,
                }
            ],
        },
    )
    assert diag_res.status_code == 200

    # 2. List incidents
    res = client.get("/api/incidents")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(i["incident_id"] == "INC-TEST-INCIDENTS-01" for i in data["incidents"])

    # 3. Get single incident
    res_single = client.get("/api/incidents/INC-TEST-INCIDENTS-01")
    assert res_single.status_code == 200
    inc_data = res_single.json()
    assert inc_data["incident_id"] == "INC-TEST-INCIDENTS-01"
    assert "SW-DIST-INC-01" in inc_data["affected_devices"]

    # 4. Get incident findings
    res_findings = client.get("/api/incidents/INC-TEST-INCIDENTS-01/findings")
    assert res_findings.status_code == 200
    findings = res_findings.json()
    assert isinstance(findings, list)

    # 5. Get incident recommendations
    res_recs = client.get("/api/incidents/INC-TEST-INCIDENTS-01/recommendations")
    assert res_recs.status_code == 200
    recs = res_recs.json()
    assert isinstance(recs, list)
    assert len(recs) >= 1


def test_get_incident_not_found(client: TestClient) -> None:
    res = client.get("/api/incidents/NON-EXISTENT-INC-999")
    assert res.status_code == 404
