#!/usr/bin/env python3
"""
Neon Database Diagnostic Script - alchm.kitchen
Phase 1: Infrastructure Integration Verification
"""
import os
import sys
import time
from sqlalchemy import text
from datetime import datetime

# Add root directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.connection import get_db_engine, get_db_session

def verify_neon():
    """Perform a deep check on the Neon database connectivity and health."""
    print(f"\n🚀 Starting Neon Database Diagnostic (Phase 1)...")
    print(f"   Timestamp: {datetime.now().isoformat()}")
    
    # 1. Environment Check
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("   ❌ DATABASE_URL environment variable is missing!")
        return False
    
    masked_url = db_url.split("@")[-1] if "@" in db_url else "masked"
    print(f"   Target Host: {masked_url}")
    
    # 2. Connection Pool & SSL Test
    print(f"   Testing SQLAlchemy engine initialization...")
    try:
        start_time = time.time()
        engine = get_db_engine()
        duration = (time.time() - start_time) * 1000
        print(f"   ✅ Engine initialized in {duration:.2f}ms")
    except Exception as e:
        print(f"   ❌ Failed to initialize engine: {str(e)}")
        return False
        
    # 3. Simple Query Test
    print(f"   Executing simple heartbeat query (SELECT 1)...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test, version() as v"))
            row = result.fetchone()
            print(f"   ✅ Heartbeat successful.")
            print(f"   ✅ PostgreSQL Version: {row.v}")
    except Exception as e:
        print(f"   ❌ Heartbeat query failed: {str(e)}")
        return False
        
    # 4. Data Reachability (Schema Health)
    print(f"   Verifying recipe data reachability...")
    try:
        with get_db_session() as session:
            count = session.execute(text("SELECT COUNT(*) FROM recipes")).scalar()
            print(f"   ✅ Found {count} recipes in the database.")
            
            # Check for alchemical data
            alchemy_test = session.execute(text("SELECT fire, water, earth, air FROM elemental_properties LIMIT 1")).fetchone()
            if alchemy_test:
                print(f"   ✅ Elemental properties table is populated (Match: {alchemy_test})")
            else:
                 print(f"   ⚠️ Elemental properties table is empty or missing data.")
    except Exception as e:
        print(f"   ❌ Data reachability test failed: {str(e)}")
        print(f"      (Note: This might be expected if tables haven't been created yet)")
        return False
        
    print(f"\n✨ ALL NEON CHECKS PASSED SUCCESSFULLY ✨")
    return True

if __name__ == "__main__":
    success = verify_neon()
    sys.exit(0 if success else 1)
