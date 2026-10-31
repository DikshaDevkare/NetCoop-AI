"""
Master Training and Evaluation Pipeline CLI for NetCoop AI Isolation Forest Anomaly Detection.
Executed via: python -m ml.anomaly_detection.train
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from ml.anomaly_detection.config import (
    DEFAULT_CONTAMINATION,
    DEFAULT_F_BETA,
    DEFAULT_N_ESTIMATORS,
    DEFAULT_RANDOM_STATE,
    METADATA_FILE,
    MODEL_FILE,
    MODELS_DIR,
    REPORTS_DIR,
    TEST_DATA_PATH,
    TEST_METRICS_FILE,
    TRAIN_DATA_PATH,
    VAL_DATA_PATH,
    VAL_METRICS_FILE,
)
from ml.anomaly_detection.detector import TelemetryIsolationForest
from ml.anomaly_detection.pipeline import AnomalyDetectionPipeline
from ml.anomaly_detection.reporter import AnomalyAnalysisReporter


def run_training_pipeline(
    train_path: Path = TRAIN_DATA_PATH,
    val_path: Path = VAL_DATA_PATH,
    test_path: Path = TEST_DATA_PATH,
    models_dir: Path = MODELS_DIR,
    reports_dir: Path = REPORTS_DIR,
    random_state: int = DEFAULT_RANDOM_STATE,
    n_estimators: int = DEFAULT_N_ESTIMATORS,
    contamination: str = DEFAULT_CONTAMINATION,
    beta: float = DEFAULT_F_BETA,
) -> Dict[str, Any]:
    """
    Execute end-to-end Isolation Forest anomaly detection training, threshold tuning, and testing.
    """
    print("=" * 70)
    print("NETCOOP AI — ISOLATION FOREST ANOMALY DETECTION TRAINING PIPELINE")
    print("=" * 70)

    # ---------------------------------------------------------
    # STEP A: Load and Validate Datasets
    # ---------------------------------------------------------
    for p, name in [(train_path, "train.csv"), (val_path, "val.csv"), (test_path, "test.csv")]:
        if not p.exists():
            raise FileNotFoundError(f"Required dataset not found: {p}. Run ml.prepare_dataset first.")

    print(f"\n[1/6] Loading datasets...")
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)

    print(f"  • Train dataset: {train_path} ({len(train_df)} records)")
    print(f"  • Validation dataset: {val_path} ({len(val_df)} records)")
    print(f"  • Test dataset: {test_path} ({len(test_df)} records)")

    # ---------------------------------------------------------
    # STEP B: Prepare Training Baseline (Normal Only)
    # ---------------------------------------------------------
    print(f"\n[2/6] Isolating healthy normal operational baseline for training...")
    if "scenario_label" not in train_df.columns:
        raise ValueError("train_df missing 'scenario_label' column.")

    normal_train_df = train_df[train_df["scenario_label"] == "normal"].copy()
    fault_train_count = len(train_df) - len(normal_train_df)

    if normal_train_df.empty:
        raise ValueError("Zero 'normal' records found in training dataset. Cannot fit baseline.")

    print(f"  • Total training records: {len(train_df)}")
    print(f"  • Healthy normal records selected for fit: {len(normal_train_df)} (100% clean baseline)")
    print(f"  • Fault records excluded from fit: {fault_train_count}")

    # ---------------------------------------------------------
    # STEP C: Fit Isolation Forest Model
    # ---------------------------------------------------------
    print(f"\n[3/6] Initializing and fitting Isolation Forest detector...")
    print(f"  • Hyperparameters: n_estimators={n_estimators}, contamination='{contamination}', random_state={random_state}")

    detector = TelemetryIsolationForest(
        n_estimators=n_estimators,
        contamination=contamination,
        random_state=random_state,
    )
    pipeline = AnomalyDetectionPipeline(detector=detector)
    pipeline.fit(train_df=normal_train_df, val_df=None, tune_threshold=False)

    print(f"  • Detector successfully fitted on {pipeline.detector.train_samples_count} normal records.")

    # ---------------------------------------------------------
    # STEP D: Validation & Threshold Optimization (Maximizing F2)
    # ---------------------------------------------------------
    print(f"\n[4/6] Optimizing anomaly decision threshold on validation set ({len(val_df)} records)...")
    best_threshold, tuning_summary = pipeline.evaluator.tune_threshold(
        detector=pipeline.detector,
        val_df=val_df,
        beta=beta,
    )
    pipeline.detector.set_threshold(
        threshold=best_threshold,
        selection_method=f"validation_f{int(beta)}_tuning",
    )
    pipeline.validation_summary = tuning_summary

    val_metrics = pipeline.evaluate(val_df, threshold=best_threshold, beta=beta)
    print(f"  • Selected Decision Threshold: {best_threshold:.6f}")
    print(f"  • Objective: Maximize F{int(beta)}-score (prioritizing fault recall)")
    print(f"  • Validation Metrics at Chosen Threshold:")
    print(f"      - Accuracy:  {val_metrics['accuracy'] * 100:.2f}%")
    print(f"      - Precision: {val_metrics['precision'] * 100:.2f}%")
    print(f"      - Recall:    {val_metrics['recall'] * 100:.2f}%")
    print(f"      - F1-Score:  {val_metrics['f1_score']:.4f}")
    print(f"      - F{int(beta)}-Score:  {val_metrics[f'f{int(beta)}_score']:.4f}")
    print(f"      - ROC-AUC:   {val_metrics.get('roc_auc', 'N/A')}")
    print(f"      - PR-AUC:    {val_metrics.get('pr_auc', 'N/A')}")

    # ---------------------------------------------------------
    # STEP E: Unbiased Test Set Evaluation
    # ---------------------------------------------------------
    print(f"\n[5/6] Performing final evaluation on out-of-incident test set ({len(test_df)} records)...")
    print(f"  • Using validation-derived threshold: {best_threshold:.6f} (unchanged)")
    test_preds, test_scores = pipeline.predict_with_scores(test_df, threshold=best_threshold)
    test_metrics = pipeline.evaluate(test_df, threshold=best_threshold, beta=beta)

    print(f"  • Test Performance Summary:")
    print(f"      - Accuracy:  {test_metrics['accuracy'] * 100:.2f}%")
    print(f"      - Precision: {test_metrics['precision'] * 100:.2f}%")
    print(f"      - Recall:    {test_metrics['recall'] * 100:.2f}%")
    print(f"      - F1-Score:  {test_metrics['f1_score']:.4f}")
    print(f"      - F{int(beta)}-Score:  {test_metrics[f'f{int(beta)}_score']:.4f}")
    print(f"      - ROC-AUC:   {test_metrics.get('roc_auc', 'N/A')}")
    print(f"      - PR-AUC:    {test_metrics.get('pr_auc', 'N/A')}")
    cm = test_metrics["confusion_matrix"]
    print(f"  • Test Confusion Matrix:")
    print(f"      - True Positives (Detected Faults):  {cm['true_positives']}")
    print(f"      - True Negatives (Correct Healthy):   {cm['true_negatives']}")
    print(f"      - False Positives (False Alarms):     {cm['false_positives']}")
    print(f"      - False Negatives (Missed Faults):    {cm['false_negatives']}")

    # ---------------------------------------------------------
    # STEP F: Save Artifacts & Reports
    # ---------------------------------------------------------
    print(f"\n[6/6] Persisting model artifacts and generating diagnostic reports...")
    models_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    # 1. Save model joblib & model metadata
    saved_paths = pipeline.save(models_dir=models_dir)
    print(f"  • Serialized Model:   {saved_paths['model_path']}")
    print(f"  • Model Metadata:     {saved_paths['metadata_path']}")

    # 2. Save validation & test metrics JSON
    val_metrics_file = models_dir / "validation_metrics.json"
    with open(val_metrics_file, "w", encoding="utf-8") as f:
        json.dump(val_metrics, f, indent=2)
    print(f"  • Validation Metrics: {val_metrics_file}")

    test_metrics_file = models_dir / "test_metrics.json"
    with open(test_metrics_file, "w", encoding="utf-8") as f:
        json.dump(test_metrics, f, indent=2)
    print(f"  • Test Metrics:       {test_metrics_file}")

    # 3. Generate diagnostic analysis and visualizations
    analysis_paths = AnomalyAnalysisReporter.generate_all_reports(
        test_df=test_df,
        val_df=val_df,
        test_metrics=test_metrics,
        val_metrics=val_metrics,
        test_scores=test_scores,
        test_preds=test_preds,
        output_dir=reports_dir,
    )
    print(f"  • Analysis Report:    {analysis_paths['analysis_md']}")
    print(f"  • Detailed Analysis:  {analysis_paths['analysis_json']}")
    print(f"  • Confusion Matrix:   {analysis_paths['confusion_matrix_svg']}")
    print(f"  • ROC Curve:          {analysis_paths['roc_svg']}")

    print("\n" + "=" * 70)
    print("PHASE 3.2 ISOLATION FOREST TRAINING COMPLETED SUCCESSFULLY")
    print("=" * 70)

    return {
        "pipeline": pipeline,
        "val_metrics": val_metrics,
        "test_metrics": test_metrics,
        "best_threshold": best_threshold,
        "saved_paths": saved_paths,
        "analysis_paths": analysis_paths,
    }


if __name__ == "__main__":
    run_training_pipeline()
