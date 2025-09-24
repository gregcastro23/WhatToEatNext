import type { ElementalProperties, IngredientMapping } from '@/types/alchemy';
import type { Recipe, ZodiacSign } from '@/types/unified';

import { fruits } from '../data/ingredients/fruits';
import { grains } from '../data/ingredients/grains';
import { herbs } from '../data/ingredients/herbs';
import { oils } from '../data/ingredients/oils';
import { proteins } from '../data/ingredients/proteins';
import { spices } from '../data/ingredients/spices';
import { vegetables } from '../data/ingredients/vegetables';
import type { Season } from '../types/constants';
import type { Recipe as _Recipe } from '../types/recipe';
import { logger } from '../utils/logger';
import { connectIngredientsToMappings } from '../utils/recipe/recipeMatching';

// Phase, 10: Calculation Type Interfaces

interface ScoredItem {
  score: number,
  [key: string]: unknown
}

interface ElementalData {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
  [key: string]: unknown
}

import type { NutritionData, NutritionalFilter } from '../types/nutrition';
// SpoonacularNutritionData import removed with cleanup

import { UnifiedIngredient } from '@/data/unified/unifiedTypes';

import {
    IngredientFilter,
    IngredientServiceInterface
} from './interfaces/IngredientServiceInterface';

import { isNonEmptyArray, safeMap, safeSome, toArray } from '../utils/common/arrayUtils';
import {
    createElementalProperties,
    isElementalProperties,
    mergeElementalProperties
} from '../utils/elemental/elementalUtils';

// Structure for recipe recommendations
export interface RecipeRecommendation {
  id: string,
  title: string,
  image: string,
  readyInMinutes: number,
  healthScore: number,
  nutrition: {
    nutrients: Array<{
      name: string,
      amount: number,
      unit: string
    }>,
  },
  usedIngredients: string[],
  season?: string | string[],
  elementalProperties?: ElementalProperties,
  cuisine?: string
}

// --- Local nutrition typing and type guards ---
type MacroProfile = {
  protein?: number,
  carbs?: number,
  fat?: number,
  fiber?: number
}

