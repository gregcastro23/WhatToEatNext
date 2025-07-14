import { AstrologicalState } from '@/types/celestial';

import { _LunarPhase, ZodiacSign, PlanetaryAspect, _ElementalProperties } from '@/types/alchemy';
import { LUNAR_PHASES } from '@/constants/lunar';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '@/data/planetaryFlavorProfiles';
import { allIngredients } from '@/data/ingredients';
import {
  _calculateLunarPhase,
  _calculatePlanetaryPositions,
  calculatePlanetaryAspects,
} from "@/utils/astrologyUtils";
// Import the planet data
import venusData from '@/data/planets/venus';
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import jupiterData from '@/data/planets/jupiter';

// === ENTERPRISE CULTURAL INTELLIGENCE SYSTEM ===
// Phase 14 Import Restoration: Advanced Cuisine Analysis

// Enhanced Planetary Data with Cultural Intelligence
const enterprisePlanetaryData = {
  // Advanced planetary flavor integration
  venus: {
    ...venusData,
    culturalInfluence: {
      cuisines: ['French', 'Italian', 'Thai', 'Mediterranean'],
      flavorPreferences: { sweet: 0.8, aromatic: 0.9, delicate: 0.7 },
      cookingStyles: ['refined', 'artistic', 'harmonious'],
      ingredients: venusData.foodAssociations || ['fruits', 'dairy', 'sweets']
    }
  },
  mars: {
    ...marsData,
    culturalInfluence: {
      cuisines: ['Mexican', 'Indian', 'Korean', 'Cajun'],
      flavorPreferences: { spicy: 0.9, bold: 0.8, intense: 0.8 },
      cookingStyles: ['grilling', 'high-heat', 'aggressive'],
      ingredients: marsData.foodAssociations || ['proteins', 'peppers', 'spices']
    }
  },
  mercury: {
    ...mercuryData,
    culturalInfluence: {
      cuisines: ['Japanese', 'Vietnamese', 'Modern Fusion'],
      flavorPreferences: { fresh: 0.8, light: 0.7, complex: 0.6 },
      cookingStyles: ['quick', 'versatile', 'innovative'],
      ingredients: mercuryData.foodAssociations || ['herbs', 'vegetables', 'seafood']
    }
  },
  jupiter: {
    ...jupiterData,
    culturalInfluence: {
      cuisines: ['Middle Eastern', 'Turkish', 'Moroccan'],
      flavorPreferences: { rich: 0.9, abundant: 0.8, celebratory: 0.7 },
      cookingStyles: ['slow-cooking', 'abundant', 'ceremonial'],
      ingredients: jupiterData.foodAssociations || ['grains', 'legumes', 'nuts']
    }
  },
  // Enhanced mock data with cultural intelligence
  flavorProfiles: {
    sweet: 0.7,
    sour: 0.4,
    salty: 0.5, 
    bitter: 0.2,
    umami: 0.6,
    spicy: 0.3
  },
  foodAssociations: ["vegetables", "grains", "fruits", "proteins"],
  herbalAssociations: { Herbs: ["basil", "thyme", "mint", "rosemary"] },
  // NEW: Advanced cultural analysis features
  culturalIntelligence: {
    regionalMapping: new Map(),
    seasonalAdaptations: new Map(),
    lunarPhaseInfluences: new Map(),
    astrologicalCompatibility: new Map()
  }
};

