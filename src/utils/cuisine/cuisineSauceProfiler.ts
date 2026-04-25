/**
 * Cuisine Sauce Profiler
 *
 * Bridges the rich per-cuisine data model (mother sauces, traditional sauces,
 * sauceRecommender pairing maps, regional cuisines, planetary resonance) with
 * the global sauce catalog (`allSauces`) and the intelligent recommender's
 * thermodynamic scoring.
 *
 * The result is a multi-axis scoring pipeline that ranks sauces by:
 *   • Cuisine authenticity   — mother → traditional → recommended → other
 *   • Dish pairing           — protein, vegetable, cooking method maps
 *   • Regional alignment     — region-specific preferences
 *   • Dietary fit            — vegetarian/vegan/GF/etc. preferences
 *   • Seasonal resonance     — sauce season vs. selected season
 *   • Astrological harmony   — sauce planets vs. cuisine + current moment
 *   • Elemental compatibility — cosine similarity with cuisine profile
 *   • Flavor-target match    — taste-axis (umami/spicy/sweet/sour/bitter/salty)
 *
 * All inputs are typed; outputs include detailed reasoning so the UI can
 * surface a transparent breakdown of "why this sauce".
 */

import { cuisineFlavorProfiles } from "@/data/cuisineFlavorProfiles";
import { cuisinesMap } from "@/data/cuisines";
import { allSauces, type Sauce as DataSauce } from "@/data/sauces";
import type { ElementalProperties } from "@/types/alchemy";
import type { Cuisine } from "@/types/cuisine";
import { aggregateIngredientElementals } from "@/utils/hierarchicalRecipeCalculations";
import { normalizeForDisplay } from "@/utils/elemental/normalization";
import {
  calculateThermodynamicMetrics,
  elementalToAlchemicalApproximation
} from "@/utils/monicaKalchmCalculations";

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
  /** Cuisine key as it appears in `cuisinesMap` (e.g. "Italian"). */
  cuisine: string;
  /** Optional region (key from cuisine.regionalCuisines). */
  region?: string;
  /** Protein category: beef, chicken, pork, fish, seafood, tofu, vegetarian, vegetables, etc. */
  protein?: string;
  /** Vegetable category: leafy, root, nightshades, squash, mushroom, seaweed, etc. */
  vegetable?: string;
  /** Cooking method: grilling, baking, frying, braising, steaming, etc. */
  cookingMethod?: string;
  /** Dietary preferences. Multiple allowed; sauce must satisfy all selected. */
  dietary?: string[];
  /** Season override. Defaults to detected season. */
  season?: "spring" | "summer" | "fall" | "autumn" | "winter" | "all";
  /** Target flavor axes the user wants emphasized. */
  flavorTargets?: FlavorAxis[];
  /** Sauce role relative to the dish. */
  role?: SauceRole;
  /**
   * Live planetary state (zodiac, hour, day/night). When provided, sauces
   * resonating with the moment receive a small boost.
   */
  cosmic?: {
    zodiac?: string;
    planetaryHour?: string;
    isDaytime?: boolean;
    lunarPhase?: string;
  };
  /** Whether to weight cosmic fit. Defaults to false. */
  cosmicWeight?: number;
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
  /** Stable id (allSauces key for global sauces, prefixed key for cuisine-only). */
  id: string;
  /** Display name. */
  name: string;
  /** Where the data comes from. */
  origin: "mother" | "traditional" | "global" | "named-only";
  /** Owning cuisine key, if any. */
  ownerCuisine?: string;
  description?: string;
  base?: string;
  keyIngredients?: string[];
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
  /** Has a fully-specified dataSauce entry in allSauces (for batch scaling, nutrition, etc.). */
  dataKey?: string;
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
  /** Final composite score in [0, 1]. */
  score: number;
  /** Per-dimension scores. */
  breakdown: ScoreBreakdown;
  /** Human-readable reasoning lines. */
  reasoning: string[];
  /** Tags surfaced for UI badges. */
  tags: string[];
}

// ============================================================================
// Cuisine fingerprint
// ============================================================================

