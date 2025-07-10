// ===== UNIFIED SEASONAL SYSTEM =====
// Phase 3 of WhatToEatNext Data Consolidation
// Consolidates seasonal.ts, seasonalPatterns.ts, and seasonalUsage.ts
// Integrates Monica constants and Kalchm values from the existing systems.

import type { 
  Season, 
  Element, 
  ElementalProperties, 
  ZodiacSign, 
  PlanetName,
  LunarPhase,
  CookingMethod 
} from "@/types/alchemy";
import { 
  getAllEnhancedCookingMethods, 
  getMonicaCompatibleCookingMethods,
  type EnhancedCookingMethod 
} from '../../constants/alchemicalPillars';
import type { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import { unifiedIngredients } from './ingredients';

// ===== ENHANCED SEASONAL INTERFACES =====

export interface SeasonalMonicaModifiers {
  temperatureAdjustment: number;    // Temperature adjustment for seasonal cooking
  timingAdjustment: number;         // Timing adjustment percentage
  intensityModifier: string;        // 'increase' | 'decrease' | 'maintain'
  planetaryAlignment: number;       // Seasonal planetary alignment bonus
  lunarPhaseBonus: number;         // Seasonal lunar phase sensitivity
}

export interface ElementalSeasonalProfile {
  dominantElements: Element[];      // Primary elements for the season
  elementalShifts: ElementalProperties; // Elemental transition values
  monicaInfluence: number;         // Seasonal Monica modifier
  kalchmResonance: number;         // Seasonal Kalchm resonance
}

export interface TarotSeasonalInfluence {
  element: Element;
  effect: number;
  ingredients: string[];
  cookingMethod: CookingMethod;
}

export interface SeasonalTarotProfile {
  minorArcana: string[];
  majorArcana: string[];
  currentZodiacSigns: ZodiacSign[];
  cookingRecommendations: string[];
  tarotInfluences: Record<string, TarotSeasonalInfluence | string>;
  dominant_element: Element;
  secondary_element: Element;
}

export interface SeasonalCuisineProfile {
  combinations: string[];
  dishes: string[];
  culturalSignificance?: string[];
}

export interface SeasonalIngredientProfile {
  availability: number;            // 0-1 scale for ingredient availability
  traditionalUse: string[];        // Traditional uses in this season
  complementaryFlavors: string[];  // Flavors that work well in this season
  kalchmCompatibility: number;     // Kalchm compatibility for season
  monicaResonance: number;         // Monica resonance for seasonal cooking
}

export interface SeasonalProfile {
  // Core Seasonal Data
  elementalDominance: ElementalProperties;
  kalchmRange: { min: number; max: number };
  monicaModifiers: SeasonalMonicaModifiers;
  
  // Ingredient Data (consolidated from seasonalPatterns.ts)
  ingredients: { [key: string]: number };  // ingredient name -> availability score
  
  // Traditional Usage (from seasonalUsage.ts)
  growing: string[];                    // Herbs/ingredients growing in season
  herbs: string[];                      // Seasonal herbs
  vegetables: string[];                 // Seasonal vegetables
  cuisines: { [key: string]: SeasonalCuisineProfile }; // Cuisine-specific data
  
  // Astrological Data (consolidated from seasonalUsage.ts)
  tarotProfile: SeasonalTarotProfile;
  
  // Enhanced Properties
  optimalIngredients: string[];         // References to unified ingredients
  optimalCookingMethods: string[];      // References to enhanced cooking methods
  elementalInfluence: number;           // Base elemental influence
}

export interface SeasonalTransitionProfile {
  fromSeason: Season;
  toSeason: Season;
  transitionProgress: number;           // 0-1
  blendedElementalProfile: ElementalProperties;
  blendedKalchmRange: { min: number; max: number };
  blendedMonicaModifiers: SeasonalMonicaModifiers;
  recommendedIngredients: UnifiedIngredient[];
  recommendedCookingMethods: EnhancedCookingMethod[];
}

export interface SeasonalRecommendations {
  ingredients: UnifiedIngredient[];
  cookingMethods: EnhancedCookingMethod[];
  recipes: unknown[];                       // Will be enhanced when recipe system is unified
  monicaOptimization: number;
  kalchmHarmony: number;}

// ===== CONSOLIDATED SEASONAL DATA =====

export const unifiedSeasonalProfiles: Record<Season, SeasonalProfile> = {
  spring: {
    elementalDominance: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2
    },
    kalchmRange: { min: 0.8, max: 1.2 },
    monicaModifiers: {
      temperatureAdjustment: 10,
      timingAdjustment: -5,
      intensityModifier: 'increase',
      planetaryAlignment: 0.8,
      lunarPhaseBonus: 0.7
    },
    
    // Ingredient availability (from seasonalPatterns.ts)
    ingredients: {
      "asparagus": 0.9,
      "peas": 0.85,
      "artichokes": 0.82,
      "rhubarb": 0.78,
      "radishes": 0.75,
      "spring_greens": 0.92,
      "fava_beans": 0.8,
      "morels": 0.87,
      "strawberries": 0.7,
      "new_potatoes": 0.76
    },
    
    // Traditional usage (from seasonalUsage.ts)
    growing: ['basil', 'oregano', 'thyme'],
    herbs: ['mint', 'chives', 'parsley', 'dill'],
    vegetables: ['asparagus', 'peas', 'artichokes', 'spring onions'],
    cuisines: {
      'greek': {
        combinations: ['mint + parsley', 'dill + garlic'],
        dishes: ['spring lamb', 'fresh salads']
      },
      'italian': {
        combinations: ['basil + tomato', 'pea + mint'],
        dishes: ['primavera pasta', 'spring risotto']
      }
    },
    
    // Astrological profile (from seasonalUsage.ts)
    tarotProfile: {
      minorArcana: ['2 of Wands', '3 of Wands', '4 of Wands', '5 of Pentacles', '6 of Pentacles', '7 of Pentacles', '8 of Swords', '9 of Swords', '10 of Swords'],
      majorArcana: ['The Emperor', 'The Hierophant', 'The Lovers'],
      currentZodiacSigns: ['aries', 'taurus', 'gemini'],
      cookingRecommendations: [
        'Use energetic Fire elements (aries) for quick cooking methods like stir-frying and grilling',
        'Incorporate Earth elements (taurus) for grounding dishes with root vegetables',
        'Experiment with Air elements (gemini) for dishes with variety and contrast',
        'Balance bold flavors (2 of Wands) with fresh spring ingredients',
        'Consider fermentation and pickling for slower transformations (7 of Pentacles)'
      ],
      tarotInfluences: {
        "2_of_wands": { 
          element: "Fire", 
          effect: 0.85,
          ingredients: ["radishes", "spring_greens"],
          cookingMethod: "grilling" as unknown as CookingMethod
        },
        "3_of_wands": { 
          element: "Fire",
          effect: 0.8,
          ingredients: ["asparagus", "morels"],
          cookingMethod: "roasting" as unknown as CookingMethod
        },
        "4_of_wands": {
          element: "Fire",
          effect: 0.75,
          ingredients: ["strawberries", "new_potatoes"],
          cookingMethod: "baking" as unknown as CookingMethod
        },
        "5_of_pentacles": {
          element: "Earth",
          effect: 0.7,
          ingredients: ["rhubarb", "fava_beans"],
          cookingMethod: "simmering" as unknown as CookingMethod
        },
        "dominant_element": "Fire",
        "secondary_element": "Air"
      },
      dominant_element: 'Fire',
      secondary_element: 'Air'
    },
    
    optimalIngredients: ['asparagus', 'spring_greens', 'morels', 'peas', 'artichokes'],
    optimalCookingMethods: ['grilling', 'roasting', 'sauteing', 'steaming'],
    elementalInfluence: 0.8
  },

  summer: {
    elementalDominance: { Fire: 0.5, Water: 0.3, Earth: 0.1, Air: 0.1
    },
    kalchmRange: { min: 0.8, max: 1.2 },
    monicaModifiers: {
      temperatureAdjustment: -15,
      timingAdjustment: -10,
      intensityModifier: 'decrease',
      planetaryAlignment: 0.9,
      lunarPhaseBonus: 0.8
    },
    
    ingredients: {
      "tomatoes": 0.9,
      "corn": 0.85,
      "peaches": 0.88,
      "watermelon": 0.92,
      "berries": 0.87,
      "summer_squash": 0.82,
      "eggplant": 0.79,
      "bell_peppers": 0.84,
      "cucumbers": 0.86,
      "cherries": 0.88
    },
    
    growing: ['basil', 'rosemary', 'cilantro'],
    herbs: ['basil', 'oregano', 'tarragon', 'cilantro'],
    vegetables: ['tomatoes', 'zucchini', 'eggplant', 'peppers'],
    cuisines: {
      'greek': {
        combinations: ['cucumber + mint', 'tomato + feta'],
        dishes: ['tzatziki', 'greek salad', 'souvlaki']
      },
      'italian': {
        combinations: ['tomato + basil', 'zucchini + mint'],
        dishes: ['caprese salad', 'summer pasta', 'grilled vegetables']
      }
    },
    
    tarotProfile: {
      minorArcana: ['2 of Cups', '3 of Cups', '4 of Cups', '5 of Wands', '6 of Wands', '7 of Wands', '8 of Pentacles', '9 of Pentacles', '10 of Pentacles'],
      majorArcana: ['The Chariot', 'Strength', 'The Hermit'],
      currentZodiacSigns: ['cancer', 'leo', 'virgo'],
      cookingRecommendations: [
        'Embrace Water elements (cancer) for emotional and nurturing dishes',
        'Use Fire elements (leo) for bold, vibrant cooking with strong flavors',
        'Incorporate Earth elements (virgo) for meticulous preparation and wholesome ingredients',
        'Create communal dishes that bring people together (3 of Cups)',
        'Showcase achievements with presentation-focused dishes (6 of Wands)',
        'Perfect cooking techniques with attention to detail (8 of Pentacles)'
      ],
      tarotInfluences: {
        "2_of_cups": {
          element: "Water",
          effect: 0.85,
          ingredients: ["watermelon", "cucumbers"],
          cookingMethod: "raw" as unknown as CookingMethod
        },
        "3_of_cups": {
          element: "Water",
          effect: 0.9,
          ingredients: ["berries", "peaches"],
          cookingMethod: "fermenting" as unknown as CookingMethod
        },
        "5_of_wands": {
          element: "Fire",
          effect: 0.85,
          ingredients: ["tomatoes", "bell_peppers"],
          cookingMethod: "grilling" as unknown as CookingMethod
        },
        "6_of_wands": {
          element: "Fire",
          effect: 0.8,
          ingredients: ["corn", "summer_squash"],
          cookingMethod: "roasting" as unknown as CookingMethod
        },
        "dominant_element": "Fire",
        "secondary_element": "Water"
      },
      dominant_element: 'Fire',
      secondary_element: 'Water'
    },
    
    optimalIngredients: ['tomatoes', 'watermelon', 'berries', 'peaches', 'cucumbers'],
    optimalCookingMethods: ['grilling', 'raw', 'fermenting', 'steaming'],
    elementalInfluence: 0.9
  },

  autumn: {
    elementalDominance: { Fire: 0.1, Water: 0.3, Earth: 0.4, Air: 0.2
    },
    kalchmRange: { min: 0.8, max: 1.2 },
    monicaModifiers: {
      temperatureAdjustment: 5,
      timingAdjustment: 10,
      intensityModifier: 'maintain',
      planetaryAlignment: 0.7,
      lunarPhaseBonus: 0.6
    },
    
    ingredients: {
      "apples": 0.9,
      "pumpkin": 0.95,
      "butternut_squash": 0.92,
      "sweet_potatoes": 0.87,
      "brussels_sprouts": 0.84,
      "cranberries": 0.82,
      "figs": 0.78,
      "grapes": 0.83,
      "mushrooms": 0.79,
      "pears": 0.88
    },
    
    growing: ['sage', 'rosemary', 'thyme'],
    herbs: ['sage', 'rosemary', 'thyme', 'bay leaf'],
    vegetables: ['pumpkin', 'squash', 'mushrooms', 'cauliflower'],
    cuisines: {
      'greek': {
        combinations: ['spinach + feta', 'lamb + herbs'],
        dishes: ['moussaka', 'stuffed peppers', 'roasted lamb']
      },
      'french': {
        combinations: ['mushroom + thyme', 'apple + cinnamon'],
        dishes: ['ratatouille', 'mushroom soup', 'apple tart']
      }
    },
    
    tarotProfile: {
      minorArcana: ['2 of Swords', '3 of Swords', '4 of Swords', '5 of Cups', '6 of Cups', '7 of Cups', '8 of Wands', '9 of Wands', '10 of Wands'],
      majorArcana: ['Justice', 'The Hanged Man', 'Death'],
      currentZodiacSigns: ['libra', 'scorpio', 'sagittarius'],
      cookingRecommendations: [
        'Balance Air elements (libra) with harmonious flavor combinations',
        'Use Water elements (scorpio) for deep, transformative dishes with complex flavors',
        'Incorporate Fire elements (sagittarius) for bold, exploratory cooking',
        'Find equilibrium in dish components (2 of Swords)',
        'Create nostalgic comfort food (6 of Cups)',
        'Balance workload with efficient meal preparation (10 of Wands)'
      ],
      tarotInfluences: {
        "2_of_swords": {
          element: "Air",
          effect: 0.7,
          ingredients: ["apples", "pears"],
          cookingMethod: "baking" as unknown as CookingMethod
        },
        "5_of_cups": {
          element: "Water",
          effect: 0.75,
          ingredients: ["cranberries", "figs"],
          cookingMethod: "poaching" as unknown as CookingMethod
        },
        "6_of_cups": {
          element: "Water",
          effect: 0.8,
          ingredients: ["pumpkin", "sweet_potatoes"],
          cookingMethod: "roasting" as unknown as CookingMethod
        },
        "8_of_wands": {
          element: "Fire",
          effect: 0.65,
          ingredients: ["grapes", "mushrooms"],
          cookingMethod: "sauteing" as unknown as CookingMethod
        },
        "dominant_element": "Earth",
        "secondary_element": "Water"
      },
      dominant_element: 'Earth',
      secondary_element: 'Water'
    },
    
    optimalIngredients: ['pumpkin', 'butternut_squash', 'apples', 'sweet_potatoes', 'pears'],
    optimalCookingMethods: ['roasting', 'baking', 'braising', 'poaching'],
    elementalInfluence: 0.7
  },

  fall: {
    elementalDominance: { Fire: 0.1, Water: 0.3, Earth: 0.4, Air: 0.2
    },
    kalchmRange: { min: 0.8, max: 1.2 },
    monicaModifiers: {
      temperatureAdjustment: 5,
      timingAdjustment: 10,
      intensityModifier: 'maintain',
      planetaryAlignment: 0.7,
      lunarPhaseBonus: 0.6
    },
    
    // Same as autumn (supporting both terms)
    ingredients: {
      "apples": 0.9,
      "pumpkin": 0.95,
      "butternut_squash": 0.92,
      "sweet_potatoes": 0.87,
      "brussels_sprouts": 0.84,
      "cranberries": 0.82,
      "figs": 0.78,
      "grapes": 0.83,
      "mushrooms": 0.79,
      "pears": 0.88
    },
    
    growing: ['sage', 'rosemary', 'thyme'],
    herbs: ['sage', 'rosemary', 'thyme', 'bay leaf'],
    vegetables: ['pumpkin', 'squash', 'mushrooms', 'cauliflower'],
    cuisines: {
      'greek': {
        combinations: ['spinach + feta', 'lamb + herbs'],
        dishes: ['moussaka', 'stuffed peppers', 'roasted lamb']
      },
      'french': {
        combinations: ['mushroom + thyme', 'apple + cinnamon'],
        dishes: ['ratatouille', 'mushroom soup', 'apple tart']
      }
    },
    
    tarotProfile: {
      minorArcana: ['2 of Swords', '3 of Swords', '4 of Swords', '5 of Cups', '6 of Cups', '7 of Cups', '8 of Wands', '9 of Wands', '10 of Wands'],
      majorArcana: ['Justice', 'The Hanged Man', 'Death'],
      currentZodiacSigns: ['libra', 'scorpio', 'sagittarius'],
      cookingRecommendations: [
        'Balance Air elements (libra) with harmonious flavor combinations',
        'Use Water elements (scorpio) for deep, transformative dishes with complex flavors',
        'Incorporate Fire elements (sagittarius) for bold, exploratory cooking',
        'Find equilibrium in dish components (2 of Swords)',
        'Create nostalgic comfort food (6 of Cups)',
        'Balance workload with efficient meal preparation (10 of Wands)'
      ],
      tarotInfluences: {
        "2_of_swords": {
          element: "Air",
          effect: 0.7,
          ingredients: ["apples", "pears"],
          cookingMethod: ("baking" as unknown as CookingMethod)
        },
        "5_of_cups": {
          element: "Water",
          effect: 0.75,
          ingredients: ["cranberries", "figs"],
          cookingMethod: ("poaching" as unknown as CookingMethod)
        },
        "6_of_cups": {
          element: "Water",
          effect: 0.8,
          ingredients: ["pumpkin", "sweet_potatoes"],
          cookingMethod: ("roasting" as unknown as CookingMethod)
        },
        "8_of_wands": {
          element: "Fire",
          effect: 0.65,
          ingredients: ["grapes", "mushrooms"],
          cookingMethod: ("sauteing" as unknown as CookingMethod)
        },
        "dominant_element": "Earth",
        "secondary_element": "Water"
      },
      dominant_element: 'Earth',
      secondary_element: 'Water'
    },
    
    optimalIngredients: ['pumpkin', 'butternut_squash', 'apples', 'sweet_potatoes', 'pears'],
    optimalCookingMethods: ['roasting', 'baking', 'braising', 'poaching'],
    elementalInfluence: 0.7
  },

  winter: {
    elementalDominance: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1
    },
    kalchmRange: { min: 0.8, max: 1.2 },
    monicaModifiers: {
      temperatureAdjustment: 20,
      timingAdjustment: 15,
      intensityModifier: 'increase',
      planetaryAlignment: 0.6,
      lunarPhaseBonus: 0.5
    },
    
    ingredients: {
      "citrus": 0.85,
      "kale": 0.8,
      "root_vegetables": 0.9,
      "pomegranates": 0.82,
      "winter_squash": 0.88,
      "persimmons": 0.76,
      "leeks": 0.79,
      "brussels_sprouts": 0.75,
      "turnips": 0.77,
      "cranberries": 0.72
    },
    
    growing: ['rosemary', 'thyme', 'sage'],
    herbs: ['rosemary', 'thyme', 'sage', 'bay leaf'],
    vegetables: ['kale', 'brussels sprouts', 'root vegetables', 'cabbage'],
    cuisines: {
      'greek': {
        combinations: ['lemon + oregano', 'olive + herb'],
        dishes: ['avgolemono soup', 'winter stews', 'baked fish']
      },
      'french': {
        combinations: ['thyme + red wine', 'rosemary + garlic'],
        dishes: ['beef bourguignon', 'cassoulet', 'onion soup']
      }
    },
    
    tarotProfile: {
      minorArcana: ['2 of Pentacles', '3 of Pentacles', '4 of Pentacles', '5 of Swords', '6 of Swords', '7 of Swords', '8 of Cups', '9 of Cups', '10 of Cups'],
      majorArcana: ['Temperance', 'The Devil', 'The Tower'],
      currentZodiacSigns: ['capricorn', 'aquarius', 'pisces'],
      cookingRecommendations: [
        'Embrace Earth elements (capricorn) for traditional and structured cooking',
        'Use Air elements (aquarius) for innovative and unconventional approaches',
        'Incorporate Water elements (pisces) for intuitive and fluid cooking styles',
        'Balance resources and manage ingredients efficiently (2 of Pentacles)',
        'Focus on collaborative cooking projects (3 of Pentacles)',
        'Create dishes that bring joy and fulfillment (9 of Cups, 10 of Cups)'
      ],
      tarotInfluences: {
        "2_of_pentacles": {
          element: "Earth",
          effect: 0.75,
          ingredients: ["root_vegetables", "winter_squash"],
          cookingMethod: ("braising" as unknown as CookingMethod)
        },
        "3_of_pentacles": {
          element: "Earth",
          effect: 0.8,
          ingredients: ["kale", "leeks"],
          cookingMethod: ("stewing" as unknown as CookingMethod)
        },
        "8_of_cups": {
          element: "Water",
          effect: 0.7,
          ingredients: ["citrus", "pomegranates"],
          cookingMethod: ("poaching" as unknown as CookingMethod)
        },
        "9_of_cups": {
          element: "Water",
          effect: 0.85,
          ingredients: ["persimmons", "cranberries"],
          cookingMethod: ("simmering" as unknown as CookingMethod)
        },
        "dominant_element": "Earth",
        "secondary_element": "Water"
      },
      dominant_element: 'Earth',
      secondary_element: 'Water'
    },
    
    optimalIngredients: ['root_vegetables', 'winter_squash', 'kale', 'citrus', 'pomegranates'],
    optimalCookingMethods: ['braising', 'stewing', 'roasting', 'simmering'],
    elementalInfluence: 0.6
  },

  all: {
    elementalDominance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    },
    kalchmRange: { min: 0.8, max: 1.2 },
    monicaModifiers: {
      temperatureAdjustment: 0,
      timingAdjustment: 0,
      intensityModifier: 'maintain',
      planetaryAlignment: 0.75,
      lunarPhaseBonus: 0.65
    },
    
    ingredients: {
      "onions": 0.9,
      "garlic": 0.95,
      "carrots": 0.85,
      "potatoes": 0.88,
      "herbs": 0.8
    },
    
    growing: ['basil', 'rosemary', 'thyme', 'sage', 'oregano'],
    herbs: ['parsley', 'thyme', 'rosemary', 'bay leaf', 'oregano'],
    vegetables: ['onions', 'garlic', 'carrots', 'potatoes'],
    cuisines: {
      'global': {
        combinations: ['garlic + herbs', 'lemon + herbs'],
        dishes: ['roasted meats', 'soups', 'stews']
      }
    },
    
    tarotProfile: {
      minorArcana: [
        'Ace of Wands', 'Ace of Cups', 'Ace of Swords', 'Ace of Pentacles',
        'Queen of Wands', 'Queen of Cups', 'Queen of Swords', 'Queen of Pentacles',
        'King of Wands', 'King of Cups', 'King of Swords', 'King of Pentacles'
      ],
      majorArcana: ['The Fool', 'The Magician', 'The High Priestess', 'The World'],
      currentZodiacSigns: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
      cookingRecommendations: [
        'Use the universal energy of the Aces for starting new culinary projects',
        'Balance all four elements (Fire, Water, Air, Earth) in year-round cooking',
        'Draw on the nurturing energy of the Queens for comforting dishes',
        'Use the mastery of the Kings for perfecting signature dishes',
        'Embrace the cyclical nature of The World for seasonal adaptations',
        'Trust intuition with High Priestess energy for experimental cooking'
      ],
      tarotInfluences: {
        "ace_of_wands": {
          element: "Fire",
          effect: 0.8,
          ingredients: ["garlic", "herbs"],
          cookingMethod: ("sauteing" as unknown as CookingMethod)
        },
        "ace_of_cups": {
          element: "Water",
          effect: 0.8,
          ingredients: ["onions", "carrots"],
          cookingMethod: ("simmering" as unknown as CookingMethod)
        },
        "ace_of_swords": {
          element: "Air",
          effect: 0.8,
          ingredients: ["herbs", "potatoes"],
          cookingMethod: ("roasting" as unknown as CookingMethod)
        },
        "ace_of_pentacles": {
          element: "Earth",
          effect: 0.8,
          ingredients: ["root_vegetables", "grains"],
          cookingMethod: ("baking" as unknown as CookingMethod)
        },
        "dominant_element": "Earth",
        "secondary_element": "Fire"
      },
      dominant_element: 'Earth',
      secondary_element: 'Fire'
    },
    
    optimalIngredients: ['garlic', 'onions', 'herbs', 'potatoes', 'carrots'],
    optimalCookingMethods: ['sauteing', 'roasting', 'simmering', 'baking'],
    elementalInfluence: 0.75
  }
};

