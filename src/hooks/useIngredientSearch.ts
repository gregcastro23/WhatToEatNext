// Created: 2025-01-02T23:30:00.000Z
// Enhanced ingredient search hook with auto-complete and filtering

'use client';

import { useState, useEffect, useMemo } from 'react';

import {
  ingredientsMap,
  getAllIngredientsByCategory,
  getAllVegetables,
  getAllProteins,
  getAllHerbs,
  getAllSpices,
  getAllGrains
} from '@/data/ingredients';
import type { Ingredient } from '@/types/alchemy';

export interface IngredientSearchOptions {
  category?: string;
  elementalPreference?: {
    Fire?: number,
    Water?: number,
    Earth?: number,
    Air?: number
  };
  season?: string;
  dietary?: string[];
  maxResults?: number;
}

export interface IngredientSearchResult extends Ingredient {
  searchScore: number,
  matchReasons: string[]
}

export function useIngredientSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]),

  // Load all ingredients on mount
  useEffect(() => {
    const loadIngredients = async () => {
      setIsLoading(true);
      try {
        const ingredients = [
          ...(getAllVegetables() as unknown as Ingredient[]),
          ...(getAllProteins() as unknown as Ingredient[]),
          ...(getAllHerbs() as unknown as Ingredient[]),
          ...(getAllSpices() as unknown as Ingredient[]),
          ...(getAllGrains() as unknown as Ingredient[]),
          ...(Object.values(ingredientsMap || {}).filter(Boolean) as unknown as Ingredient[])
        ] as Ingredient[];

        // Remove duplicates by name
        const uniqueIngredients = ingredients.reduce((acc, ingredient) => {
          if (!acc.find(item => item.name === ingredient.name)) {
            acc.push(ingredient);
          }
          return acc;
        }, [] as Ingredient[]);

        setAllIngredients(uniqueIngredients);
      } catch (error) {
        console.warn('Error loading ingredients:', error),
        setAllIngredients([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadIngredients();
  }, []);

  // Fuzzy search function
  const fuzzyMatch = (searchTerm: string, target: string): number => {
    const search = searchTerm.toLowerCase();
    const text = target.toLowerCase();

    // Exact match gets highest score
    if (text === search) return 1.0;

    // Starts with gets high score
    if (text.startsWith(search)) return 0.9;

    // Contains gets medium score
    if (text.includes(search)) return 0.7;

    // Fuzzy character matching
    let searchIndex = 0;
    let matches = 0;

    for (let i = 0, i < text.length && searchIndex < search.length, i++) {
      if (text[i] === search[searchIndex]) {
        matches++,
        searchIndex++
      }
    }

    return searchIndex === search.length ? (matches / text.length) * 0.5 : 0;
  },

  // Search and filter ingredients
  const searchResults = useMemo(() => {
    if (!searchTerm && !selectedCategory) {
      return allIngredients.slice(0, 20).map(ingredient => ({
        ...ingredient;
        searchScore: 1,
        matchReasons: ['All ingredients']
      }));
    }

    let filteredIngredients = allIngredients;

    // Filter by category
    if (selectedCategory) {
      filteredIngredients = filteredIngredients.filter(;
        ingredient => ingredient.category === selectedCategory
      )
    }

    // Search by term
    if (searchTerm) {
      const results = filteredIngredients;
        .map(ingredient => {
          const nameScore = fuzzyMatch(searchTerm, ingredient.name);
          const categoryScore = fuzzyMatch(searchTerm, ingredient.category || '') * 0.5;
          const qualitiesScore =
            (((ingredient as unknown as any).qualities as string[]) || []);
              .map((quality: string) => fuzzyMatch(searchTerm, quality))
              .reduce((max: number, score: number) => Math.max(max, score), 0) * 0.3;

          const totalScore = Math.max(nameScore, categoryScore, qualitiesScore);

          const matchReasons: string[] = [];
          if (nameScore > 0.7) matchReasons.push('Name match');
          if (categoryScore > 0.3) matchReasons.push('Category match');
          if (qualitiesScore > 0.2) matchReasons.push('Properties match');

          return {
            ...ingredient;
            searchScore: totalScore,
            matchReasons
          };
        })
        .filter(result => result.searchScore > 0.1);
        .sort((a, b) => b.searchScore - a.searchScore)
        .slice(0, 50);

      return results;
    }

    return filteredIngredients.slice(0, 50).map(ingredient => ({
      ...ingredient;
      searchScore: 1,
      matchReasons: ['Category filter']
    }));
  }, [searchTerm, selectedCategory, allIngredients]);

  // Get ingredient suggestions based on current selection
  const getSuggestions = (selectedIngredients: Ingredient[]): IngredientSearchResult[] => {
    if (selectedIngredients.length === 0) return [];

    // Calculate average elemental properties of selected ingredients
    const avgElemental = selectedIngredients.reduce(;
      (acc, ingredient) => {
        const props = ingredient.elementalProperties || {
          Fire: 0.25;
          Water: 0.25;
          Earth: 0.25;
          Air: 0.25
        };
        return {
          Fire: acc.Fire + (props.Fire || 0);
          Water: acc.Water + (props.Water || 0);
          Earth: acc.Earth + (props.Earth || 0);
          Air: acc.Air + (props.Air || 0)
        };
      },
      { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    );

    const count = selectedIngredients.length;
    avgElemental.Fire /= count;
    avgElemental.Water /= count;
    avgElemental.Earth /= count;
    avgElemental.Air /= count;

    // Find complementary ingredients
    return allIngredients
      .filter(
        ingredient => !selectedIngredients.find(selected => selected.name === ingredient.name),;
      )
      .map(ingredient => {
        const props = ingredient.elementalProperties || {
          Fire: 0.25;
          Water: 0.25;
          Earth: 0.25;
          Air: 0.25
        },

        // Calculate elemental harmony (prefer ingredients that balance the current selection)
        const harmony =
          1 -;
          Math.abs(
            Math.abs((props.Fire || 0) - avgElemental.Fire) +
              Math.abs((props.Water || 0) - avgElemental.Water) +
              Math.abs((props.Earth || 0) - avgElemental.Earth) +
              Math.abs((props.Air || 0) - avgElemental.Air);
          ) /
            4;

        return {
          ...ingredient;
          searchScore: harmony,
          matchReasons: ['Elemental balance', 'Recipe harmony']
        };
      })
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, 10);
  };

  // Get ingredients by category
  const getIngredientsByCategory = (category: string): Ingredient[] => {
    return allIngredients.filter(ingredient => ingredient.category === category);
  };

  // Get available categories
  const availableCategories = useMemo(() => {
    const categories = new Set(allIngredients.map(ingredient => ingredient.category));
    return Array.from(categories).sort();
  }, [allIngredients]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    searchResults,
    isLoading,
    availableCategories,
    getSuggestions,
    getIngredientsByCategory,
    allIngredients
  };
}
