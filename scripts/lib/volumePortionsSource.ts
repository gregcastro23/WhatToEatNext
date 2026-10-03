/**
 * Render `src/data/cooking/measuredPortions.ts` — USDA's measured cup, tbsp
 * and tsp weights — from the portions recorded in
 * `scripts/data/usda-portions.json`. Pure and deterministic, so a test can
 * prove the committed file is exactly what this produces.
 *
 * @file scripts/lib/volumePortionsSource.ts
 */
import { z } from "zod";

const record = z.object({
  ingredient: z.string(),
  fdcId: z.number().int(),
  fdcDescription: z.string(),
  retrieved: z.string(),
  portions: z.array(
    z.object({ amount: z.number(), unit: z.string(), modifier: z.string().nullable(), gramWeight: z.number() }),
  ),
});
const portionsFile = z.object({ results: z.array(record) });
const compositionFile = z.object({ results: z.array(z.object({ ingredient: z.string() })) });
type FdcRecord = z.infer<typeof record>;

const MEASURES: ReadonlyMap<string, string> = new Map([
  ["cup", "cup"],
  ["tbsp", "tbsp"],
  ["tablespoon", "tbsp"],
  ["tsp", "tsp"],
  ["teaspoon", "tsp"],
]);

/**
 * Qualifiers that weigh something other than the ingredient as a recipe
 * measures it. Such a portion is never the ingredient's cup or spoon.
 *
 * - "whipped" is a different state of the food: half of it is air. FDC 170859
 *   (heavy whipping cream) says so itself — "1 cup, fluid (yields 2 cups
 *   whipped)" = 238 g against "1 cup, whipped" = 120 g — and its plain tbsp
 *   (15 g) is the fluid one (238 / 16 = 14.9). Taken first, it had made every
 *   recipe's cup of cream weigh half what it does.
 * - "in shell" fills the cup with shells: FDC 170187 yields 28 g of walnut from
 *   it.
 * - "cherry" is another item: FDC 170457 (tomatoes, red, ripe) weighs "cup
 *   cherry tomatoes" (149 g) of whole cherry tomatoes, which it also counts
 *   apart ("cherry", 17 g each) from the round tomato the record describes.
 *
 * A cut — chopped, diced, sliced, grated, crumbled, ground, whole — is the
 * same food measured another way, and stays.
 */
const NOT_THE_INGREDIENT: readonly RegExp[] = [/\bwhipped\b/i, /\bin shell\b/i, /\bcherry\b/i];

/** A qualifier's own words, without its parenthetical ("fluid (yields 2 cups whipped)" is fluid). */
function describesAnotherFood(qualifier: string | undefined): boolean {
  const words = (qualifier ?? "").replace(/\([^)]*\)/g, "");
  return NOT_THE_INGREDIENT.some((pattern) => pattern.test(words));
}

interface Weighed {
  qualifier?: string;
  grams: number;
}

/** A measure's one weight, or the several cuts USDA weighed it at. */
type MeasureWeight = { kind: "single"; weighed: Weighed } | { kind: "cuts"; cuts: Weighed[] };

/**
 * "cup" is a plain cup; "cup, chopped" and "cup chopped" are a cup qualified
 * "chopped". Anything else ("serving 1/4 cup", "fl oz") is not read.
 *
 * The comma carries no meaning: FDC writes the same measurement both ways.
 * FDC 170000 (onions, raw) weighs "cup, chopped" at 160 g and "tbsp chopped"
 * at 10 g, and 160 / 16 = 10; FDC 170005 (scallions) weighs "cup, chopped" at
 * 100 g and "tbsp chopped" at 6 g (100 / 16 = 6.25).
 */
