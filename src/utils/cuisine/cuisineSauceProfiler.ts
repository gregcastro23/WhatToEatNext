/**
 * Cuisine Sauce Profiler
 *
 * Bridges the rich per-cuisine data model (mother sauces, traditional sauces,
 * sauceRecommender pairing maps, regional cuisines, planetary resonance) with
 * the global sauce catalog (`allSauces`) using four-element vector matching,
 * pairing aliases, dietary inference, and live transit harmony.
 */

import { cuisineFlavorProfiles } from "@/data/cuisineFlavorProfiles";
import { cuisinesMap } from "@/data/cuisines/index";
import { allSauces, type Sauce as DataSauce } from "@/data/sauces";
import { makeSauceId } from "@/lib/sauces/catalogueFile";
import {
  foldKey,
  inferDietaryCompatibility,
  lookupMethodPairing,
  lookupPairingValues,
  lookupProteinPairing,
  lookupRegionPairing,
  lookupVegetablePairing,
} from "@/lib/sauces/pairingAliases";
import type { ElementalProperties } from "@/types/alchemy";
import type { Cuisine } from "@/types/cuisine";

// ============================================================================
// Types
// ============================================================================

export type SauceRole = "complement" | "contrast" | "enhance" | "balance";

export type FlavorAxis =
  | "spicy"
  | "sweet"
  | "sour"
  | "bitter"
  | "salty"
  | "umami";

export interface CuisineSauceContext {
  /** Cuisine key as it appears in `cuisinesMap` or sauce catalogue (e.g. "Italian"). */
  cuisine: string;
  region?: string;
  protein?: string;
  vegetable?: string;
  cookingMethod?: string;
  dietary?: string[];
  season?: "spring" | "summer" | "fall" | "autumn" | "winter" | "all";
  flavorTargets?: FlavorAxis[];
  role?: SauceRole;
  cosmic?: {
    zodiac?: string;
    planetaryHour?: string;
    isDaytime?: boolean;
    lunarPhase?: string;
  };
  cosmicWeight?: number;
  /**
   * Visitor's elemental bias from useUserElementalBias (chart and/or guest
   * table). When present it is blended (30%) into the cuisine's elemental
   * target before sauce similarity; absent keeps scoring bit-identical.
   */
  userElementals?: { Fire: number; Water: number; Earth: number; Air: number } | null;
}

export interface CuisineFingerprint {
  key: string;
  name: string;
  description?: string;
  elementalProperties: ElementalProperties;
  planetaryResonance: string[];
  signatureTechniques: string[];
  signatureIngredients: string[];
  flavorProfile?: Partial<Record<FlavorAxis, number>>;
  seasonalPreference: string[];
  regions: Array<{ key: string; name: string; description?: string; signature?: string[] }>;
  motherSauceCount: number;
  traditionalSauceCount: number;
  pairingAxes: {
    proteins: string[];
    vegetables: string[];
    cookingMethods: string[];
    regions: string[];
    diets: string[];
  };
}

export interface UnifiedSauce {
  id: string;
  name: string;
  origin: "mother" | "traditional" | "global" | "named-only";
  ownerCuisine?: string;
  description?: string;
  base?: string;
  keyIngredients?: string[];
  culinaryUses?: string[];
  variants?: string[];
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: string[];
  seasonality?: string;
  preparationNotes?: string;
  technicalTips?: string;
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  yield?: string;
  ingredients?: string[];
  preparationSteps?: string[];
  storageInstructions?: string;
  alchemicalProperties?: { Spirit: number; Essence: number; Matter: number; Substance: number };
  thermodynamicProperties?: { heat: number; entropy: number; reactivity: number; gregsEnergy: number };
  nutritionalProfile?: DataSauce["nutritionalProfile"];
  dataKey?: string;
}

interface PairingRecordMap {
  forProtein?: Record<string, string[] | undefined>;
  forVegetable?: Record<string, string[] | undefined>;
  forCookingMethod?: Record<string, string[] | undefined>;
  byAstrological?: Record<string, string[] | undefined>;
  byRegion?: Record<string, string[] | undefined>;
  byDietary?: Record<string, string[] | undefined>;
}

interface CuisineLike {
  name?: string;
  description?: string;
  elementalProperties?: { Fire: number; Water: number; Earth: number; Air: number };
  motherSauces?: Record<string, unknown>;
  traditionalSauces?: Record<string, unknown>;
  sauceRecommender?: PairingRecordMap;
  regionalCuisines?: unknown;
}

interface CuisineSauceBlob {
  name?: string;
  description?: string;
  base?: string;
  keyIngredients?: string[];
  culinaryUses?: string[];
  variants?: string[];
  derivatives?: string[];
  elementalProperties?: { Fire: number; Water: number; Earth: number; Air: number };
  astrologicalInfluences?: string[];
  seasonality?: string;
  preparationNotes?: string;
  technicalTips?: string;
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  yield?: string;
  ingredients?: string[];
  preparationSteps?: string[];
  storageInstructions?: string;
  alchemicalProperties?: UnifiedSauce["alchemicalProperties"];
  thermodynamicProperties?: UnifiedSauce["thermodynamicProperties"];
  nutritionalProfile?: DataSauce["nutritionalProfile"];
}

