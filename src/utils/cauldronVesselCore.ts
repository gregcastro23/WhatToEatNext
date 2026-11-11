/**
 * The alchm cauldron's circuit: a sequence of ingredient stages wired in
 * series, each stage's charge, voltage, current, resistance and power read
 * from its blended elementals through the ESMS → Heat/Entropy/Reactivity →
 * Greg's Energy/Kalchm/Monica substrate and the P=IV kinetics engine.
 *
 * Derived from the tilt-skillet planner's circuit core (removed with that
 * planner). The math is unchanged; what changed is where the kinetic profile
 * comes from. The planner hard-coded the `tilt_skillet` profile; the
 * cauldron takes it as an input, built from the SI vessel by
 * `cauldronVesselProfile`, so pressure, temperature and headspace humidity
 * move the circuit.
 *
 * Like the planner, /kitchen-lab/alchm passes no planetary positions, so the
 * kinetics engine's sky modulation (planetary boost, retrograde resistance)
 * stays off there. Server callers may pass positions; that path is tested.
 *
 * Catalog-free: client components pass a compact elemental lookup (served by
 * GET /api/cauldron/elemental-catalog) so the full ingredient dataset stays out
 * of client bundles. `cauldronVesselSimulation.ts` binds the full catalog for
 * server callers.
 *
 * @file src/utils/cauldronVesselCore.ts
 */

import { performAlchemicalAnalysis } from "@/data/unified/alchemicalCalculations";
import type { ElementalProperties, AlchemicalProperties } from "@/types/alchemy";
import type { CookingMethodKineticProfile } from "@/types/cookingMethod";
import type { KineticMetrics } from "@/types/kinetics";
import {
  blendStageElementalWithCatalog,
  type BatchStageInput,
  type IngredientElementalCatalog,
} from "./cauldronIngredients";
import { calculateMethodSpecificKinetics } from "./cookingMethodKinetics";
import { deriveESMSFromElemental } from "./quantityScaling";
import type { TransformationState } from "./cauldronTransformation";

export {
  blendStageElementalWithCatalog,
  findIngredientElemental,
  ingredientMatchReport,
  matchIngredient,
  namedStages,
  NEUTRAL_ELEMENTAL,
  resolveIngredientElementalFromCatalog,
  unresolvedIngredientNames,
  type BatchIngredient,
  type BatchStageInput,
  type IngredientElementalCatalog,
  type IngredientMatch,
  type IngredientMatchReport,
} from "./cauldronIngredients";

const EPS = 1e-9;

function finite(x: number, fallback = 0): number {
  return Number.isFinite(x) ? x : fallback;
}

export interface StageCircuit {
  name: string;
  blendedElemental: ElementalProperties;
  esms: AlchemicalProperties;
  // thermodynamic substrate (from performAlchemicalAnalysis)
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
  // circuit readout (Q/V/I/P from the kinetics engine; R/losses/η mirror recipeCircuit)
  charge: number;
  potentialDifference: number;
  currentFlow: number;
  power: number;
  resistance: number;
  powerLosses: number;
  efficiency: number;
  kinetics: KineticMetrics;
  transformation?: TransformationState;
}

export interface SeriesCircuit {
  stageCount: number;
  totalCharge: number;
  totalPotential: number;
  totalResistance: number;
  seriesCurrent: number;
  totalPower: number;
  totalLosses: number;
  netEfficiency: number;
  netKalchm: number;
  netMonica: number;
}

export interface BatchCircuit {
  stages: StageCircuit[];
  series: SeriesCircuit;
  transformation?: TransformationState;
}

/** A stage's display name; a blank name falls back to its position, as an absent one does. */
function stageName(stage: BatchStageInput, index: number): string {
  const trimmed = stage.name?.trim();
  return trimmed !== undefined && trimmed !== "" ? trimmed : `Stage ${index + 1}`;
}

/** Method id handed to the kinetics engine; the profile is always passed explicitly. */
export const CAULDRON_METHOD_ID = "cauldron_vessel";

type AlchemicalAnalysis = ReturnType<typeof performAlchemicalAnalysis>;

