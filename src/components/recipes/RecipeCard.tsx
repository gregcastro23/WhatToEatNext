// src/components/recipes/RecipeCard.tsx
import Link from "next/link";
import React from "react";
import type { Recipe } from "@/types/recipe";
import styles from "./RecipeCard.module.css";

const PLANET_ICONS: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
};

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const score = recipe.score ?? (recipe as any).planetaryScore;
  const rulingPlanet = (recipe as any).rulingPlanet as string | undefined;
  const planetaryReason = (recipe as any).planetaryReason as string | undefined;
  const regionalVariant = (recipe as any).regionalVariant as string | undefined;

  const scoreColor =
    score != null && score >= 80
      ? "text-green-400"
      : score != null && score >= 60
        ? "text-amber-400"
        : "text-gray-400";

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className={styles.recipeCard}>
        <div className="flex items-start justify-between gap-2">
          <h3 className={styles.recipeName}>{recipe.name}</h3>
          {score != null && (
            <span
              className={`shrink-0 text-sm font-bold ${scoreColor}`}
            >
              {Math.round(score)}%
            </span>
          )}
        </div>

        {regionalVariant && (
          <span className="inline-block text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded mb-1">
            {regionalVariant}
          </span>
        )}

        <p className={styles.recipeDescription}>{recipe.description}</p>

        {(rulingPlanet || planetaryReason) && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            {rulingPlanet && (
              <span className="text-xs text-slate-400">
                {PLANET_ICONS[rulingPlanet] || ""} {rulingPlanet} ruled
              </span>
            )}
            {planetaryReason && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {planetaryReason}
              </p>
            )}
          </div>
        )}

        {recipe.elementalProperties && (
          <div className="flex gap-2 mt-2 text-xs text-slate-500">
            {recipe.elementalProperties.Fire > 0 && (
              <span>Fire {(recipe.elementalProperties.Fire * 100).toFixed(0)}%</span>
            )}
            {recipe.elementalProperties.Water > 0 && (
              <span>Water {(recipe.elementalProperties.Water * 100).toFixed(0)}%</span>
            )}
            {recipe.elementalProperties.Earth > 0 && (
              <span>Earth {(recipe.elementalProperties.Earth * 100).toFixed(0)}%</span>
            )}
            {recipe.elementalProperties.Air > 0 && (
              <span>Air {(recipe.elementalProperties.Air * 100).toFixed(0)}%</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
