// src/data/cuisines/russian.ts
import { Cuisine } from '@/types/cuisine';

export const, russian: Cuisine = {
  id: 'russian',
  name: 'Russian',
  description:
    'Traditional Russian cuisine emphasizing hearty dishes, fermented foods, and preserved ingredients',
  dishes: {
    breakfast: {
      all: [
        {
          name: 'Syrniki',
          description: 'Farmer's cheese pancakes',
          cuisine: 'Russian',
          cookingMethods: ['frying', 'mixing'],
          tools: ['mixing bowl', 'frying pan', 'spatula', 'cheese grater', 'measuring cups'],
          preparationSteps: [
            'Drain tvorog if needed',
            'Mix cheese with eggs and sugar',
            'Add flour and vanilla',
            'Form into small pancakes',
            'Fry until golden brown',
            'Serve with sour cream and jam'
          ],
          ingredients: [
            { name: 'tvorog', amount: '500', unit: 'g', category: 'dairy', swaps: ['firm tofu'] },
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein' },
            {
              name: 'flour',
              amount: '100',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            { name: 'sugar', amount: '2', unit: 'tbsp', category: 'sweetener' },
            { name: 'vanilla extract', amount: '1', unit: 'tsp', category: 'flavoring' },
            {
              name: 'sour cream',
              amount: '100',
              unit: 'g',
              category: 'dairy',
              swaps: ['coconut yogurt']
            }
          ],
          substitutions: {
            tvorog: ['cottage cheese', 'firm tofu'],
            'sour cream': ['greek yogurt', 'coconut yogurt'],
            flour: ['gluten-free flour blend', 'almond flour']
          },
          servingSize: 4,
          allergens: ['dairy', 'eggs', 'gluten'],
          prepTime: '15 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A beloved breakfast dish that transforms humble farmer's cheese into delicate pancakes. Often served during traditional Russian celebrations',
          pairingSuggestions: ['berry jam', 'honey', 'fresh berries', 'sour cream'],
          dietaryInfo: ['vegetarian', 'adaptable to gluten-free'],
          spiceLevel: 'none',
          nutrition: {
            calories: 380,
            protein: 24,
            carbs: 32,
            fat: 18,
            vitamins: ['B12', 'D'],
            minerals: ['Calcium', 'Phosphorus']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.2,
            Fire: 0.2,
            Air: 0.2
}
        },
        {
          name: 'Kasha',
          description: 'Buckwheat porridge with milk',
          cuisine: 'Russian',
          cookingMethods: ['simmering', 'toasting'],
          tools: ['saucepan', 'wooden spoon', 'measuring cups', 'strainer'],
          preparationSteps: [
            'Toast buckwheat groats until fragrant',
            'Add hot milk and salt',
            'Simmer until tender',
            'Let rest covered',
            'Add butter and stir',
            'Serve hot'
          ],
          ingredients: [
            { name: 'buckwheat groats', amount: '200', unit: 'g', category: 'grain' },
            { name: 'milk', amount: '500', unit: 'ml', category: 'dairy', swaps: ['oat milk'] },
            { name: 'butter', amount: '30', unit: 'g', category: 'fat', swaps: ['plant butter'] },
            { name: 'salt', amount: '1', unit: 'tsp', category: 'seasoning' }
          ],
          substitutions: {
            milk: ['oat milk', 'almond milk', 'soy milk'],
            butter: ['plant-based butter', 'coconut oil'],
            'buckwheat groats': ['steel-cut oats', 'quinoa']
          },
          servingSize: 4,
          allergens: ['dairy'],
          prepTime: '5 minutes',
          cookTime: '20 minutes',
          culturalNotes:
            'A fundamental Russian breakfast dish that symbolizes prosperity and health. The word 'kasha' is so central to Russian cuisine that it's used as a general term for all grain porridges',
          pairingSuggestions: [
            'fried mushrooms',
            'soft-boiled egg',
            'green onions',
            'crispy onions'
          ],
          dietaryInfo: ['vegetarian', 'adaptable to vegan', 'gluten-free'],
          spiceLevel: 'none',
          nutrition: {
            calories: 320,
            protein: 12,
            carbs: 58,
            fat: 8,
            vitamins: ['B1', 'B2'],
            minerals: ['Iron', 'Magnesium']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Earth: 0.5,
            Water: 0.3,
            Fire: 0.1,
            Air: 0.1
}
        },
        {
          name: 'Blini',
          description: 'Thin yeasted pancakes',
          cuisine: 'Russian',
          cookingMethods: ['mixing', 'fermenting', 'frying'],
          tools: [
            'mixing bowls',
            'whisk',
            'ladle',
            'crepe pan or skillet',
            'spatula',
            'measuring cups'
          ],
          preparationSteps: [
            'Activate yeast with warm milk',
            'Mix batter and let ferment',
            'Heat pan and grease',
            'Pour thin layer of batter',
            'Cook until bubbles form',
            'Flip and finish cooking',
            'Keep warm while making more'
          ],
          ingredients: [
            {
              name: 'flour',
              amount: '300',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            { name: 'milk', amount: '600', unit: 'ml', category: 'dairy', swaps: ['almond milk'] },
            { name: 'eggs', amount: '3', unit: 'large', category: 'protein' },
            { name: 'yeast', amount: '7', unit: 'g', category: 'leavening' },
            { name: 'sugar', amount: '1', unit: 'tbsp', category: 'sweetener' },
            {
              name: 'sour cream',
              amount: '100',
              unit: 'g',
              category: 'dairy',
              swaps: ['coconut yogurt']
            }
          ],
          substitutions: {
            flour: ['gluten-free flour blend', 'buckwheat flour'],
            milk: ['almond milk', 'oat milk'],
            'sour cream': ['coconut yogurt', 'cashew cream']
          },
          servingSize: 6,
          allergens: ['dairy', 'eggs', 'gluten'],
          prepTime: '15 minutes',
          cookTime: '45 minutes',
          fermentationTime: '30 minutes',
          culturalNotes:
            'Traditional for Maslenitsa festival, symbolizing the sun and the end of winter. Blini are essential for both celebrations and everyday meals',
          pairingSuggestions: [
            'caviar',
            'smoked salmon',
            'mushroom filling',
            'sweet condensed milk',
            'berry preserves'
          ],
          dietaryInfo: ['vegetarian', 'adaptable to vegan', 'adaptable to gluten-free'],
          spiceLevel: 'none',
          nutrition: {
            calories: 220,
            protein: 8,
            carbs: 35,
            fat: 6,
            vitamins: ['A', 'D'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['all'],
          mealType: ['breakfast', 'dessert'],
          elementalProperties: {
            Air: 0.4,
            Earth: 0.2,
            Water: 0.2,
            Fire: 0.2
}
        },
        {
          name: 'Oladi',
          description: 'Fluffy Russian buttermilk pancakes',
          cuisine: 'Russian',
          cookingMethods: ['mixing', 'frying'],
          tools: ['mixing bowl', 'whisk', 'frying pan', 'spatula', 'ladle'],
          preparationSteps: [
            'Mix dry ingredients',
            'Combine wet ingredients',
            'Let batter rest',
            'Fry in small batches',
            'Keep warm until serving'
          ],
          ingredients: [
            {
              name: 'buttermilk',
              amount: '500',
              unit: 'ml',
              category: 'dairy',
              swaps: ['plant-based buttermilk']
            },
            {
              name: 'flour',
              amount: '300',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein' },
            { name: 'sugar', amount: '2', unit: 'tbsp', category: 'sweetener' },
            { name: 'baking soda', amount: '1', unit: 'tsp', category: 'leavening' }
          ],
          substitutions: {
            buttermilk: ['almond milk + vinegar', 'soy milk + lemon juice'],
            flour: ['gluten-free flour blend', 'buckwheat flour'],
            eggs: ['flax eggs', 'commercial egg replacer']
          },
          servingSize: 4,
          allergens: ['dairy', 'eggs', 'gluten'],
          prepTime: '10 minutes',
          restTime: '15 minutes',
          cookTime: '20 minutes',
          culturalNotes:
            'A beloved breakfast dish often served on weekends. The slight tanginess from buttermilk makes these distinct from regular pancakes',
          pairingSuggestions: ['sour cream', 'jam', 'honey', 'fresh berries'],
          dietaryInfo: ['vegetarian', 'adaptable to vegan'],
          spiceLevel: 'none',
          nutrition: {
            calories: 280,
            protein: 8,
            carbs: 42,
            fat: 9,
            vitamins: ['B12', 'D'],
            minerals: ['Calcium', 'Iron']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Air: 0.4,
            Earth: 0.3,
            Water: 0.2,
            Fire: 0.1
}
        }
      ]
    },
    lunch: {
      all: [
        {
          name: 'Borscht',
          description: 'Classic beetroot and cabbage soup',
          cuisine: 'Russian',
          cookingMethods: ['simmering', 'sautéing', 'braising'],
          tools: ['large soup pot', 'cutting board', 'sharp knife', 'grater', 'ladle', 'strainer'],
          preparationSteps: [
            'Prepare beef broth',
            'Sauté vegetables separately',
            'Cook beets until tender',
            'Combine ingredients',
            'Simmer until flavors meld',
            'Season to taste',
            'Serve with sour cream'
          ],
          ingredients: [
            { name: 'beef', amount: '500', unit: 'g', category: 'protein', swaps: ['mushrooms'] },
            { name: 'beets', amount: '500', unit: 'g', category: 'vegetable' },
            { name: 'cabbage', amount: '300', unit: 'g', category: 'vegetable' },
            { name: 'potatoes', amount: '300', unit: 'g', category: 'vegetable' },
            { name: 'carrots', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'onion', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'tomato paste', amount: '2', unit: 'tbsp', category: 'condiment' },
            {
              name: 'sour cream',
              amount: '200',
              unit: 'g',
              category: 'dairy',
              swaps: ['cashew cream']
            }
          ],
          substitutions: {
            beef: ['mushrooms', 'seitan', 'tempeh'],
            'sour cream': ['cashew cream', 'coconut yogurt'],
            'beef broth': ['mushroom broth', 'vegetable broth']
          },
          servingSize: 8,
          allergens: ['dairy'],
          prepTime: '30 minutes',
          cookTime: '120 minutes',
          culturalNotes:
            'A quintessential Slavic soup that varies by region and season. The deep red color from beets is iconic, and the soup often tastes better the next day',
          pairingSuggestions: ['black bread', 'garlic cloves', 'salo', 'vodka'],
          dietaryInfo: ['adaptable to vegetarian/vegan'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 420,
            protein: 28,
            carbs: 42,
            fat: 18,
            vitamins: ['A', 'C', 'B12'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['winter', 'autumn'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Fire: 0.2,
            Air: 0.1
}
        },
        {
          name: 'Pelmeni',
          description: 'Russian meat dumplings',
          cuisine: 'Russian',
          cookingMethods: ['kneading', 'filling', 'boiling'],
          tools: ['mixing bowl', 'rolling pin', 'pelmeni mold', 'large pot', 'slotted spoon'],
          preparationSteps: [
            'Make dough',
            'Prepare meat filling',
            'Roll out dough',
            'Fill and shape dumplings',
            'Freeze or cook immediately',
            'Boil until floating',
            'Serve with butter and sour cream'
          ],
          ingredients: [
            {
              name: 'flour',
              amount: '500',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            {
              name: 'ground meat mix',
              amount: '400',
              unit: 'g',
              category: 'protein',
              swaps: ['mushroom mix']
            },
            { name: 'onions', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein' },
            { name: 'butter', amount: '100', unit: 'g', category: 'dairy', swaps: ['olive oil'] },
            {
              name: 'sour cream',
              amount: '200',
              unit: 'g',
              category: 'dairy',
              swaps: ['cashew cream']
            }
          ],
          substitutions: {
            'ground meat mix': ['mushroom mix', 'lentil mix'],
            'sour cream': ['cashew cream', 'coconut yogurt'],
            butter: ['olive oil', 'vegan butter']
          },
          servingSize: 6,
          allergens: ['gluten', 'eggs', 'dairy'],
          prepTime: '60 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A staple of Siberian cuisine, traditionally made in large batches during winter and stored frozen. Making pelmeni is often a family activity',
          pairingSuggestions: ['vinegar', 'black pepper', 'dill', 'russian mustard'],
          dietaryInfo: ['adaptable to vegetarian/vegan'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 380,
            protein: 22,
            carbs: 42,
            fat: 16,
            vitamins: ['B12', 'B6'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['winter'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
}
        },
        {
          name: 'Shchi',
          description: 'Traditional Russian cabbage soup',
          cuisine: 'Russian',
          cookingMethods: ['simmering', 'sautéing', 'braising'],
          tools: ['large soup pot', 'cutting board', 'knife', 'ladle', 'strainer'],
          preparationSteps: [
            'Prepare meat broth',
            'Chop vegetables',
            'Sauté aromatics',
            'Add cabbage and potatoes',
            'Simmer until tender',
            'Season with herbs',
            'Serve with sour cream'
          ],
          ingredients: [
            {
              name: 'pork or beef',
              amount: '400',
              unit: 'g',
              category: 'protein',
              swaps: ['mushrooms']
            },
            { name: 'cabbage', amount: '600', unit: 'g', category: 'vegetable' },
            { name: 'potatoes', amount: '300', unit: 'g', category: 'vegetable' },
            { name: 'carrots', amount: '150', unit: 'g', category: 'vegetable' },
            { name: 'onions', amount: '150', unit: 'g', category: 'vegetable' },
            { name: 'bay leaves', amount: '2', unit: 'pieces', category: 'herb' },
            {
              name: 'sour cream',
              amount: '200',
              unit: 'g',
              category: 'dairy',
              swaps: ['cashew cream']
            }
          ],
          substitutions: {
            'pork or beef': ['mushrooms', 'tempeh'],
            'sour cream': ['cashew cream', 'coconut yogurt'],
            'meat broth': ['vegetable broth', 'mushroom broth']
          },
          servingSize: 6,
          allergens: ['dairy'],
          prepTime: '25 minutes',
          cookTime: '90 minutes',
          culturalNotes:
            'One of the oldest Russian soups, dating back to the 9th century. Available in both fresh and sour (fermented) cabbage versions',
          pairingSuggestions: ['rye bread', 'garlic', 'green onions', 'kvass'],
          dietaryInfo: ['adaptable to vegetarian/vegan'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 380,
            protein: 24,
            carbs: 38,
            fat: 16,
            vitamins: ['C', 'K', 'B12'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Fire: 0.2,
            Air: 0.1
}
        },
        {
          name: 'Ukha',
          description: 'Clear Russian fish soup',
          cuisine: 'Russian',
          cookingMethods: ['simmering', 'straining', 'poaching'],
          tools: ['large pot', 'fine-mesh strainer', 'ladle', 'knife', 'cutting board'],
          preparationSteps: [
            'Prepare fish stock',
            'Clean and cut fish',
            'Cook vegetables',
            'Add fish pieces',
            'Season with herbs',
            'Clarify if desired'
          ],
          ingredients: [
            { name: 'white fish', amount: '800', unit: 'g', category: 'protein' },
            { name: 'onions', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'carrots', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'potatoes', amount: '300', unit: 'g', category: 'vegetable' },
            { name: 'bay leaves', amount: '2', unit: 'pieces', category: 'herb' },
            { name: 'black peppercorns', amount: '6', unit: 'pieces', category: 'spice' }
          ],
          substitutions: {
            'white fish': ['salmon', 'trout'],
            potatoes: ['parsnips', 'celery root'],
            'fresh dill': ['parsley', 'chives']
          },
          servingSize: 6,
          allergens: ['fish'],
          prepTime: '20 minutes',
          cookTime: '40 minutes',
          culturalNotes:
            'A traditional clear fish soup that dates back to ancient Russia. Originally made by fishermen using freshwater fish',
          pairingSuggestions: ['rye bread', 'vodka', 'pickled vegetables'],
          dietaryInfo: ['dairy-free', 'gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 220,
            protein: 28,
            carbs: 18,
            fat: 6,
            vitamins: ['B12', 'D'],
            minerals: ['Omega-3', 'Selenium']
          },
          season: ['all'],
          mealType: ['lunch'],
          elementalProperties: {
            Water: 0.5,
            Earth: 0.2,
            Air: 0.2,
            Fire: 0.1
}
        }
      ],
      winter: [
        {
          name: 'Solyanka',
          description: 'Hearty soup with mixed meats and pickles',
          cuisine: 'Russian',
          ingredients: [
            {
              name: 'mixed meats',
              amount: '500',
              unit: 'g',
              category: 'protein',
              swaps: ['seitan mix']
            },
            { name: 'pickles', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'onions', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'olives', amount: '100', unit: 'g', category: 'vegetable' },
            { name: 'lemon', amount: '1', unit: 'whole', category: 'citrus' },
            {
              name: 'sour cream',
              amount: '100',
              unit: 'g',
              category: 'dairy',
              swaps: ['cashew cream']
            }
          ],
          nutrition: {
            calories: 420,
            protein: 32,
            carbs: 18,
            fat: 28,
            vitamins: ['B12', 'C'],
            minerals: ['Iron', 'Sodium']
          },
          timeToMake: '90 minutes',
          season: ['winter'],
          mealType: ['lunch']
        }
      ]
    },
    dinner: {
      all: [
        {
          name: 'Beef Stroganoff',
          description: 'Tender beef in sour cream sauce',
          cuisine: 'Russian',
          cookingMethods: ['sautéing', 'simmering', 'sauce-making'],
          tools: [
            'large skillet',
            'sharp knife',
            'cutting board',
            'measuring cups',
            'wooden spoon'
          ],
          preparationSteps: [
            'Slice beef thinly',
            'Sauté mushrooms and onions',
            'Brown beef quickly',
            'Make sauce with sour cream',
            'Combine ingredients',
            'Serve over noodles'
          ],
          ingredients: [
            {
              name: 'beef tenderloin',
              amount: '800',
              unit: 'g',
              category: 'protein',
              swaps: ['mushrooms']
            },
            { name: 'mushrooms', amount: '400', unit: 'g', category: 'vegetable' },
            { name: 'onions', amount: '200', unit: 'g', category: 'vegetable' },
            {
              name: 'sour cream',
              amount: '300',
              unit: 'ml',
              category: 'dairy',
              swaps: ['cashew cream']
            },
            { name: 'mustard', amount: '2', unit: 'tbsp', category: 'condiment' },
            {
              name: 'egg noodles',
              amount: '500',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free pasta']
            }
          ],
          substitutions: {
            'beef tenderloin': ['portobello mushrooms', 'seitan'],
            'sour cream': ['cashew cream', 'coconut cream'],
            'egg noodles': ['gluten-free pasta', 'rice']
          },
          servingSize: 6,
          allergens: ['dairy', 'gluten', 'eggs'],
          prepTime: '20 minutes',
          cookTime: '25 minutes',
          culturalNotes:
            'Created in the 19th century and named after Count Stroganoff, this dish represents the refinement of Russian aristocratic cuisine',
          pairingSuggestions: [
            'buckwheat kasha',
            'pickled vegetables',
            'fresh dill',
            'black bread'
          ],
          dietaryInfo: ['adaptable to vegetarian/vegan', 'adaptable to gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 580,
            protein: 42,
            carbs: 45,
            fat: 28,
            vitamins: ['B12', 'D'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
}
        },
        {
          name: 'Golubtsy',
          description: 'Stuffed cabbage rolls',
          cuisine: 'Russian',
          cookingMethods: ['blanching', 'stuffing', 'braising'],
          tools: ['large pot', 'mixing bowl', 'baking dish', 'sharp knife', 'colander'],
          preparationSteps: [
            'Blanch cabbage leaves',
            'Prepare filling',
            'Roll cabbage leaves',
            'Make tomato sauce',
            'Braise until tender',
            'Serve with sour cream'
          ],
          ingredients: [
            { name: 'cabbage', amount: '1', unit: 'head', category: 'vegetable' },
            {
              name: 'ground meat',
              amount: '600',
              unit: 'g',
              category: 'protein',
              swaps: ['lentils']
            },
            { name: 'rice', amount: '200', unit: 'g', category: 'grain' },
            { name: 'tomato sauce', amount: '500', unit: 'ml', category: 'sauce' },
            { name: 'onions', amount: '200', unit: 'g', category: 'vegetable' },
            {
              name: 'sour cream',
              amount: '200',
              unit: 'ml',
              category: 'dairy',
              swaps: ['cashew cream']
            }
          ],
          substitutions: {
            'ground meat': ['lentils', 'mushroom mix', 'beyond meat'],
            'sour cream': ['cashew cream', 'coconut yogurt'],
            'white rice': ['brown rice', 'quinoa']
          },
          servingSize: 6,
          allergens: ['dairy'],
          prepTime: '45 minutes',
          cookTime: '75 minutes',
          culturalNotes:
            'A comfort food that showcases the Russian tradition of preserving cabbage. Often made in large batches and shared with family',
          pairingSuggestions: [
            'mashed potatoes',
            'fresh herbs',
            'black bread',
            'pickled vegetables'
          ],
          dietaryInfo: ['adaptable to vegetarian/vegan', 'gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 420,
            protein: 28,
            carbs: 48,
            fat: 18,
            vitamins: ['C', 'B12'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
}
        },
        {
          name: 'Kotlety',
          description: 'Russian style meat patties',
          cuisine: 'Russian',
          cookingMethods: ['grinding', 'mixing', 'frying'],
          tools: [
            'meat grinder or food processor',
            'mixing bowl',
            'frying pan',
            'spatula',
            'measuring cups'
          ],
          preparationSteps: [
            'Soak bread in milk',
            'Process meat with onion',
            'Mix ingredients',
            'Form into patties',
            'Fry until golden',
            'Rest before serving'
          ],
          ingredients: [
            {
              name: 'ground meat mix',
              amount: '500',
              unit: 'g',
              category: 'protein',
              swaps: ['mushroom mix']
            },
            {
              name: 'bread',
              amount: '100',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free bread']
            },
            { name: 'milk', amount: '100', unit: 'ml', category: 'dairy', swaps: ['oat milk'] },
            { name: 'onion', amount: '1', unit: 'large', category: 'vegetable' },
            { name: 'butter', amount: '50', unit: 'g', category: 'fat', swaps: ['oil'] }
          ],
          substitutions: {
            'ground meat mix': ['mushroom mix', 'beyond meat', 'impossible meat'],
            bread: ['gluten-free bread', 'breadcrumbs'],
            milk: ['plant-based milk', 'broth']
          },
          servingSize: 6,
          allergens: ['dairy', 'gluten'],
          prepTime: '20 minutes',
          cookTime: '20 minutes',
          culturalNotes:
            'A staple of Russian home cooking, these tender patties are often considered the ultimate comfort food. The addition of soaked bread makes them distinctly different from regular meatballs',
          pairingSuggestions: [
            'mashed potatoes',
            'buckwheat',
            'mushroom sauce',
            'pickled vegetables'
          ],
          dietaryInfo: ['adaptable to vegetarian/vegan', 'adaptable to gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 380,
            protein: 32,
            carbs: 22,
            fat: 24,
            vitamins: ['B12', 'B6'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.5,
            Fire: 0.3,
            Water: 0.1,
            Air: 0.1
}
        },
        {
          name: 'Olivier Salad',
          description: 'Russian festive potato salad',
          cuisine: 'Russian',
          cookingMethods: ['boiling', 'dicing', 'mixing'],
          tools: ['large pot', 'sharp knife', 'cutting board', 'mixing bowl', 'peeler'],
          preparationSteps: [
            'Boil vegetables and eggs',
            'Dice all ingredients',
            'Mix with mayonnaise',
            'Season to taste',
            'Chill before serving',
            'Garnish with herbs'
          ],
          ingredients: [
            { name: 'potatoes', amount: '500', unit: 'g', category: 'vegetable' },
            { name: 'carrots', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'peas', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'eggs', amount: '4', unit: 'large', category: 'protein' },
            { name: 'pickles', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'bologna', amount: '200', unit: 'g', category: 'protein', swaps: ['tofu'] },
            {
              name: 'mayonnaise',
              amount: '300',
              unit: 'g',
              category: 'condiment',
              swaps: ['vegan mayo']
            }
          ],
          substitutions: {
            bologna: ['ham', 'tofu', 'tempeh'],
            mayonnaise: ['vegan mayonnaise', 'cashew dressing'],
            eggs: ['tofu', 'chickpeas']
          },
          servingSize: 8,
          allergens: ['eggs', 'dairy'],
          prepTime: '40 minutes',
          cookTime: '30 minutes',
          chillTime: '60 minutes',
          culturalNotes:
            'Also known as 'Russian Salad' internationally, this is a must-have dish at New Year's celebrations and other festive occasions',
          pairingSuggestions: ['black bread', 'cold cuts', 'pickled vegetables'],
          dietaryInfo: ['adaptable to vegetarian/vegan'],
          spiceLevel: 'none',
          nutrition: {
            calories: 320,
            protein: 12,
            carbs: 28,
            fat: 18,
            vitamins: ['A', 'C', 'B12'],
            minerals: ['Potassium', 'Iron']
          },
          season: ['winter', 'all'],
          mealType: ['dinner', 'appetizer'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Air: 0.2,
            Fire: 0.1
}
        }
      ],
      winter: [
        {
          name: 'Zharkoe',
          description: 'Russian meat and potato stew',
          cuisine: 'Russian',
          cookingMethods: ['braising', 'stewing', 'roasting'],
          tools: ['dutch oven', 'cutting board', 'sharp knife', 'measuring cups', 'wooden spoon'],
          preparationSteps: [
            'Brown meat chunks',
            'Sauté vegetables',
            'Add potatoes',
            'Pour in broth',
            'Simmer until tender',
            'Season to taste'
          ],
          ingredients: [
            { name: 'beef', amount: '800', unit: 'g', category: 'protein', swaps: ['mushrooms'] },
            { name: 'potatoes', amount: '800', unit: 'g', category: 'vegetable' },
            { name: 'carrots', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'onions', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'garlic', amount: '4', unit: 'cloves', category: 'vegetable' },
            { name: 'bay leaves', amount: '2', unit: 'pieces', category: 'herb' }
          ],
          substitutions: {
            beef: ['mushrooms', 'seitan', 'jackfruit'],
            'beef broth': ['mushroom broth', 'vegetable broth'],
            potatoes: ['parsnips', 'turnips']
          },
          servingSize: 6,
          allergens: ['none'],
          prepTime: '30 minutes',
          cookTime: '120 minutes',
          culturalNotes:
            'A hearty winter dish that exemplifies Russian cooking's focus on simple, filling ingredients. Traditionally cooked in a clay pot in a Russian oven',
          pairingSuggestions: ['rye bread', 'sauerkraut', 'pickled vegetables', 'kvass'],
          dietaryInfo: ['gluten-free', 'adaptable to vegetarian/vegan'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 520,
            protein: 38,
            carbs: 42,
            fat: 24,
            vitamins: ['A', 'B12'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['winter'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
}
        }
      ]
    },
    dessert: {
      all: [
        {
          name: 'Pashka',
          description: 'Traditional Easter dessert with farmer's cheese',
          cuisine: 'Russian',
          cookingMethods: ['mixing', 'molding', 'chilling'],
          tools: [
            'pasochnitsa (special mold)',
            'cheesecloth',
            'mixing bowl',
            'food processor',
            'strainer'
          ],
          preparationSteps: [
            'Strain tvorog',
            'Process with butter',
            'Add dried fruits and nuts',
            'Mix in flavorings',
            'Press into mold',
            'Chill overnight'
          ],
          ingredients: [
            {
              name: 'tvorog',
              amount: '1',
              unit: 'kg',
              category: 'dairy',
              swaps: ['cashew cheese']
            },
            { name: 'butter', amount: '200', unit: 'g', category: 'dairy', swaps: ['coconut oil'] },
            { name: 'dried fruit', amount: '200', unit: 'g', category: 'fruit' },
            { name: 'nuts', amount: '100', unit: 'g', category: 'nuts' },
            { name: 'vanilla', amount: '1', unit: 'pod', category: 'spice' }
          ],
          substitutions: {
            tvorog: ['cashew cheese', 'silken tofu blend'],
            butter: ['coconut oil', 'vegan butter'],
            'dried fruit': ['candied fruit', 'fresh berries']
          },
          servingSize: 12,
          allergens: ['dairy', 'nuts'],
          prepTime: '30 minutes',
          chillTime: '24 hours',
          culturalNotes:
            'A traditional Easter dessert symbolizing the Paschal pyramid. The mold often has the letters XB, meaning 'Christ is Risen' in Church Slavonic',
          pairingSuggestions: ['kulich', 'Easter bread', 'tea'],
          dietaryInfo: ['vegetarian', 'adaptable to vegan'],
          spiceLevel: 'none',
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 28,
            fat: 32,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Phosphorus']
          },
          season: ['spring'],
          mealType: ['dessert'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Air: 0.2,
            Fire: 0.1
}
        },
        {
          name: 'Sochnik',
          description: 'Curd cheese pastry with sweet filling',
          cuisine: 'Russian',
          cookingMethods: ['mixing', 'rolling', 'baking'],
          tools: ['mixing bowls', 'rolling pin', 'baking sheet', 'parchment paper', 'pastry brush'],
          preparationSteps: [
            'Make pastry dough',
            'Prepare cheese filling',
            'Roll out dough',
            'Fill and shape',
            'Brush with egg wash',
            'Bake until golden'
          ],
          ingredients: [
            {
              name: 'flour',
              amount: '300',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            {
              name: 'tvorog',
              amount: '500',
              unit: 'g',
              category: 'dairy',
              swaps: ['cashew cheese']
            },
            {
              name: 'butter',
              amount: '200',
              unit: 'g',
              category: 'dairy',
              swaps: ['vegan butter']
            },
            { name: 'sugar', amount: '150', unit: 'g', category: 'sweetener' },
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein' }
          ],
          substitutions: {
            flour: ['gluten-free flour blend', 'almond flour'],
            tvorog: ['cashew cheese', 'tofu blend'],
            butter: ['vegan butter', 'coconut oil']
          },
          servingSize: 8,
          allergens: ['dairy', 'eggs', 'gluten'],
          prepTime: '30 minutes',
          cookTime: '25 minutes',
          culturalNotes:
            'A traditional Russian pastry that combines a flaky crust with sweet cheese filling. Popular as a tea-time treat',
          pairingSuggestions: ['black tea', 'coffee', 'fresh berries'],
          dietaryInfo: ['vegetarian', 'adaptable to vegan'],
          spiceLevel: 'none',
          nutrition: {
            calories: 380,
            protein: 12,
            carbs: 42,
            fat: 22,
            vitamins: ['A', 'D', 'B12'],
            minerals: ['Calcium']
          },
          season: ['all'],
          mealType: ['dessert', 'snack'],
          elementalProperties: {
            Earth: 0.3,
            Air: 0.3,
            Fire: 0.2,
            Water: 0.2
}
        },
        {
          name: 'Vareniki s Vishney',
          description: 'Sweet cherry dumplings',
          cuisine: 'Russian',
          cookingMethods: ['kneading', 'filling', 'boiling'],
          tools: [
            'mixing bowl',
            'rolling pin',
            'large pot',
            'slotted spoon',
            'knife',
            'round cutter'
          ],
          preparationSteps: [
            'Make dough',
            'Prepare cherry filling',
            'Roll out dough',
            'Cut circles',
            'Fill and seal dumplings',
            'Boil until floating',
            'Serve with sour cream'
          ],
          ingredients: [
            {
              name: 'flour',
              amount: '400',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            { name: 'cherries', amount: '500', unit: 'g', category: 'fruit' },
            { name: 'sugar', amount: '100', unit: 'g', category: 'sweetener' },
            { name: 'eggs', amount: '2', unit: 'large', category: 'protein' },
            {
              name: 'sour cream',
              amount: '200',
              unit: 'g',
              category: 'dairy',
              swaps: ['coconut cream']
            }
          ],
          substitutions: {
            flour: ['gluten-free flour blend', 'rice flour mix'],
            'sour cream': ['coconut cream', 'cashew cream'],
            eggs: ['flax eggs', 'commercial egg replacer']
          },
          servingSize: 6,
          allergens: ['gluten', 'eggs', 'dairy'],
          prepTime: '45 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A beloved summer dessert that makes use of fresh cherries. The tradition of making vareniki often brings families together',
          pairingSuggestions: ['sour cream', 'cherry sauce', 'powdered sugar', 'honey'],
          dietaryInfo: ['vegetarian', 'adaptable to vegan'],
          spiceLevel: 'none',
          nutrition: {
            calories: 320,
            protein: 6,
            carbs: 58,
            fat: 8,
            vitamins: ['C', 'A'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['summer'],
          mealType: ['dessert'],
          elementalProperties: {
            Earth: 0.3,
            Water: 0.3,
            Air: 0.3,
            Fire: 0.1
}
        },
        {
          name: 'Pryaniki',
          description: 'Traditional spiced honey cookies',
          cuisine: 'Russian',
          cookingMethods: ['mixing', 'rolling', 'baking', 'glazing'],
          tools: [
            'mixing bowls',
            'rolling pin',
            'baking sheets',
            'cookie cutters',
            'pastry brush',
            'cooling rack'
          ],
          preparationSteps: [
            'Heat honey with spices',
            'Mix dough ingredients',
            'Chill dough',
            'Roll and cut shapes',
            'Bake until firm',
            'Glaze while warm'
          ],
          ingredients: [
            {
              name: 'flour',
              amount: '400',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            { name: 'honey', amount: '200', unit: 'g', category: 'sweetener', swaps: ['agave'] },
            {
              name: 'butter',
              amount: '100',
              unit: 'g',
              category: 'dairy',
              swaps: ['vegan butter']
            },
            { name: 'spice mix', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'eggs', amount: '1', unit: 'large', category: 'protein' }
          ],
          substitutions: {
            flour: ['gluten-free flour blend', 'spelt flour'],
            honey: ['agave nectar', 'maple syrup'],
            butter: ['coconut oil', 'vegan butter']
          },
          servingSize: 24,
          allergens: ['gluten', 'eggs', 'dairy'],
          prepTime: '30 minutes',
          chillTime: '60 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'Traditional Russian spice cookies with a history dating back centuries. Often given as gifts during holidays and traditionally dunked in tea',
          pairingSuggestions: ['black tea', 'coffee', 'milk', 'jam'],
          dietaryInfo: ['vegetarian', 'adaptable to vegan'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 120,
            protein: 2,
            carbs: 22,
            fat: 3,
            vitamins: ['B1', 'B2'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['winter', 'autumn'],
          mealType: ['dessert', 'snack'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1
}
        }
      ],
      winter: [
        {
          name: 'Pryaniki',
          description: 'Traditional spiced honey cookies',
          cuisine: 'Russian',
          ingredients: [
            {
              name: 'flour',
              amount: '400',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour']
            },
            { name: 'honey', amount: '200', unit: 'g', category: 'sweetener' },
            { name: 'spice mix', amount: '2', unit: 'tbsp', category: 'spice' },
            {
              name: 'butter',
              amount: '100',
              unit: 'g',
              category: 'dairy',
              swaps: ['vegan butter']
            }
          ],
          nutrition: {
            calories: 280,
            protein: 4,
            carbs: 52,
            fat: 8,
            vitamins: ['B1', 'B2'],
            minerals: ['Iron']
          },
          timeToMake: '120 minutes',
          season: ['winter'],
          mealType: ['dessert']
        }
      ]
    }
  },
  traditionalSauces: {
    smetana: {
      name: 'Smetana',
      description: 'Cultured sour cream with rich texture and tangy flavor',
      base: 'milk fat',
      keyIngredients: ['cream', 'bacterial culture'],
      culinaryUses: [
        'soup topping',
        'sauce base',
        'baking ingredient',
        'dressing',
        'dollop on savory dishes'
      ],
      variants: [
        'Homestyle thick',
        'Commercial lighter',
        'Reduced fat',
        'Infused with herbs',
        'Fermented longer'
      ],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.3,
        Air: 0.2,
        Fire: 0.1
},
      astrologicalInfluences: ['Moon', 'Venus', 'Cancer'],
      seasonality: 'all',
      preparationNotes:
        'Traditionally fermented at room temperature for 24-48 hours to develop flavor and texture',
      technicalTips: 'Use as a finishing touch, adding after cooking to preserve its probiotic properties',
    },
    adjika: {
      name: 'Adjika',
      description: 'Spicy pepper and herb paste from the Caucasus region',
      base: 'hot peppers',
      keyIngredients: ['red peppers', 'garlic', 'herbs', 'salt', 'walnuts'],
      culinaryUses: [
        'meat marinade',
        'flavor enhancer',
        'bread spread',
        'vegetable seasoning',
        'stew base'
      ],
      variants: ['Abkhazian', 'Georgian', 'Russian style', 'Green adjika', 'Preserved version'],
      elementalProperties: {
        Fire: 0.6,
        Earth: 0.2,
        Air: 0.1,
        Water: 0.1
},
      astrologicalInfluences: ['Mars', 'Sun', 'Aries'],
      seasonality: 'summer preparation, year-round use',
      preparationNotes:
        'Traditionally ground with stone mortar and pestle, then fermented in clay pots',
      technicalTips: 'Can be used raw or cooked intensity mellows with cooking'
},
    khrenovina: {
      name: 'Khrenovina',
      description: 'Fiery horseradish and tomato sauce',
      base: 'horseradish root',
      keyIngredients: ['horseradish', 'tomatoes', 'garlic', 'salt', 'sugar'],
      culinaryUses: [
        'cold meat accompaniment',
        'sandwich spread',
        'appetizer dip',
        'zakuski component',
        'sauce for fatty foods'
      ],
      variants: ['Siberian', 'With beets', 'Extra hot', 'Tomato-forward', 'With apples'],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.2,
        Water: 0.2,
        Air: 0.1
},
      astrologicalInfluences: ['Mars', 'Saturn', 'Scorpio'],
      seasonality: 'made in autumn, consumed year-round',
      preparationNotes:
        'Often prepared during harvest season when horseradish is at its most pungent',
      technicalTips: 'Grate horseradish in well-ventilated area or underwater to prevent eye irritation'
},
    gribnoj_soys: {
      name: 'Gribnoj Sous',
      description: 'Rich mushroom sauce with sour cream base',
      base: 'mushrooms',
      keyIngredients: ['forest mushrooms', 'onions', 'butter', 'flour', 'sour cream'],
      culinaryUses: [
        'potato topping',
        'meat sauce',
        'dumpling accompaniment',
        'grain topping',
        'casserole base'
      ],
      variants: ['Wild mushroom', 'White mushroom', 'Creamy', 'Clear stock version', 'With wine'],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.3,
        Air: 0.1,
        Fire: 0.1
},
      astrologicalInfluences: ['Saturn', 'Neptune', 'Virgo'],
      seasonality: 'autumn mushroom harvest, preserved for year-round use',
      preparationNotes: 'Traditionally made with foraged wild mushrooms dried mushrooms are reconstituted in winter',
      technicalTips: 'Brown mushrooms thoroughly to develop full umami flavor before adding liquids'
},
    ikra: {
      name: 'Ikra Baklazhanaya',
      description: 'Smoky eggplant caviar spread',
      base: 'eggplant',
      keyIngredients: ['eggplants', 'tomatoes', 'onions', 'carrots', 'garlic', 'herbs'],
      culinaryUses: ['bread spread', 'appetizer', 'side dish', 'filling', 'vegetable topping'],
      variants: ['Odessa style', 'Smoky style', 'With peppers', 'Chunky rustic', 'Smooth pureed'],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Air: 0.1
},
      astrologicalInfluences: ['Venus', 'Mars', 'Taurus'],
      seasonality: 'summer preparation, preserved for winter use',
      preparationNotes:
        'Traditional preparation involves roasting eggplants over open flame for smoky flavor',
      technicalTips: 'Let flavors marry overnight for best taste, serve at room temperature',
    }
  },
  sauceRecommender: {
    forProtein: {
      beef: [
        'gribnoj sous',
        'smetana with dill',
        'mustard sauce',
        'horseradish',
        'black pepper sauce'
      ],
      pork: [
        'mustard sauce',
        'prune sauce',
        'apple-horseradish',
        'sour cherry sauce',
        'garlic sauce'
      ],
      poultry: [
        'sour cream sauce',
        'mushroom sauce',
        'cranberry sauce',
        'adjika marinade',
        'garlic butter'
      ],
      fish: [
        'ukha reduction',
        'sorrel sauce',
        'smetana with chives',
        'mustard-dill',
        'white wine sauce'
      ],
      game: [
        'lingonberry sauce',
        'juniper sauce',
        'sour cream with mushrooms',
        'blackcurrant sauce',
        'adjika'
      ]
    },
    forVegetable: {
      root: ['smetana', 'brown butter', 'dill sauce', 'mushroom gravy', 'beet sauce'],
      leafy: [
        'smetana-garlic',
        'sunflower oil dressing',
        'mustard vinaigrette',
        'kvas reduction',
        'sour cream with herbs'
      ],
      mushroom: ['sour cream', 'garlic butter', 'dill sauce', 'wine reduction', 'walnut oil'],
      pickled: ['honey drizzle', 'sunflower oil', 'mustard sauce', 'smetana', 'herb oil'],
      preserved: ['horseradish cream', 'mustard sauce', 'herb oil', 'garlic sauce', 'sour cream']
    },
    forCookingMethod: {
      baking: ['smetana glaze', 'egg wash', 'honey glaze', 'mushroom sauce', 'garlic butter'],
      boiling: [
        'butter with herbs',
        'sour cream',
        'mustard sauce',
        'vinegar reduction',
        'horseradish cream'
      ],
      frying: ['mushroom sauce', 'garlic sauce', 'adjika', 'sour cream', 'berry sauce'],
      stewing: [
        'broth reduction',
        'sour cream finish',
        'dill sauce',
        'wine sauce',
        'tomato-pepper sauce'
      ],
      smoking: [
        'horseradish cream',
        'mustard sauce',
        'lingonberry sauce',
        'kvas reduction',
        'sour pickle sauce'
      ]
    },
    byAstrological: {
      fire: ['adjika', 'hot mustard', 'pepper sauce', 'horseradish cream', 'spicy tomato'],
      earth: ['mushroom sauce', 'potato sauce', 'beet sauce', 'dill-sour cream', 'cabbage sauce'],
      water: ['fish sauce', 'sorrel sauce', 'sour cream', 'kvass sauce', 'berry sauce'],
      air: [
        'light herb oils',
        'vinaigrettes',
        'whipped smetana',
        'honey-herb dressing',
        'berry vinegar'
      ]
    },
    byRegion: {
      northern: ['mushroom sauce', 'fish broth', 'berry sauce', 'herb butter', 'sour milk sauce'],
      southern: ['adjika', 'tomato sauces', 'garlic sauce', 'herb oils', 'fruit compotes'],
      siberian: [
        'pine nut sauce',
        'game reductions',
        'sea buckthorn sauce',
        'wild herb oil',
        'cedar infusions'
      ],
      ural: [
        'mushroom gravy',
        'root vegetable sauce',
        'black pepper sauce',
        'honey-herb',
        'berry reductions'
      ],
      volga: ['fish sauce', 'mustard sauce', 'sour cream', 'dill sauce', 'horseradish cream']
    },
    byDietary: {
      vegetarian: ['mushroom sauce', 'berry sauce', 'herb oil', 'smetana', 'vegetable reductions'],
      vegan: ['herb oil', 'berry sauce', 'kvass reduction', 'mushroom broth', 'vegetable purees'],
      glutenFree: ['smetana', 'herb butter', 'berry sauce', 'vegetable purees', 'nut-based sauces'],
      dairyFree: [
        'herb oil',
        'vegetable broth',
        'berry reduction',
        'kvass sauce',
        'tomato-based sauce'
      ]
    }
  },
  cookingTechniques: [
    {
      name: 'Souring (Zakvaski)',
      description:
        'Traditional fermentation techniques for preserving vegetables, dairy, and grains',
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      toolsRequired: ['clay pots', 'wooden tools', 'brine', 'glass jars', 'weights'],
      bestFor: ['cabbage', 'cucumbers', 'beets', 'milk', 'bread starter'],
      difficulty: 'medium'
},
    {
      name: 'Russian Oven Cooking',
      description:
        'Slow cooking in traditional masonry stove that retains heat for extended periods',
      elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
      toolsRequired: ['pech (Russian oven)', 'clay pots', 'long wooden paddles', 'cast iron pots'],
      bestFor: ['stews', 'porridges', 'breads', 'slow-roasted meats', 'pies'],
      difficulty: 'hard'
},
    {
      name: 'Solenije',
      description:
        'Salt preservation technique creating distinctive flavors different from fermentation',
      elementalProperties: { Earth: 0.5, Water: 0.3, Fire: 0.1, Air: 0.1 },
      toolsRequired: ['wooden barrels', 'salt', 'heavy weights', 'herbs', 'glass jars'],
      bestFor: ['mushrooms', 'vegetables', 'fish', 'pork fat', 'herbs'],
      difficulty: 'easy'
},
    {
      name: 'Smokehouse Methods',
      description: 'Cold and hot smoking techniques for preserving fish, meat, and cheeses',
      elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
      toolsRequired: ['smoke house', 'wood chips', 'hooks', 'racks', 'temperature control'],
      bestFor: ['fish', 'game', 'sausages', 'pork fat', 'cheese'],
      difficulty: 'hard'
},
    {
      name: 'Томление (Tomlenie)',
      description: 'Ultra-slow cooking/simmering method in covered pots to develop deep flavors',
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: ['cast iron pot', 'heat diffuser', 'slow heat source', 'wooden spoon'],
      bestFor: ['porridges', 'milk dishes', 'stews', 'root vegetables', 'grains'],
      difficulty: 'medium'
}
  ],
  regionalCuisines: {
    northern: {
      name: 'Northern Russian Cuisine',
      description:
        'Fish-forward cuisine with berries, mushrooms, and hearty grains adapted to cold climate',
      signature: [
        'ukha',
        'pies with fish',
        'lingonberry dishes',
        'mushroom preparations',
        'grain porridges'
      ],
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ['Moon', 'Saturn', 'Pisces'],
      seasonality: 'strongly seasonal with emphasis on preservation'
},
    central: {
      name: 'Central Russian Cuisine',
      description: 'Classic Russian dishes with simple ingredients and traditional cooking methods',
      signature: ['shchi', 'kasha', 'olivier salad', 'kotlety', 'black bread'],
      elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Saturn', 'Venus', 'Taurus'],
      seasonality: 'four distinct seasonal variations with preservation techniques'
},
    siberian: {
      name: 'Siberian Cuisine',
      description:
        'Hearty, calorie-rich food designed for extreme cold, featuring game and wild plants',
      signature: ['pelmeni', 'stroganina', 'cedar nuts', 'game meats', 'fish pie'],
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Saturn', 'Jupiter', 'Capricorn'],
      seasonality: 'short growing season with extensive preservation'
},
    caucasian: {
      name: 'Caucasian-Influenced Russian Cuisine',
      description:
        'Southern Russian cooking with strong influences from Georgia, Armenia, and Azerbaijan',
      signature: [
        'shashlik',
        'adjika',
        'khachapuri adaptations',
        'herb-forward dishes',
        'fruit preserves'
      ],
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
      astrologicalInfluences: ['Mars', 'Sun', 'Aries'],
      seasonality: 'longer growing season with more fresh produce'
},
    volga: {
      name: 'Volga Region Cuisine',
      description:
        'Diverse cuisine reflecting the multicultural Volga river basin with Tatar influences',
      signature: ['belish', 'ukha', 'river fish dishes', 'pastries', 'honey-based desserts'],
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Jupiter', 'Moon', 'Cancer'],
      seasonality: 'river-influenced with seasonal fishing patterns'
}
  },
  elementalProperties: {
    Earth: 0.5,
    Water: 0.3,
    Fire: 0.1,
    Air: 0.1
}
};

export default russian;
