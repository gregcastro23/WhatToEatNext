import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  RecipeQueueProvider,
  useRecipeQueue,
} from "@/contexts/RecipeQueueContext";
import type { Recipe } from "@/types";

const recipe: Recipe = {
  id: "recipe-1",
  name: "Boundary Soup",
  ingredients: [{ name: "water", amount: 1, unit: "cup" }],
  instructions: ["Simmer"],
  elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecipeQueueProvider>{children}</RecipeQueueProvider>
);

describe("RecipeQueueContext persistence boundary", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("restores valid queue entries and skips malformed siblings", async () => {
    localStorage.setItem(
      "alchm-recipe-queue",
      JSON.stringify([
        {
          id: "queue-1",
          recipe,
          addedAt: "2026-08-29T00:00:00.000Z",
          notes: "keep",
        },
        { id: "queue-bad", recipe: { name: "Incomplete" } },
      ]),
    );

    const { result } = renderHook(() => useRecipeQueue(), { wrapper });

    await waitFor(() => expect(result.current.queueSize).toBe(1));
    expect(result.current.queue[0].recipe.id).toBe("recipe-1");
    expect(result.current.queue[0].addedAt).toBeInstanceOf(Date);
  });

  it("validates imports without discarding valid siblings", async () => {
    const { result } = renderHook(() => useRecipeQueue(), { wrapper });

    await act(async () => {
      expect(
        result.current.importQueue(
          JSON.stringify([
            { id: "queue-1", recipe, addedAt: "not-a-date" },
            { id: 42, recipe },
          ]),
        ),
      ).toBe(true);
    });

    expect(result.current.queueSize).toBe(1);
    expect(Number.isFinite(result.current.queue[0].addedAt.getTime())).toBe(
      true,
    );
  });

  it("rejects a non-array import", () => {
    const { result } = renderHook(() => useRecipeQueue(), { wrapper });

    expect(result.current.importQueue(JSON.stringify({ recipe }))).toBe(false);
    expect(result.current.queueSize).toBe(0);
  });
});
