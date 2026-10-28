"use client";

/**
 * MealDetailSheet — slide-over detail inspector when clicking any planned
 * meal card on the board.
 *
 * Shows:
 *  - Thumbnail, name, cuisine, prep time, calories, macros
 *  - Servings stepper (scales recipe nutrition & grocery list immediately)
 *  - Sauce pairing & sauce serving controls
 *  - Lock / Unlock toggle (protects meal from auto-regenerate)
 *  - Direct actions: View full recipe, Copy/Move to other days, Replace, Remove
 *
 * Replaces both the intrusive RecipeDetailModal and FocusedDayView modal for single meals.
 *
 * @file src/components/menu-planner/board/MealDetailSheet.tsx
 */

import {
  Copy,
  ExternalLink,
  Flame,
  Lock,
  LockOpen,
  Minus,
  Plus,
  Replace,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import SauceSelector from "@/components/menu-planner/SauceSelector";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { MealSlot as MealSlotType } from "@/types/menuPlanner";
import { getDayName } from "@/types/menuPlanner";
import { dominantElement, ELEMENT_DOT } from "../redesign/elementUtils";
import { usePlannerUI } from "../shell/PlannerUIContext";
import Sheet from "../shell/Sheet";
import { recipeImage, slotKcal } from "./BoardSlot";

interface MealDetailSheetProps {
  slot: MealSlotType | null;
  onClose: () => void;
  onCopyMeal?: (slot: MealSlotType) => void;
  onReplace?: (slot: MealSlotType) => void;
  onRemove: (slot: MealSlotType) => void;
}

export default function MealDetailSheet({
  slot,
  onClose,
  onCopyMeal,
  onReplace,
  onRemove,
}: MealDetailSheetProps): React.ReactElement {
  const {
    updateMealServings,
    lockMeal,
    unlockMeal,
    addSauceToMeal,
    removeSauceFromMeal,
    updateSauceServings,
  } = useMenuPlanner();
  const { notify } = usePlannerUI();

  const [showSauceSelector, setShowSauceSelector] = useState(false);

  if (!slot?.recipe) {
    return <></>;
  }

  const { recipe } = slot;
  const isLocked = slot.isLocked ?? false;
  const img = recipeImage(recipe);
  const el = dominantElement(recipe.elementalProperties);
  const kcal = slotKcal(slot);
  const { sauce } = slot;

  const handleUpdateServings = (newServings: number) => {
    if (newServings < 1 || newServings > 20) return;
    updateMealServings(slot.id, newServings).catch(() => notify("Could not update servings"));
  };

  const handleToggleLock = () => {
    if (isLocked) {
      unlockMeal(slot.id);
      notify("Unlocked meal");
    } else {
      lockMeal(slot.id);
      notify("Locked meal (protected from auto-generation)");
    }
  };

  const handleRemove = () => {
    onRemove(slot);
    onClose();
  };

  return (
    <>
      <Sheet
        open={Boolean(slot) && !showSauceSelector}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title={recipe.name}
        description={`${getDayName(slot.dayOfWeek)} · ${slot.mealType}`}
        width="max-w-md"
        footer={
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-error/20 bg-error/10 text-error hover:bg-error/20 text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
            <div className="flex items-center gap-2">
              {onReplace && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReplace(slot);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-muted bg-surface-container-high text-on-surface hover:text-primary text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  <Replace className="h-4 w-4" />
                  Replace
                </button>
              )}
              {onCopyMeal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCopyMeal(slot);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-active-violet text-active-violet bg-active-violet/10 hover:bg-active-violet/20 text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy / Move
                </button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Hero Image */}
          {img && (
            <div className="w-full h-48 rounded-xl overflow-hidden border border-muted bg-surface-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={recipe.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Key Metrics Header */}
          <div className="p-3 rounded-xl bg-surface-container-low border border-muted flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              {el && (
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${ELEMENT_DOT[el]}`} />
                  <span className="capitalize">{el}</span>
                </span>
              )}
              {recipe.cuisine && (
                <span className="px-2 py-0.5 rounded-full bg-active-violet/10 border border-active-violet/20 text-active-violet">
                  {recipe.cuisine}
                </span>
              )}
            </div>
            {kcal !== null && (
              <span className="flex items-center gap-1 text-primary font-bold">
                <Flame className="h-3.5 w-3.5 text-gold-accent" />
                {kcal} kcal
              </span>
            )}
          </div>

          {/* Servings Control & Lock */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-muted space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary font-mono uppercase tracking-wider">
                  Servings
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Scales ingredients and grocery shopping
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease servings"
                  onClick={() => handleUpdateServings(slot.servings - 1)}
                  disabled={slot.servings <= 1}
                  className="w-7 h-7 rounded-lg border border-muted bg-surface-container-high text-primary flex items-center justify-center hover:bg-surface-container-highest disabled:opacity-40 transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-mono font-bold text-sm text-primary">
                  {slot.servings}
                </span>
                <button
                  type="button"
                  aria-label="Increase servings"
                  disabled={slot.servings >= 20}
                  onClick={() => handleUpdateServings(slot.servings + 1)}
                  className="w-7 h-7 rounded-lg border border-muted bg-surface-container-high text-primary flex items-center justify-center hover:bg-surface-container-highest transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-muted flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary">Lock Meal</p>
                <p className="text-[11px] text-on-surface-variant">
                  Prevents auto-generation from replacing this slot
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleLock}
                className={`p-2 rounded-lg border transition-colors ${
                  isLocked
                    ? "border-gold-accent bg-gold-accent/10 text-gold-accent"
                    : "border-muted bg-surface-container-high text-on-surface-variant hover:text-primary"
                }`}
                title={isLocked ? "Unlock slot" : "Lock slot"}
              >
                {isLocked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Sauce Pairing Section */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-muted space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary font-mono uppercase tracking-wider">
                  Sauce Pairing
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Boost elemental flavor and alchemy
                </p>
              </div>
              {!sauce && (
                <button
                  type="button"
                  onClick={() => setShowSauceSelector(true)}
                  className="px-2.5 py-1 rounded-lg border border-gold-accent/30 bg-gold-accent/10 text-gold-accent hover:bg-gold-accent/20 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  + Add Sauce
                </button>
              )}
            </div>

            {sauce && (
              <div className="flex items-center justify-between pt-2 border-t border-muted">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gold-accent truncate">{sauce.name}</p>
                  {sauce.nutritionalProfile?.calories && (
                    <p className="text-[10px] text-on-surface-variant font-mono">
                      +{Math.round((sauce.nutritionalProfile.calories ?? 0) * sauce.servings)} kcal
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    aria-label="Decrease sauce servings"
                    onClick={() => updateSauceServings(slot.id, Math.max(0.5, sauce.servings - 0.5))}
                    className="w-5 h-5 rounded bg-surface-container-high text-xs flex items-center justify-center hover:bg-surface-container-highest"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold text-primary px-1">
                    {sauce.servings}x
                  </span>
                  <button
                    type="button"
                    aria-label="Increase sauce servings"
                    onClick={() => updateSauceServings(slot.id, sauce.servings + 0.5)}
                    className="w-5 h-5 rounded bg-surface-container-high text-xs flex items-center justify-center hover:bg-surface-container-highest"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSauceFromMeal(slot.id)}
                    className="p-1 text-on-surface-variant hover:text-error ml-1 transition-colors"
                    title="Remove sauce"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recipe Description & Link */}
          {recipe.description && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-muted">
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-sm">
                {recipe.description}
              </p>
            </div>
          )}

          {/* Full Recipe Link */}
          <div>
            <Link
              href={`/recipes/${recipe.id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-muted bg-surface-container-high hover:border-active-violet text-primary font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              <span>View Recipe, Ingredients & Steps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Sheet>

      {/* Sauce Selector Modal */}
      {showSauceSelector && (
        <SauceSelector
          isOpen={showSauceSelector}
          onClose={() => setShowSauceSelector(false)}
          onSelectSauce={(sauceId) => {
            addSauceToMeal(slot.id, sauceId);
            setShowSauceSelector(false);
          }}
          {...(recipe.elementalProperties !== undefined
            ? { recipeElementalProperties: recipe.elementalProperties }
            : {})}
          {...(recipe.alchemicalProperties
            ? {
                recipeAlchemicalProperties: {
                  Spirit: recipe.alchemicalProperties.heat ?? 0,
                  Essence: recipe.alchemicalProperties.reactivity ?? 0,
                  Matter: recipe.alchemicalProperties.stability ?? 0,
                  Substance: recipe.alchemicalProperties.entropy ?? 0,
                },
              }
            : {})}
        />
      )}
    </>
  );
}
