import React, { useEffect, useState } from 'react';
import { useAstrologicalState } from '../context/AstrologicalContext';
import { useChakraInfluencedFood } from '../hooks/useChakraInfluencedFood';
import { PlanetaryHourCalculator } from '../lib/PlanetaryHourCalculator';
import { CircularProgress } from '@mui/material';

// Define the interface for the food recommendation returned by the hook
interface FoodRecommendation {
  name: string;
  score?: number;
  elementalAffinity?: {
    base?: string;
    secondary?: string;
  };
  description?: string;
  healthBenefits?: string[];
  [key: string]: unknown;
}

interface TodaysFood {
  name: string;
  score: number;
  element: string;
  planetaryInfluence?: string;
  description?: string;
}

export default function TodaysRecommendation() {
  const [todaysFood, setTodaysFood] = useState<TodaysFood | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPlanetaryHour, setCurrentPlanetaryHour] = useState<string | null>(null);
  
  // Use the hooks to get astrological data and food recommendations
  const { 
    planetaryPositions, 
    isLoading: astroLoading
  } = useAstrologicalState();
  
  const { 
    recommendations, 
    loading: recommendationsLoading, 
    error: recommendationsError 
  } = useChakraInfluencedFood();

  // Initialize planetary hour calculator
  useEffect(() => {
    try {
      const planetaryCalculator = new PlanetaryHourCalculator();
      const hourInfo = planetaryCalculator.getCurrentPlanetaryHour();
      
      if (hourInfo && hourInfo.planet) {
        const planetName = String(hourInfo.planet as unknown);
        setCurrentPlanetaryHour(planetName);
      }
    } catch (error) {
      console.error('Error calculating planetary hour:', error);
    }
  }, []);
  
  // Process recommendations once they're loaded
  useEffect(() => {
    if (!astroLoading && !recommendationsLoading && recommendations?.length > 0) {
      // Get the top recommendation, assuming it's already sorted by score
      const topRecommendation = recommendations[0] as FoodRecommendation;
      
      if (topRecommendation) {
        // Extract the relevant information
        setTodaysFood({
          name: topRecommendation.name,
          score: topRecommendation.score || 0,
          element: topRecommendation.elementalAffinity?.base || 'Unknown',
          planetaryInfluence: currentPlanetaryHour || undefined,
          description: topRecommendation.description || topRecommendation.healthBenefits?.join('. ') || undefined
        });
      }
      
      setLoading(false);
    }
  }, [astroLoading, recommendationsLoading, recommendations, currentPlanetaryHour]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <CircularProgress size={40} />
      </div>
    );
  }

  if (recommendationsError) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
        Error loading recommendations
      </div>
    );
  }

  if (!todaysFood) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-800">
        No recommendations available
      </div>
    );
  }

  // Score color based on value
  const scoreColor = todaysFood.score >= 80 
    ? 'text-green-600' 
    : todaysFood.score >= 60 
      ? 'text-blue-500' 
      : todaysFood.score >= 40 
        ? 'text-yellow-500' 
        : 'text-orange-500';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">Today's Recommendation</h2>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="text-xl font-bold">{todaysFood.name}</div>
        <div className={`text-lg font-semibold ${scoreColor}`}>{todaysFood.score.toFixed(1)}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-sm">
          <span className="font-semibold">Element:</span> {todaysFood.element}
        </div>
        {todaysFood.planetaryInfluence && (
          <div className="text-sm">
            <span className="font-semibold">Planetary Hour:</span> {todaysFood.planetaryInfluence}
          </div>
        )}
      </div>
      
      {todaysFood.description && (
        <div className="text-sm mt-2 text-gray-600">
          {todaysFood.description}
        </div>
      )}
    </div>
  );
} 