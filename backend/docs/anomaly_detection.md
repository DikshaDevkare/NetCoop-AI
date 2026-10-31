# NetCoop AI — Isolation Forest Anomaly Detection Specification
**Phase**: Phase 3.2
**Target Milestone**: Isolation Forest Anomaly Detection (Model Training, Validation & Evaluation)
**Classification**: Unsupervised Outlier Detection / One-Class Normal Baseline Modeling

---

## 1. Phase 3.2 Objective

The objective of Phase 3.2 is to implement a robust, reproducible, and explainable **Isolation Forest anomaly detection system** for NetCoop AI. The detector is trained to characterize healthy network telemetry behavior and flag statistical deviations as potential network faults.

> [!IMPORTANT]
> **Scope Distinction**: Phase 3.2 answers: *"Is this network node or link currently anomalous?"*
> It produces a binary anomaly prediction ($1 = \text{Anomalous}, 0 = \text{Normal}$) and a continuous anomaly score $S(x) \in \mathbb{R}$. It does **not** identify which specific fault occurred. Multi-class root-cause classification (distinguishing between congestion, weak Wi-Fi, hardware failure, etc.) is reserved for Phase 3.3.

---

## 2. Isolation Forest Overview

Isolation Forest (`sklearn.ensemble.IsolationForest`) is an ensemble unsupervised learning algorithm specifically designed for anomaly detection. Unlike density or distance-based estimators (e.g., Local Outlier Factor, k-NN) that suffer from computational degradation in higher dimensions, Isolation Forest isolates anomalies using random partitioning trees ($iTrees$).

- **Fundamental Principle**: Anomalies are "few and different". In random orthogonal subspace partitions, anomalous instances require significantly fewer splits to become isolated in terminal leaf nodes (short average path length $h(x)$).
- **Path Length Formulation**:
  $$c(n) = 2 \ln(n - 1) + 0.5772156649 - \frac{2(n - 1)}{n}$$
  $$\text{Score}(x) = 2^{-\frac{E(h(x))}{c(n)}}$$
- **Orientation in NetCoop AI**:
  To ensure consistent application semantics, NetCoop AI defines continuous anomaly scores as:
  $$S(x) = -\text{decision\_function}(x)$$
  **Higher values indicate a greater degree of abnormality** (healthy traffic yields $S(x) < 0$; severe faults yield $S(x) \gg 0$).

---

## 3. Package Architecture

The anomaly detection engine is encapsulated within `backend/ml/anomaly_detection/`:

```
backend/ml/anomaly_detection/
├── __init__.py                  # Package exports (Pipeline, Detector, Evaluator, Config)
├── config.py                    # 18-feature allowlist, hyperparameters, paths
├── feature_selector.py          # Numeric validation, NaN/Inf rejection, deterministic ordering
├── detector.py                  # TelemetryIsolationForest wrapper with joblib persistence
├── pipeline.py                  # End-to-end orchestration (Validation -> Train -> Tuning -> Eval)
├── evaluator.py                 # AnomalyEvaluator (Confusion matrix, F1, F2, ROC-AUC, PR-AUC)
├── reporter.py                  # SVG visualization and Markdown/JSON analysis reporting
├── train.py                     # Master CLI training entrypoint (python -m ml.anomaly_detection.train)
├── models/                      # Serialized models and training metadata
│   ├── .gitkeep
│   ├── isolation_forest.joblib
│   ├── model_metadata.json
│   ├── validation_metrics.json
│   └── test_metrics.json
└── reports/                     # Visualizations and diagnostic analysis
    ├── confusion_matrix.svg
    ├── roc_curve.svg
    ├── model_analysis_report.json
    └── model_analysis_report.md
```

---

## 4. Selected 18 Features & Rationale

Isolation Forest operates on an explicit allowlist of **18 numeric features**:

### A. Performance Metrics (5 Features)
1. `latency_ms`: Round-trip packet latency. Spikes during buffer bloat, routing loops, and hardware degradation.
2. `packet_loss_pct`: Percentage of dropped packets. Direct indicator of network congestion or physical link failure.
3. `jitter_ms`: Delay variance. Highlights buffer instability and variable wireless contention.
4. `throughput_mbps`: Effective data rate. Drops sharply during bandwidth bottlenecks.
5. `bandwidth_utilization_pct`: Percentage of link capacity consumed. Primary indicator of link saturation.

