/**
 * useChakraInfluencedFood Hook
 *
 * Provides chakra-aligned food recommendations based on:
 * - Current planetary positions and their chakra associations
 * - User's chakra energy state (imbalances, blockages)
 * - Alchemical properties (ESMS) derived from planetary alchemy
 * - Ingredient elemental properties aligned with chakra needs
 *
 * IMPORTANT: Per CLAUDE.md - ESMS can ONLY be calculated from planetary positions,
 * NOT from elemental approximations. This hook uses the authoritative
 * planetaryAlchemyMapping.ts for all ESMS calculations.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import type { Ingredient, ElementalProperties } from '@/types/alchemy';
import { calculateAlchemicalFromPlanets } from '@/utils/planetaryAlchemyMapping';

// Chakra type definition
export type ChakraType =
  | 'root'
  | 'sacral'
  | 'solar_plexus'
  | 'heart'
  | 'throat'
  | 'third_eye'
  | 'crown';

// Chakra energy state
export interface ChakraState {
  chakra: ChakraType;
  energyLevel: number; // 0-1, where 0.5 is balanced
  isBlocked: boolean;
  isOveractive: boolean;
}

// Planetary chakra associations (from Vedic astrology)
const PLANETARY_CHAKRA_MAP: Record<string, ChakraType> = {
  mars: 'root',
  venus: 'sacral',
  sun: 'solar_plexus',
  moon: 'heart',
  mercury: 'throat',
  jupiter: 'third_eye',
  saturn: 'crown'
};

// Elemental chakra affinities
const CHAKRA_ELEMENT_AFFINITY: Record<ChakraType, Partial<ElementalProperties>> = {
  root: { Earth: 0.7, Fire: 0.3 },
  sacral: { Water: 0.7, Fire: 0.3 },
  solar_plexus: { Fire: 0.7, Air: 0.3 },
  heart: { Air: 0.7, Water: 0.3 },
  throat: { Air: 0.6, Water: 0.4 },
  third_eye: { Air: 0.5, Water: 0.3, Fire: 0.2 },
  crown: { Air: 0.8, Fire: 0.2 }
};

interface ChakraFoodOptions {
  planetaryPositions?: Record<string, { sign: string; degree: number }>;
  userChakraState?: ChakraState[];
  availableIngredients?: Ingredient[];
  focusChakra?: ChakraType;
}

export function useChakraInfluencedFood(options: ChakraFoodOptions = {}) {
  const {
    planetaryPositions = {},
    userChakraState = [],
    availableIngredients = [],
    focusChakra
  } = options;

  const [recommendations, setRecommendations] = useState<{
    ingredients: Ingredient[];
    chakraFocus: ChakraType | null;
    alchemicalProperties: { Spirit: number; Essence: number; Matter: number; Substance: number } | null;
    reasoning: string;
  }>({
    ingredients: [],
    chakraFocus: null,
    alchemicalProperties: null,
    reasoning: ''
  });

  const [loading, setLoading] = useState(false);

  /**
   * Calculate which chakra needs the most support based on planetary positions
   * and user's chakra state
   */
  const identifyPrimaryChakraFocus = useCallback((): ChakraType => {
    // If user explicitly requests a chakra focus
    if (focusChakra) return focusChakra;

    // Check user's chakra state for imbalances
    if (userChakraState.length > 0) {
      const mostImbalanced = userChakraState
        .filter(state => state.isBlocked || state.energyLevel < 0.3)
        .sort((a, b) => a.energyLevel - b.energyLevel)[0];

      if (mostImbalanced) return mostImbalanced.chakra;
    }

    // Determine from planetary positions - find strongest planetary influence
    const planetStrengths: Record<string, number> = {};

    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      // Planets at 0 degrees (cusp) or 15 degrees (middle of sign) are stronger
      const degreeStrength = Math.abs(15 - position.degree) / 15; // 0 = strongest, 1 = weakest
      planetStrengths[planet.toLowerCase()] = 1 - degreeStrength;
    });

    // Find strongest planet and return its associated chakra
    const strongestPlanet = Object.entries(planetStrengths)
      .sort(([, a], [, b]) => b - a)[0];

    if (strongestPlanet) {
      const chakra = PLANETARY_CHAKRA_MAP[strongestPlanet[0]];
      if (chakra) return chakra;
    }

    // Default to solar plexus (digestive fire, transformation)
    return 'solar_plexus';
  }, [planetaryPositions, userChakraState, focusChakra]);

  /**
   * Calculate alchemical properties from current planetary positions
   * CRITICAL: Uses authoritative planetaryAlchemyMapping.ts
   */
  const calculateCurrentAlchemicalProperties = useCallback(() => {
    if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
      return null;
    }

    // Convert planetary positions to the format expected by calculateAlchemicalFromPlanets
    const planetarySigns: Record<string, string> = {};

    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      planetarySigns[planet] = position.sign;
    });

    // Use the ONLY correct way to calculate ESMS
    return calculateAlchemicalFromPlanets(planetarySigns);
  }, [planetaryPositions]);

  /**
   * Calculate ingredient's affinity to a specific chakra
   */
  const calculateChakraAffinity = useCallback(
    (ingredient: Ingredient, targetChakra: ChakraType): number => {
      const elementalProps = ingredient.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };

      const chakraAffinity = CHAKRA_ELEMENT_AFFINITY[targetChakra];
      let affinity = 0;

      // Calculate how well ingredient's elements match chakra's preferred elements
      Object.entries(chakraAffinity).forEach(([element, weight]) => {
        const elementKey = element as keyof ElementalProperties;
        affinity += (elementalProps[elementKey] || 0) * (weight || 0);
      });

      // Bonus for ingredients with traditional chakra associations
      const ingredientName = ingredient.name.toLowerCase();
      const chakraKeywords: Record<ChakraType, string[]> = {
        root: ['beet', 'potato', 'carrot', 'ginger', 'protein', 'root'],
        sacral: ['orange', 'mango', 'sweet', 'coconut', 'nuts', 'seeds'],
        solar_plexus: ['lemon', 'corn', 'grain', 'banana', 'turmeric', 'ginger'],
        heart: ['green', 'leafy', 'broccoli', 'spinach', 'kale', 'tea'],
        throat: ['blueberry', 'seaweed', 'salt', 'honey', 'herbal'],
        third_eye: ['purple', 'grape', 'eggplant', 'lavender', 'sage'],
        crown: ['fasting', 'light', 'air', 'meditation'] // Crown chakra often benefits from fasting
      };

      const keywords = chakraKeywords[targetChakra];
      const hasKeyword = keywords.some(keyword => ingredientName.includes(keyword));

      if (hasKeyword) {
        affinity += 0.3; // Significant bonus for traditional associations
      }

      return Math.min(1, affinity); // Cap at 1.0
    },
    []
  );

  /**
   * Generate chakra-aligned food recommendations
   */
  const generateRecommendations = useCallback(() => {
    setLoading(true);

    try {
      // Step 1: Identify which chakra to focus on
      const targetChakra = identifyPrimaryChakraFocus();

      // Step 2: Calculate current alchemical properties from planets
      const alchemicalProps = calculateCurrentAlchemicalProperties();

      // Step 3: Filter and score ingredients by chakra affinity
      const scoredIngredients = availableIngredients
        .map(ingredient => ({
          ingredient,
          affinityScore: calculateChakraAffinity(ingredient, targetChakra)
        }))
        .filter(item => item.affinityScore > 0.3) // Only keep reasonably aligned ingredients
        .sort((a, b) => b.affinityScore - a.affinityScore);

      // Step 4: Select top ingredients (up to 10)
      const topIngredients = scoredIngredients
        .slice(0, 10)
        .map(item => item.ingredient);

      // Step 5: Generate reasoning
      const chakraNames: Record<ChakraType, string> = {
        root: 'Root (Muladhara)',
        sacral: 'Sacral (Svadhisthana)',
        solar_plexus: 'Solar Plexus (Manipura)',
        heart: 'Heart (Anahata)',
        throat: 'Throat (Vishuddha)',
        third_eye: 'Third Eye (Ajna)',
        crown: 'Crown (Sahasrara)'
      };

      let reasoning = `Recommendations aligned with ${chakraNames[targetChakra]} chakra. `;

      if (alchemicalProps) {
        reasoning += `Current planetary alchemy shows Spirit: ${alchemicalProps.Spirit}, `;
        reasoning += `Essence: ${alchemicalProps.Essence}, Matter: ${alchemicalProps.Matter}, `;
        reasoning += `Substance: ${alchemicalProps.Substance}. `;
      }

      const userImbalance = userChakraState.find(
        state => state.chakra === targetChakra && (state.isBlocked || state.energyLevel < 0.4)
      );

      if (userImbalance) {
        reasoning += `Addressing ${userImbalance.isBlocked ? 'blockage' : 'low energy'} in this chakra. `;
      }

      reasoning += `Selected ingredients with strong elemental alignment to support this energy center.`;

      setRecommendations({
        ingredients: topIngredients,
        chakraFocus: targetChakra,
        alchemicalProperties: alchemicalProps,
        reasoning
      });
    } catch (error) {
      console.error('Error generating chakra food recommendations:', error);
      setRecommendations({
        ingredients: [],
        chakraFocus: null,
        alchemicalProperties: null,
        reasoning: 'Unable to generate recommendations at this time.'
      });
    } finally {
      setLoading(false);
    }
  }, [
    identifyPrimaryChakraFocus,
    calculateCurrentAlchemicalProperties,
    availableIngredients,
    calculateChakraAffinity,
    userChakraState
  ]);

  /**
   * Get detailed chakra balance assessment
   */
  const getChakraBalance = useCallback((): Record<ChakraType, number> => {
    const balance: Record<ChakraType, number> = {
      root: 0.5,
      sacral: 0.5,
      solar_plexus: 0.5,
      heart: 0.5,
      throat: 0.5,
      third_eye: 0.5,
      crown: 0.5
    };

    // Apply user's chakra state
    userChakraState.forEach(state => {
      balance[state.chakra] = state.energyLevel;
    });

    // Apply planetary influences
    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      const chakra = PLANETARY_CHAKRA_MAP[planet.toLowerCase()];
      if (chakra) {
        // Stronger planetary position = stronger chakra influence
        const degreeStrength = 1 - Math.abs(15 - position.degree) / 15;
        balance[chakra] += degreeStrength * 0.1; // Small planetary boost
      }
    });

    // Normalize all values to 0-1 range
    Object.keys(balance).forEach(chakra => {
      balance[chakra as ChakraType] = Math.max(0, Math.min(1, balance[chakra as ChakraType]));
    });

    return balance;
  }, [planetaryPositions, userChakraState]);

  /**
   * Get recommendations for a specific chakra
   */
  const getRecommendationsForChakra = useCallback(
    (chakra: ChakraType): Ingredient[] => {
      return availableIngredients
        .map(ingredient => ({
          ingredient,
          affinity: calculateChakraAffinity(ingredient, chakra)
        }))
        .filter(item => item.affinity > 0.3)
        .sort((a, b) => b.affinity - a.affinity)
        .slice(0, 5)
        .map(item => item.ingredient);
    },
    [availableIngredients, calculateChakraAffinity]
  );

  // Auto-generate recommendations when inputs change
  useEffect(() => {
    if (availableIngredients.length > 0) {
      generateRecommendations();
    }
  }, [generateRecommendations, availableIngredients.length]);

  return {
    recommendations,
    loading,
    generateRecommendations,
    getChakraBalance,
    getRecommendationsForChakra,
    primaryChakraFocus: recommendations.chakraFocus
  };
}

export default useChakraInfluencedFood;