/**
 * Look up a cuisine by user-facing name (case-insensitive, allowing common
 * normalizations like "Middle Eastern" → "middleEastern").
 */
function resolveCuisine(key: string): { cuisine: Cuisine; canonicalKey: string } | null {
  if (!key) return null;
  const map = cuisinesMap as Record<string, Cuisine>;

  // Direct hit
  if (map[key]) return { cuisine: map[key], canonicalKey: key };

  // Try titlecase, lowercase, no-space variants
  const titled = key
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  if (map[titled]) return { cuisine: map[titled], canonicalKey: titled };

  const lower = key.toLowerCase();
  if (map[lower]) return { cuisine: map[lower], canonicalKey: lower };

  // collapse spaces
  const collapsed = key.replace(/\s+/g, "");
  if (map[collapsed]) return { cuisine: map[collapsed], canonicalKey: collapsed };

  return null;
}

/**
 * Aggregate all human-readable axes for a cuisine into a single fingerprint
 * the UI can render (regions, diets, methods, etc.).
 */
export function getCuisineFingerprint(cuisineKey: string): CuisineFingerprint | null {
  const resolved = resolveCuisine(cuisineKey);
  if (!resolved) return null;
  const { cuisine, canonicalKey } = resolved;

  // Try to enrich with cuisineFlavorProfiles (keyed lowercase usually)
  const profileKey = Object.keys(cuisineFlavorProfiles).find(
    (k) => k.toLowerCase() === canonicalKey.toLowerCase(),
  );
  const profile = profileKey ? cuisineFlavorProfiles[profileKey] : undefined;

  const regionalEntries = cuisine.regionalCuisines
    ? Array.isArray(cuisine.regionalCuisines)
      ? cuisine.regionalCuisines.map((r: any, i: number) => ({
        key: String(i),
        name: r?.name ?? String(i),
        description: r?.description,
        signature: r?.signature ?? r?.signatureDishes,
      }))
      : Object.entries(cuisine.regionalCuisines).map(([k, r]: [string, any]) => ({
        key: k,
        name: r?.name ?? k,
        description: r?.description,
        signature: r?.signature ?? r?.signatureDishes,
      }))
    : [];

  const sr = cuisine.sauceRecommender ?? {
    forProtein: {},
    forVegetable: {},
    forCookingMethod: {},
    byAstrological: {},
    byRegion: {},
    byDietary: {},
  };

  return {
    key: canonicalKey,
    name: cuisine.name || canonicalKey,
    description: cuisine.description,
    elementalProperties: (cuisine.elementalProperties as ElementalProperties) ?? {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    },
    planetaryResonance: profile?.planetaryResonance ?? [],
    signatureTechniques: profile?.signatureTechniques ?? [],
    signatureIngredients: profile?.signatureIngredients ?? [],
    flavorProfile: profile?.flavorProfiles,
    seasonalPreference: profile?.seasonalPreference ?? [],
    regions: regionalEntries,
    motherSauceCount: cuisine.motherSauces ? Object.keys(cuisine.motherSauces).length : 0,
    traditionalSauceCount: cuisine.traditionalSauces
      ? Object.keys(cuisine.traditionalSauces).length
      : 0,
    pairingAxes: {
      proteins: Object.keys(sr.forProtein ?? {}),
      vegetables: Object.keys(sr.forVegetable ?? {}),
      cookingMethods: Object.keys(sr.forCookingMethod ?? {}),
      regions: Object.keys(sr.byRegion ?? {}),
      diets: Object.keys(sr.byDietary ?? {}),
    },
  };
}

/** All cuisines available for the recommender, in display order. */
export function listCuisines(): Array<{ key: string; name: string }> {
  return [
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
  ]
    .filter((k) => (cuisinesMap as Record<string, Cuisine>)[k])
    .map((k) => ({ key: k, name: (cuisinesMap as Record<string, Cuisine>)[k].name || k }));
}

