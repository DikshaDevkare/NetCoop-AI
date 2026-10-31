"""
Unit tests for incident-wise dataset splitting and leakage prevention.
"""

import pandas as pd
from ml.split_dataset import IncidentDataSplitter


def test_incident_wise_splitting_no_leakage() -> None:
    """Verify incident-wise partitioning produces zero incident overlap between splits."""
    rows = []
    # 10 incidents across 2 scenarios
    for i in range(10):
        inc_id = f"INC-{i:03d}"
        scenario = "normal" if i < 5 else "congestion"
        for step in range(5):
            rows.append({
                "incident_id": inc_id,
                "scenario_label": scenario,
                "device_id": "SW-01",
                "timestamp": f"2026-11-01T08:00:{step:02d}Z",
                "latency_ms": 15.0,
            })

    df = pd.DataFrame(rows)
    train_df, val_df, test_df, report = IncidentDataSplitter.split_by_incidents(
        df, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15, seed=42
    )

    s_train = set(train_df["incident_id"].unique())
    s_val = set(val_df["incident_id"].unique())
    s_test = set(test_df["incident_id"].unique())

    # Assert total incidents preserved
    assert len(s_train) + len(s_val) + len(s_test) == 10

    # Assert ZERO overlap between splits
    assert len(s_train.intersection(s_val)) == 0
    assert len(s_train.intersection(s_test)) == 0
    assert len(s_val.intersection(s_test)) == 0

    assert report["leakage_verification"]["is_leakage_free"] is True


def test_splitting_reproducibility() -> None:
    """Verify same seed produces identical incident partitions."""
    rows = []
    for i in range(6):
        rows.append({
            "incident_id": f"INC-{i}",
            "scenario_label": "normal",
            "device_id": "SW-01",
            "timestamp": "2026-11-01T08:00:00Z",
            "latency_ms": 15.0,
        })
    df = pd.DataFrame(rows)

    t1, v1, te1, _ = IncidentDataSplitter.split_by_incidents(df, seed=99)
    t2, v2, te2, _ = IncidentDataSplitter.split_by_incidents(df, seed=99)

    assert set(t1["incident_id"]) == set(t2["incident_id"])
    assert set(v1["incident_id"]) == set(v2["incident_id"])
    assert set(te1["incident_id"]) == set(te2["incident_id"])
