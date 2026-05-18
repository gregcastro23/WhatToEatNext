# Continuation Prompt — Post-3.0 Hardening

**Alchm.kitchen 3.0 is live.** The Modern Alchemist redesign shipped across PRs #402–#405. This prompt covers the first hardening sprint after launch.

## What landed in 3.0 (don't redo)

- **Nav IA** — `src/config/navigation.ts` (5-slot single source of truth: Kitchen / Discover / Plan / Commensal / Lab)
- **AppChrome** — `AppChromeFooter` + `AppChromeTabBar` gate footer/tab-bar on chromeless paths (`/login`, `/onboarding`, `/upgrade`, `/auth/*`)
- **RedesignedHeader** — replaces the 9-item legacy nav; mega-menus; ⌘K search affordance
- **CommandPalette** — `src/components/nav/CommandPalette.tsx` — routes + quick actions + recent, ⌘K global shortcut
- **MobileGlassTabBar** — bottom navigation for mobile; 5 primary slots
- **RedesignedFooter** — full footer for non-app marketing pages
- **AuthHandshake** — `src/app/auth/establishing/page.tsx` — 6-step checklist (OAuth → Identity → Record → Natal → Grants → Mesh) with 8 s cold-start budget UI
- **WelcomeBack** — returning-user splash with "While you were away" summary
- **UpgradeGate** — two-tier (Apprentice / Alchemist; Practitioner folded into Alchemist)
- **AccountSessions** — `/profile/security` — cookie scope matrix + session log + revoke
- **Device Sessions** — `database/init/33-device-sessions.sql` + `GET/DELETE /api/auth/sessions`
- **JWT augmentation** — `sessionId` + `deviceSessionId` written on sign-in in `src/lib/auth/auth.ts`
- **Agent-sync status** — `GET /api/internal/agent-sync/status` (FastAPI proxy with fallback heuristic)
- **Storybook** — stories excluded from TS build via `tsconfig.json`

## Repo state

- **Branch for new work:** create a fresh branch off `master`
- **Base:** `master` (prod); `main` is stale — do not target it
- **Runtime:** Bun 1.3.13. Never `npm` / `yarn`. Lockfile is `bun.lock`.
- **Build:** `bun run build` must pass with zero TS errors before every PR.

## Priority 1 — Server-side recipe-limit enforcement (critical security gap)

Routes that call the AI recipe generator have no hard cap server-side. Free users can bypass frontend token gates by hitting the API directly.

**Files to update:**

- `src/app/api/generate-cosmic-recipe/route.ts`
- `src/app/api/recipes/refine/route.ts`
- `src/app/api/alchemize/route.ts`

**Pattern to apply in each:**

```ts
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";
import { subscriptionService } from "@/services/subscriptionService";
import { TIER_LIMITS } from "@/lib/tierLimits"; // already exists

// At the top of the handler:
const session = await auth();
const tier = (session?.user as { tier?: string })?.tier ?? "free";
const userId = (session?.user as { id?: string })?.id;

// Apply monthly generation cap per tier
const limit = TIER_LIMITS[tier]?.recipesPerMonth ?? TIER_LIMITS.free.recipesPerMonth;
const rl = await rateLimit(request, { window: 30 * 24 * 60 * 60 * 1000, max: limit, bucket: `gen:${userId ?? ip}` });
if (!rl.success) {
  return NextResponse.json({ error: "Monthly generation limit reached", tier }, { status: 429 });
}
```

Verify `TIER_LIMITS` exists at `src/lib/tierLimits.ts`; if not, create it with the free/premium caps from `src/config/defaults.ts`.

## Priority 2 — MenuPlannerContext refactor

`src/contexts/MenuPlannerContext.tsx` has grown to ~1 200 lines. Split it into:

- `src/contexts/menu-planner/types.ts` — interfaces only
- `src/contexts/menu-planner/useMealSlots.ts` — slot CRUD
- `src/contexts/menu-planner/useWeekNavigation.ts` — week cursor + prev/next
- `src/contexts/menu-planner/MenuPlannerProvider.tsx` — composes the above, exports context

Keep the public surface (`useMenuPlanner()`) identical so consumers don't change.

## Priority 3 — Trial / onboarding flow completion

New users land on `/onboarding` but the natal-chart step has no "skip for now" CTA — they're blocked if they don't have birth data ready. Add a `Skip (add later)` button that:

1. Sets `onboardingComplete = true` in the DB (partial profile, no chart).
2. Redirects to `/` with a persistent `?prompt=natal` query that surfaces a soft-prompt banner.

Files: `src/app/onboarding/page.tsx`, `src/app/api/onboarding/route.ts`.

## Verification workflow

After each task:

```bash
bun run build          # must pass, 0 TS errors
bun run test           # existing test suite green
```

Then open a PR targeting `master` with title format: `feat(<scope>): <description>`.
