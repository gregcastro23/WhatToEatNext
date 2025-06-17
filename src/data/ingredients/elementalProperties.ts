import { ElementalProperties, LowercaseElementalProperties } from '../../types/elemental';
import { ensureLowercaseFormat } from '../../utils/elementalUtils';

/** * Comprehensive database of ingredient elemental properties * These values are used to calculate food recommendations based on a users elemental profile */
export interface IngredientElementalProperties {
  name: string;
  category: string;
  elementalProperties: LowercaseElementalProperties;
  seasonality: string[];
  cuisineAffinities: string[];
  flavorProfile: string[];
  healthBenefits: string[];
  cookingMethods: string[];
  planetaryInfluences: string[];
}

/** * Database of ingredients with their elemental properties */;
export const ingredientElementalDatabase: IngredientElementalProperties[] = [
  // Proteins
  {
    name: 'Chicken',
    category: 'protein',
    elementalProperties: {Fire: 0.3,Water: 0.3,Earth: 0.3,Air: 0.1
    },
    seasonality: ['all'],
    cuisineAffinities: ['Mediterranean', 'Asian', 'American', 'Mexican', 'Indian'],
    flavorProfile: ['mild', 'adaptable', 'savory'],
    healthBenefits: ['protein-rich', 'lean', 'vitamin B'],
    cookingMethods: ['bake', 'grill', 'roast', 'stir-fry', 'poach'],
    planetaryInfluences: ['Moon', 'Mercury']
  },
  {
    name: 'Beef',
    category: 'protein',
    elementalProperties: {Fire: 0.6,Water: 0.1,Earth: 0.3,Air: 0.0
    },
    seasonality: ['winter', 'fall'],
    cuisineAffinities: ['American', 'French', 'Italian', 'Korean', 'Argentinian'],
    flavorProfile: ['rich', 'umami', 'robust'],
    healthBenefits: ['protein-rich', 'iron', 'zinc', 'vitamin B12'],
    cookingMethods: ['grill', 'roast', 'braise', 'stew'],
    planetaryInfluences: ['Mars', 'Sun']
  },
  {
    name: 'Salmon',
    category: 'protein',
    elementalProperties: {Fire: 0.2,Water: 0.6,Earth: 0.1,Air: 0.1
    },
    seasonality: ['summer', 'fall'],
    cuisineAffinities: ['Nordic', 'Japanese', 'Pacific Northwest', 'Mediterranean'],
    flavorProfile: ['rich', 'buttery', 'delicate'],
    healthBenefits: ['omega-3 fatty acids', 'protein', 'vitamin D'],
    cookingMethods: ['grill', 'bake', 'poach', 'smoke', 'raw'],
    planetaryInfluences: ['Neptune', 'Venus']
  },
  // Vegetables
  {
    name: 'Spinach',
    category: 'vegetable',
    elementalProperties: {Fire: 0.0,Water: 0.3,Earth: 0.5,Air: 0.2
    },
    seasonality: ['spring', 'fall'],
    cuisineAffinities: ['Mediterranean', 'Indian', 'Middle Eastern'],
    flavorProfile: ['earthy', 'mild', 'verdant'],
    healthBenefits: ['iron', 'vitamin K', 'antioxidants', 'folate'],
    cookingMethods: ['sauté', 'steam', 'raw'],
    planetaryInfluences: ['Saturn', 'Moon']
  },
  {
    name: 'Tomato',
    category: 'vegetable',
    elementalProperties: {Fire: 0.4,Water: 0.4,Earth: 0.1,Air: 0.1
    },
    seasonality: ['summer'],
    cuisineAffinities: ['Mediterranean', 'Italian', 'Mexican', 'Spanish'],
    flavorProfile: ['sweet', 'acidic', 'umami'],
    healthBenefits: ['lycopene', 'vitamin C', 'potassium'],
    cookingMethods: ['raw', 'roast', 'stew', 'sauce'],
    planetaryInfluences: ['Mars', 'Venus']
  },
  {
    name: 'Bell Pepper',
    category: 'vegetable',
    elementalProperties: {Fire: 0.3,Water: 0.3,Earth: 0.1,Air: 0.3
    },
    seasonality: ['summer', 'fall'],
    cuisineAffinities: ['Mediterranean', 'Mexican', 'Chinese', 'Spanish'],
    flavorProfile: ['sweet', 'crisp', 'mild'],
    healthBenefits: ['vitamin C', 'vitamin A', 'antioxidants'],
    cookingMethods: ['raw', 'roast', 'stir-fry', 'grill'],
    planetaryInfluences: ['Mars', 'Sun']
  },
  // Grains
  {
    name: 'Rice',
    category: 'grain',
    elementalProperties: {Fire: 0.1,Water: 0.3,Earth: 0.5,Air: 0.1
    },
    seasonality: ['all'],
    cuisineAffinities: ['Asian', 'Indian', 'Middle Eastern', 'Spanish'],
    flavorProfile: ['neutral', 'subtle', 'adaptable'],
    healthBenefits: ['energy', 'fiber (brown)', 'manganese'],
    cookingMethods: ['boil', 'steam', 'pilaf', 'risotto'],
    planetaryInfluences: ['Moon', 'Jupiter']
  },
  {
    name: 'Quinoa',
    category: 'grain',
    elementalProperties: {Fire: 0.1,Water: 0.2,Earth: 0.4,Air: 0.3
    },
    seasonality: ['all'],
    cuisineAffinities: ['South American', 'Mediterranean', 'Modern'],
    flavorProfile: ['nutty', 'earthy', 'subtle'],
    healthBenefits: ['complete protein', 'fiber', 'magnesium', 'iron'],
    cookingMethods: ['boil', 'pilaf', 'salad'],
    planetaryInfluences: ['Jupiter', 'Mercury']
  },
  // Herbs & Spices
  {
    name: 'Basil',
    category: 'herb',
    elementalProperties: {Fire: 0.2,Water: 0.1,Earth: 0.1,Air: 0.6
    },
    seasonality: ['summer'],
    cuisineAffinities: ['Italian', 'Thai', 'Mediterranean'],
    flavorProfile: ['aromatic', 'peppery', 'sweet'],
    healthBenefits: ['anti-inflammatory', 'digestive aid', 'antioxidants'],
    cookingMethods: ['raw', 'infuse', 'pesto'],
    planetaryInfluences: ['Mars', 'Jupiter']
  },
  {
    name: 'Turmeric',
    category: 'spice',
    elementalProperties: {Fire: 0.5,Water: 0.0,Earth: 0.4,Air: 0.1
    },
    seasonality: ['all'],
    cuisineAffinities: ['Indian', 'Southeast Asian', 'Middle Eastern'],
    flavorProfile: ['earthy', 'bitter', 'warming'],
    healthBenefits: ['anti-inflammatory', 'antioxidant', 'digestive aid'],
    cookingMethods: ['bloom in oil', 'curry', 'golden milk'],
    planetaryInfluences: ['Sun', 'Saturn']
  },
  {
    name: 'Cinnamon',
    category: 'spice',
    elementalProperties: {Fire: 0.6,Water: 0.0,Earth: 0.2,Air: 0.2
    },
    seasonality: ['fall', 'winter'],
    cuisineAffinities: ['Middle Eastern', 'Indian', 'Mexican', 'Moroccan'],
    flavorProfile: ['warm', 'sweet', 'spicy'],
    healthBenefits: ['blood sugar regulation', 'anti-inflammatory', 'antioxidant'],
    cookingMethods: ['bake', 'simmer', 'tea', 'spice blends'],
    planetaryInfluences: ['Sun', 'Mars']
  },
  // Fruits
  {
    name: 'Apple',
    category: 'fruit',
    elementalProperties: {Fire: 0.1,Water: 0.3,Earth: 0.3,Air: 0.3
    },
    seasonality: ['fall'],
    cuisineAffinities: ['American', 'French', 'British', 'Germanic'],
    flavorProfile: ['sweet', 'tart', 'crisp'],
    healthBenefits: ['fiber', 'vitamin C', 'antioxidants'],
    cookingMethods: ['raw', 'bake', 'sauce', 'preserve'],
    planetaryInfluences: ['Venus', 'Jupiter']
  },
  {
    name: 'Lemon',
    category: 'fruit',
    elementalProperties: {Fire: 0.2,Water: 0.3,Earth: 0.1,Air: 0.4
    },
    seasonality: ['winter', 'spring'],
    cuisineAffinities: ['Mediterranean', 'Middle Eastern', 'North African'],
    flavorProfile: ['acidic', 'bright', 'citrusy'],
    healthBenefits: ['vitamin C', 'alkalizing', 'digestive aid'],
    cookingMethods: ['juice', 'zest', 'preserve', 'infuse'],
    planetaryInfluences: ['Mercury', 'Sun']
  },
  // Dairy
  {
    name: 'Yogurt',
    category: 'dairy',
    elementalProperties: {Fire: 0.0,Water: 0.4,Earth: 0.5,Air: 0.1
    },
    seasonality: ['all'],
    cuisineAffinities: ['Mediterranean', 'Middle Eastern', 'Indian', 'Eastern European'],
    flavorProfile: ['tangy', 'creamy', 'tart'],
    healthBenefits: ['probiotics', 'protein', 'calcium'],
    cookingMethods: ['raw', 'marinade', 'sauce', 'dressing'],
    planetaryInfluences: ['Moon', 'Venus']
  },
  // Nuts & Seeds
  {
    name: 'Almonds',
    category: 'nut',
    elementalProperties: {Fire: 0.2,Water: 0.0,Earth: 0.5,Air: 0.3
    },
    seasonality: ['fall'],
    cuisineAffinities: ['Mediterranean', 'Middle Eastern', 'Indian', 'French'],
    flavorProfile: ['nutty', 'earthy', 'buttery'],
    healthBenefits: ['healthy fats', 'vitamin E', 'magnesium', 'protein'],
    cookingMethods: ['raw', 'toast', 'bake', 'grind'],
    planetaryInfluences: ['Jupiter', 'Mercury']
  },
  // Oils
  {
    name: 'Olive Oil',
    category: 'oil',
    elementalProperties: {Fire: 0.2,Water: 0.0,Earth: 0.3,Air: 0.5
    },
    seasonality: ['all'],
    cuisineAffinities: ['Mediterranean', 'Italian', 'Spanish', 'Greek'],
    flavorProfile: ['fruity', 'peppery', 'grassy'],
    healthBenefits: ['monounsaturated fats', 'anti-inflammatory', 'antioxidants'],
    cookingMethods: ['sauté', 'dressing', 'drizzle', 'marinade'],
    planetaryInfluences: ['Sun', 'Jupiter']
  },
  {
    name: 'Coconut Oil',
    category: 'oil',
    elementalProperties: {Fire: 0.3,Water: 0.3,Earth: 0.3,Air: 0.1
    },
    seasonality: ['all'],
    cuisineAffinities: ['Southeast Asian', 'Caribbean', 'Indian', 'Pacific'],
    flavorProfile: ['tropical', 'sweet', 'nutty'],
    healthBenefits: ['medium-chain triglycerides', 'lauric acid', 'antimicrobial'],
    cookingMethods: ['sauté', 'bake', 'fry', 'raw'],
    planetaryInfluences: ['Venus', 'Moon']
  }
];

