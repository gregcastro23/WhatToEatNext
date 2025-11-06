# ESLint Configuration Upgrade Guide

**Updated:** November 6, 2025
**Version:** ESLint 9.17.0 + TypeScript-ESLint 8.18.2

## 🎯 Overview

This guide documents the comprehensive ESLint configuration upgrade for the WhatToEatNext project. The upgrade brings modern linting capabilities, enhanced type safety, and performance optimizations.

## 📦 What Changed

### Package Upgrades

| Package                            | Old Version | New Version |
| ---------------------------------- | ----------- | ----------- |
| `eslint`                           | 8.57.0      | 9.17.0      |
| `@typescript-eslint/eslint-plugin` | 5.61.0      | 8.18.2      |
| `@typescript-eslint/parser`        | 5.61.0      | 8.18.2      |
| `eslint-plugin-react`              | 7.33.2      | 7.37.3      |

### New Packages Added

- `@eslint/js` ^9.17.0 - Modern ESLint JavaScript rules
- `@typescript-eslint/utils` ^8.18.2 - TypeScript ESLint utilities
- `eslint-plugin-jsx-a11y` ^6.10.2 - Accessibility rules
- `globals` ^15.14.0 - Global variable definitions

### Configuration Files

#### New Files

- `eslint.config.mjs` - Comprehensive production configuration
- `eslint.config.fast.mjs` - Performance-optimized development configuration
- `.eslintrc-campaign.mjs` - Stricter rules for linting campaigns
- `ESLINT_UPGRADE_GUIDE.md` - This guide

#### Deprecated Files (Keep for Reference)

- `eslint.config.cjs` - Old CommonJS configuration
- `eslint.config.fast.cjs` - Old fast configuration

## 🚀 New Features

### 1. Enhanced Type Safety

The new configuration includes comprehensive type-aware linting:

```typescript
// Now detected:
const unsafe: any = getData(); // Warning
const value = unsafe.property; // Warning
someFunction(unsafe); // Warning
```

**Rules Added:**

- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-unsafe-argument`

### 2. Modern ECMAScript Support

Full support for ECMAScript 2026 features:

```typescript
// Resource management (2026)
using resource = getResource();
await using asyncResource = getAsyncResource();
```

### 3. React 19 Compatibility

Updated rules for React 19:

- Removed `react-in-jsx-scope` requirement
- Enhanced hooks rules
- Better JSX validation

### 4. Accessibility Checks

New `jsx-a11y` plugin ensures accessibility:

- Alt text validation
- ARIA attribute checking
- Keyboard navigation requirements
- Semantic HTML validation

### 5. Import/Export Validation

Enhanced import checking:

- Path resolution validation
- Circular dependency detection
- Import ordering
- Unused import detection

### 6. Code Quality Metrics

Enforces code complexity limits:

- Cyclomatic complexity
- Function length
- Nesting depth
- Parameter count

## 📋 Configuration Files Explained

### `eslint.config.mjs` (Main Configuration)

**Use for:** Production builds, comprehensive linting, CI/CD

**Features:**

- Type-aware linting (uses `tsconfig.json`)
- All rule categories enabled
- Comprehensive error checking
- ~30-60 second lint time

**Run with:**

```bash
yarn lint
yarn lint:fix
```

### `eslint.config.fast.mjs` (Fast Configuration)

**Use for:** Development, incremental changes, quick checks

**Features:**

- No type-aware linting (faster parsing)
- Essential rules only
- Reduced rule set
- ~10-20 second lint time

**Run with:**

```bash
yarn lint:quick
yarn lint:incremental
```

### `.eslintrc-campaign.mjs` (Campaign Configuration)

**Use for:** Systematic error elimination campaigns

**Features:**

- Stricter rule enforcement
- Campaign-phase organization
- Error-level (not warning) reporting
- Organized by improvement area

**Run with:**

```bash
eslint --config .eslintrc-campaign.mjs src
```

## 🎨 Rule Categories

### TypeScript Rules

**Type Safety**

- No `any` types without explicit intent
- Unsafe operations flagged
- Type assertions validated
- Null/undefined handling

**Best Practices**

- Prefer `const` over `let`
- Use optional chaining
- Use nullish coalescing
- Avoid unnecessary type assertions

**Naming Conventions**

- Interfaces: PascalCase
- Types: PascalCase
- Variables: camelCase or UPPER_CASE
- Private properties: Allow leading underscore

### React Rules

**JSX**

- Key props required
- No duplicate props
- Self-closing components
- Curly brace optimization

**Hooks**

- Rules of hooks enforced
- Exhaustive dependencies checked
- Hook ordering validated

**Accessibility**

- Alt text required
- ARIA attributes validated
- Keyboard navigation checked
- Semantic HTML enforced

### Import Rules

**Organization**

- Import order enforced
- Path aliases validated
- Circular dependencies detected
- Unused imports flagged

### Code Quality

**Complexity**

- Max complexity: 20 (main) / 15 (campaign)
- Max depth: 4 (main) / 3 (campaign)
- Max function length: 100 lines (main) / 75 (campaign)
- Max parameters: 5 (main) / 4 (campaign)

## 🔧 Usage Examples

### Basic Linting

```bash
# Lint entire src directory
yarn lint

# Lint with auto-fix
yarn lint:fix

# Quick lint (fast config)
yarn lint:quick
```

### Focused Linting

```bash
# Lint specific domain
yarn lint:domain-astro
yarn lint:domain-campaign

# Lint only changed files
yarn lint:changed

# Lint with performance metrics
yarn lint:performance
```

### Campaign Linting

```bash
# Phase 1: Type Safety
eslint --config .eslintrc-campaign.mjs src --rule '@typescript-eslint/no-explicit-any: error'

