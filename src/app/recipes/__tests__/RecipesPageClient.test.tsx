/** @jest-environment jsdom */

/**
 * The recipes page shows every recipe the API serves, says so when it cannot,
 * and lets the visitor narrow what it holds by cuisine and by search.
 *
 * [MEASURED 2026-10-31] The page asked for `limit=1000` and ignored `total`,
 * so a 1,113-recipe catalog showed "1000 recipes" with 113 missing and no
 * hint; and any failed request rendered the same "No Recipes Found" screen as
 * an empty catalog.
 */

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { Recipe } from "@/types/recipe";
import { installFetchMock } from "../../../__tests__/helpers/fetchMock";
import RecipesPage from "../RecipesPageClient";

let mockQuery = "";
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockQuery),
  useRouter: () => ({ replace: mockReplace }),
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

function recipe(n: number, extra: Partial<Recipe> = {}): Recipe {
  return {
    id: `recipe-${n}`,
    name: `Recipe ${n}`,
    ingredients: [],
    instructions: [],
    elementalProperties: ELEMENTS,
    ...extra,
  };
}

function dish(id: string, name: string, cuisine: string | undefined, ingredients: string[]): Recipe {
  return recipe(0, {
    id,
    name,
    ...(cuisine ? { cuisine } : {}),
    ingredients: ingredients.map((ingredient) => ({ name: ingredient, amount: 1, unit: "piece" })),
  });
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

function names(): string[] {
  return screen.getAllByTestId("recipe").map((el) => el.textContent ?? "");
}

/** A small catalog with two cuisines, one recipe with no cuisine, and an accent. */
const CATALOG: Recipe[] = [
  dish("it-1", "Spaghetti Pomodoro", "Italian", ["spaghetti", "tomato", "basil"]),
  dish("it-2", "Risotto Milanese", "Italian", ["arborio rice", "saffron", "butter"]),
  dish("it-3", "Tomato Bruschetta", "Italian", ["bread", "tomato", "garlic"]),
  dish("me-1", "Shakshuka", "Middle Eastern", ["eggs", "tomato", "cumin"]),
  dish("me-2", "Hummus", "Middle Eastern", ["chickpeas", "tahini", "lemon"]),
  dish("mx-1", "Salsa Verde", "Mexican", ["tomatillo", "jalapeño", "cilantro"]),
  dish("none-1", "House Broth", undefined, ["water", "salt"]),
];

function serveCatalog(): jest.Mock {
  return serve({ success: true, recipes: CATALOG, total: CATALOG.length });
}

async function loaded(): Promise<void> {
  await waitFor(() => expect(screen.getAllByTestId("recipe").length).toBeGreaterThan(0));
}

function pill(name: RegExp): HTMLElement {
  return within(screen.getByRole("group", { name: "Filter by cuisine" })).getByRole("button", { name });
}

function search(text: string): void {
  fireEvent.change(screen.getByRole("searchbox", { name: "Search recipes" }), { target: { value: text } });
}

beforeEach(() => {
  mockQuery = "";
  mockReplace.mockReset();
});

describe("the recipes page", () => {
  it("asks for the whole catalog once: no limit and no cuisine, whatever the URL selects", async () => {
    mockQuery = "cuisine=middle-eastern";
    const spy = serveCatalog();
    render(<RecipesPage />);
    await loaded();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("/api/recipes");
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
    serveCatalog();
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

  it("keeps saying so while the visitor narrows the list", async () => {
    const broken = { id: "broken", name: "Broken", ingredients: "none" };
    serve({ success: true, recipes: [...CATALOG, broken], total: CATALOG.length + 1 });
    render(<RecipesPage />);
    await loaded();
    search("hummus");
    await waitFor(() => expect(names()).toEqual(["Hummus"]));
    expect(screen.getByRole("status")).toHaveTextContent("1 of 8 recipes couldn't be displayed");
  });

  it("reports a failed request as a failure with a way to retry, not as an empty catalog", async () => {
    const spy = serve({ success: false }, 500);
    render(<RecipesPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Recipes Unavailable");
    expect(screen.queryByText("No Recipes Found")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

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

  it("says plainly that an empty catalog is empty", async () => {
    serve({ success: true, recipes: [], total: 0 });
    render(<RecipesPage />);
    expect(await screen.findByText("No Recipes Found")).toBeInTheDocument();
    expect(screen.getByText(/couldn't find any recipes/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("offers a way out of a genuinely empty cuisine", async () => {
    mockQuery = "cuisine=atlantean";
    serveCatalog();
    render(<RecipesPage />);
    expect(await screen.findByText("No Recipes Found")).toBeInTheDocument();
    expect(screen.getByText(/no Atlantean recipes/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View All Recipes" })).toHaveAttribute("href", "/recipes");
    expect(screen.getByRole("link", { name: "Explore Cuisines" })).toHaveAttribute("href", "/cuisines");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("the recipes page's cuisine pills", () => {
  it("list every cuisine in the catalog with its recipe count, biggest first, after All", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    const labels = within(screen.getByRole("group", { name: "Filter by cuisine" }))
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(labels).toEqual(["All 7", "Italian 3", "Middle Eastern 2", "Mexican 1"]);
  });

  it("show everything, with All pressed, when no cuisine is selected", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    expect(names()).toHaveLength(7);
    expect(pill(/^All/)).toHaveAttribute("aria-pressed", "true");
    expect(pill(/^Italian/)).toHaveAttribute("aria-pressed", "false");
  });

  it("narrow the list to the cuisine in the URL, and press its pill", async () => {
    mockQuery = "cuisine=middle-eastern";
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    expect(names().sort()).toEqual(["Hummus", "Shakshuka"]);
    expect(pill(/^Middle Eastern/)).toHaveAttribute("aria-pressed", "true");
    expect(pill(/^All/)).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/2 of 7 recipes/)).toBeInTheDocument();
  });

  it("put the cuisine in the URL when clicked, without scrolling or fetching again", async () => {
    const spy = serveCatalog();
    const { rerender } = render(<RecipesPage />);
    await loaded();

    fireEvent.click(pill(/^Italian/));
    expect(mockReplace).toHaveBeenCalledWith("/recipes?cuisine=italian", { scroll: false });

    // The router changes the URL; the page narrows from it.
    mockQuery = "cuisine=italian";
    rerender(<RecipesPage />);
    await waitFor(() => expect(names()).toHaveLength(3));
    expect(names().every((n) => ["Spaghetti Pomodoro", "Risotto Milanese", "Tomato Bruschetta"].includes(n))).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("use the slug the cuisine cards link with", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    fireEvent.click(pill(/^Middle Eastern/));
    expect(mockReplace).toHaveBeenCalledWith("/recipes?cuisine=middle-eastern", { scroll: false });
  });

  it("go back to everything through All", async () => {
    mockQuery = "cuisine=italian";
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    fireEvent.click(pill(/^All/));
    expect(mockReplace).toHaveBeenCalledWith("/recipes", { scroll: false });
  });

  it("leave the recipes with no cuisine reachable through All", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    expect(names()).toContain("House Broth");
  });
});

describe("the recipes page's search", () => {
  it("narrows the list as the visitor types, and counts what it found", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("tomato");
    await waitFor(() => expect(names()).toHaveLength(3));
    expect(names().sort()).toEqual(["Shakshuka", "Spaghetti Pomodoro", "Tomato Bruschetta"]);
    expect(screen.getByText(/3 of 7 recipes/)).toBeInTheDocument();
  });

  it("looks in ingredients and cuisines as well as names", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("saffron");
    await waitFor(() => expect(names()).toEqual(["Risotto Milanese"]));
    search("mexican");
    await waitFor(() => expect(names()).toEqual(["Salsa Verde"]));
  });

  it("wants every word, in any order", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("tomato basil");
    await waitFor(() => expect(names()).toEqual(["Spaghetti Pomodoro"]));
    search("basil tomato");
    await waitFor(() => expect(names()).toEqual(["Spaghetti Pomodoro"]));
  });

  it("ignores case and accents", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("JALAPENO");
    await waitFor(() => expect(names()).toEqual(["Salsa Verde"]));
    search("jalapeño");
    await waitFor(() => expect(names()).toEqual(["Salsa Verde"]));
  });

  it("shows everything again when cleared, or on Escape", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("hummus");
    await waitFor(() => expect(names()).toEqual(["Hummus"]));
    search("");
    await waitFor(() => expect(names()).toHaveLength(7));

    search("hummus");
    await waitFor(() => expect(names()).toEqual(["Hummus"]));
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    await waitFor(() => expect(names()).toHaveLength(7));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("combines with the cuisine", async () => {
    mockQuery = "cuisine=italian";
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("tomato");
    await waitFor(() => expect(names().sort()).toEqual(["Spaghetti Pomodoro", "Tomato Bruschetta"]));
    expect(screen.getByText(/2 of 7 recipes/)).toBeInTheDocument();
  });

  it("recounts the pills, and disables a cuisine the search leaves empty", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("tomato");
    await waitFor(() => expect(names()).toHaveLength(3));
    expect(pill(/^All/)).toHaveTextContent("All 3");
    expect(pill(/^Italian/)).toHaveTextContent("Italian 2");
    expect(pill(/^Middle Eastern/)).toHaveTextContent("Middle Eastern 1");
    expect(pill(/^Mexican/)).toBeDisabled();
    expect(pill(/^Italian/)).toBeEnabled();
  });

  it("keeps the selected cuisine's pill usable even when the search empties it", async () => {
    mockQuery = "cuisine=mexican";
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("tomato");
    expect(await screen.findByText("No Recipes Found")).toBeInTheDocument();
    expect(pill(/^Mexican/)).toBeEnabled();
    expect(pill(/^Mexican/)).toHaveAttribute("aria-pressed", "true");
  });

  it("says nothing matched and offers to clear the search", async () => {
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("zzzz");
    expect(await screen.findByText("No Recipes Found")).toBeInTheDocument();
    expect(screen.getByText("No recipes match “zzzz”.")).toBeInTheDocument();
    expect(screen.queryByTestId("recipe")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear Search" }));
    await waitFor(() => expect(names()).toHaveLength(7));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("names the cuisine when nothing in it matches", async () => {
    mockQuery = "cuisine=italian";
    serveCatalog();
    render(<RecipesPage />);
    await loaded();
    search("zzzz");
    expect(await screen.findByText("No Italian recipes match “zzzz”.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View All Recipes" })).toHaveAttribute("href", "/recipes");
  });

  it("does not fetch again, and does not drop a recipe: a long list stays whole", async () => {
    const all = Array.from({ length: 1113 }, (_, i) => recipe(i, { cuisine: i % 2 ? "Italian" : "Thai" }));
    const spy = serve({ success: true, recipes: all, total: all.length });
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getAllByTestId("recipe")).toHaveLength(1113));
    await act(async () => {
      search("recipe");
    });
    await waitFor(() => expect(screen.getAllByTestId("recipe")).toHaveLength(1113));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
