# Lint Configuration Quick Reference

**WhatToEatNext - ESLint System**  
**Status:** ✅ Production Ready | **Issues:** 5,257 (66% reduction from 15,713)

## 🚀 Essential Commands

```bash
# Daily Development
yarn lint              # Check with warnings allowed
yarn lint:fix          # Auto-fix issues
yarn lint:check        # Zero warnings mode

# Advanced Usage
yarn lint:strict       # Strict configuration
yarn lint:report       # Generate detailed report
yarn lint:demo         # Run system demo
```

## 📁 Configuration Files

- **`eslint.config.cjs`** - Main configuration (current state)
- **`eslint.config.strict.cjs`** - Strict configuration (future state)
- **`tsconfig.json`** - Enhanced TypeScript configuration

## 🎯 Key Features

### ✅ Resolved Issues
- **Import Resolution**: 4,039 → 0 (100% fixed)
- **Auto-Fixable Issues**: 2,136 → 0 (100% resolved)
- **Import Ordering**: 2,100+ → ~500 (76% reduction)

### 🔄 Remaining Issues
- **Explicit `any` Types**: ~1,500 errors
- **Console Statements**: ~800 errors
- **Unused Variables**: ~1,200 warnings

## 📋 Targeted Linting

```bash
# Specific files
yarn lint src/utils/ingredientRecommender.ts --max-warnings=0

# Specific directories
yarn lint src/components/ --max-warnings=10
yarn lint src/services/ --max-warnings=5

# High-error files
yarn lint src/utils/ --max-warnings=0
yarn lint src/utils/mcpServerIntegration.ts --max-warnings=0
```

## 🎨 Best Practices

### Type Safety
```typescript
// ❌ Avoid
function processData(data: any) { return data.property; }

// ✅ Prefer
interface Data { property: string; }
function processData(data: Data): string { return data.property; }
```

### Import Organization
```typescript
// ✅ Proper order
import React from 'react';                    // Built-in
import axios from 'axios';                    // External
import { Component } from '@/components/';    // Internal
import { utils } from './utils';              // Relative
```

### Error Handling
```typescript
// ❌ Avoid
console.log('Error:', error);

// ✅ Prefer
import { logger } from '@/utils/logger';
logger.error('Error:', error);
```

## 🔄 Migration Strategy

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1** | Week 1-2 | Current state, high-error files |
| **Phase 2** | Week 3-4 | Type safety, console cleanup |
| **Phase 3** | Month 2-3 | Strict standards, pre-commit hooks |
| **Phase 4** | Month 3-6 | Zero tolerance, CI/CD gates |

## 🛠️ Troubleshooting

```bash
# TypeScript issues
yarn tsc --noEmit

# Configuration validation
yarn lint --print-config src/components/Component.tsx

# Debug specific files
yarn lint --debug src/utils/problematicFile.ts
```

## 📊 Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Total Issues** | 15,713 | 5,257 | **66%** |
| **Import Resolution** | 4,039 | 0 | **100%** |
| **Auto-Fixable** | 2,136 | 0 | **100%** |
| **Import Ordering** | 2,100+ | ~500 | **76%** |

## 🎯 Quality Standards

### Current (eslint.config.cjs)
- `@typescript-eslint/no-explicit-any`: error
- `no-console`: error
- `import/order`: warn
- `@typescript-eslint/no-unused-vars`: warn

### Future (eslint.config.strict.cjs)
- All rules set to error level
- Zero tolerance for type issues
- Perfect import organization
- Enterprise-grade standards

## 🏆 System Benefits

1. **Progressive Enhancement** - Gradual improvement path
2. **Type Safety** - Comprehensive TypeScript integration
3. **Import Resolution** - Perfect module resolution
4. **Code Quality** - Automated best practices
5. **Developer Experience** - Clear errors and auto-fix
6. **Future-Ready** - Strict configuration ready

---

**For detailed information, see:** `LINT_CONFIGURATION_SUMMARY.md`  
**For system demo, run:** `yarn lint:demo` 