import type { ElementalProperties, ZodiacSign, LunarPhase, Season, Element, AstrologicalState } from '@/types';
import { spices } from '@/data/ingredients/spices';
import { herbs } from '@/data/ingredients/herbs';
import { fruits } from '@/data/ingredients/fruits';
import { grains } from '@/data/ingredients/grains';
import { vegetables } from '@/data/ingredients/vegetables';
import { oils } from '@/data/ingredients/oils';
import { seasonings } from '@/data/ingredients/seasonings';
import { proteins, meats, poultry, seafood, eggs, legumes, dairy, plantBased } from '@/data/ingredients/proteins';
import { getCurrentSeason } from '@/data/integrations/seasonal';

export interface EnhancedIngredient {
  name: string;
  category?: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile: {
    elementalAffinity: {
      base: string;
      decanModifiers?: Record<string, any>;
    };
    rulingPlanets: string[];
    favorableZodiac?: ZodiacSign[];
  };
  flavorProfile?: Record<string, number>;
  season?: string[];
  nutritionalProfile?: {
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugars: number;
    };
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
    phytonutrients: Record<string, number>;
  };
  score?: number;
  scoreDetails?: Record<string, number>;
  [key: string]: any; // Allow other properties
}

/**
 * Consolidated function to get all ingredients from various categories
 */
export const getAllIngredients = (): EnhancedIngredient[] => {
  const allIngredients: EnhancedIngredient[] = [];
  
  // Debug logs
  console.log('Vegetables data:', Object.keys(vegetables).length, 'items');
  console.log('Vegetable names:', Object.keys(vegetables));
  
  // Define all categories
  const categories = [
    { name: 'Spices', data: spices },
    { name: 'Plant-Based Proteins', data: plantBased },
    { name: 'Meats', data: meats },
    { name: 'Poultry', data: poultry },
    { name: 'Seafood', data: seafood },
    { name: 'Eggs', data: eggs },
    { name: 'Legumes', data: legumes },
    { name: 'Dairy', data: dairy },
    { name: 'Herbs', data: herbs },
    { name: 'Fruits', data: fruits },
    { name: 'Grains', data: grains },
    { name: 'Vegetables', data: vegetables },
    { name: 'Oils', data: oils },
    { name: 'Seasonings', data: seasonings }
  ];
  
  // Process each category
  categories.forEach(category => {
    if (!category.data) {
      console.warn(`No data for category: ${category.name}`);
      return;
    }
    
    // Count the entries in this category
    console.log(`${category.name} category has ${Object.keys(category.data).length} items`);
    
    Object.entries(category.data).forEach(([name, data]) => {
      // Make sure we add the name to the ingredient
      allIngredients.push({
        name,
        category: category.name.toLowerCase(),
        ...data,
      } as EnhancedIngredient);
    });
  });
  
  // Filter out ingredients without proper astrological profiles
  const validIngredients = allIngredients.filter(ing => 
    ing.astrologicalProfile && 
    ing.astrologicalProfile.elementalAffinity && 
    ing.astrologicalProfile.rulingPlanets
  );
  
  console.log(`Total ingredients: ${allIngredients.length}, Valid ingredients: ${validIngredients.length}`);
  if (validIngredients.length < allIngredients.length) {
    console.log('Filtered out:',
      allIngredients.filter(ing => 
        !(ing.astrologicalProfile && ing.astrologicalProfile.elementalAffinity && ing.astrologicalProfile.rulingPlanets)
      ).map(ing => `${ing.name} (${ing.category})`)
    );
  }
  
  // At the end of the getAllIngredients function, add standardization
  return validIngredients.map(ingredient => standardizeIngredient(ingredient));
};

/**
 * Standardizes an ingredient's data structure to ensure consistent format
 */
