export const korean = {
    id: "korean",
    name: "Korean",
    description: "Traditional Korean cuisine emphasizing fermented foods, communal dining, and balanced flavors with rice, banchan, and grilled meats",
    dishes: {
        breakfast: {
            all: [
                {
                    name: "Gyeran Bap",
                    description: "Rice with soft scrambled eggs and sesame oil",
                    cuisine: "Korean",
                    cookingMethods: ["steaming", "scrambling", "mixing"],
                    tools: [
                        "rice cooker",
                        "non-stick pan",
                        "chopsticks",
                        "small bowl",
                        "rice paddle"
                    ],
                    preparationSteps: [
                        "Cook rice",
                        "Gently scramble eggs",
                        "Season with sesame oil",
                        "Mix with hot rice",
                        "Top with seaweed",
                        "Garnish with green onion"
                    ],
                    ingredients: [
                        { name: "steamed rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu scramble"] },
                        { name: "sesame oil", amount: "1", unit: "tsp", category: "oil" },
                        { name: "soy sauce", amount: "1", unit: "tsp", category: "seasoning" },
                        { name: "seaweed", amount: "1", unit: "sheet", category: "garnish" },
                        { name: "green onion", amount: "1", unit: "stalk", category: "vegetable" }
                    ],
                    substitutions: {
                        "eggs": ["soft tofu", "Just Egg"],
                        "white rice": ["brown rice", "quinoa"],
                        "seaweed": ["furikake", "sesame seeds"]
                    },
                    servingSize: 1,
                    allergens: ["egg", "soy"],
                    prepTime: "5 minutes",
                    cookTime: "10 minutes",
                    culturalNotes: "A popular comfort food in Korean households, especially for breakfast or quick meals. The dish showcases the Korean love for eggs and rice combinations",
                    pAiringSuggestions: ["kimchi", "doenjang soup", "pickled radish"],
                    dietaryInfo: ["vegetarian"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 14,
                        carbs: 62,
                        fat: 10,
                        vitamins: ["B12", "D"],
                        minerals: ["Iron", "Selenium"]
                    },
                    timeToMake: "15 minutes",
                    season: ["all"],
                    mealType: ["breakfast"],
                    elementalProperties: { Fire: 0.20, Water: 0.30, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Juk",
                    description: "Korean rice porridge with various toppings",
                    cuisine: "Korean",
                    cookingMethods: ["simmering", "stirring", "garnishing"],
                    tools: [
                        "heavy-bottomed pot",
                        "wooden spoon",
                        "ladle",
                        "serving bowls",
                        "measuring cups"
                    ],
                    preparationSteps: [
                        "Rinse rice thoroughly",
                        "Simmer rice with water",
                        "Stir occasionally",
                        "Add seasonings",
                        "Cook until creamy",
                        "Add toppings"
                    ],
                    ingredients: [
                        { name: "short grain rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "mushrooms", amount: "100", unit: "g", category: "vegetable", swaps: ["other vegetables"] },
                        { name: "carrots", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "ginger", amount: "1", unit: "tbsp", category: "spice" },
                        { name: "kimchi", amount: "100", unit: "g", category: "fermented", optional: true }
                    ],
                    substitutions: {
                        "short grain rice": ["brown rice", "mixed grains"],
                        "mushrooms": ["zucchini", "squash"],
                        "kimchi": ["pickled vegetables"]
                    },
                    servingSize: 2,
                    allergens: ["none"],
                    prepTime: "10 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "A traditional Korean comfort food often served to the sick or elderly. Different versions exist for various occasions and seasons",
                    pAiringSuggestions: ["kimchi", "pickled vegetables", "side dishes"],
                    dietaryInfo: ["vegetarian", "vegan"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 8,
                        carbs: 68,
                        fat: 4,
                        vitamins: ["B6", "C"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["winter", "all"],
                    mealType: ["breakfast", "light meal"]
                }
            ],
            summer: [
                {
                    name: "Kong Guksu",
                    description: "Chilled soy milk noodle soup",
                    cuisine: "Korean",
                    cookingMethods: ["blending", "boiling", "chilling"],
                    tools: [
                        "blender",
                        "strainer",
                        "large pot",
                        "fine mesh sieve",
                        "serving bowls"
                    ],
                    preparationSteps: [
                        "Soak soybeans overnight",
                        "Blend soybeans with water",
                        "Strain milk mixture",
                        "Cook noodles",
                        "Chill broth",
                        "Assemble with toppings"
                    ],
                    ingredients: [
                        { name: "soybeans", amount: "200", unit: "g", category: "legume" },
                        { name: "somyeon noodles", amount: "200", unit: "g", category: "grain", swaps: ["rice noodles"] },
                        { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "tomato", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "sesame seeds", amount: "1", unit: "tbsp", category: "garnish" }
                    ],
                    substitutions: {
                        "soybeans": ["store-bought soy milk"],
                        "somyeon": ["somen", "rice noodles"],
                        "cucumber": ["zucchini", "summer squash"]
                    },
                    servingSize: 2,
                    allergens: ["soy", "wheat"],
                    prepTime: "overnight soaking + 15 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "A refreshing summer dish that showcases the versatility of soybeans in Korean cuisine. Popular during hot summer months",
                    pAiringSuggestions: ["kimchi", "pickled radish", "side dishes"],
                    dietaryInfo: ["vegetarian", "vegan"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 420,
                        protein: 18,
                        carbs: 65,
                        fat: 12,
                        vitamins: ["C", "K"],
                        minerals: ["Calcium", "Iron"]
                    },
                    season: ["summer"],
                    mealType: ["lunch"]
                }
            ]
        },
        lunch: {
            all: [
                {
                    name: "Bibimbap",
                    description: "Mixed rice bowl with vegetables and gochujang",
                    cuisine: "Korean",
                    cookingMethods: ["stir-frying", "steaming", "assembling"],
                    tools: [
                        "rice cooker",
                        "multiple small pans",
                        "stone bowl (optional)",
                        "mixing bowls",
                        "sharp knife"
                    ],
                    preparationSteps: [
                        "Cook rice",
                        "Prepare vegetables separately",
                        "Season each component",
                        "Cook egg sunny-side up",
                        "Arrange in bowl",
                        "Add gochujang",
                        "Mix before eating"
                    ],
                    ingredients: [
                        { name: "steamed rice", amount: "2", unit: "cups", category: "grain" },
                        { name: "bulgogi", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
                        { name: "spinach", amount: "100", unit: "g", category: "vegetable" },
                        { name: "carrots", amount: "100", unit: "g", category: "vegetable" },
                        { name: "bean sprouts", amount: "100", unit: "g", category: "vegetable" },
                        { name: "egg", amount: "1", unit: "large", category: "protein", swaps: ["tofu"] },
                        { name: "gochujang", amount: "2", unit: "tbsp", category: "sauce" },
                        { name: "sesame oil", amount: "1", unit: "tbsp", category: "oil" }
                    ],
                    substitutions: {
                        "bulgogi": ["marinated mushrooms", "tofu", "tempeh"],
                        "gochujang": ["sriracha + miso paste"],
                        "egg": ["fried tofu", "avocado"]
                    },
                    servingSize: 2,
                    allergens: ["egg", "soy"],
                    prepTime: "30 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "Originally served to royalty, bibimbap represents the Korean principle of balanced eating with its colorful array of vegetables. The dish name means 'mixed rice'",
                    pAiringSuggestions: ["kimchi", "doenjang soup", "korean tea"],
                    dietaryInfo: ["adaptable to vegetarian/vegan"],
                    spiceLevel: "adjustable",
                    nutrition: {
                        calories: 580,
                        protein: 28,
                        carbs: 82,
                        fat: 18,
                        vitamins: ["A", "C", "B12"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Kimchi Jjigae",
                    description: "Spicy kimchi stew with pork and tofu",
                    cuisine: "Korean",
                    cookingMethods: ["simmering", "stewing"],
                    tools: [
                        "earthenware pot",
                        "ladle",
                        "cutting board",
                        "knife",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Sauté pork and kimchi",
                        "Add broth and seasonings",
                        "Simmer until meat is tender",
                        "Add tofu",
                        "Finish with green onions",
                        "Serve bubbling hot"
                    ],
                    ingredients: [
                        { name: "aged kimchi", amount: "300", unit: "g", category: "fermented" },
                        { name: "pork belly", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
                        { name: "tofu", amount: "200", unit: "g", category: "protein" },
                        { name: "gochugaru", amount: "1", unit: "tbsp", category: "spice" },
                        { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" }
                    ],
                    substitutions: {
                        "pork belly": ["mushrooms", "firm tofu"],
                        "gochugaru": ["red pepper flakes"],
                        "aged kimchi": ["fresh kimchi + fish sauce"]
                    },
                    servingSize: 4,
                    allergens: ["soy"],
                    prepTime: "15 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "A quintessential Korean comfort food that makes use of aged kimchi. The dish exemplifies the Korean philosophy of not wasting food",
                    pAiringSuggestions: ["steamed rice", "fried egg", "side dishes"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "medium to hot",
                    nutrition: {
                        calories: 420,
                        protein: 32,
                        carbs: 18,
                        fat: 28,
                        vitamins: ["C", "B12", "K"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["autumn", "winter", "all"],
                    mealType: ["lunch", "dinner"]
                }
            ],
            summer: [
                {
                    name: "Naengmyeon",
                    description: "Cold buckwheat noodles in chilled broth",
                    cuisine: "Korean",
                    cookingMethods: ["boiling", "chilling", "assembling"],
                    tools: [
                        "large pot",
                        "strainer",
                        "mixing bowls",
                        "mandoline",
                        "scissors"
                    ],
                    preparationSteps: [
                        "Prepare and chill broth",
                        "Cook and rinse noodles",
                        "Slice vegetables thinly",
                        "Boil and slice egg",
                        "Assemble in bowls",
                        "Add ice cubes",
                        "Serve immediately"
                    ],
                    ingredients: [
                        { name: "buckwheat noodles", amount: "200", unit: "g", category: "grain", swaps: ["sweet potato noodles"] },
                        { name: "beef broth", amount: "500", unit: "ml", category: "broth", swaps: ["vegetable broth"] },
                        { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "pear", amount: "1/2", unit: "medium", category: "fruit" },
                        { name: "egg", amount: "1", unit: "large", category: "protein" },
                        { name: "mustard sauce", amount: "2", unit: "tbsp", category: "sauce" }
                    ],
                    substitutions: {
                        "beef broth": ["vegetable broth", "mushroom broth"],
                        "buckwheat noodles": ["sweet potato noodles", "soba"],
                        "pear": ["asian pear", "apple"]
                    },
                    servingSize: 2,
                    allergens: ["wheat", "egg"],
                    prepTime: "20 minutes",
                    cookTime: "15 minutes plus chilling time",
                    culturalNotes: "A refreshing summer dish that originated in North Korea. The cold temperature and chewy noodles are essential characteristics",
                    pAiringSuggestions: ["kimchi", "dongchimi", "soju"],
                    dietaryInfo: ["adaptable to vegetarian/vegan"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 380,
                        protein: 18,
                        carbs: 72,
                        fat: 4,
                        vitamins: ["C", "B1"],
                        minerals: ["Iron", "Manganese"]
                    },
                    season: ["summer"],
                    mealType: ["lunch", "dinner"]
                }
            ],
            winter: [
                {
                    name: "Tteokguk",
                    description: "Rice cake soup traditionally eaten on New Year's Day",
                    cuisine: "Korean",
                    cookingMethods: ["simmering", "slicing", "garnishing"],
                    tools: [
                        "large pot",
                        "knife",
                        "strainer",
                        "ladle",
                        "serving bowls"
                    ],
                    preparationSteps: [
                        "Prepare beef broth",
                        "Slice rice cakes",
                        "Cook rice cakes in broth",
                        "Season to taste",
                        "Add egg garnish",
                        "Top with seaweed"
                    ],
                    ingredients: [
                        { name: "sliced rice cakes", amount: "300", unit: "g", category: "grain" },
                        { name: "beef brisket", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
                        { name: "eggs", amount: "2", unit: "large", category: "protein" },
                        { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" },
                        { name: "seaweed", amount: "2", unit: "sheets", category: "garnish" }
                    ],
                    substitutions: {
                        "beef": ["mushrooms", "vegetable broth"],
                        "eggs": ["tofu", "vegan egg substitute"],
                        "seaweed": ["spinach", "other greens"]
                    },
                    servingSize: 4,
                    allergens: ["egg"],
                    prepTime: "20 minutes",
                    cookTime: "40 minutes",
                    culturalNotes: "Eating tteokguk on New Year's Day is said to add a year to one's age. The white rice cakes symbolize purity and a fresh start",
                    pAiringSuggestions: ["kimchi", "japchae", "Korean tea"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 340,
                        protein: 18,
                        carbs: 52,
                        fat: 8,
                        vitamins: ["B12", "D"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["winter"],
                    mealType: ["holiday", "lunch", "dinner"]
                }
            ]
        },
        dinner: {
            all: [
                {
                    name: "Samgyeopsal-gui",
                    description: "Grilled pork belly with lettuce wraps and condiments",
                    cuisine: "Korean",
                    cookingMethods: ["grilling", "wrapping", "assembling"],
                    tools: [
                        "tabletop grill",
                        "tongs",
                        "scissors",
                        "serving plates",
                        "lettuce basket"
                    ],
                    preparationSteps: [
                        "Prepare lettuce and perilla leaves",
                        "Slice garlic and peppers",
                        "Heat grill",
                        "Cook pork belly",
                        "Prepare dipping sauces",
                        "Assemble wraps as eating"
                    ],
                    ingredients: [
                        { name: "pork belly", amount: "600", unit: "g", category: "protein" },
                        { name: "lettuce leaves", amount: "1", unit: "head", category: "vegetable" },
                        { name: "perilla leaves", amount: "20", unit: "leaves", category: "herb" },
                        { name: "garlic", amount: "1", unit: "head", category: "vegetable" },
                        { name: "ssamjang", amount: "4", unit: "tbsp", category: "sauce" },
                        { name: "kimchi", amount: "200", unit: "g", category: "side dish" }
                    ],
                    substitutions: {
                        "pork belly": ["mushrooms", "tofu steaks"],
                        "perilla leaves": ["sesame leaves", "mint leaves"],
                        "ssamjang": ["gochujang + doenjang"]
                    },
                    servingSize: 4,
                    allergens: ["soy"],
                    prepTime: "15 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "A popular Korean BBQ dish that emphasizes communal dining. The ritual of grilling and wrapping meat is an essential part of Korean food culture",
                    pAiringSuggestions: ["soju", "beer", "steamed rice", "doenjang soup"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "adjustable",
                    nutrition: {
                        calories: 650,
                        protein: 35,
                        carbs: 15,
                        fat: 52,
                        vitamins: ["B1", "K"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["dinner", "social dining"]
                },
                {
                    name: "Sundubu Jjigae",
                    description: "Spicy soft tofu stew",
                    cuisine: "Korean",
                    cookingMethods: ["simmering", "stewing"],
                    tools: [
                        "earthenware pot",
                        "ladle",
                        "measuring spoons",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Sauté aromatics",
                        "Add broth and seasonings",
                        "Simmer ingredients",
                        "Add soft tofu",
                        "Crack egg on top",
                        "Serve bubbling hot"
                    ],
                    ingredients: [
                        { name: "soft tofu", amount: "400", unit: "g", category: "protein" },
                        { name: "clams", amount: "200", unit: "g", category: "seafood", optional: true },
                        { name: "gochugaru", amount: "2", unit: "tbsp", category: "seasoning" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "aromatic" },
                        { name: "egg", amount: "1", unit: "large", category: "protein" },
                        { name: "mushrooms", amount: "100", unit: "g", category: "vegetable" }
                    ],
                    substitutions: {
                        "clams": ["mushrooms", "vegetables"],
                        "egg": ["vegan egg substitute"],
                        "gochugaru": ["red pepper flakes"]
                    },
                    servingSize: 2,
                    allergens: ["shellfish", "soy", "egg"],
                    prepTime: "15 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A comforting stew that showcases the silky texture of fresh soft tofu. Popular in both restaurants and homes",
                    pAiringSuggestions: ["rice", "kimchi", "side dishes"],
                    dietaryInfo: ["adaptable to vegetarian/vegan"],
                    spiceLevel: "adjustable",
                    nutrition: {
                        calories: 320,
                        protein: 24,
                        carbs: 12,
                        fat: 22,
                        vitamins: ["B12", "D", "K"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Bulgogi",
                    description: "Marinated and grilled beef",
                    cuisine: "Korean",
                    cookingMethods: ["marinating", "grilling", "pan-frying"],
                    tools: [
                        "grill or skillet",
                        "mixing bowls",
                        "sharp knife",
                        "tongs",
                        "grater"
                    ],
                    preparationSteps: [
                        "Slice beef thinly",
                        "Prepare marinade",
                        "Marinate meat",
                        "Heat grill or pan",
                        "Cook in batches",
                        "Garnish and serve"
                    ],
                    ingredients: [
                        { name: "beef sirloin", amount: "500", unit: "g", category: "protein" },
                        { name: "asian pear", amount: "1", unit: "medium", category: "fruit" },
                        { name: "soy sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "sesame oil", amount: "2", unit: "tbsp", category: "oil" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "aromatic" },
                        { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" }
                    ],
                    substitutions: {
                        "beef sirloin": ["mushrooms", "firm tofu", "seitan"],
                        "asian pear": ["apple", "kiwi"],
                        "soy sauce": ["coconut aminos"]
                    },
                    servingSize: 4,
                    allergens: ["soy"],
                    prepTime: "1 hour",
                    cookTime: "15 minutes",
                    culturalNotes: "A beloved Korean dish that exemplifies the balance of sweet and savory flavors. The fruit in the marinade helps tenderize the meat",
                    pAiringSuggestions: ["lettuce leaves", "rice", "ssamjang", "kimchi"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 420,
                        protein: 35,
                        carbs: 12,
                        fat: 28,
                        vitamins: ["B12", "B6"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Dakgalbi",
                    description: "Spicy stir-fried chicken with rice cakes and vegetables",
                    cuisine: "Korean",
                    cookingMethods: ["stir-frying", "simmering"],
                    tools: [
                        "large skillet or dakgalbi pan",
                        "tongs",
                        "knife",
                        "mixing bowls",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Marinate chicken",
                        "Prepare vegetables",
                        "Heat pan",
                        "Cook chicken partially",
                        "Add vegetables and rice cakes",
                        "Stir-fry until done",
                        "Optional: Add rice for bokkeumbap"
                    ],
                    ingredients: [
                        { name: "chicken thigh", amount: "600", unit: "g", category: "protein" },
                        { name: "rice cakes", amount: "200", unit: "g", category: "grain" },
                        { name: "cabbage", amount: "300", unit: "g", category: "vegetable" },
                        { name: "sweet potato", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "gochugaru", amount: "3", unit: "tbsp", category: "seasoning" },
                        { name: "gochujang", amount: "3", unit: "tbsp", category: "sauce" }
                    ],
                    substitutions: {
                        "chicken thigh": ["tofu", "mushrooms", "cauliflower"],
                        "rice cakes": ["sliced rice noodles"],
                        "gochujang": ["miso paste + chili sauce"]
                    },
                    servingSize: 4,
                    allergens: ["soy", "wheat"],
                    prepTime: "25 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "Originally from Chuncheon city, this communal dish is popular among young people and is often eaten while sharing soju",
                    pAiringSuggestions: ["soju", "beer", "corn cheese", "steamed rice"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "medium to hot",
                    nutrition: {
                        calories: 520,
                        protein: 32,
                        carbs: 45,
                        fat: 26,
                        vitamins: ["A", "C", "B6"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["all"],
                    mealType: ["dinner", "social dining"]
                },
                {
                    name: "Haemul Pajeon",
                    description: "Seafood and green onion pancake",
                    cuisine: "Korean",
                    cookingMethods: ["pan-frying", "mixing"],
                    tools: [
                        "large non-stick pan",
                        "mixing bowls",
                        "spatula",
                        "measuring cups",
                        "knife"
                    ],
                    preparationSteps: [
                        "Prepare batter",
                        "Clean seafood",
                        "Slice vegetables",
                        "Heat pan with oil",
                        "Pour and spread batter",
                        "Add toppings",
                        "Flip and cook until crispy"
                    ],
                    ingredients: [
                        { name: "flour", amount: "2", unit: "cups", category: "grain" },
                        { name: "green onions", amount: "10", unit: "stalks", category: "vegetable" },
                        { name: "squid", amount: "150", unit: "g", category: "seafood", swaps: ["mushrooms"] },
                        { name: "shrimp", amount: "150", unit: "g", category: "seafood", swaps: ["vegetables"] },
                        { name: "eggs", amount: "1", unit: "large", category: "protein" },
                        { name: "kimchi", amount: "100", unit: "g", category: "vegetable", optional: true }
                    ],
                    substitutions: {
                        "seafood": ["mushrooms", "vegetables", "tofu"],
                        "eggs": ["chickpea flour batter"],
                        "wheat flour": ["rice flour", "gluten-free mix"]
                    },
                    servingSize: 4,
                    allergens: ["wheat", "shellfish", "egg"],
                    prepTime: "20 minutes",
                    cookTime: "15 minutes",
                    culturalNotes: "A popular rainy day food in Korea, often enjoyed with makgeolli (rice wine). The sound of sizzling pajeon matches the sound of rain",
                    pAiringSuggestions: ["makgeolli", "soju", "dipping sauce"],
                    dietaryInfo: ["contains seafood"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 380,
                        protein: 18,
                        carbs: 52,
                        fat: 14,
                        vitamins: ["B12", "D"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all", "rainy days"],
                    mealType: ["snack", "dinner"]
                },
                {
                    name: "Gamjatang",
                    description: "Spicy pork spine soup with potatoes",
                    cuisine: "Korean",
                    cookingMethods: ["simmering", "boiling"],
                    tools: [
                        "large pot",
                        "strainer",
                        "ladle",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Soak pork bones",
                        "Prepare broth",
                        "Cook potatoes",
                        "Add seasonings",
                        "Simmer until meat tender",
                        "Add perilla leaves"
                    ],
                    ingredients: [
                        { name: "pork spine", amount: "1", unit: "kg", category: "protein" },
                        { name: "potatoes", amount: "4", unit: "medium", category: "vegetable" },
                        { name: "perilla leaves", amount: "10", unit: "leaves", category: "herb" },
                        { name: "gochugaru", amount: "3", unit: "tbsp", category: "seasoning" },
                        { name: "garlic", amount: "8", unit: "cloves", category: "aromatic" },
                        { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" }
                    ],
                    substitutions: {
                        "pork spine": ["mushrooms", "firm tofu"],
                        "perilla leaves": ["basil", "mint"],
                        "gochugaru": ["red pepper flakes"]
                    },
                    servingSize: 4,
                    allergens: ["none"],
                    prepTime: "30 minutes",
                    cookTime: "2 hours",
                    culturalNotes: "A hearty soup that became popular during the Korean War as a way to use affordable cuts of meat. Now it's a beloved hangover cure",
                    pAiringSuggestions: ["rice", "kimchi", "soju"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "medium to hot",
                    nutrition: {
                        calories: 480,
                        protein: 38,
                        carbs: 32,
                        fat: 24,
                        vitamins: ["B12", "A", "C"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["lunch", "dinner"]
                },
                {
                    name: "Bossam",
                    description: "Boiled pork belly wrapped in cabbage leaves",
                    cuisine: "Korean",
                    cookingMethods: ["boiling", "wrapping"],
                    tools: [
                        "large pot",
                        "strainer",
                        "serving plates",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Boil pork with aromatics",
                        "Prepare cabbage leaves",
                        "Slice cooked pork",
                        "Make sauces",
                        "Arrange components",
                        "Wrap and eat"
                    ],
                    ingredients: [
                        { name: "pork belly", amount: "1", unit: "kg", category: "protein" },
                        { name: "napa cabbage", amount: "1", unit: "head", category: "vegetable" },
                        { name: "garlic", amount: "10", unit: "cloves", category: "aromatic" },
                        { name: "ginger", amount: "50", unit: "g", category: "aromatic" },
                        { name: "saeujeot", amount: "100", unit: "g", category: "sauce", optional: true },
                        { name: "radish kimchi", amount: "200", unit: "g", category: "side dish" }
                    ],
                    substitutions: {
                        "pork belly": ["mushrooms", "tofu"],
                        "saeujeot": ["soybean paste"],
                        "napa cabbage": ["lettuce", "perilla leaves"]
                    },
                    servingSize: 6,
                    allergens: ["fish", "shellfish"],
                    prepTime: "20 minutes",
                    cookTime: "1.5 hours",
                    culturalNotes: "Originally a winter dish when kimchi was made. The boiled pork complemented fresh kimchi perfectly",
                    pAiringSuggestions: ["soju", "beer", "rice", "kimchi"],
                    dietaryInfo: ["contains meat"],
                    spiceLevel: "adjustable",
                    nutrition: {
                        calories: 650,
                        protein: 45,
                        carbs: 15,
                        fat: 48,
                        vitamins: ["B1", "B12"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["winter", "all"],
                    mealType: ["dinner", "social dining"]
                }
            ],
            winter: [
                {
                    name: "Budae Jjigae",
                    description: "Korean army base stew with mixed ingredients",
                    cuisine: "Korean",
                    ingredients: [
                        { name: "spam", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "korean sausage", amount: "200", unit: "g", category: "protein", swaps: ["vegetarian sausage"] },
                        { name: "kimchi", amount: "200", unit: "g", category: "fermented" },
                        { name: "ramen noodles", amount: "2", unit: "packs", category: "grain" },
                        { name: "rice cakes", amount: "200", unit: "g", category: "grain" },
                        { name: "gochugaru", amount: "2", unit: "tbsp", category: "spice" }
                    ],
                    nutrition: {
                        calories: 720,
                        protein: 38,
                        carbs: 82,
                        fat: 32,
                        vitamins: ["B12", "C"],
                        minerals: ["Iron", "Sodium"]
                    },
                    timeToMake: "40 minutes",
                    season: ["winter"],
                    mealType: ["dinner"]
                }
            ],
            summer: [
                {
                    name: "Samgye-tang",
                    description: "Ginseng chicken soup",
                    cuisine: "Korean",
                    ingredients: [
                        { name: "whole chicken", amount: "1", unit: "small", category: "protein", swaps: ["seitan chicken"] },
                        { name: "ginseng", amount: "1", unit: "root", category: "herb" },
                        { name: "glutinous rice", amount: "100", unit: "g", category: "grain" },
                        { name: "garlic", amount: "8", unit: "cloves", category: "vegetable" },
                        { name: "jujubes", amount: "4", unit: "pieces", category: "fruit" }
                    ],
                    nutrition: {
                        calories: 520,
                        protein: 45,
                        carbs: 42,
                        fat: 22,
                        vitamins: ["B12", "B6"],
                        minerals: ["Iron", "Potassium"]
                    },
                    timeToMake: "90 minutes",
                    season: ["summer"],
                    mealType: ["dinner"]
                }
            ]
        },
        dessert: {
            summer: [
                {
                    name: "Patbingsu",
                    description: "Shaved ice with sweet red beans and toppings",
                    cuisine: "Korean",
                    ingredients: [
                        { name: "shaved ice", amount: "4", unit: "cups", category: "ice" },
                        { name: "red bean paste", amount: "200", unit: "g", category: "bean" },
                        { name: "condensed milk", amount: "60", unit: "ml", category: "dAiry", swaps: ["coconut condensed milk"] },
                        { name: "rice cakes", amount: "100", unit: "g", category: "grain" },
                        { name: "fruit", amount: "200", unit: "g", category: "fruit" }
                    ],
                    nutrition: {
                        calories: 320,
                        protein: 8,
                        carbs: 65,
                        fat: 4,
                        vitamins: ["C", "A"],
                        minerals: ["Iron", "Calcium"]
                    },
                    timeToMake: "15 minutes",
                    season: ["summer"],
                    mealType: ["dessert"]
                }
            ],
            winter: [
                {
                    name: "Hotteok",
                    description: "Sweet filled pancakes",
                    cuisine: "Korean",
                    ingredients: [
                        { name: "flour", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
                        { name: "brown sugar", amount: "100", unit: "g", category: "sweetener" },
                        { name: "nuts", amount: "50", unit: "g", category: "nuts" },
                        { name: "cinnamon", amount: "1", unit: "tbsp", category: "spice" }
                    ],
                    nutrition: {
                        calories: 280,
                        protein: 6,
                        carbs: 52,
                        fat: 8,
                        vitamins: ["B1", "E"],
                        minerals: ["Iron"]
                    },
                    timeToMake: "45 minutes",
                    season: ["winter"],
                    mealType: ["dessert"]
                }
            ],
            all: [
                {
                    name: "Songpyeon",
                    description: "Half-Moon shaped rice cakes",
                    cuisine: "Korean",
                    ingredients: [
                        { name: "rice flour", amount: "400", unit: "g", category: "grain" },
                        { name: "sesame seeds", amount: "100", unit: "g", category: "seeds" },
                        { name: "honey", amount: "60", unit: "ml", category: "sweetener" },
                        { name: "pine needles", amount: "2", unit: "cups", category: "herb" }
                    ],
                    nutrition: {
                        calories: 220,
                        protein: 4,
                        carbs: 45,
                        fat: 4,
                        vitamins: ["B1", "E"],
                        minerals: ["Iron", "Magnesium"]
                    },
                    timeToMake: "60 minutes",
                    season: ["all"],
                    mealType: ["dessert"]
                },
                {
                    name: "Japchae",
                    description: "Sweet potato noodles stir-fried with vegetables and meat",
                    cuisine: "Korean",
                    cookingMethods: ["stir-frying", "blanching", "assembling"],
                    tools: [
                        "large wok",
                        "multiple bowls",
                        "strainer",
                        "sharp knife",
                        "tongs"
                    ],
                    preparationSteps: [
                        "Soak noodles",
                        "Prepare vegetables separately",
                        "Cook meat",
                        "Stir-fry noodles",
                        "Combine ingredients",
                        "Season and toss",
                        "Garnish with sesame"
                    ],
                    ingredients: [
                        { name: "sweet potato noodles", amount: "250", unit: "g", category: "grain" },
                        { name: "beef", amount: "150", unit: "g", category: "protein", swaps: ["mushrooms"] },
                        { name: "spinach", amount: "200", unit: "g", category: "vegetable" },
                        { name: "carrots", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "mushrooms", amount: "150", unit: "g", category: "vegetable" },
                        { name: "eggs", amount: "2", unit: "large", category: "protein" },
                        { name: "soy sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "sesame oil", amount: "2", unit: "tbsp", category: "oil" }
                    ],
                    substitutions: {
                        "beef": ["tofu", "seitan", "mushrooms"],
                        "eggs": ["tofu scramble"],
                        "sweet potato noodles": ["rice noodles", "kelp noodles"]
                    },
                    servingSize: 4,
                    allergens: ["soy", "egg"],
                    prepTime: "30 minutes",
                    cookTime: "25 minutes",
                    culturalNotes: "Originally a royal dish, japchae is now a popular celebration food served at holidays and special occasions",
                    pAiringSuggestions: ["rice", "kimchi", "Korean tea"],
                    dietaryInfo: ["adaptable to vegetarian/vegan"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 18,
                        carbs: 58,
                        fat: 12,
                        vitamins: ["A", "B12", "K"],
                        minerals: ["Iron", "Selenium"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner", "celebration"]
                }
            ]
        }
    },
    traditionalSauces: {
        gochujang: {
            name: "Gochujang",
            description: "Fermented red chili paste with sweet, savory, and spicy notes",
            base: "fermented soybean and red chili",
            keyIngredients: ["glutinous rice", "fermented soybeans", "red chili powder", "salt"],
            culinaryUses: ["marinade base", "stew seasoning", "dipping sauce", "bibimbap topping"],
            variants: ["Mild", "Medium", "Hot", "Extra Hot"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "aries", "leo"],
            seasonality: "all",
            preparationNotes: "Traditionally fermented for months in earthenware pots called onggi",
            technicalTips: "Balance with sweeteners like honey or sugar to mellow its intensity"
        },
        doenjang: {
            name: "Doenjang",
            description: "Fermented soybean paste with rich umami flavor and earthy notes",
            base: "fermented soybean",
            keyIngredients: ["fermented soybeans", "salt", "meju (fermented soybean block)"],
            culinaryUses: ["soup base", "stew seasoning", "vegetable dipping sauce", "marinade component"],
            variants: ["Homemade", "Commercial", "Aged", "Premium"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Saturn", "taurus", "capricorn"],
            seasonality: "all",
            preparationNotes: "Traditionally separated from soy sauce during fermentation of meju",
            technicalTips: "Add at the beginning of cooking to develop depth of flavor"
        },
        ssamjang: {
            name: "Ssamjang",
            description: "Thick, spicy dipping sauce for wrapped meat and vegetables",
            base: "doenjang and gochujang",
            keyIngredients: ["doenjang", "gochujang", "sesame oil", "garlic", "green onions"],
            culinaryUses: ["wrap dipping sauce", "vegetable dip", "meat accompaniment", "rice topping"],
            variants: ["Traditional", "Sweet", "Extra garlic", "Sesame-heavy"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Saturn", "scorpio"],
            seasonality: "all",
            preparationNotes: "Mix ingredients fresh before serving for best flavor",
            technicalTips: "Balance sweet, savory, and spicy elements to complement the main dish"
        },
        ganjang: {
            name: "Ganjang (Korean Soy Sauce)",
            description: "Traditional Korean soy sauce, often more complex than Chinese or Japanese varieties",
            base: "fermented soybean",
            keyIngredients: ["fermented soybeans", "salt", 'Water'],
            culinaryUses: ["seasoning", "dipping sauce", "marinade base", "soup flavoring"],
            variants: ["Yangjo (regular)", "Jin (dark)", "Mulyang (double-brewed)", "Jorang (aged)"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Neptune", "pisces", "cancer"],
            seasonality: "all",
            preparationNotes: "Traditionally separated from doenjang during fermentation",
            technicalTips: "Use premium varieties for dipping sauces and everyday ones for cooking"
        },
        chogochujang: {
            name: "Chogochujang",
            description: "Sweet and sour chili sauce with vinegar",
            base: "gochujang and vinegar",
            keyIngredients: ["gochujang", "rice vinegar", "sugar", "sesame oil"],
            culinaryUses: ["raw fish dipping", "cold noodle sauce", "blanched vegetable dressing", "rice cake topping"],
            variants: ["Sweet", "Sour", "Spicy", "Fruity (with pear juice)"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mercury", "gemini", "sagittarius"],
            seasonality: "summer",
            preparationNotes: "Best made fresh rather than stored long-term",
            technicalTips: "Adjust vinegar and sugar ratio to complement the dish being served"
        },
        yangnyeom: {
            name: "Yangnyeom Sauce",
            description: "Sweet and spicy sauce used for Korean fried chicken and other dishes",
            base: "gochujang and corn syrup",
            keyIngredients: ["gochujang", "corn syrup", "ketchup", "garlic", "ginger"],
            culinaryUses: ["fried chicken coating", "stir-fry sauce", "dipping sauce", "marinade"],
            variants: ["Extra sweet", "Extra spicy", "Garlic-heavy", "Honey-based"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Sun", "aries"],
            seasonality: "all",
            preparationNotes: "Mix thoroughly and cook briefly to develop flavors",
            technicalTips: "The sauce should coat the back of a spoon but still be pourable"
        },
        bulgogi: {
            name: "Bulgogi Marinade",
            description: "Sweet and savory marinade for grilled beef and other meats",
            base: "soy sauce and fruit",
            keyIngredients: ["soy sauce", "Asian pear", "onion", "garlic", "sesame oil", "sugar"],
            culinaryUses: ["beef marinade", "pork marinade", "stir-fry base", "vegetable seasoning"],
            variants: ["Traditional", "Spicy", "Fruit-forward", "Premium (with rice wine)"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Venus", "taurus", "libra"],
            seasonality: "all",
            preparationNotes: "Asian pear helps tenderize meat while adding subtle sweetness",
            technicalTips: "Marinate beef for at least 2 hours, preferably overnight for best flavor penetration"
        },
        sesameOil: {
            name: "Chamgireum (Sesame Oil Dressing)",
            description: "Aromatic oil-based dressing used for many Korean dishes",
            base: "toasted sesame oil",
            keyIngredients: ["toasted sesame oil", "salt", "green onions", "toasted sesame seeds"],
            culinaryUses: ["vegetable seasoning", "meat finishing sauce", "bibimbap component", "dipping sauce"],
            variants: ["Plain", "With garlic", "With chili", "With perilla oil"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mercury", "gemini", "virgo"],
            seasonality: "all",
            preparationNotes: "Use high-quality freshly toasted sesame oil for best flavor",
            technicalTips: "Add at the end of cooking to preserve volatile aromatics"
        }
    },
    sauceRecommender: {
        forProtein: {
            beef: ["bulgogi sauce", "kalbi marinade", "doenjang", "ssamjang"],
            pork: ["ssamjang", "gochujang", "doenjang", "spicy chili sauce"],
            chicken: ["gochujang-based sauce", "doenjang", "soy garlic sauce", "ganjang"],
            seafood: ["chogochujang", "soy garlic", "sesame oil with salt", "citrus soy"],
            tofu: ["doenjang", "gochujang", "ganjang", "sesame sauce"]
        },
        forVegetable: {
            leafy: ["ssamjang", "sesame oil and salt", "doenjang-based dressing"],
            root: ["chogochujang", "yangnyeom sauce", "doenjang-based"],
            mushroom: ["bulgogi sauce", "sesame oil", "doenjang soup base"],
            fermented: ["gochujang-based dressing", "garlic soy", "chili oil"],
            freshCrunch: ["gochujang vinaigrette", "chogochujang", "sesame dressing"]
        },
        forCookingMethod: {
            grilling: ["ssamjang", "gochujang glaze", "doenjang marinade", "bulgogi sauce"],
            stewing: ["doenjang jjigae base", "kimchi jjigae base", "sundubu base"],
            steaming: ["sesame oil dipping sauce", "vinegar soy", "chili oil"],
            panFrying: ["yangnyeom sauce", "ganjang-based", "sweet soy glaze"],
            raw: ["chogochujang", "sesame oil and salt", "gojuchang vinaigrette"]
        },
        byAstrological: { Fire: ["hot gochujang sauce", "spicy tteokbokki sauce", "chili oil", "yangnyeom sauce", "maewoon sauce"],
            Earth: ["doenjang", "aged ganjang", "fermented bean paste sauces", "perilla oil", "wild sesame sauce"],
            Air: ["vinegar-based sauces", "citrus soy", "light sesame dressings", "yuzu dressing", "tangerine soy"],
            Water: ["clear soups", "mild doenjang", "anchovy broth bases", "seaweed-infused dipping sauce", "jeotgal sauce"]
        },
        byRegion: {
            seoul: ["balanced sweetness", "refined doenjang", "mild heat", "bulgogi sauce", "modern fusion sauces"],
            jeonju: ["rich ganjang", "artisanal doenjang", "complex fermented flavors", "bibimbap sauce", "traditional herb oils"],
            busan: ["seafood-focused sauces", "spicier profiles", "anchovy-based", "haemul broth", "dried fish sauces"],
            jeju: ["citrus notes", "fresh seafood pAirings", "lighter preparations", "hallabong dressing", "black pork marinades"]
        },
        byDietary: {
            vegan: ["doenjang", "gochujang", "ganjang", "sesame-based sauces", "mushroom-based sauces"],
            vegetarian: ["doenjang", "gochujang", "vegetable-based sauces", "herb-infused oils", "perilla seed sauce"],
            glutenFree: ["rice-based sauces", "pure gochujang", "traditional doenjang", "sesame oil blends", "citrus dressings"],
            dAiryFree: ["most traditional Korean sauces", "vinegar-based dips", "chili oils", "sesame dressings", "fruit reductions"],
            lowCarb: ["sesame oil dressings", "vinegar soy dips", "garlic chili oil", "perilla oil", "citrus-infused oils"]
        }
    },
    cookingTechniques: [
        {
            name: "Jjim (찜)",
            description: "Steaming or braising technique that creates tender, juicy results",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["stone pot", "steamer", "heavy pot with lid"],
            bestFor: ["meats", "whole fish", "root vegetables", "egg dishes"]
        },
        {
            name: "Gui (구이)",
            description: "Grilling methods, especially for meats like samgyeopsal and bulgogi",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["tabletop grill", "charcoal", "tongs", "scissors"],
            bestFor: ["marinated meats", "fresh pork belly", "vegetables", "mushrooms"]
        },
        {
            name: "Jjigae (찌개)",
            description: "Stew-making technique with rich, spicy broths",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["earthenware pot", "ladle", "heavy-bottomed pot"],
            bestFor: ["kimchi stews", "tofu dishes", "seafood", "vegetable medleys"]
        },
        {
            name: "Namul (나물)",
            description: "Technique for seasoning and preparing vegetables to preserve nutrients",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["blanching pot", "mixing bowls", "dipping basket"],
            bestFor: ["wild greens", "sprouts", "seaweed", "root vegetables"]
        },
        {
            name: "Jeongol (전골)",
            description: "Hot pot technique featuring communal cooking at the table",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["jeongol pot", "portable burner", "ladle", "chopsticks"],
            bestFor: ["thinly sliced meats", "seafood", "tofu", "vegetables"]
        }
    ],
    regionalCuisines: {
        seoul: {
            name: "Seoul (Capital) Cuisine",
            description: "Refined, royal-influenced cuisine with balanced flavors",
            signature: ["royal court dishes", "japchae", "bulgogi", "refined banchan"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Jupiter", "Mercury", "libra"],
            seasonality: "moderately seasonal"
        },
        jeonju: {
            name: "Jeonju (Southwest) Cuisine",
            description: "Known as Korea's food capital, with emphasis on quality ingredients and tradition",
            signature: ["bibimbap", "kongnamul gukbap", "makgeolli", "traditional banchan"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Moon", "Venus", "taurus"],
            seasonality: "highly seasonal"
        },
        gyeongsang: {
            name: "Gyeongsang (Southeast) Cuisine",
            description: "Bold, spicy flavors with substantial seafood influence",
            signature: ["dwaeji gukbap", "milmyeon", "agujjim", "spicy seafood soups"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Pluto", "scorpio"],
            seasonality: "coastal seasonal"
        },
        jeju: {
            name: "Jeju Island Cuisine",
            description: "Unique island cuisine with distinctive ingredients like black pork and abalone",
            signature: ["black pork", "haemul dishes", "abalone porridge", "hallabong citrus"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Neptune", "Jupiter", "pisces"],
            seasonality: "island seasonal cycle"
        }
    },
    elementalProperties: { Fire: 1.00, Water: 0.00, Earth: 0.00, Air: 0.00 }
};

export default korean;
