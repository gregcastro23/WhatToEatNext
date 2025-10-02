#!/usr/bin/env python3
"""
Database Initialization Script - alchm.kitchen Backend
Phase 1 Infrastructure Migration - September 26, 2025

Complete database setup script that creates database, runs migrations,
and optionally seeds with initial data.
"""

import sys
import os
import subprocess
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def run_command(cmd, description):
    """Run a shell command and return success status."""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def create_database():
    """Create the database if it doesn't exist."""
    from database.config import config

    # Extract database name from URL or individual settings
    if config.database_url:
        # Parse database name from URL
        from urllib.parse import urlparse
        parsed = urlparse(config.database_url)
        db_name = parsed.path.lstrip('/')
    else:
        db_name = config.db_name

    # For Docker setup, use docker exec to run psql
    create_cmd = f'docker exec backend-postgres-1 psql -U {config.db_user} -d postgres -c "CREATE DATABASE {db_name} WITH OWNER {config.db_user} ENCODING \'UTF8\';"'
    return run_command(create_cmd, f"Creating database '{db_name}'")

def run_migrations():
    """Run database migrations."""
    migrate_script = backend_dir / "scripts" / "migrate_database.py"
    return run_command(f"python3 {migrate_script} migrate", "Running database migrations")

def run_tests():
    """Run database connection tests."""
    test_script = backend_dir / "database" / "test_connection.py"
    return run_command(f"python3 {test_script}", "Running database tests")

def seed_database():
    """Seed database with initial data (optional)."""
    print("🌱 Seeding database with initial data...")

    try:
        from database.connection import get_db_session, get_db_engine
        from database.models import Ingredient, Recipe

        # Ensure engine is created before using session
        get_db_engine()

        with get_db_session() as session:
            # Check if we already have data
            ingredient_count = session.query(Ingredient).count()
            recipe_count = session.query(Recipe).count()

            if ingredient_count > 0 or recipe_count > 0:
                print("ℹ️  Database already contains data, skipping seed")
                return True

            # Add sample ingredient
            sample_ingredient = Ingredient(
                name="Garlic",
                category="vegetables",
                is_active=True,
                confidence_score=1.0
            )
            session.add(sample_ingredient)

            # Add sample recipe
            sample_recipe = Recipe(
                name="Simple Garlic Bread",
                cuisine="Italian",
                category="appetizer",
                instructions={"steps": ["Mix ingredients", "Bake at 375°F for 10 minutes"]},
                prep_time_minutes=5,
                cook_time_minutes=10,
                servings=4,
                difficulty_level=1,
                dietary_tags=["Vegetarian"],
                is_public=True
            )
            session.add(sample_recipe)

            session.commit()
            print("✅ Database seeded with sample data")
            return True

    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        return False

def main():
    """Main initialization function."""
    print("🚀 alchm.kitchen Database Initialization")
    print("=" * 50)

    steps = [
        ("create_db", create_database, "Create database"),
        ("migrate", run_migrations, "Run migrations"),
        ("test", run_tests, "Run connection tests"),
    ]

    # Check if seeding is requested
    should_seed = "--seed" in sys.argv

    if should_seed:
        steps.append(("seed", seed_database, "Seed with sample data"))

    success_count = 0

    for step_id, step_func, description in steps:
        if step_func():
            success_count += 1
        else:
            print(f"❌ Initialization failed at step: {description}")
            return False

    print("\n" + "=" * 50)
    print(f"📊 Initialization Results: {success_count}/{len(steps)} steps completed")

    if success_count == len(steps):
        print("🎉 Database initialization completed successfully!")
        print("\n📝 Next steps:")
        print("1. Set DATABASE_URL in your environment variables")
        print("2. Start your backend services")
        print("3. Run Phase 2 data migration scripts")
        return True
    else:
        print("⚠️  Database initialization completed with errors")
        return False

if __name__ == "__main__":
    if "--help" in sys.argv or "-h" in sys.argv:
        print("alchm.kitchen Database Initialization Script")
        print("Usage: python init_database.py [options]")
        print("Options:")
        print("  --seed    Seed database with sample data")
        print("  --help    Show this help message")
        sys.exit(0)

    success = main()
    sys.exit(0 if success else 1)
