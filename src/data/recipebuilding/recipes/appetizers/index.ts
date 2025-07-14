import { Recipe } from '../../../types/recipe';

export const appetizerRecipes: Recipe[] = [
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
    mealType: ['Appetizer'],
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
    name: 'Grilled Vegetable Skewers',
    description: 'Colorful and flavorful skewers loaded with marinated and grilled vegetables.',
    ingredients: [
      { name: 'zucchini, sliced', amount: 2, unit: '' },
      { name: 'yellow squash, sliced', amount: 2, unit: '' },
      { name: 'red bell pepper, cut into chunks', amount: 1, unit: '' },
      { name: 'red onion, cut into chunks', amount: 1, unit: '' },
      { name: 'cherry tomatoes', amount: 1, unit: 'pint' },
      { name: 'olive oil', amount: 0.25, unit: 'cup' },
      { name: 'balsamic vinegar', amount: 2, unit: 'tbsp' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'dried oregano', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 120,
      protein: 2,
      carbs: 12,
      fat: 8,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '30 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Appetizer', 'Side Dish'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.5,
      Water: 0.1,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, whisk together olive oil, balsamic vinegar, garlic, oregano, salt, and pepper.',
      'Add zucchini, yellow squash, bell pepper, onion, and cherry tomatoes to the bowl and toss to coat evenly with the marinade.',
      'Thread the vegetables onto skewers, alternating colors and shapes for visual appeal.',
      'Preheat grill to medium-high heat. Grill skewers for 8-10 minutes, turning occasionally, until vegetables are tender and lightly charred.',
      'Serve hot as a side dish or appetizer.'
    ]
  },
  {
    name: 'Baba Ghanoush',
    description: 'A creamy Middle Eastern dip made from roasted eggplant and tahini.',
    ingredients: [
      { name: 'eggplant', amount: 1, unit: 'pound' },
      { name: 'tahini', amount: 2, unit: 'tbsp' },
      { name: 'garlic', amount: 1, unit: 'clove' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.375, unit: 'tsp' }
    ],
    nutrition: {
      calories: 160,
      protein: 6,
      carbs: 14,
      fat: 12,
      vitamins: ['B6', 'C'],
      minerals: ['Potassium', 'Iron', 'Magnesium']
    },
    timeToMake: '45 minutes',
    season: ['summer', 'fall'],
    cuisine: 'HSCA',
    mealType: ['Appetizer', 'Dip'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Cook eggplant on top of stove over medium-low flame, turning often with tongs until skin is completely charred and flesh is fork tender (about 15 minutes).',
      'Transfer eggplant to covered bowl and let sweat for 15 minutes.',
      'Let eggplant cool, cut in half, and scoop out flesh or peel off charred skin.',
      'In food processor, blend flesh with tahini, garlic, lemon juice, and salt. Adjust seasonings for desired taste.'
    ]
  },
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
      vitamins: ['B3', 'D'],
      minerals: ['Selenium', 'Copper']
    },
    timeToMake: '2 hours',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Appetizer', 'Soup'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'Combine dried mushrooms, kombu, and water in stockpot. Bring to simmer.',
      'In separate pan, sweat onion, carrot, and fennel in olive oil until tender.',
      'Add tomatoes and garlic to vegetables and cook until tomatoes break down.',
      'Add fresh mushrooms to stockpot along with vegetable mixture.',
      'Add parsley stems and bay leaves. Simmer gently for 1 hour.',
      'Strain consommé through fine-mesh strainer lined with cheesecloth.',
      'Season to taste with salt and white pepper.'
    ]
  },
  {
    name: 'Mango Avocado Salsa',
    description: 'A fresh and zesty salsa perfect for topping grilled fish, chicken, or enjoying with chips.',
    ingredients: [
      { name: 'ripe mango, diced', amount: 2, unit: '' },
      { name: 'avocado, diced', amount: 1, unit: '' },
      { name: 'red onion, finely chopped', amount: 0.5, unit: '' },
      { name: 'jalapeño pepper, seeded and minced', amount: 1, unit: '' },
      { name: 'fresh cilantro, chopped', amount: 0.25, unit: 'cup' },
      { name: 'lime juice', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 160,
      protein: 2,
      carbs: 20,
      fat: 10,
      vitamins: ['A', 'C', 'E'],
      minerals: ['Potassium', 'Magnesium']
    },
    timeToMake: '15 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Appetizer', 'Snack'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a medium bowl, combine diced mango, avocado, red onion, jalapeño pepper, and cilantro.',
      'Add lime juice and salt, and gently toss to combine.',
      'Taste and adjust seasoning if needed.',
      'Serve immediately with grilled meats, fish, or tortilla chips.'
    ]
  },
  {
    name: 'Caprese Skewers with Balsamic Glaze',
    description: 'A simple and elegant appetizer featuring fresh mozzarella, cherry tomatoes, and basil leaves.',
    ingredients: [
      { name: 'cherry tomatoes', amount: 1, unit: 'pint' },
      { name: 'fresh mozzarella balls', amount: 8, unit: 'oz' },
      { name: 'fresh basil leaves', amount: 24, unit: '' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'balsamic glaze', amount: 0.25, unit: 'cup' },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'black pepper', amount: 0.125, unit: 'tsp' }
    ],
    nutrition: {
      calories: 200,
      protein: 12,
      carbs: 8,
      fat: 14,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Calcium', 'Potassium']
    },
    timeToMake: '20 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Appetizer'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'Thread cherry tomatoes, mozzarella balls, and basil leaves onto skewers, alternating the ingredients.',
      'Arrange the skewers on a serving platter.',
      'Drizzle olive oil and balsamic glaze over the skewers.',
      'Sprinkle with salt and black pepper.',
      'Serve immediately as a fresh and flavorful appetizer.'
    ]
  },
  {
    name: 'Roasted Red Pepper Hummus',
    description: 'Creamy hummus with sweet roasted red peppers and tahini.',
    ingredients: [
      { name: 'chickpeas, drained and rinsed', amount: 15, unit: 'oz' },
      { name: 'roasted red peppers', amount: 12, unit: 'oz' },
      { name: 'tahini', amount: 0.333, unit: 'cup' },
      { name: 'garlic cloves', amount: 3, unit: '' },
      { name: 'lemon juice', amount: 0.25, unit: 'cup' },
      { name: 'olive oil', amount: 0.25, unit: 'cup' },
      { name: 'ground cumin', amount: 1, unit: 'tsp' },
      { name: 'smoked paprika', amount: 0.5, unit: 'tsp' },
      { name: 'salt', amount: 1, unit: 'tsp' }
    ],
    nutrition: {
      calories: 180,
      protein: 6,
      carbs: 16,
      fat: 12,
      vitamins: ['A', 'C', 'E'],
      minerals: ['Iron', 'Calcium']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Appetizer', 'Snack'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'In a food processor, combine chickpeas, roasted red peppers, tahini, and garlic.',
      'Process until smooth, scraping down sides as needed.',
      'With machine running, add lemon juice and olive oil in a steady stream.',
      'Add cumin, paprika, and salt. Process until well combined.',
      'Taste and adjust seasonings as needed.',
      'Serve with pita chips, vegetables, or use as a spread.'
    ]
  },
  {
    name: 'Stuffed Mushroom Caps',
    description: 'Tender mushrooms filled with a savory herb and cheese mixture.',
    ingredients: [
      { name: 'cremini mushrooms', amount: 24, unit: 'medium' },
      { name: 'cream cheese, softened', amount: 8, unit: 'oz' },
      { name: 'Parmesan cheese, grated', amount: 0.5, unit: 'cup' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'fresh parsley, chopped', amount: 0.25, unit: 'cup' },
      { name: 'fresh thyme leaves', amount: 1, unit: 'tbsp' },
      { name: 'breadcrumbs', amount: 0.5, unit: 'cup' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 160,
      protein: 8,
      carbs: 6,
      fat: 12,
      vitamins: ['D', 'B12'],
      minerals: ['Selenium', 'Copper']
    },
    timeToMake: '35 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Appetizer'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 400°F. Remove stems from mushrooms and finely chop them.',
      'In a bowl, mix chopped stems, cream cheese, Parmesan, garlic, herbs, and breadcrumbs.',
      'Season with salt and pepper.',
      'Fill each mushroom cap with the mixture.',
      'Place on a baking sheet and drizzle with olive oil.',
      'Bake for 20-25 minutes until golden brown and mushrooms are tender.'
    ]
  },
  {
    name: 'Bruschetta with Fresh Tomatoes',
    description: 'Classic Italian appetizer featuring toasted bread topped with seasoned fresh tomatoes and basil.',
    ingredients: [
      { name: 'baguette, sliced', amount: 1, unit: '' },
      { name: 'ripe tomatoes, diced', amount: 4, unit: 'medium' },
      { name: 'fresh basil leaves, chopped', amount: 0.5, unit: 'cup' },
      { name: 'garlic cloves, minced', amount: 3, unit: '' },
      { name: 'olive oil', amount: 0.25, unit: 'cup' },
      { name: 'balsamic vinegar', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 180,
      protein: 4,
      carbs: 24,
      fat: 8,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium', 'Iron']
    },
    timeToMake: '25 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Appetizer'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.2
    },
    instructions: [
      'Preheat oven to 375°F.',
      'In a bowl, combine diced tomatoes, basil, garlic, 2 tablespoons olive oil, balsamic vinegar, salt, and pepper.',
      'Let the mixture sit at room temperature for 15 minutes to marinate.',
      'Brush baguette slices with remaining olive oil and arrange on a baking sheet.',
      'Toast in the oven for 5-7 minutes until golden brown.',
      'Top each slice with the tomato mixture and serve immediately.'
    ]
  },
  {
    name: 'Edamame with Sea Salt',
    description: 'Simple and nutritious steamed edamame pods with sea salt.',
    ingredients: [
      { name: 'frozen edamame pods', amount: 1, unit: 'lb' },
      { name: 'sea salt', amount: 1, unit: 'tsp' },
      { name: 'water', amount: 4, unit: 'cups' }
    ],
    nutrition: {
      calories: 120,
      protein: 11,
      carbs: 10,
      fat: 5,
      vitamins: ['K', 'C', 'B6'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '10 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Appetizer', 'Snack'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'Bring water to a boil in a medium saucepan.',
      'Add frozen edamame pods and cook for 5 minutes.',
      'Drain well and transfer to a serving bowl.',
      'Sprinkle with sea salt while still hot.',
      'Serve warm or at room temperature.'
    ]
  }
]; 