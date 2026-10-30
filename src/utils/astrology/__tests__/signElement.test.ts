import {
  deriveDomElementsFromPositions,
  getDominantElementFromPositions,
  SIGN_TO_ELEMENT,
} from "../signElement";

describe("SIGN_TO_ELEMENT", () => {
  it("contains all 12 canonical zodiac signs", () => {
    const signs = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ];
    for (const sign of signs) {
      expect(SIGN_TO_ELEMENT[sign]).toBeDefined();
    }
  });
});

describe("deriveDomElementsFromPositions", () => {
  it("returns all zeros when positions map is empty", () => {
    expect(deriveDomElementsFromPositions({})).toEqual({
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    });
  });

  it("returns all zeros when positions contain only null or undefined entries", () => {
    const positions = {
      sun: null,
      moon: undefined,
    };
    expect(deriveDomElementsFromPositions(positions)).toEqual({
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    });
  });

  it("returns all zeros when no signs match known zodiac signs", () => {
    const positions = {
      sun: { sign: "unknown" },
      moon: "invalid",
    };
    expect(deriveDomElementsFromPositions(positions)).toEqual({
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    });
  });

  it("normalizes element counts into fractions summing to 1.0 for object positions", () => {
    const positions = {
      sun: { sign: "aries" }, // Fire
      moon: { sign: "cancer" }, // Water
      mars: { sign: "leo" }, // Fire
      venus: { sign: "libra" }, // Air
    };
    const result = deriveDomElementsFromPositions(positions);
    expect(result).toEqual({
      Fire: 0.5,
      Water: 0.25,
      Earth: 0,
      Air: 0.25,
    });
    expect(result.Fire + result.Water + result.Earth + result.Air).toBeCloseTo(1.0);
  });

  it("normalizes element counts into fractions summing to 1.0 for flat string positions", () => {
    const positions = {
      sun: "taurus", // Earth
      moon: "virgo", // Earth
      mercury: "capricorn", // Earth
      venus: "gemini", // Air
    };
    const result = deriveDomElementsFromPositions(positions);
    expect(result).toEqual({
      Fire: 0,
      Water: 0,
      Earth: 0.75,
      Air: 0.25,
    });
    expect(result.Fire + result.Water + result.Earth + result.Air).toBeCloseTo(1.0);
  });

  it("handles mixed case and surrounding whitespace in sign names", () => {
    const positions = {
      sun: { sign: "  Leo  " }, // Fire
      moon: "Scorpio", // Water
    };
    const result = deriveDomElementsFromPositions(positions);
    expect(result).toEqual({
      Fire: 0.5,
      Water: 0.5,
      Earth: 0,
      Air: 0,
    });
  });

  it("tallies all 10 classical planets into an accurate normalized distribution", () => {
    const positions = {
      sun: { sign: "leo" }, // Fire
      moon: { sign: "pisces" }, // Water
      mercury: { sign: "gemini" }, // Air
      venus: { sign: "taurus" }, // Earth
      mars: { sign: "aries" }, // Fire
      jupiter: { sign: "cancer" }, // Water
      saturn: { sign: "capricorn" }, // Earth
      uranus: { sign: "aquarius" }, // Air
      neptune: { sign: "scorpio" }, // Water
      pluto: { sign: "sagittarius" }, // Fire
    };
    const result = deriveDomElementsFromPositions(positions);
    // Fire: 3, Water: 3, Earth: 2, Air: 2 (total 10)
    expect(result.Fire).toBeCloseTo(0.3);
    expect(result.Water).toBeCloseTo(0.3);
    expect(result.Earth).toBeCloseTo(0.2);
    expect(result.Air).toBeCloseTo(0.2);
    expect(result.Fire + result.Water + result.Earth + result.Air).toBeCloseTo(1.0);
  });
});

describe("getDominantElementFromPositions", () => {
  it("returns dominant element with most planets", () => {
    const positions = {
      sun: { sign: "cancer" },
      moon: { sign: "pisces" },
      mars: { sign: "scorpio" },
      venus: { sign: "leo" },
    };
    expect(getDominantElementFromPositions(positions)).toBe("Water");
  });

  it("breaks ties in favor of natural element order (Fire > Water > Earth > Air)", () => {
    const tied = {
      sun: { sign: "aries" }, // Fire
      moon: { sign: "cancer" }, // Water
      venus: { sign: "taurus" }, // Earth
      mars: { sign: "gemini" }, // Air
    };
    expect(getDominantElementFromPositions(tied)).toBe("Fire");
  });

  it("defaults to Fire when no positions are provided", () => {
    expect(getDominantElementFromPositions({})).toBe("Fire");
  });
});