// === ADVANCED LUNAR PHASE CUISINE INTELLIGENCE ===
const lunarPhaseCuisineIntelligence = {
  analyzePhaseCuisineCompatibility: (phase: _LunarPhase): {
    recommendedCuisines: string[];
    cookingMethods: string[];
    ingredients: string[];
    culturalTraditions: string[];
  } => {
    const phaseMapping = {
      'new moon': {
        recommendedCuisines: ['Minimalist', 'Clean', 'Detox', 'Raw'],
        cookingMethods: ['steaming', 'raw preparation', 'light cooking'],
        ingredients: ['fresh herbs', 'cleansing foods', 'spring water'],
        culturalTraditions: ['Ayurvedic', 'Traditional Chinese', 'Nordic']
      },
      'waxing crescent': {
        recommendedCuisines: ['Fresh', 'Growth-oriented', 'Energizing'],
        cookingMethods: ['light sautéing', 'quick cooking', 'sprouting'],
        ingredients: ['sprouts', 'young vegetables', 'building foods'],
        culturalTraditions: ['Mediterranean', 'Japanese', 'Californian']
      },
      'first quarter': {
        recommendedCuisines: ['Balanced', 'Strengthening', 'Nourishing'],
        cookingMethods: ['balanced cooking', 'moderate heat', 'combination methods'],
        ingredients: ['balanced proteins', 'whole grains', 'seasonal vegetables'],
        culturalTraditions: ['French', 'Italian', 'American Regional']
      },
      'waxing gibbous': {
        recommendedCuisines: ['Rich', 'Abundant', 'Celebratory'],
        cookingMethods: ['slow cooking', 'braising', 'roasting'],
        ingredients: ['rich proteins', 'abundant vegetables', 'festive spices'],
        culturalTraditions: ['Middle Eastern', 'Indian', 'Mexican']
      },
      'full moon': {
        recommendedCuisines: ['Peak Flavor', 'Intense', 'Transformative'],
        cookingMethods: ['high-heat cooking', 'fermentation', 'intense preparation'],
        ingredients: ['peak-flavor ingredients', 'fermented foods', 'intense spices'],
        culturalTraditions: ['Korean', 'Thai', 'Cajun']
      },
      'waning gibbous': {
        recommendedCuisines: ['Grounding', 'Satisfying', 'Comfort'],
        cookingMethods: ['comfort cooking', 'hearty preparation', 'traditional methods'],
        ingredients: ['comfort foods', 'grounding ingredients', 'traditional spices'],
        culturalTraditions: ['British', 'German', 'American Comfort']
      },
      'last quarter': {
        recommendedCuisines: ['Releasing', 'Cleansing', 'Simplifying'],
        cookingMethods: ['simple cooking', 'cleansing preparation', 'light methods'],
        ingredients: ['cleansing herbs', 'simple ingredients', 'purifying foods'],
        culturalTraditions: ['Macrobiotic', 'Zen', 'Scandinavian']
      },
      'waning crescent': {
        recommendedCuisines: ['Restorative', 'Gentle', 'Healing'],
        cookingMethods: ['gentle cooking', 'healing preparation', 'restorative methods'],
        ingredients: ['healing herbs', 'gentle foods', 'restorative ingredients'],
        culturalTraditions: ['Ayurvedic', 'Traditional Healing', 'Gentle Asian']
      }
    };
    
    return phaseMapping[phase] || phaseMapping['new moon'];
  },
  
  calculateLunarPhaseOptimization: (currentPhase: _LunarPhase, targetCuisine: string): number => {
    const phaseCompatibility = lunarPhaseCuisineIntelligence.analyzePhaseCuisineCompatibility(currentPhase);
    const isRecommended = phaseCompatibility.recommendedCuisines.some(cuisine => 
      cuisine.toLowerCase().includes(targetCuisine.toLowerCase()) ||
      targetCuisine.toLowerCase().includes(cuisine.toLowerCase())
    );
    
    return isRecommended ? 0.9 : 0.6;
  }
};

