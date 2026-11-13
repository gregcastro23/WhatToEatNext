<session_handoff version="5.9" date="2026-11-12">

  <metadata>
    <repository>/Users/cookingwithcastro/Desktop/WhatToEatNext-master</repository>
    <base_branch commit="30406596">master</base_branch>
    <hardware_profile>Apple Silicon M5 / 16 GB Unified Memory</hardware_profile>
    <runtime_policy>Bun-strict (`bun run ...`, `bunx ...`, `bun --bun run dev`). Never invoke npm or npx for project scripts.</runtime_policy>
  </metadata>

  <boot_sequence mandatory="true">
    <step order="1" name="process_hygiene">
      In the SHARED checkout, before touching anything, run `lsof -ti:3000 -ti:5175`, `git status -sb`, `git reflog -5` and `git worktree list`. Other tools and sessions (Codex, an IDE, other Claude sessions) work in that checkout: treat any dirty file or branch you did not create as someone else's, and do not touch its index or files. The shared checkout is kept clean on `master` and may deliberately sit behind `origin/master`: do NOT pull it; cut your worktree from `origin/master`.
    </step>
    <step order="2" name="own_worktree">
      Do NOT `git checkout -b` or commit in the shared checkout. Work in your own worktree, OUTSIDE `~/Desktop` (iCloud) and outside any `.claude/` or `.worktrees/` path (jest ignores those): `mkdir -p ~/wten-work &amp;&amp; git fetch origin master &amp;&amp; git worktree add ~/wten-work/&lt;name&gt; -b &lt;branch&gt; origin/master`. Link `node_modules` (guarded: `[ -e node_modules ] || ln -s &lt;shared&gt;/node_modules node_modules`) and copy THREE git-ignored files from the shared checkout into the worktree's `.husky/_/`: `h`, `.gitignore` and `pre-commit`. Without the `pre-commit` stub the commit hook (`typegen + tsc + lint:changed`) silently does not run. A shell cwd outside the project resets between calls: use `git -C &lt;worktree&gt;` or absolute paths.
    </step>
    <step order="3" name="branch_first_rule">
      NEVER commit directly to `master` or run `git push origin master`. GitHub ruleset `GH013` requires 4 status checks via PR (`Verify`, `Build`, `Test`, `rust`). Stage by explicit path, never `git add -A`; `bun run check:untracked` fails until new `src/` or `scripts/` files are staged. Paths containing `[brackets]` or `(parens)` need the literal pathspec form: `git add -- ':(literal)src/app/t/[token]/inviteParsers.ts'`.
    </step>
    <step order="4" name="no_reaudit_rule">
      Do NOT re-audit, re-seed, or re-test any items listed inside &lt;completed_state&gt;. Treat them as validated production truth.
    </step>
    <step order="5" name="cleanup_when_it_lands">
      When the PR is merged: `unlink &lt;worktree&gt;/node_modules` first (the symlink, no trailing slash), then `git worktree remove &lt;worktree&gt;`, then `git branch -D &lt;branch&gt;` (squash merges defeat `-d`). Use direct literal-path commands for removals (no `bash -c` with variables). GitHub deletes the remote head branch on merge; `gh api -X DELETE repos/gregcastro23/WhatToEatNext/git/refs/heads/&lt;branch&gt;` answering 422 "Reference does not exist" means it is already gone. Never delete a remote branch with `git push --delete` (the pre-push hook would run the full verify). Leave other worktrees alone: `~/.codex/worktrees/*`, `.claude/worktrees/brave-montalcini-ce00ef`, `.claude/worktrees/hopeful-ritchie-f12ded`, `~/Desktop/wten-rpc-fix`.
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
      The BASELINE FILES are the truth; prose in this file goes stale. Never edit a baseline JSON by hand: lock in an improvement only with `bun run lint:debt:ratchet` and `bun scripts/checkBareJsonCasts.ts --ratchet`, then `git add` the baseline files (a ratchet run AFTER staging leaves them unstaged and a commit would ship the code without them). When running `bun scripts/auditDeadModules.ts --json &lt;path&gt;`, pass an ABSOLUTE path outside the repo (a bare `--json` or relative path writes an untracked `dead-modules.json` into the worktree). Values on master `30406596`: bare-json production `6` (total `15`), lint-debt tracked `1219`, assertion sites `2570` (`non-null` `564`, production `1983`, test `587`), loose optionality `145`, casts `147` (`asAny` `33`, `asUnknownAs` `114`, prod `115`, test `32`), declined pool `4595`, prefer-nullish sub-baseline `269`, `testOnly` `3` (`cryptoPromo` and `agentResponseSchemas` = intent; `sacred-7-stats` left on purpose), `scriptOnly` `22`, `UNREACHABLE (dead): 0`. New and modified files stay under the 300-line ceiling (pure transformation modules strictly &lt; 250 lines, functions strictly &lt; 50 lines), with zero new `Record&lt;string, any&gt;` casts or redundant conditions.
    </invariant>
    <invariant id="wire_parser_rules">
      Converting a `(await res.json()) as T` site to `readJson(res, parseX)`: (1) mirror optionality from the PRODUCING route or service, not from the local TS type, and cite its `file:line` in the parser header; (2) validate only fields the caller actually reads, keep the parse inside the call site's existing try/catch with early returns (`!res.ok`, 401, 429/503) AHEAD of it, and give any POST whose success has side effects (e.g. `claim-daily`) a NEVER-THROWING parser; (3) drop a bad row, but THROW if rows arrived and none matched so drift never reads as "no results"; (4) no new `as` of any kind (`as const` counts), no `!`, no `any`; zod-inferred optionals do not satisfy `exactOptionalPropertyTypes` against hand-written interfaces (and in zod 4 a `z.unknown()` key is REQUIRED without `.optional()`), so use `isJsonRecord` narrowing; (5) explicit return types, parser in its own small client-safe module (no server-only imports reachable from `"use client"`), and the host file must not grow; (6) tests near the 300-line ceiling get a companion `*.guards.test.ts` — include a real JSON-null fixture (`JSON.parse("null")`), non-finite bodies built from JSON text (`1e999`, since `JSON.stringify(Infinity)` is `null`), the producer's real success body, a refusal body, wrong-typed fields, a CONTROL showing rejection is the parser's doing, and round-trip the REAL data source (catalog, registry, captured fixture) through the parser (which exposed 4 classes of real data the TS types hid); mutation-check every guard. New test files are ignored (or have type/any/length rules off) by ESLint (`eslint.config.mjs` ignores `src/**/*.test.ts` and `src/__tests__/`; `eslint.config.fast.mjs` ignores `src/__tests__/` and disables `no-explicit-any`/`max-lines` on `src/**/*.test.ts`), so check them with a scoped `tsc` and an AST scan for `as`, `!`, `any`.
    </invariant>
    <invariant id="hooks_push_and_gates">
      Pre-commit = `next typegen` + `tsc` (`bun run typecheck`) + `lint:changed`. Pre-push = `verify:static &amp;&amp; test` (about 15–20 min under load) and it does NOT build: run `bun run build` yourself before the PR. Never `SKIP_VERIFY`. Push in the background with BRACES: `CI=true GIT_SSH_COMMAND='ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=40 -o TCPKeepAlive=yes' git push origin "${SHA}:refs/heads/${BR}"` (in zsh unbraced `$SHA:refs/...` triggers `:r` and fails locally while the background wrapper reports success), then confirm `gh api repos/gregcastro23/WhatToEatNext/git/ref/heads/&lt;branch&gt; --jq .object.sha` equals your sha. If master moves: `git fetch origin master` and `git merge FETCH_HEAD` (never rebase or force-push); recompute baselines with the repo tools. Run the 13 `verify:static` steps ONE BY ONE with per-step exit markers and read the logs, never the wrapper exit status (`lint:debt` and the audit exit 0 even with findings). Prove a linter ran with a known-violating control file (a `debugger;`, a `var`, and a 60-line function trip both ESLint configs). Shell traps: zsh does not word-split `$VAR` and aborts on unquoted globs (`--include=*.ts`); macOS `/bin/bash` is 3.2 (no `mapfile`); `sed -i ''`; never run `bun run jest` without an explicit existing path (backslash-escape brackets/parens).
    </invariant>
    <invariant id="helper_agents_and_review">
      At most 2 helper agents at a time, each capped at about 35 tool calls, with disjoint file lists. Tell writer agents to use ABSOLUTE paths inside your worktree and never to write under the shared checkout, then verify both trees with `git status`. Re-derive every number yourself. Before committing run a read-only adversarial review with two reviewers on different lenses; an empty or failed result is a failed measurement, not "no findings". Make the FIRST commit's subject accurate: the squash commit takes it over the edited PR title.
    </invariant>
    <invariant id="circuit_breaker_and_reconciler">
      All live SpacetimeDB reads must route through `spacetimeCircuitBreaker.ts` with half-open recovery support. All cosmic generation reconcilers must use `FOR UPDATE SKIP LOCKED` and verify matching `token_transactions` debit legs before refunding.
    </invariant>
    <invariant id="hermetic_cauldron_fidelity">
      Hermetic Cauldron operations must honor thermodynamic physical couplings: autogenous saturation ceilings $P_{autogenous}(T) = P_{air}(T) + p_{sat}(T)$, headspace saturation convergence ($\phi \to 100\%$, $T_h \to T_{set}$ in closed configurations), dome reflux ratios, and continuous Arrhenius transformation kinetics across all 7 classical operations (*Opus Culinaris*).
    </invariant>
  </hard_invariants>

  <completed_state do_not_reaudit="true">
    <track id="1-3" name="Hygiene, Bundle Ceilings, Omnibar Phase 7 &amp; Cosmic Ops Durability (PR #997, #998, #1000–#1002)">
      <item>Reclaimed ~30.5 GB worktree disk space, purged Finder duplicates &amp; dead modules (`UNREACHABLE: 0`), and dropped `@chakra-ui/react` / `recharts` from recipe detail routes, slashing First Load JS on `/recipes/versions/[versionId]` (154 kB, -77%), `/kitchen-lab/physics` (113 kB, -80%), `/cooking-methods/tilt-skillet` (126 kB, -75%), and `/recipes/[recipeId]` (222 kB, -34%).</item>
      <item>Shipped `100-search-zero-result-gaps.sql`, `SearchGapsPanel.tsx`, and `101-cosmic-generation-operations.sql` (live on production Railway Postgres); published `@alchm/mcp-server@1.5.2` to npm and Official MCP Registry (`io.github.gregcastro23/alchm-kitchen`, `status: active`).</item>
      <item>Expanded `POST /api/recipes/[recipeId]/adapt` across all 12 canonical vegetarian historical personas (`historicalPersonaCatalogValidation.test.ts` 12x10 matrix + `PLANT_PROTEIN_ALIASES`); shipped `agentRatingProbe.ts`, `spacetimeCircuitBreaker.ts`, `cosmicOperationReconciler.ts`, `CosmicOperationsPanel.tsx`, and cron `/api/cron/reconcile-cosmic-operations` (`35 * * * *` in `vercel.json` and `cronRegistry.ts`).</item>
    </track>
    <track id="4-5" name="Search Gap Resolution, Velocity Alerts &amp; Bare-JSON Ratchets (PR #1004, #1006)">
      <item>Built `gapResolutionMap.ts` for Omnibar zero-result query expansion, added SpacetimeDB half-open recovery (`transitionSpacetimeCircuitToHalfOpen`, `POST /api/admin/diagnostics/spacetime`) + `SpacetimeDiagnosticsPanel.tsx`, and added high-velocity gap alerts (&gt;= 5 hits in 24h) + `Draft Recipe` (`action: 'queue_cosmic_recipe'`) in `SearchGapsPanel.tsx`.</item>
      <item>Converted 20 production bare-json casts (`66 -&gt; 46` prod / `55` total), pruned legacy test-only modules (`testOnly: 39`, `dead: 0`), and ratcheted `.lint-debt-baseline.json` to `1275` tracked (`2734` assertion sites, `646` suites / `7,044` tests).</item>
    </track>
    <track id="6-7" name="Hermetic Vessel IF97, Test-Only Triage &amp; Batch Drafting (PR #1008, #1009)">
      <item>Implemented IAPWS-IF97 steam physics (regions 1, 2, 4 across 10–250 kPa; 12 printed verification values, CoolProp &amp; NIST IAPWS-95 checks) and retired standalone tilt-skillet planner (308 redirect to `/kitchen-lab/physics?tab=vessel`, `tiltSkillet` 5 ESMS charge removed, 11 route ceilings).</item>
      <item>Consolidated 10 test-only helpers to `tests/helpers/` (`testOnly 39 -&gt; 29`, `dead: 0`), converted 10 bare-json casts (`46 -&gt; 36` prod / `45` total, `lint-debt 1249`, `2706` sites), and shipped multi-select batch gap drafting (`patchSearchGapRequest`); `650` suites / `7,120` tests, `16` pytest.</item>
    </track>
    <track id="8-10" name="Hermetic Cauldron Simulator, Opus Culinaris &amp; MCP 1.6.0 (PR #1011, #1013, #1015)">
      <item>Registered 14th MCP tool `simulate_hermetic_cauldron` (`calculate_batch_circuit` alias) with OpenAPI 3.1.0 + REST bridge returning IF97 saturation metrics, cited cooking regimes, and 6-field kinetic profiles ($V, I, R, \nu, \mu, F$, $P = I \cdot V$); drove bare-json `36 -&gt; 17` prod (`26` total, `2687` sites, `566` non-null, `4694` declined).</item>
      <item>Built time-stepped *Vas Hermeticum* simulator (`cauldronTransformation.ts` 247 lines &lt; 250; autogenous saturation, dome reflux ratios `0.96`/`0.88`/`0.05`/`0.0`, 5 matrix kinetics incl. Arrhenius collagen hydrolysis $3.5\times$ pressurized &amp; &gt;92% aromatic retention, 7 Classical Hermetic Operations with ESMS/elemental transfer boosts, `SealModeSelector` in `VesselControls.tsx`, `CulinaryMatrixReadout`, Vector 6 probe); `655` suites / `7,155` tests.</item>
      <item>Released `@alchm/mcp-server@1.6.0` on npm with `server.json` description &lt;= 100 chars (`mcp-publisher validate` exit 0). Do not publish again unless the user asks.</item>
    </track>
    <track id="11" name="Parser Hardening, Omnibar Cache Fix &amp; First Relocation (PR #1012, 4f92c612)">
      <item>Hardened #1011's parsers (restaurant rows drop bad entries and throw if none match; discover cards throw if none match; checkout `esms` mode refused and pinned); fixed Omnibar LRU cache (`useOmniSearch.ts` already has 120 ms debounce, 50-entry cache, in-flight dedupe, and gap-expanded answers cached under typed key — previously FIFO on hit).</item>
      <item>SCOPE EXIT: relocated 5 modules to `tests/helpers/` (`enhanced-astronomical-calculator`, `batchEnrichment`, `RecipeDataEnricher`, `cuisineAggregationEngine`, `groupDynamics`); 41 findings left lint scope and audit read `testOnly 29 -&gt; 23`. Squash title still says "bare-json to 22" though master was at 17 (first commit subject wins).</item>
    </track>
    <track id="12" name="Six Wire Parsers &amp; Second Relocation (PR #1017, 89d852bc)">
      <item>REAL REPAIR: production bare-json `17 -&gt; 11` (total `26 -&gt; 20`) via `readJson`: `t/[token]` x2 (`inviteParsers.ts`), `tables` (`createTableParser.ts`), `GroceryCartContext` (`parseAmazonSearchResults`), `GroceryListModal` (`parseAmazonSearchResponse`), `LocationSearch` (`locationSearchParser.ts`), with 87 mutation-checked tests.</item>
      <item>SCOPE EXIT &amp; COST: relocated 6 modules to `tests/helpers/` (`CulturalAnalyticsService`, `culturalrules`, `astrologicalValidation`, `transitValidation`, `recipeAutoFixer`, `recipeSchemaValidator`; `testOnly 23 -&gt; 17`, `scriptOnly 22`, `dead 0`). `tsconfig.json` excludes `tests/**` and `jest.config.js` ignores diagnostic codes `2322`/`2339`, so the 11 relocated modules lost `tsc` checks (drift in `@/types/alchemy`, `@/types/recipe`, or `elementalValidation` goes unseen by `typecheck`). `LivePriceTicker.tsx:103` skipped on purpose; `663` suites / `7,285` tests floor.</item>
    </track>
    <track id="13" name="Five Wire Parsers &amp; Dead Calculations Hub Deletion (PR #1019, 30406596)">
      <item>REAL REPAIR: production bare-json `11 -&gt; 6` (total `20 -&gt; 15`) via 5 hand-written `isJsonRecord` parsers (`PlanetaryAspectsDisplay` `planetaryAspectsParser.ts`, `DynamicCuisineRecommender` `cuisineRecommendParser.ts`, `TechniqueModal` `techniqueParser.ts`, `IngredientDrawer` `ingredientDrawerParser.ts` + `ingredientRecordParser.ts`, `celestial-lab/alchm` claim-daily `claimDailyParser.ts`) with 384 new tests across 10 files (each with companion `*.guards.test.ts`, mutation-checked). NO scope exit: nothing relocated.</item>
      <item>Decision: deleted closed, caller-less calculations hub rather than relocating (`src/calculations/index.ts` + 13 dependents = 14 modules, 5,359 lines; plus 2 tests `unifiedEngineWitness.test.ts` and `culinaryAstrology.test.ts`). `testOnly 17 -&gt; 3` (`sacred-7-stats.ts` kept because `docs/physics/SYNTHESIS_MODEL.md:2080-2156` cites `normalizeMonicaForStats()`; `cryptoPromo` &amp; `agentResponseSchemas` = intent). Removed 72 assertion sites with deleted code (70 prod, 2 test on old files; total `2647 -&gt; 2570` including -5 across the 5 converted hosts), non-null `566 -&gt; 564`, casts `150 -&gt; 147`, lint-debt `1235 -&gt; 1219`, declined `4627 -&gt; 4595`, prefer-nullish `272 -&gt; 269`.</item>
      <item>Approved behaviour fixes (over all 1,002 catalog cards in `IngredientDrawer`): 12 cards' `seasonality` object now falls back to `season`; 3 cards' `sensoryProfile.taste` tag list enables Flavor Profile; 85 (`vitamins`: 78 non-empty + 7 empty) / 73 (`minerals`: 67 non-empty + 6 empty) name lists avoid bogus `"0"`, `"1"`, ... chips (empty arrays already rendered none). Claim handler drops unread `yield` from `emitTokenEconomyUpdate` (all 4 listeners take no event arg).</item>
      <item>Coverage lost with hub: `pos.minute ?? pos.minutes ?? 0` adapter is pinned nowhere now (live reader `src/services/planetaryScoring.ts:286` unpinned); finiteness of `RealAlchemizeService.alchemize` over the 20 golden charts is no longer asserted (`src/__tests__/physics/esmsConformance.test.ts` still covers `calculateAlchemicalFromPlanets`). P3 measurement only: scratch `tsc` over `tests/helpers/**` found 1 error (`tests/helpers/ElementalCalculator.ts:142` `import("../data/cuisineFlavorProfiles")` broken by #1009's move). Verified: 13 `verify:static` steps, jest `671` suites / `7,640` tests (`6` / `66` skipped), `16` pytest, `bun run build` (11 route ceilings); NOT verified: browser or real-route execution.</item>
    </track>
  </completed_state>

  <next_horizon_backlog priority_ordered="true">
    <objective priority="P1" id="remaining_bare_json_sites">
      <title>Convert Remaining 6 Production Bare JSON Casts (Each Deferred With Reason)</title>
      <context>
        6 production casts remain (`15` total, `9` in tests), each deferred on purpose: `src/contexts/AlchemicalStatisticsContext.tsx:98` (deep `PeriodStatistics`), `src/app/(alchm)/generated-recipe/[id]/page.tsx:172` (`MonicaOptimizedRecipe extends EnhancedRecipe`), `src/app/(alchm)/profile/[userId]/page.tsx:112` (`PublicProfile`, plus downstream `as PublicProfile` at line 121: convert both or neither), `src/components/menu-planner/redesign/ProfileWeekCard.tsx:37` and `AgentProfileWeekCard.tsx:52` (`MealSlot.createdAt` is typed `Date` in `src/types/menuPlanner.ts:85` but is a string on the wire; validating only the fields `ProfileWeekFixture` reads means narrowing `ProfileWeekFixture`'s props), and `src/components/economy/LivePriceTicker.tsx:103` (two assertions including `json as PriceIndexApiPayload` at line 110, plus a CDN-cached older payload missing `supply`: convert only with no new assertion and no behaviour change).
      </context>
      <deliverables>
        <item>Scout each producing route inline first, convert under `wire_parser_rules`, then ratchet `.bare-json-casts-baseline.json` (`--ratchet`) and `.lint-debt-baseline.json` (`lint:debt:ratchet`) and re-stage them.</item>
      </deliverables>
    </objective>

    <objective priority="CLOSED" id="test_only_decision">
      <title>Remaining 3 `testOnly` Modules (closed)</title>
      <context>
        `testOnly` is `3` (`src/lib/payments/cryptoPromo.ts` and `src/lib/validation/agentResponseSchemas.ts` are intent; `src/lib/sacred-7-stats.ts` is kept on purpose because `docs/physics/SYNTHESIS_MODEL.md:2080-2156` cites `normalizeMonicaForStats()`). Do not move or delete them.
      </context>
    </objective>

    <objective priority="P3" id="relocated_helpers_typecheck">
      <title>Open Proposal (Decide With User): Fix `ElementalCalculator.ts:142` &amp; Gate `tests/helpers/`</title>
      <context>
        Decide with the user before acting: fix `tests/helpers/ElementalCalculator.ts:142` (`import("@/data/cuisineFlavorProfiles")` instead of `"../data/cuisineFlavorProfiles"`) and add a non-regression `tsc` gate over `tests/helpers/**`. Measurement recipe: a scratch tsconfig OUTSIDE the repo extending the repo `tsconfig.json` with `"baseUrl": "&lt;worktree&gt;"`, `include` only `tests/helpers/**/*.ts` (+ `next-env.d.ts` and `src/types/*.d.ts`), `exclude` only `node_modules`, `types: ["node", "jest"]` with explicit `typeRoots`, `incremental: false` (21 helpers + 238 `src` files, roughly 1 min; finds 1 error today).
      </context>
    </objective>

    <objective priority="P4" id="repin_lost_hub_coverage">
      <title>Optional (Ask User): Re-Pin Coverage Lost With the Calculations Hub</title>
      <context>
        Optional — ask the user before executing: (1) pin `pos.minute ?? pos.minutes ?? 0` at live reader `src/services/planetaryScoring.ts:286`, and (2) assert finiteness of `RealAlchemizeService.alchemize` over the 20 golden charts.
      </context>
    </objective>

    <objective priority="P5" id="optional_cleanup">
      <title>Optional Cleanup &amp; Known Minor Leftovers</title>
      <context>
        Prose docs still naming the deleted hub modules (13-15 active markdown files, depending on the match pattern, excluding `docs/DELETED.md`, e.g. `docs/guides/CURRENT_MOMENT_SYSTEM.md`, `docs/physics/PHYSICS_QUANTITY_MAP.md`, `docs/LINTING_SITUATION_NEXT_SESSION.md`), two unreferenced `tests/test-cooking-methods*.cjs` scripts (`test-cooking-methods.cjs`, `test-cooking-methods-simple.cjs`), `TokenEconomyEventDetail.yield?` (`src/hooks/useTokenEconomy.ts:45`, now never populated by the claim page), `PlanetaryAspectsDisplay` rendering parser error text verbatim (`Error: {error}`), and `DynamicCuisineRecommender` throwing on `personalized: null` by design.
      </context>
    </objective>

    <objective priority="CLOSED" id="search_gaps_auto_suggest_debouncer">
      <title>Omnibar Zero-Result Auto-Expansion Latency (closed)</title>
      <context>
        `useOmniSearch.ts` already has a 120 ms debounce, a 50-entry cache (LRU fixed in #1012) and in-flight dedupe, and gap-expanded answers are cached under the typed key. The gap map is server-only (DB-backed, 60 s TTL), so the client has nothing to resolve. Do not build a new layer. Reopen only with a measured latency problem: a number plus its basis.
      </context>
    </objective>
  </next_horizon_backlog>

  <verification_gates mandatory_before_commit="true">
    <gate order="1" command="lsof -ti:3000 -ti:5175">Verify 0 background processes listening (and check shared checkout `git status -sb` / `git reflog -5` / `git worktree list` first).</gate>
    <gate order="2" command="bun run verify:static">All 13 static gates must pass, run one by one with a per-step exit marker: 0 TS errors, 0 ESLint errors, lint-debt tracked &lt;= 1219, assertion sites &lt;= 2570 (non-null &lt;= 564), casts &lt;= 147, declined pool &lt;= 4595, loose optionality &lt;= 145, prefer-nullish &lt;= 269, bare-json production &lt;= 6 (total &lt;= 15), testOnly &lt;= 3, scriptOnly &lt;= 22, dead-modules = 0. Read log content, not the wrapper exit status.</gate>
    <gate order="3" command="bun run test &amp;&amp; python3 -m pytest backend/tests/test_migration_names.py">Jest must stay at or above the floor of 671 passed suites / 7,640 passed tests (6 suites and 66 tests skipped), and the 16 Python migration assertions must pass.</gate>
    <gate order="4" command="bun run build">Production build and all 11 route bundle ceilings in `scripts/check-route-sizes.cjs` must pass. The pre-push hook does not build, so run this yourself before opening the PR.</gate>
    <gate order="5" command="adversarial review">Before committing, two read-only reviewers on different lenses; before claiming a number, state whether it is real repair or scope exit.</gate>
  </verification_gates>

</session_handoff>
