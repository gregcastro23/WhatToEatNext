/**
 * International Standard Atmosphere — elevation ↔ pressure.
 *
 * This is the DERIVED trunk of the Dual-Baseline Engine. Elevation sets a
 * location's permanent pressure baseline; live weather only ever perturbs it.
 * The relative scale matters and is easy to get backwards:
 *
 *   Denver (1609 m)          →  83.4 kPa  →  −17.9 kPa vs sea level
 *   A hurricane at sea level →  95.0 kPa  →   −6.3 kPa vs sea level
 *
 * Geography outweighs even extreme weather by roughly 3×, and outweighs a
 * routine daily swing by an order of magnitude.
 *
 * Valid through the troposphere (~11 km). Every populated place on Earth is
 * well inside that; the highest permanent settlement is ~5.1 km.
 *
 * @file src/lib/environment/isa.ts
 */

/** Standard sea-level pressure, ISA. */
export const SEA_LEVEL_PRESSURE_KPA = 101.325;

/**
 * ISA troposphere exponent, g·M/(R·L).
 * 9.80665 × 0.0289644 / (8.31447 × 0.0065) = 5.25588
 */
const ISA_EXPONENT = 5.25588;

/** L/T0 = 0.0065 K/m / 288.15 K = 2.25577e-5 per metre. */
const ISA_LAPSE_RATIO = 2.25577e-5;

/** Upper bound of the ISA troposphere model, in metres. */
const ISA_TROPOSPHERE_CEILING_M = 11_000;

/**
 * Pressure at a given elevation under the standard atmosphere.
 *
 * This is the *climatic baseline* pressure, not a live reading. It answers
 * "what does this location normally sit at", which is the denominator the daily
 * anomaly is measured against.
 *
 * @param elevationM Metres above mean sea level.
 * @returns Absolute pressure in kPa.
 */
export function pressureFromElevation(elevationM: number): number {
  if (!Number.isFinite(elevationM)) {
    throw new RangeError(`elevationM must be finite, received ${elevationM}`);
  }
  if (elevationM > ISA_TROPOSPHERE_CEILING_M) {
    throw new RangeError(
      `elevationM ${elevationM} exceeds the ISA troposphere ceiling (${ISA_TROPOSPHERE_CEILING_M} m); ` +
        `the model does not apply above the tropopause`,
    );
  }
  return SEA_LEVEL_PRESSURE_KPA * Math.pow(1 - ISA_LAPSE_RATIO * elevationM, ISA_EXPONENT);
}

/**
 * Inverse: the elevation whose standard pressure equals `pressureKpa`.
 *
 * Useful as a sanity check on a station reading, NOT as a way to recover a
 * user's true elevation — real weather moves surface pressure by a few kPa,
 * which is hundreds of metres of apparent elevation. Elevation must come from
 * a DEM lookup; this function exists to cross-check, not to substitute.
 *
 * @param pressureKpa Absolute pressure in kPa.
 * @returns Metres above mean sea level under ISA.
 */
export function elevationFromPressure(pressureKpa: number): number {
  if (!Number.isFinite(pressureKpa) || pressureKpa <= 0) {
    throw new RangeError(`pressureKpa must be a positive finite number, received ${pressureKpa}`);
  }
  const ratio = Math.pow(pressureKpa / SEA_LEVEL_PRESSURE_KPA, 1 / ISA_EXPONENT);
  return (1 - ratio) / ISA_LAPSE_RATIO;
}

/**
 * Minimum gap between a location's ISA baseline and sea-level standard for the
 * MSLP check below to mean anything. 7 kPa corresponds to roughly 600 m.
 *
 * Below that, ordinary synoptic weather (±3.5 kPa) can move a genuine station
 * reading further from its baseline than the MSLP offset would — the two
 * hypotheses become indistinguishable, and any verdict would be a coin flip
 * dressed up as a check.
 */
const MSLP_DISCRIMINATION_FLOOR_KPA = 7;

/**
 * Guard against the single most likely silent failure in this subsystem:
 * ingesting sea-level-adjusted pressure (MSLP / QNH) where station pressure is
 * required.
 *
 * MSLP has the altitude signal removed by construction — it extrapolates the
 * station reading down to sea level using an ISA lapse rate. Feed it to a
 * boiling-point solver and Denver returns ~100 °C, which looks entirely
 * plausible and is wrong everywhere except the coast.
 *
 * ── Why this is discriminative rather than a tolerance band ─────────────────
 *
 * A fixed band around the ISA baseline cannot work. It has to be wide enough to
 * admit a real hurricane (950 hPa is 6.3 kPa below standard, and the record low
 * is 14.3 kPa below) yet narrow enough to reject an MSLP reading — and at low
 * elevations those two ranges overlap completely.
 *
 * So this asks the discriminating question instead: is the reading closer to
 * sea-level standard than to where this elevation says it should be? That
 * separates the two hypotheses directly, and at high elevation the gap is
 * enormous. `[MEASURED 2026-07-30]` Denver at 1599 m:
 *
 *     surface_pressure  84.04 kPa → 0.5 kPa from baseline, 17.3 from sea level
 *     pressure_msl     100.60 kPa → 17.1 kPa from baseline, 0.7 from sea level
 *
 * ── What it cannot do ───────────────────────────────────────────────────────
 *
 * Near sea level it returns "plausible" unconditionally, because there is
 * genuinely nothing to detect: MSLP and station pressure converge as elevation
 * approaches zero, which is also why the trap causes little error there. This
 * is a guard for elevated locations — where the bug actually matters — and it
 * declines to guess everywhere else rather than inventing a verdict.
 *
 * @param pressureKpa The value claiming to be station/surface pressure.
 * @param elevationM Known elevation of the location.
 * @returns false only when the reading is better explained as sea-level-adjusted.
 */
export function isPlausibleStationPressure(pressureKpa: number, elevationM: number): boolean {
  const expected = pressureFromElevation(elevationM);

  // Too low for the two hypotheses to be distinguishable — decline to judge.
  if (Math.abs(expected - SEA_LEVEL_PRESSURE_KPA) < MSLP_DISCRIMINATION_FLOOR_KPA) {
    return true;
  }

  const distanceToExpected = Math.abs(pressureKpa - expected);
  const distanceToSeaLevel = Math.abs(pressureKpa - SEA_LEVEL_PRESSURE_KPA);
  return distanceToExpected <= distanceToSeaLevel;
}
