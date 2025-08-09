# Phase 1: Critical Import Resolution - Linting Error Resolution Prompt

## 🎯 **MISSION OBJECTIVE**

Execute Phase 1 of systematic linting error resolution focusing on **CRITICAL
import resolution errors** that are blocking the build process.

## 📊 **CURRENT STATUS**

- **Total Issues**: 13,132 (1,694 errors + 11,438 warnings)
- **Phase 1 Target**: 3,997 import resolution errors + 1,858 import
  namespace/duplicate errors
- **Success Criteria**: Reduce critical import errors by 90%+ while maintaining
  code functionality

## 🏗️ **PROJECT CONTEXT**

### **Workspace**: `/Users/GregCastro/Desktop/WhatToEatNext`

- **Framework**: Next.js with TypeScript
- **Linting**: ESLint + Prettier + TypeScript ESLint
- **Build System**: Yarn 4.0.0
- **Current State**: Enhanced linting configuration recently implemented, syntax
  errors resolved

### **Key Architecture Components**:

- **Alchemical Engine**: Core calculation system with planetary positions
- **Astrological Integration**: Swiss Ephemeris integration for celestial
  calculations
- **Culinary Recommendation System**: Recipe and ingredient recommendation
  engine
- **Type Safety**: Strict TypeScript configuration with custom type definitions

## 🚨 **CRITICAL CONSTRAINTS**

### **NO LAZY FIXES RULE**:

- ❌ **FORBIDDEN**: Placeholder defaults, static fallbacks, convenience type
  casting
- ✅ **REQUIRED**: Use actual codebase functions, proper imports, real
  calculations
- **Investigation First**: Search codebase for existing functions before
  implementing fixes

### **Type Safety Standards**:

- **Elements**: Capitalized (`Fire`, `Water`, `Earth`, `Air`)
- **Planets**: Capitalized (`Sun`, `Moon`, `Mercury`, `Venus`)
- **Zodiac Signs**: Lowercase (`aries`, `taurus`, `gemini`)
- **Alchemical Properties**: Capitalized (`Spirit`, `Essence`, `Matter`,
  `Substance`)
- **Cuisine Types**: Capitalized (`Italian`, `Mexican`, `Middle-Eastern`)
- **Dietary Restrictions**: Capitalized (`Vegetarian`, `Vegan`, `Gluten-Free`)

### **Elemental Logic Principles**:

- Elements are individually valuable (no opposing elements)
- Elements reinforce themselves (like reinforces like)
- All element combinations can work together
- No elemental "balancing" logic

## 🎯 **PHASE 1 EXECUTION STRATEGY**

### **BATCH 1A: Import Resolution Errors (3,997 errors)**

**Target Files**: Core application files with missing module imports
**Strategy**: Enterprise Intelligence + Syntax Correction

**Processing Order**:

1. **Priority 1**: `src/services/` - Core service layer
2. **Priority 2**: `src/components/` - React components
3. **Priority 3**: `src/utils/` - Utility functions
4. **Priority 4**: `src/types/` - Type definitions
5. **Priority 5**: `src/data/` - Data layer

**Error Types to Fix**:

- `import/no-unresolved` - Missing module imports
- `import/no-extraneous-dependencies` - Incorrect dependency imports
- `import/no-relative-parent-imports` - Relative import issues

### **BATCH 1B: Import Namespace/Duplicates (1,858 errors)**

**Target Files**: Files with duplicate imports and namespace issues
**Strategy**: Syntax Correction + Import Optimization

**Processing Order**:

1. **Priority 1**: Files with 10+ duplicate imports
2. **Priority 2**: Files with namespace conflicts
3. **Priority 3**: Files with mixed import styles

**Error Types to Fix**:

- `import/namespace` - Namespace import issues
- `import/no-duplicates` - Duplicate import statements
- `import/order` - Import ordering issues

## 🛠️ **EXECUTION METHODOLOGY**

