import type { _, _ZodiacSign } from '@/types/alchemy';
import type { Cuisine } from '@/types/cuisine';

export const american: Cuisine = {
  id: 'american',
  name: 'American',
  description:
    'A diverse and evolving cuisine reflecting regional traditions, immigrant influences, and innovative culinary trends throughout the United States.',
  dishes: {
    breakfast: {
      all: [
        {
          name: 'Buttermilk Pancakes',
          description: 'Fluffy, golden pancakes made with buttermilk and served with maple syrup',
          cuisine: 'American',
          cookingMethods: ['pan-frying', 'flipping'],
          tools: ['mixing bowl', 'whisk', 'griddle or skillet', 'spatula', 'measuring cups'],
          preparationSteps: [
            'Mix dry ingredients',
            'Combine wet ingredients separately',
            'Mix wet into dry until just combined',
            'Let batter rest briefly',
            'Cook on medium heat griddle',
            'Flip when bubbles form',
            'Serve with toppings'
          ],
          ingredients: [
            {
              name: 'all-purpose flour',
              amount: '2',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'buttermilk', amount: '2', unit: 'cups', category: 'dairy', element: 'Water' }
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein', element: 'Water' }
            { name: 'butter', amount: '4', unit: 'tbsp', category: 'fat', element: 'Earth' }
            {
              name: 'maple syrup',
              amount: '1/2',
              unit: 'cup',
              category: 'sweetener',
              element: 'Water'
            }
            {
              name: 'baking powder',
              amount: '2',
              unit: 'tsp',
              category: 'leavening',
              element: 'Air'
            }
          ],
          substitutions: {
            buttermilk: ['yogurt+milk', 'milk+lemon juice'],
            'maple syrup': ['honey', 'agave nectar'],
            butter: ['coconut oil', 'vegetable oil']
          },
          servingSize: 4,
          allergens: ['gluten', 'dairy', 'eggs'],
          prepTime: '10 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A staple of American breakfast cuisine, these pancakes are often enjoyed during lazy weekend mornings as family gatherings',
          pairingSuggestions: ['bacon', 'fresh berries', 'scrambled eggs', 'coffee'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 420,
            protein: 11,
            carbs: 62,
            fat: 16,
            vitamins: ['B12', 'D'],
            minerals: ['Calcium', 'Phosphorus']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.4,
            Earth: 0.4,
            Air: 0.1
          }
          // Enhanced with moon phase affinities
          lunarPhaseInfluences: ['full moon', 'waxing gibbous'],
          zodiacInfluences: ['cancer', 'taurus'],
          astrologicalAffinities: {
            planets: ['moon', 'venus'],
            signs: ['cancer', 'taurus'],
            lunarPhases: ['full moon', 'waxing gibbous']
          }
        }
        {
          name: 'Avocado Toast with Poached Eggs',
          description:
            'Crusty whole grain toast topped with mashed avocado, poached eggs, and seasonings',
          cuisine: 'American',
          cookingMethods: ['toasting', 'poaching', 'mashing'],
          tools: ['toaster', 'small pot', 'slotted spoon', 'fork', 'knife'],
          preparationSteps: [
            'Toast bread',
            'Mash avocado with seasonings',
            'Poach eggs',
            'Spread avocado on toast',
            'Top with poached egg',
            'Garnish with herbs and seasonings'
          ],
          ingredients: [
            {
              name: 'whole grain bread',
              amount: '2',
              unit: 'slices',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'avocado', amount: '1', unit: 'medium', category: 'fruit', element: 'Earth' }
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein', element: 'Water' }
            { name: 'lemon juice', amount: '1', unit: 'tsp', category: 'acid', element: 'Water' }
            {
              name: 'red pepper flakes',
              amount: '1/4',
              unit: 'tsp',
              category: 'spice',
              element: 'Fire'
            }
            {
              name: 'microgreens',
              amount: '1/4',
              unit: 'cup',
              category: 'vegetable',
              element: 'Air'
            }
          ],
          substitutions: {
            'whole grain bread': ['sourdough', 'gluten-free bread'],
            avocado: ['hummus', 'nut butter'],
            eggs: ['tofu', 'chickpeas']
          },
          servingSize: 1,
          allergens: ['gluten', 'eggs'],
          prepTime: '5 minutes',
          cookTime: '5 minutes',
          culturalNotes: 'A modern American breakfast that gained popularity in urban centers before spreading nationwide. Represents the fusion of California cuisine with health-conscious trends',
          pairingSuggestions: ['fresh fruit', 'coffee', 'green smoothie'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 380,
            protein: 15,
            carbs: 30,
            fat: 24,
            vitamins: ['E', 'K', 'B12'],
            minerals: ['Potassium', 'Iron']
          },
          season: ['spring', 'summer'],
          mealType: ['breakfast', 'brunch'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.3,
            Earth: 0.5,
            Air: 0.1
          }
          // Enhanced with moon phase affinities
          lunarPhaseInfluences: ['new moon', 'waxing crescent'],
          zodiacInfluences: ['virgo', 'taurus'],
          astrologicalAffinities: {
            planets: ['mercury', 'venus'],
            signs: ['virgo', 'taurus'],
            lunarPhases: ['new moon', 'waxing crescent']
          }
        }
        {
          name: 'Southern Biscuits and Gravy',
          description: 'Flaky buttermilk biscuits smothered in rich sausage gravy',
          cuisine: 'American',
          cookingMethods: ['baking', 'simmering'],
          tools: ['mixing bowl', 'pastry cutter', 'baking sheet', 'skillet', 'wooden spoon'],
          preparationSteps: [
            'Prepare biscuit dough',
            'Cut in cold butter',
            'Roll and cut biscuits',
            'Bake until golden',
            'Cook sausage',
            'Make gravy with drippings',
            'Serve biscuits with gravy'
          ],
          ingredients: [
            {
              name: 'all-purpose flour',
              amount: '3',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'buttermilk', amount: '1', unit: 'cup', category: 'dairy', element: 'Water' }
            { name: 'butter', amount: '1/2', unit: 'cup', category: 'fat', element: 'Earth' }
            {
              name: 'pork sausage',
              amount: '1',
              unit: 'pound',
              category: 'protein',
              element: 'Fire'
            }
            { name: 'milk', amount: '2', unit: 'cups', category: 'dairy', element: 'Water' }
            { name: 'black pepper', amount: '1', unit: 'tsp', category: 'spice', element: 'Fire' }
          ],
          substitutions: {
            'pork sausage': ['turkey sausage', 'vegetarian sausage'],
            butter: ['vegetable shortening', 'coconut oil'],
            milk: ['almond milk', 'oat milk']
          },
          servingSize: 6,
          allergens: ['gluten', 'dairy'],
          prepTime: '20 minutes',
          cookTime: '20 minutes',
          culturalNotes: 'A quintessential Southern breakfast dish with roots in early American frontier cooking. Traditionally served as a hearty start to a day of manual labor',
          pairingSuggestions: ['fried eggs', 'grits', 'fresh fruit', 'coffee'],
          dietaryInfo: ['contains meat', 'high calorie'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 580,
            protein: 18,
            carbs: 48,
            fat: 36,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Iron']
          },
          season: ['autumn', 'winter'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.3,
            Earth: 0.4,
            Air: 0.0
          }
          // Enhanced with moon phase affinities
          lunarPhaseInfluences: ['full moon', 'waning gibbous'],
          zodiacInfluences: ['taurus', 'cancer', 'scorpio'],
          astrologicalAffinities: {
            planets: ['mars', 'saturn'],
            signs: ['taurus', 'cancer', 'scorpio'],
            lunarPhases: ['full moon', 'waning gibbous']
          }
        }
      ],
      spring: [
        {
          name: 'Spring Vegetable Frittata',
          description: 'Open-faced omelet packed with seasonal spring vegetables and herbs',
          cuisine: 'American',
          cookingMethods: ['sautéing', 'baking'],
          ingredients: [
            { name: 'eggs', amount: '8', unit: 'large', category: 'protein', element: 'Water' }
            {
              name: 'asparagus',
              amount: '1',
              unit: 'bunch',
              category: 'vegetable',
              element: 'Air'
            }
            {
              name: 'fresh peas',
              amount: '1',
              unit: 'cup',
              category: 'vegetable',
              element: 'Earth'
            }
            {
              name: 'green onions',
              amount: '4',
              unit: 'stalks',
              category: 'vegetable',
              element: 'Air'
            }
            { name: 'goat cheese', amount: '4', unit: 'oz', category: 'dairy', element: 'Earth' }
            { name: 'fresh herbs', amount: '1/4', unit: 'cup', category: 'herb', element: 'Air' }
          ],
          nutrition: {
            calories: 320,
            protein: 22,
            carbs: 12,
            fat: 22,
            vitamins: ['A', 'C', 'B12'],
            minerals: ['Calcium', 'Iron']
          },
          timeToMake: '30 minutes',
          season: ['spring'],
          mealType: ['breakfast', 'brunch'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.3,
            Earth: 0.2,
            Air: 0.4
          },
          lunarPhaseInfluences: ['waxing crescent', 'first quarter'],
          zodiacInfluences: ['aries', 'taurus'],
          astrologicalAffinities: {
            planets: ['mercury', 'venus'],
            signs: ['aries', 'taurus'],
            lunarPhases: ['waxing crescent', 'first quarter']
          }
        }
      ],
      summer: [
        {
          name: 'Berry Breakfast Smoothie Bowl',
          description: 'Vibrant smoothie bowl with fresh summer berries and crunchy toppings',
          cuisine: 'American',
          cookingMethods: ['blending', 'assembling'],
          ingredients: [
            {
              name: 'mixed berries',
              amount: '2',
              unit: 'cups',
              category: 'fruit',
              element: 'Water'
            }
            { name: 'banana', amount: '1', unit: 'medium', category: 'fruit', element: 'Earth' }
            { name: 'greek yogurt', amount: '1', unit: 'cup', category: 'dairy', element: 'Water' }
            { name: 'honey', amount: '1', unit: 'tbsp', category: 'sweetener', element: 'Water' }
            { name: 'granola', amount: '1/4', unit: 'cup', category: 'grain', element: 'Earth' }
            { name: 'chia seeds', amount: '1', unit: 'tbsp', category: 'seed', element: 'Earth' }
          ],
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 68,
            fat: 8,
            vitamins: ['C', 'K', 'B12'],
            minerals: ['Potassium', 'Magnesium']
          },
          timeToMake: '15 minutes',
          season: ['summer'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.0,
            Water: 0.5,
            Earth: 0.4,
            Air: 0.1
          },
          lunarPhaseInfluences: ['full moon', 'waxing gibbous'],
          zodiacInfluences: ['cancer', 'leo'],
          astrologicalAffinities: {
            planets: ['moon', 'sun'],
            signs: ['cancer', 'leo'],
            lunarPhases: ['full moon', 'waxing gibbous']
          }
        }
      ],
      autumn: [
        {
          name: 'Pumpkin Spice Oatmeal',
          description: 'Creamy steel-cut oatmeal with pumpkin puree and warm fall spices',
          cuisine: 'American',
          cookingMethods: ['simmering', 'stirring'],
          ingredients: [
            {
              name: 'steel-cut oats',
              amount: '1',
              unit: 'cup',
              category: 'grain',
              element: 'Earth'
            }
            {
              name: 'pumpkin puree',
              amount: '1/2',
              unit: 'cup',
              category: 'vegetable',
              element: 'Earth'
            }
            { name: 'cinnamon', amount: '1', unit: 'tsp', category: 'spice', element: 'Fire' }
            { name: 'nutmeg', amount: '1/4', unit: 'tsp', category: 'spice', element: 'Fire' }
            {
              name: 'maple syrup',
              amount: '2',
              unit: 'tbsp',
              category: 'sweetener',
              element: 'Water'
            }
            { name: 'pecans', amount: '1/4', unit: 'cup', category: 'nut', element: 'Earth' }
          ],
          nutrition: {
            calories: 320,
            protein: 10,
            carbs: 52,
            fat: 12,
            vitamins: ['A', 'E'],
            minerals: ['Iron', 'Magnesium']
          },
          timeToMake: '30 minutes',
          season: ['autumn'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.6,
            Air: 0.0
          },
          lunarPhaseInfluences: ['waning gibbous', 'last quarter'],
          zodiacInfluences: ['virgo', 'libra'],
          astrologicalAffinities: {
            planets: ['venus', 'saturn'],
            signs: ['virgo', 'libra'],
            lunarPhases: ['waning gibbous', 'last quarter']
          }
        }
      ],
      winter: [
        {
          name: 'Cranberry Orange Breakfast Bread',
          description: 'Hearty quick bread with tart cranberries and bright orange zest',
          cuisine: 'American',
          cookingMethods: ['baking', 'mixing'],
          ingredients: [
            {
              name: 'all-purpose flour',
              amount: '2',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'cranberries', amount: '1', unit: 'cup', category: 'fruit', element: 'Water' }
            { name: 'orange zest', amount: '2', unit: 'tbsp', category: 'fruit', element: 'Fire' }
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein', element: 'Water' }
            { name: 'butter', amount: '1/2', unit: 'cup', category: 'fat', element: 'Earth' }
            { name: 'walnuts', amount: '1/2', unit: 'cup', category: 'nut', element: 'Earth' }
          ],
          nutrition: {
            calories: 280,
            protein: 5,
            carbs: 36,
            fat: 14,
            vitamins: ['C', 'E'],
            minerals: ['Iron', 'Selenium']
          },
          timeToMake: '65 minutes',
          season: ['winter'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.5,
            Air: 0.1
          },
          lunarPhaseInfluences: ['new moon', 'waning crescent'],
          zodiacInfluences: ['capricorn', 'aquarius'],
          astrologicalAffinities: {
            planets: ['saturn', 'uranus'],
            signs: ['capricorn', 'aquarius'],
            lunarPhases: ['new moon', 'waning crescent']
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: 'Classic Cheeseburger',
          description:
            'Juicy grilled beef patty topped with melted cheese on a toasted bun with fresh vegetables',
          cuisine: 'American',
          cookingMethods: ['grilling', 'toasting', 'assembling'],
          tools: ['grill or skillet', 'spatula', 'toaster', 'knife', 'cutting board'],
          preparationSteps: [
            'Form beef patties',
            'Season with salt and pepper',
            'Grill until desired doneness',
            'Top with cheese',
            'Toast buns',
            'Assemble with toppings',
            'Add condiments'
          ],
          ingredients: [
            {
              name: 'ground beef',
              amount: '1',
              unit: 'pound',
              category: 'protein',
              element: 'Fire'
            }
            {
              name: 'hamburger buns',
              amount: '4',
              unit: 'buns',
              category: 'grain',
              element: 'Earth'
            }
            {
              name: 'cheddar cheese',
              amount: '4',
              unit: 'slices',
              category: 'dairy',
              element: 'Earth'
            }
            {
              name: 'lettuce',
              amount: '4',
              unit: 'leaves',
              category: 'vegetable',
              element: 'Water'
            }
            {
              name: 'tomato',
              amount: '1',
              unit: 'medium',
              category: 'vegetable',
              element: 'Water'
            }
            {
              name: 'onion',
              amount: '1/2',
              unit: 'medium',
              category: 'vegetable',
              element: 'Fire'
            }
            { name: 'ketchup', amount: '4', unit: 'tbsp', category: 'condiment', element: 'Fire' }
            { name: 'mustard', amount: '4', unit: 'tsp', category: 'condiment', element: 'Fire' }
          ],
          substitutions: {
            'ground beef': ['ground turkey', 'impossible burger', 'beyond burger'],
            'cheddar cheese': ['american cheese', 'dairy-free cheese'],
            'hamburger buns': ['lettuce wraps', 'gluten-free buns']
          },
          servingSize: 4,
          allergens: ['gluten', 'dairy'],
          prepTime: '15 minutes',
          cookTime: '10 minutes',
          culturalNotes:
            'The quintessential American food, evolved from German immigrants' Hamburg steak in the late 19th century. Became a cultural icon in mid-20th century America',
          pairingSuggestions: ['french fries', 'coleslaw', 'pickle', 'beer'],
          dietaryInfo: ['contains meat', 'high protein'],
          spiceLevel: 'none',
          nutrition: {
            calories: 520,
            protein: 32,
            carbs: 30,
            fat: 28,
            vitamins: ['B12', 'B6'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all', 'summer'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.5,
            Water: 0.1,
            Earth: 0.3,
            Air: 0.1
          },
          lunarPhaseInfluences: ['full moon', 'first quarter'],
          zodiacInfluences: ['aries', 'leo', 'taurus'],
          astrologicalAffinities: {
            planets: ['mars', 'sun'],
            signs: ['aries', 'leo', 'taurus'],
            lunarPhases: ['full moon', 'first quarter']
          }
        }
        {
          name: 'Cobb Salad',
          description:
            'Composed salad with rows of chicken, bacon, eggs, avocado, and blue cheese over lettuce',
          cuisine: 'American',
          cookingMethods: ['chopping', 'assembling', 'boiling'],
          tools: ['cutting board', 'knife', 'saucepan', 'frying pan', 'salad bowl'],
          preparationSteps: [
            'Cook chicken',
            'Fry bacon until crisp',
            'Hard-boil eggs',
            'Chop vegetables',
            'Arrange ingredients in rows',
            'Prepare dressing',
            'Serve with dressing on side'
          ],
          ingredients: [
            {
              name: 'romaine lettuce',
              amount: '1',
              unit: 'head',
              category: 'vegetable',
              element: 'Water'
            }
            {
              name: 'grilled chicken',
              amount: '2',
              unit: 'breasts',
              category: 'protein',
              element: 'Fire'
            }
            { name: 'bacon', amount: '6', unit: 'slices', category: 'protein', element: 'Fire' }
            {
              name: 'hard-boiled eggs',
              amount: '3',
              unit: 'large',
              category: 'protein',
              element: 'Water'
            }
            { name: 'avocado', amount: '1', unit: 'medium', category: 'fruit', element: 'Earth' }
            {
              name: 'blue cheese',
              amount: '1/2',
              unit: 'cup',
              category: 'dairy',
              element: 'Earth'
            }
            {
              name: 'cherry tomatoes',
              amount: '1',
              unit: 'cup',
              category: 'vegetable',
              element: 'Water'
            }
            {
              name: 'red wine vinaigrette',
              amount: '1/2',
              unit: 'cup',
              category: 'dressing',
              element: 'Water'
            }
          ],
          substitutions: {
            chicken: ['turkey', 'tofu', 'chickpeas'],
            bacon: ['turkey bacon', 'tempeh bacon'],
            'blue cheese': ['feta', 'dairy-free cheese']
          },
          servingSize: 4,
          allergens: ['egg', 'dairy'],
          prepTime: '30 minutes',
          cookTime: '20 minutes',
          culturalNotes:
            'Created in the 1930s at the Hollywood Brown Derby restaurant, named after its owner Robert Cobb. Became popular as a hearty main-course salad in American restaurants',
          pairingSuggestions: ['crusty bread', 'iced tea', 'white wine'],
          dietaryInfo: ['contains meat', 'high protein', 'gluten-free'],
          spiceLevel: 'none',
          nutrition: {
            calories: 480,
            protein: 38,
            carbs: 12,
            fat: 32,
            vitamins: ['A', 'K', 'B12'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['all', 'summer'],
          mealType: ['lunch'],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.4,
            Earth: 0.3,
            Air: 0.1
          },
          lunarPhaseInfluences: ['first quarter', 'waxing gibbous'],
          zodiacInfluences: ['virgo', 'libra'],
          astrologicalAffinities: {
            planets: ['venus', 'mercury'],
            signs: ['virgo', 'libra'],
            lunarPhases: ['first quarter', 'waxing gibbous']
          }
        }
        {
          name: 'New England Clam Chowder',
          description: 'Creamy seafood soup with clams, potatoes, and bacon in a rich milk broth',
          cuisine: 'American',
          cookingMethods: ['simmering', 'sautéing'],
          tools: ['large pot', 'wooden spoon', 'knife', 'cutting board', 'measuring cups'],
          preparationSteps: [
            'Render bacon fat',
            'Sauté aromatics',
            'Add potatoes and broth',
            'Simmer until tender',
            'Add clams and cream',
            'Season to taste',
            'Serve with oyster crackers'
          ],
          ingredients: [
            { name: 'clams', amount: '2', unit: 'pounds', category: 'seafood', element: 'Water' }
            { name: 'bacon', amount: '4', unit: 'slices', category: 'protein', element: 'Fire' }
            {
              name: 'potatoes',
              amount: '2',
              unit: 'large',
              category: 'vegetable',
              element: 'Earth'
            }
            { name: 'onion', amount: '1', unit: 'medium', category: 'vegetable', element: 'Fire' }
            {
              name: 'celery',
              amount: '2',
              unit: 'stalks',
              category: 'vegetable',
              element: 'Water'
            }
            { name: 'heavy cream', amount: '1', unit: 'cup', category: 'dairy', element: 'Water' }
            { name: 'clam juice', amount: '2', unit: 'cups', category: 'broth', element: 'Water' }
            { name: 'thyme', amount: '1', unit: 'tsp', category: 'herb', element: 'Air' }
          ],
          substitutions: {
            clams: ['canned clams', 'white fish'],
            'heavy cream': ['half and half', 'coconut milk'],
            bacon: ['salt pork', 'olive oil']
          },
          servingSize: 6,
          allergens: ['dairy', 'shellfish'],
          prepTime: '20 minutes',
          cookTime: '30 minutes',
          culturalNotes: 'A regional specialty from New England dating back to the 18th century. Traditional Friday meal for Catholic New Englanders who avoided meat on Fridays',
          pairingSuggestions: ['oyster crackers', 'sourdough bread', 'green salad'],
          dietaryInfo: ['contains seafood', 'contains pork'],
          spiceLevel: 'none',
          nutrition: {
            calories: 380,
            protein: 22,
            carbs: 24,
            fat: 22,
            vitamins: ['B12', 'D'],
            minerals: ['Iron', 'Zinc', 'Iodine']
          },
          season: ['autumn', 'winter'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.6,
            Earth: 0.2,
            Air: 0.1
          },
          lunarPhaseInfluences: ['full moon', 'waning gibbous'],
          zodiacInfluences: ['cancer', 'pisces'],
          astrologicalAffinities: {
            planets: ['moon', 'neptune'],
            signs: ['cancer', 'pisces'],
            lunarPhases: ['full moon', 'waning gibbous']
          }
        }
      ],
      spring: [
        {
          name: 'Asparagus and Goat Cheese Tart',
          description: 'Buttery pastry topped with fresh asparagus and tangy goat cheese',
          cuisine: 'American',
          cookingMethods: ['baking', 'blind baking'],
          ingredients: [
            { name: 'puff pastry', amount: '1', unit: 'sheet', category: 'dough', element: 'Air' }
            {
              name: 'asparagus',
              amount: '1',
              unit: 'bunch',
              category: 'vegetable',
              element: 'Air'
            }
            { name: 'goat cheese', amount: '4', unit: 'oz', category: 'dairy', element: 'Earth' }
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein', element: 'Water' }
            { name: 'lemon zest', amount: '1', unit: 'tsp', category: 'citrus', element: 'Fire' }
            { name: 'fresh thyme', amount: '1', unit: 'tbsp', category: 'herb', element: 'Air' }
          ],
          nutrition: {
            calories: 380,
            protein: 14,
            carbs: 28,
            fat: 25,
            vitamins: ['A', 'K', 'C'],
            minerals: ['Calcium', 'Folate']
          },
          timeToMake: '45 minutes',
          season: ['spring'],
          mealType: ['lunch', 'brunch'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.2,
            Earth: 0.3,
            Air: 0.4
          },
          lunarPhaseInfluences: ['waxing crescent', 'first quarter'],
          zodiacInfluences: ['taurus', 'gemini'],
          astrologicalAffinities: {
            planets: ['venus', 'mercury'],
            signs: ['taurus', 'gemini'],
            lunarPhases: ['waxing crescent', 'first quarter']
          }
        }
      ],
      summer: [
        {
          name: 'Lobster Roll',
          description: 'Fresh lobster meat tossed with mayo and lemon on a buttered roll',
          cuisine: 'American',
          cookingMethods: ['boiling', 'mixing'],
          ingredients: [
            {
              name: 'lobster meat',
              amount: '1',
              unit: 'pound',
              category: 'seafood',
              element: 'Water'
            }
            {
              name: 'mayonnaise',
              amount: '1/4',
              unit: 'cup',
              category: 'condiment',
              element: 'Water'
            }
            { name: 'celery', amount: '1', unit: 'stalk', category: 'vegetable', element: 'Water' }
            {
              name: 'split-top buns',
              amount: '4',
              unit: 'rolls',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'butter', amount: '2', unit: 'tbsp', category: 'fat', element: 'Earth' }
            { name: 'lemon juice', amount: '1', unit: 'tbsp', category: 'acid', element: 'Water' }
          ],
          nutrition: {
            calories: 420,
            protein: 28,
            carbs: 22,
            fat: 24,
            vitamins: ['B12', 'E'],
            minerals: ['Zinc', 'Copper']
          },
          timeToMake: '25 minutes',
          season: ['summer'],
          mealType: ['lunch'],
          elementalProperties: {
            Fire: 0.0,
            Water: 0.7,
            Earth: 0.2,
            Air: 0.1
          },
          lunarPhaseInfluences: ['full moon', 'waxing gibbous'],
          zodiacInfluences: ['cancer', 'scorpio'],
          astrologicalAffinities: {
            planets: ['moon', 'neptune'],
            signs: ['cancer', 'scorpio'],
            lunarPhases: ['full moon', 'waxing gibbous']
          }
        }
      ],
      autumn: [
        {
          name: 'Turkey and Cranberry Sandwich',
          description: 'Sliced turkey with cranberry sauce and stuffing on whole grain bread',
          cuisine: 'American',
          cookingMethods: ['assembling'],
          ingredients: [
            { name: 'sliced turkey', amount: '8', unit: 'oz', category: 'protein', element: 'Air' }
            {
              name: 'cranberry sauce',
              amount: '4',
              unit: 'tbsp',
              category: 'condiment',
              element: 'Water'
            }
            { name: 'stuffing', amount: '1/2', unit: 'cup', category: 'grain', element: 'Earth' }
            {
              name: 'whole grain bread',
              amount: '4',
              unit: 'slices',
              category: 'grain',
              element: 'Earth'
            }
            {
              name: 'mayonnaise',
              amount: '2',
              unit: 'tbsp',
              category: 'condiment',
              element: 'Water'
            }
            { name: 'sage', amount: '1', unit: 'tsp', category: 'herb', element: 'Air' }
          ],
          nutrition: {
            calories: 420,
            protein: 26,
            carbs: 48,
            fat: 14,
            vitamins: ['B3', 'B6'],
            minerals: ['Iron', 'Selenium']
          },
          timeToMake: '10 minutes',
          season: ['autumn'],
          mealType: ['lunch'],
          elementalProperties: {
            Fire: 0.0,
            Water: 0.3,
            Earth: 0.4,
            Air: 0.3
          },
          lunarPhaseInfluences: ['waning gibbous', 'last quarter'],
          zodiacInfluences: ['virgo', 'libra'],
          astrologicalAffinities: {
            planets: ['mercury', 'venus'],
            signs: ['virgo', 'libra'],
            lunarPhases: ['waning gibbous', 'last quarter']
          }
        }
      ],
      winter: [
        {
          name: 'Loaded Baked Potato Soup',
          description: 'Creamy potato soup topped with cheese, bacon, and green onions',
          cuisine: 'American',
          cookingMethods: ['simmering', 'pureeing'],
          ingredients: [
            {
              name: 'russet potatoes',
              amount: '2',
              unit: 'pounds',
              category: 'vegetable',
              element: 'Earth'
            }
            { name: 'bacon', amount: '6', unit: 'slices', category: 'protein', element: 'Fire' }
            { name: 'milk', amount: '2', unit: 'cups', category: 'dairy', element: 'Water' }
            {
              name: 'cheddar cheese',
              amount: '1',
              unit: 'cup',
              category: 'dairy',
              element: 'Earth'
            }
            { name: 'sour cream', amount: '1/2', unit: 'cup', category: 'dairy', element: 'Water' }
            {
              name: 'green onions',
              amount: '4',
              unit: 'stalks',
              category: 'vegetable',
              element: 'Air'
            }
          ],
          nutrition: {
            calories: 380,
            protein: 16,
            carbs: 36,
            fat: 22,
            vitamins: ['C', 'B12'],
            minerals: ['Potassium', 'Calcium']
          },
          timeToMake: '40 minutes',
          season: ['winter'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.4,
            Earth: 0.4,
            Air: 0.1
          },
          lunarPhaseInfluences: ['waning crescent', 'new moon'],
          zodiacInfluences: ['capricorn', 'taurus'],
          astrologicalAffinities: {
            planets: ['saturn', 'venus'],
            signs: ['capricorn', 'taurus'],
            lunarPhases: ['waning crescent', 'new moon']
          }
        }
      ]
    },
    dinner: {
      all: [
        {
          name: 'BBQ Ribs',
          description: 'Slow-cooked pork ribs with tangy-sweet barbecue sauce and smoky flavor',
          cuisine: 'American',
          cookingMethods: ['slow cooking', 'grilling', 'basting'],
          tools: ['grill or smoker', 'large pot', 'aluminum foil', 'basting brush', 'tongs'],
          preparationSteps: [
            'Remove membrane from ribs',
            'Apply dry rub',
            'Slow cook for several hours',
            'Baste with BBQ sauce',
            'Finish on grill or broiler',
            'Rest before cutting',
            'Serve with extra sauce'
          ],
          ingredients: [
            { name: 'pork ribs', amount: '2', unit: 'racks', category: 'protein', element: 'Fire' }
            { name: 'BBQ sauce', amount: '2', unit: 'cups', category: 'sauce', element: 'Fire' }
            {
              name: 'brown sugar',
              amount: '1/4',
              unit: 'cup',
              category: 'sweetener',
              element: 'Earth'
            }
            { name: 'paprika', amount: '2', unit: 'tbsp', category: 'spice', element: 'Fire' }
            {
              name: 'garlic powder',
              amount: '1',
              unit: 'tbsp',
              category: 'spice',
              element: 'Fire'
            }
            { name: 'black pepper', amount: '1', unit: 'tbsp', category: 'spice', element: 'Fire' }
          ],
          substitutions: {
            'pork ribs': ['beef ribs', 'seitan ribs'],
            'BBQ sauce': ['homemade sauce', 'keto BBQ sauce'],
            'brown sugar': ['honey', 'maple syrup']
          },
          servingSize: 4,
          allergens: ['none'],
          prepTime: '30 minutes',
          cookTime: '4 hours',
          culturalNotes:
            'Barbecue has deep roots in American Southern culture, with regional variations developing across the country. Traditionally cooked for celebrations and gatherings',
          pairingSuggestions: ['coleslaw', 'cornbread', 'baked beans', 'beer'],
          dietaryInfo: ['contains meat', 'high protein'],
          spiceLevel: 'mild to medium',
          nutrition: {
            calories: 680,
            protein: 48,
            carbs: 36,
            fat: 38,
            vitamins: ['B12', 'B6'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['summer', 'all'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.7,
            Water: 0.0,
            Earth: 0.3,
            Air: 0.0
          },
          lunarPhaseInfluences: ['full moon', 'first quarter'],
          zodiacInfluences: ['aries', 'leo'],
          astrologicalAffinities: {
            planets: ['mars', 'sun'],
            signs: ['aries', 'leo'],
            lunarPhases: ['full moon', 'first quarter']
          }
        }
        {
          name: 'Meatloaf with Mashed Potatoes',
          description:
            'Classic American comfort food of seasoned ground meat with a glaze, served with creamy mashed potatoes',
          cuisine: 'American',
          cookingMethods: ['baking', 'mashing', 'mixing'],
          tools: ['loaf pan', 'mixing bowl', 'potato masher', 'large pot', 'measuring cups'],
          preparationSteps: [
            'Mix meat with seasonings',
            'Form into loaf',
            'Prepare glaze',
            'Bake until cooked through',
            'Boil and mash potatoes',
            'Mix in butter and cream',
            'Serve meatloaf with potatoes'
          ],
          ingredients: [
            {
              name: 'ground beef',
              amount: '2',
              unit: 'pounds',
              category: 'protein',
              element: 'Fire'
            }
            { name: 'breadcrumbs', amount: '1', unit: 'cup', category: 'grain', element: 'Earth' }
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein', element: 'Water' }
            { name: 'onion', amount: '1', unit: 'medium', category: 'vegetable', element: 'Fire' }
            { name: 'ketchup', amount: '1/2', unit: 'cup', category: 'sauce', element: 'Fire' }
            {
              name: 'russet potatoes',
              amount: '3',
              unit: 'pounds',
              category: 'vegetable',
              element: 'Earth'
            }
            { name: 'butter', amount: '1/2', unit: 'cup', category: 'fat', element: 'Earth' }
            { name: 'milk', amount: '1/2', unit: 'cup', category: 'dairy', element: 'Water' }
          ],
          substitutions: {
            'ground beef': ['ground turkey', 'plant-based ground'],
            breadcrumbs: ['oats', 'crushed crackers'],
            milk: ['plant milk', 'cream']
          },
          servingSize: 6,
          allergens: ['gluten', 'egg', 'dairy'],
          prepTime: '25 minutes',
          cookTime: '1 hour',
          culturalNotes: 'A quintessential American home-cooked meal that rose to popularity in the 1950s. Represents post-war American comfort food that stretched meat with affordable ingredients',
          pairingSuggestions: ['green beans', 'dinner rolls', 'gravy'],
          dietaryInfo: ['contains meat', 'high protein'],
          spiceLevel: 'none',
          nutrition: {
            calories: 580,
            protein: 36,
            carbs: 42,
            fat: 30,
            vitamins: ['B12', 'B6', 'C'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['autumn', 'winter', 'all'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.5,
            Air: 0.0
          },
          lunarPhaseInfluences: ['waning gibbous', 'full moon'],
          zodiacInfluences: ['taurus', 'cancer'],
          astrologicalAffinities: {
            planets: ['venus', 'moon'],
            signs: ['taurus', 'cancer'],
            lunarPhases: ['waning gibbous', 'full moon']
          }
        }
        {
          name: 'Fried Chicken with Buttermilk Biscuits',
          description: 'Crispy southern fried chicken with flaky buttermilk biscuits and honey',
          cuisine: 'American',
          cookingMethods: ['frying', 'baking'],
          tools: [
            'dutch oven or deep fryer',
            'tongs',
            'mixing bowls',
            'thermometer',
            'biscuit cutter'
          ],
          preparationSteps: [
            'Marinate chicken in buttermilk',
            'Prepare dredging mixture',
            'Heat oil to temperature',
            'Dredge chicken in flour mixture',
            'Fry until golden and cooked',
            'Prepare biscuit dough',
            'Cut and bake biscuits',
            'Serve chicken with biscuits and honey'
          ],
          ingredients: [
            {
              name: 'chicken pieces',
              amount: '3',
              unit: 'pounds',
              category: 'protein',
              element: 'Fire'
            }
            { name: 'buttermilk', amount: '2', unit: 'cups', category: 'dairy', element: 'Water' }
            {
              name: 'all-purpose flour',
              amount: '3',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'paprika', amount: '2', unit: 'tbsp', category: 'spice', element: 'Fire' }
            {
              name: 'garlic powder',
              amount: '1',
              unit: 'tbsp',
              category: 'spice',
              element: 'Fire'
            }
            { name: 'vegetable oil', amount: '6', unit: 'cups', category: 'oil', element: 'Fire' }
            { name: 'cold butter', amount: '8', unit: 'tbsp', category: 'fat', element: 'Earth' }
            { name: 'honey', amount: '1/4', unit: 'cup', category: 'sweetener', element: 'Water' }
          ],
          substitutions: {
            chicken: ['seitan', 'cauliflower'],
            buttermilk: ['plant milk with vinegar'],
            'all-purpose flour': ['gluten-free flour blend']
          },
          servingSize: 6,
          allergens: ['gluten', 'dairy'],
          prepTime: '30 minutes plus marinating time',
          cookTime: '45 minutes',
          culturalNotes: 'A cornerstone of Southern American cuisine with roots in African American culinary traditions. Sunday dinners and celebrations often featured this meal',
          pairingSuggestions: ['collard greens', 'mac and cheese', 'sweet tea'],
          dietaryInfo: ['contains meat', 'high calorie'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 780,
            protein: 42,
            carbs: 48,
            fat: 52,
            vitamins: ['B12', 'A'],
            minerals: ['Iron', 'Selenium']
          },
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.4,
            Water: 0.2,
            Earth: 0.4,
            Air: 0.0
          },
          lunarPhaseInfluences: ['full moon', 'waxing gibbous'],
          zodiacInfluences: ['leo', 'taurus'],
          astrologicalAffinities: {
            planets: ['sun', 'venus'],
            signs: ['leo', 'taurus'],
            lunarPhases: ['full moon', 'waxing gibbous']
          }
        }
      ],
      spring: [
        {
          name: 'Spring Pea Risotto with Grilled Lamb Chops',
          description:
            'Creamy risotto with fresh spring peas topped with herb-marinated grilled lamb chops',
          cuisine: 'American',
          cookingMethods: ['simmering', 'grilling'],
          ingredients: [
            {
              name: 'arborio rice',
              amount: '2',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            {
              name: 'fresh peas',
              amount: '2',
              unit: 'cups',
              category: 'vegetable',
              element: 'Earth'
            }
            {
              name: 'lamb chops',
              amount: '8',
              unit: 'chops',
              category: 'protein',
              element: 'Fire'
            }
            { name: 'fresh mint', amount: '1/4', unit: 'cup', category: 'herb', element: 'Air' }
            {
              name: 'white wine',
              amount: '1/2',
              unit: 'cup',
              category: 'alcohol',
              element: 'Water'
            }
            { name: 'parmesan', amount: '1/2', unit: 'cup', category: 'dairy', element: 'Earth' }
          ],
          nutrition: {
            calories: 650,
            protein: 35,
            carbs: 68,
            fat: 28,
            vitamins: ['A', 'C', 'B12'],
            minerals: ['Iron', 'Zinc']
          },
          timeToMake: '60 minutes',
          season: ['spring'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.4,
            Air: 0.1
          },
          lunarPhaseInfluences: ['waxing crescent', 'first quarter'],
          zodiacInfluences: ['aries', 'taurus'],
          astrologicalAffinities: {
            planets: ['mars', 'venus'],
            signs: ['aries', 'taurus'],
            lunarPhases: ['waxing crescent', 'first quarter']
          }
        }
      ],
      summer: [
        {
          name: 'Grilled Cedar Plank Salmon with Summer Vegetables',
          description:
            'Wild salmon grilled on a cedar plank with grilled corn, zucchini and bell peppers',
          cuisine: 'American',
          cookingMethods: ['grilling', 'planking'],
          ingredients: [
            {
              name: 'salmon fillet',
              amount: '2',
              unit: 'pounds',
              category: 'protein',
              element: 'Water'
            }
            {
              name: 'cedar plank',
              amount: '1',
              unit: 'plank',
              category: 'equipment',
              element: 'Earth'
            }
            {
              name: 'corn on the cob',
              amount: '4',
              unit: 'ears',
              category: 'vegetable',
              element: 'Earth'
            }
            {
              name: 'zucchini',
              amount: '2',
              unit: 'medium',
              category: 'vegetable',
              element: 'Water'
            }
            {
              name: 'bell peppers',
              amount: '2',
              unit: 'large',
              category: 'vegetable',
              element: 'Fire'
            }
            { name: 'lemon', amount: '1', unit: 'whole', category: 'fruit', element: 'Water' }
          ],
          nutrition: {
            calories: 420,
            protein: 38,
            carbs: 28,
            fat: 20,
            vitamins: ['D', 'B12', 'C'],
            minerals: ['Omega-3', 'Potassium']
          },
          timeToMake: '40 minutes',
          season: ['summer'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.4,
            Earth: 0.3,
            Air: 0.1
          },
          lunarPhaseInfluences: ['full moon', 'waxing gibbous'],
          zodiacInfluences: ['pisces', 'cancer', 'leo'],
          astrologicalAffinities: {
            planets: ['jupiter', 'mercury'],
            signs: ['pisces', 'cancer', 'leo'],
            lunarPhases: ['full moon', 'waxing gibbous']
          }
        }
      ],
      autumn: [
        {
          name: 'Beef Pot Roast with Root Vegetables',
          description: 'Slow-cooked beef chuck roast with autumn root vegetables and rich gravy',
          cuisine: 'American',
          cookingMethods: ['braising', 'slow cooking'],
          ingredients: [
            {
              name: 'beef chuck roast',
              amount: '3',
              unit: 'pounds',
              category: 'protein',
              element: 'Fire'
            }
            {
              name: 'carrots',
              amount: '1',
              unit: 'pound',
              category: 'vegetable',
              element: 'Earth'
            }
            {
              name: 'parsnips',
              amount: '1/2',
              unit: 'pound',
              category: 'vegetable',
              element: 'Earth'
            }
            { name: 'onions', amount: '2', unit: 'medium', category: 'vegetable', element: 'Fire' }
            { name: 'red wine', amount: '1', unit: 'cup', category: 'alcohol', element: 'Water' }
            { name: 'fresh thyme', amount: '1', unit: 'bunch', category: 'herb', element: 'Air' }
          ],
          nutrition: {
            calories: 520,
            protein: 42,
            carbs: 24,
            fat: 28,
            vitamins: ['A', 'B12'],
            minerals: ['Iron', 'Zinc']
          },
          timeToMake: '4 hours',
          season: ['autumn'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.4,
            Water: 0.1,
            Earth: 0.5,
            Air: 0.0
          },
          lunarPhaseInfluences: ['waning gibbous', 'last quarter'],
          zodiacInfluences: ['taurus', 'capricorn'],
          astrologicalAffinities: {
            planets: ['saturn', 'venus'],
            signs: ['taurus', 'capricorn'],
            lunarPhases: ['waning gibbous', 'last quarter']
          }
        }
      ],
      winter: [
        {
          name: 'Roast Turkey with Cranberry Sauce',
          description: 'Classic roast turkey with cranberry sauce, stuffing and rich turkey gravy',
          cuisine: 'American',
          cookingMethods: ['roasting', 'simmering'],
          ingredients: [
            {
              name: 'whole turkey',
              amount: '12',
              unit: 'pounds',
              category: 'protein',
              element: 'Air'
            }
            { name: 'cranberries', amount: '12', unit: 'oz', category: 'fruit', element: 'Water' }
            {
              name: 'bread stuffing',
              amount: '8',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'butter', amount: '1/2', unit: 'pound', category: 'fat', element: 'Earth' }
            { name: 'fresh sage', amount: '2', unit: 'tbsp', category: 'herb', element: 'Air' }
            {
              name: 'turkey stock',
              amount: '4',
              unit: 'cups',
              category: 'broth',
              element: 'Water'
            }
          ],
          nutrition: {
            calories: 620,
            protein: 48,
            carbs: 32,
            fat: 36,
            vitamins: ['B12', 'B3'],
            minerals: ['Selenium', 'Phosphorus']
          },
          timeToMake: '5 hours',
          season: ['winter'],
          mealType: ['dinner', 'holiday'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.3
          },
          lunarPhaseInfluences: ['new moon', 'waning crescent'],
          zodiacInfluences: ['capricorn', 'sagittarius'],
          astrologicalAffinities: {
            planets: ['jupiter', 'saturn'],
            signs: ['capricorn', 'sagittarius'],
            lunarPhases: ['new moon', 'waning crescent']
          }
        }
      ]
    },
    dessert: {
      all: [
        {
          name: 'Apple Pie',
          description: 'Classic double-crust pie filled with spiced apples',
          cuisine: 'American',
          cookingMethods: ['baking', 'pastry making'],
          tools: ['pie dish', 'rolling pin', 'mixing bowls', 'pastry cutter', 'knife'],
          preparationSteps: [
            'Prepare pie dough',
            'Chill dough',
            'Peel and slice apples',
            'Mix apples with sugar and spices',
            'Roll out crusts',
            'Fill and assemble pie',
            'Bake until golden'
          ],
          ingredients: [
            {
              name: 'all-purpose flour',
              amount: '2.5',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'butter', amount: '1', unit: 'cup', category: 'fat', element: 'Earth' }
            { name: 'apples', amount: '6', unit: 'large', category: 'fruit', element: 'Water' }
            { name: 'cinnamon', amount: '1', unit: 'tbsp', category: 'spice', element: 'Fire' }
            { name: 'sugar', amount: '3/4', unit: 'cup', category: 'sweetener', element: 'Earth' }
            { name: 'lemon juice', amount: '1', unit: 'tbsp', category: 'acid', element: 'Water' }
          ],
          substitutions: {
            'all-purpose flour': ['gluten-free flour blend', 'whole wheat pastry flour'],
            butter: ['vegan butter', 'coconut oil'],
            sugar: ['coconut sugar', 'maple sugar']
          },
          servingSize: 8,
          allergens: ['gluten', 'dairy'],
          prepTime: '45 minutes',
          cookTime: '50 minutes',
          culturalNotes: 'Apple pie is an iconic American dessert that symbolizes American national pride ('as American as apple pie'). Traditional at Thanksgiving and throughout autumn',
          pairingSuggestions: ['vanilla ice cream', 'cheddar cheese', 'caramel sauce'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 380,
            protein: 4,
            carbs: 52,
            fat: 18,
            vitamins: ['C', 'A'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['autumn', 'all'],
          mealType: ['dessert'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.3,
            Earth: 0.6,
            Air: 0.0
          },
          lunarPhaseInfluences: ['full moon', 'waning gibbous'],
          zodiacInfluences: ['taurus', 'virgo'],
          astrologicalAffinities: {
            planets: ['venus', 'mercury'],
            signs: ['taurus', 'virgo'],
            lunarPhases: ['full moon', 'waning gibbous']
          }
        }
        {
          name: 'Chocolate Chip Cookies',
          description: 'Chewy cookies with melty chocolate chips and buttery flavor',
          cuisine: 'American',
          cookingMethods: ['baking', 'mixing'],
          tools: [
            'mixing bowls',
            'baking sheets',
            'parchment paper',
            'measuring cups',
            'cooling rack'
          ],
          preparationSteps: [
            'Cream butter and sugars',
            'Add eggs and vanilla',
            'Mix in dry ingredients',
            'Fold in chocolate chips',
            'Form cookie dough balls',
            'Bake until edges are golden',
            'Cool on racks'
          ],
          ingredients: [
            {
              name: 'all-purpose flour',
              amount: '2.25',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'butter', amount: '1', unit: 'cup', category: 'fat', element: 'Earth' }
            {
              name: 'brown sugar',
              amount: '1',
              unit: 'cup',
              category: 'sweetener',
              element: 'Earth'
            }
            {
              name: 'white sugar',
              amount: '1/2',
              unit: 'cup',
              category: 'sweetener',
              element: 'Earth'
            }
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein', element: 'Water' }
            {
              name: 'chocolate chips',
              amount: '2',
              unit: 'cups',
              category: 'chocolate',
              element: 'Fire'
            }
          ],
          substitutions: {
            'all-purpose flour': ['gluten-free flour blend', 'almond flour'],
            butter: ['coconut oil', 'vegan butter'],
            eggs: ['flax eggs', 'applesauce']
          },
          servingSize: 24,
          allergens: ['gluten', 'dairy', 'eggs'],
          prepTime: '15 minutes',
          cookTime: '12 minutes',
          culturalNotes:
            'Created in the 1930s by Ruth Wakefield at the Toll House Inn, chocolate chip cookies have become the quintessential American homemade treat',
          pairingSuggestions: ['milk', 'coffee', 'ice cream sandwich'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 180,
            protein: 2,
            carbs: 24,
            fat: 10,
            vitamins: ['A', 'E'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['all'],
          mealType: ['dessert', 'snack'],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.1,
            Earth: 0.7,
            Air: 0.0
          },
          lunarPhaseInfluences: ['new moon', 'waxing crescent'],
          zodiacInfluences: ['taurus', 'cancer', 'leo'],
          astrologicalAffinities: {
            planets: ['venus', 'moon'],
            signs: ['taurus', 'cancer', 'leo'],
            lunarPhases: ['new moon', 'waxing crescent']
          }
        }
        {
          name: 'New York Cheesecake',
          description: 'Dense, rich cheesecake with graham cracker crust and smooth texture',
          cuisine: 'American',
          cookingMethods: ['baking', 'water bath'],
          tools: [
            'springform pan',
            'large roasting pan',
            'electric mixer',
            'measuring cups',
            'aluminum foil'
          ],
          preparationSteps: [
            'Prepare graham cracker crust',
            'Mix cream cheese and sugar',
            'Add eggs one at a time',
            'Add flavorings',
            'Pour into crust',
            'Bake in water bath',
            'Cool and chill overnight'
          ],
          ingredients: [
            { name: 'cream cheese', amount: '32', unit: 'oz', category: 'dairy', element: 'Earth' }
            { name: 'sugar', amount: '1.5', unit: 'cups', category: 'sweetener', element: 'Earth' }
            { name: 'eggs', amount: '4', unit: 'large', category: 'protein', element: 'Water' }
            {
              name: 'graham crackers',
              amount: '2',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            { name: 'butter', amount: '6', unit: 'tbsp', category: 'fat', element: 'Earth' }
            {
              name: 'vanilla extract',
              amount: '1',
              unit: 'tbsp',
              category: 'flavoring',
              element: 'Air'
            }
          ],
          substitutions: {
            'cream cheese': ['non-dairy cream cheese', 'tofu-based alternative'],
            'graham crackers': ['digestive biscuits', 'gluten-free cookies'],
            eggs: ['silken tofu', 'commercial egg replacer']
          },
          servingSize: 12,
          allergens: ['gluten', 'dairy', 'eggs'],
          prepTime: '30 minutes',
          cookTime: '1 hour plus chilling time',
          culturalNotes:
            'New York cheesecake became popular in the early 20th century, with Jewish delis and restaurants in New York City developing the distinctive dense style',
          pairingSuggestions: ['fresh berries', 'berry compote', 'chocolate sauce'],
          dietaryInfo: ['vegetarian', 'high calorie'],
          spiceLevel: 'none',
          nutrition: {
            calories: 450,
            protein: 8,
            carbs: 34,
            fat: 32,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Phosphorus']
          },
          season: ['all'],
          mealType: ['dessert'],
          elementalProperties: {
            Fire: 0.0,
            Water: 0.2,
            Earth: 0.7,
            Air: 0.1
          },
          lunarPhaseInfluences: ['full moon', 'waxing gibbous'],
          zodiacInfluences: ['taurus', 'cancer', 'libra'],
          astrologicalAffinities: {
            planets: ['venus', 'moon'],
            signs: ['taurus', 'cancer', 'libra'],
            lunarPhases: ['full moon', 'waxing gibbous']
          }
        }
      ],
      spring: [
        {
          name: 'Strawberry Shortcake',
          description: 'Sweet biscuits topped with macerated strawberries and whipped cream',
          cuisine: 'American',
          cookingMethods: ['baking', 'whipping'],
          ingredients: [
            {
              name: 'all-purpose flour',
              amount: '2',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            {
              name: 'fresh strawberries',
              amount: '1',
              unit: 'quart',
              category: 'fruit',
              element: 'Water'
            }
            { name: 'heavy cream', amount: '2', unit: 'cups', category: 'dairy', element: 'Water' }
            { name: 'sugar', amount: '1/2', unit: 'cup', category: 'sweetener', element: 'Earth' }
            { name: 'butter', amount: '1/2', unit: 'cup', category: 'fat', element: 'Earth' }
            { name: 'lemon zest', amount: '1', unit: 'tsp', category: 'citrus', element: 'Fire' }
          ],
          nutrition: {
            calories: 380,
            protein: 4,
            carbs: 42,
            fat: 24,
            vitamins: ['C', 'A'],
            minerals: ['Calcium', 'Potassium']
          },
          timeToMake: '35 minutes',
          season: ['spring'],
          mealType: ['dessert'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.4,
            Earth: 0.5,
            Air: 0.0
          },
          lunarPhaseInfluences: ['waxing crescent', 'first quarter'],
          zodiacInfluences: ['taurus', 'gemini'],
          astrologicalAffinities: {
            planets: ['venus', 'mercury'],
            signs: ['taurus', 'gemini'],
            lunarPhases: ['waxing crescent', 'first quarter']
          }
        }
      ],
      summer: [
        {
          name: 'S'mores Ice Cream Pie',
          description:
            'Graham cracker crust filled with chocolate ice cream and topped with toasted marshmallow',
          cuisine: 'American',
          cookingMethods: ['freezing', 'toasting'],
          ingredients: [
            {
              name: 'graham crackers',
              amount: '2',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            {
              name: 'chocolate ice cream',
              amount: '1.5',
              unit: 'quarts',
              category: 'dairy',
              element: 'Water'
            }
            { name: 'marshmallows', amount: '3', unit: 'cups', category: 'candy', element: 'Air' }
            { name: 'butter', amount: '6', unit: 'tbsp', category: 'fat', element: 'Earth' }
            {
              name: 'chocolate sauce',
              amount: '1/4',
              unit: 'cup',
              category: 'topping',
              element: 'Earth'
            }
            {
              name: 'sea salt',
              amount: '1/4',
              unit: 'tsp',
              category: 'seasoning',
              element: 'Earth'
            }
          ],
          nutrition: {
            calories: 440,
            protein: 5,
            carbs: 56,
            fat: 22,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Iron']
          },
          timeToMake: '30 minutes plus freezing time',
          season: ['summer'],
          mealType: ['dessert'],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.3,
            Earth: 0.5,
            Air: 0.1
          },
          lunarPhaseInfluences: ['full moon', 'waxing gibbous'],
          zodiacInfluences: ['cancer', 'leo'],
          astrologicalAffinities: {
            planets: ['moon', 'sun'],
            signs: ['cancer', 'leo'],
            lunarPhases: ['full moon', 'waxing gibbous']
          }
        }
      ],
      autumn: [
        {
          name: 'Pumpkin Pie',
          description: 'Spiced pumpkin custard in a flaky pie crust',
          cuisine: 'American',
          cookingMethods: ['baking'],
          ingredients: [
            {
              name: 'pumpkin puree',
              amount: '15',
              unit: 'oz',
              category: 'vegetable',
              element: 'Earth'
            }
            { name: 'pie crust', amount: '1', unit: 'crust', category: 'dough', element: 'Earth' }
            {
              name: 'evaporated milk',
              amount: '12',
              unit: 'oz',
              category: 'dairy',
              element: 'Water'
            }
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein', element: 'Water' }
            { name: 'cinnamon', amount: '2', unit: 'tsp', category: 'spice', element: 'Fire' }
            { name: 'nutmeg', amount: '1/2', unit: 'tsp', category: 'spice', element: 'Fire' }
          ],
          nutrition: {
            calories: 320,
            protein: 6,
            carbs: 40,
            fat: 14,
            vitamins: ['A', 'E'],
            minerals: ['Iron', 'Calcium']
          },
          timeToMake: '1 hour',
          season: ['autumn'],
          mealType: ['dessert'],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.6,
            Air: 0.0
          },
          lunarPhaseInfluences: ['waning gibbous', 'last quarter'],
          zodiacInfluences: ['virgo', 'libra'],
          astrologicalAffinities: {
            planets: ['mercury', 'venus'],
            signs: ['virgo', 'libra'],
            lunarPhases: ['waning gibbous', 'last quarter']
          }
        }
      ],
      winter: [
        {
          name: 'Gingerbread Cookies',
          description: 'Spiced molasses cookies cut into festive shapes',
          cuisine: 'American',
          cookingMethods: ['baking'],
          ingredients: [
            {
              name: 'all-purpose flour',
              amount: '3',
              unit: 'cups',
              category: 'grain',
              element: 'Earth'
            }
            {
              name: 'molasses',
              amount: '2/3',
              unit: 'cup',
              category: 'sweetener',
              element: 'Earth'
            }
            { name: 'ginger', amount: '1', unit: 'tbsp', category: 'spice', element: 'Fire' }
            { name: 'cinnamon', amount: '1', unit: 'tbsp', category: 'spice', element: 'Fire' }
            { name: 'butter', amount: '3/4', unit: 'cup', category: 'fat', element: 'Earth' }
            {
              name: 'brown sugar',
              amount: '3/4',
              unit: 'cup',
              category: 'sweetener',
              element: 'Earth'
            }
          ],
          nutrition: {
            calories: 180,
            protein: 2,
            carbs: 28,
            fat: 7,
            vitamins: ['E', 'B6'],
            minerals: ['Iron', 'Calcium']
          },
          timeToMake: '3 hours including chilling',
          season: ['winter'],
          mealType: ['dessert', 'holiday'],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.0,
            Earth: 0.7,
            Air: 0.0
          },
          lunarPhaseInfluences: ['new moon', 'waning crescent'],
          zodiacInfluences: ['capricorn', 'sagittarius'],
          astrologicalAffinities: {
            planets: ['saturn', 'jupiter'],
            signs: ['capricorn', 'sagittarius'],
            lunarPhases: ['new moon', 'waning crescent']
          }
        }
      ]
    }
  },
  traditionalSauces: {
    bbqSauce: {
      name: 'BBQ Sauce',
      description: 'Sweet, tangy, and smoky tomato-based sauce for grilled and smoked meats',
      base: 'tomato',
      keyIngredients: [
        'tomato paste',
        'vinegar',
        'molasses',
        'brown sugar',
        'smoke flavor',
        'spices'
      ],
      culinaryUses: ['marinade', 'basting sauce', 'dipping sauce', 'flavor base'],
      variants: [
        'Kansas City (sweet)',
        'Carolina (vinegar-based)',
        'Texas (spicy)',
        'Alabama (white)'
      ],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.0
      },
      astrologicalInfluences: ['Mars', 'Sun', 'Aries'],
      seasonality: 'summer',
      preparationNotes: 'Traditionally simmered slowly to develop deep flavor and thicken',
      technicalTips: 'Balance acid, sweetness, and spice to complement the meat it will accompany'
    },
    ranchDressing: {
      name: 'Ranch Dressing',
      description: 'Creamy, herb-flecked dressing with buttermilk and garlic notes',
      base: 'buttermilk and mayonnaise',
      keyIngredients: ['buttermilk', 'mayonnaise', 'sour cream', 'dill', 'parsley', 'garlic'],
      culinaryUses: ['salad dressing', 'dipping sauce', 'sandwich spread', 'vegetable dip'],
      variants: ['Classic', 'Spicy', 'Avocado', 'Chipotle'],
      elementalProperties: {
        Fire: 0.0,
        Earth: 0.2,
        Water: 0.6,
        Air: 0.2
      },
      astrologicalInfluences: ['Venus', 'Moon', 'Taurus'],
      seasonality: 'all',
      preparationNotes: 'Best when made fresh and allowed to rest for flavors to meld',
      technicalTips: 'Use fresh herbs when possible for brightest flavor'
    },
    hotSauce: {
      name: 'Hot Sauce',
      description: 'Fiery, vinegar-based sauce with chili peppers for heat',
      base: 'chili peppers and vinegar',
      keyIngredients: ['chili peppers', 'vinegar', 'salt', 'garlic', 'spices'],
      culinaryUses: ['condiment', 'marinade component', 'flavor enhancer', 'heat source'],
      variants: ['Louisiana-style', 'Sriracha-inspired', 'Habanero', 'Smoky Chipotle'],
      elementalProperties: {
        Fire: 0.9,
        Earth: 0.0,
        Water: 0.1,
        Air: 0.0
      },
      astrologicalInfluences: ['Mars', 'Pluto', 'Aries'],
      seasonality: 'all',
      preparationNotes: 'Can be fermented for complex flavor or used fresh for bright heat',
      technicalTips: 'Control heat level by adjusting pepper types and quantity'
    },
    gravySauce: {
      name: 'Gravy',
      description: 'Rich, savory sauce made from meat drippings and thickened with flour',
      base: 'meat drippings',
      keyIngredients: ['meat drippings', 'flour', 'stock', 'herbs', 'seasonings'],
      culinaryUses: [
        'sauce for meats',
        'topping for potatoes',
        'biscuit accompaniment',
        'casserole base'
      ],
      variants: ['Brown Gravy', 'Country Gravy', 'Mushroom Gravy', 'Turkey Gravy'],
      elementalProperties: {
        Fire: 0.2,
        Earth: 0.5,
        Water: 0.3,
        Air: 0.0
      },
      astrologicalInfluences: ['Saturn', 'Jupiter', 'Taurus'],
      seasonality: 'autumn and winter',
      preparationNotes: 'Must be made while cooking protein for authentic flavor from drippings',
      technicalTips: 'Use a whisk to prevent lumps and incorporate flour smoothly'
    },
    mapleGlaze: {
      name: 'Maple Glaze',
      description: 'Sweet and rich syrup reduction for breakfast items and desserts',
      base: 'maple syrup',
      keyIngredients: ['maple syrup', 'butter', 'vanilla', 'cinnamon'],
      culinaryUses: [
        'topping for pancakes',
        'glaze for ham',
        'dessert sauce',
        'marinade component'
      ],
      variants: ['Traditional', 'Bourbon-infused', 'Spiced', 'Savory'],
      elementalProperties: {
        Fire: 0.1,
        Earth: 0.4,
        Water: 0.5,
        Air: 0.0
      },
      astrologicalInfluences: ['Venus', 'Jupiter', 'Libra'],
      seasonality: 'autumn and winter',
      preparationNotes: 'Grade B maple syrup offers more robust flavor for cooking',
      technicalTips: 'Reduce slowly to prevent burning the sugars'
    }
  },
  sauceRecommender: {
    forProtein: {
      beef: ['bbqSauce', 'gravySauce', 'steak sauce', 'horseradish sauce'],
      chicken: ['bbqSauce', 'ranchDressing', 'honey mustard', 'buffalo sauce'],
      pork: ['bbqSauce', 'mapleGlaze', 'apple sauce', 'mustard sauce'],
      seafood: ['tartar sauce', 'cocktail sauce', 'lemon butter', 'remoulade'],
      turkey: ['gravySauce', 'cranberry sauce', 'mapleGlaze', 'herb butter']
    },
    forVegetable: {
      greens: [
        'ranchDressing',
        'balsamic vinaigrette',
        'blue cheese dressing',
        'lemon vinaigrette'
      ],
      roots: ['bbqSauce', 'honey glaze', 'gravySauce', 'herb butter'],
      nightshades: ['ranchDressing', 'hotSauce', 'aioli', 'chipotle mayo'],
      cruciferous: ['cheese sauce', 'ranchDressing', 'lemon butter', 'hollandaise'],
      alliums: ['bbqSauce', 'gravySauce', 'butter sauce', 'balsamic glaze']
    },
    forCookingMethod: {
      grilling: ['bbqSauce', 'chimichurri', 'herb butter', 'hotSauce'],
      frying: ['ranchDressing', 'aioli', 'hotSauce', 'ketchup'],
      baking: ['gravySauce', 'cheese sauce', 'herb butter', 'honey glaze'],
      roasting: ['gravySauce', 'mapleGlaze', 'herb oil', 'pan sauce'],
      steaming: ['lemon butter', 'hollandaise', 'herb oil', 'remoulade']
    },
    byAstrological: {
      fire: ['hotSauce', 'bbqSauce', 'spicy aioli', 'chipotle sauce'],
      earth: ['gravySauce', 'mushroom sauce', 'herb butter', 'cheese sauce'],
      air: ['light vinaigrettes', 'herb oils', 'lemon butter', 'citrus sauce'],
      water: ['ranchDressing', 'cream sauces', 'tartar sauce', 'remoulade']
    },
    byRegion: {
      southern: ['bbqSauce', 'gravySauce', 'hot sauce', 'remoulade'],
      newEngland: ['tartar sauce', 'clam sauce', 'maple syrup', 'cranberry sauce'],
      southwest: ['hotSauce', 'salsa', 'chipotle sauce', 'queso'],
      midwest: ['ranchDressing', 'gravySauce', 'cheese sauce', 'steak sauce'],
      westCoast: ['avocado sauce', 'citrus vinaigrette', 'herb oils', 'fresh salsa']
    },
    byDietary: {
      vegan: ['cashew cream', 'avocado sauce', 'olive oil', 'nutritional yeast sauce'],
      keto: ['butter sauces', 'mayonnaise-based', 'oil-based vinaigrettes', 'alfredo sauce'],
      glutenFree: [
        'corn-thickened sauces',
        'reduction sauces',
        'pureed vegetable sauces',
        'egg-based sauces'
      ],
      dairyFree: ['oil-based', 'vinaigrettes', 'nut creams', 'coconut-based sauces'],
      lowSodium: ['herb oils', 'fruit reductions', 'vinegar-based', 'spice blends']
    }
  },
  cookingTechniques: [
    {
      name: 'Barbecuing',
      description: 'Slow cooking with smoke over indirect heat for extended periods',
      elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0.0 }
      toolsRequired: ['smoker', 'wood chips', 'temperature probe', 'drip pan'],
      bestFor: ['pork ribs', 'brisket', 'pork shoulder', 'whole chicken', 'beef ribs'],
      difficulty: 'hard'
    }
    {
      name: 'Grilling',
      description: 'Cooking over direct high heat for short periods, creating caramelization',
      elementalProperties: { Fire: 0.8, Earth: 0.1, Air: 0.1, Water: 0.0 }
      toolsRequired: ['grill', 'tongs', 'spatula', 'brush', 'thermometer'],
      bestFor: ['steaks', 'burgers', 'hot dogs', 'vegetables', 'fish fillets'],
      difficulty: 'medium'
    }
    {
      name: 'Deep Frying',
      description: 'Submerging food in hot oil for crispy exterior and tender interior',
      elementalProperties: { Fire: 0.6, Earth: 0.0, Water: 0.0, Air: 0.4 }
      toolsRequired: ['deep fryer', 'thermometer', 'spider or slotted spoon', 'paper towels'],
      bestFor: ['chicken', 'french fries', 'donuts', 'fish', 'appetizers'],
      difficulty: 'medium'
    }
    {
      name: 'Casserole Baking',
      description: 'Combining ingredients in a dish and baking with even, enclosed heat',
      elementalProperties: { Fire: 0.2, Earth: 0.5, Water: 0.3, Air: 0.0 }
      toolsRequired: ['casserole dish', 'oven', 'mixing bowls', 'measuring cups'],
      bestFor: [
        'mac and cheese',
        'green bean casserole',
        'tuna noodle casserole',
        'shepherd's pie'
      ],
      difficulty: 'easy'
    }
    {
      name: 'Pie Making',
      description: 'Creating flaky pastry crusts filled with sweet or savory fillings',
      elementalProperties: { Fire: 0.1, Earth: 0.6, Water: 0.1, Air: 0.2 }
      toolsRequired: ['rolling pin', 'pie dish', 'pastry cutter', 'food processor'],
      bestFor: ['fruit pies', 'cream pies', 'pot pies', 'quiches', 'tarts'],
      difficulty: 'hard'
    }
    {
      name: 'Slow Cooking',
      description: 'Low-temperature cooking for extended periods, often in a covered pot',
      elementalProperties: { Fire: 0.2, Earth: 0.3, Water: 0.5, Air: 0.0 }
      toolsRequired: ['slow cooker', 'dutch oven', 'ladle', 'timer'],
      bestFor: ['stews', 'chili', 'pot roast', 'pulled pork', 'soups'],
      difficulty: 'easy'
    }
  ],
  regionalCuisines: {
    southern: {
      name: 'Southern Cuisine',
      description: 'Soul-warming food with African, European and Native American influences',
      signature: [
        'fried chicken',
        'collard greens',
        'cornbread',
        'biscuits and gravy',
        'peach cobbler'
      ],
      elementalProperties: { Fire: 0.3, Earth: 0.4, Water: 0.2, Air: 0.1 }
      astrologicalInfluences: ['Venus', 'Jupiter', 'Taurus'],
      seasonality: 'year-round with seasonal ingredients'
    },
    newEngland: {
      name: 'New England Cuisine',
      description: 'Seafood-forward cuisine with British colonial roots and seasonal emphasis',
      signature: ['clam chowder', 'lobster rolls', 'baked beans', 'cranberry sauce', 'apple pie'],
      elementalProperties: { Fire: 0.1, Earth: 0.3, Water: 0.5, Air: 0.1 }
      astrologicalInfluences: ['Moon', 'Neptune', 'Cancer'],
      seasonality: 'highly seasonal'
    },
    southwest: {
      name: 'Southwestern Cuisine',
      description: 'Bold flavors influenced by Mexican, Spanish, and Native American traditions',
      signature: ['chili con carne', 'tex-mex', 'barbecue', 'corn dishes', 'pecan pie'],
      elementalProperties: { Fire: 0.6, Earth: 0.3, Water: 0.0, Air: 0.1 }
      astrologicalInfluences: ['Mars', 'Sun', 'Aries'],
      seasonality: 'desert adaptations with seasonal celebrations'
    },
    midwest: {
      name: 'Midwestern Cuisine',
      description: 'Hearty comfort food emphasizing locally grown ingredients and German influence',
      signature: [
        'casseroles',
        'corn on the cob',
        'meat and potatoes',
        'wild rice dishes',
        'fruit pies'
      ],
      elementalProperties: { Fire: 0.2, Earth: 0.6, Water: 0.1, Air: 0.1 }
      astrologicalInfluences: ['Saturn', 'Venus', 'Capricorn'],
      seasonality: 'strongly seasonal with preservation techniques'
    },
    california: {
      name: 'California Cuisine',
      description: 'Fresh, produce-forward cooking with Mediterranean and Asian influences',
      signature: [
        'farm-to-table',
        'avocado toast',
        'fish tacos',
        'sourdough bread',
        'wine country cuisine'
      ],
      elementalProperties: { Fire: 0.2, Earth: 0.3, Water: 0.2, Air: 0.3 }
      astrologicalInfluences: ['Mercury', 'Uranus', 'Gemini'],
      seasonality: 'year-round fresh ingredients'
    }
  }
  // Enhanced elemental properties with more balanced distribution
  elementalProperties: {
    Fire: 0.3, // Grilling, BBQ, spicy elements,
    Water: 0.2, // Stews, soups, steaming,
    Earth: 0.3, // Root vegetables, grains, hearty foods,
    Air: 0.2, // Light preparations, whipped dishes
  }
  // Added astrological influences
  astrologicalInfluences: [
    'Jupiter', // Abundance and generosity in portions
    'Mars', // Bold flavors and cooking techniques
    'Venus', // Comfort foods and indulgent desserts
  ]
}

export default american,
