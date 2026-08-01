# ADR-010: Environmental thermodynamics — the Dual-Baseline engine

**Status:** Accepted, partially implemented (step 1 of 5)
**Date:** 2026-08-01
**Implemented by:** #680 (ingestion). Steps 2–5 outstanding.

## Context

Cooking recommendations should respond to where and when a user is cooking:
atmospheric pressure sets the boiling point, and humidity governs evaporation.
The naive design feeds "live weather" into the recommendation pipeline.

That design is wrong in a way that is easy to miss. **Elevation dominates
weather by roughly an order of magnitude:**

| Condition | Absolute pressure | Boiling point | Δ vs sea level |
|---|---|---|---|
| Sea level, standard | 101.3 kPa | 100.0 °C | — |
| Hurricane eyewall (950 hPa) | 95.0 kPa | 98.2 °C | −1.8 |
| Denver, 1609 m | 83.4 kPa | 94.6 °C | **−5.4** |
| La Paz, 3640 m | 64.0 kPa | 87.0 °C | −13.0 |

The most violent weather on Earth is worth one third of Denver. A single "live
pressure" input conflates a permanent geographic fact with a transient one, and
the transient one is nearly always the smaller term.

### The failure mode this subsystem exists to avoid

Consumer weather APIs return **sea-level-adjusted pressure (MSLP/QNH)** by
default — the station reading extrapolated down to sea level using an ISA lapse
rate. `[MEASURED 2026-07-30]` Open-Meteo, Denver (39.7392, −104.9903, 1599 m),
same timestamp:

```
surface_pressure   840.4 hPa  →  boiling 94.9 °C
pressure_msl      1006.0 hPa  →  boiling 99.8 °C
```

**A 4.9 °C error from reading the adjacent field** — plausible-looking, and wrong
everywhere except the coast.

## Decision

**Two baselines, not one.**

1. **Climatic baseline** — elevation-derived pressure via the ISA barometric
   formula, plus a trailing 30-day robust location/dispersion per geohash. This
   is the permanent trunk.
2. **Daily anomaly** — today's live reading minus that baseline, expressed in
   **both** physical units and **z-scores** against the location's own
   dispersion. A −1.8 kPa swing is routine on the Gulf coast and a 3σ event in
   Denver; neither number substitutes for the other.

**Supporting decisions:**

- **`assertStationPressure` guards the MSLP trap at the ingestion boundary**, and
  throws rather than clamping — a wrong-field reading would poison every baseline
  computed from it. The check is **discriminative** ("is this closer to sea level
  than to where elevation says it should be?"), not a tolerance band: a band wide
  enough to admit a real hurricane is too wide to catch MSLP. Below ~600 m it
  declines to judge, because the two hypotheses are genuinely indistinguishable
  there — and that is also where the trap causes least harm.
- **Robust statistics (median + MAD×1.4826), not mean/σ.** The events worth
  flagging *are* the outliers, and a classical σ lets a storm inflate the very
  denominator that would have detected it.
- **Geohash p5 (~5 km) keys weather; elevation is resolved separately at full DEM
  fidelity.** Finer than p5 is false precision against an ~11 km model grid, but
  a p5 cell in rugged terrain spans more than a degree of boiling point.
- **One sample per geohash per day at its own derived UTC hour.** Fixing the hour
  keeps the semidiurnal atmospheric tide (~1–2 hPa, a real periodic signal) out
  of the window's dispersion, and spreads the fleet across the day.
- **Dew point, not relative humidity, is the transported variable.** RH is a ratio
  against a temperature-dependent saturation pressure, so 80% RH at 10 °C outdoors
  is *drier air* than 40% RH at 22 °C indoors. Dew point survives the trip
  indoors; RH is recomputed at the indoor temperature when needed.
- **Advisories fire on a dual gate:** `|z| ≥ minimumZ` **AND**
  `effect ≥ minimumEffect`. Z alone fires on rare-but-physically-trivial days;
  effect alone ignores that "unusual here" is what makes a daily tip worth
  reading. Channels driven by the **elevation baseline rather than the anomaly**
  carry `minimumZ: 0` — geography is not an anomaly and should not be statistically
  gated.
- **90 days raw retained against a 30-day window**, so the statistic stays
  recomputable and auditable. Robust statistics cannot be updated incrementally
  the way a mean can.
- **Archive-seeded on first sight** (ERA5, ~6-day lag), so a new location has
  valid anomalies on day one rather than after a month of accumulation.

## Consequences

**⚠️ The subsystem is currently inert.** `database/init/74-environmental-observations.sql`
has not been applied to any database — the CI gate
(`scripts/checkEnvironmentalSqlParses.ts`) only ever creates it inside a
rolled-back transaction. With `environmental_baselines` empty, the hourly cron
has nothing to sample. To bring it alive: apply migration 74, then
`POST /api/admin/environment/seed`.

**The response profiles are inert types.** `src/types/environmentalResponseSchema.ts`
and `src/constants/environmentalResponseProfiles.ts` ship for step 5; only 5 of
31 methods have profiles, chosen because each breaks a naive design — `roasting`
(surface and interior respond to humidity in *opposite* directions), `pressure_cooking`
(gauge pressure composes with ambient rather than cancelling it), `baking` (two
humidity clocks), `dehydrating` (humidity first-order), `frying` (a negative
control that should never fire a daily advisory).

**`ambientCoupling` is the one unsourced axis.** How much of the outdoor anomaly
reaches the cooking environment. The closed-oven value (0.03) is bounded by a
mass balance — a 50 L cavity holds ~0.87 g of ambient water against 200–400 g
released by a 2 kg roast — and open-air is 1.0 by definition. The middle values
are reasoned, not measured, and are marked `tunable: true`.

**Magnitudes are smaller than intuition suggests, and the schema enforces that.**
Boyle's law gives a 1.8 kPa anomaly ~1.8% extra dough expansion, not the ~15%
that "check your proofing 15 minutes early" would imply. Flour sorption justifies
holding back ~2.6% of formula water for a +4 °C dew-point anomaly at full
equilibration, not 10%. The `minimumEffect` floors exist to keep the engine
silent rather than confidently wrong; `dehydrating` is where the daily anomaly
regularly clears threshold.

**Remaining steps:** (2) *done* — see ADR-009; (3) promote
`METHOD_PHYSICAL_REFERENCE` to SI-typed canonical with a full Antoine/ISA solver;
(4) derive the P=IV circuit model from ESMS + pillar effects; (5) calc engine,
public API, and the remaining 26 response profiles.
