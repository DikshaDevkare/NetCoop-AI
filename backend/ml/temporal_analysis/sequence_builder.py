"""
Chronological sequence builder for multi-device network telemetry.
"""

from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from ml.temporal_analysis.config import DEFAULT_WINDOW_SIZE, MIN_SEQUENCE_LENGTH, TEMPORAL_METRICS


class SequenceBuilder:
    """
    Groups, sorts, and windows network telemetry by incident_id and device_id,
    strictly preventing incident leakage and future data leakage.
    """

    def __init__(
        self,
        window_size: int = DEFAULT_WINDOW_SIZE,
        min_sequence_length: int = MIN_SEQUENCE_LENGTH,
    ) -> None:
        self.window_size = window_size
        self.min_sequence_length = min_sequence_length

    def group_and_sort(self, df: pd.DataFrame) -> Dict[Tuple[str, str], pd.DataFrame]:
        """
        Groups telemetry by (incident_id, device_id) and sorts chronologically.
        If incident_id is missing, falls back to grouping solely by device_id or 'default'.
        """
        if not isinstance(df, pd.DataFrame):
            raise TypeError(f"Expected pandas DataFrame, got {type(df).__name__}")
        if df.empty:
            return {}

        work_df = df.copy()

        # Handle missing grouping keys gracefully
        if "incident_id" not in work_df.columns:
            work_df["incident_id"] = "INC-UNKNOWN"
        if "device_id" not in work_df.columns:
            work_df["device_id"] = "DEV-UNKNOWN"

        # Ensure timestamp is parsed for deterministic sorting
        if "timestamp" in work_df.columns:
            work_df["_sort_ts"] = pd.to_datetime(work_df["timestamp"], errors="coerce")
            work_df = work_df.sort_values(by=["incident_id", "device_id", "_sort_ts"])
            work_df = work_df.drop(columns=["_sort_ts"])

        grouped: Dict[Tuple[str, str], pd.DataFrame] = {}
        for (inc_id, dev_id), group in work_df.groupby(["incident_id", "device_id"], sort=False):
            grouped[(str(inc_id), str(dev_id))] = group.reset_index(drop=True)

        return grouped

    def build_sliding_windows(
        self,
        df: pd.DataFrame,
    ) -> List[Dict[str, Any]]:
        """
        Builds chronological sliding window sequences of length <= window_size.
        """
        grouped = self.group_and_sort(df)
        sequences: List[Dict[str, Any]] = []

        for (inc_id, dev_id), series_df in grouped.items():
            n_rows = len(series_df)
            if n_rows < 1:
                continue

            # Slide window across series
            for end_idx in range(1, n_rows + 1):
                start_idx = max(0, end_idx - self.window_size)
                window_df = series_df.iloc[start_idx:end_idx]

                sequences.append({
                    "incident_id": inc_id,
                    "device_id": dev_id,
                    "window_size": len(window_df),
                    "start_idx": start_idx,
                    "end_idx": end_idx,
                    "data": window_df,
                    "latest_record": window_df.iloc[-1].to_dict(),
                })

        return sequences
