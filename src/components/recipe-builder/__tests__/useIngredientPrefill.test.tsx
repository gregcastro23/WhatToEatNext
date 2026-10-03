/**
 * @jest-environment jsdom
 *
 * "Cook with this" → /recipe-builder?ingredients=… (omnibar Phase 4). The
 * names queue with the builder's own facts, the parameter is removed, and the
 * saved queue loading afterwards does not wipe them: the provider's load runs
 * after its children's effects, so the prefill waits for `isReady`.
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import type { JSX } from "react";
import { RecipeBuilderProvider, useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { MAX_PREFILL, prefillIngredients, useIngredientPrefill } from "../useIngredientPrefill";

// The app router's search params, read from the (jsdom) address bar on every
// render, as Next does after a push or a history.replaceState.
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

const LISTED = [
  { name: "spinach", category: "vegetable", elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 } },
  { name: "Feta", category: "dairy" },
];

describe("prefillIngredients", () => {
  it("matches the builder's list case-insensitively and carries its category and elements", () => {
    expect(prefillIngredients(["Spinach", "feta"], LISTED)).toEqual([
      { name: "spinach", category: "vegetable", elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 } },
      { name: "Feta", category: "dairy" },
    ]);
  });

  it("queues a name the list lacks by name alone, once, and ignores blanks", () => {
    expect(prefillIngredients(["chicken egg", " Chicken Egg ", ""], LISTED)).toEqual([{ name: "chicken egg" }]);
  });

  it(`queues at most ${MAX_PREFILL}`, () => {
    const names = Array.from({ length: 20 }, (_, i) => `thing ${i}`);
    expect(prefillIngredients(names, [])).toHaveLength(MAX_PREFILL);
  });
});

function Queue(): JSX.Element {
  useIngredientPrefill();
  const { selectedIngredients, isReady } = useRecipeBuilder();
  return <p data-testid="queue">{isReady ? selectedIngredients.map((i) => i.name).join(", ") : "loading"}</p>;
}

describe("useIngredientPrefill", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/recipe-builder");
  });

  it("adds the linked card to the saved queue and removes the parameter", async () => {
    window.localStorage.setItem("alchm-recipe-builder", JSON.stringify({ selectedIngredients: [{ name: "garlic" }] }));
    window.history.replaceState(null, "", "/recipe-builder?ingredients=spinach&meal=dinner");
    render(
      <RecipeBuilderProvider>
        <Queue />
      </RecipeBuilderProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("queue")).toHaveTextContent("garlic, spinach"));
    expect(window.location.search).toBe("?meal=dinner");
  }, 60_000);

  it("queues a link followed while the builder is already open (soft navigation)", async () => {
    const view = render(
      <RecipeBuilderProvider>
        <Queue />
      </RecipeBuilderProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("queue")).not.toHaveTextContent("loading"));

    // The header's "Cook with this" on /recipe-builder: same route, new query,
    // nothing remounts.
    act(() => window.history.pushState(null, "", "/recipe-builder?ingredients=feta"));
    view.rerender(
      <RecipeBuilderProvider>
        <Queue />
      </RecipeBuilderProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("queue")).toHaveTextContent(/^feta$/i));
    expect(window.location.search).toBe("");
  }, 60_000);

  it("does nothing without the parameter", async () => {
    render(
      <RecipeBuilderProvider>
        <Queue />
      </RecipeBuilderProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("queue")).not.toHaveTextContent("loading"));
    expect(screen.getByTestId("queue")).toHaveTextContent(/^$/);
  }, 60_000);
});
