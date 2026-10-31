"""
JSON Telemetry Ingestion Loader for NetCoop AI.
Reads JSON telemetry files (single objects, lists, or line-delimited JSON).
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Union


class JSONTelemetryLoader:
    """Loader utility for JSON telemetry data streams and datasets."""

    @classmethod
    def load_json(cls, filepath: Union[str, Path]) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """Load JSON file content."""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Telemetry JSON file not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @classmethod
    def load_jsonl(cls, filepath: Union[str, Path]) -> List[Dict[str, Any]]:
        """Load line-delimited JSON (JSONL) records."""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Telemetry JSONL file not found: {path}")
        records: List[Dict[str, Any]] = []
        with open(path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                clean_line = line.strip()
                if clean_line:
                    try:
                        records.append(json.loads(clean_line))
                    except json.JSONDecodeError as exc:
                        raise ValueError(f"Malformed JSON on line {line_num} in {path}: {exc}") from exc
        return records
