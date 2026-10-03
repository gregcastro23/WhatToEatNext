# Runbook — shipping the Swapping Bridge and the Transmutation Circle

Written 2026-09-30 for branch `claude/hopeful-dijkstra-mxen17`.

- ADR-017 covers the Swapping Bridge, which auto-swaps at the index when a payment is short on one coin.
- ADR-018 covers the Transmutation Circle, a peer-to-peer market for ESMS trades.

## 0. Order of operations

1. **Apply migrations 90–92** (§1). Apply them before merging. All three are safe to run while `master`'s code is live.
2. **Merge the WTEN PR.**
   - Vercel deploys the app.
   - Railway's backend redeploys, and its runner should report `up to date`.
3. **Run the three sibling-repo directives** (§2).
   - The link changes are safe at any time. On old WTEN code, `/feed?tab=transmute` just opens the feed.
   - ASOL's agent trading (Part D) needs step 2 deployed first.

---

## 1. Database migrations

### What is pending

| File | What it does | Mode | Safe with `master`'s code? |
|---|---|---|---|
| `90-lower-recipe-costs.sql` | Sets `unlock-cosmic-recipe` to 2.5 and `unlock-basic-recipe` to 0.5 on each axis. Adds a comment on `token_transactions.transaction_group_id`. | transaction | Yes. In-app recipes get cheaper as soon as it runs. The MCP `generate_cosmic_recipe` tool keeps charging its hard-coded 7.5 per axis until the merge. |
| `91-transmutation-circle.sql` | Adds the `transmutation_offers` table, its CHECK constraints, partial indexes, and the `transmutation_offers_guard` trigger. | transaction | Yes. `master` never reads it. |
| `92-notification-types-transmutation.sql` | Adds the `notification_type` values `transmutation_offer` and `transmutation_accepted`. | **no-transaction** (`ALTER TYPE … ADD VALUE`) | Yes. `master` never writes them. |

### The automatic path, and why not to rely on it alone

The Railway backend applies pending migrations on every deploy:

- `railway.json` watches `database/init/**`.
- `backend/Dockerfile` runs `python -m backend.scripts.run_init_migrations` before starting uvicorn.
- If a migration fails, the deploy fails and the previous container keeps serving.

So merging to `master` would apply 90–92 by itself.

Two things are wrong with relying on that:

- **Nothing orders the Vercel deploy against the Railway deploy.** Until Railway's runner finishes, the new "Transmute" tab reads "The Circle could not be read right now", and offers can't be posted.
- **The PR's CI can't prove the Circle's SQL against production.** The `pre-merge-sql` job's "Transmutation Circle SQL parses" step prints an explicit SKIP until `transmutation_offers` exists. Applying first turns that SKIP into a real 16/16 check before any code ships.

### Apply (from a WTEN checkout of this branch)

```bash
git fetch origin claude/hopeful-dijkstra-mxen17
git checkout claude/hopeful-dijkstra-mxen17
bun install

# The production database's public URL. The repo-root .env keeps a copy as
# DATABASE_PUBLIC_URL (see rotate-database-credential.md); Railway has the source.
export DATABASE_URL="$(railway variables -s Postgres --kv | sed -n 's/^DATABASE_PUBLIC_URL=//p')"
#   or: export DATABASE_URL="$(sed -n 's/^DATABASE_PUBLIC_URL=//p' .env | tr -d '"')"

# 1. Dry run. It must list exactly these three files and nothing else.
bun scripts/migrate.ts --dry-run
```

Expected output:

```
[migrate] 3 pending: 90-lower-recipe-costs.sql, 91-transmutation-circle.sql, 92-notification-types-transmutation.sql
[migrate] DRY-RUN would apply 90-lower-recipe-costs.sql (2954 bytes, txn)
[migrate] DRY-RUN would apply 91-transmutation-circle.sql (6749 bytes, txn)
[migrate] DRY-RUN would apply 92-notification-types-transmutation.sql (572 bytes, no-txn)
[migrate] done. applied 3 new migration(s).
```

That last line is printed in dry-run mode too, and nothing has been written yet.

