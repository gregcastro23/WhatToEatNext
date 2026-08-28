import { useState, useEffect, useMemo } from "react";
import type { AstrologicalState } from "@/types/celestial";
import { getCurrentAstrologicalState } from "@/utils/astrologyUtils";
import { createLogger } from "@/utils/logger";
import { useAlchemical } from "./useAlchemical";

const _logger = createLogger("use-astrological-influence");

export interface AstrologicalInfluence {
  planetaryDay: string | null;
  planetaryHour: string | null;
  lunarPhase: string | null;
  dominantElement: string | null;
  aspectStrength: number | null;
  overallInfluence: number | null;
}

export interface UseAstrologicalInfluenceReturn extends AstrologicalInfluence {
  isLoading: boolean;
  error: string | null;
  astrologicalState: AstrologicalState | null;
}

export function useAstrologicalInfluence(): UseAstrologicalInfluenceReturn {
  const {
    planetaryPositions,
    isLoading: alchemicalIsLoading,
    error: alchemicalError,
  } = useAlchemical();

  const [astrologicalState, setAstrologicalState] = useState<AstrologicalState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAstrologicalState(): Promise<void> {
      setIsLoading(true);
      try {
        const state = await getCurrentAstrologicalState();
        setAstrologicalState(state);
      } catch (err) {
        _logger.error("Failed to get astrological state: ", err);
        setError("Failed to fetch astrological state.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAstrologicalState().catch(() => {});
  }, []);

  const influence = useMemo((): AstrologicalInfluence | null => {
    if (
      isLoading ||
      alchemicalIsLoading ||
      !astrologicalState
    ) {
      return null;
    }

    // Calculate dominant element from planetary positions
    const elementCounts: Record<"Fire" | "Water" | "Earth" | "Air", number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const elementMap: Record<string, "Fire" | "Water" | "Earth" | "Air"> = {
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
    Object.values(planetaryPositions).forEach((position) => {
      const element = elementMap[position.sign.toLowerCase()];
      elementCounts[element]++;
    });

    const [dominantElement] = Object.entries(elementCounts).reduce((a, b) =>
      elementCounts[a[0] as keyof typeof elementCounts] >
      elementCounts[b[0] as keyof typeof elementCounts]
        ? a
        : b,
    );

    // Calculate aspect strength (simplified)
    const aspectStrength = astrologicalState.aspects
      ? Math.min(1, astrologicalState.aspects.length / 10)
      : 0;

    // Calculate overall influence
    const lunarPhaseStrength =
      astrologicalState.lunarPhase === "full moon"
        ? 1.0
        : astrologicalState.lunarPhase === "new moon"
          ? 0.3
          : 0.6;

    const overallInfluence = aspectStrength * 0.4 + lunarPhaseStrength * 0.6;

    const stateRecord = astrologicalState as Record<string, unknown>;

    return {
      planetaryDay: typeof stateRecord.planetaryDay === "string" ? stateRecord.planetaryDay : null,
      planetaryHour: typeof astrologicalState.planetaryHour === "string" ? astrologicalState.planetaryHour : null,
      lunarPhase: astrologicalState.lunarPhase ? String(astrologicalState.lunarPhase) : null,
      dominantElement,
      aspectStrength,
      overallInfluence,
    };
  }, [astrologicalState, planetaryPositions, isLoading, alchemicalIsLoading]);

  const combinedIsLoading = isLoading || alchemicalIsLoading;
  const combinedError = error ?? alchemicalError;

  return {
    planetaryDay: influence?.planetaryDay ?? null,
    planetaryHour: influence?.planetaryHour ?? null,
    lunarPhase: influence?.lunarPhase ?? null,
    dominantElement: influence?.dominantElement ?? null,
    aspectStrength: influence?.aspectStrength ?? null,
    overallInfluence: influence?.overallInfluence ?? null,
    isLoading: combinedIsLoading,
    error: combinedError,
    astrologicalState,
  };
}
