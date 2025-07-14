import { Recipe } from '../../../types/recipe';

export const soupRecipes: Recipe[] = [
  // ... existing soup recipes remain ...
  
  {
    name: 'Mushroom Consommé',
    description: 'A clear, flavorful mushroom broth with deep umami notes.',
    ingredients: [
      { name: 'dried shiitake mushrooms', amount: 2, unit: 'oz' },
      { name: 'dried porcini mushrooms', amount: 1, unit: 'oz' },
      { name: 'kombu', amount: 2, unit: 'pieces' },
      { name: 'water', amount: 5, unit: 'quarts' },
      { name: 'onion', amount: 0.5, unit: 'pound', notes: '½ large, peeled and chopped' },
      { name: 'carrot', amount: 0.5, unit: 'pound', notes: '1 large, peeled and chopped' },
      { name: 'fennel bulb', amount: 1, unit: 'pound', notes: 'chopped' },
      { name: 'olive oil', amount: 1.25, unit: 'tbsp' },
      { name: 'tomatoes', amount: 1.5, unit: 'pounds', notes: 'seeded and chopped' },
      { name: 'garlic', amount: 8, unit: 'cloves', notes: 'sliced' },
      { name: 'button mushrooms', amount: 2, unit: 'pounds', notes: 'sliced' },
      { name: 'parsley stems', amount: 0.5, unit: 'oz' },
      { name: 'bay leaves', amount: 2, unit: '' }
    ],
    nutrition: {
      calories: 45,
      protein: 3,
      carbs: 7,
      fat: 1,
      vitamins: ['D', 'B'],
      minerals: ['Selenium', 'Copper']
    },
    timeToMake: '90 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Soup'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Combine dried mushrooms, kombu, and water in stockpot. Bring to simmer.',
      'Meanwhile, in separate pan, sauté onion, carrot, and fennel in olive oil until tender.',
      'Add tomatoes and garlic to vegetables and cook until tomatoes break down.',
      'Add button mushrooms and cook until they release their liquid.',
      'Add sautéed vegetables to stockpot with bouquet garni.',
      'Simmer for 45 minutes, strain, and serve hot.'
    ]
  },
  {
    name: 'Miso Soup with Wakame',
    description: 'Traditional Japanese soup with umami-rich miso and mineral-packed wakame seaweed.',
    ingredients: [
      { name: 'dashi stock', amount: 4, unit: 'cups' },
      { name: 'wakame seaweed, dried', amount: 2, unit: 'tbsp' },
      { name: 'white miso paste', amount: 3, unit: 'tbsp' },
      { name: 'silken tofu, cubed', amount: 8, unit: 'oz' },
      { name: 'green onions, thinly sliced', amount: 2, unit: '' }
    ],
    nutrition: {
      calories: 90,
      protein: 6,
      carbs: 8,
      fat: 4,
      vitamins: ['B12'],
      minerals: ['Iodine', 'Iron']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Soup'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.2,
      Water: 0.6,
      Air: 0.1
    },
    instructions: [
      'Soak wakame in cold water for 5 minutes until rehydrated. Drain and set aside.',
      'Bring dashi stock to a gentle simmer in a medium pot.',
      'In a small bowl, whisk a ladleful of hot dashi into the miso paste until smooth.',
      'Add miso mixture back to the pot and stir to combine. Do not boil.',
      'Add tofu and wakame and heat until just warmed through.',
      'Serve hot, garnished with sliced green onions.'
    ]
  },
  {
    name: 'Butternut Squash Soup',
    description: 'A creamy, warming soup perfect for fall and winter months.',
    ingredients: [
      { name: 'butternut squash, peeled and cubed', amount: 2, unit: 'lbs' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'onion, chopped', amount: 1, unit: 'large' },
      { name: 'garlic cloves, minced', amount: 3, unit: '' },
      { name: 'fresh ginger, minced', amount: 1, unit: 'tbsp' },
      { name: 'vegetable broth', amount: 4, unit: 'cups' },
      { name: 'coconut milk', amount: 1, unit: 'can' },
      { name: 'maple syrup', amount: 1, unit: 'tbsp' },
      { name: 'ground cinnamon', amount: 0.5, unit: 'tsp' },
      { name: 'ground nutmeg', amount: 0.25, unit: 'tsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 220,
      protein: 3,
      carbs: 28,
      fat: 12,
      vitamins: ['A', 'C'],
      minerals: ['Potassium', 'Magnesium']
    },
    timeToMake: '45 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Soup'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Heat olive oil in a large pot over medium heat. Add onion and cook until softened, about 5 minutes.',
      'Add garlic and ginger, cook for another minute until fragrant.',
      'Add butternut squash, vegetable broth, cinnamon, nutmeg, salt, and pepper. Bring to a boil.',
      'Reduce heat, cover, and simmer for 20-25 minutes until squash is very tender.',
      'Add coconut milk and maple syrup.',
      'Using an immersion blender, blend until smooth. Alternatively, carefully transfer to a blender in batches.',
      'Taste and adjust seasoning if needed.',
      'Serve hot, garnished with a drizzle of coconut milk and pumpkin seeds if desired.'
    ]
  },
  {
    name: 'Vegetable Detox Soup',
    description: 'A cleansing soup packed with detoxifying vegetables and healing herbs.',
    ingredients: [
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'onion', amount: 1, unit: 'large', notes: 'diced' },
      { name: 'garlic cloves', amount: 4, unit: '', notes: 'minced' },
      { name: 'ginger', amount: 2, unit: 'tbsp', notes: 'fresh, minced' },
      { name: 'celery stalks', amount: 4, unit: '', notes: 'chopped' },
      { name: 'carrots', amount: 3, unit: 'medium', notes: 'chopped' },
      { name: 'broccoli', amount: 2, unit: 'cups', notes: 'florets' },
      { name: 'kale', amount: 4, unit: 'cups', notes: 'chopped' },
      { name: 'parsley', amount: 1, unit: 'cup', notes: 'fresh' },
      { name: 'turmeric', amount: 1, unit: 'tsp', notes: 'ground' },
      { name: 'vegetable broth', amount: 8, unit: 'cups' },
      { name: 'lemon', amount: 1, unit: 'whole', notes: 'juice only' },
      { name: 'sea salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 120,
      protein: 4,
      carbs: 18,
      fat: 5,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iron', 'Potassium', 'Magnesium']
    },
    timeToMake: '40 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Soup'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.2,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'Heat olive oil in a large pot over medium heat.',
      'Add onion, garlic, and ginger. Sauté until onion is translucent, about 5 minutes.',
      'Add celery and carrots. Cook for another 5 minutes.',
      'Stir in turmeric and cook for 1 minute until fragrant.',
      'Add vegetable broth and bring to a boil.',
      'Reduce heat and simmer for 10 minutes.',
      'Add broccoli and continue cooking for 5 minutes.',
      'Add kale and cook until just wilted, about 3 minutes.',
      'Stir in parsley and lemon juice.',
      'Season with salt and pepper to taste.',
      'Serve hot, garnished with additional fresh parsley if desired.'
    ]
  }
];