'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { calculateKalchmResults } from '@/calculations/core/kalchmEngine';
import { IngredientService } from '@/services/IngredientService';
import { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type { ElementalProperties, _ElementalProperties } from '@/types/alchemy';
import { useRealAlchemizeService } from '@/services/RealAlchemizeService';
import { useUnifiedScoringService } from '@/services/UnifiedScoringService';
import { useThermodynamicEngine } from '@/calculations/core/thermodynamicEngine';
import { usePlanetaryHoursCalculator } from '@/data/planets/planetaryHoursCalculator';
import { useSwissEphemerisService } from '@/services/SwissEphemerisService';
import { 
  calculateAlchemicalNumber,
  calculateAlchemicalNumberCompatibility,
  deriveAlchemicalFromElemental,
  type AlchemicalProperties
} from '@/data/unified/alchemicalCalculations';

interface KalchmRecommenderProps {
  maxRecommendations?: number;
  showCategories?: string[];
}

export interface IntelligentKalchmData {
  // Core ingredient information
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  
  // Extended thermodynamic analysis
  extendedThermodynamics: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
    kalchm: number;
    monicaConstant: number;
    alchemicalNumber: number;          // A# value
    thermodynamicStability: number;
    energeticCoherence: number;
    kalchmVolatility: number;
    monicaVolatility: number;
    alchemicalComplexity: number;      // A# complexity rating
    stabilityRating: 'stable' | 'moderate' | 'volatile' | 'highly_volatile';
    optimalTiming: {
      planetaryHours: string[];
      lunarPhases: string[];
      seasonalRecommendations: string[];
    };
  };
  
  // Intelligence analysis results
  intelligenceAnalysis: {
    kalchmMastery: Record<string, number>;
    monicaHarmony: Record<string, number>;
    alchemicalNumberAlignment: Record<string, number>;  // A# analysis
    thermodynamicExpertise: Record<string, number>;
    astrologicalResonance: Record<string, number>;
    temporalOptimization: Record<string, number>;
    nutritionalSynergy: Record<string, number>;
    culturalAlignment: Record<string, number>;
    compatibilityMatrix: Record<string, number>;
    recommendationStrength: number;
    confidenceLevel: number;
    adaptabilityIndex: number;
    innovationPotential: number;
  };
}

