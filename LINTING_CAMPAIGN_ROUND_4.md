# Linting Campaign - Round 4 (The Final Phase) 🏆

## 🎯 Mission
Complete the final push to eliminate ALL remaining `@typescript-eslint/no-misused-promises` warnings in the WhatToEatNext codebase!

## 📊 Current Status
- **Starting Point (Round 1)**: ~300 warnings
- **Current Total (`no-misused-promises`)**: **Exactly 26 warnings remaining!**
- **Files to Clean**: 16 files left!
- **Void Wrappers Applied So Far**: 69

## 🎯 Round 4 Target Files (16 Files, 26 Warnings)

### Tier 1: Menu & Dashboard (6 files, 11 warnings)
1. **src/components/menu-planner/WeeklyCalendar.tsx** (5 warnings)
2. **src/components/dashboard/CommensalManager.tsx** (2 warnings)
3. **src/components/menu-planner/FocusedDayView.tsx** (1 warning)
4. **src/components/dashboard/FoodLabBook.tsx** (1 warning)
5. **src/components/dashboard/NotificationPanel.tsx** (1 warning)
6. **src/components/dashboard/UserDashboard.tsx** (1 warning)

### Tier 2: Celestial & Charts (4 files, 5 warnings)
7. **src/components/MoonDisplay.tsx** (2 warnings)
8. **src/components/SunDisplay.tsx** (1 warning)
9. **src/components/ElementalEnergyDisplay.tsx** (1 warning)
10. **src/hooks/useChartData.ts** (1 warning)

### Tier 3: Core App Components (6 files, 10 warnings)
11. **src/app/admin/users/page.tsx** (3 warnings)
12. **src/components/NutritionalDataFetcher.tsx** (2 warnings)
13. **src/components/nav/NotificationBell.tsx** (2 warnings)
14. **src/app/recipes/[recipeId]/page.tsx** (1 warning)
15. **src/components/PlanetaryPositionInitializer.tsx** (1 warning)
16. **src/contexts/MenuPlannerContext.tsx** (1 warning)

---

## 🔧 The Fix Pattern

### Standard Void Wrapper
```typescript
// ❌ BEFORE
<button onClick={asyncFunction}>Click</button>

// ✅ AFTER
<button onClick={() => { void asyncFunction(); }}>Click</button>
```

### SetInterval/SetTimeout / Effects
```typescript
// ❌ BEFORE
setInterval(asyncFunction, 1000)

// ✅ AFTER
setInterval(() => { void asyncFunction(); }, 1000)
```

---

## 📋 Workflow for Round 4

### Step 1: Start with Tier 1
```bash
npx eslint src/components/menu-planner/WeeklyCalendar.tsx src/components/dashboard/CommensalManager.tsx src/components/menu-planner/FocusedDayView.tsx src/components/dashboard/FoodLabBook.tsx src/components/dashboard/NotificationPanel.tsx src/components/dashboard/UserDashboard.tsx --format stylish
```
1. Read the file
2. Find `onClick`, `onSubmit`, `setInterval`, etc., that take a promise-returning function.
3. Wrap with `void`.
4. Verify using `npx eslint <file-path>`
5. Commit after Tier 1.

### Step 2: Proceed through Tiers
Complete Tier 2 and Tier 3 with the same methodology. Track progress in TodoWrite or your agent memory.

### Step 3: The Final Verification
```bash
# This command should return 0 output once all files are fixed!
npx eslint "src/**/*.{ts,tsx}" --rule "@typescript-eslint/no-misused-promises: error" 2>&1 | grep "no-misused-promises"
```

---

## 🚀 Quick Start Commands

```bash
# Verify starting point (should show 26)
npx eslint "src/**/*.{ts,tsx}" --format json > eslint-output-new.json && node -e "const fs=require('fs');const results=JSON.parse(fs.readFileSync('eslint-output-new.json'));let count=0;results.forEach(r=>{count+=r.messages.filter(m=>m.ruleId==='@typescript-eslint/no-misused-promises').length;});console.log(count);"

# Start on the file with the most warnings!
npx eslint src/components/menu-planner/WeeklyCalendar.tsx 2>&1 | grep "no-misused-promises"

# After completing a tier, commit!
git add <files>
git commit -m "fix(lint): resolve remaining promise warnings in Tier N files (Round 4)"
```

Let's finish this campaign! 🚀