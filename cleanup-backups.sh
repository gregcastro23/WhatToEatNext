#!/bin/bash

# Remove backup files in root directory
echo "Removing backup files in root directory..."
rm -f *_backup.js
rm -f *.backup-*
rm -f *-backup.*
rm -f *.bak
rm -f fix-elemental-*backup*

# Remove backup directories
echo "Removing backup directories..."
rm -rf .backup
rm -rf bak
rm -rf backups
rm -rf .next-backup
rm -rf .next\ 2
rm -rf eslint-fix-backups

echo "Backup files cleanup complete!" 