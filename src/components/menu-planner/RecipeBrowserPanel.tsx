"use client";

/**
 * Enhanced Recipe Browser Panel
 * Full-text search, advanced filters, sort options, infinite scroll, and recipe queue
 *
 * @file src/components/menu-planner/RecipeBrowserPanel.tsx
 * @created 2026-01-28 (Session 7)
 */

import { Clock, GripVertical, LoaderCircle, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { getServerRecipes } from "@/actions/recipes";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import { useSpacetimeLiveRecipes } from "@/hooks/useSpacetimeLiveRecipes";
import { useFavoriteRecipes } from "@/lib/recipes/favoriteRecipes";
import { PLANETARY_DAY_RULERS, type DayOfWeek } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import { createLogger } from "@/utils/logger";
import {
  searchRecipes,
  type ScoredRecipe,
  type RecipeSearchOptions,
} from "@/utils/recipeSearchEngine";
import { roundedCalories } from "@/utils/roundedCalories";

const logger = createLogger("RecipeBrowserPanel");

type SortOption =
  | "match-score"
  | "cook-time"
  | "calories"
  | "alphabetical"
  | "newest";

export interface RecipeFilters {
  cuisines: string[];
  dietary: string[];
  maxCookTime?: number;
  difficulty: string[];
  seasonal: boolean;
}

export const EMPTY_FILTERS: RecipeFilters = {
  cuisines: [],
  dietary: [],
  difficulty: [],
  seasonal: false,
};

export function toggleMaxCookTimeFilter(
  prev: RecipeFilters,
  optValue: number,
): RecipeFilters {
  const { maxCookTime: _oldMax, ...rest } = prev;
  return prev.maxCookTime === optValue
    ? rest
    : { ...rest, maxCookTime: optValue };
}

export function toggleDietaryFilter(
  prev: RecipeFilters,
  key: string,
): RecipeFilters {
  return {
    ...prev,
    dietary: prev.dietary.includes(key)
      ? prev.dietary.filter((d) => d !== key)
      : [...prev.dietary, key],
  };
}

export function toggleCuisineFilter(
  prev: RecipeFilters,
  cuisine: string,
): RecipeFilters {
  return {
    ...prev,
    cuisines: prev.cuisines.includes(cuisine)
      ? prev.cuisines.filter((c) => c !== cuisine)
      : [...prev.cuisines, cuisine],
  };
}

const DIETARY_OPTIONS = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "glutenFree", label: "Gluten Free" },
  { key: "dairyFree", label: "Dairy Free" },
  { key: "nutFree", label: "Nut Free" },
  { key: "lowCarb", label: "Low Carb" },
];

const TIME_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

const PAGE_SIZE = 20;

/**
 * Parse a time string like "30 min" or "1 hour" to minutes
 */
function parseTimeStringToMinutes(time?: string): number {
  if (!time) return 999;
  const h = time.match(/(\d+)\s*h/i);
  const m = time.match(/(\d+)\s*m/i);
  let total = 0;
  if (h) total += parseInt(h[1] ?? "", 10) * 60;
  if (m) total += parseInt(m[1] ?? "", 10);
  if (total === 0) {
    const n = parseInt(time, 10);
    if (!isNaN(n)) return n;
  }
  return total || 999;
}

/**
 * Get current season based on month
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

interface RecipeBrowserPanelProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onViewRecipeDetail?: (recipe: Recipe) => void;
  activeElementFilter?: "fire" | "water" | "earth" | "air" | null;
  /** Single-column, borderless layout for the planner's side rail. */
  compact?: boolean;
}

export function getPlanetaryResonance(recipe: Recipe, planet: string): number {
  const props = recipe.elementalProperties || {};
  // Handle casing variations
  const fire = props.Fire ?? props.fire ?? 0.25;
  const water = props.Water ?? props.water ?? 0.25;
  const earth = props.Earth ?? props.earth ?? 0.25;
  const air = props.Air ?? props.air ?? 0.25;

  let baseScore = 70;
  const planetLower = planet.toLowerCase();
  if (planetLower === "sun" || planetLower === "mars") {
    baseScore += (fire - 0.25) * 80;
  } else if (planetLower === "moon" || planetLower === "venus") {
    baseScore += (water - 0.25) * 80;
  } else if (planetLower === "mercury" || planetLower === "jupiter") {
    baseScore += (air - 0.25) * 80;
  } else if (planetLower === "saturn") {
    baseScore += (earth - 0.25) * 80;
  }
  return Math.max(60, Math.min(99, Math.round(baseScore)));
}

