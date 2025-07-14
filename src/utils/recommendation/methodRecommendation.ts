// @ts-nocheck

function getAstrologicalElementalProfile(astroState: Record<string, unknown>): ElementalProperties {
  return astroState.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  };
}

// Local utility function - renamed to avoid conflict with import
function createLocalElementalProperties(props: { Fire: number; Water: number; Earth: number; Air: number } = { Fire: 0, Water: 0, Earth: 0, Air: 0  }): ElementalProperties {
  return { Fire: props.Fire || 0, Water: props.Water || 0, Earth: props.Earth || 0, Air: props.Air || 0
   };
}
import { allCookingMethods, cookingMethods as detailedCookingMethods } from '../../data/cooking';
import { culturalCookingMethods, _getCulturalVariations, _CulturalCookingMethod } from '../culturalMethodsAggregator';
import type { ZodiacSign } from '../../types';
import type { CookingMethod as CookingMethodEnum } from "@/types/alchemy";
import { getCurrentSeason } from '../dateUtils';
import venusData from '../../data/planets/venus';
import marsData from '../../data/planets/mars';
import mercuryData from '../../data/planets/mercury';
import jupiterData from '../../data/planets/jupiter';
import saturnData from '../../data/planets/saturn';
import uranusData from '../../data/planets/uranus';
import neptuneData from '../../data/planets/neptune';
import plutoData from '../../data/planets/pluto';
import { _calculateLunarPhase } from '../astrologyUtils';
import { 
  PlanetaryAspect, 
  _LunarPhase, 
  BasicThermodynamicProperties, 
  CookingMethodProfile, 
  MethodRecommendationOptions, 
  MethodRecommendation,
  COOKING_METHOD_THERMODYNAMICS,
  _ElementalProperties
, _Element } from "@/types/alchemy";
import type { AstrologicalState } from "@/types/celestial";
import { _isElementalProperties } from '../elemental/elementalUtils';

// Type guard for FlavorProperties
interface FlavorProperties {
  bitter?: number;
  sweet?: number;
  sour?: number;
  salty?: number;
  umami?: number;
  [key: string]: number | undefined;
}

function hasFlavorProperties(obj: Record<string, unknown>): obj is FlavorProperties {
  if (!obj || typeof obj !== 'object') return false;
  
  return (
    typeof obj.bitter === 'number' || 
    typeof obj.sweet === 'number' || 
    typeof obj.sour === 'number' || 
    typeof obj.salty === 'number' || 
    typeof obj.umami === 'number'
  );
}

// Safe access to elemental properties
function getElementalProperty(obj: Record<string, unknown>, property: keyof ElementalProperties): number {
  if (isElementalProperties(obj) && typeof obj[property] === 'number') {
    return obj[property];
  }
  return 0;
}

// ===== TYPES AND INTERFACES =====

interface CookingMethodData {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  elementalProperties?: ElementalProperties;
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
    dominantPlanets?: string[];
  };
  toolsRequired?: string[];
  bestFor?: string[];
  culturalOrigin?: string;
  seasonalPreference?: string[];
  score?: number;
  variations?: CookingMethodData[];
  relatedToMainMethod?: string;
}

type CookingMethodDictionary = Record<string, CookingMethodData>;

// ===== DATA AGGREGATION =====

