import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { savedFixture } from "@/lib/recipes/__tests__/helpers/adaptationFixtures";
import { SavedAdaptationView } from "../SavedAdaptationView";

const mockAddRecipe = jest.fn();
const mockOpen = jest.fn();
jest.mock("@/contexts/GroceryCartContext", () => ({
  useGroceryCart: () => ({ addRecipe: mockAddRecipe, open: mockOpen }),
}));

beforeEach(() => { jest.clearAllMocks(); });
afterEach(cleanup);

describe("SavedAdaptationView content and coverage", () => {
  it("renders and carts edited ingredients and steps using the saved version identity", () => {
    const version = savedFixture();
    render(<SavedAdaptationView version={version} publication="unknown" />);
    const ingredientRegion = within(screen.getByRole("region", { name: "Edited ingredients" }));
    expect(ingredientRegion.getByText("250 g firm tofu")).toBeVisible();
    expect(ingredientRegion.queryByText(/chicken/i)).not.toBeInTheDocument();
    const steps = within(screen.getByRole("region", { name: "Edited instructions" }));
    expect(steps.getByText(version.recipe.instructions[0] ?? "missing instruction")).toBeVisible();
    expect(steps.queryByText(/Sauté chicken/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Add saved version ingredients/ }));
    expect(mockAddRecipe).toHaveBeenCalledWith({
      id: version.id, name: version.recipe.name, baseServings: 2, ingredients: version.recipe.ingredients,
    }, 2);
    expect(mockAddRecipe.mock.calls[0]?.[0]?.ingredients[0]).not.toHaveProperty("asin");
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: /Original:/ })).toHaveAttribute("href", `/recipes/${version.receipt.original.id}`);
  });

  it("shows incomplete verification and unavailable readings without a cooked or rating claim", () => {
    const version = savedFixture();
    version.receipt.verification.unevaluatedRestrictions = ["low-histamine"];
    version.receipt.verification.unresolvedIngredients = ["unmapped herb"];
    render(<SavedAdaptationView version={version} publication="unknown" />);
    expect(screen.getByText(/Text screening: partial; some checks remain unavailable/)).toBeVisible();
    expect(screen.getByText(/does not certify food safety or allergen absence/)).toBeVisible();
    expect(screen.getByText(/Evaluated restrictions: vegetarian/)).toBeVisible();
    expect(screen.getByText(/Unevaluated restrictions: low-histamine/)).toBeVisible();
    expect(screen.getByText(/Unresolved ingredients: unmapped herb/)).toBeVisible();
    expect(screen.getByText(/Not checked: nutrition, steps.0.cooking_method, steps.0.time_minutes/)).toBeVisible();
    expect(screen.getByText(/ESMS and planetary scores are unavailable/)).toBeVisible();
    expect(screen.getByText(/feed publication is unknown/)).toBeVisible();
    expect(screen.getByText(/separate from the adaptation receipt/)).toBeVisible();
    expect(screen.queryByText(/★★★★★|made it|cooked it|five.star|certified recipe/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /made|cook|rate/i })).not.toBeInTheDocument();
  });

  it.each([
    ["published", "Adapted action published to the activity feed."],
    ["not-published", "Saved version available; no feed publication was confirmed."],
    ["unknown", "Saved version available; feed publication is unknown."],
  ])("labels %s publication independently of the saved content", (publication, message) => {
    render(<SavedAdaptationView version={savedFixture()} publication={publication} />);
    expect(screen.getByText(message)).toBeVisible();
    expect(screen.getByRole("heading", { name: /vegetarian version/ })).toBeVisible();
  });

  it("does not fabricate a serving count to enable the cart", () => {
    const version = savedFixture();
    delete version.recipe.numberOfServings;
    delete version.recipe.servingSize;
    render(<SavedAdaptationView version={version} publication="not-published" />);
    const button = screen.getByRole("button", { name: /Add saved version ingredients/ });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockAddRecipe).not.toHaveBeenCalled();
    expect(mockOpen).not.toHaveBeenCalled();
    expect(screen.getByText(/serving count is unknown/)).toBeVisible();
    expect(screen.getByText(/Nutrition unavailable/)).toBeVisible();
    expect(screen.queryByText(/Nutrition per serving:/)).not.toBeInTheDocument();
  });

  it("uses an authored servingSize when numberOfServings is absent", () => {
    const version = savedFixture();
    delete version.recipe.numberOfServings;
    version.recipe.servingSize = 3;
    render(<SavedAdaptationView version={version} publication="not-published" />);
    fireEvent.click(screen.getByRole("button", { name: /Add saved version ingredients/ }));
    expect(mockAddRecipe).toHaveBeenCalledWith(expect.objectContaining({ baseServings: 3, ingredients: version.recipe.ingredients }), 3);
  });

  it("derives readings from edited ingredients without rewriting the immutable saved receipt", () => {
    const version = savedFixture();
    const original = JSON.stringify(version);
    render(<SavedAdaptationView version={version} publication="published" />);
    const readings = within(screen.getByRole("region", { name: "Saved version readings" }));
    expect(readings.getByText(/Nutrition per serving: \d+ kcal/)).toBeVisible();
    expect(readings.getByText(/Elements: Fire/)).toBeVisible();
    expect(readings.getByText(/separate from the saved adaptation receipt/)).toBeVisible();
    expect(JSON.stringify(version)).toBe(original);
  });

  it("shows unavailable readings for an unresolved edited ingredient", () => {
    const version = savedFixture();
    version.recipe.ingredients.push({ name: "zzunmappedzz", amount: 500, unit: "g" });
    render(<SavedAdaptationView version={version} publication="published" />);
    expect(screen.getByText(/Nutrition unavailable/)).toBeVisible();
    expect(screen.getByText(/Elemental reading unavailable/)).toBeVisible();
  });
});
