/**
 * Deterministic spot-check for the untethered culinary faucet.
 * Run: bun scripts/simulate-culinary-faucet.ts
 */

import {
  FALLBACK_NETWORK_SUPPLY,
  calculateChartBaseline,
  computeDiscriminantDailyYield,
} from "@/lib/economy/discriminant-faucet";
import { calculatePositionsWithAstronomyEngine } from "@/utils/serverPlanetaryCalculations";
import type { AlchemicalPlanetPositions } from "@/utils/planetaryAlchemyMapping";

const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

function chart(longitudes: readonly number[]): AlchemicalPlanetPositions {
  return Object.fromEntries(
    PLANETS.map((planet, index) => {
      const longitude = ((longitudes[index % longitudes.length] ?? 0) + 360) % 360;
      return [planet, {
        sign: SIGNS[Math.floor(longitude / 30)] ?? "Aries",
        degree: longitude % 30,
        exactLongitude: longitude,
      }];
    }),
  );
}

const archetypes = [
  { name: "Hearth / Fire", positions: chart([0, 18, 121, 139, 242, 9, 126, 253, 335, 274]), weights: { spirit: 0.46, essence: 0.18, matter: 0.16, substance: 0.2 } },
  { name: "Brine / Water", positions: chart([95, 112, 344, 219, 226, 331, 102, 337, 350, 211]), weights: { spirit: 0.14, essence: 0.47, matter: 0.23, substance: 0.16 } },
  { name: "Larder / Earth", positions: chart([34, 171, 283, 48, 292, 166, 276, 52, 347, 179]), weights: { spirit: 0.12, essence: 0.2, matter: 0.5, substance: 0.18 } },
  { name: "Aroma / Air", positions: chart([72, 193, 81, 204, 314, 186, 309, 67, 342, 198]), weights: { spirit: 0.2, essence: 0.17, matter: 0.13, substance: 0.5 } },
  { name: "Table / Balanced", positions: chart([14, 43, 81, 117, 154, 188, 221, 259, 302, 347]), weights: { spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25 } },
] as const;

const moments = [
  ["Vernal equinox", "2026-03-20T14:00:00Z"],
  ["Summer solstice", "2026-06-21T08:00:00Z"],
  ["Autumn equinox", "2026-09-22T18:00:00Z"],
  ["Samhain", "2026-10-31T12:00:00Z"],
  ["Winter solstice", "2026-12-21T21:00:00Z"],
] as const;

const rows: Array<Record<string, string | number>> = [];
for (const archetype of archetypes) {
  const chartBaseline = calculateChartBaseline(archetype.positions);
  for (const [moment, iso] of moments) {
    const { positions, usedFallback } = calculatePositionsWithAstronomyEngine(
      new Date(iso),
      { log: false },
    );
    if (usedFallback) throw new Error(`Ephemeris degraded at ${iso}`);
    const result = computeDiscriminantDailyYield({
      natalWeights: archetype.weights,
      natalPositions: archetype.positions,
      transitPositions: positions,
      chartBaseline,
      supply: FALLBACK_NETWORK_SUPPLY,
    });
    rows.push({
      archetype: archetype.name,
      moment,
      score: result.resonance.score.toFixed(3),
      z: result.resonance.ratio.toFixed(3),
      total: result.total.toFixed(4),
      spirit: result.spirit.toFixed(4),
      essence: result.essence.toFixed(4),
      matter: result.matter.toFixed(4),
      substance: result.substance.toFixed(4),
    });
  }
}

console.table(rows);
