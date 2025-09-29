"""
Database Connection Management - alchm.kitchen Backend
Phase 1 Infrastructure Migration - September 26, 2025

SQLAlchemy engine, session management, and database operations.
"""

from contextlib import contextmanager
from typing import Generator
import logging

from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.pool import QueuePool

from .config import config

# Configure logging
logger = logging.getLogger(__name__)

# SQLAlchemy Base for all models
Base = declarative_base()

# Global engine instance
_engine: Engine = None

def get_db_engine() -> Engine:
    """Get or create the SQLAlchemy engine."""
    global _engine

    if _engine is None:
        logger.info("Creating SQLAlchemy engine...")

        # Create engine with connection pooling
        _engine = create_engine(
            config.get_sqlalchemy_url(),
            poolclass=QueuePool,
            pool_size=config.db_pool_size,
            max_overflow=config.db_max_overflow,
            pool_timeout=config.db_pool_timeout,
            pool_recycle=config.db_pool_recycle,
            echo=config.log_queries,  # Log SQL queries in debug mode
            future=True,  # Use SQLAlchemy 2.0 style
        )

        # Test connection
        try:
            with _engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    return _engine

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_db_engine())

@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Get a database session with automatic cleanup.

    Usage:
        with get_db_session() as session:
            result = session.query(Model).all()
    """
    session = SessionLocal()
    try:
        yield session
    except Exception as e:
        logger.error(f"Database session error: {e}")
        session.rollback()
        raise
    finally:
        session.close()

def create_tables() -> None:
    """Create all tables defined in the models."""
    if not config.auto_create_tables:
        logger.info("Auto-create tables is disabled")
        return

    logger.info("Creating database tables...")
    try:
        engine = get_db_engine()
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        raise

def drop_tables() -> None:
    """Drop all tables (use with caution!)."""
    logger.warning("Dropping all database tables...")
    try:
        engine = get_db_engine()
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop tables: {e}")
        raise

# FastAPI dependency function
def get_db() -> Session:
    """
    FastAPI dependency for database sessions.
    Provides a database session that gets automatically cleaned up.
    """
    session = SessionLocal()
    try:
        yield session
    except Exception as e:
        logger.error(f"Database session error: {e}")
        session.rollback()
        raise
    finally:
        session.close()

def reset_database() -> None:
    """Reset database by dropping and recreating all tables."""
    logger.warning("Resetting database...")
    drop_tables()
    create_tables()
    logger.info("Database reset complete")

def health_check() -> dict:
    """
    Perform database health check.

    Returns:
        dict: Health check results with status and metrics
    """
    try:
        engine = get_db_engine()

        # Basic connectivity test
        with engine.connect() as conn:
            result = conn.execute("SELECT 1 as test, version() as version")
            row = result.fetchone()

        # Get connection pool stats
        pool = engine.pool
        pool_stats = {
            "pool_size": getattr(pool, "size", 0),
            "checked_in": getattr(pool, "checkedin", 0),
            "checked_out": getattr(pool, "checkedout", 0),
            "overflow": getattr(pool, "overflow", 0),
            "invalid": getattr(pool, "invalid", 0),
        }

        return {
            "status": "healthy",
            "database_version": row.version if row else "unknown",
            "pool_stats": pool_stats,
            "timestamp": "2025-09-26T00:00:00Z"  # Would use datetime.now() in real implementation
        }

    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2025-09-26T00:00:00Z"
        }

# Initialize database on module import
def init_database() -> None:
    """Initialize database connection and create tables."""
    try:
        get_db_engine()  # This will create the engine and test connection
        if config.auto_create_tables:
            create_tables()
        logger.info("Database initialization complete")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

# Auto-initialize if this module is run directly
if __name__ == "__main__":
    init_database()
