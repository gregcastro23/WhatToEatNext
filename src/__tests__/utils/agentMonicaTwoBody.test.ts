/**
 * §18i — the two-body Moon-phase monica.
 *
 * A phase is a Sun–Moon relationship, so a phase agent gets a genuine two-body
 * calculation. These tests pin the three things that are easy to get silently
 * wrong: the phase→geometry table, the DERIVED per-aspect dignities (which are
 * read off `aspectCalculator.ts` and must not drift from it), and the loud
 * failure on an unclassifiable phase.
 */
import {
  MONICA_EQUILIBRIUM,
  MONICA_LN_EPSILON,
} from "@/data/unified/alchemicalCalculations";
import { groundingVessel } from "@/utils/agentMonica";
import {
  APPLYING_DIGNITY_MULTIPLIER,
  ASPECT_DIGNITY,
  ASPECT_DIGNITY_REFERENCE_ORB,
  ASPECT_ORB_BUDGET,
  ASPECT_POLARITY,
  DEGENERATE_LN_KALCHM,
  EXACT_DIGNITY_MULTIPLIER,
  HEALTHY_LN_KALCHM_FLOOR,
  MOTION_DIGNITY_MULTIPLIER,
  PHASE_GEOMETRY,
  SEPARATING_DIGNITY_MULTIPLIER,
  TWO_BODY_LN_EPSILON,
  UnknownMoonPhaseError,
  VESSEL_DIGNITY_NEUTRAL,
  derivedSunPosition,
  normalizeMoonPhase,
  phaseGeometry,
  sunAspectDignity,
  twoBodyMonica,
  twoBodyMonicaForSect,
  twoBodyState,
  type MoonPhaseKey,
} from "@/utils/agentMonicaTwoBody";
import {
  agentMonicaFromName,
  parseAgentPlacement,
  twoBodyMonicaFromName,
} from "@/utils/agentMonicaResolver";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const ALL_PHASES: MoonPhaseKey[] = [
  "new",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full",
  "waning gibbous",
  "last quarter",
  "waning crescent",
];

describe("PHASE_GEOMETRY — elongation and aspect per phase (§18i)", () => {
  const expected: Record<
    MoonPhaseKey,
    { elongation: number; aspect: string; motion: string }
  > = {
    "new": { elongation: 0, aspect: "conjunction", motion: "exact" },
    "waxing crescent": {
      elongation: 45,
      aspect: "semisquare",
      motion: "applying",
    },
    "first quarter": { elongation: 90, aspect: "square", motion: "applying" },
    "waxing gibbous": {
      elongation: 135,
      aspect: "sesquisquare",
      motion: "applying",
    },
    "full": { elongation: 180, aspect: "opposition", motion: "exact" },
    "waning gibbous": {
      elongation: 225,
      aspect: "sesquisquare",
      motion: "separating",
    },
    "last quarter": { elongation: 270, aspect: "square", motion: "separating" },
    "waning crescent": {
      elongation: 315,
      aspect: "semisquare",
      motion: "separating",
    },
  };

  it.each(ALL_PHASES)("%s resolves to the right elongation and aspect", (p) => {
    expect(PHASE_GEOMETRY[p]).toEqual({ phase: p, ...expected[p] });
  });

  it("covers all 8 phases at 45° midpoints, and only those", () => {
    expect(Object.keys(PHASE_GEOMETRY).sort()).toEqual([...ALL_PHASES].sort());
    expect(ALL_PHASES.map((p) => PHASE_GEOMETRY[p].elongation)).toEqual([
      0, 45, 90, 135, 180, 225, 270, 315,
    ]);
  });

  it("marks New and Full exact — neither applying nor separating", () => {
    expect(PHASE_GEOMETRY["new"].motion).toBe("exact");
    expect(PHASE_GEOMETRY["full"].motion).toBe("exact");
  });
});

