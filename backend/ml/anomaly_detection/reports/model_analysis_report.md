# NetCoop AI — Anomaly Detection Model Analysis Report
**Model Type**: Isolation Forest (Clean Normal-Baseline Training)
**Threshold Selection**: Validation $F_2$-Score Optimization
**Test Samples Evaluated**: 1550 (1350 anomalies, 200 normal)

---

## 1. Test Performance Metrics

| Metric | Score | Explanation |
| :--- | :---: | :--- |
| **Accuracy** | 87.35% | Overall prediction correctness |
| **Precision** | 87.42% | Proportion of flagged anomalies that were true network faults |
| **Recall** | 99.85% | Proportion of actual network faults successfully detected |
| **$F_1$-Score** | 0.9322 | Harmonic balance between precision and recall |
| **$F_2$-Score** | 0.9709 | Recall-weighted metric prioritizing zero missed faults |
| **ROC-AUC** | 0.9204 | Threshold-independent ranking capability |
| **PR-AUC** | 0.9884 | Precision-recall area under curve |

---

## 2. Confusion Matrix (Test Set)

| Actual \ Predicted | Predicted Normal (0) | Predicted Anomaly (1) | Total Actual |
| :--- | :---: | :---: | :---: |
| **Actual Normal (0)** | **6** (TN) | **194** (FP) | 200 |
| **Actual Fault (1)** | **2** (FN) | **1348** (TP) | 1350 |
| **Total Predicted** | 8 | 1542 | 1550 |

---

## 3. Per-Scenario Detection Breakdown (Test Set)

| Scenario Label | Total Records | Flagged Normal | Flagged Anomaly | Scenario Detection Rate | Mean Anomaly Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `congestion` | 225 | 1 | 224 | **99.56%** | 0.1059 |
| `dns_dhcp_failure` | 225 | 0 | 225 | **100.0%** | 0.0744 |
| `hardware_failure` | 225 | 0 | 225 | **100.0%** | 0.1197 |
| `interface_fault` | 225 | 1 | 224 | **99.56%** | 0.1105 |
| `latency_spike` | 225 | 0 | 225 | **100.0%** | 0.1128 |
| `normal` | 200 | 6 | 194 | **3.0%** | 0.0042 |
| `weak_wifi` | 225 | 0 | 225 | **100.0%** | 0.0945 |

---

## 4. Anomaly Score Distribution Analysis

| Population | Count | Mean Score | Median Score | Min Score | Max Score | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Healthy Baseline** | 200 | 0.0042 | 0.0036 | -0.0519 | 0.0786 | 0.0273 |
| **Fault Conditions** | 1350 | 0.103 | 0.1191 | -0.0569 | 0.1776 | 0.0551 |

*Convention: Higher score denotes greater anomaly severity. Model scores are defined as $S(x) = -\text{decision\_function}(x)$.*
