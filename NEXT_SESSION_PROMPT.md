<session_handoff version="5.2" date="2026-11-11">

  <metadata>
    <repository>/Users/cookingwithcastro/Desktop/WhatToEatNext-master</repository>
    <base_branch commit="PR-1004">master</base_branch>
    <hardware_profile>Apple Silicon M5 / 16 GB Unified Memory</hardware_profile>
    <runtime_policy>Bun-strict (`bun run ...`, `bunx ...`, `bun --bun run dev`). Never invoke npm or npx for project scripts.</runtime_policy>
  </metadata>

  <boot_sequence mandatory="true">
    <step order="1" name="process_hygiene">
      Run `lsof -ti:3000 -ti:5175` to confirm 0 lingering development processes are listening.
    </step>
    <step order="2" name="git_sync">
      Run `git checkout master &amp;&amp; git pull origin master` and `git status -sb` to confirm a clean working tree on master.
    </step>
    <step order="3" name="branch_first_rule">
      NEVER commit directly to `master` or run `git push origin master`. GitHub ruleset `GH013` requires 4 status checks via PR. Always branch first (`git checkout -b ...`).
    </step>
    <step order="4" name="no_reaudit_rule">
      Do NOT re-audit, re-seed, or re-test any items listed inside `&lt;completed_state&gt;`. Treat them as validated production truth.
    </step>
  </boot_sequence>

  <hard_invariants>
    <invariant id="database_migrations">
      Dual-home all new migrations in BOTH `database/init/` and `src/lib/database/migrations/`. Migrations 100 (`search_zero_result_gaps`) and 101 (`cosmic_generation_operations`) are live on production Railway Postgres. The next migration MUST be numbered `102-*.sql`. All runners sort numerically by integer prefix; verify new migrations with `python3 -m pytest backend/tests/test_migration_names.py`.
    </invariant>
    <invariant id="client_bundle_isolation">
      Never import full static ingredient catalogs (1,002 items), USDA portion tables, or server database modules into `"use client"` components. Enforce all 12 route bundle ceilings in `scripts/check-route-sizes.cjs`.
    </invariant>
    <invariant id="static_ratchets">
      New and modified files must remain under the 300-line ceiling, introduce zero `Record&lt;string, any&gt;` casts or redundant conditions, and uphold static baselines: `.bare-json-casts-baseline.json` &lt;= 55 (production), `.lint-debt-baseline.json` &lt;= 1276 (assertion sites &lt;= 2744), `testOnly` &lt;= 39, and `UNREACHABLE (dead): 0`.
    </invariant>
    <invariant id="circuit_breaker_and_reconciler">
      All live SpacetimeDB reads must route through `spacetimeCircuitBreaker.ts` with half-open recovery support. All cosmic generation reconcilers must use `FOR UPDATE SKIP LOCKED` and verify matching `token_transactions` debit legs before refunding.
    </invariant>
  </hard_invariants>

  <completed_state do_not_reaudit="true">
    <track id="1" name="Environment, Hygiene &amp; Bundle Ceilings (PR #996, #997)">
      <item>Reclaimed ~30.5 GB of worktree disk space; purged Finder duplicates and dead modules (`UNREACHABLE: 0`); removed `@chakra-ui/react` and `recharts` from recipe detail routes.</item>
      <item>Slashed First Load JS across `/recipes/versions/[versionId]` (154 kB, -77%), `/kitchen-lab/physics` (113 kB, -80%), `/cooking-methods/tilt-skillet` (126 kB, -75%), and `/recipes/[recipeId]` (222 kB, -34%).</item>
    </track>
    <track id="2" name="Omnibar Phase 7, MCP Registry &amp; Phase 45 Durability (PR #998)">
      <item>Shipped `100-search-zero-result-gaps.sql`, `SearchGapsPanel.tsx`, and `101-cosmic-generation-operations.sql`; applied and smoke-tested both on production Railway Postgres.</item>
      <item>Published `@alchm/mcp-server@1.5.2` live to npm and Official MCP Registry (`io.github.gregcastro23/alchm-kitchen`, `status: active`).</item>
    </track>
    <track id="3" name="12-Agent Adaptations, Spacetime Resilience &amp; Cron Reconciler (PR #1000, #1001, #1002)">
      <item>Expanded `POST /api/recipes/[recipeId]/adapt` across all 12 canonical vegetarian historical personas and verified 12x10 catalog adaptation matrix (`historicalPersonaCatalogValidation.test.ts`) with `PLANT_PROTEIN_ALIASES`.</item>
      <item>Shipped `agentRatingProbe.ts`, `spacetimeCircuitBreaker.ts` (PostgreSQL fallback + shift alerts), `cosmicOperationReconciler.ts`, `CosmicOperationsPanel.tsx`, and scheduled cron `/api/cron/reconcile-cosmic-operations` (`35 * * * *` in `vercel.json` and `cronRegistry.ts`).</item>
    </track>
    <track id="4" name="Search Gap Resolution Loop, Bare-JSON Ratchet &amp; Circuit Recovery (PR #1004)">
      <item>Built in-memory resolver (`gapResolutionMap.ts`) and wired automatic Omnibar zero-result query expansion into search routes and `SearchGapsPanel.tsx`.</item>
      <item>Converted 11 production bare JSON casts to `readJson` + Zod, ratcheting `.bare-json-casts-baseline.json` down to 55 production casts (64 total) and `.lint-debt-baseline.json` to 1276.</item>
      <item>Added SpacetimeDB half-open probe recovery (`transitionSpacetimeCircuitToHalfOpen`, `POST /api/admin/diagnostics/spacetime`) and interactive reset UI in `SpacetimeDiagnosticsPanel.tsx`.</item>
      <item>Pruned legacy test-only modules (`src/data/foodTypes.ts`, `src/services/ElementalRecommendationService.ts`), bringing `testOnly` down to 39 (`dead: 0`).</item>
    </track>
  </completed_state>

  <next_horizon_backlog priority_ordered="true">
    <objective priority="P1" id="sub_50_bare_json_ratchet">
      <title>Push Production Bare JSON Casts Below 50</title>
      <context>
        55 production bare JSON casts remain in `.bare-json-casts-baseline.json` (mostly in remaining administrative probes and external partner endpoints).
      </context>
      <deliverables>
        <item>Convert at least 6 additional production bare JSON casts to `readJson` + Zod schemas, ratcheting `.bare-json-casts-baseline.json` to &lt;= 49.</item>
      </deliverables>
    </objective>

    <objective priority="P2" id="search_gap_trend_analytics">
      <title>Search Gap Velocity &amp; Repeat Trend Alerting</title>
      <context>
        `search_zero_result_gaps` records `hit_count`, `first_seen_at`, and `last_seen_at`. High-velocity search misses indicate emerging menu or ingredient trends.
      </context>
      <deliverables>
        <item>Surface high-velocity gap alerts (&gt;= 5 hits in 24h) in `SearchGapsPanel.tsx`.</item>
        <item>Add a quick action to draft a cosmic recipe directly from the gap row into the recipe pipeline.</item>
      </deliverables>
    </objective>

    <objective priority="P3" id="remaining_39_test_only_audit">
      <title>Prune or Consolidate Remaining 39 `testOnly` Modules</title>
      <context>
        `audit:dead-modules` reports 39 testOnly files, primarily legacy client mock factories.
      </context>
      <deliverables>
        <item>Audit remaining testOnly modules and consolidate mock factories into dedicated test suites, targeting `testOnly &lt;= 32` without dropping test coverage.</item>
      </deliverables>
    </objective>
  </next_horizon_backlog>

  <verification_gates mandatory_before_commit="true">
    <gate order="1" command="lsof -ti:3000 -ti:5175">Verify 0 background processes listening.</gate>
    <gate order="2" command="bun run verify:static">All 13 static gates must pass (0 TS errors, 0 ESLint errors, lint-debt &lt;= 1276, bare-json &lt;= 55, dead-modules = 0).</gate>
    <gate order="3" command="bun run test &amp;&amp; python3 -m pytest backend/tests/test_migration_names.py">All 645 Jest suites (7,038+ tests) and 16 Python migration assertions must pass.</gate>
    <gate order="4" command="bun run build">Production build and all 12 route bundle ceilings in `scripts/check-route-sizes.cjs` must pass.</gate>
  </verification_gates>

</session_handoff>
