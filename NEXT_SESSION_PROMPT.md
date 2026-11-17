<session_handoff version="5.11" date="2026-11-17">

  <metadata>
    <repository>/Users/cookingwithcastro/Desktop/WhatToEatNext-master</repository>
    <base_branch commit="37509357">master</base_branch>
    <hardware_profile>Apple Silicon M5 / 16 GB Unified Memory</hardware_profile>
    <runtime_policy>Bun-strict (`bun run ...`, `bunx ...`, `bun --bun run dev`). Never invoke npm or npx for project scripts.</runtime_policy>
  </metadata>

  <boot_sequence mandatory="true">
    <step order="1" name="process_hygiene">
      In the SHARED checkout (`/Users/cookingwithcastro/Desktop/WhatToEatNext-master`), before touching anything, run `lsof -ti:3000 -ti:5175`, `git status -sb`, `git reflog -5`, and `git worktree list`. Other tools and sessions (Codex, Antigravity, IDE, Claude) may work concurrently: treat any dirty file, running dev server, or branch you did not create as someone else's, and do not touch its index or files. Keep the shared checkout clean on `master` (fast-forwarded or checked against `origin/master`), and verify `~/Desktop` / swap load (`~/.gemini/config/skills/process-hygiene/scripts/cleanup-servers.sh --dry-run`) before heavy lint/verify runs on 16 GB RAM.
    </step>
    <step order="2" name="own_worktree">
      Cut new feature/fix work cleanly in a branch or isolated worktree off `origin/master`. For isolated worktrees OUTSIDE `~/Desktop` (iCloud) and outside `.claude/` or `.worktrees/` (Jest ignores those): `mkdir -p ~/wten-work &amp;&amp; git fetch origin master &amp;&amp; git worktree add ~/wten-work/&lt;name&gt; -b &lt;branch&gt; origin/master`, symlink `node_modules` (`[ -e node_modules ] || ln -s /Users/cookingwithcastro/Desktop/WhatToEatNext-master/node_modules node_modules`), and copy the three git-ignored `.husky/_/` files (`h`, `.gitignore`, `pre-commit`) so the `pre-commit` hook runs. Use `git -C &lt;worktree&gt;` or absolute paths in shell commands.
    </step>
    <step order="3" name="branch_first_rule">
      NEVER commit directly to `master` or run `git push origin master`. GitHub ruleset `GH013` requires status checks via PR (`Verify`, `Build`, `Test`, `rust`). Stage by explicit path (or verify `git status` shows only intended files before staging); `bun run check:untracked` fails if untracked `.ts`/`.tsx` files exist under `src/` or `scripts/`. Paths containing `[brackets]` or `(parens)` need literal pathspecs: `git add -- ':(literal)src/app/recipes/[recipeId]/page.tsx'`.
    </step>
    <step order="4" name="no_reaudit_rule">
      Do NOT re-audit, re-seed, or re-test items recorded inside `&lt;completed_state&gt;` unless directly broken by new work. Treat them as validated baseline truth.
    </step>
    <step order="5" name="cleanup_when_it_lands">
      When a PR merges: remove any temporary worktree (`unlink &lt;worktree&gt;/node_modules` first without trailing slash, then `git worktree remove &lt;worktree&gt;`), delete the merged local branch (`git branch -D &lt;branch&gt;`), and leave unrelated active worktrees untouched (`~/.codex/worktrees/*`, `.claude/worktrees/*`, `~/Desktop/wten-rpc-fix`, and `~/wten-work/session-5-11` while PR `#1026` remains open). Never delete a remote branch with `git push --delete` (triggers slow pre-push verify); use `gh api -X DELETE repos/gregcastro23/WhatToEatNext/git/refs/heads/&lt;branch&gt;` if GitHub did not auto-delete on merge.
    </step>
  </boot_sequence>

  <hard_invariants>
    <invariant id="database_migrations" mandatory="true">
      Deployment runners (`scripts/migrate.ts` and `backend/scripts/run_init_migrations.py`) read `database/init/*.sql` exclusively, sorting by integer prefix `(int(prefix), filename)` and tracking applied filenames in `_migrations`. Currently `database/init/` contains `100-search-zero-result-gaps.sql`, `100-viewer-session-tracking.sql`, `101-cosmic-generation-operations.sql`, `101-traffic-indexes-and-retention.sql`, `102-session-feedback.sql`, `103-clean-ref-tags-and-interaction-index.sql`, and `104-session-feedback-status.sql` (note: prefixes `100` and `101` are shared, and `102`-`104` from `#1025` are not mirrored in `src/lib/database/migrations/`). NEVER rename files already applied on Railway Postgres (`_migrations` keys by exact filename). **The next new migration MUST be numbered `105-*.sql`**, must be idempotent, and must pass `python3 -m pytest backend/tests/test_migration_names.py`.
    </invariant>
    <invariant id="birth_instant_and_zodiac_contract" mandatory="true">
      Always treat `&lt;input type="datetime-local"&gt;` birth inputs as birthplace wall-clock time via `wallClockInputToIso` / `isoWallClockToDatetimeLocal` (`src/utils/astrology/ianaZone.ts` / `birthTimezone.ts`); NEVER convert naive inputs through `new Date(raw).toISOString()` or `Intl.DateTimeFormat().resolvedOptions().timeZone`. Resolve coordinates-derived IANA zones (`resolveBirthZone`) and `utcInstant` (`enrichBirthDataWithInstant`), refuse fabricated Fallback NY (`40.7498, -73.7976`) and `(0, 0)` pins (`422`), query the ephemeris at `utcInstant ?? dateTime`, evaluate `isSectDiurnalForBirth` against full `birthData` (wall clock), normalize case-variant `ZodiacSignType` keys via `lookupZodiacElement` (`src/utils/planetaryAlchemyMapping.ts`), and persist both `natal_positions` and migration 76 temporal columns (`birth_local_wall_time`, `birth_true_utc_instant`, `birth_timezone`, `birth_timezone_basis`, `birth_instant_migrated_at`) via `userDatabase.updateUserProfile`. Keep ESMS quantities (`Spirit`, `Essence`, `Matter`, `Substance`) strictly orthogonal to classical elements (`Fire`, `Water`, `Earth`, `Air`).
    </invariant>
    <invariant id="client_bundle_isolation" mandatory="true">
      Never import full static ingredient catalogs, USDA portion tables, or server database modules into `"use client"` components. Enforce all route bundle ceilings in `scripts/check-route-sizes.cjs`.
    </invariant>
    <invariant id="static_ratchets" mandatory="true">
      The committed baseline JSON files are the source of truth; never hand-edit them — lock improvements only via `bun run lint:debt:ratchet` and `bun scripts/checkBareJsonCasts.ts --ratchet` before committing, then `git add` the updated JSONs. Pass an absolute path outside the repo when calling `bun scripts/auditDeadModules.ts --json &lt;abs-path&gt;`. On `master` `37509357`: `.bare-json-casts-baseline.json` is at `0` production (`9` test casts in 4 allowlisted test files); `.read-json-baseline.json` is at `0` unvalidated (`220` total calls); `.route-validation-baseline.json` is at `0` unvalidated (`133` body-reading routes / `294` total routes); `.lint-debt-baseline.json` sits at `trackedTotal: 1215`, `casts: 147`, `assertionSites: 2560`, `looseOptionality: 145`, `preferNullishCoalescing: 269`, `declined: 4595`, while live `checkLintDebt.ts` on `37509357` ALREADY measures lower (`trackedTotal: 1193`, `casts: 126` [`asAny: 33`, `asUnknownAs: 93`], `assertionSites: 2524` [`single: 2398`], `looseOptionality: 142` [`domain: 74`, `wire: 68`], `preferNullishCoalescing: 266`, `UNREACHABLE (dead): 0`). New and modified files should stay under 300 lines (pure parsers &lt; 250 lines, functions &lt; 50 lines) with zero new `as` casts or `!` non-null assertions (`check:diff-assertions`, `exactOptionalPropertyTypes: true`).
    </invariant>
    <invariant id="wire_parser_rules">
      When adding or updating `readJson(res, parseX)` / `safeReadJson(res, fallback, parseX)` wire parsers: mirror optionality from the producing route/service and cite `file:line`; preserve unmodeled pass-through keys when the host forwards or exports objects whole; keep early `!res.ok` checks ahead of parsing and use never-throwing parsers for side-effecting POSTs; throw if rows arrived and all were malformed; forbid `as`, `!`, and `any`; validate against `JSON.parse("null")`, non-finite `1e999`, real producer shapes, and mutation tests (`*.guards.test.ts`).
    </invariant>
    <invariant id="hooks_push_and_gates" mandatory="true">
      `pre-commit` runs `next typegen` + `tsc` (`bun run typecheck`) + `lint:changed`. `pre-push` runs `bun run verify` (`verify:static` + full Jest suite; ~15–20 min under load) and does NOT run `next build`: run `bun run build` (and `scripts/check-route-sizes.cjs`) yourself before opening a code PR (docs-only PRs need no build; state so in the PR body). Never use `SKIP_VERIFY` unless full `bun run verify` has already passed cleanly on that exact committed tree (`FAST_PUSH=1` skips duplicate verification). Push with SSH keepalive (`CI=true GIT_SSH_COMMAND='ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=40 -o TCPKeepAlive=yes' git push origin "${SHA}:refs/heads/${BR}"`) and verify `gh api repos/gregcastro23/WhatToEatNext/git/ref/heads/&lt;branch&gt; --jq .object.sha`. Note that `scripts/checkLintDebt.ts` enforces `WATCHDOG_MS = 480_000` (8 min): on 16 GB RAM under heavy swap, avoid running concurrent browsers/builds/dev servers during `lint:debt` or `verify`.
    </invariant>
    <invariant id="helper_agents_and_review">
      Keep helper subagents focused (disjoint file lists, explicit worktree paths), verify counts from direct command output, and run an adversarial check before pushing code changes. Preserve the first commit subject cleanly so squash merges match intent.
    </invariant>
    <invariant id="circuit_breaker_and_reconciler">
      All live SpacetimeDB reads must route through `spacetimeCircuitBreaker.ts` with half-open recovery support. All cosmic generation reconcilers must use `FOR UPDATE SKIP LOCKED` and verify matching `token_transactions` debit legs before refunding.
    </invariant>
    <invariant id="hermetic_cauldron_fidelity">
      Hermetic Cauldron operations must honor autogenous saturation ceilings ($P_{autogenous}(T) = P_{air}(T) + p_{sat}(T)$), headspace saturation convergence, dome reflux ratios, and continuous Arrhenius transformation kinetics across all 7 operations (*Opus Culinaris*).
    </invariant>
  </hard_invariants>

  <completed_state do_not_reaudit="true">
    <track id="1-14" name="Foundation Hardening Through PR #1021 (b0ed24f1)">
      <item>Completed client bundle reductions across 11 budgeted routes, IF97 steam physics &amp; *Vas Hermeticum* simulator (`cauldronTransformation.ts`), `@alchm/mcp-server@1.6.0` (14 tools incl. `simulate_hermetic_cauldron`), Omnibar Phase 7 search-gap expansion &amp; LRU cache, SpacetimeDB half-open circuit breaker, durable cosmic operation reconciler (`100-search-zero-result-gaps.sql`, `101-cosmic-generation-operations.sql`), `tests/helpers/tsconfig.json` (`check:helpers-typecheck`), deletion of the legacy `src/calculations/` hub (14 modules), and wire-parser ratcheting from 66 down to 4 production bare-json casts.</item>
    </track>
    <track id="15" name="Method Recommender Fix &amp; Final Bare-JSON Closure (PR #1023 25e89776, PR #1024 8459d4b0)">
      <item>Fixed `NaN` harmony index and `_entropy`/`_reactivity` field mismatch in the cooking method recommender (`EnhancedCookingMethodRecommender.tsx`, `methodRecommendation.ts`, `resonanceGapScoring.ts`), eliminating 21 chained casts across `src/data/cooking/methods/**` and 2 single casts in `methodRecommendation.ts`.</item>
      <item>Converted the remaining 4 production bare-json sites (`4 -&gt; 0` production; `9` test-only remain across 4 allowlisted test files): `AlchemicalStatisticsContext.tsx`, `LivePriceTicker.tsx`, `profile/[userId]/page.tsx`, and `generated-recipe/[id]/page.tsx`. Split external agent `dominantElement` (`Fire|Water|Earth|Air`) cleanly from `dominantAlchemicalQuantity` (`Spirit|Essence|Matter|Substance`) in `src/app/api/users/[userId]/route.ts` and `agentProfileParser.ts`.</item>
    </track>
    <track id="16" name="Thermodynamics, Baking Lab &amp; Behavioral Admin SSE Monitor (PR #1027 ed5391fe, #1028 6abde96e, #1029 956ea926, #1025 c5d6df39)">
      <item>PR `#1027`: Fixed `evaporativeFlux` to drive from partial pressure at film temperature across Rust `crates/thermo-core`, WASM binary/manifest, and `src/lib/cooking/boundaryNetwork.ts`.</item>
      <item>PR `#1028` &amp; `#1029`: Shipped `/kitchen-lab/baking` physics/chemistry simulator (`src/lib/baking/**`, `src/app/(alchm)/kitchen-lab/baking/**`, `src/data/baking/**`) and integrated the site's recipe catalog via `public/data/baking-recipe-catalogue.json` (`scripts/generate-baking-catalogue.ts`).</item>
      <item>PR `#1025`: Upgraded ingredient-first menu planning (`FastStartCard.tsx`, `ContextChips.tsx`, `ingredientFirstPlanning.test.ts`), fixed `/recipes/[recipeId]` SSR dynamic-usage &amp; schema/nullability crashes (`risottoSsrRegression.test.ts`), and built `/admin` SSE live stream (`/api/admin/stream`, `useAdminLiveStream.ts`), `AdminCommandPalette.tsx` (⌘K), `/admin/traffic` behavioral journeys + frustration/CWV/cohort/feedback triage, and migrations `100-104` in `database/init/`.</item>
    </track>
    <track id="17" name="New-User Login, Onboarding &amp; True Birth-Instant Resolution (PR #1030 37509357)">
      <item>Added `wallClockInputToIso` / `isoWallClockToDatetimeLocal` (`ianaZone.ts`) and `enrichBirthDataWithInstant` (`birthTimezone.ts`); extended `BirthDataSchema` (`utcInstant`, `timezoneBasis`) and `IgniteRequestSchema` (`latitude`, `longitude`, `timezone`).</item>
      <item>Updated `/api/agent-forge/ignite`, `/api/onboarding`, `/api/user/{profile,charts,commensals}`, and `userDatabase.updateUserProfile` to accept verified client pins, refuse Fallback NY / `(0, 0)` with `422`, resolve coordinates-derived IANA timezones + `utcInstant`, compute charts at `utcInstant ?? dateTime`, persist `natal_positions` + migration 76 temporal columns, and set `onboarding_completed=1`.</item>
      <item>Fixed lowercase `ZodiacSignType` fallback (`ELEMENT_BY_ZODIAC_SIGN` / `lookupZodiacElement`) and `getDominantElement` return typing in `src/utils/planetaryAlchemyMapping.ts` (removing `as Element` casts in `ChartComparisonService`, `groupNatalChartService`, `natalChartService`); wired `AuthHandshake` (`AuthFollowups.tsx`), `/login`, `SignInModal`, `LocationSearch`, `/onboarding`, `/profile` (`BirthDataScreen`, `ProfileSettingsPanel`, `onboardingApi`, `useProfileManagement`), `NatalTransitChart`, and `ProfileHeroCard`.</item>
      <item>Verified full `bun run verify` on final commit (`VERIFY_RC=0`): 14 `verify:static` gates, `test:gates` (`18/18` suites, `297/297` tests), main Jest (`722 passed, 6 skipped` of `728` suites; `9,384 passed, 66 skipped` of `9,450` tests), and `16/16` Python migration tests.</item>
    </track>
  </completed_state>

  <next_horizon_backlog priority_ordered="true">
    <objective priority="P1" id="reconcile_pr_1026_and_ratchet_baselines">
      <title>Reconcile Open PR #1026 &amp; Ratchet Uncommitted Lint-Debt Gains on Master</title>
      <context>
        Two maintenance items sit directly on `origin/master` (`37509357`):
        (1) Open PR `#1026` (`refactor/handoff-v5-11-and-diagnostics`, worktree `~/wten-work/session-5-11`, `10/10` CI green, sits 5 commits behind `master` at `8459d4b0`) adds `safeReadJson(res, { wasExisting: false }, parseLikeCustomRecipeResponse)` on the custom-recipe Like POST (`src/app/(alchm)/generated-recipe/[id]/page.tsx:238`), adds `issues: string[]` partial-drift `_logger.error` reporting to `AlchemicalStatisticsContext` and `LivePriceTicker`, and touches `NEXT_SESSION_PROMPT.md` + `.lint-debt-baseline.json`.
        (2) On `master` `37509357`, `.lint-debt-baseline.json` has unratcheted slack from `#1023`, `#1025`, and `#1030`: `trackedTotal` dropped `1215 -&gt; 1193` (`-22`), `casts` dropped `147 -&gt; 126` (`-21`), `assertionSites` dropped `2560 -&gt; 2524` (`-36`, `single`: `2413 -&gt; 2398`), `looseOptionality` dropped `145 -&gt; 142` (`-3`), and `preferNullishCoalescing` dropped `269 -&gt; 266` (`-3`).
        (3) On `37509357` `master` push CI, `No fabricated monica fallbacks` (`44098829001`, rerun requested) and `checks (Build)` (`44098829014`) hit transient `bun install --frozen-lockfile` `@next/swc-linux-x64-*` tarball extraction errors (exit `127`).
      </context>
      <deliverables>
        <item>Verify `#1030` `master` CI (`44098829001` &amp; `44098829014`) reaches green after rerun.</item>
        <item>Rebase or port PR `#1026`'s 3 code/diagnostic hunks (`generatedRecipeParser.ts`, `alchemicalStatisticsParser.ts`, `priceIndexParser.ts` + hosts + tests) cleanly onto current `master` (resolving conflicts on `NEXT_SESSION_PROMPT.md` / `.lint-debt-baseline.json`), or merge after rebasing.</item>
        <item>Run `bun run lint:debt:ratchet` and commit the tightened `.lint-debt-baseline.json` so baseline files match live counts.</item>
      </deliverables>
    </objective>

    <objective priority="P1" id="resolve_migration_dual_home_and_prefix_drift">
      <title>Reconcile `database/init/` vs `src/lib/database/migrations/` &amp; `100-`/`101-` Prefix Collision</title>
      <context>
        `database/init/` now holds `100-search-zero-result-gaps.sql`, `100-viewer-session-tracking.sql`, `101-cosmic-generation-operations.sql`, `101-traffic-indexes-and-retention.sql`, `102-session-feedback.sql`, `103-clean-ref-tags-and-interaction-index.sql`, and `104-session-feedback-status.sql`. Meanwhile `src/lib/database/migrations/` only has `100-search-zero-result-gaps.sql` and `101-cosmic-generation-operations.sql` (neither `scripts/migrate.ts` nor `backend/scripts/run_init_migrations.py` reads `src/lib/database/migrations/`), and `backend/tests/test_migration_names.py` checks regex syntax rather than uniqueness of prefixes &gt;= `100`.
      </context>
      <deliverables>
        <item>Without renaming files already tracked in production `_migrations`, establish one canonical source-of-truth rule (either mirror `102-104` into `src/lib/database/migrations/` or retire that unused mirror directory cleanly) and add a CI/pytest check in `backend/tests/test_migration_names.py` forbidding duplicate numeric prefixes for new migrations `&gt;= 105`.</item>
      </deliverables>
    </objective>

    <objective priority="P1" id="prod_birth_instant_backfill_and_smoke">
      <title>Run Production Birth-Instant Backfill Audit &amp; Live Smoke Walkthrough (`#1025` + `#1030`)</title>
      <context>
        PR `#1030` fixes live ingestion for new/updated users, while pre-`#1030` human accounts in Railway Postgres may still hold naive wall-clock timestamps without `birth_true_utc_instant`, `birth_timezone`, or populated `natal_positions`. Additionally, live production smoke verification of both `#1030` (login -&gt; onboarding -&gt; profile birth summary) and `#1025` (`/?ref=prod-smoke&amp;variant=hero_v2` -&gt; `/admin` SSE stream -&gt; `/admin/traffic` feedback triage + optional `ADMIN_ALERT_WEBHOOK_URL`) completes end-to-end rollout confidence.
      </context>
      <deliverables>
        <item>Run `bun scripts/backfillBirthInstant.ts` in dry-run mode against `DATABASE_URL` (`ALCHM_MCP_BACKEND_URL=https://alchm.kitchen` or `--zones-only`), inspect planned deltas carefully, and apply once validated.</item>
        <item>Verify live production auth/onboarding (`/login` -&gt; `/auth/establishing` -&gt; `/onboarding` -&gt; `/profile` timezone pill and non-uniform elemental balance) and admin behavioral telemetry (`/?ref=prod-smoke&amp;variant=hero_v2`, `/admin`, `/admin/traffic`, `/recipes/[recipeId]`) cleanly in an incognito browser session.</item>
      </deliverables>
    </objective>

    <objective priority="P2" id="route_bundle_ceilings_and_lab_wiring">
      <title>Expand Route Bundle Ceilings (`Baking Lab`, `/onboarding`, `/admin/traffic`) &amp; Wire `/lab` Thermal Solver</title>
      <context>
        `scripts/check-route-sizes.cjs` currently budgets `11` routes calibrated on `20346bc9`, before `/kitchen-lab/baking` (`#1028`/`#1029` + `public/data/baking-recipe-catalogue.json`), `/onboarding` updates (`#1030`), and `/admin/traffic` (`#1025`) landed. Separately, `docs/design/lab-solver-stitch-prompt.md` documents the UI wiring plan for the `/lab` 5-step thermal solver (`Solver · Boundaries · Volumetrics · Reference`).
      </context>
      <deliverables>
        <item>Run `bun run build` and add measured First Load / route ceilings in `scripts/check-route-sizes.cjs` for `/kitchen-lab/baking`, `/onboarding`, and `/admin/traffic`.</item>
        <item>Implement/wire `/lab` thermal solver tabs (`Solver · Boundaries · Volumetrics · Reference`) against the existing Rust/WASM/TS physics engine.</item>
      </deliverables>
    </objective>

    <objective priority="P2" id="workspace_cleanup_and_ci_stability">
      <title>Prune Merged Worktrees &amp; Harden CI `bun install` Resilience</title>
      <context>
        Merged PR branches/worktrees remain under `~/wten-work/` (`baking-catalogue` from `#1029`, `baking-lab` from `#1028`, `evap-driving-force` from `#1027`). Meanwhile `.github/workflows/ci.yml` and `.github/workflows/monica-integrity.yml` occasionally fail on `bun install --frozen-lockfile` due to transient `@next/swc-linux-x64-*` tarball extraction errors on GitHub runners.
      </context>
      <deliverables>
        <item>Inspect and safely remove merged `~/wten-work/{baking-catalogue,baking-lab,evap-driving-force}` worktrees (never touching `.codex/worktrees/*`, `.claude/worktrees/*`, or unmerged `~/wten-work/session-5-11`).</item>
        <item>Add retry/cache hardening around `bun install --frozen-lockfile` in `.github/workflows/ci.yml` and `monica-integrity.yml`.</item>
      </deliverables>
    </objective>

    <objective priority="P3" id="optional_cleanup">
      <title>Optional Legacy `"Spirit"`-as-Element &amp; ESLint Warning Reduction (Ask Operator First)</title>
      <context>
        Do not start without explicit operator prioritization:
        (1) Call sites outside `users/[userId]` still referencing `"Spirit"` in element unions or fallbacks: `scripts/sync-agentic-users.ts:300-303`, `src/app/api/internal/agent-sync/route.ts:55`, `src/app/api/recipes/[recipeId]/critique/route.ts:202`, `src/components/profile/AgentsPane.tsx:56`, `src/components/time-laboratory/planetary-agent-chat.tsx:79`, `src/app/(alchm)/profile/[userId]/AgentProfile.tsx:624`.
        (2) Pre-existing ESLint warnings (`118` in `src/`, `23` in `scripts/`).
      </context>
    </objective>

    <objective priority="CLOSED" id="remaining_bare_json_sites">
      <title>Production Bare JSON Casts (closed at `0` by `#1024`)</title>
      <context>Production bare-json casts remain at `0` (`9` allowlisted test casts across 4 test files). Note: `#1026` also converts the uncounted Like POST cast at `src/app/(alchm)/generated-recipe/[id]/page.tsx:238`.</context>
    </objective>
    <objective priority="CLOSED" id="test_only_decision">
      <title>Remaining 3 `testOnly` Modules (closed)</title>
      <context>`testOnly` is `3` (`cryptoPromo.ts`, `agentResponseSchemas.ts`, `sacred-7-stats.ts`). Do not delete.</context>
    </objective>
    <objective priority="CLOSED" id="relocated_helpers_typecheck">
      <title>`tests/helpers/**` Typecheck Gate (closed by `#1021` / `#1024`)</title>
      <context>`bun run check:helpers-typecheck` passes with `0` errors across `tests/helpers/tsconfig.json`.</context>
    </objective>
    <objective priority="CLOSED" id="repin_lost_hub_coverage">
      <title>Re-Pin Coverage Lost With Calculations Hub (closed by `#1021`)</title>
      <context>Pinned by `src/services/__tests__/planetaryScoring.browser.test.ts` and `src/__tests__/physics/esmsConformance.test.ts`.</context>
    </objective>
    <objective priority="CLOSED" id="search_gaps_auto_suggest_debouncer">
      <title>Omnibar Zero-Result Auto-Expansion Latency (closed by `#1012`)</title>
      <context>`useOmniSearch.ts` uses 120 ms debounce, 50-entry LRU cache, and in-flight dedupe.</context>
    </objective>
  </next_horizon_backlog>

  <verification_gates mandatory_before_commit="true">
    <gate order="1" command="lsof -ti:3000 -ti:5175 &amp;&amp; git status -sb &amp;&amp; git worktree list">Verify no unintended server listeners or cross-session workspace conflicts before starting.</gate>
    <gate order="2" command="bun run verify:static">All 14 static gates must pass (`check:untracked`, `check:route-validation` `0` unvalidated, `check:read-json` `0` unvalidated, `check:bare-json` `0` prod, `check:diff-assertions` `0` new casts, `check:snapshot-witness` `100%`, `test:gates`, `check:scripts`, `check:helpers-typecheck`, `typecheck`, `lint`, `lint:scripts`, `lint:debt`, `audit:dead-modules` `0` unreachable). Keep live metrics at or below `37509357`: `trackedTotal &lt;= 1193`, `casts &lt;= 126`, `assertionSites &lt;= 2524` (`nonNull &lt;= 564`), `looseOptionality &lt;= 142`, `preferNullish &lt;= 266`, `declined &lt;= 4595`; ratchet `.lint-debt-baseline.json` in P1 so baseline files enforce these ceilings.</gate>
    <gate order="3" command="bun run test --passWithNoTests &amp;&amp; python3 -m pytest backend/tests/test_migration_names.py">Jest must remain at or above the `37509357` floor (`722` passed suites / `9,384` passed tests; `6` env-gated suites / `66` tests skipped), plus `16/16` Python migration tests passing.</gate>
    <gate order="4" command="bun run build">Production build and all `scripts/check-route-sizes.cjs` route ceilings must pass for any non-doc code change (docs-only PRs need no build; state explicitly in the PR body).</gate>
    <gate order="5" command="adversarial review">Review diff on correctness/security and regression lenses before pushing; verify clean working tree and PR CI status.</gate>
  </verification_gates>

</session_handoff>
