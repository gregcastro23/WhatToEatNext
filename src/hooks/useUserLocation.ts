"use client";

/**
 * useUserLocation — shared location capture for restaurant/cuisine discovery.
 *
 * Replaces the four near-identical `requestLocation` blocks previously copied
 * into RestaurantDiscovery, CuisineRestaurantFinder, LocalCuisineGroups, and
 * PlanetaryChartControls. Provides:
 *   - browser geolocation (with permission-aware status)
 *   - manual city entry via the keyless Nominatim geocoder (`/api/geocoding`)
 *   - lightweight localStorage persistence so the choice survives reloads
 *
 * @file src/hooks/useUserLocation.ts
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
  /** Human-readable label (city / "Current location"). */
  label?: string;
}

export interface CitySuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export type LocationStatus =
  | "idle"
  | "locating"
  | "ready"
  | "denied"
  | "error";

const STORAGE_KEY = "alchm_user_location";

function readStored(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserLocation>;
    if (
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number" &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng)
    ) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        label: typeof parsed.label === "string" ? parsed.label : undefined,
      };
    }
  } catch {
    // ignore malformed storage
  }
  return null;
}

function persist(loc: UserLocation | null): void {
  if (typeof window === "undefined") return;
  try {
    if (loc) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore quota errors
  }
}

interface UseUserLocationOptions {
  /** Seed coordinates (e.g. from the user's profile birth location). */
  initial?: UserLocation;
  /** Restore a previously persisted location on mount. Default: true. */
  persistChoice?: boolean;
}

export function useUserLocation(options?: UseUserLocationOptions) {
  const persistChoice = options?.persistChoice ?? true;
  const [location, setLocationState] = useState<UserLocation | null>(
    options?.initial ?? null,
  );
  const [status, setStatus] = useState<LocationStatus>(
    options?.initial ? "ready" : "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Restore persisted location once on mount (client only) if nothing seeded.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (options?.initial || !persistChoice) return;
    const stored = readStored();
    if (stored) {
      setLocationState(stored);
      setStatus("ready");
    }
  }, [options?.initial, persistChoice]);

  const setLocation = useCallback(
    (loc: UserLocation | null) => {
      setLocationState(loc);
      setStatus(loc ? "ready" : "idle");
      setError(null);
      if (persistChoice) persist(loc);
    },
    [persistChoice],
  );

  const requestBrowserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Location services are unavailable in this browser.");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Current location",
        };
        setLocationState(next);
        setStatus("ready");
        if (persistChoice) persist(next);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError(
            "Location permission denied. Enable it in your browser, or enter a city below.",
          );
        } else {
          setStatus("error");
          setError("Couldn't read your location. Please try again.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, [persistChoice]);

  /** Free-text city/address search via the Nominatim-backed geocoding route. */
  const searchCity = useCallback(
    async (query: string): Promise<CitySuggestion[]> => {
      const q = query.trim();
      if (q.length < 2) return [];
      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        const data = (await res.json()) as {
          success?: boolean;
          results?: CitySuggestion[];
        };
        return Array.isArray(data.results) ? data.results : [];
      } catch {
        return [];
      }
    },
    [],
  );

  const clearLocation = useCallback(() => {
    setLocationState(null);
    setStatus("idle");
    setError(null);
    if (persistChoice) persist(null);
  }, [persistChoice]);

  return {
    location,
    status,
    error,
    /** Trigger the browser geolocation prompt. */
    requestBrowserLocation,
    /** Set an explicit location (e.g. from a city search result). */
    setLocation,
    /** Reset to no-location. */
    clearLocation,
    /** Search cities by name; returns up to 5 suggestions. */
    searchCity,
  };
}

export default useUserLocation;
