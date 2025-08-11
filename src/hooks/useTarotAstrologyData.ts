import { useState, useEffect, useMemo, useCallback } from 'react';

import { ElementalCharacter } from '@/constants/planetaryElements';
import { LunarPhase as FoodAssociationsLunarPhase } from '@/constants/planetaryFoodAssociations';
import { calculateSignEnergyStates, SignEnergyState } from '@/constants/signEnergyStates';
import { PLANET_TO_MAJOR_ARCANA } from '@/constants/tarotCards';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import {
  PlanetaryAspect,
  LunarPhaseWithSpaces,
} from '@/types/alchemy';
// Import all lunar phase utilities from the centralized utility file

// Import the logger utility
import { createLogger } from '@/utils/logger';
import {
  REVERSE_LUNAR_PHASE_MAP,
} from '@/utils/lunarPhaseUtils';

import { useAstrologicalState } from './useAstrologicalState';

// Create a component-specific logger
const logger = createLogger('TarotAstrology');

// Define types for tarot cards
interface TarotCard {
  name: string;
  number?: number;
  suit?: string;
  planet?: string;
  element?: string;
  description?: string;
  keywords?: string[];
  [key: string]: unknown;
}

// Adapter function to convert between different lunar phase formats
export function adaptLunarPhase(
  phase: FoodAssociationsLunarPhase | null | undefined,
): LunarPhaseWithSpaces | null {
  if (!phase) return null;

  // Direct mapping without needing REVERSE_LUNAR_PHASE_MAP
  const phaseMap: Record<string, LunarPhaseWithSpaces> = {
    'New Moon': 'new moon',
    'Waxing Crescent': 'waxing crescent',
    'First Quarter': 'first quarter',
    'Waxing Gibbous': 'waxing gibbous',
    'Full Moon': 'full moon',
    'Waning Gibbous': 'waning gibbous',
    'Last Quarter': 'last quarter',
    'Waning Crescent': 'waning crescent',
  };

  return phaseMap[phase] || null;
}

export interface TarotAstrologyData {
  // Astrological data
  currentPlanetaryAlignment: Record<
    string,
    {
      sign: string;
      degree: number;
      exactLongitude?: number;
    }
  >;
  currentZodiac: string | null;
  activePlanets: string[];
  isDaytime: boolean;
  lunarPhase: LunarPhaseWithSpaces | null;

  // Tarot data
  minorCard: TarotCard | null;
  majorCard: TarotCard | null;
  planetaryCards: Record<string, TarotCard>;

  // Alchemical values from tarot
  alchemicalValues: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };

  // Derived data
  tarotElementBoosts: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts: Record<string, number>;
  currentLunarPhase: LunarPhaseWithSpaces | null;
}

export interface TarotAstrologyResult extends TarotAstrologyData {
  isLoading: boolean;
  error: string | null;
}

