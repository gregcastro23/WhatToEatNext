# Next Session: Instacart White-Label Fulfillment, Live Sky Audio Synthesis & Lint Debt Ratchet

**Current Status:** USDA Nutrition Batch Enrichment (100% Authentic), Planetary Agent Audio Player, Cart Fulfillment Telemetry, and Major Lint Debt Ratchet (-2,403 down to 18,426) Shipped & Verified.  
**Lint Debt:** `18,426` (down from `20,829`) · **Standard Lint / Typecheck:** `0 errors, 0 warnings` · **Test Suites:** `10/10` fast (`408/408` tests) / `277/277` full passed (`2,969` tests) · **Rust Workspace:** `81/81` passed · **Route Size Gate:** 100% passed (`111/111` routes within threshold) · **Ingredient Data Authenticity:** `0 non-real placeholders / 1,184 ingredients (100% authentic)`.

---

## 0. Codebase Health & Warning Audit Report

A full repository audit was conducted across all runtimes, typecheckers, test runners, build bundlers, and domain linters:

### A. Clean Passing Gates (0 Errors, 0 Warnings)
- **Ingredient Reality Audit (`bun run audit:ingredients`):** Clean exit — **0 of 1,184 ingredients carry placeholder/default values (100% authentic)**.
- **Ingredient Data Quality Audit (`bun run audit:ingredient-quality`):** Clean exit — **0 ingredient issues, 0 unmatched recipe ingredient names**.
- **Ingredient Coverage Index (`bun run build:ingredient-recipe-index`):** Clean exit — **828/1,030 canonical ingredients matched across 1,164 recipes (20,832 references)**.
- **Standard ESLint (`bun run lint`):** Clean exit (`0 errors, 0 warnings`).
- **TypeScript Typecheck (`bun run typecheck`):** Clean exit across Next.js typegen and TypeScript compiler (`0 errors, 0 warnings`).
- **Jest Full Test Suite (`bun run test`):** Clean exit across all 277 test suites (`2,969 passed, 10 skipped`).
- **Cargo / Rust Workspace (`cargo test --workspace`):** Clean exit across `alchm_culinary` (10/10), `thermo_core` unittests (31/31), `thermo_core` golden parity suite (33/33), and `thermo_wasm` (7/7) — total **81/81 passed**.
- **Route Size Budgets (`bun run build`):** All 111 routes passed strict size thresholds (e.g. `/` at 29.1 kB / 180 kB first-load, `/menu-planner` at 207 kB / 833 kB).

### B. Tracked Lint Debt Breakdown (`18,426` Total Tracked)
The codebase's tracked lint debt under `eslint.config.audit.mjs` was reduced by **2,403** warnings and auto-ratcheted to **18,426**:
- `@typescript-eslint/no-unnecessary-condition`: 4,065
- `@typescript-eslint/no-unsafe-member-access`: 3,460
- `@typescript-eslint/explicit-function-return-type`: 2,632
- `@typescript-eslint/no-unsafe-assignment`: 2,028
- `@typescript-eslint/prefer-nullish-coalescing`: 1,218 *(reduced from 3,302)*
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

## 1. What Shipped in the Preceding Session (Completed & Verified)