**If the dry run lists any other file, stop.** Production has drifted. The Admin dashboard's migration status (`/admin`) shows which files are pending. Resolve those first.

```bash
# 2. Apply.
bun scripts/migrate.ts
```

Expected output:

```
[migrate] applying 90-lower-recipe-costs.sql...
[migrate]   ok 90-lower-recipe-costs.sql
[migrate] applying 91-transmutation-circle.sql...
[migrate]   ok 91-transmutation-circle.sql
[migrate] applying 92-notification-types-transmutation.sql [no-txn]...
[migrate]   ok 92-notification-types-transmutation.sql
[migrate] done. applied 3 new migration(s).
```

### Verify

```bash
psql "$DATABASE_URL" <<'SQL'
-- 3 rows
SELECT filename, applied_at FROM _migrations WHERE filename >= '90' ORDER BY filename;
-- transmutation_offers
SELECT to_regclass('public.transmutation_offers');
-- transmutation_offers_guard
SELECT tgname FROM pg_trigger
 WHERE tgrelid = 'transmutation_offers'::regclass AND NOT tgisinternal;
-- transmutation_accepted, transmutation_offer
SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
 WHERE t.typname = 'notification_type' AND enumlabel LIKE 'transmutation%' ORDER BY 1;
-- basic 0.5 ×4, cosmic 2.5 ×4
SELECT slug, cost_spirit, cost_essence, cost_matter, cost_substance FROM shop_items
 WHERE slug IN ('unlock-basic-recipe', 'unlock-cosmic-recipe') ORDER BY slug;
SQL

# ✅ 100% PARITY: Database notification_type contains all 22 canonical values.
bun scripts/verifyNotificationEnumParity.ts

# ✓ all 16 transmutation statements parse and type-check against PostgreSQL
DATABASE_PUBLIC_URL="$DATABASE_URL" bun scripts/checkTransmutationSqlParses.ts

unset DATABASE_URL
```

Then re-run the PR's `monica-integrity` workflow. The "Transmutation Circle SQL parses against PostgreSQL" step should now list 16 statements instead of SKIP.

After the merge, the Railway backend's deploy log should read `[migrate] up to date (95 files, 95 applied)`.

### How this was verified (2026-09-30)

This used PostgreSQL 16 with a database built to `master`'s schema and all 92 of `master`'s migration files recorded in `_migrations`.

- The branch's Python runner, which is the one Railway runs, applied exactly 90, 91 and 92. Migration 92 took the no-transaction path.
- A second run of that runner reported `up to date`, and so did the TypeScript runner.
- With the three `_migrations` rows deleted, the TypeScript runner re-applied all three over the already-migrated schema without error, so they are idempotent.
- The parity check and the Circle SQL gate then passed: 22/22 and 16/16.

### Rolling back

- **Code.** Revert the merge. The migrations can stay, because `master`'s code never reads the table or the two enum values.
- **Recipe prices.** Don't edit migration 90, because the runner never re-runs a recorded file. Add a new `93-…sql` that sets the old values (7.5 and 2.5).
- **The table.**
  - Drop it only if nothing has been filled. A filled offer is the only record of which ledger group was a trade.
  - PostgreSQL can't drop enum values, and they don't need to be dropped.

---

## 2. Directives for the other repositories

Each block below is a complete prompt for a Claude Code session opened in that repository. Each was written by reading that repository at:

- AlchmHackStation `75fd6ed` (`main`)
- alchm-agents-solana `44501a8` (`main`)
- Pentacles `0910f7e` (`main`)

None of them mints, moves or converts ESMS on the client side, and the Vessel stays read-only.

### 2.1 AlchmHackStation

````text
You're working in gregcastro23/AlchmHackStation. Make one small change to the Alchm Vessel cockpit tab and its doc, then open a PR.

CONTEXT
- alchm.kitchen (WhatToEatNext, "WTEN") now has a Transmutation Circle (WTEN ADR-018, docs/adr/018-transmutation-circle.md). Players and agents trade ESMS coins there, each sending the other the coin they lack.
  - It is a tab on the feed page, deep-linked as https://alchm.kitchen/feed?tab=transmute.
  - Offers must sit within ±25% of the Elemental Exchange Index. This repo already reads that index through /api/economy/price-index (src/lib/tokenPricingEngine.ts ~line 207, proxied in vite.config.ts ~lines 484–510).
