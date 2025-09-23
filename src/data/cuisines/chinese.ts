// src/data/cuisines/chinese.ts
export const chinese = {
  name: 'Chinese',
  description: 'Traditional Chinese cuisine with balanced flavors, varied techniques, and regional specialties. Known for harmony in taste, color, and nutrition.',
  traditionalSauces: {
    soy: {
      name: 'Soy Sauce',
      description: 'Fermented soybean sauce that forms the foundation of Chinese cooking',
      base: 'fermented soybeans',
      keyIngredients: ['soybeans', 'wheat', 'salt', 'fermenting agents'],
      culinaryUses: ['marinades', 'dipping sauce', 'flavor base', 'coloring agent'],
      variants: ['Light soy', 'Dark soy', 'Sweet soy', 'Double black'],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.3,
        Fire: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ['Saturn', 'Neptune', 'capricorn'],
      seasonality: 'all',
      preparationNotes: 'Traditionally fermented for months or years to develop complexity',
      technicalTips: 'Use light soy for flavor, dark soy for color and deeper notes' },
        hoisin: {
      name: 'Hoisin Sauce',
      description: 'Sweet and savory sauce with a thick consistency',
      base: 'fermented soybeans',
      keyIngredients: ['fermented soybean paste', 'garlic', 'chili', 'sugar', 'spices'],
      culinaryUses: ['glazing', 'dipping', 'stir-fry sauce', 'marinade'],
      variants: ['Cantonese style', 'Northern style', 'Spicy hoisin'],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ['Venus', 'Jupiter', 'taurus'],
      seasonality: 'all',
      preparationNotes: 'Balance of sweet and savory can vary by region and brand',
      technicalTips: 'Thin with water or rice wine for a lighter glaze' },
        xo: {
      name: 'XO Sauce',
      description: 'Luxury seafood sauce with deep umami flavors',
      base: 'dried seafood',
      keyIngredients: [
        'dried scallops',
        'dried shrimp',
        'Jinhua ham',
        'chili',
        'garlic',
        'shallots'
      ],
      culinaryUses: ['flavor enhancer', 'stir-fries', 'noodle dishes', 'premium condiment'],
      variants: ['Traditional Hong Kong style', 'Spicy XO', 'Vegetarian XO'],
      elementalProperties: {
        Water: 0.4,
        Fire: 0.3,
        Earth: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ['Neptune', 'Mars', 'scorpio'],
      seasonality: 'all',
      preparationNotes: 'Traditionally requires expensive ingredients and significant preparation time',
      technicalTips: 'A little goes a long way - use sparingly to add depth' },
        black_bean: {
      name: 'Black Bean Sauce',
      description: 'Savory sauce made from fermented black soybeans',
      base: 'fermented black soybeans',
      keyIngredients: ['fermented black soybeans', 'garlic', 'soy sauce', 'rice wine'],
      culinaryUses: ['stir-fries', 'steamed dishes', 'marinades', 'flavor base'],
      variants: ['Garlic black bean', 'Chili black bean', 'Douchi (whole beans)'],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.2,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ['Pluto', 'Saturn', 'capricorn'],
      seasonality: 'all',
      preparationNotes: 'Beans are typically rinsed before use to moderate saltiness',
      technicalTips: 'Mash beans slightly to release more flavor when cooking' },
        oyster: {
      name: 'Oyster Sauce',
      description: 'Rich, savory sauce with sweet undertones made from oyster extracts',
      base: 'oyster extract',
      keyIngredients: ['oyster extract', 'sugar', 'salt', 'cornstarch', 'soy sauce'],
      culinaryUses: ['stir-fries', 'marinades', 'dipping sauce', 'flavor enhancer'],
      variants: ['Premium', 'Vegetarian (mushroom-based)'],
      elementalProperties: {
        Water: 0.6,
        Earth: 0.2,
        Fire: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ['Neptune', 'Moon', 'pisces'],
      seasonality: 'all',
      preparationNotes: 'Modern versions are thickened with cornstarch',
      technicalTips: 'Add at the end of cooking to preserve flavor complexity',
    }
  },
  sauceRecommender: {
    forProtein: {
      chicken: ['oyster sauce', 'black bean sauce', 'hoisin sauce'],
      beef: ['black bean sauce', 'oyster sauce', 'soy sauce'],
      pork: ['sweet and sour sauce', 'hoisin sauce', 'black bean sauce'],
      fish: ['ginger-scallion sauce', 'sweet soy glaze', 'Sichuan garlic sauce'],
      tofu: ['mapo sauce', 'brown bean sauce', 'garlic sauce']
    },
    forVegetable: {
      leafy: ['garlic sauce', 'oyster sauce', 'light soy sauce'],
      root: ['brown bean sauce', 'XO sauce', 'sweet and sour sauce'],
      mushrooms: ['oyster sauce', 'ginger sauce', 'light soy sauce'],
      eggplant: ['garlic sauce', 'yuxiang sauce', 'sweet bean sauce'],
      beans: ['sichuan pepper oil', 'black bean sauce', 'chili garlic sauce']
    },
    forCookingMethod: {
      stir_fry: ['light soy sauce', 'oyster sauce', 'hoisin sauce'],
      steaming: ['ginger-scallion oil', 'black bean sauce', 'light soy sauce'],
      braising: ['master stock', 'dark soy sauce', 'red cooking sauce'],
      roasting: ['maltose glaze', 'five-spice marinade', 'hoisin sauce'],
      boiling: ['dipping sauce', 'chili oil', 'sesame sauce']
    },
    byAstrological: {
      fire: ['chili oil', 'spicy bean paste', 'XO sauce'],
      earth: ['dark soy sauce', 'black bean sauce', 'hoisin sauce'],
      air: ['white pepper sauce', 'light vinegar dressing', 'clear broths'],
      water: ['oyster sauce', 'ginger sauce', 'delicate seafood-based sauces']
    },
    byRegion: {
      cantonese: ['oyster sauce', 'hoisin sauce', 'sweet soy sauce'],
      sichuan: ['chili oil', 'doubanjiang', 'fish-fragrant sauce'],
      hunan: ['black bean chili sauce', 'sour-hot sauce', 'salted chili sauce'],
      shanghainese: ['sweet soy sauce', 'rice wine sauce', 'red cooking sauce'],
      northern: ['bean paste', 'garlic sauce', 'sesame paste']
    },
    byDietary: {
      vegetarian: ['mushroom sauce', 'sweet bean sauce', 'light soy sauce'],
      vegan: ['garlic sauce', 'rice vinegar dressing', 'sweet and sour sauce'],
      glutenFree: ['tamari', 'rice wine sauce', 'ginger scallion sauce'],
      dairyFree: ['light soy sauce', 'black bean sauce', 'garlic sauce']
    }
  },
  dishes: {
    breakfast: {
      all: [
        {
          name: 'Congee (Rice Porridge)',
          description: 'Comforting rice porridge, slow-cooked to a silky consistency and served with various toppings',
          cuisine: 'chinese',
          cookingMethods: ['simmering', 'slow-cooking'],
          ingredients: [
            { name: 'rice', amount: '1', unit: 'cup', category: 'grain' },
            { name: 'Water', amount: '10', unit: 'cups', category: 'liquid' }
            { name: 'ginger', amount: '3', unit: 'slices', category: 'aromatic' },
            {
              name: 'scallions',
              amount: '2',
              unit: 'stalks',
              category: 'vegetable',
              swaps: ['chives']
            }
            {
              name: 'century egg',
              amount: '1',
              unit: 'piece',
              category: 'protein',
              optional: true,
              swaps: ['salted duck egg']
            }
          ],
          substitutions: {
            'century egg': ['salted duck egg', 'fresh egg'],
            'jasmine rice': ['short-grain rice', 'broken rice']
          },
          servingSize: 4,
          allergens: ['egg (optional)'],
          prepTime: '5 minutes',
          cookTime: '90 minutes',
          nutrition: {
            calories: 220,
            protein: 6,
            carbs: 45,
            fat: 2,
          },
          timeToMake: '95 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Water: 0.6,
            Earth: 0.2,
            Air: 0.1,
            Fire: 0.1,
          },
          astrologicalInfluences: [
            'Moon - The nurturing, comforting quality',
            'cancer - The connection to home and tradition'
          ]
        }
        {
          name: 'Youtiao (Chinese Fried Dough)',
          description: 'Light and crispy deep-fried dough strips, perfect for dipping in congee or soy milk',
          cuisine: 'chinese',
          cookingMethods: ['deep-frying', 'dough preparation'],
          ingredients: [
            { name: 'all-purpose flour', amount: '2', unit: 'cups', category: 'grain' },
            { name: 'baking powder', amount: '1', unit: 'tsp', category: 'leavening' }
            { name: 'baking soda', amount: '1/2', unit: 'tsp', category: 'leavening' },
            { name: 'salt', amount: '1/2', unit: 'tsp', category: 'seasoning' }
            {
              name: 'vegetable oil',
              amount: '3',
              unit: 'cups',
              category: 'oil',
              swaps: ['peanut oil']
            }
          ],
          substitutions: {
            'all-purpose flour': ['cake flour mixture'],
            'vegetable oil': ['peanut oil', 'canola oil']
          },
          servingSize: 4,
          allergens: ['gluten'],
          prepTime: '15 minutes plus resting',
          cookTime: '15 minutes',
          nutrition: {
            calories: 320,
            protein: 7,
            carbs: 42,
            fat: 14,
          },
          timeToMake: '30 minutes plus resting',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.5,
            Air: 0.3,
            Earth: 0.1,
            Water: 0.1,
          },
          astrologicalInfluences: [
            'Jupiter - The expansive, rising quality',
            'leo - The golden, crisp exterior'
          ]
        }
        {
          name: 'Soy Milk Soup with Fried Dough',
          description: 'Fresh, warm soy milk served with crispy fried dough and optional sweet or savory toppings',
          cuisine: 'chinese',
          cookingMethods: ['blending', 'straining', 'simmering'],
          ingredients: [
            { name: 'soybeans', amount: '1', unit: 'cup', category: 'legume' },
            { name: 'Water', amount: '8', unit: 'cups', category: 'liquid' }
            { name: 'sugar', amount: '2', unit: 'tbsp', category: 'sweetener', optional: true },
            { name: 'salt', amount: '1/2', unit: 'tsp', category: 'seasoning', optional: true }
            {
              name: 'youtiao',
              amount: '2',
              unit: 'pieces',
              category: 'bread',
              swaps: ['fried breadsticks']
            }
          ],
          substitutions: {
            'homemade soy milk': ['unsweetened store-bought soy milk'],
            youtiao: ['plain fried breadsticks']
          },
          servingSize: 4,
          allergens: ['soy', 'gluten'],
          prepTime: '15 minutes plus soaking',
          cookTime: '30 minutes',
          nutrition: {
            calories: 240,
            protein: 14,
            carbs: 32,
            fat: 8,
          },
          timeToMake: '45 minutes plus soaking',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Water: 0.5,
            Earth: 0.3,
            Air: 0.1,
            Fire: 0.1,
          },
          astrologicalInfluences: [
            'Moon - The nurturing, comforting quality',
            'taurus - The satisfying, grounding nature'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    lunch: {
      all: [
        {
          name: 'Dan Dan Noodles',
          description: 'Spicy Sichuan noodles with ground pork, preserved vegetables, and numbing chili oil',
          cuisine: 'chinese',
          cookingMethods: ['stir-frying', 'boiling', 'sauce-mixing'],
          ingredients: [
            {
              name: 'wheat noodles',
              amount: '400',
              unit: 'g',
              category: 'noodle',
              swaps: ['rice noodles']
            }
            {
              name: 'ground pork',
              amount: '250',
              unit: 'g',
              category: 'protein',
              swaps: ['ground chicken', 'firm tofu']
            }
            { name: 'Sichuan peppercorns', amount: '2', unit: 'tsp', category: 'spice' },
            { name: 'chili oil', amount: '3', unit: 'tbsp', category: 'oil' }
            {
              name: 'sui mi ya cai',
              amount: '2',
              unit: 'tbsp',
              category: 'vegetable',
              swaps: ['preserved mustard greens']
            }
            {
              name: 'sesame paste',
              amount: '2',
              unit: 'tbsp',
              category: 'sauce',
              swaps: ['tahini']
            }
          ],
          substitutions: {
            'sui mi ya cai': ['preserved mustard greens', 'pickled mustard stems'],
            'Sichuan peppercorns': ['black pepper with lemon zest'],
            'ground pork': ['ground chicken', 'firm tofu']
          },
          servingSize: 4,
          allergens: ['gluten', 'sesame'],
          prepTime: '15 minutes',
          cookTime: '20 minutes',
          nutrition: {
            calories: 520,
            protein: 28,
            carbs: 65,
            fat: 18,
          },
          timeToMake: '35 minutes',
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.6,
            Earth: 0.2,
            Water: 0.1,
            Air: 0.1,
          },
          astrologicalInfluences: [
            'Mars - The intense heat and spice',
            'Scorpio - The complex, transformative flavors'
          ]
        }
        {
          name: 'Mapo Tofu',
          description: 'Spicy Sichuan dish of soft tofu in a fiery sauce with minced meat and Sichuan pepper',
          cuisine: 'chinese',
          cookingMethods: ['stir-frying', 'simmering'],
          ingredients: [
            { name: 'soft tofu', amount: '500', unit: 'g', category: 'protein' },
            {
              name: 'ground pork',
              amount: '150',
              unit: 'g',
              category: 'protein',
              swaps: ['beef', 'mushrooms']
            }
            { name: 'doubanjiang', amount: '2', unit: 'tbsp', category: 'sauce' },
            { name: 'Sichuan peppercorns', amount: '1', unit: 'tbsp', category: 'spice' }
            { name: 'chili oil', amount: '2', unit: 'tbsp', category: 'oil' },
            {
              name: 'fermented black beans',
              amount: '1',
              unit: 'tbsp',
              category: 'sauce',
              optional: true,
            }
          ],
          substitutions: {
            doubanjiang: ['Korean gochujang', 'miso paste with chili'],
            'ground pork': ['ground beef', 'finely chopped mushrooms'],
            'soft tofu': ['medium-firm tofu']
          },
          servingSize: 4,
          allergens: ['soy'],
          prepTime: '15 minutes',
          cookTime: '20 minutes',
          nutrition: {
            calories: 300,
            protein: 22,
            carbs: 8,
            fat: 20,
          },
          timeToMake: '35 minutes',
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.6,
            Water: 0.2,
            Earth: 0.1,
            Air: 0.1,
          },
          astrologicalInfluences: [
            'Mars - The fiery, aggressive flavor profile',
            'Pluto - The transformative, intense experience'
          ]
        }
        {
          name: 'Dim Sum Platter',
          description: 'Assortment of bite-sized portions of steamed and fried Cantonese delicacies',
          cuisine: 'chinese',
          cookingMethods: ['steaming', 'frying', 'wrapping'],
          ingredients: [
            {
              name: 'har gow (shrimp dumplings)',
              amount: '4',
              unit: 'pieces',
              category: 'dumpling',
            }
            { name: 'siu mai (pork dumplings)', amount: '4', unit: 'pieces', category: 'dumpling' },
            { name: 'char siu bao', amount: '2', unit: 'pieces', category: 'bun' }
            {
              name: 'cheong fun (rice noodle rolls)',
              amount: '1',
              unit: 'plate',
              category: 'noodle',
            }
            { name: 'spring rolls', amount: '2', unit: 'pieces', category: 'appetizer' }
          ],
          substitutions: {
            'har gow': ['vegetable dumplings'],
            'siu mai': ['chicken siu mai', 'vegetable dumplings'],
            'char siu bao': ['vegetable buns']
          },
          servingSize: 2,
          allergens: ['shellfish', 'gluten', 'soy'],
          prepTime: 'varies',
          cookTime: 'varies',
          nutrition: {
            calories: 650,
            protein: 32,
            carbs: 85,
            fat: 22,
          },
          timeToMake: 'varies (typically purchased)',
          season: ['all'],
          mealType: ['lunch'],
          elementalProperties: {
            Water: 0.3,
            Earth: 0.3,
            Fire: 0.2,
            Air: 0.2,
          },
          astrologicalInfluences: [
            'Venus - The delicate, artful presentation',
            'Mercury - The variety and choice within one meal'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    dinner: {
      all: [
        {
          name: 'Peking Duck',
          description: 'Famous Beijing dish of roasted duck known for its thin, crispy skin, served with pancakes and condiments',
          cuisine: 'chinese',
          cookingMethods: ['air-drying', 'roasting', 'glazing'],
          ingredients: [
            { name: 'whole duck', amount: '1', unit: '3-4 pound duck', category: 'protein' },
            { name: 'maltose', amount: '2', unit: 'tbsp', category: 'sweetener', swaps: ['honey'] }
            { name: 'five-spice powder', amount: '2', unit: 'tsp', category: 'spice' },
            { name: 'thin pancakes', amount: '20', unit: 'pieces', category: 'bread' }
            { name: 'hoisin sauce', amount: '1/4', unit: 'cup', category: 'sauce' },
            { name: 'scallions', amount: '6', unit: 'stalks', category: 'vegetable' }
            { name: 'cucumber', amount: '1', unit: 'medium', category: 'vegetable' }
          ],
          substitutions: {
            maltose: ['honey', 'corn syrup'],
            'five-spice powder': ['DIY blend of cinnamon, cloves, fennel, star anise, peppercorns'],
            'thin pancakes': ['flour tortillas', 'mandarin pancakes']
          },
          servingSize: 4,
          allergens: ['gluten'],
          prepTime: '24 hours',
          cookTime: '2 hours',
          nutrition: {
            calories: 650,
            protein: 45,
            carbs: 42,
            fat: 35,
          },
          timeToMake: '26 hours',
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.4,
            Air: 0.3,
            Earth: 0.2,
            Water: 0.1,
          },
          astrologicalInfluences: [
            'Sun - The golden, glistening skin',
            'Jupiter - The ceremonial, celebratory nature'
          ]
        }
        {
          name: 'Kung Pao Chicken',
          description: 'Spicy stir-fried dish from Sichuan featuring chicken, peanuts, vegetables, and chilis',
          cuisine: 'chinese',
          cookingMethods: ['stir-frying', 'velveting'],
          ingredients: [
            {
              name: 'chicken thighs',
              amount: '500',
              unit: 'g',
              category: 'protein',
              swaps: ['tofu', 'tempeh']
            }
            { name: 'dried red chilies', amount: '10', unit: 'pieces', category: 'spice' },
            { name: 'Sichuan peppercorns', amount: '1', unit: 'tsp', category: 'spice' }
            { name: 'peanuts', amount: '1/2', unit: 'cup', category: 'nut', swaps: ['cashews'] },
            { name: 'soy sauce', amount: '2', unit: 'tbsp', category: 'sauce' }
            { name: 'rice vinegar', amount: '1', unit: 'tbsp', category: 'acid' },
            { name: 'bell peppers', amount: '1', unit: 'large', category: 'vegetable' }
            { name: 'scallions', amount: '4', unit: 'stalks', category: 'vegetable' }
          ],
          substitutions: {
            'chicken thighs': ['tofu', 'tempeh', 'seitan'],
            peanuts: ['cashews', 'almonds'],
            'Sichuan peppercorns': ['black pepper with lime zest']
          },
          servingSize: 4,
          allergens: ['peanuts', 'soy'],
          prepTime: '20 minutes',
          cookTime: '15 minutes',
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 18,
            fat: 28,
          },
          timeToMake: '35 minutes',
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Fire: 0.5,
            Earth: 0.2,
            Air: 0.2,
            Water: 0.1,
          },
          astrologicalInfluences: [
            'Mars - The fiery, aggressive spice',
            'aries - The bold, direct flavors'
          ]
        }
        {
          name: 'Xiaolongbao (Soup Dumplings)',
          description: 'Steamed dumplings filled with meat and flavorful soup, from Shanghai',
          cuisine: 'chinese',
          cookingMethods: ['steaming', 'dough-making', 'folding'],
          ingredients: [
            {
              name: 'ground pork',
              amount: '300',
              unit: 'g',
              category: 'protein',
              swaps: ['ground chicken']
            }
            { name: 'pork skin gelatin', amount: '200', unit: 'g', category: 'protein' },
            { name: 'dumpling wrappers', amount: '24', unit: 'pieces', category: 'dough' }
            { name: 'ginger', amount: '2', unit: 'tbsp', category: 'aromatic' },
            { name: 'scallions', amount: '3', unit: 'stalks', category: 'vegetable' }
            {
              name: 'Shaoxing wine',
              amount: '1',
              unit: 'tbsp',
              category: 'wine',
              swaps: ['dry sherry']
            }
            { name: 'soy sauce', amount: '2', unit: 'tsp', category: 'sauce' }
          ],
          substitutions: {
            'ground pork': ['ground chicken', 'ground beef'],
            'pork skin gelatin': ['unflavored gelatin with chicken stock'],
            'Shaoxing wine': ['dry sherry', 'mirin']
          },
          servingSize: 6,
          allergens: ['gluten', 'soy'],
          prepTime: '3 hours',
          cookTime: '15 minutes',
          nutrition: {
            calories: 380,
            protein: 22,
            carbs: 40,
            fat: 14,
          },
          timeToMake: '3 hours 15 minutes',
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1,
          },
          astrologicalInfluences: [
            'Neptune - The mysterious, hidden soup within',
            'cancer - The nurturing, comforting quality'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    dessert: {
      all: [
        {
          name: 'Egg Custard Tarts',
          description: 'Flaky pastry shells filled with silky smooth egg custard, popular in Canton and Hong Kong',
          cuisine: 'chinese',
          cookingMethods: ['baking', 'pastry-making'],
          ingredients: [
            { name: 'pastry dough', amount: '1', unit: 'recipe', category: 'dough' },
            { name: 'eggs', amount: '4', unit: 'large', category: 'protein' }
            { name: 'evaporated milk', amount: '1', unit: 'cup', category: 'dairy' },
            { name: 'sugar', amount: '100', unit: 'g', category: 'sweetener' }
            { name: 'vanilla extract', amount: '1', unit: 'tsp', category: 'flavoring' }
          ],
          substitutions: {
            'pastry dough': ['puff pastry', 'shortcrust pastry'],
            'evaporated milk': ['whole milk', 'half-and-half']
          },
          servingSize: 12,
          allergens: ['eggs', 'dairy', 'gluten'],
          prepTime: '45 minutes',
          cookTime: '20 minutes',
          nutrition: {
            calories: 220,
            protein: 5,
            carbs: 28,
            fat: 10,
          },
          timeToMake: '65 minutes',
          season: ['all'],
          mealType: ['dessert'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Water: 0.2,
            Air: 0.1,
          },
          astrologicalInfluences: [
            'Venus - The rich, indulgent quality',
            'taurus - The sensual, grounded experience'
          ]
        }
        {
          name: 'Eight Treasure Rice Pudding',
          description: 'Glutinous rice dessert filled with sweet red bean paste and topped with dried fruits and nuts',
          cuisine: 'chinese',
          cookingMethods: ['steaming', 'layering'],
          ingredients: [
            { name: 'glutinous rice', amount: '2', unit: 'cups', category: 'grain' },
            { name: 'red bean paste', amount: '1', unit: 'cup', category: 'filling' }
            {
              name: 'dried fruits',
              amount: '1',
              unit: 'cup',
              category: 'fruit',
              notes: 'various types',
            }
            { name: 'nuts', amount: '1/2', unit: 'cup', category: 'nut', notes: 'various types' },
            { name: 'sugar', amount: '1/4', unit: 'cup', category: 'sweetener' }
            {
              name: 'lard',
              amount: '2',
              unit: 'tbsp',
              category: 'fat',
              swaps: ['vegetable shortening']
            }
          ],
          substitutions: {
            lard: ['vegetable shortening', 'coconut oil'],
            'red bean paste': ['lotus seed paste', 'date paste'],
            'glutinous rice': ['sushi rice']
          },
          servingSize: 8,
          allergens: ['tree nuts'],
          prepTime: '30 minutes',
          cookTime: '1 hour',
          nutrition: {
            calories: 380,
            protein: 6,
            carbs: 75,
            fat: 8,
          },
          timeToMake: '1 hour 30 minutes',
          season: ['winter', 'lunar new year'],
          mealType: ['dessert'],
          elementalProperties: {
            Earth: 0.5,
            Water: 0.3,
            Fire: 0.1,
            Air: 0.1,
          },
          astrologicalInfluences: [
            'Jupiter - The abundance and prosperity symbolism',
            'Venus - The sweet, luxurious nature'
          ]
        }
        {
          name: 'Mango Pomelo Sago',
          description: 'Refreshing Hong Kong dessert with fresh mangoes, pomelo segments, and tapioca pearls in sweetened coconut milk',
          cuisine: 'chinese',
          cookingMethods: ['chilling', 'boiling'],
          ingredients: [
            { name: 'ripe mangoes', amount: '2', unit: 'large', category: 'fruit' },
            {
              name: 'pomelo',
              amount: '1/2',
              unit: 'medium',
              category: 'fruit',
              swaps: ['grapefruit']
            }
            {
              name: 'sago pearls',
              amount: '1/4',
              unit: 'cup',
              category: 'grain',
              swaps: ['tapioca pearls']
            }
            { name: 'coconut milk', amount: '1', unit: 'cup', category: 'liquid' },
            { name: 'sugar', amount: '3', unit: 'tbsp', category: 'sweetener' }
            {
              name: 'condensed milk',
              amount: '2',
              unit: 'tbsp',
              category: 'dairy',
              optional: true,
            }
          ],
          substitutions: {
            pomelo: ['grapefruit', 'orange'],
            'sago pearls': ['tapioca pearls', 'chia seeds'],
            'coconut milk': ['half-and-half', 'almond milk']
          },
          servingSize: 4,
          allergens: ['dairy (if using condensed milk)'],
          prepTime: '20 minutes',
          cookTime: '20 minutes',
          nutrition: {
            calories: 280,
            protein: 3,
            carbs: 45,
            fat: 12,
          },
          timeToMake: '40 minutes plus chilling',
          season: ['summer'],
          mealType: ['dessert'],
          elementalProperties: {
            Water: 0.6,
            Air: 0.2,
            Earth: 0.1,
            Fire: 0.1,
          },
          astrologicalInfluences: [
            'Moon - The cooling, refreshing quality',
            'Venus - The sweet, tropical indulgence'
          ]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    }
  },
  cookingTechniques: [
    {
      name: 'Stir-Frying',
      description: 'Quick cooking in a wok over high heat with constant motion',
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: ['wok', 'wok spatula', 'high BTU burner'],
      bestFor: ['vegetables', 'thinly sliced meats', 'noodles', 'rice']
    }
    {
      name: 'Steaming',
      description: 'Gentle cooking with steam that preserves nutrients and delicate flavors',
      elementalProperties: { Water: 0.7, Air: 0.2, Earth: 0.1, Fire: 0.0 },
      toolsRequired: ['bamboo steamer', 'wok or pot', 'parchment paper'],
      bestFor: ['seafood', 'vegetables', 'dumplings', 'delicate proteins']
    }
    {
      name: 'Red Cooking',
      description: 'Slow braising in a soy sauce-based liquid with spices and aromatics',
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: ['clay pot', 'heavy-bottomed pot', 'ladle'],
      bestFor: ['tough cuts of meat', 'tofu', 'eggs', 'vegetables']
    }
    {
      name: 'Dry-Frying',
      description: 'Frying without batter in minimal oil until ingredients become dry and crispy',
      elementalProperties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0.0 },
      toolsRequired: ['wok', 'fine mesh strainer', 'slotted spoon'],
      bestFor: ['green beans', 'beef', 'tofu', 'mushrooms']
    }
    {
      name: 'Velveting',
      description: 'Marinating protein in egg white and cornstarch, then blanching before cooking',
      elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
      toolsRequired: ['bowl', 'strainer', 'pot', 'thermometer'],
      bestFor: ['chicken', 'beef', 'seafood', 'pork']
    }
  ],
  regionalCuisines: {
    cantonese: {
      name: 'Cantonese Cuisine',
      description: 'Light, fresh flavors that highlight natural tastes of ingredients, with an emphasis on steaming and stir-frying',
      signature: ['dim sum', 'steamed fish', 'char siu', 'wonton noodles'],
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ['Venus', 'Moon', 'Libra'],
      seasonality: 'all' },
        sichuan: {
      name: 'Sichuan Cuisine',
      description: 'Bold, spicy flavors featuring Sichuan peppercorns' numbing sensation (málà) and complex layering of flavors',
      signature: ['mapo tofu', 'kung pao chicken', 'dan dan noodles', 'hot pot'],
      elementalProperties: { Fire: 0.7, Earth: 0.2, Water: 0.1, Air: 0.0 },
      astrologicalInfluences: ['Mars', 'Pluto', 'Scorpio'],
      seasonality: 'all' },
        shandong: {
      name: 'Shandong Cuisine',
      description: 'One of China's oldest cuisines, featuring fresh seafood, quick frying, and clear soups',
      signature: ['braised sea cucumber', 'sweet and sour carp', 'Dezhou chicken'],
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Jupiter', 'Saturn', 'Capricorn'],
      seasonality: 'all' },
        jiangsu: {
      name: 'Jiangsu Cuisine',
      description: 'Refined, artistically presented cuisine emphasizing seasonal ingredients and precise cutting techniques',
      signature: ['Nanjing salted duck', 'sweet and sour mandarin fish', 'beggar's chicken'],
      elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
      astrologicalInfluences: ['Mercury', 'Venus', 'Gemini'],
      seasonality: 'all',
    }
  },
  elementalProperties: {
    Earth: 0.3,
    Fire: 0.3,
    Water: 0.3,
    Air: 0.1,
  }
}

export default chinese,