// Advanced planetary cooking method database with thermodynamic scoring
const planetaryMethodDatabase = {
  venus: {
    methods: venusData.cookingMethods || [],
    elementalBoost: venusData.elementalProperties || { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    culturalInfluence: venusData.culturalAssociations || [],
    thermodynamicModifier: 1.2
  },
  mars: {
    methods: marsData.cookingMethods || [],
    elementalBoost: marsData.elementalProperties || { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
    culturalInfluence: marsData.culturalAssociations || [],
    thermodynamicModifier: 1.5
  },
  mercury: {
    methods: mercuryData.cookingMethods || [],
    elementalBoost: mercuryData.elementalProperties || { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4 },
    culturalInfluence: mercuryData.culturalAssociations || [],
    thermodynamicModifier: 1.1
  },
  jupiter: {
    methods: jupiterData.cookingMethods || [],
    elementalBoost: jupiterData.elementalProperties || { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    culturalInfluence: jupiterData.culturalAssociations || [],
    thermodynamicModifier: 1.3
  },
  saturn: {
    methods: saturnData.cookingMethods || [],
    elementalBoost: saturnData.elementalProperties || { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    culturalInfluence: saturnData.culturalAssociations || [],
    thermodynamicModifier: 0.9
  },
  uranus: {
    methods: uranusData.cookingMethods || [],
    elementalBoost: uranusData.elementalProperties || { Fire: 0.2, Water: 0.3, Earth: 0.1, Air: 0.4 },
    culturalInfluence: uranusData.culturalAssociations || [],
    thermodynamicModifier: 1.4
  },
  neptune: {
    methods: neptuneData.cookingMethods || [],
    elementalBoost: neptuneData.elementalProperties || { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 },
    culturalInfluence: neptuneData.culturalAssociations || [],
    thermodynamicModifier: 1.0
  },
  pluto: {
    methods: plutoData.cookingMethods || [],
    elementalBoost: plutoData.elementalProperties || { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    culturalInfluence: plutoData.culturalAssociations || [],
    thermodynamicModifier: 1.6
  }
};

// Advanced cultural cooking method integration system
function getCulturalMethodVariations(baseMethod: string): Array<{ method: string; culture: string; enhancement: string }> {
  const variations = _getCulturalVariations(baseMethod);
  return variations.map((variation: _CulturalCookingMethod) => ({
    method: variation.name || baseMethod,
    culture: variation.culture || 'universal',
    enhancement: variation.culturalEnhancement || 'traditional preparation'
  }));
}

// Advanced lunar phase cooking optimization
function calculateLunarCookingBonus(method: CookingMethodData, currentDate: Date = new Date()): { phase: _LunarPhase; bonus: number; reasoning: string } {
  const lunarPhase = _calculateLunarPhase(currentDate);
  
  const lunarBonuses: Record<_LunarPhase, { methodTypes: string[]; bonus: number; reasoning: string }> = {
    'new': {
      methodTypes: ['fermentation', 'sprouting', 'preparation'],
      bonus: 0.15,
      reasoning: 'New moon energy supports new beginnings and gentle processes'
    },
    'waxing': {
      methodTypes: ['baking', 'rising', 'growth'],
      bonus: 0.12,
      reasoning: 'Waxing moon enhances growth and building energy'
    },
    'full': {
      methodTypes: ['transformation', 'high-heat', 'intense'],
      bonus: 0.20,
      reasoning: 'Full moon provides maximum transformation energy'
    },
    'waning': {
      methodTypes: ['reduction', 'concentration', 'distillation'],
      bonus: 0.10,
      reasoning: 'Waning moon supports reduction and concentration'
    }
  };
  
  const currentPhaseData = lunarBonuses[lunarPhase];
  const methodName = method.name?.toLowerCase() || '';
  
  const isOptimalMethod = currentPhaseData.methodTypes.some(type => 
    methodName.includes(type) || method.description?.toLowerCase().includes(type)
  );
  
  return {
    phase: lunarPhase,
    bonus: isOptimalMethod ? currentPhaseData.bonus : 0.05,
    reasoning: currentPhaseData.reasoning
  };
}

// Advanced elemental cooking method analysis
function analyzeElementalMethodAlignment(method: CookingMethodData, targetElemental: _ElementalProperties): { score: number; analysis: string; recommendations: string[] } {
  if (!_isElementalProperties(method.elementalEffect) || !_isElementalProperties(targetElemental)) {
    return {
      score: 0.5,
      analysis: 'Limited elemental data available',
      recommendations: ['Use standard preparation methods']
    };
  }
  
  const methodElemental = method.elementalEffect;
  const alignmentScores = {
    Fire: Math.abs(getElementalProperty(methodElemental, 'Fire') - getElementalProperty(targetElemental, 'Fire')),
    Water: Math.abs(getElementalProperty(methodElemental, 'Water') - getElementalProperty(targetElemental, 'Water')),
    Earth: Math.abs(getElementalProperty(methodElemental, 'Earth') - getElementalProperty(targetElemental, 'Earth')),
    Air: Math.abs(getElementalProperty(methodElemental, 'Air') - getElementalProperty(targetElemental, 'Air'))
  };
  
  const averageAlignment = Object.values(alignmentScores).reduce((sum, score) => sum + (1 - score), 0) / 4;
  
  const dominantElement = Object.entries(targetElemental)
    .reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0] as _Element;
  
  const recommendations = generateElementalRecommendations(dominantElement, method, alignmentScores);
  
  return {
    score: averageAlignment,
    analysis: `Method aligns ${(averageAlignment * 100).toFixed(1)}% with target elemental profile. Dominant element: ${dominantElement}`,
    recommendations
  };
}

// Advanced flavor profile cooking method matching
function calculateFlavorMethodSynergy(method: CookingMethodData, targetFlavors: Record<string, unknown>): { score: number; enhancements: string[]; warnings: string[] } {
  if (!hasFlavorProperties(targetFlavors)) {
    return {
      score: 0.7,
      enhancements: ['Method suitable for general flavor development'],
      warnings: []
    };
  }
  
  const methodName = method.name?.toLowerCase() || '';
  const methodDescription = method.description?.toLowerCase() || '';
  
  // Flavor enhancement analysis
  const flavorEnhancements: Record<string, { methods: string[]; enhancement: string; warning?: string }> = {
    bitter: {
      methods: ['roasting', 'grilling', 'charring'],
      enhancement: 'Develops complex bitter compounds through Maillard reactions',
      warning: 'Monitor closely to prevent over-bitterness'
    },
    sweet: {
      methods: ['caramelizing', 'slow-roasting', 'confit'],
      enhancement: 'Concentrates and develops natural sugars'
    },
    sour: {
      methods: ['fermentation', 'pickling', 'acidulation'],
      enhancement: 'Enhances acidic notes and brightness'
    },
    salty: {
      methods: ['brining', 'curing', 'salt-crusting'],
      enhancement: 'Intensifies and balances salinity'
    },
    umami: {
      methods: ['braising', 'reduction', 'aging'],
      enhancement: 'Develops deep savory complexity'
    }
  };
  
  let totalScore = 0;
  const enhancements: string[] = [];
  const warnings: string[] = [];
  
  Object.entries(targetFlavors).forEach(([flavor, intensity]) => {
    const flavorData = flavorEnhancements[flavor];
    if (flavorData && typeof intensity === 'number' && intensity > 0.3) {
      const methodMatches = flavorData.methods.some(m => 
        methodName.includes(m) || methodDescription.includes(m)
      );
      
      if (methodMatches) {
        totalScore += intensity * 0.8;
        enhancements.push(flavorData.enhancement);
        if (flavorData.warning) {
          warnings.push(flavorData.warning);
        }
      }
    }
  });
  
  return {
    score: Math.min(totalScore / Object.keys(targetFlavors).length, 1.0),
    enhancements,
    warnings
  };
}

// Helper function for elemental recommendations
function generateElementalRecommendations(dominantElement: _Element, method: CookingMethodData, alignmentScores: Record<string, number>): string[] {
  const recommendations: string[] = [];
  
  const elementAdvice: Record<_Element, string[]> = {
    Fire: [
      'Increase heat intensity for better Fire alignment',
      'Consider high-temperature techniques like grilling or searing',
      'Add warming spices to enhance Fire element'
    ],
    Water: [
      'Use moist cooking methods like steaming or poaching',
      'Incorporate cooling ingredients',
      'Consider liquid-based preparations'
    ],
    Earth: [
      'Use grounding techniques like slow roasting',
      'Incorporate root vegetables and grains',
      'Consider earthenware cooking vessels'
    ],
    Air: [
      'Use light, quick cooking methods',
      'Incorporate fresh herbs and aromatics',
      'Consider techniques that create lightness and lift'
    ]
  };
  
  recommendations.push(...elementAdvice[dominantElement]);
  
  // Add specific alignment suggestions
  Object.entries(alignmentScores).forEach(([element, misalignment]) => {
    if (misalignment > 0.3) {
      recommendations.push(`Adjust ${element} properties - current misalignment: ${(misalignment * 100).toFixed(1)}%`);
    }
  });
  
  return recommendations;
}

// Advanced thermodynamic cooking method scoring system
function calculateThermodynamicScore(method: CookingMethodData, options: MethodRecommendationOptions): { score: number; analysis: ThermodynamicAnalysis; recommendations: string[] } {
  const methodName = method.name?.toLowerCase() || '';
  const baseThermodynamics = COOKING_METHOD_THERMODYNAMICS[methodName as CookingMethodEnum] || {
    heatTransfer: 0.5,
    moistureRetention: 0.5,
    chemicalReaction: 0.5,
    energyEfficiency: 0.5,
    temperatureControl: 0.5
  };
  
  // Calculate seasonal adjustments
  const currentSeason = getCurrentSeason();
  const seasonalModifiers = getSeasonalThermodynamicModifiers(currentSeason);
  
  // Apply planetary influences
  const planetaryBonus = calculatePlanetaryThermodynamicBonus(method, options.astrologicalState);
  
  // Calculate final thermodynamic properties
  const adjustedThermodynamics = {
    heatTransfer: baseThermodynamics.heatTransfer * seasonalModifiers.heatTransfer * planetaryBonus.heatModifier,
    moistureRetention: baseThermodynamics.moistureRetention * seasonalModifiers.moistureRetention * planetaryBonus.moistureModifier,
    chemicalReaction: baseThermodynamics.chemicalReaction * seasonalModifiers.chemicalReaction * planetaryBonus.reactionModifier,
    energyEfficiency: baseThermodynamics.energyEfficiency * seasonalModifiers.energyEfficiency * planetaryBonus.efficiencyModifier,
    temperatureControl: baseThermodynamics.temperatureControl * seasonalModifiers.temperatureControl * planetaryBonus.controlModifier
  };
  
  // Calculate overall thermodynamic score
  const thermodynamicScore = Object.values(adjustedThermodynamics).reduce((sum, value) => sum + value, 0) / 5;
  
  const analysis: ThermodynamicAnalysis = {
    baseProperties: baseThermodynamics,
    adjustedProperties: adjustedThermodynamics,
    seasonalModifiers,
    planetaryInfluence: planetaryBonus,
    overallEfficiency: thermodynamicScore,
    optimalConditions: generateOptimalConditions(adjustedThermodynamics)
  };
  
  const recommendations = generateThermodynamicRecommendations(analysis, method);
  
  return {
    score: thermodynamicScore,
    analysis,
    recommendations
  };
}

// Seasonal thermodynamic modifiers
function getSeasonalThermodynamicModifiers(season: string): BasicThermodynamicProperties {
  const modifiers: Record<string, BasicThermodynamicProperties> = {
    'spring': {
      heatTransfer: 1.0,
      moistureRetention: 1.1,
      chemicalReaction: 1.05,
      energyEfficiency: 1.0,
      temperatureControl: 1.0
    },
    'summer': {
      heatTransfer: 0.9,
      moistureRetention: 0.8,
      chemicalReaction: 1.1,
      energyEfficiency: 0.9,
      temperatureControl: 0.85
    },
    'autumn': {
      heatTransfer: 1.1,
      moistureRetention: 1.0,
      chemicalReaction: 0.95,
      energyEfficiency: 1.05,
      temperatureControl: 1.1
    },
    'winter': {
      heatTransfer: 1.2,
      moistureRetention: 0.9,
      chemicalReaction: 0.9,
      energyEfficiency: 1.1,
      temperatureControl: 1.2
    }
  };
  
  return modifiers[season] || modifiers['spring'];
}

// Planetary thermodynamic bonus calculation
function calculatePlanetaryThermodynamicBonus(method: CookingMethodData, astroState?: AstrologicalState): PlanetaryThermodynamicBonus {
  if (!astroState) {
    return {
      heatModifier: 1.0,
      moistureModifier: 1.0,
      reactionModifier: 1.0,
      efficiencyModifier: 1.0,
      controlModifier: 1.0,
      dominantPlanet: 'sun'
    };
  }
  
  // Determine dominant planetary influence
  const planetaryHour = astroState.planetaryHour || 'sun';
  const planetData = planetaryMethodDatabase[planetaryHour as keyof typeof planetaryMethodDatabase];
  
  if (!planetData) {
    return {
      heatModifier: 1.0,
      moistureModifier: 1.0,
      reactionModifier: 1.0,
      efficiencyModifier: 1.0,
      controlModifier: 1.0,
      dominantPlanet: planetaryHour
    };
  }
  
  const baseModifier = planetData.thermodynamicModifier;
  
  return {
    heatModifier: baseModifier * 1.1,
    moistureModifier: baseModifier * 0.9,
    reactionModifier: baseModifier,
    efficiencyModifier: baseModifier * 1.05,
    controlModifier: baseModifier * 0.95,
    dominantPlanet: planetaryHour
  };
}

// Generate optimal conditions for thermodynamic efficiency
function generateOptimalConditions(thermodynamics: BasicThermodynamicProperties): string[] {
  const conditions: string[] = [];
  
  if (thermodynamics.heatTransfer > 0.8) {
    conditions.push('High heat transfer - ideal for quick searing and browning');
  }
  
  if (thermodynamics.moistureRetention > 0.8) {
    conditions.push('Excellent moisture retention - perfect for tender, juicy results');
  }
  
  if (thermodynamics.chemicalReaction > 0.8) {
    conditions.push('Enhanced chemical reactions - optimal for flavor development');
  }
  
  if (thermodynamics.energyEfficiency > 0.8) {
    conditions.push('High energy efficiency - sustainable and cost-effective');
  }
  
  if (thermodynamics.temperatureControl > 0.8) {
    conditions.push('Precise temperature control - ideal for delicate preparations');
  }
  
  return conditions;
}

// Generate thermodynamic recommendations
function generateThermodynamicRecommendations(analysis: ThermodynamicAnalysis, method: CookingMethodData): string[] {
  const recommendations: string[] = [];
  
  const { adjustedProperties } = analysis;
  
  if (adjustedProperties.heatTransfer < 0.6) {
    recommendations.push('Consider preheating equipment longer for better heat transfer');
  }
  
  if (adjustedProperties.moistureRetention < 0.6) {
    recommendations.push('Add moisture-retaining techniques like covering or basting');
  }
  
  if (adjustedProperties.chemicalReaction < 0.6) {
    recommendations.push('Increase cooking time or temperature to enhance chemical reactions');
  }
  
  if (adjustedProperties.energyEfficiency < 0.6) {
    recommendations.push('Optimize cooking vessel size and heat settings for better efficiency');
  }
  
  if (adjustedProperties.temperatureControl < 0.6) {
    recommendations.push('Use more precise temperature monitoring and control methods');
  }
  
  // Add method-specific recommendations based on method properties
  if (method.culturalOrigin) {
    recommendations.push(`Traditional ${method.culturalOrigin} techniques may enhance this method`);
  }
  
  if (method.seasonalPreference && method.seasonalPreference.length > 0) {
    recommendations.push(`Optimal during ${method.seasonalPreference.join(', ')} seasons`);
  }
  
  // Add planetary-specific recommendations
  const planetaryPlanet = analysis.planetaryInfluence.dominantPlanet;
  const planetData = planetaryMethodDatabase[planetaryPlanet as keyof typeof planetaryMethodDatabase];
  
  if (planetData && planetData.culturalInfluence.length > 0) {
    recommendations.push(`Consider ${planetaryPlanet}-influenced techniques from ${planetData.culturalInfluence.join(', ')} traditions`);
  }
  
  return recommendations;
}

// Enhanced method recommendation with comprehensive scoring
export function getEnhancedMethodRecommendations(options: MethodRecommendationOptions): MethodRecommendation[] {
  const recommendations: MethodRecommendation[] = [];
  
  Object.values(allCookingMethodsCombined).forEach(method => {
    // Skip methods without required data
    if (!method.name || !method.elementalEffect) return;
    
    // Calculate base compatibility score
    let totalScore = 0;
    let scoreComponents: Record<string, number> = {};
    
    // Elemental alignment scoring
    if (options.targetElemental) {
      const elementalAnalysis = analyzeElementalMethodAlignment(method, options.targetElemental);
      scoreComponents.elemental = elementalAnalysis.score * 0.25;
      totalScore += scoreComponents.elemental;
    }
    
    // Flavor synergy scoring
    if (options.targetFlavors) {
      const flavorAnalysis = calculateFlavorMethodSynergy(method, options.targetFlavors);
      scoreComponents.flavor = flavorAnalysis.score * 0.20;
      totalScore += scoreComponents.flavor;
    }
    
    // Thermodynamic scoring
    const thermodynamicAnalysis = calculateThermodynamicScore(method, options);
    scoreComponents.thermodynamic = thermodynamicAnalysis.score * 0.30;
    totalScore += scoreComponents.thermodynamic;
    
    // Lunar phase bonus
    const lunarAnalysis = calculateLunarCookingBonus(method);
    scoreComponents.lunar = lunarAnalysis.bonus;
    totalScore += scoreComponents.lunar;
    
    // Cultural variation scoring
    const culturalVariations = getCulturalMethodVariations(method.name);
    scoreComponents.cultural = culturalVariations.length > 0 ? 0.05 : 0;
    totalScore += scoreComponents.cultural;
    
    // Create enhanced recommendation
    const recommendation: MethodRecommendation = {
      method: method,
      score: Math.min(totalScore, 1.0),
      scoreComponents: scoreComponents,
      reasoning: generateRecommendationReasoning(method, options, scoreComponents),
      enhancements: {
        elementalOptimization: options.targetElemental ? analyzeElementalMethodAlignment(method, options.targetElemental) : undefined,
        flavorSynergy: options.targetFlavors ? calculateFlavorMethodSynergy(method, options.targetFlavors) : undefined,
        thermodynamicAnalysis: thermodynamicAnalysis,
        lunarOptimization: lunarAnalysis,
        culturalVariations: culturalVariations
      },
      practicalGuidance: generatePracticalGuidance(method, thermodynamicAnalysis),
      seasonalAdaptations: generateSeasonalAdaptations(method),
      planetaryAlignments: generatePlanetaryAlignments(method, options.astrologicalState)
    };
    
    recommendations.push(recommendation);
  });
  
  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxRecommendations || 10);
}

// Generate recommendation reasoning
function generateRecommendationReasoning(method: CookingMethodData, options: MethodRecommendationOptions, scores: Record<string, number>): string {
  const reasons: string[] = [];
  
  if (scores.elemental > 0.7) {
    reasons.push('excellent elemental alignment');
  } else if (scores.elemental > 0.5) {
    reasons.push('good elemental compatibility');
  }
  
  if (scores.flavor > 0.7) {
    reasons.push('strong flavor synergy');
  }
  
  if (scores.thermodynamic > 0.8) {
    reasons.push('optimal thermodynamic properties');
  } else if (scores.thermodynamic > 0.6) {
    reasons.push('efficient thermodynamic profile');
  }
  
  if (scores.lunar > 0.15) {
    reasons.push('enhanced by current lunar phase');
  }
  
  if (scores.cultural > 0) {
    reasons.push('rich cultural variations available');
  }
  
  return reasons.length > 0 
    ? `Recommended for ${reasons.join(', ')}`
    : 'Standard compatibility with current parameters';
}

// Generate practical guidance
function generatePracticalGuidance(method: CookingMethodData, thermodynamics: { analysis: ThermodynamicAnalysis }): string[] {
  const guidance: string[] = [];
  
  // Equipment recommendations
  if (method.toolsRequired) {
    guidance.push(`Required equipment: ${method.toolsRequired.join(', ')}`);
  }
  
  // Temperature guidance
  const tempControl = thermodynamics.analysis.adjustedProperties.temperatureControl;
  if (tempControl > 0.8) {
    guidance.push('Use precise temperature monitoring for best results');
  } else if (tempControl < 0.4) {
    guidance.push('Temperature tolerance is forgiving - suitable for beginners');
  }
  
  // Timing guidance
  if (method.duration) {
    guidance.push(`Cooking time: ${method.duration.min}-${method.duration.max} minutes`);
  }
  
  // Best applications
  if (method.bestFor && method.bestFor.length > 0) {
    guidance.push(`Best for: ${method.bestFor.join(', ')}`);
  }
  
  return guidance;
}

// Generate seasonal adaptations with method-specific considerations
function generateSeasonalAdaptations(method: CookingMethodData): Record<string, string[]> {
  const baseAdaptations: Record<string, string[]> = {
    spring: ['Use lighter touches', 'Incorporate fresh herbs', 'Reduce cooking times slightly'],
    summer: ['Lower temperatures when possible', 'Focus on quick cooking', 'Emphasize cooling elements'],
    autumn: ['Embrace heartier preparations', 'Extend cooking times for depth', 'Use warming spices'],
    winter: ['Maximize heat and warming', 'Use longer, slower methods', 'Focus on comfort and richness']
  };
  
  // Add method-specific adaptations
  const methodName = method.name?.toLowerCase() || '';
  
  if (methodName.includes('grill')) {
    baseAdaptations.summer.unshift('Ideal season for outdoor grilling');
    baseAdaptations.winter.push('Consider indoor grilling alternatives');
  }
  
  if (methodName.includes('brais') || methodName.includes('stew')) {
    baseAdaptations.autumn.unshift('Perfect for slow, warming preparations');
    baseAdaptations.winter.unshift('Ideal for hearty, warming dishes');
  }
  
  if (method.duration && method.duration.min > 60) {
    baseAdaptations.summer.push('Start early to avoid peak heat hours');
    baseAdaptations.winter.push('Perfect for cozy, extended cooking sessions');
  }
  
  return baseAdaptations;
}

// Generate planetary alignments
function generatePlanetaryAlignments(method: CookingMethodData, astroState?: AstrologicalState): Record<string, string> {
  if (!astroState) {
    return {
      current: 'No astrological data available',
      optimal: 'Any time suitable for general cooking'
    };
  }
  
  const currentPlanet = astroState.planetaryHour || 'sun';
  const planetData = planetaryMethodDatabase[currentPlanet as keyof typeof planetaryMethodDatabase];
  
  return {
    current: `${currentPlanet} hour - ${planetData ? 'favorable' : 'neutral'} for this method`,
    optimal: `Best during planetary hours that enhance ${method.name} energy`,
    enhancement: planetData ? `${planetData.thermodynamicModifier > 1 ? 'Enhanced' : 'Moderated'} by ${currentPlanet} influence` : 'Standard planetary influence'
  };
}

// Type definitions for enhanced functionality
interface ThermodynamicAnalysis {
  baseProperties: BasicThermodynamicProperties;
  adjustedProperties: BasicThermodynamicProperties;
  seasonalModifiers: BasicThermodynamicProperties;
  planetaryInfluence: PlanetaryThermodynamicBonus;
  overallEfficiency: number;
  optimalConditions: string[];
}

interface PlanetaryThermodynamicBonus {
  heatModifier: number;
  moistureModifier: number;
  reactionModifier: number;
  efficiencyModifier: number;
  controlModifier: number;
  dominantPlanet: string;
}

// Combine traditional and cultural cooking methods
const allCookingMethodsCombined: CookingMethodDictionary = {
  // Convert allCookingMethods to our format
  ...Object.entries(allCookingMethods)?.reduce((acc: CookingMethodDictionary, [id, method]) => {
    acc[id] = {
      id,
      ...((method as unknown as Record<string, unknown>)),
      elementalEffect: ((method as unknown as Record<string, unknown>)).elementalEffect || createLocalElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  }),
      name: id,
      description: '',
      duration: { min: 0, max: 60 },
      suitable_for: ((method as unknown as Record<string, unknown>)).suitable_for || [],
      benefits: ((method as unknown as Record<string, unknown>)).benefits || [],
      variations: [],
    };
    return acc;
  }, {}),
  
  // Add cultural methods with proper organization
  ...culturalCookingMethods.reduce((methods: CookingMethodDictionary, method) => {
    // Check if this method is a variation of a main method
    if (((method as unknown as Record<string, unknown>)).relatedToMainMethod) {
      // If the main method exists, add this as a variation
      if (methods[((method as unknown as Record<string, unknown>)).relatedToMainMethod]) {
        const existingVariations = methods[((method as unknown as Record<string, unknown>)).relatedToMainMethod].variations || [];
        const existingVariationsArray = Array.isArray(existingVariations) ? existingVariations : [];
        if (!existingVariationsArray.some(v => v.id === ((method as unknown as Record<string, unknown>))?.id)) {
          methods[((method as unknown as Record<string, unknown>)).relatedToMainMethod].variations = [
            ...existingVariationsArray,
            {
              id: ((method as unknown as Record<string, unknown>)).id,
              name: ((method as unknown as Record<string, unknown>)).variationName || ((method as unknown as Record<string, unknown>)).name,
              description: ((method as unknown as Record<string, unknown>)).description,
              elementalEffect: ((method as unknown as Record<string, unknown>)).elementalState || createLocalElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  }),
              toolsRequired: ((method as unknown as Record<string, unknown>)).toolsRequired || [],
              bestFor: ((method as unknown as Record<string, unknown>)).bestFor || [],
              culturalOrigin: ((method as unknown as Record<string, unknown>)).culturalOrigin,
              astrologicalInfluences: ((method as unknown as Record<string, unknown>)).astrologicalInfluences,
              duration: {
                min: ((method as unknown as Record<string, unknown>)).duration?.min || 0,
                max: ((method as unknown as Record<string, unknown>)).duration?.max || 0
              },
              suitable_for: ((method as unknown as Record<string, unknown>)).bestFor || [],
              benefits: [],
              relatedToMainMethod: ((method as unknown as Record<string, unknown>)).relatedToMainMethod
            }
          ];
        }
        return methods;
      }
    }
    
    // Only add as standalone if it doesn't already exist and isn't a variation
    if (!methods[((method as unknown as Record<string, unknown>)).id] && !((method as unknown as Record<string, unknown>)).relatedToMainMethod) {
      methods[((method as unknown as Record<string, unknown>)).id] = {
        id: ((method as unknown as Record<string, unknown>)).id,
        name: ((method as unknown as Record<string, unknown>)).name,
        description: ((method as unknown as Record<string, unknown>)).description,
        elementalEffect: ((method as unknown as Record<string, unknown>)).elementalState || createLocalElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  }),
        toolsRequired: ((method as unknown as Record<string, unknown>)).toolsRequired || [],
        bestFor: ((method as unknown as Record<string, unknown>)).bestFor || [],
        culturalOrigin: ((method as unknown as Record<string, unknown>)).culturalOrigin,
        astrologicalInfluences: {
          favorableZodiac: ((method as unknown as Record<string, unknown>)).astrologicalInfluences?.favorableZodiac || [].map(sign => sign as ZodiacSign) || [],
          unfavorableZodiac: ((method as unknown as Record<string, unknown>)).astrologicalInfluences?.unfavorableZodiac || [].map(sign => sign as ZodiacSign) || [],
          dominantPlanets: ((method as unknown as Record<string, unknown>)).astrologicalInfluences?.dominantPlanets || []
        },
        duration: {
          min: ((method as unknown as Record<string, unknown>)).duration?.min || 0,
          max: ((method as unknown as Record<string, unknown>)).duration?.max || 0
        },
        suitable_for: ((method as unknown as Record<string, unknown>)).bestFor || [],
        benefits: [],
        variations: [],
      };
    }
    return methods;
  }, {})
};

