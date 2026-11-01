# NetCoop AI — Backend Service & Multi-Agent Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![Pytest](https://img.shields.io/badge/Pytest-178%20Passed-brightgreen.svg)](tests)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg)](app/db)

## 1. Service Overview

The **NetCoop AI Backend** powers the multi-agent network fault diagnosis and interoperability platform. It coordinates five specialized agents, two machine learning inference engines, a temporal trend analyzer, a campus topology scoping engine, and an 8-table relational persistence store to diagnose intermittent campus network anomalies in real time.

### 5 Specialized Diagnostic Agents
1. **Telemetry & Performance Agent**: Detects latency spikes, buffer saturation, jitter, and bandwidth exhaustion. Emits baseline nominal findings for healthy traffic.
2. **Infrastructure Health Agent**: Monitors switch/router CPU utilization, RAM usage, internal chassis temperatures, uptime reloads, and interface CRC/frame errors.
3. **Connectivity Analysis Agent**: Evaluates L3/L4 reachability, DNS query latencies, DHCP leases, and 802.11 Wi-Fi RSSI levels.
4. **Fault Correlation Agent**: Correlates multi-agent findings, resolves conflicts (prioritizing empirical domain breaches over ambiguous statistical predictions), and synthesizes root-cause hypotheses.
5. **Recommendation & Reporting Agent**: Formulates prioritized corrective action runbooks with explicit CLI commands and links every recommendation to supporting evidence IDs.

---

## 2. Technology Stack

- **Framework**: FastAPI (Async ASGI, OpenAPI Swagger / ReDoc)
- **Language**: Python 3.11+
- **Database & ORM**: SQLAlchemy 2.0 (SQLite default `sqlite:///./netcoop.db`, PostgreSQL compatible)
- **Machine Learning**: Scikit-Learn 1.4+, XGBoost 2.0+, NumPy, Pandas, Joblib
- **Validation**: Pydantic v2 (Canonical Schemas & Interoperability Protocol v1.0)
- **Server**: Uvicorn (ASGI)
- **Testing**: Pytest, HTTPX, AnyIO

---

## 3. Directory Layout

```
backend/
├── app/
│   ├── main.py                  # FastAPI app factory, lifespan, CORS & router registration
│   ├── config.py                # Environment configuration (Pydantic Settings)
│   ├── api/                     # REST API routers
│   │   ├── health.py            # /, /api/health, /api/system/status
│   │   ├── diagnosis.py         # /api/diagnosis/run, /history, /{id}, /{id}/report
│   │   ├── devices.py           # /api/devices, /{id}, /{id}/telemetry, /{id}/incidents
│   │   ├── incidents.py         # /api/incidents, /{id}, /{id}/findings, /{id}/recommendations
│   │   ├── telemetry.py         # /api/telemetry/ingest, /batch, /upload
│   │   ├── reports.py           # /api/reports/diagnosis/{id}/json, /csv
│   │   └── protocol.py          # /api/protocol/validate
│   ├── core/                    # Logging configuration and JSON error envelope
│   ├── db/                      # Persistence layer
│   │   ├── session.py           # Engine & SessionLocal factory
│   │   ├── models.py            # 8 SQLAlchemy models (devices, incidents, telemetry, findings, diagnoses, etc.)
│   │   └── repository.py        # Database CRUD operations
│   ├── schemas/                 # Canonical Pydantic schemas (Protocol v1.0, diagnosis, telemetry)
│   └── services/                # Business logic
│       ├── ingestion/           # Telemetry normalizer & alias resolver
│       ├── orchestration/       # MultiAgentOrchestrator coordination engine
│       └── topology.py          # CampusTopologyService (device_local, segment_wide, shared_infrastructure)
│
├── agents/                      # 5 Specialized Domain Agents
│   ├── base.py                  # BaseAgent interface & message envelope
│   ├── infrastructure_health/   # CPU, RAM, temp, uptime, interface rules
│   ├── connectivity/            # DNS, DHCP, gateway, Wi-Fi RSSI rules
│   ├── telemetry_performance/   # Latency, loss, jitter, bandwidth rules
│   ├── fault_correlation/       # CorrelationEngine & ConflictResolver
│   └── recommendation_reporting/# RecommendationEngine & ReportBuilder
│
├── ml/                          # Machine Learning Pipelines & Artifacts
│   ├── anomaly_detection/       # Isolation Forest pipeline & trained model
│   ├── fault_classification/    # XGBoost 7-class classifier & pipeline
│   └── temporal_analysis/       # Deterministic rate-of-change trajectory analyzer
│
├── tests/                       # 178 Automated Tests
│   ├── conftest.py              # Test configuration & path setup
│   ├── test_scenarios/          # 12 Hackathon problem statement scenarios
│   ├── test_agents/             # 5 agent unit & integration tests
│   ├── test_diagnosis_api/      # Diagnosis endpoints tests
│   ├── test_devices_api/        # Devices endpoints tests
│   ├── test_incidents_api/      # Incidents endpoints tests
│   ├── test_telemetry_api/      # Telemetry ingest & upload tests
│   ├── test_reports_api/        # Report export tests
│   ├── test_topology/           # Campus topology scoping tests
│   ├── test_anomaly_detection/  # Isolation forest tests
│   ├── test_fault_classification/# XGBoost classifier tests
│   ├── test_temporal_analysis/  # Temporal analyzer tests
│   └── test_protocol/           # Protocol v1.0 schema tests
│
├── docs/                        # Complete System Documentation
│   ├── backend_handoff.md       # Complete architecture, workflow, runbook
│   ├── frontend_integration_guide.md # TypeScript interfaces, fetch examples, CORS
│   ├── scenario_validation_report.md # Validation report for 12 scenarios
│   ├── anomaly_detection.md     # Isolation Forest ML docs
│   ├── dataset_engineering.md   # Dataset schema & preparation
│   ├── interoperability_protocol.md # Protocol v1.0 specification
│   └── orchestration_architecture.md# Orchestrator & agent interactions
│
├── requirements.txt             # Production & testing dependencies
├── .env.example                 # Environment configuration template
└── README.md                    # This file
```

