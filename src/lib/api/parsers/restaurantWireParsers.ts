/**
 * Pure runtime wire parsers for restaurant discovery & menu alchemy endpoints.
 *
 * @file src/lib/api/parsers/restaurantWireParsers.ts
 */

import type {
  AlchemizedDish,
  AlchemizedRestaurantMenu,
  ElementType,
} from "@/services/restaurantMenuAlchemyService";
import type { FoursquarePlace } from "@/types/restaurant";
import {
  isPlainObject,
  readFiniteNumber,
  readNumberRecord,
  readString,
  readStringArray,
} from "./wirePrimitives";

function parseElementType(value: unknown): ElementType | undefined {
  if (value === "Fire" || value === "Water" || value === "Earth" || value === "Air") {
    return value;
  }
  return undefined;
}

function parseElementalProfile(value: unknown): Record<ElementType, number> | null {
  if (!isPlainObject(value)) return null;
  const Fire = readFiniteNumber(value.Fire);
  const Water = readFiniteNumber(value.Water);
  const Earth = readFiniteNumber(value.Earth);
  const Air = readFiniteNumber(value.Air);
  if (Fire === undefined || Water === undefined || Earth === undefined || Air === undefined) {
    return null;
  }
  return { Fire, Water, Earth, Air };
}

function parseAlchemizedDish(raw: unknown): AlchemizedDish | null {
  if (!isPlainObject(raw)) return null;
  const id = readString(raw.id);
  const name = readString(raw.name);
  const category = readString(raw.category);
  const description = readString(raw.description);
  const elementalProfile = parseElementalProfile(raw.elementalProfile);
  const dominantElement = parseElementType(raw.dominantElement);
  if (!id || !name || category === undefined || description === undefined || !elementalProfile || !dominantElement) {
    return null;
  }
  const dish: AlchemizedDish = {
    id,
    name,
    category,
    description,
    ingredients: readStringArray(raw.ingredients),
    elementalProfile,
    dominantElement,
    techniques: readStringArray(raw.techniques),
    textures: readStringArray(raw.textures),
    dietaryTags: readStringArray(raw.dietaryTags),
  };
  if (raw.price === null || typeof raw.price === "string") dish.price = raw.price;
  return dish;
}

function parseMenuSummary(raw: unknown): AlchemizedRestaurantMenu["summary"] | null {
  if (!isPlainObject(raw)) return null;
  const archetype = readString(raw.archetype);
  const dishCount = readFiniteNumber(raw.dishCount);
  const topTechnique = readString(raw.topTechnique);
  if (archetype === undefined || dishCount === undefined || topTechnique === undefined) return null;
  const summary: AlchemizedRestaurantMenu["summary"] = { archetype, dishCount, topTechnique };
  const breakdown = readNumberRecord(raw.dietaryBreakdown);
  if (breakdown) summary.dietaryBreakdown = breakdown;
  return summary;
}

function parseAlchemizedMenu(raw: unknown): AlchemizedRestaurantMenu | undefined {
  if (!isPlainObject(raw)) return undefined;
  const restaurantId = readString(raw.restaurantId);
  const restaurantName = readString(raw.restaurantName);
  const sourceType = readString(raw.sourceType);
  const sigProfile = parseElementalProfile(raw.elementalSignature);
  const dominant = isPlainObject(raw.elementalSignature)
    ? parseElementType(raw.elementalSignature.dominant)
    : undefined;
  const summary = parseMenuSummary(raw.summary);
  if (!restaurantId || !restaurantName || sourceType === undefined || !sigProfile || !dominant || !summary) {
    return undefined;
  }
  const dishes = Array.isArray(raw.dishes)
    ? raw.dishes.map(parseAlchemizedDish).filter((d): d is AlchemizedDish => d !== null)
    : [];
  const menu: AlchemizedRestaurantMenu = {
    restaurantId,
    restaurantName,
    sourceType,
    elementalSignature: { ...sigProfile, dominant },
    topIngredients: readStringArray(raw.topIngredients),
    dishes,
    summary,
  };
  if (raw.sourceUrl === null || typeof raw.sourceUrl === "string") menu.sourceUrl = raw.sourceUrl;
  if (typeof raw.createdAt === "string") menu.createdAt = raw.createdAt;
  if (typeof raw.updatedAt === "string") menu.updatedAt = raw.updatedAt;
  return menu;
}

