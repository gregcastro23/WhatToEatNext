# Phase 42 Closeout — Domain Loose Optionality, Bare JSON Casts, Assertion Sites, Scripts Typecheck

**Date:** 2026-09-25
**Base:** `master` @ `debd62df`, then merged with `origin/master` @ `b20e3baf` (#890–#893)
**Branch:** `codex/phase-42-domain-loose-optionality`

Phase 42 met all four ceilings. Removing the casts exposed four real defects,
all now fixed (§3). Five opaque `z.custom` sites remain on purpose (§4): the
honest schema for each needs a data audit or an owner ruling.

An earlier session wrote the plan, recut the branch off master, and crashed
partway through Workstream A. This report covers the finished work, measured
after merging current master.

---

## 1. Results

| Metric | Phase 41 baseline | Phase 42 ceiling | Measured | |
|---|---:|---:|---:|---|
| Domain loose optionality (`?: T \| undefined`) | 170 | ≤ 150 | **133** | ✅ −37 |
| Wire loose optionality (allowlisted) | 89 | ≤ 89 | **89** | ✅ unchanged |
| Bare JSON casts, production | 115 | ≤ 100 | **97** | ✅ −18 |
| Bare JSON casts, total | 124 | ≤ 110 | **106** | ✅ −18 |
| Scripts typecheck errors | 30 (14 files) | ≤ 20 | **9 (6 files)** | ✅ −21 |
| Single assertion sites | 2,942 | ≤ 2,900 | **2,889** | ✅ −53 |
| Total assertion sites | 3,106 | — | **3,053** | −53 |
| Non-null assertions | 602 | no increase | **599** | −3 (−2 this phase) |
| Tracked lint debt | 1,308 | ≤ 1,308 | **1,304** | ✅ −4 |
| Declined-rules pool ¹ | 4,877 | no ceiling | **4,856** | −21 |

¹ Includes the changes from #890–#893, which were merged into the branch
before measuring.

The ratchets (`lint:debt:ratchet`, `check:bare-json:ratchet`,
`check:scripts:ratchet`) were run on the merged tree, and the baselines are
committed.

---

## 2. What changed

### A. Loose optionality (170 → 133) — `716d1e46`, plus the meal-plan route in B1

- **`src/types/menuPlanner.ts` (15).** `?: T | undefined` is now `?: T`. The
  `| undefined` was there only because zod's `.optional()` produces it and the
  schemas are annotated `z.ZodType<MealSlot>`, etc. Those 15 fields in
  `src/lib/menu-planner/schemas.ts` now use `.exactOptional()`.
  - Every parse site reads JSON: two request bodies, the MenuPlannerProvider
    fetch, and the GET route re-parsing JSONB columns. JSON cannot carry an
    explicit `undefined`, so no valid input is newly rejected.
  - A new test covers the JSON round-trip, key absence, and rejection of
    explicit `undefined`.
- **`NutritionVisualization.tsx` / `RecipeClient.tsx` (19).** The two identical
  9-field nutrition types are now one exported `NutritionData`. Its keys are
  always present and may hold undefined (`key: T | undefined`), which is exactly
  what `getNutrition()` builds. `ASharpBlock`'s `ingAlch` is always passed, so
  it is required too.
- **`api/users/me/meal-plan/route.ts` (3).** The DTO moved to
  `src/types/userMealPlan.ts`. `rowToDTO` now omits unset fields instead of
  assigning `undefined`. The JSON on the wire is identical.

Emitted JS (`ts.transpileModule`, before vs after) is identical for
`menuPlanner.ts`, `NutritionVisualization.tsx` and `RecipeClient.tsx`.
`schemas.ts` differs only by the 15 `.exactOptional()` calls.

### B. Bare JSON casts (115 → 97)

**B1 — `8c03d7a2`: six of the eleven opaque `z.custom<T>()` sites, plus one extra cast.**

Each schema is drift-guarded against a *named* server response type, and each
route now annotates `NextResponse.json<T>(…)`. A failed parse is logged with
`_logger.error` and keeps what the screen already showed. The old pattern,
`parsed.success ? parsed.data : {}`, silently swapped the data for nothing.

| Site | Schema | Notes |
|---|---|---|
| `useChatInbox` | `InboxEntryView`: the fields `InboxList` reads | Hook and list are typed on the view |
| `CommentComposer` (feed) | `FeedCommentSchema`, exact both ways | If a stored comment's reply is unreadable, the composer says it was posted |
| `CommentThread` (feed) | same | Also removes its own `res.json() as` cast and two `!` |
| `CommentList` (tables) | `TableCommentSchema`, exact both ways | — |
| `useMealPlan` ×2 | `MealPlanEntrySchema`, guarded server DTO → schema → hook type | — |
| `useFoodDiary` summary | none needed | Bug fix, §3.1 |

**B2 — `c06c9a4e`: all 11 admin `(await res.json()) as T` casts.**

- **Overview panels.** SystemStatus, OnboardingFunnel, TodaysHighlights,
  UserInsights and Reliability each get a full-payload schema in
  `src/lib/admin/schemas/`, guarded both ways. Each panel's hand-copied
  interfaces become aliases of the validated type, so there is one less place
  for drift. Each service exports a named `<X>Response`, and each route
  annotates it; emitted JS for routes and services is identical.
- **Settlement.** New wire types live in `src/types/adminSettlement.ts`. See §3.2.
- **Dashboard.**
  - Agent network and Monica telemetry: payload types stay in their route
    files and are imported type-only.
  - Agent sync: wire types live in `src/types/adminAgentSync.ts`.
  - ModerationQueue: see §3.3.

Tests:
- `src/lib/validation/__tests__/readerResponseSchemas.test.ts` sends each B1
  server type through JSON, including the sparse shapes.
- `src/lib/admin/schemas/__tests__/panelSchemas.test.ts` round-trips every
  admin schema's degraded payload (nulls, `live: false`, the Monica fallback's
  `error`).

