"use client";

/**
 * Pantry Quick Sync
 * The user's saved pantry as one-tap chips: each adds that item to the
 * crucible, and "add unqueued" adds the first few not yet queued. Renders
 * nothing until the pantry has loaded, or when it is empty.
 *
 * @file src/components/recipe-builder/PantryQuickSync.tsx
 */

import React from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { usePantry } from "@/hooks/usePantry";
import type { PantryItem } from "@/utils/pantryManager";
import { FOCUS_RING } from "./focusRing";

/** Chips shown; the rest of a large pantry stays on /pantry. */
export const PANTRY_SHOWN = 12;
/** Items one "add unqueued" press queues, so a full pantry cannot flood the crucible. */
export const PANTRY_BULK_ADD = 10;

interface PantryChipProps {
  item: PantryItem;
  queued: boolean;
  onAdd: () => void;
}

function PantryChip({ item, queued, onAdd }: PantryChipProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={queued}
      aria-label={queued ? `${item.name} (in crucible)` : `Add ${item.name} from pantry`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${FOCUS_RING} ${
        queued
          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 opacity-60 cursor-default"
          : "bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-white/80 hover:text-white cursor-pointer active:scale-95"
      }`}
      title={queued ? "Already in crucible" : `Add ${item.name} from pantry`}
    >
      <span>{item.name}</span>
      <span className="text-[10px]" aria-hidden>
        {queued ? "✓" : "+"}
      </span>
    </button>
  );
}

export default function PantryQuickSync(): React.JSX.Element | null {
  const { items, isLoaded } = usePantry();
  const { addIngredient, hasIngredient } = useRecipeBuilder();

  if (!isLoaded || items.length === 0) return null;

  const queue = (item: PantryItem): void => addIngredient({ name: item.name, category: item.category });
  const unqueued = items.filter((item) => !hasIngredient(item.name));
  const bulkCount = Math.min(unqueued.length, PANTRY_BULK_ADD);

  return (
    <section
      aria-label="Kitchen pantry"
      className="glass-card-premium rounded-2xl p-4 border border-emerald-500/20 bg-emerald-950/10"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>📦</span>
          <span className="text-xs font-semibold text-emerald-300">
            From Your Kitchen Pantry ({items.length} items saved)
          </span>
        </div>
        {bulkCount > 0 && (
          <button
            type="button"
            onClick={() => unqueued.slice(0, PANTRY_BULK_ADD).forEach(queue)}
            className={`text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer rounded ${FOCUS_RING}`}
          >
            + Add unqueued ({bulkCount})
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, PANTRY_SHOWN).map((item) => (
          <PantryChip
            key={item.id}
            item={item}
            queued={hasIngredient(item.name)}
            onAdd={() => queue(item)}
          />
        ))}
      </div>
    </section>
  );
}
