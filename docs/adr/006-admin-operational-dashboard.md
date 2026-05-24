# ADR-006: Operational Admin Dashboard from Existing Signals

**Status**: Accepted
**Date**: 2026-05-24
**Deciders**: Greg Castro

---

## Context

`/admin` previously surfaced four stat cards, a Planetary Agents card, a
Recent Users list, and the existing `AdvancedMetricsPanel`. What it could
*not* answer for an operator:

- "Is onboarding actually working right now? Are users getting stuck?"
- "What's currently happening on the site — who just signed in, who's
  generating a recipe, what just broke?"
- "Is any specific user-facing flow (auth, payments, AI generation,
  recommendations) degraded?"
- "Which API endpoint is hot, which is slow, which is throwing 5xx?"

At ten users, every event matters and silent failures are catastrophic
(one broken onboarding flow can stall the growth curve for weeks). The
existing dashboard told us totals; it didn't tell us state.

The codebase already carries signal we weren't surfacing:

- `requestLog` in-memory ring (500 entries, every request's status/latency/path)
- `slowQueryLog` ring (200 entries, every query > 200ms)
- `auth_events` table (16 lifecycle events with status, provider, IP)
- `feed_events` table (agent activity + quest events)
- `token_transactions` ledger (every ESMS movement)
- `user_interactions` (recipe views/cooks, food diary entries)
- `users` + `user_profiles` (signups, onboarding completion timestamps)
- `feedEmitTracker` (last PA feed event)
- `checkDatabaseHealth()` (DB pool ping)
- `ephemeris` (live planetary state)

The choice: build new instrumentation, or compose what's there.

## Decision

**Compose what's there.** Build a layer of "operational health services"
that read existing signals and compute health verdicts, then ship a set
of admin panels that consume them.

### Five new panels on `/admin`

| Panel | Backed by | Polls |
|-------|-----------|-------|
| `TodaysHighlightsPanel` | `getTodaysHighlights()` | 5 min |
| `LiveActivityPanel` | `getLiveActivity()` | 30 s |
| `SystemStatusPanel` | `getSystemStatus()` | 60 s |
| `OnboardingFunnelPanel` | `getOnboardingHealth()` | 2 min |
| `ApiRouteHealthPanel` | `/api/admin/observability` (existing) | 30 s |

Polling beats SSE: Vercel serverless reaps long-lived connections, and
admin traffic is one-operator anyway — `useHardenedPolling` (visibility-
aware, error backoff, no overlap) covers the use case at a fraction of
the complexity.

### Status taxonomy

Every flow returns one of four values:

- **OK** — observed and within thresholds
- **DEGRADED** — observed, elevated errors or latency, or stuck-user signal
- **INCIDENT** — observed and broken (e.g. >50% 5xx)
- **UNKNOWN** — source unavailable, can't say

`worst()` aggregates across flows: `INCIDENT > DEGRADED > UNKNOWN > OK`.
The overall banner shows the worst status. **UNKNOWN with OK becomes
DEGRADED at the aggregate**: we can't claim healthy if we can't see.

### Per-flow probe pattern

Each flow probe is independent and never rejects. A flow that throws
returns an UNKNOWN result with the error message as an issue. This means
one broken DB table can't take down the whole status payload.

Eight flows ship: Auth, Onboarding, Recipe Recommendations, AI Generation,
Token Economy, Payments (Stripe), Planetary Agents, Database. Each picks
the right signals for its question — e.g. Auth uses 24h sign-in failure
rate from `auth_events` rather than 5xx rate from request log, because
401s are noise on `/api/auth` traffic.

### Onboarding gets its own panel

New-user onboarding is the single most important flow at the ten-user
stage — if it breaks, growth dies. `OnboardingFunnelPanel` is more
detailed than what System Status surfaces:

- 24h funnel: signups → birth data → natal chart → complete
- Drop-off % between stages
- Stuck users (>1h, not completed) with what's missing per user
- Per-step success rate, p95 latency, recent errors from `/api/onboarding`
- Recent successful completions (sanity check the happy path)
- Skip rate (skipNatal vs full)

### Live Activity merges six sources

`getLiveActivity()` `Promise.allSettled`-fans out to six queries
(signups, auth events, onboarding completions, feed events, token
transactions, user interactions), normalizes to a common `ActivityEvent`,
sorts DESC. Each source has `LIMIT 25`, 6 h window. Total cost: ~6 small
indexed queries with `WHERE created_at > NOW() - INTERVAL '6 hours'`.

### 5-second in-memory cache

The five panel endpoints share `memoize()` from
`src/lib/cache/memoryCache.ts`. Each cached entry lives 5 seconds.
Concurrent in-flight callers on a miss share the same Promise (no double
work). The TTL is short enough that the UI feels live; long enough that
two admin tabs + the polling cadence stay cheap on the DB.

## Trade-offs accepted

- **Process-local cache** — no distributed caching. If you scale `/admin`
  beyond one Node process, the cache becomes per-process. Acceptable
  because admin traffic is one operator. Move to Redis if that changes.
- **In-memory request log** — survives a process for ~500 requests, then
  rolls. Snapshots aren't persisted. Fine for a "what's happening right
  now" dashboard; bad for trend analysis. ADR-007 candidate: hourly
  snapshots to `system_health_snapshots` for week-over-week drift.
- **No synthetic probes** — we monitor organic traffic, not synthetic
  health pings. At low traffic, a real outage can sit silent for hours
  if no user happens to try. Spawn a follow-up task for a cron-driven
  synthetic onboarding probe.
- **No external APM** — Sentry/Datadog not integrated. If the Next.js
  process itself dies, this dashboard is silent too. Acceptable because
  Railway logs catch crashes; revisit when revenue justifies APM cost.

## Consequences

**Wins**
- Visibility without new tables, columns, or services
- Each panel degrades to `live: false` instead of failing
- Pure diagnostic functions (`worst`, `statusFromPathHealth`,
  `diagnose`) are unit-tested in isolation
- Operator-grade signal at a 10-user product

**Costs**
- Five new API routes + four new panel components + four new services
- ~750 lines of new code in services/components
- Each new flow needs a probe author manually (no auto-discovery)

**What to revisit when**
- > 1,000 daily admin requests: add Redis caching
- Multiple operators: split admin role from on-call read-only role
- Real outages happen during low traffic: add synthetic probes
- Need week-over-week drift: persist hourly snapshots
