# Admin Surface — Comprehensive Upgrade Build Plan

**Repo root:** `/Users/cookingwithcastro/Desktop/WhatToEatNext-master`
All paths below are relative to that root unless written absolute.

---

## 0. Reading of the audit

110 verified findings across 8 admin surfaces resolve to **six root causes**, not 110 independent bugs. Fixing them as 110 tickets is the slow path; fixing the six root causes as shared primitives collapses roughly 70 of them and makes the remainder mechanical.

| # | Root cause | Findings it explains |
|---|---|---|
| R1 | **Failure paths return a value-shaped zero instead of an absence.** `catch { return [] }` / `return 0` with no flag. | ~28 |
| R2 | **`live` is computed but never rendered, or rendered with a lying vocabulary** ("CACHED" for a failed query, "Offline" for loading). | ~19 |
| R3 | **A window label and the query behind it are written in two different files** and drift. | ~9 |
| R4 | **A panel reads a source with no writer** (`agent_chat`, `user_calculations`, `auth_events.ip_hash`, `natal_charts`, `feedEmitTracker`, uninstrumented routes). | ~14 |
| R5 | **Every panel is read-only; the remediation is elsewhere or nowhere.** No entity cross-links, no actions, no audit trail. | ~26 |
| R6 | **Constants typed into a render path** (`ARCHITECT`, `onCall: true`, `* 12`, DE440, React 19.1.0, `active: true`). | ~14 |

The user's phrasing — "seamlessly wired and ubiquitous" — is the description of the missing layer: there is no shared admin kit. `src/app/admin/_dashboard/atoms.tsx` exports 6 primitives, all decorative (`Glyph`, `Sparkline`, `ScanLine`), and zero of them are about **provenance, absence, action, or navigation**. The 25 `● LIVE` literals are hand-typed at 25 sites with 7 different false-state words.

**Therefore: Phase A is the kit. Everything else is a migration onto it.** Doing P0 items one-by-one first would mean re-doing them.

---

## 1. Cross-cutting foundation (Phase A) — build this first

New directory: `src/components/admin/kit/`

### 1.1 The `Provenance` contract

The single type every admin service must return alongside its data. One file: `src/components/admin/kit/provenance.ts`.

```ts
export type SourceKind =
  | "db"            // a query ran and returned
  | "proxy"         // a remote service answered (PA, MCP, Stripe)
  | "memory"        // in-process ring / module global — per-lambda, not durable
  | "static"        // a literal in the repo — must carry `asOf`
  | "none";         // nothing was reached

export interface Provenance {
  /** The query/fetch completed. FALSE is the honest state on any catch. */
  live: boolean;
  /** A measurement apparatus exists at all. false ⇒ absence is unknowable. */
  observed: boolean;
  kind: SourceKind;
  /** ISO. Drives the "as of Ns ago" stamp and the STALE flip. */
  generatedAt: string;
  /** Set when live===false; rendered verbatim to the operator. */
  reason?: string;
  /** Present iff the numbers are window-scoped. Shared with the UI — see 1.3. */
  window?: Window;
  /** Row cap actually applied, so "50 events" can render "50 of N (capped)". */
  cap?: { applied: number; total: number | null };
}
```

**Hard rule, enforceable:** a service function that can fail must return `{ data, provenance }`. A `catch` that returns `[]`/`0` without setting `live: false` is a lint error (see 1.7).

`observed` vs `live` is the distinction the audit found missing in eight places: an uninstrumented route is `observed: false` (we cannot know), a failed query is `live: false` (we tried and failed), and only `live && observed` may render a number.

### 1.2 `<ProvenanceBadge>` — one vocabulary, five states

`src/components/admin/kit/ProvenanceBadge.tsx`. Replaces all 25 hand-typed badges and abolishes "CACHED", "○ AWAITING", "◐ PROXY", "○ STALE"-meaning-failed.

| Condition | Renders | Color |
|---|---|---|
| `live && observed && age < 2×poll` | `● LIVE` | earth/green |
| `live && observed && age ≥ 2×poll` | `◔ STALE · 4m` | amber |
| `!observed` | `◌ NOT INSTRUMENTED` | slate, non-alarming |
| `!live && kind !== "none"` | `○ NO SOURCE · {reason}` | rose |
| `kind === "static"` | `▣ STATIC · as of {asOf}` | slate |

There is deliberately no word that means "we have older real data" unless a cache genuinely exists; today zero of the four "CACHED" sites have one.

### 1.3 `Window` — the label and the cutoff are one object

`src/components/admin/kit/window.ts`:

```ts
export interface Window { ms: number; label: string; }
export const W = {
  FIVE_MIN: { ms: 300_000, label: "5m" },
  ONE_HOUR: { ms: 3_600_000, label: "1h" },
  DAY:      { ms: 86_400_000, label: "24h" },
  SIX_HOUR: { ms: 21_600_000, label: "6h" },
} as const;
```

Every windowed reader takes a `Window` and echoes it back in `provenance.window`; every header renders `provenance.window.label`. This structurally kills R3: the ApiRouteHealth 5-min mismatch, the slow-query split, the hero `24H` frame over 5-minute tickers, the hardcoded `6h window`, the `Active · 24h` with no predicate, and the dispatch `/min` over an unbounded query — because a query without a `Window` cannot be rendered under a window label.

### 1.4 `<Metric>` — absence renders as absence

`src/components/admin/kit/Metric.tsx`. Prop is `value: number | null`, plus the panel's `Provenance`.

```
!p.live || !p.observed || value === null  →  "—"  (+ tooltip = p.reason)
```

