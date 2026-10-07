"use client";

/**
 * Recipe Builder Panel
 * Main integrated panel combining ingredient search, preference selectors,
 * the builder queue, and the generate button.
 *
 * @file src/components/recipe-builder/RecipeBuilderPanel.tsx
 */

import { ChevronDown, Utensils, SlidersHorizontal, ChefHat } from "lucide-react";
import React, { Suspense, useMemo, useState } from "react";
import {
  useRecipeBuilder,
  type MealType,
  type FlavorPreference,
} from "@/contexts/RecipeBuilderContext";
import { usePantry } from "@/hooks/usePantry";
import {
  getAllCuisineNames,
  getCuisineEntry,
} from "@/utils/cuisine/cuisineIndex";
import IngredientSearchBar from "./IngredientSearchBar";
import IngredientSuggestions from "./IngredientSuggestions";
import RecipeBuilderQueue from "./RecipeBuilderQueue";
import { IngredientPrefill } from "./useIngredientPrefill";

// ===== Constants =====

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const FLAVOR_OPTIONS: FlavorPreference[] = [
  "spicy",
  "sweet",
  "savory",
  "bitter",
  "sour",
  "umami",
];

const FLAVOR_ICONS: Record<FlavorPreference, string> = {
  spicy: "🌶️",
  sweet: "🍯",
  savory: "🧂",
  bitter: "🌿",
  sour: "🍋",
  umami: "🍄",
};

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Sodium",
  "Nut-Free",
];

const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
];

const CUISINE_FALLBACK = [
  "American",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Thai",
  "Vietnamese",
];

function formatSignatureLabel(property: string, zscore: number): string {
  const direction = zscore >= 0 ? "elevated" : "reduced";
  const magnitude = Math.abs(zscore).toFixed(1);
  return `${property} ${direction} ${magnitude}\u03C3`;
}

const COOKING_METHOD_OPTIONS = [
  "Baked",
  "Blended",
  "Braised",
  "Fried",
  "Grilled",
  "Poached",
  "Roasted",
  "Sauteed",
  "Slow-Cooked",
  "Steamed",
  "Stir-Fried",
];

// ===== Sub-Components =====