### **Step 1: Analysis & Prioritization**

```bash
# Run targeted linting to identify specific error patterns
yarn lint --max-warnings=100 2>&1 | grep -E "import/no-unresolved" | head -50
yarn lint --max-warnings=100 2>&1 | grep -E "import/namespace|import/no-duplicates" | head -50
```

### **Step 2: File-by-File Resolution**

For each file:

1. **Investigate**: Search codebase for existing functions/imports
2. **Analyze**: Determine if error needs enterprise intelligence or syntax
   correction
3. **Fix**: Implement proper solution using real codebase functionality
4. **Verify**: Run linting on specific file to confirm resolution

### **Step 3: Batch Processing**

```bash
# Process files in batches of 10-20
yarn lint src/services/ --max-warnings=10
yarn lint src/components/ --max-warnings=10
```

### **Step 4: Validation**

```bash
# Verify progress after each batch
yarn lint --max-warnings=100 2>&1 | grep -E "import/" | wc -l
```

## 📋 **SPECIFIC INSTRUCTIONS**

### **For Import Resolution Errors**:

1. **Search First**: Use `grep -r "functionName" src/` to find existing
   implementations
2. **Check Imports**: Verify import paths and module names
3. **Use Real Functions**: Import actual codebase functions, not placeholders
4. **Maintain Type Safety**: Ensure all imports have proper TypeScript types

### **For Import Namespace/Duplicate Errors**:

1. **Consolidate Imports**: Combine duplicate imports from same module
2. **Fix Namespace Issues**: Use proper import syntax for namespaces
3. **Order Imports**: Follow consistent import ordering (external → internal →
   relative)
4. **Remove Unused**: Eliminate unused imports

### **Quality Assurance**:

- **No Breaking Changes**: Ensure fixes don't break existing functionality
- **Type Safety**: Maintain strict TypeScript compliance
- **Performance**: Don't introduce performance regressions
- **Readability**: Keep code clean and maintainable

## 🎯 **SUCCESS METRICS**

### **Phase 1 Targets**:

- **Import Resolution Errors**: Reduce from 3,997 to <400 (90%+ reduction)
- **Import Namespace/Duplicates**: Reduce from 1,858 to <200 (90%+ reduction)
- **Total Critical Errors**: Reduce from 5,855 to <600 (90%+ reduction)

### **Quality Gates**:

- **Build Success**: `yarn build` must complete successfully
- **Type Check**: `yarn tsc --noEmit` must pass
- **Lint Progress**: Overall error count should decrease significantly
- **No Regressions**: Existing functionality must remain intact

## 🚀 **STARTING COMMANDS**

```bash
# 1. Verify current state
yarn lint --max-warnings=100 2>&1 | grep -E "import/" | wc -l

# 2. Start with highest priority files
yarn lint src/services/ --max-warnings=10

# 3. Begin systematic resolution
# Focus on one file at a time, using enterprise intelligence for complex fixes
```

## 📝 **REPORTING REQUIREMENTS**

After each batch:

1. **Progress Report**: Number of errors resolved vs. remaining
2. **File Summary**: List of files processed and key fixes applied
3. **Issues Encountered**: Any challenges or decisions made
4. **Next Steps**: Plan for subsequent batches

## 🔧 **TROUBLESHOOTING**

### **Common Issues**:

- **Module Not Found**: Search codebase for actual module location
- **Type Conflicts**: Check TypeScript configuration and type definitions
- **Circular Dependencies**: Restructure imports to avoid circular references
- **Version Conflicts**: Ensure consistent dependency versions

### **Fallback Strategy**:

If enterprise intelligence is insufficient:

1. Document the specific issue
2. Create a minimal reproduction
3. Request additional context or guidance
4. Continue with next file to maintain momentum

---

**Ready to execute Phase 1? Begin with analyzing the current import error
distribution and then systematically resolve them file by file, maintaining the
highest code quality standards.**
