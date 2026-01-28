"use client";

/**
 * Recipe Collections Hook
 * Manages favorites, custom collections, and recently viewed recipes
 *
 * @file src/hooks/useRecipeCollections.ts
 * @created 2026-01-28 (Session 7)
 */

import { useState, useEffect, useCallback } from "react";
import type { Recipe } from "@/types/recipe";

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

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
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
    setFavoriteIds(loadFromStorage(STORAGE_KEYS.favorites, []));
    setCollections(loadFromStorage(STORAGE_KEYS.collections, []));
    setRecentlyViewedIds(loadFromStorage(STORAGE_KEYS.recentlyViewed, []));
    setNotes(loadFromStorage(STORAGE_KEYS.recipeNotes, {}));
    setRatings(loadFromStorage(STORAGE_KEYS.recipeRatings, {}));
  }, []);

  // Favorites
  const toggleFavorite = useCallback((recipeId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId];
      saveToStorage(STORAGE_KEYS.favorites, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (recipeId: string) => favoriteIds.includes(recipeId),
    [favoriteIds],
  );

  // Collections
  const createCollection = useCallback(
    (name: string, description?: string) => {
      const newCollection: RecipeCollection = {
        id: `col-${Date.now()}`,
        name,
        description,
        recipeIds: [],
        createdAt: new Date().toISOString(),
      };
      setCollections((prev) => {
        const next = [...prev, newCollection];
        saveToStorage(STORAGE_KEYS.collections, next);
        return next;
      });
      return newCollection.id;
    },
    [],
  );

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
      const next = { ...prev, [recipeId]: rating };
      saveToStorage(STORAGE_KEYS.recipeRatings, next);
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
