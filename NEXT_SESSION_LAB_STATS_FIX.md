# Next session: FIX THE LIVE `/lab` "AWAITING BACKEND" STATS PANELS (priority: live site)

> ⚠️ **PARTIALLY STALE (2026-07-17).** This plan predates the ignite dual-write
> fix. Claims below that ignite "never calls `updateUserProfile`" and "never
> writes `user_profiles.natal_chart`" are **no longer true** — `/api/agent-forge/
> ignite` now persists through `userDatabase.updateUserProfile`, dual-writing the
> JSONB and the normalized column. The "two-ESMS-formula inconsistency" it flags
> is also resolved: `natalAlchemy.ts` no longer derives ESMS from elements+
> modalities; it reads the chart's planet-derived quantities. Before acting on
> any step here, re-verify against the current code — do not re-fix fixed bugs.
> A prod natal-chart backfill also ran 2026-07-17 (only 8 humans hold real
> charts). Remaining genuine gap: some users' charts live only in the
> `users.profile` JSONB, not the `user_profiles.natal_chart` column the read path
> prefers.

Paste this whole file as the opening prompt for the next chat.

---

Fix the production `/lab` page (https://alchm.kitchen/lab) so the **ELEMENTAL BALANCE** and **THERMODYNAMICS** panels stop showing "· AWAITING BACKEND" / "No AlchemicalProfile on the current user. Sign in to populate." / "Spirit / Essence / Matter / Substance not yet populated." **Treat this as a live-site priority.**

This was fully investigated on 2026-07-06 (four parallel read-only agents). The findings below are cross-verified — start from them, but re-verify each file:line before editing (a concurrent session may have moved things).

## ✅ ALREADY FIXED THIS SESSION — the "0.0% / 0.00q" zeros bug (2026-07-06)
When a signed-in user *did* have a natal chart, the panels rendered but every value was **0.0% / 0.00q**. Root cause: `src/utils/astrology/natalAlchemy.ts` `calculateAlchemicalState` looked up `SIGN_PROPERTIES[sign]` where `SIGN_PROPERTIES` is keyed by **capitalized** sign names, but natal charts store signs **lowercase** (`natalChartService.normalizeSignName` → `ZodiacSignType`). Every lookup missed → all elements/modalities stayed 0 → whole profile (elements + ESMS + thermodynamics) was 0. **Fixed** by normalizing the sign case before the lookup; added regression tests (`src/utils/astrology/natalAlchemy.test.ts`, 4 tests). Verified: a lowercase-sign chart now yields normalized non-zero elements + non-zero ESMS/thermo. Committed on `feat/restaurant-best-match-explorer`. **This is separate from — and does not fix — the AWAITING BACKEND / natal-chart-not-reaching-client bug below, which is still open.**

## NOT a regression
This is a **pre-existing bug**, not caused by the just-merged explicit-any cleanup (PR #585). That campaign was types-only and did not touch `UserContext`, the `/lab` page, `RealAlchemizeService`, `/api/user/profile`, `agent-forge/ignite`, or `AlchemicalContext`. Don't waste time bisecting the merge.

## How the panels get their data (verified map)
- `src/app/(alchm)/lab/page.tsx` (~lines 370–381, 492–517): reads **only** `currentUser?.stats` and maps `stats.{fire,water,earth,air}` → `<ElementalMeter>` and `stats.{spirit,essence,matter,substance}` → `<ThermoQuartet>`. If `stats` is falsy it renders `<AwaitingBackend …>`. There is **no fallback** to anything else.
- `src/contexts/UserContext/index.tsx`: `stats` (`AlchemicalProfile`, declared ~lines 24–42, 56) is **never stored server-side**. It's **derived client-side** in `parseServerProfile` (~lines 96–130): `if (!stats && natalChart?.planets?.length) stats = calculateAlchemicalProfile(natalChart)`. Also recomputed in `updateProfile` (~line 327) on birthData change. Derivation silently no-ops on throw (caught ~line 109, only `logger.warn`).
- Derivation fn: `src/utils/astrology/natalAlchemy.ts` `calculateAlchemicalProfile(chart)` (~lines 116–139) → returns the full `{fire,water,air,earth, spirit,essence,matter,substance, heat,entropy,reactivity,gregsEnergy,kAlchm,monicaConstant}` with **no backend call**. (Note: it uses an element+modality **heuristic**, NOT the canonical planetary-alchemy ESMS — see consistency note below.)
- `GET /api/user/profile` (`src/app/api/user/profile/route.ts` ~lines 150–153) returns `{ success, profile }` where `profile` (built in `src/services/userDatabaseService.ts` ~lines 937–950, from `getUserById`/`getUserByEmail`) has `natalChart` but **no `stats`/ESMS/elemental fields**. So the whole chain depends on `natalChart` arriving with a populated `planets[]`.

## THE ROOT-CAUSE BUG (fix this first) — VERIFIED against current code 2026-07-06
**Column mismatch in natal-chart persistence, in ONE of two onboarding funnels.** There are two entry points and they persist the natal chart differently:

- ❌ **BROKEN funnel — `/onboarding` page → `POST /api/agent-forge/ignite`:** `src/app/onboarding/page.tsx` posts to `/api/agent-forge/ignite`. That route (`src/app/api/agent-forge/ignite/route.ts` ~lines 129–141) computes the chart, writes ESMS to `alchemical_constitutions`, then persists the chart with `UPDATE users SET profile = jsonb_set(profile, '{natalChart}', …)` — i.e. **`users.profile` JSONB ONLY. It never calls `updateUserProfile` and never writes the `user_profiles.natal_chart` column.** (The `jsonb_set` write is even wrapped in a best-effort try/catch that only `console.warn`s on failure.)
- ✅ **WORKING funnel — `/profile` birth-data form → `POST /api/onboarding`:** `src/app/(alchm)/profile/page.tsx` posts to `/api/onboarding`, which at `src/app/api/onboarding/route.ts:238` calls `userDatabase.updateUserProfile(userId, { birthData, natalChart, … })` — correctly persisting to the `user_profiles.natal_chart` column.

The read path — `GET /api/user/profile` → `userDatabaseService.getUserById/getUserByEmail` → `rowToUserWithProfile` — builds `profile.natalChart` **exclusively from the `user_profiles.natal_chart` column** and never falls back to `users.profile` JSONB. So:
> A user who onboarded via `/onboarding` (ignite) has their chart in `users.profile` JSONB, the profile GET returns `natalChart: undefined`, UserContext derives no `stats`, and `/lab` shows AWAITING BACKEND — **even though they completed onboarding and are signed in.** A user who set birth data via `/profile` works fine.

This is a **recurrence / incomplete-fix of the PR #507 class of bug** (repo memory `reference_profile_write_source_of_truth`: "user_profiles columns are canonical, not `users.profile` JSONB; new write paths MUST dual-write via `updateUserProfile`"). Note: that memory (32 days old) claims #507 already routed ignite through `updateUserProfile` — the **current code does NOT** (it's `jsonb_set`-only for the natal chart), so either #507 only covered the `onboarding_completed` flag or it regressed. Verify with `git log -p src/app/api/agent-forge/ignite/route.ts` before assuming.

**The cleanest fix is to make `ignite` mirror what `/api/onboarding:238` already does** — persist the chart via `userDatabase.updateUserProfile(userId, { birthData, natalChart, onboardingComplete: true })` instead of (or in addition to) the raw `jsonb_set`. Use `/api/onboarding/route.ts` as the reference implementation.

Secondary/dead: `src/components/auth/OnboardingWizard.tsx` POSTs to `/api/auth/register-alchemist`, which **does not exist** (404). Another correct column-writer exists at `POST /api/user/charts` (`src/app/api/user/charts/route.ts`, the "saved cosmic identities" feature) for reference.

**⚠️ Confirm which funnel is the primary live new-user path before estimating blast radius.** `/onboarding` (the broken one) looks like the top-level funnel, so most newly-onboarded users are likely affected; `/profile` birth-data is the working one. The admin onboarding-health funnel + synthetic probes hit the ignite path, so also check they aren't masking/observing this.

## Fix plan (prioritized — do 1 & 2 for the real bug, 3 for robustness, 4–5 cleanup)
1. **[PRIMARY] Make `agent-forge/ignite` write `user_profiles.natal_chart` via `userDatabase.updateUserProfile(userId, { birthData, natalChart, onboardingComplete: true })`** — mirror the working `/api/onboarding/route.ts:238` implementation — instead of / in addition to the raw `users.profile` `jsonb_set`. This unblocks stats derivation for every newly-onboarded user. Follow the source-of-truth rule; do NOT just write JSONB.
2. **[HEAL EXISTING USERS] Add a read-path fallback**: in `userDatabaseService.getUserById/getUserByEmail` (or the profile route), when `user_profiles.natal_chart` is empty, fall back to `users.profile.natalChart` JSONB. This lights up users already onboarded via the buggy path without a data backfill. (Alternatively/additionally, write a one-off backfill that copies `users.profile.natalChart` → `user_profiles.natal_chart` for affected users.)
3. **[ROBUSTNESS / "always shows something"] Current-sky fallback in `/lab`**: when `currentUser?.stats` is null, compute a transit profile from `useAlchemicalSafe().planetaryPositions` (already in context — see `src/contexts/AlchemicalContext/`) by feeding them into the **canonical** `alchemize(positions)` (or lighter `planetaryAlignmentAlchemy(positions)`) from `src/services/RealAlchemizeService.ts`, then map `.elementalProperties` → `ElementalValues` and `.esms` → `ThermoValues`. Label it as the transit view — the panel header already reads "NATAL ⊗ TRANSIT". This is 100% client-side, no backend. It makes the panels populate for guests and no-chart users too. **Recommended even after 1&2**, because it removes the dead-panel UX entirely.
4. **[COPY] Fix the misleading note** in `lab/page.tsx`: "Sign in to populate" is wrong for a signed-in user who simply hasn't entered birth data. Branch the copy: guest → "Sign in…"; signed-in-no-chart → "Add your birth details to populate your natal profile" with a link to onboarding/`/profile`. (Moot for the two panels if you do #3, but still fix the natal-chart panel copy.)
5. **[CLEANUP] Dead onboarding path**: either implement `/api/auth/register-alchemist` or repoint `OnboardingWizard.tsx` at the working route. Confirm which onboarding entry points are actually live first.

Optionally (nice-to-have): surface the ESMS already persisted in `alchemical_constitutions` (spirit/essence/matter/substance integer balances) in the profile GET as authoritative `stats`, instead of only re-deriving from the natal chart.

## Verify (must do — the one thing the investigation couldn't)
WebFetch can't authenticate, so it was NOT confirmed live whether a signed-in+onboarded user actually gets populated panels. **Verify with an authenticated browser session** against `/lab` (use the claude-in-chrome MCP or a real login): sign in as a user who has completed onboarding, confirm whether ELEMENTAL BALANCE / THERMODYNAMICS populate. If they're still blank for an onboarded user, that confirms the column-mismatch bug (#1/#2) is the live cause. Also check the browser console for the `logger.warn` from a caught `calculateAlchemicalProfile` throw (malformed natalChart).

## Live-site backend status (verified 2026-07-06, all green except the auth-gated profile)
- Working keyless: `/api/health` (healthy, DB healthy), `/api/recommendations/ingredients?limit=8` (8 ingredients, each with real `thermo{spirit,essence,matter,substance}`), `/api/cuisines/signatures` (15), `/api/sauces/lineage?root=bechamel`. The center/right `/lab` panels work.
- `/api/user/profile` → **401 signed out** (expected). This is what gates NATAL CHART / ELEMENTAL BALANCE / THERMODYNAMICS.
- Canonical ESMS endpoints that already exist: `/api/alchemize` (current-sky `{alchemical, elementalBalance, thermodynamic, …}`), `/api/alchm-quantities` (ESMS + full thermo via `RealAlchemizeService.alchemize`), `/api/astrologize` (positions).

## Guardrails
- **Source-of-truth rule** (see repo memory `reference_profile_write_source_of_truth`): `user_profiles` columns are canonical; any natal-chart/profile write MUST go through `updateUserProfile` so it dual-writes correctly. Do not add another JSONB-only write path.
- **Two-ESMS-formula inconsistency (document, decide, don't silently mix):** `user.stats` (natal) uses the element/modality heuristic in `natalAlchemy.ts`; a current-sky fallback via `alchemize()` uses the canonical planetary-alchemy ESMS (`calculateEnhancedAlchemicalFromPlanets`). They yield different numbers. For a clean "natal ⊗ transit" story, consider routing the natal path through `calculateEnhancedAlchemicalFromPlanets(signMap, diurnal, aspects)` too (natal `chart.planetaryPositions` is already the `{Planet: ZodiacSign}` map it wants) — enhancement, not required to light the panels.
- **Gate every change**: `bun run typecheck` (0), `bunx eslint --config eslint.config.mjs src --max-warnings=0` (0), `bun run test` (should stay at 705 passed), `git diff --check`. Prod DB writes only via the canonical service; be careful with any backfill (prod DB reachable only via the Railway proxy — see memory).
- Branch off `master` (or continue on `feat/restaurant-best-match-explorer`, the long-lived staging branch), PR base = `master`.

## Key files
- `src/app/(alchm)/lab/page.tsx` — consumer + placeholder + copy (#3, #4)
- `src/contexts/UserContext/index.tsx` — stats derivation (~96–130, 327)
- `src/app/api/agent-forge/ignite/route.ts` — **the buggy write path (#1)**
- `src/services/userDatabaseService.ts` — read path + `updateUserProfile` (#1, #2)
- `src/app/api/user/profile/route.ts` — profile GET (#2)
- `src/utils/astrology/natalAlchemy.ts` — `calculateAlchemicalProfile`
- `src/services/RealAlchemizeService.ts` — canonical `alchemize()` / `planetaryAlignmentAlchemy()` (#3)
- `src/contexts/AlchemicalContext/` — `planetaryPositions` for the sky fallback (#3)
- `src/app/api/user/charts/route.ts` — a correct natal-chart writer for reference
- `src/components/auth/OnboardingWizard.tsx` — dead `/api/auth/register-alchemist` (#5)
- `database/init/45-agent-forge-schema.sql` — `alchemical_constitutions` (orphaned ESMS)
- `database/init/02-food-diary-schema.sql`, `12-fix-schema-health.sql` — `user_profiles` schema (no ESMS columns)