export const useTarotAstrologyData = (): TarotAstrologyResult => {
  const {
    currentPlanetaryAlignment: rawPlanetaryAlignment,
    currentZodiac,
    activePlanets,
    isDaytime,
    lunarPhase: foodAssociationsLunarPhase,
    loading,
  } = useAstrologicalState();

  // Safe type conversion using unknown pattern
  const currentPlanetaryAlignment = rawPlanetaryAlignment as unknown as Record<
    string,
    {
      sign: string;
      degree: number;
      exactLongitude?: number;
    }
  >;

  // Convert the lunarPhase to the alchemy format
  const lunarPhase = useMemo(() => {
    try {
      // Cast the string to FoodAssociationsLunarPhase since it matches the expected format
      return foodAssociationsLunarPhase
        ? adaptLunarPhase(foodAssociationsLunarPhase as unknown as FoodAssociationsLunarPhase)
        : null;
    } catch (error) {
      logger.error('Error converting lunar phase', error);
      return null;
    }
  }, [foodAssociationsLunarPhase]);

  const [tarotCards, setTarotCards] = useState<{
    minorCard: TarotCard | null;
    majorCard: TarotCard | null;
  }>({
    minorCard: null,
    majorCard: null,
  });
  const [tarotError, setTarotError] = useState<string | null>(null);
  const [tarotElementBoosts, setTarotElementBoosts] = useState<Record<ElementalCharacter, number>>({
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  });
  const [tarotPlanetaryBoosts, setTarotPlanetaryBoosts] = useState<Record<string, number>>({});
  const [currentLunarPhase, setCurrentLunarPhase] = useState<LunarPhaseWithSpaces | null>(null);
  const [signEnergyStates, setSignEnergyStates] = useState<SignEnergyState[]>([]);
  const [alchemicalValues, setAlchemicalValues] = useState<{
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  }>({
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  });

  // Move the function declaration before any usage
  const calculatePlanetaryEnergy = useCallback(
    (planet: string): number => {
      try {
        if (currentPlanetaryAlignment[planet.toLowerCase()]) {
          const position = currentPlanetaryAlignment[planet.toLowerCase()];

          // Check if position has a sign property and it's defined
          if (!position || !position.sign) {
            return 0.5; // Default middle value if position or sign is missing
          }

          // Get the sign's current energy state
          const signState = signEnergyStates.find(
            state =>
              state.sign &&
              position.sign &&
              state.sign.toLowerCase() === position.sign.toLowerCase(),
          );

          if (signState) {
            // Use the sign's current energy as a base
            const degreeModifier = position.degree / 30.0;
            return Math.min(1.0, Math.max(0.1, signState.currentEnergy * degreeModifier));
          }
        }
        return 0.5; // Default middle value if position unknown
      } catch (error) {
        logger.error(`Error calculating planetary energy for ${planet}`, error);
        return 0.5; // Default on error
      }
    },
    [currentPlanetaryAlignment, signEnergyStates],
  );

  // Get Tarot cards for current date - only recalculate when the date changes
  useEffect(() => {
    try {
      const currentDate = new Date();

      // Get sun position from planetary alignment if available
      const sunPosition = currentPlanetaryAlignment.sun
        ? {
            sign: currentPlanetaryAlignment.sun.sign,
            degree: currentPlanetaryAlignment.sun.degree || 0,
          }
        : undefined;

      // Log the sun position for debugging
      logger.debug('Current Sun Position for Tarot Calculation:', sunPosition);

      // Calculate cards with sun position - don't use cache to ensure fresh calculation
      const cards = getTarotCardsForDate(currentDate, sunPosition);
      setTarotCards({
        minorCard: cards.minorCard || null,
        majorCard: cards.majorCard
          ? ({
              name: cards.majorCard.name,
              planet: cards.majorCard.planet,
              element: cards.majorCard.element,
              keywords: cards.majorCard.keywords,
              suit: 'Major Arcana', // Major arcana cards don't have suits, so use a placeholder
              number: 0, // Major arcana cards don't have numbers, so use 0
            } as TarotCard)
          : null,
      });
    } catch (err) {
      setTarotError('Failed to load tarot cards');
      logger.error('Error loading tarot cards:', err);
      // Set fallback values
      setTarotCards({ minorCard: null, majorCard: null });
    }
  }, [currentPlanetaryAlignment]);

  // Calculate planetaryCards - mapping of planets to their tarot cards
  const planetaryCards = useMemo(() => {
    const cardMap: Record<string, TarotCard> = {};

    try {
      if (activePlanets.length) {
        activePlanets.forEach(planet => {
          const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
          // Type guard to check if planetName is a valid key in PLANET_TO_MAJOR_ARCANA
          if (planetName in PLANET_TO_MAJOR_ARCANA) {
            // Now TypeScript knows planetName is a valid key
            const typedPlanetName = planetName as keyof typeof PLANET_TO_MAJOR_ARCANA;
            const arcanaName = PLANET_TO_MAJOR_ARCANA[typedPlanetName];
            cardMap[planetName] = {
              name: arcanaName,
              energy: calculatePlanetaryEnergy(planetName), // Now references the hoisted function
            } as TarotCard;
          }
        });
      }
      return cardMap;
    } catch (error) {
      logger.error('Error calculating planetary cards', error);
      return {};
    }
  }, [activePlanets, currentPlanetaryAlignment, signEnergyStates, calculatePlanetaryEnergy]);

  // Calculate elemental boosts from tarot cards
  useEffect(() => {
    try {
      if (tarotCards.minorCard || tarotCards.majorCard) {
        const boosts: Record<ElementalCharacter, number> = {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        };

        // Map suits to elements
        const suitMap: Record<string, ElementalCharacter> = {
          Wands: 'Fire',
          Cups: 'Water',
          Pentacles: 'Earth',
          Swords: 'Air',
        };

        // Calculate based on minor card
        if (tarotCards.minorCard?.suit) {
          const suit = tarotCards.minorCard.suit;
          const element = suitMap[suit];
          if (element) {
            boosts[element] += (tarotCards.minorCard.number || 0) * 0.1;
          }
        }

        // Add influence from major card
        if (tarotCards.majorCard?.name) {
          const majorElement = getMajorArcanaElement(tarotCards.majorCard.name);
          if (majorElement && majorElement in boosts) {
            boosts[majorElement as ElementalCharacter] += 0.15;
          }
        }

        setTarotElementBoosts(boosts);

        // Calculate planetary boosts
        if (tarotCards.majorCard?.planet) {
          const planetaryBoost: Record<string, number> = {};
          planetaryBoost[tarotCards.majorCard.planet] = 0.2;
          setTarotPlanetaryBoosts(planetaryBoost);
        }

        // Calculate alchemical values from tarot energies
        if (tarotCards.minorCard || tarotCards.majorCard) {
          const cards: any[] = [];
          if (tarotCards.minorCard) cards.push(tarotCards.minorCard);
          if (tarotCards.majorCard) cards.push(tarotCards.majorCard);
          // calculateTarotEnergyBoosts will be called in a separate useEffect
        }
      }
    } catch (error) {
      logger.error('Error calculating tarot element boosts', error);
    }
  }, [tarotCards]);

  // Determine lunar phase
  useEffect(() => {
    try {
      // Use the lunar phase from astrological state if available
      if (foodAssociationsLunarPhase) {
        const normalizedPhase = REVERSE_LUNAR_PHASE_MAP[foodAssociationsLunarPhase];
        if (normalizedPhase) {
          setCurrentLunarPhase(normalizedPhase as LunarPhaseWithSpaces);
        }
      }
      // Otherwise use a default lunar phase
      else {
        // Default to full moon as a fallback
        setCurrentLunarPhase('full moon' as LunarPhaseWithSpaces);
      }
    } catch (error) {
      logger.error('Error determining lunar phase', error);
      setCurrentLunarPhase('full moon' as LunarPhaseWithSpaces);
    }
  }, [foodAssociationsLunarPhase]);

  // Helper function to get element for major arcana
  const getMajorArcanaElement = (cardName: string): string | null => {
    // Map major arcana cards to elements
    const elementMap: Record<string, ElementalCharacter> = {
      'The Emperor': 'Fire',
      'The Empress': 'Earth',
      'The Hermit': 'Earth',
      'The Sun': 'Fire',
      'The Moon': 'Water',
      'The Star': 'Air',
      'The Chariot': 'Water',
      'The Lovers': 'Air',
      'The High Priestess': 'Water',
      'The Magician': 'Air',
      'The Tower': 'Fire',
      Temperance: 'Water',
      Strength: 'Fire',
      Justice: 'Air',
      'The Hanged Man': 'Water',
      'Wheel of Fortune': 'Fire',
    };

    return elementMap[cardName] || null;
  };

  // This function will calculate alchemical values from tarot cards
  const calculateTarotEnergyBoosts = useCallback(
    (
      cards: TarotCard[],
    ): {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    } => {
      try {
        const result = {
          Spirit: 0,
          Essence: 0,
          Matter: 0,
          Substance: 0,
        };

        // Map elements to alchemical properties
        const alchemicalMap: Record<ElementalCharacter, keyof typeof result> = {
          Fire: 'Spirit',
          Water: 'Essence',
          Earth: 'Matter',
          Air: 'Substance',
        };

        cards.forEach(card => {
          // Get card element
          let element: ElementalCharacter | string | null = null;

          if (card.suit) {
            // Minor arcana
            const suitMap: Record<string, ElementalCharacter> = {
              Wands: 'Fire',
              Cups: 'Water',
              Pentacles: 'Earth',
              Swords: 'Air',
            };
            element = suitMap[card.suit] || null;
          } else if (card.name) {
            // Major arcana
            element = getMajorArcanaElement(card.name) || null;
          }

          if (element) {
            const property = alchemicalMap[element as ElementalCharacter];
            if (property) {
              // Increment by a fixed amount or by card number if available
              const increment = card.number ? card.number * 0.05 : 0.1;
              result[property] += increment;
            }
          }
        });

        // Normalize values to be between 0 and 1
        const total = Object.values(result).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          Object.keys(result).forEach(key => {
            result[key as keyof typeof result] /= total;
          });
        }

        return result;
      } catch (error) {
        logger.error('Error calculating tarot energy boosts', error);
        return {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25,
        };
      }
    },
    [],
  );

  // Load sign energy states on init
  useEffect(() => {
    try {
      setSignEnergyStates(calculateSignEnergyStates({}, []));
    } catch (error) {
      logger.error('Error calculating sign energy states', error);
    }
  }, []);

  return {
    currentPlanetaryAlignment,
    currentZodiac,
    activePlanets,
    isDaytime,
    lunarPhase,
    minorCard: tarotCards.minorCard,
    majorCard: tarotCards.majorCard,
    planetaryCards,
    alchemicalValues,
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    currentLunarPhase,
    isLoading: loading,
    error: tarotError,
  };
};
