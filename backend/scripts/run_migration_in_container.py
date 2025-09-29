#!/usr/bin/env python3
"""
Run database migration inside the postgres container
This script creates the full database schema directly in the container
"""

import sys
import subprocess
import os
from pathlib import Path

# Project paths
backend_dir = Path(__file__).parent.parent
project_root = backend_dir.parent

def run_in_container(command, input_text=None):
    """Run a command inside the postgres container."""
    full_command = f"cd {backend_dir} && docker-compose exec -T postgres bash -c '{command}'"

    try:
        if input_text:
            result = subprocess.run(full_command, shell=True, input=input_text,
                                  capture_output=True, text=True)
        else:
            result = subprocess.run(full_command, shell=True,
                                  capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def create_schema():
    """Create the database schema by running the SQL file."""
    schema_file = backend_dir / "database" / "init" / "01-schema.sql"

    if not schema_file.exists():
        print(f"❌ Schema file not found: {schema_file}")
        return False

    print("📄 Reading schema file...")

    with open(schema_file, 'r') as f:
        schema_sql = f.read()

    # Split the SQL into individual statements (basic approach)
    # This is a simple split - in production, you'd want better SQL parsing
    statements = []
    current_statement = []
    in_multiline_comment = False

    for line in schema_sql.split('\n'):
        line = line.strip()

        # Skip comments and empty lines
        if not line or line.startswith('--'):
            continue

        # Handle multi-line comments (basic)
        if '/*' in line:
            in_multiline_comment = True
        if '*/' in line:
            in_multiline_comment = False
            continue
        if in_multiline_comment:
            continue

        current_statement.append(line)

        # End of statement
        if line.endswith(';'):
            statements.append(' '.join(current_statement))
            current_statement = []

    # Handle problematic statements
    filtered_statements = []
    skip_statements = [
        'GRANT ',  # Permissions setup
        'ALTER DEFAULT PRIVILEGES',  # Permissions setup
        'COMMENT ON DATABASE',  # Requires database comment privileges
    ]

    # First, ensure extensions are created
    extension_statements = [stmt for stmt in statements if 'CREATE EXTENSION' in stmt.upper()]
    regular_statements = []

    for stmt in statements:
        if any(skip for skip in skip_statements if skip in stmt.upper()):
            continue
        elif 'CREATE EXTENSION' in stmt.upper():
            # Handle extensions separately
            continue
        else:
            regular_statements.append(stmt)

    filtered_statements = extension_statements + regular_statements

    print(f"📋 Found {len(filtered_statements)} SQL statements to execute")

    # Execute statements in batches
    batch_size = 10
    success_count = 0

    for i in range(0, len(filtered_statements), batch_size):
        batch = filtered_statements[i:i + batch_size]
        batch_sql = ';\n'.join(batch) + ';'

        print(f"⚡ Executing batch {i//batch_size + 1}/{(len(filtered_statements) + batch_size - 1)//batch_size}...")

        success, out, err = run_in_container(
            'psql -U user -d alchm_kitchen -v ON_ERROR_STOP=1',
            input_text=batch_sql
        )

        if success:
            success_count += len(batch)
            print(f"✅ Batch completed ({len(batch)} statements)")
        else:
            print(f"❌ Batch failed: {err}")
            print(f"SQL: {batch_sql[:500]}...")
            return False

    print(f"🎉 Schema creation completed! {success_count} statements executed.")
    return True

def seed_initial_data():
    """Seed the database with initial data."""
    print("🌱 Seeding initial data...")

    seed_sql = """
    -- Insert admin user (from schema)
    INSERT INTO users (email, password_hash, roles, is_active, email_verified)
    VALUES (
        'admin@alchm.kitchen',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '{admin}',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;

    -- Insert service user
    INSERT INTO users (email, password_hash, roles, is_active, email_verified)
    VALUES (
        'service@alchm.kitchen',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '{service}',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;
    """

    success, out, err = run_in_container(
        'psql -U user -d alchm_kitchen',
        input_text=seed_sql
    )

    if success:
        print("✅ Initial data seeded successfully")
        return True
    else:
        print(f"❌ Failed to seed initial data: {err}")
        return False

def verify_schema():
    """Verify that the schema was created correctly."""
    print("🔍 Verifying schema...")

    verification_queries = [
        ("Users table", "SELECT COUNT(*) FROM users;"),
        ("Ingredients table", "SELECT COUNT(*) FROM ingredients;"),
        ("Recipes table", "SELECT COUNT(*) FROM recipes;"),
        ("Elemental properties table", "SELECT COUNT(*) FROM elemental_properties;"),
        ("Enums", "SELECT COUNT(*) FROM pg_type WHERE typname IN ('user_role', 'planet_type', 'zodiac_sign', 'lunar_phase', 'season', 'cuisine_type', 'dietary_restriction');"),
    ]

    all_passed = True

    for name, query in verification_queries:
        success, out, err = run_in_container(
            f'psql -U user -d alchm_kitchen -t -c "{query}"'
        )

        if success and out.strip():
            result = out.strip()
            print(f"✅ {name}: {result}")
        else:
            print(f"❌ {name}: Failed ({err})")
            all_passed = False

    return all_passed

def main():
    """Main migration function."""
    print("🚀 Running database migration in container...")
    print("=" * 50)

    steps = [
        ("create_schema", create_schema, "Create database schema"),
        ("seed_data", seed_initial_data, "Seed initial data"),
        ("verify", verify_schema, "Verify schema creation"),
    ]

    success_count = 0

    for step_id, step_func, description in steps:
        print(f"\n🔧 {description}...")
        if step_func():
            success_count += 1
            print(f"✅ {description} completed")
        else:
            print(f"❌ {description} failed")
            break

    print("\n" + "=" * 50)

    if success_count == len(steps):
        print("🎉 Database migration completed successfully!")
        print("\n📝 Next steps:")
        print("1. Test the database connection from your application")
        print("2. Run data migration scripts to import existing data")
        print("3. Update frontend services to use database queries")
        return True
    else:
        print("❌ Database migration failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
