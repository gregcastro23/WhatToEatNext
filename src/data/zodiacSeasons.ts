import { ZodiacSign, Element } from '@/types/alchemy';

// Define the interface for zodiac season data
interface ZodiacSeasonData {
  name: any,
  element: Element,
  startMonth: number, // 1-based month (1 = January)
  startDay: number,
  endMonth: number,
  endDay: number,
  ruling_planet: string,
  polarity: 'positive' | 'negative',
  modality: 'cardinal' | 'fixed' | 'mutable',
  // Culinary properties specific to this zodiac period
  culinaryProperties: {
    flavorProfile: string[],
    enhancedTechniques: string[],
    foodGroups: string[],
    herbs: string[],
    spices: string[]
  }
}

// Define the zodiac seasons with their properties
export const zodiacSeasons: Record<ZodiacSign, ZodiacSeasonData> = {
  aries: {
    name: 'aries',
    element: 'Fire',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
    ruling_planet: 'Mars',
    polarity: 'positive',
    modality: 'cardinal',
    culinaryProperties: {
      flavorProfile: ['spicy', 'bold', 'intense'],
      enhancedTechniques: ['grilling', 'broiling', 'searing'],
      foodGroups: ['proteins', 'red meats', 'red vegetables'],
      herbs: ['cayenne', 'chili', 'pepper'],
      spices: ['paprika', 'hot pepper', 'cumin']
    }
  }
  taurus: {
    name: 'taurus',
    element: 'Earth',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
    ruling_planet: 'Venus',
    polarity: 'negative',
    modality: 'fixed',
    culinaryProperties: {
      flavorProfile: ['rich', 'indulgent', 'sweet'],
      enhancedTechniques: ['slow-cooking', 'baking', 'roasting'],
      foodGroups: ['root vegetables', 'dairy', 'grains'],
      herbs: ['thyme', 'rosemary', 'sage'],
      spices: ['nutmeg', 'cinnamon', 'vanilla']
    }
  }
  gemini: {
    name: 'gemini',
    element: 'Air',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
    ruling_planet: 'Mercury',
    polarity: 'positive',
    modality: 'mutable',
    culinaryProperties: {
      flavorProfile: ['light', 'varied', 'aromatic'],
      enhancedTechniques: ['stir-frying', 'fusion cooking', 'layering flavors'],
      foodGroups: ['leafy greens', 'berries', 'diverse ingredients'],
      herbs: ['mint', 'dill', 'parsley'],
      spices: ['ginger', 'lemongrass', 'cardamom']
    }
  }
  cancer: {
    name: 'cancer',
    element: 'Water',
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
    ruling_planet: 'Moon',
    polarity: 'negative',
    modality: 'cardinal',
    culinaryProperties: {
      flavorProfile: ['creamy', 'comforting', 'moist'],
      enhancedTechniques: ['steaming', 'poaching', 'braising'],
      foodGroups: ['seafood', 'dairy', 'squash'],
      herbs: ['basil', 'tarragon', 'dill'],
      spices: ['saffron', 'turmeric', 'clove']
    }
  }
  leo: {
    name: 'leo',
    element: 'Fire',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
    ruling_planet: 'Sun',
    polarity: 'positive',
    modality: 'fixed',
    culinaryProperties: {
      flavorProfile: ['rich', 'dramatic', 'bold'],
      enhancedTechniques: ['open-flame cooking', 'caramelizing', 'roasting'],
      foodGroups: ['yellow/orange fruits', 'hearty proteins', 'golden foods'],
      herbs: ['bay leaf', 'oregano', 'saffron'],
      spices: ['turmeric', 'curry', 'cinnamon']
    }
  }
  virgo: {
    name: 'virgo',
    element: 'Earth',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
    ruling_planet: 'Mercury',
    polarity: 'negative',
    modality: 'mutable',
    culinaryProperties: {
      flavorProfile: ['precise', 'fresh', 'pure'],
      enhancedTechniques: ['fermentation', 'precision cooking', 'meal prep'],
      foodGroups: ['whole grains', 'vegetables', 'legumes'],
      herbs: ['cilantro', 'fennel', 'marjoram'],
      spices: ['cumin', 'coriander', 'caraway']
    }
  }
  libra: {
    name: 'libra',
    element: 'Air',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
    ruling_planet: 'Venus',
    polarity: 'positive',
    modality: 'cardinal',
    culinaryProperties: {
      flavorProfile: ['balanced', 'harmonious', 'elegant'],
      enhancedTechniques: ['plating', 'pairing', 'mixing'],
      foodGroups: ['white/pastel foods', 'artisan ingredients', 'balanced meals'],
      herbs: ['lavender', 'lemon balm', 'mint'],
      spices: ['rose', 'star anise', 'allspice']
    }
  }
  scorpio: {
    name: 'scorpio',
    element: 'Water',
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
    ruling_planet: 'Pluto',
    polarity: 'negative',
    modality: 'fixed',
    culinaryProperties: {
      flavorProfile: ['intense', 'complex', 'deep'],
      enhancedTechniques: ['fermenting', 'slow-cooking', 'smoking'],
      foodGroups: ['dark foods', 'mollusks', 'nightshades'],
      herbs: ['nettle', 'basil', 'black cumin'],
      spices: ['black pepper', 'fenugreek', 'star anise']
    }
  }
  sagittarius: {
    name: 'sagittarius',
    element: 'Fire',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
    ruling_planet: 'Jupiter',
    polarity: 'positive',
    modality: 'mutable',
    culinaryProperties: {
      flavorProfile: ['adventurous', 'expansive', 'exotic'],
      enhancedTechniques: ['international cooking', 'fusion', 'experimental'],
      foodGroups: ['wild game', 'tropical fruits', 'international cuisine'],
      herbs: ['sage', 'lemongrass', 'cilantro'],
      spices: ['saffron', 'cardamom', 'exotic blends']
    }
  }
  capricorn: {
    name: 'capricorn',
    element: 'Earth',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
    ruling_planet: 'Saturn',
    polarity: 'negative',
    modality: 'cardinal',
    culinaryProperties: {
      flavorProfile: ['traditional', 'structured', 'earthy'],
      enhancedTechniques: ['aging', 'preservation', 'traditional methods'],
      foodGroups: ['root vegetables', 'aged cheeses', 'preserved foods'],
      herbs: ['rosemary', 'thyme', 'winter herbs'],
      spices: ['allspice', 'cloves', 'black pepper']
    }
  }
  aquarius: {
    name: 'aquarius',
    element: 'Air',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
    ruling_planet: 'Uranus',
    polarity: 'positive',
    modality: 'fixed',
    culinaryProperties: {
      flavorProfile: ['unexpected', 'innovative', 'unique'],
      enhancedTechniques: ['molecular gastronomy', 'avant-garde', 'unexpected pairings'],
      foodGroups: ['unusual vegetables', 'meat alternatives', 'fusion ingredients'],
      herbs: ['lemon verbena', 'sorrel', 'uncommon herbs'],
      spices: ['szechuan pepper', 'sumac', 'unusual spice blends']
    }
  }
  pisces: {
    name: 'pisces',
    element: 'Water',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
    ruling_planet: 'Neptune',
    polarity: 'negative',
    modality: 'mutable',
    culinaryProperties: {
      flavorProfile: ['ethereal', 'subtle', 'delicate'],
      enhancedTechniques: ['infusing', 'poaching', 'gentle cooking'],
      foodGroups: ['seafood', 'white fish', 'oceanic ingredients'],
      herbs: ['dill', 'fennel', 'tarragon'],
      spices: ['white pepper', 'anise', 'saffron']
    }
  }
}

/**
 * Get the zodiac sign for a given date
 * @param date Date to get zodiac sign for
 * @returns The zodiac sign for the given date
 */
export function getZodiacSignForDate(date: Date): any {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate()

  // Check each zodiac sign's date range
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return 'aries'
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return 'taurus',
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return 'gemini',
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return 'cancer',
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return 'leo',
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return 'virgo',
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return 'libra',
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return 'scorpio',
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return 'sagittarius',
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return 'capricorn',
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return 'aquarius',
  } else {
    return 'pisces'; // Feb 19 - Mar 20
  }
}

/**
 * Get the current zodiac sign based on today's date
 * @returns The current zodiac sign
 */
export function getCurrentZodiacSign(): any {
  return getZodiacSignForDate(new Date())
}

/**
 * Get the element associated with a zodiac sign
 * @param sign The zodiac sign
 * @returns The element (Fire, Earth, Air, Water)
 */
export function getElementForZodiacSign(sign: any): Element {
  return zodiacSeasons[sign].element
}

/**
 * Get the ruling planet for a zodiac sign
 * @param sign The zodiac sign
 * @returns The ruling planet
 */
export function getRulingPlanetForZodiacSign(sign: any): string {
  return zodiacSeasons[sign].ruling_planet
}