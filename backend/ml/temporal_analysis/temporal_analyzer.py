"""
Temporal trajectory and degradation pattern analyzer for network telemetry.
"""

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from ml.temporal_analysis.config import (
    NORMAL_BASELINES,
    PERSISTENCE_MIN_STEPS,
    SLOPE_DEGRADATION_THRESHOLD,
    TEMPORAL_METRICS,
    VOLATILITY_CV_THRESHOLD,
)


class TemporalAnalyzer:
    """
    Analyzes multi-step chronological telemetry sequences to extract trend direction,
    degradation velocity, persistence, recovery dynamics, and evidence.
    """

    def __init__(self, metrics: Optional[List[str]] = None) -> None:
        self.metrics = list(metrics or TEMPORAL_METRICS)

    def analyze_sequence(self, series_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyzes a chronological sequence of telemetry records for a single device/incident.
        """
        if not isinstance(series_df, pd.DataFrame):
            raise TypeError(f"Expected DataFrame, got {type(series_df).__name__}")

        n_steps = len(series_df)
        if n_steps == 0:
            return self._empty_result()

        # Extract metric arrays
        metric_trends: Dict[str, Dict[str, Any]] = {}
        anomalous_metrics: List[str] = []
        max_degradation_rate: float = 0.0
        max_persistence: int = 0
        evidence_items: List[Dict[str, Any]] = []

        for metric in self.metrics:
            if metric not in series_df.columns:
                continue

            values = pd.to_numeric(series_df[metric], errors="coerce").fillna(0.0).to_numpy()
            if len(values) == 0:
                continue

            trend_info = self._analyze_metric_trend(metric, values)
            metric_trends[metric] = trend_info

            if trend_info["is_anomalous"]:
                anomalous_metrics.append(metric)

            if trend_info["degradation_rate"] > max_degradation_rate:
                max_degradation_rate = trend_info["degradation_rate"]

            if trend_info["persistence_steps"] > max_persistence:
                max_persistence = trend_info["persistence_steps"]

            if trend_info["evidence_text"]:
                evidence_items.append({
                    "metric": metric,
                    "trend_direction": trend_info["trend_direction"],
                    "degradation_rate": trend_info["degradation_rate"],
                    "persistence_steps": trend_info["persistence_steps"],
                    "description": trend_info["evidence_text"],
                })

        # Overall trend direction and recovery pattern synthesis
        overall_trend = self._synthesize_overall_trend(metric_trends)
        recovery_pattern = self._synthesize_recovery_pattern(metric_trends, n_steps)

        # Confidence scaled by available sequence depth
        if n_steps <= 1:
            confidence = 0.40
        elif n_steps == 2:
            confidence = 0.65
        elif n_steps in (3, 4):
            confidence = 0.85
        else:
            confidence = 0.95

        has_temporal_anomaly = bool(anomalous_metrics or max_persistence >= PERSISTENCE_MIN_STEPS)

        return {
            "sequence_length": n_steps,
            "temporal_anomaly": has_temporal_anomaly,
            "overall_trend": overall_trend,
            "recovery_pattern": recovery_pattern,
            "max_degradation_rate": round(float(max_degradation_rate), 4),
            "max_persistence_steps": int(max_persistence),
            "confidence": round(float(confidence), 2),
            "anomalous_metrics": anomalous_metrics,
            "metric_trends": metric_trends,
            "sequence_evidence": evidence_items,
        }

    def _analyze_metric_trend(self, metric: str, values: np.ndarray) -> Dict[str, Any]:
        """
        Computes trend direction, normalized slope, persistence, and evidence for a single metric.
        """
        n = len(values)
        baseline = NORMAL_BASELINES.get(metric, 1.0)
        mean_val = float(np.mean(values))
        std_val = float(np.std(values))
        latest_val = float(values[-1])

        # Persistence: consecutive recent steps above baseline
        persistence = 0
        # Persistence: consecutive recent steps violating healthy baseline
        persistence = 0
        if metric == "throughput_mbps":
            for v in reversed(values):
                if v < baseline:
                    persistence += 1
                else:
                    break
            is_anomalous = latest_val < baseline or persistence >= PERSISTENCE_MIN_STEPS
        else:
            for v in reversed(values):
                if v > baseline:
                    persistence += 1
                else:
                    break
            is_anomalous = latest_val > baseline or persistence >= PERSISTENCE_MIN_STEPS

        # Slope computation
        if n >= 2:
            x = np.arange(n, dtype=float)
            # OLS slope
            x_diff = x - np.mean(x)
            var_x = np.sum(x_diff ** 2)
            slope = float(np.sum(x_diff * (values - mean_val)) / var_x) if var_x > 0 else 0.0
            norm_slope = slope / (mean_val + 1e-5)
        else:
            slope = 0.0
            norm_slope = 0.0

        # Coefficient of variation (volatility)
        cv = (std_val / mean_val) if mean_val > 1e-4 else 0.0

        # Trend direction: check directional slope first
        if norm_slope > SLOPE_DEGRADATION_THRESHOLD:
            trend_dir = "increasing"
        elif norm_slope < -SLOPE_DEGRADATION_THRESHOLD:
            trend_dir = "decreasing"
        elif cv > VOLATILITY_CV_THRESHOLD and n >= 3:
            trend_dir = "volatile"
        else:
            trend_dir = "stable"

        # Generate evidence commentary
        evidence_text = ""
        if is_anomalous:
            if trend_dir == "increasing":
                evidence_text = (
                    f"{metric} degraded with upward trend (+{norm_slope * 100:.1f}%/step), "
                    f"reaching {latest_val:.2f} (baseline: {baseline:.1f}, persisted {persistence} steps)."
                )
            elif persistence >= PERSISTENCE_MIN_STEPS:
                evidence_text = (
                    f"{metric} sustained abnormal elevated level at {latest_val:.2f} "
                    f"for {persistence} consecutive steps (baseline: {baseline:.1f})."
                )
            elif trend_dir == "volatile":
                evidence_text = (
                    f"{metric} exhibited volatile instability (CV={cv:.2f}), "
                    f"fluctuating between {np.min(values):.2f} and {np.max(values):.2f}."
                )

        return {
            "current_value": round(latest_val, 2),
            "baseline_value": baseline,
            "mean_value": round(mean_val, 2),
            "std_value": round(std_val, 2),
            "slope": round(slope, 4),
            "normalized_slope": round(norm_slope, 4),
            "trend_direction": trend_dir,
            "persistence_steps": persistence,
            "is_anomalous": is_anomalous,
            "degradation_rate": max(0.0, round(norm_slope, 4)),
            "evidence_text": evidence_text,
        }

    def _synthesize_overall_trend(self, metric_trends: Dict[str, Dict[str, Any]]) -> str:
        """Determines the overarching temporal trend across critical performance metrics."""
        primary_metrics = ["latency_ms", "packet_loss_pct", "queue_drops", "cpu_usage_pct"]
        dirs = [
            metric_trends[m]["trend_direction"]
            for m in primary_metrics
            if m in metric_trends
        ]

        if not dirs:
            return "stable"

        if dirs.count("increasing") >= 2:
            return "worsening"
        if dirs.count("decreasing") >= 2:
            return "recovering"
        if "volatile" in dirs:
            return "volatile"
        if "increasing" in dirs:
            return "degrading"
        return "stable"

    def _synthesize_recovery_pattern(
        self, metric_trends: Dict[str, Dict[str, Any]], n_steps: int
    ) -> str:
        """Categorizes recovery vs persistent deterioration."""
        if n_steps <= 1:
            return "indeterminate_single_sample"

        anom_trends = [t for t in metric_trends.values() if t["is_anomalous"]]
        if not anom_trends:
            return "stable_healthy"

        persistences = [t["persistence_steps"] for t in anom_trends]
        max_persist = max(persistences) if persistences else 0

        decreasing_count = sum(1 for t in anom_trends if t["trend_direction"] == "decreasing")
        increasing_count = sum(1 for t in anom_trends if t["trend_direction"] == "increasing")

        if decreasing_count > increasing_count:
            return "recovering"
        if increasing_count > 0 and max_persist >= 3:
            return "accelerating_degradation"
        if max_persist >= 3:
            return "persistent_saturation"
        if max_persist == 1:
            return "transient_spike"
        return "active_fault"

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "sequence_length": 0,
            "temporal_anomaly": False,
            "overall_trend": "empty",
            "recovery_pattern": "empty",
            "max_degradation_rate": 0.0,
            "max_persistence_steps": 0,
            "confidence": 0.0,
            "anomalous_metrics": [],
            "metric_trends": {},
            "sequence_evidence": [],
        }
