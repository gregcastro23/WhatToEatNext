/**
 * @jest-environment node
 *
 * Regression & scoring contract tests for cuisineSauceProfiler:
 * - Prevents the blank cuisine dropdown bug (lowercase/partial maps vs Display keys)
 * - Verifies all 15 traditions return native sauces and distinct telemetry
 * - Verifies pairing aliases, regional crosswalks, zodiac element transits,
 *   dietary fallback, orthogonal ESMS non-fabrication, and ID parity with sauceLineage.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { cuisines as staticCuisines } from "@/data/cuisines";
import { parseSauceCatalogueFile } from "@/lib/sauces/catalogueFile";
import {
  getCuisineFingerprint,
  listCuisines,
  recommendForCuisineContext,
} from "../cuisineSauceProfiler";
import { getSauceForest, resolveNodeId } from "../sauceLineage";

const FILE = join(__dirname, "..", "..", "..", "..", "public", "data", "sauce-catalogue.json");
const catalogue = parseSauceCatalogueFile(JSON.parse(readFileSync(FILE, "utf8")));

describe("cuisineSauceProfiler regression & scoring", () => {
  it("lists all 15 traditions across full catalogue, default cuisinesMap, and lowercase staticCuisines", () => {
    const fromCatalogue = listCuisines(catalogue.cuisines);
    const fromDefault = listCuisines();
    const fromStatic = listCuisines(staticCuisines);

    expect(fromCatalogue).toHaveLength(15);
    expect(fromDefault).toHaveLength(15);
    expect(fromStatic).toHaveLength(15);
    expect(fromCatalogue.map((c) => c.key)).toContain("Middle Eastern");
    expect(fromCatalogue.find((c) => c.key === "Italian")?.sauceCount).toBeGreaterThanOrEqual(6);
  });

  it("resolves Middle Eastern across spacing and casing variants", () => {
    for (const variant of ["Middle Eastern", "MiddleEastern", "middleEastern", "middle-eastern"]) {
      const fp = getCuisineFingerprint(variant, catalogue.cuisines);
      expect(fp?.name).toBe("Middle Eastern");
      expect(fp?.traditionalSauceCount).toBeGreaterThan(0);
    }
  });

  it("returns cuisine-native sauces for every one of the 15 traditions", () => {
    for (const { key } of listCuisines(catalogue.cuisines)) {
      const results = recommendForCuisineContext(
        { cuisine: key },
        { strictCuisine: true, maxResults: 10 },
        catalogue.cuisines,
      );
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((r) => r.sauce.ownerCuisine?.toLowerCase() === key.toLowerCase()),
      ).toBe(true);
    }
  });

  it("reconciles protein, vegetable, cooking method, and regional aliases", () => {
    const chineseStirFry = recommendForCuisineContext(
      { cuisine: "Chinese", cookingMethod: "sautéing" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(chineseStirFry.some((r) => r.tags.includes("method:sautéing"))).toBe(true);

    const frenchGreens = recommendForCuisineContext(
      { cuisine: "French", vegetable: "leafy" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(frenchGreens.some((r) => r.tags.includes("vegetable:leafy"))).toBe(true);

    const russianPoultry = recommendForCuisineContext(
      { cuisine: "Russian", protein: "chicken" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(russianPoultry.some((r) => r.tags.includes("protein:chicken"))).toBe(true);

    const sicilian = recommendForCuisineContext(
      { cuisine: "Italian", region: "sicilian" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(sicilian.some((r) => r.tags.includes("region:sicilian"))).toBe(true);

    const cali = recommendForCuisineContext(
      { cuisine: "American", region: "california" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(cali.some((r) => r.tags.includes("region:california"))).toBe(true);

    const newEngland = recommendForCuisineContext(
      { cuisine: "American", region: "newEngland" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(newEngland.some((r) => r.tags.includes("region:newEngland"))).toBe(true);

    const centralMexico = recommendForCuisineContext(
      { cuisine: "Mexican", region: "centralMexico" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(centralMexico.some((r) => r.tags.includes("region:centralMexico"))).toBe(true);
  });

  it("wires byAstrological with zodiac element transit reasoning", () => {
    const results = recommendForCuisineContext(
      {
        cuisine: "French",
        cosmic: { zodiac: "Leo", isDaytime: true },
        cosmicWeight: 0.6,
      },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    expect(
      results.some((r) => r.reasoning.some((line) => line.includes("Aligned with Leo (Fire) transit"))),
    ).toBe(true);
  });

  it("keeps ESMS strictly orthogonal (never fabricates alchemicalProperties from 4 elements)", () => {
    const african = recommendForCuisineContext(
      { cuisine: "African" },
      { strictCuisine: true },
      catalogue.cuisines,
    );
    const nativeNonCatalog = african.find((r) => r.sauce.origin === "traditional" && !r.sauce.dataKey);
    expect(nativeNonCatalog).toBeDefined();
    expect(nativeNonCatalog?.sauce.alchemicalProperties).toBeUndefined();
  });

  it("evaluates unlisted vegan sauces fairly while penalizing non-vegan sauces", () => {
    const italianVegan = recommendForCuisineContext(
      { cuisine: "Italian", dietary: ["vegan"] },
      { maxResults: 30 },
      catalogue.cuisines,
    );
    const carbonara = italianVegan.find((r) => r.sauce.name === "Carbonara");
    const salsaRoja = italianVegan.find((r) => r.sauce.name === "Salsa Roja");
    expect(carbonara?.breakdown.dietaryFit).toBe(0);
    expect(salsaRoja?.breakdown.dietaryFit).toBeGreaterThanOrEqual(0.85);
  });

  it("maintains 100% ID parity with getSauceForest(catalogue.cuisines)", () => {
    const forest = getSauceForest(catalogue.cuisines);
    for (const { key } of listCuisines(catalogue.cuisines)) {
      const results = recommendForCuisineContext(
        { cuisine: key },
        { maxResults: 20 },
        catalogue.cuisines,
      );
      for (const r of results) {
        if (r.sauce.origin === "named-only") {
          expect(r.sauce.id).toContain(":named:");
        } else {
          expect(forest.nodes.has(r.sauce.id)).toBe(true);
          expect(resolveNodeId(forest, r.sauce.id)).toBe(r.sauce.id);
        }
      }
    }
  });
});