- WTEN also auto-swaps a payment's missing coin at that same index (the "Swapping Bridge", ADR-017).
- Neither change alters the Vessel contract (AlchmVesselState v1) or /api/vessel/summary.
- The Vessel stays read-only: it never mints, moves or converts ESMS (docs/ALCHM_VESSEL.md). Do not add trading or swapping UI here.

CHANGES
1. src/components/AlchmVessel.tsx — the "Transmute Yields ↗" button in the master actions (around lines 612–619):
   - Replace  openExternal('https://alchm.kitchen/feed', 'Kitchen transmutation')
     with     openExternal('https://alchm.kitchen/feed?tab=transmute', 'the Transmutation Circle')
   - Replace its title with: "Opens the Transmutation Circle on alchm.kitchen, where players and agents trade coins. The Vessel never moves tokens itself."
   - Keep the label "Transmute Yields ↗", the icon and the classes unchanged.
2. docs/ALCHM_VESSEL.md:
   - "Security invariants", last bullet: replace `alchm.kitchen/feed` with `alchm.kitchen/feed?tab=transmute` (the Transmutation Circle).
   - "Data coverage" table, Kitchen achievements row: add `practice_reward` to "Backed by".
     - WTEN's /api/economy/vessel already classifies it there (STREAM_SOURCE_TYPES.kitchenAchievements in src/app/api/economy/vessel/route.ts).
     - The Circle's trading bonus is paid as a practice_reward.
   - Add this paragraph under the table: "Trades and swaps are written to the Kitchen ledger as `transmutation` rows. They are not income: /api/economy/vessel leaves them out of every stream total and returns them in `ledger` with `stream: "other"` and descriptions such as "Transmutation Circle (offer 1a2b3c4d): gave 3 Spirit". The cockpit already renders them through STREAM_META.other. A trade moves value between two wallets, so it changes balances without changing any stream."
3. Do NOT change any of these:
   - tokenPricingEngine.ts's price source. It is already the same index the Circle and the bridge use.
   - The vite proxy.
   - The desktop-key handling.
   - The Bespoke AMM route.

CHECKS
- `bun run lint` and `bun run build` (tsc -b && vite build) both pass.
- `grep -rn "alchm.kitchen/feed'" src` returns nothing.
- In the dev server, the button opens https://alchm.kitchen/feed?tab=transmute in a new tab, and the command log shows "[VESSEL] Handed off to the Transmutation Circle."

DELIVERY
- Branch from main.
- Open a PR titled "Vessel: point Transmute at the Transmutation Circle".
- In the PR body, say the link works before and after WTEN deploys the Circle, because older WTEN just opens the feed.
````

### 2.2 alchm-agents-solana (ASOL)

````text
You're working in gregcastro23/alchm-agents-solana (ASOL). WhatToEatNext (WTEN, alchm.kitchen) shipped two economy changes that affect ASOL's agents and its Vessel widget. Follow CLAUDE.md (bun for everything; vitest for tests). Do Parts A–C and E in one PR. Put Part D in a second PR behind a flag that is off by default.

CONTEXT (verified against WTEN on 2026-09-30)
- Swapping Bridge (WTEN ADR-017). POST /api/economy/sync-debit now auto-swaps by default.
  - When a debit is short on one coin, WTEN swaps the agent's surplus coins at the live Elemental Exchange Index, in the same transaction as the debit.
  - 402 insufficient_funds now means the agent's TOTAL value can't cover the charge, not that one axis is short.
  - The 200 body gains `autoSwap: {legs, prices, …} | null`. A 402 body may carry `autoSwap: {reason, shortfallValue, deficits}`.
  - Send `autoSwap: false` in the body to opt out per call.
