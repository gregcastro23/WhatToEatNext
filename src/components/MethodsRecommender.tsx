import React, { useEffect, useState } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { allCookingMethods } from '@/data/cooking';
import { planetaryFoodAssociations } from '@/constants/planetaryFoodAssociations';
import { getCurrentSeason } from '@/utils/dateUtils';
import { determineIngredientModality } from '@/utils/ingredientUtils';
import { Modality } from '@/types/ingredients';

// Import the correct utility function for zodiac elements
import { getElementForZodiac } from '@/utils/zodiacUtils';

// Define zodiac signs with their modalities
const zodiacSigns: Record<string, { modality: Modality }> = {
  'aries': { modality: 'Cardinal' },
  'taurus': { modality: 'Fixed' },
  'gemini': { modality: 'Mutable' },
  'cancer': { modality: 'Cardinal' },
  'leo': { modality: 'Fixed' },
  'virgo': { modality: 'Mutable' },
  'libra': { modality: 'Cardinal' },
  'scorpio': { modality: 'Fixed' },
  'sagittarius': { modality: 'Mutable' },
  'capricorn': { modality: 'Cardinal' },
  'aquarius': { modality: 'Fixed' },
  'pisces': { modality: 'Mutable' }
};

// Define a proper method score calculator function using actual data
const calculateMethodScores = (planetaryAlignment: any): Record<string, number> => {
  const scores: Record<string, number> = {};
  
  Object.entries(allCookingMethods).forEach(([methodName, methodData]) => {
    let score = 0.5; // Start with neutral score
    
    // 1. Calculate elemental score (40% of total)
    if (methodData.elementalProperties && planetaryAlignment.sun) {
      const sunSign = planetaryAlignment.sun.sign.toLowerCase();
      const sunElement = getElementForZodiac(sunSign);
      
      if (sunElement && methodData.elementalProperties[sunElement] > 0.5) {
        score += 0.4; // Full score for elemental alignment
      }
    }
    
    // 2. Calculate modality score (30% of total)
    if (methodData.qualities) {
      const methodModality = determineIngredientModality(methodData.qualities);
      const currentModality = getCurrentModality(planetaryAlignment);
      
      if (methodModality === currentModality) {
        score += 0.3; // Full score for modality match
      } else if (isCompatibleModality(methodModality, currentModality)) {
        score += 0.2; // Partial score for compatible modality
      }
    }
    
    // 3. Calculate planetary score (20% of total)
    if (methodData.astrologicalInfluences?.dominantPlanets) {
      const dominantPlanets = Array.isArray(methodData.astrologicalInfluences.dominantPlanets) 
        ? methodData.astrologicalInfluences.dominantPlanets 
        : [methodData.astrologicalInfluences.dominantPlanets];
        
      dominantPlanets.forEach(planet => {
        const planetKey = planet.toLowerCase();
        if (planetaryAlignment[planetKey] && planetaryAlignment[planetKey].sign) {
          const planetInfo = planetaryFoodAssociations[planet];
          if (planetInfo && planetInfo.rulership?.includes(planetaryAlignment[planetKey].sign)) {
            score += 0.2; // Full score for planetary rulership
          } else if (planetInfo && planetInfo.exaltation?.includes(planetaryAlignment[planetKey].sign)) {
            score += 0.15; // Partial score for planetary exaltation
          }
        }
      });
    }
    
    // 4. Calculate seasonal score (10% of total)
    const currentSeason = getCurrentSeason();
    if (methodData.seasonalPreference?.includes(currentSeason)) {
      score += 0.1; // Full score for seasonal match
    }
    
    // Normalize score to be between 0.1 and 1.0
    scores[methodName] = Math.max(0.1, Math.min(1.0, score));
  });
  
  return scores;
};

// Helper function to get current modality based on planetary alignment
function getCurrentModality(planetaryAlignment: any): Modality {
  const sunSign = planetaryAlignment.sun?.sign?.toLowerCase();
  if (!sunSign) return 'Mutable';
  
  const signInfo = zodiacSigns[sunSign];
  return signInfo?.modality || 'Mutable';
}

// Helper function to check modality compatibility
function isCompatibleModality(modality1: Modality, modality2: Modality): boolean {
  const compatibleModalities = {
    Cardinal: ['Mutable'],
    Fixed: ['Mutable'],
    Mutable: ['Cardinal', 'Fixed']
  };
  
  return compatibleModalities[modality1]?.includes(modality2) || false;
}

export default function MethodsRecommender() {
  // Use the hook to get consistent planetary data
  const { currentPlanetaryAlignment, loading } = useAstrologicalState();
  const [methodScores, setMethodScores] = useState<Record<string, number>>({});
  
  // Replace any existing planetary calculations
  useEffect(() => {
    if (!loading && currentPlanetaryAlignment) {
      // Calculate cooking method recommendations based on celestial positions
      const scores = calculateMethodScores(currentPlanetaryAlignment);
      setMethodScores(scores);
    }
  }, [loading, currentPlanetaryAlignment]);
  
  // Handle loading state
  if (loading) {
    return <div>Analyzing celestial energies for cooking methods...</div>;
  }
  
  // Render the recommendations
  return (
    <div className="methods-recommender">
      <h2>Recommended Cooking Methods</h2>
      <ul>
        {Object.entries(methodScores).map(([method, score]) => (
          <li key={method}>
            {method}: {Math.round(score * 100)}% alignment
          </li>
        ))}
      </ul>
    </div>
  );
} 