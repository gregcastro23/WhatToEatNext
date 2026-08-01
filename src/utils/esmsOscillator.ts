/**
 * The ESMS harmonic oscillator — §8 of the wave-function spec, RULED destination.
 *
 * The oscillator coordinate is x = ln(kalchm) of the INTEGRATED sky vector K
 * under the RULED Λ = diag(M̂·(r̄/r)²) tensor. It genuinely oscillates about a
 * sect-conditional equilibrium — unlike planetary longitudes, which circulate
 * and would need an invented ω.
 *
 *   Ĥ = p²/2m + ½ m ω² (x − x̄_sect)²
 *
 * ── Every constant below is MEASURED, and re-measured by test ───────────────
 *
 * Epoch: daily series (noon UTC), 2026-01-01 → 2033-12-31 (2922 samples, 5.0
 * Venus synodic cycles — §8 requires ≥ 2). Sect-DEMODULATED: the day/night ESMS
 * reallocation is a 1-day square wave that would bury the distance physics, so
 * x(t) is computed at fixed sect, both sects. Bodies only, no Ascendant vessel:
 * the sky has no observer, so the OSCILLATOR series carries no vessel term
 * (natal charts do — this module is about the sky's time dynamics).
 *
 * MEASURED spectrum (periodogram, both sects):
 *   fundamental  T = 586.30 d (diurnal) / 585.90 d (nocturnal)
 *                — within 0.4% of the VENUS SYNODIC PERIOD (583.92 d), and
 *                sect-independent to 0.07%. The oscillator is the Venus
 *                distance cycle: Venus's (r̄/r)² factor spans 0.35–13.9×, the
 *                largest modulation in the tensor by an order of magnitude.
 *   harmonics    291.5 d ≈ T/2, 146 d ≈ T/4 — the (r̄/r)² waveform is
 *                non-sinusoidal, so the Venus line carries a harmonic series.
 *   Mercury      115.0–116.5 d — Mercury's synodic period (115.88 d), resolved
 *                exactly where §8 predicted it.
 *
 * ω is the mean of the two sect fundamentals (they differ by 0.07%, so a
 * per-sect ω would be precision theater): T = 586.10 d.
 *
 * `esmsOscillator.test.ts` re-derives the fundamentals, the equilibria, and the
 * Venus identification from the ephemeris on every run.
 *
 * ── RULED conventions (choices, named as such) ──────────────────────────────
 *   m = 1           — the oscillator mass has no measured basis; H is used only
 *                     for RELATIVE energies, where m cancels out of comparisons.
 *   coherent only   — the shipped Gaussian packets have fixed σ, which IS the
 *                     coherent state (σ = σ₀, no spreading). Squeezed states
 *                     (width breathing at 2ω) stay OUT OF SCOPE until a
 *                     measurable basis for σ-dynamics exists; a breathing width
 *                     with an assigned rate would be a fabricated constant
 *                     wearing physics clothing (§8.4).
 */

import { calculateKalchm } from "@/data/unified/alchemicalCalculations";
import type { AlchemicalProperties } from "@/types/celestial";
import {
  getGravitationalInertia,
  PLANETARY_SECTARIAN_ESMS,
} from "./planetaryAlchemyMapping";

/** The measured oscillator epoch — stated as data so the test rebuilds it exactly. */
export const ESMS_OSCILLATOR_EPOCH = {
  /** Noon UTC of the first daily sample. */
  startUtc: "2026-01-01T12:00:00.000Z",
  /** Daily samples: 8 years, 5.0 Venus synodic cycles. */
  samples: 2922,
  stepHours: 24,
} as const;

/** MEASURED periodogram fundamentals per sect, days. */
export const OSCILLATOR_FUNDAMENTAL_DAYS = {
  diurnal: 586.3,
  nocturnal: 585.9,
} as const;

/** The RULED single period: mean of the sect fundamentals (0.07% apart). */
export const OSCILLATOR_PERIOD_DAYS = 586.1;

/** ω = 2π / T, rad/day. DERIVED from OSCILLATOR_PERIOD_DAYS — never assigned. */
export const OSCILLATOR_OMEGA_RAD_PER_DAY = (2 * Math.PI) / OSCILLATOR_PERIOD_DAYS;

/**
 * MEASURED sect equilibria x̄ — the epoch means of x(t). The well minima of the
 * two sect potentials. Re-derived by test.
 */
export const OSCILLATOR_X_BAR = {
  diurnal: 6.524452527444266,
  nocturnal: -4.093659600581897,
} as const;

/** The ten oscillator bodies — the charted set, no vessel (see module note). */
export const OSCILLATOR_BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

export interface OscillatorBodyState {
  /** Geocentric distance in AU. Required — the oscillator IS distance dynamics. */
  distanceAu: number;
}

/**
 * The oscillator coordinate x = ln(kalchm(K)) for a sky described by per-body
 * geocentric distances, at a fixed sect.
 *
 * THROWS on a missing body or non-finite/non-positive distance — an oscillator
 * coordinate from a partial sky would be a silently different observable, not a
 * degraded one (§18k k7).
 */
export function oscillatorCoordinate(
  bodyDistancesAu: Record<string, number>,
  isDiurnal: boolean,
): number {
  const sect = isDiurnal ? "diurnal" : "nocturnal";
  const K: AlchemicalProperties = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  for (const body of OSCILLATOR_BODIES) {
    const r = bodyDistancesAu[body];
    if (!Number.isFinite(r) || r <= 0) {
      throw new TypeError(
        `oscillatorCoordinate: body "${body}" needs a positive finite distance, got ${String(r)}`,
      );
    }
    const inertia = getGravitationalInertia(body, r);
    const se = PLANETARY_SECTARIAN_ESMS[body][sect];
    K.Spirit += se.Spirit * inertia;
    K.Essence += se.Essence * inertia;
    K.Matter += se.Matter * inertia;
    K.Substance += se.Substance * inertia;
  }
  return Math.log(calculateKalchm(K));
}

/**
 * The Hamiltonian: H(x, p) = p²/2 + ½ ω² (x − x̄_sect)², with the RULED m = 1.
 * Total energy of an oscillator state; the well minimum (p = 0, x = x̄) is 0.
 */
export function oscillatorEnergy(x: number, p: number, isDiurnal: boolean): number {
  if (!Number.isFinite(x) || !Number.isFinite(p)) {
    throw new TypeError(`oscillatorEnergy: x and p must be finite, got x=${String(x)} p=${String(p)}`);
  }
  const xBar = isDiurnal ? OSCILLATOR_X_BAR.diurnal : OSCILLATOR_X_BAR.nocturnal;
  const d = x - xBar;
  return (p * p) / 2 + 0.5 * OSCILLATOR_OMEGA_RAD_PER_DAY * OSCILLATOR_OMEGA_RAD_PER_DAY * d * d;
}

/**
 * Coherent-state transport: the packet CENTER at time t is the measured
 * oscillator coordinate itself — centers ride the real ephemeris, never a
 * modeled trajectory (§8.3: "endpoints pinned to astronomy-engine — the
 * transport rule is the only new machinery, no invented positions"). The
 * classical analogy (packet sloshing in the well at ω) is the INTERPRETATION of
 * that motion, not its source; using x̄ + A·cos(ωt) would replace measurement
 * with model. This function is the SpacetimeDB live-layer interpolant's anchor:
 * interpolate BETWEEN two measured coordinates, never extrapolate a cosine.
 */
export function coherentPacketCenter(
  bodyDistancesAu: Record<string, number>,
  isDiurnal: boolean,
): number {
  return oscillatorCoordinate(bodyDistancesAu, isDiurnal);
}
