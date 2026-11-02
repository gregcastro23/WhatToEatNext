/**
 * The measured volume table is exactly what its generator produces from the
 * recorded FDC portions. It never weighs a portion of another food ("whipped",
 * "in shell", "cherry") as the ingredient's cup, reads a label with or without
 * its comma, and never picks one of several cuts for a recipe.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { MEASURED_PORTIONS } from "../../../src/data/cooking/measuredPortions";
import { renderVolumePortions } from "../volumePortionsSource";

const ROOT = join(__dirname, "..", "..", "..");
const readJson = (...path: string[]): unknown => JSON.parse(readFileSync(join(ROOT, ...path), "utf8"));

describe("measuredPortions.ts", () => {
  it("is exactly the generator's output (regenerate with `bun run generate:volume-portions`)", () => {
    const committed = readFileSync(join(ROOT, "src", "data", "cooking", "measuredPortions.ts"), "utf8");
    const rendered = renderVolumePortions(
      readJson("scripts", "data", "usda-portions.json"),
      readJson("scripts", "data", "usda-composition.json"),
    );
    expect(rendered).toBe(committed);
  });

  it("weighs a cup of heavy cream fluid, as a recipe measures it", () => {
    // FDC 170859: "1 cup, fluid (yields 2 cups whipped)" = 238 g; "1 cup, whipped" = 120 g.
    const cream = MEASURED_PORTIONS.find((p) => p.ingredient === "Heavy Cream");
    expect(cream?.fdcId).toBe(170859);
    expect(cream?.gramsPer.cup).toBe(238);
    expect(cream?.measuredAs?.cup).toBe("fluid (yields 2 cups whipped)");
    // The record's plain tablespoon is the fluid one too: 238 / 16 = 14.9.
    expect(cream?.gramsPer.tbsp).toBe(15);
  });

  it("never names another food as what it measured", () => {
    for (const portion of MEASURED_PORTIONS) {
      const cuts = Object.values(portion.cuts ?? {}).flatMap((all) => all.map((cut) => cut.as));
      for (const qualifier of [...Object.values(portion.measuredAs ?? {}), ...cuts]) {
        expect(qualifier.replace(/\([^)]*\)/g, "")).not.toMatch(/\bwhipped\b|\bin shell\b|\bcherry\b/i);
      }
    }
  });

  it("reads a portion label with or without its comma", () => {
    const find = (name: string) => MEASURED_PORTIONS.find((p) => p.ingredient === name);
    // FDC 170000 writes "cup, chopped" (160 g) and "tbsp chopped" (10 g): 160 / 16 = 10.
    expect(find("Onion")?.gramsPer.tbsp).toBe(10);
    // FDC 170416 "cup chopped" 60 g; FDC 170005 "tbsp chopped" 6 g.
    expect(find("Parsley")?.gramsPer.cup).toBe(60);
    expect(find("Scallion")?.gramsPer.tbsp).toBe(6);
  });

  it("keeps a cup of cherry tomatoes out of the tomato's cup", () => {
    const tomato = MEASURED_PORTIONS.find((p) => p.ingredient === "Tomato");
    expect(tomato?.gramsPer.cup).toBe(180);
    expect(tomato?.cuts).toBeUndefined();
  });

  it("records every cut of a measure USDA weighed several ways, and picks none", () => {
    const walnuts = MEASURED_PORTIONS.find((p) => p.ingredient === "Walnuts");
    expect(walnuts?.gramsPer.cup).toBeUndefined();
    expect(walnuts?.cuts?.cup).toEqual([
      { as: "ground", grams: 80 },
      { as: "chopped", grams: 117 },
      { as: "pieces or chips", grams: 120 },
      { as: "shelled (50 halves)", grams: 100 },
    ]);
  });

  it("lets a plain measure win, collapses cuts that weigh the same, and skips another food", () => {
    const portion = (unit: string, modifier: string, gramWeight: number) => ({ amount: 1, unit, modifier, gramWeight });
    const record = {
      ingredient: "Test",
      fdcId: 1,
      fdcDescription: "Test food",
      retrieved: "2026-09-27",
      portions: [
        portion("undetermined", "cup chopped", 100),
        portion("undetermined", "cup, diced", 100),
        portion("undetermined", "cup cherry tomatoes", 90),
        portion("undetermined", "cup, whipped", 50),
        portion("undetermined", "tbsp sliced", 5),
        portion("undetermined", "tbsp", 6),
      ],
    };
    const rendered = renderVolumePortions({ results: [record] }, { results: [{ ingredient: "Test" }] });
    expect(rendered).toContain("gramsPer: { cup: 100, tbsp: 6 },");
    expect(rendered).toContain('measuredAs: { cup: "chopped" },');
    expect(rendered).not.toContain("cuts:");
  });
});
