# Step-by-Step Plan for Fixing TypeScript Errors in WhatToEatNext

## Overview

This document outlines a structured approach to addressing TypeScript errors in the WhatToEatNext project, focusing on minimizing risk while systematically resolving issues.

## Priority Order

We'll fix files in the following order of importance:

1. Core engine components:
   - src/app/alchemicalEngine.ts
   - src/calculations/alchemicalCalculations.ts
   - src/calculations/alchemicalEngine.ts

2. API layer and data services:
   - src/app/api/* endpoints
   - src/services/* modules
   - src/data/* important data files

3. UI components:
   - src/components/AstrologyChart/
   - src/components/ElementalDisplay/
   - src/components/FoodRecommender/
   - src/components/IngredientRecommender/

## Testing Approach

For each file, we'll follow this testing process:

1. Analyze without applying changes: `node fix-typescript-safely.js path/to/file.ts`
2. Review suggested fixes and verify they're correct
3. Apply changes: `node fix-typescript-safely.js path/to/file.ts --apply`
4. Verify TypeScript check passes for the file: `yarn tsc --noEmit path/to/file.ts`

## Error Categories and Solutions

### 1. Syntax Errors

Common issues:
- Semicolons instead of commas in object literals
- Missing brackets in function calls
- Unbalanced parentheses

Tool: `fix-typescript-safely.js`

### 2. Type Errors

Common issues:
- Incorrect React hook types
- Missing type declarations
- Incompatible type assignments

Tool: Manual fixes guided by TypeScript error messages

### 3. JSX Errors

Common issues:
- Incorrect JSX attributes
- Unbalanced tags
- Missing React imports

Tool: `fix-jsx-no-backup.js` (with caution)

### 4. Alchemical Engine Errors

Common issues:
- Special syntax for alchemical calculations
- Custom type issues in planetary calculations

Tool: `fix-alchemical-no-backup.js` (with caution)

## Step-by-Step Process

### Step 1: Initial Assessment

1. Run TypeScript check to identify all errors:
   ```bash
   yarn tsc --noEmit > typescript-errors.log
   ```

2. Analyze the error log to identify patterns and prioritize:
   ```bash
   node analyze-typescript-errors.js typescript-errors.log
   ```

### Step 2: Fix Core Engine Components

1. For each core engine file:
   ```bash
   node fix-typescript-safely.js src/app/alchemicalEngine.ts
   node fix-typescript-safely.js src/app/alchemicalEngine.ts --apply
   ```

2. Verify fixes with TypeScript:
   ```bash
   yarn tsc --noEmit src/app/alchemicalEngine.ts
   ```

3. Repeat for other core engine files

### Step 3: Fix API and Data Service Files

1. For each API endpoint and service:
   ```bash
   node fix-typescript-safely.js src/app/api/[endpoint]/route.ts
   node fix-typescript-safely.js src/app/api/[endpoint]/route.ts --apply
   ```

2. Verify fixes with TypeScript:
   ```bash
   yarn tsc --noEmit src/app/api/[endpoint]/route.ts
   ```

### Step 4: Fix UI Components

1. For each component with errors:
   ```bash
   node fix-typescript-safely.js src/components/[component]/[file].tsx
   node fix-typescript-safely.js src/components/[component]/[file].tsx --apply
   ```

2. Address JSX-specific issues if needed:
   ```bash
   node fix-jsx-no-backup.js src/components/[component]/[file].tsx
   ```

### Step 5: Comprehensive Check

1. Run TypeScript check on the entire project:
   ```bash
   yarn tsc --noEmit
   ```

2. Address any remaining errors manually

### Step 6: Validation

1. Build the project:
   ```bash
   yarn build
   ```

2. Run tests:
   ```bash
   yarn test
   ```

3. Start the dev server to verify everything works:
   ```bash
   yarn dev
   ```

## Handling Difficult Cases

For files with complex errors that the scripts can't fix:

1. Create a backup: `cp problematic-file.ts problematic-file.ts.bak`
2. Manually fix the issues guided by TypeScript errors
3. Verify the fixes: `yarn tsc --noEmit problematic-file.ts`

## Progress Tracking

Track progress in a separate file:

```
typescript-fix-progress.md
- [x] alchemicalEngine.ts
- [ ] alchemicalCalculations.ts
...
```

## Conclusion

By following this systematic approach, we can efficiently address TypeScript errors while minimizing the risk of introducing new issues. The key is to work methodically, prioritize critical files, and thoroughly test changes as we make them. 