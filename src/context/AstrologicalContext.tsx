'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';

import alchemicalEngine from '@/calculations/alchemicalEngine';
import { ChakraEnergies } from '@/types/alchemy';
import { AstrologicalState } from '@/types/celestial';
import { isChakraEnergies } from '@/utils/typeGuards';

// ========== COMPLETE ASTROLOGICAL CONTEXT IMPLEMENTATION ==========;

// Phase 5: Type-safe interfaces for astrological context
interface SafeElementalProperties {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number
}

interface _ {
  elements?: SafeElementalProperties,
  [key: string]: unknown
}

// Define the context type
interface AstrologicalContextType {
  currentZodiac: string,
  astrologicalState: AstrologicalState | null,
  chakraEnergies: ChakraEnergies | null,
  loading: boolean,
  error: string | null,
  updateZodiac: (zodiac: string) => void
}

// Create the context
const AstrologicalContext = createContext<AstrologicalContextType | undefined>(undefined);

// AstrologicalProvider component
interface AstrologicalProviderProps {
  children: ReactNode
}

export function AstrologicalProvider({ children }: AstrologicalProviderProps) {
  const [currentZodiac, setCurrentZodiac] = useState<string>('aries');
  const [astrologicalState, setAstrologicalState] = useState<AstrologicalState | null>(null);
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update zodiac and recalculate state
  const updateZodiac = (zodiac: string) => {
    setCurrentZodiac(zodiac);
    void calculateAstrologicalState(zodiac);
  };

  // Calculate astrological state based on zodiac
  const calculateAstrologicalState = useCallback(async (zodiac: string) => {
    setLoading(true);
    setError(null);

    try {
      // Mock calculation - in real implementation this would use actual astrological calculations
      const elementalProperties: SafeElementalProperties = {
        Fire: zodiac === 'aries' || zodiac === 'leo' || zodiac === 'sagittarius' ? 0.7 : 0.2,
        Water: zodiac === 'cancer' || zodiac === 'scorpio' || zodiac === 'pisces' ? 0.7 : 0.2,
        Earth: zodiac === 'taurus' || zodiac === 'virgo' || zodiac === 'capricorn' ? 0.7 : 0.2,
        Air: zodiac === 'gemini' || zodiac === 'libra' || zodiac === 'aquarius' ? 0.7 : 0.2
      };

      // Calculate basic alchemical values from elemental properties
      const alchemicalValues = {
        Spirit: (elementalProperties.Fire + elementalProperties.Air) * 0.5,
        Essence: (elementalProperties.Water + elementalProperties.Fire) * 0.5,
        Matter: (elementalProperties.Earth + elementalProperties.Water) * 0.5,
        Substance: (elementalProperties.Earth + elementalProperties.Air) * 0.5
      };

      // Get current planetary hour (simple mock based on time)
      const currentHour = new Date().getHours();
      const planetaryHours = [
        'Sun',
        'Venus',
        'Mercury',
        'Moon',
        'Saturn',
        'Jupiter',
        'Mars'
      ] as const;
      const planetaryHour = planetaryHours[currentHour % 7];

      const mockState = {
        currentZodiac: zodiac as unknown,
        sunSign: zodiac as unknown, // Add sunSign property
        moonSign: zodiac as unknown, // Add moonSign property
        planetaryHour: planetaryHour, // Add planetary hour
        planetaryPositions: {
          sun: { sign: zodiac, degree: 15 },
          moon: { sign: zodiac, degree: 20 }
        },
        lunarPhase: 'full moon' as const,
        currentSeason: 'spring',
        elements: elementalProperties,
        alchemicalValues: alchemicalValues, // Add alchemical values
        dominantElement: Object.entries(elementalProperties).reduce((a, b) =>
          elementalProperties[a[0] as keyof SafeElementalProperties] >
          elementalProperties[b[0] as keyof SafeElementalProperties]
            ? a
            : b,
        )[0] as 'Fire' | 'Water' | 'Earth' | 'Air',
        activePlanets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'], // Add active planets
        isDaytime: currentHour >= 6 && currentHour < 18, // Simple day/night calculation
      } as AstrologicalState;

      // Calculate chakra energies using alchemical engine with safe property access
      const chakraResult = alchemicalEngine.calculateChakraEnergies(
        elementalProperties as unknown as Record<string, number>,
      );

      if (isChakraEnergies(chakraResult)) {
        setChakraEnergies(chakraResult);
      }

      setAstrologicalState(mockState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any external values

  // Initialize with current zodiac on mount
  useEffect(() => {
    void calculateAstrologicalState(currentZodiac);
  }, [calculateAstrologicalState, currentZodiac]);

  const value: AstrologicalContextType = {
    currentZodiac,
    astrologicalState,
    chakraEnergies,
    loading,
    error,
    updateZodiac
  };

  return <AstrologicalContext.Provider value={value}>{children}</AstrologicalContext.Provider>;
}

// useAstrologicalState hook (existing but needs proper export)
export function useAstrologicalState() {
  const context = useContext(AstrologicalContext);

  if (context === undefined) {
    throw new Error('useAstrologicalState must be used within an AstrologicalProvider');
  }

  return context;
}
