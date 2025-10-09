#!/bin/bash

###############################################################################
# Phase 4 Master Automation Script
# WhatToEatNext - October 9, 2025
#
# One-command execution of Phase 4 Enterprise Quality Assurance
# Combines atomic safety, batch processing, and progress tracking
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${CYAN}🚀 Phase 4: Enterprise Quality Assurance${NC}"
echo -e "${CYAN}   WhatToEatNext - October 9, 2025${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Default values
DRY_RUN="true"
PROCESSORS=""
ALL_PROCESSORS="TS1005 TS1003 TS1128 TS1134 TS1180 TS1434 TS1442"
STOP_ON_FAILURE=""
PAUSE_BETWEEN="0"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --confirm)
      DRY_RUN="false"
      shift
      ;;
    --all)
      PROCESSORS="$ALL_PROCESSORS"
      shift
      ;;
    --stop-on-failure)
      STOP_ON_FAILURE="--stop-on-failure"
      shift
      ;;
    --pause=*)
      PAUSE_BETWEEN="${1#*=}"
      shift
      ;;
    TS*)
      PROCESSORS="$PROCESSORS $1"
      shift
      ;;
    --help|-h)
      echo "Usage: ./scripts/phase4-run.sh [OPTIONS] [PROCESSORS]"
      echo ""
      echo "Options:"
      echo "  --confirm              Execute in LIVE mode (default: dry-run)"
      echo "  --all                  Run all available processors"
      echo "  --stop-on-failure      Stop batch execution on first failure"
      echo "  --pause=<ms>           Pause between processors (milliseconds)"
      echo "  --help, -h             Show this help message"
      echo ""
      echo "Processors:"
      echo "  TS1005                 Semicolon/comma processor"
      echo "  TS1003                 Identifier processor"
      echo "  TS1128                 Declaration processor"
      echo "  TS1134                 Variable declaration processor"
      echo "  TS1180                 Destructuring processor"
      echo "  TS1434                 Keyword processor"
      echo "  TS1442                 Token processor"
      echo ""
      echo "Examples:"
      echo "  # Dry-run all processors"
      echo "  ./scripts/phase4-run.sh --all"
      echo ""
      echo "  # Run specific processors (live)"
      echo "  ./scripts/phase4-run.sh TS1005 TS1434 TS1180 --confirm"
      echo ""
      echo "  # Full system run with pause (live)"
      echo "  ./scripts/phase4-run.sh --all --confirm --pause=2000"
      echo ""
      echo "  # Stop on first failure"
      echo "  ./scripts/phase4-run.sh --all --stop-on-failure --confirm"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Unknown option: $1${NC}"
      echo "Run './scripts/phase4-run.sh --help' for usage information"
      exit 1
      ;;
  esac
done

# Validate processors
if [ -z "$PROCESSORS" ]; then
  echo -e "${RED}❌ No processors specified${NC}"
  echo ""
  echo "Use --all to run all processors, or specify error codes:"
  echo "  ./scripts/phase4-run.sh TS1005 TS1434 TS1180"
  echo ""
  echo "Run './scripts/phase4-run.sh --help' for more information"
  exit 1
fi

# Display execution plan
echo -e "${BLUE}📋 Execution Plan:${NC}"
echo "──────────────────────────────────────────────────────────────"
echo -e "Mode:              ${YELLOW}$([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "LIVE")${NC}"
echo "Processors:        $PROCESSORS"
echo "Stop on failure:   $([ -n "$STOP_ON_FAILURE" ] && echo "Yes" || echo "No")"
echo "Pause between:     ${PAUSE_BETWEEN}ms"
echo ""

# Confirmation for live mode
if [ "$DRY_RUN" = "false" ]; then
  echo -e "${YELLOW}⚠️  WARNING: This will modify files!${NC}"
  echo "Press Ctrl+C to cancel, or Enter to continue..."
  read -r
fi

# Step 1: Capture baseline metrics
echo ""
echo -e "${BLUE}📊 Step 1: Capturing baseline metrics...${NC}"
echo "──────────────────────────────────────────────────────────────"
node src/scripts/quality-gates/simple-metrics.js capture

# Step 2: Run batch processing with atomic safety
echo ""
echo -e "${BLUE}🔧 Step 2: Running processors with atomic safety...${NC}"
echo "──────────────────────────────────────────────────────────────"

# Build command
BATCH_CMD="node src/scripts/quality-gates/processor-factory.js batch-safe $PROCESSORS"

if [ "$DRY_RUN" = "false" ]; then
  BATCH_CMD="$BATCH_CMD --confirm"
fi

if [ -n "$STOP_ON_FAILURE" ]; then
  BATCH_CMD="$BATCH_CMD --stop-on-failure"
fi

if [ "$PAUSE_BETWEEN" != "0" ]; then
  BATCH_CMD="$BATCH_CMD --pause=$PAUSE_BETWEEN"
fi

# Execute batch processing
eval "$BATCH_CMD"
BATCH_EXIT_CODE=$?

# Step 3: Capture post-processing metrics
echo ""
echo -e "${BLUE}📊 Step 3: Capturing post-processing metrics...${NC}"
echo "──────────────────────────────────────────────────────────────"
node src/scripts/quality-gates/simple-metrics.js capture

# Step 4: Show progress report
echo ""
echo -e "${BLUE}📈 Step 4: Progress report...${NC}"
echo "──────────────────────────────────────────────────────────────"
node src/scripts/quality-gates/simple-metrics.js report 7

# Final summary
echo ""
echo "════════════════════════════════════════════════════════════════"
if [ $BATCH_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Phase 4 execution complete - Success${NC}"
else
  echo -e "${YELLOW}⚠️  Phase 4 execution complete - Some processors failed${NC}"
fi
echo "════════════════════════════════════════════════════════════════"
echo ""

# Additional recommendations
if [ "$DRY_RUN" = "true" ]; then
  echo -e "${CYAN}💡 This was a dry-run. To apply changes, add --confirm:${NC}"
  echo "   ./scripts/phase4-run.sh $(echo $PROCESSORS | head -c 50) --confirm"
  echo ""
fi

exit $BATCH_EXIT_CODE
