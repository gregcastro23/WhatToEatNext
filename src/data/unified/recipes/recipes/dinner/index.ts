import { Recipe } from '../../../types/recipe';

export const dinnerRecipes: Recipe[] = [
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
      fat: 7,
      vitamins: ['B2', 'B3', 'B5'],
      minerals: ['Potassium', 'Copper']
    },
    timeToMake: '20 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.6,
      Water: 0.1,
      Air: 0.1
    },
    instructions: [
      'Clean mushrooms and remove stems. Place in a shallow dish, gill side up.',
      'In a small bowl, whisk together balsamic vinegar, soy sauce, olive oil, garlic, thyme, salt, and pepper.',
      'Pour marinade over mushrooms, making sure to coat the gills. Let marinate for 10-15 minutes.',
      'Preheat grill to medium-high heat. Grill mushrooms for 4-5 minutes per side, basting with remaining marinade.',
      'Serve hot, sliced on a diagonal, as a vegetarian entree or sliced on top of salads or grain bowls.'
    ]
  },
  {
    name: 'Lemon Garlic Roasted Chicken',
    description: 'Juicy and flavorful roasted chicken infused with lemon, garlic, and herbs.',
    ingredients: [
      { name: 'whole chicken', amount: 4, unit: 'lbs' },
      { name: 'lemons', amount: 2, unit: '' },
      { name: 'garlic cloves, minced', amount: 6, unit: '' },
      { name: 'olive oil', amount: 0.25, unit: 'cup' },
      { name: 'dried thyme', amount: 1, unit: 'tbsp' },
      { name: 'dried rosemary', amount: 1, unit: 'tbsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 420,
      protein: 42,
      carbs: 4,
      fat: 28,
      vitamins: ['B6', 'B12', 'C'],
      minerals: ['Potassium', 'Selenium']
    },
    timeToMake: '90 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 425°F. Rinse chicken and pat dry with paper towels.',
      'Zest one lemon and juice both lemons. In a small bowl, combine lemon zest, lemon juice, minced garlic, olive oil, thyme, rosemary, salt, and pepper.',
      'Rub the lemon-garlic mixture all over the chicken, inside and out. Place the squeezed lemon halves inside the chicken cavity.',
      'Place chicken in a roasting pan, breast-side up. Tie legs together with kitchen twine.',
      'Roast chicken for 1 to 1 1/2 hours, until the juices run clear and the internal temperature of the thigh reaches 165°F.',
      'Remove from oven, cover loosely with foil, and let rest for 15 minutes before carving.',
      'Serve hot, garnished with fresh lemon slices and herbs if desired.'
    ]
  },
  {
    name: 'Pesto Zucchini Noodles',
    description: 'A light and refreshing dish featuring spiralized zucchini noodles tossed in homemade pesto sauce.',
    ingredients: [
      { name: 'zucchini, spiralized', amount: 4, unit: 'medium' },
      { name: 'basil leaves', amount: 2, unit: 'cups' },
      { name: 'pine nuts', amount: 0.25, unit: 'cup', swaps: ['walnuts', 'almonds'] },
      { name: 'Parmesan cheese, grated', amount: 0.5, unit: 'cup' },
      { name: 'garlic cloves', amount: 2, unit: '' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'olive oil', amount: 0.33, unit: 'cup' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'cherry tomatoes, halved', amount: 1, unit: 'cup' }
    ],
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 12,
      fat: 24,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '20 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a food processor, combine basil leaves, pine nuts, Parmesan cheese, garlic, lemon juice, olive oil, salt, and pepper. Process until smooth, scraping down the sides as needed.',
      'In a large bowl, toss spiralized zucchini noodles with the pesto sauce until evenly coated.',
      'Divide zucchini noodles among serving plates and top with halved cherry tomatoes.',
      'Serve immediately, garnished with additional Parmesan cheese and fresh basil leaves, if desired.'
    ]
  },
  {
    name: 'Mediterranean Black Cod',
    description: 'A delicate fish dish with Mediterranean flavors and muhammara sauce.',
    ingredients: [
      { name: 'black cod fillets', amount: 24, unit: 'oz', notes: '6 oz portions' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'garlic', amount: 2, unit: 'cloves', notes: 'minced' },
      { name: 'fresh oregano', amount: 1, unit: 'tbsp', notes: 'chopped' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' },
      // Muhammara sauce ingredients
      { name: 'red peppers', amount: 2, unit: 'large', notes: 'roasted, peeled, seeded' },
      { name: 'walnuts', amount: 1, unit: 'cup', notes: 'toasted' },
      { name: 'pomegranate molasses', amount: 2, unit: 'tbsp' },
      { name: 'breadcrumbs', amount: 0.5, unit: 'cup' },
      { name: 'cumin', amount: 1, unit: 'tsp', notes: 'ground' },
      { name: 'Aleppo pepper', amount: 1, unit: 'tsp' }
    ],
    nutrition: {
      calories: 380,
      protein: 34,
      carbs: 12,
      fat: 22,
      vitamins: ['B12', 'D'],
      minerals: ['Selenium', 'Omega-3']
    },
    timeToMake: '45 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dinner'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Marinate cod in olive oil, lemon juice, garlic, oregano, salt, and pepper for 30 minutes.',
      'For muhammara: Blend roasted peppers, walnuts, pomegranate molasses, breadcrumbs, cumin, and Aleppo pepper until smooth.',
      'Preheat oven to 400°F.',
      'Place cod on parchment-lined baking sheet and roast for 12-15 minutes until just cooked through.',
      'Serve cod with muhammara sauce.'
    ]
  },
  {
    name: 'Vegetable and Tempeh Wraps',
    description: 'Hearty vegetable and tempeh wraps with seasonal vegetables.',
    ingredients: [
      { name: 'tempeh', amount: 16, unit: 'oz', notes: 'sliced' },
      { name: 'tamari', amount: 0.25, unit: 'cup' },
      { name: 'mirin', amount: 2, unit: 'tbsp' },
      { name: 'sesame oil', amount: 2, unit: 'tbsp' },
      { name: 'mixed vegetables', amount: 4, unit: 'cups', notes: 'seasonal, julienned' },
      { name: 'ginger', amount: 2, unit: 'tbsp', notes: 'minced' },
      { name: 'garlic', amount: 3, unit: 'cloves', notes: 'minced' },
      { name: 'whole grain wraps', amount: 8, unit: 'large' },
      { name: 'sprouts', amount: 2, unit: 'cups' }
    ],
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 38,
      fat: 12,
      vitamins: ['B12', 'K'],
      minerals: ['Iron', 'Calcium']
    },
    timeToMake: '40 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dinner', 'Lunch'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.3
    },
    instructions: [
      'Marinate tempeh in tamari and mirin for 20 minutes.',
      'Heat sesame oil in large skillet. Cook tempeh until golden brown on both sides.',
      'In same pan, sauté vegetables with ginger and garlic until tender-crisp.',
      'Warm wraps according to package instructions.',
      'Assemble wraps with tempeh, vegetables, and sprouts.'
    ]
  },
  {
    name: 'Fish Congee',
    description: 'A comforting rice porridge with delicate white fish and ginger.',
    ingredients: [
      { name: 'white rice', amount: 1, unit: 'cup' },
      { name: 'water', amount: 8, unit: 'cups' },
      { name: 'white fish fillets', amount: 12, unit: 'oz' },
      { name: 'ginger', amount: 2, unit: 'inches', notes: 'julienned' },
      { name: 'green onions', amount: 4, unit: '', notes: 'sliced' },
      { name: 'tamari', amount: 2, unit: 'tbsp' },
      { name: 'sesame oil', amount: 1, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 250,
      protein: 20,
      carbs: 35,
      fat: 4,
      vitamins: ['B12', 'D'],
      minerals: ['Selenium', 'Iron']
    },
    timeToMake: '1 hour',
    season: ['winter'],
    cuisine: 'HSCA',
    mealType: ['Dinner', 'Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.5,
      Air: 0.1
    },
    instructions: [
      'Rinse rice until water runs clear.',
      'Combine rice and water in large pot. Bring to boil, then reduce to simmer.',
      'Cook for 45 minutes, stirring occasionally, until rice breaks down and becomes creamy.',
      'Add fish and ginger. Simmer for 5 minutes until fish is cooked.',
      'Season with tamari and sesame oil.',
      'Garnish with green onions before serving.'
    ]
  },
  {
    name: 'Quinoa Buddha Bowl',
    description: 'A nourishing bowl of quinoa, roasted vegetables, and tahini dressing.',
    ingredients: [
      { name: 'quinoa', amount: 1, unit: 'cup' },
      { name: 'sweet potato, cubed', amount: 2, unit: 'medium' },
      { name: 'chickpeas, drained', amount: 15, unit: 'oz' },
      { name: 'kale, chopped', amount: 4, unit: 'cups' },
      { name: 'red onion, sliced', amount: 1, unit: 'medium' },
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
      { name: 'tahini', amount: 0.25, unit: 'cup' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'garlic clove, minced', amount: 1, unit: '' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 420,
      protein: 14,
      carbs: 58,
      fat: 18,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '45 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dinner'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 400°F.',
      'Cook quinoa according to package instructions.',
      'Toss sweet potato and chickpeas with 2 tbsp olive oil, salt, and pepper. Roast for 25-30 minutes.',
      'Make dressing by whisking together tahini, lemon juice, garlic, and 2-4 tbsp water.',
      'Massage kale with remaining olive oil.',
      'Assemble bowls with quinoa, roasted vegetables, kale, and drizzle with tahini dressing.'
    ]
  },
  {
    name: 'Miso Glazed Salmon',
    description: 'Wild-caught salmon with a sweet and savory miso glaze.',
    ingredients: [
      { name: 'salmon fillets', amount: 4, unit: '6 oz portions' },
      { name: 'white miso paste', amount: 0.25, unit: 'cup' },
      { name: 'mirin', amount: 2, unit: 'tbsp' },
      { name: 'sake', amount: 2, unit: 'tbsp' },
      { name: 'maple syrup', amount: 1, unit: 'tbsp' },
      { name: 'ginger, grated', amount: 1, unit: 'tbsp' },
      { name: 'sesame oil', amount: 1, unit: 'tsp' },
      { name: 'green onions, sliced', amount: 2, unit: '' }
    ],
    nutrition: {
      calories: 380,
      protein: 34,
      carbs: 8,
      fat: 24,
      vitamins: ['D', 'B12'],
      minerals: ['Omega-3', 'Selenium']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dinner'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a bowl, whisk together miso, mirin, sake, maple syrup, ginger, and sesame oil.',
      'Place salmon in a dish and coat with miso mixture. Marinate for 15-30 minutes.',
      'Preheat broiler. Line a baking sheet with foil.',
      'Place salmon on prepared sheet and broil 6-8 minutes until caramelized and cooked through.',
      'Garnish with sliced green onions and serve.'
    ]
  },
  {
    name: 'Caprese Stuffed Portobello Mushrooms',
    description: 'Juicy portobello mushrooms stuffed with fresh mozzarella, tomatoes, and basil, then baked to perfection.',
    ingredients: [
      { name: 'portobello mushrooms, stems removed', amount: 4, unit: 'large' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'fresh mozzarella, sliced', amount: 8, unit: 'oz' },
      { name: 'tomatoes, sliced', amount: 2, unit: 'medium' },
      { name: 'fresh basil leaves', amount: 1, unit: 'cup' },
      { name: 'balsamic vinegar', amount: 2, unit: 'tbsp' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 280,
      protein: 14,
      carbs: 12,
      fat: 20,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium', 'Calcium']
    },
    timeToMake: '30 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 400°F. Brush portobello mushrooms with olive oil and place on a baking sheet, gill-side up.',
      'In a small bowl, whisk together balsamic vinegar, minced garlic, salt, and pepper.',
      'Arrange sliced mozzarella, tomatoes, and basil leaves inside each mushroom cap. Drizzle with the balsamic mixture.',
      'Bake for 15-20 minutes, until the mushrooms are tender and the cheese is melted and bubbly.',
      'Serve hot, garnished with additional fresh basil leaves if desired.'
    ]
  },
  {
    name: 'Spinach and Artichoke Stuffed Peppers',
    description: 'Colorful bell peppers stuffed with a creamy spinach and artichoke filling.',
    ingredients: [
      { name: 'bell peppers', amount: 4, unit: 'medium' },
      { name: 'olive oil', amount: 1, unit: 'tbsp' },
      { name: 'onion, diced', amount: 1, unit: '' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'baby spinach', amount: 6, unit: 'cups' },
      { name: 'artichoke hearts, drained and chopped', amount: 14, unit: 'oz' },
      { name: 'cream cheese, softened', amount: 8, unit: 'oz' },
      { name: 'Parmesan cheese, grated', amount: 0.5, unit: 'cup' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 20,
      fat: 22,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Calcium', 'Iron']
    },
    timeToMake: '45 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 375°F. Cut bell peppers in half lengthwise and remove seeds and membranes. Place peppers cut-side up in a baking dish.',
      'In a large skillet, heat olive oil over medium heat. Add onion and garlic, and cook until softened, about 5 minutes.',
      'Add spinach and cook until wilted, about 3 minutes. Remove from heat and let cool slightly.',
      'In a bowl, mix cooked spinach mixture, chopped artichoke hearts, cream cheese, Parmesan cheese, salt, and pepper.',
      'Spoon the spinach and artichoke mixture into the bell pepper halves.',
      'Bake for 25-30 minutes, until peppers are tender and filling is hot and bubbly.',
      'Serve hot, garnished with additional Parmesan cheese if desired.'
    ]
  },
  {
    name: 'Grilled Portobello Mushroom Burgers',
    description: 'Hearty and flavorful vegetarian burgers made with marinated and grilled portobello mushrooms.',
    ingredients: [
      { name: 'portobello mushroom caps', amount: 4, unit: 'large' },
      { name: 'olive oil', amount: 0.25, unit: 'cup' },
      { name: 'balsamic vinegar', amount: 2, unit: 'tbsp' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'dried thyme', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'whole grain buns', amount: 4, unit: '' },
      { name: 'lettuce leaves', amount: 4, unit: '' },
      { name: 'tomato, sliced', amount: 1, unit: '' },
      { name: 'red onion, sliced', amount: 0.5, unit: '' }
    ],
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 36,
      fat: 12,
      vitamins: ['B2', 'B3', 'B5'],
      minerals: ['Potassium', 'Copper']
    },
    timeToMake: '30 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'In a shallow dish, whisk together olive oil, balsamic vinegar, garlic, thyme, salt, and pepper.',
      'Place mushroom caps in the dish and brush the marinade over both sides. Let marinate for 10-15 minutes.',
      'Preheat grill to medium-high heat. Grill mushrooms for 4-5 minutes per side, basting with remaining marinade.',
      'Lightly toast the buns on the grill.',
      'Assemble burgers by placing a grilled mushroom on the bottom bun, topped with lettuce, tomato, and red onion. Add the top bun and serve immediately.'
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
    name: 'Red Lentil and Toasted Sunflower Burger',
    description: 'A protein-rich vegetarian burger made with red lentils and toasted sunflower seeds.',
    ingredients: [
      { name: 'red lentils', amount: 1, unit: 'cup' },
      { name: 'sunflower seeds', amount: 0.5, unit: 'cup', notes: 'toasted' },
      { name: 'onion, diced', amount: 1, unit: 'medium' },
      { name: 'garlic cloves, minced', amount: 3, unit: '' },
      { name: 'carrots, grated', amount: 2, unit: 'medium' },
      { name: 'rolled oats', amount: 0.5, unit: 'cup' },
      { name: 'flax seeds, ground', amount: 2, unit: 'tbsp' },
      { name: 'cumin, ground', amount: 1, unit: 'tsp' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 260,
      protein: 12,
      carbs: 28,
      fat: 14,
      vitamins: ['B1', 'B6', 'E'],
      minerals: ['Iron', 'Zinc', 'Magnesium']
    },
    timeToMake: '45 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Cook red lentils until tender, about 15 minutes. Drain well.',
      'Toast sunflower seeds in a dry skillet until fragrant.',
      'Sauté onion and garlic in 1 tbsp olive oil until softened.',
      'In a food processor, combine lentils, sunflower seeds, onion mixture, carrots, oats, and spices.',
      'Form into 6 patties and refrigerate for 30 minutes.',
      'Heat remaining oil in a skillet and cook patties until golden brown, about 4-5 minutes per side.'
    ]
  },
  {
    name: 'Seafood Sausage',
    description: 'A delicate seafood sausage made with fresh fish and shellfish.',
    ingredients: [
      { name: 'white fish fillet', amount: 0.5, unit: 'lb', notes: 'such as cod or halibut' },
      { name: 'scallops', amount: 0.5, unit: 'lb' },
      { name: 'shrimp, peeled', amount: 0.5, unit: 'lb' },
      { name: 'egg whites', amount: 2, unit: '' },
      { name: 'heavy cream', amount: 0.5, unit: 'cup' },
      { name: 'chives, minced', amount: 0.25, unit: 'cup' },
      { name: 'tarragon, chopped', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'white pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 180,
      protein: 28,
      carbs: 2,
      fat: 8,
      vitamins: ['B12', 'D'],
      minerals: ['Selenium', 'Iodine']
    },
    timeToMake: '1 hour',
    season: ['spring', 'summer'],
    cuisine: 'HSCA',
    mealType: ['Entree'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.1,
      Water: 0.6,
      Air: 0.1
    },
    instructions: [
      'Chill all seafood thoroughly. Cut into small pieces.',
      'In a food processor, blend seafood until smooth.',
      'Add egg whites, cream, herbs, salt, and pepper. Process until well combined.',
      'Form mixture into sausage shapes using plastic wrap.',
      'Poach in simmering water until firm, about 10-12 minutes.',
      'Let cool slightly before serving.'
    ]
  },
  {
    name: 'Broiled Arctic Char with Black Quinoa',
    description: 'Broiled arctic char served over black quinoa with rapini and capers.',
    ingredients: [
      { name: 'arctic char fillets', amount: 24, unit: 'oz', notes: '6 oz portions' },
      { name: 'black quinoa', amount: 1.5, unit: 'cups' },
      { name: 'rapini', amount: 2, unit: 'bunches' },
      { name: 'capers', amount: 3, unit: 'tbsp' },
      { name: 'lemon', amount: 2, unit: '', notes: '1 juiced, 1 for serving' },
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
      { name: 'garlic cloves, minced', amount: 4, unit: '' },
      { name: 'red pepper flakes', amount: 0.5, unit: 'tsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'black pepper', amount: 0.5, unit: 'tsp' }
    ],
    nutrition: {
      calories: 420,
      protein: 38,
      carbs: 32,
      fat: 18,
      vitamins: ['B12', 'D', 'K'],
      minerals: ['Omega-3', 'Iron']
    },
    timeToMake: '40 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dinner'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Cook black quinoa according to package instructions.',
      'Blanch rapini in boiling water for 2 minutes, then shock in ice water.',
      'Season arctic char with salt, pepper, and olive oil.',
      'Broil char for 8-10 minutes until cooked through.',
      'Sauté blanched rapini with garlic and red pepper flakes.',
      'Toss quinoa with capers, lemon juice, and remaining olive oil.',
      'Serve char over quinoa and rapini, garnished with lemon wedges.'
    ]
  }
]; 