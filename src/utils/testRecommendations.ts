/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// Test utility for cooking method recommendations

import type { AlchemicalItem } from "../calculations/alchemicalTransformation";

// NOTE: These imports are commented out as the functions don't exist in the codebase
// import { getHolisticCookingRecommendations } from './alchemicalPillarUtils';
// import { getRecommendedCookingMethodsForIngredient } from './alchemicalTransformationUtils';

/**
 * Run a test for cooking method recommendations with sample data
 * This can be called from any component to debug the recommendation logic
 */
export async function testCookingMethodRecommendations() {
  // Create a mock ingredient
  const mockIngredient: AlchemicalItem = {
    id: "tomato",
    name: "Tomato",
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
    _dominantElement: "Water",
    _dominantAlchemicalProperty: "Substance",
    _planetaryBoost: 1.0,
    _dominantPlanets: ["Venus"],
    _planetaryDignities: {},
  } as any;

  // Create mock cooking methods
  const mockCookingMethods = [
    { name: "baking", element: "Fire" },
    { name: "boiling", element: "Water" },
    { name: "grilling", element: "Fire" },
    { name: "steaming", element: "Water" },
    { name: "sauteing", element: "Air" },
    { name: "roasting", element: "Fire" },
    { name: "braising", element: "Water" },
    { name: "poaching", element: "Water" },
    { name: "frying", element: "Fire" },
    { name: "fermenting", element: "Earth" },
  ];

  // Run the test
  console.warn("TESTING COOKING METHOD RECOMMENDATIONS");
  console.warn("=====================================");
  console.warn("Ingredient: ", mockIngredient.name);
  console.warn("Element: ", (mockIngredient as any).element);
  console.warn(
    "Elemental Character: ",
    (mockIngredient as any).elementalCharacter,
  );

  // NOTE: Test functions are stubbed out as the required imports don't exist
  console.warn(
    "\nNOTE: Test functions are currently unavailable (missing imports)",
  );

  // Return mock data for now
  return {
    ingredient: mockIngredient,
    holisticRecommendations: [
      {
        method: "steaming",
        compatibility: 85,
        reason: "Water element compatibility (mock data)",
      },
      {
        method: "poaching",
        compatibility: 80,
        reason: "Gentle water-based cooking (mock data)",
      },
      {
        method: "boiling",
        compatibility: 75,
        reason: "Direct water cooking (mock data)",
      },
    ],
    standardRecommendations: [
      { method: "steaming", compatibility: 85 },
      { method: "poaching", compatibility: 80 },
      { method: "boiling", compatibility: 75 },
    ],
  };
}
