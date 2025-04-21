/**
 * Standardized constants and enums for the WhatToEatNext application
 * This file centralizes all enum definitions to ensure consistent casing and naming
 * throughout the codebase.
 */

/**
 * Standardized elements enum - capitalized first letter convention
 */
export enum Element {
  Fire = 'Fire',
  Water = 'Water',
  Earth = 'Earth',
  Air = 'Air'
}

/**
 * Map for converting between lowercase and standard Element format
 */
export const ELEMENT_MAP: Record<string, Element> = {
  'fire': Element.Fire,
  'water': Element.Water,
  'earth': Element.Earth,
  'air': Element.Air,
  // Also add capitalized versions for normalization
  'Fire': Element.Fire,
  'Water': Element.Water,
  'Earth': Element.Earth,
  'Air': Element.Air
};

/**
 * Standardized zodiac signs enum - always lowercase convention
 */
export enum ZodiacSign {
  Aries = 'aries',
  Taurus = 'taurus',
  Gemini = 'gemini',
  Cancer = 'cancer',
  Leo = 'leo',
  Virgo = 'virgo',
  Libra = 'libra',
  Scorpio = 'scorpio',
  Sagittarius = 'sagittarius',
  Capricorn = 'capricorn',
  Aquarius = 'aquarius',
  Pisces = 'pisces'
}

/**
 * Map for converting between any case and standard ZodiacSign format
 */
export const ZODIAC_MAP: Record<string, ZodiacSign> = {
  // Lowercase (standard)
  'aries': ZodiacSign.Aries,
  'taurus': ZodiacSign.Taurus,
  'gemini': ZodiacSign.Gemini,
  'cancer': ZodiacSign.Cancer,
  'leo': ZodiacSign.Leo,
  'virgo': ZodiacSign.Virgo,
  'libra': ZodiacSign.Libra,
  'scorpio': ZodiacSign.Scorpio,
  'sagittarius': ZodiacSign.Sagittarius,
  'capricorn': ZodiacSign.Capricorn,
  'aquarius': ZodiacSign.Aquarius,
  'pisces': ZodiacSign.Pisces,
  // Capitalized (for normalization)
  'Aries': ZodiacSign.Aries,
  'Taurus': ZodiacSign.Taurus,
  'Gemini': ZodiacSign.Gemini,
  'Cancer': ZodiacSign.Cancer,
  'Leo': ZodiacSign.Leo,
  'Virgo': ZodiacSign.Virgo,
  'Libra': ZodiacSign.Libra,
  'Scorpio': ZodiacSign.Scorpio,
  'Sagittarius': ZodiacSign.Sagittarius,
  'Capricorn': ZodiacSign.Capricorn,
  'Aquarius': ZodiacSign.Aquarius,
  'Pisces': ZodiacSign.Pisces
};

/**
 * Standardized planet names enum - always lowercase convention
 */
export enum PlanetName {
  sun = 'sun',
  Moon = 'moon',
  Mercury = 'mercury',
  Venus = 'venus',
  Mars = 'mars',
  Jupiter = 'jupiter',
  Saturn = 'saturn',
  Uranus = 'uranus',
  Neptune = 'neptune',
  Pluto = 'pluto'
}

/**
 * Map for converting between any case and standard PlanetName format
 */
export const PLANET_MAP: Record<string, PlanetName> = {
  // Lowercase (standard)
  'sun': PlanetName.sun,
  'moon': PlanetName.Moon,
  'mercury': PlanetName.Mercury,
  'venus': PlanetName.Venus,
  'mars': PlanetName.Mars,
  'jupiter': PlanetName.Jupiter,
  'saturn': PlanetName.Saturn,
  'uranus': PlanetName.Uranus,
  'neptune': PlanetName.Neptune,
  'pluto': PlanetName.Pluto,
  // Capitalized (for normalization)
  'sun': PlanetName.sun,
  'Moon': PlanetName.Moon,
  'Mercury': PlanetName.Mercury,
  'Venus': PlanetName.Venus,
  'Mars': PlanetName.Mars,
  'Jupiter': PlanetName.Jupiter,
  'Saturn': PlanetName.Saturn,
  'Uranus': PlanetName.Uranus,
  'Neptune': PlanetName.Neptune,
  'Pluto': PlanetName.Pluto
};

/**
 * Standardized season enum - always lowercase convention
 */
export enum Season {
  Spring = 'spring',
  Summer = 'summer',
  Fall = 'fall',
  Autumn = 'autumn', // Support both fall and autumn
  Winter = 'winter',
  All = 'all'
}

/**
 * Map for converting between any case and standard Season format
 */
export const SEASON_MAP: Record<string, Season> = {
  // Lowercase (standard)
  'spring': Season.Spring,
  'summer': Season.Summer,
  'fall': Season.Fall,
  'autumn': Season.Autumn,
  'winter': Season.Winter,
  'all': Season.All,
  // Capitalized (for normalization)
  'Spring': Season.Spring,
  'Summer': Season.Summer,
  'Fall': Season.Fall,
  'Autumn': Season.Autumn,
  'Winter': Season.Winter,
  'All': Season.All
};

