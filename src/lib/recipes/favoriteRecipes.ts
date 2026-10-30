"use client";

/**
 * Client-safe Favorite Recipes & Tracked Ingredients Manager
 *
 * Synchronizes optimistically with localStorage under `alchm_favorite_recipes`
 * and persists to `/api/recipes/favorites` for authenticated users.
 * Aggregates personal ingredient frequencies across favorited recipes.
 *
 * @file src/lib/recipes/favoriteRecipes.ts
 */

import { useEffect, useState, useCallback, useMemo } from "react";

export const STORAGE_KEY_IDS = "alchm_favorite_recipes";
export const STORAGE_KEY_DATA = "alchm_favorite_recipes_data";
export const LEGACY_STORAGE_KEY = "alchm-recipe-favorites";

export interface FavoriteRecipeMetadata {
  id: string;
  name: string;
  cuisine?: string;
  ingredients: string[];
  likedIngredients: string[];
  elementalProfile?: Record<string, number>;
  notes?: string;
  favoritedAt: string;
}

export interface TrackedIngredient {
  name: string;
  count: number;
}

export function getStoredFavoriteRecipeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IDS) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredFavoriteRecipeIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(ids));
    // Also keep legacy key synced for backwards compatibility
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("alchm_recipe_favorites_changed"));
  } catch {
    // Ignore localStorage write failures
  }
}

export function getStoredFavoriteRecipesData(): Record<string, FavoriteRecipeMetadata> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredFavoriteRecipesData(data: Record<string, FavoriteRecipeMetadata>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    window.dispatchEvent(new Event("alchm_recipe_favorites_changed"));
  } catch {
    // Ignore
  }
}

/**
 * Toggle or save a favorite recipe.
 * Updates localStorage optimistically and dispatches sync to `/api/recipes/favorites`.
 */
export async function toggleFavoriteRecipeApi(recipe: {
  id: string;
  name: string;
  cuisine?: string;
  ingredients?: string[];
  likedIngredients?: string[];
  elementalProfile?: Record<string, number>;
  notes?: string;
  isFavorite?: boolean;
}): Promise<boolean> {
  const currentIds = getStoredFavoriteRecipeIds();
  const currentData = getStoredFavoriteRecipesData();

  const willFavorite =
    typeof recipe.isFavorite === "boolean"
      ? recipe.isFavorite
      : !currentIds.includes(recipe.id);

  // 1. Optimistic LocalStorage update
  let nextIds: string[];
  const nextData = { ...currentData };

  if (willFavorite) {
    nextIds = Array.from(new Set([...currentIds, recipe.id]));
    const cuisineVal = recipe.cuisine ?? nextData[recipe.id]?.cuisine;
    const elemVal = recipe.elementalProfile ?? nextData[recipe.id]?.elementalProfile;
    const notesVal = recipe.notes ?? nextData[recipe.id]?.notes;
    nextData[recipe.id] = {
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients ?? nextData[recipe.id]?.ingredients ?? [],
      likedIngredients: recipe.likedIngredients ?? nextData[recipe.id]?.likedIngredients ?? [],
      favoritedAt: new Date().toISOString(),
      ...(cuisineVal !== undefined ? { cuisine: cuisineVal } : {}),
      ...(elemVal !== undefined ? { elementalProfile: elemVal } : {}),
      ...(notesVal !== undefined ? { notes: notesVal } : {}),
    };
  } else {
    nextIds = currentIds.filter((id) => id !== recipe.id);
    delete nextData[recipe.id];
  }

  saveStoredFavoriteRecipeIds(nextIds);
  saveStoredFavoriteRecipesData(nextData);

  // 2. Background Server Sync
  try {
    await fetch("/api/recipes/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeId: recipe.id,
        recipeName: recipe.name,
        cuisine: recipe.cuisine,
        ingredients: recipe.ingredients ?? [],
        likedIngredients: recipe.likedIngredients ?? [],
        elementalProfile: recipe.elementalProfile,
        notes: recipe.notes,
        isFavorite: willFavorite,
      }),
    });
  } catch {
    // optimistic local cache preserved when server sync is unavailable
  }

  return willFavorite;
}

/**
 * React hook for favorite recipes and aggregated ingredient tracking.
 */
