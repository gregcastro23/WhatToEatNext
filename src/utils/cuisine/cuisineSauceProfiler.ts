/**
 * Cuisine Sauce Profiler
 *
 * Bridges the rich per-cuisine data model (mother sauces, traditional sauces,
 * sauceRecommender pairing maps, regional cuisines, planetary resonance) with
 * the global sauce catalog (`allSauces`) and the intelligent recommender's
 * thermodynamic scoring.
 */

import { cuisineFlavorProfiles } from "@/data/cuisineFlavorProfiles";
import { cuisinesMap } from "@/data/cuisines";
import { allSauces, type Sauce as DataSauce } from "@/data/sauces";
import type { ElementalProperties } from "@/types/alchemy";
import type { Cuisine } from "@/types/cuisine";
import { normalizeForDisplay } from "@/utils/elemental/normalization";
import { aggregateIngredientElementals } from "@/utils/hierarchicalRecipeCalculations";
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
// Cuisine fingerprint
// ============================================================================

/**
 * Look up a cuisine by user-facing name (case-insensitive).
 */
function resolveCuisine(key: string, cuisinesMapData?: Record<string, any>): { cuisine: Cuisine; canonicalKey: string } | null {
  if (!key) return null;
  const map = cuisinesMapData || cuisinesMap;

  if (map[key]) return { cuisine: map[key], canonicalKey: key };

  const titled = key
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  if (map[titled]) return { cuisine: map[titled], canonicalKey: titled };

  const lower = key.toLowerCase();
  if (map[lower]) return { cuisine: map[lower], canonicalKey: lower };

  const collapsed = key.replace(/\s+/g, "");
  if (map[collapsed]) return { cuisine: map[collapsed], canonicalKey: collapsed };

  return null;
}