// ===== UNIFIED SEASONAL SYSTEM CLASS =====

export class UnifiedSeasonalSystem {
  private enhancedCookingMethods: { [key: string]: EnhancedCookingMethod };
  
  constructor() {
    this.enhancedCookingMethods = (getAllEnhancedCookingMethods() as unknown as { [key: string]: EnhancedCookingMethod });
  }

  // ===== CORE SEASONAL FUNCTIONS =====

  /**
   * Get current season based on date
   */
  getCurrentSeason(): Season {
    const month = new Date()?.getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * Get seasonal score for an ingredient in the current or specified season
   */
  getSeasonalScore(ingredientName: string, season: Season = this.getCurrentSeason()): number {
    const seasonProfile = unifiedSeasonalProfiles[season];
    if (!seasonProfile) return 0.1;
    
    // Check if the ingredient exists in seasonal patterns
    if (seasonProfile?.ingredients?.[ingredientName]) {
      return seasonProfile?.ingredients?.[ingredientName];
    }
    
    // If ingredient is not found in the specific season, check if it's marked as 'all' seasons
    if (season !== 'all' && unifiedSeasonalProfiles['all'].ingredients[ingredientName]) {
      return unifiedSeasonalProfiles['all'].ingredients[ingredientName];
    }
    
    return 0.1; // Default low score if not found
  }

  /**
   * Get complete seasonal data for an ingredient with Kalchm integration
   */
  getSeasonalIngredientProfile(
    ingredientName: string,
    season: Season = this.getCurrentSeason()
  ): SeasonalIngredientProfile {
    const availability = this.getSeasonalScore(ingredientName, season);
    const seasonProfile = unifiedSeasonalProfiles[season];
    
    // Get traditional use from seasonal usage data
    const traditionalUse: string[] = [];
    if (seasonProfile.growing && seasonProfile.growing.includes(ingredientName)) traditionalUse?.push('growing');
    if (seasonProfile.herbs && seasonProfile.herbs.includes(ingredientName)) traditionalUse?.push('culinary herb');
    if (seasonProfile.vegetables && seasonProfile.vegetables.includes(ingredientName)) traditionalUse?.push('seasonal vegetable');
    
    // Get complementary flavors for the season (top scoring ingredients)
    const complementaryFlavors = Object.entries(seasonProfile.ingredients)
      .filter(([key, value]) => value > 0.7 && key !== ingredientName)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);
    
    // Calculate Kalchm compatibility
    const unifiedIngredient = unifiedIngredients[ingredientName];
    const kalchmCompatibility = unifiedIngredient 
      ? this.calculateKalchmSeasonalCompatibility(unifiedIngredient.kalchm, season)
      : 0.5;
    
    // Calculate Monica resonance
    const monicaResonance = this.calculateMonicaSeasonalResonance(season, availability);
    
    return {
      availability,
      traditionalUse,
      complementaryFlavors,
      kalchmCompatibility,
      monicaResonance
    };
  }

