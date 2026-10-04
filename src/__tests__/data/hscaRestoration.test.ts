/**
 * The HSCA archive was extracted from HSCA_Recipes.pdf by a vision model, and
 * a restoration against the PDF (2026-10-03) found four faults this guards:
 *   - composite dishes ("1 recipe Fried Tempeh, 1 recipe Spelt Bread, ...") had
 *     an invented assembly method, because the PDF gives them none of their own;
 *   - a sub-recipe printed under its parent was folded into it (Muhammara into
 *     the Black Cod) and never existed as a recipe;
 *   - 36 recipes were missing outright, many of them sub-recipes whose parents
 *     point at them ("Peanut Sauce (recipe below)");
 *   - footnotes and variations the PDF prints under a method were dropped.
 *
 * hsca.ts cannot be regenerated wholesale (its computed alchemy has drifted), so
 * `bun scripts/syncHscaCuisine.ts` updates it from recipes_database.json, and the
 * first block here fails when the two disagree.
 */
import fs from "fs";
import path from "path";
import { cuisine } from "@/data/cuisines/hsca";

interface SourceRecipe {
  name?: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  categories: string[];
}

const source: SourceRecipe[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "recipes_database.json"), "utf8"));
const MEALS = ["breakfast", "lunch", "dinner", "dessert"];

function sourceNamed(title: string): SourceRecipe {
  const matches = source.filter((r) => r.title === title);
  const [match] = matches;
  if (matches.length !== 1 || !match) throw new Error(`expected one source recipe titled ${title}, found ${matches.length}`);
  return match;
}

const catalog = MEALS.flatMap((meal) => cuisine.dishes?.[meal]?.all ?? []);