export function getCuisineFingerprint(cuisineKey: string, cuisinesMapData?: Record<string, any>): CuisineFingerprint | null {
  const resolved = resolveCuisine(cuisineKey, cuisinesMapData);
  if (!resolved) return null;
  const { cuisine, canonicalKey } = resolved;

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

export function listCuisines(cuisinesMapData?: Record<string, any>): Array<{ key: string; name: string }> {
  const map = cuisinesMapData || cuisinesMap;
  return [
    "Italian", "French", "Japanese", "Mexican", "Thai", "Chinese", "Indian",
    "Greek", "Korean", "Vietnamese", "Middle Eastern", "American", "African", "Russian",
  ]
    .filter((k) => map[k])
    .map((k) => ({ key: k, name: map[k].name || k }));
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

function enhanceSauceWithDynamicProperties(sauce: UnifiedSauce): UnifiedSauce {
  const ingredientsArray = sauce.ingredients || sauce.keyIngredients || [];
  if (ingredientsArray.length === 0) return sauce;

  const recipeIngs = ingredientsArray.map(name => ({
    name,
    amount: "1",
    unit: "part"
  }));

  const rawElementals = aggregateIngredientElementals(recipeIngs as any);

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

export function buildCuisineSaucePool(cuisineKey: string, cuisinesMapData?: Record<string, any>): UnifiedSauce[] {
  const resolved = resolveCuisine(cuisineKey, cuisinesMapData);
  const pool = new Map<string, UnifiedSauce>();

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
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
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
    case "complement": return similarity;
    case "contrast": return 1 - Math.abs(similarity - 0.4);
    case "enhance": return Math.pow(similarity, 0.7);
    case "balance": return 1 - Math.abs(similarity - 0.6);
  }
}

function flavorMatchScore(sauce: UnifiedSauce, targets: FlavorAxis[] | undefined): { score: number; matched: FlavorAxis[] } {
  if (!targets || targets.length === 0) return { score: 0.5, matched: [] };
  const matched: FlavorAxis[] = [];
  const haystack = norm([
    sauce.name, sauce.description ?? "", sauce.base ?? "",
    ...(sauce.keyIngredients ?? []), ...(sauce.variants ?? []),
  ].join(" "));
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
    return 0.35;
  }
  return 0.4;
}

function dishPairingScore(sauce: UnifiedSauce, ctx: CuisineSauceContext, cuisine: Cuisine | null): { score: number; matches: string[] } {
  if (!cuisine || !cuisine.sauceRecommender) return { score: 0, matches: [] };
  const sr = cuisine.sauceRecommender;
  const matches: string[] = [];
  let hits = 0, total = 0;
  if (ctx.protein) {
    total += 1;
    if (nameMatchesAny(sauce.name, sr.forProtein?.[ctx.protein.toLowerCase()])) {
      hits += 1; matches.push(`protein:${ctx.protein}`);
    }
  }
  if (ctx.vegetable) {
    total += 1;
    if (nameMatchesAny(sauce.name, sr.forVegetable?.[ctx.vegetable.toLowerCase()])) {
      hits += 1; matches.push(`vegetable:${ctx.vegetable}`);
    }
  }
  if (ctx.cookingMethod) {
    total += 1;
    if (nameMatchesAny(sauce.name, sr.forCookingMethod?.[ctx.cookingMethod.toLowerCase()])) {
      hits += 1; matches.push(`method:${ctx.cookingMethod}`);
    }
  }
  if (total === 0) return { score: 0.5, matches };
  return { score: hits / total, matches };
}

function regionalScore(sauce: UnifiedSauce, ctx: CuisineSauceContext, cuisine: Cuisine | null): { score: number; matched: boolean } {
  if (!ctx.region || !cuisine?.sauceRecommender?.byRegion) return { score: 0.5, matched: false };
  const matched = nameMatchesAny(sauce.name, cuisine.sauceRecommender.byRegion[ctx.region.toLowerCase()]);
  return { score: matched ? 1.0 : 0.3, matched };
}

function dietaryScore(sauce: UnifiedSauce, ctx: CuisineSauceContext, cuisine: Cuisine | null): { score: number; matched: string[]; failed: string[] } {
  if (!ctx.dietary || ctx.dietary.length === 0) return { score: 1, matched: [], failed: [] };
  if (!cuisine?.sauceRecommender?.byDietary) return { score: 0.5, matched: [], failed: [] };
  const matched: string[] = [], failed: string[] = [];
  for (const diet of ctx.dietary) {
    if (nameMatchesAny(sauce.name, cuisine.sauceRecommender.byDietary[diet])) matched.push(diet);
    else failed.push(diet);
  }
  const score = failed.length === 0 ? 1 : Math.max(0, 1 - failed.length / ctx.dietary.length) * 0.4;
  return { score, matched, failed };
}

function seasonalScore(sauce: UnifiedSauce, ctx: CuisineSauceContext): number {
  const season = ctx.season ?? "all";
  if (!sauce.seasonality) return 0.5;
  const s = sauce.seasonality.toLowerCase();
  if (s.includes("all")) return 1.0;
  if (season === "all") return 0.7;
  return s.includes(season) ? 1.0 : 0.35;
}

function astrologicalScore(sauce: UnifiedSauce, ctx: CuisineSauceContext, cuisinePlanetaryResonance: string[]): { score: number; bridges: string[] } {
  const sauceInfluences = (sauce.astrologicalInfluences ?? []).map(norm);
  if (sauceInfluences.length === 0) return { score: 0.5, bridges: [] };
  const bridges: string[] = [];
  let cuisineHits = 0;
  for (const planet of cuisinePlanetaryResonance) {
    if (sauceInfluences.includes(norm(planet))) {
      cuisineHits += 1; bridges.push(`cuisine ${planet}`);
    }
  }
  const cuisineScore = cuisinePlanetaryResonance.length === 0 ? 0.5 : Math.min(1, cuisineHits / cuisinePlanetaryResonance.length + 0.3);
  let cosmicScore = 0.5;
  if (ctx.cosmic) {
    const cosmicHits: string[] = [];
    if (ctx.cosmic.planetaryHour && sauceInfluences.includes(norm(ctx.cosmic.planetaryHour))) cosmicHits.push(`hour ${ctx.cosmic.planetaryHour}`);
    if (ctx.cosmic.zodiac && sauceInfluences.includes(norm(ctx.cosmic.zodiac))) cosmicHits.push(`sun ${ctx.cosmic.zodiac}`);
    if (cosmicHits.length > 0) { cosmicScore = Math.min(1, 0.6 + cosmicHits.length * 0.2); bridges.push(...cosmicHits); }
    else cosmicScore = 0.4;
  }
  const w = ctx.cosmicWeight ?? 0.4;
  return { score: (1 - w) * cuisineScore + w * cosmicScore, bridges };
}

function elementalScore(sauce: UnifiedSauce, cuisine: Cuisine | null, ctx: CuisineSauceContext): { score: number; similarity: number } {
  if (!sauce.elementalProperties || !cuisine?.elementalProperties) return { score: 0.5, similarity: 0.5 };
  const sim = cosineSimilarity(sauce.elementalProperties, cuisine.elementalProperties as ElementalProperties);
  const adjusted = applyRoleAdjustment(ctx.role ?? "complement", sim);
  return { score: Math.max(0, Math.min(1, adjusted)), similarity: sim };
}

// ============================================================================
// Public API
// ============================================================================

const DEFAULT_WEIGHTS = {
  cuisineAuthenticity: 0.22, dishPairing: 0.20, regionalMatch: 0.08,
  dietaryFit: 0.08, seasonalResonance: 0.10, astrologicalHarmony: 0.12,
  elementalCompatibility: 0.14, flavorMatch: 0.06,
};

export interface RecommendOptions {
  strictCuisine?: boolean;
  maxResults?: number;
  minScore?: number;
  weightOverrides?: Partial<typeof DEFAULT_WEIGHTS>;
}

export function recommendForCuisineContext(
  ctx: CuisineSauceContext,
  options: RecommendOptions = {},
  cuisinesMapData?: Record<string, any>,
): CuisineSauceResult[] {
  const resolved = resolveCuisine(ctx.cuisine, cuisinesMapData);
  const cuisine = resolved?.cuisine ?? null;
  const fingerprint = getCuisineFingerprint(ctx.cuisine, cuisinesMapData);
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weightOverrides ?? {}) };

  const pool = buildCuisineSaucePool(ctx.cuisine, cuisinesMapData);
  const results: CuisineSauceResult[] = [];

  for (const sauce of pool) {
    if (options.strictCuisine && sauce.ownerCuisine && sauce.ownerCuisine.toLowerCase() !== ctx.cuisine.toLowerCase()) continue;

    const reasoning: string[] = [], tags: string[] = [];
    const authenticity = authenticityScore(sauce, ctx);
    if (sauce.origin === "mother") { reasoning.push(`Mother sauce of ${sauce.ownerCuisine} cuisine`); tags.push("Mother sauce"); }
    else if (sauce.ownerCuisine && sauce.ownerCuisine.toLowerCase() === ctx.cuisine.toLowerCase()) {
      reasoning.push(`Native to ${sauce.ownerCuisine} cuisine`);
      if (sauce.origin === "traditional") tags.push("Traditional");
    }

    const pairing = dishPairingScore(sauce, ctx, cuisine);
    pairing.matches.forEach((m) => {
      const [axis, val] = m.split(":");
      reasoning.push(`Authentic pairing for ${axis}: ${val}`);
      tags.push(`${axis}:${val}`);
    });

    const regional = regionalScore(sauce, ctx, cuisine);
    if (regional.matched) { reasoning.push(`Featured in ${ctx.region} regional cuisine`); tags.push(`region:${ctx.region}`); }

    const dietary = dietaryScore(sauce, ctx, cuisine);
    dietary.matched.forEach((d) => tags.push(d));
    if (dietary.failed.length > 0) reasoning.push(`May not satisfy: ${dietary.failed.join(", ")}`);

    const seasonal = seasonalScore(sauce, ctx);
    if (sauce.seasonality && seasonal >= 0.9) reasoning.push(`In season (${sauce.seasonality})`);

    const astro = astrologicalScore(sauce, ctx, fingerprint?.planetaryResonance ?? []);
    if (astro.bridges.length > 0) reasoning.push(`Astrological resonance via ${astro.bridges.join(", ")}`);

    const elemental = elementalScore(sauce, cuisine, ctx);
    if (elemental.similarity > 0.85) reasoning.push(`Elementally aligned with ${ctx.cuisine}`);
    else if (ctx.role === "contrast" && elemental.similarity < 0.5) reasoning.push(`Provides elemental contrast`);

    const flavor = flavorMatchScore(sauce, ctx.flavorTargets);
    flavor.matched.forEach((m) => tags.push(`flavor:${m}`));
    if (flavor.matched.length > 0) reasoning.push(`Hits target flavors: ${flavor.matched.join(", ")}`);

    const breakdown: ScoreBreakdown = {
      cuisineAuthenticity: authenticity, dishPairing: pairing.score, regionalMatch: regional.score,
      dietaryFit: dietary.score, seasonalResonance: seasonal, astrologicalHarmony: astro.score,
      elementalCompatibility: elemental.score, flavorMatch: flavor.score,
    };

    const composite = breakdown.cuisineAuthenticity * weights.cuisineAuthenticity +
      breakdown.dishPairing * weights.dishPairing +
      breakdown.regionalMatch * weights.regionalMatch +
      breakdown.dietaryFit * weights.dietaryFit +
      breakdown.seasonalResonance * weights.seasonalResonance +
      breakdown.astrologicalHarmony * weights.astrologicalHarmony +
      breakdown.elementalCompatibility * weights.elementalCompatibility +
      breakdown.flavorMatch * weights.flavorMatch;

    const dietaryHardFail = ctx.dietary && ctx.dietary.length > 0 && dietary.failed.length === ctx.dietary.length;
    const score = dietaryHardFail ? composite * 0.3 : composite;
    if (score < (options.minScore ?? 0)) continue;
    results.push({ sauce, score, breakdown, reasoning, tags });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, options.maxResults ?? 18);
}

export function elementOfZodiac(zodiac?: string): "Fire" | "Water" | "Earth" | "Air" | undefined {
  if (!zodiac) return undefined;
  return ZODIAC_TO_ELEMENT[zodiac.toLowerCase()];
}
