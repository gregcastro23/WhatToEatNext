# ADR-016: Untethered self-normalised daily faucet

**Status:** Accepted  
**Date:** 2026-09-08  
**Protocol precedent:** ASOL ADR-015

## Decision

WTEN's per-site daily claim is a real function of the user's natal chart and the
current sky. Twelve ESMS is the centre of the function, not a conserved total.

For natal geometry `N` and the verified current sky `t`:

1. Sum all 10×10 natal-to-transit aspect contacts with a 6° linear-taper orb:
   conjunction `+1`, trine `+1`, sextile `+0.5`, square `-0.5`, opposition
   `-0.75`. Sign-only legacy natal points use elemental conductance without
   fabricating degrees.
2. Self-normalise the score against the chart's deterministic mean over the
   claim's **own calendar year**: `z = S(N,t) / S̄(N, year)`.
3. Set total yield to `clamp(12z, 3, 24)` ESMS per site.
4. Allocate that variable total using natal ESMS ratios × current-sky elemental
   ratios × live circulating-supply damping.
5. Reserve `0.3000` on every axis, quantise to four decimals, and put the
   rounding residual on the largest axis.

### Why the window is the claim's own year (divergence from ASOL ADR-015 §3)

ADR-015 §3 requires a single fixed window and forbids a rolling one. WTEN
deliberately diverges, because a fixed window does not survive its own epoch.

v1 of this engine pinned 2026, on the reasoning that 2026 is the epoch which
reproduces ADR-015's published emission-neutral table — a 2020–2031 baseline
instead put a 0° Aries stellium at ~6,697 ESMS rather than ~4,380. That
reasoning was circular: ADR-015's table was itself computed on a 2026-only
baseline, so matching it is not evidence of neutrality. Measured out of sample,
the pin fails (annual ESMS, target 4,380):

| chart | 2026 | 2027 | 2028 | 2029 | 2030 | 2031 |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| stellium 0° Aries | 4369 | 2118 | 1474 | 1373 | 1915 | 1413 |
| trine lattice | 4347 | 2070 | 1707 | 1543 | 2066 | 1519 |
| even 36° spread | 4407 | 3511 | 3732 | 4770 | 6690 | 7054 |
| realistic | 4380 | 3957 | 2748 | 2491 | 3182 | 2901 |
| **chart-shape spread** | 1.01x | 1.91x | 2.53x | 3.47x | 3.49x | **4.99x** |

A 5x shape spread is precisely the exploit ADR-015 exists to close. A chart's
resonance with the slow-planet background is strongly non-stationary, so a mean
taken in one year is the wrong divisor for another. ADR-015's literal 12-year
Jupiter window does not fix it either (±53% emission, 1.8–3.0x spread): one
Jupiter cycle still leaves Saturn and everything outward drifting.

Sampling the claim's own year holds both invariants — ±3% emission for three of
four archetypes in every year measured, shape spread ≤1.37x. The cost is that a
chart's baseline is no longer constant for life; it is re-derived each January.
That is not the griefing vector §3 warns about, because the window is a pure
deterministic function of the claim date rather than a trailing window an
attacker can shift.

Changing the epoch or algorithm remains an economic migration, not a refactor.

## Safety boundaries

- A current sky missing any canonical planet, valid sign, or reconstructable
  longitude throws `DegradedEphemerisError`; no fallback may choose mint size.
- Every distribution is checked against the `[3,24]` band, the four-decimal
  sum, finite-number requirements, and the per-axis floor immediately before
  ledger persistence and again at the HTTP response boundary.
- Daily claims do not use premium, holdings, or streak multipliers. Streak
  milestones remain separate, idempotent `streak_bonus` ledger grants.
- The chart baseline is cached with both the natal geometry hash and a baseline
  version. A mismatch recomputes rather than serving a stale value. The stored
  `baseline_version` carries the epoch year (`synastry-annual-v2:2027`), so a
  year rollover is an ordinary cache miss — no migration and no yearly
  operational ritual, which a hand-re-pinned epoch would have required.
- `calculateChartBaseline` takes its year explicitly. It sets a claim's
  magnitude, so it must not read the wall clock of whichever process calls it.

## Consequences

Daily totals now vary across the full 8× safety band while adversarial chart
shapes remain annual-emission neutral in every year measured (2026–2031), not
only in a calibration year. The first claim for a new chart — and the first
claim of each calendar year — computes its baseline; subsequent claims reuse
the database and in-process caches. The 365-sky sweep behind a baseline is
memoised per year per process, so a rollover costs one sweep rather than one
per claimer. The out-of-sample invariant is pinned by a test that sweeps
2027/2029/2031 and is red-proven against a frozen epoch. Both `main` and `agents` sites use the same engine and retain
their existing independent idempotency keys.
