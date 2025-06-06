# TypeScript Error Fix Scripts

This document explains the scripts we've created to systematically fix TypeScript errors in the WhatToEatNext project.

## Overview of Scripts

We've created several specialized scripts to fix TypeScript errors in different types of files:

1. `fix-typescript-errors.js` - The main script that can fix all file types
2. `fix-test-files.js` - Specifically for fixing test files
3. `fix-api-files.js` - Specifically for fixing API route files
4. `fix-jsx-files.js` - Specifically for fixing React component files with JSX

## Usage

### Main Script

The main script combines all specialized fixes and can be used to target specific file types:

```bash
# Fix all file types
yarn fix:ts

# Dry run (doesn't make changes, just shows what would be fixed)
yarn fix:ts:dry

# Fix only test files
yarn fix:ts:test

# Fix only API files
yarn fix:ts:api

# Fix only JSX files
yarn fix:ts:jsx

# Fix a specific file
yarn fix:ts --file src/path/to/file.ts
```

### Command Line Options

The main script supports several command line options:

- `--dry-run`: Run in dry-run mode, don't make actual changes
- `--type`: Specify file type to fix (test, api, jsx, all)
- `--file`: Fix a specific file
- `--verbose`: Show detailed output, including before/after content

## Types of Fixes

These scripts fix a variety of TypeScript syntax errors, including:

### Test Files
- Incorrect parentheses in test functions
- Missing semicolons in expect statements
- Malformed mock function calls
- Object literals with incorrect syntax
- Issues with async/await test functions

### API Files
- Function parameter syntax errors
- HTTP response formatting issues
- URL string issues
- Variable reference errors
- Ternary expression errors

### JSX Files
- Unclosed JSX tags
- Incorrect component nesting
- Malformed component props
- Dynamic import syntax errors
- Missing or extra closing tags

## Integration with TypeScript Checker

After making fixes, you can verify them with:

```bash
# Check specific files with skipLibCheck
yarn check:ts-fixed-files

# Check using specialized tsconfig
yarn check:ts-specific

# Run full TypeScript check
yarn tsc --noEmit
```

## Expanding the System

To add more fixes or file types:

1. Add new regex patterns to the appropriate section in `fix-typescript-errors.js`
2. Add specific file paths to the file lists at the top of the script
3. Add any specialized fixes for specific files as needed

## Credits

These scripts were developed as part of a systematic approach to fixing TypeScript errors in the WhatToEatNext project while maintaining the integrity of the Alchemical Engine and other core systems. 