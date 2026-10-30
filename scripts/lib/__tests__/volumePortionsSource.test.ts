/**
 * The measured volume table is exactly what its generator produces from the
 * recorded FDC portions, and never weighs a portion of another food ("whipped",
 * "in shell") as the ingredient's cup.
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
      for (const qualifier of Object.values(portion.measuredAs ?? {})) {
        expect(qualifier.replace(/\([^)]*\)/g, "")).not.toMatch(/\bwhipped\b|\bin shell\b/i);
      }
    }
  });
});
