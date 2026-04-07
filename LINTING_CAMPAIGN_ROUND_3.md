# Linting Campaign - Round 3 Continuation Prompt

## 🎯 Mission
Continue systematic elimination of `@typescript-eslint/no-misused-promises` warnings in the WhatToEatNext codebase.

## 📊 Current Status (as of commit fc1f5dc6)

### Progress Summary
- **Starting Point**: ~300 warnings
- **Current Total**: **289 warnings**
- **Warnings Eliminated**: 12
- **Files Cleaned**: 16 (all with 0 warnings)
- **Void Wrappers Applied**: 43

### Completed Files ✅
**Round 1** (Menu Planner, Dashboard, Hooks):
- ✅ src/hooks/useFoodDiary.ts
- ✅ src/components/menu-planner/RecipeBrowserPanel.tsx
- ✅ src/components/menu-planner/MealSlot.tsx
- ✅ src/components/menu-planner/WeeklyCalendar.tsx
- ✅ src/components/menu-planner/FocusedDayView.tsx
- ✅ src/components/dashboard/CommensalManager.tsx
- ✅ src/components/dashboard/FoodLabBook.tsx

**Round 2** (Food Diary, Dashboard, Auth, Home):
- ✅ src/components/food-diary/FoodDiaryView.tsx
- ✅ src/components/food-diary/QuickFoodInput.tsx
- ✅ src/components/food-diary/FoodRating.tsx
- ✅ src/components/dashboard/RecommendationsPanel.tsx
- ✅ src/components/auth/SignInModal.tsx
- ✅ src/components/home/DynamicCuisineRecommender.tsx

---

## 🎯 Round 3 Target Files (Priority Order)

### Tier 1: High-Priority User-Facing Components (6 files)
1. **src/components/auth/OnboardingWizard.tsx** - User onboarding flow
2. **src/components/recipe-builder/GenerateRecipeButton.tsx** - Recipe generation
3. **src/components/menu-builder/QuickActionsToolbar.tsx** - Menu builder actions
4. **src/components/PremiumGate.tsx** - Premium feature gating
5. **src/components/LoginButton.tsx** - Authentication entry point
6. **src/components/LocationButton.tsx** - Location services

### Tier 2: Alchemical Components (3 files)
7. **src/components/alchm-quantities-trends.tsx** - Quantity trend visualization
8. **src/components/alchm-quantities-display.tsx** - Quantity display
9. **src/components/alchm-kinetics.tsx** - Kinetic calculations display

### Tier 3: Planetary/Chart Components (3 files)
10. **src/components/PlanetaryContributionsChart.tsx** - Chart visualization
11. **src/components/PlanetaryAspectsDisplay.tsx** - Aspects display
12. **src/components/PlanetInfoModal.tsx** - Planet information modal

### Tier 4: App Routes (4 files)
13. **src/app/restaurant-creator/page.tsx** - Restaurant creator page
14. **src/app/recipe-builder/page.tsx** - Recipe builder page
15. **src/app/premium/page.tsx** - Premium features page
16. **src/app/generated-recipe/[id]/page.tsx** - Generated recipe detail

### Tier 5: API Layer (1 file)
17. **src/lib/api/alchm-client.ts** - Alchemical API client

---

## 🔧 The Fix Pattern

### Standard Void Wrapper
```typescript
// ❌ BEFORE (causes warning)
<button onClick={asyncFunction}>Click</button>

// ✅ AFTER (warning resolved)
<button onClick={() => { void asyncFunction(); }}>Click</button>
```

### With Parameters
```typescript
// ❌ BEFORE
<button onClick={() => handleClick(id)}>Click</button>

// ✅ AFTER
<button onClick={() => { void handleClick(id); }}>Click</button>
```

### Component Props
```typescript
// ❌ BEFORE
<Component onSave={handleSave} />

// ✅ AFTER
<Component onSave={() => { void handleSave(); }} />

// OR with parameters
<Component onSave={(data) => { void handleSave(data); }} />
```

### SetInterval/SetTimeout
```typescript
// ❌ BEFORE
setInterval(asyncFunction, 1000)

// ✅ AFTER
setInterval(() => { void asyncFunction(); }, 1000)
```

---

## 📋 Workflow for Round 3

