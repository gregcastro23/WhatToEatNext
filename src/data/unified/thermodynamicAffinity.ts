/**
 * Thermodynamic state affinity — how close two alchemical states are.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `src/services/restaurantScoring.ts` used to rank cuisines by the distance
 * between two `monica` constants. That factor carried a 0.20 weight and
 * MEASURED ZERO discriminating signal, for a structural reason:
 *
 *   kalchm = (S^S · E^E) / (M^M · Sub^Sub)
 *   ln(kalchm) = f(S) + f(E) − f(M) − f(Sub),  where f(x) = x·ln(x), f(0) ≡ 0
 *
 * `f(x) = x ln x` is zero at BOTH x = 0 and x = 1, so every ESMS vector on the
 * binary lattice {0,1}⁴ gives `ln(kalchm) = 0` exactly. Cuisine ESMS came from a
 * single unweighted entry of `PLANETARY_SECTARIAN_ALCHEMICAL`, which is always a
 * one-hot unit vector — so `kalchm ≡ 1`, `|ln(kalchm)| < MONICA_LN_EPSILON`, and
 * `calculateMonica` returned `MONICA_EQUILIBRIUM` (φ) for EVERY cuisine.
 *
 * MEASURED: all 30 cuisine × sect combinations produced kalchm 1 and monica
 * 1.618 — 1 distinct value out of 30.
 *
 * Be precise about what that did and did not imply. The old factor was NOT a
 * fixed number: over the epoch below it took 275 distinct values spanning
 * 0.106 → 0.579, because `momentMonica` moves with the sky. What it never did was
 * distinguish CUISINES. MEASURED: at every one of the 1460 sampled moments the
 * factor's spread across all 15 cuisines was exactly `0.0000000000`. A ranking
 * signal has to vary across the things being ranked; this one varied only across
 * time, so its 0.20 weight shifted every restaurant's score together and ordered
 * nothing. It is not a bug in the physics; the physics is right. The scorer was
 * reading the one coordinate that collapses.
 *
 * Note the degeneracy is NOT about sparsity. `{0,1,1,0}`, `{1,1,1,1}` and
 * `{1,1,0,0}` all give kalchm 1 as well (MEASURED). Adding ruling planets as raw
 * unit vectors does not escape it; only NON-INTEGER ESMS does.
 *
 * ── What this replaces it with ──────────────────────────────────────────────
 *
 * Distance over the thermodynamic state itself, which does vary: across the same
 * 30 rows `gregsEnergy` takes 24 distinct values and reactivity spans 0.04 → 129.
 * The signal was always being computed; monica discarded it.
 *
 *   d(a, b) = sqrt( (1/3) · Σ_axis ( (asinh(a_axis) − asinh(b_axis)) / SD_axis )² )
 *   affinity = exp(−d / D0)  ∈ (0, 1]
 *
 * ── Three axes, not four ────────────────────────────────────────────────────
 *
 * `gregsEnergy` is EXCLUDED because it is not an independent coordinate:
 * `calculateThermodynamics` defines it as `heat − entropy · reactivity`.
 * MEASURED: `max |gregsEnergy − (heat − entropy·reactivity)| = 0` — exactly
 * zero — over the full 1490-row calibration population. Including it alongside
 * the three quantities it is built from silently double-weights that contrast,
 * the same defect class as the Earth double-count removed in §18k.
 *
 * It remains a first-class output of the engine and a fine display value; it is
 * only excluded from the DISTANCE.
 *
 * ── Why asinh ───────────────────────────────────────────────────────────────
 *
 * The axes span five orders of magnitude over the calibration population
 * (reactivity 4.0e-2 → 4.0e3; heat 2.8e-3 → 3.2; entropy 6.2e-3 → 13.9).
 * `asinh(x) = ln(x + sqrt(x² + 1))` is defined on all of ℝ including 0 and
 * negatives, is linear near the origin and logarithmic in the tails, and needs NO
 * epsilon floor — one less unfounded constant than a guarded `log(x + ε)`.
 *
 * ── Why equal weights ───────────────────────────────────────────────────────
 *
 * They are DERIVED, not chosen. After whitening, the first principal component of
 * the calibration population loads
 *   [0.5883, 0.5727, 0.5709]   vs exactly-equal 1/sqrt(3) = 0.5774
 * and explains 94.05% of variance. Equal weighting IS the dominant direction of
 * the data, to within 0.011 on every axis.
 *
 * That does NOT make the weighting irrelevant. Collapsing to a single axis
 * changes the ranking materially and can invert it — Spearman rho against the
 * three-axis ranking, over 40 real moments:
 *   entropy only       mean 0.873  min  0.686   <- strongest single axis
 *   heat only          mean 0.689  min  0.493
 *   gregsEnergy only   mean 0.371  min −0.300
 *   reactivity only    mean 0.191  min −0.557
 * Three axes are load-bearing; the exact weights among multi-axis schemes are
 * not (equal-3 vs equal-4: mean rho 0.972).
 *
 * ── Equal WEIGHTS is not equal INFLUENCE, and that is deliberate ────────────
 *
 * Whitening equalises how much each axis VARIES across states. It does not
 * equalise how much each axis contributes to the distances the scorer actually
 * computes. MEASURED share of the summed squared reachable distance:
 *   heat 26.3%   entropy 69.1%   reactivity 4.6%
 * Entropy dominates because cuisine and sky genuinely differ more on entropy,
 * relative to how much entropy varies at all, than they do on reactivity.
 *
 * That asymmetry was NOT normalised away, and the alternative was tested rather
 * than dismissed. Whitening by the RMS of the pairwise DIFFERENCES instead forces
 * the split to exactly 33.3/33.3/33.3 — but it does so by dividing out the very
 * contrast being measured, it disagrees with this metric's ranking at only
 * rho 0.864 (min 0.525), and under it PC1 becomes [0.6504, 0.6433, 0.4039], so
 * equal weighting would no longer be DERIVED from anything. Suppressing the axis
 * that discriminates in order to make a table look symmetric is the wrong trade.
 * The 26/69/5 split is pinned by the calibration test so it cannot drift unnoticed.
 *
 * `thermodynamicAffinityCalibration.test.ts` re-derives every constant below on
 * every run. If the cuisine table, the sectarian ESMS, the planet weights or the
 * engine change, the calibration moves and that test FAILS — which is the point.
 */

