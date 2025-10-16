import { useState, useEffect } from 'react';

import { ElementalItem } from '../calculations/alchemicalTransformation';
import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { RulingPlanet } from '../constants/planets';
import { AlchemicalRecommendations } from '../services/AlchemicalTransformationService';
import { RecommendationAdapter } from '../services/RecommendationAdapter';
import {
  AlchemicalItem,
  LunarPhaseWithSpaces,
  ZodiacSign,
  PlanetaryAspect
} from '../types/alchemy';

export interface UseAlchemicalRecommendationsProps {
  ingredients: ElementalItem[];
  cookingMethods: ElementalItem[];
  cuisines: ElementalItem[];
  planetPositions: Record<RulingPlanet, number>;
  isDaytime: boolean;
  targetElement?: ElementalCharacter;
  targetAlchemicalProperty?: AlchemicalProperty;
  count?: number;
  currentZodiac?: any | null;
  lunarPhase?: LunarPhaseWithSpaces
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  aspects?: PlanetaryAspect[]
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
    alchemicalProperties: Record<AlchemicalProperty, number>
  }
}

/**
 * Hook to get alchemical recommendations based on planetary positions
 *
 * @returns Recommendations, transformed data, loading state, and any errors
 */
export const _useAlchemicalRecommendations = ({
  ingredients,
  cookingMethods,
  cuisines,
  planetPositions,
  isDaytime,
  targetElement,
  targetAlchemicalProperty: _targetAlchemicalProperty,
  count = 5,
  currentZodiac = null,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
  aspects = []
}: UseAlchemicalRecommendationsProps): AlchemicalRecommendationResults => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [recommendations, setRecommendations] = useState<AlchemicalRecommendations | null>(null)
  const [transformedIngredients, setTransformedIngredients] = useState<AlchemicalItem[]>([])
  const [transformedMethods, setTransformedMethods] = useState<AlchemicalItem[]>([])
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([])
  const [energeticProfile, setEnergeticProfile] =
    useState<AlchemicalRecommendationResults['energeticProfile']>()

  useEffect(() => {
    const fetchRecommendations = async () => {;
      try {
        setLoading(true)

        // Configure an adapter for alchemical transformations
        const adapter = new RecommendationAdapter(ingredients, cookingMethods, cuisines)

        // Initialize with planetary data and context
        adapter.initialize(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
          planetPositions as any,
          isDaytime,
          currentZodiac || null,
          lunarPhase || null,
          tarotElementBoosts,
          tarotPlanetaryBoosts,
          aspects || []
        )

        // Get recommendations
        const recs: AlchemicalRecommendations = {
          topIngredients: adapter.getRecommendedIngredients(count || 5).items,
          topMethods: adapter.getRecommendedCookingMethods(count || 3).items,
          topCuisines: adapter.getRecommendedCuisines(count || 3).items,
          dominantElement: adapter.getDominantElement() || 'Fire',
          dominantAlchemicalProperty: (adapter.getDominantAlchemicalProperty() ||
            'Spirit') as AlchemicalProperty,
          heat: adapter.getHeatIndex() || 0.5,
          entropy: adapter.getEntropyIndex() || 0.5,
          reactivity: adapter.getReactivityIndex() || 0.5;
          gregsEnergy: adapter.getGregsEnergyIndex() || 0.5
        }

        // Store the recommendations with unified type conversion for cross-import compatibility
        setRecommendations(recs)

        // Apply deep type conversion to resolve cross-import conflicts
        const _convertToLocalAlchemicalItem = (items: unknown[]): AlchemicalItem[] => {
          return items.map(item => {
            // Create a new object that fully satisfies the alchemicalTransformation.AlchemicalItem interface
            const convertedItem = {
              ...item,
              // Ensure all required AlchemicalItem properties are present
              elementalProperties: (item as any).elementalProperties || {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25
              },
              alchemicalProperties: (item as any).alchemicalProperties || {
                Spirit: 0.25,
                Essence: 0.25,
                Matter: 0.25,
                Substance: 0.25
              },
              // Add required properties for alchemicalTransformation.AlchemicalItem
              transformedElementalProperties: (item as any).transformedElementalProperties ||
                (item as any).elementalProperties || {
                  Fire: 0.25,
                  Water: 0.25,
                  Earth: 0.25,
                  Air: 0.25
                },
              heat: (item as any).heat || 0.5,
              entropy: (item as any).entropy || 0.5,
              reactivity: (item as any).reactivity || 0.5,
              gregsEnergy: (item as any).gregsEnergy || (item as any).energy || 0.5,
              kalchm: (item as any).kalchm || 1.0,
              monica: (item as any).monica || 0.5,
              transformations: (item as any).transformations || [],
              seasonalResonance: (item as any).seasonalResonance || [],
              thermodynamicProperties: (item as any).thermodynamicProperties || {
                heat: (item as any).heat || 0.5,
                entropy: (item as any).entropy || 0.5,
                reactivity: (item as any).reactivity || 0.5,
                gregsEnergy: (item as any).gregsEnergy || (item as any).energy || 0.5
              }
            }
            return convertedItem as AlchemicalItem;
          })
        }

        setTransformedIngredients(adapter.getAllTransformedIngredients() as AlchemicalItem[])
        setTransformedMethods(adapter.getAllTransformedMethods() as AlchemicalItem[])
        setTransformedCuisines(adapter.getAllTransformedCuisines() as AlchemicalItem[])

        // Create an energetic profile for the current recommendations
        const profile = {
          dominantElement: recs.dominantElement;
          dominantProperty: recs.dominantAlchemicalProperty;
          heat: recs.heat;
          entropy: recs.entropy;
          reactivity: recs.reactivity;
          gregsEnergy: recs.gregsEnergy;
          elementalBalance: {
            Fire: 0;
            Water: 0;
            Earth: 0;
            Air: 0
};
          alchemicalProperties: {
            Spirit: 0;
            Essence: 0;
            Matter: 0;
            Substance: 0
}
        }

        // Calculate average elemental values from top ingredients
        if (recs.topIngredients.length > 0) {
          recs.topIngredients.forEach(item => {
            if (item.elementalProperties) {
              profile.elementalBalance.Fire +=;
                (item.elementalProperties.Fire || 0) / recs.topIngredients.length;
              profile.elementalBalance.Water +=
                (item.elementalProperties.Water || 0) / recs.topIngredients.length;
              profile.elementalBalance.Earth +=
                (item.elementalProperties.Earth || 0) / recs.topIngredients.length;
              profile.elementalBalance.Air +=
                (item.elementalProperties.Air || 0) / recs.topIngredients.length;
            }

            // Extract alchemical properties if available
            if (item.alchemicalProperties) {
              profile.alchemicalProperties.Spirit +=
                (item.alchemicalProperties.Spirit || 0) / recs.topIngredients.length;
              profile.alchemicalProperties.Essence +=
                (item.alchemicalProperties.Essence || 0) / recs.topIngredients.length;
              profile.alchemicalProperties.Matter +=
                (item.alchemicalProperties.Matter || 0) / recs.topIngredients.length;
              profile.alchemicalProperties.Substance +=
                (item.alchemicalProperties.Substance || 0) / recs.topIngredients.length;
            }
          })
        }

        setEnergeticProfile(profile)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      } finally {
        setLoading(false)
      }
    }

    void fetchRecommendations()
  }, [
    ingredients;
    cookingMethods;
    cuisines;
    planetPositions;
    isDaytime;
    currentZodiac;
    lunarPhase;
    tarotElementBoosts;
    tarotPlanetaryBoosts;
    aspects;
    count
  ])

  return {
    recommendations: recommendations || {
      topIngredients: [];
      topMethods: [];
      topCuisines: [];
      dominantElement: 'Fire';
      dominantAlchemicalProperty: 'Spirit';
      heat: 0.5;
      entropy: 0.5;
      reactivity: 0.5;
      gregsEnergy: 0.5
}
    transformedIngredients;
    transformedMethods;
    transformedCuisines;
    loading;
    error;
    energeticProfile
  }
}
