# Consensus Next Session Prompt — Codebase Health, Website Performance & Platform Roadmap

**Date:** 2026-11-10
**Repository:** `/Users/cookingwithcastro/Desktop/WhatToEatNext-master`
**Runtime Constraint:** 16 GB RAM / Apple Silicon (M5) / Bun-only (`bun run ...`, `bunx ...`, `bun --bun run dev`)

---

## Executive Summary

Following the audit of all handoff prompts (`NEXT_SESSION_PROMPT.md`, `docs/prompts/next_session_prompt.md`, `docs/PHASE_45_CLOSEOUT.md`, `docs/plans/omnibar-search-plan.md`, `docs/mcp-registry-submission.md`, and `docs/SOLANA_MAINNET_SYNC_ROADMAP.md`) alongside live git/PR state, disk utilization, and Next.js client bundle profiles, our work is organized into three sequential tracks:

- **Track 1 — Environment & Codebase Health:** Reclaim ~30.5 GB of stale git worktrees, purge ~90 macOS Finder conflict duplicates and obsolete prompt files, consolidate the open PR queue (`feat/admin-monitoring-rewire-and-ui-polish`, `#974`, `#930`, `#964`), remove 3 dead modules + unmounted `AstrologicalRecommendations.tsx` + `@chakra-ui/react`, and ratchet `.bare-json-casts-baseline.json`.
- **Track 2 — Website Performance & Client Bundle Surgery:** Server-render `/recipes/versions/[versionId]` (`SavedAdaptationView.tsx`, 674 kB -> ~115 kB), lazy-load the 6 hidden tabs in `/kitchen-lab/physics` (574 kB), decouple `TiltSkilletPlanner.tsx` from bundling the 1,002-ingredient catalog (497 kB), add `ssr: false` to `ReactionChamber.tsx`, replace the 3-slice `recharts` donut in `NutritionVisualization.tsx` with pure SVG, lazy-load closed modals in `RecipeClient.tsx`, and lock route budgets into `scripts/check-route-sizes.cjs`.
- **Track 3 — Feature & Platform Development (Next Session Handoff):** Execute Omnibar Phase 7 (`100-search-zero-result-gaps.sql` + zero-result analytics & admin view), synchronize MCP `v1.5.2` documentation and publish to the Official MCP Registry, and implement Phase 45 durable cosmic generation (`101-cosmic-generation-operations.sql`) and multi-persona adapted recipe views.

---

## Track 1: Environment & Codebase Health

1. **Process Hygiene (16 GB RAM Constraint)**
   - Kill any orphaned background listeners (`lsof -ti:5175 | xargs kill -9`, `lsof -ti:3000 | xargs kill -9`).
2. **Purge Stale Prompts, Stray Root Files & Finder Duplicates**
   - Remove obsolete prompt files (`NEXT_SESSION_LAB_STATS_FIX 2.md`, `FOLLOW_UP_ROLE_STREAMLINE_PROMPT.md`, `.claude/handoffs/NEXT_SESSION_PROMPT.md`, `CONTEXT 2.md`).
   - Delete stray root SQL fragment `./||current_status tr, message FROM alert_events WHERE triggered_at > 2026-08-14`.
   - Delete all ~90 macOS Finder conflict copies (`* 2*`, `* 3*`) across `src/`, `docs/`, `scripts/`, and `.claude/`.
3. **Reclaim ~30.5 GB of Worktrees & Harden IDE Exclusions**
   - Prune `.claude/worktrees/` (23 GB), `~/wten-worktrees/` (7.1 GB), and `.worktrees/` (411 MB) via `git worktree prune` and directory removal after verifying all commits are merged or pushed.
   - Update `.vscode/settings.json` `files.watcherExclude` and `search.exclude` to ignore `**/wten-migration-ui-components/**`, `**/archive/**`, `**/target/**`, and `**/.storybook-static/**`.
4. **Dead Code & Dependency Cleanup (`@chakra-ui/react`)**
   - Delete the 3 zero-importer dead modules reported by `bun run audit:dead-modules`:
     - `src/components/ui/alchm/ConsciousnessSigil.tsx`
     - `src/components/ui/textarea.tsx`
     - `src/services/recipeData.ts`
   - Retire unmounted `src/components/astrological/AstrologicalRecommendations.tsx` (the sole consumer of `@chakra-ui/react`), remove its test block from `src/__tests__/phase7BatchEComponents.test.tsx`, and remove `@chakra-ui/react` from `package.json`.
   - Ratchet `.bare-json-casts-baseline.json` (`68 -> 67`) via `bun run check:bare-json:ratchet`.
5. **Git Branch & PR Consolidation**
   - Merge `feat/admin-monitoring-rewire-and-ui-polish` (`84f2cce3`), PR **#974** (Omnibar Phase 6 `/search` destination), and PR **#930** (`sync-credit` Pentacles conversions & refund guard).
   - Close superseded PR **#964** (`feat/profile-culinary-activity`).

---

## Track 2: Website Performance & Client Bundle Surgery

1. **`/recipes/versions/[versionId]` (`674 kB` First Load JS -> `~115 kB`)**
   - Compute `recomputeSavedVersionReadings` on the server in `src/app/recipes/versions/[versionId]/page.tsx` and pass `readings` into `SavedAdaptationView`.
   - Convert `src/components/recipes/SavedAdaptationView.tsx` into a Server Component and extract the interactive cart button into `src/components/recipes/SavedAdaptationCartButton.tsx` (`"use client"`).
2. **`/kitchen-lab/physics` (`574 kB` First Load JS)**
   - In `src/app/(alchm)/kitchen-lab/physics/page.tsx`, dynamically import the 6 non-default tab panels (`ComparisonPanel`, `BoundariesPanel`, `VolumetricsPanel`, `LatentHeatPanel`, `SimmerReductionPanel`, `BoundaryTransferCanvas`) with `next/dynamic(..., { ssr: false })`.
