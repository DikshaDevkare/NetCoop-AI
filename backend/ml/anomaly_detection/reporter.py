"""
Analysis and Visualization Reporting Engine for NetCoop AI Anomaly Detection.
Generates comprehensive diagnostic reports, per-scenario breakdowns, and SVG visualizations.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.metrics import precision_recall_curve, roc_curve

from ml.anomaly_detection.config import REPORTS_DIR


class AnomalyAnalysisReporter:
    """
    Computes detailed diagnostic analysis, score distributions, and standalone visualizations.
    """

    @classmethod
    def generate_per_scenario_breakdown(
        cls,
        df: pd.DataFrame,
        predictions: np.ndarray,
        scores: np.ndarray,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Calculate anomaly detection performance segmented by individual fault scenario.
        Provides explainable diagnostic verification without using scenario labels as features.
        """
        breakdown: Dict[str, Dict[str, Any]] = {}
        df_copy = df.copy()
        df_copy["pred_anomaly"] = predictions
        df_copy["anomaly_score"] = scores

        for scenario, group in df_copy.groupby("scenario_label"):
            total = len(group)
            flagged_anomaly = int(np.sum(group["pred_anomaly"] == 1))
            flagged_normal = int(np.sum(group["pred_anomaly"] == 0))

            if scenario == "normal":
                accuracy_pct = round((flagged_normal / total) * 100.0, 2)
            else:
                accuracy_pct = round((flagged_anomaly / total) * 100.0, 2)

            breakdown[scenario] = {
                "total_records": total,
                "predicted_normal": flagged_normal,
                "predicted_anomaly": flagged_anomaly,
                "detection_accuracy_pct": accuracy_pct,
                "mean_anomaly_score": round(float(group["anomaly_score"].mean()), 4),
                "min_anomaly_score": round(float(group["anomaly_score"].min()), 4),
                "max_anomaly_score": round(float(group["anomaly_score"].max()), 4),
            }

        return breakdown

    @classmethod
    def generate_score_distribution_summary(
        cls,
        df: pd.DataFrame,
        scores: np.ndarray,
    ) -> Dict[str, Any]:
        """Compute statistical quantiles of anomaly scores for normal vs faulty records."""
        is_anomaly = (df["scenario_label"] != "normal").to_numpy()
        normal_scores = scores[~is_anomaly]
        fault_scores = scores[is_anomaly]

        def get_stats(arr: np.ndarray) -> Dict[str, float]:
            if len(arr) == 0:
                return {}
            return {
                "count": len(arr),
                "mean": round(float(np.mean(arr)), 4),
                "std": round(float(np.std(arr)), 4),
                "min": round(float(np.min(arr)), 4),
                "p25": round(float(np.percentile(arr, 25)), 4),
                "median": round(float(np.median(arr)), 4),
                "p75": round(float(np.percentile(arr, 75)), 4),
                "p90": round(float(np.percentile(arr, 90)), 4),
                "max": round(float(np.max(arr)), 4),
            }

        return {
            "normal_telemetry": get_stats(normal_scores),
            "faulty_telemetry": get_stats(fault_scores),
        }

    @classmethod
    def generate_svg_confusion_matrix(
        cls,
        cm: Dict[str, int],
        output_path: Path,
    ) -> None:
        """Render a standalone SVG heatmap of the confusion matrix."""
        tp = cm["true_positives"]
        fp = cm["false_positives"]
        tn = cm["true_negatives"]
        fn = cm["false_negatives"]

        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="500" height="350">
  <style>
    .title {{ font-family: sans-serif; font-size: 16px; font-weight: bold; fill: #1e293b; text-anchor: middle; }}
    .label {{ font-family: sans-serif; font-size: 12px; fill: #64748b; text-anchor: middle; }}
    .cell-txt {{ font-family: sans-serif; font-size: 18px; font-weight: bold; fill: #0f172a; text-anchor: middle; }}
    .sub-txt {{ font-family: sans-serif; font-size: 11px; fill: #475569; text-anchor: middle; }}
  </style>
  <rect width="500" height="350" fill="#ffffff" rx="8" />
  <text x="250" y="30" class="title">Isolation Forest Confusion Matrix (Test Set)</text>

  <!-- Headers -->
  <text x="200" y="70" class="label">Predicted Normal (0)</text>
  <text x="360" y="70" class="label">Predicted Anomaly (1)</text>
  <text x="70" y="145" class="label" transform="rotate(-90, 70, 145)">Actual Normal (0)</text>
  <text x="70" y="255" class="label" transform="rotate(-90, 70, 255)">Actual Anomaly (1)</text>

  <!-- Cell TN -->
  <rect x="120" y="90" width="160" height="100" fill="#dcfce7" stroke="#86efac" stroke-width="2" rx="4" />
  <text x="200" y="140" class="cell-txt">{tn}</text>
  <text x="200" y="165" class="sub-txt">True Negatives (TN)</text>

  <!-- Cell FP -->
  <rect x="290" y="90" width="160" height="100" fill="#fee2e2" stroke="#fca5a5" stroke-width="2" rx="4" />
  <text x="370" y="140" class="cell-txt">{fp}</text>
  <text x="370" y="165" class="sub-txt">False Positives (FP)</text>

  <!-- Cell FN -->
  <rect x="120" y="200" width="160" height="100" fill="#fee2e2" stroke="#fca5a5" stroke-width="2" rx="4" />
  <text x="200" y="250" class="cell-txt">{fn}</text>
  <text x="200" y="275" class="sub-txt">False Negatives (FN)</text>

  <!-- Cell TP -->
  <rect x="290" y="200" width="160" height="100" fill="#dbeafe" stroke="#93c5fd" stroke-width="2" rx="4" />
  <text x="370" y="250" class="cell-txt">{tp}</text>
  <text x="370" y="275" class="sub-txt">True Positives (TP)</text>
</svg>"""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(svg)

    @classmethod
    def generate_svg_roc_curve(
        cls,
        y_true: np.ndarray,
        y_scores: np.ndarray,
        roc_auc: float,
        output_path: Path,
    ) -> None:
        """Render standalone SVG plot for ROC Curve."""
        fpr, tpr, _ = roc_curve(y_true, y_scores)
        # Sample points to keep SVG compact
        idx_sample = np.linspace(0, len(fpr) - 1, min(100, len(fpr))).astype(int)
        pts = []
        for i in idx_sample:
            # Map [0, 1] to SVG coordinates [60..440, 260..60]
            x = 60 + fpr[i] * 380
            y = 260 - tpr[i] * 200
            pts.append(f"{x:.1f},{y:.1f}")

        polyline_pts = " ".join(pts)

        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320" width="500" height="320">
  <style>
    .title {{ font-family: sans-serif; font-size: 15px; font-weight: bold; fill: #1e293b; text-anchor: middle; }}
    .axis {{ stroke: #94a3b8; stroke-width: 1.5; }}
    .grid {{ stroke: #f1f5f9; stroke-width: 1; }}
    .label {{ font-family: sans-serif; font-size: 11px; fill: #64748b; text-anchor: middle; }}
    .auc {{ font-family: sans-serif; font-size: 13px; font-weight: bold; fill: #2563eb; }}
  </style>
  <rect width="500" height="320" fill="#ffffff" rx="8" />
  <text x="250" y="28" class="title">Receiver Operating Characteristic (ROC Curve)</text>

  <!-- Axes -->
  <line x1="60" y1="260" x2="440" y2="260" class="axis" />
  <line x1="60" y1="60" x2="60" y2="260" class="axis" />

  <!-- Diagonal reference line (Random guess) -->
  <line x1="60" y1="260" x2="440" y2="60" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4" />

  <!-- ROC Line -->
  <polyline fill="none" stroke="#2563eb" stroke-width="2.5" points="{polyline_pts}" />

  <!-- Labels -->
  <text x="250" y="295" class="label">False Positive Rate (FPR)</text>
  <text x="22" y="160" class="label" transform="rotate(-90, 22, 160)">True Positive Rate (TPR)</text>
  <text x="260" y="230" class="auc">ROC-AUC = {roc_auc:.4f}</text>
</svg>"""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(svg)

    @classmethod
    def generate_all_reports(
        cls,
        test_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_metrics: Dict[str, Any],
        val_metrics: Dict[str, Any],
        test_scores: np.ndarray,
        test_preds: np.ndarray,
        output_dir: Path = REPORTS_DIR,
    ) -> Dict[str, Path]:
        """
        Generate and persist complete suite of JSON, Markdown, and SVG diagnostic artifacts.
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        # 1. Per-scenario breakdown
        scenario_breakdown = cls.generate_per_scenario_breakdown(test_df, test_preds, test_scores)

        # 2. Score distribution summary
        score_distributions = cls.generate_score_distribution_summary(test_df, test_scores)

        # 3. Save JSON analysis
        analysis_data = {
            "validation_metrics": val_metrics,
            "test_metrics": test_metrics,
            "score_distributions": score_distributions,
            "per_scenario_breakdown_test": scenario_breakdown,
        }
        json_path = output_dir / "model_analysis_report.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(analysis_data, f, indent=2)

        # 4. Generate SVG visualizations
        cm_svg_path = output_dir / "confusion_matrix.svg"
        cls.generate_svg_confusion_matrix(test_metrics["confusion_matrix"], cm_svg_path)

        roc_svg_path = output_dir / "roc_curve.svg"
        y_test_true = (test_df["scenario_label"] != "normal").astype(int).to_numpy()
        roc_val = test_metrics.get("roc_auc") or 0.0
        cls.generate_svg_roc_curve(y_test_true, test_scores, roc_val, roc_svg_path)

        # 5. Save human-readable Markdown report
        md_path = output_dir / "model_analysis_report.md"
        cm = test_metrics["confusion_matrix"]
        md_content = f"""# NetCoop AI — Anomaly Detection Model Analysis Report
**Model Type**: Isolation Forest (Clean Normal-Baseline Training)
**Threshold Selection**: Validation $F_2$-Score Optimization
**Test Samples Evaluated**: {test_metrics['total_samples']} ({test_metrics['total_anomalies_actual']} anomalies, {test_metrics['total_normals_actual']} normal)

---

## 1. Test Performance Metrics

| Metric | Score | Explanation |
| :--- | :---: | :--- |
| **Accuracy** | {test_metrics['accuracy'] * 100:.2f}% | Overall prediction correctness |
| **Precision** | {test_metrics['precision'] * 100:.2f}% | Proportion of flagged anomalies that were true network faults |
| **Recall** | {test_metrics['recall'] * 100:.2f}% | Proportion of actual network faults successfully detected |
| **$F_1$-Score** | {test_metrics['f1_score']:.4f} | Harmonic balance between precision and recall |
| **$F_2$-Score** | {test_metrics['f2_score']:.4f} | Recall-weighted metric prioritizing zero missed faults |
| **ROC-AUC** | {test_metrics.get('roc_auc', 'N/A')} | Threshold-independent ranking capability |
| **PR-AUC** | {test_metrics.get('pr_auc', 'N/A')} | Precision-recall area under curve |

---

## 2. Confusion Matrix (Test Set)

| Actual \\ Predicted | Predicted Normal (0) | Predicted Anomaly (1) | Total Actual |
| :--- | :---: | :---: | :---: |
| **Actual Normal (0)** | **{cm['true_negatives']}** (TN) | **{cm['false_positives']}** (FP) | {test_metrics['total_normals_actual']} |
| **Actual Fault (1)** | **{cm['false_negatives']}** (FN) | **{cm['true_positives']}** (TP) | {test_metrics['total_anomalies_actual']} |
| **Total Predicted** | {cm['true_negatives'] + cm['false_negatives']} | {cm['true_positives'] + cm['false_positives']} | {test_metrics['total_samples']} |

---

## 3. Per-Scenario Detection Breakdown (Test Set)

| Scenario Label | Total Records | Flagged Normal | Flagged Anomaly | Scenario Detection Rate | Mean Anomaly Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
"""
        for scn, s_data in scenario_breakdown.items():
            md_content += f"| `{scn}` | {s_data['total_records']} | {s_data['predicted_normal']} | {s_data['predicted_anomaly']} | **{s_data['detection_accuracy_pct']}%** | {s_data['mean_anomaly_score']} |\n"

        md_content += f"""
---

## 4. Anomaly Score Distribution Analysis

| Population | Count | Mean Score | Median Score | Min Score | Max Score | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Healthy Baseline** | {score_distributions['normal_telemetry'].get('count', 0)} | {score_distributions['normal_telemetry'].get('mean', 0)} | {score_distributions['normal_telemetry'].get('median', 0)} | {score_distributions['normal_telemetry'].get('min', 0)} | {score_distributions['normal_telemetry'].get('max', 0)} | {score_distributions['normal_telemetry'].get('std', 0)} |
| **Fault Conditions** | {score_distributions['faulty_telemetry'].get('count', 0)} | {score_distributions['faulty_telemetry'].get('mean', 0)} | {score_distributions['faulty_telemetry'].get('median', 0)} | {score_distributions['faulty_telemetry'].get('min', 0)} | {score_distributions['faulty_telemetry'].get('max', 0)} | {score_distributions['faulty_telemetry'].get('std', 0)} |

*Convention: Higher score denotes greater anomaly severity. Model scores are defined as $S(x) = -\\text{{decision\\_function}}(x)$.*
"""
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_content)

        return {
            "analysis_json": json_path,
            "analysis_md": md_path,
            "confusion_matrix_svg": cm_svg_path,
            "roc_svg": roc_svg_path,
        }
