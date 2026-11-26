/** @jest-environment jsdom */

/**
 * The three homepage section searches against mocked routes: what each asks
 * for, and what the reader sees. Faked: fetch, the user, the recipe builder and
 * the omnibar suggestions.
 */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { fixtureGuide } from "@/lib/cooking/__tests__/helpers/foodGuide";
import { installFetchMock } from "../../../../__tests__/helpers/fetchMock";
import { CuisineRecipeSearch } from "../CuisineRecipeSearch";
import { IngredientRecipeBar } from "../IngredientRecipeBar";
import { MethodGuideSearch } from "../MethodGuideSearch";
import { SEARCH_DEBOUNCE_MS } from "../useSearchResource";

const mockUser: { currentUser: null | { preferences: { dietaryRestrictions: string[] } } } = { currentUser: null };
jest.mock("@/contexts/UserContext", () => ({ useUser: () => mockUser }));
jest.mock("@/contexts/RecipeBuilderContext", () => ({ useRecipeBuilder: () => ({ allergies: ["peanuts"] }) }));
jest.mock("@/contexts/GroceryCartContext", () => ({ useGroceryCart: () => ({ addRecipe: jest.fn() }) }));
jest.mock("@/components/nav/omnibar/useOmniSearch", () => ({ useOmniSearch: () => ({ status: "idle", data: null }) }));

const json = (body: unknown, status = 200): Promise<unknown> =>
  Promise.resolve({ ok: status < 300, status, json: () => Promise.resolve(body), text: () => Promise.resolve(JSON.stringify(body)) });

async function settle(): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS + 50);
    await Promise.resolve();
  });
}

function type(label: string, value: string): void {
  fireEvent.change(screen.getByRole("searchbox", { name: label }), { target: { value } });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockUser.currentUser = null;
});

afterEach(() => jest.useRealTimers());

