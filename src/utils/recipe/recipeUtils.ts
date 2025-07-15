// @ts-nocheck
import type { Recipe, 
  RecipeIngredient, 
  ElementalProperties, 
  ScoredRecipe } from "@/types/recipe";

import { _createElementalProperties, _isElementalProperties } from '../elemental/elementalUtils';
import { _isNonEmptyArray, _safeSome, _toArray } from '../common/arrayUtils';

import { _Element } from "@/types/alchemy";

/**
 * Type guard to check if an object is a Recipe
 */
export function isRecipe(obj: unknown): obj is Recipe {
  if (!obj || typeof obj !== 'object') return false;
  
  const recipe = obj as Partial<Recipe>;
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    Array.isArray(recipe.ingredients)
  );
}

// ========== ENTERPRISE RECIPE INTELLIGENCE SYSTEMS ==========

// 🍽️ Recipe Analysis Intelligence Engine
export const RecipeAnalysisIntelligence = {
  // Recipe Validation Analytics - Advanced recipe type validation with quality scoring
  getRecipeValidationAnalytics: (recipe: Recipe): {
    validationScore: number;
    validationMetrics: Record<string, number>;
    qualityIndicators: Record<string, number>;
    validationRecommendations: Record<string, string>;
    structuralAnalysis: Record<string, number>;
  } => {
    const validationMetrics = {
      nameQuality: recipe.name ? Math.min(recipe.name.length / 50, 1.0) : 0,
      descriptionQuality: recipe.description ? Math.min(recipe.description.length / 200, 1.0) : 0.5,
      ingredientCount: recipe.ingredients ? Math.min(recipe.ingredients.length / 15, 1.0) : 0,
      instructionQuality: recipe.instructions ? Math.min(recipe.instructions.length / 10, 1.0) : 0.3,
      metadataCompleteness: (recipe.cuisine ? 0.2 : 0) + (recipe.difficulty ? 0.2 : 0) + (recipe.cookingTime ? 0.2 : 0) + (recipe.servings ? 0.2 : 0) + (recipe.tags ? 0.2 : 0),
      nutritionalData: recipe.nutrition ? 0.8 : 0.2,
      elementalProperties: recipe.elementalProperties ? 0.9 : 0.1
    };

    const qualityIndicators = {
      overallQuality: Object.values(validationMetrics).reduce((sum, val) => sum + val, 0) / Object.keys(validationMetrics).length,
      completenessScore: validationMetrics.metadataCompleteness,
      contentRichness: (validationMetrics.nameQuality + validationMetrics.descriptionQuality + validationMetrics.instructionQuality) / 3,
      dataIntegrity: (validationMetrics.ingredientCount + validationMetrics.nutritionalData + validationMetrics.elementalProperties) / 3,
      usabilityScore: (validationMetrics.nameQuality + validationMetrics.ingredientCount + validationMetrics.instructionQuality) / 3,
      professionalGrade: validationMetrics.metadataCompleteness > 0.8 ? 1.0 : 0.6,
      marketReadiness: Object.values(validationMetrics).every(val => val > 0.5) ? 1.0 : 0.4
    };

    const validationRecommendations = {
      nameImprovement: validationMetrics.nameQuality < 0.5 ? 'Enhance recipe name with more descriptive terms' : 'Recipe name is adequate',
      descriptionEnhancement: validationMetrics.descriptionQuality < 0.7 ? 'Add more detailed description for better user engagement' : 'Description quality is good',
      ingredientOptimization: validationMetrics.ingredientCount < 0.6 ? 'Consider adding more ingredients for complexity' : 'Ingredient count is appropriate',
      instructionImprovement: validationMetrics.instructionQuality < 0.6 ? 'Add more detailed cooking instructions' : 'Instructions are sufficient',
      metadataCompletion: validationMetrics.metadataCompleteness < 0.8 ? 'Complete missing metadata fields for better categorization' : 'Metadata is comprehensive',
      nutritionalEnhancement: validationMetrics.nutritionalData < 0.5 ? 'Add nutritional information for health-conscious users' : 'Nutritional data is present',
      elementalBalancing: validationMetrics.elementalProperties < 0.5 ? 'Add elemental properties for alchemical analysis' : 'Elemental properties are defined'
    };

    const structuralAnalysis = {
      coreStructure: (validationMetrics.nameQuality + validationMetrics.ingredientCount + validationMetrics.instructionQuality) / 3,
      enhancedStructure: (validationMetrics.descriptionQuality + validationMetrics.metadataCompleteness + validationMetrics.nutritionalData) / 3,
      advancedStructure: (validationMetrics.elementalProperties + qualityIndicators.professionalGrade + qualityIndicators.marketReadiness) / 3,
      structuralBalance: Math.abs(0.5 - Object.values(validationMetrics).reduce((sum, val) => sum + val, 0) / Object.keys(validationMetrics).length) < 0.2 ? 1.0 : 0.6,
      structuralComplexity: recipe.ingredients ? Math.min(recipe.ingredients.length * 0.1, 1.0) : 0.1,
      structuralCoherence: qualityIndicators.overallQuality > 0.7 ? 1.0 : 0.5,
      structuralOptimization: qualityIndicators.marketReadiness * 0.9
    };

    const validationScore = qualityIndicators.overallQuality * 0.4 + 
                           qualityIndicators.completenessScore * 0.3 + 
                           qualityIndicators.dataIntegrity * 0.3;

    return {
      validationScore,
      validationMetrics,
      qualityIndicators,
      validationRecommendations,
      structuralAnalysis
    };
  },

  // Recipe Scoring Intelligence - Sophisticated scoring algorithms and optimization
  getRecipeScoringIntelligence: (recipe: Recipe, baseScore = 0.7): {
    enhancedScore: number;
    scoringFactors: Record<string, number>;
    optimizationMetrics: Record<string, number>;
    scoringRecommendations: Record<string, string>;
    performanceAnalysis: Record<string, number>;
  } => {
    const scoringFactors = {
      complexityBonus: recipe.ingredients ? Math.min(recipe.ingredients.length * 0.05, 0.3) : 0,
      qualityMultiplier: recipe.description ? 1.2 : 1.0,
      completenessBonus: recipe.nutrition ? 0.15 : 0,
      elementalBonus: recipe.elementalProperties ? 0.2 : 0,
      metadataBonus: (recipe.cuisine ? 0.05 : 0) + (recipe.difficulty ? 0.05 : 0) + (recipe.tags ? 0.1 : 0),
      instructionBonus: recipe.instructions ? Math.min(recipe.instructions.length * 0.02, 0.2) : 0,
      timeFactorBonus: recipe.cookingTime ? Math.max(0.1 - (recipe.cookingTime - 30) * 0.005, 0) : 0.05
    };

    const optimizationMetrics = {
      scoreOptimization: baseScore * scoringFactors.qualityMultiplier + 
                        scoringFactors.complexityBonus + 
                        scoringFactors.completenessBonus + 
                        scoringFactors.elementalBonus + 
                        scoringFactors.metadataBonus + 
                        scoringFactors.instructionBonus + 
                        scoringFactors.timeFactorBonus,
      potentialScore: Math.min(baseScore * 1.5 + 0.5, 1.0),
      optimizationGap: Math.max(0, Math.min(baseScore * 1.5 + 0.5, 1.0) - baseScore),
      efficiencyRatio: baseScore / Math.max(0.1, recipe.cookingTime || 30),
      valueScore: (baseScore + scoringFactors.complexityBonus + scoringFactors.completenessBonus) / 3,
      marketScore: baseScore * (1 + scoringFactors.metadataBonus + scoringFactors.elementalBonus),
      userScore: baseScore * (1 + scoringFactors.instructionBonus + scoringFactors.timeFactorBonus)
    };

    const scoringRecommendations = {
      complexityImprovement: scoringFactors.complexityBonus < 0.2 ? 'Add more ingredients to increase complexity score' : 'Complexity level is optimal',
      qualityEnhancement: scoringFactors.qualityMultiplier < 1.2 ? 'Add detailed description to boost quality multiplier' : 'Quality multiplier is active',
      completenessUpgrade: scoringFactors.completenessBonus < 0.15 ? 'Add nutritional information for completeness bonus' : 'Completeness bonus achieved',
      elementalOptimization: scoringFactors.elementalBonus < 0.2 ? 'Define elemental properties for scoring bonus' : 'Elemental bonus is active',
      metadataEnhancement: scoringFactors.metadataBonus < 0.15 ? 'Complete cuisine, difficulty, and tags for metadata bonus' : 'Metadata bonus is maximized',
      instructionImprovement: scoringFactors.instructionBonus < 0.15 ? 'Add more detailed instructions for instruction bonus' : 'Instruction bonus is good',
      timeOptimization: scoringFactors.timeFactorBonus < 0.08 ? 'Optimize cooking time for better time factor bonus' : 'Time factor is optimized'
    };

    const performanceAnalysis = {
      overallPerformance: optimizationMetrics.scoreOptimization,
      potentialRealization: optimizationMetrics.scoreOptimization / optimizationMetrics.potentialScore,
      efficiencyScore: optimizationMetrics.efficiencyRatio * 30,
      marketPerformance: optimizationMetrics.marketScore,
      userSatisfaction: optimizationMetrics.userScore,
      valueProposition: optimizationMetrics.valueScore,
      competitiveScore: Math.min(optimizationMetrics.scoreOptimization * 1.1, 1.0)
    };

    return {
      enhancedScore: optimizationMetrics.scoreOptimization,
      scoringFactors,
      optimizationMetrics,
      scoringRecommendations,
      performanceAnalysis
    };
  },

  // Recipe Ingredient Analytics - Ingredient composition analysis and validation
  getRecipeIngredientAnalytics: (recipe: Recipe): {
    ingredientProfile: Record<string, number>;
    compositionAnalysis: Record<string, number>;
    ingredientOptimization: Record<string, number>;
    ingredientRecommendations: Record<string, string>;
    ingredientIntelligence: Record<string, number>;
  } => {
    const ingredients = recipe.ingredients || [];
    const ingredientCount = ingredients.length;

    const ingredientProfile = {
      totalIngredients: ingredientCount,
      averageComplexity: ingredientCount > 0 ? ingredients.reduce((sum, ing) => sum + (typeof ing === 'string' ? 1 : 2), 0) / ingredientCount : 0,
      structuredIngredients: ingredients.filter(ing => typeof ing === 'object').length,
      simpleIngredients: ingredients.filter(ing => typeof ing === 'string').length,
      ingredientDiversity: ingredientCount > 0 ? Math.min(ingredientCount / 12, 1.0) : 0,
      ingredientDensity: ingredientCount > 0 ? Math.min(ingredientCount / 8, 1.0) : 0,
      ingredientRichness: ingredients.filter(ing => typeof ing === 'object').length / Math.max(ingredientCount, 1)
    };

    const compositionAnalysis = {
      compositionScore: ingredientProfile.averageComplexity * 0.4 + ingredientProfile.ingredientDiversity * 0.6,
      balanceScore: Math.abs(0.5 - ingredientProfile.ingredientRichness) < 0.3 ? 1.0 : 0.6,
      varietyScore: ingredientProfile.ingredientDiversity,
      complexityScore: ingredientProfile.averageComplexity / 2,
      densityScore: ingredientProfile.ingredientDensity,
      structureScore: ingredientProfile.structuredIngredients / Math.max(ingredientCount, 1),
      overallComposition: (ingredientProfile.averageComplexity + ingredientProfile.ingredientDiversity + ingredientProfile.ingredientDensity) / 3
    };

    const ingredientOptimization = {
      optimizationPotential: 1.0 - compositionAnalysis.compositionScore,
      balanceOptimization: 1.0 - compositionAnalysis.balanceScore,
      varietyOptimization: 1.0 - compositionAnalysis.varietyScore,
      complexityOptimization: 1.0 - compositionAnalysis.complexityScore,
      densityOptimization: 1.0 - compositionAnalysis.densityScore,
      structureOptimization: 1.0 - compositionAnalysis.structureScore,
      overallOptimization: (1.0 - compositionAnalysis.overallComposition) * 0.8
    };

    const ingredientRecommendations = {
      diversityImprovement: ingredientProfile.ingredientDiversity < 0.7 ? 'Add more diverse ingredients to improve variety' : 'Ingredient diversity is good',
      complexityEnhancement: ingredientProfile.averageComplexity < 1.5 ? 'Use more structured ingredient objects for better analysis' : 'Ingredient complexity is adequate',
      balanceOptimization: compositionAnalysis.balanceScore < 0.8 ? 'Balance simple and structured ingredients for optimal composition' : 'Ingredient balance is optimal',
      densityAdjustment: ingredientProfile.ingredientDensity < 0.6 ? 'Consider adding more ingredients for richer recipes' : 'Ingredient density is appropriate',
      structureImprovement: compositionAnalysis.structureScore < 0.5 ? 'Convert simple ingredients to structured format for better analysis' : 'Ingredient structure is good',
      varietyExpansion: compositionAnalysis.varietyScore < 0.6 ? 'Expand ingredient variety for more interesting recipes' : 'Ingredient variety is sufficient',
      compositionRefinement: compositionAnalysis.overallComposition < 0.7 ? 'Refine overall ingredient composition for better results' : 'Composition is well-balanced'
    };

    const ingredientIntelligence = {
      intelligenceScore: compositionAnalysis.overallComposition * 0.9,
      analyticsDepth: ingredientProfile.averageComplexity * 0.6,
      processingComplexity: ingredientProfile.ingredientRichness * 0.8,
      dataRichness: compositionAnalysis.structureScore * 0.9,
      analysisCapability: (compositionAnalysis.varietyScore + compositionAnalysis.complexityScore) / 2,
      optimizationCapability: (ingredientOptimization.overallOptimization + ingredientOptimization.balanceOptimization) / 2,
      intelligenceDepth: (ingredientProfile.averageComplexity + compositionAnalysis.overallComposition) / 2
    };

    return {
      ingredientProfile,
      compositionAnalysis,
      ingredientOptimization,
      ingredientRecommendations,
      ingredientIntelligence
    };
  }
};

