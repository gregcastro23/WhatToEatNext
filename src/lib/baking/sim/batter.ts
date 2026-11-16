/**
 * From a formula to the batter the simulator bakes.
 *
 * What crosses over, and from where:
 * - matrix composition → Choi–Okos mass fractions (fibre split out of
 *   carbohydrate, since FDC's carbohydrate-by-difference includes it);
 * - the measured batter density → the starting gas fraction, against the
 *   matrix density Choi–Okos computes for that composition;
 * - each starch and setting protein → its own window, starches shifted by
 *   the sucrose dissolved in the free water (Allan et al. 2020);
 * - leavening → only the CO₂ released IN THE OVEN. Gas made at mixing
 *   (soda meeting acid, a powder's fast acid) and by proofing is already in
 *   the measured density, and is not added twice.
 *
 * @file src/lib/baking/sim/batter.ts
 */
import { bakingIngredient } from "@/data/baking";
import { foodProperties, type MassFractions } from "@/lib/cooking/choiOkos";
import { MOLAR_MASS, REDUCING, SUGAR_SPECIES } from "../chemistry";
import { formulaTelemetry, resolveLines, type IngredientLookup } from "../telemetry";
import { solubilityGPerGWater } from "../waterActivity";
import { SIM } from "./constants";
import { gelatinizationWindow, sucroseGelShift, sucroseMolarity } from "./structureSet";
import type { BakeProcess, Formula, FormulaTelemetry } from "../formulaTypes";
import type { ResolvedLine } from "../telemetryParts";
import type { BatterState, SetComponent, TransitionWindow } from "./simTypes";

export interface PreparedBatter {
  batter: BatterState;
  telemetry: FormulaTelemetry;
  /** Notes about how the formula was translated, for display. */
  notes: string[];
}

function matrixFractions(t: FormulaTelemetry): MassFractions {
  const c = t.composition;
  const total = t.totalGrams;
  return {
    water: c.water / total,
    protein: c.protein / total,
    fat: c.fat / total,
    carbohydrate: Math.max(c.carbohydrate - c.fiber, 0) / total,
    fibre: c.fiber / total,
    ash: c.ash / total,
  };
}

function setComponents(lines: readonly ResolvedLine[], total: number, shiftK: number): SetComponent[] {
  const out: SetComponent[] = [];
  for (const { ingredient: i, grams } of lines) {
    if (grams <= 0) continue;
    const starch = (grams * i.starchPct) / 100;
    if (starch > 0 && i.gelatinizationTempC !== null) {
      out.push({ kind: "starch", label: `${i.name} starch`, massFraction: starch / total, window: gelatinizationWindow(i.gelatinizationTempC, shiftK) });
    }
    const protein = ((grams * i.proteinPct) / 100) * (i.glutenPotency > 0 ? i.glutenPotency : 1);
    if (protein > 0 && i.coagulationTempC !== null && i.coagulationEndC !== null) {
      out.push({ kind: "protein", label: `${i.name} protein`, massFraction: protein / total, window: { onsetC: i.coagulationTempC, endC: i.coagulationEndC } });
    }
  }
  return out;
}

function windowOf(lines: readonly ResolvedLine[], kind: "complete" | "bicarbonate"): TransitionWindow | null {
  for (const { ingredient, grams } of lines) {
    const spec = ingredient.leavening;
    if (grams > 0 && spec?.kind === kind && spec.heatReleaseOnsetC !== null && spec.heatReleaseCompleteC !== null) {
      return { onsetC: spec.heatReleaseOnsetC, endC: spec.heatReleaseCompleteC };
    }
  }
  return null;
}

function gasFraction(fractions: MassFractions, process: BakeProcess, notes: string[]): number {
  const matrixDensity = foodProperties(fractions, process.startC, 0).densityKgM3;
  const raw = 1 - (process.densityGPerMl * 1000) / matrixDensity;
  if (raw < 0) {
    notes.push(`The stated density (${process.densityGPerMl} g/mL) is above this formula's gas-free density (${(matrixDensity / 1000).toFixed(3)} g/mL): they describe different preparations. Taken as no gas.`);
    return 0;
  }
  return raw;
}

function sugarShift(t: FormulaTelemetry, notes: string[]): number {
  const solubility = solubilityGPerGWater("sucrose") ?? Number.POSITIVE_INFINITY;
  const dissolved = Math.min(t.sugars.sucrose, solubility * t.freeWaterGrams);
  const shift = sucroseGelShift(sucroseMolarity(dissolved, t.freeWaterGrams));
  if (shift.extrapolated) notes.push("Dissolved sucrose is past the 2.0 M Allan et al. measured; the gelatinization delay is held at its last measured value (+28.86 K).");
  return shift.shiftK;
}

/** DECLARED: how much of its gas growth a matrix holds, from its structure-to-tenderiser ratio. */
export function gasRetention(t: FormulaTelemetry): number {
  const { ratio } = t.structure;
  if (ratio === null) return 1;
  return Math.min(Math.max(ratio / SIM.gasRetentionRefRatio.value, SIM.gasRetentionFloor.value), 1);
}

export function prepareBatter(formula: Formula, process: BakeProcess, lookup: IngredientLookup = bakingIngredient): PreparedBatter {
  const telemetry = formulaTelemetry(formula, lookup);
  const lines = resolveLines(formula, lookup);
  const notes: string[] = [];
  const fractions = matrixFractions(telemetry);
  const shiftK = sugarShift(telemetry, notes);
  const totalKg = telemetry.totalGrams / 1000;
  const dryGrams = telemetry.totalGrams - telemetry.composition.water;
  const reducing = SUGAR_SPECIES.reduce((sum, sp) => sum + (REDUCING[sp] ? telemetry.sugars[sp] : 0), 0);
  const batter: BatterState = {
    fractions,
    gasFraction0: gasFraction(fractions, process, notes),
    startC: process.startC,
    setComponents: setComponents(lines, telemetry.totalGrams, shiftK),
    sugarGelShiftK: shiftK,
    fatMeltC: telemetry.fatPhaseMeltingC,
    heatCo2MolPerKg: telemetry.leavening.powderHeatCo2Grams / MOLAR_MASS.carbonDioxide / totalKg,
    heatCo2Window: windowOf(lines, "complete"),
    sodaCo2MolPerKg: telemetry.leavening.thermalCo2Grams / MOLAR_MASS.carbonDioxide / totalKg,
    sodaWindow: windowOf(lines, "bicarbonate"),
    fermented: telemetry.leavening.fermented,
    gasRetention: gasRetention(telemetry),
    reducingSugarDryFraction: dryGrams > 0 ? reducing / dryGrams : 0,
    sucroseDryFraction: dryGrams > 0 ? telemetry.sugars.sucrose / dryGrams : 0,
  };
  return { batter, telemetry, notes };
}
