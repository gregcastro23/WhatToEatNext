import { Recipe } from '../../../types/recipe';

export const condimentRecipes: Recipe[] = [
  {
    name: 'Roasted Dulse Condiment',
    description: 'A savory seaweed-based condiment perfect for adding umami flavor to dishes.',
    ingredients: [
      { name: 'dulse', amount: 0.5, unit: 'cup', swaps: ['nori'] },
      { name: 'sesame seeds, toasted', amount: 0.5, unit: 'cup' }
    ],
    nutrition: {
      calories: 140,
      protein: 5,
      carbs: 8,
      fat: 11,
      vitamins: ['B12', 'A'],
      minerals: ['Iodine', 'Iron', 'Magnesium']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Condiment'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 350° F. Place dulse on half sheet pan with parchment and bake for 10 minutes.',
      'Combine toasted sesame seeds with roasted dulse in suribachi and grind until most of seeds are broken.',
      'Serve as a condiment over cooked millet.',
      'Store excess in air-tight glass container.'
    ]
  },
  {
    name: 'Nori Condiment',
    description: 'A flavorful seaweed condiment with a sweet and savory profile.',
    ingredients: [
      { name: 'toasted nori sheets', amount: 7, unit: 'sheets' },
      { name: 'water', amount: 1, unit: 'cup' },
      { name: 'shoyu', amount: 2, unit: 'tbsp' },
      { name: 'brown rice syrup', amount: 2, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 45,
      protein: 2,
      carbs: 9,
      fat: 0,
      vitamins: ['B12', 'A'],
      minerals: ['Iodine', 'Iron']
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Condiment'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.5,
      Air: 0.1
    },
    instructions: [
      'In 2-quart saucepan, add nori, water, shoyu, and rice syrup.',
      'Bring to boil, reduce to simmer, and stir often. Let simmer until all the liquid is absorbed.',
      'Serve as condiment on grains or beans.'
    ]
  },
  {
    name: 'Fresh Herb Dressing',
    description: 'A light, herb-infused dressing perfect for salads or vegetables.',
    ingredients: [
      { name: 'vegetable stock', amount: 2, unit: 'cups' },
      { name: 'shallots', amount: 2, unit: 'tbsp', notes: 'minced' },
      { name: 'extra-virgin olive oil', amount: 1, unit: 'tbsp' },
      { name: 'prepared mustard', amount: 2, unit: 'tsp' },
      { name: 'orange juice', amount: 2, unit: 'tbsp' },
      { name: 'rice syrup', amount: 1.25, unit: 'tbsp' },
      { name: 'fresh herbs', amount: 2, unit: 'tbsp', notes: 'chopped basil, tarragon, or dill' }
    ],
    nutrition: {
      calories: 45,
      protein: 1,
      carbs: 6,
      fat: 3,
      vitamins: ['C', 'K'],
      minerals: ['Iron']
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Sauce'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.3
    },
    instructions: [
      'In small sauce pan, reduce stock to 6 tablespoons and set aside to cool.',
      'Combine stock with shallots, olive oil, mustard, orange juice, rice syrup and herbs in blender and puree until emulsified.'
    ]
  },
  {
    name: 'Smoky Cilantro-Lime Vinaigrette',
    description: 'A zesty and smoky vinaigrette perfect for salads or as a marinade.',
    ingredients: [
      { name: 'shallots, chopped', amount: 0.333, unit: 'cup' },
      { name: 'garlic cloves', amount: 2, unit: '' },
      { name: 'smoked paprika', amount: 1, unit: 'tsp' },
      { name: 'ground cumin', amount: 0.5, unit: 'tsp' },
      { name: 'lime juice', amount: 0.25, unit: 'cup' },
      { name: 'cilantro leaves', amount: 0.333, unit: 'cup' },
      { name: 'canola oil', amount: 0.333, unit: 'cup' },
      { name: 'water', amount: 2, unit: 'tbsp' },
      { name: 'honey', amount: 2, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'ground black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 120,
      protein: 0,
      carbs: 6,
      fat: 12,
      vitamins: ['C'],
      minerals: ['Potassium']
    },
    timeToMake: '10 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dressing'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Combine all ingredients in a blender or food processor.',
      'Blend until smooth and well combined.',
      'Taste and adjust seasoning if needed.',
      'Store in an airtight container in the refrigerator for up to 1 week.'
    ]
  },
  {
    name: 'Spicy Mango Chutney',
    description: 'A sweet and spicy condiment perfect for curries, sandwiches, or as a dipping sauce.',
    ingredients: [
      { name: 'ripe mangoes, diced', amount: 4, unit: 'cups' },
      { name: 'red onion, finely chopped', amount: 1, unit: '' },
      { name: 'ginger, minced', amount: 2, unit: 'tbsp' },
      { name: 'garlic cloves, minced', amount: 3, unit: '' },
      { name: 'red chili peppers, seeded and minced', amount: 2, unit: '' },
      { name: 'apple cider vinegar', amount: 0.5, unit: 'cup' },
      { name: 'brown sugar', amount: 0.5, unit: 'cup' },
      { name: 'mustard seeds', amount: 1, unit: 'tsp' },
      { name: 'ground cumin', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 1, unit: 'tsp' }
    ],
    nutrition: {
      calories: 80,
      protein: 1,
      carbs: 20,
      fat: 0,
      vitamins: ['A', 'C'],
      minerals: ['Potassium']
    },
    timeToMake: '45 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Condiment'],
    elementalBalance: {
      Fire: 0.4,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'In a large saucepan, combine all ingredients.',
      'Bring to a boil over medium-high heat, stirring occasionally.',
      'Reduce heat and simmer for 30-35 minutes, until mangoes are soft and mixture has thickened.',
      'Let cool completely.',
      'Store in airtight containers in the refrigerator for up to 2 weeks.'
    ]
  },
  {
    name: 'Ginger-Scallion Sauce',
    description: 'A vibrant and aromatic sauce perfect for noodles, rice, or grilled proteins.',
    ingredients: [
      { name: 'scallions, finely chopped', amount: 2, unit: 'cups' },
      { name: 'fresh ginger, minced', amount: 0.25, unit: 'cup' },
      { name: 'neutral oil', amount: 0.5, unit: 'cup' },
      { name: 'soy sauce', amount: 2, unit: 'tbsp' },
      { name: 'rice vinegar', amount: 1, unit: 'tbsp' },
      { name: 'sesame oil', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 90,
      protein: 1,
      carbs: 2,
      fat: 9,
      vitamins: ['K', 'C'],
      minerals: ['Iron']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Condiment'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Heat neutral oil in a small saucepan until just smoking.',
      'Place scallions and ginger in a heat-proof bowl.',
      'Carefully pour hot oil over the scallions and ginger (it will sizzle).',
      'Stir in soy sauce, rice vinegar, sesame oil, and salt.',
      'Let cool to room temperature.',
      'Store in an airtight container in the refrigerator for up to 1 week.'
    ]
  },
  {
    name: 'Carrot-Ginger Dressing',
    description: 'A light and refreshing Japanese-inspired dressing perfect for salads.',
    ingredients: [
      { name: 'carrots, roughly chopped', amount: 2, unit: 'medium' },
      { name: 'fresh ginger, peeled', amount: 2, unit: 'inches' },
      { name: 'yellow onion, chopped', amount: 0.25, unit: 'cup' },
      { name: 'rice vinegar', amount: 0.25, unit: 'cup' },
      { name: 'sesame oil', amount: 2, unit: 'tbsp' },
      { name: 'neutral oil', amount: 0.25, unit: 'cup' },
      { name: 'miso paste', amount: 1, unit: 'tbsp' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
      { name: 'water', amount: 2, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 70,
      protein: 1,
      carbs: 5,
      fat: 6,
      vitamins: ['A', 'C'],
      minerals: ['Potassium']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dressing'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Combine carrots, ginger, and onion in a food processor. Process until finely chopped.',
      'Add remaining ingredients and process until smooth.',
      'If needed, thin with additional water to reach desired consistency.',
      'Store in an airtight container in the refrigerator for up to 1 week.'
    ]
  },
  {
    name: 'Horseradish and Lemon Condiment',
    description: 'A zesty, bright condiment that combines the heat of fresh horseradish with citrus notes.',
    ingredients: [
      { name: 'fresh horseradish root', amount: 8, unit: 'oz', notes: 'peeled and finely grated' },
      { name: 'lemons', amount: 2, unit: '', notes: 'juice and zest' },
      { name: 'apple cider vinegar', amount: 2, unit: 'tbsp' },
      { name: 'olive oil', amount: 1, unit: 'tbsp' },
      { name: 'sea salt', amount: 0.5, unit: 'tsp' },
      { name: 'honey', amount: 1, unit: 'tsp', notes: 'optional' }
    ],
    nutrition: {
      calories: 25,
      protein: 1,
      carbs: 5,
      fat: 1,
      vitamins: ['C'],
      minerals: ['Potassium', 'Calcium']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Condiment'],
    elementalBalance: {
      Fire: 0.6,
      Earth: 0.1,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Peel and finely grate the fresh horseradish root.',
      'Zest the lemons, then juice them.',
      'In a bowl, combine grated horseradish, lemon zest, and lemon juice.',
      'Add apple cider vinegar and olive oil.',
      'Season with sea salt.',
      'If desired, add honey to balance the heat.',
      'Mix well and let stand for 10 minutes to allow flavors to meld.',
      'Store in an airtight container in the refrigerator for up to 2 weeks.'
    ]
  }
]; 