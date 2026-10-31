"""
Diagnostic report and SVG visualization generator for multi-class fault classification.
"""

from pathlib import Path
from typing import Any, Dict, List
import json

from ml.fault_classification.config import TARGET_CLASSES


class FaultAnalysisReporter:
    """
    Generates Markdown diagnostic reports and standalone vector SVG visualizations.
    """

    @classmethod
    def generate_confusion_matrix_svg(
        cls,
        cm_raw: List[List[int]],
        classes: List[str],
        output_path: Path,
    ) -> Path:
        """
        Renders a publication-ready multi-class confusion matrix as a standalone SVG.
        """
        n_classes = len(classes)
        cell_size = 60
        margin_left = 140
        margin_top = 80
        margin_right = 40
        margin_bottom = 60
        width = margin_left + n_classes * cell_size + margin_right
        height = margin_top + n_classes * cell_size + margin_bottom

        max_val = max(max(row) for row in cm_raw) if cm_raw else 1

        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            '<rect width="100%" height="100%" fill="#ffffff" />',
            f'<text x="{width / 2}" y="32" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1e293b">Multi-Class Fault Confusion Matrix (Test Set)</text>',
            f'<text x="{width / 2}" y="52" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">XGBoost Telemetry Fault Classifier</text>',
        ]

        # Draw X-axis class labels (Predicted)
        for j, name in enumerate(classes):
            x = margin_left + j * cell_size + cell_size / 2
            y = margin_top - 10
            short_name = name[:10]
            svg_parts.append(
                f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="10" font-weight="600" text-anchor="middle" fill="#334155" transform="rotate(-30 {x} {y})">{short_name}</text>'
            )

        # Draw Y-axis class labels (Actual) and Matrix Cells
        for i, name in enumerate(classes):
            y_mid = margin_top + i * cell_size + cell_size / 2
            short_name = name[:14]
            svg_parts.append(
                f'<text x="{margin_left - 12}" y="{y_mid + 4}" font-family="sans-serif" font-size="11" font-weight="600" text-anchor="end" fill="#334155">{short_name}</text>'
            )

            for j in range(n_classes):
                val = cm_raw[i][j]
                x_pos = margin_left + j * cell_size
                y_pos = margin_top + i * cell_size

                # Color intensity: Diagonal (correct) = blue, Off-diagonal (error) = red/orange
                intensity = val / max_val if max_val > 0 else 0
                if i == j:
                    # Blue scale for diagonal
                    r = int(240 - intensity * 200)
                    g = int(245 - intensity * 150)
                    b = int(255 - intensity * 50)
                    text_color = "#ffffff" if intensity > 0.5 else "#1e293b"
                else:
                    # Orange/red scale for errors
                    if val > 0:
                        r = 255
                        g = int(240 - intensity * 150)
                        b = int(240 - intensity * 150)
                        text_color = "#991b1b"
                    else:
                        r, g, b = 250, 250, 250
                        text_color = "#94a3b8"

                fill_hex = f"#{r:02x}{g:02x}{b:02x}"
                svg_parts.append(
                    f'<rect x="{x_pos}" y="{y_pos}" width="{cell_size}" height="{cell_size}" fill="{fill_hex}" stroke="#cbd5e1" stroke-width="1" />'
                )
                svg_parts.append(
                    f'<text x="{x_pos + cell_size / 2}" y="{y_pos + cell_size / 2 + 4}" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="{text_color}">{val}</text>'
                )

        svg_parts.append(
            f'<text x="{margin_left / 2}" y="{height / 2}" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a" transform="rotate(-90 {margin_left / 2} {height / 2})">Actual Scenario</text>'
        )
        svg_parts.append(
            f'<text x="{margin_left + (n_classes * cell_size) / 2}" y="{height - 15}" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Predicted Scenario</text>'
        )
        svg_parts.append("</svg>")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(svg_parts))
        return output_path

    @classmethod
    def generate_feature_importance_svg(
        cls,
        feature_importances: Dict[str, float],
        output_path: Path,
        top_n: int = 12,
    ) -> Path:
        """
        Renders horizontal bar chart of top XGBoost feature importances as standalone SVG.
        """
        items = list(feature_importances.items())[:top_n]
        if not items:
            items = [("none", 1.0)]

        max_imp = max(v for _, v in items) if items else 1.0
        width = 600
        height = 60 + len(items) * 32
        margin_left = 180
        margin_right = 60
        bar_area_width = width - margin_left - margin_right

        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            '<rect width="100%" height="100%" fill="#ffffff" />',
            f'<text x="{width / 2}" y="28" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="#1e293b">XGBoost Top Feature Importances</text>',
        ]

        for idx, (feat, val) in enumerate(items):
            y_pos = 50 + idx * 30
            bar_w = int((val / max_imp) * bar_area_width) if max_imp > 0 else 0

            svg_parts.append(
                f'<text x="{margin_left - 10}" y="{y_pos + 14}" font-family="sans-serif" font-size="11" text-anchor="end" fill="#334155">{feat}</text>'
            )
            svg_parts.append(
                f'<rect x="{margin_left}" y="{y_pos}" width="{bar_w}" height="18" fill="#3b82f6" rx="3" />'
            )
            svg_parts.append(
                f'<text x="{margin_left + bar_w + 6}" y="{y_pos + 14}" font-family="sans-serif" font-size="10" font-weight="600" fill="#475569">{val:.4f}</text>'
            )

        svg_parts.append("</svg>")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(svg_parts))
        return output_path

    @classmethod
    def generate_markdown_report(
        cls,
        val_metrics: Dict[str, Any],
        test_metrics: Dict[str, Any],
        feature_importances: Dict[str, float],
        output_path: Path,
    ) -> Path:
        """
        Generates a comprehensive diagnostic report in Markdown format.
        """
        lines = [
            "# NetCoop AI — Phase 3.3 XGBoost Multi-Class Fault Classification Report",
            "",
            "## 1. Executive Summary",
            "",
            f"- **Algorithm**: Supervised Multi-Class Gradient Boosted Decision Trees (`xgboost.XGBClassifier`)",
            f"- **Target Classes ({len(TARGET_CLASSES)})**: {', '.join(TARGET_CLASSES)}",
            f"- **Feature Space**: 18 standard numeric telemetry features (matching Phase 3.2)",
            f"- **Validation Accuracy**: {val_metrics['accuracy'] * 100:.2f}%",
            f"- **Test Accuracy**: {test_metrics['accuracy'] * 100:.2f}%",
            f"- **Test Macro F1-Score**: {test_metrics['f1_macro']:.4f}",
            f"- **Test Weighted F1-Score**: {test_metrics['f1_weighted']:.4f}",
            f"- **Test ROC-AUC (OvR)**: {test_metrics.get('roc_auc_weighted', 'N/A')}",
            "",
            "## 2. Evaluation Metrics Comparison",
            "",
            "| Metric | Validation Set (N=1,050) | Test Set (N=1,550) |",
            "| :--- | :---: | :---: |",
            f"| Accuracy | {val_metrics['accuracy'] * 100:.2f}% | {test_metrics['accuracy'] * 100:.2f}% |",
            f"| Precision (Macro) | {val_metrics['precision_macro']:.4f} | {test_metrics['precision_macro']:.4f} |",
            f"| Precision (Weighted) | {val_metrics['precision_weighted']:.4f} | {test_metrics['precision_weighted']:.4f} |",
            f"| Recall (Macro) | {val_metrics['recall_macro']:.4f} | {test_metrics['recall_macro']:.4f} |",
            f"| Recall (Weighted) | {val_metrics['recall_weighted']:.4f} | {test_metrics['recall_weighted']:.4f} |",
            f"| F1-Score (Macro) | {val_metrics['f1_macro']:.4f} | {test_metrics['f1_macro']:.4f} |",
            f"| F1-Score (Weighted) | {val_metrics['f1_weighted']:.4f} | {test_metrics['f1_weighted']:.4f} |",
            f"| ROC-AUC (OvR Weighted) | {val_metrics.get('roc_auc_weighted', 'N/A')} | {test_metrics.get('roc_auc_weighted', 'N/A')} |",
            "",
            "## 3. Per-Class Test Performance Breakdown",
            "",
            "| Scenario Class | Precision | Recall | F1-Score | Support (Records) |",
            "| :--- | :---: | :---: | :---: | :---: |",
        ]

        per_class = test_metrics.get("per_class_metrics", {})
        for name in TARGET_CLASSES:
            if name in per_class:
                pcm = per_class[name]
                lines.append(
                    f"| `{name}` | {pcm['precision']:.4f} | {pcm['recall']:.4f} | {pcm['f1_score']:.4f} | {pcm['support']} |"
                )

        lines.extend([
            "",
            "## 4. Top 10 Feature Importances",
            "",
            "| Rank | Telemetry Feature | Importance Weight | Category |",
            "| :---: | :--- | :---: | :--- |",
        ])

        categories = {
            "latency_ms": "Performance", "packet_loss_pct": "Performance", "jitter_ms": "Performance",
            "throughput_mbps": "Performance", "bandwidth_utilization_pct": "Performance",
            "cpu_usage_pct": "Infrastructure", "memory_usage_pct": "Infrastructure",
            "device_uptime_seconds": "Infrastructure", "temperature_celsius": "Infrastructure",
            "dns_response_time_ms": "Connectivity", "queue_drops": "Connectivity/Buffer",
            "interface_errors": "Connectivity/Interface", "retransmissions": "Connectivity",
            "rolling_latency_mean": "Temporal", "rolling_latency_std": "Temporal",
            "rolling_packet_loss_mean": "Temporal", "latency_change_rate": "Temporal",
            "queue_drop_rate": "Temporal",
        }

        top_feats = list(feature_importances.items())[:10]
        for rank, (feat, imp) in enumerate(top_feats, start=1):
            cat = categories.get(feat, "General")
            lines.append(f"| {rank} | `{feat}` | {imp:.4f} | {cat} |")

        lines.extend([
            "",
            "## 5. Artifact References",
            "",
            "- Confusion matrix graphic: `reports/confusion_matrix.svg`",
            "- Feature importance graphic: `reports/feature_importance.svg`",
            "- Serialized model: `models/xgboost_classifier.joblib`",
            "- Classifier metadata: `models/classifier_metadata.json`",
            "- Test metrics JSON: `models/classification_metrics.json`",
        ])

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        return output_path
