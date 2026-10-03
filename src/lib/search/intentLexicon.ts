/**
 * The words the omnibar reads as intent rather than as a name (plan §3,
 * Phase 5). Every entry names what it filters and on what basis; nothing
 * here scores or ranks.
 *
 * Words are matched after the search core's normalization (folded, then
 * stemmed), so "Desserts", "dessert" and "DESSERT" are one word.
 */
import type { Season } from "@/constants/seasons";

export type DietIntent = "vegan" | "vegetarian";
/** Allergen claims the catalog cannot verify (the classifier never derives them). */
export type UnverifiableDiet = "gluten-free" | "dairy-free" | "nut-free";
export type MealIntent = "breakfast" | "lunch" | "dinner" | "dessert";
export type QualityIntent = "warming" | "cooling";

/** Preferences the canonical classifier derives from ingredients. */
export const DIET_PHRASES: ReadonlyArray<{ phrase: string; diet: DietIntent }> = [
  { phrase: "vegan", diet: "vegan" },
  { phrase: "plant based", diet: "vegan" },
  { phrase: "vegetarian", diet: "vegetarian" },
];

export const UNVERIFIABLE_PHRASES: ReadonlyArray<{ phrase: string; diet: UnverifiableDiet }> = [
  { phrase: "gluten free", diet: "gluten-free" },
  { phrase: "dairy free", diet: "dairy-free" },
  { phrase: "nut free", diet: "nut-free" },
];

/**
 * The static catalog files every dish under breakfast, lunch, dinner or
 * dessert; that section is the meal type. "Supper" is the evening meal.
 */
export const MEAL_PHRASES: ReadonlyArray<{ phrase: string; meal: MealIntent }> = [
  { phrase: "breakfast", meal: "breakfast" },
  { phrase: "lunch", meal: "lunch" },
  { phrase: "dinner", meal: "dinner" },
  { phrase: "supper", meal: "dinner" },
  { phrase: "dessert", meal: "dessert" },
];

/** A named rule, shown on the chip: "quick" is 30 minutes or less, prep plus cook. */
export const QUICK_MINUTES = 30;
export const QUICK_PHRASES: readonly string[] = ["quick", "quick and easy"];
/** Units a stated time can use; "30 min", "30 minute", "2 hours". */
export const MINUTE_WORDS: readonly string[] = ["min", "mins", "minute", "minutes"];
export const HOUR_WORDS: readonly string[] = ["hour", "hours", "hr", "hrs"];
/** Words that only introduce a time: "under 30 min", "in 20 minutes". */
export const TIME_LEADS: readonly string[] = ["under", "less than", "within", "in", "max", "at most"];

/** `now` = the season on the server's date, else a named season. */
export const SEASON_PHRASES: ReadonlyArray<{ phrase: string; season: Season | "now" }> = [
  { phrase: "in season", season: "now" },
  { phrase: "seasonal", season: "now" },
  { phrase: "spring", season: "spring" },
  { phrase: "summer", season: "summer" },
  { phrase: "autumn", season: "autumn" },
  { phrase: "fall", season: "autumn" },
  { phrase: "winter", season: "winter" },
];

