# Comprehensive Fix for Persistent Hydration Errors

## Current Situation (As of 2025-11-19)

**Persistent runtime errors** appearing on production builds affecting multiple pages:

### Error 1: Spirit Property Access
```
page-919fe9b4c23299c8.js:1 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'Spirit')
    at page-919fe9b4c23299c8.js:1:439638
    at page-919fe9b4c23299c8.js:1:440766
    at Array.reduce (<anonymous>)
    at eC (page-919fe9b4c23299c8.js:1:439524)
```

### Error 2: Power Property Access
```
1255-22ddf953e24e8c2d.js:1 TypeError: Cannot read properties of undefined (reading 'power')
    at page-524beb2162f5d31a.js:1:9115
    at Object.aq [as useMemo] (4bd1b696-f785427dddbba9fb.js:1:59702)
    at t.useMemo (1255-22ddf953e24e8c2d.js:1:21173)
    at location.lat (page-524beb2162f5d31a.js:1:9051)
```

### Error 3: React Minified Error
```
1255-22ddf953e24e8c2d.js:1 Error: Minified React error #130
Visit https://react.dev/errors/130?args[]=object&args[]= for full message
```

### Affected Pages
1. **Cuisine Recommender**: `/src/app/cuisines/page.tsx`
2. **Ingredient Recommender**: `/src/app/ingredients/page.tsx`
3. **Planetary Chart Page**: `/src/app/test-planetary/page.tsx`

## Previous Fix Attempts (Unsuccessful)

### Attempt 1: Commit 33246e5 (2025-11-19)
- Added defensive checks to `monicaKalchmCalculations.ts`
- Added defensive checks to `kineticCalculations.ts`
- **Status**: Did not resolve the errors

### Attempt 2: Commit 16487df (2025-11-19)
- Added optional chaining to `useFoodRecommendations.ts` (lines 64-94)
- Changed `state.astrologicalState.property` to `state.astrologicalState?.property`
- **Status**: Did not resolve the errors

## Root Cause Analysis Required

The errors suggest:

