// src/config/defaults.ts

import type { FilterOptions, NutritionPreferences, Element, Season } from '../types/alchemy';

export const DEFAULT_FILTERS: FilterOptions = {
  cookingTime: 'any',
  elementalFocus: null,
  mealType: 'any',
  seasonality: null,
  difficulty: 'any'
} as unknown as FilterOptions;

// CONFIGURATION INTELLIGENCE SYSTEM
export const CONFIGURATION_INTELLIGENCE = {
  analyzeDietaryPreferences: (preferences: typeof DEFAULT_DIETARY_PREFERENCES = DEFAULT_DIETARY_PREFERENCES) => {
    const activeRestrictions = Object.entries(preferences).filter(([_, active]) => active).map(([key]) => key);
    const restrictionComplexity = activeRestrictions.length;
    const compatibilityMatrix = {
      vegetarian: ['vegan'],
      vegan: ['vegetarian', 'dairyFree'],
      glutenFree: [],
      dairyFree: ['vegan']
    };
    
    return {
      activeRestrictions,
      restrictionComplexity,
      compatibilityScore: activeRestrictions.reduce((score, restriction) => {
        const compatible = compatibilityMatrix[restriction as keyof typeof compatibilityMatrix] || [];
        return score + compatible.filter(comp => activeRestrictions.includes(comp)).length;
      }, 0),
      recommendedCuisines: activeRestrictions.includes('vegan') ? ['Mediterranean', 'Indian', 'Thai'] : 
                          activeRestrictions.includes('glutenFree') ? ['Mexican', 'Asian', 'Paleo'] : ['Global'],
      adaptabilityIndex: Math.max(0, 1 - (restrictionComplexity * 0.15))
    };
  },

  analyzeTimePreferences: (preferences: typeof DEFAULT_TIME_PREFERENCES = DEFAULT_TIME_PREFERENCES) => {
    const timeProfile = Object.entries(preferences).filter(([_, active]) => active).map(([key]) => key);
    const urgencyLevel = timeProfile.includes('quick') ? 'high' : timeProfile.includes('medium') ? 'moderate' : 'relaxed';
    const planningHorizon = {
      quick: 'immediate',
      medium: 'daily',
      long: 'weekly'
    };
    
    return {
      timeProfile,
      urgencyLevel,
      planningHorizon: timeProfile.map(t => planningHorizon[t as keyof typeof planningHorizon]),
      cookingReadiness: timeProfile.length > 0 ? 'specified' : 'flexible',
      efficiencyScore: timeProfile.includes('quick') ? 0.9 : timeProfile.includes('medium') ? 0.7 : 0.5,
      recommendedMealTypes: timeProfile.includes('quick') ? ['salads', 'stir-fries', 'sandwiches'] :
                           timeProfile.includes('long') ? ['stews', 'roasts', 'complex dishes'] : ['balanced meals']
    };
  },

  analyzeSpicePreferences: (preferences: typeof DEFAULT_SPICE_PREFERENCES = DEFAULT_SPICE_PREFERENCES) => {
    const spiceProfile = Object.entries(preferences).filter(([_, active]) => active).map(([key]) => key);
    const heatTolerance = spiceProfile.includes('spicy') ? 'high' : spiceProfile.includes('medium') ? 'moderate' : 'low';
    const flavorAdventure = spiceProfile.length > 1 ? 'exploratory' : spiceProfile.length === 1 ? 'focused' : 'neutral';
    
    return {
      spiceProfile,
      heatTolerance,
      flavorAdventure,
      cuisineCompatibility: {
        mild: ['American', 'European', 'Japanese'],
        medium: ['Mediterranean', 'Mexican', 'Chinese'],
        spicy: ['Indian', 'Thai', 'Korean', 'Ethiopian']
      },
      spiceRecommendations: spiceProfile.includes('spicy') ? ['cayenne', 'habanero', 'ghost pepper'] :
                           spiceProfile.includes('medium') ? ['paprika', 'chili powder', 'black pepper'] :
                           ['herbs', 'garlic', 'ginger'],
      adaptationStrategy: heatTolerance === 'high' ? 'aggressive seasoning' : 'gradual introduction'
    };
  },

  analyzeTemperaturePreferences: (preferences: typeof DEFAULT_TEMPERATURE_PREFERENCES = DEFAULT_TEMPERATURE_PREFERENCES) => {
    const tempProfile = Object.entries(preferences).filter(([_, active]) => active).map(([key]) => key);
    const seasonalAlignment = {
      hot: ['winter', 'fall'],
      cold: ['summer', 'spring']
    };
    
    return {
      tempProfile,
      seasonalAlignment: tempProfile.flatMap(t => seasonalAlignment[t as keyof typeof seasonalAlignment] || []),
      cookingMethods: {
        hot: ['grilling', 'roasting', 'slow-cooking', 'stir-frying'],
        cold: ['raw preparation', 'chilling', 'refrigeration', 'freezing']
      },
      nutritionalImpact: tempProfile.includes('hot') ? 'warming spices, cooked nutrients' : 'fresh vitamins, raw enzymes',
      energeticEffect: tempProfile.includes('hot') ? 'warming, stimulating' : 'cooling, refreshing',
      mealTypeAlignment: tempProfile.includes('hot') ? ['soups', 'stews', 'hot entrées'] : ['salads', 'smoothies', 'cold appetizers']
    };
  }
};

