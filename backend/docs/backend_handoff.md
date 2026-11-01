# NetCoop AI — Backend Handoff & Developer Guide
**Complete Architecture, API Reference, ML Specification, and Operational Runbook**

---

## 1. System Architecture Overview

NetCoop AI is a multi-agent network fault diagnosis and interoperability system engineered for campus environments. It bridges heterogeneous network telemetry, distributed machine learning inference, cross-domain agent reasoning, and real-time operational persistence.

```
                      +----------------------------------------+
                      |       Heterogeneous Telemetry          |
                      |   (Routers, Switches, APs, Firewalls)  |
                      +-------------------+--------------------+
                                          |
                                          v
                      +----------------------------------------+
                      |   Ingestion & Normalization Service    |
                      |    - Alias Mapping & Schema Cleaning   |
                      |    - UTC Timestamp Standardization     |
                      |    - Missing Metric Imputation         |
                      +-------------------+--------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
        +-------------------------------+   +-------------------------------+
        |    Machine Learning Signals   |   |     Campus Topology Service   |
        | - Isolation Forest (Outliers) |   | - Device-Local                |
        | - XGBoost (7-Class Classifier)|   | - Segment-Wide                |
        | - Temporal Trajectory Analysis|   | - Shared Infrastructure       |
        +---------------+---------------+   +---------------+---------------+
                        |                                   |
                        +-----------------+-----------------+
                                          |
                                          v
                      +----------------------------------------+
                      |       Multi-Agent Orchestrator         |
                      |                                        |
                      |  1. Infrastructure Health Agent        |
                      |  2. Connectivity Analysis Agent        |
                      |  3. Telemetry & Performance Agent      |
                      |  4. Fault Correlation Agent            |
                      |     (Conflict Resolution Engine)       |
                      |  5. Recommendation & Reporting Agent   |
                      +-------------------+--------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
        +-------------------------------+   +-------------------------------+
        |     Relational Persistence    |   |     FastAPI REST Gateway      |
        |  (SQLAlchemy 8-Table Store)   |   |  - /api/diagnosis/*           |
        |  - devices, incidents, etc.   |   |  - /api/devices/*, incidents  |
        |  - SQLite / PostgreSQL        |   |  - /api/telemetry/*, reports  |
        +-------------------------------+   +---------------+---------------+
                                                            |
                                                            v
                                            +-------------------------------+
                                            |   React + TypeScript Frontend |
                                            |   (Vite @ http://localhost:5173)|
                                            +-------------------------------+
```

---

## 2. End-to-End Diagnostic Workflow

Each diagnostic request progresses through seven discrete, observable stages:

1. **Ingestion & Normalization**:
   - Accepts raw JSON payloads, batch arrays, or multipart CSV uploads.
   - Standardizes legacy keys (`cpu_utilization_pct` -> `cpu_usage_pct`, `latency` -> `latency_ms`).
   - Normalizes metric units and fills missing attributes with safe domain-aware baseline values.
2. **Machine Learning Feature Extraction & Parallel Inference**:
   - `IsolationForest`: Computes unsupervised anomaly score `[-0.5, 0.5]` and binary label (`1` normal, `-1` anomaly).
   - `XGBoost`: Generates class probabilities across 7 canonical fault classes:
     - `0: Normal Operation`
     - `1: Network Bandwidth Congestion`
     - `2: Upstream Transit Latency Spike`
     - `3: Physical Interface Errors`
     - `4: Hardware / CPU Exhaustion`
     - `5: DNS / DHCP Service Failure`
     - `6: Wireless Signal Degradation`
   - Computes prediction uncertainty score based on entropy / margin between top two predicted classes.
3. **Temporal Trajectory Analysis**:
   - Analyzes chronological observation windows (minimum 3 records, optimal 5-10 records).
   - Computes rate-of-change (ROC) gradients across latency, packet loss, and queue drops.
   - Classifies trajectory: `worsening`, `recovering`, `persistent_saturation`, `intermittent_spikes`, or `stable_healthy`.