/** The three INDEPENDENT thermodynamic coordinates. See "Three axes" above. */
export const THERMO_AFFINITY_AXES = ["heat", "entropy", "reactivity"] as const;

export type ThermoAffinityAxis = (typeof THERMO_AFFINITY_AXES)[number];

/** The minimum shape this metric needs — any `ThermodynamicMetrics` satisfies it. */
export type ThermoState = Record<ThermoAffinityAxis, number>;

/**
 * The population the calibration below is measured over. Stated as data so the
 * test can rebuild it exactly rather than re-describing it in prose.
 *
 * Two parts, pooled:
 *   1. Every cuisine × sect in `CUISINE_ELEMENTAL_MAP` (30 states) — exhaustive.
 *      Since the measured-map + Strategy A PRs, a cuisine state is MEASURED
 *      corpus elementals + a mass-weighted multi-ruler ESMS (no longer a
 *      one-hot), so all 28 non-Default states are pairwise distinct.
 *   2. The real sky on a 6-hour grid across the epoch year (1460 states), via
 *      `getAccuratePlanetaryPositions` → `calculateAlchemicalFromPlanets` +
 *      `aggregateEnhancedZodiacElementals`, with sect from `isCurrentSkyDiurnal`
 *      and signs CAPITALIZED — exactly as
 *      `restaurantDiscoveryService.buildAstrologicalState` does it. Faithfulness
 *      matters here: `isCurrentSkyDiurnal` is a real solar-altitude test, not a
 *      06:00–18:00 UTC rule (the epoch splits 750 diurnal / 710 nocturnal), and a
 *      lowercase sign key falls through to a flat 0.25/0.25/0.25/0.25 elemental
 *      fallback that would have calibrated the scales against nothing.
 *
 * `THERMO_AFFINITY_SD` is measured over all 1490 rows AS SAMPLED — which is
 * DWELL-TIME WEIGHTED, not one-row-per-distinct-state. MEASURED: those 1490 rows
 * hold 1486 distinct states (Default is sect-invariant — its single Sun anchor
 * has no day/night flip — and the sky contributes a few coincidences), so
 * repeated states still count in their observed proportions.
 * That is deliberate: the scale exists to normalise states the scorer actually
 * meets at runtime, and an even grid over the year is the closest thing to a
 * traffic model this repo has. Deduplicating would upweight rare configurations
 * for no stated reason. `THERMO_AFFINITY_D0` is measured over PRODUCTION-FAITHFUL PAIRS
 * instead: a cuisine is always scored at the moment's own sect, so
 * diurnal-cuisine × nocturnal-moment pairs are unreachable and excluded
 * (15 × 1460 = 21900 pairs).
 *
 * The epoch is NAMED and FIXED rather than "the current year" so the constants
 * are reproducible forever. The sky's spread does drift: re-deriving over 2040
 * (MEASURED under the original #681 population) moved SD.reactivity ~32%
 * narrower while the PC1 loadings stayed put — so the loadings are pinned
 * tightly and the scales are pinned to this epoch.
 */
export const THERMO_AFFINITY_EPOCH = {
  /** UTC midnight of the first sample. */
  startUtc: "2026-01-01T00:00:00.000Z",
  /** Number of samples: 365 days × 4 per day. */
  samples: 1460,
  /** Hours between samples. */
  stepHours: 6,
} as const;

