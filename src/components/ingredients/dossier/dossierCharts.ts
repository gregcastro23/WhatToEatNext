/**
 * Pure chart inputs for the ingredient dossier: the 12-month yield curve, the
 * 7-axis sensory radar, and the sky-match score. Moved unchanged from the
 * (alchm) dossier page, typed against the DossierCard view.
 */
import type { ElementalValues, SensoryAxis } from "@/components/ui/alchm";
import type { ElementalShares } from "@/lib/ingredients/dossierView";

const EVERY_MONTH = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Northern-hemisphere months per season, 0 = January. */
const SEASON_MONTHS: Readonly<Record<string, readonly number[]>> = {
  spring: [2, 3, 4],
  summer: [5, 6, 7],
  autumn: [8, 9, 10],
  fall: [8, 9, 10],
  winter: [11, 0, 1],
  all: EVERY_MONTH,
  "all-year": EVERY_MONTH,
  year: EVERY_MONTH,
};

/** A neighbour of an in-season month draws at this height: the curve's soft tail. */
const SHOULDER = 0.45;

export function buildYieldCurve(seasons: readonly string[]): number[] {
  const inSeason = new Set(seasons.flatMap((season) => SEASON_MONTHS[season.toLowerCase()] ?? []));
  return EVERY_MONTH.map((month) => {
    if (inSeason.has(month)) return 1;
    const neighbours = [(month + 11) % 12, (month + 1) % 12];
    return neighbours.some((n) => inSeason.has(n)) ? SHOULDER : 0;
  });
}

const SEVEN_AXES = ["sweet", "salt", "sour", "bitter", "umami", "spicy", "aromatic"];

export function buildSensoryAxes(flavorProfile: Readonly<Record<string, number>>): SensoryAxis[] {
  return SEVEN_AXES.map((label) => {
    const raw = flavorProfile[label] ?? flavorProfile[label.toUpperCase()];
    return { label, value: raw === undefined ? 0 : Math.max(0, Math.min(1, raw)) };
  });
}

export function toElementalValues(shares: ElementalShares | null): ElementalValues | null {
  return shares ? { fire: shares.Fire, water: shares.Water, earth: shares.Earth, air: shares.Air } : null;
}

type ElementName = keyof ElementalShares;

/** Traditional planetary element per planetary-hour ruler. */
const PLANET_ELEMENT: Readonly<Record<string, ElementName>> = {
  Sun: "Fire",
  Mars: "Fire",
  Jupiter: "Fire",
  Moon: "Water",
  Venus: "Water",
  Neptune: "Water",
  Mercury: "Air",
  Uranus: "Air",
  Saturn: "Earth",
  Pluto: "Earth",
};

/** The card's share of the current hour ruler's element (Fire when the hour is unknown). */
export function skyMatch(
  shares: ElementalShares | null,
  planetaryHour: string | null,
): { hourElement: ElementName; score: number } {
  const hourElement = (planetaryHour === null ? undefined : PLANET_ELEMENT[planetaryHour]) ?? "Fire";
  const score = shares ? Math.max(0, Math.min(1, shares[hourElement])) : 0;
  return { hourElement, score };
}
