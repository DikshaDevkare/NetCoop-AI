"""
Incident-Wise Dataset Splitting for NetCoop AI.

Splits telemetry datasets into Train, Validation, and Test partitions strictly by
incident_id, completely preventing temporal and incident-level data leakage.
"""

from pathlib import Path
import random
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from ml.config import PROCESSED_DATA_DIR, TEST_RATIO, TRAIN_RATIO, VAL_RATIO


class IncidentDataSplitter:
    """
    Partitions telemetry data incident-wise to prevent temporal leakage.
    """

    @classmethod
    def split_by_incidents(
        cls,
        df: pd.DataFrame,
        train_ratio: float = TRAIN_RATIO,
        val_ratio: float = VAL_RATIO,
        test_ratio: float = TEST_RATIO,
        seed: Optional[int] = 42,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
        """
        Partition DataFrame by incident IDs ensuring zero incident overlap across splits.

        Args:
            df: Normalized or feature-engineered DataFrame containing 'incident_id' and 'scenario_label'.
            train_ratio: Proportion of incidents for training (default 0.70).
            val_ratio: Proportion of incidents for validation (default 0.15).
            test_ratio: Proportion of incidents for testing (default 0.15).
            seed: Random seed for deterministic splitting.

        Returns:
            Tuple of (train_df, val_df, test_df, split_report_dict).
        """
        rng = random.Random(seed)

        # Group incidents by scenario to maintain scenario balance across partitions
        scenario_incidents: Dict[str, List[str]] = {}
        for scenario, group in df.groupby("scenario_label"):
            unique_incs = sorted(group["incident_id"].unique())
            rng.shuffle(unique_incs)
            scenario_incidents[scenario] = unique_incs

        train_incidents: List[str] = []
        val_incidents: List[str] = []
        test_incidents: List[str] = []

        # Allocate incidents per scenario
        for scenario, inc_list in scenario_incidents.items():
            n = len(inc_list)
            if n == 1:
                # If only 1 incident exists, assign to train
                train_incidents.extend(inc_list)
                continue

            n_train = max(1, int(round(n * train_ratio)))
            n_val = max(1, int(round(n * val_ratio)))
            # Remaining go to test
            train_part = inc_list[:n_train]
            val_part = inc_list[n_train : n_train + n_val]
            test_part = inc_list[n_train + n_val :]

            # Ensure at least 1 in test if n >= 3
            if not test_part and len(train_part) > 1:
                test_part.append(train_part.pop())

            train_incidents.extend(train_part)
            val_incidents.extend(val_part)
            test_incidents.extend(test_part)

        # Verify zero overlap
        s_train = set(train_incidents)
        s_val = set(val_incidents)
        s_test = set(test_incidents)
        assert len(s_train.intersection(s_val)) == 0, "Incident leakage detected between Train and Val!"
        assert len(s_train.intersection(s_test)) == 0, "Incident leakage detected between Train and Test!"
        assert len(s_val.intersection(s_test)) == 0, "Incident leakage detected between Val and Test!"

        # Create split DataFrames
        train_df = df[df["incident_id"].isin(s_train)].sort_values(by=["incident_id", "device_id", "timestamp"]).copy()
        val_df = df[df["incident_id"].isin(s_val)].sort_values(by=["incident_id", "device_id", "timestamp"]).copy()
        test_df = df[df["incident_id"].isin(s_test)].sort_values(by=["incident_id", "device_id", "timestamp"]).copy()

        # Generate split report
        report = {
            "random_seed": seed,
            "total_incidents": len(s_train) + len(s_val) + len(s_test),
            "total_records": len(df),
            "train": {
                "incident_count": len(s_train),
                "record_count": len(train_df),
                "record_pct": round((len(train_df) / max(1, len(df))) * 100.0, 2),
                "scenarios": train_df["scenario_label"].value_counts().to_dict(),
            },
            "validation": {
                "incident_count": len(s_val),
                "record_count": len(val_df),
                "record_pct": round((len(val_df) / max(1, len(df))) * 100.0, 2),
                "scenarios": val_df["scenario_label"].value_counts().to_dict(),
            },
            "test": {
                "incident_count": len(s_test),
                "record_count": len(test_df),
                "record_pct": round((len(test_df) / max(1, len(df))) * 100.0, 2),
                "scenarios": test_df["scenario_label"].value_counts().to_dict(),
            },
            "leakage_verification": {
                "train_val_overlap": len(s_train.intersection(s_val)),
                "train_test_overlap": len(s_train.intersection(s_test)),
                "val_test_overlap": len(s_val.intersection(s_test)),
                "is_leakage_free": True,
            },
        }

        return train_df, val_df, test_df, report

    @classmethod
    def save_splits(
        cls,
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_df: pd.DataFrame,
        output_dir: Path = PROCESSED_DATA_DIR,
    ) -> Dict[str, Path]:
        """Save train, val, and test partitions to CSV files."""
        output_dir.mkdir(parents=True, exist_ok=True)
        train_path = output_dir / "train.csv"
        val_path = output_dir / "val.csv"
        test_path = output_dir / "test.csv"

        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)

        return {
            "train": train_path,
            "val": val_path,
            "test": test_path,
        }
