"use client";

/**
 * One recipe suggestion as an obsidian dossier card: header and match score,
 * elemental profile, score breakdown, alignment rationale, pantry-aware
 * ingredients, steps, seasonal swaps, and actions.
 *
 * @file src/components/recipe-builder/carousel/RecipeDossierCard.tsx
 */

import React from "react";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import DossierActions from "./DossierActions";
import DossierHeader from "./DossierHeader";
import { DossierIngredients, DossierSteps } from "./DossierLists";
import { AlignmentRationale, SeasonalAdaptations } from "./DossierNotes";
import ElementalProfile from "./ElementalProfile";
import ScoreTelemetry from "./ScoreTelemetry";

interface RecipeDossierCardProps {
  meal: RecommendedMeal;
  onSaved: ((meal: RecommendedMeal) => void) | undefined;
}

export default function RecipeDossierCard({ meal, onSaved }: RecipeDossierCardProps): React.JSX.Element {
  const { recipe } = meal;
  return (
    <article
      aria-label={recipe.name}
      className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-black/80 via-black/70 to-purple-950/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all"
    >
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500" aria-hidden />
      <DossierHeader meal={meal} />
      <ElementalProfile values={recipe.elementalProperties} />
      <ScoreTelemetry meal={meal} />
      <AlignmentRationale reasons={meal.reasons} />
      <DossierIngredients ingredients={recipe.ingredients} />
      <DossierSteps steps={recipe.instructions} />
      <SeasonalAdaptations adaptation={recipe.seasonalAdaptation} />
      <DossierActions meal={meal} onSaved={onSaved} />
    </article>
  );
}
