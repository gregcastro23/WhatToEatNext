# Next session — Phase 44: clean WTEN, fix what is measurably wrong, make it the culinary authority

## Mission and ground rules

WTEN (`alchm.kitchen`) is to be the most trustworthy cooking reference on the internet: a verified ingredient, cuisine, and method database, real nutrition, rigorous meal planning, and recipe generation that a generic LLM cannot match because it is checked against our data and physics. This phase makes the codebase fit for that. It deletes, consolidates, and tightens. It does not add features.

**Owner decision (2026-10-01): agent creation belongs in ASOL.** Agent creation, Monica Agent, and the Philosopher's Stone are ASOL's. WTEN removes its copies and hands users off with `getServiceUrlSafe("agentsUi")` (the `src/lib/agents/agentChatUrl.ts` pattern). Do not build new agent schemas, migrations, or proxy routes. This also retires the Phase 43 known limitation (non-atomic `clientRequestId` dedupe in `/api/agents/unified`): the fix is deletion, not an atomic rewrite.

**What WTEN keeps for ASOL:** the cross-site contracts in ADR 013, 014, 017 and 018. That means the ESMS token economy, the swapping bridge, the transmutation circle, the Kitchen Vessel Ledger (`/api/economy/vessel`), `sync-*` and `internal/*` routes, and webhooks. ASOL calls these server-to-server, so never remove or reshape one without checking its callers. Try `add_repo`/`list_repos` for the ASOL repo; if you cannot reach it, mark the route unverified and keep it.

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

Candidates (classify each as DELETE, HAND OFF, KEEP, or ASK, with the evidence):

- Agent creation and forging: `src/app/api/agents/unified` (create/list/get/chat), `src/app/api/agent-forge/ignite`, `src/app/api/planetary-agents/diet`, `src/app/(alchm)/philosophers-stone/page.tsx` (1,007 lines; its `/api/monica-agent` call has no WTEN route and most likely 404s, so confirm it), `src/app/api/philosophers-stone/positions`, `src/app/(alchm)/profile/[userId]/agent-components` (10 files), and `src/lib/agents` (including `persona/`).
- ASOL operator tooling inside WTEN: `src/components/admin/asol`, the chain and ASOL services in `src/services/admin`, `src/app/admin/chain`, and the crons `agents-daily-yield`, `prewarm-agent-recipes`, and `chain-reconcile`. Operator visibility into ASOL may still be wanted, so these are ASK unless you can show nothing in WTEN depends on them.
- `src/lib/recipe-nft`, `src/lib/spacetime`, and `src/lib/mcp` (with `mcp-server/`, the `synthetic-mcp` cron, and `/api/account/billing/mcp-top-up`): probably WTEN (Recipe-NFT mint, live tables, the MCP product). Classify from evidence, do not assume.

Sequence for anything user-facing: replace the UI with a hand-off link first, then remove the route only after grep shows no remaining caller in `src` or `scripts` and the ASOL repo check (or owner confirmation) shows none there. A route that still has an unverified external caller stays, and you list it as pending. Delete tests, schemas, baselines, and docs that die with the code. Record the lint, cast, assertion, and route-count deltas per deletion; deleting code is the cheapest TypeScript-health gain available.

## 3. TypeScript health (after 1 and 2, re-measure first)

Measured: 1,293 lint warnings; 2,827 single assertion sites and 598 non-null assertions; 134 `as unknown as`; ~170 `any`; 132 `eslint-disable`; 4 `@ts-ignore`/`@ts-expect-error`. `tsconfig` already has `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess`.

