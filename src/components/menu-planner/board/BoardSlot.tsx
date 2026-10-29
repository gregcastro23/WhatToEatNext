"use client";

/**
 * BoardSlot — one compact cell of the week board (meal type × day).
 *
 * Filled: optional thumbnail · recipe name (2 lines) · kcal · element dot,
 *         with hover/focus actions (copy/move, remove). Click opens the
 *         meal sheet. Draggable to move/swap.
 * Empty:  dashed "+" (opens the recipe picker) and a ✦ suggest action.
 * Placing: when the user picked a recipe from the rail ("click-to-place"),
 *          every slot becomes a target — empty slots read "Place here",
 *          filled slots read "Replace".
 *
 * Drag payloads are wire-compatible with the legacy MealSlot/RecipeQueue
 * (`application/json` with `type: "meal-slot" | "queue-recipe"`).
 *
 * @file src/components/menu-planner/board/BoardSlot.tsx
 */

import { Copy, LoaderCircle, Lock, Plus, Sparkles, Utensils, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { MealSlot as MealSlotType } from "@/types/menuPlanner";
import { getDayName } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import { dominantElement, ELEMENT_DOT } from "../redesign/elementUtils";

interface RecipeLike {
  name?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  nutrition?: { calories?: number };
  elementalProperties?: Record<string, number>;
}

export type DragPayload =
  | { type: "meal-slot"; slotId: string }
  | { type: "queue-recipe"; recipe: MonicaOptimizedRecipe };

export function recipeImage(r?: RecipeLike | null): string | null {
  return r?.image ?? r?.imageUrl ?? r?.image_url ?? null;
}

export function slotKcal(slot: MealSlotType): number | null {
  const kcal = slot.recipe?.nutrition?.calories;
  return typeof kcal === "number" ? Math.round(kcal * slot.servings) : null;
}

function computePantryReadiness(
  ingredients: Recipe["ingredients"] | undefined,
  inventory: string[] | undefined,
): { matched: number; total: number } | null {
  if (!ingredients || ingredients.length === 0) return null;
  const inv = Array.isArray(inventory) ? inventory : [];
  if (inv.length === 0) return null;
  const pantrySet = new Set(inv.map((i) => i.toLowerCase().trim()));
  let matched = 0;
  for (const item of ingredients) {
    const lower = item.name.toLowerCase().trim();
    if (!lower) continue;
    if (pantrySet.has(lower) || Array.from(pantrySet).some((p) => lower.includes(p) || p.includes(lower))) {
      matched++;
    }
  }
  return { matched, total: ingredients.length };
}

function isMealSlotPayload(val: unknown): val is { type: "meal-slot"; slotId: string } {
  return typeof val === "object" && val !== null && "type" in val && val.type === "meal-slot" && "slotId" in val && typeof val.slotId === "string";
}

function isQueueRecipePayload(val: unknown): val is { type: "queue-recipe"; recipe: MonicaOptimizedRecipe } {
  return typeof val === "object" && val !== null && "type" in val && val.type === "queue-recipe" && "recipe" in val && typeof val.recipe === "object" && val.recipe !== null;
}

export interface BoardSlotProps {
  slot: MealSlotType;
  isToday: boolean;
  placingRecipe: Recipe | null;
  isGenerating: boolean;
  onOpen: () => void;
  onPickRecipe: () => void;
  onSuggest: () => void;
  onPlace: () => void;
  onCopy: () => void;
  onRemove: () => void;
  onDropSlot: (sourceSlotId: string) => void;
  onDropRecipe: (recipe: MonicaOptimizedRecipe) => void;
}

export default function BoardSlot({
  slot,
  isToday,
  placingRecipe,
  isGenerating,
  onOpen,
  onPickRecipe,
  onSuggest,
  onPlace,
  onCopy,
  onRemove,
  onDropSlot,
  onDropRecipe,
}: BoardSlotProps): React.ReactElement {
  const { inventory } = useMenuPlanner();
  const [dragOver, setDragOver] = useState(false);
  const { recipe } = slot;
  const where = `${getDayName(slot.dayOfWeek)} ${slot.mealType}`;

  const pantryReadiness = useMemo(
    () => computePantryReadiness(recipe?.ingredients, inventory),
    [recipe?.ingredients, inventory],
  );

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === "copy" ? "copy" : "move";
      if (!dragOver) setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      try {
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        const data = JSON.parse(raw);
        if (isMealSlotPayload(data)) {
          if (data.slotId !== slot.id) onDropSlot(data.slotId);
        } else if (isQueueRecipePayload(data)) {
          onDropRecipe(data.recipe);
        }
      } catch {
        // malformed payload — ignore
      }
    },
  };

  const base = `group relative h-full min-h-[96px] rounded-xl border transition-all duration-150 ${
    dragOver ? "border-earth-matter bg-earth-matter/10 scale-[1.02]" : ""
  }`;

  // ─── Click-to-place mode ───────────────────────────────────────────────
  if (placingRecipe) {
    return (
      <button
        type="button"
        onClick={onPlace}
        aria-label={`${recipe ? "Replace" : "Place"} ${placingRecipe.name} at ${where}`}
        className={`${base} w-full flex flex-col items-center justify-center gap-1 p-2 text-center ${
          recipe
            ? "border-muted bg-surface-container-low/60 hover:border-gold-accent/60"
            : "border-dashed border-active-violet/60 bg-active-violet/10 hover:bg-active-violet/20 animate-pulse-glow hover:animate-none"
        }`}
      >
        {recipe ? (
          <>
            <span className="line-clamp-2 text-xs text-on-surface-variant">{recipe.name}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-gold-accent">
              Replace
            </span>
          </>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wider text-active-violet">
            Place here
          </span>
        )}
      </button>
    );
  }

  // ─── Empty slot ────────────────────────────────────────────────────────
  if (!recipe) {
    return (
      <div
        {...dropHandlers}
        className={`${base} flex items-stretch border-dashed ${
          isToday ? "border-active-violet/30" : "border-on-surface-variant/20"
        } hover:border-active-violet/50`}
      >
        {isGenerating ? (
          <div className="flex flex-1 items-center justify-center text-on-surface-variant">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-label="Suggesting…" />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onPickRecipe}
              aria-label={`Add ${where}`}
              className="flex flex-1 items-center justify-center rounded-xl text-on-surface-variant/50 transition-colors hover:bg-active-violet/5 hover:text-active-violet focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet"
            >
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onSuggest}
              aria-label={`Suggest a ${slot.mealType} for ${getDayName(slot.dayOfWeek)}`}
              title="Suggest a meal"
              className="absolute bottom-1.5 right-1.5 rounded-md p-1 text-gold-accent/70 opacity-0 transition-opacity hover:bg-gold-accent/10 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </button>
          </>
        )}
      </div>
    );
  }

  // ─── Filled slot ───────────────────────────────────────────────────────
  const { name } = recipe;
  const img = recipeImage(recipe);
  const el = dominantElement(recipe.elementalProperties);
  const kcal = slotKcal(slot);

  return (
    <div
      {...dropHandlers}
      role="group"
      aria-label={where}
      className={`${base} overflow-hidden border-muted bg-surface-container-low/70 hover:border-active-violet/40 hover:bg-surface-container-low`}
    >
      <button
        type="button"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(
            "application/json",
            JSON.stringify({ type: "meal-slot", slotId: slot.id }),
          );
        }}
        onClick={onOpen}
        aria-label={`${name}, ${where}. Open details`}
        className="flex h-full w-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-active-violet rounded-xl cursor-grab active:cursor-grabbing"
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-14 w-full object-cover" loading="lazy" />
        ) : null}
        <span className="flex flex-1 flex-col gap-1 p-2">
          <span className="line-clamp-2 text-[13px] font-medium leading-snug text-primary">
            {name}
          </span>
          <span className="mt-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
            {el && (
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${ELEMENT_DOT[el]}`}
                title={`${el}-dominant`}
              />
            )}
            {kcal !== null ? `${kcal} kcal` : img ? "" : <Utensils className="h-3 w-3" aria-hidden />}
            {pantryReadiness && pantryReadiness.matched > 0 && (
              <span
                className={`px-1 py-0.2 rounded text-[9px] font-mono leading-none ${
                  pantryReadiness.matched === pantryReadiness.total
                    ? "bg-earth-matter/15 text-earth-matter border border-earth-matter/30"
                    : "bg-surface-container-high text-on-surface-variant border border-muted"
                }`}
                title={`${pantryReadiness.matched} of ${pantryReadiness.total} ingredients in Posso pantry`}
              >
                {pantryReadiness.matched === pantryReadiness.total ? "✓ In Pantry" : `${pantryReadiness.matched}/${pantryReadiness.total} Pantry`}
              </span>
            )}
            {slot.servings > 1 && <span>· ×{slot.servings}</span>}
            {slot.isLocked && <Lock className="ml-auto h-3 w-3 text-gold-accent" aria-label="Locked" />}
          </span>
        </span>
      </button>

      {/* Hover / focus actions */}
      <div className="absolute right-1 top-1 flex gap-0.5 rounded-lg bg-surface/80 p-0.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy or move ${name}`}
          title="Copy / move"
          className="rounded-md p-1 text-on-surface-variant hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-active-violet"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          title="Remove"
          className="rounded-md p-1 text-on-surface-variant hover:text-error focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
