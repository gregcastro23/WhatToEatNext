# Changelog

All notable changes to Alchm.kitchen are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Fixed (pre-tech-week audit pass — `audit-reports/site-audit-2026-05-31/`)
- **Production version mismatch** — `/api/health` reported a stale hardcoded `2.1.0` because `npm_package_version` isn't populated in Vercel's serverless runtime. The version is now read from `package.json` and inlined at build time via `next.config.js` (`APP_VERSION`), consumed by the health route and structured logger. `package.json` bumped `3.0.0 → 3.1.0` to match the cut `v3.1.0` tag. (Audit backlog #1)
- **Admin dashboard honesty** — removed fabricated-but-`live`-labelled data from `/admin/dashboard`. The service layer (`dashboardPanelsService`) no longer substitutes placeholder values (`mrr || 1612`, `totalCalculations || 2743`, the `Math.max(signup*10, 84210)` funnel floor) in its live path; `CommercePanel`, `ElementalTraffic`, and the `PractitionersCohort` retention heatmap now render honest live / "not wired" states; the `FALLBACK_DATA` loading seed was zeroed. (Audit backlog #3)
- **`lint:quick` → 0 warnings** — deleted the dead `GlobalPopup.js` duplicate (superseded by `.tsx`, unreferenced) and relaxed `import/order` for test files in the fast ESLint config, mirroring the main config (which ignores `__tests__/`). (Audit backlog #4)

### Performance (pre-tech-week audit pass)
- **`/ingredients` First Load JS 558 kB → 180 kB (−68%)** — the route was a `"use client"` page importing the full ~2.6 MB ingredient catalog into the browser bundle. Split into a server component that projects the catalog down to the ~20 fields the UI reads (`src/lib/ingredients/slimIngredients.ts`, `server-only`) and a client island (`IngredientsExplorer.tsx`) fed via props. SSR/SEO preserved — all 1021 ingredients still prerendered. (Audit backlog #5)
- **`/profile` First Load JS 268 kB → 215 kB (−53 kB)** — code-split the five panels that only render on non-default tabs (`UserDashboard`, `AgentsPane`, `QuestPanel`, `YieldMultiplierCard`, `CosmicAlignmentCard`) via `next/dynamic`.

### In Progress
- WTEN migration sessions 7–11 — porting the remaining `planetary_agents-main` UI surface into `src/` (7 of 11 done; see `WTEN_MIGRATION_PLAN.md`)
- Real planetary alchemy replacing mock fallbacks in the recommendation/cuisine services

---

## [3.1.0] — 2026-05-29 — Modern Alchemist · MCP release

3.0 shipped the redesigned surface (`git tag v3.0.0`). 3.1 layers a published MCP server, an operational admin console, production-readiness hardening, and a tracked migration runner on top. (3.1 tag not yet cut.)

### Added

#### MCP server (PRs #454, #455, #457, #459, #464)
- **Bun-powered MCP tool surface** exposing the alchemical/synastry tools to MCP clients (Claude Desktop, Cursor, Cline). Stdio transport.
- **End-user API keys** — mint / list / revoke at `/profile/api-keys`, backed by `POST/GET /api/account/api-keys` and `DELETE /api/account/api-keys/[keyId]`. Plaintext is returned exactly once at mint time.
- **Stripe ESMS top-ups** — `POST /api/account/billing/mcp-top-up` opens a Stripe checkout for a top-up SKU; the webhook credits all four token axes idempotently (keyed on the checkout session id).
- **Tier-aware rate limiting** — `api_keys.rate_limit_tier` maps to a per-key RPM cap (`alchemist` 300, `apprentice`/`authenticated` 60) via `rpmForTier()`.
- **Telemetry / probe / economy instrumentation** — `mcp_invocations` table, a 4th dashboard telemetry tile (`mcpInvocationRate`), a synthetic MCP heartbeat probe, and per-invocation token debiting. Precision latency via `performance.now()`.
- **Cross-server admin panel** — `/admin/mcp` + `mcpNetworkService` aggregate WTEN's `mcp_invocations` with PA's `GET /api/admin/mcp-summary`; each source degrades independently to `live: false`.
- Migrations 44–47 (`user-daily-limits`, `agent-forge`, `mcp-invocations`, `synastry-cache`).

#### Operational admin console (PRs #445, #446)
- **`/admin` operational dashboard** — `TodaysHighlightsPanel` (24h vs prior-24h deltas), `LiveActivityPanel` (6-source merged feed), `SystemStatusPanel` (8 flow probes + dependency strip), `OnboardingFunnelPanel`, `ApiRouteHealthPanel`. Visibility-aware hardened polling (`useHardenedPolling`).
- **Operational health services** — `systemStatusService`, `onboardingHealthService`, `liveActivityService`, `todaysHighlightsService`, `userTimelineService`. All compute from existing signals; each degrades independently.
- **Hourly health snapshots + transition-based alerting** — `healthSnapshotService` + `alertService` (DB + Slack + email sinks, each independent; per-component cooldown).
- **5 synthetic probes** — onboarding-skip, cosmic-recipe gen, recommendations, Stripe-webhook reachability, auth-handshake. Cron-driven; results in `synthetic_probe_results`.
- **Observability persistence** — request-log, slow-query-log, and alert-log rings mirrored to DB so cold starts don't lose history. Daily prune cron.

#### Schema-drift cleanup + migration runner (PR #448)
- **Tracked, auto-applied migrations** — `_migrations` table + `scripts/migrate.ts` (TS, local) and `backend/scripts/run_init_migrations.py` (runs in the Railway backend container before uvicorn). `railway.json` watches `database/init/**`.
- Applied previously-skipped migrations (incl. 31 agent-profile columns) and restored lost column defaults (migrations 42–43) — same class of bug as the #447 signup outage.

#### Calc observability (PR #470)
- **`degraded` flag** (`src/types/degraded.ts`) — threaded from the positions layer (`astronomy-engine-fallback` / `stale-positions`) and `alchemize` (`monica-degenerate`) through `/api/alchm-quantities` to a badge on `/quantities`. Additive/optional — existing consumers unaffected.

### Changed

- **Database: PgBouncer transaction-mode compatibility** (PR #466, **ADR-007**) — `DB_POOLER_MODE`, `SET LOCAL statement_timeout` in transactions, connection-leak fix in `checkDatabaseHealth`, write-replay guard in `executeQueryWithRetry`.
- **Internal-URL centralization** (PR #467) — `src/lib/serviceUrls.ts` (`getServiceUrl` / `getServiceUrlSafe`, fail-loud) replaces scattered env reads.
- **DB module hygiene** (PR #470) — raw pool extracted to `src/lib/database/rawPool.ts`, breaking the `connection.ts ↔ slowQueryLog` import cycle.
- **Toolchain** — Docker dev image bumped to `node:26-alpine` (#389); GitHub Actions group bumped (#390).

### Fixed

- **Production-readiness hardening** (PR #465) — security, DB resilience, calc guards (kalchm base-clamp + finite guard, Sun-absent guard in `alchemize`, cross-backend rectification limited to finite/>0 values, NY-pinned signup/insight dedupe).
- **cosmic-recipe error contract** (PR #468) — `/api/generate-cosmic-recipe` returns `503` when the token debit throws server-side (`purchase_failed`) instead of masking it as a billing `402`; genuine balance failures keep the `402`.
- **Signup outage** (PR #447) — restored `NOT NULL DEFAULT`s on `users.email_verified` / `users.login_count` that had been lost from the migration history.

---

## [3.0.0] — 2026-05-18 — The Modern Alchemist

### Added

#### Navigation & Chrome (PR #405)
- **Navigation IA** — `src/config/navigation.ts`: single source of truth for all nav surfaces with 5 primary slots (Kitchen / Discover / Plan / Commensal / Lab). Exports `NAV_IA`, `activePrimaryFromPathname()`, `getAllNavRoutes()` for Command Palette consumption.
- **AppChrome** — `src/components/nav/AppChrome.tsx`: exports `AppChromeFooter` and `AppChromeTabBar` which gate the global footer/tab-bar on chromeless paths (`/login`, `/onboarding`, `/upgrade`, `/auth/*`).
- **CommandPalette** — `src/components/nav/CommandPalette.tsx`: global ⌘K search/action palette. Groups: RECENT (localStorage), ROUTES (from NAV_IA), ACTIONS (quick actions). Triggered via `window` events `alchm:palette:open` / `alchm:palette:close` or keyboard shortcut.
- **RedesignedHeader** — `src/components/nav/RedesignedHeader.tsx`: replaces the legacy 9-item nav with the 5-slot design. Includes mega-menu dropdowns and ⌘K affordance.
- **MobileGlassTabBar** — bottom navigation for mobile with 5 primary slots, frosted glass styling.
- **RedesignedFooter** — full footer for non-app marketing pages.

#### Auth Flows (PR #405)
- **AuthHandshake** — `src/components/auth/AuthFollowups.tsx`: 6-step post-OAuth checklist (OAuth → Identity → Record → Natal → Grants → Mesh) with 8-second cold-start budget UI. Shown at `/auth/establishing`.
- **WelcomeBack** — returning-user splash with "While you were away" planetary summary. Reads `alchm:last_user` from localStorage.
- **UpgradeGate** — two-tier paywall UI (Apprentice free tier / Alchemist premium). Practitioner tier folded into Alchemist features list. Shown at `/upgrade?from=<route>`.
- **AccountSessions** — session management at `/profile/security`: cookie scope matrix, device session log with one-click revoke.
- **UpgradeGateFromQuery** — wrapper that reads `?from=` query param and passes locked route to UpgradeGate.

#### Backend & Auth (PR #405)
- **Device Sessions** — `database/init/33-device-sessions.sql`: `device_sessions` table keyed by `user_id` and `jti` (JWT ID). Tracks user-agent, IP, created/last-seen/expires timestamps. Indexed for fast lookup and expiry cleanup.
- **JWT augmentation** — `src/types/next-auth.d.ts`: added `sessionId` and `deviceSessionId` fields to the JWT interface.
- **Auth JWT callback** — `src/lib/auth/auth.ts`: on first sign-in, writes a row to `device_sessions`, stores `jti` as `sessionId` in the JWT token.
- **Sessions API** — `GET /api/auth/sessions`: returns active device sessions, falls back to JWT introspection if DB unavailable. `DELETE /api/auth/sessions/[id]`: revokes a specific session.
- **Agent-sync status** — `GET /api/internal/agent-sync/status`: proxies to the FastAPI backend with `INTERNAL_API_SECRET`. Falls back to heuristic for `@agentic.alchm.kitchen` emails.

#### Toolchain (PR #402, #403)
- Migrated from Yarn to **Bun v1.3.13** (10× faster installs/builds).
- `bun.lock` committed as the authoritative lockfile.
- Storybook stories excluded from main `tsconfig.json` and `eslint.config.mjs` to prevent build failures from dev-only imports.

### Fixed

#### Production Bug Fixes (PR #406)
- **`_aspects` poisoning** — Python backend (`backend/utils/celestial_calculations.py`): removed `positions["_aspects"] = aspects` that put a list inside the positions dict. The aspects array is now returned as a top-level key in the response, not nested inside the planet positions record.
- **Zod schema hardening** — `src/lib/validation/railway.ts`: replaced naive `z.record(string, PlanetDataSchema)` with `SafePositionsRecord` transform that filters out non-object entries before validation. Added `RailwayAspectSchema` for the top-level `aspects` array.
- **HistoricalStatsService crash** — `src/services/HistoricalStatsService.ts`: added `sanitizePositions()` helper that strips arrays and non-objects from positions before passing to `alchemize()`.

#### Lint Cleanup (PR #406)
- Resolved all 22 pre-existing ESLint warnings (zero warnings in clean build):
  - `no-misused-promises`: wrapped async handlers in `void` in `AuthFollowups.tsx`, `CommandPalette.tsx`, `MobileGlassTabBar.tsx`
  - `jsx-a11y/interactive-supports-focus`: added `tabIndex={-1}` to `role="menu"` div in `RedesignedHeader.tsx`
  - `react/no-unescaped-entities`: `'` → `&apos;` in `AuthFollowups.tsx`
  - `import/order`: moved hook imports above `dynamic()` call in `lab/page.tsx`
  - `no-unused-vars`: removed unused `Glyph` import from ingredients page
  - `@typescript-eslint`: interface → type, prefer-template, consistent-type-definitions across nav/UI components
  - Removed stale `// TODO: Fix import` comments from `data/unified/` files

### Changed
- `src/app/(alchm)/layout.tsx`: replaced direct `LabHeader` mount with `AppChrome` wrapper. The layout now hides the public header/footer via `:has()` CSS selector.
- `src/app/layout.tsx` (root): always renders `RedesignedHeader`; gates `RedesignedFooter` via `AppChromeFooter`; gates `MobileGlassTabBar` via `AppChromeTabBar`; always mounts `CommandPalette`.
- `src/app/upgrade/page.tsx`: uses `UpgradeGateFromQuery` from `AuthFollowups`; two-tier (free/alchemist) instead of three-tier.
- `NEXT_SESSION_PROMPT.md`: updated to document 3.0 launch state and post-launch hardening backlog.

### Security
- Three-layer defense against `_aspects` position dict contamination: Python backend (source), Zod schema transform (API boundary), service layer sanitization (consumption).

---

## [2.3.0] — 2026-04-15 — The Bun Revolution

### Added
- Migrated from Yarn/NPM to **Bun v1.3.13** as the primary package manager and script runner.
- Native TypeScript execution via Bun runtime (eliminated `ts-node` and `tsx` loaders).
- **Railway PostgreSQL** internal networking: `postgres.railway.internal` for sub-1ms DB response times.
- Denormalized `read_model` JSONB column on recipes table for sub-100ms recipe loads (eliminates N+1 queries).
- Asset optimization: logo and hero images shrunk by 90%+.

### Changed
- `package.json`: pinned `packageManager` to `bun@1.3.13`.
- All Docker images updated to `oven/bun:alpine` base.
- GitHub Actions and CI workflows updated to use Bun cache strategies.

---

## [2.2.0] — 2026-03-01 — Planetary Agents

### Added
- Python FastAPI backend deployed to Railway for high-precision planetary position calculations.
- `pyswisseph` integration for NASA JPL DE sub-arcsecond ephemeris data.
- `pyephem` fallback for when pyswisseph is unavailable.
- Token economy system (Spirit / Essence / Matter / Substance currencies).
- Quest system for gamified user progression.
- Personalized live pricing: per-user birth chart × chart of the moment shapes per-token cost.

---

## [2.1.0] — 2026-01-15 — Alchemical Lab

### Added
- `/lab` — the Alchemical Laboratory page with real-time planetary dashboard.
- `(alchm)` route group with dark `#07060B` shell layout.
- `PlanetaryClock` component with ephemeris-accurate planetary positions.
- `SensoryRadar` — elemental balance spider chart.
- `PlanetaryChip` — compact planet glyph + position display.

---

## [2.0.0] — 2025-11-01 — The Alchemy Pivot

### Changed
- Rebranded from "WhatToEatNext" to **Alchm.kitchen** ("Modern Alchemist").
- Introduced alchemical theming: 4-element system, 14 alchemical pillars.
- Premium tier system: Apprentice (free) / Alchemist (paid).
- NextAuth.js v5 (Auth.js) with Google OAuth.

---

## [1.0.0] — 2025-06-01 — Initial Release

### Added
- Initial release: astrological meal planning with natal chart integration.
- Recipe catalog with elemental property scoring.
- Ingredient hierarchy: Ingredients → Recipes → Cuisines.
- Basic recommendation engine.

[Unreleased]: https://github.com/gregcastro23/WhatToEatNext/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/gregcastro23/WhatToEatNext/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/gregcastro23/WhatToEatNext/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/gregcastro23/WhatToEatNext/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/gregcastro23/WhatToEatNext/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/gregcastro23/WhatToEatNext/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/gregcastro23/WhatToEatNext/releases/tag/v1.0.0
