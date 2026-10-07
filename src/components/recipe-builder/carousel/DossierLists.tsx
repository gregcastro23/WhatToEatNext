"use client";

/**
 * A dossier's two expandable lists: ingredients (each marked when the pantry
 * already holds it) and culinary steps. Collapsed, each shows a preview and a
 * "more" control; the toggles carry `aria-expanded`/`aria-controls`.
 *
 * @file src/components/recipe-builder/carousel/DossierLists.tsx
 */

import { ChevronDown, ChevronUp, PackageCheck } from "lucide-react";
import React, { useId, useState } from "react";
import { usePantry } from "@/hooks/usePantry";
import type { RecipeIngredient } from "@/types/recipe";
import { FOCUS_RING } from "../focusRing";

export const INGREDIENT_PREVIEW = 8;
export const STEP_PREVIEW = 4;

interface DisclosureToggleProps {
  label: string;
  expanded: boolean;
  controls: string;
  onToggle: () => void;
}

function DisclosureToggle({ label, expanded, controls, onToggle }: DisclosureToggleProps): React.JSX.Element {
  const Chevron = expanded ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      className={`flex items-center justify-between w-full text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 hover:text-white transition-colors rounded ${FOCUS_RING}`}
    >
      <span>{label}</span>
      <Chevron className="h-4 w-4" aria-hidden />
    </button>
  );
}

function PantryIngredient({ ingredient, inPantry }: { ingredient: RecipeIngredient; inPantry: boolean }): React.JSX.Element {
  return (
    <li
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border backdrop-blur-sm ${
        inPantry ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/5 text-gray-300"
      }`}
    >
      {inPantry && <PackageCheck className="h-3 w-3 text-emerald-400 shrink-0" aria-hidden />}
      <span>
        {ingredient.amount} {ingredient.unit} {ingredient.name}
      </span>
      {inPantry && (
        <span className="text-[10px] font-mono text-emerald-400/90">
          <span aria-hidden>✓ </span>In Pantry
        </span>
      )}
    </li>
  );
}

export function DossierIngredients({
  ingredients,
}: {
  ingredients: readonly RecipeIngredient[] | undefined;
}): React.JSX.Element | null {
  const [expanded, setExpanded] = useState(false);
  const { hasItem } = usePantry();
  const listId = useId();
  if (!ingredients || ingredients.length === 0) return null;

  const pantryCount = ingredients.filter((i) => hasItem(i.name)).length;
  const shown = expanded ? ingredients : ingredients.slice(0, INGREDIENT_PREVIEW);
  const hidden = ingredients.length - shown.length;
  const label = `Ingredients (${ingredients.length})${pantryCount > 0 ? ` · ${pantryCount} in pantry` : ""}`;

  return (
    <div className="px-5 pb-3">
      <DisclosureToggle label={label} expanded={expanded} controls={listId} onToggle={() => setExpanded((v) => !v)} />
      <ul id={listId} className="flex flex-wrap gap-1.5">
        {shown.map((ingredient, idx) => (
          <PantryIngredient key={`${ingredient.name}-${idx}`} ingredient={ingredient} inPantry={hasItem(ingredient.name)} />
        ))}
        {hidden > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={`px-2.5 py-1 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono hover:bg-purple-500/20 transition-colors ${FOCUS_RING}`}
            >
              +{hidden} more
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export function DossierSteps({ steps }: { steps: readonly string[] | undefined }): React.JSX.Element | null {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  if (!steps || steps.length === 0) return null;

  const shown = expanded ? steps : steps.slice(0, STEP_PREVIEW);
  const hidden = steps.length - shown.length;

  return (
    <div className="px-5 pb-4">
      <DisclosureToggle
        label={`Culinary Steps (${steps.length})`}
        expanded={expanded}
        controls={listId}
        onToggle={() => setExpanded((v) => !v)}
      />
      <ol id={listId} className="space-y-2">
        {shown.map((step, idx) => (
          <li key={`${idx}-${step.slice(0, 24)}`} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
            <span className="shrink-0 w-5 h-5 rounded-lg border border-purple-400/30 bg-purple-500/20 text-purple-300 text-[11px] font-mono font-bold flex items-center justify-center mt-0.5" aria-hidden>
              {idx + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={`text-xs text-purple-400 pl-7 mt-2 hover:text-purple-300 transition-colors font-mono rounded ${FOCUS_RING}`}
        >
          + {hidden} more steps
        </button>
      )}
    </div>
  );
}
