export const italian = {
    id: "italian",
    name: "Italian",
    description: "Traditional Italian cuisine emphasizing fresh ingredients, regional specialties, and time-honored techniques",
    dishes: {
        breakfast: {
            all: [
                {
                    id: "cornetto-e-cappuccino",
                    name: "Cornetto e Cappuccino",
                    description: "Italian-style croissant served with frothy coffee",
                    cuisine: "Italian",
                    cookingMethods: ["baking", "coffee-brewing"],
                    tools: [
                        "oven",
                        "espresso machine",
                        "milk frother",
                        "baking sheet"
                    ],
                    preparationSteps: [
                        "Bake cornetto until golden",
                        "Brew espresso",
                        "Steam and froth milk",
                        "Combine espresso and milk for cappuccino",
                        "Serve cornetto warm"
                    ],
                    instructions: [
                        "Bake cornetto until golden",
                        "Brew espresso",
                        "Steam and froth milk",
                        "Combine espresso and milk for cappuccino",
                        "Serve cornetto warm"
                    ],
                    ingredients: [
                        { name: "cornetto", amount: "1", unit: "piece", category: "pastry", swaps: ["whole grain cornetto"] },
                        { name: "coffee beans", amount: "18", unit: "g", category: "beverage" },
                        { name: "milk", amount: "120", unit: "ml", category: "dAiry", swaps: ["oat milk", "almond milk"] }
                    ],
                    substitutions: {
                        "milk": ["oat milk", "almond milk", "soy milk"],
                        "cornetto": ["whole grain cornetto", "gluten-free pastry"]
                    },
                    servingSize: 1,
                    allergens: ["gluten", "dAiry", "eggs"],
                    prepTime: "5 minutes",
                    cookTime: "3 minutes",
                    culturalNotes: "The traditional Italian breakfast, enjoyed standing at cafe counters across Italy",
                    pAiringSuggestions: ["fresh orange juice", "fruit preserves"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 280,
                        protein: 8,
                        carbs: 42,
                        fat: 12,
                        vitamins: ["B12", "D"],
                        minerals: ["Calcium"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"],
                    astrologicalAffinities: {
                        planets: ["Venus", "Mercury"],
                        signs: ["taurus", "libra"],
                        lunarPhases: ["New moon", "First Quarter"]
                    },
                    lunarPhaseInfluences: ["New moon", "First Quarter"],
                    zodiacInfluences: ["taurus", "libra"]
                },
                {
                    name: "Maritozzo con Panna",
                    description: "Roman sweet bun filled with whipped cream",
                    cuisine: "Italian",
                    cookingMethods: ["whipping", "filling"],
                    tools: [
                        "mixing bowl",
                        "whisk",
                        "piping bag",
                        "serving plate"
                    ],
                    preparationSteps: [
                        "Whip cream with sugar",
                        "Slice maritozzo bun",
                        "Fill with whipped cream",
                        "Dust with powdered sugar",
                        "Serve immediately"
                    ],
                    ingredients: [
                        { name: "maritozzo", amount: "1", unit: "piece", category: "pastry", swaps: ["gluten-free bun"] },
                        { name: "whipped cream", amount: "100", unit: "g", category: "dAiry", swaps: ["coconut whipped cream"] },
                        { name: "powdered sugar", amount: "1", unit: "tsp", category: "sweetener" },
                        { name: "espresso", amount: "30", unit: "ml", category: "beverage" }
                    ],
                    substitutions: {
                        "maritozzo": ["gluten-free bun", "brioche bun"],
                        "whipped cream": ["coconut whipped cream", "cashew cream"],
                        "powdered sugar": ["monk fruit sweetener", "stevia"]
                    },
                    servingSize: 1,
                    allergens: ["gluten", "dAiry"],
                    prepTime: "10 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "A beloved Roman breakfast pastry, traditionally enjoyed in the morning with coffee",
                    pAiringSuggestions: ["espresso", "cappuccino", "fresh berries"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 350,
                        protein: 6,
                        carbs: 45,
                        fat: 18,
                        vitamins: ["A", "D"],
                        minerals: ["Calcium"]
                    },
                    season: ["all"],
                    mealType: ["breakfast", "dessert"]
                },
                {
                    name: "Fette Biscottate con Marmellata",
                    description: "Crisp toast with jam and coffee",
                    cuisine: "Italian",
                    cookingMethods: ["toasting", "spreading"],
                    tools: [
                        "toaster",
                        "butter knife",
                        "serving plate",
                        "espresso maker"
                    ],
                    preparationSteps: [
                        "Toast fette biscottate",
                        "Spread with butter",
                        "Top with jam",
                        "Serve with espresso"
                    ],
                    ingredients: [
                        { name: "fette biscottate", amount: "3", unit: "pieces", category: "bread", swaps: ["gluten-free toast"] },
                        { name: "jam", amount: "30", unit: "g", category: "spread" },
                        { name: "butter", amount: "15", unit: "g", category: "dAiry", swaps: ["plant butter"] },
                        { name: "espresso", amount: "30", unit: "ml", category: "beverage" }
                    ],
                    substitutions: {
                        "butter": ["plant butter", "olive oil"],
                        "fette biscottate": ["gluten-free toast", "regular toast"]
                    },
                    servingSize: 1,
                    allergens: ["gluten", "dAiry"],
                    prepTime: "5 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "A simple, traditional Italian breakfast that's light and quick",
                    pAiringSuggestions: ["espresso", "fresh fruit"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 280,
                        protein: 6,
                        carbs: 45,
                        fat: 10,
                        vitamins: ["A", "D"],
                        minerals: ["Iron"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"]
                }
            ],
            summer: [
                {
                    name: "Granita con Brioche",
                    description: "Sicilian ice granita with soft brioche",
                    cuisine: "Italian",
                    cookingMethods: ["freezing", "scraping", "serving"],
                    tools: [
                        "shallow pan",
                        "fork",
                        "serving glass",
                        "ice cream scoop"
                    ],
                    preparationSteps: [
                        "Freeze almond mixture",
                        "Scrape with fork periodically",
                        "Warm brioche slightly",
                        "Serve granita in glass",
                        "Top with whipped cream",
                        "Serve with brioche on side"
                    ],
                    ingredients: [
                        { name: "almond granita", amount: "200", unit: "ml", category: "ice" },
                        { name: "brioche", amount: "1", unit: "piece", category: "pastry", swaps: ["gluten-free brioche"] },
                        { name: "whipped cream", amount: "30", unit: "g", category: "dAiry", swaps: ["coconut whipped cream"] }
                    ],
                    substitutions: {
                        "brioche": ["gluten-free brioche", "croissant"],
                        "whipped cream": ["coconut whipped cream", "almond cream"]
                    },
                    servingSize: 1,
                    allergens: ["dAiry", "gluten", "nuts"],
                    prepTime: "5 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "Traditional Sicilian summer breakfast, especially popular in Catania and Messina",
                    pAiringSuggestions: ["espresso", "fresh fruit"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 9,
                        carbs: 52,
                        fat: 16,
                        vitamins: ["A", "D", "E"],
                        minerals: ["Calcium"]
                    },
                    season: ["summer"],
                    mealType: ["breakfast"]
                },
                {
                    name: "Ricotta e Fichi",
                    description: "Fresh ricotta with figs and honey",
                    cuisine: "Italian",
                    cookingMethods: ["assembling"],
                    tools: [
                        "serving bowl",
                        "honey dipper",
                        "knife",
                        "spoon"
                    ],
                    preparationSteps: [
                        "Place ricotta in serving bowl",
                        "Quarter fresh figs",
                        "Arrange figs around ricotta",
                        "Drizzle with honey",
                        "Sprinkle with pistachios"
                    ],
                    ingredients: [
                        { name: "ricotta", amount: "200", unit: "g", category: "dAiry", swaps: ["almond ricotta"] },
                        { name: "fresh figs", amount: "4", unit: "whole", category: "fruit" },
                        { name: "honey", amount: "2", unit: "tbsp", category: "sweetener" },
                        { name: "pistachios", amount: "30", unit: "g", category: "nuts" }
                    ],
                    substitutions: {
                        "ricotta": ["almond ricotta", "cashew ricotta"],
                        "honey": ["agave nectar", "maple syrup"]
                    },
                    servingSize: 2,
                    allergens: ["dAiry", "nuts"],
                    prepTime: "5 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "A simple summer breakfast that showcases Italy's love for fresh, seasonal ingredients",
                    pAiringSuggestions: ["fresh mint tea", "crusty bread"],
                    dietaryInfo: ["vegetarian", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 18,
                        carbs: 42,
                        fat: 18,
                        vitamins: ["A", "B12", "K"],
                        minerals: ["Calcium", "Magnesium"]
                    },
                    season: ["summer"],
                    mealType: ["breakfast"]
                }
            ],
            winter: [
                {
                    name: "Cioccolata Calda con Biscotti",
                    description: "Thick Italian hot chocolate with cookies",
                    cuisine: "Italian",
                    cookingMethods: ["heating", "whisking"],
                    tools: [
                        "saucepan",
                        "whisk",
                        "measuring cups",
                        "serving mug"
                    ],
                    preparationSteps: [
                        "Heat milk in saucepan",
                        "Add chocolate and cornstarch",
                        "Whisk until thickened",
                        "Pour into serving mug",
                        "Serve with biscotti"
                    ],
                    ingredients: [
                        { name: "dark chocolate", amount: "100", unit: "g", category: "chocolate" },
                        { name: "whole milk", amount: "250", unit: "ml", category: "dAiry", swaps: ["oat milk"] },
                        { name: "cornstarch", amount: "10", unit: "g", category: "thickener" },
                        { name: "biscotti", amount: "2", unit: "pieces", category: "pastry", swaps: ["gluten-free biscotti"] }
                    ],
                    substitutions: {
                        "whole milk": ["oat milk", "almond milk", "soy milk"],
                        "biscotti": ["gluten-free biscotti", "amaretti"]
                    },
                    servingSize: 1,
                    allergens: ["dAiry", "gluten"],
                    prepTime: "5 minutes",
                    cookTime: "10 minutes",
                    culturalNotes: "Italian hot chocolate is famously thick and rich, perfect for winter mornings",
                    pAiringSuggestions: ["biscotti", "whipped cream"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 450,
                        protein: 12,
                        carbs: 48,
                        fat: 24,
                        vitamins: ["D", "E"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["winter"],
                    mealType: ["breakfast"]
                }
            ]
        },
        lunch: {
            all: [
                {
                    name: "Pasta al Pomodoro",
                    description: "Classic spaghetti with fresh tomato sauce",
                    cuisine: "Italian",
                    cookingMethods: ["boiling", "sauce-making"],
                    tools: [
                        "large pot",
                        "saucepan",
                        "colander",
                        "wooden spoon"
                    ],
                    preparationSteps: [
                        "Boil pasta in salted water",
                        "Prepare fresh tomato sauce",
                        "Combine pasta with sauce",
                        "Finish with basil and olive oil"
                    ],
                    ingredients: [
                        { name: "spaghetti", amount: "400", unit: "g", category: "pasta", swaps: ["gluten-free pasta"] },
                        { name: "tomatoes", amount: "500", unit: "g", category: "vegetable" },
                        { name: "basil", amount: "1", unit: "bunch", category: "herb" },
                        { name: "olive oil", amount: "60", unit: "ml", category: "oil" },
                        { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" }
                    ],
                    substitutions: {
                        "spaghetti": ["gluten-free pasta", "zucchini noodles"],
                        "garlic": ["garlic powder", "shallots"]
                    },
                    servingSize: 4,
                    allergens: ["gluten"],
                    prepTime: "10 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A cornerstone of Italian cuisine, showcasing the importance of simplicity and quality ingredients",
                    pAiringSuggestions: ["Chianti", "green salad", "crusty bread"],
                    dietaryInfo: ["vegetarian", "vegan"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 380,
                        protein: 12,
                        carbs: 65,
                        fat: 10,
                        vitamins: ["A", "C"],
                        minerals: ["Iron"]
                    },
                    season: ["all"],
                    mealType: ["lunch"]
                },
                {
                    name: "Insalata Caprese",
                    description: "Classic Capri salad with mozzarella and tomatoes",
                    cuisine: "Italian",
                    cookingMethods: ["assembling"],
                    tools: [
                        "sharp knife",
                        "serving platter",
                        "olive oil bottle",
                        "kitchen towel"
                    ],
                    preparationSteps: [
                        "Slice tomatoes and mozzarella",
                        "Arrange alternately on plate",
                        "Tuck fresh basil leaves between",
                        "Drizzle with olive oil",
                        "Season with salt and pepper",
                        "Optional balsamic drizzle"
                    ],
                    ingredients: [
                        { name: "buffalo mozzarella", amount: "200", unit: "g", category: "dAiry", swaps: ["plant-based mozzarella"] },
                        { name: "tomatoes", amount: "300", unit: "g", category: "vegetable" },
                        { name: "fresh basil", amount: "1", unit: "bunch", category: "herb" },
                        { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
                        { name: "balsamic vinegar", amount: "1", unit: "tbsp", category: "vinegar" }
                    ],
                    substitutions: {
                        "buffalo mozzarella": ["vegan mozzarella", "burrata"],
                        "balsamic vinegar": ["balsamic glaze", "aged balsamic"]
                    },
                    servingSize: 2,
                    allergens: ["dAiry"],
                    prepTime: "10 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "Originated on the island of Capri, representing the colors of the Italian flag",
                    pAiringSuggestions: ["crusty bread", "Verdicchio wine"],
                    dietaryInfo: ["vegetarian", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 18,
                        carbs: 8,
                        fat: 24,
                        vitamins: ["A", "C", "K"],
                        minerals: ["Calcium", "Potassium"]
                    },
                    season: ["summer"],
                    mealType: ["lunch", "appetizer"]
                },
                {
                    name: "Panzanella",
                    description: "Tuscan bread and tomato salad",
                    cuisine: "Italian",
                    cookingMethods: ["assembling"],
                    tools: [
                        "sharp knife",
                        "serving bowl",
                        "olive oil bottle",
                        "kitchen towel"
                    ],
                    preparationSteps: [
                        "Slice stale bread into cubes",
                        "Slice tomatoes and cucumber",
                        "Chop red onion",
                        "Combine all ingredients in a bowl",
                        "Drizzle with olive oil",
                        "Season with salt and pepper",
                        "Toss gently",
                        "Serve immediately"
                    ],
                    ingredients: [
                        { name: "stale bread", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free bread"] },
                        { name: "tomatoes", amount: "400", unit: "g", category: "vegetable" },
                        { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "red onion", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "olive oil", amount: "60", unit: "ml", category: "oil" }
                    ],
                    substitutions: {
                        "stale bread": ["gluten-free bread", "fresh bread"],
                        "tomatoes": ["cherry tomatoes", "grape tomatoes"],
                        "cucumber": ["english cucumber", "persian cucumber"],
                        "red onion": ["yellow onion", "shallot"]
                    },
                    servingSize: 4,
                    allergens: ["gluten"],
                    prepTime: "15 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "A simple and refreshing Tuscan salad that showcases the region's love for bread and vegetables",
                    pAiringSuggestions: ["Chianti wine", "crusty bread"],
                    dietaryInfo: ["vegetarian", "gluten-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 380,
                        protein: 10,
                        carbs: 58,
                        fat: 16,
                        vitamins: ["C", "A", "K"],
                        minerals: ["Potassium", "Iron"]
                    },
                    season: ["summer"],
                    mealType: ["lunch"]
                }
            ],
            winter: [
                {
                    name: "Ribollita",
                    description: "Hearty Tuscan bread and vegetable soup",
                    cuisine: "Italian",
                    cookingMethods: ["simmering", "sautéing"],
                    tools: [
                        "large pot",
                        "wooden spoon",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Sauté vegetables and herbs",
                        "Add beans and tomatoes",
                        "Simmer with broth",
                        "Add bread chunks",
                        "Continue cooking until thickened",
                        "Rest overnight for best results"
                    ],
                    ingredients: [
                        { name: "stale bread", amount: "300", unit: "g", category: "bread", swaps: ["gluten-free bread"] },
                        { name: "cannellini beans", amount: "400", unit: "g", category: "legume" },
                        { name: "cavolo nero", amount: "200", unit: "g", category: "vegetable", swaps: ["kale"] },
                        { name: "vegetables", amount: "500", unit: "g", category: "vegetable" },
                        { name: "olive oil", amount: "60", unit: "ml", category: "oil" }
                    ],
                    substitutions: {
                        "cavolo nero": ["kale", "Swiss chard"],
                        "stale bread": ["gluten-free bread", "crusty bread"],
                        "cannellini beans": ["navy beans", "great northern beans"]
                    },
                    servingSize: 6,
                    allergens: ["gluten"],
                    prepTime: "30 minutes",
                    cookTime: "1 hour",
                    culturalNotes: "A peasant dish from Tuscany that exemplifies the Italian tradition of not wasting food",
                    pAiringSuggestions: ["Chianti wine", "extra virgin olive oil drizzle"],
                    dietaryInfo: ["vegetarian", "vegan"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 380,
                        protein: 15,
                        carbs: 58,
                        fat: 12,
                        vitamins: ["A", "C", "K"],
                        minerals: ["Iron", "Fiber"]
                    },
                    season: ["winter", "autumn"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Pasta e Fagioli",
                    description: "Classic pasta and bean soup",
                    cuisine: "Italian",
                    cookingMethods: ["simmering"],
                    tools: [
                        "large pot",
                        "wooden spoon",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Sauté vegetables and herbs",
                        "Add beans and pasta",
                        "Simmer with broth",
                        "Season with salt and pepper",
                        "Serve with grated parmesan"
                    ],
                    ingredients: [
                        { name: "small pasta", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free pasta"] },
                        { name: "borlotti beans", amount: "400", unit: "g", category: "legume" },
                        { name: "tomato passata", amount: "200", unit: "ml", category: "sauce" },
                        { name: "rosemary", amount: "2", unit: "sprigs", category: "herb" },
                        { name: "pancetta", amount: "50", unit: "g", category: "protein", swaps: ["smoked tofu"] }
                    ],
                    substitutions: {
                        "small pasta": ["gluten-free pasta", "rice pasta"],
                        "borlotti beans": ["cannellini beans", "kidney beans"],
                        "tomato passata": ["tomato sauce", "diced tomatoes"],
                        "rosemary": ["thyme", "oregano"],
                        "pancetta": ["bacon", "smoked tofu"]
                    },
                    servingSize: 4,
                    allergens: ["gluten"],
                    prepTime: "20 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A hearty and comforting soup that's perfect for cold winter days",
                    pAiringSuggestions: ["Chianti wine", "crusty bread"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 440,
                        protein: 22,
                        carbs: 68,
                        fat: 12,
                        vitamins: ["B1", "B12", "C"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["winter"],
                    mealType: ["lunch"]
                }
            ]
        },
        dinner: {
            all: [
                {
                    name: "Osso Buco alla Milanese",
                    description: "Braised veal shanks in white wine and broth",
                    cuisine: "Italian",
                    cookingMethods: ["braising", "sautéing"],
                    tools: [
                        "Dutch oven",
                        "wooden spoon",
                        "kitchen twine",
                        "grater"
                    ],
                    preparationSteps: [
                        "Tie veal shanks with twine",
                        "Dredge in flour and brown",
                        "Sauté soffritto",
                        "Add wine and broth",
                        "Braise until tender",
                        "Prepare gremolata"
                    ],
                    ingredients: [
                        { name: "veal shanks", amount: "4", unit: "pieces", category: "protein", swaps: ["beef shanks"] },
                        { name: "white wine", amount: "250", unit: "ml", category: "wine" },
                        { name: "broth", amount: "500", unit: "ml", category: "liquid" },
                        { name: "vegetables", amount: "300", unit: "g", category: "vegetable" },
                        { name: "gremolata", amount: "1", unit: "portion", category: "garnish" }
                    ],
                    substitutions: {
                        "veal": ["beef shanks", "mushroom shanks"],
                        "white wine": ["vegetable stock", "non-alcoholic wine"]
                    },
                    servingSize: 4,
                    allergens: ["celery"],
                    prepTime: "30 minutes",
                    cookTime: "2 hours",
                    culturalNotes: "A signature dish from Milan, traditionally served with risotto alla Milanese",
                    pAiringSuggestions: ["risotto alla Milanese", "Barbaresco", "crusty bread"],
                    dietaryInfo: ["contains meat", "contains alcohol"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 450,
                        protein: 35,
                        carbs: 15,
                        fat: 28,
                        vitamins: ["B12", "A"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["winter"],
                    mealType: ["dinner"]
                },
                {
                    name: "Risotto ai Funghi",
                    description: "Creamy mushroom risotto",
                    cuisine: "Italian",
                    cookingMethods: ["sautéing", "gradual-liquid-addition"],
                    tools: [
                        "heavy-bottomed pan",
                        "wooden spoon",
                        "ladle",
                        "saucepan"
                    ],
                    preparationSteps: [
                        "Prepare mushroom broth",
                        "Toast rice with onions",
                        "Add wine and reduce",
                        "Gradually add hot broth",
                        "Finish with butter and cheese",
                        "Rest before serving"
                    ],
                    ingredients: [
                        { name: "arborio rice", amount: "320", unit: "g", category: "grain" },
                        { name: "porcini mushrooms", amount: "30", unit: "g", category: "fungi", swaps: ["other mushrooms"] },
                        { name: "white wine", amount: "120", unit: "ml", category: "wine" },
                        { name: "parmigiano", amount: "80", unit: "g", category: "dAiry", swaps: ["nutritional yeast"] }
                    ],
                    substitutions: {
                        "parmigiano": ["nutritional yeast", "vegan parmesan"],
                        "white wine": ["vegetable stock", "mushroom stock"],
                        "butter": ["olive oil", "vegan butter"]
                    },
                    servingSize: 4,
                    allergens: ["dAiry"],
                    prepTime: "15 minutes",
                    cookTime: "25 minutes",
                    culturalNotes: "A northern Italian specialty that showcases the region's love for rice dishes",
                    pAiringSuggestions: ["Barolo", "simple green salad"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 12,
                        carbs: 65,
                        fat: 18,
                        vitamins: ["D", "B12"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["autumn"],
                    mealType: ["dinner"]
                },
                {
                    name: "Gnocchi alla Sorrentina",
                    description: "Potato gnocchi baked with tomato sauce, mozzarella, and basil",
                    cuisine: "Italian",
                    cookingMethods: ["boiling", "baking"],
                    tools: [
                        "large pot",
                        "baking dish",
                        "potato ricer",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Prepare gnocchi",
                        "Make tomato sauce",
                        "Cook gnocchi",
                        "Layer with sauce and cheese",
                        "Bake until bubbly",
                        "Garnish with basil"
                    ],
                    ingredients: [
                        { name: "potatoes", amount: "1", unit: "kg", category: "vegetable" },
                        { name: "flour", amount: "300", unit: "g", category: "grain" },
                        { name: "egg", amount: "1", unit: "large", category: "protein" },
                        { name: "tomato sauce", amount: "500", unit: "ml", category: "sauce" },
                        { name: "mozzarella", amount: "250", unit: "g", category: "dAiry" },
                        { name: "Parmigiano-Reggiano", amount: "100", unit: "g", category: "dAiry" },
                        { name: "fresh basil", amount: "1", unit: "bunch", category: "herb" },
                        { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" }
                    ],
                    substitutions: {
                        "mozzarella": ["plant-based mozzarella"],
                        "Parmigiano-Reggiano": ["pecorino", "nutritional yeast"],
                        "egg": ["olive oil"]
                    },
                    servingSize: 6,
                    allergens: ["wheat", "dAiry", "egg"],
                    prepTime: "45 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "A classic dish from Sorrento, combining the comfort of potato gnocchi with the flavors of Campania",
                    pAiringSuggestions: ["Italian red wine", "green salad", "crusty bread"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 450,
                        protein: 18,
                        carbs: 65,
                        fat: 15,
                        vitamins: ["C", "A"],
                        minerals: ["Potassium", "Calcium"]
                    },
                    season: ["all"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.20, Water: 0.30, Earth: 0.40, Air: 0.10 }
                }
            ],
            summer: [
                {
                    name: "Acqua Pazza",
                    description: "Neapolitan style fish in 'crazy water'",
                    cuisine: "Italian (Neapolitan)",
                    cookingMethods: ["poaching", "simmering"],
                    tools: [
                        "large skillet",
                        "fish spatula",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Clean and prepare fish",
                        "Sauté garlic and herbs",
                        "Add tomatoes and wine",
                        "Poach fish in liquid",
                        "Garnish with fresh herbs"
                    ],
                    ingredients: [
                        { name: "fresh fish", amount: "600", unit: "g", category: "protein", swaps: ["sea bass", "cod"] },
                        { name: "cherry tomatoes", amount: "300", unit: "g", category: "vegetable" },
                        { name: "white wine", amount: "150", unit: "ml", category: "wine", swaps: ["fish stock"] },
                        { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
                        { name: "parsley", amount: "1", unit: "bunch", category: "herb" }
                    ],
                    substitutions: {
                        "fresh fish": ["sea bass", "cod", "halibut"],
                        "white wine": ["fish stock", "vegetable stock"],
                        "cherry tomatoes": ["diced tomatoes", "grape tomatoes"]
                    },
                    servingSize: 4,
                    allergens: ["fish", "sulfites"],
                    prepTime: "15 minutes",
                    cookTime: "25 minutes",
                    culturalNotes: "A traditional Neapolitan fisherman's dish, where fish is cooked in 'crazy water' (acqua pazza) - a fragrant broth of tomatoes, herbs, and wine",
                    pAiringSuggestions: ["Falanghina wine", "crusty bread", "sautéed greens"],
                    dietaryInfo: ["contains fish", "gluten-free", "dAiry-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 320,
                        protein: 42,
                        carbs: 12,
                        fat: 14,
                        vitamins: ["D", "B12", "C"],
                        minerals: ["Selenium", "Iodine", "Potassium"]
                    },
                    season: ["summer", "spring"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Melanzane alla Parmigiana",
                    description: "Eggplant Parmesan with tomato sauce",
                    cuisine: "Italian",
                    cookingMethods: ["baking", "frying"],
                    tools: [
                        "baking dish",
                        "frying pan",
                        "knife",
                        "cutting board",
                        "grater"
                    ],
                    preparationSteps: [
                        "Slice eggplant thinly",
                        "Salt and drain to remove bitterness",
                        "Fry eggplant slices",
                        "Prepare tomato sauce",
                        "Layer eggplant, sauce, and cheese in baking dish",
                        "Bake until golden and bubbly",
                        "Serve with fresh basil"
                    ],
                    ingredients: [
                        { name: "eggplant", amount: "800", unit: "g", category: "vegetable" },
                        { name: "tomato sauce", amount: "500", unit: "ml", category: "sauce" },
                        { name: "mozzarella", amount: "300", unit: "g", category: "dAiry", swaps: ["vegan mozzarella"] },
                        { name: "parmigiano", amount: "100", unit: "g", category: "dAiry", swaps: ["nutritional yeast"] },
                        { name: "basil", amount: "1", unit: "bunch", category: "herb" }
                    ],
                    substitutions: {
                        "mozzarella": ["vegan mozzarella", "cashew cheese"],
                        "parmigiano": ["nutritional yeast", "vegan parmesan"],
                        "tomato sauce": ["marinara sauce", "canned tomatoes"]
                    },
                    servingSize: 4,
                    allergens: ["dAiry"],
                    prepTime: "30 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A popular Italian-American dish that showcases the versatility of eggplant",
                    pAiringSuggestions: ["red wine", "garlic bread"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 420,
                        protein: 22,
                        carbs: 28,
                        fat: 26,
                        vitamins: ["A", "C", "K"],
                        minerals: ["Calcium", "Iron"]
                    },
                    season: ["summer"],
                    mealType: ["dinner"]
                }
            ]
        },
        dessert: {
            all: [
                {
                    name: "Tiramisù",
                    description: "Classic coffee-flavored dessert with mascarpone cream",
                    cuisine: "Italian",
                    cookingMethods: ["layering", "whipping"],
                    tools: [
                        "mixing bowls",
                        "electric mixer",
                        "serving dish",
                        "espresso maker"
                    ],
                    preparationSteps: [
                        "Prepare strong coffee",
                        "Whip egg yolks with sugar",
                        "Fold in mascarpone",
                        "Dip ladyfingers in coffee",
                        "Layer cream and cookies",
                        "Dust with cocoa"
                    ],
                    ingredients: [
                        { name: "mascarpone", amount: "500", unit: "g", category: "dAiry" },
                        { name: "ladyfingers", amount: "200", unit: "g", category: "pastry", swaps: ["gluten-free ladyfingers"] },
                        { name: "espresso", amount: "300", unit: "ml", category: "coffee" },
                        { name: "eggs", amount: "4", unit: "large", category: "protein" },
                        { name: "cocoa powder", amount: "30", unit: "g", category: "powder" }
                    ],
                    substitutions: {
                        "mascarpone": ["dAiry-free mascarpone", "cashew cream"],
                        "ladyfingers": ["gluten-free ladyfingers", "sponge cake"],
                        "eggs": ["aquafaba"]
                    },
                    servingSize: 8,
                    allergens: ["dAiry", "eggs", "gluten"],
                    prepTime: "30 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "Originated in Veneto, now one of Italy's most famous desserts worldwide",
                    pAiringSuggestions: ["espresso", "Vin Santo"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 350,
                        protein: 8,
                        carbs: 35,
                        fat: 22,
                        vitamins: ["A", "D"],
                        minerals: ["Calcium"]
                    },
                    season: ["all"],
                    mealType: ["dessert"]
                }
            ],
            summer: [
                {
                    name: "Gelato Artigianale",
                    description: "Traditional Italian ice cream",
                    cuisine: "Italian",
                    cookingMethods: ["churning"],
                    tools: [
                        "ice cream maker",
                        "mixing bowl",
                        "whisk",
                        "saucepan"
                    ],
                    preparationSteps: [
                        "Whisk milk, cream, and sugar",
                        "Cook until thickened",
                        "Cool and chill",
                        "Churn in ice cream maker",
                        "Freeze until firm"
                    ],
                    ingredients: [
                        { name: "milk", amount: "500", unit: "ml", category: "dAiry", swaps: ["almond milk"] },
                        { name: "cream", amount: "250", unit: "ml", category: "dAiry", swaps: ["coconut cream"] },
                        { name: "sugar", amount: "150", unit: "g", category: "sweetener" },
                        { name: "egg yolks", amount: "4", unit: "large", category: "protein" }
                    ],
                    substitutions: {
                        "milk": ["almond milk", "oat milk"],
                        "cream": ["coconut cream", "heavy cream"],
                        "sugar": ["stevia", "erythritol"],
                        "egg yolks": ["aquafaba"]
                    },
                    servingSize: 4,
                    allergens: ["dAiry", "eggs"],
                    prepTime: "30 minutes",
                    cookTime: "15 minutes",
                    culturalNotes: "A beloved Italian dessert that showcases the country's love for sweet, creamy treats",
                    pAiringSuggestions: ["fresh fruit", "balsamic glaze"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 220,
                        protein: 6,
                        carbs: 28,
                        fat: 12,
                        vitamins: ["A", "D"],
                        minerals: ["Calcium"]
                    },
                    season: ["summer"],
                    mealType: ["dessert"]
                }
            ],
            winter: [
                {
                    name: "Panettone",
                    description: "Traditional Christmas sweet bread",
                    cuisine: "Italian",
                    cookingMethods: ["kneading", "rising", "baking"],
                    tools: [
                        "mixing bowl",
                        "stand mixer",
                        "loaf pan",
                        "oven"
                    ],
                    preparationSteps: [
                        "Knead dough with butter and sugar",
                        "Add eggs and raisins",
                        "Rise dough until doubled",
                        "Shape into loaf",
                        "Bake until golden",
                        "Brush with sugar syrup"
                    ],
                    ingredients: [
                        { name: "flour", amount: "500", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
                        { name: "dried fruit", amount: "200", unit: "g", category: "fruit" },
                        { name: "butter", amount: "200", unit: "g", category: "dAiry", swaps: ["plant butter"] },
                        { name: "eggs", amount: "5", unit: "large", category: "protein" },
                        { name: "sugar", amount: "150", unit: "g", category: "sweetener" }
                    ],
                    substitutions: {
                        "flour": ["gluten-free flour blend", "coconut flour"],
                        "dried fruit": ["raisins", "cranberries"],
                        "butter": ["plant butter", "coconut oil"],
                        "eggs": ["flax eggs", "chia eggs"],
                        "sugar": ["stevia", "erythritol"]
                    },
                    servingSize: 12,
                    allergens: ["gluten", "dAiry", "eggs"],
                    prepTime: "3 hours",
                    cookTime: "45 minutes",
                    culturalNotes: "A traditional Italian Christmas bread that's enjoyed during the holiday season",
                    pAiringSuggestions: ["vin santo", "espresso"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 8,
                        carbs: 52,
                        fat: 16,
                        vitamins: ["A", "D", "E"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["winter"],
                    mealType: ["dessert"]
                }
            ]
        }
    },
    motherSauces: {
        marinaraBase: {
            name: "Marinara Base",
            description: "Simple tomato sauce that forms the foundation of many Italian dishes",
            base: "tomato",
            thickener: "reduction",
            keyIngredients: ["tomatoes", "garlic", "olive oil", "basil", "oregano"],
            culinaryUses: ["pasta sauce", "pizza base", "dipping sauce", "casserole base"],
            derivatives: ["Arrabbiata", "Puttanesca", "Alla Norma"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Sun", "leo"],
            seasonality: "all",
            preparationNotes: "Best when made with San Marzano tomatoes for authentic flavor",
            technicalTips: "Simmer gently to maintain brightness of flavor",
            difficulty: "easy",
            storageInstructions: "Store in Airtight container for up to 5 days in refrigerator",
            yield: "2 cups"
        },
        besciamella: {
            name: "Besciamella",
            description: "Italian white sauce made from roux and milk",
            base: "milk",
            thickener: "roux",
            keyIngredients: ["butter", "flour", "milk", "nutmeg", "bay leaf"],
            culinaryUses: ["lasagna layer", "cannelloni filling base", "vegetable gratin", "creamed spinach"],
            derivatives: ["Mornay sauce", "Soubise", "Infused besciamella"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Moon", "Venus", "cancer"],
            seasonality: "all",
            preparationNotes: "For silky texture, add hot milk to roux gradually while whisking constantly",
            technicalTips: "Infuse milk with bay leaf, onion, and clove before making sauce for depth of flavor",
            difficulty: "medium",
            storageInstructions: "Store refrigerated in Airtight container for up to 3 days",
            yield: "2 cups"
        }
    },
    traditionalSauces: {
        marinara: {
            name: "Marinara",
            description: "Simple tomato sauce with garlic, olive oil and herbs",
            base: "tomato",
            keyIngredients: ["tomatoes", "garlic", "olive oil", "basil", "oregano"],
            culinaryUses: ["pasta sauce", "pizza base", "dipping sauce", "casserole base"],
            variants: ["Arrabbiata", "Puttanesca", "Alla Norma"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Sun", "leo"],
            seasonality: "all",
            preparationNotes: "Best when made with San Marzano tomatoes for authentic flavor",
            technicalTips: "Simmer gently to maintain brightness of flavor"
        },
        pesto: {
            name: "Pesto alla Genovese",
            description: "Fresh basil sauce with pine nuts, garlic, Parmesan and olive oil",
            base: "herb",
            keyIngredients: ["basil leaves", "pine nuts", "garlic", "Parmigiano-Reggiano", "Pecorino", "olive oil"],
            culinaryUses: ["pasta sauce", "sandwich spread", "marinade", "flavor enhancer"],
            variants: ["Red pesto", "Pesto alla Siciliana", "Pesto alla Trapanese"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mercury", "Venus", "gemini"],
            seasonality: "summer",
            preparationNotes: "Traditionally made in a marble mortar with wooden pestle",
            technicalTips: "Blanch basil briefly to preserve color if making ahead"
        },
        carbonara: {
            name: "Carbonara",
            description: "Silky sauce of eggs, hard cheese, cured pork and black pepper",
            base: "egg",
            keyIngredients: ["eggs", "Pecorino Romano", "guanciale", "black pepper"],
            culinaryUses: ["pasta sauce", "sauce for gnocchi", "savory custard base"],
            variants: ["Carbonara with pancetta", "Lighter carbonara with less egg yolks", "Vegetarian carbonara"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Jupiter", "Mars", "aries"],
            seasonality: "all",
            preparationNotes: "Never add cream - authentic carbonara is creamy from eggs alone",
            technicalTips: "Temper eggs carefully to prevent scrambling; use pasta water to adjust consistency"
        },
        ragu: {
            name: "Ragù alla Bolognese",
            description: "Rich, slow-cooked meat sauce from Bologna",
            base: "meat",
            keyIngredients: ["beef", "pork", "soffritto", "tomato paste", "wine", "milk"],
            culinaryUses: ["pasta sauce", "lasagna filling", "polenta topping", "stuffed pasta filling"],
            variants: ["Ragù Napoletano", "White ragù", "Wild boar ragù", "Vegetarian mushroom ragù"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Saturn", "Mars", "taurus"],
            seasonality: "autumn, winter",
            preparationNotes: "True Bolognese takes hours of gentle simmering for depth of flavor",
            technicalTips: "Add milk toward the end of cooking for authentic richness and tenderness"
        },
        bechamel: {
            name: "Besciamella",
            description: "Classic white sauce made from roux and milk",
            base: "dAiry",
            keyIngredients: ["butter", "flour", "milk", "nutmeg", "bay leaf"],
            culinaryUses: ["lasagna layer", "cannelloni filling base", "vegetable gratin", "creamed spinach"],
            variants: ["Mornay sauce", "Soubise", "Infused besciamella"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Moon", "Venus", "cancer"],
            seasonality: "all",
            preparationNotes: "For silky texture, add hot milk to roux gradually while whisking constantly",
            technicalTips: "Infuse milk with bay leaf, onion, and clove before making sauce for depth of flavor"
        }
    },
    sauceRecommender: {
        forProtein: {
            beef: ["ragù alla Bolognese", "sugo di carne", "salsa alla pizzaiola", "Barolo wine sauce"],
            pork: ["agrodolce", "marsala", "porchetta herbs", "black pepper sauce"],
            chicken: ["cacciatore", "piccata", "marsala", "salt-crusted herbs"],
            fish: ["acqua pazza", "salmoriglio", "livornese", "al limone"],
            vegetarian: ["pesto", "pomodoro", "aglio e olio", "burro e salvia"]
        },
        forVegetable: {
            leafy: ["aglio e olio", "parmigiano", "lemon butter", "anchovy"],
            root: ["besciamella", "gremolata", "herbed butter", "balsamic glaze"],
            nightshades: ["marinara", "alla Norma", "sugo di pomodoro", "caponata"],
            squash: ["brown butter sage", "gorgonzola cream", "agrodolce", "walnut pesto"],
            mushroom: ["porcini sauce", "marsala", "truffle oil", "white wine garlic"]
        },
        forCookingMethod: {
            grilling: ["salmoriglio", "rosemary oil", "balsamic glaze", "salsa verde"],
            baking: ["marinara", "besciamella", "pesto", "ragù"],
            frying: ["aioli", "lemon dip", "arrabiata", "garlic-herb dip"],
            braising: ["osso buco sauce", "wine reduction", "pomodoro", "cacciatora"],
            raw: ["pinzimonio", "olio nuovo", "citronette", "bagna cauda"]
        },
        byAstrological: { Fire: ["arrabiata", "puttanesca", "aglio e olio with peperoncino", "spicy pomodoro"],
            Earth: ["mushroom ragu", "tartufo", "carbonara", "ragù alla Bolognese"],
            Air: ["lemon sauces", "herb oils", "white wine sauce", "pesto"],
            Water: ["seafood sauces", "acqua pazza", "clam sauce", "besciamella"]
        },
        byRegion: {
            northern: ["pesto alla Genovese", "bagna cauda", "fonduta", "ragù alla Bolognese"],
            central: ["carbonara", "cacio e pepe", "amatriciana", "sugo finto"],
            southern: ["marinara", "puttanesca", "aglio e olio", "alla Norma"],
            insular: ["sarde a beccafico", "nero di seppia", "bottarga", "caponata"]
        },
        byDietary: {
            vegetarian: ["pomodoro", "pesto", "aglio e olio", "burro e salvia"],
            vegan: ["marinara", "pomodoro", "aglio e olio", "salsa verde"],
            glutenFree: ["salsa verde", "salmoriglio", "sugo di pomodoro", "lemon sauce"],
            dAiryFree: ["marinara", "aglio e olio", "puttanesca", "arrabbiata"]
        }
    },
    cookingTechniques: [
        {
            name: "Al Dente",
            description: "Cooking pasta until firm to the bite, not soft",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["large pot", "timer", "colander"],
            bestFor: ["pasta", "risotto rice", "vegetables"]
        },
        {
            name: "Soffritto",
            description: "Slow-cooking aromatic base of finely chopped vegetables in fat",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["heavy-bottomed pan", "wooden spoon", "sharp knife"],
            bestFor: ["sauce base", "soup base", "risotto", "stews"]
        },
        {
            name: "Mantecatura",
            description: "Final whisking of cold butter or cheese into hot dishes to create a creamy emulsion",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["wooden spoon", "grater", "ladle"],
            bestFor: ["risotto", "pasta sauces", "polenta", "gnocchi"]
        },
        {
            name: "Sfumato",
            description: "Deglazing with wine to lift flavor compounds and create depth",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["heavy pan", "wooden spoon"],
            bestFor: ["risotto", "sauces", "braises", "stews"]
        },
        {
            name: "Battuto",
            description: "Finely chopped raw aromatic ingredients that form the base of many dishes",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["chef's knife", "cutting board", "mezzaluna"],
            bestFor: ["sauce preparation", "flavor base", "soup starters", "stuffings"]
        }
    ],
    regionalCuisines: {
        sicilian: {
            name: "Sicilian Cuisine",
            description: "Bold flavors reflecting diverse cultural influences with emphasis on seafood, citrus, and Arab-influenced sweets",
            signature: ["pasta alla Norma", "arancini", "cannoli", "caponata"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Sun", "leo"],
            seasonality: "all"
        },
        tuscan: {
            name: "Tuscan Cuisine",
            description: "Rustic simplicity focusing on high-quality ingredients with an emphasis on beans, bread, and olive oil",
            signature: ["ribollita", "panzanella", "bistecca alla fiorentina", "pappa al pomodoro"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Saturn", "Jupiter", "capricorn"],
            seasonality: "all"
        },
        emilian: {
            name: "Emilian Cuisine",
            description: "Rich, indulgent cuisine from Italy's food valley, known for pasta, cured meats, and aged cheeses",
            signature: ["tagliatelle al ragù", "tortellini in brodo", "lasagne alla bolognese", "prosciutto di Parma"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Jupiter", "Venus", "taurus"],
            seasonality: "all"
        },
        neapolitan: {
            name: "Neapolitan Cuisine",
            description: "Vibrant and tomato-forward cuisine with iconic pizza, pasta, and seafood dishes",
            signature: ["pizza napoletana", "spaghetti alle vongole", "pastiera napoletana", "ragù napoletano"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Neptune", "aries"],
            seasonality: "all"
        }
    },
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    },
    astrologicalInfluences: [
        "Venus - Roman goddess of love and beauty influences the sensory pleasures of Italian cuisine",
        "Jupiter - Brings abundance and generosity to communal Italian dining traditions",
        "Mercury - Governs the communication and conviviality central to Italian food culture"
    ]
};
exports.default = exports.italian;
