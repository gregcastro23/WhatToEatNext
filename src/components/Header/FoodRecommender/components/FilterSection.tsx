// src/components/FoodRecommender/components/FilterSection.tsx

"use client"

import React, { useEffect, useState } from 'react';
import { Timer, Flame, Droplet, Wind, Mountain } from 'lucide-react';
import type { FilterOptions, NutritionPreferences, ElementalProperties, ZodiacSign, LunarPhaseWithSpaces } from '@/types/alchemy';
import { cuisines } from '@/data/cuisines';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { AlchemicalEngineAdvanced as AlchemicalEngine } from '@/calculations/alchemicalEngine';
import { calculateSeasonalElements } from '@/calculations/seasonalCalculations';
import { _getCurrentSeason, getDayOfYear, getMoonPhase, _getTimeOfDay } from '@/utils/dateUtils';
import { logger } from '@/utils/logger';

type FilterSectionProps = {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  nutritionPrefs: NutritionPreferences;
  setNutritionPrefs: React.Dispatch<React.SetStateAction<NutritionPreferences>>;
  resetAll: () => void;
};

const ElementIcons = {
  Fire: Flame,
  Water: Droplet,
  Air: Wind,
  Earth: Mountain
};

export default function FilterSection({
  filters,
  setFilters,
  nutritionPrefs,
  setNutritionPrefs,
  resetAll
}: FilterSectionProps) {
  const { state, dispatch } = useAlchemical();
  const calculator = new AlchemicalEngine();

  const [currentSunSign, setCurrentSunSign] = useState<ZodiacSign>('aries');
  const [sunDegrees, setSunDegrees] = useState<number>(0);

  useEffect(() => {
    const updateNaturalInfluences = async () => {
      try {
        const currentSeason = getCurrentSeason();
        const dayOfYear = getDayOfYear(new Date());
        const moonPhase = getMoonPhase().replace(/_/g, ' ') as LunarPhaseWithSpaces;
        const timeOfDay = getTimeOfDay();

        // Calculate base elemental properties
        const baseElements = calculator.calculateNaturalInfluences({
          season: currentSeason,
          moonPhase,
          timeOfDay: timeOfDay,
          sunSign: currentSunSign,
          degreesInSign: sunDegrees
        });

        // Apply seasonal influence
        const elementalState = calculateSeasonalElements(
          baseElements,
          currentSeason
        );

        // Update state with natural influences
        dispatch({
          type: 'SET_ELEMENTAL_PREFERENCE',
          payload: elementalState
        });

      } catch (error) {
        logger.error('Error calculating natural influences:', error);
      }
    };

    updateNaturalInfluences();
    // Update every hour
    const interval = setInterval(updateNaturalInfluences, 3600000);
    return () => clearInterval(interval);
  }, [currentSunSign, sunDegrees, calculator, dispatch]);

  useEffect(() => {
    // Get current date
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    
    // Simple calculation for sun sign and degrees
    // Each sign is roughly 30 days
    const signIndex = Math.floor((dayOfYear + 9) / 30.44) % 12; // +9 to align with aries start
    const daysIntoSign = (dayOfYear + 9) % 30.44;
    
    // Map index to zodiac sign
    const zodiacSigns: ZodiacSign[] = [
      'aries', 'taurus', 'gemini', 'cancer', 
      'leo', 'virgo', 'libra', 'scorpio', 
      'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    setCurrentSunSign(zodiacSigns[signIndex]);
    setSunDegrees(Math.floor(daysIntoSign * (30/30.44))); // Convert to degrees (0-29)
  }, []);

  const handleElementalChange = (element: keyof ElementalProperties, value: number) => {
    const newBalance = {
      ...state.elementalPreference,
      [element]: value / 100
    };
    dispatch({
      type: 'SET_ELEMENTAL_PREFERENCE',
      payload: newBalance
    });
  };

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div>
        <h3 className="text-lg font-medium mb-2">Natural Influences</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p>Season: {state.currentSeason}</p>
          <p>Moon Phase: {state.lunarPhase}</p>
          <p>Time: {getTimeOfDay()}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Elemental Balance</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(state.elementalPreference).map(([element, value]) => {
            const Icon = ElementIcons[element as keyof typeof ElementIcons];
            return (
              <div 
                key={element}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="capitalize">{element}</span>
                </div>
                <span className="font-medium">
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}