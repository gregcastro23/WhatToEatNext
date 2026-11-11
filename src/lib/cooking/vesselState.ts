/**
 * The Hermetic Vessel's control state, shared by the SI panel on
 * /kitchen-lab/physics and the alchm simulator on /kitchen-lab/alchm.
 *
 * It holds inputs only — four SI quantities a cook can set. Every reading is
 * derived from them elsewhere (`thermoVessel.ts` for physics, the cauldron
 * core for the alchm circuit), so the two pages can never disagree about
 * which vessel they are describing.
 *
 * BASIS for the ranges: RULED 2026-11-11 (10–250 kPa, 20–260 °C, 0–100 % RH).
 * The headspace-temperature control is not in that ruling; it exists because
 * the vapour-pressure deficit needs the temperature of the air the humidity
 * is measured in, and without it Δp_v would reduce to (1 − φ)·p_sat.
 *
 * @file src/lib/cooking/vesselState.ts
 */

export interface VesselState {
  /** Absolute vessel pressure, kPa. */
  pressureKpa: number;
  /** Vessel (food and liquid) temperature setpoint, °C. */
  temperatureC: number;
  /** Relative humidity of the headspace, % (0–100). */
  humidityPct: number;
  /** Temperature of the headspace gas the humidity refers to, °C. */
  headspaceC: number;
}

export interface ControlRange {
  min: number;
  max: number;
  step: number;
}

export const VESSEL_RANGES: Readonly<Record<keyof VesselState, ControlRange>> = {
  pressureKpa: { min: 10, max: 250, step: 0.5 },
  temperatureC: { min: 20, max: 260, step: 1 },
  humidityPct: { min: 0, max: 100, step: 1 },
  headspaceC: { min: 5, max: 260, step: 1 },
};

/**
 * Default vessel: an open pot at sea level. 101.325 kPa is the ISA standard
 * atmosphere (a defined constant); 100 °C, 50 % RH and a 25 °C kitchen are
 * RULED starting points, not measurements.
 */
export const DEFAULT_VESSEL: Readonly<VesselState> = {
  pressureKpa: 101.325,
  temperatureC: 100,
  humidityPct: 50,
  headspaceC: 25,
};

/** One preset vessel, so a cook can jump to a recognisable configuration. */
export interface VesselPreset {
  id: "open" | "sealed" | "vacuum" | "dry_sear";
  label: string;
  state: VesselState;
}

/**
 * Presets. The open pot uses the ISA sea-level pressure (a defined constant).
 * The other two are RULED representative settings, not cited equipment
 * ratings: 205 kPa absolute is 101.325 kPa plus 15 psi of gauge pressure
 * (15 × 6.894757 kPa), and 20 kPa is a deep kitchen vacuum. The pressure
 * cooker's setpoint sits at its own IF97 boiling point (~121 °C), so the
 * preset shows the saturation ceiling rather than an arbitrary temperature.
 */
export const VESSEL_PRESETS: readonly VesselPreset[] = [
  { id: "open", label: "Classic Simmer", state: { pressureKpa: 101.325, temperatureC: 100, humidityPct: 50, headspaceC: 25 } },
  { id: "sealed", label: "Pressure Autoclave", state: { pressureKpa: 205, temperatureC: 121, humidityPct: 100, headspaceC: 121 } },
  { id: "vacuum", label: "Vacuum Hydrosol", state: { pressureKpa: 20, temperatureC: 60, humidityPct: 30, headspaceC: 25 } },
  { id: "dry_sear", label: "Dry Maillard Roast", state: { pressureKpa: 101.325, temperatureC: 185, humidityPct: 12, headspaceC: 25 } },
];

function clampTo(value: number, range: ControlRange): number {
  if (!Number.isFinite(value)) return range.min;
  return Math.min(range.max, Math.max(range.min, value));
}

/** Clamp every field into its control range; non-finite inputs fall to the range floor. */
export function clampVesselState(state: VesselState): VesselState {
  return {
    pressureKpa: clampTo(state.pressureKpa, VESSEL_RANGES.pressureKpa),
    temperatureC: clampTo(state.temperatureC, VESSEL_RANGES.temperatureC),
    humidityPct: clampTo(state.humidityPct, VESSEL_RANGES.humidityPct),
    headspaceC: clampTo(state.headspaceC, VESSEL_RANGES.headspaceC),
  };
}
