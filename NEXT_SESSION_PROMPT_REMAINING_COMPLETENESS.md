# Session Prompt — Remaining code-completeness + cleanup (post Tier 1/Tier 3)

> Run in **WhatToEatNext** (`~/Desktop/WhatToEatNext-master`). Read `CLAUDE.md` first.
> **Conventions:** Bun only (`bun run dev|build|verify|test`); `master` is prod (Vercel auto-deploys);
> new work branches off `master`, PRs target `master`; husky pre-commit runs `typecheck && lint`;
> **always `bun run build` before pushing route changes** (it must be 0 errors / 0 warnings).
> **Operating MO: FIX > REMOVE** — complete/wire orphaned-but-real features; only delete true
> duplicates or genuinely dead stubs (and only after confirming 0 importers + green build).

## Where things stand (2026-06-02)
- **Tier 1 code-completeness: DONE** on `master` (#498 squash + follow-ups): real lunar phase,
  dominant modality, per-recipe planetary-alignment + cooking-time scoring, food-prefs server
  persistence, molecular-gastronomy panel, tarot→recipe filtering, agent-view filters, sauce dedup.
- **Tier 3 dead-code removal: DONE** on `master` (`b0e9962e` — 17 zero-importer stub/dup/plumbing
  files). Audited as sound: every deletion had a kept live equivalent (`sauceRecommender`,
  `alertService`, `astrology/positions`, `CuisineRecommender`, `IngredientRecommender`,
  `calculations/alchemicalEngine`) or was unmounted service-locator plumbing.
- **OPEN: PR #499** — "Tarot of the moment" (render on `/current-chart` + real `calculateTarotEffect`).
  Review/merge it.

## ⚠️ LIVE paths to protect (don't break/delete)
`src/utils/planetaryAlchemyMapping.ts` (`calculateEnhancedAlchemicalFromPlanets`) + `RealAlchemizeService`;
`astrology/positions.ts`; `alertService.ts`; `sauceRecommender.ts`; `IngredientRecommender.tsx`;
`CuisineRecommender.tsx`; `calculations/alchemicalEngine.ts`; `AlchemicalRecommendations.tsx` + its
hook `useAlchemicalRecommendations.ts`.

---

## Priority 1 — real code-completeness gaps (Tier 2, all FIX-not-remove)

### 1. FoodRecommender shows NO recommendations (biggest gap) ⏱M+
`src/components/FoodRecommender.tsx:108-120`: the `useMemo` returns **hardcoded** `recommendations: []`
(and `_chakraRecommendations: {}`), yet `recommendations` drives the whole render (used at ~219, 224,
233, 299, 395, 547). So the component renders an empty list.
- **First verify it's mounted** (`grep -rn "FoodRecommender" src/components/ClientPage.tsx src/app`).
  If live, this is a visible prod gap.
- **Fix:** implement the recommendation pipeline — derive real food/ingredient recommendations from
  the live planetary positions + `useChakraInfluencedFood()` (`chakraEnergies`/`_foodRecommendations`
  are already fetched on line ~96 but dropped) + the ingredient catalog. Wire `_foodRecommendations`
  and `_chakraRecommendations` (currently `_`-prefixed/discarded) into the returned object.
- **Done:** the component shows real, element/chakra-aligned recommendations that change with the sky.

### 2. Personalization learning doesn't persist ⏱M+
`src/lib/personalization/user-learning.ts:811` `loadFromCache()` is a no-op ("would load from
persistent storage"); the learning store is **in-memory only** → ephemeral in serverless (resets every
invocation). Live via `usePersonalization` (`learnFromRecipe`, `trackInteraction`).
- **Fix:** back the store with the DB. Likely reuse the existing `user_interactions` table (already
  persisted) for reads/writes, or add a small `user_learning` table (idempotent migration in
  `database/init/NN-*.sql` — additive `ADD COLUMN/CREATE TABLE IF NOT EXISTS`, no `CONCURRENTLY`).
  Implement `loadFromCache` to hydrate from DB and persist on `learnFromRecipe`/`trackInteraction`.
- **Done:** learned preferences survive a different device / cold start.

### 3. `IngredientService.analyzeRecipeIngredients` stub ⏱S
`src/services/IngredientService.ts:513-543` returns hardcoded `overallHarmony = 0.8` + fixed flavor
profile. It's declared in `interfaces/IngredientServiceInterface.ts` but **never called** (live callers
use `UnifiedIngredientService`'s real impl).
- **Fix (per MO):** delegate to `UnifiedIngredientService`'s real ingredient-harmony/flavor analysis
  so the method is functional if used. (Only if delegation is genuinely impossible is removal the call.)
- **Done:** `analyzeRecipeIngredients` returns a computed harmony/flavor profile, not constants.

### 4. Surface `AlchemicalRecommendations.tsx` (audit follow-up) ⏱S–M
`src/components/AlchemicalRecommendations.tsx` (kept; consumer of `useAlchemicalRecommendations` —
"recipe recs with dietary restrictions") appears **unmounted**. The deleted `EnhancedRecommendationEngine`
was the weaker duplicate; the fix>remove move is to surface the surviving real one.
- **Verify** it's truly unmounted (`grep -rn "AlchemicalRecommendations" src/app src/components | grep -v "AlchemicalRecommendations.tsx"`).
- **If unmounted + the feature is wanted:** mount it on a sensible page (e.g. `/recipes` or the home
  recommendations area). **If intentionally retired:** leave it (don't force a mount).

---

## Priority 2 — merge + branch hygiene
- [ ] **Review/merge PR #499** (tarot of the moment). Live view of `/current-chart` needs a signed-in
      session + natal chart (auth-gated), so it wasn't browser-verified — eyeball the render + the
      `calculateTarotEffect` resonance once merged.
- [ ] **Delete the stale remote branch `feat/cross-site-privy-unification`** — #498 was squash-merged
      (its branch auto-deleted); it was accidentally re-pushed with redundant already-merged content.
      `git push origin --delete feat/cross-site-privy-unification` (confirm it has nothing unmerged first).
- [ ] **`feat/tier2-code-completeness`** holds only an obsolete Tier 3 prompt
      (`NEXT_SESSION_PROMPT_TIER3_DEAD_CODE.md`, commit `22adb377`) — Tier 3 is done; delete the branch
      (and that prompt file is now moot).

## Priority 3 — roadmap backlog (`TECH_WEEK_ROADMAP.md` → Backlog)
- [ ] Harmonize `agent-recipes` (`Authorization: Bearer`) vs `sync-credit` (`X-Sync-Secret`) auth headers.
- [ ] Lab Book: persist ingested photos (Vercel Blob vs base64) + PDF / multi-page import; scope quests
      to `source === "scan"` so generator/riff saves don't count.
- [ ] Refactor `scripts/backfillRecipeAlchemicalQuantities.ts` to share `alchemizeExtractedRecipe`.
- [ ] 👤 Render Astrologizer/Imaginizer backend hibernation fix (separate repo `~/Desktop/Alchm_render_backend`) —
      bind `$PORT` unconditionally; guard image handlers; set Atlas Network Access. (Details in roadmap.)

## 🔒 Security (user action)
- [ ] **Rotate the Neon DB credential** that was found hardcoded in `scripts/migrate-neon-users.ts`
      (now env-based via `NEON_DATABASE_URL`, de-secreted before commit, never in git history — but the
      live secret sat on disk). Rotate if that Neon DB still exists. See memory `db-credential-exposure`.

## Verification protocol (every change)
1. `bun run verify` → 0 errors (lint warnings under the gate).
2. `bun run build` → green (0 errors / 0 warnings) before any push of route/component changes.
3. `bun run test` for touched services.
4. Branch off `master`; PR to `master`; conventional commit + `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
5. Update `TECH_WEEK_ROADMAP.md` (Tier 2 checklist) as items land.
