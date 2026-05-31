# Pre Tech Week V3 Site Audit

Date: 2026-05-31
App: Alchm.kitchen / WhatToEatNext
Local build: 3.0.0
Production health version: 2.1.0

## Status

- Local production build passes with Bun 1.3.13.
- Typecheck passes.
- Main lint passes.
- Quick lint now runs again; it exits with warnings only.
- Sampled public routes return 200 locally and in production.
- Protected profile/admin routes redirect to `/login` when signed out.
- Admin APIs return 401 without a session, as expected.
- Local `/api/health` returns healthy with database healthy.
- Production `/api/health` returns healthy but reports version 2.1.0, so production appears behind the v3 code in this workspace.

## Admin Surface

- `/admin`, `/admin/dashboard`, `/admin/users`, and `/admin/mcp` redirect to `/login` in unauthenticated local and production requests.
- Existing Chrome profile was not usable for an authenticated production dashboard pass: Chrome was not running, and the selected Chrome profile did not have the Codex extension installed.
- Code audit found `/admin/dashboard` still has several intentionally non-live panels or fallback/seeded sections:
  - `PractitionerGeo`: no location aggregation source.
  - `CostBurndown`: billing source not configured.
  - `EngineHealth`: offline eval/canary pipeline not wired.
  - `FALLBACK_DATA`: deterministic loading seed remains in the client dashboard contract.

## Fixed In This Pass

- Restored `bun run lint:quick` by aligning the fast ESLint config with the main config where needed and disabling type-service-only rules in the syntax-only fast path.
- Removed visible "coming soon" copy from the MCP top-up billing page.
- Prevented logged-out mobile navigation from prefetching protected `/profile`, eliminating the fresh RSC console error on the home page.
- Added `inert` to the closed grocery cart drawer so offscreen controls are not focusable while hidden.
- Fixed celestial runtime errors when Jupiter/Saturn positions are missing from fallback planetary data.
- Added spaced/lowercase lunar node keys to the ESMS ignored-body list so `"North Node"` no longer floods server logs as an unknown planet.

## Current Findings

1. Production is healthy but appears behind v3: `/api/health` reports `version: "2.1.0"` while this workspace builds `3.0.0`.
2. Admin dashboard authenticated inspection still needs a logged-in admin browser session or a test admin session fixture.
3. `/admin/dashboard` contains honest but visible operational gaps: no geo aggregation, no cost aggregation, and no recommendation eval/canary pipeline.
4. Quick lint still reports 27 warnings, mostly import order in tests and stale `GlobalPopup.js` imports/unused helpers.
5. Large first-load JS remains on heavy surfaces: `/menu-planner` around 570 kB, `/ingredients` around 558 kB, `/food-tracking` around 261 kB, `/profile` around 268 kB.

## Next Campaign Backlog

1. Deployment alignment: confirm whether v3 should be deployed to production and reconcile the health version mismatch.
2. Authenticated admin pass: run dashboard with an admin session and record live panel statuses, visible errors, and degraded sources.
3. Admin dashboard completion: replace or explicitly scope `PractitionerGeo`, `CostBurndown`, and offline eval placeholders.
4. Warning cleanup: reduce `lint:quick` warnings to zero, starting with `GlobalPopup.js`.
5. Bundle pass: inspect the heaviest routes and split large client components where practical.

## Evidence

- Screenshots are saved in this folder:
  - `home-local.png`
  - `home-local-patched.png`
  - `admin-local-auth-gate.png`
  - `admin-dashboard-local-auth-gate.png`
  - `account-billing-mcp-coming-soon.png`
  - `account-billing-mcp-patched.png`
