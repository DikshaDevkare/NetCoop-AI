# NetCoop AI — Frontend Integration Guide

This guide provides the complete contract, endpoint catalog, TypeScript interfaces, sample fetch snippets, and integration workflows for connecting a React + TypeScript frontend to the NetCoop AI backend.

---

## 1. Quick Start for Frontend Developers

### Backend Base URLs
- **Local API Base URL**: `http://localhost:8000`
- **Swagger Interactive UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Interactive UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Supported Frontend Origins (CORS)
The backend is pre-configured to allow local frontend development servers:
- `http://localhost:5173` (Vite React default)
- `http://127.0.0.1:5173`

To customize allowed origins, edit `ALLOWED_ORIGINS` in `backend/.env`.

---

## 2. Standardized Response Conventions

### Success Response Envelope
Standard collection and report endpoints return structured data envelopes:

```json
{
  "total": 42,
  "page": 1,
  "page_size": 20,
  "items": [ ... ]
}
```

### Error Response Envelope
When an error occurs (e.g., 400, 404, 422, 500), the backend returns a standardized JSON error envelope:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Human-readable description of error.",
    "details": null
  }
}
```

---

## 3. Complete Endpoint Catalog

| Method | Endpoint | Description | Key Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root greeting & running status | None |
| `GET` | `/api/health` | Service health check | None |
| `GET` | `/api/system/status` | Consolidated live status of DB, ML models, agents | None |
| `POST` | `/api/protocol/validate` | Interoperability protocol message validation | `AgentMessage` body |
| `POST` | `/api/diagnosis/analyze` | Run full 5-agent diagnosis & persist result | `DiagnosisRequest` body |
| `GET` | `/api/diagnosis/history` | Paginated diagnosis run history | `page`, `page_size`, `status`, `severity` |
| `GET` | `/api/diagnosis/{diagnosis_id}` | Complete diagnosis record by ID | Path `diagnosis_id` |
| `GET` | `/api/diagnosis/{diagnosis_id}/report` | Structured diagnosis report | Path `diagnosis_id` |
| `GET` | `/api/diagnosis/agents` | Status of all 5 diagnostic agents | None |
| `GET` | `/api/diagnosis/models` | Status of all 3 ML inference pipelines | None |
| `GET` | `/api/devices` | Registered device inventory | `page`, `page_size`, `segment` |
| `GET` | `/api/devices/{device_id}` | Single device metadata | Path `device_id` |
| `GET` | `/api/devices/{device_id}/telemetry` | Time-series telemetry for device | `page`, `page_size` |
| `GET` | `/api/devices/{device_id}/incidents` | Incidents affecting device | Path `device_id` |
| `GET` | `/api/incidents` | Incident list with filters | `page`, `page_size`, `status`, `severity` |
| `GET` | `/api/incidents/{incident_id}` | Incident metadata | Path `incident_id` |
| `GET` | `/api/incidents/{incident_id}/findings` | Domain agent findings for incident | Path `incident_id` |
| `GET` | `/api/incidents/{incident_id}/recommendations` | Prioritized remediation actions | Path `incident_id` |
| `POST` | `/api/telemetry/ingest` | Ingest single telemetry record | JSON telemetry record |
| `POST` | `/api/telemetry/batch` | Ingest batch of telemetry records | `{"records": [...]}` |
| `POST` | `/api/telemetry/upload` | Upload CSV/JSON telemetry file | `multipart/form-data` with `file` |
| `GET` | `/api/reports/diagnosis/{diagnosis_id}/json` | Download JSON report file | Path `diagnosis_id` |
| `GET` | `/api/reports/diagnosis/{diagnosis_id}/csv` | Download CSV report spreadsheet | Path `diagnosis_id` |

---

## 4. TypeScript Interfaces

```typescript
// Enums
export type Severity = "informational" | "low" | "medium" | "high" | "critical";
export type ConfidenceLevel = "low" | "medium" | "high";
export type IncidentStatus = "HEALTHY" | "DEGRADED" | "CRITICAL" | "UNKNOWN";

// System Status
export interface SystemStatus {
  api_status: string;
  database_status: string;
  protocol_version: string;
  backend_version: string;
  environment: string;
  models: ModelInfo[];
  agents: AgentInfo[];
  timestamp: string;
}

export interface ModelInfo {
  name: string;
  type: string;
  algorithm: string;
  version: string;
  available: boolean;
  status: string;
  notes: string;
  threshold?: number;
  target_classes?: string[];
  feature_count?: number;
}

export interface AgentInfo {
  agent_id: string;
  name: string;
  description: string;
  status: string;
  protocol_version: string;
}

// Diagnosis Request & Response
export interface TelemetryRecord {
  device_id: string;
  device_type?: "switch" | "router" | "access_point" | "gateway";
  timestamp?: string;
  latency_ms?: number;
  packet_loss_pct?: number;
  jitter_ms?: number;
  throughput_mbps?: number;
  bandwidth_utilization_pct?: number;
  cpu_usage_pct?: number;
  memory_usage_pct?: number;
  temperature_celsius?: number;
  device_uptime_seconds?: number;
  dns_response_time_ms?: number;
  queue_drops?: number;
  interface_errors?: number;
  retransmissions?: number;
  wireless_signal_strength_dbm?: number;
}

