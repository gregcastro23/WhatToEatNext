/**
 * @jest-environment node
 *
 * Unit tests for scripts/seedHistoricalCatalogCritiques.ts:
 * - CLI flag parsing (--dry-run, -n, --per-agent, --slug)
 * - Dietary profile derivation from historical agent preferences
 * - Recipe compliance enforcement (vegetarian, alliums, pork, alcohol)
 * - Deterministic recipe selection and authentic critique text generation
 */

import type { Recipe } from "../../../src/types/recipe";
import {
  buildCatalogCritiqueText,
  deriveAgentDietaryProfile,
  isRecipeCompliantForAgent,
  parseSeedCritiquesArgs,
  selectRecipesForAgent,
} from "../../seedHistoricalCatalogCritiques";

function makeRecipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: overrides.id ?? "rec-1",
    name: overrides.name ?? "Simple Millet Porridge",
    cuisine: overrides.cuisine ?? "Classical",
    ingredients: overrides.ingredients ?? [
      { name: "millet", amount: 200, unit: "g" },
      { name: "olive oil", amount: 15, unit: "ml" },
      { name: "sea salt", amount: 5, unit: "g" },
    ],
    instructions: overrides.instructions ?? [
      "Simmer the millet gently with olive oil and sea salt until tender.",
    ],
    elementalProperties: overrides.elementalProperties ?? {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    },
  };
}

describe("seedHistoricalCatalogCritiques", () => {
  it("parses CLI flags (--dry-run, --per-agent, --slug)", () => {
    const parsed = parseSeedCritiquesArgs([
      "--dry-run",
      "--per-agent=3",
      "--slug=Leonardo-Da-Vinci, socrates ",
    ]);
    expect(parsed.dryRun).toBe(true);
    expect(parsed.critiquesPerAgent).toBe(3);
    expect(Array.from(parsed.slugFilter ?? [])).toEqual([
      "leonardo-da-vinci",
      "socrates",
    ]);
  });

  it("enforces vegetarian and allium restrictions for historical agents", () => {
    const leonardoProfile = deriveAgentDietaryProfile("leonardo-da-vinci", {
      avoidedFoods: ["Meat (Leonardo was a noted vegetarian)"],
      dietaryPhilosophy: "The body should not be a tomb for animals.",
    });
    expect(leonardoProfile.requiresVegetarian).toBe(true);

    const chickenDish = makeRecipe({
      id: "chicken-1",
      name: "Roasted Chicken",
      ingredients: [
        { name: "chicken breast", amount: 250, unit: "g" },
        { name: "olive oil", amount: 15, unit: "ml" },
        { name: "thyme", amount: 5, unit: "g" },
      ],
    });
    const milletDish = makeRecipe({
      id: "millet-1",
      name: "Herbed Millet",
    });

    expect(isRecipeCompliantForAgent(chickenDish, leonardoProfile)).toBe(false);
    expect(isRecipeCompliantForAgent(milletDish, leonardoProfile)).toBe(true);

    const gandhiProfile = deriveAgentDietaryProfile("mahatma-gandhi", {
      avoidedFoods: ["Meat (lifelong vegetarian)", "Garlic and onions (for periods)"],
    });
    expect(gandhiProfile.requiresVegetarian).toBe(true);
    expect(gandhiProfile.avoidAlliums).toBe(true);

    const garlicDish = makeRecipe({
      id: "garlic-1",
      name: "Roasted Garlic Greens",
      ingredients: [
        { name: "kale", amount: 200, unit: "g" },
        { name: "garlic", amount: 10, unit: "g" },
        { name: "olive oil", amount: 15, unit: "ml" },
      ],
    });
    expect(isRecipeCompliantForAgent(garlicDish, gandhiProfile)).toBe(false);
  });

  it("selects compliant recipes and generates unrated curated critique text", () => {
    const profile = deriveAgentDietaryProfile("leonardo-da-vinci", {
      favoriteFoods: ["Millet porridge"],
      culturalCuisine: "Renaissance Florentine",
      dietaryPhilosophy: "Plant-based geometric harmony.",
    });
    const catalog = [
      makeRecipe({
        id: "meat-dish",
        name: "Beef Stew",
        ingredients: [
          { name: "beef chuck", amount: 300, unit: "g" },
          { name: "carrots", amount: 100, unit: "g" },
          { name: "water", amount: 500, unit: "ml" },
        ],
      }),
      makeRecipe({
        id: "veg-dish",
        name: "Florentine Millet Bowl",
      }),
    ];

    const selected = selectRecipesForAgent(
      "leonardo-da-vinci",
      profile,
      catalog,
      1,
      new Map(),
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]?.id).toBe("veg-dish");

    const critique = buildCatalogCritiqueText({
      agentSlug: "leonardo-da-vinci",
      agentName: "Leonardo da Vinci",
      dominantElement: "Fire",
      profile,
      recipe: selected[0]!,
    });
    expect(critique).toContain("Florentine Millet Bowl");
    expect(critique).toContain("millet");
  });
});
