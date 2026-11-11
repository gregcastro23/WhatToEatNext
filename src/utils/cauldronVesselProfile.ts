import { COOKING_REGIMES } from "@/lib/cooking/cookingRegimes";
import { saturationTemperatureC } from "@/lib/cooking/if97";
import { formatFixed, type VesselReading } from "@/lib/cooking/thermoVessel";
import { VESSEL_RANGES, type VesselState } from "@/lib/cooking/vesselState";
import type { CookingMethodKineticProfile } from "@/types/cookingMethod";

/**
 * The alchm cauldron's kinetic profile, read off the SI vessel.
 *
 * The tilt-skillet planner ran every batch through one fixed hand-set
 * profile (V 0.78, I 0.82, R 0.18 …). Here each of the six fields is a
 * function of a reading the physics page computes from IAPWS-IF97 and the
 * cited regimes, so the alchm circuit moves when the real vessel moves.
 *
 * ## Basis
 *
 * Every input is COMPUTED (SI, from `readVessel`). Every MAPPING — which SI
 * reading drives which alchm field, and how it is scaled onto 0–1 — is
 * RULED, not measured: an alchm quantity has no physical unit to calibrate
 * against. The mappings below are PROPOSED 2026-11-11 and await the owner's
 * ruling; each one is returned with its formula so the page can show it.
 * None is a placeholder midpoint — the kinetics engine refuses those.
 *
 * Both scaled temperatures share one anchor, the vessel's 20 °C floor, so a
 * cold vessel has no thermal drive and the steam ceiling is measured from the
 * same zero.
 *
 * @file src/utils/cauldronVesselProfile.ts
 */

export interface ProfileMapping {
  field: keyof CookingMethodKineticProfile;
  label: string;
  value: number;
  /** The SI reading it comes from, with its value and unit. */
  reading: string;
  /** How that reading is scaled onto 0–1. */
  formula: string;
}

export interface CauldronVesselProfile {
  profile: CookingMethodKineticProfile;
  mappings: ProfileMapping[];
}

const FLOOR_C = VESSEL_RANGES.temperatureC.min;
const CEILING_C = VESSEL_RANGES.temperatureC.max;

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Thermal drive: the setpoint's position between the vessel's floor and ceiling. */
function voltageOf(state: VesselState): ProfileMapping {
  return {
    field: "voltage",
    label: "Voltage (thermal drive)",
    value: clamp01((state.temperatureC - FLOOR_C) / (CEILING_C - FLOOR_C)),
    reading: `T = ${state.temperatureC.toFixed(0)} °C`,
    formula: `(T − ${FLOOR_C}) / (${CEILING_C} − ${FLOOR_C})`,
  };
}

/** Wet-heat current: the steam ceiling's position across the vessel's pressure range. */
function currentOf(reading: VesselReading): ProfileMapping {
  const low = saturationTemperatureC(VESSEL_RANGES.pressureKpa.min);
  const high = saturationTemperatureC(VESSEL_RANGES.pressureKpa.max);
  const tsat = reading.saturation.tsatC;
  return {
    field: "current",
    label: "Current (wet-heat ceiling)",
    value: clamp01((tsat - FLOOR_C) / (high - FLOOR_C)),
    reading: `T_sat(P) = ${tsat.toFixed(2)} °C (${low.toFixed(1)}–${high.toFixed(1)} °C across the range)`,
    formula: `(T_sat − ${FLOOR_C}) / (T_sat(${VESSEL_RANGES.pressureKpa.max} kPa) − ${FLOOR_C})`,
  };
}

/** Loss: the share of the surface's vapour pressure the headspace does not balance. */
function resistanceOf(reading: VesselReading): ProfileMapping {
  const share = reading.surfaceVaporKpa > 0 ? reading.vaporDeficitKpa / reading.surfaceVaporKpa : 0;
  return {
    field: "resistance",
    label: "Resistance (evaporative loss)",
    value: clamp01(share),
    reading: `Δp_v = ${formatFixed(reading.vaporDeficitKpa, 2)} of ${reading.surfaceVaporKpa.toFixed(2)} kPa`,
    formula: "max(0, Δp_v) / p_sat(T_surface)",
  };
}

/**
 * Structural change: how many cited regimes this vessel can reach — those on a
 * wet surface now, plus those a dried surface would reach at the setpoint.
 * The two sets do not run at once (the dry set only after the free water is
 * gone), which is why the label says "reachable", not "active".
 */
function forceOf(reading: VesselReading): ProfileMapping {
  const active = new Set([...reading.regimesWhileWet, ...reading.regimesOnceDry].map((r) => r.id));
  return {
    field: "forceImpact",
    label: "Force impact (regimes reachable)",
    value: active.size / COOKING_REGIMES.length,
    reading: `${active.size} of ${COOKING_REGIMES.length} cited regimes reachable (wet now, or once dry)`,
    formula: "reachable regimes / cited regimes",
  };
}

/** Build the cauldron's profile from the vessel and its SI reading. */
export function cauldronVesselProfile(state: VesselState, reading: VesselReading): CauldronVesselProfile {
  const voltage = voltageOf(state);
  const current = currentOf(reading);
  const mappings: ProfileMapping[] = [
    voltage,
    current,
    resistanceOf(reading),
    { ...voltage, field: "velocityFactor", label: "Velocity (follows thermal drive)" },
    { ...current, field: "momentumRetention", label: "Momentum (stored wet heat)" },
    forceOf(reading),
  ];
  const value = (field: keyof CookingMethodKineticProfile): number =>
    mappings.find((m) => m.field === field)?.value ?? Number.NaN;
  return {
    profile: {
      voltage: value("voltage"),
      current: value("current"),
      resistance: value("resistance"),
      velocityFactor: value("velocityFactor"),
      momentumRetention: value("momentumRetention"),
      forceImpact: value("forceImpact"),
    },
    mappings,
  };
}
