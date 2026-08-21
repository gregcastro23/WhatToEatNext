# ADR-011: The Elemental Exchange Index — a deterministic per-token price oracle

**Status:** Accepted
**Date:** 2026-08-15

## Context

The economy already carries three live price surfaces, none of which quotes a
per-token number:

| surface                          | what it prices                                                                                                                | per-token?                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `src/lib/economy/livePricing.ts` | global action-cost multiplier `clamp(1 + (A − 20)/100, 0.85, 1.35)`; per-token only _personalized_ (natal × transit affinity) | no global per-token value |
| `src/lib/economy/celestial.ts`   | reward mirror; normalized per-coin `transitWeights` from the same sky                                                         | weights, not prices       |
| `src/lib/economy/swapRates.ts`   | pairwise token↔token rates off the planetary hour/day rulers                                                                  | pairwise only             |

The sibling prototype (`AlchmAgentsSolana`, commit `e64c0e2`) shipped a
"live elemental price index" whose audit found, among other defects: a
composite index **mathematically pinned at $1.175 forever** (its Ψ
normalization forces ΣΨ = 2), a headline price that is a step function of the
zodiac-sign tuple alone (degrees discarded, so it freezes for days between
Moon ingresses), a "24h change" produced entirely by one arbitrary
`sin(1.5t)` term (its 24h/12h waves cancel exactly over any 24h window), a
sparkline computed with a different coefficient than the price it sits next
to (0.25 vs 0.35), `success: true` responses carrying fabricated `$1.0000`
quotes on ephemeris failure, a hardcoded SOL/USD rate of 185.5, and fallback
UI that renders placeholder mint addresses as live, copyable, explorer-linked
quotes. This ADR is the flagship replacement, designed so that none of those
defect classes is _expressible_.

Two real USD rails already exist in this repo, and they disagree:

- **Mint (ask):** the Stripe MCP top-up catalog (`src/lib/billing/mcpTopUp.ts`)
  sells ESMS at $5 → 50/axis, $20 → 250/axis, $50 → 750/axis — $0.025 down to
  ~$0.0167 per token.
- **Redeem (bid):** `NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN` (shipped
  default 1¢ of food value per token), published on the `/rewards` legal
  disclosure page, which states ESMS "has no cash surrender value."

A single blended "USD price" would contradict the published disclosure and
fabricate a rate no rail honors. The two rails are the only honest USD facts.

## Decision

### 1. The index is the neutral participant's cost multiplier — derived, not invented

For each token `q` with normalized current-sky weight `w_q` (from the
canonical `alchemize` ESMS totals, exactly as `celestial.ts` computes
`transitWeights`) and global multiplier `m`:

```
EEI_q(t) = clamp( m(t) × (1 − (PERSONALIZATION_SCALE / 2) × (w_q(t) − BASELINE_WEIGHT)),
                  PER_TOKEN_MIN, PER_TOKEN_MAX )
```

**Basis: this is `getPersonalizedPricingContext` evaluated at a natal chart
equal to the uniform baseline.** Substituting `natal_q = BASELINE_WEIGHT`
into livePricing's affinity `(natal_q + w_q)/2 − BASELINE_WEIGHT` yields
`(w_q − BASELINE_WEIGHT)/2`; the rest is livePricing's own per-token clamp
formula unchanged. The index is therefore _the price the market as a whole
faces_ — the cost multiplier of a participant with no natal bias. Every
constant is **imported from `livePricing.ts`**, never copied; a test asserts
the identity by importing the same symbols.

