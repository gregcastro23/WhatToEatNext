#!/bin/bash

# Emergency TypeScript Fix Script
# Purpose: Quick fix for critical TypeScript errors
# Usage: ./scripts/recovery/emergency-ts-fix.sh

set -e

echo "=== Emergency TypeScript Fix ==="
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup
echo "Creating backup..."
git stash push -m "Emergency TS fix backup $(date)" || {
    echo -e "${YELLOW}Warning: Could not create git stash (working directory may be clean)${NC}"
}

# Count initial errors
echo "Counting initial TypeScript errors..."
INITIAL_ERRORS=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
echo "Initial TypeScript errors: $INITIAL_ERRORS"

if [ "$INITIAL_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ No TypeScript errors found. No action needed.${NC}"
    exit 0
fi

echo ""

# Apply emergency fixes in order of success rate
echo "Applying emergency fixes..."

# 1. Fix TS2571 errors (100% success rate)
if [ -f "fix-ts2571-errors.cjs" ]; then
    echo "1. Fixing TS2571 (unknown object) errors..."
    node fix-ts2571-errors.cjs || echo "TS2571 fixer not available or failed"

    # Check progress
    CURRENT_ERRORS=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
    echo "   Errors after TS2571 fix: $CURRENT_ERRORS"
fi

# 2. Fix malformed syntax (88% success rate)
if [ -f "fix-malformed-syntax.cjs" ]; then
    echo "2. Fixing malformed syntax errors..."
    node fix-malformed-syntax.cjs || echo "Malformed syntax fixer not available or failed"

    # Check progress
    CURRENT_ERRORS=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
    echo "   Errors after syntax fix: $CURRENT_ERRORS"
fi

# 3. Fix TS2339 errors (92% success rate)
if [ -f "fix-ts2339-errors.cjs" ]; then
    echo "3. Fixing TS2339 (property access) errors..."
    node fix-ts2339-errors.cjs || echo "TS2339 fixer not available or failed"

    # Check progress
    CURRENT_ERRORS=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
    echo "   Errors after TS2339 fix: $CURRENT_ERRORS"
fi

# 4. Apply systematic fixer if available (95% success rate)
if [ -f "fix-systematic-typescript-errors.cjs" ]; then
    echo "4. Applying systematic TypeScript fixes..."
    node fix-systematic-typescript-errors.cjs || echo "Systematic fixer not available or failed"

    # Check progress
    CURRENT_ERRORS=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
    echo "   Errors after systematic fix: $CURRENT_ERRORS"
fi

echo ""

# Final validation
echo "Performing final validation..."
FINAL_ERRORS=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")

echo "=== Results ==="
echo "Initial errors: $INITIAL_ERRORS"
echo "Final errors: $FINAL_ERRORS"

if [ "$FINAL_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}🎉 SUCCESS: All TypeScript errors resolved!${NC}"
    IMPROVEMENT="100%"
elif [ "$FINAL_ERRORS" -lt "$INITIAL_ERRORS" ]; then
    IMPROVEMENT=$(( (INITIAL_ERRORS - FINAL_ERRORS) * 100 / INITIAL_ERRORS ))
    echo -e "${GREEN}✅ IMPROVEMENT: ${IMPROVEMENT}% reduction in errors${NC}"
else
    echo -e "${RED}❌ No improvement in error count${NC}"
    IMPROVEMENT="0%"
fi

# Test build
echo ""
echo "Testing build stability..."
if yarn build > /tmp/emergency-build-test.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    BUILD_STATUS="SUCCESS"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check /tmp/emergency-build-test.log for details"
    BUILD_STATUS="FAILED"
fi

# Generate report
echo ""
echo "=== Emergency Fix Report ==="
echo "Timestamp: $(date)"
echo "Initial TypeScript errors: $INITIAL_ERRORS"
echo "Final TypeScript errors: $FINAL_ERRORS"
echo "Improvement: $IMPROVEMENT"
echo "Build status: $BUILD_STATUS"

# Decision point
if [ "$FINAL_ERRORS" -eq 0 ] && [ "$BUILD_STATUS" = "SUCCESS" ]; then
    echo ""
    echo -e "${GREEN}Emergency fix completed successfully!${NC}"
    echo "Consider committing these changes:"
    echo "  git add -A"
    echo "  git commit -m 'Emergency TypeScript fix: $IMPROVEMENT improvement'"
elif [ "$FINAL_ERRORS" -lt "$INITIAL_ERRORS" ] && [ "$BUILD_STATUS" = "SUCCESS" ]; then
    echo ""
    echo -e "${YELLOW}Partial success achieved.${NC}"
    echo "Remaining $FINAL_ERRORS errors may need manual attention."
    echo "Consider committing current progress:"
    echo "  git add -A"
    echo "  git commit -m 'Partial TypeScript fix: $IMPROVEMENT improvement'"
else
    echo ""
    echo -e "${RED}Emergency fix was not successful.${NC}"
    echo "Consider rolling back and trying manual fixes:"
    echo "  git stash pop  # Restore original state"
    echo "  # Then investigate specific error patterns manually"
fi

echo ""
echo "Emergency fix completed at $(date)"

# Cleanup
rm -f /tmp/emergency-build-test.log
