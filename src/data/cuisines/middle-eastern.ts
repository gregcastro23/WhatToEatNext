// src/data/cuisines/middle-eastern.ts
import { Cuisine } from '@/types/cuisine';

export const middleEastern: Cuisine = {;
  id: 'middle-eastern',
  name: 'Middle Eastern',
  description: 'Traditional Middle Eastern cuisine featuring aromatic spices, fresh herbs, and ancient cooking techniques',
  dishes: {
    breakfast: {
      all: [
        {
          name: 'Shakshuka',
          description: 'Eggs poached in spiced tomato sauce with peppers and onions',
          cuisine: 'Middle Eastern',
          cookingMethods: ['poaching', 'simmering', 'sautéing'],
          tools: ['large skillet', 'lid', 'wooden spoon', 'measuring spoons', 'knife'],
          preparationSteps: [
            'Sauté onions and peppers',
            'Add spices and tomatoes',
            'Simmer sauce until thickened',
            'Create wells for eggs',
            'Poach eggs in sauce',
            'Garnish with herbs'
          ],
          ingredients: [
            { name: 'eggs', amount: '4', unit: 'large', category: 'protein', swaps: ['soft tofu'] }
            { name: 'tomatoes', amount: '400', unit: 'g', category: 'vegetable' }
            { name: 'bell peppers', amount: '2', unit: 'medium', category: 'vegetable' }
            { name: 'onion', amount: '1', unit: 'large', category: 'vegetable' }
            { name: 'garlic', amount: '3', unit: 'cloves', category: 'vegetable' }
            { name: 'cumin', amount: '1', unit: 'tsp', category: 'spice' }
            { name: 'paprika', amount: '1', unit: 'tsp', category: 'spice' }
            {
              name: 'pita bread',
              amount: '2',
              unit: 'pieces',
              category: 'grain',
              swaps: ['gluten-free pita']
            }
          ],
          substitutions: {
            eggs: ['soft tofu', 'chickpea flour mixture'],
            'pita bread': ['gluten-free pita', 'crusty bread'],
            'bell peppers': ['roasted red peppers', 'zucchini']
          },
          servingSize: 2,
          allergens: ['eggs'],
          prepTime: '10 minutes',
          cookTime: '15 minutes',
          culturalNotes: 'A beloved breakfast dish throughout the Middle East and North Africa, particularly popular in Israel and Palestine. The name means 'mixture' in Arabic dialects',
          pairingSuggestions: ['pita bread', 'hummus', 'Israeli salad', 'olives'],
          dietaryInfo: ['vegetarian', 'adaptable to vegan', 'gluten-free option'],
          spiceLevel: 'mild to medium',
          nutrition: {
            calories: 420,
            protein: 24,
            carbs: 38,
            fat: 22,
            vitamins: ['A', 'C', 'D'],
            minerals: ['Iron', 'Calcium']
          },
          timeToMake: '25 minutes',
          season: ['all'],
          mealType: ['breakfast', 'brunch'],
          elementalProperties: {
            Fire: 0.4,
            Earth: 0.3,
            Water: 0.2,
            Air: 0.1
          }
        }
        {
          name: 'Ful Medames',
          description: 'Traditional fava bean breakfast with olive oil, lemon, and herbs',
          cuisine: 'Middle Eastern',
          cookingMethods: ['simmering', 'mashing', 'garnishing'],
          tools: ['medium pot', 'potato masher or fork', 'serving bowl', 'citrus juicer', 'knife'],
          preparationSteps: [
            'Simmer fava beans until tender',
            'Mash beans partially',
            'Mix with olive oil and lemon',
            'Season with cumin and garlic',
            'Garnish with herbs and tomatoes',
            'Drizzle with additional oil'
          ],
          ingredients: [
            { name: 'fava beans', amount: '400', unit: 'g', category: 'legume' }
            { name: 'olive oil', amount: '3', unit: 'tbsp', category: 'oil' }
            { name: 'lemon juice', amount: '2', unit: 'tbsp', category: 'acid' }
            { name: 'garlic', amount: '2', unit: 'cloves', category: 'vegetable' }
            { name: 'cumin', amount: '1', unit: 'tsp', category: 'spice' }
            { name: 'parsley', amount: '1/4', unit: 'cup', category: 'herb' }
            { name: 'tomatoes', amount: '2', unit: 'medium', category: 'vegetable' }
          ],
          substitutions: {
            'fava beans': ['lima beans', 'chickpeas'],
            parsley: ['cilantro', 'mint'],
            tomatoes: ['cucumber', 'radishes']
          },
          servingSize: 4,
          allergens: ['none'],
          prepTime: '10 minutes',
          cookTime: '10 minutes',
          culturalNotes: 'Egypt's national dish, dating back to ancient times. Traditionally served for breakfast but enjoyed throughout the day',
          pairingSuggestions: ['pita bread', 'sliced eggs', 'olive oil', 'tahini sauce'],
          dietaryInfo: ['vegan', 'gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 45,
            fat: 16,
            vitamins: ['C', 'K', 'B6'],
            minerals: ['Iron', 'Folate']
          },
          timeToMake: '20 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
        }
        {
          name: 'Manakish Za'atar',
          description: 'Flatbread topped with za'atar herb blend and olive oil',
          cuisine: 'Middle Eastern (Levant)',
          cookingMethods: ['baking', 'kneading', 'topping'],
          tools: ['mixing bowl', 'baking sheet', 'rolling pin', 'pastry brush', 'oven'],
          preparationSteps: [
            'Prepare bread dough',
            'Let dough rise',
            'Roll out into circles',
            'Mix za'atar with oil',
            'Spread za'atar mixture',
            'Bake until golden'
          ],
          ingredients: [
            {
              name: 'bread flour',
              amount: '500',
              unit: 'g',
              category: 'grain',
              swaps: ['whole wheat flour']
            }
            { name: 'za'atar', amount: '1/2', unit: 'cup', category: 'spice blend' }
            { name: 'olive oil', amount: '1/2', unit: 'cup', category: 'oil' }
            { name: 'yeast', amount: '2', unit: 'tsp', category: 'leavening' }
            { name: 'sugar', amount: '1', unit: 'tsp', category: 'sweetener' }
            { name: 'salt', amount: '2', unit: 'tsp', category: 'seasoning' }
          ],
          substitutions: {
            'bread flour': ['all-purpose flour', 'gluten-free flour blend'],
            'za'atar': ['dried oregano + sesame seeds + sumac'],
            'olive oil': ['grapeseed oil', 'avocado oil']
          },
          servingSize: 6,
          allergens: ['gluten'],
          prepTime: '20 minutes',
          cookTime: '15 minutes',
          culturalNotes: 'A beloved street food throughout the Levant, traditionally enjoyed for breakfast. The za'atar blend varies by region and family recipe',
          pairingSuggestions: ['labneh', 'olives', 'fresh vegetables', 'mint tea'],
          dietaryInfo: ['vegan', 'adaptable to gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 45,
            fat: 12,
            vitamins: ['E', 'K'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Air: 0.4,
            Earth: 0.3,
            Fire: 0.2,
            Water: 0.1
          }
        }
        {
          name: 'Labneh with Za'atar',
          description: 'Strained yogurt cheese with olive oil and za'atar spice blend',
          cuisine: 'Middle Eastern (Levant)',
          cookingMethods: ['straining', 'garnishing'],
          tools: ['cheesecloth', 'strainer', 'mixing bowl', 'serving plate'],
          preparationSteps: [
            'Strain yogurt overnight',
            'Form into balls or spread',
            'Drizzle with olive oil',
            'Sprinkle with za'atar',
            'Garnish with fresh herbs'
          ],
          ingredients: [
            {
              name: 'yogurt',
              amount: '1',
              unit: 'kg',
              category: 'dairy',
              swaps: ['coconut yogurt']
            }
            { name: 'za'atar', amount: '3', unit: 'tbsp', category: 'spice blend' }
            { name: 'olive oil', amount: '1/4', unit: 'cup', category: 'oil' }
            { name: 'mint leaves', amount: '1', unit: 'handful', category: 'herb' }
            {
              name: 'pita bread',
              amount: '4',
              unit: 'pieces',
              category: 'grain',
              swaps: ['gluten-free pita']
            }
          ],
          substitutions: {
            yogurt: ['Greek yogurt', 'coconut yogurt'],
            'za'atar': ['dried thyme + sesame seeds'],
            'pita bread': ['gluten-free bread', 'vegetables']
          },
          servingSize: 6,
          allergens: ['dairy'],
          prepTime: '10 minutes',
          cookTime: '12 hours straining',
          culturalNotes: 'A staple breakfast food throughout the Levant, often served with olive oil and fresh herbs',
          pairingSuggestions: ['cucumber', 'tomatoes', 'olives', 'fresh mint tea'],
          dietaryInfo: ['vegetarian', 'adaptable to vegan'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 180,
            protein: 12,
            carbs: 8,
            fat: 14,
            vitamins: ['B12', 'D'],
            minerals: ['Calcium', 'Probiotics']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: 'Mansaf',
          description: 'Traditional Levantine lamb dish with fermented dried yogurt and rice',
          cuisine: 'Middle Eastern (Jordan)',
          cookingMethods: ['simmering', 'layering', 'fermenting'],
          tools: ['large pot', 'serving platter', 'rice cooker', 'strainer', 'wooden spoon'],
          preparationSteps: [
            'Prepare jameed sauce',
            'Cook lamb until tender',
            'Prepare rice',
            'Toast pine nuts',
            'Layer rice and meat',
            'Pour sauce over',
            'Garnish with nuts and parsley'
          ],
          ingredients: [
            { name: 'lamb shoulder', amount: '1.5', unit: 'kg', category: 'protein' }
            { name: 'jameed', amount: '500', unit: 'g', category: 'dairy' }
            { name: 'rice', amount: '1', unit: 'kg', category: 'grain' }
            { name: 'pine nuts', amount: '100', unit: 'g', category: 'nut' }
            { name: 'flatbread', amount: '4', unit: 'pieces', category: 'grain' }
            { name: 'parsley', amount: '1', unit: 'bunch', category: 'herb' }
          ],
          substitutions: {
            jameed: ['yogurt + salt', 'buttermilk'],
            lamb: ['beef', 'chicken'],
            'pine nuts': ['walnuts', 'almonds']
          },
          servingSize: 6,
          allergens: ['dairy', 'nuts'],
          prepTime: '30 minutes',
          cookTime: '180 minutes',
          culturalNotes: 'Jordan's national dish, traditionally served on special occasions. The dish represents Bedouin hospitality and generosity',
          pairingSuggestions: ['Arabic salad', 'yogurt', 'mint tea'],
          dietaryInfo: ['halal'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 750,
            protein: 45,
            carbs: 65,
            fat: 38,
            vitamins: ['B12', 'D'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
        }
        {
          name: 'Fattoush',
          description: 'Levantine bread salad with sumac and mixed vegetables',
          cuisine: 'Middle Eastern (Levant)',
          cookingMethods: ['toasting', 'chopping', 'tossing'],
          tools: ['large bowl', 'sharp knife', 'baking sheet', 'whisk'],
          preparationSteps: [
            'Toast pita bread',
            'Chop vegetables',
            'Make dressing',
            'Combine ingredients',
            'Add bread just before serving',
            'Garnish with sumac'
          ],
          ingredients: [
            {
              name: 'pita bread',
              amount: '2',
              unit: 'pieces',
              category: 'grain',
              swaps: ['gluten-free pita']
            }
            { name: 'romaine lettuce', amount: '1', unit: 'head', category: 'vegetable' }
            { name: 'cucumber', amount: '2', unit: 'medium', category: 'vegetable' }
            { name: 'tomatoes', amount: '3', unit: 'medium', category: 'vegetable' }
            { name: 'radishes', amount: '6', unit: 'medium', category: 'vegetable' }
            { name: 'sumac', amount: '2', unit: 'tbsp', category: 'spice' }
            { name: 'pomegranate molasses', amount: '2', unit: 'tbsp', category: 'condiment' }
          ],
          substitutions: {
            'pita bread': ['gluten-free bread', 'crackers'],
            sumac: ['lemon zest + salt'],
            'pomegranate molasses': ['balsamic reduction']
          },
          servingSize: 4,
          allergens: ['gluten'],
          prepTime: '20 minutes',
          cookTime: '5 minutes',
          culturalNotes: 'A refreshing salad that originated as a way to use stale bread. The sumac provides a distinctive tangy flavor essential to Levantine cuisine',
          pairingSuggestions: ['grilled meats', 'hummus', 'falafel'],
          dietaryInfo: ['vegan', 'adaptable to gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 220,
            protein: 6,
            carbs: 42,
            fat: 4,
            vitamins: ['C', 'A', 'K'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['summer'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Air: 0.4,
            Water: 0.3,
            Earth: 0.2,
            Fire: 0.1
          }
        }
      ]
    },
    dinner: {
      winter: [
        {
          name: 'Moussaka',
          description: 'Layered eggplant and spiced meat casserole with béchamel',
          cuisine: 'Middle Eastern',
          cookingMethods: ['baking', 'frying', 'layering', 'sautéing'],
          tools: ['large baking dish', 'skillet', 'saucepan', 'mandoline', 'whisk', 'strainer'],
          preparationSteps: [
            'Salt and drain eggplant',
            'Fry eggplant slices',
            'Prepare meat sauce',
            'Make béchamel sauce',
            'Layer ingredients',
            'Bake until golden'
          ],
          ingredients: [
            {
              name: 'ground lamb',
              amount: '500',
              unit: 'g',
              category: 'protein',
              swaps: ['plant-based ground']
            }
            { name: 'eggplant', amount: '3', unit: 'large', category: 'vegetable' }
            { name: 'potatoes', amount: '2', unit: 'medium', category: 'vegetable' }
            { name: 'onion', amount: '1', unit: 'large', category: 'vegetable' }
            { name: 'tomato sauce', amount: '400', unit: 'ml', category: 'sauce' }
            {
              name: 'béchamel sauce',
              amount: '500',
              unit: 'ml',
              category: 'sauce',
              swaps: ['cashew sauce']
            }
            { name: 'cinnamon', amount: '1', unit: 'tsp', category: 'spice' }
            { name: 'nutmeg', amount: '1/4', unit: 'tsp', category: 'spice' }
          ],
          substitutions: {
            'ground lamb': ['ground beef', 'plant-based ground'],
            béchamel: ['cashew cream sauce', 'almond milk sauce'],
            eggplant: ['zucchini', 'mushrooms']
          },
          servingSize: 8,
          allergens: ['dairy', 'gluten'],
          prepTime: '45 minutes',
          cookTime: '45 minutes',
          culturalNotes: 'A beloved dish throughout the Middle East and Mediterranean, each region having its own variation. The combination of meat and eggplant reflects the region's agricultural heritage',
          pairingSuggestions: ['Greek salad', 'crusty bread', 'red wine'],
          dietaryInfo: ['adaptable to vegetarian/vegan'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 580,
            protein: 32,
            carbs: 45,
            fat: 34,
            vitamins: ['B12', 'A', 'C'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['winter'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Water: 0.2,
            Air: 0.1
          }
        }
        {
          name: 'Kuzi',
          description: 'Whole roasted lamb with spiced rice and nuts',
          cuisine: 'Middle Eastern',
          cookingMethods: ['roasting', 'braising', 'steaming'],
          tools: [
            'large roasting pan',
            'rice cooker',
            'spice grinder',
            'kitchen twine',
            'thermometer'
          ],
          preparationSteps: [
            'Marinate lamb',
            'Prepare spice mixture',
            'Cook aromatic rice',
            'Toast nuts',
            'Roast lamb',
            'Assemble and garnish'
          ],
          ingredients: [
            {
              name: 'lamb shoulder',
              amount: '2',
              unit: 'kg',
              category: 'protein',
              swaps: ['jackfruit', 'mushrooms']
            }
            { name: 'aromatic rice', amount: '500', unit: 'g', category: 'grain' }
            { name: 'almonds', amount: '100', unit: 'g', category: 'nuts' }
            { name: 'pine nuts', amount: '50', unit: 'g', category: 'nuts' }
            { name: 'raisins', amount: '100', unit: 'g', category: 'fruit' }
            { name: 'mixed spices', amount: '3', unit: 'tbsp', category: 'spice' }
          ],
          substitutions: {
            'lamb shoulder': ['beef shoulder', 'jackfruit'],
            'pine nuts': ['cashews', 'almonds'],
            'mixed spices': ['baharat', 'ras el hanout']
          },
          servingSize: 8,
          allergens: ['nuts'],
          prepTime: '60 minutes',
          cookTime: '180 minutes',
          culturalNotes: 'A celebratory dish often served at important gatherings and festivals. The combination of meat, rice, and nuts represents abundance and hospitality';
          pairingSuggestions: ['tabbouleh', 'yogurt sauce', 'flatbread'],
          dietaryInfo: ['halal'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 850,
            protein: 45,
            carbs: 65,
            fat: 48,
            vitamins: ['B12', 'B6', 'E'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['winter'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Water: 0.1
          }
        }
      ],
      summer: [
        {
          name: 'Mixed Grill Platter',
          description: 'Assortment of grilled meats and vegetables with various dips',
          cuisine: 'Middle Eastern',
          cookingMethods: ['grilling', 'marinating', 'assembling'],
          tools: ['grill', 'skewers', 'tongs', 'mixing bowls', 'serving platter'],
          preparationSteps: [
            'Prepare marinades',
            'Marinate meats',
            'Thread onto skewers',
            'Grill meats and vegetables',
            'Prepare accompaniments',
            'Arrange on platter'
          ],
          ingredients: [
            {
              name: 'lamb kofta',
              amount: '400',
              unit: 'g',
              category: 'protein',
              swaps: ['mushroom kofta']
            }
            {
              name: 'chicken shish',
              amount: '400',
              unit: 'g',
              category: 'protein',
              swaps: ['seitan skewers']
            }
            { name: 'mixed vegetables', amount: '500', unit: 'g', category: 'vegetable' }
            { name: 'hummus', amount: '200', unit: 'g', category: 'dip' }
            { name: 'baba ganoush', amount: '200', unit: 'g', category: 'dip' }
            {
              name: 'flatbread',
              amount: '4',
              unit: 'pieces',
              category: 'grain',
              swaps: ['gluten-free flatbread']
            }
          ],
          substitutions: {
            'lamb kofta': ['beef kofta', 'plant-based kofta'],
            'chicken shish': ['tofu shish', 'seitan'],
            flatbread: ['gluten-free pita', 'lettuce wraps']
          },
          servingSize: 4,
          allergens: ['gluten'],
          prepTime: '30 minutes',
          cookTime: '25 minutes',
          culturalNotes: 'Grilled meats are central to Middle Eastern cuisine, often served at gatherings and celebrations. Each region has its own special marinades and spice blends',
          pairingSuggestions: ['fattoush salad', 'pickled vegetables', 'garlic sauce'],
          dietaryInfo: ['halal', 'adaptable to vegetarian/vegan'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 680,
            protein: 45,
            carbs: 55,
            fat: 32,
            vitamins: ['B12', 'C', 'A'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['summer'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.5,
            Air: 0.2,
            Earth: 0.2,
            Water: 0.1
          }
        }
        {
          name: 'Mujaddara',
          description: 'Lentils and rice with caramelized onions',
          cuisine: 'Middle Eastern',
          cookingMethods: ['simmering', 'frying', 'combining'],
          tools: ['large pot', 'skillet', 'strainer', 'wooden spoon'],
          preparationSteps: [
            'Cook lentils until tender',
            'Prepare rice',
            'Caramelize onions',
            'Combine ingredients',
            'Season with cumin',
            'Garnish with crispy onions'
          ],
          ingredients: [
            { name: 'brown lentils', amount: '250', unit: 'g', category: 'legume' }
            { name: 'rice', amount: '250', unit: 'g', category: 'grain' }
            { name: 'onions', amount: '3', unit: 'large', category: 'vegetable' }
            { name: 'olive oil', amount: '1/2', unit: 'cup', category: 'oil' }
            { name: 'cumin', amount: '2', unit: 'tsp', category: 'spice' }
          ],
          substitutions: {
            'brown lentils': ['green lentils', 'black lentils'],
            rice: ['bulgur', 'quinoa'],
            'olive oil': ['vegetable oil', 'ghee']
          },
          servingSize: 6,
          allergens: ['none'],
          prepTime: '15 minutes',
          cookTime: '45 minutes',
          culturalNotes: 'A humble yet beloved dish throughout the Middle East, traditionally eaten during Lent. The contrast of textures between the soft lentils and crispy onions is essential',
          pairingSuggestions: ['yogurt', 'Arabic salad', 'pickled vegetables'],
          dietaryInfo: ['vegan', 'gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 380,
            protein: 12,
            carbs: 58,
            fat: 14,
            vitamins: ['B1', 'B6'],
            minerals: ['Iron', 'Folate']
          },
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Earth: 0.5,
            Water: 0.2,
            Fire: 0.2,
            Air: 0.1
          }
        }
      ],
      all: [
        {
          name: 'Shawarma',
          description: 'Marinated meat slowly roasted on a vertical spit, served in bread with tahini sauce',
          cuisine: 'Middle Eastern',
          cookingMethods: ['roasting', 'marinating', 'slicing'],
          tools: [
            'vertical rotisserie',
            'sharp knife',
            'mixing bowls',
            'food processor',
            'serving plates'
          ],
          preparationSteps: [
            'Prepare marinade',
            'Marinate meat overnight',
            'Stack on vertical spit',
            'Slow roast',
            'Slice thin portions',
            'Serve with accompaniments'
          ],
          ingredients: [
            {
              name: 'chicken thighs',
              amount: '2',
              unit: 'kg',
              category: 'protein',
              swaps: ['seitan']
            }
            { name: 'shawarma spice mix', amount: '4', unit: 'tbsp', category: 'spice blend' }
            { name: 'garlic', amount: '8', unit: 'cloves', category: 'aromatic' }
            { name: 'lemon juice', amount: '1/2', unit: 'cup', category: 'acid' }
            { name: 'olive oil', amount: '1/2', unit: 'cup', category: 'oil' }
            {
              name: 'pita bread',
              amount: '8',
              unit: 'pieces',
              category: 'grain',
              swaps: ['lettuce wraps']
            }
          ],
          substitutions: {
            'chicken thighs': ['lamb', 'seitan', 'jackfruit'],
            'pita bread': ['flatbread', 'gluten-free wrap'],
            'shawarma spice mix': ['curry powder + cumin + paprika']
          },
          servingSize: 8,
          allergens: ['gluten'],
          prepTime: '30 minutes',
          cookTime: '240 minutes',
          culturalNotes: 'A street food staple throughout the Middle East, each region has its own spice blend and serving style',
          pairingSuggestions: ['hummus', 'tabbouleh', 'pickled vegetables', 'garlic sauce'],
          dietaryInfo: ['halal', 'adaptable to vegan'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 35,
            fat: 22,
            vitamins: ['B12', 'B6'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all'],
          mealType: ['dinner']
        }

        {
          name: 'Baklava',
          description: 'Layered phyllo pastry filled with nuts and soaked in honey syrup',
          cuisine: 'Middle Eastern',
          cookingMethods: ['layering', 'baking', 'syrup-making'],
          tools: ['baking dish', 'pastry brush', 'sharp knife', 'saucepan', 'food processor'],
          preparationSteps: [
            'Process nuts with spices',
            'Layer phyllo sheets with butter',
            'Add nut mixture',
            'Continue layering',
            'Cut into diamonds',
            'Bake until golden',
            'Pour hot syrup over'
          ],
          ingredients: [
            { name: 'phyllo dough', amount: '1', unit: 'package', category: 'pastry' }
            { name: 'walnuts', amount: '500', unit: 'g', category: 'nut' }
            { name: 'butter', amount: '400', unit: 'g', category: 'fat' }
            { name: 'honey', amount: '250', unit: 'ml', category: 'sweetener' }
            { name: 'cinnamon', amount: '2', unit: 'tsp', category: 'spice' }
          ],
          substitutions: {
            walnuts: ['pistachios', 'almonds'],
            butter: ['ghee', 'clarified butter'],
            honey: ['sugar syrup', 'agave']
          },
          servingSize: 24,
          allergens: ['nuts', 'gluten'],
          prepTime: '45 minutes',
          cookTime: '45 minutes',
          culturalNotes: 'A dessert with ancient origins, found throughout the former Ottoman Empire. Each region claims its own style and nut preference',
          pairingSuggestions: ['Turkish coffee', 'mint tea'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 300,
            protein: 5,
            carbs: 25,
            fat: 22,
            vitamins: ['E'],
            minerals: ['Magnesium']
          },
          season: ['all'],
          mealType: ['dessert'],
          elementalProperties: {
            Earth: 0.4,
            Air: 0.3,
            Fire: 0.2,
            Water: 0.1
          }
        }

        {
          name: 'Falafel',
          description: 'Deep-fried patties made from ground chickpeas or fava beans with herbs and spices',
          cuisine: 'Middle Eastern',
          cookingMethods: ['grinding', 'shaping', 'deep-frying'],
          tools: ['food processor', 'deep fryer', 'thermometer', 'slotted spoon', 'mixing bowls'],
          preparationSteps: [
            'Soak chickpeas overnight',
            'Process with herbs and spices',
            'Rest mixture',
            'Shape into balls',
            'Deep fry until golden',
            'Serve with tahini sauce'
          ],
          ingredients: [
            { name: 'dried chickpeas', amount: '500', unit: 'g', category: 'legume' }
            { name: 'parsley', amount: '2', unit: 'bunches', category: 'herb' }
            { name: 'cilantro', amount: '1', unit: 'bunch', category: 'herb' }
            { name: 'onion', amount: '1', unit: 'large', category: 'vegetable' }
            { name: 'garlic', amount: '6', unit: 'cloves', category: 'aromatic' }
            { name: 'cumin', amount: '2', unit: 'tbsp', category: 'spice' }
            { name: 'coriander', amount: '2', unit: 'tbsp', category: 'spice' }
          ],
          substitutions: {
            chickpeas: ['fava beans', 'split peas'],
            parsley: ['more cilantro', 'mint'],
            'vegetable oil': ['grapeseed oil', 'sunflower oil']
          },
          servingSize: 6,
          allergens: ['none'],
          prepTime: '12 hours soaking',
          cookTime: '30 minutes',
          culturalNotes: 'A staple street food throughout the Middle East, with origins in Egypt. Each region claims to make the best version',
          pairingSuggestions: ['pita bread', 'tahini sauce', 'pickled vegetables', 'hummus'],
          dietaryInfo: ['vegan', 'gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 320,
            protein: 15,
            carbs: 45,
            fat: 12,
            vitamins: ['C', 'K', 'B6'],
            minerals: ['Iron', 'Folate']
          },
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1
          }
        }

        {
          name: 'Umm Ali',
          description: 'Egyptian bread pudding with milk, cream, and nuts',
          cuisine: 'Middle Eastern (Egyptian)',
          cookingMethods: ['baking', 'assembling', 'broiling'],
          tools: ['baking dish', 'mixing bowls', 'saucepan', 'whisk', 'measuring cups'],
          preparationSteps: [
            'Break bread into pieces',
            'Heat milk and cream',
            'Layer bread and nuts',
            'Pour hot milk mixture',
            'Top with cream',
            'Bake until golden'
          ],
          ingredients: [
            {
              name: 'puff pastry',
              amount: '500',
              unit: 'g',
              category: 'pastry',
              swaps: ['croissants']
            }
            { name: 'whole milk', amount: '1', unit: 'liter', category: 'dairy' }
            { name: 'heavy cream', amount: '500', unit: 'ml', category: 'dairy' }
            { name: 'mixed nuts', amount: '200', unit: 'g', category: 'nuts' }
            { name: 'sugar', amount: '200', unit: 'g', category: 'sweetener' }
            { name: 'vanilla', amount: '2', unit: 'tsp', category: 'flavoring' }
          ],
          substitutions: {
            'puff pastry': ['croissants', 'bread'],
            'whole milk': ['almond milk', 'oat milk'],
            'heavy cream': ['coconut cream', 'cashew cream']
          },
          servingSize: 8,
          allergens: ['dairy', 'nuts', 'gluten'],
          prepTime: '20 minutes',
          cookTime: '30 minutes',
          culturalNotes: 'A beloved Egyptian dessert with a royal history, named after Umm Alia sultan's wife',
          pairingSuggestions: ['Arabic coffee', 'mint tea'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 480,
            protein: 10,
            carbs: 45,
            fat: 32,
            vitamins: ['A', 'D'],
            minerals: ['Calcium']
          },
          season: ['winter'],
          mealType: ['dessert'],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1
          }
        }

        {
          name: 'Knafeh',
          description: 'Sweet cheese pastry made with shredded phyllo dough and aromatic syrup',
          cuisine: 'Middle Eastern (Levant)',
          cookingMethods: ['baking', 'assembling', 'syrup-making'],
          tools: ['round baking pan', 'food processor', 'saucepan', 'pastry brush', 'spatula'],
          preparationSteps: [
            'Prepare orange blossom syrup',
            'Process kataifi dough',
            'Mix with ghee',
            'Layer with cheese',
            'Bake until golden',
            'Soak with syrup',
            'Garnish with pistachios'
          ],
          ingredients: [
            { name: 'kataifi dough', amount: '500', unit: 'g', category: 'pastry' }
            {
              name: 'akkawi cheese',
              amount: '500',
              unit: 'g',
              category: 'dairy',
              swaps: ['mozzarella']
            }
            { name: 'ghee', amount: '300', unit: 'g', category: 'fat' }
            { name: 'sugar syrup', amount: '500', unit: 'ml', category: 'syrup' }
            { name: 'orange blossom water', amount: '2', unit: 'tbsp', category: 'flavoring' }
            { name: 'pistachios', amount: '100', unit: 'g', category: 'nut' }
          ],
          substitutions: {
            'akkawi cheese': ['mozzarella', 'fresh cheese'],
            ghee: ['clarified butter', 'butter'],
            'orange blossom water': ['rose water', 'vanilla']
          },
          servingSize: 12,
          allergens: ['dairy', 'nuts', 'gluten'],
          prepTime: '40 minutes',
          cookTime: '35 minutes',
          culturalNotes: 'A beloved dessert throughout the Levant, particularly famous in Nablus, Palestine. Often eaten for breakfast',
          pairingSuggestions: ['Arabic coffee', 'black tea'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 420,
            protein: 12,
            carbs: 48,
            fat: 24,
            vitamins: ['A', 'E'],
            minerals: ['Calcium']
          },
          season: ['all'],
          mealType: ['dessert', 'breakfast'],
          elementalProperties: {
            Fire: 0.3,
            Earth: 0.3,
            Water: 0.2,
            Air: 0.2
          }
        }

        {
          name: 'Kofta Kebab',
          description: 'Grilled spiced ground meat skewers with herbs and onions',
          cuisine: 'Middle Eastern',
          cookingMethods: ['grinding', 'skewering', 'grilling'],
          tools: ['food processor', 'metal skewers', 'grill', 'mixing bowls', 'grater'],
          preparationSteps: [
            'Mix ground meat with spices',
            'Grate onions and drain',
            'Combine with herbs',
            'Shape onto skewers',
            'Grill until charred',
            'Serve with accompaniments'
          ],
          ingredients: [
            {
              name: 'ground lamb',
              amount: '1',
              unit: 'kg',
              category: 'protein',
              swaps: ['ground beef']
            }
            { name: 'onion', amount: '2', unit: 'large', category: 'vegetable' }
            { name: 'parsley', amount: '1', unit: 'bunch', category: 'herb' }
            { name: 'seven spices', amount: '2', unit: 'tbsp', category: 'spice blend' }
            { name: 'sumac', amount: '1', unit: 'tbsp', category: 'spice' }
          ],
          substitutions: {
            'ground lamb': ['ground beef', 'ground chicken'],
            'seven spices': ['baharat', 'kebab spice mix'],
            sumac: ['lemon zest']
          },
          servingSize: 6,
          allergens: ['none'],
          prepTime: '30 minutes',
          cookTime: '15 minutes',
          culturalNotes: 'A classic street food and home-cooked dish throughout the Middle East. The art of kofta-making is passed down through generations',
          pairingSuggestions: ['flatbread', 'hummus', 'grilled vegetables', 'rice'],
          dietaryInfo: ['halal'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 380,
            protein: 32,
            carbs: 8,
            fat: 26,
            vitamins: ['B12', 'B6'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.5,
            Earth: 0.3,
            Air: 0.1,
            Water: 0.1
          }
        }

        {
          name: 'Chicken Makloubeh',
          description: 'Upside-down rice dish with chicken, eggplant, and cauliflower',
          cuisine: 'Middle Eastern (Palestinian)',
          cookingMethods: ['layering', 'frying', 'steaming'],
          tools: ['large pot', 'frying pan', 'serving plate', 'strainer', 'wooden spoon'],
          preparationSteps: [
            'Cook chicken with spices',
            'Fry vegetables',
            'Layer ingredients',
            'Cook rice',
            'Steam together',
            'Flip onto serving plate'
          ],
          ingredients: [
            { name: 'chicken pieces', amount: '1.5', unit: 'kg', category: 'protein' }
            { name: 'rice', amount: '750', unit: 'g', category: 'grain' }
            { name: 'eggplant', amount: '2', unit: 'large', category: 'vegetable' }
            { name: 'cauliflower', amount: '1', unit: 'head', category: 'vegetable' }
            { name: 'pine nuts', amount: '100', unit: 'g', category: 'nut', swaps: ['almonds'] }
          ],
          substitutions: {
            'chicken pieces': ['lamb', 'beef'],
            'pine nuts': ['almonds', 'cashews'],
            'white rice': ['brown rice', 'freekeh']
          },
          servingSize: 8,
          allergens: ['nuts'],
          prepTime: '45 minutes',
          cookTime: '90 minutes',
          culturalNotes: 'A celebratory dish that means 'upside-down' in Arabic. The dramatic unveiling of the dish is part of the dining experience',
          pairingSuggestions: ['yogurt sauce', 'Arabic salad', 'pickled vegetables'],
          dietaryInfo: ['halal'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 520,
            protein: 35,
            carbs: 48,
            fat: 24,
            vitamins: ['A', 'C', 'B12'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
        }
      ]
    }
  },
  traditionalSauces: {
    tahini: {
      name: 'Tahini',
      description: 'Creamy sesame seed paste used as a base for many Middle Eastern sauces',
      base: 'sesame seeds',
      keyIngredients: ['hulled sesame seeds', 'neutral oil', 'salt'],
      culinaryUses: ['sauce base', 'dressing', 'dip', 'condiment', 'dessert ingredient'],
      variants: [
        'Light tahini',
        'Dark tahini',
        'Whole seed tahini',
        'Lebanese-style',
        'Sweet tahini'
      ],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.2,
        Air: 0.2,
        Fire: 0.1
      },
      astrologicalInfluences: ['Venus', 'Moon', 'taurus'],
      seasonality: 'all',
      preparationNotes: 'Traditionally ground with stone mills to preserve flavor and nutrients',
      technicalTips: 'Stir well before using as natural separation occurs. Add water slowly when thinning' },
        hummus: {
      name: 'Hummus',
      description: 'Creamy chickpea dip with tahini, garlic, and lemon',
      base: 'chickpeas and tahini',
      keyIngredients: ['chickpeas', 'tahini', 'garlic', 'lemon juice', 'olive oil'],
      culinaryUses: ['dip', 'spread', 'sandwich filling', 'appetizer', 'mezze component'],
      variants: [
        'Classic',
        'With pine nuts',
        'With roasted peppers',
        'Musabaha (chunky)',
        'Ful-hummus (with fava beans)'
      ],
      elementalProperties: {
        Earth: 0.4,
        Water: 0.3,
        Air: 0.2,
        Fire: 0.1
      },
      astrologicalInfluences: ['Jupiter', 'Mercury', 'virgo'],
      seasonality: 'all',
      preparationNotes: 'Each region claims to make the most authentic version. Texture can range from rustic to silky smooth',
      technicalTips: 'Cook chickpeas with baking soda to help break down skins for smoother texture' },
        zaatar: {
      name: 'Za'atar Oil',
      description: 'Herb and sesame blend mixed with olive oil for dipping and spreading',
      base: 'dried herbs and sesame',
      keyIngredients: [
        'thyme',
        'oregano',
        'marjoram',
        'sumac',
        'sesame seeds',
        'olive oil',
        'salt'
      ],
      culinaryUses: ['bread dipping', 'marinade', 'topping', 'seasoning', 'flavor enhancer'],
      variants: ['Lebanese', 'Palestinian', 'Jordanian', 'Syrian', 'Israeli'],
      elementalProperties: {
        Air: 0.4,
        Earth: 0.3,
        Fire: 0.2,
        Water: 0.1
      },
      astrologicalInfluences: ['Mercury', 'Venus', 'gemini'],
      seasonality: 'all, with fresh variations in spring',
      preparationNotes: 'Family recipes are closely guarded secrets, with regional variations in proportions',
      technicalTips: 'Mix with high-quality olive oil just before serving to preserve aromatics' },
        harissa: {
      name: 'Harissa',
      description: 'Hot chile paste with garlic, spices, and olive oil',
      base: 'dried chiles',
      keyIngredients: ['dried chiles', 'garlic', 'coriander', 'cumin', 'caraway', 'olive oil'],
      culinaryUses: ['condiment', 'marinade', 'flavor base', 'sauce enhancer', 'stew ingredient'],
      variants: ['Rose harissa', 'Mild harissa', 'Tunisian', 'Moroccan', 'Algerian'],
      elementalProperties: {
        Fire: 0.6,
        Earth: 0.2,
        Air: 0.1,
        Water: 0.1
      },
      astrologicalInfluences: ['Mars', 'Sun', 'aries'],
      seasonality: 'all',
      preparationNotes: 'Traditional preservation technique for chiles in North African cuisine',
      technicalTips: 'A little goes a long way. Store with a layer of olive oil on top to preserve freshness' },
        toum: {
      name: 'Toum',
      description: 'Intense garlic sauce with an airy, creamy texture',
      base: 'garlic and oil',
      keyIngredients: ['garlic', 'neutral oil', 'lemon juice', 'salt'],
      culinaryUses: ['grilled meat accompaniment', 'sandwich spread', 'dip', 'marinade base'],
      variants: [
        'Lebanese',
        'Syrian',
        'Traditional (egg-free)',
        'Modern (with egg white)',
        'Mint-infused'
      ],
      elementalProperties: {
        Air: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Earth: 0.1
      },
      astrologicalInfluences: ['Mercury', 'Mars', 'gemini'],
      seasonality: 'all',
      preparationNotes: 'Traditionally made by hand pounding in a mortar and pestle until emulsified',
      technicalTips: 'Slow oil incorporation is essential for proper emulsification and fluffy texture'
    }
  },
  sauceRecommender: {
    forProtein: {
      lamb: [
        'yogurt-mint sauce',
        'pomegranate molasses',
        'tahini sauce',
        'harissa',
        'baharat marinade'
      ],
      chicken: ['toum', 'sumac-onion sauce', 'tarator', 'amba', 'preserved lemon dressing'],
      beef: ['tahini sauce', 'Turkish pepper paste', 'harissa', 'chermoula', 'cumin-chili oil'],
      seafood: ['chermoula', 'tahini-lemon', 'harissa-yogurt', 'saffron-citrus', 'sesame-herb oil'],
      vegetarian: [
        'tahini sauce',
        'pomegranate molasses',
        'garlic-yogurt',
        'zhug',
        'spiced tomato'
      ]
    },
    forVegetable: {
      root: [
        'tahini sauce',
        'beet-tahini',
        'ras el hanout oil',
        'harissa',
        'preserved lemon dressing'
      ],
      leafy: [
        'sumac-onion dressing',
        'pomegranate vinaigrette',
        'lemon-garlic',
        'za'atar oil',
        'tahini-yogurt'
      ],
      eggplant: [
        'pomegranate molasses',
        'tahini sauce',
        'garlic-yogurt',
        'tomato charmoula',
        'mint oil'
      ],
      legume: [
        'tahini sauce',
        'cumin-garlic oil',
        'lemon-parsley',
        'olive-herb dressing',
        'harissa oil'
      ],
      grain: [
        'saffron butter',
        'olive-herb oil',
        'pomegranate reduction',
        'tahini',
        'preserved lemon'
      ]
    },
    forCookingMethod: {
      grilling: ['toum', 'harissa', 'chermoula', 'sumac-onion', 'zhug'],
      baking: [
        'za'atar oil',
        'sesame paste',
        'pomegranate glaze',
        'rose water syrup',
        'orange blossom honey'
      ],
      stewing: ['baharat sauce', 'ras el hanout', 'saffron-tomato', 'preserved lemon', 'tamarind'],
      frying: ['tahini sauce', 'garlic-yogurt', 'lemon-herb', 'tomato ezme', 'tahini-yogurt'],
      raw: [
        'olive oil-lemon',
        'herb-garlic',
        'sumac dressing',
        'pomegranate vinaigrette',
        'tahini-citrus'
      ]
    },
    byAstrological: {
      fire: ['harissa', 'zhug', 'chermoula', 'hot pepper paste', 'garlic-chili oil'],
      earth: ['tahini', 'hummus', 'baba ganoush', 'walnut-pomegranate', 'chickpea-olive'],
      water: ['yogurt sauces', 'tarator', 'cucumber-mint', 'lemon-herb', 'rosewater-honey'],
      air: ['za'atar oil', 'herb-infused oils', 'citrus dressings', 'sumac-onion', 'mint-lemon']
    },
    byRegion: {
      levant: ['tahini sauce', 'toum', 'za'atar oil', 'yogurt-cucumber', 'pomegranate molasses'],
      northAfrica: [
        'harissa',
        'chermoula',
        'preserved lemon paste',
        'ras el hanout oil',
        'caraway seed sauce'
      ],
      persian: [
        'walnut-pomegranate',
        'saffron-lime',
        'herb-yogurt',
        'barberry sauce',
        'dried lime dressing'
      ],
      arabian: [
        'date syrup',
        'tamarind sauce',
        'cardamom-rosewater',
        'baharat oil',
        'saffron-honey'
      ],
      turkish: ['red pepper paste', 'yogurt-garlic', 'isot butter', 'pomegranate', 'sumac-onion']
    },
    byDietary: {
      vegetarian: [
        'tahini sauce',
        'yogurt-based sauces',
        'herb oils',
        'pomegranate molasses',
        'za'atar oil'
      ],
      vegan: ['tahini sauce', 'harissa', 'chermoula', 'herb oils', 'pomegranate molasses'],
      glutenFree: ['tahini sauce', 'harissa', 'chermoula', 'yogurt-based sauces', 'herb oils'],
      dairyFree: ['tahini sauce', 'pomegranate molasses', 'herb oils', 'chermoula', 'zhug']
    }
  },
  cookingTechniques: [
    {
      name: 'Mezze Preparation',
      description: 'Art of creating balanced small dishes that complement each other in flavor, texture, and temperature',
      elementalProperties: { Earth: 0.3, Water: 0.3, Fire: 0.2, Air: 0.2 }
      toolsRequired: ['various serving dishes', 'mortar and pestle', 'fine grater', 'sharp knife'],
      bestFor: ['entertaining', 'appetizers', 'communal dining', 'showcasing seasonal produce'],
      difficulty: 'medium'
    }
    {
      name: 'Tagine Cooking',
      description: 'Slow cooking in a conical earthenware pot that traps steam to create tender, aromatic dishes',
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 }
      toolsRequired: ['tagine pot', 'diffuser', 'long wooden spoon', 'steady heat source'],
      bestFor: [
        'tough cuts of meat',
        'whole vegetables',
        'fruit-meat combinations',
        'aromatic dishes'
      ],
      difficulty: 'medium'
    }
    {
      name: 'Bread Baking',
      description: 'Traditional flatbread preparation using high heat and minimal leavening',
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 }
      toolsRequired: [
        'tanoor/taboon oven',
        'baking stone',
        'cushion for shaping',
        'long wooden peel'
      ],
      bestFor: ['pita', 'lavash', 'taboon bread', 'saj bread', 'communion bread'],
      difficulty: 'hard'
    }
    {
      name: 'Charcoal Grilling',
      description: 'Open-fire cooking over aromatic woods to impart smoky flavor to proteins and vegetables',
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 }
      toolsRequired: ['mangal grill', 'metal skewers', 'long tongs', 'brushes for basting'],
      bestFor: ['kebabs', 'kofta', 'whole fish', 'vegetables', 'bread'],
      difficulty: 'medium'
    }
    {
      name: 'Preserving',
      description: 'Ancient techniques for extending shelf life through fermentation, pickling, and drying',
      elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 }
      toolsRequired: ['clay pots', 'glass jars', 'cheesecloth', 'sun-drying racks', 'weights'],
      bestFor: ['vegetables', 'fruits', 'herbs', 'dairy products', 'fish'],
      difficulty: 'hard'
    }
  ],
  regionalCuisines: {
    levantine: {
      name: 'Levantine Cuisine',
      description: 'Cuisine of the Eastern Mediterranean coast, featuring olive oil, herbs, and za'atar',
      signature: ['mezze', 'kibbeh', 'tabbouleh', 'manakish', 'knafeh'],
      elementalProperties: { Earth: 0.4, Water: 0.2, Air: 0.2, Fire: 0.2 }
      astrologicalInfluences: ['Venus', 'Mercury', 'gemini'],
      seasonality: 'heavily influenced by seasonal produce' },
        persian: {
      name: 'Persian Cuisine',
      description: 'Ancient Iranian culinary tradition with complex rice dishes and delicate use of herbs and fruits',
      signature: ['tahdig', 'fesenjan', 'jeweled rice', 'koresh', 'barbari bread'],
      elementalProperties: { Earth: 0.3, Air: 0.3, Fire: 0.2, Water: 0.2 }
      astrologicalInfluences: ['Venus', 'Sun', 'Libra'],
      seasonality: 'aligned with ancient festivals and seasonal transitions' },
        northAfrican: {
      name: 'North African Cuisine',
      description: 'Bold, spicy flavors with influences from Berber, Arab, Mediterranean, and Sub-Saharan traditions',
      signature: ['couscous', 'tagine', 'harissa', 'merguez', 'pastilla'],
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 }
      astrologicalInfluences: ['Mars', 'Sun', 'aries'],
      seasonality: 'desert-influenced seasonal patterns' },
        arabian: {
      name: 'Arabian Peninsula Cuisine',
      description: 'Desert-adapted cuisine with dates, rice, camel products, and distinctive spice blends',
      signature: ['kabsa', 'harees', 'mandi', 'margoog', 'dates with camel milk'],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 }
      astrologicalInfluences: ['Saturn', 'Moon', 'capricorn'],
      seasonality: 'oasis agriculture with date harvest emphasis' },
        turkish: {
      name: 'Turkish-Influenced Cuisine',
      description: 'Ottoman culinary legacy with layered flavors, yogurt, and regional variations',
      signature: ['lahmacun', 'pide', 'gözleme', 'imam bayildi', 'künefe'],
      elementalProperties: { Water: 0.3, Earth: 0.3, Fire: 0.2, Air: 0.2 }
      astrologicalInfluences: ['Jupiter', 'Venus', 'taurus'],
      seasonality: 'four distinct seasons with special holiday dishes'
    }
  },
  elementalProperties: {
    Fire: 0.2,
    Water: 0.3,
    Earth: 0.3,
    Air: 0.2
  }
}

export default middleEastern,
