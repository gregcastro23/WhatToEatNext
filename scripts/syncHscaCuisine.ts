// scripts/syncHscaCuisine.ts
/**
 * Brings src/data/cuisines/hsca.ts in step with recipes_database.json without
 * regenerating the whole file.
 *
 * generateHscaCuisine.ts rewrites every dish, and the computed alchemy it
 * derives from the ingredients has drifted from the committed file (a full run
 * moves ~300 recipes' elements, ESMS and thermodynamics). When only a few
 * source recipes changed, this updates just those dishes:
 *
 *   - instructions changed, ingredients the same: the instructions (and the
 *     cooking methods read from them) are replaced in every copy of the dish;
 *   - ingredients changed: the dish is rebuilt, so its alchemy matches them;
 *   - recipe not in the file yet: its dish is built and appended.
 *
 * A dish is found by position, the way the generator wrote it: the n-th source
 * recipe filed under a meal is the n-th entry of that meal's `all` list, so new
 * recipes must be appended to the source, never inserted. Names are checked, and
 * any mismatch stops the run rather than guessing.
 *
 * An ingredient list that differs from what the builder would produce counts as a
 * source change, so a dish patched by hand in hsca.ts (or one parsed before a parser
 * fix) is reported as "rebuilt" too. The run lists every dish it touches; review
 * that list, and use --only to apply one.
 *
 *   bun scripts/syncHscaCuisine.ts                 write the file
 *   bun scripts/syncHscaCuisine.ts --check         report what would change; exit 1 if any
 *   bun scripts/syncHscaCuisine.ts --only="NAME"   touch only the dish with that name
 */
import fs from "fs";
import path from "path";
import { fileHscaRecipe } from "../src/lib/recipes/hscaMealFiling";
import { buildHscaDish, type HscaBuiltDish, type RawRecipe } from "./lib/hscaDish";

type Dish = HscaBuiltDish["dish"];
type MealTree = Record<string, Record<string, Dish[]>>;

const CUISINE_FILE = path.join(process.cwd(), "src/data/cuisines/hsca.ts");
const DISHES_OPEN = "  dishes: ";
const DISHES_CLOSE = ",\n  elementalProperties: derivedProfiles";

interface Tally {
  instructions: string[];
  rebuilt: string[];
  added: string[];
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function nameOf(recipe: RawRecipe): string {
  return recipe.name || recipe.title || "Unnamed Recipe";
}

/** Every copy of a dish: its `all` entry and one entry per season it is filed under. */
function copiesOf(tree: MealTree, bucket: string, seasons: string[], old: Dish): Array<[Dish[], number]> {
  const lists = ["all", ...seasons.map((s) => s.toLowerCase()).filter((s) => s !== "all")];
  return lists.flatMap((list) => {
    const entries = tree[bucket]?.[list] ?? [];
    const at = entries.findIndex((entry) => same(entry, old));
    return at >= 0 ? [[entries, at] as [Dish[], number]] : [];
  });
}

function place(tree: MealTree, built: HscaBuiltDish): void {
  const { dish, mealType, seasons } = built;
  for (const season of seasons.map((s) => s.toLowerCase()).filter((s) => s !== "all")) {
    tree[mealType]?.[season]?.push(dish);
  }
  tree[mealType]?.all?.push(dish);
}

function update(tree: MealTree, existing: Dish, built: HscaBuiltDish, tally: Tally): void {
  const copies = copiesOf(tree, built.mealType, built.seasons, existing);
  if (copies.length === 0) throw new Error(`no copies found for ${built.dish.name}`);
  if (!same(existing.ingredients, built.dish.ingredients)) {
    for (const [list, at] of copies) list[at] = built.dish;
    tally.rebuilt.push(built.dish.name);
    return;
  }
  for (const [list, at] of copies) {
    list[at] = {
      ...existing,
      instructions: built.dish.instructions,
      classifications: { ...existing.classifications, cookingMethods: built.dish.classifications.cookingMethods },
    };
  }
  tally.instructions.push(built.dish.name);
}

function sync(tree: MealTree, recipes: RawRecipe[], only: string | undefined): Tally {
  const tally: Tally = { instructions: [], rebuilt: [], added: [] };
  const seen: Record<string, number> = {};
  for (const recipe of recipes) {
    const built = buildHscaDish(recipe);
    const { bucket: mealType } = fileHscaRecipe({ name: nameOf(recipe), title: recipe.title, categories: recipe.categories });
    const position = (seen[mealType] = (seen[mealType] ?? -1) + 1);
    const existing = tree[mealType]?.all?.[position];
    if (only !== undefined && built.dish.name !== only) continue;
    if (!existing) {
      place(tree, built);
      tally.added.push(built.dish.name);
    } else if (existing.name !== built.dish.name) {
      throw new Error(`${mealType}/all[${position}] is "${existing.name}", but the source recipe there is "${built.dish.name}"`);
    } else if (!same(existing.instructions, built.dish.instructions) || !same(existing.ingredients, built.dish.ingredients)) {
      update(tree, existing, built, tally);
    }
  }
  return tally;
}

function main(): void {
  const check = process.argv.includes("--check");
  const source = fs.readFileSync(CUISINE_FILE, "utf8");
  const open = source.indexOf(DISHES_OPEN) + DISHES_OPEN.length;
  const close = source.indexOf(DISHES_CLOSE);
  if (open < DISHES_OPEN.length || close < 0) throw new Error("cannot find the dishes literal in hsca.ts");
  const literal = source.slice(open, close);
  const tree: MealTree = JSON.parse(literal);
  if (JSON.stringify(tree, null, 2) !== literal) throw new Error("dishes literal does not round-trip through JSON");

  const recipes: RawRecipe[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "recipes_database.json"), "utf8"));
  const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice("--only=".length);
  const tally = sync(tree, recipes, only);
  const total = tally.instructions.length + tally.rebuilt.length + tally.added.length;
  console.log(`${recipes.length} source recipes: ${tally.instructions.length} with new instructions, ${tally.rebuilt.length} rebuilt, ${tally.added.length} added`);
  const groups: Array<[string, string[]]> = [["instructions", tally.instructions], ["rebuilt", tally.rebuilt], ["added", tally.added]];
  for (const [label, names] of groups) {
    for (const name of names) console.log(`  ${label}: ${name}`);
  }
  if (total === 0) return;
  if (check) {
    process.exitCode = 1;
    return;
  }
  const next = source.slice(0, open) + JSON.stringify(tree, null, 2) + source.slice(close);
  fs.writeFileSync(CUISINE_FILE, next, "utf8");
  console.log(`wrote ${CUISINE_FILE}`);
}

main();
