// src/components/recipes/RecipeCard.tsx
import React from "react";
import Link from "next/link";
import type { Recipe } from "@/types/recipe";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className={styles.recipeCard}>
        <h3 className={styles.recipeName}>{recipe.name}</h3>
        <p className={styles.recipeDescription}>{recipe.description}</p>
        {/* TEMPORARY DEBUG INFO */}
        {recipe.score !== undefined && (
          <p className="text-xs text-gray-500 mt-2">
            Raw Score: {recipe.score.toFixed(2)}
          </p>
        )}
        {recipe.alchemicalScores && (
          <p className="text-xs text-gray-500">
            Elemental: {recipe.alchemicalScores._elementalScore?.toFixed(2)}{" "}
            Zodiacal: {recipe.alchemicalScores._zodiacalScore?.toFixed(2)}{" "}
            Lunar: {recipe.alchemicalScores._lunarScore?.toFixed(2)}{" "}
            Planetary: {recipe.alchemicalScores._planetaryScore?.toFixed(2)}{" "}
            Seasonal: {recipe.alchemicalScores._seasonalScore?.toFixed(2)}
          </p>
        )}
        {/* END TEMPORARY DEBUG INFO */}
      </div>
    </Link>
  );
}
