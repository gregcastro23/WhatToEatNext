/**
 * Grams per household measure for a Baking Lab vector, read from USDA's own
 * measured portions for the record the vector is built on.
 *
 * Choosing among FDC's portions is a claim about the recipe line, so every
 * choice says how it was made:
 * - MEASURED  the line's measure (and qualifier, when it names one: "packed",
 *             "sifted", "chopped") was weighed for this very record;
 * - DERIVED   the record weighed a sibling measure (only the cup), scaled by
 *             the exact US customary ratio (1 cup = 16 tbsp = 48 tsp);
 * - DECLARED  a convention or a borrowed record filled a gap, and says which.
 *
 * A portion whose qualifier names another physical form ("whipped", "in
 * shell", "whole kernels") is never used for the vector's form.
 *
 * @file src/lib/baking/recipes/portions.ts
 */
import { bakingIngredient } from "@/data/baking";
import { basisOf } from "@/data/baking/basis";
import { FDC_BAKING_RECORDS } from "@/data/baking/fdcRecords";
import { CUP_ML, type VolumeMeasure } from "./units";
import type { Basis, FdcBakingRecord, FdcPortion } from "../types";

export interface PortionWeight {
  /** Grams per ONE of the requested measure. */
  gramsPerOne: number;
  basis: Basis;
  /** Plain words: "FDC 168896: 1 cup = 137 g". */
  how: string;
}

export type PortionResult = { ok: true; value: PortionWeight } | { ok: false; reason: string };

type Source = { kind: "none"; reason: string } | { kind: "borrow"; from: string; tag?: string; reason: string };

/** Vectors whose own FDC portions do not weigh the vector's form, and what stands in. */
const PORTION_SOURCE: Readonly<Record<string, Source>> = {
  "almond-flour": { kind: "borrow", from: "walnuts", tag: "ground", reason: "FDC 170568 weighed whole blanched kernels, not the ground flour; ground English walnuts' measured cup (FDC 170187: 1 cup, ground = 80 g, a ground tree-nut meal) is applied" },
  "cassava-flour": { kind: "none", reason: "FDC publishes only a 30 g reference serving, no household measure" },
  "spelt-flour": { kind: "borrow", from: "whole-wheat-flour", reason: "FDC weighs spelt as whole grain; whole wheat flour's measured measure (a whole-grain flour of like grind) is applied" },
  "sweet-rice-flour": { kind: "borrow", from: "rice-flour", reason: "FDC 168883 weighs glutinous rice as whole grain; white rice flour's measured cup (FDC 169714: 1 cup = 158 g) is applied" },
  "whole-wheat-pastry-flour": { kind: "borrow", from: "whole-wheat-flour", reason: "FDC 168944 publishes no portion; whole wheat flour's measured measure is applied" },
  "tapioca-starch": { kind: "borrow", from: "cornstarch", reason: "FDC weighs tapioca as pearls; cornstarch's measured measure (a fine pure starch) is applied" },
  "brown-butter": { kind: "borrow", from: "butter", reason: "brown butter is not weighed by FDC; butter's measured measure is applied" },
  aquafaba: { kind: "borrow", from: "water", reason: "aquafaba (94 % water) is not weighed by FDC; water's measured measure is applied" },
  "almond-milk": { kind: "borrow", from: "water", reason: "FDC 174832 weighs a cup at 262 g, 11 % denser than water, implausible for a drink 96.5 % water; water's measured measure is applied" },
  "oat-milk": { kind: "borrow", from: "whole-milk", reason: "FDC 2257046 publishes no portion; whole milk's measured measure (FDC 171265: 1 cup = 244 g) is applied" },
};

/** A line naming another form of a vector than the one FDC weighed: no portion applies. */
const LINE_FORM_REFUSALS: Readonly<Record<string, [RegExp, string]>> = {
  "rolled-oats": [/\bflour\b/i, "FDC weighed rolled flakes, not ground oat flour"],
};

