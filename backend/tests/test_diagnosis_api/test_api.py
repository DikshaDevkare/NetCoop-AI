"""
End-to-end integration and API tests for Diagnosis endpoints and regression checks.
"""

from fastapi.testclient import TestClient
import pytest

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_diagnosis_analyze_endpoint_success(client: TestClient) -> None:
    payload = {
        "incident_id": "INC-API-001",
        "telemetry_records": [
            {
                "device_id": "SW-CORE-01",
                "device_type": "switch",
                "latency_ms": 190.0,
                "packet_loss_pct": 3.5,
                "jitter_ms": 30.0,
                "throughput_mbps": 950.0,
                "bandwidth_utilization_pct": 94.0,
                "cpu_usage_pct": 45.0,
                "memory_usage_pct": 50.0,
                "queue_drops": 400,
                "interface_errors": 0,
                "retransmissions": 60,
            }
        ],
        "context": {"campus_zone": "Engineering Quad"},
    }

    response = client.post("/api/diagnosis/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify response schema fields
    assert "incident_summary" in data
    assert data["incident_summary"]["incident_id"] == "INC-API-001"
    assert "probable_root_cause" in data
    assert "Congestion" in data["probable_root_cause"]["primary_hypothesis"]
    assert "machine_learning_signals" in data
    assert "evidence_trail" in data
    assert "agent_findings" in data
    assert "recommended_corrective_actions" in data
    assert len(data["recommended_corrective_actions"]) > 0
    assert "uncertainty_and_limitations" in data
    assert "orchestration_metadata" in data
    assert data["orchestration_metadata"]["agents_executed_count"] == 5


def test_diagnosis_analyze_empty_telemetry_records(client: TestClient) -> None:
    payload = {
        "incident_id": "INC-API-EMPTY",
        "telemetry_records": [],
    }
    response = client.post("/api/diagnosis/analyze", json=payload)
    assert response.status_code == 422


def test_diagnosis_analyze_invalid_body(client: TestClient) -> None:
    response = client.post("/api/diagnosis/analyze", json={"foo": "bar"})
    assert response.status_code == 422


def test_get_registered_agents_endpoint(client: TestClient) -> None:
    response = client.get("/api/diagnosis/agents")
    assert response.status_code == 200
    data = response.json()
    assert data["total_agents"] == 5
    assert len(data["agents"]) == 5
    agent_ids = [a["agent_id"] for a in data["agents"]]
    assert "telemetry_performance" in agent_ids
    assert "infrastructure_health" in agent_ids
    assert "connectivity_analysis" in agent_ids
    assert "fault_correlation" in agent_ids
    assert "recommendation_reporting" in agent_ids


def test_get_registered_models_endpoint(client: TestClient) -> None:
    response = client.get("/api/diagnosis/models")
    assert response.status_code == 200
    data = response.json()
    assert data["total_models"] == 3
    assert len(data["models"]) == 3
    model_names = [m["name"] for m in data["models"]]
    assert "Isolation Forest Anomaly Detector" in model_names
    assert "XGBoost Multi-Class Fault Classifier" in model_names
    assert "Sequence Temporal Pattern Analyzer" in model_names


def test_get_system_status_endpoint(client: TestClient) -> None:
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["api_status"] == "healthy"
    assert data["database_status"] == "connected"
    assert data["protocol_version"] == "1.0"
    assert len(data["models"]) == 3
    assert len(data["agents"]) == 5


def test_diagnosis_history_and_detail_endpoints(client: TestClient) -> None:
    # 1. Trigger diagnosis
    payload = {
        "incident_id": "INC-HIST-01",
        "telemetry_records": [
            {
                "device_id": "SW-CORE-HIST-01",
                "device_type": "switch",
                "latency_ms": 190.0,
                "packet_loss_pct": 3.5,
                "jitter_ms": 30.0,
                "throughput_mbps": 950.0,
                "bandwidth_utilization_pct": 94.0,
                "cpu_usage_pct": 45.0,
                "memory_usage_pct": 50.0,
                "queue_drops": 400,
                "interface_errors": 0,
                "retransmissions": 60,
            }
        ],
    }
    diag_res = client.post("/api/diagnosis/analyze", json=payload)
    assert diag_res.status_code == 200
    diag_id = diag_res.json()["diagnosis_id"]

    # 2. Query history
    hist_res = client.get("/api/diagnosis/history?page=1&page_size=20")
    assert hist_res.status_code == 200
    data = hist_res.json()
    assert data["total"] >= 1
    assert any(item["diagnosis_id"] == diag_id for item in data["items"])

    # 3. Query diagnosis detail
    rec_res = client.get(f"/api/diagnosis/{diag_id}")
    assert rec_res.status_code == 200
    assert rec_res.json()["diagnosis_id"] == diag_id

    # 4. Query diagnosis report
    rep_res = client.get(f"/api/diagnosis/{diag_id}/report")
    assert rep_res.status_code == 200
    assert rep_res.json()["incident_summary"]["incident_id"] == "INC-HIST-01"


def test_cors_preflight_headers(client: TestClient) -> None:
    response = client.options(
        "/api/diagnosis/analyze",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


# ==============================================================================
# Phase 1 and Phase 2 Regression Checks
# ==============================================================================

def test_regression_root_endpoint(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "NetCoop AI Backend" in data["message"]
    assert data["status"] == "running"


def test_regression_health_endpoint(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_regression_protocol_validate_endpoint(client: TestClient) -> None:
    payload = {
        "message_id": "MSG-REG-01",
        "protocol_version": "1.0",
        "sender": "telemetry_performance",
        "receiver": "fault_correlation",
        "message_type": "status",
        "timestamp": "2026-10-31T12:00:00Z",
        "correlation_id": "INC-REG-01",
        "payload": {
            "status": "idle",
            "message": "Operational readiness check",
        },
    }
    response = client.post("/api/protocol/validate", json=payload)
    assert response.status_code == 200
    assert response.json()["valid"] is True
