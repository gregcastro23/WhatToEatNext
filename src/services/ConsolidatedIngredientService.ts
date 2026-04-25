/**
 * Consolidated Ingredient Service
 *
 * Real implementation that delegates to the authoritative `IngredientService`
 * (which owns the unified ingredient registry). This class exists as a
 * thin, Promise-returning facade for adapters that expect async methods.
 */

import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import type { ElementalProperties, PlanetName } from "@/types/alchemy";
import { IngredientService } from "./IngredientService";
import {
  calculateElementalSimilarity,
  normalizeElementalProperties,
} from "./RecipeElementalService";

interface IngredientCriteria {
  elementalPreference?: Partial<ElementalProperties>;
  flavorProfile?: Record<string, number>;
  rulingPlanets?: string[];
  season?: string | string[];
  searchQuery?: string;
  categories?: string[];
}

interface IngredientFilters {
  categories?: string[];
  excludeCategories?: string[];
  minKalchm?: number;
  maxKalchm?: number;
  rulingPlanet?: string;
}

function matchesCategory(ing: UnifiedIngredient, categories?: string[]): boolean {
  if (!categories || categories.length === 0) return true;
  return categories.some(
    (c) => c.toLowerCase() === (ing.category ?? "").toLowerCase(),
  );
}

function hasPlanetaryRuler(ing: UnifiedIngredient, planet: string): boolean {
  const target = planet.toLowerCase();
  if (ing.planetaryRuler && ing.planetaryRuler.toString().toLowerCase() === target) {
    return true;
  }
  const rulers = ing.astrologicalProfile?.rulingPlanets;
  if (!rulers) return false;
  return rulers.some((p) => p.toString().toLowerCase() === target);
}

export class ConsolidatedIngredientService {
  private static instance: ConsolidatedIngredientService;
  private core: IngredientService;

  private constructor() {
    this.core = IngredientService.getInstance();
  }

  public static getInstance(): ConsolidatedIngredientService {
    if (!ConsolidatedIngredientService.instance) {
      ConsolidatedIngredientService.instance =
        new ConsolidatedIngredientService();
    }
    return ConsolidatedIngredientService.instance;
  }

  /**
   * Return the full unified ingredient registry as a flat array.
   */
  async getIngredients(): Promise<UnifiedIngredient[]> {
    try {
      return this.core.getAllIngredientsFlat();
    } catch {
      return [];
    }
  }

  async searchIngredients(query: string): Promise<UnifiedIngredient[]> {
    try {
      const all = this.core.getAllIngredientsFlat();
      if (!query || !query.trim()) return all;
      const q = query.toLowerCase().trim();
      return all.filter((ing) => {
        if (ing.name?.toLowerCase().includes(q)) return true;
        if (ing.category?.toLowerCase().includes(q)) return true;
        if (ing.subcategory?.toLowerCase().includes(q)) return true;
        if (ing.description?.toLowerCase().includes(q)) return true;
        if (ing.qualities?.some((t) => t.toLowerCase().includes(q))) return true;
        if (ing.tags?.some((t) => t.toLowerCase().includes(q))) return true;
        return false;
      });
    } catch {
      return [];
    }
  }