### C. Assertion sites (2,942 → 2,889) — `c9a6ae7c` (−40), plus B (−13)

- **`planetaryAlchemyMapping.ts` (−23).**
  - `PLANETARY_SECTARIAN_ELEMENTS` is annotated
    `Readonly<Record<PlanetName, SectElementPair>>`, replacing 20 inline
    `as AlchemicalElement`.
  - A Map-backed `getSectElements(planet)` replaces the two
    `as Record<string, …>` lookups.
  - It also replaces the day-night-effects page cast, which claimed
    `"Ascendant"` was a table key.
  - The prototype-key fix is in §3.4.
- **`recipeBuilding.ts` (−6).** Four branches read `preferredCuisine` and
  `seasonalPreference`. `RecipeBuildingCriteria` never had those fields, and no
  file in the repo sets them, so the branches could never fire. They are
  deleted. `totalCriteria` stays at 10, so the reported ratio does not move;
  a comment records the 8-of-10 ceiling.
- **`astrologyUtils.ts` (−11).**
  - `LowercaseElementalProperties` has a string index signature, so
    `as keyof LowercaseElementalProperties` only widened `string` to
    `string | number`.
  - The two `Record<number, X>` lookups already return `X | undefined` under
    `noUncheckedIndexedAccess`.
  - Emitted JS is identical.
- **B (−13).** Removed 11 admin casts, one feed cast, and the diary test's
  `as Response`. Its default fetch mock now goes through `installFetchMock`
  and returns the route's real body.

### D. Scripts typecheck (30 → 9) — `9c385dd6`

No `as`, `!` or `as unknown as` was added under `scripts/`. A grep of the
scripts diff confirmed this, because `check:diff-assertions` scans only `src/`.

- **`scripts/lib/env.ts`: one `loadEnvFile`.** It replaces three byte-identical
  copies (−6), and it is unit-tested. Captures are checked `!== undefined`, so
  `KEY=` still reads as `""`; the plan's truthiness guard would have dropped it.
- **`requireEnv()` (−2).** The two backfills already threw on a missing
  `DATABASE_URL`, but the narrowing never reached the hoisted `main()`.
- **Token-id backfill (−2).** The already-checked registry address is passed
  into `main()`.
- **Image generators (−10).** They iterate `.entries()` instead of indexing.
- **Orphan count (−1).** The script prints the count its guard tested.

Remaining 9 errors: `auditIngredients` 1, `backfillHscaElementalProperties` 2,
`backfillMonicaPerConstruction` 2, `checkNoStrayKalchmFormula` 2,
`generate-cuisine-images` 1, `generate-esms-baseline` 1.

---

## 3. Defects found and fixed

1. **Signed-in food diary summary (user-facing).**
   - The problem: `GET /api/food-diary` returns `summary` as four totals
     (`totalCalories`, …), but `useFoodDiary` spread that into a
     `DailyFoodDiarySummary`. `NutritionDashboard` destructures
     `dailySummary.totalNutrition`, which the stub never had. The `z.custom`
     cast hid this.
   - The fix: the hook takes the real summary from `getServerDailySummary`,
     for the same day string the route got, alongside the stats and favorites
     actions it already called.
   - The hook test's default fetch mock had returned a summary shape the route
     never sends, which is why it missed the crash. It now returns the
     route's real body.
   - The signed-in test asserts the full summary, and it was red on the
     pre-fix hook.