// === ZODIAC SIGN CUISINE INTELLIGENCE ===
const zodiacCuisineIntelligence = {
  getSignCuisinePreferences: (sign: ZodiacSign): {
    preferredCuisines: string[];
    flavorPreferences: Record<string, number>;
    cookingStyles: string[];
    culturalAffinities: string[];
    elementalInfluence: _ElementalProperties;
  } => {
    const zodiacMapping = {
      'aries': {
        preferredCuisines: ['Mexican', 'Indian', 'Korean', 'Cajun'],
        flavorPreferences: { spicy: 0.9, bold: 0.8, quick: 0.7 },
        cookingStyles: ['grilling', 'quick-cooking', 'high-heat'],
        culturalAffinities: ['Bold cuisines', 'Spicy traditions'],
        elementalInfluence: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 } as _ElementalProperties
      },
      'taurus': {
        preferredCuisines: ['French', 'Italian', 'Comfort Food'],
        flavorPreferences: { rich: 0.9, comforting: 0.8, traditional: 0.7 },
        cookingStyles: ['slow-cooking', 'traditional', 'hearty'],
        culturalAffinities: ['European traditions', 'Comfort cuisines'],
        elementalInfluence: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } as _ElementalProperties
      },
      'gemini': {
        preferredCuisines: ['Fusion', 'Light Asian', 'Modern'],
        flavorPreferences: { variety: 0.9, light: 0.7, innovative: 0.8 },
        cookingStyles: ['quick-cooking', 'versatile', 'experimental'],
        culturalAffinities: ['Modern fusion', 'Light Asian'],
        elementalInfluence: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } as _ElementalProperties
      },
      'cancer': {
        preferredCuisines: ['Home-style', 'Traditional', 'Comfort'],
        flavorPreferences: { comforting: 0.9, nurturing: 0.8, traditional: 0.7 },
        cookingStyles: ['home-style', 'nurturing', 'traditional'],
        culturalAffinities: ['Family traditions', 'Home cuisines'],
        elementalInfluence: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } as _ElementalProperties
      },
      'leo': {
        preferredCuisines: ['Mediterranean', 'Glamorous', 'Presentation-focused'],
        flavorPreferences: { dramatic: 0.9, presentation: 0.8, bold: 0.7 },
        cookingStyles: ['dramatic', 'presentation-focused', 'entertaining'],
        culturalAffinities: ['Mediterranean', 'Glamorous dining'],
        elementalInfluence: { Fire: 0.8, Water: 0.05, Earth: 0.1, Air: 0.05 } as _ElementalProperties
      },
      'virgo': {
        preferredCuisines: ['Clean', 'Healthy', 'Precise'],
        flavorPreferences: { clean: 0.9, healthy: 0.8, precise: 0.7 },
        cookingStyles: ['precise', 'healthy', 'clean'],
        culturalAffinities: ['Health-focused', 'Clean cuisines'],
        elementalInfluence: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } as _ElementalProperties
      },
      'libra': {
        preferredCuisines: ['Balanced', 'Aesthetic', 'Harmonious'],
        flavorPreferences: { balanced: 0.9, aesthetic: 0.8, harmonious: 0.7 },
        cookingStyles: ['balanced', 'aesthetic', 'harmonious'],
        culturalAffinities: ['Balanced cuisines', 'Aesthetic dining'],
        elementalInfluence: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } as _ElementalProperties
      },
      'scorpio': {
        preferredCuisines: ['Intense', 'Mysterious', 'Transformative'],
        flavorPreferences: { intense: 0.9, mysterious: 0.8, transformative: 0.7 },
        cookingStyles: ['intense', 'transformative', 'mysterious'],
        culturalAffinities: ['Intense cuisines', 'Mysterious traditions'],
        elementalInfluence: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } as _ElementalProperties
      },
      'sagittarius': {
        preferredCuisines: ['International', 'Adventurous', 'Exotic'],
        flavorPreferences: { adventurous: 0.9, international: 0.8, exotic: 0.7 },
        cookingStyles: ['adventurous', 'international', 'exotic'],
        culturalAffinities: ['International cuisines', 'Exotic traditions'],
        elementalInfluence: { Fire: 0.8, Water: 0.05, Earth: 0.1, Air: 0.05 } as _ElementalProperties
      },
      'capricorn': {
        preferredCuisines: ['Traditional', 'Structured', 'Quality'],
        flavorPreferences: { traditional: 0.9, structured: 0.8, quality: 0.7 },
        cookingStyles: ['traditional', 'structured', 'quality-focused'],
        culturalAffinities: ['Traditional cuisines', 'Quality dining'],
        elementalInfluence: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } as _ElementalProperties
      },
      'aquarius': {
        preferredCuisines: ['Innovative', 'Unique', 'Future-focused'],
        flavorPreferences: { innovative: 0.9, unique: 0.8, future: 0.7 },
        cookingStyles: ['innovative', 'unique', 'experimental'],
        culturalAffinities: ['Innovative cuisines', 'Future dining'],
        elementalInfluence: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } as _ElementalProperties
      },
      'pisces': {
        preferredCuisines: ['Intuitive', 'Flowing', 'Spiritual'],
        flavorPreferences: { intuitive: 0.9, flowing: 0.8, spiritual: 0.7 },
        cookingStyles: ['intuitive', 'flowing', 'spiritual'],
        culturalAffinities: ['Intuitive cuisines', 'Spiritual traditions'],
        elementalInfluence: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } as _ElementalProperties
      }
    };
    
    return zodiacMapping[sign] || zodiacMapping['aries'];
  }
};

