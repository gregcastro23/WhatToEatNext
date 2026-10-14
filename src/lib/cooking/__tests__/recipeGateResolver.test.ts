/**
 * @jest-environment node
 *
 * Test suite for ingredient resolver normalization (Phase 45 Slice A3).
 *
 * Verifies:
 * 1. Plural de-inflections (carrots, scallions, tomatoes, potatoes, shallots, strawberries).
 * 2. Preparation, state, and quantity prefixes (extra virgin, pinch, freshly ground, boiling, cold).
 * 3. Explicit staple synonyms (egg/eggs -> chicken_egg, shoyu -> soy_sauce, dijon -> mustard, etc.).
 * 4. False-positive and safety controls (apple cider vinegar != apple, watercress != watercres,
 *    gluten-free is never stripped, unknown ingredients return null).
 * 5. Preservation of the primary-unresolved rule in verifyAndRepairCosmicRecipe.
 *
 * @file src/lib/cooking/__tests__/recipeGateResolver.test.ts
 */

import { describe, expect, it } from "@jest/globals";
import { VALID_RECIPE } from "@/app/api/generate-cosmic-recipe/__tests__/helpers/validCosmicRecipe";
import {
  depluralizeIngredientName,
  tryResolveFromCatalog,
  resolveSingleIngredient,
} from "@/lib/cooking/recipeGateHelpers";
import {
  verifyAndRepairCosmicRecipe,
  type CosmicRecipe,
} from "@/lib/cooking/recipeVerificationGate";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";

describe("resolver normalization: depluralization", () => {
  it("generates expected singular candidates for regular plurals", () => {
    expect(depluralizeIngredientName("carrots")).toEqual(["carrot"]);
    expect(depluralizeIngredientName("scallions")).toEqual(["scallion"]);
    expect(depluralizeIngredientName("strawberries")).toEqual(["strawberry"]);
    expect(depluralizeIngredientName("tomatoes")).toEqual([
      "tomato",
      "tomatoe",
    ]);
  });

  it("does not strip double-s words like watercress or lemongrass", () => {
    expect(depluralizeIngredientName("watercress")).toEqual([]);
    expect(depluralizeIngredientName("lemongrass")).toEqual([]);
  });

  it("resolves plural ingredients to their singular catalog cards", () => {
    expect(tryResolveFromCatalog("carrots")?.key).toBe("carrot");
    expect(tryResolveFromCatalog("scallions")?.key).toBe("scallion");
    expect(tryResolveFromCatalog("onions")?.key).toBe("onion");
    expect(tryResolveFromCatalog("tomatoes")?.key).toBe("tomato");
    expect(tryResolveFromCatalog("potatoes")?.key).toBe("potato");
    expect(tryResolveFromCatalog("shallots")?.key).toBe("shallot");
    expect(tryResolveFromCatalog("strawberries")?.key).toBe("strawberry");
  });
});

describe("resolver normalization: preparation and quality prefixes", () => {
  it("resolves extra virgin olive oil variants to olive_oil", () => {
    expect(tryResolveFromCatalog("extra virgin olive oil")?.key).toBe(
      "olive_oil",
    );
    expect(tryResolveFromCatalog("extra-virgin olive oil")?.key).toBe(
      "olive_oil",
    );
    expect(tryResolveFromCatalog("virgin olive oil")?.key).toBe("olive_oil");
  });

  it("resolves pinch and ground prefixes to canonical cards", () => {
    expect(tryResolveFromCatalog("pinch sea salt")?.key).toBe("sea_salt");
    expect(tryResolveFromCatalog("pinch of sea salt")?.key).toBe("sea_salt");
    expect(tryResolveFromCatalog("freshly ground black pepper")?.key).toBe(
      "black_pepper",
    );
    expect(tryResolveFromCatalog("freshly-ground black pepper")?.key).toBe(
      "black_pepper",
    );
  });

  it("resolves temperature and state qualifiers on water", () => {
    expect(tryResolveFromCatalog("boiling water")?.key).toBe("water");
    expect(tryResolveFromCatalog("warm water")?.key).toBe("water");
    expect(tryResolveFromCatalog("cold water")?.key).toBe("water");
    expect(tryResolveFromCatalog("filtered water")?.key).toBe("water");
    expect(tryResolveFromCatalog("lukewarm water")?.key).toBe("water");
  });

  it("resolves preparation prefixes combined with plurals", () => {
    expect(tryResolveFromCatalog("finely chopped onions")?.key).toBe("onion");
    expect(tryResolveFromCatalog("thinly sliced carrots")?.key).toBe("carrot");
    expect(tryResolveFromCatalog("blanched almonds")?.key).toBe("almonds");
  });
});

