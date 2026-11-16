/**
 * Formula telemetry — everything the lab reads off a list of grams before
 * anything is baked.
 *
 * Definitions, stated once:
 * - **Baker's base** = Σ grams × flourShare: every flour, plus the flour half
 *   of a 100 % levain. Baker's % = line grams ÷ that base.
 * - **True hydration** = (all water − the flours' own moisture − water bound
 *   by fibre) ÷ the baker's base. It counts the water hidden in milk, eggs,
 *   butter, honey and the levain, which plain baker's hydration misses; the
 *   flours' native ~12 % moisture stays out, by baker's convention, so a
 *   70 % lean dough still reads 70 %.
 * - **POD / PAC per 100 g** = Σ grams × ingredient POD (PAC) ÷ total grams.
 * - **Structure : tenderiser** = (gluten-forming protein + other setting
 *   protein + starch + hydrocolloid fibre) ÷ (fat + sugar), by mass. A mass
 *   ratio, not a physical law — leavening's "tenderising" lift has no mass
 *   and is left out rather than given an invented weight.
 *
 * @file src/lib/baking/telemetry.ts
 */
import { bakingIngredient } from "@/data/baking";
import { REDUCING, SUGAR_SPECIES } from "./chemistry";
import { SUGAR_POD } from "./sweetness";
import { acidBaseBalance, compositionTotals, fatPhase, leaveningBudget, structureBalance, sugarTotals, sumOver, type ResolvedLine } from "./telemetryParts";
import { aqueousWaterActivity } from "./waterActivity";
import type { AcidBaseBalance, Formula, FormulaTelemetry } from "./formulaTypes";
import type { BakingIngredient, SugarProfile } from "./types";

export type IngredientLookup = (id: string) => BakingIngredient;

export function resolveLines(formula: Formula, lookup: IngredientLookup = bakingIngredient): ResolvedLine[] {
  return formula.lines.map((line) => {
    if (!(Number.isFinite(line.grams) && line.grams >= 0)) {
      throw new RangeError(`${line.ingredientId}: grams must be a finite non-negative number, received ${line.grams}`);
    }
    return { ingredient: lookup(line.ingredientId), grams: line.grams };
  });
}

function reducingShare(sugars: SugarProfile): number {
  let speciated = 0;
  let reducing = 0;
  for (const s of SUGAR_SPECIES) {
    speciated += sugars[s];
    if (REDUCING[s]) reducing += sugars[s];
  }
  return speciated > 0 ? reducing / speciated : 0;
}

function caveatsFor(sugars: SugarProfile, acidBase: AcidBaseBalance, unknownFatGrams: number, ethanolG: number): string[] {
  const out: string[] = [];
  if (sugars.unspeciated > 0.05) out.push(`${sugars.unspeciated.toFixed(1)} g of sugar is reported only as a total, so it adds to neither sweetness (POD) nor softness (PAC).`);
  const noPod = SUGAR_SPECIES.filter((s) => SUGAR_POD[s].value === null && sugars[s] > 0.05);
  if (noPod.length > 0) out.push(`No sourced sweetness for ${noPod.join(" and ")}; excluded from POD.`);
  if (acidBase.bicarbonateMmol > 0 && acidBase.unquantified.length > 0) {
    out.push(`Acidity not quantified for ${acidBase.unquantified.join(", ")}: the soda may be more neutralised than shown.`);
  }
  if (unknownFatGrams > 0.5) out.push(`${unknownFatGrams.toFixed(1)} g of fat has no solid-fat figure and is left out of the fat-phase index.`);
  if (ethanolG > 0.05) out.push(`${ethanolG.toFixed(1)} g of ethanol (from extracts) evaporates early and is not modelled further.`);
  return out;
}

export function formulaTelemetry(formula: Formula, lookup: IngredientLookup = bakingIngredient): FormulaTelemetry {
  const lines = resolveLines(formula, lookup);
  const totalGrams = sumOver(lines, () => 1);
  if (!(totalGrams > 0)) throw new RangeError("a formula needs at least one ingredient with grams above zero");
  const flourGrams = sumOver(lines, (i) => i.flourShare);
  const composition = compositionTotals(lines);
  const sugars = sugarTotals(lines);
  const boundWaterGrams = Math.min(sumOver(lines, (i) => i.fiberWaterBinding), composition.water);
  const freeWaterGrams = composition.water - boundWaterGrams;
  const flourWater = sumOver(lines, (i) => i.flourWaterPct / 100);
  const acidBase = acidBaseBalance(lines);
  const fat = fatPhase(lines);
  return {
    totalGrams,
    flourGrams,
    bakersPercent: lines.map(({ grams }) => (flourGrams > 0 ? (grams / flourGrams) * 100 : null)),
    composition,
    sugars,
    boundWaterGrams,
    freeWaterGrams,
    trueHydrationPct: flourGrams > 0 ? ((composition.water - flourWater - boundWaterGrams) / flourGrams) * 100 : null,
    moistureWbPct: (composition.water / totalGrams) * 100,
    waterActivity: aqueousWaterActivity(freeWaterGrams, sugars, sumOver(lines, (i) => i.naclPct / 100), composition.ethanol),
    podPer100g: sumOver(lines, (i) => i.pod) / totalGrams,
    pacPer100g: sumOver(lines, (i) => i.pac) / totalGrams,
    reducingSugarFraction: reducingShare(sugars),
    fatPhaseSolidFatIndex: fat.solidFatIndex,
    fatPhaseMeltingC: fat.meltingC,
    structure: structureBalance(lines, composition),
    acidBase,
    leavening: leaveningBudget(lines, acidBase),
    caveats: caveatsFor(sugars, acidBase, fat.unknownFatGrams, composition.ethanol),
  };
}