- Transmutation Circle (WTEN ADR-018). A peer-to-peer market: a maker posts "I give 4 Spirit, I want 3.2 Essence" and a taker fills it atomically.
  - Humans use it at https://alchm.kitchen/feed?tab=transmute.
  - Agents use a new S2S door, POST /api/economy/sync-transmute (X-Sync-Secret = ALCHM_KITCHEN_SYNC_SECRET). It acts only for agent accounts (is_agent, or an email on @agentic.alchm.kitchen); a human email gets 403 not_an_agent.
  - Agents never earn the Circle's trading bonus, so they can't farm it. They are the market makers.
- The old 3:1 POST /api/economy/transmute now answers 410. ASOL never called it; grep confirms.

SYNC-TRANSMUTE CONTRACT
Request bodies, by `action`:
  board   { action, agentEmail }
  offer   { action, agentEmail, giveToken, giveAmount, wantToken, wantAmount,
            counterpartyEmail? | counterpartyId? | replyToOfferId?   (at most one),
            message? (≤280), ttlHours? (1–168, default 72), idempotencyKey? (8–160 chars) }
  accept  { action, agentEmail, offerId }
  cancel  { action, agentEmail, offerId }
  decline { action, agentEmail, offerId }
Tokens are "Spirit" | "Essence" | "Matter" | "Substance". Amounts are > 0 and ≤ 10000; WTEN rounds them to 4 dp.

Success responses:
  board   200 { ok: true, agentId, board, mine, needs, suggestion, stats, pulse, market, bonus }
  offer   201 { ok: true, agentId, offer, replayed: false }
          200 { ok: true, agentId, offer, replayed: true }   (same idempotencyKey)
  accept  200 { ok: true, agentId, offer, trade: {gave, received, transactionGroupId}, balances }
  cancel / decline  200 { ok: true, agentId, offer }

Shapes:
- board[]: { id, giveToken, giveAmount, wantToken, wantAmount, message, status, directed, replyToOfferId, createdAt, expiresAt, closedAt, market: {parityWantAmount, takerEdgePct, withinCorridor} | null, maker: {name, isAgent}, directedToYou, youCanFill, complementsYou }
  - It holds open offers someone else made that the maker can still cover: unexpired, not blocked, and either open to all or directed to this agent.
  - `youCanFill` says whether this agent holds enough of the wanted coin.
  - Offers directed to the agent come first, then offers that give a coin it lacks for one it has spare.
- mine[]: the agent's own offers, with `funded`, `counterparty` and `taker`.
- needs: { lacking: Token[], surplus: Token[] } | null
- suggestion: { giveToken, giveAmount, wantToken, wantAmount } | null
  - A parity offer: the agent's richest coin for its scarcest, sized toward an even split.
- stats: { trades, partners, lastTradeAt }
- market: { live, prices, priceBucketStartUtc, corridorPct }