4. **Topology Scoping**:
   - Computes unique device and network segment cardinality.
   - Determines scope: `device_local` (single device), `segment_wide` (multiple devices in 1 VLAN/subnet), or `shared_infrastructure` (failures across core/distribution/access tiers).
5. **Specialized Agent Parallel Evaluation**:
   - **Infrastructure Health Agent**: Analyzes CPU, memory, internal temperatures, device uptime reloads, and interface CRC/frame errors. Emits `INFORMATIONAL` healthy baseline findings when nominal.
   - **Connectivity Analysis Agent**: Evaluates DNS query latencies, DHCP status, gateway reachability, and 802.11 Wi-Fi RSSI. Emits `INFORMATIONAL` healthy baseline findings when nominal.
   - **Telemetry & Performance Agent**: Evaluates bandwidth utilization, queue drops, TCP retransmissions, jitter, and transit latency. Emits `INFORMATIONAL` healthy baseline findings when nominal.
6. **Cross-Domain Correlation & Conflict Resolution**:
   - Fault Correlation Agent merges empirical agent findings, ML predictions, and temporal trajectory.
   - Resolves conflicts: empirical domain agent breaches (e.g. RSSI <= -80 dBm or interface errors > 50) take precedence over ambiguous ML statistical inferences.
   - Synthesizes primary root-cause hypothesis, secondary alternatives, and evidence explanation.
7. **Evidence-Linked Action Recommendations & Persistence**:
   - Recommendation Agent generates prioritized corrective actions with specific CLI/runbook mitigation commands.
   - Every recommendation directly links to `supporting_evidence_ids`.
   - Results are persisted to SQLite/PostgreSQL across 8 normalized relational tables.

---

## 3. Machine Learning Models & Capabilities

### 3.1 Model Artifacts

| Model Type | File Path | Framework | Key Inputs | Output |
|---|---|---|---|---|
| **Unsupervised Outlier Detector** | `backend/ml/anomaly_detection/models/isolation_forest.joblib` | Scikit-Learn 1.4+ | 18 normalized telemetry features | Anomaly Score `[-0.5, 0.5]`, Binary Flag (`1`/`-1`) |
| **Supervised Root-Cause Classifier** | `backend/ml/fault_classification/models/xgboost_classifier.joblib` | XGBoost / Scikit-Learn | 18 telemetry features + engineered ratios | 7-Class Probability Distribution, Predicted Class |
| **Deterministic Temporal Analyzer** | `backend/ml/temporal_analysis/trend_analyzer.py` | NumPy / SciPy | Chronological time-series records | Trend Classification, ROC Slopes, Volatility |

### 3.2 Feature Set (18 Standard Features)
1. `latency_ms`
2. `packet_loss_pct`
3. `jitter_ms`
4. `throughput_mbps`
5. `bandwidth_utilization_pct`
6. `cpu_usage_pct`
7. `memory_usage_pct`
8. `device_uptime_seconds`
9. `temperature_celsius`
10. `dns_response_time_ms`
11. `queue_drops`
12. `interface_errors`
13. `retransmissions`
14. `wireless_signal_strength_dbm`
15. `gateway_ping_ms`
16. `dhcp_status` (numeric encoded: 1.0 = success, 0.0 = timeout/failed)
17. `tcp_retransmissions`
18. `buffer_utilization_pct`

### 3.3 What the Models Can and Cannot Do
- **Can Do**:
  - Detect unprecedented statistical anomalies via Isolation Forest even when symptoms don't match known signatures.
  - Discriminate accurately among 7 well-defined network failure categories.
  - Provide continuous confidence and uncertainty metrics to gauge diagnostic safety.
  - Correlate multi-step metric trends to detect escalating congestion or positive recovery.
