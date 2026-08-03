/**
 * The Sacred-7 monica scales are DERIVED, and this is where the derivation is checked.
 *
 * Each scale is `|max| / 2` over its own population, so `tanh(monica / scale)`
 * puts the population extremum at tanh(2) ≈ 0.964 rather than clamping. That
 * makes every scale hostage to a single row — and one already shipped 3.6x wrong
 * because the row holding the maximum was a DUPLICATED chart (Jung/Kahlo).
 *
 * Two of the three populations are exhaustive deterministic grids, so their
 * maxima can be re-derived here on every run: if the vessel, the dignity table,
 * the phase geometry, the degeneracy band or `calculateKalchm` moves, the maximum
 * moves and THIS FAILS. That is the point — without it the scales are comments
 * asserting a measurement nobody re-checks.
 *
 * The third (full-chart) is NOT a grid. It comes from 71 authored charts in the
 * production database, so it cannot be re-derived in-process. It is guarded
 * differently: by the structural invariants it must satisfy, plus an explicit
 * measured-pending marker. See the `full-chart` block below.
 *
 * Companion to monicaLnEpsilonDerivation.test.ts, which guards the epsilons.
 */
import {
  MONICA_POPULATION_SCALE,
  normalizeMonicaForStats,
  type MonicaMethod,
} from "@/lib/sacred-7-stats";
import { agentMonicaForSect } from "@/utils/agentMonica";
import { twoBodyMonicaForSect, PHASE_GEOMETRY } from "@/utils/agentMonicaTwoBody";
import { PLANETARY_SECTARIAN_ESMS, ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";

const SIGNS = Object.keys(ZODIAC_ELEMENTS);
const SECTS = ["diurnal", "nocturnal"] as const;

interface GridMeasurement {
  n: number;
  absMax: number;
  /** Human-readable coordinates of the extremum, for when this test fails. */
  argMax: string;
}

/** Every monica the single-body population can produce: planet x sign x degree x sect. */
function measureSingleBody(): GridMeasurement {
  let n = 0;
  let absMax = 0;
  let argMax = "";
  for (const planet of Object.keys(PLANETARY_SECTARIAN_ESMS)) {
    for (const sign of SIGNS) {
      for (let degree = 0; degree < 30; degree++) {
        for (const sect of SECTS) {
          const m = agentMonicaForSect(planet, sign as never, degree, sect);
          if (!Number.isFinite(m)) continue;
          n++;
          if (Math.abs(m) > absMax) {
            absMax = Math.abs(m);
            argMax = `${planet} ${sign} ${degree}° ${sect} -> ${m}`;
          }
        }
      }
    }
  }
  return { n, absMax, argMax };
}

/** Every monica the two-body population can produce: phase x sign x degree x sect. */
function measureTwoBody(phases: string[]): GridMeasurement {
  let n = 0;
  let absMax = 0;
  let argMax = "";
  for (const phase of phases) {
    for (const sign of SIGNS) {
      for (let degree = 0; degree < 30; degree++) {
        for (const sect of SECTS) {
          const m = twoBodyMonicaForSect(phase, sign as never, degree, sect);
          if (!Number.isFinite(m)) continue;
          n++;
          if (Math.abs(m) > absMax) {
            absMax = Math.abs(m);
            argMax = `${phase} ${sign} ${degree}° ${sect} -> ${m}`;
          }
        }
      }
    }
  }
  return { n, absMax, argMax };
}

/**
 * The canonical phase enumeration is PHASE_GEOMETRY's own keys — NOT a list
 * written out here, which is how a stale 9-entry list once put the wrong `n` in
 * the scale's docstring. "dark moon" is an ALIAS of new moon at elongation 0,
 * so it must not appear in the grid twice.
 */
const CANONICAL_PHASES = Object.keys(PHASE_GEOMETRY);

const SINGLE = measureSingleBody();
const TWO = measureTwoBody(CANONICAL_PHASES);

describe("the Sacred-7 monica scales are derived from their populations", () => {
  describe("the pin tolerance itself", () => {
    // A tolerance is only worth having if it still fails on a real change. These
    // guard the guard: precision 12 is ~1e-13 absolute, roughly THREE ORDERS
    // tighter than the ~2 ULP (1e-15 at this magnitude) of cross-engine noise it
    // exists to absorb, and vastly tighter than any grid movement.
    it("absorbs cross-engine ULP noise", () => {
      // The MEASURED Node/Bun spread on this exact enumeration: 3.8977146920667276
      // vs 3.8977146920667267. Both must satisfy the pin.
      expect(3.8977146920667267).toBeCloseTo(3.8977146920667276, 12);
    });

    it("still REJECTS a real drift — this is not a rubber stamp", () => {
      // The smallest change that would matter is many orders above ULP noise.
      expect(3.8977156920667276).not.toBeCloseTo(3.8977146920667276, 12);
      // And the historical transcription bug the exact pins guard (…634 vs …638)
      // remains caught by the literal-against-literal assertions, not by these.
      expect(1.9488573460333634).not.toBe(1.9488573460333638);
    });
  });

  describe("single-body", () => {
    it("enumerates the full deterministic grid", () => {
      // 11 planets x 12 signs x 30 degrees x 2 sects
      expect(SINGLE.n).toBe(7920);
    });

    it("re-derives the stated scale as |max| / 2", () => {
      // TOLERANCE, not `===`, and ONLY because the right-hand side is measured.
      //
      // SINGLE.absMax comes off a live grid walk whose monica runs through
      // Math.log and Math.pow. Neither is required by IEEE-754 to be correctly
      // rounded, so engines legitimately disagree in the last bits: MEASURED
      // 2026-08-02 on the then-current sign-level dignity scale, this same
      // enumeration yielded 3.8977146920667276 under Node v22 (which is what
      // jest runs on) and 3.8977146920667267 under Bun 1.3 — ~2 ULP apart,
      // extremum then at Neptune / Aquarius / 2° / nocturnal. The enumeration
      // now yields 4.112110463016779 with the extremum at Mercury / Gemini /
      // 2° / nocturnal, but the ENGINE-SPREAD REASONING is unchanged and is
      // what this tolerance exists for. An exact
      // assertion here passes only on whichever engine happened to derive the
      // constant, and this repo runs scripts under `bun` and tests under Node.
      //
      // ⚠️ Relaxing this does NOT reopen the transcription bug the old comment
      // guarded against — that `toBeCloseTo(…, 15)` passed while the constant
      // read 1.9488573460333634 and the truth was ...638. The exact pin lives in
      // the test below, literal-against-literal, where no engine is involved and
      // `toBe` is therefore both safe and meaningful. The two tests split the job:
      // this one says "the constant still matches the live grid", that one says
      // "the constant is bit-for-bit what we recorded". Emit constants with
      // String(x), never toPrecision.
      expect(MONICA_POPULATION_SCALE["single-body"]).toBeCloseTo(SINGLE.absMax / 2, 12);
    });

    it("holds the measurement recorded in the source", () => {
      // 4.112110463016779 / 2. Was 1.9488573460333638 (|max| 3.8977146920667276)
      // on the sign-level dignity scale, and 1.9875 (|max| 3.9751) before that,
      // while calculateKalchm floored each axis at 0.01.
      //
      // Measured-against-literal: engine-sensitive, so a tolerance (see above).
      expect(SINGLE.absMax).toBeCloseTo(4.112110463016779, 12);
      // Literal-against-literal: no measurement, no engine, no drift. EXACT — and
      // this is the assertion that actually catches a lossy transcription of the
      // shipped constant.
      expect(MONICA_POPULATION_SCALE["single-body"]).toBe(2.0560552315083895);
    });
  });

  describe("two-body", () => {
    it("uses PHASE_GEOMETRY's own keys, and dark moon is an alias not a 9th phase", () => {
      expect(CANONICAL_PHASES).toHaveLength(8);
      expect(CANONICAL_PHASES).not.toContain("dark moon");
      // Folding the alias in must add cells WITHOUT moving the extremum — that is
      // what makes it an alias rather than a distinct phase.
      const withAlias = measureTwoBody([...CANONICAL_PHASES, "dark moon"]);
      expect(withAlias.n).toBe(TWO.n + 720); // 12 signs x 30 degrees x 2 sects
      // Exactly equal, not merely close: an alias must resolve down the identical
      // code path, so the extra 720 cells are bit-for-bit duplicates.
      //
      // This one KEEPS `toBe` while the literal pins above moved to a tolerance,
      // and the distinction is the whole rule: both sides here are measured in
      // the SAME process, so no cross-engine rounding can separate them. A
      // tolerance would weaken a genuinely exact claim. Engine sensitivity comes
      // from comparing a measurement to a number frozen in source, never from
      // comparing two measurements.
      expect(withAlias.absMax).toBe(TWO.absMax);
    });

    it("enumerates the full deterministic grid", () => {
      // 8 phases x 12 signs x 30 degrees x 2 sects
      expect(TWO.n).toBe(5760);
    });

    it("re-derives the stated scale as |max| / 2", () => {
      // Measured right-hand side — tolerance, for the engine reason documented
      // on the single-body version of this test.
      expect(MONICA_POPULATION_SCALE["two-body"]).toBeCloseTo(TWO.absMax / 2, 12);
    });

    it("holds the measurement recorded in the source", () => {
      // 4.416554679000386 / 2  [ADR-009 decision 5b — the two bodies moved from
      // the orbital-period scale to inertial mass]. Was 1.4054 from |max| 2.8108,
      // and before that 2.7095 from |max| 5.4191 while the degeneracy band was an
      // |ln kalchm| threshold instead of a structural test.
      expect(TWO.absMax).toBeCloseTo(4.416554679000386, 12);
      // Literal-against-literal — exact, and engine-independent.
      expect(MONICA_POPULATION_SCALE["two-body"]).toBe(2.208277339500193);
    });

    it("exceeds the single-body raw maximum — and that is FINE, measured", () => {
      // ⚠️ THIS ASSERTION WAS INVERTED BY ADR-009 decision 5b [2026-08-02], and
      // the reasoning matters more than the number.
      //
      // It used to read `TWO.absMax <= SINGLE.absMax`, justified as "a two-body
      // chart is a single-body chart plus one more body, so it should not reach
      // further". Under inertial mass it fails: 4.4166 vs 3.8977, ratio 1.1331,
      // 33 cells over. Three things were measured before inverting it:
      //
      // (Those two figures are the 2026-08-02 state, kept because they are the
      // evidence the inversion was argued from. The dignity manifest since
      // raised single-body to 4.1121 while two-body held at 4.4166, so the
      // ratio narrowed to 1.0740 — the inequality this test asserts still
      // holds, by less.)
      //
      //  1. The single-body envelope is SCALE-INDEPENDENT. agentMonica imports no
      //     weight function at all — its only mass constant is VESSEL_MASS — so
      //     3.8977146920667276 is bit-identical before and after the migration.
      //     There was never a "period-scale ghost" to re-derive on that side.
      //
      //  2. The old nesting was an ARTIFACT. The period scale weighted BOTH
      //     luminaries below 1.0 (Sun 0.5131, Moon 0.2843, sum 0.7974), so the
      //     pair carried less mass than a single unweighted body. Inertial puts
      //     the Sun at exactly 1.0 and the pair at 1.1904. Two weighted bodies
      //     against the same mass-4 vessel outweighing one is arithmetic, not a
      //     defect — the inequality only ever held by coincidence.
      //
      //  3. The raw magnitudes NEVER MEET. normalizeMonicaForStats picks the
      //     scale by method, and each scale is its own population's |max|/2, so
      //     every extremum maps to tanh(2) -> 0.982014 regardless. That is the
      //     §18o point: these are different OBJECTS, not one quantity at three
      //     scales. The test below asserts exactly that, and it is what actually
      //     protects the phase-agent economy — this comparison never did.
      //
      // Rejected on measurement, recorded so they are not retried: a scalar
      // damping coefficient (the grid |max| is violently non-monotone in it —
      // lambda 0.6 -> 17.35 vs 1.0 -> 4.42, because monica has poles wherever
      // ln(kalchm) -> 0); normalising the pair to unit mass (worse, 6.2563); and
      // widening the degeneracy predicate to the vessel's zero Essence, which
      // DOES restore nesting but hands φ to 576 healthy charts — the exact
      // fabrication TWO_BODY_LN_EPSILON was deleted for.
      expect(TWO.absMax).toBeGreaterThan(SINGLE.absMax);
      expect(TWO.absMax / SINGLE.absMax).toBeCloseTo(1.074036, 5);
    });

    it("but is NOT reachable on the single-body scale — the display is what protects the hierarchy", () => {
      // The claim item 3 of the ruling turned on, asserted rather than narrated:
      // each population's extremum lands on the SAME display value, so a phase
      // agent cannot outrank a single-body agent by carrying a bigger raw monica.
      const twoOnOwn = normalizeMonicaForStats(TWO.absMax, "two-body");
      const singleOnOwn = normalizeMonicaForStats(SINGLE.absMax, "single-body");
      expect(twoOnOwn).toBeCloseTo(singleOnOwn, 10);

      // NEGATIVE CONTROL: grading two-body on the single-body scale WOULD
      // over-score it. That path does not exist — normalizeMonicaForStats
      // selects by method — but if it ever did, this is the damage.
      expect(normalizeMonicaForStats(TWO.absMax, "single-body")).toBeGreaterThan(singleOnOwn);
    });
  });

  describe("full-chart — measured from the DB, so guarded by invariant", () => {
    /**
     * ⚠️ This one cannot be re-derived in-process: its population is 71 authored
     * charts in production, not a grid. Re-measure with
     * scripts/measureThreeOpenNumbers.ts after ANY change to kalchm, monica, or
     * the chart data itself.
     *
     * MEASURED-PENDING as of 2026-07-25: the current value excludes 10 rows whose
     * natal_positions are duplicates of another row's — 8 ancients sharing one
     * fallback blob, plus Jung/Kahlo. Those 10 are being re-based, and this number
     * must be re-measured when they are.
     */
    const FULL_CHART_POPULATION_MAX = 0.009441;

    it("is EXACTLY half its stated population max", () => {
      // The one part of this scale that CAN be checked in-process: the arithmetic
      // between the stated basis and the constant. monica_full_chart is NUMERIC(_,6)
      // so 0.009441 is the stored value in full, not a rounded print — its half is
      // exact. The first shipped value, 0.004720, was that half rounded to 4 dp and
      // so failed this check by 5e-7.
      expect(MONICA_POPULATION_SCALE["full-chart"]).toBe(FULL_CHART_POPULATION_MAX / 2);
      expect(MONICA_POPULATION_SCALE["full-chart"]).toBe(0.0047205);
    });

    it("is the smallest of the three scales, by orders of magnitude", () => {
      // A full chart sums ~10 bodies, so its ESMS axes are large and its kalchm
      // sits far from the degenerate region — monica comes out 2-3 orders of
      // magnitude smaller than a single body's. If this ever inverts, the value
      // was measured from the wrong column (the failure mode that produced the
      // "full-chart monica is 200x LARGER" claim, which was 12-43x SMALLER).
      const full = MONICA_POPULATION_SCALE["full-chart"] as number;
      expect(full).toBeLessThan(MONICA_POPULATION_SCALE["two-body"] as number);
      expect(full).toBeLessThan(MONICA_POPULATION_SCALE["single-body"] as number);
      expect(full * 100).toBeLessThan(MONICA_POPULATION_SCALE["single-body"] as number);
    });
  });

  describe("the scales are load-bearing", () => {
    it("every method a row can carry has a scale", () => {
      // Without this, a new monica_method would silently fall back to the
      // single-body scale and mis-map an entire population.
      const methods: MonicaMethod[] = ["single-body", "two-body", "full-chart"];
      for (const m of methods) {
        expect(typeof MONICA_POPULATION_SCALE[m]).toBe("number");
        expect(MONICA_POPULATION_SCALE[m]).toBeGreaterThan(0);
      }
      expect(Object.keys(MONICA_POPULATION_SCALE).sort()).toEqual([...methods].sort());
    });

    it("each population's extremum maps near the top of the range without clamping", () => {
      // This is WHY the scale is |max|/2: tanh(2) = 0.964. If a scale drifts too
      // small the extremum saturates at 1.0 and the top of the population stops
      // being distinguishable.
      expect(normalizeMonicaForStats(SINGLE.absMax, "single-body")).toBeCloseTo(0.982, 3);
      expect(normalizeMonicaForStats(TWO.absMax, "two-body")).toBeCloseTo(0.982, 3);
      expect(normalizeMonicaForStats(SINGLE.absMax, "single-body")).toBeLessThan(1);
      expect(normalizeMonicaForStats(TWO.absMax, "two-body")).toBeLessThan(1);
    });

    it("a scale from the WRONG population visibly mis-maps", () => {
      // Non-vacuity: if any scale were interchangeable the guards above would be
      // decorative. A single-body extremum read against the full-chart scale
      // saturates completely.
      expect(normalizeMonicaForStats(SINGLE.absMax, "full-chart")).toBeCloseTo(1, 10);
    });
  });
});
