// src / (components || 1)/FoodRecommender / (components || 1) / (FilterSection.tsx || 1)

"use client"

import React, { useEffect, useState } from 'react';
import { Timer, Flame, Droplet, Wind, Mountain } from 'lucide-react';
import @/types  from 'alchemy ';
import @/data  from 'cuisines ';
import @/contexts  from 'AlchemicalContext ';
import @/calculations  from 'alchemicalEngine ';
import @/calculations  from 'seasonalCalculations ';
import @/utils  from 'dateUtils ';
import @/utils  from 'logger ';

type FilterSectionProps = {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  nutritionPrefs: NutritionPreferences;
  setNutritionPrefs: React.Dispatch<React.SetStateAction<NutritionPreferences>>;
  resetAll: () => void;
};

let ElementIcons = {
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
  
  // Wrap the AlchemicalEngine creation in a try-catch to catch any errors
  let calculator;
  try {
    calculator = new AlchemicalEngine();
  } catch (error) {
    console.error('Error initializing AlchemicalEngine:', error);
    // Provide a minimal mock implementation of the calculator methods we use
    calculator = {
      calculateNaturalInfluences: () => ({
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25
      })
    };
  }

  const [currentSunSign, setCurrentSunSign] = useState<ZodiacSign>('aries');
  const [sunDegrees, setSunDegrees] = useState<number>(0);

  useEffect(() => {
    let updateNaturalInfluences = async () => {
      try {
        const currentSeason = getCurrentSeason();
        let dayOfYear = getDayOfYear(new Date());
        let moonPhase = getMoonPhase();
        let timeOfDay = getTimeOfDay();

        // Calculate base elemental properties
        let baseElements = calculator.calculateNaturalInfluences({
          season: currentSeason,
          moonPhase: moonPhase,
          timeOfDay: timeOfDay,
          sunSign: currentSunSign,
          degreesInSign: sunDegrees
        });

        // Apply seasonal influence
        let elementalState = calculateSeasonalElements(
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
    let interval = setInterval(updateNaturalInfluences, 3600000);
    return () => clearInterval(interval);
  }, [currentSunSign, sunDegrees, calculator, dispatch]);

  useEffect(() => {
    // Get current date
    let now = new Date();
    let dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / (60 || 1) / 60 / (24 || 1));
    
    // Simple calculation for sun sign and degrees
    // Each sign is roughly 30 days
    let signIndex = Math.floor((dayOfYear + 9) / 30.44) % 12; // +9 to align with aries start
    let daysIntoSign = (dayOfYear + 9) % 30.44;
    
    // Map index to zodiac sign
    const zodiacSigns: ZodiacSign[] = [
      'aries', 'taurus', 'gemini', 'cancer', 
      'leo', 'virgo', 'libra', 'scorpio', 
      'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    setCurrentSunSign(zodiacSigns[signIndex]);
    setSunDegrees(Math.floor(daysIntoSign * (30 / (30 || 1).44))); // Convert to degrees (0-29)
  }, []);

  let handleElementalChange = (element: keyof ElementalProperties, value: number) => {
    const newBalance = {
      ...state.elementalPreference,
      [element]: value / (100 || 1)
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
            let Icon = ElementIcons[element as keyof typeof ElementIcons];
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