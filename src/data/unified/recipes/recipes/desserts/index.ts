import { Recipe } from '../../../types/recipe';

export const dessertRecipes: Recipe[] = [
  {
    name: 'Chocolate Chip Cookies',
    description: 'Classic homemade chocolate chip cookies.',
    ingredients: [
      { name: 'all-purpose flour', amount: 2.25, unit: 'cups' },
      { name: 'baking soda', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'butter, softened', amount: 1, unit: 'cup' },
      { name: 'granulated sugar', amount: 0.75, unit: 'cup' },
      { name: 'packed brown sugar', amount: 0.75, unit: 'cup' },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'large eggs', amount: 2, unit: '' },
      { name: 'semisweet chocolate chips', amount: 2, unit: 'cups' },
      { name: 'chopped nuts (optional)', amount: 1, unit: 'cup', swaps: ['dried fruit'] }
    ],
    nutrition: {
      calories: 450,
      protein: 6,
      carbs: 62,
      fat: 24,
      vitamins: ['A', 'D'],
      minerals: ['Iron', 'Calcium']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.5,
      Water: 0.2,
      Air: 0.2
    },
    instructions: [
      'Preheat oven to 375° F. Line half sheet tray with parchment paper.',
      'In a small bowl, whisk together flour, baking soda and salt.',
      'In a large bowl, beat butter and sugars until light and fluffy, about 2 minutes.',
      'Beat in vanilla and then eggs one at a time until combined.',
      'Gradually stir flour mixture into butter mixture. Mix in chocolate chips and nuts (if using).',
      'Drop rounded tablespoons of dough onto prepared sheet tray about 2 inches apart.',
      'Bake until edges are lightly browned, 8 to 10 minutes. Cool on sheet tray 5 minutes before transferring to wire rack.'
    ]
  },
  {
    name: 'Mango Chia Pudding',
    description: 'A creamy and refreshing pudding made with chia seeds and sweet mango.',
    ingredients: [
      { name: 'chia seeds', amount: 0.5, unit: 'cup' },
      { name: 'almond milk', amount: 2, unit: 'cups', swaps: ['coconut milk', 'oat milk'] },
      { name: 'honey', amount: 2, unit: 'tbsp', swaps: ['maple syrup', 'agave nectar'] },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'ripe mango, diced', amount: 1, unit: '' },
      { name: 'coconut flakes', amount: 0.25, unit: 'cup' }
    ],
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 40,
      fat: 12,
      vitamins: ['C', 'E'],
      minerals: ['Calcium', 'Magnesium']
    },
    timeToMake: '4 hours',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Breakfast', 'Dessert'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.5,
      Air: 0.1
    },
    instructions: [
      'In a large bowl, whisk together chia seeds, almond milk, honey, and vanilla extract.',
      'Cover and refrigerate for at least 4 hours, or overnight, until the mixture thickens and the chia seeds have absorbed the liquid.',
      'Layer the chia pudding and diced mango in glasses or bowls.',
      'Top with coconut flakes and additional diced mango, if desired.',
      'Serve chilled and enjoy!'
    ]
  },
  {
    name: 'Coffee Custard',
    description: 'A dairy-free coffee custard with maple and pecan garnish.',
    ingredients: [
      { name: 'almond milk', amount: 3.5, unit: 'cups' },
      { name: 'agar flakes', amount: 2, unit: 'tbsp' },
      { name: 'maple syrup', amount: 0.5, unit: 'cup' },
      { name: 'kuzu', amount: 1, unit: 'tbsp' },
      { name: 'instant coffee', amount: 0.25, unit: 'cup' },
      { name: 'water', amount: 0.5, unit: 'cup' },
      { name: 'maple crystals', amount: 0.5, unit: 'cup' },
      { name: 'pecans, toasted', amount: 0.5, unit: 'cup' }
    ],
    nutrition: {
      calories: 180,
      protein: 3,
      carbs: 32,
      fat: 6,
      vitamins: ['E'],
      minerals: ['Manganese', 'Magnesium']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In 2 ½ quart pot, combine milk and agar. Soak agar 5 minutes.',
      'Bring mixture to boil, lower heat, and simmer uncovered for about 5 minutes or more, until agar is completely dissolved.',
      'Add maple syrup and stir until combined.',
      'Dissolve kuzu and coffee in water until there are no lumps. Add to milk mixture and simmer until slightly thickened.',
      'Lightly oil ramekins and sprinkle 2 teaspoons maple crystals in bottom of each ramekin.',
      'Pour custard into ramekins. Refrigerate to set.',
      'When custard is set, run paring knife around side of each ramekin to separate custard.',
      'Invert custard onto plate. Garnish with pecans.'
    ]
  },
  {
    name: 'Coconut-Lime Flan',
    description: 'A tropical dairy-free flan with coconut milk and lime.',
    ingredients: [
      { name: 'coconut milk', amount: 3.5, unit: 'cups' },
      { name: 'agar flakes', amount: 2, unit: 'tbsp' },
      { name: 'maple syrup', amount: 0.5, unit: 'cup' },
      { name: 'kuzu', amount: 1, unit: 'tbsp' },
      { name: 'lime juice', amount: 3, unit: 'tbsp' },
      { name: 'water', amount: 0.5, unit: 'cup' },
      { name: 'maple crystals', amount: 0.5, unit: 'cup' },
      { name: 'toasted dried coconut', amount: 0.5, unit: 'cup' }
    ],
    nutrition: {
      calories: 220,
      protein: 2,
      carbs: 26,
      fat: 14,
      vitamins: ['C'],
      minerals: ['Iron', 'Manganese']
    },
    timeToMake: '30 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.5,
      Air: 0.1
    },
    instructions: [
      'In 2 ½ quart pot, combine coconut milk and agar. Soak agar for 5 minutes.',
      'Bring mixture to boil. Reduce heat and simmer uncovered until agar is completely dissolved.',
      'Add maple syrup and stir until combined.',
      'Dissolve kuzu in lime juice and water until there are no lumps. Add to milk mixture and simmer until thickened.',
      'Lightly oil ramekins and sprinkle maple crystals in bottom of each ramekin.',
      'Pour custard into ramekins. Refrigerate to set.',
      'When set, run paring knife around the side of each ramekin to separate custard.',
      'Invert custard onto plate. Garnish with coconut.'
    ]
  },
  {
    name: 'Berry-Grape Kanten',
    description: 'A refreshing Japanese-inspired dessert made with agar and fresh fruits.',
    ingredients: [
      { name: 'white grape juice', amount: 2, unit: 'cups' },
      { name: 'agar flakes', amount: 2.5, unit: 'tbsp' },
      { name: 'ginger juice', amount: 1.5, unit: 'tsp' },
      { name: 'lemon zest', amount: 1.5, unit: 'tsp' },
      { name: 'agave syrup', amount: 0.25, unit: 'cup' },
      { name: 'green grapes', amount: 9, unit: 'oz' },
      { name: 'strawberries', amount: 4, unit: 'oz' }
    ],
    nutrition: {
      calories: 120,
      protein: 1,
      carbs: 28,
      fat: 0,
      vitamins: ['C', 'K'],
      minerals: ['Manganese', 'Potassium']
    },
    timeToMake: '45 minutes',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.2,
      Water: 0.6,
      Air: 0.1
    },
    instructions: [
      'In 2 ½ quart pot, combine grape juice and agar flakes. Soak agar for 5 minutes.',
      'Bring agar-juice mixture to boil over medium heat, whisking frequently. Lower flame and simmer 5 minutes or until agar is completely dissolved.',
      'Add ginger juice, lemon zest, and agave syrup to juice mixture. Simmer 2 minutes more.',
      'Divide and arrange grapes and strawberries equally among individual ramekins.',
      'Slowly pour juice mixture over grapes and strawberries in ramekins. Let mixture stand until no more steam rises.',
      'Transfer kanten to refrigerator until firmed up, about 30 minutes.',
      'Serve kanten as is from ramekins.'
    ]
  },
  {
    name: 'Berry Chia Pudding',
    description: 'A healthy and delicious dessert made with chia seeds and fresh berries.',
    ingredients: [
      { name: 'chia seeds', amount: 0.5, unit: 'cup' },
      { name: 'almond milk', amount: 2, unit: 'cups', swaps: ['coconut milk', 'oat milk'] },
      { name: 'maple syrup', amount: 3, unit: 'tbsp', swaps: ['honey'] },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'mixed berries', amount: 2, unit: 'cups' },
      { name: 'sliced almonds', amount: 0.25, unit: 'cup' }
    ],
    nutrition: {
      calories: 220,
      protein: 8,
      carbs: 28,
      fat: 12,
      vitamins: ['C', 'E'],
      minerals: ['Calcium', 'Omega-3']
    },
    timeToMake: '10 minutes (plus 4 hours chilling)',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dessert', 'Breakfast'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'In a medium bowl, whisk together chia seeds, almond milk, maple syrup, and vanilla extract.',
      'Cover and refrigerate for at least 4 hours or overnight.',
      'Stir pudding to break up any clumps.',
      'Layer pudding with fresh berries in serving glasses.',
      'Top with sliced almonds and serve chilled.'
    ]
  },
  {
    name: 'Apple-Pear Crisp',
    description: 'A warm and comforting fruit crisp with a crunchy oat topping.',
    ingredients: [
      { name: 'apples, sliced', amount: 3, unit: 'large' },
      { name: 'pears, sliced', amount: 3, unit: 'large' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'maple syrup', amount: 0.25, unit: 'cup' },
      { name: 'cinnamon', amount: 1, unit: 'tsp' },
      { name: 'rolled oats', amount: 1, unit: 'cup' },
      { name: 'almond flour', amount: 0.5, unit: 'cup' },
      { name: 'chopped nuts', amount: 0.5, unit: 'cup' },
      { name: 'coconut oil, melted', amount: 0.25, unit: 'cup' },
      { name: 'salt', amount: 0.25, unit: 'tsp' }
    ],
    nutrition: {
      calories: 280,
      protein: 5,
      carbs: 42,
      fat: 12,
      vitamins: ['C', 'E'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '1 hour',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Preheat oven to 350°F.',
      'In a large bowl, toss sliced fruit with lemon juice, maple syrup, and cinnamon.',
      'In another bowl, combine oats, almond flour, nuts, melted coconut oil, and salt.',
      'Transfer fruit mixture to a baking dish.',
      'Sprinkle oat mixture evenly over the fruit.',
      'Bake for 45-50 minutes until fruit is tender and topping is golden brown.',
      'Let cool slightly before serving.'
    ]
  },
  {
    name: 'Matcha Green Tea Ice Cream',
    description: 'A dairy-free ice cream with the distinct flavor of matcha green tea.',
    ingredients: [
      { name: 'coconut milk, full fat', amount: 2, unit: 'cans' },
      { name: 'matcha powder', amount: 2, unit: 'tbsp' },
      { name: 'maple syrup', amount: 0.5, unit: 'cup' },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 0.125, unit: 'tsp' }
    ],
    nutrition: {
      calories: 220,
      protein: 2,
      carbs: 18,
      fat: 16,
      vitamins: ['E'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '30 minutes (plus 4 hours freezing)',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.3,
      Water: 0.4,
      Air: 0.2
    },
    instructions: [
      'In a blender, combine all ingredients until smooth.',
      'Pour mixture into an ice cream maker and churn according to manufacturer\'s instructions.',
      'Transfer to a freezer-safe container.',
      'Freeze for at least 4 hours before serving.',
      'Let sit at room temperature for 5 minutes before scooping.'
    ]
  },
  {
    name: 'Dark Chocolate Avocado Mousse',
    description: 'A rich and creamy chocolate mousse made with ripe avocados and dark chocolate.',
    ingredients: [
      { name: 'ripe avocados', amount: 2, unit: 'large' },
      { name: 'dark chocolate, melted', amount: 8, unit: 'oz' },
      { name: 'cocoa powder', amount: 0.25, unit: 'cup' },
      { name: 'maple syrup', amount: 0.333, unit: 'cup', swaps: ['honey'] },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'almond milk', amount: 0.25, unit: 'cup' },
      { name: 'salt', amount: 0.125, unit: 'tsp' },
      { name: 'fresh raspberries', amount: 1, unit: 'cup' }
    ],
    nutrition: {
      calories: 280,
      protein: 4,
      carbs: 26,
      fat: 20,
      vitamins: ['E', 'K'],
      minerals: ['Magnesium', 'Potassium']
    },
    timeToMake: '15 minutes (plus 2 hours chilling)',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.4,
      Water: 0.4,
      Air: 0.1
    },
    instructions: [
      'In a food processor, blend avocados until smooth.',
      'Add melted chocolate, cocoa powder, maple syrup, vanilla, almond milk, and salt.',
      'Process until completely smooth and creamy.',
      'Divide into serving dishes.',
      'Refrigerate for at least 2 hours or until chilled.',
      'Top with fresh raspberries before serving.'
    ]
  },
  {
    name: 'Apple Phyllo Roll',
    description: 'A delicate and crispy pastry filled with spiced apples and wrapped in flaky phyllo dough.',
    ingredients: [
      { name: 'phyllo dough sheets', amount: 8, unit: 'sheets' },
      { name: 'apples', amount: 4, unit: 'large', notes: 'peeled and thinly sliced' },
      { name: 'lemon juice', amount: 1, unit: 'tbsp' },
      { name: 'maple syrup', amount: 0.25, unit: 'cup' },
      { name: 'cinnamon', amount: 1, unit: 'tsp' },
      { name: 'nutmeg', amount: 0.25, unit: 'tsp' },
      { name: 'coconut oil, melted', amount: 0.333, unit: 'cup' },
      { name: 'almonds', amount: 0.5, unit: 'cup', notes: 'finely chopped' }
    ],
    nutrition: {
      calories: 260,
      protein: 4,
      carbs: 38,
      fat: 12,
      vitamins: ['C', 'E'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '45 minutes',
    season: ['fall', 'winter'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.3
    },
    instructions: [
      'Preheat oven to 375°F.',
      'In a bowl, combine sliced apples, lemon juice, maple syrup, cinnamon, and nutmeg.',
      'Lay out one phyllo sheet and brush with melted coconut oil.',
      'Layer another sheet on top and repeat until all sheets are used.',
      'Spread apple mixture along one long edge of the phyllo stack.',
      'Sprinkle with chopped almonds.',
      'Roll up carefully, tucking in edges.',
      'Brush top with remaining coconut oil.',
      'Bake for 25-30 minutes until golden brown and crispy.'
    ]
  },
  {
    name: 'Berry Sorbet',
    description: 'A refreshing dairy-free sorbet made with mixed berries and natural sweeteners.',
    ingredients: [
      { name: 'mixed berries', amount: 4, unit: 'cups', notes: 'fresh or frozen' },
      { name: 'maple syrup', amount: 0.333, unit: 'cup' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'water', amount: 0.5, unit: 'cup' },
      { name: 'mint leaves', amount: 0.25, unit: 'cup', notes: 'for garnish' }
    ],
    nutrition: {
      calories: 120,
      protein: 1,
      carbs: 30,
      fat: 0,
      vitamins: ['C', 'K'],
      minerals: ['Manganese', 'Potassium']
    },
    timeToMake: '20 minutes (plus 4 hours freezing)',
    season: ['summer'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.1,
      Earth: 0.1,
      Water: 0.6,
      Air: 0.2
    },
    instructions: [
      'Combine berries, maple syrup, lemon juice, and water in a blender.',
      'Blend until completely smooth.',
      'Strain mixture through a fine-mesh sieve to remove seeds.',
      'Pour into ice cream maker and churn according to manufacturer\'s instructions.',
      'Transfer to a freezer-safe container.',
      'Freeze for at least 4 hours until firm.',
      'Let sit at room temperature for 5 minutes before scooping.',
      'Garnish with fresh mint leaves before serving.'
    ]
  },
  {
    name: 'Chocolate Fondue',
    description: 'A rich and creamy dairy-free chocolate fondue perfect for dipping fruits and treats.',
    ingredients: [
      { name: 'dark chocolate', amount: 12, unit: 'oz', notes: 'chopped' },
      { name: 'coconut milk', amount: 1, unit: 'cup', notes: 'full fat' },
      { name: 'maple syrup', amount: 2, unit: 'tbsp' },
      { name: 'vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'sea salt', amount: 0.125, unit: 'tsp' },
      { name: 'assorted fruits', amount: 4, unit: 'cups', notes: 'for dipping' },
      { name: 'nuts', amount: 1, unit: 'cup', notes: 'toasted, for dipping' }
    ],
    nutrition: {
      calories: 280,
      protein: 3,
      carbs: 22,
      fat: 21,
      vitamins: ['E'],
      minerals: ['Iron', 'Magnesium']
    },
    timeToMake: '15 minutes',
    season: ['all'],
    cuisine: 'HSCA',
    mealType: ['Dessert'],
    elementalBalance: {
      Fire: 0.2,
      Earth: 0.4,
      Water: 0.3,
      Air: 0.1
    },
    instructions: [
      'Chop chocolate into small pieces for even melting.',
      'Heat coconut milk in a medium saucepan until just simmering.',
      'Remove from heat and add chopped chocolate.',
      'Let stand for 1 minute, then whisk until smooth.',
      'Stir in maple syrup, vanilla extract, and salt.',
      'Transfer to a fondue pot or serving bowl.',
      'Serve with assorted fruits and toasted nuts for dipping.',
      'Keep warm while serving.'
    ]
  }
]; 