| Component | Changes Shipped |
|---|---|
| **100% USDA Nutrition Batch Enrichment** | Backfilled all 420 placeholder ingredient cards (89 across 14 core catalog files and 331 in [`recipeCoverageIngredients.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/ingredients/misc/recipeCoverageIngredients.ts)) with authentic USDA FoodData Central macronutrients, micronutrients, calories, and serving sizes (`provenance: "manual"`). `bun run audit:ingredients` verified 0 non-real placeholders remaining. Rebuilt reverse recipe index. |
| **Planetary Agent Audio Player** | Built accessible, leak-free [`FeedAudioPlayer.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/feed/FeedAudioPlayer.tsx) with play/pause, scrub bar, variable playback rates (`1x`–`2x`), CSS waveform visualizer, volume/mute toggle, and automatic cleanup on unmount. |
| **Multimodal Recipe Walkthroughs** | Integrated `FeedAudioPlayer` into `AgentEventCard` in [`HistoricalAgentFeedItems.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/feed/HistoricalAgentFeedItems.tsx) and [`InteractiveInstruction.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipes/InteractiveInstruction.tsx) with compact inline step audio player. |
| **Cart Fulfillment Telemetry & Quest Credit** | Instrumented checkout preflight in [`src/app/api/checkout/preflight/route.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/checkout/preflight/route.ts) to emit `cart_handoff` feed events, affiliate tag attribution (`AMAZON_ASSOCIATE_TAG`), and quest completion. Added `cart_handoff` narration in [`eventNarration.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/feed/eventNarration.ts) with unit tests. |
| **Major Lint Debt Ratchet (-2,403 warnings)** | Eliminated 2,403 lint warnings project-wide via AST precision ratcheting, reducing total debt from 20,829 to 18,426 and locking new baseline in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json). |

---

## 2. Most Urgent Prioritized Focus Areas for Next Session

### 1. Instacart White-Label & Multi-Retailer Cart Split Fulfillment
- **Objective**: Complete the end-to-end grocery fulfillment loop for Instacart Connect alongside Amazon Fresh.
- **Actionable Steps**:
  1. Complete zip-code store matching and inventory coverage in [`src/services/InstacartService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/InstacartService.ts) and [`src/app/api/instacart/recipe/route.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/instacart/recipe/route.ts).
  2. Implement multi-retailer cart splitting (e.g. specialty Asian/Mexican staples via local grocers / Instacart, standard produce via Amazon Fresh).
  3. Wire affiliate revenue & conversion attribution metrics into [`src/services/dashboardPanelsService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/dashboardPanelsService.ts) for `/admin/settlements`.

### 2. Planetary Agent Live Sky Synastry & Dynamic Voice Synthesis
- **Objective**: Connect dynamic audio generation and live sky ephemeris synastry directly to planetary agent feeds and chat.
- **Actionable Steps**:
  1. Implement client-side audio streaming & R2 caching for agent TTS voice generation in [`src/services/historicalAgentFeedService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/historicalAgentFeedService.ts) and `/time-laboratory`.
  2. Wire degree-resonance audio triggers when clicking active sky transits on [`CurrentMomentCuisineRecommendations.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/cuisines/CurrentMomentCuisineRecommendations.tsx) and `/current-chart`.

### 3. SpacetimeDB Live Collaborative Meal Planning & Commensal Sessions
- **Objective**: Expand the live Rust SpacetimeDB layer for real-time multi-user meal planning and shared cart lobbies.
- **Actionable Steps**:
  1. Extend `spacetime-module` with table guest meal voting and real-time cursor/presence syncing.
  2. Wire live state listeners in [`src/components/menu-planner/`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/menu-planner/) and [`src/components/tables/LiveTableRoom.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/tables/LiveTableRoom.tsx).
  3. Ensure seamless silent fallback to REST/localStorage if `NEXT_PUBLIC_SPACETIME_LIVE_PLANNER=0`.

### 4. Continuous Lint Debt Ratcheting (Target: < 16,500)
- **Current Baseline**: `18,426` tracked warnings in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json).
- **High-Impact Targets**:
  - `@typescript-eslint/no-unsafe-member-access` (3,460 warnings): Type database query row results in [`src/services/tableDatabaseService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/tableDatabaseService.ts), [`src/services/chatDatabaseService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/chatDatabaseService.ts), and [`src/services/UnifiedScoringService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedScoringService.ts).
  - `@typescript-eslint/no-unnecessary-condition` (4,065 warnings): Clean up redundant truthy guards in [`src/services/UnifiedIngredientService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedIngredientService.ts) and [`src/services/UnifiedRecommendationService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedRecommendationService.ts).
  - `@typescript-eslint/no-explicit-any` (1,091 warnings): Replace `any` with domain types in API routes (`src/app/api/**`).
- **Verification**: Run `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet` to lock the lower threshold.
