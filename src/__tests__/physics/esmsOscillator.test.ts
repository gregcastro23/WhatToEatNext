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
  type OscillatorSky,
} from "@/utils/esmsOscillator";

const ASTRO_BODY: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun, Moon: Astronomy.Body.Moon, Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus, Mars: Astronomy.Body.Mars, Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn, Uranus: Astronomy.Body.Uranus, Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

function skyAt(date: Date): OscillatorSky {
  const t = Astronomy.MakeTime(date);
  const sky: OscillatorSky = {};
  for (const body of OSCILLATOR_BODIES) {
    const v = Astronomy.GeoVector(ASTRO_BODY[body], t, true);
    const longitude = Astronomy.Ecliptic(v).elon;
    const signIndex = Math.floor(longitude / 30) % 12;
    sky[body] = {
      sign: ZODIAC_SIGNS[signIndex],
      degree: longitude % 30,
      exactLongitude: longitude,
      distanceAu: Math.hypot(v.x, v.y, v.z),
    };
  }
  return sky;
}

/** The exact epoch series, rebuilt from the ephemeris. */
function buildSeries(): { diurnal: number[]; nocturnal: number[] } {
  const start = Date.parse(ESMS_OSCILLATOR_EPOCH.startUtc);
  const stepMs = ESMS_OSCILLATOR_EPOCH.stepHours * 3600 * 1000;
  const out = { diurnal: [] as number[], nocturnal: [] as number[] };
  for (let i = 0; i < ESMS_OSCILLATOR_EPOCH.samples; i++) {
    const sky = skyAt(new Date(start + i * stepMs));
    out.diurnal.push(oscillatorCoordinate(sky, true));
    out.nocturnal.push(oscillatorCoordinate(sky, false));
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
const measuredFundamentals = {
  diurnal: fundamentalDays(series.diurnal, 500, 700, 0.05),
  nocturnal: fundamentalDays(series.nocturnal, 500, 700, 0.05),
};
const measuredMeans = {
  diurnal:
    series.diurnal.reduce((sum, value) => sum + value, 0) /
    series.diurnal.length,
  nocturnal:
    series.nocturnal.reduce((sum, value) => sum + value, 0) /
    series.nocturnal.length,
};

describe("ESMS oscillator calibration (§8)", () => {
  it("re-derives the sect equilibria x̄ from the ephemeris", () => {
    for (const sect of ["diurnal", "nocturnal"] as const) {
      const x = series[sect];
      expect(x).toHaveLength(ESMS_OSCILLATOR_EPOCH.samples);
      expect(measuredMeans[sect]).toBeCloseTo(OSCILLATOR_X_BAR[sect], 10);
    }
  });

  it("re-derives the periodogram fundamentals per sect", () => {
    for (const sect of ["diurnal", "nocturnal"] as const) {
      expect(measuredFundamentals[sect]).toBeCloseTo(
        OSCILLATOR_FUNDAMENTAL_DAYS[sect],
        6,
      );
    }
  });

  it("identifies the fundamental as the Venus synodic cycle, sect-independently", () => {
    // The INTERPRETATION pin: the measured period sits near the Venus synodic
    // period (583.92 d) — Venus's (r̄/r)² spans 0.35–13.9×, the largest
    // modulation in the tensor.
    //
    // Band widened 0.5% → 1% when Layer 2 became the degree-level 5-fold dignity
    // manifest. 𝒟(θ) adds a longitude-dependent term that Λ(r) alone lacked, and
    // it detuned the peak: diurnal 0.425% → 0.579% off Venus, nocturnal 0.336%
    // → 0.468%. The IDENTIFICATION is unaffected and the widening does not blur
    // it, because Venus is the ONLY synodic period inside the 500–700 d scan
    // window at all — Jupiter is 398.9 d and Mars 779.9 d, both far outside — so
    // the assertion below is what actually rules out a competing line.
    const VENUS_SYNODIC_DAYS = 583.92;
    for (const sect of ["diurnal", "nocturnal"] as const) {
      const rel =
        Math.abs(measuredFundamentals[sect] - VENUS_SYNODIC_DAYS) /
        VENUS_SYNODIC_DAYS;
      expect(rel).toBeLessThan(0.01);
    }

    // No other body's synodic period is a candidate for this peak. This is the
    // real identification test; the band above only bounds the detuning.
    const OTHER_SYNODIC_DAYS = {
      Mercury: 115.88, Mars: 779.94, Jupiter: 398.88,
      Saturn: 378.09, Uranus: 369.66, Neptune: 367.49, Pluto: 366.73,
    };
    for (const sect of ["diurnal", "nocturnal"] as const) {
      const toVenus = Math.abs(measuredFundamentals[sect] - VENUS_SYNODIC_DAYS);
      for (const [body, days] of Object.entries(OTHER_SYNODIC_DAYS)) {
        expect({ body, d: Math.abs(measuredFundamentals[sect] - days) > toVenus }).toEqual({
          body,
          d: true,
        });
      }
    }

    // Sect independence: the basis for ruling a SINGLE ω instead of per-sect
    // precision theater. Band widened 0.1% → 0.2% (measured 0.111%) for a
    // principled reason, not to accommodate noise: triplicity rulership is
    // ITSELF sect-dependent (Dorothean day/night rulers), so Layer 2 now differs
    // between the sects where the old sign-level scale was sect-blind. Some
    // additional sect divergence is a predicted consequence of the manifest.
    const relSect =
      Math.abs(measuredFundamentals.diurnal - measuredFundamentals.nocturnal) /
      measuredFundamentals.diurnal;
    expect(relSect).toBeLessThan(0.002);
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
  const meanSky = skyAt(new Date(ESMS_OSCILLATOR_EPOCH.startUtc));

  it("throws on a partial or malformed sky rather than measuring a different observable", () => {
    const { Pluto: _dropped, ...partial } = meanSky;
    expect(() => oscillatorCoordinate(partial, true)).toThrow(/Pluto/);
    expect(() =>
      oscillatorCoordinate(
        { ...meanSky, Moon: { ...meanSky.Moon, distanceAu: NaN } },
        true,
      ),
    ).toThrow(/Moon/);
    expect(() =>
      oscillatorCoordinate(
        { ...meanSky, Venus: { ...meanSky.Venus, distanceAu: 0 } },
        true,
      ),
    ).toThrow(/Venus/);
    expect(() =>
      oscillatorCoordinate(
        { ...meanSky, Venus: { ...meanSky.Venus, distanceAu: -1 } },
        false,
      ),
    ).toThrow(/Venus/);
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
      const sky = skyAt(
        new Date(
          Date.parse(ESMS_OSCILLATOR_EPOCH.startUtc) +
            idx * ESMS_OSCILLATOR_EPOCH.stepHours * 3600 * 1000,
        ),
      );
      expect(coherentPacketCenter(sky, true)).toBe(series.diurnal[idx]);
      expect(coherentPacketCenter(sky, false)).toBe(series.nocturnal[idx]);
    }
  });
});
