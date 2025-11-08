"use client";
import { useMemo } from "react";
import { useUnifiedPlanetaryHour } from "@/hooks/useUnifiedPlanetaryHour";
import type { Planet } from "@/types/celestial";

interface PlanetaryHourData {
  currentPlanetaryHour: string;
  planetaryHourChakras: string[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get the current planetary hour
 * @returns The current planetary hour and associated chakras
 */
export function usePlanetaryHour(): PlanetaryHourData {
  const { planet, loading, error } = useUnifiedPlanetaryHour();

  const chakraMapping: Record<Planet, string[]> = useMemo(
    () => ({
      Sun: ["Crown", "Solar Plexus"],
      Moon: ["Third Eye", "Sacral"],
      Mercury: ["Throat", "Root"],
      Venus: ["Heart", "Sacral"],
      Mars: ["Root", "Solar Plexus"],
      Jupiter: ["Crown", "Heart"],
      Saturn: ["Root", "Third Eye"],
    } as any),
    [],
  );

  const planetaryHourChakras = planet ? chakraMapping[planet] || [] : [];
  const currentPlanetaryHour = planet || "";

  return {
    currentPlanetaryHour,
    planetaryHourChakras,
    isLoading: loading,
    error: error || null,
  };
}

export default usePlanetaryHour;
