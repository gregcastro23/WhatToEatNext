import { ElementalProperties , Recipe , Element } from '@/types/alchemy';
import { PlanetaryPosition } from "@/types/celestial";

import { servicesManager } from '../services';



/**
 * This example shows how to use the unified service architecture
 * to perform common operations in the application.
 */

// Usage example function
export async function runServiceIntegrationExample() {
  console.log('=== Starting Service Integration Example ===');
  
  try {
    // Step 1: Initialize the services
    console.log('\n1. Initializing services...');
    await servicesManager.initialize();
    
    // Step 2: Get service references from the manager
    console.log('\n2. Getting service references...');
    const {
      alchemicalEngine,
      astrologyService,
      ingredientService,
      recipeService,
      recommendationService
    } = servicesManager.getServices();
    
    // Step 3: Get current planetary positions
    console.log('\n3. Getting current planetary positions...');
    const planetaryPositions = await astrologyService.getCurrentPlanetaryPositions();
    console.log('Current planetary positions:', planetaryPositions);
    
    // Step 4: Calculate elemental properties from planetary positions
    console.log('\n4. Calculating elemental properties from planetary positions...');
    // Apply surgical type casting with variable extraction
    const astrologyServiceData = astrologyService as any;
    const calculateElementalProperties = astrologyServiceData?.calculateElementalProperties;
    const elementalProperties = calculateElementalProperties ? calculateElementalProperties() : null;
    console.log('Current elemental properties:', elementalProperties);
    
    // Step 5: Calculate thermodynamic metrics
    console.log('\n5. Calculating thermodynamic metrics...');
    // Apply surgical type casting with variable extraction
    const alchemicalEngineData = alchemicalEngine as any;
    const calculateThermodynamicMetrics = alchemicalEngineData?.calculateThermodynamicMetrics;
    const thermodynamicMetrics = calculateThermodynamicMetrics ? calculateThermodynamicMetrics(elementalProperties) : null;
    console.log('Thermodynamic metrics:', thermodynamicMetrics);
    
    // Step 6: Get ingredient recommendations based on elemental properties
    console.log('\n6. Getting ingredient recommendations...');
    const ingredientRecommendations = await recommendationService.getRecommendedIngredients({
      elementalProperties,
      limit: 5
    });
    console.log('Recommended ingredients:', 
      ingredientRecommendations?.items || [].map(ing => ing.name),
      'Scores:', ingredientRecommendations.scores
    );
    
    // Step 7: Get recipe recommendations based on elemental properties
    console.log('\n7. Getting recipe recommendations...');
    const recipeRecommendations = await recommendationService.getRecommendedRecipes({
      elementalProperties,
      limit: 3
    });
    console.log('Recommended recipes:', 
      recipeRecommendations?.items || [].map(recipe => recipe.name),
      'Scores:', recipeRecommendations.scores
    );
    
    // Step 8: Get cooking method recommendations based on elemental properties
    console.log('\n8. Getting cooking method recommendations...');
    const cookingMethodRecommendations = await recommendationService.getRecommendedCookingMethods({
      elementalProperties,
      limit: 3
    });
    console.log('Recommended cooking methods:', 
      cookingMethodRecommendations?.items || [].map(method => method.name),
      'Scores:', cookingMethodRecommendations.scores
    );
    
    // Step 9: Calculate elemental compatibility between two recipes
    console.log('\n9. Calculating elemental compatibility between recipes...');
    // For this example, we'll create mock recipes
    const recipe1ElementalProps: ElementalProperties = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
    const recipe2ElementalProps: ElementalProperties = { Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.1 };
    
    // Apply surgical type casting with variable extraction
    const alchemicalEngineCompatibility = alchemicalEngine as any;
    const calculateElementalCompatibility = alchemicalEngineCompatibility?.calculateElementalCompatibility;
    const compatibility = calculateElementalCompatibility ? 
      calculateElementalCompatibility(recipe1ElementalProps, recipe2ElementalProps) : 
      null;
    
    console.log('Elemental compatibility:', compatibility);
    
    // Step 10: Generate a fusion recipe
    console.log('\n10. Generating a fusion recipe...');
    // Apply surgical type casting with variable extraction
    const recipeServiceData = recipeService as any;
    const generateFusionRecipe = recipeServiceData?.generateFusionRecipe;
    const fusionRecipe = generateFusionRecipe ? 
      await generateFusionRecipe(['Italian', 'Japanese'], { query: 'pasta with umami' }) : 
      null;
    
    console.log('Fusion recipe:', fusionRecipe?.name, fusionRecipe?.description);
    
    console.log('\n=== Service Integration Example Completed ===');
  } catch (error) {
    console.error('Error in Service Integration Example:', error);
  }
}

// If this file is run directly, execute the example
if (require.main === module) {
  runServiceIntegrationExample()?.catch(console.error);
}

export default runServiceIntegrationExample; 