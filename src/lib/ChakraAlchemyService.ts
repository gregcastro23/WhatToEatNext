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
import { Planet, ZodiacSign, Element, TarotSuit, ChakraPosition, ChakraEnergies, EnergyStateProperties } from '@/types/alchemy';

/**
 * ChakraAlchemyService provides utilities for working with chakra-tarot associations
 * and calculating energy distributions across chakras based on astrological factors
 */
export class ChakraAlchemyService {
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
   * Get all chakras influenced by a specific planet
   */
  public getChakrasByPlanet(planet: Planet): ChakraPosition[] {
    const chakras: ChakraPosition[] = [];
    
    // Check major arcana associations
    MAJOR_ARCANA_CHAKRAS.forEach(card => {
      if (card.planet === planet && !chakras.includes(card.chakraPosition)) {
        chakras.push(card.chakraPosition);
      }
    });
    
    // Check key card associations
    KEY_CARD_CHAKRA_MAPPINGS.forEach(card => {
      if (card.planetaryAssociation === planet && !chakras.includes(card.chakraPosition)) {
        chakras.push(card.chakraPosition);
      }
    });
    
    return chakras;
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
      root: 0,
      sacral: 0,
      solarPlexus: 0,
      heart: 0,
      throat: 0,
      brow: 0,
      crown: 0
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
      brow: 0,
      crown: 0
    };
    
    // Map energy states to chakras based on the primary energy state of each chakra
    Object.entries(CHAKRAS).forEach(([position, chakra]) => {
      const key = this.getChakraKey(position as ChakraPosition);
      if (key) {
        chakraEnergies[key] = energyStates[chakra.primaryEnergyState] * 2; // Scale to make it more visible
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
   * Helper method to add zodiac influence to chakra energies
   */
  private addZodiacInfluence(energies: ChakraEnergies, sign: ZodiacSign, strength: number): void {
    // Map zodiac signs to chakras
    const zodiacChakraMap: Record<ZodiacSign, ChakraPosition[]> = {
      'aries': ['root', 'solar plexus'],
      'taurus': ['root', 'sacral'],
      'gemini': ['throat', 'brow'],
      'cancer': ['sacral', 'heart'],
      'leo': ['solar plexus', 'heart'],
      'virgo': ['root', 'solar plexus'],
      'libra': ['heart', 'throat'],
      'scorpio': ['sacral', 'brow'],
      'sagittarius': ['solar plexus', 'crown'],
      'capricorn': ['root'],
      'aquarius': ['throat', 'crown'],
      'pisces': ['sacral', 'brow', 'crown']
    };
    
    const chakras = zodiacChakraMap[sign] || [];
    chakras.forEach(chakra => {
      const key = this.getChakraKey(chakra);
      if (key) energies[key] += strength;
    });
  }

  /**
   * Helper method to get adjacent chakras for balancing
   */
  private getAdjacentChakras(chakra: ChakraPosition): ChakraPosition[] {
    const chakraOrder: ChakraPosition[] = ['root', 'sacral', 'solar plexus', 'heart', 'throat', 'brow', 'crown'];
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
      'solar plexus': 'solarPlexus',
      'heart': 'heart',
      'throat': 'throat',
      'brow': 'brow',
      'crown': 'crown'
    };
    
    return mapping[position] || null;
  }
}

export default ChakraAlchemyService; 