// 🧪 Recipe Metadata Intelligence System
export const RecipeMetadataIntelligence = {
  // Recipe Meal Type Analytics - Meal type classification and optimization
  getRecipeMealTypeAnalytics: (recipe: Recipe): {
    mealTypeProfile: Record<string, number>;
    classificationMetrics: Record<string, number>;
    mealTypeOptimization: Record<string, number>;
    mealTypeRecommendations: Record<string, string>;
    mealTypeIntelligence: Record<string, number>;
  } => {
    const mealTypes = recipe.mealTypes || [];
    const cookingTime = recipe.cookingTime || 30;
    const ingredientCount = recipe.ingredients?.length || 0;

    const mealTypeProfile = {
      definedMealTypes: mealTypes.length,
      mealTypeVariety: Math.min(mealTypes.length / 3, 1.0),
      breakfastSuitability: mealTypes.includes('breakfast') ? 1.0 : cookingTime < 20 ? 0.7 : 0.3,
      lunchSuitability: mealTypes.includes('lunch') ? 1.0 : cookingTime < 45 ? 0.8 : 0.5,
      dinnerSuitability: mealTypes.includes('dinner') ? 1.0 : ingredientCount > 5 ? 0.8 : 0.6,
      snackSuitability: mealTypes.includes('snack') ? 1.0 : cookingTime < 15 ? 0.9 : 0.2,
      mealFlexibility: mealTypes.length > 1 ? 1.0 : 0.5
    };

    const classificationMetrics = {
      classificationAccuracy: mealTypeProfile.definedMealTypes > 0 ? 1.0 : 0.3,
      timeBasedClassification: (mealTypeProfile.breakfastSuitability + mealTypeProfile.lunchSuitability + mealTypeProfile.dinnerSuitability) / 3,
      complexityBasedClassification: ingredientCount > 8 ? 0.9 : ingredientCount > 4 ? 0.7 : 0.5,
      versatilityScore: mealTypeProfile.mealFlexibility * 0.9,
      specializationScore: mealTypeProfile.definedMealTypes === 1 ? 1.0 : 0.8,
      adaptabilityScore: mealTypeProfile.mealTypeVariety * 0.8,
      overallClassification: (mealTypeProfile.mealTypeVariety + mealTypeProfile.mealFlexibility) / 2
    };

    const mealTypeOptimization = {
      optimizationPotential: 1.0 - classificationMetrics.overallClassification,
      breakfastOptimization: 1.0 - mealTypeProfile.breakfastSuitability,
      lunchOptimization: 1.0 - mealTypeProfile.lunchSuitability,
      dinnerOptimization: 1.0 - mealTypeProfile.dinnerSuitability,
      snackOptimization: 1.0 - mealTypeProfile.snackSuitability,
      flexibilityOptimization: 1.0 - mealTypeProfile.mealFlexibility,
      varietyOptimization: 1.0 - mealTypeProfile.mealTypeVariety
    };

    const mealTypeRecommendations = {
      breakfastOptimization: mealTypeProfile.breakfastSuitability < 0.7 ? 'Optimize for breakfast by reducing cooking time or simplifying ingredients' : 'Breakfast suitability is good',
      lunchEnhancement: mealTypeProfile.lunchSuitability < 0.7 ? 'Enhance lunch appeal with moderate cooking time and balanced ingredients' : 'Lunch suitability is adequate',
      dinnerImprovement: mealTypeProfile.dinnerSuitability < 0.7 ? 'Improve dinner potential with more substantial ingredients' : 'Dinner suitability is good',
      snackOptimization: mealTypeProfile.snackSuitability < 0.7 ? 'Optimize for snack use with quick preparation and simple ingredients' : 'Snack potential is high',
      flexibilityIncrease: mealTypeProfile.mealFlexibility < 0.8 ? 'Increase meal flexibility by adding multiple meal type classifications' : 'Meal flexibility is optimal',
      varietyExpansion: mealTypeProfile.mealTypeVariety < 0.6 ? 'Expand meal type variety for broader appeal' : 'Meal type variety is sufficient',
      classificationRefinement: classificationMetrics.overallClassification < 0.7 ? 'Refine meal type classification for better targeting' : 'Classification is well-defined'
    };

    const mealTypeIntelligence = {
      intelligenceScore: classificationMetrics.overallClassification * 0.9,
      analyticsDepth: mealTypeProfile.mealTypeVariety * 0.8,
      classificationDepth: classificationMetrics.classificationAccuracy * 0.9,
      optimizationCapability: (mealTypeOptimization.optimizationPotential + mealTypeOptimization.flexibilityOptimization) / 2,
      adaptabilityIntelligence: classificationMetrics.adaptabilityScore * 0.8,
      versatilityIntelligence: classificationMetrics.versatilityScore * 0.9,
      overallIntelligence: (classificationMetrics.overallClassification + mealTypeProfile.mealFlexibility) / 2
    };

    return {
      mealTypeProfile,
      classificationMetrics,
      mealTypeOptimization,
      mealTypeRecommendations,
      mealTypeIntelligence
    };
  },

  // Recipe Seasonal Intelligence - Seasonal compatibility and adaptation analysis
  getRecipeSeasonalIntelligence: (recipe: Recipe): {
    seasonalProfile: Record<string, number>;
    seasonalCompatibility: Record<string, number>;
    seasonalOptimization: Record<string, number>;
    seasonalRecommendations: Record<string, string>;
    seasonalAnalytics: Record<string, number>;
  } => {
    const seasons = recipe.seasons || [];
    const ingredients = recipe.ingredients || [];
    const cookingTime = recipe.cookingTime || 30;

    const seasonalProfile = {
      definedSeasons: seasons.length,
      seasonalVariety: Math.min(seasons.length / 4, 1.0),
      springCompatibility: seasons.includes('spring') ? 1.0 : ingredients.length < 8 ? 0.7 : 0.5,
      summerCompatibility: seasons.includes('summer') ? 1.0 : cookingTime < 30 ? 0.8 : 0.4,
      fallCompatibility: seasons.includes('fall') ? 1.0 : ingredients.length > 6 ? 0.8 : 0.6,
      winterCompatibility: seasons.includes('winter') ? 1.0 : cookingTime > 30 ? 0.9 : 0.5,
      seasonalFlexibility: seasons.length > 1 ? 1.0 : 0.6
    };

    const seasonalCompatibility = {
      overallCompatibility: (seasonalProfile.springCompatibility + seasonalProfile.summerCompatibility + seasonalProfile.fallCompatibility + seasonalProfile.winterCompatibility) / 4,
      seasonalBalance: Math.abs(0.5 - seasonalProfile.seasonalVariety) < 0.3 ? 1.0 : 0.7,
      adaptabilityScore: seasonalProfile.seasonalFlexibility * 0.9,
      versatilityScore: seasonalProfile.seasonalVariety * 0.8,
      seasonalHarmony: seasonalProfile.definedSeasons > 0 ? 1.0 : 0.4,
      climaticSuitability: (seasonalProfile.summerCompatibility + seasonalProfile.winterCompatibility) / 2,
      temperateSeasonSuitability: (seasonalProfile.springCompatibility + seasonalProfile.fallCompatibility) / 2
    };

    const seasonalOptimization = {
      optimizationPotential: 1.0 - seasonalCompatibility.overallCompatibility,
      springOptimization: 1.0 - seasonalProfile.springCompatibility,
      summerOptimization: 1.0 - seasonalProfile.summerCompatibility,
      fallOptimization: 1.0 - seasonalProfile.fallCompatibility,
      winterOptimization: 1.0 - seasonalProfile.winterCompatibility,
      flexibilityOptimization: 1.0 - seasonalProfile.seasonalFlexibility,
      varietyOptimization: 1.0 - seasonalProfile.seasonalVariety
    };

    const seasonalRecommendations = {
      springEnhancement: seasonalProfile.springCompatibility < 0.7 ? 'Enhance spring appeal with lighter ingredients and fresh flavors' : 'Spring compatibility is good',
      summerOptimization: seasonalProfile.summerCompatibility < 0.7 ? 'Optimize for summer with shorter cooking times and cooling ingredients' : 'Summer suitability is adequate',
      fallImprovement: seasonalProfile.fallCompatibility < 0.7 ? 'Improve fall appeal with heartier ingredients and warming spices' : 'Fall compatibility is good',
      winterEnhancement: seasonalProfile.winterCompatibility < 0.7 ? 'Enhance winter suitability with longer cooking times and warming ingredients' : 'Winter compatibility is strong',
      flexibilityIncrease: seasonalProfile.seasonalFlexibility < 0.8 ? 'Increase seasonal flexibility by adapting for multiple seasons' : 'Seasonal flexibility is optimal',
      varietyExpansion: seasonalProfile.seasonalVariety < 0.6 ? 'Expand seasonal variety for year-round appeal' : 'Seasonal variety is sufficient',
      balanceOptimization: seasonalCompatibility.seasonalBalance < 0.8 ? 'Balance seasonal adaptations for optimal year-round use' : 'Seasonal balance is good'
    };

    const seasonalAnalytics = {
      analyticsScore: seasonalCompatibility.overallCompatibility * 0.9,
      seasonalIntelligence: seasonalProfile.seasonalVariety * 0.8,
      adaptationCapability: seasonalCompatibility.adaptabilityScore * 0.9,
      optimizationDepth: (seasonalOptimization.optimizationPotential + seasonalOptimization.flexibilityOptimization) / 2,
      seasonalInsight: seasonalCompatibility.seasonalHarmony * 0.8,
      climaticIntelligence: seasonalCompatibility.climaticSuitability * 0.7,
      overallSeasonalAnalytics: (seasonalCompatibility.overallCompatibility + seasonalProfile.seasonalFlexibility) / 2
    };

    return {
      seasonalProfile,
      seasonalCompatibility,
      seasonalOptimization,
      seasonalRecommendations,
      seasonalAnalytics
    };
  }
};

