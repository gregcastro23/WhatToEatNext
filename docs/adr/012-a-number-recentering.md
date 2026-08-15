# ADR-012: Re-centering the global cost multiplier on the A-number the sky actually produces

**Status:** Accepted (ruled 2026-08-15)
**Date:** 2026-08-15
**Depends on:** ADR-011 (the price-index oracle inherits these constants by import)
**Rulings:**
1. Candidate **B** — `A_NUMBER_CENTER 20 → 5.84`, `A_NUMBER_SPREAD 100 → 6.1`.
2. **Unify down** — the economy prices the ten ESMS planets on every path.
   `PRICED_BODIES` in `livePricing.ts` is the one whitelist; the debit, reward
   and quote paths all filter through it. Net effect vs production today:
   **+12.0%**, and charge now equals quote by construction.

> ### The blocker this ADR nearly shipped with (found 2026-08-15, after ruling 1)
>
> Resolved by ruling 2 — kept in full because the *way* it hid is the reusable
> lesson.
>
> Ruling 1 was taken on a **wrong baseline**. The original measurement ran
> under jest, which **blocks outbound network** — so `getLivePricingContext`
> silently fell back to the local engine and the "backend unreachable" note in
> the first draft of this ADR described the *test harness*, not production. The
> live Railway backend (`whattoeatnext-production.up.railway.app`) is healthy,
> and `BACKEND_URL` **is** set in Vercel production.
>
> `calculatePlanetaryPositionsWithMeta` tries that backend **first** and returns
> its positions verbatim. The backend (pyswisseph) returns **14** keys —
> including **`Ascendant`**, which `alchemize` counts (it carries Matter;
> `RealAlchemizeService.ts:351`, SYNTHESIS_MODEL §14a). The local engine returns
> 12 and no Ascendant, and ADR-011 §3 deliberately prices **without** it.
>
> **Measured over 49 real backend samples (2025-08-15 → 2027-07, 15-day step):**
>
> | | value |
> |---|---|
> | Ascendant's contribution to A | **+3.0129** mean (2.85 – 3.2239), never 0 |
> | pyswisseph vs astronomy-engine, same 10 bodies | **0.0003** mean abs, 0.0014 max |
> | debit-path A (backend, with Ascendant) | ~8.805 |
> | oracle-path A (local, 10 bodies) | ~5.792 |
>
> The two ephemerides agree to 3e-4 — **the entire gap is the Ascendant.**
>
> **Consequences of deploying B as it stands:**
>
> | state | mean multiplier | vs production today |
> |---|---|---|
> | production today (center 20, +Ascendant) | **0.888** | — |
> | B as shipped (Ascendant left in) | **1.3472**, ceiling-clamped **95.9%** of samples | **+51.7%** |
> | B with body sets unified (Ascendant dropped) | 0.9944 | **+12.0%** |
>
> So the approved "+16.5%" was measured against 0.8584 — the *local* path, which
> production does not use. The true baseline is **0.888**, and shipping B
> unchanged is **+51.7%** with debits pinned to the ceiling and the charge
> running **35.5% above the oracle's own public quote**.
>
> The old center masked this: at spread 100 the same 3.01 A-gap was a 3.5% price
> difference. Re-centering did not create the divergence — it **amplified it 16×**
> (spread 100 → 6.1).
>
> Reproduce: `scratchpad/fetch-backend-positions.mjs` (captures live positions
> outside jest) + `harness-backendReconcile.test.ts`.

## Ruling 2: unify down — one sky for the whole economy

The Ascendant is **observer-local**: the sign rising at a particular latitude
and longitude, completing a full circle every 24h. Tying a global economic
index to whatever default lat/long the backend happens to be configured with is
conceptually broken — the price of the system should not depend on where the
server thinks it is. ADR-011 §3 already priced without it; the debit path
simply predated that ruling and inherited whatever its position source returned.

So the debit and reward paths now price the same ten bodies the oracle quotes,
via one exported whitelist:

```ts
export const PRICED_BODIES = [
  "Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto",
] as const;
export function isPricedBody(name: string): boolean;
```

Applied at the **pricing boundary** — inside each module's position adapter —
not in the shared position util, so natal charts, the wheel and sect logic keep
every body they need. It is a **whitelist, not a blocklist**: the failure mode
being closed is a position source starting to return a new body and silently
re-pricing the economy, which is exactly what `Ascendant` did.

`MC` and both node spellings (`NorthNode` and `North Node`) fall out too;
measured, they contribute exactly 0 to ESMS, so their exclusion is
behaviour-preserving and merely makes the ten-body contract explicit rather
than true-by-accident of which ephemeris answered.

