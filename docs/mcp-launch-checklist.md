# Alchm MCP — Public Launch Checklist

This is the operator-facing checklist for shipping the Alchm MCP server to the
public. It's the synthesis of Phase 1 (PR
[#455](https://github.com/gregcastro23/WhatToEatNext/pull/455)) and Phase 2 (PRs
[#457](https://github.com/gregcastro23/WhatToEatNext/pull/457) +
[#458](https://github.com/gregcastro23/WhatToEatNext/pull/458) +
[#459](https://github.com/gregcastro23/WhatToEatNext/pull/459) +
[#460](https://github.com/gregcastro23/WhatToEatNext/pull/460)), and lists what
still has to land before the connector can be announced.

Last updated: 2026-05-27.

---

## What ships when an item is checked

| Item | Surfaces unlocked | Owner | Status |
|---|---|---|---|
| 1. Synthetic probe writing success rows | `/admin` MCP Tool Surface row goes green | platform | ✅ verified 2026-05-27 |
| 2. API key mint/use/revoke UX live | `/profile/api-keys`, `/docs/mcp` | platform | ✅ shipped in #457/#458 |
| 3. Stripe MCP top-up flow live | `/account/billing/mcp`, 3 SKUs ($5/$20/$50) | platform + ops | ✅ Products created live, env vars set, redeployed 2026-05-27 |
| 4. Cross-server admin panel | `/admin/mcp` (Network / Personas / Quotas tabs) | platform + PA | ⏸ blocked on PA shipping `/api/admin/mcp-summary` |
| 5. Public connector docs match shipped UX | `mcp-server/README.md`, Claude Desktop + Cursor configs | platform | ✅ updated in #458 |
| 6. Rate-limit load test (100 RPM synthetic key) | confirms `src/lib/rateLimit.ts` holds under load | platform | ⏸ not run |
| 7. `rate_limit_tier` ↔ subscription tier alignment | premium users get higher RPM by default | platform | ⏸ spec'd, code in followup |
| 8. Launch comms | `/blog/announcing-alchm-mcp` or equivalent | marketing | ⏸ not drafted |
| 9. MCP server registry submission | listing on whichever marketplace exists at the time | marketing | ⏸ pending |

---

## Verification commands

Run these in order on the deployed environment. All should succeed before flipping the announcement switch.

### Synthetic-MCP probe is healthy

```sql
-- Expect: last 4 rows success=true, ~100-250ms latency, 30 min cadence.
SELECT tool_name, caller, success, latency_ms, called_at
FROM mcp_invocations
WHERE called_at > now() - interval '2 hours'
ORDER BY called_at DESC LIMIT 8;
```

### `/admin` Service Matrix

Sign in as the admin user, scroll to **System Status panel**.

- **MCP Tool Surface** row: status `OK`, `Calls · 1h ≥ 4`, `Failures · 1h: 0`
- **AI Recipe Generation** row: status `OK` (this is the separate hourly HTTP probe; was 502'ing pre-#458, fixed by `PLANETARY_AGENTS_API_URL` env var)
- **Stripe** dependency: status `OK` (was UNKNOWN until first webhook traffic — a single top-up purchase flips it)

### `/admin/dashboard` Agent Telemetry

Four tiles below the "db · ephemeris" heading:

- Agent Harmony
- Transmutation
- Spiritual Entropy
- **MCP Invocations** ← shipped in #459

All four should show `live: true`.

### API key end-to-end

```text
1. /profile/api-keys → "Mint a key"
2. Confirm plaintext appears once with a copy button + dismiss warning
3. Copy the key, dismiss the modal, confirm row appears in list with "Active" badge
4. Use the key as _meta.apiKey against `bun run mcp-server/src/index.ts`:
     {"method":"tools/call","params":{"name":"get_live_sky_transits","arguments":{"_meta":{"apiKey":"alchm_..."}}}}
5. Query: SELECT user_id, api_key_id, tool_name FROM mcp_invocations ORDER BY called_at DESC LIMIT 1;
6. Both user_id and api_key_id should be non-NULL.
7. Revoke the key in the UI; same MCP call now returns 401.
```

### Stripe top-up end-to-end

> ⚠️ Live mode. Use a real card on a real Product. Refund after via Stripe dashboard.

```text
1. /account/billing/mcp → click "Top up" on the $5 (Starter) SKU
2. Complete Stripe Checkout (real card, $5 will be charged)
3. Confirm ESMS balance increases by +50 on all 4 axes (Spirit / Essence / Matter / Substance) in the user's token ledger
4. Query: SELECT * FROM token_transactions WHERE source_type='mcp_top_up' ORDER BY created_at DESC LIMIT 5;
5. The idempotency_key column should be the Stripe checkout.session.id — re-firing the webhook with the same payload must NOT double-credit (the unique constraint on token_transactions.idempotency_key blocks it).
6. Refund via Stripe dashboard for the test purchase.
```

### Rate-limit load test

Pending. Plan:

```bash
# k6 or similar:
k6 run --vus 1 --duration 1m --rps 100 \
  --env API_KEY="alchm_..." \
  rate-limit.js
# Expect: 60 RPM cap → ~60 successes + ~40 429s per minute.
# Bump rate_limit_tier in DB for the test key first if your default is lower.
```

### Stripe Products are exactly the three live SKUs

```bash
stripe products list --limit 5 \
  | jq -r '.data[] | select(.metadata.purpose=="mcp_top_up") | "\(.id)\t\(.name)\t\(.active)"'
# Expect 3 rows, all active=true:
#   prod_UauxwbaFwDAFKc    Alchm MCP Top-Up — Starter   true
#   prod_UauxzJrNlVN3mT    Alchm MCP Top-Up — Builder   true
#   prod_UauxlwPp8mwzV0    Alchm MCP Top-Up — Adept     true
```

---

## Operator decisions recorded

These were left as open questions in the PR #458 body and resolved in the
2026-05-27 ops session.

### SKU naming

**Decision:** keep snake_case (`mcp_top_up_5` / `mcp_top_up_20` /
`mcp_top_up_50`). The existing `shop_items` use kebab-case slugs (e.g.
`unlock-cosmic-recipe`) but Stripe-side metadata conventionally uses snake_case
and the SKUs aren't user-visible. Not worth migrating; document and move on.

### `rate_limit_tier` ↔ subscription tier

**Decision:** align. Free users → `"apprentice"`, premium users →
`"alchemist"`. Explicit overrides still respected. Spec lives in queries.ts;
implementation deferred to a follow-up PR because changing the default trips the
existing tests that assert `"authenticated"` is the default — the followup needs
to update those test cases at the same time. Tracked as a session task.

### Stripe live mode vs test mode

**Decision:** ship live Products. The session created them with real Price IDs:

```
STRIPE_MCP_TOP_UP_5_PRICE_ID  = price_1Tbj7K567feWgZJOGA0VRJeL
STRIPE_MCP_TOP_UP_20_PRICE_ID = price_1Tbj7L567feWgZJOSvLvd8n0
STRIPE_MCP_TOP_UP_50_PRICE_ID = price_1Tbj7M567feWgZJOnPMatNgh
```

All three are set on Vercel production environment. Products are archivable but
not deletable, so if naming/copy ever changes we deactivate + create new ones.

---

## Known limitations at launch

Surface these in the announcement post so external integrators don't trip on
them silently.

### MCP `latency_ms = 0` rows pre-2026-05-27

Warm-cache invocations of `generate_cosmic_recipe` were truncating sub-millisecond
execution to `0` in the `latency_ms` integer column. Fixed by flooring at 1ms in
`src/lib/mcp/invocationLog.ts` (this PR's companion change). Old rows still
show `0`; new rows show `≥ 1`. No effect on success/failure or telemetry rates.

### Slow query / connection pool saturation

A diagnostic pass turned up 19 slow queries in the `> 5 minute` bucket, with one
outlier at 1737s (~29 min). Root cause is **not** missing indexes or large
tables (largest is 305 rows / 56 kB). It's serverless cold-start storms
saturating the Railway Postgres connection cap — each Vercel function instance
opens its own pool, and during high-traffic moments the DB-side connection limit
gets exhausted, forcing subsequent function instances to block on pool
acquisition for many seconds. The slow-query log records the full elapsed time
including pool wait, hence the multi-minute values.

Fix is architectural — needs a connection pooler (PgBouncer / Supavisor) in
front of Postgres, OR a module-level singleton pattern that reuses a single
connection per function instance. Not blocking launch; tracked as a followup
task.

### Cross-server admin panel deferred

`/admin/mcp` (Network / Personas / Quotas tabs) is **not** shipped. PA needs to
expose `/api/admin/mcp-summary` first so we have both sides of the topology to
render. The single-server MCP Tool Surface row on `/admin` covers the WTEN-side
telemetry until then.

### Rate-limit enforcement

Token economy is the primary throttle for authenticated users (ESMS debit per
call). The per-key RPM rate limit via `src/lib/rateLimit.ts` exists but the
load test in this checklist hasn't been run yet — RPM ceiling is theoretical
until then.

---

## Launch sequence

When items 6–9 above all land:

1. **Toggle public access.** Already public — no toggle required.
2. **Post announcement** — `/blog/announcing-alchm-mcp` and cross-post.
3. **Submit to MCP registries** — whatever marketplace exists at the time.
4. **Monitor** for 24h:
   - `mcp_invocations` row velocity (expect ≥ 2/hr from the probe, more from real users)
   - `synthetic_probe_results` failures (any new failures = investigate)
   - `token_transactions` source_type='mcp_top_up' velocity (purchases)
   - Stripe Dashboard for refund requests (signals UX confusion)
5. **Daily probe-health cron** (scheduled in same session) summarizes the above into a single notification.

---

## References

- Phase 1 PR: [#455](https://github.com/gregcastro23/WhatToEatNext/pull/455)
- Phase 2 PRs: [#457](https://github.com/gregcastro23/WhatToEatNext/pull/457), [#458](https://github.com/gregcastro23/WhatToEatNext/pull/458)
- Companion fixes shipped same day: [#459](https://github.com/gregcastro23/WhatToEatNext/pull/459) (4th telemetry tile), [#460](https://github.com/gregcastro23/WhatToEatNext/pull/460) (PA URL hygiene)
- Phase 2 prompt: `NEXT_SESSION_PROMPT_MCP_PHASE_2.md` (repo root, gitignored)
- Architecture: `mcp-server/ARCHITECTURE.md`
- Public connector docs: `mcp-server/README.md`, `src/app/docs/mcp/page.tsx`
