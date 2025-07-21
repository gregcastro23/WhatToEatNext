# TypeScript Error Reduction Campaign - Quick Reference Guide
**For Immediate Use** | **Version 1.0** | **January 2, 2025**

## 🚀 Quick Start Commands

### Pre-Session Setup
```bash
# 1. Stash current changes
git stash push -m "Pre-fix session $(date)"

# 2. Check current error count
npx tsc --noEmit 2>&1 | grep -c "error TS"

# 3. View top error files
make errors-by-file | head -10

# 4. View error types
make errors-by-type | head -5
```

### Post-Session Validation
```bash
# 1. Check TypeScript compilation
yarn tsc --noEmit --skipLibCheck

# 2. Validate build
yarn build

# 3. Check error count reduction
npx tsc --noEmit 2>&1 | grep -c "error TS"

# 4. View updated error files
make errors-by-file | head -10
```

### Emergency Rollback
```bash
# Quick rollback
git stash pop

# Full reset if needed
git reset --hard HEAD
git clean -fd
```

## 🛠️ Pattern Quick Reference

### Pattern 1: TS2339 Property Access (215 errors)
```typescript
// ❌ UNSAFE
const value = obj.property;

// ✅ SAFE
const value = (obj as unknown as Record<string, unknown>)?.property;
```

### Pattern 2: TS2352 Type Conversion (92 errors)
```typescript
// ❌ UNSAFE
const converted = data as TargetType;

// ✅ SAFE
const converted = (data as unknown) as TargetType;
```

### Pattern 3: TS2322 Type Assignment (92 errors)
```typescript
// ❌ UNSAFE
const state: TargetType = data;

// ✅ SAFE
const state: TargetType = (data as unknown) as TargetType;
```

### Pattern 4: TS2345 Argument Type (88 errors)
```typescript
// ❌ UNSAFE
function process(data: unknown) {
  return processData(data);
}

// ✅ SAFE
function process(data: unknown) {
  const typed = (data as unknown) as Record<string, unknown>;
  return processData(typed);
}
```

### Pattern 5: TS2554 Function Call (16 errors)
```typescript
// ❌ UNSAFE
const result = obj.method(params);

// ✅ SAFE
if (typeof obj.method === 'function') {
  const result = obj.method(params);
}
```

## 📋 Phase 1A Target Files (Week 1)

### Day 1: UnifiedScoringAdapter.ts (10 errors)
**Focus:** Service response type safety
**Patterns:** 1, 3

### Day 2: UnifiedRecommendationService.ts (10 errors)
**Focus:** Recommendation data type safety
**Patterns:** 1, 4

### Day 3: UnifiedIngredientService.ts (10 errors)
**Focus:** Ingredient data type safety
**Patterns:** 1, 2

### Day 4: EnhancedAstrologyService.ts (10 errors)
**Focus:** Astrological data type safety
**Patterns:** 1, 3

### Day 5: AlchemicalService.ts (10 errors)
**Focus:** Alchemical data type safety
**Patterns:** 1, 4

## 🎯 Success Metrics

### Daily Targets
- **Error Reduction:** 10 errors per day
- **Build Stability:** 100% success rate
- **Pattern Success:** >90% for established patterns

### Phase 1A Targets
- **Week 1:** 610 → 560 errors (50 eliminated)
- **Week 2:** 560 → 541 errors (19 eliminated)
- **Total Phase 1:** 610 → 541 errors (69 eliminated)

## 🚨 Safety Checklist

### Before Each Fix
- [ ] Git stash created
- [ ] Current error count documented
- [ ] Target file identified
- [ ] Pattern strategy planned

### After Each Fix
- [ ] TypeScript compilation passes
- [ ] Build process completes
- [ ] Error count reduced
- [ ] No new error types

### Rollback Triggers
- Build failure
- Error count increase >2
- New error types
- Build time increase >10%

## 🔍 Error Search Commands

### Find Specific Error Types
```bash
# TS2339 errors
grep -r "TS2339" src/ | head -10

# TS2352 errors
grep -r "TS2352" src/ | head -10

# TS2322 errors
grep -r "TS2322" src/ | head -10

# TS2345 errors
grep -r "TS2345" src/ | head -10

# TS2554 errors
grep -r "TS2554" src/ | head -10
```

### Find Property Access Issues
```bash
# Find unsafe property access
grep -n "\.\w\+" src/services/UnifiedScoringAdapter.ts

# Find type assertions
grep -n "as " src/services/UnifiedRecommendationService.ts
```

## 📊 Progress Tracking

### Daily Progress Template
```bash
#!/bin/bash
echo "=== Day $DAY Progress ==="
echo "Target File: $TARGET_FILE"
echo "Expected Errors: $EXPECTED_ERRORS"

echo "Pre-fix error count:"
npx tsc --noEmit 2>&1 | grep -c "error TS"

echo "Target file errors:"
make errors-by-file | grep "$TARGET_FILE"

# Apply fixes here...

echo "Post-fix error count:"
npx tsc --noEmit 2>&1 | grep -c "error TS"

echo "Target file errors after fix:"
make errors-by-file | grep "$TARGET_FILE"

echo "=== Day $DAY Complete ==="
```

### Weekly Summary Template
```bash
#!/bin/bash
echo "=== Week $WEEK Summary ==="
echo "Starting error count: $START_COUNT"
echo "Ending error count: $END_COUNT"
echo "Errors eliminated: $((START_COUNT - END_COUNT))"
echo "Reduction percentage: $(( (START_COUNT - END_COUNT) * 100 / START_COUNT ))%"
echo "Build status: $BUILD_STATUS"
echo "=== Week $WEEK Complete ==="
```

## 🎯 Key Principles

### Do's
- ✅ Use `as unknown as SpecificType` instead of `as any`
- ✅ Test patterns on single lines first
- ✅ Validate after each file
- ✅ Document learnings and new patterns
- ✅ Maintain git history with descriptive commits

### Don'ts
- ❌ Never use `as any`
- ❌ Don't modify interfaces without careful consideration
- ❌ Don't skip validation steps
- ❌ Don't apply patterns without understanding
- ❌ Don't proceed if build fails

## 📞 Emergency Contacts

### Quick Rollback
```bash
git stash pop
```

### Full Reset
```bash
git reset --hard HEAD
git clean -fd
```

### Error Count Verification
```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"
```

### Build Validation
```bash
yarn build
```

---

**Status:** Ready for execution  
**Success Probability:** 95%  
**Risk Level:** Low  

*This quick reference guide provides immediate access to essential commands, patterns, and procedures for the TypeScript error reduction campaign.* 