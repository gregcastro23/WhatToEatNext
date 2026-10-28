import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  getStoredFavoriteIds,
  saveStoredFavoriteIds,
  toggleFavoriteApi,
} from "../favoriteRestaurants";

describe("favoriteRestaurants client sync", () => {
  const store = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };

  beforeEach(() => {
    store.clear();
    // @ts-expect-error mock window and localStorage
    globalThis.window = {
      localStorage: mockLocalStorage,
      dispatchEvent: () => true,
    };
    // @ts-expect-error mock localStorage
    globalThis.localStorage = mockLocalStorage;
  });

  it("reads empty favorites when localStorage is empty", () => {
    expect(getStoredFavoriteIds()).toEqual([]);
  });

  it("saves and reads stored favorite IDs", () => {
    saveStoredFavoriteIds(["rest_1", "partner_sol_taqueria"]);
    expect(getStoredFavoriteIds()).toEqual(["rest_1", "partner_sol_taqueria"]);
  });

  it("handles malformed JSON gracefully", () => {
    localStorage.setItem("alchm_favorite_restaurants", "{not-an-array}");
    expect(getStoredFavoriteIds()).toEqual([]);
  });

  it("toggles favorite on and persists to localStorage and API", async () => {
    const originalFetch = globalThis.fetch;
    let fetchedUrl = "";
    let fetchedBody = "";

    const mockFetch = mock(async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      fetchedUrl = String(url);
      fetchedBody = String(init?.body ?? "");
      return new Response(JSON.stringify({ success: true, isFavorite: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    globalThis.fetch = mockFetch;

    try {
      const isFav = await toggleFavoriteApi({
        id: "partner_celestial_ramen",
        name: "Celestial Noodle Sanctuary",
        cuisine: "Ramen",
      });

      expect(isFav).toBe(true);
      expect(getStoredFavoriteIds()).toContain("partner_celestial_ramen");
      expect(fetchedUrl).toContain("/api/restaurants/favorites");
      const parsedBody = JSON.parse(fetchedBody);
      expect(parsedBody.restaurantId).toBe("partner_celestial_ramen");
      expect(parsedBody.isFavorite).toBe(true);

      // Now toggle off
      const isFavAfterToggle = await toggleFavoriteApi({
        id: "partner_celestial_ramen",
        name: "Celestial Noodle Sanctuary",
        cuisine: "Ramen",
      });

      expect(isFavAfterToggle).toBe(false);
      expect(getStoredFavoriteIds()).not.toContain("partner_celestial_ramen");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
