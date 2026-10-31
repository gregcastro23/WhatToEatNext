/** @jest-environment jsdom */

/**
 * The recipes page shows every recipe the API serves, and says so when it
 * cannot.
 *
 * [MEASURED 2026-10-31] The page asked for `limit=1000` and ignored `total`,
 * so a 1,113-recipe catalog showed "1000 recipes" with 113 missing and no
 * hint; and any failed request rendered the same "No Recipes Found" screen as
 * an empty catalog.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Recipe } from "@/types/recipe";
import { installFetchMock } from "../../../__tests__/helpers/fetchMock";
import RecipesPage from "../RecipesPageClient";

let mockQuery = "";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockQuery),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/components/recipes/RecipeCard", () => ({
  RecipeCard: ({ recipe }: { recipe: { id: string; name: string } }) => (
    <article data-testid="recipe">{recipe.name}</article>
  ),
}));
jest.mock("@/services/planetaryScoring", () => ({
  PlanetaryScoringService: {
    getInstance: () => ({
      getCurrentPlanetaryPositions: async () => ({}),
      scoreRecipe: async (recipe: { name: string }) => ({
        overallScore: recipe.name.length,
        planetaryReason: "",
        recommendedTiming: "",
        rulingPlanet: "Sun",
      }),
    }),
  },
}));

const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

function recipe(n: number): Recipe {
  return {
    id: `recipe-${n}`,
    name: `Recipe ${n}`,
    ingredients: [],
    instructions: [],
    elementalProperties: ELEMENTS,
  };
}

function serve(body: unknown, status = 200): jest.Mock {
  return installFetchMock(
    jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  mockQuery = "";
});

describe("the recipes page", () => {
  it("asks for the whole catalog: no limit, and only the cuisine it was given", async () => {
    mockQuery = "cuisine=middle-eastern";
    const spy = serve({ success: true, recipes: [recipe(1)], total: 1 });
    render(<RecipesPage />);
    await screen.findByTestId("recipe");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("/api/recipes?cuisine=middle-eastern");
    expect(String(spy.mock.calls[0]?.[0])).not.toMatch(/limit/);
  });

  it("asks for /api/recipes bare when no cuisine is selected", async () => {
    const spy = serve({ success: true, recipes: [recipe(1)], total: 1 });
    render(<RecipesPage />);
    await screen.findByTestId("recipe");
    expect(spy).toHaveBeenCalledWith("/api/recipes");
  });

  it("shows every recipe it is sent, beyond the old 1,000", async () => {
    const all = Array.from({ length: 1113 }, (_, i) => recipe(i));
    serve({ success: true, recipes: all, total: all.length });
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getAllByTestId("recipe")).toHaveLength(1113));
    expect(screen.getByText(/1113 recipes/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("titles the page with the cuisine's name, not its slug", async () => {
    mockQuery = "cuisine=middle-eastern";
    serve({ success: true, recipes: [recipe(1)], total: 1 });
    render(<RecipesPage />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Middle Eastern Recipes");
  });

  it("says how many served recipes it could not display, instead of hiding them", async () => {
    const broken = { id: "broken", name: "Broken", ingredients: "none" };
    serve({ success: true, recipes: [recipe(1), recipe(2), broken], total: 3 });
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getAllByTestId("recipe")).toHaveLength(2));
    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 recipes couldn't be displayed");
  });

  it("reports a failed request as a failure with a way to retry, not as an empty catalog", async () => {
    const spy = serve({ success: false }, 500);
    render(<RecipesPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Recipes Unavailable");
    expect(screen.queryByText("No Recipes Found")).not.toBeInTheDocument();

    spy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, recipes: [recipe(1), recipe(2)], total: 2 }),
    });
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(screen.getAllByTestId("recipe")).toHaveLength(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports an unreadable response as a failure too", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.reject(new Error("bad json")) }),
    );
    render(<RecipesPage />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("offers a way out of a genuinely empty cuisine", async () => {
    mockQuery = "cuisine=atlantean";
    serve({ success: true, recipes: [], total: 0 });
    render(<RecipesPage />);
    expect(await screen.findByText("No Recipes Found")).toBeInTheDocument();
    expect(screen.getByText(/no Atlantean recipes/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View All Recipes" })).toHaveAttribute("href", "/recipes");
    expect(screen.getByRole("link", { name: "Explore Cuisines" })).toHaveAttribute("href", "/cuisines");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
