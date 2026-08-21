import React from "react";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import { ELEMENT_COLORS, ELEMENT_ICONS, ESMS_COLORS, type RecipePayloadItem } from "./types";

interface RecipeCardHeaderProps {
  recipe: RecipePayloadItem;
  recommendation: RecommendedMeal;
  index: number;
  total: number;
}

const ScoreCircle: React.FC<{ scorePercent: number }> = ({ scorePercent }) => (
  <div className="shrink-0">
    <div
      className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white shadow-lg ${
        scorePercent >= 80
          ? "bg-gradient-to-br from-emerald-500 to-teal-600"
          : scorePercent >= 60
            ? "bg-gradient-to-br from-purple-500 to-pink-500"
            : "bg-gradient-to-br from-amber-500 to-orange-500"
      }`}
    >
      <span className="text-xl font-black leading-none">{scorePercent}</span>
      <span className="text-[9px] opacity-80 font-medium">match</span>
    </div>
  </div>
);

const ElementalBars: React.FC<{ elementalProperties: Record<string, number> }> = ({ elementalProperties }) => (
  <div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
      Elemental Profile
    </div>
    <div className="space-y-1.5">
      {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
        const val = elementalProperties[el] ?? 0;
        const pct = Math.round(val * 100);
        const colors = ELEMENT_COLORS[el];
        return (
          <div key={el} className="flex items-center gap-2">
            <span className="text-xs w-4">{ELEMENT_ICONS[el]}</span>
            <span className="text-[10px] text-gray-500 w-8">{el}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${colors.bar}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-gray-500 w-7 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  </div>
);

const ESMSBadges: React.FC<{ alchProps: Record<string, number | string> }> = ({ alchProps }) => (
  <div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
      Alchemical (ESMS)
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      {(["Spirit", "Essence", "Matter", "Substance"] as const).map((prop) => {
        const val = alchProps[prop] ?? 0;
        const colors = ESMS_COLORS[prop];
        return (
          <div key={prop} className={`${colors.bg} ${colors.text} rounded-lg px-2 py-1.5 text-center`}>
            <div className="text-lg font-black leading-none">{typeof val === "number" ? val.toFixed(1) : val}</div>
            <div className="text-[9px] font-semibold opacity-70">{prop}</div>
          </div>
        );
      })}
    </div>
  </div>
);

const RecipePills: React.FC<{ recipe: RecipePayloadItem; mealType?: string }> = ({ recipe, mealType }) => (
  <div className="flex flex-wrap items-center gap-2 mt-2">
    {Boolean(recipe.cuisine) && (
      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
        {recipe.cuisine}
      </span>
    )}
    {Boolean(mealType) && (
      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold capitalize">
        {mealType}
      </span>
    )}
    {Boolean(recipe.prepTime ?? recipe.timeToMake) && (
      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
        Prep: {recipe.prepTime ?? recipe.timeToMake}
      </span>
    )}
    {Boolean(recipe.cookTime) && (
      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
        Cook: {recipe.cookTime}
      </span>
    )}
    {Boolean(recipe.numberOfServings) && (
      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
        {recipe.numberOfServings} servings
      </span>
    )}
  </div>
);

export const RecipeCardHeader: React.FC<RecipeCardHeaderProps> = ({ recipe, recommendation, index, total }) => {
  const displayScore = recommendation.personalizedScore ?? recommendation.score;
  const scorePercent = Math.round(displayScore * 100);
  const alchProps = recipe.alchemicalProperties;

  return (
    <>
      <div className="p-5 pb-4 bg-gradient-to-r from-gray-50 to-purple-50/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-medium">{index + 1} / {total}</span>
              {recommendation.isPersonalized && (recommendation.personalizationBoost ?? 1) > 1.05 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                  Chart Aligned
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{recipe.name}</h3>
            <RecipePills recipe={recipe} mealType={recommendation.mealType} />
          </div>
          <ScoreCircle scorePercent={scorePercent} />
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{recipe.description}</p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          {recipe.elementalProperties && <ElementalBars elementalProperties={recipe.elementalProperties} />}
          {alchProps && <ESMSBadges alchProps={alchProps} />}
        </div>
      </div>
    </>
  );
};
