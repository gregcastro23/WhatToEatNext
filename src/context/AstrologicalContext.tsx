/**
 * Astrological Context - Minimal Recovery Version
 *
 * Provides astrological state management with zodiac signs, elemental properties,
 * and chakra energies for the entire application.
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Type definitions
interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

interface AlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  thirdEye: number;
  crown: number;
}

interface AstrologicalState {
  currentZodiac: string;
  elementalProperties: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  planetaryHour: string;
  lunarPhase: string;
  dominantElement: string;
  timestamp: number;
}

// Define the context type
interface AstrologicalContextType {
  currentZodiac: string;
  astrologicalState: AstrologicalState | null;
  chakraEnergies: ChakraEnergies | null;
  loading: boolean;
  error: string | null;
  updateZodiac: (zodiac: string) => void;
}

// Create the context
const AstrologicalContext = createContext<AstrologicalContextType | undefined>(
  undefined,
);

// Custom hook to use the astrological context
export const useAstrologicalContext = (): AstrologicalContextType => {
  const context = useContext(AstrologicalContext);
  if (context === undefined) {
    throw new Error(
      "useAstrologicalContext must be used within an AstrologicalProvider",
    );
  }
  return context;
};

// Context provider component
export const AstrologicalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentZodiac, setCurrentZodiac] = useState<string>("aries");
  const [astrologicalState, setAstrologicalState] =
    useState<AstrologicalState | null>(null);
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Zodiac sign to element mapping
  const signToElement: Record<string, string> = {
    aries: "Fire", leo: "Fire", sagittarius: "Fire",
    taurus: "Earth", virgo: "Earth", capricorn: "Earth",
    gemini: "Air", libra: "Air", aquarius: "Air",
    cancer: "Water", scorpio: "Water", pisces: "Water",
  };

  // Function to calculate astrological state from live planetary data
  const calculateAstrologicalState = async (_zodiac: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Fetch real planetary positions from the astrologize API
      let planetSigns: Record<string, string> = {};

      try {
        const response = await fetch("/api/astrologize", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data._celestialBodies) {
            const planetKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
            for (const key of planetKeys) {
              const body = data._celestialBodies[key];
              if (body?.Sign?.key) {
                const titleKey = key.charAt(0).toUpperCase() + key.slice(1);
                planetSigns[titleKey] = body.Sign.key.toLowerCase();
              }
            }
            // Use Sun sign as the current zodiac
            if (planetSigns.Sun) {
              setCurrentZodiac(planetSigns.Sun);
            }
          }
        }
      } catch {
        // Silently fall back to zodiac-based calculation
      }

      // Calculate elemental properties from real planetary positions
      const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
      const planetValues = Object.values(planetSigns);

      let elementalProperties: ElementalProperties;

      if (planetValues.length > 0) {
        // Use actual planetary position data
        planetValues.forEach((sign) => {
          const element = signToElement[sign];
          if (element) elementCounts[element]++;
        });
        const total = planetValues.length;
        elementalProperties = {
          Fire: elementCounts.Fire / total,
          Water: elementCounts.Water / total,
          Earth: elementCounts.Earth / total,
          Air: elementCounts.Air / total,
        };
      } else {
        // Fallback: use zodiac-based approximation
        const zodiac = _zodiac.toLowerCase();
        elementalProperties = {
          Fire: (zodiac === "aries" || zodiac === "leo" || zodiac === "sagittarius") ? 0.7 : 0.2,
          Water: (zodiac === "cancer" || zodiac === "scorpio" || zodiac === "pisces") ? 0.7 : 0.2,
          Earth: (zodiac === "taurus" || zodiac === "virgo" || zodiac === "capricorn") ? 0.7 : 0.2,
          Air: (zodiac === "gemini" || zodiac === "libra" || zodiac === "aquarius") ? 0.7 : 0.2,
        };
      }

      // Calculate alchemical values
      const alchemicalValues = {
        Spirit: (elementalProperties.Fire + elementalProperties.Air) * 0.5,
        Essence: (elementalProperties.Water + elementalProperties.Fire) * 0.5,
        Matter: (elementalProperties.Earth + elementalProperties.Water) * 0.5,
        Substance: (elementalProperties.Earth + elementalProperties.Air) * 0.5,
      };

      // Calculate planetary hour
      const currentHour = new Date().getHours();
      const planetaryHours = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"] as const;
      const planetaryHour = planetaryHours[currentHour % 7];

      // Calculate lunar phase from Moon's ecliptic longitude relative to Sun
      let lunarPhase = "new moon";
      if (planetSigns.Sun && planetSigns.Moon) {
        // Approximate phase from sign distance
        const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
        const sunIdx = signs.indexOf(planetSigns.Sun);
        const moonIdx = signs.indexOf(planetSigns.Moon);
        if (sunIdx >= 0 && moonIdx >= 0) {
          const diff = ((moonIdx - sunIdx) + 12) % 12;
          if (diff <= 1) lunarPhase = "new moon";
          else if (diff <= 3) lunarPhase = "waxing crescent";
          else if (diff <= 4) lunarPhase = "first quarter";
          else if (diff <= 5) lunarPhase = "waxing gibbous";
          else if (diff <= 7) lunarPhase = "full moon";
          else if (diff <= 8) lunarPhase = "waning gibbous";
          else if (diff <= 9) lunarPhase = "last quarter";
          else lunarPhase = "waning crescent";
        }
      }

      const astroState: AstrologicalState = {
        currentZodiac: planetSigns.Sun || _zodiac,
        elementalProperties,
        alchemicalProperties: alchemicalValues as AlchemicalProperties,
        planetaryHour,
        lunarPhase,
        dominantElement: Object.entries(elementalProperties).reduce(
          (max, [element, value]) =>
            value > max.value ? { element, value } : max,
          { element: "Fire", value: 0 },
        ).element,
        timestamp: Date.now(),
      };

      setAstrologicalState(astroState);

      // Calculate chakra energies
      const chakras: ChakraEnergies = {
        root: elementalProperties.Earth * 0.8 + 0.2,
        sacral: elementalProperties.Water * 0.8 + 0.2,
        solarPlexus: elementalProperties.Fire * 0.8 + 0.2,
        heart: (elementalProperties.Air + elementalProperties.Water) * 0.4 + 0.2,
        throat: elementalProperties.Air * 0.8 + 0.2,
        thirdEye: (elementalProperties.Air + elementalProperties.Water) * 0.4 + 0.2,
        crown: (elementalProperties.Fire + elementalProperties.Air) * 0.4 + 0.2,
      };

      setChakraEnergies(chakras);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Update zodiac sign and recalculate state
  const updateZodiac = (zodiac: string): void => {
    setCurrentZodiac(zodiac);
    void calculateAstrologicalState(zodiac);
  };

  // Initialize by fetching real planetary data
  useEffect(() => {
    void calculateAstrologicalState(currentZodiac);
  }, []);

  // Periodic updates (every 30 minutes) to refresh planetary positions
  useEffect(() => {
    const interval = setInterval(
      () => {
        void calculateAstrologicalState(currentZodiac);
      },
      30 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [currentZodiac]);

  const value: AstrologicalContextType = {
    currentZodiac,
    astrologicalState,
    chakraEnergies,
    loading,
    error,
    updateZodiac,
  };

  return (
    <AstrologicalContext.Provider value={value}>
      {children}
    </AstrologicalContext.Provider>
  );
};

export default AstrologicalContext;
