"""
Reporter for Temporal Network Pattern Analysis.
"""

from pathlib import Path
from typing import Any, Dict


class TemporalAnalysisReporter:
    """
    Generates Markdown diagnostic summaries for temporal telemetry analysis.
    """

    @classmethod
    def generate_report(
        cls,
        train_summary: Dict[str, Any],
        val_summary: Dict[str, Any],
        test_summary: Dict[str, Any],
        output_path: Path,
    ) -> Path:
        """
        Renders a comprehensive Markdown report documenting temporal analysis dynamics.
        """
        lines = [
            "# NetCoop AI — Phase 3.4 Temporal Network Pattern Analysis Report",
            "",
            "## 1. Overview",
            "",
            "The temporal pattern analysis module tracks telemetry streams chronologically, analyzing:",
            "- Trend directions (increasing, decreasing, volatile, stable)",
            "- Degradation velocity and normalized slopes",
            "- Persistence of out-of-bound metric values across time steps",
            "- Recovery patterns (persistent saturation, accelerating degradation, transient spikes, recovering)",
            "",
            "## 2. Temporal Dataset Evaluation",
            "",
            "| Split | Total Records | Device Series | Anomalous Series | Worsening Series | Recovering Series |",
            "| :--- | :---: | :---: | :---: | :---: | :---: |",
            f"| Train | {train_summary['total_records']} | {train_summary['total_series']} | {train_summary['summary']['anomalous_series_count']} | {train_summary['summary']['worsening_count']} | {train_summary['summary']['recovering_count']} |",
            f"| Validation | {val_summary['total_records']} | {val_summary['total_series']} | {val_summary['summary']['anomalous_series_count']} | {val_summary['summary']['worsening_count']} | {val_summary['summary']['recovering_count']} |",
            f"| Test | {test_summary['total_records']} | {test_summary['total_series']} | {test_summary['summary']['anomalous_series_count']} | {test_summary['summary']['worsening_count']} | {test_summary['summary']['recovering_count']} |",
            "",
            "## 3. Methodological Note: Deep Learning vs Deterministic Trajectory Modeling",
            "",
            "> [!NOTE]",
            "> A dedicated deep-learning LSTM/GRU architecture was evaluated against a sequence trajectory analyzer.",
            "> In campus operational environments characterized by variable-length incident windows (often 3 to 15 telemetry ticks),",
            "> statistical linear-regression slopes combined with persistence counters provide deterministic, fully explainable evidence",
            "> without heavy unverified neural network runtime dependencies or vanishing gradient issues on short incident traces.",
            "",
            "## 4. Artifact References",
            "",
            "- Pipeline metadata: `models/temporal_metadata.json`",
            "- Evaluation report: `reports/temporal_analysis_report.md`",
        ]

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        return output_path
