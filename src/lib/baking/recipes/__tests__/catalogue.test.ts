/** @jest-environment node */
import { hasBakingIngredient } from "@/data/baking";
import { CURATED_GOODS } from "@/data/baking/curatedGoods";
import { categoryCounts, CURATED_CATEGORY, CURATED_PRESETS, curatedEntries, filterCatalogue, isSimulable, presetOf, recipeEntries, type CatalogueEntry } from "@/lib/baking/recipes/catalogue";
import type { RecipeSource, SourceLine } from "@/lib/baking/recipes/sourceTypes";
import { prepareBatter } from "@/lib/baking/sim/batter";
import { simulateBake } from "@/lib/baking/sim/simulate";

function line(amount: number, unit: string, name: string): SourceLine {
  return { name, amount, unit, notes: null, optional: false };
}

function source(id: string, name: string, category: RecipeSource["category"], lines: SourceLine[], cuisine = "test"): RecipeSource {
  return { id, name, cuisine, category, servings: 12, cookMinutes: 20, lines, steps: ["Preheat oven to 350°F.", "Bake 20 minutes."] };
}

// The refused recipe comes FIRST in catalogue order, so ranking (not input order) has to put it last.
const RECIPES = recipeEntries([
  source("r-baklava", "Crème Baklava", "pastry", [line(500, "g", "phyllo dough"), line(1, "cup", "honey")], "greek"),
  source("r-focaccia", "Focaccia Genovese", "flatbread", [line(500, "g", "bread flour"), line(350, "g", "water"), line(10, "g", "salt")], "italian"),
  source("r-scones", "Currant Scones", "biscuit-scone", [line(2, "cups", "flour"), line(0.5, "cup", "buttermilk"), line(1, "tbsp", "baking powder")]),
]);
const ALL: readonly CatalogueEntry[] = [...curatedEntries(), ...RECIPES];

function names(text: string, extra: Partial<{ category: CatalogueEntry["category"] | "all"; simulableOnly: boolean }> = {}): string[] {
  return filterCatalogue(ALL, { text, category: extra.category ?? "all", simulableOnly: extra.simulableOnly ?? false }).map((e) => e.name);
}

describe("the bakeable-goods search", () => {
  it("finds a good by its name, case- and accent-blind", () => {
    expect(names("FOCACCIA")).toEqual(["Focaccia Genovese"]);
    expect(names("creme")).toEqual(["Crème Baklava"]);
  });

  it("finds goods by an ingredient they contain", () => {
    expect(names("buttermilk")).toEqual(["Buttermilk muffins", "Currant Scones"]);
    expect(names("phyllo")).toEqual(["Crème Baklava"]);
  });

  it("finds goods by category name and narrows by the category picker", () => {
    expect(names("scone")).toEqual(["Currant Scones"]);
    expect(names("", { category: "cookie" })).toEqual(["Brown butter chocolate chip cookie"]);
  });

  it("finds goods by category label, cuisine, and a curated good by an ingredient its name lacks", () => {
    expect(names("biscuit")).toEqual(["Currant Scones"]);
    expect(names("greek")).toEqual(["Crème Baklava"]);
    expect(names("semisweet")).toEqual(["Brown butter chocolate chip cookie", "Fudgy brownies"]);
  });

  it("requires every word of the query", () => {
    expect(names("focaccia water")).toEqual(["Focaccia Genovese"]);
    expect(names("focaccia honey")).toEqual([]);
  });

  it("lists curated goods first, then simulable recipes, then refused ones", () => {
    const all = names("");
    expect(all.slice(0, CURATED_PRESETS.length)).toEqual(CURATED_PRESETS.map((p) => p.name));
    expect(all.slice(CURATED_PRESETS.length)).toEqual(["Focaccia Genovese", "Currant Scones", "Crème Baklava"]);
    expect(names("", { simulableOnly: true })).not.toContain("Crème Baklava");
  });

  it("marks a refused recipe as having no lab inputs", () => {
    const baklava = RECIPES.find((e) => e.id === "r-baklava");
    expect(baklava !== undefined && isSimulable(baklava)).toBe(false);
    expect(baklava === undefined ? "missing" : presetOf(baklava)).toBeNull();
  });

  it("counts every entry in exactly one category", () => {
    const counts = categoryCounts(ALL);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(ALL.length);
    expect(counts.pastry).toBe(1);
  });
});

describe("curated goods", () => {
  it("each has a category and only real vectors", () => {
    for (const p of CURATED_PRESETS) {
      expect({ id: p.id, category: CURATED_CATEGORY[p.id] !== undefined }).toEqual({ id: p.id, category: true });
      for (const l of p.formula.lines) expect({ id: p.id, line: l.ingredientId, exists: hasBakingIngredient(l.ingredientId) }).toEqual({ id: p.id, line: l.ingredientId, exists: true });
    }
  });

  it("each new one bakes to done inside its own bake time, with only the failure its kind expects", () => {
    // A fudgy brownie's starch is meant not to finish setting; a cracker is meant to dry out.
    const expected: Record<string, string[]> = { "buttermilk-muffin": [], "fudgy-brownie": ["gummy"], "whole-wheat-cracker": ["dry"] };
    for (const p of CURATED_GOODS) {
      const { batter, telemetry } = prepareBatter(p.formula, p.process);
      const r = simulateBake({ batter, geometry: p.geometry, oven: p.oven, ambient: { kitchenC: 20, kitchenRhPct: 50 }, doneCoreC: p.doneCoreC }, { structureToTenderizer: telemetry.structure.ratio });
      expect({ id: p.id, done: r.doneMin !== null && r.doneMin <= p.oven.bakeMinutes }).toEqual({ id: p.id, done: true });
      expect({ id: p.id, warnings: r.warnings.filter((w) => w.severity !== "info").map((w) => w.id) }).toEqual({ id: p.id, warnings: expected[p.id] });
    }
  });
});
