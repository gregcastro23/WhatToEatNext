"use client";

/**
 * Enhanced Recipe Browser Panel
 * Full-text search, advanced filters, sort options, infinite scroll, and recipe queue
 *
 * @file src/components/menu-planner/RecipeBrowserPanel.tsx
 * @created 2026-01-28 (Session 7)
 */

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
import { useRecipeCollections } from "@/hooks/useRecipeCollections";
import type { Recipe } from "@/types/recipe";
import { PLANETARY_DAY_RULERS, type DayOfWeek } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";
import {
  searchRecipes,
  type ScoredRecipe,
  type RecipeSearchOptions,
} from "@/utils/recipeSearchEngine";

const logger = createLogger("RecipeBrowserPanel");

type SortOption =
  | "match-score"
  | "cook-time"
  | "calories"
  | "alphabetical"
  | "newest";

interface RecipeFilters {
  cuisines: string[];
  dietary: string[];
  maxCookTime?: number;
  difficulty: string[];
  seasonal: boolean;
}

const EMPTY_FILTERS: RecipeFilters = {
  cuisines: [],
  dietary: [],
  maxCookTime: undefined,
  difficulty: [],
  seasonal: false,
};

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
  if (h) total += parseInt(h[1], 10) * 60;
  if (m) total += parseInt(m[1], 10);
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
}: RecipeBrowserPanelProps) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("match-score");
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { addToQueue, isInQueue } = useRecipeQueue();
  const { isFavorite, toggleFavorite } = useRecipeCollections();

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

  // Available cuisines from data
  const availableCuisines = useMemo(() => {
    const set = new Set<string>();
    allRecipes.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine);
    });
    return Array.from(set).sort();
  }, [allRecipes]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cuisines.length > 0) count++;
    if (filters.dietary.length > 0) count++;
    if (filters.maxCookTime) count++;
    if (filters.seasonal) count++;
    return count;
  }, [filters]);

  // Process recipes: search -> filter -> sort
  const processedRecipes = useMemo(() => {
    // Use search engine for query-based search
    const searchOptions: RecipeSearchOptions = {
      query: searchQuery || undefined,
      cuisine: filters.cuisines.length > 0 ? filters.cuisines : undefined,
      isVegetarian: filters.dietary.includes("vegetarian") || undefined,
      isVegan: filters.dietary.includes("vegan") || undefined,
      isGlutenFree: filters.dietary.includes("glutenFree") || undefined,
      isDairyFree: filters.dietary.includes("dairyFree") || undefined,
      prepTimeMax: filters.maxCookTime,
      limit: 500,
    };

    let results: ScoredRecipe[] = searchRecipes(allRecipes, searchOptions);

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
            parseTimeStringToMinutes(a.totalTime || a.prepTime) -
            parseTimeStringToMinutes(b.totalTime || b.prepTime),
        );
        break;
      case "calories":
        results.sort(
          (a, b) =>
            (a.nutrition?.calories || 999) - (b.nutrition?.calories || 999),
        );
        break;
      case "alphabetical":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        break;
    }

    return results;
  }, [allRecipes, searchQuery, filters, sortBy, activeElementFilter]);

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
  };

  const toggleDietary = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(key)
        ? prev.dietary.filter((d) => d !== key)
        : [...prev.dietary, key],
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  return (
    <div className="alchm-panel border border-muted flex flex-col h-full rounded-xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-muted bg-surface-container-low/30">
        <div className="relative">
          <input
            type="text"
            placeholder="Search recipes, ingredients, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-muted bg-surface-container-lowest text-primary rounded-lg focus:border-active-violet focus:outline-none text-sm placeholder:text-on-surface-variant/40"
          />
          <span className="absolute left-3 top-3 text-on-surface-variant text-sm">
            &#128269;
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-on-surface-variant hover:text-white text-sm cursor-pointer"
            >
              &#10005;
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">
            {visibleRecipes.length} / {processedRecipes.length} recipes
            {processedRecipes.length !== allRecipes.length && (
              <button
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

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="p-4 border-b border-muted bg-surface-container-low/40 space-y-4">
          {/* Cuisine chips */}
          <div>
            <label className="block text-xs font-semibold font-mono uppercase text-on-surface-variant mb-1.5">
              Cuisine
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableCuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
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
          <div>
            <label className="block text-xs font-semibold font-mono uppercase text-on-surface-variant mb-1.5">
              Dietary
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleDietary(opt.key)}
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
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold font-mono uppercase text-on-surface-variant">
              Max Time:
            </label>
            <div className="flex gap-1.5">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      maxCookTime:
                        prev.maxCookTime === opt.value ? undefined : opt.value,
                    }))
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
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p className="text-on-surface-variant">Loading recipes...</p>
            </div>
          </div>
        ) : processedRecipes.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-4xl mb-2">🔎</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleRecipes.map((recipe) => (
                <BrowserRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={() => onSelectRecipe(recipe)}
                  onViewDetail={
                    onViewRecipeDetail
                      ? () => onViewRecipeDetail(recipe)
                      : undefined
                  }
                  onAddToQueue={() =>
                    addToQueue(recipe, { suggestedMealTypes: undefined })
                  }
                  isInQueue={isInQueue(recipe.id)}
                  isFavorite={isFavorite(recipe.id)}
                  onToggleFavorite={() => toggleFavorite(recipe.id)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center py-4 text-sm text-gray-500">
                Scroll for more...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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
}: {
  recipe: ScoredRecipe;
  onSelect: () => void;
  onViewDetail?: () => void;
  onAddToQueue: () => void;
  isInQueue: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
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

  return (
    <div
      className="relative p-4 rounded-lg border border-muted bg-surface/50 hover:border-active-violet hover:shadow-[0_0_12px_rgba(184,90,240,0.15)] transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {/* Top row: name + favorite */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
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
            onClick={(e) => {
              e.stopPropagation();
              void onToggleFavorite();
            }}
            className={`text-sm flex-shrink-0 cursor-pointer ${isFavorite ? "text-gold-accent" : "text-on-surface-variant/40 hover:text-gold-accent"}`}
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
        {recipe.prepTime && <span>⏱️ {recipe.prepTime}</span>}
        {recipe.nutrition?.calories && (
          <span>🔥 {recipe.nutrition.calories} cal</span>
        )}
      </div>

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

      {/* Actions (visible on hover) */}
      <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            void onSelect();
          }}
          className="flex-1 px-2 py-1 bg-active-violet text-background rounded text-xs font-mono uppercase font-bold hover:bg-white transition-all cursor-pointer"
        >
          Add to Meal
        </button>
        {!isInQueue && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              void onAddToQueue();
            }}
            className="px-2 py-1 bg-surface-container-high border border-muted text-primary rounded text-xs font-mono uppercase hover:border-active-violet transition-colors cursor-pointer"
          >
            + Queue
          </button>
        )}
        {isInQueue && (
          <span className="px-2 py-1 bg-active-violet/10 text-active-violet border border-active-violet/20 rounded text-xs font-mono uppercase">
            In Queue
          </span>
        )}
        <Link
          href={`/recipes/${recipe.id}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetail) onViewDetail();
          }}
          className="px-2 py-1 bg-surface-container-high border border-muted text-primary rounded text-xs font-mono uppercase hover:border-active-violet transition-colors flex items-center justify-center cursor-pointer"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
