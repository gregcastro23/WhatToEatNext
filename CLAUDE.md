# WhatToEatNext - Agent Guidance

## Build and Test Commands
- Build: `bun run build`
- Typecheck: `bun run typecheck`
- Verify: `bun run verify`
- Test: `bun run test`

## No fabricated values

Every value must name a basis and be reproducible from it. Where none exists,
return an explicit absent state — `null`, or a documented `ABSENT` basis — never
a plausible-looking default.

`Math.random()` is an **eslint error** in `src/constants`, `src/data`,
`src/calculations` and `src/services` (`no-restricted-syntax` in
`eslint.config.mjs`). A fabricated value in those layers is indistinguishable at
the call site from a computed one. Components keep genuine visual randomness. A
shrink-only ratchet list holds the pre-existing violations; **it may only lose
entries**. If randomness is genuinely required (ids, nonces, jitter), add an
`eslint-disable-next-line` naming why.

The same rule applies to lookups. A miss must be visible:

- Return `null` or throw — never a default object of midpoints. `getKineticProfile`
  used to return six `0.50`s on a miss.
- Never `catch { score = 0.5 }`. A swallowed error becomes a fabricated number
  and keeps the real fault out of the logs.
- Use `??`, not `||`, on numerics — `||` silently replaces a legitimate `0`.
- A guard over an empty table (`if (lookup[key])` where the table has no keys)
  reads as a working tier while never resolving anything.

Registries here are read through `Record<string, …>` index signatures, so
**TypeScript cannot see a missing key** — coverage must be a runtime test, and it
must cover the data/registry seam, not just the registry against itself.

## Agent skills

### Issue tracker

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations. Pull requests are not a request surface for triage. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage states are mapped 1-to-1 to the labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Uses a single-context domain model layout with `CONTEXT.md` at the root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Admin surface

Operator UI lives under `src/app/admin/*` behind the sidebar in `admin/layout.tsx` (admin-role + `isAdminEmail` gated). Every panel reads a live source — never fabricate admin data; degrade to an honest `live: false`/"no source" state instead.

- **Overview** (`/admin`) — panels in `src/components/admin/*Panel.tsx`, each self-polling via `useHardenedPolling`. Top of page is `LaunchReadinessPanel` (settlement backlog + config health).
- **Dashboard ✦** (`/admin/dashboard`) — the "High Alchemist" full-bleed board in `src/app/admin/_dashboard/`, fed entirely by `GET /api/admin/dashboard` → `AdminDashboardData`.
- **Settlements** (`/admin/settlements`) — restaurant ESMS settlement handle (retry/refund stuck crypto-food orders); `GET/POST /api/admin/restaurants/settlement`. Required before public payments launch (`docs/payments/CRYPTO_FOOD_PAYMENTS.md`).
- **Moderation** — `/admin/chat-reports` (`/api/admin/chat/reports`) and `/admin/feed/comment-reports`.
- **Settings** (`/admin/settings`) — live launch-readiness board over static platform facts.

**Launch readiness** = presence-only env config for the revenue/on-chain subsystems (Stripe, restaurant crypto-food payments, on-chain ESMS, Recipe-NFT, Privy, Amazon Fresh, agent network, email). Source: `src/services/launchReadinessService.ts` → `GET /api/admin/launch-readiness`. It reports booleans only — never serialize a secret's value.
