import { 
  CHAKRAS, 
  MAJOR_ARCANA_CHAKRAS, 
  SUIT_CHAKRA_MAPPINGS, 
  KEY_CARD_CHAKRA_MAPPINGS,
  CHAKRA_MAPPING_SUMMARY,
  Chakra,
  MajorArcanaChakra,
  SuitChakraMapping,
  KeyCardChakraMapping
} from '@/types/chakra';
import { _Planet, ZodiacSign, _Element, TarotSuit, ChakraPosition, _ChakraEnergies, EnergyStateProperties } from '@/types/alchemy';

/**
 * ChakraAlchemyService provides utilities for working with chakra-tarot associations
 * and calculating energy distributions across chakras based on astrological factors
 */
export class ChakraAlchemyService {
  /**
   * Map chakras to their alchemical energy states
   */
  private chakraEnergyStateMappings: Record<ChakraPosition, {
    energyState: string,
    elements: string[],
    properties: { heat: string, entropy: string, reactivity: string }
  }> = {
    'root': {
      energyState: 'Matter',
      elements: ['Water', 'Earth'],
      properties: { heat: '-', entropy: '-', reactivity: '-' }
    },
    'sacral': {
      energyState: 'Essence',
      elements: ['Water', 'Fire'],
      properties: { heat: '-', entropy: '-', reactivity: '+' }
    },
    'solarPlexus': {
      energyState: 'Essence',
      elements: ['Fire', 'Water'],
      properties: { heat: '-', entropy: '-', reactivity: '+' }
    },
    'heart': {
      energyState: 'Essence/Spirit',
      elements: ['Air', 'Fire'],
      properties: { heat: '±', entropy: '±', reactivity: '+' }
    },
    'throat': {
      energyState: 'Substance',
      elements: ['Air', 'Earth'],
      properties: { heat: '-', entropy: '+', reactivity: '+' }
    },
    'thirdEye': {
      energyState: 'Essence',
      elements: ['Water', 'Air', 'Fire'],
      properties: { heat: '-', entropy: '-', reactivity: '+' }
    },
    'crown': {
      energyState: 'Spirit',
      elements: ['Fire', 'Air'],
      properties: { heat: '+', entropy: '+', reactivity: '+' }
    }
  };

  /**
   * Get chakra associated with a specific major arcana card
   */
  public getMajorArcanaChakra(cardName: string): MajorArcanaChakra | undefined {
    return MAJOR_ARCANA_CHAKRAS.find(card => card.cardName.toLowerCase() === cardName.toLowerCase());
  }

  /**
   * Get chakra associated with a specific tarot suit
   */
  public getSuitChakra(suit: TarotSuit): SuitChakraMapping | undefined {
    return SUIT_CHAKRA_MAPPINGS.find(mapping => mapping.suit === suit);
  }

  /**
   * Get chakra associated with a specific card
   */
  public getCardChakra(cardName: string): KeyCardChakraMapping | undefined {
    return KEY_CARD_CHAKRA_MAPPINGS.find(card => card.cardName.toLowerCase() === cardName.toLowerCase());
  }

  /**
   * Get all cards associated with a specific chakra
   */
  public getCardsForChakra(chakra: ChakraPosition): KeyCardChakraMapping[] {
    return KEY_CARD_CHAKRA_MAPPINGS.filter(card => card.chakraPosition === chakra);
  }

  /**
   * Get chakra information by position
   */
  public getChakraInfo(position: ChakraPosition): Chakra {
    return CHAKRAS[position];
  }

  /**
   * Get all chakras influenced by a specific planet based on alchemical energy states
   */
  public getChakrasByPlanet(planet: Planet): ChakraPosition[] {
    // Planet to energy state mappings based on alchemical principles - FIXED: Capitalized planet names for type consistency
    const planetEnergyStates: Record<Planet, string[]> = {
      'Sun': ['Spirit'],
      'Moon': ['Essence', 'Matter'],
      'Mercury': ['Spirit', 'Substance'],
      'Venus': ['Essence', 'Matter'],
      'Mars': ['Essence', 'Matter'],
      'Jupiter': ['Spirit', 'Essence'],
      'Saturn': ['Spirit', 'Matter'],
      'Uranus': ['Matter'],
      'Neptune': ['Essence', 'Substance'],
      'Pluto': ['Matter']
    };
    
    // Get the energy states for this planet
    const energyStates = planetEnergyStates[planet] || [];
    
    // Map energy states to chakras
    const chakras: ChakraPosition[] = [];
    
    // For each chakra, check if its energy state matches one of the planet's energy states
    Object.entries(this.chakraEnergyStateMappings).forEach(([chakraPos, mapping]) => {
      if (energyStates.includes(mapping.energyState) || 
          energyStates.includes(mapping.energyState.split('/')[0]) || 
          energyStates.includes(mapping.energyState.split('/')[1])) {
        chakras.push(chakraPos as ChakraPosition);
      }
    });
    
    return chakras.length > 0 ? chakras : ['solarPlexus']; // Default fallback
  }

