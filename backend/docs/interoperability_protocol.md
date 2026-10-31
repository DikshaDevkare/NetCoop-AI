# NetCoop AI — Interoperability & Standard Data Protocol Specification
**Protocol Version**: 1.0  
**Phase**: Phase 2  
**Target Architecture**: Multi-Agent Network Fault Diagnosis System  

---

## 1. Protocol Purpose

NetCoop AI operates across heterogeneous network infrastructure where telemetry arrives with disparate field naming conventions, conflicting measurement units, missing attributes, and varying device identifiers. 

The **Interoperability Protocol (v1.0)** establishes a formal, versioned contract across all backend components. It guarantees that any specialized agent can transmit telemetry observations, empirical evidence, and diagnostic findings without ambiguous data types, semantic mismatches, or unvalidated payloads.

---

## 2. The Five Specialized Agents and Orchestrator

The protocol defines standard identities for all five future agents and system actors:

| Identifier (`AgentId`) | Role | Domain Responsibility |
| :--- | :--- | :--- |
| `telemetry_performance` | Telemetry & Performance Agent | Ingests time-series network telemetry; analyzes latency, jitter, throughput, packet loss, and bandwidth utilization. |
| `infrastructure_health` | Infrastructure Health Agent | Evaluates compute, memory, temperature, link state, and device availability. |
| `connectivity_analysis` | Connectivity Analysis Agent | Assesses path reachability, DNS responsiveness, DHCP leasing, and gateway connectivity. |
| `fault_correlation` | Fault Correlation Agent | Synthesizes observations across domains, tests hypotheses, and produces diagnostic findings. |
| `recommendation_reporting` | Recommendation & Reporting Agent | Transforms diagnostic findings into explainable mitigation strategies and human-readable reports. |
| `orchestrator` | Central Orchestrator | Coordinates workflow dispatch, message routing, and task lifecycles. |
| `system` | Core System Services | Ingestion pipelines, administrative probes, and protocol validation services. |

---

## 3. Architecture Overview

```
                      +-----------------------------+
                      |        ORCHESTRATOR         |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
    +-------------------+  +-------------------+  +-------------------+
    |    Telemetry &    |  |  Infrastructure   |  |   Connectivity    |
    | Performance Agent |  |   Health Agent    |  |  Analysis Agent   |
    +---------+---------+  +---------+---------+  +---------+---------+
              |                      |                      |
              | (Observation/Evd)    | (Health/Evidence)    | (Path Evidence)
              +----------------------+----------------------+
                                     |
                                     v
                        +-------------------------+
                        | Fault Correlation Agent |
                        +------------+------------+
                                     |
                                     | (DiagnosticFinding)
                                     v
                     +-------------------------------+
                     |  Recommendation & Reporting   |
                     +-------------------------------+
```

All communication flows through the canonical **`AgentMessage`** envelope.

---

## 4. Protocol Versioning Standard

- Current canonical standard: **`1.0`**
- Defined by the centralized constant: `PROTOCOL_VERSION = "1.0"` in `app.schemas.common`.
- Every message envelope must provide `"protocol_version": "1.0"`.
- Messages with unrecognized or unsupported versions are rejected with a structured `VALIDATION_ERROR`.
- **Extensibility Roadmap**: Minor non-breaking additions (e.g. new optional fields) will bump to `1.1`. Breaking changes to envelope fields or payload types will increment the major version to `2.0`.

---

## 5. Message Classifications (`MessageType`)

| Type | Purpose | Primary Payload Model |
| :--- | :--- | :--- |
| `telemetry` | Raw or normalized metric observations | `TelemetryRecord` or `TelemetryBatchPayload` |
| `device_health` | Hardware and interface condition assessments | `DeviceHealthPayload` or `Device` |
| `connectivity` | Path reachability and resolver tests | `ConnectivityPayload` |
| `observation` | Domain anomaly or threshold breach reports | `Observation` |
| `evidence` | Grounded facts supporting or refuting a hypothesis | `Evidence` |
| `diagnostic_finding` | Evidence-backed root cause hypothesis | `DiagnosticFinding` |
| `status` | Operational state heartbeats | `StatusPayload` |
| `error` | Processing or protocol-level failure report | `ErrorPayload` |

---

## 6. Common Message Envelope (`AgentMessage`)

Every message exchanged across agents must follow this envelope structure:

