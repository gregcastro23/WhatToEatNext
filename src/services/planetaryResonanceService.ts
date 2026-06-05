/**
 * Live planetary-resonance feed — derived from the CURRENT sky (no DB, no PA).
 *
 * Each classical planet, at its present degree, resonates with a culinary domain
 * (planetaryCulinary.ts) + a resonant ingredient drawn from that element's top
 * ingredients. Recomputed per call so it always reflects the active moment — a
 * dish the planetary agent resonates with at that active degree.
 *
 * Sourcing + presentation only — reuses the existing ephemeris + ingredient
 * index; no alchemical/ESMS/formula logic is modified.
 */

import { type PlanetaryResonanceFeedItem } from "@/lib/feed/historicalAgentFeed";
import { CLASSICAL_PLANETS, PLANET_CULINARY } from "@/lib/feed/planetaryCulinary";
import { _logger } from "@/lib/logger";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;
}

export function getPlanetaryResonanceFeed(now: Date = new Date()): PlanetaryResonanceFeedItem[] {
  let positions: Record<string, unknown>;
  try {
    positions = getAccuratePlanetaryPositions(now);
  } catch (error) {
    _logger.error("[planetaryResonance] failed to read positions:", error);
    return [];
  }

  const items: PlanetaryResonanceFeedItem[] = [];
  const hourBucket = Math.floor(now.getTime() / 3_600_000);

  CLASSICAL_PLANETS.forEach((planet, index) => {
    const raw = (positions[planet] ?? positions[planet.toLowerCase()]) as
      | { sign?: unknown; degree?: unknown }
      | undefined;
    if (!raw) return;

    const domain = PLANET_CULINARY[planet];
    const sign = typeof raw.sign === "string" ? capitalize(raw.sign) : undefined;
    const degree = typeof raw.degree === "number" ? Math.round(raw.degree) : undefined;

    let ingredient: string | undefined;
    try {
      const tops = findTopIngredientsForElement(domain.element, 12);
      if (tops.length > 0) {
        ingredient = tops[((degree ?? 0) + index) % tops.length]?.name;
      }
    } catch {
      ingredient = undefined;
    }

    const where = sign && degree !== undefined ? ` at ${degree}° ${sign}` : "";
    const action = `${domain.verb} ${domain.dish}${ingredient ? ` with ${ingredient}` : ""}${where}.`;

    items.push({
      id: `resonance-${planet.toLowerCase()}-${hourBucket}`,
      type: "planetary_resonance",
      planet,
      ...(sign ? { sign } : {}),
      ...(degree !== undefined ? { degree } : {}),
      element: domain.element,
      domain: domain.domain,
      ...(ingredient ? { ingredient } : {}),
      action,
      icon: domain.glyph,
      agentName: `${planet} Agent`,
      // Slight per-planet stagger so the live cluster sorts stably at the top.
      createdAt: new Date(now.getTime() - index * 90_000).toISOString(),
    });
  });

  return items;
}
