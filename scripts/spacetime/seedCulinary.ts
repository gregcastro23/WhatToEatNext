/**
 * Culinary catalog ETL: static TypeScript data → SpacetimeDB reducers.
 *
 * Seeds the `alchm_culinary` module's ingredient / recipe / cuisine tables
 * from the repo's static catalogs, going through the module's own reducers so
 * every row passes the same validation + aggregation as production writes.
 *
 * Idempotent: existing rows are snapshotted by name first and skipped, so the
 * script can re-run safely after partial failures.
 *
 * Usage:
 *   SPACETIME_URI=ws://localhost:3010 bun scripts/spacetime/seedCulinary.ts
 *
 * Env:
 *   SPACETIME_URI     (default ws://localhost:3000)
 *   SPACETIME_MODULE  (default alchm-culinary)
 *   SEED_LIMIT        optional cap per entity type — handy for smoke tests
 */

import { getServerRecipes } from "@/actions/recipes";
import { allIngredients } from "@/data/ingredients";
import { DbConnection } from "@/lib/spacetime/generated";

const URI = process.env.SPACETIME_URI ?? "ws://localhost:3000";
const MODULE = process.env.SPACETIME_MODULE ?? "alchm-culinary";
const LIMIT = process.env.SEED_LIMIT
  ? Number(process.env.SEED_LIMIT)
  : Infinity;

/** Module convention: 0 = Fire, 1 = Earth, 2 = Air, 3 = Water. */
const ELEMENT_INDEX: Record<string, number> = {
  Fire: 0,
  Earth: 1,
  Air: 2,
  Water: 3,
};

type AnyRecord = Record<string, unknown>;

