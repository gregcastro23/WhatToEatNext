# Next session — Phase 44: clean WTEN, fix what is measurably wrong, make it the culinary authority

## Mission and ground rules

WTEN (`alchm.kitchen`) is to be the most trustworthy cooking reference on the internet: a verified ingredient, cuisine, and method database, real nutrition, rigorous meal planning, and recipe generation that a generic LLM cannot match because it is checked against our data and physics. This phase makes the codebase fit for that. It deletes, consolidates, and tightens, and it adds exactly two things: an admin Agents pane (target 3) and a recipe pipeline that does not fail (target 6).

**Owner decisions (2026-10-01):**
- **Agent creation belongs in ASOL.** Agent creation, Monica Agent, and the Philosopher's Stone are ASOL's. WTEN removes its copies and hands users off with `getServiceUrlSafe("agentsUi")` (the `src/lib/agents/agentChatUrl.ts` pattern). Do not build new agent schemas, migrations, or proxy routes. This also retires the Phase 43 known limitation (non-atomic `clientRequestId` dedupe in `/api/agents/unified`): the fix is deletion, not an atomic rewrite.
- **Both vessels persist, and neither is to be merged, renamed, or trimmed.** The Kitchen Vessel Ledger (`/api/economy/vessel`, `AlchmVesselKitchen.tsx`) is the ESMS treasury surface. The cooking-vessel registry (`src/data/cooking/vessels.ts`, with `cookwareMaterials.ts`) is the pan-and-geometry physics. They share a word and nothing else.
- **WTEN keeps an admin view of the agent network.** It lives in one Agents pane (target 3).
- **A recipe request should never fail.** Retry, then repair, and refund only when repeated attempts fail (target 6).

**What WTEN keeps for ASOL:** the cross-site contracts in ADR 013, 014, 017 and 018. That means the ESMS token economy, the swapping bridge, the transmutation circle, the Kitchen Vessel Ledger, `sync-*` and `internal/*` routes, and webhooks. ASOL calls these server-to-server, so never remove or reshape one without checking its callers. Try `add_repo`/`list_repos` for the ASOL repo; if you cannot reach it, mark the route unverified and keep it.