**Polarity (RULED):** sky-abundant → cheaper. A token the current sky emits
heavily is in supply; its index falls below the global multiplier. This is
the polarity `swapRates.ts` already ruled ("tokens favored by the ruling
planet get cheaper to acquire") and the sign livePricing gives resonance.

**Reachable band (MEASURED, pinned by test):** for weights on the simplex,
the per-token factor lies in `[1 − 0.25·0.75, 1 + 0.25·0.25] = [0.8125, 1.0625]`
and `m ∈ [0.85, 1.35]`, so `EEI ∈ [0.690625, 1.434375]` — strictly inside the
`[0.5, 1.6]` clamps. The clamps are inherited for coherence, not load-bearing.

**Invariant (the anti-`$1.175` guard):** `mean_q(EEI_q) = m(t)` exactly
(pre-clamp; the clamps never bind on valid input, above). The composite
_moves_ with the A-number by construction — pinned by test at fixed instants,
alongside a negative control proving per-token values differ from each other
when weights are non-uniform.

### 2. USD appears only as the two real rails — the index is dimensionless

The payload carries `railsUsd: { mintPerToken, redeemPerToken }`:

- `mintPerToken` = `priceCents / (esmsPerAxis × 4) / 100` of the **smallest
  Stripe SKU with a configured price id** (RULED: the marginal, undiscounted
  retail rate; volume SKUs are discounts off it), `null` when no SKU is
  configured.
- `redeemPerToken` = `esmsRestaurantCentsPerToken() / 100`, `null` when the
  rate is unset — mirroring the `/rewards` page's honest-absence branch.

No blended mark, no per-token USD split, no SOL rate. Token quotes are
**index points** (1.0000 = calm balanced sky at A = 20).

### 3. One engine for every sample; history is recomputation, never storage or synthesis

All samples — the current quote, the t−24h reference, and the 25-point hourly
sparkline — are computed by the same pure function over positions from
**`getAccuratePlanetaryPositions` (local astronomy-engine)**. The economy's
live debit path (`serverPlanetaryCalculations`) is remote-first and therefore
not reproducible; the oracle pins to the local engine and names it in
`basis.engine`. Consequences:

- 24h change is a real recomputation at t−24h (planetary positions are
  deterministic), not stored state and not a waveform.
- The sparkline is the _same formula_ at 25 hourly buckets — it cannot
  contradict the headline quote.
- Any node computes bit-identical payloads for the same time bucket
  (`ORACLE_BUCKET_MS = 60_000`), so horizontally-scaled instances agree.
- Within-sign motion moves the index: aspects enter via `exactLongitude` and
  dignity via the degree-level manifest (ADR-lineage: #721/#722), so the
  index is not a step function of the sign tuple. **Amended by ADR-013:** the
  oracle-only adapter now adds `astronomy-engine` geocentric distances, so the
  ruled `Λ = M̂(r̄/r)²` tensor is live without widening the shared positions
  module's interface.

### 4. Failure degrades honestly

If the position engine throws, the route returns `success: false, live: false`
with **no token values at all** — never defaults. The positions util's own
`degraded` metadata (when it falls back internally) is propagated in the
payload. The client renders an explicit offline state; the marquee never
animates fabricated numbers.

### 5. Supply is read from the ledger, gated like all economy SQL

`circulatingSupplySql()` (per-axis `SUM` over `token_balances`) joins
`tokenEconomyQueries.ts` so the CI PREPARE gate covers it. The route attaches
`supply: { live: boolean, ... }` and degrades that block independently —
oracle math never depends on the database.

### 6. On-chain affordances are gated on configured rails only

WTEN's live chain is Base (soulbound ERC-1155, ids 0–3). The ticker shows a
chain badge/explorer link only from the existing `esms-chain` config when
present. The Solana SPL mirror (deployed from the sibling repo) surfaces only
behind `NEXT_PUBLIC_ESMS_SPL_ENABLED === "true"` **and** all four
`NEXT_PUBLIC_ESMS_SPL_MINT_*` addresses parsing as base58 — the
`recipeNftEnabled()` pattern. Unconfigured → rendered absent, never a
placeholder address. Launch readiness gains an `esms-spl-mirror` subsystem so
the operator can see the gate state.

#### Mirror addresses — MEASURED 2026-08-15

The four mints are **PDAs**, seeds `["esms_mint", <mint_id 0..3>]` under
program `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`, so they are
_reproducible from their basis_ rather than transcribed:

| id  | token     | mint                                           |
| --- | --------- | ---------------------------------------------- |
| 0   | Spirit    | `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ`  |
| 1   | Essence   | `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf` |
| 2   | Matter    | `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4` |
| 3   | Substance | `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa` |

Derivation reproduced independently (all bump 255), and **existence verified
against devnet** (`getAccountInfo`, slot 484097582): every account is live and
owned by Token-2022, `decimals: 4` (parity with the off-chain
`DECIMAL(12,4)` ledger), `tokenMetadata` written (Spirit/SPIRIT … + URI),
`freezeAuthority: null`, and mint authority `4YCVh9…` is **off-curve** — a
program PDA, not a keypair a human holds. Supplies at check:
989.0007 / 478.0014 / 217.0021 / 81.0028.

⚠️ **The gate is validity-only, by construction.** WTEN makes no Solana RPC
call — adding one would put a third-party endpoint in the render path of a
public page for a decorative link. So the gate proves an address is _well
formed and deliberately configured_, not that it still resolves. The
existence check above is a deploy-time fact recorded here; re-verify it when
the cluster or program id changes. This is also why the mirror is a link
only: no balance, supply, or price is ever read from Solana.

⚠️ **The ticker's `supply` block is the OFF-CHAIN ledger** (`token_balances`),
which is a different quantity from the SPL mints' on-chain supply. It is
labelled as such in the UI; the two must never be presented as one number.

### 7. Client discipline

One module-level store shares a single jittered poll (the `/feed` precedent:
spread ticks so public tabs don't align) across every mounted ticker — two
variants on one page can never disagree. Fetches abort superseded requests;
staleness is rendered (`lastUpdated` + live/degraded chip); the marquee is
`aria-hidden` on duplicated copies, keyboard-reachable where interactive, and
collapses to a static grid under `prefers-reduced-motion`.

## Consequences

- The oracle quotes cohere with what the debit path charges up to ephemeris
  precision (same formula, same constants by import; positions may differ at
  arcminute level between pyswisseph and astronomy-engine). `basis.engine`
  makes the residual legible.
- Between now and real `distanceAu` sourcing, the index's intraday motion
  comes from aspects, degree-level dignity, sect flips (sunrise/sunset at the
  canonical NY observer), and Moon ingress steps. That is the real engine's
  real variability — the ticker must not decorate it.
- `mean(EEI) = m` means a flat-weights sky shows four equal quotes. Honest:
  that sky _is_ symmetric.

## Open items

- ~~The imported `A_NUMBER_CENTER`/`A_NUMBER_SPREAD` carry no measured basis.~~
  Resolved by **ADR-012**: measured over 17,520 hourly real skies, re-centered
  20 → 5.84 and 100 → 6.1. The oracle inherits this by import, and its golden
  pins were re-derived there.
- ~~Real distance modulation.~~ Resolved by ADR-013's oracle-only distance
  adapter and published quantized-field/Hamiltonian audit.
- Whether `/quantities` and the admin dashboard adopt the same payload
  (they should; the route is public and cached).
- Consolidating the ~15 inline glyph/color copies onto
  `src/lib/economy/tokenVisual.ts`, seeded here.