  /**
   * Rank ingredients against the provided criteria. Scoring combines
   * elemental match, optional planetary ruler match, and flavor profile
   * similarity.
   */
  async getRecommendedIngredients(
    /**
     * Accepts either a criteria object OR a bare ElementalProperties map.
     * The latter is how `IngredientServiceAdapter` calls into this service.
     */
    criteriaOrElements:
      | IngredientCriteria
      | Partial<ElementalProperties>
      | null
      | undefined,
    options?: { limit?: number; maxResults?: number },
  ): Promise<UnifiedIngredient[]> {
    try {
      const all = this.core.getAllIngredientsFlat();
      const limit = options?.limit ?? options?.maxResults ?? 20;

      // If the caller passed bare ElementalProperties, translate it into a
      // criteria object so the rest of the pipeline is uniform.
      const looksLikeElements =
        criteriaOrElements &&
        !("elementalPreference" in (criteriaOrElements as IngredientCriteria)) &&
        !("flavorProfile" in (criteriaOrElements as IngredientCriteria)) &&
        !("rulingPlanets" in (criteriaOrElements as IngredientCriteria)) &&
        ("Fire" in (criteriaOrElements as ElementalProperties) ||
          "Water" in (criteriaOrElements as ElementalProperties) ||
          "Earth" in (criteriaOrElements as ElementalProperties) ||
          "Air" in (criteriaOrElements as ElementalProperties));
      const criteria: IngredientCriteria = looksLikeElements
        ? {
            elementalPreference:
              criteriaOrElements as Partial<ElementalProperties>,
          }
        : ((criteriaOrElements as IngredientCriteria) ?? {});

      const preferredPlanets = (criteria.rulingPlanets ?? []).map((p) =>
        p.toLowerCase(),
      );

      const scored = all
        .filter((ing) => matchesCategory(ing, criteria.categories))
        .filter((ing) => {
          if (!criteria.searchQuery) return true;
          const q = criteria.searchQuery.toLowerCase();
          return (
            (ing.name ?? "").toLowerCase().includes(q) ||
            (ing.description ?? "").toLowerCase().includes(q)
          );
        })
        .map((ing) => {
          let score = 0.5;

          if (criteria.elementalPreference) {
            const raw = calculateElementalSimilarity(
              ing.elementalProperties,
              criteria.elementalPreference,
            );
            // Compress into [0.7, 1.0] per "no opposing elements" rule
            score += (0.7 + raw * 0.3) * 0.3;
          }

          if (preferredPlanets.length > 0) {
            const matchesPlanet = preferredPlanets.some((p) =>
              hasPlanetaryRuler(ing, p),
            );
            if (matchesPlanet) score += 0.2;
          }

          if (criteria.flavorProfile && ing.flavorProfile) {
            let flavorScore = 0;
            let count = 0;
            for (const [flavor, desired] of Object.entries(
              criteria.flavorProfile,
            )) {
              const actual = ing.flavorProfile[flavor];
              if (typeof actual !== "number") continue;
              flavorScore += 1 - Math.abs(actual - desired);
              count++;
            }
            if (count > 0) score += (flavorScore / count) * 0.15;
          }

          return { ing, score };
        });

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit).map((s) => s.ing);
    } catch {
      return [];
    }
  }

  /**
   * Return ingredients whose astrological profile or `planetaryRuler` matches
   * the given planet.
   */
  async getIngredientsByPlanet(
    planet: PlanetName | string,
  ): Promise<UnifiedIngredient[]> {
    try {
      const target = planet?.toString().toLowerCase();
      if (!target) return [];
      const all = this.core.getAllIngredientsFlat();
      return all.filter((ing) => hasPlanetaryRuler(ing, target));
    } catch {
      return [];
    }
  }

  /**
   * Find ingredients that pair well with the supplied one. Uses elemental
   * similarity (compressed) + shared planetary ruler as the signal.
   */
  async findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults = 10,
  ): Promise<UnifiedIngredient[]> {
    try {
      const all = this.core.getAllIngredientsFlat();
      const base =
        typeof ingredient === "string"
          ? this.core.getIngredientByName(ingredient)
          : ingredient;
      if (!base) return [];

      const baseElements = normalizeElementalProperties(base.elementalProperties);
      const basePlanets = (base.astrologicalProfile?.rulingPlanets ?? []).map((p) =>
        p.toString().toLowerCase(),
      );
      if (base.planetaryRuler) {
        basePlanets.push(base.planetaryRuler.toString().toLowerCase());
      }

      const scored = all
        .filter((ing) => ing.name !== base.name)
        .map((ing) => {
          const raw = calculateElementalSimilarity(
            ing.elementalProperties,
            baseElements,
          );
          let score = 0.7 + raw * 0.3; // element similarity (compressed)
          if (basePlanets.length > 0) {
            const matched = basePlanets.some((p) => hasPlanetaryRuler(ing, p));
            if (matched) score += 0.1;
          }
          // Prefer different categories to nudge variety
          if (ing.category !== base.category) score += 0.05;
          return { ing, score };
        })
        .sort((a, b) => b.score - a.score);
      return scored.slice(0, maxResults).map((s) => s.ing);
    } catch {
      return [];
    }
  }

  async filterIngredients(
    filters: IngredientFilters,
  ): Promise<UnifiedIngredient[]> {
    try {
      let list = this.core.getAllIngredientsFlat();

      if (filters.categories && filters.categories.length > 0) {
        const wanted = filters.categories.map((c) => c.toLowerCase());
        list = list.filter((ing) =>
          wanted.includes((ing.category ?? "").toLowerCase()),
        );
      }
      if (filters.excludeCategories && filters.excludeCategories.length > 0) {
        const excluded = filters.excludeCategories.map((c) => c.toLowerCase());
        list = list.filter(
          (ing) => !excluded.includes((ing.category ?? "").toLowerCase()),
        );
      }
      if (typeof filters.minKalchm === "number") {
        list = list.filter((ing) => (ing.kalchm ?? 0) >= filters.minKalchm!);
      }
      if (typeof filters.maxKalchm === "number") {
        list = list.filter((ing) => (ing.kalchm ?? Infinity) <= filters.maxKalchm!);
      }
      if (filters.rulingPlanet) {
        const p = filters.rulingPlanet.toLowerCase();
        list = list.filter((ing) => hasPlanetaryRuler(ing, p));
      }
      return list;
    } catch {
      return [];
    }
  }
}

export const consolidatedIngredientService =
  ConsolidatedIngredientService.getInstance();
