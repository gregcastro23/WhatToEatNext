/**
 * Ingredient Index
 *
 * Lazy-initialized flat index over the project's ingredient database. Used by
 * server-side routes that need to surface ingredients aligned with the current
 * dominant element or a planetary set (e.g. injecting grounded suggestions
 * into the cosmic-recipe LLM prompt).
 *
 * The flatten/compile step is deferred until the first call so Next.js route
 * handlers that never use this module don't pay the cost.
 */

import { allIngredients } from "@/data/ingredients";
import type { ElementalProperties } from "@/types/alchemy";
import type { ClassicalElement } from "@/utils/astrology/signElement";

export interface IndexedIngredient {
  name: string;
  category: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: string[];
  };
}

let cache: IndexedIngredient[] | null = null;

function normalizeElementalProperties(
  value: unknown,
): ElementalProperties | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const fire = Number(source.Fire ?? source.fire ?? 0);
  const water = Number(source.Water ?? source.water ?? 0);
  const earth = Number(source.Earth ?? source.earth ?? 0);
  const air = Number(source.Air ?? source.air ?? 0);
  if (!Number.isFinite(fire + water + earth + air)) return null;
  return { Fire: fire, Water: water, Earth: earth, Air: air };
}

function buildIndex(): IndexedIngredient[] {
  const out: IndexedIngredient[] = [];
  for (const [key, raw] of Object.entries(allIngredients ?? {})) {
    if (!raw) continue;
    const ingredient = raw as unknown as Record<string, unknown>;
    const elemental = normalizeElementalProperties(ingredient.elementalProperties);
    if (!elemental) continue;
    const name = String(ingredient.name ?? key);
    const category = String(ingredient.category ?? "uncategorized");

    const astro = ingredient.astrologicalProfile as
      | Record<string, unknown>
      | undefined;
    const rulingPlanets = Array.isArray(astro?.rulingPlanets)
      ? (astro.rulingPlanets as unknown[]).map(String)
      : undefined;
    const favorableZodiac = Array.isArray(astro?.zodiacAffinity)
      ? (astro.zodiacAffinity as unknown[]).map(String)
      : undefined;

    out.push({
      name,
      category,
      elementalProperties: elemental,
      astrologicalProfile:
        rulingPlanets || favorableZodiac
          ? { rulingPlanets, favorableZodiac }
          : undefined,
    });
  }
  return out;
}

function getCache(): IndexedIngredient[] {
  if (!cache) cache = buildIndex();
  return cache;
}

/** Returns every indexed ingredient. Order is not guaranteed. */
export function getAllIndexedIngredients(): IndexedIngredient[] {
  return getCache();
}

/**
 * Returns the top `n` ingredients by raw score on the supplied element,
 * tie-broken by having a lower value on the competing elements.
 */
export function findTopIngredientsForElement(
  element: ClassicalElement,
  n = 6,
): IndexedIngredient[] {
  const limit = Math.max(1, n | 0);
  const scored = getCache()
    .map((ingredient) => {
      const value = Number(ingredient.elementalProperties[element] ?? 0);
      return { ingredient, value };
    })
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);
  return scored.slice(0, limit).map((entry) => entry.ingredient);
}

/**
 * Returns up to `n` ingredients whose astrological profile names any of the
 * supplied planets. Matches are case-insensitive on planet names and are
 * ranked by the count of matching planets, descending.
 */
export function findIngredientsMatchingPlanets(
  planets: string[],
  n = 6,
): IndexedIngredient[] {
  if (!planets?.length) return [];
  const limit = Math.max(1, n | 0);
  const targets = new Set(planets.map((planet) => planet.toLowerCase()));

  const scored: Array<{ ingredient: IndexedIngredient; matches: number }> = [];
  for (const ingredient of getCache()) {
    const ruling = ingredient.astrologicalProfile?.rulingPlanets ?? [];
    if (!ruling.length) continue;
    let matches = 0;
    for (const planet of ruling) {
      if (targets.has(planet.toLowerCase())) matches += 1;
    }
    if (matches > 0) scored.push({ ingredient, matches });
  }

  scored.sort((a, b) => b.matches - a.matches);
  return scored.slice(0, limit).map((entry) => entry.ingredient);
}