  /**
   * Calculate Kalchm compatibility with seasonal range
   */
  private calculateKalchmSeasonalCompatibility(ingredientKalchm: number, season: Season): number {
    const seasonProfile = unifiedSeasonalProfiles[season];
    const { min, max } = seasonProfile.kalchmRange;
    
    // Perfect compatibility if within range
    if (ingredientKalchm >= min && ingredientKalchm <= max) {
      return 1.0;
    }
    
    // Calculate compatibility based on distance from range
    const distance = ingredientKalchm < min 
      ? min - ingredientKalchm 
      : ingredientKalchm - max;
    
    // Use exponential decay for compatibility (max distance of 0.5 gives 0.6 compatibility)
    return Math.max(0.1, Math.exp(-distance * 2));
  }

  /**
   * Calculate Monica resonance for seasonal cooking
   */
  private calculateMonicaSeasonalResonance(season: Season, availability: number): number {
    const seasonProfile = unifiedSeasonalProfiles[season];
    const baseResonance = seasonProfile?.monicaModifiers?.lunarPhaseBonus;
    
    // Higher availability increases Monica resonance
    return Math.min(1.0, baseResonance * (0.5 + availability * 0.5));
  }

  /**
   * Check if an ingredient is in season
   */
  isInSeason(ingredientName: string, threshold = 0.5): boolean {
    const score = this.getSeasonalScore(ingredientName);
    return score >= threshold;
  }

