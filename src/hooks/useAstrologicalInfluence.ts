import { useState, useEffect, useMemo } from 'react';
// TODO: Fix import - add what to import from "./useAlchemical.ts"
import { getCurrentAstrologicalState } from '@/utils/astrologyUtils';
import { Element } from "@/types/alchemy";
import { AstrologicalState } from "@/types/celestial";

export interface AstrologicalInfluence {
  planetaryDay: string;
  planetaryHour: string;
  lunarPhase: string;
  dominantElement: string;
  aspectStrength: number;
  overallInfluence: number;
}

export function useAstrologicalInfluence() {
  const { planetaryPositions, isLoading } = useAlchemical();
  const [astrologicalState, setAstrologicalState] = useState<any>(null);
  
  useEffect(() => {
    async function fetchAstrologicalState() {
      try {
        const state = await getCurrentAstrologicalState();
        setAstrologicalState(state);
      } catch (error) {
        console.error('Failed to get astrological state:', error);
      }
    }
    
    fetchAstrologicalState();
  }, []);

  const influence = useMemo((): AstrologicalInfluence => {
    if (!astrologicalState || !planetaryPositions) {
      return {
        planetaryDay: 'Sun',
        planetaryHour: 'Sun',
        lunarPhase: 'new moon',
        dominantElement: 'Fire',
        aspectStrength: 0.5,
        overallInfluence: 0.5
      };
    }

    // Calculate dominant element from planetary positions
    const elementCounts = { Fire: 0, Water: 0, Earth: 0, Air: 0  };
    const elementMap = {
      aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
      taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
      gemini: 'Air', libra: 'Air', aquarius: 'Air',
      cancer: 'Water', scorpio: 'Water', pisces: 'Water'
    };

    Object.values(planetaryPositions || {}).forEach(position => {
      const element = elementMap[position.sign as keyof typeof elementMap];
      if (element) {
        elementCounts[element as keyof typeof elementCounts]++;
      }
    });

    const dominantElement = Object.entries(elementCounts)?.reduce((a, b) => 
      elementCounts[a[0] as keyof typeof elementCounts] > elementCounts[b[0] as keyof typeof elementCounts] ? a : b
    )[0];

    // Calculate aspect strength (simplified)
    const aspectStrength = astrologicalState.aspects ? 
      Math.min(1, astrologicalState.aspects  || [].length / 10) : 0.5;

    // Calculate overall influence
    const lunarPhaseStrength = astrologicalState.lunarPhase === 'full moon' ? 1.0 : 
                              astrologicalState.lunarPhase === 'new moon' ? 0.3 : 0.6;
    
    const overallInfluence = (aspectStrength * 0.4 + lunarPhaseStrength * 0.6);

    return {
      planetaryDay: astrologicalState.planetaryDay || 'Sun',
      planetaryHour: astrologicalState.planetaryHour || 'Sun',
      lunarPhase: astrologicalState.lunarPhase || 'new moon',
      dominantElement,
      aspectStrength,
      overallInfluence
    };
  }, [astrologicalState, planetaryPositions]);

  return {
    ...influence,
    isLoading: isLoading || !astrologicalState,
    astrologicalState
  };
} 