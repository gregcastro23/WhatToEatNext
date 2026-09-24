/**
 * The dossier's view of a catalog card (omnibar Phase 2.5b, #870). A card
 * record is loosely shaped (fields vary by source file), so each field is
 * read as unknown and kept only when it has the shape the page draws.
 * Pure, so the page and its tests share one reading.
 */

export type ElementKey = "fire" | "water" | "earth" | "air";

export interface ElementalShares {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export interface DossierCard {
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  imageUrl: string | null;
  elemental: ElementalShares | null;
  flavorProfile: Readonly<Record<string, number>>;
  seasons: readonly string[];
  qualities: readonly string[];
  origin: readonly string[];
  healthBenefits: readonly string[];
  planetaryRuler: string | null;
  pairings: readonly string[];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** A list field: an array of strings, or one "spring, summer" string. */
function texts(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(/[,/]+/)
      .map((part) => part.trim())
      .filter((part) => part !== "");
  }
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item !== "") : [];
}

function member(value: unknown, name: string): unknown {
  return typeof value === "object" && value !== null && name in value ? Reflect.get(value, name) : undefined;
}

function numberRecord(value: unknown): Record<string, number> {
  if (typeof value !== "object" || value === null) return {};
  const entries: Array<[string, unknown]> = Object.entries(value);
  return Object.fromEntries(
    entries.filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1])),
  );
}

function elementalOf(value: unknown): ElementalShares | null {
  const shares = numberRecord(value);
  const { Fire, Water, Earth, Air } = shares;
  if (Fire === undefined || Water === undefined || Earth === undefined || Air === undefined) return null;
  return { Fire, Water, Earth, Air };
}

/** `pairingRecommendations` is a list on some cards, `{ complementary }` on others. */
function pairingsOf(value: unknown): string[] {
  return Array.isArray(value) ? texts(value) : texts(member(value, "complementary"));
}

export function toDossierCard(record: Readonly<Record<string, unknown>>, fallbackName: string): DossierCard {
  const rulers = texts(member(record.astrologicalProfile, "rulingPlanets"));
  const seasonality = texts(record.seasonality);
  return {
    name: text(record.name) ?? fallbackName,
    category: text(record.category) ?? "ingredient",
    subcategory: text(record.subcategory) ?? text(record.subCategory),
    description: text(record.description),
    imageUrl: text(record.image_url) ?? text(record.imageUrl),
    elemental: elementalOf(record.elementalProperties),
    flavorProfile: numberRecord(record.flavorProfile),
    seasons: seasonality.length > 0 ? seasonality : texts(record.season),
    qualities: texts(record.qualities),
    origin: texts(record.origin),
    healthBenefits: texts(record.healthBenefits),
    planetaryRuler: text(record.planetaryRuler) ?? rulers[0] ?? null,
    pairings: pairingsOf(record.pairingRecommendations),
  };
}

export function dominantElement(shares: ElementalShares | null): { key: ElementKey; value: number } | null {
  if (!shares) return null;
  const ranked: Array<[ElementKey, number]> = [
    ["fire", shares.Fire],
    ["water", shares.Water],
    ["earth", shares.Earth],
    ["air", shares.Air],
  ];
  ranked.sort((a, b) => b[1] - a[1]);
  const [top] = ranked;
  return top ? { key: top[0], value: top[1] } : null;
}

/** "black pepper" → "Black Pepper": catalog names are often lower case. */
export function titleCase(name: string): string {
  return name.replace(/(^|[\s(/-])(\p{Ll})/gu, (_, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`);
}
