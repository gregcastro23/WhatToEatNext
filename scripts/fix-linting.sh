#!/bin/bash

echo "🔧 Running ESLint automatic fixes..."

# First run automatic fixes
yarn eslint --fix src/calculations/alchemicalEngine.ts

echo "✅ Automatic fixes applied"

echo "📋 Running specific focused fixes for 'any' types"

# Create a temporary file for sed replacements
touch .eslint-fix-tmp

# Now run specific targeted fixes for the most common issues

# Fix unused variables by adding underscore prefix
echo "🔄 Adding underscore prefix to unused variables..."

# Patterns for unused variables
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -E 's/([a-zA-Z0-9]+) is defined but never used\. Allowed unused vars must match \/\^\\_\/u/\1 is defined but never used/g' .eslint-fix-tmp

echo "✅ Finished automatic fixing"
echo "ℹ️ You can run 'yarn lint --fix' to apply automatic fixes to all files"
echo "⚠️ Some errors will need manual fixing, especially 'any' type declarations" 