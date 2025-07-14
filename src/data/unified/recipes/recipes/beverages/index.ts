import { Recipe } from '../../../types/recipe';

export const beverageRecipes: Recipe[] = [
  {
    name: 'Cucumber Agua Fresca',
    description: 'A refreshing Mexican-inspired drink made with fresh cucumbers and mint.',
    ingredients: [
      { name: 'English cucumbers with skin', amount: 6, unit: '', notes: '12 ounces each, seeded and cut into 1-inch pieces' },
      { name: 'lime juice', amount: 1, unit: 'cup', notes: 'approximately 6 limes' },
      { name: 'mint leaves', amount: 2, unit: 'cups', notes: 'approximately ½ ounce' },
      { name: 'water', amount: 3, unit: 'cups' },
      { name: 'agave', amount: 0.333, unit: 'cup' },
      { name: 'limes', amount: 2, unit: '', notes: 'sliced for garnish' }
    ],
    nutrition: {
      calories: 45,
      protein: 1,
      carbs: 11,
      fat: 0,
      vitamins: ['C', 'K'],
      minerals: ['Potassium']
    },
    timeToMake: '15 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.1,
      Water: 0.6,
      Air: 0.2
    },
    instructions: [
      'Combine cucumbers, lime juice, mint, water, and agave in blender and puree until smooth.',
      'Strain puree through sieve and serve in glasses with slice of lime.'
    ]
  },
  {
    name: 'Pomegranate, Blueberry, and Ginger Elixir',
    description: 'A vibrant and antioxidant-rich beverage combining sweet and spicy flavors.',
    ingredients: [
      { name: 'pomegranate juice', amount: 4, unit: 'cups' },
      { name: 'blueberries', amount: 1, unit: 'pint', notes: 'washed and stemmed' },
      { name: 'ginger juice', amount: 0.25, unit: 'cup', notes: 'approximately 3-inch piece' },
      { name: 'filtered water', amount: 1, unit: 'cup' },
      { name: 'agave', amount: 2, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 120,
      protein: 1,
      carbs: 29,
      fat: 0,
      vitamins: ['C', 'K'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '10 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.1,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'Combine pomegranate juice, blueberries, ginger juice, and agave in VitaMix and puree.',
      'Do not strain. Serve over ice.'
    ]
  },
  {
    name: 'Hemp Seed Milk',
    description: 'A creamy plant-based milk rich in omega fatty acids.',
    ingredients: [
      { name: 'hemp seeds', amount: 1, unit: 'cup' },
      { name: 'water', amount: 4, unit: 'cups' },
      { name: 'dates', amount: 2, unit: '', notes: 'pitted' },
      { name: 'vanilla extract', amount: 0.5, unit: 'tsp' },
      { name: 'sea salt', amount: 0.125, unit: 'tsp' }
    ],
    nutrition: {
      calories: 110,
      protein: 6,
      carbs: 3,
      fat: 9,
      vitamins: ['E', 'B1'],
      minerals: ['Iron', 'Zinc', 'Magnesium']
    },
    timeToMake: '10 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'Put all ingredients into high-speed blender and blend until smooth.',
      'Served milk chilled or warmed.'
    ]
  },
  {
    name: 'Golden Turmeric Milk',
    description: 'An anti-inflammatory almond milk infused with fresh turmeric and warming spices.',
    ingredients: [
      { name: 'blanched almonds', amount: 4, unit: 'cups' },
      { name: 'fresh turmeric', amount: 4, unit: 'oz' },
      { name: 'fresh ginger', amount: 2, unit: 'oz' },
      { name: 'water', amount: 10, unit: 'cups' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp', notes: 'ground' },
      { name: 'cinnamon', amount: 0.25, unit: 'tsp' },
      { name: 'maple syrup', amount: 1.5, unit: 'tbsp', notes: 'or to taste' }
    ],
    nutrition: {
      calories: 120,
      protein: 4,
      carbs: 7,
      fat: 9,
      vitamins: ['E', 'B2'],
      minerals: ['Calcium', 'Iron', 'Magnesium']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.2
    },
    instructions: [
      'In 2 batches, puree almonds, turmeric, and ginger with water in Vitamix until smooth. Strain milk through chinois.',
      'Transfer milk to 1-gallon pot. Bring milk mixture to simmer over medium flame (to infuse flavors). Turn off heat and add pepper, cinnamon, and maple syrup to taste.'
    ]
  },
  {
    name: 'Pineapple Turmeric Smoothie',
    description: 'A tropical and anti-inflammatory smoothie featuring pineapple, banana, and turmeric.',
    ingredients: [
      { name: 'frozen pineapple chunks', amount: 2, unit: 'cups' },
      { name: 'ripe banana', amount: 1, unit: '' },
      { name: 'almond milk', amount: 1, unit: 'cup', swaps: ['coconut milk', 'oat milk'] },
      { name: 'fresh turmeric, grated', amount: 1, unit: 'tsp', swaps: ['ground turmeric'] },
      { name: 'honey', amount: 1, unit: 'tbsp', swaps: ['maple syrup', 'agave nectar'] },
      { name: 'vanilla extract', amount: 0.5, unit: 'tsp' },
      { name: 'ice cubes', amount: 1, unit: 'cup' }
    ],
    nutrition: {
      calories: 240,
      protein: 4,
      carbs: 56,
      fat: 2,
      vitamins: ['C', 'B6', 'E'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '5 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Breakfast', 'Snack'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a blender, combine frozen pineapple chunks, ripe banana, almond milk, grated turmeric, honey, and vanilla extract.',
      'Add ice cubes and blend until smooth and creamy.',
      'Pour into glasses and serve immediately, garnished with a sprinkle of ground turmeric if desired.'
    ]
  },
  {
    name: 'Watermelon Mint Cooler',
    description: 'A refreshing and hydrating drink made with juicy watermelon and fresh mint.',
    ingredients: [
      { name: 'watermelon, cubed', amount: 4, unit: 'cups' },
      { name: 'fresh mint leaves', amount: 0.5, unit: 'cup' },
      { name: 'lime, juiced', amount: 1, unit: '' },
      { name: 'honey', amount: 2, unit: 'tbsp', swaps: ['agave nectar'] },
      { name: 'water', amount: 1, unit: 'cup' },
      { name: 'ice cubes', amount: 2, unit: 'cups' }
    ],
    nutrition: {
      calories: 120,
      protein: 2,
      carbs: 32,
      fat: 0,
      vitamins: ['A', 'C'],
      minerals: ['Potassium', 'Magnesium']
    },
    timeToMake: '10 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.2,
      Water: 0.6,
      Air: 0.1
    },
    instructions: [
      'In a blender, combine watermelon, mint leaves, lime juice, honey, and water.',
      'Blend until smooth.',
      'Pour the mixture over ice cubes in serving glasses.',
      'Garnish with additional mint leaves, if desired.',
      'Serve chilled and enjoy!'
    ]
  },
  {
    name: 'Green Goddess Smoothie',
    description: 'A nutrient-packed green smoothie with spinach, avocado, and tropical fruits.',
    ingredients: [
      { name: 'baby spinach', amount: 2, unit: 'cups' },
      { name: 'ripe avocado', amount: 0.5, unit: '' },
      { name: 'frozen mango chunks', amount: 1, unit: 'cup' },
      { name: 'frozen pineapple chunks', amount: 1, unit: 'cup' },
      { name: 'coconut water', amount: 1, unit: 'cup' },
      { name: 'lime juice', amount: 1, unit: 'tbsp' },
      { name: 'ginger, grated', amount: 1, unit: 'tsp' },
      { name: 'honey', amount: 1, unit: 'tbsp', swaps: ['agave nectar'] }
    ],
    nutrition: {
      calories: 280,
      protein: 5,
      carbs: 45,
      fat: 12,
      vitamins: ['A', 'C', 'K', 'E'],
      minerals: ['Potassium', 'Magnesium']
    },
    timeToMake: '5 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast', 'Snack'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'Combine all ingredients in a high-speed blender.',
      'Blend until smooth and creamy.',
      'Taste and adjust sweetness if needed.',
      'Pour into glasses and serve immediately.'
    ]
  },
  {
    name: 'Hibiscus Iced Tea',
    description: 'A tart and refreshing herbal tea made with hibiscus flowers and subtle spices.',
    ingredients: [
      { name: 'dried hibiscus flowers', amount: 0.5, unit: 'cup' },
      { name: 'cinnamon stick', amount: 1, unit: '' },
      { name: 'fresh ginger, sliced', amount: 1, unit: 'inch' },
      { name: 'water', amount: 8, unit: 'cups' },
      { name: 'honey', amount: 0.25, unit: 'cup', swaps: ['agave nectar'] },
      { name: 'lime juice', amount: 2, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 45,
      protein: 0,
      carbs: 12,
      fat: 0,
      vitamins: ['C'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '25 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.1,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'In a large pot, bring water to a boil.',
      'Add hibiscus flowers, cinnamon stick, and ginger. Turn off heat and let steep for 20 minutes.',
      'Strain the tea into a pitcher and discard the solids.',
      'Stir in honey and lime juice until honey dissolves.',
      'Refrigerate until chilled.',
      'Serve over ice, garnished with lime slices if desired.'
    ]
  },
  {
    name: 'Watermelon Juice',
    description: 'A refreshing and hydrating summer drink packed with natural electrolytes.',
    ingredients: [
      { name: 'watermelon', amount: 6, unit: 'cups', notes: 'cubed' },
      { name: 'lime juice', amount: 1, unit: 'tbsp' },
      { name: 'mint leaves', amount: 0.25, unit: 'cup', notes: 'optional, for garnish' },
      { name: 'ice cubes', amount: 2, unit: 'cups', notes: 'for serving' }
    ],
    nutrition: {
      calories: 45,
      protein: 1,
      carbs: 11,
      fat: 0,
      vitamins: ['A', 'C'],
      minerals: ['Potassium', 'Magnesium']
    },
    timeToMake: '5 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.1,
      Water: 0.7,
      Air: 0.1
    },
    instructions: [
      'Add watermelon cubes to a blender.',
      'Blend until smooth.',
      'Strain through a fine-mesh sieve if desired.',
      'Stir in lime juice.',
      'Serve over ice and garnish with mint if desired.'
    ]
  },
  {
    name: 'Green Vitality Juice',
    description: 'A nutrient-rich green juice blend that supports detoxification and energy.',
    ingredients: [
      { name: 'green apples', amount: 2, unit: '', notes: 'cored and cut into chunks' },
      { name: 'celery stalks', amount: 4, unit: '' },
      { name: 'cucumber', amount: 1, unit: '', notes: 'large' },
      { name: 'spinach', amount: 2, unit: 'cups' },
      { name: 'lemon', amount: 1, unit: '', notes: 'peeled' },
      { name: 'ginger', amount: 1, unit: 'inch' },
      { name: 'parsley', amount: 0.5, unit: 'cup' }
    ],
    nutrition: {
      calories: 120,
      protein: 3,
      carbs: 29,
      fat: 0,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iron', 'Potassium']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.2,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'Wash all produce thoroughly.',
      'Cut produce into pieces that will fit through your juicer.',
      'Feed ingredients through the juicer, alternating leafy greens with harder vegetables.',
      'Stir juice and serve immediately.',
      'Can be stored in an airtight container for up to 24 hours.'
    ]
  },
  {
    name: 'Beet and Apple Juice',
    description: 'A vibrant, earthy juice that supports liver function and blood building.',
    ingredients: [
      { name: 'beets', amount: 2, unit: 'medium', notes: 'peeled and quartered' },
      { name: 'apples', amount: 2, unit: '', notes: 'cored and quartered' },
      { name: 'carrots', amount: 2, unit: 'large' },
      { name: 'ginger', amount: 1, unit: 'inch' },
      { name: 'lemon', amount: 0.5, unit: '', notes: 'peeled' }
    ],
    nutrition: {
      calories: 130,
      protein: 2,
      carbs: 31,
      fat: 0,
      vitamins: ['A', 'C', 'B6'],
      minerals: ['Iron', 'Folate', 'Potassium']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Wash and prepare all produce.',
      'Feed ingredients through juicer, alternating between hard and soft ingredients.',
      'Stir juice to combine well.',
      'Serve immediately over ice if desired.'
    ]
  },
  {
    name: 'Celery-Carrot-Ginger Juice',
    description: 'A cleansing and anti-inflammatory juice blend rich in minerals and antioxidants.',
    ingredients: [
      { name: 'celery stalks', amount: 8, unit: '', notes: 'washed' },
      { name: 'carrots', amount: 4, unit: 'large', notes: 'peeled' },
      { name: 'ginger', amount: 2, unit: 'inch', notes: 'peeled' },
      { name: 'lemon', amount: 0.5, unit: '', notes: 'peeled' },
      { name: 'green apple', amount: 1, unit: '', notes: 'cored and quartered' }
    ],
    nutrition: {
      calories: 95,
      protein: 2,
      carbs: 22,
      fat: 0,
      vitamins: ['A', 'K', 'C'],
      minerals: ['Potassium', 'Sodium', 'Folate']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Wash all produce thoroughly.',
      'Cut ingredients into juicer-friendly pieces.',
      'Process through juicer, alternating between celery and carrots.',
      'Add ginger and lemon last.',
      'Stir well before serving.'
    ]
  },
  {
    name: 'Master Cleanse',
    description: 'A traditional cleansing drink combining citrus, maple syrup, and cayenne.',
    ingredients: [
      { name: 'filtered water', amount: 10, unit: 'oz', notes: 'room temperature or warm' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp', notes: 'freshly squeezed' },
      { name: 'maple syrup', amount: 2, unit: 'tbsp', notes: 'grade B or dark' },
      { name: 'cayenne pepper', amount: 0.1, unit: 'tsp', notes: 'or to taste' }
    ],
    nutrition: {
      calories: 110,
      protein: 0,
      carbs: 28,
      fat: 0,
      vitamins: ['C', 'B6'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '5 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.4,
      Earth: 0.1,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'In a glass, combine filtered water with fresh lemon juice.',
      'Stir in maple syrup until fully dissolved.',
      'Add cayenne pepper and stir well.',
      'Adjust ingredients to taste if needed.',
      'Serve immediately.'
    ]
  },
  {
    name: 'Sweet Citrus Brew',
    description: 'A refreshing citrus-infused tea blend with subtle sweetness.',
    ingredients: [
      { name: 'green tea bags', amount: 4, unit: '' },
      { name: 'orange', amount: 1, unit: '', notes: 'sliced' },
      { name: 'lemon', amount: 1, unit: '', notes: 'sliced' },
      { name: 'honey', amount: 2, unit: 'tbsp', swaps: ['agave nectar'] },
      { name: 'fresh mint leaves', amount: 0.25, unit: 'cup' },
      { name: 'filtered water', amount: 4, unit: 'cups' }
    ],
    nutrition: {
      calories: 40,
      protein: 0,
      carbs: 10,
      fat: 0,
      vitamins: ['C', 'A'],
      minerals: ['Potassium']
    },
    timeToMake: '20 minutes',
    season: ['spring', 'summer'],
    cuisine: 'HSCA',
    mealType: ['Beverage'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.1,
      Water: 0.4,
      Air: 0.3
    },
    instructions: [
      'Bring water to just below boiling.',
      'Add tea bags and steep for 3-4 minutes.',
      'Remove tea bags and add honey, stirring until dissolved.',
      'Add citrus slices and mint leaves.',
      'Let cool to room temperature.',
      'Serve over ice and garnish with additional citrus slices if desired.'
    ]
  }
]; 