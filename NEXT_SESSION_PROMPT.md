<session_handoff version="5.1" date="2026-11-11">

  <metadata>
    <repository>/Users/cookingwithcastro/Desktop/WhatToEatNext-master</repository>
    <base_branch commit="4a8d3d4f" open_prs="0">master</base_branch>
    <hardware_profile>Apple Silicon M5 / 16 GB Unified Memory</hardware_profile>
    <runtime_policy>Bun-strict (`bun run ...`, `bunx ...`, `bun --bun run dev`). Never invoke npm or npx for project scripts.</runtime_policy>
  </metadata>

  <boot_sequence mandatory="true">
    <step order="1" name="process_hygiene">
      Run `lsof -ti:3000 -ti:5175` to confirm 0 lingering background listeners.
    </step>
    <step order="2" name="git_sync">
      Run `git checkout master &amp;&amp; git pull origin master` and `git status -sb` to confirm a clean working tree at or ahead of `4a8d3d4f`.
    </step>
    <step order="3" name="branch_first_rule">
      NEVER commit directly to `master` or run `git push origin master`. GitHub ruleset `GH013` requires 4 status checks (`Monica Integrity` + `CI`) via Pull Request. Always create a feature branch (`git checkout -b ...`) before committing.
    </step>
    <step order="4" name="no_reaudit_rule">
      Do NOT re-audit, re-seed, or re-test any items listed inside `&lt;completed_state&gt;`. Treat them as validated production truth.
    </step>
  </boot_sequence>

  <hard_invariants>
    <invariant id="database_migrations">
      Dual-home all new migrations in BOTH `database/init/` and `src/lib/database/migrations/`. Migrations 100 (`search_zero_result_gaps`) and 101 (`cosmic_generation_operations`) are live on production Railway Postgres. The next migration MUST be numbered `102-*.sql`. All migration runners (`backend/scripts/run_init_migrations.py`, `scripts/migrate.ts`, `src/services/migrationStatusService.ts`) sort numerically by integer prefix—verify any new migration with `pytest backend/tests/test_migration_names.py`.
    </invariant>
    <invariant id="client_bundle_isolation">
      Never import full static ingredient catalogs (1,002 items), USDA portion tables, or server database modules into `"use client"` components. Enforce all 12 route bundle ceilings in `scripts/check-route-sizes.cjs`.
    </invariant>
    <invariant id="static_ratchets">
      New and modified files must remain under the 300-line ceiling, introduce zero `Record&lt;string, any&gt;` casts or redundant conditions, and uphold static baselines: `.bare-json-casts-baseline.json` &lt;= 66, `.lint-debt-baseline.json` &lt;= 1279 (assertion sites &lt;= 2760, casts &lt;= 153), `testOnly` &lt;= 41, and `UNREACHABLE (dead): 0`.
    </invariant>
    <invariant id="circuit_breaker_and_reconciler">
      All live SpacetimeDB reads must route through `spacetimeCircuitBreaker.ts` (falling back to PostgreSQL when paused/unavailable). All cosmic generation reconcilers must use `FOR UPDATE SKIP LOCKED` and verify matching `token_transactions` debit legs before refunding.
    </invariant>
  </hard_invariants>

  <completed_state do_not_reaudit="true">
    <track id="1" name="Environment, Hygiene &amp; Bundle Ceilings (PR #996, #997)">
      <item>Reclaimed ~30.5 GB of worktree disk space; purged Finder duplicates and dead modules (`UNREACHABLE: 0`); removed `@chakra-ui/react` and `recharts` from recipe detail routes.</item>
      <item>Slashed First Load JS across `/recipes/versions/[versionId]` (154 kB, -77%), `/kitchen-lab/physics` (113 kB, -80%), `/cooking-methods/tilt-skillet` (126 kB, -75%), and `/recipes/[recipeId]` (222 kB, -34%).</item>
    </track>
    <track id="2" name="Omnibar Phase 7, MCP v1.5.2 &amp; Phase 45 Durability (PR #998)">
      <item>Shipped `100-search-zero-result-gaps.sql`, `SearchGapsPanel.tsx`, and `101-cosmic-generation-operations.sql`; applied and smoke-tested both on production Railway Postgres.</item>
      <item>Published `@alchm/mcp-server@1.5.2` live to npm and Official MCP Registry (`io.github.gregcastro23/alchm-kitchen`, `status: active`).</item>
    </track>
    <track id="3" name="12-Agent Adaptations, Spacetime Resilience &amp; Cron Reconciler (PR #1000, #1001, #1002)">
      <item>Expanded `POST /api/recipes/[recipeId]/adapt` across all 12 canonical vegetarian historical personas and verified 12x10 catalog adaptation matrix (`historicalPersonaCatalogValidation.test.ts`) with `PLANT_PROTEIN_ALIASES`.</item>
      <item>Shipped `agentRatingProbe.ts`, `spacetimeCircuitBreaker.ts` (PostgreSQL fallback + shift alerts), `cosmicOperationReconciler.ts`, `CosmicOperationsPanel.tsx`, and scheduled cron `/api/cron/reconcile-cosmic-operations` (`35 * * * *` in `vercel.json` and `cronRegistry.ts`).</item>
      <item>Relocated shared test helpers to `src/__tests__/helpers/`, pruned orphaned `testOnly` modules down to 41, and ratcheted `.lint-debt-baseline.json` to 1279 across 645 passing test suites (7,036 tests).</item>
    </track>
    <track id="4" name="1,000-PR Clean Sweep &amp; 3-Digit Migration Numeric Sort (PR #999, #952, #845, #1003)">
      <item>Merged PR #999 (sunrise-anchored weekday rule for planetary hours), PR #952 (GitHub Actions bump), and PR #845 (npm dependencies bump).</item>
      <item>Merged PR #1003 (`4a8d3d4f`): updated Python (`run_init_migrations.py`) and TypeScript (`migrate.ts`, `migrationStatusService.ts`) runners to sort 3-digit migration prefixes (`100+`) numerically (`20/20` assertions passing in `test_migration_names.py`).</item>
      <item>Cleaned all local and remote tracking branches; open PR queue is at 0.</item>
    </track>
  </completed_state>

  <next_horizon_backlog priority_ordered="true">
    <objective priority="P1" id="search_gaps_to_catalog_resolution">
      <title>Close the Omnibar Search Gaps Loop (One-Click Admin Resolution &amp; Synonym Mapping)</title>
      <context>
        `search_zero_result_gaps` and `SearchGapsPanel.tsx` are capturing zero-result queries in production, and the schema includes `resolved_at` and `resolved_entity_slug`.
      </context>
      <deliverables>
        <item>Enhance `SearchGapsPanel.tsx` and `PATCH /api/admin/search-gaps` so admins can link a zero-result query directly to a canonical ingredient/recipe slug (`resolved_entity_slug`) or trigger cosmic recipe generation from a high-hit gap.</item>
        <item>Feed resolved `normalized_query -&gt; resolved_entity_slug` mappings into Omnibar query expansion so previously missed searches resolve automatically.</item>
      </deliverables>
    </objective>

    <objective priority="P2" id="bare_json_and_test_only_sweep">
      <title>Post-1,000-PR Debt Ratchet: Bare JSON Casts (&lt;= 55) &amp; Remaining `testOnly` Modules</title>
      <context>
        `.bare-json-casts-baseline.json` sits at 66 and `testOnly` sits at 41. Replacing bare `response.json()` casts in API/service callers with validated `readJson` / Zod schemas directly hardens runtime type safety.
      </context>
      <deliverables>
        <item>Convert at least 10 production bare JSON casts to `readJson` + schema validation and ratchet `.bare-json-casts-baseline.json` to &lt;= 56.</item>
        <item>Audit the remaining 41 `testOnly` modules and consolidate or prune legacy service mocks.</item>
      </deliverables>
    </objective>

    <objective priority="P3" id="spacetime_auto_recovery_probe">
      <title>SpacetimeDB Half-Open Recovery Probe &amp; Write-Back Replay</title>
      <context>
        `spacetimeCircuitBreaker.ts` routes reads to PostgreSQL when SpacetimeDB `asol` is paused (`503`). When the cluster wakes back up, the circuit breaker should cleanly transition from `open` -&gt; `half_open` -&gt; `closed` and verify table parity.
      </context>
      <deliverables>
        <item>Add deterministic `half_open` probe recovery tests and an admin "Probe &amp; Reset Circuit" action in `/admin` diagnostics.</item>
      </deliverables>
    </objective>
  </next_horizon_backlog>

  <verification_gates mandatory_before_commit="true">
    <gate order="1" command="lsof -ti:3000 -ti:5175">Verify 0 background processes listening.</gate>
    <gate order="2" command="bun run verify:static">All 13 static gates must pass (0 TS errors, 0 ESLint errors, lint-debt &lt;= 1279, bare-json &lt;= 66, dead-modules = 0).</gate>
    <gate order="3" command="bun run test &amp;&amp; pytest backend/tests/test_migration_names.py">All 645 Jest suites (7,036+ tests) and 20 Python migration assertions must pass.</gate>
    <gate order="4" command="bun run build">Production build and all 12 route bundle ceilings in `scripts/check-route-sizes.cjs` must pass.</gate>
  </verification_gates>

</session_handoff>
