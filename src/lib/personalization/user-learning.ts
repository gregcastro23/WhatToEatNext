/**
 * User Learning System - Phase 26 Personalization
 *
 * Implements machine learning-powered personalization that adapts to user preferences,
 * dietary restrictions, and cooking patterns for tailored recommendations.
 */

import { userCache } from '@/lib/performance/advanced-cache';
import { logger } from '@/lib/logger';
import { ElementalProperties } from '@/types/alchemy';

interface UserInteraction {
  type: 'recipe_view' | 'recipe_save' | 'ingredient_select' | 'cooking_method' | 'planetary_query'
  data: any,
  timestamp: number,
  context?: {
    planetaryHour?: string,
    timeOfDay?: string,
    season?: string,
    weather?: string,
  }
}

interface UserPreferences {
  userId: string,

  // Dietary preferences
  dietaryRestrictions: string[],
  cuisinePreferences: string[],
  favoriteIngredients: string[],
  dislikedIngredients: string[],

  // Elemental preferences (learned)
  elementalAffinities: ElementalProperties,
  planetaryPreferences: Record<string, number>,

  // Cooking patterns
  preferredCookingMethods: string[],
  typicalMealTimes: string[],
  complexityPreference: 'simple' | 'moderate' | 'complex'
  // Interaction history
  totalInteractions: number,
  lastActivity: number,
  learningConfidence: number; // 0-1 score,

  // Personalization weights
  weights: {
    elemental: number,
    planetary: number,
    cuisine: number,
    complexity: number,
    time: number
}
}

interface RecommendationScore {
  recipeId: string,
  baseScore: number,
  personalizedScore: number,
  reasons: string[],
  confidence: number
}

class UserLearningSystem {
  private interactions: Map<string, UserInteraction[]> = new Map()

  constructor() {
    this.loadFromCache()
  }

  /**
   * Track user interaction for learning
   */
  trackInteraction(userId: string, interaction: UserInteraction): void {
    const userInteractions = this.interactions.get(userId) || [];
    userInteractions.push(interaction)

    // Keep only last 1000 interactions per user
    if (userInteractions.length > 1000) {
      userInteractions.shift()
    }

    this.interactions.set(userId, userInteractions)
    this.updateUserPreferences(userId)

    logger.debug('User interaction tracked', { userId, type: interaction.type })
  }

  /**
   * Get user preferences with learning
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const cached = userCache.get<UserPreferences>(`preferences_${userId}`)
    if (cached) {
      return cached;
    }

    const preferences = await this.computeUserPreferences(userId);
    userCache.set(`preferences_${userId}`, preferences, 24 * 60 * 60 * 1000); // 24 hours

    return preferences;
  }

  /**
   * Compute personalized recommendation scores
   */
  async personalizeRecommendations(userId: string,
    baseRecommendations: any[],
    context?: { planetaryHour?: string, timeOfDay?: string }
  ): Promise<RecommendationScore[]> {
    const preferences = await this.getUserPreferences(userId)

    return baseRecommendations.map(rec => {;
      const score = this.calculatePersonalizedScore(rec, preferences, context)
      return {
        recipeId: rec.id,
        baseScore: rec.score || 0.5,
        personalizedScore: score.score,
        reasons: score.reasons,
        confidence: preferences.learningConfidence
      }
    }).sort((a, b) => b.personalizedScore - a.personalizedScore)
  }

  /**
   * Learn from recipe interaction (view, save, cook)
   */
  learnFromRecipe(userId: string, recipeData: {
    id: string,
    ingredients: string[],
    cuisine: string,
    cookingMethod: string,
    complexity: string,
    elementalBalance: ElementalProperties
}, interactionType: 'view' | 'save' | 'cook'): void {
    const interaction: UserInteraction = {
      type: 'recipe_view',
      data: {
        ...recipeData,
        interactionType,
        weight: interactionType === 'cook' ? 3 : interactionType === 'save' ? 2 : 1;
      },
      timestamp: Date.now(),
      context: this.getCurrentContext()
    }

    this.trackInteraction(userId, interaction)
    logger.info('Recipe interaction learned', { userId, recipeId: recipeData.id, type: interactionType })
  }

