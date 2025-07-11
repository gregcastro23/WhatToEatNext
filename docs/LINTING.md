# Linting Guide for WhatToEatNext

This document provides guidelines for linting in the WhatToEatNext project.

## Overview

The project uses ESLint with TypeScript support to maintain code quality. We've implemented an automated approach to fix common linting issues without corrupting files.

## Linting Configuration

The project uses ESLint with the new flat config format (eslint.config.mjs). This configuration includes:

- TypeScript support through the @typescript-eslint plugin
- React and React Hooks rule sets
- Import validation rules
- Customized rules for different file types

## Running Linting Checks

```bash
# Check for linting issues
yarn lint

# Fix automatically fixable issues
yarn lint:fix

# Run comprehensive fixes with our custom script
yarn lint:all-fix

# Fix no-const-assign errors in a specific file
yarn lint:const-assign src/path/to/file.ts

# Fix unused variables in a specific file
yarn lint:unused-vars src/path/to/file.ts

# Clean up backup files after fixing linting issues
yarn clean:backups
```

## Common Linting Issues

### no-const-assign

This error occurs when attempting to reassign a value to a variable declared with `const`. Fix by:

1. Changing the declaration from `const` to `let`
2. Using our custom script: `node src/scripts/fix-const-assign.js <filepath>`

### unused-vars

Variables and parameters that are unused should be prefixed with an underscore (_) to indicate they are intentionally unused.

```typescript
// Before
function example(unusedParam) {
  const unusedVar = 'never used';
  return 'something else';
}

// After
function example(_unusedParam) {
  const _unusedVar = 'never used';
  return 'something else';
}
```

### no-explicit-any

Avoid using the `any` type in TypeScript. Create proper interfaces or types instead.

## Build Process

The project is configured to run ESLint during builds (`next build`). This helps catch issues before deployment.

```javascript
// next.config.js
eslint: {
  ignoreDuringBuilds: false, // Enable ESLint during builds
  dirs: ['src', 'pages'], // Directories to lint
}
```

## Safe Fixing Approach

We've created custom scripts to safely fix linting issues:

1. **fix-linting-issues.js**: A comprehensive script that fixes multiple types of issues while creating backups
2. **fix-const-assign.js**: A targeted script for fixing no-const-assign errors
3. **fix-unused-vars.js**: A script to prefix unused variables with underscores
4. **clean-backups.js**: A script to clean up backup files after fixing issues

These scripts implement safeguards to prevent file corruption, including:

- Creating backups before modifying files
- Validating content after changes
- Rolling back changes if errors occur

## Backup Cleanup

When running the linting fix scripts, backup files (.bak) are created to ensure safety. After verifying that the fixes work correctly, you can clean up these backup files with:

```bash
yarn clean:backups
```

This will remove:
- All .bak files in the src directory
- The lint-fix-backups directory (if it exists)

## Best Practices

1. **Fix issues as you code**: Don't let linting errors accumulate
2. **Run linting before commits**: Ensure your changes pass linting checks before committing
3. **Use our custom scripts**: For safely fixing multiple issues at once
4. **Maintain conventions**: Follow the project's naming and style conventions
5. **Learn from errors**: Understanding linting errors helps write better code
6. **Clean up backups**: After verifying fixes, remove backup files for cleanliness 