"""
Database Configuration - alchm.kitchen Backend
Phase 1 Infrastructure Migration - September 26, 2025

Environment-based configuration for PostgreSQL connections using SQLAlchemy.
"""

import os
from typing import Optional
from pydantic import validator
from pydantic_settings import BaseSettings


class DatabaseConfig(BaseSettings):
    """Database configuration using Pydantic settings management."""

    # Database connection
    database_url: str = "postgresql://user:pass@127.0.0.1:5434/alchm_kitchen"

    # Individual connection parameters (fallback)
    db_host: str = "localhost"
    db_port: int = 5434
    db_name: str = "alchm_kitchen"
    db_user: str = "user"
    db_password: str = "pass"
    db_ssl: bool = False

    # Connection pool settings
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_timeout: int = 30
    db_pool_recycle: int = 3600

    # Application settings
    environment: str = "development"
    debug: bool = False
    log_queries: bool = False
    auto_create_tables: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Allow extra fields from .env

    @validator('database_url', pre=True, always=True)
    def build_database_url(cls, v, values):
        """Build DATABASE_URL from individual components if not provided."""
        if v and v != "postgresql://user:pass@localhost:5432/alchm_kitchen":
            return v

        # Build from individual components
        host = values.get('db_host', 'localhost')
        port = values.get('db_port', 5432)
        name = values.get('db_name', 'alchm_kitchen')
        user = values.get('db_user', 'user')
        password = values.get('db_password', 'pass')

        return f"postgresql://{user}:{password}@{host}:{port}/{name}"

    def get_sqlalchemy_url(self) -> str:
        """Get SQLAlchemy-compatible database URL."""
        return self.database_url


# Global configuration instance
config = DatabaseConfig()

# Validate configuration
def validate_config() -> None:
    """Validate database configuration and log settings."""
    print("🔧 alchm.kitchen Database Configuration:")
    print(f"  Environment: {config.environment}")
    print(f"  Database: {config.db_name}")
    print(f"  Host: {config.db_host}:{config.db_port}")
    print(f"  SSL: {config.db_ssl}")
    print(f"  Pool Size: {config.db_pool_size}")
    print(f"  Debug Mode: {config.debug}")
    print(f"  Log Queries: {config.log_queries}")
    print(f"  Auto Create Tables: {config.auto_create_tables}")

    # Basic validation
    if not config.db_host:
        raise ValueError("Database host is required")
    if not config.db_name:
        raise ValueError("Database name is required")
    if config.db_port <= 0 or config.db_port > 65535:
        raise ValueError(f"Invalid database port: {config.db_port}")


if __name__ == "__main__":
    validate_config()
