"""
Temporal Feature Engineering for Network Telemetry ML.

Calculates causal rolling statistics, rates of change, and domain pressure indicators
strictly grouped by (incident_id, device_id) without forward lookahead or cross-incident leakage.
"""

from typing import List
import numpy as np
import pandas as pd


class TelemetryFeatureEngineer:
    """
    Computes time-series and rate-of-change features for ML models.
    """

    @classmethod
    def compute_features(
        cls,
        df: pd.DataFrame,
        window_size: int = 3,
    ) -> pd.DataFrame:
        """
        Derive causal temporal features on normalized telemetry data.

        Strictly enforces:
        1. Chronological sorting by [incident_id, device_id, timestamp].
        2. Windowing strictly bounded within [incident_id, device_id] groups.
        3. No future-data leakage (rolling operations use past observations only).
        4. Target labels and incident IDs are excluded from feature calculation.

        Args:
            df: Normalized telemetry DataFrame.
            window_size: Rolling window size (default 3 steps).

        Returns:
            DataFrame augmented with engineered feature columns.
        """
        # Ensure chronological sort
        df_sorted = df.sort_values(by=["incident_id", "device_id", "timestamp"]).copy()

        # Grouping key
        groups = df_sorted.groupby(["incident_id", "device_id"])

        # 1. Rolling Mean Features (Causal, past observations only)
        df_sorted["rolling_latency_mean"] = groups["latency_ms"].transform(
            lambda s: s.rolling(window=window_size, min_periods=1).mean()
        )
        df_sorted["rolling_latency_std"] = groups["latency_ms"].transform(
            lambda s: s.rolling(window=window_size, min_periods=1).std().fillna(0.0)
        )
        df_sorted["rolling_packet_loss_mean"] = groups["packet_loss_pct"].transform(
            lambda s: s.rolling(window=window_size, min_periods=1).mean()
        )
        df_sorted["rolling_jitter_mean"] = groups["jitter_ms"].transform(
            lambda s: s.rolling(window=window_size, min_periods=1).mean()
        )
        df_sorted["rolling_cpu_mean"] = groups["cpu_usage_pct"].transform(
            lambda s: s.rolling(window=window_size, min_periods=1).mean()
        )
        df_sorted["rolling_memory_mean"] = groups["memory_usage_pct"].transform(
            lambda s: s.rolling(window=window_size, min_periods=1).mean()
        )

        # 2. Rate of Change / Differential Features (Diff with preceding time step)
        df_sorted["latency_change_rate"] = groups["latency_ms"].transform(
            lambda s: s.diff().fillna(0.0)
        )
        df_sorted["packet_loss_change_rate"] = groups["packet_loss_pct"].transform(
            lambda s: s.diff().fillna(0.0)
        )
        df_sorted["utilization_change_rate"] = groups["bandwidth_utilization_pct"].transform(
            lambda s: s.diff().fillna(0.0)
        )
        df_sorted["queue_drop_rate"] = groups["queue_drops"].transform(
            lambda s: s.diff().fillna(0.0)
        )
        df_sorted["interface_error_rate"] = groups["interface_errors"].transform(
            lambda s: s.diff().fillna(0.0)
        )

        # 3. Domain Compound Indicator: Bandwidth Pressure Indicator
        # Formula: (utilization / 100.0) * (1.0 + queue_drops / 500.0)
        util_ratio = df_sorted["bandwidth_utilization_pct"] / 100.0
        queue_penalty = 1.0 + (df_sorted["queue_drops"] / 500.0)
        df_sorted["bandwidth_pressure_indicator"] = np.round(util_ratio * queue_penalty, 4)

        # Round numerical features for clarity and storage efficiency
        float_cols = [
            "rolling_latency_mean",
            "rolling_latency_std",
            "rolling_packet_loss_mean",
            "rolling_jitter_mean",
            "rolling_cpu_mean",
            "rolling_memory_mean",
            "latency_change_rate",
            "packet_loss_change_rate",
            "utilization_change_rate",
            "queue_drop_rate",
            "interface_error_rate",
        ]
        df_sorted[float_cols] = df_sorted[float_cols].round(2)

        return df_sorted

    @classmethod
    def get_feature_column_names(cls) -> List[str]:
        """
        Return the list of pure feature column names intended for ML model consumption.
        Excludes identifiers, raw timestamps, and target labels.
        """
        return [
            # Base standardized metrics
            "latency_ms",
            "packet_loss_pct",
            "jitter_ms",
            "throughput_mbps",
            "bandwidth_utilization_pct",
            "cpu_usage_pct",
            "memory_usage_pct",
            "device_uptime_seconds",
            "dns_response_time_ms",
            "queue_drops",
            "interface_errors",
            "retransmissions",
            # Derived temporal features
            "rolling_latency_mean",
            "rolling_latency_std",
            "rolling_packet_loss_mean",
            "rolling_jitter_mean",
            "rolling_cpu_mean",
            "rolling_memory_mean",
            "latency_change_rate",
            "packet_loss_change_rate",
            "utilization_change_rate",
            "queue_drop_rate",
            "interface_error_rate",
            "bandwidth_pressure_indicator",
        ]
