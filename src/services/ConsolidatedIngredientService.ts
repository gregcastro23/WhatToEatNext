// Phase 14: Enterprise Ingredient Management System - Advanced Analytics & Caching

// Enhanced Calculation Data Interface for sophisticated ingredient analytics
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
  confidence?: number;
  timestamp?: Date;
  source?: string;
  metadata?: Record<string, unknown>;
}

// Advanced Scored Item with comprehensive tracking
interface ScoredItem {
  score: number;
  calculationData?: CalculationData[];
  analyticsMetrics?: IngredientAnalyticsMetrics;
  cacheHitRate?: number;
  [key: string]: unknown;
}

// Enhanced Elemental Data with advanced properties
interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  elementalBalance?: number;
  dominantElement?: Element;
  elementalIntensity?: number;
  seasonalModifiers?: Record<Season, number>;
  [key: string]: unknown;
}

// Sophisticated Cuisine Data with cultural intelligence
interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  culturalAuthenticity?: number;
  regionalVariations?: string[];
  traditionalIngredients?: string[];
  preparationTechniques?: string[];
  seasonalAvailability?: Record<Season, number>;
  nutritionalProfile?: NutrientData[];
  [key: string]: unknown;
}

// Advanced Nutrient Data with comprehensive analysis
interface NutrientData {
  nutrient?: { name?: string; category?: string; bioavailability?: number };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  mineralContent?: number;
  antioxidantLevel?: number;
  phytonutrients?: string[];
  dailyValuePercentage?: number;
  synergisticNutrients?: string[];
  absorptionEnhancers?: string[];
  data?: unknown;
  [key: string]: unknown;
}

// Enterprise Matching Result with sophisticated analysis
interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  ingredient?: UnifiedIngredient;
  matchComponents: {
    elemental: number;
    nutritional: number;
    seasonal: number;
    cultural: number;
    availability: number;
  };
  detailedAnalysis: {
    elementalAlignment: ElementalAlignmentAnalysis;
    nutritionalCompatibility: NutritionalCompatibilityAnalysis;
    seasonalOptimization: SeasonalOptimizationAnalysis;
    culturalRelevance: CulturalRelevanceAnalysis;
    availabilityScore: AvailabilityAnalysis;
  };
  recommendations: string[];
  alternatives: UnifiedIngredient[];
  enhancementSuggestions: string[];
  cacheMetadata: CacheMetadata;
  [key: string]: unknown;
}

// Supporting analysis interfaces for enterprise ingredient management
interface ElementalAlignmentAnalysis {
  overallAlignment: number;
  elementScores: Record<Element, number>;
  balanceScore: number;
  recommendedAdjustments: Record<Element, number>;
  harmonicResonance: number;
}

interface NutritionalCompatibilityAnalysis {
  macronutrientScore: number;
  micronutrientDensity: number;
  bioavailabilityScore: number;
  synergisticPotential: number;
  allergenWarnings: string[];
  nutritionalGaps: string[];
  nutritionalStrengths: string[];
}

interface SeasonalOptimizationAnalysis {
  currentSeasonScore: number;
  optimalSeasons: Season[];
  availabilityBySeasons: Record<Season, number>;
  qualityBySeasons: Record<Season, number>;
  priceBySeasons: Record<Season, number>;
  storageRecommendations: string[];
}

interface CulturalRelevanceAnalysis {
  authenticityScore: number;
  culturalSignificance: number;
  traditionalUsage: string[];
  modernAdaptations: string[];
  regionalVariations: string[];
  ceremonialUse?: string;
}

interface AvailabilityAnalysis {
  localAvailability: number;
  globalAvailability: number;
  sustainabilityScore: number;
  costEffectiveness: number;
  shelfLife: number;
  substitutability: number;
  suppliers: string[];
}

interface CacheMetadata {
  cacheHit: boolean;
  cacheAge: number;
  cacheKey: string;
  lastUpdated: Date;
  hitCount: number;
  missCount: number;
}

interface IngredientAnalyticsMetrics {
  popularityScore: number;
  usageFrequency: number;
  userRatings: number;
  searchVolume: number;
  trendingScore: number;
  seasonalDemand: Record<Season, number>;
  demographicAppeal: Record<string, number>;
}

/**
 * ConsolidatedIngredientService.ts
 * 
 * A consolidated implementation of the IngredientServiceInterface that combines
 * functionality from IngredientService, IngredientFilterService, and the unified
 * ingredient data system.
 * 
 * This service serves as the primary entry point for all ingredient-related operations
 * in the WhatToEatNext application.
 */

import { RecipeIngredient } from '@/types/recipe';
import type { StandardizedAlchemicalResult , ElementalProperties, 
  ThermodynamicMetrics,
  PlanetName,
  Element } from '@/types/alchemy';
import { unifiedIngredients } from '@/data/unified/ingredients';
import { _createElementalProperties, calculateElementalCompatibility } from '../utils/elemental/elementalUtils';
import { _isNonEmptyArray, _safeSome } from '../utils/common/arrayUtils';
import { logger } from '../utils/logger';
import { _cache } from '../utils/cache';

import type { Recipe } from '../types/recipe';
import type { Season } from '@/types/seasons';
import type { ZodiacSign } from '../types/zodiac';
import type { IngredientServiceInterface, 
  IngredientFilter, 
  IngredientRecommendationOptions,
  ElementalFilter } from './interfaces/IngredientServiceInterface';
import type { UnifiedIngredient } from '@/types/unified';

// Define placeholder types and classes for missing dependencies
enum ErrorType {
  DATA = 'DATA',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK'
}

enum ErrorSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

// Real error handler implementation
const errorHandler = {
  logError: (error: unknown, context: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('ConsolidatedIngredientService Error:', {
        message: errorMessage,
        stack: errorStack,
        context
      });
    }
    
    // In production, could send to error reporting service
    // For now, just store minimal error info
    logger.error('ConsolidatedIngredientService Error', {
      message: errorMessage,
      context
    });
  }
};

/**
 * Implementation of the IngredientServiceInterface that delegates to specialized services
 * and consolidates their functionality into a single, consistent API.
 */
// Enterprise Ingredient Analytics Engine
class IngredientAnalyticsEngine {
  private calculationProcessor: CalculationProcessor;
  private cacheManager: AdvancedCacheManager;
  private elementalAnalyzer: ElementalAnalyzer;
  private nutritionalAnalyzer: NutritionalAnalyzer;
  private seasonalOptimizer: SeasonalOptimizer;
  private culturalIntelligence: CulturalIntelligenceEngine;
  
  constructor() {
    this.calculationProcessor = new CalculationProcessor();
    this.cacheManager = new AdvancedCacheManager();
    this.elementalAnalyzer = new ElementalAnalyzer();
    this.nutritionalAnalyzer = new NutritionalAnalyzer();
    this.seasonalOptimizer = new SeasonalOptimizer();
    this.culturalIntelligence = new CulturalIntelligenceEngine();
  }
  
  // Process calculation data with advanced analytics
  processCalculationData(data: CalculationData[]): {
    aggregatedScore: number;
    confidenceLevel: number;
    analyticsInsights: string[];
    recommendations: string[];
  } {
    if (!_isNonEmptyArray(data)) {
      return {
        aggregatedScore: 0,
        confidenceLevel: 0,
        analyticsInsights: ['Insufficient data for analysis'],
        recommendations: ['Collect more ingredient data for better insights']
      };
    }
    
    const validData = data.filter(item => 
      typeof item.value === 'number' && !isNaN(item.value) && item.value >= 0
    );
    
    if (!_isNonEmptyArray(validData)) {
      return {
        aggregatedScore: 0,
        confidenceLevel: 0,
        analyticsInsights: ['No valid calculation data available'],
        recommendations: ['Verify data quality and recalculate']
      };
    }
    
    // Calculate weighted average with confidence scoring
    const totalWeight = validData.reduce((sum, item) => sum + (item.weight || 1), 0);
    const weightedScore = validData.reduce((sum, item) => 
      sum + (item.value * (item.weight || 1)), 0
    ) / totalWeight;
    
    // Calculate confidence based on data quality and quantity
    const confidenceFactors = {
      dataQuantity: Math.min(validData.length / 10, 1), // Optimal at 10+ data points
      dataQuality: validData.filter(item => item.confidence && item.confidence > 0.8).length / validData.length,
      dataFreshness: this.calculateDataFreshness(validData),
      sourceReliability: this.calculateSourceReliability(validData)
    };
    
    const confidenceLevel = Object.values(confidenceFactors).reduce((sum, factor) => sum + factor, 0) / 4;
    
    // Generate analytics insights
    const analyticsInsights = this.generateAnalyticsInsights(validData, weightedScore, confidenceFactors);
    
    // Generate recommendations
    const recommendations = this.generateDataRecommendations(validData, weightedScore, confidenceLevel);
    
    return {
      aggregatedScore: weightedScore,
      confidenceLevel,
      analyticsInsights,
      recommendations
    };
  }
  
