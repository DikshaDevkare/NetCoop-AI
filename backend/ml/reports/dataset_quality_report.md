# NetCoop AI — Dataset Quality & Statistical Profile
**Dataset Classification**: Synthetic Network Telemetry (Phase 3.1)
**Total Records**: 7800
**Total Incidents**: 105
**Total Monitored Devices**: 14
**Timestamp Coverage**: 2026-11-01T08:30:00Z to 2026-11-03T12:34:00Z

---

## 1. Scenario Class Distribution

| Scenario Label | Record Count | Percentage |
| :--- | :--- | :--- |
| `congestion` | 1125 | 14.42% |
| `dns_dhcp_failure` | 1125 | 14.42% |
| `hardware_failure` | 1125 | 14.42% |
| `weak_wifi` | 1125 | 14.42% |
| `interface_fault` | 1100 | 14.1% |
| `latency_spike` | 1100 | 14.1% |
| `normal` | 1100 | 14.1% |

---

## 2. Network Segment Distribution

| Network Segment | Record Count | Percentage |
| :--- | :--- | :--- |
| `CAMPUS_CORE` | 2700 | 34.62% |
| `SERVER_NETWORK` | 1950 | 25.0% |
| `HOSTEL_WIFI` | 1800 | 23.08% |
| `DEPARTMENT_ETHERNET` | 1200 | 15.38% |
| `LECTURE_HALL_NETWORK` | 150 | 1.92% |

---

## 3. Numeric Metric Bounds and Distributions

| Metric | Min | Max | Mean | Std Dev |
| :--- | :--- | :--- | :--- | :--- |
| `latency_ms` | 5.0 | 999.0 | 152.65 | 220.34 |
| `packet_loss_pct` | 0.0 | 40.0 | 5.29 | 9.12 |
| `jitter_ms` | 1.0 | 149.93 | 28.42 | 34.94 |
| `throughput_mbps` | 0.1 | 100.0 | 61.24 | 37.39 |
| `bandwidth_utilization_pct` | 5.05 | 100.0 | 48.09 | 25.88 |
| `cpu_usage_pct` | 10.0 | 99.9 | 37.86 | 24.03 |
| `memory_usage_pct` | 20.02 | 99.5 | 43.98 | 19.54 |
| `device_uptime_seconds` | 101.8 | 863857.0 | 328778.7 | 247442.97 |
| `temperature_celsius` | 32.0 | 95.0 | 46.71 | 13.18 |
| `dns_response_time_ms` | 8.0 | 2999.1 | 156.02 | 409.95 |
| `queue_drops` | 0.0 | 14975.0 | 976.29 | 2908.28 |
| `interface_errors` | 0.0 | 800.0 | 68.59 | 159.88 |
| `wireless_signal_strength_dbm` | -85.0 | -45.0 | -61.0 | 15.57 |
| `retransmissions` | 0.0 | 1200.0 | 119.71 | 225.09 |
| `rolling_latency_mean` | 5.08 | 991.42 | 152.48 | 187.47 |
| `rolling_latency_std` | 0.0 | 688.57 | 84.82 | 114.11 |
| `rolling_packet_loss_mean` | 0.0 | 39.25 | 5.3 | 7.73 |
| `rolling_jitter_mean` | 1.1 | 149.62 | 28.4 | 28.85 |
| `rolling_cpu_mean` | 10.08 | 99.9 | 37.83 | 20.36 |
| `rolling_memory_mean` | 20.08 | 99.06 | 44.0 | 16.54 |
| `latency_change_rate` | -991.1 | 990.08 | 0.53 | 201.82 |
| `packet_loss_change_rate` | -40.0 | 40.0 | 0.01 | 8.39 |
| `utilization_change_rate` | -80.0 | 80.0 | 0.04 | 22.51 |
| `queue_drop_rate` | -14975.0 | 14975.0 | -1.2 | 2449.48 |
| `interface_error_rate` | -796.0 | 796.0 | 0.38 | 148.76 |
| `bandwidth_pressure_indicator` | 0.05 | 30.95 | 2.4 | 5.99 |

---

## 4. Data Quality & Partition Leakage Audit

- **Duplicate Records**: 0 (PASSED)
- **Missing Critical Fields**: 0
- **Incident Partition Leakage**: Zero overlap between Train, Validation, and Test partitions.
- **Provenance**: Synthetic dataset generated deterministically for offline ML model training (Isolation Forest, XGBoost).
