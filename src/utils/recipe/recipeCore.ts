import type { AstrologicalState, ZodiacSign } from '@/types/celestial';
import type {
  ElementalProperties,
  Recipe,
  RecipePlanetaryInfluences,
  RecipeSeason,
} from '@/types/recipe';
import type {
  PlanetaryDay,
  PlanetaryHour,
  Season,
  TimeFactors,
  TimeOfDay,
  WeekDay,
} from '@/types/time';

import { calculateDominantElement, calculateElementalProfile } from '../astrologyUtils';
import { isNonEmptyArray, toArray } from '../common/arrayUtils';
import { getElementalCompatibility } from '../elemental/elementCompatibility';
import { createLogger } from '../logger';
import {
  getRecipeAstrologicalInfluences,
  getRecipeCookingMethods,
  getRecipeElementalProperties,
  getRecipeMealTypes,
  getRecipeSeasons,
} from './recipeUtils';

const logger = createLogger('RecipeCore');

const ELEMENT_KEYS: Array<keyof ElementalProperties> = ['Fire', 'Water', 'Earth', 'Air'];
const WEEK_DAYS: WeekDay[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const DAY_RULERS: Record<WeekDay, PlanetaryDay['planet']> = {
  Sunday: 'Sun',
  Monday: 'Moon',
  Tuesday: 'Mars',
  Wednesday: 'Mercury',
  Thursday: 'Jupiter',
  Friday: 'Venus',
  Saturday: 'Saturn'
};
const HOURLY_SEQUENCE: PlanetaryHour['planet'][] = [
  'Saturn',
  'Jupiter',
  'Mars',
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
];

export interface RecommendationScore {
  recipe: Recipe,
  score: number,
  reasons: string[];
}

export interface RecommendationExplanation {
  recipe: Recipe,
  explanation: string;
}

export interface RecipeMatchContext
  extends Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'> {
  timeOfDay: TimeOfDay | string,
  season: Season | string,
  currentSeason?: RecipeSeason | string;
}

export function isAppropriateForTimeOfDay(recipe: Recipe, timeOfDay: TimeOfDay | string): boolean {
  const normalized = String(timeOfDay).toLowerCase();
  const meals = getRecipeMealTypes(recipe).map(type => type.toLowerCase());

  if (meals.length === 0) {
    return true;
  }

  if (normalized === 'night' || normalized === 'evening') {
    return meals.some(type => ['dinner', 'supper', 'evening', 'all'].includes(type));
  }

  if (normalized === 'morning') {
    return meals.some(type => ['breakfast', 'brunch', 'all'].includes(type));
  }

  if (normalized === 'afternoon') {
    return meals.some(type => ['lunch', 'brunch', 'all'].includes(type));
  }

  return true;
}

export function calculateElementalMatch(
  recipeElements: Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'>,
  targetElements: Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'>,
): number {
  let total = 0;
  let count = 0;

  ELEMENT_KEYS.forEach(element => {
    const recipeValue = recipeElements[element];
    const targetValue = targetElements[element];

    if (typeof recipeValue === 'number' && typeof targetValue === 'number') {
      total += 1 - Math.abs(recipeValue - targetValue);
      count += 1;
    }
  });

  return count > 0 ? total / count : 0.6;
}

