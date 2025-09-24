// src/data/cuisines/indian.ts
import type { Cuisine } from '@/types/cuisine';

export const indian: Cuisine = {
  id: 'indian',
  name: 'Indian',
  description:
    'Traditional Indian cuisine spanning diverse regional specialties, spice blends, and cooking techniques',
  dishes: {
    breakfast: {
      all: [
        {
          name: 'Masala Dosa',
          description: 'Crispy fermented rice crepe with spiced potato filling',
          cuisine: 'Indian (South)',
          cookingMethods: ['fermenting', 'griddle-cooking', 'filling'],
          tools: ['dosa griddle', 'spatula', 'mixing bowls', 'ladle'],
          preparationSteps: [
            'Heat griddle to medium-high',
            'Ladle and spread dosa batter',
            'Add oil to edges',
            'Place potato filling',
            'Fold and serve with accompaniments'
          ],
          ingredients: [
            {
              name: 'dosa batter',
              amount: '200',
              unit: 'ml',
              category: 'grain',
              swaps: ['quinoa dosa batter']
            },
            { name: 'potato masala', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'sambar', amount: '200', unit: 'ml', category: 'soup' },
            { name: 'coconut chutney', amount: '50', unit: 'g', category: 'condiment' },
            { name: 'ghee', amount: '1', unit: 'tbsp', category: 'fat', swaps: ['oil'] }
          ],
          substitutions: {
            'dosa batter': ['quinoa dosa batter', 'mung bean dosa batter'],
            ghee: ['oil', 'vegan butter'],
            'potato filling': ['cauliflower filling', 'mixed vegetable filling']
          },
          servingSize: 2,
          allergens: ['none'],
          prepTime: '15 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A South Indian breakfast staple, traditionally served with filter coffee. The art of dosa-making is passed down through generations',
          pairingSuggestions: ['filter coffee', 'coconut chutney', 'sambar', 'mint chutney'],
          dietaryInfo: ['vegetarian', 'gluten-free'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 450,
            protein: 12,
            carbs: 85,
            fat: 8,
            vitamins: ['B12', 'C', 'D'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['all'],
          mealType: ['breakfast', 'lunch'],
          elementalProperties: {
            Earth: 0.3,
            Fire: 0.4,
            Air: 0.2,
            Water: 0.1
          }
        },
        {
          name: 'Aloo Paratha',
          description: 'Whole wheat flatbread stuffed with spiced potatoes',
          cuisine: 'Indian (North)',
          cookingMethods: ['kneading', 'stuffing', 'griddle-cooking'],
          tools: ['rolling pin', 'griddle', 'mixing bowls', 'spatula', 'potato masher'],
          preparationSteps: [
            'Prepare potato filling',
            'Make wheat dough',
            'Stuff and seal parathas',
            'Cook on griddle with butter',
            'Serve hot with accompaniments'
          ],
          ingredients: [
            {
              name: 'whole wheat flour',
              amount: '200',
              unit: 'g',
              category: 'grain',
              swaps: ['gluten-free flour blend']
            },
            { name: 'potatoes', amount: '300', unit: 'g', category: 'vegetable' },
            { name: 'spices', amount: '2', unit: 'tbsp', category: 'spice' },
            {
              name: 'yogurt',
              amount: '100',
              unit: 'g',
              category: 'dairy',
              swaps: ['plant-based yogurt']
            },
            { name: 'butter', amount: '30', unit: 'g', category: 'fat', swaps: ['oil'] }
          ],
          substitutions: {
            'whole wheat flour': ['gluten-free flour blend', 'millet flour'],
            butter: ['oil', 'ghee', 'vegan butter'],
            yogurt: ['plant-based yogurt', 'mashed pumpkin']
          },
          servingSize: 4,
          allergens: ['gluten', 'dairy'],
          prepTime: '30 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A hearty North Indian breakfast, popular among farmers and laborers. Each region has its own variation of stuffed parathas',
          pairingSuggestions: ['butter', 'pickle', 'yogurt', 'mint chutney'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 380,
            protein: 10,
            carbs: 65,
            fat: 12,
            vitamins: ['B1', 'C'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Earth: 0.5,
            Fire: 0.3,
            Water: 0.1,
            Air: 0.1
          }
        },
        {
          name: 'Idli Sambar',
          description: 'Steamed rice cakes with lentil soup',
          cuisine: 'Indian (South)',
          cookingMethods: ['fermenting', 'steaming', 'simmering'],
          tools: ['idli steamer', 'mixing bowls', 'pressure cooker', 'ladle', 'wet grinder'],
          preparationSteps: [
            'Ferment idli batter',
            'Prepare sambar',
            'Grease idli molds',
            'Steam idlis',
            'Serve hot with accompaniments'
          ],
          ingredients: [
            { name: 'idli rice', amount: '300', unit: 'g', category: 'grain' },
            { name: 'urad dal', amount: '100', unit: 'g', category: 'legume' },
            { name: 'toor dal', amount: '200', unit: 'g', category: 'legume' },
            { name: 'sambar powder', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'vegetables', amount: '300', unit: 'g', category: 'vegetable' },
            { name: 'coconut chutney', amount: '100', unit: 'g', category: 'condiment' }
          ],
          substitutions: {
            'idli rice': ['parboiled rice'],
            'urad dal': ['quick idli mix'],
            'sambar powder': ['homemade spice blend']
          },
          servingSize: 4,
          allergens: ['none'],
          prepTime: '8 hours',
          cookTime: '30 minutes',
          fermentTime: '8-12 hours',
          culturalNotes:
            'A quintessential South Indian breakfast that perfectly balances protein and carbohydrates. The fermentation process is crucial for the soft, fluffy texture',
          pairingSuggestions: ['coconut chutney', 'sambar', 'filter coffee', 'podi'],
          dietaryInfo: ['vegetarian', 'vegan', 'gluten-free'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 320,
            protein: 12,
            carbs: 58,
            fat: 6,
            vitamins: ['B12', 'C'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
        }
      ],
      summer: [
        {
          name: 'Poha',
          description: 'Flattened rice with peanuts and spices',
          cuisine: 'Indian (Central)',
          cookingMethods: ['stir-frying', 'tempering'],
          tools: ['kadai or wok', 'colander', 'spatula', 'small tempering pan', 'knife'],
          preparationSteps: [
            'Wash and soak poha',
            'Prepare tempering',
            'Sauté vegetables',
            'Add soaked poha',
            'Season and garnish',
            'Serve hot'
          ],
          ingredients: [
            { name: 'flattened rice', amount: '200', unit: 'g', category: 'grain' },
            { name: 'peanuts', amount: '50', unit: 'g', category: 'nuts' },
            { name: 'onions', amount: '100', unit: 'g', category: 'vegetable' },
            { name: 'curry leaves', amount: '10', unit: 'pieces', category: 'herb' },
            { name: 'mustard seeds', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'turmeric', amount: '1/2', unit: 'tsp', category: 'spice' },
            {
              name: 'green chilies',
              amount: '2',
              unit: 'pieces',
              category: 'spice',
              optional: true
            }
          ],
          substitutions: {
            peanuts: ['cashews', 'roasted chana'],
            'curry leaves': ['bay leaves'],
            'flattened rice': ['quinoa flakes']
          },
          servingSize: 2,
          allergens: ['peanuts'],
          prepTime: '10 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A popular breakfast in Maharashtra and Madhya Pradesh, poha is valued for its quick preparation and light yet satisfying nature',
          pairingSuggestions: ['chai', 'jalebi', 'sev', 'lemon wedges'],
          dietaryInfo: ['vegetarian', 'gluten-free'],
          spiceLevel: 'mild to medium',
          nutrition: {
            calories: 340,
            protein: 10,
            carbs: 52,
            fat: 12,
            vitamins: ['B1', 'E'],
            minerals: ['Iron', 'Magnesium']
          },
          season: ['all'],
          mealType: ['breakfast', 'snack'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: 'Dal Tadka',
          description: 'Yellow lentils with spice-infused oil',
          cuisine: 'Indian (North)',
          cookingMethods: ['boiling', 'tempering', 'simmering'],
          tools: ['pressure cooker', 'tempering pan', 'ladle', 'whisk', 'measuring spoons'],
          preparationSteps: [
            'Wash and sort lentils',
            'Pressure cook with turmeric',
            'Prepare tempering',
            'Add tempering to dal',
            'Simmer to combine flavors',
            'Garnish with cilantro'
          ],
          ingredients: [
            { name: 'yellow lentils', amount: '200', unit: 'g', category: 'legume' },
            { name: 'ghee', amount: '2', unit: 'tbsp', category: 'fat', swaps: ['oil'] },
            { name: 'cumin seeds', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'garlic', amount: '6', unit: 'cloves', category: 'vegetable' },
            { name: 'tomatoes', amount: '2', unit: 'medium', category: 'vegetable' },
            { name: 'turmeric', amount: '1/2', unit: 'tsp', category: 'spice' },
            { name: 'asafoetida', amount: '1/4', unit: 'tsp', category: 'spice', optional: true }
          ],
          substitutions: {
            ghee: ['oil', 'vegan butter'],
            asafoetida: ['garlic powder', 'omit'],
            'yellow lentils': ['red lentils', 'split mung dal']
          },
          servingSize: 4,
          allergens: ['none'],
          prepTime: '10 minutes',
          cookTime: '30 minutes',
          culturalNotes:
            'A daily staple in North Indian homes, dal tadka represents the art of tempering in Indian cuisine. The sound of tadka being added to dal is a familiar comfort in Indian kitchens',
          pairingSuggestions: ['steamed rice', 'roti', 'pickles', 'papad'],
          dietaryInfo: ['vegetarian', 'gluten-free'],
          spiceLevel: 'mild to medium',
          nutrition: {
            calories: 280,
            protein: 16,
            carbs: 42,
            fat: 8,
            vitamins: ['B1', 'C'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all'],
          mealType: ['lunch', 'dinner']
        },
        {
          name: 'Gujarati Kadhi',
          description: 'Yogurt-based curry with gram flour',
          cuisine: 'Indian (Gujarat)',
          cookingMethods: ['simmering', 'tempering', 'whisking'],
          tools: ['heavy-bottomed pot', 'whisk', 'tempering pan', 'ladle', 'measuring spoons'],
          preparationSteps: [
            'Whisk yogurt and gram flour',
            'Simmer the mixture',
            'Prepare tempering',
            'Add tempering to kadhi',
            'Simmer until thickened',
            'Garnish with cilantro'
          ],
          ingredients: [
            {
              name: 'yogurt',
              amount: '500',
              unit: 'ml',
              category: 'dairy',
              swaps: ['coconut yogurt']
            },
            { name: 'gram flour', amount: '3', unit: 'tbsp', category: 'flour' },
            { name: 'curry leaves', amount: '10', unit: 'leaves', category: 'herb' },
            { name: 'mustard seeds', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'ginger', amount: '1', unit: 'inch', category: 'spice' },
            {
              name: 'green chilies',
              amount: '2',
              unit: 'pieces',
              category: 'spice',
              optional: true
            },
            { name: 'turmeric', amount: '1/2', unit: 'tsp', category: 'spice' }
          ],
          substitutions: {
            yogurt: ['coconut yogurt', 'cashew yogurt'],
            'curry leaves': ['bay leaves'],
            'gram flour': ['chickpea flour']
          },
          servingSize: 4,
          allergens: ['dairy'],
          prepTime: '15 minutes',
          cookTime: '30 minutes',
          culturalNotes:
            'A cooling dish popular in Gujarati thalis, this kadhi is sweeter and milder than other regional versions. Often served during summer months',
          pairingSuggestions: ['steamed rice', 'khichdi', 'papad', 'thepla'],
          dietaryInfo: ['vegetarian', 'gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 220,
            protein: 12,
            carbs: 28,
            fat: 8,
            vitamins: ['B12', 'D'],
            minerals: ['Calcium', 'Phosphorus']
          },
          season: ['summer'],
          mealType: ['lunch']
        }
      ],
      winter: [
        {
          name: 'Dal Makhani',
          description: 'Creamy black lentils simmered overnight',
          cuisine: 'Indian (Punjab)',
          cookingMethods: ['slow-cooking', 'simmering', 'tempering'],
          tools: ['heavy-bottomed pot', 'pressure cooker', 'ladle', 'whisk', 'tempering pan'],
          preparationSteps: [
            'Soak lentils overnight',
            'Pressure cook lentils',
            'Prepare tomato base',
            'Slow cook with cream',
            'Add tempering',
            'Finish with butter'
          ],
          ingredients: [
            { name: 'black lentils', amount: '300', unit: 'g', category: 'legume' },
            { name: 'kidney beans', amount: '100', unit: 'g', category: 'legume' },
            {
              name: 'cream',
              amount: '200',
              unit: 'ml',
              category: 'dairy',
              swaps: ['cashew cream']
            },
            { name: 'butter', amount: '100', unit: 'g', category: 'fat', swaps: ['plant butter'] },
            { name: 'garam masala', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'tomatoes', amount: '400', unit: 'g', category: 'vegetable' },
            { name: 'ginger-garlic paste', amount: '2', unit: 'tbsp', category: 'paste' }
          ],
          substitutions: {
            cream: ['cashew cream', 'coconut cream'],
            butter: ['vegan butter', 'oil'],
            'black lentils': ['brown lentils']
          },
          servingSize: 6,
          allergens: ['dairy'],
          prepTime: 'overnight + 30 minutes',
          cookTime: '8 hours',
          culturalNotes:
            'Originally from the kitchens of Punjab, this dish gained popularity post-partition. The long, slow cooking process is essential for its signature creamy texture',
          pairingSuggestions: ['naan', 'rice', 'onion rings', 'butter chicken'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'mild to medium',
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 45,
            fat: 22,
            vitamins: ['A', 'K'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['winter'],
          mealType: ['lunch', 'dinner']
        }
      ]
    },
    dinner: {
      all: [
        {
          name: 'Butter Chicken',
          description: 'Tandoor-cooked chicken in rich tomato-cream sauce',
          cuisine: 'Indian (North)',
          cookingMethods: ['marinating', 'tandoor-cooking', 'simmering'],
          tools: ['tandoor or oven', 'heavy-bottomed pot', 'blender', 'strainer', 'tongs'],
          preparationSteps: [
            'Marinate chicken overnight',
            'Cook chicken in tandoor',
            'Prepare tomato-cream sauce',
            'Simmer chicken in sauce',
            'Finish with butter and cream',
            'Garnish with kasuri methi'
          ],
          ingredients: [
            {
              name: 'chicken',
              amount: '800',
              unit: 'g',
              category: 'protein',
              swaps: ['cauliflower', 'seitan']
            },
            { name: 'tomatoes', amount: '500', unit: 'g', category: 'vegetable' },
            {
              name: 'cream',
              amount: '200',
              unit: 'ml',
              category: 'dairy',
              swaps: ['cashew cream']
            },
            { name: 'butter', amount: '100', unit: 'g', category: 'fat', swaps: ['ghee'] },
            { name: 'garam masala', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'kasuri methi', amount: '1', unit: 'tbsp', category: 'herb' },
            { name: 'honey', amount: '1', unit: 'tbsp', category: 'sweetener', optional: true }
          ],
          substitutions: {
            chicken: ['cauliflower', 'seitan', 'paneer'],
            cream: ['cashew cream', 'coconut cream'],
            butter: ['vegan butter', 'oil']
          },
          servingSize: 4,
          allergens: ['dairy'],
          prepTime: 'overnight + 30 minutes',
          cookTime: '45 minutes',
          culturalNotes: 'Created in Delhi's Moti Mahal restaurant, this dish represents the evolution of Indian cuisine in the post-independence era',
          pairingSuggestions: ['naan', 'jeera rice', 'dal makhani', 'onion salad'],
          dietaryInfo: ['contains meat'],
          spiceLevel: 'mild to medium',
          nutrition: {
            calories: 650,
            protein: 35,
            carbs: 28,
            fat: 42,
            vitamins: ['A', 'D', 'B12'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['all'],
          mealType: ['dinner']
        },
        {
          name: 'Hyderabadi Biryani',
          description: 'Layered rice with spiced meat and aromatics',
          cuisine: 'Indian (Hyderabad)',
          cookingMethods: ['layering', 'dum cooking', 'marinating'],
          tools: [
            'heavy-bottomed pot',
            'dum lid',
            'mixing bowls',
            'spice grinder',
            'cheesecloth for bouquet garni'
          ],
          preparationSteps: [
            'Marinate meat',
            'Par-boil rice',
            'Layer meat and rice',
            'Add saffron milk',
            'Seal pot with dough',
            'Cook on dum',
            'Rest before serving'
          ],
          ingredients: [
            { name: 'basmati rice', amount: '500', unit: 'g', category: 'grain' },
            {
              name: 'lamb',
              amount: '600',
              unit: 'g',
              category: 'protein',
              swaps: ['chicken', 'jackfruit']
            },
            { name: 'yogurt', amount: '200', unit: 'ml', category: 'dairy' },
            { name: 'onions', amount: '300', unit: 'g', category: 'vegetable' },
            { name: 'saffron', amount: '1', unit: 'pinch', category: 'spice' },
            { name: 'ghee', amount: '100', unit: 'ml', category: 'fat' },
            { name: 'whole spices', amount: '30', unit: 'g', category: 'spice' }
          ],
          substitutions: {
            lamb: ['chicken', 'jackfruit', 'mushrooms'],
            ghee: ['oil', 'vegan butter'],
            yogurt: ['coconut yogurt', 'cashew yogurt']
          },
          servingSize: 6,
          allergens: ['dairy'],
          prepTime: '2 hours',
          cookTime: '1 hour',
          culturalNotes:
            'A royal dish from the Nizam's kitchen, Hyderabadi biryani is distinguished by its layering technique and use of saffron',
          pairingSuggestions: ['mirchi ka salan', 'raita', 'boiled eggs', 'onion salad'],
          dietaryInfo: ['contains meat'],
          spiceLevel: 'medium to hot',
          nutrition: {
            calories: 720,
            protein: 42,
            carbs: 85,
            fat: 28,
            vitamins: ['B12', 'B6'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['all'],
          mealType: ['dinner', 'special occasion']
        },
        {
          name: 'Palak Paneer',
          description: 'Fresh spinach curry with cottage cheese',
          cuisine: 'Indian (North)',
          cookingMethods: ['blanching', 'pureeing', 'tempering'],
          tools: ['heavy-bottomed pot', 'blender', 'strainer', 'tempering pan', 'wooden spoon'],
          preparationSteps: [
            'Blanch spinach briefly',
            'Puree into smooth paste',
            'Pan-fry paneer cubes',
            'Prepare tempering',
            'Cook spinach gravy',
            'Add paneer and finish'
          ],
          ingredients: [
            { name: 'spinach', amount: '500', unit: 'g', category: 'vegetable' },
            { name: 'paneer', amount: '250', unit: 'g', category: 'dairy', swaps: ['tofu'] },
            { name: 'onions', amount: '2', unit: 'medium', category: 'vegetable' },
            { name: 'tomatoes', amount: '2', unit: 'medium', category: 'vegetable' },
            { name: 'ginger-garlic paste', amount: '2', unit: 'tbsp', category: 'paste' },
            { name: 'garam masala', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'cream', amount: '50', unit: 'ml', category: 'dairy', optional: true }
          ],
          substitutions: {
            paneer: ['firm tofu', 'tempeh'],
            cream: ['cashew cream', 'coconut cream'],
            spinach: ['swiss chard', 'mustard greens']
          },
          servingSize: 4,
          allergens: ['dairy'],
          prepTime: '20 minutes',
          cookTime: '30 minutes',
          culturalNotes:
            'A nutritious dish that makes eating greens delicious. Popular among vegetarians and non-vegetarians alike',
          pairingSuggestions: ['naan', 'roti', 'jeera rice', 'dal'],
          dietaryInfo: ['vegetarian', 'gluten-free'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 280,
            protein: 16,
            carbs: 12,
            fat: 20,
            vitamins: ['A', 'K', 'C'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['winter'],
          mealType: ['lunch', 'dinner']
        },
        {
          name: 'Chole Bhature',
          description: 'Spiced chickpeas with deep-fried bread',
          cuisine: 'Indian (Punjab)',
          cookingMethods: ['pressure-cooking', 'deep-frying', 'simmering'],
          tools: ['pressure cooker', 'deep fryer', 'rolling pin', 'mixing bowls', 'spice grinder'],
          preparationSteps: [
            'Soak chickpeas overnight',
            'Pressure cook with tea bag',
            'Prepare spice blend',
            'Make bhatura dough',
            'Cook chole gravy',
            'Deep fry bhature'
          ],
          ingredients: [
            { name: 'chickpeas', amount: '500', unit: 'g', category: 'legume' },
            { name: 'all-purpose flour', amount: '300', unit: 'g', category: 'flour' },
            { name: 'yogurt', amount: '100', unit: 'ml', category: 'dairy' },
            { name: 'tea bags', amount: '2', unit: 'pieces', category: 'other' },
            { name: 'onions', amount: '3', unit: 'large', category: 'vegetable' },
            { name: 'tomatoes', amount: '4', unit: 'medium', category: 'vegetable' },
            { name: 'chole masala', amount: '3', unit: 'tbsp', category: 'spice' }
          ],
          substitutions: {
            'all-purpose flour': ['whole wheat flour'],
            yogurt: ['plant-based yogurt'],
            ghee: ['oil']
          },
          servingSize: 6,
          allergens: ['gluten', 'dairy'],
          prepTime: 'overnight + 30 minutes',
          cookTime: '1 hour',
          culturalNotes:
            'A beloved street food from Punjab, now popular across India. The tea bag adds color and depth to the chickpeas',
          pairingSuggestions: ['onion rings', 'pickle', 'green chutney'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'medium to hot',
          nutrition: {
            calories: 520,
            protein: 18,
            carbs: 82,
            fat: 16,
            vitamins: ['B6', 'C'],
            minerals: ['Iron', 'Folate']
          },
          season: ['winter'],
          mealType: ['breakfast', 'lunch']
        },
        {
          name: 'Malai Kofta',
          description: 'Paneer and potato dumplings in rich cream sauce',
          cuisine: 'Indian (Mughlai)',
          cookingMethods: ['frying', 'simmering', 'grinding'],
          tools: ['deep fryer', 'heavy-bottomed pot', 'grinder', 'mixing bowls', 'strainer'],
          preparationSteps: [
            'Prepare kofta mixture',
            'Shape into balls',
            'Deep fry koftas',
            'Make creamy gravy',
            'Add koftas before serving',
            'Garnish with cream'
          ],
          ingredients: [
            { name: 'paneer', amount: '250', unit: 'g', category: 'dairy', swaps: ['tofu'] },
            { name: 'potatoes', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'cashews', amount: '100', unit: 'g', category: 'nuts' },
            { name: 'cream', amount: '200', unit: 'ml', category: 'dairy' },
            { name: 'tomatoes', amount: '400', unit: 'g', category: 'vegetable' },
            { name: 'garam masala', amount: '2', unit: 'tsp', category: 'spice' },
            { name: 'saffron', amount: '1', unit: 'pinch', category: 'spice', optional: true }
          ],
          substitutions: {
            paneer: ['tofu', 'mixed vegetables'],
            cream: ['cashew cream', 'coconut cream'],
            cashews: ['almonds', 'sunflower seeds']
          },
          servingSize: 4,
          allergens: ['dairy', 'nuts'],
          prepTime: '45 minutes',
          cookTime: '30 minutes',
          culturalNotes:
            'A royal Mughlai dish that showcases the rich, creamy gravies of North Indian cuisine. Often served at special occasions',
          pairingSuggestions: ['naan', 'pulao', 'raita', 'mint chutney'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'mild',
          nutrition: {
            calories: 480,
            protein: 16,
            carbs: 32,
            fat: 34,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Iron']
          },
          season: ['winter'],
          mealType: ['dinner', 'special occasion']
        },
        {
          name: 'Pani Puri',
          description: 'Crispy hollow spheres with spiced water and fillings',
          cuisine: 'Indian (Street Food)',
          cookingMethods: ['assembling', 'mixing', 'chilling'],
          tools: ['mixing bowls', 'strainer', 'blender', 'measuring cups', 'serving stand'],
          preparationSteps: [
            'Prepare mint-cilantro water',
            'Make potato filling',
            'Soak tamarind',
            'Chill spiced water',
            'Assemble just before serving',
            'Serve immediately'
          ],
          ingredients: [
            { name: 'puri shells', amount: '24', unit: 'pieces', category: 'bread' },
            { name: 'mint leaves', amount: '100', unit: 'g', category: 'herb' },
            { name: 'potatoes', amount: '200', unit: 'g', category: 'vegetable' },
            { name: 'tamarind', amount: '30', unit: 'g', category: 'fruit' },
            { name: 'black salt', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'chaat masala', amount: '2', unit: 'tsp', category: 'spice' },
            {
              name: 'sprouted moong',
              amount: '100',
              unit: 'g',
              category: 'legume',
              optional: true
            }
          ],
          substitutions: {
            'black salt': ['regular salt'],
            tamarind: ['lime juice'],
            'sprouted moong': ['boiled chickpeas']
          },
          servingSize: 4,
          allergens: ['gluten'],
          prepTime: '30 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'A beloved street food that originated in North India but has unique regional variations across the country',
          pairingSuggestions: ['masala chai', 'lassi'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'medium to hot',
          nutrition: {
            calories: 220,
            protein: 6,
            carbs: 42,
            fat: 4,
            vitamins: ['C', 'B6'],
            minerals: ['Iron', 'Potassium']
          },
          season: ['summer'],
          mealType: ['snack', 'appetizer']
        },
        {
          name: 'Baingan Bharta',
          description: 'Smoky roasted eggplant mash with spices',
          cuisine: 'Indian (North)',
          cookingMethods: ['roasting', 'sautéing', 'mashing'],
          tools: ['grill or stovetop', 'heavy pan', 'knife', 'cutting board', 'masher'],
          preparationSteps: [
            'Roast eggplant',
            'Peel and mash',
            'Prepare tempering',
            'Cook spices',
            'Combine ingredients',
            'Garnish and serve'
          ],
          ingredients: [
            { name: 'large eggplant', amount: '2', unit: 'whole', category: 'vegetable' },
            { name: 'onion', amount: '2', unit: 'medium', category: 'vegetable' },
            { name: 'tomatoes', amount: '3', unit: 'medium', category: 'vegetable' },
            { name: 'garlic', amount: '6', unit: 'cloves', category: 'vegetable' },
            { name: 'ginger', amount: '2', unit: 'inches', category: 'spice' },
            { name: 'cumin seeds', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'garam masala', amount: '1', unit: 'tsp', category: 'spice' },
            { name: 'turmeric', amount: '1/2', unit: 'tsp', category: 'spice' },
            {
              name: 'green chilies',
              amount: '2',
              unit: 'whole',
              category: 'spice',
              optional: true
            }
          ],
          substitutions: {
            eggplant: ['zucchini', 'mushrooms'],
            'green chilies': ['red chili powder', 'black pepper'],
            'fresh tomatoes': ['canned tomatoes']
          },
          servingSize: 4,
          allergens: [],
          prepTime: '20 minutes',
          cookTime: '45 minutes',
          culturalNotes:
            'A popular North Indian dish that showcases the smoky flavor of fire-roasted eggplant. Often served with fresh rotis or naan',
          pairingSuggestions: ['roti', 'naan', 'rice', 'dal'],
          dietaryInfo: ['vegan', 'gluten-free'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 180,
            protein: 4,
            carbs: 24,
            fat: 8,
            vitamins: ['C', 'K', 'B6'],
            minerals: ['Potassium', 'Manganese']
          },
          season: ['summer', 'autumn'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.3,
            Fire: 0.4,
            Air: 0.2,
            Water: 0.1
          }
        }
      ],
      winter: [
        {
          name: 'Rogan Josh',
          description: 'Kashmiri lamb curry with yogurt base',
          cuisine: 'Indian (Kashmir)',
          cookingMethods: ['braising', 'simmering', 'tempering'],
          tools: [
            'heavy-bottomed pot',
            'spice grinder',
            'wooden spoon',
            'measuring spoons',
            'mortar and pestle'
          ],
          preparationSteps: [
            'Toast and grind spices',
            'Marinate lamb in yogurt',
            'Brown meat in batches',
            'Prepare gravy base',
            'Simmer until tender',
            'Finish with garam masala'
          ],
          ingredients: [
            {
              name: 'lamb',
              amount: '800',
              unit: 'g',
              category: 'protein',
              swaps: ['mushrooms', 'seitan']
            },
            {
              name: 'yogurt',
              amount: '300',
              unit: 'ml',
              category: 'dairy',
              swaps: ['coconut yogurt']
            },
            { name: 'kashmiri chilies', amount: '4', unit: 'whole', category: 'spice' },
            { name: 'whole spices', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'ginger', amount: '2', unit: 'tbsp', category: 'spice' },
            { name: 'garlic', amount: '6', unit: 'cloves', category: 'vegetable' },
            { name: 'onions', amount: '2', unit: 'large', category: 'vegetable' }
          ],
          substitutions: {
            lamb: ['beef', 'mushrooms', 'seitan'],
            yogurt: ['coconut yogurt', 'cashew yogurt'],
            'kashmiri chilies': ['paprika + cayenne']
          },
          servingSize: 6,
          allergens: ['dairy'],
          prepTime: '30 minutes',
          cookTime: '2 hours',
          culturalNotes:
            'A signature Kashmiri dish known for its vibrant red color from mild Kashmiri chilies. Originally brought to Kashmir by the Mughals',
          pairingSuggestions: ['steamed rice', 'naan', 'onion salad', 'raita'],
          dietaryInfo: ['contains meat'],
          spiceLevel: 'medium',
          nutrition: {
            calories: 580,
            protein: 45,
            carbs: 12,
            fat: 38,
            vitamins: ['B12', 'D'],
            minerals: ['Iron', 'Zinc']
          },
          season: ['winter'],
          mealType: ['dinner']
        }
      ]
    },
    dessert: {
      all: [
        {
          name: 'Gulab Jamun',
          description: 'Fried milk solids in sugar syrup',
          cuisine: 'Indian',
          cookingMethods: ['frying', 'syrup-making'],
          tools: ['deep fryer', 'saucepan', 'slotted spoon', 'mixing bowls', 'measuring cups'],
          preparationSteps: [
            'Prepare dough mixture',
            'Shape into small balls',
            'Deep fry until golden',
            'Make sugar syrup',
            'Soak in hot syrup',
            'Rest until absorbed'
          ],
          ingredients: [
            {
              name: 'milk powder',
              amount: '200',
              unit: 'g',
              category: 'dairy',
              swaps: ['almond flour blend']
            },
            { name: 'all-purpose flour', amount: '50', unit: 'g', category: 'flour' },
            { name: 'sugar', amount: '300', unit: 'g', category: 'sweetener' },
            { name: 'cardamom', amount: '4', unit: 'pods', category: 'spice' },
            { name: 'saffron', amount: '1', unit: 'pinch', category: 'spice' },
            { name: 'ghee', amount: '30', unit: 'ml', category: 'fat' },
            { name: 'milk', amount: '60', unit: 'ml', category: 'dairy' }
          ],
          substitutions: {
            'milk powder': ['almond flour blend', 'coconut milk powder'],
            ghee: ['vegetable oil'],
            milk: ['plant-based milk']
          },
          servingSize: 15,
          allergens: ['dairy', 'gluten'],
          prepTime: '30 minutes',
          cookTime: '30 minutes',
          culturalNotes:
            'A beloved dessert served at festivals and celebrations. The name means 'rose berry' due to the rose-scented syrup traditionally used',
          pairingSuggestions: ['masala chai', 'ice cream', 'rabri'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 320,
            protein: 6,
            carbs: 65,
            fat: 8,
            vitamins: ['D', 'A'],
            minerals: ['Calcium']
          },
          season: ['all'],
          mealType: ['dessert']
        },
        {
          name: 'Rasmalai',
          description: 'Cheese dumplings in saffron milk',
          cuisine: 'Indian (Bengal)',
          cookingMethods: ['curdling', 'poaching', 'reducing'],
          tools: [
            'heavy-bottomed pot',
            'cheesecloth',
            'slotted spoon',
            'measuring cups',
            'fine strainer'
          ],
          preparationSteps: [
            'Curdle milk for chenna',
            'Knead chenna until smooth',
            'Shape into discs',
            'Poach in sugar syrup',
            'Prepare saffron milk',
            'Soak in flavored milk'
          ],
          ingredients: [
            { name: 'milk', amount: '2', unit: 'L', category: 'dairy' },
            { name: 'sugar', amount: '200', unit: 'g', category: 'sweetener' },
            { name: 'cardamom', amount: '6', unit: 'pods', category: 'spice' },
            { name: 'pistachios', amount: '50', unit: 'g', category: 'nuts' },
            { name: 'saffron', amount: '1', unit: 'pinch', category: 'spice' },
            { name: 'rose water', amount: '1', unit: 'tsp', category: 'flavoring', optional: true }
          ],
          substitutions: {
            milk: ['full-fat plant milk + agar'],
            pistachios: ['almonds', 'cashews'],
            'rose water': ['kewra water', 'vanilla']
          },
          servingSize: 8,
          allergens: ['dairy', 'nuts'],
          prepTime: '45 minutes',
          cookTime: '1 hour',
          culturalNotes:
            'A refined Bengali dessert that showcases the region's expertise in milk-based sweets. Often served at weddings and special occasions',
          pairingSuggestions: ['masala chai', 'paan'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 280,
            protein: 12,
            carbs: 42,
            fat: 10,
            vitamins: ['D', 'B12'],
            minerals: ['Calcium', 'Potassium']
          },
          season: ['all'],
          mealType: ['dessert']
        },
        {
          name: 'Kulfi',
          description: 'Dense Indian ice cream',
          cuisine: 'Indian',
          cookingMethods: ['reducing', 'freezing'],
          tools: ['heavy-bottomed pot', 'wooden spoon', 'kulfi molds', 'fine strainer', 'blender'],
          preparationSteps: [
            'Reduce milk slowly',
            'Add nuts and cardamom',
            'Cool mixture',
            'Pour into molds',
            'Freeze until solid',
            'Dip in warm water to unmold'
          ],
          ingredients: [
            { name: 'milk', amount: '1', unit: 'L', category: 'dairy', swaps: ['coconut milk'] },
            { name: 'pistachios', amount: '100', unit: 'g', category: 'nuts' },
            { name: 'cardamom', amount: '5', unit: 'pods', category: 'spice' },
            { name: 'saffron', amount: '1', unit: 'pinch', category: 'spice' },
            { name: 'sugar', amount: '150', unit: 'g', category: 'sweetener' },
            { name: 'almonds', amount: '50', unit: 'g', category: 'nuts' }
          ],
          substitutions: {
            milk: ['coconut milk', 'cashew milk'],
            pistachios: ['any nuts'],
            sugar: ['jaggery', 'date syrup']
          },
          servingSize: 6,
          allergens: ['dairy', 'nuts'],
          prepTime: '30 minutes',
          cookTime: '1 hour',
          freezeTime: '6 hours',
          culturalNotes:
            'A traditional frozen dessert predating ice cream in India. The slow reduction of milk creates its signature dense, creamy texture',
          pairingSuggestions: ['falooda', 'rose syrup', 'fresh fruit'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 260,
            protein: 8,
            carbs: 32,
            fat: 12,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Phosphorus']
          },
          season: ['summer'],
          mealType: ['dessert']
        }
      ],
      summer: [
        {
          name: 'Kulfi',
          description: 'Dense Indian ice cream',
          cuisine: 'Indian',
          ingredients: [
            { name: 'milk', amount: '1', unit: 'L', category: 'dairy', swaps: ['coconut milk'] },
            { name: 'pistachios', amount: '100', unit: 'g', category: 'nuts' },
            { name: 'cardamom', amount: '5', unit: 'pods', category: 'spice' },
            { name: 'saffron', amount: '1', unit: 'pinch', category: 'spice' }
          ],
          nutrition: {
            calories: 260,
            protein: 8,
            carbs: 32,
            fat: 12,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Phosphorus']
          },
          timeToMake: '240 minutes',
          season: ['summer'],
          mealType: ['dessert']
        }
      ]
    }
  },
  traditionalSauces: {
    tandoori: {
      name: 'Tandoori Marinade',
      description: 'Yogurt-based marinade with vibrant spices for traditional tandoor cooking',
      base: 'yogurt',
      keyIngredients: [
        'yogurt',
        'ginger-garlic paste',
        'red chili powder',
        'garam masala',
        'lemon juice'
      ],
      culinaryUses: ['marinating meats', 'vegetable preparation', 'flavor base', 'coloring agent'],
      variants: ['Achari tandoori', 'Hariyali tandoori', 'Malai tandoori'],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.2,
        Water: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ['Mars', 'Sun', 'Aries'],
      seasonality: 'all',
      preparationNotes:
        'Allow marination for at least 4 hours, preferably overnight for best flavor',
      technicalTips:
        'For authentic color, use Kashmiri chili powder which adds color without excess heat'
    },
    tikka_masala: {
      name: 'Tikka Masala',
      description: 'Rich tomato-based curry sauce with cream and aromatic spices',
      base: 'tomato and cream',
      keyIngredients: ['tomatoes', 'cream', 'garam masala', 'fenugreek leaves', 'butter'],
      culinaryUses: [
        'sauce for grilled meats',
        'vegetable curry base',
        'dipping sauce',
        'rice accompaniment'
      ],
      variants: ['Butter masala', 'Paneer tikka masala', 'Vegetable tikka masala'],
      elementalProperties: {
        Fire: 0.3,
        Water: 0.3,
        Earth: 0.3,
        Air: 0.1
      },
      astrologicalInfluences: ['Venus', 'Moon', 'Taurus'],
      seasonality: 'all',
      preparationNotes: 'Allow the sauce to simmer gently to develop complex flavors',
      technicalTips: 'Add kasuri methi (dried fenugreek leaves) at the end for authentic aroma'
    },
    raita: {
      name: 'Raita',
      description: 'Cooling yogurt condiment with vegetables and spices',
      base: 'yogurt',
      keyIngredients: ['yogurt', 'cucumber', 'cumin', 'mint', 'cilantro'],
      culinaryUses: ['cooling accompaniment', 'side dish', 'dip', 'spice balancer'],
      variants: ['Boondi raita', 'Pineapple raita', 'Spinach raita', 'Onion raita'],
      elementalProperties: {
        Water: 0.6,
        Earth: 0.2,
        Air: 0.2,
        Fire: 0.0
      },
      astrologicalInfluences: ['Moon', 'Venus', 'Cancer'],
      seasonality: 'all',
      preparationNotes: 'Use thick, strained yogurt for best texture',
      technicalTips: 'Salt and drain cucumber to prevent watery raita'
    },
    tamarind_chutney: {
      name: 'Tamarind Chutney',
      description: 'Sweet and sour condiment made from tamarind pulp, jaggery and spices',
      base: 'tamarind',
      keyIngredients: ['tamarind pulp', 'jaggery', 'cumin', 'ginger', 'black salt'],
      culinaryUses: ['chaat accompaniment', 'appetizer dip', 'sandwich spread', 'glaze'],
      variants: ['Date-tamarind chutney', 'Spicy tamarind chutney', 'Garlic tamarind chutney'],
      elementalProperties: {
        Water: 0.4,
        Fire: 0.3,
        Earth: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ['Mercury', 'Saturn', 'Gemini'],
      seasonality: 'all',
      preparationNotes: 'Balance sweet, sour, and spicy elements carefully',
      technicalTips: 'Strain thoroughly for smooth consistency'
    },
    coriander_mint_chutney: {
      name: 'Coriander-Mint Chutney',
      description: 'Fresh, vibrant green chutney with herbs and green chilies',
      base: 'herbs',
      keyIngredients: ['cilantro', 'mint', 'green chilies', 'lemon juice', 'cumin'],
      culinaryUses: ['sandwich spread', 'chaat topping', 'dipping sauce', 'marinade component'],
      variants: ['Coconut green chutney', 'Garlic green chutney', 'Yogurt green chutney'],
      elementalProperties: {
        Air: 0.5,
        Water: 0.3,
        Fire: 0.2,
        Earth: 0.0
      },
      astrologicalInfluences: ['Mercury', 'Moon', 'Virgo'],
      seasonality: 'all',
      preparationNotes: 'Use ice water when blending to maintain bright green color',
      technicalTips: 'Add a small amount of yogurt for creamier texture and longer shelf life'
    },
    coconut_curry: {
      name: 'Coconut Curry Sauce',
      description: 'Creamy, aromatic sauce with coconut milk and south Indian spices',
      base: 'coconut milk',
      keyIngredients: [
        'coconut milk',
        'curry leaves',
        'mustard seeds',
        'turmeric',
        'green chilies'
      ],
      culinaryUses: [
        'seafood sauce',
        'vegetable curry base',
        'braising liquid',
        'rice accompaniment'
      ],
      variants: ['Kerala-style', 'Goan curry', 'Vegetable stew base', 'Seafood moilee'],
      elementalProperties: {
        Water: 0.5,
        Earth: 0.2,
        Fire: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ['Moon', 'Neptune', 'Pisces'],
      seasonality: 'all',
      preparationNotes: 'Temper spices properly to release their flavors into the coconut milk',
      technicalTips: 'Use full-fat coconut milk for richness, light coconut milk may separate'
    },
    onion_tomato_masala: {
      name: 'Onion-Tomato Masala',
      description: 'Foundational sauce of caramelized onions and tomatoes for North Indian curries',
      base: 'onion and tomato',
      keyIngredients: ['onions', 'tomatoes', 'ginger-garlic paste', 'cumin', 'coriander powder'],
      culinaryUses: ['curry base', 'gravy foundation', 'rice flavoring', 'legume enhancement'],
      variants: ['Bhuna masala', 'Restaurant-style base', 'Home-style gravy', 'Spicy version'],
      elementalProperties: {
        Fire: 0.4,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ['Mars', 'Sun', 'Leo'],
      seasonality: 'all',
      preparationNotes: 'Properly caramelizing onions (bhunao) is the key to depth of flavor',
      technicalTips: 'Prepare in large batches and freeze in portions for quick weeknight cooking'
    }
  },
  sauceRecommender: {
    forProtein: {
      chicken: ['tandoori marinade', 'tikka masala', 'korma', 'kadhai masala', 'coconut curry'],
      lamb: ['rogan josh', 'bhuna masala', 'achari masala', 'dopiaza', 'onion_tomato_masala'],
      fish: [
        'moilee sauce',
        'amritsari masala',
        'mustard sauce',
        'malvani masala',
        'coconut_curry'
      ],
      paneer: ['makhani sauce', 'palak sauce', 'kadhai masala', 'shahi sauce', 'tikka_masala'],
      legumes: ['chana masala', 'dal makhani sauce', 'sambar', 'rasam', 'tadka'],
      goat: [
        'kosha mangsho sauce',
        'kolhapuri rassa',
        'laal maas gravy',
        'saag base',
        'achari masala'
      ],
      eggs: [
        'mughlai gravy',
        'onion_tomato_masala',
        'curry leaf tempering',
        'mirchi ka salan',
        'tomato chutney base'
      ]
    },
    forVegetable: {
      leafy: [
        'palak sauce',
        'methi masala',
        'coconut sauce',
        'mustard paste',
        'sarson ka saag base'
      ],
      root: ['korma', 'vindaloo', 'do pyaza', 'bharta masala', 'coconut curry'],
      eggplant: ['bharta masala', 'salan', 'bagara masala', 'achari sauce', 'tamarind base'],
      okra: [
        'bhindi masala',
        'sambhariya masala',
        'achari masala',
        'yogurt sauce',
        'onion_tomato_masala'
      ],
      potato: [
        'aloo dum masala',
        'jeera aloo spice mix',
        'chaat masala',
        'tikki masala',
        'mustard paste'
      ],
      cauliflower: [
        'aloo gobi masala',
        'coconut curry',
        'kasundi paste',
        'achari masala',
        'onion_tomato_masala'
      ],
      gourds: [
        'dahi wali kaddu',
        'lauki chana dal',
        'coconut curry',
        'sambhar base',
        'peanut sauce'
      ]
    },
    forCookingMethod: {
      tandoor: [
        'tandoori marinade',
        'hariyali marinade',
        'malai marinade',
        'achari marinade',
        'yogurt-based marinades'
      ],
      curry: [
        'garam masala base',
        'dhansak sauce',
        'xacuti masala',
        'chettinad sauce',
        'onion_tomato_masala'
      ],
      frying: [
        'pakora batter',
        'kathi masala',
        'besan masala',
        'amritsari masala',
        'ajwain tempering'
      ],
      steaming: [
        'mustard paste',
        'moilee sauce',
        'patrani masala',
        'coconut sauce',
        'coriander_mint_chutney'
      ],
      grilling: [
        'boti kabab marinade',
        'tikka marinade',
        'malai kabab paste',
        'reshmi kabab mixture',
        'hariyali paste'
      ],
      'stir-frying': [
        'kadhai masala',
        'chilli paneer sauce',
        'manchurian sauce',
        'ginger-garlic base',
        'dry mango spice'
      ]
    },
    byAstrological: {
      fire: [
        'laal maas sauce',
        'vindaloo paste',
        'phaal curry sauce',
        'chettinad masala',
        'achari sauce'
      ],
      earth: ['dal makhani sauce', 'korma paste', 'malai sauce', 'shahi gravy', 'tempering oil'],
      air: ['raita', 'green chutney', 'kadhi sauce', 'tamarind chutney', 'coriander_mint_chutney'],
      water: ['coconut curry sauce', 'moilee gravy', 'dahi wali gravy', 'rasam', 'kadhi']
    },
    byRegion: {
      north: ['makhani sauce', 'korma', 'kadhai masala', 'yakhni', 'onion_tomato_masala'],
      south: ['sambar', 'rasam', 'chettinad masala', 'moilee gravy', 'coconut_curry'],
      east: ['mustard sauce', 'doi maach sauce', 'posto paste', 'panch phoron oil', 'kalia gravy'],
      west: ['malvani masala', 'goda masala', 'koli masala', 'dhansak sauce', 'kolhapuri masala'],
      central: ['bhopali sauce', 'safed maas gravy', 'rogan josh', 'nihari masala', 'salan'],
      northeast: [
        'bamboo shoot sauce',
        'fermented soybean paste',
        'axone base',
        'bhut jolokia oil',
        'fish sauce'
      ]
    },
    byDietary: {
      vegetarian: ['palak sauce', 'coconut curry', 'kadhi sauce', 'sambar', 'tikka_masala'],
      vegan: ['chana masala', 'tadka dal', 'bharta masala', 'amchur sauce', 'coconut_curry'],
      glutenFree: [
        'rasam',
        'chettinad masala',
        'moilee gravy',
        'dhansak sauce',
        'tamarind_chutney'
      ],
      dairyFree: [
        'tamarind chutney',
        'vindaloo paste',
        'mustard sauce',
        'phaal curry',
        'coconut_curry'
      ],
      jain: [
        'jain masala',
        'no-onion garlic base',
        'raw banana curry',
        'suran masala',
        'arbi gravy'
      ]
    },
    byFlavor: {
      spicy: [
        'vindaloo paste',
        'chettinad masala',
        'phaal curry',
        'kolhapuri rassa',
        'andhra masala'
      ],
      mild: ['korma', 'pasanda sauce', 'shahi gravy', 'malai sauce', 'cashew paste'],
      tangy: [
        'tamarind_chutney',
        'amchur sauce',
        'nimbu-based dressing',
        'tomato salan',
        'imli chutney'
      ],
      sweet: ['kashmiri gravy', 'date chutney', 'shahi sauce', 'malai curry', 'coconut chutney'],
      aromatic: [
        'biryani masala',
        'garam masala oil',
        'pulao spice mix',
        'kewra water',
        'rose essence sauce'
      ]
    }
  } as unknown,
  cookingTechniques: [
    {
      name: 'Tadka',
      description: 'Tempering spices in hot oil or ghee to release flavors',
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0.0 },
      toolsRequired: ['small tadka pan', 'spoon', 'lid', 'ladle'],
      bestFor: ['dal preparations', 'curries', 'rice dishes', 'yogurt preparations'],
      difficulty: 'medium'
    },
    {
      name: 'Dum',
      description: 'Slow cooking in a sealed vessel to contain flavors and moisture',
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: ['heavy-bottomed pot', 'dough for sealing', 'tongs', 'weight'],
      bestFor: ['biryani', 'meat curries', 'rich vegetable dishes', 'kebabs'],
      difficulty: 'hard'
    },
    {
      name: 'Bhunao',
      description: 'Slow sautéing to caramelize and intensify flavors',
      elementalProperties: { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
      toolsRequired: ['heavy kadhai', 'wooden spoon', 'tongs', 'timer'],
      bestFor: ['onion-tomato masala', 'meat preparations', 'mixed vegetables', 'keema'],
      difficulty: 'medium'
    },
    {
      name: 'Tandoor',
      description: 'High-heat clay oven cooking for char and smoky flavor',
      elementalProperties: { Fire: 0.8, Air: 0.1, Earth: 0.1, Water: 0.0 },
      toolsRequired: ['tandoor', 'skewers', 'brush', 'tongs'],
      bestFor: ['breads', 'marinated meats', 'kebabs', 'vegetables'],
      difficulty: 'hard'
    },
    {
      name: 'Baghar',
      description: 'Pouring hot spice-infused oil over finished dishes',
      elementalProperties: { Fire: 0.6, Air: 0.3, Earth: 0.1, Water: 0.0 },
      toolsRequired: ['small pan', 'spoon', 'heat-proof container', 'strainer'],
      bestFor: ['dals', 'rice dishes', 'raita', 'curries'],
      difficulty: 'easy'
    }
  ],
  regionalCuisines: {
    punjabi: {
      name: 'Punjabi Cuisine',
      description:
        'Hearty, rich cuisine with generous use of dairy, robust spices, and tandoor cooking',
      signature: ['butter chicken', 'dal makhani', 'amritsari kulcha', 'sarson da saag'],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Mars', 'Jupiter', 'taurus'],
      seasonality: 'all'
    },
    bengali: {
      name: 'Bengali Cuisine',
      description:
        'Delicate flavors with emphasis on fish, mustard, panch phoron spice blend and sweets',
      signature: ['maacher jhol', 'shorshe ilish', 'mishti doi', 'rasgulla'],
      elementalProperties: { Water: 0.5, Earth: 0.2, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ['Venus', 'Moon', 'cancer'],
      seasonality: 'all'
    },
    south_indian: {
      name: 'South Indian Cuisine',
      description:
        'Predominantly rice-based with coconut, curry leaves, tamarind and complex spice blends',
      signature: ['dosa', 'idli', 'sambar', 'rasam'],
      elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
      astrologicalInfluences: ['Mercury', 'Sun', 'virgo'],
      seasonality: 'all'
    },
    gujarati: {
      name: 'Gujarati Cuisine',
      description: 'Vegetarian cuisine with balance of sweet, salty and spicy flavors',
      signature: ['dhokla', 'thepla', 'undhiyu', 'fafda-jalebi'],
      elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
      astrologicalInfluences: ['Jupiter', 'Mercury', 'gemini'],
      seasonality: 'all'
    }
  },
  elementalProperties: {
    Fire: 0.5,
    Earth: 0.2,
    Water: 0.2,
    Air: 0.1
  }
};

export default indian;