export interface ScoreBreakdown {
  cuisineAuthenticity: number;
  dishPairing: number;
  regionalMatch: number;
  dietaryFit: number;
  seasonalResonance: number;
  astrologicalHarmony: number;
  elementalCompatibility: number;
  flavorMatch: number;
}

export interface CuisineSauceResult {
  sauce: UnifiedSauce;
  score: number;
  breakdown: ScoreBreakdown;
  reasoning: string[];
  tags: string[];
}

// ============================================================================
// Runtime narrowing helpers (zero `as` casts)
// ============================================================================

const PUBLIC_CUISINES: readonly string[] = [
  "Italian",
  "French",
  "Japanese",
  "Mexican",
  "Thai",
  "Chinese",
  "Indian",
  "Greek",
  "Korean",
  "Vietnamese",
  "Middle Eastern",
  "American",
  "African",
  "Russian",
  "Fusion",
];

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function readString(obj: Record<string, unknown>, key: string): string | undefined {
  const val = obj[key];
  return typeof val === "string" ? val : undefined;
}

function readStringArray(obj: Record<string, unknown>, key: string): string[] | undefined {
  const val = obj[key];
  if (!Array.isArray(val)) return undefined;
  return val.filter((item): item is string => typeof item === "string");
}

function readFourElementVector(raw: unknown): { Fire: number; Water: number; Earth: number; Air: number } | undefined {
  if (!isRecord(raw)) return undefined;
  const { Fire, Water, Earth, Air } = raw;
  if (
    typeof Fire !== "number" ||
    typeof Water !== "number" ||
    typeof Earth !== "number" ||
    typeof Air !== "number"
  ) {
    return undefined;
  }
  return { Fire, Water, Earth, Air };
}

function readStringListMap(raw: unknown): Record<string, string[] | undefined> | undefined {
  if (!isRecord(raw)) return undefined;
  const out: Record<string, string[] | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v)) {
      out[k] = v.filter((item): item is string => typeof item === "string");
    }
  }
  return out;
}

function readPairingMap(raw: unknown): PairingRecordMap | undefined {
  if (!isRecord(raw)) return undefined;
  const forProtein = readStringListMap(raw.forProtein);
  const forVegetable = readStringListMap(raw.forVegetable);
  const forCookingMethod = readStringListMap(raw.forCookingMethod);
  const byAstrological = readStringListMap(raw.byAstrological);
  const byRegion = readStringListMap(raw.byRegion);
  const byDietary = readStringListMap(raw.byDietary);
  return {
    ...(forProtein ? { forProtein } : {}),
    ...(forVegetable ? { forVegetable } : {}),
    ...(forCookingMethod ? { forCookingMethod } : {}),
    ...(byAstrological ? { byAstrological } : {}),
    ...(byRegion ? { byRegion } : {}),
    ...(byDietary ? { byDietary } : {}),
  };
}

function toCuisineLike(raw: unknown): CuisineLike | null {
  if (!isRecord(raw)) return null;
  const name = readString(raw, "name");
  const description = readString(raw, "description");
  const elementalProperties = readFourElementVector(raw.elementalProperties);
  const motherSauces = isRecord(raw.motherSauces) ? raw.motherSauces : undefined;
  const traditionalSauces = isRecord(raw.traditionalSauces) ? raw.traditionalSauces : undefined;
  const sauceRecommender = readPairingMap(raw.sauceRecommender);
  return {
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(elementalProperties !== undefined ? { elementalProperties } : {}),
    ...(motherSauces !== undefined ? { motherSauces } : {}),
    ...(traditionalSauces !== undefined ? { traditionalSauces } : {}),
    ...(sauceRecommender !== undefined ? { sauceRecommender } : {}),
    ...(raw.regionalCuisines !== undefined ? { regionalCuisines: raw.regionalCuisines } : {}),
  };
}

function findInMap(
  map: Record<string, unknown>,
  targetKey: string,
): { cuisine: CuisineLike; canonicalKey: string } | null {
  if (Object.prototype.hasOwnProperty.call(map, targetKey)) {
    const parsed = toCuisineLike(map[targetKey]);
    if (parsed) return { cuisine: parsed, canonicalKey: parsed.name ?? targetKey };
  }
  const needle = foldKey(targetKey);
  if (!needle) return null;
  for (const [k, raw] of Object.entries(map)) {
    const parsed = toCuisineLike(raw);
    if (!parsed) continue;
    if (foldKey(k) === needle || (parsed.name !== undefined && foldKey(parsed.name) === needle)) {
      return { cuisine: parsed, canonicalKey: parsed.name ?? k };
    }
  }
  return null;
}

function resolveCuisine(
  key: string,
  cuisinesMapData?: Record<string, unknown>,
): { cuisine: CuisineLike; canonicalKey: string } | null {
  if (!key) return null;
  if (cuisinesMapData) {
    const hit = findInMap(cuisinesMapData, key);
    if (hit) return hit;
  }
  const fallbackMap: Record<string, Cuisine> = cuisinesMap;
  return findInMap(fallbackMap, key);
}

// ============================================================================
// Cuisine fingerprint
// ============================================================================

