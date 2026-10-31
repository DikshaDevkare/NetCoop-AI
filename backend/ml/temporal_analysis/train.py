"""
Evaluation CLI for Temporal Network Pattern Analysis.
"""

from pathlib import Path
from typing import Any, Dict
import pandas as pd

from ml.temporal_analysis.config import (
    MODELS_DIR,
    REPORT_FILE,
    REPORTS_DIR,
    TEST_DATA_PATH,
    TRAIN_DATA_PATH,
    VAL_DATA_PATH,
)
from ml.temporal_analysis.pipeline import TemporalAnalysisPipeline
from ml.temporal_analysis.reporter import TemporalAnalysisReporter


def run_temporal_evaluation(
    train_path: Path = TRAIN_DATA_PATH,
    val_path: Path = VAL_DATA_PATH,
    test_path: Path = TEST_DATA_PATH,
    models_dir: Path = MODELS_DIR,
    reports_dir: Path = REPORTS_DIR,
) -> Dict[str, Any]:
    """
    Evaluates temporal dynamics across train, validation, and test datasets.
    """
    print("=" * 70)
    print("NETCOOP AI — TEMPORAL NETWORK PATTERN ANALYSIS PIPELINE")
    print("=" * 70)

    print("\n[1/4] Initializing temporal analysis pipeline...")
    pipeline = TemporalAnalysisPipeline(window_size=5)

    print("\n[2/4] Evaluating temporal trajectory dynamics across dataset splits...")
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)

    train_res = pipeline.analyze_dataframe(train_df)
    val_res = pipeline.analyze_dataframe(val_df)
    test_res = pipeline.analyze_dataframe(test_df)

    print(
        f"  • Train: {train_res['total_records']} records across {train_res['total_series']} series "
        f"({train_res['summary']['anomalous_series_count']} anomalous, "
        f"{train_res['summary']['worsening_count']} worsening)"
    )
    print(
        f"  • Val:   {val_res['total_records']} records across {val_res['total_series']} series "
        f"({val_res['summary']['anomalous_series_count']} anomalous, "
        f"{val_res['summary']['worsening_count']} worsening)"
    )
    print(
        f"  • Test:  {test_res['total_records']} records across {test_res['total_series']} series "
        f"({test_res['summary']['anomalous_series_count']} anomalous, "
        f"{test_res['summary']['worsening_count']} worsening)"
    )

    print("\n[3/4] Persisting temporal metadata...")
    meta_path = pipeline.save_metadata(models_dir=models_dir)
    print(f"  • Metadata saved to: {meta_path}")

    print("\n[4/4] Generating temporal diagnostic report...")
    report_path = reports_dir / "temporal_analysis_report.md"
    TemporalAnalysisReporter.generate_report(
        train_summary=train_res,
        val_summary=val_res,
        test_summary=test_res,
        output_path=report_path,
    )
    print(f"  • Report generated:  {report_path}")

    print("\n" + "=" * 70)
    print("TEMPORAL NETWORK PATTERN ANALYSIS COMPLETED SUCCESSFULLY")
    print("=" * 70)

    return {
        "pipeline": pipeline,
        "train_res": train_res,
        "val_res": val_res,
        "test_res": test_res,
        "meta_path": meta_path,
        "report_path": report_path,
    }


if __name__ == "__main__":
    run_temporal_evaluation()
