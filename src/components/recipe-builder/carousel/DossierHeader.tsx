"use client";

/**
 * A recipe dossier's header: name, cuisine / meal / time / servings tags,
 * the match-score ring, and the description.
 *
 * @file src/components/recipe-builder/carousel/DossierHeader.tsx
 */

import { Clock, Compass, Users } from "lucide-react";
import React from "react";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";

const TAG = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs";

function DossierTags({ meal }: { meal: RecommendedMeal }): React.JSX.Element {
  const { recipe } = meal;
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {recipe.cuisine && (
        <span className={`${TAG} font-medium capitalize border-purple-500/30 bg-purple-500/10 text-purple-200`}>
          <Compass className="h-3 w-3 text-purple-400" aria-hidden />
          {recipe.cuisine}
        </span>
      )}
      <span className={`${TAG} font-medium capitalize border-amber-500/30 bg-amber-500/10 text-amber-200`}>
        {meal.mealType}
      </span>
      {recipe.prepTime && (
        <span className={`${TAG} font-mono border-white/10 bg-white/5 text-gray-300`}>
          <Clock className="h-3 w-3 text-gray-400" aria-hidden />
          {recipe.prepTime}
        </span>
      )}
      {recipe.numberOfServings !== undefined && recipe.numberOfServings > 0 && (
        <span className={`${TAG} font-mono border-white/10 bg-white/5 text-gray-300`}>
          <Users className="h-3 w-3 text-gray-400" aria-hidden />
          {recipe.numberOfServings} servings
        </span>
      )}
    </div>
  );
}

/** Personalized score when the chart boosted it, otherwise the sky score; 0–1 → whole percent. */
export function matchPercent(meal: RecommendedMeal): number {
  return Math.round((meal.personalizedScore ?? meal.score) * 100);
}

export default function DossierHeader({ meal }: { meal: RecommendedMeal }): React.JSX.Element {
  const percent = matchPercent(meal);
  return (
    <div className="p-5 pb-3">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-2xl font-bold text-white tracking-wide leading-tight">
            {meal.recipe.name}
          </h3>
          <DossierTags meal={meal} />
        </div>
        <div
          className="shrink-0 relative flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-600/40 via-indigo-600/40 to-amber-500/30 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md"
          role="img"
          aria-label={`${percent}% match`}
        >
          <div className="flex flex-col items-center justify-center" aria-hidden>
            <span className="text-lg font-bold text-white leading-none">{percent}%</span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-purple-200/80">match</span>
          </div>
        </div>
      </div>
      {meal.recipe.description && (
        <p className="text-sm text-gray-300/90 line-clamp-2 mt-2 leading-relaxed">{meal.recipe.description}</p>
      )}
    </div>
  );
}
