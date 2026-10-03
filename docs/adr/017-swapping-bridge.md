# ADR-017: The Swapping Bridge — universal ESMS payments at EEI parity

**Status:** Accepted
**Date:** 2026-09-30
**Builds on:** ADR-011 (Elemental Exchange Index), ADR-003 (token-economy throttle)

## Context

Every priced action charges a four-axis ESMS basket. Until now, a payer who
was short on **one** axis was refused, however much value they held on the
other three. A user holding 20 Spirit and no Essence could not pay a 2.5-each
basket; an agent's S2S charge 402'd for the same reason.

Two surfaces claimed to price one coin in another, and they disagreed:

| surface                         | basis                                             |
| ------------------------------- | ------------------------------------------------- |
| `swapRates.ts` / swap-rates API | 3:1 base ratio floated off planetary hour/day     |
| `priceIndex.ts` (EEI, ADR-011)  | per-token neutral-participant cost multiplier     |

The 3:1 sheet priced nothing else in the economy, so a quoted rate could be
off from the price of anything by up to 50% either way.

## Decision

### 1. One price basis: EEI relative parity, no spread

A swap of A into B is 1:1 in **value** at the live Elemental Exchange Index:

```
units of A per 1 unit of B  =  P_B / P_A
```

Internal payments carry no spread. The public rate sheet (`swapRates.ts`,
`GET /api/economy/swap-rates`) is computed by the same function (`oracleRate`)
over the same feed (`getLiveOracleQuote`) as the bridge, so a quoted rate is
exactly the rate a payment is auto-swapped at within the same oracle minute.
The planetary rulers are still reported as sky context; they set no price.

`getLiveOracleQuote` computes the current EEI from **one** sky sample at the
bucket instant, the same computation that produces the snapshot's headline
index. It skips the 24 sparkline samples (~330–540 ms locally). When the
snapshot for the bucket is already memoized, it reads the quote from that.

### 2. The waterfall

`planAutoSwap` is pure:

1. Per axis, `deficit = max(0, cost − balance)` and `surplus = max(0, balance − cost)`.
2. Order surplus coins richest-first **by value** (units × price), with ties
   broken by units and then canonical order.
3. For each deficit coin B, in canonical order, draw
   `deficit × P_B / P_A` from the richest coin A. If A cannot cover it, A is
   exhausted and the rest overflows to the next coin.
4. If surplus value < deficit value, or per-leg rounding leaves any sliver
   uncovered, return `canCover: false` with **no legs**. There is no partial
   swap.

All arithmetic is exact BigInt math in ledger units (DECIMAL(12,4)). Every leg
rounds against the payer by at most one unit (units drawn round up, units
delivered round down), so no round trip gains value. That is what makes a
zero-spread market safe.

### 3. Atomicity and the ledger shape

One auto-swapped payment is **one transaction and one transaction group**:

```
lock balance row (SELECT … FOR UPDATE)
  → plan from the locked numbers
  → per leg: transmutation debit of A + transmutation credit of B   (transmuteSql)
  → payment debit                                                 (same group id)
COMMIT — or ROLLBACK on any throw
```

- Prices are read **before** the transaction in `purchaseShopItem`. In
  `sync-debit` they are read only after a short basket is found (one memoized
  sample). No row lock is held across a full snapshot build.
- A leg that moves no balance throws `SwapLegFailedError`. A payment refused
  after swaps throws too; it must never commit the swaps without the charge.
- Leg idempotency keys are `<payment key>:swap<n>:<TokenType>`, under the
  payment's own prefix, so the existing `LIKE '<key>:%'` probe catches a
  replay. A key that would overflow VARCHAR(255) is written unkeyed. The
  payment rows' keys still reject the replayed transaction.
- No schema change was needed. `transaction_group_id` has no uniqueness
  constraint, and `source_type` is an unconstrained VARCHAR. Migration 90
  documents this on the column.

### 4. Where it runs

| caller                                 | default | opt-out           |
| -------------------------------------- | ------- | ----------------- |
| `TokenEconomyService.purchaseShopItem` | on      | `autoSwap: false` |
| `POST /api/economy/sync-debit` (S2S)   | on      | `autoSwap: false` |
| `POST /api/generate-cosmic-recipe`     | on      | `autoSwap: false` |

The purchase route, the recipe-NFT mint and basic recipes inherit it through
`purchaseShopItem`. `debitAllTokens` (on-chain claims, ingestion) does **not**
auto-swap. An on-chain claim moves an exact snapshot, and converting coins
would change what is claimed.

A funded basket takes the unchanged one-statement fast path, with no
transaction and no oracle read.

### 5. Honesty

- No oracle, no swap. An unpriceable sky yields
  `insufficient_funds` + `autoSwap.reason = "rates_unavailable"`, and the
  swap-rates API answers 503 `live: false` with no rates.
- Responses name what happened: a success carries `autoSwap` (legs, prices,
  bucket, basis, spread) or `null`. A refusal carries the reason
  (`insufficient_value`, `rates_unavailable`, `no_balance`), the shortfall and
  the per-axis deficits.
- Refunds of an auto-swapped charge credit `refundBasketAfterSwap`: the basket
  minus what the swaps delivered plus what they consumed. It is never negative,
  so it is a pure credit that restores the payer exactly.

### 6. Prices rebased

With any axis fundable from the whole balance, recipe unlocks are priced
against total holdings. `unlock-cosmic-recipe` is 2.5 of each axis (10 total)
and `unlock-basic-recipe` is 0.5 of each (2 total). See migration 90.

## Consequences

- `POST /api/economy/swap` now converts at EEI parity (via
  `quoteSourceAmount`), not 3:1 × a planetary modifier. The fixed-3:1
  `/transmute` has since been retired: transmutation is now peer-to-peer
  trading (ADR-018).
- The EEI clamps to [0.5, 1.6], so the most extreme cross rate is 3.2:1.
- Verification: `swappingBridge.test.ts`, `swapRates.test.ts`,
  `TokenEconomyService.autoSwap.test.ts`, `syncDebitAutoSwap.test.ts` and
  `autoSwapPayment.test.ts` cover the arithmetic and wiring. The real SQL runs
  through `checkEconomySqlParses.ts` (PREPARE) and
  `checkEconomyStatementBehaviour.mjs`, which replays lock → leg → grouped
  payment against PostgreSQL.