export function calculateRecipeMatchScore(recipe: Recipe, context: RecipeMatchContext): number {
  const recipeElements = extractElementalSnapshot(getRecipeElementalProperties(recipe));

  if (!isAppropriateForTimeOfDay(recipe, context.timeOfDay)) {
    return 0;
  }

  const targetElements = extractContextElements(context);
  const baseScore = calculateElementalMatch(recipeElements, targetElements);
  let score = baseScore * 100;

  const seasonName = normalizeSeasonName(context.currentSeason ?? context.season);
  const recipeSeasons = getRecipeSeasons(recipe)
    .map(normalizeSeasonName)
    .filter(value => value.length > 0);

  if (seasonName && recipeSeasons.includes(seasonName)) {
    score += 10;
  } else if (recipeSeasons.includes('all')) {
    score += 2;
  }

  const timeOfDay = String(context.timeOfDay).toLowerCase();
  const meals = getRecipeMealTypes(recipe).map(type => type.toLowerCase());

  if (timeOfDay === 'morning' && meals.includes('breakfast')) {
    score += 15;
  } else if (timeOfDay === 'afternoon' && meals.includes('lunch')) {
    score += 15;
  } else if (['evening', 'night'].includes(timeOfDay) && meals.includes('dinner')) {
    score += 15;
  }

  if (recipe.nutrition) {
    const { protein = 0, carbs = 0, fat = 0, calories = 0 } = recipe.nutrition;
    const totalMacros = protein + carbs + fat;

    if (totalMacros > 0) {
      const ratios = {
        protein: protein / totalMacros,
        carbs: carbs / totalMacros,
        fat: fat / totalMacros
      };
      const targets = { protein: 0.25, carbs: 0.55, fat: 0.2 };
      const deviation =
        Math.abs(ratios.protein - targets.protein) +
        Math.abs(ratios.carbs - targets.carbs) +
        Math.abs(ratios.fat - targets.fat);
      score += Math.max(0, 8 * (1 - deviation));
    }

    const calorieFits =
      (timeOfDay === 'morning' && calories >= 300 && calories <= 500) ||
      (timeOfDay === 'afternoon' && calories >= 400 && calories <= 700) ||
      (['evening', 'night'].includes(timeOfDay) && calories >= 400 && calories <= 800);

    if (calorieFits) {
      score += 5;
    }
  }

  const prepMinutes = extractPreparationMinutes(recipe);
  if (prepMinutes !== null) {
    if (prepMinutes <= 30) {
      score += 5;
    } else if (prepMinutes <= 45) {
      score += 1;
    }
  }

  const idealTime =
    typeof recipe.idealTimeOfDay === 'string' ? recipe.idealTimeOfDay.toLowerCase() : '';
  if (idealTime && idealTime === timeOfDay) {
    score += 7;
  }

  return Math.min(100, Math.max(60, Math.round(score)));
}