**The constants did not need re-deriving.** The 17,520-hour sweep was always
run on the ten-body local engine, so the unified sky *is* the sky the
distribution was measured on — ruling 2 makes production match the measurement
rather than the measurement chase production. The golden pins are likewise
unchanged: the fixture sky carries only the ten planets. Both were re-run and
confirmed, not assumed.

### Verification

- `pricedBodies.test.ts` — the whitelist's contents; that it rejects every
  shape the remote adds; a regression test feeding the **full 14-key real
  backend payload** through `computeSkySample` and asserting it equals the
  ten-planet subset; and an **end-to-end** test driving
  `getLivePricingContext` (the function the six debit routes call) with that
  payload, asserting `aNumber` and `multiplier` equal the oracle's. The mock is
  asserted consumed (`toHaveBeenCalledTimes(1)`) so it cannot pass inertly.
- Backend samples in that suite are real captures, replayed as fixtures —
  because a live reconciliation *inside* jest is exactly what hid the bug.
- Full suite 242/242, 2,386 passed; `tsc --noEmit` exit 0; eslint clean.

## Context

Every ESMS debit and every practice reward is scaled by one global multiplier,
defined in `src/lib/economy/livePricing.ts`:

```ts
globalMultiplierForANumber(a) =
  clamp(1 + (a - A_NUMBER_CENTER) / A_NUMBER_SPREAD, 0.85, 1.35)
// A_NUMBER_CENTER = 20, A_NUMBER_SPREAD = 100
```

`A_NUMBER_CENTER = 20` is a claim: *the calm, typical sky totals 20 ESMS, and
at that total the economy charges 1.00×.* That claim carries no recorded basis.
It was plausible against an older engine whose totals ran larger; it did not
survive #695/#710.

The multiplier is not a cosmetic display value — it multiplies real debits in
six API routes and the Recipe-NFT quote path, and real credits in the practice
reward service.

## Measurement `[MEASURED 2026-08-15]`

**Method.** `getAccuratePlanetaryPositionsWithMeta` (local astronomy-engine) →
`computeSkySample` (`priceIndex.ts`) → `RealAlchemizeService.alchemize`. This is
the exact path the oracle prices with, not a reimplementation of it.

**Control.** The harness reproduces the committed golden pin from
`priceIndex.test.ts` (fixture sky → `aNumber 6.3484`, `multiplier 0.8635`)
before it sweeps anything. Without that, the sweep could be measuring a
different engine than the one that charges.

**Window.** 2025-08-15T00:00Z → 2027-08-15T00:00Z, hourly. **n = 17,520**,
10,070 distinct A-values (so the sky is genuinely moving — not the sign-blind
collapse).

### The A-number distribution

| min | p01 | p05 | p25 | **p50** | p75 | p95 | p99 | max | mean | sd |
|---|---|---|---|---|---|---|---|---|---|---|
| 4.3725 | 4.9226 | 5.3061 | 5.6174 | **5.8355** | 6.0971 | 6.6098 | 7.1743 | 7.4889 | 5.8785 | 0.4113 |

**`A_NUMBER_CENTER = 20` is 34.3 standard deviations above the measured mean.**
`m = 1.00` is not rare — it is unreachable. The `1.35` ceiling needs `A = 55`,
about 119 sd out.

**Robustness.** A 30-year sweep (2010–2040, 6-hourly, n = 43,828) gives
p50 = 5.7948, mean = 5.8253, sd = 0.3912 — within 0.7% of the 2-year median. The
center is not an artifact of the sampling window. Sect contributes almost
nothing: diurnal p50 5.8239 vs nocturnal p50 5.8435.

### What the pre-ADR constants (center 20, spread 100) actually did

| | value |
|---|---|
| multiplier range realised | **0.8500 – 0.8749** |
| multiplier p50 / sd | 0.8584 / **0.0040** |
| fraction of the intended 0.85–1.35 band used | **4.98%** |
| hours pinned to the 0.85 **floor** | **1.26%** (~110 h/yr) |
| hours reaching the ceiling | **0.00%** |

The multiplier is a ~0.86 constant tax with ±0.4% of noise on it, and on ~110
hours a year it is *literally* constant — clamped to the floor, fully
insensitive to the sky. The "breathing" band is decorative.

### Second casualty: the daily practice budget

`celestial.ts` documented `BASE_DAILY_PRACTICE_BUDGET = 18` as breathing
"~15–24" with the sky. Measured under the old center, `dailyBudget =
18 × skyMultiplier` spanned only **15.3 – 15.7** — the documented upper bound
needed a multiplier of 1.33, which that configuration never produced. The
comment described an economy that did not exist. (Under the ruled constants it
spans 15.3 – 22.9, median ~18.0, and the comment has been corrected to the
measured range.)

