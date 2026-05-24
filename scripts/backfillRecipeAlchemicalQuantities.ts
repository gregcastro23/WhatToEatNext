/**
 * Backfill Spirit/Essence/Matter/Substance totals for every recipe.
 *
 * For each recipe, sums per-ingredient ESMS via calculateRecipeAlchemicalQuantities
 * and writes the result into `read_model.alchemical_quantities` as:
 *
 *   {
 *     spirit:     number,   // Σ ingredient Spirit
 *     essence:    number,
 *     matter:     number,
 *     substance:  number,
 *     totalASharp: number,  // sum of the four (the "A#" metric)
 *     matchRate:  number,   // 0..1 — fraction of ingredients matched in catalog
 *   }
 *
 * Idempotent. Pass --only-missing to skip recipes that already have it.
 *
 * Run:
 *   DATABASE_URL=postgresql://... bun scripts/backfillRecipeAlchemicalQuantities.ts
 */

import pkg from "pg";
import { calculateRecipeAlchemicalQuantities } from "../src/utils/recipeAlchemicalQuantities";

const { Pool } = pkg;

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway";

const onlyMissing = process.argv.includes("--only-missing");

interface Row {
  id: string;
  name: string;
  ingredient_names: string[];
}

async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes(".railway.internal")
      ? false
      : { rejectUnauthorized: false },
    max: 4,
  });

  const where = onlyMissing
    ? `AND NOT (read_model ? 'alchemical_quantities')`
    : ``;

  const { rows } = await pool.query<Row>(
    `SELECT id, name,
            ARRAY(SELECT jsonb_array_elements(read_model->'ingredients')->>'name') AS ingredient_names
       FROM recipes
      WHERE jsonb_typeof(read_model) = 'object'
      ${where}`,
  );

  console.log(`[esms-backfill] candidates: ${rows.length}`);

  let updated = 0;
  let lowMatch = 0;
  let skipped = 0;

  for (const row of rows) {
    const names = (row.ingredient_names || []).filter(
      (n): n is string => typeof n === "string" && n.length > 0,
    );
    if (names.length === 0) {
      skipped++;
      continue;
    }

    const summary = calculateRecipeAlchemicalQuantities(names);
    if (summary.matchRate < 0.2) lowMatch++;

    const payload = {
      spirit: summary.totalSpirit,
      essence: summary.totalEssence,
      matter: summary.totalMatter,
      substance: summary.totalSubstance,
      totalASharp: summary.totalASharp,
      matchRate: summary.matchRate,
    };

    await pool.query(
      `UPDATE recipes
          SET read_model = jsonb_set(read_model, '{alchemical_quantities}', $2::jsonb, true),
              updated_at = NOW()
        WHERE id = $1`,
      [row.id, JSON.stringify(payload)],
    );
    updated++;
    if (updated % 100 === 0) {
      console.log(`[esms-backfill] ${updated}/${rows.length} written`);
    }
  }

  console.log(
    `[esms-backfill] done: updated=${updated}, low-match (<20%)=${lowMatch}, skipped=${skipped}, total=${rows.length}`,
  );

  await pool.end();
}

main().catch((err) => {
  console.error("[esms-backfill] FAILED:", err);
  process.exit(1);
});
