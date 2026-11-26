/**
 * Pure runtime wire parsers for `/kitchen-lab/alchm` and `/discover` public agent directory.
 *
 * @file src/lib/api/parsers/kitchenLabWireParsers.ts
 */

import { isPlainObject, readFiniteNumber, readString } from "./wirePrimitives";

export type KitchenElementAffinity = "fire" | "water" | "earth" | "air";

export interface RecommendedIngredientPayload {
  id: string;
  name: string;
  category: string;
  elemental_affinity: KitchenElementAffinity;
  planet: string;
  hue: number;
  match_score: number;
  thermo: { spirit: number; essence: number; matter: number; substance: number };
  image_url?: string;
}

export interface CuisineSignaturePayload {
  id: string;
  name: string;
  region: string;
  match: number;
  signature: [number, number, number, number];
}

export interface CommunityAgentPayload {
  userId: string;
  name: string;
  bio: string | null;
  dominantElement: string | null;
}

function parseElementAffinity(value: unknown): KitchenElementAffinity | undefined {
  if (value === "fire" || value === "water" || value === "earth" || value === "air") {
    return value;
  }
  return undefined;
}

function parseThermo(
  raw: unknown,
): RecommendedIngredientPayload["thermo"] | null {
  if (!isPlainObject(raw)) return null;
  const spirit = readFiniteNumber(raw.spirit);
  const essence = readFiniteNumber(raw.essence);
  const matter = readFiniteNumber(raw.matter);
  const substance = readFiniteNumber(raw.substance);
  if (
    spirit === undefined ||
    essence === undefined ||
    matter === undefined ||
    substance === undefined
  ) {
    return null;
  }
  return { spirit, essence, matter, substance };
}

function parseRecommendedIngredient(raw: unknown): RecommendedIngredientPayload | null {
  if (!isPlainObject(raw)) return null;
  const id = readString(raw.id);
  const name = readString(raw.name);
  const category = readString(raw.category);
  const affinity = parseElementAffinity(raw.elemental_affinity);
  const planet = readString(raw.planet);
  const hue = readFiniteNumber(raw.hue);
  const matchScore = readFiniteNumber(raw.match_score);
  const thermo = parseThermo(raw.thermo);
  if (
    !id ||
    !name ||
    category === undefined ||
    !affinity ||
    planet === undefined ||
    hue === undefined ||
    matchScore === undefined ||
    !thermo
  ) {
    return null;
  }
  const item: RecommendedIngredientPayload = {
    id,
    name,
    category,
    elemental_affinity: affinity,
    planet,
    hue,
    match_score: matchScore,
    thermo,
  };
  if (typeof raw.image_url === "string") item.image_url = raw.image_url;
  return item;
}

/** Producer: `src/app/api/recommendations/ingredients/route.ts` (`RecommendedIngredientsResponseSchema`) */
export function parseRecommendedIngredientsResponse(
  raw: unknown,
): RecommendedIngredientPayload[] {
  if (!isPlainObject(raw) || !Array.isArray(raw.ingredients)) return [];
  return raw.ingredients
    .map(parseRecommendedIngredient)
    .filter((item): item is RecommendedIngredientPayload => item !== null);
}

function parseSignatureTuple(raw: unknown): [number, number, number, number] | null {
  if (!Array.isArray(raw) || raw.length < 4) return null;
  const a = readFiniteNumber(raw[0]);
  const b = readFiniteNumber(raw[1]);
  const c = readFiniteNumber(raw[2]);
  const d = readFiniteNumber(raw[3]);
  if (a === undefined || b === undefined || c === undefined || d === undefined) return null;
  return [a, b, c, d];
}

function parseCuisineSignature(raw: unknown): CuisineSignaturePayload | null {
  if (!isPlainObject(raw)) return null;
  const id = readString(raw.id);
  const name = readString(raw.name);
  const region = readString(raw.region);
  const match = readFiniteNumber(raw.match);
  const signature = parseSignatureTuple(raw.signature);
  if (!id || !name || region === undefined || match === undefined || !signature) return null;
  return { id, name, region, match, signature };
}

/** Producer: `src/app/api/cuisines/signatures/route.ts` (`CuisineSignaturesResponseSchema`) */
export function parseCuisineSignaturesResponse(raw: unknown): {
  total: number;
  cuisines: CuisineSignaturePayload[];
} | null {
  if (!isPlainObject(raw)) return null;
  const cuisines = Array.isArray(raw.cuisines)
    ? raw.cuisines
        .map(parseCuisineSignature)
        .filter((item): item is CuisineSignaturePayload => item !== null)
    : [];
  const total = readFiniteNumber(raw.total) ?? cuisines.length;
  return { total, cuisines };
}

function parseCommunityAgent(raw: unknown): CommunityAgentPayload | null {
  if (!isPlainObject(raw)) return null;
  const userId = readString(raw.userId);
  const name = readString(raw.name);
  if (!userId || !name) return null;
  const bio = typeof raw.bio === "string" ? raw.bio : null;
  const dominantElement =
    typeof raw.dominantElement === "string" ? raw.dominantElement : null;
  return { userId, name, bio, dominantElement };
}

/** Producer: `src/app/api/community/agents/route.ts:78-95` */
export function parseCommunityAgentsResponse(raw: unknown): CommunityAgentPayload[] {
  if (!isPlainObject(raw) || !Array.isArray(raw.agents)) return [];
  return raw.agents
    .map(parseCommunityAgent)
    .filter((item): item is CommunityAgentPayload => item !== null);
}