export default function RecipeBrowserPanel({
  onSelectRecipe,
  onViewRecipeDetail,
  activeElementFilter = null,
  compact = false,
}: RecipeBrowserPanelProps) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("match-score");
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedTrackedIngredient, setSelectedTrackedIngredient] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { addToQueue, isInQueue } = useRecipeQueue();
  const {
    favoriteIds,
    favoritesData,
    isFavorite,
    toggleFavorite,
    topTrackedIngredients,
    topLikedIngredients,
  } = useFavoriteRecipes();

  // Load recipes
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const recipes = await getServerRecipes();
        setAllRecipes(recipes);
        logger.info(`Loaded ${recipes.length} recipes for browser`);
      } catch (error) {
        logger.error("Failed to load recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  // Live in-module recipes (SpacetimeDB read-path swap; empty unless the
  // NEXT_PUBLIC_SPACETIME_LIVE_CULINARY flag is on and the connection is up).
  // Static catalog stays authoritative — live rows merge in by unseen name.
  const liveRecipes = useSpacetimeLiveRecipes();
  const combinedRecipes = useMemo(() => {
    if (liveRecipes.length === 0) return allRecipes;
    const knownNames = new Set(allRecipes.map((r) => r.name.toLowerCase()));
    const additions = liveRecipes.filter(
      (r) => !knownNames.has(r.name.toLowerCase()),
    );
    return additions.length === 0 ? allRecipes : [...allRecipes, ...additions];
  }, [allRecipes, liveRecipes]);

  // Ensure any favorited recipes stored in favoritesData are available in the browser even if
  // not present in the initial server recipe fetch.
  const allAvailableRecipes = useMemo<Recipe[]>(() => {
    if (favoriteIds.length === 0) return combinedRecipes;
    const knownIds = new Set(combinedRecipes.map((r) => r.id));
    const missing: Recipe[] = [];
    for (const favId of favoriteIds) {
      if (!knownIds.has(favId) && favoritesData[favId]) {
        const fav = favoritesData[favId];
        const elem = fav.elementalProfile ?? {};
        missing.push({
          id: fav.id,
          name: fav.name,
          cuisine: fav.cuisine ?? "Various",
          ingredients: fav.ingredients.map((ing) => ({
            name: ing,
            amount: 1,
            unit: "unit",
          })),
          instructions: [],
          prepTime: "20 min",
          cookTime: "15 min",
          totalTime: "35 min",
          servings: 4,
          elementalProperties: {
            Fire: elem.Fire ?? elem.fire ?? 0.25,
            Water: elem.Water ?? elem.water ?? 0.25,
            Earth: elem.Earth ?? elem.earth ?? 0.25,
            Air: elem.Air ?? elem.air ?? 0.25,
          },
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isDairyFree: false,
        });
      }
    }
    return missing.length > 0 ? [...combinedRecipes, ...missing] : combinedRecipes;
  }, [combinedRecipes, favoriteIds, favoritesData]);

  // Available cuisines from data
  const availableCuisines = useMemo(() => {
    const set = new Set<string>();
    allAvailableRecipes.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine);
    });
    return Array.from(set).sort();
  }, [allAvailableRecipes]);

  // Top staple ingredient chips prioritizing liked ingredients then top tracked
  const topStapleChips = useMemo(() => {
    const map = new Map<string, { name: string; count: number; isLiked: boolean }>();
    for (const item of topLikedIngredients) {
      const lower = item.name.toLowerCase().trim();
      if (lower && !map.has(lower)) {
        map.set(lower, { name: item.name, count: item.count, isLiked: true });
      }
    }
    for (const item of topTrackedIngredients) {
      const lower = item.name.toLowerCase().trim();
      if (lower && !map.has(lower)) {
        map.set(lower, { name: item.name, count: item.count, isLiked: false });
      }
    }
    return Array.from(map.values()).slice(0, 8);
  }, [topLikedIngredients, topTrackedIngredients]);

  // Set of all top favorite ingredient names (normalized lower-case) for affinity checks
  const favoriteIngredientNames = useMemo(() => {
    const set = new Set<string>();
    topLikedIngredients.forEach((i) => {
      const n = i.name.toLowerCase().trim();
      if (n) set.add(n);
    });
    topTrackedIngredients.forEach((i) => {
      const n = i.name.toLowerCase().trim();
      if (n) set.add(n);
    });
    return set;
  }, [topLikedIngredients, topTrackedIngredients]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cuisines.length > 0) count++;
    if (filters.dietary.length > 0) count++;
    if (filters.maxCookTime) count++;
    if (filters.seasonal) count++;
    if (showOnlyFavorites) count++;
    if (selectedTrackedIngredient) count++;
    return count;
  }, [filters, showOnlyFavorites, selectedTrackedIngredient]);

  // Process recipes: search -> filter -> sort
  const processedRecipes = useMemo(() => {
    // Use search engine for query-based search
    const searchOptions: RecipeSearchOptions = {
      limit: 500,
      ...(searchQuery ? { query: searchQuery } : {}),
      ...(filters.cuisines.length > 0 ? { cuisine: filters.cuisines } : {}),
      ...(filters.dietary.includes("vegetarian") ? { isVegetarian: true } : {}),
      ...(filters.dietary.includes("vegan") ? { isVegan: true } : {}),
      ...(filters.dietary.includes("glutenFree") ? { isGlutenFree: true } : {}),
      ...(filters.dietary.includes("dairyFree") ? { isDairyFree: true } : {}),
      ...(filters.maxCookTime !== undefined ? { prepTimeMax: filters.maxCookTime } : {}),
    };

    let results: ScoredRecipe[] = searchRecipes(allAvailableRecipes, searchOptions);

    if (showOnlyFavorites) {
      results = results.filter((recipe) => isFavorite(recipe.id));
    }

    if (selectedTrackedIngredient) {
      const term = selectedTrackedIngredient.toLowerCase().trim();
      results = results.filter((recipe) =>
        recipe.ingredients.some((ing) => {
          const name = (typeof ing === "string" ? ing : ing.name).toLowerCase();
          return name.includes(term);
        }),
      );
    }

    if (activeElementFilter) {
      results = results.filter((recipe) => {
        const props = recipe.elementalProperties || {};
        const key = activeElementFilter.charAt(0).toUpperCase() + activeElementFilter.slice(1);
        const val = props[key] ?? props[activeElementFilter] ?? 0;
        return val > 0.2; // significant presence (>20%)
      });
    }

    // Additional filters not covered by searchRecipes
    if (filters.seasonal) {
      const season = getCurrentSeason();
      results = results.filter(
        (r) =>
          r.season === season ||
          (Array.isArray(r.season) && r.season.includes(season)),
      );
    }

    // Sort
    switch (sortBy) {
      case "match-score":
        results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
        break;
      case "cook-time":
        results.sort(
          (a, b) =>
            parseTimeStringToMinutes(a.totalTime ?? a.prepTime) -
            parseTimeStringToMinutes(b.totalTime ?? b.prepTime),
        );
        break;
      case "calories":
        results.sort(
          (a, b) =>
            (a.nutrition?.calories ?? 999) - (b.nutrition?.calories ?? 999),
        );
        break;
      case "alphabetical":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
        break;
    }

    return results;
  }, [
    allAvailableRecipes,
    searchQuery,
    filters,
    sortBy,
    activeElementFilter,
    showOnlyFavorites,
    selectedTrackedIngredient,
    isFavorite,
  ]);

  const visibleRecipes = processedRecipes.slice(0, displayCount);
  const hasMore = displayCount < processedRecipes.length;

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight * 1.5) {
      setDisplayCount((prev) =>
        Math.min(prev + PAGE_SIZE, processedRecipes.length),
      );
    }
  }, [hasMore, processedRecipes.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [searchQuery, filters, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters(EMPTY_FILTERS);
    setShowOnlyFavorites(false);
    setSelectedTrackedIngredient(null);
  };

  const toggleDietary = (key: string) => {
    setFilters((prev) => toggleDietaryFilter(prev, key));
  };

  const toggleCuisine = (cuisine: string) => {
    setFilters((prev) => toggleCuisineFilter(prev, cuisine));
  };

  const handleToggleFavorite = useCallback(
    async (recipe: Recipe): Promise<void> => {
      const ingNames = recipe.ingredients
        .map((i) => (typeof i === "string" ? i : i.name))
        .filter((n): n is string => Boolean(n));
      await toggleFavorite({
        id: recipe.id,
        name: recipe.name,
        ...(recipe.cuisine ? { cuisine: recipe.cuisine } : {}),
        ...(ingNames.length > 0 ? { ingredients: ingNames } : {}),
      });
    },
    [toggleFavorite],
  );

  return (
    <div
      className={
        compact
          ? "flex flex-col h-full overflow-hidden"
          : "alchm-panel border border-muted flex flex-col h-full rounded-xl overflow-hidden"
      }
    >
      {/* Search Bar */}
      <div className={`${compact ? "px-4 py-3" : "p-4"} border-b border-muted bg-surface-container-low/30`}>
        <div className="relative">
          <input
            type="text"
            aria-label="Search recipes"
            placeholder="Search recipes, ingredients, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 border border-muted bg-surface-container-lowest text-primary rounded-lg focus:border-active-violet focus:outline-none text-sm placeholder:text-on-surface-variant/40"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" aria-hidden />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-on-surface-variant hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">
            {visibleRecipes.length} / {processedRecipes.length} recipes
            {liveRecipes.length > 0 && (
              <span className="ml-2 text-gold-accent" title="Live recipes from the SpacetimeDB culinary engine are merged in">
                ⚡ {liveRecipes.length} live
              </span>
            )}
            {processedRecipes.length !== allAvailableRecipes.length && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-2 text-active-violet hover:text-white font-medium cursor-pointer"
              >
                [Clear filters]
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Filters & Sort Bar */}
      <div className="px-4 py-2 border-b border-muted bg-surface-container-lowest/80 flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors font-mono uppercase cursor-pointer ${
            showFilters || activeFilterCount > 0
              ? "bg-active-violet/20 text-active-violet border border-active-violet/30 shadow-[0_0_8px_rgba(184,90,240,0.15)]"
              : "bg-surface-container-low border border-muted text-on-surface-variant hover:text-primary"
          }`}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-active-violet text-background text-xs rounded-full font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Favorites Filter Toggle */}
        <button
          type="button"
          aria-label="Filter favorites"
          onClick={() => setShowOnlyFavorites((prev) => !prev)}
          aria-pressed={showOnlyFavorites}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors font-mono uppercase cursor-pointer ${
            showOnlyFavorites
              ? "bg-gold-accent/20 text-gold-accent border border-gold-accent/40 shadow-[0_0_8px_rgba(234,179,8,0.2)] font-bold"
              : "bg-surface-container-low border border-muted text-on-surface-variant hover:text-primary"
          }`}
        >
          <span>★</span> Favorites
          {favoriteIds.length > 0 && (
            <span className="px-1.5 py-0.5 bg-gold-accent text-background text-xs rounded-full font-bold">
              {favoriteIds.length}
            </span>
          )}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-1.5 border border-muted bg-surface-container-low text-primary rounded-lg text-sm focus:border-active-violet focus:outline-none font-mono cursor-pointer"
        >
          <option value="match-score">Best Match</option>
          <option value="cook-time">Quickest First</option>
          <option value="calories">Lowest Calories</option>
          <option value="alphabetical">A-Z</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Top Tracked / Liked Ingredients Filter Strip */}
      {topStapleChips.length > 0 && (
        <div
          role="group"
          aria-label="Top favorite ingredients"
          className="px-4 py-2 border-b border-muted bg-surface-container-low/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/70 shrink-0 mr-1">
            Affinity:
          </span>
          {topStapleChips.map((chip) => {
            const isSelected = selectedTrackedIngredient?.toLowerCase() === chip.name.toLowerCase();
            return (
              <button
                key={chip.name}
                type="button"
                onClick={() =>
                  setSelectedTrackedIngredient((prev) =>
                    prev?.toLowerCase() === chip.name.toLowerCase() ? null : chip.name,
                  )
                }
                aria-pressed={isSelected}
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gold-accent text-background font-bold shadow-sm"
                    : "bg-surface-container-high border border-muted text-on-surface-variant hover:border-gold-accent/50 hover:text-primary"
                }`}
                title={`Filter by ${chip.name} (${chip.count} favorite recipes)`}
              >
                <span>{chip.isLiked ? "⭐" : "🌿"}</span>
                <span className="capitalize">{chip.name}</span>
                <span className="text-[10px] opacity-75">({chip.count})</span>
              </button>
            );
          })}
          {selectedTrackedIngredient && (
            <button
              type="button"
              onClick={() => setSelectedTrackedIngredient(null)}
              aria-label="Clear ingredient filter"
              className="shrink-0 text-[11px] text-active-violet hover:underline ml-1 font-mono cursor-pointer"
            >
              [Clear]
            </button>
          )}
        </div>
      )}

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="p-4 border-b border-muted bg-surface-container-low/40 space-y-4">
          {/* Cuisine chips */}
          <div role="group" aria-labelledby="recipe-browser-cuisine-label">
            <span id="recipe-browser-cuisine-label" className="block text-xs font-semibold font-mono uppercase text-on-surface-variant mb-1.5">
              Cuisine
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableCuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => toggleCuisine(cuisine)}
                  aria-pressed={filters.cuisines.includes(cuisine)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium font-mono transition-colors cursor-pointer ${
                    filters.cuisines.includes(cuisine)
                      ? "bg-active-violet text-background font-bold"
                      : "bg-surface-container-lowest border border-muted text-on-surface-variant hover:border-active-violet"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary chips */}
          <div role="group" aria-labelledby="recipe-browser-dietary-label">
            <span id="recipe-browser-dietary-label" className="block text-xs font-semibold font-mono uppercase text-on-surface-variant mb-1.5">
              Dietary
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleDietary(opt.key)}
                  aria-pressed={filters.dietary.includes(opt.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium font-mono transition-colors cursor-pointer ${
                    filters.dietary.includes(opt.key)
                      ? "bg-active-violet text-background font-bold"
                      : "bg-surface-container-lowest border border-muted text-on-surface-variant hover:border-active-violet"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Cook Time */}
          <div className="flex items-center gap-3" role="group" aria-labelledby="recipe-browser-time-label">
            <span id="recipe-browser-time-label" className="text-xs font-semibold font-mono uppercase text-on-surface-variant">
              Max Time:
            </span>
            <div className="flex gap-1.5">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={filters.maxCookTime === opt.value}
                  onClick={() =>
                    setFilters((prev) => toggleMaxCookTimeFilter(prev, opt.value))
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium font-mono transition-colors cursor-pointer ${
                    filters.maxCookTime === opt.value
                      ? "bg-active-violet text-background font-bold"
                      : "bg-surface-container-lowest border border-muted text-on-surface-variant hover:border-active-violet"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seasonal toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.seasonal}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  seasonal: e.target.checked,
                }))
              }
              className="rounded text-active-violet bg-surface-container-lowest border-muted focus:ring-active-violet focus:ring-offset-0"
            />
            <span className="text-xs font-medium font-mono text-on-surface-variant">
              Show seasonal recipes only ({getCurrentSeason()})
            </span>
          </label>
        </div>
      )}

      {/* Recipe Grid */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-surface-container-lowest/20"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center font-mono">
              <LoaderCircle className="mx-auto mb-2 h-8 w-8 animate-spin text-active-violet" aria-hidden />
              <p className="text-on-surface-variant">Loading recipes...</p>
            </div>
          </div>
        ) : processedRecipes.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Search className="mx-auto mb-2 h-8 w-8 text-on-surface-variant/50" aria-hidden />
              <p className="text-primary text-lg mb-2 font-headline-md">No recipes found</p>
              <p className="text-on-surface-variant text-sm mb-4 font-body-sm">
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 border border-active-violet text-active-violet rounded-lg hover:bg-active-violet/10 text-xs font-mono uppercase cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 ${compact ? "gap-2" : "md:grid-cols-2 gap-3"}`}>
              {visibleRecipes.map((recipe) => (
                <BrowserRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={() => onSelectRecipe(recipe)}
                  {...(onViewRecipeDetail
                    ? { onViewDetail: (): void => { onViewRecipeDetail(recipe); } }
                    : {})}
                  onAddToQueue={() =>
                    addToQueue(recipe)
                  }
                  isInQueue={isInQueue(recipe.id)}
                  isFavorite={isFavorite(recipe.id)}
                  onToggleFavorite={() => {
                    handleToggleFavorite(recipe).catch(() => {});
                  }}
                  favoriteIngredientNames={favoriteIngredientNames}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center py-4 text-sm text-on-surface-variant">
                Scroll for more...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const DETAILS_CLASS =
  "px-2 py-1 bg-surface-container-high border border-muted text-primary rounded text-xs hover:border-active-violet transition-colors flex items-center justify-center cursor-pointer";

/**
 * Recipe Card for the browser panel
 */
function BrowserRecipeCard({
  recipe,
  onSelect,
  onViewDetail,
  onAddToQueue,
  isInQueue,
  isFavorite,
  onToggleFavorite,
  favoriteIngredientNames,
}: {
  recipe: ScoredRecipe;
  onSelect: () => void;
  onViewDetail?: () => void;
  onAddToQueue: () => void;
  isInQueue: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favoriteIngredientNames: Set<string>;
}): React.JSX.Element {
  const [showPreview, setShowPreview] = useState(false);

  const todayDow = new Date().getDay() as DayOfWeek;
  const todayPlanet = PLANETARY_DAY_RULERS[todayDow];
  const planetSymbols: Record<string, string> = {
    Sun: "☉",
    Moon: "☽",
    Mars: "♂",
    Mercury: "☿",
    Jupiter: "♃",
    Venus: "♀",
    Saturn: "♄",
  };
  const planetSymbol = planetSymbols[todayPlanet];
  const resonanceScore = getPlanetaryResonance(recipe, todayPlanet);

  const calories = roundedCalories(recipe.nutrition?.calories);

  const matchingFavoriteCount = useMemo((): number => {
    if (favoriteIngredientNames.size === 0) return 0;
    let count = 0;
    for (const ing of recipe.ingredients) {
      const name = (typeof ing === "string" ? ing : ing.name).toLowerCase().trim();
      if (Array.from(favoriteIngredientNames).some((fav) => name.includes(fav) || fav.includes(name))) {
        count++;
      }
    }
    return count;
  }, [recipe.ingredients, favoriteIngredientNames]);

  return (
    <div
      className="relative p-3 rounded-lg border border-muted bg-surface/50 hover:border-active-violet/60 transition-colors duration-200 group"
      onPointerEnter={() => setShowPreview(true)}
      onPointerLeave={() => setShowPreview(false)}
      onFocusCapture={() => setShowPreview(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setShowPreview(false);
        }
      }}
    >
      {/* Top row: name + favorite */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <button
            type="button"
            draggable
            aria-label={`Drag ${recipe.name} to calendar`}
            onDragStart={(e) => {
              // Same wire format as RecipeQueue so board slots accept the drop.
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "queue-recipe", recipe }),
              );
            }}
            className="text-on-surface-variant/40 hover:text-active-violet cursor-grab active:cursor-grabbing p-0.5 rounded shrink-0"
          >
            <GripVertical className="h-3.5 w-3.5" aria-hidden />
          </button>
          <h3 className="font-semibold font-headline-md text-primary text-sm line-clamp-1">
            <Link
              href={`/recipes/${recipe.id}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="hover:text-active-violet hover:underline"
            >
              {recipe.name}
            </Link>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Planetary Match Score (Resonance) */}
          <span 
            className="px-2 py-0.5 rounded bg-gold-accent/10 border border-gold-accent/20 text-gold-accent text-[10px] font-mono font-bold"
            title={`${todayPlanet}-aligned planetary resonance score`}
          >
            {planetSymbol} {resonanceScore}%
          </span>
          <button
            type="button"
            aria-label={isFavorite ? `Remove ${recipe.name} from favorites` : `Add ${recipe.name} to favorites`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`text-sm flex-shrink-0 cursor-pointer p-0.5 rounded transition-colors ${
              isFavorite ? "text-gold-accent hover:text-gold-accent/80" : "text-on-surface-variant/40 hover:text-gold-accent"
            }`}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-mono text-on-surface-variant">
        {recipe.cuisine && (
          <span className="px-1.5 py-0.5 bg-active-violet/10 text-active-violet border border-active-violet/20 rounded">
            {recipe.cuisine}
          </span>
        )}
        {recipe.prepTime && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden /> {recipe.prepTime}
          </span>
        )}
        {calories !== null && (
          <span className="inline-flex items-center gap-1">
            🔥 {calories} cal
          </span>
        )}
      </div>

      {/* Affinity badge */}
      {matchingFavoriteCount > 0 && (
        <div className="mt-1.5 flex items-center">
          <span
            className="px-1.5 py-0.5 bg-gold-accent/10 border border-gold-accent/30 text-gold-accent text-[9px] font-mono rounded inline-flex items-center gap-1 font-semibold"
            title={`Contains ${matchingFavoriteCount} of your top favorite ingredients`}
          >
            <span>★</span> Matches {matchingFavoriteCount} favorite ingredient{matchingFavoriteCount > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Dietary badges */}
      <div className="flex flex-wrap gap-1 mt-1.5 font-mono text-[9px]">
        {recipe.isVegetarian && (
          <span className="px-1 py-0.5 bg-earth-matter/10 text-earth-matter border border-earth-matter/20 rounded">
            VEGETARIAN
          </span>
        )}
        {recipe.isVegan && (
          <span className="px-1 py-0.5 bg-earth-matter/15 text-earth-matter border border-earth-matter/30 rounded">
            VEGAN
          </span>
        )}
        {recipe.isGlutenFree && (
          <span className="px-1 py-0.5 bg-air-substance/10 text-air-substance border border-air-substance/20 rounded">
            GLUTEN FREE
          </span>
        )}
      </div>

      {/* Quick Preview on Hover */}
      {showPreview && recipe.description && (
        <div className="mt-2 text-xs text-on-surface-variant line-clamp-2 border-t border-muted pt-2 font-body-sm">
          {recipe.description}
        </div>
      )}

      {/* Actions — always visible (hover-only actions are unreachable on touch) */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void onSelect();
          }}
          title="Pick a slot on the calendar for this recipe"
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 bg-active-violet/90 text-background rounded text-xs font-semibold hover:bg-active-violet transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add to plan
        </button>
        {!isInQueue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void onAddToQueue();
            }}
            className="px-2 py-1 bg-surface-container-high border border-muted text-primary rounded text-xs hover:border-active-violet transition-colors cursor-pointer"
          >
            Save for later
          </button>
        )}
        {isInQueue && (
          <span className="px-2 py-1 bg-active-violet/10 text-active-violet border border-active-violet/20 rounded text-xs">
            Saved
          </span>
        )}
        {/* Details opens the planner's modal and stays on the page; the
            recipe name above is the link to the full recipe page. */}
        {onViewDetail ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className={DETAILS_CLASS}
          >
            Details
          </button>
        ) : (
          <Link
            href={`/recipes/${recipe.id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={DETAILS_CLASS}
          >
            Details
          </Link>
        )}
      </div>
    </div>
  );
}
