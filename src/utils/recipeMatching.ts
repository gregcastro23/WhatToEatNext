import type { 
    Recipe, 
    ElementalProperties,
    AstrologicalState,
    Season,
    IngredientMapping
  } from '@/types/alchemy';
  import { elementalUtils } from './elementalUtils';
  import { ingredientsMap } from '@/data/ingredients';
  
  interface MatchResult {
    recipe: Recipe;
    score: number;
    elements: ElementalProperties;
    dominantElements: [string, number][];
    matchedIngredients?: {
      name: string;
      matchedTo?: IngredientMapping;
      confidence: number;
    }[];
  }
  
  interface MatchFilters {
    maxTime?: number;
    dietary?: string[];
    season?: Season;
    servingSize?: number;
    excludeIngredients?: string[];
    cookingMethod?: string[];
  }
  
  // Default elemental properties for calculations
  export const DEFAULT_ELEMENTAL_PROPERTIES = {
    Fire: 0.25,
    Water: 0.25,
    Air: 0.25,
    Earth: 0.25
  };
  
  export const findBestMatches = (
    recipes: Recipe[],
    currentEnergy: any,
    filters: MatchFilters = {}
  ): MatchResult[] => {
    // Filter recipes based on dietary, time, etc.
    let filteredRecipes = recipes.filter(recipe => {
      // Apply filters if provided
      if (filters.maxTime && recipe.cookTime && parseInt(recipe.cookTime) > filters.maxTime) {
        return false;
      }
      
      if (filters.dietary && recipe.dietaryInfo) {
        const matchesDietary = filters.dietary.some(diet => 
          recipe.dietaryInfo.includes(diet)
        );
        if (!matchesDietary) return false;
      }
      
      if (filters.season && recipe.season && !recipe.season.includes(filters.season)) {
        return false;
      }
      
      if (filters.servingSize && recipe.servingSize && recipe.servingSize < filters.servingSize) {
        return false;
      }
      
      if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
        const hasExcludedIngredient = recipe.ingredients.some(ingredient => 
          filters.excludeIngredients.includes(ingredient.name.toLowerCase())
        );
        if (hasExcludedIngredient) return false;
      }
      
      if (filters.cookingMethod && filters.cookingMethod.length > 0 && recipe.cookingMethods) {
        const matchesCookingMethod = recipe.cookingMethods.some(method => 
          filters.cookingMethod.includes(method)
        );
        if (!matchesCookingMethod) return false;
      }
      
      return true;
    });
    
    // Calculate scores and sort
    const matches: MatchResult[] = filteredRecipes.map(recipe => {
      // Calculate elemental properties 
      const elements = calculateBaseElements(recipe);
      
      // Get ingredient mappings
      const matchedIngredients = connectIngredientsToMappings(recipe);
      
      // Calculate score based on elements and current energy
      const score = calculateMatchScore(recipe, currentEnergy);
      
      return {
        recipe,
        score,
        elements,
        dominantElements: calculateDominantElements(elements),
        matchedIngredients
      };
    });
    
    // Sort by score (descending)
    return matches.sort((a, b) => b.score - a.score);
  };
  
  const calculateBaseElements = (recipe: Recipe): ElementalProperties => {
    let elements: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
  
    recipe.ingredients.forEach(ingredient => {
      const baseProps = ingredient.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES;
      const nutrition = ingredient.nutritionalProfile;
      
      // Calculate nutritional boost
      const nutritionBoost = nutrition ? Math.log1p(
        nutrition.calories + 
        nutrition.macros.protein * 3 +
        nutrition.macros.fiber * 2
      ) : 1;
      
      const boostedProps = {
        Fire: baseProps.Fire * nutritionBoost,
        Water: baseProps.Water * nutritionBoost,
        Earth: baseProps.Earth * nutritionBoost,
        Air: baseProps.Air * nutritionBoost
      };
      
      elements = elementalUtils.combineProperties(
        elements,
        boostedProps,
        ingredient.amount / 100
      );
    });
  
    return elementalUtils.normalizeProperties(elements);
  };
  
  const calculateEnergyMatch = (recipeEnergy: any, currentEnergy: any) => {
    let score = 0;
    
    // Check if we're in Aries season
    const isAriesSeason = currentEnergy.zodiacEnergy === 'aries';
    
    // Zodiac energy match with increased weight for Mars during Aries season
    if (recipeEnergy.zodiac === currentEnergy.zodiacEnergy) {
      // Base zodiac match score
      score += 0.4;
      
      // If we're in Aries season and the recipe has Mars influence, add bonus
      if (isAriesSeason && recipeEnergy.planetary && recipeEnergy.planetary.includes('Mars')) {
        score += 0.2; // Additional bonus for Mars-influenced recipes during Aries season
      }
    }
    
    // Lunar energy match with increased weight
    if (recipeEnergy.lunar === currentEnergy.lunarEnergy) {
      score += 0.4; // Increased from 0.3
    }
    
    // Planetary energy match with specific planet bonuses
    if (recipeEnergy.planetary === currentEnergy.planetaryEnergy) {
      score += 0.35; // Increased base planetary match
    }
    
    // Special handling for specific planets
    if (recipeEnergy.planetary && currentEnergy.planetaryEnergy) {
      // Sun influence bonus
      if (recipeEnergy.planetary.includes('Sun') && currentEnergy.planetaryEnergy.includes('Sun')) {
        score += 0.15;
      }
      
      // Moon influence bonus
      if (recipeEnergy.planetary.includes('Moon') && currentEnergy.planetaryEnergy.includes('Moon')) {
        score += 0.15;
      }
      
      // Mars influence bonus
      if (recipeEnergy.planetary.includes('Mars') && currentEnergy.planetaryEnergy.includes('Mars')) {
        // Higher bonus during Aries season
        score += isAriesSeason ? 0.25 : 0.15;
      }
    }
    
    return Math.min(1.0, score); // Cap at 1.0
  };
  
  const calculateDominantElements = (
    elements: ElementalProperties
  ): [string, number][] => {
    return Object.entries(elements)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 2)
      .map(([element, value]) => [element, value || 0]);
  };
  
  function calculateMatchScore(recipe: Recipe, currentEnergy: any): number {
    // Base score starts at 0.5 (neutral match)
    let score = 0.5;
    
    // 1. Calculate elemental score (35% of total) - now with double impact
    const elementalScore = calculateElementalAlignment(recipe, currentEnergy);
    score += elementalScore * 0.7;  // Doubled from 0.35
    
    // 2. Calculate modality score (25% of total) - now with double impact
    const modalityScore = calculateModalityScore(
      recipe.qualities || [],
      currentEnergy.preferredModality
    );
    score += modalityScore * 0.5;  // Doubled from 0.25
    
    // 3. Calculate astrological score (20% of total) - now with double impact
    if (recipe.astrologicalEnergy && currentEnergy) {
      const astrologicalScore = calculateEnergyMatch(
        recipe.astrologicalEnergy,
        currentEnergy
      );
      score += astrologicalScore * 0.4;  // Doubled from 0.2
    }
    
    // 4. Calculate seasonal score (10% of total) - now with double impact
    if (recipe.season && currentEnergy.season) {
      const seasonalScore = recipe.season.includes(currentEnergy.season) ? 1.0 : 0.0;
      score += seasonalScore * 0.2;  // Doubled from 0.1
    }
    
    // 5. Calculate nutritional alignment (10% of total) - now with double impact
    const nutritionalScore = calculateNutritionalAlignment(recipe, currentEnergy);
    score += nutritionalScore * 0.2;  // Doubled from 0.1
    
    // Normalize the final score to ensure it stays in 0-1 range despite doubled factors
    return Math.min(1, Math.max(0, score));
  }
  
  function calculateElementalAlignment(recipe: Recipe, currentEnergy: any): number {
    // Get recipe elemental properties
    const recipeElements = calculateBaseElements(recipe);
    
    // Get current astrological elemental properties
    const currentElements = currentEnergy.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES;
    
    // Calculate weighted similarity between the two elemental profiles
    let similarity = 0;
    let totalWeight = 0;
    
    // Identify dominant elements in current energy
    const dominantElements = Object.entries(currentElements)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([element]) => element);
    
    // Weight importance of elements based on dominance
    Object.entries(currentElements).forEach(([element, value]) => {
      const weight = dominantElements.includes(element) ? 1.5 : 1.0;
      const diff = Math.abs(recipeElements[element as keyof ElementalProperties] - (value as number));
      
      // Convert difference to similarity (0-1 scale), with exponential scaling for better differentiation
      const elementSimilarity = Math.pow(1 - (diff / 1), 1.5);
      
      similarity += elementSimilarity * weight;
      totalWeight += weight;
    });
    
    // Normalize the similarity score
    return similarity / totalWeight;
  }
  
  // New function to calculate nutritional alignment
  function calculateNutritionalAlignment(recipe: Recipe, currentEnergy: any): number {
    // Default score if no nutritional data available
    if (!recipe.ingredients || !currentEnergy.nutritionalNeeds) {
      return 0.5;
    }
    
    let alignmentScore = 0;
    
    // Check if the recipe aligns with current energy's nutritional needs
    if (currentEnergy.nutritionalNeeds.highProtein && hasHighProtein(recipe)) {
      alignmentScore += 0.25;
    }
    
    if (currentEnergy.nutritionalNeeds.lowCarb && hasLowCarb(recipe)) {
      alignmentScore += 0.25;
    }
    
    if (currentEnergy.nutritionalNeeds.highFiber && hasHighFiber(recipe)) {
      alignmentScore += 0.25;
    }
    
    if (currentEnergy.nutritionalNeeds.lowFat && hasLowFat(recipe)) {
      alignmentScore += 0.25;
    }
    
    // Default to neutral if no specific needs
    return alignmentScore > 0 ? alignmentScore : 0.5;
  }
  
  // Helper functions for nutritional evaluation
  function hasHighProtein(recipe: Recipe): boolean {
    return recipe.ingredients.some(ingredient => 
      ingredient.nutritionalProfile?.macros.protein > 15
    );
  }
  
  function hasLowCarb(recipe: Recipe): boolean {
    const totalCarbs = recipe.ingredients.reduce(
      (sum, ingredient) => sum + (ingredient.nutritionalProfile?.macros.carbs || 0), 
      0
    );
    return totalCarbs < 30;
  }
  
  function hasHighFiber(recipe: Recipe): boolean {
    return recipe.ingredients.some(ingredient => 
      ingredient.nutritionalProfile?.macros.fiber > 5
    );
  }
  
  function hasLowFat(recipe: Recipe): boolean {
    const totalFat = recipe.ingredients.reduce(
      (sum, ingredient) => sum + (ingredient.nutritionalProfile?.macros.fat || 0), 
      0
    );
    return totalFat < 15;
  }
  
  // Helper function to calculate modality score
  function calculateModalityScore(
    qualities: string[],
    preferredModality?: Modality
  ): number {
    // Get the recipe's modality based on qualities
    const recipeModality = determineIngredientModality(qualities);
    
    // If no preferred modality, return neutral score
    if (!preferredModality) return 0.5;
    
    // Return 1.0 for exact match, 0.7 for compatible match, 0.3 for mismatch
    if (recipeModality === preferredModality) return 1.0;
    
    // Consider modality compatibility
    const compatibleModalities = {
      Cardinal: ['Mutable'],
      Fixed: ['Mutable'],
      Mutable: ['Cardinal', 'Fixed']
    };
    
    if (compatibleModalities[preferredModality]?.includes(recipeModality)) {
      return 0.7;
    }
    
    return 0.3;
  }
  
  // Create an astrologyUtils object with the necessary functions
  export const astrologyUtils = {
    getPlanetaryElement(planet: string): string {
      const planetElements: Record<string, string> = {
        'Sun': 'Fire',
        'Moon': 'Water',
        'Mercury': 'Air',
        'Venus': 'Earth',
        'Mars': 'Fire',
        'Jupiter': 'Air',
        'Saturn': 'Earth',
        'Uranus': 'Air',
        'Neptune': 'Water',
        'Pluto': 'Water'
      };
      return planetElements[planet] || 'Neutral';
    },
    
    getZodiacElement(sign: string): string {
      const zodiacElements: Record<string, string> = {
        'Aries': 'Fire',
        'Leo': 'Fire',
        'Sagittarius': 'Fire',
        'Taurus': 'Earth',
        'Virgo': 'Earth',
        'Capricorn': 'Earth',
        'Gemini': 'Air',
        'Libra': 'Air',
        'Aquarius': 'Air',
        'Cancer': 'Water',
        'Scorpio': 'Water',
        'Pisces': 'Water'
      };
      return zodiacElements[sign] || 'Neutral';
    }
  };
  
  /**
   * Connects recipe ingredients to their mappings in the ingredient data files
   * Provides a confidence score for each match
   */
  export const connectIngredientsToMappings = (
    recipe: Recipe
  ): { 
    name: string; 
    matchedTo?: IngredientMapping; 
    confidence: number;
  }[] => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return [];
    }

    const matches = recipe.ingredients.map(recipeIngredient => {
      // Initial result with no match
      const result = {
        name: recipeIngredient.name,
        matchedTo: undefined,
        confidence: 0
      };

      // 1. Try exact match first
      const exactMatch = ingredientsMap[recipeIngredient.name.toLowerCase()];
      if (exactMatch) {
        result.matchedTo = exactMatch as IngredientMapping;
        result.confidence = 1.0;
        return result;
      }

      // 2. Try matching by name parts (for compound ingredients)
      const nameParts = recipeIngredient.name.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length < 3) continue; // Skip short parts like "of", "and", etc.
        
        const partMatch = ingredientsMap[part];
        if (partMatch) {
          result.matchedTo = partMatch as IngredientMapping;
          result.confidence = 0.8;
          return result;
        }
      }

      // 3. Try matching with category if provided
      if (recipeIngredient.category) {
        // Find ingredients with matching category
        const categoryMatches = Object.entries(ingredientsMap).filter(([_, ingredient]) => {
          return ingredient.category === recipeIngredient.category;
        });

        if (categoryMatches.length > 0) {
          // Find the best match based on similar name
          const bestMatch = categoryMatches.reduce((best, [key, ingredient]) => {
            // Simple string similarity check
            const similarity = getStringSimilarity(recipeIngredient.name.toLowerCase(), key.toLowerCase());
            
            if (similarity > best.similarity) {
              return { similarity, ingredient };
            }
            return best;
          }, { similarity: 0.3, ingredient: null });

          if (bestMatch.ingredient && bestMatch.similarity > 0.3) {
            result.matchedTo = bestMatch.ingredient as IngredientMapping;
            result.confidence = bestMatch.similarity;
            return result;
          }
        }
      }

      // 4. Try matching by swaps if provided
      if (recipeIngredient.swaps && recipeIngredient.swaps.length > 0) {
        for (const swap of recipeIngredient.swaps) {
          const swapMatch = ingredientsMap[swap.toLowerCase()];
          if (swapMatch) {
            result.matchedTo = swapMatch as IngredientMapping;
            result.confidence = 0.7;
            return result;
          }
        }
      }

      return result;
    });

    return matches;
  };

  /**
   * Get string similarity using Levenshtein distance
   */
  function getStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // If either string is empty, similarity is 0
    if (len1 === 0 || len2 === 0) return 0;
    
    // Use simplified Levenshtein for basic similarity
    const maxLen = Math.max(len1, len2);
    let distance = 0;
    
    for (let i = 0; i < maxLen; i++) {
      if (!str1[i] || !str2[i] || str1[i] !== str2[i]) {
        distance++;
      }
    }
    
    // Convert to similarity score (0-1)
    return 1 - (distance / maxLen);
  }

  export default findBestMatches;