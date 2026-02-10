#!/bin/bash
# Quick script to identify files with parsing errors

echo "=== Identifying files with parsing errors ==="

# Get unique files with parsing errors
yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/" | sort -u > /tmp/parse-error-files.txt

total_files=$(wc -l < /tmp/parse-error-files.txt | tr -d ' ')
echo "Total files with parsing errors: $total_files"
echo ""

echo "=== Checking error counts per file (first 20 files) ==="
head -20 /tmp/parse-error-files.txt | while read file; do
  if [ -f "$file" ]; then
    count=$(yarn lint "$file" 2>&1 | grep -c "Parsing error" || echo "0")
    relpath=$(echo "$file" | sed 's|/Users/GregCastro/Desktop/WhatToEatNext/||')
    echo "$count: $relpath"
  fi
done | sort -n

echo ""
echo "Full list saved to /tmp/parse-error-files.txt"