// === PLANETARY ASPECT CUISINE ANALYSIS ===
const planetaryAspectCuisineAnalyzer = {
  analyzeCuisineCompatibility: (aspect: PlanetaryAspect): {
    enhancedCuisines: string[];
    challengedCuisines: string[];
    cookingRecommendations: string[];
    flavorAdjustments: Record<string, number>;
  } => {
    const aspectAnalysis = {
      conjunction: {
        enhancedCuisines: ['Fusion', 'Integrated', 'Unified'],
        challengedCuisines: [],
        cookingRecommendations: ['Combine complementary techniques', 'Unified flavor profiles'],
        flavorAdjustments: { harmony: 0.9, integration: 0.8 }
      },
      opposition: {
        enhancedCuisines: ['Contrasting', 'Balance-focused'],
        challengedCuisines: ['Unified', 'Simple'],
        cookingRecommendations: ['Balance opposing flavors', 'Use contrasting techniques'],
        flavorAdjustments: { contrast: 0.8, balance: 0.9 }
      },
      trine: {
        enhancedCuisines: ['Harmonious', 'Flowing', 'Natural'],
        challengedCuisines: [],
        cookingRecommendations: ['Natural preparation methods', 'Harmonious combinations'],
        flavorAdjustments: { flow: 0.9, natural: 0.8 }
      },
      square: {
        enhancedCuisines: ['Challenging', 'Dynamic', 'Energetic'],
        challengedCuisines: ['Delicate', 'Subtle'],
        cookingRecommendations: ['Dynamic cooking methods', 'Bold flavor combinations'],
        flavorAdjustments: { dynamic: 0.8, energy: 0.7 }
      }
    };
    
    return aspectAnalysis[aspect.aspectType as keyof typeof aspectAnalysis] || aspectAnalysis.conjunction;
  }
};

// === ENHANCED ELEMENTAL PROPERTIES INTEGRATION ===
const enhancedElementalCuisineAnalyzer = {
  analyzeElementalCuisineMatch: (cuisineProps: _ElementalProperties, userProps: _ElementalProperties): {
    compatibility: number;
    dominantElement: keyof _ElementalProperties;
    recommendations: string[];
    culturalSuggestions: string[];
  } => {
    let compatibility = 0;
    let dominantElement: keyof _ElementalProperties = 'Fire';
    let maxValue = 0;
    
    Object.entries(cuisineProps).forEach(([element, value]) => {
      const userValue = userProps[element as keyof _ElementalProperties] || 0;
      const elementCompatibility = 1 - Math.abs(value - userValue);
      compatibility += elementCompatibility;
      
      if (value > maxValue) {
        maxValue = value;
        dominantElement = element as keyof _ElementalProperties;
      }
    });
    
    compatibility = compatibility / 4; // Average of all elements
    
    const elementRecommendations = {
      Fire: ['Spicy cuisines', 'Grilled foods', 'High-energy cooking'],
      Water: ['Cooling cuisines', 'Steamed foods', 'Flowing preparations'],
      Earth: ['Grounding cuisines', 'Root vegetables', 'Stable preparations'],
      Air: ['Light cuisines', 'Fresh foods', 'Airy preparations']
    };
    
    const culturalSuggestions = {
      Fire: ['Mexican', 'Indian', 'Thai', 'Cajun'],
      Water: ['Japanese', 'Scandinavian', 'Raw foods'],
      Earth: ['Mediterranean', 'German', 'Traditional'],
      Air: ['Fusion', 'Modern', 'Light Asian']
    };
    
    return {
      compatibility,
      dominantElement,
      recommendations: elementRecommendations[dominantElement] || [],
      culturalSuggestions: culturalSuggestions[dominantElement] || []
    };
  }
};

