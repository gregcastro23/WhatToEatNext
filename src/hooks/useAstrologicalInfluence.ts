import { useState, useEffect, useMemo } from "react";
import { _logger } from "@/lib/logger";
import { AstrologicalState } from "@/types/celestial";
import { getCurrentAstrologicalState } from "@/utils/astrologyUtils";
import { useAlchemical } from "./useAlchemical";

export interface AstrologicalInfluence {
  planetaryDay: string | null;
  planetaryHour: string | null;
  lunarPhase: string | null;
  dominantElement: string | null;
  aspectStrength: number | null;
  overallInfluence: number | null;
}

export function useAstrologicalInfluence() {
  const {
    planetaryPositions,
    isLoading: alchemicalIsLoading,
    error: alchemicalError,
  } = useAlchemical();

  const [astrologicalState, setAstrologicalState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAstrologicalState() {
      setIsLoading(true);
      try {
        const state = await getCurrentAstrologicalState();
        setAstrologicalState(state);
      } catch (error) {
        _logger.error("Failed to get astrological state: ", error);
        setError("Failed to fetch astrological state.");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAstrologicalState();
  }, []);

  const influence = useMemo((): AstrologicalInfluence | null => {
    if (
      isLoading ||
      alchemicalIsLoading ||
      !astrologicalState ||
      !planetaryPositions
    ) {
      return null;
    }

    // Calculate dominant element from planetary positions
    const elementCounts = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const elementMap = {
      aries: "Fire",
      leo: "Fire",
      sagittarius: "Fire",
      taurus: "Earth",
      virgo: "Earth",
      capricorn: "Earth",
      gemini: "Air",
      libra: "Air",
      aquarius: "Air",
      cancer: "Water",
      scorpio: "Water",
      pisces: "Water",
    };
    Object.values(planetaryPositions || {}).forEach((position) => {
      const element =
        elementMap[(position as any)?.sign as keyof typeof elementMap];
      if (element) {
        elementCounts[element as keyof typeof elementCounts]++;
      }
    });

    const dominantElement =
      Object.keys(elementCounts).length > 0
        ? Object.entries(elementCounts).reduce((a, b) =>
            elementCounts[a[0] as keyof typeof elementCounts] >
            elementCounts[b[0] as keyof typeof elementCounts]
              ? a
              : b,
          )[0]
        : null;

    // Calculate aspect strength (simplified)
    const aspectStrength = astrologicalState.aspects
      ? Math.min(1, astrologicalState.aspects?.length / 10)
      : 0;

    // Calculate overall influence
    const lunarPhaseStrength =
      astrologicalState.lunarPhase === "full moon"
        ? 1.0
        : astrologicalState.lunarPhase === "new moon"
          ? 0.3
          : 0.6;

    const overallInfluence = aspectStrength * 0.4 + lunarPhaseStrength * 0.6;

    return {
      planetaryDay: astrologicalState.planetaryDay || null,
      planetaryHour: astrologicalState.planetaryHour || null,
      lunarPhase: astrologicalState.lunarPhase || null,
      dominantElement,
      aspectStrength,
      overallInfluence,
    };
  }, [astrologicalState, planetaryPositions, isLoading, alchemicalIsLoading]);

  const combinedIsLoading = isLoading || alchemicalIsLoading;
  const combinedError = error || alchemicalError;

  return {
    ...influence,
    isLoading: combinedIsLoading,
    error: combinedError,
    astrologicalState,
  };
}