- **Cannot Do**:
  - Models cannot divine external physical fiber cuts without packet loss or interface error signals.
  - Models cannot predict root causes with zero telemetry; in such cases, the system safely reports `Insufficient Telemetry` with `low` confidence.

---

## 4. Database Schema & Persistence

Database connection is managed via SQLAlchemy 2.0.
Default: `sqlite:///./netcoop.db` (zero configuration needed).
PostgreSQL: Set `DATABASE_URL=postgresql://user:pass@host:5432/dbname`.

### 4.1 Relational Tables (8 Entities)

1. **`devices`**:
   - `id` (VARCHAR PK), `device_type`, `ip_address`, `mac_address`, `segment_id`, `created_at`, `updated_at`.
2. **`network_segments`**:
   - `id` (VARCHAR PK), `name`, `cidr_block`, `vlan_id`, `description`, `created_at`.
3. **`incidents`**:
   - `id` (VARCHAR PK), `title`, `status` (`OPEN`, `INVESTIGATING`, `RESOLVED`, `CLOSED`), `severity` (`CRITICAL`, `MAJOR`, `MINOR`, `INFORMATIONAL`), `device_id`, `created_at`, `updated_at`.
4. **`telemetry_records`**:
   - `id` (INTEGER PK), `device_id`, `incident_id`, `timestamp`, `metrics_json`, `created_at`.
5. **`agent_findings`**:
   - `id` (VARCHAR PK), `incident_id`, `diagnosis_id`, `agent_name`, `severity`, `title`, `description`, `confidence`, `metric_name`, `metric_value`, `threshold_value`, `evidence_json`, `created_at`.
6. **`diagnoses`**:
   - `id` (VARCHAR PK), `incident_id`, `status`, `primary_hypothesis`, `confidence`, `confidence_score`, `topology_scope`, `affected_device_count`, `full_report_json`, `created_at`.
7. **`recommendations`**:
   - `id` (VARCHAR PK), `diagnosis_id`, `incident_id`, `action_name`, `priority`, `target_device`, `command_snippet`, `automated`, `supporting_evidence_ids_json`, `created_at`.
8. **`model_predictions`**:
   - `id` (INTEGER PK), `incident_id`, `diagnosis_id`, `model_type`, `predicted_label`, `confidence_score`, `raw_probabilities_json`, `features_json`, `created_at`.

---

## 5. Complete REST API Reference

All endpoints are hosted under `http://127.0.0.1:8000`. Automatic OpenAPI documentation is available at `/docs` (Swagger) and `/redoc` (ReDoc).

### 5.1 System & Health

| Method | Path | Description | Query / Body | Response Status | Response Shape |
|---|---|---|---|---|---|
| `GET` | `/` | API Root / Welcome | None | `200 OK` | `{"name": "...", "version": "...", "status": "running"}` |
| `GET` | `/api/health` | Liveness & Readiness probe | None | `200 OK` | `{"status": "healthy", "service": "...", "version": "..."}` |
| `GET` | `/api/system/status` | Complete subsystems status | None | `200 OK` | `{"status": "operational", "ml_models": {...}, "database": {...}}` |

### 5.2 Diagnostic Orchestration

| Method | Path | Description | Query / Body | Response Status |
|---|---|---|---|---|
| `POST` | `/api/diagnosis/run` | Execute synchronous 5-agent diagnosis | Body: `DiagnosisRequest` (telemetry list, incident_id, incident_type) | `200 OK` (Full `DiagnosisResponse`) |
| `GET` | `/api/diagnosis/history` | List previous diagnoses | `?limit=50&offset=0` | `200 OK` (`[{"diagnosis_id": "...", ...}]`) |
| `GET` | `/api/diagnosis/{id}` | Retrieve specific diagnosis report | Path: `id` | `200 OK` (`DiagnosisResponse`) |
| `GET` | `/api/diagnosis/{id}/report`| Markdown-formatted text report | Path: `id` | `200 OK` (`text/markdown`) |

