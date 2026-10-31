"""
Centralized logging configuration for NetCoop AI Backend.

Provides a unified and thread-safe logging setup using standard Python logging,
preventing duplicate handlers and standardizing log output across all application modules.
"""

import logging
import sys
from typing import Optional

from app.config import get_settings

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(log_level: Optional[str] = None) -> logging.Logger:
    """
    Configure root logging with standard format and stream handler.

    Ensures idempotency by avoiding duplicate handlers on repeated calls.
    Pulls default log level from centralized settings if not specified.
    """
    settings = get_settings()
    level_name = (log_level or settings.LOG_LEVEL).upper()
    numeric_level = getattr(logging, level_name, logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Avoid adding duplicate StreamHandlers if already configured
    has_stream_handler = any(
        isinstance(handler, logging.StreamHandler) and not isinstance(handler, logging.FileHandler)
        for handler in root_logger.handlers
    )

    if not has_stream_handler:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(numeric_level)
        formatter = logging.Formatter(fmt=LOG_FORMAT, datefmt=DATE_FORMAT)
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)
    else:
        # Update existing handler levels
        for handler in root_logger.handlers:
            handler.setLevel(numeric_level)

    app_logger = logging.getLogger("netcoop")
    app_logger.setLevel(numeric_level)
    return app_logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a namespaced logger instance for a given module.

    Usage:
        from app.core.logging_config import get_logger
        logger = get_logger(__name__)
    """
    return logging.getLogger(name)
