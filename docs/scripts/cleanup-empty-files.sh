#!/bin/bash

# Cleanup script for finding and removing empty files in the project
# This will help eliminate useless files that take up space

echo "Starting empty file cleanup process..."
echo "This will search for and list empty files in your project"
echo "Press Enter to continue or Ctrl+C to abort"
read

# Find all empty files, but exclude certain directories and patterns
echo "Finding empty files..."
EMPTY_FILES=$(find ./src -type f -empty -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next*/*" -not -path "*/\.*")

if [ -z "$EMPTY_FILES" ]; then
  echo "No empty files found in src directory."
else
  echo "Found the following empty files:"
  echo "$EMPTY_FILES"
  
  echo "Would you like to remove these files? (y/n)"
  read answer
  
  if [ "$answer" = "y" ]; then
    # Remove the empty files
    echo "Removing empty files..."
    find ./src -type f -empty -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next*/*" -not -path "*/\.*" -exec rm -v {} \;
    echo "Empty files have been removed."
  else
    echo "Files were not removed."
  fi
fi

echo "Empty file cleanup complete!" 