### 5.3 Devices Management

| Method | Path | Description | Query / Body | Response Status |
|---|---|---|---|---|
| `GET` | `/api/devices` | List registered campus network devices | `?device_type=&segment_id=` | `200 OK` (`[DeviceSummary]`) |
| `GET` | `/api/devices/{id}` | Get detailed device attributes | Path: `id` | `200 OK` (`DeviceDetail`) |
| `GET` | `/api/devices/{id}/telemetry` | Recent time-series telemetry records | `?limit=100` | `200 OK` (`[TelemetryRecord]`) |
| `GET` | `/api/devices/{id}/incidents` | Incident history for device | None | `200 OK` (`[IncidentSummary]`) |

### 5.4 Incidents & Findings

| Method | Path | Description | Query / Body | Response Status |
|---|---|---|---|---|
| `GET` | `/api/incidents` | List all network incidents | `?status=&severity=&limit=50` | `200 OK` (`[IncidentSummary]`) |
| `GET` | `/api/incidents/{id}` | Get incident details & diagnosis | Path: `id` | `200 OK` (`IncidentDetail`) |
| `GET` | `/api/incidents/{id}/findings` | Raw agent findings for incident | Path: `id` | `200 OK` (`[AgentFinding]`) |
| `GET` | `/api/incidents/{id}/recommendations` | Mitigations for incident | Path: `id` | `200 OK` (`[ActionRecommendation]`) |

### 5.5 Telemetry Ingestion & File Uploads

| Method | Path | Description | Query / Body | Response Status |
|---|---|---|---|---|
| `POST` | `/api/telemetry/ingest` | Ingest single standardized telemetry record | Body: `TelemetryRecord` | `200 OK` (`{"status": "ingested", "id": 1}`) |
| `POST` | `/api/telemetry/batch` | Ingest list of telemetry records | Body: `List[TelemetryRecord]` | `200 OK` (`{"status": "ingested", "count": N}`) |
| `POST` | `/api/telemetry/upload` | Upload `.csv` or `.json` telemetry file (max 10MB) | `multipart/form-data`: `file`, `trigger_diagnosis: bool` | `200 OK` (`UploadResponse` + optional diagnosis) |

### 5.6 Reports & Data Export

| Method | Path | Description | Query / Body | Response Status |
|---|---|---|---|---|
| `GET` | `/api/reports/diagnosis/{id}/json` | Export full diagnosis JSON | Path: `id` | `200 OK` (`application/json`) |
| `GET` | `/api/reports/diagnosis/{id}/csv` | Export agent findings as CSV table | Path: `id` | `200 OK` (`text/csv`) |

### 5.7 Interoperability Protocol Validation

| Method | Path | Description | Query / Body | Response Status |
|---|---|---|---|---|
| `POST` | `/api/protocol/validate` | Validate standard agent message envelope | Body: `AgentMessage` | `200 OK` (`{"valid": true}`) |

---

## 6. Frontend Integration & CORS Setup

The backend is pre-configured with CORS middleware allowing communication from:
- `http://localhost:5173` (Vite dev server default)
- `http://127.0.0.1:5173`
- Custom origins configured via `ALLOWED_ORIGINS` in `.env`.

### 6.1 Quickstart Frontend Connection (TypeScript)

```typescript
const BACKEND_URL = "http://127.0.0.1:8000";

// Run real-time diagnosis
export async function runDiagnosis(telemetryData: any[], incidentId?: string) {
  const response = await fetch(`${BACKEND_URL}/api/diagnosis/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telemetry: telemetryData,
      incident_id: incidentId || `INC-${Date.now()}`,
      incident_type: "NETWORK_CONGESTION"
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Diagnosis failed");
  }
  return await response.json();
}
```

For the complete TypeScript schema definitions and UI component mapping, refer to:
[Frontend Integration Guide](file:///c:/Users/Srushti/OneDrive/Desktop/NetCoop-AI/backend/docs/frontend_integration_guide.md).

---

## 7. Developer Runbook & Operations

### 7.1 Prerequisites
- Python 3.11+
- Virtual environment at `backend/venv`

### 7.2 Activating Environment & Running Backend

```powershell
# In Windows PowerShell:
cd c:\Users\Srushti\OneDrive\Desktop\NetCoop-AI\backend
.\venv\Scripts\Activate.ps1

