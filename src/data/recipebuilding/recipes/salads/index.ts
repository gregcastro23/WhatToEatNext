import { Recipe } from '../../../types/recipe';

export const saladRecipes: Recipe[] = [
  {
    name: 'Watermelon Feta Salad',
    description: 'A refreshing summer salad combining sweet watermelon with salty feta and fresh mint.',
    ingredients: [
      { name: 'watermelon, cubed', amount: 6, unit: 'cups' },
      { name: 'feta cheese, crumbled', amount: 1, unit: 'cup' },
      { name: 'fresh mint leaves', amount: 0.5, unit: 'cup' },
      { name: 'red onion, thinly sliced', amount: 0.5, unit: '' },
      { name: 'extra virgin olive oil', amount: 2, unit: 'tbsp' },
      { name: 'balsamic glaze', amount: 2, unit: 'tbsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 180,
      protein: 5,
      carbs: 20,
      fat: 11,
      vitamins: ['A', 'C'],
      minerals: ['Calcium', 'Potassium']
    },
    timeToMake: '15 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.2,
      Water: 0.6,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, combine watermelon cubes and thinly sliced red onion.',
      'Sprinkle crumbled feta cheese over the watermelon.',
      'Tear fresh mint leaves and scatter over the salad.',
      'Drizzle with olive oil and balsamic glaze.',
      'Season with fresh black pepper.',
      'Toss gently to combine just before serving.',
      'Serve immediately while fresh and crisp.'
    ]
  },
  {
    name: 'Grilled Peach and Burrata Salad',
    description: 'A sophisticated summer salad featuring grilled peaches, creamy burrata, and peppery arugula.',
    ingredients: [
      { name: 'ripe peaches, halved', amount: 4, unit: '' },
      { name: 'burrata cheese', amount: 8, unit: 'oz', swaps: ['fresh mozzarella'] },
      { name: 'baby arugula', amount: 6, unit: 'cups' },
      { name: 'prosciutto (optional)', amount: 4, unit: 'slices' },
      { name: 'honey', amount: 2, unit: 'tbsp' },
      { name: 'balsamic vinegar', amount: 2, unit: 'tbsp' },
      { name: 'extra virgin olive oil', amount: 3, unit: 'tbsp' },
      { name: 'sea salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'fresh basil leaves', amount: 0.25, unit: 'cup' }
    ],
    nutrition: {
      calories: 320,
      protein: 15,
      carbs: 25,
      fat: 20,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Calcium', 'Iron']
    },
    timeToMake: '25 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Preheat grill to medium-high heat.',
      'Brush peach halves with 1 tablespoon olive oil.',
      'Grill peaches cut-side down until lightly charred and softened, about 4-5 minutes.',
      'In a small bowl, whisk together honey, balsamic vinegar, remaining olive oil, salt, and pepper.',
      'Arrange arugula on a serving platter.',
      'Top with grilled peaches and torn burrata cheese.',
      'If using, add prosciutto slices.',
      'Drizzle with the honey-balsamic dressing.',
      'Garnish with fresh basil leaves.',
      'Serve immediately while peaches are still warm.'
    ]
  },
  {
    name: 'Cruciferous Salad',
    description: 'A hearty salad featuring various cruciferous vegetables with horseradish dressing.',
    ingredients: [
      { name: 'broccoli', amount: 2, unit: 'heads', notes: 'bite-size florets and stems' },
      { name: 'cauliflower', amount: 1, unit: 'head', notes: 'bite-size florets' },
      { name: 'Brussels sprouts', amount: 1, unit: 'pound', notes: 'finely shredded' },
      { name: 'horseradish', amount: 0.25, unit: 'cup', notes: 'peeled and roughly chopped' },
      { name: 'cashews', amount: 0.5, unit: 'cup', notes: 'soaked overnight and drained' },
      { name: 'extra virgin olive oil', amount: 0.25, unit: 'cup' },
      { name: 'white miso', amount: 0.25, unit: 'cup' },
      { name: 'water', amount: 0.75, unit: 'cup' },
      { name: 'garlic', amount: 2, unit: 'cloves' },
      { name: 'lemon juice', amount: 0.25, unit: 'cup' },
      { name: 'brown rice vinegar', amount: 1, unit: 'tbsp' },
      { name: 'umeboshi paste', amount: 1, unit: 'tbsp' },
      { name: 'Dijon mustard', amount: 1, unit: 'tsp' },
      { name: 'sesame seeds', amount: 0.25, unit: 'cup', notes: 'toasted, for garnish' }
    ],
    nutrition: {
      calories: 150,
      protein: 6,
      carbs: 15,
      fat: 9,
      vitamins: ['C', 'K', 'B6'],
      minerals: ['Folate', 'Potassium']
    },
    timeToMake: '45 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.2
    },
    instructions: [
      'Bring 1-gallon water to boil with 1 tablespoon salt. Prepare an ice bath.',
      'Blanch broccoli, broccoli stems, and cauliflower separately – broccoli for 30 seconds, cauliflower for 1 minute. Shock blanched vegetables in ice water.',
      'Drain and transfer broccoli, broccoli stems, and cauliflower to bowl and add Brussels sprouts.',
      'In Vitamix, combine dressing ingredients. Process until creamy and smooth, and more water if needed.',
      'Toss vegetables in dressing and serve garnished with sesame seeds.'
    ]
  },
  {
    name: 'Baby Bok Choy and Red Cabbage Slaw',
    description: 'A crunchy Asian-inspired slaw with tender bok choy and vibrant cabbage.',
    ingredients: [
      { name: 'baby bok choy', amount: 1, unit: 'pound', notes: 'thinly sliced' },
      { name: 'red cabbage', amount: 1, unit: 'small head', notes: 'shredded' },
      { name: 'carrots', amount: 2, unit: 'medium', notes: 'julienned' },
      { name: 'rice vinegar', amount: 0.25, unit: 'cup' },
      { name: 'sesame oil', amount: 2, unit: 'tbsp' },
      { name: 'ginger', amount: 1, unit: 'tbsp', notes: 'freshly grated' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
      { name: 'sesame seeds', amount: 2, unit: 'tbsp', notes: 'toasted' }
    ],
    nutrition: {
      calories: 85,
      protein: 2,
      carbs: 12,
      fat: 4,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Calcium', 'Iron']
    },
    timeToMake: '20 minutes',
    season: ['spring', 'summer'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.3
    },
    instructions: [
      'Combine bok choy, cabbage, and carrots in large bowl.',
      'Whisk together rice vinegar, sesame oil, ginger, and honey.',
      'Toss vegetables with dressing and sprinkle with sesame seeds.',
      'Let stand 10 minutes before serving to allow flavors to meld.'
    ]
  },
  {
    name: 'Wakame Cucumber Salad with Orange',
    description: 'A refreshing Japanese-inspired salad combining sea vegetables with citrus.',
    ingredients: [
      { name: 'wakame', amount: 0.25, unit: 'cup' },
      { name: 'cucumbers', amount: 2, unit: '' },
      { name: 'sea salt', amount: 0.25, unit: 'tsp' },
      { name: 'juice oranges', amount: 2, unit: '' },
      { name: 'cilantro', amount: 0.25, unit: 'bunch' },
      { name: 'rice vinegar', amount: 2, unit: 'tbsp' },
      { name: 'mirin', amount: 2, unit: 'tbsp' },
      { name: 'shoyu', amount: 1, unit: 'tbsp' },
      { name: 'maple syrup', amount: 1.5, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 85,
      protein: 2,
      carbs: 18,
      fat: 0,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iodine', 'Potassium']
    },
    timeToMake: '35 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.2,
      Water: 0.5,
      Air: 0.2
    },
    instructions: [
      'Soak wakame in cold water for 5 minutes until reconstituted. Drain and chop into bite-size pieces.',
      'Cut cucumbers in half lengthwise, scoop out seeds, and slice thinly.',
      'Toss cucumbers with salt and let drain in colander for 20 minutes.',
      'Supreme oranges (cut segments from membrane) and reserve juice.',
      'Chop cilantro leaves.',
      'Combine rice vinegar, mirin, shoyu, and maple syrup with reserved orange juice.',
      'Toss wakame and cucumbers with dressing.',
      'Garnish with orange segments and cilantro before serving.'
    ]
  },
  {
    name: 'Thai Mango Salad',
    description: 'A refreshing and zesty salad with ripe mango, fresh herbs, and a spicy lime dressing.',
    ingredients: [
      { name: 'ripe mangoes, julienned', amount: 2, unit: 'large' },
      { name: 'red bell pepper, julienned', amount: 1, unit: '' },
      { name: 'red onion, thinly sliced', amount: 0.5, unit: '' },
      { name: 'fresh cilantro, chopped', amount: 0.5, unit: 'cup' },
      { name: 'fresh mint leaves, chopped', amount: 0.25, unit: 'cup' },
      { name: 'lime juice', amount: 3, unit: 'tbsp' },
      { name: 'fish sauce', amount: 1, unit: 'tbsp' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
      { name: 'bird\'s eye chili, finely chopped (optional)', amount: 1, unit: '' },
      { name: 'roasted peanuts, chopped', amount: 0.25, unit: 'cup' }
    ],
    nutrition: {
      calories: 160,
      protein: 4,
      carbs: 28,
      fat: 6,
      vitamins: ['A', 'C'],
      minerals: ['Potassium', 'Magnesium']
    },
    timeToMake: '20 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, combine julienned mangoes, bell pepper, red onion, cilantro, and mint.',
      'In a small bowl, whisk together lime juice, fish sauce, honey, and bird\'s eye chili (if using) to make the dressing.',
      'Pour the dressing over the mango mixture and toss gently to coat evenly.',
      'Transfer the salad to a serving plate and sprinkle chopped peanuts on top.',
      'Serve immediately as a refreshing and flavorful side dish or light meal.'
    ]
  },
  {
    name: 'Strawberry Spinach Salad with Poppy Seed Dressing',
    description: 'A delightful and refreshing salad featuring sweet strawberries, tender spinach, and a creamy poppy seed dressing.',
    ingredients: [
      { name: 'baby spinach', amount: 6, unit: 'cups' },
      { name: 'strawberries, sliced', amount: 2, unit: 'cups' },
      { name: 'red onion, thinly sliced', amount: 0.5, unit: '' },
      { name: 'feta cheese, crumbled', amount: 0.5, unit: 'cup', swaps: ['goat cheese'] },
      { name: 'almonds, sliced', amount: 0.33, unit: 'cup', swaps: ['pecans', 'walnuts'] },
      { name: 'Greek yogurt', amount: 0.5, unit: 'cup' },
      { name: 'honey', amount: 2, unit: 'tbsp' },
      { name: 'apple cider vinegar', amount: 1, unit: 'tbsp' },
      { name: 'poppy seeds', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'black pepper', amount: 0.125, unit: 'tsp' }
    ],
    nutrition: {
      calories: 280,
      protein: 10,
      carbs: 24,
      fat: 18,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Calcium', 'Iron']
    },
    timeToMake: '20 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, combine baby spinach, sliced strawberries, and thinly sliced red onion.',
      'In a small bowl, whisk together Greek yogurt, honey, apple cider vinegar, poppy seeds, salt, and black pepper to make the dressing.',
      'Drizzle the dressing over the salad and toss gently to coat evenly.',
      'Sprinkle crumbled feta cheese and sliced almonds over the salad.',
      'Serve immediately and enjoy the perfect balance of sweet and savory flavors!'
    ]
  },
  {
    name: 'Grilled Eggplant and Zucchini Salad',
    description: 'A smoky and savory salad made with grilled eggplant, zucchini, and a tangy lemon vinaigrette.',
    ingredients: [
      { name: 'eggplant, sliced into rounds', amount: 1, unit: 'large' },
      { name: 'zucchini, sliced lengthwise', amount: 2, unit: 'medium' },
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
      { name: 'mixed greens', amount: 4, unit: 'cups' },
      { name: 'cherry tomatoes, halved', amount: 1, unit: 'cup' },
      { name: 'red onion, thinly sliced', amount: 0.5, unit: '' },
      { name: 'lemon, juiced', amount: 1, unit: '' },
      { name: 'Dijon mustard', amount: 1, unit: 'tsp' },
      { name: 'garlic clove, minced', amount: 1, unit: '' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 240,
      protein: 4,
      carbs: 16,
      fat: 18,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '30 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat grill to medium-high heat.',
      'Brush eggplant and zucchini slices with 2 tablespoons of olive oil, salt, and pepper.',
      'Grill eggplant and zucchini for 3-4 minutes per side, until tender and lightly charred. Remove from heat and let cool slightly.',
      'In a large bowl, combine mixed greens, cherry tomatoes, and sliced red onion.',
      'In a small bowl, whisk together lemon juice, remaining olive oil, Dijon mustard, minced garlic, salt, and pepper to make the vinaigrette.',
      'Cut grilled eggplant and zucchini into bite-sized pieces and add to the salad bowl.',
      'Drizzle the vinaigrette over the salad and toss gently to coat evenly.',
      'Serve immediately as a refreshing and healthy salad.'
    ]
  },
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
    mealType: ['Salad'],
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
    name: 'Warm Pinto Bean Salad with Shiitake',
    description: 'A hearty warm salad combining tender pinto beans with umami-rich shiitake mushrooms.',
    ingredients: [
      { name: 'pinto beans, cooked', amount: 3, unit: 'cups' },
      { name: 'shiitake mushrooms', amount: 8, unit: 'oz', notes: 'sliced' },
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
      { name: 'shallots', amount: 2, unit: 'medium', notes: 'finely diced' },
      { name: 'garlic cloves', amount: 3, unit: '', notes: 'minced' },
      { name: 'fresh thyme', amount: 2, unit: 'tsp', notes: 'chopped' },
      { name: 'apple cider vinegar', amount: 2, unit: 'tbsp' },
      { name: 'tamari', amount: 1, unit: 'tbsp' },
      { name: 'fresh parsley', amount: 0.5, unit: 'cup', notes: 'chopped' },
      { name: 'sea salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 280,
      protein: 14,
      carbs: 38,
      fat: 9,
      vitamins: ['B6', 'C', 'K'],
      minerals: ['Iron', 'Potassium', 'Magnesium']
    },
    timeToMake: '25 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Salad'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Heat 2 tablespoons olive oil in a large skillet over medium heat.',
      'Add shallots and cook until softened, about 3 minutes.',
      'Add shiitake mushrooms and cook until they release their moisture and begin to brown, about 5-7 minutes.',
      'Add garlic and thyme, cook for another minute until fragrant.',
      'Add cooked pinto beans and gently heat through.',
      'In a small bowl, whisk together remaining olive oil, apple cider vinegar, and tamari.',
      'Pour dressing over the warm bean mixture and toss gently.',
      'Season with salt and pepper to taste.',
      'Stir in fresh parsley just before serving.',
      'Serve warm or at room temperature.'
    ]
  }
]; 