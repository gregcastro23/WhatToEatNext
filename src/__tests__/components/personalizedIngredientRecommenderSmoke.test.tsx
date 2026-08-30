import { render } from "@testing-library/react";
import React from "react";
import { EnhancedIngredientRecommender } from "@/components/recommendations/EnhancedIngredientRecommender";
import { AlchemicalContext, defaultState } from "@/contexts/AlchemicalContext/context";
import { useUserElementalBias } from "@/hooks/useUserElementalBias";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));
jest.mock("@/hooks/useUserElementalBias");
jest.mock("@/hooks/usePantry", () => ({
  usePantry: () => ({
    isInPantry: () => false,
    hasItem: () => false,
    addToPantry: jest.fn(),
    removeFromPantry: jest.fn(),
    toggleItem: jest.fn(),
    items: [],
  }),
}));

const mockUseUserElementalBias = useUserElementalBias as jest.MockedFunction<
  typeof useUserElementalBias
>;

describe("EnhancedIngredientRecommender smoke & personalization test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders safely for an anonymous visitor (null elemental bias)", () => {
    mockUseUserElementalBias.mockReturnValue({
      bias: null,
      source: "unpersonalized",
    });

    const { container } = render(
      <AlchemicalContext.Provider
        value={{
          state: defaultState,
          dispatch: () => {},
          astrologicalState: defaultState.astrologicalState,
          elementalState: defaultState.elementalState,
          alchemicalValues: defaultState.alchemicalValues,
          planetaryHour: "Sun",
          lunarPhase: "new moon",
          zodiacSign: "aries",
          planetaryPositions: {},
          historicalPositions: {},
          normalizedPositions: {},
          isLoading: false,
          error: null,
          isDaytime: true,
          getDominantElement: () => "Fire",
          getCurrentElementalBalance: () => ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
          getAlchemicalHarmony: () => 0.5,
          updateAstrologicalState: () => {},
          calculateSeasonalInfluence: () => 0.5,
          getThermodynamicState: () => ({ temperature: 20, pressure: 1, entropy: 0.5, enthalpy: 0.5 }),
          updatePlanetaryPositions: () => {},
          refreshPlanetaryPositions: async () => ({}),
          setDaytime: () => {},
          updateState: () => {},
        }}
      >
        <EnhancedIngredientRecommender />
      </AlchemicalContext.Provider>,
    );

    expect(container).toBeDefined();
  });

  it("renders safely for a personalized visitor (natal chart / guest table userBias)", () => {
    mockUseUserElementalBias.mockReturnValue({
      bias: {
        Fire: 0.4,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.2,
      },
      source: "natal_chart",
    });

    const { container } = render(
      <AlchemicalContext.Provider
        value={{
          state: defaultState,
          dispatch: () => {},
          astrologicalState: defaultState.astrologicalState,
          elementalState: defaultState.elementalState,
          alchemicalValues: defaultState.alchemicalValues,
          planetaryHour: "Sun",
          lunarPhase: "new moon",
          zodiacSign: "aries",
          planetaryPositions: {},
          historicalPositions: {},
          normalizedPositions: {},
          isLoading: false,
          error: null,
          isDaytime: true,
          getDominantElement: () => "Fire",
          getCurrentElementalBalance: () => ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
          getAlchemicalHarmony: () => 0.5,
          updateAstrologicalState: () => {},
          calculateSeasonalInfluence: () => 0.5,
          getThermodynamicState: () => ({ temperature: 20, pressure: 1, entropy: 0.5, enthalpy: 0.5 }),
          updatePlanetaryPositions: () => {},
          refreshPlanetaryPositions: async () => ({}),
          setDaytime: () => {},
          updateState: () => {},
        }}
      >
        <EnhancedIngredientRecommender />
      </AlchemicalContext.Provider>,
    );

    expect(container).toBeDefined();
  });
});
