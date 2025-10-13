#!/bin/bash
#
# Fix Interface/Type Syntax Errors - Systematic Approach
# Targets common parsing errors in TypeScript interface and type files
#

set -euo pipefail

echo "🔧 Interface/Type Syntax Fixer - Starting..."
echo "Target: Interface properties with missing semicolons/commas"
echo ""

# Counter for fixes
TOTAL_FIXES=0

# Pattern 1: Fix interface properties ending with comma instead of semicolon
# Example: `property: string,` inside interfaces should use semicolons
echo "Pattern 1: Fixing interface property separators..."
BEFORE=$(yarn lint 2>&1 | grep "Parsing error" | wc -l | tr -d ' ')

find src/types -name "*.ts" -type f | while read file; do
  # This is complex - interfaces use semicolons, object types use commas
  # We'll do targeted fixes based on known patterns

  # Fix: Extra comma after opening brace `{,` -> `{`
  if grep -q '{,' "$file" 2>/dev/null; then
    sed -i '' 's/{,/{/g' "$file"
    echo "  ✓ Fixed {, pattern in $file"
    ((TOTAL_FIXES++)) || true
  fi

  # Fix: Double commas `,,` -> `,`
  if grep -q ',,' "$file" 2>/dev/null; then
    sed -i '' 's/,,/,/g' "$file"
    echo "  ✓ Fixed ,, pattern in $file"
    ((TOTAL_FIXES++)) || true
  fi

  # Fix: Semicolon-comma `;,` -> `;`
  if grep -q ';,' "$file" 2>/dev/null; then
    sed -i '' 's/;,/;/g' "$file"
    echo "  ✓ Fixed ;, pattern in $file"
    ((TOTAL_FIXES++)) || true
  fi

  # Fix: Missing semicolon after closing brace in interface
  # Pattern: `}\n\n  [a-z]` should have semicolon after }
  # This is tricky with sed, skip for now
done

AFTER=$(yarn lint 2>&1 | grep "Parsing error" | wc -l | tr -d ' ')
FIXED=$((BEFORE - AFTER))

echo ""
echo "✅ Pattern 1 complete: $FIXED parsing errors fixed"
echo ""

# Pattern 2: Fix export statement typos
echo "Pattern 2: Fixing export statement typos..."
BEFORE=$AFTER

find src -name "*.ts" -type f | while read file; do
  # Fix: `export const,` -> `export const`
  if grep -q 'export const,' "$file" 2>/dev/null; then
    sed -i '' 's/export const,/export const/g' "$file"
    echo "  ✓ Fixed export const, in $file"
    ((TOTAL_FIXES++)) || true
  fi

  # Fix: `export default X,` -> `export default X;`
  if grep -q 'export default.*,$' "$file" 2>/dev/null; then
    sed -i '' 's/\(export default.*\),$/\1;/g' "$file"
    echo "  ✓ Fixed export default with comma in $file"
    ((TOTAL_FIXES++)) || true
  fi
done

AFTER=$(yarn lint 2>&1 | grep "Parsing error" | wc -l | tr -d ' ')
FIXED=$((BEFORE - AFTER))

echo ""
echo "✅ Pattern 2 complete: $FIXED parsing errors fixed"
echo ""

# Final report
echo "================================================"
echo "🎉 Interface/Type Syntax Fixer Complete!"
echo "================================================"
echo "Total patterns fixed: $TOTAL_FIXES"
echo ""
echo "Running final lint check..."
yarn lint 2>&1 | tail -5
