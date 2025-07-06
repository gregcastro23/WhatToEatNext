import type { 
  Recipe, 
  Season, 
  ElementalProperties, 
  LunarPhase, 
  ZodiacSign, 
  LunarPhaseWithSpaces,
  AstrologicalProfile
} from '@/types/alchemy';
// import { SEASONAL_PROPERTIES } from '@/constants/seasons'; // Commented out as unused
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import { _elementalUtils } from './elementalUtils';
import { _validateElementalProperties, _normalizeElementalProperties } from '@/types/validators';

type Rating = 'optimal' | 'favorable' | 'neutral' | 'suboptimal';
type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

const SEASONAL_ELEMENTS: Record<Season, Record<Element, number>> = {
    spring: { Air: 0.3, Fire: 0.3, Water: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Air: 0.3, Earth: 0.1, Water: 0.2 },
    autumn: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    fall: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    winter: { Water: 0.4, Earth: 0.3, Fire: 0.1, Air: 0.2 },
    all: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
};

// Map seasons to zodiac signs
const seasonToZodiac: Record<Season, ZodiacSign[]> = {
    spring: ['aries', 'taurus', 'gemini'],
    summer: ['cancer', 'leo', 'virgo'],
    autumn: ['libra', 'scorpio', 'sagittarius'],
    fall: ['libra', 'scorpio', 'sagittarius'],
    winter: ['capricorn', 'aquarius', 'pisces'],
    all: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
};

const ZODIAC_ELEMENTS: Record<ZodiacSign, Element> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water'
};

