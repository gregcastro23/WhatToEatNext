#!/bin/bash
set -e

# PostgreSQL Initialization Script
# Creates both databases needed for the project

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create whattoeatnext database if it doesn't exist
    SELECT 'CREATE DATABASE whattoeatnext'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'whattoeatnext')\gexec

    -- Grant privileges (using quoted identifiers)
    GRANT ALL PRIVILEGES ON DATABASE alchm_kitchen TO "$POSTGRES_USER";
    GRANT ALL PRIVILEGES ON DATABASE whattoeatnext TO "$POSTGRES_USER";
EOSQL

echo "✅ Databases initialized: alchm_kitchen, whattoeatnext"
