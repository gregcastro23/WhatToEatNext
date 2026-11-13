/**
 * Wire parser for the `ingredient` record inside `GET /api/ingredients/[name]`, as
 * `IngredientDrawer` reads it. The response envelope is parsed by
 * `ingredientDrawerParser.ts`, which calls `parseIngredient` here.
 *
 * Producer: `catalogRecord(card)` in `src/lib/ingredients/ingredientCatalog.ts`
 * (ingredientCatalog.ts:156-165 overlays a string `name`), which the route serialises
 * under the always-present `ingredient` key (route.ts:103).
 *
 * Only fields the drawer reads are checked. A mistyped optional display field is
 * dropped, never coerced; only a non-string `name` rejects the record. A list field is
 * kept only when every element is a string, never as a partial list. A number is kept
 * only when finite: a hand-crafted `1e999` (Infinity) is dropped like any mistype.
 * Client-safe.
 *
 * @file src/components/recipes/ingredientRecordParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";

type Picked<K extends string, V> = { [P in K]?: V };

interface StorageTemperature {
  fahrenheit: number;
  celsius: number;
}

interface StorageDetails {
  container?: string;
  duration?: string;
  temperature?: string | StorageTemperature;
  notes?: string;
}

interface NutritionalProfile {
  serving_size?: string;
  calories?: number;
  macros?: Picked<"protein" | "carbs" | "fat" | "fiber", number>;
  vitamins?: Record<string, unknown>;
  minerals?: Record<string, unknown>;
  source?: string;
}

export interface IngredientData {
  name: string;
  category?: string;
  subCategory?: string;
  subcategory?: string;
  qualities?: string[];
  origin?: string[] | string;
  elementalProperties?: Picked<"Fire" | "Water" | "Earth" | "Air", number>;
  alchemicalProperties?: Picked<"Spirit" | "Essence" | "Matter" | "Substance", number>;
  kalchm?: number;
  monica?: number;
  flavorProfile?: Record<string, number>;
  sensoryProfile?: { taste?: Record<string, number> };
  nutritionalProfile?: NutritionalProfile;
  storage?: string | StorageDetails;
  seasonality?: string[] | string;
  season?: string[] | string;
  pairingRecommendations?: Picked<"complementary" | "contrasting" | "toAvoid", string[]>;
  astrologicalProfile?: Picked<"rulingPlanets" | "zodiacAffinity", string[]>;
  recommendedCookingMethods?: string[];
}

type IngredientFields = Omit<IngredientData, "name">;

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** A finite number; NaN and +/-Infinity (a hand-crafted `1e999`) are dropped like any mistype. */
function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** A list whose every element is a string, else `undefined` (never a partial list). */
function strings(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list: readonly unknown[] = value;
  return list.every((item): item is string => typeof item === "string") ? [...list] : undefined;
}

/** The entries of a record whose value is a finite number (the drawer filters the same way). */
function numberMap(value: unknown): Record<string, number> | undefined {
  if (!isJsonRecord(value)) return undefined;
  const pairs: Array<[string, number]> = [];
  for (const [key, entry] of Object.entries(value)) {
    const finite = num(entry);
    if (finite !== undefined) pairs.push([key, finite]);
  }
  return Object.fromEntries(pairs);
}

/** The listed keys of a record, each kept only if `narrow` accepts its value. */
function pick<K extends string, V>(
  value: unknown,
  keys: readonly K[],
  narrow: (entry: unknown) => V | undefined,
): Picked<K, V> | undefined {
  if (!isJsonRecord(value)) return undefined;
  const out: Picked<K, V> = {};
  for (const key of keys) {
    const entry = narrow(value[key]);
    if (entry !== undefined) out[key] = entry;
  }
  return out;
}

/** A free-text temperature, or a record carrying both scales as finite numbers. */
function parseTemperature(value: unknown): string | StorageTemperature | undefined {
  if (typeof value === "string") return value;
  if (!isJsonRecord(value)) return undefined;
  const fahrenheit = num(value.fahrenheit);
  const celsius = num(value.celsius);
  if (fahrenheit === undefined || celsius === undefined) return undefined;
  return { fahrenheit, celsius };
}