// ⏰ Recipe Timing Intelligence Network
export const RecipeTimingIntelligence = {
  // Recipe Cooking Time Analytics - Cooking time optimization and prediction
  getRecipeCookingTimeAnalytics: (recipe: Recipe): {
    timingProfile: Record<string, number>;
    timeOptimization: Record<string, number>;
    efficiencyMetrics: Record<string, number>;
    timingRecommendations: Record<string, string>;
    timingIntelligence: Record<string, number>;
  } => {
    const cookingTime = recipe.cookingTime || 30;
    const ingredientCount = recipe.ingredients?.length || 0;
    const instructionCount = recipe.instructions?.length || 0;

    const timingProfile = {
      actualCookingTime: cookingTime,
      timeCategory: cookingTime < 15 ? 1 : cookingTime < 30 ? 2 : cookingTime < 60 ? 3 : cookingTime < 120 ? 4 : 5,
      timeEfficiency: Math.max(0.1, 1.0 - (cookingTime - 30) / 120),
      quickMealSuitability: cookingTime < 20 ? 1.0 : cookingTime < 30 ? 0.8 : 0.3,
      standardMealSuitability: cookingTime >= 20 && cookingTime <= 60 ? 1.0 : 0.6,
      elaborateMealSuitability: cookingTime > 45 ? 1.0 : 0.4,
      timeComplexityRatio: ingredientCount > 0 ? cookingTime / ingredientCount : 5
    };

    const timeOptimization = {
      optimizationPotential: timingProfile.timeEfficiency < 0.7 ? 1.0 - timingProfile.timeEfficiency : 0.2,
      quickOptimization: 1.0 - timingProfile.quickMealSuitability,
      standardOptimization: 1.0 - timingProfile.standardMealSuitability,
      elaborateOptimization: 1.0 - timingProfile.elaborateMealSuitability,
      efficiencyOptimization: timingProfile.timeComplexityRatio > 8 ? 0.8 : 0.2,
      speedOptimization: cookingTime > 45 ? 0.9 : 0.1,
      balanceOptimization: Math.abs(timingProfile.timeComplexityRatio - 5) > 3 ? 0.8 : 0.2
    };

    const efficiencyMetrics = {
      overallEfficiency: timingProfile.timeEfficiency * 0.9,
      timeUtilization: Math.min(cookingTime / 60, 1.0),
      productivityScore: ingredientCount / Math.max(cookingTime / 10, 1),
      complexityEfficiency: instructionCount > 0 ? instructionCount / (cookingTime / 10) : 0.5,
      timeValueRatio: (ingredientCount + instructionCount) / Math.max(cookingTime / 15, 1),
      speedScore: Math.max(0.1, 1.0 - cookingTime / 180),
      balanceScore: Math.abs(timingProfile.timeComplexityRatio - 5) < 2 ? 1.0 : 0.6
    };

    const timingRecommendations = {
      speedImprovement: cookingTime > 60 ? 'Consider techniques to reduce cooking time for better efficiency' : 'Cooking time is reasonable',
      efficiencyEnhancement: timingProfile.timeEfficiency < 0.7 ? 'Optimize cooking process for better time efficiency' : 'Time efficiency is good',
      quickMealOptimization: timingProfile.quickMealSuitability < 0.7 ? 'Adapt recipe for quick meal preparation' : 'Quick meal potential is high',
      standardMealBalancing: timingProfile.standardMealSuitability < 0.8 ? 'Balance cooking time for standard meal timing' : 'Standard meal timing is optimal',
      elaborateMealEnhancement: timingProfile.elaborateMealSuitability < 0.7 ? 'Enhance for elaborate meal preparation if desired' : 'Elaborate meal potential is good',
      complexityBalancing: timingProfile.timeComplexityRatio > 8 ? 'Balance ingredient complexity with cooking time' : 'Time-complexity ratio is balanced',
      overallOptimization: efficiencyMetrics.overallEfficiency < 0.7 ? 'Optimize overall timing for better user experience' : 'Overall timing is efficient'
    };

    const timingIntelligence = {
      intelligenceScore: efficiencyMetrics.overallEfficiency * 0.9,
      analyticsDepth: timingProfile.timeEfficiency * 0.8,
      optimizationCapability: (timeOptimization.optimizationPotential + timeOptimization.efficiencyOptimization) / 2,
      efficiencyIntelligence: efficiencyMetrics.productivityScore * 0.6,
      balanceIntelligence: efficiencyMetrics.balanceScore * 0.8,
      adaptabilityIntelligence: (timingProfile.quickMealSuitability + timingProfile.standardMealSuitability + timingProfile.elaborateMealSuitability) / 3,
      overallTimingIntelligence: (efficiencyMetrics.overallEfficiency + timingProfile.timeEfficiency) / 2
    };

    return {
      timingProfile,
      timeOptimization,
      efficiencyMetrics,
      timingRecommendations,
      timingIntelligence
    };
  },

  // Recipe Dietary Compatibility - Dietary restriction analysis and adaptation
  getRecipeDietaryCompatibilityAnalytics: (recipe: Recipe, restrictions: string[] = []): {
    compatibilityProfile: Record<string, number>;
    restrictionAnalysis: Record<string, number>;
    adaptationMetrics: Record<string, number>;
    compatibilityRecommendations: Record<string, string>;
    dietaryIntelligence: Record<string, number>;
  } => {
    const ingredients = recipe.ingredients || [];
    const tags = recipe.tags || [];
    const dietaryTags = recipe.dietaryRestrictions || [];

    const compatibilityProfile = {
      definedRestrictions: dietaryTags.length,
      restrictionCompliance: restrictions.length > 0 ? restrictions.every(r => dietaryTags.includes(r)) ? 1.0 : 0.3 : 0.8,
      vegetarianCompatibility: dietaryTags.includes('vegetarian') || tags.includes('vegetarian') ? 1.0 : 0.5,
      veganCompatibility: dietaryTags.includes('vegan') || tags.includes('vegan') ? 1.0 : 0.3,
      glutenFreeCompatibility: dietaryTags.includes('gluten-free') || tags.includes('gluten-free') ? 1.0 : 0.4,
      dairyFreeCompatibility: dietaryTags.includes('dairy-free') || tags.includes('dairy-free') ? 1.0 : 0.4,
      dietaryFlexibility: dietaryTags.length > 1 ? 1.0 : 0.6
    };

    const restrictionAnalysis = {
      overallCompliance: (compatibilityProfile.vegetarianCompatibility + compatibilityProfile.veganCompatibility + compatibilityProfile.glutenFreeCompatibility + compatibilityProfile.dairyFreeCompatibility) / 4,
      restrictionCoverage: Math.min(dietaryTags.length / 3, 1.0),
      adaptabilityScore: compatibilityProfile.dietaryFlexibility * 0.9,
      inclusivityScore: compatibilityProfile.restrictionCompliance * 0.8,
      marketAppeal: compatibilityProfile.definedRestrictions > 0 ? 1.0 : 0.5,
      specialDietSupport: (compatibilityProfile.veganCompatibility + compatibilityProfile.glutenFreeCompatibility) / 2,
      mainstreamAppeal: (compatibilityProfile.vegetarianCompatibility + compatibilityProfile.dairyFreeCompatibility) / 2
    };

    const adaptationMetrics = {
      adaptationPotential: 1.0 - restrictionAnalysis.overallCompliance,
      vegetarianAdaptation: 1.0 - compatibilityProfile.vegetarianCompatibility,
      veganAdaptation: 1.0 - compatibilityProfile.veganCompatibility,
      glutenFreeAdaptation: 1.0 - compatibilityProfile.glutenFreeCompatibility,
      dairyFreeAdaptation: 1.0 - compatibilityProfile.dairyFreeCompatibility,
      flexibilityAdaptation: 1.0 - compatibilityProfile.dietaryFlexibility,
      overallAdaptation: (1.0 - restrictionAnalysis.overallCompliance) * 0.8
    };

    const compatibilityRecommendations = {
      vegetarianEnhancement: compatibilityProfile.vegetarianCompatibility < 0.7 ? 'Adapt recipe for vegetarian compatibility' : 'Vegetarian compatibility is good',
      veganOptimization: compatibilityProfile.veganCompatibility < 0.7 ? 'Optimize recipe for vegan dietary requirements' : 'Vegan compatibility is adequate',
      glutenFreeAdaptation: compatibilityProfile.glutenFreeCompatibility < 0.7 ? 'Adapt ingredients for gluten-free compatibility' : 'Gluten-free status is clear',
      dairyFreeModification: compatibilityProfile.dairyFreeCompatibility < 0.7 ? 'Modify recipe for dairy-free requirements' : 'Dairy-free compatibility is good',
      flexibilityIncrease: compatibilityProfile.dietaryFlexibility < 0.8 ? 'Increase dietary flexibility with multiple restriction support' : 'Dietary flexibility is optimal',
      complianceImprovement: restrictionAnalysis.overallCompliance < 0.7 ? 'Improve overall dietary restriction compliance' : 'Dietary compliance is good',
      marketExpansion: restrictionAnalysis.marketAppeal < 0.8 ? 'Expand market appeal with clear dietary labeling' : 'Market appeal is strong'
    };

    const dietaryIntelligence = {
      intelligenceScore: restrictionAnalysis.overallCompliance * 0.9,
      analyticsDepth: compatibilityProfile.definedRestrictions * 0.3,
      adaptationCapability: (adaptationMetrics.adaptationPotential + adaptationMetrics.flexibilityAdaptation) / 2,
      complianceIntelligence: restrictionAnalysis.inclusivityScore * 0.9,
      marketIntelligence: restrictionAnalysis.marketAppeal * 0.8,
      flexibilityIntelligence: restrictionAnalysis.adaptabilityScore * 0.9,
      overallDietaryIntelligence: (restrictionAnalysis.overallCompliance + compatibilityProfile.dietaryFlexibility) / 2
    };

    return {
      compatibilityProfile,
      restrictionAnalysis,
      adaptationMetrics,
      compatibilityRecommendations,
      dietaryIntelligence
    };
  }
};

