"use client";

/**
 * MealRowCard — the redesigned, data-forward meal row for the weekly planner.
 * A compact tap-to-add row (no drag-and-drop): thumbnail · name · macro
 * read-out · dominant-element dot · lock toggle. Empty slots render a dashed
 * "Add {meal}" affordance that opens the recipe selector, plus a subtle
 * planetary-aligned "suggest" action.
 *
 * @file src/components/menu-planner/redesign/MealRowCard.tsx
 */

import { Lock, LockOpen, Plus, Sparkles, Utensils, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { MealSlot as MealSlotType, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import RecipeSelector from "../RecipeSelector";
import { dominantElement, ELEMENT_DOT } from "./elementUtils";

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

function recipeImage(r: any): string | null {
  return r?.image ?? r?.imageUrl ?? r?.image_url ?? null;
}

/** Per-serving nutrition scaled to the slot's servings, as a mono read-out. */
function macroLine(r: any, servings: number): string {
  const n = r?.nutrition;
  const kcal = Math.round((n?.calories ?? 0) * servings);
  if (!kcal) return servings > 1 ? `x${servings} servings` : "";
  const p = Math.round((n?.protein ?? 0) * servings);
  const c = Math.round((n?.carbs ?? 0) * servings);
  const f = Math.round((n?.fat ?? 0) * servings);
  return `${kcal} KCAL · P${p} C${c} F${f}${servings > 1 ? ` · x${servings}` : ""}`;
}

export default function MealRowCard({
  mealSlot,
  ghost = false,
}: {
  mealSlot: MealSlotType;
  /** Render an empty snack slot as a slim ghost affordance instead of a full row. */
  ghost?: boolean;
}) {
  const {
    addMealToSlot,
    removeMealFromSlot,
    generateMealsForDay,
    lockMeal,
    unlockMeal,
  } = useMenuPlanner();
  const [showSelector, setShowSelector] = useState(false);

  const recipe = mealSlot.recipe as any;
  const label = MEAL_LABEL[mealSlot.mealType];
  const locked = mealSlot.isLocked ?? false;
  const el = dominantElement(recipe?.elementalProperties);
  const img = recipeImage(recipe);

  const selector = (
    <RecipeSelector
      isOpen={showSelector}
      onClose={() => setShowSelector(false)}
      onSelectRecipe={(r: Recipe) => {
        void addMealToSlot(
          mealSlot.dayOfWeek,
          mealSlot.mealType,
          r as unknown as MonicaOptimizedRecipe,
        );
        setShowSelector(false);
      }}
      filters={{
        mealType: mealSlot.mealType,
        dayOfWeek: mealSlot.dayOfWeek,
        planetarySnapshot: mealSlot.planetarySnapshot,
      }}
    />
  );

  // Empty snack → slim ghost affordance
  if (!recipe && ghost) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowSelector(true)}
          className="w-full flex items-center justify-center gap-1 py-2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-wider">
            add {mealSlot.mealType}
          </span>
        </button>
        {selector}
      </>
    );
  }

  // Empty main slot → dashed add + subtle suggest
  if (!recipe) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSelector(true)}
            className="group flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-on-surface-variant/25 text-on-surface-variant hover:border-active-violet/50 hover:bg-active-violet/5 hover:text-active-violet transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Add {label}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              void generateMealsForDay(mealSlot.dayOfWeek, {
                mealTypes: [mealSlot.mealType],
              });
            }}
            title={`Suggest a planetary-aligned ${label.toLowerCase()}`}
            className="shrink-0 p-3 rounded-lg border border-gold-accent/20 text-gold-accent/80 hover:bg-gold-accent/10 transition-all"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
        {selector}
      </>
    );
  }

  // Filled slot → data-forward row
  return (
    <>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
        <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-on-surface/10 flex items-center justify-center">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <Utensils className="h-5 w-5 text-on-surface-variant/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/recipes/${recipe.id || encodeURIComponent(recipe.name)}`}
              className="font-body-md text-[15px] font-medium text-primary truncate hover:underline"
            >
              {recipe.name}
            </Link>
            <button
              type="button"
              onClick={() =>
                locked ? unlockMeal(mealSlot.id) : lockMeal(mealSlot.id)
              }
              title={locked ? "Unlock meal" : "Lock meal (protect from regenerate)"}
              aria-pressed={locked}
              className={`shrink-0 transition-colors ${
                locked
                  ? "text-gold-accent"
                  : "text-on-surface-variant/40 hover:text-on-surface-variant"
              }`}
            >
              {locked ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <LockOpen className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {el && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${ELEMENT_DOT[el]}`}
                title={`${el}-dominant`}
              />
            )}
            <span className="font-mono text-[10px] uppercase tracking-wide text-on-surface-variant truncate">
              {macroLine(recipe, mealSlot.servings) || label}
            </span>
            <button
              type="button"
              onClick={() => {
                void removeMealFromSlot(mealSlot.id);
              }}
              title="Remove meal"
              className="ml-auto shrink-0 text-on-surface-variant/40 hover:text-error transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