/** A card's `astrologicalProfile.rulingPlanets` (1,002 of 1,002 cards carry one). */
export const PLANETS: readonly string[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

/**
 * The catalog's thermal tags. [MEASURED 2026-09-25] "warming" 52 and "warm"
 * 56 cards, "cooling" 25; a tag matches by stem, so "warm" counts as warming.
 * Only these two words: "warm salad" is a dish, not a request for warming cards.
 */
export const QUALITY_PHRASES: ReadonlyArray<{ phrase: string; quality: QualityIntent; stem: string }> = [
  { phrase: "warming", quality: "warming", stem: "warm" },
  { phrase: "cooling", quality: "cooling", stem: "cool" },
];

/**
 * Plural nouns for the catalog's own categories. They narrow an ingredient
 * list only beside another ingredient intent ("mercury herbs", "warming
 * spices"); alone, "herbs" stays an ordinary search.
 */
export const CATEGORY_PHRASES: ReadonlyArray<{ phrase: string; label: string; categories: readonly string[] }> = [
  { phrase: "herbs", label: "Herbs", categories: ["culinary_herb", "medicinal herb"] },
  { phrase: "spices", label: "Spices", categories: ["spice"] },
  { phrase: "vegetables", label: "Vegetables", categories: ["vegetable"] },
  { phrase: "veggies", label: "Vegetables", categories: ["vegetable"] },
  { phrase: "fruits", label: "Fruits", categories: ["fruit"] },
  { phrase: "grains", label: "Grains", categories: ["grain"] },
  { phrase: "oils", label: "Oils", categories: ["oil"] },
  { phrase: "vinegars", label: "Vinegars", categories: ["vinegar", "vinegars"] },
  { phrase: "sweeteners", label: "Sweeteners", categories: ["sweetener"] },
  { phrase: "nuts", label: "Nuts and seeds", categories: ["nut_seed"] },
  { phrase: "seeds", label: "Nuts and seeds", categories: ["nut_seed"] },
  { phrase: "proteins", label: "Proteins", categories: ["protein", "meats"] },
  { phrase: "seasonings", label: "Seasonings", categories: ["seasoning"] },
  { phrase: "drinks", label: "Drinks", categories: ["beverage"] },
];

/** Filler that carries no meaning once an intent is found: "quick vegan recipes". */
export const FILLER_WORDS: readonly string[] = ["recipe", "recipes", "meal", "meals", "dish", "dishes", "idea", "ideas", "food", "foods"];

/** Joins between named ingredients: "spinach and feta", "eggs with chives". */
export const CONNECTOR_WORDS: readonly string[] = ["and", "with", "plus"];

/**
 * Regional names → the cuisine page that covers them (golden query
 * `oaxacan`). A suggestion only: the words still search as typed. Basis:
 * each region lies in that cuisine's country or region.
 */
export const REGIONAL_CUISINES: ReadonlyArray<{ phrase: string; cuisine: string; basis: string }> = [
  { phrase: "oaxacan", cuisine: "Mexican", basis: "Oaxaca is a state of Mexico" },
  { phrase: "yucatecan", cuisine: "Mexican", basis: "Yucatán is a state of Mexico" },
  { phrase: "tuscan", cuisine: "Italian", basis: "Tuscany is a region of Italy" },
  { phrase: "sicilian", cuisine: "Italian", basis: "Sicily is a region of Italy" },
  { phrase: "neapolitan", cuisine: "Italian", basis: "Naples is a city in Italy" },
  { phrase: "venetian", cuisine: "Italian", basis: "Venice is a city in Italy" },
  { phrase: "sichuan", cuisine: "Chinese", basis: "Sichuan is a province of China" },
  { phrase: "szechuan", cuisine: "Chinese", basis: "Sichuan is a province of China" },
  { phrase: "cantonese", cuisine: "Chinese", basis: "Cantonese cooking comes from Guangdong, a province of China" },
  { phrase: "hunan", cuisine: "Chinese", basis: "Hunan is a province of China" },
  { phrase: "punjabi", cuisine: "Indian", basis: "Punjab is a state of India" },
  { phrase: "bengali", cuisine: "Indian", basis: "Bengal is a region of India" },
  { phrase: "goan", cuisine: "Indian", basis: "Goa is a state of India" },
  { phrase: "keralan", cuisine: "Indian", basis: "Kerala is a state of India" },
  { phrase: "provencal", cuisine: "French", basis: "Provence is a region of France" },
  { phrase: "parisian", cuisine: "French", basis: "Paris is the capital of France" },
  { phrase: "alsatian", cuisine: "French", basis: "Alsace is a region of France" },
  { phrase: "okinawan", cuisine: "Japanese", basis: "Okinawa is a prefecture of Japan" },
  { phrase: "cretan", cuisine: "Greek", basis: "Crete is an island of Greece" },
  { phrase: "cajun", cuisine: "American", basis: "Cajun cooking comes from Louisiana" },
  { phrase: "ethiopian", cuisine: "African", basis: "Ethiopia is a country in Africa" },
  { phrase: "moroccan", cuisine: "African", basis: "Morocco is a country in Africa" },
  { phrase: "nigerian", cuisine: "African", basis: "Nigeria is a country in Africa" },
  { phrase: "senegalese", cuisine: "African", basis: "Senegal is a country in Africa" },
  { phrase: "lebanese", cuisine: "MiddleEastern", basis: "Lebanon is in the Middle East" },
  { phrase: "persian", cuisine: "MiddleEastern", basis: "Persia (Iran) is in the Middle East" },
];
