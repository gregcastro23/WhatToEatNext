import { useState, useEffect, useCallback } from "react";
import { isJsonRecord, readJson } from "@/lib/api/json";
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

function isPlanetPositionRecord(val: unknown): val is Record<string, PlanetPosition> {
  if (!isJsonRecord(val)) return false;
  for (const v of Object.values(val)) {
    if (!isJsonRecord(v) || typeof v.sign !== "string" || typeof v.degree !== "number") {
      return false;
    }
  }
  return true;
}

function parsePositionsPayload(val: unknown): Record<string, PlanetPosition> {
  if (!isJsonRecord(val) || !isPlanetPositionRecord(val.positions)) return {};
  return val.positions;
}

function isPlanetaryCache(val: unknown): val is PlanetaryCache {
  return isJsonRecord(val) && typeof val.ts === "number" && isPlanetPositionRecord(val.positions);
}

function readCache(): PlanetaryCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPlanetaryCache(parsed)) return null;
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

      const positions = await readJson(response, { parse: parsePositionsPayload });
      writeCache(positions);

      setState({
        planetaryPositions: positions,
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