```json
{
  "message_id": "msg-001",
  "protocol_version": "1.0",
  "sender": "telemetry_performance",
  "receiver": "fault_correlation",
  "message_type": "observation",
  "timestamp": "2026-10-31T17:30:00Z",
  "correlation_id": "INC-1001",
  "payload": { ... },
  "metadata": {
    "priority": "high"
  }
}
```

### Envelope Contract Specifications
1. **`message_id`**: String identifier unique across the message lifecycle.
2. **`protocol_version`**: Must strictly match `"1.0"`.
3. **`sender`** & **`receiver`**: Canonical enum values (`AgentId`).
4. **`message_type`**: Canonical enum value (`MessageType`).
5. **`timestamp`**: Timezone-aware UTC timestamp (ISO 8601 ending in `Z`).
6. **`correlation_id`**: Identifier linking all messages for a specific incident or investigation.
7. **`payload`**: Schema-validated object conforming strictly to the declared `message_type`.
8. **`metadata`**: Optional dictionary for routing or trace tags.

---

## 7. Device Identification Schema (`Device`)

```json
{
  "device_id": "AP-101",
  "device_type": "access_point",
  "hostname": "ap-floor-1",
  "ip_address": "192.168.1.10",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "network_segment": "FLOOR-1",
  "location": "Building A - 1st Floor",
  "vendor": "Aruba",
  "model": "AP-515"
}
```

### Validation Rules
- **`device_id`**: Non-empty unique string identifier.
- **`device_type`**: One of `router`, `switch`, `access_point`, `server`, `client`, `firewall`, `gateway`, `other`.
- **`ip_address`**: Validated against standard IPv4/IPv6 address parsers. Rejects invalid octets.
- **`mac_address`**: Validated against 6-pair hexadecimal format and normalized to uppercase colon-separated format (`AA:BB:CC:DD:EE:FF`).

---

## 8. Telemetry Schema & Metric Standard

Every metric record adheres to strict category mapping, standardized units, and numerical bounds:

| Metric Name | Category | Allowed Unit(s) | Value Type | Valid Range / Permitted Values |
| :--- | :--- | :--- | :--- | :--- |
| `latency` | `performance` | `ms` | float / int | $\ge 0.0$ |
| `packet_loss` | `performance` | `%` | float / int | $0.0 \le v \le 100.0$ |
| `jitter` | `performance` | `ms` | float / int | $\ge 0.0$ |
| `throughput` | `performance` | `Mbps` | float / int | $\ge 0.0$ |
| `bandwidth_utilization` | `performance` | `%` | float / int | $0.0 \le v \le 100.0$ |
| `cpu_usage` | `infrastructure` | `%` | float / int | $0.0 \le v \le 100.0$ |
| `memory_usage` | `infrastructure` | `%` | float / int | $0.0 \le v \le 100.0$ |
| `interface_status` | `infrastructure` | `status` | string | `up`, `down`, `degraded`, `admin_down`, `testing`, `unknown` |
| `device_uptime` | `infrastructure` | `seconds` | float / int | $\ge 0.0$ |
| `temperature` | `infrastructure` | `Celsius` | float / int | $-50.0 \le v \le 150.0$ |
| `dns_response_time` | `connectivity` | `ms` | float / int | $\ge 0.0$ |
| `dns_resolution_status` | `connectivity` | `status` | string | `success`, `failed`, `timeout`, `degraded` |
| `dhcp_status` | `connectivity` | `status` | string | `assigned`, `failed`, `timeout`, `renewed`, `expired` |
| `gateway_reachability` | `connectivity` | `status`, `boolean` | string / bool | `reachable`, `unreachable`, `degraded`, `unknown`, `true`, `false` |
| `interface_connectivity` | `connectivity` | `status` | string | `connected`, `disconnected`, `degraded` |

---

## 9. Timestamp Standardization Rules

- All timestamps across every schema (`observed_at`, `timestamp`) must be **timezone-aware**.
- Naive timestamps (e.g. `"2026-10-31T17:30:00"`) without timezone indicator are **strictly rejected**.
- Input timestamps with explicit offsets (e.g. `+02:00`) are automatically parsed and normalized to UTC.
- Canonical JSON output format: `YYYY-MM-DDTHH:MM:SSZ`.

---

## 10. Observation & Evidence Schemas