// Map lunar phases to elemental influences
const LUNAR_PHASE_ELEMENTS: Record<LunarPhaseWithSpaces, Record<Element, number>> = {
  'new moon': { Air: 0.4, Fire: 0.3, Water: 0.2, Earth: 0.1 },
  'waxing crescent': { Fire: 0.3, Air: 0.3, Water: 0.2, Earth: 0.2 },
  'first quarter': { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
  'waxing gibbous': { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
  'full moon': { Fire: 0.4, Water: 0.4, Air: 0.1, Earth: 0.1 },
  'waning gibbous': { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
  'last quarter': { Water: 0.3, Earth: 0.3, Air: 0.2, Fire: 0.2 },
  'waning crescent': { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 }
};

// Map lunar phases to recommended foods
const LUNAR_FOOD_ASSOCIATIONS: Record<LunarPhaseWithSpaces, string[]> = {
  'new moon': ['seeds', 'sprouts', 'beginnings', 'light meals', 'detox'],
  'waxing crescent': ['greens', 'sprouts', 'fresh herbs', 'light proteins'],
  'first quarter': ['grains', 'nuts', 'hearty vegetables', 'proteins'],
  'waxing gibbous': ['proteins', 'complex meals', 'hearty dishes'],
  'full moon': ['celebration foods', 'rich meals', 'festive dishes'],
  'waning gibbous': ['fermented foods', 'rich broths', 'hearty stews'],
  'last quarter': ['root vegetables', 'soups', 'healing foods'],
  'waning crescent': ['cleansing foods', 'simple meals', 'light broths']
};

export interface SeasonalEffectiveness {
    rating: 'excellent' | 'good' | 'neutral' | 'poor';
    score: number;
    elementalBreakdown: ElementalProperties;
    breakdown: {
        elementalAlignment: number;
        ingredientSuitability: number;
        seasonalBonus: number;
        zodiacAlignment?: number;
        lunarPhaseAlignment?: number;
    };
}

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

// const SEASONAL_RATINGS = {}; // Commented out as unused

export const SEASONAL_MODIFIERS = {
    spring: {
        Air: 0.4,
        Water: 0.3,
        Earth: 0.2,
        Fire: 0.1
    },
    summer: {
        Fire: 0.4,
        Air: 0.3,
        Earth: 0.2,
        Water: 0.1
    },
    autumn: {
        Earth: 0.4,
        Fire: 0.3,
        Air: 0.2,
        Water: 0.1
    },
    winter: {
        Water: 0.4,
        Earth: 0.3,
        Fire: 0.2,
        Air: 0.1
    }
};

export const getSeasonalEffectiveness = (
    recipe: Recipe, 
    season: Season,
    currentZodiac?: ZodiacSign | null,
    currentLunarPhase?: LunarPhase | null
): SeasonalEffectiveness => {
    if (!recipe || !season) {
        return {
            rating: 'poor',
            score: 0,
            elementalBreakdown: DEFAULT_ELEMENTAL_PROPERTIES,
            breakdown: {
                elementalAlignment: 0,
                ingredientSuitability: 0,
                seasonalBonus: 0
            }
        };
    }

    const elementalAlignment = calculateRecipeSeasonalAlignment(recipe, season);
    const ingredientSuitability = calculateIngredientSuitability(recipe, season);
    const seasonalBonus = calculateSeasonalBonus(recipe, season);
    
    // Calculate zodiacal alignment if current zodiac is provided
    const zodiacAlignment = currentZodiac ? 
        calculateZodiacAlignment(recipe, currentZodiac) : 0;
    
    // Calculate lunar phase alignment if lunar phase is provided
    const lunarPhaseAlignment = currentLunarPhase ? 
        calculateLunarPhaseAlignment(recipe, currentLunarPhase) : 0;

    const totalScore = elementalAlignment + ingredientSuitability + 
                      seasonalBonus + zodiacAlignment + lunarPhaseAlignment;
    const elementalBreakdown = calculateElementalBreakdown(recipe, season);

    return {
        rating: getRating(totalScore),
        score: totalScore,
        elementalBreakdown,
        breakdown: {
            elementalAlignment,
            ingredientSuitability,
            seasonalBonus,
            zodiacAlignment,
            lunarPhaseAlignment
        }
    };
};

export const calculateRecipeSeasonalAlignment = (recipeElements, seasonalModifier) => {
    if (!recipeElements || !seasonalModifier) return 0;
    let alignmentScore = 0;
    
    Object.entries(recipeElements).forEach(([element, value]) => {
        const modifierValue = seasonalModifier[element as keyof ElementalProperties] || 0;
        const numericValue = typeof value === 'number' ? value : 0;
        alignmentScore += numericValue * modifierValue;
    });
    return Math.round(alignmentScore * 100);
};

const calculateIngredientSuitability = (recipe: Recipe, season: Season): number => {
    // Implementation based on test requirements in:
    // src/utils/__tests__/seasonalCalculations.test.ts lines 47-51
    
    // Check if any ingredients have explicit seasonality
    let suitabilityScore = 30; // Base score
    
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        let seasonalIngredientCount = 0;
        
        recipe.ingredients.forEach(ingredient => {
            if (ingredient.seasonality && 
                Array.isArray(ingredient.seasonality) && 
                ingredient.seasonality.includes(season)) {
                seasonalIngredientCount++;
            }
        });
        
        // Adjust score based on proportion of seasonal ingredients
        if (recipe.ingredients.length > 0) {
            const seasonalProportion = seasonalIngredientCount / recipe.ingredients.length;
            suitabilityScore += Math.round(seasonalProportion * 20); // Boost by up to 20 points
        }
    }
    
    return suitabilityScore;
};

const calculateSeasonalBonus = (recipe: Recipe, season: Season): number => {
    // Check if recipe has an explicit seasonal recommendation
    let bonus = 15; // Base bonus
    
    if (recipe.season) {
        const recipeSeasons = Array.isArray(recipe.season) ? 
            recipe.season : [recipe.season];
            
        if (recipeSeasons.some(s => s.toLowerCase() === season.toLowerCase())) {
            bonus += 15; // Additional bonus for explicitly seasonal recipes
        }
    }
    
    return bonus;
};

// New function to calculate zodiac alignment
const calculateZodiacAlignment = (recipe: Recipe, currentZodiac: ZodiacSign): number => {
    if (!recipe || !currentZodiac) return 0;
    
    let alignmentScore = 0;
    const zodiacElement = ZODIAC_ELEMENTS[currentZodiac];
    
    // Check if recipe's dominant element matches the zodiac element
    if (recipe.elementalProperties && zodiacElement) {
        const recipeElementValues = Object.entries(recipe.elementalProperties);
        recipeElementValues.sort((a, b) => b[1] - a[1]);
        const dominantElement = recipeElementValues[0]?.[0] as Element;
        
        if (dominantElement === zodiacElement) {
            alignmentScore += 15; // Bonus for matching element
        }
    }
    
    // Check if recipe has explicit zodiac influences
    if (recipe.zodiacInfluences && Array.isArray(recipe.zodiacInfluences)) {
        if (recipe.zodiacInfluences.includes(currentZodiac)) {
            alignmentScore += 10; // Bonus for explicit zodiac match
        }
    }
    
    return alignmentScore;
};

// New function to calculate lunar phase alignment
const calculateLunarPhaseAlignment = (recipe: Recipe, lunarPhase: LunarPhase): number => {
    if (!recipe || !lunarPhase) return 0;
    
    let alignmentScore = 0;
    
    // Check if recipe's elemental properties align with lunar phase elemental affinities
    if (recipe.elementalProperties && LUNAR_PHASE_ELEMENTS[lunarPhase]) {
        let phaseAlignmentScore = 0;
        
        Object.entries(recipe.elementalProperties).forEach(([element, value]) => {
            const lunarElementValue = LUNAR_PHASE_ELEMENTS[lunarPhase][element as Element] || 0;
            phaseAlignmentScore += (value || 0) * lunarElementValue;
        });
        
        alignmentScore += Math.round(phaseAlignmentScore * 10);
    }
    
    // Check for explicit lunar phase influence
    if (recipe.lunarPhaseInfluences && 
        Array.isArray(recipe.lunarPhaseInfluences)) {
        // Cast lunarPhase to LunarPhaseWithSpaces for type compatibility
        const lunarPhaseWithSpaces = lunarPhase as unknown as LunarPhaseWithSpaces;
        if (recipe.lunarPhaseInfluences.includes(lunarPhaseWithSpaces)) {
            alignmentScore += 25;
        }
    }
    
    return alignmentScore;
};

const getSeasonalModifier = (season: string, element: string): number => {
    const modifiers: Record<string, Record<string, number>> = {
        spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
        summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
        autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
        winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
    };

    return modifiers[season.toLowerCase()]?.[element] || 0.25;
};

const getRating = (score: number): SeasonalEffectiveness['rating'] => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'neutral';
    return 'poor';
};

const getDefaultElementalProps = (): ElementalProperties => ({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
});

// Interface definition for AstrologicalProperties used in this file
interface AstrologicalProperties {
    favorable: string[];
    unfavorable: string[];
    neutral: string[];
}

function getElementalBreakdown(season: Season): Record<Season, ElementalProperties> {
    const baseElements = getDefaultElementalProps();

    const seasonalModifiers: Record<Season, ElementalProperties> = {
        spring: { Fire: 0.3, Water: 0.3, Air: 0.25, Earth: 0.15 },
        summer: { Fire: 0.4, Water: 0.2, Air: 0.25, Earth: 0.15 },
        autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
        fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
        winter: { Fire: 0.15, Water: 0.35, Air: 0.15, Earth: 0.35 },
        all: { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 }
    };

    return {
        spring: { ...baseElements, ...seasonalModifiers.spring },
        summer: { ...baseElements, ...seasonalModifiers.summer },
        autumn: { ...baseElements, ...seasonalModifiers.autumn },
        fall: { ...baseElements, ...seasonalModifiers.fall },
        winter: { ...baseElements, ...seasonalModifiers.winter },
        all: { ...baseElements, ...seasonalModifiers.all }
    };
}

function calculateSeasonalScores(
    recipe: Recipe,
    currentZodiac?: ZodiacSign | null,
    lunarPhase?: LunarPhase | null
): {
    seasonalScores: Record<Season, number>;
    elementalBreakdown: Record<Season, ElementalProperties>;
    astrologicalInfluence: Record<Season, AstrologicalProperties>;
} {
    const scores: Record<Season, number> = {
        spring: 0, summer: 0, autumn: 0, fall: 0, winter: 0, all: 0
    };
    
    const elementalBreakdown: Record<Season, ElementalProperties> = {
        spring: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        summer: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        autumn: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        fall: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        winter: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        all: { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    };

    const astrologicalInfluence: Record<Season, AstrologicalProperties> = {
        spring: { favorable: [], unfavorable: [], neutral: [] },
        summer: { favorable: [], unfavorable: [], neutral: [] },
        autumn: { favorable: [], unfavorable: [], neutral: [] },
        fall: { favorable: [], unfavorable: [], neutral: [] },
        winter: { favorable: [], unfavorable: [], neutral: [] },
        all: { favorable: [], unfavorable: [], neutral: [] }
    };

    // Base seasonal score (20% of total)
    const recipeSeason = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
    recipeSeason.forEach(season => {
        if (season in scores) {
            scores[season as Season] += 20;
        }
    });

    // Ingredient seasonality (20% of total)
    recipe.ingredients?.forEach(ingredient => {
        if (ingredient.seasonality && Array.isArray(ingredient.seasonality)) {
            ingredient.seasonality.forEach(season => {
                if (season in scores) {
                    scores[season as Season] += 20 / (recipe.ingredients?.length || 1);
                }
            });
        }
    });

    // Elemental alignment (30% of total)
    if (recipe.elementalProperties) {
        SEASONS.forEach(season => {
            let elementalScore = 0;
            const seasonElements = SEASONAL_ELEMENTS[season];
            
            Object.entries(recipe.elementalProperties).forEach(([element, value]) => {
                const seasonalInfluence = seasonElements[element as Element] || 0;
                const alignmentScore = value * seasonalInfluence * 30;
                elementalScore += alignmentScore;
                elementalBreakdown[season][element as Element] = alignmentScore;
            });
            
            scores[season] += elementalScore;
        });
    }

    // Astrological influence (20% of total)
    if (currentZodiac) {
        SEASONS.forEach(season => {
            const seasonZodiacs = seasonToZodiac[season];
            const zodiacElement = ZODIAC_ELEMENTS[currentZodiac];
            let astroScore = 0;

            // Calculate zodiacal compatibility
            seasonZodiacs.forEach(zodiac => {
                const zodiacElementalMatch = ZODIAC_ELEMENTS[zodiac] === zodiacElement;
                if (zodiacElementalMatch) {
                    astroScore += 6.67; // 20% / 3 signs per season
                    astrologicalInfluence[season].favorable.push(zodiac);
                } else {
                    astrologicalInfluence[season].neutral.push(zodiac);
                }
            });
            
            scores[season] += astroScore;
        });
    }
    
    // Lunar phase influence (10% of total)
    if (lunarPhase) {
        SEASONS.forEach(season => {
            const seasonElements = SEASONAL_ELEMENTS[season];
            const lunarElements = LUNAR_PHASE_ELEMENTS[lunarPhase];
            let lunarScore = 0;
            
            // Calculate lunar phase elemental compatibility with season
            Object.entries(seasonElements).forEach(([element, value]) => {
                const lunarElementValue = lunarElements[element as Element] || 0;
                lunarScore += value * lunarElementValue * 10;
            });
            
            scores[season] += lunarScore;
        });
    }

    return {
        seasonalScores: scores,
        elementalBreakdown,
        astrologicalInfluence
    };
}

function isComplementaryElement(element1: Element, element2: Element): boolean {
    const complementaryPairs: [Element, Element][] = [
        ['Fire', 'Air'],
        ['Water', 'Earth']
    ];
    
    return complementaryPairs.some(([a, b]) => 
        (element1 === a && element2 === b) || (element1 === b && element2 === a)
    );
}

// Helper function to get seasonal elemental influence
export function getSeasonalElementalInfluence(season: Season): ElementalProperties {
    return SEASONAL_ELEMENTS[season] || getDefaultElementalProps();
}

function calculateElementalBreakdown(recipe: Recipe, season: Season): ElementalProperties {
    if (!recipe.elementalProperties) return getDefaultElementalProps();
    
    const seasonalInfluence = getSeasonalElementalInfluence(season);
    const result: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    
    Object.entries(recipe.elementalProperties).forEach(([element, value]) => {
        const seasonalModifier = seasonalInfluence[element as Element] || 0.25;
        result[element as Element] = value * seasonalModifier;
    });
    
    return normalizeElementalValues(result);
}

export const calculateSeasonalModifiers = (recipe: Recipe, season: Season): ElementalProperties => {
    if (!recipe.elementalProperties) return getDefaultElementalProps();
    
    const seasonalInfluence = getSeasonalElementalInfluence(season);
    const result = { ...recipe.elementalProperties };
    
    Object.keys(result).forEach(element => {
        const seasonalModifier = seasonalInfluence[element as Element] || 0.25;
        result[element] *= seasonalModifier;
    });
    
    return normalizeElementalValues(result);
};

// Add seasonal influence to elemental properties
export function applySeasonalInfluence(
  elements: ElementalProperties,
  season: Season
): ElementalProperties {
  const seasonalModifiers = SEASONAL_ELEMENTS[season];
  const result = { ...elements };

  // Apply seasonal modifiers to elements
  Object.entries(elements).forEach(([element, value]) => {
    const modifier = seasonalModifiers[element as Element] || 0.25;
    result[element] = value * modifier;
  });

  return normalizeElementalValues(result);
}

// Normalize elemental values to ensure they sum to 1.0
function normalizeElementalValues(elements: ElementalProperties): ElementalProperties {
  const sum = Object.values(elements).reduce((acc, val) => acc + val, 0);
  
  if (sum <= 0) return getDefaultElementalProps();
  
  const normalized = { ...elements };
  Object.keys(normalized).forEach(key => {
    normalized[key] = normalized[key] / sum;
  });
  
  return normalized;
}

// New function to calculate recipe compatibility with lunar phase
export function calculateLunarPhaseCompatibility(
    recipe: Recipe,
    lunarPhase: LunarPhase
): {
    score: number;
    elementalAlignment: number;
    recipeTypeAlignment: number;
} {
    if (!recipe || !lunarPhase) {
        return { score: 0, elementalAlignment: 0, recipeTypeAlignment: 0 };
    }
    
    // Calculate elemental alignment
    let elementalAlignment = 0;
    
    if (recipe.elementalProperties && LUNAR_PHASE_ELEMENTS[lunarPhase]) {
        Object.entries(recipe.elementalProperties).forEach(([element, value]) => {
            const lunarElementValue = LUNAR_PHASE_ELEMENTS[lunarPhase][element as Element] || 0;
            elementalAlignment += (value || 0) * lunarElementValue;
        });
        
        elementalAlignment = Math.round(elementalAlignment * 50);
    }
    
    // Calculate recipe type alignment
    let recipeTypeAlignment = 0;
    const lunarRecipeTypes = LUNAR_FOOD_ASSOCIATIONS[lunarPhase as LunarPhaseWithSpaces];
    
    if (recipe.mealType && lunarRecipeTypes) {
        const recipeMealTypes = Array.isArray(recipe.mealType) ? 
            recipe.mealType : [recipe.mealType];
            
        recipeMealTypes.forEach(mealType => {
            if (lunarRecipeTypes.some(type => 
                mealType.toLowerCase().includes(type.toLowerCase()))) {
                recipeTypeAlignment += 25;
            }
        });
    }
    
    // Check for explicit lunar phase influence
    if (recipe.lunarPhaseInfluences && 
        Array.isArray(recipe.lunarPhaseInfluences)) {
        // Cast lunarPhase to LunarPhaseWithSpaces for type compatibility
        const lunarPhaseWithSpaces = lunarPhase as unknown as LunarPhaseWithSpaces;
        if (recipe.lunarPhaseInfluences.includes(lunarPhaseWithSpaces)) {
            recipeTypeAlignment += 25;
        }
    }
    
    const totalScore = elementalAlignment + recipeTypeAlignment;
    
    return {
        score: totalScore,
        elementalAlignment,
        recipeTypeAlignment
    };
}

// ===== PERFORMANCE CACHING SYSTEM =====

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  key: string;
}

class SeasonalCalculationsCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes cache
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      key
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

const seasonalCache = new SeasonalCalculationsCache();

// ===== ENHANCED SEASONAL ANALYSIS SYSTEM =====

/**
 * Comprehensive seasonal analysis for recipe recommendations
 * NOW FULLY UTILIZED - Main function for seasonal scoring
 */
export function getComprehensiveSeasonalAnalysis(
  recipe: Recipe,
  currentSeason: Season,
  currentZodiac?: ZodiacSign | null,
  lunarPhase?: LunarPhase | null
): {
  overallScore: number;
  seasonalScores: Record<Season, number>;
  elementalBreakdown: Record<Season, ElementalProperties>;
  astrologicalInfluence: Record<Season, AstrologicalProperties>;
  recommendations: string[];
  cacheHit: boolean;
} {
  const cacheKey = `seasonal_analysis_${recipe.id || recipe.name}_${currentSeason}_${currentZodiac}_${lunarPhase}`;
  const cached = seasonalCache.get(cacheKey);
  
  if (cached) {
    return { ...cached, cacheHit: true };
  }

  const analysis = calculateSeasonalScores(recipe, currentZodiac, lunarPhase);
  const overallScore = analysis.seasonalScores[currentSeason];
  
  // Generate recommendations based on analysis
  const recommendations: string[] = [];
  
  if (overallScore >= 80) {
    recommendations.push("Excellent seasonal match - highly recommended");
  } else if (overallScore >= 60) {
    recommendations.push("Good seasonal alignment");
  } else if (overallScore < 40) {
    recommendations.push("Consider seasonal substitutions");
  }
  
  // Add elemental recommendations
  const dominantElements = Object.entries(analysis.elementalBreakdown[currentSeason])
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);
    
  if (dominantElements.length > 0) {
    recommendations.push(`Strong ${dominantElements[0][0]} elemental influence`);
  }
  
  const result = {
    overallScore,
    seasonalScores: analysis.seasonalScores,
    elementalBreakdown: analysis.elementalBreakdown,
    astrologicalInfluence: analysis.astrologicalInfluence,
    recommendations,
    cacheHit: false
  };
  
  seasonalCache.set(cacheKey, result);
  return result;
}

