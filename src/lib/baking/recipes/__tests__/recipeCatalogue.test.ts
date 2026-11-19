/**
 * @jest-environment node
 *
 * The committed catalogue is exactly what the builder makes of today's served
 * recipes — so a recipe edit, a new vector or a converter change that moves
 * the catalogue fails here until `bun run generate:baking-catalogue` is run.
 * And a handful of real converted recipes bake the way their own steps say.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { getServerRecipes } from "@/actions/recipes";
import { CURATED_PRESETS, isSimulable, recipeEntries } from "@/lib/baking/recipes/catalogue";
import { buildCatalogueFile, parseCatalogueFile, type CatalogueFile } from "@/lib/baking/recipes/catalogueFile";
import { convertRecipe } from "@/lib/baking/recipes/convertRecipe";
import type { RecipeSource } from "@/lib/baking/recipes/sourceTypes";
import { prepareBatter } from "@/lib/baking/sim/batter";
import { simulateBake } from "@/lib/baking/sim/simulate";
import type { SimResult } from "@/lib/baking/sim/simTypes";

// The catalogue also reads which recipes are unpublished; nothing is, here, and no socket is opened.
jest.mock("@/lib/database", () => ({ executeQuery: async () => ({ rows: [] }) }));

const FILE = join(__dirname, "..", "..", "..", "..", "..", "public", "data", "baking-recipe-catalogue.json");

function committed(): CatalogueFile {
  return parseCatalogueFile(JSON.parse(readFileSync(FILE, "utf8")));
}

function source(id: string): RecipeSource {
  const found = committed().sources.find((s) => s.id === id);
  if (found === undefined) throw new Error(`${id} is not in the catalogue`);
  return found;
}

function bake(id: string, minutes?: number): { result: SimResult; stated: readonly [number, number] | null } {
  const { preset, report } = convertRecipe(source(id));
  if (preset === null) throw new Error(`${id} was refused`);
  const { batter, telemetry } = prepareBatter(preset.formula, preset.process);
  const oven = minutes === undefined ? preset.oven : { ...preset.oven, bakeMinutes: minutes };
  const result = simulateBake({ batter, geometry: preset.geometry, oven, ambient: { kitchenC: 20, kitchenRhPct: 50 }, doneCoreC: preset.doneCoreC }, { structureToTenderizer: telemetry.structure.ratio });
  return { result, stated: report.statedBakeMinutes };
}

describe("the generated recipe catalogue", () => {
  jest.setTimeout(60_000);

  it("is exactly what the builder makes of the served recipes", async () => {
    const built = buildCatalogueFile(await getServerRecipes());
    expect(committed()).toEqual(built);
  });

  it("accounts for every served recipe, under ids no curated good shares", () => {
    const file = committed();
    expect(file.notBaked + file.sources.length + file.skipped.length).toBe(file.servedRecipes);
    const ids = [...CURATED_PRESETS.map((p) => p.id), ...file.sources.map((s) => s.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("refuses a malformed file rather than reading part of it", () => {
    const file = committed();
    const [first] = file.sources;
    expect(() => parseCatalogueFile({ ...file, sources: [{ ...first, category: "soufflé" }] })).toThrow();
    expect(() => parseCatalogueFile({ ...file, sources: "none" })).toThrow();
  });

  it("has simulable site recipes in every single-batter category", () => {
    const entries = recipeEntries(committed().sources);
    const singleBatter = ["bread", "enriched-bread", "flatbread", "quick-bread", "muffin", "biscuit-scone", "cookie", "bar", "cake", "cracker"] as const;
    for (const cat of singleBatter) {
      const simulable = entries.filter((e) => e.category === cat && isSimulable(e)).length;
      expect({ cat, hasSimulable: simulable >= 2 }).toEqual({ cat, hasSimulable: true });
    }
  });
});

describe("converted recipes bake as their own steps say", () => {
  // The curated archetypes reach done at 0.61–0.92 of their own bake time in this model;
  // a converted thick good is held to the same band, widened to 0.5–1.1.
  it.each([
    "american-dessert-all-authentic-chocolate-chip-cookies",
    "hsca-lunch-all-herbed-dinner-rolls",
    "hsca-dessert-all-carob-cake-with-walnuts",
    "american-dinner-all-authentic-cornbread",
  ])("%s is done within 0.5–1.1 of the recipe's longest stated time", (id) => {
    const { result, stated } = bake(id);
    expect(stated).not.toBeNull();
    const longest = stated?.[1] ?? 0;
    expect(result.doneMin).not.toBeNull();
    const ratio = (result.doneMin ?? Infinity) / longest;
    expect(ratio).toBeGreaterThanOrEqual(0.5);
    expect(ratio).toBeLessThanOrEqual(1.1);
    expect(result.warnings.filter((w) => w.severity === "critical")).toEqual([]);
  });

  it("a thin focaccia's time is set by drying and browning, not by its core", () => {
    const { result, stated } = bake("italian-dinner-all-authentic-focaccia-genovese");
    const last = result.frames[result.frames.length - 1];
    expect((result.doneMin ?? Infinity) / (stated?.[1] ?? 1)).toBeLessThan(0.5);
    expect(last?.moistureLossPct ?? 0).toBeGreaterThan(10);
  });
});
