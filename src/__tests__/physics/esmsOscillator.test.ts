/**
 * The oscillator constants are MEASURED, and this is where they are re-measured.
 *
 * ω, the sect fundamentals, and the equilibria x̄ in `esmsOscillator.ts` are
 * literals; this suite rebuilds the exact 8-year sect-demodulated series from
 * the ephemeris and re-derives all of them. If astronomy-engine, the Λ tensor,
 * the sectarian table, or the epoch definition changes, THIS FAILS and names
 * the cause — the constants can never drift into being comments.
 */
import * as Astronomy from "astronomy-engine";
import {
  coherentPacketCenter,
  ESMS_OSCILLATOR_EPOCH,
  OSCILLATOR_BODIES,
  OSCILLATOR_FUNDAMENTAL_DAYS,
  OSCILLATOR_OMEGA_RAD_PER_DAY,
  OSCILLATOR_PERIOD_DAYS,
  OSCILLATOR_X_BAR,
  oscillatorCoordinate,
  oscillatorEnergy,
} from "@/utils/esmsOscillator";

const ASTRO_BODY: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun, Moon: Astronomy.Body.Moon, Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus, Mars: Astronomy.Body.Mars, Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn, Uranus: Astronomy.Body.Uranus, Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/** The exact epoch series, rebuilt from the ephemeris. */
function buildSeries(): { diurnal: number[]; nocturnal: number[] } {
  const start = Date.parse(ESMS_OSCILLATOR_EPOCH.startUtc);
  const stepMs = ESMS_OSCILLATOR_EPOCH.stepHours * 3600 * 1000;
  const out = { diurnal: [] as number[], nocturnal: [] as number[] };
  for (let i = 0; i < ESMS_OSCILLATOR_EPOCH.samples; i++) {
    const t = Astronomy.MakeTime(new Date(start + i * stepMs));
    const dist: Record<string, number> = {};
    for (const body of OSCILLATOR_BODIES) {
      const v = Astronomy.GeoVector(ASTRO_BODY[body], t, true);
      dist[body] = Math.hypot(v.x, v.y, v.z);
    }
    out.diurnal.push(oscillatorCoordinate(dist, true));
    out.nocturnal.push(oscillatorCoordinate(dist, false));
  }
  return out;
}

/** Periodogram argmax over [Tlo, Thi] at the derivation's own grid step. */
function fundamentalDays(x: number[], Tlo: number, Thi: number, step: number): number {
  const mean = x.reduce((s, v) => s + v, 0) / x.length;
  const dm = x.map((v) => v - mean);
  let bestT = 0;
  let bestP = -1;
  for (let T = Tlo; T <= Thi; T += step) {
    let c = 0;
    let s = 0;
    for (let i = 0; i < dm.length; i++) {
      const ph = (2 * Math.PI * i) / T;
      c += dm[i] * Math.cos(ph);
      s += dm[i] * Math.sin(ph);
    }
    const P = (c * c + s * s) / dm.length;
    if (P > bestP) {
      bestP = P;
      bestT = T;
    }
  }
  return bestT;
}

const series = buildSeries();

describe("ESMS oscillator calibration (§8)", () => {
  it("re-derives the sect equilibria x̄ from the ephemeris", () => {
    for (const sect of ["diurnal", "nocturnal"] as const) {
      const x = series[sect];
      expect(x).toHaveLength(ESMS_OSCILLATOR_EPOCH.samples);
      const mean = x.reduce((s, v) => s + v, 0) / x.length;
      expect(mean).toBeCloseTo(OSCILLATOR_X_BAR[sect], 10);
    }
  });

  it("re-derives the periodogram fundamentals per sect", () => {
    for (const sect of ["diurnal", "nocturnal"] as const) {
      const T = fundamentalDays(series[sect], 500, 700, 0.05);
      expect(T).toBeCloseTo(OSCILLATOR_FUNDAMENTAL_DAYS[sect], 6);
    }
  });

  it("identifies the fundamental as the Venus synodic cycle, sect-independently", () => {
    // The INTERPRETATION pin: the measured period sits within 0.5% of the Venus
    // synodic period (583.92 d) — Venus's (r̄/r)² spans 0.35–13.9×, the largest
    // modulation in the tensor. If a Λ change moves the fundamental off the
    // Venus line, the physical story in the module doc is stale and this fails.
    const VENUS_SYNODIC_DAYS = 583.92;
    for (const sect of ["diurnal", "nocturnal"] as const) {
      const rel = Math.abs(OSCILLATOR_FUNDAMENTAL_DAYS[sect] - VENUS_SYNODIC_DAYS) / VENUS_SYNODIC_DAYS;
      expect(rel).toBeLessThan(0.005);
    }
    // Sect independence: the two fundamentals agree to 0.1% — the basis for
    // ruling a SINGLE ω instead of per-sect precision theater.
    const relSect =
      Math.abs(OSCILLATOR_FUNDAMENTAL_DAYS.diurnal - OSCILLATOR_FUNDAMENTAL_DAYS.nocturnal) /
      OSCILLATOR_FUNDAMENTAL_DAYS.diurnal;
    expect(relSect).toBeLessThan(0.001);
  });

  it("derives ω from the ruled period, never assigns it", () => {
    expect(OSCILLATOR_PERIOD_DAYS).toBeCloseTo(
      (OSCILLATOR_FUNDAMENTAL_DAYS.diurnal + OSCILLATOR_FUNDAMENTAL_DAYS.nocturnal) / 2,
      10,
    );
    expect(OSCILLATOR_OMEGA_RAD_PER_DAY).toBe((2 * Math.PI) / OSCILLATOR_PERIOD_DAYS);
  });
});

