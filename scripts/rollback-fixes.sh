#!/bin/bash
# Rollback Script - Restore files from timestamped backups
# Usage: ./rollback-fixes.sh [file_pattern] [timestamp]

set -e

BACKUP_DIR="./backup-files"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║         ROLLBACK SCRIPT - Restore from Backups            ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "src" ]; then
    echo -e "${RED}Error: Must run from project root (src/ directory not found)${NC}"
    exit 1
fi

FILE_PATTERN="${1:-*.backup.*}"
TIMESTAMP="${2:-}"

echo -e "${GREEN}🔍 Searching for backup files...${NC}"
echo ""

# Find all backup files
if [ -n "$TIMESTAMP" ]; then
    BACKUP_FILES=$(find src -name "*.backup.$TIMESTAMP" 2>/dev/null || true)
else
    BACKUP_FILES=$(find src -name "$FILE_PATTERN" 2>/dev/null || true)
fi

if [ -z "$BACKUP_FILES" ]; then
    echo -e "${YELLOW}No backup files found matching pattern: $FILE_PATTERN${NC}"
    exit 0
fi

COUNT=$(echo "$BACKUP_FILES" | wc -l)
echo -e "${GREEN}Found $COUNT backup file(s)${NC}"
echo ""

# Show what will be restored
echo -e "${YELLOW}Files to restore:${NC}"
echo "$BACKUP_FILES" | head -20
if [ "$COUNT" -gt 20 ]; then
    echo "... and $((COUNT - 20)) more"
fi
echo ""

# Confirm before proceeding
read -p "Proceed with rollback? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🔄 Restoring files...${NC}"
echo ""

RESTORED=0
FAILED=0

while IFS= read -r backup_file; do
    # Get original filename by removing the .backup.timestamp suffix
    original_file=$(echo "$backup_file" | sed 's/\.backup\.[0-9_]*$//')

    if [ -f "$backup_file" ]; then
        echo -e "  Restoring: ${GREEN}$original_file${NC}"
        cp "$backup_file" "$original_file"
        RESTORED=$((RESTORED + 1))
    else
        echo -e "  ${RED}Failed: $backup_file not found${NC}"
        FAILED=$((FAILED + 1))
    fi
done <<< "$BACKUP_FILES"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ROLLBACK COMPLETE                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ✅ Files restored: ${GREEN}$RESTORED${NC}"
if [ "$FAILED" -gt 0 ]; then
    echo -e "  ❌ Failed: ${RED}$FAILED${NC}"
fi
echo ""
echo -e "${YELLOW}💡 Run 'yarn track-errors' to verify error count${NC}"
echo ""

# Run error tracking if available
if [ -f "scripts/track-parsing-errors.js" ]; then
    echo -e "${GREEN}📊 Running error tracker...${NC}"
    node scripts/track-parsing-errors.js
fi
