import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DIETARY_PERSONA_KEYS, parseDietaryPersonaParam } from "@/data/adaptations/personas";
import type { Recipe } from "@/types/recipe";
import { adaptRecipe } from "@/utils/dietaryAdaptation";
import { DietaryAdaptationPanel } from "../DietaryAdaptationPanel";

afterEach(cleanup);

function buildTestRecipe(): Recipe {
  return {
    id: "recipe-chicken-test",
    name: "Roasted Chicken with Herbs",
    cuisine: "Mediterranean",
    ingredients: [
      { name: "chicken breast", amount: 250, unit: "g" },
      { name: "olive oil", amount: 15, unit: "ml" },
    ],
    instructions: [
      "Season the chicken breast and roast in olive oil until cooked through.",
    ],
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
  };
}

describe("DietaryAdaptationPanel culinary gate integration", () => {
  it("evaluates vegetarian swaps through verifyRecipeContent and reports evaluated restrictions", () => {
    const onModeChange = jest.fn();
    render(
      <DietaryAdaptationPanel
        recipe={buildTestRecipe()}
        activeMode="vegetarian"
        onModeChange={onModeChange}
      />,
    );

    expect(screen.getByText(/Adapted for vegetarian/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Evaluated restrictions: vegetarian/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ESMS\/planetary scores reflect the original recipe/i),
    ).toBeInTheDocument();
  });

  it("surfaces unevaluated restrictions honestly when an unsupported gate mode like keto is active", () => {
    const recipe: Recipe = {
      ...buildTestRecipe(),
      ingredients: [
        { name: "white rice", amount: 200, unit: "g" },
        { name: "olive oil", amount: 15, unit: "ml" },
      ],
    };
    const onModeChange = jest.fn();
    render(
      <DietaryAdaptationPanel
        recipe={recipe}
        activeMode="keto"
        onModeChange={onModeChange}
      />,
    );

    expect(
      screen.getByText(
        /Unevaluated restriction \(keto\): heuristic swap preview only; not certified by the culinary gate/i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reset to original/i }));
    expect(onModeChange).toHaveBeenCalledWith(null);
  });

  it("supports all 9 dietary personas including low-fodmap, pescatarian, and paleo", () => {
    expect(DIETARY_PERSONA_KEYS).toEqual([
      "vegan",
      "vegetarian",
      "gluten-free",
      "dairy-free",
      "keto",
      "low-carb",
      "low-fodmap",
      "pescatarian",
      "paleo",
    ]);
    expect(parseDietaryPersonaParam("Low-FODMAP")).toBe("low-fodmap");
    expect(parseDietaryPersonaParam(["pescatarian"])).toBe("pescatarian");
    expect(parseDietaryPersonaParam("unknown-persona")).toBeNull();

    const fodmapRecipe: Recipe = {
      ...buildTestRecipe(),
      ingredients: [
        { name: "garlic", amount: 3, unit: "cloves" },
        { name: "yellow onion", amount: 1, unit: "medium" },
      ],
    };
    const fodmapAdapted = adaptRecipe(fodmapRecipe, "low-fodmap");
    expect(fodmapAdapted.swaps.length).toBeGreaterThanOrEqual(2);

    const pescAdapted = adaptRecipe(buildTestRecipe(), "pescatarian");
    expect(pescAdapted.swaps).toHaveLength(1);
    expect(pescAdapted.swaps[0]?.to.name).toMatch(/cod fillet/i);

    const paleoRecipe: Recipe = {
      ...buildTestRecipe(),
      ingredients: [
        { name: "all-purpose flour", amount: 120, unit: "g" },
        { name: "butter", amount: 30, unit: "g" },
      ],
    };
    const paleoAdapted = adaptRecipe(paleoRecipe, "paleo");
    expect(paleoAdapted.swaps.length).toBeGreaterThanOrEqual(2);
  });
});
