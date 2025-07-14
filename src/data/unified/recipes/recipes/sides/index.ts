import { Recipe } from '../../../types/recipe';

export const sideRecipes: Recipe[] = [
  {
    name: 'Roasted Butternut Squash Salad',
    description: 'A hearty and flavorful salad featuring roasted butternut squash, greens, and a tangy dressing.',
    ingredients: [
      { name: 'butternut squash, cubed', amount: 4, unit: 'cups' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'mixed greens', amount: 6, unit: 'cups' },
      { name: 'dried cranberries', amount: 0.5, unit: 'cup' },
      { name: 'pumpkin seeds', amount: 0.25, unit: 'cup' },
      { name: 'goat cheese, crumbled', amount: 4, unit: 'oz', swaps: ['feta cheese'] },
      { name: 'apple cider vinegar', amount: 2, unit: 'tbsp' },
      { name: 'Dijon mustard', amount: 1, unit: 'tsp' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 320,
      protein: 8,
      carbs: 36,
      fat: 18,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium', 'Magnesium']
    },
    timeToMake: '40 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Side Dish'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.6,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 400°F. Toss cubed butternut squash with olive oil, salt, and pepper. Spread on a baking sheet and roast for 25-30 minutes, until tender and lightly caramelized.',
      'In a large bowl, combine mixed greens, roasted butternut squash, dried cranberries, pumpkin seeds, and crumbled goat cheese.',
      'In a small bowl, whisk together apple cider vinegar, Dijon mustard, honey, salt, and pepper to make the dressing.',
      'Drizzle dressing over salad and toss to coat evenly.',
      'Serve immediately and enjoy!'
    ]
  },
  {
    name: 'Quinoa Stuffed Bell Peppers',
    description: 'Colorful bell peppers stuffed with a flavorful mixture of quinoa, vegetables, and herbs.',
    ingredients: [
      { name: 'bell peppers', amount: 4, unit: 'medium' },
      { name: 'quinoa, rinsed', amount: 1, unit: 'cup' },
      { name: 'water', amount: 2, unit: 'cups' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'onion, diced', amount: 1, unit: '' },
      { name: 'garlic cloves, minced', amount: 3, unit: '' },
      { name: 'zucchini, diced', amount: 1, unit: '' },
      { name: 'diced tomatoes, drained', amount: 1, unit: 'can' },
      { name: 'fresh parsley, chopped', amount: 0.25, unit: 'cup' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'crumbled feta cheese', amount: 0.5, unit: 'cup', swaps: ['goat cheese', 'shredded mozzarella'] }
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 48,
      fat: 10,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '60 minutes',
    season: ['summer', 'fall'],
    cuisine: 'HSCA',
    mealType: ['Side Dish'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 375°F. Cut bell peppers in half lengthwise and remove seeds and membranes. Place peppers cut-side up in a baking dish.',
      'In a medium saucepan, bring quinoa and water to a boil. Reduce heat, cover, and simmer until quinoa is tender and water is absorbed, about 15 minutes.',
      'In a large skillet, heat olive oil over medium heat. Add onion and garlic, and cook until softened, about 5 minutes.',
      'Add zucchini and cook until tender, about 3 minutes. Stir in cooked quinoa, diced tomatoes, parsley, salt, and pepper.',
      'Spoon quinoa mixture into bell pepper halves. Top with crumbled feta cheese.',
      'Bake stuffed peppers for 25-30 minutes, until peppers are tender and filling is heated through.',
      'Serve hot, garnished with additional fresh parsley if desired.'
    ]
  },
  {
    name: 'Arame with Vegetables',
    description: 'A nourishing side dish combining sea vegetables with land vegetables.',
    ingredients: [
      { name: 'sesame oil', amount: 1, unit: 'tbsp' },
      { name: 'onion', amount: 10, unit: 'oz' },
      { name: 'carrot', amount: 6, unit: 'oz' },
      { name: 'arame', amount: 1.5, unit: 'cups' },
      { name: 'shoyu', amount: 2, unit: 'tbsp' },
      { name: 'brown rice syrup', amount: 2, unit: 'tbsp' },
      { name: 'mirin', amount: 2, unit: 'tbsp' },
      { name: 'bok choy', amount: 8, unit: 'oz' }
    ],
    nutrition: {
      calories: 140,
      protein: 4,
      carbs: 24,
      fat: 5,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iodine', 'Iron', 'Calcium']
    },
    timeToMake: '45 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Side'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In 10-inch sauté pan, heat oil over medium flame. Sweat onion for 5 minutes or until translucent.',
      'Add carrot and sweat another 5 minutes.',
      'Add arame to onions and carrots. Stir well. Sweat for another minute until arame is heated through.',
      'Add water to cover arame halfway. Bring water to boil. Add shoyu, brown rice syrup, and mirin.',
      'Simmer for 20-30 minutes or until all liquid has evaporated.',
      'Add bok choy stems and sweat until stems just become tender. Add leaves and sweat until leaves wilt.'
    ]
  },
  {
    name: 'Hiziki with Carrots and Agé Tofu',
    description: 'A traditional Japanese side dish combining sea vegetables with fried tofu.',
    ingredients: [
      { name: 'canola oil', amount: 2, unit: 'cups' },
      { name: 'firm tofu', amount: 7, unit: 'oz' },
      { name: 'hiziki', amount: 0.5, unit: 'cup' },
      { name: 'apple juice', amount: 1, unit: 'cup' },
      { name: 'water', amount: 0.75, unit: 'cup' },
      { name: 'carrot', amount: 6, unit: 'oz' },
      { name: 'onion', amount: 10, unit: 'oz' },
      { name: 'toasted sesame oil', amount: 1, unit: 'tbsp' },
      { name: 'shoyu', amount: 2, unit: 'tbsp' },
      { name: 'white sesame seeds', amount: 1, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 180,
      protein: 8,
      carbs: 16,
      fat: 11,
      vitamins: ['A', 'K'],
      minerals: ['Calcium', 'Iron', 'Iodine']
    },
    timeToMake: '50 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Side'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Heat oil to 375° F in 2 ½ quart pot. Line plate with paper towel.',
      'Fry tofu in batches until golden. Drain on paper towel.',
      'Combine hiziki in separate 2 ½ quart pot with apple juice and water. Bring to boil.',
      'Add carrots, onion, fried tofu, toasted sesame oil, and shoyu.',
      'Simmer 30 minutes or until all liquid is absorbed.',
      'Garnish with sesame seeds before serving.'
    ]
  },
  {
    name: 'Roasted Brussels Sprouts with Balsamic Glaze',
    description: 'Crispy and caramelized Brussels sprouts drizzled with a sweet and tangy balsamic glaze.',
    ingredients: [
      { name: 'Brussels sprouts, trimmed and halved', amount: 1.5, unit: 'lbs' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'balsamic vinegar', amount: 0.25, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 160,
      protein: 6,
      carbs: 20,
      fat: 8,
      vitamins: ['C', 'K', 'B6'],
      minerals: ['Potassium', 'Iron']
    },
    timeToMake: '40 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Side Dish'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.6,
      Water: 0.1,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 425°F. Line a baking sheet with parchment paper.',
      'In a large bowl, toss Brussels sprouts with olive oil, salt, and pepper until evenly coated.',
      'Spread the Brussels sprouts in a single layer on the prepared baking sheet.',
      'Roast for 25-30 minutes, stirring halfway through, until the Brussels sprouts are tender and caramelized.',
      'In a small saucepan, combine balsamic vinegar and honey. Bring to a boil, then reduce heat and simmer until the mixture thickens and coats the back of a spoon, about 5-7 minutes.',
      'Drizzle the balsamic glaze over the roasted Brussels sprouts and toss to coat evenly.',
      'Serve hot as a delicious and healthy side dish.'
    ]
  },
  {
    name: 'Spinach and Artichoke Dip',
    description: 'A warm and creamy dip loaded with spinach, artichokes, and melted cheese.',
    ingredients: [
      { name: 'frozen spinach, thawed and squeezed dry', amount: 10, unit: 'oz' },
      { name: 'marinated artichoke hearts, drained and chopped', amount: 14, unit: 'oz' },
      { name: 'cream cheese, softened', amount: 8, unit: 'oz' },
      { name: 'sour cream', amount: 0.5, unit: 'cup' },
      { name: 'mayonnaise', amount: 0.25, unit: 'cup' },
      { name: 'Parmesan cheese, grated', amount: 0.5, unit: 'cup' },
      { name: 'garlic cloves, minced', amount: 3, unit: '' },
      { name: 'red pepper flakes', amount: 0.25, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 220,
      protein: 8,
      carbs: 8,
      fat: 18,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Calcium', 'Iron']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Side', 'Appetizer'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 375°F.',
      'In a large bowl, mix together spinach, artichoke hearts, cream cheese, sour cream, mayonnaise, Parmesan cheese, garlic, red pepper flakes, salt, and pepper until well combined.',
      'Transfer mixture to a baking dish and spread evenly.',
      'Bake for 20-25 minutes, until hot and bubbly and lightly browned on top.',
      'Serve warm with pita chips, sliced baguette, or fresh vegetables for dipping.'
    ]
  },
  {
    name: 'Grilled Portobello Mushroom Steaks',
    description: 'Juicy and savory grilled portobello mushrooms, perfect for a vegetarian entree.',
    ingredients: [
      { name: 'portobello mushrooms', amount: 4, unit: 'large' },
      { name: 'balsamic vinegar', amount: 0.25, unit: 'cup' },
      { name: 'soy sauce', amount: 2, unit: 'tbsp', swaps: ['tamari'] },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'garlic cloves, minced', amount: 3, unit: '' },
      { name: 'thyme leaves', amount: 1, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 120,
      protein: 4,
      carbs: 12,
      fat: 8,
      vitamins: ['D', 'B12'],
      minerals: ['Selenium', 'Copper']
    },
    timeToMake: '25 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Side', 'Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Clean mushrooms and remove stems. Place in a shallow dish.',
      'In a small bowl, whisk together balsamic vinegar, soy sauce, olive oil, garlic, thyme, salt, and pepper.',
      'Pour marinade over mushrooms and let marinate for 15 minutes, turning once.',
      'Preheat grill or grill pan to medium-high heat.',
      'Grill mushrooms for 4-5 minutes per side, basting with remaining marinade.',
      'Serve hot, sliced if desired.'
    ]
  },
  {
    name: 'Roasted Root Vegetables with Toasted Hazelnuts',
    description: 'A medley of seasonal root vegetables roasted until caramelized, topped with toasted hazelnuts and fresh herbs.',
    ingredients: [
      { name: 'carrots', amount: 3, unit: 'medium', notes: 'cut into 2-inch pieces' },
      { name: 'parsnips', amount: 3, unit: 'medium', notes: 'cut into 2-inch pieces' },
      { name: 'sweet potatoes', amount: 2, unit: 'medium', notes: 'cut into 2-inch pieces' },
      { name: 'beets', amount: 2, unit: 'medium', notes: 'cut into 2-inch pieces' },
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
      { name: 'garlic cloves', amount: 6, unit: '', notes: 'whole, peeled' },
      { name: 'hazelnuts', amount: 0.5, unit: 'cup', notes: 'toasted and roughly chopped' },
      { name: 'fresh cilantro', amount: 0.5, unit: 'cup', notes: 'chopped' },
      { name: 'sea salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' },
      { name: 'fresh thyme', amount: 2, unit: 'tbsp', notes: 'leaves only' }
    ],
    nutrition: {
      calories: 220,
      protein: 5,
      carbs: 28,
      fat: 12,
      vitamins: ['A', 'C', 'B6'],
      minerals: ['Potassium', 'Magnesium', 'Iron']
    },
    timeToMake: '45 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Side'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 425°F.',
      'Toss all cut vegetables and whole garlic cloves with olive oil, salt, and pepper.',
      'Spread vegetables in a single layer on a large baking sheet.',
      'Roast for 35-40 minutes, stirring halfway through, until vegetables are tender and caramelized.',
      'While vegetables roast, toast hazelnuts in a dry skillet until fragrant and skins begin to peel.',
      'Rub hazelnuts in a clean kitchen towel to remove skins, then roughly chop.',
      'When vegetables are done, transfer to a serving dish.',
      'Top with toasted hazelnuts, fresh cilantro, and thyme leaves.',
      'Adjust seasoning to taste and serve hot.'
    ]
  }
]; 