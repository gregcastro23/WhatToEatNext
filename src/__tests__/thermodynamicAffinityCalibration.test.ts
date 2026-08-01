/**
 * The thermodynamic-affinity calibration is MEASURED, and this is where it is
 * re-measured.
 *
 * `THERMO_AFFINITY_SD` and `THERMO_AFFINITY_D0` are stored as literals in
 * `@/data/unified/thermodynamicAffinity` because deriving them there would need
 * `CUISINE_ELEMENTAL_MAP` (a service) and `getAccuratePlanetaryPositions` — a
 * layering inversion and an import cycle. So the derivation lives here and runs
 * on every test run. If the cuisine table, the sectarian ESMS, the planet
 * weights, the sect rule, or the engine change, the calibration moves and THIS
 * FAILS — which is the point. Without it the constants would be comments
 * asserting a measurement nobody re-checks.
 *
 * ── The population, stated exactly ──────────────────────────────────────────
 *
 * Built the way `restaurantDiscoveryService.buildAstrologicalState` builds a
 * moment, so the calibration reflects production and not a convenient
 * approximation of it:
 *   - sect from `isCurrentSkyDiurnal` (real solar altitude at the New York
 *     observer), NOT a 06:00–18:00 UTC rule;
 *   - zodiac signs CAPITALIZED before aggregation, because `ZODIAC_ELEMENTS` is
 *     capitalized and a lowercase key silently falls through to the flat
 *     0.25/0.25/0.25/0.25 fallback.
 *
 * SCALES (`THERMO_AFFINITY_SD`) are measured over all 1490 SAMPLED rows: the 30
 * cuisine × sect states (exhaustive) pooled with 1460 sky samples. Those 1490
 * rows hold 1484 DISTINCT states, so the scale is still dwell-time weighted by
 * the grid — deliberately. The scorer always runs at "now", and "now" is uniform
 * in time, so a time-uniform grid is the production-faithful measure.
 *
 * D0 is measured over PRODUCTION-FAITHFUL PAIRS: a cuisine is always scored at
 * the moment's own sect, so diurnal-cuisine × nocturnal-moment pairs are
 * unreachable and are excluded. 15 cuisines × 1460 moments = 21900 pairs.
 */
import {
  calculateThermodynamics,
  calculateKalchm,
  calculateMonica,
  MONICA_EQUILIBRIUM,
} from "@/data/unified/alchemicalCalculations";
import {
  THERMO_AFFINITY_AXES,
  THERMO_AFFINITY_D0,
  THERMO_AFFINITY_EPOCH,
  THERMO_AFFINITY_SD,
  thermoAffinity,
  thermoStateDistance,
  type ThermoState,
} from "@/data/unified/thermodynamicAffinity";
import { CUISINE_ELEMENTAL_MAP } from "@/services/restaurantScoring";
import {
  getAccuratePlanetaryPositions,
  isCurrentSkyDiurnal,
} from "@/utils/astrology/positions";
import {
  PLANETARY_SECTARIAN_ALCHEMICAL,
  aggregateEnhancedZodiacElementals,
  calculateAlchemicalFromPlanets,
} from "@/utils/planetaryAlchemyMapping";

type Full = ThermoState & { gregsEnergy: number };

// ─── Population construction ────────────────────────────────────────────────

