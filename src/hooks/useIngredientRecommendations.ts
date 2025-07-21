import { useState, useEffect, useMemo } from 'react';

import { type IngredientRecommendation } from '@/types';
import { Element, type ElementalProperties } from '@/types/alchemy';

import { useAlchemical } from './useAlchemical';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  elementalProfile: { Fire: number; Water: number; Earth: number; Air: number; };
  nutritionalBenefits?: string[];
  cookingMethods?: string[];
  score?: number;
}

export interface IngredientRecommendationsData {
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: string;
    maxResults?: number;
  };
}

export interface RecommendationCriteria {
  elements: ElementalProperties;
  season?: string;
  mealType?: string;
  dietaryRestrictions?: string[];
  servings?: number;
}

export function useIngredientRecommendations(_criteria?: RecommendationCriteria) {
  const [recommendations, setRecommendations] = useState<IngredientRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { planetaryPositions, isDaytime } = useAlchemical();
  
  const [state, setState] = useState<IngredientRecommendationsData>({
    ingredients: [],
    isLoading: true,
    error: null,
    filters: {
      maxResults: 15,
    }
  });

  const currentElementalProfile = useMemo(() => {
    if (!planetaryPositions || Object.keys(planetaryPositions || {}).length === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }

    // Calculate elemental distribution from planetary positions
    const elementCounts = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const elementMap = {
      aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
      taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
      gemini: 'Air', libra: 'Air', aquarius: 'Air',
      cancer: 'Water', scorpio: 'Water', pisces: 'Water'
    };

    Object.values(planetaryPositions || {}).forEach(position => {
      const element = elementMap[(position as any)?.sign as keyof typeof elementMap];
      if (element) {
        elementCounts[element as keyof typeof elementCounts]++;
      }
    });

    const total = Object.values(elementCounts)?.reduce((sum, count) => sum + count, 0);
    
    return { Fire: total > 0 ? elementCounts.Fire / total : 0.25, Water: total > 0 ? elementCounts.Water / total : 0.25, Earth: total > 0 ? elementCounts.Earth / total : 0.25, Air: total > 0 ? elementCounts.Air / total : 0.25
    };
  }, [planetaryPositions]);

  useEffect(() => {
    async function fetchIngredients() {
      if (isLoading) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Sample ingredients - in real app, this would be from API/database
        const sampleIngredients: Ingredient[] = [
          {
            id: 'ginger',
            name: 'Ginger',
            category: 'spices',
            elementalProfile: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
            nutritionalBenefits: ['Anti-inflammatory', 'Digestive aid'],
            cookingMethods: ['grating', 'steaming', 'stir-frying']
          },
          {
            id: 'cucumber',
            name: 'Cucumber',
            category: 'vegetables',
            elementalProfile: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 },
            nutritionalBenefits: ['Hydrating', 'Cooling'],
            cookingMethods: ['raw', 'pickling']
          },
          {
            id: 'potato',
            name: 'Potato',
            category: 'vegetables',
            elementalProfile: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
            nutritionalBenefits: ['Vitamin C', 'Fiber'],
            cookingMethods: ['roasting', 'boiling', 'frying']
          },
          {
            id: 'basil',
            name: 'Basil',
            category: 'herbs',
            elementalProfile: { Fire: 0.3, Water: 0.2, Earth: 0.1, Air: 0.4 },
            nutritionalBenefits: ['Antioxidants', 'Aromatic'],
            cookingMethods: ['fresh', 'drying', 'infusing']
          },
          {
            id: 'salmon',
            name: 'Salmon',
            category: 'proteins',
            elementalProfile: { Fire: 0.4, Water: 0.4, Earth: 0.1, Air: 0.1 },
            nutritionalBenefits: ['Omega-3', 'Protein'],
            cookingMethods: ['grilling', 'baking', 'smoking']
          },
          {
            id: 'lentils',
            name: 'Lentils',
            category: 'legumes',
            elementalProfile: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
            nutritionalBenefits: ['Protein', 'Fiber'],
            cookingMethods: ['boiling', 'stewing']
          }
        ];

        // Calculate compatibility scores
        const ingredientsWithScores = (sampleIngredients || []).map(ingredient => {
          const score = calculateElementalCompatibility((ingredient as any)?.elementalPropertiesProfile || ingredient.elementalProfile, currentElementalProfile);
          return { ...ingredient, score };
        });

        // Apply filters
        let filteredIngredients = ingredientsWithScores;
        
        if (state.filters.category) {
          filteredIngredients = filteredIngredients.filter(i => i.category === state.filters.category);
        }

        // Sort by score and limit results
        filteredIngredients = filteredIngredients
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, state.filters.maxResults || 15);

        setState(prev => ({
          ...prev,
          ingredients: filteredIngredients,
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }

    fetchIngredients();
  }, [isLoading, currentElementalProfile, state.filters]);

  const updateFilters = (newFilters: Partial<IngredientRecommendationsData['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  };

  return {
    ...state,
    updateFilters,
    currentElementalProfile
  };
}

function calculateElementalCompatibility(
  ingredientProfile: { Fire: number; Water: number; Earth: number; Air: number },
  currentProfile: { Fire: number; Water: number; Earth: number; Air: number }
): number {
  // Simple compatibility calculation - can be enhanced
  const diff = Math.abs(ingredientProfile.Fire - currentProfile.Fire) +
               Math.abs(ingredientProfile.Water - currentProfile.Water) +
               Math.abs(ingredientProfile.Earth - currentProfile.Earth) +
               Math.abs(ingredientProfile.Air - currentProfile.Air);
  
  return Math.max(0, 1 - (diff / 2)); // Convert difference to compatibility score
} 