/**
 * The HSCA importer (scripts/generateHscaCuisine.ts) read a unit wherever a
 * line's first word merely BEGAN with one: "4 Granny Smith apples" became 4 g
 * of "ranny smith apples", "1 gallon water" 1 g of "allon water", and "Canola
 * oil for ramekins" a can of "ola oil for ramekins". hsca.ts cannot be
 * regenerated wholesale (its computed alchemy has drifted), so this replays
 * every committed line against its raw source line in recipes_database.json:
 * a unit the line states must be a whole word of the source.
 *
 * `[MEASURED 2026-10-03]` master c27e4136 had 36 such lines (35 source lines;
 * one recipe is listed under two seasons).
 *
 * `[MEASURED 2026-10-03]` 575 dishes and 5,382 lines once 36 recipes missing from the
 * source were restored from the PDF (539 and 5,048 before; the four parents that
 * had swallowed a sub-recipe lost lines to it).
 *
 * @file src/__tests__/data/hscaSourceUnits.test.ts
 */
import fs from "fs";
import path from "path";
import { z } from "zod";
import { cuisine } from "@/data/cuisines/hsca";
import type { CuisineDishes, SeasonalDishes } from "@/types/cuisine";

const sourceSchema = z.array(
  z.object({ name: z.string().optional(), title: z.string(), ingredients: z.array(z.string()) }),
);
const dishSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({ amount: z.number(), unit: z.string(), name: z.string(), notes: z.string() })),
});
type SourceRecipe = z.infer<typeof sourceSchema>[number];
type Dish = z.infer<typeof dishSchema>;

const source = sourceSchema.parse(JSON.parse(fs.readFileSync(path.join(process.cwd(), "recipes_database.json"), "utf8")));
const MEALS: ReadonlyArray<keyof CuisineDishes> = ["breakfast", "lunch", "dinner", "dessert"];
const SEASONS: ReadonlyArray<keyof SeasonalDishes> = ["spring", "summer", "autumn", "winter", "all"];
/** The importer's unit for a line that names none. */
const NO_UNIT = "piece";

const dishes: Dish[] = MEALS.flatMap((meal) =>
  SEASONS.flatMap((season) => (cuisine.dishes[meal]?.[season] ?? []).map((dish) => dishSchema.parse(dish))),
);

/** The importer's own name for a source recipe. */
function nameOf(recipe: SourceRecipe): string {
  return [recipe.name, recipe.title].find((n) => n !== undefined && n !== "") ?? "Unnamed Recipe";
}

function isWholeWord(text: string, unit: string): boolean {
  const escaped = unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z])${escaped}(?![a-z])`, "i").test(text);
}

/** The dish's lines whose stated unit is not a whole word of their source line. */
function misread(dish: Dish, recipe: SourceRecipe): string[] {
  return dish.ingredients.flatMap((line, k) => {
    const raw = recipe.ingredients[k] ?? "";
    if (line.unit === NO_UNIT || isWholeWord(raw, line.unit)) return [];
    return [`${dish.name}: ${JSON.stringify(raw)} → ${line.amount} ${line.unit} "${line.name}"`];
  });
}

/** Source recipes the dish could have been imported from: same name, same line count. */
function sourcesOf(dish: Dish): SourceRecipe[] {
  return source.filter((r) => nameOf(r) === dish.name && r.ingredients.length === dish.ingredients.length);
}

/** Line `index` of every dish named `dishName` (two recipes may share a name). */
function linesAt(dishName: string, index: number): Array<Dish["ingredients"][number]> {
  return dishes.filter((d) => d.name === dishName).flatMap((d) => d.ingredients.slice(index, index + 1));
}

describe("every committed HSCA line agrees with its source line", () => {
  it("pairs every dish with the source recipe it was imported from", () => {
    expect(dishes.length).toBe(575);
    expect(dishes.filter((d) => sourcesOf(d).length === 0).map((d) => d.name)).toEqual([]);
    expect(dishes.reduce((n, d) => n + d.ingredients.length, 0)).toBe(5382);
  });

  it("states a unit only where the source line has it as a whole word", () => {
    const lines = dishes.flatMap((dish) => {
      const fits = sourcesOf(dish).map((recipe) => misread(dish, recipe));
      return fits.find((m) => m.length === 0) ?? fits[0] ?? [];
    });
    expect(lines).toEqual([]);
  });
});

describe("the restored lines read as their source does", () => {
  it("4 Granny Smith apples are four apples, not 4 g", () => {
    expect(linesAt("Beet and Apple Juice", 1)).toContainEqual({ amount: 4, unit: "piece", name: "granny smith apples", notes: "washed" });
  });

  it("a garlic line that names its unit after the food is cloves of garlic", () => {
    // As "2 piece garlic cloves" it would weigh the table's 50 g a piece.
    expect(linesAt("CRUCIFEROUS SALAD", 8)).toContainEqual({ amount: 2, unit: "cloves", name: "garlic", notes: "" });
  });

  it("1 gallon + 2 quarts of water is 1.5 gallons", () => {
    expect(linesAt("BROWN VEGETABLE STOCK", 2)).toContainEqual({ amount: 1.5, unit: "gallon", name: "water", notes: "1 gallon + 2 quarts" });
  });

  it("a garnish label is not the food", () => {
    expect(linesAt("Family Style Bean Curd", 16)).toContainEqual({ amount: 1, unit: "piece", name: "scallion", notes: "garnish; cut into thin diagonal" });
  });
});