describe("oscillator coordinate and Hamiltonian", () => {
  const meanSky: Record<string, number> = {
    Sun: 1.0001517506922113, Moon: 0.002571016680904456, Mercury: 1.0527771261580632,
    Venus: 1.0162138470401183, Mars: 1.9442585501420186, Jupiter: 5.429789190115696,
    Saturn: 9.484384119258557, Uranus: 19.49876988921305, Neptune: 29.88354939796314,
    Pluto: 35.52718536398905,
  };

  it("throws on a partial or malformed sky rather than measuring a different observable", () => {
    const { Pluto: _dropped, ...partial } = meanSky;
    expect(() => oscillatorCoordinate(partial, true)).toThrow(/Pluto/);
    expect(() => oscillatorCoordinate({ ...meanSky, Moon: NaN }, true)).toThrow(/Moon/);
    expect(() => oscillatorCoordinate({ ...meanSky, Venus: 0 }, true)).toThrow(/Venus/);
    expect(() => oscillatorCoordinate({ ...meanSky, Venus: -1 }, false)).toThrow(/Venus/);
  });

  it("has its energy minimum exactly at the sect equilibrium", () => {
    for (const diurnal of [true, false]) {
      const xBar = diurnal ? OSCILLATOR_X_BAR.diurnal : OSCILLATOR_X_BAR.nocturnal;
      expect(oscillatorEnergy(xBar, 0, diurnal)).toBe(0);
      expect(oscillatorEnergy(xBar + 1, 0, diurnal)).toBeGreaterThan(0);
      expect(oscillatorEnergy(xBar - 1, 0, diurnal)).toBe(oscillatorEnergy(xBar + 1, 0, diurnal));
      expect(oscillatorEnergy(xBar, 0.1, diurnal)).toBeCloseTo(0.005, 12);
    }
    expect(() => oscillatorEnergy(NaN, 0, true)).toThrow(TypeError);
    expect(() => oscillatorEnergy(0, Infinity, true)).toThrow(TypeError);
  });

  it("transports the coherent packet center on the measured coordinate, not a model", () => {
    // The transport rule IS the identity on the measured coordinate — pinned so
    // nobody swaps in x̄ + A·cos(ωt) and calls it transport.
    expect(coherentPacketCenter(meanSky, true)).toBe(oscillatorCoordinate(meanSky, true));
    // Endpoint pins to the ephemeris: first and last epoch samples.
    for (const idx of [0, ESMS_OSCILLATOR_EPOCH.samples - 1]) {
      const t = Astronomy.MakeTime(
        new Date(Date.parse(ESMS_OSCILLATOR_EPOCH.startUtc) + idx * ESMS_OSCILLATOR_EPOCH.stepHours * 3600 * 1000),
      );
      const dist: Record<string, number> = {};
      for (const body of OSCILLATOR_BODIES) {
        const v = Astronomy.GeoVector(ASTRO_BODY[body], t, true);
        dist[body] = Math.hypot(v.x, v.y, v.z);
      }
      expect(coherentPacketCenter(dist, true)).toBe(series.diurnal[idx]);
      expect(coherentPacketCenter(dist, false)).toBe(series.nocturnal[idx]);
    }
  });
});
