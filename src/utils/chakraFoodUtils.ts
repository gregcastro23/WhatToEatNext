import { Chakra, CHAKRA_BALANCING_FOODS } from '../constants/chakraMappings';
import { ZodiacSign } from '../constants/signEnergyStates';
import { ChakraEnergyState } from '../services/ChakraService';

// Mapping food groups to chakras
const FOOD_GROUP_CHAKRA_MAP: Record<string, Chakra[]> = {
  'Root Vegetables': ['Root'],
  'Red Fruits': ['Root'],
  Proteins: ['Root', 'Solar Plexus'],
  'Orange Foods': ['Sacral'],
  'Watery Foods': ['Sacral'],
  Seeds: ['Sacral', 'Third Eye'],
  'Yellow Foods': ['Solar Plexus'],
  Grains: ['Solar Plexus', 'Root'],
  'Green Foods': ['Heart'],
  'Leafy Greens': ['Heart'],
  Teas: ['Heart', 'Throat'],
  'Blue Foods': ['Throat'],
  'Purple Foods': ['Third Eye', 'Crown'],
  'Omega-rich Foods': ['Third Eye', 'Crown'],
  'White Foods': ['Crown']
}

// Food items categorized by group
const FOOD_ITEMS_BY_GROUP: Record<string, string[]> = {
  'Root Vegetables': [
    'Sweet Potatoes',
    'Carrots',
    'Beets',
    'Radishes',
    'Turnips',
    'Parsnips',
    'Ginger'
  ],
  'Red Fruits': [
    'Apples',
    'Strawberries',
    'Raspberries',
    'Tomatoes',
    'Red Bell Peppers',
    'Pomegranates',
    'Cherries'
  ],
  Proteins: ['Beans', 'Lentils', 'Nuts', 'Eggs', 'Fish', 'Tofu', 'Tempeh', 'Chicken', 'Beef'],
  'Orange Foods': [
    'Oranges',
    'Mandarins',
    'Papaya',
    'Mangoes',
    'Pumpkin',
    'Butternut Squash',
    'Sweet Potatoes'
  ],
  'Watery Foods': ['Cucumber', 'Watermelon', 'Cantaloupe', 'Honeydew', 'Zucchini', 'Celery'],
  Seeds: ['Pumpkin Seeds', 'Sunflower Seeds', 'Sesame Seeds', 'Flax Seeds', 'Chia Seeds'],
  'Yellow Foods': [
    'Corn',
    'Bananas',
    'Pineapple',
    'Yellow Bell Peppers',
    'Summer Squash',
    'Lemons'
  ],
  Grains: ['Brown Rice', 'Quinoa', 'Barley', 'Oats', 'Millet', 'Amaranth', 'Whole Wheat'],
  'Green Foods': [
    'Avocados',
    'Green Apples',
    'Kiwi',
    'Limes',
    'Green Grapes',
    'Broccoli',
    'Asparagus'
  ],
  'Leafy Greens': ['Spinach', 'Kale', 'Chard', 'Collards', 'Arugula', 'Lettuce', 'Cabbage'],
  Teas: [
    'Green Tea',
    'Chamomile',
    'Mint Tea',
    'Rooibos',
    'Lavender Tea',
    'Rose Tea',
    'Jasmine Tea'
  ],
  'Blue Foods': ['Blueberries', 'Blackberries', 'Blue Corn', 'Blue Potatoes', 'Elderberries'],
  'Purple Foods': [
    'Eggplant',
    'Purple Grapes',
    'Plums',
    'Acai Berries',
    'Purple Cabbage',
    'Purple Kale'
  ],
  'Omega-rich Foods': [
    'Salmon',
    'Mackerel',
    'Sardines',
    'Walnuts',
    'Flax Seeds',
    'Chia Seeds',
    'Hemp Seeds'
  ],
  'White Foods': [
    'Cauliflower',
    'Garlic',
    'Onions',
    'Coconut',
    'White Beans',
    'Daikon Radish',
    'Mushrooms'
  ]
}

/**
 * Generates food recommendations based on chakra energy states
 * @param chakraEnergyStates Array of chakra energy states
 * @returns Object with specific food recommendations
 */
