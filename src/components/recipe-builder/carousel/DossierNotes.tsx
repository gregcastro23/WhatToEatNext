"use client";

/**
 * A dossier's prose notes: why the recipe aligns (the pipeline's reasons)
 * and its seasonal ingredient swaps.
 *
 * @file src/components/recipe-builder/carousel/DossierNotes.tsx
 */

import { Sparkles } from "lucide-react";
import React from "react";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";

export function AlignmentRationale({ reasons }: { reasons: readonly string[] }): React.JSX.Element | null {
  if (reasons.length === 0) return null;
  return (
    <div className="mx-5 mb-3 p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md">
      <div className="text-xs font-mono uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-amber-300" aria-hidden />
        Harmonic Alignment Rationale
      </div>
      <ul className="space-y-1">
        {reasons.slice(0, 4).map((reason, idx) => (
          <li key={`${idx}-${reason}`} className="flex items-start gap-2 text-xs text-purple-200/90 leading-relaxed">
            <span className="text-amber-400 mt-0.5" aria-hidden>✦</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SeasonalAdaptations({
  adaptation,
}: {
  adaptation: MonicaOptimizedRecipe["seasonalAdaptation"] | undefined;
}): React.JSX.Element | null {
  if (!adaptation || adaptation.seasonalIngredientSubstitutions.length === 0) return null;
  return (
    <div className="mx-5 mb-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-md">
      <div className="text-xs font-mono uppercase tracking-wider text-emerald-300 mb-1 flex items-center gap-1.5">
        <span aria-hidden>🌿</span>
        Seasonal Adaptations ({adaptation.currentSeason})
      </div>
      {adaptation.seasonalIngredientSubstitutions.slice(0, 2).map((sub) => (
        <p key={`${sub.original}-${sub.seasonal}`} className="text-xs text-emerald-200/90 leading-relaxed">
          Swap {sub.original} → {sub.seasonal} ({sub.reason})
        </p>
      ))}
    </div>
  );
}