// ===== THERMODYNAMIC HELPERS =====

/**
 * Get thermodynamic properties for a cooking method
 */
export function getMethodThermodynamics(method: CookingMethodProfile): BasicThermodynamicProperties {
  const methodNameLower = String(((method as unknown as Record<string, unknown>)).name?.toLowerCase() || '');

  // 1. Check the detailed data source first
  const detailedMethodData = detailedCookingMethods[methodNameLower as unknown as CookingMethodEnum];
  if (detailedMethodData && detailedMethodData.thermodynamicProperties) {
    return {
      heat: detailedMethodData.thermodynamicProperties?.heat ?? 0.5,
      entropy: detailedMethodData.thermodynamicProperties?.entropy ?? 0.5,
      reactivity: detailedMethodData.thermodynamicProperties?.reactivity ?? 0.5,
      gregsEnergy: detailedMethodData.thermodynamicProperties?.energy ?? 0.5,
    };
  }

  // 2. Check if the method object itself has thermodynamic properties
  if (((method as unknown as Record<string, unknown>)).thermodynamicProperties) {
    return {
      heat: ((method as unknown as Record<string, unknown>)).thermodynamicProperties?.heat ?? 0.5,
      entropy: ((method as unknown as Record<string, unknown>)).thermodynamicProperties?.entropy ?? 0.5,
      reactivity: ((method as unknown as Record<string, unknown>)).thermodynamicProperties?.reactivity ?? 0.5,
      gregsEnergy: ((method as unknown as Record<string, unknown>)).thermodynamicProperties?.energy ?? 0.5
    };
  }
  
  // 3. Check the explicitly defined mapping constant
  const constantThermoData = COOKING_METHOD_THERMODYNAMICS[methodNameLower as keyof typeof COOKING_METHOD_THERMODYNAMICS];
  if (constantThermoData) {
    return constantThermoData;
  }
  
  // 4. Fallback logic based on method name characteristics - Safe string access
  if (methodNameLower.includes('grill') || methodNameLower.includes('roast') || 
      methodNameLower.includes('fry') || methodNameLower.includes('sear') || 
      methodNameLower.includes('broil') || methodNameLower.includes('char')) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7, gregsEnergy: 0.7 };
  } else if (methodNameLower.includes('bake')) {
    return { heat: 0.7, entropy: 0.5, reactivity: 0.6, gregsEnergy: 0.6 };
  } else if (methodNameLower.includes('steam') || methodNameLower.includes('simmer') || 
             methodNameLower.includes('poach') || methodNameLower.includes('boil')) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5, gregsEnergy: 0.4 };
  } else if (methodNameLower.includes('sous vide') || methodNameLower.includes('sous_vide')) {
    return { heat: 0.3, entropy: 0.35, reactivity: 0.2, gregsEnergy: 0.3 };
  } else if (methodNameLower.includes('raw') || methodNameLower.includes('ceviche') || 
             methodNameLower.includes('ferment') || methodNameLower.includes('pickle') || 
             methodNameLower.includes('cure') || methodNameLower.includes('marinate')) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4, gregsEnergy: 0.3 };
  } else if (methodNameLower.includes('braise') || methodNameLower.includes('stew')) {
    return { heat: 0.55, entropy: 0.75, reactivity: 0.60, gregsEnergy: 0.6 };
  } else if (methodNameLower.includes('pressure')) {
    return { heat: 0.7, entropy: 0.8, reactivity: 0.65, gregsEnergy: 0.7 };
  } else if (methodNameLower.includes('smoke') || methodNameLower.includes('smok')) {
    return { heat: 0.6, entropy: 0.4, reactivity: 0.75, gregsEnergy: 0.6 };
  } else if (methodNameLower.includes('confit') || methodNameLower.includes('slow cook')) {
    return { heat: 0.4, entropy: 0.6, reactivity: 0.45, gregsEnergy: 0.5 };
  } else if (methodNameLower.includes('dehydrat') || methodNameLower.includes('dry')) {
    return { heat: 0.3, entropy: 0.2, reactivity: 0.3, gregsEnergy: 0.25 };
  } else if (methodNameLower.includes('toast') || methodNameLower.includes('brulee')) {
    return { heat: 0.75, entropy: 0.5, reactivity: 0.8, gregsEnergy: 0.7 };
  }

  // Default values if no match found
  return { heat: 0.5, entropy: 0.5, reactivity: 0.5, gregsEnergy: 0.5 };
}

