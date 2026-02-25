"use client";

/**
 * Ingredient Search Bar
 * Provides fuzzy-match autocomplete for ingredients with elemental property cards.
 * Users can search, browse results, and add ingredients to the recipe builder queue.
 *
 * @file src/components/recipe-builder/IngredientSearchBar.tsx
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import type { SelectedIngredient } from "@/contexts/RecipeBuilderContext";
import { getAllIngredients } from "@/utils/foodRecommender";
import { createLogger } from "@/utils/logger";

const logger = createLogger("IngredientSearchBar");

// Element colors for visual cards
const ELEMENT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Fire: { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-400" },
  Water: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-400" },
  Earth: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  Air: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-400" },
};

/**
 * Simple fuzzy match: checks if query characters appear in order within the target.
 * Returns a score (lower is better match) or -1 if no match.
 */
function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact prefix match gets highest priority
  if (t.startsWith(q)) return 0;

  // Contains match
  if (t.includes(q)) return 1;

  // Fuzzy character-order match
  let qi = 0;
  let gaps = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
    } else if (qi > 0) {
      gaps++;
    }
  }

  return qi === q.length ? 2 + gaps : -1;
}

/**
 * Elemental property bar visualization
 */
interface ElementalBarProps {
  element: string;
  value: number;
}

const ElementalBar: React.FC<ElementalBarProps> = ({ element, value }) => {
  const colors = ELEMENT_COLORS[element];
  if (!colors || typeof value !== "number") return null;

  const pct = Math.round(value * 100);
  if (pct <= 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs" title={`${element}: ${pct}%`}>
      <span className={`${colors.text} w-8 font-medium`}>{element.slice(0, 2)}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-400 w-7 text-right">{pct}%</span>
    </div>
  );
};

/**
 * Single ingredient result card
 */
interface IngredientCardProps {
  ingredient: { name: string; category?: string; elementalProperties?: Record<string, number> };
  isSelected: boolean;
  onAdd: () => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ ingredient, isSelected, onAdd }) => {
  const elementalProps = ingredient.elementalProperties || {};

  // Find dominant element
  let dominant = "";
  let maxVal = 0;
  for (const [el, val] of Object.entries(elementalProps)) {
    if (typeof val === "number" && val > maxVal) {
      maxVal = val;
      dominant = el;
    }
  }

  const dominantColor = ELEMENT_COLORS[dominant];

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer
        ${isSelected
          ? "border-purple-300 bg-purple-50 opacity-60"
          : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
        }
      `}
      onClick={isSelected ? undefined : onAdd}
      role="option"
      aria-selected={isSelected}
    >
      {/* Left: Dominant element indicator */}
      {dominant && dominantColor && (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dominantColor.bg} ${dominantColor.text}`}
          title={`Dominant: ${dominant}`}
        >
          {dominant.slice(0, 2)}
        </div>
      )}

      {/* Center: Name & category */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-800 truncate">
          {ingredient.name}
        </div>
        {ingredient.category && (
          <div className="text-xs text-gray-500 truncate">{ingredient.category}</div>
        )}
      </div>

      {/* Right: Mini elemental bars */}
      <div className="hidden sm:flex flex-col gap-0.5 w-28">
        {["Fire", "Water", "Earth", "Air"].map((el) => {
          const val = elementalProps[el];
          if (typeof val !== "number" || val <= 0) return null;
          return <ElementalBar key={el} element={el} value={val} />;
        })}
      </div>

      {/* Add button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) onAdd();
        }}
        disabled={isSelected}
        className={`
          ml-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all
          ${isSelected
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700 hover:scale-110"
          }
        `}
        title={isSelected ? "Already added" : "Add to recipe"}
      >
        {isSelected ? "\u2713" : "+"}
      </button>
    </div>
  );
};

// ===== Main Component =====

interface IngredientSearchBarProps {
  className?: string;
  maxResults?: number;
}

export default function IngredientSearchBar({
  className = "",
  maxResults = 20,
}: IngredientSearchBarProps) {
  const { addIngredient, hasIngredient } = useRecipeBuilder();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load all ingredients once
  const allIngredients = useMemo(() => {
    try {
      const ingredients = getAllIngredients();
      logger.info(`Loaded ${ingredients.length} ingredients for search`);
      return ingredients;
    } catch (error) {
      logger.error("Failed to load ingredients:", error as any);
      return [];
    }
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const ing of allIngredients) {
      if (ing.category) cats.add(ing.category);
    }
    return Array.from(cats).sort();
  }, [allIngredients]);

  // Fuzzy search + category filter
  const filteredIngredients = useMemo(() => {
    let filtered = allIngredients;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((ing) => ing.category === selectedCategory);
    }

    // Search filter
    if (query.trim().length >= 1) {
      const scored = filtered
        .map((ing) => ({ ing, score: fuzzyMatch(query, ing.name) }))
        .filter((item) => item.score >= 0)
        .sort((a, b) => a.score - b.score);

      return scored.slice(0, maxResults).map((item) => item.ing);
    }

    // No search query: show first N alphabetically
    if (selectedCategory) {
      return filtered.slice(0, maxResults);
    }

    return [];
  }, [allIngredients, query, selectedCategory, maxResults]);

  // Handle adding an ingredient
  const handleAdd = useCallback(
    (ing: { name: string; category?: string; elementalProperties?: Record<string, number> }) => {
      const selected: SelectedIngredient = {
        name: ing.name,
        category: ing.category,
        elementalProperties: ing.elementalProperties as SelectedIngredient["elementalProperties"],
      };
      addIngredient(selected);
    },
    [addIngredient],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showResults = isFocused && (query.trim().length >= 1 || selectedCategory);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef as any}
          type="text"
          value={query}
          onChange={(e: any) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search ingredients... (e.g., tomato, basil, chicken)"
          className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all bg-white"
          aria-label="Search ingredients"
          aria-expanded={!!showResults}
          role="combobox"
          aria-autocomplete="list"
        />
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            \u2715
          </button>
        )}
      </div>

      {/* Category filter chips */}
      {isFocused && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === null
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results Dropdown */}
      {showResults && (
        <div
          className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-xl max-h-80 overflow-y-auto"
          role="listbox"
        >
          {filteredIngredients.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No ingredients found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-xs text-gray-400">
                {filteredIngredients.length} result{filteredIngredients.length !== 1 ? "s" : ""}
              </div>
              {filteredIngredients.map((ing) => (
                <IngredientCard
                  key={ing.name}
                  ingredient={ing}
                  isSelected={hasIngredient(ing.name)}
                  onAdd={() => handleAdd(ing)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