2. **Settlement replies (real money).**
   - A 2xx retry or refund reply the panel could not read was shown as a
     failure ("HTTP 200"). The panel now says the order may already be settled.
   - A list body missing `lifetime` is treated as unreadable.
   - Both tests were red on HEAD. Agent sync gets the same "may already have
     synced" wording.
3. **ModerationQueue fabricated a zero.** A reports body without `reports`
   counted as 0 open reports. It is now an unknown count (`null`).
4. **Sect lookup by an inherited name.** `getPlanetarySectElement("constructor")`
   returned `undefined` while typed as an element. The Map lookup returns the
   documented `"Air"` fallback. The test was red on HEAD.

---

## 4. Deferred: five opaque `z.custom` sites (counted), and findings not changed

| Site | Why it was not converted |
|---|---|
| `src/contexts/PremiumContext.tsx:213` | **Needs an owner ruling.** The subscription route sends `subscription.tier: "standard"`, which is not in `SubscriptionTier` (`"free" \| "premium"`). So for every signed-in non-admin user, the context's `tier` is `"standard"` and `isPremium` is false (`/premium-table` reads it). `hasFeature()` would throw on `TIER_LIMITS["standard"]`, but nothing calls it. A correct schema changes entitlement either way. |
| `src/hooks/useFoodDiary.ts:155,267` (entries) | **Needs a data audit.** The write path stores `serving.unit` as any string, and its `foodSource` enum differs from the `FoodSource` type. A schema derived from `FoodDiaryEntry` could reject real rows and blank the diary. Audit the stored enum values first. |
| `src/hooks/useTables.ts:16,20` | `TableDetail` embeds the JSONB `CompositeSnapshot` (with `CompositeNatalChart` enums) and is read by 8 files. A strict schema turns one unexpected JSONB value into a blank table page. It needs either a view type per reader or a snapshot audit. |

**Found, not changed.** Fixing it changes scores, so it needs a ruling.
`calculateEnhancedStelliumEffects` compares `getHouseElement()` output
(`"Fire"`, …) against lowercase result keys, so the house-stellium bonus never
applies. A spawned task tracks it.

---

## 5. Workstream E — ASOL webhook signatures

Not verifiable yet. Signing is ASOL's Phase 2 (Standard Webhooks, dual-accept),
which lands in the ASOL repo, and WTEN does not modify ASOL. Once ASOL ships:
- Watch the `/admin/asol` signature-audit counts in shadow mode (`valid`,
  `unsigned`, `untracked`, `failed`).
- Before moving to `required`, expect `valid` to take over and `unsigned` to
  reach zero.

---

## 6. Verification

Run on the merged tree (branch + `origin/master` @ `b20e3baf`), 2026-09-25:

| Command | Result |
|---|---|
| `bun run verify:full` | ✅ exit 0: all 13 `verify:static` gates, then jest, then build |
| `bun run test` (inside `verify`) | ✅ 478 suites; 4,907 passed, 10 skipped, 0 failed |
| `bun run build` | ✅ exit 0; all 8 route budgets pass (`/` 199 kB page-only, 706 kB with layouts; `/recipes/[recipeId]` 332 / 821 kB) |
| `bun run lint` / `lint:scripts` | ✅ 0 errors; 93 warnings in `src/`, 25 in `scripts/` (cap 25) |
| `check:diff-assertions` | ✅ 0 new assertions. The first run caught a new `useUser as jest.Mock` in a test; that test was folded into the existing signed-in test instead. |
| `audit:dead-modules` | ✅ 0 unreachable |
| Emitted-JS equivalence | ✅ Type-only files are identical. Intentional differences, each read: `menu-planner/schemas.ts` (15 × `.exactOptional()`), the sect accessor, the dead-branch deletion, and the settlement route's two literal `action` values |

**Red-before-green.** These tests fail against the pre-fix code and pass after:
- the signed-in diary summary
- both new Settlement cases
- the sect lookup by an inherited name

**Not verified in a browser.** Every runtime change here sits behind a signed-in
or admin session and a live database: `/food-tracking`, the admin panels,
settlement, the inbox, comments and the meal plan. The one public surface
touched, the recipe nutrition panel, emits identical JS. The round-trip tests,
the drift guards and the full suite cover the parse paths.
