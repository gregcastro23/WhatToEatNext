# WhatToEatNext - Next Session Continuation Prompt

## 🎯 Current State: Phase 13 TypeScript Error Elimination

### Immediate Status
- **Build**: ✅ Passing (Next.js 15.3.4 with TypeScript 5.1.6)
- **Errors Remaining**: 311 TypeScript errors (down from 5,000+ historically)
- **Branch**: `cancer` with Phase 12 completed
- **Working Directory**: `/Users/GregCastro/Desktop/WhatToEatNext`

### Current Error Landscape

#### Priority Targets for Elimination
```
TS2339 Property Access:    ~100 errors (highest priority)
TS2322 Type Assignment:    ~50 errors  
TS2345 Argument Types:     ~45 errors
TS2352 Type Conversion:    ~20 errors
TS2552 Missing Variables:  ~15 errors
TS2740 Promise Types:      ~10 errors
```

#### Files Requiring Attention (Most Errors)
1. `src/data/cooking/methods/index.ts` (6 errors)
2. `src/components/recipes/steps/BasicInfoStep.tsx` (6 errors) 
3. `src/components/IngredientCard.tsx` (6 errors)
4. `src/utils/databaseCleanup.ts` (5 errors)
5. `src/utils/cookingMethodRecommender.ts` (5 errors)

### Proven Strategy & Workflow

#### Phase 12 Success Patterns
- **Manual Precision Fixes**: Most effective approach
- **Structured Type Casting**: `(obj as unknown as { prop?: Type })?.prop` pattern
- **Zero `any` Types**: Maintained throughout all fixes
- **Build Validation**: After every 5-file batch
- **Small Batches**: ≤5 files per commit for safety

#### Essential Commands
```bash
# Start with current error count
make errors

# Get error breakdown by type  
yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | sed 's/.*error TS\([0-9]*\):.*/TS\1/' | sort | uniq -c | sort -nr

# Identify priority files
yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -nr | head -10

# After fixes - validate build
yarn build

# Track progress
make errors
```

### Key Technical Constraints

#### Alchemical System Rules
- **Elements**: Fire, Water, Earth, Air (capitalized, NEVER Metal/Wood/Void)
- **Zodiac**: Lowercase (aries, taurus, etc.)
- **Planets**: Capitalized (Sun, Moon, Mercury, etc.)
- **Package Manager**: Yarn ONLY (never npm)

#### Type Safety Requirements
- **No `any` Types**: Use structured casting instead
- **Build Stability**: Must maintain passing builds
- **Interface Consistency**: Proper ElementalProperties usage
- **Safe Casting Pattern**: `(obj as unknown as { prop?: Type })?.prop`

### Immediate Next Actions

#### Phase 13 Objectives
1. **Target TS2339 Errors** - Property access issues (~100 remaining)
2. **Fix Top Priority Files** - Start with files having 6+ errors
3. **Maintain Type Safety** - Continue zero `any` types policy
4. **Build Validation** - Test after each batch

#### Recommended Approach
```bash
# Start session with baseline
make errors

# Target highest error count files first
# Use Read tool to examine specific files
# Apply structured casting patterns
# Build validation after each batch
# Commit logical chunks

# Focus on elimination, not counting fixes
```

### Session Success Criteria
- **Error Reduction**: Target 311 → <250 errors
- **Build Stability**: 100% maintained 
- **Type Safety**: Zero `any` types introduced
- **File Focus**: Complete cleanup of top priority files

### Emergency Procedures
```bash
# If fixes break build
yarn build  # Check specific error
git restore <problem-file>

# Rollback if needed  
git log --oneline -5
git reset --hard <last-working-commit>
```

## 🚀 Start Phase 13

**Open with**: "Continue TypeScript error elimination. Current count is 311 errors. Let me check the current error breakdown and target the highest priority files."

**Key Focus**: Error elimination through systematic manual fixes, maintaining type safety and build stability.

---
*Ready for Phase 13: TypeScript Error Elimination Campaign*