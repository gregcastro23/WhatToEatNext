# Next Session Prompt: Admin Observability Modernization, Lint Debt Campaign & Site Housekeeping

## 1. Executive Summary & Current System State
- **Branch**: `master` (PR #798 merged as commit `c7dfcbfa`).
- **Phase 3 Shipped & Verified**:
  1. **Culinary Accessibility Pass (Kitchen Lab & Physics)**:
     - Default Fahrenheit (°F) with persistent, instant Celsius (°C) toggle ([temperatureUnits.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/cooking/temperatureUnits.ts)).
     - Banished scientific notation (`K·W⁻¹`, `ΔT K`, raw exponents) in favor of percentage bottleneck shares and practical chef actions.
     - Added resting carryover heat rise ($+5^\circ\text{F}$ to $+10^\circ\text{F}$) and doneness timelines.
     - Simmer reduction liquid formatted in familiar Quarts / Cups and Liters.
  2. **SpacetimeDB Collaborative Live Pot Sync**:
     - Rust module table `live_pot` and reducers with 5 host integration tests ([live_pot_tests.rs](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/spacetime-module/tests/live_pot_tests.rs)).
     - Client hook ([useLivePotSimulation.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/spacetime/hooks/useLivePotSimulation.ts)) with 60 FPS RAF interpolation and offline local fallback.
     - Interactive multi-device control panel ([LivePotSyncPanel.tsx](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/lab/LivePotSyncPanel.tsx)).
  3. **Verification**:
     - 109 Rust tests passing (`cargo test --workspace`).
     - WASM builds and manifests green.
     - Fast tests passing (410 / 410).
     - TypeScript: 0 errors.
     - Lint Debt: exactly **15,367** (0 debt added).

---

## 2. Investigative Housekeeping & Gap Audit

### 🔍 Audit Finding: Do Our Admin Panes Adequately Reflect Site Status?
**Short Answer: Not Yet.** The Admin Dashboard (`src/app/admin/`) is an exceptionally built monitoring surface, but recent major capabilities are not yet wired into it:

1. **SpacetimeDB Live Layer (v4.0 & Live Pot)**:
   - `ServiceMatrix` does not monitor the `wss://maincloud.spacetimedb.com` connection or the `cookingwithcastrollc/alchm-culinary` module.
   - `FeatureFlagsPanel` is missing the `NEXT_PUBLIC_SPACETIME_LIVE_*` feature flags (`LIVE_CULINARY`, `LIVE_PLANNER`, `LIVE_COMMENSAL`, `LIVE_CART`, `LIVE_FEED`, `LIVE_POT`).
   - `DatabaseStorage` and `SubdomainMatrix` do not show live SpacetimeDB table metrics (`live_pot`, `table_session`, `commensal_session`, `grocery_cart_item`, `meal_plan_slot`).
2. **Kitchen Lab Physics & Thermal Engine**:
   - `/kitchen-lab` and `/kitchen-lab/physics` are missing from `SubdomainMatrix`.
   - The Rust/WASM `thermoEngine` and boundary resistance solver have no health probe in `EngineHealth` or `ServiceMatrix`.
3. **Philosopher's Stone Agent Forging**:
   - The dynamic forge route `/philosophers-stone` and ignition API (`/api/agent-forge/ignite`) are absent from `SubdomainMatrix`.
4. **Data Authenticity Campaign**:
   - The recent backfill of real USDA per-serving nutrition (#555), 21 specialty oils (#566), and cooking staples (#563) should be highlighted in `CatalogState` as verified authentic items vs legacy items.

---

### 🧹 Lint Debt Attack Plan: Breaking Below 15,000
Our lint audit shows the 15,367 baseline warnings are concentrated in distinct categories:
- `@typescript-eslint/no-unnecessary-condition`: 3,876
- `@typescript-eslint/explicit-function-return-type`: 2,535
- `@typescript-eslint/no-unsafe-member-access`: 2,149
- `@typescript-eslint/no-unsafe-assignment`: 1,452
- `@typescript-eslint/explicit-module-boundary-types`: 1,127
- `@typescript-eslint/no-explicit-any`: 892
- `no-console`: 744
- `no-void`: 719
- `@typescript-eslint/prefer-nullish-coalescing`: 700
- `@typescript-eslint/no-unsafe-argument`: 482
- `@typescript-eslint/no-unsafe-call`: 265
- `@typescript-eslint/no-unsafe-return`: 175
- `@typescript-eslint/require-await`: 163
- `no-useless-assignment`: 88

**Targeted Strike Waves**:
- **Wave 1 (Low-hanging Fruit / Clean Semantics)**:
  - Eliminate `no-void` (-719) by converting dangling promise statements to `.catch(() => {})` or properly typed async handlers.
  - Eliminate raw `no-console` (-744) by routing logs through our structured `_logger` ([logger.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/logger.ts)).
  - **Yield**: ~1,460 warnings eliminated, bringing baseline down to **~13,900**!
- **Wave 2 (Type Safety & Boundary Contracts)**:
  - Explicit function return types & module boundaries across `src/services/` and `src/lib/`.
  - Elimination of remaining `any` in `src/data/` and API endpoints.

---

## 3. Next Session Priority Roadmaps

### 🎯 Priority 1: Modernize Admin Observability & Operations Control Plane
1. **SpacetimeDB Live Observability**:
   - Add SpacetimeDB health probe to `src/services/systemStatusService.ts` checking module availability and websocket status.
   - Update `getFeatureFlags()` in `src/services/dashboardPanelsService.ts` to surface all 6 SpacetimeDB live flags.
   - Add SpacetimeDB table telemetry cards (Live Pots active, active Commensal lobbies, synced Grocery carts) to `DatabaseStorage` and `CommensalPulse`.
2. **Kitchen Lab & Agent Forging in Subdomain Matrix**:
   - Add `/kitchen-lab/physics` (Thermal boundary solver, WASM thermo engine) and `/philosophers-stone` (Custom agent forge) to `SubdomainMatrix` in `src/app/admin/_dashboard/extras.tsx`.
3. **Data Authenticity Metrics in Catalog Health**:
   - Display USDA-backed nutrition coverage percentage and verified recipe counts in `CatalogState`.

### 🎯 Priority 2: Execute Wave 1 Lint Debt Reduction (Target < 14,000)
1. Run automated search-and-replace / codemod on `no-void` patterns in non-critical components.
2. Replace raw `console.log` / `console.error` calls with structured `_logger` in `src/services/` and `src/lib/`.
3. Auto-ratchet baseline down via `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet`.

### 🎯 Priority 3: Site-Wide Culinary Accessibility Extension
1. Extend `useTemperatureUnit` (°F/°C) and `formatCookingVolume` (Quarts/Cups/Liters) into:
   - `/recipes/[id]` (Dynamic recipe instruction temperatures & volumes).
   - `/recipe-builder` and `/menu-planner` (Pacing & thermal method settings).
   - `/food-tracking` (Serving sizes and macro measurements).

---

## 4. Verification Checklist & Gate Commands

```bash
# 1. Rust workspace tests (thermo-core, thermo-wasm, spacetime-module)
cargo test --workspace

# 2. Build SpacetimeDB WASM module
cargo build --release --target wasm32-unknown-unknown --manifest-path spacetime-module/Cargo.toml

# 3. Parity and manifest checks
./scripts/thermo-wasm-manifest.sh --check
bun scripts/verify-boundary-solver-parity.mjs
bun scripts/verify-thermo-wasm-parity.mjs

# 4. Web application test suite & lint ratchet
bun run test:fast
bun run typecheck
bun run lint
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts
```