function num(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

/** ESMS signature from an ingredient's alchemicalProperties, if present. */
function esmsOf(raw: AnyRecord): {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
} {
  const alchemical = (raw.alchemicalProperties ?? {}) as AnyRecord;
  return {
    spirit: num(alchemical.Spirit ?? alchemical.spirit),
    essence: num(alchemical.Essence ?? alchemical.essence),
    matter: num(alchemical.Matter ?? alchemical.matter),
    substance: num(alchemical.Substance ?? alchemical.substance),
  };
}

/** Dominant classical element index from elementalProperties. */
function primaryElementOf(raw: AnyRecord): number {
  const props = (raw.elementalProperties ?? {}) as AnyRecord;
  let best = "Fire";
  let bestVal = -Infinity;
  for (const element of Object.keys(ELEMENT_INDEX)) {
    const v = num(props[element]);
    if (v > bestVal) {
      best = element;
      bestVal = v;
    }
  }
  return ELEMENT_INDEX[best];
}

function nutritionOf(raw: AnyRecord): {
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
} {
  const profile = (raw.nutritionalProfile ??
    raw.nutrition ??
    {}) as AnyRecord;
  const macros = (profile.macros ?? profile) as AnyRecord;
  return {
    calories: Math.max(0, Math.round(num(profile.calories ?? macros.calories))),
    proteinG: Math.max(0, num(macros.protein ?? macros.protein_g)),
    fatG: Math.max(0, num(macros.fat ?? macros.fat_g)),
    carbsG: Math.max(0, num(macros.carbs ?? macros.carbohydrates)),
  };
}

function connect(): Promise<DbConnection> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timed out connecting to ${URI}/${MODULE}`)),
      15_000,
    );
    DbConnection.builder()
      .withUri(URI)
      .withDatabaseName(MODULE)
      .onConnect((conn) => {
        clearTimeout(timer);
        resolve(conn);
      })
      .onConnectError((_ctx, error) => {
        clearTimeout(timer);
        reject(error);
      })
      .build();
  });
}

function subscribeAll(conn: DbConnection): Promise<void> {
  return new Promise((resolve) => {
    conn
      .subscriptionBuilder()
      .onApplied(() => resolve())
      .subscribe([
        "SELECT * FROM ingredient",
        "SELECT * FROM recipe",
        "SELECT * FROM cuisine",
        "SELECT * FROM cuisine_recipe",
      ]);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wait until `read()` stops changing (the server has applied our calls). */
async function settle(read: () => number, label: string): Promise<void> {
  let previous = -1;
  for (let i = 0; i < 120; i++) {
    const current = read();
    if (current === previous && i > 2) return;
    previous = current;
    await sleep(250);
  }
  console.warn(`[seed] ${label}: settle timeout (continuing)`);
}

async function main() {
  console.log(`[seed] connecting to ${URI} / ${MODULE}`);
  const conn = await connect();
  await subscribeAll(conn);

  const existingIngredients = new Set(
    [...conn.db.ingredient.iter()].map((row) => row.name.toLowerCase()),
  );
  const existingRecipes = new Set(
    [...conn.db.recipe.iter()].map((row) => row.name.toLowerCase()),
  );
  const existingCuisines = new Set(
    [...conn.db.cuisine.iter()].map((row) => row.name.toLowerCase()),
  );
  console.log(
    `[seed] existing: ${existingIngredients.size} ingredients, ` +
      `${existingRecipes.size} recipes, ${existingCuisines.size} cuisines`,
  );

  // ---- Ingredients ---------------------------------------------------------
  let sentIngredients = 0;
  for (const [name, raw] of Object.entries(
    allIngredients as Record<string, AnyRecord>,
  )) {
    if (sentIngredients >= LIMIT) break;
    const cleanName = (raw.name as string | undefined)?.trim() || name.trim();
    if (!cleanName || existingIngredients.has(cleanName.toLowerCase())) continue;
    const nutrition = nutritionOf(raw);
    await conn.reducers.addIngredient({
      name: cleanName,
      elementalSignature: esmsOf(raw),
      primaryElement: primaryElementOf(raw),
      ...nutrition,
    });
    existingIngredients.add(cleanName.toLowerCase());
    sentIngredients += 1;
  }
  console.log(`[seed] sent ${sentIngredients} add_ingredient calls`);
  await settle(() => [...conn.db.ingredient.iter()].length, "ingredients");

  const ingredientIdByName = new Map<string, bigint>();
  for (const row of conn.db.ingredient.iter()) {
    ingredientIdByName.set(row.name.toLowerCase(), row.ingredientId);
  }
  console.log(`[seed] ingredient table now has ${ingredientIdByName.size} rows`);

  // ---- Recipes -------------------------------------------------------------
  const recipes = await getServerRecipes();
  let sentRecipes = 0;
  let skippedUnresolvable = 0;
  const cuisineByRecipeName = new Map<string, string>();

  for (const recipe of recipes) {
    if (sentRecipes >= LIMIT) break;
    const cleanName = recipe.name?.trim();
    if (!cleanName || existingRecipes.has(cleanName.toLowerCase())) continue;

    const lines = (recipe.ingredients ?? [])
      .map((ing) => {
        const id = ingredientIdByName.get((ing.name ?? "").toLowerCase());
        if (id === undefined) return null;
        const amount = num(ing.amount);
        return {
          ingredientId: id,
          amount: amount > 0 ? amount : 1,
          unit: (ing.unit ?? "each").toString(),
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    if (lines.length === 0) {
      skippedUnresolvable += 1;
      continue;
    }

    await conn.reducers.createRecipe({
      name: cleanName,
      instructions: (recipe.instructions ?? []).join("\n"),
      ingredients: lines,
    });
    existingRecipes.add(cleanName.toLowerCase());
    if (recipe.cuisine) cuisineByRecipeName.set(cleanName, recipe.cuisine);
    sentRecipes += 1;
  }
  console.log(
    `[seed] sent ${sentRecipes} create_recipe calls ` +
      `(${skippedUnresolvable} skipped — no resolvable ingredients)`,
  );
  await settle(() => [...conn.db.recipe.iter()].length, "recipes");

  // ---- Cuisines + associations ---------------------------------------------
  const wantedCuisines = new Set(
    [...cuisineByRecipeName.values()].map((c) => c.trim()).filter(Boolean),
  );
  let sentCuisines = 0;
  for (const cuisineName of wantedCuisines) {
    if (existingCuisines.has(cuisineName.toLowerCase())) continue;
    await conn.reducers.addCuisine({ name: cuisineName });
    existingCuisines.add(cuisineName.toLowerCase());
    sentCuisines += 1;
  }
  console.log(`[seed] sent ${sentCuisines} add_cuisine calls`);
  await settle(() => [...conn.db.cuisine.iter()].length, "cuisines");

  const cuisineIdByName = new Map<string, bigint>();
  for (const row of conn.db.cuisine.iter()) {
    cuisineIdByName.set(row.name.toLowerCase(), row.cuisineId);
  }
  const recipeIdByName = new Map<string, bigint>();
  for (const row of conn.db.recipe.iter()) {
    recipeIdByName.set(row.name.toLowerCase(), row.recipeId);
  }
  const linked = new Set(
    [...conn.db.cuisine_recipe.iter()].map(
      (row) => `${row.cuisineId}:${row.recipeId}`,
    ),
  );

  let sentLinks = 0;
  for (const [recipeName, cuisineName] of cuisineByRecipeName) {
    const cuisineId = cuisineIdByName.get(cuisineName.trim().toLowerCase());
    const recipeId = recipeIdByName.get(recipeName.toLowerCase());
    if (cuisineId === undefined || recipeId === undefined) continue;
    if (linked.has(`${cuisineId}:${recipeId}`)) continue;
    await conn.reducers.associateRecipeToCuisine({ cuisineId, recipeId });
    linked.add(`${cuisineId}:${recipeId}`);
    sentLinks += 1;
  }
  console.log(`[seed] sent ${sentLinks} associate_recipe_to_cuisine calls`);
  await settle(() => [...conn.db.cuisine_recipe.iter()].length, "associations");

  console.log(
    `[seed] done — module now holds ` +
      `${[...conn.db.ingredient.iter()].length} ingredients, ` +
      `${[...conn.db.recipe.iter()].length} recipes, ` +
      `${[...conn.db.cuisine.iter()].length} cuisines, ` +
      `${[...conn.db.cuisine_recipe.iter()].length} associations`,
  );
  conn.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("[seed] failed:", error);
  process.exit(1);
});
