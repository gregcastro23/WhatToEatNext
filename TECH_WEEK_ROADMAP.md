# Alchm.kitchen — Tech-Week Checklist

_Rev 3 · 2026-06-02 · prod = `master` (Vercel auto-deploy) + Railway Postgres_

**Legend:** `[ ]` todo · `[x]` done · 👤 you (operator-only) · 🤖 Claude (I can do/automate) · ⏱ rough effort

## Status at a glance
- **Prod:** v**3.1.0**, `/api/health` healthy, DB `OK`. Latest `master` deploy `READY`.
- **Shipped (latest → 2026-06-02):** **DB password rotated** · **Stripe MCP top-ups live** (ESMS refill — checkout verified) · onboarding hardening ([#495](https://github.com/gregcastro23/WhatToEatNext/pull/495)) + verification docs ([#496](https://github.com/gregcastro23/WhatToEatNext/pull/496)). _Earlier (06-01):_ Lab Book ingestion · ESMS quests · Neon-failover revert · leaked-credential removal · HSCA cleanup.
- **✅ Blockers (P0): ALL CLEAR** — DB password **rotated 2026-06-02** (old creds rejected, prod verified healthy), Vercel `DATABASE_URL` → Railway confirmed, Stripe price/top-ups done.
- **✅ Landed:** [#487](https://github.com/gregcastro23/WhatToEatNext/pull/487) (Lab Book quests) + [#488](https://github.com/gregcastro23/WhatToEatNext/pull/488) (this checklist) merged to `master`. ✅ **Migration 50 applied** on the Railway backend (deploy `88e4002c` / commit `9b5c669b`, 2026-06-01 23:02 UTC — `[migrate] ok 50-lab-book-quests.sql`); quests seeded.

---

## 🔴 P0 — clear before tech-week
- [x] **Rotate the Railway Postgres password.** ✅ **DONE 2026-06-02.** `ALTER USER` on live Postgres, then propagated the new secret to all 7 locations — Postgres `POSTGRES_PASSWORD`; PgBouncer `POSTGRESQL_PASSWORD` + `DATABASE_URL` + `DATABASE_PUBLIC_URL`; WhatToEatNext + device-sessions-cleanup `DATABASE_URL`; Vercel `DATABASE_URL`; local `.env.production.local` — and redeployed each consumer. Verified end-to-end: frontend (`/api/health` db=healthy), backend (`/health` 200), and the PgBouncer path all connect on the new creds; **old password REJECTED**. Notes: the Postgres service itself was *not* redeployed (avoids a DB restart — `ALTER USER` already changed the live password); two inert `_ROT_TEST_*` vars remain on it from a stdin-format test (delete at next Postgres maintenance — deleting triggers a Postgres redeploy).
- [x] **Confirm Vercel `DATABASE_URL` → Railway (not Neon).** ✅ Verified via `vercel env pull`: `DATABASE_PUBLIC_URL` → `tramway.proxy.rlwy.net`, `POSTGRESQL_HOST` → `postgres.railway.internal` — no Neon host present. (`DATABASE_URL` itself is a Vercel *Sensitive* var so it reads back empty, but every DB var is Railway and prod DB is healthy.) ⚠️ Local `.env.production` still holds a **Neon** URL — do NOT sync that file to Vercel.
- [x] **Merged [PR #487](https://github.com/gregcastro23/WhatToEatNext/pull/487)** (quests) → `master`. ✅ **Migration 50 confirmed applied on the Railway backend deploy** (`88e4002c` / `9b5c669b`, 2026-06-01 23:02 UTC) — deploy log shows `[migrate] ok 50-lab-book-quests.sql`. It applies there, *not* in the Vercel build; subsequent `master` pushes (frontend/docs/CI only) correctly SKIPPED the backend redeploy.

## 🟡 P1 — confirm
- [x] **`ALCHM_KITCHEN_SYNC_SECRET` set in Vercel prod** (verified ~19d ago) — PA↔WTEN credit sync auth.
  - [ ] 👤 Confirm it *matches* the PA side (proof = a real PA→WTEN sync returns non-`401`; only act if one `401`s).
- [x] **v3.1.0 live**, DB healthy, latest `master` deployed `READY`.
- [ ] 👤 **Check the OpenAI account has quota** for the demo — Lab Book + cosmic recipe call GPT-4o (`OPENAI_API_KEY` is set in prod ✓; just confirm billing/limits).

## 🎬 Demo-day prep
- [ ] 👤 **Fund the demo account with ESMS, or use a Premium account.** ⏱2 min. **Gotcha:** Lab Book extraction (Essence), cosmic recipe (after the 1 free/day), and refine-oracle (Substance) are **token-gated** → a broke account throws `402` mid-demo. Grant via `/admin` → Grant Tokens.
- [ ] 👤 **Sign the demo device in beforehand** (Google OAuth) + finish onboarding/natal chart (unlocks personalized output).
- [ ] **Demo flow (suggested):** Kitchen (tonight's recs) → Discover (cuisines/ingredients) → **Lab Book** (paste *or* photo a recipe → Save → milestone notice) → **Quests** (claim ESMS) → Cosmic Recipe → Commensal (dinner party).
- [ ] **Avoid on the projector:** admin pages; any action that spends the account's last tokens.

## 🧪 Pre-demo smoke test (~3 min, run ~15 min before)
- [ ] `curl https://alchm.kitchen/api/health` → `"version":"3.1.0"`, `"database":"healthy"`.
- [ ] Signed in → `/lab-book` → paste a short recipe → **Extract** → preview shows ingredients/steps + elemental/ESMS → **Save** → appears in cookbook.
- [ ] `/cosmic-recipe` generates one recipe; `/feed` loads.
- [ ] `/admin` System Status → all flows `OK` (no DEGRADED/INCIDENT).

## 🔁 Rollback & monitoring
- [ ] **Rollback path:** Vercel → Deployments → a previous `READY` prod deploy → **Instant Rollback** (recent rollback targets: `17f04acd`, `70409445`). Reverts code in seconds.
  - ⚠️ **Migrations are forward-only** — a code rollback does **not** undo DB migrations. Recent ones (quest INSERTs, column-default restores) are additive/harmless; a *bad* migration needs a manual DB fix, not a rollback.
- [ ] **Watch during the event:** `/admin` System Status + `/api/health`. Status-transition alerts fire to Slack/email when `ALERT_SLACK_WEBHOOK_URL` / `ADMIN_EMAILS` are set.

---

## 📅 Day-by-day plan

> Assumes a **5-day (Mon–Fri) tech week** + a prep day before and a wrap day after — relabel to real dates. The repeatable **Daily ritual** is defined once; each day lists it plus that day's focus.

### 🔁 Daily ritual
**Morning pre-flight (~15 min before doors):**
- [ ] `curl https://alchm.kitchen/api/health` → `"version":"3.1.0"`, `"database":"healthy"`
- [ ] `/admin` System Status — all flows `OK` (no DEGRADED / INCIDENT)
- [ ] Demo account: signed in + ESMS balance comfortably above demo needs (Lab Book & cosmic recipe are token-gated)
- [ ] One live dry-run of the headline flow (e.g. Lab Book: paste → **Save** → milestone)
- [ ] Skim overnight alerts (Slack/email) + `/admin` error & slow-query rings

**End of day:**
- [ ] Review System Status + error logs for the day; jot anything flaky
- [ ] Triage: hotfix tonight vs park for the post-week list
- [ ] Top up demo-account ESMS if it ran low

### Day −1 · Prep & freeze
- [x] 🔴 Rotate Railway password → set new `DATABASE_URL` (Vercel + local `.env*`) — ✅ **DONE 2026-06-02** (see P0; old creds rejected, prod healthy). Settled the "is it Railway?" check too.
- [x] Confirm **migration 50** applied → quests show in the Quests panel (Railway deploy `88e4002c` / `9b5c669b`, 2026-06-01 23:02 UTC)
- [ ] Fund the demo account with ESMS (or use Premium); finish onboarding / natal chart
- [ ] Confirm OpenAI quota (GPT-4o powers Lab Book + cosmic recipe)
- [x] 🔴 Confirm the Stripe **premium price object = $5/mo** — ✅ `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID` = `price_1TBVHB567feWgZJOXV4MGIL7` = live **$5.00/month** recurring ("Alchm.kitchen premium membership"). App's $5 display matches the charge.
- [x] 🔴 3 **MCP top-up** Stripe prices ($5/$20/$50) already existed in **live** Stripe (Starter `price_1Tbj7K…` · Builder `price_1Tbj7L…` · Adept `price_1Tbj7M…`); set `STRIPE_MCP_TOP_UP_{5,20,50}_PRICE_ID` in Vercel + **redeployed prod** (`9uqg066h6` → alchm.kitchen). ✅ **Verified live 2026-06-02** — signed-in `/account/billing/mcp` → **Top up** → redirect to Stripe Checkout works. (Env vars are Sensitive/write-only, so this signed-in click was the only possible check.)
- [x] Merge **PR #490** (premium-journey fixes: $5 display · starter grant → 60 · swap 402) — merged (`38a94421`)
- [ ] Full smoke test (Kitchen recs · Discover · Lab Book · Quests · Cosmic Recipe · Commensal)
- [ ] Record the current-good prod deploy SHA + confirm the Vercel **Instant Rollback** path
- [ ] **Soft-freeze `master`** — docs / hotfixes only from here

### Day 1 · Go-live
- [ ] AM ritual → final go/no-go (prod healthy, account ready)
- [ ] _Suggested focus:_ Onboarding + **Kitchen** (tonight's personalized recommendations) — the core hook
- [ ] EOD ritual

### Day 2
- [ ] AM ritual
- [ ] _Suggested focus:_ **Discover** — cuisines, ingredients, cooking methods (catalog breadth)
- [ ] EOD ritual

### Day 3
- [ ] AM ritual
- [ ] _Suggested focus:_ **Lab Book** — ingest a recipe by text *and* by photo → Save → **ESMS milestone quest** (the new feature)
- [ ] EOD ritual

### Day 4
- [ ] AM ritual
- [ ] _Suggested focus:_ **Cosmic Recipe** generation + **Commensal** dinner-party harmonization (AI + social)
- [ ] EOD ritual

### Day 5 · Wind-down
- [ ] AM ritual
- [ ] _Suggested focus:_ **Lab / Quantities** — the alchemy internals ("how it works") + recap of the week's highlights
- [ ] Capture standout feedback + metrics before close
- [ ] EOD ritual

### Day +1 · Post-week
- [ ] Quick retro: what broke, what to harden
- [ ] Lift the `master` freeze; resume normal dev
- [ ] Clear deferred items: git-history scrub (now safe post-rotation) · `.claude/worktrees/*` sweep · Lab Book follow-ups (scope quests to `source=scan`, persist photos, PDF import)

---

## ✅ Done this session
- [x] Reverted Neon write-failover (`70409445` ← `8f1b2047`) — split-brain hazard; **do not re-introduce**.
- [x] Removed hardcoded DB password from backfill scripts (`17f04acd`).
- [x] Removed ingested HSCA raw corpus `HSCArecipes/` (`f13f4f98`) — in DB read_model + `.vercelignore`'d.
- [x] Shipped **Lab Book** ingestion (text/photo → GPT-4o → alchemize → cookbook), token-gated — on `master`.
- [x] **ESMS milestone quests** (migration 50) — merged (**#487**) + applied on the Railway backend.
- [x] Workspace cleanup — 744 redundant untracked dupes + 3 eslint caches removed (0 tracked changes).

### 2026-06-02
- [x] **DB password rotation** — leaked Railway Postgres password rotated end-to-end across 7 locations (Postgres · PgBouncer ×3 · backend · device-cleanup · Vercel · local `.env`) + redeployed; verified frontend + backend + PgBouncer on new creds, **old password rejected**. Last P0 cleared.
- [x] **Stripe** — confirmed premium = $5/mo (`price_1TBVHB…`); wired the 3 MCP top-up price IDs (`price_1Tbj7K/L/M`) in Vercel + redeployed; **top-up checkout verified live** (redirect functional).
- [x] **Onboarding hardening** ([#495](https://github.com/gregcastro23/WhatToEatNext/pull/495)) — `agent-forge/ignite` recipe fetches timeout-guarded + non-fatal; auth-handshake grant/trial copy corrected.
- [x] **Verification docs** ([#496](https://github.com/gregcastro23/WhatToEatNext/pull/496)) — migration 50 + DATABASE_URL→Railway + Stripe confirmations.
- [x] Closed stale dependabot **#494** (Storybook major — now in the ignore list).

## 📌 Backlog (not tech-week-blocking)
- [ ] 👤 **Fix the Render Astrologizer/Imaginizer backend (`alchm-backend.onrender.com`) hibernation wake.** Cold starts return `502` / `503 x-render-routing: hibernate-wake-error`: the Express app only binds Render's `$PORT` *inside* its MongoDB-connect callback and `process.exit(1)`s on Mongo failure, so a slow/failed cold-start Mongo connect kills the wake. **Quick fix (no code) — point it at a healthy Mongo:** set `MONGODB_URI` on the Render service **+** open Atlas **Network Access → `0.0.0.0/0`** (Render egress IPs are dynamic; this is the likely culprit). Atlas login `alchm.nft@gmail.com`; cluster `cluster0.1wkw1cb`, user `AlchmAI`. String: `mongodb+srv://AlchmAI:<pw>@cluster0.1wkw1cb.mongodb.net/<dbName>?retryWrites=true&w=majority&appName=Cluster0` — **URL-encode the password**, add the real `<dbName>` (else it uses `test`), skip the "npm install mongodb" step (backend already uses mongoose). ⚠️ Never commit the password; least-privilege the `AlchmAI` user (readWrite on one DB).
  - **Proper fix (backend code, `~/Desktop/Alchm_render_backend/alchm_backend-master`):** bind `$PORT` unconditionally at boot (don't gate on Mongo / don't `process.exit`); wrap the image handlers in try/catch + add `process.on('unhandledRejection')` — a `/generate-image` call currently **crashes the whole process** (empty Livepeer bearer; `index.js:411` + `:171`); set `new Livepeer({ httpBearer: process.env.LIVEPEER_API_KEY })`. Full diagnosis + a drafted message to the backend admin (Evan) live in the PA session.
  - **PA side already mitigated (agents app, PR #36):** avatars moved to **free Cloudflare** (no longer call the crash-prone image endpoints); added `wakeRenderBackend()` retry on the supplemental `/alchmize-public` call. Optional next: a keep-warm cron pinging `GET /` so it never cold-starts.
- [ ] 🤖 Scope Lab Book quests to `source === "scan"` so generator/riff saves don't count — if desired.
- [ ] Persist ingested photos (Vercel Blob vs base64); PDF / multi-page batch import.
- [ ] Harmonize `agent-recipes` (`Bearer`) vs `sync-credit` (`X-Sync-Secret`) auth header formats.
- [ ] Refactor `scripts/backfillRecipeAlchemicalQuantities.ts` to share `alchemizeExtractedRecipe`.
- [ ] 👤 Git-history scrub of the leaked password — **now unblocked** (password rotated 2026-06-02, so the old creds in `master` history are dead). Lower urgency now, but still worth scrubbing; it rewrites `master` + invalidates clones, so coordinate before running.
- [ ] Sweep ~37 stale `.claude/worktrees/*` (carefully — may hold uncommitted work). ⚠️ At least one is an **active agent worktree** (`agent-af13cd716dc9a72f0`, Privy/profile work) as of 2026-06-02 — don't sweep live ones.

## 🧩 Partial / deprioritized implementations (code-completeness backlog)

_From a 2026-06-02 `src/`-wide sweep (3 parallel audits). Not tech-week-blocking — post-freeze completion/cleanup. Triaged live-and-user-affecting first, then deletion. **Excluded by design** (do not "fix"): intentional error/graceful fallbacks, `@deprecated` back-compat shims, recipe hard-caps (tokens are the throttle), input `placeholder=` attrs, no-op props that satisfy a required interface, and `FoodRecommender`'s `_currentTime` (a deliberate 60s re-render tick)._

### Tier 1 — live, user-visible gaps (real values are currently faked) 🤖
- [x] **Real lunar phase in the live chart** ✅ 2026-06-02 — `AstrologicalService.ts` now computes the phase from the cached Sun→Moon elongation (`lunarPhaseFromPositions`, `degree` = absolute longitude); `"new moon"` remains only as the no-positions fallback.
- [x] **Real dominant modality** ✅ 2026-06-02 — `RealAlchemizeService` tallies Cardinal/Fixed/Mutable across the live planetary signs (`computeDominantModality`) at both return sites instead of the literal `"Cardinal"`.
- [x] **Per-recipe planetary alignment score** ✅ 2026-06-02 — `calculatePlanetaryAlignment` now scores the recipe's elemental profile against the active planetary hour / lunar phase / zodiac sign (`55acd172`).
- [x] **Real optimal cooking time** ✅ 2026-06-02 — `calculateOptimalCookingTime` derives `startTime` from the planetary hour + `duration` from the recipe's ingredient count (`55acd172`).
- [ ] **Tarot→recipe filtering is a no-op** — `src/lib/recipeCalculations.ts:97` ignores the drawn card. **Re-tiered S→M on inspection:** the function only has 3 hardcoded placeholder recipes, so filtering them is theater — needs wiring to the real element-tagged recipe catalog to be meaningful. ⏱M
- [x] **Food preferences persist server-side** ✅ 2026-06-02 — `/profile/preferences` `onSave` now PUTs to `/api/user/profile` (schema + `updateUserProfile` already accept `preferences`); prefs sync across devices (`55acd172`).
- [x] **Molecular-gastronomy panel** ✅ 2026-06-02 — `CookingMethods.tsx` now renders the expandable molecular-gastronomy details per method (`getMolecularDetails`/`toggleMolecular`/`expandedMolecular`) + a "Methods by Planetary Ruler" section (`planetaryCookingMethods`).
- [ ] **Agent-view filters do nothing** — `planetary-agents-view.tsx` (227/281): `_filters` is never applied to the list. **Re-tiered S→M on inspection:** `PlanetaryAgentActivation` has no `modality` field (the filter panel offers a dimension with no backing data) and the strength scale is ambiguous (0–1 vs 0–100) — the activations need enriching first. The `_lastUpdated` freshness label + removing the dead `_handleAgentChat` are trivial sub-tasks. ⏱M
- [x] **Sauce-detail expansion** ✅ 2026-06-02 — misdiagnosis: expansion already works via `expandedSauceCards` (read at `CuisineRecommender.tsx:1012,1184`). Deleted the abandoned duplicate `_expandedSauces`/`_toggleSauceExpansion` instead.

### Tier 2 — lower value / verify-first 🤖
- [ ] **Real tarot scoring signal** — `src/services/UnifiedScoringService.ts:226` (+ `planetaryScoring.ts`) `calculateTarotEffect` returns a constant table feeding live recipe scoring; map the active draw to elemental/alchemical affinities. ⏱M (low impact)
- [ ] **Personalization persistence** — `src/lib/personalization/user-learning.ts:812` ("would load from persistent storage", live via `usePersonalization`). Verify whether learned prefs persist across sessions; if not, back the store with the `user_interactions`/profile DB. ⏱M
- [ ] **`FoodRecommender` chakra/food wiring** — `src/components/FoodRecommender.tsx:93,110`: `_foodRecommendations` + `_chakraRecommendations` are computed by hooks then dropped. Render or remove. ⏱S
- [ ] **`IngredientService.analyzeRecipeIngredients` stub** — `src/services/IngredientService.ts:519` (`overallHarmony = 0.8`); the method is unused (live callers use `UnifiedIngredientService`). Delegate to the real impl or delete the dead method. ⏱S

### Tier 3 — dead code → delete (overlaps PR #474) 🤖
_Zero non-test importers; several carry hardcoded `1.0`/`0.8` stubs that read like real logic but run nowhere. The live alchemy path is `calculateEnhancedAlchemicalFromPlanets` + `RealAlchemizeService`._
- [ ] Delete the orphaned service tier: `DirectRecipeService.ts`, `UnifiedPlanetaryRecommendationService.ts`, `PlanetaryRecipeScorer.ts`, `unifiedSauceRecommender.ts` (dup of live `sauceRecommender`), `unifiedNutritionalService.ts`, `AlertingSystem.ts` (live alerting is `alertService.ts`), the `ServicesManager`/`useServices`/`AstrologyService` (lowercase singleton) mock chain, and the secondary `src/lib/alchemicalEngine.ts`. ⏱S–M
- [ ] Delete dead components `src/components/RecipeList.tsx` + `src/components/IngredientRecommendations.tsx` (unreferenced; their `_`-vars are red herrings).
- [ ] (Low-pri) Retire the ~13 `@deprecated` shims once callers move to the new APIs (e.g. `utils/astronomiaCalculator.ts`, `data/unified/flavorCompatibilityLayer.ts`, `utils/monicaKalchmCalculations.ts`). ⏱M

### Decide — wire or delete 🤖
- [ ] `src/components/CuisineSpecificRecommendations.tsx` + `src/calculations/enhancedCuisineRecommender.ts:144` (`getRecipesForCuisine` returns `[]`) — orphaned recommender; mount with real data or remove both. ⏱M
- [ ] `src/components/EnhancedRecommendationEngine.tsx:114` ("Filters … Simplified for now") — only in the lazy barrel, unmounted; finish + mount, or drop from `lazy/index.tsx` and delete. ⏱M

---

## 📎 Appendix — audit reconciliation (`audit-reports/wten-architecture-audit-2026-06-01.md`)
- **Already resolved (audit was stale):** `group_chat_quest` is in the `TransactionSourceType` whitelist (`src/types/economy.ts`); `ALCHM_KITCHEN_SYNC_SECRET` is documented in `AGENTS.md` + `GEMINI.md`.
- **Accurate (FYI, no action):** MCP server `@alchm/mcp-server` v1.1.2; `/api/cron/synthetic-mcp` exists.
- The earlier chat roadmap that reprinted a live DB password is **superseded by this file**.
- **Ops gotcha (env):** this Vercel project has **Sensitive Environment Variables** ON — every var is write-only and reads back **empty** via `vercel env pull`. Verify env changes by behavior (redeploy + test), never by pulling the value back. (Bit the Stripe top-up + `DATABASE_URL` work this session.)