describe("normalizeMoonPhase", () => {
  it("folds Dark Moon into New — it is not a ninth phase", () => {
    expect(normalizeMoonPhase("Dark Moon")).toBe("new");
    expect(normalizeMoonPhase("dark")).toBe("new");
    expect(phaseGeometry("Dark Moon")).toEqual(PHASE_GEOMETRY["new"]);
    expect(phaseGeometry("Dark Moon").elongation).toBe(0);
    expect(phaseGeometry("Dark Moon").aspect).toBe("conjunction");
  });

  it("accepts the production spellings, with or without a trailing `Moon`", () => {
    expect(normalizeMoonPhase("First Quarter")).toBe("first quarter");
    expect(normalizeMoonPhase("First Quarter Moon")).toBe("first quarter");
    expect(normalizeMoonPhase("New Moon")).toBe("new");
    expect(normalizeMoonPhase("Full Moon")).toBe("full");
    expect(normalizeMoonPhase("Moon Phase Waxing Gibbous")).toBe(
      "waxing gibbous",
    );
  });

  it("is insensitive to case, separators and extra whitespace", () => {
    for (const spelling of [
      "waxing crescent",
      "Waxing Crescent",
      "WAXING CRESCENT",
      "waxing_crescent",
      "waxing-crescent",
      "  Waxing   Crescent  ",
      "Waxing Crescent Moon",
    ]) {
      expect(normalizeMoonPhase(spelling)).toBe("waxing crescent");
    }
  });

  it("treats Third Quarter as the synonym of Last Quarter", () => {
    expect(normalizeMoonPhase("Third Quarter")).toBe("last quarter");
  });

  it("returns null — not a default — for anything unrecognised", () => {
    for (const bad of ["", "Gibbous", "Blorp", "Moon", "Quarter", "waxing"]) {
      expect(normalizeMoonPhase(bad)).toBeNull();
    }
  });
});