/**
 * Standardized lunar phase enum - spaces in names convention
 */
export enum LunarPhase {
  NewMoon = 'new moon',
  WaxingCrescent = 'waxing crescent',
  FirstQuarter = 'first quarter',
  WaxingGibbous = 'waxing gibbous',
  FullMoon = 'full moon',
  WaningGibbous = 'waning gibbous',
  LastQuarter = 'last quarter',
  WaningCrescent = 'waning crescent'
}

/**
 * Map for converting between underscore format and standard LunarPhase format
 */
export const LUNAR_PHASE_MAP: Record<string, LunarPhase> = {
  // Spaces format (standard)
  'new moon': LunarPhase.NewMoon,
  'waxing crescent': LunarPhase.WaxingCrescent,
  'first quarter': LunarPhase.FirstQuarter,
  'waxing gibbous': LunarPhase.WaxingGibbous,
  'full moon': LunarPhase.FullMoon,
  'waning gibbous': LunarPhase.WaningGibbous,
  'last quarter': LunarPhase.LastQuarter,
  'waning crescent': LunarPhase.WaningCrescent,
  // Underscore format (for compatibility)
  'new_moon': LunarPhase.NewMoon,
  'waxing_crescent': LunarPhase.WaxingCrescent,
  'first_quarter': LunarPhase.FirstQuarter,
  'waxing_gibbous': LunarPhase.WaxingGibbous,
  'full_moon': LunarPhase.FullMoon,
  'waning_gibbous': LunarPhase.WaningGibbous,
  'last_quarter': LunarPhase.LastQuarter,
  'waning_crescent': LunarPhase.WaningCrescent
};

/**
 * Underscores to spaces format for lunar phases (for backward compatibility)
 */
export const LUNAR_PHASE_UNDERSCORE_TO_SPACES: Record<string, string> = {
  'new_moon': 'new moon',
  'waxing_crescent': 'waxing crescent',
  'first_quarter': 'first quarter',
  'waxing_gibbous': 'waxing gibbous',
  'full_moon': 'full moon',
  'waning_gibbous': 'waning gibbous',
  'last_quarter': 'last quarter',
  'waning_crescent': 'waning crescent'
};

/**
 * Spaces to underscores format for lunar phases (for backward compatibility)
 */
export const LUNAR_PHASE_SPACES_TO_UNDERSCORE: Record<string, string> = {
  'new moon': 'new_moon',
  'waxing crescent': 'waxing_crescent',
  'first quarter': 'first_quarter',
  'waxing gibbous': 'waxing_gibbous',
  'full moon': 'full_moon',
  'waning gibbous': 'waning_gibbous',
  'last quarter': 'last_quarter',
  'waning crescent': 'waning_crescent'
};

/**
 * Standardized cooking method enum
 */
export enum CookingMethod {
  Baking = 'baking',
  Boiling = 'boiling',
  Roasting = 'roasting',
  Steaming = 'steaming',
  Frying = 'frying',
  Grilling = 'grilling',
  Sauteing = 'sauteing',
  Poaching = 'poaching',
  Braising = 'braising',
  StirFrying = 'stir-frying',
  Fermenting = 'fermenting',
  Pickling = 'pickling',
  Curing = 'curing',
  Infusing = 'infusing',
  Distilling = 'distilling',
  Raw = 'raw',
  Fermentation = 'fermentation',
  Smoking = 'smoking',
  SousVide = 'sous_vide',
  PressureCooking = 'pressure_cooking',
  Spherification = 'spherification',
  CryoCooking = 'cryo_cooking',
  Emulsification = 'emulsification',
  Gelification = 'gelification',
  Broiling = 'broiling'
}

/**
 * Map for converting between any case and standard CookingMethod format
 */
export const COOKING_METHOD_MAP: Record<string, CookingMethod> = {
  'baking': CookingMethod.Baking,
  'boiling': CookingMethod.Boiling,
  'roasting': CookingMethod.Roasting,
  'steaming': CookingMethod.Steaming,
  'frying': CookingMethod.Frying,
  'grilling': CookingMethod.Grilling,
  'sauteing': CookingMethod.Sauteing,
  'poaching': CookingMethod.Poaching,
  'braising': CookingMethod.Braising,
  'stir-frying': CookingMethod.StirFrying,
  'fermenting': CookingMethod.Fermenting,
  'pickling': CookingMethod.Pickling,
  'curing': CookingMethod.Curing,
  'infusing': CookingMethod.Infusing,
  'distilling': CookingMethod.Distilling,
  'raw': CookingMethod.Raw,
  'fermentation': CookingMethod.Fermentation,
  'smoking': CookingMethod.Smoking,
  'sous_vide': CookingMethod.SousVide,
  'pressure_cooking': CookingMethod.PressureCooking,
  'spherification': CookingMethod.Spherification,
  'cryo_cooking': CookingMethod.CryoCooking,
  'emulsification': CookingMethod.Emulsification,
  'gelification': CookingMethod.Gelification,
  'broiling': CookingMethod.Broiling
}; 