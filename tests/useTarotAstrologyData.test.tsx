import { renderHook, waitFor } from "@testing-library/react";
import {
  adaptLunarPhase,
  useTarotAstrologyData,
} from "@/hooks/useTarotAstrologyData";

let astrologicalState: Record<string, unknown> = {};

jest.mock("@/hooks/useAstrologicalState", () => ({
  useAstrologicalState: () => astrologicalState,
}));

jest.mock("@/lib/tarotCalculations", () => ({
  getTarotCardsForDate: () => ({
    minorCard: {
      name: "Two of Wands",
      suit: "Wands",
      number: 2,
      element: "Fire",
    },
    majorCard: {
      name: "The Sun",
      planet: "Sun",
      element: "Fire",
      keywords: ["clarity"],
    },
  }),
}));

describe("useTarotAstrologyData boundaries", () => {
  beforeEach(() => {
    astrologicalState = {
      currentPlanetaryAlignment: {},
      currentZodiac: "aries",
      activePlanets: [],
      isDaytime: true,
      lunarPhase: "full moon",
      loading: false,
    };
  });

  it("uses the canonical lowercase lunar phases", () => {
    expect(adaptLunarPhase("full moon")).toBe("full moon");
    expect(adaptLunarPhase("Blue Moon")).toBeNull();
  });

  it("keeps valid positions and drops malformed siblings", async () => {
    astrologicalState = {
      ...astrologicalState,
      activePlanets: ["sun"],
      currentPlanetaryAlignment: {
        sun: { sign: "leo", degree: 12, exactLongitude: 132 },
        moon: { sign: 42, degree: "late" },
      },
    };

    const { result } = renderHook(() => useTarotAstrologyData());

    await waitFor(() => expect(result.current.minorCard).not.toBeNull());
    expect(result.current.currentPlanetaryAlignment.sun).toEqual({
      sign: "leo",
      degree: 12,
      exactLongitude: 132,
    });
    expect(result.current.currentPlanetaryAlignment.moon).toBeUndefined();
    expect(result.current.currentLunarPhase).toBe("full moon");
    expect(result.current.tarotElementBoosts.Fire).toBeCloseTo(0.35);
  });
});
