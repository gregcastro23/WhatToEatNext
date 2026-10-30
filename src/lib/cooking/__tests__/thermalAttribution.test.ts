/**
 * @jest-environment node
 *
 * Thermal Attribution and Step Feasibility Verification (Phase 45 Slice A4).
 *
 * Verifies:
 * 1. Clause-level temperature purpose (oven vs liquid vs internal doneness).
 * 2. Mixed proteins in both ingredient orders (highest safety threshold governs).
 * 3. Species coverage gaps: duck (165°F), tuna (145°F), cod (145°F), shrimp (145°F).
 * 4. Multi-temperature steps (simmer 200°F + oven 400°F does not trigger false positive).
 * 5. Cooling followed by cooking (refrigeration does not bypass unsafe internal roast).
 * 6. Verb and gerund parity for boiling, simmering, poaching, and steaming.
 * 7. Pressure cooking remains explicitly unevaluated without a validated process.
 * 8. Sous-vide unnamed protein attribution from recipe ingredients.
 * 9. Temperature units (°C and °F) in internal doneness checks.
 *
 * @file src/lib/cooking/__tests__/thermalAttribution.test.ts
 */

import {
  verifyAndRepairCosmicRecipe,
  type CosmicRecipe,
} from "@/lib/cooking/recipeVerificationGate";
import { VALID_RECIPE } from "@/app/api/generate-cosmic-recipe/__tests__/helpers/validCosmicRecipe";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";

