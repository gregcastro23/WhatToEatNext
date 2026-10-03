# ADR-018: The Transmutation Circle — peer-to-peer ESMS trading

**Status:** Accepted
**Date:** 2026-09-30
**Builds on:** ADR-011 (Elemental Exchange Index), ADR-017 (Swapping Bridge)

## Context

After ADR-017, one practitioner can convert coins alone at EEI parity: the
Swapping Bridge does it inside a payment, and `/api/economy/swap` does it on
request. `/api/economy/transmute` still converted at a fixed 3:1. That ratio
ignored prices that move every oracle minute, and it made transmuting strictly
worse than swapping.

The economy's shape suggested a better use. Most practitioners, agents
especially, hold plenty of value but run one axis dry. Two practitioners short
on opposite coins can fix each other directly. **Swapping is solitary;
transmuting should be social.**

## Decision

### 1. Transmutation is a trade between two practitioners

A **maker** posts an offer: "I give N of coin A for M of coin B". It can go to:
- the whole Circle;
- one practitioner, by id or (for agents) by email;
- the maker of another offer, as a counter-offer.

A **taker** fills it, and both wallets move. Humans trade through
`/api/economy/transmute` with their own session. Agents trade through
`/api/economy/sync-transmute` with the engine's sync secret, and only for
accounts that are agents. The secret never moves a human's coins.

### 2. No escrow

Posting an offer locks nothing. It is a standing intention, so:
- `token_balances`, circulating supply, the faucet's supply damping and the
  drift check are untouched;
- the board lists only offers the maker can **currently** cover;
- a fill re-checks both sides under lock. If the maker has since spent the
  coins, the fill is refused (`maker_cannot_cover`) and nothing moves.

Escrow would have made every open offer look like a supply burn, and it would
have needed a sweep to return coins when offers expire. The cost of dropping
it is a rare refused fill, and that refusal is always honest.

### 3. A fill is one transaction

```
lock the offer (FOR UPDATE)        — racing takers serialize here
lock both balance rows, user-id order — two fills cannot deadlock
re-check both sides, and the corridor at today's index
maker −give  taker −want  maker +want  taker +give   (4 × `transmutation`)
UPDATE … SET status='filled' WHERE status='open'
```

All four rows share one transaction group, with `source_id` set to the offer
id. What leaves one wallet lands in the other, so supply is conserved on every
axis. Any failure after the first write throws, and the fill rolls back whole.

`transmutation_offers` (migration 91) makes terms immutable, and a trigger
stops a closed offer from ever reopening.

### 4. The fair-value corridor: ±25% of EEI parity

An offer's value ratio must sit within `[1/1.25, 1.25]` of parity at the live
index. The bound is multiplicatively symmetric, so neither side can gain more
than 25% over the house swap. The check runs at posting **and** at fill.

- **What it allows.** A maker who badly needs a coin can post a generous
  offer, and filling it beats swapping. The board shows every offer's edge.
- **What it forbids.** A "trade" such as 0.01 Spirit for 50 Essence is really
  a transfer. Rings of fresh accounts could use those to funnel their welcome
  grants into one wallet.

The Circle judges fairness from the same EEI feed (`getLiveSwapQuote`) as the
Swapping Bridge and the public rate sheet. All three prices agree within an
oracle minute. With no live index, posting and filling are refused
(`rates_unavailable`); fairness is never guessed.

### 5. What encourages trading

- **The board is ordered to be useful.** It shows offers made to you first,
  then offers that give what you **lack** for what you have to **spare**
  (judged by value), then the best edge over the house.
- **A suggested trade.** It offers the richest coin for the scarcest, at
  parity, sized toward an even split, and posts in one tap.
- **The Circle bonus.** A new practice, `transmutation_shared`, pays 1
  Essence, modulated by the sky and the chart as every practice is.
  - Both human parties earn it.
  - It pays once per **partner** per day, for at most 3 partners a day.
  - Trades under 1 value unit don't qualify.
  - Agents never earn it, so programs cannot farm it. They are the Circle's
    natural market makers.
- **Bells.** A directed offer rings the counterparty (`transmutation_offer`).
  A fill rings the maker (`transmutation_accepted`). Both come from
  migration 92.
- **The feed.** Open offers (`transmutation_offer`) and completed trades
  (`transmutation_trade`) appear on the Live Network Feed. They deep-link to
  `/feed?tab=transmute`.
- **Privacy.** A human is named only when their identity is shared, the same
  rule the feed uses. Otherwise they read as "a fellow alchemist" and are
  never linked.

### 6. The 3:1 solo transmutation is retired

The following are removed:
- `TokenEconomyService.transmute`
- `TRANSMUTATION_RATIO`
- the old response and request types
- `EconomyTransmuteRequestSchema`

A request in the old `{fromToken, toToken, amount}` shape gets **410** pointing
to `/api/economy/swap`. `transmuteSql` stays, because the Swapping Bridge
books its legs with it.

## Consequences

- **Where the SQL lives.** The Circle's SQL is in `transmutationQueries.ts`
  (offers and fills) and `transmutationBoardQueries.ts` (the Circle's reads),
  not `tokenEconomyQueries.ts`. The economy gate PREPAREs against production
  on every PR, so a PR that adds the table would fail its own gate.
  `checkTransmutationSqlParses.ts` PREPAREs all 16 statements. It prints an
  explicit **SKIP**, not a pass, until migration 91 exists on that database.
- **The Vessel.** It reads the ledger's inflow streams. A trade's
  `transmutation` rows fall into "other", so a trade never reads as income.
  The Circle bonus is a `practice_reward`, which counts as a Kitchen
  achievement. The Vessel's "Transmute" button should open
  `/feed?tab=transmute`.
- **Limits.** Offers last 1–168 hours (default 72), with at most 10 live per
  maker and amounts up to 10,000. An open offer past its expiry reads as
  `expired`; no sweep is needed because nothing is held. A full book answers
  409, not 429: 429 stays the rate limiter's, and S2S clients retry it.
- **Rollout.** `docs/runbooks/transmutation-circle-rollout.md` covers applying
  migrations 90–92 and the follow-up work in AlchmHackStation,
  alchm-agents-solana and Pentacles.
- **Verification.**
  - Unit tests: `transmutationMarket.test.ts`, `transmutationService.test.ts`
    (a transactional fake, including a mid-fill rollback and supply
    conservation), both route suites and `TransmutationCircle.test.tsx`.
  - The whole flow was also driven against PostgreSQL 16:
    - an off-market refusal;
    - a replay;
    - board ranking;
    - a fill with 4 grouped rows and both bonuses;
    - a refill refused;
    - directed-offer privacy;
    - decline and counter;
    - a maker who has spent the coins.
