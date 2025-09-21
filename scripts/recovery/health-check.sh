#!/bin/bash

# Linting Excellence Health Check Script
# Purpose: Quick assessment of codebase health
# Usage: ./scripts/recovery/health-check.sh

set -e

echo "=== Linting Excellence Health Check ==="
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Check git status
echo "1. Git Status Check"
if git diff --quiet && git diff --staged --quiet; then
    print_status "OK" "Working directory is clean"
else
    print_status "WARNING" "Working directory has uncommitted changes"
    echo "   Consider stashing changes before recovery"
fi
echo ""

# Check TypeScript compilation
echo "2. TypeScript Compilation Check"
TS_OUTPUT=$(yarn tsc --noEmit --skipLibCheck 2>&1)
TS_ERRORS=$(echo "$TS_OUTPUT" | grep -c "error TS" 2>/dev/null || echo "0")

if [ "$TS_ERRORS" -eq 0 ]; then
    print_status "OK" "TypeScript compilation successful (0 errors)"
elif [ "$TS_ERRORS" -lt 50 ]; then
    print_status "WARNING" "TypeScript has $TS_ERRORS errors (manageable)"
elif [ "$TS_ERRORS" -lt 200 ]; then
    print_status "ERROR" "TypeScript has $TS_ERRORS errors (needs attention)"
else
    print_status "ERROR" "TypeScript has $TS_ERRORS errors (critical - needs recovery)"
fi
echo ""

# Check ESLint status
echo "3. ESLint Analysis Check"
if yarn lint:quick --format=json > /tmp/eslint-health.json 2>/dev/null; then
    ESLINT_ERRORS=$(node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync('/tmp/eslint-health.json', 'utf8'));
            const errors = data.reduce((sum, file) => sum + file.errorCount, 0);
            const warnings = data.reduce((sum, file) => sum + file.warningCount, 0);
            console.log('Errors:' + errors + ' Warnings:' + warnings);
        } catch (e) {
            console.log('Analysis failed');
        }
    ")

    if [[ "$ESLINT_ERRORS" == *"Errors:0"* ]]; then
        print_status "OK" "ESLint analysis successful ($ESLINT_ERRORS)"
    elif [[ "$ESLINT_ERRORS" == *"Errors:"* ]]; then
        ERROR_COUNT=$(echo "$ESLINT_ERRORS" | sed 's/.*Errors:\([0-9]*\).*/\1/')
        if [ "$ERROR_COUNT" -lt 10 ]; then
            print_status "WARNING" "ESLint has $ESLINT_ERRORS (manageable)"
        else
            print_status "ERROR" "ESLint has $ESLINT_ERRORS (needs attention)"
        fi
    else
        print_status "ERROR" "ESLint analysis failed"
    fi
else
    print_status "ERROR" "ESLint analysis failed - possible parsing errors"
fi
echo ""

# Check build status
echo "4. Build Status Check"
if yarn build > /tmp/build-health.log 2>&1; then
    BUILD_TIME=$(grep -o "Compiled successfully in [0-9.]*s" /tmp/build-health.log | tail -1 || echo "Build completed")
    print_status "OK" "Production build successful ($BUILD_TIME)"
else
    print_status "ERROR" "Production build failed"
    echo "   Check /tmp/build-health.log for details"
fi
echo ""

# Check development server
echo "5. Development Server Check"
timeout 15s yarn dev > /tmp/dev-health.log 2>&1 &
DEV_PID=$!
sleep 8
kill $DEV_PID 2>/dev/null || true
wait $DEV_PID 2>/dev/null || true

if grep -q "ready" /tmp/dev-health.log; then
    print_status "OK" "Development server starts successfully"
elif grep -q "error" /tmp/dev-health.log; then
    print_status "ERROR" "Development server has errors"
else
    print_status "WARNING" "Development server status unclear"
fi
echo ""

# Check disk space
echo "6. System Resources Check"
DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_status "OK" "Disk usage: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -lt 90 ]; then
    print_status "WARNING" "Disk usage: ${DISK_USAGE}% (consider cleanup)"
else
    print_status "ERROR" "Disk usage: ${DISK_USAGE}% (critical - cleanup needed)"
fi

# Check memory
if command -v free >/dev/null 2>&1; then
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        print_status "OK" "Memory usage: ${MEMORY_USAGE}%"
    else
        print_status "WARNING" "Memory usage: ${MEMORY_USAGE}% (high)"
    fi
fi
echo ""

# Overall assessment
echo "=== Overall Assessment ==="
if [ "$TS_ERRORS" -eq 0 ] && [[ "$ESLINT_ERRORS" == *"Errors:0"* ]] && yarn build > /dev/null 2>&1; then
    print_status "OK" "Codebase is in excellent health"
    echo "   No recovery needed at this time"
elif [ "$TS_ERRORS" -lt 50 ] && [ "$ERROR_COUNT" -lt 10 ]; then
    print_status "WARNING" "Codebase has minor issues"
    echo "   Consider running targeted fixes"
else
    print_status "ERROR" "Codebase needs recovery"
    echo "   Run: ./scripts/recovery/full-recovery.sh"
fi

echo ""
echo "Health check completed at $(date)"

# Cleanup
rm -f /tmp/eslint-health.json /tmp/build-health.log /tmp/dev-health.log
