/**
 * De-publish fully-fabricated "hollow" recipes.
 *
 * A small batch of public recipes are 100% generated placeholder shells: every
 * ingredient is a stub ("foundation of <dish>", "alchemical binding agent",
 * "aromatic catalyst", …) and the instructions are generic boilerplate that
 * applies to any dish ("Apply heat or acid to trigger the breakdown of cellular
 * structures", "capture the peak thermodynamic state"). They have a real dish
 * name and nothing else — there is no real ingredient or method data to recover.
 *
 * Showing "alchemical binding agent" as an ingredient is exactly the kind of
 * fabricated data this cleanup exists to remove, so we set `is_public = false`.
 * This is reversible (the rows stay in the DB) and removes them from every
 * user-facing surface, which all filter on `is_public = true`.
 *
 * A recipe is de-published only when EVERY one of its ingredients is a stub —
 * partially-real recipes (a stray stub among real ingredients) are left alone.
 *
 * Idempotent: once de-published, a recipe no longer matches the filter.
 *
 * Run:
 *   DATABASE_URL=postgresql://... bun scripts/depublishFabricatedRecipes.ts --dry-run
 *   DATABASE_URL=postgresql://... bun scripts/depublishFabricatedRecipes.ts
 */

import pkg from "pg";

const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required — set it in the environment before running this script.",
  );
}

const dryRun = process.argv.includes("--dry-run");

// Phrases that only ever appear in generated placeholder ingredient lists —
// no real ingredient is named any of these.
const STUB_INGREDIENT_PATTERN =
  "alchemical binding agent|aromatic catalyst|alchemical spice|foundation of |primary ingredient for |core element of ";

async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 4,
  });

  // Select public recipes where EVERY ingredient name is a stub.
  const selectFullyHollow = `
    WITH r AS (
      SELECT id, name,
             jsonb_array_length(read_model->'ingredients') AS n_ings,
             (SELECT count(*) FROM jsonb_array_elements(read_model->'ingredients') e
               WHERE lower(e->>'name') ~ $1) AS n_stub
        FROM recipes
       WHERE is_public = true
         AND jsonb_typeof(read_model->'ingredients') = 'array'
    )
    SELECT id, name FROM r WHERE n_ings > 0 AND n_stub = n_ings
  `;

  const { rows } = await pool.query<{ id: string; name: string }>(
    selectFullyHollow,
    [STUB_INGREDIENT_PATTERN],
  );

  console.log(
    `[depublish] fully-fabricated recipes: ${rows.length}${dryRun ? " (DRY RUN)" : ""}`,
  );
  for (const r of rows) console.log(`  - ${r.name}`);

  if (!dryRun && rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const res = await pool.query(
      `UPDATE recipes SET is_public = false, updated_at = NOW() WHERE id = ANY($1::uuid[])`,
      [ids],
    );
    console.log(`[depublish] de-published ${res.rowCount} recipes`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("[depublish] FAILED:", err);
  process.exit(1);
});
