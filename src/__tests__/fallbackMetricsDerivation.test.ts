import { FALLBACK_METRICS } from "@/utils/enhancedCompatibilityScoring";
import samples from "@/data/alchemicalSamples.json";

/**
 * FALLBACK_METRICS must round-trip from the corpus it claims to be measured over.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * The priors were honestly derived and then went ~2x stale in place, and nothing
 * noticed for months. Five of the six numbers still round-tripped exactly
 * against alchemicalSamples.json AS COMMITTED — the file underneath them had
 * been silently replaced. Regenerating it on master changed 1821/1821 samples
 * (the ESMS engine unified onto inertial mass, #695/#710), leaving production
 * z-scoring compatibility against a distribution the engine no longer had:
 * heat +83%, entropy +75%, reactivity +121% with its stdDev +216%.
 *
 * A comment asserting a measurement cannot fail. This can. Whichever side moves
 * next — the corpus or the constants — this test is what says so.
 */

const THERMO_INDEX = { heat: 0, entropy: 1, reactivity: 2 } as const;

/** Decimal places each prior is rounded to. Half a unit in the last place is
 *  therefore the exact tolerance a correct rounding can differ by. */
const DECIMALS: Record<keyof typeof THERMO_INDEX, number> = {
  heat: 3,
  entropy: 3,
  reactivity: 2,
};

type Sample = { thermo: number[] };
const SAMPLES = (samples as unknown as { samples: Sample[]; count: number }).samples;

function column(metric: keyof typeof THERMO_INDEX): number[] {
  return SAMPLES.map((s) => s.thermo[THERMO_INDEX[metric]]).filter(Number.isFinite);
}

/** Population standard deviation (÷N) — the estimator the shipped values use. */
function meanAndSd(v: number[]): { mean: number; sd: number } {
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
  return { mean, sd };
}

describe("FALLBACK_METRICS round-trips from alchemicalSamples.json", () => {
  it("POSITIVE CONTROL: the corpus really loaded, and is the size it claims", () => {
    // Without this, every assertion below could pass vacuously over an empty or
    // half-parsed array — a green suite proving nothing, which is precisely the
    // failure mode this file exists to end.
    expect(Array.isArray(SAMPLES)).toBe(true);
    expect(SAMPLES.length).toBe(1821);
    expect((samples as unknown as { count: number }).count).toBe(SAMPLES.length);

    for (const metric of Object.keys(THERMO_INDEX) as (keyof typeof THERMO_INDEX)[]) {
      const v = column(metric);
      // Every sample present and finite — a silently-dropped column would shift
      // the mean without failing anything else here.
      expect(v.length).toBe(SAMPLES.length);
      // And genuinely varying, so a stdDev assertion is not a test against 0.
      expect(new Set(v).size).toBeGreaterThan(100);
    }
  });

  it.each(["heat", "entropy", "reactivity"] as const)(
    "%s: shipped prior is the measured mean/stdDev, correctly rounded",
    (metric) => {
      const { mean, sd } = meanAndSd(column(metric));
      const shipped = FALLBACK_METRICS[metric];
      const tolerance = 0.5 * 10 ** -DECIMALS[metric];

      expect(shipped).toBeDefined();
      expect(Math.abs(shipped.mean - mean)).toBeLessThanOrEqual(tolerance);
      expect(Math.abs(shipped.stdDev - sd)).toBeLessThanOrEqual(tolerance);
    },
  );

  it("pins the exact measurement, so a corpus regen is visible even if rounding hides it", () => {
    // The rounded check above tolerates half a unit in the last place, which is
    // enough room for a real corpus shift to slip through on the low-precision
    // reactivity entry. These pin the underlying numbers directly.
    const heat = meanAndSd(column("heat"));
    const entropy = meanAndSd(column("entropy"));
    const reactivity = meanAndSd(column("reactivity"));

    expect(heat.mean).toBeCloseTo(0.122523942888523, 12);
    expect(heat.sd).toBeCloseTo(0.076266646038866, 12);
    expect(entropy.mean).toBeCloseTo(0.392861153212521, 12);
    expect(entropy.sd).toBeCloseTo(0.262027323027900, 12);
    expect(reactivity.mean).toBeCloseTo(14.454043717737505, 10);
    expect(reactivity.sd).toBeCloseTo(21.865234800984545, 10);
  });

  it("NEGATIVE CONTROL: the tolerance is tight enough to reject the STALE priors", () => {
    // The values this PR replaced. If the assertions above would also pass with
    // these, they would not have caught the drift they exist to catch.
    const stale = {
      heat: { mean: 0.067, stdDev: 0.037 },
      entropy: { mean: 0.225, stdDev: 0.101 },
      reactivity: { mean: 6.54, stdDev: 6.91 },
    };
    for (const metric of Object.keys(stale) as (keyof typeof stale)[]) {
      const { mean, sd } = meanAndSd(column(metric));
      const tolerance = 0.5 * 10 ** -DECIMALS[metric];
      expect(Math.abs(stale[metric].mean - mean)).toBeGreaterThan(tolerance);
      expect(Math.abs(stale[metric].stdDev - sd)).toBeGreaterThan(tolerance);
    }
  });

  it("records which priors have NO basis, so their neighbours' provenance is not borrowed", () => {
    // power/currentFlow/charge are live (projectZScoreTarget is called with all
    // three) but no kinetics corpus exists to derive them from. Pinned as a
    // standing marker: if a corpus ever lands, this is where to start.
    for (const key of ["power", "currentFlow", "charge"]) {
      expect(FALLBACK_METRICS[key]).toBeDefined();
    }
    const thermoKeys = Object.keys(THERMO_INDEX);
    const sampleFields = new Set(
      Object.keys(SAMPLES[0] as unknown as Record<string, unknown>),
    );
    // The claim that they are underivable HERE, asserted rather than narrated.
    expect(sampleFields.has("kinetics")).toBe(false);
    expect(thermoKeys).not.toContain("power");
    expect(SAMPLES[0].thermo.length).toBe(6); // heat,entropy,reactivity,gregsEnergy,kalchm,monica
  });

  it("leaves the RULED equilibrium anchors alone", () => {
    // Deliberately not sample means — 1.0 is the multiplicative identity.
    expect(FALLBACK_METRICS.kalchm).toEqual({ mean: 1.0, stdDev: 0.5 });
    expect(FALLBACK_METRICS.monica).toEqual({ mean: 1.0, stdDev: 0.5 });
  });
});