function parseRegionalEntries(
  rawRegions: unknown,
): Array<{ key: string; name: string; description?: string; signature?: string[] }> {
  if (Array.isArray(rawRegions)) {
    return rawRegions
      .map((item, idx) => {
        if (!isRecord(item)) return null;
        const name = readString(item, "name") ?? String(idx);
        const key = readString(item, "key") ?? name;
        const description = readString(item, "description");
        const signature = readStringArray(item, "signature") ?? readStringArray(item, "signatureDishes");
        return {
          key,
          name,
          ...(description ? { description } : {}),
          ...(signature ? { signature } : {}),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }
  if (!isRecord(rawRegions)) return [];
  return Object.entries(rawRegions)
    .map(([k, item]) => {
      if (!isRecord(item)) return null;
      const name = readString(item, "name") ?? k;
      const description = readString(item, "description");
      const signature = readStringArray(item, "signature") ?? readStringArray(item, "signatureDishes");
      return {
        key: k,
        name,
        ...(description ? { description } : {}),
        ...(signature ? { signature } : {}),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export function getCuisineFingerprint(
  cuisineKey: string,
  cuisinesMapData?: Record<string, unknown>,
): CuisineFingerprint | null {
  const resolved = resolveCuisine(cuisineKey, cuisinesMapData);
  if (!resolved) return null;
  const { cuisine, canonicalKey } = resolved;

  const profileKey = Object.keys(cuisineFlavorProfiles).find(
    (k) => foldKey(k) === foldKey(canonicalKey),
  );
  const profile = profileKey ? cuisineFlavorProfiles[profileKey] : undefined;
  const regionalEntries = parseRegionalEntries(cuisine.regionalCuisines);
  const sr = cuisine.sauceRecommender ?? {};

  return {
    key: canonicalKey,
    name: cuisine.name ?? canonicalKey,
    ...(cuisine.description ? { description: cuisine.description } : {}),
    elementalProperties: cuisine.elementalProperties ?? {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    },
    planetaryResonance: profile?.planetaryResonance ?? [],
    signatureTechniques: profile?.signatureTechniques ?? [],
    signatureIngredients: profile?.signatureIngredients ?? [],
    ...(profile?.flavorProfiles ? { flavorProfile: profile.flavorProfiles } : {}),
    seasonalPreference: profile?.seasonalPreference ?? [],
    regions: regionalEntries,
    motherSauceCount: cuisine.motherSauces ? Object.keys(cuisine.motherSauces).length : 0,
    traditionalSauceCount: cuisine.traditionalSauces ? Object.keys(cuisine.traditionalSauces).length : 0,
    pairingAxes: {
      proteins: Object.keys(sr.forProtein ?? {}),
      vegetables: Object.keys(sr.forVegetable ?? {}),
      cookingMethods: Object.keys(sr.forCookingMethod ?? {}),
      regions: Object.keys(sr.byRegion ?? {}),
      diets: Object.keys(sr.byDietary ?? {}),
    },
  };
}

export function listCuisines(
  cuisinesMapData?: Record<string, unknown>,
): Array<{ key: string; name: string; sauceCount: number }> {
  return PUBLIC_CUISINES.flatMap((displayKey) => {
    const resolved = resolveCuisine(displayKey, cuisinesMapData);
    if (!resolved) return [];
    const { cuisine } = resolved;
    const motherCount = cuisine.motherSauces ? Object.keys(cuisine.motherSauces).length : 0;
    const tradCount = cuisine.traditionalSauces ? Object.keys(cuisine.traditionalSauces).length : 0;
    return [
      {
        key: displayKey,
        name: cuisine.name ?? displayKey,
        sauceCount: motherCount + tradCount,
      },
    ];
  });
}

// ============================================================================
// Sauce pool construction
// ============================================================================

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function buildAllSauceIndex(): {
  byName: Map<string, { key: string; sauce: DataSauce }>;
  byKey: Map<string, { key: string; sauce: DataSauce }>;
} {
  const byName = new Map<string, { key: string; sauce: DataSauce }>();
  const byKey = new Map<string, { key: string; sauce: DataSauce }>();
  for (const [key, s] of Object.entries(allSauces)) {
    byName.set(norm(s.name), { key, sauce: s });
    byKey.set(norm(key), { key, sauce: s });
  }
  return { byName, byKey };
}

const ALL_SAUCE_INDEX = buildAllSauceIndex();

function findDataSauce(name: string): { key: string; sauce: DataSauce } | undefined {
  const n = norm(name);
  return ALL_SAUCE_INDEX.byName.get(n) ?? ALL_SAUCE_INDEX.byKey.get(n);
}

function assignIfDefined<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | undefined,
): void {
  if (value !== undefined) {
    target[key] = value;
  }
}

function readAlchemicalVector(
  raw: unknown,
): { Spirit: number; Essence: number; Matter: number; Substance: number } | undefined {
  if (!isRecord(raw)) return undefined;
  const { Spirit, Essence, Matter, Substance } = raw;
  if (
    typeof Spirit !== "number" ||
    typeof Essence !== "number" ||
    typeof Matter !== "number" ||
    typeof Substance !== "number"
  ) {
    return undefined;
  }
  return { Spirit, Essence, Matter, Substance };
}

const SAUCE_STRING_FIELDS = [
  "name", "description", "base", "seasonality", "preparationNotes",
  "technicalTips", "difficulty", "prepTime", "cookTime", "yield", "storageInstructions",
] as const;

const SAUCE_ARRAY_FIELDS = [
  "keyIngredients", "culinaryUses", "variants", "derivatives",
  "astrologicalInfluences", "ingredients", "preparationSteps",
] as const;

function toSauceBlob(raw: unknown): CuisineSauceBlob | undefined {
  if (!isRecord(raw)) return undefined;
  const blob: CuisineSauceBlob = {};
  for (const field of SAUCE_STRING_FIELDS) assignIfDefined(blob, field, readString(raw, field));
  for (const field of SAUCE_ARRAY_FIELDS) assignIfDefined(blob, field, readStringArray(raw, field));
  assignIfDefined(blob, "elementalProperties", readFourElementVector(raw.elementalProperties));
  assignIfDefined(blob, "alchemicalProperties", readAlchemicalVector(raw.alchemicalProperties));
  return blob;
}

function fromCuisineSauce(
  ownerCuisine: string,
  origin: "mother" | "traditional",
  key: string,
  raw: CuisineSauceBlob | undefined,
): UnifiedSauce {
  const richer = findDataSauce(raw?.name ?? key);
  const merged: CuisineSauceBlob = richer ? { ...richer.sauce, ...raw } : raw ?? {};
  const sauce: UnifiedSauce = {
    id: makeSauceId([ownerCuisine, origin, key]),
    name: raw?.name ?? key,
    origin,
    ownerCuisine,
  };

  assignIfDefined(sauce, "description", merged.description);
  assignIfDefined(sauce, "base", merged.base);
  assignIfDefined(sauce, "keyIngredients", merged.keyIngredients);
  assignIfDefined(sauce, "culinaryUses", merged.culinaryUses);
  assignIfDefined(sauce, "variants", merged.variants ?? merged.derivatives);
  assignIfDefined(sauce, "elementalProperties", merged.elementalProperties);
  assignIfDefined(sauce, "astrologicalInfluences", merged.astrologicalInfluences);
  assignIfDefined(sauce, "seasonality", merged.seasonality);
  assignIfDefined(sauce, "preparationNotes", merged.preparationNotes);
  assignIfDefined(sauce, "technicalTips", merged.technicalTips);
  assignIfDefined(sauce, "difficulty", merged.difficulty);
  assignIfDefined(sauce, "prepTime", merged.prepTime);
  assignIfDefined(sauce, "cookTime", merged.cookTime);
  assignIfDefined(sauce, "yield", merged.yield);
  assignIfDefined(sauce, "ingredients", merged.ingredients);
  assignIfDefined(sauce, "preparationSteps", merged.preparationSteps);
  assignIfDefined(sauce, "storageInstructions", merged.storageInstructions);
  assignIfDefined(sauce, "alchemicalProperties", merged.alchemicalProperties);
  assignIfDefined(sauce, "thermodynamicProperties", merged.thermodynamicProperties);
  assignIfDefined(sauce, "nutritionalProfile", merged.nutritionalProfile);
  assignIfDefined(sauce, "dataKey", richer?.key);

  return sauce;
}

function fromGlobalSauce(
  key: string,
  sauce: DataSauce,
  canonicalId?: string,
): UnifiedSauce {
  return {
    id: canonicalId ?? makeSauceId(["global", key]),
    name: sauce.name,
    origin: "global",
    ...(sauce.cuisine ? { ownerCuisine: sauce.cuisine } : {}),
    description: sauce.description,
    base: sauce.base,
    keyIngredients: sauce.keyIngredients,
    culinaryUses: sauce.culinaryUses,
    ...(sauce.variants ? { variants: sauce.variants } : {}),
    elementalProperties: sauce.elementalProperties,
    astrologicalInfluences: sauce.astrologicalInfluences,
    seasonality: sauce.seasonality,
    ...(sauce.preparationNotes ? { preparationNotes: sauce.preparationNotes } : {}),
    ...(sauce.technicalTips ? { technicalTips: sauce.technicalTips } : {}),
    ...(sauce.difficulty ? { difficulty: sauce.difficulty } : {}),
    ...(sauce.prepTime ? { prepTime: sauce.prepTime } : {}),
    ...(sauce.cookTime ? { cookTime: sauce.cookTime } : {}),
    ...(sauce.yield ? { yield: sauce.yield } : {}),
    ...(sauce.ingredients ? { ingredients: sauce.ingredients } : {}),
    ...(sauce.preparationSteps ? { preparationSteps: sauce.preparationSteps } : {}),
    ...(sauce.storageInstructions ? { storageInstructions: sauce.storageInstructions } : {}),
    ...(sauce.alchemicalProperties ? { alchemicalProperties: sauce.alchemicalProperties } : {}),
    ...(sauce.thermodynamicProperties ? { thermodynamicProperties: sauce.thermodynamicProperties } : {}),
    ...(sauce.nutritionalProfile ? { nutritionalProfile: sauce.nutritionalProfile } : {}),
    dataKey: key,
  };
}

function buildCanonicalIdByName(cuisinesMapData?: Record<string, unknown>): Map<string, string> {
  const index = new Map<string, string>();
  if (!cuisinesMapData) return index;
  for (const [cuisineKey, raw] of Object.entries(cuisinesMapData)) {
    const cuisine = toCuisineLike(raw);
    if (!cuisine) continue;
    const owner = cuisine.name ?? cuisineKey;
    if (cuisine.motherSauces) {
      for (const [k, rawSauce] of Object.entries(cuisine.motherSauces)) {
        const blob = toSauceBlob(rawSauce);
        const nameKey = norm(blob?.name ?? k);
        if (!index.has(nameKey)) index.set(nameKey, makeSauceId([owner, "mother", k]));
      }
    }
    if (cuisine.traditionalSauces) {
      for (const [k, rawSauce] of Object.entries(cuisine.traditionalSauces)) {
        const blob = toSauceBlob(rawSauce);
        const nameKey = norm(blob?.name ?? k);
        if (!index.has(nameKey)) index.set(nameKey, makeSauceId([owner, "traditional", k]));
      }
    }
  }
  return index;
}

function collectPairingNamedRefs(sr: PairingRecordMap): Set<string> {
  const allNamedRefs = new Set<string>();
  const collect = (m: Record<string, string[] | undefined> | undefined): void => {
    if (!m) return;
    Object.values(m).forEach((arr) => {
      if (Array.isArray(arr)) arr.forEach((n) => allNamedRefs.add(n));
    });
  };
  collect(sr.forProtein);
  collect(sr.forVegetable);
  collect(sr.forCookingMethod);
  collect(sr.byAstrological);
  collect(sr.byRegion);
  collect(sr.byDietary);
  return allNamedRefs;
}

function addPairingRefsToPool(
  pool: Map<string, UnifiedSauce>,
  canonicalKey: string,
  sr: PairingRecordMap,
  canonicalIdByName: Map<string, string>,
): void {
  for (const name of collectPairingNamedRefs(sr)) {
    const k = norm(name);
    if (pool.has(k)) continue;
    const richer = findDataSauce(name);
    if (!richer) {
      pool.set(k, {
        id: makeSauceId([canonicalKey, "named", k]),
        name,
        origin: "named-only",
        ownerCuisine: canonicalKey,
      });
      continue;
    }
    const richerNorm = norm(richer.sauce.name);
    if (!pool.has(richerNorm)) {
      pool.set(richerNorm, fromGlobalSauce(richer.key, richer.sauce, canonicalIdByName.get(richerNorm)));
    }
  }
}

export function buildCuisineSaucePool(
  cuisineKey: string,
  cuisinesMapData?: Record<string, unknown>,
): UnifiedSauce[] {
  const resolved = resolveCuisine(cuisineKey, cuisinesMapData);
  const pool = new Map<string, UnifiedSauce>();
  const canonicalIdByName = buildCanonicalIdByName(cuisinesMapData);

  if (resolved) {
    const { cuisine, canonicalKey } = resolved;
    for (const [k, raw] of Object.entries(cuisine.motherSauces ?? {})) {
      const u = fromCuisineSauce(canonicalKey, "mother", k, toSauceBlob(raw));
      pool.set(norm(u.name), u);
    }
    for (const [k, raw] of Object.entries(cuisine.traditionalSauces ?? {})) {
      const blob = toSauceBlob(raw);
      const key = norm(blob?.name ?? k);
      if (!pool.has(key)) pool.set(key, fromCuisineSauce(canonicalKey, "traditional", k, blob));
    }
    if (cuisine.sauceRecommender) {
      addPairingRefsToPool(pool, canonicalKey, cuisine.sauceRecommender, canonicalIdByName);
    }
  }

  for (const [key, sauce] of Object.entries(allSauces)) {
    const k = norm(sauce.name);
    if (!pool.has(k)) pool.set(k, fromGlobalSauce(key, sauce, canonicalIdByName.get(k)));
  }

  return Array.from(pool.values());
}

// ============================================================================
// Scoring
// ============================================================================

const ZODIAC_TO_ELEMENT: Record<string, "Fire" | "Water" | "Earth" | "Air"> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

function cosineSimilarity(a: ElementalProperties, b: ElementalProperties): number {
  const ax = [a.Fire, a.Water, a.Earth, a.Air];
  const bx = [b.Fire, b.Water, b.Earth, b.Air];
  const dot =
    a.Fire * b.Fire + a.Water * b.Water + a.Earth * b.Earth + a.Air * b.Air;
  const magA = Math.sqrt(ax.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(bx.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function nameMatchesAny(name: string, list: readonly string[] | undefined): boolean {
  if (!list || list.length === 0) return false;
  const n = norm(name);
  return list.some((entry) => {
    const e = norm(entry);
    return n === e || n.includes(e) || e.includes(n);
  });
}

function applyRoleAdjustment(role: SauceRole, similarity: number): number {
  switch (role) {
    case "complement": return similarity;
    case "contrast": return 1 - Math.abs(similarity - 0.4);
    case "enhance": return Math.pow(similarity, 0.7);
    case "balance": return 1 - Math.abs(similarity - 0.6);
  }
}

const FLAVOR_CUES: Record<FlavorAxis, readonly string[]> = {
  spicy: [
    "chile", "chili", "spicy", "hot", "pepper", "arrabiata", "wasabi", "yuzu kosho",
    "harissa", "gochujang", "sambal", "berbere", "sichuan", "jalapeno", "habanero", "garam masala",
  ],
  sweet: ["sweet", "honey", "sugar", "mirin", "agrodolce", "teriyaki", "balsamic", "palm sugar", "hoisin", "maple", "molasses"],
  sour: [
    "sour", "vinegar", "lemon", "lime", "yuzu", "tomatillo", "tamarind", "ponzu",
    "pomegranate", "sumac", "citrus", "amchur", "rice vinegar",
  ],
  bitter: ["bitter", "radicchio", "amaro", "olive", "fenugreek", "turmeric", "cocoa", "dark chocolate", "coffee"],
  salty: ["soy", "anchovy", "fish sauce", "miso", "salt", "salted", "cured", "salt cured", "doenjang"],
  umami: [
    "umami", "miso", "mushroom", "truffle", "parmigiano", "anchovy", "dashi", "shoyu",
    "tomato", "fish sauce", "oyster sauce", "doenjang", "kombu", "bonito", "fermented",
  ],
};

function flavorMatchScore(
  sauce: UnifiedSauce,
  targets: FlavorAxis[] | undefined,
): { score: number; matched: FlavorAxis[] } {
  if (!targets || targets.length === 0) return { score: 0.5, matched: [] };
  const matched: FlavorAxis[] = [];
  const haystack = norm([
    sauce.name, sauce.description ?? "", sauce.base ?? "",
    ...(sauce.keyIngredients ?? []), ...(sauce.variants ?? []),
  ].join(" "));
  for (const t of targets) {
    if (FLAVOR_CUES[t].some((c) => haystack.includes(c))) matched.push(t);
  }
  return { score: matched.length / targets.length, matched };
}

function authenticityScore(sauce: UnifiedSauce, ctx: CuisineSauceContext): number {
  if (sauce.ownerCuisine && foldKey(sauce.ownerCuisine) === foldKey(ctx.cuisine)) {
    if (sauce.origin === "mother") return 1.0;
    if (sauce.origin === "traditional") return 0.85;
    if (sauce.origin === "named-only") return 0.65;
  }
  if (sauce.origin === "global" && sauce.ownerCuisine) {
    if (foldKey(sauce.ownerCuisine) === foldKey(ctx.cuisine)) return 0.85;
    return 0.35;
  }
  return 0.4;
}

function dishPairingScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisine: CuisineLike | null,
): { score: number; matches: string[] } {
  if (!cuisine?.sauceRecommender) return { score: 0, matches: [] };
  const sr = cuisine.sauceRecommender;
  const matches: string[] = [];
  let hits = 0;
  let total = 0;

  if (ctx.protein) {
    total += 1;
    if (nameMatchesAny(sauce.name, lookupProteinPairing(sr.forProtein, ctx.protein))) {
      hits += 1;
      matches.push(`protein:${ctx.protein}`);
    }
  }
  if (ctx.vegetable) {
    total += 1;
    if (nameMatchesAny(sauce.name, lookupVegetablePairing(sr.forVegetable, ctx.vegetable))) {
      hits += 1;
      matches.push(`vegetable:${ctx.vegetable}`);
    }
  }
  if (ctx.cookingMethod) {
    total += 1;
    if (nameMatchesAny(sauce.name, lookupMethodPairing(sr.forCookingMethod, ctx.cookingMethod))) {
      hits += 1;
      matches.push(`method:${ctx.cookingMethod}`);
    }
  }
  if (total === 0) return { score: 0.5, matches };
  return { score: hits / total, matches };
}

function regionalScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisine: CuisineLike | null,
): { score: number; matched: boolean } {
  if (!ctx.region || !cuisine?.sauceRecommender?.byRegion) return { score: 0.5, matched: false };
  const candidates = lookupRegionPairing(cuisine.sauceRecommender.byRegion, ctx.region);
  const matched = nameMatchesAny(sauce.name, candidates);
  return { score: matched ? 1.0 : 0.3, matched };
}

function dietaryScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisine: CuisineLike | null,
): { score: number; matched: string[]; failed: string[] } {
  if (!ctx.dietary || ctx.dietary.length === 0) return { score: 1, matched: [], failed: [] };
  const byDietary = cuisine?.sauceRecommender?.byDietary;
  const matched: string[] = [];
  const failed: string[] = [];
  const hasIngredientSignal =
    (sauce.keyIngredients?.length ?? 0) > 0 ||
    (sauce.ingredients?.length ?? 0) > 0 ||
    Boolean(sauce.base);
  const ingredientsText = [
    sauce.name,
    sauce.base ?? "",
    ...(sauce.keyIngredients ?? []),
    ...(sauce.ingredients ?? []),
  ].join(" ");

  let points = 0;
  for (const diet of ctx.dietary) {
    const explicit = byDietary ? lookupPairingValues(byDietary, diet) : [];
    if (nameMatchesAny(sauce.name, explicit)) {
      matched.push(diet);
      points += 1.0;
    } else if (hasIngredientSignal && inferDietaryCompatibility(diet, ingredientsText)) {
      matched.push(diet);
      points += 0.85;
    } else {
      failed.push(diet);
    }
  }

  if (failed.length === 0) {
    return { score: Math.min(1, points / ctx.dietary.length), matched, failed };
  }
  const score = Math.max(0, 1 - failed.length / ctx.dietary.length) * 0.4;
  return { score, matched, failed };
}

function seasonalScore(sauce: UnifiedSauce, ctx: CuisineSauceContext): number {
  const season = ctx.season ?? "all";
  if (!sauce.seasonality) return 0.5;
  const s = sauce.seasonality.toLowerCase();
  if (s.includes("all")) return 1.0;
  if (season === "all") return 0.7;
  const normalizedSeason = season === "fall" ? "autumn" : season;
  return s.includes(normalizedSeason) || s.includes(season) ? 1.0 : 0.35;
}

function computeCosmicTransitScore(
  sauceInfluences: readonly string[],
  cosmic: NonNullable<CuisineSauceContext["cosmic"]>,
  astroElementMatch: boolean,
  zodiacElement?: "Fire" | "Water" | "Earth" | "Air",
): { score: number; hits: string[]; transitNote?: string } {
  const hits: string[] = [];
  let transitNote: string | undefined;
  if (cosmic.planetaryHour && sauceInfluences.includes(norm(cosmic.planetaryHour))) {
    hits.push(`hour ${cosmic.planetaryHour}`);
  }
  if (cosmic.zodiac && sauceInfluences.includes(norm(cosmic.zodiac))) {
    hits.push(`sun ${cosmic.zodiac}`);
  }
  if (astroElementMatch && cosmic.zodiac && zodiacElement) {
    hits.push(`${cosmic.zodiac} (${zodiacElement})`);
    transitNote = `Aligned with ${cosmic.zodiac} (${zodiacElement}) transit`;
  }
  return {
    score: hits.length > 0 ? Math.min(1, 0.6 + hits.length * 0.2) : 0.4,
    hits,
    ...(transitNote !== undefined ? { transitNote } : {}),
  };
}

function astrologicalScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisinePlanetaryResonance: string[],
  byAstrological?: Record<string, string[] | undefined>,
): { score: number; bridges: string[]; transitNote?: string } {
  const sauceInfluences = (sauce.astrologicalInfluences ?? []).map(norm);
  const zodiacElement = elementOfZodiac(ctx.cosmic?.zodiac);
  const byAstroList = zodiacElement && byAstrological ? lookupPairingValues(byAstrological, zodiacElement) : [];
  const astroElementMatch = Boolean(zodiacElement) && nameMatchesAny(sauce.name, byAstroList);
  if (sauceInfluences.length === 0 && !astroElementMatch) return { score: 0.5, bridges: [] };

  const bridges = cuisinePlanetaryResonance
    .filter((planet) => sauceInfluences.includes(norm(planet)))
    .map((planet) => `cuisine ${planet}`);
  const cuisineScore =
    cuisinePlanetaryResonance.length === 0
      ? 0.5
      : Math.min(1, bridges.length / cuisinePlanetaryResonance.length + 0.3);

  if (!ctx.cosmic) return { score: (1 - (ctx.cosmicWeight ?? 0.4)) * cuisineScore + (ctx.cosmicWeight ?? 0.4) * 0.5, bridges };
  const cosmic = computeCosmicTransitScore(sauceInfluences, ctx.cosmic, astroElementMatch, zodiacElement);
  bridges.push(...cosmic.hits);
  const w = ctx.cosmicWeight ?? 0.4;
  return {
    score: (1 - w) * cuisineScore + w * cosmic.score,
    bridges,
    ...(cosmic.transitNote !== undefined ? { transitNote: cosmic.transitNote } : {}),
  };
}

function elementalScore(
  sauce: UnifiedSauce,
  cuisine: CuisineLike | null,
  ctx: CuisineSauceContext,
): { score: number; similarity: number } {
  if (!sauce.elementalProperties || !cuisine?.elementalProperties) {
    return { score: 0.5, similarity: 0.5 };
  }
  let target: ElementalProperties = cuisine.elementalProperties;
  if (ctx.userElementals) {
    // Personalize the comparison target: 70/30 cuisine/user blend,
    // renormalized, keeping classical elements orthogonal to ESMS.
    const u = ctx.userElementals;
    const blended = {
      Fire: target.Fire * 0.7 + u.Fire * 0.3,
      Water: target.Water * 0.7 + u.Water * 0.3,
      Earth: target.Earth * 0.7 + u.Earth * 0.3,
      Air: target.Air * 0.7 + u.Air * 0.3,
    };
    const sum = blended.Fire + blended.Water + blended.Earth + blended.Air || 1;
    target = {
      Fire: blended.Fire / sum,
      Water: blended.Water / sum,
      Earth: blended.Earth / sum,
      Air: blended.Air / sum,
    };
  }
  const sim = cosineSimilarity(sauce.elementalProperties, target);
  const adjusted = applyRoleAdjustment(ctx.role ?? "complement", sim);
  return { score: Math.max(0, Math.min(1, adjusted)), similarity: sim };
}

// ============================================================================
// Public API
// ============================================================================

const DEFAULT_WEIGHTS = {
  cuisineAuthenticity: 0.22,
  dishPairing: 0.20,
  regionalMatch: 0.08,
  dietaryFit: 0.08,
  seasonalResonance: 0.10,
  astrologicalHarmony: 0.12,
  elementalCompatibility: 0.14,
  flavorMatch: 0.06,
};

export interface RecommendOptions {
  strictCuisine?: boolean;
  maxResults?: number;
  minScore?: number;
  weightOverrides?: Partial<typeof DEFAULT_WEIGHTS>;
}

function evaluateSingleSauce(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisine: CuisineLike | null,
  planetaryResonance: string[],
  weights: typeof DEFAULT_WEIGHTS,
): CuisineSauceResult {
  const reasoning: string[] = [];
  const tags: string[] = [];
  const authenticity = authenticityScore(sauce, ctx);
  if (sauce.origin === "mother") {
    reasoning.push(`Mother sauce of ${sauce.ownerCuisine} cuisine`);
    tags.push("Mother sauce");
  } else if (sauce.ownerCuisine && foldKey(sauce.ownerCuisine) === foldKey(ctx.cuisine)) {
    reasoning.push(`Native to ${sauce.ownerCuisine} cuisine`);
    if (sauce.origin === "traditional") tags.push("Traditional");
  }

  const pairing = dishPairingScore(sauce, ctx, cuisine);
  for (const m of pairing.matches) {
    const [axis, val] = m.split(":");
    reasoning.push(`Authentic pairing for ${axis}: ${val}`);
    tags.push(`${axis}:${val}`);
  }
  const regional = regionalScore(sauce, ctx, cuisine);
  if (regional.matched) {
    reasoning.push(`Featured in ${ctx.region} regional cuisine`);
    tags.push(`region:${ctx.region}`);
  }
  const dietary = dietaryScore(sauce, ctx, cuisine);
  tags.push(...dietary.matched);
  if (dietary.failed.length > 0) reasoning.push(`May not satisfy: ${dietary.failed.join(", ")}`);

  const seasonal = seasonalScore(sauce, ctx);
  if (sauce.seasonality && seasonal >= 0.9) reasoning.push(`In season (${sauce.seasonality})`);

  const astro = astrologicalScore(sauce, ctx, planetaryResonance, cuisine?.sauceRecommender?.byAstrological);
  if (astro.transitNote) reasoning.push(astro.transitNote);
  if (astro.bridges.length > 0) reasoning.push(`Astrological resonance via ${astro.bridges.join(", ")}`);

  const elemental = elementalScore(sauce, cuisine, ctx);
  if (elemental.similarity > 0.85) reasoning.push(`Elementally aligned with ${ctx.cuisine}`);
  else if (ctx.role === "contrast" && elemental.similarity < 0.5) reasoning.push("Provides elemental contrast");

  const flavor = flavorMatchScore(sauce, ctx.flavorTargets);
  flavor.matched.forEach((m) => tags.push(`flavor:${m}`));
  if (flavor.matched.length > 0) reasoning.push(`Hits target flavors: ${flavor.matched.join(", ")}`);

  const breakdown: ScoreBreakdown = {
    cuisineAuthenticity: authenticity,
    dishPairing: pairing.score,
    regionalMatch: regional.score,
    dietaryFit: dietary.score,
    seasonalResonance: seasonal,
    astrologicalHarmony: astro.score,
    elementalCompatibility: elemental.score,
    flavorMatch: flavor.score,
  };
  const composite =
    breakdown.cuisineAuthenticity * weights.cuisineAuthenticity +
    breakdown.dishPairing * weights.dishPairing +
    breakdown.regionalMatch * weights.regionalMatch +
    breakdown.dietaryFit * weights.dietaryFit +
    breakdown.seasonalResonance * weights.seasonalResonance +
    breakdown.astrologicalHarmony * weights.astrologicalHarmony +
    breakdown.elementalCompatibility * weights.elementalCompatibility +
    breakdown.flavorMatch * weights.flavorMatch;
  const dietaryHardFail = Boolean(ctx.dietary?.length) && dietary.failed.length === ctx.dietary?.length;
  return { sauce, score: dietaryHardFail ? composite * 0.3 : composite, breakdown, reasoning, tags };
}

export function recommendForCuisineContext(
  ctx: CuisineSauceContext,
  options: RecommendOptions = {},
  cuisinesMapData?: Record<string, unknown>,
): CuisineSauceResult[] {
  const resolved = resolveCuisine(ctx.cuisine, cuisinesMapData);
  const cuisine = resolved?.cuisine ?? null;
  const fingerprint = getCuisineFingerprint(ctx.cuisine, cuisinesMapData);
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weightOverrides ?? {}) };
  const pool = buildCuisineSaucePool(ctx.cuisine, cuisinesMapData);
  const results: CuisineSauceResult[] = [];

  for (const sauce of pool) {
    if (options.strictCuisine && sauce.ownerCuisine && foldKey(sauce.ownerCuisine) !== foldKey(ctx.cuisine)) {
      continue;
    }
    const evaluated = evaluateSingleSauce(sauce, ctx, cuisine, fingerprint?.planetaryResonance ?? [], weights);
    if (evaluated.score >= (options.minScore ?? 0)) results.push(evaluated);
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, options.maxResults ?? 18);
}

export function elementOfZodiac(zodiac?: string): "Fire" | "Water" | "Earth" | "Air" | undefined {
  if (!zodiac) return undefined;
  return ZODIAC_TO_ELEMENT[zodiac.toLowerCase()];
}
