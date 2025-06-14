'use client';

import { AstrologicalState } from '@/types/celestial';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChakraEnergies } from '@/types/alchemy';
import alchemicalEngine from '@/calculations/alchemicalEngine';
import { isChakraEnergies } from '@/utils/typeGuards';

// ========== COMPLETE ASTROLOGICAL CONTEXT IMPLEMENTATION ==========

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
const AstrologicalContext = createContext<AstrologicalContextType | undefined>(undefined);

// AstrologicalProvider component (missing export causing TS2305 errors)
export function AstrologicalProvider({ children }: { children: ReactNode }) {
  const [currentZodiac, setCurrentZodiac] = useState<string>('aries');
  const [astrologicalState, setAstrologicalState] = useState<AstrologicalState | null>(null);
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update zodiac and recalculate state
  const updateZodiac = (zodiac: string) => {
    setCurrentZodiac(zodiac);
    calculateAstrologicalState(zodiac);
  };

  // Calculate astrological state based on zodiac
  const calculateAstrologicalState = async (zodiac: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock calculation - in real implementation this would use actual astrological calculations
      const mockState: AstrologicalState = {
        currentZodiac: zodiac,
        planetaryPositions: {
          sun: { sign: zodiac, degree: 15 },
          moon: { sign: zodiac, degree: 20 }
        },
        lunarPhase: 'full moon',
        currentSeason: 'spring',
        elements: {
          Fire: zodiac === 'aries' || zodiac === 'leo' || zodiac === 'sagittarius' ? 0.7 : 0.2,
          Water: zodiac === 'cancer' || zodiac === 'scorpio' || zodiac === 'pisces' ? 0.7 : 0.2,
          Earth: zodiac === 'taurus' || zodiac === 'virgo' || zodiac === 'capricorn' ? 0.7 : 0.2,
          Air: zodiac === 'gemini' || zodiac === 'libra' || zodiac === 'aquarius' ? 0.7 : 0.2
        }
      };

      // Calculate chakra energies using alchemical engine
      const chakraResult = alchemicalEngine.calculateChakraEnergies(mockState.elements);
      
      if (isChakraEnergies(chakraResult)) {
        setChakraEnergies(chakraResult);
      }

      setAstrologicalState(mockState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initialize with current zodiac on mount
  useEffect(() => {
    calculateAstrologicalState(currentZodiac);
  }, []);

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
}

// useAstrologicalState hook (existing but needs proper export)
export function useAstrologicalState() {
  const context = useContext(AstrologicalContext);
  
  if (context === undefined) {
    throw new Error('useAstrologicalState must be used within an AstrologicalProvider');
  }
  
  return context;
}

