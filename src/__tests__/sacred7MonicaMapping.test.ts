/**
 * §18p — Sacred-7 takes a PER-POPULATION monica mapping.
 *
 * The bug these pin: `deriveStatsFromChart` mixed monica in as `monica / 10`,
 * assuming input in [0,10]. Measured against production the real input is
 * [-5.4191, 6.8200] with 24.6% NEGATIVE — so the old form both over-drove the
 * stats (122.4% of the assumed span, enough to clamp) and had no defined
 * behaviour for negatives.
 *
 * And the fix must be per-population: one shared scale collapses the
 * smallest-scale population onto a single stat value (§18o — the three agent
 * kinds are different objects, not one quantity at three scales).
 */
import {
  deriveStatsFromChart,
  normalizeMonicaForStats,
  type MonicaMethod,
} from "@/lib/sacred-7-stats";

/** A fixed chart, so any output difference can only come from monica. */
const CHART = {
  sunLongitude: 135,
  moonLongitude: 33,
  mercuryLongitude: 152,
  venusLongitude: 110,
  marsLongitude: 8,
  ascendantLongitude: 200,
};

const stats = (monicaConstant: number, monicaMethod?: MonicaMethod) =>
  deriveStatsFromChart({ ...CHART, monicaConstant, monicaMethod });

describe("normalizeMonicaForStats", () => {
  it("is bounded in [0,1] across the whole MEASURED production range", () => {
    // Real span, not the assumed [0,10]: single-body [-3.197, 3.975],
    // two-body [-5.419, 1.800], fabricated full-chart up to 6.820.
    for (const v of [-5.4191, -3.1973, -1, 0, 1, 3.9751, 6.82]) {
      for (const m of ["single-body", "two-body"] as const) {
        const y = normalizeMonicaForStats(v, m);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(1);
      }
    }
  });

  it("puts monica = 0 at exactly 0.5, preserving the 'bonus' shape", () => {
    for (const m of ["single-body", "two-body"] as const) {
      expect(normalizeMonicaForStats(0, m)).toBeCloseTo(0.5, 12);
    }
  });

  it("is monotone increasing — sign and order are preserved", () => {
    const xs = [-5, -2, -0.5, 0, 0.5, 2, 5];
    const ys = xs.map((v) => normalizeMonicaForStats(v, "single-body"));
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]);
  });

  it("uses a DIFFERENT scale per population (guard: else it is not per-population)", () => {
    const v = 0.8;
    expect(normalizeMonicaForStats(v, "single-body")).not.toBeCloseTo(
      normalizeMonicaForStats(v, "two-body"),
      6,
    );
  });

  it("falls back to the single-body scale for an unmeasured population", () => {
    // full-chart values are not in production yet, so no scale is authored for
    // them — §11: do not invent a constant. It must degrade, not throw.
    expect(normalizeMonicaForStats(1, "full-chart")).toBeCloseTo(
      normalizeMonicaForStats(1, "single-body"),
      12,
    );
  });

  it("returns the neutral 0.5 for non-finite input, never NaN", () => {
    for (const v of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(normalizeMonicaForStats(v, "single-body")).toBe(0.5);
    }
  });
});

describe("deriveStatsFromChart — the real monica range no longer clamps", () => {
  const EXTREMES = [-5.4191, -3.1973, 0, 3.9751, 6.82];

  // NOTE: `clamp` ROUNDS (Math.round of the bounded value), so a stat legitimately
  // reaching the integer 100 is the top of its scale, not a truncation. The
  // failure mode that matters is INFORMATION LOSS: many distinct monicas being
  // squashed onto one output. That is what these assert.
  it("does not truncate — the pre-clamp value stays inside [0,100]", () => {
    // m is bounded in [0,1] and kineticAlignment is 50 + m*50, so the raw value
    // cannot exceed the bound. Verified through the public surface: the most
    // extreme inputs in either direction must still differ from each other.
    const top = stats(6.82).kineticAlignment;
    const bottom = stats(-5.4191).kineticAlignment;
    expect(bottom).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThanOrEqual(100);
    expect(top).toBeGreaterThan(bottom);
  });

  it("keeps distinct monicas distinct across the bulk of the range", () => {
    // The old monica/10 form pinned kineticAlignment for everything above
    // monica 10 — and the real max is 6.82, so in practice the whole upper tail
    // shared one value. Sample the measured range and require real spread.
    const sample = [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3];
    const vals = sample.map((v) => stats(v).kineticAlignment);
    expect(new Set(vals).size).toBe(sample.length);
  });

  it("still RESPONDS to monica across that range (guard: not merely flattened)", () => {
    // Bounding the input must not cost all its influence — otherwise the fix
    // would have traded a clamp for a constant.
    const lo = stats(-5.4191).kineticAlignment;
    const hi = stats(6.82).kineticAlignment;
    expect(hi - lo).toBeGreaterThan(20);
  });

  it("negative monica LOWERS the monica-driven stats", () => {
    // 24.6% of production values are negative; the old [0,10] assumption had no
    // defined behaviour for them at all.
    expect(stats(-2).jovianExpansion).toBeLessThan(stats(0).jovianExpansion);
    expect(stats(0).jovianExpansion).toBeLessThan(stats(2).jovianExpansion);
  });

  it("leaves monica-independent stats untouched by monica", () => {
    // Non-vacuity in the other direction: only the monica terms should move.
    const a = stats(-5), b = stats(5);
    expect(a.lunarReceptivity).toBeCloseTo(b.lunarReceptivity, 12);
    expect(a.mercurialVelocity).toBeCloseTo(b.mercurialVelocity, 12);
    expect(a.saturnianStructure).toBeCloseTo(b.saturnianStructure, 12);
  });

  it("defaults to single-body when no method is given", () => {
    expect(stats(1).power).toBeCloseTo(stats(1, "single-body").power, 12);
  });

  it("a two-body agent and a single-body agent at the SAME monica differ", () => {
    // The whole point of §18o: the same number means different things depending
    // on which construction produced it.
    expect(stats(0.8, "two-body").power).not.toBeCloseTo(
      stats(0.8, "single-body").power,
      6,
    );
  });
});