export interface DiagnosisRequest {
  incident_id?: string;
  telemetry_records: TelemetryRecord[];
  context?: Record<string, any>;
}

export interface ActionRecommendation {
  action: string;
  priority: "Immediate" | "High" | "Medium" | "Low";
  target_devices: string[];
  rationale: string;
  step_order: number;
  supporting_evidence_ids: string[];
  automated: boolean;
}

export interface EvidenceItem {
  evidence_id: string;
  source_agent: string;
  evidence_type: string;
  device_id: string;
  description: string;
  observed_at: string;
  metadata?: Record<string, any>;
}

export interface DiagnosisResponse {
  diagnosis_id: string;
  incident_summary: {
    incident_id: string;
    diagnosis_id: string;
    timestamp: string;
    overall_status: IncidentStatus;
    severity: Severity;
    affected_devices: string[];
    affected_device_count: number;
    affected_network_segments: string[];
    topology_scope?: "device_local" | "shared_infrastructure" | "segment_wide" | "none";
    is_shared_infrastructure_fault?: boolean;
    scope_summary?: string;
  };
  probable_root_cause: {
    primary_hypothesis: string;
    confidence: ConfidenceLevel;
    alternative_hypotheses: string[];
    explanation: string;
  };
  machine_learning_signals: {
    anomaly_detection: {
      available: boolean;
      model_type?: string;
      is_anomalous?: boolean;
      max_anomaly_score?: number;
      mean_anomaly_score?: number;
    };
    fault_classification: {
      available: boolean;
      model_type?: string;
      predicted_fault?: string;
      confidence?: number;
      is_uncertain?: boolean;
      class_probabilities?: Record<string, number>;
      top_alternative_faults?: Array<{ fault: string; probability: number }>;
    };
    temporal_trajectory: {
      available: boolean;
      overall_trend?: "stable" | "worsening" | "recovering" | "volatile" | "stable_healthy";
      anomalous_series_count?: number;
      sequence_evidence?: Array<any>;
    };
  };
  evidence_trail: EvidenceItem[];
  agent_findings: Array<any>;
  recommended_corrective_actions: ActionRecommendation[];
  uncertainty_and_limitations: {
    confidence_assessment: ConfidenceLevel;
    limitations: string[];
    conflicting_evidence: Array<any>;
  };
  orchestration_metadata: {
    orchestrator_version: string;
    protocol_version: string;
    execution_time_ms: number;
    agents_executed_count: number;
    total_domain_messages: number;
    agent_execution_summary: Record<string, { status: string; messages_emitted: number; duration_ms: number }>;
  };
}
```

---

## 5. Sample Frontend Fetch Implementations

### A. Run Multi-Agent Network Fault Diagnosis
```typescript
export async function runDiagnosis(request: DiagnosisRequest): Promise<DiagnosisResponse> {
  const response = await fetch("http://localhost:8000/api/diagnosis/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}
```

### B. Query Live System Status Dashboard
```typescript
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const response = await fetch("http://localhost:8000/api/system/status");
  if (!response.ok) throw new Error("Backend system status unreachable");
  return response.json();
}
```

### C. Download Diagnostic Report as CSV / JSON
```typescript
export function getReportDownloadUrl(diagnosisId: string, format: "csv" | "json"): string {
  return `http://localhost:8000/api/reports/diagnosis/${encodeURIComponent(diagnosisId)}/${format}`;
}
```

### D. Upload Telemetry File (CSV or JSON)
```typescript
export async function uploadTelemetryFile(file: File): Promise<{ success: boolean; records_ingested: number; message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/api/telemetry/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error?.message || "File upload failed");
  }

  return response.json();
}
```

---

## 6. Diagnosis Workflow Guide for Frontend UI

1. **Telemetry Input**:
   - The user selects a device from inventory (`GET /api/devices`), enters real-time metrics, or uploads a file (`POST /api/telemetry/upload`).
2. **Submit for Analysis**:
   - Frontend calls `POST /api/diagnosis/analyze`.
3. **Display Real-Time Pipeline Progress**:
   - Inspect `orchestration_metadata.agent_execution_summary` to show execution cards for each of the 5 agents:
     - *Telemetry & Performance Agent*
     - *Infrastructure Health Agent*
     - *Connectivity Analysis Agent*
     - *Fault Correlation Agent*
     - *Recommendation & Reporting Agent*
4. **Display Correlated Diagnosis**:
   - `probable_root_cause.primary_hypothesis` (Headline).
   - `incident_summary.overall_status` (Badge: `HEALTHY` green, `DEGRADED` yellow, `CRITICAL` red).
   - `probable_root_cause.confidence` (High, Medium, Low).
   - `machine_learning_signals.fault_classification.class_probabilities` (Bar chart of top classes).
   - `machine_learning_signals.temporal_trajectory.overall_trend` (Trajectory trend indicator: worsening, recovering, stable).
5. **Display Actionable Remediation Plan**:
   - Map `recommended_corrective_actions` to prioritized cards (Immediate, High, Medium, Low).
   - Display `supporting_evidence_ids` as clickable badge chips linking directly to items in `evidence_trail`.
6. **Export Options**:
   - Provide "Download JSON" and "Download CSV" buttons using `/api/reports/diagnosis/{id}/json` and `/api/reports/diagnosis/{id}/csv`.
