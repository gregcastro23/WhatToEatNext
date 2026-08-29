import { renderHook, waitFor } from "@testing-library/react";
import { useCurrentChart } from "@/hooks/useCurrentChart";

let planetaryPositions: Record<string, unknown> = {};

jest.mock("@/contexts/AlchemicalContext/hooks", () => ({
  useAlchemical: () => ({ planetaryPositions }),
}));

describe("useCurrentChart planetary boundary", () => {
  beforeEach(() => {
    planetaryPositions = {};
  });

  it("normalizes valid positions without losing zero values", async () => {
    planetaryPositions = {
      sun: {
        sign: "leo",
        degree: 0,
        exactLongitude: 0,
        isRetrograde: false,
      },
      ascendant: { sign: "libra", degree: 12 },
    };

    const { result } = renderHook(() => useCurrentChart());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.chartData.planets.Sun).toEqual({
      sign: "leo",
      degree: 0,
      exactLongitude: 0,
      isRetrograde: false,
    });
    expect(result.current.chartData.ascendant).toBe("libra");
  });

  it("defaults malformed position fields at the runtime boundary", async () => {
    planetaryPositions = {
      moon: {
        sign: 42,
        degree: Number.NaN,
        exactLongitude: "far",
        isRetrograde: "yes",
      },
    };

    const { result } = renderHook(() => useCurrentChart());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.chartData.planets.Moon).toEqual({
      sign: "Aries",
      degree: 0,
      exactLongitude: 0,
      isRetrograde: false,
    });
  });
});
