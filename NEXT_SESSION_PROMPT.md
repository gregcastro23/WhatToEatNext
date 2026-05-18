# Continuation Prompt — Phase 3 API Hydration

You're continuing the **Modern Alchemist** redesign for alchm.kitchen. The frontend layer is complete (Phase 1 atoms + Storybook, Phase 2 dashboard, Phase 3 Ingredient Hero). What's left is **wiring the three missing API routes** that currently surface as `AwaitingBackend` panels on the dashboard and as the trending ticker on the Ingredient Hero.

## Repo state

- **Branch:** `claude/great-haslett-00b6db` (worktree at `.claude/worktrees/great-haslett-00b6db`)
- **Base:** `master` (prod); `main` is stale — do not target it
- **Runtime:** Bun 1.3.13 only. Never `npm` / `yarn`. Lockfile is `bun.lock`.
- **Dev server:** `bun run dev` on `:3000`. Preview MCP works via `.claude/launch.json` config `dev`.

## What's landed (don't redo)

- [tailwind.config.js](tailwind.config.js) — full design tokens (oklch palette, elemental colors, fonts, animations)
- [src/app/globals.css](src/app/globals.css) — `.lab` / `.alchm-root` CSS variable block, typography utils, `.alchm-panel`, `.alchm-chip`, etc.
- [src/components/ui/alchm/](src/components/ui/alchm/) — 15 atoms/molecules: `Glyph`, `PlanetaryClock`, `ElementalMeter`, `CompatibilityRing`, `Sparkline`, `LiveTimecode`, `ScanLine`, `ProcurementKit` (copper), `PremiumGlow` (violet, `revealAmount=0.4`), `ThermoQuartet`, `IngredientCard`, `CuisineExplorerPanel`, `SauceLineagePanel`, `AstrologicalClockPanel`, `TonightsCompositionPanel`, `PipelinePanel`, `AgentImage`, `SeasonalityChart`, `SensoryRadar`
- [src/components/nav/LabHeader.tsx](src/components/nav/LabHeader.tsx) — sticky header with `data-alchm-header` attribute; mobile-first via inline `<style>` (NAV hidden < 900px)
- [src/app/(alchm)/layout.tsx](src/app/(alchm)/layout.tsx) — route group; uses `body:has([data-alchm-route])` selectors to hide legacy header/footer without modifying `src/app/layout.tsx`
- [src/app/(alchm)/page.tsx](src/app/(alchm)/page.tsx) — Laboratory Dashboard (3-col grid: natal rail / clock + hero / astrological clock + telemetry)
- [src/app/(alchm)/ingredients/[ingredientId]/page.tsx](src/app/(alchm)/ingredients/[ingredientId]/page.tsx) — Ingredient Hero (ticker + 3-col hero + seasonality + sensory radar + ProcurementKit + PremiumGlow gate)
- [src/lib/schemas/dashboard.ts](src/lib/schemas/dashboard.ts) — **Zod contracts for all five missing endpoints** (use these verbatim)

## Strategic constraints (already locked in)

- **Real-data-only**: no mocks at the page level. If data is missing, render `AwaitingBackend` (violet-dashed) — never fake values.
- **Mobile-first per page**: 375px → 760/900/1280 breakpoints inline via `<style>` tags within components.
- **One branch only**: `claude/great-haslett-00b6db`. PR target is `master`.
- **Per-route header swap** via the `(alchm)` group; never modify `src/app/layout.tsx`.

## Task — Implement three API routes

All three should follow the existing pattern in [src/app/api/ingredients/[name]/route.ts](src/app/api/ingredients/[name]/route.ts):
- `export const dynamic = "force-dynamic"`
- Wrap in `rateLimit(request, { window: 60_000, max: 60, bucket: "<name>" })`
- Return JSON matching the Zod schema in `src/lib/schemas/dashboard.ts`
- Validate the response with `.parse()` before returning so contracts can't drift silently

### 1. `GET /api/recommendations/ingredients` (priority — unblocks ticker + dashboard panel)

- **Schema:** `RecommendedIngredientsResponseSchema` in [src/lib/schemas/dashboard.ts](src/lib/schemas/dashboard.ts)
- **Source of truth:** `RecommendationBridge.ts` already computes this — find it via `grep -r "RecommendationBridge" src/`. The math (`match_score(transit_position, user.natal)`) lives there; this endpoint just needs to wire it to a route handler.
- **Query params:** `limit` (default 8), optional `userId` (fall back to anon resonance from `useAlchemicalSafe().planetaryPositions` server-side via the astrologize endpoint)
- **Response shape (verify against schema):**
  ```ts
  { items: Array<{ id: string; name: string; match: number; element: "fire"|"water"|"earth"|"air"; planet?: string; category?: string }> }
  ```
- **Consumers:** Ingredient Hero ticker bar (line in `page.tsx` already fetches `?limit=8`), dashboard "RECOMMENDED INGREDIENTS" panel.

### 2. `GET /api/cuisines/signatures`

- **Schema:** `CuisineSignaturesResponseSchema`
- **Source:** `backend/alchm_kitchen/data/json/cuisines.json` — each cuisine has a 4-element ESMS array (Earth/Spirit/Matter/Substance or Fire/Water/Earth/Air — verify the source).
- **Response shape:**
  ```ts
  { cuisines: Array<{ id: string; name: string; region: string; sig: [number, number, number, number]; match: number; color?: string }>, total: number }
  ```
- **Match calculation:** dot product of cuisine signature × current sky elemental weights (same resonance math as the recommendations endpoint).
- **Consumer:** dashboard "CUISINE EXPLORER · TIER III" panel (currently `AwaitingBackend`).

### 3. `GET /api/sauces/lineage?root=<id>`

- **Schema:** `SauceLineageResponseSchema`
- **Source:** `backend/alchm_kitchen/data/json/sauces.json` — has the mother-sauce derivation graph.
- **Response shape:**
  ```ts
  { nodes: Array<{ id: string; name: string; depth: number }>, edges: Array<{ from: string; to: string; method?: string }>, stats: { variants: number; maxDepth: number } }
  ```
- **Required:** the `root` query param picks the mother sauce. Return 400 if missing.
- **Consumer:** dashboard "SAUCE LINEAGE TREE" panel.

## Verification workflow

After each route:
1. `bun run dev` (use preview MCP `preview_start` with name `dev`)
2. Hit the endpoint directly: `curl -s 'http://localhost:3000/api/recommendations/ingredients?limit=8' | jq .`
3. Validate against the Zod schema in a one-off `bun src/lib/schemas/__verify.ts` if you want belt-and-suspenders.
4. Open the corresponding page (`/` for dashboard, `/ingredients/garlic` for the ticker) and confirm the `AwaitingBackend` panel was replaced by real data.
5. Resize to 375px and confirm mobile still works.

## Out of scope (don't touch)

- The legacy `src/app/ingredients/page.tsx` (Amazon Fresh pantry view) — that's a separate surface and remains untouched.
- Any modifications to `src/app/layout.tsx` (root).
- Storybook stories — already complete for all atoms.
- The trending ticker's secondary sort/personalization beyond `match_score` — keep this v1 minimal.

## When you're done

- Run `bun run build` to catch TS errors
- Commit per-route, message style: `feat(api): implement /api/recommendations/ingredients`
- Final PR title: `feat(alchm): hydrate Phase 2 backend (recommendations + cuisines + sauces)` targeting `master`

Pick up with the recommendations endpoint first — it unblocks two surfaces (ticker + dashboard panel) at once.
