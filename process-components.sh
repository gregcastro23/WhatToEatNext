#!/bin/bash

# Process component files specifically
echo "🔧 Processing Component Files for Unused Variables"
echo "=================================================="

# Get component files
COMPONENT_FILES=$(find src/components -name "*.ts" -o -name "*.tsx" | grep -v -E "(test|spec)" | head -20)

echo "Found component files:"
echo "$COMPONENT_FILES"
echo ""

# Process each file individually
for file in $COMPONENT_FILES; do
    echo "Processing: $file"
    node cleanup-unused-variables.cjs --preserve-all --max-files=1 "$file" 2>/dev/null || true
done

echo ""
echo "✅ Component processing complete!"
