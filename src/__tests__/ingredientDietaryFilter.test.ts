/**
 * Regression tests for the ingredient dietary filter.
 *
 * The defect: `applyDietaryFilter` read a `dietaryFlags` object that no
 * ingredient defines (0 of 1,158 records) and skipped the record when it was
 * absent, so every dietary constraint was a passthrough. Asking for vegan
 * ingredients returned all 1,158 - the entire catalog, meat and dairy
 * included.
 */

import { UnifiedIngredientService } from "@/services/UnifiedIngredientService";
import {
  classifyIngredientDiet,
  readAllergenAttestation,
} from "@/utils/ingredientDietaryClassification";

const service = UnifiedIngredientService.getInstance();

const flatten = (result: unknown): Array<Record<string, unknown>> =>
  Object.values(result as Record<string, Array<Record<string, unknown>>>).flat();

const filterBy = (dietary: Record<string, unknown>) =>
  flatten(
    service.filterIngredients({
      dietary: { restrictions: [], preferences: [], ...dietary },
    } as never),
  );

const lowerNames = (records: Array<Record<string, unknown>>): Set<string> =>
  new Set(records.map((r) => String(r.name).toLowerCase()));

describe("dietary filter is not a passthrough", () => {
  const catalogSize = flatten(service.getAllIngredients()).length;

  it("has a non-empty catalog to filter", () => {
    expect(catalogSize).toBeGreaterThan(0);
  });

  it("does not classify the entire catalog as vegan", () => {
    // The exact failing condition: the vegan result equalled the catalog.
    const vegan = filterBy({ isVegan: true });
    expect(vegan.length).toBeLessThan(catalogSize);
    expect(vegan.length).toBeGreaterThan(0);
  });

  it("excludes meat, seafood, dairy and other animal products from vegan results", () => {
    const names = lowerNames(filterBy({ isVegan: true }));
    for (const animalProduct of [
      "beef",
      "bacon",
      "whole duck",
      "anchovies",
      "fish sauce",
      "oyster sauce",
      "american cheese",
      "heavy whipping cream",
      "ghee",
      "honey",
      "lard",
      "bone broth",
    ]) {
      expect(names.has(animalProduct)).toBe(false);
    }
  });

  it("keeps plant staples in vegan results", () => {
    const names = lowerNames(filterBy({ isVegan: true }));
    // Compound names whose head noun is plant-based must survive the
    // animal-term matching that excludes the items above.
    for (const plant of [
      "garlic",
      "eggplant",
      "firm tofu",
      "coconut milk",
      "almond butter",
      "cream of tartar",
      "vegetable broth",
    ]) {
      expect(names.has(plant)).toBe(true);
    }
  });

  it("allows dairy and eggs for vegetarian but not vegan", () => {
    const vegetarian = lowerNames(filterBy({ isVegetarian: true }));
    const vegan = lowerNames(filterBy({ isVegan: true }));

    expect(vegetarian.has("american cheese")).toBe(true);
    expect(vegan.has("american cheese")).toBe(false);

    // Flesh is excluded from both.
    expect(vegetarian.has("bacon")).toBe(false);
    expect(vegan.has("bacon")).toBe(false);

    expect(vegetarian.size).toBeGreaterThan(vegan.size);
  });

  it("leaves results unfiltered when no dietary constraint is given", () => {
    expect(flatten(service.filterIngredients({} as never)).length).toBe(
      catalogSize,
    );
  });
});

describe("allergen constraints require attestation and never derive", () => {
  it("returns only records that positively attest nut-free", () => {
    const nutFree = filterBy({ isNutFree: true });
    // Far short of the catalog: an unattested record must not pass.
    expect(nutFree.length).toBeLessThan(
      flatten(service.getAllIngredients()).length,
    );
    for (const record of nutFree) {
      expect(readAllergenAttestation(record, "isNutFree")).toBe("compliant");
    }
  });

  it("returns only records that positively attest gluten-free", () => {
    const glutenFree = filterBy({ isGlutenFree: true });
    expect(glutenFree.length).toBeGreaterThan(0);
    for (const record of glutenFree) {
      expect(readAllergenAttestation(record, "isGlutenFree")).toBe("compliant");
    }
  });

  it("excludes everything for constraints the catalog cannot support", () => {
    // Silently ignoring these is the failure mode being fixed: better an empty
    // result than results that may violate the constraint.
    expect(filterBy({ isLowSugar: true })).toHaveLength(0);
    expect(filterBy({ isLowSodium: true })).toHaveLength(0);
    expect(filterBy({ allergies: ["peanut"] })).toHaveLength(0);
  });
});

describe("classifyIngredientDiet", () => {
  it("excludes flesh from both vegan and vegetarian", () => {
    const result = classifyIngredientDiet({ name: "bacon", category: "protein" });
    expect(result.isVegan).toBe("non-compliant");
    expect(result.isVegetarian).toBe("non-compliant");
    expect(result.basis).toContain("flesh");
  });

  it("excludes dairy and egg from vegan but allows them for vegetarian", () => {
    for (const name of ["ghee", "cheddar cheese", "ajitsuke tamago"]) {
      const result = classifyIngredientDiet({ name, category: "misc" });
      expect(result.isVegan).toBe("non-compliant");
      expect(result.isVegetarian).toBe("compliant");
    }
  });

  it("does not mistake plant compounds for the animal word they contain", () => {
    // Each of these contains an animal term as a substring and must not be
    // excluded by it.
    for (const name of [
      "eggplant",
      "coconut milk",
      "almond butter",
      "sunflower seed butter",
      "butternut squash",
      "cream of tartar",
      "vegetable broth",
    ]) {
      const result = classifyIngredientDiet({ name, category: "misc" });
      expect(result.isVegan).toBe("compliant");
    }
  });

  it("reports unknown for preparations of unstated origin rather than guessing", () => {
    for (const name of ["brown stock", "supreme broth gao tang", "refried beans"]) {
      const result = classifyIngredientDiet({ name, category: "misc" });
      expect(result.isVegan).toBe("unknown");
    }
  });

  it("lets an unambiguous plant compound outrank an unreliable dairy tag", () => {
    // The catalog tags cream of tartar (a winemaking byproduct) `dairy-based`.
    const result = classifyIngredientDiet({
      name: "cream of tartar",
      category: "misc",
      qualities: ["dairy-based"],
    });
    expect(result.isVegan).toBe("compliant");
  });

  it("honours the catalog's own taxonomy", () => {
    expect(
      classifyIngredientDiet({ name: "unnamed thing", category: "dairy" }).isVegan,
    ).toBe("non-compliant");
    expect(
      classifyIngredientDiet({
        name: "unnamed thing",
        category: "protein",
        subCategory: "seafood",
      }).isVegetarian,
    ).toBe("non-compliant");
  });

  it("never derives an allergen claim from a name", () => {
    // No mention of nuts is not evidence of their absence.
    expect(
      readAllergenAttestation({ name: "olive oil", category: "oil" }, "isNutFree"),
    ).toBe("unknown");
    expect(
      readAllergenAttestation(
        { name: "quinoa", category: "grain", qualities: ["gluten-free"] },
        "isGlutenFree",
      ),
    ).toBe("compliant");
  });
});
