# ADR-013: One canonical ESMS price contract across Kitchen and Agents

**Status:** Accepted

**Date:** 2026-08-21

**Supersedes:** the independent `agents.alchm.kitchen` elemental/USD oracle

## Context

The two flagship sites published different numbers under the same four token
names. The difference was not ephemeris precision or cache timing. They were
different observables:

- `alchm.kitchen` published the neutral participant's dimensionless ESMS cost
  index from the canonical ten-body quantity engine.
- `agents.alchm.kitchen` mapped Spirit/Essence/Matter/Substance directly to
  Fire/Water/Earth/Air, assigned two “ruling planets” to each, multiplied a
  normalized harmonic by an invented `$1.00`, divided by a hard-coded
  `$185.50/SOL`, and synthesized history with sine waves. Its normalization
  fixed the composite at `$1.175`; its failure path could still return
  successful quotes.

Solana deployment establishes the Agents repo as the authority for Token-2022
identity (program, mint PDAs, decimals and explorer links). It does not create a
market or establish a USD price. The Kitchen engine is the more defensible
authority for the astronomical index because it uses the project's canonical
ESMS quantity mapping, the same pricing constants as the debit path and one
ephemeris/formula for the headline, 24-hour comparison and sparkline.

## Decision

### 1. One authority, one wire contract

`GET https://alchm.kitchen/api/economy/price-index` is the sole price-index
authority. `GET https://agents.alchm.kitchen/api/economy/price-index` is a
validated HTTP adapter: it fetches and returns the canonical payload unchanged.
It contains no price formula and no fallback quote.

The Agents client joins its own Solana mint identity metadata after consuming
the quote. Chain identity and price observation therefore remain orthogonal.

The contract is deliberately asymmetric:

```
astronomy + ESMS + pricing constants (Kitchen) ── snapshot ──▶ both tickers
Solana program + mint PDAs (Agents)              ── identity ─▶ Agents UI
```

If the canonical authority is unavailable or violates the contract, the Agents
adapter returns `live: false` with no token values. It never serves cached,
placeholder or synthetic numbers under `success: true`.

### 2. The quote is an index, not a fabricated currency price

Each `token.index` is dimensionless. `1.0000` means the neutral baseline cost,
not one US dollar and not a redeemable SOL value. The only USD fields are the
two real and separately named rails already ruled in ADR-011:

- the configured marginal mint/ask rate;
- the published food-value redeem/bid rate.

They are not averaged into a fictitious market mark. Planetary positions do
not establish financial value; they deterministically select game-economy
index points.

### 3. Quantized Gaussian-field state is the pricing basis

For the ten priced bodies and no observer-local Ascendant vessel, the continuous
ESMS field is:

```
Ψ(θ,t) = S(sect) Λ(r) g(θ − θₚ)
K(t)   = ∫S¹ Ψ(θ,t)dθ
```

`g` is a normalized wrapped Gaussian. Therefore `∫S¹g dθ = 1`: packet width is
meaningful for a local field visualization but cancels from the global state
`K`. Letting an arbitrary sigma move a global token quote would add an
unmeasured knob, so the contract explicitly publishes
`sigmaAffectsGlobalQuote: false`.

The production adapter supplies geocentric longitude and distance from
`astronomy-engine`; `Λ(r)` is the ruled relative-distance tensor. The continuous
state is quantized once at the ledger precision:

```
qᵢ = floor(Kᵢ × 10⁶)                 integer micro-ESMS
wᵢ = qᵢ / Σq                         quantized sky share
Iᵢ = clamp(m(Σq/10⁶) ×
           (1 − PERSONALIZATION_SCALE × (wᵢ − ¼)/2),
           PER_TOKEN_MIN, PER_TOKEN_MAX)
```

Flooring can only under-credit. Display-rounded values never re-enter the
calculation. The response publishes both `continuousK` and
`quantizedMicroEsms` so the state-to-index step is independently replayable.

### 4. The Hamiltonian is an audited state observable, not a currency dial

The response publishes the calibrated ESMS oscillator observable:

```
x = ln(kalchm(K))
p = Δx / Δt
H = p²/2 + ½ω²(x − x̄sect)²
```

`ω` and the sect equilibria are imported from the measured multi-year
calibration in `esmsOscillator.ts`. `H` is useful for verifying that the current
state sits on the ruled wave-function/oscillator model. No measured or legal
basis maps oscillator energy to USD, SOL or one specific ESMS axis, so `H` is
not an extra price multiplier. Making it one would weaken, not strengthen, the
contract by inventing another constant.

## Consequences

- Both sites display the same four index points from the same minute bucket.
- The Agents ticker no longer labels index points as dollars or converts them
  through a stale SOL/USD literal.
- The canonical response is replayable from time, ephemeris and named constants;
  every 24-hour point uses the same implementation.
- Deploying or migrating the Solana mints cannot silently re-price the economy.
- This is an auditable game-economy index, not a scientific claim that orbital
  geometry creates market value.
