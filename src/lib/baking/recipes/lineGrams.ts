/**
 * The grams a recipe line holds, and the basis of that figure.
 *
 * A MATCHED line is weighed against its vector's own FDC portions
 * (portions.ts). An UNMATCHED line is weighed only so the converter can say
 * how much of the recipe it could not read: through the repo's measured
 * conversion (unitConversion.ts, USDA-measured only — its water
 * approximation is not a weight), or, for a spoon measure nobody weighed, at
 * a stated upper bound.
 *
 * @file src/lib/baking/recipes/lineGrams.ts
 */
import { bakingIngredient } from "@/data/baking";
import { basisOf } from "@/data/baking/basis";
import { FDC_BAKING_RECORDS } from "@/data/baking/fdcRecords";
import { convertToGramsDetailed } from "@/utils/unitConversion";
import { portionWeight } from "./portions";
import { CUP_ML, readUnit, statedPackageGrams, type VolumeMeasure } from "./units";
import type { Basis } from "../types";
import type { SourceLine } from "./sourceTypes";

export type LineGrams =
  | { ok: true; grams: number; basis: Basis; how: string; assumption: string | null }
  | { ok: false; reason: string };

const ML: Readonly<Record<VolumeMeasure, number>> = { cup: CUP_ML, tbsp: CUP_ML / 16, tsp: CUP_ML / 48, floz: CUP_ML / 8, ml: 1 };
/** A counted item of unstated size: the size read, and why. */
const UNSIZED: Readonly<Record<string, [string, string]>> = {
  "whole-egg": ["large", "an egg of unstated size read as a US large egg"],
  "egg-white": ["large", "an egg white of unstated size read as from a US large egg"],
  "egg-yolk": ["large", "an egg yolk of unstated size read as from a US large egg"],
  banana: ["medium", "a banana of unstated size read as medium (FDC: 7 to 7-7/8 in long)"],
  apple: ["medium", "an apple of unstated size read as medium (FDC 171688: 3 in dia, 182 g)"],
  pear: ["medium", "a pear of unstated size read as medium (FDC 169118: 178 g)"],
  potato: ["medium", "a potato of unstated size read as medium (FDC 170026: 2-1/4 to 3-1/4 in dia, 213 g)"],
  "grated-carrot": ["medium", "a carrot of unstated size read as medium (FDC 170393: 61 g)"],
  zucchini: ["medium", "a zucchini of unstated size read as medium (FDC 169291: 196 g)"],
};

function lineText(line: SourceLine): string {
  return `${line.name} ${line.notes ?? ""}`;
}

function fmt(n: number): string {
  return Number(n.toPrecision(4)).toString();
}

function byWeight(line: SourceLine, gramsPerUnit: number, label: string, vectorId: string): LineGrams {
  const liquid = bakingIngredient(vectorId).category === "liquid_dairy";
  const assumption = liquid && label === "oz" ? `"${line.amount} oz" of a liquid read as weight ounces; fluid ounces would weigh the liquid's density more or less` : null;
  const grams = line.amount * gramsPerUnit;
  return { ok: true, grams, basis: basisOf("COMPUTED", "NIST_HB44", `${line.amount} ${label} × ${fmt(gramsPerUnit)} g (unit definition)`), how: `${line.amount} ${label} = ${fmt(grams)} g`, assumption };
}

/** A counted item weighed only by a weight the recipe itself states ("1 can (14oz)"); otherwise refused. */
function byStatedPackage(line: SourceLine): LineGrams {
  const stated = statedPackageGrams(`${line.unit} ${line.name}`);
  if (stated === null) return { ok: false, reason: `"${line.amount} ${line.unit || "×"}" counts items of no stated weight` };
  const grams = line.amount * stated;
  return { ok: true, grams, basis: basisOf("COMPUTED", "NIST_HB44", `the recipe states ${fmt(stated)} g each`), how: `${line.amount} × ${fmt(stated)} g = ${fmt(grams)} g`, assumption: null };
}