export function getMatchScoreClass(score: number): string {
  if (score >= 96)
    return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
  if (score >= 90)
    return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
  if (score >= 85) return 'bg-green-200 text-green-800 font-semibold';
  if (score >= 80) return 'bg-green-100 text-green-700 font-medium';
  if (score >= 75) return 'bg-yellow-200 text-yellow-800 font-medium';
  if (score >= 70) return 'bg-yellow-100 text-yellow-700';
  if (score >= 65) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

export function getMatchRating(score: number): { stars: string; tooltip: string } {
  if (score >= 95) return { stars: '★★★★★', tooltip: 'Perfect match — highly recommended' };
  if (score >= 85) return { stars: '★★★★☆', tooltip: 'Excellent match — great choice' };
  if (score >= 75) return { stars: '★★★☆☆', tooltip: 'Good match — worth trying' };
  if (score >= 65) return { stars: '★★☆☆☆', tooltip: 'Fair match — might work for you' };
  return { stars: '★☆☆☆☆', tooltip: 'Poor match — consider other options' };
}

export function getMatchRatingSummary(score: number): string {
  const rating = getMatchRating(score);
  return `${rating.stars} — ${rating.tooltip}`;
}

export function getRecommendedRecipes(
  recipes: Recipe[],
  astrologicalState: AstrologicalState,
  limit = 3,
): RecommendationExplanation[] {
  const timeFactors = buildTimeFactors();

  const scored = recipes
    .map(recipe => {
      try {
        const { score, reasons } = scoreRecipe(recipe, astrologicalState, timeFactors);
        return { recipe, score, reasons } satisfies RecommendationScore;
      } catch (error) {
        logger.error('Failed to score recipe', { recipeId: recipe.id, error });
        return {
          recipe,
          score: 0,
          reasons: ['Unable to compute compatibility']
        } satisfies RecommendationScore;
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(entry => ({
    recipe: entry.recipe,
    explanation: generateExplanation(entry)
  }));
}

export function describePlanetaryInfluences(
  influences: RecipePlanetaryInfluences | undefined,
): string {
  if (!influences) {
    return 'No planetary influences specified';
  }

  const segments: string[] = [];

  if (isNonEmptyArray(influences._favorable)) {
    segments.push(`Favorable: ${influences._favorable.join(', ')}`);
  }

  if (isNonEmptyArray(influences.unfavorable)) {
    segments.push(`Unfavorable: ${influences.unfavorable.join(', ')}`);
  }

  if (isNonEmptyArray(influences.neutral)) {
    segments.push(`Neutral: ${influences.neutral.join(', ')}`);
  }

  return segments.join(' | ') || 'No planetary influences specified'
}

export function highlightZodiacAlignment(recipe: Recipe, signs: ZodiacSign[]): string[] {
  if (!Array.isArray(recipe.zodiacInfluences) || recipe.zodiacInfluences.length === 0) {
    return [];
  }

  const influences = recipe.zodiacInfluences.map(sign => String(sign).toLowerCase());
  return signs.map(sign => String(sign).toLowerCase()).filter(sign => influences.includes(sign));
}

export function summarizeNutritionalBalance(recipe: Recipe): string {
  if (!recipe.nutrition) {
    return 'Nutrition data unavailable';
  }

  const { calories, protein, carbs, fat } = recipe.nutrition;
  const parts: string[] = [];

  if (typeof calories === 'number') parts.push(`${calories} kcal`);
  if (typeof protein === 'number') parts.push(`${protein}g protein`);
  if (typeof carbs === 'number') parts.push(`${carbs}g carbs`);
  if (typeof fat === 'number') parts.push(`${fat}g fat`);

  return parts.join(' · ') || 'Nutrition data unavailable';
}

export function getRecipeDominantElement(
  properties: Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'>,
): keyof ElementalProperties {
  return (Object.entries(properties) as Array<[keyof ElementalProperties, number]>).reduce(
    (current, [element, value]) => (value > current.value ? { element, value } : current),
    { element: 'Fire' as keyof ElementalProperties, value: 0 },
  ).element;
}

export function describeElementalPresence(
  properties: Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'>,
): string {
  return ELEMENT_KEYS.map(element => `${element}: ${(properties[element] * 100).toFixed(0)}%`).join(
    ' · ',
  );
}

function scoreRecipe(
  recipe: Recipe,
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors,
): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  const mealTypes = getRecipeMealTypes(recipe).map(type => type.toLowerCase());
  const timeOfDay = String(timeFactors.timeOfDay).toLowerCase();

  if (mealTypes.length > 0) {
    if (timeOfDay === 'morning' && mealTypes.some(type => type.includes('breakfast'))) {
      score += 15;
      reasons.push('Perfect for morning meals');
    } else if (timeOfDay === 'afternoon' && mealTypes.some(type => type.includes('lunch'))) {
      score += 15;
      reasons.push('Ideal for lunch time');
    } else if (
      ['evening', 'night'].includes(timeOfDay) &&
      mealTypes.some(type => type.includes('dinner'))
    ) {
      score += 15;
      reasons.push('Great dinner option');
    }
  }

  const currentSeason = normalizeSeasonName(timeFactors.season);
  const recipeSeasons = getRecipeSeasons(recipe)
    .map(normalizeSeasonName)
    .filter(value => value.length > 0);
  if (currentSeason && recipeSeasons.includes(currentSeason)) {
    score += 15;
    reasons.push(`Perfect for ${currentSeason}`);
  }

  const recipeElements = extractElementalSnapshot(getRecipeElementalProperties(recipe));
  const elementalProfile = calculateElementalProfile(astrologicalState, timeFactors);
  const matchScore = calculateElementalMatch(
    recipeElements,
    extractElementalSnapshot(elementalProfile),
  );
  score += matchScore * 40;

  if (matchScore > 0.7) {
    reasons.push('Exceptional elemental compatibility with current influences');
  } else if (matchScore > 0.5) {
    reasons.push('Good elemental compatibility with current influences');
  }

  const dominantElement = astrologicalState.dominantElement;
  if (dominantElement) {
    const presence = recipeElements[dominantElement] ?? 0;
    if (presence > 0.4) {
      const points = Math.floor(presence * 20);
      score += points;
      reasons.push(`Strong in ${dominantElement} energy (${points} points)`);
    }
  }

  const currentDominant = calculateDominantElement(astrologicalState, timeFactors);
  const recipeDominant = getRecipeDominantElement(recipeElements);
  const compatibilityScore = getElementalCompatibility(recipeDominant, currentDominant);
  score += Math.floor(compatibilityScore * 15);

  if (compatibilityScore > 0.7) {
    reasons.push(
      `Excellent elemental harmony between recipe (${recipeDominant}) and current influences (${currentDominant})`,
    );
  }

  const planetaryDayInfluence = calculatePlanetaryDayInfluence(
    recipe,
    timeFactors.planetaryDay,
    recipeElements,
  );
  score += planetaryDayInfluence.score * 20;
  if (planetaryDayInfluence.reason) {
    reasons.push(planetaryDayInfluence.reason);
  }

  const isDaytime = isDaytimeNow(timeFactors.currentDate);
  const planetaryHourInfluence = calculatePlanetaryHourInfluence(
    recipe,
    timeFactors.planetaryHour,
    isDaytime,
  );
  score += planetaryHourInfluence.score * 10;
  if (planetaryHourInfluence.reason) {
    reasons.push(planetaryHourInfluence.reason);
  }

  const recipeInfluences = getRecipeAstrologicalInfluences(recipe).map(sign => sign.toLowerCase());
  const sunSign = String(
    astrologicalState.sunSign ?? astrologicalState.zodiacSign ?? '',
  ).toLowerCase();
  if (sunSign && recipeInfluences.includes(sunSign)) {
    score += 12;
    reasons.push(`Aligned with your Sun sign (${sunSign})`);
  }

  const moonSign = String(astrologicalState.moonSign ?? '').toLowerCase();
  if (moonSign && recipeInfluences.includes(moonSign)) {
    score += 10;
    reasons.push(`Harmonizes with your Moon sign (${moonSign})`);
  }

  const prepMinutes = extractPreparationMinutes(recipe);
  if (prepMinutes !== null) {
    const minutesRemaining = 60 - timeFactors.currentDate.getMinutes();
    if (prepMinutes > 0 && prepMinutes <= minutesRemaining) {
      score += 5;
      reasons.push('Can be prepared within this planetary hour');
    } else if (prepMinutes > 120) {
      score -= 5;
      reasons.push('Lengthy preparation time');
    }
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

function generateExplanation({ recipe, score, reasons }: RecommendationScore): string {
  let explanation: string;

  if (score >= 90) {
    explanation = `${recipe.name} is a perfect choice right now.`;
  } else if (score >= 75) {
    explanation = `${recipe.name} is highly recommended at this time.`;
  } else if (score >= 60) {
    explanation = `${recipe.name} would be a good option now.`;
  } else {
    explanation = `${recipe.name} is worth considering.`;
  }

  if (reasons.length > 0) {
    explanation += ` ${reasons.slice(0, 3).join('. ')}.`;
  }

  if (recipe.description) {
    explanation += ` ${recipe.description}`;
  }

  return explanation.trim();
}

function calculatePlanetaryDayInfluence(
  recipe: Recipe,
  planetaryDay: PlanetaryDay,
  recipeElements: Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'>,
): { score: number; reason?: string } {
  const associations: Record<
    PlanetaryDay['planet'],
    {
      styles: string[],
      ingredients: string[],
      flavor: string,
      elements: (keyof ElementalProperties)[];
    }
  > = {
    Sun: {
      styles: ['roasting', 'grilling', 'baking'],
      ingredients: ['citrus', 'sunflower', 'saffron', 'cinnamon', 'honey'],
      flavor: 'bright and vibrant',
      elements: ['Fire']
    },
    Moon: {
      styles: ['steaming', 'poaching', 'simmering'],
      ingredients: ['dairy', 'coconut', 'cucumber', 'mushroom', 'vanilla'],
      flavor: 'subtle and soothing',
      elements: ['Water']
    },
    Mars: {
      styles: ['frying', 'searing', 'spicy'],
      ingredients: ['peppers', 'garlic', 'onion', 'red meat', 'ginger'],
      flavor: 'bold and spicy',
      elements: ['Fire']
    },
    Mercury: {
      styles: ['stir-frying', 'quick cooking', 'diverse'],
      ingredients: ['seeds', 'nuts', 'herbs', 'leafy greens', 'berries'],
      flavor: 'complex and varied',
      elements: ['Air', 'Earth']
    },
    Jupiter: {
      styles: ['slow cooking', 'feasting', 'abundance'],
      ingredients: ['fruits', 'rich meats', 'wine', 'sage', 'nutmeg'],
      flavor: 'generous and expansive',
      elements: ['Air', 'Fire']
    },
    Venus: {
      styles: ['sweet', 'artistic', 'delicate'],
      ingredients: ['berries', 'flowers', 'chocolate', 'honey', 'butter'],
      flavor: 'sweet and pleasing',
      elements: ['Water', 'Earth']
    },
    Saturn: {
      styles: ['traditional', 'preserved', 'aged'],
      ingredients: ['root vegetables', 'beans', 'aged cheese', 'dried fruits'],
      flavor: 'structured and grounding',
      elements: ['Air', 'Earth']
    },
  };

  const association = associations[planetaryDay.planet];
  if (!association) {
    return { score: 0.5 };
  }

  const methods = getRecipeCookingMethods(recipe).map(method => method.toLowerCase());
  const styleMatch = methods.some(method =>
    association.styles.some(style => method.includes(style)),
  );

  const ingredientText = toArray(recipe.ingredients)
    .map(ingredient => {
      if (typeof ingredient === 'string') return ingredient.toLowerCase();
      if (typeof ingredient === 'object' && ingredient && 'name' in ingredient && ingredient.name) {
        return String(ingredient.name).toLowerCase();
      }
      return '';
    })
    .join(' ');

  const ingredientMatch = association.ingredients.some(ingredient =>
    ingredientText.includes(ingredient.toLowerCase()),
  );

  const elementMatch = association.elements.some(element => (recipeElements[element] ?? 0) > 0.3);

  let score = 0.5;
  if (styleMatch && ingredientMatch) {
    score = 0.9;
  } else if (styleMatch || ingredientMatch) {
    score = 0.7;
  }

  if (elementMatch) {
    score = Math.min(1, score + 0.1);
  }

  let reason: string | undefined;
  if (score >= 0.9) {
    reason = `Perfect for ${planetaryDay.planet}'s day with its ${association.flavor} qualities`;
  } else if (score >= 0.7) {
    reason = `Harmonizes well with ${planetaryDay.planet}'s energy`;
  }

  return { score, reason };
}

function calculatePlanetaryHourInfluence(
  recipe: Recipe,
  planetaryHour: PlanetaryHour,
  isDaytime: boolean,
): { score: number; reason?: string } {
  const hourlyAssociations: Record<
    PlanetaryHour['planet'],
    {
      daytime: string[],
      nighttime: string[],
      flavor: string;
    }
  > = {
    Sun: {
      daytime: ['energizing', 'warming', 'bright'],
      nighttime: ['comforting', 'golden', 'radiant'],
      flavor: 'invigorating'
    },
    Moon: {
      daytime: ['cooling', 'refreshing', 'hydrating'],
      nighttime: ['soothing', 'calming', 'comforting'],
      flavor: 'nurturing'
    },
    Mars: {
      daytime: ['stimulating', 'spicy', 'lively'],
      nighttime: ['warming', 'passionate', 'deep'],
      flavor: 'energetic'
    },
    Mercury: {
      daytime: ['light', 'varied', 'clever'],
      nighttime: ['thoughtful', 'diverse', 'balanced'],
      flavor: 'stimulating'
    },
    Jupiter: {
      daytime: ['abundant', 'expansive', 'celebratory'],
      nighttime: ['rich', 'festive', 'indulgent'],
      flavor: 'abundant'
    },
    Venus: {
      daytime: ['beautiful', 'harmonious', 'balanced'],
      nighttime: ['sensual', 'sweet', 'indulgent'],
      flavor: 'pleasing'
    },
    Saturn: {
      daytime: ['structured', 'traditional', 'disciplined'],
      nighttime: ['grounding', 'earthy', 'practical'],
      flavor: 'satisfying'
    },
  };

  const association = hourlyAssociations[planetaryHour.planet];
  if (!association) {
    return { score: 0.5 };
  }

  const qualities = isDaytime ? association.daytime : association.nighttime;
  const text = JSON.stringify(recipe).toLowerCase();
  const matchCount = qualities.reduce(
    (count, quality) => (text.includes(quality.toLowerCase()) ? count + 1 : count),
    0,
  );

  let score = 0.5;
  if (matchCount >= 2) {
    score = 0.8;
  } else if (matchCount === 1) {
    score = 0.65;
  }

  let reason: string | undefined;
  if (score >= 0.8) {
    reason = `Excellent choice for the current ${planetaryHour.planet} hour with its ${association.flavor} qualities`;
  } else if (score >= 0.65) {
    reason = `Complements the ${planetaryHour.planet} hour energy`;
  }

  return { score, reason };
}

function buildTimeFactors(date: Date = new Date()): TimeFactors {
  const month = date.getMonth();
  const hour = date.getHours();
  const dayIndex = date.getDay();

  const season: Season =
    month >= 2 && month <= 4
      ? 'Spring'
      : month >= 5 && month <= 7
        ? 'Summer'
        : month >= 8 && month <= 10
          ? 'Fall'
          : 'Winter';

  const timeOfDay: TimeOfDay =
    hour >= 5 && hour < 12
      ? 'Morning'
      : hour >= 12 && hour < 17
        ? 'Afternoon'
        : hour >= 17 && hour < 22
          ? 'Evening'
          : 'Night';

  const weekDay = WEEK_DAYS[dayIndex];
  const planetaryDay: PlanetaryDay = {
    day: weekDay,
    planet: DAY_RULERS[weekDay]
  };

  const hoursSinceSunrise = hour >= 6 ? hour - 6 : hour + 18; // approximate sunrise at 6
  const startingIndex = HOURLY_SEQUENCE.indexOf(planetaryDay.planet);
  const planetIndex = (startingIndex + hoursSinceSunrise) % HOURLY_SEQUENCE.length;

  const planetaryHour: PlanetaryHour = {
    planet: HOURLY_SEQUENCE[planetIndex],
    hourOfDay: hour
  };

  return {
    currentDate: date,
    season,
    timeOfDay,
    planetaryDay,
    planetaryHour,
    weekDay,
  };
}

function extractElementalSnapshot(
  value: Partial<ElementalProperties> | undefined | null,
): Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'> {
  return {
    Fire: typeof value?.Fire === 'number' ? value.Fire : 0,
    Water: typeof value?.Water === 'number' ? value.Water : 0,
    Earth: typeof value?.Earth === 'number' ? value.Earth : 0,
    Air: typeof value?.Air === 'number' ? value.Air : 0
  };
}

function extractContextElements(
  context: RecipeMatchContext,
): Pick<ElementalProperties, 'Fire' | 'Water' | 'Earth' | 'Air'> {
  return {
    Fire: context.Fire,
    Water: context.Water,
    Earth: context.Earth,
    Air: context.Air
  };
}

function normalizeSeasonName(value: RecipeSeason | string | undefined | null): string {
  return String(value ?? '').toLowerCase();
}

function extractPreparationMinutes(recipe: Recipe): number | null {
  const raw = recipe.timeToMake ?? recipe.totalTime ?? recipe.cookTime;
  if (raw === undefined || raw === null) {
    return null;
  }

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }

  const match = String(raw).match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function isDaytimeNow(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}
