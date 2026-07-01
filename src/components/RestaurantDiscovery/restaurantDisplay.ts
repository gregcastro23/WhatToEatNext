/**
 * Shared display helpers for restaurant-discovery surfaces (Order It widget +
 * Best Match explorer). Keeps element decoration, glyphs, and formatters in one
 * place so the two finders render identically.
 *
 * @file src/components/RestaurantDiscovery/restaurantDisplay.ts
 */

import type {
  AlchmScoredRestaurant,
  RestaurantDiscoverySource,
} from "@/types/yelp";

export const ELEMENT_DECORATION: Record<
  AlchmScoredRestaurant["dominantElement"],
  { emoji: string; label: string; chipClass: string }
> = {
  Fire:  { emoji: "🔥", label: "Fire",  chipClass: "bg-rose-500/15 text-rose-200 border-rose-400/30" },
  Water: { emoji: "💧", label: "Water", chipClass: "bg-blue-500/15 text-blue-200 border-blue-400/30" },
  Earth: { emoji: "🌿", label: "Earth", chipClass: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
  Air:   { emoji: "💨", label: "Air",   chipClass: "bg-sky-500/15 text-sky-200 border-sky-400/30" },
};

export const ZODIAC_GLYPH: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌",  virgo: "♍",  libra: "♎",  scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

export const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

export function metersToMiles(meters?: number): string | null {
  if (typeof meters !== "number" || !Number.isFinite(meters)) return null;
  const miles = meters / 1609.344;
  return miles < 0.1 ? "<0.1 mi" : `${miles.toFixed(1)} mi`;
}

export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function sourceLabel(
  source: RestaurantDiscoverySource | undefined,
): string {
  switch (source) {
    case "foursquare":
      return "Foursquare";
    case "google":
      return "Google Places";
    case "olo":
      return "Olo";
    case "osm":
      return "OpenStreetMap";
    case "tripadvisor":
      return "Tripadvisor";
    case "yelp":
    default:
      return "Yelp";
  }
}

/** Build the "Aligned to Leo ♌ · Mars Hour ♂ · Fire dominant" cosmic line. */
export function cosmicContextLine(ctx: {
  currentZodiac?: string;
  planetaryHour?: string;
  dominantElement?: string;
}): string | null {
  if (!ctx.currentZodiac && !ctx.planetaryHour && !ctx.dominantElement) {
    return null;
  }
  const parts: string[] = [];
  if (ctx.currentZodiac) {
    const glyph = ZODIAC_GLYPH[ctx.currentZodiac.toLowerCase()] ?? "";
    parts.push(`${capitalize(ctx.currentZodiac)} ${glyph}`.trim());
  }
  if (ctx.planetaryHour) {
    const glyph = PLANET_GLYPH[ctx.planetaryHour] ?? "";
    parts.push(`${ctx.planetaryHour} Hour ${glyph}`.trim());
  }
  if (ctx.dominantElement) {
    parts.push(`${ctx.dominantElement} dominant`);
  }
  return parts.join(" · ");
}