Applying this one component to the render sites named in the audit removes, in a single mechanical pass: Cosmic Yield's four zeros, Commensal Pulse's zeros, Database's `0 B · 0 connections`, Engine Health's three zeros, Monica's `0 help requests`, control-room `0 agents` + four `AgentBadge`s, QuickRoute `Users 0`, moderation `openTotal` coercion, `agentHarmony` 50.0%, `availability 100%`, `Auth failure rate`, and the roster's `0 humans · 0 agents`. **This is the single highest-yield component in the plan.**

### 1.5 `useAdminResource<T>()` — one fetch/poll/staleness hook

`src/hooks/useAdminResource.ts`, wrapping the (fixed) `useHardenedPolling`.

Returns `{ data, provenance, error, stale, lastOkAt, refreshNow }`.

Behaviour contract, derived directly from the audit's failures:
- A failed poll **keeps** `data` (never blanks the board) but sets `stale: true`, which forces every descendant `ProvenanceBadge` to the STALE branch. Fixes the agents-network freeze and `/admin/dashboard/page.tsx:25` retaining `live:true` payloads.
- Always renders an age stamp from `meta.generatedAt` (currently read nowhere on the dashboard, nowhere on agents, and absent from the users roster).
- Default cadence 30s/60s via the hook, so `AdvancedMetricsPanel` and the users roster stop being the two non-polling outliers.

**Prerequisite bug (blocks this whole hook):** `src/hooks/useHardenedPolling.ts:108` returns a fresh object + fresh arrow each render, so the two dep-array consumers re-fire every render and poll at round-trip speed against eight parallel Postgres aggregates. Wrap the return in `useMemo`/`useCallback([])`.

### 1.6 `<AdminAction>` — the write primitive

`src/components/admin/kit/AdminAction.tsx`, generalizing the only working pattern in the tree (`src/app/admin/_dashboard/PaAgentSyncPanel.tsx:55,106,123`).

