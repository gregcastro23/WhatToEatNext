import { useState, useEffect, useCallback } from "react";
import type { PlanetPosition } from "@/utils/astrologyUtils";

export interface AlchemicalState {
  planetaryPositions: { [key: string]: PlanetPosition };
  isDaytime: boolean;
  isLoading: boolean;
  error: string | null;
}

const CACHE_KEY = "alchm:planetary:cache";
const CACHE_TTL = 3_600_000; // 1 hour

interface PlanetaryCache {
  positions: { [key: string]: PlanetPosition };
  ts: number;
}

function readCache(): PlanetaryCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanetaryCache;
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(positions: { [key: string]: PlanetPosition }): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ positions, ts: Date.now() }));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — safe to skip
  }
}

export function useAlchemical() {
  const [state, setState] = useState<AlchemicalState>({
    planetaryPositions: {},
    isDaytime: true,
    isLoading: true,
    error: null,
  });

  const fetchPlanetaryPositions = useCallback(async () => {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;

    const cached = readCache();
    if (cached) {
      setState({
        planetaryPositions: cached.positions,
        isDaytime,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch("/api/planetary-positions");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch planetary positions: ${response.statusText}`,
        );
      }

      const data = await response.json();
      writeCache(data.positions || {});

      setState({
        planetaryPositions: data.positions || {},
        isDaytime,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    void fetchPlanetaryPositions();
  }, [fetchPlanetaryPositions]);

  return {
    ...state,
    refresh: fetchPlanetaryPositions,
  };
}