  // ===== ENHANCED SEASONAL CALCULATIONS =====

  /**
   * Calculate seasonal compatibility for an ingredient with current conditions
   */
  calculateSeasonalCompatibility(
    ingredient: UnifiedIngredient,
    season: Season,
    currentConditions?: {
      lunarPhase?: LunarPhase;
      planetaryHour?: PlanetName;
      temperature?: number;
    }
  ): number {
    const seasonProfile = unifiedSeasonalProfiles[season];
    
    // Base seasonal score
    const baseScore = this.getSeasonalScore(ingredient.name, season);
    
    // Kalchm compatibility
    const kalchmCompatibility = this.calculateKalchmSeasonalCompatibility(ingredient.kalchm, season);
    
    // Elemental compatibility
    const elementalCompatibility = this.calculateElementalSeasonalCompatibility(
      ingredient.elementalProperties,
      seasonProfile.elementalDominance
    );
    
    // Combine scores with weights
    let totalCompatibility = (
      baseScore * 0.4 +
      kalchmCompatibility * 0.3 +
      elementalCompatibility * 0.3
    );
    
    // Apply current conditions modifiers if provided
    if (currentConditions) {
      const conditionModifier = this.calculateConditionModifier(currentConditions, seasonProfile);
      totalCompatibility *= conditionModifier;
    }
    
    return Math.min(1.0, Math.max(0.0, totalCompatibility));
  }