/**
 * Calculate thermodynamic base score for a method
 */
export function calculateThermodynamicBaseScore(thermodynamics: BasicThermodynamicProperties): number {
  const { heat, entropy, reactivity } = thermodynamics;
  
  // Balanced thermodynamic properties generally score higher
  const balance = 1 - Math.abs(heat - 0.5) - Math.abs(entropy - 0.5) - Math.abs(reactivity - 0.5);
  const intensity = (heat + entropy + reactivity) / 3;
  
  return (balance * 0.6) + (intensity * 0.4);
}

// ===== UTILITY FUNCTIONS =====

export function normalizeMethodName(methodName: string): string {
  return methodName?.toLowerCase()?.replace(/[^a-z0-9]/g, '');
}

export function areSimilarMethods(method1: string, method2: string): boolean {
  const normalized1 = normalizeMethodName(method1);
  const normalized2 = normalizeMethodName(method2);
  
  // Check for exact match
  if (normalized1 === normalized2) return true;
  
  // Check for partial matches
  const similarityThreshold = 0.7;
  const longer = (normalized1 || []).length > (normalized2 || []).length ? normalized1 : normalized2;
  const shorter = (normalized1 || []).length <= (normalized2 || []).length ? normalized1 : normalized2;
  
  let matches = 0;
  for (let i = 0; i < (shorter || []).length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return (matches / (shorter || []).length) >= similarityThreshold;
}

// ===== COMPATIBILITY FUNCTIONS =====

/**
 * Calculate enhanced elemental compatibility between method and target properties
 */
export function calculateEnhancedElementalCompatibility(
  methodProps: ElementalProperties,
  targetProps: ElementalProperties,
): number {
  if (!methodProps || !targetProps) return 0.5;
  
  let totalCompatibility = 0;
  let elementCount = 0;
  
  Object.entries(methodProps || {}).forEach(([element, methodValue]) => {
    const targetValue = targetProps[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
    
    // Following elemental principles: higher compatibility for similar values
    const compatibility = 1 - Math.abs(methodValue - targetValue);
    
    // Weight by the target element's importance
    const weight = targetValue + 0.1; // Ensure minimum weight
    
    totalCompatibility += compatibility * weight;
    elementCount += weight;
  });
  
  return elementCount > 0 ? (Number(totalCompatibility) || 0) / (Number(elementCount) || 0) : 0.5;
}

/**
 * Calculate planetary day influence on cooking method
 */
export function calculatePlanetaryDayInfluence(
  method: CookingMethodProfile,
  planetaryDay: string,
): number {
  const planetaryMethodAffinities = {
    'Sun': ['grill', 'roast', 'bake', 'sear', 'broil'],
    'Moon': ['steam', 'poach', 'simmer', 'braise', 'slow cook'],
    'Mars': ['fry', 'sauté', 'stir fry', 'char', 'blacken'],
    'Mercury': ['julienne', 'dice', 'mince', 'chop', 'slice'],
    'Jupiter': ['feast', 'banquet', 'abundance', 'large batch'],
    'Venus': ['garnish', 'plate', 'present', 'decorate'],
    'Saturn': ['preserve', 'cure', 'age', 'ferment', 'pickle']
  };
  
  const methodName = ((method as unknown as Record<string, unknown>)).name?.toLowerCase();
  const affinities = planetaryMethodAffinities[planetaryDay] || [];
  
  const hasAffinity = (affinities || []).some(affinity => 
    methodName?.includes(affinity?.toLowerCase())
  );
  
  return hasAffinity ? 0.8 : 0.5;
}

/**
 * Calculate planetary hour influence on cooking method
 */
export function calculatePlanetaryHourInfluence(
  method: CookingMethodProfile,
  planetaryHour: string,
  isDaytime: boolean,
): number {
  const hourMethodAffinities = {
    'Sun': isDaytime ? ['grill', 'roast', 'bake'] : ['warm', 'heat'],
    'Moon': isDaytime ? ['steam', 'poach'] : ['simmer', 'braise'],
    'Mars': isDaytime ? ['fry', 'sear'] : ['char', 'blacken'],
    'Mercury': isDaytime ? ['chop', 'dice'] : ['mince', 'julienne'],
    'Jupiter': isDaytime ? ['feast', 'abundance'] : ['comfort', 'hearty'],
    'Venus': isDaytime ? ['garnish', 'present'] : ['delicate', 'refined'],
    'Saturn': isDaytime ? ['preserve', 'cure'] : ['age', 'ferment']
  };
  
  const methodName = ((method as unknown as Record<string, unknown>)).name?.toLowerCase();
  const affinities = hourMethodAffinities[planetaryHour] || [];
  
  const hasAffinity = (affinities || []).some(affinity => 
    methodName?.includes(affinity?.toLowerCase())
  );
  
  return hasAffinity ? 0.7 : 0.5;
}

export function isDaytime(date: Date = new Date()): boolean {
  const hours = date.getHours();
  return hours >= 6 && hours < 18;
}

// ===== MAIN RECOMMENDATION FUNCTION =====

/**
 * Get recommended cooking methods based on elemental composition and preferences
 */
export function getRecommendedCookingMethods(
  elementalComposition: ElementalProperties,
  currentZodiac?: ZodiacSign,
  planets?: string[],
  season = getCurrentSeason(),
  culturalPreference?: string,
  dietaryPreferences?: string[],
  availableTools?: string[]
) {
  const recommendations: Array<{
    method: CookingMethodData;
    score: number;
    reasons: string[];
    thermodynamics: BasicThermodynamicProperties;
  }> = [];
  
  // Score each cooking method
  Object.values(allCookingMethodsCombined || {}).forEach(method => {
    let score = 0.5; // Base score
    const reasons: string[] = [];
    
    // Elemental compatibility (40% weight)
    const elementalScore = calculateEnhancedElementalCompatibility(
      ((method as unknown as Record<string, unknown>))?.elementalEffect,
      elementalComposition
    );
    score += elementalScore * 0.4;
    if (elementalScore > 0.7) {
      reasons?.push('Strong elemental alignment');
    }
    
    // Zodiac compatibility (20% weight)
    if (currentZodiac && ((method as unknown as Record<string, unknown>)).astrologicalInfluences?.favorableZodiac) {
      const zodiacMatch = ((method as unknown as Record<string, unknown>)).astrologicalInfluences.favorableZodiac?.includes(currentZodiac);
      if (zodiacMatch) {
        score += 0.2;
        reasons?.push(`Favorable for ${currentZodiac}`);
      }
    }
    
    // Planetary compatibility (15% weight)
    if (planets && ((method as unknown as Record<string, unknown>)).astrologicalInfluences?.dominantPlanets) {
      const planetMatch = (planets || []).some(planet => 
        ((method as unknown as Record<string, unknown>))?.astrologicalInfluences?.dominantPlanets?.includes(planet)
      );
      if (planetMatch) {
        score += 0.15;
        reasons?.push('Planetary alignment');
      }
    }
    
    // Seasonal compatibility (10% weight)
    if (((method as unknown as Record<string, unknown>)).seasonalPreference?.includes(season)) {
      score += 0.1;
      reasons?.push(`Perfect for ${season}`);
    }
    
    // Cultural preference (10% weight)
    if (culturalPreference && ((method as unknown as Record<string, unknown>)).culturalOrigin === culturalPreference) {
      score += 0.1;
      reasons?.push(`${culturalPreference} tradition`);
    }
    
    // Tool availability (5% weight)
    if (availableTools && ((method as unknown as Record<string, unknown>)).toolsRequired) {
      const toolsAvailable = ((method as unknown as Record<string, unknown>)).toolsRequired.every(tool => 
        (availableTools || []).some(available => 
          available?.toLowerCase()?.includes(tool?.toLowerCase())
        )
      );
      if (toolsAvailable) {
        score += 0.05;
        reasons?.push('Tools available');
      }
    }
    
    // Get thermodynamic properties
    const thermodynamics = getMethodThermodynamics(method as unknown as CookingMethodProfile);
    
    recommendations?.push({
      method,
      score: Math.min(1, score),
      reasons,
      thermodynamics
    });
  });
  
  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 10)
    .map(rec => ({
      name: rec.method.name,
      score: rec.score,
      description: rec.method.description,
      reasons: rec.reasons,
      elementalEffect: rec.method.elementalEffect,
      duration: rec.method.duration,
      thermodynamics: rec.thermodynamics,
      variations: rec.method.variations || [],
    }));
}

// ===== LUNAR AND ASPECT CALCULATIONS =====

export function calculateLunarMethodAffinity(method: CookingMethodData, phase: LunarPhase): number {
  const lunarAffinities = {
    'new moon': ['ferment', 'pickle', 'cure', 'preserve'],
    'waxing crescent': ['steam', 'poach', 'simmer'],
    'first quarter': ['sauté', 'stir fry', 'quick cook'],
    'waxing gibbous': ['bake', 'roast', 'grill'],
    'full Moon': ['feast', 'celebration', 'abundance'],
    'waning gibbous': ['braise', 'slow cook', 'stew'],
    'last quarter': ['reduce', 'concentrate', 'intensify'],
    'waning crescent': ['rest', 'minimal cooking', 'raw']
  };
  
  const methodName = ((method as unknown as Record<string, unknown>)).name?.toLowerCase();
  const phaseAffinities = lunarAffinities[phase] || [];
  
  const hasAffinity = (phaseAffinities || []).some(affinity => 
    (Array.isArray(methodName) ? methodName.includes(affinity) : methodName === affinity)
  );
  
  return hasAffinity ? 0.8 : 0.5;
}

function _calculateAspectMethodAffinity(aspects: PlanetaryAspect[], method: CookingMethodData): number {
  if (!aspects || (aspects || []).length === 0) return 0.5;
  
  let totalAffinity = 0;
  let aspectCount = 0;
  
  (aspects || []).forEach(aspect => {
    // Different aspects favor different cooking approaches
    let affinity = 0.5;
    
    if (aspect.type === 'conjunction' || aspect.type === 'trine') {
      // Harmonious aspects favor gentle, harmonious cooking methods
      if (((method as unknown as Record<string, unknown>)).name?.toLowerCase()?.includes('steam') || 
          ((method as unknown as Record<string, unknown>)).name?.toLowerCase()?.includes('poach') ||
          ((method as unknown as Record<string, unknown>)).name?.toLowerCase()?.includes('simmer')) {
        affinity = 0.8;
      }
    } else if (aspect.type === 'square' || aspect.type === 'opposition') {
      // Challenging aspects favor more intense cooking methods
      if (((method as unknown as Record<string, unknown>)).name?.toLowerCase()?.includes('grill') || 
          ((method as unknown as Record<string, unknown>)).name?.toLowerCase()?.includes('fry') ||
          ((method as unknown as Record<string, unknown>)).name?.toLowerCase()?.includes('sear')) {
        affinity = 0.8;
      }
    }
    
    totalAffinity += affinity;
    aspectCount++;
  });
  
  return aspectCount > 0 ? (Number(totalAffinity) || 0) / (Number(aspectCount) || 0) : 0.5;
}

// ===== ENHANCED SCORING FUNCTIONS =====

export function calculateMethodScore(method: CookingMethodProfile, astroState: AstrologicalState): number {
  let score = 0.5; // Base score
  
  // Elemental compatibility
  const methodElemental = getMethodElementalProfile(method);
  const astroElemental = getAstrologicalElementalProfile(astroState);
  
  if (methodElemental && astroElemental) {
    const elementalCompatibility = calculateElementalCompatibility(methodElemental, astroElemental);
    score += elementalCompatibility * 0.4;
  }
  
  // Lunar phase compatibility
  if (astroState.lunarPhase) {
    const lunarAffinity = calculateLunarMethodAffinity(method as unknown as CookingMethodData, astroState.lunarPhase);
    score += lunarAffinity * 0.3;
  }
  
  // Planetary aspects compatibility
  if (astroState.aspects) {
    // ✅ Pattern MM-1: Type assertion to resolve PlanetaryAspect[] import mismatch
    const aspectAffinity = _calculateAspectMethodAffinity(astroState.aspects as unknown, method as unknown as CookingMethodData);
    score += aspectAffinity * 0.3;
  }
  
  return Math.min(1, score);
}

export function getMethodElementalProfile(method: CookingMethodProfile): ElementalProperties {
  return ((method as unknown as Record<string, unknown>)).elementalEffect || ((method as unknown as Record<string, unknown>)).elementalState || createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
   });
}