/** Producer: `src/app/api/restaurants/favorites/route.ts:61-65` */
export function parseFavoriteRestaurantIdsResponse(raw: unknown): {
  success: boolean;
  favoriteIds: string[];
} {
  if (!isPlainObject(raw)) return { success: false, favoriteIds: [] };
  return {
    success: raw.success === true,
    favoriteIds: readStringArray(raw.favoriteIds),
  };
}

/** Producer: `src/app/api/restaurants/alchemize-menu/route.ts:43-46,88-91` */
export function parseAlchemizeMenuResponse(raw: unknown): {
  success: boolean;
  menu?: AlchemizedRestaurantMenu;
} {
  if (!isPlainObject(raw)) return { success: false };
  const menu = parseAlchemizedMenu(raw.menu);
  return menu ? { success: raw.success === true, menu } : { success: raw.success === true };
}

/** Producer: `src/app/api/restaurants/alchemize-opt-in/route.ts:90-145` */
export function parseAlchemizeOptInResponse(raw: unknown): {
  success: boolean;
  error?: string;
} {
  if (!isPlainObject(raw)) return { success: false };
  const error = readString(raw.error);
  return error !== undefined
    ? { success: raw.success === true, error }
    : { success: raw.success === true };
}

function parseFoursquareCategories(raw: unknown): FoursquarePlace["categories"] {
  if (!Array.isArray(raw)) return [];
  const out: FoursquarePlace["categories"] = [];
  for (const cat of raw) {
    if (!isPlainObject(cat) || typeof cat.name !== "string") continue;
    const item: FoursquarePlace["categories"][number] = { name: cat.name };
    if (isPlainObject(cat.icon) && typeof cat.icon.prefix === "string" && typeof cat.icon.suffix === "string") {
      item.icon = { prefix: cat.icon.prefix, suffix: cat.icon.suffix };
    }
    out.push(item);
  }
  return out;
}

function parseFoursquarePlace(raw: unknown): FoursquarePlace | null {
  if (!isPlainObject(raw)) return null;
  const fsqId = readString(raw.fsq_id);
  const name = readString(raw.name);
  if (!fsqId || !name) return null;
  const loc = isPlainObject(raw.location) ? raw.location : {};
  const location: FoursquarePlace["location"] = {};
  if (typeof loc.formatted_address === "string") location.formatted_address = loc.formatted_address;
  if (typeof loc.locality === "string") location.locality = loc.locality;
  if (typeof loc.region === "string") location.region = loc.region;
  if (typeof loc.address === "string") location.address = loc.address;
  const place: FoursquarePlace = {
    fsq_id: fsqId,
    name,
    location,
    categories: parseFoursquareCategories(raw.categories),
  };
  const rating = readFiniteNumber(raw.rating);
  if (rating !== undefined) place.rating = rating;
  const distance = readFiniteNumber(raw.distance);
  if (distance !== undefined) place.distance = distance;
  if (typeof raw.link === "string") place.link = raw.link;
  return place;
}

/** Producer: `src/app/api/restaurants/search/route.ts:135-162` */
export function parseRestaurantSearchResponse(raw: unknown): {
  success: boolean;
  message?: string;
  results: FoursquarePlace[];
} {
  if (!isPlainObject(raw)) return { success: false, results: [] };
  const results = Array.isArray(raw.results)
    ? raw.results.map(parseFoursquarePlace).filter((p): p is FoursquarePlace => p !== null)
    : [];
  const message = readString(raw.message);
  return message !== undefined
    ? { success: raw.success === true, message, results }
    : { success: raw.success === true, results };
}
