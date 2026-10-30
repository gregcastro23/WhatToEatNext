"use client";

/**
 * Recipe Builder Panel
 * Main integrated panel combining ingredient search, the pantry shelf,
 * preference selectors, and the crucible queue. Each selector lives in
 * `./selectors/`; this file only arranges them.
 *
 * @file src/components/recipe-builder/RecipeBuilderPanel.tsx
 */

import { ChefHat, SlidersHorizontal, Utensils } from "lucide-react";
import React, { Suspense } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import CollapsibleSection from "./CollapsibleSection";
import IngredientSearchBar from "./IngredientSearchBar";
import IngredientSuggestions from "./IngredientSuggestions";
import PantryQuickSync from "./PantryQuickSync";
import RecipeBuilderQueue from "./RecipeBuilderQueue";
import AllergySelector from "./selectors/AllergySelector";
import CookingMethodSelector from "./selectors/CookingMethodSelector";
import CuisineSelector from "./selectors/CuisineSelector";
import DietarySelector from "./selectors/DietarySelector";
import FlavorSelector from "./selectors/FlavorSelector";
import MealTypeSelector from "./selectors/MealTypeSelector";
import { IngredientPrefill } from "./useIngredientPrefill";

function QuizBriefNotice(): React.JSX.Element | null {
  const { quizBrief, maxPrepTimeMinutes } = useRecipeBuilder();
  if (!quizBrief) return null;

  return (
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
  );
}

function PreferenceSections(): React.JSX.Element {
  const builder = useRecipeBuilder();
  const mealFlavorCount = (builder.mealType ? 1 : 0) + builder.flavors.length;
  const dietaryCount = builder.dietaryPreferences.length + builder.allergies.length;
  const cuisineMethodCount =
    builder.selectedCuisines.length + builder.selectedCookingMethods.length;

  return (
    <>
      <CollapsibleSection
        title="Meal & Flavor Profiles"
        icon={<Utensils className="w-4 h-4 text-purple-400" aria-hidden />}
        tone="purple"
        activeCount={mealFlavorCount}
        defaultOpen
      >
        <MealTypeSelector />
        <FlavorSelector />
      </CollapsibleSection>

      <CollapsibleSection
        title="Dietary & Allergen Boundaries"
        icon={<SlidersHorizontal className="w-4 h-4 text-teal-400" aria-hidden />}
        tone="teal"
        activeCount={dietaryCount}
      >
        <DietarySelector />
        <AllergySelector />
      </CollapsibleSection>

      <CollapsibleSection
        title="Cuisine Traditions & Cooking Methods"
        icon={<ChefHat className="w-4 h-4 text-amber-400" aria-hidden />}
        tone="amber"
        activeCount={cuisineMethodCount}
      >
        <CuisineSelector />
        <CookingMethodSelector />
      </CollapsibleSection>
    </>
  );
}

interface RecipeBuilderPanelProps {
  className?: string;
}

export default function RecipeBuilderPanel({
  className = "",
}: RecipeBuilderPanelProps): React.JSX.Element {
  return (
    <div className={`space-y-5 ${className}`}>
      {/* "Cook with this" links arrive as ?ingredients=… (omnibar Phase 4). */}
      <Suspense fallback={null}>
        <IngredientPrefill />
      </Suspense>

      <QuizBriefNotice />

      <div className="space-y-2">
        <span className="t-label text-[11px] text-white/60 block">
          Add Ingredients to Crucible
        </span>
        <IngredientSearchBar />
      </div>

      <PantryQuickSync />
      <IngredientSuggestions />
      <PreferenceSections />
      <RecipeBuilderQueue />
    </div>
  );
}
