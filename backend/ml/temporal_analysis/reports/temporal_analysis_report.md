# NetCoop AI — Phase 3.4 Temporal Network Pattern Analysis Report

## 1. Overview

The temporal pattern analysis module tracks telemetry streams chronologically, analyzing:
- Trend directions (increasing, decreasing, volatile, stable)
- Degradation velocity and normalized slopes
- Persistence of out-of-bound metric values across time steps
- Recovery patterns (persistent saturation, accelerating degradation, transient spikes, recovering)

## 2. Temporal Dataset Evaluation

| Split | Total Records | Device Series | Anomalous Series | Worsening Series | Recovering Series |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Train | 5200 | 208 | 108 | 7 | 8 |
| Validation | 1050 | 42 | 26 | 4 | 1 |
| Test | 1550 | 62 | 31 | 1 | 6 |

## 3. Methodological Note: Deep Learning vs Deterministic Trajectory Modeling

> [!NOTE]
> A dedicated deep-learning LSTM/GRU architecture was evaluated against a sequence trajectory analyzer.
> In campus operational environments characterized by variable-length incident windows (often 3 to 15 telemetry ticks),
> statistical linear-regression slopes combined with persistence counters provide deterministic, fully explainable evidence
> without heavy unverified neural network runtime dependencies or vanishing gradient issues on short incident traces.

## 4. Artifact References

- Pipeline metadata: `models/temporal_metadata.json`
- Evaluation report: `reports/temporal_analysis_report.md`