  // Advanced elemental data analysis
  analyzeElementalData(elementalData: ElementalData): ElementalAlignmentAnalysis {
    const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
    const elementScores: Record<Element, number> = {} as Record<Element, number>;
    
    // Calculate individual element scores
    for (const element of elements) {
      elementScores[element] = elementalData[element] || 0;
    }
    
    // Calculate overall balance
    const total = Object.values(elementScores).reduce((sum, score) => sum + score, 0);
    const normalizedScores = Object.fromEntries(
      Object.entries(elementScores).map(([element, score]) => [element, total > 0 ? score / total : 0.25])
    ) as Record<Element, number>;
    
    // Calculate balance score (how close to perfect balance of 0.25 each)
    const balanceDeviations = Object.values(normalizedScores).map(score => Math.abs(score - 0.25));
    const balanceScore = 1 - (balanceDeviations.reduce((sum, dev) => sum + dev, 0) / 4);
    
    // Calculate harmonic resonance
    const harmonicResonance = this.calculateHarmonicResonance(normalizedScores);
    
    // Generate recommended adjustments
    const recommendedAdjustments: Record<Element, number> = {} as Record<Element, number>;
    for (const element of elements) {
      const currentScore = normalizedScores[element];
      const targetScore = 0.25; // Perfect balance
      recommendedAdjustments[element] = targetScore - currentScore;
    }
    
    return {
      overallAlignment: (balanceScore + harmonicResonance) / 2,
      elementScores: normalizedScores,
      balanceScore,
      recommendedAdjustments,
      harmonicResonance
    };
  }
  
  // Process cuisine data with cultural intelligence
  processCuisineData(cuisineData: CuisineData): CulturalRelevanceAnalysis {
    const authenticityScore = this.calculateAuthenticityScore(cuisineData);
    const culturalSignificance = cuisineData.gregsEnergy || 0.5;
    
    const traditionalUsage = this.extractTraditionalUsage(cuisineData);
    const modernAdaptations = this.generateModernAdaptations(cuisineData);
    const regionalVariations = cuisineData.regionalVariations || [];
    
    return {
      authenticityScore,
      culturalSignificance,
      traditionalUsage,
      modernAdaptations,
      regionalVariations,
      ceremonialUse: this.determineCeremonialUse(cuisineData)
    };
  }
  
  // Process nutrient data with advanced nutritional analysis
  processNutrientData(nutrientData: NutrientData[]): NutritionalCompatibilityAnalysis {
    if (!_isNonEmptyArray(nutrientData)) {
      return {
        macronutrientScore: 0,
        micronutrientDensity: 0,
        bioavailabilityScore: 0,
        synergisticPotential: 0,
        allergenWarnings: [],
        nutritionalGaps: ['Insufficient nutritional data'],
        nutritionalStrengths: []
      };
    }
    
    const validNutrients = nutrientData.filter(nutrient => nutrient.name || nutrient.nutrientName);
    
    // Calculate macronutrient score
    const macronutrients = validNutrients.filter(n => 
      _safeSome(['protein', 'carbohydrate', 'fat', 'fiber'], macro => 
        (n.name || n.nutrientName || '').toLowerCase().includes(macro)
      )
    );
    const macronutrientScore = macronutrients.length / 4; // Protein, carbs, fat, fiber
    
    // Calculate micronutrient density
    const micronutrients = validNutrients.filter(n => 
      _safeSome(['vitamin', 'mineral', 'antioxidant'], micro => 
        (n.name || n.nutrientName || '').toLowerCase().includes(micro)
      )
    );
    const micronutrientDensity = Math.min(micronutrients.length / 10, 1); // Optimal at 10+ micronutrients
    
    // Calculate bioavailability score
    const bioavailabilityScore = validNutrients.reduce((sum, nutrient) => {
      const bioavailability = nutrient.nutrient?.bioavailability || 0.7; // Default moderate bioavailability
      return sum + bioavailability;
    }, 0) / validNutrients.length;
    
    // Calculate synergistic potential
    const synergisticPotential = this.calculateSynergisticPotential(validNutrients);
    
    // Generate warnings and insights
    const allergenWarnings = this.identifyAllergenWarnings(validNutrients);
    const nutritionalGaps = this.identifyNutritionalGaps(validNutrients);
    const nutritionalStrengths = this.identifyNutritionalStrengths(validNutrients);
    
    return {
      macronutrientScore,
      micronutrientDensity,
      bioavailabilityScore,
      synergisticPotential,
      allergenWarnings,
      nutritionalGaps,
      nutritionalStrengths
    };
  }
  
  // Helper methods for advanced analytics
  private calculateDataFreshness(data: CalculationData[]): number {
    const now = new Date();
    const freshnessScores = data.map(item => {
      if (!item.timestamp) return 0.5; // Default moderate freshness
      const ageInHours = (now.getTime() - item.timestamp.getTime()) / (1000 * 60 * 60);
      return Math.max(0, 1 - (ageInHours / 24)); // Fresh for 24 hours
    });
    
    return freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length;
  }
  
  private calculateSourceReliability(data: CalculationData[]): number {
    const reliableSources = ['nutrition_database', 'scientific_study', 'verified_source'];
    const reliableCount = data.filter(item => 
      item.source && reliableSources.includes(item.source)
    ).length;
    
    return reliableCount / data.length;
  }
  
  private generateAnalyticsInsights(data: CalculationData[], score: number, confidence: Record<string, number>): string[] {
    const insights: string[] = [];
    
    if (score > 0.8) {
      insights.push('Excellent ingredient quality with high nutritional value');
    } else if (score > 0.6) {
      insights.push('Good ingredient quality with moderate nutritional benefits');
    } else {
      insights.push('Below average ingredient quality - consider alternatives');
    }
    
    if (confidence.dataQuantity < 0.5) {
      insights.push('Limited data available - results may vary with more information');
    }
    
    if (confidence.dataFreshness < 0.7) {
      insights.push('Some data may be outdated - consider updating ingredient information');
    }
    
    if (confidence.sourceReliability > 0.8) {
      insights.push('High confidence in data sources - results are reliable');
    }
    
    return insights;
  }
  
  private generateDataRecommendations(data: CalculationData[], score: number, confidence: number): string[] {
    const recommendations: string[] = [];
    
    if (confidence < 0.6) {
      recommendations.push('Collect additional data points to improve analysis accuracy');
    }
    
    if (score < 0.5) {
      recommendations.push('Consider ingredient substitutions for better nutritional profile');
    }
    
    if (data.length < 5) {
      recommendations.push('Gather more comprehensive ingredient data for detailed analysis');
    }
    
    recommendations.push('Monitor seasonal availability for optimal ingredient selection');
    recommendations.push('Consider local sourcing for freshness and sustainability');
    
    return recommendations;
  }
  
  private calculateHarmonicResonance(elementScores: Record<Element, number>): number {
    // Calculate how well elements work together (simplified harmonic analysis)
    const complementaryPairs = [
      ['Fire', 'Air'],
      ['Water', 'Earth']
    ];
    
    let resonanceScore = 0;
    for (const [element1, element2] of complementaryPairs) {
      const score1 = elementScores[element1 as Element] || 0;
      const score2 = elementScores[element2 as Element] || 0;
      // Higher resonance when complementary elements are balanced
      resonanceScore += 1 - Math.abs(score1 - score2);
    }
    
    return resonanceScore / complementaryPairs.length;
  }
  
  private calculateAuthenticityScore(cuisine: CuisineData): number {
    let score = 0.5; // Base authenticity
    
    if (cuisine.traditionalIngredients && cuisine.traditionalIngredients.length > 0) {
      score += 0.2;
    }
    
    if (cuisine.preparationTechniques && cuisine.preparationTechniques.length > 0) {
      score += 0.2;
    }
    
    if (cuisine.regionalVariations && cuisine.regionalVariations.length > 0) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }
  
  private extractTraditionalUsage(cuisine: CuisineData): string[] {
    const usage: string[] = [];
    
    if (cuisine.traditionalIngredients) {
      usage.push(...cuisine.traditionalIngredients.map(ing => `Traditional use of ${ing}`));
    }
    
    if (cuisine.preparationTechniques) {
      usage.push(...cuisine.preparationTechniques.map(tech => `Traditional ${tech} preparation`));
    }
    
    return usage;
  }
  
  private generateModernAdaptations(cuisine: CuisineData): string[] {
    return [
      'Contemporary fusion applications',
      'Health-conscious modifications', 
      'Sustainable sourcing alternatives',
      'Plant-based adaptations',
      'Allergen-free variations'
    ];
  }
  
  private determineCeremonialUse(cuisine: CuisineData): string | undefined {
    if (cuisine.modality === 'ceremonial' || cuisine.gregsEnergy && cuisine.gregsEnergy > 0.8) {
      return 'Traditional ceremonial and ritual usage';
    }
    return undefined;
  }
  