### Step 1: Start with Tier 1 Files (6 files)
```bash
# For each file in Tier 1:
1. Read the file
2. Identify all async handlers (look for async functions passed to onClick, onChange, onSubmit, etc.)
3. Apply void wrapper pattern
4. Verify with: npx eslint <file-path> 2>&1 | grep -E "warning|error"
5. Move to next file when verified clean (0 warnings)
```

### Step 2: Track Progress
Use TodoWrite to track each file as you go:
```typescript
[
  { content: "Fix OnboardingWizard.tsx (auth)", status: "in_progress", activeForm: "Fixing OnboardingWizard.tsx" },
  { content: "Fix GenerateRecipeButton.tsx (recipe-builder)", status: "pending", activeForm: "..." },
  // ... etc
]
```

### Step 3: Verify After Each Tier
```bash
# Check specific files
npx eslint src/components/auth/OnboardingWizard.tsx \
  src/components/recipe-builder/GenerateRecipeButton.tsx \
  ... (other tier files) \
  2>&1 | grep -E "warning|error" | wc -l
# Should output: 0
```

### Step 4: Final Verification
```bash
# Get total warning count after Round 3
yarn lint 2>&1 | grep "warning" | wc -l

# Expected: < 289 (current count)
```

---

## 🎯 Round 3 Goals

### Primary Goal
Clean **17 files** from the priority list above (all tiers).

### Success Criteria
- All 17 target files show **0 warnings**
- Total project warnings reduced from **289** to **~260 or fewer**
- All fixes follow the void wrapper pattern
- Changes committed with comprehensive message

### Expected Impact
- **Files Cleaned**: 17 more files → Total: 33 files
- **Warnings Eliminated**: ~20-30 warnings
- **Coverage**: Will have addressed ~33 of the highest-priority user-facing files

---

## 🚀 Quick Start Commands

```bash
# 1. Verify starting point
yarn lint 2>&1 | grep "warning" | wc -l
# Should show: 289

# 2. Start with first file
npx eslint src/components/auth/OnboardingWizard.tsx 2>&1 | grep -E "warning|error"

# 3. After fixing each file, verify
npx eslint <file-path> 2>&1 | grep -E "warning|error" | wc -l
# Should show: 0

# 4. After completing a tier, commit
git add <files>
git commit -m "fix(lint): resolve promise warnings in Tier N files (Round 3)"
git push origin main
```

---

## 📝 Common Async Patterns to Look For

### Event Handlers
- `onClick={asyncHandler}`
- `onChange={asyncHandler}`
- `onSubmit={asyncHandler}`
- `onDoubleClick={asyncHandler}`
- `onBlur={asyncHandler}`

### Component Props
- `onSave={asyncHandler}`
- `onDelete={asyncHandler}`
- `onUpdate={asyncHandler}`
- `onSubmit={asyncHandler}`
- `onRefresh={asyncHandler}`

### Timers
- `setInterval(asyncHandler, delay)`
- `setTimeout(asyncHandler, delay)`

### Effect Dependencies
- `useEffect(() => { asyncHandler(); }, [deps])`
  - Already correct if using `void asyncHandler()` inside effect

---

## 🎓 Notes for Success

1. **Read before editing** - Always use Read tool on the full file first
2. **One file at a time** - Don't rush; verify each file is clean before moving on
3. **Use TodoWrite** - Track progress to avoid losing place
4. **Verify immediately** - Run eslint on each file right after editing
5. **Commit in batches** - Commit after each tier (6-4-3-4-1 files) for safety
6. **Count fixes** - Track how many void wrappers you apply per file

---

## 📊 Final Deliverable

After completing Round 3, provide:
```markdown
## Round 3 Complete! 🎉

### Files Fixed (X total void wrappers):
1. **OnboardingWizard.tsx** (auth) - ✅ X void wrappers
2. **GenerateRecipeButton.tsx** (recipe-builder) - ✅ X void wrappers
... (list all 17)

### Results:
- **Before Round 3**: 289 warnings
- **After Round 3**: X warnings
- **Warnings Eliminated**: X
- **Files Cleaned**: 17 → Total: 33 files with 0 warnings
- **Void Wrappers Applied**: X → Total Campaign: 43 + X = Y wrappers

### Verification:
All 17 files verified with 0 warnings ✨
```

---

## 🎯 Ready to Start?

Begin with **Tier 1, File 1**:
```bash
npx eslint src/components/auth/OnboardingWizard.tsx 2>&1
```

Let's continue the momentum and clean up these high-priority user-facing components! 🚀