// Add type guard after imports
function isSauceData(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Export the function that was previously defined but not exported
// === ENTERPRISE CULTURAL INTELLIGENCE SAUCE RECOMMENDATIONS ===
export function generateTopSauceRecommendations(currentElementalProfile = null, count = 5) {
  // Import sauce data
  const { allSauces } = require('@/data/sauces');
  
  // Use provided elemental profile from current moment's calculations, only fall back if absolutely necessary
  const userProfile = currentElementalProfile || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // === ENHANCED PLANETARY AND LUNAR CALCULATIONS ===
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Get planetary day influence
  const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const currentPlanetaryDay = planetaryDays[dayOfWeek];
  
  // Calculate current lunar phase
  const currentLunarPhase = _calculateLunarPhase(now) || 'new moon';
  
  // Get planetary positions for enhanced analysis
  const planetaryPositions = _calculatePlanetaryPositions(now);
  
  // Calculate planetary aspects for cuisine compatibility
  const currentAspects = calculatePlanetaryAspects(planetaryPositions);
  
  // Get lunar phase data for cultural intelligence
  const lunarPhaseData = LUNAR_PHASES[currentLunarPhase as keyof typeof LUNAR_PHASES] || LUNAR_PHASES['new moon'];
  
  // Enhanced planetary flavor profiles integration
  const enhancedPlanetaryFlavors = {
    ...planetaryFlavorProfiles,
    venus: enterprisePlanetaryData.venus.culturalInfluence.flavorPreferences,
    mars: enterprisePlanetaryData.mars.culturalInfluence.flavorPreferences,
    mercury: enterprisePlanetaryData.mercury.culturalInfluence.flavorPreferences,
    jupiter: enterprisePlanetaryData.jupiter.culturalInfluence.flavorPreferences
  };
  
  // Advanced ingredient intelligence integration
  const availableIngredients = allIngredients ? Object.keys(allIngredients) : [];
  const seasonalIngredients = availableIngredients.filter(ingredient => {
    const ingredientData = allIngredients[ingredient as keyof typeof allIngredients];
    return ingredientData && (ingredientData as any).season?.includes(getCurrentSeason());
  });
  
  // Convert sauces object to array
  const saucesArray = Object.values(allSauces || {});
  
  // Map all sauces with scores
  const scoredSauces = saucesArray.map(sauce => {
    // Replace the problematic casts with safe access
    const sauceData = sauce as Record<string, unknown>;
    const elementalProperties = sauceData?.elementalProperties;
    const planetaryInfluences = sauceData?.planetaryInfluences;
    const flavorProfile = sauceData?.flavorProfile;
    const sauceId = sauceData?.id;
    const sauceName = sauceData?.name;
    
    // Calculate elemental match score
    const elementalMatchScore = calculateElementalMatch(
      elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      userProfile
    );
    
    // Calculate planetary day bonus - sauces that match the current planetary day get a bonus
    let planetaryDayScore = 0.7; // base score
    if (planetaryInfluences && planetaryInfluences.includes(currentPlanetaryDay)) {
      planetaryDayScore = 0.9; // bonus for matching the day
    }
    
    // Calculate flavor profile match if available
    let flavorMatchScore = 0.7; // base score
    if (flavorProfile) {
      // === ENHANCED PLANETARY FLAVOR INTELLIGENCE ===
      const planetaryFlavors = {
        Sun: { spicy: 0.8, umami: 0.6, bold: 0.7 },
        Moon: { sweet: 0.7, creamy: 0.8, nurturing: 0.6 },
        Mars: { ...enterprisePlanetaryData.mars.culturalInfluence.flavorPreferences },
        Mercury: { ...enterprisePlanetaryData.mercury.culturalInfluence.flavorPreferences },
        Jupiter: { ...enterprisePlanetaryData.jupiter.culturalInfluence.flavorPreferences },
        Venus: { ...enterprisePlanetaryData.venus.culturalInfluence.flavorPreferences },
        Saturn: { bitter: 0.7, earthy: 0.8, traditional: 0.6 }
      };
      
      const currentFlavors = planetaryFlavors[currentPlanetaryDay] || {};
      
      // === LUNAR PHASE FLAVOR ENHANCEMENT ===
      const lunarFlavorModifier = lunarPhaseCuisineIntelligence.calculateLunarPhaseOptimization(
        currentLunarPhase as _LunarPhase, 
        String(sauceData?.cuisine || 'universal')
      );
      
      // === PLANETARY ASPECT FLAVOR ANALYSIS ===
      let aspectFlavorBonus = 0;
      if (currentAspects && currentAspects.length > 0) {
        const aspectAnalysis = planetaryAspectCuisineAnalyzer.analyzeCuisineCompatibility(currentAspects[0]);
        const sauceCuisine = String(sauceData?.cuisine || '').toLowerCase();
        
        if (aspectAnalysis.enhancedCuisines.some(cuisine => 
          sauceCuisine.includes(cuisine.toLowerCase())
        )) {
          aspectFlavorBonus = 0.2;
        }
      }
      
      // Calculate flavor match
      let flavorMatch = 0;
      let flavorCount = 0;
      
      Object.entries(currentFlavors).forEach(([flavor, strength]) => {
        if (flavorProfile[flavor]) {
          // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
          const flavorValue = Number(flavorProfile[flavor]) || 0;
          const strengthValue = Number(strength) || 0;
          flavorMatch += (1 - Math.abs(flavorValue - strengthValue));
          flavorCount++;
        }
      });
      
      if (flavorCount > 0) {
        flavorMatchScore = (flavorMatch / flavorCount) * lunarFlavorModifier + aspectFlavorBonus;
        flavorMatchScore = Math.min(1, flavorMatchScore); // Cap at 1.0
      }
    }
    
    // === ENTERPRISE CULTURAL INTELLIGENCE SCORING ===
    
    // Enhanced elemental analysis using _ElementalProperties
    const enhancedElementalAnalysis = enhancedElementalCuisineAnalyzer.analyzeElementalCuisineMatch(
      (elementalProperties as _ElementalProperties) || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      userProfile as _ElementalProperties
    );
    
    // Cultural intelligence bonus
    let culturalIntelligenceBonus = 0;
    const sauceCuisine = String(sauceData?.cuisine || '').toLowerCase();
    
    // Check if sauce aligns with current planetary cultural influences
    Object.values(enterprisePlanetaryData).forEach(planetData => {
      if (planetData.culturalInfluence?.cuisines) {
        const isCompatible = planetData.culturalInfluence.cuisines.some(cuisine => 
          sauceCuisine.includes(cuisine.toLowerCase()) || cuisine.toLowerCase().includes(sauceCuisine)
        );
        if (isCompatible) culturalIntelligenceBonus += 0.1;
      }
    });
    
    // Enhanced ingredient compatibility
    let ingredientCompatibilityScore = 0.5;
    if (seasonalIngredients.length > 0 && sauceData?.ingredients) {
      const sauceIngredients = Array.isArray(sauceData.ingredients) ? sauceData.ingredients : [];
      const commonIngredients = sauceIngredients.filter(ingredient => 
        seasonalIngredients.includes(ingredient)
      ).length;
      ingredientCompatibilityScore = Math.min(1, 0.5 + (commonIngredients * 0.1));
    }
    
    // Calculate overall match percentage with cultural intelligence
    const matchPercentage = Math.round(
      (enhancedElementalAnalysis.compatibility * 0.35 + 
       planetaryDayScore * 0.25 + 
       flavorMatchScore * 0.20 + 
       culturalIntelligenceBonus * 0.10 + 
       ingredientCompatibilityScore * 0.10) * 100
    );
    
    return {
      ...(sauce as Record<string, unknown>),
      id: sauceId || sauceName?.replace(/\s+/g, '-').toLowerCase(),
      matchPercentage,
      elementalMatchScore: Math.round(enhancedElementalAnalysis.compatibility * 100),
      planetaryDayScore: Math.round(planetaryDayScore * 100),
      planetaryHourScore: Math.round(flavorMatchScore * 100),
      // === NEW: ENTERPRISE CULTURAL INTELLIGENCE FEATURES ===
      lunarPhaseCompatibility: Math.round(lunarFlavorModifier * 100),
      culturalIntelligenceScore: Math.round(culturalIntelligenceBonus * 100),
      ingredientCompatibilityScore: Math.round(ingredientCompatibilityScore * 100),
      enhancedElementalAnalysis: {
        dominantElement: enhancedElementalAnalysis.dominantElement,
        recommendations: enhancedElementalAnalysis.recommendations,
        culturalSuggestions: enhancedElementalAnalysis.culturalSuggestions
      },
      planetaryInfluences: {
        currentPlanet: currentPlanetaryDay,
        culturalAlignment: Object.values(enterprisePlanetaryData)
          .filter(planetData => planetData.culturalInfluence?.cuisines?.some(cuisine => 
            sauceCuisine.includes(cuisine.toLowerCase())
          ))
          .map(planetData => planetData.culturalInfluence?.cuisines || [])
          .flat()
      },
      lunarPhaseData: {
        currentPhase: currentLunarPhase,
        phaseRecommendations: lunarPhaseCuisineIntelligence.analyzePhaseCuisineCompatibility(currentLunarPhase as _LunarPhase)
      },
      aspectAnalysis: currentAspects.length > 0 ? 
        planetaryAspectCuisineAnalyzer.analyzeCuisineCompatibility(currentAspects[0]) : null
    };
  });
  
  // Helper function for getting current season
  function getCurrentSeason(): string {
    const month = now.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }
  
  // Sort by overall match percentage and return top results
  return scoredSauces
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, count);
}


