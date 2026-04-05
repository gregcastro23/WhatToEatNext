#!/usr/bin/env python3
"""
alchm.kitchen - Neon PostgreSQL Connectivity Diagnostic
Run this script to verify the connection between Railway and Neon.
"""
import sys
import os
import logging
import time

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text
from backend.database.connection import get_db_engine
from backend.database.config import config

# Level up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Diagnostic")

def run_diagnostic():
    print("=" * 60)
    print("🚀 alchm.kitchen Database Connection Diagnostic")
    print("=" * 60)
    
    # Check environment
    env = os.getenv("RAILWAY_ENVIRONMENT", "local/dev")
    print(f"📍 Environment: {env}")
    
    # Mask URL
    raw_url = config.get_sqlalchemy_url()
    masked_url = raw_url
    if "@" in raw_url:
        try:
            protocol, rest = raw_url.split("://", 1)
            creds, host_part = rest.split("@", 1)
            masked_url = f"{protocol}://***@{host_part}"
        except:
            masked_url = "masked_url"
            
    print(f"🔗 Target: {masked_url}")
    
    start_time = time.time()
    try:
        engine = get_db_engine()
        with engine.connect() as conn:
            # Test 1: Basic Ping
            print("⏳ Testing connectivity...")
            result = conn.execute(text("SELECT 1 as ping, version() as version"))
            row = result.fetchone()
            latency = (time.time() - start_time) * 1000
            
            print(f"✅ Connection successful! (Latency: {latency:.2f}ms)")
            print(f"🐘 Postgres Version: {row.version if row else 'Unknown'}")
            
            # Test 2: Table Count
            print("📊 Checking existing tables...")
            table_result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [r[0] for r in table_result.fetchall()]
            print(f"📂 Found {len(tables)} tables in 'public' schema.")
            if tables:
                print(f"   Sample tables: {', '.join(tables[:5])}{'...' if len(tables) > 5 else ''}")
            
    except Exception as e:
        print("\n" + "!" * 60)
        print("❌ DIAGNOSTIC FAILED")
        print(f"Error: {str(e)}")
        
        if "ssl" in str(e).lower():
            print("\n💡 TIP: Neon requires SSL. Verify 'sslmode=require' is in your connection string.")
        elif "credentials" in str(e).lower() or "password" in str(e).lower():
            print("\n💡 TIP: Check your database username and password in the environment variables.")
        elif "host" in str(e).lower():
            print("\n💡 TIP: Verify the database host is correct and reachable from this network.")
            
        print("!" * 60)
        sys.exit(1)

    print("=" * 60)
    print("✨ Diagnostic Complete. All systems go.")
    print("=" * 60)

if __name__ == "__main__":
    run_diagnostic()