function standardizeIngredient(ingredient: EnhancedIngredient): EnhancedIngredient {
  // Create a copy of the ingredient to avoid modifying the original
  const standardized = { ...ingredient };
  
  // Ensure elementalProperties exists
  if (!standardized.elementalProperties) {
    standardized.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  // Special case for vegetables - ensure they have more Earth element
  if (standardized.category?.toLowerCase().includes('vegetable')) {
    standardized.elementalProperties = {
      ...standardized.elementalProperties,
      Earth: Math.max(standardized.elementalProperties.Earth || 0, 0.4)
    };
    
    // Normalize elemental properties after modification
    const sum = Object.values(standardized.elementalProperties).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      Object.keys(standardized.elementalProperties).forEach(key => {
        standardized.elementalProperties[key as keyof ElementalProperties] /= sum;
      });
    }
  }
  
  // Ensure astrologicalProfile exists with required properties
  if (!standardized.astrologicalProfile) {
    // Default astrological profile with stronger Earth affinity for vegetables
    standardized.astrologicalProfile = {
      elementalAffinity: { 
        base: standardized.category?.toLowerCase().includes('vegetable') ? 'Earth' : 'Earth'
      },
      rulingPlanets: standardized.category?.toLowerCase().includes('vegetable') ? 
                     ['Moon', 'Venus'] : ['Mercury']
    };
  }
  
  // Ensure favorableZodiac exists
  if (!standardized.astrologicalProfile.favorableZodiac) {
    // Default zodiac signs based on category
    if (standardized.category?.toLowerCase().includes('vegetable')) {
      standardized.astrologicalProfile.favorableZodiac = ['taurus', 'virgo', 'capricorn'];
    } else {
      standardized.astrologicalProfile.favorableZodiac = ['aries'];
    }
  }
  
  // Ensure elementalAffinity is in object format
  if (typeof standardized.astrologicalProfile.elementalAffinity === 'string') {
    standardized.astrologicalProfile.elementalAffinity = {
      base: standardized.astrologicalProfile.elementalAffinity
    };
  }
  
  // Ensure rulingPlanets is an array
  if (!Array.isArray(standardized.astrologicalProfile.rulingPlanets)) {
    standardized.astrologicalProfile.rulingPlanets = [];
  }
  
  // If rulingPlanets is empty, add default planets
  if (standardized.astrologicalProfile.rulingPlanets.length === 0) {
    if (standardized.category?.toLowerCase().includes('vegetable')) {
      standardized.astrologicalProfile.rulingPlanets = ['Moon', 'Venus'];
    } else {
      standardized.astrologicalProfile.rulingPlanets = ['Mercury'];
    }
  }
  
  return standardized;
}

/**
 * Get ingredient recommendations based on astrological state
 */