describe("an unrecognised phase fails loudly", () => {
  it("throws rather than defaulting to New", () => {
    expect(() => phaseGeometry("Blorp Moon")).toThrow(UnknownMoonPhaseError);
    expect(() => sunAspectDignity("Blorp Moon")).toThrow(UnknownMoonPhaseError);
    expect(() => twoBodyMonica("Blorp Moon", "Cancer", 0)).toThrow(
      UnknownMoonPhaseError,
    );
    expect(() => twoBodyMonicaForSect("Blorp", "Cancer", 0, "diurnal")).toThrow(
      UnknownMoonPhaseError,
    );
  });

  it("names the offending string in the error", () => {
    let caught: unknown;
    try {
      twoBodyMonica("Blorp Moon", "Cancer", 0);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(UnknownMoonPhaseError);
    expect((caught as UnknownMoonPhaseError).rawPhase).toBe("Blorp Moon");
    expect((caught as Error).message).toContain("Blorp Moon");
  });

  it("does not silently return the equilibrium sentinel for a bad phase", () => {
    // The φ fallback is for degenerate POSITIONS, never for an unclassified
    // population — that distinction is the whole point of the throw.
    expect(() => twoBodyMonica("", "Cancer", 0)).toThrow(UnknownMoonPhaseError);
  });
});

describe("ASPECT_DIGNITY — [DERIVED] from aspectCalculator.ts", () => {
  it("matches the orb budgets read from aspectDefinitions", () => {
    expect(ASPECT_ORB_BUDGET).toEqual({
      conjunction: 8,
      opposition: 8,
      square: 7,
      semisquare: 3,
      sesquisquare: 3,
    });
  });

  it("uses the aspectCalculator polarity convention (hard aspects negative)", () => {
    expect(ASPECT_POLARITY.conjunction).toBe(1);
    expect(ASPECT_POLARITY.opposition).toBe(-1);
    expect(ASPECT_POLARITY.square).toBe(-1);
    // MODEL CHANGE (§18i-bis): aspectCalculator gives these influence = 0.
    expect(ASPECT_POLARITY.semisquare).toBe(-1);
    expect(ASPECT_POLARITY.sesquisquare).toBe(-1);
  });

  it("derives polarity × 10 × (orbBudget / 8)", () => {
    expect(ASPECT_DIGNITY.conjunction).toBeCloseTo(10, 10);
    expect(ASPECT_DIGNITY.opposition).toBeCloseTo(-10, 10);
    expect(ASPECT_DIGNITY.square).toBeCloseTo(-8.75, 10);
    expect(ASPECT_DIGNITY.semisquare).toBeCloseTo(-3.75, 10);
    expect(ASPECT_DIGNITY.sesquisquare).toBeCloseTo(-3.75, 10);
  });

  it("keeps the sanity property: ±10 are the domicile/fall anchors and square sits between detriment and fall", () => {
    expect(Math.abs(ASPECT_DIGNITY.conjunction)).toBe(10);
    expect(Math.abs(ASPECT_DIGNITY.opposition)).toBe(10);
    expect(ASPECT_DIGNITY.square).toBeLessThan(-7); // past detriment
    expect(ASPECT_DIGNITY.square).toBeGreaterThan(-10); // not past fall
  });
});

describe("applying vs separating — [DERIVED] multiplier (§18i-ter)", () => {
  // Pin the DERIVATION, not the literal: the multiplier is the reference orb
  // budget over the square's (8/7), read from aspectCalculator — the same live
  // inputs §18i-bis uses. Asserting 1.1428… as a literal would be pinning a
  // rounded artifact instead of the rule that produces it.
  it("derives the multipliers from the live orb budgets", () => {
    expect(APPLYING_DIGNITY_MULTIPLIER).toBe(
      ASPECT_DIGNITY_REFERENCE_ORB / ASPECT_ORB_BUDGET.square,
    );
    expect(SEPARATING_DIGNITY_MULTIPLIER).toBe(2 - APPLYING_DIGNITY_MULTIPLIER);
    expect(EXACT_DIGNITY_MULTIPLIER).toBe(1);
    // Applying and separating are reflections about 1 — equal and opposite.
    expect(APPLYING_DIGNITY_MULTIPLIER + SEPARATING_DIGNITY_MULTIPLIER).toBeCloseTo(2, 12);
    expect(MOTION_DIGNITY_MULTIPLIER).toEqual({
      applying: APPLYING_DIGNITY_MULTIPLIER,
      separating: SEPARATING_DIGNITY_MULTIPLIER,
      exact: EXACT_DIGNITY_MULTIPLIER,
    });
  });

  // The property that motivated 8/7: an applying square is scored at the FULL
  // reference orb budget, landing exactly on the domicile anchor (+/-10) of the
  // essential-dignity scale.
  it("scores an applying square at exactly the domicile anchor", () => {
    expect(sunAspectDignity("First Quarter")).toBeCloseTo(-10, 12);
  });

  it("multiplies the Sun's aspect dignity only", () => {
    const up = APPLYING_DIGNITY_MULTIPLIER;
    const down = SEPARATING_DIGNITY_MULTIPLIER;
    expect(sunAspectDignity("First Quarter")).toBeCloseTo(-8.75 * up, 10);
    expect(sunAspectDignity("Last Quarter")).toBeCloseTo(-8.75 * down, 10);
    expect(sunAspectDignity("Waxing Crescent")).toBeCloseTo(-3.75 * up, 10);
    expect(sunAspectDignity("Waning Crescent")).toBeCloseTo(-3.75 * down, 10);
    expect(sunAspectDignity("Waxing Gibbous")).toBeCloseTo(-3.75 * up, 10);
    expect(sunAspectDignity("Waning Gibbous")).toBeCloseTo(-3.75 * down, 10);
  });

  it("leaves New and Full untouched — exact aspects take ×1.0", () => {
    expect(sunAspectDignity("New")).toBe(ASPECT_DIGNITY.conjunction);
    expect(sunAspectDignity("Dark Moon")).toBe(ASPECT_DIGNITY.conjunction);
    expect(sunAspectDignity("Full")).toBe(ASPECT_DIGNITY.opposition);
  });

  it("makes waxing and waning differ despite a shared aspect geometry", () => {
    // Same aspect, same Sun sign, same Moon — only the motion differs.
    const firstQ = twoBodyMonica("First Quarter", "Cancer", 12);
    const lastQ = twoBodyMonica("Last Quarter", "Cancer", 12);
    expect(PHASE_GEOMETRY["first quarter"].aspect).toBe(
      PHASE_GEOMETRY["last quarter"].aspect,
    );
    expect(firstQ.combined).not.toBeCloseTo(lastQ.combined, 6);

    const waxCr = twoBodyMonica("Waxing Crescent", "Leo", 5);
    const wanCr = twoBodyMonica("Waning Crescent", "Leo", 5);
    expect(waxCr.combined).not.toBeCloseTo(wanCr.combined, 6);

    const waxGib = twoBodyMonica("Waxing Gibbous", "Virgo", 9);
    const wanGib = twoBodyMonica("Waning Gibbous", "Virgo", 9);
    expect(waxGib.combined).not.toBeCloseTo(wanGib.combined, 6);
  });
});

describe("derivedSunPosition — Sun = Moon − elongation", () => {
  it("puts the Sun on the Moon at New / Dark Moon", () => {
    expect(derivedSunPosition("New", "Cancer", 0)).toEqual({
      sign: "Cancer",
      degree: 0,
      longitude: 90,
    });
    expect(derivedSunPosition("Dark Moon", "Cancer", 0)).toEqual({
      sign: "Cancer",
      degree: 0,
      longitude: 90,
    });
  });

  it("puts the Sun opposite the Moon at Full", () => {
    expect(derivedSunPosition("Full", "Cancer", 0)).toEqual({
      sign: "Capricorn",
      degree: 0,
      longitude: 270,
    });
  });

  it("wraps below zero correctly (First Quarter from Cancer 0 → Aries 0)", () => {
    expect(derivedSunPosition("First Quarter", "Cancer", 0)).toEqual({
      sign: "Aries",
      degree: 0,
      longitude: 0,
    });
  });

  it("keeps the elongation exact for every phase", () => {
    for (const p of ALL_PHASES) {
      const sun = derivedSunPosition(p, "Aries", 10);
      const moonLongitude = 10;
      const elongation =
        ((moonLongitude - sun!.longitude) % 360 + 360) % 360;
      expect(elongation).toBeCloseTo(PHASE_GEOMETRY[p].elongation % 360, 10);
    }
  });

  it("returns null for an unresolvable sign rather than guessing Aries", () => {
    expect(derivedSunPosition("Full", "Blorp", 0)).toBeNull();
    expect(derivedSunPosition("Full", "Cancer", Number.NaN)).toBeNull();
  });
});

describe("twoBodyMonica — the totality contract", () => {
  it("is finite for every phase × every sign × a spread of degrees", () => {
    let cases = 0;
    for (const phase of ALL_PHASES) {
      for (const sign of SIGNS) {
        for (let degree = 0; degree < 30; degree++) {
          const m = twoBodyMonica(phase, sign, degree);
          expect(Number.isFinite(m.diurnal)).toBe(true);
          expect(Number.isFinite(m.nocturnal)).toBe(true);
          expect(Number.isFinite(m.combined)).toBe(true);
          expect(m.combined).toBeCloseTo((m.diurnal + m.nocturnal) / 2, 12);
          cases++;
        }
      }
    }
    expect(cases).toBe(8 * 12 * 30);
  });

  // The Comixion pillar (Essence effect −1, so the vessel's Essence axis is 0)
  // sits at degrees 8 and 22. There, ln(kalchm) lands near 0 and −G/(R·ln k)
  // amplifies. TWO_BODY_LN_EPSILON absorbs the degenerate core of that; a skirt
  // survives, because some Comixion cells land at |ln k| ABOVE the healthy floor
  // and cannot be absorbed without converting real values to φ.
  //
  // ⚠️ OPEN, deliberately pinned rather than clamped: flooring the vessel at
  // KALCHM_EPSILON does NOT fix this — tried both before normalisation (the
  // mass-4 rescale divides the floor straight back down to 0.0067) and after
  // (it perturbed single-body away from the already-backfilled production
  // values). The real fix is in the pillar → vessel mapping (§7a).
  //
  // These assertions describe the CURRENT measured behaviour so a change to it
  // is caught, not a bound we wish were true.
  it("confines the amplified tail to the two Comixion degrees", () => {
    const outlierDegrees = new Set<number>();
    let maxOutsideComixion = 0;
    let maxOverall = 0;

    for (const phase of ALL_PHASES) {
      for (const sign of SIGNS) {
        for (let degree = 0; degree < 30; degree++) {
          const v = Math.abs(twoBodyMonica(phase, sign, degree).combined);
          maxOverall = Math.max(maxOverall, v);
          // Partition by DEGREE (the structural cause), never by the outcome —
          // an earlier version bucketed on |v| > 4 and then asserted the other
          // bucket was < 4, which could only fail at exactly 4.0.
          if (degree === 8 || degree === 22) {
            if (v > 4) outlierDegrees.add(degree);
          } else {
            maxOutsideComixion = Math.max(maxOutsideComixion, v);
          }
        }
      }
    }

    // Only the Comixion degrees amplify.
    expect([...outlierDegrees].sort((a, b) => a - b)).toEqual([8, 22]);
    // Everywhere else is comfortably INSIDE the single-body envelope (3.9751).
    expect(maxOutsideComixion).toBeLessThan(2);
    // Bounded, and materially tighter than the 21.45 of the pre-band build.
    expect(maxOverall).toBeLessThan(13);
  });

  // ── the band itself ──────────────────────────────────────────────────────
  // TWO_BODY_LN_EPSILON is derived from two MEASURED bounds. These pin both, so
  // that a retune which starts swallowing real values fails loudly rather than
  // quietly flattening the distribution.
  describe("TWO_BODY_LN_EPSILON — the two-body-local equilibrium band", () => {
    /** Every grid cell's |ln kalchm|, partitioned by the STRUCTURAL cause. */
    const cells = (() => {
      const out: { degree: number; absLnK: number }[] = [];
      for (const phase of ALL_PHASES)
        for (const sign of SIGNS)
          for (let degree = 0; degree < 30; degree++)
            for (const sect of ["diurnal", "nocturnal"] as const) {
              const s = twoBodyState(phase, sign, degree, sect);
              out.push({ degree, absLnK: Math.abs(s.lnKalchm as number) });
            }
      return out;
    })();
    const isComixion = (d: number) => d === 8 || d === 22;

    it("sits strictly between the two measured bounds", () => {
      expect(TWO_BODY_LN_EPSILON).toBeGreaterThan(DEGENERATE_LN_KALCHM);
      expect(TWO_BODY_LN_EPSILON).toBeLessThan(HEALTHY_LN_KALCHM_FLOOR);
    });

    it("[MEASURED] the degenerate bound really is the zero-Essence chart", () => {
      // Comixion nocturnal: the vessel's Essence axis is exactly 0.
      const s = twoBodyState("waxing gibbous", "Leo", 8, "nocturnal");
      expect(s.esms?.Essence).toBe(0);
      expect(Math.abs(s.lnKalchm as number)).toBeCloseTo(DEGENERATE_LN_KALCHM, 6);
    });

    it("[MEASURED] the healthy floor really is the smallest non-Comixion |ln k|", () => {
      const floor = Math.min(
        ...cells.filter((c) => !isComixion(c.degree)).map((c) => c.absLnK),
      );
      expect(floor).toBeCloseTo(HEALTHY_LN_KALCHM_FLOOR, 6);
    });

    it("absorbs with ZERO collateral — no healthy cell is converted to φ", () => {
      const collateral = cells.filter(
        (c) => !isComixion(c.degree) && c.absLnK < TWO_BODY_LN_EPSILON,
      );
      expect(collateral).toEqual([]);
    });

    it("does absorb a real share of the degenerate cases", () => {
      const tail = cells.filter((c) => isComixion(c.degree));
      const absorbed = tail.filter((c) => c.absLnK < TWO_BODY_LN_EPSILON);
      // Measured 304/384. Pinned as a floor so a silent narrowing is caught.
      expect(absorbed.length).toBeGreaterThanOrEqual(304);
      expect(absorbed.length).toBeLessThan(tail.length); // the skirt is real
    });

    it("leaves the canonical engine's own band untouched", () => {
      // The whole point of a LOCAL band: the shared §17c constant is unchanged,
      // so the 4280 single-body rows in production keep their values.
      expect(MONICA_LN_EPSILON).toBe(0.05);
      expect(TWO_BODY_LN_EPSILON).toBeGreaterThan(MONICA_LN_EPSILON);
    });
  });

  // ── the equalisation ─────────────────────────────────────────────────────
  describe("dignity is applied exactly once per body", () => {
    // Degree 4 is chosen because its vessel has a NONZERO Substance axis
    // (1.333). Degree 5's is 0, which would make both assertions below compare
    // 0 to 0 and pass vacuously — the same circular-test shape already caught
    // once in this file.
    const DEG = 4;
    const BARE = groundingVessel(DEG, VESSEL_DIGNITY_NEUTRAL);

    it("uses a degree whose vessel Substance is non-vacuous", () => {
      expect(BARE.Substance).toBeGreaterThan(0.5);
    });

    it("builds the shared vessel dignity-NEUTRAL", () => {
      expect(VESSEL_DIGNITY_NEUTRAL).toBe(0);
      // Substance comes ONLY from the vessel here: in the diurnal table the Sun
      // is Spirit and the Moon is Essence, so this axis isolates the vessel.
      const s = twoBodyState("new", "Cancer", DEG, "diurnal"); // Moon domicile +10
      const scaled = groundingVessel(DEG, 10); // what a Moon-scaled vessel would be
      expect(scaled.Substance).not.toBeCloseTo(BARE.Substance, 6); // guard: they differ
      expect(s.esms?.Substance).toBeCloseTo(BARE.Substance, 12);
      expect(s.esms?.Substance).not.toBeCloseTo(scaled.Substance, 6);
    });

    it("gives the Moon's dignity no more leverage than the Sun's", () => {
      // Cancer = Moon domicile (+10), Capricorn = Moon detriment (−7). If the
      // Moon's dignity still scaled the shared vessel, the vessel-only axis
      // (Substance) would move between them. It must not.
      const dom = twoBodyState("new", "Cancer", DEG, "diurnal");
      const det = twoBodyState("new", "Capricorn", DEG, "diurnal");
      expect(dom.esms?.Substance).toBeGreaterThan(0.5); // non-vacuity
      expect(dom.esms?.Substance).toBeCloseTo(det.esms?.Substance as number, 12);
      // …while the Moon's own axis DOES still respond to its dignity.
      expect(dom.esms?.Essence).not.toBeCloseTo(det.esms?.Essence as number, 6);
    });
  });

  it("returns φ, never NaN and never 0, for degenerate positions", () => {
    expect(twoBodyMonica("Full", "Blorp", 0).combined).toBe(MONICA_EQUILIBRIUM);
    expect(twoBodyMonica("Full", "", 0).combined).toBe(MONICA_EQUILIBRIUM);
    expect(twoBodyMonica("Full", "Cancer", Number.NaN).combined).toBe(
      MONICA_EQUILIBRIUM,
    );
  });

  it("agrees across equivalent spellings of the same phase", () => {
    const a = twoBodyMonica("First Quarter", "Cancer", 0);
    const b = twoBodyMonica("first quarter", "cancer", 0);
    const c = twoBodyMonica("First Quarter Moon", "CANCER", 0);
    const d = twoBodyMonica("first_quarter", "Cancer", 0);
    expect(a).toEqual(b);
    expect(a).toEqual(c);
    expect(a).toEqual(d);

    const n1 = twoBodyMonica("New", "Pisces", 3);
    const n2 = twoBodyMonica("New Moon", "Pisces", 3);
    const n3 = twoBodyMonica("Dark Moon", "Pisces", 3);
    expect(n1).toEqual(n2);
    expect(n1).toEqual(n3);
  });

  it("varies by sect through the Moon only — the Sun is Spirit in both", () => {
    const m = twoBodyMonica("Full", "Cancer", 12);
    expect(m.diurnal).not.toBeCloseTo(m.nocturnal, 6);
  });

  it("distinguishes the eight phases at one position", () => {
    const values = ALL_PHASES.map(
      (p) => twoBodyMonica(p, "Cancer", 7).combined,
    );
    // Waxing/waning pairs share an aspect but differ by motion, so all eight
    // must be distinct; no sentinel clustering.
    expect(new Set(values.map((v) => v.toFixed(9))).size).toBe(8);
  });
});

describe("twoBodyMonicaFromName — the resolver seam", () => {
  it("serves phase agents in both production name families", () => {
    const a = twoBodyMonicaFromName("First Quarter Moon in Cancer 0 Degree");
    expect(a).not.toBeNull();
    expect(Number.isFinite(a!.combined)).toBe(true);

    const b = twoBodyMonicaFromName("Waxing Gibbous Moon in Virgo 9 Degree");
    expect(b).not.toBeNull();
    expect(Number.isFinite(b!.combined)).toBe(true);

    const c = twoBodyMonicaFromName("Moon Phase Dark Moon 153");
    expect(c).not.toBeNull();
    expect(Number.isFinite(c!.combined)).toBe(true);
  });

  it("agrees with the pure calc on the parsed placement", () => {
    const name = "Moon Phase Dark Moon 153";
    const placement = parseAgentPlacement(name);
    expect(placement).toMatchObject({ kind: "phase", phase: "Dark Moon" });
    expect(twoBodyMonicaFromName(name)).toEqual(
      twoBodyMonica(placement!.phase!, placement!.sign, placement!.degree),
    );
  });

  it("returns null for single-body agents, people and junk", () => {
    for (const name of [
      "Jupiter in Aquarius 0 Degree",
      "Mercury Aquarius 16",
      "Moon Agent 0",
      "Edgar Allan Poe",
      "Mars Gemini",
      "",
    ]) {
      expect(twoBodyMonicaFromName(name)).toBeNull();
    }
  });

  it("is the exact complement of agentMonicaFromName", () => {
    // Every parseable agent name is served by exactly one of the two.
    for (const name of [
      "Jupiter in Aquarius 0 Degree",
      "Mercury Aquarius 16",
      "Moon Agent 0",
      "First Quarter Moon in Cancer 0 Degree",
      "Moon Phase Dark Moon 153",
    ]) {
      const single = agentMonicaFromName(name);
      const two = twoBodyMonicaFromName(name);
      expect(Number(single !== null) + Number(two !== null)).toBe(1);
    }
  });

  it("does NOT change agentMonicaFromName's behaviour for phase agents", () => {
    expect(agentMonicaFromName("First Quarter Moon in Cancer 0 Degree")).toBeNull();
    expect(agentMonicaFromName("Moon Phase Dark Moon 153")).toBeNull();
  });

  it("throws — not null — on a phase agent whose phase is unclassifiable", () => {
    // "Blorp Moon in Cancer 0 Degree" parses as kind:"phase" with phase "Blorp".
    expect(parseAgentPlacement("Blorp Moon in Cancer 0 Degree")).toMatchObject({
      kind: "phase",
      phase: "Blorp",
    });
    expect(() =>
      twoBodyMonicaFromName("Blorp Moon in Cancer 0 Degree"),
    ).toThrow(UnknownMoonPhaseError);
  });
});