# Start FastAPI development server with hot-reload:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 7.3 Running Automated Tests

```powershell
# Run the entire test suite (178 tests):
.\venv\Scripts\pytest tests -v

# Run targeted scenario validation (12 scenarios):
.\venv\Scripts\pytest tests/test_scenarios/test_scenario_validation.py -v

# Run API endpoint tests:
.\venv\Scripts\pytest tests/test_diagnosis_api tests/test_devices_api tests/test_incidents_api -v
```

---

## 8. Live Demonstration Runbook (Hackathon Presentation)

Follow these steps for a live presentation of NetCoop AI:

### Demo Scenario A: Normal Healthy Baseline
Send nominal telemetry to verify the baseline:
```bash
curl -X POST http://127.0.0.1:8000/api/diagnosis/run \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "DEMO-01-HEALTHY",
    "telemetry": [{
      "device_id": "SW-CORE-01",
      "device_type": "switch",
      "latency_ms": 11.5,
      "packet_loss_pct": 0.0,
      "jitter_ms": 1.8,
      "throughput_mbps": 880.0,
      "bandwidth_utilization_pct": 32.0,
      "cpu_usage_pct": 24.0,
      "memory_usage_pct": 38.0,
      "temperature_celsius": 41.0,
      "dns_response_time_ms": 7.5,
      "queue_drops": 0,
      "interface_errors": 0
    }]
  }'
```
*Expected Result*: Status `HEALTHY`, Primary Hypothesis: `"Normal Operation (Healthy Baseline)"`, all 5 agents executed with Informational findings.

### Demo Scenario B: Bandwidth Congestion & Buffer Overflow
Inject traffic overload:
```bash
curl -X POST http://127.0.0.1:8000/api/diagnosis/run \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "DEMO-02-CONGESTION",
    "telemetry": [{
      "device_id": "SW-DIST-01",
      "device_type": "switch",
      "latency_ms": 240.0,
      "packet_loss_pct": 6.8,
      "jitter_ms": 42.0,
      "throughput_mbps": 985.0,
      "bandwidth_utilization_pct": 99.2,
      "queue_drops": 680,
      "retransmissions": 110
    }]
  }'
```
*Expected Result*: Status `CRITICAL`, Primary Hypothesis: `"Network Bandwidth Congestion & Buffer Overflow"`, actionable rate-limiting recommendations generated.

### Demo Scenario C: Multi-Device Core Shared Bottleneck
Inject telemetry for 3 devices affected by upstream saturation:
```bash
curl -X POST http://127.0.0.1:8000/api/diagnosis/run \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "DEMO-03-MULTI",
    "telemetry": [
      {"device_id": "RTR-CORE-01", "device_type": "router", "latency_ms": 350.0, "bandwidth_utilization_pct": 99.0, "queue_drops": 1200},
      {"device_id": "SW-DIST-01", "device_type": "switch", "latency_ms": 340.0, "bandwidth_utilization_pct": 92.0, "queue_drops": 800},
      {"device_id": "AP-DORM-01", "device_type": "access_point", "latency_ms": 360.0, "wireless_signal_strength_dbm": -62.0}
    ]
  }'
```
*Expected Result*: `affected_device_count: 3`, `is_shared_infrastructure_fault: true`, `topology_scope: "shared_infrastructure"`, root cause isolated to upstream `RTR-CORE-01`.
