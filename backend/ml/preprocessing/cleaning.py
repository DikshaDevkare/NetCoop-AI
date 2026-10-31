"""
Data Quality, Cleaning, and Validation Engine for NetCoop AI Telemetry.

Provides missing-value detection, out-of-bounds checks, duplicate detection,
controlled measurement noise injection, and data quality metrics.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
import pandas as pd
import numpy as np


class TelemetryDataValidator:
    """
    Validates data quality, bounds, and schema integrity across raw and normalized datasets.
    """

    CRITICAL_NUMERIC_COLUMNS = [
        "latency_ms",
        "packet_loss_pct",
        "jitter_ms",
        "cpu_usage_pct",
        "bandwidth_utilization_pct",
    ]

    NUMERIC_BOUNDS = {
        "latency_ms": (0.0, 10000.0),
        "packet_loss_pct": (0.0, 100.0),
        "jitter_ms": (0.0, 5000.0),
        "throughput_mbps": (0.0, 100000.0),
        "bandwidth_utilization_pct": (0.0, 100.0),
        "cpu_usage_pct": (0.0, 100.0),
        "memory_usage_pct": (0.0, 100.0),
        "device_uptime_seconds": (0.0, None),
        "dns_response_time_ms": (0.0, 10000.0),
    }

    @classmethod
    def audit_dataframe(cls, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Audit a pandas DataFrame of telemetry records for quality metrics.

        Returns:
            Dictionary containing total count, duplicate count, missing values,
            and out-of-bounds flags.
        """
        total_rows = len(df)
        duplicates = int(df.duplicated(subset=["incident_id", "device_id", "timestamp"]).sum())

        missing_summary: Dict[str, Dict[str, Any]] = {}
        for col in df.columns:
            null_count = int(df[col].isna().sum())
            if null_count > 0:
                missing_summary[col] = {
                    "missing_count": null_count,
                    "missing_pct": round((null_count / max(1, total_rows)) * 100.0, 2),
                    "is_critical": col in cls.CRITICAL_NUMERIC_COLUMNS,
                }

        out_of_bounds_summary: Dict[str, int] = {}
        for col, (min_val, max_val) in cls.NUMERIC_BOUNDS.items():
            if col in df.columns:
                series = df[col].dropna()
                below = int((series < min_val).sum()) if min_val is not None else 0
                above = int((series > max_val).sum()) if max_val is not None else 0
                invalid_count = below + above
                if invalid_count > 0:
                    out_of_bounds_summary[col] = invalid_count

        return {
            "total_records": total_rows,
            "duplicate_records": duplicates,
            "missing_values": missing_summary,
            "out_of_bounds_records": out_of_bounds_summary,
            "is_clean": (duplicates == 0 and len(out_of_bounds_summary) == 0),
        }

    @classmethod
    def apply_measurement_noise(
        cls,
        df: pd.DataFrame,
        numeric_cols: Optional[List[str]] = None,
        noise_level: float = 0.02,
        seed: Optional[int] = None,
    ) -> pd.DataFrame:
        """
        Add controlled Gaussian measurement noise (e.g. ±2%) to simulate real-world sensor jitter.
        Preserves physical bounds (e.g. percentages remain in [0, 100], latencies >= 0).
        """
        rng = np.random.default_rng(seed)
        df_noisy = df.copy()

        if numeric_cols is None:
            numeric_cols = [
                "latency_ms",
                "jitter_ms",
                "throughput_mbps",
                "bandwidth_utilization_pct",
                "cpu_usage_pct",
                "memory_usage_pct",
            ]

        for col in numeric_cols:
            if col in df_noisy.columns:
                series = df_noisy[col].values
                noise = rng.normal(0, noise_level * np.abs(series))
                noisy_vals = series + noise

                # Apply bounds clamping
                if col in cls.NUMERIC_BOUNDS:
                    min_val, max_val = cls.NUMERIC_BOUNDS[col]
                    if min_val is not None:
                        noisy_vals = np.maximum(noisy_vals, min_val)
                    if max_val is not None:
                        noisy_vals = np.minimum(noisy_vals, max_val)

                df_noisy[col] = np.round(noisy_vals, 2)

        return df_noisy
