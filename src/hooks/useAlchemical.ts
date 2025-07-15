import { useState, useEffect, useCallback } from 'react';
import { PlanetPosition } from '@/utils/astrologyUtils';
import { PlanetaryPosition } from "@/types/celestial";

export interface AlchemicalState {
  planetaryPositions: { [key: string]: PlanetPosition };
  isDaytime: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAlchemical() {
  const [state, setState] = useState<AlchemicalState>({
    planetaryPositions: {},
    isDaytime: true,
    isLoading: true,
    error: null
  });

  const fetchPlanetaryPositions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/planetary-positions');
      if (!response.ok) {
        throw new Error(`Failed to fetch planetary positions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Determine if it's daytime (simplified - you might want to use more sophisticated logic)
      const now = new Date();
      const hour = now.getHours();
      const isDaytime = hour >= 6 && hour < 18;
      
      setState({
        planetaryPositions: data.positions || {},
        isDaytime,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  useEffect(() => {
    fetchPlanetaryPositions();
  }, [fetchPlanetaryPositions]);

  return {
    ...state,
    refresh: fetchPlanetaryPositions
  };
} 