/**
 * Create elemental profile from astrological state
 */
export function createElementalProfileFromAstroState(astroState: AstrologicalState): ElementalProperties | null {
  if (!astroState.dominantElement) return null;
  
  // Create elemental profile based on dominant element
  const profile = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  });
  
  // Enhance the dominant element
  Object.keys(profile || {}).forEach(element => {
    if (element === astroState.dominantElement) {
      profile[element as Element] = Math.min(1.0, profile[element as Element] + 0.3);
    }
  });
  
  return profile;
}

/**
 * Calculate compatibility between two elemental properties
 */
export function calculateElementalCompatibility(elementalA: ElementalProperties, elementalB: ElementalProperties): number {
  if (!elementalA || !elementalB) return 0.5;
  
  let totalCompatibility = 0;
  let elementCount = 0;
  
  Object.entries(elementalA || {}).forEach(([element, valueA]) => {
    const valueB = elementalB[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
    
    // Higher compatibility for similar values (following elemental principles)
    const compatibility = 1 - Math.abs((Number(valueA) || 0) - (Number(valueB) || 0));
    totalCompatibility += compatibility;
    elementCount++;
  });
  
  return elementCount > 0 ? (Number(totalCompatibility) || 0) / (Number(elementCount) || 0) : 0.5;
}

/**
 * Get cooking method recommendations based on astrological state
 */
export function getCookingMethodRecommendations(
  astroState: AstrologicalState,
  options: MethodRecommendationOptions = {}
): MethodRecommendation[] {
  const methods = Object.values(allCookingMethodsCombined);
  
  const scoredMethods = (methods || []).map(method => {
    const score = calculateMethodScore(method as unknown as CookingMethodProfile, astroState);
    
    // Apply surgical type casting with variable extraction
    const methodData = method as unknown;
    const methodId = methodData?.id || methodData?.name || 'unknown';
    const methodName = methodData?.name || 'Unknown Method';
    const elementalEffect = methodData?.elementalEffect || createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  });
    const astrologicalInfluences = methodData?.astrologicalInfluences || {};
    const description = methodData?.description || 'Recommended cooking method';
    
    return {
        method: {
          id: methodId,
          name: methodName,
          elementalEffect: elementalEffect,
          astrologicalInfluences: astrologicalInfluences
        },
        score: score,
        reasons: [description]
      } as unknown as MethodRecommendation;
  });
  
  const limit = ((options as unknown as Record<string, unknown>)).limit || 5;
  return scoredMethods
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, limit);
}

