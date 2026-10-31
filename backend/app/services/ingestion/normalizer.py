"""
Ingestion Normalizer Service for NetCoop AI.
Exposes the TelemetryNormalizer to the backend service layer.
"""

from ml.preprocessing.normalizer import TelemetryNormalizer

__all__ = ["TelemetryNormalizer"]
