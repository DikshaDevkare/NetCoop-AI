# NetCoop AI — Multi-Agent Network Fault Diagnosis & Interoperability System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-EB5424.svg)](https://xgboost.readthedocs.io)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg)](https://www.sqlalchemy.org)
[![Tests](https://img.shields.io/badge/Pytest-178%20Passed-brightgreen.svg)](backend/tests)

**NetCoop AI** is an intelligent, multi-agent network fault diagnosis and interoperability platform engineered for campus networks. It solves the critical problem of diagnosing intermittent network performance degradations by bridging heterogeneous telemetry, distributed machine learning inference, cross-domain agent reasoning, and evidence-linked operational recommendations.

---

## Key Highlights

- **5-Agent Autonomous Collaboration**:
  - `Telemetry & Performance Agent`: Ingests time-series metrics, detecting throughput, latency, and buffer saturation anomalies.
  - `Infrastructure Health Agent`: Monitors physical switch/router CPU, memory, chassis temperatures, and interface CRC/frame errors.
  - `Connectivity Analysis Agent`: Evaluates DNS latency, DHCP leases, gateway reachability, and 802.11 Wi-Fi RSSI signal quality.
  - `Fault Correlation Agent`: Correlates findings, resolves cross-domain conflicts, and synthesizes root-cause hypotheses.
  - `Recommendation & Reporting Agent`: Generates prioritized, actionable mitigation runbooks with explicit CLI commands.
- **Dual-Engine Machine Learning**:
  - **Unsupervised Anomaly Detection**: Isolation Forest (18 standardized features) establishing healthy network baselines.
  - **Supervised Fault Classification**: 7-class XGBoost classifier predicting exact failure modalities with continuous uncertainty scoring.
  - **Deterministic Temporal Trajectory**: Rate-of-change (ROC) gradient analysis detecting `worsening`, `recovering`, and `persistent_saturation` trends.
- **Campus Topology Awareness**:
  - Automatically scopes incidents into `device_local`, `segment_wide` (VLAN/subnet), or `shared_infrastructure` (core upstream bottlenecks).
- **Production-Ready FastAPI Backend**:
  - 10 REST routers covering `/api/diagnosis`, `/api/devices`, `/api/incidents`, `/api/telemetry`, `/api/reports`, and `/api/system/status`.
  - Built-in CORS support for React/Vite (`http://localhost:5173`).
  - Relational persistence with SQLAlchemy (SQLite default, PostgreSQL ready).
  - 100% test coverage with **178 automated tests** passing across all 12 hackathon scenarios.

---

## Architecture

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

## Repository Structure

```
NetCoop-AI/
├── backend/
│   ├── app/                         # FastAPI Application Package
│   │   ├── main.py                  # App entry point, CORS, and router registration
│   │   ├── config.py                # Pydantic Settings & environment variables
│   │   ├── api/                     # REST API route handlers
│   │   │   ├── health.py            # /, /api/health, /api/system/status
│   │   │   ├── diagnosis.py         # /api/diagnosis (run, history, get by ID)
│   │   │   ├── devices.py           # /api/devices (list, detail, telemetry, incidents)
│   │   │   ├── incidents.py         # /api/incidents (list, detail, findings, recommendations)
│   │   │   ├── telemetry.py         # /api/telemetry (ingest, batch, upload CSV/JSON)
│   │   │   ├── reports.py           # /api/reports (export JSON, CSV)
│   │   │   └── protocol.py          # /api/protocol/validate
│   │   ├── core/                    # Logging, exceptions, error envelope
│   │   ├── db/                      # SQLAlchemy persistence (session, 8 models, repository)
│   │   ├── schemas/                 # Pydantic validation schemas & Interoperability Protocol v1.0
│   │   └── services/                # Ingestion, Orchestrator, Topology Service
│   ├── agents/                      # 5 Specialized Domain Agents
│   │   ├── infrastructure_health/   # CPU, memory, thermals, uptime, interface errors
│   │   ├── connectivity/            # DNS, DHCP, gateway reachability, Wi-Fi RSSI
│   │   ├── telemetry_performance/   # Latency, jitter, loss, bandwidth, queues
│   │   ├── fault_correlation/       # Hypothesis generation, conflict resolution
│   │   └── recommendation_reporting/# Evidence-linked actionable runbooks
│   ├── ml/                          # Machine Learning Subsystems
│   │   ├── anomaly_detection/       # Scikit-Learn Isolation Forest & training pipeline
│   │   ├── fault_classification/    # XGBoost 7-class supervised classifier
│   │   └── temporal_analysis/       # Deterministic trend & trajectory analyzer
│   ├── tests/                       # 178 Automated Pytest Test Suite
│   │   ├── test_scenarios/          # All 12 problem statement scenario tests
│   │   ├── test_agents/             # 5-agent unit & integration tests
│   │   ├── test_anomaly_detection/  # Isolation forest tests
│   │   ├── test_fault_classification/# XGBoost classifier tests
│   │   ├── test_temporal_analysis/  # Temporal analyzer tests
│   │   ├── test_diagnosis_api/      # Diagnosis REST API tests
│   │   ├── test_devices_api/        # Devices API tests
│   │   ├── test_incidents_api/      # Incidents API tests
│   │   ├── test_telemetry_api/      # Telemetry ingestion & upload tests
│   │   ├── test_reports_api/        # Reports API tests
│   │   ├── test_topology/           # Campus topology service tests
│   │   └── test_protocol/           # Protocol v1.0 schema tests
│   ├── docs/                        # Complete System Documentation
│   │   ├── backend_handoff.md       # Comprehensive architecture, endpoints, runbook
│   │   ├── frontend_integration_guide.md # TypeScript interfaces, fetch examples, CORS
│   │   ├── scenario_validation_report.md # Detailed validation report for 12 scenarios
│   │   ├── anomaly_detection.md     # Isolation Forest ML docs
│   │   ├── dataset_engineering.md   # Dataset schema & preparation
│   │   ├── interoperability_protocol.md # Protocol v1.0 specification
│   │   └── orchestration_architecture.md# Orchestrator & agent interactions
│   └── requirements.txt             # Python dependencies
├── README.md                        # Root Project Overview
└── netcoop.db                       # Default SQLite Database
```

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Git

### 2. Setup & Virtual Environment

```bash
# Clone the repository
git clone https://github.com/your-org/NetCoop-AI.git
cd NetCoop-AI/backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\Activate.ps1

# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Launch Development Server

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **System Status**: [http://127.0.0.1:8000/api/system/status](http://127.0.0.1:8000/api/system/status)

### 4. Run Automated Tests

```bash
# Execute all 178 tests:
pytest tests -v

# Execute only the 12 hackathon scenario validations:
pytest tests/test_scenarios/test_scenario_validation.py -v
```

---

## Documentation Links

- [Backend Handoff & Developer Guide](backend/docs/backend_handoff.md)
- [Frontend Integration Guide](backend/docs/frontend_integration_guide.md)
- [Scenario Validation Report (12 Scenarios)](backend/docs/scenario_validation_report.md)
- [Multi-Agent Orchestration Architecture](backend/docs/orchestration_architecture.md)
- [Interoperability Protocol Specification (v1.0)](backend/docs/interoperability_protocol.md)
- [Isolation Forest Anomaly Detection Documentation](backend/docs/anomaly_detection.md)

---

## License

Developed for the NetCoop AI Hackathon. Released under the MIT License.
