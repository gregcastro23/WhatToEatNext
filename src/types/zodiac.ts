// Zodiac Signs
export type ZodiacSign = 
  | 'Aries' 
  | 'Taurus' 
  | 'Gemini' 
  | 'Cancer' 
  | 'Leo' 
  | 'Virgo' 
  | 'Libra' 
  | 'Scorpio' 
  | 'Sagittarius' 
  | 'Capricorn' 
  | 'Aquarius' 
  | 'Pisces';

// Elemental Properties
export type ElementalProperties = {
  Fire: number;
  Earth: number;
  Air: number;
  Water: number;
};

// Zodiac Date Ranges
export const zodiacDateRanges: Record<ZodiacSign, { startMonth: number; startDay: number; endMonth: number; endDay: number }> = {
  Aries: { startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  Taurus: { startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  Gemini: { startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  Cancer: { startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  Leo: { startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  Virgo: { startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  Libra: { startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  Scorpio: { startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  Sagittarius: { startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  Capricorn: { startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  Aquarius: { startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  Pisces: { startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 }
};

// Zodiac Elements
export const zodiacElements: Record<ZodiacSign, keyof ElementalProperties> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water'
};

// Helper Functions
export const getZodiacSign = (date: Date): ZodiacSign => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const [sign, range] of Object.entries(zodiacDateRanges)) {
    const { startMonth, startDay, endMonth, endDay } = range;
    
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return sign as ZodiacSign;
    }
  }

  // Default to Capricorn if no match (shouldn't happen with proper ranges)
  return 'Capricorn';
};

export const getElementalAffinity = (sign: ZodiacSign): keyof ElementalProperties => {
  return zodiacElements[sign];
};

// Elemental Compatibility
export const elementalCompatibility: Record<keyof ElementalProperties, {
  compatible: Array<keyof ElementalProperties>;
  neutral: Array<keyof ElementalProperties>;
  incompatible: Array<keyof ElementalProperties>;
}> = {
  Fire: {
    compatible: ['Air'],
    neutral: ['Fire'],
    incompatible: ['Water', 'Earth']
  },
  Earth: {
    compatible: ['Water'],
    neutral: ['Earth'],
    incompatible: ['Fire', 'Air']
  },
  Air: {
    compatible: ['Fire'],
    neutral: ['Air'],
    incompatible: ['Earth', 'Water']
  },
  Water: {
    compatible: ['Earth'],
    neutral: ['Water'],
    incompatible: ['Fire', 'Air']
  }
};

// Element Characteristics
export const elementalCharacteristics: Record<keyof ElementalProperties, {
  qualities: string[];
  keywords: string[];
  foods: string[];
}> = {
  Fire: {
    qualities: ['Warm', 'Dry', 'Active'],
    keywords: ['Energy', 'Passion', 'Transformation'],
    foods: ['Spicy', 'Grilled', 'Roasted']
  },
  Earth: {
    qualities: ['Cool', 'Dry', 'Stable'],
    keywords: ['Grounding', 'Practical', 'Material'],
    foods: ['Root vegetables', 'Grains', 'Hearty']
  },
  Air: {
    qualities: ['Warm', 'Moist', 'Mobile'],
    keywords: ['Intellectual', 'Communication', 'Social'],
    foods: ['Light', 'Raw', 'Fresh']
  },
  Water: {
    qualities: ['Cool', 'Moist', 'Flowing'],
    keywords: ['Emotional', 'Intuitive', 'Nurturing'],
    foods: ['Soups', 'Steamed', 'Hydrating']
  }
};

export type ElementalType = 'Fire' | 'Earth' | 'Air' | 'Water';

export interface ElementalAffinity {
  Fire: number;
  Earth: number;
  Air: number;
  Water: number;
}

export interface CelestialPosition {
  sign: ZodiacSign;
  degree: number;
  minutes: number;
}

export interface CelestialData {
  sun: CelestialPosition;
  moon: CelestialPosition;
  timestamp: number;
}