<session_handoff version="5.8" date="2026-11-12">

  <metadata>
    <repository>/Users/cookingwithcastro/Desktop/WhatToEatNext-master</repository>
    <base_branch commit="89d852bc">master</base_branch>
    <hardware_profile>Apple Silicon M5 / 16 GB Unified Memory</hardware_profile>
    <runtime_policy>Bun-strict (`bun run ...`, `bunx ...`, `bun --bun run dev`). Never invoke npm or npx for project scripts.</runtime_policy>
  </metadata>

  <boot_sequence mandatory="true">
    <step order="1" name="process_hygiene">
      In the SHARED checkout, before touching anything, run `lsof -ti:3000 -ti:5175`, `git status -sb` and `git reflog -5`. Other tools and sessions (Codex, an IDE, other Claude sessions) work in that checkout: treat any dirty file or branch you did not create as someone else's, and do not touch its index or files.
    </step>
    <step order="2" name="own_worktree">
      Do NOT `git checkout -b` or commit in the shared checkout. Work in your own worktree, OUTSIDE `~/Desktop` (iCloud) and outside any `.claude/` or `.worktrees/` path (jest ignores those): `mkdir -p ~/wten-work &amp;&amp; git fetch origin master &amp;&amp; git worktree add ~/wten-work/&lt;name&gt; -b &lt;branch&gt; origin/master`. Then link `node_modules` (guarded: `[ -e node_modules ] || ln -s &lt;shared&gt;/node_modules node_modules`) and copy the git-ignored `.husky/_/h`, `.husky/_/.gitignore` AND `.husky/_/pre-commit` from the shared checkout into the worktree's `.husky/_/`. Without the `pre-commit` stub the commit hook (typecheck + lint:changed) silently does not run. A shell cwd outside the project resets between calls: use `git -C &lt;worktree&gt;` or absolute paths.
    </step>
    <step order="3" name="branch_first_rule">
      NEVER commit directly to `master` or run `git push origin master`. GitHub ruleset `GH013` requires 4 status checks via PR. Stage by explicit path, never `git add -A`; `bun run check:untracked` fails until new files are staged. Paths containing `[brackets]` or `(parens)` need the literal pathspec form: `git add -- ':(literal)src/app/t/[token]/inviteParsers.ts'`.
    </step>
    <step order="4" name="no_reaudit_rule">
      Do NOT re-audit, re-seed, or re-test any items listed inside &lt;completed_state&gt;. Treat them as validated production truth.
    </step>
    <step order="5" name="cleanup_when_it_lands">
      When the PR is merged: `unlink &lt;worktree&gt;/node_modules` first (the symlink, no trailing slash), then `git worktree remove &lt;worktree&gt;`, then `git branch -D &lt;branch&gt;` (squash merges defeat `-d`). GitHub deletes the remote head branch on merge; `gh api -X DELETE repos/gregcastro23/WhatToEatNext/git/refs/heads/&lt;branch&gt;` answering 422 "Reference does not exist" means it is already gone. Never delete a remote branch with `git push --delete` (the pre-push hook would run the full verify). Leave other worktrees alone: `~/.codex/worktrees/*`, `.claude/worktrees/brave-montalcini-ce00ef`, `.claude/worktrees/hopeful-ritchie-f12ded`, `~/Desktop/wten-rpc-fix`.
    </step>
  </boot_sequence>

  <hard_invariants>
    <invariant id="database_migrations">
      Dual-home all new migrations in BOTH `database/init/` and `src/lib/database/migrations/`. Migrations 100 (`search_zero_result_gaps`) and 101 (`cosmic_generation_operations`) are live on production Railway Postgres. The next migration MUST be numbered `102-*.sql`. All runners sort numerically by integer prefix; verify new migrations with `python3 -m pytest backend/tests/test_migration_names.py`.
    </invariant>
    <invariant id="client_bundle_isolation">
      Never import full static ingredient catalogs (1,002 items), USDA portion tables, or server database modules into `"use client"` components. Enforce all 11 route bundle ceilings in `scripts/check-route-sizes.cjs`.
    </invariant>
    <invariant id="static_ratchets">
      The BASELINE FILES are the truth; prose in this file goes stale. Never edit a baseline JSON by hand: lock in an improvement only with `bun run lint:debt:ratchet` and `bun scripts/checkBareJsonCasts.ts --ratchet`, then `git add` the baseline files (a ratchet run AFTER staging leaves them unstaged and a commit would ship the code without them). Values on master 89d852bc: bare-json production 11 (total 20), lint-debt tracked 1235, assertion sites 2647 (non-null 566, production 2058, test 589), loose optionality 145, casts 150, declined pool 4627, prefer-nullish sub-baseline 272, `testOnly` 17, `scriptOnly` 22, `UNREACHABLE (dead): 0`. New and modified files stay under the 300-line ceiling (pure transformation modules strictly &lt; 250 lines, functions strictly &lt; 50 lines), with zero new `Record&lt;string, any&gt;` casts or redundant conditions.
    </invariant>
    <invariant id="wire_parser_rules">
      Converting a `(await res.json()) as T` site to `readJson(res, parseX)`: (1) mirror optionality from the PRODUCING route or service, not from the local TS type, and cite its file:line in the parser header; (2) keep the parse inside the call site's existing try/catch with the early returns (`!res.ok`, 401, 429/503) AHEAD of it; (3) drop a bad row, but THROW if rows arrived and none matched, so drift never reads as "no results"; (4) no new `as` of any kind (`as const` counts), no `!`, no `any`; in zod 4 a `z.unknown()` key is REQUIRED, so add `.optional()` explicitly; (5) explicit return types, parser in its own small client-safe module (no server-only imports reachable from a "use client" host) and the host file must not grow; (6) tests need a real JSON-null fixture (`JSON.parse("null")`), the producer's real success body, a refusal body, wrong-typed fields, and a CONTROL showing the rejection is the parser's doing (the same body valid vs invalid). Mutation-check the tests: remove one guard, confirm a test fails, restore. A field the caller never reads must not make the parse reject (the cart uses a rows-only parser so `configured` drift cannot break it).
    </invariant>
    <invariant id="hooks_push_and_gates">
      Pre-commit = typecheck + lint:changed. Pre-push = `verify:static &amp;&amp; test` (about 15-20 min under load) and it does NOT build: run `bun run build` yourself before the PR. Never `SKIP_VERIFY`. Push in the background with an explicit refspec, using BRACES: `CI=true GIT_SSH_COMMAND='ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=40 -o TCPKeepAlive=yes' git push origin "${SHA}:refs/heads/${BR}"`. In zsh an unbraced `$SHA:refs/...` is read as a `:r` modifier, mangles the refspec, and git rejects it locally while the background wrapper still reports success. Then confirm `gh api repos/gregcastro23/WhatToEatNext/git/ref/heads/&lt;branch&gt;` equals the sha. If master moves: `git fetch origin master` and `git merge FETCH_HEAD` (never rebase or force-push); recompute baselines with the repo tools. Run the 13 `verify:static` steps ONE BY ONE, each writing its own exit code to a summary file, and read those markers and the log content, never the wrapper's exit status (`lint:debt` and the audit exit 0 even with findings). Prove a linter ran with a known-violating control file (a `debugger;`, a `var` and a 60-line function trip both eslint configs).
    </invariant>
    <invariant id="helper_agents_and_review">
      At most 2 helper agents at a time, each capped at about 35 tool calls, with disjoint file lists. Tell writer agents to use ABSOLUTE paths inside your worktree and never to write under the shared checkout, then verify both trees with `git status`. Their self-reports can be incomplete (one listed `undefined` files): re-derive counts yourself. Before committing run a read-only adversarial review with two reviewers on different lenses (producer wire contract vs call-site/test/relocation quality); an empty or failed result is a failed measurement, not "no findings". Make the FIRST commit's subject accurate: the squash commit takes it over the edited PR title.
    </invariant>
    <invariant id="circuit_breaker_and_reconciler">
      All live SpacetimeDB reads must route through `spacetimeCircuitBreaker.ts` with half-open recovery support. All cosmic generation reconcilers must use `FOR UPDATE SKIP LOCKED` and verify matching `token_transactions` debit legs before refunding.
    </invariant>
    <invariant id="hermetic_cauldron_fidelity">
      Hermetic Cauldron operations must honor thermodynamic physical couplings: autogenous saturation ceilings $P_{autogenous}(T) = P_{air}(T) + p_{sat}(T)$, headspace saturation convergence ($\phi \to 100\%$, $T_h \to T_{set}$ in closed configurations), dome reflux ratios, and continuous Arrhenius transformation kinetics across all 7 classical operations (*Opus Culinaris*).
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
    <track id="5" name="Production Bare-JSON Ratchet &amp; Search Gap Velocity Alerts (PR #1006)">
      <item>Converted 9 bare JSON casts across API routes and services to `readJson` / `parseJsonRecord` with 0 new type assertions; ratcheted production bare JSON casts from 55 down to 46 (total 55).</item>
      <item>Surfaced high-velocity search gap alerts (&gt;= 5 hits in 24h) in `SearchGapsPanel.tsx` with dedicated amber banner and table row velocity badges.</item>
      <item>Added quick action `Draft Recipe` directly queueing cosmic recipe drafts (`action: 'queue_cosmic_recipe'`) into the recipe pipeline from the gap row.</item>
      <item>Ratcheted `.lint-debt-baseline.json` down to 1275 tracked debt (2734 assertion sites) and verified all 13 static gates green.</item>
      <item>Expanded test suite to 646 passing suites / 7,044 passing tests with dedicated `SearchGapsPanel.test.tsx`.</item>
    </track>
    <track id="6" name="Hermetic Vessel &amp; IF97 Steam Physics Simulation (PR #1008)">
      <item>Implemented full IAPWS-IF97 steam formulation (regions 1, 2, 4) across 10–250 kPa for accurate boiling points, saturation ceilings, and latent heat relative to an open pot.</item>
      <item>Retired standalone tilt-skillet planner in favor of Hermetic Vessel tab in kitchen lab physics and integrated cauldron simulation.</item>
      <item>Passed 12 printed computer verification values, CoolProp cross-check, and NIST IAPWS-95 comparative validation.</item>
    </track>
    <track id="7" name="Test-Only Module Consolidation, Bare-JSON Ratchet &amp; Gap Batch Drafting (PR #1009)">
      <item>Consolidated 10 test-only mock clients and helpers from `src/` to `tests/helpers/`, bringing `audit:dead-modules` `testOnly` count down from 39 to 29 (`dead: 0`).</item>
      <item>Converted 10 production bare JSON casts across 9 files to `readJson` with Zod schemas and typed parsers, ratcheting `.bare-json-casts-baseline.json` down to 36 production casts (45 total).</item>
      <item>Ratcheted `.lint-debt-baseline.json` down to 1249 tracked debt (down from 1275/1260) and 2706 assertion sites (down from 2734/2732).</item>
      <item>Added multi-select checkbox controls, batch draft dispatch (`patchSearchGapRequest`), and high-velocity shortcuts in `SearchGapsPanel.tsx` with dedicated test coverage.</item>
      <item>Maintained zero port listeners, 650 passing test suites (7,120 tests), 16 pytest passes, and 100% green route bundle sizes.</item>
    </track>
    <track id="8" name="Hermetic Cauldron MCP Tool &amp; Sub-20 Bare-JSON Ratchet (PR #1010, #1011)">
      <item>Registered `simulate_hermetic_cauldron` as the 14th tool in MCP catalog, input/output schemas, OpenAPI 3.1.0 specification, and REST bridge (`/api/mcp/rest/[tool]`), returning IF97 saturation metrics, cited cooking regimes, and 6-field kinetic profiles ($V, I, R, \nu, \mu, F$, $P = I \cdot V$); aliased `calculate_batch_circuit` for backward compatibility.</item>
      <item>Converted 19 production bare JSON casts across client components and hooks to `readJson` with client-safe schemas and parsers, driving production bare JSON casts down from 36 to 17 (total 26, smashing the sub-30 milestone).</item>
      <item>Ratcheted `.lint-debt-baseline.json` down to 2687 assertion sites (-19), 566 non-null assertions (-1), and 4694 declined rules pool (-1).</item>
    </track>
    <track id="9" name="Time-Stepped Hermetic Cooking Simulator, 7 Operations &amp; Matrix Kinetics (PR #1013)">
      <item>Transformed Hermetic Cauldron into a time-stepped culinary simulator (*Vas Hermeticum*) with self-coupled headspace physics, autogenous saturation pressure, and dynamic dome reflux ratios ($0.96$ hermetic, $0.88$ pressure regulated, $0.05$ vacuum, $0.0$ open).</item>
      <item>Created pure transformation engine (`src/utils/cauldronTransformation.ts`, 247 lines &lt; 250) tracking 5 culinary matrix kinetics: collagen hydrolysis (Arrhenius $k(T)$, $3.5\times$ acceleration under pressurized reflux), Maillard/fond index, volatile aromatic retention (&gt;92% in hermetic reflux), concentration factor, and starch/pectin softening.</item>
      <item>Implemented and classified the 7 Classical Hermetic Operations (*Opus Culinaris*): Calcinatio, Solutio, Digestio, Circulatio, Distillatio, Fermentatio, and Coagulatio with dynamic ESMS and elemental transfer boosts.</item>
      <item>Shipped interactive `SealModeSelector`, `CulinaryMatrixReadout`, and 4-step Opus Culinaris timeline presets in Kitchen Lab simulator UI.</item>
      <item>Enriched MCP tool `simulate_hermetic_cauldron` with `sealMode`, `durationMinutes`, `hermeticOperation`, and `culinaryMatrix` telemetry; added Vector 6 fidelity probe test suite.</item>
      <item>Maintained zero port listeners, 655 passing test suites (7,155 tests), 16 pytest passes, and 100% green route bundle sizes across all 11 routes.</item>
    </track>
    <track id="10" name="@alchm/mcp-server@1.6.0 Release &amp; Registry Validation (PR #1015)">
      <item>Published `@alchm/mcp-server@1.6.0` live to npm with all 14 tools (including `simulate_hermetic_cauldron`, `sealMode`, `durationMinutes`, `hermeticOperation`, and `culinaryMatrix`).</item>
      <item>Fixed `mcp-publisher` schema constraint by condensing `server.json` description to &lt;= 100 characters; verified `server.json` passes `mcp-publisher validate` with code 0.</item>
      <item>Synchronized versions across `catalog.ts`, `package.json`, `server.json`, `README.md`, and `docs/mcp-registry-submission.md`. Do not publish again unless the user asks.</item>
    </track>
    <track id="11" name="Parser Hardening, Omnibar Cache Fix &amp; First Relocation (PR #1012, 4f92c612)">
      <item>Hardened #1011's parsers: a restaurant row that fails the schema is dropped and the parse throws only if none match; discover cards throw if none match; the checkout `esms` mode is refused and pinned by a test. Added tests for the restaurant, checkout and token-gate parsers.</item>
      <item>Fixed the Omnibar cache (documented as LRU but actually FIFO; a hit now refreshes recency). `useOmniSearch.ts` already has a 120 ms debounce, a 50-entry cache and in-flight dedupe, and gap-expanded answers are cached under the typed key.</item>
      <item>Relocated 5 modules to `tests/helpers/` (enhanced-astronomical-calculator, batchEnrichment, RecipeDataEnricher, cuisineAggregationEngine, groupDynamics). This was SCOPE EXIT, not repair: 41 audited findings left lint scope and the 5 moves read as 6 in the audit. `testOnly` went 29 to 23. The merged title still says "bare-json to 22" although master was at 17: the first commit's subject wins in a squash.</item>
    </track>
    <track id="12" name="Six Wire Parsers &amp; Second Relocation (PR #1017, 89d852bc)">
      <item>REAL REPAIR: production bare-json casts 17 to 11 (total 26 to 20). Six sites now use `readJson` with narrowing parsers that mirror the producing route: `src/app/t/[token]/page.tsx` x2 (`inviteParsers.ts`), `src/app/(alchm)/tables/page.tsx` (`createTableParser.ts`), `src/contexts/GroceryCartContext.tsx` (rows-only `parseAmazonSearchResults`), `src/components/menu-planner/GroceryListModal.tsx` (`parseAmazonSearchResponse`), and `src/components/onboarding/LocationSearch.tsx` (`locationSearchParser.ts`). The Amazon parsers share `src/lib/amazon/searchResponseParser.ts`. 87 new parser tests, mutation-checked, each with a JSON-null fixture and a paired control.</item>
      <item>SCOPE EXIT, not repair: relocated CulturalAnalyticsService, culturalrules, astrologicalValidation, transitValidation, recipeAutoFixer and recipeSchemaValidator to `tests/helpers/` (their 5 test files repointed). `testOnly` 23 to 17; `scriptOnly` stayed 22 and dead stayed 0. Measured with the repo's own scanner on the OLD file contents: assertion sites -37 = 6 real + 31 exit; tracked lint debt 1239 to 1235 and prefer-nullish 275 to 272 are entirely exit; declined pool 4666 to 4627 = 1 real (a `max-lines-per-function` warning in `tables/page.tsx`) + 38 exit.</item>
      <item>COST OF THE RELOCATIONS: `tsconfig.json` excludes `tests/**`, so the 11 modules relocated by #1012 and #1017 are no longer type-checked by `tsc`; only ts-jest sees them, and `jest.config.js` ignores diagnostic codes 2322 and 2339. A type change in `@/types/alchemy`, `@/types/recipe` or `elementalValidation` can break them without failing `bun run typecheck`.</item>
      <item>Drift-only behaviour changes (the producers never send these bodies): a non-object redeem body shows "Something went wrong"; a malformed invite preview shows the not-found card; an Amazon 2xx missing `results`/`configured` throws (the modal shows the message; the cart un-marks its items and retries once per cart change, probed on the real provider: 1 request, none while idle, no loop); a geocoding `success: true` without `results` throws and clears the list; rows with NaN coordinates are dropped; a missing `type` is tolerated.</item>
      <item>`LivePriceTicker.tsx:103` was skipped on purpose: the site carries a second assertion (`json as PriceIndexApiPayload`) and a validator would need `physics`/`supply`/`railsUsd`, with `supply` legitimately absent from a CDN-cached older payload. Convert it only with no new assertion and no behaviour change.</item>
      <item>Verified on the merged tree: all 13 `verify:static` steps, jest 663 suites passed (6 skipped) / 7,285 tests passed (66 skipped), 16 pytest passes, `bun run build` with all 11 route ceilings. The 663 / 7,285 figures are a floor, not a target. Not verified: none of the six converted components was exercised in a browser, and no component test renders `t/[token]`, `tables` or `LocationSearch`.</item>
    </track>
  </completed_state>

  <next_horizon_backlog priority_ordered="true">
    <objective priority="P1" id="bare_json_below_8">
      <title>Push Production Bare JSON Casts Below 8</title>
      <context>
        11 production casts remain (20 total, 9 of them in tests). Sites: `src/contexts/AlchemicalStatisticsContext.tsx:98`, `src/app/(alchm)/celestial-lab/alchm/page.tsx:496` (1,254-line file: extract the parser, do not grow it), `src/app/(alchm)/generated-recipe/[id]/page.tsx:172`, `src/app/(alchm)/profile/[userId]/page.tsx:112` (a downstream `as PublicProfile` cast follows: convert both or neither), `src/components/home/DynamicCuisineRecommender.tsx:225`, `src/components/PlanetaryAspectsDisplay.tsx:198`, `src/components/recipes/TechniqueModal.tsx:94`, `src/components/recipes/IngredientDrawer.tsx:263`, `src/components/menu-planner/redesign/ProfileWeekCard.tsx:37` and `AgentProfileWeekCard.tsx:52` (both carry `MealSlotType[]`, whose recipe object is deep: decide whether to validate only the fields the card reads), and `src/components/economy/LivePriceTicker.tsx:103` (skip, see track 12). These sites were not inspected in detail this session; read the producing route for each before estimating.
      </context>
      <deliverables>
        <item>Convert at least 4 sites under the `wire_parser_rules` invariant, then ratchet `.bare-json-casts-baseline.json` with `bun scripts/checkBareJsonCasts.ts --ratchet` and re-stage it. Report real repair separately from any scope exit.</item>
      </deliverables>
    </objective>

    <objective priority="P2" id="test_only_decision">
      <title>Decide the Fate of the Remaining 17 `testOnly` Modules</title>
      <context>
        `audit:dead-modules` reports 17 testOnly files. Two are INTENT, not leftovers, and must not be moved: `src/lib/payments/cryptoPromo.ts` (a pre-built gate: the homepage must never advertise a crypto rail that is not live) and `src/lib/validation/agentResponseSchemas.ts` (client validators awaiting a caller). `src/lib/sacred-7-stats.ts` (770 lines) is imported only by `monicaPopulationScaleDerivation.test.ts` and `sacred7MonicaMapping.test.ts`. The other 14 form ONE closed cluster, the calculations hub: `src/calculations/index.ts` (613 lines) imports alchemicalCalculations, combinationEffects, core/elementalCalculations, culinary/cuisineRecommendations, culinary/recipeMatching, culinaryAstrology and enhancedAlchemicalMatching, and reaches `src/data/cooking/cookingMethods.ts`, `src/data/recipes/elementalMappings.ts`, `src/types/recipes.ts`, `src/services/CurrentMomentManager.ts`, `src/utils/elementalMappings/ingredients.ts` and `src/utils/elemental/core.ts`. Its only importers are `src/__tests__/calculations/unifiedEngineWitness.test.ts` and `src/__tests__/culinaryAstrology.test.ts`: read what the witness test pins before deleting anything.
      </context>
      <deliverables>
        <item>ASK THE USER UP FRONT whether to RELOCATE to `tests/helpers/` or DELETE a dead module together with the test that only exercises it; do not assume. Relocation is scope exit (see track 12) and removes type checking; deletion is real repair but drops suites below the 663 / 7,285 floor. Move or delete a cluster as a unit.</item>
        <item>Diff `bun scripts/auditDeadModules.ts --json &lt;ABSOLUTE PATH OUTSIDE THE REPO&gt;` before and after to see every tier change (a bare `--json` or a relative path writes `dead-modules.json` into the worktree as an untracked file). State how many findings left scope.</item>
      </deliverables>
    </objective>

    <objective priority="P3" id="relocated_helpers_typecheck">
      <title>Proposal: Restore Type Checking for `tests/helpers/`</title>
      <context>
        The 11 relocated modules are outside `tsc`. This is a proposal to decide with the user, not a mandate: measure first (a scratch tsconfig that includes only `tests/helpers/**` and counts errors) before adding a gate or touching the baselines.
      </context>
      <deliverables>
        <item>Report how many type errors a `tests/helpers/**` check finds today and whether a non-regression ratchet is worth adding. Do not fix helper types blindly.</item>
      </deliverables>
    </objective>

    <objective priority="CLOSED" id="search_gaps_auto_suggest_debouncer">
      <title>Omnibar Zero-Result Auto-Expansion Latency (closed)</title>
      <context>
        `useOmniSearch.ts` already has a 120 ms debounce, a 50-entry cache and in-flight dedupe, and gap-expanded answers are cached under the typed key. The gap map is server-only (DB-backed, 60 s TTL), so the client has nothing to resolve. Do not build a new layer. Reopen only with a measured latency problem: a number plus its basis.
      </context>
    </objective>
  </next_horizon_backlog>

  <verification_gates mandatory_before_commit="true">
    <gate order="1" command="lsof -ti:3000 -ti:5175">Verify 0 background processes listening (and check the shared checkout's `git status -sb` / `git reflog -5` first).</gate>
    <gate order="2" command="bun run verify:static">All 13 static gates must pass, run one by one with a per-step exit marker: 0 TS errors, 0 ESLint errors, lint-debt tracked &lt;= 1235, assertion sites &lt;= 2647 (non-null &lt;= 566), declined pool &lt;= 4627, loose optionality &lt;= 145, bare-json production &lt;= 11, testOnly &lt;= 17, dead-modules = 0. Read the log content, not the wrapper's exit status.</gate>
    <gate order="3" command="bun run test &amp;&amp; python3 -m pytest backend/tests/test_migration_names.py">Jest must stay at or above the floor of 663 passed suites / 7,285 passed tests (6 suites and 66 tests skipped), and the 16 Python migration assertions must pass.</gate>
    <gate order="4" command="bun run build">Production build and all 11 route bundle ceilings in `scripts/check-route-sizes.cjs` must pass. The pre-push hook does not build, so run this yourself before opening the PR.</gate>
    <gate order="5" command="adversarial review">Before committing code, two read-only reviewers on different lenses; before claiming a number, say whether it is real repair or scope exit.</gate>
  </verification_gates>

</session_handoff>