describe("CuisineRecipeSearch", () => {
  it("shows every version and the cross-cuisine matches with shared ingredients", async () => {
    const fetchMock = installFetchMock(
      jest.fn(() =>
        json({
          success: true,
          query: "moussaka",
          totalGroups: 1,
          groups: [
            {
              key: "moussaka",
              title: "Moussaka",
              matchedBy: "name",
              matchNote: null,
              versions: [
                { id: "a", name: "Moussaka", href: "/recipes/a", cuisine: "Greek", labels: [], totalMinutes: 90, onFile: null },
                {
                  id: null,
                  name: "Authentic Moussaka",
                  href: null,
                  cuisine: "Greek",
                  labels: [],
                  totalMinutes: null,
                  onFile: { meal: "dinner", description: null, ingredients: ["2 eggplants"], steps: ["Step 1: Slice."] },
                },
              ],
              crossCuisine: [{ id: "b", name: "Baingan Bharta", href: "/recipes/b", cuisine: "Indian", score: 0.35, shared: ["eggplant", "tomato", "onion"] }],
            },
          ],
        }),
      ),
    );
    render(<CuisineRecipeSearch />);
    type("Find a recipe by dish or ingredient", "Moussaka");
    await settle();
    expect(fetchMock).toHaveBeenCalledWith("/api/search/recipes?q=moussaka");
    expect(screen.getByRole("link", { name: "Moussaka" })).toHaveAttribute("href", "/recipes/a");
    expect(screen.getByText("2 versions")).toBeInTheDocument();
    expect(screen.getByText("Shares eggplant, tomato, onion")).toBeInTheDocument();
    expect(screen.queryByText("2 eggplants")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show dinner version" }));
    expect(screen.getByText("2 eggplants")).toBeInTheDocument();
    expect(screen.getByText("Slice.")).toBeInTheDocument();
  });

  it("says so when the search is unavailable", async () => {
    installFetchMock(jest.fn(() => json({ success: false }, 429)));
    render(<CuisineRecipeSearch />);
    type("Find a recipe by dish or ingredient", "pho soup");
    await settle();
    expect(screen.getByText(/unavailable right now/)).toBeInTheDocument();
  });
});

describe("MethodGuideSearch", () => {
  it("shows the selected method of a guide and switches to another", async () => {
    const guide = fixtureGuide("bacon", "Bacon", [], ["oven_bake", "pan_fry"]);
    installFetchMock(jest.fn(() => json({ success: true, query: "baking bacon", answer: { kind: "guide", guide, selected: "oven_bake", note: null } })));
    render(<MethodGuideSearch />);
    type("How should I cook it?", "baking bacon");
    await settle();
    const choices = screen.getByRole("group", { name: "Ways to cook bacon" });
    expect(within(choices).getByRole("button", { name: /oven_bake label/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(choices).getByRole("button", { name: /pan_fry label/ }));
    expect(within(choices).getByRole("button", { name: /pan_fry label/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Test: Test page" })).toHaveAttribute("href", "https://example.org/test");
  });
});

describe("IngredientRecipeBar", () => {
  it("states the cost, and sends ingredients, equipment and allergens to the AI generator only on click", async () => {
    const fetchMock = installFetchMock(jest.fn(() => json({ message: "Sign in to generate." }, 401)));
    render(<IngredientRecipeBar />);
    expect(screen.getByText(/Visitors get 2 AI recipes a day/)).toBeInTheDocument();
    const create = screen.getByRole("button", { name: "Create a new recipe with AI" });
    expect(create).toBeDisabled();
    const input = screen.getByRole("textbox", { name: "Ingredients you have" });
    fireEvent.change(input, { target: { value: "eggplant, tahini" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Oven" }));
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(create);
      await Promise.resolve();
      await Promise.resolve();
    });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/generate-cosmic-recipe");
    const body: unknown = JSON.parse(String(Reflect.get(Object(init), "body")));
    expect(body).toMatchObject({
      ingredients_main: ["eggplant", "tahini"],
      equipment: ["Oven"],
      disallowed_ingredients: ["peanuts"],
      diet: "no-restrictions",
    });
    expect(String(Reflect.get(Object(body), "idempotencyKey"))).toMatch(/^home-/);
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("never runs unfiltered matches under a gluten-free choice", () => {
    render(<IngredientRecipeBar />);
    const input = screen.getByRole("textbox", { name: "Ingredients you have" });
    fireEvent.change(input, { target: { value: "flour" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(screen.getByRole("combobox", { name: "Diet" }), { target: { value: "gluten-free" } });
    expect(screen.getByRole("button", { name: "Find recipes" })).toBeDisabled();
    expect(screen.getByText(/can only be filtered for vegan or vegetarian/)).toBeInTheDocument();
  });

  it("uses a new key after a refunded attempt, so a retry can succeed", async () => {
    const fetchMock = installFetchMock(jest.fn(() => json({ message: "Upstream failed.", refunded: true }, 502)));
    render(<IngredientRecipeBar />);
    const input = screen.getByRole("textbox", { name: "Ingredients you have" });
    fireEvent.change(input, { target: { value: "leek" } });
    fireEvent.keyDown(input, { key: "Enter" });
    const create = screen.getByRole("button", { name: "Create a new recipe with AI" });
    for (const round of [1, 2]) {
      fireEvent.click(create);
      await screen.findByText("Upstream failed.");
      await act(async () => {
        await Promise.resolve();
      });
      expect(fetchMock).toHaveBeenCalledTimes(round);
    }
    const keys = fetchMock.mock.calls.map(([, init]) => String(Reflect.get(Object(JSON.parse(String(Reflect.get(Object(init), "body")))), "idempotencyKey")));
    expect(new Set(keys).size).toBe(2);
  });

  it("tells a signed-in cook the ESMS price", () => {
    mockUser.currentUser = { preferences: { dietaryRestrictions: [] } };
    render(<IngredientRecipeBar />);
    expect(screen.getByText(/first AI recipe each day is free/)).toBeInTheDocument();
  });
});
