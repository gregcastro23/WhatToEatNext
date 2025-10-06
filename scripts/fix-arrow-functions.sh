#!/bin/bash
# Fix TS1109: Arrow function syntax errors
# Converts (ab) =>; to (a, b) =>

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    Fix TS1109: Arrow Function Syntax Errors                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Backup directory
BACKUP_DIR="./backup-files/arrow-fixes-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creating backups in: $BACKUP_DIR${NC}"
echo ""

# Find files with arrow function errors
FILES_TO_FIX=$(grep -rl "(ab) =>;" src --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -z "$FILES_TO_FIX" ]; then
    echo -e "${GREEN}✅ No arrow function syntax errors found${NC}"
    exit 0
fi

COUNT=$(echo "$FILES_TO_FIX" | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $COUNT file(s) with arrow function syntax errors${NC}"
echo ""

# Show dry run
echo -e "${YELLOW}=== DRY RUN PREVIEW ===${NC}"
while IFS= read -r file; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}📁 $file${NC}"
        grep -n "(ab) =>;" "$file" 2>/dev/null || true
        echo ""
    fi
done <<< "$FILES_TO_FIX"

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

        # Apply fix: (ab) =>; → (a, b) =>
        sed -i.tmp 's/(ab) =>/(a, b) =>/g' "$file"
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
