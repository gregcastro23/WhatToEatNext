# TypeScript Fixes Required

## Current Issues

1. Case sensitivity problems with component imports
   - Fixed: SunDisplay vs. sunDisplay

2. Missing Type Exports
   - Multiple types missing from exports in various files in `src/types`
   - Need to properly define and export types in appropriate modules

3. Import/Export Structure
   - Need to reorganize the type system for better maintainability
   - Consider consolidating similar types in shared files

## Long-Term Improvements

1. Create consistent naming conventions for all files
2. Implement a more structured type system with proper documentation
3. Use barrel exports consistently to avoid deep import paths 