describe("hsca.ts agrees with recipes_database.json", () => {
  it("holds one dish per source recipe", () => {
    expect(catalog.length).toBe(source.length);
  });

  it("gives every recipe the method and ingredient count its source has (run scripts/syncHscaCuisine.ts)", () => {
    const seen = new Map<string, number>();
    for (const dish of catalog) {
      const key = JSON.stringify([dish.name, dish.instructions, dish.ingredients?.length]);
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const missing = source
      .filter((r) => {
        const key = JSON.stringify([r.name || r.title, r.instructions, r.ingredients.length]);
        const left = seen.get(key) ?? 0;
        seen.set(key, left - 1);
        return left <= 0;
      })
      .map((r) => r.title);
    expect(missing).toEqual([]);
  });
});

describe("no method is a placeholder", () => {
  const FALLBACK = "Prepare according to clean holistic macrobiotic guidelines.";
  const INVENTED = [
    "Assemble the sandwich by spreading avocado spread or Nayonaise on sliced Spelt Bread.",
    "Place a warm Chickpea Crêpe flat on a clean surface or plate.",
  ];

  it("no dish carries the generator's fallback or a sentence the PDF never printed", () => {
    const flagged = catalog.filter((d) => (d.instructions ?? []).some((step) => step === FALLBACK || INVENTED.includes(step)));
    expect(flagged.map((d) => d.name)).toEqual([]);
  });

  it("every dish has a method", () => {
    expect(catalog.filter((d) => (d.instructions ?? []).length === 0).map((d) => d.name)).toEqual([]);
  });
});

describe("a composite dish carries its components' real methods", () => {
  it.each([
    ["Tempeh Reuben Sandwich", ["Fried Tempeh (for Tempeh Reuben Sandwich)", "Spelt Bread (for Tempeh Reuben Sandwich)", "Ketchup (for Tempeh Reuben Sandwich)"]],
    ["CHICKPEA CRÊPES WITH CURRIED CHICKPEAS, VEGETABLES & MANGO SAUCE", ["CHICKPEA CRÊPE", "CURRIED CHICKPEA CRÊPE FILLING", "MANGO SAUCE (FOR CHICKPEA CRÊPE)"]],
  ])("%s", (parent, components) => {
    const parentSteps = sourceNamed(parent).instructions;
    for (const component of components) {
      for (const step of sourceNamed(component).instructions) expect(parentSteps).toContain(step);
    }
  });
});

describe("a sub-recipe printed under its parent is its own recipe", () => {
  it.each([
    ["MEDITERRANEAN ROASTED BLACK COD WITH MUHAMMARA", "MUHAMMARA", "Muhammara (recipe below)"],
    ["SEAFOOD SAUSAGE", "HONEY-MUSTARD YOGURT", "Honey-Mustard Yogurt (recipe below)"],
    ["Blackened Shrimp", "BLACKENING SPICE MIX", "Blackening Spice Mix (see recipe below)"],
    ["SWEET POTATO LATKES WITH PEAR-FENNEL MARMALADE", "CASHEW CREAM", "Cashew Cream (recipe below)"],
  ])("%s keeps %s out of its method and points at it", (parentTitle, childTitle, reference) => {
    const parent = sourceNamed(parentTitle);
    const child = sourceNamed(childTitle);
    expect(parent.ingredients).toContain(reference);
    for (const step of child.instructions) expect(parent.instructions).not.toContain(step);
    for (const line of child.ingredients) expect(parent.ingredients).not.toContain(line);
  });
});

describe("recipes the extraction had dropped", () => {
  const RESTORED = [
    "TOMATO VINAIGRETTE", 'TOMATO "CREAM" SAUCE (FOR VEGETABLE-POLENTA NAPOLEONS)', "MUHAMMARA", "HONEY-MUSTARD YOGURT",
    "FISH CONGEE", "SWEET VEGAN CRÊPES", "CASHEW MILK (FOR SWEET VEGAN CRÊPES)", "GLUTEN-FREE AND VEGAN WAFFLES",
    "HIGH-PROTEIN GLUTEN-FREE FLOUR MIX", "GLUTEN-FREE MINI PIZZAS", "FOCACCIA", "GNOCCHI", "GLUTEN-FREE CHOCOLATE CAKE",
    "CHOCOLATE CHIP COOKIES", "CREAM CHEESE FROSTING", "RICE PUDDING", "CHECKERBOARD COOKIES", "COBB SALAD", "CASHEW CREAM",
    "CREAM OF ASPARAGUS SOUP", "VEGAN BAKLAVA", "CREAMY SWEET POTATO BISQUE WITH CASHEW CRÈME FRAICHE AND CANDIED PECANS",
    "PEANUT SAUCE", "CEVICHE", "BLACKENING SPICE MIX", "COUS-COUS", "BLACK BEAN SALAD", "POLENTA", "RISOTTO",
    'VEGAN "MORNAY" SAUCE', "BORSCHT", "CASSOULET", "CREAM OF CARROT SOUP WITH ARBORIO RICE", "FRITTATA", "BABA GHANOUSH",
    "BERRY-GRAPE KANTEN",
  ];

  it("lists 36, each in the source and the catalog with ingredients and a method", () => {
    expect(RESTORED).toHaveLength(36);
    for (const title of RESTORED) {
      const recipe = sourceNamed(title);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.instructions.length).toBeGreaterThan(0);
      expect(catalog.some((d) => d.name === title)).toBe(true);
    }
  });

  it("every sub-recipe a restored dish points at exists", () => {
    const titles = source.map((r) => r.title.toLowerCase());
    const referenced = [
      "Cashew Milk", "High-Protein Gluten-Free Flour Mix", "Gluten-Free Flour Blend",
      "Rich Almond Milk", "Fresh Almond Milk", "Tofu Sour Cream", "Peanut Sauce",
    ];
    for (const reference of referenced) {
      expect(titles.some((t) => t.startsWith(reference.toLowerCase()))).toBe(true);
    }
  });
});

describe("footnotes the PDF prints under a method are kept", () => {
  it.each([
    ["Tapenade", "Note: Tapenade may be prepared without anchovies or nori."],
    ["CURRANT SCONES", "Note: If using rice flour add more liquid (about 2 tablespoons)."],
    ["Kasha with Egg", "Note: The above kasha recipe is ideal for side dish yielding a light fluffy texture. Do not use for kasha potato loaf."],
  ])("%s", (title, note) => {
    expect(sourceNamed(title).instructions).toContain(note);
  });
});
