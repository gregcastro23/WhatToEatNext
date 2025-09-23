// Template for all cuisine files
import type { _, _ZodiacSign } from '@/types/alchemy';
import type { Cuisine } from '@/types/cuisine';

export const cuisine: Cuisine = {
  id: 'cuisine_id',
  name: 'Cuisine Name',
  description: 'Comprehensive description of cuisine traditions and characteristics.',
  // Mother Sauces section based on French cuisine model
  motherSauces: {
    exampleSauce: {
      name: 'Example Sauce',
      description: 'Description of the sauce and its characteristics',
      base: 'primary ingredient base (e.g., milk, stock, oil)',
      thickener: 'thickening agent (e.g., roux, reduction, emulsion)',
      keyIngredients: ['ingredient1', 'ingredient2', 'ingredient3', 'ingredient4'],
      culinaryUses: ['dish1', 'dish2', 'dish3', 'dish4'],
      derivatives: ['variation1', 'variation2', 'variation3', 'variation4'],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.3,
        Air: 0.1,
        Fire: 0.2,
      },
      astrologicalInfluences: [
        'astrological influence1',
        'astrological influence2',
        'astrological influence3'
      ],
      seasonality: 'best seasons or year-round',
      preparationNotes: 'Special preparation considerations or techniques',
      technicalTips: 'Tips for achieving best results',
      difficulty: 'easy/medium/hard',
      storageInstructions: 'How to store the sauce properly',
      yield: 'Amount the recipe produces',
    }
  },
  dishes: {
    breakfast: {
      all: [
        {
          name: 'Example Breakfast Dish',
          id: 'example-breakfast-dish',
          description: 'Detailed description of this breakfast dish',
          cuisine: 'Cuisine Name',
          cookingMethods: ['method1', 'method2', 'method3'],
          tools: ['tool1', 'tool2', 'tool3', 'tool4', 'tool5'],
          preparationSteps: [
            'Step 1 of preparation',
            'Step 2 of preparation',
            'Step 3 of preparation',
            'Step 4 of preparation',
            'Step 5 of preparation'
          ],
          instructions: [
            'Step 1 of preparation',
            'Step 2 of preparation',
            'Step 3 of preparation',
            'Step 4 of preparation',
            'Step 5 of preparation'
          ],
          ingredients: [
            { name: 'ingredient1', amount: '2', unit: 'cups', category: 'grain', element: 'Earth' }
            { name: 'ingredient2', amount: '1', unit: 'cup', category: 'dairy', element: 'Water' }
            { name: 'ingredient3', amount: '3', unit: 'tbsp', category: 'fat', element: 'Earth' }
            { name: 'ingredient4', amount: '2', unit: 'tsp', category: 'spice', element: 'Fire' }
            {
              name: 'ingredient5',
              amount: '1/4',
              unit: 'cup',
              category: 'vegetable',
              element: 'Air',
            }
          ],
          substitutions: {
            ingredient1: ['alternative1', 'alternative2'],
            ingredient2: ['alternative1', 'alternative2'],
            ingredient3: ['alternative1', 'alternative2']
          },
          servingSize: 4,
          allergens: ['allergen1', 'allergen2', 'allergen3'],
          prepTime: '15 minutes',
          cookTime: '25 minutes',
          difficulty: 'easy/medium/hard',
          culturalNotes: 'Cultural significance and history of this dish in the cuisine',
          pairingSuggestions: ['pairing1', 'pairing2', 'pairing3', 'pairing4'],
          dietaryInfo: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 400,
            protein: 12,
            carbs: 45,
            fat: 18,
            vitamins: ['vitamin1', 'vitamin2', 'vitamin3'],
            minerals: ['mineral1', 'mineral2']
          },
          timeToMake: '40 minutes',
          season: ['season1', 'season2', 'all'],
          mealType: ['breakfast'],
          numberOfServings: 4,
          elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2,
          },
          preparationNotes: 'This dish should be served immediately for the best experience. For a richer flavor, allow the batter to rest for 30 minutes before cooking.',
          technicalTips: [
            'Make sure all wet ingredients are at room temperature for a smoother batter',
            'Don't overmix the batteror the pancakes will become tough',
            'The skillet is ready when water droplets sizzle and dance on the surface'
          ],
          astrologicalInfluences: [
            'planet1 - description of influence',
            'planet2 - description of influence'
          ],
          lunarPhaseInfluences: ['lunar-phase1', 'lunar-phase2'],
          zodiacInfluences: ['zodiac-sign1', 'zodiac-sign2'],
          astrologicalAffinities: {
            planets: ['planet1', 'planet2'],
            signs: ['sign1', 'sign2'],
            lunarPhases: ['phase1', 'phase2']
          },
          tags: ['tag1', 'tag2', 'tag3']
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    lunch: {
      all: [],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    dinner: {
      all: [],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    dessert: {
      all: [],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    }
  },
  traditionalSauces: {
    sauce1: {
      name: 'Traditional Sauce 1',
      description: 'Description of the traditional sauce',
      base: 'base ingredient',
      keyIngredients: ['ingredient1', 'ingredient2'],
      difficulty: 'easy/medium/hard',
      culinaryUses: ['use1', 'use2'],
      elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
      seasonality: 'best season',
      preparationNotes: 'preparation notes',
      yield: 'amount produced',
    }
  },
  sauceRecommender: {
    forProtein: {
      // protein type: [sauce recommendations],
      protein1: ['sauce1', 'sauce2', 'sauce3'],
      protein2: ['sauce1', 'sauce2', 'sauce3']
    },
    forVegetable: {
      // vegetable type: [sauce recommendations],
      vegetable1: ['sauce1', 'sauce2', 'sauce3'],
      vegetable2: ['sauce1', 'sauce2', 'sauce3']
    },
    forCookingMethod: {
      // cooking method: [sauce recommendations],
      method1: ['sauce1', 'sauce2', 'sauce3'],
      method2: ['sauce1', 'sauce2', 'sauce3']
    },
    byAstrological: {
      // element: [sauce recommendations],
      fire: ['sauce1', 'sauce2', 'sauce3'],
      water: ['sauce1', 'sauce2', 'sauce3'],
      earth: ['sauce1', 'sauce2', 'sauce3'],
      air: ['sauce1', 'sauce2', 'sauce3']
    },
    byRegion: {
      // region: [sauce recommendations],
      region1: ['sauce1', 'sauce2', 'sauce3'],
      region2: ['sauce1', 'sauce2', 'sauce3']
    },
    byDietary: {
      // dietary restriction: [sauce recommendations],
      vegetarian: ['sauce1', 'sauce2', 'sauce3'],
      vegan: ['sauce1', 'sauce2', 'sauce3'],
      glutenFree: ['sauce1', 'sauce2', 'sauce3'],
      dairyFree: ['sauce1', 'sauce2', 'sauce3'],
      lowCarb: ['sauce1', 'sauce2', 'sauce3']
    }
  },
  cookingTechniques: [
    {
      name: 'Technique Name 1',
      description: 'Description of cooking technique',
      elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
      toolsRequired: ['tool1', 'tool2', 'tool3', 'tool4'],
      bestFor: ['food1', 'food2', 'food3', 'food4'],
      difficulty: 'easy/medium/hard',
    }
    {
      name: 'Technique Name 2',
      description: 'Description of cooking technique',
      elementalProperties: { Fire: 0.2, Earth: 0.4, Water: 0.3, Air: 0.1 },
      toolsRequired: ['tool1', 'tool2', 'tool3', 'tool4'],
      bestFor: ['food1', 'food2', 'food3', 'food4'],
      difficulty: 'easy/medium/hard',
    }
  ],
  regionalCuisines: {
    region1: {
      name: 'Region Name 1',
      description: 'Description of regional cuisine',
      signature: ['dish1', 'dish2', 'dish3', 'dish4', 'dish5'],
      elementalProperties: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
      astrologicalInfluences: ['influence1', 'influence2', 'influence3'],
      seasonality: 'description of seasonality',
      specialIngredients: ['ingredient1', 'ingredient2', 'ingredient3']
    },
    region2: {
      name: 'Region Name 2',
      description: 'Description of regional cuisine',
      signature: ['dish1', 'dish2', 'dish3', 'dish4', 'dish5'],
      elementalProperties: { Fire: 0.2, Earth: 0.4, Water: 0.3, Air: 0.1 },
      astrologicalInfluences: ['influence1', 'influence2', 'influence3'],
      seasonality: 'description of seasonality',
      specialIngredients: ['ingredient1', 'ingredient2', 'ingredient3']
    }
  },
  elementalProperties: {
    Fire: 0.25, // Description of fire element in this cuisine
    Water: 0.25, // Description of water element in this cuisine,
    Earth: 0.25, // Description of earth element in this cuisine
    Air: 0.25, // Description of air element in this cuisine
  },
  astrologicalInfluences: [
    'influence1', // Description of astrological influence
    'influence2', // Description of astrological influence
    'influence3', // Description of astrological influence
  ]
}

export default cuisine,