**Verification rules:** start from `master` (head `bfa1cde`; PR #933 merged 2026-09-30). Read `docs/PHASE_43_CLOSEOUT.md`, `CONTEXT.md`, and ADRs 013/014/017/018 first. Everything below was measured on `bfa1cde` on 2026-10-01 and is a lead, not a fact: re-measure before acting. Do one target per commit series. If a target cannot be verified, stop, record why, and move on. Ratchet baselines only after measuring the final tree, and only counts that went down.

## 1. Repo hygiene (mechanical, do first, shrinks every later search)

Measured problems at the repo root and in tracked files:

- **`.local/node` is committed: 4,329 files, ~164 MB** (a vendored Node toolchain). Also tracked: `.dev.pid`, `.dev.vars`, `install_log.txt`, and empty `lint_results.json` / `lint_warnings.txt`. `git rm --cached` them and add to `.gitignore`. Do not rewrite history. Also find out why `check:untracked` did not catch this and fix the gate if it should have.
- **Stale session and review docs at the root:** `NEXT_SESSION_LAB_STATS_FIX.md`, `NEXT_SESSION_PROMPT_LAGGING_STRAND.md`, `PHASE16_*_FOR_ANTIGRAVITY.md`, `BEST_MATCH_STITCH_PROMPT.md`, `GEMINI.md`. Move anything still useful into `docs/`, delete the rest.
- **One-off scripts at the root:** `apply_migration_{23,25,45,46}.cjs`. Check whether the migration runner supersedes them, then delete them or move them into `scripts/`.
- **Large or generated artifacts:** `stitch_alchemical_culinary_kinetics/` (15 MB of design exports), `audit-reports/` (generated, and the two reports disagree: 1,101 vs 1,184 ingredients), `.temp-disabled-tests/`, `recipes_database.json` (680 KB at the root, read only by `src/lib/recipes/hscaMealFiling.ts` and `scripts/generateHscaCuisine.ts`), and the empty file `amp`.
- **Config sprawl:** 4 ESLint configs (`eslint.config.{mjs,cjs,fast.mjs,audit.mjs}`), 2 Makefiles, 3 Dockerfiles and 4 compose files, and 5 test roots (`__tests__`, `tests`, `src/__tests__`, `src/tests`, `src/app/__tests__`). Also the stray `src/pages/_error.tsx` in an App Router project. For each, grep `package.json`, CI (`.github`, `.gitlab-ci.yml`), the Dockerfiles, and `jest.config.js` for references before consolidating or deleting. Keep what is referenced.
- `backend/` (Python, 8.4 MB), `crates/`, `mcp-server/`, `spacetime-module/`, and `sweph_ephe/` are separate deployables. Confirm each is WTEN-owned and still wired (CI, Railway, `serviceUrls.ts` `wtenBackend`). Report anything orphaned; do not delete a deployable without the owner.

Done when: tracked file count and repo size drop with the numbers recorded, and `verify:static` is still green.

## 2. Remove ASOL clutter from WTEN

Delete or hand off (classify each as DELETE, HAND OFF, KEEP, or ASK, with the evidence):

- Agent creation and forging: `src/app/api/agents/unified` (create/list/get/chat), `src/app/api/agent-forge/ignite`, `src/app/api/planetary-agents/diet`, `src/app/(alchm)/philosophers-stone/page.tsx` (1,007 lines; its `/api/monica-agent` call has no WTEN route and most likely 404s, so confirm it), `src/app/api/philosophers-stone/positions`, `src/app/(alchm)/profile/[userId]/agent-components` (10 files), and `src/lib/agents` (including `persona/`).

**KEEP, do not touch** (owner decisions above): both vessels; the agent-network admin tooling (`src/components/admin/asol`, `src/app/admin/asol`, `src/app/api/admin/{asol,agents,agent-sync}`, the ASOL and agent services in `src/services`, and the agent crons `agents-daily-yield` and `prewarm-agent-recipes`), which target 3 consolidates; and the economy and sync contracts.

Classify from evidence, do not assume: `src/lib/recipe-nft`, `src/lib/spacetime`, and `src/lib/mcp` (with `mcp-server/`, the `synthetic-mcp` cron, and `/api/account/billing/mcp-top-up`) are probably WTEN (Recipe-NFT mint, live tables, the MCP product). `src/app/admin/chain` and the `chain-reconcile` cron are operator views of on-chain state; keep unless you can show nothing depends on them, and ASK if unsure.

Sequence for anything user-facing: replace the UI with a hand-off link first, then remove the route only after grep shows no remaining caller in `src` or `scripts` and the ASOL repo check (or owner confirmation) shows none there. A route that still has an unverified external caller stays, and you list it as pending. Delete tests, schemas, baselines, and docs that die with the code. Make sure nothing the Agents pane needs (target 3) reads a route you are deleting. Record the lint, cast, assertion, and route-count deltas per deletion; deleting code is the cheapest TypeScript-health gain available.

## 3. Admin Agents pane: connectivity and agent-action health

The operator needs one place to see whether WTEN and ASOL are talking and whether agent actions on the site are healthy. Today the pieces are scattered: `/admin/asol` ("ASOL Health"), `/api/admin/asol`, `/api/admin/agents/{monica,network}`, `/api/admin/agent-sync`, `src/lib/admin/schemas/{agents,asol}.ts`, `asolHealthService`, `agentCreditPathHealth`, `agentDebitPathHealth`, `agentTelemetryService`, and `asolContractProbeService`. Consolidate them into one **Agents** page, not a new parallel one, following the admin conventions in `CLAUDE.md`:

- Every number comes from a live source. Never fabricate; degrade to an honest `live: false` / "no source" state.
- One `GET /api/admin/agents` read through `useAdminResource`, validated by a zod schema in `src/lib/admin/schemas/agents.ts` with a compile-time drift guard against the server type. Services go in `src/services/admin/`. Add a one-line headline to `PulseStrip` (`GET /api/admin/pulse`). Replace the "ASOL Health ✦" nav entry with "Agents" and redirect the old path. Leave "MCP Network" separate.
- **Connectivity:** WTEN to ASOL reachability and latency for `planetaryAgentsApi` and `agentsUi` (via `serviceUrls.ts`), the contract probe results including the 401 negative controls, and inbound delivery health from `webhook_events` for `asol-sync-event`, `asol-feed`, and `asol-agent-recipes`, including signature mode.
- **Agent actions:** per action (credit, debit, sync-transmute, swap, daily yield, recipe prewarm, agent recipe generation) show success, failure, and latency, plus the credit and debit path health already computed. Include the recipe pipeline outcomes from target 6 (attempts, repairs, retries, refunds, final failures) once they exist. Use the same `evaluateHeartbeat` verdicts and cron heartbeats as `/admin/jobs` instead of inventing new thresholds.
- Tests: the schema, the service against fixture rows, and the degraded states (ASOL unreachable, no rows, stale heartbeat). Done when the old page's information is a strict subset of the new one and nothing it showed was dropped without a stated reason.

## 4. TypeScript health (re-measure first)

Measured: 1,293 lint warnings; 2,827 single assertion sites and 598 non-null assertions; 134 `as unknown as`; ~170 `any`; 132 `eslint-disable`; 4 `@ts-ignore`/`@ts-expect-error`. `tsconfig` already has `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess`.

- **Response contracts (carried over).** Four predicate-less `z.custom<T>()` sites remain: `src/hooks/useFoodDiary.ts:155,267` and `src/hooks/useTables.ts:16,20`. (The old subscription/`PremiumContext` site is gone with the retired premium tier, #919.) All four do `parsed.success ? parsed.data : {}`, so a malformed 2xx wipes prior good state (`setTables([])`) and an unreadable 2xx `addEntry` result reads as a failure and invites a duplicate submit. Replace the casts with real schemas covering only the consumed fields. Add a compile-time drift guard against the server type (the `src/lib/admin/schemas/` pattern). Add runtime tests that parse real route-handler output and malformed 2xx payloads. Keep prior good state on an unreadable read, and reconcile and warn on an unreadable mutation. Inspect stored `food_source`, `meal_type`, and serving-unit values before using enums; if production values are unreadable, validate as constrained strings or defer with evidence.
- **Dead and duplicate code that the reachability audit cannot see.** `audit:dead-modules` reports 1 dead module because it counts any tested or app-root-reachable file as alive. Overlapping recommendation and ingredient layers are the real problem. `UnifiedRecommendationService` (1,026 lines), `RecommendationAdapter` (852), and `IngredientFilterService` (797) have no production importer. `RecipeService`, `LocalRecipeService`, `UnifiedRecipeService`, `IngredientService`, and `UnifiedIngredientService` overlap. `src/data/unified/` is ~13k lines parallel to `src/data/{cuisines,ingredients}`. `ingredientRecommender.ts` (3,101 lines) and `EnhancedIngredientRecommender.tsx` (2,868 lines) are the largest hand-written files. Build the real import graph, pick one canonical service per concern, migrate callers, delete the rest. Do not touch the vessel registry or the ledger.
- **Then** attack assertion and `as unknown as` clusters by file (top 10 by count), not by rule. Prefer fixing the type at its source over adding a guard at every use.

Done when: the new schemas replace all four casts (or deferrals are evidenced), the removed services and data layers are gone, and each gate delta is measured and recorded.

## 5. Route efficiency

Measured: 266 route handlers; **240 are `force-dynamic`** and 216 pin the Node runtime; only ~28 files mention `revalidate`, `Cache-Control`, or `unstable_cache`. Vercel crons: 15, of which the 7 synthetic probes make ~23 invocations an hour.

- Classify every read-only catalog or reference route (`cuisines`, `ingredients`, `sauces`, `techniques`, `search`, `zodiac-calendar`, `recipes/featured`, and the like). Drop `force-dynamic` where nothing per-user is read, and give it an explicit `revalidate` or `Cache-Control` where staleness is acceptable. State the freshness budget per route.
- Overlapping clusters to collapse after building a caller map (src, scripts, and ASOL if reachable): the astrology/positions family (`astrological`, `astrologize`, `astrology`, `planetary-positions`, `planetary-rectification`, `alchemize`, `current-moment`) and the recommendation family (`recommendations`, `personalized-recommendations`, `group-recommendations`, `transmutation_recommendations`).
- Page-level duplication to resolve: `(alchm)/recipe-generator`, `(alchm)/cosmic-recipe`, `(alchm)/generated-recipe`, `recipe-builder`, `menu-planner`, `meal-plan`. Keep one flow per user job, redirect the rest (the redirect-parity test in `src/config/__tests__/navigation.redirects.test.ts` guards navigation).
- Reconcile the validation baseline: `.route-validation-baseline.json` says 0 unvalidated, yet 143 route files import neither zod nor `lib/validation`. Determine whether those are input-free GETs; if not, the gate has a blind spot.
- Measure before and after with `scripts/check-route-sizes.cjs` and the cron/observability p95. Do not claim a speedup you did not measure.

## 6. Culinary authority: a recipe pipeline that does not fail, and a verification gate

**Current behavior (verify it):** `/api/generate-cosmic-recipe` debits the ESMS basket (through the swapping bridge), makes **one** call to ASOL/PA `POST /api/generate-recipe` with a 45 s timeout (`PA_TIMEOUT_MS`) under a 60 s `maxDuration`, and checks the result only with `cosmicRecipeSchema`, which validates shape: `quantity` is a free string, ingredient names are never resolved against the ~1,100-ingredient catalog, nutrition is not recomputed, and no step is checked against method physics or food-safety limits. Any PA non-2xx, timeout, or schema mismatch returns 502/504/500 straight to the user. The `finally` block refunds the exact debited basket idempotently (`refundBasketAfterSwap`, key `cosmic_recipe_refund:<groupId>`); the comment in the `catch` saying the debit "returns without refunding" is stale, so fix it. PA also retries once internally.

**Goal:** a user who asks for a recipe gets a correct one. Failure is the rare last resort and costs the user nothing.

1. **Measure first.** From observability and the `synthetic-cosmic-recipe` probe, get PA's real p50/p95 latency and failure classes (timeout, 5xx, malformed, schema drift). Budget attempts against the 60 s limit: two sequential 45 s calls cannot fit, so choose per-attempt deadlines from the measured distribution, or raise this route's `maxDuration` if the plan allows (verify, do not assume).
2. **Verification gate (deterministic, in WTEN).** Run on every result:
   - Resolve each ingredient to a catalog entry (the existing `ingredientRecipeIndex`).
   - Parse quantities to mass or volume with `src/lib/cooking/countToMass.ts` and `volumetrics.ts`.
   - Recompute nutrition from catalog data instead of trusting model-asserted values. Derive diet and allergen tags from the resolved ingredients and flag any conflict with the model's tags.
   - Check step methods, temperatures, and times against `src/data/cooking/methodPhysics.ts` and the method and vessel registries, and against a documented food-safety table (create it only with cited sources).
   - Split findings into **blocking** (unsafe temperature, impossible quantity, an allergen or diet violation, an unresolved main ingredient) and **advisory**. Advisory findings never fail a recipe: deliver it with the annotation.
3. **Repair before retrying.** Fixable problems (unit normalization, recomputed nutrition, re-derived tags) are repaired deterministically with no model call.
4. **Retry on blocking failure.** Retry PA with structured feedback built from the gate's findings, using the request fields that already exist (`prompt`, `disallowedIngredients`). If PA needs a new field, record it as a request for ASOL; do not build around it. Retries are free to the user: one debit per request, never one per attempt, and `user_daily_limits` still increments only on delivery.
5. **Refund only after repeated failure.** When the attempts are exhausted, refund exactly once through the existing path, return an explicit message that says the charge was reversed, and make sure a refund that itself fails is logged loudly and visible in the Agents pane. A success after a retry must never refund.
6. **Observability.** Record per-request attempts, repairs, retries, gate findings by class, and refunds, so the Agents pane (target 3) can show the pipeline's health. Set a final-failure rate from the measured baseline, then track it. Do not invent a number up front.
7. **Tests:** a golden set of known-good and known-bad recipes proving the gate catches an unsafe or impossible recipe, plus injected PA failures (timeout, 502, malformed JSON, schema drift, gate-blocking recipe) asserting: retry order, a single debit, a success-after-retry with no refund, exactly one refund after exhaustion, and `synthetic-cosmic-recipe` staying green.

Do not touch ASOL's generator, and do not turn astrological scoring into a correctness claim. Not in scope: a curated WTEN-owned fallback recipe as a last tier before refund. It is a promising follow-up, so note it in the closeout with what it would need; do not build it without the owner's go-ahead.

## Working rules and completion

- Order: 1, 2, 3, 4, 5, then 6. Each target gets its own commits and passes `bun run verify:static` before the next begins. Run focused jest suites and `bun run build` for anything touching routes or pages.
- Never delete a route, script, or deployable on the strength of "looks unused": cite the grep, the CI search, and the ASOL check, or keep it.
- Write `docs/PHASE_44_CLOSEOUT.md`: tracked-file and repo-size delta, every ASOL candidate with its DELETE/HAND OFF/KEEP/ASK verdict and evidence, the Agents pane's sources and any it could not make live, gate deltas (lint, assertions, casts, routes, `force-dynamic` count), measured efficiency and recipe-pipeline numbers, and everything you could not verify.