### Observation Schema
Represents an observed event or threshold breach on a device:
- `observation_id`: Unique identifier (e.g. `OBS-001`).
- `incident_id`: Correlation workflow identifier.
- `device_id`: Associated network device.
- `source_agent`: Emitting agent identity (`AgentId`).
- `observation_type`: Condition classification (e.g. `high_packet_loss`, `cpu_spike`).
- `description`: Plain-language explanation.
- `observed_at`: UTC timestamp.
- `related_telemetry_ids`: Empirical telemetry IDs supporting the observation.

### Evidence Schema
Represents validated empirical artifacts submitted to the Fault Correlation Agent:
- `evidence_id`: Unique identifier (e.g. `EVD-001`).
- `incident_id`: Correlation workflow identifier.
- `source_agent`: Submitting agent.
- `evidence_type`: Classification (e.g. `link_flap_log`, `arp_table_check`).
- `description`: Fact-based summary.
- `device_id`: Optional (allows incomplete data where collector lacks topology awareness).
- `telemetry_ids`: Supporting telemetry record references.
- `observed_at`: UTC timestamp.
- `supports_hypothesis`: `true` if evidence supports a hypothesis, `false` if it contradicts/refutes it, or `null` if neutral.

---

## 11. Diagnostic Finding Schema (`DiagnosticFinding`)

Synthesized hypothesis generated by the Fault Correlation Agent:
- `finding_id`: Unique identifier (e.g. `FND-001`).
- `incident_id`: Correlation workflow identifier.
- `source_agent`: Concluding agent (`AgentId`).
- `title`: Executive summary title.
- `description`: Detailed explanation of the fault dynamic.
- `suspected_cause`: Primary root-cause hypothesis (or `null` if investigation is inconclusive).
- `severity`: `informational`, `low`, `medium`, `high`, `critical`.
- `confidence`: Categorical scale: `low`, `medium`, `high`.
- `affected_devices`: List of impacted device IDs.
- `supporting_evidence_ids`: Traceable list of verified evidence IDs.
- `alternative_causes`: Plausible alternative explanations.
- `limitations`: Known data gaps, unpolled segments, or observability limitations.
- `timestamp`: UTC timestamp.

---

## 12. Synthetic Interoperability Scenarios

### Scenario A: Telemetry Agent -> Fault Correlation Agent
*Telemetry Agent detects high packet loss and transmits a standardized observation message.*

```json
{
  "message_id": "msg-tel-001",
  "protocol_version": "1.0",
  "sender": "telemetry_performance",
  "receiver": "fault_correlation",
  "message_type": "observation",
  "timestamp": "2026-10-31T17:30:00Z",
  "correlation_id": "INC-1001",
  "payload": {
    "observation_id": "OBS-001",
    "incident_id": "INC-1001",
    "device_id": "AP-101",
    "source_agent": "telemetry_performance",
    "observation_type": "high_packet_loss",
    "description": "Packet loss reached 18.0%, exceeding the 5.0% performance threshold.",
    "observed_at": "2026-10-31T17:29:45Z",
    "related_telemetry_ids": ["TEL-001", "TEL-002"],
    "metadata": {
      "threshold": 5.0,
      "consecutive_samples": 3
    }
  },
  "metadata": {
    "priority": "high"
  }
}
```

### Scenario B: Infrastructure Health Agent -> Fault Correlation Agent
*Infrastructure Health Agent reports critical CPU usage on an upstream distribution switch.*

```json
{
  "message_id": "msg-inf-001",
  "protocol_version": "1.0",
  "sender": "infrastructure_health",
  "receiver": "fault_correlation",
  "message_type": "evidence",
  "timestamp": "2026-10-31T17:30:10Z",
  "correlation_id": "INC-1001",
  "payload": {
    "evidence_id": "EVD-101",
    "incident_id": "INC-1001",
    "source_agent": "infrastructure_health",
    "evidence_type": "cpu_spike",
    "description": "Switch control plane CPU utilization spiked to 98% during packet drop window.",
    "device_id": "SW-CORE-01",
    "telemetry_ids": ["TEL-003"],
    "observed_at": "2026-10-31T17:29:50Z",
    "supports_hypothesis": true,
    "metadata": {
      "process": "bgp_routing",
      "core_count": 4
    }
  }
}
```

### Scenario C: Connectivity Analysis Agent -> Fault Correlation Agent
*Connectivity Analysis Agent reports gateway reachability issues between access point and gateway.*

