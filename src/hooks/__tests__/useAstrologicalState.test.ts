/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from "@testing-library/react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useAstrologicalState } from "../useAstrologicalState";

jest.mock("@/contexts/AlchemicalContext/hooks", () => ({
  useAlchemical: jest.fn(),
}));

const mockUseAlchemical = useAlchemical as jest.Mock;

describe("useAstrologicalState hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with all-zero domElements when no planetary positions are present", () => {
    mockUseAlchemical.mockReturnValue({
      planetaryPositions: {},
      isDaytime: true,
      planetaryHour: "Sun",
      lunarPhase: "full moon",
    });

    const { result } = renderHook(() => useAstrologicalState());

    expect(result.current.domElements).toEqual({
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    });
    expect(result.current.isReady).toBe(false);
  });

  it("derives normalized domElements from planetary positions when they arrive", async () => {
    mockUseAlchemical.mockReturnValue({
      planetaryPositions: {
        sun: { sign: "leo" }, // Fire
        moon: { sign: "pisces" }, // Water
        mercury: { sign: "gemini" }, // Air
        venus: { sign: "taurus" }, // Earth
      },
      isDaytime: true,
      planetaryHour: "Venus",
      lunarPhase: "waxing crescent",
    });

    const { result } = renderHook(() => useAstrologicalState());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.domElements).toEqual({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    });
    expect(
      result.current.domElements.Fire +
        result.current.domElements.Water +
        result.current.domElements.Earth +
        result.current.domElements.Air,
    ).toBeCloseTo(1.0);
    expect(result.current.currentZodiac).toBe("leo");
  });

  it("correctly weights an asymmetric sky across the classical elements", async () => {
    mockUseAlchemical.mockReturnValue({
      planetaryPositions: {
        sun: { sign: "cancer" }, // Water
        moon: { sign: "scorpio" }, // Water
        mercury: { sign: "pisces" }, // Water
        mars: { sign: "aries" }, // Fire
      },
      isDaytime: false,
      planetaryHour: "Moon",
      lunarPhase: "waning gibbous",
    });

    const { result } = renderHook(() => useAstrologicalState());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    // 3 Water, 1 Fire out of 4 planets = 0.75 Water, 0.25 Fire
    expect(result.current.domElements).toEqual({
      Fire: 0.25,
      Water: 0.75,
      Earth: 0,
      Air: 0,
    });
  });
});
