// src/data/cuisines/african.ts
import type { _, ZodiacSign } from '@/types/alchemy';
import type { Cuisine } from '@/types/cuisine';

export const african: Cuisine = {
  name: 'African',
  id: 'african',
  description:
    'Rich and diverse cuisine with bold flavors, hearty stews, and complex spice profiles. Spanning from North African tagines to West African peanut stews and East African injera-based dishes.',
  traditionalSauces: {
    berbere: {
      name: 'Berbere',
      description:
        'Ethiopian hot spice blend made from chili peppers, garlic, ginger and various spices',
      base: 'dried chili peppers',
      keyIngredients: ['chili peppers', 'garlic', 'ginger', 'fenugreek', 'cardamom', 'coriander'],
      culinaryUses: ['stews', 'meat dishes', 'lentil dishes', 'vegetable preparations'],
      variants: ['Mild Berbere', 'Extra-hot Berbere', 'Awaze (berbere paste)'],
      elementalProperties: {
        Fire: 0.8,
        Earth: 0.1,
        Air: 0.1,
        Water: 0.0
},
      astrologicalInfluences: ['Mars', 'Sun', 'Aries'],
      seasonality: 'all',
      preparationNotes:
        'Traditionally dry-roasted and ground by hand, though now commercial versions are widely available.',
      technicalTips: 'Toast the spices before grinding for maximum flavor development.'
},
    harissa: {
      name: 'Harissa',
      description: 'North African hot chili pepper paste with garlic, olive oil and spices',
      base: 'red chili peppers',
      keyIngredients: ['chili peppers', 'garlic', 'olive oil', 'caraway', 'coriander', 'cumin'],
      culinaryUses: ['couscous', 'stews', 'marinades', 'dips'],
      variants: ['Rose Harissa', 'Preserved Lemon Harissa', 'Tunisian Harissa'],
      elementalProperties: {
        Fire: 0.7,
        Earth: 0.2,
        Water: 0.1,
        Air: 0.0
},
      astrologicalInfluences: ['Mars', 'Mercury', 'Aries'],
      seasonality: 'all',
      preparationNotes: 'Can be preserved in olive oil for months when refrigerated.',
      technicalTips: 'For milder harissa, remove seeds from peppers before processing.',
    },
    duqqa: {
      name: 'Duqqa',
      description: 'Egyptian dry spice blend with nuts, herbs, and spices',
      base: 'toasted nuts',
      keyIngredients: ['hazelnuts', 'sesame seeds', 'coriander', 'cumin', 'mint', 'salt'],
      culinaryUses: ['dipping with bread', 'sprinkled on vegetables', 'coating for meats'],
      variants: ['Hazelnut-dominant', 'Sesame-dominant', 'Herb-forward'],
      elementalProperties: {
        Earth: 0.5,
        Air: 0.3,
        Fire: 0.2,
        Water: 0.0
},
      astrologicalInfluences: ['Mercury', 'Saturn', 'Virgo'],
      seasonality: 'all',
      preparationNotes: 'Each family has their own recipe - proportions vary significantly.',
      technicalTips: 'Allow to cool completely before storing to maintain crunch.'
},
    chermoula: {
      name: 'Chermoula',
      description:
        'A vibrant Moroccan marinade and sauce made with fresh herbs, aromatic spices, lemon, and olive oil - widely used in North African cuisine',
      base: 'fresh herbs',
      keyIngredients: [
        'cilantro',
        'parsley',
        'olive oil',
        'lemon juice',
        'garlic',
        'cumin',
        'paprika',
        'coriander',
        'preserved lemon'
      ],
      culinaryUses: [
        'fish marinades',
        'tagine seasoning',
        'grilled meats',
        'roasted vegetables',
        'couscous dishes'
      ],
      variants: [
        'Red Chermoula (with paprika)',
        'Spicy Chermoula (with harissa)',
        'Preserved Lemon Chermoula'
      ],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.3,
        Air: 0.2,
        Fire: 0.1
},
      astrologicalInfluences: ['Venus', 'Neptune', 'Pisces'],
      seasonality: 'spring, summer',
      preparationNotes:
        'Traditionally prepared by hand-grinding all ingredients in a mortar and pestle to release maximum flavor. Best made fresh, but can be stored for up to a week refrigerated.',
      technicalTips: 'Balance acidity with enough olive oil for a smooth emulsion. For best results, allow flavors to marry for at least 30 minutes before using.',
    },
    peanut: {
      name: 'West African Peanut Sauce',
      description: 'Rich, creamy sauce made from ground peanuts, tomatoes, and spices',
      base: 'ground peanuts',
      keyIngredients: ['peanut butter', 'tomatoes', 'onions', 'ginger', 'chili peppers'],
      culinaryUses: ['stews', 'grilled meats', 'rice dishes', 'vegetable dishes'],
      variants: ['Mafe (Senegalese)', 'Groundnut Soup (Ghanaian)', 'Spicy Peanut Sauce'],
      elementalProperties: {
        Earth: 0.6,
        Fire: 0.2,
        Water: 0.2,
        Air: 0.0
},
      astrologicalInfluences: ['Jupiter', 'Saturn', 'Taurus'],
      seasonality: 'all',
      preparationNotes: 'The sauce thickens significantly as it cools.',
      technicalTips: 'Roast raw peanuts before grinding for deeper flavor.'
}
  },
  sauceRecommender: {
    forProtein: {
      chicken: ['chermoula', 'harissa', 'yassa sauce'],
      fish: ['chermoula', 'harissa', 'yassa sauce'],
      beef: ['berbere', 'peanut sauce', 'harissa'],
      lamb: ['harissa', 'chermoula', 'duqqa'],
      goat: ['berbere', 'peanut sauce', 'suya spice']
    },
    forVegetable: {
      okra: ['peanut sauce', 'palm oil sauce'],
      eggplant: ['chermoula', 'harissa', 'shito'],
      greens: ['peanut sauce', 'palm oil', 'berbere'],
      squash: ['moroccan spice', 'harissa', 'duqqa'],
      legumes: ['berbere', 'peanut sauce', 'zhug']
    },
    forCookingMethod: {
      grilling: ['suya spice', 'chermoula', 'pili pili'],
      stewing: ['berbere', 'peanut sauce', 'ras el hanout'],
      roasting: ['duqqa', 'harissa', 'chermoula'],
      frying: ['shito', 'harissa', 'berbere']
    },
    byAstrological: {
      fire: ['berbere', 'harissa', 'pili pili'],
      earth: ['peanut sauce', 'duqqa', 'suya spice'],
      air: ['chermoula', 'duqqa', 'moroccan spice'],
      water: ['palm oil sauce', 'peanut sauce', 'dipping sauce']
    },
    byRegion: {
      northAfrican: ['harissa', 'chermoula', 'ras el hanout'],
      westAfrican: ['peanut sauce', 'palm oil sauce', 'suya spice'],
      eastAfrican: ['berbere', 'pili pili', 'mchuzi mix'],
      southAfrican: ['chakalaka', 'monkey gland sauce', 'atchar']
    },
    byDietary: {
      vegetarian: ['chermoula', 'duqqa', 'harissa'],
      vegan: ['harissa', 'chermoula', 'peanut sauce'],
      glutenFree: ['pili pili', 'suya spice', 'chermoula'],
      dairyFree: ['harissa', 'duqqa', 'berbere']
    }
  },
  dishes: {
    breakfast: {
      all: [
        {
          name: 'Mandazi',
          description:
            'East African fried bread similar to doughnuts, lightly spiced with cardamom',
          cuisine: 'african',
          cookingMethods: ['frying', 'dough-kneading'],
          ingredients: [
            { name: 'flour', amount: '2', unit: 'cups', category: 'grain' },
            { name: 'sugar', amount: '1/4', unit: 'cup', category: 'sweetener' },
            {
              name: 'coconut milk',
              amount: '1',
              unit: 'cup',
              category: 'dairy',
              swaps: ['regular milk']
            },
            { name: 'yeast', amount: '2', unit: 'tsp', category: 'leavening' },
            { name: 'cardamom', amount: '1', unit: 'tsp', category: 'spice', swaps: ['cinnamon'] }
          ],
          substitutions: {
            'coconut milk': ['regular milk', 'almond milk'],
            cardamom: ['cinnamon', 'nutmeg']
          },
          servingSize: 12,
          allergens: ['gluten'],
          prepTime: '15 minutes',
          cookTime: '30 minutes',
          nutrition: {
            calories: 300,
            protein: 6,
            carbs: 50,
            fat: 8
},
          timeToMake: '45 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1
},
          astrologicalInfluences: [
            'Venus - The sweetness and cardamom fragrance',
            'Jupiter - The rising, expansive quality of the dough'
          ]
        },
        {
          name: 'Shakshuka',
          description: 'North African eggs poached in spiced tomato sauce with peppers and onions',
          cuisine: 'african',
          cookingMethods: ['poaching', 'simmering'],
          ingredients: [
            { name: 'eggs', amount: '4', unit: 'large', category: 'protein', swaps: ['firm tofu'] },
            { name: 'tomatoes', amount: '4', unit: 'medium', category: 'vegetable' },
            { name: 'onion', amount: '1', unit: 'large', category: 'vegetable' },
            {
              name: 'bell peppers',
              amount: '2',
              unit: 'medium',
              category: 'vegetable',
              swaps: ['roasted red peppers']
            },
            { name: 'garlic', amount: '3', unit: 'cloves', category: 'vegetable' },
            { name: 'cumin', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'paprika', amount: '1', unit: 'tsp', category: 'spice' }
          ],
          substitutions: {
            eggs: ['firm tofu'],
            'bell peppers': ['roasted red peppers']
          },
          servingSize: 4,
          allergens: ['eggs'],
          prepTime: '15 minutes',
          cookTime: '25 minutes',
          nutrition: {
            calories: 380,
            protein: 22,
            carbs: 15,
            fat: 28
},
          timeToMake: '40 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.4,
            Water: 0.3,
            Earth: 0.2,
            Air: 0.1
},
          astrologicalInfluences: [
            'Mars - The bold, spicy tomato base',
            'Sun - The bright egg yolks and life-giving energy'
          ]
        },
        {
          name: 'Ful Medames',
          description: 'Egyptian breakfast of stewed fava beans with olive oil, lemon, and herbs',
          cuisine: 'african',
          cookingMethods: ['stewing', 'mashing'],
          ingredients: [
            {
              name: 'fava beans',
              amount: '2',
              unit: 'cups',
              category: 'legume',
              swaps: ['canned fava beans']
            },
            {
              name: 'olive oil',
              amount: '3',
              unit: 'tbsp',
              category: 'oil',
              swaps: ['vegetable oil']
            },
            { name: 'lemon juice', amount: '2', unit: 'tbsp', category: 'condiment' },
            { name: 'garlic', amount: '2', unit: 'cloves', category: 'vegetable' },
            { name: 'cumin', amount: '1', unit: 'tsp', category: 'spice' }
          ],
          substitutions: {
            'fava beans': ['canned fava beans', 'broad beans'],
            'olive oil': ['vegetable oil', 'ghee']
          },
          servingSize: 4,
          allergens: ['legumes'],
          prepTime: '10 minutes',
          cookTime: '30 minutes',
          nutrition: {
            calories: 320,
            protein: 18,
            carbs: 45,
            fat: 12
},
          timeToMake: '40 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Earth: 0.5,
            Water: 0.3,
            Fire: 0.1,
            Air: 0.1
},
          astrologicalInfluences: [
            'Saturn - The grounding, sustaining energy of beans',
            'Mercury - The bright lemon and herb notes'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    lunch: {
      all: [
        {
          name: 'Jollof Rice',
          description:
            'One-pot West African rice dish with tomatoes and spices - a celebratory staple',
          cuisine: 'african',
          cookingMethods: ['simmering', 'one-pot cooking'],
          ingredients: [
            { name: 'rice', amount: '2', unit: 'cups', category: 'grain' },
            { name: 'tomato paste', amount: '1', unit: 'can', category: 'condiment' },
            { name: 'onions', amount: '2', unit: 'whole', category: 'vegetable' },
            { name: 'bell peppers', amount: '1', unit: 'whole', category: 'vegetable' },
            { name: 'garlic', amount: '3', unit: 'cloves', category: 'vegetable' },
            { name: 'ginger', amount: '1', unit: 'tbsp', category: 'spice' },
            {
              name: 'chicken broth',
              amount: '4',
              unit: 'cups',
              category: 'broth',
              swaps: ['vegetable broth']
            }
          ],
          substitutions: {
            'chicken broth': ['vegetable broth', 'beef broth'],
            'long grain rice': ['basmati rice', 'jasmine rice']
          },
          servingSize: 6,
          allergens: [],
          prepTime: '20 minutes',
          cookTime: '40 minutes',
          nutrition: {
            calories: 500,
            protein: 15,
            carbs: 90,
            fat: 10
},
          timeToMake: '60 minutes',
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.5,
            Earth: 0.3,
            Water: 0.1,
            Air: 0.1
},
          astrologicalInfluences: [
            'Sun - The vibrant red color and celebratory nature',
            'Mars - The spicy, bold character'
          ]
        },
        {
          name: 'Doro Wat',
          description: 'Spicy Ethiopian chicken stew with berbere spice and boiled eggs',
          cuisine: 'african',
          cookingMethods: ['stewing', 'sautéing', 'simmering'],
          ingredients: [
            {
              name: 'chicken legs',
              amount: '1',
              unit: 'kg',
              category: 'protein',
              swaps: ['chicken thighs']
            },
            {
              name: 'berbere spice',
              amount: '1/4',
              unit: 'cup',
              category: 'spice',
              swaps: ['mild paprika + cayenne']
            },
            { name: 'onions', amount: '3', unit: 'large', category: 'vegetable' },
            { name: 'garlic', amount: '8', unit: 'cloves', category: 'vegetable' },
            { name: 'ginger', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'eggs', amount: '6', unit: 'whole', category: 'protein' },
            {
              name: 'niter kibbeh',
              amount: '1/2',
              unit: 'cup',
              category: 'fat',
              swaps: ['ghee', 'butter']
            }
          ],
          substitutions: {
            'niter kibbeh': ['ghee', 'butter'],
            berbere: ['mix of paprika, cayenne, and warm spices'],
            'chicken legs': ['chicken thighs', 'chicken breast']
          },
          servingSize: 6,
          allergens: ['eggs', 'dairy'],
          prepTime: '45 minutes',
          cookTime: '75 minutes',
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 15,
            fat: 28
},
          timeToMake: '120 minutes',
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.6,
            Earth: 0.2,
            Water: 0.1,
            Air: 0.1
},
          astrologicalInfluences: [
            'Mars - The intense heat of berbere spice',
            'Saturn - The slow, transformative cooking process'
          ]
        },
        {
          name: 'Yassa Poulet',
          description: 'Senegalese marinated chicken with caramelized onions and lemon',
          cuisine: 'african',
          cookingMethods: ['marinating', 'grilling', 'braising'],
          ingredients: [
            {
              name: 'chicken',
              amount: '1',
              unit: 'whole',
              category: 'protein',
              swaps: ['chicken pieces']
            },
            { name: 'onions', amount: '4', unit: 'large', category: 'vegetable' },
            { name: 'lemon juice', amount: '1/2', unit: 'cup', category: 'acid' },
            {
              name: 'dijon mustard',
              amount: '2',
              unit: 'tbsp',
              category: 'condiment',
              swaps: ['yellow mustard']
            },
            { name: 'garlic', amount: '6', unit: 'cloves', category: 'vegetable' }
          ],
          substitutions: {
            'whole chicken': ['chicken pieces', 'chicken thighs'],
            'dijon mustard': ['yellow mustard', 'grain mustard']
          },
          servingSize: 6,
          allergens: ['mustard'],
          prepTime: '30 minutes',
          cookTime: '60 minutes',
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 25,
            fat: 22
},
          timeToMake: '90 minutes',
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.3,
            Earth: 0.3,
            Water: 0.3,
            Air: 0.1
},
          astrologicalInfluences: [
            'Mercury - The bright citrus notes',
            'Venus - The sweet caramelized onions'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    dinner: {
      all: [
        {
          name: 'Bobotie',
          description: 'South African curried meatloaf with egg custard topping',
          cuisine: 'african',
          cookingMethods: ['baking', 'sautéing'],
          ingredients: [
            {
              name: 'ground lamb',
              amount: '500',
              unit: 'g',
              category: 'protein',
              swaps: ['ground beef']
            },
            {
              name: 'bread',
              amount: '2',
              unit: 'slices',
              category: 'grain',
              swaps: ['gluten-free bread']
            },
            { name: 'milk', amount: '2', unit: 'cups', category: 'dairy' },
            { name: 'eggs', amount: '3', unit: 'large', category: 'protein' },
            { name: 'curry powder', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'raisins', amount: '1/2', unit: 'cup', category: 'fruit' }
          ],
          substitutions: {
            'ground lamb': ['ground beef', 'ground turkey'],
            bread: ['gluten-free bread', 'breadcrumbs']
          },
          servingSize: 8,
          allergens: ['dairy', 'eggs', 'wheat', 'tree nuts'],
          prepTime: '30 minutes',
          cookTime: '60 minutes',
          nutrition: {
            calories: 380,
            protein: 28,
            carbs: 25,
            fat: 20
},
          timeToMake: '90 minutes',
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Water: 0.2,
            Air: 0.1
},
          astrologicalInfluences: [
            'Jupiter - The complex spices and cultural fusion',
            'Moon - The comforting, nurturing quality'
          ]
        },
        {
          name: 'Ndolé',
          description: 'Cameroonian stew with bitter leaves and peanuts',
          cuisine: 'african',
          cookingMethods: ['stewing', 'simmering'],
          ingredients: [
            {
              name: 'bitter leaves',
              amount: '500',
              unit: 'g',
              category: 'vegetable',
              swaps: ['collard greens']
            },
            { name: 'beef', amount: '500', unit: 'g', category: 'protein' },
            { name: 'raw peanuts', amount: '2', unit: 'cups', category: 'protein' },
            {
              name: 'dried shrimp',
              amount: '100',
              unit: 'g',
              category: 'seafood',
              swaps: ['shrimp paste']
            },
            { name: 'stock', amount: '4', unit: 'cups', category: 'liquid' }
          ],
          substitutions: {
            'bitter leaves': ['collard greens', 'kale'],
            'dried shrimp': ['shrimp paste', 'fish sauce']
          },
          servingSize: 6,
          allergens: ['peanuts', 'shellfish'],
          prepTime: '45 minutes',
          cookTime: '90 minutes',
          nutrition: {
            calories: 520,
            protein: 42,
            carbs: 28,
            fat: 32
},
          timeToMake: '135 minutes',
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.6,
            Water: 0.2,
            Fire: 0.1,
            Air: 0.1
},
          astrologicalInfluences: [
            'Saturn - The bitterness and depth of flavor',
            'Jupiter - The richness of the peanuts'
          ]
        },
        {
          name: 'Maafe',
          description: 'West African peanut stew with meat and vegetables',
          cuisine: 'african',
          cookingMethods: ['stewing', 'simmering'],
          ingredients: [
            { name: 'lamb', amount: '500', unit: 'g', category: 'protein', swaps: ['chicken'] },
            { name: 'peanut butter', amount: '1', unit: 'cup', category: 'protein' },
            { name: 'sweet potatoes', amount: '2', unit: 'large', category: 'vegetable' },
            { name: 'tomatoes', amount: '3', unit: 'medium', category: 'vegetable' },
            { name: 'spinach', amount: '200', unit: 'g', category: 'vegetable' }
          ],
          substitutions: {
            lamb: ['chicken', 'beef'],
            'sweet potatoes': ['regular potatoes', 'butternut squash']
          },
          servingSize: 6,
          allergens: ['peanuts'],
          prepTime: '25 minutes',
          cookTime: '50 minutes',
          nutrition: {
            calories: 520,
            protein: 38,
            carbs: 35,
            fat: 28
},
          timeToMake: '75 minutes',
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.5,
            Water: 0.2,
            Fire: 0.2,
            Air: 0.1
},
          astrologicalInfluences: [
            'Jupiter - The richness and abundance',
            'Taurus - The earthy, satisfying quality'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    dessert: {
      all: [
        {
          name: 'Malva Pudding',
          description: 'Sweet and sticky South African baked dessert with a caramelized exterior',
          cuisine: 'african',
          cookingMethods: ['baking', 'sauce-making'],
          ingredients: [
            { name: 'flour', amount: '1', unit: 'cup', category: 'grain' },
            { name: 'sugar', amount: '1', unit: 'cup', category: 'sweetener' },
            { name: 'milk', amount: '1', unit: 'cup', category: 'dairy' },
            { name: 'eggs', amount: '2', unit: 'whole', category: 'protein' },
            {
              name: 'apricot jam',
              amount: '1/2',
              unit: 'cup',
              category: 'spread',
              swaps: ['peach jam']
            },
            { name: 'butter', amount: '1/2', unit: 'cup', category: 'dairy' },
            { name: 'vanilla extract', amount: '1', unit: 'tsp', category: 'flavoring' },
            { name: 'vinegar', amount: '1', unit: 'tsp', category: 'acid' }
          ],
          substitutions: {
            'apricot jam': ['peach jam', 'orange marmalade'],
            'heavy cream': ['evaporated milk'],
            'white vinegar': ['apple cider vinegar']
          },
          servingSize: 8,
          allergens: ['eggs', 'dairy', 'gluten'],
          prepTime: '20 minutes',
          cookTime: '45 minutes',
          nutrition: {
            calories: 450,
            protein: 8,
            carbs: 70,
            fat: 15
},
          timeToMake: '65 minutes',
          season: ['all'],
          mealType: ['dessert'],
          elementalProperties: {
            Fire: 0.3,
            Earth: 0.3,
            Water: 0.3,
            Air: 0.1
},
          astrologicalInfluences: [
            'Venus - The sweet, indulgent nature',
            'Sun - The warm, comforting quality'
          ]
        },
        {
          name: 'Coconut Chin Chin',
          description: 'West African fried pastry snack with coconut',
          cuisine: 'african',
          cookingMethods: ['frying', 'dough-making'],
          ingredients: [
            { name: 'flour', amount: '3', unit: 'cups', category: 'grain' },
            {
              name: 'coconut',
              amount: '1',
              unit: 'cup',
              category: 'nut',
              swaps: ['desiccated coconut']
            },
            { name: 'sugar', amount: '1/2', unit: 'cup', category: 'sweetener' },
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein' },
            { name: 'nutmeg', amount: '1/2', unit: 'tsp', category: 'spice', swaps: ['cinnamon'] }
          ],
          substitutions: {
            coconut: ['desiccated coconut', 'coconut flour'],
            nutmeg: ['cinnamon', 'cardamom']
          },
          servingSize: 8,
          allergens: ['eggs', 'wheat'],
          prepTime: '30 minutes',
          cookTime: '20 minutes',
          nutrition: {
            calories: 300,
            protein: 6,
            carbs: 45,
            fat: 12
},
          timeToMake: '50 minutes',
          season: ['all'],
          mealType: ['dessert', 'snack'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1
},
          astrologicalInfluences: [
            'Venus - The sweet indulgence',
            'Mercury - The crisp texture and intricate shapes'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    }
  },
  cookingTechniques: [
    {
      name: 'Slow Simmering',
      description: 'Long, gentle cooking of stews and sauces to develop deep flavors',
      elementalProperties: { Water: 0.5, Earth: 0.3, Fire: 0.2, Air: 0.0 },
      toolsRequired: ['heavy-bottomed pot', 'wooden spoon', 'heat diffuser'],
      bestFor: ['stews', 'sauces', 'tough cuts of meat', 'legumes'],
      difficulty: 'easy'
},
    {
      name: 'Hand Pounding',
      description:
        'Traditional technique using mortar and pestle to create pastes and spice blends',
      elementalProperties: { Earth: 0.6, Fire: 0.2, Water: 0.1, Air: 0.1 },
      toolsRequired: ['mortar and pestle', 'sieve'],
      bestFor: ['spice blends', 'sauces', 'pounded yam', 'fufu'],
      difficulty: 'medium'
},
    {
      name: 'Clay Pot Cooking',
      description: 'Slow cooking in unglazed clay pots that enhance flavors and maintain moisture',
      elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.2, Air: 0.0 },
      toolsRequired: ['clay pot', 'heat diffuser', 'wooden spoon'],
      bestFor: ['stews', 'tagines', 'rice dishes', 'beans'],
      difficulty: 'medium'
},
    {
      name: 'Charcoal Grilling',
      description: 'Direct heat cooking over open charcoal for smoky flavor',
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0.0 },
      toolsRequired: ['charcoal grill', 'skewers', 'tongs'],
      bestFor: ['suya', 'kebabs', 'whole fish', 'vegetables'],
      difficulty: 'easy'
},
    {
      name: 'Fermentation',
      description:
        'Traditional preservation technique that develops complex flavors and probiotics',
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      toolsRequired: ['clay pots', 'wooden tools', 'weights'],
      bestFor: ['injera', 'ogi', 'garri', 'fermented locust beans'],
      difficulty: 'hard'
}
  ],
  regionalCuisines: {
    northAfrican: {
      name: 'North African Cuisine',
      description:
        'Mediterranean and Arabic influenced cuisine featuring tagines, couscous, and aromatic spices',
      signature: ['tagine', 'couscous', 'harissa', 'shakshuka'],
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
      astrologicalInfluences: ['Mars', 'Venus', 'Mercury'],
      seasonality: 'all'
},
    westAfrican: {
      name: 'West African Cuisine',
      description: 'Bold, spicy cuisine with staples like rice, cassava, plantains and palm oil',
      signature: ['jollof rice', 'fufu', 'peanut stew', 'egusi soup'],
      elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
      astrologicalInfluences: ['Jupiter', 'Saturn', 'Mars'],
      seasonality: 'all'
},
    eastAfrican: {
      name: 'East African Cuisine',
      description: 'Diverse cuisine influenced by Arabic, Indian and indigenous traditions',
      signature: ['injera with wat', 'ugali', 'pilau', 'berbere spice'],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Sun', 'Mars', 'Saturn'],
      seasonality: 'all'
},
    southernAfrican: {
      name: 'Southern African Cuisine',
      description: 'Hearty cuisine combining indigenous, Dutch, Malaysian and British influences',
      signature: ['bobotie', 'biltong', 'pap', 'chakalaka'],
      elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Saturn', 'Venus', 'Jupiter'],
      seasonality: 'all'
}
  },
  elementalProperties: {
    Earth: 0.4,
    Fire: 0.3,
    Water: 0.2,
    Air: 0.1
}
};
