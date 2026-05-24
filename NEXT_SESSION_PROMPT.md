# NEXT_SESSION_PROMPT — Operational Hardening (post-multi-debt PR)

Welcome to the next engineering session for **Alchm.kitchen (WhatToEatNext)**.

The previous session shipped a single multi-debt PR covering six operational items:

1. **`system_health_snapshots`** — hourly snapshots of the full `SystemStatusPayload` (JSONB) for drift detection and transition-based alerting.
2. **`alertService` with 3 sinks** — fires on `OK ↔ DEGRADED ↔ INCIDENT` transitions to DB (`alert_events`), Slack webhook, and email via Resend. Each sink dispatches independently.
3. **4 new synthetic probes** — `cosmic-recipe` (hourly, real gen), `recommendations` (15 min), `stripe-webhook` (15 min, unsigned-body 4xx assertion), `auth-handshake` (15 min, `GET /api/auth/sessions`).
4. **Observability log persistence** — `request_log_entries` + `slow_query_log_entries` tables with hydration on cold start (in-memory ring stays the fast path).
5. **Recipe-gen now charges all four ESMS tokens** — `unlock-cosmic-recipe` and `unlock-basic-recipe` shop-item bases moved from `{spirit, essence}` only to all four axes (cosmic 7.5 × 4 = 30 total; basic 2.5 × 4 = 10 total). The existing personalization layer (`applyPersonalizedPricing` × natal × current sky) now shapes the debit across **all four** axes — Matter/Substance debits used to always be zero. Migration 40.
6. **Doc cleanup** — `CLAUDE.md` corrected (MenuPlannerProvider was already extracted; recipe hard-cap tech debt removed as it's intentional design).

**Everything is wired but most of it is dormant** until env vars land — that's the most important first task below.

---

## 🚀 Environment

- **Toolchain**: Bun **1.3.13** only (`bun install`, `bun run dev`, `bun run build`). Never `npm` / `yarn`.
- **Master is production.** Vercel auto-deploys on merge. Railway auto-deploys the Python backend.
- **Verification gate** before every PR (CLAUDE.md requirement): `bun run verify` must show **0 TS errors and 0 lint warnings**, and `bun run build` must succeed.
- **Local Postgres** is unreachable from your shell. To touch the prod DB safely:
  ```bash
  railway run --service Postgres bun scripts/run-sql-migration.ts <path-to-sql>
  railway run --service Postgres bun scripts/verify-table.ts <table_name>
  ```
- **Today's date** is in CLAUDE.md's user context. Use absolute dates when memoizing.

---

## 🔥 Priority 1 — Apply migrations + wire env vars (~30 min)

The new tables aren't in prod yet. Apply the four migrations and set the env vars before any cron fires usefully.

**Apply migrations (in order):**
```bash
railway run --service Postgres bun scripts/run-sql-migration.ts database/init/37-system-health-snapshots.sql
railway run --service Postgres bun scripts/run-sql-migration.ts database/init/38-alert-events.sql
railway run --service Postgres bun scripts/run-sql-migration.ts database/init/39-observability-persistence.sql
railway run --service Postgres bun scripts/run-sql-migration.ts database/init/40-recipe-shop-items-four-token-cost.sql

# Verify
railway run --service Postgres bun scripts/verify-table.ts system_health_snapshots
railway run --service Postgres bun scripts/verify-table.ts alert_events
railway run --service Postgres bun scripts/verify-table.ts request_log_entries
railway run --service Postgres bun scripts/verify-table.ts slow_query_log_entries
```

> **Migration 40 sanity check:** confirm `unlock-cosmic-recipe` charges all four tokens after the update.
> ```bash
> railway connect Postgres -- -c "SELECT slug, cost_spirit, cost_essence, cost_matter, cost_substance FROM shop_items WHERE slug LIKE 'unlock-%-recipe';"
> # cosmic: 7.5 / 7.5 / 7.5 / 7.5   basic: 2.5 / 2.5 / 2.5 / 2.5
> ```

**Set / verify Vercel env vars:**

| Var | Purpose | Required? |
| --- | --- | --- |
| `CRON_SECRET` | Auth for all `/api/cron/*` routes (`Authorization: Bearer …`) | **Yes** — without it, every cron returns 401 |
| `SYNTHETIC_PROBE_TOKEN` | Bearer for the 4 auth'd probes (onboarding, cosmic-recipe, recommendations, auth-handshake) | **Yes** for those 4 |
| `SYNTHETIC_PROBE_BASE_URL` | Override (defaults to `$VERCEL_URL`) | Optional |
| `ALERT_SLACK_WEBHOOK_URL` | Slack incoming webhook URL | Optional — alerts skip Slack when unset |
| `RESEND_API_KEY` + `AUTH_ADMIN_EMAIL` | Already set; reused for alert emails | Inherited |

**Verify each cron fires (15 min for the fast ones, 1 hour for snapshot + cosmic-recipe):**
- Vercel → Crons tab → green ticks against all 6 entries.
- `/admin` → System Status panel: every flow tile shows a `Synthetic: success` chip (instead of `—`).
- DB sanity:
  ```bash
  railway run --service Postgres bun scripts/verify-table.ts synthetic_probe_results  # should have rows for all 5 probe_names
  railway run --service Postgres bun scripts/verify-table.ts system_health_snapshots   # ≥ 1 row after first hour
  ```

**Failure modes to expect first run:**
- `CRON_SECRET` missing → all crons 401, `Synthetic: failure` chips appear within 15–60 min. Fix env, next run flips green.
- `SYNTHETIC_PROBE_TOKEN` missing → probes record `failure` with message `SYNTHETIC_PROBE_TOKEN not configured — probe disabled`.
- Synthetic user not funded with tokens → cosmic-recipe probe will fail on 402 once it tries to gen. Grant the synthetic user 500+ of each token via `/admin` → Grant Tokens before turning on the cosmic probe.
- No Slack webhook → email-only alerting still works; DB sink always works.

---

## 🎯 Priority 2 — Drive to 10 real users

The dashboard is now genuinely useful at the 10-user stage. Use it to inform the next product moves:

- **TodaysHighlightsPanel** shows the day-over-day delta on signups, onboardings, recipe activity, diary entries, token transactions. If signups are 0, the dashboard tells you immediately.
- **LiveActivityPanel** is the heart of the site at this stage — one operator can sit on `/admin` and watch every meaningful event happen in near-real-time (30 s polling).
- **OnboardingFunnelPanel** surfaces stuck users (signed up >1h, not onboarded) before they churn. Reach out manually for the first 10.
- **`/admin/users/[userId]`** is the deep-dive: click any user from `/admin/users` → see their full timeline, balances, lifetime stats. Use this to debug "did this user actually get to a recipe?"

**Possible work tracks** for the next session(s):
1. **First real users**: invite list, post to social, ship to 10 friends. Use the dashboard to see what breaks.
2. **Onboarding polish**: if stuck-user count climbs, dig into `/api/onboarding` failures via System Status' "Recent issues" expander.
3. **Recipe-gen polish**: AI generation flow (`/api/generate-cosmic-recipe`) is the second-highest-value flow — surface its health on the dashboard if it gets traffic.
4. **Mobile dogfood**: with `/admin` now mobile-responsive, you can triage from your phone. Worth trying for a week.

---

## 🧹 Known tech debt to chip at

In rough priority order:

1. **`/admin/dashboard` agent role detail panels were deleted** (sous-chef, galileo, substitution, pantry, procurement, lineage, reasoning trace). Rebuild them with real per-role telemetry **only when you have real role-specific data** to surface — e.g. once the PA backend exposes per-role dispatch counts.
2. **WTEN UI migration** still has sessions 6–11 outstanding — see [WTEN_MIGRATION_PLAN.md](WTEN_MIGRATION_PLAN.md).
3. **Dependabot PRs** — periodic merge sweeps.
4. **Slow query threshold tuning** — currently 200 ms (configurable via `SLOW_QUERY_THRESHOLD_MS`). Might be too noisy or not noisy enough once real traffic arrives; tune from `slow_query_log_entries` aggregates.
5. **`feedEmitTracker` cold-start loss** — last-emit state still wipes on restart (`requestLog` and `slowQueryLog` now persist). Low priority since the next emit re-populates within the polling window.
6. **System-health snapshot retention** — hourly snapshots write forever. At ~8.8k rows/year Postgres is fine, but a yearly prune would be tidy.
7. **Observability log retention** — `prune_observability_logs(7)` exists as a function but isn't wired to a cron. Schedule it when traffic justifies (currently ~free since tables are tiny).
8. **Alert dedupe / silencing** — `alertService` fires on every transition, no rate-limit. If something flaps OK↔DEGRADED on every hourly snapshot you'll get spammed. Add per-component cooldown when this actually bites.

**NOT debt — intentional by design (don't reopen):**

- **Recipe-call hard caps for auth'd users.** Tokens are the throttle (`getPersonalizedPricingContext` × `applyPersonalizedPricing` in `src/lib/economy/livePricing.ts`). Anonymous demo budget via `gateDemoOrAuth()` is the only quota. See `feedback_throttling_model` memory + `src/types/subscription.ts:44` comment.
- **MenuPlannerContext extraction.** Already done — `useCostEstimation` + `useGenerationPreferences` are independent files imported by the provider. CLAUDE.md updated.

---

## 🗂️ Key files & services (jump points)

**Operational dashboard (post-#444)**
- `src/app/admin/page.tsx` — top-level `/admin` (5 panels stacked vertically)
- `src/app/admin/layout.tsx` — mobile top-nav + lg-only sidebar
- `src/app/admin/users/page.tsx` — agent-vs-human tabs
- `src/app/admin/users/[userId]/page.tsx` — per-user deep-dive
- `src/components/admin/{System,Onboarding,Live,Todays,ApiRoute}*Panel.tsx` — the panels themselves

**Services (compute health from existing signals — no new instrumentation)**
- `src/services/systemStatusService.ts` — 8 flow probes + 3 dependency probes (`worst`, `statusFromPathHealth` exported for tests)
- `src/services/onboardingHealthService.ts` — funnel + stuck users (`diagnose` exported for tests)
- `src/services/liveActivityService.ts` — 6-source `Promise.allSettled` merge
- `src/services/todaysHighlightsService.ts` — 8 pair-count queries
- `src/services/userTimelineService.ts` — per-user merged timeline
- `src/services/syntheticProbeService.ts` — cron-driven probe runner

**Infra**
- `src/lib/cache/memoryCache.ts` — 5 s TTL + in-flight dedup (used by all admin endpoints)
- `src/lib/observability/requestLog.ts` — in-memory ring, `summarizePath` + `summarizeAllPaths`
- `src/lib/observability/slowQueryLog.ts` — slow-query ring
- `scripts/run-sql-migration.ts` — production migration runner
- `scripts/verify-table.ts` — read-only schema verifier
- `vercel.json` — Vercel config, cron schedule

**Reference docs**
- `CLAUDE.md` — surface map; updated with all new endpoints
- `docs/adr/006-admin-operational-dashboard.md` — design decisions, accepted trade-offs, named follow-ups
- `WTEN_MIGRATION_PLAN.md` — multi-session WTEN UI port (5/11 done)

---

## 🛠️ Required verification before every PR

```bash
bun run verify              # 0 TS errors, 0 lint warnings
bun run build               # production build clean
bun run jest src/services   # admin service tests (32 passing as of #444)
```

Pre-commit hook runs typecheck + lint automatically; **don't `--no-verify`** unless you have a documented reason (CLAUDE.md rule).

---

## 🧭 Repo conventions to remember

- **`master` is production.** **`main` is stale, do not target it.**
- New work branches off `master`. PRs target `master`.
- Commit messages: imperative subject (`feat(admin):`), bullet body, `Co-Authored-By: Claude Opus 4.7` trailer.
- Tests live next to the source: `src/services/__tests__/<name>.test.ts`.
- Polling cadence ladder: 30 s (activity) / 60 s (status) / 120 s (onboarding) / 300 s (highlights). Tune individually if a panel feels stale.
- Status taxonomy: `OK | DEGRADED | INCIDENT | UNKNOWN`. `UNKNOWN with OK ⇒ DEGRADED` at the aggregate — we can't claim healthy if we can't see.
- **Prefer hardened polling over SSE** (Vercel serverless kills long-lived connections; memory: `feedback_realtime_polling`).
- **Skip in-flight reads on the prod DB** by relying on `executeQuery` from `@/lib/database/connection`; it goes through the pool with `executionTime` tracking that flows into `slowQueryLog`.

---

## 📚 Memory pointers (for the next Claude)

- `project_state_2026_05.md` — production status snapshot
- `project_repo_conventions.md` — branch + LFS + gh quirks
- `feedback_realtime_polling.md` — polling > SSE on Vercel
- `feedback_auth_bypass_removal.md` — never gate auth, remove it
- `project_db_credential_exposure.md` — rotation completed 2026-05-23
- `reference_rate_limit_lib.md` — use `src/lib/rateLimit.ts`, not the legacy express version

---

**The biggest thing you can do this session: get the synthetic probe live + invite the first 10 real users.** The dashboard will tell you everything else.
