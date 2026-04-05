/**
 * Tests for planetaryAlchemyMapping.ts — the authoritative ESMS calculation module.
 *
 * This is the single most critical module in the recommendation engine:
 * it derives Spirit, Essence, Matter, Substance from planetary positions.
 */
import {
  PLANETARY_ALCHEMY,
  ZODIAC_ELEMENTS,
  ZODIAC_QUALITIES,
  PLANETARY_SECTARIAN_ELEMENTS,
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  getDominantAlchemicalProperty,
  getDominantElement,
  isSectDiurnal,
  getPlanetarySectElement,
  getZodiacQuality,
  getCurrentPlanetaryContribution,
  validatePlanetaryPositions,
} from "@/utils/planetaryAlchemyMapping";

// ---------------------------------------------------------------------------
// Constants validation
// ---------------------------------------------------------------------------

describe("PLANETARY_ALCHEMY constant", () => {
  it("contains all 10 planets", () => {
    const expected = [
      "Sun", "Moon", "Mercury", "Venus", "Mars",
      "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    ];
    for (const planet of expected) {
      expect(PLANETARY_ALCHEMY).toHaveProperty(planet);
    }
  });

  it("matches the authoritative values from CLAUDE.md spec", () => {
    expect(PLANETARY_ALCHEMY.Sun).toEqual({ Spirit: 1, Essence: 0, Matter: 0, Substance: 0 });
    expect(PLANETARY_ALCHEMY.Moon).toEqual({ Spirit: 0, Essence: 1, Matter: 1, Substance: 0 });
    expect(PLANETARY_ALCHEMY.Mercury).toEqual({ Spirit: 1, Essence: 0, Matter: 0, Substance: 1 });
    expect(PLANETARY_ALCHEMY.Venus).toEqual({ Spirit: 0, Essence: 1, Matter: 1, Substance: 0 });
    expect(PLANETARY_ALCHEMY.Mars).toEqual({ Spirit: 0, Essence: 1, Matter: 1, Substance: 0 });
    expect(PLANETARY_ALCHEMY.Jupiter).toEqual({ Spirit: 1, Essence: 1, Matter: 0, Substance: 0 });
    expect(PLANETARY_ALCHEMY.Saturn).toEqual({ Spirit: 1, Essence: 0, Matter: 1, Substance: 0 });
    expect(PLANETARY_ALCHEMY.Uranus).toEqual({ Spirit: 0, Essence: 1, Matter: 1, Substance: 0 });
    expect(PLANETARY_ALCHEMY.Neptune).toEqual({ Spirit: 0, Essence: 1, Matter: 0, Substance: 1 });
    expect(PLANETARY_ALCHEMY.Pluto).toEqual({ Spirit: 0, Essence: 1, Matter: 1, Substance: 0 });
  });
});

describe("ZODIAC_ELEMENTS constant", () => {
  it("maps all 12 zodiac signs to correct elements", () => {
    expect(ZODIAC_ELEMENTS.Aries).toBe("Fire");
    expect(ZODIAC_ELEMENTS.Taurus).toBe("Earth");
    expect(ZODIAC_ELEMENTS.Gemini).toBe("Air");
    expect(ZODIAC_ELEMENTS.Cancer).toBe("Water");
    expect(ZODIAC_ELEMENTS.Leo).toBe("Fire");
    expect(ZODIAC_ELEMENTS.Virgo).toBe("Earth");
    expect(ZODIAC_ELEMENTS.Libra).toBe("Air");
    expect(ZODIAC_ELEMENTS.Scorpio).toBe("Water");
    expect(ZODIAC_ELEMENTS.Sagittarius).toBe("Fire");
    expect(ZODIAC_ELEMENTS.Capricorn).toBe("Earth");
    expect(ZODIAC_ELEMENTS.Aquarius).toBe("Air");
    expect(ZODIAC_ELEMENTS.Pisces).toBe("Water");
  });

  it("has exactly 3 Fire, 3 Water, 3 Earth, 3 Air signs", () => {
    const counts = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    for (const element of Object.values(ZODIAC_ELEMENTS)) {
      counts[element]++;
    }
    expect(counts).toEqual({ Fire: 3, Water: 3, Earth: 3, Air: 3 });
  });
});

// ---------------------------------------------------------------------------
// calculateAlchemicalFromPlanets
// ---------------------------------------------------------------------------

describe("calculateAlchemicalFromPlanets", () => {
  it("returns non-negative ESMS values for valid positions", () => {
    const positions = {
      Sun: "Gemini",
      Moon: "Leo",
      Mercury: "Taurus",
    };
    const result = calculateAlchemicalFromPlanets(positions);
    expect(result.Spirit).toBeGreaterThanOrEqual(0);
    expect(result.Essence).toBeGreaterThanOrEqual(0);
    expect(result.Matter).toBeGreaterThanOrEqual(0);
    expect(result.Substance).toBeGreaterThanOrEqual(0);
  });

  it("returns zeroes for an empty positions object", () => {
    const result = calculateAlchemicalFromPlanets({});
    expect(result).toEqual({ Spirit: 0, Essence: 0, Matter: 0, Substance: 0 });
  });

  it("skips unknown planet names without crashing", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = calculateAlchemicalFromPlanets({ Vulcan: "Aries" });
    expect(result).toEqual({ Spirit: 0, Essence: 0, Matter: 0, Substance: 0 });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Vulcan"));
    warnSpy.mockRestore();
  });

  it("produces higher Spirit from Sun-heavy charts", () => {
    // Sun contributes Spirit=1; Moon contributes Essence+Matter
    const sunOnly = calculateAlchemicalFromPlanets({ Sun: "Aries" });
    const moonOnly = calculateAlchemicalFromPlanets({ Moon: "Cancer" });
    expect(sunOnly.Spirit).toBeGreaterThan(moonOnly.Spirit);
  });

  it("accumulates contributions from multiple planets", () => {
    const onePlanet = calculateAlchemicalFromPlanets({ Sun: "Leo" });
    const twoPlanets = calculateAlchemicalFromPlanets({ Sun: "Leo", Jupiter: "Sagittarius" });
    // Jupiter diurnal adds Spirit, so Spirit should be higher
    expect(twoPlanets.Spirit).toBeGreaterThan(onePlanet.Spirit);
    
    // Test nocturnal where Jupiter adds Essence
    const onePlanetNight = calculateAlchemicalFromPlanets({ Sun: "Leo" }, false);
    const twoPlanetsNight = calculateAlchemicalFromPlanets({ Sun: "Leo", Jupiter: "Sagittarius" }, false);
    expect(twoPlanetsNight.Essence).toBeGreaterThan(onePlanetNight.Essence);
  });
});

