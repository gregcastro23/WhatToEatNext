// src/data/cuisines/french.ts
import type { _, _ZodiacSign } from '@/types/alchemy';
import type { Cuisine } from '@/types/cuisine';

export const french: Cuisine = {
  id: 'french',
  name: 'French',
  description:
    'Classical French cuisine emphasizing technique, tradition, and refined flavors. From rustic provincial dishes to haute cuisine, French cooking is the foundation of culinary arts.',
  motherSauces: {
    bechamel: {
      name: 'Béchamel',
      description: 'A white sauce made from milk thickened with a white roux',
      base: 'milk',
      thickener: 'white roux (butter and flour)',
      keyIngredients: ['milk', 'butter', 'flour', 'nutmeg'],
      culinaryUses: ['lasagna', 'croque monsieur', 'soufflé', 'gratins'],
      derivatives: ['Mornay', 'Soubise', 'Nantua', 'Cream sauce'],
      elementalProperties: {
        Water: 0.5,
        Earth: 0.3,
        Air: 0.1,
        Fire: 0.1
      },
      astrologicalInfluences: ['Moon', 'Cancer', 'Venus'],
      seasonality: 'all',
      preparationNotes:
        'Heat should be gentle to prevent scorching. Whisk constantly when adding milk to prevent lumps.',
      technicalTips: 'For a smoother sauce, heat the milk before adding it to the roux.',
      difficulty: 'medium',
      storageInstructions:
        'Refrigerate up to 3 days, cover surface with plastic wrap to prevent skin formation',
      yield: '2 cups'
    },
    veloute: {
      name: 'Velouté',
      description: 'A light stock-based sauce thickened with a blonde roux',
      base: 'light stock (chicken, fish, or veal)',
      thickener: 'blonde roux (butter and flour)',
      keyIngredients: ['light stock', 'butter', 'flour'],
      culinaryUses: ['poultry dishes', 'fish dishes', 'vegetable preparations'],
      derivatives: ['Allemande', 'Suprême', 'Bercy', 'Hungarian'],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.3,
        Air: 0.2,
        Fire: 0.1
      },
      astrologicalInfluences: ['Jupiter', 'Mercury', 'Pisces'],
      seasonality: 'all',
      preparationNotes: 'The stock must be relatively clear and the roux cooked to a blonde stage.',
      technicalTips: 'Choose the stock type based on the protein it will accompany.',
      difficulty: 'medium',
      storageInstructions: 'Refrigerate up to 2 days, reheat gently while whisking',
      yield: '2 cups'
    },
    espagnole: {
      name: 'Espagnole (Brown Sauce)',
      description: 'A brown stock-based sauce thickened with a brown roux',
      base: 'brown stock (traditionally veal)',
      thickener: 'brown roux (butter and flour)',
      keyIngredients: ['brown stock', 'mirepoix', 'tomato paste', 'butter', 'flour'],
      culinaryUses: ['red meat dishes', 'game', 'rich preparations'],
      derivatives: ['Demi-glace', 'Bordelaise', 'Charcutière', 'Robert', 'Chasseur'],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ['Mars', 'Saturn', 'Scorpio'],
      seasonality: 'autumn, winter',
      preparationNotes: 'The roux must be browned correctly to develop the deep color and flavor.',
      technicalTips: 'Skim regularly during simmering to achieve clarity.',
      difficulty: 'hard',
      storageInstructions: 'Refrigerate up to 4 days, freeze up to 3 months',
      yield: '3 cups'
    },
    hollandaise: {
      name: 'Hollandaise',
      description: 'An emulsion of butter and lemon juice using egg yolks as the emulsifier',
      base: 'clarified butter',
      thickener: 'egg yolks',
      keyIngredients: ['egg yolks', 'clarified butter', 'lemon juice', 'white pepper'],
      culinaryUses: ['eggs benedict', 'asparagus', 'fish', 'vegetables'],
      derivatives: ['Béarnaise', 'Maltaise', 'Mousseline', 'Choron'],
      elementalProperties: {
        Water: 0.2,
        Fire: 0.4,
        Air: 0.3,
        Earth: 0.1
      },
      astrologicalInfluences: ['Sun', 'Mercury', 'Leo'],
      seasonality: 'spring, summer',
      preparationNotes: 'Temperature control is critical to prevent curdling or breaking.',
      technicalTips: 'Use a double boiler or bain-marie and add butter gradually.',
      difficulty: 'hard',
      storageInstructions: 'Best served immediately, can hold warm for up to 1 hour in bain-marie',
      yield: '1 cup'
    },
    tomato: {
      name: 'Tomato Sauce',
      description: 'A sauce based on tomatoes, with aromatic vegetables and stock',
      base: 'tomatoes',
      thickener: 'tomato reduction and occasionally roux',
      keyIngredients: ['tomatoes', 'mirepoix', 'garlic', 'herbs'],
      culinaryUses: ['pasta', 'meat dishes', 'fish', 'vegetables'],
      derivatives: ['Provençale', 'Spanish', 'Creole', 'Portuguese'],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.3,
        Water: 0.1,
        Air: 0.1
      },
      astrologicalInfluences: ['Mars', 'Leo', 'Aries'],
      seasonality: 'summer, autumn',
      preparationNotes: 'Can be smooth or chunky depending on the preparation method.',
      technicalTips: 'For a deeper flavor, roast the tomatoes beforehand.',
      difficulty: 'easy',
      storageInstructions: 'Refrigerate up to 5 days, freeze up to 6 months',
      yield: '2.5 cups'
    }
  },
  sauceRecommender: {
    forProtein: {
      chicken: ['veloute', 'supreme', 'allemande'],
      fish: ['hollandaise', 'bercy', 'normandy'],
      beef: ['espagnole', 'bordelaise', 'robert'],
      lamb: ['espagnole', 'mint', 'rosemary jus'],
      pork: ['robert', 'charcutiere', 'diable'],
      game: ['grand veneur', 'poivrade', 'chasseur']
    },
    forVegetable: {
      asparagus: ['hollandaise', 'maltaise', 'mousseline'],
      potatoes: ['bechamel', 'mornay', 'cream sauce'],
      mushrooms: ['espagnole', 'duxelles', 'forestiere'],
      greens: ['vinaigrette', 'ravigote', 'gribiche']
    },
    forCookingMethod: {
      roasting: ['jus lie', 'demi-glace', 'au poivre'],
      poaching: ['veloute', 'vin blanc', 'nage'],
      grilling: ['bearnaise', 'bordelaise', 'maitre d'hotel butter'],
      braising: ['espagnole', 'romesco', 'chasseur']
    },
    byAstrological: {
      fire: ['espagnole', 'bearnaise', 'spicy tomato'],
      earth: ['bechamel', 'mornay', 'mushroom'],
      air: ['vinaigrette', 'ravigote', 'herb-infused'],
      water: ['veloute', 'hollandaise', 'beurre blanc']
    },
    byDietary: {
      vegetarian: ['bechamel', 'tomato', 'romesco'],
      vegan: ['tomato', 'mushroom', 'herb oil'],
      glutenFree: ['hollandaise', 'beurre blanc', 'herb oil'],
      dairyFree: ['tomato', 'herb oils', 'jus']
    },
    byRegion: {
      provence: ['rouille', 'pistou', 'tapenade'],
      burgundy: ['meurette', 'dijon mustard', 'red wine'],
      normandy: ['cream', 'apple', 'calvados'],
      alsace: ['riesling', 'beer', 'sauerkraut']
    }
  },
  dishes: {
    breakfast: {
      all: [
        {
          id: 'parisian-breakfast',
          name: 'Parisian Breakfast',
          description:
            'Traditional Parisian breakfast with croissant, café au lait, and strawberry preserves',
          cuisine: 'french',
          cookingMethods: ['warming', 'brewing'],
          tools: ['coffee maker', 'milk frother', 'small plates', 'butter knife', 'serving tray'],
          preparationSteps: [
            'Warm croissant in oven if desired',
            'Brew strong coffee',
            'Heat and froth milk',
            'Combine coffee and hot milk for café au lait',
            'Serve croissant with butter and preserves',
            'Arrange everything on serving tray'
          ],
          instructions: [
            'Warm croissant in oven if desired',
            'Brew strong coffee',
            'Heat and froth milk',
            'Combine coffee and hot milk for café au lait',
            'Serve croissant with butter and preserves',
            'Arrange everything on serving tray'
          ],
          substitutions: {
            croissant: ['sourdough bread', 'whole grain bread'],
            'whole milk': ['almond milk', 'oat milk'],
            'French butter': ['plant-based butter']
          },
          servingSize: 1,
          allergens: ['dairy', 'gluten'],
          prepTime: '5 minutes',
          cookTime: '10 minutes',
          culturalNotes:
            'The quintessential Parisian breakfast, traditionally enjoyed at a café or home',
          pairingSuggestions: ['fresh orange juice', 'fresh fruit', 'yogurt'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'butter croissant', amount: 1, unit: 'piece', category: 'pastry' }
            { name: 'French butter', amount: 30, unit: 'g', category: 'dairy' }
            { name: 'strawberry preserves', amount: 30, unit: 'g', category: 'preserve' }
            { name: 'coffee', amount: 120, unit: 'ml', category: 'beverage' }
            { name: 'whole milk', amount: 120, unit: 'ml', category: 'dairy' }
          ],
          nutrition: {
            calories: 420,
            protein: 8,
            carbs: 48,
            fat: 24,
            vitamins: ['A', 'D'],
            minerals: ['Calcium']
          },
          timeToMake: '15 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Venus - The buttery richness of the croissant',
            'Mercury - The stimulating effects of coffee'
          ],
          astrologicalAffinities: {
            planets: ['Moon', 'Venus'],
            signs: ['Taurus', 'Cancer'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Taurus', 'Cancer'],
          numberOfServings: 1
        }
        {
          id: 'eggs-en-cocotte',
          name: 'Eggs en Cocotte with Cream and Herbs',
          description:
            'Baked eggs in ramekins with cream and fine herbs - a refined French breakfast',
          cuisine: 'french',
          cookingMethods: ['baking', 'water bath'],
          tools: ['ramekins', 'baking dish', 'kettle', 'measuring spoons', 'serving plates'],
          preparationSteps: [
            'Preheat oven to 350°F/180°C',
            'Butter ramekins generously',
            'Add cream and herbs to ramekins',
            'Crack eggs into ramekins',
            'Place in baking dish with hot water',
            'Bake for 12-15 minutes',
            'Season with salt and white pepper',
            'Serve with toasted bread'
          ],
          instructions: [
            'Preheat oven to 350°F/180°C',
            'Butter ramekins generously',
            'Add cream and herbs to ramekins',
            'Crack eggs into ramekins',
            'Place in baking dish with hot water',
            'Bake for 12-15 minutes',
            'Season with salt and white pepper',
            'Serve with toasted bread'
          ],
          substitutions: {
            'crème fraîche': ['soy cream', 'almond cream'],
            eggs: ['vegan egg substitute'],
            butter: ['olive oil']
          },
          servingSize: 2,
          allergens: ['eggs', 'dairy'],
          prepTime: '5 minutes',
          cookTime: '15 minutes',
          culturalNotes: 'A refined breakfast dish popular in French bistros and home kitchens',
          pairingSuggestions: ['rustic bread', 'fresh herbs', 'fleur de sel'],
          dietaryInfo: ['vegetarian', 'gluten-free optional'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'fresh eggs', amount: 2, unit: 'large', category: 'protein' }
            { name: 'crème fraîche', amount: 60, unit: 'ml', category: 'dairy' }
            { name: 'fine herbs', amount: 1, unit: 'tbsp', category: 'herb' }
            { name: 'unsalted butter', amount: 15, unit: 'g', category: 'dairy' }
            { name: 'sea salt', amount: 0, unit: 'to taste', category: 'seasoning' }
            { name: 'white pepper', amount: 0, unit: 'to taste', category: 'seasoning' }
            { name: 'rustic bread', amount: 2, unit: 'slices', category: 'bread' }
          ],
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 22,
            fat: 26,
            vitamins: ['A', 'D', 'B12'],
            minerals: ['Iron', 'Calcium']
          },
          timeToMake: '20 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Water: 0.5,
            Earth: 0.3,
            Fire: 0.1,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Moon - The nurturing quality of eggs and cream',
            'Neptune - The dreamy texture of baked eggs'
          ],
          astrologicalAffinities: {
            planets: ['Moon', 'Neptune'],
            signs: ['Cancer', 'Pisces'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Cancer', 'Pisces'],
          numberOfServings: 2
        }
        {
          id: 'classic-french-toast',
          name: 'Classic French Toast',
          description: 'Traditional French toast with brioche and vanilla bean',
          cuisine: 'french',
          cookingMethods: ['pan-frying', 'soaking'],
          tools: ['non-stick pan', 'shallow dish', 'whisk', 'spatula', 'measuring cups'],
          preparationSteps: [
            'Split vanilla bean and scrape seeds',
            'Whisk eggs with milk, vanilla, and sugar',
            'Soak brioche slices in mixture',
            'Heat butter in pan until foamy',
            'Cook slices until golden brown',
            'Dust with powdered sugar',
            'Serve with maple syrup or honey'
          ],
          instructions: [
            'Split vanilla bean and scrape seeds',
            'Whisk eggs with milk, vanilla, and sugar',
            'Soak brioche slices in mixture',
            'Heat butter in pan until foamy',
            'Cook slices until golden brown',
            'Dust with powdered sugar',
            'Serve with maple syrup or honey'
          ],
          substitutions: {
            brioche: ['gluten-free milk bread', 'challah'],
            'whole milk': ['almond milk', 'soy milk'],
            'clarified butter': ['coconut oil', 'ghee']
          },
          servingSize: 3,
          allergens: ['eggs', 'dairy', 'gluten'],
          prepTime: '10 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'While called 'French toast' in English, in France it's known as 'pain perdu' (lost bread), as it was originally a way to use stale bread',
          pairingSuggestions: ['fresh berries', 'crème fraîche', 'maple syrup'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'brioche', amount: 6, unit: 'slices', category: 'bread' }
            { name: 'eggs', amount: 3, unit: 'large', category: 'protein' }
            { name: 'whole milk', amount: 240, unit: 'ml', category: 'dairy' }
            { name: 'vanilla bean', amount: 1, unit: 'piece', category: 'spice' }
            { name: 'granulated sugar', amount: 30, unit: 'g', category: 'sweetener' }
            { name: 'clarified butter', amount: 45, unit: 'g', category: 'dairy' }
            { name: 'cinnamon', amount: 0.25, unit: 'tsp', category: 'spice' }
          ],
          nutrition: {
            calories: 460,
            protein: 16,
            carbs: 52,
            fat: 24,
            vitamins: ['A', 'D', 'E'],
            minerals: ['Calcium', 'Iron']
          },
          timeToMake: '25 minutes',
          season: ['all'],
          mealType: ['breakfast'],
          elementalProperties: {
            Fire: 0.3,
            Earth: 0.3,
            Water: 0.3,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Venus - The sweet, indulgent nature',
            'Jupiter - The expansive, celebratory quality'
          ],
          astrologicalAffinities: {
            planets: ['Venus', 'Jupiter'],
            signs: ['Taurus', 'Leo'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Taurus', 'Leo'],
          numberOfServings: 3
        }
      ]
    },
    lunch: {
      all: [
        {
          id: 'croque-monsieur',
          name: 'Classic Croque Monsieur',
          description:
            'The quintessential French grilled ham and cheese sandwich, elevated with creamy béchamel sauce',
          cuisine: 'french',
          cookingMethods: ['sautéing', 'broiling', 'sauce-making'],
          tools: ['saucepan', 'whisk', 'baking sheet', 'grater', 'pastry brush'],
          preparationSteps: [
            'Prepare béchamel sauce',
            'Toast bread slices lightly',
            'Layer ham and cheese',
            'Spread béchamel on top',
            'Add additional cheese',
            'Broil until golden and bubbly',
            'Garnish with fresh herbs'
          ],
          instructions: [
            'Prepare béchamel sauce',
            'Toast bread slices lightly',
            'Layer ham and cheese',
            'Spread béchamel on top',
            'Add additional cheese',
            'Broil until golden and bubbly',
            'Garnish with fresh herbs'
          ],
          substitutions: {
            'white ham': ['vegetarian ham', 'smoked turkey'],
            'Gruyère cheese': ['Emmental', 'Swiss cheese'],
            'white sandwich bread': ['gluten-free bread']
          },
          servingSize: 2,
          allergens: ['dairy', 'gluten', 'eggs'],
          prepTime: '15 minutes',
          cookTime: '10 minutes',
          culturalNotes:
            'A café classic that emerged in Paris in the early 1900s. Add a fried egg on top and it becomes a 'Croque Madame'',
          pairingSuggestions: ['green salad', 'cornichons', 'Dijon mustard'],
          dietaryInfo: ['contains pork'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'white sandwich bread', amount: 4, unit: 'slices', category: 'bread' }
            { name: 'white ham', amount: 200, unit: 'g', category: 'charcuterie' }
            { name: 'Gruyère cheese', amount: 200, unit: 'g', category: 'cheese' }
            { name: 'béchamel sauce', amount: 200, unit: 'ml', category: 'sauce' }
            { name: 'unsalted butter', amount: 30, unit: 'g', category: 'dairy' }
            { name: 'nutmeg', amount: 1, unit: 'pinch', category: 'spice' }
          ],
          nutrition: {
            calories: 680,
            protein: 42,
            carbs: 45,
            fat: 38,
            vitamins: ['B12', 'D', 'A'],
            minerals: ['Calcium', 'Iron']
          },
          timeToMake: '25 minutes',
          season: ['all'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.3,
            Earth: 0.4,
            Water: 0.2,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Taurus - The sensuous, indulgent nature',
            'Venus - The harmonious balance of flavors'
          ],
          astrologicalAffinities: {
            planets: ['Taurus', 'Venus'],
            signs: ['Taurus', 'Virgo'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Taurus', 'Virgo'],
          numberOfServings: 2
        }
        {
          id: 'nicoise-salad',
          name: 'Niçoise Salad',
          description: 'Classic Mediterranean salad from Nice with tuna, olives, and vegetables',
          cuisine: 'french',
          cookingMethods: ['boiling', 'assembling'],
          tools: ['large bowl', 'saucepan', 'colander', 'sharp knife', 'serving platter'],
          preparationSteps: [
            'Boil eggs until hard-cooked',
            'Cook green beans until tender-crisp',
            'Quarter tomatoes and arrange on platter',
            'Add tuna, olives, and anchovies',
            'Arrange eggs and vegetables',
            'Drizzle with vinaigrette',
            'Garnish with fresh herbs'
          ],
          instructions: [
            'Boil eggs until hard-cooked',
            'Cook green beans until tender-crisp',
            'Quarter tomatoes and arrange on platter',
            'Add tuna, olives, and anchovies',
            'Arrange eggs and vegetables',
            'Drizzle with vinaigrette',
            'Garnish with fresh herbs'
          ],
          substitutions: {
            tuna: ['marinated tempeh', 'chickpeas'],
            anchovies: ['capers', 'black olives'],
            eggs: ['firm tofu']
          },
          servingSize: 4,
          allergens: ['eggs', 'fish'],
          prepTime: '20 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'Originally from Nice, this salad represents the essence of Provençal cuisine',
          pairingSuggestions: ['crusty baguette', 'rosé wine', 'aioli'],
          dietaryInfo: ['gluten-free'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'oil-packed tuna', amount: 200, unit: 'g', category: 'protein' }
            { name: 'green beans', amount: 200, unit: 'g', category: 'vegetable' }
            { name: 'tomatoes', amount: 4, unit: 'medium', category: 'vegetable' }
            { name: 'eggs', amount: 4, unit: 'large', category: 'protein' }
            { name: 'Niçoise olives', amount: 100, unit: 'g', category: 'garnish' }
            { name: 'anchovies', amount: 8, unit: 'fillets', category: 'fish' }
            { name: 'vinaigrette', amount: 120, unit: 'ml', category: 'dressing' }
          ],
          nutrition: {
            calories: 420,
            protein: 28,
            carbs: 18,
            fat: 32,
            vitamins: ['D', 'B12', 'K'],
            minerals: ['Iron', 'Omega-3']
          },
          timeToMake: '35 minutes',
          season: ['spring', 'summer'],
          mealType: ['lunch'],
          elementalProperties: {
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.2
          },
          astrologicalInfluences: [
            'Mercury - The light, fresh quality',
            'Neptune - The Mediterranean sea influence'
          ],
          astrologicalAffinities: {
            planets: ['Mercury', 'Neptune'],
            signs: ['Gemini', 'Pisces'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Gemini', 'Pisces'],
          numberOfServings: 4
        }
        {
          id: 'french-onion-soup',
          name: 'French Onion Soup',
          description: 'Rich onion soup topped with toasted bread and melted Gruyère cheese',
          cuisine: 'french',
          cookingMethods: ['caramelizing', 'simmering', 'broiling'],
          tools: ['large pot', 'wooden spoon', 'ladle', 'oven-safe bowls', 'broiler'],
          preparationSteps: [
            'Slice onions thinly',
            'Caramelize onions slowly in butter (30-40 minutes)',
            'Add flour and cook briefly',
            'Add wine and reduce by half',
            'Add broth and simmer for 30 minutes',
            'Toast bread slices',
            'Ladle soup into bowls, top with bread and cheese',
            'Broil until cheese is golden and bubbly'
          ],
          instructions: [
            'Slice onions thinly',
            'Caramelize onions slowly in butter (30-40 minutes)',
            'Add flour and cook briefly',
            'Add wine and reduce by half',
            'Add broth and simmer for 30 minutes',
            'Toast bread slices',
            'Ladle soup into bowls, top with bread and cheese',
            'Broil until cheese is golden and bubbly'
          ],
          substitutions: {
            'beef stock': ['vegetable stock'],
            'Gruyère cheese': ['Emmental', 'plant-based cheese'],
            butter: ['olive oil']
          },
          servingSize: 6,
          allergens: ['dairy', 'gluten'],
          prepTime: '20 minutes',
          cookTime: '70 minutes',
          culturalNotes:
            'Originally a peasant dish, this soup became a French classic. Traditional Parisian versions use beef stock and lots of sweet onions',
          pairingSuggestions: ['red wine', 'crusty bread', 'green salad'],
          dietaryInfo: ['vegetarian option'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'yellow onions', amount: 1, unit: 'kg', category: 'vegetable' }
            { name: 'beef stock', amount: 1.5, unit: 'L', category: 'broth' }
            { name: 'baguette', amount: 0.5, unit: 'piece', category: 'bread' }
            { name: 'Gruyère cheese', amount: 200, unit: 'g', category: 'cheese' }
            { name: 'butter', amount: 50, unit: 'g', category: 'dairy' }
            { name: 'dry white wine', amount: 200, unit: 'ml', category: 'wine' }
            { name: 'fresh thyme', amount: 4, unit: 'sprigs', category: 'herb' }
            { name: 'bay leaf', amount: 1, unit: 'piece', category: 'herb' }
            { name: 'all-purpose flour', amount: 2, unit: 'tbsp', category: 'thickener' }
          ],
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 45,
            fat: 22,
            vitamins: ['C', 'B1'],
            minerals: ['Iron', 'Calcium']
          },
          timeToMake: '90 minutes',
          season: ['autumn', 'winter'],
          mealType: ['lunch', 'dinner'],
          elementalProperties: {
            Fire: 0.4,
            Earth: 0.3,
            Water: 0.2,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Saturn - The slow transformation of ingredients',
            'Moon - The comforting, nurturing quality'
          ],
          astrologicalAffinities: {
            planets: ['Saturn', 'Moon'],
            signs: ['Capricorn', 'Cancer'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Capricorn', 'Cancer'],
          numberOfServings: 6
        }
      ]
    },
    dinner: {
      all: [
        {
          id: 'coq-au-vin',
          name: 'Coq au Vin',
          description: 'Classic French chicken braised in red wine with mushrooms and lardons',
          cuisine: 'french',
          cookingMethods: ['braising', 'sautéing'],
          tools: ['Dutch oven', 'tongs', 'wooden spoon', 'chef's knife', 'kitchen twine'],
          preparationSteps: [
            'Pat chicken pieces dry and season',
            'Render fat from lardons in Dutch oven',
            'Brown chicken in batches',
            'Sauté mushrooms and pearl onions',
            'Deglaze with cognac (optional flame)',
            'Add wine, stock, and herbs',
            'Simmer until chicken is tender',
            'Thicken sauce with beurre manié',
            'Adjust seasoning and serve'
          ],
          instructions: [
            'Pat chicken pieces dry and season',
            'Render fat from lardons in Dutch oven',
            'Brown chicken in batches',
            'Sauté mushrooms and pearl onions',
            'Deglaze with cognac (optional flame)',
            'Add wine, stock, and herbs',
            'Simmer until chicken is tender',
            'Thicken sauce with beurre manié',
            'Adjust seasoning and serve'
          ],
          substitutions: {
            chicken: ['mushroom medley', 'seitan'],
            lardons: ['smoked tofu'],
            'red wine': ['mushroom stock with red wine vinegar']
          },
          servingSize: 6,
          allergens: ['alcohol'],
          prepTime: '30 minutes',
          cookTime: '90 minutes',
          culturalNotes:
            'A rustic dish from Burgundy that has been elevated to haute cuisine. Julia Child helped popularize it in America',
          pairingSuggestions: ['Burgundy wine', 'crusty bread', 'mashed potatoes'],
          dietaryInfo: ['contains alcohol', 'contains pork'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'chicken', amount: 1, unit: 'whole cut into 8 pieces', category: 'protein' }
            { name: 'lardons', amount: 200, unit: 'g', category: 'protein' }
            { name: 'red wine', amount: 750, unit: 'ml', category: 'wine' }
            { name: 'cremini mushrooms', amount: 500, unit: 'g', category: 'vegetable' }
            { name: 'pearl onions', amount: 12, unit: 'small', category: 'vegetable' }
            { name: 'carrots', amount: 4, unit: 'whole', category: 'vegetable' }
            { name: 'bouquet garni', amount: 1, unit: 'piece', category: 'herb' }
            { name: 'cognac', amount: 60, unit: 'ml', category: 'spirit', optional: true }
          ],
          nutrition: {
            calories: 520,
            protein: 45,
            carbs: 12,
            fat: 32,
            vitamins: ['B12', 'A', 'D'],
            minerals: ['Iron', 'Zinc', 'Potassium']
          },
          timeToMake: '120 minutes',
          season: ['autumn', 'winter'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.5,
            Fire: 0.3,
            Water: 0.15,
            Air: 0.05
          },
          astrologicalInfluences: [
            'Saturn - The slow transformation through long cooking',
            'Pluto - The deep flavors revealed through reduction'
          ],
          astrologicalAffinities: {
            planets: ['Saturn', 'Pluto'],
            signs: ['Capricorn', 'Scorpio'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Capricorn', 'Scorpio'],
          numberOfServings: 6
        }
        {
          id: 'sole-meuniere',
          name: 'Sole Meunière',
          description: 'Classic pan-fried sole with brown butter, lemon and parsley',
          cuisine: 'french',
          cookingMethods: ['pan-frying', 'sauce-making'],
          tools: ['large skillet', 'fish spatula', 'small saucepan', 'sieve', 'serving platter'],
          preparationSteps: [
            'Pat sole fillets dry',
            'Season with salt and pepper',
            'Dredge sole in flour, shaking off excess',
            'Heat butter in skillet until foaming',
            'Cook fish until golden, about 2 minutes per side',
            'Transfer to warm platter',
            'Make brown butter sauce in pan',
            'Add lemon juice and parsley',
            'Pour sauce over fish',
            'Serve immediately with lemon wedges'
          ],
          instructions: [
            'Pat sole fillets dry',
            'Season with salt and pepper',
            'Dredge sole in flour, shaking off excess',
            'Heat butter in skillet until foaming',
            'Cook fish until golden, about 2 minutes per side',
            'Transfer to warm platter',
            'Make brown butter sauce in pan',
            'Add lemon juice and parsley',
            'Pour sauce over fish',
            'Serve immediately with lemon wedges'
          ],
          substitutions: {
            sole: ['flounder', 'eggplant for vegetarian version'],
            butter: ['plant-based brown butter'],
            flour: ['gluten-free flour']
          },
          servingSize: 4,
          allergens: ['fish', 'dairy', 'gluten'],
          prepTime: '10 minutes',
          cookTime: '15 minutes',
          culturalNotes:
            'This dish famously converted Julia Child to French cuisine when she first tasted it in Rouen',
          pairingSuggestions: ['white Burgundy wine', 'steamed vegetables', 'boiled potatoes'],
          dietaryInfo: ['contains fish'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'sole fillets', amount: 800, unit: 'g', category: 'protein' }
            { name: 'all-purpose flour', amount: 100, unit: 'g', category: 'flour' }
            { name: 'unsalted butter', amount: 150, unit: 'g', category: 'dairy' }
            { name: 'lemon', amount: 2, unit: 'whole', category: 'fruit' }
            { name: 'flat-leaf parsley', amount: 30, unit: 'g', category: 'herb' }
            { name: 'sea salt', amount: 0, unit: 'to taste', category: 'seasoning' }
            { name: 'white pepper', amount: 0, unit: 'to taste', category: 'seasoning' }
          ],
          nutrition: {
            calories: 480,
            protein: 45,
            carbs: 12,
            fat: 32,
            vitamins: ['D', 'B12', 'A'],
            minerals: ['Selenium', 'Iodine']
          },
          timeToMake: '25 minutes',
          season: ['all'],
          mealType: ['dinner'],
          elementalProperties: {
            Water: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Earth: 0.1
          },
          astrologicalInfluences: [
            'Jupiter - The elegance and richness',
            'Mercury - The bright, quick quality'
          ],
          astrologicalAffinities: {
            planets: ['Jupiter', 'Mercury'],
            signs: ['Leo', 'Gemini'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Leo', 'Gemini'],
          numberOfServings: 4
        }
        {
          id: 'beef-bourguignon',
          name: 'Beef Bourguignon',
          description:
            'Classic Burgundian beef stew braised in red wine with pearl onions and mushrooms',
          cuisine: 'french',
          cookingMethods: ['braising', 'sautéing', 'reducing'],
          tools: ['Dutch oven', 'strainer', 'kitchen twine', 'cheesecloth', 'wooden spoon'],
          preparationSteps: [
            'Cut beef into 2-inch cubes and dry thoroughly',
            'Cook lardons until crisp, set aside',
            'Brown beef in batches in the rendered fat',
            'Sauté carrots and onion',
            'Deglaze with wine, scraping up browned bits',
            'Add beef stock, bouquet garni, tomato paste',
            'Simmer covered in 325°F oven for 2-3 hours',
            'Meanwhile, brown mushrooms and pearl onions separately',
            'Add to stew for final 30 minutes of cooking',
            'Thicken sauce if desired with beurre manié'
          ],
          instructions: [
            'Cut beef into 2-inch cubes and dry thoroughly',
            'Cook lardons until crisp, set aside',
            'Brown beef in batches in the rendered fat',
            'Sauté carrots and onion',
            'Deglaze with wine, scraping up browned bits',
            'Add beef stock, bouquet garni, tomato paste',
            'Simmer covered in 325°F oven for 2-3 hours',
            'Meanwhile, brown mushrooms and pearl onions separately',
            'Add to stew for final 30 minutes of cooking',
            'Thicken sauce if desired with beurre manié'
          ],
          ingredients: [
            { name: 'beef chuck', amount: 1.5, unit: 'kg', category: 'protein' }
            { name: 'lardons', amount: 200, unit: 'g', category: 'protein' }
            { name: 'red wine', amount: 750, unit: 'ml', category: 'wine' }
            { name: 'beef stock', amount: 500, unit: 'ml', category: 'broth' }
            { name: 'pearl onions', amount: 250, unit: 'g', category: 'vegetable' }
            { name: 'cremini mushrooms', amount: 500, unit: 'g', category: 'vegetable' }
            { name: 'carrots', amount: 3, unit: 'medium', category: 'vegetable' }
            { name: 'yellow onion', amount: 1, unit: 'large', category: 'vegetable' }
            { name: 'garlic', amount: 4, unit: 'cloves', category: 'vegetable' }
            { name: 'tomato paste', amount: 2, unit: 'tbsp', category: 'condiment' }
            { name: 'bouquet garni', amount: 1, unit: 'piece', category: 'herb' }
            { name: 'bacon or pancetta', amount: 150, unit: 'g', category: 'protein' }
            { name: 'butter', amount: 30, unit: 'g', category: 'dairy' }
            { name: 'all-purpose flour', amount: 3, unit: 'tbsp', category: 'thickener' }
            { name: 'thyme', amount: 4, unit: 'sprigs', category: 'herb' }
            { name: 'bay leaf', amount: 2, unit: 'pieces', category: 'herb' }
          ],
          numberOfServings: 6,
          allergens: ['alcohol'],
          prepTime: '45 minutes',
          cookTime: '3 hours',
          culturalNotes:
            'The epitome of French country cooking, this dish represents the marriage of wine and food culture in Burgundy',
          pairingSuggestions: ['Burgundy red wine', 'crusty bread', 'mashed potatoes'],
          dietaryInfo: ['contains alcohol', 'contains pork'],
          spiceLevel: 'none',
          nutrition: {
            calories: 620,
            protein: 52,
            carbs: 18,
            fat: 38,
            vitamins: ['B12', 'A', 'D'],
            minerals: ['Iron', 'Zinc', 'Potassium']
          },
          timeToMake: '3 hours 45 minutes',
          season: ['autumn', 'winter'],
          mealType: ['dinner'],
          elementalProperties: {
            Earth: 0.6,
            Fire: 0.2,
            Water: 0.1,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Saturn - The slow cooking process and aged flavors',
            'Pluto - The transformative quality and depth'
          ],
          astrologicalAffinities: {
            planets: ['Saturn', 'Pluto'],
            signs: ['Capricorn', 'Scorpio'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Capricorn', 'Scorpio']
        }
      ]
    },
    dessert: {
      all: [
        {
          id: 'creme-brulee',
          name: 'Classic Crème Brûlée',
          description: 'Traditional vanilla custard with caramelized sugar crust',
          cuisine: 'french',
          cookingMethods: ['baking', 'caramelizing'],
          tools: ['ramekins', 'baking dish', 'kitchen torch', 'whisk', 'fine strainer'],
          preparationSteps: [
            'Preheat oven to 325°F/165°C',
            'Heat cream with vanilla bean',
            'Whisk egg yolks with sugar',
            'Temper eggs with hot cream',
            'Strain mixture into ramekins',
            'Bake in water bath for 30-35 minutes',
            'Chill thoroughly (at least 4 hours)',
            'Sprinkle thin layer of sugar on top',
            'Caramelize with torch or under broiler',
            'Let caramel harden before serving'
          ],
          substitutions: {
            'heavy cream': ['coconut cream', 'almond cream'],
            'egg yolks': ['plant-based substitute'],
            sugar: ['coconut sugar']
          },
          servingSize: 6,
          allergens: ['dairy', 'eggs'],
          prepTime: '20 minutes',
          cookTime: '35 minutes',
          culturalNotes:
            'A classic French dessert dating back to the 17th century, the name means 'burnt cream'',
          pairingSuggestions: ['fresh berries', 'dessert wine', 'coffee'],
          dietaryInfo: ['vegetarian', 'gluten-free'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'heavy cream', amount: 500, unit: 'ml', category: 'dairy' }
            { name: 'egg yolks', amount: 6, unit: 'large', category: 'protein' }
            { name: 'granulated sugar', amount: 100, unit: 'g', category: 'sweetener' }
            { name: 'vanilla bean', amount: 1, unit: 'piece', category: 'spice' }
            { name: 'sugar for caramelizing', amount: 60, unit: 'g', category: 'sweetener' }
          ],
          nutrition: {
            calories: 380,
            protein: 6,
            carbs: 28,
            fat: 29,
            vitamins: ['A', 'D', 'E'],
            minerals: ['Calcium']
          },
          timeToMake: '55 minutes plus chilling',
          season: ['all'],
          mealType: ['dessert'],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Venus - The sensual, creamy nature',
            'Sun - The fire element in caramelization'
          ],
          astrologicalAffinities: {
            planets: ['Venus', 'Sun'],
            signs: ['Taurus', 'Leo'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Taurus', 'Leo'],
          instructions: [
            'Preheat oven to 325°F/165°C',
            'Heat cream with vanilla bean',
            'Whisk egg yolks with sugar',
            'Temper eggs with hot cream',
            'Strain mixture into ramekins',
            'Bake in water bath for 30-35 minutes',
            'Chill thoroughly (at least 4 hours)',
            'Sprinkle thin layer of sugar on top',
            'Caramelize with torch or under broiler',
            'Let caramel harden before serving'
          ]
        }
        {
          id: 'tarte-tatin',
          name: 'Tarte Tatin',
          description: 'Upside-down caramelized apple tart',
          cuisine: 'french',
          cookingMethods: ['caramelizing', 'baking', 'pastry-making'],
          tools: [
            'heavy-bottomed tatin pan or cast iron skillet',
            'rolling pin',
            'paring knife',
            'serving plate',
            'pastry brush'
          ],
          preparationSteps: [
            'Prepare pastry dough and chill',
            'Peel, core, and quarter apples',
            'Make caramel in pan',
            'Arrange apples in tight pattern',
            'Cook until apples are partly caramelized',
            'Cover with pastry dough',
            'Bake until golden brown',
            'Cool slightly and invert onto plate'
          ],
          ingredients: [
            { name: 'apples', amount: 8, unit: 'large', category: 'fruit' }
            { name: 'unsalted butter', amount: 150, unit: 'g', category: 'dairy' }
            { name: 'granulated sugar', amount: 150, unit: 'g', category: 'sweetener' }
            { name: 'shortcrust pastry', amount: 1, unit: 'piece', category: 'pastry' }
          ],
          substitutions: {
            apples: ['pears', 'quinces'],
            butter: ['plant-based butter'],
            'shortcrust pastry': ['puff pastry']
          },
          servingSize: 8,
          allergens: ['dairy', 'gluten'],
          prepTime: '45 minutes',
          cookTime: '45 minutes',
          culturalNotes:
            'Created accidentally at Hotel Tatin in Lamotte-Beuvron when Stéphanie Tatin tried to rescue an overcooked apple pie by putting the pastry on top',
          pairingSuggestions: ['crème fraîche', 'vanilla ice cream', 'Sauternes wine', 'Calvados'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          nutrition: {
            calories: 385,
            protein: 4,
            carbs: 48,
            fat: 22,
            vitamins: ['A', 'C'],
            minerals: ['Iron', 'Calcium']
          },
          season: ['autumn', 'winter'],
          mealType: ['dessert'],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Water: 0.2,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Venus - The sweet, indulgent nature',
            'Jupiter - The transformative quality'
          ],
          astrologicalAffinities: {
            planets: ['Venus', 'Jupiter'],
            signs: ['Taurus', 'Virgo'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Taurus', 'Virgo'],
          instructions: [
            'Prepare pastry dough and chill',
            'Peel, core, and quarter apples',
            'Make caramel in pan',
            'Arrange apples in tight pattern',
            'Cook until apples are partly caramelized',
            'Cover with pastry dough',
            'Bake until golden brown',
            'Cool slightly and invert onto plate'
          ],
          timeToMake: '90 minutes'
        }
        {
          id: 'chocolate-profiteroles',
          name: 'Chocolate Profiteroles',
          description:
            'Choux pastry puffs filled with vanilla ice cream and topped with warm chocolate sauce',
          cuisine: 'french',
          cookingMethods: ['baking', 'piping', 'sauce-making'],
          tools: ['saucepan', 'piping bags', 'baking sheets', 'whisk', 'double boiler'],
          preparationSteps: [
            'Make choux pastry dough',
            'Pipe onto baking sheets',
            'Bake until hollow and crisp',
            'Prepare chocolate sauce',
            'Cut pastry puffs in half',
            'Fill with small scoops of ice cream',
            'Serve with warm chocolate sauce'
          ],
          substitutions: {
            'vanilla ice cream': ['coconut ice cream', 'sorbet'],
            'dark chocolate': ['vegan chocolate'],
            butter: ['plant-based butter']
          },
          servingSize: 6,
          allergens: ['dairy', 'eggs', 'gluten'],
          prepTime: '45 minutes',
          cookTime: '30 minutes',
          culturalNotes:
            'A classic French dessert that showcases three distinct pastry, techniques: choux, ice cream making, and sauce preparation',
          pairingSuggestions: ['espresso', 'vanilla ice cream', 'fresh berries'],
          dietaryInfo: ['vegetarian'],
          spiceLevel: 'none',
          ingredients: [
            { name: 'choux pastry', amount: 1, unit: 'batch', category: 'pastry' }
            { name: 'vanilla ice cream', amount: 500, unit: 'ml', category: 'dairy' }
            { name: 'dark chocolate', amount: 200, unit: 'g', category: 'chocolate' }
            { name: 'heavy cream', amount: 200, unit: 'ml', category: 'dairy' }
            { name: 'sugar', amount: 50, unit: 'g', category: 'sweetener' }
          ],
          nutrition: {
            calories: 450,
            protein: 8,
            carbs: 48,
            fat: 26,
            vitamins: ['A', 'D'],
            minerals: ['Calcium', 'Iron']
          },
          timeToMake: '75 minutes',
          season: ['all'],
          mealType: ['dessert'],
          elementalProperties: {
            Earth: 0.3,
            Water: 0.3,
            Fire: 0.3,
            Air: 0.1
          },
          astrologicalInfluences: [
            'Venus - The indulgent, sweet quality',
            'Jupiter - The expansive, celebratory nature'
          ],
          astrologicalAffinities: {
            planets: ['Venus', 'Jupiter'],
            signs: ['Taurus', 'Leo'],
            lunarPhases: ['First Quarter', 'Full Moon']
          },
          lunarPhaseInfluences: ['First Quarter', 'Full Moon'],
          zodiacInfluences: ['Taurus', 'Leo'],
          instructions: [
            'Make choux pastry dough',
            'Pipe onto baking sheets',
            'Bake until hollow and crisp',
            'Prepare chocolate sauce',
            'Cut pastry puffs in half',
            'Fill with small scoops of ice cream',
            'Serve with warm chocolate sauce'
          ],
          numberOfServings: 6
        }
      ]
    }
  },
  cookingTechniques: [
    {
      name: 'Sauté',
      description: 'Quick cooking in a small amount of fat over high heat',
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0 }
      toolsRequired: ['sauté pan', 'wooden spoon', 'tongs'],
      bestFor: ['vegetables', 'tender cuts of meat', 'fish fillets'],
      difficulty: 'easy'
    }
    {
      name: 'Braise',
      description: 'Slow cooking in liquid after browning, usually covered',
      elementalProperties: { Water: 0.5, Earth: 0.3, Fire: 0.2, Air: 0 }
      toolsRequired: ['Dutch oven', 'tongs', 'wooden spoon'],
      bestFor: ['tough cuts of meat', 'root vegetables', 'legumes'],
      difficulty: 'medium'
    }
    {
      name: 'Flambé',
      description: 'Igniting food with alcohol for flavor and visual effect',
      elementalProperties: { Fire: 0.8, Air: 0.1, Earth: 0.1, Water: 0 }
      toolsRequired: ['skillet', 'long match or lighter', 'long-handled utensils'],
      bestFor: ['desserts', 'proteins', 'sauces'],
      difficulty: 'hard'
    }
    {
      name: 'En Papillote',
      description: 'Cooking in a sealed parchment paper packet',
      elementalProperties: { Water: 0.4, Air: 0.4, Earth: 0.1, Fire: 0.1 }
      toolsRequired: ['parchment paper', 'baking sheet', 'scissors'],
      bestFor: ['fish', 'vegetables', 'delicate proteins'],
      difficulty: 'medium'
    }
    {
      name: 'Sous Vide',
      description: 'Cooking vacuum-sealed food in a temperature-controlled water bath',
      elementalProperties: { Water: 0.7, Air: 0.1, Earth: 0.1, Fire: 0.1 }
      toolsRequired: ['sous vide immersion circulator', 'vacuum sealer', 'container'],
      bestFor: ['proteins', 'eggs', 'vegetables'],
      difficulty: 'hard'
    }
  ],
  regionalCuisines: {
    provence: {
      name: 'Provençal Cuisine',
      description:
        'Mediterranean-influenced cuisine from Southern France, featuring olive oil, herbs, tomatoes, and seafood',
      signature: ['bouillabaisse', 'ratatouille', 'tapenade', 'aioli'],
      elementalProperties: { Fire: 0.3, Earth: 0.3, Water: 0.3, Air: 0.1 }
      astrologicalInfluences: ['Sun', 'Mercury', 'Venus'],
      seasonality: 'summer'
    },
    normandy: {
      name: 'Norman Cuisine',
      description:
        'Butter and cream-based cuisine from Northern France, featuring apples, dairy, and seafood',
      signature: ['calvados', 'camembert', 'tarte aux pommes', 'tripes à la mode de Caen'],
      elementalProperties: { Water: 0.4, Earth: 0.4, Fire: 0.1, Air: 0.1 }
      astrologicalInfluences: ['Moon', 'Venus', 'Neptune'],
      seasonality: 'autumn'
    },
    burgundy: {
      name: 'Burgundian Cuisine',
      description: 'Wine-centric cuisine known for slow-cooked dishes, mustard, and escargot',
      signature: ['beef bourguignon', 'coq au vin', 'escargots de Bourgogne', 'jambon persillé'],
      elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.2, Air: 0.1 }
      astrologicalInfluences: ['Saturn', 'Mars', 'Pluto'],
      seasonality: 'winter'
    },
    alsace: {
      name: 'Alsatian Cuisine',
      description: 'German-influenced cuisine featuring charcuterie, sauerkraut, and white wines',
      signature: ['choucroute garnie', 'tarte flambée', 'baeckeoffe', 'kugelhopf'],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 }
      astrologicalInfluences: ['Jupiter', 'Saturn', 'Uranus'],
      seasonality: 'autumn, winter'
    }
  },
  elementalProperties: {
    Earth: 0.3,
    Water: 0.3,
    Fire: 0.2,
    Air: 0.2
  },
  astrologicalInfluences: [
    'Venus - Governs the sensual, pleasure-seeking aspects of French cuisine',
    'Jupiter - Influences the celebratory and abundant nature of French dining',
    'Mercury - Shapes the precise techniques and articulate presentation'
  ]
}

export default french,
