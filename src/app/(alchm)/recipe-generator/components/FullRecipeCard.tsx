import React, { useState } from "react";
import { RecipeCardCollapsibles } from "./RecipeCardCollapsibles";
import { RecipeCardHeader } from "./RecipeCardHeader";
import type { FullRecipeCardProps, RecipePayloadItem } from "./types";

const ScoreBreakdownBar: React.FC<{
  recommendation: FullRecipeCardProps["recommendation"];
  alchProps?: Record<string, number | string>;
  monicaOpt?: RecipePayloadItem["monicaOptimization"];
}> = ({ recommendation, alchProps, monicaOpt }) => (
  <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
    <div className="px-3 py-1.5 bg-indigo-50 rounded-lg text-center">
      <div className="text-xs font-bold text-indigo-600">
        {Math.round(recommendation.dayAlignment * 100)}%
      </div>
      <div className="text-[9px] text-indigo-400">Day Alignment</div>
    </div>
    <div className="px-3 py-1.5 bg-purple-50 rounded-lg text-center">
      <div className="text-xs font-bold text-purple-600">
        {Math.round(recommendation.planetaryAlignment * 100)}%
      </div>
      <div className="text-[9px] text-purple-400">Planetary</div>
    </div>
    {recommendation.personalizationBoost !== undefined && (
      <div className="px-3 py-1.5 bg-pink-50 rounded-lg text-center">
        <div className="text-xs font-bold text-pink-600">
          {recommendation.personalizationBoost > 1
            ? `+${Math.round((recommendation.personalizationBoost - 1) * 100)}%`
            : `${Math.round((recommendation.personalizationBoost - 1) * 100)}%`}
        </div>
        <div className="text-[9px] text-pink-400">Chart Boost</div>
      </div>
    )}
    {alchProps?.monicaConstant !== undefined && (
      <div className="px-3 py-1.5 bg-amber-50 rounded-lg text-center">
        <div className="text-xs font-bold text-amber-600">
          {Number(alchProps.monicaConstant).toFixed(2)}
        </div>
        <div className="text-[9px] text-amber-400">Monica</div>
      </div>
    )}
    {alchProps?.kalchmConstant !== undefined && (
      <div className="px-3 py-1.5 bg-teal-50 rounded-lg text-center">
        <div className="text-xs font-bold text-teal-600">
          {Number(alchProps.kalchmConstant).toFixed(3)}
        </div>
        <div className="text-[9px] text-teal-400">KAlchm</div>
      </div>
    )}
    {monicaOpt?.optimizationScore !== undefined && (
      <div className="px-3 py-1.5 bg-green-50 rounded-lg text-center">
        <div className="text-xs font-bold text-green-600">
          {Math.round(monicaOpt.optimizationScore * 100)}%
        </div>
        <div className="text-[9px] text-green-400">Optimized</div>
      </div>
    )}
  </div>
);

const WhyThisRecipeCard: React.FC<{ reasons: string[] }> = ({ reasons }) => {
  if (reasons.length === 0) return null;
  return (
    <div className="mx-5 my-3 p-3 bg-purple-50/70 rounded-xl">
      <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1.5">
        Why This Recipe
      </div>
      <ul className="space-y-0.5">
        {reasons.slice(0, 5).map((reason, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-purple-700">
            <span className="text-purple-400 mt-0.5 shrink-0">&#x2713;</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const FullRecipeCard: React.FC<FullRecipeCardProps> = ({
  recommendation,
  index,
  total,
  onAddToPlanner,
  onSave,
  isLiked,
  isSaving,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("ingredients");
  const recipe = recommendation.recipe as unknown as RecipePayloadItem;
  const alchProps = recipe.alchemicalProperties;
  const monicaOpt = recipe.monicaOptimization;

  const toggleSection = (section: string): void => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <RecipeCardHeader recipe={recipe} recommendation={recommendation} index={index} total={total} />
      <ScoreBreakdownBar recommendation={recommendation} alchProps={alchProps} monicaOpt={monicaOpt} />
      <WhyThisRecipeCard reasons={recommendation.reasons} />
      <RecipeCardCollapsibles recipe={recipe} expandedSection={expandedSection} toggleSection={toggleSection} />

      {/* Action Buttons */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
        <button
          type="button"
          onClick={() => onSave(recipe)}
          disabled={isLiked || isSaving}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLiked ? "Liked" : isSaving ? "Liking..." : "Like Recipe"}
        </button>
        <button
          type="button"
          onClick={() => onAddToPlanner(recipe)}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-all active:scale-[0.98]"
        >
          + Meal Planner
        </button>
      </div>
    </div>
  );
};