  /**
   * Calculate chakra energy distribution based on current planetary influences
   */
  public calculateChakraEnergies(
    sunSign: ZodiacSign,
    moonSign: ZodiacSign,
    dominantPlanets: Planet[],
    planetaryHour: Planet
  ): ChakraEnergies {
    const energies: ChakraEnergies = {
      root: 0.2,     // Base value to ensure all chakras have some energy
      sacral: 0.2,
      solarPlexus: 0.2,
      heart: 0.2,
      throat: 0.2,
      thirdEye: 0.2,
      crown: 0.2
    };
    
    // Calculate base values using the sun and moon signs
    this.addZodiacInfluence(energies, sunSign, 1.5); // Sun has stronger influence
    this.addZodiacInfluence(energies, moonSign, 1.2);
    
    // Add influence from dominant planets
    dominantPlanets.forEach(planet => {
      const chakras = this.getChakrasByPlanet(planet);
      chakras.forEach(chakra => {
        const key = this.getChakraKey(chakra);
        if (key) energies[key] += 0.8;
      });
    });
    
    // Add influence from current planetary hour
    const hourChakras = this.getChakrasByPlanet(planetaryHour);
    hourChakras.forEach(chakra => {
      const key = this.getChakraKey(chakra);
      if (key) energies[key] += 1.0;
    });
    
    // Normalize values to be between 0 and 10
    return this.normalizeEnergies(energies);
  }

  /**
   * Convert energy state distribution to chakra energy distribution
   */
  public energyStatesToChakraEnergies(energyStates: EnergyStateProperties): ChakraEnergies {
    const chakraEnergies: ChakraEnergies = {
      root: 0,
      sacral: 0,
      solarPlexus: 0,
      heart: 0,
      throat: 0,
      thirdEye: 0,
      crown: 0
    };
    
    // Map energy states to chakras based on the primary energy state of each chakra
    Object.entries(CHAKRAS).forEach(([position, chakra]) => {
      const key = this.getChakraKey(position as ChakraPosition);
      if (key) {
        chakraEnergies[key] = energyStates[(chakra as unknown)?.primaryEnergyState] * 2; // Scale to make it more visible
      }
    });
    
    return this.normalizeEnergies(chakraEnergies);
  }

  /**
   * Get tarot recommendations to balance specific chakras
   */
  public getTarotRecommendationsForChakra(chakra: ChakraPosition, currentEnergy: number): KeyCardChakraMapping[] {
    // If energy is low (< 3), recommend cards to boost this chakra
    if (currentEnergy < 3) {
      return this.getCardsForChakra(chakra);
    }
    
    // If energy is too high (> 7), recommend cards for adjacent chakras to balance
    if (currentEnergy > 7) {
      const adjacentChakras = this.getAdjacentChakras(chakra);
      return adjacentChakras.flatMap(c => this.getCardsForChakra(c));
    }
    
    // If energy is balanced, return a smaller set of cards for this chakra
    return this.getCardsForChakra(chakra).slice(0, 2);
  }

  /**
   * Helper method to normalize chakra energies to a 0-10 scale
   */
  private normalizeEnergies(energies: ChakraEnergies): ChakraEnergies {
    const values = Object.values(energies);
    const max = Math.max(...values);
    
    if (max === 0) return energies; // Avoid division by zero
    
    const normalized: ChakraEnergies = { ...energies };
    
    Object.keys(energies).forEach(key => {
      const chakraKey = key as keyof ChakraEnergies;
      normalized[chakraKey] = (energies[chakraKey] / max) * 10;
    });
    
    return normalized;
  }

  /**
   * Helper method to add zodiac influence to chakra energies based on alchemical principles
   */
  private addZodiacInfluence(energies: ChakraEnergies, sign: ZodiacSign, strength: number): void {
    // Map zodiac signs to elements
    const zodiacElements: Record<ZodiacSign, string[]> = {
      'aries': ['Fire'],
      'taurus': ['Earth'],
      'gemini': ['Air'],
      'cancer': ['Water'],
      'leo': ['Fire'],
      'virgo': ['Earth'],
      'libra': ['Air'],
      'scorpio': ['Water'],
      'sagittarius': ['Fire'],
      'capricorn': ['Earth'],
      'aquarius': ['Air'],
      'pisces': ['Water']
    };
    
    // Get elements for this sign
    const elements = zodiacElements[sign] || [];
    
    // For each chakra, check if its elements include the sign's element
    Object.entries(this.chakraEnergyStateMappings).forEach(([chakraPos, mapping]) => {
      const chakraElements = mapping.elements;
      const hasMatchingElement = elements.some(elem => chakraElements.includes(elem));
      
      // Special case: Crown chakra (Spirit) should not include Water
      if (chakraPos === 'crown' && elements.includes('Water')) {
        return;
      }
      
      // Special case: Root/Throat chakras should not include Fire
      if ((chakraPos === 'root' || chakraPos === 'throat') && elements.includes('Fire')) {
        return;
      }
      
      if (hasMatchingElement) {
        const key = this.getChakraKey(chakraPos as ChakraPosition);
        if (key) energies[key] += strength;
      }
    });
  }

  /**
   * Helper method to get adjacent chakras for balancing
   */
  private getAdjacentChakras(chakra: ChakraPosition): ChakraPosition[] {
    const chakraOrder: ChakraPosition[] = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'];
    const index = chakraOrder.indexOf(chakra);
    
    if (index === -1) return [];
    
    const adjacent: ChakraPosition[] = [];
    if (index > 0) adjacent.push(chakraOrder[index - 1]);
    if (index < chakraOrder.length - 1) adjacent.push(chakraOrder[index + 1]);
    
    return adjacent;
  }

  /**
   * Convert ChakraPosition to ChakraEnergies key
   */
  private getChakraKey(position: ChakraPosition): keyof ChakraEnergies | null {
    const mapping: Record<ChakraPosition, keyof ChakraEnergies> = {
      'root': 'root',
      'sacral': 'sacral',
      'solarPlexus': 'solarPlexus',
      'heart': 'heart',
      'throat': 'throat',
      'thirdEye': 'thirdEye',
      'crown': 'crown'
    };
    
    return mapping[position] || null;
  }
}

export default ChakraAlchemyService; 