/**
 * Enhanced complementary element checker with seasonal context
 * NOW FULLY UTILIZED - Used in seasonal compatibility calculations
 */
export function getElementalCompatibilityWithSeason(
  element1: Element, 
  element2: Element, 
  season: Season
): {
  baseCompatibility: number;
  seasonalBonus: number;
  totalCompatibility: number;
  reason: string;
} {
  const cacheKey = `element_compat_${element1}_${element2}_${season}`;
  const cached = seasonalCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  let baseCompatibility = 0.5; // Default neutral
  let reason = "Neutral elemental relationship";
  
  // Same element has highest compatibility (following our elemental principles)
  if (element1 === element2) {
    baseCompatibility = 0.9;
    reason = `Strong ${element1} elemental harmony`;
  } 
  // Complementary elements have good compatibility
  else if (isComplementaryElement(element1, element2)) {
    baseCompatibility = 0.7;
    reason = `Complementary ${element1}-${element2} elemental pair`;
  }
  // All other combinations still have good compatibility (no opposing elements)
  else {
    baseCompatibility = 0.6;
    reason = `Harmonious ${element1}-${element2} combination`;
  }
  
  // Apply seasonal bonus
  const seasonalInfluence = getSeasonalElementalInfluence(season);
  const element1Influence = seasonalInfluence[element1] || 0.25;
  const element2Influence = seasonalInfluence[element2] || 0.25;
  const seasonalBonus = (element1Influence + element2Influence) * 0.2;
  
  const totalCompatibility = Math.min(1, baseCompatibility + seasonalBonus);
  
  const result = {
    baseCompatibility,
    seasonalBonus,
    totalCompatibility,
    reason: `${reason}. Seasonal influence: +${Math.round(seasonalBonus * 100)}%`
  };
  
  seasonalCache.set(cacheKey, result);
  return result;
}

