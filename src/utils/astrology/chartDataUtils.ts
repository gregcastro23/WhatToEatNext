import type { NatalChart, ZodiacSignType } from "@/types/natalChart";

/**
 * Safely extract planetary positions from a natal chart,
 * supporting modern (object), legacy (array), and root-level formats.
 * 
 * This is a pure utility function safe for both client and server use.
 */
export function extractPlanetaryPositions(natalChart: NatalChart): Record<string, ZodiacSignType> {
  if (!natalChart) return {};
  
  // 1. Try modern format (planetaryPositions object)
  if (natalChart.planetaryPositions && Object.keys(natalChart.planetaryPositions).length > 0) {
    return natalChart.planetaryPositions;
  }
  
  const positions: Record<string, ZodiacSignType> = {};
  
  // 2. Try legacy array format (planets array)
  if (Array.isArray(natalChart.planets) && natalChart.planets.length > 0) {
    natalChart.planets.forEach(p => {
      if (p.name && p.sign) {
        positions[p.name] = p.sign;
      }
    });
    if (Object.keys(positions).length > 0) return positions;
  }
  
  // 3. Try root-level format (e.g., natalChart.Sun)
  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  planets.forEach((planet) => {
    const p = (natalChart as any)[planet] || (natalChart as any)[planet.toLowerCase()];
    if (typeof p === "string") {
      positions[planet] = p as ZodiacSignType;
    } else if (p?.sign) {
      positions[planet] = p.sign;
    }
  });

  return positions;
}

/**
 * Same as `extractPlanetaryPositions` but returns sign names capitalised to
 * the shape that `calculateAlchemicalFromPlanets` / `DailyYieldService` /
 * `getPersonalizedPricingContext` expect (e.g. `"Aries"`, not `"aries"`).
 *
 * Returns `null` when no usable planet → sign pairs can be extracted — call
 * sites should treat that as "not onboarded, skip personalization".
 */
export function getCapitalizedNatalPositions(
  natalChart: NatalChart | null | undefined,
): Record<string, string> | null {
  if (!natalChart) return null;
  const signs = extractPlanetaryPositions(natalChart);
  const positions: Record<string, string> = {};
  for (const [planet, sign] of Object.entries(signs)) {
    if (typeof sign === "string" && sign.length > 0) {
      positions[planet] = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
    }
  }
  return Object.keys(positions).length > 0 ? positions : null;
}