1. **Array.reduce operation** accessing `.Spirit` on undefined object (Error 1)
2. **useMemo hook** accessing `.power` on undefined object (Error 2)
3. **React Suspense error** (#130) indicates objects being thrown instead of Promises

### Key Clues

1. **Error 1 mentions `Array.reduce`** - likely in component rendering logic
2. **Error 2 mentions `useMemo`** - likely in `usePlanetaryKinetics.ts` or similar hook
3. **Both involve property access on undefined objects** - missing null checks before property access
4. **AlchemicalProvider logs show state is rendering** - but components may be accessing data before it's ready

## Investigation Strategy

### Phase 1: Identify Exact Source (15-20 mins)

Since errors are in minified bundles, you need to:

1. **Run dev build and reproduce errors**:
   ```bash
   make dev
   # Visit each page and check browser console
   ```

2. **Check each affected page for direct property access**:
   ```bash
   # Find Spirit property access
   grep -rn "\.Spirit\|alchemicalProperties\.Spirit" src/components/cuisines/ src/app/cuisines/

   # Find power property access
   grep -rn "\.power\|kinetic_properties\.power" src/components/ src/app/ src/hooks/

   # Find reduce operations on alchemical data
   grep -rn "\.reduce.*alchemical\|\.reduce.*Spirit" src/components/ src/app/
   ```

3. **Examine the specific components**:

**Priority Files to Check**:
```
src/components/cuisines/CurrentMomentCuisineRecommendations.tsx  (lines 750-760 for .power access)
src/hooks/usePlanetaryKinetics.ts  (useMemo that accesses .power)
src/app/api/cuisines/recommend/route.ts  (ensure all responses include properties)
```

### Phase 2: Find the Exact Lines (10-15 mins)

For each file, look for:

#### Pattern A: Direct Property Access Without Null Check
```typescript
// ❌ BAD - Will fail if cuisine.kinetic_properties is undefined
{cuisine.kinetic_properties.power.toFixed(6)}

// ✅ GOOD - Safe with optional chaining
{cuisine.kinetic_properties?.power?.toFixed(6) ?? 'N/A'}
```

#### Pattern B: Conditional Rendering Missing
```typescript
// ❌ BAD - Will fail if data not loaded
{cuisine.kinetic_properties && (
  <Box>{cuisine.kinetic_properties.power.toFixed(6)}</Box>
)}

// ✅ GOOD - Checks the specific property
{cuisine.kinetic_properties?.power != null && (
  <Box>{cuisine.kinetic_properties.power.toFixed(6)}</Box>
)}
```

#### Pattern C: Array Operations Without Validation
```typescript
// ❌ BAD - reduce will fail if item.alchemicalProperties is undefined
const totalSpirit = items.reduce((sum, item) =>
  sum + item.alchemicalProperties.Spirit, 0
);

// ✅ GOOD - Validates before accessing
const totalSpirit = items.reduce((sum, item) =>
  sum + (item.alchemicalProperties?.Spirit ?? 0), 0
);
```

#### Pattern D: useMemo Without Null Checks
```typescript
// ❌ BAD - Will fail during hydration if kinetics undefined
const currentPowerLevel = useMemo(() => {
  const powerData = kinetics.data.base.power.find(p => p.hour === currentHour);
  return powerData?.power || 0.5;
}, [kinetics]);

// ✅ GOOD - Checks if kinetics exists
const currentPowerLevel = useMemo(() => {
  if (!kinetics?.data?.base?.power) return 0.5;
  const powerData = kinetics.data.base.power.find(p => p.hour === currentHour);
  return powerData?.power ?? 0.5;
}, [kinetics]);
```

### Phase 3: Specific File Checks

#### File 1: `/src/components/cuisines/CurrentMomentCuisineRecommendations.tsx`

**Check lines 720-780** (kinetic properties section):
```bash
cat -n src/components/cuisines/CurrentMomentCuisineRecommendations.tsx | sed -n '720,780p'
```

Look for:
- Line ~756: `{cuisine.kinetic_properties.power.toFixed(6)}`
- Check if there's a parent conditional: `{cuisine.kinetic_properties && (...)}`
- **Issue**: Parent conditional may check `kinetic_properties` exists but not that `power` exists within it

**Fix needed**:
```typescript
// Current (likely):
{cuisine.kinetic_properties && (
  <AccordionItem value="kinetics">
    {/* ... */}
    <Text>{cuisine.kinetic_properties.power.toFixed(6)}</Text>
  </AccordionItem>
)}

// Should be:
{cuisine.kinetic_properties?.power != null && (
  <AccordionItem value="kinetics">
    {/* ... */}
    <Text>{cuisine.kinetic_properties.power.toFixed(6)}</Text>
  </AccordionItem>
)}
```

#### File 2: `/src/hooks/usePlanetaryKinetics.ts`

**Check lines 227-235** (currentPowerLevel useMemo):
```typescript
// Current (lines 227-235):
const currentPowerLevel = useMemo(() => {
  if (!kinetics) return 0.5;
  const currentHour = new Date().getHours();
  const powerData = kinetics.data.base.power.find(
    (p) => p.hour === currentHour,
  );
  return powerData?.power || 0.5;
}, [kinetics]);
```

**Problem**: Checks `if (!kinetics)` but doesn't check `kinetics.data?.base?.power` chain

**Fix needed**:
```typescript
const currentPowerLevel = useMemo(() => {
  if (!kinetics?.data?.base?.power) return 0.5;

  const currentHour = new Date().getHours();
  const powerData = kinetics.data.base.power.find(
    (p) => p.hour === currentHour,
  );
  return powerData?.power ?? 0.5;
}, [kinetics]);
```

#### File 3: `/src/app/api/cuisines/recommend/route.ts`

**Check lines 550-580** (kinetics calculation):
- Verify that the fallback kinetics object includes all required properties
- Current fallback (lines 570-580) should include `power: 0`

**Check lines 620-660** (recommendation mapping):
- Verify `validAlchemical` object is being created with all Spirit/Essence/Matter/Substance
- Lines 620-633 should ensure these properties exist

### Phase 4: Apply Fixes (20-30 mins)

#### Fix Template 1: Component Rendering
```typescript
// For CurrentMomentCuisineRecommendations.tsx

// Thermodynamic section - add deep null checks
{cuisine.thermodynamic_metrics?.heat != null && (
  <Box>{cuisine.thermodynamic_metrics.heat.toFixed(3)}</Box>
)}

// Kinetic properties section - check each property
{cuisine.kinetic_properties?.power != null && (
  <Box>{cuisine.kinetic_properties.power.toFixed(6)}</Box>
)}

// Alchemical properties section - validate before access
{cuisine.alchemical_properties?.Spirit != null && (
  <Box>{cuisine.alchemical_properties.Spirit}</Box>
)}
```

#### Fix Template 2: Hook useMemo
```typescript
// For usePlanetaryKinetics.ts

const currentPowerLevel = useMemo(() => {
  if (!kinetics?.data?.base?.power) return 0.5;

  const currentHour = new Date().getHours();
  const powerData = kinetics.data.base.power.find(
    (p) => p?.hour === currentHour,
  );
  return powerData?.power ?? 0.5;
}, [kinetics]);

const dominantElement = useMemo(() => {
  if (!kinetics?.data?.base?.elemental?.totals) return "Earth";

  const { totals } = kinetics.data.base.elemental;
  const entries = Object.entries(totals);
  if (entries.length === 0) return "Earth";

  return entries.sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Earth";
}, [kinetics]);
```

#### Fix Template 3: API Response Validation
```typescript
// For /src/app/api/cuisines/recommend/route.ts

// Ensure fallback kinetics includes all properties (lines 570-580)
kinetics = {
  velocity: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
  momentum: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
  charge: 0,
  potentialDifference: 0,
  currentFlow: 0,
  power: 0,  // ✅ CRITICAL: Ensure this exists
  inertia: 1,
  forceMagnitude: 0,
  forceClassification: "balanced",
};

// Ensure all cuisine recommendations include these properties
const validKinetics = {
  ...cuisine.kinetics,
  power: cuisine.kinetics?.power ?? 0,
  charge: cuisine.kinetics?.charge ?? 0,
  // ... validate all properties
};
```

### Phase 5: Testing Strategy (10 mins)

1. **Test each page in dev mode**:
   ```bash
   make dev
   # Visit http://localhost:3000/cuisines
   # Visit http://localhost:3000/ingredients
   # Visit http://localhost:3000/test-planetary
   # Check browser console for errors
   ```

2. **Test production build**:
   ```bash
   make build
   make start
   # Visit same pages
   # Verify no errors in console
   ```

3. **Check Network tab**:
   - Verify `/api/cuisines/recommend` returns data with all properties
   - Verify no properties are `null` or `undefined` in response

## Files to Modify (Prioritized)

### High Priority (Fix These First)
1. **`src/components/cuisines/CurrentMomentCuisineRecommendations.tsx`**
   - Lines 756, 738, 744, 750, 762, 768 (kinetic_properties access)
   - Lines 681, 687, 693, 699, 705, 711 (thermodynamic_metrics access)

2. **`src/hooks/usePlanetaryKinetics.ts`**
   - Lines 227-235 (currentPowerLevel useMemo)
   - Lines 237-242 (dominantElement useMemo)
   - Lines 244-260 (aspectPhase useMemo)

3. **`src/app/api/cuisines/recommend/route.ts`**
   - Lines 570-580 (kinetics fallback)
   - Lines 620-660 (validAlchemical and validElementalProps)

### Medium Priority
4. **`src/components/recommendations/EnhancedIngredientRecommender.tsx`**
   - Check for any alchemical property access

5. **`src/hooks/useAlchemicalRecommendations.ts`**
   - Lines 228-232 (alchemicalProperties access in loop)

## Success Criteria

✅ No console errors when visiting `/cuisines`
✅ No console errors when visiting `/ingredients`
✅ No console errors when visiting `/test-planetary`
✅ Production build completes without errors
✅ All kinetic properties display correctly (not "N/A")
✅ All alchemical properties display correctly
✅ No React Suspense errors (#130)

## Quick Start Commands

```bash
# 1. Search for problematic patterns
grep -rn "\.Spirit\|\.power" src/components/cuisines/ src/hooks/usePlanetaryKinetics.ts

# 2. Check specific lines
cat -n src/components/cuisines/CurrentMomentCuisineRecommendations.tsx | sed -n '750,760p'
cat -n src/hooks/usePlanetaryKinetics.ts | sed -n '227,242p'

# 3. Test in dev
make dev

# 4. After fixes, commit and push
git add -A
git commit -m "fix: add comprehensive null checks for hydration errors"
git push -u gitlab claude/fix-provider-hydration-01PPxKgTKAUKxT9S5QkkqRWH
```

## Key Insights from Previous Attempts

1. **Optional chaining on state.astrologicalState was not the issue**
2. **The errors are in component rendering and hooks accessing data properties**
3. **Need to check the entire chain**: `obj?.prop1?.prop2?.prop3` not just `obj?.prop1.prop2.prop3`
4. **Conditional rendering should check the specific property being accessed**, not just the parent object
5. **useMemo hooks need defensive checks at the start**, not just within the logic

## References

- Previous fix commit: `33246e5` (added checks to calculations)
- Previous fix commit: `16487df` (added optional chaining to useFoodRecommendations)
- CLAUDE.md: Project documentation with error patterns
- Error discussion: See conversation history for full error traces