// ============================================================================
// Sauce pool construction
// ============================================================================

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Build a quick lookup so name-references can be matched to data sauces. */
function buildAllSauceIndex() {
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

/**
 * Convert a per-cuisine sauce object (mother or traditional) into a
 * UnifiedSauce, preferring richer data from `allSauces` when available.
 */
function fromCuisineSauce(
  ownerCuisine: string,
  origin: "mother" | "traditional",
  key: string,
  raw: any,
): UnifiedSauce {
  const richer = findDataSauce(raw?.name ?? key);
  const merged: any = richer ? { ...richer.sauce, ...raw } : raw ?? {};
  return {
    id: `${ownerCuisine}:${origin}:${key}`,
    name: raw?.name ?? key,
    origin,
    ownerCuisine,
    description: merged.description,
    base: merged.base,
    keyIngredients: merged.keyIngredients,
    variants: merged.variants ?? merged.derivatives,
    elementalProperties: merged.elementalProperties,
    astrologicalInfluences: merged.astrologicalInfluences,
    seasonality: merged.seasonality,
    preparationNotes: merged.preparationNotes,
    technicalTips: merged.technicalTips,
    difficulty: merged.difficulty,
    prepTime: merged.prepTime,
    cookTime: merged.cookTime,
    yield: merged.yield,
    ingredients: merged.ingredients,
    preparationSteps: merged.preparationSteps,
    storageInstructions: merged.storageInstructions,
    alchemicalProperties: merged.alchemicalProperties,
    thermodynamicProperties: merged.thermodynamicProperties,
    nutritionalProfile: merged.nutritionalProfile,
    dataKey: richer?.key,
  };
}

function fromGlobalSauce(key: string, sauce: DataSauce): UnifiedSauce {
  return {
    id: `global:${key}`,
    name: sauce.name,
    origin: "global",
    ownerCuisine: sauce.cuisine,
    description: sauce.description,
    base: sauce.base,
    keyIngredients: sauce.keyIngredients,
    variants: sauce.variants,
    elementalProperties: sauce.elementalProperties,
    astrologicalInfluences: sauce.astrologicalInfluences,
    seasonality: sauce.seasonality,
    preparationNotes: sauce.preparationNotes,
    technicalTips: sauce.technicalTips,
    difficulty: sauce.difficulty,
    prepTime: sauce.prepTime,
    cookTime: sauce.cookTime,
    yield: sauce.yield,
    ingredients: sauce.ingredients,
    preparationSteps: sauce.preparationSteps,
    storageInstructions: sauce.storageInstructions,
    alchemicalProperties: sauce.alchemicalProperties,
    thermodynamicProperties: sauce.thermodynamicProperties,
    nutritionalProfile: sauce.nutritionalProfile,
    dataKey: key,
  };
}

/**
 * Dynamically infuses a UnifiedSauce with cutting-edge elemental and
 * thermodynamic calculations if it has ingredients, replacing stagnant defaults.
 */
function enhanceSauceWithDynamicProperties(sauce: UnifiedSauce): UnifiedSauce {
  const ingredientsArray = sauce.ingredients || sauce.keyIngredients || [];
  if (ingredientsArray.length === 0) return sauce;

  // Create recipe-style ingredients for the aggregation engine
  const recipeIngs = ingredientsArray.map(name => ({
    name,
    amount: "1",
    unit: "part"
  }));

  const rawElementals = aggregateIngredientElementals(recipeIngs as any);

  // If zero (e.g. ingredients not recognized), fallback to existing
  if (rawElementals.Fire === 0 && rawElementals.Water === 0 && rawElementals.Earth === 0 && rawElementals.Air === 0) {
    return sauce;
  }

  const elementalProperties = normalizeForDisplay(rawElementals);
  const alchemicalProperties = sauce.alchemicalProperties || elementalToAlchemicalApproximation(elementalProperties);
  const thermodynamicProperties = calculateThermodynamicMetrics(alchemicalProperties, elementalProperties);

  return {
    ...sauce,
    elementalProperties,
    alchemicalProperties,
    thermodynamicProperties
  };
}

/**
 * Build the candidate pool for a given context. Pulls:
 *   - All mother + traditional sauces of the chosen cuisine (rich data)
 *   - All globally-cataloged sauces (rich data)
 *   - Named-only references from this cuisine's sauceRecommender that don't
 *     resolve to either of the above (placeholders so they still appear in
 *     authentic-pairing search results)
 *
 * Returns deduplicated UnifiedSauces keyed by normalized name.
 */
export function buildCuisineSaucePool(cuisineKey: string): UnifiedSauce[] {
  const resolved = resolveCuisine(cuisineKey);
  const pool = new Map<string, UnifiedSauce>();

  // 1) Cuisine-specific mother + traditional sauces
  if (resolved) {
    const { cuisine, canonicalKey } = resolved;
    if (cuisine.motherSauces) {
      for (const [k, raw] of Object.entries(cuisine.motherSauces)) {
        const u = enhanceSauceWithDynamicProperties(fromCuisineSauce(canonicalKey, "mother", k, raw));
        pool.set(norm(u.name), u);
      }
    }
    if (cuisine.traditionalSauces) {
      for (const [k, raw] of Object.entries(cuisine.traditionalSauces)) {
        const key = norm((raw as any)?.name ?? k);
        if (!pool.has(key)) {
          const u = enhanceSauceWithDynamicProperties(fromCuisineSauce(canonicalKey, "traditional", k, raw));
          pool.set(key, u);
        }
      }
    }

    // 2) Named references from sauceRecommender — add as placeholders if
    //    not already present (so they can still be returned for authentic
    //    pairings even without rich data).
    const sr = cuisine.sauceRecommender;
    if (sr) {
      const allNamedRefs = new Set<string>();
      const collect = (m: Record<string, string[]> | undefined) => {
        if (!m) return;
        Object.values(m).forEach((arr) => arr.forEach((n) => allNamedRefs.add(n)));
      };
      collect(sr.forProtein);
      collect(sr.forVegetable);
      collect(sr.forCookingMethod);
      collect(sr.byAstrological);
      collect(sr.byRegion);
      collect(sr.byDietary);

      for (const name of allNamedRefs) {
        const k = norm(name);
        if (pool.has(k)) continue;
        const richer = findDataSauce(name);
        if (richer) {
          pool.set(k, enhanceSauceWithDynamicProperties(fromGlobalSauce(richer.key, richer.sauce)));
        } else {
          pool.set(k, {
            id: `${canonicalKey}:named:${k}`,
            name,
            origin: "named-only",
            ownerCuisine: canonicalKey,
          });
        }
      }
    }
  }

  // 3) Global sauces from allSauces — add anything not already present
  for (const [key, sauce] of Object.entries(allSauces)) {
    const k = norm(sauce.name);
    if (!pool.has(k)) pool.set(k, enhanceSauceWithDynamicProperties(fromGlobalSauce(key, sauce)));
  }

  return Array.from(pool.values());
}

// ============================================================================
// Scoring
// ============================================================================

const ZODIAC_TO_ELEMENT: Record<string, "Fire" | "Water" | "Earth" | "Air"> = {
  aries: "Fire",
  leo: "Fire",
  sagittarius: "Fire",
  taurus: "Earth",
  virgo: "Earth",
  capricorn: "Earth",
  gemini: "Air",
  libra: "Air",
  aquarius: "Air",
  cancer: "Water",
  scorpio: "Water",
  pisces: "Water",
};

function cosineSimilarity(a: ElementalProperties, b: ElementalProperties): number {
  const ax = [a.Fire ?? 0, a.Water ?? 0, a.Earth ?? 0, a.Air ?? 0];
  const bx = [b.Fire ?? 0, b.Water ?? 0, b.Earth ?? 0, b.Air ?? 0];
  const dot = ax.reduce((s, v, i) => s + v * bx[i], 0);
  const magA = Math.sqrt(ax.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(bx.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function nameMatchesAny(name: string, list: string[] | undefined): boolean {
  if (!list || list.length === 0) return false;
  const n = norm(name);
  return list.some((entry) => {
    const e = norm(entry);
    return n === e || n.includes(e) || e.includes(n);
  });
}

function applyRoleAdjustment(role: SauceRole, similarity: number): number {
  switch (role) {
    case "complement":
      return similarity;
    case "contrast":
      // Reward divergence, but not extreme
      return 1 - Math.abs(similarity - 0.4);
    case "enhance":
      return Math.pow(similarity, 0.7); // amplify mid-similarity
    case "balance":
      // Best around mid similarity
      return 1 - Math.abs(similarity - 0.6);
  }
}

function flavorMatchScore(
  sauce: UnifiedSauce,
  targets: FlavorAxis[] | undefined,
): { score: number; matched: FlavorAxis[] } {
  if (!targets || targets.length === 0) return { score: 0.5, matched: [] };
  const matched: FlavorAxis[] = [];
  const haystack = norm(
    [
      sauce.name,
      sauce.description ?? "",
      sauce.base ?? "",
      ...(sauce.keyIngredients ?? []),
      ...(sauce.variants ?? []),
    ].join(" "),
  );
  const cues: Record<FlavorAxis, string[]> = {
    spicy: ["chile", "chili", "spicy", "hot", "pepper", "arrabiata", "wasabi", "yuzu kosho", "harissa"],
    sweet: ["sweet", "honey", "sugar", "mirin", "agrodolce", "teriyaki", "balsamic"],
    sour: ["sour", "vinegar", "lemon", "lime", "yuzu", "tomatillo", "tamarind", "ponzu"],
    bitter: ["bitter", "radicchio", "amaro", "olive", "fenugreek"],
    salty: ["soy", "anchovy", "fish sauce", "miso", "salt", "salted", "cured", "salt-cured"],
    umami: ["umami", "miso", "mushroom", "truffle", "parmigiano", "anchovy", "dashi", "shoyu", "tomato"],
  };
  for (const t of targets) {
    if (cues[t].some((c) => haystack.includes(c))) matched.push(t);
  }
  return { score: matched.length / targets.length, matched };
}

function authenticityScore(sauce: UnifiedSauce, ctx: CuisineSauceContext): number {
  if (sauce.ownerCuisine && sauce.ownerCuisine.toLowerCase() === ctx.cuisine.toLowerCase()) {
    if (sauce.origin === "mother") return 1.0;
    if (sauce.origin === "traditional") return 0.85;
    if (sauce.origin === "named-only") return 0.65;
  }
  if (sauce.origin === "global" && sauce.ownerCuisine) {
    if (sauce.ownerCuisine.toLowerCase() === ctx.cuisine.toLowerCase()) return 0.85;
    return 0.35; // Global sauce from a different cuisine
  }
  return 0.4;
}

function dishPairingScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisine: Cuisine | null,
): { score: number; matches: string[] } {
  if (!cuisine || !cuisine.sauceRecommender) return { score: 0, matches: [] };
  const sr = cuisine.sauceRecommender;
  const matches: string[] = [];
  let hits = 0;
  let total = 0;

  if (ctx.protein) {
    total += 1;
    const list = sr.forProtein?.[ctx.protein.toLowerCase()];
    if (nameMatchesAny(sauce.name, list)) {
      hits += 1;
      matches.push(`protein:${ctx.protein}`);
    }
  }
  if (ctx.vegetable) {
    total += 1;
    const list = sr.forVegetable?.[ctx.vegetable.toLowerCase()];
    if (nameMatchesAny(sauce.name, list)) {
      hits += 1;
      matches.push(`vegetable:${ctx.vegetable}`);
    }
  }
  if (ctx.cookingMethod) {
    total += 1;
    const list = sr.forCookingMethod?.[ctx.cookingMethod.toLowerCase()];
    if (nameMatchesAny(sauce.name, list)) {
      hits += 1;
      matches.push(`method:${ctx.cookingMethod}`);
    }
  }
  if (total === 0) return { score: 0.5, matches }; // no constraints → neutral
  return { score: hits / total, matches };
}

function regionalScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisine: Cuisine | null,
): { score: number; matched: boolean } {
  if (!ctx.region || !cuisine?.sauceRecommender?.byRegion) {
    return { score: 0.5, matched: false };
  }
  const list = cuisine.sauceRecommender.byRegion[ctx.region.toLowerCase()];
  const matched = nameMatchesAny(sauce.name, list);
  return { score: matched ? 1.0 : 0.3, matched };
}

function dietaryScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisine: Cuisine | null,
): { score: number; matched: string[]; failed: string[] } {
  if (!ctx.dietary || ctx.dietary.length === 0)
    return { score: 1, matched: [], failed: [] };
  if (!cuisine?.sauceRecommender?.byDietary)
    return { score: 0.5, matched: [], failed: [] };

  const matched: string[] = [];
  const failed: string[] = [];
  for (const diet of ctx.dietary) {
    const list = cuisine.sauceRecommender.byDietary[diet];
    if (nameMatchesAny(sauce.name, list)) matched.push(diet);
    else failed.push(diet);
  }
  // All required diets must match (or the sauce loses heavily)
  const score =
    failed.length === 0 ? 1 : Math.max(0, 1 - failed.length / ctx.dietary.length) * 0.4;
  return { score, matched, failed };
}

function seasonalScore(sauce: UnifiedSauce, ctx: CuisineSauceContext): number {
  const season = ctx.season ?? "all";
  if (!sauce.seasonality) return 0.5;
  const s = sauce.seasonality.toLowerCase();
  if (s.includes("all")) return 1.0;
  if (season === "all") return 0.7;
  // Seasonality strings are sometimes like "summer, autumn"
  return s.includes(season) ? 1.0 : 0.35;
}

function astrologicalScore(
  sauce: UnifiedSauce,
  ctx: CuisineSauceContext,
  cuisinePlanetaryResonance: string[],
): { score: number; bridges: string[] } {
  const sauceInfluences = (sauce.astrologicalInfluences ?? []).map(norm);
  if (sauceInfluences.length === 0) return { score: 0.5, bridges: [] };

  const bridges: string[] = [];

  // Cuisine planetary resonance
  let cuisineHits = 0;
  for (const planet of cuisinePlanetaryResonance) {
    if (sauceInfluences.includes(norm(planet))) {
      cuisineHits += 1;
      bridges.push(`cuisine ${planet}`);
    }
  }
  const cuisineScore =
    cuisinePlanetaryResonance.length === 0
      ? 0.5
      : Math.min(1, cuisineHits / cuisinePlanetaryResonance.length + 0.3);

  // Cosmic moment
  let cosmicScore = 0.5;
  if (ctx.cosmic) {
    const cosmicHits: string[] = [];
    if (ctx.cosmic.planetaryHour && sauceInfluences.includes(norm(ctx.cosmic.planetaryHour))) {
      cosmicHits.push(`hour ${ctx.cosmic.planetaryHour}`);
    }
    if (ctx.cosmic.zodiac && sauceInfluences.includes(norm(ctx.cosmic.zodiac))) {
      cosmicHits.push(`sun ${ctx.cosmic.zodiac}`);
    }
    if (cosmicHits.length > 0) {
      cosmicScore = Math.min(1, 0.6 + cosmicHits.length * 0.2);
      bridges.push(...cosmicHits);
    } else {
      cosmicScore = 0.4;
    }
  }
  const w = ctx.cosmicWeight ?? 0.4;
  return { score: (1 - w) * cuisineScore + w * cosmicScore, bridges };
}

function elementalScore(
  sauce: UnifiedSauce,
  cuisine: Cuisine | null,
  ctx: CuisineSauceContext,
): { score: number; similarity: number } {
  if (!sauce.elementalProperties || !cuisine?.elementalProperties) {
    return { score: 0.5, similarity: 0.5 };
  }
  const sim = cosineSimilarity(
    sauce.elementalProperties,
    cuisine.elementalProperties as ElementalProperties,
  );
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
  /** Exclude sauces from other cuisines entirely. Defaults to false. */
  strictCuisine?: boolean;
  /** Maximum results returned. Defaults to 18. */
  maxResults?: number;
  /** Minimum composite score, [0,1]. Defaults to 0. */
  minScore?: number;
  /** Override scoring weights. */
  weightOverrides?: Partial<typeof DEFAULT_WEIGHTS>;
}

/**
 * Score every sauce in the unified pool against the supplied context.
 * Returns sorted, sliced results with detailed breakdowns.
 */
export function recommendForCuisineContext(
  ctx: CuisineSauceContext,
  options: RecommendOptions = {},
): CuisineSauceResult[] {
  const resolved = resolveCuisine(ctx.cuisine);
  const cuisine = resolved?.cuisine ?? null;
  const fingerprint = getCuisineFingerprint(ctx.cuisine);
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weightOverrides ?? {}) };

  const pool = buildCuisineSaucePool(ctx.cuisine);

  const results: CuisineSauceResult[] = [];

  for (const sauce of pool) {
    if (
      options.strictCuisine &&
      sauce.ownerCuisine &&
      sauce.ownerCuisine.toLowerCase() !== ctx.cuisine.toLowerCase()
    ) {
      continue;
    }

    const reasoning: string[] = [];
    const tags: string[] = [];

    // Authenticity
    const authenticity = authenticityScore(sauce, ctx);
    if (sauce.origin === "mother") {
      reasoning.push(`Mother sauce of ${sauce.ownerCuisine} cuisine`);
      tags.push("Mother sauce");
    } else if (
      sauce.ownerCuisine &&
      sauce.ownerCuisine.toLowerCase() === ctx.cuisine.toLowerCase()
    ) {
      reasoning.push(`Native to ${sauce.ownerCuisine} cuisine`);
      if (sauce.origin === "traditional") tags.push("Traditional");
    }

    // Dish pairing
    const pairing = dishPairingScore(sauce, ctx, cuisine);
    pairing.matches.forEach((m) => {
      const [axis, val] = m.split(":");
      reasoning.push(`Authentic pairing for ${axis}: ${val}`);
      tags.push(`${axis}:${val}`);
    });

    // Regional
    const regional = regionalScore(sauce, ctx, cuisine);
    if (regional.matched) {
      reasoning.push(`Featured in ${ctx.region} regional cuisine`);
      tags.push(`region:${ctx.region}`);
    }

    // Dietary
    const dietary = dietaryScore(sauce, ctx, cuisine);
    dietary.matched.forEach((d) => tags.push(d));
    if (dietary.failed.length > 0) {
      reasoning.push(`May not satisfy: ${dietary.failed.join(", ")}`);
    }

    // Seasonal
    const seasonal = seasonalScore(sauce, ctx);
    if (sauce.seasonality && seasonal >= 0.9) {
      reasoning.push(`In season (${sauce.seasonality})`);
    }

    // Astrological
    const astro = astrologicalScore(sauce, ctx, fingerprint?.planetaryResonance ?? []);
    if (astro.bridges.length > 0) {
      reasoning.push(
        `Astrological resonance via ${astro.bridges.join(", ")}`,
      );
    }

    // Elemental
    const elemental = elementalScore(sauce, cuisine, ctx);
    if (elemental.similarity > 0.85) {
      reasoning.push(`Elementally aligned with ${ctx.cuisine}`);
    } else if (ctx.role === "contrast" && elemental.similarity < 0.5) {
      reasoning.push(`Provides elemental contrast`);
    }

    // Flavor
    const flavor = flavorMatchScore(sauce, ctx.flavorTargets);
    flavor.matched.forEach((m) => tags.push(`flavor:${m}`));
    if (flavor.matched.length > 0) {
      reasoning.push(`Hits target flavors: ${flavor.matched.join(", ")}`);
    }

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

    // Hard filter: dietary failure tanks the result completely
    const dietaryHardFail =
      ctx.dietary && ctx.dietary.length > 0 && dietary.failed.length === ctx.dietary.length;

    const score = dietaryHardFail ? composite * 0.3 : composite;

    if (score < (options.minScore ?? 0)) continue;

    results.push({
      sauce,
      score,
      breakdown,
      reasoning,
      tags,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, options.maxResults ?? 18);
}

/** Element of zodiac sign, used for cosmic-moment scoring outside this module. */
export function elementOfZodiac(zodiac?: string): "Fire" | "Water" | "Earth" | "Air" | undefined {
  if (!zodiac) return undefined;
  return ZODIAC_TO_ELEMENT[zodiac.toLowerCase()];
}