3. **`/cooking-methods/tilt-skillet` (`497 kB`) & `/cooking-methods` (`285 kB`)**
   - Decouple `src/components/cooking-methods/tilt-skillet/TiltSkilletPlanner.tsx` / `src/utils/tiltSkilletCircuit.ts` from pulling the full 1,002-ingredient catalog into the client bundle.
   - Add `ssr: false` to `dynamic(() => import("@/components/recommendations/EnhancedCookingMethodRecommender"), ...)` in `src/components/cooking-methods/hub/ReactionChamber.tsx`.
4. **`/recipes/[recipeId]` (`335 kB` First Load JS)**
   - Replace the `recharts` 3-slice macro `PieChart` in `src/components/recipes/NutritionVisualization.tsx` with a zero-dependency SVG `<circle strokeDasharray>` donut.
   - Lazy-load `OrderIngredientsModal`, `IngredientDrawer`, and `TechniqueModal` in `src/app/recipes/[recipeId]/RecipeClient.tsx` via `next/dynamic(..., { ssr: false })`.
5. **Lock Route Budgets**
   - Update `DEFAULT_THRESHOLDS` in `scripts/check-route-sizes.cjs` to enforce the new First Load JS ceilings on `/recipes/versions/[versionId]`, `/kitchen-lab/physics`, `/cooking-methods/tilt-skillet`, `/cooking-methods`, and `/recipes/[recipeId]`.

---

## Track 3: Feature & Platform Development (Next Session Handoff)

Once Tracks 1 and 2 are merged to `master`, execute the following three workstreams in order:

### 1. Omnibar Phase 7 — Zero-Result Search Gap Capture (`100-search-zero-result-gaps.sql`)
- **Context:** Omnibar Phases 1–6 (including `/search` destination page in PR #974) are complete. Phase 7 closes the loop on unfulfilled user search queries.
- **Tasks:**
  1. Author `src/lib/database/migrations/100-search-zero-result-gaps.sql`:
     - Table `search_zero_result_gaps` (`id`, `normalized_query`, `sample_raw_query`, `hit_count`, `first_seen_at`, `last_seen_at`, `top_filters`, `resolved_at`, `resolved_entity_slug`) with unique index on `normalized_query` (`LOWER(TRIM(query))`).
  2. Wire debounced, non-blocking upsert into `GET /api/search/omnibar` and `/search` when `totalCount === 0` and `query.trim().length >= 3` (strip emails/phones/long numeric tokens for privacy).
  3. Surface Top Unfulfilled Searches in `/admin` (or `GET /api/admin/search-gaps`) so content authors can see what recipes/ingredients/techniques users are searching for that return 0 results.
  4. Add unit tests for query normalization, PII scrubbing, and zero-result upsert behavior.

### 2. `@alchm/kitchen-mcp` v1.5.2 Doc Parity & Official MCP Registry Publish
- **Context:** `packages/alchm-kitchen-mcp` is at `v1.5.2` with 18 tools (`calculate_batch_circuit` and `compile_adaptation` landed alongside Phase 45), `server.json` is validated, and the npm tarball is dry-run verified (`29.2 kB`), but `docs/mcp-registry-submission.md` still references `1.5.1` / 16 tools.
- **Tasks:**
  1. Update `docs/mcp-registry-submission.md` from `1.5.1` (16 tools) to `1.5.2` (18 tools), documenting `calculate_batch_circuit` and `compile_adaptation`.
  2. When ready for public release (with `NPM_TOKEN` and GitHub OIDC configured):
     - `cd packages/alchm-kitchen-mcp && npm publish --access public`
     - `mcp-publisher login github && mcp-publisher publish`
     - Verify live entry at `https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.gregcastro23/alchm-kitchen-mcp`.

### 3. Phase 45 Follow-Through — Durable Cosmic Generation (`101-cosmic-generation-operations.sql`) & Multi-Persona Adapted Views
- **Context:** Per `docs/PHASE_45_CLOSEOUT.md` and `docs/PHASE_45_RECOVERY_DESIGN.md`, `generateCosmicRecipeEntry` currently relies on an in-memory `inflightOperations` Map that resets on cold start, and `recipes/[recipeId]` only auto-loads `vegan-adaptations.json`.
- **Tasks:**
  1. Author `src/lib/database/migrations/101-cosmic-generation-operations.sql`:
     - Table `cosmic_generation_operations` (`operation_key`, `user_id`, `status`, `request_fingerprint`, `recipe_id`, `debit_tx_id`, `refund_tx_id`, `error_message`, `created_at`, `updated_at`, `expires_at`).
  2. Refactor `src/app/actions/generateCosmicRecipe.ts` to claim `(user_id, operation_key)` durability in Postgres with a 90s stale-lock recovery threshold and automatic `refundSpirit` on generation failure.
  3. Expand `src/app/recipes/[recipeId]/page.tsx` and `RecipeClient.tsx` beyond the hardcoded vegan adaptation loader to support a Persona Selector (`vegan`, `gluten-free`, `dairy-free`, `keto`, `low-fodmap`, `pescatarian`, `paleo`) backed by `src/data/adaptations/` and `/api/recipes/[recipeId]/adapt`.

---

## Verification Protocol (Mandatory Before Every Commit/Merge)

```bash
# 1. Process hygiene check
lsof -ti:3000 -ti:5175

# 2. All 13 static gates (typecheck, lint:changed, lint-debt, dead-modules, route-validation, etc.)
bun run verify:static

# 3. Relevant & full test suite
bun run test

# 4. Production build + route bundle size enforcement
bun run build
```