function readLabel(label: string): { measure: string; qualifier?: string } | null {
  const match = /^(cup|tbsp|tablespoon|tsp|teaspoon)(?:,?\s+(.+))?$/i.exec(label.trim());
  const measure = MEASURES.get(match?.[1]?.toLowerCase() ?? "");
  if (match === null || measure === undefined) return null;
  const qualifier = match[2];
  return qualifier === undefined ? { measure } : { measure, qualifier };
}

/**
 * A measure's weight: its first plain portion; else its one weight, when
 * every qualified portion agrees; else each cut, for a recipe line to name.
 */
function resolveMeasure(all: readonly Weighed[]): MeasureWeight | null {
  const first = all.find((w) => w.qualifier === undefined) ?? all[0];
  if (first === undefined) return null;
  if (first.qualifier === undefined || new Set(all.map((w) => w.grams)).size === 1) {
    return { kind: "single", weighed: first };
  }
  return { kind: "cuts", cuts: [...all] };
}

/** Each measure's weight. A portion of another food (`NOT_THE_INGREDIENT`) is never read. */
function weighMeasures(portions: FdcRecord["portions"]): Map<string, MeasureWeight> {
  const read = new Map<string, Weighed[]>();
  for (const p of portions) {
    const label = readLabel(p.modifier ?? p.unit);
    if (label === null || !(p.amount > 0) || describesAnotherFood(label.qualifier)) continue;
    const weighed: Weighed = { grams: p.gramWeight / p.amount };
    if (label.qualifier !== undefined) weighed.qualifier = label.qualifier;
    read.set(label.measure, [...(read.get(label.measure) ?? []), weighed]);
  }
  const chosen = new Map<string, MeasureWeight>();
  for (const [measure, all] of read) {
    const weight = resolveMeasure(all);
    if (weight !== null) chosen.set(measure, weight);
  }
  return chosen;
}

function cutLines(measures: Map<string, MeasureWeight>): string[] {
  const lines: string[] = [];
  for (const [measure, weight] of measures) {
    if (weight.kind !== "cuts") continue;
    lines.push(`      ${measure}: [`);
    for (const cut of weight.cuts) lines.push(`        { as: ${JSON.stringify(cut.qualifier ?? "")}, grams: ${cut.grams} },`);
    lines.push("      ],");
  }
  return lines.length > 0 ? ["    cuts: {", ...lines, "    },"] : [];
}

function rowLines(r: FdcRecord, measures: Map<string, MeasureWeight>): string[] {
  const single = [...measures].flatMap(([measure, w]) => (w.kind === "single" ? [{ measure, ...w.weighed }] : []));
  const grams = single.map((w) => `${w.measure}: ${w.grams}`).join(", ");
  const qualified = single.flatMap((w) => (w.qualifier === undefined ? [] : [`${w.measure}: ${JSON.stringify(w.qualifier)}`]));
  return [
    "  {",
    `    ingredient: ${JSON.stringify(r.ingredient)},`,
    `    fdcId: ${r.fdcId},`,
    `    fdcDescription: ${JSON.stringify(r.fdcDescription)},`,
    `    retrieved: ${JSON.stringify(r.retrieved)},`,
    `    gramsPer: ${grams.length > 0 ? `{ ${grams} }` : "{}"},`,
    ...(qualified.length > 0 ? [`    measuredAs: { ${qualified.join(", ")} },`] : []),
    ...cutLines(measures),
    "  },",
  ];
}

