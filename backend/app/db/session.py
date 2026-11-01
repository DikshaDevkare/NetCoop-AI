"""
Database session management and engine configuration for NetCoop AI.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger("netcoop.db.session")

settings = get_settings()

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a managed database session with transaction safety.
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as exc:
        db.rollback()
        # Avoid logging expected client HTTP exceptions as database failures
        from starlette.exceptions import HTTPException as StarletteHTTPException
        from fastapi import HTTPException as FastAPIHTTPException
        if not isinstance(exc, (StarletteHTTPException, FastAPIHTTPException)):
            logger.error("Database transaction rolled back due to error: %s", exc)
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initializes database schema, creating all tables if not present.
    """
    from app.db.models import Base
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully at %s", settings.DATABASE_URL)
    except Exception as exc:
        logger.error("Failed to initialize database schema: %s", exc)
        raise


# Auto-create tables on module initialization
init_db()
