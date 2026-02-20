# Phase 5.2: Safe Unused Import Removal System - Retry Prompt

## 🎯 **MISSION OBJECTIVE**

Execute Phase 5.2 of the linting error resolution campaign: **Implement safe
unused import removal system** with a conservative, manual approach that
preserves code functionality.

## 📊 **CURRENT STATUS**

- **Total Issues**: 13,132 (1,694 errors + 11,438 warnings)
- **Phase 5.2 Target**: 1,864 unused variable warnings (including imports)
- **Previous Attempt**: Failed due to aggressive auto-fixing that broke imports
- **Success Criteria**: Reduce unused imports by 80%+ while maintaining 100%
  build stability

## 🏗️ **PROJECT CONTEXT**

### **Workspace**: `/Users/GregCastro/Desktop/WhatToEatNext`

- **Framework**: Next.js 15.3.4 with TypeScript 5.1.6
- **Linting**: ESLint 8.57.0 + TypeScript ESLint 5.61.0 + Prettier 2.8.8
- **Build System**: Yarn 4.0.0
- **Current State**: Enhanced linting configuration working, syntax errors
  resolved

### **Previous Phase 5.2 Attempt Results**:

- ❌ **FAILED**: Aggressive auto-fixing broke import statements
- ❌ **FAILED**: Added underscores to imports incorrectly
- ❌ **FAILED**: Created TypeScript compilation errors
- ✅ **LESSONS LEARNED**: Need conservative, manual approach

## 🚨 **CRITICAL CONSTRAINTS**

### **NO LAZY FIXES RULE**:

- ❌ **FORBIDDEN**: Placeholder defaults, static fallbacks, convenience type
  casting
- ✅ **REQUIRED**: Use actual codebase functions, proper imports, real
  calculations
- **Investigation First**: Search codebase for existing functions before
  implementing fixes

### **Import Safety Rules**:

- **NEVER** modify imports that might be used in type annotations
- **NEVER** remove imports that could be used in JSX
- **NEVER** auto-fix imports without manual verification
- **ALWAYS** test build after each file modification
- **ALWAYS** preserve imports in critical calculation files

### **Type Safety Standards**:

- **Elements**: Capitalized (`Fire`, `Water`, `Earth`, `Air`)
- **Planets**: Capitalized (`Sun`, `Moon`, `Mercury`, `Venus`)
- **Zodiac Signs**: Lowercase (`aries`, `taurus`, `gemini`)
- **Alchemical Properties**: Capitalized (`Spirit`, `Essence`, `Matter`,
  `Substance`)

## 🎯 **PHASE 5.2 EXECUTION STRATEGY**

### **CONSERVATIVE APPROACH - Manual File-by-File Processing**

#### **Step 1: Analysis & Categorization**

```bash
# Get current unused variable count
yarn lint --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l

# Identify files with most unused variables
yarn lint --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | cut -d: -f1 | sort | uniq -c | sort -nr | head -20
```

#### **Step 2: Priority File Selection**

**Target Files** (in order of priority):

1. **High-Impact Files** (>50 unused variables):
   - `src/services/AdvancedAnalyticsIntelligenceService.ts` (91 vars)
   - `src/data/unified/recipeBuilding.ts` (67 vars)
   - `src/services/MLIntelligenceService.ts` (63 vars)
   - `src/components/recommendations/CuisineRecommender.tsx` (52 vars)
   - `src/components/CookingMethods.tsx` (50 vars)

2. **Medium-Impact Files** (20-50 unused variables):
   - `src/components/recommendations/IngredientRecommender.migrated.tsx` (41
     vars)
   - `src/services/PredictiveIntelligenceService.ts` (38 vars)
   - `src/components/recommendations/IngredientRecommender.tsx` (27 vars)

3. **Low-Impact Files** (<20 unused variables):
   - Focus on utility files and simple components

#### **Step 3: Manual Processing Methodology**

For each file:

1. **Read the file** and understand its purpose
2. **Identify unused imports** (not variables) specifically
3. **Verify import usage** in type annotations and JSX
4. **Remove only clearly unused imports**
5. **Test build** after each file modification
6. **Document changes** for rollback if needed

## 🛠️ **SAFE IMPORT REMOVAL GUIDELINES**

### **✅ SAFE TO REMOVE**:

- Import statements where the imported item is never referenced
- Duplicate imports from the same module
- Imports from modules that don't exist (broken imports)
- Unused type imports that aren't used in type annotations

### **❌ NEVER REMOVE**:

- Imports used in type annotations (`const data: ImportedType`)
- Imports used in JSX (`<ImportedComponent />`)
- Imports in critical calculation files (`/src/calculations/`)
- Imports that might be used dynamically
- Imports in test files (unless clearly unused)

### **⚠️ REQUIRES MANUAL VERIFICATION**:

- Imports from utility libraries
- Imports in service files
- Imports in component files
- Imports that might be used in error handling

## 📋 **EXECUTION CHECKLIST**

### **Before Starting**:

- [ ] Verify current build works: `yarn build`
- [ ] Verify TypeScript compilation: `yarn tsc --noEmit --skipLibCheck`
- [ ] Get baseline unused variable count
- [ ] Create backup branch: `git checkout -b phase-5-2-import-cleanup`

### **For Each File**:

- [ ] Read and understand the file's purpose
- [ ] Identify unused imports (not variables)
- [ ] Verify imports aren't used in types or JSX
- [ ] Remove only clearly unused imports
- [ ] Test build: `yarn build`
- [ ] Test TypeScript: `yarn tsc --noEmit --skipLibCheck`
- [ ] Document changes made

### **After Each Batch**:

- [ ] Verify build still works
- [ ] Check unused variable count reduction
- [ ] Commit changes if successful
- [ ] Plan next batch

## 🎯 **SUCCESS METRICS**

### **Phase 5.2 Targets**:

- **Import Resolution**: Reduce unused imports by 80%+ (target: <400 remaining)
- **Build Stability**: 100% build success rate maintained
- **Type Safety**: Zero TypeScript compilation errors introduced
- **Code Quality**: Improved import organization and clarity

### **Quality Gates**:

- **Build Success**: `yarn build` must complete successfully
- **Type Check**: `yarn tsc --noEmit` must pass
- **No Regressions**: Existing functionality must remain intact
- **Import Organization**: Imports should follow consistent patterns

## 🚀 **STARTING COMMANDS**

```bash
# 1. Verify current state
yarn build
yarn tsc --noEmit --skipLibCheck

# 2. Get baseline metrics
yarn lint --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l

# 3. Identify priority files
yarn lint --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | cut -d: -f1 | sort | uniq -c | sort -nr | head -10

# 4. Start with highest priority file
# Focus on one file at a time, manual verification only
```

## 📝 **PROCESSING TEMPLATE**

### **For Each File**:

```bash
# 1. Read the file
cat src/services/AdvancedAnalyticsIntelligenceService.ts

# 2. Identify unused imports manually
# Look for import statements where imported items aren't used

# 3. Remove only clearly unused imports
# Edit file manually, remove only import statements

# 4. Test immediately
yarn build
yarn tsc --noEmit --skipLibCheck

# 5. Verify improvement
yarn lint src/services/AdvancedAnalyticsIntelligenceService.ts --max-warnings=10
```

## 🔧 **TROUBLESHOOTING**

### **Common Issues**:

- **Build Fails**: Revert changes immediately, investigate cause
- **TypeScript Errors**: Check if removed import was used in type annotations
- **Import Not Found**: Verify import path and module existence
- **JSX Errors**: Check if removed import was used in JSX components

### **Rollback Strategy**:

```bash
# If issues occur
git checkout -- src/path/to/problematic/file.ts
yarn build
yarn tsc --noEmit --skipLibCheck
```

### **Verification Commands**:

```bash
# After each file modification
yarn build 2>&1 | head -10
yarn tsc --noEmit --skipLibCheck 2>&1 | head -10
yarn lint src/path/to/modified/file.ts --max-warnings=10
```

## 📊 **PROGRESS TRACKING**

### **Metrics to Track**:

- **Total unused variables**: Before vs after each batch
- **Files processed**: Number of files successfully cleaned
- **Build success rate**: Percentage of builds that pass
- **TypeScript errors**: Number of new compilation errors

### **Reporting Format**:

```
Batch X Results:
- Files processed: [number]
- Unused variables removed: [number]
- Build status: ✅/❌
- TypeScript status: ✅/❌
- Next batch: [file list]
```

## 🎯 **COMPLETION CRITERIA**

### **Phase 5.2 Complete When**:

- [ ] 80%+ reduction in unused imports achieved
- [ ] All priority files processed
- [ ] 100% build stability maintained
- [ ] Zero TypeScript errors introduced
- [ ] Import organization improved
- [ ] Documentation updated

---

**Ready to execute Phase 5.2? Begin with conservative manual processing of the
highest priority files, focusing on import removal only, with immediate build
validation after each change.**
