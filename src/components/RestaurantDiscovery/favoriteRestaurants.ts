"use client";

/**
 * Shared favorites manager for restaurant sanctuaries.
 * Synchronizes instantly via localStorage for guest users and persists to
 * /api/restaurants/favorites for authenticated users.
 *
 * @file src/components/RestaurantDiscovery/favoriteRestaurants.ts
 */

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "alchm_favorite_restaurants";

export function getStoredFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredFavoriteIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("alchm_favorites_changed"));
  } catch {
    // Ignore localStorage write failures
  }
}

export async function toggleFavoriteApi(restaurant: {
  id: string;
  name: string;
  cuisine?: string | undefined;
  source?: string | undefined;
}): Promise<boolean> {
  const current = getStoredFavoriteIds();
  const willFavorite = !current.includes(restaurant.id);

  // Optimistic localStorage update
  const next = willFavorite
    ? [...current, restaurant.id]
    : current.filter((id) => id !== restaurant.id);
  saveStoredFavoriteIds(next);

  // Background server sync
  try {
    await fetch("/api/restaurants/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        cuisine: restaurant.cuisine,
        source: restaurant.source,
        isFavorite: willFavorite,
      }),
    });
  } catch {
    // optimistic local cache preserved when server sync is unavailable
  }

  return willFavorite;
}

export function useFavoriteRestaurants() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage immediately
    setFavoriteIds(getStoredFavoriteIds());
    setIsLoaded(true);

    // Also fetch remote favorites in background
    fetch("/api/restaurants/favorites")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.favoriteIds)) {
          const merged = Array.from(
            new Set([...getStoredFavoriteIds(), ...data.favoriteIds]),
          );
          setFavoriteIds(merged);
          saveStoredFavoriteIds(merged);
        }
      })
      .catch(() => {
        // Use local favorites on network failure
      });

    const handleStorage = () => {
      setFavoriteIds(getStoredFavoriteIds());
    };

    window.addEventListener("alchm_favorites_changed", handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("alchm_favorites_changed", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleFavorite = useCallback(
    async (restaurant: {
      id: string;
      name: string;
      cuisine?: string | undefined;
      source?: string | undefined;
    }) => {
      const willFavorite = !favoriteIds.includes(restaurant.id);
      const next = willFavorite
        ? [...favoriteIds, restaurant.id]
        : favoriteIds.filter((id) => id !== restaurant.id);
      setFavoriteIds(next);
      saveStoredFavoriteIds(next);

      try {
        await fetch("/api/restaurants/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            cuisine: restaurant.cuisine,
            source: restaurant.source,
            isFavorite: willFavorite,
          }),
        });
      } catch {
        // server sync failed; local cache remains active
      }
    },
    [favoriteIds],
  );

  const isFavorite = useCallback(
    (id: string | undefined): boolean => {
      if (!id) return false;
      return favoriteIds.includes(id);
    },
    [favoriteIds],
  );

  return { favoriteIds, isFavorite, toggleFavorite, isLoaded };
}
