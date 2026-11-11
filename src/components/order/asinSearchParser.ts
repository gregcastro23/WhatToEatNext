/**
 * Wire parser for `POST /api/amazon/search` as `OrderIngredientsModal` reads it.
 * It replaces the cast `(await res.json()) as { results?: Array<{ ingredient;
 * asin }> }`.
 *
 * Failure contract (the modal's `search()` swallows every throw — the tagged
 * search links cover every row anyway):
 *   - a body that is not a JSON object, or a `results` value that is present but
 *     not an array, THROWS (the old `for…of` over it threw too);
 *   - `results` absent/falsy returns `undefined` (the old `if (!json.results)`);
 *   - a row without a string `ingredient` is dropped — the old code would have
 *     thrown on `r.ingredient.toLowerCase()` for any such row that had an ASIN
 *     and so discarded the WHOLE batch; a missing/non-string `asin` becomes
 *     `null`, which the modal already skips.
 *
 * @file src/components/order/asinSearchParser.ts
 */

import { isJsonRecord, parseJsonRecord } from "@/lib/api/json";

export interface AsinSearchRow {
  ingredient: string;
  asin: string | null;
}

function parseRow(row: unknown): AsinSearchRow | null {
  if (!isJsonRecord(row)) return null;
  const { ingredient, asin } = row;
  if (typeof ingredient !== "string") return null;
  return { ingredient, asin: typeof asin === "string" ? asin : null };
}

export function parseAsinSearchResults(value: unknown): AsinSearchRow[] | undefined {
  const { results } = parseJsonRecord(value);
  if (!results) return undefined;
  if (!Array.isArray(results)) throw new TypeError("Expected `results` to be an array");
  const rows: readonly unknown[] = results;
  const parsed: AsinSearchRow[] = [];
  for (const row of rows) {
    const item = parseRow(row);
    if (item) parsed.push(item);
  }
  return parsed;
}
