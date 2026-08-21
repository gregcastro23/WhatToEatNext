import { useState, useCallback } from "react";
import type { RecipeDetail } from "./types";

interface UseAgentRecipeViewerResult {
  expandedRecipes: Record<string, boolean>;
  recipeDetails: Record<string, RecipeDetail>;
  loadingRecipes: Record<string, boolean>;
  toggleRecipe: (artifactId: string, path?: string) => Promise<void>;
  getRecipeIdFromPath: (path?: string) => string | null;
}

export function getRecipeIdFromPath(path?: string): string | null {
  if (!path) return null;
  const parts = path.split("/");
  return parts[parts.length - 1] ?? null;
}

export function useAgentRecipeViewer(): UseAgentRecipeViewerResult {
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});
  const [recipeDetails, setRecipeDetails] = useState<Record<string, RecipeDetail>>({});
  const [loadingRecipes, setLoadingRecipes] = useState<Record<string, boolean>>({});

  const toggleRecipe = useCallback(async (artifactId: string, path?: string): Promise<void> => {
    const recipeId = getRecipeIdFromPath(path);
    if (!recipeId) return;

    setExpandedRecipes((prev) => ({ ...prev, [artifactId]: !prev[artifactId] }));

    const hasDetail = Object.prototype.hasOwnProperty.call(recipeDetails, recipeId);
    const isLoading = Object.prototype.hasOwnProperty.call(loadingRecipes, recipeId) && loadingRecipes[recipeId];

    if (!hasDetail && !isLoading) {
      setLoadingRecipes((prev) => ({ ...prev, [recipeId]: true }));
      try {
        const res = await fetch(`/api/recipes/${recipeId}`);
        if (res.ok) {
          const data = (await res.json()) as { success?: boolean; recipe?: RecipeDetail };
          if (data.success && data.recipe) {
            setRecipeDetails((prev) => ({ ...prev, [recipeId]: data.recipe as RecipeDetail }));
          }
        }
      } catch {
        // Graceful error fallback
      } finally {
        setLoadingRecipes((prev) => ({ ...prev, [recipeId]: false }));
      }
    }
  }, [loadingRecipes, recipeDetails]);

  return {
    expandedRecipes,
    recipeDetails,
    loadingRecipes,
    toggleRecipe,
    getRecipeIdFromPath,
  };
}
