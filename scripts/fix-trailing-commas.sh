#!/bin/bash
# Fix TS1005: Trailing commas after statements
# Converts const x = [], → const x = [];

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    Fix TS1005: Trailing Commas After Statements           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Backup directory
BACKUP_DIR="./backup-files/comma-fixes-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creating backups in: $BACKUP_DIR${NC}"
echo ""

# Find files with trailing comma issues
FILES_TO_FIX=$(grep -rl "= \[\]," src --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -z "$FILES_TO_FIX" ]; then
    echo -e "${GREEN}✅ No trailing comma issues found${NC}"
    exit 0
fi

COUNT=$(echo "$FILES_TO_FIX" | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $COUNT file(s) with trailing comma issues${NC}"
echo ""

# Show dry run
echo -e "${YELLOW}=== DRY RUN PREVIEW ===${NC}"
while IFS= read -r file; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}📁 $file${NC}"
        grep -n "= \[\]," "$file" 2>/dev/null | head -3 || true
    fi
done <<< "$FILES_TO_FIX"
echo ""

read -p "Apply these fixes? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Fixes cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🔧 Applying fixes...${NC}"
echo ""

FIXED=0

while IFS= read -r file; do
    if [ -f "$file" ]; then
        # Create backup
        backup_file="$BACKUP_DIR/$(echo "$file" | sed 's|/|_|g').backup"
        cp "$file" "$backup_file"

        # Apply fixes for trailing commas
        sed -i.tmp \
            -e 's/= \[\],$/= [];/g' \
            -e 's/= \[\],  $/= [];/g' \
            "$file"
        rm "$file.tmp"

        echo -e "  ✅ Fixed: ${GREEN}$file${NC}"
        FIXED=$((FIXED + 1))
    fi
done <<< "$FILES_TO_FIX"

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "  ✅ Files fixed: ${GREEN}$FIXED${NC}"
echo -e "  📦 Backups in: ${YELLOW}$BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}💡 Run 'yarn track-errors' to verify error reduction${NC}"
echo ""
