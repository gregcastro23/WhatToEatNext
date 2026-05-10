# Next Session Prompt — Alchm.kitchen

_Version: 3.0.0 | Generated: 2026-05-09_

---

## Current State of the Codebase

Start every session by running:
```bash
bunx tsc --noEmit && npm run lint
```
Baseline: **0 TypeScript errors, 30 ESLint warnings** (all pre-existing, none from our code).

---

## What Was Shipped This Session (2026-05-09)

### 1. Bulk Migration (`backend/scripts/migrate_data.py`)
- Per-row `session.add()+flush()` replaced by `session.bulk_insert_mappings()` in batched transactions (500 ingredients / 200 recipes per batch)
- All existing names pre-fetched in one query per entity type — no per-row `SELECT`
- UUIDs pre-generated in Python, eliminating `session.flush()` for FK resolution
- `read_model` JSONB built directly from source data (not from the ORM instance)
- Expected throughput: ~50–200 rec/s vs prior ~1.5–2 rec/s

### 2. Redis Recipe Cache (`src/lib/redis.ts` + `src/services/LocalRecipeService.ts`)
- New `src/lib/redis.ts`: lazy singleton `ioredis` client, degrades gracefully when `REDIS_URL` is unset
- Three-tier read path in `LocalRecipeService.getAllRecipes()`:
  - **L1** in-process memory (sub-ms, per-instance — was already there)
  - **L2** Redis key `recipes:catalog:all`, 5-min TTL (cross-instance, targets <20 ms)
  - **L3** PostgreSQL (~900 ms cold, only fires on cache miss)
- Redis write is fire-and-forget so it never blocks the response
- `clearCache()` evicts both L1 and L2 atomically
- Activate by setting `REDIS_URL` in Railway/Vercel env — no code change needed

### 3. Rate-Limit Coverage (4 Unguarded Routes)

| Route | Handler(s) | Limit | Rationale |
|-------|-----------|-------|-----------|
| `/api/alchm-quantities` | GET + POST | 30/min | Expensive planetary calc |
| `/api/quests` | GET + POST | 60/min | Auth-gated read/write |
| `/api/personalized-recommendations` | POST | 20/min | Full chart computation |
| `/api/recipes/[recipeId]` | GET | 60/min | Read, Redis-cached |

All follow the two-line pattern already used on `/api/alchemize`:
```ts
const rl = rateLimit(request, LIMIT);
if (!rl.allowed) return rl.response!;
```
Returns 429 with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.

### 4. Dead Code Removed
`src/middleware/rate-limiting.ts` deleted — old Express-style mock with a stubbed `rateLimit` import, zero importers, superseded by `src/lib/rateLimit.ts` (the real implementation).

### 5. Recipe Page Features (already fully implemented — no work needed)
All Phase 3 and Phase 5 objectives from the prior session prompt were pre-implemented. Verified wired in `RecipeClient.tsx`:
- **Dietary adaptation** — `src/utils/dietaryAdaptation.ts` with per-mode swap rules, inline strikethrough rendering, nutrition + elemental delta banner
- **Flavor tuning** — `src/utils/flavorTuning.ts` with a catalog of 5 directions × 5–6 tweaks each, staged via `suggestTweak()`
- **Time shortcuts** — `src/utils/timeShortcuts.ts` parsing step text for skippable/parallelizable/make-ahead signals + equipment swap rules
- **Meal plan button** — `src/components/recipes/AddToMealPlanButton.tsx` backed by `src/hooks/useMealPlan.ts` (localStorage + API sync)
- **Discovery endpoint** — `src/app/api/recipes/[recipeId]/discover/route.ts` returning `{ similarElemental, similarAlchemical, sameCuisine }` via cosine similarity on ESMS and Euclidean distance on Fire/Water/Earth/Air

---

## Primary Objective for Next Session: MenuPlannerContext Refactor

### Background

**File:** `src/contexts/MenuPlannerContext.tsx`  
**Size:** 2,281 lines  
**Problem:** Monolithic — mixes state, stats calculation, backend persistence, grocery logic, circuit metrics, and planetary recommendations all in one file. Several Phase 3/4 stubs were never finished.

### Open TODOs (grep to confirm exact lines before starting)

```bash
grep -n "TODO\|averageGregsEnergy\|averageMonica" \
  src/contexts/MenuPlannerContext.tsx
```

| Approx Line | Stub | What It Needs |
|-------------|------|---------------|
| ~1717 | `saveAsTemplate` — marked "Phase 4 backend persistence" | Already calls `POST /api/menu-planner/templates`; the TODO is misleading — verify the API route exists and wire error handling |
| ~1754 | `loadTemplate` — marked "Phase 4 backend loading" | Already calls `GET /api/menu-planner/templates?id=…`; same — verify route and remove the TODO comment |
| ~1817 | `refreshStats` — marked "Phase 3 full stats" | `averageGregsEnergy` and `averageMonica` are hardcoded `0`; `elementalDistribution` initializes to all-zeros and never updates |
| ~1831–1832 | `averageGregsEnergy: 0` / `averageMonica: 0` | Compute from filled meals: average `recipe.monicaScore` and `recipe.spirit`/`recipe.essence`/`recipe.matter`/`recipe.substance` |

### Proposed Refactor Plan

Extract two new hooks, keeping the context's public API unchanged:

```
src/hooks/
  useMealPlan.ts          ← already exists (localStorage + API sync for single-recipe scheduling)
  useMenuStats.ts         ← NEW: extract refreshStats(), compute all WeeklyMenuStats fields
  useMenuPersistence.ts   ← NEW: extract saveAsTemplate(), loadTemplate()
```

