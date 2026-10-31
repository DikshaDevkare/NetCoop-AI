# NetCoop AI — Backend Service

## 1. Project Overview

**NetCoop AI** is a multi-agent network fault diagnosis and interoperability system. The backend architecture is designed to ingest telemetry across heterogeneous network segments and devices, correlate anomaly indicators, orchestrate evidence collection among specialized agents, and produce actionable, explainable diagnostic reports for network operations teams.

In its complete multi-agent architecture, the backend will coordinate five specialized agents:
1. **Telemetry & Performance Agent** — Ingests time-series network telemetry and flags throughput/latency/jitter anomalies.
2. **Infrastructure Health Agent** — Monitors CPU, memory, interface status, and physical link stability.
3. **Connectivity Analysis Agent** — Evaluates routing table convergence, reachability, and topology changes.
4. **Fault Correlation Agent** — Correlates cross-domain evidence to isolate probable root-cause failure points.
5. **Recommendation & Reporting Agent** — Generates human-understandable diagnostic summaries and mitigation workflows.

*Note: Phase 1 establishes the core FastAPI platform, reliability infrastructure, health endpoints, CORS, logging, exception handling, and automated test suite. Agent pipelines will be introduced in subsequent phases.*

---

## 2. Technology Stack

- **Python 3.11+**: Primary programming language offering type safety, high performance, and standard library richness.
- **FastAPI**: Modern, high-performance web framework for building REST APIs with automatic OpenAPI (Swagger UI and ReDoc) documentation.
- **Uvicorn**: Lightning-fast ASGI web server implementation powering asynchronous FastAPI execution.
- **Pydantic & Pydantic Settings**: Data validation, serialization, and type-safe environment configuration management with `.env` support.
- **Pytest & HTTPX**: Testing framework and ASGI HTTP client for automated unit and integration verification.

---

## 3. Folder Structure

```
backend/
├── app/
│   ├── __init__.py           # Application package marker
│   ├── main.py               # Application factory, lifespan, CORS & router registration
│   ├── config.py             # Centralized Pydantic Settings and environment defaults
│   │
│   ├── api/                  # REST API route modules
│   │   ├── __init__.py
│   │   └── health.py         # Welcome (/) and health check (/api/health) endpoints
│   │
│   ├── core/                 # Shared cross-cutting application infrastructure
│   │   ├── __init__.py
│   │   ├── logging_config.py # Structured, idempotent application logging system
│   │   └── exceptions.py     # Centralized exception handlers and JSON error envelope
│   │
│   └── services/             # Business logic layer (reserved for future agent services)
│       └── __init__.py
│
├── tests/                    # Automated test suite
│   ├── __init__.py
│   └── test_health.py        # Comprehensive endpoint, CORS, and error handling tests
│
├── requirements.txt          # Production and testing Python dependencies
├── .env.example              # Documented environment configuration template
├── .gitignore                # Git exclusions (virtualenvs, bytecode, secrets, caches)
└── README.md                 # Project documentation and developer runbook
```

### Module Responsibilities

- **`app/`**: Root package for the backend service.
- **`app/api/`**: Contains endpoint routers grouped by feature (health, and upcoming agent/telemetry APIs).
- **`app/core/`**: Houses shared infrastructure including configuration (`config.py`), logging (`logging_config.py`), and error envelopes (`exceptions.py`).
- **`app/services/`**: Encapsulates reusable business logic and future agent orchestrators.
- **`tests/`**: Contains pytest test cases ensuring regression-free development.

---

## 4. Prerequisites

- **Python**: Version 3.11 or higher installed. Verify with `python --version`.
- **pip**: Standard Python package manager.
- **Operating System**: Windows 10/11, Linux, or macOS.
- **Shell**: PowerShell or Command Prompt (Windows), Bash/Zsh (Linux/macOS).

---

## 5. Virtual Environment Setup

Open PowerShell or terminal, navigate to the `backend` directory, and create a dedicated virtual environment:

```powershell
cd backend
python -m venv venv
```

Activate the virtual environment:

**On Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**On Linux / macOS:**
```bash
source venv/bin/activate
```

---

## 6. Dependency Installation

With the virtual environment active, install all required dependencies:

```powershell
pip install -r requirements.txt
```

---

## 7. Environment Configuration

Create a local `.env` configuration file from the provided `.env.example` template:

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**On Linux / macOS:**
```bash
cp .env.example .env
```

### Configurable Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `APP_NAME` | Display name of the backend service | `NetCoop AI Backend` |
| `APP_VERSION` | Application semantic version | `0.1.0` |
| `APP_ENV` | Target environment (`development`, `staging`, `production`) | `development` |
| `DEBUG` | Enable verbose error traces and developer logging (`true`/`false`) | `true` |
| `API_PREFIX` | Prefix for versioned/scoped API endpoints | `/api` |
| `LOG_LEVEL` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | `INFO` |
| `ALLOWED_ORIGINS` | Permitted frontend origins for CORS (comma-separated if multiple) | `http://localhost:5173` |

---

## 8. Starting the Server

Ensure you are located in the `backend/` directory with the virtual environment activated, then run:

```powershell
uvicorn app.main:app --reload --port 8000
```

- `--reload`: Enables hot-reloading upon file changes (development only).
- `--port 8000`: Binds the ASGI server to port 8000 on localhost.

---

## 9. Interactive API Documentation

Once the server is running, explore the interactive documentation in your browser:

- **Swagger UI (OpenAPI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON Specification**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 10. Available Endpoints

### 1. Root Welcome Endpoint
- **URL**: `GET http://localhost:8000/`
- **Purpose**: Verifies that the NetCoop AI backend service is online and accepting connections.
- **Response (200 OK)**:
  ```json
  {
    "message": "Welcome to NetCoop AI Backend",
    "status": "running"
  }
  ```

### 2. Application Health Check Endpoint
- **URL**: `GET http://localhost:8000/api/health`
- **Purpose**: Returns application health status, service metadata, and real-time evaluation timestamp.
- **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "application": "NetCoop AI Backend",
    "version": "0.1.0",
    "environment": "development",
    "timestamp": "2026-10-31T22:28:00Z"
  }
  ```

### 3. Standardized Error Envelope
- **Status Codes**: 404, 422, 500, etc.
- **Response Structure**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Not Found"
    }
  }
  ```

---

## 11. Running Automated Tests

Run the full pytest suite with verbose output:

```powershell
pytest -v
```

All tests execute independently in-memory without requiring external databases or third-party web services.

---

## 12. Troubleshooting Guide

### 1. `python` or `pip` is not recognized
- **Cause**: Python is not added to the system `PATH`.
- **Solution**: Reinstall Python and ensure "Add Python to PATH" is checked, or use the full path to `python.exe`.

### 2. Virtual environment activation disabled (PowerShell ExecutionPolicy)
- **Cause**: Windows PowerShell restricts execution of unsigned scripts by default.
- **Solution**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in PowerShell, then retry activation.

### 3. `ModuleNotFoundError: No module named 'app'`
- **Cause**: The command was executed from the wrong directory.
- **Solution**: Ensure your active working directory is `backend/` before executing `uvicorn app.main:app --reload` or `pytest`.

### 4. Port 8000 already in use (`[Errno 10048] address already in use`)
- **Cause**: Another process or background server is currently bound to port 8000.
- **Solution**: Stop the conflicting process, or specify a different port:
  ```powershell
  uvicorn app.main:app --reload --port 8080
  ```

### 5. CORS origin mismatch when connecting frontend
- **Cause**: The React development server is running on a port different from `ALLOWED_ORIGINS` (e.g., Vite picked port 5174).
- **Solution**: Update `ALLOWED_ORIGINS` in `backend/.env` to include the active frontend origin (e.g., `ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174`) and restart the backend.

### 6. Missing dependencies error
- **Cause**: New packages were added to `requirements.txt` without updating the virtual environment.
- **Solution**: Re-run `pip install -r requirements.txt`.
