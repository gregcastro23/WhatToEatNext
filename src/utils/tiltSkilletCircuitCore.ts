// src/utils/tiltSkilletCircuitCore.ts
// Catalog-decoupled circuit math for the Tilt Skillet batch planner.
// Client components import from this module and receive a compact server-built
// elemental lookup map so the full 1,002-ingredient catalog is not bundled into
// client JS.

import { performAlchemicalAnalysis } from "@/data/unified/alchemicalCalculations";
import type { ElementalProperties, AlchemicalProperties } from "@/types/alchemy";
import type { KineticMetrics } from "@/types/kinetics";
import { calculateMethodSpecificKinetics, getKineticProfile } from "./cookingMethodKinetics";
import { calculateQuantityFactor, deriveESMSFromElemental } from "./quantityScaling";

const EPS = 1e-9;
export const NEUTRAL_ELEMENTAL: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

function finite(x: number, fallback = 0): number {
  return Number.isFinite(x) ? x : fallback;
}

export type IngredientElementalCatalog = Record<string, ElementalProperties>;

export interface BatchIngredient {
  name: string;
  amount: number;
  unit: string;
  /** Resolved elemental profile; when omitted it is resolved from the ingredient catalog. */
  elementalProperties?: ElementalProperties;
}

export interface BatchStageInput {
  name?: string;
  ingredients: BatchIngredient[];
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
}

/**
 * Resolve a free-text ingredient name to its elemental profile via a compact
 * `{ [normalizedKeyOrName]: ElementalProperties }` catalog.
 * Falls back to a neutral profile so unknown names never break the math.
 */
export function resolveIngredientElementalFromCatalog(
  name: string,
  catalog?: IngredientElementalCatalog,
): ElementalProperties {
  const norm = (name ?? "").trim().toLowerCase();
  if (!norm || !catalog) return { ...NEUTRAL_ELEMENTAL };

  const key = norm.replace(/\s+/g, "_");
  const direct = catalog[key] ?? catalog[norm];
  if (direct) return direct;

  for (const [entryKey, elemental] of Object.entries(catalog)) {
    const entryNorm = entryKey.replace(/_/g, " ");
    if (
      elemental &&
      (entryNorm === norm || entryNorm.includes(norm) || norm.includes(entryNorm))
    ) {
      return elemental;
    }
  }
  return { ...NEUTRAL_ELEMENTAL };
}

/**
 * Quantity-weighted blend of a stage's ingredients into one elemental profile.
 */
export function blendStageElementalWithCatalog(
  ingredients: BatchIngredient[],
  catalog?: IngredientElementalCatalog,
): ElementalProperties {
  const acc: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let totalWeight = 0;

  for (const ing of ingredients ?? []) {
    const elemental =
      ing.elementalProperties ??
      resolveIngredientElementalFromCatalog(ing.name, catalog);
    const weight = calculateQuantityFactor(ing.amount, ing.unit, "g", ing.name);
    if (!(weight > 0)) continue;
    acc.Fire += elemental.Fire * weight;
    acc.Water += elemental.Water * weight;
    acc.Earth += elemental.Earth * weight;
    acc.Air += elemental.Air * weight;
    totalWeight += weight;
  }

  const sum = acc.Fire + acc.Water + acc.Earth + acc.Air;
  if (sum <= EPS || totalWeight <= EPS) return { ...NEUTRAL_ELEMENTAL };
  return {
    Fire: acc.Fire / sum,
    Water: acc.Water / sum,
    Earth: acc.Earth / sum,
    Air: acc.Air / sum,
  };
}

/** Compute the full circuit reading for one tilt-skillet stage. */
export function computeStageCircuitWithCatalog(
  stage: BatchStageInput,
  index = 0,
  planetaryPositions?: Record<string, unknown>,
  catalog?: IngredientElementalCatalog,
): StageCircuit {
  const blendedElemental = blendStageElementalWithCatalog(
    stage.ingredients,
    catalog,
  );
  const esms = deriveESMSFromElemental(blendedElemental);
  const thermo = performAlchemicalAnalysis(esms, blendedElemental);

  const kineticProfile = getKineticProfile("tilt_skillet");

  const kinetics = calculateMethodSpecificKinetics({
    methodId: "tilt_skillet",
    elementalEffect: blendedElemental,
    transformedESMS: esms,
    thermodynamics: {
      heat: thermo.heat,
      entropy: thermo.entropy,
      reactivity: thermo.reactivity,
    },
    gregsEnergy: thermo.gregsEnergy,
    monica: Number.isFinite(thermo.monica) ? thermo.monica : null,
    ...(kineticProfile != null ? { kineticProfile } : {}),
    ...(planetaryPositions !== undefined ? { planetaryPositions } : {}),
  });

  const charge = finite(kinetics.charge);
  const potentialDifference = finite(kinetics.potentialDifference);
  const currentFlow = finite(kinetics.currentFlow);
  const power = finite(kinetics.power);
  const resistance = finite(thermo.entropy);
  const powerLosses = currentFlow * currentFlow * resistance;
  const efficiency =
    Math.abs(power) > EPS
      ? Math.max(0, Math.min(1, (power - powerLosses) / power))
      : 0;

  return {
    name: stage.name?.trim() ?? `Stage ${index + 1}`,
    blendedElemental,
    esms,
    heat: finite(thermo.heat),
    entropy: finite(thermo.entropy),
    reactivity: finite(thermo.reactivity),
    gregsEnergy: finite(thermo.gregsEnergy),
    kalchm: finite(thermo.kalchm),
    monica: finite(thermo.monica),
    charge,
    potentialDifference,
    currentFlow,
    power,
    resistance,
    powerLosses: finite(powerLosses),
    efficiency: finite(efficiency),
    kinetics,
  };
}

/**
 * Wire a batch plan's stages into a series circuit using a provided elemental catalog.
 */
export function computeBatchCircuitWithCatalog(
  stages: BatchStageInput[],
  planetaryPositions?: Record<string, unknown>,
  catalog?: IngredientElementalCatalog,
): BatchCircuit {
  const computed = (stages ?? []).map((s, i) =>
    computeStageCircuitWithCatalog(s, i, planetaryPositions, catalog),
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

