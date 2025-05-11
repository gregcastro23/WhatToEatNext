#!/bin/bash

# Script to safely run the linting fix process
echo "WhatToEatNext Linting Fix Script"
echo "================================"

# Make sure the linting fix script exists
if [ ! -f "src/scripts/fix-linting-issues.js" ]; then
  echo "Error: Linting fix script not found at src/scripts/fix-linting-issues.js"
  exit 1
fi

# Step 1: Run in test mode first
echo "Step 1: Running in test mode to see what would be changed..."
node src/scripts/fix-linting-issues.js --test

# Ask user if they want to continue
read -p "Do you want to continue with actual fixes? (y/n): " continue_choice
if [[ ! "$continue_choice" =~ ^[Yy] ]]; then
  echo "Exiting without making changes."
  exit 0
fi

# Step 2: Run in safe mode (less aggressive fixes)
echo "Step 2: Running in safe mode (minimal risk fixes)..."
node src/scripts/fix-linting-issues.js --safe-mode

# Ask user if they want to apply more aggressive fixes
read -p "Do you want to apply more aggressive fixes? (y/n): " aggressive_choice
if [[ ! "$aggressive_choice" =~ ^[Yy] ]]; then
  echo "Finished with safe mode fixes only."
  exit 0
fi

# Step 3: Run full fixes
echo "Step 3: Running full linting fixes..."
node src/scripts/fix-linting-issues.js

echo "Linting fixes completed."
echo "If you need to restore from backups, run: node src/scripts/fix-linting-issues.js --restore"

# Make the shell script executable
chmod +x src/scripts/run-lint-fix.sh 