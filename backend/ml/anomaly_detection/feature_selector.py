"""
Feature selector and matrix validation engine for NetCoop AI Isolation Forest.
"""

from typing import List, Optional
import numpy as np
import pandas as pd

from ml.anomaly_detection.config import EXCLUDED_METADATA_COLUMNS, FEATURE_COLUMNS


class TelemetryFeatureSelector:
    """
    Extracts, validates, and orders numeric features for anomaly detection models.
    Enforces strict safety checks against missing values, infinities, and metadata leakage.
    """

    def __init__(self, feature_columns: Optional[List[str]] = None):
        self.feature_columns = list(feature_columns) if feature_columns is not None else list(FEATURE_COLUMNS)

    def select_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract the configured feature columns from a DataFrame, validating presence and values.

        Args:
            df: Input DataFrame containing telemetry records.

        Returns:
            pd.DataFrame containing only the allowlisted feature columns in deterministic order.

        Raises:
            ValueError: If required columns are missing, or contain NaNs/infinities.
        """
        if not isinstance(df, pd.DataFrame):
            raise TypeError(f"Expected pandas DataFrame, got {type(df).__name__}")

        if df.empty:
            raise ValueError("Input DataFrame is empty; cannot extract features.")

        # 1. Verify all required columns are present
        missing_cols = [c for c in self.feature_columns if c not in df.columns]
        if missing_cols:
            raise ValueError(
                f"Missing required feature columns in input DataFrame: {missing_cols}. "
                f"Expected all 18 features: {self.feature_columns}"
            )

        # 2. Extract strictly in the deterministic configured order
        X = df[self.feature_columns].copy()

        # 3. Check for non-numeric columns
        non_numeric_cols = [c for c in self.feature_columns if not pd.api.types.is_numeric_dtype(X[c])]
        if non_numeric_cols:
            raise ValueError(
                f"Features must be purely numeric, but found non-numeric dtypes in: {non_numeric_cols}"
            )

        # 4. Check for NaN values (Never silently impute with zeros!)
        nan_counts = X.isna().sum()
        cols_with_nan = nan_counts[nan_counts > 0]
        if not cols_with_nan.empty:
            nan_report = cols_with_nan.to_dict()
            raise ValueError(
                f"Input features contain missing (NaN) values: {nan_report}. "
                "Isolation Forest requires complete numerical data without silent zero imputation."
            )

        # 5. Check for infinite values (+inf / -inf)
        is_inf = np.isinf(X.to_numpy())
        if np.any(is_inf):
            inf_cols = [col for col in self.feature_columns if np.isinf(X[col].to_numpy()).any()]
            raise ValueError(f"Input features contain infinite values in columns: {inf_cols}")

        return X

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Extract features and return as a 2D numpy array suitable for sklearn models.
        """
        X_df = self.select_features(df)
        return X_df.to_numpy(dtype=np.float64)

    @classmethod
    def get_feature_names(cls) -> List[str]:
        """Return the immutable canonical list of 18 feature names."""
        return list(FEATURE_COLUMNS)

    @classmethod
    def get_prohibited_columns(cls) -> List[str]:
        """Return the list of columns that must never enter the feature set."""
        return list(EXCLUDED_METADATA_COLUMNS)
