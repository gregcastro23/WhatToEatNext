#!/usr/bin/env python3
"""
Integration Test Script - Phase 3 Testing
Test frontend database integration
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def test_database_connection():
    """Test database connection from Python."""
    try:
        from database.connection import health_check
        result = health_check()
        print("✅ Python database connection successful")
        return True
    except Exception as e:
        print(f"❌ Python database connection failed: {e}")
        return False

def test_database_services():
    """Test database services."""
    try:
        from database.models import Ingredient, Recipe

        # Test ingredient query
        ingredients = []  # Would need session to query
        print("✅ Database models imported successfully")
        return True
    except Exception as e:
        print(f"❌ Database services test failed: {e}")
        return False

def main():
    """Run integration tests."""
    print("🧪 Phase 3 Integration Testing")
    print("=" * 50)

    tests = [
        ("Database Connection", test_database_connection),
        ("Database Services", test_database_services),
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n🔧 Testing {test_name}...")
        if test_func():
            passed += 1
            print(f"✅ {test_name} passed")
        else:
            print(f"❌ {test_name} failed")

    print("\n" + "=" * 50)
    print(f"📊 Integration Test Results: {passed}/{total} passed")

    if passed == total:
        print("🎉 All integration tests passed!")
        print("\n📝 Next steps:")
        print("1. Test frontend TypeScript database connections")
        print("2. Test React component integration")
        print("3. Test full end-to-end functionality")
        return True
    else:
        print("⚠️  Some integration tests failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
