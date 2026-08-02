import fs from "fs";
import path from "path";

import { alchemizeDetailed } from "@/services/RealAlchemizeService";
import { inertialMassWeight } from "@/utils/planetaryAlchemyMapping";

/**
 * ADR-009 decision 5 (partial): momentum's weight scale.
 *
 * RealAlchemizeService carried its OWN copy of PLANET_ALCHM_PERIODS /
 * normalizeAlchmWeight, byte-identical to the one in src/data/planets.ts. A
 * private duplicate is exactly how the two runtimes drifted apart before: PR
 * #697 deleted the orbital-period table from Python's backend/utils/ and left
 * main.py's inline copy running for a month, so production served two different
 * weight scales split by endpoint (ADR-009 decision 4).
 *
 * Its only consumer here was `planetaryMomentum`. ESMS comes from the canonical
 * inertial engine (`engine.totals`) and the elementals from the flat 0.6/0.4
 * sign/sect split, so this migration moves momentum and nothing else.
 *
 * ── Why these tests are shaped this way ─────────────────────────────────────
 *
 * Momentum is not stored in any artifact: regenerating alchemicalSamples.json
 * before and after this change produced BYTE-IDENTICAL files (MEASURED
 * 2026-08-02, same --anchor). That is the correct result — the file has no
 * momentum field — but it is also exactly what a change that never executed
 * would produce. So the scale is asserted through the OUTPUT, recovering the
 * weight from momentum itself, and a positive control proves the two scales
 * actually disagree so the assertion can fail.
 */

const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant",
];

/** Every body moves by exactly this, so the ONLY thing separating their
 *  momenta is the weight. */
const DELTA_DEGREES = 2;

function sky() {
  const now: Record<string, any> = {};
  const hist: Record<string, any> = {};
  BODIES.forEach((b, i) => {
    const lon = (i % 12) * 30 + 10;
    now[b] = { sign: SIGNS[i % 12], degree: 10, minute: 0, exactLongitude: lon };
    hist[b] = { sign: SIGNS[i % 12], degree: 8, minute: 0, exactLongitude: lon - DELTA_DEGREES };
  });
  return { now, hist };
}

/**
 * The scale this module used to apply, kept ONLY to assert we no longer land on
 * it. This imported from @/data/planets until ADR-009 decision 5b deleted the
 * table outright (two-body monica was its last consumer), so it is now a FROZEN
 * private copy — a historical record. Nothing may compute with it.
 *
 * Note the rank inversion it encodes: Pluto's 247.94 IS the log-scale maximum,
 * so Pluto normalized to exactly 1.0 while the Sun sat at 0.5131.
 */
const RETIRED_PERIODS: Record<string, number> = {
  Pluto: 247.94, Neptune: 164.79, Uranus: 84.01, Saturn: 29.46, Jupiter: 11.86,
  Mars: 1.88, Sun: 1.0, Venus: 0.615, Mercury: 0.241, Moon: 0.075,
  Ascendant: 0.003,
};
const RETIRED_LOG_MIN = Math.log10(0.003);
const RETIRED_LOG_MAX = Math.log10(247.94);

function periodWeight(planet: string): number {
  if (planet === "Ascendant") return 1.0;
  const p = RETIRED_PERIODS[planet] ?? 1.0;
  return (
    (Math.log10(Math.max(p, 1e-9)) - RETIRED_LOG_MIN) /
    (RETIRED_LOG_MAX - RETIRED_LOG_MIN)
  );
}

describe("ADR-009 decision 5 — momentum rides the inertial mass scale", () => {
  it("POSITIVE CONTROL: the two scales genuinely disagree, so these tests can fail", () => {
    const disagreeing = BODIES.filter(
      (b) => Math.abs(inertialMassWeight(b) - periodWeight(b)) > 1e-6,
    );
    // Only the Ascendant coincides — it is the RULED vessel weight 1.0 under
    // both. If this ever collapsed to zero disagreeing bodies, every assertion
    // below would pass vacuously against two identical scales.
    expect(disagreeing.length).toBe(BODIES.length - 1);
    expect(disagreeing).not.toContain("Ascendant");
  });

  it("recovers the INERTIAL weight from momentum, for every body", () => {
    const { now, hist } = sky();
    const r = alchemizeDetailed(now, hist, new Date("2026-07-12T06:00:00.000Z"));

    for (const b of BODIES) {
      const m = r.planetaryMomentum[b];
      expect(typeof m).toBe("number");
      // momentum = delta * weight, and delta is 2 by construction.
      expect(m / DELTA_DEGREES).toBeCloseTo(inertialMassWeight(b), 12);
    }
  });

  it("does NOT land on the orbital-period weight", () => {
    const { now, hist } = sky();
    const r = alchemizeDetailed(now, hist, new Date("2026-07-12T06:00:00.000Z"));

    // Every body EXCEPT the Ascendant, where the two scales legitimately agree.
    for (const b of BODIES.filter((x) => x !== "Ascendant")) {
      const recovered = r.planetaryMomentum[b] / DELTA_DEGREES;
      expect(Math.abs(recovered - periodWeight(b))).toBeGreaterThan(1e-6);
    }
  });

  it("puts the Sun above Pluto — the period scale had it inverted", () => {
    const { now, hist } = sky();
    const r = alchemizeDetailed(now, hist, new Date("2026-07-12T06:00:00.000Z"));
    const sun = r.planetaryMomentum.Sun / DELTA_DEGREES;
    const pluto = r.planetaryMomentum.Pluto / DELTA_DEGREES;

    expect(sun).toBeGreaterThan(pluto);
    // Pluto sits exactly one decade above the anchor by construction, so its
    // weight is 1/range and the ratio IS the log range. Under the period scale
    // this was 0.513 — Pluto the heaviest body in every chart.
    expect(sun / pluto).toBeCloseTo(9.180092303273348, 9);
  });

  it("no longer keeps a PRIVATE copy of the period table", () => {
    // Structural, because the cheapest way to undo this migration is to paste
    // the table back in rather than to change a number.
    const src = fs.readFileSync(
      path.resolve(__dirname, "../services/RealAlchemizeService.ts"),
      "utf8",
    );
    // POSITIVE CONTROL — the file was really read and is substantial, so the
    // absence assertions below are real rather than a silent empty string.
    expect(src.length).toBeGreaterThan(10_000);
    expect(src).toContain("alchemizeDetailed");

    // Declarations, not mentions: the REMOVED note deliberately names them.
    expect(src).not.toMatch(/const\s+PLANET_ALCHM_PERIODS\s*:/);
    expect(src).not.toMatch(/const\s+PERIOD_LOG_(MIN|MAX)\s*=/);
    expect(src).not.toMatch(/function\s+normalizeAlchmWeight\s*\(/);
  });
});
