# Changelog

All notable changes to Alchm.kitchen are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### In Progress
- MenuPlannerContext refactor: 2182-line file split into focused hooks
- All auth-gated pages migrated into `(alchm)` route group (dark chrome)
- Onboarding skip flow with `?prompt=natal` soft-prompt banner
- Vercel Analytics funnel events (CommandPalette, UpgradeGate, AuthHandshake)

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
