/**
 * Solar Return → recipe picker.
 *
 * Bridges the cuisine matches produced by `calculateSolarCuisineMatches`
 * to concrete recipes from the catalog. Pure + synchronous so it can be
 * unit-tested without a database; the caller supplies the recipe list.
 *
 * Scoring (per recipe):
 *   - cuisine rank weight  (50%) — recipe's cuisine among the top matches
 *   - elemental harmony    (40%) — recipe elements vs. return-chart elements
 *   - seasonal alignment   (10%) — recipe season vs. return Sun's season
 *   - tiny deterministic jitter keyed on `seed` so ties resolve to a stable
 *     but date-specific "recipe of that day".
 */
import type { Recipe } from "@/types/recipe";

interface Elements {
  Fire?: number;
  Water?: number;
  Earth?: number;
  Air?: number;
}

export interface SolarReturnRecipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  image?: string;
  /** Name of the solar-return cuisine match this recipe came from (null = elemental-only fallback). */
  matchedCuisine: string | null;
  /** 0–100 harmonic score. */
  matchPercentage: number;
  reasons: string[];
}

export interface CuisineMatchLike {
  id: string;
  name: string;
}

interface ScoredEntry {
  recipe: Recipe;
  rank: number | undefined;
  raw: number;
  harmony: number;
  inSeason: boolean;
}

const RANK_WEIGHTS = [1, 0.85, 0.7, 0.55];
const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
/** Max picks per cuisine so alternates span several matched cuisines. */
const MAX_PER_CUISINE = 2;

/**
 * Regional cuisine profiles whose recipes live under a broader catalog label
 * (the catalog files Cantonese/Sichuanese dishes as "Chinese").
 */
const CUISINE_ALIASES: Record<string, string[]> = {
  cantonese: ["chinese"],
  sichuanese: ["chinese"],
  sichuan: ["chinese"],
};

function normalizeKey(value: string | undefined | null): string {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** "Authentic Olivier Salad (Russian)" → "oliviersalad" — collapses catalog near-duplicates. */
function dishKey(name: string): string {
  return normalizeKey(
    name
      .toLowerCase()
      .replace(/\([^)]*\)/g, "")
      .replace(/\b(authentic|classic|traditional)\b/g, ""),
  );
}

function normalizeElements(e: Elements | undefined): Record<(typeof ELEMENTS)[number], number> {
  const raw = ELEMENTS.map((k) => Math.max(0, Number(e?.[k]) || 0));
  const sum = raw.reduce((a, b) => a + b, 0);
  const out = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  if (sum <= 0) return out;
  ELEMENTS.forEach((k, i) => {
    out[k] = (raw[i] ?? 0) / sum;
  });
  return out;
}

function elementalHarmony(a: Elements | undefined, b: Elements | undefined): number {
  const na = normalizeElements(a);
  const nb = normalizeElements(b);
  let diff = 0;
  for (const k of ELEMENTS) diff += Math.abs(na[k] - nb[k]);
  return Math.max(0, 1 - diff / 2);
}

