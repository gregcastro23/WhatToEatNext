#!/bin/bash

# Collect unused variable warnings and save to file
echo "Collecting unused variable warnings..."

# Run lint and filter for unused vars, save to temp file
# Use a different approach to capture the full file paths
yarn lint --max-warnings=10000 --format=unix 2>&1 | grep -E "(no-unused-vars|@typescript-eslint/no-unused-vars)" > unused-vars-raw.txt 2>/dev/null || true

# Count the results
count=$(wc -l < unused-vars-raw.txt 2>/dev/null || echo "0")
echo "Found $count unused variable warnings"

# Show first few examples
if [ "$count" -gt 0 ]; then
    echo "First 5 examples:"
    head -5 unused-vars-raw.txt
fi
