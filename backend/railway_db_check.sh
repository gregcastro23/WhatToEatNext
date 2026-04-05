#!/bin/bash
# alchm.kitchen - Railway Database Health Check
# This script runs the database diagnostic from any environment.

set -e

echo "🔍 Starting alchm.kitchen Railway Database Health Check..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set in the environment."
    exit 1
fi

# Run the python diagnostic
# Navigate to the root folder to ensure imports work
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/.."

python3 -m backend.database.verify_neon_connection
