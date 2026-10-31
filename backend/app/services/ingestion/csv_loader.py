"""
CSV Telemetry Ingestion Loader for NetCoop AI.
Reads tabular CSV datasets and returns pandas DataFrames or Pydantic record lists.
"""

from pathlib import Path
from typing import List, Union
import pandas as pd

from ml.schemas import NormalizedTelemetryRecord


class CSVTelemetryLoader:
    """Loader utility for tabular CSV telemetry files."""

    @classmethod
    def load_dataframe(cls, filepath: Union[str, Path]) -> pd.DataFrame:
        """Load CSV telemetry dataset into a pandas DataFrame."""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Telemetry CSV file not found: {path}")
        return pd.read_csv(path)

    @classmethod
    def load_normalized_records(cls, filepath: Union[str, Path]) -> List[NormalizedTelemetryRecord]:
        """Load CSV dataset into a list of NormalizedTelemetryRecord objects."""
        df = cls.load_dataframe(filepath)
        records: List[NormalizedTelemetryRecord] = []
        for _, row in df.iterrows():
            row_dict = row.to_dict()
            # Clean NaN values
            row_dict = {k: (None if pd.isna(v) else v) for k, v in row_dict.items()}
            records.append(NormalizedTelemetryRecord(**row_dict))
        return records
