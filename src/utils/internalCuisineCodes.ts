/**
 * Internal archive/collection codes that appear in the recipes DB `cuisine`
 * field (both the `cuisine` column and `read_model->>'cuisine'`) but are not
 * real cuisines. They must never surface publicly — neither as a visible
 * label nor in schema.org structured data (recipeCuisine / keywords).
 *
 * "Hsca" is the archive code of the bulk-imported recipe collection
 * (see scripts/generateHscaCuisine.ts); ~500 public recipes carry it.
 * The read_model is periodically recomputed by backfill pipelines, so the
 * durable fix is this display-level guard rather than nulling the DB value.
 */
const INTERNAL_CUISINE_CODES = new Set(["hsca"]);

export function isInternalCuisineCode(value: unknown): boolean {
  return (
    typeof value === "string" &&
    INTERNAL_CUISINE_CODES.has(value.trim().toLowerCase())
  );
}

/**
 * Pass a cuisine value through only if it is publicly displayable.
 * Internal archive codes (and empty values) come back as undefined so
 * callers render nothing instead of the code.
 */
export function publicCuisine(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || isInternalCuisineCode(trimmed)) return undefined;
  return trimmed;
}