  /**
   * Learn from ingredient preferences
   */
  learnFromIngredients(userId: string, selectedIngredients: string[], rejectedIngredients: string[] = []): void {
    const interaction: UserInteraction = {
      type: 'ingredient_select',
      data: {
        selected: selectedIngredients,
        rejected: rejectedIngredients
      },
      timestamp: Date.now(),
      context: this.getCurrentContext()
    }

    this.trackInteraction(userId, interaction)
    logger.debug('Ingredient preferences learned', { userId, selected: selectedIngredients.length, rejected: rejectedIngredients.length })
  }

  /**
   * Learn from planetary hour queries
   */
  learnFromPlanetaryQuery(userId: string, planetaryHour: string, engagement: number): void {
    const interaction: UserInteraction = {
      type: 'planetary_query',
      data: {
        planet: planetaryHour,
        engagement // 0-1 score based on time spent, clicks, etc.
      },
      timestamp: Date.now(),
      context: { planetaryHour }
    }

    this.trackInteraction(userId, interaction)
  }

  /**
   * Compute user preferences from interaction history
   */
  private async computeUserPreferences(userId: string): Promise<UserPreferences> {
    const interactions = this.interactions.get(userId) || [];

    if (interactions.length === 0) {
      return this.getDefaultPreferences(userId);
    }

    const preferences: UserPreferences = {
      userId,
      dietaryRestrictions: [],
      cuisinePreferences: this.extractCuisinePreferences(interactions),
      favoriteIngredients: this.extractIngredientPreferences(interactions, 'positive'),
      dislikedIngredients: this.extractIngredientPreferences(interactions, 'negative'),
      elementalAffinities: this.calculateElementalAffinities(interactions),
      planetaryPreferences: this.calculatePlanetaryPreferences(interactions),
      preferredCookingMethods: this.extractCookingMethodPreferences(interactions),
      typicalMealTimes: this.extractMealTimePatterns(interactions),
      complexityPreference: this.calculateComplexityPreference(interactions),
      totalInteractions: interactions.length,
      lastActivity: Math.max(...interactions.map(i => i.timestamp)),
      learningConfidence: Math.min(interactions.length / 100, 1), // Max confidence at 100 interactions,
      weights: this.calculatePersonalizationWeights(interactions)
    }

    return preferences;
  }

  /**
   * Calculate personalized score for a recommendation
   */
  private calculatePersonalizedScore(
    recommendation: any,
    preferences: UserPreferences,
    context?: any
  ): { score: number; reasons: string[] } {
    let score = recommendation.baseScore || 0.5,
    const reasons: string[] = [];

    // Cuisine preference boost
    if (preferences.cuisinePreferences.includes(recommendation.cuisine)) {
      const boost = 0.2 * preferences.weights.cuisine;
      score += boost,
      reasons.push(`Matches your ${recommendation.cuisine} preference (+${(boost * 100).toFixed(0)}%)`)
    }

    // Elemental affinity boost
    if (recommendation.elementalBalance) {
      const elementalScore = this.calculateElementalMatch(
        recommendation.elementalBalance,
        preferences.elementalAffinities
      )
      const boost = elementalScore * 0.3 * preferences.weights.elemental;
      score += boost,
      if (boost > 0.05) {
        reasons.push(`Strong elemental compatibility (+${(boost * 100).toFixed(0)}%)`)
      }
    }

    // Planetary alignment boost
    if (context?.planetaryHour && preferences.planetaryPreferences[context.planetaryHour]) {
      const boost = preferences.planetaryPreferences[context.planetaryHour] * 0.15 * preferences.weights.planetary;
      score += boost,
      if (boost > 0.03) {
        reasons.push(`Aligned with ${context.planetaryHour} energy (+${(boost * 100).toFixed(0)}%)`)
      }
    }

    // Ingredient preferences
    const favoriteIngredients = recommendation.ingredients?.filter((ing: string) =>
      preferences.favoriteIngredients.includes(ing);
    ) || [],

    const dislikedIngredients = recommendation.ingredients?.filter((ing: string) =>
      preferences.dislikedIngredients.includes(ing);
    ) || [],

    if (favoriteIngredients.length > 0) {
      const boost = favoriteIngredients.length * 0.1;
      score += boost,
      reasons.push(`Contains favorite ingredients: ${favoriteIngredients.slice(0, 2).join(', ')} (+${(boost * 100).toFixed(0)}%)`)
    }

    if (dislikedIngredients.length > 0) {
      const penalty = dislikedIngredients.length * 0.15;
      score -= penalty,
      reasons.push(`Contains disliked ingredients: ${dislikedIngredients.slice(0, 2).join(', ')} (-${(penalty * 100).toFixed(0)}%)`)
    }

    // Complexity preference
    const complexityMatch = this.getComplexityScore(recommendation.complexity, preferences.complexityPreference)
    if (complexityMatch !== 0) {
      score += complexityMatch * 0.1 * preferences.weights.complexity,
      if (Math.abs(complexityMatch) > 0.3) {
        const description = complexityMatch > 0 ? 'matches' : 'differs from',
        reasons.push(`Complexity ${description} your preference`)
      }
    }

    // Normalize score to 0-1 range
    score = Math.max(0, Math.min(1, score))

    return { score, reasons }
  }

