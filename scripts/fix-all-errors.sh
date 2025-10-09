#!/bin/bash

###############################################################################
# Fix All Errors - Iterative Processor Execution
# WhatToEatNext - Phase 4 Enterprise Error Elimination
# October 9, 2025
###############################################################################

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🔧 Phase 4: Iterative Error Fixing"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Capture baseline
echo "📊 Capturing baseline metrics..."
BASELINE=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
echo "   Baseline errors: $BASELINE"
echo ""

# Track total fixes
TOTAL_FIXED=0
ITERATION=1
MAX_ITERATIONS=5

echo "🚀 Starting iterative processor execution (max $MAX_ITERATIONS iterations)"
echo ""

# Run until no more fixes or max iterations
while [ $ITERATION -le $MAX_ITERATIONS ]; do
  echo "════════════════════════════════════════════════════════════════"
  echo "   ITERATION $ITERATION of $MAX_ITERATIONS"
  echo "════════════════════════════════════════════════════════════════"

  BEFORE=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
  echo "   Errors before iteration: $BEFORE"
  echo ""

  # Run TS1005 processor
  echo "🔧 Running TS1005 processor..."
  TS1005_OUTPUT=$(node src/scripts/processors/ts1005-processor.js --confirm 2>&1)
  TS1005_FIXED=$(echo "$TS1005_OUTPUT" | grep "Errors fixed:" | awk '{print $3}' || echo "0")
  echo "   TS1005 fixed: $TS1005_FIXED errors"

  # Run TS1128 processor
  echo "🔧 Running TS1128 processor..."
  TS1128_OUTPUT=$(node src/scripts/processors/ts1128-processor.js --confirm 2>&1)
  TS1128_FIXED=$(echo "$TS1128_OUTPUT" | grep "Errors fixed:" | awk '{print $3}' || echo "0")
  echo "   TS1128 fixed: $TS1128_FIXED errors"

  AFTER=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
  ITERATION_REDUCTION=$((BEFORE - AFTER))
  TOTAL_FIXED=$((TOTAL_FIXED + ITERATION_REDUCTION))

  echo ""
  echo "   Errors after iteration: $AFTER"
  echo "   Reduction this iteration: $ITERATION_REDUCTION"
  echo ""

  # Stop if no improvement
  if [ "$ITERATION_REDUCTION" -le 0 ]; then
    echo "   ℹ️  No improvement this iteration - stopping"
    break
  fi

  ITERATION=$((ITERATION + 1))
done

# Final metrics
FINAL=$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 FINAL RESULTS"
echo "════════════════════════════════════════════════════════════════"
echo "   Baseline errors:      $BASELINE"
echo "   Final errors:         $FINAL"
echo "   Total reduction:      $TOTAL_FIXED"
echo "   Percent improvement:  $(echo "scale=2; ($TOTAL_FIXED * 100) / $BASELINE" | bc)%"
echo "   Iterations completed: $((ITERATION - 1))"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Capture final metrics
echo "💾 Capturing final metrics..."
node src/scripts/quality-gates/simple-metrics.js capture

echo ""
echo "✅ Iterative error fixing complete!"
echo ""

exit 0
