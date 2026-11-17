<session_handoff version="5.12" date="2026-11-17">

  <metadata>
    <repository>/Users/cookingwithcastro/Desktop/WhatToEatNext-master</repository>
    <base_branch commit="139df355">master</base_branch>
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
      When a PR merges: remove any temporary worktree (`unlink &lt;worktree&gt;/node_modules` first without trailing slash, then `git worktree remove &lt;worktree&gt;`), delete the merged local branch (`git branch -D &lt;branch&gt;`), and leave unrelated active worktrees untouched (`~/.codex/worktrees/*`, `.claude/worktrees/*`, `~/Desktop/wten-rpc-fix`). Never delete a remote branch with `git push --delete` (triggers slow pre-push verify); use `gh api -X DELETE repos/gregcastro23/WhatToEatNext/git/refs/heads/&lt;branch&gt;` if GitHub did not auto-delete on merge.
    </step>
  </boot_sequence>

  <hard_invariants>
    <invariant id="database_migrations" mandatory="true">
      Deployment runners (`scripts/migrate.ts` and `backend/scripts/run_init_migrations.py`) read `database/init/*.sql` exclusively (the unused `src/lib/database/migrations/` mirror was retired in `#1032`), sorting by integer prefix `(int(prefix), filename)` and tracking applied filenames in `_migrations`. Historical shared prefixes `100` (`100-search-zero-result-gaps.sql`, `100-viewer-session-tracking.sql`) and `101` (`101-cosmic-generation-operations.sql`, `101-traffic-indexes-and-retention.sql`) are already applied on Railway Postgres (`111` total applied migrations including `100`-`104`) and MUST NEVER be renamed. `backend/tests/test_migration_names.py` (`UNIQUE_PREFIX_FLOOR = 105`) enforces unique prefixes `&gt;= 105` and verifies `database/init/` is the sole migration directory (`23/23` Python migration tests). **The next new migration MUST be numbered `105-*.sql`**, must be idempotent, and must pass `python3 -m pytest backend/tests/test_migration_names.py backend/tests/test_run_init_migrations.py`.
    </invariant>
    <invariant id="birth_instant_and_zodiac_contract" mandatory="true">
      Always treat `&lt;input type="datetime-local"&gt;` birth inputs as birthplace wall-clock time via `wallClockInputToIso` / `isoWallClockToDatetimeLocal` (`src/utils/astrology/ianaZone.ts` / `birthTimezone.ts`); NEVER convert naive inputs through `new Date(raw).toISOString()` or `Intl.DateTimeFormat().resolvedOptions().timeZone`. Resolve coordinates-derived IANA zones (`resolveBirthZone`) and `utcInstant` (`enrichBirthDataWithInstant`), refuse fabricated Fallback NY (`40.7498, -73.7976`) and `(0, 0)` pins (`422`), query the ephemeris at `utcInstant ?? dateTime`, evaluate `isSectDiurnalForBirth` against full `birthData` (wall clock), normalize case-variant `ZodiacSignType` keys via `lookupZodiacElement` (`src/utils/planetaryAlchemyMapping.ts`), and persist both `natal_positions` and migration 76 temporal columns (`birth_local_wall_time`, `birth_true_utc_instant`, `birth_timezone`, `birth_timezone_basis`, `birth_instant_migrated_at`) via `userDatabase.updateUserProfile`. Keep ESMS quantities (`Spirit`, `Essence`, `Matter`, `Substance`) strictly orthogonal to classical elements (`Fire`, `Water`, `Earth`, `Air`).
    </invariant>
    <invariant id="client_bundle_isolation" mandatory="true">
      Never import full static ingredient catalogs, USDA portion tables, or server database modules into `"use client"` components. Enforce all `14` route bundle ceilings in `scripts/check-route-sizes.cjs` (including `/kitchen-lab/baking`, `/onboarding`, and `/admin/traffic` added in `#1033`).
    </invariant>
    <invariant id="static_ratchets" mandatory="true">
      The committed baseline JSON files are the source of truth; never hand-edit them — lock improvements only via `bun run lint:debt:ratchet` and `bun scripts/checkBareJsonCasts.ts --ratchet` before committing, then `git add` the updated JSONs. Pass an absolute path outside the repo when calling `bun scripts/auditDeadModules.ts --json &lt;abs-path&gt;`. On `master` `139df355`: `.bare-json-casts-baseline.json` is at `0` production (`9` test casts across `4` allowlisted test files); `.read-json-baseline.json` is at `0` unvalidated (`221` total calls); `.route-validation-baseline.json` is at `0` unvalidated (`133` body-reading routes / `294` total routes); `.lint-debt-baseline.json` (ratcheted in `#1026`) sits at `trackedTotal: 1193`, `casts: 126` (`asAny: 33`, `asUnknownAs: 93`, `production: 94`, `test: 32`), `assertionSites: 2523` (`chained: 93`, `single: 2397`, `production: 1936`, `test: 587`, `nonNull: 564`), `looseOptionality: 142` (`domain: 74`, `wire: 68`), `preferNullishCoalescing: 266`, `declined: 4595`, while live `checkLintDebt.ts` on `139df355` measures `nonNull: 562` (`-2`), `looseOptionality: 141` (`73` domain, `68` wire; `-1`), `declined: 4592` (`-3`), and `UNREACHABLE (dead): 0`. New and modified files should stay under 300 lines (pure parsers &lt; 250 lines, functions &lt; 50 lines) with zero new `as` casts or `!` non-null assertions (`check:diff-assertions`, `exactOptionalPropertyTypes: true`).
    </invariant>
    <invariant id="wire_parser_rules">
      When adding or updating `readJson(res, parseX)` / `safeReadJson(res, fallback, parseX)` wire parsers: mirror optionality from the producing route/service and cite `file:line`; preserve unmodeled pass-through keys when the host forwards or exports objects whole; keep early `!res.ok` checks ahead of parsing and use never-throwing parsers for side-effecting POSTs; throw if rows arrived and all were malformed; forbid `as`, `!`, and `any`; validate against `JSON.parse("null")`, non-finite `1e999`, real producer shapes, and mutation tests (`*.guards.test.ts`).
    </invariant>
    <invariant id="hooks_push_and_gates" mandatory="true">
      `pre-commit` runs `next typegen` + `tsc` (`bun run typecheck`) + `lint:changed`. `pre-push` runs `bun run verify` (`verify:static` + full Jest suite; ~15-20 min under load) and does NOT run `next build`: run `bun run build` (and `scripts/check-route-sizes.cjs`) yourself before opening a code PR (docs-only PRs need no build; state so in the PR body). Never use `SKIP_VERIFY` unless full `bun run verify` has already passed cleanly on that exact committed tree (`FAST_PUSH=1` skips duplicate verification). Push with SSH keepalive (`CI=true GIT_SSH_COMMAND='ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=40 -o TCPKeepAlive=yes' git push origin "${SHA}:refs/heads/${BR}"`) and verify `gh api repos/gregcastro23/WhatToEatNext/git/ref/heads/&lt;branch&gt; --jq .object.sha`. Note that `scripts/checkLintDebt.ts` enforces `WATCHDOG_MS = 480_000` (8 min): on 16 GB RAM under heavy swap, avoid running concurrent browsers/builds/dev servers during `lint:debt` or `verify`.
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
      <item>Implemented birthplace wall-clock vs `utcInstant` separation (`ianaZone.ts`, `birthTimezone.ts`), coordinate-derived IANA resolution + `422` refusal on fabricated pins across `/api/{agent-forge/ignite,onboarding,user/profile,user/charts,user/commensals}` &amp; `userDatabase.updateUserProfile`, lowercase `lookupZodiacElement` normalization, and `/login` -&gt; `/auth/establishing` -&gt; `/onboarding` -&gt; `/profile` UI wiring.</item>
    </track>
    <track id="18" name="Handoff v5.11, Like-Recipe Safe JSON, Partial-Drift Logging &amp; Baseline Ratchet (PR #1031 9cc51e3c, PR #1026 d12b8b28)">
      <item>PR `#1031` updated `NEXT_SESSION_PROMPT.md` to `v5.11`. PR `#1026` converted `src/app/(alchm)/generated-recipe/[id]/page.tsx` Like POST parsing to `safeReadJson(res, { wasExisting: false }, parseLikeCustomRecipeResponse)`, added `issues: string[]` partial-drift `_logger.error` logging across `AlchemicalStatisticsContext` and `LivePriceTicker` with fixture tests, and ratcheted `.lint-debt-baseline.json` (`trackedTotal: 1215 -&gt; 1193`, `casts: 147 -&gt; 126`, `assertionSites: 2560 -&gt; 2523`, `looseOptionality: 145 -&gt; 142`, `preferNullishCoalescing: 269 -&gt; 266`).</item>
    </track>
    <track id="19" name="Migration Source Unification, >=105 Prefix Gate &amp; CI Bun Retry Resilience (PR #1032 dc1c7e24)">
      <item>Retired the unused `src/lib/database/migrations/` mirror (`100-search-zero-result-gaps.sql`, `101-cosmic-generation-operations.sql`), added `UNIQUE_PREFIX_FLOOR = 105` collision gating and `test_database_init_is_the_sole_migration_directory()` in `backend/tests/test_migration_names.py` (`23/23` passed with `test_run_init_migrations.py`), and added `scripts/ci-bun-install.sh` + `.github/actions/bun-install/action.yml` (`actions/cache@v6` + 3-attempt retry with clean-cache `--no-cache` fallback) in `.github/workflows/{ci,monica-integrity}.yml`.</item>
    </track>
    <track id="20" name="14-Route Bundle Ceilings &amp; /kitchen-lab/physics Thermal Solver UI (PR #1033 139df355)">
      <item>Expanded `scripts/check-route-sizes.cjs` &amp; `scripts/lib/__tests__/routeSizes.test.ts` to `14` routes adding `/kitchen-lab/baking`, `/onboarding`, and `/admin/traffic`.</item>
      <item>Completed `/kitchen-lab/physics` thermal solver UI wiring (`src/lib/cooking/labSolver.ts`, `SolverControlsPrimitives.tsx`, `SolverInputs.tsx`, `SolverResults.tsx`, `SolverPanel.tsx`, `solver.css`, `SolverPanel.test.tsx`) with `createBoundarySolver()` WASM/TS engine routing, searchable ingredient/FDC picker, `air velocity` / `thermalMassJperK`, `CoreTimeCurve` SVG + `Biot` regime + `medium temp` + `surface h (±25%)`, `SurfaceScale`, condensate-return split bar, and F/C toggle + carryover rest.</item>
    </track>
    <track id="21" name="Production Birth-Instant Backfill (Option A), Chart Geometry Heal, Public Smoke &amp; Worktree Pruning">
      <item>Executed `TZ=UTC ALCHM_MCP_BACKEND_URL=https://alchm.kitchen bun run scripts/backfillBirthInstant.ts --apply` across production Railway Postgres (`6` migratable human rows updated, `52` agent `1900-01-01T12:00:00.000Z` sentinels untouched, `2` `REFUSE_FABRICATED_PIN` accounts `roberttcastro1@gmail.com` &amp; `evan.blockchain@gmail.com` refused for birth-data rewrite while keeping their attested region pins).</item>
      <item>Per operator **Option A**, aligned `gregcastro23@gmail.com` (`ce117d50-e3e3-4c53-8514-69bf8c21fca9`, Brooklyn NY, `1991-06-23T10:24:00` EDT wall clock) to `utcInstant: 1991-06-23T14:24:00.000Z` and healed all `5` `alchemical_constitutions` rows (`2ee5eb05` `Wind Whisperer` `40/33/15/12`, `5f40a6e5` `Solar Forager` `30/18/35/18`, `3de96e89` `Solar Forager` `45/33/11/10`, `5e813bbf` `Lunar Adept` `42/39/12/7`, `ce117d50` `Root Alchemist` `37/33/20/10`) plus all `3` orphan migrated profiles (`57672a00`, `9726fa59`, `32ad3b88`) onto post-`#985` Ascendants, current ESMS engine, `natal_chart` (`11` bodies), and `natal_positions` (`11` bodies).</item>
      <item>Verified post-apply with unmodified `scripts/healConstitutionGeometry.ts --control` (`GATE PASSED`: `5/5` rows bit-exact across all `11` bodies including Ascendant, `0` ESMS drift) and `scripts/backfillBirthInstant.ts` dry run (`control gate: 5/5`, `0` archetype flips).</item>
      <item>Verified unauthenticated public smoke on `https://alchm.kitchen` (`/?ref=prod-smoke&amp;variant=hero_v2` persisted in `page_views`, `/recipes/...` SSR reload `200`, `/login`, `/kitchen-lab/physics`, `/kitchen-lab/baking`, `/admin` redirecting to `/login`), confirmed `master` `139df355` CI runs (`CI` + `Monica Integrity`) green, and pruned all 6 merged temporary worktrees under `~/wten-work/`.</item>
    </track>
  </completed_state>

  <next_horizon_backlog priority_ordered="true">
    <objective priority="P1" id="authenticated_smoke_walkthrough">
      <title>Complete Authenticated Incognito Walkthrough (`#1030` Profile &amp; `#1025` Admin SSE/Traffic)</title>
      <context>
        Unauthenticated public routes passed smoke verification on `https://alchm.kitchen`, while authenticated pages (`/onboarding`, `/profile`, `/admin`, `/admin/traffic`) require an interactive operator login session. Meanwhile two pre-`#1030` accounts (`roberttcastro1@gmail.com` and `evan.blockchain@gmail.com`) remain flagged `REFUSE_FABRICATED_PIN` with the retired Fallback NY literal (`40.7498, -73.7976`) and have no `alchemical_constitutions` row.
      </context>
      <deliverables>
        <item>Operator sign-in in an incognito browser session to `gregcastro23@gmail.com`: verify `/profile` displays `Root Alchemist` (`37/33/20/10`), `Virgo` Ascendant (`150.98°`), `America/New_York` timezone pill, and `1991-06-23 10:24` wall clock; verify `/onboarding` birthplace geocoding &amp; `/admin` SSE live stream (`/api/admin/stream`, ⌘K palette) + `/admin/traffic` feedback triage + optional `ADMIN_ALERT_WEBHOOK_URL`.</item>
        <item>Optionally re-onboard `roberttcastro1@gmail.com` and `evan.blockchain@gmail.com` with verified birthplaces if accurate charts/constitutions are wanted for those accounts.</item>
      </deliverables>
    </objective>

    <objective priority="P2" id="ratchet_pr1033_and_heal_script_ergonomics">
      <title>Lock `#1033` Lint-Debt Slack &amp; Sync `natal_positions` in `healConstitutionGeometry.ts`</title>
      <context>
        Two small hygiene improvements remain after `#1033` and the production geometry heal:
        (1) Live `checkLintDebt.ts` on `139df355` is slightly below `.lint-debt-baseline.json` (`nonNull: 562` vs `564`, `looseOptionality: 141` vs `142`, `declined: 4592` vs `4595`).
        (2) `scripts/healConstitutionGeometry.ts` updates `natal_chart` without regenerating `user_profiles.natal_positions` (`natalPositionsFromStoredChart`), and its `runControl` gate fails if mixed pre-`#985` (Aug 2026) and post-`#985` charts coexist in `alchemical_constitutions` (already healed for all 8 current humans, though worth hardening with `natal_positions` sync and an optional `--control-user &lt;uuid&gt;` flag).
      </context>
      <deliverables>
        <item>Run `bun run lint:debt:ratchet` alongside the next code PR to lock `nonNull: 562`, `looseOptionality: 141`, and `declined: 4592` into `.lint-debt-baseline.json`.</item>
        <item>Update `healRow` / `refreshChartOnly` in `scripts/healConstitutionGeometry.ts` to also persist `natalPositionsFromStoredChart(rebuilt.chart)` into `user_profiles.natal_positions` and add optional `--control-user &lt;uuid&gt;` scoping for future mixed-era audits.</item>
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

    <objective priority="CLOSED" id="closed_tracks_v5_12">
      <title>Closed Foundations (Through `139df355`)</title>
      <context>Production bare-json casts remain at `0` (`9` allowlisted test casts across `4` test files); `testOnly` remains `3` (`cryptoPromo.ts`, `agentResponseSchemas.ts`, `sacred-7-stats.ts`, keep); `check:helpers-typecheck` (`tests/helpers/tsconfig.json`) passes with `0` errors; calculations-hub test coverage is pinned by `planetaryScoring.browser.test.ts` and `esmsConformance.test.ts`; Omnibar uses `120 ms` debounce + 50-entry LRU cache (`#1012`); `#1026`, `#1031`, `#1032`, `#1033`, worktree pruning, and Option A prod birth-instant backfill/geometry heal are landed.</context>
    </objective>
  </next_horizon_backlog>

  <verification_gates mandatory_before_commit="true">
    <gate order="1" command="lsof -ti:3000 -ti:5175 &amp;&amp; git status -sb &amp;&amp; git worktree list">Verify no unintended server listeners or cross-session workspace conflicts before starting.</gate>
    <gate order="2" command="bun run verify:static">All 14 static gates must pass (`check:untracked`, `check:route-validation` `0` unvalidated / `133` body-reading / `294` total, `check:read-json` `0` unvalidated / `221` calls, `check:bare-json` `0` prod / `9` test, `check:diff-assertions` `0` new casts, `check:snapshot-witness` `100%`, `test:gates` `18/18` suites &amp; `297/297` tests, `check:scripts`, `check:helpers-typecheck`, `typecheck`, `lint`, `lint:scripts`, `lint:debt`, `audit:dead-modules` `0` unreachable). Keep live metrics at or below `139df355`: `trackedTotal &lt;= 1193`, `casts &lt;= 126`, `assertionSites &lt;= 2523` (`nonNull &lt;= 562` live / `564` committed), `looseOptionality &lt;= 141` live / `142` committed, `preferNullish &lt;= 266`, `declined &lt;= 4592` live / `4595` committed.</gate>
    <gate order="3" command="bun run test --passWithNoTests &amp;&amp; python3 -m pytest backend/tests/test_migration_names.py backend/tests/test_run_init_migrations.py -q">Jest must remain at or above the `139df355` floor (`723` passed suites / `9,393` passed tests; `6` env-gated suites / `66` tests skipped of `729` suites / `9,459` tests), plus `23/23` Python migration tests passing.</gate>
    <gate order="4" command="bun run build">Production build and all `14` `scripts/check-route-sizes.cjs` route ceilings must pass for any non-doc code change (docs-only PRs need no build; state explicitly in the PR body).</gate>
    <gate order="5" command="adversarial review">Review diff on correctness/security and regression lenses before pushing; verify clean working tree and PR CI status.</gate>
  </verification_gates>

</session_handoff>
