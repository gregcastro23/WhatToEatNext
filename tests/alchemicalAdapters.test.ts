import {
  toEngineElementalAffinity,
  toStandardElementalAffinity,
} from "@/utils/alchemicalAdapters";

describe("alchemical affinity adapters", () => {
  it("uses a complete canonical fallback for an absent engine payload", () => {
    expect(toStandardElementalAffinity(null)).toEqual({
      primary: "Fire",
      secondary: undefined,
      strength: 1,
      compatibility: { Fire: 0.7, Water: 0.7, Earth: 0.7, Air: 0.7 },
      engine: { source: "default", metadata: {} },
    });
  });

  it("validates and preserves engine affinity fields", () => {
    expect(
      toStandardElementalAffinity({
        element: "Water",
        secondary: "Air",
        strength: 0.8,
        compatibility: { Fire: 0.7, Water: 1, Earth: 0.8, Air: 0.9 },
      }),
    ).toEqual({
      primary: "Water",
      secondary: "Air",
      strength: 0.8,
      compatibility: { Fire: 0.7, Water: 1, Earth: 0.8, Air: 0.9 },
      engine: { source: "default", metadata: {} },
    });
  });

  it("rejects malformed nested values without corrupting the affinity", () => {
    expect(
      toStandardElementalAffinity({
        element: "Steam",
        strength: Number.NaN,
        compatibility: { Fire: "high", Water: 0.9 },
      }),
    ).toEqual({
      primary: "Fire",
      secondary: undefined,
      strength: 1,
      compatibility: { Fire: 0.7, Water: 0.9, Earth: 0.7, Air: 0.7 },
      engine: { source: "default", metadata: {} },
    });
  });

  it("maps the canonical primary element back to the engine field", () => {
    expect(
      toEngineElementalAffinity({
        primary: "Earth",
        strength: 0.6,
        compatibility: { Fire: 0.7, Water: 0.8, Earth: 1, Air: 0.7 },
      }),
    ).toEqual({
      element: "Earth",
      strength: 0.6,
      source: "default",
      secondary: undefined,
      compatibility: { Fire: 0.7, Water: 0.8, Earth: 1, Air: 0.7 },
    });
  });

  it("round-trips the engine source and passthrough metadata", () => {
    const engineAffinity = {
      element: "Air",
      strength: 0.9,
      source: "ephemeris",
      compatibility: { Fire: 0.8, Water: 0.7, Earth: 0.7, Air: 1 },
      calibrationVersion: "v2",
    };

    expect(
      toEngineElementalAffinity(toStandardElementalAffinity(engineAffinity)),
    ).toEqual(engineAffinity);
  });
});