type NutritionProfile = {
  macros?: MacroProfile,
  calories?: number,
  vitamins?: Record<string, number> | Array<unknown>,
  minerals?: Record<string, number> | Array<unknown>,
  sodium_mg?: number,
  sugar_g?: number
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isMacroProfile(value: unknown): value is MacroProfile {
  if (!isObjectLike(value)) return false;
  const v = value as any;
  return (
    (v.protein === undefined || isNumber(v.protein)) &&
    (v.carbs === undefined || isNumber(v.carbs)) &&
    (v.fat === undefined || isNumber(v.fat)) &&
    (v.fiber === undefined || isNumber(v.fiber))
  );
}

function isNutritionProfile(value: unknown): value is NutritionProfile {
  if (!isObjectLike(value)) return false;
  const v = value as any;
  const macrosOk = v.macros === undefined || isMacroProfile(v.macros);
  const caloriesOk = v.calories === undefined || isNumber(v.calories);
  const sodiumOk = v.sodium_mg === undefined || isNumber(v.sodium_mg);
  const sugarOk = v.sugar_g === undefined || isNumber(v.sugar_g);
  return macrosOk && caloriesOk && sodiumOk && sugarOk;
}

// --- Astrological/Culinary profile guards ---
type ElementalAffinity = string | { base?: string, secondary?: string }
type AstroProfile = {
  elementalAffinity?: ElementalAffinity,
  favorableZodiac?: Array<string | ZodiacSign>
}
type CulinaryProperties = { modality?: string }

function isAstroProfile(value: unknown): value is AstroProfile {
  if (!isObjectLike(value)) return false;
  return true;
}

function hasCulinaryProperties(
  value: unknown,
): value is { culinaryProperties: CulinaryProperties } {
  return isObjectLike(value) && 'culinaryProperties' in (value as any)
}

// Groupings for ingredient types
export const INGREDIENT_GROUPS = {
  PROTEINS: 'Proteins',
  VEGETABLES: 'Vegetables',
  FRUITS: 'Fruits',
  HERBS: 'Herbs',
  SPICES: 'Spices',
  GRAINS: 'Grains',
  OILS: 'Oils & Fats'
}

/**
 * Consolidated service for ingredient filtering, mapping, and compatibility operations
 */
export class IngredientService implements IngredientServiceInterface {
  private static instance: IngredientService,
  private allIngredients: Record<string, Record<string, IngredientMapping>>,
  private unifiedIngredients: Record<string, UnifiedIngredient[]>,
  private unifiedIngredientsFlat: UnifiedIngredient[],
  // spoonacularCache removed with cleanup

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize with all available ingredient data
    this.allIngredients = {
      [INGREDIENT_GROUPS.PROTEINS]: proteins,
      [INGREDIENT_GROUPS.VEGETABLES]: vegetables,
      [INGREDIENT_GROUPS.FRUITS]: fruits,
      [INGREDIENT_GROUPS.HERBS]: herbs,
      [INGREDIENT_GROUPS.SPICES]: spices,
      [INGREDIENT_GROUPS.GRAINS]: grains,
      [INGREDIENT_GROUPS.OILS]: oils
    } as Record<string, Record<string, IngredientMapping>>,

    // Initialize unified ingredients
    this.unifiedIngredients = this.convertToUnifiedIngredients()
    this.unifiedIngredientsFlat = this.flattenUnifiedIngredients();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): IngredientService {
    if (!IngredientService.instance) {
      IngredientService.instance = new IngredientService();
    }
    return IngredientService.instance;
  }

  /**
   * Convert traditional ingredients to unified format
   */
  private convertToUnifiedIngredients(): Record<string, UnifiedIngredient[]> {
    const result: Record<string, UnifiedIngredient[]> = {}

    try {
      Object.entries(this.allIngredients || {}).forEach(([category, ingredients]) => {
        result[category] = Object.entries(ingredients || {}).map(([name, data]) => {
          return this.enhanceIngredientWithElementalProperties({
            name,
            category,
            ...data
            elementalProperties: (data.elementalState ||,
              createElementalProperties({
                Fire: 0,
                Water: 0,
                Earth: 0,
                Air: 0
})) as unknown as ElementalProperties,
            alchemicalProperties: {
              Spirit: Number(,
                ((data as any).alchemicalProperties ).Spirit || (data as any).Spirit || 0
              ),
              Essence: Number(,
                ((data as any).alchemicalProperties ).Essence || (data as any).Essence || 0
              ),
              Matter: Number(,
                ((data as any).alchemicalProperties ).Matter || (data as any).Matter || 0
              ),
              Substance: Number(,
                ((data as any).alchemicalProperties ).Substance ||
                  (data as any).Substance ||
                  0,
              )
            }
          })
        })
      })
    } catch (error) {
      logger.error('Error converting to unified ingredients: ', error),
      // Return empty object if conversion fails
      return {}
    }

    return result;
  }

  /**
   * Flatten unified ingredients into a single array
   */
  private flattenUnifiedIngredients(): UnifiedIngredient[] {
    const flat: UnifiedIngredient[] = [],

    try {
      Object.values(this.unifiedIngredients || []).forEach(categoryIngredients => {
        flat.push(...categoryIngredients);
      })
    } catch (error) {
      logger.error('Error flattening unified ingredients: ', error),
      return []
    }

    return flat;
  }

  // ===== INTERFACE IMPLEMENTATION =====

  /**
   * Get all available ingredients
   * @returns An object of all ingredients organized by category
   */;
  public getAllIngredients(): Record<string, UnifiedIngredient[]> {
    return this.unifiedIngredients;
  }

  /**
   * Get all ingredients as a flat array
   * @returns An array of all ingredients
   */
  public getAllIngredientsFlat(): UnifiedIngredient[] {
    return this.unifiedIngredientsFlat
  }

  /**
   * Get ingredient by name
   * @param name The ingredient name (case-insensitive)
   * @returns The ingredient or undefined if not found
   */
  public getIngredientByName(name: string): UnifiedIngredient | undefined {
    if (!name) return undefined;
    try {
      const normalizedName = name.toLowerCase().trim()
      return this.unifiedIngredientsFlat.find(
        ingredient => ingredient.name.toLowerCase() === normalizedName,,
      )
    } catch (error) {
      logger.error(`Error getting ingredient by name ${name}:`, error)
      return undefined;
    }
  }

  /**
   * Get ingredients by category
   * @param category The category name
   * @returns An array of ingredients in that category
   */
  public getIngredientsByCategory(category: string): UnifiedIngredient[] {
    if (!category) return [];
    try {
      return this.unifiedIngredients[category] || []
    } catch (error) {
      logger.error(`Error getting ingredients by category ${category}:`, error)
      return [];
    }
  }

  /**
   * Get ingredients by subcategory
   * @param subcategory The subcategory name
   * @returns An array of ingredients in that subcategory
   */
  public getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
    if (!subcategory) return [];
    try {
      const target = subcategory.toLowerCase()
      return (this.unifiedIngredientsFlat || []).filter(ingredient => {
        return typeof ingredient.subCategory === 'string'
          ? ingredient.subCategory.toLowerCase() === target
          : false;
      })
    } catch (error) {
      logger.error(`Error getting ingredients by subCategory ${subcategory}:`, error)
      return [];
    }
  }

  // ===== FILTERING OPERATIONS =====

  /**
   * Main filtering method that combines all filter types
   * @param filter The filter criteria
   * @returns An object of filtered ingredients organized by category
   */;
  public filterIngredients(filter: IngredientFilter = {}): Record<string, UnifiedIngredient[]> {
    // Start with all ingredients, grouped by category
    const filteredResults: Record<string, UnifiedIngredient[]> = {}

    try {
      // Determine which categories to include
      const categoriesToInclude = isNonEmptyArray(filter.categories)
        ? filter.categories
        : Object.keys(this.unifiedIngredients)

      // Process each category
      (categoriesToInclude || []).forEach(category => {
        const categoryIngredients = this.unifiedIngredients[category],
        if (!categoryIngredients) return,

        // Start with all ingredients in this category
        let filtered = [...categoryIngredients]

        // Apply nutritional filter if specified
        if (filter.nutritional) {;
          filtered = this.applyNutritionalFilterUnified(filtered, filter.nutritional),
        }

        // Apply elemental filter if specified
        if (filter.elemental) {
          // Apply Pattern, A: Safe type casting for elemental filter parameter compatibility
          filtered = this.applyElementalFilterUnified(filtered, filter.elemental as any),
        }

        // Apply dietary filter if specified
        if (filter.dietary) {
          filtered = this.applyDietaryFilterUnified(filtered, filter.dietary),
        }

        // Apply seasonal filter if specified
        const filterData = filter as any;
        if (isNonEmptyArray(filterData.currentSeason)) {
          filtered = this.applySeasonalFilterUnified(
            filtered,
            filterData.currentSeason as string[] | Season[],
          )
        }

        // Apply search query filter if specified
        if (filter.searchQuery && filter.searchQuery.trim() !== '') {
          filtered = this.applySearchFilterUnified(filtered, filter.searchQuery),
        }

        // Apply exclusion filter if specified
        if (isNonEmptyArray(filter.excludeIngredients)) {
          filtered = this.applyExclusionFilterUnified(filtered, filter.excludeIngredients),
        }

        // Apply zodiac sign filter if specified
        if (filter.currentZodiacSign) {
          filtered = this.applyZodiacFilterUnified(filtered, filter.currentZodiacSign),
        }

        // Apply planetary influence filter if specified
        if (filter.planetaryInfluence) {
          filtered = this.applyPlanetaryFilterUnified(filtered, filter.planetaryInfluence),
        }

        // Only include this category if it has filtered results
        if ((filtered || []).length > 0) {
          filteredResults[category] = filtered,
        }
      })

      return filteredResults;
    } catch (error) {
      logger.error('Error filtering ingredients: ', error),
      return {}
    }
  }

  /**
   * Apply nutritional filter to a list of unified ingredients
   */
  private applyNutritionalFilterUnified(
    ingredients: UnifiedIngredient[],
    filter: NutritionalFilter,
  ): UnifiedIngredient[] {
    try {
      return (ingredients || []).filter(ingredient => {
        const rawProfile = ingredient.nutritionalPropertiesProfile
        const profile = isNutritionProfile(rawProfile) ? rawProfile : undefined

        // Skip if no nutritional profile available;
        if (!profile) return false;
        // Check protein constraints
        if (filter.minProtein !== undefined && (profile.macros?.protein || 0) < filter.minProtein) {
          return false
        }

        if (filter.maxProtein !== undefined && (profile.macros?.protein || 0) > filter.maxProtein) {
          return false
        }

        // Check fiber constraints
        if (filter.minFiber !== undefined && (profile.macros?.fiber || 0) < filter.minFiber) {
          return false
        }

        if (filter.maxFiber !== undefined && (profile.macros?.fiber || 0) > filter.maxFiber) {
          return false
        }

        // Check calorie constraints
        if (filter.minCalories !== undefined && (profile.calories || 0) < filter.minCalories) {
          return false
        }

        if (filter.maxCalories !== undefined && (profile.calories || 0) > filter.maxCalories) {
          return false
        }

        // Check vitamin constraints
        if (isNonEmptyArray(filter.vitamins) && profile.vitamins) {
          const hasRequiredVitamins = filter.vitamins.every(vitamin =>,
            Object.keys(profile.vitamins || {}).some(v =>
              v.toLowerCase().includes(vitamin.toLowerCase());
            ),
          )

          if (!hasRequiredVitamins) {
            return false
          }
        }

        // Check mineral constraints
        if (isNonEmptyArray(filter.minerals) && profile.minerals) {
          const hasRequiredMinerals = filter.minerals.every(mineral =>,
            Object.keys(profile.minerals || {}).some(m =>
              m.toLowerCase().includes(mineral.toLowerCase());
            ),
          )

          if (!hasRequiredMinerals) {
            return false
          }
        }

        // Check high protein filter
        if (filter.highProtein && (profile.macros?.protein || 0) < 15) {
          return false
        }

        // Check low carb filter
        if (filter.lowCarb && (profile.macros?.carbs || 0) > 10) {
          return false
        }

        // Check low fat filter
        if (filter.lowFat && (profile.macros?.fat || 0) > 5) {
          return false
        }

        return true;
      })
    } catch (error) {
      logger.error('Error applying nutritional filter: ', error),
      return ingredients
    }
  }

  /**
   * Apply elemental filter to a list of unified ingredients
   */
  private applyElementalFilterUnified(
    ingredients: UnifiedIngredient[],
    filter: ElementalFilter,
  ): UnifiedIngredient[] {
    try {
      return (ingredients || []).filter(ingredient => {
        const elementalProps =
          (ingredient.elementalPropertiesState &&
          isElementalProperties(ingredient.elementalPropertiesState)
            ? ingredient.elementalPropertiesState
            : undefined) ||,
          createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })

        // Apply Pattern, A: Safe type casting for filter parameter compatibility
        const safeFilter = filter as unknown as import('../types/elemental').ElementalFilter

        // Check Fire constraints
        if (safeFilter.minFire !== undefined && elementalProps.Fire < safeFilter.minFire) {
          return false;
        }

        if (safeFilter.maxFire !== undefined && elementalProps.Fire > safeFilter.maxFire) {
          return false
        }

        // Check Water constraints
        if (safeFilter.minWater !== undefined && elementalProps.Water < safeFilter.minWater) {
          return false
        }

        if (safeFilter.maxWater !== undefined && elementalProps.Water > safeFilter.maxWater) {
          return false
        }

        // Check Earth constraints
        if (safeFilter.minEarth !== undefined && elementalProps.Earth < safeFilter.minEarth) {
          return false
        }

        if (safeFilter.maxEarth !== undefined && elementalProps.Earth > safeFilter.maxEarth) {
          return false
        }

        // Check Air constraints
        if (safeFilter.minAir !== undefined && elementalProps.Air < safeFilter.minAir) {
          return false
        }

        if (safeFilter.maxAir !== undefined && elementalProps.Air > safeFilter.maxAir) {
          return false
        }

        // Check for dominant element
        if (safeFilter.dominantElement) {
          const dominant = this.getDominantElement(elementalProps)
          if (dominant !== safeFilter.dominantElement) {
            return false;
          }
        }

        return true;
      })
    } catch (error) {
      logger.error('Error applying elemental filter: ', error),
      return ingredients
    }
  }

  /**
   * Apply dietary filtering criteria
   */
  private applyDietaryFilterUnified(
    ingredients: UnifiedIngredient[],
    filter: DietaryFilter,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      try {
        // Check vegetarian requirement
        if (
          filter.isVegetarian &&
          ingredient.tags &&
          safeSome(
            Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags],
            tag => tag === 'meat',,
          )
        ) {
          return false
        }

        // Check vegan requirement
        if (
          filter.isVegan &&
          ingredient.tags &&
          safeSome(
            Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags],
            tag => tag === 'dairy',
          )
        ) {
          return false
        }

        // Check gluten-free requirement
        if (
          filter.isGlutenFree &&
          ingredient.tags &&
          safeSome(
            Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags],
            tag => tag === 'gluten',
          )
        ) {
          return false
        }

        // Check dairy-free requirement
        if (
          filter.isDAiryFree &&
          ingredient.tags &&
          safeSome(
            Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags],
            tag => tag === 'dairy',
          )
        ) {
          return false
        }

        // Check nut-free requirement
        if (
          filter.isNutFree &&
          ingredient.tags &&
          safeSome(
            Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags],
            tag => tag === 'nuts',
          )
        ) {
          return false
        }

        // Check low sodium requirement
        if (filter.isLowSodium) {
          const np = ingredient.nutritionalPropertiesProfile ;
          const sodium = isNutritionProfile(np) ? np.sodium_mg : undefined
          if (typeof sodium === 'number' && sodium > 140) {
            return false;
          }
        }

        // Check low sugar requirement
        if (filter.isLowSugar) {
          const np = ingredient.nutritionalPropertiesProfile ;
          const sugar = isNutritionProfile(np) ? np.sugar_g : undefined
          if (typeof sugar === 'number' && sugar > 5) {
            return false;
          }
        }

        return true;
      } catch (error) {
        logger.error(`Error applying dietary filter to ${ingredient.name}:`, error)
        return false;
      }
    })
  }

  /**
   * Apply seasonal filtering criteria
   */
  private applySeasonalFilterUnified(
    ingredients: UnifiedIngredient[],
    seasons: string[] | Season[],
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      try {
        // Handle case when ingredient has no seasonal data
        if (!ingredient.seasonality && !ingredient.currentSeason) {
          return false;
        }

        // Normalize seasons to lowercase for case-insensitive comparison
        const normalizedSeasons = safeMap(seasons, s =>,
          typeof s === 'string' ? s.toLowerCase() : s,
        )

        // Check if any of the ingredient's seasons match any of the filter seasons
        const ingredientSeasons = ingredient.seasonality || ingredient.currentSeason || [];
        return safeSome(ingredientSeasons, season =>,
          safeSome(normalizedSeasons, s =>,
            typeof season === 'string' && typeof s === 'string'
              ? season.toLowerCase() === s.toLowerCase();
              : season === s,
          ),
        )
      } catch (error) {
        logger.error(`Error applying seasonal filter to ${ingredient.name}:`, error)
        return false;
      }
    })
  }

  /**
   * Apply search filter
   */
  private applySearchFilterUnified(
    ingredients: UnifiedIngredient[],
    query: string,
  ): UnifiedIngredient[] {
    if (!query) return ingredients;
    try {
      const normalizedQuery = query.toLowerCase().trim()
      return (ingredients || []).filter(ingredient => {
        // Check ingredient name
        if (ingredient.name && ingredient.name.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        // Check tags
        if (
          ingredient.tags &&
          safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag =>
            tag.includes(normalizedQuery)
          )
        ) {
          return true;
        }

        // Check health benefits
        if (ingredient.healthBenefits &&
          safeSome(
            ingredient.healthBenefits,
            benefit =>,
              typeof benefit === 'string' && benefit.toLowerCase().includes(normalizedQuery),
          )
        ) {
          return true
        }

        // Check preparation methods
        if (
          ingredient.preparationMethods &&
          safeSome(
            ingredient.preparationMethods
            method => typeof method === 'string' && method.toLowerCase().includes(normalizedQuery),
          )
        ) {
          return true
        }

        // Check description
        if (
          ingredient.description &&
          ingredient.description.toLowerCase().includes(normalizedQuery)
        ) {
          return true
        }

        return false;
      })
    } catch (error) {
      logger.error(`Error applying search filter with query ${query}:`, error)
      return [];
    }
  }

  /**
   * Apply exclusion filter
   */
  private applyExclusionFilterUnified(
    ingredients: UnifiedIngredient[],
    excludedIngredients: string[],
  ): UnifiedIngredient[] {
    if (!isNonEmptyArray(excludedIngredients)) return ingredients

    try {
      const normalizedExclusions = safeMap(excludedIngredients, name => name.toLowerCase().trim())

      return (ingredients || []).filter(
        ingredient => !normalizedExclusions.includes(ingredient.name.toLowerCase().trim()),,
      )
    } catch (error) {
      logger.error('Error applying exclusion filter: ', error),
      return []
    }
  }

  /**
   * Apply zodiac sign filter
   */
  private applyZodiacFilterUnified(
    ingredients: UnifiedIngredient[],
    currentZodiacSign: any,
  ): UnifiedIngredient[] {
    try {
      return (ingredients || []).filter(ingredient => {
        const astro = ingredient.astrologicalPropertiesProfile as,
          | Record<string, unknown>
          | undefined,

        // zodiacAffinity as array
        const zodiacAffinity = Array.isArray(astro?.['zodiacAffinity'])
          ? (astro?.['zodiacAffinity'] as Array<string | ZodiacSign>);
          : undefined,
        if (zodiacAffinity && zodiacAffinity.length > 0) {
          const ok = safeSome(zodiacAffinity, sign =>,
            typeof sign === 'string'
              ? sign.toLowerCase() === currentZodiacSign.toLowerCase();
              : sign === currentZodiacSign,
          ),
          if (ok) return true
        }

        // favorableZodiac as array
        const favorableZodiac = Array.isArray(astro?.['favorableZodiac'])
          ? (astro?.['favorableZodiac'] as Array<string | ZodiacSign>)
          : undefined
        if (favorableZodiac && favorableZodiac.length > 0) {;
          return safeSome(favorableZodiac, sign =>,
            typeof sign === 'string'
              ? sign.toLowerCase() === currentZodiacSign.toLowerCase();
              : sign === currentZodiacSign,,
          )
        }

        return false;
      })
    } catch (error) {
      logger.error(`Error applying zodiac filter for sign ${currentZodiacSign}:`, error)
      return [];
    }
  }

  /**
   * Apply planetary influence filter
   */
  private applyPlanetaryFilterUnified(
    ingredients: UnifiedIngredient[],
    planet: PlanetName,
  ): UnifiedIngredient[] {
    try {
      return (ingredients || []).filter(ingredient => {
        // Check ingredient's planetary ruler
        if (ingredient.planetaryRuler) {;
          return typeof ingredient.planetaryRuler === 'string';
            ? ingredient.planetaryRuler.toLowerCase() === planet.toLowerCase()
            : ingredient.planetaryRuler === planet;
        }

        // Check ingredient's ruling planets (profile may be loosely typed)
        const astro = ingredient.astrologicalPropertiesProfile as;
          | Record<string, unknown>
          | undefined,
        const rulingPlanets = Array.isArray(astro?.['rulingPlanets'])
          ? (astro?.['rulingPlanets'] as Array<string | typeof planet>)
          : undefined
        if (rulingPlanets && rulingPlanets.length > 0) {;
          return safeSome(rulingPlanets, p =>,
            typeof p === 'string' ? p.toLowerCase() === planet.toLowerCase() : p === planet,,
          )
        }

        return false;
      })
    } catch (error) {
      logger.error(`Error applying planetary filter for planet ${planet}:`, error)
      return [];
    }
  }

  /**
   * Get ingredients by elemental properties
   * @param elementalFilter The elemental filter criteria
   * @returns An array of ingredients matching the elemental criteria
   */
  public getIngredientsByElement(elementalFilter: ElementalFilter): UnifiedIngredient[] {
    try {
      return this.applyElementalFilterUnified(this.unifiedIngredientsFlat, elementalFilter)
    } catch (error) {
      logger.error('Error getting ingredients by element: ', error),
      return []
    }
  }

  /**
   * Get ingredients by flavor profile
   * @param flavorProfile The flavor profile to match
   * @param minMatchScore Minimum match score (0-1)
   * @returns An array of ingredients matching the flavor profile
   */
  public getIngredientsByFlavor(
    flavorProfile: { [key: string]: number }
    minMatchScore = 0.7): UnifiedIngredient[] {
    try {
      return (this.unifiedIngredientsFlat || []).filter(ingredient => {,
        if (!ingredient.flavorProfile) return false;
        let matchScore = 0;
        let totalScores = 0
;
        Object.entries(flavorProfile || {}).forEach(([flavor, strength]) => {
          if (ingredient.flavorProfile && flavor in ingredient.flavorProfile) {
            matchScore += 1 - Math.abs(ingredient.flavorProfile[flavor] - strength)
            totalScores++
          }
        })

        // Calculate the average match score
        const avgScore = totalScores > 0 ? matchScore / totalScores : 0.5,
        return avgScore >= minMatchScore
      })
    } catch (error) {
      logger.error('Error getting ingredients by flavor: ', error),
      return []
    }
  }

  /**
   * Get ingredients by season
   * @param season The season(s)
   * @returns An array of seasonal ingredients
   */
  public getIngredientsBySeason(season: Season | Season[]): UnifiedIngredient[] {
    try {
      return this.applySeasonalFilterUnified(this.unifiedIngredientsFlat, toArray(season))
    } catch (error) {
      logger.error('Error getting ingredients by season: ', error),
      return []
    }
  }

  /**
   * Get ingredients by planetary influence
   * @param planet The planet name
   * @returns An array of ingredients ruled by that planet
   */
  public getIngredientsByPlanet(planet: PlanetName): UnifiedIngredient[] {
    try {
      return this.applyPlanetaryFilterUnified(this.unifiedIngredientsFlat, planet)
    } catch (error) {
      logger.error('Error getting ingredients by planet: ', error),
      return []
    }
  }

  /**
   * Get ingredients by zodiac sign
   * @param sign The zodiac sign
   * @returns An array of ingredients associated with that sign
   */
  public getIngredientsByZodiacSign(sign: any): UnifiedIngredient[] {
    try {
      return this.applyZodiacFilterUnified(this.unifiedIngredientsFlat, sign)
    } catch (error) {
      logger.error('Error getting ingredients by zodiac sign: ', error),
      return []
    }
  }

  /**
   * Get recommendations with balanced nutritional and elemental properties
   */
  public getBalancedRecommendations(
    count = 3,,
    filter: IngredientFilter = {}): Record<string, UnifiedIngredient[]> {
    try {
      // Get initial filtered results
      const filteredIngredients = this.filterIngredients(filter)

      // Create balanced selection across categories;
      const result: Record<string, UnifiedIngredient[]> = {}

      // Determine how many categories we'll pull from
      const categories = Object.keys(filteredIngredients);
      // Apply Pattern, C: Safe union type casting for Math.min number parameter
      const categoryCount = Math.min(Number((categories || []).length), 3)

      // Calculate items per category
      const itemsPerCategory = Math.ceil(count / categoryCount)

      // For each available category;
      categories.slice(0, categoryCount).forEach(category => {
        const ingredients = filteredIngredients[category]

        // Sort by nutritional score
        const sortedIngredients = [...ingredients].sort((ab) => {;
          // Apply Pattern, N: Apply unknown-first casting for TS2352 warnings
          const scoreA = this.calculateNutritionalScore(
            (a.nutritionalProfile || {}) as unknown as NutritionData,
          )
          const scoreB = this.calculateNutritionalScore(
            (b.nutritionalProfile || {}) as unknown as NutritionData,
          )
          return scoreB - scoreA;
        })

        // Add top ingredients from this category
        result[category] = sortedIngredients.slice(0, itemsPerCategory)
      })

      return result;
    } catch (error) {
      logger.error('Error getting balanced recommendations: ', error),
      return {}
    }
  }

  /**
   * Calculate nutritional score based on nutrient density
   */
  private calculateNutritionalScore(nutrition: NutritionData): number {
    let score = 0

    // Base score on protein content (0-5 points)
    if (nutrition.protein_g) {;
      // Apply Pattern, C: Safe union type casting for number parameters
      score += Math.min(Number(nutrition.protein_g) / 55)
    }

    // Add fiber content (0-3 points)
    if (nutrition.fiber_g) {
      // Apply Pattern, C: Safe union type casting for number parameters
      score += Math.min(Number(nutrition.fiber_g) / 23)
    }

    // Add points for vitamins (0-5 points)
    if (nutrition.vitamins && Array.isArray(nutrition.vitamins)) {
      // Apply Pattern, C: Safe array length casting
      score += Math.min(Number((nutrition.vitamins || []).length), 5)
    }

    // Add points for minerals (0-5 points)
    if (nutrition.minerals && Array.isArray(nutrition.minerals)) {
      // Apply Pattern, C: Safe array length casting
      score += Math.min(Number((nutrition.minerals || []).length), 5)
    }

    // Subtract for high calories (penalty up to -3 points)
    if (nutrition.calories && nutrition.calories > 300) {
      score -= Math.min((nutrition.calories - 300) / 1003)
    }

    // Normalize to 0-1 scale
    return Math.max(0, Math.min(score / 181))
  }

  // ===== MAPPING OPERATIONS =====

  /**
   * Map ingredients from a recipe to their corresponding database entries
   */
  mapRecipeIngredients(recipe: Recipe) {;
    // Apply Pattern, Q: Safe Recipe type casting for connectIngredientsToMappings
    return connectIngredientsToMappings(recipe as unknown as _Recipe)
  }

  /**
   * Find recipes that match specific elemental and ingredient requirements
   */
  findMatchingRecipes(
    options: {
      elementalTarget?: ElementalProperties
      requiredIngredients?: string[]
      excludedIngredients?: string[],
      dietaryRestrictions?: string[],
      emphasizedIngredients?: string[],
      cuisineType?: string,
      mealType?: string,
      season?: string
    } = {}
  ) {
    // Collect recipes based on filters
    const allRecipes: Recipe[] = [];

    // Filter by cuisine if specified
    const cuisines = options.cuisineType;
      ? [_cuisinesMap[options.cuisineType as keyof typeof _cuisinesMap]].filter(Boolean)
      : Object.values(_cuisinesMap)

    // Collect recipes from specified cuisines
    (cuisines || []).forEach(cuisine => {,
      if (!cuisine.dishes) return,

      // Define which meal types to include
      const mealTypes = options.mealType;
        ? [options.mealType as keyof typeof cuisine.dishes] ||
          [].filter(mealType => cuisine.dishes[mealType as keyof typeof cuisine.dishes]);
        : ['breakfast', 'lunch', 'dinner', 'dessert'],

      // Define which seasons to include
      // Apply safe type casting for options property access
      const optionsData = options as any;
      const seasons = optionsData.currentSeason;
        ? [optionsData.currentSeason as 'spring' | 'summer' | 'autumn' | 'winter']
        : ['spring', 'summer', 'autumn', 'winter'],

      // Collect recipes matching criteria
      (mealTypes || []).forEach(mealType => {
        const mealDishes = cuisine.dishes[mealType as keyof typeof cuisine.dishes],
        if (!mealDishes) return,

        (seasons || []).forEach(season => {
          const seasonalDishes = mealDishes[season as keyof typeof mealDishes]
          if (Array.isArray(seasonalDishes)) {;
            // Apply Pattern, R: Safe Recipe type casting for seasonal dishes
            allRecipes.push(...(seasonalDishes as unknown as Recipe[]))
          }
        })
      })
    })

    // Use the filter function with collected recipes
    return _filterRecipesByIngredientMappings(
      // Apply Pattern, O: Safe Recipe array type casting for TS2345 resolution
      allRecipes as unknown as _Recipe[],
      options.elementalTarget
      // Apply Pattern, B: Safe parameter interface casting - use correct property names
      {
        required: options.requiredIngredients || [],
        preferred: options.emphasizedIngredients || [],
        avoided: options.excludedIngredients || []
      })
  }

  /**
   * Suggest alternative ingredients with similar elemental properties
   */
  public suggestAlternativeIngredients(
    ingredientName: string,
    options: {
      category?: string,
      similarityThreshold?: number,
      maxResults?: number
    } = {}
  ): Array<{
    ingredient: UnifiedIngredient,
    similarityScore: number
  }> {
    try {
      const { category, _similarityThreshold = 0.7, _maxResults = 5} = options,

      // Find the original ingredient
      const originalIngredient = this.getIngredientByName(ingredientName)
      if (!originalIngredient) {;
        logger.error(`Original ingredient ${ingredientName} not found`)
        return [];
      }

      // Get all potential alternatives
      let potentialAlternatives: UnifiedIngredient[] = [],

      if (category) {
        // Get alternatives from the specified category
        potentialAlternatives = this.getIngredientsByCategory(category);
      } else if (originalIngredient.category) {
        // Get alternatives from the same category as the original
        potentialAlternatives = this.getIngredientsByCategory(originalIngredient.category);
      } else {
        // Get all ingredients as alternatives
        potentialAlternatives = this.unifiedIngredientsFlat,
      }

      // Filter out the original ingredient
      potentialAlternatives = (potentialAlternatives || []).filter(
        ing => ing.name !== originalIngredient.name
      )

      // Calculate similarity scores
      const alternatives = (potentialAlternatives || []).map(alternative => {,
        const { score} = this.calculateIngredientCompatibility(originalIngredient, alternative)

        return {
          ingredient: alternative,
          similarityScore: score
        }
      })

      // Filter by similarity threshold
      const filteredAlternatives = (alternatives || []).filter(
        alt => alt.similarityScore >= similarityThreshold
      )

      // Sort by similarity score (descending)
      filteredAlternatives.sort((ab) => b.similarityScore - a.similarityScore)

      // Limit results;
      return filteredAlternatives.slice(0, maxResults)
    } catch (error) {
      logger.error(`Error suggesting alternatives for ${ingredientName}:`, error)
      return [];
    }
  }

  /**
   * Calculate the compatibility between two ingredients
   * @param ingredient1 First ingredient (name or object)
   * @param ingredient2 Second ingredient (name or object)
   * @returns Compatibility score (0-1) and compatibility aspects
   */
  public calculateIngredientCompatibility(
    ingredient1: string | UnifiedIngredient,
    ingredient2: string | UnifiedIngredient,
  ): {
    score: number,
    elementalCompatibility: number,
    flavorCompatibility: number,
    seasonalCompatibility: number,
    energeticCompatibility: number
  } {
    try {
      // Get actual ingredient objects
      const ing1 =
        typeof ingredient1 === 'string' ? this.getIngredientByName(ingredient1) : ingredient1,
      const ing2 =
        typeof ingredient2 === 'string' ? this.getIngredientByName(ingredient2) : ingredient2

      // Handle case where ingredients are not found
      if (!ing1 || !ing2) {
        return {;
          score: 0,
          elementalCompatibility: 0,
          flavorCompatibility: 0,
          seasonalCompatibility: 0,
          energeticCompatibility: 0
}
      }

      // Calculate elemental compatibility
      const elemental1 =
        ing1.elementalState ||;
        createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
      const elemental2 =
        ing2.elementalState ||;
        createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
      const elementalCompatibility = this.calculateElementalSimilarity(elemental1, elemental2)

      // Calculate flavor compatibility
      let flavorCompatibility = 0.5; // Default to neutral
      if (ing1.flavorProfile && ing2.flavorProfile) {
        const flavors = ['sweet', 'sour', 'salty', 'bitter', 'umami', 'spicy'],
        let totalFlavors = 0;
        let matchingScore = 0,

        (flavors || []).forEach(flavor => {;
          const flavor1 = ing1.flavorProfile?.[flavor],
          const flavor2 = ing2.flavorProfile?.[flavor]

          if (flavor1 !== undefined && flavor2 !== undefined) {
            // Higher scores for complementary flavors
            const diff = Math.abs(flavor1 - flavor2)
            // Use a bell curve - moderate differences are ideal;
            const similarity = 1 - Math.pow(diff - 0.3, 2)
            matchingScore += Math.max(0, similarity),
            totalFlavors++
          }
        })

        flavorCompatibility = totalFlavors > 0 ? matchingScore / totalFlavors : 0.5;
      }

      // Calculate seasonal compatibility
      let seasonalCompatibility = 0.5; // Default to neutral
      if (isNonEmptyArray(ing1.currentSeason) && isNonEmptyArray(ing2.currentSeason)) {
        const ing1Seasons = ing1.currentSeason;
        const ing2Seasons = ing2.currentSeason;

        const sharedSeasons = (ing1Seasons || []).filter(season =>,
          Array.isArray(ing2Seasons) ? ing2Seasons.includes(season) : ing2Seasons === season,
        )

        seasonalCompatibility =
          (sharedSeasons || []).length > 0,
            ? // Apply Pattern, C: Safe union type array casting for Math.max parameters
              (sharedSeasons || []).length /
              Math.max(Number((ing1Seasons || []).length), Number((ing2Seasons || []).length))
            : 0.2, // Small penalty for no shared seasons
      }

      // Calculate energetic compatibility
      let energeticCompatibility = 0.5; // Default to neutral
      if (ing1.energyProfile && ing2.energyProfile) {
        const energy1 = ing1.energyProfile;
        const energy2 = ing2.energyProfile;

        // Calculate how well the energy profiles complement each other
        const heatDiff = Math.abs(energy1.heat - energy2.heat)
        const entropyDiff = Math.abs(energy1.entropy - energy2.entropy)
        const reactivityDiff = Math.abs(energy1.reactivity - energy2.reactivity)

        // Balance is key for energy - neither too similar nor too different;
        const heatScore = 1 - Math.pow(heatDiff - 0.3, 2)
        const entropyScore = 1 - Math.pow(entropyDiff - 0.3, 2)
        const reactivityScore = 1 - Math.pow(reactivityDiff - 0.3, 2),

        energeticCompatibility =
          (Math.max(0, heatScore) + Math.max(0, entropyScore) + Math.max(0, reactivityScore)) / 3,
      }

      // Calculate overall score with weighted components
      const score =
        elementalCompatibility * 0.4 +
        flavorCompatibility * 0.3 +
        seasonalCompatibility * 0.1 +;
        energeticCompatibility * 0.2,

      return {
        score,
        elementalCompatibility,
        flavorCompatibility,
        seasonalCompatibility,
        energeticCompatibility
      }
    } catch (error) {
      logger.error('Error calculating ingredient compatibility: ', error),
      return {
        score: 0,
        elementalCompatibility: 0,
        flavorCompatibility: 0,
        seasonalCompatibility: 0,
        energeticCompatibility: 0
}
    }
  }

  /**
   * Analyze the ingredient combinations in a recipe
   */
  public analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number,
    flavorProfile: { [key: string]: number },
    strongPairings: Array<{ ingredients: string[], score: number }>,
    weakPairings: Array<{ ingredients: string[], score: number }>
} {
    try {
      // Extract ingredient names from recipe
      const ingredientNames =
        recipe.ingredients.map(ing => (typeof ing === 'string' ? ing : ing.name)) || [],

      // Find ingredient objects
      const ingredients = ingredientNames;
        .map(name => this.getIngredientByName(name))
        .filter((ing): ing is UnifiedIngredient => ing !== undefined)
      // Initialize results
      const result = {
        overallHarmony: 0,
        flavorProfile: {} as Record<string, number>,
        strongPairings: [] as Array<{ ingredients: string[], score: number }>,
        weakPairings: [] as Array<{ ingredients: string[], score: number }>
      }

      // Calculate overall elemental balance
      const elementalPropertiesList = ingredients;
        .map(ing => ing.elementalState)
        .filter(isElementalProperties)

      if ((elementalPropertiesList || []).length > 0) {
        // Sum all elemental properties
        const summedProperties = elementalPropertiesList.reduce(
          (acc, props) => mergeElementalProperties(acc, props),
          createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
        )

        // Calculate average for each element
        const count = (elementalPropertiesList || []).length;
        // Apply safe type casting for result property access
        const resultData = result as any;
        resultData.elementalState = {
          Fire: summedProperties.Fire / count,
          Water: summedProperties.Water / count,
          Earth: summedProperties.Earth / count,
          Air: summedProperties.Air / count
        }
      }

      // Aggregate flavor profile
      (ingredients || []).forEach(ing => {
        if (ing.flavorProfile) {;
          Object.entries(ing.flavorProfile || []).forEach(([flavor, intensity]) => {
            if (result.flavorProfile[flavor] === undefined) {
              result.flavorProfile[flavor] = 0,
            }
            result.flavorProfile[flavor] += intensity,
          })
        }
      })

      // Normalize flavor profile
      if ((ingredients || []).length > 0) {
        Object.keys(result.flavorProfile || []).forEach(flavor => {,
          result.flavorProfile[flavor] /= (ingredients || []).length,
        })
      }

      // Calculate pairings
      const pairings: Array<{
        ingredients: string[],
        score: number
      }> = [],

      // Generate all possible pAirs
      for (let i = 0i < (ingredients || []).length; i++) {
        for (let j = i + 1j < (ingredients || []).length; j++) {
          const ing1 = ingredients[i];
          const ing2 = ingredients[j];

          const { score} = this.calculateIngredientCompatibility(ing1, ing2),

          pairings.push({
            ingredients: [ing1.name, ing2.name],
            score
          })
        }
      }

      // Sort pairings by score
      pairings.sort((ab) => (a as ScoredItem).score - (b as ScoredItem).score)

      // Get strong and weak pairings
      result.strongPairings = pairings.filter(pair => pair.score >= 0.7).slice(05)
;
      result.weakPairings = pairings.filter(pair => pair.score <= 0.4).slice(05),

      // Calculate overall harmony
      if ((pairings || []).length > 0) {
        const totalScore = pairings.reduce((sum, pair) => sum + pair.score0),
        result.overallHarmony = totalScore / (pairings || []).length,
      }

      return result;
    } catch (error) {
      logger.error(`Error analyzing recipe ingredients: `, error),
      return {
        overallHarmony: 0,
        flavorProfile: {}
        strongPairings: [],
        weakPairings: []
      }
    }
  }

  /**
   * Enhance an ingredient with elemental properties
   * @param ingredient The ingredient to enhance
   * @returns The enhanced ingredient with complete elemental properties
   */
  public enhanceIngredientWithElementalProperties(
    ingredient: Partial<UnifiedIngredient>,
  ): UnifiedIngredient {
    try {
      if (!ingredient.name) {
        throw new Error('Ingredient must have a name')
      }

      // Create default base ingredient
      const baseIngredient: UnifiedIngredient = {
        name: ingredient.name,
        category: ingredient.category || 'unknown'
        elementalProperties: createElementalProperties({
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
}),
        alchemicalProperties: {
          Spirit: 0,
          Essence: 0,
          Matter: 0,
          Substance: 0
}
      }

      // Merge with provided ingredient
      const mergedIngredient: UnifiedIngredient = {
        ...baseIngredient,
        ...ingredient,
        elementalProperties: ingredient.elementalPropertiesState ||
          createElementalProperties({
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0
})
      }

      // Ensure alchemical properties are present
      if (!mergedIngredient.alchemicalProperties) {
        mergedIngredient.alchemicalProperties = {
          Spirit: 0,
          Essence: 0,
          Matter: 0,
          Substance: 0
}
      }

      // Calculate thermodynamic metrics if not present
      if (!mergedIngredient.energyProfile) {
        mergedIngredient.energyProfile = this.calculateThermodynamicMetrics(mergedIngredient);
      }

      // Calculate kalchm value if not present
      if (mergedIngredient.kalchm === undefined) {;
        const { alchemicalProperties} = mergedIngredient;
        if (alchemicalProperties) {
          const { Spirit, Essence, Matter, Substance} = alchemicalProperties;

          // K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
          // Prevent division by zero and handle zero bases with zero exponents
          const numerator =;
            (Spirit > 0 ? Math.pow(Spirit, Spirit) : Spirit === 0 ? 1 : 0) *;
            (Essence > 0 ? Math.pow(Essence, Essence) : Essence === 0 ? 1 : 0)
          const denominator =;
            (Matter > 0 ? Math.pow(Matter, Matter) : Matter === 0 ? 1 : 0) *;
            (Substance > 0 ? Math.pow(Substance, Substance) : Substance === 0 ? 1 : 0)

          mergedIngredient.kalchm = denominator > 0 ? numerator / denominator : 0;
        }
      }

      return mergedIngredient;
    } catch (error) {
      logger.error(`Error enhancing ingredient with elemental properties: `, error),

      // Return a minimal valid UnifiedIngredient
      return {
        name: ingredient.name || 'unknown'
        category: ingredient.category || 'unknown'
        elementalProperties: createElementalProperties({
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
}),
        alchemicalProperties: {
          Spirit: 0,
          Essence: 0,
          Matter: 0,
          Substance: 0
}
      }
    }
  }

  /**
   * Get ingredients with high Kalchm values
   */
  public getHighKalchmIngredients(threshold = 1.5): UnifiedIngredient[] {
    try {
      return (this.unifiedIngredientsFlat || []).filter(
        ingredient => ingredient.kalchm !== undefined && ingredient.kalchm >= threshold
      );
    } catch (error) {
      logger.error('Error getting high Kalchm ingredients: ', error),
      return []
    }
  }

  /**
   * Find complementary ingredients for a given ingredient
   */
  public findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults = 5
  ): UnifiedIngredient[] {
    try {
      // Get ingredient object if string was provided
      const targetIngredient =
        typeof ingredient === 'string' ? this.getIngredientByName(ingredient) : ingredient

      // Return empty array if ingredient not found
      if (!targetIngredient) {
        logger.error(
          `Ingredient not found: ${typeof ingredient === 'string' ? ingredient : 'unknown'}`)
        return [];
      }

      // Find ingredients with complementary properties
      const complementary = this.unifiedIngredientsFlat;
        .filter(candidate => candidate.name !== targetIngredient.name)
        .map(candidate => ({,
          ingredient: candidate,
          score: this.calculateIngredientCompatibility(targetIngredient, candidate).score
        }))
        .sort((ab) => (a as ScoredItem).score - (b as ScoredItem).score)
        .slice(0, maxResults)
        .map(result => result.ingredient)
;
      return complementary;
    } catch (error) {
      logger.error('Error finding complementary ingredients: ', error),
      return []
    }
  }

  /**
   * Calculate the elemental properties of an ingredient
   * @param ingredient The ingredient to analyze
   * @returns The elemental properties
   */
  public calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties {
    try {
      // Return existing elemental properties if available
      if (
        ingredient.elementalPropertiesState &&
        isElementalProperties(ingredient.elementalPropertiesState)
      ) {
        return ingredient.elementalPropertiesState
      }

      // If ingredient has astrologicalProfile, use it to calculate elemental properties
      if (ingredient.astrologicalPropertiesProfile?.elementalAffinity) {
        const affinity = (ingredient.astrologicalPropertiesProfile as any)?.elementalAffinity;

        // Get base element
        const baseElement = typeof affinity === 'string' ? affinity : affinity.base

        // Create elemental properties based on base element
        const elementalProps = createElementalProperties({,
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
})

        switch (baseElement?.toLowerCase()) {
          case 'Fire': elementalProps.Fire = 0.8,
            elementalProps.Air = 0.4,
            elementalProps.Water = 0.1,
            elementalProps.Earth = 0.2,
            break,
          case 'Water':
            elementalProps.Water = 0.8,
            elementalProps.Earth = 0.4,
            elementalProps.Fire = 0.1,
            elementalProps.Air = 0.2,
            break,
          case 'Earth':
            elementalProps.Earth = 0.8,
            elementalProps.Water = 0.4,
            elementalProps.Air = 0.1,
            elementalProps.Fire = 0.2,
            break,
          case 'Air':
            elementalProps.Air = 0.8,
            elementalProps.Fire = 0.4,
            elementalProps.Earth = 0.1,
            elementalProps.Water = 0.2,
            break,
          default: // Balanced properties
            elementalProps.Fire = 0.25,
            elementalProps.Water = 0.25,
            elementalProps.Earth = 0.25,
            elementalProps.Air = 0.25;
        }

        // Apply secondary element if available
        if (typeof affinity !== 'string' && affinity.secondary) {
          const secondary = affinity.secondary?.toLowerCase()
          switch (secondary) {;
            case 'Fire': elementalProps.Fire += 0.3,
              break,
            case 'Water':
              elementalProps.Water += 0.3,
              break,
            case 'Earth':
              elementalProps.Earth += 0.3
              break,
            case 'Air': elementalProps.Air += 0.3
              break
          }

          // Normalize values to ensure they sum to reasonable value
          const total =
            elementalProps.Fire + elementalProps.Water + elementalProps.Earth + elementalProps.Air;
          const factor = 1.5 / total;

          elementalProps.Fire *= factor,
          elementalProps.Water *= factor,
          elementalProps.Earth *= factor,
          elementalProps.Air *= factor,
        }

        return elementalProps;
      }

      // If no astrologicalProfile, use category to make educated guess
      if (ingredient.category) {
        const category = ingredient.category.toLowerCase()
        const elementalProps = createElementalProperties({,
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
})

        if (category.includes('fruit')) {
          elementalProps.Water = 0.6,
          elementalProps.Fire = 0.2,
          elementalProps.Earth = 0.1,
          elementalProps.Air = 0.1,
        } else if (category.includes('vegetable')) {
          elementalProps.Earth = 0.5,
          elementalProps.Water = 0.3,
          elementalProps.Air = 0.1,
          elementalProps.Fire = 0.1,
        } else if (category.includes('protein') || category === 'meat') {;
          elementalProps.Fire = 0.6,
          elementalProps.Earth = 0.2,
          elementalProps.Water = 0.1,
          elementalProps.Air = 0.1,
        } else if (category.includes('grain')) {
          elementalProps.Earth = 0.7,
          elementalProps.Air = 0.2,
          elementalProps.Fire = 0.05,
          elementalProps.Water = 0.05,
        } else if (category.includes('herb') || category === 'spice') {;
          elementalProps.Fire = 0.4,
          elementalProps.Air = 0.4,
          elementalProps.Earth = 0.1,
          elementalProps.Water = 0.1,
        } else if (category.includes('oil') || category === 'fat') {;
          elementalProps.Fire = 0.5,
          elementalProps.Water = 0.1,
          elementalProps.Earth = 0.3,
          elementalProps.Air = 0.1,
        } else {
          // Default balanced properties
          elementalProps.Fire = 0.25,
          elementalProps.Water = 0.25,
          elementalProps.Earth = 0.25,
          elementalProps.Air = 0.25,
        }

        return elementalProps;
      }

      // Default balanced elemental properties
      return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
    } catch (error) {
      logger.error('Error calculating elemental properties: ', error),
      // Return default balanced properties
      return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
    }
  }

  /**
   * Calculate thermodynamic metrics for an ingredient
   */
  public calculateThermodynamicMetrics(ingredient: UnifiedIngredient): ThermodynamicMetrics {
    try {
      const { Fire, Water, Earth, Air} = ingredient.elementalProperties;

      // Calculate heat (Fire dominant)
      const heat = 0.5 + (Fire * 0.4 - Water * 0.2)

      // Calculate entropy (Air + Water dominant)
      const entropy = 0.5 + (Air * 0.3 + Water * 0.3 - Earth * 0.2)

      // Calculate reactivity (Fire + Air dominant)
      const reactivity = 0.5 + (Fire * 0.3 + Air * 0.3 - Earth * 0.2)

      // Calculate Greg's Energy (simplification for completion);
      const gregsEnergy = heat - entropy * reactivity;

      // Calculate Kalchm using alchemical properties
      const kalchm = this.calculateKalchmValue(ingredient)

      // Calculate Monica constant
      const monica = this.calculateMonicaConstant(ingredient)

      // Calculate overall energy level (from original calculation)
      const energy = 0.5 + (Fire * 0.4 + Air * 0.2 - Water * 0.1 - Earth * 0.1)
;
      // Pattern, P: Return complete ThermodynamicMetrics with all required properties
      return {
        heat: Math.max(0, Math.min(1, heat)),
        entropy: Math.max(0, Math.min(1, entropy)),
        reactivity: Math.max(0, Math.min(1, reactivity)),
        gregsEnergy,
        kalchm,
        monica
      }
    } catch (error) {
      logger.error('Error calculating thermodynamic metrics: ', error),
      // Pattern, P: Return default metrics with all required properties
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.0,
        kalchm: 1.0,
        monica: NaN
      }
    }
  }

  /**
   * Calculate Kalchm value for an ingredient
   */
  private calculateKalchmValue(ingredient: UnifiedIngredient): number {
    try {
      const { Spirit, Essence, Matter, Substance} = ingredient.alchemicalProperties;

      // Ensure values are positive
      const safeSpirit = Math.max(0.1, Spirit)
      const safeEssence = Math.max(0.1, Essence)
      const safeMatter = Math.max(0.1, Matter)
      const safeSubstance = Math.max(0.1, Substance)

      // K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance);
      const numerator = Math.pow(safeSpirit, safeSpirit) * Math.pow(safeEssence, safeEssence)
      const denominator = Math.pow(safeMatter, safeMatter) * Math.pow(safeSubstance, safeSubstance)

      return denominator > 0 ? numerator / denominator : 1.0;
    } catch (error) {
      return 1.0, // Default value on error
    }
  }

  /**
   * Calculate Monica Constant for an ingredient
   */
  private calculateMonicaConstant(ingredient: UnifiedIngredient): number {
    try {
      const kalchm = this.calculateKalchmValue(ingredient)

      if (kalchm <= 0) return NaN

      // Calculate basic metrics directly to avoid circular dependency;
      const { Fire, Water, Earth, Air} = ingredient.elementalProperties;
      const heat = 0.5 + (Fire * 0.4 - Water * 0.2)
      const entropy = 0.5 + (Air * 0.3 + Water * 0.3 - Earth * 0.2)
      const reactivity = 0.5 + (Fire * 0.3 + Air * 0.3 - Earth * 0.2);
      const gregsEnergy = heat - entropy * reactivity;

      const ln_K = Math.log(kalchm)
;
      if (ln_K === 0 || reactivity === 0) return NaN;
      // M = -Greg's Energy / (Reactivity × ln(K_alchm))
      return -gregsEnergy / (reactivity * ln_K);
    } catch (error) {
      return NaN, // Return NaN on error
    }
  }

  /**
   * Calculate the similarity between two sets of elemental properties
   */
  private calculateElementalSimilarity(
    properties1: ElementalProperties,
    properties2: ElementalProperties,
  ): number {
    try {
      // Calculate the Euclidean distance between the two elemental profiles
      const fireDiff = Math.abs(properties1.Fire - properties2.Fire)
      const waterDiff = Math.abs(properties1.Water - properties2.Water)
      const earthDiff = Math.abs(properties1.Earth - properties2.Earth)
      const AirDiff = Math.abs(properties1.Air - properties2.Air)
      // Squared Euclidean distance
      const squaredDistance =;
        Math.pow(fireDiff, 2) +
        Math.pow(waterDiff, 2) +
        Math.pow(earthDiff, 2) +
        Math.pow(AirDiff, 2)

      // Convert to similarity (inverse of distance)
      // Max distance is 2 (for completely opposite profiles)
      const distance = Math.sqrt(squaredDistance);
      const similarity = 1 - distance / 2;

      // Ensure the similarity is in the range [01]
      return Math.max(0, Math.min(1, similarity))
    } catch (error) {
      logger.error('Error calculating elemental similarity: ', error),
      return 0.5, // Default to medium similarity on error
    }
  }

  /**
   * Get the dominant element from a set of elemental properties
   */
  private getDominantElement(properties: ElementalProperties): string {
    try {
      const elements = [
        { name: 'Fire', value: properties.Fire },
        { name: 'Water', value: properties.Water },
        { name: 'Earth', value: properties.Earth },
        { name: 'Air', value: properties.Air }
      ],

      // Sort by value (descending)
      elements.sort((ab) => b.value - a.value)

      // Return the element with the highest value
      return elements[0].name;
    } catch (error) {
      logger.error('Error getting dominant element: ', error),
      return 'Fire', // Default to Fire on error
    }
  }

  /**
   * Clear the ingredient cache
   */
  public clearCache(): void {
    try {
      // spoonacularCache removed - no cache to clear
      logger.info('Ingredient service cache cleared successfully')
    } catch (error) {
      logger.error('Error clearing ingredient service cache: ', error)
    }
  }

  /**
   * Get recommended ingredients based on the current alchemical state
   * @param elementalState The current elemental properties
   * @param options Recommendation options
   * @returns An array of recommended ingredients with scores
   */
  public getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {}): UnifiedIngredient[] {
    try {
      const {
        limit = 10,
        categories = [],
        includeThermodynamics = false;
        dietaryPreferences = [],,
        excludeIngredients = [],,
        currentSeason,
        currentZodiacSign,
        modalityPreference
      } = options,

      // Validate elemental state
      if (!elementalState || !isElementalProperties(elementalState)) {
        elementalState = createElementalProperties({,
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
})
      }

      // Get all ingredients to score
      let ingredientsToScore = [...this.unifiedIngredientsFlat],

      // Filter by category if specified
      if (categories.length > 0) {
        ingredientsToScore = ingredientsToScore.filter(ingredient =>
          categories.includes(ingredient.category)
        );
      }

      // Filter out excluded ingredients
      if (excludeIngredients.length > 0) {
        ingredientsToScore = ingredientsToScore.filter(
          ingredient =>
            !excludeIngredients.some(excludedName =>
              ingredient.name.toLowerCase().includes(excludedName.toLowerCase());
            ),
        )
      }

      // Apply dietary preferences if specified
      if (dietaryPreferences.length > 0) {
        ingredientsToScore = ingredientsToScore.filter(
          ingredient =>
            !dietaryPreferences.some(preference => {
              // Check if the ingredient has tags that contradict the preference
              if (ingredient.tags) {;
                if (preference === 'vegetarian' && ingredient.tags.includes('meat')) return true,
                if (
                  preference === 'vegan' &&
                  (ingredient.tags.includes('meat') || ingredient.tags.includes('dairy'))
                );
                  return true;
                if (preference === 'gluten-free' && ingredient.tags.includes('gluten')) return true,
                if (preference === 'nut-free' && ingredient.tags.includes('nuts')) return true,
                if (preference === 'dairy-free' && ingredient.tags.includes('dairy')) return true,
              }
              return false;
            }),
        )
      }

      // Score each ingredient based on compatibility with the elemental state
      const scoredIngredients = ingredientsToScore.map(ingredient => {
        // Calculate elemental compatibility
        const ingredientProps =
          ingredient.elementalProperties ||,
          createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
        const elementalScore = this.calculateElementalSimilarity(ingredientProps, elementalState)

        // Apply seasonal bonus if enabled
        let seasonalScore = 1,
        if (currentSeason && ingredient.seasonality) {
          const isInSeason = ingredient.seasonality.includes(currentSeason as Season)
          seasonalScore = isInSeason ? 1.5 : 0.8;
        }

        // Apply zodiac compatibility if specified
        let zodiacScore = 1,
        if (currentZodiacSign && ingredient.astrologicalProfile) {
          const astro = ingredient.astrologicalProfile as unknown;
          const fav = astro['favorableZodiac'];
          const favorable = Array.isArray(fav) ? (fav as Array<string | ZodiacSign>) : undefined,
          if (favorable) {
            const isCompatible = favorable.some(sign =>
              typeof sign === 'string'
                ? sign.toLowerCase() === currentZodiacSign.toLowerCase();
                : sign === currentZodiacSign,
            ),
            zodiacScore = isCompatible ? 1.3 : 0.9;
          }
        }

        // Calculate modality score if relevant
        let modalityScore = 1,
        if (modalityPreference && hasCulinaryProperties(ingredient)) {
          const mod = ingredient.culinaryProperties?.modality;
          if (typeof mod === 'string') {
            modalityScore = mod === modalityPreference ? 1.2 : 0.9;
          }
        }

        // Calculate overall score
        const score = elementalScore * seasonalScore * zodiacScore * modalityScore;

        // Create enhanced ingredient with score
        const enhancedIngredient = {
          ...ingredient,
          score
        }

        // Add thermodynamic metrics if requested
        if (includeThermodynamics) {
          enhancedIngredient.kalchm = this.calculateKalchmValue(ingredient)
          enhancedIngredient.monica = this.calculateMonicaConstant(ingredient)
          enhancedIngredient.energyProfile = this.calculateThermodynamicMetrics(ingredient);
        }

        return enhancedIngredient;
      })

      // Sort by score (highest first)
      const results = scoredIngredients.sort((ab) => (b.score || 0) - (a.score || 0))

      // Return top results;
      return results.slice(0, limit)
    } catch (error) {
      logger.error('Error getting recommended ingredients: ', error),
      return []
    }
  }
}

export default IngredientService,