/** * Get ingredient by name */;
export const getIngredientByName = (name: string): IngredientElementalProperties | undefined => {
  return ingredientElementalDatabase.find(
    ingredient => ingredient.name.toLowerCase() === name.toLowerCase()
  );
};

/** * Get ingredients by category */;
export const getIngredientsByCategory = (category: string): IngredientElementalProperties[] => {
  return ingredientElementalDatabase.filter(
    ingredient => ingredient.category.toLowerCase() === category.toLowerCase()
  );
};

/** * Get ingredients by dominant element */;
export const getIngredientsByElement = (element: keyof ElementalProperties): IngredientElementalProperties[] => {
  return ingredientElementalDatabase.filter(ingredient => {
    const properties = ingredient.elementalProperties;
    const dominantElement = Object.entries(properties)
      .reduce((max, [elem, value]) => value > max.value ? { element: elem, value } : max, { element: '', value: 0 });
    
    return dominantElement.element === (element as string).toLowerCase();
  });
};

/** * Get ingredients by planetary influence */;
export const getIngredientsByPlanet = (planet: string): IngredientElementalProperties[] => {
  return ingredientElementalDatabase.filter(
    ingredient => ingredient.planetaryInfluences.includes(planet)
  );
};

/** * Get ingredients by season */;
export const getIngredientsBySeason = (season: string): IngredientElementalProperties[] => {
  return ingredientElementalDatabase.filter(
    ingredient => ingredient.seasonality.includes(season.toLowerCase()) || ingredient.seasonality.includes('all')
  );
};

/** * Get ingredients by cuisine */;
export const getIngredientsByCuisine = (cuisine: string): IngredientElementalProperties[] => {
  return ingredientElementalDatabase.filter(
    ingredient => ingredient.cuisineAffinities.some(
      affinity => affinity.toLowerCase().includes(cuisine.toLowerCase())
    )
  );
};