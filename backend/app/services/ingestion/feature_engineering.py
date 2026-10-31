"""
Ingestion Feature Engineering Service for NetCoop AI.
Exposes TelemetryFeatureEngineer to the backend service layer.
"""

from ml.preprocessing.feature_engineering import TelemetryFeatureEngineer

__all__ = ["TelemetryFeatureEngineer"]
