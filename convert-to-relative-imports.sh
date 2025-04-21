#!/bin/bash

# Script to convert all @/ imports to relative imports
# Usage:
#   ./convert-to-relative-imports.sh          # Convert all files
#   ./convert-to-relative-imports.sh test     # Run a test on a few files first
#   ./convert-to-relative-imports.sh revert   # Revert all changes using backups

# Check for test mode
TEST_MODE=0
REVERT_MODE=0

if [ "$1" == "test" ]; then
  TEST_MODE=1
  echo "Running in TEST mode - will only convert a few sample files"
elif [ "$1" == "revert" ]; then
  REVERT_MODE=1
  echo "Running in REVERT mode - will restore all backup files"
fi

# If in revert mode, restore all .bak files
if [ $REVERT_MODE -eq 1 ]; then
  echo "Restoring all backup files..."
  
  # Find all .bak files and restore them
  BACKUP_FILES=$(find src -type f -name "*.bak")
  
  if [ -z "$BACKUP_FILES" ]; then
    echo "No backup files found. Nothing to revert."
    exit 0
  fi
  
  echo "Found the following backup files to restore:"
  echo "$BACKUP_FILES"
  echo
  
  echo "Restoring files..."
  for BAK_FILE in $BACKUP_FILES; do
    ORIGINAL_FILE=${BAK_FILE%.bak}
    cp "$BAK_FILE" "$ORIGINAL_FILE"
    echo "Restored: $ORIGINAL_FILE"
  done
  
  echo "Revert completed! All files have been restored from backups."
  echo "Backup files (.bak) have been kept for reference."
  exit 0
fi

# Install required dependencies if they're not already installed
if ! yarn list --depth=0 | grep -q "glob"; then
  echo "Installing glob dependency..."
  yarn add --dev glob
fi

# Run the conversion script
if [ $TEST_MODE -eq 1 ]; then
  echo "Starting test import conversion on sample files..."
  node scripts/convert-multiple-files.js
else
  echo "Starting full import conversion process..."
  echo "This will create backups of all files before modifying them."
  echo "You can revert changes later by running './convert-to-relative-imports.sh revert'"
  echo
  
  # Prompt for confirmation
  read -p "Do you want to proceed with converting all imports? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Conversion cancelled."
    exit 0
  fi
  
  # Run the full conversion
  node scripts/convert-to-relative-imports.js
fi

# Check if the script was successful
if [ $? -eq 0 ]; then
  echo "Conversion completed successfully!"
  
  if [ $TEST_MODE -eq 1 ]; then
    echo "Test was successful. To convert all files, run: ./convert-to-relative-imports.sh"
  else
    echo "All imports have been converted to relative paths."
    echo "Backup files (.bak) have been created and can be used to revert changes if needed."
    echo "To revert all changes: ./convert-to-relative-imports.sh revert"
  fi
  
  echo ""
  echo "It's recommended to run tests before committing changes:"
  echo "  yarn build"
  echo "  yarn test"
else
  echo "Conversion failed. Please check the error messages above."
fi 