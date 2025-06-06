# TypeScript Error Fix Scripts

This directory contains scripts to systematically fix TypeScript errors in the codebase. These scripts target common patterns and types of errors to reduce the overall TypeScript error count.

## Available Scripts

### Core Fix Scripts

1. **fix-alchemical-properties.js**: Fixes issues with the AlchemicalProperties interface.
   - Ensures property names are lowercase (spirit, essence, matter, substance).

2. **fix-season-type.js**: Standardizes Season type usage.
   - Ensures both 'autumn' and 'fall' variants are properly supported.

3. **fix-planetary-types.js**: Fixes issues with PlanetaryPosition and related types.
   - Adds missing exactLongitude property to PlanetaryPosition.

4. **fix-any-usage.js**: Replaces 'any' being used as values with proper alternatives.
   - Replaces 'any' with {} to resolve type errors.

### Type Mismatch and Property Fix Scripts

5. **fix-type-mismatches.js**: Resolves type mismatch issues for:
   - ElementalAffinity usage (converting strings to objects with 'base' property)
   - ChakraEnergies property mismatches (brow vs thirdEye)
   - RecipeHarmonyResult compatibility issues

6. **fix-missing-properties.js**: Adds missing properties to interfaces, including:
   - RecipeHarmonyResult required properties
   - ChakraEnergies property fixes
   - Other common missing property patterns

7. **fix-import-issues.js**: Fixes import statement problems:
   - Breaking up imports from @/data/planets into individual imports
   - Adding missing imports for hooks and types
   - Fixing other common import pattern issues

8. **fix-component-props.js**: Fixes React component props type issues:
   - Adding missing Props interfaces for components
   - Fixing props type mismatches in component definitions
   - Adding type annotations to functional components

### New Fix Scripts

9. **fix-promise-await.js**: Fixes Promise-related errors:
   - Adds missing `await` keywords before array methods on Promises (.filter, .map, etc.)
   - Prevents "Property 'filter'/'map' does not exist on type 'Promise<T>'" errors
   - Improves async/await usage throughout the codebase

10. **fix-unknown-types.js**: Fixes 'unknown' type issues:
    - Adds type assertions for properties with 'unknown' type
    - Handles common patterns like `intensity: ingredient.intensity || 0.5`
    - Adds proper type assertions for array properties

11. **fix-interface-properties.js**: Fixes interface property issues:
    - Adds missing 'energy' property to BasicThermodynamicProperties
    - Updates CelestialPosition interface to include 'exactLongitude'
    - Fixes ZodiacSign type issues with proper type assertions
    - Adds missing properties to PlanetaryAspect objects

12. **fix-duplicate-properties.js**: Fixes duplicate property issues in object literals:
    - Targets the backup-unified/ingredients.ts file with 100+ duplicate property errors
    - Removes redundant property declarations in object literals
    - Preserves the first occurrence of each property
    - Resolves TS1117: "An object literal cannot have multiple properties with the same name"

13. **fix-basic-thermodynamic-properties.js**: Fixes thermodynamic property issues:
    - Adds missing 'energy' property to BasicThermodynamicProperties objects
    - Fixes empty ElementalProperties objects with proper values
    - Replaces 'any' usage in seasonalAdjustments.ts with actual elemental values
    - Ensures consistent thermodynamic property calculation throughout the codebase

14. **fix-unknown-object-access.js**: Fixes 'unknown' type object access errors:
    - Adds type assertions for accessing properties on objects with 'unknown' type
    - Fixes recipe property access errors (elementalProperties, season, tags, etc.)
    - Adds proper type assertions for elementalEffect property access
    - Adds missing type imports for Recipe interfaces
    - Resolves "Property does not exist on type 'unknown'" errors

15. **fix-syntax-errors.js**: Fixes syntax errors in problematic files:
    - RepAirs malformed class and method declarations in ChakraAlchemyService.ts
    - Fixes broken object literals with misplaced energy properties in FoodAlchemySystem.ts
    - Corrects syntax errors in alchemy.ts type definitions
    - Resolves parser errors that prevent TypeScript from compiling

