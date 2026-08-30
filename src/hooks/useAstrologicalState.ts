import { useCallback, useEffect, useMemo, useState } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import {
  ELEMENT_TYPES,
  LUNAR_PHASES,
  type AstrologicalPosition,
  type AstrologicalPositionMap,
  type DignityType,
  type Element,
  type LunarPhaseWithSpaces,
  type ZodiacSignType,
} from "@/types";
import { logger } from "@/utils/logger";

interface AstroState {
  currentZodiac: string;
  currentPlanetaryAlignment: AstrologicalPositionMap;
  lunarPhase: LunarPhaseWithSpaces;
  activePlanets: string[];
  domElements: { Fire: number; Water: number; Earth: number; Air: number };
  loading: boolean;
}

// Interface for hook return value
export interface AstrologyHookData {
  currentZodiac: ZodiacSignType | string;
  currentPlanetaryAlignment: AstrologicalPositionMap;
  lunarPhase: LunarPhaseWithSpaces;
  activePlanets: string[];
  domElements: { Fire: number; Water: number; Earth: number; Air: number };
  loading: boolean;
  isReady: boolean;
  isDaytime: boolean;
  renderCount: number;
  currentPlanetaryHour: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function readOptionalElement(value: unknown): Element | undefined {
  return typeof value === "string"
    ? ELEMENT_TYPES.find((element) => element === value)
    : undefined;
}

const DIGNITIES: readonly DignityType[] = [
  "Domicile",
  "Exaltation",
  "Detriment",
  "Fall",
  "Neutral",
];

function readOptionalDignity(value: unknown): DignityType | undefined {
  return typeof value === "string"
    ? DIGNITIES.find((dignity) => dignity === value)
    : undefined;
}

function normalizeCelestialPosition(
  value: unknown,
): AstrologicalPosition | undefined {
  if (!isRecord(value)) return undefined;
  return {
    ...value,
    sign: readOptionalString(value.sign),
    degree: readOptionalNumber(value.degree),
    exactLongitude: readOptionalNumber(value.exactLongitude),
    isRetrograde:
      typeof value.isRetrograde === "boolean" ? value.isRetrograde : undefined,
    retrogradeSymbol: readOptionalString(value.retrogradeSymbol),
    minute: readOptionalNumber(value.minute),
    minutes: readOptionalNumber(value.minutes),
    speed: readOptionalNumber(value.speed),
    longitudeSpeed: readOptionalNumber(value.longitudeSpeed),
    arcminutesPerDay: readOptionalNumber(value.arcminutesPerDay),
    speedDisplay: readOptionalString(value.speedDisplay),
    phase: readOptionalString(value.phase),
    element: readOptionalElement(value.element),
    dignity: readOptionalDignity(value.dignity),
  };
}

function normalizePlanetaryPositions(value: unknown): AstrologicalPositionMap {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([planet, position]) => {
      const normalized = normalizeCelestialPosition(position);
      return normalized ? [[planet, normalized]] : [];
    }),
  );
}

function readLunarPhase(value: unknown): LunarPhaseWithSpaces | undefined {
  return typeof value === "string"
    ? LUNAR_PHASES.find((phase) => phase === value)
    : undefined;
}

