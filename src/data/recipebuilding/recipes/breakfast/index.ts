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
  }
]; 