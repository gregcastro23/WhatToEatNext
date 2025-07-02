import { allIngredients } from './index';
import type { Ingredient } from '@/types/alchemy';

export interface IngredientFlavorProfile {
  spicy: number;
  sweet: number;
  sour: number;
  bitter: number;
  salty: number;
  umami: number;
}

// Helper function to add flavor profiles to ingredients
export function enrichIngredientsWithFlavorProfiles(
  ingredients: Ingredient[]
): Ingredient[] {
  return ingredients.map(ingredient => {
    if (!(ingredient as any)?.flavorProfile) {
      (ingredient as any).flavorProfile = getFlavorProfileForIngredient(ingredient.name);
    }
    return ingredient;
  });
}

// Mapping of common ingredient names to their flavor profiles
// Values should be between 0-1, where 0 is none of that flavor and 1 is maximum intensity
const ingredientFlavorMap: Record<string, IngredientFlavorProfile & Record<string, any>> = {
  // Vegetables
  "onion": {
    spicy: 0.4,
    sweet: 0.3,
    sour: 0.1,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.4,
    name: 'onion',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic onion profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for onion'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  "tomato": {
    spicy: 0.0,
    sweet: 0.4,
    sour: 0.6,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.6,
    name: 'tomato',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic tomato profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for tomato'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "bell pepper": {
    spicy: 0.1,
    sweet: 0.6,
    sour: 0.2,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.2,
    name: 'bell pepper',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic bell pepper profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for bell pepper'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "carrot": {
    spicy: 0.0,
    sweet: 0.7,
    sour: 0.1,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.2,
    name: 'carrot',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic carrot profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for carrot'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "spinach": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.5,
    salty: 0.1,
    umami: 0.3,
    name: 'spinach',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic spinach profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for spinach'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "mushroom": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.1,
    umami: 0.9,
    name: 'mushroom',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic mushroom profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for mushroom'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Fruits
  "apple": {
    spicy: 0.0,
    sweet: 0.7,
    sour: 0.4,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.0,
    name: 'apple',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic apple profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for apple'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "lemon": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.9,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.0,
    name: 'lemon',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic lemon profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for lemon'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "orange": {
    spicy: 0.0,
    sweet: 0.6,
    sour: 0.5,
    bitter: 0.2,
    salty: 0.0,
    umami: 0.0,
    name: 'orange',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic orange profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for orange'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "strawberry": {
    spicy: 0.0,
    sweet: 0.7,
    sour: 0.4,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.0,
    name: 'strawberry',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic strawberry profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for strawberry'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Herbs & Spices
  "basil": {
    spicy: 0.1,
    sweet: 0.3,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.0,
    umami: 0.2,
    name: 'basil',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic basil profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for basil'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "cilantro": {
    spicy: 0.1,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.1,
    name: 'cilantro',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic cilantro profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for cilantro'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  "black pepper": {
    spicy: 0.8,
    sweet: 0.0,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.1,
    umami: 0.1,
    name: 'black pepper',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic black pepper profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for black pepper'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "turmeric": {
    spicy: 0.3,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.5,
    salty: 0.0,
    umami: 0.2,
    name: 'turmeric',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic turmeric profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for turmeric'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "cardamom": {
    spicy: 0.4,
    sweet: 0.3,
    sour: 0.0,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.0,
    name: 'cardamom',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic cardamom profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for cardamom'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "star anise": {
    spicy: 0.3,
    sweet: 0.5,
    sour: 0.0,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.0,
    name: 'star anise',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic star anise profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for star anise'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "saffron": {
    spicy: 0.1,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.4,
    salty: 0.0,
    umami: 0.2,
    name: 'saffron',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic saffron profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for saffron'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Meats & Proteins
  "beef": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.2,
    umami: 0.9,
    name: 'beef',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic beef profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for beef'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "chicken": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.1,
    umami: 0.6,
    name: 'chicken',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic chicken profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for chicken'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "fish": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.2,
    umami: 0.8,
    name: 'fish',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic fish profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for fish'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "tofu": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.3,
    name: 'tofu',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic tofu profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for tofu'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "tempeh": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.3,
    salty: 0.1,
    umami: 0.6,
    name: 'tempeh',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic tempeh profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for tempeh'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Grains & Starches
  "rice": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.0,
    umami: 0.1,
    name: 'rice',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic rice profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for rice'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "pasta": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.1,
    umami: 0.1,
    name: 'pasta',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic pasta profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for pasta'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "quinoa": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.0,
    umami: 0.2,
    name: 'quinoa',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic quinoa profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for quinoa'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Dairy & Alternatives
  "butter": {
    spicy: 0.0,
    sweet: 0.3,
    sour: 0.1,
    bitter: 0.0,
    salty: 0.3,
    umami: 0.3,
    name: 'butter',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic butter profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for butter'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "cheese": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.3,
    bitter: 0.1,
    salty: 0.5,
    umami: 0.8,
    name: 'cheese',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic cheese profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for cheese'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "yogurt": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.7,
    bitter: 0.0,
    salty: 0.1,
    umami: 0.3,
    name: 'yogurt',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic yogurt profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for yogurt'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "coconut milk": {
    spicy: 0.0,
    sweet: 0.6,
    sour: 0.1,
    bitter: 0.0,
    salty: 0.0,
    umami: 0.1,
    name: 'coconut milk',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic coconut milk profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for coconut milk'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Fermented & Umami-Rich
  "soy sauce": {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.3,
    salty: 0.8,
    umami: 0.9,
    name: 'soy sauce',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic soy sauce profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for soy sauce'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "miso": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.1,
    bitter: 0.2,
    salty: 0.7,
    umami: 0.9,
    name: 'miso',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic miso profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for miso'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "kimchi": {
    spicy: 0.7,
    sweet: 0.1,
    sour: 0.8,
    bitter: 0.1,
    salty: 0.6,
    umami: 0.7,
    name: 'kimchi',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic kimchi profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for kimchi'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "vinegar": {
    spicy: 0.0,
    sweet: 0.0,
    sour: 0.9,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.1,
    name: 'vinegar',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic vinegar profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for vinegar'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Nuts & Seeds
  "almond": {
    spicy: 0.0,
    sweet: 0.3,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.1,
    umami: 0.2,
    name: 'almond',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic almond profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for almond'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "walnut": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.4,
    salty: 0.0,
    umami: 0.3,
    name: 'walnut',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic walnut profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for walnut'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "sesame": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.3,
    salty: 0.1,
    umami: 0.5,
    name: 'sesame',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic sesame profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for sesame'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "sunflower seeds": {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.2,
    name: 'sunflower seeds',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic sunflower seeds profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for sunflower seeds'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  
  // Sweeteners
  "honey": {
    spicy: 0.0,
    sweet: 0.9,
    sour: 0.1,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.0,
    name: 'honey',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic honey profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for honey'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  },
  "maple syrup": {
    spicy: 0.0,
    sweet: 0.9,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.1,
    name: 'maple syrup',
    category: 'Uncategorized',
    subCategory: 'Uncategorized',

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic maple syrup profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    origin: ['Unknown'],
    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for maple syrup'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious']
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    },

    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    },

    qualities: ['Versatile']
  }
};

/**
 * Get the flavor profile for a given ingredient
 * Will try to match ingredient names partially if an exact match is not found
 */
export function getFlavorProfileForIngredient(ingredientName: string): IngredientFlavorProfile {
  // Default flavor profile if nothing is found
  const defaultProfile: IngredientFlavorProfile = { 
    spicy: 0.0, sweet: 0.2, sour: 0.0, bitter: 0.0, salty: 0.1, umami: 0.1 
  };
  
  // Check for exact match
  if (ingredientFlavorMap[ingredientName.toLowerCase()]) {
    const fullIngredient = ingredientFlavorMap[ingredientName.toLowerCase()];
    // Extract only the flavor profile properties to match IngredientFlavorProfile interface
    return {
      spicy: fullIngredient.spicy,
      sweet: fullIngredient.sweet,
      sour: fullIngredient.sour,
      bitter: fullIngredient.bitter,
      salty: fullIngredient.salty,
      umami: fullIngredient.umami
    };
  }
  
  // Try to find partial matches
  const nameLower = ingredientName.toLowerCase();
  for (const [key, profile] of Object.entries(ingredientFlavorMap)) {
    if (
      nameLower.includes(key.toLowerCase()) || 
      key.toLowerCase().includes(nameLower)
    ) {
      // Extract only the flavor profile properties to match IngredientFlavorProfile interface
      return {
        spicy: profile.spicy,
        sweet: profile.sweet,
        sour: profile.sour,
        bitter: profile.bitter,
        salty: profile.salty,
        umami: profile.umami
      };
    }
  }
  
  // Return default if no match found
  return defaultProfile;
} 