// Separate dietary preferences - these are no longer part of FilterOptions
export const DEFAULT_DIETARY_PREFERENCES = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
};

// Separate time preferences
export const DEFAULT_TIME_PREFERENCES = {
  quick: false,
  medium: false,
  long: false,
};

// Separate spice preferences
export const DEFAULT_SPICE_PREFERENCES = {
  mild: false,
  medium: false,
  spicy: false,
};

// Separate temperature preferences
export const DEFAULT_TEMPERATURE_PREFERENCES = {
  hot: false,
  cold: false,
};

export const DEFAULT_NUTRITION_PREFS: NutritionPreferences = {
  calories: { min: 1800, max: 2200 },
  macros: {
    protein: 50,
    carbs: 250,
    fat: 70
  },
  dietaryRestrictions: ['balanced']
};

// TEMPORAL INTELLIGENCE PLATFORM
export const TEMPORAL_INTELLIGENCE = {
  analyzeTimeRanges: (ranges: typeof TIME_RANGES = TIME_RANGES) => {
    const timeDistribution = Object.entries(ranges).map(([category, minutes]) => ({
      category,
      minutes,
      hours: Math.round(minutes / 60 * 100) / 100,
      complexity: minutes <= 30 ? 'simple' : minutes <= 60 ? 'moderate' : 'complex',
      urgency: minutes <= 30 ? 'high' : minutes <= 60 ? 'medium' : 'low'
    }));
    
    return {
      timeDistribution,
      averageTime: Object.values(ranges).reduce((sum, time) => sum + time, 0) / Object.values(ranges).length,
      timeSpread: Math.max(...Object.values(ranges)) - Math.min(...Object.values(ranges)),
      cookingCategories: {
        express: ranges.quick,
        standard: ranges.medium,
        elaborate: ranges.long
      },
      efficiencyMetrics: timeDistribution.map(t => ({
        category: t.category,
        efficiency: 1 / (t.minutes / 30),
        planning: t.minutes > 60 ? 'advance' : 'immediate'
      }))
    };
  },

  analyzeMealPeriods: (periods: typeof MEAL_PERIODS = MEAL_PERIODS) => {
    const periodAnalysis = Object.entries(periods).map(([meal, timeRange]) => {
      const duration = timeRange.end > timeRange.start ? 
        timeRange.end - timeRange.start : 
        (24 - timeRange.start) + timeRange.end;
      
      return {
        meal,
        timeRange,
        duration,
        metabolicWindow: meal === 'breakfast' ? 'activation' : meal === 'lunch' ? 'sustenance' : 'restoration',
        energyNeeds: meal === 'breakfast' ? 'quick energy' : meal === 'lunch' ? 'sustained energy' : 'gentle nourishment'
      };
    });
    
    return {
      periodAnalysis,
      totalCoverage: periodAnalysis.reduce((sum, p) => sum + p.duration, 0),
      mealDistribution: periodAnalysis.map(p => ({ meal: p.meal, percentage: (p.duration / 24) * 100 })),
      chronoNutrition: {
        morning: 'proteins and complex carbs',
        midday: 'balanced macronutrients',
        evening: 'lighter, easier digestion'
      },
      optimalTiming: periodAnalysis.reduce((acc, p) => ({ ...acc, [p.meal]: p.timeRange }), {})
    };
  }
};