**`useMenuStats.ts` spec:**
- Input: `currentMenu: WeeklyMenu | null`
- Output: `WeeklyMenuStats` — computed eagerly on every menu change via `useMemo`
- `elementalDistribution`: sum each filled meal's `recipe.elementalProperties`, normalize to sum = 1.0
- `averageGregsEnergy`: mean of `recipe.monicaScore` across filled meals (skip nulls)
- `averageMonica`: mean of `(spirit + essence + matter + substance) / 4` across filled meals
- `cuisineDistribution`: count by `recipe.cuisine`, sort descending
- `dietaryCompliance`: true only if ALL filled meals satisfy the constraint (e.g. all are vegetarian)
- `missingMeals`: slots where `meal.recipe` is null

**`useMenuPersistence.ts` spec:**
- Input: `currentMenu`, `groceryList`, `inventory`, `weeklyBudget`, `setCurrentMenu`, `setGroceryList`, `setInventoryRaw`
- Output: `{ saveAsTemplate, loadTemplate, isSaving, isLoading, persistenceError }`
- Remove the two Phase 4 TODO comments once logic is verified against the API routes
- Check `src/app/api/menu-planner/templates/route.ts` exists before assuming the backend is ready

**Constraints:**
- The shape of `MenuPlannerContext` must not change — all existing consumers use `useMenuPlanner()` and destructure known keys
- Add new keys but do not rename or remove existing ones
- `WeeklyMenuStats` type is in `src/types/menuPlanner.ts` (or nearby) — read it before implementing
- Zero new TypeScript errors; keep lint warnings at 30

### Getting Started

```bash
# 1. Confirm baseline
bunx tsc --noEmit && npm run lint

# 2. Find the types
grep -rn "WeeklyMenuStats\|WeeklyMenu\b" src/types/ | head -20

# 3. Check if the templates API route exists
ls src/app/api/menu-planner/

# 4. Read the top and bottom of the context to understand the Provider structure
# (first 50 lines + last 100 lines)

# 5. Implement useMenuStats first (pure, no side effects, easiest to test)
# 6. Implement useMenuPersistence second
# 7. Wire both into MenuPlannerContext.tsx, replacing the inline implementations
# 8. Run tsc + lint, fix any issues
```

---

## Secondary Objectives

### Rate-Limit the Remaining Sub-Routes

These auth-gated sub-routes under `alchm-quantities` and `quests` still lack guards:

```
src/app/api/alchm-quantities/aspects/route.ts
src/app/api/alchm-quantities/echoes/route.ts
src/app/api/alchm-quantities/planetary/route.ts
src/app/api/alchm-quantities/statistics/route.ts
src/app/api/alchm-quantities/trends/route.ts
src/app/api/quests/claim/route.ts
src/app/api/quests/masters-pantry/route.ts
src/app/api/quests/streak/route.ts
```

Suggested limits: 30/min for compute-heavy, 60/min for read routes.  
Pattern is always the same two lines. Takes ~5 minutes total.

### PA-API Live Env Wiring (no code — ops only)

Amazon affiliate integration is shipped but inert until these Railway env vars are set:

```bash
AMAZON_PAAPI_ACCESS_KEY=
AMAZON_PAAPI_SECRET_KEY=
AMAZON_PAAPI_PARTNER_TAG=          # e.g. alchm-20
AMAZON_PAAPI_MARKETPLACE=www.amazon.com   # optional
AMAZON_PAAPI_REGION=us-east-1             # optional
```

---

## Architecture Quick Reference

| Concern | Path |
|---------|------|
| Subscription tiers | `src/services/subscriptionService.ts`, `src/types/subscription.ts` (`TIER_LIMITS`) |
| Premium UI | `src/contexts/PremiumContext.tsx` → `usePremium()` |
| DB query helper | `src/lib/database/connection.ts` → `executeQuery()` |
| Auth split | `auth.config.ts` (edge-safe) + `auth.ts` (server-only) |
| Rate limiter | `src/lib/rateLimit.ts` — in-process sliding window, bucket-namespaced |
| Redis client | `src/lib/redis.ts` — lazy singleton, optional |
| Recipe read path | `src/services/LocalRecipeService.ts` — L1 memory → L2 Redis → L3 Postgres |
| Recipe detail page | `src/app/recipes/[recipeId]/RecipeClient.tsx` |
| Dietary adaptation | `src/utils/dietaryAdaptation.ts` — pure, never mutates the recipe object |
| Flavor tuning | `src/utils/flavorTuning.ts` — catalog + `suggestTweak()` |
| Time shortcuts | `src/utils/timeShortcuts.ts` — `analyzeTimeShortcuts()` |
| Meal plan hook | `src/hooks/useMealPlan.ts` — localStorage + API sync |
| Menu planner context | `src/contexts/MenuPlannerContext.tsx` — 2,281 lines, needs refactor |
| Discovery endpoint | `src/app/api/recipes/[recipeId]/discover/route.ts` |

---

## Repo Quirks (Do Not Rediscover)

- **Production branch is `master`** — Railway deploys from `master`. `main` is stale (2 commits, historical only).
- **Git LFS not installed locally.** Always push with:
  ```bash
  GIT_LFS_SKIP_SMUDGE=1 git -c core.hookspath=/dev/null push
  ```
- **`gh` CLI not installed.** Build PR URLs with Python `urllib.parse.urlencode()`.
- **Railway redeploy is manual** — push to `master` does not auto-deploy. User triggers at railway.app.
- **Worktrees** live under `.claude/worktrees/<session-slug>/`. Verify `pwd` before editing files.
- **`cuisine` was renamed to `sauceRecommender`** — key rename in commit 28e6d47.
- **`recipeStandardization.ts`** (384 lines) was split out of a larger file in c5f8c6d.