Contract: `{ label, href, body, confirm?: {title, body, requireTypedConfirmation?}, danger?, onDone }` → busy state → `res.ok` check **before** `res.json()` (the settlement panel's missing check is why a Stripe misconfiguration surfaces as a `SyntaxError`) → renders the server's `message` verbatim on failure → calls `refreshNow()` on success. Every use writes an `admin_actions` row server-side (1.8).

### 1.7 Guard rails (the part that keeps it fixed)

These are cheap and they are what stop the audit from being needed again in six months.

1. **Poisoned-executeQuery contract suite** — `src/services/__tests__/provenance.contract.test.ts`. Table-driven over every admin service reader: mock `executeQuery` to reject, assert the returned `provenance.live === false`. This one test file would have caught 28 findings. It is the highest-leverage artifact in the plan.
2. **ESLint rule** banning the string literals `"CACHED"`, `"● LIVE"`, `"LIVE"`, `"Offline"` in `src/app/admin/**` and `src/components/admin/**` outside `kit/` (mirrors the existing `Math.random` scoped-ban precedent).
3. **Anchor-resolution test** — parse the rail's `href="#..."` entries in `shell.tsx` and assert each id is rendered by `Dashboard.tsx`/`OperationsControlPlane.tsx`. Catches the four misrouted anchors and prevents recurrence.
4. **Static-fact test** — `settings/page.tsx` version rows asserted against `package.json`; auth rows against `auth.config.ts` constants. Three of those rows are already wrong.
5. **Derived `meta.mockedFields`** — build it from the registry of panel `Provenance` at assembly time in `src/app/api/admin/dashboard/route.ts:394` instead of the hand-maintained `KNOWN_CODEBASE_GAPS` literal, which currently red-flags an honest panel and cannot ever flag a new one.

### 1.8 Ubiquity layer

| Piece | Spec | Files |
|---|---|---|
| **`<EntityLink>`** | `{kind: "user"\|"agent"\|"order"\|"restaurant"\|"recipe", id, label?}` → canonical href + monospace short id + copy-full-id affordance. Used by settlement rows, both moderation queues, drift/claims tiles, recent-users rows, dispatch entries, abuse lists. | new `kit/EntityLink.tsx` |
| **Admin search API** | `GET /api/admin/search?q=` → users (email, name, **and `id::text`** — the current roster search matches neither id nor uuid), orders, restaurants, agents, recipes. Admin-gated. | new `src/app/api/admin/search/route.ts`; extend clause at `src/app/api/admin/users/route.ts:96` |
| **⌘K command palette** | Two sections: *Go to* (static registry of every admin route + every dashboard section id — the same registry the anchor test consumes) and *Find* (debounced hit to the search API). Mounted once in `src/app/admin/layout.tsx` so it exists on every tab. | new `kit/CommandPalette.tsx` |
| **Sidebar/rail state** | Active = `pathname === href \|\| pathname.startsWith(href + "/")` (fixes `/admin/users/{id}` highlighting nothing) plus an IntersectionObserver scroll-spy for the dashboard's section anchors (replaces the hardcoded `active: true`). Rail badges sourced from fields **already on the payload** (`agentCount`, `signinFailure24h`, `featureFlags`, `deploys`, `auditEvents`) — 7 rows currently hardcode `badge: null`. | `src/app/admin/layout.tsx:165,192`; `src/app/admin/_dashboard/shell.tsx:428-544` |
| **Alert lifecycle** | `POST /api/admin/alerts/[id]/ack` writing `acknowledged_by/at`; render Ack in the inbox; alert titles become links to the owning section. Currently zero ack/snooze/assign route exists and payments has sat INCIDENT for 35 snapshots. | new route; `shell.tsx:836-911` |
| **`admin_actions` audit table** | Migration + a `recordAdminAction(actor, verb, target, detail)` called from every mutating admin route. Today deactivating a user writes nothing at all, and the rail's "Audit Log" points at end-user `auth_events`. | new migration; `src/app/api/admin/users/[userId]/status/route.ts:62`, `.../grant/route.ts`, settlement route |
| **Moderation + settlement backlog in the payload** | Open-report counts for `message_reports` and `feed_comment_reports` join the dashboard payload; rail badges Moderation from **those**, not from `alert_events`. | `src/services/dashboardPanelsService.ts`; `shell.tsx:501` |

---

## 2. P0 — Dishonest: the operator is actively misled

Ordered by blast radius. Every acceptance test below should be an automated test, not a manual check, unless noted.

### 2.1 Money and security correctness (do these first, they are not cosmetic)

| Item | Change | Files | Acceptance test |
|---|---|---|---|
| **Failed token grant reported as success** | Return a discriminated `{applied \| replayed \| error}` from `creditMultipleTokens` instead of collapsing rollback, FK-violation and genuine replay onto `null`. 500 on error; `alreadyClaimed` only on a real suppressed-ledger replay; verify the target user exists so a bad id 404s. | `src/services/TokenEconomyService.ts:445`, `src/lib/database/tokenEconomyQueries.ts:262`, `src/app/api/admin/users/[userId]/grant/route.ts:107`, `src/components/.../GrantTokensModal.tsx:61,200` | Test: grant with a non-existent userId → route returns 500/404 and modal shows a red error with Grant still enabled. Second test: true idempotency replay → amber "already granted". The two must not be the same response. |
| **"Revoke sessions" does not revoke** | Return `enforced: process.env.AUTH_REVOCATION_CHECK === "on"` from the revoke route and word the confirm + result from it. **Needs product decision** (see §6.1) on whether to turn the gate on. | `src/app/api/admin/users/[userId]/sessions/revoke/route.ts`, `src/app/admin/users/[userId]/page.tsx:171`, `src/lib/auth/auth.config.ts:165`, `auth.ts:585` | Test: with the env var unset, the response carries `enforced:false` and the UI string does not contain "every device". Snapshot both wordings. |
| **DB failure renders as "User not found"** | `readIdentity` returns `{notFound:true}` vs throwing on query error; route answers 503 (retryable) not 404. | `src/services/userTimelineService.ts:247,194,516` | Test: poisoned `executeQuery` → route 503 and page renders the Retry banner (currently unreachable for this path). |
| **Chat moderation queue swallows failures → "No open reports."** | Delete the `catch` in `listReports`; the route's own catch already 500s. Add a distinct "queue unavailable" state to the page. | `src/services/chatDatabaseService.ts:925`, `src/app/api/admin/chat/reports/route.ts:38`, `src/app/admin/chat-reports/page.tsx:92` | Poisoned-query test asserts HTTP 500 + page renders "queue unavailable", not "No open reports." Feed sibling already behaves correctly — assert parity. |
| **Feed/chat moderation actions ignore the response** | Check `res.ok`, parse body, set the existing error state, only `load()` on success. Also fix `chatDatabase.resolveReport` swallowing DB errors into a misleading 404. | `src/app/admin/feed/comment-reports/page.tsx:58`, `src/app/admin/chat-reports/page.tsx:60`, `chatDatabaseService.ts` | Mock a 403 → error text visible, list **not** reloaded. |
| **Settlement `getStripe()` throws unhandled** | Wrap in try/catch → 503 `"Stripe is not configured on this deployment."`; panel checks `res.ok` before `.json()` (subsumed by `<AdminAction>`). | `src/app/api/admin/restaurants/settlement/route.ts:189`, `src/lib/stripe/stripe.ts:14`, `src/components/admin/SettlementPanel.tsx:113` | Test with `STRIPE_SECRET_KEY` unset → 503 with that message; panel banner shows it, not a `SyntaxError`. |
| **Both moderation pages are white-on-light-gray — unreadable** | Restyle to the light admin palette (or wrap in a dark container). | `src/app/admin/chat-reports/page.tsx:67`, `src/app/admin/feed/comment-reports/page.tsx:71`, `src/app/admin/layout.tsx:142,217` | Manual: screenshot both tabs. Plus a contrast lint/test asserting no `text-white` under `AdminLayout`. |

### 2.2 Structurally unreachable honesty (R1/R2 — the `<Metric>` + `Provenance` migration)

| Item | Change | Files | Acceptance test |
|---|---|---|---|
| **`getLiveActivity()` can never report `live:false`** (reported twice) | Each of the six readers returns `{events, ok}`; compute `live` from the six. | `src/services/liveActivityService.ts:75,126,198,252,303,367,468`; `src/components/admin/LiveActivityPanel.tsx:208,215` | Poisoned-query test asserts `live === false`; today the assertion is a tautology. |
| **Zero samples → `AVAIL 100%` / `NOMINAL · 100.00`** | Add `live`/`observed` to `PlatformPulse`; `availability: null` when `count === 0`; emit state `UNKNOWN` so `shell.tsx`'s existing absence branch fires. | `src/services/dashboardPanelsService.ts:523-539,578-581`; `hero.tsx:237`; `_dashboard/data.ts:303` | Test: empty ring → `availability === null`, state `UNKNOWN`, hero renders `—`. |
| **Failed query → hard zeros** (Cosmic Yield, Commensal Pulse, Database, Engine Health, Monica help-requests, control-room totals, QuickRoute users badge, roster counts) | Mechanical `<Metric>` migration; gate on the flag each payload **already carries** (`live`, `live_source`, `stats.live`). | `extras.tsx:531,556-578,1299,1308`; `panels.tsx:1116`; `agents.tsx:293,301-304,410,1940`; `OperationsControlPlane.tsx:304`; `src/app/api/admin/users/route.ts:299` | One parameterised test per panel: render with `live:false` → assert `—` and no `0`/`100%` anywhere in the tile. |
| **`agentHarmony` degrades to a plausible 0.5 → "50.0%"** | `raw: number \| null`; return `null` on failure. | `src/services/agentTelemetryService.ts:138,149,165`; `src/app/admin/page.tsx:572-595` | Poisoned ephemeris → `—`, never `50.0%`. |
| **`"CACHED"` for a failed query with no cache** (4 sites), `"Offline"` while loading, `"CACHED"` for a thrown ephemeris | `<ProvenanceBadge>` migration. PA badge gets the tri-state already used for `recentUsersLive`. | `panels.tsx:872,1313`; `extras.tsx:246,1308`; `sky.tsx:35,149`; `src/app/admin/page.tsx:231,71,491` | Snapshot each badge in all five provenance states; assert no render path emits "CACHED" without `kind === "cache"`. |
| **Degraded roster fabricates `tier: "free"`** | `tier: null` in the fallback mapper; existing truthiness guard then suppresses the row. | `src/app/api/admin/users/route.ts:308`; `src/app/admin/users/page.tsx:717` | Degraded-path test: no `free` badge; banner and body agree. |
| **Degraded banner names a cause it never measured** | Return `degraded: { source: "postgres-fallback" \| "in-memory", reason }` from the actual error class; word the banner from it. Apply the `status` predicate on the fallback path too (currently a silent no-op). | `src/app/api/admin/users/route.ts:280-287,325`; `src/app/admin/users/page.tsx:296` | Two tests: SQL fault w/ healthy DB → "postgres-fallback" wording; `status=inactive` on the degraded path → either filtered or the select is disabled. |
| **`meta.mockedFields` stale + hand-maintained** | Derive from panel provenance at assembly; recategorize `sems-rollup` to `MISSING_INSTRUMENTATION`. | `src/app/api/admin/dashboard/route.ts:100-110,394`; `Dashboard.tsx:373` | Test: a panel returning `live:false` appears in `mockedFields` without anyone editing a literal. |
| **A failed poll keeps `live:true` payloads on screen** (agents + dashboard) | `useAdminResource` staleness. | `agents.tsx:181-194,204-209`; `src/app/admin/dashboard/page.tsx:25-40` | Test: two consecutive failed polls → every badge STALE, age stamp visible, data retained. |

### 2.3 Window and denominator lies (R3/R6)

| Item | Change | Files | Acceptance |
|---|---|---|---|
| API Route Health header (no window) over table labelled 5 min | `getRecentRequests(window)`; render `—` when `count === 0` | `src/lib/observability/requestLog.ts:143-155,169`; `ApiRouteHealthPanel.tsx:68` | Header count === table row count, always |
| Slow-queries: windowed count over unwindowed list | same `Window` on `getRecentSlowQueries` | `src/lib/observability/slowQueryLog.ts:159-163`; `AdvancedMetricsPanel.tsx:375`; `extras.tsx:1356` | Cannot render "0 in 5m" above a non-empty list |
| Hero `24H` frame over 5-minute tickers | Either label the ticker row `5m` or compute from the 24h `request_log_entries` aggregate | `hero.tsx:190,211-213,235-275` | Label string derives from `provenance.window.label` |
| Dispatch `LIVE · n/min` from the last 20 events regardless of age | Bound the SQL to a window, or render `LAST n EVENTS · SPAN …` + age; `—` when newest is older than the window | `src/app/api/admin/agents/network/route.ts:294-307,34`; `agents.tsx:909-916,938` | Fixture of 20 events three days old → not `80/min` |
| `Active · 24h` funnel stage with no time predicate | Add the predicate, or rename to "Accounts (all-time)" | `dashboardPanelsService.ts:714`; `Dashboard.tsx:116` | Query contains a `last_seen`/interval bound or the label loses "24h" |
| Alert count = the SQL `LIMIT` | Add a `triggered_at` window + separate `COUNT(*)`; render "5 of N" | `dashboardPanelsService.ts:958-975`; `shell.tsx:739,843,857`; `hero.tsx:810-817` | 200 alerts fixture → renders "5 of 200", not "5 recent" |
| Role "utilization %" divides by an invented `* 12` | Delete the fabricated denominator; render `events24h` and `events24h/agentCount`, bars relative to busiest role; drop the 0.85 "near saturation" verdict and the unused `cap` | `agents.tsx:663-674,766-840,787,813-825,835` | Grep: no unexplained numeric literal in the utilization path; no "saturation" string |
| Auth failure rate counts post-success background writes | Compute from terminal outcomes only; drop `info` rows from the denominator; rename "Sign-in failure rate" | `src/lib/auth/auth.ts:257,308`; `AdvancedMetricsPanel.tsx:164` | Fixture with only `signin_last_login_update_failed` → rate 0% |
| Cohort retention: immature cohorts render 0% churn | Render `—` for cohorts whose W4 window has not closed; drop the `is_active = true` survivor filter | `dashboardPanelsService.ts:1409` | Today's date fixture → 3 newest rows are `—`, not `0%` |
| Practitioner funnel is 99.8% agents; Elemental Affinity is a bot histogram credited to a nonexistent `natal_charts` | Add `is_agent = false` (**product decision, §6.4**); fix the source attribution string to `user_profiles.dominant_element` | `dashboardPanelsService.ts:712`; `panels.tsx:520,558` | Query contains the agent predicate; no string `natal_charts` in the codebase's render paths |
| Recipe Quality / Top Recipes render DDL defaults as metrics | Detect the degenerate case (`count(distinct popularity_score) = 1`, all `rating_count = 0`) → `◌ NOT INSTRUMENTED`. **Product decision §6.5** on whether ratings will ever be collected | `extras.tsx:345`; `panels.tsx:872,933,936` | Prod-shaped fixture → no `★ 0.0` / `50%` rendered, badge is NOT INSTRUMENTED |
| Practitioner Geography reads a 4-row mirror and plots the `IGNITE_FALLBACK_PIN` | Read canonical `users.profile->'birthData'`; exclude the fallback literal; delete the dead hardcoded place-name branch | `dashboardPanelsService.ts:1349` | Fixture containing 40.7498/-73.7976 → excluded, count reflects the canonical column (60 not 8) |
| Sky strip advertises DE440 / kernel rev / leap-second table that do not exist | Print `astronomy-engine v{pkg version} · VSOP87/Meeus · geocentric`; delete the three fabricated rows | `sky.tsx:44,238-243` | Grep for `DE440` returns zero in `src/` |
| `DEPLOY ▲ fresh` is a hardcoded verdict over a SHA | Rename `deploySha`, drop the ▲/fresh/ok styling or colour by real age from `data.deploys` | `hero.tsx:275`; `shell.tsx:299-303`; `dashboardPanelsService.ts:592` | No literal `delta="fresh"` |
| Identity card: `role: "ARCHITECT"`, `onCall: true`, `joined` falls back to today | Derive role/tier from `authResult.user.roles`; `joined: null` on lookup failure → `—`; **delete `onCall`** and the hardcoded green presence dot (§6.3) | `src/app/api/admin/dashboard/route.ts:504-506,519-526`; `shell.tsx:216,777-788,825-833` | Poisoned lookup → `joined: null`; grep for `"ARCHITECT"` and `onCall` returns zero |
| Settings page states drifted platform facts as configuration | Generate version rows from `package.json`+`engines` at build; read auth rows from `authConfig`/`jwt-auth` constants; delete `JWT Configured: Yes` and add `check("JWT secret","JWT_SECRET")` to `launchReadinessService`. Separately: make `validateRequest.ts:75-83` **throw** in production instead of using `"dummy-secret-not-for-production"` | `src/app/admin/settings/page.tsx:14-62,29,30,56-60`; `src/lib/auth/validateRequest.ts:71-83`; `src/services/launchReadinessService.ts` | The static-fact test (1.7 #4); plus a prod-env test asserting `validateRequest` throws with no `JWT_SECRET` |
| `mcpNetworkService` overwrites the proxy's `live:false` and the page then crashes | Spread over `DEFAULT_SUMMARY`, preserve `live:false`; return 502 from the proxy for `pa_unreachable` | `src/services/mcpNetworkService.ts:123,127-128`; `src/app/api/admin/mcp-summary/route.ts:45-62`; `src/app/admin/mcp/page.tsx:113,165` | Test mocking `{ok:true, json:()=>({live:false,error:"pa_unreachable"})}` → page renders a degraded state, no `TypeError` |
| Onboarding panel discards `live`; funnel failure paints green OK | Render `data.live`; force UNKNOWN when false; drop the `!apiHealth.observed` conjunct | `OnboardingFunnelPanel.tsx:76,83-89,197-217`; `onboardingHealthService.ts:322,392,442` | Poisoned funnel query → UNKNOWN banner, never "Quiet — no new signups" |
| Onboarding stuck-user / recent-success queries swallow failures unflagged | `{rows, live}` from both; `AND` into the overall `live`; nullable `stuckCount` so `diagnose` can answer UNKNOWN | `onboardingHealthService.ts:230-233,270-273,428` | Poisoned stuck query → the DEGRADED alarm is not silently cleared |
| `probePayments` "Webhook 5xx · 1h: 0" from an uninstrumented route; Error Groups "all green" from 3.6% of routes; Stripe/OAuth dependency tiles assert 24h absence | Render `—`/`not instrumented` when `!observed`; fold `observed` into the flow's `live`; scope the Error Groups claim to instrumented routes and name the coverage | `systemStatusService.ts:840,888,954-958,1464,1569`; `extras.tsx:1011,1021` | Uninstrumented-path fixture → `—`, and the panel's subtitle states "9 of 253 routes instrumented" |
| Moderation rail badge fed by `alert_events` | Badge from the open-report counts added in 1.8; relabel the alert badge "Alerts" | `shell.tsx:501-508` | Open chat report → Moderation badges; infra alert → Alerts badges. Not crossed. |
| Cosmic Yield's honesty caption is itself false | Delete "Daily time-series telemetry is not yet persisted." — `flowSeries` is on the same prop and rendered by the neighbouring card | `extras.tsx:639`; `integrity.tsx:471,487` | String absent |
| Feature-flag row reports an env var nothing reads | Report `NEXT_PUBLIC_ADDITIVE_ONLY_ELEMENTS` and disclose the localStorage override precedence | `dashboardPanelsService.ts:1274-1276`; `src/calculations/alchemizer.ts:386` | Var name in the panel === var name the engine reads |
| `/restaurants` telemetry bound to the empty Stripe-Connect table, relabelled "user-saved" elsewhere | Name each row's actual source; `/restaurants` is Overpass-served and touches no table → `◌ NOT INSTRUMENTED`; `/recipe-builder` row states it is the `is_public=false` subset | `extras.tsx:52`; `panels.tsx:1138-1140` | No two panels render the same number under different nouns |
| Moderation queue "● CLEAR" while one queue failed | `live = chat !== null && comment !== null`; `<Metric>` for the null queue | `panels.tsx:1444,1473` | One 500 + one clean → badge is not CLEAR |

---

## 3. P1 — Dead surfaces that should be wired

| Item | Change | Files | Acceptance |
|---|---|---|---|
| **Instrument the 4 money/auth/onboarding routes** — unblocks 5 permanently-blind detectors at once | Wrap `/api/onboarding`, `/api/stripe/webhook`, `/api/auth/[...nextauth]`, `/api/feed` with `withObservability`. Longer term: record in middleware and let `summarizePath` distinguish *not instrumented* from *no traffic* (**§6.2**) | `src/lib/observability/withObservability.ts:141`; the four route files; `src/middleware.ts:77-90` | After a request to each, `summarizePath(path).observed === true`; the onboarding INCIDENT branch becomes reachable (test it fires) |
| **Admin ring is a frozen cold-start snapshot** | Query `request_log_entries` directly with the panel's `Window`; keep the ring for same-process debugging | `src/lib/observability/requestLog.ts:88-129`; `ApiRouteHealthPanel.tsx` | Panel numbers change after a request to an instrumented route from another instance |
| **Abuse "Suspicious IPs" can never return a row** | Pass `ip: extractClientIp(headers)` at the `logAuthEvent` call sites; until then render "IP capture not wired" and hide the column | `src/lib/auth/auth.ts`; `src/services/authEventsService.ts:105`; `src/app/api/admin/abuse/route.ts:71` | A sign-in failure writes a non-null `ip_hash`; panel lists it |
| **`feedEmitTracker` — two dead consumers** | Derive last-emit from `feed_events` exactly as `systemStatusService.ts:1045-1053` already does; keep the in-memory value as a `MIN()` supplement. Then key the Operations maintenance row's CLEAR/WATCH on emit **age**, not presence | `src/services/feedEmitTracker.ts:15`; `src/app/api/admin/dashboard/route.ts:390`; `agents.tsx:496-515`; `operationsControlPlaneService.ts:703-716` | Insert a `feed_events` row → EMIT pill freshens; the permanent amber WATCH clears |
| **Engine Health reads `user_calculations` (no writer anywhere)** + `clickToCookRate` from event types with 0 rows | Instrument the calculation path, or return nulls + `calculationsInstrumented: false`. **§6.6**. Also fix the "req log" sublabel which names the wrong source | `dashboardPanelsService.ts:668-689` | Either the table gains rows on a calculation, or all three tiles render `—` under NOT INSTRUMENTED |
| **API Endpoint Heatmap is a static "not instrumented" paragraph** while `request_log_entries` holds 13k rows | Render the real heatmap from `getRequestHourlySeries`, with an honest coverage caption ("6 paths · 9 of 253 routes instrumented") | `extras.tsx:182-215` | Panel renders buckets; caption states coverage |
| **`NEXT_PUBLIC_VERCEL_REGION` defined nowhere → 3 blank readouts** | Pass `process.env.VERCEL_REGION` through the nodejs-runtime payload, or delete the three slots | `shell.tsx:550,828`; `Dashboard.tsx:365`; `src/app/api/admin/dashboard/route.ts` | Region renders a value, or the slots are gone |
| **`agent_chat` panels (Discourses + Reasoning Traces) query a type both writers block** | **§6.7 — product decision.** Interim: replace both bodies with one honest card naming the blocking writer; drop `◐ PROXY`; add `instrumented:false` to `getInteractions`; correct `KNOWN_CODEBASE_GAPS` | `src/app/api/admin/agents/network/route.ts:431,631,651`; `agents.tsx:1636,1650,1690,1706`; `src/app/api/admin/dashboard/route.ts:129-137`; `feedDatabaseService.ts:72-75` | No `● LIVE` over a source with a hardcoded writer exclusion; a test asserts the exclusion list and the query filter cannot diverge |
| **4 caller-less admin routes** | Surface each: threshold control in DatabaseStorage (**labelled process-local**), seed action in the Operations maintenance queue, test-email button + spacetime booleans folded into `launchReadinessService` on Settings | `src/app/api/admin/observability/slow-query-threshold/route.ts`, `.../environment/seed/route.ts`, `.../send-test-email/route.ts`, `.../diagnostics/spacetime/route.ts` | Each route has ≥1 UI caller (grep test) |
| **`GET`/`DELETE /api/admin/users/[userId]` unreachable, GET shape weaker than the timeline route** | Delete both (keep the live `PATCH` at :129) | `src/app/api/admin/users/[userId]/route.ts:26` | Handlers gone; PATCH still passes its test |
| **`IntegrityTile.action` prop never supplied** | Use it: claimsTile → pending-claims view, driftTile → drifted-user list | `integrity.tsx:46-47,75-86,353-418,451-453` | Both tiles render an action Link when non-zero |
| **Four misrouted / self-referencing anchors** | Give `IncidentsPanel` `id="trust"`; point telemetry-repair at `#operations`; give CRON HEARTBEATS `id="cron-heartbeats"` and route `scheduled-jobs` there; repoint Catalog→`#commerce` and Commensal→`#commerce`; render a non-interactive div when no destination is known | `operationsControlPlaneService.ts:546-552,677,678-688`; `shell.tsx:475,486`; `Dashboard.tsx:220,256,266,270`; `OperationsControlPlane.tsx:200,1051-1150` | The anchor-resolution test (1.7 #3), extended to assert the target section **contains the named panel** |
| **Rail: 14 rows → 10 destinations, 7 badgeless, 4 real routes unlinked** | Collapse duplicates, badge the 7 from payload fields already present, link `/admin/settlements`, `/admin/chat-reports`, `/admin/feed/comment-reports`, `/admin/onboarding` | `shell.tsx:428-544` | Test: every rail row has a distinct destination; no row has a hardcoded `badge: null` where the payload carries the field |
| **Rail active state hardcoded to Operations** | Scroll-spy + `usePathname` (1.8) | `shell.tsx:442-443,589-620` | Scroll to `#agents` → Agents highlighted |

---

## 4. P2 — Thin: real data, insufficient depth or no action

Grouped, because they share the same three primitives (`<EntityLink>`, `<AdminAction>`, `<Metric>`).

**4.1 Fields fetched and discarded** (pure presentation, all S)
- `oldestPendingAgeHours` dropped by **both** settlement surfaces — `LaunchReadinessPanel.tsx:44,207-211` and the Overview strip. The service documents it as existing specifically to prevent a hidden stuck payout. Add to the type, render beside the count, escalate amber→rose past a threshold. *Accept:* a 6-day-old pending order renders differently from a 3-minute-old one.
- `stripe_transfer_id` + `payment_status` — fetched, typed, never rendered on the surface where the operator must choose retry vs refund. `SettlementPanel.tsx:244`. *Accept:* Refund is disabled/warned when `stripe_transfer_id` is non-null; the operator never has to trip the server's 409 to learn the answer.
- Per-user `balances` on the roster, discarded next to the Grant button — `src/app/admin/users/page.tsx:19`. *Accept:* S/E/M column renders; grant confirmation visible in the table.
- `paIntegration.endpoints` fetched and discarded while 4 URLs are hardcoded — `src/app/admin/page.tsx:45,306`. *Accept:* with an env override set, the registry links to the resolved host.
- `paIntegration.rosterDiff` computed every poll, rendered nowhere on `/admin` — `src/app/admin/page.tsx:362`.
- `user.role` selected then collapsed to `['admin','user']`, so the role dropdown cannot show the current value — `userTimelineService.ts:158,211`; `users/[userId]/page.tsx:399`.
- `countsByCategory` + `windowHours` discarded by the live-activity route; the subtitle hardcodes `6h` and hides the `slice(0,50)` cap — `panels.tsx:209`; `src/app/api/admin/dashboard/route.ts:443-446`.
- Per-order retry/refund verdict computed hourly by the reconciliation cron and discarded — `src/app/api/cron/esms-reconciliation/route.ts`. *Accept:* a `verdict` column on `GET /api/admin/restaurants/settlement`.

**4.2 Missing polling / staleness** (subsumed by `useAdminResource`)
- `AdvancedMetricsPanel.tsx:145` — one-shot on a page CLAUDE.md documents as self-polling.
- `src/app/admin/users/page.tsx:107` — roster never refreshes, sitting directly under a 60s-polling panel.
- Nothing renders `meta.generatedAt` anywhere on the dashboard or agents surfaces.

**4.3 Missing drill-down** (subsumed by `<EntityLink>`)
- Recent Users rows hover like links and click nowhere (`src/app/admin/page.tsx:506`).
- Settlement rows truncate the user id to 8 chars, link nowhere, and the roster search cannot match an id (`SettlementPanel.tsx:252`; `src/app/api/admin/users/route.ts:96`).
- Both moderation queues drop `senderId`/`reporterId`/`authorId` — a moderator cannot see or reach the offender, and no ban/suspend route exists under `src/app/api/admin` (`chat-reports/page.tsx:97`; `comment-reports/page.tsx:15`; `chatDatabaseService.ts:914`; feed list SQL at `feedCommentsDatabaseService.ts:328-337`).
- Drift and on-chain-claims tiles are bare counts while their sibling `WelcomeGrantCoverage` in the same card names every affected user — mirror that design (`integrity.tsx:365-369,399-418`; `economyIntegrityService.ts:36-45,74-79`).
- SystemStatus `FlowTile`/`DependencyTile` expand to nothing actionable — add optional `href` per probe (`SystemStatusPanel.tsx:236`).
- Agent roster capped at 10 with no search/paging/sort while the route already accepts `?leaderboard=` (`network/route.ts:34-35,665-672`; `agents.tsx:1060-1091`).
- Both moderation queues capped at 50 with no paging, though both routes accept `limit`/`offset` and neither shows a total.

**4.4 Missing actions**
- `OperationsControlPlane.tsx` — 1511 lines, zero `<button>`/`onClick`/`fetch`, rendering rows that say **DUE**. Wire the two highest-frequency remediations with `<AdminAction>`: settlement retry (`POST /api/admin/restaurants/settlement`) and cron re-trigger. Rows that stay navigational must say "open X", not DUE.
- PA roster MISMATCH is an inert `<span>` while its one-click repair (`PaAgentSyncPanel` SYNC ALL) sits unlinked on the same page (`OperationsControlPlane.tsx:1443-1462`).
- Alert inbox has no ack/silence/assign (1.8).
- Feed "Dismiss" cannot un-hide — no `hidden = false` write exists anywhere; mirror `chatDatabaseService.resolveReport:957-968` (`feedCommentsDatabaseService.ts:353`).
- Activate/deactivate failures are `console.warn` only; the server's specific 403/404 messages are discarded (`src/app/admin/users/page.tsx:143`).
- Tier filter implemented server-side, no UI reaches it, no Tier column (`src/app/api/admin/users/route.ts:101`).
- No admin-action audit trail at all (1.8).

---

## 5. P3 — IA / polish

- Sidebar `pathname ===` → `startsWith` (`src/app/admin/layout.tsx:165,192`) — the most-linked-to admin page highlights nothing.
- Badge-vocabulary unification (covered by 1.2) — cosmetic half of ~19 findings.
- Rail label "Audit Log" → "Auth events" until a real admin audit exists (`shell.tsx:530`).
- Copy-to-clipboard on ids; consistent age formatting (`formatAgeHours` exists in `OperationsControlPlane` — hoist to the kit).

---

## 6. Needs a product decision from you, not a code fix

| # | Decision | Why it's yours |
|---|---|---|
| 6.1 | **Turn `AUTH_REVOCATION_CHECK` on?** Off = "revoke sessions" is a DB stamp only and an attacker's JWT lives 30 days. On = an extra check on every protected request, and even then the code concedes API-only sessions keep the token to expiry. | Security posture vs. request-path cost. Until decided, the UI must stop promising "signed out on every device". |
| 6.2 | **Instrument 253 routes, or record in middleware?** Per-route wrapping is explicit but 244 files; middleware is one change but changes the matcher and adds a hop. | Perf/cost tradeoff. Blocks P1's biggest unlock. |
| 6.3 | **Is there an on-call rota?** If not, delete `onCall` and the green presence dot rather than sourcing them. Same for `role: "ARCHITECT"` — is ARCHITECT a real tier or decoration? | No source exists; the only honest options are delete or build. |
| 6.4 | **Do "practitioners" include agents?** 6,383 of 6,397 users are `is_agent`. Filtering changes every funnel, cohort, elemental-affinity and geography number on the board — correctly, but dramatically. | Defines the platform's headline metrics. |
| 6.5 | **Will recipe ratings ever be collected?** 1,077 recipes, zero rating writers, one distinct `popularity_score`. Either instrument ratings or delete Recipe Quality Inspector and Top Recipes. | Roadmap question. |
| 6.6 | **`user_calculations`: instrument or delete?** No writer in TS or Python. Engine Health's three tiles are structurally 0. | Same shape as 6.5. |
| 6.7 | **`agent_chat` anonymity vs admin observability.** Two panels + a filter/search UI read an event type both writers deliberately block since 2026-06-03. Options: (a) delete the panels, (b) emit a redacted `agent_chat_admin` type, (c) a separate privacy-stamped table. | The exclusion was a deliberate privacy call; only you can reopen it. |
| 6.8 | **Slow-query threshold is process-local per lambda.** An inline control tunes one instance. Accept and label it, or move to DB-backed config? | Determines whether the control is worth building as-is. |
| 6.9 | **Scope of `admin_actions` audit.** Which verbs, what retention, does it need to be tamper-evident? | Compliance-adjacent; needs a ruling before the migration. |

---

## 7. Highest operator value per unit of effort

Ranked. These five are ~2 weeks of work and retire the majority of the audit's severity.

1. **`useHardenedPolling` `useMemo` fix** — `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/useHardenedPolling.ts:108`. Effort: **XS** (one wrap + a fake-timer test). Value: stops an open admin tab from re-fetching `/api/admin/agents/network` — eight parallel Postgres aggregates plus a live ephemeris behind a 5s memo — at round-trip speed against a pool the repo already tracks near its ceiling. This is a live production load generator, and it also blocks `useAdminResource`. **Do it today.**

2. **`<Metric>` + `Provenance` + the poisoned-query contract test** — `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/admin/kit/` + `src/services/__tests__/provenance.contract.test.ts`. Effort: **M** for the kit, then a mechanical per-panel pass. Value: retires ~28 fabricated-zero findings and the 100%-availability-from-zero-samples class, and the contract test makes the whole category non-recurring. Highest total yield in the plan.

3. **`withObservability` on `/api/onboarding`, `/api/stripe/webhook`, `/api/auth/[...nextauth]`, `/api/feed`** — four small diffs. Effort: **S**. Value: converts five permanently-UNKNOWN/permanently-zero detectors into real ones, including both money-critical dependency tiles that currently read identically whether Stripe is healthy or down. Nothing else on the board unblocks this much for this little.

4. **Grant-route discriminated result** — `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/admin/users/[userId]/grant/route.ts:107` + `src/services/TokenEconomyService.ts:445`. Effort: **M**. Value: today an operator compensating a user is told "already granted with that key" when the transaction rolled back and zero tokens moved, with the Grant button hidden. Wrong-direction money error with no retry path.

5. **Moderation tab contrast + `listReports` honesty** — `src/app/admin/chat-reports/page.tsx:67,92` and `src/services/chatDatabaseService.ts:925`. Effort: **S**. Value: one entire admin tab is white-on-light-gray (unreadable), and when its query fails it reports itself clean. Two small diffs turn an invisible, self-certifying-empty moderation queue into a working one.

*Runner-up, if a sixth fits:* `<EntityLink>` + `id::text` in the admin user search — it is the difference between "the settlement row names a customer" and "the operator copies 8 characters that match nothing".

---

## 8. Suggested sequencing

| Phase | Contents | Gate to advance |
|---|---|---|
| **A — Foundation (1 wk)** | §1.1–1.5 kit + the polling fix + the poisoned-query contract suite + the three lint/anchor/static-fact guards | Contract suite runs red against today's services; every guard is wired into `bun run verify` |
| **B — P0 sweep (2 wks)** | §2.1 money/security, then the mechanical `<Metric>`/`<ProvenanceBadge>` migration, then §2.3 windows and denominators | Contract suite green; zero `● LIVE` literals outside `kit/`; no admin render path can emit a number from a `live:false` payload |
| **C — P1 wiring (1–2 wks)** | Observability coverage, `feedEmitTracker`, abuse IPs, heatmap, anchors, rail, caller-less routes. Blocked on decisions 6.2, 6.6, 6.7 | Every panel is either live or explicitly NOT INSTRUMENTED; anchor test green |
| **D — Depth & action (2 wks)** | §1.6 `<AdminAction>`, §1.8 EntityLink/search/⌘K/alert-ack/`admin_actions`, then the P2 list | Every DUE row has a button or says "open X"; every id on screen is a link; ⌘K reaches all 10 admin destinations |
| **E — Polish** | P3 | — |

Phases B and C are parallelizable across two people once A lands; D depends on A and on the 6.9 audit-scope ruling.