/** FNV-1a → [0, 1). Deterministic per (seed, id). */
function hashUnit(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

function seasonMatches(recipeSeason: Recipe["season"], season: string): boolean {
  if (!recipeSeason) return false;
  const list = Array.isArray(recipeSeason) ? recipeSeason : [recipeSeason];
  const s = season.toLowerCase();
  return list.some((v) => {
    const lv = String(v).toLowerCase();
    return lv === s || lv === "all" || (s === "autumn" && lv === "fall");
  });
}

function dominantElement(e: Elements | undefined): string {
  const n = normalizeElements(e);
  return ELEMENTS.reduce<(typeof ELEMENTS)[number]>((best, k) => (n[k] > n[best] ? k : best), "Fire");
}

function buildRankMap(cuisineMatches: readonly CuisineMatchLike[]): Map<string, number> {
  const rankByKey = new Map<string, number>();
  cuisineMatches.forEach((c, i) => {
    const keys = [normalizeKey(c.id), normalizeKey(c.name)];
    for (const k of [...keys]) keys.push(...(CUISINE_ALIASES[k] ?? []));
    for (const key of keys) {
      if (key && !rankByKey.has(key)) rankByKey.set(key, i);
    }
  });
  return rankByKey;
}

function scoreRecipe(
  recipe: Recipe,
  rank: number | undefined,
  chartElements: Elements,
  season: string,
  seed: string,
): { raw: number; harmony: number; inSeason: boolean } {
  const cuisineWeight = rank === undefined ? 0 : (RANK_WEIGHTS[rank] ?? 0.4);
  const harmony = elementalHarmony(recipe.elementalProperties, chartElements);
  const inSeason = seasonMatches(recipe.season, season);
  const jitter = hashUnit(`${seed}:${recipe.id}`) * 0.04;
  const raw = cuisineWeight * 0.5 + harmony * 0.4 + (inSeason ? 0.1 : 0) + jitter;
  return { raw, harmony, inSeason };
}

function collectScoredEntries(
  recipes: readonly Recipe[],
  rankByKey: Map<string, number>,
  chartElements: Elements,
  season: string,
  seed: string,
  useCuisine: boolean,
): ScoredEntry[] {
  const out: ScoredEntry[] = [];
  for (const recipe of recipes) {
    if (!recipe.id || !recipe.name) continue;
    const rank = rankByKey.get(normalizeKey(recipe.cuisine));
    if (useCuisine && rank === undefined) continue;
    out.push({ recipe, rank: useCuisine ? rank : undefined, ...scoreRecipe(recipe, rank, chartElements, season, seed) });
  }
  return out;
}

function selectDeduplicatedPicks(scored: ScoredEntry[], limit: number): ScoredEntry[] {
  const picked: ScoredEntry[] = [];
  const seenDishes = new Set<string>();
  const perCuisine = new Map<string, number>();
  const leftovers: ScoredEntry[] = [];

  for (const entry of scored) {
    if (picked.length >= limit) break;
    const dish = dishKey(entry.recipe.name);
    if (seenDishes.has(dish)) continue;
    const cuisineKey = normalizeKey(entry.recipe.cuisine);
    const count = perCuisine.get(cuisineKey) ?? 0;
    if (count >= MAX_PER_CUISINE) {
      leftovers.push(entry);
      continue;
    }
    seenDishes.add(dish);
    perCuisine.set(cuisineKey, count + 1);
    picked.push(entry);
  }

  for (const entry of leftovers) {
    if (picked.length >= limit) break;
    const dish = dishKey(entry.recipe.name);
    if (seenDishes.has(dish)) continue;
    seenDishes.add(dish);
    picked.push(entry);
  }

  picked.sort((a, b) => b.raw - a.raw);
  return picked;
}

function formatReturnRecipe(
  entry: ScoredEntry,
  cuisineMatches: readonly CuisineMatchLike[],
  chartDominant: string,
  season: string,
): SolarReturnRecipe {
  const { recipe, rank, raw, harmony, inSeason } = entry;
  const matched = rank === undefined ? null : (cuisineMatches[rank]?.name ?? null);
  const reasons: string[] = [];
  if (matched) reasons.push(`${matched} is a top cuisine match for this solar return`);
  reasons.push(`${Math.round(harmony * 100)}% elemental harmony with the ${chartDominant}-leaning return chart`);
  if (inSeason) reasons.push(`In season for ${season}`);

  const description = recipe.description
    ? recipe.description.length > 180
      ? `${recipe.description.slice(0, 177)}…`
      : recipe.description
    : undefined;
  const image = recipe.image ?? recipe.imageUrl;

  return {
    id: String(recipe.id),
    name: recipe.name,
    ...(description ? { description } : {}),
    ...(recipe.cuisine ? { cuisine: recipe.cuisine } : {}),
    ...(image ? { image } : {}),
    matchedCuisine: matched,
    matchPercentage: Math.max(1, Math.min(99, Math.round(raw * 100))),
    reasons,
  };
}

export function pickSolarReturnRecipes(
  recipes: readonly Recipe[],
  cuisineMatches: readonly CuisineMatchLike[],
  chartElements: Elements,
  season: string,
  seed: string,
  limit = 6,
): SolarReturnRecipe[] {
  if (recipes.length === 0 || limit <= 0) return [];

  const rankByKey = buildRankMap(cuisineMatches);
  const chartDominant = dominantElement(chartElements);

  let scored = collectScoredEntries(recipes, rankByKey, chartElements, season, seed, true);
  if (scored.length === 0) {
    scored = collectScoredEntries(recipes, rankByKey, chartElements, season, seed, false);
  }
  scored.sort((a, b) => b.raw - a.raw);

  const picked = selectDeduplicatedPicks(scored, limit);
  return picked.map((entry) => formatReturnRecipe(entry, cuisineMatches, chartDominant, season));
}
