#!/bin/bash

# Cleanup script for removing duplicate files and directories in the WhatToEatNext project
# This script will remove files and directories that have " 2" in their name

echo "Starting cleanup process..."
echo "This will remove all files and directories with ' 2' in their name"
echo "Press Enter to continue or Ctrl+C to abort"
read

# Remove duplicate files in data directory
echo "Removing duplicate files in data directory..."
find ./src/data -name "* 2*" -type f -exec rm -v {} \;

# Remove duplicate files in services directory
echo "Removing duplicate files in services directory..."
find ./src/services -name "* 2*" -type f -exec rm -v {} \;

# Remove duplicate files in utils directory
echo "Removing duplicate files in utils directory..."
find ./src/utils -name "* 2*" -type f -exec rm -v {} \;

# Remove duplicate files in components directory
echo "Removing duplicate files in components directory..."
find ./src/components -name "* 2*" -type f -exec rm -v {} \;

# Remove duplicate files in remaining directories
echo "Removing duplicate files in other directories..."
find ./src -name "* 2*" -type f -not -path "*/data/*" -not -path "*/services/*" -not -path "*/utils/*" -not -path "*/components/*" -exec rm -v {} \;

# Remove empty duplicate directories
echo "Removing empty duplicate directories..."
find ./src -name "* 2*" -type d -empty -exec rm -rv {} \; 2>/dev/null || true

# Try to remove non-empty duplicate directories (will only remove if empty)
echo "Checking for non-empty duplicate directories..."
find ./src -name "* 2*" -type d -exec rm -rv {} \; 2>/dev/null || true

echo "Cleanup complete!" 