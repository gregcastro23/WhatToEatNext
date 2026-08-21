import { useState, useCallback } from "react";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { saveRecipeToStore } from "@/utils/generatedRecipeStore";
import { createLogger } from "@/utils/logger";
import { getRecipeIdentity } from "./recipeHelpers";
import type { RecipePayloadItem } from "./types";

const logger = createLogger("useSaveRecipeAction");

async function persistLikedRecipe(
  recipe: RecipePayloadItem,
  refreshTasteGraph: () => Promise<void>,
  setToast: React.Dispatch<React.SetStateAction<string | null>>,
): Promise<void> {
  try {
    const res = await fetch("/api/users/me/recipes/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: recipe.name,
        cuisine: recipe.cuisine ?? recipe.cuisineType,
        source: "generator",
        sourceRecipeId: recipe.id,
        payload: recipe,
        action: "like",
      }),
    });
    if (!res.ok) {
      setToast(`Liked "${recipe.name}" locally (sync failed).`);
      return;
    }
    const data = (await res.json()) as { wasExisting?: boolean };
    setToast(
      data.wasExisting
        ? `"${recipe.name}" is already in your cookbook. Preferences refreshed.`
        : `Liked "${recipe.name}" and saved it to your cookbook.`,
    );
    await refreshTasteGraph();
  } catch (err: unknown) {
    logger.error("Like recipe failed", err);
    setToast(`Liked "${recipe.name}" locally (sync failed).`);
  }
}

export function useSaveRecipeAction(
  isAuthed: boolean,
  refreshTasteGraph: () => Promise<void>,
  setToast: React.Dispatch<React.SetStateAction<string | null>>,
): {
  likedRecipeIds: Set<string>;
  savingRecipeIds: Set<string>;
  handleSave: (recipe: RecipePayloadItem) => void;
} {
  const [likedRecipeIds, setLikedRecipeIds] = useState<Set<string>>(new Set());
  const [savingRecipeIds, setSavingRecipeIds] = useState<Set<string>>(new Set());

  const handleSave = useCallback(
    (recipe: RecipePayloadItem): void => {
      const recipeKey = getRecipeIdentity(recipe);
      saveRecipeToStore(recipe as unknown as MonicaOptimizedRecipe);
      setLikedRecipeIds((prev) => new Set(prev).add(recipeKey));
      if (!isAuthed) {
        setToast(`Liked "${recipe.name}" locally. Sign in to sync your cookbook.`);
        return;
      }
      setSavingRecipeIds((prev) => new Set(prev).add(recipeKey));
      setToast(`Liking "${recipe.name}"...`);
      persistLikedRecipe(recipe, refreshTasteGraph, setToast)
        .catch(() => {})
        .finally(() => {
          setSavingRecipeIds((prev) => {
            const next = new Set(prev);
            next.delete(recipeKey);
            return next;
          });
        });
    },
    [isAuthed, refreshTasteGraph, setToast],
  );

  return { likedRecipeIds, savingRecipeIds, handleSave };
}