Refusals are { ok: false, reason, message }:
  400 invalid_request | invalid_offer | own_offer
  401 { error: "Unauthorized" }
  402 insufficient_funds
  403 not_an_agent | counterparty_unavailable
  404 agent_not_found | counterparty_not_found | offer_not_found
  409 offer_closed | maker_cannot_cover | too_many_open_offers
  410 offer_expired
  422 off_market
  500 failed | internal_error        (a failed fill rolled back; nothing moved)
  503 rates_unavailable              (the index can't price the sky; nothing moved)

Rules WTEN enforces:
- Terms must be within ±25% of index parity, both when posted and again when accepted.
- At most 10 live offers per maker.
- No escrow: the maker's coins stay in its wallet, and the fill re-checks both wallets under lock.
- The idempotencyKey dedupes offers per agent. The Idempotency-Key HEADER is not read by this route.
- An accept is not keyed. If a retried accept follows one that already committed, it gets 409 offer_closed "already filled".

PART A — Vessel handoff (components/AlchmVesselWidget.tsx)
- In the full variant, add a link after the "Total … ESMS" pill: "Trade in the Transmutation Circle ↗"
  - href: `${KITCHEN}/feed?tab=transmute`
  - KITCHEN is process.env.NEXT_PUBLIC_ALCHM_KITCHEN_URL || 'https://alchm.kitchen', the same as lib/kitchen-signin.ts:15. Export and reuse one helper; don't add a third copy.
  - target="_blank" rel="noopener noreferrer", styled like the existing pills.
- Leave the compact variant unchanged.
- lib/vessel/summary.ts needs no change: the /api/economy/vessel payload is unchanged. Trade rows arrive in `ledger` with stream "other"; they are not income. The Circle bonus arrives as practice_reward under kitchenAchievements.

PART B — Contract doc (docs/integrations/WTEN_CONTRACT.md)
- Add a row for POST /api/economy/sync-transmute, with the caller and the policy from Part C.
- Update row 1 (sync-debit): auto-swap is on by default, the new `autoSwap` field, and the new meaning of 402.
- Several places say /api/economy/sync-status, /api/economy/vessel and /api/internal/users/check-shared don't exist on WTEN: rows 10–12, the §4 note, the §5 Pentacles-reconciler gap, and the §7 request. All three exist on WTEN master now; sync-status and vessel landed on 2026-09-23. Re-verify against the code, then correct each place.
  - The reconciler gap may now be closable, but scheduling it is out of scope here.

PART C — Shared client
- lib/wten/delivery.ts:
  - Add 'economy/sync-transmute' to WtenEndpoint.
  - Add to WTEN_ENDPOINT_POLICY:
      'economy/sync-transmute': {
        timeoutMs: 10_000,
        timeoutSource: 'matches the economy routes',
        receiverDedupes: false, // accepts aren't keyed; retry only what never reached the handler
        conflict: 'rejected',   // 409 = offer closed / maker can't cover / book full — never "applied"
      }
- New lib/alchm-transmute-sync.ts, modelled on lib/alchm-debit-sync.ts. It never throws; it returns results.
  - Exports: circleBoard(agentEmail), postCircleOffer(input), acceptCircleOffer(agentEmail, offerId), cancelCircleOffer(agentEmail, offerId), declineCircleOffer(agentEmail, offerId).
  - Type the success bodies and the `reason` union exactly as in the contract above.
  - Event IDs (Idempotency-Key):
      offers   circle_offer:{agentUserId}:{idempotencyKey}
      accepts  circle_accept:{agentUserId}:{offerId}
      closes   circle_{cancel|decline}:{agentUserId}:{offerId}
- Tests (vitest; mock the fetch that deliverToWten uses):
  - each action's body;
  - 409 → 'rejected', not 'already_applied';
  - 402 / 410 / 422 are final;
  - 503 is retried per policy;
  - missing env → { ok: false, skipped: true }.

PART E — Stop pre-empting the bridge (lib/services/agent-action-service.ts)
- The activation gate (~lines 549–577) and action selection (~lines 740–750) require every axis to cover the cost. WTEN's sync-debit now covers a one-axis shortfall by auto-swap, so these checks refuse actions WTEN would accept.
  - This is exactly the lopsided case the bridge was built for: agents holding 700–900 tokens with one axis near empty.
- Replace both checks with a VALUE check:
    Σ balance[t] · price[t]  ≥  Σ cost[t] · price[t]
  - Take prices from GET {ALCHM_KITCHEN_SYNC_URL}/api/economy/price-index (tokens[].token → tokens[].index). This is the same index WTEN swaps at.
  - Fetch the prices once per tick.
  - If the index is unreachable or `live` is false, fall back to today's per-axis check. Never guess prices.
- Keep the existing 402 handling.
- Add tests: a lopsided agent with enough total value is activated and chooses feed_post.

PART D — Agents trade in the Circle (second PR, flag AGENT_CIRCLE_TRADING=1, default off)
- In runTick, after the action loop and inside the same pastBudget() guard, run circleStep(agent) for every evaluated agent, not only activated ones. An agent too lopsided to act is exactly one that should trade.
- circleStep(agent):
  1. board = circleBoard(agent.email). Stop if not ok, if !board.market.live, or if board.needs is null or needs.lacking is empty.
  2. Accept at most one offer per agent per UTC day. Skip this step if board.stats.lastTradeAt is today (UTC).
     - Take the first board offer with all of:
       - youCanFill && complementsYou;
       - market !== null && market.takerEdgePct >= AGENT_CIRCLE_MIN_EDGE_PCT (default 0: never worse than swapping);
       - (!maker.isAgent || directedToYou). No agent-to-agent wash trades unless one agent addressed the other.
     - Call acceptCircleOffer. On ok, log the trade and return.
  3. Otherwise post at most one offer:
     - Only if mine has no offer with status 'open' and board.suggestion is non-null.
     - Call postCircleOffer with the suggestion's terms and ttlHours: 24.
     - Use idempotencyKey circle_offer:{agentUserId}:{YYYY-MM-DD}.
     - Use message `${agentName} seeks ${wantToken} — trading ${giveToken} at the index.`
  4. Treat every refusal as final for this tick and log it. Never retry an accept on a timeout. The next tick re-reads the board.
- Tests:
  - accept preferred over post;
  - the agent-maker filter;
  - the daily cap via lastTradeAt;
  - no post while an offer is open;
  - flag off → no calls.

CHECKS
- `bun run check` (lint + format:check + typecheck) passes.
- `bunx vitest run test/` passes, including the new specs and test/vessel.

DELIVERY
- Branch from main.
- PR 1: "WTEN economy: auto-swap-aware agents, Circle client, Vessel handoff" (Parts A, B, C, E).
- PR 2: "Agents trade in the Transmutation Circle (flagged)" (Part D).
- PR 2 depends on WTEN's Circle being deployed (migrations 90–92 applied). Say so in its body.
````

### 2.3 Pentacles

````text
You're working in gregcastro23/Pentacles. alchm.kitchen (WhatToEatNext, "WTEN") shipped a Transmutation Circle: a peer-to-peer market where players and agents trade ESMS coins, each sending the other the coin they lack (WTEN ADR-018). Its entry point is https://alchm.kitchen/feed?tab=transmute. The only change Pentacles needs is to point the Alchm Vessel drawer's "Transmute" handoff there.

STEP 1 — FIND THE DRAWER FIRST
- AlchmHackStation's docs/ALCHM_VESSEL.md lists the Pentacles Vessel as src/ui/vessel-model.js and src/ui/vessel-drawer.js.
- Neither file is on main (0910f7e), and the only other pushed branch is feat/solana-mainnet-conformance.
- Check your local branches, worktrees and stashes:
    git branch -a
    git worktree list
    git log --all --oneline -- src/ui/vessel-drawer.js src/ui/vessel-model.js
    git stash list
- If the drawer isn't anywhere, STOP. Report that back, and don't build a drawer in this task.

STEP 2 — IF THE DRAWER EXISTS
- Point its Transmute handoff at `${KITCHEN}/feed?tab=transmute`. If it has none, add one labelled "Transmute ↗" next to its other hand-offs.
  - KITCHEN is `(import.meta.env.VITE_KITCHEN_ORIGIN || 'https://alchm.kitchen').replace(/\/+$/, '')`, the same expression as src/net/auth.js:22.
  - Export that constant from one place (src/net/auth.js, or a new src/net/origins.js that auth.js imports). Don't duplicate it.
- Open it with window.open(url, '_blank', 'noopener,noreferrer').
- Title/tooltip: "Opens the Transmutation Circle on alchm.kitchen, where players and agents trade coins. The Vessel never moves tokens itself."
- Do NOT add trading, swapping or conversion to Pentacles.
  - The Circle trades only the Kitchen ledger.
  - Arena tokens and the pillar pool (SpacetimeDB, 10 game units = 1 ESMS) are not part of it, and ASOL's pentacle_conv flow is unchanged.
- Trade rows arrive in the Vessel's `ledger` with stream "other"; they are not income. If the drawer's ledger folio has no case for "other", render it with a neutral tag and the row's description.

CHECKS
- `bun run test:vessel` passes (per ALCHM_VESSEL.md), and so does `bun run build`.
- `grep -rn "alchm.kitchen/feed'" src public` returns nothing.

DELIVERY
- Branch from the branch that holds the drawer.
- Open a PR titled "Vessel drawer: Transmute opens the Transmutation Circle".
````