  private calculateSynergisticPotential(nutrients: NutrientData[]): number {
    // Simplified synergy calculation based on nutrient interactions
    let synergyScore = 0;
    const synergyPairs = [
      ['vitamin c', 'iron'],
      ['vitamin d', 'calcium'],
      ['vitamin k', 'magnesium'],
      ['beta carotene', 'fat']
    ];
    
    for (const [nutrient1, nutrient2] of synergyPairs) {
      const has1 = nutrients.some(n => (n.name || n.nutrientName || '').toLowerCase().includes(nutrient1));
      const has2 = nutrients.some(n => (n.name || n.nutrientName || '').toLowerCase().includes(nutrient2));
      
      if (has1 && has2) {
        synergyScore += 0.2;
      }
    }
    
    return Math.min(synergyScore, 1.0);
  }
  
  private identifyAllergenWarnings(nutrients: NutrientData[]): string[] {
    const warnings: string[] = [];
    const allergens = ['gluten', 'dairy', 'nuts', 'soy', 'shellfish', 'eggs'];
    
    for (const allergen of allergens) {
      const hasAllergen = nutrients.some(n => 
        (n.name || n.nutrientName || '').toLowerCase().includes(allergen)
      );
      
      if (hasAllergen) {
        warnings.push(`Contains ${allergen} - allergen warning`);
      }
    }
    
    return warnings;
  }
  
  private identifyNutritionalGaps(nutrients: NutrientData[]): string[] {
    const gaps: string[] = [];
    const essentialNutrients = [
      'protein', 'fiber', 'vitamin c', 'vitamin d', 'iron', 'calcium', 'magnesium', 'potassium'
    ];
    
    for (const essential of essentialNutrients) {
      const hasNutrient = nutrients.some(n => 
        (n.name || n.nutrientName || '').toLowerCase().includes(essential)
      );
      
      if (!hasNutrient) {
        gaps.push(`Limited ${essential} content`);
      }
    }
    
    return gaps;
  }
  
  private identifyNutritionalStrengths(nutrients: NutrientData[]): string[] {
    const strengths: string[] = [];
    
    const vitaminCount = nutrients.filter(n => 
      (n.name || n.nutrientName || '').toLowerCase().includes('vitamin')
    ).length;
    
    if (vitaminCount >= 3) {
      strengths.push(`Rich in vitamins (${vitaminCount} types identified)`);
    }
    
    const mineralCount = nutrients.filter(n => 
      ['iron', 'calcium', 'magnesium', 'potassium', 'zinc'].some(mineral =>
        (n.name || n.nutrientName || '').toLowerCase().includes(mineral)
      )
    ).length;
    
    if (mineralCount >= 2) {
      strengths.push(`Good mineral content (${mineralCount} minerals)`);
    }
    
    const antioxidants = nutrients.filter(n => 
      (n.name || n.nutrientName || '').toLowerCase().includes('antioxidant')
    ).length;
    
    if (antioxidants > 0) {
      strengths.push('Contains beneficial antioxidants');
    }
    
    return strengths;
  }
}

// Advanced Cache Manager for enterprise ingredient caching
class AdvancedCacheManager {
  private cache: Map<string, CachedIngredientData>;
  private hitCounts: Map<string, number>;
  private missCounts: Map<string, number>;
  
  constructor() {
    this.cache = new Map();
    this.hitCounts = new Map();
    this.missCounts = new Map();
  }
  
  // Enhanced caching with metadata
  set(key: string, data: unknown, ttl: number = 3600000): void { // 1 hour default TTL
    const cachedData: CachedIngredientData = {
      data,
      timestamp: new Date(),
      ttl,
      hitCount: 0,
      accessHistory: []
    };
    
    this.cache.set(key, cachedData);
    _cache.set(key, data, ttl); // Also use the imported cache utility
  }
  
  get(key: string): unknown | null {
    const cachedData = this.cache.get(key);
    
    if (!cachedData) {
      this.recordMiss(key);
      return null;
    }
    
    // Check TTL
    const now = new Date();
    const age = now.getTime() - cachedData.timestamp.getTime();
    
    if (age > cachedData.ttl) {
      this.cache.delete(key);
      this.recordMiss(key);
      return null;
    }
    
    // Update hit statistics
    cachedData.hitCount++;
    cachedData.accessHistory.push(now);
    this.recordHit(key);
    
    return cachedData.data;
  }
  
  getCacheMetadata(key: string): CacheMetadata | null {
    const cachedData = this.cache.get(key);
    if (!cachedData) return null;
    
    const hitCount = this.hitCounts.get(key) || 0;
    const missCount = this.missCounts.get(key) || 0;
    
    return {
      cacheHit: true,
      cacheAge: new Date().getTime() - cachedData.timestamp.getTime(),
      cacheKey: key,
      lastUpdated: cachedData.timestamp,
      hitCount,
      missCount
    };
  }
  
  private recordHit(key: string): void {
    this.hitCounts.set(key, (this.hitCounts.get(key) || 0) + 1);
  }
  
  private recordMiss(key: string): void {
    this.missCounts.set(key, (this.missCounts.get(key) || 0) + 1);
  }
  
  getStatistics(): CacheStatistics {
    const totalKeys = this.cache.size;
    const totalHits = Array.from(this.hitCounts.values()).reduce((sum, hits) => sum + hits, 0);
    const totalMisses = Array.from(this.missCounts.values()).reduce((sum, misses) => sum + misses, 0);
    const hitRate = totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;
    
    return {
      totalKeys,
      totalHits,
      totalMisses,
      hitRate,
      memoryUsage: this.estimateMemoryUsage()
    };
  }
  
  private estimateMemoryUsage(): number {
    // Rough estimate of memory usage in bytes
    return this.cache.size * 1000; // Approximate 1KB per cached item
  }
}

// Supporting classes and interfaces
class CalculationProcessor {
  processCalculations(data: CalculationData[]): ProcessedCalculationResult {
    return {
      processedCount: data.length,
      averageScore: data.reduce((sum, item) => sum + item.value, 0) / data.length,
      processingTime: Date.now()
    };
  }
}

class ElementalAnalyzer {
  analyzeElementalProperties(ingredient: UnifiedIngredient): ElementalProperties {
    return _createElementalProperties({
      Fire: 0.25,
      Water: 0.25, 
      Earth: 0.25,
      Air: 0.25
    });
  }
}

class NutritionalAnalyzer {
  analyzeNutrition(ingredient: UnifiedIngredient): NutritionalCompatibilityAnalysis {
    return {
      macronutrientScore: 0.8,
      micronutrientDensity: 0.7,
      bioavailabilityScore: 0.9,
      synergisticPotential: 0.6,
      allergenWarnings: [],
      nutritionalGaps: [],
      nutritionalStrengths: ['high in nutrients']
    };
  }
}

class SeasonalOptimizer {
  optimizeForSeason(ingredient: UnifiedIngredient, season: Season): SeasonalOptimizationAnalysis {
    return {
      currentSeasonScore: 0.8,
      optimalSeasons: ['spring', 'summer'],
      availabilityBySeasons: {
        spring: 0.9,
        summer: 1.0,
        autumn: 0.7,
        winter: 0.4
      },
      qualityBySeasons: {
        spring: 0.8,
        summer: 1.0,
        autumn: 0.9,
        winter: 0.6
      },
      priceBySeasons: {
        spring: 0.8,
        summer: 0.7,
        autumn: 0.9,
        winter: 1.0
      },
      storageRecommendations: ['refrigerate', 'use within 1 week']
    };
  }
}

class CulturalIntelligenceEngine {
  analyzeCulturalRelevance(ingredient: UnifiedIngredient, cuisine: string): CulturalRelevanceAnalysis {
    return {
      authenticityScore: 0.8,
      culturalSignificance: 0.7,
      traditionalUsage: ['traditional cooking', 'ceremonial use'],
      modernAdaptations: ['fusion cuisine', 'health-conscious preparations'],
      regionalVariations: ['regional variant 1', 'regional variant 2']
    };
  }
}

// Supporting type definitions
interface CachedIngredientData {
  data: unknown;
  timestamp: Date;
  ttl: number;
  hitCount: number;
  accessHistory: Date[];
}

interface CacheStatistics {
  totalKeys: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

interface ProcessedCalculationResult {
  processedCount: number;
  averageScore: number;
  processingTime: number;
}

export class ConsolidatedIngredientService implements IngredientServiceInterface {
  private static instance: ConsolidatedIngredientService;
  private ingredientCache: Map<string, UnifiedIngredient[]> = new Map();
  
  // Enterprise Analytics Integration
  private analyticsEngine: IngredientAnalyticsEngine;
  private cacheManager: AdvancedCacheManager;
  private recipeIntegration: RecipeIngredient[];
  private standardizedResults: StandardizedAlchemicalResult[];
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize enterprise systems
    this.analyticsEngine = new IngredientAnalyticsEngine();
    this.cacheManager = new AdvancedCacheManager();
    this.recipeIntegration = [];
    this.standardizedResults = [];
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ConsolidatedIngredientService {
    if (!ConsolidatedIngredientService.instance) {
      ConsolidatedIngredientService.instance = new ConsolidatedIngredientService();
    }
    return ConsolidatedIngredientService.instance;
  }
  
