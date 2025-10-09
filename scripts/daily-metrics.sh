#!/bin/bash

###############################################################################
# Daily Metrics Capture
# WhatToEatNext - Phase 4 Enterprise Quality Assurance
# October 9, 2025
#
# Run this script daily via cron to track error reduction progress
###############################################################################

# Navigate to project directory
cd "$(dirname "$0")/.." || exit 1

# Capture metrics
echo "📊 Capturing daily metrics..."
node src/scripts/quality-gates/simple-metrics.js capture

# Generate weekly report (optional - comment out if not needed)
echo ""
echo "📈 Generating weekly progress report..."
node src/scripts/quality-gates/simple-metrics.js report 7

# Exit with success
exit 0
