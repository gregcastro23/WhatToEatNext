# TypeScript Error Fixing in Data Directory

I need to systematically fix TypeScript errors in the `src/data` directory of my
WhatToEatNext project. The codebase contains several common error patterns:

## Common Error Types:

1. **Record Type Syntax Errors**: Using semicolons instead of commas in Record
   type definitions

   ```typescript
   // INCORRECT
   Record < string;
   number >
     // CORRECT
     Record<string, number>;
   ```

2. **Missing Parentheses**: Missing closing parentheses in conditional
   statements

   ```typescript
   // INCORRECT
   if (profile.culinaryAffinity.includes(cuisineName.toLowerCase()) {

   // CORRECT
   if (profile.culinaryAffinity.includes(cuisineName.toLowerCase())) {
   ```

3. **Improper `any` Usage**: Using `any` directly without proper initialization

   ```typescript
   // INCORRECT
   elementalProperties: any,

   // CORRECT
   elementalProperties: { Fire: 0.3, water: 0.3, Air: 0.2, earth: 0.2 },
   ```

4. **Return Type Syntax**: Incorrect function return type syntax

   ```typescript
   // INCORRECT
   function getSeasonalScore(...): number {

   // CORRECT
   function getSeasonalScore(...): number {
   ```

## Prioritized Files to Fix:

1. **High Priority**:
   - `src/data/ingredients/herbs/index.ts` (17 errors, line 29)
   - `src/data/integrations/seasonal.ts` (19 errors, line 29)
   - `src/data/recipes.ts` (7 errors, line 93)
   - `src/data/unified/cuisineIntegrations.ts` (208 errors, line 833)

2. **Medium Priority**:
   - `src/data/unified/cuisines.ts` (8 errors, line 194)
   - `src/data/unified/enhancedIngredients.ts` (123 errors, line 431)
   - `src/data/unified/nutritional.ts` (83 errors, line 652)
   - `src/data/unified/recipeBuilding.ts` (60 errors, line 817)

3. **Lower Priority**:
   - `src/data/unified/alchemicalCalculations.ts` (27 errors, line 74)
   - `src/data/integrations/elementalBalance.ts` (7 errors, line 91)
   - `src/data/sauces.ts` (1 error, line 530)

## Approach:

1. Fix one file at a time, starting with the highest priority files
2. For each file:
   - Identify the specific error types
   - Create a systematic fix for each error pattern
   - Test the fix by running `npx tsc --noEmit` on the individual file
   - Confirm all errors are fixed before moving to the next file

## Note:

The application uses the core alchemical engine with Kalchm and Monica constants
for calculations. All fixes should maintain compatibility with the existing
logic and variable names to ensure the formulas continue to work correctly.

## Goal:

Fix all TypeScript errors in the data directory to allow the project to build
successfully without TypeScript compiler errors.