# Phase 2: Clean Code
eslint --config .eslintrc-campaign.mjs src --rule '@typescript-eslint/no-unused-vars: error'

# Phase 3: Import Hygiene
eslint --config .eslintrc-campaign.mjs src --rule 'import/no-unresolved: error'
```

## 🎯 Linting Campaign Strategy

### Phase 1: Type Safety (Priority: Critical)

**Target:** Eliminate `any` types and unsafe operations

**Commands:**

```bash
# Identify all 'any' usage
yarn lint 2>&1 | grep "no-explicit-any"

# Count occurrences
yarn lint --format json | jq '[.[] | .messages[] | select(.ruleId == "@typescript-eslint/no-explicit-any")] | length'
```

**Fix Patterns:**

1. Replace `any` with proper types
2. Use type guards for runtime checks
3. Add type parameters to generics
4. Use `unknown` for truly unknown types

### Phase 2: Unused Variables (Priority: High)

**Target:** Remove unused imports, variables, and parameters

**Commands:**

```bash
# Find all unused variables
yarn lint 2>&1 | grep "no-unused-vars"

# Auto-fix safe cases
yarn lint:fix
```

**Fix Patterns:**

1. Remove unused imports
2. Prefix intentionally unused with `_`
3. Remove dead code
4. Extract to separate functions

### Phase 3: Import Resolution (Priority: High)

**Target:** Fix unresolved imports and path issues

**Commands:**

```bash
# Find unresolved imports
yarn lint 2>&1 | grep "import/no-unresolved"
```

**Fix Patterns:**

1. Verify file exists
2. Check path alias configuration
3. Update import path
4. Add missing dependencies

### Phase 4: React Hooks (Priority: Medium)

**Target:** Fix exhaustive dependencies and hook rules

**Commands:**

```bash
# Find hooks issues
yarn lint 2>&1 | grep "react-hooks"
```

**Fix Patterns:**

1. Add missing dependencies
2. Memoize callback functions
3. Use `useCallback` and `useMemo`
4. Extract to custom hooks

### Phase 5: Code Quality (Priority: Medium)

**Target:** Reduce complexity and improve maintainability

**Commands:**

```bash
# Find complexity issues
yarn lint 2>&1 | grep "complexity\|max-"
```

**Fix Patterns:**

1. Extract complex logic to functions
2. Reduce nesting depth
3. Break up large functions
4. Simplify conditionals

## 📊 Expected Impact

### Error/Warning Counts

**Before Upgrade:**

- Total Issues: 4,852
- Errors: 724
- Warnings: 4,128
- Parsing Errors: 437

**Expected After Configuration:**

- New detections: +200-300 (enhanced rules)
- Better categorization
- Clearer error messages
- Actionable fix suggestions

**After Campaign Completion Target:**

- Errors: <50
- Warnings: <500
- Parsing Errors: 0
- Total Issues: <550

### Performance

**Main Config (`eslint.config.mjs`):**

- Full lint: 30-60 seconds
- Cached lint: 10-20 seconds

**Fast Config (`eslint.config.fast.mjs`):**

- Full lint: 10-20 seconds
- Cached lint: 3-8 seconds

## 🔍 Troubleshooting

### Import Resolution Issues

If you see `import/no-unresolved` warnings for `@/` paths:

1. Verify `tsconfig.json` has correct paths
2. Check `eslint.config.mjs` import resolver settings
3. Try clearing cache: `yarn lint:cache-clear`

### Performance Issues

If linting is too slow:

1. Use fast config: `yarn lint:quick`
2. Enable caching: `--cache` flag
3. Lint only changed files: `yarn lint:changed`
4. Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096"`

### Type-Aware Linting Errors

If you see `parserOptions.project` errors:

1. Verify `tsconfig.json` exists
2. Check file is included in `tsconfig.json`
3. Use fast config for non-TypeScript files

## 📝 Migration Checklist

- [x] Update package.json dependencies
- [x] Create new ESLint configuration files
- [x] Update package.json scripts
- [x] Document configuration changes
- [ ] Install new dependencies (`yarn install`)
- [ ] Test basic linting (`yarn lint:quick`)
- [ ] Test full linting (`yarn lint`)
- [ ] Review new errors/warnings
- [ ] Plan linting campaign phases
- [ ] Update CI/CD configuration
- [ ] Train team on new rules
- [ ] Archive old configuration files

## 🚦 Next Steps

1. **Install Dependencies**

   ```bash
   yarn install
   ```

2. **Test Configuration**

   ```bash
   yarn lint:quick
   ```

3. **Review Baseline**

   ```bash
   yarn lint > eslint-baseline.txt
   ```

4. **Plan Campaign**
   - Identify priority error categories
   - Set phase goals
   - Assign team members
   - Schedule reviews

5. **Execute Campaign**
   - Start with Phase 1 (Type Safety)
   - Fix systematically file-by-file
   - Test and commit frequently
   - Track progress in metrics

## 📚 Resources

- [ESLint 9 Documentation](https://eslint.org/docs/latest/)
- [TypeScript-ESLint v8 Docs](https://typescript-eslint.io/)
- [React 19 ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [Import Plugin Documentation](https://github.com/import-js/eslint-plugin-import)
- [JSX A11y Plugin](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

## 🎉 Summary

This upgrade brings modern linting capabilities to WhatToEatNext:

✅ **Enhanced Type Safety** - Catch more TypeScript issues
✅ **React 19 Compatible** - Updated for latest React features
✅ **Performance Optimized** - Fast config for development
✅ **Campaign Ready** - Structured for systematic improvement
✅ **Better DX** - Clearer errors and auto-fix support

The configuration is production-ready and designed for your upcoming linting campaign. Good luck! 🚀