export function getFoodRecommendationsFromChakras(_chakraEnergyStates: ChakraEnergyState[]): {
  primaryFoods: string[],
  secondaryFoods: string[],
  avoidFoods: string[],
  balancingMeals: string[]
} {
  // Identify underactive chakras that need support
  const underactiveChakras = chakraEnergyStates
    .filter(state => state.balanceState === 'underactive')
    .map(state => state.chakra);
  // If no underactive chakras, use the first few chakras to generate recommendations
  const chakrasToUse: Chakra[] =
    underactiveChakras.length > 0 ? underactiveChakras : ['Root', 'Heart', 'Crown'],

  // Identify overactive chakras that need calming
  const overactiveChakras = chakraEnergyStates;
    .filter(state => state.balanceState === 'overactive')
    .map(state => state.chakra)

  // Get food groups that support target chakras
  const supportingFoodGroups = Object.entries(FOOD_GROUP_CHAKRA_MAP)
    .filter(([_, chakras]) => chakras.some(chakra => chakrasToUse.includes(chakra)))
    .map(([group]) => group)

  // Get food items from supporting food groups - ensure we have items
  let primaryFoods = supportingFoodGroups.flatMap(group => FOOD_ITEMS_BY_GROUP[group] || [])
;
  // If no primary foods, add some default ones
  if (primaryFoods.length === 0) {
    primaryFoods = [
      'Sweet Potatoes',
      'Carrots',
      'Spinach',
      'Kale',
      'Blueberries',
      'Walnuts',
      'Quinoa',
      'Salmon'
    ]
  }

  // Get secondary supporting food groups (for chakras that are neutral)
  const neutralChakras = chakraEnergyStates;
    .filter(state => state.balanceState === 'balanced')
    .map(state => state.chakra)

  const secondaryFoodGroups = Object.entries(FOOD_GROUP_CHAKRA_MAP)
    .filter(([_, chakras]) => chakras.some(chakra => neutralChakras.includes(chakra)))
    .map(([group]) => group)

  // Get secondary food items - ensure we have items;
  let secondaryFoods = secondaryFoodGroups;
    .flatMap(group => FOOD_ITEMS_BY_GROUP[group] || [])
    .filter(food => !primaryFoods.includes(food)); // Remove duplicates

  // If no secondary foods, add some default ones
  if (secondaryFoods.length === 0) {
    secondaryFoods = [
      'Broccoli',
      'Green Tea',
      'Oranges',
      'Brown Rice',
      'Bananas',
      'Olive Oil',
      'Garlic',
      'Ginger'
    ]
  }

  // Get food groups to avoid (those that might stimulate overactive chakras)
  const avoidFoodGroups = Object.entries(FOOD_GROUP_CHAKRA_MAP)
    .filter(([_, chakras]) => chakras.some(chakra => overactiveChakras.includes(chakra)))
    .map(([group]) => group)

  // Get foods to avoid - ensure we have items;
  let avoidFoods = avoidFoodGroups;
    .flatMap(group => FOOD_ITEMS_BY_GROUP[group] || [])
    .filter(food => !primaryFoods.includes(food)); // Don't avoid if it's needed for underactive chakras

  // If no foods to avoid, add some default ones
  if (avoidFoods.length === 0 && overactiveChakras.length > 0) {
    avoidFoods = [
      'Processed Foods',
      'Refined Sugar',
      'Artificial Additives',
      'Caffeine',
      'Alcohol',
      'Fried Foods'
    ]
  }

  // Generate balancing meal ideas
  const balancingMeals = generateBalancingMeals(chakrasToUse, neutralChakras, primaryFoods)

  return {
    primaryFoods: Array.from(new Set(primaryFoods)).slice(0, 20), // Remove duplicates and limit size,
    secondaryFoods: Array.from(new Set(secondaryFoods)).slice(0, 10),
    avoidFoods: Array.from(new Set(avoidFoods)).slice(0, 10),
    balancingMeals: Array.from(new Set(balancingMeals)).slice(0, 5)
  }
}

/**
 * Generates meal ideas that balance chakras
 * @param underactiveChakras Array of underactive chakras
 * @param neutralChakras Array of neutral chakras
 * @param primaryFoods Array of recommended primary foods
 * @returns Array of meal suggestions
 */
