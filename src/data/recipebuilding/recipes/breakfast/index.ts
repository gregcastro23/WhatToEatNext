import { Recipe } from '../../../types/recipe';

export const breakfastRecipes: Recipe[] = [
  {
    name: 'Blueberry Almond Overnight Oats',
    description: 'A delicious and healthy breakfast that you can prepare the night before.',
    ingredients: [
      { name: 'old-fashioned rolled oats', amount: 1, unit: 'cup' },
      { name: 'unsweetened almond milk', amount: 1, unit: 'cup', swaps: ['oat milk', 'soy milk'] },
      { name: 'Greek yogurt', amount: 0.5, unit: 'cup', swaps: ['coconut yogurt'] },
      { name: 'honey', amount: 2, unit: 'tbsp', swaps: ['maple syrup', 'agave nectar'] },
      { name: 'chia seeds', amount: 1, unit: 'tbsp' },
      { name: 'vanilla extract', amount: 0.5, unit: 'tsp' },
      { name: 'fresh blueberries', amount: 0.5, unit: 'cup' },
      { name: 'sliced almonds', amount: 0.25, unit: 'cup' }
    ],
    nutrition: {
      calories: 400,
      protein: 18,
      carbs: 60,
      fat: 12,
      vitamins: ['C', 'E'],
      minerals: ['Calcium', 'Iron']
    },
    timeToMake: '5 minutes (plus overnight refrigeration)',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a large bowl or mason jar, combine rolled oats, almond milk, Greek yogurt, honey, chia seeds, and vanilla extract. Mix well.',
      'Fold in fresh blueberries and sliced almonds.',
      'Cover the bowl or seal the jar and refrigerate overnight, or for at least 6 hours.',
      'In the morning, give the oats a stir. If the mixture is too thick, add a splash of almond milk to achieve desired consistency.',
      'Top with additional fresh blueberries and sliced almonds before serving, if desired.',
      'Enjoy cold or warm in the microwave for 1-2 minutes.'
    ]
  },
  {
    name: 'Spinach and Mushroom Frittata',
    description: 'A fluffy and flavorful frittata packed with spinach, mushrooms, and cheese.',
    ingredients: [
      { name: 'eggs', amount: 8, unit: '' },
      { name: 'milk', amount: 0.25, unit: 'cup' },
      { name: 'olive oil', amount: 1, unit: 'tbsp' },
      { name: 'onion, diced', amount: 1, unit: '' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'mushrooms, sliced', amount: 8, unit: 'oz' },
      { name: 'baby spinach', amount: 4, unit: 'cups' },
      { name: 'cheddar cheese, shredded', amount: 1, unit: 'cup', swaps: ['feta cheese', 'goat cheese'] },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 280,
      protein: 20,
      carbs: 8,
      fat: 18,
      vitamins: ['A', 'D', 'B12'],
      minerals: ['Iron', 'Calcium']
    },
    timeToMake: '35 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 375°F.',
      'In a large bowl, whisk together eggs, milk, salt, and pepper.',
      'In a large oven-safe skillet, heat olive oil over medium heat. Add onion and garlic, and cook until softened, about 5 minutes.',
      'Add mushrooms and cook until tender and liquid has evaporated, about 5 minutes.',
      'Add spinach and cook until wilted, about 2 minutes.',
      'Pour egg mixture over the vegetables in the skillet. Sprinkle shredded cheese on top.',
      'Cook on the stovetop for 2-3 minutes, until the edges start to set.',
      'Transfer the skillet to the preheated oven and bake for 15-20 minutes, until the frittata is set and lightly golden on top.',
      'Remove from oven, let cool for 5 minutes, then slice and serve hot.'
    ]
  },
  {
    name: 'Caprese Avocado Toast',
    description: 'A fresh and flavorful twist on classic avocado toast with tomatoes, mozzarella, and basil.',
    ingredients: [
      { name: 'whole grain bread', amount: 4, unit: 'slices' },
      { name: 'ripe avocados', amount: 2, unit: '' },
      { name: 'cherry tomatoes, halved', amount: 1, unit: 'cup' },
      { name: 'fresh mozzarella, torn', amount: 4, unit: 'oz' },
      { name: 'fresh basil leaves', amount: 0.25, unit: 'cup' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'balsamic glaze', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'red pepper flakes', amount: 0.25, unit: 'tsp', swaps: [] }
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 28,
      fat: 20,
      vitamins: ['C', 'K', 'B6'],
      minerals: ['Potassium', 'Calcium']
    },
    timeToMake: '15 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Toast the bread slices until golden brown.',
      'Mash the avocados in a bowl and season with salt and pepper.',
      'Spread mashed avocado evenly on each toast.',
      'Top with halved cherry tomatoes and torn mozzarella.',
      'Garnish with fresh basil leaves.',
      'Drizzle with olive oil and balsamic glaze.',
      'Sprinkle with red pepper flakes if desired.',
      'Serve immediately while toast is still warm.'
    ]
  },
  {
    name: 'Quinoa Breakfast Bowl',
    description: 'A warm and nourishing breakfast bowl with quinoa, fresh fruits, and nuts.',
    ingredients: [
      { name: 'quinoa', amount: 1, unit: 'cup' },
      { name: 'almond milk', amount: 2, unit: 'cups', swaps: ['oat milk', 'coconut milk'] },
      { name: 'cinnamon', amount: 1, unit: 'tsp' },
      { name: 'vanilla extract', amount: 0.5, unit: 'tsp' },
      { name: 'maple syrup', amount: 2, unit: 'tbsp', swaps: ['honey'] },
      { name: 'mixed berries', amount: 1, unit: 'cup' },
      { name: 'sliced almonds', amount: 0.25, unit: 'cup' },
      { name: 'chia seeds', amount: 1, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 320,
      protein: 10,
      carbs: 48,
      fat: 12,
      vitamins: ['B1', 'B2', 'E'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '25 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Rinse quinoa thoroughly under cold water.',
      'In a medium saucepan, combine quinoa, almond milk, cinnamon, and vanilla.',
      'Bring to a boil, then reduce heat and simmer for 15-20 minutes until quinoa is tender.',
      'Stir in maple syrup.',
      'Serve warm, topped with berries, almonds, and chia seeds.'
    ]
  },
  {
    name: 'Green Power Smoothie Bowl',
    description: 'A nutrient-rich smoothie bowl packed with greens, fruits, and superfood toppings.',
    ingredients: [
      { name: 'frozen banana', amount: 1, unit: 'large' },
      { name: 'spinach', amount: 2, unit: 'cups' },
      { name: 'frozen mango chunks', amount: 1, unit: 'cup' },
      { name: 'coconut water', amount: 1, unit: 'cup' },
      { name: 'protein powder', amount: 1, unit: 'scoop', swaps: ['hemp seeds'] },
      { name: 'ginger, grated', amount: 1, unit: 'tsp' },
      { name: 'granola', amount: 0.25, unit: 'cup' },
      { name: 'coconut flakes', amount: 2, unit: 'tbsp' },
      { name: 'fresh berries', amount: 0.5, unit: 'cup' }
    ],
    nutrition: {
      calories: 380,
      protein: 15,
      carbs: 62,
      fat: 8,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iron', 'Potassium']
    },
    timeToMake: '10 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'In a high-speed blender, combine banana, spinach, mango, coconut water, protein powder, and ginger.',
      'Blend until smooth and creamy. The mixture should be thicker than a regular smoothie.',
      'Pour into a bowl.',
      'Top with granola, coconut flakes, and fresh berries.',
      'Serve immediately.'
    ]
  },
  {
    name: 'Whole Grain Pancakes',
    description: 'Fluffy and nutritious pancakes made with whole grain flour and topped with fresh berries.',
    ingredients: [
      { name: 'whole wheat flour', amount: 1.5, unit: 'cups' },
      { name: 'baking powder', amount: 2, unit: 'tsp' },
      { name: 'cinnamon', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'almond milk', amount: 1.5, unit: 'cups', swaps: ['oat milk', 'soy milk'] },
      { name: 'eggs', amount: 2, unit: '' },
      { name: 'maple syrup', amount: 2, unit: 'tbsp', swaps: ['honey'] },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'coconut oil, melted', amount: 3, unit: 'tbsp' },
      { name: 'mixed berries', amount: 2, unit: 'cups' }
    ],
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 42,
      fat: 10,
      vitamins: ['B1', 'B2', 'C'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '25 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, whisk together whole wheat flour, baking powder, cinnamon, and salt.',
      'In another bowl, combine almond milk, eggs, maple syrup, and vanilla extract.',
      'Pour wet ingredients into dry ingredients and mix until just combined.',
      'Stir in melted coconut oil.',
      'Heat a griddle or non-stick pan over medium heat.',
      'Pour 1/4 cup batter for each pancake.',
      'Cook until bubbles form on surface, then flip and cook other side.',
      'Serve warm with fresh berries and additional maple syrup.'
    ]
  },
  {
    name: 'Breakfast Burrito Bowl',
    description: 'A hearty and healthy breakfast bowl with scrambled eggs, black beans, and fresh vegetables.',
    ingredients: [
      { name: 'brown rice, cooked', amount: 2, unit: 'cups' },
      { name: 'black beans, drained and rinsed', amount: 15, unit: 'oz' },
      { name: 'eggs', amount: 4, unit: '' },
      { name: 'cherry tomatoes, halved', amount: 1, unit: 'cup' },
      { name: 'avocado, sliced', amount: 1, unit: '' },
      { name: 'red onion, diced', amount: 0.5, unit: '' },
      { name: 'cilantro, chopped', amount: 0.25, unit: 'cup' },
      { name: 'lime juice', amount: 2, unit: 'tbsp' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'hot sauce', amount: 1, unit: 'tbsp', swaps: ['salsa'] }
    ],
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 52,
      fat: 16,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Iron', 'Potassium']
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Warm the cooked brown rice and black beans.',
      'Scramble the eggs in a pan with a little olive oil.',
      'Divide rice between bowls and top with scrambled eggs and black beans.',
      'Add cherry tomatoes, avocado slices, and diced red onion.',
      'Garnish with cilantro and a squeeze of lime juice.',
      'Drizzle with hot sauce if desired.',
      'Serve immediately while warm.'
    ]
  },
  {
    name: 'Amaranth Porridge',
    description: 'A nutrient-rich, creamy breakfast porridge made with ancient grain amaranth.',
    ingredients: [
      { name: 'amaranth', amount: 1, unit: 'cup' },
      { name: 'water', amount: 3, unit: 'cups' },
      { name: 'almond milk', amount: 1, unit: 'cup', notes: 'plus more for serving' },
      { name: 'cinnamon stick', amount: 1, unit: '' },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'maple syrup', amount: 2, unit: 'tbsp' },
      { name: 'sea salt', amount: 0.25, unit: 'tsp' },
      { name: 'fresh berries', amount: 1, unit: 'cup', notes: 'for serving' },
      { name: 'toasted almonds', amount: 0.25, unit: 'cup', notes: 'sliced, for serving' }
    ],
    nutrition: {
      calories: 280,
      protein: 9,
      carbs: 48,
      fat: 6,
      vitamins: ['B6', 'E'],
      minerals: ['Iron', 'Magnesium', 'Phosphorus']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'Rinse amaranth thoroughly in a fine-mesh strainer.',
      'In a medium saucepan, combine amaranth, water, and cinnamon stick.',
      'Bring to a boil, then reduce heat to low.',
      'Simmer covered for 20-25 minutes, stirring occasionally, until water is absorbed.',
      'Remove cinnamon stick and stir in almond milk, vanilla, maple syrup, and salt.',
      'Cook for an additional 5 minutes until creamy.',
      'Serve hot, topped with additional almond milk, fresh berries, and toasted almonds.'
    ]
  },
  {
    name: 'Mediterranean Shakshuka',
    description: 'Traditional Middle Eastern dish with eggs poached in spiced tomato sauce with herbs and feta.',
    ingredients: [
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'onion, diced', amount: 1, unit: 'medium' },
      { name: 'red bell pepper, diced', amount: 1, unit: '' },
      { name: 'garlic cloves, minced', amount: 4, unit: '' },
      { name: 'ground cumin', amount: 1, unit: 'tsp' },
      { name: 'paprika', amount: 1, unit: 'tsp' },
      { name: 'cayenne pepper', amount: 0.25, unit: 'tsp', swaps: ['red pepper flakes'] },
      { name: 'crushed tomatoes', amount: 28, unit: 'oz can' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'eggs', amount: 6, unit: '' },
      { name: 'feta cheese, crumbled', amount: 0.5, unit: 'cup', swaps: ['goat cheese'] },
      { name: 'fresh parsley, chopped', amount: 0.25, unit: 'cup' },
      { name: 'fresh cilantro, chopped', amount: 2, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 285,
      protein: 16,
      carbs: 15,
      fat: 18,
      vitamins: ['A', 'C', 'K', 'B12'],
      minerals: ['Iron', 'Calcium', 'Potassium']
    },
    timeToMake: '35 minutes',
    season: ['autumn', 'winter'],
    cuisine: 'Mediterranean',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.4,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Heat olive oil in a large skillet or cast iron pan over medium heat.',
      'Add onion and bell pepper, cook until softened, about 5 minutes.',
      'Add garlic, cumin, paprika, and cayenne. Cook for 1 minute until fragrant.',
      'Add crushed tomatoes, salt, and pepper. Simmer for 10-15 minutes until thickened.',
      'Create wells in the sauce and crack eggs into each well.',
      'Cover and cook for 10-12 minutes until egg whites are set but yolks are still runny.',
      'Sprinkle with feta cheese and fresh herbs.',
      'Serve hot with warm pita or crusty bread.'
    ]
  },
  {
    name: 'Chia Seed Parfait with Seasonal Fruits',
    description: 'Layered chia pudding parfait with fresh seasonal fruits, nuts, and coconut.',
    ingredients: [
      { name: 'chia seeds', amount: 0.5, unit: 'cup' },
      { name: 'coconut milk', amount: 2, unit: 'cups', swaps: ['almond milk', 'oat milk'] },
      { name: 'maple syrup', amount: 3, unit: 'tbsp', swaps: ['honey', 'agave nectar'] },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'Greek yogurt', amount: 1, unit: 'cup', swaps: ['coconut yogurt'] },
      { name: 'seasonal fresh fruits', amount: 2, unit: 'cups' },
      { name: 'granola', amount: 0.5, unit: 'cup' },
      { name: 'shredded coconut', amount: 0.25, unit: 'cup' },
      { name: 'chopped almonds', amount: 0.25, unit: 'cup', swaps: ['walnuts', 'pecans'] }
    ],
    nutrition: {
      calories: 340,
      protein: 12,
      carbs: 38,
      fat: 18,
      vitamins: ['C', 'E', 'B2'],
      minerals: ['Calcium', 'Magnesium', 'Phosphorus']
    },
    timeToMake: '10 minutes (plus 4 hours chilling)',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a bowl, whisk together chia seeds, coconut milk, maple syrup, and vanilla.',
      'Let sit for 5 minutes, then whisk again to prevent clumping.',
      'Refrigerate for at least 4 hours or overnight until thick and pudding-like.',
      'In glasses or jars, layer chia pudding, Greek yogurt, and fresh fruits.',
      'Top with granola, coconut, and chopped nuts.',
      'Serve immediately or refrigerate until ready to eat.'
    ]
  },
  {
    name: 'Savory Herb and Cheese Omelette',
    description: 'Classic French-style omelette filled with fresh herbs and artisanal cheese.',
    ingredients: [
      { name: 'eggs', amount: 3, unit: '' },
      { name: 'butter', amount: 2, unit: 'tbsp' },
      { name: 'fresh chives, chopped', amount: 2, unit: 'tbsp' },
      { name: 'fresh parsley, chopped', amount: 1, unit: 'tbsp' },
      { name: 'fresh tarragon, chopped', amount: 1, unit: 'tsp' },
      { name: 'gruyere cheese, grated', amount: 0.25, unit: 'cup', swaps: ['swiss cheese', 'cheddar'] },
      { name: 'cream cheese', amount: 2, unit: 'tbsp', swaps: ['ricotta'] },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'white pepper', amount: 0.125, unit: 'tsp' }
    ],
    nutrition: {
      calories: 320,
      protein: 22,
      carbs: 2,
      fat: 25,
      vitamins: ['A', 'D', 'B12', 'K'],
      minerals: ['Calcium', 'Selenium']
    },
    timeToMake: '15 minutes',
    season: ['spring', 'summer'],
    cuisine: 'French',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Beat eggs with salt and white pepper in a bowl.',
      'Heat butter in a non-stick pan over medium-low heat.',
      'Pour eggs into pan and gently stir with a fork while shaking the pan.',
      'When eggs are almost set but still slightly creamy, add herbs and cheeses to one half.',
      'Fold omelette in half and slide onto plate.',
      'Serve immediately with fresh herbs as garnish.'
    ]
  },
  {
    name: 'Sweet Potato Hash with Poached Eggs',
    description: 'Colorful breakfast hash with roasted sweet potatoes, vegetables, and perfectly poached eggs.',
    ingredients: [
      { name: 'sweet potatoes, diced', amount: 2, unit: 'large' },
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
      { name: 'red onion, diced', amount: 1, unit: 'medium' },
      { name: 'red bell pepper, diced', amount: 1, unit: '' },
      { name: 'yellow bell pepper, diced', amount: 1, unit: '' },
      { name: 'baby spinach', amount: 2, unit: 'cups' },
      { name: 'eggs', amount: 4, unit: '' },
      { name: 'smoked paprika', amount: 1, unit: 'tsp' },
      { name: 'garlic powder', amount: 0.5, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'fresh chives, chopped', amount: 2, unit: 'tbsp' },
      { name: 'avocado, sliced', amount: 1, unit: '', swaps: [] }
    ],
    nutrition: {
      calories: 385,
      protein: 16,
      carbs: 45,
      fat: 16,
      vitamins: ['A', 'C', 'K', 'B6'],
      minerals: ['Potassium', 'Iron', 'Magnesium']
    },
    timeToMake: '40 minutes',
    season: ['autumn', 'winter'],
    cuisine: 'American',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 425°F. Toss diced sweet potatoes with 2 tbsp olive oil, salt, and pepper.',
      'Roast for 20-25 minutes until tender and lightly caramelized.',
      'Heat remaining oil in a large skillet. Add onion and bell peppers, cook 5 minutes.',
      'Add roasted sweet potatoes, paprika, and garlic powder. Cook 5 minutes.',
      'Add spinach and cook until wilted.',
      'Meanwhile, poach eggs in simmering water for 3-4 minutes.',
      'Serve hash topped with poached eggs, avocado, and chives.'
    ]
  },
  {
    name: 'Coconut Rice Pudding Breakfast Bowl',
    description: 'Creamy coconut rice pudding served warm with tropical fruits and toasted coconut.',
    ingredients: [
      { name: 'jasmine rice, cooked', amount: 2, unit: 'cups' },
      { name: 'coconut milk', amount: 1.5, unit: 'cups' },
      { name: 'almond milk', amount: 0.5, unit: 'cup', swaps: ['oat milk'] },
      { name: 'brown sugar', amount: 0.25, unit: 'cup', swaps: ['coconut sugar'] },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'ground cinnamon', amount: 0.5, unit: 'tsp' },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'mango, diced', amount: 1, unit: 'cup' },
      { name: 'pineapple chunks', amount: 0.5, unit: 'cup' },
      { name: 'toasted coconut flakes', amount: 0.25, unit: 'cup' },
      { name: 'macadamia nuts, chopped', amount: 0.25, unit: 'cup', swaps: ['cashews'] }
    ],
    nutrition: {
      calories: 395,
      protein: 6,
      carbs: 58,
      fat: 16,
      vitamins: ['C', 'A', 'B1'],
      minerals: ['Manganese', 'Copper']
    },
    timeToMake: '25 minutes',
    season: ['summer', 'winter'],
    cuisine: 'Tropical',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.5,
      Air: 0.1
    },
    instructions: [
      'In a saucepan, combine cooked rice, coconut milk, almond milk, brown sugar, vanilla, cinnamon, and salt.',
      'Simmer over medium-low heat for 15-20 minutes, stirring frequently, until creamy.',
      'Remove from heat and let cool slightly.',
      'Serve warm topped with mango, pineapple, toasted coconut, and macadamia nuts.',
      'Can be stored in refrigerator and reheated with additional milk if needed.'
    ]
  },
  {
    name: 'Protein-Packed Breakfast Quinoa Bowl',
    description: 'Nutritious quinoa breakfast bowl with plant-based protein, fresh vegetables, and tahini dressing.',
    ingredients: [
      { name: 'quinoa, cooked', amount: 2, unit: 'cups' },
      { name: 'hemp seeds', amount: 3, unit: 'tbsp' },
      { name: 'pumpkin seeds', amount: 2, unit: 'tbsp' },
      { name: 'cucumber, diced', amount: 1, unit: 'small' },
      { name: 'cherry tomatoes, halved', amount: 1, unit: 'cup' },
      { name: 'radishes, thinly sliced', amount: 4, unit: '' },
      { name: 'microgreens', amount: 1, unit: 'cup', swaps: ['sprouts'] },
      { name: 'tahini', amount: 3, unit: 'tbsp' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'olive oil', amount: 1, unit: 'tbsp' },
      { name: 'garlic clove, minced', amount: 1, unit: '' },
      { name: 'sea salt', amount: 0.25, unit: 'tsp' },
      { name: 'nutritional yeast', amount: 2, unit: 'tbsp', swaps: ['parmesan cheese'] }
    ],
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 45,
      fat: 20,
      vitamins: ['K', 'C', 'E', 'B1'],
      minerals: ['Magnesium', 'Iron', 'Zinc']
    },
    timeToMake: '20 minutes',
    season: ['spring', 'summer'],
    cuisine: 'Plant-Based',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.2
    },
    instructions: [
      'Warm the cooked quinoa in a saucepan or microwave.',
      'In a small bowl, whisk together tahini, lemon juice, olive oil, garlic, and salt.',
      'Divide quinoa between bowls and top with hemp seeds, pumpkin seeds, cucumber, tomatoes, and radishes.',
      'Drizzle with tahini dressing and sprinkle with microgreens and nutritional yeast.',
      'Serve immediately while quinoa is warm.'
    ]
  },
  {
    name: 'Buckwheat Pancakes with Berry Compote',
    description: 'Nutty, gluten-free buckwheat pancakes served with homemade mixed berry compote.',
    ingredients: [
      { name: 'buckwheat flour', amount: 1, unit: 'cup' },
      { name: 'almond flour', amount: 0.5, unit: 'cup' },
      { name: 'baking powder', amount: 2, unit: 'tsp' },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'almond milk', amount: 1.25, unit: 'cups', swaps: ['oat milk'] },
      { name: 'eggs', amount: 2, unit: '' },
      { name: 'honey', amount: 2, unit: 'tbsp', swaps: ['maple syrup'] },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'coconut oil, melted', amount: 2, unit: 'tbsp' },
      { name: 'mixed berries', amount: 2, unit: 'cups' },
      { name: 'lemon juice', amount: 1, unit: 'tbsp' },
      { name: 'chia seeds', amount: 1, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 295,
      protein: 10,
      carbs: 42,
      fat: 11,
      vitamins: ['C', 'K', 'B1', 'B2'],
      minerals: ['Manganese', 'Magnesium', 'Iron']
    },
    timeToMake: '30 minutes',
    season: ['summer', 'autumn'],
    cuisine: 'Gluten-Free',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'In a bowl, whisk together buckwheat flour, almond flour, baking powder, and salt.',
      'In another bowl, combine almond milk, eggs, honey, and vanilla.',
      'Pour wet ingredients into dry and mix until just combined. Stir in melted coconut oil.',
      'For compote, simmer berries with lemon juice and chia seeds for 10 minutes until thickened.',
      'Cook pancakes in a heated pan for 2-3 minutes per side until golden.',
      'Serve warm with berry compote and additional honey if desired.'
    ]
  },
  {
    name: 'Avocado and Egg Breakfast Wrap',
    description: 'Whole grain wrap filled with creamy avocado, scrambled eggs, and fresh vegetables.',
    ingredients: [
      { name: 'whole grain tortillas', amount: 2, unit: 'large' },
      { name: 'eggs', amount: 4, unit: '' },
      { name: 'ripe avocados', amount: 1, unit: 'large' },
      { name: 'cherry tomatoes, quartered', amount: 0.5, unit: 'cup' },
      { name: 'red onion, thinly sliced', amount: 0.25, unit: 'small' },
      { name: 'baby spinach', amount: 1, unit: 'cup' },
      { name: 'sharp cheddar cheese, shredded', amount: 0.5, unit: 'cup', swaps: ['pepper jack'] },
      { name: 'olive oil', amount: 1, unit: 'tbsp' },
      { name: 'lime juice', amount: 1, unit: 'tbsp' },
      { name: 'hot sauce', amount: 1, unit: 'tsp', swaps: ['salsa'] },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'black pepper', amount: 0.125, unit: 'tsp' }
    ],
    nutrition: {
      calories: 445,
      protein: 22,
      carbs: 32,
      fat: 26,
      vitamins: ['K', 'C', 'A', 'B12'],
      minerals: ['Potassium', 'Calcium', 'Iron']
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'Mexican-Inspired',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.2
    },
    instructions: [
      'Warm tortillas in a dry skillet or microwave.',
      'Scramble eggs with salt and pepper in olive oil until just set.',
      'Mash avocado with lime juice and a pinch of salt.',
      'Spread avocado mixture on tortillas, then add scrambled eggs.',
      'Top with tomatoes, onion, spinach, cheese, and hot sauce.',
      'Roll up tightly and serve immediately, or wrap in foil for later.'
    ]
  },
  {
    name: 'Matcha Green Tea Smoothie Bowl',
    description: 'Antioxidant-rich matcha smoothie bowl topped with fresh fruits and crunchy superfoods.',
    ingredients: [
      { name: 'frozen banana', amount: 1, unit: 'large' },
      { name: 'frozen mango chunks', amount: 0.5, unit: 'cup' },
      { name: 'ceremonial grade matcha powder', amount: 1, unit: 'tsp' },
      { name: 'coconut milk', amount: 0.5, unit: 'cup' },
      { name: 'vanilla protein powder', amount: 1, unit: 'scoop', swaps: ['silken tofu'] },
      { name: 'honey', amount: 1, unit: 'tbsp', swaps: ['agave nectar'] },
      { name: 'fresh kiwi, sliced', amount: 1, unit: '' },
      { name: 'fresh strawberries, sliced', amount: 0.5, unit: 'cup' },
      { name: 'granola', amount: 0.25, unit: 'cup' },
      { name: 'coconut flakes', amount: 2, unit: 'tbsp' },
      { name: 'chia seeds', amount: 1, unit: 'tbsp' }
    ],
    nutrition: {
      calories: 365,
      protein: 18,
      carbs: 55,
      fat: 10,
      vitamins: ['C', 'K', 'A'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '10 minutes',
    season: ['spring', 'summer'],
    cuisine: 'Japanese-Inspired',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.2,
      Water: 0.4,
      Air: 0.3
    },
    instructions: [
      'In a high-speed blender, combine banana, mango, matcha powder, coconut milk, protein powder, and honey.',
      'Blend until smooth and thick. The consistency should be thicker than a regular smoothie.',
      'Pour into a bowl and arrange toppings in sections: kiwi, strawberries, granola, coconut, and chia seeds.',
      'Serve immediately for best texture and flavor.',
      'Optional: drizzle with additional honey or coconut milk.'
    ]
  },
  {
    name: 'Smoked Salmon and Cream Cheese Bagel',
    description: 'Classic New York-style bagel with house-cured smoked salmon, cream cheese, and traditional garnishes.',
    ingredients: [
      { name: 'everything bagels', amount: 2, unit: '', swaps: ['sesame bagels', 'poppy seed bagels'] },
      { name: 'cream cheese', amount: 4, unit: 'oz' },
      { name: 'smoked salmon', amount: 4, unit: 'oz' },
      { name: 'red onion, thinly sliced', amount: 0.25, unit: 'small' },
      { name: 'capers', amount: 2, unit: 'tbsp' },
      { name: 'fresh dill, chopped', amount: 2, unit: 'tbsp' },
      { name: 'cucumber, thinly sliced', amount: 0.5, unit: 'small' },
      { name: 'cherry tomatoes, sliced', amount: 4, unit: '' },
      { name: 'lemon wedges', amount: 2, unit: '' },
      { name: 'black pepper', amount: 0.125, unit: 'tsp' }
    ],
    nutrition: {
      calories: 420,
      protein: 25,
      carbs: 45,
      fat: 15,
      vitamins: ['B12', 'D', 'A', 'K'],
      minerals: ['Sodium', 'Phosphorus', 'Selenium']
    },
    timeToMake: '10 minutes',
    season: ['all'],
    cuisine: 'Jewish-American',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'Slice bagels in half and toast until golden brown.',
      'Spread cream cheese generously on both halves.',
      'Layer smoked salmon over cream cheese.',
      'Top with red onion slices, capers, and fresh dill.',
      'Add cucumber and tomato slices.',
      'Serve with lemon wedges and freshly cracked black pepper.'
    ]
  },
  {
    name: 'Spiced Apple Cinnamon Overnight Oats',
    description: 'Warming overnight oats with spiced apples, cinnamon, and a hint of cardamom.',
    ingredients: [
      { name: 'old-fashioned rolled oats', amount: 1, unit: 'cup' },
      { name: 'unsweetened oat milk', amount: 1, unit: 'cup', swaps: ['almond milk'] },
      { name: 'Greek yogurt', amount: 0.5, unit: 'cup', swaps: ['coconut yogurt'] },
      { name: 'maple syrup', amount: 2, unit: 'tbsp', swaps: ['honey'] },
      { name: 'vanilla extract', amount: 0.5, unit: 'tsp' },
      { name: 'ground cinnamon', amount: 1, unit: 'tsp' },
      { name: 'ground cardamom', amount: 0.25, unit: 'tsp' },
      { name: 'chia seeds', amount: 1, unit: 'tbsp' },
      { name: 'apple, diced', amount: 1, unit: 'medium' },
      { name: 'chopped walnuts', amount: 0.25, unit: 'cup', swaps: ['pecans'] },
      { name: 'dried cranberries', amount: 2, unit: 'tbsp', swaps: ['raisins'] }
    ],
    nutrition: {
      calories: 385,
      protein: 15,
      carbs: 58,
      fat: 12,
      vitamins: ['C', 'A', 'B1'],
      minerals: ['Manganese', 'Phosphorus', 'Magnesium']
    },
    timeToMake: '10 minutes (plus overnight)',
    season: ['autumn', 'winter'],
    cuisine: 'American',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'In a bowl or jar, combine oats, oat milk, yogurt, maple syrup, vanilla, cinnamon, cardamom, and chia seeds.',
      'Mix well and add diced apple.',
      'Cover and refrigerate overnight or at least 4 hours.',
      'In the morning, stir and add more liquid if needed.',
      'Top with walnuts and dried cranberries before serving.',
      'Can be prepared up to 3 days in advance.'
    ]
  },
  {
    name: 'Turkish Menemen',
    description: 'Traditional Turkish scrambled eggs with tomatoes, peppers, and aromatic spices.',
    ingredients: [
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
      { name: 'onion, sliced', amount: 1, unit: 'medium' },
      { name: 'green bell pepper, sliced', amount: 1, unit: '' },
      { name: 'tomatoes, chopped', amount: 3, unit: 'large' },
      { name: 'tomato paste', amount: 1, unit: 'tbsp' },
      { name: 'red pepper flakes', amount: 0.5, unit: 'tsp' },
      { name: 'sweet paprika', amount: 1, unit: 'tsp' },
      { name: 'eggs', amount: 6, unit: '' },
      { name: 'Turkish white cheese', amount: 0.5, unit: 'cup', swaps: ['feta cheese'] },
      { name: 'fresh parsley, chopped', amount: 0.25, unit: 'cup' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
      { name: 'black pepper', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 295,
      protein: 18,
      carbs: 12,
      fat: 20,
      vitamins: ['A', 'C', 'K', 'B12'],
      minerals: ['Calcium', 'Iron', 'Potassium']
    },
    timeToMake: '25 minutes',
    season: ['summer', 'autumn'],
    cuisine: 'Turkish',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Heat olive oil in a large skillet over medium heat.',
      'Add onion and bell pepper, cook until softened, about 8 minutes.',
      'Add tomatoes, tomato paste, red pepper flakes, and paprika. Cook 10 minutes until thickened.',
      'Beat eggs with salt and pepper, then pour into the pan.',
      'Gently scramble eggs with the vegetable mixture until just set.',
      'Remove from heat, crumble cheese on top, and garnish with parsley.',
      'Serve hot with Turkish bread or pita.'
    ]
  },
  {
    name: 'Miso Mushroom and Spinach Scramble',
    description: 'Umami-rich scrambled eggs with sautéed mushrooms, spinach, and miso glaze.',
    ingredients: [
      { name: 'eggs', amount: 6, unit: '' },
      { name: 'white miso paste', amount: 1, unit: 'tbsp' },
      { name: 'mirin', amount: 1, unit: 'tbsp', swaps: ['rice vinegar'] },
      { name: 'sesame oil', amount: 2, unit: 'tsp' },
      { name: 'shiitake mushrooms, sliced', amount: 8, unit: 'oz' },
      { name: 'baby spinach', amount: 4, unit: 'cups' },
      { name: 'green onions, chopped', amount: 3, unit: '' },
      { name: 'garlic cloves, minced', amount: 2, unit: '' },
      { name: 'ginger, grated', amount: 1, unit: 'tsp' },
      { name: 'sesame seeds', amount: 1, unit: 'tbsp' },
      { name: 'nori sheets, torn', amount: 1, unit: '', swaps: [] }
    ],
    nutrition: {
      calories: 255,
      protein: 18,
      carbs: 8,
      fat: 16,
      vitamins: ['K', 'A', 'B12', 'D'],
      minerals: ['Iron', 'Selenium', 'Phosphorus']
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'Japanese-Inspired',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Whisk miso paste with mirin until smooth, then beat with eggs.',
      'Heat sesame oil in a large non-stick pan over medium heat.',
      'Add mushrooms and cook until golden, about 5 minutes.',
      'Add garlic and ginger, cook 1 minute until fragrant.',
      'Add spinach and cook until wilted.',
      'Pour in egg mixture and gently scramble until just set.',
      'Garnish with green onions, sesame seeds, and torn nori before serving.'
    ]
  },
  {
    name: 'Acai Bowl with Granola and Fresh Fruits',
    description: 'Antioxidant-packed acai bowl topped with homemade granola and vibrant fresh fruits.',
    ingredients: [
      { name: 'frozen acai puree', amount: 2, unit: 'packs' },
      { name: 'frozen banana', amount: 0.5, unit: '' },
      { name: 'frozen blueberries', amount: 0.5, unit: 'cup' },
      { name: 'coconut water', amount: 0.25, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp', swaps: ['agave nectar'] },
      { name: 'granola', amount: 0.5, unit: 'cup' },
      { name: 'fresh strawberries, sliced', amount: 0.5, unit: 'cup' },
      { name: 'fresh banana, sliced', amount: 0.5, unit: '' },
      { name: 'kiwi, sliced', amount: 1, unit: '' },
      { name: 'coconut flakes', amount: 2, unit: 'tbsp' },
      { name: 'chia seeds', amount: 1, unit: 'tbsp' },
      { name: 'goji berries', amount: 1, unit: 'tbsp', swaps: ['dried cranberries'] }
    ],
    nutrition: {
      calories: 350,
      protein: 8,
      carbs: 72,
      fat: 8,
      vitamins: ['C', 'A', 'E'],
      minerals: ['Potassium', 'Manganese']
    },
    timeToMake: '10 minutes',
    season: ['summer'],
    cuisine: 'Brazilian-Inspired',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.2,
      Water: 0.5,
      Air: 0.2
    },
    instructions: [
      'In a blender, combine frozen acai, banana, blueberries, coconut water, and honey.',
      'Blend until thick and creamy, adding minimal liquid to maintain thick consistency.',
      'Pour into a bowl and smooth the surface.',
      'Arrange toppings in sections: granola, strawberries, banana, kiwi.',
      'Sprinkle with coconut flakes, chia seeds, and goji berries.',
      'Serve immediately with a spoon.'
    ]
  },
  {
    name: 'Cottage Cheese Protein Pancakes',
    description: 'High-protein, fluffy pancakes made with cottage cheese and whole grain flour.',
    ingredients: [
      { name: 'cottage cheese', amount: 1, unit: 'cup' },
      { name: 'eggs', amount: 3, unit: '' },
      { name: 'whole wheat flour', amount: 0.5, unit: 'cup' },
      { name: 'baking powder', amount: 1, unit: 'tsp' },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'honey', amount: 2, unit: 'tbsp', swaps: ['maple syrup'] },
      { name: 'cinnamon', amount: 0.5, unit: 'tsp' },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
      { name: 'coconut oil', amount: 2, unit: 'tbsp' },
      { name: 'fresh berries', amount: 1, unit: 'cup' },
      { name: 'Greek yogurt', amount: 0.5, unit: 'cup', swaps: [] }
    ],
    nutrition: {
      calories: 285,
      protein: 22,
      carbs: 28,
      fat: 10,
      vitamins: ['B12', 'A', 'C'],
      minerals: ['Calcium', 'Phosphorus', 'Selenium']
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Breakfast'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'In a blender, combine cottage cheese, eggs, flour, baking powder, vanilla, honey, cinnamon, and salt.',
      'Blend until smooth and well combined.',
      'Heat coconut oil in a non-stick pan over medium heat.',
      'Pour batter to form pancakes, cook 2-3 minutes until bubbles form.',
      'Flip and cook another 2 minutes until golden brown.',
      'Serve hot topped with fresh berries and Greek yogurt.'
    ]
  },
  {
    name: 'Kimchi and Egg Breakfast Bowl',
    description: 'Fermented Korean kimchi served over rice with a fried egg and sesame oil drizzle.',
    ingredients: [
      { name: 'brown rice, cooked', amount: 2, unit: 'cups' },
      { name: 'kimchi, chopped', amount: 0.75, unit: 'cup' },
      { name: 'eggs', amount: 2, unit: '' },
      { name: 'sesame oil', amount: 2, unit: 'tsp' },
      { name: 'soy sauce', amount: 1, unit: 'tbsp', swaps: ['tamari'] },
      { name: 'rice vinegar', amount: 1, unit: 'tsp' },
      { name: 'green onions, sliced', amount: 2, unit: '' },
      { name: 'sesame seeds', amount: 1, unit: 'tbsp' },
      { name: 'nori sheets, torn', amount: 1, unit: '' },
      { name: 'avocado, sliced', amount: 0.5, unit: '', swaps: [] }
    ],
    nutrition: {
      calories: 385,
      protein: 16,
      carbs: 48,
      fat: 14,
      vitamins: ['K', 'C', 'A', 'B12'],
      minerals: ['Iron', 'Potassium', 'Phosphorus']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'Korean-Inspired',
    mealType: ['Breakfast', 'Brunch'],
    elementalBalance: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    instructions: [
      'Warm the cooked brown rice in a pan or microwave.',
      'Heat kimchi in a small pan for 2-3 minutes until heated through.',
      'Fry eggs sunny-side up or over-easy in a lightly oiled pan.',
      'Divide rice between bowls and top with heated kimchi.',
      'Place fried egg on top and drizzle with sesame oil and soy sauce.',
      'Garnish with green onions, sesame seeds, nori, and avocado slices.',
      'Serve immediately while eggs are warm.'
    ]
  }
]; 