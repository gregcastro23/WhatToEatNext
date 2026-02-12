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
      </div>
    </Link>
  );
}