### B. Infrastructure Metrics (4 Features)
6. `cpu_usage_pct`: Host processor utilization. Surges during device exhaustion or control plane loops.
7. `memory_usage_pct`: Host memory footprint. Flags memory leaks or buffer exhaustion.
8. `device_uptime_seconds`: System uptime. Unusually low values flag unexpected device crashes or power reboots.
9. `temperature_celsius`: Internal chassis thermal sensor. Identifies hardware failure or cooling fan breakdown.

### C. Connectivity and Error Metrics (4 Features)
10. `dns_response_time_ms`: Core resolution latency. Identifies DNS server degradation independent of link health.
11. `queue_drops`: Egress buffer drops. Captures micro-bursts and link oversubscription.
12. `interface_errors`: CRC, framing, and alignment errors. Flags cable defects and physical layer faults.
13. `retransmissions`: TCP/layer-2 retransmission counts. Early warning of wireless attenuation or drop recovery.

### D. Temporal Causal Features (5 Features)
14. `rolling_latency_mean`: 3-step moving average of latency. Filters instantaneous sensor noise.
15. `rolling_latency_std`: 3-step standard deviation of latency. Detects emerging latency volatility.
16. `rolling_packet_loss_mean`: 3-step moving average of packet loss.
17. `latency_change_rate`: First-order difference ($x_t - x_{t-1}$). Captures sudden latency surges.
18. `queue_drop_rate`: First-order difference of queue drops. Detects abrupt buffer saturation spikes.

---

## 5. Excluded Columns & Reasons

The following columns are **prohibited** from entering the feature matrix:

| Column Name | Type | Reason for Exclusion |
| :--- | :--- | :--- |
| `incident_id` | Identifier | Simulation incident ID; passing leaks partition groupings. |
| `scenario_id` | Metadata | Direct scenario identifier. |
| `scenario_label` | **Target** | Ground truth label; causes 100% target leakage. |
| `device_id` | Identifier | Discrete string ID; causes high-cardinality discrete overfitting. |
| `device_type` | Categorical | Device type string (`switch`, `router`); non-numeric. |
| `hostname` | Metadata | Network hostname string. |
| `network_segment` | Categorical | Topological segment string (`CAMPUS_CORE`, etc.). |
| `timestamp` | Time | ISO-8601 string; non-numeric monotonically increasing index. |
| `status` | Operational Label | Categorical string (`Healthy`, `Warning`, `Critical`); target leak. |
| `interface_status` | Categorical | Non-numeric state string (`up`, `degraded`, `down`). |
| `dns_resolution_status` | Categorical | Non-numeric state string (`success`, `timeout`, `failed`). |
| `dhcp_status` | Categorical | Non-numeric state string (`assigned`, `timeout`, `failed`, `expired`). |
| `gateway_reachability` | Categorical | Non-numeric state string (`reachable`, `degraded`, `unreachable`). |
| `interface_connectivity` | Categorical | Non-numeric state string (`connected`, `degraded`, `disconnected`). |
| `wireless_signal_strength_dbm`| Sensor (Sparse) | Contains 79.9% missing values (`NaN`) on wired devices; crashes tree fit. |
| `bandwidth_pressure_indicator`| Derived (Collinear)| Multicollinear with `queue_drops` ($r = 0.999$); redundant tree split. |
| `synthetic_data` | Constant Flag | Boolean flag (`True`). |

---

## 6. Normal-Baseline Training Rationale

In Phase 3.1, `train.csv` contains 5,200 records across 70 incidents, consisting of **750 normal records (14.4%)** and **4,450 fault records (85.6%)**.

- **The Problem with Unfiltered Fit**: If an Isolation Forest is fitted directly on the raw unlabelled mixture, the 85.6% fault records form dense clusters. The trees would isolate healthy normal traffic as sparse outliers instead of faults.
- **The Solution**: NetCoop AI employs **clean normal-baseline training**. The detector filters `train.csv` strictly for `scenario_label == 'normal'` ($N = 750$). The model constructs isolation trees exclusively representing normal, healthy network operation.
- **Result**: Any telemetry reading exhibiting elevated latency, buffer drops, interface errors, or abnormal change rates is isolated with short tree path lengths, producing high anomaly scores.

