#!/bin/bash

echo "🧹 Safely cleaning up duplicate directories causing ESLint parsing errors..."

# Create a backup location
backup_dir=".duplicate-dirs-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

echo "Moving duplicate directories to $backup_dir for safety..."

# Move directories with "2" or "3" suffix to backup
find src/ -type d -name "*2" -o -name "*3" | while read dir; do
    if [ -d "$dir" ]; then
        echo "Moving $dir to backup..."
        mv "$dir" "$backup_dir/"
    fi
done

# Also move any duplicate files
find src/ -name "*2.ts" -o -name "*3.ts" -o -name "*2.tsx" -o -name "*3.tsx" -o -name "*2.js" -o -name "*3.js" | while read file; do
    if [ -f "$file" ]; then
        echo "Moving $file to backup..."
        mv "$file" "$backup_dir/"
    fi
done

echo "✅ Duplicate directories and files moved to $backup_dir"
echo ""
echo "📊 Checking parsing errors after cleanup..."
parsing_errors=$(yarn lint 2>&1 | grep -c "Parsing error" || echo "0")
echo "Remaining parsing errors: $parsing_errors"

if [ "$parsing_errors" -lt 100 ]; then
    echo "🎉 Major improvement! Parsing errors reduced significantly."
else
    echo "⚠️  Still many parsing errors remaining. May need additional fixes."
fi