function PantryQuickSync() {
  const { items, isLoaded } = usePantry();
  const { addIngredient, hasIngredient } = useRecipeBuilder();

  if (!isLoaded || items.length === 0) return null;

  const unqueued = items.filter((item) => !hasIngredient(item.name));

  const handleAddAll = () => {
    unqueued.slice(0, 10).forEach((item) => {
      addIngredient({
        name: item.name,
        category: item.category,
      });
    });
  };

  return (
    <div className="glass-card-premium rounded-2xl p-4 border border-emerald-500/20 bg-emerald-950/10">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>📦</span>
          <span className="text-xs font-semibold text-emerald-300">
            From Your Kitchen Pantry ({items.length} items saved)
          </span>
        </div>
        {unqueued.length > 0 && (
          <button
            type="button"
            onClick={handleAddAll}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
          >
            + Add unqueued ({Math.min(unqueued.length, 10)})
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 12).map((item) => {
          const isSelected = hasIngredient(item.name);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!isSelected) {
                  addIngredient({
                    name: item.name,
                    category: item.category,
                  });
                }
              }}
              disabled={isSelected}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 opacity-60 cursor-default"
                  : "bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-white/80 hover:text-white cursor-pointer active:scale-95"
              }`}
              title={isSelected ? "Already in crucible" : `Add ${item.name} from pantry`}
            >
              <span>{item.name}</span>
              <span className="text-[10px]">{isSelected ? "✓" : "+"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MealTypeSelector() {
  const { mealType, setMealType } = useRecipeBuilder();

  return (
    <div role="group" aria-labelledby="recipe-builder-meal-type-label">
      <span
        id="recipe-builder-meal-type-label"
        className="t-label text-[11px] text-white/60 mb-2 block"
      >
        Meal Type
      </span>
      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((type) => {
          const isSelected = mealType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setMealType(isSelected ? null : type)}
              aria-pressed={isSelected}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                isSelected
                  ? "bg-purple-600/30 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlavorSelector() {
  const { flavors, toggleFlavor } = useRecipeBuilder();

  return (
    <div role="group" aria-labelledby="recipe-builder-flavor-label">
      <span
        id="recipe-builder-flavor-label"
        className="t-label text-[11px] text-white/60 mb-2 block"
      >
        Flavor Profiles
      </span>
      <div className="flex flex-wrap gap-2">
        {FLAVOR_OPTIONS.map((flavor) => {
          const isSelected = flavors.includes(flavor);
          return (
            <button
              key={flavor}
              type="button"
              onClick={() => toggleFlavor(flavor)}
              aria-pressed={isSelected}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border capitalize cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-pink-600/30 text-pink-200 border-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.3)]"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <span aria-hidden>{FLAVOR_ICONS[flavor]}</span>
              <span>{flavor}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function DietarySelector() {
  const { dietaryPreferences, addDietaryPreference, removeDietaryPreference } =
    useRecipeBuilder();

  return (
    <div role="group" aria-labelledby="recipe-builder-dietary-label">
      <span
        id="recipe-builder-dietary-label"
        className="t-label text-[11px] text-white/60 mb-2 block"
      >
        Dietary Regimens
      </span>
      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((pref) => {
          const isSelected = dietaryPreferences.includes(pref);
          return (
            <button
              key={pref}
              type="button"
              aria-pressed={isSelected}
              onClick={() =>
                isSelected
                  ? removeDietaryPreference(pref)
                  : addDietaryPreference(pref)
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                isSelected
                  ? "bg-teal-500/20 text-teal-200 border-teal-400/80 shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {pref}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AllergySelector() {
  const { allergies, addAllergy, removeAllergy } = useRecipeBuilder();
  const [customAllergy, setCustomAllergy] = useState("");

  const handleAddCustom = () => {
    const trimmed = customAllergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      addAllergy(trimmed);
      setCustomAllergy("");
    }
  };

  return (
    <div role="group" aria-labelledby="recipe-builder-allergies-label">
      <span
        id="recipe-builder-allergies-label"
        className="t-label text-[11px] text-white/60 mb-2 block"
      >
        Exclusions & Allergies
      </span>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {COMMON_ALLERGIES.map((allergy) => {
          const isSelected = allergies.includes(allergy);
          return (
            <button
              key={allergy}
              type="button"
              aria-pressed={isSelected}
              onClick={() =>
                isSelected ? removeAllergy(allergy) : addAllergy(allergy)
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                isSelected
                  ? "bg-red-500/20 text-red-200 border-red-400/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {allergy}
            </button>
          );
        })}
      </div>
      {/* Custom allergy input */}
      <div className="flex gap-2">
        <input
          type="text"
          aria-label="Custom allergy or exclusion"
          value={customAllergy}
          onChange={(e) => setCustomAllergy(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          placeholder="Add custom exclusion..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 focus:border-red-400/60 focus:ring-1 focus:ring-red-400/20 outline-none"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          disabled={!customAllergy.trim()}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function CuisineSelector() {
  const { selectedCuisines, addCuisine, removeCuisine } = useRecipeBuilder();
  const [customCuisine, setCustomCuisine] = useState("");

  const cuisineOptions = useMemo<string[]>(() => {
    const fromIndex = getAllCuisineNames();
    if (fromIndex.length === 0) return CUISINE_FALLBACK;
    const merged = new Set<string>(fromIndex);
    for (const name of CUISINE_FALLBACK) merged.add(name);
    return Array.from(merged);
  }, []);

  const signatureBySelected = useMemo(() => {
    const map = new Map<
      string,
      {
        signatures: Array<{
          property: string;
          zscore: number;
          description?: string;
        }>;
        sampleSize: number;
      }
    >();
    for (const cuisine of selectedCuisines) {
      const entry = getCuisineEntry(cuisine);
      if (!entry) continue;
      const top = [...(entry.signatures ?? [])]
        .sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore))
        .slice(0, 2)
        .map((sig) => ({
          property: String(sig.property),
          zscore: sig.zscore,
          ...(sig.description ? { description: sig.description } : {}),
        }));
      if (top.length > 0) {
        map.set(cuisine, { signatures: top, sampleSize: entry.sampleSize });
      }
    }
    return map;
  }, [selectedCuisines]);

  const handleAddCustomCuisine = () => {
    const trimmed = customCuisine.trim();
    if (trimmed && !selectedCuisines.includes(trimmed)) {
      addCuisine(trimmed);
      setCustomCuisine("");
    }
  };

  return (
    <div role="group" aria-labelledby="recipe-builder-cuisines-label">
      <span
        id="recipe-builder-cuisines-label"
        className="t-label text-[11px] text-white/60 mb-2 block"
      >
        Regional & Cultural Cuisines
      </span>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {cuisineOptions.map((cuisine) => {
          const isSelected = selectedCuisines.includes(cuisine);
          return (
            <button
              key={cuisine}
              type="button"
              aria-pressed={isSelected}
              onClick={() =>
                isSelected ? removeCuisine(cuisine) : addCuisine(cuisine)
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                isSelected
                  ? "bg-purple-600/30 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {cuisine}
            </button>
          );
        })}
      </div>
      {signatureBySelected.size > 0 && (
        <div className="mb-3 space-y-2">
          {Array.from(signatureBySelected.entries()).map(([cuisine, info]) => (
            <div
              key={cuisine}
              className="glass-card-premium rounded-xl border border-purple-500/20 bg-purple-950/20 px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-purple-300">
                  {cuisine} Alchemical Signatures
                </span>
                <span className="t-mono text-[10px] text-purple-400/60">
                  corpus n={info.sampleSize}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {info.signatures.map((sig, i) => (
                  <span
                    key={`${cuisine}-${sig.property}-${i}`}
                    title={sig.description}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-purple-400/30 px-2 py-0.5 text-[10px] font-medium text-purple-200 t-mono"
                  >
                    <span aria-hidden>✨</span>
                    {formatSignatureLabel(sig.property, sig.zscore)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={customCuisine}
          onChange={(e) => setCustomCuisine(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustomCuisine()}
          placeholder="Add custom cuisine tradition..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/20 outline-none"
        />
        <button
          type="button"
          onClick={handleAddCustomCuisine}
          disabled={!customCuisine.trim()}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function CookingMethodSelector() {
  const { selectedCookingMethods, addCookingMethod, removeCookingMethod } =
    useRecipeBuilder();
  const [customMethod, setCustomMethod] = useState("");

  const handleAddCustomMethod = () => {
    const trimmed = customMethod.trim();
    if (trimmed && !selectedCookingMethods.includes(trimmed)) {
      addCookingMethod(trimmed);
      setCustomMethod("");
    }
  };

  return (
    <div role="group" aria-labelledby="recipe-builder-methods-label">
      <span
        id="recipe-builder-methods-label"
        className="t-label text-[11px] text-white/60 mb-2 block"
      >
        Thermal & Cooking Techniques
      </span>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {COOKING_METHOD_OPTIONS.map((method) => {
          const isSelected = selectedCookingMethods.includes(method);
          return (
            <button
              key={method}
              type="button"
              aria-pressed={isSelected}
              onClick={() =>
                isSelected
                  ? removeCookingMethod(method)
                  : addCookingMethod(method)
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                isSelected
                  ? "bg-amber-600/30 text-amber-200 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {method}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          aria-label="Custom cooking method"
          value={customMethod}
          onChange={(e) => setCustomMethod(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustomMethod()}
          placeholder="Add custom method (e.g. Sous-Vide, Confit)..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 outline-none"
        />
        <button
          type="button"
          onClick={handleAddCustomMethod}
          disabled={!customMethod.trim()}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ===== Collapsible Glass Section =====

interface CollapsibleSectionProps {
  title: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  badge,
  icon,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card-premium rounded-2xl border border-white/10 hover:border-white/15 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="t-display text-base sm:text-lg font-medium text-white tracking-wide">
            {title}
          </span>
          {badge}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/50 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-purple-400" : ""
          }`}
          aria-hidden
        />
      </button>
      {isOpen && (
        <div className="p-4 sm:p-5 pt-3 space-y-5 border-t border-white/5 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

// ===== Main Panel =====

interface RecipeBuilderPanelProps {
  className?: string;
}

export default function RecipeBuilderPanel({
  className = "",
}: RecipeBuilderPanelProps) {
  const {
    quizBrief,
    maxPrepTimeMinutes,
    mealType,
    flavors,
    dietaryPreferences,
    allergies,
    selectedCuisines,
    selectedCookingMethods,
  } = useRecipeBuilder();

  const mealFlavorCount = (mealType ? 1 : 0) + flavors.length;
  const dietaryCount = dietaryPreferences.length + allergies.length;
  const cuisineMethodCount = selectedCuisines.length + selectedCookingMethods.length;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* "Cook with this" links arrive as ?ingredients=… (omnibar Phase 4). */}
      <Suspense fallback={null}>
        <IngredientPrefill />
      </Suspense>

      {quizBrief && (
        <details className="glass-card-premium rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-200">
          <summary className="cursor-pointer font-medium flex items-center justify-between">
            <span>
              Quiz Parameters Loaded
              {maxPrepTimeMinutes ? ` · Max ${maxPrepTimeMinutes} mins prep` : ""}
            </span>
            <span className="text-xs text-amber-400/80">View brief</span>
          </summary>
          <p className="mt-2 text-xs text-amber-300/80 leading-relaxed">
            Your quiz selections for ingredients, cuisines, techniques, dietary restrictions, and time have seeded the builder.
          </p>
          <pre className="mt-2.5 whitespace-pre-wrap break-words text-xs leading-relaxed p-3 rounded-xl bg-black/30 border border-white/5 text-amber-100/90 t-mono">
            {quizBrief}
          </pre>
        </details>
      )}

      {/* Ingredient Search */}
      <div className="space-y-2">
        <span className="t-label text-[11px] text-white/60 block">
          Add Ingredients to Crucible
        </span>
        <IngredientSearchBar />
      </div>

      {/* Direct Kitchen Pantry Shelf (New capability) */}
      <PantryQuickSync />

      {/* Smart Ingredient Suggestions */}
      <IngredientSuggestions />

      {/* Preferences Sections */}
      <CollapsibleSection
        title="Meal & Flavor Profiles"
        icon={<Utensils className="w-4 h-4 text-purple-400" />}
        badge={
          mealFlavorCount > 0 ? (
            <span className="t-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
              {mealFlavorCount} active
            </span>
          ) : null
        }
        defaultOpen
      >
        <MealTypeSelector />
        <FlavorSelector />
      </CollapsibleSection>

      <CollapsibleSection
        title="Dietary & Allergen Boundaries"
        icon={<SlidersHorizontal className="w-4 h-4 text-teal-400" />}
        badge={
          dietaryCount > 0 ? (
            <span className="t-mono text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300">
              {dietaryCount} active
            </span>
          ) : null
        }
      >
        <DietarySelector />
        <AllergySelector />
      </CollapsibleSection>

      <CollapsibleSection
        title="Cuisine Traditions & Cooking Methods"
        icon={<ChefHat className="w-4 h-4 text-amber-400" />}
        badge={
          cuisineMethodCount > 0 ? (
            <span className="t-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
              {cuisineMethodCount} active
            </span>
          ) : null
        }
      >
        <CuisineSelector />
        <CookingMethodSelector />
      </CollapsibleSection>

      {/* Crucible Queue Display */}
      <RecipeBuilderQueue />
    </div>
  );
}

