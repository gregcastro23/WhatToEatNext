#!/bin/bash

echo "🧹 Cleaning up duplicate directories that are causing ESLint parsing errors..."

# Find all directories with "2" or "3" suffix in src/
duplicate_dirs=$(find src/ -type d -name "*2" -o -name "*3" | sort)

echo "Found duplicate directories:"
echo "$duplicate_dirs"

echo ""
read -p "Do you want to remove these duplicate directories? (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo "Removing duplicate directories..."

    # Remove directories with "2" suffix
    find src/ -type d -name "*2" -exec rm -rf {} + 2>/dev/null || true

    # Remove directories with "3" suffix
    find src/ -type d -name "*3" -exec rm -rf {} + 2>/dev/null || true

    echo "✅ Duplicate directories removed"

    # Also clean up any files with similar patterns
    find src/ -name "*2.ts" -o -name "*3.ts" -o -name "*2.tsx" -o -name "*3.tsx" | head -10
    echo ""
    read -p "Also remove duplicate files with 2/3 suffixes? (y/N): " confirm_files

    if [[ $confirm_files == [yY] || $confirm_files == [yY][eE][sS] ]]; then
        find src/ -name "*2.ts" -delete
        find src/ -name "*3.ts" -delete
        find src/ -name "*2.tsx" -delete
        find src/ -name "*3.tsx" -delete
        find src/ -name "*2.js" -delete
        find src/ -name "*3.js" -delete
        echo "✅ Duplicate files removed"
    fi

else
    echo "❌ Cleanup cancelled"
fi

echo ""
echo "📊 Checking remaining parsing errors..."
yarn lint 2>&1 | grep -c "Parsing error" || echo "0"
