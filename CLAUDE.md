# WhatToEatNext - Agent Guidance

## Build and Test Commands
- Build: `bun run build`
- Typecheck: `bun run typecheck`
- Verify: `bun run verify`
- Test: `bun run test`

## Agent skills

### Issue tracker

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations. Pull requests are not a request surface for triage. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage states are mapped 1-to-1 to the labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Uses a single-context domain model layout with `CONTEXT.md` at the root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Admin surface

Operator UI lives under `src/app/admin/*` behind the sidebar in `admin/layout.tsx` (admin-role + `isAdminEmail` gated). Every panel reads a live source — never fabricate admin data; degrade to an honest `live: false`/"no source" state instead.

- **Overview** (`/admin`) — `PulseStrip` (one live headline per source, `GET /api/admin/pulse`) then panels in `src/components/admin/*Panel.tsx`, each self-polling via `useHardenedPolling`, starting with `LaunchReadinessPanel`.
- **Live pages** — `/admin/traffic`, `/admin/growth`, `/admin/revenue`, `/admin/chain`, `/admin/code-health`. Each reads `GET /api/admin/<name>` through `useAdminResource` (`src/components/admin/live/`) and validates with a zod schema in `src/lib/admin/schemas/`. Each schema has a compile-time drift guard against its server type, so renaming a server field fails `tsc`. Services live in `src/services/admin/`.
  - Traffic: first-party `page_views` (migration 86) written by `PageViewTracker` → `POST /api/track/pageview`. It stores no cookies and no raw IPs; the visitor hash rotates daily; bots and `/admin` are excluded.
  - Growth: humans only. A human is an account whose email is not on `@agentic.alchm.kitchen`; `is_agent` is not used.
  - Revenue: read live from the Stripe API (MRR from real prices, 30-day charges, checkout funnel by `metadata.purpose`, pending webhook deliveries).
  - Chain: Solana addresses come from `alchm-agents-solana/deployments/*.json` on GitHub and are then read live from devnet and mainnet RPC. Anchor layouts are decoded in `solanaDecode.ts`, with golden-vector tests. Also shows Base Sepolia operator gas and the claim ledger.
  - Code health: tsc/ESLint readings arrive from the CI `code-health` job, which posts to `POST /api/admin/code-health/ingest` using `CODE_HEALTH_INGEST_SECRET`. Also shows the bundled ratchet baselines, their GitHub history, CI status, commits, and PRs. `bun run health:snapshot` measures locally. Set `GITHUB_TOKEN` to lift the unauthenticated GitHub rate limit.
- **Dashboard ✦** (`/admin/dashboard`) — the "High Alchemist" full-bleed board in `src/app/admin/_dashboard/`, fed entirely by `GET /api/admin/dashboard` → `AdminDashboardData`.
- **Settlements** (`/admin/settlements`) — restaurant ESMS settlement handle (retry/refund stuck crypto-food orders); `GET/POST /api/admin/restaurants/settlement`. Required before public payments launch (`docs/payments/CRYPTO_FOOD_PAYMENTS.md`).
- **Moderation** — `/admin/chat-reports` (`/api/admin/chat/reports`) and `/admin/feed/comment-reports`.
- **Settings** (`/admin/settings`) — live launch-readiness board over static platform facts.

## Webhooks

Inbound webhooks follow one pattern (`src/lib/hooks/`):
1. Verify the provider's signature in the route.
2. Record the event in `webhook_events` (migration 87), keyed by `(source, event_id)`.
3. Dispatch by event type through a handler registry.

**`webhook_events` is the idempotency guard and the immutable record.**
- A trigger rejects any update to an event's identity or payload.
- A redelivery of a finished event is answered 200 and not re-run.
- A redelivery while the first attempt is still running gets 409, so the provider retries later.
- A redelivery of a *failed* event is re-claimed and processed again.
- Store a curated summary only, never the raw body: Stripe bodies contain customer PII.
- If the record can't be written, the event is still processed. Every handler is idempotent.

**Sources:**
- **Stripe** (`/api/stripe/webhook`): verified with `constructEvent`. It keeps Stripe's own retry contract: a failure answers 500.
- **Vercel** (`/api/hooks/vercel`): verified with `x-vercel-signature` (HMAC-SHA1 of the raw body) against `VERCEL_WEBHOOK_SECRET`.
  - A production `deployment.error` raises an operator alert.
  - A production `deployment.ready` runs the synthetic probes straight away.
  - Preview events are only recorded.

**Shared secrets:**
- Compare with `safeEqual` / `bearerMatches` from `src/lib/hooks/secureCompare.ts`, never `===`.
- The six `ALCHM_KITCHEN_SYNC_SECRET` routes already do. `secureCompare.test.ts` guards this.
- PA and ASOL still send the static header. Signed requests (Standard Webhooks) are Phase 2.

**Launch readiness** = presence-only env config for the revenue/on-chain subsystems (Stripe, restaurant crypto-food payments, on-chain ESMS, Recipe-NFT, Privy, Amazon Fresh, agent network, email). Source: `src/services/launchReadinessService.ts` → `GET /api/admin/launch-readiness`. It reports booleans only — never serialize a secret's value.