// === ENHANCED ZODIAC ELEMENTAL PROFILE CALCULATION ===
export function calculateElementalProfileFromZodiac(zodiac: ZodiacSign): _ElementalProperties {
  const zodiacPreferences = zodiacCuisineIntelligence.getSignCuisinePreferences(zodiac);
  return zodiacPreferences.elementalInfluence;
}

export function getMatchScoreClass(score: number): string { return score > 0.7 ? "high" : score > 0.4 ? "medium" : "low"; }

// ========== MISSING FUNCTIONS FOR TS2305 FIXES ==========

// getCuisineRecommendations function (causing errors in CuisineRecommender components)
// === ENTERPRISE CUISINE RECOMMENDATIONS WITH CULTURAL INTELLIGENCE ===
export function getCuisineRecommendations(
  elementalState: ElementalProperties,
  astrologicalState?: AstrologicalState,
  options: { count?: number } = {}
) {
  const { count = 5 } = options;
  
  // Get all cuisines from flavor profiles
  const cuisines = Object.keys(cuisineFlavorProfiles);
  
  const scoredCuisines = cuisines.map(cuisine => {
    const flavorProfile = cuisineFlavorProfiles[cuisine];
    const elementalMatch = calculateElementalMatch(
      isSauceData(flavorProfile) && flavorProfile.elementalAffinity 
        ? flavorProfile.elementalAffinity as ElementalProperties
        : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      elementalState
    );
    
    // === ENHANCED CULTURAL INTELLIGENCE ANALYSIS ===
    let culturalIntelligenceScore = elementalMatch;
    
    // Zodiac sign compatibility
    if (astrologicalState?.currentZodiac) {
      const zodiacPreferences = zodiacCuisineIntelligence.getSignCuisinePreferences(
        astrologicalState.currentZodiac as ZodiacSign
      );
      const isPreferredCuisine = zodiacPreferences.preferredCuisines.some(preferred => 
        cuisine.toLowerCase().includes(preferred.toLowerCase()) ||
        preferred.toLowerCase().includes(cuisine.toLowerCase())
      );
      if (isPreferredCuisine) culturalIntelligenceScore += 0.2;
    }
    
    // Lunar phase compatibility
    if (astrologicalState?.lunarPhase) {
      const lunarCompatibility = lunarPhaseCuisineIntelligence.calculateLunarPhaseOptimization(
        astrologicalState.lunarPhase as _LunarPhase,
        cuisine
      );
      culturalIntelligenceScore = (culturalIntelligenceScore * 0.7) + (lunarCompatibility * 0.3);
    }
    
    // Planetary day influence
    const now = new Date();
    const planetaryDay = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'][now.getDay()];
    const planetaryData = enterprisePlanetaryData[planetaryDay.toLowerCase() as keyof typeof enterprisePlanetaryData];
    
    if (planetaryData && (planetaryData as any).culturalInfluence?.cuisines) {
      const isPlanetaryCompatible = (planetaryData as any).culturalInfluence.cuisines.some((planetCuisine: string) => 
        cuisine.toLowerCase().includes(planetCuisine.toLowerCase()) ||
        planetCuisine.toLowerCase().includes(cuisine.toLowerCase())
      );
      if (isPlanetaryCompatible) culturalIntelligenceScore += 0.15;
    }
    
    return {
      name: cuisine,
      matchPercentage: Math.round(culturalIntelligenceScore * 100),
      elementalMatch,
      flavorProfile,
      reasoning: [
        `${Math.round(elementalMatch * 100)}% elemental compatibility`,
        ...(astrologicalState?.currentZodiac ? [`Zodiac ${astrologicalState.currentZodiac} compatibility`] : []),
        ...(astrologicalState?.lunarPhase ? [`${astrologicalState.lunarPhase} lunar phase alignment`] : []),
        `${planetaryDay} planetary day influence`
      ],
      // === NEW: ENTERPRISE CULTURAL INTELLIGENCE FEATURES ===
      culturalIntelligenceScore: Math.round(culturalIntelligenceScore * 100),
      zodiacCompatibility: astrologicalState?.currentZodiac ? 
        zodiacCuisineIntelligence.getSignCuisinePreferences(astrologicalState.currentZodiac as ZodiacSign) : null,
      lunarPhaseRecommendations: astrologicalState?.lunarPhase ? 
        lunarPhaseCuisineIntelligence.analyzePhaseCuisineCompatibility(astrologicalState.lunarPhase as _LunarPhase) : null,
      planetaryInfluence: {
        currentPlanet: planetaryDay,
        culturalAlignment: (planetaryData as any)?.culturalInfluence || null
      },
      enhancedElementalAnalysis: enhancedElementalCuisineAnalyzer.analyzeElementalCuisineMatch(
        (flavorProfile?.elementalAffinity as _ElementalProperties) || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        elementalState as _ElementalProperties
      )
    };
  });
  
  return scoredCuisines
    .sort((a, b) => b.culturalIntelligenceScore - a.culturalIntelligenceScore)
    .slice(0, count);
}

