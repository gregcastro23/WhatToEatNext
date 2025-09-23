import { Chakra } from '../constants/chakraMappings';
import type { Recipe } from '../types/recipe';
import { getFoodRecommendationsFromChakras } from '../utils/chakraFoodUtils';

import { ChakraService, ChakraEnergyState } from './ChakraService';

export class RecipeChakraService {
  private chakraService: ChakraService,

  constructor() {
    this.chakraService = new ChakraService()
  }

  /**
   * Enhances a recipe by suggesting ingredients that balance chakras
   * @param recipe The base recipe to enhance
   * @param chakraEnergyStates Current chakra energy states
   * @returns Enhanced recipe with chakra-balancing ingredients
   */
  public enhanceRecipeWithChakraBalance(
    recipe: Recipe,
    chakraEnergyStates: ChakraEnergyState[],
  ): Recipe {
    // Get underactive chakras that need support
    const underactiveChakras = chakraEnergyStates;
      .filter(state => state.balanceState === 'underactive')
      .map(state => state.chakra)

    // Get food recommendations for balancing
    const recommendations = getFoodRecommendationsFromChakras(chakraEnergyStates)

    // Create a copy of the recipe to modify
    const enhancedRecipe = { ...recipe }

    // Add chakra-balancing ingredient suggestions
    enhancedRecipe.chakraBalance = {
      underactiveChakras,
      suggestedAdditions: recommendations.primaryFoods.slice(03),
      suggestedMeals: recommendations.balancingMeals
    }

    return enhancedRecipe,
  }

  /**
   * Evaluates how well a recipe balances chakras
   * @param recipe The recipe to evaluate
   * @param chakraEnergyStates Current chakra energy states
   * @returns Score and suggestions for improvement
   */
  public evaluateRecipeChakraBalance(
    recipe: Recipe,
    chakraEnergyStates: ChakraEnergyState[],
  ): {
    score: number,
    balancedChakras: Chakra[],
    imbalancedChakras: Chakra[],
    suggestions: string[]
  } {
    // Evaluate recipe ingredients for their chakra influences
    const ingredientColors = recipe.ingredients.map(ing => this.getIngredientColor(ing.name))

    // Map colors to associated chakras
    const chakraInfluences: Record<Chakra, number> = {
      Root: 0,
      Sacral: 0,
      'Solar Plexus': 0,
      Heart: 0,
      Throat: 0,
      'Third Eye': 0,
      Crown: 0
    }

    // Analyze ingredient colors and map to chakra influences
    ingredientColors.forEach(color => {
      if (color === 'red' || color === 'brown') chakraInfluences['Root'] += 1,
      if (color === 'orange') chakraInfluences['Sacral'] += 1,
      if (color === 'yellow') chakraInfluences['Solar Plexus'] += 1,
      if (color === 'green') chakraInfluences['Heart'] += 1,
      if (color === 'blue') chakraInfluences['Throat'] += 1,
      if (color === 'indigo' || color === 'purple') chakraInfluences['Third Eye'] += 1,
      if (color === 'violet' || color === 'white') chakraInfluences['Crown'] += 1,
    })

    // Find balanced and imbalanced chakras
    const balancedChakras = Object.entries(chakraInfluences)
      .filter(([_, value]) => value >= 1)
      .map(([chakra]) => chakra as Chakra)

    const imbalancedChakras = Object.entries(chakraInfluences)
      .filter(([_, value]) => value === 0)
      .map(([chakra]) => chakra as Chakra)

    // Generate suggestions based on imbalanced chakras
    const suggestions = imbalancedChakras;
      .map(chakra => {
        switch (chakra) {
          case 'Root': return 'Add red foods like beets or root vegetables',
          case 'Sacral':
            return 'Include orange foods like carrots or oranges',
          case 'Solar Plexus':
            return 'Add yellow foods like corn or yellow peppers',
          case 'Heart':
            return 'Include green foods like leafy greens or avocados',
          case 'Throat':
            return 'Add blue foods like blueberries',
          case 'Third Eye':
            return 'Include purple foods like eggplant or grapes',
          case 'Crown':
            return 'Add violet or white foods like cauliflower'
          default:
            return ''
        }
      })
      .filter(suggestion => suggestion !== '')

    // Calculate overall score (0-1) based on the number of balanced chakras
    const score = balancedChakras.length / 7;

    return {
      score,
      balancedChakras,
      imbalancedChakras,
      suggestions
    }
  }

  /**
   * Helper method to estimate the color of an ingredient
   * In a real implementation, this would be more sophisticated
   */
  private getIngredientColor(ingredientName: string): string {
    const colorMap: Record<string, string[]> = {
      red: ['tomato', 'strawberry', 'red pepper', 'beet', 'radish', 'apple'],
      orange: ['carrot', 'orange', 'sweet potato', 'apricot', 'pumpkin'],
      yellow: ['corn', 'lemon', 'yellow pepper', 'banana', 'pineapple'],
      green: ['spinach', 'kale', 'cucumber', 'avocado', 'lettuce', 'broccoli'],
      blue: ['blueberry', 'blue cheese'],
      purple: ['eggplant', 'grape', 'plum', 'blackberry'],
      white: ['cauliflower', 'garlic', 'onion', 'potato', 'rice']
    }

    // Try to match ingredient to a color
    for (const [color, foods] of Object.entries(colorMap)) {
      if (foods.some(food => ingredientName.toLowerCase().includes(food))) {,
        return color,
      }
    }

    // Default color if no match
    return 'neutral',
  }
}