// ELEMENTAL INTELLIGENCE NETWORK
export const ELEMENTAL_INTELLIGENCE = {
  analyzeElementalDefaults: (defaults: typeof ELEMENTAL_DEFAULTS = ELEMENTAL_DEFAULTS) => {
    const elementalBalance = Object.entries(defaults).map(([element, value]) => ({
      element,
      proportion: value,
      percentage: value * 100,
      dominance: value > 0.25 ? 'strong' : value === 0.25 ? 'balanced' : 'weak',
      energetic: element === 'Fire' || element === 'Air' ? 'active' : 'passive'
    }));
    
    const balanceMetrics = {
      isBalanced: Object.values(defaults).every(v => v === 0.25),
      variance: Object.values(defaults).reduce((sum, v) => sum + Math.pow(v - 0.25, 2), 0) / 4,
      dominantElement: Object.entries(defaults).reduce((max, [element, value]) => 
        value > max.value ? { element, value } : max, { element: '', value: 0 }),
      activePassiveRatio: (defaults.Fire + defaults.Air) / (defaults.Water + defaults.Earth)
    };
    
    return {
      elementalBalance,
      balanceMetrics,
      seasonalAlignment: {
        spring: defaults.Air * 0.4 + defaults.Water * 0.3,
        summer: defaults.Fire * 0.4 + defaults.Air * 0.3,
        fall: defaults.Earth * 0.4 + defaults.Fire * 0.3,
        winter: defaults.Water * 0.4 + defaults.Earth * 0.3
      },
      cookingRecommendations: {
        Fire: ['grilling', 'roasting', 'searing'],
        Water: ['steaming', 'boiling', 'poaching'],
        Air: ['whipping', 'rising', 'fermentation'],
        Earth: ['slow cooking', 'braising', 'root vegetables']
      },
      nutritionalFocus: elementalBalance.map(e => ({
        element: e.element,
        nutrients: {
          Fire: 'proteins, spices',
          Water: 'hydration, minerals',
          Air: 'light foods, leafy greens',
          Earth: 'grounding foods, root vegetables'
        }[e.element as keyof typeof defaults]
      }))
    };
  }
};

export const TIME_RANGES = {
  quick: 30,
  medium: 60,
  long: 61
};

export const MEAL_PERIODS = {
  breakfast: { start: 5, end: 11 },
  lunch: { start: 11, end: 16 },
  dinner: { start: 16, end: 5 }
};

export const ELEMENTAL_DEFAULTS = {
  Fire: 0.25,
  Water: 0.25,
  Air: 0.25,
  Earth: 0.25
};

// DEMONSTRATION PLATFORM FOR CONFIGURATION INTELLIGENCE
export const CONFIGURATION_INTELLIGENCE_DEMO = {
  runFullAnalysis: () => {
    console.log('🔧 Configuration Intelligence Systems Analysis');
    
    const dietaryAnalysis = CONFIGURATION_INTELLIGENCE.analyzeDietaryPreferences();
    console.log('📋 Dietary Analysis:', dietaryAnalysis);
    
    const timeAnalysis = CONFIGURATION_INTELLIGENCE.analyzeTimePreferences();
    console.log('⏰ Time Analysis:', timeAnalysis);
    
    const spiceAnalysis = CONFIGURATION_INTELLIGENCE.analyzeSpicePreferences();
    console.log('🌶️ Spice Analysis:', spiceAnalysis);
    
    const tempAnalysis = CONFIGURATION_INTELLIGENCE.analyzeTemperaturePreferences();
    console.log('🌡️ Temperature Analysis:', tempAnalysis);
    
    const temporalAnalysis = TEMPORAL_INTELLIGENCE.analyzeTimeRanges();
    console.log('📅 Temporal Analysis:', temporalAnalysis);
    
    const mealAnalysis = TEMPORAL_INTELLIGENCE.analyzeMealPeriods();
    console.log('🍽️ Meal Period Analysis:', mealAnalysis);
    
    const elementalAnalysis = ELEMENTAL_INTELLIGENCE.analyzeElementalDefaults();
    console.log('🔮 Elemental Analysis:', elementalAnalysis);
    
    return {
      configuration: { dietaryAnalysis, timeAnalysis, spiceAnalysis, tempAnalysis },
      temporal: { temporalAnalysis, mealAnalysis },
      elemental: { elementalAnalysis },
      totalSystems: 3,
      analysisComplete: true
    };
  }
};

// Export configuration intelligence systems for use in the WhatToEatNext project
// (CONFIGURATION_INTELLIGENCE_DEMO is already exported above)

// Alternative export for backward compatibility
export const CONFIG_INTELLIGENCE_SUITE = {
  demo: CONFIGURATION_INTELLIGENCE_DEMO
};

// Export for direct usage in configuration demonstrations
export const CONFIG_DEMO_SYSTEMS = {
  DEMO: CONFIGURATION_INTELLIGENCE_DEMO
};