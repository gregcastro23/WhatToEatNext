'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChakraEnergies } from '@/types/alchemy';
import alchemicalEngine from '@/calculations/alchemicalEngine';
import { isChakraEnergies } from '@/utils/typeGuards';

interface AstrologicalState {
  chakraEnergies: ChakraEnergies | null;
  planetaryPositions: Record<string, any> | null;
  zodiacEnergies: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const AstrologicalContext = createContext<AstrologicalState | undefined>(undefined);

export function AstrologicalProvider({ children }: { children: ReactNode }) {
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies | null>(null);
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, any> | null>(null);
  const [zodiacEnergies, setZodiacEnergies] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to load astrological data
  const loadAstrologicalData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate current planetary positions
      const positions = await alchemicalEngine.calculateCurrentPlanetaryPositions();
      setPlanetaryPositions(positions);
      
      // Calculate zodiac energies based on current planetary positions
      const zodiacEnergies = alchemicalEngine.calculateZodiacEnergies(positions);
      setZodiacEnergies(zodiacEnergies);
      
      // Calculate chakra energies based on zodiac energies
      const chakraEnergies = alchemicalEngine.calculateChakraEnergies(zodiacEnergies);
      
      // Validate the chakra energies
      if (isChakraEnergies(chakraEnergies)) {
        setChakraEnergies(chakraEnergies);
      } else {
        throw new Error('Invalid chakra energies data format');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error loading astrological data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadAstrologicalData();
  }, []);
  
  // Function to refresh data
  const refreshData = async () => {
    await loadAstrologicalData();
  };
  
  const value = {
    chakraEnergies,
    planetaryPositions,
    zodiacEnergies,
    isLoading,
    error,
    refreshData
  };
  
  return (
    <AstrologicalContext.Provider value={value}>
      {children}
    </AstrologicalContext.Provider>
  );
}

export function useAstrologicalState() {
  const context = useContext(AstrologicalContext);
  
  if (context === undefined) {
    throw new Error('useAstrologicalState must be used within an AstrologicalProvider');
  }
  
  return context;
} 