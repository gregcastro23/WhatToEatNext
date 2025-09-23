/**
 * Astrological Context - Minimal Recovery Version
 *
 * Provides astrological state management with zodiac signs, elemental properties,
 * and chakra energies for the entire application.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Type definitions
interface ElementalProperties {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number;
}

interface AlchemicalProperties {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number;
}

interface ChakraEnergies {
  root: number,
  sacral: number,
  solarPlexus: number,
  heart: number,
  throat: number,
  thirdEye: number,
  crown: number;
}

interface AstrologicalState {
  currentZodiac: string,
  elementalProperties: ElementalProperties,
  alchemicalProperties: AlchemicalProperties,
  planetaryHour: string,
  lunarPhase: string,
  dominantElement: string,
  timestamp: number;
}

// Define the context type
interface AstrologicalContextType {
  currentZodiac: string,
  astrologicalState: AstrologicalState | null,
  chakraEnergies: ChakraEnergies | null,
  loading: boolean,
  error: string | null,
  updateZodiac: (zodiac: string) => void;
}

// Create the context
const AstrologicalContext = createContext<AstrologicalContextType | undefined>(undefined);

// Custom hook to use the astrological context
export const useAstrologicalContext = (): AstrologicalContextType => {
  const context = useContext(AstrologicalContext);
  if (context === undefined) {
    throw new Error('useAstrologicalContext must be used within an AstrologicalProvider');
  }
  return context;
};

// Context provider component
export const AstrologicalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentZodiac, setCurrentZodiac] = useState<string>('aries');
  const [astrologicalState, setAstrologicalState] = useState<AstrologicalState | null>(null);
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to calculate astrological state based on zodiac sign
  const calculateAstrologicalState = async (zodiac: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Mock calculation - in real implementation this would use actual astrological calculations
      const elementalProperties: ElementalProperties = {
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
        currentZodiac: zodiac,
        elementalProperties,
        alchemicalProperties: alchemicalValues as AlchemicalProperties,
        planetaryHour,
        lunarPhase: 'waxing crescent', // Mock value
        dominantElement: Object.entries(elementalProperties)
          .reduce((max, [element, value]) => value > max.value ? { element, value } : max,
                  { element: 'Fire', value: 0 }).element,
        timestamp: Date.now()
      };

      setAstrologicalState(mockState);

      // Calculate chakra energies based on elemental properties
      const chakras: ChakraEnergies = {
        root: elementalProperties.Earth * 0.8 + 0.2,
        sacral: elementalProperties.Water * 0.8 + 0.2,
        solarPlexus: elementalProperties.Fire * 0.8 + 0.2,
        heart: (elementalProperties.Air + elementalProperties.Water) * 0.4 + 0.2,
        throat: elementalProperties.Air * 0.8 + 0.2,
        thirdEye: (elementalProperties.Air + elementalProperties.Water) * 0.4 + 0.2,
        crown: (elementalProperties.Fire + elementalProperties.Air) * 0.4 + 0.2
      };

      setChakraEnergies(chakras);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update zodiac sign and recalculate state
  const updateZodiac = (zodiac: string): void => {
    setCurrentZodiac(zodiac);
    calculateAstrologicalState(zodiac);
  };

  // Initialize with default zodiac sign
  useEffect(() => {
    calculateAstrologicalState(currentZodiac);
  }, []);

  // Periodic updates (every 10 minutes) to refresh planetary hour
  useEffect(() => {
    const interval = setInterval(() => {
      calculateAstrologicalState(currentZodiac);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [currentZodiac]);

  const value: AstrologicalContextType = {
    currentZodiac,
    astrologicalState,
    chakraEnergies,
    loading,
    error,
    updateZodiac
  };

  return (
    <AstrologicalContext.Provider value={value}>
      {children}
    </AstrologicalContext.Provider>
  );
};

export default AstrologicalContext;