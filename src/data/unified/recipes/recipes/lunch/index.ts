import { Recipe } from '../../../types/recipe';

export const lunchRecipes: Recipe[] = [
  {
    name: 'Caesar Salad with Shrimp',
    description: 'Classic Caesar salad topped with grilled shrimp.',
    ingredients: [
      { name: 'romaine lettuce', amount: 2, unit: 'heads', swaps: ['kale', 'spinach'] },
      { name: 'shrimp, peeled and deveined', amount: 1, unit: 'lb' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'Dijon mustard', amount: 1, unit: 'tsp' },
      { name: 'anchovy fillets, minced', amount: 4, unit: '', swaps: ['capers'] },
      { name: 'Parmesan cheese, grated', amount: 0.5, unit: 'cup' },
      { name: 'croutons', amount: 1, unit: 'cup', swaps: ['toasted nuts'] },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 380,
      protein: 36,
      carbs: 12,
      fat: 22,
      vitamins: ['A', 'C', 'B12'],
      minerals: ['Iron', 'Calcium']
    },
    timeToMake: '30 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Salad', 'Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, tear romaine lettuce into bite-size pieces.',
      'In a skillet, heat olive oil over medium-high heat. Add shrimp and cook until pink and opaque, about 3 minutes per side. Set aside to cool.',
      'In a small bowl, whisk together garlic, lemon juice, Dijon mustard, anchovies, Parmesan cheese, salt, and pepper to make the dressing.',
      'Add cooled shrimp to the bowl with the lettuce. Pour dressing over the salad and toss to coat.',
      'Top with croutons and additional Parmesan cheese, if desired. Serve immediately.'
    ]
  },
  {
    name: 'Quinoa and Black Bean Salad',
    description: 'A protein-packed salad with fluffy quinoa, black beans, and fresh vegetables.',
    ingredients: [
      { name: 'quinoa, rinsed', amount: 1, unit: 'cup' },
      { name: 'water', amount: 2, unit: 'cups' },
      { name: 'black beans, drained and rinsed', amount: 1, unit: 'can' },
      { name: 'cherry tomatoes, halved', amount: 1, unit: 'cup' },
      { name: 'cucumber, diced', amount: 1, unit: '' },
      { name: 'red bell pepper, diced', amount: 1, unit: '' },
      { name: 'red onion, diced', amount: 0.5, unit: '' },
      { name: 'cilantro, chopped', amount: 0.5, unit: 'cup' },
      { name: 'lime juice', amount: 2, unit: 'tbsp' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'ground cumin', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 280,
      protein: 12,
      carbs: 48,
      fat: 8,
      vitamins: ['A', 'C', 'E'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.5,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'In a medium saucepan, bring quinoa and water to a boil. Reduce heat, cover, and simmer until quinoa is tender and water is absorbed, about 15 minutes.',
      'Remove from heat and let stand, covered, for 5 minutes. Fluff with a fork and let cool.',
      'In a large bowl, combine cooled quinoa, black beans, tomatoes, cucumber, bell pepper, onion, and cilantro.',
      'In a small bowl, whisk together lime juice, olive oil, cumin, and salt. Pour over quinoa mixture and toss to coat.',
      'Chill in the refrigerator for at least 30 minutes before serving to allow flavors to meld.'
    ]
  },
  {
    name: 'Avocado Egg Salad',
    description: 'A creamy and nutritious twist on classic egg salad, made with mashed avocado.',
    ingredients: [
      { name: 'hard-boiled eggs, chopped', amount: 6, unit: '' },
      { name: 'ripe avocado, mashed', amount: 1, unit: '' },
      { name: 'red onion, finely diced', amount: 0.25, unit: 'cup' },
      { name: 'celery stalk, finely diced', amount: 1, unit: '' },
      { name: 'fresh dill, chopped', amount: 2, unit: 'tbsp', swaps: ['parsley', 'chives'] },
      { name: 'lemon juice', amount: 1, unit: 'tbsp' },
      { name: 'Dijon mustard', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 200,
      protein: 12,
      carbs: 6,
      fat: 14,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium', 'Folate']
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Lunch'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, combine chopped hard-boiled eggs, mashed avocado, red onion, celery, and fresh dill.',
      'Add lemon juice, Dijon mustard, salt, and pepper to the bowl. Mix well until all ingredients are evenly combined.',
      'Taste and adjust seasoning as needed.',
      'Serve on toasted bread, crackers, or lettuce wraps for a low-carb option.',
      'Store any leftovers in an airtight container in the refrigerator for up to 3 days.'
    ]
  }
]; 