// calculateElementalMatch function (causing errors in multiple components)
export function calculateElementalMatch(
  profile1: ElementalProperties,
  profile2: ElementalProperties
): number {
  let totalMatch = 0;
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  
  elements.forEach(element => {
    const diff = Math.abs((profile1[element] || 0) - (profile2[element] || 0));
    const elementMatch = 1 - diff;
    totalMatch += elementMatch;
  });
  
  return totalMatch / elements.length;
}

// renderScoreBadge function (causing error in CuisineRecommender.tsx)
export function renderScoreBadge(score: number): string {
  const scoreClass = getMatchScoreClass(score);
  const percentage = Math.round(score * 100);
  
  return `<span class="score-badge ${scoreClass}">${percentage}%</span>`;
}

// calculateElementalContributionsFromPlanets function (causing errors in debug components)
export function calculateElementalContributionsFromPlanets(
  planetaryPositions: Record<string, any>
): ElementalProperties {
  const contributions: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  };
  
  // Calculate contributions based on planetary positions
  Object.entries(planetaryPositions).forEach(([planet, position]) => {
    const planetData = getPlanetaryElementalContribution(planet);
    const signData = getSignElementalContribution(position?.sign);
    
    // Add weighted contributions
    contributions.Fire += (planetData.Fire + signData.Fire) * 0.5;
    contributions.Water += (planetData.Water + signData.Water) * 0.5;
    contributions.Earth += (planetData.Earth + signData.Earth) * 0.5;
    contributions.Air += (planetData.Air + signData.Air) * 0.5;
  });
  
  // Normalize to ensure total is reasonable
  const total = contributions.Fire + contributions.Water + contributions.Earth + contributions.Air;
  if (total > 0) {
    contributions.Fire = contributions.Fire / total;
    contributions.Water = contributions.Water / total;
    contributions.Earth = contributions.Earth / total;
    contributions.Air = contributions.Air / total;
  }
  
  return contributions;
}