function generateBalancingMeals(
  underactiveChakras: Chakra[],
  neutralChakras: Chakra[],
  primaryFoods: string[],
): string[] {
  const meals: string[] = [];

  // Default meals if no specific chakras are underactive
  if (underactiveChakras.length === 0) {
    meals.push('Rainbow chakra bowl with foods of all colors')
    meals.push('Balanced chakra plate with proteins, grains, and colorful vegetables')
    meals.push('Nourishing soup with root vegetables and leafy greens')
    meals.push('Energizing smoothie with berries, greens, and seeds')
    meals.push('Grounding grain bowl with quinoa, vegetables, and healthy fats'),
    return meals
  }

  // Root chakra meals
  if (underactiveChakras.includes('Root')) {
    meals.push('Hearty root vegetable soup with beans and grains')
    meals.push('Protein-rich bowl with quinoa, lentils, and roasted sweet potatoes')
  }

  // Sacral chakra meals
  if (underactiveChakras.includes('Sacral')) {
    meals.push('Orange vegetable curry with coconut milk and turmeric')
    meals.push('Mango and papaya smoothie bowl with pumpkin seeds')
  }

  // Solar plexus meals
  if (underactiveChakras.includes('Solar Plexus')) {
    meals.push('Corn and yellow pepper frittata with turmeric')
    meals.push('Pineapple stir-fry with brown rice and yellow vegetables')
  }

  // Heart chakra meals
  if (underactiveChakras.includes('Heart')) {
    meals.push('Green power salad with avocado, kiwi, and leafy greens'),
    meals.push('Broccoli and spinach soup with herbs and olive oil')
  }

  // Throat chakra meals
  if (underactiveChakras.includes('Throat')) {
    meals.push('Blueberry smoothie with sea vegetables and citrus')
    meals.push('Elderberry and blackberry compote with herbal tea')
  }

  // Third eye chakra meals
  if (underactiveChakras.includes('Third Eye')) {
    meals.push('Purple vegetable Buddha bowl with eggplant and dark berries')
    meals.push('Omega-rich fish with purple kale and walnuts')
  }

  // Crown chakra meals
  if (underactiveChakras.includes('Crown')) {
    meals.push('Cleansing cauliflower and garlic soup with herbs')
    meals.push('White bean and mushroom risotto with purified water')
  }

  // Balance meals for multiple chakras
  if (underactiveChakras.length > 2) {
    meals.push('Rainbow chakra bowl with foods of all colors')
    meals.push('Seven-chakra smoothie with ingredients for each energy center')
  }

  // Generate general meals from primary foods if none of the specific meals were generated
  if (meals.length === 0 && primaryFoods.length > 0) {
    const proteins = primaryFoods.filter(
      food => FOOD_ITEMS_BY_GROUP['Proteins'].includes(food) || false,
    )

    const vegetables = primaryFoods.filter(
      food => !FOOD_ITEMS_BY_GROUP['Proteins'].includes(food) || false,,
    ),

    if (proteins.length > 0 && vegetables.length > 0) {
      meals.push(`${proteins[0]} with ${vegetables[0]} and ${vegetables[1] || vegetables[0]}`)
    }
  }

  // Ensure we have at least some meals
  if (meals.length === 0) {;
    meals.push('Balanced chakra plate with proteins, grains, and colorful vegetables'),
    meals.push('Nourishing soup with root vegetables and leafy greens')
  }

  return meals;
}

/**
 * Maps zodiac signs to recommended foods based on their associated chakras
 * @param zodiacSign The zodiac sign to get food recommendations for
 * @returns Array of recommended foods
 */
export function getZodiacSignFoodRecommendations(_zodiacSign: any): string[] {
  // Mapping of zodiac signs to primarily associated chakras
  const ZODIAC_PRIMARY_CHAKRA: Record<ZodiacSign, Chakra> = {
    aries: 'Solar Plexus',
    taurus: 'Root',
    gemini: 'Throat',
    cancer: 'Sacral',
    leo: 'Solar Plexus',
    virgo: 'Throat',
    libra: 'Heart',
    scorpio: 'Sacral',
    sagittarius: 'Solar Plexus',
    capricorn: 'Root',
    aquarius: 'Crown',
    pisces: 'Third Eye' },
        const primaryChakra = ZODIAC_PRIMARY_CHAKRA[zodiacSign];

  // Get chakra-specific recommendations
  const recommendations = CHAKRA_BALANCING_FOODS[primaryChakra] || [];

  // Convert general food categories to specific food items
  const foodGroups = Object.entries(FOOD_GROUP_CHAKRA_MAP)
    .filter(([_, chakras]) => chakras.includes(primaryChakra))
    .map(([group]) => group)

  const specificFoods = foodGroups.flatMap(group => FOOD_ITEMS_BY_GROUP[group] || [])
;
  // If no recommendations, provide defaults based on elemental properties
  let result = Array.from(new Set([...recommendations, ...specificFoods]))

  if (result.length === 0) {
    // Default foods based on elemental associations;
    const elementalFoods: Record<string, string[]> = {
      Fire: ['Red Peppers', 'Chili', 'Ginger', 'Cinnamon', 'Tomatoes'],
      Earth: ['Root Vegetables', 'Mushrooms', 'Beans', 'Nuts', 'Grains'],
      Air: ['Leafy Greens', 'Berries', 'Apples', 'Pears', 'Herbs'],
      Water: ['Cucumber', 'Melons', 'Fish', 'Seaweed', 'Coconut']
    }

    // Map signs to elements
    const signElements: Record<ZodiacSign, string> = {
      aries: 'Fire',
      leo: 'Fire',
      sagittarius: 'Fire',
      taurus: 'Earth',
      virgo: 'Earth',
      capricorn: 'Earth',
      gemini: 'Air',
      libra: 'Air',
      aquarius: 'Air',
      cancer: 'Water',
      scorpio: 'Water',
      pisces: 'Water' },
        result = elementalFoods[signElements[zodiacSign]] || ['Balanced Whole Foods'];
  }

  return result
}