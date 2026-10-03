/**
 * Render `src/data/cooking/measuredCountPortions.ts` from the USDA portions
 * recorded in `scripts/data/usda-portions.json`. Pure and deterministic, so a
 * test can prove the committed file is exactly what this produces.
 *
 * Every entry keeps FDC's label, amount and gram weight VERBATIM. Which labels
 * count as which unit is decided in `./fdcCountLabels`.
 *
 * @file scripts/lib/countPortionsSource.ts
 */
import { z } from "zod";
import { COUNT_UNITS, parseCountLabel } from "./fdcCountLabels";

const portionsFile = z.object({
  results: z.array(
    z.object({
      ingredient: z.string(),
      fdcId: z.number().int(),
      fdcDescription: z.string(),
      retrieved: z.string(),
      portions: z.array(
        z.object({ amount: z.number(), unit: z.string(), modifier: z.string().nullable(), gramWeight: z.number() }),
      ),
    }),
  ),
});
type FdcRecord = z.infer<typeof portionsFile>["results"][number];

interface Entry {
  count: string;
  qualifier?: string;
  label: string;
  amount: number;
  gramWeight: number;
}

/** A record's count portions. A repeat of the same unit at the same per-item weight is dropped. */
function countEntries(record: FdcRecord): Entry[] {
  const entries: Entry[] = [];
  for (const p of record.portions) {
    const label = p.modifier ?? p.unit;
    const parsed = parseCountLabel(label, record.ingredient);
    if (parsed === null || !(p.amount > 0 && p.gramWeight > 0)) continue;
    const perItem = p.gramWeight / p.amount;
    const repeat = entries.find(
      (e) => e.count === parsed.count && e.qualifier === parsed.qualifier && e.gramWeight / e.amount === perItem,
    );
    if (repeat === undefined) entries.push({ ...parsed, label, amount: p.amount, gramWeight: p.gramWeight });
  }
  return entries;
}

function entryLine(e: Entry): string {
  const qualifier = e.qualifier === undefined ? "" : ` qualifier: ${JSON.stringify(e.qualifier)},`;
  return `    { count: ${JSON.stringify(e.count)},${qualifier} label: ${JSON.stringify(e.label)}, amount: ${e.amount}, gramWeight: ${e.gramWeight} },`;
}

function rowLines(record: FdcRecord, entries: Entry[]): string[] {
  const head =
    `  { ingredient: ${JSON.stringify(record.ingredient)}, fdcId: ${record.fdcId}, ` +
    `fdcDescription: ${JSON.stringify(record.fdcDescription)}, retrieved: ${JSON.stringify(record.retrieved)}, counts: [`;
  return [head, ...entries.map(entryLine), "  ] },"];
}

const HEADER = `/**
 * MEASURED count-portion weights ("1 large", "1 stalk", "1 fruit"), from USDA
 * FoodData Central.
 *
 * ⚠️ GENERATED — do not hand-edit. Regenerate with:
 *     bun run generate:count-portions          (offline, from scripts/data/usda-portions.json)
 *     FDC_API_KEY=… bun run fetch:portions     (refetch, then regenerate)
 *
 * Each entry is FDC's own label, amount and gram weight, verbatim, under the
 * record (\`fdcId\`) it was weighed on. \`count\` is the unit a recipe would write;
 * \`qualifier\` is present when USDA weighed only a qualified form of it
 * ("stalk, medium"), and such an entry is never a plain stalk.
 *
 * @file src/data/cooking/measuredCountPortions.ts
 */

/** Every count unit USDA's labels are read as. */
export type CountUnit = ${COUNT_UNITS.map((u) => JSON.stringify(u)).join(" | ")};

export interface MeasuredCount {
  count: CountUnit;
  /** USDA's qualifier on the unit ("medium" in "stalk, medium"). Absent when unqualified. */
  qualifier?: string;
  /** FDC's label for the portion, verbatim. */
  label: string;
  /** How many of \`count\` USDA weighed together ("9 sprigs"). */
  amount: number;
  gramWeight: number;
}

export interface MeasuredCountRow {
  /** The catalog ingredient's \`name:\`, or a composition key an alias maps it to. */
  ingredient: string;
  /** The FoodData Central record these weights were measured on. */
  fdcId: number;
  fdcDescription: string;
  /** ISO date the source was read. FDC revises records. */
  retrieved: string;
  counts: readonly MeasuredCount[];
}
`;

/** The generated file's full text, and how many records and portions it holds. */
export function renderCountPortions(portionsJson: unknown): { source: string; records: number; portions: number } {
  const { results } = portionsFile.parse(portionsJson);
  const rows = results
    .map((record) => ({ record, entries: countEntries(record) }))
    .filter(({ entries }) => entries.length > 0);
  const lines = [
    HEADER,
    "export const MEASURED_COUNT_PORTIONS: readonly MeasuredCountRow[] = [",
    ...rows.flatMap(({ record, entries }) => rowLines(record, entries)),
    "];",
    "",
    "/** Lookup by ingredient name, case-insensitive. */",
    "export const COUNT_PORTIONS_BY_INGREDIENT: ReadonlyMap<string, MeasuredCountRow> = new Map(",
    "  MEASURED_COUNT_PORTIONS.map((row) => [row.ingredient.toLowerCase(), row]),",
    ");",
  ];
  return {
    source: `${lines.join("\n")}\n`,
    records: rows.length,
    portions: rows.reduce((n, r) => n + r.entries.length, 0),
  };
}
