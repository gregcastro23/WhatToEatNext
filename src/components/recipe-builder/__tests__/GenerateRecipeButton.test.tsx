/**
 * @jest-environment jsdom
 *
 * The synthesis CTA: inert until something is selected, the token cost on
 * show, the cycling synthesis copy announced through a polite live region,
 * and one generation's request and outcome.
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";
import type { AstrologyHookData } from "@/hooks/useAstrologicalState";
import GenerateRecipeButton, { SYNTHESIS_STEP_MS, SYNTHESIS_STEPS } from "../GenerateRecipeButton";

const mockSkyState: AstrologyHookData = {
  currentZodiac: "libra",
  currentPlanetaryAlignment: {},
  lunarPhase: "full moon",
  activePlanets: ["Venus"],
  domElements: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  loading: false,
  isReady: true,
  isDaytime: true,
  renderCount: 1,
  currentPlanetaryHour: "Venus",
};

jest.mock("@/hooks/useAstrologicalState", () => ({
  useAstrologicalState: (): AstrologyHookData => mockSkyState,
}));
jest.mock("@/contexts/UserContext", () => ({
  useUser: () => ({ currentUser: null }),
}));

const MEAL = {
  mealType: "dinner",
  recipe: { id: "r1", name: "Garlic Soup", ingredients: [], instructions: [] },
  score: 0.8,
  reasons: [],
  dayAlignment: 0.7,
  planetaryAlignment: 0.6,
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const originalFetch = global.fetch;
let fetchMock: jest.Mock;

interface Handlers {
  onGenerated: jest.Mock;
  onGeneratingChange: jest.Mock;
  onError: jest.Mock;
}

function renderButton(saved: Record<string, unknown> | null, isGenerating = false): Handlers {
  if (saved) window.localStorage.setItem("alchm-recipe-builder", JSON.stringify(saved));
  const handlers = { onGenerated: jest.fn(), onGeneratingChange: jest.fn(), onError: jest.fn() };
  render(
    <RecipeBuilderProvider>
      <GenerateRecipeButton {...handlers} isGenerating={isGenerating} />
    </RecipeBuilderProvider>,
  );
  return handlers;
}

beforeEach(() => {
  window.localStorage.clear();
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
});

describe("GenerateRecipeButton", () => {
  it("is disabled, and says why, until a preference is selected", () => {
    renderButton(null);

    expect(screen.getByRole("button", { name: /Generate Recipes/ })).toBeDisabled();
    expect(screen.getByText("Select ingredients or preferences to begin")).toBeInTheDocument();
  });

  it("shows the token cost of a generation", () => {
    renderButton({ mealType: "Dinner" });

    expect(screen.getByRole("button", { name: /Generate Recipes/ })).toBeEnabled();
    expect(screen.getByText("Cost: 5 Spirit · 5 Essence")).toBeInTheDocument();
    expect(screen.queryByText("Select ingredients or preferences to begin")).not.toBeInTheDocument();
  });

  it("cycles the synthesis copy through a polite live region while generating", () => {
    jest.useFakeTimers();
    renderButton({ mealType: "Dinner" }, true);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(SYNTHESIS_STEPS[0] ?? "");
    expect(screen.getByRole("button", { name: SYNTHESIS_STEPS[0] ?? "" })).toHaveAttribute("aria-busy", "true");

    act(() => jest.advanceTimersByTime(SYNTHESIS_STEP_MS));
    expect(status).toHaveTextContent(SYNTHESIS_STEPS[1] ?? "");

    act(() => jest.advanceTimersByTime(SYNTHESIS_STEP_MS * (SYNTHESIS_STEPS.length - 1)));
    expect(status).toHaveTextContent(SYNTHESIS_STEPS[0] ?? "");
  });

  it("is silent in the live region when idle", () => {
    renderButton({ mealType: "Dinner" });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("sends the crucible's selections and hands back the recommendations", async () => {
    fetchMock.mockResolvedValueOnce(json({ success: true, recommendations: [MEAL] }));
    const handlers = renderButton({ mealType: "Dinner", selectedIngredients: [{ name: "garlic" }], allergies: ["Peanuts"] });

    fireEvent.click(screen.getByRole("button", { name: /Generate Recipes/ }));

    await waitFor(() => expect(handlers.onGenerated).toHaveBeenCalledWith([MEAL]));
    expect(handlers.onGeneratingChange.mock.calls).toEqual([[true], [false]]);
    expect(handlers.onError).not.toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body))).toMatchObject({
      astroState: { currentZodiac: "libra", currentPlanetaryHour: "Venus" },
      options: {
        mealTypes: ["dinner"],
        requiredIngredients: ["garlic"],
        excludeIngredients: ["Peanuts"],
        dietaryRestrictions: ["Peanuts"],
        maxRecipesPerMeal: 8,
      },
    });
  });

  it("reports insufficient tokens and opens the token shop", async () => {
    fetchMock.mockResolvedValueOnce(json({ success: false, reason: "insufficient_tokens" }, 402));
    const opened = jest.fn();
    window.addEventListener("open-token-shop", opened);
    const handlers = renderButton({ mealType: "Dinner" });

    fireEvent.click(screen.getByRole("button", { name: /Generate Recipes/ }));

    await waitFor(() =>
      expect(handlers.onError).toHaveBeenCalledWith("Insufficient tokens. Each generation costs 5 Spirit + 5 Essence."),
    );
    expect(handlers.onGenerated).toHaveBeenCalledWith([]);
    expect(opened).toHaveBeenCalledTimes(1);
    expect(handlers.onGeneratingChange).toHaveBeenLastCalledWith(false);
    window.removeEventListener("open-token-shop", opened);
  });
});