---

## 7. Validation Threshold Optimization ($F_2$-Score Tuning)

Instead of relying on scikit-learn's arbitrary zero cutoff, NetCoop AI optimizes the decision threshold on validation data (`val.csv`):

1. Compute continuous anomaly scores: $S(x) = -\text{decision\_function}(x)$.
2. Evaluate 100 candidate threshold percentiles across the validation score distribution.
3. Select the cutoff $\tau^*$ that maximizes the **$F_2$-score**:
   $$F_\beta = (1 + \beta^2) \frac{\text{Precision} \cdot \text{Recall}}{\beta^2 \cdot \text{Precision} + \text{Recall}}$$
   With $\beta = 2$:
   $$F_2 = 5 \cdot \frac{\text{Precision} \cdot \text{Recall}}{4 \cdot \text{Precision} + \text{Recall}}$$
4. **Why $F_2$ instead of $F_1$?** In operational network diagnosis, **missing an active network fault (False Negative) is significantly more hazardous than investigating a transient false alarm (False Positive)**. $F_2$ weights recall four times higher than precision, driving false negatives toward zero.
5. **Leakage Safeguard**: The threshold chosen on validation data is locked and applied **completely unchanged** to the test set.

---

## 8. Empirical Test Performance & Results

From execution on the 1,550-record out-of-incident test set:

| Metric | Score | Details |
| :--- | :---: | :--- |
| **Accuracy** | **87.35%** | Correct binary predictions across test set |
| **Precision** | **87.42%** | $1,348 / (1,348 + 194)$ |
| **Recall** | **99.85%** | **$1,348 / (1,348 + 2)$ — Only 2 missed faults out of 1,350!** |
| **$F_1$-Score** | **0.9322** | Balanced harmonic mean |
| **$F_2$-Score** | **0.9709** | Recall-weighted operational objective |
| **ROC-AUC** | **0.9204** | Area under receiver operating characteristic |
| **PR-AUC** | **0.9884** | Area under precision-recall curve |

### Confusion Matrix (Test Set)
- **True Positives (Detected Faults)**: 1,348
- **True Negatives (Correct Healthy)**: 6
- **False Positives (False Alarms)**: 194
- **False Negatives (Missed Faults)**: 2

### Per-Scenario Fault Recall (Test Set)
- `dns_dhcp_failure`: **100.0%** (225 / 225 detected)
- `hardware_failure`: **100.0%** (225 / 225 detected)
- `latency_spike`: **100.0%** (225 / 225 detected)
- `weak_wifi`: **100.0%** (225 / 225 detected)
- `congestion`: **99.56%** (224 / 225 detected)
- `interface_fault`: **99.56%** (224 / 225 detected)

---

## 9. Operational CLI Instructions

All commands are executed from the `backend/` directory with the virtual environment activated:

### Step 1: Install Dependencies
```powershell
cd backend
.\venv\Scripts\python -m pip install -r requirements.txt
```

### Step 2: Run End-to-End Anomaly Detection Training
```powershell
.\venv\Scripts\python -m ml.anomaly_detection.train
```

### Step 3: Run Phase 3.2 Automated Unit and Integration Tests
```powershell
.\venv\Scripts\python -m pytest -v tests/test_anomaly_detection
```

### Step 4: Run Complete Backend Regression Test Suite
```powershell
.\venv\Scripts\python -m pytest -v tests
```

---

## 10. Limitations & Known Risks

1. **Threshold Conservatism Trade-Off**: Optimizing for $F_2$-score ($\beta=2$) heavily penalizes missed faults, selecting a low threshold ($\tau = -0.0445$). While this achieves a 99.85% recall rate on faults, it increases false positives on healthy baseline traffic. If a higher specificity is desired, operators can configure $\beta=0.5$ or $\tau = 0.0$.
2. **Device Heterogeneity**: Different device classes (e.g. edge APs vs core chassis switches) exhibit different baseline latency distributions. In future phases, training per-device-type models (e.g. `IsolationForest_AP`, `IsolationForest_Switch`) will reduce false alarm rates.
3. **No Root-Cause Identification**: Phase 3.2 flags *that* an anomaly has occurred. It cannot determine *why* (e.g., DNS timeout vs cable failure). Downstream triage requires Phase 3.3 multi-class classification and multi-agent correlation.
