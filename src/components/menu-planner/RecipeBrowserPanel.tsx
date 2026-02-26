"use client";

/**
 * Enhanced Recipe Browser Panel
 * Full-text search, advanced filters, sort options, infinite scroll, and recipe queue
 *
 * @file src/components/menu-planner/RecipeBrowserPanel.tsx
 * @created 2026-01-28 (Session 7)
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import { useRecipeCollections } from "@/hooks/useRecipeCollections";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";
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
}

export default function RecipeBrowserPanel({
  onSelectRecipe,
  onViewRecipeDetail,
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
        const service = UnifiedRecipeService.getInstance();
        const recipes = await service.getAllRecipes();
        setAllRecipes(recipes as unknown as Recipe[]);
        logger.info(`Loaded ${recipes.length} recipes for browser`);
      } catch (error) {
        logger.error("Failed to load recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
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
  }, [allRecipes, searchQuery, filters, sortBy]);

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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search recipes, ingredients, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
          />
          <span className="absolute left-3 top-3 text-gray-400 text-sm">
            &#128269;
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-sm"
            >
              &#10005;
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {visibleRecipes.length} of {processedRecipes.length} recipes
            {processedRecipes.length !== allRecipes.length && (
              <button
                onClick={clearAllFilters}
                className="ml-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Filters & Sort Bar */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-4">
          {/* Cuisine chips */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Cuisine
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableCuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.cuisines.includes(cuisine)
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary chips */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Dietary
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleDietary(opt.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.dietary.includes(opt.key)
                      ? "bg-green-500 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:border-green-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Cook Time */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-600">
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
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filters.maxCookTime === opt.value
                      ? "bg-purple-500 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:border-purple-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seasonal toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.seasonal}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  seasonal: e.target.checked,
                }))
              }
              className="rounded"
            />
            <span className="text-xs font-medium text-gray-600">
              Show seasonal recipes only ({getCurrentSeason()})
            </span>
          </label>
        </div>
      )}

      {/* Recipe Grid */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-2">&#9203;</div>
              <p className="text-gray-600">Loading recipes...</p>
            </div>
          </div>
        ) : processedRecipes.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-4xl mb-2">&#128269;</p>
              <p className="text-gray-600 text-lg mb-2">No recipes found</p>
              <p className="text-gray-500 text-sm mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
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

  return (
    <div
      className="relative p-3 rounded-lg border border-gray-200 bg-white hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {/* Top row: name + favorite */}
      <div className="flex items-start justify-between gap-2">
        <h3
          className="font-semibold text-gray-800 text-sm line-clamp-1 flex-1"
          onClick={onViewDetail || onSelect}
        >
          {recipe.name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`text-sm flex-shrink-0 ${isFavorite ? "text-amber-400" : "text-gray-300 hover:text-amber-400"}`}
        >
          {isFavorite ? "\u2605" : "\u2606"}
        </button>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 mt-1 text-xs text-gray-500">
        {recipe.cuisine && (
          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
            {recipe.cuisine}
          </span>
        )}
        {recipe.prepTime && <span>&#9201; {recipe.prepTime}</span>}
        {recipe.nutrition?.calories && (
          <span>{recipe.nutrition.calories} cal</span>
        )}
      </div>

      {/* Dietary badges */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {recipe.isVegetarian && (
          <span className="px-1 py-0.5 text-[10px] bg-green-100 text-green-700 rounded">
            V
          </span>
        )}
        {recipe.isVegan && (
          <span className="px-1 py-0.5 text-[10px] bg-green-100 text-green-700 rounded">
            Vg
          </span>
        )}
        {recipe.isGlutenFree && (
          <span className="px-1 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded">
            GF
          </span>
        )}
      </div>

      {/* Quick Preview on Hover */}
      {showPreview && recipe.description && (
        <div className="mt-2 text-xs text-gray-600 line-clamp-2 border-t border-gray-100 pt-2">
          {recipe.description}
        </div>
      )}

      {/* Actions (visible on hover) */}
      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="flex-1 px-2 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700"
        >
          Add to Meal
        </button>
        {!isInQueue && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToQueue();
            }}
            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200"
          >
            + Queue
          </button>
        )}
        {isInQueue && (
          <span className="px-2 py-1 bg-purple-50 text-purple-500 rounded text-xs">
            In Queue
          </span>
        )}
        {onViewDetail && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
}
