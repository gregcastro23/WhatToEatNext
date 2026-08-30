import {
  calculateEnhancedPlanetPosition,
  calculateProfessionalHouses,
  dateToJulianDay,
  longitudeToSignDegree,
  type EnhancedBirthInfo,
} from "@/lib/enhanced-astronomical-calculator";

const BIRTH_INFO: EnhancedBirthInfo = {
  year: 1991,
  month: 6,
  day: 23,
  hour: 10,
  minute: 24,
  latitude: 40.6782,
  longitude: -73.9442,
};

describe("enhanced astronomical calculator boundaries", () => {
  it("calculates a supported orbital planet from typed coefficients", () => {
    const position = calculateEnhancedPlanetPosition(
      "Mercury",
      dateToJulianDay(new Date("2026-08-28T12:00:00.000Z")),
    );

    expect(position.planet).toBe("Mercury");
    expect(Number.isFinite(position.longitude)).toBe(true);
    expect(Number.isFinite(position.distance)).toBe(true);
  });

  it("rejects a planet without orbital coefficients", () => {
    expect(() => calculateEnhancedPlanetPosition("Vulcan", 2451545)).toThrow(
      "No orbital elements found for planet: Vulcan",
    );
  });

  it("derives display labels from the canonical zodiac ordering", () => {
    expect(longitudeToSignDegree(0)).toEqual({ sign: "Aries", degree: 0 });
    expect(longitudeToSignDegree(359)).toEqual({ sign: "Pisces", degree: 29 });
  });

  it("returns a typed midheaven for professional house calculations", () => {
    const result = calculateProfessionalHouses(BIRTH_INFO, "equal");

    expect(result.houses).toHaveLength(12);
    expect(Number.isFinite(result.midheaven.longitude)).toBe(true);
    expect(result.midheaven.sign).toBeTruthy();
  });
});
