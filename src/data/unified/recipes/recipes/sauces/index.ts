import { Recipe } from '../../../types/recipe';

export const sauceRecipes: Recipe[] = [
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
    mealType: ['Sauce', 'Dressing'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Combine shallots, garlic, smoked paprika, cumin, lime juice, cilantro, canola oil, water, honey, salt and pepper in a blender.',
      'Blend until smooth and emulsified.'
    ]
  },
  {
    name: 'Classic Pesto',
    description: 'Fresh and vibrant basil pesto perfect for pasta, sandwiches, or as a dip.',
    ingredients: [
      { name: 'fresh basil leaves', amount: 2, unit: 'cups' },
      { name: 'pine nuts', amount: 0.333, unit: 'cup', swaps: ['walnuts', 'almonds'] },
      { name: 'garlic cloves', amount: 2, unit: '' },
      { name: 'Parmesan cheese, grated', amount: 0.5, unit: 'cup' },
      { name: 'extra virgin olive oil', amount: 0.5, unit: 'cup' },
      { name: 'lemon juice', amount: 1, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 150,
      protein: 3,
      carbs: 2,
      fat: 15,
      vitamins: ['K', 'A'],
      minerals: ['Iron', 'Calcium']
    },
    timeToMake: '15 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Sauce'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.3
    },
    instructions: [
      'Toast pine nuts in a dry skillet over medium heat until lightly golden and fragrant, about 3-5 minutes. Let cool.',
      'In a food processor, combine basil, cooled pine nuts, and garlic. Pulse until coarsely chopped.',
      'Add Parmesan cheese, olive oil, lemon juice, salt, and pepper.',
      'Process until smooth, scraping down the sides as needed.',
      'Taste and adjust seasoning if needed.',
      'Store in an airtight container in the refrigerator for up to 1 week, or freeze for up to 3 months.'
    ]
  },
  {
    name: 'Horseradish Cashew Sauce',
    description: 'A creamy, dairy-free sauce with a spicy kick from fresh horseradish.',
    ingredients: [
      { name: 'cashews', amount: 0.5, unit: 'cup', notes: 'soaked overnight and drained' },
      { name: 'horseradish', amount: 0.25, unit: 'cup', notes: 'peeled and roughly chopped' },
      { name: 'white miso', amount: 0.25, unit: 'cup' },
      { name: 'water', amount: 0.75, unit: 'cup' },
      { name: 'garlic', amount: 2, unit: 'cloves' },
      { name: 'lemon juice', amount: 0.25, unit: 'cup' },
      { name: 'brown rice vinegar', amount: 1, unit: 'tbsp' },
      { name: 'umeboshi paste', amount: 1, unit: 'tbsp' },
      { name: 'Dijon mustard', amount: 1, unit: 'tsp' }
    ],
    nutrition: {
      calories: 90,
      protein: 3,
      carbs: 8,
      fat: 6,
      vitamins: ['C', 'B6'],
      minerals: ['Magnesium', 'Zinc']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Sauce'],
    elementalBalance: {
      Fire: 0.4,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Combine all ingredients in a high-speed blender.',
      'Blend until completely smooth and creamy, about 2-3 minutes.',
      'If needed, add more water tablespoon by tablespoon to reach desired consistency.',
      'Taste and adjust seasoning if needed.',
      'Store in an airtight container in the refrigerator for up to 1 week.'
    ]
  },
  {
    name: 'Honey-Balsamic Dressing',
    description: 'A sweet and tangy dressing perfect for summer salads and grilled fruits.',
    ingredients: [
      { name: 'honey', amount: 2, unit: 'tbsp' },
      { name: 'balsamic vinegar', amount: 2, unit: 'tbsp' },
      { name: 'extra virgin olive oil', amount: 3, unit: 'tbsp' },
      { name: 'sea salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 90,
      protein: 0,
      carbs: 12,
      fat: 7,
      vitamins: [],
      minerals: []
    },
    timeToMake: '5 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Sauce', 'Dressing'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'In a small bowl, whisk together honey and balsamic vinegar until well combined.',
      'Slowly drizzle in olive oil while whisking continuously to emulsify.',
      'Season with salt and pepper to taste.',
      'Use immediately or store in an airtight container in the refrigerator for up to 1 week.'
    ]
  }
]; 