export function useAstrologicalState(): AstrologyHookData {
  const { planetaryPositions, isDaytime, planetaryHour, lunarPhase } = useAlchemical();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [renderCount, setRenderCount] = useState<number>(0);

  // Track renders for debugging - add empty dependency array to run only once
  useEffect(() => {
    // We don't want to increment renderCount in every render cycle
    if (renderCount === 0) {
      setRenderCount(1);
      logger.debug(`Hook initialized`);
    }
  }, [renderCount]); // Added renderCount to deps

  // Initial state
  const [astroState, setAstroState] = useState<AstroState>({
    currentZodiac: "",
    currentPlanetaryAlignment: {},
    lunarPhase: "waxing crescent",
    activePlanets: [],
    domElements: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    loading: true,
  });

  // Calculate active planets based on their positions and dignities
  const getActivePlanets = useCallback(
    (
      positions: AstrologicalPositionMap,
    ): string[] => {
      // List of planets we want to check
      const planetKeys = [
        "sun",
        "moon",
        "mercury",
        "venus",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
        "pluto",
      ];
      const activePlanets: string[] = [];

      try {
        // Add ruling planet of current sun sign
        const sunSign = positions.sun?.sign?.toLowerCase();
        if (sunSign) {
          // Map signs to their ruling planets
          const signRulers: Partial<Record<string, string>> = {
            aries: "mars",
            taurus: "venus",
            gemini: "mercury",
            cancer: "moon",
            leo: "sun",
            virgo: "mercury",
            libra: "venus",
            scorpio: "mars",
            sagittarius: "jupiter",
            capricorn: "saturn",
            aquarius: "saturn", // Traditional ruler
            pisces: "jupiter", // Traditional ruler
          };

          // Add the ruler of the current sun sign
          const ruler = signRulers[sunSign];
          if (ruler && !activePlanets.includes(ruler)) {
            activePlanets.push(ruler);
          }
        }

        Object.entries(positions).forEach(([planet, position]) => {
          if (
            !planetKeys.includes(planet.toLowerCase()) ||
            !position?.sign
          ) {
            return;
          }

          const planetLower = planet.toLowerCase();
          const signLower = position.sign.toLowerCase();

          // Simple planet-sign dignity mapping
          const dignities: Partial<Record<string, string[]>> = {
            sun: ["leo", "aries"],
            moon: ["cancer", "taurus"],
            mercury: ["gemini", "virgo"],
            venus: ["taurus", "libra", "pisces"],
            mars: ["aries", "scorpio", "capricorn"],
            jupiter: ["sagittarius", "pisces", "cancer"],
            saturn: ["capricorn", "aquarius", "libra"],
            uranus: ["aquarius", "scorpio"],
            neptune: ["pisces", "cancer"],
            pluto: ["scorpio", "leo"],
          };

          // Check if planet is in a powerful sign position
          if (dignities[planetLower]?.includes(signLower)) {
            activePlanets.push(planetLower);
          }

          // Add special rulerships based on degree
          const degree = position.degree ?? 0;
          if (degree >= 0 && degree <= 15) {
            // Planets in early degrees are more powerful
            if (!activePlanets.includes(planetLower)) {
              activePlanets.push(planetLower);
            }
          }
        });
      } catch (error) {
        logger.error("Error calculating active planets", error);
      }

      // Ensure uniqueness
      return [...new Set(activePlanets)];
    },
    [],
  );

  // Memoize key values to prevent unnecessary updates
  const memoizedPlanetaryPositions = useMemo(
    () => normalizePlanetaryPositions(planetaryPositions),
    [planetaryPositions],
  );

  // Track changes to planetary positions and update state
  useEffect(() => {
    try {
      if (Object.keys(memoizedPlanetaryPositions).length > 0) {
        const activePlanets = getActivePlanets(memoizedPlanetaryPositions);
        const sunSign = memoizedPlanetaryPositions.sun?.sign;
        const currentZodiac =
          typeof sunSign === "string" ? sunSign.toLowerCase() : "";

        logger.debug("Updating astrological state: ", {
          currentZodiac,
          activePlanets,
          time: new Date().toISOString(),
        });

        setAstroState((prev) => {
          // Skip update if nothing changed to prevent unnecessary re-renders
          if (
            prev.currentZodiac === currentZodiac &&
            JSON.stringify(prev.activePlanets) ===
              JSON.stringify(activePlanets) &&
            JSON.stringify(prev.currentPlanetaryAlignment) ===
              JSON.stringify(memoizedPlanetaryPositions)
          ) {
            logger.debug("Skipping astro state update as nothing changed");
            return prev;
          }

          return {
            ...prev,
            currentZodiac,
            currentPlanetaryAlignment: memoizedPlanetaryPositions,
            activePlanets,
            loading: false,
          };
        });
        setIsReady(true);
      }
    } catch (error) {
      logger.error("Failed to update astrological state", error);
    }
  }, [memoizedPlanetaryPositions, getActivePlanets]);

  // Return the astro state with isReady flag
  return {
    ...astroState,
    isReady,
    isDaytime,
    renderCount,
    currentPlanetaryHour: planetaryHour,
    currentZodiac:
      astroState.currentZodiac.length > 0 ? astroState.currentZodiac : "aries",
    currentPlanetaryAlignment: astroState.currentPlanetaryAlignment,
    lunarPhase: readLunarPhase(lunarPhase) ?? astroState.lunarPhase,
  };
}