```json
{
  "message_id": "msg-con-001",
  "protocol_version": "1.0",
  "sender": "connectivity_analysis",
  "receiver": "fault_correlation",
  "message_type": "connectivity",
  "timestamp": "2026-10-31T17:30:20Z",
  "correlation_id": "INC-1001",
  "payload": {
    "source_device_id": "AP-101",
    "target_destination": "192.168.1.1",
    "connectivity_type": "gateway_arp",
    "status": "unreachable",
    "latency_ms": 250.0,
    "packet_loss_percent": 100.0,
    "details": "ARP resolution timed out after 3 retries during gateway check."
  }
}
```

### Scenario D: Fault Correlation Agent -> Recommendation & Reporting Agent
*Fault Correlation Agent correlates evidence and dispatches an evidence-backed diagnostic finding.*

```json
{
  "message_id": "msg-fnd-001",
  "protocol_version": "1.0",
  "sender": "fault_correlation",
  "receiver": "recommendation_reporting",
  "message_type": "diagnostic_finding",
  "timestamp": "2026-10-31T17:35:00Z",
  "correlation_id": "INC-1001",
  "payload": {
    "finding_id": "FND-001",
    "incident_id": "INC-1001",
    "source_agent": "fault_correlation",
    "title": "High Packet Loss Caused by Core Switch Uplink Buffer Saturation",
    "description": "Core switch SW-CORE-01 experienced control-plane CPU spike (98%) and saturated uplink buffers, propagating packet drops across downstream AP-101.",
    "suspected_cause": "Core switch uplink buffer saturation under routing load",
    "severity": "high",
    "confidence": "high",
    "affected_devices": ["SW-CORE-01", "AP-101"],
    "supporting_evidence_ids": ["EVD-101"],
    "alternative_causes": [
      "Physical fiber transceiver degradation on port eth1",
      "Spanning-tree topology reconvergence event"
    ],
    "limitations": [
      "NetFlow sampling rate was 1:1000 during incident",
      "Wireless spectrum analyzer data unavailable"
    ],
    "timestamp": "2026-10-31T17:34:50Z",
    "metadata": {
      "correlated_hypotheses_count": 3,
      "correlation_duration_ms": 420
    }
  }
}
```

---

## 13. Protocol Validation Endpoint

To allow client applications and frontend teams to verify message schemas without simulating agents, the backend provides an HTTP validation endpoint:

- **Method & Path**: `POST /api/protocol/validate`
- **Request Body**: Complete `AgentMessage` envelope.
- **Success Response (200 OK)**:
  ```json
  {
    "valid": true,
    "message_id": "msg-001",
    "message_type": "observation",
    "protocol_version": "1.0",
    "sender": "telemetry_performance",
    "receiver": "fault_correlation"
  }
  ```
- **Error Response (422 Unprocessable Content)**: Returns standardized error envelope detailing schema, type, or bound violations.

---

## 14. How Future Agents Should Use the Protocol

1. **Import Canonical Schemas**:
   ```python
   from app.schemas import (
       AgentMessage,
       MessageType,
       AgentId,
       Observation,
       PROTOCOL_VERSION,
   )
   ```
2. **Build Structured Payload**:
   ```python
   obs = Observation(
       observation_id="OBS-100",
       incident_id="INC-200",
       device_id="SW-01",
       source_agent=AgentId.TELEMETRY_PERFORMANCE,
       observation_type="high_jitter",
       description="Jitter exceeded threshold.",
       observed_at="2026-10-31T17:30:00Z",
   )
   ```
3. **Wrap in AgentMessage Envelope**:
   ```python
   message = AgentMessage(
       message_id="MSG-100",
       protocol_version=PROTOCOL_VERSION,
       sender=AgentId.TELEMETRY_PERFORMANCE,
       receiver=AgentId.FAULT_CORRELATION,
       message_type=MessageType.OBSERVATION,
       timestamp="2026-10-31T17:30:00Z",
       correlation_id="INC-200",
       payload=obs,
   )
   ```
4. **Serialize and Transmit**:
   ```python
   json_payload = message.model_dump(mode="json")
   # Or message.model_dump_json()
   ```

---

## 15. Known Limitations & Scope Boundaries

1. **In-Memory Protocol**: Phase 2 defines data contracts and validation rules. It does not introduce distributed message queues (Kafka, RabbitMQ) or persistence databases.
2. **Deterministic Rules**: Metric bounds are verified deterministically; ML-based anomaly thresholds and dynamic baseline generation belong to the agent implementations in Phase 3.
