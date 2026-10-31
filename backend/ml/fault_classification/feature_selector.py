"""
Feature selector and input validator for XGBoost multi-class fault classification.
"""

from typing import List, Optional, Tuple
import numpy as np
import pandas as pd

from ml.fault_classification.config import (
    FEATURE_COLUMNS,
    LABEL_TO_INDEX,
    TARGET_CLASSES,
    TARGET_COLUMN,
)


class FaultFeatureSelector:
    """
    Validates and extracts canonical numerical features for multi-class fault classification.
    """

    def __init__(self, feature_columns: Optional[List[str]] = None) -> None:
        self.feature_columns = list(feature_columns or FEATURE_COLUMNS)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Validates schema, checks numeric types, ensures no NaNs or Infs,
        and returns a DataFrame with features in canonical order.
        """
        if not isinstance(df, pd.DataFrame):
            raise TypeError(f"Expected pandas DataFrame, got {type(df).__name__}")
        if df.empty:
            raise ValueError("Input DataFrame is empty.")

        missing_cols = [c for c in self.feature_columns if c not in df.columns]
        if missing_cols:
            raise ValueError(
                f"Missing required feature columns for fault classification: {missing_cols}"
            )

        # Select columns in canonical order
        selected = df[self.feature_columns].copy()

        # Validate numeric dtypes
        for col in self.feature_columns:
            if not pd.api.types.is_numeric_dtype(selected[col]):
                raise TypeError(
                    f"Feature '{col}' has non-numeric dtype '{selected[col].dtype}'"
                )

        # Check for NaN / null values
        null_counts = selected.isna().sum()
        cols_with_null = null_counts[null_counts > 0]
        if not cols_with_null.empty:
            raise ValueError(
                f"Features contain NaN/null values: {cols_with_null.to_dict()}"
            )

        # Check for Infinite values
        numeric_arr = selected.to_numpy(dtype=float)
        if np.isinf(numeric_arr).any():
            raise ValueError("Features contain Infinite values (np.inf or -np.inf)")

        return selected

    def extract_labels(self, df: pd.DataFrame) -> np.ndarray:
        """
        Extracts and converts target scenario_label values into integer class IDs.
        """
        if TARGET_COLUMN not in df.columns:
            raise ValueError(f"Target column '{TARGET_COLUMN}' not found in DataFrame.")

        labels = df[TARGET_COLUMN].astype(str)
        invalid_labels = set(labels) - set(TARGET_CLASSES)
        if invalid_labels:
            raise ValueError(f"Encountered unknown scenario labels: {invalid_labels}")

        return labels.map(LABEL_TO_INDEX).to_numpy(dtype=int)

    def transform_with_labels(
        self, df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Extracts both ordered features and integer labels.
        """
        X = self.transform(df)
        y = self.extract_labels(df)
        return X, y