export const getRecommendedIngredients = (astroState: AstrologicalState): EnhancedIngredient[] => {
  const ingredients = getAllIngredients();
  
  if (!astroState) {
    console.warn('Astrological state not provided for recommendations');
    return [];
  }
  
  // Filter and score ingredients - ensure all vegetables pass through
  const scoredIngredients = ingredients
    .map(ingredient => {
      // Apply standardization to ensure all required properties exist
      const standardized = standardizeIngredient(ingredient);
      
      // Calculate base score
      const profile = standardized.astrologicalProfile;
      const baseElement = profile.elementalAffinity.base as keyof ElementalProperties;
      
      // Calculate element score (0-1)
      const elementScore = standardized.elementalProperties[baseElement];
      
      // Calculate planet score (0-1) - case-insensitive planet matching
      const planetScore = profile.rulingPlanets.filter((p: string) => 
        astroState.activePlanets?.some(active => 
          active.toLowerCase() === p.toLowerCase()
        )
      ).length / Math.max(1, profile.rulingPlanets.length);
      
      // Calculate zodiac score if zodiac data is available (case-insensitive matching)
      let zodiacScore = 0;
      if (profile.favorableZodiac && astroState.currentZodiac) {
        zodiacScore = profile.favorableZodiac.some(sign => 
          sign.toLowerCase() === astroState.currentZodiac?.toLowerCase()
        ) ? 1 : 0;
      }
      
      // Calculate additional scores based on time, lunar phase, etc.
      const currentHour = new Date().getHours();
      const timeOfDayScore = (currentHour >= 6 && currentHour <= 18) ? 
        (standardized.elementalProperties.Fire * 0.5 + standardized.elementalProperties.Air * 0.5) : 
        (standardized.elementalProperties.Water * 0.5 + standardized.elementalProperties.Earth * 0.5);
      
      // Apply lunar phase influences with more specific matching
      let lunarScore = 0.5; // Default neutral score
      const phase = (astroState.lunarPhase || astroState.moonPhase || '').toLowerCase();
      
      // Check for specific lunar phase modifiers in the ingredient data
      if (standardized.lunarPhaseModifiers) {
        let matchingPhase = '';
        
        if (phase.includes('full')) matchingPhase = 'fullMoon';
        else if (phase.includes('new')) matchingPhase = 'newMoon';
        else if (phase.includes('waxing') && phase.includes('crescent')) matchingPhase = 'waxingCrescent';
        else if (phase.includes('waxing') && phase.includes('gibbous')) matchingPhase = 'waxingGibbous';
        else if (phase.includes('waning') && phase.includes('crescent')) matchingPhase = 'waningCrescent';
        else if (phase.includes('waning') && phase.includes('gibbous')) matchingPhase = 'waningGibbous';
        else if (phase.includes('first')) matchingPhase = 'firstQuarter';
        else if (phase.includes('last') || phase.includes('third')) matchingPhase = 'lastQuarter';
        
        if (matchingPhase && standardized.lunarPhaseModifiers[matchingPhase]) {
          const modifier = standardized.lunarPhaseModifiers[matchingPhase];
          
          // Apply potency multiplier if available
          if (modifier.potencyMultiplier) {
            lunarScore = Math.min(1, modifier.potencyMultiplier);
          } else {
            // Otherwise use a high score for matching phase
            lunarScore = 0.9;
          }
          
          // Adjust element scores based on lunar phase elemental boosts
          if (modifier.elementalBoost) {
            const boosts = modifier.elementalBoost as Partial<ElementalProperties>;
            Object.entries(boosts).forEach(([element, boost]) => {
              if (standardized.elementalProperties[element as keyof ElementalProperties] > 0.3) {
                lunarScore += (boost as number) * 0.1; // Small additional boost
              }
            });
            
            // Cap at 1.0
            lunarScore = Math.min(1, lunarScore);
          }
        }
      } else {
        // Use default lunar phase logic if no specific modifiers exist
        if (phase.includes('full') && standardized.elementalProperties.Water > 0.4) {
          lunarScore = 0.8;
        } 
        else if (phase.includes('new') && standardized.elementalProperties.Fire > 0.4) {
          lunarScore = 0.8;
        }
        else if (phase.includes('waxing') && standardized.elementalProperties.Air > 0.4) {
          lunarScore = 0.7;
        }
        else if (phase.includes('waning') && standardized.elementalProperties.Earth > 0.4) {
          lunarScore = 0.7;
        }
      }
      
      // Apply seasonal modifiers if available
      const currentSeason = getCurrentSeason();
      let seasonalScore = 0.5; // Default
      
      if (standardized.seasonalAdjustments && standardized.seasonalAdjustments[currentSeason]) {
        // Use the specific seasonal adjustments if available
        const adjustment = standardized.seasonalAdjustments[currentSeason];
        seasonalScore = adjustment.score || 0.8;
      } else if (standardized.season && standardized.season.includes(currentSeason)) {
        seasonalScore = 0.9;
      } else if (standardized.isInSeason) {
        seasonalScore = 0.8;
      }
      
      // Calculate aspect score if aspects are available
      let aspectScore = 0.5; // Default neutral score
      if (astroState.aspects && astroState.aspects.length > 0) {
        // Check for specific aspect enhancers in the ingredient data
        if (profile.aspectEnhancers && profile.aspectEnhancers.length > 0) {
          const relevantAspects = astroState.aspects.filter(aspect => {
            // Check if this aspect type is specifically listed as an enhancer
            return profile.aspectEnhancers?.includes(aspect.type);
          });
          
          if (relevantAspects.length > 0) {
            aspectScore = 0.9; // Strong boost for specifically favorable aspects
          }
        } else if (profile.rulingPlanets && profile.rulingPlanets.length > 0) {
          // Use default aspect logic - find aspects involving the ingredient's ruling planets
          const relevantAspects = astroState.aspects.filter(aspect => {
            return profile.rulingPlanets.some(planet => {
              const planetLower = planet.toLowerCase();
              return aspect.planet1.toLowerCase() === planetLower || 
                     aspect.planet2.toLowerCase() === planetLower;
            });
          });
          
          if (relevantAspects.length > 0) {
            // Calculate average aspect strength considering aspect type
            let totalStrength = 0;
            
            relevantAspects.forEach(aspect => {
              let multiplier = 1.0;
              
              // Beneficial aspects enhance score
              if (aspect.type === 'trine' || aspect.type === 'sextile' || aspect.type === 'conjunction') {
                multiplier = 1.2;
              } 
              // Challenging aspects reduce score
              else if (aspect.type === 'square' || aspect.type === 'opposition') {
                multiplier = 0.8;
              }
              
              totalStrength += (aspect.strength || 0.5) * multiplier;
            });
            
            aspectScore = totalStrength / relevantAspects.length;
          }
        }
      }
      
      // Check for tarot influences if available
      let tarotScore = 0.5; // Default neutral score
      
      if (astroState.tarotElementBoosts && Object.keys(astroState.tarotElementBoosts).length > 0) {
        // Get the dominant element in the ingredient
        const dominantElement = Object.entries(standardized.elementalProperties)
          .sort(([, a], [, b]) => b - a)[0][0];
        
        // Check if this element is boosted by tarot
        if (astroState.tarotElementBoosts[dominantElement as keyof ElementalProperties]) {
          tarotScore = Math.min(1, 0.5 + astroState.tarotElementBoosts[dominantElement as keyof ElementalProperties]);
        }
      }
      
      // Check if any of ingredient's ruling planets are boosted by tarot
      if (astroState.tarotPlanetaryBoosts && 
          Object.keys(astroState.tarotPlanetaryBoosts).length > 0 && 
          profile.rulingPlanets && 
          profile.rulingPlanets.length > 0) {
            
        profile.rulingPlanets.forEach(planet => {
          if (astroState.tarotPlanetaryBoosts && 
              astroState.tarotPlanetaryBoosts[planet.toLowerCase() as Planet]) {
            tarotScore = Math.max(tarotScore, 
              Math.min(1, 0.6 + astroState.tarotPlanetaryBoosts[planet.toLowerCase() as Planet]));
          }
        });
      }
      
      // Calculate sensory profile match score if available
      let sensoryScore = 0.5; // Default neutral score
      
      // This would require user preferences to be passed in as part of astroState
      // For now, we'll use a placeholder and assume balanced preferences
      if (standardized.sensoryProfile) {
        const sensory = standardized.sensoryProfile;
        
        // Calculate average scores across taste dimensions
        // For future enhancement: weight these based on user preferences
        if (sensory.taste) {
          const avgTaste = Object.values(sensory.taste).reduce((a, b) => a + b, 0) / 
                        Object.values(sensory.taste).length;
          sensoryScore = (sensoryScore + avgTaste) / 2;
        }
        
        // Factor in aromatic qualities
        if (sensory.aroma) {
          const avgAroma = Object.values(sensory.aroma).reduce((a, b) => a + b, 0) / 
                        Object.values(sensory.aroma).length;
          sensoryScore = (sensoryScore + avgAroma) / 2;
        }
        
        // Texture is less significant but still a factor
        if (sensory.texture) {
          const avgTexture = Object.values(sensory.texture).reduce((a, b) => a + b, 0) / 
                           Object.values(sensory.texture).length;
          sensoryScore = (sensoryScore * 0.7) + (avgTexture * 0.3);
        }
      }
      
      // NEW: Calculate nutritional score based on ingredient nutritional properties
      let nutritionalScore = 0.5; // Default neutral score
      if (standardized.nutritionalProfile) {
        const nutrition = standardized.nutritionalProfile;
        
        // Calculate protein density (protein per calorie)
        const proteinDensity = nutrition.calories > 0 && nutrition?.macros ? 
          (nutrition.macros.protein / nutrition.calories) : 0;
          
        // Calculate fiber density (fiber per calorie)
        const fiberDensity = nutrition.calories > 0 && nutrition?.macros ? 
          (nutrition.macros.fiber / nutrition.calories) : 0;
          
        // Calculate vitamin/mineral richness
        const vitaminCount = Object.keys(nutrition.vitamins || {}).length;
        const mineralCount = Object.keys(nutrition.minerals || {}).length;
        const micronutrientScore = (vitaminCount + mineralCount) / 20; // Normalized to ~0-1 range
        
        // Calculate phytonutrient score
        const phytonutrientScore = Object.keys(nutrition.phytonutrients || {}).length / 10; // Normalized to ~0-1 range
        
        // Calculate macronutrient balance based on ratios rather than absolute values
        const totalMacros = nutrition?.macros ? (
          nutrition.macros.protein + nutrition.macros.carbs + nutrition.macros.fat
        ) : 0;
        let macroBalanceScore = 0.5;
        
        if (totalMacros > 0 && nutrition?.macros) {
          const proteinRatio = nutrition.macros.protein / totalMacros;
          const carbsRatio = nutrition.macros.carbs / totalMacros;
          const fatRatio = nutrition.macros.fat / totalMacros;
          
          // Define ideal targets for ratios (these can be adjusted)
          const idealProtein = 0.25; // 25%
          const idealCarbs = 0.5;    // 50% 
          const idealFat = 0.25;     // 25%
          
          // Calculate deviation from ideal ratios
          const proteinDeviation = Math.abs(proteinRatio - idealProtein);
          const carbsDeviation = Math.abs(carbsRatio - idealCarbs);
          const fatDeviation = Math.abs(fatRatio - idealFat);
          
          // Lower deviation = better balance
          const totalDeviation = proteinDeviation + carbsDeviation + fatDeviation;
          macroBalanceScore = 1 - Math.min(1, totalDeviation / 2);
        }
        
        // Combine all nutritional factors
        nutritionalScore = (
          proteinDensity * 0.3 + 
          fiberDensity * 0.2 + 
          micronutrientScore * 0.2 + 
          phytonutrientScore * 0.1 + 
          macroBalanceScore * 0.2
        );
        
        // Normalize to 0-1 range
        nutritionalScore = Math.min(1, Math.max(0, nutritionalScore));
      }
      
      // Combine scores with weights, now including more factors
      const totalScore = (
        elementScore * 0.15 + 
        planetScore * 0.15 + 
        zodiacScore * 0.12 + 
        timeOfDayScore * 0.05 + 
        seasonalScore * 0.12 +
        lunarScore * 0.10 +
        aspectScore * 0.08 +
        tarotScore * 0.08 +
        sensoryScore * 0.05 +
        nutritionalScore * 0.10  
      );
      
      return {
        ...standardized,
        score: totalScore,
        // Add score breakdowns for UI display
        scoreDetails: {
          elementScore,
          planetScore,
          zodiacScore,
          timeOfDayScore,
          seasonalScore,
          lunarScore,
          aspectScore,
          tarotScore,
          sensoryScore,
          nutritionalScore
        }
      };
    });
  
  // Sort all ingredients by score first
  const allScoredIngredients = scoredIngredients.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Group by category
  const categoryGroups: Record<string, EnhancedIngredient[]> = {};
  
  // Define the categories we want to ensure have enough items
  const targetCategories = ['proteins', 'vegetables', 'grains', 'other'];
  
  // Initialize category groups
  targetCategories.forEach(category => {
    categoryGroups[category] = [];
  });
  
  // Group ingredients by category
  allScoredIngredients.forEach(ingredient => {
    const category = ingredient.category?.toLowerCase() || 'other';
    
    // Map to our target categories if needed
    let targetCategory = 'other';
    if (category.includes('protein') || 
        category.includes('meat') || 
        category.includes('seafood') || 
        category.includes('poultry') || 
        category.includes('dairy') || 
        category.includes('egg')) {
      targetCategory = 'proteins';
    } 
    else if (category.includes('vegetable') || 
             category.includes('leafy') || 
             category.includes('root') || 
             category.includes('allium') || 
             category.includes('cruciferous') || 
             category.includes('squash') || 
             category.includes('nightshade') ||
             // Check for specific vegetable names and types
             (ingredient.subCategory && 
              (ingredient.subCategory.toLowerCase().includes('vegetable') ||
               ingredient.subCategory.toLowerCase().includes('leafy green') ||
               ingredient.subCategory.toLowerCase().includes('root vegetable') ||
               ingredient.subCategory.toLowerCase().includes('cruciferous'))) ||
             // Include known vegetables that might be mis-categorized
             (['kale', 'spinach', 'broccoli', 'cauliflower', 'carrot', 'beet', 
               'turnip', 'bell pepper', 'eggplant', 'tomato', 'garlic', 'onion', 
               'leek', 'pumpkin', 'zucchini', 'acorn squash', 'brussels sprouts', 
               'swiss chard', 'sweet potato', 'parsnip', 'radish', 'potato'
             ].includes(ingredient.name.toLowerCase()))) {
      targetCategory = 'vegetables';
    }
    else if (category.includes('grain') || 
             category.includes('rice') || 
             category.includes('wheat') || 
             category.includes('pasta') || 
             category.includes('cereal')) {
      targetCategory = 'grains';
    }
    
    // Add to category group
    if (targetCategories.includes(targetCategory)) {
      if (!categoryGroups[targetCategory]) {
        categoryGroups[targetCategory] = [];
      }
      
      // Don't add duplicates
      if (!categoryGroups[targetCategory].some(item => item.name === ingredient.name)) {
        categoryGroups[targetCategory].push(ingredient);
      }
    }
  });
  
  // Ensure each category has at least 5 items
  const minItemsPerCategory = 8; // Increased from 5 to get more variety
  targetCategories.forEach(category => {
    // If we don't have enough items in this category, look for items with similar properties
    if (categoryGroups[category]?.length < minItemsPerCategory) {
      // Need to find additional items for this category
      const missingCount = minItemsPerCategory - (categoryGroups[category]?.length || 0);
      
      // For vegetables, make a special effort to include all possible vegetables
      if (category === 'vegetables') {
        // First, check if we have all the known vegetables in our list
        const knownVegetables = [
          'kale', 'spinach', 'broccoli', 'cauliflower', 'carrot', 'beet', 
          'turnip', 'bell pepper', 'eggplant', 'tomato', 'garlic', 'onion', 
          'leek', 'pumpkin', 'zucchini', 'acorn squash', 'brussels sprouts', 
          'swiss chard', 'sweet potato', 'parsnip', 'radish', 'potato'
        ];
        
        // Filter out vegetables we already have
        const missingVegetables = knownVegetables.filter(vegName => 
          !categoryGroups[category]?.some(item => 
            item.name.toLowerCase() === vegName.toLowerCase() ||
            item.name.toLowerCase().includes(vegName.toLowerCase())
          )
        );
        
        // Find these missing vegetables in our ingredients
        const missingVegetableItems = allScoredIngredients.filter(ingredient => 
          missingVegetables.some(vegName => 
            ingredient.name.toLowerCase() === vegName.toLowerCase() ||
            ingredient.name.toLowerCase().includes(vegName.toLowerCase())
          ) &&
          !categoryGroups[category]?.some(item => item.name === ingredient.name)
        );
        
        // Add these items to the category
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(...missingVegetableItems);
      }
      
      // Find additional ingredients from the full list that would fit this category
      const additionalItems = allScoredIngredients.filter(ingredient => {
        // Skip if already in this category
        if (categoryGroups[category]?.some(item => item.name === ingredient.name)) {
          return false;
        }
        
        // For vegetables: check for plant-based items with high nutritional profile
        if (category === 'vegetables' && 
            (ingredient.elementalProperties?.Earth > 0.3 || 
             ingredient.nutritionalProfile?.macros?.fiber > 2)) {
          return true;
        }
        
        // For proteins: check for high protein content
        if (category === 'proteins' && 
            ingredient.nutritionalProfile?.macros?.protein > 5) {
          return true;
        }
        
        // For grains: check for carb-rich items
        if (category === 'grains' && 
            ingredient.nutritionalProfile?.macros?.carbs > 15) {
          return true;
        }
        
        return false;
      }).slice(0, missingCount);
      
      // Add these items to the category
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(...additionalItems);
    }
  });
  
  // First, take top items from each specified category (or all if less than minimum)
  const resultIngredients: EnhancedIngredient[] = [];
  targetCategories.forEach(category => {
    const categoryItems = categoryGroups[category] || [];
    resultIngredients.push(...categoryItems.slice(0, Math.max(minItemsPerCategory, categoryItems.length)));
  });
  
  // Return the results sorted by score
  return resultIngredients.sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Get top ingredient matches based on elemental properties and other factors
 */
export const getTopIngredientMatches = (
  astroState: AstrologicalState,
  limit: number = 5
): EnhancedIngredient[] => {
  // Simply use our main recommendation function but with the requested limit
  return getRecommendedIngredients(astroState).slice(0, limit);
};

/**
 * Helper function to format factor names for display
 */
export const formatFactorName = (factor: string): string => {
  return factor
    .replace('Score', '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

// Ensure you don't need to check the type anymore when using elementalAffinity
function getElementalAffinity(ingredient: EnhancedIngredient): string {
  // Now can directly access .base without type checking
  return ingredient.astrologicalProfile.elementalAffinity.base;
} 