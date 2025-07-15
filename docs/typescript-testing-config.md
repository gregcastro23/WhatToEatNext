# TypeScript and Jest-DOM Integration Guide

## Overview

This document explains how we handle TypeScript type checking for both application code and test code, specifically addressing conflicts with the `@testing-library/jest-dom` type definitions.

## The Problem

The project experienced TypeScript errors related to the `testing-library__jest-dom` type definitions when running type checks on regular application code. This happened because:

1. The Jest DOM type definitions were included in the main `tsconfig.json`
2. Multiple declaration files existed across the project
3. Type checking was running against both test and application files simultaneously

## The Solution

We've implemented a dual-configuration approach:

1. **Development Configuration** (`tsconfig.dev.json`):
   - Excludes test-specific types
   - Used for checking application code

2. **Testing Configuration** (`tsconfig.jest.json`):
   - Includes Jest-specific types
   - Used for checking test files

3. **Base Configuration** (`tsconfig.base.json`):
   - Contains shared settings
   - Extended by both dev and test configs

4. **Type Checking Tool** (`type-check.js`):
   - Chooses the right configuration automatically
   - Handles single-file or project-wide checking

## Usage Instructions

### For Regular Development

When working on application files, use:

```bash
yarn type-check src/your/file.ts
```

This uses the development configuration that excludes Jest DOM types.

### For Test Development

When working on test files, use:

```bash
yarn type-check:tests src/your/file.test.ts
```

This uses the test configuration that includes Jest DOM types.

### Checking Entire Project

To type-check the entire project (excluding tests):

```bash
yarn type-check
```

To type-check all test files:

```bash
yarn type-check:tests
```

## Type Definition Files

The project has several TypeScript declaration files related to Jest DOM:

1. `jest-dom.d.ts` - Primary declaration file for Jest DOM matchers
2. `typescript-jest-dom.d.ts` - Simple module declaration file
3. `src/types/testing-library__jest-dom/index.d.ts` - Detailed matcher types

These files are only included in the test configuration to prevent conflicts.

## Troubleshooting

### If Jest-DOM Errors Persist

If you still see errors related to testing-library when checking application code:

1. Make sure you're using the right command (`yarn type-check` not `yarn tsc`)
2. Check that the file is being checked with `tsconfig.dev.json`
3. Try running the script directly: `node type-check.js src/your/file.ts`

### If Test Types Are Missing

If your test files can't find Jest-DOM types:

1. Make sure you're using `yarn type-check:tests` for test files
2. Verify that `@testing-library/jest-dom` is properly imported in test files:
   ```typescript
   import '@testing-library/jest-dom';
   ```

## Implementation Details

### Configuration Files

1. **tsconfig.base.json**
   - Contains shared compiler options
   - No test-specific types

2. **tsconfig.dev.json**
   - Extends base config
   - Only includes `node` types
   - Excludes test files and jest-dom declarations

3. **tsconfig.jest.json**
   - Extends base config
   - Includes Jest and Jest-DOM types
   - Only includes test files

### Type Checking Script

The `type-check.js` script:
- Determines which config to use based on arguments
- Creates temporary configurations for single-file checking
- Properly handles cleanup of temporary files
- Provides clear error output

## Adding New Test Matchers

If you need to add new custom Jest matchers:

1. Add them to `jest-dom.d.ts` in the root
2. Update `src/types/testing-library__jest-dom/index.d.ts` with the new matchers
3. Run `yarn type-check:tests` to verify they're properly recognized 