# Phase 13 Briefing: TypeScript Error Elimination

## 🎯 Mission: Systematic Error Elimination

### Current State
- **TypeScript Errors**: 311 remaining
- **Build Status**: ✅ Passing
- **Branch**: `cancer` (Phase 12 complete)
- **Strategy**: Manual precision fixes

### Target Areas

#### Error Types by Priority
1. **TS2339** (~100) - Property access errors - **HIGHEST PRIORITY**
2. **TS2322** (~50) - Type assignment mismatches
3. **TS2345** (~45) - Argument type errors
4. **TS2352** (~20) - Type conversion issues
5. **TS2552** (~15) - Missing variable names
6. **TS2740** (~10) - Promise type mismatches

#### Files by Error Count
1. `src/data/cooking/methods/index.ts` (6 errors)
2. `src/components/recipes/steps/BasicInfoStep.tsx` (6 errors)
3. `src/components/IngredientCard.tsx` (6 errors)
4. `src/utils/databaseCleanup.ts` (5 errors)
5. `src/utils/cookingMethodRecommender.ts` (5 errors)

### Proven Approach

#### Success Pattern
```typescript
// ❌ Avoid
obj?.prop  // if obj is unknown

// ✅ Use structured casting
(obj as unknown as { prop?: Type })?.prop
```

#### Workflow
1. Start with `make errors`
2. Target highest priority files/types
3. Apply structured casting patterns
4. Build validation after each batch (≤5 files)
5. Commit logical chunks

### Session Goals
- **Primary**: Reduce 311 → <250 errors
- **Method**: Manual precision fixes only
- **Safety**: Maintain build stability, zero `any` types
- **Focus**: Error elimination over counting fixes

### Key Commands
```bash
make errors                    # Current count
yarn build                     # Validate changes
git add . && git commit        # Save progress
```

### Success Metrics
- ✅ Build remains passing
- ✅ No `any` types introduced
- ✅ Error count decreases
- ✅ Type safety maintained

---
*Phase 13 Ready - Target: <250 Errors*