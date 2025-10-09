#!/bin/bash

###############################################################################
# Fix Apostrophe Issues in String Literals
# WhatToEatNext - Phase 4
# October 9, 2025
###############################################################################

# Find all TypeScript files with unterminated string errors
echo "🔍 Finding files with apostrophe issues..."

FILES=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS1002: Unterminated string literal" | awk -F'[()]' '{print $1}' | sort -u)

if [ -z "$FILES" ]; then
  echo "✅ No unterminated string errors found!"
  exit 0
fi

TOTAL_FILES=$(echo "$FILES" | wc -l | tr -d ' ')
echo "📁 Found $TOTAL_FILES files with apostrophe issues"
echo ""

FIXED_COUNT=0

for file in $FILES; do
  if [ -f "$file" ]; then
    echo "🔧 Fixing: $file"

    # Use sed to escape apostrophes inside single-quoted strings
    # This is a simple approach that handles common cases
    # Pattern: finds 's within single-quoted strings and escapes them

    # Backup file first
    cp "$file" "$file.apostrophe-backup"

    # Common patterns to fix:
    # - it's -> it\'s
    # - can't -> can\'t
    # - don't -> don\'t
    # - won't -> won\'t
    # - Korea's -> Korea\'s
    # - Year's -> Year\'s

    sed -i '' \
      -e "s/\([^\\]\)it's/\1it\\\\'s/g" \
      -e "s/\([^\\]\)can't/\1can\\\\'t/g" \
      -e "s/\([^\\]\)don't/\1don\\\\'t/g" \
      -e "s/\([^\\]\)won't/\1won\\\\'t/g" \
      -e "s/\([^\\]\)Korea's/\1Korea\\\\'s/g" \
      -e "s/\([^\\]\)Year's/\1Year\\\\'s/g" \
      -e "s/\([^\\]\)Vietnam's/\1Vietnam\\\\'s/g" \
      -e "s/\([^\\]\)dish's/\1dish\\\\'s/g" \
      -e "s/\([^\\]\)region's/\1region\\\\'s/g" \
      -e "s/\([^\\]\)country's/\1country\\\\'s/g" \
      "$file"

    FIXED_COUNT=$((FIXED_COUNT + 1))
  fi
done

echo ""
echo "✅ Fixed $FIXED_COUNT files"
echo ""
echo "💡 Backups saved with .apostrophe-backup extension"
echo "   Run 'find . -name \"*.apostrophe-backup\" -delete' to remove them"

exit 0
