"""
End-to-end temporal analysis pipeline for network telemetry streams.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import json
import pandas as pd

from ml.temporal_analysis.config import (
    DEFAULT_WINDOW_SIZE,
    METADATA_FILE,
    MODELS_DIR,
    NORMAL_BASELINES,
    TEMPORAL_METRICS,
)
from ml.temporal_analysis.sequence_builder import SequenceBuilder
from ml.temporal_analysis.temporal_analyzer import TemporalAnalyzer


class TemporalAnalysisPipeline:
    """
    Coordinates sequence grouping, chronological windowing, and temporal trajectory diagnosis.
    """

    VERSION = "1.0.0"

    def __init__(
        self,
        window_size: int = DEFAULT_WINDOW_SIZE,
        analyzer: Optional[TemporalAnalyzer] = None,
    ) -> None:
        self.window_size = window_size
        self.sequence_builder = SequenceBuilder(window_size=window_size)
        self.analyzer = analyzer or TemporalAnalyzer()

    def analyze_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyzes a multi-device, multi-incident dataset or telemetry batch.
        Returns per-(incident, device) trajectory analyses and global summary.
        """
        if not isinstance(df, pd.DataFrame):
            raise TypeError(f"Expected DataFrame, got {type(df).__name__}")
        if df.empty:
            return {
                "total_records": 0,
                "total_series": 0,
                "series_results": {},
                "summary": {"anomalous_series_count": 0, "worsening_count": 0},
            }

        grouped = self.sequence_builder.group_and_sort(df)
        series_results: Dict[str, Any] = {}
        anomalous_count = 0
        worsening_count = 0
        recovering_count = 0

        for (inc_id, dev_id), series_df in grouped.items():
            key = f"{inc_id}::{dev_id}"
            analysis = self.analyzer.analyze_sequence(series_df)
            series_results[key] = {
                "incident_id": inc_id,
                "device_id": dev_id,
                "analysis": analysis,
            }

            if analysis["temporal_anomaly"]:
                anomalous_count += 1
            if analysis["overall_trend"] in ("worsening", "degrading"):
                worsening_count += 1
            elif analysis["overall_trend"] == "recovering":
                recovering_count += 1

        return {
            "total_records": len(df),
            "total_series": len(grouped),
            "series_results": series_results,
            "summary": {
                "anomalous_series_count": anomalous_count,
                "worsening_count": worsening_count,
                "recovering_count": recovering_count,
                "stable_count": len(grouped) - (worsening_count + recovering_count),
            },
        }

    def analyze_device_stream(self, device_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Convenience method for analyzing telemetry for a single device stream.
        """
        grouped = self.sequence_builder.group_and_sort(device_df)
        if not grouped:
            return self.analyzer._empty_result()
        # Take the primary group
        first_series = next(iter(grouped.values()))
        return self.analyzer.analyze_sequence(first_series)

    def save_metadata(self, models_dir: Optional[Union[str, Path]] = None) -> Path:
        """
        Persists pipeline metadata and baseline configuration.
        """
        out_dir = Path(models_dir) if models_dir else MODELS_DIR
        out_dir.mkdir(parents=True, exist_ok=True)
        meta_file = out_dir / "temporal_metadata.json"

        data = {
            "pipeline_type": "SequenceTemporalAnalyzer",
            "version": self.VERSION,
            "window_size": self.window_size,
            "monitored_metrics": TEMPORAL_METRICS,
            "normal_baselines": NORMAL_BASELINES,
        }

        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        return meta_file
