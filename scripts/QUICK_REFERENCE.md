# Fix Scripts Quick Reference

## 🚀 Most Commonly Used Scripts

### Build & Syntax Issues
```bash
# Fix remaining syntax errors
node scripts/syntax-fixes/fix-remaining-syntax-errors.js --dry-run

# Fix TypeScript errors  
node scripts/typescript-fixes/fix-duplicate-identifiers-systematic.js --dry-run
```

### Elemental Logic Issues (CRITICAL)
```bash
# Fix elemental logic violations (elements treated as opposites)
node scripts/elemental-fixes/fix-elemental-logic.js --dry-run

# Fix casing conventions for elements/planets/signs
node scripts/elemental-fixes/fix-casing-conventions.js --dry-run
```

### Import/Export Issues
```bash
# Fix ingredient imports
node scripts/ingredient-scripts/fix-all-ingredient-imports.js --dry-run

# Fix API usage issues
node scripts/typescript-fixes/fix-astrologize-api-usage.js --dry-run
```

## 📂 Script Categories

### TypeScript Fixes
- **fix-ingredient-type.ts** - Fix ingredient type definitions
- **fix-planetary-types.ts** - Fix planetary type definitions  
- **fix-promise-awaits.ts** - Fix async/await patterns
- **fix-season-types.ts** - Fix seasonal type definitions
- **fixTypeInconsistencies.ts** - Fix general type inconsistencies
- **updateCookingMethodTypes.ts** - Update cooking method types

### Syntax Fixes
- **fixZodiacSignLiterals.ts** - Fix zodiac sign literal types

### Ingredient Scripts
- **fixIngredientMappings.ts** - Fix ingredient mapping issues

### Elemental Fixes
- **fix-elemental-logic.js** - Fix elemental opposition logic
- **fix-casing-conventions.js** - Fix element/planet/sign casing

### Cleanup Scripts
- Various cleanup and maintenance scripts

## 🔧 Usage Patterns

### Always Test First
```bash
# Always run with --dry-run first
node scripts/category/script-name.js --dry-run

# Review changes
git diff

# Apply if satisfied
node scripts/category/script-name.js
```

### Build Verification
```bash
# After running fixes, always test build
yarn build
```

## 📋 Project-Specific Notes

- **Use yarn, not npm**
- **Elements are NOT opposites** (Fire doesn't oppose Water)
- **All scripts support --dry-run mode**
- **No backup files are created** (use git for version control)
- **Always run yarn build after fixes**
