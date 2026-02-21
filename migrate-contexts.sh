#!/bin/bash

# Migration script for context restructuring

# Check if we're running in the right directory
if [ ! -d "src" ]; then
  echo "Error: Run this script from the project root"
  exit 1
fi

# Create backup of current contexts
echo "Creating backup of current contexts..."
mkdir -p .backup
cp -r src/context .backup/context-backup
cp -r src/contexts .backup/contexts-backup

# Move the new contexts into place
echo "Installing new contexts structure..."
rm -rf src/contexts-old || true
mv src/contexts src/contexts-old || true
mv src/context src/context-old || true
mv src/contexts-new src/contexts

# Update imports in the project to use new paths
echo "Next steps (manual):"
echo "1. Update imports in your project from '@/context/...' to '@/contexts/...'"
echo "2. Update imports in your project from '@/contexts/useAlchemical' to '@/contexts/AlchemicalContext'"
echo "3. Run your tests to ensure everything works"
echo "4. Once everything is working, delete the backup and old directories"
echo ""
echo "Migration complete. The old contexts are preserved in src/contexts-old and src/context-old."
echo "Backups can also be found in .backup/" 