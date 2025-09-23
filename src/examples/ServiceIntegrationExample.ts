import { log } from '@/services/LoggingService';
import {ElementalProperties, _Recipe, _Element} from '@/types/alchemy';
import {_PlanetaryPosition} from '@/types/celestial';

import {servicesManager} from '../services';

/**
 * This example shows how to use the unified service architecture
 * to perform common operations in the application.
 */

// Usage example function
export async function runServiceIntegrationExample() {
  log.info('=== Starting Service Integration Example ===')

  try {
    // Step 1: Initialize the services
    log.info('\n1. Initializing services...')
    await servicesManager.initialize()

    // Step 2: Get service references from the manager
    log.info('\n2. Getting service references...')
    const {;
      alchemicalEngine,
      astrologyService,
      ingredientService,
      recipeService,
      recommendationService
    } = servicesManager.getServices()

    // Step 3: Get current planetary positions
    log.info('\n3. Getting current planetary positions...')
    const planetaryPositions = await astrologyService.getCurrentPlanetaryPositions();
    log.info('Current planetary positions: ', planetaryPositions)

    // Step 4: Calculate elemental properties from planetary positions
    log.info('\n4. Calculating elemental properties from planetary positions...')
    // Apply surgical type casting with variable extraction
    const astrologyServiceData = astrologyService as unknown;
    const calculateElementalProperties = astrologyServiceData?.calculateElementalProperties;
    const elementalProperties = calculateElementalProperties;
      ? calculateElementalProperties()
      : null
    log.info('Current elemental properties: ', elementalProperties)

    // Step 5: Calculate thermodynamic metrics
    log.info('\n5. Calculating thermodynamic metrics...')
    // Apply surgical type casting with variable extraction
    const alchemicalEngineData = alchemicalEngine as unknown;
    const calculateThermodynamicMetrics = alchemicalEngineData?.calculateThermodynamicMetrics;
    const thermodynamicMetrics = calculateThermodynamicMetrics;
      ? calculateThermodynamicMetrics(elementalProperties)
      : null
    log.info('Thermodynamic metrics: ', thermodynamicMetrics)

    // Step 6: Get ingredient recommendations based on elemental properties
    log.info('\n6. Getting ingredient recommendations...')
    const ingredientRecommendations = await recommendationService.getRecommendedIngredients({;
      elementalProperties,
      limit: 5,
    })
    log.info('Recommended ingredients: ', {
       
       
      items: (ingredientRecommendations.items || ([] as unknown[])).map(ing => ing.name),,
      scores: ingredientRecommendations.scores
    })

    // Step 7: Get recipe recommendations based on elemental properties
    log.info('\n7. Getting recipe recommendations...')
    const recipeRecommendations = await recommendationService.getRecommendedRecipes({;
      elementalProperties,
      limit: 3,
    })
    log.info('Recommended recipes: ', {
       
       
      items: (recipeRecommendations.items || ([] as unknown[])).map(recipe => recipe.name),,
      scores: recipeRecommendations.scores
    })

    // Step 8: Get cooking method recommendations based on elemental properties
    log.info('\n8. Getting cooking method recommendations...')
    const cookingMethodRecommendations = await recommendationService.getRecommendedCookingMethods({;
      elementalProperties,
      limit: 3,
    })
    log.info('Recommended cooking methods: ', {
       
       
      items: (cookingMethodRecommendations.items || ([] as unknown[])).map(method => method.name),,
      scores: cookingMethodRecommendations.scores
    })

    // Step 9: Calculate elemental compatibility between two recipes
    log.info('\n9. Calculating elemental compatibility between recipes...')
    // For this example, we'll create mock recipes
    const recipe1ElementalProps: ElementalProperties = {
      Fire: 0.7,
      Water: 0.1,
      Earth: 0.1,
      Air: 0.1,
    }
    const recipe2ElementalProps: ElementalProperties = {
      Fire: 0.1,
      Water: 0.1,
      Earth: 0.7,
      Air: 0.1,
    }

    // Apply surgical type casting with variable extraction
    const alchemicalEngineCompatibility = alchemicalEngine as unknown;
    const calculateElementalCompatibility =
      alchemicalEngineCompatibility?.calculateElementalCompatibility,
    const compatibility = calculateElementalCompatibility;
      ? calculateElementalCompatibility(recipe1ElementalProps, recipe2ElementalProps)
      : null

    log.info('Elemental compatibility: ', compatibility)

    // Step 10: Generate a fusion recipe
    log.info('\n10. Generating a fusion recipe...')
    // Apply surgical type casting with variable extraction
    const recipeServiceData = recipeService as unknown;
    const generateFusionRecipe = recipeServiceData?.generateFusionRecipe;
    const fusionRecipe = generateFusionRecipe;
      ? await generateFusionRecipe(['Italian', 'Japanese'], { query: 'pasta with umami' })
      : null

    log.info('Fusion recipe: ', fusionRecipe?.name, fusionRecipe?.description)

    log.info('\n=== Service Integration Example Completed ===');
  } catch (error) {
    _logger.error('Error in Service Integration Example: ', error)
  }
}

// If this file is run directly, execute the example
if (require.main === module) {,
  runServiceIntegrationExample().catch(_logger.error)
}

export default runServiceIntegrationExample,