describe("thermalAttribution and step feasibility (Slice A4)", () => {
  const createBaseRecipe = (): CosmicRecipe =>
    cosmicRecipeSchema.parse(VALID_RECIPE);

  describe("mixed proteins and ingredient order invariance", () => {
    it("flags 150°F internal temperature when beef is listed before chicken", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "beef",
          quantity: "100",
          unit: "g",
          optional: false,
          substitutions: [],
        },
        {
          name: "chicken",
          quantity: "100",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction:
            "Roast beef and chicken until the internal temperature reaches 150°F.",
          time_minutes: 25,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(
        outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE"),
      ).toBe(true);
      const finding = outcome.blockingFindings.find(
        (f) => f.code === "UNSAFE_TEMPERATURE",
      );
      expect(finding?.message).toContain("165°F");
    });

    it("flags 150°F internal temperature when chicken is listed before beef", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "chicken",
          quantity: "100",
          unit: "g",
          optional: false,
          substitutions: [],
        },
        {
          name: "beef",
          quantity: "100",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction:
            "Roast beef and chicken until the internal temperature reaches 150°F.",
          time_minutes: 25,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(
        outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE"),
      ).toBe(true);
      const finding = outcome.blockingFindings.find(
        (f) => f.code === "UNSAFE_TEMPERATURE",
      );
      expect(finding?.message).toContain("165°F");
    });

    it("permits mixed beef and chicken when internal temperature reaches 165°F", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "beef",
          quantity: "100",
          unit: "g",
          optional: false,
          substitutions: [],
        },
        {
          name: "chicken",
          quantity: "100",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction:
            "Roast beef and chicken until the internal temperature reaches 165°F.",
          time_minutes: 30,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });
  });

  describe("species coverage: duck, tuna, cod, shrimp", () => {
    it("flags unsafe internal temperature for duck (<165°F) and passes safe duck (165°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [
        {
          name: "duck",
          quantity: "200",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 120°F.",
          time_minutes: 20,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(
        outcomeUnsafe.blockingFindings.some(
          (f) => f.code === "UNSAFE_TEMPERATURE",
        ),
      ).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [
        {
          name: "duck",
          quantity: "200",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 165°F.",
          time_minutes: 35,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });

    it("flags unsafe internal temperature for tuna (<145°F) and passes safe tuna (145°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [
        {
          name: "tuna",
          quantity: "150",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast tuna until internal temperature reaches 120°F.",
          time_minutes: 10,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(
        outcomeUnsafe.blockingFindings.some(
          (f) => f.code === "UNSAFE_TEMPERATURE",
        ),
      ).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [
        {
          name: "tuna",
          quantity: "150",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast tuna until internal temperature reaches 145°F.",
          time_minutes: 15,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });

    it("flags unsafe internal temperature for cod (<145°F) and passes safe cod (145°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [
        {
          name: "cod",
          quantity: "150",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast cod until internal temperature reaches 120°F.",
          time_minutes: 10,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(
        outcomeUnsafe.blockingFindings.some(
          (f) => f.code === "UNSAFE_TEMPERATURE",
        ),
      ).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [
        {
          name: "cod",
          quantity: "150",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast cod until internal temperature reaches 145°F.",
          time_minutes: 15,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });

    it("flags unsafe internal temperature for shrimp (<145°F) and passes safe shrimp (145°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [
        {
          name: "shrimp",
          quantity: "150",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast shrimp until internal temperature reaches 120°F.",
          time_minutes: 8,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(
        outcomeUnsafe.blockingFindings.some(
          (f) => f.code === "UNSAFE_TEMPERATURE",
        ),
      ).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [
        {
          name: "shrimp",
          quantity: "150",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast shrimp until internal temperature reaches 145°F.",
          time_minutes: 12,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });
  });

  describe("cooling scope and multi-action steps", () => {
    it("does not allow refrigeration keyword to bypass unsafe internal cooking temperature", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "chicken",
          quantity: "150",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction:
            "Refrigerate chicken, then roast until its internal temperature reaches 120°F.",
          time_minutes: 30,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(
        outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE"),
      ).toBe(true);
      const finding = outcome.blockingFindings.find(
        (f) => f.code === "UNSAFE_TEMPERATURE",
      );
      expect(finding?.message).toContain("165°F");
    });

    it("permits multi-action step with simmer at 200°F and bake in oven at 400°F", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "salt",
          quantity: "1",
          unit: "tsp",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction:
            "Simmer the sauce at 200°F, then bake it in the oven at 400°F.",
          time_minutes: 20,
          cooking_method: "simmering",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });

    it("correctly distinguishes oven, liquid, and internal temperatures in a single step", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "chicken breast",
          quantity: "1",
          unit: "lb",
          optional: false,
          substitutions: [],
        },
        {
          name: "chicken broth",
          quantity: "1",
          unit: "cup",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction:
            "Preheat oven to 375°F. Simmer sauce at 190°F. Roast chicken until internal temperature reaches 165°F.",
          time_minutes: 35,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });
  });

  describe("boiling method verb and gerund parity", () => {
    const boilingMethods = [
      "boil",
      "simmer",
      "steam",
      "poach",
      "boiling",
      "simmering",
      "steaming",
      "poaching",
    ];

    it.each(boilingMethods)(
      "flags 230°F liquid water as unsafe for method '%s'",
      (method) => {
        const recipe = createBaseRecipe();
        recipe.ingredients = [
          {
            name: "salt",
            quantity: "1",
            unit: "tsp",
            optional: false,
            substitutions: [],
          },
        ];
        recipe.steps = [
          {
            step_number: 1,
            instruction: "Heat water to 230°F for 10 minutes.",
            time_minutes: 10,
            cooking_method: method,
            tips: [],
          },
        ];

        const outcome = verifyAndRepairCosmicRecipe(recipe);
        expect(outcome.valid).toBe(false);
        expect(
          outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE"),
        ).toBe(true);
        const finding = outcome.blockingFindings.find(
          (f) => f.code === "UNSAFE_TEMPERATURE",
        );
        expect(finding?.message).toContain("212°F");
      },
    );
  });

  describe("pressure context and physical limits", () => {
    it("withholds verification when pressure cooking relies on an unvalidated process", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "salt",
          quantity: "1",
          unit: "tsp",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook under pressure at 235°F for 15 minutes.",
          time_minutes: 15,
          cooking_method: "pressure_cook",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
      expect(outcome.verified).toBe(false);
      expect(
        outcome.advisoryFindings.some(
          (f) => f.code === "UNEVALUATED_THERMAL_PROCESS",
        ),
      ).toBe(true);
    });

    it("does not invent a 250°F pressure limit from a pressure-cooker keyword", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "salt",
          quantity: "1",
          unit: "tsp",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook in the pressure cooker at 270°F for 10 minutes.",
          time_minutes: 10,
          cooking_method: "pressure_cook",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.verified).toBe(false);
      expect(outcome.blockingFindings).toHaveLength(0);
      expect(
        outcome.advisoryFindings.some(
          (f) => f.code === "UNEVALUATED_THERMAL_PROCESS",
        ),
      ).toBe(true);
    });
  });

  describe("sous-vide unnamed protein attribution", () => {
    it("attributes chicken from ingredients when sous-vide step does not name protein explicitly", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "chicken",
          quantity: "200",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook sous vide at 140°F for two hours.",
          time_minutes: 120,
          cooking_method: "sous_vide",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(
        outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE"),
      ).toBe(true);
      const finding = outcome.blockingFindings.find(
        (f) => f.code === "UNSAFE_TEMPERATURE",
      );
      expect(finding?.message).toContain("165°F");
    });

    it("permits sous-vide chicken when cooked at safe minimum internal temperature (165°F)", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        {
          name: "chicken",
          quantity: "200",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook sous vide at 165°F for two hours.",
          time_minutes: 120,
          cooking_method: "sous_vide",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });
  });

  describe("temperature units in Celsius", () => {
    it("converts Celsius internal temperature and validates poultry safety", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [
        {
          name: "duck",
          quantity: "200",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 55°C.", // 55°C = 131°F < 165°F
          time_minutes: 25,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(
        outcomeUnsafe.blockingFindings.some(
          (f) => f.code === "UNSAFE_TEMPERATURE",
        ),
      ).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [
        {
          name: "duck",
          quantity: "200",
          unit: "g",
          optional: false,
          substitutions: [],
        },
      ];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 74°C.", // 74°C = 165.2°F >= 165°F
          time_minutes: 35,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });
  });
});