export default function KalchmRecommender({ 
  maxRecommendations = 12,
  showCategories = ['Vegetables', 'Fruits', 'Proteins', 'Grains', 'Herbs', 'Spices'] 
}: KalchmRecommenderProps) {
  const alchemicalContext = useAlchemical();
  const planetaryPositions = alchemicalContext?.planetaryPositions;
  const elementalState = (alchemicalContext as unknown)?.elementalState;
  const [recommendations, setRecommendations] = useState<Record<string, UnifiedIngredient[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate thermodynamic metrics using the kalchm engine
  const thermodynamicMetrics = useMemo(() => {
    if (!planetaryPositions) return null;
    
    try {
      // Convert planetary positions to the expected format
      const convertedPositions: { [key: string]: any } = {};
      Object.entries(planetaryPositions).forEach(([planet, position]) => {
        // Apply safe type casting for position property access
        const positionData = position as unknown;
        convertedPositions[planet] = {
          sign: positionData?.sign || 'Aries',
          degree: positionData?.degree || 0,
          retrograde: positionData?.isRetrograde || false,
          exactLongitude: positionData?.exactLongitude || positionData?.degree || 0
        };
      });
      
      const kalchmResults = calculateKalchmResults(convertedPositions);
      return kalchmResults.thermodynamics;
    } catch (err) {
      // console.error('Error calculating kalchm results:', err);
      return null;
    }
  }, [planetaryPositions]);
  
  // Get ingredient recommendations
  useEffect(() => {
    const getRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get IngredientService instance
        const ingredientService = IngredientService.getInstance();
        
        // Get recommendations based on current elemental properties
        const recommendedIngredients = elementalState ? 
          ingredientService.getRecommendedIngredients(
            elementalState,
            {
              limit: maxRecommendations,
              includeThermodynamics: true,
              categories: showCategories
            }
          ) : [];
        
        // Group by category
        const groupedRecommendations = recommendedIngredients.reduce<Record<string, any[]>>(
          (groups, ingredient) => {
            const category = ingredient.category;
            if (!groups[category]) {
              groups[category] = [];
            }
            
            // Only add if we haven't reached the limit for this category
            if (groups[category].length < Math.ceil(maxRecommendations / showCategories.length)) {
              groups[category].push(ingredient as unknown);
            }
            
            return groups;
          },
          {}
        );
        
        setRecommendations(groupedRecommendations);
      } catch (err) {
        // console.error('Error getting recommendations:', err);
        setError('Failed to load ingredient recommendations');
      } finally {
        setIsLoading(false);
      }
    };
    
    getRecommendations();
  }, [elementalState, maxRecommendations, showCategories]);
  
  // Helper function to get element color
  const getElementColor = (element?: string) => {
    switch (element) {
      case 'Fire': return 'text-red-600';
      case 'Water': return 'text-blue-600';
      case 'Earth': return 'text-green-600';
      case 'Air': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };
  
  // Helper function to get background color based on kalchm value
  const getKalchmBackgroundColor = (kalchm?: number) => {
    if (!kalchm) return 'bg-gray-100';
    
    if (kalchm > 2.0) return 'bg-purple-50';
    if (kalchm > 1.5) return 'bg-indigo-50';
    if (kalchm > 1.0) return 'bg-blue-50';
    if (kalchm > 0.5) return 'bg-green-50';
    return 'bg-yellow-50';
  };
  
  // Get dominant element from elemental properties
  const getDominantElement = (props?: ElementalProperties): string => {
    if (!props) return 'None';
    
    let maxElement = 'None';
    let maxValue = 0;
    
    Object.entries(props).forEach(([element, value]) => {
      if (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air') {
        if (value > maxValue) {
          maxValue = value;
          maxElement = element;
        }
      }
    });
    
    return maxElement;
  };
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="mt-4 text-blue-600">Loading ingredients based on alchemical calculations...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="ingredient-recommender p-4">
      <h2 className="text-2xl font-bold mb-4">What to Eat Next</h2>
      
      {thermodynamicMetrics && (
        <div className="mb-6 p-4 rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Current Alchemical Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-2 bg-red-50 rounded">
              <div className="text-sm text-gray-600">Heat</div>
              <div className="font-medium">{thermodynamicMetrics.heat.toFixed(2)}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <div className="text-sm text-gray-600">Entropy</div>
              <div className="font-medium">{thermodynamicMetrics.entropy.toFixed(2)}</div>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <div className="text-sm text-gray-600">Reactivity</div>
              <div className="font-medium">{thermodynamicMetrics.reactivity.toFixed(2)}</div>
            </div>
            <div className="p-2 bg-purple-50 rounded">
              <div className="text-sm text-gray-600">Kalchm</div>
              <div className="font-medium">{thermodynamicMetrics.kalchm.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Dominant Element: <span className={`font-medium ${getElementColor(getDominantElement(elementalState))}`}>
              {getDominantElement(elementalState)}
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(recommendations).map(([category, ingredients]) => (
          <div key={category} className="category-section">
            <h3 className="text-xl font-semibold mb-3">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ingredients.map((ingredient, index) => {
                // Calculate compatibility score based on elemental properties
                const elementalCompatibility = ingredient.score || 0.5;
                
                return (
                  <div 
                    key={`${ingredient.name}-${index}`} 
                    className={`p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${getKalchmBackgroundColor(ingredient.kalchm)}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-lg">{ingredient.name}</h4>
                      <span className={`text-sm font-semibold ${getElementColor(getDominantElement(ingredient.elementalProperties))}`}>
                        {getDominantElement(ingredient.elementalProperties)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">{ingredient.subcategory || ingredient.category}</p>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Elemental Harmony:</span>
                        <span className="font-medium">{(elementalCompatibility * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${elementalCompatibility * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {ingredient.kalchm && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Kalchm Value:</span>
                          <span className="font-medium">{ingredient.kalchm.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(ingredient.kalchm / 3, 1) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {ingredient.tags && ingredient.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ingredient.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {Object.keys(recommendations).length === 0 && !isLoading && (
        <div className="text-center p-4">
          <p className="text-gray-600">No recommendations available at this time.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your settings or come back later.</p>
        </div>
      )}
    </div>
  );
} 