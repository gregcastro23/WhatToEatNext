import { RulingPlanet } from './planets';

/**
 * The four elemental characters used in alchemical calculations
 */
export type ElementalCharacter = 'Fire' | 'Water' | 'Earth' | 'Air';

/**
 * The four alchemical properties derived from elemental interactions
 */
export type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';

/**
 * Maps planets to their elemental character
 */
export const planetaryElementMap: Record<RulingPlanet, ElementalCharacter> = {
  sun: 'Fire',
  Moon: 'Water',
  mercury: 'Air',
  venus: 'Water',
  Mars: 'Fire',
  Jupiter: 'Air',
  Saturn: 'Earth',
  Neptune: 'Water',
  Uranus: 'Air',
  Pluto: 'Earth'
};

/**
 * Maps tarot suits to their elemental character
 */
export const tarotSuitElementMap: Record<string, ElementalCharacter> = {
  Wands: 'Fire',
  Cups: 'Water',
  Pentacles: 'Earth',
  Swords: 'Air'
};

/**
 * Maps tarot cards to their quantum values
 * Court cards have the following values:
 * Page = 1, Knight = 2, Queen = 3, King = 4
 */
export const tarotCardQuantumValues: Record<string, number> = {
  // Wands (Fire)
  'ace of wands': 1,
  'two of wands': 2,
  'three of wands': 3,
  'four of wands': 4,
  'five of wands': 5,
  'six of wands': 6,
  'seven of wands': 7,
  'eight of wands': 8,
  'nine of wands': 9,
  'ten of wands': 10,
  'page of wands': 1,
  'knight of wands': 2,
  'queen of wands': 3,
  'king of wands': 4,

  // Cups (Water)
  'ace of cups': 1,
  'two of cups': 2,
  'three of cups': 3,
  'four of cups': 4,
  'five of cups': 5,
  'six of cups': 6,
  'seven of cups': 7,
  'eight of cups': 8,
  'nine of cups': 9,
  'ten of cups': 10,
  'page of cups': 1,
  'knight of cups': 2,
  'queen of cups': 3,
  'king of cups': 4,

  // Pentacles (Earth)
  'ace of pentacles': 1,
  'two of pentacles': 2,
  'three of pentacles': 3,
  'four of pentacles': 4,
  'five of pentacles': 5,
  'six of pentacles': 6,
  'seven of pentacles': 7,
  'eight of pentacles': 8,
  'nine of pentacles': 9,
  'ten of pentacles': 10,
  'page of pentacles': 1,
  'knight of pentacles': 2,
  'queen of pentacles': 3,
  'king of pentacles': 4,

  // Swords (Air)
  'ace of swords': 1,
  'two of swords': 2,
  'three of swords': 3,
  'four of swords': 4,
  'five of swords': 5,
  'six of swords': 6,
  'seven of swords': 7,
  'eight of swords': 8,
  'nine of swords': 9,
  'ten of swords': 10,
  'page of swords': 1,
  'knight of swords': 2,
  'queen of swords': 3,
  'king of swords': 4
};

/**
 * Maps major arcana cards to their ruling planets
 */
export const majorArcanaPlanetMap: Record<string, RulingPlanet> = {
  'the magician': 'mercury',
  'the high priestess': 'Moon',
  'the empress': 'venus',
  'the emperor': 'Mars',
  'the hierophant': 'Jupiter',
  'the lovers': 'venus',
  'the chariot': 'Moon',
  'strength': 'sun',
  'the hermit': 'Saturn',
  'wheel of fortune': 'Jupiter',
  'justice': 'venus',
  'the hanged man': 'Neptune',
  'death': 'Pluto',
  'temperance': 'Jupiter',
  'the devil': 'Saturn',
  'the tower': 'Mars',
  'the star': 'Uranus',
  'the moon': 'Moon',
  'the sun': 'sun',
  'judgement': 'Pluto',
  'the world': 'Saturn'
};

/**
 * Maps each planet to a corresponding alchemical property
 */
export const planetaryAlchemicalMap: Record<RulingPlanet, AlchemicalProperty> = {
  sun: 'Spirit',
  Moon: 'Essence',
  mercury: 'Substance',
  venus: 'Essence',
  Mars: 'Spirit',
  Jupiter: 'Substance',
  Saturn: 'Matter',
  Neptune: 'Essence',
  Uranus: 'Substance',
  Pluto: 'Matter'
};

/**
 * Gets the elemental character associated with a planet
 * @param planet Ruling planet
 * @returns The associated elemental character
 */
export const getPlanetaryElement = (planet: RulingPlanet): ElementalCharacter => {
  return planetaryElementMap[planet];
};

/**
 * Gets the alchemical property associated with a planet
 * @param planet Ruling planet
 * @returns The associated alchemical property
 */
export const getPlanetaryAlchemicalProperty = (planet: RulingPlanet): AlchemicalProperty => {
  return planetaryAlchemicalMap[planet];
};

/**
 * Gets the elemental character from a tarot card name
 * @param cardName Tarot card name
 * @returns The associated elemental character or null if not found
 */
export const getTarotCardElement = (cardName: string): ElementalCharacter | null => {
  // Check if it's a minor arcana card
  for (const [suit, element] of Object.entries(tarotSuitElementMap)) {
    if (cardName.includes(suit)) {
      return element;
    }
  }
  
  // For major arcana, use the planetary association if available
  const planet = majorArcanaPlanetMap[cardName];
  if (planet) {
    return planetaryElementMap[planet];
  }
  
  return null;
};

/**
 * Gets the quantum value for a tarot card (minor arcana only)
 * @param cardName Tarot card name
 * @returns The quantum value or 0 if not found
 */
export const getTarotCardQuantum = (cardName: string): number => {
  return tarotCardQuantumValues[cardName] || 0;
};

/**
 * Gets the ruling planet for a major arcana card
 * @param cardName Major arcana card name
 * @returns The ruling planet or null if not found
 */
export const getTarotCardPlanet = (cardName: string): RulingPlanet | null => {
  return majorArcanaPlanetMap[cardName] || null;
}; 