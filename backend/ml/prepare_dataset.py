"""
Master Telemetry Dataset Preparation Pipeline for NetCoop AI.

Normalizes raw synthetic telemetry, derives causal temporal features,
partitions data incident-wise (Train/Val/Test), and compiles statistical audit reports.
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from ml.config import PROCESSED_DATA_DIR, RAW_DATA_DIR, REPORTS_DIR
from ml.dataset_statistics import DatasetStatisticsReporter
from ml.generate_dataset import generate_all_raw_data
from ml.preprocessing.feature_engineering import TelemetryFeatureEngineer
from ml.preprocessing.normalizer import TelemetryNormalizer
from ml.split_dataset import IncidentDataSplitter


def run_preparation_pipeline(
    raw_json_path: Optional[Path] = None,
    output_dir: Path = PROCESSED_DATA_DIR,
    reports_dir: Path = REPORTS_DIR,
    seed: int = 42,
) -> Dict[str, Any]:
    """
    Execute end-to-end dataset preparation pipeline.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    if raw_json_path is None or not raw_json_path.exists():
        raw_outputs = generate_all_raw_data(seed=seed)
        raw_json_path = raw_outputs["raw_json"]

    print(f"Loading raw records from: {raw_json_path}...")
    with open(raw_json_path, "r", encoding="utf-8") as f:
        raw_records = json.load(f)

    # 1. Normalize records
    print("Normalizing records to Phase 2 standard schemas...")
    normalized_records = [TelemetryNormalizer.normalize_record(r) for r in raw_records]
    normalized_dicts = [rec.model_dump(mode="json") for rec in normalized_records]
    df_normalized = pd.DataFrame(normalized_dicts)

    # 2. Derive causal temporal and differential features
    print("Computing causal rolling features and rate-of-change metrics...")
    df_featured = TelemetryFeatureEngineer.compute_features(df_normalized, window_size=3)

    # Save complete processed dataset
    full_path = output_dir / "full_processed.csv"
    df_featured.to_csv(full_path, index=False)
    print(f"Saved full processed dataset ({len(df_featured)} records) -> {full_path}")

    # 3. Incident-wise dataset splitting
    print("Partitioning dataset incident-wise into Train, Validation, and Test...")
    train_df, val_df, test_df, split_report = IncidentDataSplitter.split_by_incidents(
        df_featured,
        train_ratio=0.70,
        val_ratio=0.15,
        test_ratio=0.15,
        seed=seed,
    )

    split_paths = IncidentDataSplitter.save_splits(train_df, val_df, test_df, output_dir=output_dir)
    print(f"Partitions created: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")

    # 4. Generate comprehensive dataset statistics and quality reports
    print("Compiling statistical summaries and audit reports...")
    stats = DatasetStatisticsReporter.generate_statistics(df_featured, split_report=split_report)
    report_paths = DatasetStatisticsReporter.save_reports(stats, output_dir=reports_dir)
    print(f"Reports compiled -> {report_paths['json']} and {report_paths['markdown']}")

    return {
        "full_dataset": full_path,
        "splits": split_paths,
        "reports": report_paths,
        "statistics": stats,
    }


if __name__ == "__main__":
    run_preparation_pipeline()
