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
   fixed 2026 calibration epoch: `z = S(N,t) / S̄(N)`.
3. Set total yield to `clamp(12z, 3, 24)` ESMS per site.
4. Allocate that variable total using natal ESMS ratios × current-sky elemental
   ratios × live circulating-supply damping.
5. Reserve `0.3000` on every axis, quantise to four decimals, and put the
   rounding residual on the largest axis.

The 2026 baseline epoch is explicit and versioned. It is the epoch that
reproduces the ASOL ADR's published emission-neutral calibration. A proposed
2020–2031 baseline did not: the slow-planet bias raised a 0° Aries stellium's
measured 2026 emission to about 6,697 ESMS instead of roughly 4,380. Changing
the epoch or algorithm is therefore an economic migration, not a refactor.

## Safety boundaries

- A current sky missing any canonical planet, valid sign, or reconstructable
  longitude throws `DegradedEphemerisError`; no fallback may choose mint size.
- Every distribution is checked against the `[3,24]` band, the four-decimal
  sum, finite-number requirements, and the per-axis floor immediately before
  ledger persistence and again at the HTTP response boundary.
- Daily claims do not use premium, holdings, or streak multipliers. Streak
  milestones remain separate, idempotent `streak_bonus` ledger grants.
- The chart baseline is cached with both the natal geometry hash and a baseline
  version. A mismatch recomputes rather than serving a stale value.

## Consequences

Daily totals now vary across the full 8× safety band while adversarial chart
shapes remain annual-emission neutral in the calibration year. The first claim
for a new chart computes its baseline; subsequent claims reuse the database and
in-process caches. Both `main` and `agents` sites use the same engine and retain
their existing independent idempotency keys.
