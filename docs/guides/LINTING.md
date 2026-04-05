# Linting Guide for WhatToEatNext

This document describes the approach for fixing linting issues in the
WhatToEatNext project.

## Overview

The project uses ESLint with TypeScript support to maintain code quality. We've
created a safe script that helps fix common linting issues without corrupting
files.

## Safety Measures

Our `fix-linting-issues.js` script implements several safeguards:

1. **Backups**: Creates backups of all files before modification
2. **Content Validation**: Validates the modified content to ensure it's not
   corrupted
3. **Precision**: Uses precise fixes rather than broad replacements
4. **Error Handling**: Comprehensive error handling to prevent problems
5. **Restoration**: Provides functionality to restore from backups if needed
6. **Logging**: Detailed logs of all changes made

## Running the Linting Fix

We recommend using the included shell script to run the linting fix in a
controlled manner:

```bash
./src/scripts/run-lint-fix.sh
```

This script will:

1. First run in test mode to show what would be changed
2. Ask for confirmation before making any actual changes
3. Run in safe mode (less aggressive fixes) first
4. Only proceed to more aggressive fixes with additional confirmation

## Manual Execution Options

You can also run the script directly with different options:

```bash
# Test mode - shows what would be changed without making changes
node src/scripts/fix-linting-issues.js --test

# Safe mode - only applies low-risk fixes
node src/scripts/fix-linting-issues.js --safe-mode

# Full mode - applies all automated fixes
node src/scripts/fix-linting-issues.js

# Restore mode - reverts all changes from backups
node src/scripts/fix-linting-issues.js --restore
```

## Types of Fixes Applied

The script fixes several common ESLint issues:

1. **Unused Variables**: Prefixes unused variables with underscores
2. **Console Statements**: Comments out console.log statements
3. **Unnecessary Escapes**: Removes unnecessary escape characters
4. **Prefer-Const**: Converts `let` declarations to `const` where appropriate
5. **Duplicate Imports**: Removes duplicate import statements

## Troubleshooting

If you encounter any issues:

1. Check the log file (`lint-fix-log.txt`) for details
2. Restore from backups using the restore command
3. For major issues, manually restore the specific file from the backup
   directory

## Backup Location

All original files are backed up to `./lint-fix-backups/` with the original
directory structure preserved.
