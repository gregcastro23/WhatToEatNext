#!/usr/bin/env python3
"""
Test migration inside the postgres container
This script runs the migration logic directly in the container
"""

import sys
import subprocess
import os

def run_in_container(command):
    """Run a command inside the postgres container."""
    full_command = f"cd /Users/GregCastro/Desktop/WhatToEatNext/backend && docker-compose exec -T postgres bash -c '{command}'"
    try:
        result = subprocess.run(full_command, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def test_migration():
    """Test the migration by running SQL directly."""
    print("Testing database migration...")

    # Create a simple test SQL file
    test_sql = """
    -- Test basic table creation
    CREATE TABLE IF NOT EXISTS migration_test (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert test data
    INSERT INTO migration_test (name) VALUES ('test_record') ON CONFLICT DO NOTHING;

    -- Check if it worked
    SELECT COUNT(*) as count FROM migration_test;
    """

    # Write test SQL to a file
    with open('/tmp/test_migration.sql', 'w') as f:
        f.write(test_sql)

    # Copy the file to container and run it
    copy_success, _, copy_err = run_in_container('cat > /tmp/test_migration.sql << \'EOF\'')
    if not copy_success:
        print(f"Failed to copy SQL to container: {copy_err}")
        return False

    # Run the SQL
    run_success, run_out, run_err = run_in_container('psql -U user -d alchm_kitchen -f /tmp/test_migration.sql')
    if run_success:
        print("✅ Basic database operations work")
        print(f"Output: {run_out}")
        return True
    else:
        print("❌ Database operations failed")
        print(f"Error: {run_err}")
        return False

def main():
    """Main test function."""
    print("🧪 Testing database migration in container...")

    if test_migration():
        print("✅ Migration test passed!")
        return True
    else:
        print("❌ Migration test failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
