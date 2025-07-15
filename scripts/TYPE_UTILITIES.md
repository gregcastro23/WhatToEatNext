# Type Structure Utilities

This directory contains utilities for fixing and maintaining type structure consistency throughout the codebase.

## Type Structure Inconsistencies

The `fixTypeInconsistencies.ts` script is designed to automatically fix common type structure issues:

1. **Varieties Arrays vs Objects**: Converts array-based varieties to properly structured Record objects with detailed properties.
2. **ElementalProperties Type Consistency**: Ensures ElementalProperties are typed correctly (not as Record<string, number> or unknown).
3. **ElementalState Type Consistency**: Ensures ElementalState are typed correctly.
4. **Spread Operator Safety**: Fixes unsafe uses of spread operator with unknown types.
5. **Duplicate Properties**: Removes duplicate properties like multiple nutritionalProfile declarations.
6. **Import Path Handling**: Automatically adds proper import statements for ElementalProperties and ElementalState.

### Usage

Run the script to fix all type inconsistencies:

```bash
yarn fix-type-inconsistencies
```

To preview changes without applying them (dry run):

```bash
yarn fix-type-inconsistencies --dry-run
```

To test that the script works correctly:

```bash
yarn test-type-fix
```

### Important Notes

- The scripts use CommonJS module syntax (`require()`) instead of ES module syntax (`import`) for compatibility with ts-node's default settings.
- If you encounter the error `Cannot use import statement outside a module`, it means the script is using ES module syntax in a CommonJS environment.
- If you need to modify the scripts, continue using the CommonJS syntax or configure ts-node to use ES modules.

## Type Utility Functions

The `src/utils/typeUtils.ts` file contains utility functions for safely handling TypeScript types:

1. `safeSpread<T>`: Safely spread unknown objects without type errors.
2. `isRecord`: Type guard to check if an object is a valid Record.
3. `safeElementalProperties`: Safely cast unknown values to ElementalProperties.
4. `safeVarieties`: Convert varieties from any format to a proper Record.
5. `safeEntries` and `safeKeys`: Type-safe alternatives to Object.entries and Object.keys.

Example usage:

```typescript
import { safeSpread, safeElementalProperties } from '../utils/typeUtils';

// Instead of this (unsafe):
const enhanced = { ...ingredient } as Record<string, unknown>;

// Use this (safe):
const enhanced = safeSpread<Record<string, unknown>>(ingredient);

// Instead of casting elementalProperties directly:
const elementalProps = ingredient.elementalProperties as ElementalProperties;

// Use this (safe with fallback values):
const elementalProps = safeElementalProperties(ingredient.elementalProperties);
```

## Other Type Utilities

- `normalizeVarieties`: Convert varieties from string arrays to object format (in `src/utils/ingredientUtils.ts`).
- `normalizeIngredientMapping`: Fix ingredient mapping properties (in `src/utils/ingredientUtils.ts`).
- `normalizeElementalProperties`: Ensure elemental properties sum to 1 (in `src/utils/ingredientUtils.ts`).

## Troubleshooting

If you encounter issues running the scripts:

1. **Module Format Errors**: If you see the error `Cannot use import statement outside a module`, make sure you're using CommonJS syntax in the scripts.

2. **Path Resolution Errors**: If you see errors related to paths, check that the script is correctly resolving relative paths.

3. **TypeScript Errors**: If you encounter TypeScript-related errors, you may need to add type annotations or use the `any` type for simple scripts.

4. **Permissions Issues**: Ensure the script files have executable permissions (`chmod +x scriptname.ts`).

## Best Practices

1. Always use proper types defined in `src/types/` instead of generic Record types.
2. Use type guards (`isRecord`, etc.) to safely handle unknown data.
3. Add explicit type annotations when working with dynamic data.
4. Use the safe utility functions when working with unknown or potentially inconsistent data.
5. Run the fix scripts before major releases to ensure type consistency. 