/**
 * @jest-environment node
 *
 * Verifies the historical echo finder:
 * - Solar Return (Sun echo): returns exact 1-year ago placement (<0.05 arcmin delta),
 *   snapshot containing all 10 planets, and top solar cuisine matches with reasoning.
 * - Outer planet echo (e.g. Pluto): traverses coarse + refine pipeline.
 * - calculateSolarCuisineMatches: outputs well-structured, scored recommendations.
 */
import { describe, expect, it } from "@jest/globals";
import {
  ECHO_PLANETS,
  calculateSolarCuisineMatches,
  findHistoricalEcho,
  findOuterPlanetEcho,
  getEchoFileMeta,
} from "@/utils/historicalEchoFinder";
import { calculatePlanetaryPositions } from "@/utils/serverPlanetaryCalculations";
import { alchemizeDetailed } from "@/services/RealAlchemizeService";

describe("historicalEchoFinder", () => {
  it("includes Sun in ECHO_PLANETS list", () => {
    expect(ECHO_PLANETS).toContain("Sun");
    expect(ECHO_PLANETS).toContain("Pluto");
  });

  it("calculates accurate solar return ~1 year ago for reference date", async () => {
    const refDate = new Date("2026-10-27T15:00:00.000Z");
    const result = await findOuterPlanetEcho("Sun", refDate);

    expect(result.planet).toBe("Sun");
    // Should be approximately 1 year ago
    expect(result.echo.yearsAgo).toBeGreaterThan(0.99);
    expect(result.echo.yearsAgo).toBeLessThan(1.01);

    // Delta between Sun longitude at echo and reference should be sub-arcminute
    expect(result.echo.deltaArcminutes).toBeLessThan(0.05);

    // Reference and echo signs should match
    expect(result.echo.sign).toBe(result.reference.sign);
    expect(result.echo.degree).toBe(result.reference.degree);

    // Snapshot should contain 10 planets
    expect(result.echo.snapshot.length).toBe(10);
    expect(result.reference.snapshot.length).toBe(10);

    // Cuisine matches should be populated for Solar Return
    expect(result.cuisineMatches).toBeDefined();
    expect(result.cuisineMatches?.length).toBe(4);

    const firstCuisine = result.cuisineMatches?.[0];
    expect(firstCuisine).toBeDefined();
    expect(firstCuisine?.name).toBeTruthy();
    expect(firstCuisine?.matchPercentage).toBeGreaterThanOrEqual(70);
    expect(firstCuisine?.matchPercentage).toBeLessThanOrEqual(100);
    expect(firstCuisine?.reasons.length).toBeGreaterThan(0);
    expect(firstCuisine?.signatureIngredients.length).toBeGreaterThan(0);
  }, 15000);

  it("exports findHistoricalEcho as an alias to findOuterPlanetEcho", () => {
    expect(findHistoricalEcho).toBe(findOuterPlanetEcho);
  });

  it("calculates solar cuisine matches with elemental and astrological resonance", async () => {
    const testDate = new Date("2025-10-27T14:09:09.777Z");
    const positionsRaw = await calculatePlanetaryPositions(testDate);
    const alch = alchemizeDetailed(positionsRaw, null, testDate);

    const matches = calculateSolarCuisineMatches(alch, positionsRaw, positionsRaw.Sun.sign);

    expect(matches.length).toBe(4);
    for (const match of matches) {
      expect(match.id).toBeTruthy();
      expect(match.name).toBeTruthy();
      expect(match.description).toBeTruthy();
      expect(match.matchPercentage).toBeGreaterThanOrEqual(70);
      expect(match.matchPercentage).toBeLessThanOrEqual(98);
      expect(match.elementalAlignment).toBeDefined();
      expect(match.signatureIngredients.length).toBeGreaterThan(0);
      expect(match.signatureTechniques.length).toBeGreaterThan(0);
      expect(match.reasons.length).toBeGreaterThan(0);
    }
  });

  it("converges accurately across the 0° Aries vernal equinox branch cut", async () => {
    // March 20, 2026 ~18:46 UTC is near 0°00' Aries (360°/0° boundary)
    const equinoxDate = new Date("2026-03-20T18:46:00.000Z");
    const result = await findOuterPlanetEcho("Sun", equinoxDate);

    expect(result.planet).toBe("Sun");
    expect(result.echo.yearsAgo).toBeGreaterThan(0.99);
    expect(result.echo.yearsAgo).toBeLessThan(1.01);
    expect(result.echo.deltaArcminutes).toBeLessThan(0.05);

    // Coordinate continuity: sign and degree match across equinox boundary
    expect(result.echo.sign).toBe(result.reference.sign);
    expect(result.echo.degree).toBe(result.reference.degree);
  }, 15000);

  it("differentiates return chart cuisine matches from today's baseline based on shifted rulers and elements", async () => {
    const pastDate = new Date("2025-10-27T10:09:06.852Z");
    const nowDate = new Date("2026-10-27T16:00:00.000Z");

    const pPast = await calculatePlanetaryPositions(pastDate);
    const pNow = await calculatePlanetaryPositions(nowDate);

    const aPast = alchemizeDetailed(pPast, null, pastDate);
    const aNow = alchemizeDetailed(pNow, null, nowDate);

    const returnMatches = calculateSolarCuisineMatches(
      aPast,
      pPast,
      pPast.Sun.sign,
      pNow,
      aNow,
    );

    expect(returnMatches.length).toBe(4);
    // At least one cuisine should highlight the elemental contrast or return ruler
    const hasContrastReason = returnMatches.some((m) =>
      m.reasons.some((r) => r.includes("return chart") || r.includes("return Moon") || r.includes("return Mars") || r.includes("Mirrors return")),
    );
    expect(hasContrastReason).toBe(true);
  });

  it("returns metadata including Sun in getEchoFileMeta", () => {
    const meta = getEchoFileMeta();
    expect(meta.planets).toContain("Sun");
  });
});
