import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Recipe } from "@/types/recipe";
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
});
