// Type constants for the application
export const ELEMENT_TYPES = ["Fire", "Water", "Earth", "Air"] as const;
export type ElementType = (typeof ELEMENT_TYPES)[number];

export const ALCHEMICAL_PROPERTIES = [
  "Spirit",
  "Essence",
  "Matter",
  "Substance",
] as const;
export type AlchemicalProperty = (typeof ALCHEMICAL_PROPERTIES)[number];

export const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;
export type ZodiacSignType = (typeof ZODIAC_SIGNS)[number];

export const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;
export type Planet = (typeof PLANETS)[number];

export const COOKING_METHODS = [
  "baking",
  "grilling",
  "sautéing",
  "steaming",
  "roasting",
  "boiling",
  "frying",
  "braising",
  "stewing",
  "raw",
] as const;
export type CookingMethod = (typeof COOKING_METHODS)[number];

export const CUISINE_TYPES = [
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "Indian",
  "Thai",
  "French",
  "American",
  "Middle-Eastern",
  "Japanese",
] as const;
export type CuisineType = (typeof CUISINE_TYPES)[number];

export const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Low-Fat",
] as const;
export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number];

export const LUNAR_PHASES = [
  "new moon",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full moon",
  "waning gibbous",
  "last quarter",
  "waning crescent",
] as const;
export type LunarPhase = (typeof LUNAR_PHASES)[number];

export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
export type Season = (typeof SEASONS)[number];

// Validation helpers
export function isElementType(value: string): value is ElementType {
  return ELEMENT_TYPES.some((item) => item === value);
}

export function isAlchemicalProperty(
  value: string,
): value is AlchemicalProperty {
  return ALCHEMICAL_PROPERTIES.some((item) => item === value);
}

export function isZodiacSignType(value: string): value is ZodiacSignType {
  return ZODIAC_SIGNS.some((item) => item === value);
}

export function isPlanet(value: string): value is Planet {
  return PLANETS.some((item) => item === value);
}

export function isCookingMethod(value: string): value is CookingMethod {
  return COOKING_METHODS.some((item) => item === value);
}

export function isCuisineType(value: string): value is CuisineType {
  return CUISINE_TYPES.some((item) => item === value);
}

export function isDietaryRestriction(
  value: string,
): value is DietaryRestriction {
  return DIETARY_RESTRICTIONS.some((item) => item === value);
}

export function isLunarPhase(value: string): value is LunarPhase {
  return LUNAR_PHASES.some((item) => item === value);
}

export function isSeason(value: string): value is Season {
  return SEASONS.some((item) => item === value);
}

export const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
  "beverage"
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const SPICE_LEVELS = [
  "none",
  "mild",
  "medium",
  "hot",
  "very_hot"
] as const;
export type SpiceLevel = (typeof SPICE_LEVELS)[number];

export function isMealType(value: string): value is MealType {
  return MEAL_TYPES.some((item) => item === value);
}

export function isSpiceLevel(value: string): value is SpiceLevel {
  return SPICE_LEVELS.some((item) => item === value);
}