- **Response contracts (carried over from the previous plan).** Four predicate-less `z.custom<T>()` sites remain: `src/hooks/useFoodDiary.ts:155,267` and `src/hooks/useTables.ts:16,20`. (The old subscription/`PremiumContext` site is gone with the retired premium tier, #919.) All four do `parsed.success ? parsed.data : {}`, so a malformed 2xx wipes prior good state (`setTables([])`) and an unreadable 2xx `addEntry` result reads as a failure and invites a duplicate submit. Replace the casts with real schemas covering only the consumed fields. Add a compile-time drift guard against the server type (the `src/lib/admin/schemas/` pattern). Add runtime tests that parse real route-handler output and malformed 2xx payloads. Keep prior good state on an unreadable read, and reconcile and warn on an unreadable mutation. Inspect stored `food_source`, `meal_type`, and serving-unit values before using enums; if production values are unreadable, validate as constrained strings or defer with evidence.
- **Dead and duplicate code that the reachability audit cannot see.** `audit:dead-modules` reports 1 dead module because it counts any tested or app-root-reachable file as alive. Overlapping recommendation and ingredient layers are the real problem. `UnifiedRecommendationService` (1,026 lines), `RecommendationAdapter` (852), and `IngredientFilterService` (797) have no production importer. `RecipeService`, `LocalRecipeService`, `UnifiedRecipeService`, `IngredientService`, and `UnifiedIngredientService` overlap. `src/data/unified/` is ~13k lines parallel to `src/data/{cuisines,ingredients}`. `ingredientRecommender.ts` (3,101 lines) and `EnhancedIngredientRecommender.tsx` (2,868 lines) are the largest hand-written files. Build the real import graph, pick one canonical service per concern, migrate callers, delete the rest.
- **Then** attack assertion and `as unknown as` clusters by file (top 10 by count), not by rule. Prefer fixing the type at its source over adding a guard at every use.

Done when: the new schemas replace all four casts (or deferrals are evidenced), the removed services and data layers are gone, and each gate delta is measured and recorded.

## 4. Route efficiency

Measured: 266 route handlers; **240 are `force-dynamic`** and 216 pin the Node runtime; only ~28 files mention `revalidate`, `Cache-Control`, or `unstable_cache`. Vercel crons: 15, of which the 7 synthetic probes make ~23 invocations an hour.

- Classify every read-only catalog or reference route (`cuisines`, `ingredients`, `sauces`, `techniques`, `search`, `zodiac-calendar`, `recipes/featured`, and the like). Drop `force-dynamic` where nothing per-user is read, and give it an explicit `revalidate` or `Cache-Control` where staleness is acceptable. State the freshness budget per route.
- Overlapping clusters to collapse after building a caller map (src, scripts, and ASOL if reachable): the astrology/positions family (`astrological`, `astrologize`, `astrology`, `planetary-positions`, `planetary-rectification`, `alchemize`, `current-moment`) and the recommendation family (`recommendations`, `personalized-recommendations`, `group-recommendations`, `transmutation_recommendations`).
- Page-level duplication to resolve: `(alchm)/recipe-generator`, `(alchm)/cosmic-recipe`, `(alchm)/generated-recipe`, `recipe-builder`, `menu-planner`, `meal-plan`. Keep one flow per user job, redirect the rest (the redirect-parity test in `src/config/__tests__/navigation.redirects.test.ts` guards navigation).
- Reconcile the validation baseline: `.route-validation-baseline.json` says 0 unvalidated, yet 143 route files import neither zod nor `lib/validation`. Determine whether those are input-free GETs; if not, the gate has a blind spot.
- Measure before and after with `scripts/check-route-sizes.cjs` and the cron/observability p95. Do not claim a speedup you did not measure.

## 5. Culinary authority (first slice only: a verification gate, not a rewrite)

Facts: `/api/generate-cosmic-recipe` is a thin proxy to ASOL/PA's `/api/generate-recipe`; WTEN adds grounding fields and debits tokens through the swapping bridge. The only WTEN-side check on the result is `cosmicRecipeSchema`, which validates shape: `quantity` is a free string, ingredient names are never resolved against the ~1,100-ingredient catalog, nutrition is not recomputed, and no step is checked against method physics or food-safety limits. The ingredient audit measures field completeness, not culinary correctness.

Build the smallest deterministic **recipe verification gate** in WTEN and apply it to generated recipes before they are shown or charged as successful:

1. Resolve every ingredient to a catalog entry (use the existing `ingredientRecipeIndex`); flag unresolved names.
2. Parse quantities to mass or volume with `src/lib/cooking/countToMass.ts` and `volumetrics.ts`; reject or flag unparseable amounts.
3. Recompute nutrition from catalog data instead of trusting model-asserted values; derive diet and allergen tags from the resolved ingredients and flag any conflict with the model's tags.
4. Check step methods, temperatures, and times against `src/data/cooking/methodPhysics.ts`, the method and vessel registries, and a documented food-safety table. Create that table only with cited sources.

Deliver it with a golden test set of known-good and known-bad recipes (so the gate demonstrably catches an unsafe or impossible recipe), a clear user-facing outcome for a failing recipe (retry, refund through the bridge's existing refund path, or an annotated result; check with the owner if the choice affects pricing), and a note on which failure classes remain unchecked. Do not touch ASOL's generator. Do not turn astrological scoring into a correctness claim.

## Working rules and completion

- Order: 1, 2, 3, 4, then 5. Each target gets its own commits and passes `bun run verify:static` before the next begins. Run focused jest suites and `bun run build` for anything touching routes or pages.
- Never delete a route, script, or deployable on the strength of "looks unused": cite the grep, the CI search, and the ASOL check, or keep it.
- Write `docs/PHASE_44_CLOSEOUT.md`: tracked-file and repo-size delta, every ASOL candidate with its DELETE/HAND OFF/KEEP/ASK verdict and evidence, gate deltas (lint, assertions, casts, routes, `force-dynamic` count), measured efficiency numbers, and everything you could not verify.