/**
 * Enhanced elemental breakdown with seasonal modifiers
 * NOW FULLY UTILIZED - Used in comprehensive recipe analysis
 */
export function getEnhancedElementalBreakdown(
  recipe: Recipe, 
  season: Season,
  includeIngredientAnalysis = true
): {
  baseElements: ElementalProperties;
  seasonalModifiers: ElementalProperties;
  finalElements: ElementalProperties;
  ingredientContribution: ElementalProperties;
  analysis: {
    dominantElement: Element;
    secondaryElement: Element;
    seasonalMatch: number;
    recommendations: string[];
  };
} {
  const cacheKey = `enhanced_breakdown_${recipe.id || recipe.name}_${season}_${includeIngredientAnalysis}`;
  const cached = seasonalCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const baseElements = calculateElementalBreakdown(recipe, season);
  const seasonalModifiers = getSeasonalElementalInfluence(season);
  
  // Calculate final elemental values with seasonal influence
  const finalElements: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  const ingredientContribution: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  
  Object.entries(baseElements).forEach(([element, value]) => {
    const seasonalInfluence = seasonalModifiers[element as Element] || 0.25;
    finalElements[element as Element] = value * (1 + seasonalInfluence);
  });
  
  // Analyze ingredient contributions if requested
  if (includeIngredientAnalysis && recipe.ingredients) {
    recipe.ingredients.forEach(ingredient => {
      if (ingredient.elementalProperties) {
        Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
          ingredientContribution[element as Element] += value / recipe.ingredients!.length;
        });
      }
    });
  }
  
  // Normalize final values
  const normalizedFinal = normalizeElementalValues(finalElements);
  
  // Analysis
  const elementEntries = Object.entries(normalizedFinal) as [Element, number][];
  const sortedElements = elementEntries.sort(([,a], [,b]) => b - a);
  
  const dominantElement = sortedElements[0][0];
  const secondaryElement = sortedElements[1][0];
  const seasonalMatch = seasonalModifiers[dominantElement] || 0.25;
  
  const recommendations: string[] = [];
  if (seasonalMatch > 0.3) {
    recommendations.push(`Excellent ${season} alignment with ${dominantElement} dominance`);
  }
  if (sortedElements[0][1] > 0.4) {
    recommendations.push(`Strong ${dominantElement} elemental signature`);
  }
  if (includeIngredientAnalysis) {
    const topIngredientElement = Object.entries(ingredientContribution)
      .sort(([,a], [,b]) => b - a)[0][0] as Element;
    recommendations.push(`Ingredient profile enhances ${topIngredientElement} element`);
  }
  
  const result = {
    baseElements,
    seasonalModifiers,
    finalElements: normalizedFinal,
    ingredientContribution,
    analysis: {
      dominantElement,
      secondaryElement,
      seasonalMatch,
      recommendations
    }
  };
  
  seasonalCache.set(cacheKey, result);
  return result;
}

// ===== CACHE MANAGEMENT UTILITIES =====

/**
 * Cache statistics and management
 */
export function getSeasonalCacheStats(): {
  size: number;
  hitRate: number;
  clear: () => void;
} {
  return {
    size: seasonalCache.size(),
    hitRate: 0, // Would need hit tracking for accurate rate
    clear: () => seasonalCache.clear()
  };
}

// Export the enhanced functions that were previously unused
export { calculateSeasonalScores, isComplementaryElement, calculateElementalBreakdown }; 