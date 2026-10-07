"use client";

/**
 * Ingredient Search Bar
 * Provides fuzzy-match autocomplete for ingredients with elemental property cards.
 * Users can search, browse results, and add ingredients to the recipe builder queue.
 *
 * @file src/components/recipe-builder/IngredientSearchBar.tsx
 */

import { Search } from "lucide-react";
import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import type { SelectedIngredient } from "@/contexts/RecipeBuilderContext";
import { usePantry } from "@/hooks/usePantry";
import { getAllIngredients } from "@/utils/foodRecommender";
import { createLogger } from "@/utils/logger";
import { fuzzyScore } from "@/utils/searchNormalize";
import { FOCUS_RING } from "./focusRing";

const logger = createLogger("IngredientSearchBar");

// Element colors for visual cards
const ELEMENT_COLORS: Record<
  string,
  { bg: string; text: string; bar: string; border: string }
> = {
  Fire: {
    bg: "bg-orange-500/15",
    text: "text-orange-300",
    bar: "bg-orange-500",
    border: "border-orange-500/30",
  },
  Water: {
    bg: "bg-sky-500/15",
    text: "text-sky-300",
    bar: "bg-sky-400",
    border: "border-sky-500/30",
  },
  Earth: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    bar: "bg-emerald-400",
    border: "border-emerald-500/30",
  },
  Air: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-300",
    bar: "bg-indigo-400",
    border: "border-indigo-500/30",
  },
};

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
    <div
      className="flex items-center gap-1.5 text-[11px]"
      title={`${element}: ${pct}%`}
    >
      <span className={`${colors.text} w-6 font-medium text-[10px]`}>
        {element.slice(0, 2)}
      </span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="t-mono text-white/40 w-6 text-right text-[10px]">{pct}%</span>
    </div>
  );
};

/**
 * Single ingredient result card
 */
interface IngredientCardProps {
  ingredient: {
    name: string;
    category?: string;
    description?: string;
    elementalProperties?: Record<string, number>;
  };
  isSelected: boolean;
  isInPantry?: boolean;
  onAdd: () => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  isSelected,
  isInPantry = false,
  onAdd,
}) => {
  const elementalProps = ingredient.elementalProperties ?? {};

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
        flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${FOCUS_RING}
        ${
          isSelected
            ? "border-purple-400/40 bg-purple-950/30 opacity-60"
            : "border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07]"
        }
      `}
      onClick={isSelected ? undefined : onAdd}
      onKeyDown={(e) => {
        if (isSelected) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdd();
        }
      }}
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? -1 : 0}
    >
      {/* Left: Dominant element indicator */}
      {dominant && dominantColor && (
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border ${dominantColor.bg} ${dominantColor.text} ${dominantColor.border}`}
          title={`Dominant Element: ${dominant}`}
        >
          {dominant.slice(0, 2)}
        </div>
      )}

      {/* Center: Name & category */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white truncate">
            {ingredient.name}
          </span>
          {isInPantry && (
            <span className="t-mono text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              📦 Pantry
            </span>
          )}
        </div>
        {ingredient.category && (
          <div className="t-label text-[10px] text-white/50 truncate mt-0.5">
            {ingredient.category}
          </div>
        )}
        {ingredient.description && (
          <div
            className="text-[11px] text-white/40 mt-0.5 line-clamp-1"
            title={ingredient.description
              .replace(/\*\*(.*?)\*\*/g, "$1")
              .replace(/\*(.*?)\*/g, "$1")}
          >
            {ingredient.description
              .replace(/\*\*(.*?)\*\*/g, "$1")
              .replace(/\*(.*?)\*/g, "$1")}
          </div>
        )}
      </div>

      {/* Right: Mini elemental bars */}
      <div className="hidden sm:flex flex-col gap-0.5 w-24">
        {["Fire", "Water", "Earth", "Air"].map((el) => {
          const val = elementalProps[el];
          if (typeof val !== "number" || val <= 0) return null;
          return <ElementalBar key={el} element={el} value={val} />;
        })}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) onAdd();
        }}
        disabled={isSelected}
        className={`
          ml-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${FOCUS_RING}
          ${
            isSelected
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:scale-110 active:scale-95"
          }
        `}
        title={isSelected ? "Already in crucible" : "Add to crucible"}
      >
        {isSelected ? "✓" : "+"}
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
}: IngredientSearchBarProps): React.JSX.Element {
  const { addIngredient, hasIngredient } = useRecipeBuilder();
  const { hasItem: hasPantryItem } = usePantry();
  const resultsListId = useId();
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
      logger.error("Failed to load ingredients:", error);
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
        .map((ing) => {
          const i = ing as typeof ing & {
            id?: string;
            aliases?: string[];
            subCategory?: string;
          };
          const candidates: string[] = [
            i.name,
            i.id ?? "",
            i.subCategory ?? "",
            ...(Array.isArray(i.aliases) ? i.aliases : []),
          ];
          return { ing, score: fuzzyScore(query, candidates) };
        })
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
    (ing: {
      name: string;
      category?: string;
      elementalProperties?: Record<string, number>;
    }) => {
      const selected: SelectedIngredient = {
        name: ing.name,
        ...(ing.category !== undefined ? { category: ing.category } : {}),
        ...(ing.elementalProperties !== undefined
          ? { elementalProperties: ing.elementalProperties }
          : {}),
      };
      addIngredient(selected);
    },
    [addIngredient],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return (): void => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showResults =
    isFocused && (query.trim().length >= 1 || selectedCategory);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Escape") {
              setIsFocused(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Search ingredients... (e.g., tomato, basil, chicken)"
          className="w-full px-4 py-3.5 pl-11 pr-10 rounded-2xl border border-white/15 focus:border-purple-400/80 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm transition-all bg-white/[0.04] text-white placeholder-white/40 glass-card-premium shadow-inner"
          aria-label="Search ingredients"
          aria-controls={resultsListId}
          aria-expanded={!!showResults}
          role="combobox"
          aria-autocomplete="list"
        />
        {/* Search icon */}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-1 cursor-pointer rounded ${FOCUS_RING}`}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter chips */}
      {isFocused && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${FOCUS_RING} ${
              selectedCategory === null
                ? "bg-purple-600/30 text-purple-200 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "bg-white/[0.04] text-white/70 border border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              aria-pressed={selectedCategory === cat}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${FOCUS_RING} ${
                selectedCategory === cat
                  ? "bg-purple-600/30 text-purple-200 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "bg-white/[0.04] text-white/70 border border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
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
          id={resultsListId}
          className="absolute z-50 w-full mt-2 glass-card-premium backdrop-blur-2xl bg-[#0e0c16]/98 rounded-2xl border border-white/15 shadow-2xl max-h-80 overflow-y-auto p-2 space-y-1"
          role="listbox"
        >
          {filteredIngredients.length === 0 ? (
            <div className="p-4 text-xs text-white/50 text-center">
              No matching ingredients discovered for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-1 space-y-1.5">
              <div className="px-2.5 py-1 text-[11px] text-white/40 t-mono">
                {filteredIngredients.length} ingredient{filteredIngredients.length !== 1 ? "s" : ""} indexed
              </div>
              {filteredIngredients.map((ing) => (
                <IngredientCard
                  key={ing.name}
                  ingredient={ing}
                  isSelected={hasIngredient(ing.name)}
                  isInPantry={hasPantryItem(ing.name)}
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