/**
 * Per-axis standard deviation in asinh space, over the pooled calibration
 * population. BASIS: MEASURED — re-derived by
 * `thermodynamicAffinityCalibration.test.ts` on every run.
 *
 * Whitening is not cosmetic. Unwhitened, reactivity's asinh spread (2.333) would
 * outweigh heat's (0.333) by 7:1 on scale alone — an unexamined emphasis of
 * exactly the kind the old `Math.abs(a - b) / 2` divisor smuggled in.
 */
export const THERMO_AFFINITY_SD: Readonly<ThermoState> = {
  heat: 0.3328000991150603,
  entropy: 0.37031863162603695,
  reactivity: 2.3331310334971707,
};

/**
 * The decay scale, in whitened-distance units. BASIS: MEASURED — the MEDIAN of
 * all 21900 REACHABLE cuisine↔moment distances (see the epoch note above). Not
 * chosen; re-derived by the calibration test.
 *
 * Distance quantiles for reference: p10 0.265, p25 0.380, MEDIAN 1.100,
 * p75 1.766, p90 2.772, max 4.873.
 *
 * The whole distribution CONTRACTED — not just the tail — when the derivation
 * was finally pointed at the mass-weighted cuisine ESMS production actually
 * uses (#706). Weighted multi-ruler sums sit much closer to real skies than
 * one-hot unit vectors, so the MEDIAN fell 1.904 → 1.100 (−42%) and the max
 * fell 5.053 → 4.873.
 *
 * Note this contraction was ASSERTED here before it was ever MEASURED: the
 * previous version of this comment already credited Strategy A with pulling the
 * tail in, while the derivation was still building one-hot states. The effect
 * was real and the direction was right; the magnitude was understated because
 * nothing had measured it. That gap is the defect #706 closed.
 *
 * D0 depends on `THERMO_AFFINITY_SD`, so the two must be re-derived together —
 * the calibration test fails on both if either is edited alone.
 */
export const THERMO_AFFINITY_D0 = 1.0997692434132713;

/**
 * Whitened, asinh-space Euclidean distance between two thermodynamic states.
 * Zero when identical; unbounded above. Symmetric.
 *
 * THROWS on a non-finite axis rather than substituting one. Both arguments come
 * from `calculateThermodynamics`, which already refuses malformed input — so a
 * non-finite value here means an upstream invariant broke, and inventing a
 * distance would hide it. §18k k7.
 */
export function thermoStateDistance(a: ThermoState, b: ThermoState): number {
  let sumSq = 0;
  for (const axis of THERMO_AFFINITY_AXES) {
    const av = a[axis];
    const bv = b[axis];
    if (!Number.isFinite(av) || !Number.isFinite(bv)) {
      throw new TypeError(
        `thermoStateDistance: axis "${axis}" is not finite (a=${String(av)}, b=${String(bv)}). ` +
          "Both states must come from calculateThermodynamics.",
      );
    }
    const delta = (Math.asinh(av) - Math.asinh(bv)) / THERMO_AFFINITY_SD[axis];
    sumSq += delta * delta;
  }
  return Math.sqrt(sumSq / THERMO_AFFINITY_AXES.length);
}

/**
 * Map two thermodynamic states to a compatibility score in (0, 1].
 * 1.0 when identical, decaying with distance. ABSOLUTE, not set-relative: the
 * same cuisine at the same moment scores the same regardless of what else is in
 * the result set, so scores are comparable across searches and cacheable.
 *
 * ⚠️ (0, 1] is the range of THIS FUNCTION, not of the serialised
 * `AlchmScoredRestaurant.thermodynamicAffinity` field. A restaurant that never
 * got scored — no cosmic state, or `scoreCuisineAgainstMoment` threw — is
 * annotated with a literal 0 by `restaurantDiscoveryService`, alongside
 * `alchmScore: 0`. Readers must treat 0 as "unscored", not as "maximally
 * distant"; `alchmScore > 0` is the existing liveness check the UI already uses.
 *
 * Note also that the throw below does NOT surface as a 500. Its only production
 * caller wraps `scoreCuisineAgainstMoment` in a bare `catch {}` and falls through
 * to the unscored annotation, so a malformed state costs one restaurant its
 * score rather than failing the whole search. That predates this metric and is
 * left as-is deliberately: failing an entire discovery request because one
 * restaurant has a bad cuisine mapping would be a worse trade.
 *
 * Exponential decay was picked over the rational alternative `1/(1 + d/D0)` by
 * MEASUREMENT, not taste: mean within-moment spread across the 15 cuisines is
 * 0.609 for `exp(−d/D0)` vs 0.458 for `1/(1 + d/D0)` (40 real moments), and the
 * worst moment still spreads 0.259. Both beat the 0.000 the monica factor
 * delivered. The calibration test re-checks that ordering so it cannot silently
 * invert.
 */
export function thermoAffinity(a: ThermoState, b: ThermoState): number {
  return Math.exp(-thermoStateDistance(a, b) / THERMO_AFFINITY_D0);
}