const HEADER = `/**
 * MEASURED household-measure weights, from USDA FoodData Central.
 *
 * ⚠️ GENERATED — do not hand-edit. Regenerate with:
 *     bun run generate:volume-portions        (offline, from scripts/data/usda-portions.json)
 *     FDC_API_KEY=… bun run fetch:portions    (refetch, then regenerate)
 * The rules are in scripts/lib/volumePortionsSource.ts. Every row carries the
 * \`fdcId\` it came from, so any figure here can be checked against its source.
 *
 * ── Why this file has to exist ──────────────────────────────────────────────
 *
 * \`src/utils/unitConversion.ts\` converts every volume unit as if the ingredient
 * were water — 1 cup = 240 g for flour, oil and cilantro alike. \`[MEASURED
 * 2026-08-18]\` across the 1,078-recipe corpus that overstates the total mass of
 * volume-measured ingredients by 11.6 %, and individual errors reach 15x: a cup
 * of chopped cilantro is scored 240 g against a measured 16 g.
 *
 * ── Why composition could not fix it ────────────────────────────────────────
 *
 * Choi & Okos predicts TRUE density — the density of the material itself. A cup
 * of flour is mostly the air between particles: flour's true density is near
 * 1450 kg·m⁻³ while a scooped cup is about 528 kg·m⁻³, so roughly 64 % of that
 * cup is air. For a liquid the two coincide; for anything granular or leafy the
 * packing has to be MEASURED, and that is what these numbers are.
 *
 * @file src/data/cooking/measuredPortions.ts
 */

/** The volume measures a recipe actually uses. */
export type VolumeMeasure = "cup" | "tbsp" | "tsp";

/** One way USDA weighed a measure: "chopped", "ground". */
export interface MeasuredCut {
  /** FDC's own words for what it weighed. */
  as: string;
  /** Grams per ONE measure of this cut. */
  grams: number;
}

export interface MeasuredPortion {
  /** Matches the \`ingredient\` key used by the USDA composition fetch. */
  ingredient: string;
  /** The FoodData Central record these weights were measured on. */
  fdcId: number;
  fdcDescription: string;
  /** ISO date the source was read. FDC revises records. */
  retrieved: string;
  /** Grams per ONE of each measure. Absent means USDA published none. */
  gramsPer: Partial<Record<VolumeMeasure, number>>;
  /**
   * The preparation USDA measured, where the portion was qualified —
   * "chopped", "ground", "shredded". Present only for a qualified measure; an
   * unqualified one always wins over a qualified one for the same measure, and
   * a qualifier naming another food ("whipped", "in shell", "cherry") is
   * never used.
   *
   * It matters: a cup of CHOPPED onion and a cup of whole onion are different
   * masses, and the reader deserves to know which was weighed.
   */
  measuredAs?: Partial<Record<VolumeMeasure, string>>;
  /**
   * A measure USDA weighed only qualified, several ways, at different weights:
   * a cup of walnuts is 80 g ground and 117 g chopped. No one of them is the
   * ingredient's cup, so the measure is absent from \`gramsPer\`, and a recipe
   * line is weighed only when its own words name exactly one cut (see
   * \`volumeToMass\`).
   */
  cuts?: Partial<Record<VolumeMeasure, readonly MeasuredCut[]>>;
}
`;

const FOOTER = [
  "",
  "/** Lookup by ingredient name, case-insensitive. */",
  "export const PORTIONS_BY_INGREDIENT: ReadonlyMap<string, MeasuredPortion> = new Map(",
  "  MEASURED_PORTIONS.map((p) => [p.ingredient.toLowerCase(), p]),",
  ");",
  "",
];

/**
 * The generated file's text. Rows are the composition set's records (those
 * `fetch-usda-composition.mjs` resolved) that USDA weighed by volume; records
 * fetched only for count portions are not read here.
 */
export function renderVolumePortions(portionsJson: unknown, compositionJson: unknown): string {
  const composition = new Set(compositionFile.parse(compositionJson).results.map((r) => r.ingredient));
  const rows = portionsFile
    .parse(portionsJson)
    .results.filter((r) => composition.has(r.ingredient))
    .map((r) => ({ r, measures: weighMeasures(r.portions) }))
    .filter(({ measures }) => measures.size > 0);
  const body = rows.flatMap(({ r, measures }) => rowLines(r, measures));
  return [HEADER, "export const MEASURED_PORTIONS: readonly MeasuredPortion[] = [", ...body, "];", ...FOOTER].join("\n");
}
