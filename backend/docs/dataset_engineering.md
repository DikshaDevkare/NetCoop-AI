# NetCoop AI — Dataset Engineering & Preparation Specification
**Phase**: Phase 3.1
**Target Milestone**: Advanced Network Telemetry Dataset Engineering & ML Preparation
**Classification**: Synthetic Network Telemetry

---

## 1. Dataset Engineering Architecture

NetCoop AI's machine learning capabilities (Isolation Forest for anomaly detection, XGBoost for multi-class fault classification, and sequential models for temporal degradation) require clean, grounded, and structurally sound network telemetry data.

The Phase 3.1 pipeline is structured into three distinct layers:
1. **Simulation Layer (`ml/generators/`)**: Generates raw, chronologically ordered multi-device incidents across 7 clean scenarios based on the organizer reference and the problem statement, plus a separate malformed test corpus.
2. **Preprocessing & Standardization Layer (`ml/preprocessing/`)**: Normalizes organizer and sensor field names into canonical Phase 2 schemas, preserves supplementary metrics, and calculates causal rolling features.
3. **Partitioning & Quality Reporting Layer (`ml/`)**: Splits datasets incident-wise into Train (70%), Validation (15%), and Test (15%) partitions with zero incident overlap, compiling JSON and Markdown audit reports.

---

## 2. Official Organizer Baseline Generator

The organizer provided a baseline generator in the hackathon Colab reference:

```python
import json
import random
from datetime import datetime

def generate_telemetry(fault_type="normal"):
    data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "device_id": f"SW_CAMPUS_{random.randint(1, 10)}",
        "metrics": {}
    }

    if fault_type == "latency_spike":
        data["metrics"] = {
            "cpu_utilization_pct": round(random.uniform(40, 70), 2),
            "link_utilization_pct": round(random.uniform(60, 85), 2),
            "packet_loss_pct": round(random.uniform(0.1, 1.5), 2),
            "latency_ms": round(random.uniform(150, 400), 2),
            "jitter_ms": round(random.uniform(30, 80), 2),
            "queue_drops": random.randint(0, 50)
        }
        data["status"] = "Warning"

    elif fault_type == "hardware_failure":
        data["metrics"] = {
            "cpu_utilization_pct": 99.9,
            "link_utilization_pct": 100.0,
            "packet_loss_pct": round(random.uniform(15, 30), 2),
            "latency_ms": round(random.uniform(500, 1000), 2),
            "queue_drops": random.randint(5000, 15000),
            "interface_errors": random.randint(100, 500)
        }
        data["status"] = "Critical"

    else:
        data["metrics"] = {
            "cpu_utilization_pct": round(random.uniform(10, 35), 2),
            "link_utilization_pct": round(random.uniform(20, 50), 2),
            "packet_loss_pct": 0.0,
            "latency_ms": round(random.uniform(5, 20), 2),
            "jitter_ms": round(random.uniform(1, 5), 2),
            "queue_drops": 0
        }
        data["status"] = "Healthy"

    return data
```

### Preservation in NetCoop AI
- Located in: `backend/ml/generators/organizer_generator.py`.
- Preserves all 3 baseline scenarios (`normal`, `latency_spike`, `hardware_failure`).
- Preserves exact metric keys, status labels (`Healthy`, `Warning`, `Critical`), and numerical distributions.
- Replaces deprecated `datetime.utcnow()` with timezone-aware UTC datetime.
- Adds random seed control for deterministic reproducibility.

---

## 3. Original vs. Extended Generator Comparison

| Feature | Original Organizer Generator | NetCoop AI Phase 3.1 Extended Generator |
| :--- | :--- | :--- |
| **Fault Scenarios** | 3 (`normal`, `latency_spike`, `hardware_failure`) | 8 (All 3 original + `congestion`, `weak_wifi`, `interface_fault`, `dns_dhcp_failure`, plus separate `interoperability_failure`) |
| **Topology Awareness** | Random `SW_CAMPUS_1..10` switch IDs | Structured campus topology (5 network segments, routers, switches, access points, servers, clients) |
| **Incident Context** | 1 isolated record per call | Multi-device, multi-timestamp incidents with shared `incident_id` |
| **Time Series** | Standalone static snapshot | Chronologically ordered time series (25 observations/device with configurable sampling interval) |
| **Metrics Generated** | 7 metrics | 19 metrics (15 canonical Phase 2 metrics + 4 supplementary metrics) |
| **Reproducibility** | Unseeded `random` | Configurable deterministic seeding (`seed=42`) |
| **Output Formats** | Single dictionary | Raw JSON/CSV, Normalized CSV, Feature-engineered CSV, Train/Val/Test splits |

---

## 4. Scenario Definitions

### Scenario A: `normal`
- **Characteristics**: Stable latency (5-20 ms), zero packet loss, low jitter (1-5 ms), moderate CPU (10-35%) and link utilization (20-50%), zero queue drops.
- **Status**: `Healthy`

### Scenario B: `latency_spike`
- **Characteristics**: Sudden latency escalation (150-400 ms), elevated jitter (30-80 ms), minor packet loss (0.1-1.5%), CPU (40-70%), link utilization (60-85%), small queue drops (0-50).
- **Status**: `Warning`

### Scenario C: `hardware_failure`
- **Characteristics**: Extreme resource exhaustion (CPU 99.9%, link 100%), severe packet loss (15-30%), severe latency (500-1000 ms), massive queue drops (5000-15000), hardware interface errors (100-500).
- **Status**: `Critical`

