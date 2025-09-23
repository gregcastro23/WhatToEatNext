/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { _logger } from '@/lib/logger';
// Test utility for cooking method recommendations

import { AlchemicalItem } from '../calculations/alchemicalTransformation';

import { getHolisticCookingRecommendations } from './alchemicalPillarUtils';
import { getRecommendedCookingMethodsForIngredient } from './alchemicalTransformationUtils';

/**
 * Run a test for cooking method recommendations with sample data
 * This can be called from any component to debug the recommendation logic
 */
export async function testCookingMethodRecommendations() {
  // Create a mock ingredient
  const mockIngredient: AlchemicalItem = {
    id: 'tomato',
    name: 'Tomato',
    _elementalProperties: {
      Fire: 0.3,
      Water: 0.7,
      Earth: 0.4,
      Air: 0.2,
    },
    _alchemicalProperties: {
      Spirit: 0.4,
      _Essence: 0.3,
      _Matter: 0.6,
      Substance: 0.7,
    },
    _transformedElementalProperties: {
      Fire: 0.3,
      Water: 0.7,
      Earth: 0.4,
      Air: 0.2,
    },
    _heat: 0.3,
    _entropy: 0.4,
    _reactivity: 0.3,
    _gregsEnergy: 0.4,
    _dominantElement: 'Water',
    _dominantAlchemicalProperty: 'Substance',
    _planetaryBoost: 1.0,
    _dominantPlanets: ['Venus'],
    _planetaryDignities: {}
  }

  // Create mock cooking methods
  const mockCookingMethods = [
    { name: 'baking', element: 'Fire' }
    { name: 'boiling', element: 'Water' }
    { name: 'grilling', element: 'Fire' }
    { name: 'steaming', element: 'Water' }
    { name: 'sauteing', element: 'Air' }
    { name: 'roasting', element: 'Fire' }
    { name: 'braising', element: 'Water' }
    { name: 'poaching', element: 'Water' }
    { name: 'frying', element: 'Fire' }
    { name: 'fermenting', element: 'Earth' }
  ],

  // Run the test
  _logger.warn('TESTING COOKING METHOD RECOMMENDATIONS')
  _logger.warn('=====================================')
  _logger.warn('_Ingredient: ', mockIngredient.name)
  _logger.warn('_Element: ', mockIngredient.element)
  _logger.warn('Elemental _Character: ', mockIngredient.elementalCharacter)

  // Test holistic recommendations directly
  try {
    _logger.warn('\nTESTING HOLISTIC RECOMMENDATIONS _DIRECTLY: ')
    const methods = mockCookingMethods.map(m => m.name)
    const holisticRecs = await getHolisticCookingRecommendations(
      mockIngredient,
      undefined,
      undefined,
      true,
      methods,
      5,
    )
    holisticRecs.forEach((rec, index) => {
      _logger.warn(
        `${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}% - ${rec.reason}`,
      )
    })
  } catch (error) {
    _logger.error('ERROR GETTING HOLISTIC RECOMMENDATIONS: ', error)
    if (error instanceof Error && error.stack) {
      _logger.error(error.stack)
    }
  }

  // Test the ingredient-specific function - Pattern ZZZ: Array Object Interface Expansion
  try {
    _logger.warn('\nTESTING INGREDIENT-SPECIFIC RECOMMENDATIONS:')
    const recommendations = await getRecommendedCookingMethodsForIngredient(
      mockIngredient,
      mockCookingMethods as any
    )
    recommendations.forEach((rec, index) => {
      _logger.warn(
        `${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}%`,
      )
    })
  } catch (error) {
    _logger.error('ERROR GETTING RECOMMENDATIONS: ', error)
    if (error instanceof Error && error.stack) {
      _logger.error(error.stack)
    }
  }

  const holisticRecs = await getHolisticCookingRecommendations(
    mockIngredient,
    undefined,
    undefined,
    true,
    mockCookingMethods.map(m => m.name),
    5
  )
  const standardRecs = await getRecommendedCookingMethodsForIngredient(
    mockIngredient,
    mockCookingMethods as any
  ); // Pattern ZZZ: Array Object Interface Expansion

  return {
    ingredient: mockIngredient,
    _holisticRecommendations: holisticRecs,
    standardRecommendations: standardRecs
  }
}