---

## 4. API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Root / Welcome |
| `GET` | `/api/health` | Health Check Probe |
| `GET` | `/api/system/status` | Complete Subsystems Status (ML models, DB) |
| `POST` | `/api/diagnosis/run` | Execute synchronous 5-agent diagnosis |
| `GET` | `/api/diagnosis/history` | List previous diagnoses (`?limit=50&offset=0`) |
| `GET` | `/api/diagnosis/{id}` | Retrieve specific diagnosis report |
| `GET` | `/api/diagnosis/{id}/report` | Markdown-formatted diagnostic report |
| `GET` | `/api/devices` | List registered campus network devices |
| `GET` | `/api/devices/{id}` | Get detailed device attributes |
| `GET` | `/api/devices/{id}/telemetry` | Recent time-series telemetry records |
| `GET` | `/api/devices/{id}/incidents` | Incidents associated with device |
| `GET` | `/api/incidents` | List all network incidents |
| `GET` | `/api/incidents/{id}` | Incident details & diagnosis |
| `GET` | `/api/incidents/{id}/findings` | Raw agent findings for incident |
| `GET` | `/api/incidents/{id}/recommendations` | Mitigations for incident |
| `POST` | `/api/telemetry/ingest` | Ingest single standardized telemetry record |
| `POST` | `/api/telemetry/batch` | Ingest list of telemetry records |
| `POST` | `/api/telemetry/upload` | Upload `.csv` or `.json` telemetry file (max 10MB) |
| `GET` | `/api/reports/diagnosis/{id}/json` | Export diagnosis report as JSON |
| `GET` | `/api/reports/diagnosis/{id}/csv` | Export agent findings as CSV table |
| `POST` | `/api/protocol/validate` | Validate standard agent message envelope |

---

## 5. Getting Started

### 5.1 Installation

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 5.2 Running the Application

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Alternative Docs: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 5.3 Running the Test Suite

```powershell
# Full test suite (178 tests):
.\venv\Scripts\pytest tests -v

# Scenario validation suite (12 scenarios):
.\venv\Scripts\pytest tests/test_scenarios/test_scenario_validation.py -v
```

---

## 6. Frontend Integration

The backend is configured with CORS enabled for `http://localhost:5173` and `http://127.0.0.1:5173` (Vite dev server default).
For full TypeScript typings, component hooks, and API calling examples, see [Frontend Integration Guide](docs/frontend_integration_guide.md).
