'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getTarotCardPlanet =
  exports.getTarotCardQuantum =
  exports.getTarotCardElement =
  exports.getPlanetaryAlchemicalProperty =
  exports.getPlanetaryElement =
  exports.planetaryAlchemicalMap =
  exports.majorArcanaPlanetMap =
  exports.tarotCardQuantumValues =
  exports.tarotSuitElementMap =
  exports.planetaryElementMap =
    void 0;
/**
 * Maps planets to their elemental character
 */
exports.planetaryElementMap = {
  Sun: 'Fire',
  Moon: 'Water',
  Mercury: 'Air',
  Venus: 'Water',
  Mars: 'Fire',
  Jupiter: 'Air',
  Saturn: 'Earth',
  Neptune: 'Water',
  Uranus: 'Air',
  Pluto: 'Earth',
};
/**
 * Maps tarot suits to their elemental character
 */
exports.tarotSuitElementMap = {
  Wands: 'Fire',
  Cups: 'Water',
  Pentacles: 'Earth',
  Swords: 'Air',
};
/**
 * Maps tarot cards to their quantum values
 * Court cards have the following values:
 * Page = 1, Knight = 2, Queen = 3, King = 4
 */
exports.tarotCardQuantumValues = {
  // Wands (Fire)
  'Ace of Wands': 1,
  'Two of Wands': 2,
  'Three of Wands': 3,
  'Four of Wands': 4,
  'Five of Wands': 5,
  'Six of Wands': 6,
  'Seven of Wands': 7,
  'Eight of Wands': 8,
  'Nine of Wands': 9,
  'Ten of Wands': 10,
  'Page of Wands': 1,
  'Knight of Wands': 2,
  'Queen of Wands': 3,
  'King of Wands': 4,
  // Cups (Water)
  'Ace of Cups': 1,
  'Two of Cups': 2,
  'Three of Cups': 3,
  'Four of Cups': 4,
  'Five of Cups': 5,
  'Six of Cups': 6,
  'Seven of Cups': 7,
  'Eight of Cups': 8,
  'Nine of Cups': 9,
  'Ten of Cups': 10,
  'Page of Cups': 1,
  'Knight of Cups': 2,
  'Queen of Cups': 3,
  'King of Cups': 4,
  // Pentacles (Earth)
  'Ace of Pentacles': 1,
  'Two of Pentacles': 2,
  'Three of Pentacles': 3,
  'Four of Pentacles': 4,
  'Five of Pentacles': 5,
  'Six of Pentacles': 6,
  'Seven of Pentacles': 7,
  'Eight of Pentacles': 8,
  'Nine of Pentacles': 9,
  'Ten of Pentacles': 10,
  'Page of Pentacles': 1,
  'Knight of Pentacles': 2,
  'Queen of Pentacles': 3,
  'King of Pentacles': 4,
  // Swords (Air)
  'Ace of Swords': 1,
  'Two of Swords': 2,
  'Three of Swords': 3,
  'Four of Swords': 4,
  'Five of Swords': 5,
  'Six of Swords': 6,
  'Seven of Swords': 7,
  'Eight of Swords': 8,
  'Nine of Swords': 9,
  'Ten of Swords': 10,
  'Page of Swords': 1,
  'Knight of Swords': 2,
  'Queen of Swords': 3,
  'King of Swords': 4,
};
/**
 * Maps major arcana cards to their ruling planets
 */
exports.majorArcanaPlanetMap = {
  'The Magician': 'Mercury',
  'The High Priestess': 'Moon',
  'The Empress': 'Venus',
  'The Emperor': 'Mars',
  'The Hierophant': 'Jupiter',
  'The Lovers': 'Venus',
  'The Chariot': 'Moon',
  Strength: 'Sun',
  'The Hermit': 'Saturn',
  'Wheel of Fortune': 'Jupiter',
  Justice: 'Venus',
  'The Hanged Man': 'Neptune',
  Death: 'Pluto',
  Temperance: 'Jupiter',
  'The Devil': 'Saturn',
  'The Tower': 'Mars',
  'The Star': 'Uranus',
  'The moon': 'Moon',
  'The Sun': 'Sun',
  Judgement: 'Pluto',
  'The World': 'Saturn',
};
/**
 * Maps each planet to a corresponding alchemical property
 */
exports.planetaryAlchemicalMap = {
  Sun: 'Spirit',
  Moon: 'Essence',
  Mercury: 'Substance',
  Venus: 'Essence',
  Mars: 'Spirit',
  Jupiter: 'Substance',
  Saturn: 'Matter',
  Neptune: 'Essence',
  Uranus: 'Substance',
  Pluto: 'Matter',
};
/**
 * Gets the elemental character associated with a planet
 * @param planet Ruling planet
 * @returns The associated elemental character
 */
const getPlanetaryElement = planet => {
  return exports.planetaryElementMap[planet];
};
exports.getPlanetaryElement = getPlanetaryElement;
/**
 * Gets the alchemical property associated with a planet
 * @param planet Ruling planet
 * @returns The associated alchemical property
 */
const getPlanetaryAlchemicalProperty = planet => {
  return exports.planetaryAlchemicalMap[planet];
};
exports.getPlanetaryAlchemicalProperty = getPlanetaryAlchemicalProperty;
/**
 * Gets the elemental character from a tarot card name
 * @param cardName Tarot card name
 * @returns The associated elemental character or null if not found
 */
const getTarotCardElement = cardName => {
  // Check if it's a minor arcana card
  for (const [suit, element] of Object.entries(exports.tarotSuitElementMap)) {
    if (cardName.includes(suit)) {
      return element;
    }
  }
  // For major arcana, use the planetary association if available
  const planet = exports.majorArcanaPlanetMap[cardName];
  if (planet) {
    return exports.planetaryElementMap[planet];
  }
  return null;
};
exports.getTarotCardElement = getTarotCardElement;
/**
 * Gets the quantum value for a tarot card (minor arcana only)
 * @param cardName Tarot card name
 * @returns The quantum value or 0 if not found
 */
const getTarotCardQuantum = cardName => {
  return exports.tarotCardQuantumValues[cardName] || 0;
};
exports.getTarotCardQuantum = getTarotCardQuantum;
/**
 * Gets the ruling planet for a major arcana card
 * @param cardName Major arcana card name
 * @returns The ruling planet or null if not found
 */
const getTarotCardPlanet = cardName => {
  return exports.majorArcanaPlanetMap[cardName] || null;
};
exports.getTarotCardPlanet = getTarotCardPlanet;
