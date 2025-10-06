#!/bin/bash
# Dry Run Script - Preview changes before applying
# Usage: ./dry-run-fix.sh <pattern> <replacement> [file_pattern]

set -e

PATTERN="$1"
REPLACEMENT="$2"
FILE_PATTERN="${3:-*.ts}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ -z "$PATTERN" ] || [ -z "$REPLACEMENT" ]; then
    echo -e "${RED}Usage: $0 <pattern> <replacement> [file_pattern]${NC}"
    echo ""
    echo "Examples:"
    echo "  $0 'Fire: {,' 'Fire: {' '*.ts'"
    echo "  $0 'slice(0\([0-9]\))' 'slice(0, \1)' '*.ts'"
    exit 1
fi

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║              DRY RUN - Preview Changes                     ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Pattern:${NC}     $PATTERN"
echo -e "${BLUE}Replace:${NC}     $REPLACEMENT"
echo -e "${BLUE}Files:${NC}       src/**/$FILE_PATTERN"
echo ""

# Find matching files
MATCHING_FILES=$(find src -name "$FILE_PATTERN" ! -name "*.backup.*" -type f -exec grep -l "$PATTERN" {} \; 2>/dev/null || true)

if [ -z "$MATCHING_FILES" ]; then
    echo -e "${GREEN}✅ No files match this pattern${NC}"
    exit 0
fi

COUNT=$(echo "$MATCHING_FILES" | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $COUNT file(s) with matches${NC}"
echo ""

# Show preview of changes
echo -e "${BLUE}═══════════════ PREVIEW OF CHANGES ═══════════════${NC}"
echo ""

TOTAL_MATCHES=0

while IFS= read -r file; do
    MATCHES=$(grep -n "$PATTERN" "$file" 2>/dev/null || true)

    if [ -n "$MATCHES" ]; then
        MATCH_COUNT=$(echo "$MATCHES" | wc -l | tr -d ' ')
        TOTAL_MATCHES=$((TOTAL_MATCHES + MATCH_COUNT))

        echo -e "${GREEN}📁 $file${NC} (${MATCH_COUNT} match(es))"

        # Show first 5 matches
        echo "$MATCHES" | head -5 | while IFS=: read -r line_num line_content; do
            echo -e "  ${YELLOW}Line $line_num:${NC}"
            echo -e "    ${RED}BEFORE:${NC} $line_content"
            AFTER=$(echo "$line_content" | sed "s/$PATTERN/$REPLACEMENT/g")
            echo -e "    ${GREEN}AFTER:${NC}  $AFTER"
        done

        if [ "$MATCH_COUNT" -gt 5 ]; then
            echo -e "  ${YELLOW}... and $((MATCH_COUNT - 5)) more match(es)${NC}"
        fi
        echo ""
    fi
done <<< "$MATCHING_FILES"

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📊 Summary:${NC}"
echo -e "  Files affected: ${GREEN}$COUNT${NC}"
echo -e "  Total matches:  ${GREEN}$TOTAL_MATCHES${NC}"
echo ""
echo -e "${YELLOW}💡 To apply these changes:${NC}"
echo -e "   Run the actual fix script (NOT this dry-run)"
echo ""
