#!/bin/bash
# Cloudflare Build Restore Script
# Restores original routes after Cloudflare build

set -e

echo "🔄 Restoring original routes..."

BACKUP_DIR="src/app/api/.cloudflare-backup"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ No backup directory found. Nothing to restore."
  exit 0
fi

# Restore each backed up route
for backup in "$BACKUP_DIR"/*_route.ts.bak; do
  if [ -f "$backup" ]; then
    # Extract original path from filename
    filename=$(basename "$backup")
    route_path="${filename%_route.ts.bak}"
    route_path="${route_path//_/\/}"

    FULL_ROUTE="src/app/api/$route_path/route.ts"

    if [ -f "$FULL_ROUTE" ]; then
      echo "🔄 Restoring $route_path..."
      cp "$backup" "$FULL_ROUTE"
      rm "$backup"
      echo "   ✅ Restored"
    fi
  fi
done

# Clean up backup directory if empty
rmdir "$BACKUP_DIR" 2>/dev/null || true

echo ""
echo "✅ Original routes restored!"
