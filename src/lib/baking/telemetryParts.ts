/**
 * The pieces of formula telemetry: batch totals, the acid–base balance and
 * leavening budget, the structure balance and the fat phase.
 *
 * @file src/lib/baking/telemetryParts.ts
 */
import { CO2_G_PER_MMOL, SUGAR_SPECIES } from "./chemistry";
import type { AcidBaseBalance, LeaveningBudget, StructureBalance } from "./formulaTypes";
import type { BakingIngredient, Composition, SugarProfile } from "./types";

export interface ResolvedLine {
  ingredient: BakingIngredient;
  grams: number;
}

const COMPOSITION_FIELDS: ReadonlyArray<keyof Composition> = ["water", "protein", "fat", "carbohydrate", "fiber", "ash", "ethanol", "starch", "sugars"];

export function compositionTotals(lines: readonly ResolvedLine[]): Composition {
  const out: Composition = { water: 0, protein: 0, fat: 0, carbohydrate: 0, fiber: 0, ash: 0, ethanol: 0, starch: 0, sugars: 0 };
  for (const { ingredient, grams } of lines) {
    for (const field of COMPOSITION_FIELDS) out[field] += (grams * ingredient.composition[field]) / 100;
  }
  return out;
}

export function sugarTotals(lines: readonly ResolvedLine[]): SugarProfile {
  const out: SugarProfile = { sucrose: 0, glucose: 0, fructose: 0, lactose: 0, maltose: 0, galactose: 0, allulose: 0, unspeciated: 0 };
  for (const { ingredient, grams } of lines) {
    for (const s of SUGAR_SPECIES) out[s] += (grams * ingredient.sugars[s]) / 100;
    out.unspeciated += (grams * ingredient.sugars.unspeciated) / 100;
  }
  return out;
}

/** Σ grams × f(ingredient). */
export function sumOver(lines: readonly ResolvedLine[], f: (i: BakingIngredient) => number): number {
  return lines.reduce((total, { ingredient, grams }) => total + grams * f(ingredient), 0);
}

export function acidBaseBalance(lines: readonly ResolvedLine[]): AcidBaseBalance {
  let acidMmol = 0;
  const unquantified: string[] = [];
  for (const { ingredient, grams } of lines) {
    if (grams <= 0) continue;
    if (ingredient.acidMmolPerG === null) unquantified.push(ingredient.id);
    else acidMmol += grams * ingredient.acidMmolPerG;
  }
  const bicarbonateMmol = sumOver(lines, (i) => i.bicarbonateMmolPerG);
  const neutralisedMmol = Math.min(acidMmol, bicarbonateMmol);
  return {
    acidMmol,
    bicarbonateMmol,
    neutralisedMmol,
    excessBaseMmol: bicarbonateMmol - neutralisedMmol,
    excessAcidMmol: acidMmol - neutralisedMmol,
    unquantified,
  };
}

export function leaveningBudget(lines: readonly ResolvedLine[], acidBase: AcidBaseBalance): LeaveningBudget {
  let powderMixing = 0;
  let powderHeat = 0;
  for (const { ingredient, grams } of lines) {
    const spec = ingredient.leavening;
    if (spec?.kind !== "complete") continue;
    const co2 = grams * ingredient.leaveningGasYield;
    powderMixing += co2 * spec.mixingReleaseFraction;
    powderHeat += co2 * (1 - spec.mixingReleaseFraction);
  }
  return {
    neutralisationCo2Grams: acidBase.neutralisedMmol * CO2_G_PER_MMOL,
    thermalCo2Grams: (acidBase.excessBaseMmol * CO2_G_PER_MMOL) / 2,
    powderMixingCo2Grams: powderMixing,
    powderHeatCo2Grams: powderHeat,
    fermented: lines.some(({ ingredient, grams }) => grams > 0 && ingredient.leavening?.kind === "biological"),
  };
}

export function structureBalance(lines: readonly ResolvedLine[], composition: Composition): StructureBalance {
  const protein = (i: BakingIngredient): number => i.proteinPct / 100;
  const glutenGrams = sumOver(lines, (i) => protein(i) * i.glutenPotency);
  const coagulatingProteinGrams = sumOver(lines, (i) => (i.glutenPotency === 0 && i.coagulationTempC !== null ? protein(i) : 0));
  const starchGrams = composition.starch;
  const hydrocolloidGrams = sumOver(lines, (i) => (i.category === "hydrocolloid_fiber" ? i.composition.fiber / 100 : 0));
  const tenderiser = composition.fat + composition.sugars;
  const structure = glutenGrams + coagulatingProteinGrams + starchGrams + hydrocolloidGrams;
  return {
    glutenGrams,
    coagulatingProteinGrams,
    starchGrams,
    hydrocolloidGrams,
    fatGrams: composition.fat,
    sugarGrams: composition.sugars,
    ratio: tenderiser > 0 ? structure / tenderiser : null,
  };
}

export interface FatPhase {
  solidFatIndex: number | null;
  meltingC: number | null;
  /** Fat grams whose solid fraction is unknown and were left out of the index. */
  unknownFatGrams: number;
}

export function fatPhase(lines: readonly ResolvedLine[]): FatPhase {
  let known = 0;
  let solid = 0;
  let unknown = 0;
  let meltingC: number | null = null;
  for (const { ingredient, grams } of lines) {
    const fat = (grams * ingredient.fatPct) / 100;
    if (fat <= 0) continue;
    if (ingredient.solidFatIndex === null) unknown += fat;
    else {
      known += fat;
      solid += fat * ingredient.solidFatIndex;
    }
    const melt = ingredient.meltingPointC;
    if (melt !== null && (meltingC === null || melt > meltingC)) meltingC = melt;
  }
  return { solidFatIndex: known > 0 ? solid / known : null, meltingC, unknownFatGrams: unknown };
}