// ---------------------------------------------------------------------------
// aggregateZodiacElementals
// ---------------------------------------------------------------------------

describe("aggregateZodiacElementals", () => {
  it("returns normalized values that sum to 1.0", () => {
    const positions = {
      Sun: "Gemini",
      Moon: "Leo",
      Mercury: "Taurus",
      Venus: "Gemini",
      Mars: "Aries",
    };
    const result = aggregateZodiacElementals(positions);
    const sum = result.Fire + result.Water + result.Earth + result.Air;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("returns balanced 0.25 each for empty positions", () => {
    const result = aggregateZodiacElementals({});
    expect(result).toEqual({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
  });

  it("all-Fire positions give Fire > 0.5", () => {
    // Aries, Leo, Sagittarius are all Fire signs
    const result = aggregateZodiacElementals({
      Sun: "Aries",
      Moon: "Leo",
      Mercury: "Sagittarius",
    });
    expect(result.Fire).toBeGreaterThan(0.5);
    expect(result.Water).toBe(0);
    expect(result.Earth).toBe(0);
    expect(result.Air).toBe(0);
  });

  it("warns and skips unknown zodiac signs", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = aggregateZodiacElementals({ Sun: "InvalidSign" });
    expect(warnSpy).toHaveBeenCalled();
    // Falls back to balanced
    expect(result).toEqual({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getDominantAlchemicalProperty / getDominantElement
// ---------------------------------------------------------------------------

describe("getDominantAlchemicalProperty", () => {
  it("returns the property with the highest value", () => {
    expect(getDominantAlchemicalProperty({ Spirit: 5, Essence: 3, Matter: 2, Substance: 1 })).toBe("Spirit");
    expect(getDominantAlchemicalProperty({ Spirit: 1, Essence: 8, Matter: 2, Substance: 1 })).toBe("Essence");
    expect(getDominantAlchemicalProperty({ Spirit: 0, Essence: 0, Matter: 10, Substance: 0 })).toBe("Matter");
    expect(getDominantAlchemicalProperty({ Spirit: 0, Essence: 0, Matter: 0, Substance: 5 })).toBe("Substance");
  });
});

describe("getDominantElement", () => {
  it("returns the element with the highest value", () => {
    expect(getDominantElement({ Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 })).toBe("Fire");
    expect(getDominantElement({ Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 })).toBe("Water");
  });
});

// ---------------------------------------------------------------------------
// isSectDiurnal
// ---------------------------------------------------------------------------

describe("isSectDiurnal", () => {
  it("returns true for daytime hours (06-17 UTC)", () => {
    const noon = new Date("2026-03-28T12:00:00Z");
    expect(isSectDiurnal(noon)).toBe(true);

    const morning = new Date("2026-03-28T06:00:00Z");
    expect(isSectDiurnal(morning)).toBe(true);
  });

  it("returns false for nighttime hours (18-05 UTC)", () => {
    const evening = new Date("2026-03-28T18:00:00Z");
    expect(isSectDiurnal(evening)).toBe(false);

    const midnight = new Date("2026-03-28T00:00:00Z");
    expect(isSectDiurnal(midnight)).toBe(false);

    const lateNight = new Date("2026-03-28T05:00:00Z");
    expect(isSectDiurnal(lateNight)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPlanetarySectElement
// ---------------------------------------------------------------------------

describe("getPlanetarySectElement", () => {
  it("returns correct diurnal elements", () => {
    expect(getPlanetarySectElement("Sun", true)).toBe("Fire");
    expect(getPlanetarySectElement("Moon", true)).toBe("Water");
    expect(getPlanetarySectElement("Mercury", true)).toBe("Air");
    expect(getPlanetarySectElement("Saturn", true)).toBe("Air");
    expect(getPlanetarySectElement("Jupiter", true)).toBe("Air");
  });

  it("returns correct nocturnal elements", () => {
    expect(getPlanetarySectElement("Mercury", false)).toBe("Earth");
    expect(getPlanetarySectElement("Venus", false)).toBe("Earth");
    expect(getPlanetarySectElement("Mars", false)).toBe("Water");
    expect(getPlanetarySectElement("Saturn", false)).toBe("Earth");
    expect(getPlanetarySectElement("Jupiter", false)).toBe("Fire");
  });

  it("returns Air fallback for unknown planet", () => {
    expect(getPlanetarySectElement("Vulcan", true)).toBe("Air");
  });
});

// ---------------------------------------------------------------------------
// getZodiacQuality
// ---------------------------------------------------------------------------

describe("getZodiacQuality", () => {
  it("returns Cardinal for Cardinal signs", () => {
    expect(getZodiacQuality("Aries")).toBe("Cardinal");
    expect(getZodiacQuality("Cancer")).toBe("Cardinal");
    expect(getZodiacQuality("Libra")).toBe("Cardinal");
    expect(getZodiacQuality("Capricorn")).toBe("Cardinal");
  });

  it("returns Fixed for Fixed signs", () => {
    expect(getZodiacQuality("Taurus")).toBe("Fixed");
    expect(getZodiacQuality("Leo")).toBe("Fixed");
    expect(getZodiacQuality("Scorpio")).toBe("Fixed");
    expect(getZodiacQuality("Aquarius")).toBe("Fixed");
  });

  it("returns Mutable for Mutable signs", () => {
    expect(getZodiacQuality("Gemini")).toBe("Mutable");
    expect(getZodiacQuality("Virgo")).toBe("Mutable");
    expect(getZodiacQuality("Sagittarius")).toBe("Mutable");
    expect(getZodiacQuality("Pisces")).toBe("Mutable");
  });

  it("normalizes casing correctly", () => {
    expect(getZodiacQuality("aries")).toBe("Cardinal");
    // "TAURUS" → charAt(0).toUpperCase() + slice(1).toLowerCase() = "Taurus" → Fixed
    expect(getZodiacQuality("TAURUS")).toBe("Fixed");
  });

  it("returns Mutable for completely unknown sign", () => {
    expect(getZodiacQuality("Xyzzy")).toBe("Mutable");
  });
});

// ---------------------------------------------------------------------------
// getCurrentPlanetaryContribution
// ---------------------------------------------------------------------------

describe("getCurrentPlanetaryContribution", () => {
  it("returns ESMS values for known planet", () => {
    const result = getCurrentPlanetaryContribution("Sun", true, "Leo");
    expect(result.esms).toEqual({ Spirit: 1, Essence: 0, Matter: 0, Substance: 0 });
    expect(result.sectElement).toBe("Fire");
    expect(result.signElement).toBe("Fire"); // Leo is Fire
  });

  it("returns null signElement when no sign provided", () => {
    const result = getCurrentPlanetaryContribution("Moon", false);
    expect(result.signElement).toBeNull();
  });

  it("returns zeroed ESMS for unknown planet", () => {
    const result = getCurrentPlanetaryContribution("Vulcan", true);
    expect(result.esms).toEqual({ Spirit: 0, Essence: 0, Matter: 0, Substance: 0 });
  });
});

// ---------------------------------------------------------------------------
// validatePlanetaryPositions
// ---------------------------------------------------------------------------

describe("validatePlanetaryPositions", () => {
  it("returns true for valid positions", () => {
    expect(validatePlanetaryPositions({ Sun: "Aries", Moon: "Cancer" })).toBe(true);
  });

  it("returns false for null/undefined/non-object", () => {
    expect(validatePlanetaryPositions(null)).toBe(false);
    expect(validatePlanetaryPositions(undefined)).toBe(false);
    expect(validatePlanetaryPositions("string")).toBe(false);
  });

  it("returns false when values are not strings", () => {
    expect(validatePlanetaryPositions({ Sun: 42 })).toBe(false);
  });

  it("returns true for empty object", () => {
    expect(validatePlanetaryPositions({})).toBe(true);
  });
});
