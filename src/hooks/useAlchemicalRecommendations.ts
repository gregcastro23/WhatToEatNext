import { useState, useEffect, useMemo } from 'react';
import { RulingPlanet } from '../constants/planets';
import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { RecommendationAdapter } from '../services/RecommendationAdapter';
import { AlchemicalRecommendations } from '../services/AlchemicalTransformationService';
import { LunarPhase, LunarPhaseWithSpaces, ZodiacSign, PlanetaryAspect } from '../types/alchemy';

interface UseAlchemicalRecommendationsProps {
  ingredients: ElementalItem[];
  cookingMethods: ElementalItem[];
  cuisines: ElementalItem[];
  planetPositions: Record<RulingPlanet, number>;
  isDaytime: boolean;
  targetElement?: ElementalCharacter;
  targetAlchemicalProperty?: AlchemicalProperty;
  count?: number;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  aspects?: PlanetaryAspect[];
}

interface AlchemicalRecommendationResults {
  recommendations: AlchemicalRecommendations;
  transformedIngredients: AlchemicalItem[];
  transformedMethods: AlchemicalItem[];
  transformedCuisines: AlchemicalItem[];
  loading: boolean;
  error: Error | null;
  energeticProfile?: {
    dominantElement: ElementalCharacter;
    dominantProperty: AlchemicalProperty;
    elementalBalance: Record<ElementalCharacter, number>;
    alchemicalProperties: Record<AlchemicalProperty, number>;
  };
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
  count = 5,
  currentZodiac = null,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
  aspects = []
}: UseAlchemicalRecommendationsProps): AlchemicalRecommendationResults => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [recommendations, setRecommendations] = useState<AlchemicalRecommendations | null>(null);
  const [transformedIngredients, setTransformedIngredients] = useState<AlchemicalItem[]>([]);
  const [transformedMethods, setTransformedMethods] = useState<AlchemicalItem[]>([]);
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([]);
  const [energeticProfile, setEnergeticProfile] = useState<AlchemicalRecommendationResults['energeticProfile']>();
  
  // Create a memoized adapter instance
  const adapter = useMemo(() => {
    return new RecommendationAdapter(ingredients, cookingMethods, cuisines);
  }, [ingredients, cookingMethods, cuisines]);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Update adapter with latest data including new parameters
        await adapter.updatePlanetaryData(
          planetPositions, 
          isDaytime,
          currentZodiac,
          lunarPhase as LunarPhase,
          tarotElementBoosts,
          tarotPlanetaryBoosts,
          aspects
        );
        
        // Get recommended items
        // We'll use a larger number to get more items for the transformed data
        const expandedCount = Math.max(20, count * 2);
        const allIngredients = adapter.getRecommendedIngredients(expandedCount);
        const allMethods = adapter.getRecommendedMethods(expandedCount);
        const allCuisines = adapter.getRecommendedCuisines(expandedCount);
        
        // Store the full list of transformed items
        setTransformedIngredients(allIngredients);
        setTransformedMethods(allMethods);
        setTransformedCuisines(allCuisines);
        
        // Get the top items for recommendations
        const topIngredients = allIngredients.slice(0, count);
        const topMethods = allMethods.slice(0, count);
        const topCuisines = allCuisines.slice(0, count);
        
        let dominantElement: ElementalCharacter = 'Fire';
        let dominantAlchemicalProperty: AlchemicalProperty = 'Spirit';
        
        // Use targeted elements/properties if specified
        if (targetElement) {
          dominantElement = targetElement;
        } else if (topIngredients.length > 0 && topIngredients[0].dominantElement) {
          dominantElement = topIngredients[0].dominantElement;
        }
        
        if (targetAlchemicalProperty) {
          dominantAlchemicalProperty = targetAlchemicalProperty;
        } else if (topIngredients.length > 0 && topIngredients[0].dominantAlchemicalProperty) {
          dominantAlchemicalProperty = topIngredients[0].dominantAlchemicalProperty;
        }
        
        // Calculate average energy values across top ingredients
        const calculateAverage = (items: AlchemicalItem[], property: keyof AlchemicalItem): number => {
          if (items.length === 0) return 0;
          const sum = items.reduce((acc, item) => acc + ((item[property] as number) || 0), 0);
          return parseFloat((sum / items.length).toFixed(2));
        };
        
        const recs: AlchemicalRecommendations = {
          topIngredients,
          topMethods,
          topCuisines,
          dominantElement,
          dominantAlchemicalProperty,
          heat: calculateAverage(topIngredients, 'heat'),
          entropy: calculateAverage(topIngredients, 'entropy'),
          reactivity: calculateAverage(topIngredients, 'reactivity'),
          gregsEnergy: calculateAverage(topIngredients, 'gregsEnergy')
        };
        
        setRecommendations(recs);
        
        // Create energetic profile from the recommendations
        const profile = {
          dominantElement: recs.dominantElement,
          dominantProperty: recs.dominantAlchemicalProperty,
          elementalBalance: {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0
          } as Record<ElementalCharacter, number>,
          alchemicalProperties: {
            Spirit: 0,
            Essence: 0,
            Matter: 0,
            Substance: 0
          } as Record<AlchemicalProperty, number>
        };
        
        // Calculate average elemental values from top ingredients
        if (recs.topIngredients.length > 0) {
          recs.topIngredients.forEach(item => {
            if (item.elementalProperties) {
              profile.elementalBalance.Fire += (item.elementalProperties.Fire || 0) / recs.topIngredients.length;
              profile.elementalBalance.Water += (item.elementalProperties.Water || 0) / recs.topIngredients.length;
              profile.elementalBalance.Earth += (item.elementalProperties.Earth || 0) / recs.topIngredients.length;
              profile.elementalBalance.Air += (item.elementalProperties.Air || 0) / recs.topIngredients.length;
            }
            
            // Extract alchemical properties if available
            if (item.alchemicalProperties) {
              profile.alchemicalProperties.Spirit += (item.alchemicalProperties.Spirit || 0) / recs.topIngredients.length;
              profile.alchemicalProperties.Essence += (item.alchemicalProperties.Essence || 0) / recs.topIngredients.length;
              profile.alchemicalProperties.Matter += (item.alchemicalProperties.Matter || 0) / recs.topIngredients.length;
              profile.alchemicalProperties.Substance += (item.alchemicalProperties.Substance || 0) / recs.topIngredients.length;
            }
          });
        }
        
        setEnergeticProfile(profile);
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
    count,
    currentZodiac,
    lunarPhase,
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    aspects
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
    error,
    energeticProfile
  };
}; 