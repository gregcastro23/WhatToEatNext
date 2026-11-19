/**
 * A site recipe → Baking Lab inputs, with the mapping report that says how.
 *
 * Grams come from the lines (readLines); oven, time and pan from the steps
 * (readInstructions); everything the recipe does not say from its category's
 * DECLARED profile (processProfiles). Each supplied value is listed in the
 * report with its basis, each value read from the recipe with its quote, and
 * the verdict says whether the result may be simulated at all — a refused
 * good has no lab inputs, only its report.
 *
 * @file src/lib/baking/recipes/convertRecipe.ts
 */
import { basisOf } from "@/data/baking/basis";
import { plateFor, shapeFor, type ShapeResult } from "./geometry";
import { BAGUETTE, BRAIDED_LOAF, FOAM_CAKE, PRETZEL_ROPE, PROCESS_PROFILES, ROLLED_FLATBREAD, TWICE_BAKED_THICKNESS, type Declared, type ProcessProfile } from "./processProfiles";
import { readInstructions, type InstructionReading } from "./readInstructions";
import { readLines, type ReadLines } from "./readLines";
import { unreadMassShare, verdictFor } from "./verdict";
import type { Assumption, ConvertedGood, MappingReport, RecipeSource, StatedValue } from "./sourceTypes";
import type { BakeProcess, BakingPreset, FormulaLine, OvenSettings, ProductGeometry } from "../formulaTypes";

export const GOOD_CATEGORY_LABELS: Readonly<Record<RecipeSource["category"], string>> = {
  bread: "Bread",
  "enriched-bread": "Enriched bread",
  flatbread: "Flatbread & pizza",
  "quick-bread": "Quick bread",
  muffin: "Muffin",
  "biscuit-scone": "Biscuit & scone",
  cookie: "Cookie",
  bar: "Bar & brownie",
  cake: "Cake",
  cracker: "Cracker & rusk",
  pastry: "Pastry",
  "pie-tart": "Pie & tart",
};

/** One line per vector, in first-appearance order, grams summed and rounded to 0.1 g. */
export function formulaLines(read: ReadLines): FormulaLine[] {
  const grams = new Map<string, number>();
  for (const m of read.matched) grams.set(m.vectorId, (grams.get(m.vectorId) ?? 0) + m.grams);
  return [...grams.entries()].map(([ingredientId, g]) => ({ ingredientId, grams: Math.round(g * 10) / 10 }));
}

class Notes {
  readonly assumptions: Assumption[] = [];
  readonly stated: StatedValue[] = [];

  use<T>(field: string, d: Declared<T>, show: (v: T) => string): T {
    this.assumptions.push({ field, value: show(d.value), basis: basisOf("DECLARED", "MODEL", d.why) });
    return d.value;
  }
}

function profileFor(source: RecipeSource, base: ProcessProfile): ProcessProfile {
  const n = source.name.toLowerCase();
  if (source.category === "cake" && /genoise|sponge/.test(n)) return { ...base, ...FOAM_CAKE };
  if (source.category === "flatbread" && /\b(pitas?|naan|manakish|manaeesh|flatbreads?|mini pizzas?|lavash)\b/.test(n)) return { ...base, shape: { kind: "pieces", form: "slab", thicknessM: ROLLED_FLATBREAD } };
  if (base.shape.kind === "pieces" && /biscotti|rusk|paximadia|biscottate/.test(n)) return { ...base, shape: { ...base.shape, thicknessM: TWICE_BAKED_THICKNESS } };
  return base;
}

function ovenTemperature(reading: InstructionReading, profile: ProcessProfile, notes: Notes): number {
  const stated = reading.ovenC;
  if (stated === null) return notes.use("oven temperature", profile.ovenC, (c) => `${c} °C`);
  const c = Math.round(stated.value.celsius);
  notes.stated.push({ field: "oven temperature", value: `${c} °C${stated.value.fromFahrenheit ? " (from °F)" : ""}`, quote: stated.quote });
  if (stated.value.unitAssumed) notes.assumptions.push({ field: "oven temperature", value: `${c} °C`, basis: basisOf("DECLARED", "MODEL", "the recipe gives degrees with no unit; read as °F (a US recipe)") });
  return c;
}

