# NetCoop AI — Phase 3.3 XGBoost Multi-Class Fault Classification Report

## 1. Executive Summary

- **Algorithm**: Supervised Multi-Class Gradient Boosted Decision Trees (`xgboost.XGBClassifier`)
- **Target Classes (7)**: normal, congestion, dns_dhcp_failure, hardware_failure, weak_wifi, interface_fault, latency_spike
- **Feature Space**: 18 standard numeric telemetry features (matching Phase 3.2)
- **Validation Accuracy**: 84.67%
- **Test Accuracy**: 86.52%
- **Test Macro F1-Score**: 0.8747
- **Test Weighted F1-Score**: 0.8778
- **Test ROC-AUC (OvR)**: 0.973

## 2. Evaluation Metrics Comparison

| Metric | Validation Set (N=1,050) | Test Set (N=1,550) |
| :--- | :---: | :---: |
| Accuracy | 84.67% | 86.52% |
| Precision (Macro) | 0.9108 | 0.9123 |
| Precision (Weighted) | 0.9108 | 0.9186 |
| Recall (Macro) | 0.8467 | 0.8672 |
| Recall (Weighted) | 0.8467 | 0.8652 |
| F1-Score (Macro) | 0.8622 | 0.8747 |
| F1-Score (Weighted) | 0.8622 | 0.8778 |
| ROC-AUC (OvR Weighted) | 0.9632 | 0.973 |

## 3. Per-Class Test Performance Breakdown

| Scenario Class | Precision | Recall | F1-Score | Support (Records) |
| :--- | :---: | :---: | :---: | :---: |
| `normal` | 0.5209 | 0.9950 | 0.6838 | 200 |
| `congestion` | 0.9778 | 0.7822 | 0.8691 | 225 |
| `dns_dhcp_failure` | 0.9904 | 0.9200 | 0.9539 | 225 |
| `hardware_failure` | 0.9898 | 0.8667 | 0.9242 | 225 |
| `weak_wifi` | 0.9482 | 0.8133 | 0.8756 | 225 |
| `interface_fault` | 0.9843 | 0.8356 | 0.9038 | 225 |
| `latency_spike` | 0.9747 | 0.8578 | 0.9125 | 225 |

## 4. Top 10 Feature Importances

| Rank | Telemetry Feature | Importance Weight | Category |
| :---: | :--- | :---: | :--- |
| 1 | `queue_drops` | 0.2357 | Connectivity/Buffer |
| 2 | `interface_errors` | 0.1723 | Connectivity/Interface |
| 3 | `rolling_packet_loss_mean` | 0.1208 | Temporal |
| 4 | `packet_loss_pct` | 0.0983 | Performance |
| 5 | `rolling_latency_mean` | 0.0646 | Temporal |
| 6 | `queue_drop_rate` | 0.0641 | Temporal |
| 7 | `temperature_celsius` | 0.0481 | Infrastructure |
| 8 | `rolling_latency_std` | 0.0379 | Temporal |
| 9 | `retransmissions` | 0.0376 | Connectivity |
| 10 | `throughput_mbps` | 0.0285 | Performance |

## 5. Artifact References

- Confusion matrix graphic: `reports/confusion_matrix.svg`
- Feature importance graphic: `reports/feature_importance.svg`
- Serialized model: `models/xgboost_classifier.joblib`
- Classifier metadata: `models/classifier_metadata.json`
- Test metrics JSON: `models/classification_metrics.json`
