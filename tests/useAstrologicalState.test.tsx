import { renderHook, waitFor } from "@testing-library/react";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";

let alchemicalState: Record<string, unknown> = {};

jest.mock("@/contexts/AlchemicalContext/hooks", () => ({
  useAlchemical: () => alchemicalState,
}));

describe("useAstrologicalState position boundary", () => {
  beforeEach(() => {
    alchemicalState = {
      planetaryPositions: {},
      isDaytime: true,
      planetaryHour: "Sun",
      lunarPhase: "waxing crescent",
    };
  });

  it("normalizes positions and derives the active ruling planet", async () => {
    alchemicalState = {
      ...alchemicalState,
      planetaryPositions: {
        sun: { sign: "Leo", degree: 20, exactLongitude: 140 },
        moon: { sign: "Cancer", degree: 0 },
      },
    };

    const { result } = renderHook(() => useAstrologicalState());

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.currentZodiac).toBe("leo");
    expect(result.current.activePlanets).toEqual(
      expect.arrayContaining(["sun", "moon"]),
    );
    expect(result.current.currentPlanetaryAlignment).toEqual(
      expect.objectContaining({
        sun: expect.objectContaining({ sign: "Leo", degree: 20 }),
      }),
    );
  });

  it("drops malformed siblings and rejects an invalid lunar phase", async () => {
    alchemicalState = {
      ...alchemicalState,
      lunarPhase: "blue moon",
      planetaryPositions: {
        sun: { sign: "Aries", degree: 5 },
        moon: "not-a-position",
      },
    };

    const { result } = renderHook(() => useAstrologicalState());

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.currentPlanetaryAlignment).not.toHaveProperty("moon");
    expect(result.current.lunarPhase).toBe("waxing crescent");
  });
});