/** Exactly `buildAstrologicalState`'s capitalization. */
function capitalizeSign(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** One cuisine's thermodynamic state at a given sect. */
function cuisineState(
  cuisine: keyof typeof CUISINE_ELEMENTAL_MAP,
  diurnal: boolean,
): Full {
  const profile = CUISINE_ELEMENTAL_MAP[cuisine];
  const entry =
    PLANETARY_SECTARIAN_ALCHEMICAL[
      profile.planetaryRuler as keyof typeof PLANETARY_SECTARIAN_ALCHEMICAL
    ];
  const sect = diurnal ? entry.diurnal : entry.nocturnal;
  return calculateThermodynamics(
    {
      Spirit: sect.Spirit,
      Essence: sect.Essence,
      Matter: sect.Matter,
      Substance: sect.Substance,
    },
    {
      Fire: profile.Fire,
      Water: profile.Water,
      Earth: profile.Earth,
      Air: profile.Air,
    },
  ) as Full;
}

/** The sky on the epoch grid, exactly as the discovery service reads it. */
function buildMomentPopulation(): Array<{ state: Full; diurnal: boolean }> {
  const start = Date.parse(THERMO_AFFINITY_EPOCH.startUtc);
  const stepMs = THERMO_AFFINITY_EPOCH.stepHours * 3600 * 1000;
  const out: Array<{ state: Full; diurnal: boolean }> = [];

  for (let i = 0; i < THERMO_AFFINITY_EPOCH.samples; i++) {
    const when = new Date(start + i * stepMs);
    const positions = getAccuratePlanetaryPositions(when);
    const signs: Record<string, string> = {};
    for (const [planet, data] of Object.entries(positions)) {
      const sign = (data as { sign?: unknown }).sign;
      if (typeof sign === "string" && sign.length > 0) {
        signs[planet] = capitalizeSign(sign);
      }
    }
    const diurnal = isCurrentSkyDiurnal(when);
    out.push({
      state: calculateThermodynamics(
        calculateAlchemicalFromPlanets(positions, diurnal),
        aggregateEnhancedZodiacElementals(signs, diurnal),
      ) as Full,
      diurnal,
    });
  }
  return out;
}

const CUISINES = Object.keys(CUISINE_ELEMENTAL_MAP) as Array<
  keyof typeof CUISINE_ELEMENTAL_MAP
>;

const moments = buildMomentPopulation();
/** Every distinct reachable cuisine state: 15 cuisines × 2 sects. */
const cuisineStates = CUISINES.flatMap((c) => [
  cuisineState(c, true),
  cuisineState(c, false),
]);
/** Each distinct reachable state, counted once. */
const pooled: Full[] = [...cuisineStates, ...moments.map((m) => m.state)];

const asinhRow = (s: ThermoState) => THERMO_AFFINITY_AXES.map((a) => Math.asinh(s[a]));

function derivedSd(): number[] {
  const rows = pooled.map(asinhRow);
  return THERMO_AFFINITY_AXES.map((_, j) => {
    const mean = rows.reduce((acc, r) => acc + r[j], 0) / rows.length;
    const varr = rows.reduce((acc, r) => acc + (r[j] - mean) ** 2, 0) / rows.length;
    return Math.sqrt(varr);
  });
}

/** Every distance the scorer can actually produce: cuisine at the moment's sect. */
function reachableDistances(): number[] {
  const out: number[] = [];
  for (const m of moments) {
    for (const c of CUISINES) {
      out.push(thermoStateDistance(cuisineState(c, m.diurnal), m.state));
    }
  }
  return out.sort((a, b) => a - b);
}

/** Leading eigenvector of the correlation matrix, by power iteration. */
function pc1(rows: number[][]): { loadings: number[]; explained: number } {
  const k = rows[0].length;
  const mean = Array.from({ length: k }, (_, j) => rows.reduce((a, r) => a + r[j], 0) / rows.length);
  const sd = Array.from({ length: k }, (_, j) =>
    Math.sqrt(rows.reduce((a, r) => a + (r[j] - mean[j]) ** 2, 0) / rows.length),
  );
  const z = rows.map((r) => r.map((x, j) => (x - mean[j]) / sd[j]));
  const cov = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => z.reduce((a, r) => a + r[i] * r[j], 0) / z.length),
  );
  let v = Array<number>(k).fill(1);
  for (let it = 0; it < 1000; it++) {
    const next = cov.map((row) => row.reduce((a, c, j) => a + c * v[j], 0));
    const norm = Math.hypot(...next);
    v = next.map((x) => x / norm);
  }
  const lambda = v.reduce((a, x, i) => a + x * cov[i].reduce((t, c, j) => t + c * v[j], 0), 0);
  return { loadings: v.map(Math.abs), explained: lambda / k };
}

// ─── The calibration ────────────────────────────────────────────────────────

