#!/usr/bin/env python3
"""
Database Migration Script - alchm.kitchen Backend
Phase 1 Infrastructure Migration - September 26, 2025

Script to run database migrations using Alembic.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def run_migrations():
    """Run database migrations using Alembic."""
    print("🚀 Running alchm.kitchen database migrations...")

    try:
        # Import here to ensure proper path setup
        from alembic.config import Config
        from alembic import command

        # Configure Alembic
        alembic_cfg = Config(str(backend_dir / "alembic.ini"))
        alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))

        # Run migrations
        print("📦 Upgrading database to latest revision...")
        command.upgrade(alembic_cfg, "head")

        print("✅ Database migration completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Database migration failed: {e}")
        return False

def check_migration_status():
    """Check current migration status."""
    print("📊 Checking migration status...")

    try:
        from alembic.config import Config
        from alembic import command

        alembic_cfg = Config(str(backend_dir / "alembic.ini"))
        alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))

        command.current(alembic_cfg)
        return True

    except Exception as e:
        print(f"❌ Failed to check migration status: {e}")
        return False

def create_migration_revision(message="Auto-generated migration"):
    """Create a new migration revision."""
    print(f"📝 Creating new migration: {message}")

    try:
        from alembic.config import Config
        from alembic import command

        alembic_cfg = Config(str(backend_dir / "alembic.ini"))
        alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))

        command.revision(alembic_cfg, message=message, autogenerate=True)
        return True

    except Exception as e:
        print(f"❌ Failed to create migration: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migrate_database.py <command>")
        print("Commands:")
        print("  migrate     - Run database migrations")
        print("  status      - Check migration status")
        print("  revision    - Create new migration revision")
        sys.exit(1)

    command = sys.argv[1]

    if command == "migrate":
        success = run_migrations()
    elif command == "status":
        success = check_migration_status()
    elif command == "revision":
        message = sys.argv[2] if len(sys.argv) > 2 else "Auto-generated migration"
        success = create_migration_revision(message)
    else:
        print(f"Unknown command: {command}")
        success = False

    sys.exit(0 if success else 1)
