import { useState, useEffect, useMemo } from 'react';
import { useAstrologicalState } from './useAstrologicalState';
import { getTarotCardsForDate } from '@/lib/tarotCalculations';
import { ElementalCharacter } from '@/constants/planetaryElements';
import { LunarPhase } from '@/constants/planetaryFoodAssociations';
import { PLANET_TO_MAJOR_ARCANA } from '@/constants/tarotCards';
import { calculateSignEnergyStates, SignEnergyState } from '@/constants/signEnergyStates';
import { calculateAspects, PlanetaryAspect } from '@/utils/astrologyUtils';

export interface TarotAstrologyData {
  // Astrological data
  currentPlanetaryAlignment: any;
  currentZodiac: string | null;
  activePlanets: string[];
  isDaytime: boolean;
  moonPhase: any;
  lunarPhase: LunarPhase | null;
  
  // Tarot data
  minorCard: any;
  majorCard: any;
  planetaryCards: Record<string, any>;
  
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
  currentLunarPhase: LunarPhase | null;
}

export const useTarotAstrologyData = (): TarotAstrologyData & { isLoading: boolean; error: string | null } => {
  const { 
    currentPlanetaryAlignment, 
    currentZodiac, 
    activePlanets, 
    isDaytime, 
    moonPhase, 
    lunarPhase,
    isLoading: isAstroLoading,
    error: astroError
  } = useAstrologicalState();
  
  const [tarotCards, setTarotCards] = useState<{ minorCard: any, majorCard: any } | null>(null);
  const [tarotError, setTarotError] = useState<string | null>(null);
  const [tarotElementBoosts, setTarotElementBoosts] = useState<Record<ElementalCharacter, number>>({
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  });
  const [tarotPlanetaryBoosts, setTarotPlanetaryBoosts] = useState<Record<string, number>>({});
  const [currentLunarPhase, setCurrentLunarPhase] = useState<LunarPhase | null>(null);
  const [signEnergyStates, setSignEnergyStates] = useState<SignEnergyState[]>([]);
  
  // Move the function declaration before any usage
  function calculatePlanetaryEnergy(planet: string): number {
    if (currentPlanetaryAlignment && currentPlanetaryAlignment[planet.toLowerCase()]) {
        const position = currentPlanetaryAlignment[planet.toLowerCase()];
        
        // Check if position has a sign property and it's defined
        if (!position || !position.sign) {
            return 0.5; // Default middle value if position or sign is missing
        }
        
        // Get the sign's current energy state
        const signState = signEnergyStates.find(state => 
            state.sign && position.sign && 
            state.sign.toLowerCase() === position.sign.toLowerCase()
        );
        
        if (signState) {
            // Use the sign's current energy as a base
            const degreeModifier = position.degree / 30.0;
            return Math.min(1.0, Math.max(0.1, signState.currentEnergy * degreeModifier));
        }
    }
    return 0.5; // Default middle value if position unknown
  }
  
  // Get Tarot cards for current date - only recalculate when the date changes
  useEffect(() => {
    try {
      const currentDate = new Date();
      
      // Get sun position from planetary alignment if available
      const sunPosition = currentPlanetaryAlignment?.sun ? {
        sign: currentPlanetaryAlignment.sun.sign,
        degree: currentPlanetaryAlignment.sun.degree || 0
      } : undefined;
      
      // Log the sun position for debugging
      console.log('Current Sun Position for Tarot Calculation:', sunPosition);
      
      // Calculate cards with sun position - don't use cache to ensure fresh calculation
      const cards = getTarotCardsForDate(currentDate, sunPosition);
      setTarotCards(cards);
      
    } catch (err) {
      setTarotError('Failed to load tarot cards');
      console.error(err);
    }
  }, [currentPlanetaryAlignment]);
  
  // Calculate planetaryCards - mapping of planets to their tarot cards
  const planetaryCards = useMemo(() => {
    const cardMap: Record<string, any> = {};
    
    if (activePlanets && activePlanets.length) {
      activePlanets.forEach(planet => {
        const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
        // Type guard to check if planetName is a valid key in PLANET_TO_MAJOR_ARCANA
        if (planetName in PLANET_TO_MAJOR_ARCANA) {
          // Now TypeScript knows planetName is a valid key
          const typedPlanetName = planetName as keyof typeof PLANET_TO_MAJOR_ARCANA;
          const arcanaName = PLANET_TO_MAJOR_ARCANA[typedPlanetName];
          cardMap[planetName] = {
            name: arcanaName,
            energy: calculatePlanetaryEnergy(planetName) // Now references the hoisted function
          };
        }
      });
    }
    
    return cardMap;
  }, [activePlanets, currentPlanetaryAlignment]);
  
  // Calculate elemental boosts from tarot cards
  useEffect(() => {
    if (tarotCards) {
      const boosts: Record<ElementalCharacter, number> = {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      };
      
      // Map suits to elements
      const suitMap: Record<string, ElementalCharacter> = {
        'Wands': 'Fire',
        'Cups': 'Water',
        'Pentacles': 'Earth',
        'Swords': 'Air'
      };
      
      // Calculate based on minor card
      const suit = tarotCards.minorCard.suit;
      const element = suitMap[suit];
      if (element) {
        boosts[element] += tarotCards.minorCard.number * 0.1;
      }
      
      // Add influence from major card
      if (tarotCards.majorCard) {
        const majorElement = getMajorArcanaElement(tarotCards.majorCard.name);
        if (majorElement && majorElement in boosts) {
          boosts[majorElement as ElementalCharacter] += 0.15;
        }
      }
      
      setTarotElementBoosts(boosts);
      
      // Calculate planetary boosts
      if (tarotCards.majorCard && tarotCards.majorCard.planet) {
        const planetaryBoost: Record<string, number> = {};
        planetaryBoost[tarotCards.majorCard.planet] = 0.2;
        setTarotPlanetaryBoosts(planetaryBoost);
      }
    }
  }, [tarotCards]);
  
  // Determine lunar phase
  useEffect(() => {
    // Use the lunar phase from astrological state if available
    if (lunarPhase) {
      setCurrentLunarPhase(lunarPhase as LunarPhase);
    }
    // Otherwise map from moon phase data if available
    else if (moonPhase) {
      const phase = moonPhase.toLowerCase();
      if (phase.includes('new')) {
        setCurrentLunarPhase('New Moon');
      } else if (phase.includes('full')) {
        setCurrentLunarPhase('Full Moon');
      } else if (phase.includes('first quarter')) {
        setCurrentLunarPhase('First Quarter');
      } else if (phase.includes('last quarter')) {
        setCurrentLunarPhase('Last Quarter');
      } else if (phase.includes('waxing') && phase.includes('crescent')) {
        setCurrentLunarPhase('Waxing Crescent');
      } else if (phase.includes('waxing') && phase.includes('gibbous')) {
        setCurrentLunarPhase('Waxing Gibbous');
      } else if (phase.includes('waning') && phase.includes('gibbous')) {
        setCurrentLunarPhase('Waning Gibbous');
      } else if (phase.includes('waning') && phase.includes('crescent')) {
        setCurrentLunarPhase('Waning Crescent');
      }
    }
  }, [moonPhase, lunarPhase]);
  
  // Helper function to get element for major arcana
  const getMajorArcanaElement = (cardName: string): string | null => {
    const elementMap: Record<string, string> = {
      'The Fool': 'Air',
      'The Magician': 'Air',
      'The High Priestess': 'Water',
      'The Empress': 'Earth',
      'The Emperor': 'Fire',
      'The Hierophant': 'Earth',
      'The Lovers': 'Air',
      'The Chariot': 'Water',
      'Strength': 'Fire',
      'The Hermit': 'Earth',
      'Wheel of Fortune': 'Fire',
      'Justice': 'Air',
      'The Hanged Man': 'Water',
      'Death': 'Water',
      'Temperance': 'Fire',
      'The Devil': 'Earth',
      'The Tower': 'Fire',
      'The Star': 'Air',
      'The Moon': 'Water',
      'The Sun': 'Fire',
      'Judgement': 'Water',
      'The World': 'Earth'
    };
    
    return elementMap[cardName] || null;
  };
  
  const calculateTarotEnergyBoosts = (cards: any[]): { 
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  } => {
    const boosts = {
        Spirit: 0,
        Essence: 0,
        Matter: 0,
        Substance: 0
    };

    cards.forEach(card => {
        if (!card) return;
        
        // Handle minor arcana cards
        if (card.suit) {
            // Map suit to energy type
            switch(card.suit) {
                case 'Wands':
                    boosts.Spirit += card.number || 0;
                    break;
                case 'Cups':
                    boosts.Essence += card.number || 0;
                    break;
                case 'Pentacles':
                    boosts.Matter += card.number || 0;
                    break;
                case 'Swords':
                    boosts.Substance += card.number || 0;
                    break;
            }
        }
        
        // Handle major arcana cards
        if (card.planet) {
            // Add planet-based energy
            const planetBoost = 0.5; // Base value for planetary influence
            
            // Map planets to energy types
            switch(card.planet) {
                case 'Sun':
                    boosts.Spirit += planetBoost;
                    break;
                case 'Moon':
                    boosts.Essence += planetBoost;
                    break;
                case 'Mercury':
                case 'Venus':
                    boosts.Substance += planetBoost;
                    break;
                case 'Mars':
                case 'Jupiter':
                    boosts.Spirit += planetBoost / 2;
                    boosts.Essence += planetBoost / 2;
                    break;
                case 'Saturn':
                case 'Uranus':
                case 'Neptune':
                case 'Pluto':
                    boosts.Matter += planetBoost;
                    break;
            }
        }
    });

    return boosts;
  };
  
  useEffect(() => {
    if (currentPlanetaryAlignment && Object.keys(currentPlanetaryAlignment).length > 0) {
        // Verify all planet positions have valid sign properties before calculating aspects
        const hasValidPositions = Object.values(currentPlanetaryAlignment).every(
          position => position && position.sign
        );
        
        if (hasValidPositions) {
          const aspectData = calculateAspects(currentPlanetaryAlignment);
          // Use the aspects array from aspectData to match what calculateSignEnergyStates expects
          const states = calculateSignEnergyStates(currentPlanetaryAlignment, aspectData.aspects as any);
          setSignEnergyStates(states);
        } else {
          console.warn('Some planetary positions have invalid or missing sign data');
        }
    }
  }, [currentPlanetaryAlignment]);
  
  return {
    // Original astrological data
    currentPlanetaryAlignment,
    currentZodiac,
    activePlanets,
    isDaytime,
    moonPhase,
    lunarPhase,
    
    // Tarot data
    minorCard: tarotCards?.minorCard || null,
    majorCard: tarotCards?.majorCard || null,
    planetaryCards,
    
    // Alchemical values from tarot
    alchemicalValues: calculateTarotEnergyBoosts(tarotCards ? [tarotCards.minorCard, tarotCards.majorCard] : []),
    
    // Derived data
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    currentLunarPhase,
    
    // Status
    isLoading: isAstroLoading || !tarotCards,
    error: astroError || tarotError
  };
}; 