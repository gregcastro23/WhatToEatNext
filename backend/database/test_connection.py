#!/usr/bin/env python3
"""
Database Connection Testing - alchm.kitchen Backend
Phase 1 Infrastructure Migration - September 26, 2025

Test script to verify database connectivity, schema integrity,
and basic CRUD operations.
"""

import sys
import time
from datetime import datetime
from sqlalchemy.orm import Session

# Add parent directory to path for imports
sys.path.insert(0, '..')

from database.config import config, validate_config
from database.connection import get_db_engine, get_db_session, health_check, create_tables
from database.models import (
    User, Ingredient, Recipe, ElementalProperties,
    PlanetaryInfluence, SystemMetric
)


def test_configuration():
    """Test database configuration validation."""
    print("🔧 Testing database configuration...")
    try:
        validation = validate_config()
        if validation.valid:
            print("✅ Database configuration is valid")
            return True
        else:
            print("❌ Database configuration errors:")
            for error in validation.errors:
                print(f"   - {error}")
            return False
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False


def test_connection():
    """Test basic database connectivity."""
    print("\n🔌 Testing database connection...")
    try:
        engine = get_db_engine()
        with engine.connect() as conn:
            result = conn.execute("SELECT version() as version, current_database() as database")
            row = result.fetchone()
            print("✅ Database connection successful"            print(f"   Database: {row.database}")
            print(f"   Version: {row.version}")
            return True
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False


def test_schema():
    """Test database schema integrity."""
    print("\n📋 Testing database schema...")
    try:
        with get_db_session() as session:
            # Test tables exist
            tables_to_check = [
                'users', 'ingredients', 'recipes', 'elemental_properties',
                'planetary_influences', 'calculation_cache', 'system_metrics'
            ]

            for table in tables_to_check:
                result = session.execute(f"SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '{table}')")
                exists = result.fetchone()[0]
                if exists:
                    print(f"✅ Table '{table}' exists")
                else:
                    print(f"❌ Table '{table}' missing")
                    return False

            # Test enums exist
            enums_to_check = [
                'user_role', 'planet_type', 'zodiac_sign',
                'lunar_phase', 'season', 'cuisine_type', 'dietary_restriction'
            ]

            for enum in enums_to_check:
                result = session.execute(f"SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum}')")
                exists = result.fetchone()[0]
                if exists:
                    print(f"✅ Enum '{enum}' exists")
                else:
                    print(f"❌ Enum '{enum}' missing")
                    return False

            # Test indexes exist (sample check)
            result = session.execute("""
                SELECT COUNT(*) as index_count
                FROM pg_indexes
                WHERE schemaname = 'public'
            """)
            index_count = result.fetchone()[0]
            print(f"✅ Indexes created: {index_count}")

            return True

    except Exception as e:
        print(f"❌ Schema test failed: {e}")
        return False


def test_basic_operations():
    """Test basic CRUD operations."""
    print("\n🔄 Testing basic database operations...")
    try:
        with get_db_session() as session:
            # Test user creation and retrieval
            test_user = User(
                email=f"test_{int(time.time())}@alchm.kitchen",
                password_hash="test_hash",
                roles=["user"],
                is_active=True,
                email_verified=False
            )
            session.add(test_user)
            session.commit()

            # Retrieve user
            retrieved_user = session.query(User).filter(User.id == test_user.id).first()
            if retrieved_user and retrieved_user.email == test_user.email:
                print("✅ User CRUD operations work")
            else:
                print("❌ User retrieval failed")
                return False

            # Test elemental properties
            test_elemental = ElementalProperties(
                entity_type="test",
                entity_id=test_user.id,
                fire=0.3,
                water=0.2,
                earth=0.3,
                air=0.2,
                calculation_method="test"
            )
            session.add(test_elemental)
            session.commit()

            retrieved_elemental = session.query(ElementalProperties).filter(
                ElementalProperties.id == test_elemental.id
            ).first()
            if retrieved_elemental and abs(retrieved_elemental.fire - 0.3) < 0.001:
                print("✅ Elemental properties CRUD operations work")
            else:
                print("❌ Elemental properties retrieval failed")
                return False

            # Clean up test data
            session.delete(test_elemental)
            session.delete(test_user)
            session.commit()

            return True

    except Exception as e:
        print(f"❌ Basic operations test failed: {e}")
        return False


def test_performance():
    """Test database performance with sample queries."""
    print("\n⚡ Testing database performance...")
    try:
        with get_db_session() as session:
            # Test simple query performance
            start_time = time.time()
            result = session.execute("SELECT COUNT(*) as user_count FROM users")
            user_count = result.fetchone()[0]
            query_time = time.time() - start_time
            print(".4f"
            # Test complex query performance
            start_time = time.time()
            result = session.execute("""
                SELECT r.name, r.cuisine, ep.fire, ep.water, ep.earth, ep.air
                FROM recipes r
                LEFT JOIN elemental_properties ep ON (ep.entity_type = 'recipe' AND ep.entity_id = r.id)
                WHERE r.is_public = true
                LIMIT 10
            """)
            rows = result.fetchall()
            query_time = time.time() - start_time
            print(".4f"
            return True

    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False


def test_health_check():
    """Test the health check functionality."""
    print("\n🏥 Testing health check functionality...")
    try:
        health = health_check()
        if health["status"] == "healthy":
            print("✅ Health check passed")
            print(f"   Database version: {health.get('database_version', 'unknown')}")
            print(f"   Cache entries: {health.get('cache_entries', 0)}")
            return True
        else:
            print(f"❌ Health check failed: {health.get('error', 'unknown error')}")
            return False
    except Exception as e:
        print(f"❌ Health check test failed: {e}")
        return False


def run_all_tests():
    """Run all database tests."""
    print("🚀 Starting alchm.kitchen Database Tests")
    print("=" * 50)

    tests = [
        ("Configuration", test_configuration),
        ("Connection", test_connection),
        ("Schema", test_schema),
        ("Basic Operations", test_basic_operations),
        ("Performance", test_performance),
        ("Health Check", test_health_check),
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} test failed")
        except Exception as e:
            print(f"❌ {test_name} test error: {e}")

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All database tests passed! Ready for Phase 2 migration.")
        return True
    else:
        print("⚠️  Some tests failed. Please check database configuration and schema.")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