### Scenario D: `congestion`
- **Characteristics**: Link utilization saturated (85-98%), high egress buffer saturation (queue drops 200-2500), latency (120-350 ms), jitter (20-60 ms), packet loss (2-8%), throughput degraded.
- **Status**: `Warning`

### Scenario E: `weak_wifi`
- **Characteristics**: Weak Wi-Fi RSSI (-85 to -72 dBm), elevated frame retransmissions (40-300), unstable latency (60-250 ms), jitter (25-90 ms), packet loss (3-15%), degraded effective throughput.
- **Status**: `Warning`

### Scenario F: `interface_fault`
- **Characteristics**: Interface state down or degraded, CRC and framing errors (50-800), packet loss (5-40%), gateway reachability degraded or unreachable.
- **Status**: `Critical`

### Scenario G: `dns_dhcp_failure`
- **Characteristics**: Core network service breakdown; elevated DNS response time (800-3000 ms) or status timeout/failed; DHCP lease expired or timeout; physical transport remains healthy.
- **Status**: `Warning` or `Critical`

### Scenario H: `interoperability_failure` (Isolated Test Corpus)
- **Characteristics**: Protocol-level non-compliance, missing mandatory fields, negative latencies, out-of-bounds loss, unsupported protocol versions. Isolated in `ml/datasets/test_corpus/interoperability_malformed.json`.

---

## 5. Organizer-to-Phase-2 Metric Mapping

| Organizer Field | Canonical Phase 2 Metric | Unit | Category |
| :--- | :--- | :--- | :--- |
| `cpu_utilization_pct` | `cpu_usage` | `%` | `infrastructure` |
| `link_utilization_pct` | `bandwidth_utilization` | `%` | `performance` |
| `latency_ms` | `latency` | `ms` | `performance` |
| `packet_loss_pct` | `packet_loss` | `%` | `performance` |
| `jitter_ms` | `jitter` | `ms` | `performance` |
| `timestamp` | `timestamp` | UTC ISO | `common` |
| `device_id` | `device_id` | string | `device` |

### Supplementary Metrics Preserved
- `queue_drops`: Egress buffer drop count.
- `interface_errors`: CRC and framing error count.
- `wireless_signal_strength_dbm`: Wi-Fi RSSI in dBm.
- `retransmissions`: Frame/packet retransmission count.

---

## 6. Feature Engineering Formulas

All features are calculated strictly using past observations within `(incident_id, device_id)` partitions:

1. **`rolling_latency_mean`**:
   $$\bar{L}_t = \frac{1}{W} \sum_{i=0}^{W-1} L_{t-i}$$
2. **`rolling_latency_std`**:
   $$\sigma_L = \sqrt{\frac{1}{W-1} \sum_{i=0}^{W-1} (L_{t-i} - \bar{L}_t)^2}$$
3. **`latency_change_rate`**:
   $$\Delta L_t = L_t - L_{t-1}$$
4. **`packet_loss_change_rate`**:
   $$\Delta P_t = P_t - P_{t-1}$$
5. **`utilization_change_rate`**:
   $$\Delta U_t = U_t - U_{t-1}$$
6. **`queue_drop_rate`**:
   $$\Delta Q_t = Q_t - Q_{t-1}$$
7. **`interface_error_rate`**:
   $$\Delta E_t = E_t - E_{t-1}$$
8. **`bandwidth_pressure_indicator`**:
   $$\text{BPI}_t = \left(\frac{U_t}{100.0}\right) \times \left(1.0 + \frac{Q_t}{500.0}\right)$$

---

## 7. Incident-Wise Dataset Partitioning Strategy

- **Train Partition (70%)**: Incidents allocated for model parameter estimation.
- **Validation Partition (15%)**: Incidents allocated for hyperparameter tuning and early stopping.
- **Test Partition (15%)**: Incidents held out for unbiased generalization evaluation.
- **Leakage Prevention**: All observations for an incident reside in exactly one partition.
  $$\text{Incidents}_{\text{train}} \cap \text{Incidents}_{\text{val}} = \emptyset, \quad \text{Incidents}_{\text{train}} \cap \text{Incidents}_{\text{test}} = \emptyset, \quad \text{Incidents}_{\text{val}} \cap \text{Incidents}_{\text{test}} = \emptyset$$

---

## 8. Windows PowerShell Execution Commands

### 1. Generate Raw Incidents and Malformed Test Corpus:
```powershell
cd backend
.\venv\Scripts\python -m ml.generate_dataset
```

### 2. Execute End-to-End Preparation Pipeline:
```powershell
cd backend
.\venv\Scripts\python -m ml.prepare_dataset
```

### 3. Run Automated Tests:
```powershell
cd backend
.\venv\Scripts\pytest -v tests
```

---

## 9. Future Model Consumption (Phase 3.2+)

- **Isolation Forest**: Fits on `train.csv` (unsupervised, using clean normal records or mixed records with feature columns) to detect rare anomalous points.
- **XGBoost**: Trained on `train.csv` using features and `scenario_label` as multi-class target to predict fault categories (`normal`, `latency_spike`, `congestion`, `hardware_failure`, `weak_wifi`, `interface_fault`, `dns_dhcp_failure`).
- **LSTM / GRU**: Consumes chronological sequences structured by `incident_id` and `device_id` without cross-device shuffling.