  /**
   * Calculate elemental compatibility between ingredient and season
   */
  private calculateElementalSeasonalCompatibility(
    ingredientElements: ElementalProperties,
    seasonalElements: ElementalProperties
  ): number {
    // Following elemental self-reinforcement principles
    let compatibility = 0;
    let totalWeight = 0;
    
    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as Element[]) {
      const ingredientValue = ingredientElements[element];
      const seasonalValue = seasonalElements[element];
      
      if (ingredientValue > 0 && seasonalValue > 0) {
        // Same element reinforcement (0.9 compatibility)
        compatibility += ingredientValue * seasonalValue * 0.9;
        totalWeight += ingredientValue * seasonalValue;
      } else if (ingredientValue > 0 || seasonalValue > 0) {
        // Different elements still have good compatibility (0.7)
        const value = Math.max(ingredientValue, seasonalValue);
        compatibility += value * 0.7;
        totalWeight += value;
      }
    }
    
    return totalWeight > 0 ? compatibility / totalWeight : 0.7;
  }

  /**
   * Calculate condition modifier based on current astrological/environmental conditions
   */
  private calculateConditionModifier(
    conditions: {
      lunarPhase?: LunarPhase;
      planetaryHour?: PlanetName;
      temperature?: number;
    },
    seasonProfile: SeasonalProfile
  ): number {
    let modifier = 1.0;
    
    // Lunar phase modifier
    if (conditions.lunarPhase) {
      modifier *= (1 + seasonProfile.monicaModifiers.lunarPhaseBonus * 0.1);
    }
    
    // Planetary hour modifier
    if (conditions.planetaryHour) {
      modifier *= (1 + seasonProfile.monicaModifiers.planetaryAlignment * 0.1);
    }
    
    // Temperature modifier
    if (conditions.temperature) {
      const optimalTemp = 70 + seasonProfile?.monicaModifiers?.temperatureAdjustment;
      const tempDifference = Math.abs(conditions.temperature - optimalTemp);
      const tempModifier = Math.max(0.8, 1 - (tempDifference / 100));
      modifier *= tempModifier;
    }
    
    return modifier;
  }

  // ===== MONICA-ENHANCED SEASONAL RECOMMENDATIONS =====

  /**
   * Get seasonal recommendations with Monica optimization
   */
  getSeasonalRecommendations(
    season: Season,
    targetMonica?: number,
    kalchmRange?: { min: number; max: number }
  ): SeasonalRecommendations {
    const seasonProfile = unifiedSeasonalProfiles[season];
    
    // Use provided ranges or seasonal defaults
    const effectiveKalchmRange = kalchmRange || seasonProfile.kalchmRange;
    
    // Get compatible ingredients
    const compatibleIngredients = this.getSeasonalCompatibleIngredients(
      season,
      effectiveKalchmRange
    );
    
    // Get optimal cooking methods
    const optimalCookingMethods = this.getSeasonalOptimalCookingMethods(
      season,
      targetMonica
    );
    
    // Calculate optimization scores
    const monicaOptimization = this.calculateSeasonalMonicaOptimization(
      season,
      targetMonica,
      optimalCookingMethods
    );
    
    const kalchmHarmony = this.calculateSeasonalKalchmHarmony(
      compatibleIngredients,
      effectiveKalchmRange
    );
    
    return {
      ingredients: compatibleIngredients,
      cookingMethods: optimalCookingMethods,
      recipes: [], // Will be populated when recipe system is unified
      monicaOptimization,
      kalchmHarmony};
  }

  /**
   * Get ingredients compatible with seasonal Kalchm range
   */
  private getSeasonalCompatibleIngredients(
    season: Season,
    kalchmRange: { min: number; max: number }
  ): UnifiedIngredient[] {
    const seasonProfile = unifiedSeasonalProfiles[season];
    const compatibleIngredients: UnifiedIngredient[] = [];
    
    // Get ingredients that are in season
    const seasonalIngredientNames = Object.keys(seasonProfile.ingredients);
    
    for (const ingredientName of seasonalIngredientNames) {
      const ingredient = unifiedIngredients[ingredientName];
      if (!ingredient) continue;
      
      // Check Kalchm compatibility
      const kalchmCompatibility = this.calculateKalchmSeasonalCompatibility(
        ingredient.kalchm,
        season
      );
      
      // Check if within desired Kalchm range
      const inRange = ingredient.kalchm >= kalchmRange.min && ingredient.kalchm <= kalchmRange.max;
      
      if (kalchmCompatibility >= 0.7 || inRange) {
        compatibleIngredients?.push(ingredient as unknown as UnifiedIngredient);
      }
    }
    
    // Sort by seasonal score and Kalchm compatibility
    return compatibleIngredients.sort((a, b) => {
      const scoreA = this.getSeasonalScore(a.name, season) + 
                    this.calculateKalchmSeasonalCompatibility(a.kalchm, season);
      const scoreB = this.getSeasonalScore(b.name, season) + 
                    this.calculateKalchmSeasonalCompatibility(b.kalchm, season);
      return scoreB - scoreA;
    });
  }

  /**
   * Get optimal cooking methods for season with Monica integration
   */
  private getSeasonalOptimalCookingMethods(
    season: Season,
    targetMonica?: number
  ): EnhancedCookingMethod[] {
    const seasonProfile = unifiedSeasonalProfiles[season];
    const optimalMethods: EnhancedCookingMethod[] = [];
    
    // Get methods listed as optimal for the season
    for (const methodName of seasonProfile.optimalCookingMethods) {
      const enhancedMethod = this?.enhancedCookingMethods?.[methodName];
      if (enhancedMethod) {
        optimalMethods?.push(enhancedMethod);
      }
    }
    
    // If target Monica is specified, find compatible methods
    if (targetMonica !== undefined) {
      const monicaCompatibleMethods = getMonicaCompatibleCookingMethods(targetMonica);
      
      // Add Monica-compatible methods that aren't already included
      for (const method of monicaCompatibleMethods) {
        if (!optimalMethods.find(m => m.name === method.name)) {
          optimalMethods?.push(method);
        }
      }
    }
    
    // Sort by seasonal compatibility and Monica alignment
    return optimalMethods.sort((a, b) => {
      const scoreA = this.calculateMethodSeasonalScore(a, season, targetMonica);
      const scoreB = this.calculateMethodSeasonalScore(b, season, targetMonica);
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate cooking method seasonal compatibility score
   */
  private calculateMethodSeasonalScore(
    method: EnhancedCookingMethod,
    season: Season,
    targetMonica?: number
  ): number {
    const seasonProfile = unifiedSeasonalProfiles[season];
    let score = 0;
    
    // Base seasonal compatibility
    if (seasonProfile.optimalCookingMethods.includes(method.name)) {
      score += 1.0;
    }
    
    // Monica compatibility
    if (targetMonica !== undefined && !isNaN((method as any)?.monicaConstant)) {
      const monicaDifference = Math.abs((method as any).monicaConstant - targetMonica);
      score += Math.max(0, 1 - monicaDifference);
    }
    
    // Elemental compatibility
    const methodElement = (method as any)?.alchemicalPillar?.elementalAssociations?.primary;
    if (methodElement) {
      const elementalScore = seasonProfile?.elementalDominance?.[methodElement] || 0;
      score += elementalScore;
    }
    
    return score;
  }

  /**
   * Calculate seasonal Monica optimization score
   */
  private calculateSeasonalMonicaOptimization(
    season: Season,
    targetMonica: number | undefined,
    cookingMethods: EnhancedCookingMethod[]
  ): number {
    if (targetMonica === undefined || (cookingMethods || []).length === 0) {
      return 0.5; // Neutral optimization
    }
    
    const seasonProfile = unifiedSeasonalProfiles[season];
    let totalOptimization = 0;
    let validMethods = 0;
    
    for (const method of cookingMethods) {
      if (!isNaN((method as any)?.monicaConstant)) {
        const monicaDifference = Math.abs((method as any).monicaConstant - targetMonica);
        const methodOptimization = Math.max(0, 1 - monicaDifference);
        
        // Apply seasonal Monica modifiers
        const seasonalBonus = seasonProfile?.monicaModifiers?.lunarPhaseBonus;
        totalOptimization += methodOptimization * (1 + seasonalBonus * 0.2);
        validMethods++;
      }
    }
    
    return validMethods > 0 ? totalOptimization / validMethods : 0.5;
  }

  /**
   * Calculate seasonal Kalchm harmony score
   */
  private calculateSeasonalKalchmHarmony(
    ingredients: UnifiedIngredient[],
    kalchmRange: { min: number; max: number }
  ): number {
    if ((ingredients || []).length === 0) return 0.5;
    
    let totalHarmony = 0;
    
    for (const ingredient of ingredients) {
      // Calculate how well the ingredient fits the seasonal Kalchm range
      const kalchm = ingredient.kalchm;
      
      if (kalchm >= kalchmRange.min && kalchm <= kalchmRange.max) {
        // Perfect harmony if within range
        totalHarmony += 1.0;
      } else {
        // Partial harmony based on distance from range
        const distance = kalchm < kalchmRange.min 
          ? kalchmRange.min - kalchm 
          : kalchm - kalchmRange.max;
        
        const harmony = Math.max(0.1, Math.exp(-distance * 2));
        totalHarmony += harmony;
      }
    }
    
    return totalHarmony / (ingredients || []).length;
  }

  // ===== SEASONAL TRANSITION LOGIC =====

  /**
   * Calculate seasonal transition profile
   */
  calculateSeasonalTransition(
    fromSeason: Season,
    toSeason: Season,
    transitionProgress: number // 0-1
  ): SeasonalTransitionProfile {
    const fromProfile = unifiedSeasonalProfiles[fromSeason];
    const toProfile = unifiedSeasonalProfiles[toSeason];
    
    // Blend elemental profiles
    const blendedElementalProfile = this.blendElementalProperties(
      fromProfile.elementalDominance,
      toProfile.elementalDominance,
      transitionProgress
    );
    
    // Blend Kalchm ranges
    const blendedKalchmRange = {
      min: fromProfile.kalchmRange.min + 
           (toProfile.kalchmRange.min - fromProfile?.kalchmRange?.min) * transitionProgress,
      max: fromProfile.kalchmRange.max + 
           (toProfile.kalchmRange.max - fromProfile?.kalchmRange?.max) * transitionProgress
    };
    
    // Blend Monica modifiers
    const blendedMonicaModifiers = this.blendMonicaModifiers(
      fromProfile.monicaModifiers,
      toProfile.monicaModifiers,
      transitionProgress
    );
    
    // Get transitional recommendations
    const recommendedIngredients = this.getTransitionalIngredients(
      fromSeason,
      toSeason,
      transitionProgress
    );
    
    const recommendedCookingMethods = this.getTransitionalCookingMethods(
      fromSeason,
      toSeason,
      transitionProgress
    );
    
    return {
      fromSeason,
      toSeason,
      transitionProgress,
      blendedElementalProfile,
      blendedKalchmRange,
      blendedMonicaModifiers,
      recommendedIngredients,
      recommendedCookingMethods
    };
  }

  /**
   * Blend elemental properties between seasons
   */
  private blendElementalProperties(
    from: ElementalProperties,
    to: ElementalProperties,
    progress: number
  ): ElementalProperties {
    return { Fire: from.Fire + (to.Fire - from.Fire) * progress, Water: from.Water + (to.Water - from.Water) * progress, Earth: from.Earth + (to.Earth - from.Earth) * progress, Air: from.Air + (to.Air - from.Air) * progress
    };
  }

  /**
   * Blend Monica modifiers between seasons
   */
  private blendMonicaModifiers(
    from: SeasonalMonicaModifiers,
    to: SeasonalMonicaModifiers,
    progress: number
  ): SeasonalMonicaModifiers {
    return {
      temperatureAdjustment: from.temperatureAdjustment + 
                           (to.temperatureAdjustment - from.temperatureAdjustment) * progress,
      timingAdjustment: from.timingAdjustment + 
                       (to.timingAdjustment - from.timingAdjustment) * progress,
      intensityModifier: progress < 0.5 ? from.intensityModifier : to.intensityModifier,
      planetaryAlignment: from.planetaryAlignment + 
                         (to.planetaryAlignment - from.planetaryAlignment) * progress,
      lunarPhaseBonus: from.lunarPhaseBonus + 
                      (to.lunarPhaseBonus - from.lunarPhaseBonus) * progress
    };
  }

  /**
   * Get ingredients suitable for seasonal transition
   */
  private getTransitionalIngredients(
    fromSeason: Season,
    toSeason: Season,
    progress: number
  ): UnifiedIngredient[] {
    const fromIngredients = this.getSeasonalCompatibleIngredients(fromSeason, 
      unifiedSeasonalProfiles[fromSeason].kalchmRange);
    const toIngredients = this.getSeasonalCompatibleIngredients(toSeason, 
      unifiedSeasonalProfiles[toSeason].kalchmRange);
    
    // Combine and weight based on transition progress
    const transitionalIngredients: UnifiedIngredient[] = [];
    
    // Add ingredients from departing season (weighted by 1-progress)
    for (const ingredient of fromIngredients?.slice(0, 10)) {
      if (Math.random() < (1 - progress)) {
        transitionalIngredients?.push(ingredient);
      }
    }
    
    // Add ingredients from arriving season (weighted by progress)
    for (const ingredient of toIngredients?.slice(0, 10)) {
      if (Math.random() < progress && 
          !transitionalIngredients.find(i => i.name === ingredient.name)) {
        transitionalIngredients?.push(ingredient);
      }
    }
    
    return transitionalIngredients;
  }

  /**
   * Get cooking methods suitable for seasonal transition
   */
  private getTransitionalCookingMethods(
    fromSeason: Season,
    toSeason: Season,
    progress: number
  ): EnhancedCookingMethod[] {
    const fromMethods = this.getSeasonalOptimalCookingMethods(fromSeason);
    const toMethods = this.getSeasonalOptimalCookingMethods(toSeason);
    
    const transitionalMethods: EnhancedCookingMethod[] = [];
    
    // Add methods from departing season
    for (const method of fromMethods?.slice(0, 3)) {
      if (Math.random() < (1 - progress)) {
        transitionalMethods?.push(method);
      }
    }
    
    // Add methods from arriving season
    for (const method of toMethods?.slice(0, 3)) {
      if (Math.random() < progress && 
          !transitionalMethods.find(m => m.name === method.name)) {
        transitionalMethods?.push(method);
      }
    }
    
    return transitionalMethods;
  }
}

// ===== UNIFIED SEASONAL SYSTEM INSTANCE =====

export const unifiedSeasonalSystem = new UnifiedSeasonalSystem();

// ===== BACKWARD COMPATIBILITY EXPORTS =====

// Export functions that match the original seasonal.ts interface
export const getCurrentSeason = () => unifiedSeasonalSystem.getCurrentSeason();
export const getSeasonalScore = (ingredientName: string, season?: Season) => 
  unifiedSeasonalSystem.getSeasonalScore(ingredientName, season);
export const getSeasonalData = (ingredientName: string, season?: Season) => 
  unifiedSeasonalSystem.getSeasonalIngredientProfile(ingredientName, season);
export const isInSeason = (ingredientName: string, threshold?: number) => 
  unifiedSeasonalSystem.isInSeason(ingredientName, threshold);
export const getSeasonalRecommendations = (season: Season, targetMonica?: number, kalchmRange?: { min: number; max: number }) => 
  unifiedSeasonalSystem.getSeasonalRecommendations(season, targetMonica, kalchmRange);

// Export consolidated data for backward compatibility
export const seasonalPatterns = Object.fromEntries(
  Object.entries(unifiedSeasonalProfiles || {}).map(([season, profile]) => [
    season,
    {
      ...profile.ingredients,
      elementalInfluence: profile.elementalInfluence,
      tarotInfluences: profile.tarotProfile.tarotInfluences
    }
  ])
);

export const seasonalUsage = Object.fromEntries(
  Object.entries(unifiedSeasonalProfiles || {}).map(([season, profile]) => [
    season,
    {
      growing: profile.growing,
      herbs: profile.herbs,
      vegetables: profile.vegetables,
      cuisines: profile.cuisines,
      tarotAssociations: {
        minorArcana: profile?.tarotProfile?.minorArcana,
        majorArcana: profile?.tarotProfile?.majorArcana,
        currentZodiacSigns: profile?.tarotProfile?.currentZodiacSigns,
        cookingRecommendations: profile.tarotProfile.cookingRecommendations
      }
    }
  ])
);

// Export helper functions from original seasonalPatterns.ts
export function getTarotInfluenceForSeason(season: Season) {
  return unifiedSeasonalProfiles[season]?.tarotProfile.tarotInfluences || {};
}

export function getSeasonalIngredientsByTarotCard(season: Season, cardKey: string): string[] {
  const tarotInfluence = unifiedSeasonalProfiles[season]?.tarotProfile?.tarotInfluences?.[cardKey];
  if (tarotInfluence && typeof tarotInfluence === 'object' && 'ingredients' in tarotInfluence) {
    return tarotInfluence.ingredients;
  }
  return [];
}

export function getRecommendedCookingMethodByTarotCard(season: Season, cardKey: string): string {
  const tarotInfluence = unifiedSeasonalProfiles[season]?.tarotProfile?.tarotInfluences?.[cardKey];
  if (tarotInfluence && typeof tarotInfluence === 'object' && 'cookingMethod' in tarotInfluence) {
    return tarotInfluence.cookingMethod as unknown as string;
  }
  return '';
}

// Export helper functions from original seasonalUsage.ts
export function getSeasonalUsageData(ingredient: string, season: Season) {
  const seasonProfile = unifiedSeasonalProfiles[season];
  if (!seasonProfile) return { inGrowing: false, inHerbs: false, inVegetables: false };
  
  return {
    inGrowing: seasonProfile.growing && seasonProfile.growing.includes(ingredient),
    inHerbs: seasonProfile.herbs && seasonProfile.herbs.includes(ingredient),
    inVegetables: seasonProfile.vegetables && seasonProfile.vegetables.includes(ingredient)
  };
}

export function getTarotRecommendationsForSeason(season: Season) {
  return unifiedSeasonalProfiles[season]?.tarotProfile.cookingRecommendations || [];
}

export function getMinorArcanaForSeason(season: Season) {
  return unifiedSeasonalProfiles[season]?.tarotProfile.minorArcana || [];
}

export function getMajorArcanaForSeason(season: Season) {
  return unifiedSeasonalProfiles[season]?.tarotProfile.majorArcana || [];
}

// ===== EXPORTS =====

export default unifiedSeasonalSystem;
 