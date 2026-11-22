/** @jest-environment node */
import { curatedEntries, recipeEntries } from "@/lib/baking/recipes/catalogue";
import type { RecipeSource } from "@/lib/baking/recipes/sourceTypes";
import { benchFor, benchGoodId, benchNotice, defaultPreset, presetToLoad, showsHud } from "../_lab/bench";
import { formatFormulaMarkdown } from "../_lab/FormulaPanel";
import { deriveLab, initialLabState, isModifiedFromBaseline, labReducer } from "../_lab/useBakingLab";
import { BAKING_TABS, DEFAULT_GOOD_ID } from "../bakingTabs";

function source(id: string, name: string, category: RecipeSource["category"], lines: RecipeSource["lines"]): RecipeSource {
  return { id, name, cuisine: "test", category, servings: 12, cookMinutes: 20, lines, steps: ["Preheat oven to 350°F.", "Bake 20 minutes."] };
}

const ENTRIES = [
  ...curatedEntries(),
  ...recipeEntries([
    source("r-cake", "Test Cake", "cake", [{ name: "flour", amount: 2, unit: "cups", notes: null, optional: false }, { name: "sugar", amount: 1, unit: "cup", notes: null, optional: false }, { name: "eggs", amount: 2, unit: "large", notes: null, optional: false }]),
    source("r-pie", "Test Apple Pie", "pie-tart", [{ name: "pie dough", amount: 1, unit: "piece", notes: null, optional: false }]),
  ]),
];

describe("what is on the bench", () => {
  it("bakes a curated good or a simulable recipe, loading its own inputs", () => {
    const curated = benchFor("brioche-loaf", ENTRIES, "ready");
    expect(curated.kind).toBe("bake");
    expect(presetToLoad(curated)?.id).toBe("brioche-loaf");
    const recipe = benchFor("r-cake", ENTRIES, "ready");
    expect(recipe.kind).toBe("bake");
    expect(presetToLoad(recipe)?.id).toBe("r-cake");
  });

  it("refuses a recipe the lab will not simulate, loads nothing, and names the refused recipe", () => {
    const bench = benchFor("r-pie", ENTRIES, "ready");
    expect(bench.kind).toBe("refused");
    expect(presetToLoad(bench)).toBeNull();
    expect(benchGoodId(bench, "brioche-loaf")).toBe("r-pie");
    for (const [tab] of BAKING_TABS) expect({ tab, hud: showsHud(tab, bench) }).toEqual({ tab, hud: false });
  });

  it("waits for the recipe file before calling an id unknown", () => {
    const bench = benchFor("r-not-yet", ENTRIES.slice(0, 7), "loading");
    expect(bench.kind).toBe("loading");
    expect(presetToLoad(bench)).toBeNull();
    expect(showsHud("formula", bench)).toBe(false);
  });

  it("says why it opened the default instead — an unknown id, or a file that failed to load", () => {
    const unknown = benchFor("no-such-good", ENTRIES, "ready");
    expect(presetToLoad(unknown)?.id).toBe(DEFAULT_GOOD_ID);
    expect(benchNotice(unknown)).toMatch(/^No bakeable good is named “no-such-good”: the lab opened the artisan sourdough/);
    const failed = benchFor("r-cake", ENTRIES.slice(0, 7), "failed");
    expect(benchNotice(failed)).toMatch(/did not load/);
    expect(benchGoodId(failed, DEFAULT_GOOD_ID)).toBe(DEFAULT_GOOD_ID);
    expect(defaultPreset().id).toBe(DEFAULT_GOOD_ID);
  });

  it("shows the real-physics HUD on every real tab of a baked good, never on the alchm tab", () => {
    const bench = benchFor("r-cake", ENTRIES, "ready");
    expect(BAKING_TABS.filter(([tab]) => showsHud(tab, bench)).map(([tab]) => tab)).toEqual(["formula", "swap", "oven", "sources"]);
    expect(benchNotice(bench)).toBeNull();
  });

  it("tracks modifications from baseline, resets to original, and formats a baker's formula in Markdown", () => {
    const s0 = initialLabState();
    expect(isModifiedFromBaseline(s0)).toBe(false);
    const s1 = labReducer(s0, { type: "grams", line: 0, grams: 600 });
    expect(isModifiedFromBaseline(s1)).toBe(true);
    const reset = labReducer(s1, { type: "reset" });
    expect(isModifiedFromBaseline(reset)).toBe(false);
    expect(reset.formula.lines[0]?.grams).toBe(s0.formula.lines[0]?.grams);

    const derived = deriveLab(s0);
    const md = formatFormulaMarkdown(s0, derived.telemetry.available ? derived.telemetry.value : null);
    expect(md).toContain(`### ${s0.formula.name}`);
    expect(md).toContain("| Ingredient | Grams | ≈ US measure | Baker's % |");
    expect(md).toContain("Bread flour");
    // Each row carries the household measure beside its grams (bread flour: USDA 1 cup = 137 g).
    const flourRow = md.split("\n").find((r) => r.startsWith("| Bread flour |"));
    expect(flourRow).toMatch(/\| ≈ [\d ¼⅓½⅔¾]+ cups? \|/);
  });
});
