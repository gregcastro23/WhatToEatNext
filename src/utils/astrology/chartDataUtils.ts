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
    return natalChart.planetaryPositions as Record<string, ZodiacSignType>;
  }
  
  const positions: Record<string, ZodiacSignType> = {};
  
  // 2. Try legacy array format (planets array)
  if (Array.isArray(natalChart.planets) && natalChart.planets.length > 0) {
    natalChart.planets.forEach(p => {
      if (p.name && p.sign) {
        positions[p.name] = p.sign as ZodiacSignType;
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
      positions[planet] = p.sign as ZodiacSignType;
    }
  });
  
  return positions;
}
