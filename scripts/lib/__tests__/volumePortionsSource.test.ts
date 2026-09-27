/**
 * The measured volume table is exactly what its generator produces from the
 * recorded FDC portions.
 */
import { readFileSync } from "fs";
import { join } from "path";
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
});
