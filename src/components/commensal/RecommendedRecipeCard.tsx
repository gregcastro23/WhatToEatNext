"use client";

import React, { useState } from "react";
import type { Recipe } from "@/types/recipe";

export interface ScoredRecipeView {
  recipe: Recipe;
  score: number;
  scoreBreakdown: {
    nutritionalGap: number;
    elementalMatch: number;
    favoriteBoost: number;
    astrologicalAlignment: number;
    diversityBonus: number;
  };
  reason: string;
}

interface Props {
  scored: ScoredRecipeView;
  defaultServings?: number;
  /** When true, render compact (no instructions, no servings slider) — used in lists */
  compact?: boolean;
}

function pct(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

export function RecommendedRecipeCard({
  scored,
  defaultServings = 1,
  compact = false,
}: Props) {
  const [servings, setServings] = useState(defaultServings);
  const { recipe, score, scoreBreakdown, reason } = scored;
  const overall = pct(score);

  return (
    <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-pink-300/80 mb-1">
            Top alchemical match
          </p>
          <h3 className="text-2xl font-bold text-white leading-tight">
            {recipe.name}
          </h3>
          {recipe.cuisine && (
            <p className="text-xs text-purple-300/80 mt-1">
              {recipe.cuisine} cuisine
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="px-3 py-1 rounded-full bg-pink-500/15 border border-pink-300/30 text-xs font-mono text-pink-100">
            Match {overall}%
          </span>
          {!compact && (
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs text-purple-300/80">Servings</label>
              <input
                type="range"
                min={1}
                max={10}
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value, 10))}
                className="w-24 accent-pink-500"
              />
              <span className="font-mono text-pink-200 text-sm w-5 text-right">
                {servings}
              </span>
            </div>
          )}
        </div>
      </div>

      {recipe.description && (
        <p className="text-sm text-gray-300 mb-4">{recipe.description}</p>
      )}

      <p className="text-sm text-purple-200/90 italic mb-5">{reason}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        <ScoreBar
          label="Astrological"
          value={pct(scoreBreakdown.astrologicalAlignment)}
        />
        <ScoreBar
          label="Elemental"
          value={pct(scoreBreakdown.elementalMatch)}
        />
        <ScoreBar
          label="Diversity"
          value={pct(scoreBreakdown.diversityBonus)}
        />
        <ScoreBar
          label="Nutrition"
          value={pct(scoreBreakdown.nutritionalGap)}
        />
      </div>

      {!compact && recipe.ingredients?.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-pink-200 mb-2 border-b border-white/10 pb-1 text-sm">
            Ingredients (scaled to {servings} serving{servings === 1 ? "" : "s"})
          </h4>
          <ul className="space-y-1 text-sm">
            {recipe.ingredients.map((ing, i) => {
              const parsed =
                typeof ing.amount === "string"
                  ? parseFloat(ing.amount)
                  : Number(ing.amount);
              const amount = (Number.isFinite(parsed) ? parsed : 1) * servings;
              return (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-gray-300">{ing.name}</span>
                  <span className="text-pink-300 font-mono">
                    {Number.isInteger(amount) ? amount : amount.toFixed(1)}
                    {ing.unit ? ` ${ing.unit}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!compact && recipe.instructions?.length > 0 && (
        <div>
          <h4 className="font-semibold text-pink-200 mb-2 border-b border-white/10 pb-1 text-sm">
            Method
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-300">
            {recipe.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-purple-300/70">
          {label}
        </span>
        <span className="text-xs font-mono text-purple-100">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-400/80 to-pink-400/80"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default RecommendedRecipeCard;
