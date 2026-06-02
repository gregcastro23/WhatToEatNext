# Next Session — Finish Recipe / Image / Nav Architecture

_Created: 2026-05-24, after PR [#440](https://github.com/gregcastro23/WhatToEatNext/pull/440) shipped the first pass._

## What just shipped (read this first)

PR #440 (`feat(recipes,nav): variable match%, recipe images, Olo removal, nav hover fix`) landed five workstreams:

1. **Variable match %** — [`PlanetaryScoringService`](src/services/planetaryScoring.ts) now blends sky × ruling planet + recipe elements × current sky + favorable-planet dignity + cooking-method affinity + ±6% deterministic per-recipe-id spread. `determineRulingPlanet` falls back to dominant-element → planet so similar dishes don't collapse onto Moon.
2. **Refine with Substance button** — removed; `/api/recipes/refine` + `OPERATION_COSTS` deleted.
3. **Recipe images** — 579/579 backfilled to `https://assets.alchm.kitchen/recipes/{uuid}.png` via [`scripts/generate-recipe-images.ts`](scripts/generate-recipe-images.ts) (Cloudflare Workers AI SDXL → R2 → `recipes.image_url` + `read_model.image_url` + Redis catalog bust). Ingredient script gained meat-aware prompt + `--only=<slug>` + slug-keyed entry support; lamb regenerated as cooked chop, 54 ingredient images filled (mirepoix et al).
4. **Olo removal** — service + menu route + Stripe Olo branch all deleted; column-drop migration [`database/init/35-drop-olo-columns.sql`](database/init/35-drop-olo-columns.sql) runs on next Railway deploy.
5. **Nav hover fix** — removed the z-30 click-outside overlay that was stealing mouseenter from the z-auto hover bridge during pill → menu transit; click-outside now uses a document mousedown listener. Close timer bumped 280ms → 400ms. `/restaurants`, `/recipe-generator`, `/current-chart` added to mega-menus.
6. **Observability** — `/api/food-lab` no longer silently swallows DB errors (`classifyDbError` distinguishes network failures from SQLSTATE rejections). New `POST /api/admin/observability/slow-query-threshold` wires up the already-exported `setSlowQueryThresholdMs()`.

## Verify on prod before doing more work

The prior session verified everything in the dev preview. Production needs a smoke pass once PR #440 deploys:

- [ ] `/recipes?cuisine=french` on `alchm.kitchen` shows variable match % per card and real photographic images, not the fire-emoji placeholder.
- [ ] Hover a pill nav item → trace cursor down to a menu item → click. Panel should not snap shut mid-transit.
- [ ] `/restaurants`, `/recipe-generator`, `/current-chart` reachable from header.
- [ ] Lamb ingredient page shows the cooked chop, no animal face.
- [ ] Mirepoix ingredient page shows an image.
- [ ] Railway deploy ran `database/init/35-drop-olo-columns.sql` cleanly — verify with `\d restaurants` in psql; no `olo_restaurant_id` / `menu_sync_enabled` / `last_menu_sync`.
- [ ] `POST /api/admin/observability/slow-query-threshold` (admin auth) accepts `{"ms": 500}` and reflects in `GET`.

## What's architecturally incomplete

### A. Match-% verification on **all** 14 cuisines, not 8

Only 8 cuisines were spot-checked in the prior session (French, Italian, Chinese, Indian, Japanese, Mexican, Thai, Greek). The CUISINES_METADATA map has **14 production cuisines** plus HSCA. **Unverified**: African, American, Korean, Middle Eastern, Russian, Vietnamese. There's no reason they'd behave differently (the algorithm is cuisine-agnostic), but confirm and capture the table in a CHANGELOG entry or doc.

**Action**: load each unverified cuisine page, sample the unique match %, planets-in-rotation count, and confirm the spread is ≥10 unique values with ≥5 planets. Update PR description / changelog with the full table.

### B. Image generation has no "new recipe" hook

[`scripts/generate-recipe-images.ts`](scripts/generate-recipe-images.ts) is a one-shot backfill. When a new recipe lands in `recipes`, nothing auto-generates an image. Same for ingredients. The pipeline works but it's manual.

**Action options** (pick one):
1. **Cron**: a daily Railway/Vercel cron that runs the script — idempotent, only touches NULL rows. Smallest change.
2. **Webhook on INSERT**: a Postgres trigger → app webhook that fires generation per recipe. More plumbing.
3. **Admin button**: a "Backfill missing images" tile on `/admin` that fires the script remotely. User-driven, predictable cost.

Recommend (1) for recipes + a small admin button for one-off ingredient adds.

### C. Image regeneration is manual

The lamb fix required a hand-crafted ad-hoc Bash one-liner. There's no `--regenerate-slug=<x>` flow with a custom prompt-override for the script. If we improve the prompt logic, every existing image stays stale unless someone re-runs with `--force`.

**Action**: extend [`scripts/generate-recipe-images.ts`](scripts/generate-recipe-images.ts) with `--force` (regenerate all, ignoring existing image_url) and `--id <uuid>` (single recipe). Mirror in [`scripts/batchEnrichIngredients.ts`](scripts/batchEnrichIngredients.ts) — it already has `--force-images` and the new `--only=<slug>` but the prompt is hard-coded; add a `--prompt-override` for one-offs.

### D. Local dev can't see DB-backed images

Local dev has no `DATABASE_URL` in `.env.local` / `.env.development.local`, so `/api/recipes` falls back to the static [`getServerRecipes()`](src/actions/recipes.ts) which has no image field. Means **any image-related work needs prod DB access to verify locally**. The prior session worked around this by hitting the prod DB directly from scripts, but the local preview never showed images.

**Action options**:
1. Document a one-line override (`bun run dev` with `DATABASE_URL=<prod>` exported) in [README.md](README.md) for image-related work.
2. Add an opt-in flag like `USE_PROD_DB_FOR_DEV=true` that auto-pulls from `.env.production.local`.
3. Static-data parity pass — backfill the static `getServerRecipes()` output with the R2 image URLs from the DB so dev preview shows them too.

(3) is the most cohesive but the most work. (1) is one PR comment.

### E. Nav coverage — secondary surfaces not audited

Only the desktop header was audited. Other nav surfaces may have drifted:

- [ ] **Mobile tab bar** ([`src/components/nav/MobileGlassTabBar.tsx`](src/components/nav/MobileGlassTabBar.tsx)) — does it match the new 5-slot IA including `/restaurants`?
- [ ] **Footer** ([`src/components/nav/RedesignedFooter.tsx`](src/components/nav/RedesignedFooter.tsx)) — same check.
- [ ] **Command palette** ([`src/components/nav/CommandPalette.tsx`](src/components/nav/CommandPalette.tsx)) — should expose `/restaurants`, `/recipe-generator`, `/current-chart` via `getAllNavRoutes()` from [`src/config/navigation.ts`](src/config/navigation.ts:180). Likely already does (palette pulls from NAV_IA) but verify.
- [ ] **Profile sub-nav** — `/profile`, `/profile/security`, `/profile/birthchart`, `/profile/preferences`, `/profile/budget`, `/profile/day-night-effects` are all live but the only entry point is the user chip → `/profile`. Decide: leave as-is (profile has its own sidebar), or surface in a "You" section in nav.
- [ ] **Admin nav** — `/admin/*` pages are reachable only by typing the URL. Admin layout probably has its own internal nav; verify.

### F. Nav hover — close-on-blur edge cases

The new document mousedown listener handles click-outside but doesn't handle:

- Cursor jumps from one pill button straight to another (different mega-menu) without re-entering the pill container. Should the menu instantly switch? Right now it does (pill `onMouseEnter` sets `openMenu={k}`), which is the right behavior — verify it still works after the overlay removal.
- Long-press on touch devices — the 400ms close timer may fire mid-tap. Audit `onTouchStart` / `onTouchEnd` handlers (likely absent — touch users get click semantics, which works).
- Focus management on Esc — the current listener only closes; doesn't return focus to the pill button. Lighthouse a11y will complain.

### G. Olo cleanup — verify migration ran

The column-drop migration ([`database/init/35-drop-olo-columns.sql`](database/init/35-drop-olo-columns.sql)) only runs if Railway re-executes `init/*.sql`. Confirm Railway's deploy pipeline does that — otherwise schedule it manually via psql.

Also: [`CLAUDE.md`](CLAUDE.md) — does it mention Olo anywhere? Probably not, but grep and scrub if so.

### H. Food Lab error handling — no UI surfacing

[`classifyDbError`](src/app/api/food-lab/route.ts) returns 5xx on rejection now, but the [`MealPlanProvider`](src/contexts/) / Food Lab UI may still optimistically show "Saved!" without checking the response status. Need to:

- Audit the Food Lab POST call site.
- On 5xx, show an inline error toast and keep the form in a "needs retry" state.
- Decide whether to keep the in-memory fallback at all — it's only useful if DB is unreachable, never for production users.

### I. Slow-query admin endpoint — no UI

The endpoint exists, no admin dashboard tile calls it. Add a slider or numeric input under `AdvancedMetricsPanel` in [`src/app/admin/_dashboard/`](src/app/admin/_dashboard/) that shows the current threshold and lets the admin POST a new value. Show the `previousMs` + `note` from the response.

### J. Image pipeline architecture (longer-horizon)

Current hardcoded chain: Cloudflare Workers AI SDXL → R2. No abstraction. If we ever want to swap to Gemini Imagen or DALL-E 3 (for better food photography quality), it's a script rewrite. Worth extracting:

- `src/lib/image-gen/providers/` — `cloudflareWorkersAI.ts`, `googleImagen.ts`, etc., each implementing `generate(prompt, opts): Promise<Buffer>`.
- `src/lib/image-gen/storage.ts` — `uploadToR2(key, buf, contentType): Promise<url>`.
- `scripts/generate-recipe-images.ts` and `scripts/batchEnrichIngredients.ts` import from this lib instead of inlining the CF + R2 logic.

Same change unblocks A/B prompt testing and per-category provider routing (e.g. use Imagen for dessert close-ups, SDXL for ingredient flatlays).

### K. Test coverage

Zero tests added in PR #440. The scoring formula is the most test-worthy:

- `calculateOverallScore` → table-driven test: given recipe + position fixture, assert score is within ±2 of expected.
- `recipeIdSpread` → property test: same id always returns same value, range is within ±0.06.
- `classifyDbError` → ECONNREFUSED → "unavailable"; mock SQLSTATE error → "rejected"; AggregateError → "unavailable".
- `extractDescriptionSnippet` (in [`scripts/generate-recipe-images.ts`](scripts/generate-recipe-images.ts)) → snapshot a few real descriptions.

## Out of scope (do NOT pull into this work)

- HSCA recipe import (the user's separate track — note `HSCArecipes/`, `database/init/01-schema.sql` HSCA enum addition, `scripts/extract_recipes_llm.py`, `recipes_database.json`).
- Cooking-methods audit (the user's other track — `src/data/cooking/cookingMethods.ts` simmering addition, `audit-reports/cooking-methods-gap-analysis.md`).
- WTEN migration sessions 6-11 (tracked separately in `WTEN_MIGRATION_PLAN.md`).

## Suggested order of attack for the next session

1. **Verify on prod** (smoke checks above) — 15 min, no code.
2. **Full-cuisine match-% sweep** (A) — 15 min, scripted iteration.
3. **Mobile tab bar + footer + command palette audit** (E) — 30 min.
4. **Slow-query admin UI** (I) — 45 min, fits the existing AdvancedMetricsPanel pattern.
5. **Food Lab UI error surfacing** (H) — 30 min.
6. **Image regeneration `--force` + `--id` flags** (C) — 30 min, defensive prep for prompt iteration.

Bigger items (B image hooks, D dev-DB story, J pipeline refactor, K tests) → propose to the user before starting.