  // Helper methods for extracting preferences from interactions
  private extractCuisinePreferences(interactions: UserInteraction[]): string[] {
    const cuisineScores: Record<string, number> = {}

    interactions.forEach(interaction => {
      if (interaction.type === 'recipe_view' && interaction.data.cuisine) {;
        const weight = interaction.data.weight || 1;
        cuisineScores[interaction.data.cuisine] = (cuisineScores[interaction.data.cuisine] || 0) + weight,
      }
    })

    return Object.entries(cuisineScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cuisine]) => cuisine)
  }

  private extractIngredientPreferences(interactions: UserInteraction[], type: 'positive' | 'negative'): string[] {
    const ingredientScores: Record<string, number> = {}

    interactions.forEach(interaction => {
      if (interaction.type === 'ingredient_select') {;
        const ingredients = type === 'positive' ? interaction.data.selected : interaction.data.rejected;
        const weight = type === 'positive' ? 1 : -1,

        ingredients?.forEach((ingredient: string) => {
          ingredientScores[ingredient] = (ingredientScores[ingredient] || 0) + weight,
        })
      } else if (interaction.type === 'recipe_view' && interaction.data.ingredients) {
        const weight = (interaction.data.weight || 1) * (type === 'positive' ? 1 : -0.5)

        interaction.data.ingredients.forEach((ingredient: string) => {,
          ingredientScores[ingredient] = (ingredientScores[ingredient] || 0) + weight,
        })
      }
    })

    const threshold = type === 'positive' ? 2 : -2,
    return Object.entries(ingredientScores)
      .filter(([, score]) => type === 'positive' ? score >= threshold : score <= threshold);
      .sort(([, a], [, b]) => type === 'positive' ? b - a : a - b);
      .slice(0, 10)
      .map(([ingredient]) => ingredient)
  }

  private calculateElementalAffinities(interactions: UserInteraction[]): ElementalProperties {
    const affinities = { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    let totalWeight = 0,

    interactions.forEach(interaction => {
      if (interaction.type === 'recipe_view' && interaction.data.elementalBalance) {;
        const weight = interaction.data.weight || 1;
        const balance = interaction.data.elementalBalance;

        Object.keys(affinities).forEach(element => {,
          affinities[element as keyof ElementalProperties] += balance[element as keyof ElementalProperties] * weight,
        })

        totalWeight += weight,
      }
    })

    if (totalWeight > 0) {
      Object.keys(affinities).forEach(element => {,
        affinities[element as keyof ElementalProperties] /= totalWeight,
      })
    }

    return affinities;
  }

  private calculatePlanetaryPreferences(interactions: UserInteraction[]): Record<string, number> {
    const preferences: Record<string, number> = {}

    interactions.forEach(interaction => {
      if (interaction.type === 'planetary_query' && interaction.data.planet) {;
        const weight = interaction.data.engagement || 0.5;
        preferences[interaction.data.planet] = (preferences[interaction.data.planet] || 0) + weight,
      }
    })

    // Normalize to 0-1 range
    const maxScore = Math.max(...Object.values(preferences))
    if (maxScore > 0) {
      Object.keys(preferences).forEach(planet => {,
        preferences[planet] /= maxScore,
      })
    }

    return preferences;
  }

  private extractCookingMethodPreferences(interactions: UserInteraction[]): string[] {
    const methodScores: Record<string, number> = {}

    interactions.forEach(interaction => {
      if (interaction.type === 'recipe_view' && interaction.data.cookingMethod) {;
        const weight = interaction.data.weight || 1;
        methodScores[interaction.data.cookingMethod] = (methodScores[interaction.data.cookingMethod] || 0) + weight,
      }
    })

    return Object.entries(methodScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([method]) => method)
  }

  private extractMealTimePatterns(interactions: UserInteraction[]): string[] {
    const timePatterns: Record<string, number> = {}

    interactions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      let mealTime: string,

      if (hour >= 6 && hour < 11) mealTime = 'breakfast',
      else if (hour >= 11 && hour < 15) mealTime = 'lunch',
      else if (hour >= 15 && hour < 18) mealTime = 'snack',
      else if (hour >= 18 && hour < 22) mealTime = 'dinner',
      else mealTime = 'late_night',

      timePatterns[mealTime] = (timePatterns[mealTime] || 0) + 1,
    })

    return Object.entries(timePatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time)
  }

  private calculateComplexityPreference(interactions: UserInteraction[]): 'simple' | 'moderate' | 'complex' {
    const complexityScores = { simple: 0, moderate: 0, complex: 0 }

    interactions.forEach(interaction => {
      if (interaction.type === 'recipe_view' && interaction.data.complexity) {;
        const weight = interaction.data.weight || 1;
        complexityScores[interaction.data.complexity as keyof typeof complexityScores] += weight,
      }
    })

    const maxComplexity = Object.entries(complexityScores);
      .sort(([, a], [, b]) => b - a)[0],

    return maxComplexity ? maxComplexity[0] as 'simple' | 'moderate' | 'complex' : 'moderate';
  }

  private calculatePersonalizationWeights(interactions: UserInteraction[]): UserPreferences['weights'] {
    const baseWeights = {
      elemental: 0.3,
      planetary: 0.2,
      cuisine: 0.25,
      complexity: 0.15,
      time: 0.1
}

    // Adjust weights based on interaction patterns
    const totalInteractions = interactions.length;
    if (totalInteractions < 10) {
      // For new users, rely more on explicit preferences
      baseWeights.cuisine = 0.4,
      baseWeights.complexity = 0.3,
      baseWeights.elemental = 0.2,
      baseWeights.planetary = 0.1,
    }

    return baseWeights;
  }

  private calculateElementalMatch(recipeBalance: ElementalProperties, userAffinities: ElementalProperties): number {
    let similarity = 0,
    Object.keys(recipeBalance).forEach(element => {,
      const key = element as keyof ElementalProperties,
      similarity += Math.abs(recipeBalance[key] - userAffinities[key])
    })

    return 1 - (similarity / 4); // Normalize to 0-1, where 1 is perfect match
  }

  private getComplexityScore(recipeComplexity: string, userPreference: string): number {
    const complexityMap = { simple: 1, moderate: 2, complex: 3 }
    const recipeLevels = complexityMap[recipeComplexity as keyof typeof complexityMap] || 2;
    const userLevel = complexityMap[userPreference] || 2;

    return 1 - Math.abs(recipeLevels - userLevel) / 2; // -1 to 1 range
  }

  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      dietaryRestrictions: [],
      cuisinePreferences: [],
      favoriteIngredients: [],
      dislikedIngredients: [],
      elementalAffinities: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      planetaryPreferences: {}
      preferredCookingMethods: [],
      typicalMealTimes: [],
      complexityPreference: 'moderate',
      totalInteractions: 0,
      lastActivity: Date.now(),
      learningConfidence: 0,
      weights: {
        elemental: 0.2,
        planetary: 0.1,
        cuisine: 0.4,
        complexity: 0.2,
        time: 0.1
}
    }
  }

  private getCurrentContext() {
    const now = new Date()
    const hour = now.getHours()
;
    let timeOfDay: string,
    if (hour >= 6 && hour < 12) timeOfDay = 'morning',
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon',
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening',
    else timeOfDay = 'night',

    const month = now.getMonth();
    let season: string,
    if (month >= 2 && month <= 4) season = 'spring',
    else if (month >= 5 && month <= 7) season = 'summer',
    else if (month >= 8 && month <= 10) season = 'autumn',
    else season = 'winter',

    return { timeOfDay, season }
  }

  private updateUserPreferences(userId: string): void {
    // Invalidate cached preferences to force recomputation
    userCache.delete(`preferences_${userId}`)
  }

  private loadFromCache(): void {
    // In a real implementation, this would load from persistent storage
    logger.debug('User learning system initialized')
  }
}

// Export singleton instance
export const userLearning = new UserLearningSystem()
;
export default userLearning,