### Reconciliation of the two position sources

**⚠️ This section's original conclusion was WRONG — kept as the record of how.**

It read: *"At 2026-08-15T12:00Z: oracle path A = 6.3353, debit path A = 6.3355
— a 2e-4 difference… the backend was unreachable during this run, so the debit
path fell back to the same local engine."*

Both paths agreed only because **jest blocks outbound network**, so the "debit
path" measurement was the local engine wearing the debit path's name — a
witness that could not have detected the very thing it was cited for. The
backend was live the whole time. The 2e-4 agreement was real and meaningless.

**Lesson for the next measurement:** when a path is *remote-first*, a
reconciliation run inside the test harness proves nothing about it. Capture
from the live service outside the harness, or assert that the remote was
actually reached. See §Blocker for what the live comparison found.

## The structural finding: price level and volatility are the same knob

The band is asymmetric about 1.0 — `−0.15` below, `+0.35` above. Under any
`(C, S)` the floor binds at `A = C − 0.15·S` and the ceiling at `A = C + 0.35·S`.

Because `m = 1.00` occurs exactly at `A = C`, **choosing a center IS choosing
the price level.** Centering on the real sky (`C = p50`) sets the median charged
multiplier to 1.000, up from today's 0.8584 — a **+16.5% rise in real charged
prices**, and an equal rise in practice rewards.

Price-neutrality and a breathing band are mutually exclusive under the current
band: today's median multiplier sits **0.0084 above the hard floor**, so holding
the median at 0.8584 while giving the multiplier real range forces **43.8% of
all hours onto the floor** (measured, at `C = 6.6992, S = 6.1`). There is no
room underneath.

Escaping that needs a *third* constant — either lowering
`GLOBAL_MULTIPLIER_MIN`, or rebasing the base ESMS costs by 0.8584 so
`base × 1.00` equals today's charge. Note the base costs are only partly
centralised: `OPERATION_COSTS` holds two operations; the purchase, shop,
recommendations, cosmic-recipe and Recipe-NFT paths carry their own.

## Candidates, each solved from the measured quantiles

None of these is hand-fitted; each is the closed-form solution of a stated rule.

| id | rule | center | spread | m p50 | m sd | band used | % floor | % ceil | median price Δ |
|---|---|---|---|---|---|---|---|---|---|
| current | — | 20 | 100 | 0.8584 | 0.0040 | 4.98% | 1.26% | 0% | — |
| **A** | p01→0.85, p99→1.35 exactly | 5.5981 | 4.5034 | 1.0527 | 0.0889 | 100% | 1.00% | 1.00% | **+22.6%** |
| **B** | median-centred, ≤1% floor | 5.8355 | 6.0860 | 1.0000 | 0.0665 | 84.3% | 1.00% | 0% | **+16.5%** |
| **C** | median-centred, ≤5% floor | 5.8355 | 3.5293 | 1.0000 | 0.1079 | 100% | 5.01% | 1.39% | **+16.5%** |
| **D** | median-centred, target m sd ≈ 0.05 | 5.8355 | 8.2260 | 1.0000 | 0.0499 | 70.2% | 0.29% | 0% | **+16.5%** |

Band-filling (A) buys its 100% band usage by putting the center below the
median, so 70% of hours price above 1.00. B is the conservative reading: the
sky's median is the calm sky, the floor clamps as rarely as the p01 rule allows,
and the ceiling is never touched — which is honest, since a 1.35 sky genuinely
does not occur.

**RULED: B, `A_NUMBER_CENTER = 5.84`, `A_NUMBER_SPREAD = 6.1`.** The +16.5%
median price rise was put to the owner explicitly and accepted — it is a
product decision, not a measurement consequence, and is recorded here as
`RULED` rather than laundered into the `MEASURED` basis. What is MEASURED is
the distribution and the solved parameters; what is RULED is that the economy
should charge 1.00× at the median sky.

Rounding `5.8355 → 5.84` and `6.086 → 6.1` was also ruled (legibility); it
costs 0.02pp of floor clamping (1.0046% → 1.016%).

## Blast radius

Twelve call sites across three subsystems, all reached from the one function.

**Debits (users pay more when the multiplier rises)**
- `src/app/api/economy/shop/route.ts`
- `src/app/api/economy/purchase/route.ts`
- `src/app/api/recommendations/generate/route.ts`
- `src/app/api/recipes/extract/route.ts`
- `src/app/api/recipes/refine/route.ts`
- `src/app/api/generate-cosmic-recipe/route.ts`
- `src/lib/recipe-nft/quote.ts`, `src/lib/recipe-nft/cost.ts`