describe("thermodynamic affinity calibration", () => {
  it("re-derives the population the constants are measured over", () => {
    expect(cuisineStates).toHaveLength(30);
    expect(moments).toHaveLength(THERMO_AFFINITY_EPOCH.samples);
    expect(pooled).toHaveLength(1490);
    // POSITIVE CONTROL on the sky sampler. If the elementals ever come back flat,
    // the sign keys stopped resolving and every scale below is measuring the
    // fallback rather than the sky — which is exactly how a lowercase-sign bug
    // hid itself during derivation.
    const distinctReactivity = new Set(moments.map((m) => m.state.reactivity.toFixed(10)));
    expect(distinctReactivity.size).toBeGreaterThan(100);
    // Both sects must be represented, or the D0 pairing is only half measured.
    expect(moments.filter((m) => m.diurnal).length).toBe(750);
    expect(moments.filter((m) => !m.diurnal).length).toBe(710);
  });

  // Tolerance note: `toBeCloseTo(x, n)` is an ABSOLUTE bound of 0.5e-n. Pinning at
  // n=12 would be ~2e-13 relative on SD.reactivity ≈ 2.33 — tighter than this
  // population is actually stable. `Math.asinh`/`Math.log` are implementation-
  // defined in ECMAScript, so a V8 update can move a summand by an ULP, and
  // MEASURED: epoch sample 520 sits 2.474 SECONDS from a sect flip, so a change to
  // astronomy-engine could flip one of 1460 rows outright. n=6 still catches any
  // real recalibration by four orders of magnitude — a genuine change to the
  // cuisine table, the sect rule or the engine moves these by ≥1e-2 (deduplicating
  // the pool, the nearest plausible mistake, moves SD.entropy by 13%).
  const CALIBRATION_PRECISION = 6;

  // ── RECALIBRATION_PENDING ──────────────────────────────────────────────────
  // Set to true ONLY in a PR that changes the cuisine population these
  // constants are measured over (map rows, cuisine ESMS derivation, sect
  // rule, engine), when a ruling batches the recalibration into a later PR.
  // While true, the four value pins below are suspended; structural
  // invariants stay live. The recalibration PR re-derives the constants,
  // re-pins them, and flips this back to false — as this one does (the
  // 2026-08-01 measured-map + Strategy A batch, recalibrated here).
  const RECALIBRATION_PENDING = false;
  const itPinnedConstant = RECALIBRATION_PENDING ? it.skip : it;

  itPinnedConstant("re-derives THERMO_AFFINITY_SD", () => {
    const sd = derivedSd();
    THERMO_AFFINITY_AXES.forEach((axis, j) => {
      expect(sd[j]).toBeCloseTo(THERMO_AFFINITY_SD[axis], CALIBRATION_PRECISION);
    });
  });

  itPinnedConstant("re-derives THERMO_AFFINITY_D0 as the median reachable distance", () => {
    const d = reachableDistances();
    expect(d).toHaveLength(CUISINES.length * moments.length);
    expect(d[Math.floor(0.5 * (d.length - 1))]).toBeCloseTo(
      THERMO_AFFINITY_D0,
      CALIBRATION_PRECISION,
    );
  });

  it("reports how close the epoch grid sits to a sect flip", () => {
    // Diagnostic, not decoration. The sect boolean is the one DISCRETE input to
    // the population, so a sample near a flip is the only way a tiny upstream
    // change can move the constants discontinuously. If astronomy-engine ever
    // shifts enough to flip sample 520, THIS test names the cause instead of
    // leaving an opaque constant mismatch.
    const start = Date.parse(THERMO_AFFINITY_EPOCH.startUtc);
    const stepMs = THERMO_AFFINITY_EPOCH.stepHours * 3600 * 1000;
    let closestMs = Infinity;
    for (let i = 0; i < THERMO_AFFINITY_EPOCH.samples; i++) {
      const t = start + i * stepMs;
      const sect = isCurrentSkyDiurnal(new Date(t));
      for (const dir of [-1, 1]) {
        if (isCurrentSkyDiurnal(new Date(t + dir * stepMs)) === sect) continue;
        let lo = 0;
        let hi = stepMs;
        for (let k = 0; k < 45; k++) {
          const mid = (lo + hi) / 2;
          if (isCurrentSkyDiurnal(new Date(t + dir * mid)) === sect) lo = mid;
          else hi = mid;
        }
        closestMs = Math.min(closestMs, lo);
      }
    }
    // MEASURED 2.474 s. Pinned loosely: the point is to notice a flip, not the
    // exact margin. A flip would drive this to ~0 from the other side.
    expect(closestMs).toBeGreaterThan(0.5 * 1000);
    expect(closestMs).toBeLessThan(60 * 1000);
  });

  itPinnedConstant("pins how much each axis actually contributes to the reachable distance", () => {
    // Equal WEIGHTS after whitening is not equal INFLUENCE. Entropy dominates
    // because cuisine and sky genuinely differ most there. That is a deliberate
    // property (see the module's "Equal WEIGHTS is not equal INFLUENCE" note), so
    // it is pinned rather than left to drift silently.
    const share = THERMO_AFFINITY_AXES.map(() => 0);
    let total = 0;
    for (const m of moments) {
      for (const c of CUISINES) {
        const cuisine = cuisineState(c, m.diurnal);
        THERMO_AFFINITY_AXES.forEach((axis, j) => {
          const term =
            ((Math.asinh(cuisine[axis]) - Math.asinh(m.state[axis])) /
              THERMO_AFFINITY_SD[axis]) ** 2;
          share[j] += term;
          total += term;
        });
      }
    }
    const pct = share.map((s) => (100 * s) / total);
    expect(pct[0]).toBeCloseTo(32.9, 1); // heat
    expect(pct[1]).toBeCloseTo(62.1, 1); // entropy
    expect(pct[2]).toBeCloseTo(5.0, 1); // reactivity
  });

  itPinnedConstant("confirms equal weighting IS the first principal component", () => {
    const { loadings, explained } = pc1(pooled.map(asinhRow));
    const equal = 1 / Math.sqrt(THERMO_AFFINITY_AXES.length);
    // Equal weights are DERIVED, not chosen: PC1 loads within 0.02 of 1/sqrt(3)
    // on every axis. If this drifts, the equal-weight justification is gone and
    // the metric needs re-arguing, not silently re-tuning.
    loadings.forEach((l) => expect(Math.abs(l - equal)).toBeLessThan(0.02));
    expect(explained).toBeGreaterThan(0.9);
  });

  it("keeps gregsEnergy OUT of the distance, because it is not independent", () => {
    // The justification for three axes rather than four. Exact, not approximate.
    const maxResidual = Math.max(
      ...pooled.map((s) => Math.abs(s.gregsEnergy - (s.heat - s.entropy * s.reactivity))),
    );
    expect(maxResidual).toBe(0);
  });

  it("prefers exponential decay over rational decay, by measurement", () => {
    const spread = (decay: (d: number) => number) => {
      const widths = moments
        .filter((_, i) => i % 37 === 0)
        .map((m) => {
          const scores = CUISINES.map((c) =>
            decay(thermoStateDistance(cuisineState(c, m.diurnal), m.state)),
          );
          return Math.max(...scores) - Math.min(...scores);
        });
      return widths.reduce((a, x) => a + x, 0) / widths.length;
    };
    const exponential = spread((d) => Math.exp(-d / THERMO_AFFINITY_D0));
    const rational = spread((d) => 1 / (1 + d / THERMO_AFFINITY_D0));
    expect(exponential).toBeGreaterThan(rational);
  });
});

