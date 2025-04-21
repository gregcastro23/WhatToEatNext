/**
 * Utils for validating tarot values in alchemical calculations
 */

/**
 * Check if a tarot value is valid
 * @param tarotValue The tarot value to check
 * @returns True if valid, false otherwise
 */
export function isValidTarotValue(tarotValue: string | undefined | null): boolean {
  if (!tarotValue) return false;
  
  // Check if it's a proper tarot name
  return (
    // Major Arcana
    isMajorArcana(tarotValue) ||
    // Minor Arcana
    isMinorArcana(tarotValue)
  );
}

/**
 * Check if a string is a valid Major Arcana card
 * @param card The card name to check
 * @returns True if valid, false otherwise
 */
export function isMajorArcana(card: string): boolean {
  const majorArcanaCards = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The sun',
    'Judgement',
    'The World'
  ];
  
  return majorArcanaCards.includes(card);
}

/**
 * Check if a string is a valid Minor Arcana card
 * @param card The card name to check
 * @returns True if valid, false otherwise
 */
export function isMinorArcana(card: string): boolean {
  // Split the card name
  const parts = card.split(' of ');
  if (parts.length !== 2) return false;
  
  const [value, suit] = parts;
  
  // Check suit
  const validSuits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
  if (!validSuits.includes(suit)) return false;
  
  // Check value
  const validValues = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'];
  return validValues.includes(value);
}

/**
 * Validate tarot data in alchemical result
 * @param alchemicalResult The alchemical calculation result
 * @returns Object with validation status and missing values
 */
export function validateTarotData(alchemicalResult: unknown): {
  isValid: boolean;
  missingValues: string[];
} {
  const missingValues: string[] = [];
  
  // Check Major Arcana
  if (!alchemicalResult['Major Arcana']) {
    missingValues.push('Major Arcana object');
  } else {
    if (!isValidTarotValue(alchemicalResult['Major Arcana']['sun'])) {
      missingValues.push('sun Major Arcana card');
    }
    if (!isValidTarotValue(alchemicalResult['Major Arcana']['Ascendant'])) {
      missingValues.push('Ascendant Major Arcana card');
    }
  }
  
  // Check Minor Arcana
  if (!alchemicalResult['Minor Arcana']) {
    missingValues.push('Minor Arcana object');
  } else {
    if (!isValidTarotValue(alchemicalResult['Minor Arcana']['Decan'])) {
      missingValues.push('Decan Minor Arcana card');
    }
  }
  
  return {
    isValid: missingValues.length === 0,
    missingValues
  };
}

/**
 * Provide fallback tarot values based on zodiac sign
 * @param zodiacSign The zodiac sign to use for fallback
 * @returns Default tarot values
 */
export function getFallbackTarotValues(zodiacSign: string): {
  majorArcana: Record<string, string>;
  minorArcana: Record<string, string>;
} {
  // Convert to lowercase for standardization
  const sign = zodiacSign.toLowerCase();
  
  // Default major arcana mapping
  const majorArcanaMap: Record<string, string> = {
    'aries': 'The Emperor',
    'taurus': 'The Hierophant',
    'gemini': 'The Lovers',
    'cancer': 'The Chariot',
    'leo': 'Strength',
    'virgo': 'The Hermit',
    'libra': 'Justice',
    'scorpio': 'Death',
    'sagittarius': 'Temperance',
    'capricorn': 'The Devil',
    'aquarius': 'The Star',
    'pisces': 'The Moon'
  };
  
  // Default minor arcana mapping (using first decan)
  const minorArcanaMap: Record<string, string> = {
    'aries': '2 of Wands',
    'taurus': '5 of Pentacles',
    'gemini': '8 of Swords',
    'cancer': '2 of Cups',
    'leo': '5 of Wands',
    'virgo': '8 of Pentacles',
    'libra': '2 of Swords',
    'scorpio': '5 of Cups',
    'sagittarius': '8 of Wands',
    'capricorn': '2 of Pentacles',
    'aquarius': '5 of Swords',
    'pisces': '8 of Cups'
  };
  
  return {
    majorArcana: {
      'sun': majorArcanaMap[sign] || 'The sun',
      'Ascendant': majorArcanaMap[sign] || 'The Star'
    },
    minorArcana: {
      'Decan': minorArcanaMap[sign] || '2 of Wands'
    }
  };
} 