export function useFavoriteRecipes() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesData, setFavoritesData] = useState<Record<string, FavoriteRecipeMetadata>>({});
  const [serverTopTracked, setServerTopTracked] = useState<TrackedIngredient[]>([]);
  const [serverTopLiked, setServerTopLiked] = useState<TrackedIngredient[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadLocal = useCallback(() => {
    setFavoriteIds(getStoredFavoriteRecipeIds());
    setFavoritesData(getStoredFavoriteRecipesData());
  }, []);

  useEffect(() => {
    reloadLocal();
    setIsLoaded(true);

    // Background fetch from server
    fetch("/api/recipes/favorites")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          if (Array.isArray(data.favoriteIds)) {
            const merged = Array.from(new Set([...getStoredFavoriteRecipeIds(), ...data.favoriteIds]));
            setFavoriteIds(merged);
            saveStoredFavoriteRecipeIds(merged);
          }
          if (Array.isArray(data.topTrackedIngredients)) {
            setServerTopTracked(data.topTrackedIngredients);
          }
          if (Array.isArray(data.topLikedIngredients)) {
            setServerTopLiked(data.topLikedIngredients);
          }
        }
      })
      .catch(() => {});

    const handler = () => reloadLocal();
    window.addEventListener("alchm_recipe_favorites_changed", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("alchm_recipe_favorites_changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, [reloadLocal]);

  const isFavorite = useCallback(
    (recipeId: string) => favoriteIds.includes(recipeId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (recipe: {
      id: string;
      name: string;
      cuisine?: string;
      ingredients?: string[];
      likedIngredients?: string[];
      elementalProfile?: Record<string, number>;
      notes?: string;
      isFavorite?: boolean;
    }) => {
      const result = await toggleFavoriteRecipeApi(recipe);
      reloadLocal();
      return result;
    },
    [reloadLocal],
  );

  const updateLikedIngredients = useCallback(
    async (
      recipeId: string,
      likedIngredients: string[],
      recipeMeta?: {
        name?: string;
        cuisine?: string;
        ingredients?: string[];
      },
    ) => {
      const currentData = getStoredFavoriteRecipesData();
      const existing = currentData[recipeId];
      const cuisineVal = existing?.cuisine || recipeMeta?.cuisine;
      const elemVal = existing?.elementalProfile;
      const notesVal = existing?.notes;
      const updatedItem: FavoriteRecipeMetadata = {
        id: recipeId,
        name: existing?.name || recipeMeta?.name || "Recipe",
        ingredients: existing?.ingredients || recipeMeta?.ingredients || [],
        likedIngredients,
        favoritedAt: existing?.favoritedAt || new Date().toISOString(),
        ...(cuisineVal !== undefined ? { cuisine: cuisineVal } : {}),
        ...(elemVal !== undefined ? { elementalProfile: elemVal } : {}),
        ...(notesVal !== undefined ? { notes: notesVal } : {}),
      };

      currentData[recipeId] = updatedItem;
      saveStoredFavoriteRecipesData(currentData);

      // If it wasn't in favoriteIds, add it
      const currentIds = getStoredFavoriteRecipeIds();
      if (!currentIds.includes(recipeId)) {
        saveStoredFavoriteRecipeIds([...currentIds, recipeId]);
      }
      reloadLocal();

      try {
        await fetch("/api/recipes/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipeId,
            recipeName: updatedItem.name,
            cuisine: updatedItem.cuisine,
            ingredients: updatedItem.ingredients,
            likedIngredients,
            isFavorite: true,
          }),
        });
      } catch {
        // Ignore background failure
      }
    },
    [reloadLocal],
  );

  const getLikedIngredients = useCallback(
    (recipeId: string): string[] => favoritesData[recipeId]?.likedIngredients || [],
    [favoritesData],
  );

  // Compute local ingredient frequencies if server hasn't provided them yet
  const topTrackedIngredients = useMemo<TrackedIngredient[]>(() => {
    if (serverTopTracked.length > 0) return serverTopTracked;
    const counts: Record<string, number> = {};
    for (const item of Object.values(favoritesData)) {
      for (const ing of item.ingredients || []) {
        if (!ing.trim()) continue;
        const norm = ing.trim();
        counts[norm] = (counts[norm] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 30);
  }, [favoritesData, serverTopTracked]);

  const topLikedIngredients = useMemo<TrackedIngredient[]>(() => {
    if (serverTopLiked.length > 0) return serverTopLiked;
    const counts: Record<string, number> = {};
    for (const item of Object.values(favoritesData)) {
      for (const ing of item.likedIngredients || []) {
        if (!ing.trim()) continue;
        const norm = ing.trim();
        counts[norm] = (counts[norm] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 20);
  }, [favoritesData, serverTopLiked]);

  return {
    favoriteIds,
    favoritesData,
    isLoaded,
    isFavorite,
    toggleFavorite,
    updateLikedIngredients,
    getLikedIngredients,
    topTrackedIngredients,
    topLikedIngredients,
  };
}
