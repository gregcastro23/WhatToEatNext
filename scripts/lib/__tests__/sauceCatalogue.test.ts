/**
 * @jest-environment node
 *
 * Drift & integrity gate for `public/data/sauce-catalogue.json`.
 * Fails whenever the committed catalogue differs from `buildSauceCatalogueFile()`.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { parseSauceCatalogueFile, type SauceCatalogueFile } from "@/lib/sauces/catalogueFile";
import { buildSauceCatalogueFile } from "../buildSauceCatalogue";

const FILE = join(__dirname, "..", "..", "..", "public", "data", "sauce-catalogue.json");

function committed(): SauceCatalogueFile {
  return parseSauceCatalogueFile(JSON.parse(readFileSync(FILE, "utf8")));
}

describe("generated sauce catalogue", () => {
  jest.setTimeout(30_000);

  it("matches buildSauceCatalogueFile() exactly", async () => {
    const built = await buildSauceCatalogueFile();
    expect(committed()).toEqual(built);
  });

  it("contains all 15 public traditions and excludes internal HSCA", () => {
    const file = committed();
    expect(file.cuisineCount).toBe(15);
    expect(file.sauceCount).toBeGreaterThanOrEqual(80);
    expect(file.cuisines.HSCA).toBeUndefined();
    expect(file.cuisines["Middle Eastern"]).toBeDefined();
    expect(file.cuisines.Fusion).toBeDefined();
  });

  it("includes regional dialects and pairing maps across all 14 regional traditions", () => {
    const file = committed();
    for (const [name, entry] of Object.entries(file.cuisines)) {
      if (name === "Fusion") continue;
      expect(entry.regionalCuisines.length).toBeGreaterThan(0);
      expect(Object.keys(entry.sauceRecommender.forProtein).length).toBeGreaterThan(0);
      expect(Object.keys(entry.sauceRecommender.forVegetable).length).toBeGreaterThan(0);
      expect(Object.keys(entry.sauceRecommender.forCookingMethod).length).toBeGreaterThan(0);
    }
  });

  it("pre-resolves ingredient dossier slugs", () => {
    const file = committed();
    const slugs = Object.entries(file.ingredientSlugs);
    expect(slugs.length).toBeGreaterThan(50);
    for (const [key, slug] of slugs) {
      expect(key).toBe(key.toLowerCase());
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
