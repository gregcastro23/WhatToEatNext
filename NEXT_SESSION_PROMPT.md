# Continuation Prompt — Post-3.0

**Alchm.kitchen 3.0 is complete and deployed.**

## Release status

| Item | Status |
|---|---|
| PR #406 squash-merge | ⬜ Pending (ready — zero errors, zero warnings) |
| `git tag v3.0.0` on master | ⬜ After PR #406 merges |
| Railway Python backend | ✅ Deployed — commit `3361fe4` live |
| Vercel frontend | ✅ Auto-deploys on master merge |

**To finish the release after merging PR #406:**
```bash
git checkout master && git pull
git tag -a v3.0.0 -m "Alchm.kitchen 3.0 — The Modern Alchemist"
git push origin v3.0.0
```

---

## What 3.0 shipped (PRs #402–#406)

### Navigation & chrome
- **Nav IA** — `src/config/navigation.ts` (5-slot: Kitchen / Discover / Plan / Commensal / Lab)
- **AppChrome** — `AppChromeFooter` + `AppChromeTabBar` gate footer/tab-bar on chromeless paths
- **RedesignedHeader** — 5-slot nav with mega-menus + ⌘K affordance
- **CommandPalette** — `src/components/nav/CommandPalette.tsx` — ⌘K global palette (routes + actions + recent)
- **MobileGlassTabBar** — 5-slot bottom nav for mobile
- **RedesignedFooter** — full footer for marketing pages
- **Route group migration** — all auth-gated + app-surface pages now in `(alchm)` for dark chrome:
  - `birth-chart`, `current-chart`, `recipe-generator`, `planetary-chart`, `restaurant-creator`
  - `commensal`, `feed`, `cosmic-recipe`, `generated-recipe`, `food-tracking`
  - `profile/*` (all 6 sub-pages)

### Auth flows
- **AuthHandshake** — 6-step checklist at `/auth/establishing`
- **WelcomeBack** — returning-user splash
- **UpgradeGate** — two-tier (Apprentice / Alchemist) at `/upgrade`
- **AccountSessions** — device session log + revoke at `/profile/security`
- **Device sessions** — `database/init/33-device-sessions.sql` + `GET/DELETE /api/auth/sessions`
- **JWT augmentation** — `sessionId` + `deviceSessionId` in token

### Onboarding
- **Skip flow** — "Skip for now" CTA → `PATCH /api/onboarding { skipNatal: true }` → `/?prompt=natal`
- **NatalPromptBanner** — soft-prompt ribbon on home feed, dismissable via localStorage

### Backend hardening
- **`_aspects` fix** — removed from positions dict in both pyswisseph + pyephem backends ✅ DEPLOYED
- **Zod schema** — `SafePositionsRecord` transform filters non-object entries; `RailwayAspectSchema` added
- **HistoricalStatsService** — `sanitizePositions()` strips arrays before `alchemize()`

### Context refactor
- **MenuPlannerContext** — 2182-line monolith → 5 modules in `src/contexts/menu-planner/`:
  - `types.ts` (244 lines), `useWeekNavigation.ts` (65), `useMealSlots.ts` (498)
  - `MenuPlannerProvider.tsx` (1280), `MenuPlannerContext.tsx` barrel (28)
  - Public API unchanged — no consumers touched

### Analytics
- `track("command_palette_open")`
- `track("upgrade_gate_shown", { tier, from })`
- `track("upgrade_gate_converted", { plan: "alchemist" })`
- `track("auth_handshake_completed", { stepsCompleted: 6 })`

### Documentation
- `CHANGELOG.md` — keep-a-changelog from v1.0.0 → 3.0.0
- `README.md` — complete rewrite for v3.0
- `docs/API_REFERENCE.md` — all `/api/*` routes documented
- `docs/adr/001–005` — Architecture Decision Records
- `package.json` — `3.0.0`

---

## Repo state

- **Branch for new work:** create fresh branch off `master` after PR #406 merges
- **Base:** `master` (prod); `main` is stale — do not target it
- **Runtime:** Bun 1.3.13. Never `npm`/`yarn`. Lockfile is `bun.lock`.
- **Build:** `bun run build` passes with 0 TS errors, 0 lint warnings before every PR.

---

## Post-3.0 backlog (no priority order)

### 3.1 candidates

**MenuPlannerProvider second pass**
`MenuPlannerProvider.tsx` is still 1280 lines. The next extraction candidates:
- `useCostEstimation.ts` — cost estimation + circuit metrics
- `useGenerationPreferences.ts` — generation pref state + persistence debounce
These share `currentMenu` state with the main provider, so they need careful interface design.

**Device session expiry cleanup**
Expired `device_sessions` rows linger until next sign-in. Options:
- Railway cron job: `DELETE FROM device_sessions WHERE expires_at < NOW()`
- Next.js middleware: lazy-clean on auth requests (adds latency)
- Scheduled `POST /api/internal/cleanup-sessions`

**Soft session revocation hardening**
Currently `DELETE /api/auth/sessions/[id]` removes the DB row but the JWT stays valid until expiry (up to 30 days). Full revocation requires edge middleware to check the DB on every request for the `jti`. Adds ~1ms latency per request on Railway internal networking.

**Onboarding skip → natal chart completion return**
Users who skipped onboarding see the `NatalPromptBanner`. Add a `?return=<route>` query to `/onboarding` so users who complete their chart mid-session are redirected back to where they were.

**`MealSlot.tsx` alchemicalQuantities type**
`src/components/menu-planner/MealSlot.tsx:166` — `alchemicalQuantities` typed as `any`. Define the proper type once the economy types are stabilized.

**Recipe popularity weighting**
`src/utils/cuisine/cuisineAggregationEngine.ts:389` — popularity-based weighting when recipe popularity data is available. `food_diary` entries could serve as the signal.

**Seasonal adaptation methods**
`src/data/unified/recipeBuilding.ts:2431` — 15 stub methods for seasonal ingredient substitution, cooking method adjustment, timing, temperature. Implement when seasonal recipe recommendations are a priority.

**PA-API (Amazon affiliate)**
`src/data/amazon/ingredientAsins.ts` — ASIN data exists but the affiliate API integration needs review. Low priority until Alchemist subscriber count justifies the integration cost.

### Known technical debt

| File | Issue |
|---|---|
| `src/services/PlanetaryKineticsClient.ts:184` | Placeholder — requires per-user birth chart data from DB |
| `src/services/PlanetaryAgentsAdapter.ts:428` | Placeholder — requires real user elemental property data |
| `src/services/AstrologicalService.ts:305` | No integration with astrologize API result cache |
| `src/utils/cuisineAggregations.ts:48` | Only African and American cuisine data complete |

### Security / ops

- **`INTERNAL_API_SECRET`** — verify it is set in Vercel env vars. The `/api/feed` route logs a runtime warning if missing, meaning agent writes are unauthenticated in that case.
- **Token economy shop items** — if `unlock-cosmic-recipe` or `unlock-basic-recipe` rows are missing from the DB, the AI gen routes return 500. Verify in Railway DB that these rows exist.
- **Device sessions expiry cron** — expired rows accumulate until next sign-in. Schedule a cleanup job.
