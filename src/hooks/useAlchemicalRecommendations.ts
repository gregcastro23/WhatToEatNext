import { useState, useEffect, useMemo } from 'react';
import { RulingPlanet } from '../constants/planets';
import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { RecommendationAdapter } from '../services/RecommendationAdapter';
import { AlchemicalRecommendations } from '../services/AlchemicalTransformationService';

interface UseAlchemicalRecommendationsProps {
  ingredients: ElementalItem[];
  cookingMethods: ElementalItem[];
  cuisines: ElementalItem[];
  planetPositions: Record<RulingPlanet, number>;
  isDaytime: boolean;
  targetElement?: ElementalCharacter;
  targetAlchemicalProperty?: AlchemicalProperty;
  count?: number;
}

interface AlchemicalRecommendationResults {
  recommendations: AlchemicalRecommendations;
  transformedIngredients: AlchemicalItem[];
  transformedMethods: AlchemicalItem[];
  transformedCuisines: AlchemicalItem[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to get alchemical recommendations based on planetary positions
 * 
 * @returns Recommendations, transformed data, loading state, and any errors
 */
export const useAlchemicalRecommendations = ({
  ingredients,
  cookingMethods,
  cuisines,
  planetPositions,
  isDaytime,
  targetElement,
  targetAlchemicalProperty,
  count = 5
}: UseAlchemicalRecommendationsProps): AlchemicalRecommendationResults => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [recommendations, setRecommendations] = useState<AlchemicalRecommendations | null>(null);
  const [transformedIngredients, setTransformedIngredients] = useState<AlchemicalItem[]>([]);
  const [transformedMethods, setTransformedMethods] = useState<AlchemicalItem[]>([]);
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([]);
  
  // Create a memoized adapter instance
  const adapter = useMemo(() => {
    return new RecommendationAdapter(ingredients, cookingMethods, cuisines);
  }, [ingredients, cookingMethods, cuisines]);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Update adapter with latest data
        adapter.updatePlanetaryData(planetPositions, isDaytime);
        
        // Get transformed data
        const transformedIngs = adapter.getTransformedIngredients();
        const transformedMths = adapter.getTransformedCookingMethods();
        const transformedCuis = adapter.getTransformedCuisines();
        
        setTransformedIngredients(transformedIngs);
        setTransformedMethods(transformedMths);
        setTransformedCuisines(transformedCuis);
        
        // Get recommendations based on target preferences if provided
        let recs: AlchemicalRecommendations;
        if (targetElement || targetAlchemicalProperty) {
          recs = adapter.getTargetedRecommendations(
            targetElement,
            targetAlchemicalProperty,
            count
          );
        } else {
          recs = adapter.getRecommendations(count);
        }
        
        setRecommendations(recs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [
    adapter, 
    planetPositions, 
    isDaytime,
    targetElement, 
    targetAlchemicalProperty, 
    count
  ]);
  
  return {
    recommendations: recommendations || {
      topIngredients: [],
      topMethods: [],
      topCuisines: [],
      dominantElement: 'Fire',
      dominantAlchemicalProperty: 'Spirit',
      heat: 0,
      entropy: 0,
      reactivity: 0,
      gregsEnergy: 0
    },
    transformedIngredients,
    transformedMethods,
    transformedCuisines,
    loading,
    error
  };
}; 