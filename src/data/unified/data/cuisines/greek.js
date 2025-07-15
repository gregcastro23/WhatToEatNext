"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greek = void 0;
exports.greek = {
    id: "greek",
    name: "Greek",
    description: "Traditional Greek cuisine emphasizing fresh ingredients, olive oil, herbs, and regional specialties from mainland to islands",
    dishes: {
        breakfast: {
            all: [
                {
                    name: "Bougatsa",
                    description: "Phyllo pastry filled with semolina custard and cinnamon",
                    cuisine: "Greek (Thessaloniki)",
                    cookingMethods: ["layering", "baking", "custard-making"],
                    tools: [
                        "baking pan",
                        "pastry brush",
                        "saucepan",
                        "whisk",
                        "mixing bowls"
                    ],
                    preparationSteps: [
                        "Prepare semolina custard and cool",
                        "Layer phyllo sheets with butter",
                        "Spread custard filling",
                        "Top with more phyllo layers",
                        "Bake until golden",
                        "Dust with cinnamon and sugar"
                    ],
                    ingredients: [
                        { name: "phyllo dough", amount: "12", unit: "sheets", category: "pastry", swaps: ["gluten-free phyllo"] },
                        { name: "semolina", amount: "200", unit: "g", category: "grain" },
                        { name: "milk", amount: "750", unit: "ml", category: "dAiry", swaps: ["almond milk"] },
                        { name: "eggs", amount: "3", unit: "large", category: "protein" },
                        { name: "butter", amount: "100", unit: "g", category: "fat", swaps: ["olive oil"] },
                        { name: "cinnamon", amount: "2", unit: "tsp", category: "spice" }
                    ],
                    substitutions: {
                        "phyllo": ["gluten-free phyllo"],
                        "milk": ["almond milk", "soy milk"],
                        "butter": ["olive oil"]
                    },
                    servingSize: 8,
                    allergens: ["gluten", "dAiry", "eggs"],
                    prepTime: "25 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A beloved Greek breakfast pastry with origins in Byzantine cuisine, particularly associated with Thessaloniki",
                    pAiringSuggestions: ["Greek coffee", "fresh orange juice", "honey"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 10,
                        carbs: 48,
                        fat: 18,
                        vitamins: ["A", "D"],
                        minerals: ["Calcium", "Iron"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"],
                    elementalProperties: { Fire: 0.10, Water: 0.20, Earth: 0.50, Air: 0.20 }
                },
                {
                    name: "Greek Yogurt with Honey",
                    description: "Thick strained yogurt with honey, walnuts and seasonal fruit",
                    cuisine: "Greek",
                    cookingMethods: ["assembling"],
                    tools: [
                        "serving bowl",
                        "honey dipper",
                        "knife",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Layer yogurt in bowl",
                        "Drizzle with honey",
                        "Top with crushed walnuts",
                        "Add fresh figs or seasonal fruit",
                        "Optional: dust with cinnamon"
                    ],
                    ingredients: [
                        { name: "Greek yogurt", amount: "200", unit: "g", category: "dAiry", swaps: ["coconut yogurt"] },
                        { name: "honey", amount: "2", unit: "tbsp", category: "sweetener" },
                        { name: "walnuts", amount: "30", unit: "g", category: "nuts" },
                        { name: "fresh figs", amount: "2", unit: "whole", category: "fruit", swaps: ["any seasonal fruit"] },
                        { name: "cinnamon", amount: "1/4", unit: "tsp", category: "spice", optional: true }
                    ],
                    substitutions: {
                        "Greek yogurt": ["coconut yogurt", "almond yogurt"],
                        "honey": ["maple syrup", "date syrup"],
                        "walnuts": ["almonds", "pistachios"]
                    },
                    servingSize: 1,
                    allergens: ["dAiry", "tree nuts"],
                    prepTime: "5 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "A traditional Greek breakfast that showcases the country's famous thick strained yogurt and local honey. Often served as a healthy dessert option as well",
                    pAiringSuggestions: ["Greek coffee", "fresh fruit", "rusks"],
                    dietaryInfo: ["vegetarian", "gluten-free", "probiotic"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 280,
                        protein: 18,
                        carbs: 32,
                        fat: 12,
                        vitamins: ["B12", "D"],
                        minerals: ["Calcium", "Potassium"]
                    },
                    season: ["all"],
                    mealType: ["breakfast", "dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Strapatsada",
                    description: "Traditional scrambled eggs with tomatoes, feta, and olive oil",
                    cuisine: "Greek (Peloponnese)",
                    cookingMethods: ["scrambling", "sautéing"],
                    tools: [
                        "non-stick pan",
                        "sharp knife",
                        "grater",
                        "wooden spoon",
                        "serving plates"
                    ],
                    preparationSteps: [
                        "Grate ripe tomatoes",
                        "Heat olive oil in pan",
                        "Cook tomatoes until reduced",
                        "Add beaten eggs",
                        "Scramble until just set",
                        "Crumble feta on top",
                        "Finish with oregano"
                    ],
                    ingredients: [
                        { name: "eggs", amount: "4", unit: "large", category: "protein", swaps: ["tofu scramble"] },
                        { name: "ripe tomatoes", amount: "3", unit: "medium", category: "vegetable" },
                        { name: "feta cheese", amount: "100", unit: "g", category: "dAiry", swaps: ["vegan feta"] },
                        { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
                        { name: "dried oregano", amount: "1", unit: "tsp", category: "herb" },
                        { name: "black pepper", amount: "1/4", unit: "tsp", category: "seasoning" }
                    ],
                    substitutions: {
                        "eggs": ["tofu scramble", "chickpea flour mixture"],
                        "feta": ["vegan feta", "nutritional yeast"],
                        "tomatoes": ["canned tomatoes", "roasted red peppers"]
                    },
                    servingSize: 2,
                    allergens: ["eggs", "dAiry"],
                    prepTime: "10 minutes",
                    cookTime: "15 minutes",
                    culturalNotes: "A rustic breakfast dish that makes use of Greece's abundant tomatoes and olive oil. Popular throughout the Peloponnese region",
                    pAiringSuggestions: ["crusty bread", "olives", "Greek coffee"],
                    dietaryInfo: ["vegetarian", "gluten-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 420,
                        protein: 24,
                        carbs: 12,
                        fat: 32,
                        vitamins: ["A", "C", "D"],
                        minerals: ["Calcium", "Iron"]
                    },
                    season: ["summer", "autumn"],
                    mealType: ["breakfast", "lunch"],
                    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.30, Air: 0.20 }
                }
            ],
            summer: [
                {
                    name: "Paximadia",
                    description: "Twice-baked bread rusks with olive oil and tomatoes",
                    cuisine: "Greek (Cretan)",
                    ingredients: [
                        { name: "barley rusks", amount: "4", unit: "pieces", category: "bread", swaps: ["gluten-free rusks"] },
                        { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "olive oil", amount: "4", unit: "tbsp", category: "oil" },
                        { name: "oregano", amount: "2", unit: "tsp", category: "herb" }
                    ],
                    nutrition: {
                        calories: 320,
                        protein: 8,
                        carbs: 42,
                        fat: 16,
                        vitamins: ["C", "E"],
                        minerals: ["Iron", "Fiber"]
                    },
                    timeToMake: "10 minutes",
                    season: ["summer"],
                    mealType: ["breakfast"],
                    cookingMethods: ["assembling"],
                    tools: [
                        "serving plate",
                        "grater",
                        "knife"
                    ],
                    preparationSteps: [
                        "Grate tomatoes",
                        "Drizzle rusks with olive oil",
                        "Top with tomatoes",
                        "Sprinkle with oregano"
                    ],
                    substitutions: {
                        "barley rusks": ["gluten-free rusks", "toasted bread"],
                        "tomatoes": ["Sun-dried tomatoes"]
                    },
                    servingSize: 2,
                    allergens: ["gluten"],
                    prepTime: "5 minutes",
                    cookTime: "5 minutes",
                    culturalNotes: "A traditional Cretan breakfast, originally made to preserve bread",
                    pAiringSuggestions: ["Greek coffee", "olives"],
                    dietaryInfo: ["vegan"],
                    spiceLevel: "none",
                    elementalProperties: { Fire: 0.30, Water: 0.10, Earth: 0.40, Air: 0.20 }
                }
            ]
        },
        lunch: {
            all: [
                {
                    name: "Souvlaki",
                    description: "Grilled meat skewers with herbs and lemon",
                    cuisine: "Greek",
                    cookingMethods: ["marinating", "grilling", "skewering"],
                    tools: [
                        "metal skewers",
                        "grill",
                        "mixing bowl",
                        "sharp knife",
                        "tongs"
                    ],
                    preparationSteps: [
                        "Cut meat into cubes",
                        "Prepare marinade",
                        "Marinate meat",
                        "Thread onto skewers",
                        "Grill until charred",
                        "Rest before serving"
                    ],
                    ingredients: [
                        { name: "pork", amount: "1", unit: "kg", category: "protein" },
                        { name: "olive oil", amount: "1/2", unit: "cup", category: "oil" },
                        { name: "lemon", amount: "2", unit: "whole", category: "fruit" },
                        { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
                        { name: "oregano", amount: "2", unit: "tbsp", category: "herb" },
                        { name: "salt", amount: "1", unit: "tbsp", category: "seasoning" },
                        { name: "black pepper", amount: "1", unit: "tsp", category: "spice" }
                    ],
                    substitutions: {
                        "pork": ["chicken", "lamb", "mushrooms"],
                        "olive oil": ["vegetable oil"],
                        "garlic": ["garlic powder"]
                    },
                    servingSize: 6,
                    allergens: [],
                    prepTime: "20 minutes",
                    cookTime: "2 hours",
                    culturalNotes: "A traditional Greek dish often served at celebrations and family gatherings",
                    pAiringSuggestions: ["Greek salad", "tzatziki", "pita bread"],
                    dietaryInfo: ["dAiry-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 450,
                        protein: 35,
                        carbs: 5,
                        fat: 28,
                        vitamins: ["B12", "D"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Horiatiki",
                    description: "Traditional Greek village salad with tomatoes, cucumbers, and feta",
                    cuisine: "Greek",
                    cookingMethods: ["chopping", "assembling"],
                    tools: [
                        "sharp knife",
                        "cutting board",
                        "serving bowl",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Chop vegetables into chunks",
                        "Slice onion thinly",
                        "Combine ingredients",
                        "Top with feta block",
                        "Dress with oil and oregano",
                        "Serve immediately"
                    ],
                    ingredients: [
                        { name: "tomatoes", amount: "4", unit: "large", category: "vegetable" },
                        { name: "cucumber", amount: "1", unit: "large", category: "vegetable" },
                        { name: "red onion", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "green peppers", amount: "1", unit: "large", category: "vegetable" },
                        { name: "feta cheese", amount: "200", unit: "g", category: "dAiry", swaps: ["vegan feta"] },
                        { name: "Kalamata olives", amount: "100", unit: "g", category: "vegetable" },
                        { name: "olive oil", amount: "60", unit: "ml", category: "oil" },
                        { name: "dried oregano", amount: "1", unit: "tbsp", category: "herb" }
                    ],
                    substitutions: {
                        "feta": ["vegan feta", "tofu feta"],
                        "Kalamata olives": ["black olives"],
                        "red onion": ["white onion", "shallots"]
                    },
                    servingSize: 4,
                    allergens: ["dAiry"],
                    prepTime: "15 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "The authentic Greek salad never includes lettuce. It's a summer dish that celebrates the ripeness of Mediterranean vegetables",
                    pAiringSuggestions: ["crusty bread", "grilled meat", "white wine"],
                    dietaryInfo: ["vegetarian", "gluten-free", "low-carb"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 280,
                        protein: 8,
                        carbs: 12,
                        fat: 24,
                        vitamins: ["C", "A", "K"],
                        minerals: ["Calcium", "Potassium"]
                    },
                    season: ["summer"],
                    mealType: ["lunch", "dinner", "side"]
                }
            ],
            summer: [
                {
                    name: "Gemista",
                    description: "Stuffed vegetables with rice, herbs, and optional meat",
                    cuisine: "Greek",
                    cookingMethods: ["stuffing", "baking", "sautéing"],
                    tools: [
                        "baking dish",
                        "sharp knife",
                        "spoon for stuffing",
                        "mixing bowl",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Hollow out vegetables",
                        "Prepare rice filling",
                        "Stuff vegetables",
                        "Arrange in baking dish",
                        "Add potato wedges",
                        "Bake until tender"
                    ],
                    ingredients: [
                        { name: "tomatoes", amount: "6", unit: "large", category: "vegetable" },
                        { name: "bell peppers", amount: "6", unit: "medium", category: "vegetable" },
                        { name: "rice", amount: "300", unit: "g", category: "grain" },
                        { name: "onions", amount: "2", unit: "large", category: "vegetable" },
                        { name: "parsley", amount: "1", unit: "bunch", category: "herb" },
                        { name: "mint", amount: "1/2", unit: "bunch", category: "herb" },
                        { name: "olive oil", amount: "150", unit: "ml", category: "oil" },
                        { name: "potatoes", amount: "4", unit: "medium", category: "vegetable" }
                    ],
                    substitutions: {
                        "rice": ["quinoa", "bulgur"],
                        "bell peppers": ["zucchini", "eggplant"],
                        "potatoes": ["sweet potatoes"]
                    },
                    servingSize: 6,
                    allergens: ["none"],
                    prepTime: "45 minutes",
                    cookTime: "90 minutes",
                    culturalNotes: "A summer favorite that makes use of garden vegetables. Each Greek household has its own version of the filling",
                    pAiringSuggestions: ["feta cheese", "crusty bread", "Greek yogurt"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 8,
                        carbs: 52,
                        fat: 18,
                        vitamins: ["C", "A", "K"],
                        minerals: ["Potassium", "Iron"]
                    },
                    season: ["summer"],
                    mealType: ["lunch", "dinner"]
                }
            ]
        },
        dinner: {
            all: [
                {
                    name: "Moussaka",
                    description: "Layered eggplant casserole with spiced ground meat and béchamel sauce",
                    cuisine: "Greek",
                    cookingMethods: ["layering", "frying", "baking", "sauce-making"],
                    tools: [
                        "large baking dish",
                        "frying pan",
                        "saucepan",
                        "whisk",
                        "mandoline",
                        "colander"
                    ],
                    preparationSteps: [
                        "Salt and drain eggplants",
                        "Fry eggplant slices",
                        "Prepare meat sauce",
                        "Make béchamel sauce",
                        "Layer ingredients",
                        "Top with béchamel",
                        "Bake until golden"
                    ],
                    ingredients: [
                        { name: "eggplants", amount: "3", unit: "large", category: "vegetable" },
                        { name: "ground lamb", amount: "750", unit: "g", category: "protein", swaps: ["beef", "plant-based meat"] },
                        { name: "tomatoes", amount: "400", unit: "g", category: "vegetable" },
                        { name: "onions", amount: "2", unit: "large", category: "vegetable" },
                        { name: "butter", amount: "100", unit: "g", category: "dAiry" },
                        { name: "flour", amount: "100", unit: "g", category: "dry" },
                        { name: "milk", amount: "1", unit: "L", category: "dAiry" },
                        { name: "eggs", amount: "2", unit: "large", category: "protein" },
                        { name: "nutmeg", amount: "1/4", unit: "tsp", category: "spice" },
                        { name: "cinnamon", amount: "1", unit: "tsp", category: "spice" }
                    ],
                    substitutions: {
                        "ground lamb": ["ground beef", "plant-based meat", "lentils"],
                        "milk": ["plant-based milk"],
                        "butter": ["olive oil", "vegan butter"]
                    },
                    servingSize: 8,
                    allergens: ["dAiry", "eggs", "gluten"],
                    prepTime: "60 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A refined dish popularized in its current form by chef Nikolaos Tselementes in the 1920s, combining Greek and French culinary traditions",
                    pAiringSuggestions: ["Greek red wine", "village salad", "crusty bread"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 520,
                        protein: 28,
                        carbs: 32,
                        fat: 35,
                        vitamins: ["B12", "A", "D"],
                        minerals: ["Iron", "Calcium", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["dinner"]
                },
                {
                    name: "Spanakopita",
                    description: "Flaky phyllo pastry filled with spinach, herbs, and feta cheese",
                    cuisine: "Greek",
                    cookingMethods: ["layering", "baking", "sautéing"],
                    tools: [
                        "large baking pan",
                        "pastry brush",
                        "mixing bowls",
                        "colander",
                        "sharp knife"
                    ],
                    preparationSteps: [
                        "Wilt and drain spinach well",
                        "Mix with feta and herbs",
                        "Sauté onions until soft",
                        "Combine filling ingredients",
                        "Layer phyllo with oil",
                        "Add filling",
                        "Top with more phyllo",
                        "Score and bake"
                    ],
                    ingredients: [
                        { name: "phyllo dough", amount: "1", unit: "package", category: "pastry", swaps: ["gluten-free phyllo"] },
                        { name: "spinach", amount: "1", unit: "kg", category: "vegetable" },
                        { name: "feta cheese", amount: "400", unit: "g", category: "dAiry", swaps: ["tofu feta"] },
                        { name: "dill", amount: "1", unit: "bunch", category: "herb" },
                        { name: "green onions", amount: "6", unit: "whole", category: "vegetable" },
                        { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["flax eggs"] },
                        { name: "olive oil", amount: "200", unit: "ml", category: "oil" }
                    ],
                    substitutions: {
                        "feta": ["tofu feta", "cashew cheese"],
                        "eggs": ["flax eggs", "chickpea water"],
                        "phyllo": ["gluten-free phyllo"]
                    },
                    servingSize: 12,
                    allergens: ["dAiry", "gluten", "eggs"],
                    prepTime: "45 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A traditional pie that showcases Greece's love for wild greens and feta. Often made by village women using foraged greens",
                    pAiringSuggestions: ["Greek white wine", "tzatziki", "village salad"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 12,
                        carbs: 28,
                        fat: 20,
                        vitamins: ["A", "K", "C"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["winter", "spring"],
                    mealType: ["lunch", "dinner", "appetizer"]
                },
                {
                    name: "Pastitsio",
                    description: "Baked pasta casserole with spiced meat sauce and béchamel",
                    cuisine: "Greek",
                    cookingMethods: ["boiling", "baking", "sauce-making"],
                    tools: [
                        "large baking dish",
                        "pasta pot",
                        "saucepan",
                        "whisk",
                        "wooden spoon"
                    ],
                    preparationSteps: [
                        "Cook pasta al dente",
                        "Prepare meat sauce",
                        "Make béchamel sauce",
                        "Layer pasta and meat",
                        "Top with béchamel",
                        "Bake until golden"
                    ],
                    ingredients: [
                        { name: "bucatini pasta", amount: "500", unit: "g", category: "pasta", swaps: ["penne", "ziti"] },
                        { name: "ground beef", amount: "750", unit: "g", category: "protein", swaps: ["lamb", "plant-based meat"] },
                        { name: "onions", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "tomato paste", amount: "70", unit: "g", category: "vegetable" },
                        { name: "butter", amount: "100", unit: "g", category: "dAiry" },
                        { name: "flour", amount: "100", unit: "g", category: "dry" },
                        { name: "milk", amount: "1", unit: "L", category: "dAiry" },
                        { name: "eggs", amount: "3", unit: "large", category: "protein" },
                        { name: "nutmeg", amount: "1/2", unit: "tsp", category: "spice" },
                        { name: "cinnamon", amount: "1", unit: "tsp", category: "spice" }
                    ],
                    substitutions: {
                        "ground beef": ["ground lamb", "plant-based meat"],
                        "milk": ["plant-based milk"],
                        "butter": ["olive oil", "vegan butter"]
                    },
                    servingSize: 8,
                    allergens: ["dAiry", "eggs", "gluten"],
                    prepTime: "45 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A Greek interpretation of Italian baked pasta, enriched with spices that reflect the country's position between East and West",
                    pAiringSuggestions: ["Greek red wine", "simple green salad", "crusty bread"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 550,
                        protein: 32,
                        carbs: 45,
                        fat: 28,
                        vitamins: ["B12", "D", "A"],
                        minerals: ["Iron", "Calcium", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["dinner"]
                },
                {
                    name: "Dolmades",
                    description: "Grape leaves stuffed with rice, herbs, and optional meat",
                    cuisine: "Greek",
                    cookingMethods: ["stuffing", "rolling", "simmering"],
                    tools: [
                        "large pot",
                        "mixing bowl",
                        "measuring cups",
                        "colander",
                        "plate for rolling"
                    ],
                    preparationSteps: [
                        "Rinse grape leaves",
                        "Prepare rice filling",
                        "Roll leaves with filling",
                        "Layer in pot",
                        "Simmer until tender",
                        "Cool before serving"
                    ],
                    ingredients: [
                        { name: "grape leaves", amount: "60", unit: "pieces", category: "vegetable" },
                        { name: "rice", amount: "300", unit: "g", category: "grain" },
                        { name: "onions", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "dill", amount: "1", unit: "bunch", category: "herb" },
                        { name: "mint", amount: "1/2", unit: "bunch", category: "herb" },
                        { name: "lemon juice", amount: "60", unit: "ml", category: "acid" },
                        { name: "olive oil", amount: "120", unit: "ml", category: "oil" }
                    ],
                    substitutions: {
                        "grape leaves": ["swiss chard leaves"],
                        "rice": ["quinoa", "bulgur"],
                        "dill": ["fennel fronds"]
                    },
                    servingSize: 6,
                    allergens: ["none"],
                    prepTime: "60 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A dish with ancient origins, dolmades are found throughout the Mediterranean and Middle East, each region having its own variation",
                    pAiringSuggestions: ["tzatziki", "lemon wedges", "Greek white wine"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 220,
                        protein: 4,
                        carbs: 35,
                        fat: 8,
                        vitamins: ["K", "C"],
                        minerals: ["Iron", "Magnesium"]
                    },
                    season: ["spring", "summer"],
                    mealType: ["appetizer", "side"]
                },
                {
                    name: "Galaktoboureko",
                    description: "Custard-filled phyllo pastry soaked in citrus syrup",
                    cuisine: "Greek",
                    cookingMethods: ["baking", "custard-making", "syrup-making"],
                    tools: [
                        "baking dish",
                        "saucepan",
                        "whisk",
                        "pastry brush",
                        "measuring cups"
                    ],
                    preparationSteps: [
                        "Make semolina custard",
                        "Prepare syrup",
                        "Layer phyllo sheets",
                        "Add custard filling",
                        "Top with more phyllo",
                        "Bake until golden",
                        "Pour cool syrup over hot pastry"
                    ],
                    ingredients: [
                        { name: "phyllo dough", amount: "1", unit: "package", category: "pastry" },
                        { name: "milk", amount: "1", unit: "L", category: "dAiry" },
                        { name: "semolina", amount: "150", unit: "g", category: "grain" },
                        { name: "eggs", amount: "4", unit: "large", category: "protein" },
                        { name: "butter", amount: "200", unit: "g", category: "dAiry" },
                        { name: "sugar", amount: "400", unit: "g", category: "sweetener" },
                        { name: "orange zest", amount: "1", unit: "orange", category: "citrus" },
                        { name: "vanilla extract", amount: "2", unit: "tsp", category: "flavoring" }
                    ],
                    substitutions: {
                        "milk": ["almond milk"],
                        "butter": ["vegan butter"],
                        "eggs": ["cornstarch mixture"]
                    },
                    servingSize: 12,
                    allergens: ["dAiry", "eggs", "gluten"],
                    prepTime: "45 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A beloved dessert that showcases the Greek mastery of phyllo pastry and custard-making. The name literally means 'milk bourek'",
                    pAiringSuggestions: ["Greek coffee", "tea"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 420,
                        protein: 8,
                        carbs: 58,
                        fat: 18,
                        vitamins: ["A", "D"],
                        minerals: ["Calcium"]
                    },
                    season: ["all"],
                    mealType: ["dessert"]
                },
                {
                    name: "Fasolada",
                    description: "Traditional Greek white bean soup with vegetables",
                    cuisine: "Greek",
                    cookingMethods: ["simmering", "sautéing"],
                    tools: [
                        "large pot",
                        "wooden spoon",
                        "colander",
                        "sharp knife",
                        "measuring cups"
                    ],
                    preparationSteps: [
                        "Soak beans overnight",
                        "Sauté vegetables",
                        "Add beans and stock",
                        "Simmer until tender",
                        "Season to taste",
                        "Finish with olive oil"
                    ],
                    ingredients: [
                        { name: "white beans", amount: "500", unit: "g", category: "legume" },
                        { name: "carrots", amount: "3", unit: "large", category: "vegetable" },
                        { name: "celery", amount: "3", unit: "stalks", category: "vegetable" },
                        { name: "onions", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
                        { name: "olive oil", amount: "120", unit: "ml", category: "oil" },
                        { name: "tomato paste", amount: "70", unit: "g", category: "vegetable" }
                    ],
                    substitutions: {
                        "white beans": ["navy beans", "cannellini beans"],
                        "celery": ["fennel"],
                        "tomato paste": ["crushed tomatoes"]
                    },
                    servingSize: 6,
                    allergens: ["none"],
                    prepTime: "overnight + 20 minutes",
                    cookTime: "90 minutes",
                    culturalNotes: "Often called Greece's national dish, this hearty soup has sustained generations through both prosperity and hardship",
                    pAiringSuggestions: ["crusty bread", "olives", "feta cheese", "red wine"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 18,
                        carbs: 45,
                        fat: 12,
                        vitamins: ["A", "C", "B6"],
                        minerals: ["Iron", "Potassium", "Magnesium"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Youvetsi",
                    description: "Baked orzo pasta with lamb in tomato sauce",
                    cuisine: "Greek",
                    cookingMethods: ["braising", "baking"],
                    tools: [
                        "Dutch oven",
                        "baking dish",
                        "sharp knife",
                        "wooden spoon",
                        "strainer"
                    ],
                    preparationSteps: [
                        "Brown meat in batches",
                        "Sauté aromatics",
                        "Add tomatoes and stock",
                        "Transfer to baking dish",
                        "Add orzo and bake",
                        "Rest before serving"
                    ],
                    ingredients: [
                        { name: "lamb shoulder", amount: "1", unit: "kg", category: "protein", swaps: ["beef"] },
                        { name: "orzo pasta", amount: "500", unit: "g", category: "pasta" },
                        { name: "onions", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
                        { name: "tomatoes", amount: "800", unit: "g", category: "vegetable" },
                        { name: "cinnamon", amount: "1", unit: "stick", category: "spice" },
                        { name: "olive oil", amount: "80", unit: "ml", category: "oil" }
                    ],
                    substitutions: {
                        "lamb": ["beef chuck", "mushrooms"],
                        "orzo": ["small pasta", "rice"],
                        "tomatoes": ["canned tomatoes"]
                    },
                    servingSize: 6,
                    allergens: ["gluten"],
                    prepTime: "30 minutes",
                    cookTime: "2 hours",
                    culturalNotes: "A hearty one-pot meal that showcases the Greek love of pasta dishes and slow-cooked meats",
                    pAiringSuggestions: ["grated kefalotyri cheese", "Greek red wine", "simple salad"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 580,
                        protein: 35,
                        carbs: 65,
                        fat: 22,
                        vitamins: ["B12", "A"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["dinner"]
                },
                {
                    name: "Revithia",
                    description: "Traditional Greek chickpea soup with lemon and herbs",
                    cuisine: "Greek",
                    cookingMethods: ["simmering", "soaking"],
                    tools: [
                        "large pot",
                        "colander",
                        "wooden spoon",
                        "measuring cups",
                        "sharp knife"
                    ],
                    preparationSteps: [
                        "Soak chickpeas overnight",
                        "Drain and rinse",
                        "Sauté aromatics",
                        "Add chickpeas and stock",
                        "Simmer until tender",
                        "Season with lemon"
                    ],
                    ingredients: [
                        { name: "chickpeas", amount: "500", unit: "g", category: "legume" },
                        { name: "onions", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
                        { name: "olive oil", amount: "80", unit: "ml", category: "oil" },
                        { name: "bay leaves", amount: "2", unit: "whole", category: "herb" },
                        { name: "lemons", amount: "2", unit: "whole", category: "citrus" },
                        { name: "rosemary", amount: "2", unit: "sprigs", category: "herb" }
                    ],
                    substitutions: {
                        "chickpeas": ["canned chickpeas"],
                        "rosemary": ["thyme"],
                        "lemons": ["lemon juice"]
                    },
                    servingSize: 6,
                    allergens: ["none"],
                    prepTime: "overnight + 15 minutes",
                    cookTime: "90 minutes",
                    culturalNotes: "A staple of Greek fasting periods, this hearty soup demonstrates the simplicity and nutrition of Mediterranean cooking",
                    pAiringSuggestions: ["crusty bread", "olives", "raw onion", "olive oil"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 290,
                        protein: 15,
                        carbs: 42,
                        fat: 10,
                        vitamins: ["B6", "C"],
                        minerals: ["Iron", "Folate", "Magnesium"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Gigantes Plaki",
                    description: "Baked giant beans in tomato sauce with herbs",
                    cuisine: "Greek",
                    cookingMethods: ["baking", "simmering"],
                    tools: [
                        "baking dish",
                        "large pot",
                        "colander",
                        "wooden spoon",
                        "sharp knife"
                    ],
                    preparationSteps: [
                        "Soak beans overnight",
                        "Cook beans until tender",
                        "Prepare tomato sauce",
                        "Combine beans and sauce",
                        "Bake until thickened",
                        "Rest before serving"
                    ],
                    ingredients: [
                        { name: "giant beans", amount: "500", unit: "g", category: "legume", swaps: ["lima beans"] },
                        { name: "tomatoes", amount: "800", unit: "g", category: "vegetable" },
                        { name: "carrots", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "celery", amount: "2", unit: "stalks", category: "vegetable" },
                        { name: "parsley", amount: "1", unit: "bunch", category: "herb" },
                        { name: "olive oil", amount: "120", unit: "ml", category: "oil" },
                        { name: "honey", amount: "1", unit: "tbsp", category: "sweetener", optional: true }
                    ],
                    substitutions: {
                        "giant beans": ["lima beans", "butter beans"],
                        "fresh tomatoes": ["canned tomatoes"],
                        "honey": ["sugar", "omit"]
                    },
                    servingSize: 6,
                    allergens: ["none"],
                    prepTime: "overnight + 20 minutes",
                    cookTime: "2 hours",
                    culturalNotes: "A classic dish from Macedonia and northern Greece, showcasing the region's famous giant beans",
                    pAiringSuggestions: ["feta cheese", "crusty bread", "Greek wine"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 16,
                        carbs: 45,
                        fat: 12,
                        vitamins: ["A", "C", "K"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["all"],
                    mealType: ["main", "meze"]
                },
                {
                    name: "Keftedes",
                    description: "Greek meatballs with herbs and spices",
                    cuisine: "Greek",
                    cookingMethods: ["mixing", "frying"],
                    tools: [
                        "mixing bowl",
                        "frying pan",
                        "measuring spoons",
                        "paper towels",
                        "tongs"
                    ],
                    preparationSteps: [
                        "Soak bread in milk",
                        "Mix meat and seasonings",
                        "Form small meatballs",
                        "Chill for 30 minutes",
                        "Fry until golden",
                        "Drain on paper towels"
                    ],
                    ingredients: [
                        { name: "ground beef", amount: "500", unit: "g", category: "protein", swaps: ["lamb"] },
                        { name: "ground pork", amount: "250", unit: "g", category: "protein" },
                        { name: "onion", amount: "1", unit: "large", category: "vegetable" },
                        { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
                        { name: "mint", amount: "1/4", unit: "cup", category: "herb" },
                        { name: "bread", amount: "2", unit: "slices", category: "grain" },
                        { name: "milk", amount: "60", unit: "ml", category: "dAiry" },
                        { name: "olive oil", amount: "120", unit: "ml", category: "oil" }
                    ],
                    substitutions: {
                        "ground meat": ["plant-based meat"],
                        "bread": ["gluten-free bread"],
                        "milk": ["plant-based milk"]
                    },
                    servingSize: 6,
                    allergens: ["gluten", "dAiry"],
                    prepTime: "45 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A popular meze that appears at most Greek celebrations. The mint and dried oregano give them their distinctive flavor",
                    pAiringSuggestions: ["tzatziki", "lemon wedges", "pita bread"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 380,
                        protein: 28,
                        carbs: 12,
                        fat: 26,
                        vitamins: ["B12", "B6"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["appetizer", "main"]
                },
                {
                    name: "Galatopita",
                    description: "Traditional milk pie with phyllo and vanilla custard",
                    cuisine: "Greek",
                    cookingMethods: ["baking", "custard-making"],
                    tools: [
                        "baking dish",
                        "saucepan",
                        "whisk",
                        "mixing bowls",
                        "pastry brush"
                    ],
                    preparationSteps: [
                        "Prepare custard base",
                        "Layer phyllo sheets",
                        "Pour custard mixture",
                        "Top with phyllo",
                        "Bake until golden",
                        "Cool completely"
                    ],
                    ingredients: [
                        { name: "milk", amount: "1", unit: "L", category: "dAiry" },
                        { name: "eggs", amount: "4", unit: "large", category: "protein" },
                        { name: "semolina", amount: "100", unit: "g", category: "grain" },
                        { name: "sugar", amount: "200", unit: "g", category: "sweetener" },
                        { name: "vanilla extract", amount: "2", unit: "tsp", category: "flavoring" },
                        { name: "phyllo dough", amount: "8", unit: "sheets", category: "pastry" },
                        { name: "butter", amount: "100", unit: "g", category: "dAiry" }
                    ],
                    substitutions: {
                        "milk": ["almond milk"],
                        "butter": ["vegan butter"],
                        "eggs": ["cornstarch mixture"]
                    },
                    servingSize: 8,
                    allergens: ["dAiry", "eggs", "gluten"],
                    prepTime: "30 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A comforting dessert that combines the Greek love of custard with phyllo pastry. Often served room temperature",
                    pAiringSuggestions: ["Greek coffee", "cinnamon", "powdered sugar"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 340,
                        protein: 9,
                        carbs: 48,
                        fat: 14,
                        vitamins: ["A", "D", "B12"],
                        minerals: ["Calcium", "Iron"]
                    },
                    season: ["all"],
                    mealType: ["dessert"]
                },
                {
                    name: "Skordalia",
                    description: "Garlic and potato dip with olive oil",
                    cuisine: "Greek",
                    cookingMethods: ["boiling", "mashing", "emulsifying"],
                    tools: [
                        "potato masher",
                        "food processor",
                        "saucepan",
                        "fine strainer",
                        "mixing bowl"
                    ],
                    preparationSteps: [
                        "Boil potatoes",
                        "Mash while hot",
                        "Crush garlic",
                        "Gradually add oil",
                        "Season to taste",
                        "Rest before serving"
                    ],
                    ingredients: [
                        { name: "potatoes", amount: "500", unit: "g", category: "vegetable" },
                        { name: "garlic", amount: "8", unit: "cloves", category: "vegetable" },
                        { name: "olive oil", amount: "200", unit: "ml", category: "oil" },
                        { name: "lemon juice", amount: "2", unit: "tbsp", category: "acid" },
                        { name: "white wine vinegar", amount: "1", unit: "tbsp", category: "acid" },
                        { name: "almonds", amount: "50", unit: "g", category: "nuts", optional: true }
                    ],
                    substitutions: {
                        "potatoes": ["bread", "almonds"],
                        "garlic": ["roasted garlic"],
                        "almonds": ["walnuts", "omit"]
                    },
                    servingSize: 6,
                    allergens: ["nuts (if using)"],
                    prepTime: "20 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A powerful garlic dip traditionally served with fried fish or vegetables. Regional variations use bread or nuts instead of potatoes",
                    pAiringSuggestions: ["fried cod", "beetroot", "bread", "raw vegetables"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "medium",
                    nutrition: {
                        calories: 260,
                        protein: 3,
                        carbs: 18,
                        fat: 22,
                        vitamins: ["C", "B6"],
                        minerals: ["Potassium", "Magnesium"]
                    },
                    season: ["all"],
                    mealType: ["appetizer", "sauce"]
                },
                {
                    name: "Melitzanosalata",
                    description: "Smoky eggplant dip with garlic and olive oil",
                    cuisine: "Greek",
                    cookingMethods: ["grilling", "mashing"],
                    tools: [
                        "grill",
                        "food processor",
                        "sharp knife",
                        "mixing bowl",
                        "colander"
                    ],
                    preparationSteps: [
                        "Grill eggplants until charred",
                        "Drain excess liquid",
                        "Remove skin",
                        "Mash with garlic",
                        "Add oil gradually",
                        "Season to taste"
                    ],
                    ingredients: [
                        { name: "eggplants", amount: "2", unit: "large", category: "vegetable" },
                        { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
                        { name: "olive oil", amount: "80", unit: "ml", category: "oil" },
                        { name: "lemon juice", amount: "2", unit: "tbsp", category: "acid" },
                        { name: "parsley", amount: "1/4", unit: "cup", category: "herb" },
                        { name: "red onion", amount: "1/2", unit: "small", category: "vegetable", optional: true }
                    ],
                    substitutions: {
                        "eggplants": ["roasted red peppers"],
                        "red onion": ["shallots", "omit"],
                        "parsley": ["dill"]
                    },
                    servingSize: 6,
                    allergens: ["none"],
                    prepTime: "15 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "A smoky dip that showcases the Greek mastery of eggplant preparation. The charring process is crucial for authentic flavor",
                    pAiringSuggestions: ["pita bread", "crudités", "grilled meat"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 120,
                        protein: 2,
                        carbs: 8,
                        fat: 10,
                        vitamins: ["C", "B6"],
                        minerals: ["Potassium", "Manganese"]
                    },
                    season: ["summer", "autumn"],
                    mealType: ["appetizer", "meze"]
                }
            ]
        },
        dessert: {
            all: [
            // ... dessert dishes
            ]
        }
    },
    traditionalSauces: {
        tzatziki: {
            name: "Tzatziki",
            description: "Cooling yogurt and cucumber sauce with garlic and herbs",
            base: "yogurt",
            keyIngredients: ["Greek yogurt", "cucumber", "garlic", "olive oil", "dill"],
            culinaryUses: ["dipping sauce", "condiment", "marinade", "meze"],
            variants: ["Mint tzatziki", "Spicy tzatziki", "Avocado tzatziki"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Moon", "Venus", "cancer"],
            seasonality: "all",
            preparationNotes: "Properly draining the cucumber is key to a thick consistency",
            technicalTips: "Salt and drain cucumbers for at least 30 minutes before mixing"
        },
        avgolemono: {
            name: "Avgolemono",
            description: "Silky egg and lemon sauce that thickens soups and stews",
            base: "eggs and lemon",
            keyIngredients: ["eggs", "lemon juice", "broth", "rice or orzo (optional)"],
            culinaryUses: ["soup base", "sauce for dolmades", "fish sauce", "vegetable dressing"],
            variants: ["Thick sauce", "Soup form", "Vegetable avgolemono"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mercury", "Moon", "gemini"],
            seasonality: "winter, spring",
            preparationNotes: "The key is to temper the eggs properly to avoid curdling",
            technicalTips: "Add hot broth to eggs very slowly while whisking constantly"
        },
        ladolemono: {
            name: "Ladolemono",
            description: "Simple but powerful emulsion of olive oil and lemon juice",
            base: "olive oil and lemon",
            keyIngredients: ["extra virgin olive oil", "lemon juice", "garlic", "oregano"],
            culinaryUses: ["dressing for grilled foods", "marinade", "seafood sauce", "vegetable dressing"],
            variants: ["Mustard ladolemono", "Herb-infused", "Spicy version"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Sun", "Mercury", "leo"],
            seasonality: "all",
            preparationNotes: "The ratio is typically 3 parts oil to 1 part lemon juice",
            technicalTips: "Whisk vigorously or blend for proper emulsification"
        },
        skordalia: {
            name: "Skordalia",
            description: "Pungent garlic sauce made with potato, bread, or nuts",
            base: "garlic and starch",
            keyIngredients: ["garlic", "potato or bread", "olive oil", "vinegar", "almonds (optional)"],
            culinaryUses: ["fish accompaniment", "vegetable dip", "spread", "meze"],
            variants: ["Potato skordalia", "Bread skordalia", "Almond skordalia"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Saturn", "aries"],
            seasonality: "all",
            preparationNotes: "Achieving the right balance of garlic is crucial - adjust to taste",
            technicalTips: "Slowly incorporate oil while blending for proper emulsification"
        },
        htipiti: {
            name: "Htipiti",
            description: "Spicy roasted red pepper and feta dip",
            base: "roasted peppers and cheese",
            keyIngredients: ["roasted red peppers", "feta cheese", "olive oil", "garlic", "chili"],
            culinaryUses: ["bread spread", "vegetable dip", "sandwich filling", "meze"],
            variants: ["Spicy htipiti", "Smoky htipiti", "Creamy htipiti"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Sun", "leo"],
            seasonality: "summer, autumn",
            preparationNotes: "The smokiness of the peppers is essential for authentic flavor",
            technicalTips: "Roast peppers directly over flame for best smoky taste"
        }
    },
    sauceRecommender: {
        forProtein: {
            chicken: ["ladolemono", "avgolemono", "tomato-based sauce"],
            lamb: ["tzatziki", "ladolemono", "minty yogurt sauce"],
            fish: ["skordalia", "ladolemono", "avgolemono", "lemon sauce"],
            beef: ["tomato-based sauce", "yogurt-based sauce", "red wine reduction"],
            vegetable: ["skordalia", "tzatziki", "tahini sauce"],
            seafood: ["ladolemono", "skordalia", "garlic oil", "lemon sauce"],
            pork: ["ladolemono", "htipiti", "mustard sauce"]
        },
        forVegetable: {
            leafy: ["ladolemono", "tahini sauce", "yogurt-based sauce"],
            root: ["skordalia", "olive oil and lemon", "tomato-based sauce"],
            eggplant: ["tzatziki", "tomato sauce", "tahini sauce", "garlic sauce"],
            legumes: ["olive oil and lemon", "tomato sauce", "herb oil", "vinegar sauce"],
            squash: ["yogurt sauce", "tahini", "olive oil and herbs"],
            zucchini: ["tzatziki", "mint sauce", "ladolemono"]
        },
        forCookingMethod: {
            grilling: ["tzatziki", "ladolemono", "herb oil", "htipiti"],
            roasting: ["skordalia", "yogurt sauce", "olive oil and lemon", "avgolemono"],
            braising: ["avgolemono", "tomato sauce", "olive oil finish", "red wine sauce"],
            frying: ["tzatziki", "skordalia", "lemon wedges", "garlic sauce"],
            stewing: ["avgolemono", "olive oil finish", "herb oil", "red wine reduction"],
            baking: ["ladolemono", "yogurt sauce", "lemon sauce"]
        },
        byAstrological: { Fire: ["spicy yogurt sauce", "red pepper-based sauce", "garlic oil", "htipiti"],
            Earth: ["skordalia", "mushroom-based sauce", "tahini sauce", "olive tapenade"],
            Air: ["ladolemono", "herb-infused oil", "light yogurt sauce", "lemon vinaigrette"],
            Water: ["avgolemono", "tzatziki", "cucumber-based sauce", "fish sauce"]
        },
        byRegion: {
            mainland: ["skordalia", "tomato-based sauces", "avgolemono", "htipiti"],
            islands: ["ladolemono", "herb oils", "fish-based sauces", "lemon sauces"],
            northern: ["butter-based sauces", "yogurt sauces", "paprika oil", "garlic sauce"],
            crete: ["herb-infused olive oil", "wine reductions", "dakos-style sauce", "ancient grain sauces"],
            peloponnese: ["oil and lemon sauces", "oregano-infused oils", "wine reductions"],
            cyclades: ["caper sauces", "olive pastes", "fresh herb oils", "seafood reductions"]
        },
        byDietary: {
            vegetarian: ["tahini sauce", "skordalia", "olive oil and lemon", "htipiti"],
            vegan: ["ladolemono", "tahini sauce", "herb oil", "olive tapenade"],
            glutenFree: ["tzatziki", "ladolemono", "herb oil", "yogurt-based sauces"],
            dAiryFree: ["ladolemono", "tomato-based sauce", "herb oil", "garlic sauce"],
            lowCarb: ["tzatziki", "olive oil dips", "lemon sauce", "herb sauce"]
        }
    },
    cookingTechniques: [
        {
            name: "Psisimo",
            description: "Greek-style grilling, often using olive oil, lemon, and herbs",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["charcoal grill", "skewers", "brush for oil", "tongs"],
            bestFor: ["lamb", "pork", "chicken", "seafood", "vegetables"]
        },
        {
            name: "Stifado",
            description: "Slow-cooked stew with pearl onions, wine, and tomatoes",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["heavy pot", "wooden spoon", "sharp knife", "measuring cups"],
            bestFor: ["beef", "rabbit", "game meat", "octopus"]
        },
        {
            name: "Sotirito",
            description: "Shallow frying, often used for vegetables and fritters",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["heavy-bottomed pan", "slotted spoon", "paper towels", "thermometer"],
            bestFor: ["zucchini fritters", "eggplant", "fish", "meatballs"]
        },
        {
            name: "Yiachni",
            description: "Braising in tomato sauce with herbs and spices",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["Dutch oven", "wooden spoon", "sharp knife", "measuring spoons"],
            bestFor: ["green beans", "okra", "rabbit", "beef"]
        },
        {
            name: "Plasto",
            description: "Traditional pie-making technique with layered phyllo or other dough",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["baking pan", "pastry brush", "rolling pin", "sharp knife"],
            bestFor: ["spinach pie", "cheese pie", "meat pie", "vegetable pie"]
        }
    ],
    regionalCuisines: {
        crete: {
            name: "Cretan Cuisine",
            description: "Focused on local ingredients, wild greens, olive oil, and rustic preparation methods",
            signature: ["dakos", "gamopilafo", "staka", "sfakian pie"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Saturn", "Jupiter", "taurus"],
            seasonality: "all"
        },
        macedonia: {
            name: "Macedonian Cuisine",
            description: "Northern Greek cuisine with strong Balkan influences and hearty dishes",
            signature: ["bougatsa", "pastitsada", "gigantes plaki", "trahana soup"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Saturn", "Mars", "capricorn"],
            seasonality: "all"
        },
        cyclades: {
            name: "Cycladic Cuisine",
            description: "Island cuisine featuring seafood, local cheeses, and Sun-dried ingredients",
            signature: ["fava dip", "kakavia fish soup", "matsata pasta", "louza cured pork"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Neptune", "Moon", "pisces"],
            seasonality: "all"
        },
        peloponnese: {
            name: "Peloponnesian Cuisine",
            description: "Rich in olive oil, citrus, and slow-cooked meat and bean dishes",
            signature: ["rooster kokkinisto", "diples", "kagianas", "lagoto rabbit stew"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Venus", "aries"],
            seasonality: "all"
        }
    },
    elementalProperties: { Fire: 0.20, Water: 0.30, Earth: 0.40, Air: 0.10 }
};
exports.default = exports.greek;
