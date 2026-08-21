import Link from "next/link";
import React from "react";
import type { RecipeDetail, RecipeIngredient } from "./types";

interface RecipeExpandedViewProps {
  recipe: RecipeDetail;
  alchmKitchenPath?: string;
}

const EL_COLORS: Record<string, string> = {
  Fire: "bg-gradient-to-r from-orange-500 to-red-500",
  Water: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Air: "bg-gradient-to-r from-sky-400 to-purple-500",
  Earth: "bg-gradient-to-r from-emerald-500 to-lime-500",
};

const RecipeMetadataStrip: React.FC<{ recipe: RecipeDetail }> = ({ recipe }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] uppercase tracking-widest font-mono text-white/50 bg-white/[0.02] p-3 rounded-xl border border-white/5">
    {recipe.cuisine && (
      <div>
        <span className="block text-white/30 text-[8px] font-bold">Cuisine</span>
        <span className="text-purple-300 font-bold">{recipe.cuisine}</span>
      </div>
    )}
    {recipe.mealType && recipe.mealType.length > 0 && (
      <div>
        <span className="block text-white/30 text-[8px] font-bold">Meal Type</span>
        <span className="text-purple-300 font-bold">{recipe.mealType.join(", ")}</span>
      </div>
    )}
    {recipe.prepTime !== undefined && (
      <div>
        <span className="block text-white/30 text-[8px] font-bold">Prep Time</span>
        <span>{recipe.prepTime}m</span>
      </div>
    )}
    {recipe.cookTime !== undefined && (
      <div>
        <span className="block text-white/30 text-[8px] font-bold">Cook Time</span>
        <span>{recipe.cookTime}m</span>
      </div>
    )}
  </div>
);

const RecipeIngredientsCol: React.FC<{ ingredients?: RecipeIngredient[]; elementalProperties?: Record<string, number | undefined> }> = ({
  ingredients,
  elementalProperties,
}) => (
  <div className="md:col-span-2 space-y-4">
    <div>
      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Ingredients</h4>
      {ingredients && ingredients.length > 0 ? (
        <ul className="space-y-1 text-xs text-white/80 list-disc pl-4 leading-relaxed">
          {ingredients.map((ing, i) => (
            <li key={ing.name ?? i}>
              {(ing.amount ?? 0) > 0 && `${ing.amount} `}
              {ing.unit && `${ing.unit} `}
              <span className="font-medium text-white">{ing.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/30">No ingredients listed.</p>
      )}
    </div>

    {elementalProperties && (
      <div className="pt-3 border-t border-white/5">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Elemental Profile</h4>
        <div className="space-y-2">
          {Object.entries(elementalProperties).map(([el, val]) => {
            const percent = Math.round((val ?? 0) * 100);
            const bg = EL_COLORS[el] ?? "bg-purple-600";
            return (
              <div key={el} className="text-[10px]">
                <div className="flex justify-between text-white/60 mb-0.5 font-mono">
                  <span>{el}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full ${bg}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

const RecipeTimingNotes: React.FC<{ timingRecs: string[]; alchmKitchenPath?: string }> = ({
  timingRecs,
  alchmKitchenPath,
}) => (
  <>
    {timingRecs.length > 0 && (
      <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-200/90 leading-relaxed">
        <span className="font-bold text-[10px] uppercase tracking-widest text-purple-400 block mb-1">✨ Planetary Timing & Tuning</span>
        <ul className="list-disc pl-4 space-y-1">
          {timingRecs.map((rec, i) => (
            <li key={rec + i}>{rec}</li>
          ))}
        </ul>
      </div>
    )}

    {alchmKitchenPath && (
      <div className="pt-4 border-t border-white/5 flex justify-end">
        <Link
          href={alchmKitchenPath}
          className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/20 transition-all font-mono"
        >
          Printable Standalone view →
        </Link>
      </div>
    )}
  </>
);

export const RecipeExpandedView: React.FC<RecipeExpandedViewProps> = ({ recipe, alchmKitchenPath }) => {
  const timingRecs = recipe.monicaOptimization?.planetaryTimingRecommendations ?? [];

  return (
    <div
      className="space-y-6 text-left"
      role="presentation"
      onClick={(event): void => { event.stopPropagation(); }}
      onKeyDown={(event): void => { event.stopPropagation(); }}
    >
      {recipe.description && (
        <p className="text-xs text-white/70 leading-relaxed italic font-serif">
          &ldquo;{recipe.description}&rdquo;
        </p>
      )}

      <RecipeMetadataStrip recipe={recipe} />

      <div className="grid md:grid-cols-5 gap-6">
        <RecipeIngredientsCol ingredients={recipe.ingredients} elementalProperties={recipe.elementalProperties} />
        <div className="md:col-span-3">
          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Instructions</h4>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <ol className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <li key={step + idx} className="flex gap-3 text-xs leading-relaxed text-white/80">
                  <span className="flex-none w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <p className="pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-white/30">No instructions available.</p>
          )}
        </div>
      </div>

      <RecipeTimingNotes timingRecs={timingRecs} alchmKitchenPath={alchmKitchenPath} />
    </div>
  );
};