// Helper functions for planetary calculations
function getPlanetaryElementalContribution(planet: string): ElementalProperties {
  const planetaryElements: Record<string, ElementalProperties> = {
    Sun: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
    Moon: { Fire: 0.1, Water: 0.8, Earth: 0.05, Air: 0.05 },
    Mercury: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
    Venus: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
    Mars: { Fire: 0.7, Water: 0.2, Earth: 0.05, Air: 0.05 },
    Jupiter: { Fire: 0.3, Water: 0.1, Earth: 0.1, Air: 0.5 },
    Saturn: { Fire: 0.05, Water: 0.1, Earth: 0.7, Air: 0.15 }
  };
  
  return planetaryElements[planet] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

function getSignElementalContribution(sign: string): ElementalProperties {
  const signElements: Record<string, ElementalProperties> = {
    Aries: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    Taurus: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    Gemini: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    Cancer: { Fire: 0, Water: 1, Earth: 0, Air: 0 },
    Leo: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    Virgo: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    Libra: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    Scorpio: { Fire: 0, Water: 1, Earth: 0, Air: 0 },
    Sagittarius: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    Capricorn: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    Aquarius: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    Pisces: { Fire: 0, Water: 1, Earth: 0, Air: 0 }
  };
  
  return signElements[sign] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}