16. **fix-multiple-issues.js**: Comprehensive script that fixes multiple issues.

### Utility Scripts

17. **run-all-fixes.js**: Runs all scripts in sequence, tracking error count reduction.

## Usage

### Running All Fixes

The simplest approach is to run all fixes in sequence:

```bash
# Dry run (no changes will be made)
yarn fix:typescript:dry

# Apply all fixes
yarn fix:typescript

# Verbose mode (show detailed output)
yarn fix:typescript:verbose
```

### Running Individual Scripts

You can also run individual scripts if you want to target specific types of issues:

```bash
# Dry run with a specific script
node scripts/typescript-fixes/fix-type-mismatches.js --dry-run

# Apply fixes from a specific script
node scripts/typescript-fixes/fix-import-issues.js
```

## Options

All scripts support the following command-line options:

- `--dry-run`: Run the script without making any changes to files
- `--verbose`: Show detailed output, including all file modifications

## Results

The scripts report the number of errors at the start and end of the process, as well as the number of files modified. When running all scripts with `run-all-fixes.js`, you'll see error count changes after each individual script runs.

## Safety

These scripts are designed to be safe and conservative:

1. They make targeted changes to specific patterns
2. They maintain code structure and only modify what's necessary
3. All changes can be previewed with `--dry-run` before applying
4. The scripts avoid making changes when patterns are ambiguous

## Best Practices

1. Always run with `--dry-run` first to see what changes would be made
2. After fixing errors, run `yarn tsc --noEmit` to check remaining errors
3. Consider running fixes in smaller batches rather than on the entire codebase at once
4. Back up your codebase before running the scripts (or use version control)

## Future Improvements

1. Add more specific fixes for remaining error patterns
2. Create more targeted fixes for component-specific issues
3. Add ability to fix a specific file or directory
4. Add more sophisticated type inference

# Unified Ingredients TypeScript Fix

This directory contains scripts to fix TypeScript issues in the WhatToEatNext project.

## Unified Ingredients Refactoring

### Problem

The original `src/data/unified/ingredients.ts` file was causing 595 TypeScript errors due to:

1. Duplicating ingredient data that already exists in the `data/ingredients` subdirectories
2. Using incorrect TypeScript interfaces that conflicted with the rest of the codebase
3. Containing duplicate keys in the object literal (as shown by linter errors)
4. Being excessively large (601,909 bytes / ~27,000 lines)

### Solution

We've created a completely new implementation that:

1. Acts as an enhancer/adapter for existing ingredient data instead of duplicating it
2. Properly calculates Kalchm and Monica values for all ingredients
3. Uses proper TypeScript interfaces from `unifiedTypes.ts`
4. Provides useful utility functions for working with the unified ingredients

### Implementation Details

The new implementation:

1. Imports ingredient data from its original sources in `data/ingredients/`
2. Enhances each ingredient with calculated Kalchm and Monica values
3. Provides utility functions for finding ingredients by various criteria
4. Maintains compatibility with existing code that uses `unifiedIngredients`

### How to Apply the Fix

1. We've created a new implementation at `src/data/unified/ingredients.ts.new`
2. Run the replacement script to safely update the file:

```bash
# Navigate to the scripts directory
cd scripts/typescript-fixes

# Install dependencies if needed
npm install

# Run the replacement script
npm run replace-ingredients
```

The script will:
- Create a backup of the original file at `src/data/unified/ingredients.ts.bak`
- Replace the original file with our new implementation
- Remove the temporary `.new` file

### Verification

After running the script, you should:

1. Run the TypeScript compiler to verify that errors are reduced
2. Test the application to ensure all functionality works correctly
3. Check that Kalchm and Monica values are properly calculated

## Other TypeScript Fixes

This directory will be extended with additional scripts to fix other TypeScript issues in the codebase. 