"""
Ingestion Data Validator Service for NetCoop AI.
Exposes TelemetryDataValidator to the backend service layer.
"""

from ml.preprocessing.cleaning import TelemetryDataValidator

__all__ = ["TelemetryDataValidator"]