describe("resolver normalization: explicit staple synonyms", () => {
  it("resolves egg and eggs to chicken_egg card", () => {
    expect(tryResolveFromCatalog("egg")?.key).toBe("chicken_egg");
    expect(tryResolveFromCatalog("eggs")?.key).toBe("chicken_egg");
  });

  it("resolves shoyu to soy_sauce", () => {
    expect(tryResolveFromCatalog("shoyu")?.key).toBe("soy_sauce");
  });

  it("resolves dijon mustard to mustard", () => {
    expect(tryResolveFromCatalog("dijon mustard")?.key).toBe("mustard");
    expect(tryResolveFromCatalog("dijon")?.key).toBe("mustard");
  });

  it.each(["lemon juice", "lime juice", "ginger juice", "orange juice"])(
    "keeps the distinct juice form %s unresolved without a matching card",
    (name) => {
      expect(tryResolveFromCatalog(name)).toBeNull();
    },
  );

  it("resolves rice syrup to brown_rice_syrup", () => {
    expect(tryResolveFromCatalog("rice syrup")?.key).toBe("brown_rice_syrup");
  });

  it("does not substitute generic flour for whole wheat pastry flour", () => {
    expect(tryResolveFromCatalog("whole wheat pastry flour")).toBeNull();
  });

  it("resolves parmigiano-reggiano to parmesan", () => {
    expect(tryResolveFromCatalog("parmigiano-reggiano")?.key).toBe("parmesan");
    expect(tryResolveFromCatalog("parmigiano reggiano")?.key).toBe("parmesan");
  });
});

describe("resolver normalization: false-positive and safety controls", () => {
  it("does not falsely collapse apple cider vinegar into apple", () => {
    expect(tryResolveFromCatalog("apple cider vinegar")?.key).toBe(
      "apple_cider_vinegar",
    );
  });

  it("preserves watercress and lemongrass as exact cards without improper trimming", () => {
    expect(tryResolveFromCatalog("watercress")?.key).toBe("watercress");
    expect(tryResolveFromCatalog("lemongrass")?.key).toBe("lemongrass");
  });

  it("does not strip gluten-free into gluten-containing counterparts", () => {
    expect(tryResolveFromCatalog("gluten-free soy sauce")).toBeNull();
  });

  it("returns null for unknown ingredients without fabricating cards", () => {
    expect(tryResolveFromCatalog("fictional_astral_herb")).toBeNull();
    expect(tryResolveFromCatalog("mystic crystal powder")).toBeNull();
  });
});

describe("resolver gate integration: primary vs secondary unresolved rule", () => {
  const createBaseRecipe = (): CosmicRecipe =>
    cosmicRecipeSchema.parse(VALID_RECIPE);

  it("emits blocking UNRESOLVED_PRIMARY_INGREDIENT when primary ingredient is unresolved", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "completely_unresolvable_root_12345",
        quantity: "100",
        unit: "g",
        optional: false,
        substitutions: [],
      },
      {
        name: "salt",
        quantity: "1",
        unit: "tsp",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(false);
    expect(
      outcome.blockingFindings.some(
        (f) => f.code === "UNRESOLVED_PRIMARY_INGREDIENT",
      ),
    ).toBe(true);
  });

  it("emits advisory UNRESOLVED_CATALOG_INGREDIENT when non-primary ingredient is unresolved", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "salt",
        quantity: "1",
        unit: "tsp",
        optional: false,
        substitutions: [],
      },
      {
        name: "completely_unresolvable_secondary_spice_12345",
        quantity: "1",
        unit: "pinch",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(
      outcome.blockingFindings.some(
        (f) => f.code === "UNRESOLVED_PRIMARY_INGREDIENT",
      ),
    ).toBe(false);
    expect(
      outcome.advisoryFindings.some(
        (f) => f.code === "UNRESOLVED_CATALOG_INGREDIENT",
      ),
    ).toBe(true);
  });

  it("resolves primary ingredient when normalized via prefixes/plurals, passing gate without primary blocking", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "extra virgin olive oil",
        quantity: "2",
        unit: "tbsp",
        optional: false,
        substitutions: [],
      },
      {
        name: "carrots",
        quantity: "200",
        unit: "g",
        optional: false,
        substitutions: [],
      },
      {
        name: "freshly ground black pepper",
        quantity: "1",
        unit: "tsp",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
    expect(outcome.audit.unresolvedIngredients).toHaveLength(0);
  });

  it("resolveSingleIngredient exposes resolved entry and gram weight", () => {
    const res = resolveSingleIngredient({
      name: "extra virgin olive oil",
      quantity: "2",
      unit: "tbsp",
      optional: false,
      substitutions: [],
    });
    expect(res.entry?.key).toBe("olive_oil");
    expect(res.gramWeight).toBeGreaterThan(0);
  });
});
