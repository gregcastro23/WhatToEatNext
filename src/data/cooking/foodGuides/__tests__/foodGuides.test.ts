/**
 * Every shipped food guide: valid, fully cited, food-safe and linked to real
 * ingredient cards. These are the rules the research was held to, enforced so
 * a later edit cannot quietly break them.
 *
 * @jest-environment node
 */
import { SAFE_INTERNAL_TEMPERATURES } from "@/data/cooking/foodSafety";
import { getFoodGuides } from "@/lib/cooking/foodGuides/registry";
import { citedSourceIds, type FoodGuide, type SafetyClass } from "@/lib/cooking/foodGuides/schema";
import { matchGuides } from "@/lib/cooking/methodSearch/matchGuides";
import { resolveCatalogIngredient } from "@/lib/ingredients/ingredientCatalog";

const guides = getFoodGuides();

/** USDA safe minimum internal temperature per class, from the cited safety table. */
function floorFor(safetyClass: SafetyClass): number | null {
  const category: Partial<Record<SafetyClass, string>> = {
    poultry: "poultry",
    ground_meat: "ground-meat",
    whole_meat: "whole-meat",
    fish: "finfish",
  };
  const wanted = category[safetyClass];
  const row = SAFE_INTERNAL_TEMPERATURES.find((entry) => entry.category === wanted);
  return row ? row.minTempF : null;
}

describe("food guides", () => {
  it("cover the first batch of common foods", () => {
    expect(guides.length).toBeGreaterThanOrEqual(23);
    expect(guides.map((guide) => guide.id)).toContain("bacon");
  });

  it("have unique ids and names that name one guide each", () => {
    expect(new Set(guides.map((guide) => guide.id)).size).toBe(guides.length);
    for (const guide of guides) {
      expect(matchGuides(guide.name, guides).map((match) => match.id)).toEqual([guide.id]);
    }
    const aliases = guides.flatMap((guide) => guide.aliases);
    expect(new Set(aliases).size).toBe(aliases.length);
  });

  it.each(guides.map((guide) => [guide.id, guide] satisfies [string, FoodGuide]))("%s cites every statement and every source", (_, guide) => {
    const ids = new Set(guide.sources.map((source) => source.id));
    const cited = citedSourceIds(guide);
    expect(cited.filter((id) => !ids.has(id))).toEqual([]);
    expect([...ids].filter((id) => !cited.includes(id))).toEqual([]);
  });

  it.each(guides.map((guide) => [guide.id, guide] satisfies [string, FoodGuide]))("%s has one recommended method and distinct methods", (_, guide) => {
    expect(guide.methods.filter((method) => method.best)).toHaveLength(1);
    expect(new Set(guide.methods.map((method) => method.id)).size).toBe(guide.methods.length);
  });

  it("never states an internal temperature below the USDA safe minimum", () => {
    const unsafe = guides.flatMap((guide) => {
      const floor = floorFor(guide.safetyClass);
      return guide.methods.flatMap((method) =>
        method.quantities
          .filter((quantity) => quantity.kind === "internal_temp" && floor !== null && quantity.min < floor)
          .map((quantity) => `${guide.id}/${method.id}: ${quantity.min}`),
      );
    });
    expect(unsafe).toEqual([]);
  });

  it("gives every poultry and meat method its internal temperature", () => {
    const missing = guides
      .filter((guide) => ["poultry", "ground_meat", "whole_meat"].includes(guide.safetyClass))
      .flatMap((guide) =>
        guide.methods
          .filter((method) => !method.quantities.some((quantity) => quantity.kind === "internal_temp"))
          .map((method) => `${guide.id}/${method.id}`),
      );
    expect(missing).toEqual([]);
  });

  it("links to ingredient cards that exist", () => {
    const broken = guides.flatMap((guide) =>
      guide.catalogKeys.filter((key) => resolveCatalogIngredient(key)?.entry.key !== key).map((key) => `${guide.id}: ${key}`),
    );
    expect(broken).toEqual([]);
  });
});
