"""
Training CLI and pipeline runner for XGBoost Multi-Class Fault Classification.
"""

from pathlib import Path
from typing import Any, Dict, Optional
import json
import pandas as pd

from ml.fault_classification.classifier import TelemetryXGBoostClassifier
from ml.fault_classification.config import (
    METADATA_FILE,
    METRICS_FILE,
    MODEL_FILE,
    MODELS_DIR,
    REPORTS_DIR,
    TARGET_CLASSES,
    TEST_DATA_PATH,
    TRAIN_DATA_PATH,
    VAL_DATA_PATH,
)
from ml.fault_classification.pipeline import FaultClassificationPipeline
from ml.fault_classification.reporter import FaultAnalysisReporter


def run_training_pipeline(
    train_path: Path = TRAIN_DATA_PATH,
    val_path: Path = VAL_DATA_PATH,
    test_path: Path = TEST_DATA_PATH,
    models_dir: Path = MODELS_DIR,
    reports_dir: Path = REPORTS_DIR,
    n_estimators: int = 120,
    max_depth: int = 5,
    learning_rate: float = 0.08,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Executes end-to-end training, validation, testing, artifact persistence,
    and report generation for multi-class fault classification.
    """
    print("=" * 70)
    print("NETCOOP AI — XGBOOST MULTI-CLASS FAULT CLASSIFICATION TRAINING")
    print("=" * 70)

    # 1. Load datasets
    print("\n[1/5] Loading datasets...")
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)

    print(f"  • Train dataset:      {train_path} ({len(train_df)} records)")
    print(f"  • Validation dataset: {val_path} ({len(val_df)} records)")
    print(f"  • Test dataset:       {test_path} ({len(test_df)} records)")

    # 2. Initialize classifier
    print("\n[2/5] Initializing XGBoost multi-class classifier...")
    print(f"  • Target classes ({len(TARGET_CLASSES)}): {TARGET_CLASSES}")
    print(f"  • Hyperparameters: n_estimators={n_estimators}, max_depth={max_depth}, lr={learning_rate}")

    classifier = TelemetryXGBoostClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        random_state=random_state,
    )
    pipeline = FaultClassificationPipeline(classifier=classifier)

    # 3. Fit pipeline on training data
    print("\n[3/5] Fitting classifier on training data (evaluating on validation set)...")
    pipeline.fit(train_df=train_df, val_df=val_df, verbose=False)
    print("  • Model fitting complete.")

    val_metrics = pipeline.val_metrics or pipeline.evaluate(val_df)
    print(f"  • Validation Accuracy:      {val_metrics['accuracy'] * 100:.2f}%")
    print(f"  • Validation Macro F1:      {val_metrics['f1_macro']:.4f}")
    print(f"  • Validation Weighted F1:   {val_metrics['f1_weighted']:.4f}")
    if val_metrics.get("roc_auc_weighted"):
        print(f"  • Validation ROC-AUC (OvR): {val_metrics['roc_auc_weighted']:.4f}")

    # 4. Final unbiased test set evaluation
    print("\n[4/5] Evaluating model on unseen test set...")
    test_metrics = pipeline.evaluate(test_df)
    print(f"  • Test Accuracy:            {test_metrics['accuracy'] * 100:.2f}%")
    print(f"  • Test Macro F1:            {test_metrics['f1_macro']:.4f}")
    print(f"  • Test Weighted F1:         {test_metrics['f1_weighted']:.4f}")
    if test_metrics.get("roc_auc_weighted"):
        print(f"  • Test ROC-AUC (OvR):       {test_metrics['roc_auc_weighted']:.4f}")

    print("\n  Per-Class Test Performance:")
    for cls_name, pcm in test_metrics.get("per_class_metrics", {}).items():
        print(
            f"    - {cls_name:18s} | Prec: {pcm['precision']:.4f} | "
            f"Rec: {pcm['recall']:.4f} | F1: {pcm['f1_score']:.4f} (N={pcm['support']})"
        )

    # 5. Persist artifacts and reports
    print("\n[5/5] Persisting model artifacts and diagnostic reports...")
    models_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    saved_paths = pipeline.save(models_dir=models_dir)
    print(f"  • Serialized Model:     {saved_paths['model_path']}")
    print(f"  • Classifier Metadata:  {saved_paths['metadata_path']}")

    metrics_file = models_dir / "classification_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(test_metrics, f, indent=2)
    print(f"  • Test Metrics:         {metrics_file}")

    feature_importances = classifier.get_feature_importances()

    # Generate SVGs and Markdown report
    cm_svg_path = reports_dir / "confusion_matrix.svg"
    fi_svg_path = reports_dir / "feature_importance.svg"
    md_report_path = reports_dir / "classification_report.md"

    FaultAnalysisReporter.generate_confusion_matrix_svg(
        cm_raw=test_metrics["confusion_matrix_raw"],
        classes=TARGET_CLASSES,
        output_path=cm_svg_path,
    )
    print(f"  • Confusion Matrix SVG: {cm_svg_path}")

    FaultAnalysisReporter.generate_feature_importance_svg(
        feature_importances=feature_importances,
        output_path=fi_svg_path,
    )
    print(f"  • Feature Importance SVG: {fi_svg_path}")

    FaultAnalysisReporter.generate_markdown_report(
        val_metrics=val_metrics,
        test_metrics=test_metrics,
        feature_importances=feature_importances,
        output_path=md_report_path,
    )
    print(f"  • Diagnostic Report MD: {md_report_path}")

    print("\n" + "=" * 70)
    print("XGBOOST MULTI-CLASS FAULT CLASSIFICATION TRAINING COMPLETED")
    print("=" * 70)

    return {
        "pipeline": pipeline,
        "val_metrics": val_metrics,
        "test_metrics": test_metrics,
        "saved_paths": saved_paths,
        "metrics_file": metrics_file,
    }


if __name__ == "__main__":
    run_training_pipeline()
