"""
Database Configuration - alchm.kitchen Backend
Phase 1 Infrastructure Migration - September 26, 2025

Environment-based configuration for PostgreSQL connections using SQLAlchemy.
"""

import os
from typing import Optional, Dict, Any
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings


class DatabaseConfig(BaseSettings):
    """Database configuration using Pydantic settings management."""

    # Database connection
    database_url: Optional[str] = None

    # Individual connection parameters (fallback)
    db_host: str = "localhost"
    db_port: int = 5434
    db_name: str = "alchm_kitchen"
    db_user: str = "user"
    db_password: str = "pass"
    db_ssl: bool = False

    # Connection pool settings
    db_pool_size: int = 20  # Increased for Railway
    db_max_overflow: int = 15
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800

    # Application settings
    environment: str = "development"
    debug: bool = False
    log_queries: bool = False
    auto_create_tables: bool = True

    class Config:
        case_sensitive = False
        extra = "ignore"
        # env_file = ".env" # Optional: you can enable this for local dev if needed

    @field_validator('database_url', mode='before')
    @classmethod
    def validate_database_url(cls, v: Any) -> Optional[str]:
        """Normalize DATABASE_URL for Neon/SQLAlchemy."""
        if not v or not isinstance(v, str):
            return v

        # Fix scheme for SQLAlchemy 2.0+ (ensure it's postgresql://)
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)

        # Ensure sslmode=require for Neon/Production
        # If we are on Railway or the URL is a cloud URL, force SSL
        if "neon.tech" in v or os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("PORT"):
            if "sslmode=" not in v:
                separator = "&" if "?" in v else "?"
                v = f"{v}{separator}sslmode=require"

        return v

    @model_validator(mode='after')
    def build_database_url_fallback(self) -> 'DatabaseConfig':
        """Build DATABASE_URL from individual components if not provided."""
        if not self.database_url:
            self.database_url = (
                f"postgresql://{self.db_user}:{self.db_password}@"
                f"{self.db_host}:{self.db_port}/{self.db_name}"
            )
            if self.db_ssl and "sslmode=" not in self.database_url:
                self.database_url += "?sslmode=require"
        return self

    def get_sqlalchemy_url(self) -> str:
        """Get SQLAlchemy-compatible database URL."""
        if not self.database_url:
            return ""
        return self.database_url


# Global configuration instance
config = DatabaseConfig()


# Validate configuration
def validate_config() -> None:
    """Validate database configuration and log settings."""
    print("🔧 alchm.kitchen Database Configuration:")
    print(f"  Environment: {config.environment}")
    print(f"  Database Host: {config.db_host}:{config.db_port}")
    # Don't print password/url here for security
    masked_url = config.database_url or "not set"
    if "@" in masked_url:
        try:
            parts = masked_url.split("@")
            prefix = parts[0].split("://")[0]
            masked_url = f"{prefix}://***@{parts[1]}"
        except:
            masked_url = "***"
    
    print(f"  Database URL: {masked_url}")
    print(f"  Pool Size: {config.db_pool_size}")
    print(f"  Auto Create Tables: {config.auto_create_tables}")

    # Basic validation
    if not config.database_url and not config.db_host:
        raise ValueError("Either DATABASE_URL or individual DB parameters are required")


if __name__ == "__main__":
    validate_config()