export function getElementForSign(sign: string): Element {
  const fireSigns = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius']; // Fixed casing
  const waterSigns = ['cancer', 'scorpio', 'pisces'];
  
  const signLower = sign?.toLowerCase();
  
  if (fireSigns.includes(signLower)) return 'Fire';
  if (earthSigns.includes(signLower)) return 'Earth';
  if (airSigns.includes(signLower)) return 'Air';
  if (waterSigns.includes(signLower)) return 'Water';
  
  return 'Fire'; // Default
}

// ===== EXPORTS =====

export type {
  CookingMethodData,
  CookingMethodDictionary
};

// Export the cooking method data
export { allCookingMethodsCombined as getAllCookingMethods };

// Add the missing functions needed by testRecommendations.ts

/**
 * Get holistic cooking recommendations based on ingredient properties
 * This function combines various factors for a more comprehensive recommendation
 */
export function getHolisticCookingRecommendations(
  ingredient: Record<string, unknown>,
  astroState?: Record<string, unknown>,
  season?: string,
  includeReasons = false,
  availableMethods: string[] = [],
  limit = 5
): { method: string; compatibility: number; reason?: string }[] {
  try {
    // Default to empty elementalProperties if not provided
    const elementalProperties = ingredient.transformedElementalProperties || 
                               { Fire: ingredient.Fire || 0.25, Water: ingredient.Water || 0.25, Earth: ingredient.Earth || 0.25, Air: ingredient.Air || 0.25  };
    
    // Get recommended methods
    const recommendations = getRecommendedCookingMethods(
      elementalProperties,
      undefined, // zodiac sign
      undefined, // planets
      season as unknown
    );
    
    // Filter by available methods if provided
    const filteredRecs = (availableMethods || []).length > 0
      ? (recommendations || []).filter(rec => 
          (availableMethods || []).some(method => 
            areSimilarMethods((rec as unknown).method || (rec as unknown).name || (rec as unknown).id, method)
          )
        )
      : recommendations;
    
    // Format the results with safe property access
    return filteredRecs.slice(0, limit || 5).map(rec => ({
      method: (rec as unknown).method?.name || (rec as unknown).method?.id || (rec as unknown).name || (rec as unknown).id || 'unknown',
      compatibility: (Number((rec as unknown).score) || 0) * (Number(100) || 0),
      reason: includeReasons ? ((rec as unknown).reasons?.[0] || `Good match for ${ingredient.name}`) : undefined
    }));
  } catch (error) {
    // console.error('Error in getHolisticCookingRecommendations:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get recommended cooking methods specifically for an ingredient
 * This function focuses on elemental compatibility
 */
export function getRecommendedCookingMethodsForIngredient(
  ingredient: Record<string, unknown>,
  cookingMethods: unknown[],
  limit = 5
): { method: string; compatibility: number }[] {
  try {
    // Extract elemental properties from ingredient
    const elementalProps = {
      Fire: ingredient.Fire || 0.25,
      Water: ingredient.Water || 0.25,
      Earth: ingredient.Earth || 0.25,
      Air: ingredient.Air || 0.25,
    };
    
    // Calculate compatibility for each method
    const scoredMethods = (cookingMethods || []).map(method => {
      const methodElement = method.element?.toLowerCase();
      
      // Simple compatibility based on elemental harmony
      let compatibility = 0.5; // Base score
      
      // Boost score for matching element
      if (methodElement === ingredient.element?.toLowerCase()) {
        compatibility += 0.3;
      }
      
      // Further adjust based on elemental values
      if (methodElement === 'Fire') compatibility += elementalProps.Fire * 0.2;
      if (methodElement === 'Water') compatibility += elementalProps.Water * 0.2;
      if (methodElement === 'Earth') compatibility += elementalProps.Earth * 0.2;
      if (methodElement === 'Air') compatibility += elementalProps.Air * 0.2;
      
      return {
        method: method.name,
        compatibility: Math.min(compatibility * 100, 100) // Cap at 100%
      };
    });
    
    // Sort by compatibility and limit results
    return scoredMethods
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, limit);
  } catch (error) {
    // console.error('Error in getRecommendedCookingMethodsForIngredient:', error);
    // Return empty array as fallback
    return [];
  }
} 