/** The P=IV kinetics of one stage under the vessel's profile. */
function stageKinetics(
  blendedElemental: ElementalProperties,
  esms: AlchemicalProperties,
  thermo: AlchemicalAnalysis,
  kineticProfile: CookingMethodKineticProfile,
  planetaryPositions?: Record<string, unknown>,
): KineticMetrics {
  return calculateMethodSpecificKinetics({
    methodId: CAULDRON_METHOD_ID,
    elementalEffect: blendedElemental,
    transformedESMS: esms,
    thermodynamics: {
      heat: thermo.heat,
      entropy: thermo.entropy,
      reactivity: thermo.reactivity,
    },
    gregsEnergy: thermo.gregsEnergy,
    monica: Number.isFinite(thermo.monica) ? thermo.monica : null,
    kineticProfile,
    ...(planetaryPositions !== undefined ? { planetaryPositions } : {}),
  });
}

type CircuitReadout = Pick<
  StageCircuit,
  "charge" | "potentialDifference" | "currentFlow" | "power" | "resistance" | "powerLosses" | "efficiency"
>;

/** Q/V/I/P from the kinetics engine; R = entropy, losses = I²R and η, as recipeCircuit does. */
function circuitReadout(kinetics: KineticMetrics, entropy: number): CircuitReadout {
  const currentFlow = finite(kinetics.currentFlow);
  const power = finite(kinetics.power);
  const resistance = finite(entropy);
  const powerLosses = currentFlow * currentFlow * resistance;
  const efficiency =
    Math.abs(power) > EPS ? Math.max(0, Math.min(1, (power - powerLosses) / power)) : 0;
  return {
    charge: finite(kinetics.charge),
    potentialDifference: finite(kinetics.potentialDifference),
    currentFlow,
    power,
    resistance,
    powerLosses: finite(powerLosses),
    efficiency: finite(efficiency),
  };
}

/** Compute the full circuit reading for one cauldron stage. */
export function computeStageCircuitWithCatalog(
  stage: BatchStageInput,
  index: number,
  kineticProfile: CookingMethodKineticProfile,
  catalog?: IngredientElementalCatalog,
  planetaryPositions?: Record<string, unknown>,
): StageCircuit {
  const blendedElemental = blendStageElementalWithCatalog(stage.ingredients, catalog);
  const esms = deriveESMSFromElemental(blendedElemental);
  const thermo = performAlchemicalAnalysis(esms, blendedElemental);
  const kinetics = stageKinetics(blendedElemental, esms, thermo, kineticProfile, planetaryPositions);
  return {
    name: stageName(stage, index),
    blendedElemental,
    esms,
    heat: finite(thermo.heat),
    entropy: finite(thermo.entropy),
    reactivity: finite(thermo.reactivity),
    gregsEnergy: finite(thermo.gregsEnergy),
    kalchm: finite(thermo.kalchm),
    monica: finite(thermo.monica),
    ...circuitReadout(kinetics, thermo.entropy),
    kinetics,
  };
}

/**
 * Wire the cauldron's stages into a series circuit under one vessel profile.
 */
export function computeCauldronCircuitWithCatalog(
  stages: BatchStageInput[],
  kineticProfile: CookingMethodKineticProfile,
  catalog?: IngredientElementalCatalog,
  planetaryPositions?: Record<string, unknown>,
): BatchCircuit {
  const computed = stages.map((s, i) =>
    computeStageCircuitWithCatalog(s, i, kineticProfile, catalog, planetaryPositions),
  );

  const totalCharge = computed.reduce((s, r) => s + r.charge, 0);
  const totalPotential = computed.reduce((s, r) => s + r.potentialDifference, 0);
  const totalResistance = computed.reduce((s, r) => s + r.resistance, 0);
  const totalPower = computed.reduce((s, r) => s + r.power, 0);
  const seriesCurrent = totalResistance > EPS ? totalPotential / totalResistance : 0;
  const totalLosses = seriesCurrent * seriesCurrent * totalResistance;
  const netEfficiency =
    Math.abs(totalPower) > EPS
      ? Math.max(0, Math.min(1, (totalPower - totalLosses) / totalPower))
      : 0;
  const netKalchm = finite(
    computed.reduce(
      (p, r) => p * (Number.isFinite(r.kalchm) && r.kalchm > 0 ? r.kalchm : 1),
      1,
    ),
  );
  const netMonica = computed.length
    ? computed.reduce((s, r) => s + r.monica, 0) / computed.length
    : 0;

  return {
    stages: computed,
    series: {
      stageCount: computed.length,
      totalCharge: finite(totalCharge),
      totalPotential: finite(totalPotential),
      totalResistance: finite(totalResistance),
      seriesCurrent: finite(seriesCurrent),
      totalPower: finite(totalPower),
      totalLosses: finite(totalLosses),
      netEfficiency: finite(netEfficiency),
      netKalchm,
      netMonica: finite(netMonica),
    },
  };
}