/** Where a recipe names no qualifier and FDC weighed only qualified forms, the US convention taken. */
const DEFAULT_TAG: Readonly<Record<string, [string, string]>> = {
  "almond-flour": ["ground", "ground nut meal (FDC 170187: 1 cup, ground = 80 g)"],
  "brown-sugar": ["packed", "US recipes measure brown sugar packed"],
  "coconut-sugar": ["unpacked", "granulated coconut sugar read at the unpacked cup weight (FDC 168833: 1 cup unpacked = 145 g)"],
  "powdered-sugar": ["unsifted", "measured as it comes from the bag (unsifted)"],
  walnuts: ["chopped", "nuts read as chopped, the usual form in a batter"],
  pecans: ["chopped", "nuts read as chopped, the usual form in a batter"],
  raisins: ["unpacked", "raisins read as loosely filled (not packed)"],
  "semisweet-chocolate": ["chips", "read as regular chips (FDC's 6 oz-package chips)"],
  "fresh-cranberries": ["whole", "cranberries read as whole berries (FDC 171722: 1 cup, whole = 100 g) unless chopped is named"],
  "grated-carrot": ["grated", "carrot in a batter read as grated (FDC 170393: 1 cup grated = 110 g)"],
  zucchini: ["chopped", "zucchini read at FDC's chopped cup weight (FDC 169291: 1 cup, chopped = 124 g)"],
  apple: ["chopped", "cut apple read at FDC's chopped cup weight (FDC 171688: 1 cup, quartered or chopped = 125 g)"],
  pear: ["cubes", "cut pear read at FDC's cubed cup weight (FDC 169118: 1 cup, cubes = 161 g)"],
  flaxseed: ["whole", "flaxseed read as whole seed unless ground is named"],
};

const FOREIGN = /whipped|in shell|whole kernels|brownulated|edible yield|serving|racc|with hulls|with pits/;

/** Order matters: "unpacked" before "packed", "unsifted" before "sifted". */
const TAGS: ReadonlyArray<[RegExp, string]> = [
  [/\b(unpacked|not packed|loosely)\b/, "unpacked"],
  [/\bpacked\b/, "packed"],
  [/\bunsifted\b/, "unsifted"],
  [/\bsifted\b/, "sifted"],
  [/\bchopped\b/, "chopped"],
  [/\b(grated|shredded)\b/, "grated"],
  [/\b(cubes?|diced)\b/, "cubes"],
  [/\bground\b/, "ground"],
  [/\bwhole\b/, "whole"],
  [/\bhalves\b/, "halves"],
  [/\bpieces\b/, "pieces"],
  [/\bmini\b/, "mini"],
  [/\bmashed\b/, "mashed"],
  [/\bslices?\b|\bsliced\b/, "sliced"],
  [/\blarge chips\b/, "large chips"],
  [/\bchips\b/, "chips"],
];

export function tagOf(text: string): string | null {
  return TAGS.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}

const MEASURE_WORDS: ReadonlyArray<[RegExp, string, number]> = [
  [/^cups?\b/, "cup", 1],
  [/^(tbsp|tablespoons?)\b/, "tbsp", 1],
  [/^(tsp|teaspoons?)\b/, "tsp", 1],
  [/^fl oz\b/, "floz", 1],
  [/^ml\b/, "ml", 1],
  [/^quarts?\b/, "cup", 4],
  [/^(?:potato\s+)?(extra large|large|medium|small|jumbo|stick|packet)\b/, "count", 1],
];

interface Parsed {
  /** "cup" | "tbsp" | "tsp" | "floz" | "ml" | a count size. */
  measure: string;
  tag: string | null;
  gramsPerOne: number;
  label: string;
}

function parsePortion(p: FdcPortion): Parsed | null {
  const label = `${p.unit === "undetermined" ? "" : p.unit} ${p.modifier}`.trim().toLowerCase();
  // "1 cup, fluid (yields 2 cups whipped)" weighs the fluid: only words outside the parentheses name the form.
  if (FOREIGN.test(label.replace(/\([^)]*\)/g, " "))) return null;
  for (const [pattern, measure, scale] of MEASURE_WORDS) {
    const m = pattern.exec(label);
    if (m === null) continue;
    const [word, captured] = m;
    const rest = label.slice(word.length).replace(/\([^)]*\)/g, " ");
    return { measure: measure === "count" ? (captured ?? word) : measure, tag: tagOf(rest), gramsPerOne: p.grams / p.amount / scale, label: `${p.amount} ${label} = ${p.grams} g` };
  }
  return null;
}

function recordOf(vectorId: string): FdcBakingRecord | null {
  const fdcId = bakingIngredient(vectorId).fdc?.fdcId;
  return FDC_BAKING_RECORDS.find((r) => r.fdcId === fdcId) ?? null;
}

