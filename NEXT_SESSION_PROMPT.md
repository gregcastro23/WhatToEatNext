# Next Session: USDA Nutrition Batch Enrichment & Planetary Agent State Sync

**Current Status:** Recipe Ingredient Authenticity & Multimodal Feed Narration 100% Shipped & Merged to `master` (PR #791).  
**Lint Debt:** `20,829` · **Standard Lint / Typecheck:** `0 errors, 0 warnings` · **Test Suites:** `10/10` fast (`408/408` tests) / `277/277` full passed · **Rust Thermo Workspace:** `81/81` passed · **Route Size Gate:** 100% passed (`111/111` routes within threshold) · **Ingredient Quality Audit:** `0 ingredient issues, 0 unmatched recipe ingredients`.

---

## 0. Codebase Health & Warning Audit Report

A full repository audit was conducted across all runtimes, typecheckers, test runners, build bundlers, and domain linters. The current findings:

### A. Clean Passing Gates (0 Errors, 0 Warnings)
- **Ingredient Data Quality Audit (`bun run audit:ingredient-quality`):** Clean exit — **0 ingredient issues, 0 unmatched recipe ingredient names** across 1,092 canonical cards and 9,953 recipe ingredient rows.
- **Ingredient Coverage Index (`bun run build:ingredient-recipe-index`):** Clean exit — **828/1,030 canonical ingredients matched across 1,164 recipes (20,832 references)**.
- **Standard ESLint (`bun run lint`):** Clean exit (`0 errors, 0 warnings`).
- **TypeScript Typecheck (`bun run typecheck`):** Clean exit across Next.js typegen and TypeScript compiler (`0 errors, 0 warnings`).
- **Cargo / Rust Workspace (`cargo test`):** Clean exit across `alchm_culinary` (10/10), `thermo_core` unittests (31/31), `thermo_core` golden parity suite (33/33), and `thermo_wasm` (7/7) — total **81/81 passed**.
- **Route Size Budgets (`bun run build`):** All 111 routes passed strict size thresholds (e.g. `/` at 29.1 kB / 180 kB first-load, `/menu-planner` at 207 kB / 829 kB).

### B. Tracked Lint Debt Breakdown (`20,829` Total Tracked)
The codebase's tracked lint debt under `eslint.config.audit.mjs` remains ratcheted at **20,829**:
- `@typescript-eslint/no-unnecessary-condition`: 4,065
- `@typescript-eslint/no-unsafe-member-access`: 3,460
- `@typescript-eslint/prefer-nullish-coalescing`: 3,302
- `@typescript-eslint/explicit-function-return-type`: 2,632
- `@typescript-eslint/no-unsafe-assignment`: 2,028
- `@typescript-eslint/explicit-module-boundary-types`: 1,138
- `@typescript-eslint/no-explicit-any`: 1,091
- `no-console`: 777
- `no-void`: 767
- `@typescript-eslint/no-unsafe-argument`: 677
- `@typescript-eslint/no-unsafe-call`: 420
- `@typescript-eslint/no-unsafe-return`: 207
- `@typescript-eslint/require-await`: 172
- `no-useless-assignment`: 93

---

## 1. What Shipped in the Preceding Session (Completed & Merged)

| Component | Changes Shipped |
|---|---|
| **100% Ingredient Quality Pass** | Resolved all 154 unmatched recipe ingredient names down to 0 in [`scripts/auditIngredientDataQuality.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/scripts/auditIngredientDataQuality.ts). Added prefix/preparation stripping and synonym normalizations in [`src/utils/ingredientNormalization.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/ingredientNormalization.ts). Added 40+ authentic canonical cooking staples in [`src/data/ingredients/misc/cookingStaples.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/ingredients/misc/cookingStaples.ts) with real USDA nutrition and non-uniform elemental profiles. Added canonical `brussels_sprouts` to [`cruciferous.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/ingredients/vegetables/cruciferous.ts). Updated [`coverageExclusions.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/generated/coverageExclusions.json). |
| **Reverse Recipe Index Rebuild** | Rebuilt reverse index in [`ingredientRecipeIndex.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/generated/ingredientRecipeIndex.json) covering 828 canonical ingredients and 20,832 references across 1,164 recipes. |
| **Multimodal Audio Feed Narration** | Expanded [`src/lib/feed/eventNarration.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/feed/eventNarration.ts) to narrate `agent_audio_narration`, `agent_voice_insight`, `transit_discussion`, and `multimodal_cooking_step` with direct audio URLs and recipe links. |
| **Type Safety & Build Verification** | Ensured strict TypeScript compliance in `cookingStaples.ts` (all seasons, ruling planets, sensory profiles). Passed full `bun run verify` (`typecheck && lint && test:fast`), `cargo test`, and `bun run build`. |

---

## 2. Most Urgent Prioritized Focus Areas for Next Session

### 1. USDA Batch Enrichment on 420 Placeholder Nutrition Cards (Data Authenticity)
- **Problem**: `bun run audit:ingredients` reports 420 of 1,184 ingredient cards carry placeholder/default nutrition markers (specifically in `src/data/ingredients/misc/recipeCoverageIngredients.ts`).
- **Objective**: Backfill real USDA FoodData Central (FDC) macronutrient, micronutrient, and calorie data into these cards using the automated fetcher.
- **Actionable Steps**:
  1. Inspect `scripts/fetch-usda-composition.mjs` and `scripts/batchEnrichIngredients.ts`.
  2. Run `bun run ingredients:batch-enrich` to query USDA FDC API for authentic nutritional composition.
  3. Recompute non-uniform elemental signatures where nutrition markers change.
  4. Run `bun run audit:ingredients` and assert placeholder count drops to 0.

### 2. Planetary Agent Audio Player & Interactive Walkthrough Widget
- **Problem**: We enabled multimodal audio feed narration (`agent_audio_narration`, `agent_voice_insight`), but frontend feed cards and recipe walkthroughs need a lightweight inline audio player.
- **Objective**:
  1. Create an accessible, lightweight audio player component (`src/components/feed/FeedAudioPlayer.tsx`) supporting play/pause, scrub, playback rate, and wave visualizer.
  2. Wire `FeedAudioPlayer` into `FeedCard.tsx` and `InteractiveInstruction.tsx` for spoken recipe instructions.
  3. Verify audio element cleanup on unmount to prevent audio memory leaks.

### 3. Cart Fulfillment & Conversion Funnel Telemetry
- **Problem**: The grocery cart (`/grocery-cart` and `/meal-plan/groceries`) lacks automated affiliate handoff telemetry and token cashback rebate recording.
- **Objective**:
  1. Instrument Instacart / Amazon Fresh cart export handlers in `src/services/grocery/` with referral affiliate tags and token rebate attribution.
  2. Record outbound checkout handoffs in `feed_events` (event_type `"cart_handoff"`) and grant user streak/rebate tokens via `DailyYieldService`.
  3. Add conversion metrics to `/admin/dashboard` and `/admin/settlements`.

### 4. Continuous Lint Debt Ratcheting (Target: < 20,000)
- **Current Baseline**: `20,829` tracked warnings in `.lint-debt-baseline.json`.
- **High-Impact Targets**:
  - `@typescript-eslint/no-unsafe-member-access` (3,460 warnings): Refactor dynamic dictionary accesses in `src/services/` and `src/data/` with typed guards.
  - `@typescript-eslint/prefer-nullish-coalescing` (3,302 warnings): Safely replace `||` with `??` where boolean falsy values (`0`, `""`, `false`) are valid.
  - `@typescript-eslint/no-explicit-any` (1,091 warnings): Replace `any` with `unknown` or narrow domain types in API route handlers (`src/app/api/**`).
- **Verification**: Run `bun run lint:debt` to automatically ratchet down the baseline.
