"use client";

import { X } from "lucide-react";
import { usePlannerUI } from "./PlannerUIContext";

export default function RecipePlacementBanner() {
  const { state, stopPlacing } = usePlannerUI();
  if (!state.placingRecipe) return null;
  return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-active-violet bg-active-violet/10 p-3 text-sm text-primary">
      <span>Choose a meal slot for <strong>{state.placingRecipe.name}</strong>.</span>
      <button type="button" onClick={stopPlacing} className="inline-flex shrink-0 items-center gap-1 rounded-lg p-2 text-on-surface-variant focus-visible:ring-2 focus-visible:ring-active-violet">
        <X className="h-4 w-4" aria-hidden /> Cancel
      </button>
    </div>
  );
}