// ─── What the calibration is FOR ────────────────────────────────────────────

describe("thermodynamic affinity restores discriminant signal", () => {
  it("separates cuisines at every sampled moment", () => {
    // The defect this replaces: the monica factor produced ONE value for all 15
    // cuisines, so its 0.20 weight was a constant offset. Any spread beats that,
    // but pin a real floor so a future change cannot quietly re-flatten it.
    const widths = moments
      .filter((_, i) => i % 37 === 0)
      .map((m) => {
        const scores = CUISINES.map((c) =>
          thermoAffinity(cuisineState(c, m.diurnal), m.state),
        );
        return Math.max(...scores) - Math.min(...scores);
      });
    expect(Math.min(...widths)).toBeGreaterThan(0.1);
  });

  it("pins the degeneracy that motivated this, so we notice when it is fixed", () => {
    // Cuisine monica is φ for every cuisine and sect — the reason the old factor
    // carried no signal. When cuisine ESMS is finally derived the way the
    // moment's is, this FAILS, and that is the signal to revisit monica's role.
    const monicas = new Set<number>();
    for (const c of CUISINES) {
      for (const diurnal of [true, false]) {
        const profile = CUISINE_ELEMENTAL_MAP[c];
        const entry =
          PLANETARY_SECTARIAN_ALCHEMICAL[
            profile.planetaryRuler as keyof typeof PLANETARY_SECTARIAN_ALCHEMICAL
          ];
        const sect = diurnal ? entry.diurnal : entry.nocturnal;
        const esms = {
          Spirit: sect.Spirit,
          Essence: sect.Essence,
          Matter: sect.Matter,
          Substance: sect.Substance,
        };
        const t = cuisineState(c, diurnal);
        monicas.add(calculateMonica(t.gregsEnergy, t.reactivity, calculateKalchm(esms)));
      }
    }
    expect(monicas.size).toBe(1);
    expect([...monicas][0]).toBe(MONICA_EQUILIBRIUM);
  });

  it("is degenerate on the whole binary lattice, not merely on sparse vectors", () => {
    // Why 'give cuisines more ruling planets' is NOT a fix on its own: f(x)=x·ln x
    // is zero at both 0 and 1, so any {0,1} vector lands on kalchm 1.
    for (const v of [
      { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
      { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
      { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
      { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 },
      { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
    ]) {
      expect(calculateKalchm(v)).toBe(1);
    }
    // POSITIVE CONTROL: it moves the moment values leave the lattice.
    expect(calculateKalchm({ Spirit: 0.5, Essence: 0, Matter: 0, Substance: 0 })).toBeCloseTo(
      0.7071067811865476,
      12,
    );
  });
});

// ─── Metric behaviour ───────────────────────────────────────────────────────

describe("thermoStateDistance / thermoAffinity", () => {
  const a: ThermoState = { heat: 1.5, entropy: 3, reactivity: 7 };
  const b: ThermoState = { heat: 0.02, entropy: 0.4, reactivity: 120 };

  it("is zero for identical states and gives affinity exactly 1", () => {
    expect(thermoStateDistance(a, a)).toBe(0);
    expect(thermoAffinity(a, a)).toBe(1);
  });

  it("is symmetric", () => {
    expect(thermoStateDistance(a, b)).toBe(thermoStateDistance(b, a));
  });

  it("keeps affinity inside (0, 1]", () => {
    const far: ThermoState = { heat: 0, entropy: 0, reactivity: 1e12 };
    const v = thermoAffinity(a, far);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
  });

  it("ignores gregsEnergy even when it is supplied", () => {
    const withG = { ...a, gregsEnergy: -999 } as ThermoState;
    expect(thermoStateDistance(withG, b)).toBe(thermoStateDistance(a, b));
  });

  it("THROWS on a non-finite axis rather than inventing a distance", () => {
    for (const bad of [NaN, Infinity, -Infinity, undefined as unknown as number]) {
      expect(() => thermoStateDistance({ ...a, reactivity: bad }, b)).toThrow(
        /axis "reactivity" is not finite/,
      );
      expect(() => thermoStateDistance(a, { ...b, heat: bad })).toThrow(
        /axis "heat" is not finite/,
      );
    }
  });

  it("does not let one axis dominate on raw scale alone", () => {
    // Whitening check: a 1-SD move on heat and a 1-SD move on reactivity must
    // contribute equally. Without it, reactivity would outweigh heat ~8:1.
    const base: ThermoState = { heat: 1, entropy: 1, reactivity: 1 };
    const heatMoved: ThermoState = {
      ...base,
      heat: Math.sinh(Math.asinh(1) + THERMO_AFFINITY_SD.heat),
    };
    const reactMoved: ThermoState = {
      ...base,
      reactivity: Math.sinh(Math.asinh(1) + THERMO_AFFINITY_SD.reactivity),
    };
    expect(thermoStateDistance(base, heatMoved)).toBeCloseTo(
      thermoStateDistance(base, reactMoved),
      12,
    );
  });
});
