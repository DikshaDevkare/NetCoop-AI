"""
Master Synthetic Dataset Generation Script for NetCoop AI.

Generates raw multi-device incident telemetry across all clean scenarios,
outputs raw datasets, and creates the isolated interoperability test corpus.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd

from ml.config import (
    CLEAN_SCENARIOS,
    DEFAULT_INCIDENTS_PER_SCENARIO,
    DEFAULT_RANDOM_SEED,
    RAW_DATA_DIR,
    TEST_CORPUS_DIR,
)
from ml.generators.incident_generator import IncidentGenerator
from ml.generators.scenario_generator import ScenarioGenerator


def generate_all_raw_data(
    incidents_per_scenario: int = DEFAULT_INCIDENTS_PER_SCENARIO,
    seed: int = DEFAULT_RANDOM_SEED,
    output_dir: Path = RAW_DATA_DIR,
    test_corpus_dir: Path = TEST_CORPUS_DIR,
) -> Dict[str, Path]:
    """
    Generate complete synthetic raw dataset and isolated malformed test corpus.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    test_corpus_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating synthetic telemetry: {incidents_per_scenario} incidents/scenario, seed={seed}...")

    # 1. Generate Clean Incident Telemetry
    incident_gen = IncidentGenerator(seed=seed)
    raw_records = incident_gen.generate_dataset_incidents(
        incidents_per_scenario=incidents_per_scenario,
        scenarios=CLEAN_SCENARIOS,
    )

    # Save Clean JSON
    json_path = output_dir / "raw_incidents.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(raw_records, f, indent=2)

    # Flatten metrics for raw CSV export
    flattened_rows: List[Dict[str, Any]] = []
    for r in raw_records:
        row = {
            "incident_id": r["incident_id"],
            "scenario_id": r["scenario_id"],
            "scenario_label": r["scenario_label"],
            "device_id": r["device_id"],
            "device_type": r["device_type"],
            "hostname": r["hostname"],
            "network_segment": r["network_segment"],
            "timestamp": r["timestamp"],
            "status": r["status"],
            "synthetic_data": r["synthetic_data"],
        }
        for k, v in r["metrics"].items():
            row[k] = v
        flattened_rows.append(row)

    csv_path = output_dir / "raw_incidents.csv"
    pd.DataFrame(flattened_rows).to_csv(csv_path, index=False)
    print(f"Generated {len(raw_records)} records across {len(CLEAN_SCENARIOS)} scenarios -> {csv_path}")

    # 2. Generate Separate Malformed Interoperability Corpus (Scenario H)
    scenario_gen = ScenarioGenerator(seed=seed + 100)
    malformed_corpus = scenario_gen.generate_interoperability_failure_corpus(count=20)
    malformed_path = test_corpus_dir / "interoperability_malformed.json"
    with open(malformed_path, "w", encoding="utf-8") as f:
        json.dump(malformed_corpus, f, indent=2)
    print(f"Generated {len(malformed_corpus)} malformed test cases -> {malformed_path}")

    return {
        "raw_json": json_path,
        "raw_csv": csv_path,
        "malformed_corpus": malformed_path,
    }


if __name__ == "__main__":
    generate_all_raw_data()