function parseStorage(value: unknown): IngredientData["storage"] {
  if (typeof value === "string") return value;
  if (!isJsonRecord(value)) return undefined;
  const { container, duration, notes } = value;
  const temperature = parseTemperature(value.temperature);
  return {
    ...(typeof container === "string" ? { container } : {}),
    ...(typeof duration === "string" ? { duration } : {}),
    ...(temperature !== undefined ? { temperature } : {}),
    ...(typeof notes === "string" ? { notes } : {}),
  };
}

function parseNutrition(value: unknown): IngredientData["nutritionalProfile"] {
  if (!isJsonRecord(value)) return undefined;
  const { source, vitamins, minerals } = value;
  const servingSize = value.serving_size;
  const calories = num(value.calories);
  const macros = pick(value.macros, ["protein", "carbs", "fat", "fiber"], num);
  return {
    ...(typeof servingSize === "string" ? { serving_size: servingSize } : {}),
    ...(calories !== undefined ? { calories } : {}),
    ...(macros ? { macros } : {}),
    ...(isJsonRecord(vitamins) ? { vitamins } : {}),
    ...(isJsonRecord(minerals) ? { minerals } : {}),
    ...(typeof source === "string" ? { source } : {}),
  };
}

/** Scalar and list fields of the ingredient. */
function parseFacts(raw: Record<string, unknown>): IngredientFields {
  const kalchm = num(raw.kalchm);
  const monica = num(raw.monica);
  const category = str(raw.category);
  const subCategory = str(raw.subCategory);
  const subcategory = str(raw.subcategory);
  const qualities = strings(raw.qualities);
  const origin = strings(raw.origin) ?? str(raw.origin);
  const seasonality = strings(raw.seasonality) ?? str(raw.seasonality);
  const season = strings(raw.season) ?? str(raw.season);
  return {
    ...(category !== undefined ? { category } : {}),
    ...(subCategory !== undefined ? { subCategory } : {}),
    ...(subcategory !== undefined ? { subcategory } : {}),
    ...(qualities ? { qualities } : {}),
    ...(origin !== undefined ? { origin } : {}),
    ...(seasonality !== undefined ? { seasonality } : {}),
    ...(season !== undefined ? { season } : {}),
    ...(kalchm !== undefined ? { kalchm } : {}),
    ...(monica !== undefined ? { monica } : {}),
  };
}

/** Nested profile fields of the ingredient. */
function parseProfiles(raw: Record<string, unknown>): IngredientFields {
  const { sensoryProfile } = raw;
  const elemental = pick(raw.elementalProperties, ["Fire", "Water", "Earth", "Air"], num);
  const alchemical = pick(raw.alchemicalProperties, ["Spirit", "Essence", "Matter", "Substance"], num);
  const pairing = pick(raw.pairingRecommendations, ["complementary", "contrasting", "toAvoid"], strings);
  const astro = pick(raw.astrologicalProfile, ["rulingPlanets", "zodiacAffinity"], strings);
  const taste = isJsonRecord(sensoryProfile) ? numberMap(sensoryProfile.taste) : undefined;
  const flavor = numberMap(raw.flavorProfile);
  const nutrition = parseNutrition(raw.nutritionalProfile);
  const storage = parseStorage(raw.storage);
  const methods = strings(raw.recommendedCookingMethods);
  return {
    ...(elemental ? { elementalProperties: elemental } : {}),
    ...(alchemical ? { alchemicalProperties: alchemical } : {}),
    ...(flavor ? { flavorProfile: flavor } : {}),
    ...(taste ? { sensoryProfile: { taste } } : {}),
    ...(nutrition ? { nutritionalProfile: nutrition } : {}),
    ...(storage !== undefined ? { storage } : {}),
    ...(pairing ? { pairingRecommendations: pairing } : {}),
    ...(astro ? { astrologicalProfile: astro } : {}),
    ...(methods ? { recommendedCookingMethods: methods } : {}),
  };
}

/** The ingredient record; throws only when `name` is not a string. */
export function parseIngredient(raw: Record<string, unknown>): IngredientData {
  const { name } = raw;
  if (typeof name !== "string") throw new TypeError("Ingredient record had no string name");
  return { name, ...parseFacts(raw), ...parseProfiles(raw) };
}