**Credits (users earn more when the multiplier rises)**
- `src/services/practiceRewardService.ts`
- `src/app/api/economy/grimoire/route.ts` — and `dailyBudget`, which would move
  from ~15.5 to ~18.0

**Quotes**
- `src/app/api/economy/price-index/route.ts`, `src/components/economy/LivePriceTicker.tsx`

Debits and credits move *together and in the same direction*, so net token flow
partly self-cancels — but not per user: a spender-only account pays 16.5% more
with no offset, while a practice-heavy account is net better off. The
inflation/deflation balance shifts, and that shift is not measured here.

**Golden pins.** `priceIndex.test.ts` pins `multiplier 0.8635`,
`tokens[].index`, and `compositeIndex` — all four move under any new center.
They must be **re-derived by running the suite and reading the received
values**, never hand-edited. Note the fixture sky's `A = 6.3484` sits at the
**p88** of the real distribution: the pins are anchored on an atypically
high-A sky, which is fine as a fixture but should not be read as "typical".

**Not a defect, checked:** the live ephemeris hands the engine 12 bodies
(including `NorthNode`/`SouthNode`), but the nodes contribute exactly 0 to
ESMS — measured by differencing A with and without them. ADR-011's "ten ESMS
bodies" is accurate in effect.

**Minor:** `monica-degenerate` fires on 61 of 17,520 hours (0.35%), so the
ticker will honestly show a degraded badge roughly 3 hours a month.

## What landed

1. **The constants** — `A_NUMBER_CENTER 20 → 5.84`, `A_NUMBER_SPREAD 100 → 6.1`
   in `livePricing.ts`, each carrying its measured basis and the re-derivation
   command inline.
2. **The duplicate removed (behaviour-preserving).** `celestial.ts` carried its
   own inlined copy of the spread; it now imports `globalMultiplierForANumber`,
   so the reward side and the debit side cannot drift. Proven byte-identical
   over all 17,520 measured A-numbers plus the clamp edges *before* the
   constants moved — so the refactor and the re-pricing are independently
   verified, not entangled. This was done first deliberately: had it not been,
   the center change would have half-landed and rewards would have kept paying
   on a 20-centered sky while debits charged on a 5.84-centered one.
3. **The golden pins re-derived**, not hand-edited: run, read the received row,
   transcribe. `aNumber` (6.3484) and the weights did not move — they are
   engine facts. `multiplier 0.8635 → 1.0833`, indices
   `[0.8089, 0.8355, 0.9008, 0.9087] → [1.0149, 1.0483, 1.1302, 1.1401]`,
   `compositeIndex 0.8635 → 1.0834`. Scarcity polarity is preserved (Spirit
   abundant and cheapest, Substance scarcest and dearest).
4. **The derivation harness** — `aNumberDistribution.measure.test.ts`. Its
   control pins the *engine* fact only and checks the multiplier against
   `globalMultiplierForANumber`, never a literal: a derivation harness that
   fails whenever its own output is adopted is a trap, not a guard.
5. **The false budget comment corrected.** `BASE_DAILY_PRACTICE_BUDGET`'s
   documented "~15–24" was unreachable under the old center (real: 15.3–15.7).
   Measured under the new constants it is **15.3–22.9**, median ~18.0 — the
   documented range is now true.

**Verification.** Full suite 241/241 suites, 2,381 passed, 0 failures;
`tsc --noEmit` exit 0, zero errors; eslint clean on both changed modules.

## Open items

- ~~The remote-backend reconciliation is unproven against a live backend.~~
  Done — and it found the blocker above. The residual, once both paths price
  the same bodies, is **3e-4** mean absolute across 49 live samples.
- Net inflation/deflation: debits and credits both rise ~12%, so aggregate
  token flow partly self-cancels, but the per-cohort effect (spender-only vs
  practice-heavy accounts) is not measured here.
- The backend is sent **local wall-clock components**
  (`date.getFullYear()/getHours()`, not the UTC accessors) by
  `calculatePlanetaryPositionsBackend`. On Vercel the runtime is UTC so this is
  currently harmless, but it is a latent trap: the Ascendant moves ~1°/4min, so
  any non-UTC runtime would swing it wildly. Worth fixing on its own merits now
  that the Ascendant no longer reaches prices.
- `monica-degenerate` fires on 0.35% of hours; worth confirming the ticker's
  degraded badge reads sensibly when it does.

## Reproduction

```
MEASURE_A_NUMBER=1 bun run jest \
  src/lib/economy/__tests__/aNumberDistribution.measure.test.ts \
  --testPathIgnorePatterns='/node_modules/'
```

`--testPathIgnorePatterns` is needed only from a worktree under `.claude/`.
The control runs by default; the sweep is env-gated because it costs ~17s and
is a derivation, not a guard.
