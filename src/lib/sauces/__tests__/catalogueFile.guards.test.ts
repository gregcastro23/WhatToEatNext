/**
 * @jest-environment node
 *
 * Guard tests for `parseSauceCatalogueFile`: rejects null, non-finite numbers,
 * missing required fields, and malformed nested records while passing the
 * committed catalogue control.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { parseSauceCatalogueFile } from "../catalogueFile";

const FILE = join(__dirname, "..", "..", "..", "..", "public", "data", "sauce-catalogue.json");

function cloneCatalogue(): Record<string, unknown> {
  const parsed: unknown = JSON.parse(readFileSync(FILE, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Expected catalogue root object");
  }
  return Object.fromEntries(Object.entries(parsed));
}

describe("parseSauceCatalogueFile guards", () => {
  it("accepts the real generated sauce-catalogue.json payload", () => {
    const parsed = parseSauceCatalogueFile(cloneCatalogue());
    expect(parsed.cuisineCount).toBe(15);
    expect(parsed.cuisines.Italian).toBeDefined();
  });

  it("rejects JSON null, primitives, and arrays", () => {
    expect(() => parseSauceCatalogueFile(JSON.parse("null"))).toThrow();
    expect(() => parseSauceCatalogueFile("string")).toThrow();
    expect(() => parseSauceCatalogueFile([])).toThrow();
  });

  it("rejects non-finite numeric values", () => {
    const badCount = cloneCatalogue();
    badCount.sauceCount = Number.POSITIVE_INFINITY;
    expect(() => parseSauceCatalogueFile(badCount)).toThrow();

    const nanElem = cloneCatalogue();
    const cuisines = nanElem.cuisines;
    if (typeof cuisines === "object" && cuisines !== null && "Italian" in cuisines) {
      const italian = cuisines.Italian;
      if (typeof italian === "object" && italian !== null) {
        nanElem.cuisines = {
          ...cuisines,
          Italian: {
            ...italian,
            elementalProperties: { Fire: Number.NaN, Water: 0.25, Earth: 0.25, Air: 0.25 },
          },
        };
      }
    }
    expect(() => parseSauceCatalogueFile(nanElem)).toThrow();

    // Control: valid finite elementalProperties parses
    const control = cloneCatalogue();
    expect(parseSauceCatalogueFile(control).cuisineCount).toBe(15);
  });

  it("rejects missing required fields and malformed nested maps", () => {
    const missingSource = cloneCatalogue();
    delete missingSource.source;
    expect(() => parseSauceCatalogueFile(missingSource)).toThrow();

    const badSlugs = cloneCatalogue();
    badSlugs.ingredientSlugs = { garlic: 42 };
    expect(() => parseSauceCatalogueFile(badSlugs)).toThrow();

    const badCuisineEntry = cloneCatalogue();
    badCuisineEntry.cuisines = { Broken: { id: "", name: "" } };
    expect(() => parseSauceCatalogueFile(badCuisineEntry)).toThrow();
  });
});
