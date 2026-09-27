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

interface Weighed {
  qualifier?: string;
  grams: number;
}

/** "cup" is a plain cup; "cup, chopped" a cup qualified "chopped". Anything else is not read. */
function readLabel(label: string): { measure: string; qualifier?: string } | null {
  const match = /^(cup|tbsp|tablespoon|tsp|teaspoon)(?:, (.+))?$/i.exec(label.trim());
  const measure = MEASURES.get(match?.[1]?.toLowerCase() ?? "");
  if (match === null || measure === undefined) return null;
  const qualifier = match[2];
  return qualifier === undefined ? { measure } : { measure, qualifier };
}

/**
 * Each measure's weight. The first portion read wins, except that a plain
 * measure always replaces a qualified one.
 */
function weighMeasures(portions: FdcRecord["portions"]): Map<string, Weighed> {
  const chosen = new Map<string, Weighed>();
  for (const p of portions) {
    const read = readLabel(p.modifier ?? p.unit);
    if (read === null || !(p.amount > 0)) continue;
    const weighed: Weighed = { grams: p.gramWeight / p.amount };
    if (read.qualifier !== undefined) weighed.qualifier = read.qualifier;
    const current = chosen.get(read.measure);
    if (current === undefined || (current.qualifier !== undefined && read.qualifier === undefined)) {
      chosen.set(read.measure, weighed);
    }
  }
  return chosen;
}

function rowLines(r: FdcRecord, measures: Map<string, Weighed>): string[] {
  const entries = [...measures];
  const grams = entries.map(([m, w]) => `${m}: ${w.grams}`).join(", ");
  const qualified = entries.flatMap(([m, w]) => (w.qualifier === undefined ? [] : [`${m}: ${JSON.stringify(w.qualifier)}`]));
  return [
    "  {",
    `    ingredient: ${JSON.stringify(r.ingredient)},`,
    `    fdcId: ${r.fdcId},`,
    `    fdcDescription: ${JSON.stringify(r.fdcDescription)},`,
    `    retrieved: ${JSON.stringify(r.retrieved)},`,
    `    gramsPer: { ${grams} },`,
    ...(qualified.length > 0 ? [`    measuredAs: { ${qualified.join(", ")} },`] : []),
    "  },",
  ];
}

const HEADER = `/**
 * MEASURED household-measure weights, from USDA FoodData Central.
 *
 * ⚠️ GENERATED — do not hand-edit. Regenerate with:
 *     FDC_API_KEY=… bun run fetch:portions
 * then re-run the generator in that script's docs. Every row carries the
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
   * unqualified one always wins over a qualified one for the same measure.
   *
   * It matters: a cup of CHOPPED onion and a cup of whole onion are different
   * masses, and the reader deserves to know which was weighed.
   */
  measuredAs?: Partial<Record<VolumeMeasure, string>>;
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
