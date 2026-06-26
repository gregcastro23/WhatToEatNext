/**
 * Backfill per-serving nutrition for every recipe.
 *
 * Production recipes ship with an empty `nutritional_profile` (`{}`) — the
 * column and `read_model.nutritional_profile` were never populated, so the
 * recipe detail page and JSON-LD render no nutrition at all. This script
 * computes real per-serving nutrition by aggregating each recipe's ingredient
 * nutrition (via `computeRecipeNutritionFromIngredients`, the same aggregator
 * the static `getServerRecipes()` path already uses), then writes the result
 * into BOTH `read_model.nutritional_profile` (the live read path) and the
 * `nutritional_profile` column (so a raw prod query reflects the fix).
 *
 * Honesty guards — this never fabricates a total:
 *   - the aggregator returns null unless >=50% of ingredients resolve, and
 *   - `isPlausibleNutrition` rejects stub-tiny (<40 cal), implausibly-huge
 *     (>2000 cal), or zero-macro results.
 * Recipes that fail either guard are LEFT EMPTY (honest "unknown"), not stubbed.
 *
 * Idempotent. Deterministic for a fixed ingredient catalog, so re-running
 * overwrites with the same values. `--only-missing` skips recipes that already
 * carry plausible nutrition. `--dry-run` computes + reports coverage without
 * writing.
 *
 * Run (dry-run first):
 *   DATABASE_URL=postgresql://... bun scripts/backfillRecipeNutrition.ts --dry-run
 *   DATABASE_URL=postgresql://... bun scripts/backfillRecipeNutrition.ts --only-missing
 */

import pkg from "pg";
import { computeRecipeNutritionFromIngredients } from "../src/utils/ingredientNutritionAggregation";
import { isPlausibleNutrition } from "../src/utils/recipeNutrition";

const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required — set it in the environment before running this backfill script.",
  );
}

const dryRun = process.argv.includes("--dry-run");
const onlyMissing = process.argv.includes("--only-missing");
// --reconcile also CLEARS nutrition for recipes that can no longer produce a
// plausible total — needed after the ingredient catalog's fake nutrition stubs
// were nulled (PR #560), which had poisoned some recipes' aggregated nutrition.
// Mutually exclusive with --only-missing (reconcile must see every recipe).
const reconcile = process.argv.includes("--reconcile");

if (reconcile && onlyMissing) {
  throw new Error(
    "--reconcile and --only-missing are mutually exclusive: reconcile must evaluate every recipe.",
  );
}

interface IngredientRow {
  name?: unknown;
  amount?: unknown;
  unit?: unknown;
}

interface Row {
  id: string;
  name: string;
  ingredients: IngredientRow[] | null;
  servings: number | null;
  has_nutrition: boolean;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Round every numeric field so we store tidy values, not 17-digit floats. */
function roundNutrition(n: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(n)) {
    out[k] = typeof v === "number" ? round(v) : v;
  }
  return out;
}

async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes(".railway.internal")
      ? false
      : { rejectUnauthorized: false },
    max: 4,
  });

  // A recipe "already has" nutrition when read_model.nutritional_profile holds
  // a non-empty object with a positive calorie count.
  const hasNutritionExpr = `(
    jsonb_typeof(read_model->'nutritional_profile') = 'object'
    AND coalesce((read_model->'nutritional_profile'->>'calories')::numeric, 0) > 0
  )`;

  const where = onlyMissing ? `AND NOT ${hasNutritionExpr}` : ``;

  const { rows } = await pool.query<Row>(
    `SELECT id, name,
            read_model->'ingredients' AS ingredients,
            coalesce((read_model->>'servings')::int, servings) AS servings,
            ${hasNutritionExpr} AS has_nutrition
       FROM recipes
      WHERE jsonb_typeof(read_model) = 'object'
      ${where}`,
  );

  console.log(
    `[nutrition-backfill] candidates: ${rows.length}${dryRun ? " (DRY RUN — no writes)" : ""}`,
  );

  let written = 0;
  let plausible = 0;
  let cleared = 0; // stale nutrition wiped under --reconcile
  let skippedLowResolve = 0; // aggregator returned null (<50% ingredients resolved)
  let skippedImplausible = 0; // computed but failed the plausibility guard
  let skippedNoIngredients = 0;
  const samples: Array<{ name: string; nutrition: Record<string, unknown> }> = [];

  // Clear a recipe's nutrition back to the honest-empty state ({}), which the
  // recipe view omits (it requires calories > 0).
  const clearNutrition = async (id: string) => {
    if (dryRun) return;
    await pool.query(
      `UPDATE recipes
          SET nutritional_profile = '{}'::jsonb,
              read_model = jsonb_set(read_model, '{nutritional_profile}', '{}'::jsonb, true),
              updated_at = NOW()
        WHERE id = $1`,
      [id],
    );
  };

  for (const row of rows) {
    const ingredients = Array.isArray(row.ingredients) ? row.ingredients : [];
    if (ingredients.length === 0) {
      skippedNoIngredients++;
      continue;
    }

    const recipeLike = {
      ingredients: ingredients.map((i) => ({
        name: typeof i?.name === "string" ? i.name : "",
        amount: Number(i?.amount) || 1,
        unit: typeof i?.unit === "string" ? i.unit : "",
      })),
      numberOfServings: row.servings ?? undefined,
    };

    const nutrition = computeRecipeNutritionFromIngredients(recipeLike as never);
    if (!nutrition || !isPlausibleNutrition(nutrition)) {
      if (!nutrition) skippedLowResolve++;
      else skippedImplausible++;
      // De-poison: if this recipe currently shows nutrition we can no longer
      // substantiate, wipe it back to honest-empty.
      if (reconcile && row.has_nutrition) {
        await clearNutrition(row.id);
        cleared++;
      }
      continue;
    }
    plausible++;

    const payload = roundNutrition(nutrition as unknown as Record<string, unknown>);

    if (samples.length < 5) {
      samples.push({ name: row.name, nutrition: payload });
    }

    if (!dryRun) {
      await pool.query(
        `UPDATE recipes
            SET nutritional_profile = $2::jsonb,
                read_model = jsonb_set(read_model, '{nutritional_profile}', $2::jsonb, true),
                updated_at = NOW()
          WHERE id = $1`,
        [row.id, JSON.stringify(payload)],
      );
      written++;
      if (written % 100 === 0) {
        console.log(`[nutrition-backfill] ${written} written`);
      }
    }
  }

  console.log(
    `[nutrition-backfill] done: candidates=${rows.length}, plausible=${plausible}, written=${written}, ` +
      `cleared=${cleared}, skipped_low_resolve=${skippedLowResolve}, skipped_implausible=${skippedImplausible}, ` +
      `skipped_no_ingredients=${skippedNoIngredients}`,
  );
  console.log(
    `[nutrition-backfill] coverage: ${((plausible / Math.max(1, rows.length)) * 100).toFixed(1)}% of candidates get real nutrition`,
  );
  if (samples.length) {
    console.log(`[nutrition-backfill] samples:`);
    for (const s of samples) {
      console.log(
        `  - ${s.name}: ${s.nutrition.calories} cal, P${s.nutrition.protein} C${s.nutrition.carbs} F${s.nutrition.fat}`,
      );
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error("[nutrition-backfill] FAILED:", err);
  process.exit(1);
});