function byCount(line: SourceLine, size: string, vectorId: string): LineGrams {
  const unsized = size === "unsized" ? UNSIZED[vectorId] : undefined;
  const stick = size === "unsized" && /\bsticks?\b/i.test(line.name);
  const measure = unsized?.[0] ?? (stick ? "stick" : size);
  if (measure === "unsized") return byStatedPackage(line);
  const weight = portionWeight(vectorId, measure, lineText(line));
  if (!weight.ok) return { ok: false, reason: weight.reason };
  const grams = line.amount * weight.value.gramsPerOne;
  const assumption = unsized?.[1] ?? null;
  return { ok: true, grams, basis: weight.value.basis, how: `${line.amount} ${measure} × ${fmt(weight.value.gramsPerOne)} g (${weight.value.how})`, assumption };
}

/** Grams of a line read as `vectorId`, or why the quantity cannot be weighed. */
export function matchedLineGrams(line: SourceLine, vectorId: string): LineGrams {
  if (!(Number.isFinite(line.amount) && line.amount > 0)) return { ok: false, reason: "no amount stated" };
  const reading = readUnit(line.unit);
  switch (reading.kind) {
    case "weight":
      return byWeight(line, reading.gramsPerUnit, reading.label, vectorId);
    case "volume": {
      const weight = portionWeight(vectorId, reading.measure, lineText(line));
      if (!weight.ok) return { ok: false, reason: weight.reason };
      const measures = (line.amount * reading.mlPerUnit) / ML[reading.measure];
      const grams = measures * weight.value.gramsPerOne;
      return { ok: true, grams, basis: weight.value.basis, how: `${line.amount} ${reading.label} → ${fmt(grams)} g (${weight.value.how})`, assumption: null };
    }
    case "count":
      return byCount(line, reading.size, vectorId);
    case "trace":
      return { ok: false, reason: `"${reading.label}" names no quantity` };
    case "unknown":
      // "1 dozen eggs" is not one large egg: an unknown unit gets no size default, only a stated weight.
      return byStatedPackage(line);
  }
}

/**
 * The densest measured cup among the Baking Lab's own FDC records, g/mL —
 * DERIVED from measured inputs (it is honey's 339 g cup). No spice, extract
 * or flavouring a recipe measures by the spoon is denser, so it bounds such
 * a line's mass from above.
 */
export const SPOON_BOUND_G_PER_ML = Math.max(
  ...FDC_BAKING_RECORDS.flatMap((r) => r.portions.filter((p) => p.modifier === "cup" || (p.unit === "cup" && p.modifier === "")).map((p) => p.grams / p.amount / CUP_ML)),
);

export type UnreadMass = { grams: number; bound: boolean; basis: Basis } | null;

/** How much an UNMATCHED line weighs, as far as anything measured can say; null when nothing can. */
export function unmatchedLineGrams(line: SourceLine, normalised: string): UnreadMass {
  if (!(Number.isFinite(line.amount) && line.amount > 0)) return null;
  const reading = readUnit(line.unit);
  if (reading.kind === "weight") return { grams: line.amount * reading.gramsPerUnit, bound: false, basis: basisOf("COMPUTED", "NIST_HB44", `${line.amount} ${reading.label}`) };
  const measured = convertToGramsDetailed(line.amount, line.unit, normalised, lineText(line));
  if (measured !== null && measured.basis === "usda-measured") {
    return { grams: measured.grams, bound: false, basis: { ...basisOf("MEASURED", "USDA_FDC", "the repo's measured household portion (src/data/cooking)"), ...(measured.fdcId === undefined ? {} : { fdcId: measured.fdcId }) } };
  }
  if (reading.kind === "volume" && (reading.measure === "tsp" || reading.measure === "tbsp")) {
    const grams = line.amount * reading.mlPerUnit * SPOON_BOUND_G_PER_ML;
    return { grams, bound: true, basis: basisOf("DERIVED", "USDA_FDC", `at most ${fmt(SPOON_BOUND_G_PER_ML)} g/mL, the densest measured cup among the baking records`) };
  }
  return null;
}