describe("Phase 45 review: temperature-local purpose and protein", () => {
  function evaluate(names: string[], instruction: string, method = "roast") {
    const recipe = cosmicRecipeSchema.parse(structuredClone(VALID_RECIPE));
    recipe.ingredients = names.map((name) => ({
      name,
      quantity: "100",
      unit: "g",
      optional: false,
      substitutions: [],
    }));
    recipe.steps = [
      {
        step_number: 1,
        instruction,
        time_minutes: 10,
        cooking_method: method,
        tips: [],
      },
    ];
    return verifyAndRepairCosmicRecipe(recipe);
  }

  it.each([
    "Boil water at 230°F in the oven.",
    "Boil water at 230°F and preheat the oven to 400°F.",
  ])(
    "does not let an oven word exempt an explicit liquid temperature: %s",
    (instruction) => {
      const outcome = evaluate(["salt"], instruction, "boiling");
      expect(
        outcome.blockingFindings.some(
          (finding) =>
            finding.code === "UNSAFE_TEMPERATURE" &&
            finding.message.includes("212°F"),
        ),
      ).toBe(true);
    },
  );

  it.each([
    ["beef", "chicken"],
    ["chicken", "beef"],
  ])(
    "checks each independently named protein at its own clause temperature: %s / %s",
    (first, second) => {
      const outcome = evaluate(
        [first, second],
        "Cook beef until its internal temperature reaches 145°F; cook chicken until its internal temperature reaches 165°F.",
      );
      expect(outcome.blockingFindings).toHaveLength(0);
    },
  );

  it("still rejects the named unsafe protein when another clause is safe", () => {
    const outcome = evaluate(
      ["chicken", "beef"],
      "Cook beef until its internal temperature reaches 145°F; cook chicken until its internal temperature reaches 120°F.",
    );
    expect(
      outcome.blockingFindings.some(
        (finding) =>
          finding.code === "UNSAFE_TEMPERATURE" &&
          finding.message.includes("165°F"),
      ),
    ).toBe(true);
  });

  it("does not apply a ground-meat floor to a ground spice", () => {
    const outcome = evaluate(
      ["salt", "ground cumin"],
      "Toast ground cumin until thermometer reads 150°F.",
    );
    expect(outcome.blockingFindings).toHaveLength(0);
  });

  it("allows cooling to a measured internal temperature after cooking", () => {
    const outcome = evaluate(
      ["chicken"],
      "After cooking chicken, refrigerate until internal temperature reaches 40°F.",
    );
    expect(outcome.blockingFindings).toHaveLength(0);
  });

  it("does not treat oven and internal temperatures in one clause as the same purpose", () => {
    const outcome = evaluate(
      ["chicken"],
      "Roast chicken in a 400°F oven until its internal temperature reaches 165°F.",
    );
    expect(outcome.blockingFindings).toHaveLength(0);
  });

  it("enforces poultry floor for a newly recognized named quail", () => {
    const outcome = evaluate(
      ["quail"],
      "Roast quail until internal temperature reaches 120°F.",
    );
    expect(
      outcome.blockingFindings.some(
        (finding) =>
          finding.code === "UNSAFE_TEMPERATURE" &&
          finding.message.includes("165°F"),
      ),
    ).toBe(true);
  });
});