const ML: Readonly<Record<VolumeMeasure, number>> = { cup: CUP_ML, tbsp: CUP_ML / 16, tsp: CUP_ML / 48, floz: CUP_ML / 8, ml: 1 };
const SIBLINGS: readonly VolumeMeasure[] = ["cup", "tbsp", "tsp", "floz", "ml"];

function pick(all: readonly Parsed[], lineTag: string | null, vectorId: string): { parsed: Parsed; declared: string | null } | null {
  // A portion of exactly one measure reads most plainly ("1 tsp = 4.6 g" rather than "0.5 tsp = 2.3 g").
  const candidates = [...all].sort((a, b) => Number(!a.label.startsWith("1 ")) - Number(!b.label.startsWith("1 ")));
  if (candidates.length === 0) return null;
  const tagged = lineTag === null ? undefined : candidates.find((c) => c.tag === lineTag);
  if (tagged !== undefined) return { parsed: tagged, declared: null };
  const plain = candidates.find((c) => c.tag === null);
  if (plain !== undefined) return { parsed: plain, declared: null };
  const fallback = DEFAULT_TAG[vectorId];
  const conventional = fallback === undefined ? undefined : candidates.find((c) => c.tag === fallback[0]);
  if (conventional !== undefined && fallback !== undefined) return { parsed: conventional, declared: fallback[1] };
  const [first] = candidates;
  return first === undefined ? null : { parsed: first, declared: `FDC weighed this measure only as "${first.label}"` };
}

function weightFrom(record: FdcBakingRecord, measure: string, lineTag: string | null, vectorId: string): PortionWeight | null {
  const parsed = record.portions.map(parsePortion).filter((p): p is Parsed => p !== null);
  const exact = pick(parsed.filter((p) => p.measure === measure), lineTag, vectorId);
  if (exact !== null) {
    const how = `FDC ${record.fdcId}: ${exact.parsed.label}`;
    const kind = exact.declared === null ? "MEASURED" : "DECLARED";
    return { gramsPerOne: exact.parsed.gramsPerOne, basis: { ...basisOf(kind, "USDA_FDC", exact.declared ?? how), fdcId: record.fdcId }, how };
  }
  const target = SIBLINGS.find((s) => s === measure);
  if (target === undefined) return null;
  for (const sibling of SIBLINGS) {
    const found = pick(parsed.filter((p) => p.measure === sibling), lineTag, vectorId);
    if (found === null) continue;
    const gramsPerOne = (found.parsed.gramsPerOne * ML[target]) / ML[sibling];
    const how = `FDC ${record.fdcId}: ${found.parsed.label}, scaled to 1 ${target} (US customary ratio)`;
    return { gramsPerOne, basis: { ...basisOf(found.declared === null ? "DERIVED" : "DECLARED", "USDA_FDC", found.declared ?? how), fdcId: record.fdcId }, how };
  }
  return null;
}

/** Grams per one `measure` ("cup", "tbsp", "large", "stick"…) of a vector, or why there is no defensible figure. */
export function portionWeight(vectorId: string, measure: string, lineText: string): PortionResult {
  const source = PORTION_SOURCE[vectorId];
  if (source?.kind === "none") return { ok: false, reason: `no measured ${measure} weight: ${source.reason}` };
  const form = LINE_FORM_REFUSALS[vectorId];
  if (form?.[0].test(lineText) === true) return { ok: false, reason: `no measured ${measure} weight: ${form[1]}` };
  const recordId = source?.kind === "borrow" ? source.from : vectorId;
  const record = recordOf(recordId);
  if (record === null) return { ok: false, reason: `no FDC record, so no measured ${measure} weight` };
  const lineTag = source?.kind === "borrow" && source.tag !== undefined ? source.tag : tagOf(lineText.toLowerCase());
  const found = weightFrom(record, measure, lineTag, vectorId);
  if (found === null) return { ok: false, reason: `FDC ${record.fdcId} weighed no ${measure} of it` };
  if (source?.kind !== "borrow") return { ok: true, value: found };
  return { ok: true, value: { ...found, basis: { ...basisOf("DECLARED", "USDA_FDC", `${source.reason} (${found.how})`), fdcId: record.fdcId } } };
}
