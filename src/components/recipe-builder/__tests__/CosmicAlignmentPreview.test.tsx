/**
 * @jest-environment jsdom
 *
 * Cosmic Alignment Preview: the dominant element read from live positions,
 * the planetary day and hour, one-tap "add to crucible" for the element's
 * harmonic ingredients, and an honest pending state before the sky is read
 * (it used to claim "Fire Dominant" and then jump).
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";
import type { AstrologyHookData } from "@/hooks/useAstrologicalState";
import CosmicAlignmentPreview, { resolveDominantElement } from "../CosmicAlignmentPreview";

const ZERO_WEIGHTS = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

const COLD_SKY: AstrologyHookData = {
  currentZodiac: "aries",
  currentPlanetaryAlignment: {},
  lunarPhase: "full moon",
  activePlanets: [],
  domElements: ZERO_WEIGHTS,
  loading: true,
  isReady: false,
  isDaytime: true,
  renderCount: 1,
  currentPlanetaryHour: null,
};

const WATER_SKY: AstrologyHookData = {
  ...COLD_SKY,
  currentPlanetaryAlignment: {
    sun: { sign: "cancer" },
    moon: { sign: "pisces" },
    mercury: { sign: "scorpio" },
    venus: { sign: "leo" },
  },
  loading: false,
  isReady: true,
  currentPlanetaryHour: "Venus",
};

let mockSky: AstrologyHookData = COLD_SKY;

jest.mock("@/hooks/useAstrologicalState", () => ({
  useAstrologicalState: (): AstrologyHookData => mockSky,
}));

jest.mock("@/utils/ingredient/ingredientIndex", () => ({
  findTopIngredientsForElement: (element: string) => [
    { name: `${element} kelp`, category: "vegetable", elementalProperties: { Fire: 0, Water: 0.8, Earth: 0.1, Air: 0.1 } },
    { name: `${element} cucumber`, category: "vegetable", elementalProperties: { Fire: 0, Water: 0.7, Earth: 0.2, Air: 0.1 } },
  ],
}));

function renderPreview(): void {
  render(
    <RecipeBuilderProvider>
      <CosmicAlignmentPreview />
    </RecipeBuilderProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  // Friday 9 October 2026: Venus rules the day.
  jest.useFakeTimers({ now: new Date(2026, 9, 9, 12, 0, 0) });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("resolveDominantElement", () => {
  it("counts live positions by sign element", () => {
    expect(resolveDominantElement(WATER_SKY.currentPlanetaryAlignment, ZERO_WEIGHTS)).toBe("Water");
  });

  it("falls back to the element weights, then to null when nothing has been read", () => {
    expect(resolveDominantElement({}, { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 })).toBe("Earth");
    expect(resolveDominantElement({}, ZERO_WEIGHTS)).toBeNull();
  });
});

describe("CosmicAlignmentPreview", () => {
  it("shows the dominant element with the live planetary day and hour", () => {
    mockSky = WATER_SKY;
    renderPreview();

    const preview = screen.getByRole("region", { name: "Cosmic alignment preview" });
    expect(preview).toHaveAttribute("aria-busy", "false");
    expect(screen.getByText("Water Dominant")).toBeInTheDocument();
    expect(screen.getByText("Water Resonance")).toBeInTheDocument();
    expect(screen.getByText("· Venus Day")).toBeInTheDocument();
    expect(screen.getByText("· Venus Hour")).toBeInTheDocument();
    expect(screen.getByText("Harmonic Water Ingredients")).toBeInTheDocument();
  });

  it("adds a harmonic ingredient to the crucible and marks it queued", () => {
    mockSky = WATER_SKY;
    renderPreview();

    fireEvent.click(screen.getByRole("button", { name: "Add Water kelp to crucible" }));

    const queued = screen.getByRole("button", { name: "Water kelp (queued in crucible)" });
    expect(queued).toBeDisabled();
    expect(queued).toHaveTextContent("queued");
    // The other suggestion is still addable.
    expect(screen.getByRole("button", { name: "Add Water cucumber to crucible" })).toBeEnabled();
    const saved: unknown = JSON.parse(window.localStorage.getItem("alchm-recipe-builder") ?? "{}");
    expect(saved).toMatchObject({
      selectedIngredients: [
        { name: "Water kelp", category: "vegetable", elementalProperties: { Fire: 0, Water: 0.8, Earth: 0.1, Air: 0.1 } },
      ],
    });
  });

  it("says it is reading the sky, and names no element, before positions arrive", () => {
    mockSky = COLD_SKY;
    renderPreview();

    expect(screen.getByRole("region", { name: "Cosmic alignment preview" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Reading the sky…")).toBeInTheDocument();
    expect(screen.getByText("· Venus Day")).toBeInTheDocument();
    expect(screen.queryByText(/Dominant/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Harmonic .* Ingredients/)).not.toBeInTheDocument();
  });
});
