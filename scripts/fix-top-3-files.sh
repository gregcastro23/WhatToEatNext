#!/bin/bash
# Quick fix for top 3 error files

BACKUP_DIR="./backup-files/manual-fixes-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "🔧 Fixing top 3 error files with automated patterns..."
echo ""

FILES=(
  "src/lib/alchemicalEngine.ts"
  "src/data/unified/recipeBuilding.ts"
  "src/utils/recipeFilters.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📁 Fixing: $file"
    
    # Create backup
    cp "$file" "$BACKUP_DIR/$(basename $file).backup"
    
    # Apply fixes (macOS compatible)
    sed -i '' \
      -e 's/private readonly,/private readonly/g' \
      -e 's/\.slice(0\([0-9]\))/\.slice(0, \1)/g' \
      -e 's/\.slice(0\([0-9][0-9]\))/\.slice(0, \1)/g' \
      -e 's/adjustments\.push(\([0-9]\)\([0-9][0-9]\))/adjustments.push(\1, \2)/g' \
      -e 's/, *}$/}/g' \
      -e 's/, *]$/]/g' \
      "$file"
    
    echo "   ✅ Applied automated fixes"
  else
    echo "   ⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Batch fixes complete"
echo "📦 Backups saved to: $BACKUP_DIR"
