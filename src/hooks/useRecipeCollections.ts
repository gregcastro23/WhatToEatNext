"use client";

/**
 * Recipe Collections Hook
 * Manages favorites, custom collections, and recently viewed recipes
 *
 * @file src/hooks/useRecipeCollections.ts
 * @created 2026-01-28 (Session 7)
 */

import { useState, useEffect, useCallback } from "react";
import { reportQuestEvent } from "@/lib/questReporter";

const STORAGE_KEYS = {
  favorites: "alchm-recipe-favorites",
  collections: "alchm-recipe-collections",
  recentlyViewed: "alchm-recently-viewed",
  recipeNotes: "alchm-recipe-notes",
  recipeRatings: "alchm-recipe-ratings",
};

export interface RecipeCollection {
  id: string;
  name: string;
  description?: string;
  recipeIds: string[];
  createdAt: string;
}

export interface RecipeNote {
  recipeId: string;
  text: string;
  updatedAt: string;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function parseRecipeCollections(raw: unknown): RecipeCollection[] {
  if (!Array.isArray(raw)) return [];
  const out: RecipeCollection[] = [];
  for (const item of raw) {
    if (
      !isPlainObject(item) ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.createdAt !== "string"
    ) {
      continue;
    }
    const collection: RecipeCollection = {
      id: item.id,
      name: item.name,
      recipeIds: parseStringArray(item.recipeIds),
      createdAt: item.createdAt,
    };
    if (typeof item.description === "string") {
      collection.description = item.description;
    }
    out.push(collection);
  }
  return out;
}

function parseStringRecord(raw: unknown): Record<string, string> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

function parseNumberRecord(raw: unknown): Record<string, number> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function loadFromStorage<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T,
): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed: unknown = JSON.parse(stored);
    return parse(parsed);
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function useRecipeCollections() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<RecipeCollection[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Load from localStorage on mount
  useEffect(() => {
    setFavoriteIds(loadFromStorage(STORAGE_KEYS.favorites, [], parseStringArray));
    setCollections(loadFromStorage(STORAGE_KEYS.collections, [], parseRecipeCollections));
    setRecentlyViewedIds(
      loadFromStorage(STORAGE_KEYS.recentlyViewed, [], parseStringArray),
    );
    setNotes(loadFromStorage(STORAGE_KEYS.recipeNotes, {}, parseStringRecord));
    setRatings(loadFromStorage(STORAGE_KEYS.recipeRatings, {}, parseNumberRecord));
  }, []);

  // Favorites
  const toggleFavorite = useCallback(
    (
      recipeId: string,
      recipeMeta?: {
        name?: string;
        cuisine?: string;
        ingredients?: string[];
      },
    ) => {
    setFavoriteIds((prev) => {
      const isRemoving = prev.includes(recipeId);
      const next = isRemoving
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId];
      saveToStorage(STORAGE_KEYS.favorites, next);
      saveToStorage("alchm_favorite_recipes", next);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("alchm_recipe_favorites_changed"));
      }
      if (!isRemoving) reportQuestEvent('save_recipe');

      // Sync to API in background
      if (recipeMeta) {
        fetch("/api/recipes/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipeId,
            recipeName: recipeMeta.name || "Recipe",
            cuisine: recipeMeta.cuisine,
            ingredients: recipeMeta.ingredients || [],
            isFavorite: !isRemoving,
          }),
        }).catch(() => {});
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (recipeId: string) => favoriteIds.includes(recipeId),
    [favoriteIds],
  );

  // Collections
  const createCollection = useCallback((name: string, description?: string) => {
    const newCollection: RecipeCollection = {
      id: `col-${Date.now()}`,
      name,
      ...(description !== undefined ? { description } : {}),
      recipeIds: [],
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => {
      const next = [...prev, newCollection];
      saveToStorage(STORAGE_KEYS.collections, next);
      return next;
    });
    return newCollection.id;
  }, []);

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== collectionId);
      saveToStorage(STORAGE_KEYS.collections, next);
      return next;
    });
  }, []);

  const addToCollection = useCallback(
    (collectionId: string, recipeId: string) => {
      setCollections((prev) => {
        const next = prev.map((c) =>
          c.id === collectionId && !c.recipeIds.includes(recipeId)
            ? { ...c, recipeIds: [...c.recipeIds, recipeId] }
            : c,
        );
        saveToStorage(STORAGE_KEYS.collections, next);
        return next;
      });
    },
    [],
  );

  const removeFromCollection = useCallback(
    (collectionId: string, recipeId: string) => {
      setCollections((prev) => {
        const next = prev.map((c) =>
          c.id === collectionId
            ? { ...c, recipeIds: c.recipeIds.filter((id) => id !== recipeId) }
            : c,
        );
        saveToStorage(STORAGE_KEYS.collections, next);
        return next;
      });
    },
    [],
  );

  // Recently viewed
  const markViewed = useCallback((recipeId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== recipeId);
      const next = [recipeId, ...filtered].slice(0, 20);
      saveToStorage(STORAGE_KEYS.recentlyViewed, next);
      return next;
    });
  }, []);

  // Notes
  const setRecipeNote = useCallback((recipeId: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [recipeId]: text };
      if (!text) delete next[recipeId];
      saveToStorage(STORAGE_KEYS.recipeNotes, next);
      return next;
    });
  }, []);

  const getRecipeNote = useCallback(
    (recipeId: string) => notes[recipeId] || "",
    [notes],
  );

  // Ratings
  const setRecipeRating = useCallback((recipeId: string, rating: number) => {
    setRatings((prev) => {
      const hadPriorRating = (prev[recipeId] ?? 0) > 0;
      const next = { ...prev, [recipeId]: rating };
      saveToStorage(STORAGE_KEYS.recipeRatings, next);
      // Only fire the quest event on the first rating for this recipe,
      // so users can't farm the quest by toggling stars.
      if (!hadPriorRating && rating > 0) reportQuestEvent('rate_recipe');
      return next;
    });
  }, []);

  const getRecipeRating = useCallback(
    (recipeId: string) => ratings[recipeId] || 0,
    [ratings],
  );

  return {
    // Favorites
    favoriteIds,
    toggleFavorite,
    isFavorite,

    // Collections
    collections,
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,

    // Recently viewed
    recentlyViewedIds,
    markViewed,

    // Notes
    setRecipeNote,
    getRecipeNote,

    // Ratings
    setRecipeRating,
    getRecipeRating,
  };
}