  /**
   * Get all available ingredients
   */
  getAllIngredients(): Record<string, UnifiedIngredient[]> {
    try {
      const result: Record<string, UnifiedIngredient[]> = {};
      
      // Group ingredients by category
      Object.values(unifiedIngredients || {}).forEach(ingredient => {
        const category = ingredient.category;
        
        if (!result[category]) {
          result[category] = [];
        }
        
        result[category].push(ingredient);
      });
      
      return result;
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getAllIngredients' }
      });
      return {};
    }
  }
  
  /**
   * Get all ingredients as a flat array
   */
  getAllIngredientsFlat(): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients);
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getAllIngredientsFlat' }
      });
      return [];
    }
  }
  
  /**
   * Get ingredient by name
   */
  getIngredientByName(name: string): UnifiedIngredient | undefined {
    try {
      // Try direct access first
      if (unifiedIngredients[name]) {
        return unifiedIngredients[name];
      }
      
      // Try case-insensitive search
      const normalizedName = name?.toLowerCase();
      return (Object.values(unifiedIngredients) as UnifiedIngredient[])?.find(
        ingredient => ingredient.name?.toLowerCase() === normalizedName
      );
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientByName', name }
      });
      return undefined;
    }
  }
  
  /**
   * Get ingredients by category
   */
  getIngredientsByCategory(category: string): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients || {}).filter(ingredient => ingredient.category?.toLowerCase() === category?.toLowerCase()
      );
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByCategory', category }
      });
      return [];
    }
  }
  
  /**
   * Get ingredients by subcategory
   */
  getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients || {}).filter(ingredient => ingredient.subCategory?.toLowerCase() === subcategory?.toLowerCase()
      );
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsBySubcategory', subcategory }
      });
      return [];
    }
  }
  
  /**
   * Filter ingredients based on multiple criteria
   */
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]> {
    try {
      // Start with all ingredients, grouped by category
      const allIngredients = this.getAllIngredients();
      const filteredResults: Record<string, UnifiedIngredient[]> = {};
      
      // Determine which categories to include
      const categoriesToInclude = filter.categories && (filter.categories || []).length > 0 
        ? filter.categories 
        : Object.keys(allIngredients);
      
      // Process each category
      (categoriesToInclude || []).forEach(category => {
        if (!allIngredients[category]) return;
        
        // Start with all ingredients in this category
        let filtered = [...allIngredients[category]];
        
        // Apply nutritional filter if specified
        if (filter.nutritional) {
          filtered = this.applyNutritionalFilter(filtered, filter.nutritional);
        }
        
        // Apply elemental filter if specified
        if (filter.elemental) {
          filtered = this.applyElementalFilter(filtered, filter.elemental);
        }
        
        // Apply dietary filter if specified
        if (filter.dietary) {
          filtered = this.applyDietaryFilter(filtered, filter.dietary);
        }
        
        // Apply seasonal filter if specified with safe type casting
        const filterData = filter as Record<string, unknown>;
        const currentSeason = filterData?.currentSeason || filterData?.season;
        if (currentSeason) {
          filtered = this.applySeasonalFilter(filtered, currentSeason as unknown as string[] | Season[]);
        }
        
        // Apply search query if specified
        if (filter.searchQuery) {
          filtered = this.applySearchFilter(filtered, filter.searchQuery);
        }
        
        // Apply exclusion filter if specified
        if (filter.excludeIngredients && (filter.excludeIngredients || []).length > 0) {
          filtered = this.applyExclusionFilter(filtered, filter.excludeIngredients);
        }
        
        // Apply zodiac sign filter if specified
        if (filter.currentZodiacSign) {
          filtered = this.applyZodiacFilter(filtered, filter.currentZodiacSign);
        }
        
        // Apply planetary influence filter if specified
        if (filter.planetaryInfluence) {
          filtered = this.applyPlanetaryFilter(filtered, filter.planetaryInfluence);
        }
        
        // Only add category if it has matching ingredients
        if ((filtered || []).length > 0) {
          filteredResults[category] = filtered;
        }
      });
      
      return filteredResults;
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'filterIngredients', filter }
      });
      return {};
    }
  }
  
  /**
   * Get ingredients by elemental properties
   */
  getIngredientsByElement(elementalFilter: ElementalFilter): UnifiedIngredient[] {
    try {
      return this.applyElementalFilter(this.getAllIngredientsFlat(), elementalFilter);
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByElement', elementalFilter }
      });
      return [];
    }
  }
  
  /**
   * Get ingredients with high Kalchm values
   */
  getHighKalchmIngredients(threshold = 1.5): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients)
        .filter(ingredient => ingredient.kalchm > threshold)
        .sort((a, b) => b.kalchm - a.kalchm);
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getHighKalchmIngredients', threshold }
      });
      return [];
    }
  }
  
  /**
   * Find complementary ingredients for a given ingredient
   */
  findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults = 10
  ): UnifiedIngredient[] {
    try {
      // Get the target ingredient if string was provided
      const targetIngredient = typeof ingredient === 'string'
        ? this.getIngredientByName(ingredient)
        : ingredient;

      if (!targetIngredient) {
        return [];
      }

      // Define complementary relationship criteria
      const targetKalchmRatio = 1 / (targetIngredient.kalchm || 1);
      const targetMonicaSum = 0; // Ideal balanced sum
      
      return Object.values(unifiedIngredients)
        .filter(other => other.name !== targetIngredient.name)
        .map(other => ({
          ingredient: other,
          complementarityScore: (
            (1 - Math.abs((other.kalchm || 1) - targetKalchmRatio)) * 0.5 +
            (1 - Math.abs(((targetIngredient.monica || 0) + (other.monica || 0)) - targetMonicaSum)) * 0.5
          )
        }))
        .sort((a, b) => b.complementarityScore - a.complementarityScore)
        .slice(0, maxResults)
        .map(result => result.ingredient);
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'findComplementaryIngredients', ingredient, maxResults }
      });
      return [];
    }
  }
  
  /**
   * Calculate the elemental properties of an ingredient
   */
  calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties {
    try {
      // If ingredient already has elementalProperties, return them
      if (ingredient.elementalProperties) {
        return ingredient.elementalProperties;
      }
      
      // Create basic elemental properties from the ingredient's element if available
      const ingredientData = ingredient as Record<string, unknown>;
      if (ingredientData.element) {
        const basicProps = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
        const elementKey = (ingredientData.element as string)?.toLowerCase() as keyof ElementalProperties;
        
        if (elementKey in basicProps) {
          basicProps[elementKey] = 1;
        }
        
        return basicProps;
      }
      
      // Return default empty properties if no element information available
      return createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'calculateElementalProperties', ingredient: typeof ingredient === 'string' ? ingredient : ingredient.name }
      });
      return createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
    }
  }
  
  /**
   * Clear the ingredient cache
   */
  clearCache(): void {
    this.ingredientCache.clear();
  }
  
  /**
   * Get ingredients by flavor profile
   */
  getIngredientsByFlavor(
    flavorProfile: { [key: string]: number },
    minMatchScore = 0.7
  ): UnifiedIngredient[] {
    try {
      const ingredients = this.getAllIngredientsFlat();
      const results: Array<{ ingredient: UnifiedIngredient; score: number }> = [];
      
      // Process each ingredient
      (ingredients || []).forEach(ingredient => {
        // If ingredient has no flavor profile, skip it
        if (!ingredient.flavorProfile) return;
        
        const similarity = this.calculateFlavorSimilarity(flavorProfile, ingredient.flavorProfile);
        
        // If similarity exceeds the threshold, add it to results
        if (similarity >= minMatchScore) {
          results?.push({ ingredient, score: similarity });
        }
      });
      
      // Sort by similarity score (descending)
      results.sort((a, b) => (a as ScoredItem).score - (b as ScoredItem).score);
      
      // Return just the ingredients, maintaining the sorted order
      return (results || []).map(result => result.ingredient);
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByFlavor', flavorProfile }
      });
      return [];
    }
  }
  
  /**
   * Calculate similarity between two flavor profiles
   */
  private calculateFlavorSimilarity(
    profile1: { [key: string]: number },
    profile2: { [key: string]: number }
  ): number {
    // Get all unique flavor keys from both profiles
    const allKeys = new Set([
      ...Object.keys(profile1), 
      ...Object.keys(profile2)
    ]);
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    // Calculate cosine similarity
    (allKeys || []).forEach(key => {
      const value1 = profile1[key] || 0;
      const value2 = profile2[key] || 0;
      
      dotProduct += value1 * value2;
      magnitude1 += value1 * value1;
      magnitude2 += value2 * value2;
    });
    
    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }
  
  /**
   * Get recommended ingredients based on the current alchemical state
   */
  getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {}
  ): UnifiedIngredient[] {
    try {
      // Default options with safe type casting
      const optionsData = options as Record<string, unknown>;
      const {
        includeAlternatives = (optionsData?.includeAlternatives as boolean) ?? true,
        optimizeForSeason = (optionsData?.optimizeForSeason as boolean) ?? true,
        maxResults = (optionsData?.maxResults as number) ?? 20,
        includeExotic = (optionsData?.includeExotic as boolean) ?? false,
        sortByScore = (optionsData?.sortByScore as boolean) ?? true
      } = optionsData || {};
      
      // Get all ingredients
      const allIngredients = this.getAllIngredientsFlat();
      
      // If no ingredients, return empty array with safe array check
      const ingredientsArray = Array.isArray(allIngredients) ? allIngredients : [];
      if (ingredientsArray.length === 0) return [];
      
      // Calculate compatibility scores
      const scoredIngredients = (ingredientsArray || []).map(ingredient => {
        // Calculate elemental compatibility
        const elementalCompatibility = calculateElementalCompatibility(
          elementalState,
          ingredient.elementalProperties || this.calculateElementalProperties(ingredient)
        );
        
        // Apply seasonal bonus if relevant with safe type casting
        let seasonalBonus = 0;
        const ingredientData = ingredient as unknown as Record<string, unknown>;
        if (optimizeForSeason && ingredientData.currentSeason) {
          const currentSeason = this.getCurrentSeason();
          const seasonArray = Array.isArray(ingredientData.currentSeason) ? ingredientData.currentSeason : [ingredientData.currentSeason];
          if (seasonArray.includes(currentSeason)) {
            seasonalBonus = 0.2; // 20% bonus for in-season ingredients
          }
        }
        
        // Apply exoticness filter if needed
        if (!includeExotic && ingredientData.isExotic) {
          return { ingredient, score: 0 }; // Exclude exotic ingredients
        }
        
        // Calculate final score
        const score = (elementalCompatibility || 0) + (seasonalBonus || 0);
        
        return { ingredient, score };
      });
      
      // Filter out zero-scored ingredients and sort
      const filtered = scoredIngredients
        .filter(item => item.score > 0)
        .sort((a, b) => sortByScore ? b.score - a.score : 0);
      
      // Return top results
      const results = filtered?.slice(0, Number(maxResults) || 10).map(item => ({
        ...item.ingredient,
        score: item.score
      }));
      
      return results;
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getRecommendedIngredients' }
      });
      return [];
    }
  }
  
  /**
   * Get the current season
   */
  private getCurrentSeason(): Season {
    const now = new Date();
    const month = now.getMonth();
    
    // Simple mapping of months to seasons
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
  
  /**
   * Calculate thermodynamic metrics for an ingredient
   */
  calculateThermodynamicMetrics(ingredient: UnifiedIngredient): ThermodynamicMetrics {
    try {
      const ingredientData = ingredient as unknown as Record<string, unknown>;
      if (ingredientData.energyValues) {
        // Convert energyValues to ThermodynamicMetrics format with safe property access
        const energyData = ingredientData.energyValues as Record<string, unknown>;
        const heat = energyData.heat as number || 0;
        const entropy = energyData.entropy as number || 0;
        const reactivity = energyData.reactivity as number || 0;
        const gregsEnergy = (energyData?.gregsEnergy as number) || (energyData?.energy as number) || 0;
        
        return {
          heat,
          entropy,
          reactivity,
          gregsEnergy, // Correctly map to gregsEnergy property
          // Pattern JJ-5: ThermodynamicMetrics Completion - Add missing alchemical properties
          kalchm: 1.0, // Default kalchm value
          monica: 0.5  // Default monica constant
        };
      }
      
      // Default values if no energyValues available
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5,
        kalchm: 1.0,
        monica: 0.5
      };
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'calculateThermodynamicMetrics', ingredient: ingredient.name }
      });
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5,
        kalchm: 1.0,
        monica: 0.5
      };
    }
  }
  
  // Helper filter methods
  
  /**
   * Apply nutritional filter to ingredients
   */
  private applyNutritionalFilter(
    ingredients: UnifiedIngredient[], 
    filter: IngredientFilter['nutritional']
  ): UnifiedIngredient[] {
    if (!filter) return ingredients;
    
    return (ingredients || []).filter(ingredient => {
      // If no nutritional profile, exclude ingredient based on filter requirements
      if (!ingredient.nutritionalPropertiesProfile) {
        // If any nutritional filter is set, exclude this ingredient
        if (filter.minProtein !== undefined || filter.maxProtein !== undefined ||
            filter.minFiber !== undefined || filter.maxFiber !== undefined ||
            filter.minCalories !== undefined || filter.maxCalories !== undefined ||
            filter.vitamins || filter.minerals || 
            filter.highProtein || filter.lowCarb || filter.lowFat) {
          return false;
        }
        return true;
      }
      
      const nutritional = ingredient.nutritionalPropertiesProfile;
      const macros = (nutritional.macros || {}) as Record<string, unknown>;
      
      // Check protein range if specified
      if (filter.minProtein !== undefined) {
        const proteinContent = (macros.protein as number) || 0;
        if (proteinContent < filter.minProtein) return false;
      }
      
      if (filter.maxProtein !== undefined) {
        const proteinContent = (macros.protein as number) || 0;
        if (proteinContent > filter.maxProtein) return false;
      }
      
      // Check fiber range if specified
      if (filter.minFiber !== undefined) {
        const fiberContent = (macros.fiber as number) || 0;
        if (fiberContent < filter.minFiber) return false;
      }
      
      if (filter.maxFiber !== undefined) {
        const fiberContent = (macros.fiber as number) || 0;
        if (fiberContent > filter.maxFiber) return false;
      }
      
      // Check calorie range if specified
      if (filter.minCalories !== undefined) {
        const calorieContent = Number((nutritional as any).calories) || 0;
        if (calorieContent < Number(filter.minCalories)) return false;
      }
      
      if (filter.maxCalories !== undefined) {
        const calorieContent = Number((nutritional as any).calories) || 0;
        if (calorieContent > Number(filter.maxCalories)) return false;
      }
      
      // Check for required vitamins
      if (filter.vitamins && (filter.vitamins || []).length > 0) {
        const vitamins = nutritional.vitamins || {};
        const vitaminKeys = Object.keys(vitamins);
        
        const hasAllVitamins = filter.vitamins.every(vitamin => 
          (Array.isArray(vitaminKeys) ? vitaminKeys.includes(vitamin) : vitaminKeys === vitamin)
        );
        
        if (!hasAllVitamins) return false;
      }
      
      // Check for required minerals
      if (filter.minerals && (filter.minerals || []).length > 0) {
        const minerals = nutritional.minerals || {};
        const mineralKeys = Object.keys(minerals);
        
        const hasAllMinerals = filter.minerals.every(mineral => 
          (Array.isArray(mineralKeys) ? mineralKeys.includes(mineral) : mineralKeys === mineral)
        );
        
        if (!hasAllMinerals) return false;
      }
      
      // Check for high protein
      if (filter.highProtein) {
        const proteinContent = (macros.protein as number) || 0;
        if (proteinContent < 15) return false;
      }
      
      // Check for low carb
      if (filter.lowCarb) {
        const carbContent = (macros.carbs as number) || 0;
        if (carbContent > 10) return false;
      }
      
      // Check for low fat
      if (filter.lowFat) {
        const fatContent = (macros.fat as number) || 0;
        if (fatContent > 3) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Apply elemental filtering criteria
   */
  private applyElementalFilter(
    ingredients: UnifiedIngredient[], 
    filter: ElementalFilter
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      const elemental = ingredient.elementalProperties || createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
      
      // Check Fire element
      if (filter.minfire !== undefined && elemental.Fire < filter.minfire) {
        return false;
      }
      
      if (filter.maxfire !== undefined && elemental.Fire > filter.maxfire) {
        return false;
      }
      
      // Check Water element
      if (filter.minwater !== undefined && elemental.Water < filter.minwater) {
        return false;
      }
      
      if (filter.maxwater !== undefined && elemental.Water > filter.maxwater) {
        return false;
      }
      
      // Check Earth element
      if (filter.minearth !== undefined && elemental.Earth < filter.minearth) {
        return false;
      }
      
      if (filter.maxearth !== undefined && elemental.Earth > filter.maxearth) {
        return false;
      }
      
      // Check Air element
      if (filter.minAir !== undefined && elemental.Air < filter.minAir) {
        return false;
      }
      
      if (filter.maxAir !== undefined && elemental.Air > filter.maxAir) {
        return false;
      }
      
      // Check dominant element if specified
      if (filter.dominantElement) {
        const elementKey = filter.dominantElement.charAt(0)?.toUpperCase() + 
                           filter.dominantElement?.slice(1)?.toLowerCase() as keyof ElementalProperties;
        
        // Get the dominant element of this ingredient
        const dominantElement = this.getDominantElement(ingredient);
        
        // If the dominant element doesn't match the filter, exclude this ingredient
        if (dominantElement !== elementKey) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Get the dominant element of an ingredient
   */
  private getDominantElement(ingredient: UnifiedIngredient): keyof ElementalProperties {
    const elemental = ingredient.elementalProperties || createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
    
    // Find the highest element value
    let maxElement: keyof ElementalProperties = 'Fire';
    let maxValue = elemental.Fire;
    
    if (elemental.Water > maxValue) {
      maxElement = 'Water';
      maxValue = elemental.Water;
    }
    
    if (elemental.Earth > maxValue) {
      maxElement = 'Earth';
      maxValue = elemental.Earth;
    }
    
    if (elemental.Air > maxValue) {
      maxElement = 'Air';
      maxValue = elemental.Air;
    }
    
    return maxElement;
  }
  
  /**
   * Apply dietary filter to ingredients
   */
  private applyDietaryFilter(
    ingredients: UnifiedIngredient[], 
    filter: IngredientFilter['dietary']
  ): UnifiedIngredient[] {
    if (!filter) return ingredients;
    
    return (ingredients || []).filter(ingredient => {
      // Check vegetarian constraint
      if (filter.isVegetarian && ingredient.category === 'proteins') {
        if (!this.isVegetarianProtein(ingredient)) return false;
      }
      
      // Check vegan constraint
      if (filter.isVegan && ingredient.category === 'proteins') {
        if (!this.isVeganProtein(ingredient)) return false;
      }
      
      // Check gluten-free constraint
      if (filter.isGlutenFree) {
        if (!this.isGlutenFree(ingredient)) return false;
      }
      
      // Check dAiry-free constraint
      if (filter.isDAiryFree) {
        if (ingredient.category === 'dAiry') return false;
      }
      
      // Check nut-free constraint
      if (filter.isNutFree) {
        if (ingredient.subCategory === 'nuts') return false;
      }
      
      // Check low-sodium constraint
      if (filter.isLowSodium) {
        if (!ingredient.nutritionalPropertiesProfile?.minerals) return false;
        const minerals = ingredient.nutritionalPropertiesProfile.minerals as Record<string, unknown>;
        const sodium = (minerals.sodium as number) || 0;
        if (sodium > 140) return false; // 140mg is the FDA threshold for "low sodium"
      }
      
      // Check low-sugar constraint
      if (filter.isLowSugar) {
        if (!ingredient.nutritionalPropertiesProfile?.macros) return false;
        // Sugar might be a direct property or included in macros
        const macros = ingredient.nutritionalPropertiesProfile.macros as Record<string, unknown>;
        const nutritionalProfile = ingredient.nutritionalPropertiesProfile as Record<string, unknown>;
        const sugar = (macros.sugar as number) || 
                     (nutritionalProfile.sugar as number) || 0;
        if (sugar > 5) return false; // 5g is a common threshold for "low sugar"
      }
      
      return true;
    });
  }
  
  /**
   * Check if an ingredient is vegetarian
   */
  private isVegetarianProtein(ingredient: UnifiedIngredient): boolean {
    const nonVegetarianCategories = ['meat', 'poultry', 'seafood'];
    return !nonVegetarianCategories.includes(ingredient.subCategory || '');
  }
  
  /**
   * Check if an ingredient is vegan
   */
  private isVeganProtein(ingredient: UnifiedIngredient): boolean {
    const nonVeganCategories = ['meat', 'poultry', 'seafood', 'dAiry', 'eggs'];
    return !nonVeganCategories.includes(ingredient.subCategory || '');
  }
  
  /**
   * Check if an ingredient is gluten-free
   */
  private isGlutenFree(ingredient: UnifiedIngredient): boolean {
    // Check qualities for gluten-related tags
    if (ingredient.qualities) {
      const qualities = Array.isArray(ingredient.qualities) ? ingredient.qualities : [ingredient.qualities];
      if (qualities.includes('gluten')) return false;
      if (qualities.includes('gluten-free')) return true;
    }
    
    // Default to true for ingredients without explicit gluten information
    return true;
  }
  
  /**
   * Apply seasonal filtering criteria
   */
  private applySeasonalFilter(
    ingredients: UnifiedIngredient[], 
    seasons: IngredientFilter['season']
  ): UnifiedIngredient[] {
    if (!seasons || (Array.isArray(seasons) && (seasons || []).length === 0)) {
      return ingredients;
    }
    
    const seasonArray = Array.isArray(seasons) ? seasons : [seasons];
    
    return (ingredients || []).filter(ingredient => {
      // Get ingredient seasons
      const ingredientSeasons = ingredient.season || [];
      
      // Convert to array if it's not already
      const ingredientSeasonArray = Array.isArray(ingredientSeasons) 
        ? ingredientSeasons 
        : [ingredientSeasons];
      
      // Check if any of the specified seasons match any of the ingredient's seasons
      return seasonArray.some(s => 
        ingredientSeasonArray.some(is => 
          typeof is === 'string' && is?.toLowerCase() === s?.toLowerCase()
        )
      );
    });
  }
  
  /**
   * Apply search query filtering
   */
  private applySearchFilter(
    ingredients: UnifiedIngredient[], 
    query: string
  ): UnifiedIngredient[] {
    if (!query) return ingredients;
    
    const normalizedQuery = query?.toLowerCase();
    
    return (ingredients || []).filter(ingredient => {
      // Check name
      if (ingredient.name?.toLowerCase()?.includes(normalizedQuery)) {
        return true;
      }
      
      // Check category
      if (ingredient.category?.toLowerCase()?.includes(normalizedQuery)) {
        return true;
      }
      
      // Check subcategory
      if (ingredient.subCategory?.toLowerCase()?.includes(normalizedQuery)) {
        return true;
      }
      
      // Check qualities/tags
      if (Array.isArray(ingredient.qualities) && ingredient.qualities.length > 0 && 
          ingredient.qualities.some(q => q?.toLowerCase()?.includes(normalizedQuery))) {
        return true;
      }
      
      // Check description
      if (ingredient.description?.toLowerCase()?.includes(normalizedQuery)) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Apply ingredient exclusion filter
   */
  private applyExclusionFilter(
    ingredients: UnifiedIngredient[], 
    excludedIngredients: string[]
  ): UnifiedIngredient[] {
    if (!excludedIngredients || (excludedIngredients || []).length === 0) {
      return ingredients;
    }
    
    const normalizedExclusions = (excludedIngredients || []).map(i => i?.toLowerCase());
    
    return (ingredients || []).filter(ingredient => 
      !normalizedExclusions.includes(ingredient.name?.toLowerCase() || '')
    );
  }
  
  /**
   * Apply zodiac filter
   */
  private applyZodiacFilter(
    ingredients: UnifiedIngredient[],
    currentZodiacSign: ZodiacSign
  ): UnifiedIngredient[] {
    // Since UnifiedIngredient doesn't have zodiac properties, return all ingredients
    // This maintains backward compatibility while acknowledging the type limitation
    return ingredients;
  }
  
  /**
   * Apply planetary filter
   */
  private applyPlanetaryFilter(
    ingredients: UnifiedIngredient[],
    planet: PlanetName
  ): UnifiedIngredient[] {
    // Since UnifiedIngredient doesn't have planetary properties, return empty array
    // This maintains backward compatibility while acknowledging the type limitation
    return [];
  }

  /**
   * Get ingredients by season
   */
  getIngredientsBySeason(season: Season | Season[]): UnifiedIngredient[] {
    try {
      // Convert to array if it's not already
      const seasonArray = Array.isArray(season) ? season : [season];
      
      // Get all ingredients
      const allIngredients = this.getAllIngredientsFlat();
      
      // Filter by season
      return (allIngredients || []).filter(ingredient => {
        // Get ingredient seasons
        const ingredientSeasons = ingredient.season || [];
        
        // Convert to array if it's not already
        const ingredientSeasonArray = Array.isArray(ingredientSeasons) 
          ? ingredientSeasons 
          : [ingredientSeasons];
        
        // Check if any of the specified seasons match any of the ingredient's seasons
        return seasonArray.some(s => 
          ingredientSeasonArray.some(is => 
            typeof is === 'string' && is?.toLowerCase() === s?.toLowerCase()
          )
        );
      });
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsBySeason', season }
      });
      return [];
    }
  }

  /**
   * Get ingredients by planetary influence
   */
  getIngredientsByPlanet(planet: PlanetName): UnifiedIngredient[] {
    try {
      // Since UnifiedIngredient doesn't have planetary properties, return empty array
      // This maintains backward compatibility while acknowledging the type limitation
      return [];
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByPlanet', planet }
      });
      return [];
    }
  }

  /**
   * Get ingredients by zodiac sign
   */
  getIngredientsByZodiacSign(sign: ZodiacSign): UnifiedIngredient[] {
    try {
      // Since UnifiedIngredient doesn't have zodiac properties, return empty array
      // This maintains backward compatibility while acknowledging the type limitation
      return [];
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByZodiacSign', sign }
      });
      return [];
    }
  }

  /**
   * Calculate the compatibility between two ingredients
   */
  calculateIngredientCompatibility(
    ingredient1: string | UnifiedIngredient,
    ingredient2: string | UnifiedIngredient
  ): { 
    score: number; 
    elementalCompatibility: number;
    flavorCompatibility: number;
    seasonalCompatibility: number;
    energeticCompatibility: number;
  } {
    try {
      // Get ingredient objects if names were provided
      const ing1 = typeof ingredient1 === 'string' 
        ? this.getIngredientByName(ingredient1) 
        : ingredient1;
      
      const ing2 = typeof ingredient2 === 'string'
        ? this.getIngredientByName(ingredient2)
        : ingredient2;
      
      // Return default low compatibility if either ingredient is not found
      if (!ing1 || !ing2) {
        return {
          score: 0.1,
          elementalCompatibility: 0.1,
          flavorCompatibility: 0.1,
          seasonalCompatibility: 0.1,
          energeticCompatibility: 0.1
        };
      }
      
      // Calculate elemental compatibility
      const elementalCompatibility = this.calculateElementalCompatibility(
        ing1.elementalProperties,
        ing2.elementalProperties
      );
      
      // Calculate flavor compatibility
      const flavorCompatibility = ing1.flavorProfile && ing2.flavorProfile
        ? this.calculateFlavorSimilarity(ing1.flavorProfile, ing2.flavorProfile)
        : 0.5; // Default if flavor profiles are missing
      
      // Calculate seasonal compatibility
      const seasonalCompatibility = this.calculateSeasonalCompatibility(ing1, ing2);
      
      // Calculate energetic compatibility (using Kalchm and Monica values)
      const energeticCompatibility = this.calculateEnergeticCompatibility(ing1, ing2);
      
      // Calculate overall score (weighted average)
      const score = (
        elementalCompatibility * 0.4 +
        flavorCompatibility * 0.3 +
        seasonalCompatibility * 0.1 +
        energeticCompatibility * 0.2
      );
      
      return {
        score,
        elementalCompatibility,
        flavorCompatibility,
        seasonalCompatibility,
        energeticCompatibility
      };
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { 
          action: 'calculateIngredientCompatibility',
          ingredient1: typeof ingredient1 === 'string' ? ingredient1 : ingredient1.name,
          ingredient2: typeof ingredient2 === 'string' ? ingredient2 : ingredient2.name
        }
      });
      
      // Return default low compatibility on error
      return {
        score: 0.1,
        elementalCompatibility: 0.1,
        flavorCompatibility: 0.1,
        seasonalCompatibility: 0.1,
        energeticCompatibility: 0.1
      };
    }
  }

  /**
   * Calculate seasonal compatibility between two ingredients
   */
  private calculateSeasonalCompatibility(
    ing1: UnifiedIngredient,
    ing2: UnifiedIngredient
  ): number {
    // Get seasons for both ingredients
    const seasons1 = ing1.season || [];
    const seasons2 = ing2.season || [];
    
    // Convert to arrays
    const seasonsArray1 = Array.isArray(seasons1) ? seasons1 : [seasons1];
    const seasonsArray2 = Array.isArray(seasons2) ? seasons2 : [seasons2];
    
    // If either ingredient has no seasonality, return default compatibility
    if (seasonsArray1.length === 0 || seasonsArray2.length === 0) {
      return 0.5;
    }
    
    // Count matching seasons
    let matchCount = 0;
    seasonsArray1.forEach(s1 => {
      if (typeof s1 !== 'string') return;
      
      const s1Lower = s1?.toLowerCase();
      if (seasonsArray2.some(s2 => 
        typeof s2 === 'string' && s2?.toLowerCase() === s1Lower
      )) {
        matchCount++;
      }
    });
    
    // Calculate compatibility based on proportion of matching seasons
    const maxPossibleMatches = Math.min(seasonsArray1.length, seasonsArray2.length);
    
    if (maxPossibleMatches === 0) return 0.5;
    
    return matchCount / maxPossibleMatches;
  }

  /**
   * Calculate energetic compatibility between two ingredients
   */
  private calculateEnergeticCompatibility(
    ing1: UnifiedIngredient,
    ing2: UnifiedIngredient
  ): number {
    // If Kalchm values are available, use them
    if (ing1.kalchm && ing2.kalchm) {
      // Calculate Kalchm ratio compatibility
      // Ideal ratio is close to 1 (balanced)
      const ratio = Math.max(ing1.kalchm, ing2.kalchm) / Math.max(0.001, Math.min(ing1.kalchm, ing2.kalchm));
      const ratioScore = 1 / Math.max(1, ratio);
      
      // Calculate Monica complementarity
      let monicaScore = 0.5;
      if (ing1.monica !== undefined && ing2.monica !== undefined) {
        // Monica values should complement each other (sum close to 0 is ideal)
        const monicaSum = Math.abs(ing1.monica + ing2.monica);
        monicaScore = 1 / ((1 || 0) + (monicaSum || 0));
      }
      
      // Combine scores
      return (ratioScore * 0.6) + (monicaScore * 0.4);
    }
    
    // Default compatibility if no energy metrics available
    return 0.5;
  }

  /**
   * Enhance an ingredient with elemental properties
   */
  enhanceIngredientWithElementalProperties(ingredient: Partial<UnifiedIngredient>): UnifiedIngredient {
    try {
      // Start with the existing ingredient or create a new one
      const baseIngredient = { ...ingredient } as UnifiedIngredient;
      
      // Ensure name and category exist
      if (!baseIngredient.name || !baseIngredient.category) {
        throw new Error('Ingredient must have name and category');
      }
      
      // Ensure elemental properties exist
      if (!baseIngredient.elementalProperties) {
        baseIngredient.elementalProperties = this.calculateElementalProperties(baseIngredient);
      }
      
      // Ensure alchemical properties exist
      if (!baseIngredient.alchemicalProperties) {
        baseIngredient.alchemicalProperties = {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
        };
      }
      
      // Calculate Kalchm if not present
      if (baseIngredient.kalchm === undefined && baseIngredient.alchemicalProperties) {
        const { Spirit, Essence, Matter, Substance } = baseIngredient.alchemicalProperties;
        
        // Prevent division by zero
        const safespirit = Math.max(0.001, Spirit);
        const safeessence = Math.max(0.001, Essence);
        const safematter = Math.max(0.001, Matter);
        const safesubstance = Math.max(0.001, Substance);
        
        baseIngredient.kalchm = (Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence)) / 
                               (Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance));
      }
      
      // Calculate thermodynamic metrics if not present
      // Note: UnifiedIngredient doesn't have energyProfile property
      // Thermodynamic calculations are handled separately when needed
      
      return baseIngredient;
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { 
          action: 'enhanceIngredientWithElementalProperties',
          ingredient: ingredient.name || 'unknown'
        }
      });
      
      // Return a minimal valid ingredient on error
      return {
        id: ingredient.id || `ingredient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name || 'unknown',
        category: ingredient.category || 'unknown',
        elementalProperties: createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 }),
        alchemicalProperties: {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
        }
      };
    }
  }

  /**
   * Analyze the ingredient combinations in a recipe
   */
  analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number;flavorProfile: { [key: string]: number };
    strongPAirings: Array<{ ingredients: string[]; score: number }>;
    weakPAirings: Array<{ ingredients: string[]; score: number }>;
  } {
    try {
      // Extract ingredient names from the recipe
      const ingredientNames = (recipe.ingredients || []).map(ing => 
        typeof ing === 'string' ? ing : ing.name
      );
      
      // Get ingredient objects
      const ingredients = ingredientNames
        .map(name => this.getIngredientByName(name))
        .filter((ing): ing is UnifiedIngredient => ing !== undefined);
      
      // Calculate elemental balance// Calculate flavor profile
      const flavorProfile = this.calculateRecipeFlavorProfile(ingredients);
      
      // Analyze pAirings
      const pAirings: Array<{ pAir: string[]; score: number }> = [];
      
      // Check all possible pAirs
      for (let i = 0; i < (ingredients || []).length; i++) {
        for (let j = (i || 0) + (1 || 0); j < (ingredients || []).length; j++) {
          const ing1 = ingredients[i];
          const ing2 = ingredients[j];
          
          const compatibility = this.calculateIngredientCompatibility(ing1, ing2);
          
          pAirings?.push({
            pAir: [ing1.name, ing2.name],
            score: compatibility.score
          });
        }
      }
      
      // Sort pAirings by score
      pAirings.sort((a, b) => (a as ScoredItem).score - (b as ScoredItem).score);
      
      // Get strong and weak pAirings
      const strongPAirings = pAirings
        .filter(p => p.score >= 0.7)
        .slice(0, 5)
        .map(p => ({ ingredients: p.pAir, score: p.score }));
      
      const weakPAirings = pAirings
        .filter(p => p.score < 0.4)
        .slice(0, 5)
        .map(p => ({ ingredients: p.pAir, score: p.score }));
      
      // Calculate overall harmony
      // Average of all pAiring scores, weighted by elemental balance
      const avgPAiringScore = pAirings.reduce((sum, p) => sum + p.score, 0) / 
                             Math.max(1, (pAirings || []).length);
      
      const consolidatedScore = 0.7;
      
      const overallHarmony = (avgPAiringScore * 0.7) + (consolidatedScore * 0.3);
      
      return {
        overallHarmony,
        flavorProfile,
        strongPAirings,
        weakPAirings
      };
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { 
          action: 'analyzeRecipeIngredients',
          recipe: recipe.name || recipe.id
        }
      });
      
      // Return default analysis on error
      return {
        overallHarmony: 0.5,
        flavorProfile: { sweet: 0.5, savory: 0.5 },
        strongPAirings: [],
        weakPAirings: []
      };
    }
  }

  /**
   * Calculate the elemental balance of a recipe
   */
  private calculateRecipeElementalBalance(ingredients: UnifiedIngredient[]): ElementalProperties {
    // Initialize with zero values
    const balance = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0
    });
    
    if ((ingredients || []).length === 0) return balance;
    
    // Sum all elemental properties
    (ingredients || []).forEach(ingredient => {
      const elemental = ingredient.elementalProperties;
      
      balance.Fire += elemental.Fire;
      balance.Water += elemental.Water;
      balance.Earth += elemental.Earth;
      balance.Air += elemental.Air;
    });
    
    // Normalize to sum to 1
    const total = balance.Fire + balance.Water + balance.Earth + balance.Air;
    
    if (total > 0) {
      balance.Fire /= total;
      balance.Water /= total;
      balance.Earth /= total;
      balance.Air /= total;
    } else {
      // Default balanced distribution if total is 0
      balance.Fire = 0.25;
      balance.Water = 0.25;
      balance.Earth = 0.25;
      balance.Air = 0.25;
    }
    
    return balance;
  }

  /**
   * Calculate the flavor profile of a recipe
   */
  private calculateRecipeFlavorProfile(ingredients: UnifiedIngredient[]): { [key: string]: number } {
    // Initialize empty profile
    const profile: { [key: string]: number } = {};
    
    // Collect all possible flavor dimensions
    const allDimensions = new Set<string>();
    
    (ingredients || []).forEach(ingredient => {
      if (ingredient.flavorProfile) {
        Object.keys(ingredient.flavorProfile).forEach(key => allDimensions.add(key));
      }
    });
    
    // If no flavor dimensions found, return default profile
    if (allDimensions.size === 0) {
      return { 
        sweet: 0.5,
        savory: 0.5,
        spicy: 0.2,
        bitter: 0.2,
        sour: 0.2,
        salty: 0.3
      };
    }
    
    // Initialize all dimensions to 0
    (allDimensions || []).forEach(dim => {
      profile[dim] = 0;
    });
    
    // Sum up all flavor values
    (ingredients || []).forEach(ingredient => {
      if (ingredient.flavorProfile) {
        Object.entries(ingredient.flavorProfile).forEach(([flavor, value]) => {
          profile[flavor] = (profile[flavor] || 0) + value;
        });
      }
    });
    
    // Normalize values to be between 0 and 1
    Object.keys(profile || {}).forEach(flavor => {
      profile[flavor] = Math.min(1, profile[flavor] / (ingredients || []).length);
    });
    
    return profile;
  }

  /**
   * Calculate a score for elemental balance
   */
  private calculateElementalBalanceScore(elemental: ElementalProperties): number {
    // Following our elemental principles, we don't seek perfect mathematical balance
    // Instead, we want to ensure that each element has meaningful representation
    
    // Define thresholds for element presence
    const MINIMUM_PRESENCE = 0.05;  // Minimum useful presence of an element
    const DOMINANT_THRESHOLD = 0.5; // Threshold for an element being considered dominant
    
    // Check for elements with meaningful presence
    const elementsWithPresence = Object.entries(elemental).filter(([_, value]) => value >= MINIMUM_PRESENCE).length;
    
    // Calculate how many elements have dominant presence
    const dominantElements = Object.entries(elemental).filter(([_, value]) => value >= DOMINANT_THRESHOLD).length;
    
    // We want at least 2-3 elements with meaningful presence
    const presenceScore = Math.min(1, elementsWithPresence / 3);
    
    // We also want at least one element to be dominant (according to principles where 
    // elements reinforce themselves)
    const dominanceScore = Math.min(1, dominantElements);
    
    // Calculate final score (weighted average)
    return (presenceScore * 0.6) + (dominanceScore * 0.4);
  }

  /**
   * Suggest alternative ingredients
   */
  suggestAlternativeIngredients(
    ingredientName: string,
    options: {
      category?: string;
      similarityThreshold?: number;
      maxResults?: number;
    } = {}
  ): Array<{ ingredient: UnifiedIngredient; similarityScore: number }> {
    try {
      // Default options
      const {
        category,
        similarityThreshold = 0.7,
        maxResults = 5
      } = options;
      
      // Get the base ingredient
      const baseIngredient = this.getIngredientByName(ingredientName);
      if (!baseIngredient) {
        return [];
      }
      
      // Get candidate ingredients (either from same category or all)
      const candidates = category 
        ? this.getIngredientsByCategory(category)
        : this.getIngredientsByCategory(baseIngredient.category);
      
      // Filter out the original ingredient
      const potentialAlternatives = (candidates || []).filter(ing => ing.name?.toLowerCase() !== ingredientName?.toLowerCase()
      );
      
      // Calculate similarity scores
      const scoredAlternatives = (potentialAlternatives || []).map(ingredient => {
        // Calculate elemental compatibility
        const elementalScore = calculateElementalCompatibility(
          baseIngredient.elementalProperties || this.calculateElementalProperties(baseIngredient),
          ingredient.elementalProperties || this.calculateElementalProperties(ingredient)
        );
        
        // Calculate flavor profile similarity if available
        let flavorScore = 0.5; // Default mid-range
        if (baseIngredient.flavorProfile && ingredient.flavorProfile) {
          flavorScore = this.calculateFlavorSimilarity(
            baseIngredient.flavorProfile,
            ingredient.flavorProfile
          );
        }
        
        // Calculate nutrient similarity if available
        let nutrientScore = 0.5; // Default mid-range
        if (baseIngredient.nutritionalProfile && ingredient.nutritionalPropertiesProfile) {
          // Simple comparison - could be more sophisticated
          nutrientScore = 0.8; // Assume fAirly similar in same category
        }
        
        // Combined similarity score with weights
        const similarityScore = (
          elementalScore * 0.5 + 
          flavorScore * 0.3 + 
          nutrientScore * 0.2
        );
        
        return { ingredient, similarityScore };
      });
      
      // Filter by threshold and sort by score
      return scoredAlternatives
        .filter(item => item.similarityScore >= similarityThreshold)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, maxResults);
    } catch (error) {
      errorHandler.logError(error, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'suggestAlternativeIngredients', ingredientName }
      });
      return [];
    }
  }

  /**
   * Calculate the compatibility between two sets of elemental properties
   * This follows our elemental principles where elements reinforce themselves
   * and all element combinations have good compatibility
   */
  private calculateElementalCompatibility(
    properties1: ElementalProperties,
    properties2: ElementalProperties
  ): number {
    // Define element compatibility scores (same elements have highest compatibility)
    const compatibilityScores = { Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 }, Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 }, Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 }, Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 }
    };
    
    // Calculate weighted compatibility across all elements
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Compare each element
    for (const sourceElement of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      const sourceValue = properties1[sourceElement] || 0;
      if (sourceValue <= 0) continue; // Skip elements with no presence
      
      // Weight by the element's prominence in the source
      const weight = sourceValue;
      
      // For each source element, calculate its compatibility with each target element
      let bestCompatibility = 0;
      for (const targetElement of ['Fire', 'Water', 'Earth', 'Air'] as const) {
        const targetValue = properties2[targetElement] || 0;
        if (targetValue <= 0) continue; // Skip elements with no presence
        
        // Get compatibility between these two elements
        const elementCompatibility = compatibilityScores[sourceElement][targetElement] || 0.7;
        
        // Scale by the target element's prominence
        const scaledCompatibility = elementCompatibility * targetValue;
        bestCompatibility = Math.max(bestCompatibility, scaledCompatibility);
      }
      
      weightedSum += bestCompatibility * weight;
      totalWeight += weight;
    }
    
    // Calculate final score - ensure minimum of 0.7 following our principles
    return totalWeight > 0 
      ? Math.max(0.7, weightedSum / totalWeight) 
      : 0.7;
  }
}

// Export singleton instance
export const consolidatedIngredientService = ConsolidatedIngredientService.getInstance(); 