function secondStageOven(reading: InstructionReading, bakeMinutes: number, notes: Notes): { stage2OvenC: number | null; stage1Minutes: number | null } {
  if (reading.laterOvenC === null) return { stage2OvenC: null, stage1Minutes: null };
  const stage2OvenC = Math.round(reading.laterOvenC);
  const statedSplit = reading.stage1Minutes ?? null;
  if (statedSplit !== null && statedSplit > 0 && statedSplit < bakeMinutes) {
    notes.stated.push({ field: "stage-2 oven temperature", value: `${stage2OvenC} °C after ${statedSplit} min`, quote: reading.ovenC?.quote ?? `${stage2OvenC} °C` });
    return { stage2OvenC, stage1Minutes: statedSplit };
  }
  const stage1Minutes = Math.max(1, Math.round(bakeMinutes / 2));
  notes.assumptions.push({ field: "stage-2 oven temperature", value: `${stage2OvenC} °C after ${stage1Minutes} min`, basis: basisOf("DECLARED", "MODEL", `the recipe later changes to ${stage2OvenC} °C without a first-stage duration; stepped at half the bake`) });
  return { stage2OvenC, stage1Minutes };
}

function bakeTime(source: RecipeSource, reading: InstructionReading, profile: ProcessProfile, notes: Notes): number {
  if (reading.bakeMinutes !== null) {
    const [low, high] = reading.bakeMinutes.value;
    notes.stated.push({ field: "bake time", value: low === high ? `${high} min` : `${low}–${high} min`, quote: reading.bakeMinutes.quote });
    return high;
  }
  if (reading.doneC !== null) {
    const why = `the steps give no time but say bake to an internal ${Math.round(reading.doneC.value)} °C; the lab bakes long enough to reach it${source.cookMinutes === null ? "" : ` (the recipe's ${source.cookMinutes}-min cook-time field is not used)`}`;
    return notes.use("bake time", { value: profile.bakeMinutes.value, why }, (m) => `${m} min`);
  }
  if (source.cookMinutes !== null && source.cookMinutes > 0) {
    notes.stated.push({ field: "bake time", value: `${source.cookMinutes} min`, quote: `the recipe's cook time: ${source.cookMinutes} min` });
    return source.cookMinutes;
  }
  return notes.use("bake time", profile.bakeMinutes, (m) => `${m} min`);
}

function ovenFor(source: RecipeSource, reading: InstructionReading, profile: ProcessProfile, notes: Notes): OvenSettings {
  const ovenC = ovenTemperature(reading, profile, notes);
  const bakeMinutes = Math.min(Math.max(bakeTime(source, reading, profile, notes), 1), 240);
  const { stage2OvenC, stage1Minutes } = secondStageOven(reading, bakeMinutes, notes);
  const plate = notes.use("pan", plateFor(reading.plate?.value ?? null), (p) => `${p.materialId}, ${p.thicknessMm} mm`);
  const stone = reading.plate?.value === "stone";
  const steam = reading.steam === null ? null : notes.use("steam", { value: { fraction: 0.5, minutes: 15 }, why: `the recipe calls for steam ("${reading.steam.quote}"); 50 % vapour for 15 min as the sourdough preset` }, (s) => `${s.fraction * 100} % for ${s.minutes} min`);
  notes.use("elevation", { value: 0, why: "sea level, as the curated presets (set your own)" }, (m) => `${m} m`);
  return { ovenC, stage2OvenC, stage1Minutes, mode: stone ? "deck" : "conventional", fanMs: 0, steamFraction: steam?.fraction ?? 0, steamMinutes: steam?.minutes ?? 0, bakeMinutes, elevationM: 0, plate };
}

function fixedShapeOf(source: RecipeSource): Declared<ProductGeometry> | null {
  if (/\b(pretzels?|breadsticks?|grissini)\b/i.test(source.name)) return PRETZEL_ROPE;
  if (/\bbaguettes?\b/i.test(source.name)) return BAGUETTE;
  if (/\bchallah\b/i.test(source.name) || source.steps.some((s) => /\bbraid/i.test(s))) return BRAIDED_LOAF;
  return null;
}

function shapeOf(source: RecipeSource, profile: ProcessProfile, reading: InstructionReading, read: ReadLines, density: number): ShapeResult | string {
  const batterG = read.matched.reduce((sum, m) => sum + m.grams, 0);
  const piecesByName = /\b(rolls?|buns?|bagels?|pretzels?|knots?|pitas?|manakish|biscuits?|scones?)\b/i.test(source.name);
  const fixedShape = fixedShapeOf(source);
  const shape = shapeFor({ rule: profileFor(source, profile).shape, batterMl: batterG / density, reading, servings: source.servings, piecesByName, fixedShape });
  return shape.ok ? shape.value : shape.reason;
}

function build(source: RecipeSource, read: ReadLines, reading: InstructionReading, base: ProcessProfile, shape: ShapeResult, notes: Notes): BakingPreset {
  const profile = profileFor(source, base);
  const process: BakeProcess = {
    densityGPerMl: notes.use("batter density", profile.densityGPerMl, (v) => `${v} g/mL`),
    startC: notes.use("batter temperature", profile.startC, (v) => `${v} °C`),
  };
  notes.assumptions.push(...shape.assumptions);
  notes.stated.push(...shape.stated);
  const oven = ovenFor(source, reading, profile, notes);
  const doneCoreC = reading.doneC === null ? notes.use("done at core", profile.doneCoreC, (v) => `${v} °C`) : Math.round(reading.doneC.value);
  if (reading.doneC !== null) notes.stated.push({ field: "done at core", value: `${doneCoreC} °C`, quote: reading.doneC.quote });
  return {
    id: source.id,
    name: source.name,
    blurb: `${GOOD_CATEGORY_LABELS[source.category]} · ${source.cuisine} — converted from the site's recipe`,
    formula: { id: source.id, name: source.name, lines: formulaLines(read) },
    process,
    geometry: shape.geometry,
    oven,
    doneCoreC,
    basisNote: "Converted from the site recipe: grams from USDA-measured portions, process figures DECLARED by category (see the mapping report).",
  };
}

/** The recipe's own bake time: its steps first; its cook-time field only when the steps state neither a time nor a done temperature. */
export function statedBakeMinutes(source: RecipeSource, reading: InstructionReading): readonly [number, number] | null {
  if (reading.bakeMinutes !== null) return reading.bakeMinutes.value;
  if (reading.doneC !== null || source.cookMinutes === null || source.cookMinutes <= 0) return null;
  return [source.cookMinutes, source.cookMinutes];
}

/** Convert one recipe. Pure: the same source always gives the same good and report. */
export function convertRecipe(source: RecipeSource): ConvertedGood {
  const read = readLines(source.lines);
  const reading = readInstructions(source.steps);
  const share = unreadMassShare(read);
  const { category } = source;
  const base = PROCESS_PROFILES[category];
  const density = base === undefined ? 1 : profileFor(source, base).densityGPerMl.value;
  const shape = base === undefined ? null : shapeOf(source, base, reading, read, density);
  const verdict = verdictFor(category, read, share, typeof shape === "string" ? shape : null, source.name);
  const notes = new Notes();
  const preset = verdict.simulable && base !== undefined && shape !== null && typeof shape !== "string" ? build(source, read, reading, base, shape, notes) : null;
  const report: MappingReport = {
    matched: read.matched,
    unmatched: read.unmatched,
    setAside: read.setAside,
    assumptions: [...read.assumptions, ...notes.assumptions],
    stated: notes.stated,
    unreadMassShare: share,
    verdict,
    statedBakeMinutes: statedBakeMinutes(source, reading),
  };
  return { preset, report };
}