// 🔍 Recipe Safety Intelligence Platform
export const RecipeSafetyIntelligence = {
  // Recipe Name Safety Analytics - Name validation and enhancement
  getRecipeNameSafetyAnalytics: (recipe: Recipe): {
    nameProfile: Record<string, number>;
    safetyMetrics: Record<string, number>;
    enhancementMetrics: Record<string, number>;
    safetyRecommendations: Record<string, string>;
    nameIntelligence: Record<string, number>;
  } => {
    const name = recipe.name || '';
    const safeName = name.trim().replace(/[<>'"&]/g, '');

    const nameProfile = {
      nameLength: name.length,
      safeNameLength: safeName.length,
      nameQuality: Math.min(name.length / 50, 1.0),
      nameClarity: name.length > 5 && name.length < 100 ? 1.0 : 0.6,
      nameDescriptiveness: name.split(' ').length > 1 ? 1.0 : 0.5,
      nameSafety: name === safeName ? 1.0 : 0.3,
      nameCompleteness: name.length > 0 ? 1.0 : 0
    };

    const safetyMetrics = {
      overallSafety: nameProfile.nameSafety * 0.9,
      contentSafety: name.length > 0 && name === safeName ? 1.0 : 0.5,
      lengthSafety: name.length > 3 && name.length < 200 ? 1.0 : 0.6,
      characterSafety: /^[a-zA-Z0-9\s\-',.()&]+$/.test(name) ? 1.0 : 0.4,
      displaySafety: nameProfile.nameClarity * 0.8,
      usabilitySafety: nameProfile.nameDescriptiveness * 0.9,
      marketSafety: nameProfile.nameQuality > 0.5 ? 1.0 : 0.6
    };

    const enhancementMetrics = {
      enhancementPotential: 1.0 - nameProfile.nameQuality,
      clarityEnhancement: 1.0 - nameProfile.nameClarity,
      descriptivenessEnhancement: 1.0 - nameProfile.nameDescriptiveness,
      safetyEnhancement: 1.0 - nameProfile.nameSafety,
      completenessEnhancement: 1.0 - nameProfile.nameCompleteness,
      qualityEnhancement: 1.0 - nameProfile.nameQuality,
      overallEnhancement: (1.0 - nameProfile.nameQuality) * 0.8
    };

    const safetyRecommendations = {
      lengthOptimization: nameProfile.nameLength < 10 ? 'Expand recipe name for better descriptiveness' : nameProfile.nameLength > 80 ? 'Shorten recipe name for better usability' : 'Name length is appropriate',
      clarityImprovement: nameProfile.nameClarity < 0.8 ? 'Improve name clarity with better word choice' : 'Name clarity is good',
      descriptivenessEnhancement: nameProfile.nameDescriptiveness < 0.8 ? 'Enhance name descriptiveness with more specific terms' : 'Name descriptiveness is adequate',
      safetyImprovement: nameProfile.nameSafety < 1.0 ? 'Remove unsafe characters from recipe name' : 'Name safety is optimal',
      completenessCheck: nameProfile.nameCompleteness < 1.0 ? 'Provide a complete recipe name' : 'Name completeness is good',
      qualityEnhancement: nameProfile.nameQuality < 0.7 ? 'Enhance overall name quality for better appeal' : 'Name quality is sufficient',
      marketOptimization: safetyMetrics.marketSafety < 0.8 ? 'Optimize name for better market appeal' : 'Market appeal is strong'
    };

    const nameIntelligence = {
      intelligenceScore: safetyMetrics.overallSafety * 0.9,
      analyticsDepth: nameProfile.nameQuality * 0.8,
      safetyIntelligence: safetyMetrics.contentSafety * 0.9,
      enhancementCapability: (enhancementMetrics.enhancementPotential + enhancementMetrics.qualityEnhancement) / 2,
      usabilityIntelligence: safetyMetrics.usabilitySafety * 0.8,
      marketIntelligence: safetyMetrics.marketSafety * 0.9,
      overallNameIntelligence: (safetyMetrics.overallSafety + nameProfile.nameQuality) / 2
    };

    return {
      nameProfile,
      safetyMetrics,
      enhancementMetrics,
      safetyRecommendations,
      nameIntelligence
    };
  },

  // Recipe Description Intelligence - Description analysis and optimization
  getRecipeDescriptionIntelligence: (recipe: Recipe): {
    descriptionProfile: Record<string, number>;
    contentAnalysis: Record<string, number>;
    optimizationMetrics: Record<string, number>;
    descriptionRecommendations: Record<string, string>;
    descriptionIntelligence: Record<string, number>;
  } => {
    const description = recipe.description || '';
    const safeDescription = description.trim().replace(/[<>'"&]/g, '');

    const descriptionProfile = {
      descriptionLength: description.length,
      safeDescriptionLength: safeDescription.length,
      descriptionQuality: Math.min(description.length / 200, 1.0),
      descriptionClarity: description.length > 20 && description.length < 500 ? 1.0 : 0.6,
      descriptionRichness: description.split(' ').length > 10 ? 1.0 : 0.5,
      descriptionSafety: description === safeDescription ? 1.0 : 0.3,
      descriptionCompleteness: description.length > 0 ? 1.0 : 0
    };

    const contentAnalysis = {
      overallContent: descriptionProfile.descriptionQuality * 0.9,
      contentRichness: descriptionProfile.descriptionRichness * 0.8,
      contentClarity: descriptionProfile.descriptionClarity * 0.9,
      contentSafety: descriptionProfile.descriptionSafety * 1.0,
      contentUsability: (descriptionProfile.descriptionClarity + descriptionProfile.descriptionRichness) / 2,
      contentEngagement: descriptionProfile.descriptionQuality > 0.7 ? 1.0 : 0.5,
      contentValue: (descriptionProfile.descriptionQuality + descriptionProfile.descriptionRichness) / 2
    };

    const optimizationMetrics = {
      optimizationPotential: 1.0 - descriptionProfile.descriptionQuality,
      clarityOptimization: 1.0 - descriptionProfile.descriptionClarity,
      richnessOptimization: 1.0 - descriptionProfile.descriptionRichness,
      safetyOptimization: 1.0 - descriptionProfile.descriptionSafety,
      completenessOptimization: 1.0 - descriptionProfile.descriptionCompleteness,
      engagementOptimization: 1.0 - contentAnalysis.contentEngagement,
      overallOptimization: (1.0 - descriptionProfile.descriptionQuality) * 0.8
    };

    const descriptionRecommendations = {
      lengthOptimization: descriptionProfile.descriptionLength < 50 ? 'Expand description for better user engagement' : descriptionProfile.descriptionLength > 400 ? 'Shorten description for better readability' : 'Description length is appropriate',
      clarityImprovement: descriptionProfile.descriptionClarity < 0.8 ? 'Improve description clarity with better structure' : 'Description clarity is good',
      richnessEnhancement: descriptionProfile.descriptionRichness < 0.8 ? 'Enhance description richness with more details' : 'Description richness is adequate',
      safetyImprovement: descriptionProfile.descriptionSafety < 1.0 ? 'Remove unsafe characters from description' : 'Description safety is optimal',
      completenessCheck: descriptionProfile.descriptionCompleteness < 1.0 ? 'Provide a complete recipe description' : 'Description completeness is good',
      engagementEnhancement: contentAnalysis.contentEngagement < 0.8 ? 'Enhance description for better user engagement' : 'Description engagement is strong',
      valueOptimization: contentAnalysis.contentValue < 0.7 ? 'Optimize description value for better user experience' : 'Description value is sufficient'
    };

    const descriptionIntelligence = {
      intelligenceScore: contentAnalysis.overallContent * 0.9,
      analyticsDepth: descriptionProfile.descriptionQuality * 0.8,
      contentIntelligence: contentAnalysis.contentValue * 0.9,
      optimizationCapability: (optimizationMetrics.optimizationPotential + optimizationMetrics.engagementOptimization) / 2,
      usabilityIntelligence: contentAnalysis.contentUsability * 0.8,
      engagementIntelligence: contentAnalysis.contentEngagement * 0.9,
      overallDescriptionIntelligence: (contentAnalysis.overallContent + descriptionProfile.descriptionQuality) / 2
    };

    return {
      descriptionProfile,
      contentAnalysis,
      optimizationMetrics,
      descriptionRecommendations,
      descriptionIntelligence
    };
  }
};

/**
 * Type guard to check if an object is a ScoredRecipe
 */
export function isScoredRecipe(obj: Record<string, unknown>): obj is ScoredRecipe {
  if (!isRecipe(obj)) return false;
  
  const scoredRecipe = obj as Partial<ScoredRecipe>;
  return typeof scoredRecipe.score === 'number';
}

/**
 * Type guard to check if an ingredient is a RecipeIngredient object (not string)
 */
export function isRecipeIngredient(ingredient: Record<string, unknown>): ingredient is RecipeIngredient {
  return typeof ingredient === 'object' && 
         typeof (ingredient as RecipeIngredient).name === 'string' &&
         typeof (ingredient as RecipeIngredient).amount === 'number' &&
         typeof (ingredient as RecipeIngredient).unit === 'string';
}

/**
 * Gets the recipe's elemental properties safely with fallback to default values
 */
export function getRecipeElementalProperties(recipe: Recipe): ElementalProperties {
  if (!recipe) {
    return _createElementalProperties();
  }
  
  const elementalProps = recipe.elementalProperties;
  if (_isElementalProperties(elementalProps)) {
    return elementalProps;
  }
  
  return _createElementalProperties();
}

/**
 * Gets the recipe's cooking methods safely with fallback to empty array
 */
export function getRecipeCookingMethods(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const methods = recipe.cookingMethods || recipe.methods || [];
  return _isNonEmptyArray(methods) ? methods : [];
}

/**
 * Gets the recipe's meal types safely with fallback to empty array
 */
export function getRecipeMealTypes(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const mealTypes = recipe.mealTypes || recipe.mealType ? [recipe.mealType] : [];
  return _isNonEmptyArray(mealTypes) ? mealTypes : [];
}

/**
 * Gets the recipe's seasons safely with fallback to empty array
 */
export function getRecipeSeasons(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const seasons = recipe.seasons || recipe.season ? [recipe.season] : [];
  return _isNonEmptyArray(seasons) ? seasons : [];
}

/**
 * Gets the recipe's astrological influences safely with fallback to empty array
 */
export function getRecipeAstrologicalInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const influences = recipe.astrologicalInfluences || recipe.planetaryInfluences || [];
  return _isNonEmptyArray(influences) ? influences : [];
}

/**
 * Gets the recipe's zodiac influences safely with fallback to empty array
 */
export function getRecipeZodiacInfluences(recipe: Recipe): string[] {
  if (!recipe) return [];
  
  const zodiacInfluences = recipe.zodiacInfluences || recipe.zodiacSigns || [];
  return _isNonEmptyArray(zodiacInfluences) ? zodiacInfluences : [];
}

/**
 * Gets the recipe's cooking time safely with fallback to default
 */
export function getRecipeCookingTime(recipe: Recipe): number {
  if (!recipe) return 30;
  
  const cookingTime = recipe.cookingTime || recipe.prepTime || recipe.totalTime;
  
  if (typeof cookingTime === 'number' && cookingTime > 0) {
    return cookingTime;
  }
  
  if (typeof cookingTime === 'string') {
    const timeMatch = cookingTime.match(/(\d+)/);
    if (timeMatch) {
      return parseInt(timeMatch[1], 10);
    }
  }
  
  return 30;
}

/**
 * Checks if a recipe has a specific tag
 */
export function recipeHasTag(recipe: Recipe, tag: string): boolean {
  if (!recipe || !tag) return false;
  
  const tags = recipe.tags || [];
  return _safeSome(tags, (t: string) => t.toLowerCase() === tag.toLowerCase());
}

/**
 * Checks if a recipe is compatible with a dietary restriction
 */
export function isRecipeCompatibleWithDiet(recipe: Recipe, restriction: string): boolean {
  if (!recipe || !restriction) return false;
  
  const dietaryRestrictions = recipe.dietaryRestrictions || [];
  const tags = recipe.tags || [];
  
  const allTags = [...dietaryRestrictions, ...tags];
  return _safeSome(allTags, (tag: string) => tag.toLowerCase() === restriction.toLowerCase());
}

/**
 * Checks if a recipe contains a specific ingredient
 */
export function recipeHasIngredient(recipe: Recipe, ingredientName: string): boolean {
  if (!recipe || !ingredientName) return false;
  
  const ingredients = recipe.ingredients || [];
  return _safeSome(ingredients, (ingredient: string | RecipeIngredient) => {
    if (typeof ingredient === 'string') {
      return ingredient.toLowerCase().includes(ingredientName.toLowerCase());
    } else if (ingredient && typeof ingredient === 'object') {
      return ingredient.name?.toLowerCase().includes(ingredientName.toLowerCase()) || false;
    }
    return false;
  });
}

/**
 * Gets the recipe's dominant element based on elemental properties
 */
export function getRecipeDominantElement(recipe: Recipe): string {
  if (!recipe) return 'Earth';
  
  const elementalProps = getRecipeElementalProperties(recipe);
  
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  let dominantElement = 'Earth';
  let maxValue = elementalProps.Earth || 0;
  
  elements.forEach(element => {
    const value = elementalProps[element] || 0;
    if (value > maxValue) {
      maxValue = value;
      dominantElement = element;
    }
  });
  
  return dominantElement;
}

/**
 * Gets a safe recipe name with fallback
 */
export function getSafeRecipeName(recipe: Recipe): string {
  if (!recipe) return 'Unknown Recipe';
  
  const name = recipe.name || recipe.title || 'Unknown Recipe';
  return name.trim() || 'Unknown Recipe';
}

/**
 * Gets a safe recipe description with fallback
 */
export function getSafeRecipeDescription(recipe: Recipe): string {
  if (!recipe) return 'No description available';
  
  const description = recipe.description || 'No description available';
  return description.trim() || 'No description available';
}

/**
 * Converts a Recipe to a ScoredRecipe with optional score
 */
export function toScoredRecipe(recipe: Recipe, score?: number): ScoredRecipe {
  if (!recipe) {
    throw new Error('Recipe is required to create ScoredRecipe');
  }
  
  return {
    ...recipe,
    score: score !== undefined ? score : 0.7
  };
}

/**
 * Checks if a recipe is compatible with dietary restrictions
 */
export function isRecipeDietaryCompatible(recipe: Record<string, unknown>, dietaryRestrictions: string[] = []): boolean {
  if (!recipe) return false;
  
  const recipeRestrictions = recipe.dietaryRestrictions as string[] || [];
  const recipeTags = recipe.tags as string[] || [];
  
  const allRecipeTags = [...recipeRestrictions, ...recipeTags].map(tag => tag.toLowerCase());
  
  return dietaryRestrictions.every(restriction => 
    allRecipeTags.includes(restriction.toLowerCase())
  );
}

/**
 * Gets recipe ingredients as RecipeIngredient array
 */
export function getRecipeIngredients(recipe: Recipe): RecipeIngredient[] {
  if (!recipe || !recipe.ingredients) return [];
  
  return recipe.ingredients.map(ingredient => {
    if (typeof ingredient === 'string') {
      return {
        name: ingredient,
        amount: 1,
        unit: 'piece'
      } as RecipeIngredient;
    } else if (ingredient && typeof ingredient === 'object') {
      return ingredient as RecipeIngredient;
    }
    
    return {
      name: 'Unknown ingredient',
      amount: 1,
      unit: 'piece'
    } as RecipeIngredient;
  }).filter(ingredient => ingredient.name !== 'Unknown ingredient');
}

// ----- Backward-compatibility alias exports -----
export const _getRecipeElementalProperties = getRecipeElementalProperties;
export const _getRecipeCookingMethods = getRecipeCookingMethods;
export const _recipeHasTag = recipeHasTag;
