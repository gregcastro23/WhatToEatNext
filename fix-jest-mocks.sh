#!/bin/bash

echo "🔧 Fixing jest.mock parsing errors..."

# Find all test files with malformed jest.mock calls
find src/__tests__ -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "jest\.mock.*'(" "$file"; then
    echo "Fixing $file"
    # Fix jest.mock('path'( { to jest.mock('path', () => {
    sed -i '' "s/jest\.mock('\([^']*\)'( {/jest.mock('\1', () => {/g" "$file"
  fi
done

# Fix function return type annotations
find src/__tests__ -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q ") : any {" "$file"; then
    echo "Fixing function signatures in $file"
    # Fix ) : any { to ): any {
    sed -i '' "s/) : any {/): any {/g" "$file"
  fi
done

echo "✅ Jest mock fixes complete"
