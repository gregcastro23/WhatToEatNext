# Next Session Prompt: Fix CI on PR #945 & Harden Recipe Builder Upgrade

## 1. Executive Summary & Objective

In PR [#945](https://github.com/gregcastro23/WhatToEatNext/pull/945) (branch: `feat/recipe-builder-ui-upgrade` -> `master`), the Recipe Builder (`/recipe-builder`) was upgraded from stale legacy light-mode styling to the **Modern Alchemist** dark obsidian aesthetic (`.alchm-root .lab`). It also integrated WTEN's current capabilities: real-time celestial telemetry, pantry item quick-sync, an alchemical crucible with a live elemental quad-spectrum meter, and 1-click grocery cart dispatch.

While build (`next build`), unit tests (`bun run test`), and Vercel preview deployments passed, the static verification gate (`bun run verify:static`) failed in CI due to a **declined rules pool regression (+2)**.

The objective of this session is to:
1. **Fix the CI failure** on branch `feat/recipe-builder-ui-upgrade` by eliminating the 2 declined rule violations.
2. **Address weak points & harden the implementation** with component test coverage, subcomponent modularization, accessibility (a11y), and edge-case resilience.

---

## 2. Current State & What Was Implemented

### Branch & PR Reference
- **Branch:** `feat/recipe-builder-ui-upgrade`
- **Target:** `master`
- **Pull Request:** [PR #945](https://github.com/gregcastro23/WhatToEatNext/pull/945)
- **Commit:** `8b0aea1` (*feat(recipe-builder): modernize UI with Alchemist dark obsidian aesthetic, pantry integration, and grocery cart dispatch*)

### Modified Files (10 files)
1. `src/app/recipe-builder/layout.tsx`: Wrapped in `<AlchmRouteFrame>` to activate dark obsidian styling, ambient starry backdrop, and elemental glow tokens.
2. `src/app/recipe-builder/page.tsx`: Single Cormorant Garamond hero (`t-display`), removed duplicate header, upgraded `QuickGenerateBar` to celestial telemetry bar with live planetary day & hour (`astroState.currentPlanetaryHour`), lunar phase, and elemental badges. Preserved dynamic code-splitting imports.
3. `src/components/recipe-builder/RecipeBuilderPanel.tsx`: Integrated `<PantryQuickSync />` via `usePantry()`, converted collapsible sections to dark glass cards with active counters, sensory emojis, and statistical z-scores ($\Delta\sigma$) for cuisines.
4. `src/components/recipe-builder/IngredientSearchBar.tsx`: Dark glass search bar with glowing focus ring, Lucide icons, and `📦 Pantry` badges for owned items.
5. `src/components/recipe-builder/IngredientSuggestions.tsx`: Alchemical Synergy Engine card with harmonic pairing pills.
6. `src/components/recipe-builder/RecipeBuilderQueue.tsx`: Alchemical Crucible with a real-time **Elemental Quad-Spectrum Meter** (calculating live Fire, Water, Earth, and Air percentage distribution across queued ingredients).
7. `src/components/recipe-builder/CosmicAlignmentPreview.tsx`: Themed to dominant element's aura, live planetary hour telemetry, and 1-click `+ Add to Crucible` buttons on top harmonic ingredients.
8. `src/components/recipe-builder/GenerateRecipeButton.tsx`: Shimmer gradient CTA, cyclic alchemical synthesis phrases (*"Consulting celestial transits..."*, *"Balancing elemental crucibles..."*), and transparent token cost indicators (`5 Spirit · 5 Essence`).
9. `src/components/recipe-builder/RecipeSuggestionCarousel.tsx`: Obsidian alchemical dossier cards, match score rings, pantry match badges (`✓ In Pantry`), and 1-click `Add to Cart` grocery cart dispatch via `useOptionalGroceryCart()`.
10. `src/contexts/GroceryCartContext.tsx`: Added `useOptionalGroceryCart()` for safe non-throwing context consumption.

---

## 3. CI Failure Diagnostics (Root Cause)

### CI Log Output
```text
checks (Verify, bun run verify:static)
[1/6] Generating Next.js route types...
[2/6] Linting src/ against 28 audited rules (ESLint)...
[3/6] Scanning codebase for type casts (as any, as unknown as)...
[4/6] Scanning AST assertion sites...
[5/6] Scanning AST loose optionality (?: T | undefined)...
[6/6] Scanning file-level disables...
❌ Declined rules pool increased by 2: 4742 exceeds baseline of 4740.
error: script "lint:debt" exited with code 1
error: script "verify:static" exited with code 1
```

### Explanation
- The static verification gate runs `scripts/checkLintDebt.ts` against `.lint-debt-baseline.json`.
- The `declined.rules` pool in `.lint-debt-baseline.json` has a baseline limit of `4740`. The audit scanned `4742` (+2).
- The rules in the declined pool are:
  - `@typescript-eslint/explicit-function-return-type`
  - `@typescript-eslint/explicit-module-boundary-types`
  - `complexity`
  - `max-depth`
  - `max-lines`
  - `max-lines-per-function`
  - `no-void`
- **Immediate Task:** Run `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts` locally or query specific rules (e.g. `bun scripts/checkLintDebt.ts --rule @typescript-eslint/explicit-function-return-type`) across the modified files to identify and fix the 2 offending sites.

---

## 4. Weak Points & Areas for Hardening

### A. Subcomponent Modularization & File Length Limits
- `RecipeBuilderPanel.tsx` has grown to ~720 lines. Under repo hygiene rules, large components risk hitting `max-lines` (500-line ceiling) and `max-lines-per-function`.
- Extract inline helper components out of `RecipeBuilderPanel.tsx` into modular subcomponents:
  - `src/components/recipe-builder/PantryQuickSync.tsx`
  - `src/components/recipe-builder/selectors/MealTypeSelector.tsx`
  - `src/components/recipe-builder/selectors/CuisineSelector.tsx`
  - `src/components/recipe-builder/selectors/FlavorSelector.tsx`

### B. Missing Unit & Integration Test Coverage
Currently, only `useIngredientPrefill.test.tsx` exists in `src/components/recipe-builder/__tests__/`. Add tests for the new UI surfaces:
1. `RecipeBuilderQueue.test.tsx`:
   - Test that queued ingredients properly calculate elemental quad-spectrum percentages (Fire, Water, Earth, Air).
   - Test item deletion and empty state illustration.
2. `CosmicAlignmentPreview.test.tsx`:
   - Test that dominant element is displayed with current planetary day and hour.
   - Test that clicking `+ Add` invokes `addIngredient()` and marks the item as queued.
3. `GenerateRecipeButton.test.tsx`:
   - Test disabled state when no selection is made.
   - Test enabled state when preferences exist.
   - Test token economy display (`5 Spirit · 5 Essence`).
   - Test cyclic synthesis progress text when `isGenerating` is true.
4. `RecipeSuggestionCarousel.test.tsx`:
   - Test pantry match badge (`✓ In Pantry`) when ingredient exists in `usePantry()`.
   - Test `Add to Cart` button triggers `groceryCart.addRecipe()` and opens the cart drawer.

### C. Accessibility (a11y) & Keyboard Polish
- The cycling synthesis text in `GenerateRecipeButton` should use `aria-live="polite"` so screen readers are informed without interruption.
- Add keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-purple-400`) on interactive elemental chips, pantry items, and collapsible chevrons.
- Ensure the elemental spectrum bar in `RecipeBuilderQueue` has meaningful `aria-label` or `aria-valuenow` / descriptive text for non-visual users.

### D. Cold Start & Edge Case Resilience
- In `page.tsx`, ensure `QuickGenerateBar` and `CosmicAlignmentPreview` handle `null` or uninitialized astrological states gracefully on first render without flash of unstyled content.
- In `PantryQuickSync`, test behavior when pantry is empty (`0 items in pantry`) to ensure clean empty-state copy.

### E. Route Size Budget Compliance
- Run `node scripts/check-route-sizes.cjs` to confirm that all modularized subcomponents maintain `/recipe-builder` under the route size thresholds:
  - `maxRouteKb: 50`
  - `maxFirstLoadKb: 200`
  - `maxTotalFirstLoadKb: 710`

---

## 5. Verification Checklist for the Next Session

Before pushing to `feat/recipe-builder-ui-upgrade`:
- [ ] `bun run typecheck` (0 errors)
- [ ] `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts` (Declined rules pool <= 4740, tracked debt clean)
- [ ] `bun run verify:static` (All static gates pass)
- [ ] `bun run test` (All existing and new test suites pass)
- [ ] `git push origin feat/recipe-builder-ui-upgrade`
- [ ] Verify GitHub Actions CI passes on [PR #945](https://github.com/gregcastro23/WhatToEatNext/pull/945).
