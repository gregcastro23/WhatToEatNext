export const thai = {
    id: 'thai',
    name: 'Thai',
    description: 'Traditional Thai cuisine featuring complex harmony of flavors including spicy, sweet, sour and salty elements',
    dishes: {
        breakfast: {
            all: [
                {
                    name: "Jok",
                    description: "Comforting rice porridge with ginger, ground pork, and soft-boiled egg",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "boiling"],
                    tools: [
                        "large pot",
                        "wooden spoon",
                        "measuring cups",
                        "small bowls for garnishes",
                        "ladle"
                    ],
                    preparationSteps: [
                        "Rinse rice thoroughly",
                        "Simmer rice until very soft",
                        "Cook ground pork separately",
                        "Prepare garnishes",
                        "Season the porridge",
                        "Serve with toppings"
                    ],
                    ingredients: [
                        { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "ginger", amount: "2", unit: "tbsp", category: "spice" },
                        { name: "ground pork", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
                        { name: "soft-boiled egg", amount: "2", unit: "large", category: "protein", swaps: ["silken tofu"] },
                        { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
                        { name: "fried garlic", amount: "2", unit: "tbsp", category: "garnish" },
                        { name: "white pepper", amount: "1", unit: "tsp", category: "spice" },
                        { name: "soy sauce", amount: "2", unit: "tbsp", category: "seasoning" }
                    ],
                    substitutions: {
                        "ground pork": ["minced mushrooms", "crumbled tofu", "plant-based meat"],
                        "soft-boiled egg": ["silken tofu", "century egg"],
                        "soy sauce": ["tamari", "coconut aminos"]
                    },
                    servingSize: 4,
                    allergens: ["soy", "eggs"],
                    prepTime: "10 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A beloved breakfast dish that showcases the Thai appreciation for rice and comfort food. Often sold by street vendors in the early morning",
                    pAiringSuggestions: ["Chinese donuts (Patongo)", "pickled vegetables", "chili vinegar"],
                    dietaryInfo: ["adaptable to vegetarian/vegan", "gluten-free with substitutions"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 380,
                        protein: 22,
                        carbs: 58,
                        fat: 8,
                        vitamins: ["B6", "B12"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"],
                    elementalProperties: { Fire: 0.20, Water: 0.30, Earth: 0.40, Air: 0.10 }
                },
                {
                    name: "Khao Tom",
                    description: "Light rice soup with shrimp, ginger, and herbs",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "boiling"],
                    tools: [
                        "large pot",
                        "strainer",
                        "ladle",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Rinse rice until water runs clear",
                        "Simmer rice in broth",
                        "Clean and devein shrimp",
                        "Add shrimp and ginger",
                        "Season with fish sauce",
                        "Garnish with herbs"
                    ],
                    ingredients: [
                        { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "shrimp", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "ginger", amount: "2", unit: "inches", category: "spice" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
                        { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" },
                        { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
                        { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "white pepper", amount: "1", unit: "tsp", category: "spice" }
                    ],
                    substitutions: {
                        "shrimp": ["firm tofu", "mushrooms", "chicken"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "jasmine rice": ["brown rice", "quinoa"]
                    },
                    servingSize: 4,
                    allergens: ["shellfish", "fish", "soy"],
                    prepTime: "15 minutes",
                    cookTime: "25 minutes",
                    culturalNotes: "A gentle morning dish that exemplifies the Thai principle of 'khao tom' (boiled rice), often served to those feeling under the weather",
                    pAiringSuggestions: ["pickled chilies", "fried garlic", "fresh lime", "prik nam pla"],
                    dietaryInfo: ["adaptable to vegetarian/vegan", "gluten-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 320,
                        protein: 24,
                        carbs: 48,
                        fat: 6,
                        vitamins: ["B12", "C"],
                        minerals: ["Iron", "Iodine"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"],
                    elementalProperties: { Fire: 0.20, Water: 0.50, Earth: 0.20, Air: 0.10 }
                },
                {
                    name: "Patongo with Sangkaya",
                    description: "Thai-style fried dough served with pandan custard dip",
                    cuisine: "Thai",
                    cookingMethods: ["deep-frying", "custard-making"],
                    tools: [
                        "deep fryer",
                        "mixing bowls",
                        "whisk",
                        "saucepan",
                        "thermometer",
                        "strainer"
                    ],
                    preparationSteps: [
                        "Make yeast dough",
                        "Let dough rise",
                        "Prepare pandan custard",
                        "Shape dough pieces",
                        "Deep fry until golden",
                        "Serve with warm custard"
                    ],
                    ingredients: [
                        { name: "all-purpose flour", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
                        { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" },
                        { name: "pandan leaves", amount: "4", unit: "pieces", category: "herb" },
                        { name: "eggs", amount: "3", unit: "large", category: "protein" },
                        { name: "palm sugar", amount: "100", unit: "g", category: "sweetener" },
                        { name: "yeast", amount: "1", unit: "tsp", category: "leavening" }
                    ],
                    substitutions: {
                        "all-purpose flour": ["gluten-free flour blend", "rice flour mix"],
                        "palm sugar": ["brown sugar", "coconut sugar"],
                        "pandan leaves": ["pandan extract", "vanilla extract"]
                    },
                    servingSize: 6,
                    allergens: ["gluten", "eggs", "dAiry"],
                    prepTime: "20 minutes",
                    restTime: "60 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A Thai adaptation of Chinese youtiao, often enjoyed for breakfast with coffee or tea. The pandan custard adds a distinctly Southeast Asian twist",
                    pAiringSuggestions: ["Thai coffee", "hot soy milk", "condensed milk"],
                    dietaryInfo: ["vegetarian", "adaptable to vegan"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 420,
                        protein: 12,
                        carbs: 65,
                        fat: 14,
                        vitamins: ["A", "D", "E"],
                        minerals: ["Calcium", "Iron"]
                    },
                    season: ["all"],
                    mealType: ["breakfast", "snack"],
                    elementalProperties: { Fire: 0.20, Water: 0.10, Earth: 0.30, Air: 0.40 }
                },
                {
                    name: "Khao Kai Jeow",
                    description: "Thai-style omelet with rice and sriracha sauce",
                    cuisine: "Thai",
                    cookingMethods: ["frying", "whisking"],
                    tools: [
                        "wok",
                        "spatula",
                        "mixing bowl",
                        "whisk",
                        "rice cooker"
                    ],
                    preparationSteps: [
                        "Beat eggs with seasonings",
                        "Heat oil in wok",
                        "Pour in egg mixture",
                        "Cook until edges crisp",
                        "Fold omelet",
                        "Serve over hot rice"
                    ],
                    ingredients: [
                        { name: "eggs", amount: "3", unit: "large", category: "protein", swaps: ["JUST Egg"] },
                        { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "fish sauce", amount: "1", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" },
                        { name: "white pepper", amount: "1/2", unit: "tsp", category: "spice" },
                        { name: "sriracha sauce", amount: "2", unit: "tbsp", category: "sauce" }
                    ],
                    substitutions: {
                        "eggs": ["JUST Egg", "chickpea flour mixture"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "sriracha": ["chili garlic sauce", "sambal oelek"]
                    },
                    servingSize: 2,
                    allergens: ["eggs", "fish"],
                    prepTime: "5 minutes",
                    cookTime: "10 minutes",
                    culturalNotes: "A quick, satisfying breakfast that showcases the Thai preference for rice-based meals at any time of day. The fluffy yet crispy texture is achieved through high heat and proper wok technique",
                    pAiringSuggestions: ["nam prik pao", "cucumber slices", "Thai chili sauce"],
                    dietaryInfo: ["gluten-free", "adaptable to vegan"],
                    spiceLevel: "adjustable",
                    nutrition: {
                        calories: 380,
                        protein: 18,
                        carbs: 45,
                        fat: 16,
                        vitamins: ["B12", "D"],
                        minerals: ["Iron", "Selenium"]
                    },
                    season: ["all"],
                    mealType: ["breakfast", "lunch"],
                    elementalProperties: { Fire: 0.40, Water: 0.10, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Khao Tom Moo",
                    description: "Rice soup with minced pork and ginger",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "boiling"],
                    tools: [
                        "large pot",
                        "ladle",
                        "knife",
                        "cutting board",
                        "small bowls for garnishes"
                    ],
                    preparationSteps: [
                        "Cook rice until very soft",
                        "Prepare pork mixture",
                        "Simmer with ginger",
                        "Add seasonings",
                        "Prepare garnishes",
                        "Serve hot with condiments"
                    ],
                    ingredients: [
                        { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "minced pork", amount: "300", unit: "g", category: "protein", swaps: ["chicken", "tofu"] },
                        { name: "ginger", amount: "30", unit: "g", category: "spice" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
                        { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
                        { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" },
                        { name: "white pepper", amount: "1", unit: "tsp", category: "spice" },
                        { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] }
                    ],
                    substitutions: {
                        "minced pork": ["ground chicken", "crumbled tofu", "mushrooms"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "jasmine rice": ["brown rice", "quinoa"]
                    },
                    servingSize: 4,
                    allergens: ["fish", "soy"],
                    prepTime: "15 minutes",
                    cookTime: "30 minutes",
                    culturalNotes: "A comforting breakfast dish that's often served to those feeling under the weather. The ginger and pepper make it especially warming",
                    pAiringSuggestions: ["fried garlic", "chili vinegar", "century eggs", "pickled vegetables"],
                    dietaryInfo: ["dAiry-free", "adaptable to vegan"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 320,
                        protein: 22,
                        carbs: 45,
                        fat: 8,
                        vitamins: ["B12", "D"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"],
                    elementalProperties: { Fire: 0.20, Water: 0.30, Earth: 0.30, Air: 0.20 }
                }
            ]
        },
        lunch: {
            all: [
                {
                    name: "Pad Kra Pao",
                    description: "Stir-fried holy basil with minced meat",
                    cuisine: "Thai",
                    cookingMethods: ["stir-frying", "pounding"],
                    tools: [
                        "wok",
                        "mortar and pestle",
                        "spatula",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Pound chilies and garlic",
                        "Heat wok until smoking",
                        "Stir-fry aromatics",
                        "Add meat and seasonings",
                        "Toss in holy basil",
                        "Serve with fried egg"
                    ],
                    ingredients: [
                        { name: "minced chicken", amount: "300", unit: "g", category: "protein", swaps: ["tofu", "mushrooms"] },
                        { name: "holy basil", amount: "2", unit: "cups", category: "herb" },
                        { name: "Thai chilies", amount: "5", unit: "pieces", category: "spice" },
                        { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
                        { name: "oyster sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["mushroom sauce"] },
                        { name: "fish sauce", amount: "1", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "eggs", amount: "2", unit: "large", category: "protein", optional: true }
                    ],
                    substitutions: {
                        "minced chicken": ["minced pork", "crumbled tofu", "chopped mushrooms"],
                        "holy basil": ["Thai basil", "regular basil"],
                        "oyster sauce": ["vegetarian oyster sauce", "mushroom sauce"]
                    },
                    servingSize: 2,
                    allergens: ["fish", "shellfish", "soy"],
                    prepTime: "15 minutes",
                    cookTime: "10 minutes",
                    culturalNotes: "One of Thailand's most beloved street foods, this dish is known for its intense heat and aromatic holy basil. The name 'kra pao' refers to the holy basil that gives the dish its distinctive flavor",
                    pAiringSuggestions: ["jasmine rice", "fried egg", "cucumber slices", "prik nam pla"],
                    dietaryInfo: ["adaptable to vegetarian/vegan"],
                    spiceLevel: "hot",
                    nutrition: {
                        calories: 420,
                        protein: 32,
                        carbs: 15,
                        fat: 28,
                        vitamins: ["A", "C", "K"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner"],
                    elementalProperties: { Fire: 0.50, Water: 0.10, Earth: 0.20, Air: 0.20 }
                },
                {
                    name: "Khao Soi",
                    description: "Northern Thai curry noodle soup with coconut milk",
                    cuisine: "Thai",
                    ingredients: [
                        { name: "egg noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
                        { name: "chicken thighs", amount: "400", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
                        { name: "khao soi curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "shallots", amount: "4", unit: "medium", category: "vegetable" },
                        { name: "pickled mustard greens", amount: "100", unit: "g", category: "vegetable" },
                        { name: "lime", amount: "2", unit: "whole", category: "fruit" },
                        { name: "crispy noodles", amount: "100", unit: "g", category: "garnish" },
                        { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] }
                    ],
                    nutrition: {
                        calories: 580,
                        protein: 32,
                        carbs: 65,
                        fat: 28,
                        vitamins: ["A", "B12", "D"],
                        minerals: ["Iron", "Calcium"]
                    },
                    timeToMake: "45 minutes",
                    season: ["all"],
                    mealType: ["lunch"],
                    elementalProperties: { Fire: 0.30, Water: 0.40, Earth: 0.20, Air: 0.10 }
                },
                {
                    name: "Som Tam",
                    description: "Spicy green papaya salad",
                    cuisine: "Thai",
                    cookingMethods: ["pounding", "mixing"],
                    tools: [
                        "mortar and pestle",
                        "grater",
                        "knife",
                        "cutting board",
                        "lime squeezer"
                    ],
                    preparationSteps: [
                        "Shred green papaya",
                        "Pound garlic and chilies",
                        "Add dried shrimp and peanuts",
                        "Mix in vegetables",
                        "Season with lime and fish sauce",
                        "Adjust flavors to taste"
                    ],
                    ingredients: [
                        { name: "green papaya", amount: "300", unit: "g", category: "vegetable" },
                        { name: "Thai chilies", amount: "2", unit: "pieces", category: "spice" },
                        { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
                        { name: "dried shrimp", amount: "2", unit: "tbsp", category: "protein", swaps: ["toasted peanuts"] },
                        { name: "long beans", amount: "100", unit: "g", category: "vegetable" },
                        { name: "cherry tomatoes", amount: "100", unit: "g", category: "vegetable" },
                        { name: "lime juice", amount: "3", unit: "tbsp", category: "acid" },
                        { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "palm sugar", amount: "2", unit: "tbsp", category: "sweetener" }
                    ],
                    substitutions: {
                        "green papaya": ["shredded carrot", "green mango"],
                        "dried shrimp": ["toasted peanuts", "crispy tofu"],
                        "fish sauce": ["soy sauce", "coconut aminos"]
                    },
                    servingSize: 2,
                    allergens: ["fish", "shellfish", "peanuts"],
                    prepTime: "20 minutes",
                    cookTime: "0 minutes",
                    culturalNotes: "Originally from Isaan (northeastern Thailand), this dish perfectly balances the four main Thai tastes: sour, spicy, salty, and sweet. It's now popular throughout Thailand and internationally",
                    pAiringSuggestions: ["sticky rice", "grilled chicken", "cold beer"],
                    dietaryInfo: ["raw", "adaptable to vegan", "gluten-free"],
                    spiceLevel: "very hot",
                    nutrition: {
                        calories: 160,
                        protein: 8,
                        carbs: 25,
                        fat: 4,
                        vitamins: ["C", "A", "K"],
                        minerals: ["Potassium", "Calcium"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner", "appetizer"],
                    elementalProperties: { Fire: 0.40, Water: 0.20, Earth: 0.20, Air: 0.20 }
                },
                {
                    name: "Tom Yum Goong",
                    description: "Spicy and sour shrimp soup",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "infusing"],
                    tools: [
                        "soup pot",
                        "ladle",
                        "strainer",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Prepare lemongrass and herbs",
                        "Simmer aromatics in broth",
                        "Add mushrooms",
                        "Cook shrimp",
                        "Season with lime and chili",
                        "Finish with herbs"
                    ],
                    ingredients: [
                        { name: "shrimp", amount: "400", unit: "g", category: "protein", swaps: ["mushrooms"] },
                        { name: "lemongrass", amount: "3", unit: "stalks", category: "herb" },
                        { name: "kaffir lime leaves", amount: "4", unit: "pieces", category: "herb" },
                        { name: "galangal", amount: "50", unit: "g", category: "spice" },
                        { name: "mushrooms", amount: "200", unit: "g", category: "vegetable" },
                        { name: "Thai chilies", amount: "4", unit: "pieces", category: "spice" },
                        { name: "lime juice", amount: "4", unit: "tbsp", category: "acid" },
                        { name: "nam prik pao", amount: "2", unit: "tbsp", category: "paste" }
                    ],
                    substitutions: {
                        "shrimp": ["tofu", "mushrooms", "chicken"],
                        "kaffir lime leaves": ["lime zest", "bay leaves"],
                        "galangal": ["ginger", "turmeric"]
                    },
                    servingSize: 4,
                    allergens: ["shellfish", "fish"],
                    prepTime: "15 minutes",
                    cookTime: "25 minutes",
                    culturalNotes: "Thailand's most famous soup, known worldwide for its complex blend of hot, sour, and aromatic flavors. The name 'tom yum' refers to the boiling process and sour taste",
                    pAiringSuggestions: ["jasmine rice", "stir-fried vegetables", "coconut water"],
                    dietaryInfo: ["gluten-free", "adaptable to vegan"],
                    spiceLevel: "hot",
                    nutrition: {
                        calories: 220,
                        protein: 24,
                        carbs: 12,
                        fat: 10,
                        vitamins: ["B12", "C", "D"],
                        minerals: ["Iodine", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.20, Air: 0.20 }
                },
                {
                    name: "Yum Woon Sen",
                    description: "Spicy glass noodle salad with seafood",
                    cuisine: "Thai",
                    cookingMethods: ["boiling", "mixing"],
                    tools: [
                        "pot",
                        "mixing bowl",
                        "strainer",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Soak glass noodles",
                        "Cook seafood",
                        "Prepare dressing",
                        "Mix ingredients",
                        "Add herbs and peanuts",
                        "Serve chilled"
                    ],
                    ingredients: [
                        { name: "glass noodles", amount: "200", unit: "g", category: "noodles" },
                        { name: "shrimp", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "ground pork", amount: "100", unit: "g", category: "protein", optional: true },
                        { name: "lime juice", amount: "4", unit: "tbsp", category: "acid" },
                        { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "Thai chilies", amount: "4", unit: "pieces", category: "spice" },
                        { name: "shallots", amount: "4", unit: "whole", category: "vegetable" },
                        { name: "mint leaves", amount: "1", unit: "cup", category: "herb" },
                        { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" },
                        { name: "roasted peanuts", amount: "1/2", unit: "cup", category: "nuts" }
                    ],
                    substitutions: {
                        "shrimp": ["tofu", "mushrooms"],
                        "ground pork": ["ground chicken", "crumbled tofu"],
                        "fish sauce": ["soy sauce", "coconut aminos"]
                    },
                    servingSize: 4,
                    allergens: ["shellfish", "fish", "peanuts"],
                    prepTime: "20 minutes",
                    cookTime: "15 minutes",
                    culturalNotes: "A popular Thai salad that showcases the balance of spicy, sour, and savory flavors. Glass noodles are used to absorb the flavorful dressing",
                    pAiringSuggestions: ["sticky rice", "grilled chicken", "fresh vegetables"],
                    dietaryInfo: ["adaptable to vegan", "gluten-free"],
                    spiceLevel: "hot",
                    nutrition: {
                        calories: 380,
                        protein: 25,
                        carbs: 48,
                        fat: 12,
                        vitamins: ["B12", "C"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["summer"],
                    mealType: ["lunch", "dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.20, Air: 0.30 }
                }
            ],
            summer: [
                {
                    name: "Som Tam Thai",
                    description: "Spicy green papaya salad with dried shrimp and peanuts",
                    cuisine: "Thai",
                    ingredients: [
                        { name: "green papaya", amount: "300", unit: "g", category: "vegetable" },
                        { name: "long beans", amount: "100", unit: "g", category: "vegetable" },
                        { name: "cherry tomatoes", amount: "100", unit: "g", category: "vegetable" },
                        { name: "dried shrimp", amount: "2", unit: "tbsp", category: "protein", swaps: ["crushed toasted peanuts"] },
                        { name: "lime", amount: "2", unit: "whole", category: "fruit" },
                        { name: "palm sugar", amount: "2", unit: "tbsp", category: "sweetener" },
                        { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "Thai chilies", amount: "2", unit: "pieces", category: "spice" },
                        { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
                        { name: "peanuts", amount: "1/4", unit: "cup", category: "nuts" }
                    ],
                    nutrition: {
                        calories: 280,
                        protein: 12,
                        carbs: 32,
                        fat: 16,
                        vitamins: ["C", "A", "K"],
                        minerals: ["Potassium", "Iron"]
                    },
                    timeToMake: "20 minutes",
                    season: ["summer"],
                    mealType: ["lunch"],
                    elementalProperties: { Fire: 0.50, Water: 0.20, Earth: 0.20, Air: 0.10 }
                }
            ],
            winter: [
                {
                    name: "Khao Kha Moo",
                    description: "Braised pork leg with rice and pickled vegetables",
                    cuisine: "Thai",
                    ingredients: [
                        { name: "pork leg", amount: "800", unit: "g", category: "protein", swaps: ["braised mushrooms"] },
                        { name: "jasmine rice", amount: "400", unit: "g", category: "grain" },
                        { name: "star anise", amount: "3", unit: "whole", category: "spice" },
                        { name: "cinnamon", amount: "1", unit: "stick", category: "spice" },
                        { name: "soy sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "pickled mustard greens", amount: "200", unit: "g", category: "vegetable" },
                        { name: "garlic", amount: "8", unit: "cloves", category: "vegetable" },
                        { name: "boiled eggs", amount: "4", unit: "large", category: "protein" }
                    ],
                    nutrition: {
                        calories: 650,
                        protein: 45,
                        carbs: 55,
                        fat: 28,
                        vitamins: ["B12", "D", "K"],
                        minerals: ["Iron", "Zinc"]
                    },
                    timeToMake: "180 minutes",
                    season: ["winter"],
                    mealType: ["lunch"],
                    elementalProperties: { Fire: 0.20, Water: 0.30, Earth: 0.40, Air: 0.10 }
                },
                {
                    name: "Tom Kha Gai",
                    description: "Coconut chicken soup with galangal and lemongrass",
                    cuisine: "Thai",
                    ingredients: [
                        { name: "chicken breast", amount: "400", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
                        { name: "mushrooms", amount: "200", unit: "g", category: "vegetable" },
                        { name: "galangal", amount: "4", unit: "slices", category: "spice" },
                        { name: "lemongrass", amount: "2", unit: "stalks", category: "herb" },
                        { name: "kaffir lime leaves", amount: "4", unit: "pieces", category: "herb" },
                        { name: "Thai chilies", amount: "3", unit: "pieces", category: "spice" },
                        { name: "lime juice", amount: "3", unit: "tbsp", category: "acid" },
                        { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] }
                    ],
                    nutrition: {
                        calories: 420,
                        protein: 32,
                        carbs: 12,
                        fat: 28,
                        vitamins: ["D", "B12", "C"],
                        minerals: ["Iron", "Calcium"]
                    },
                    timeToMake: "35 minutes",
                    season: ["winter"],
                    mealType: ["lunch"],
                    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
                    },
                    astrologicalProfile: {
                        favorableZodiac: ["cancer", "pisces"],
                        rulingPlanets: ["Moon", "Venus"],
                        elementalAffinity: { base: 'Water' }
                    },
                    astrologicalInfluences: ["Neptune", "Mars", "pisces"]
                },
                {
                    name: "Kuay Teow Reua",
                    description: "Boat noodle soup with rich spiced broth",
                    cuisine: "Thai",
                    ingredients: [
                        { name: "rice noodles", amount: "200", unit: "g", category: "grain" },
                        { name: "beef", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
                        { name: "pork blood", amount: "100", unit: "ml", category: "protein", swaps: ["dark soy sauce"] },
                        { name: "morning glory", amount: "100", unit: "g", category: "vegetable" },
                        { name: "bean sprouts", amount: "100", unit: "g", category: "vegetable" },
                        { name: "five spice powder", amount: "1", unit: "tbsp", category: "spice" },
                        { name: "dark soy sauce", amount: "2", unit: "tbsp", category: "seasoning" },
                        { name: "crispy pork rinds", amount: "50", unit: "g", category: "garnish", swaps: ["fried shallots"] }
                    ],
                    nutrition: {
                        calories: 480,
                        protein: 35,
                        carbs: 58,
                        fat: 18,
                        vitamins: ["B12", "Iron", "A"],
                        minerals: ["Zinc", "Iron"]
                    },
                    timeToMake: "45 minutes",
                    season: ["winter"],
                    mealType: ["lunch"],
                    elementalProperties: { Fire: 0.30, Water: 0.40, Earth: 0.20, Air: 0.10 }
                }
            ]
        },
        dinner: {
            all: [
                {
                    name: "Pad Thai",
                    description: "Stir-fried rice noodles with tamarind sauce",
                    cuisine: "Thai",
                    cookingMethods: ["stir-frying", "soaking"],
                    tools: [
                        "wok",
                        "spatula",
                        "strainer",
                        "small bowls for prep",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Soak rice noodles",
                        "Prepare sauce",
                        "Stir-fry aromatics",
                        "Cook proteins",
                        "Add noodles and sauce",
                        "Toss with bean sprouts",
                        "Garnish and serve"
                    ],
                    ingredients: [
                        { name: "rice noodles", amount: "400", unit: "g", category: "grain" },
                        { name: "tofu", amount: "200", unit: "g", category: "protein", swaps: ["shrimp"] },
                        { name: "eggs", amount: "2", unit: "large", category: "protein" },
                        { name: "tamarind paste", amount: "3", unit: "tbsp", category: "sauce" },
                        { name: "palm sugar", amount: "3", unit: "tbsp", category: "sweetener" },
                        { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" },
                        { name: "garlic chives", amount: "100", unit: "g", category: "vegetable" },
                        { name: "crushed peanuts", amount: "1/2", unit: "cup", category: "garnish", optional: true }
                    ],
                    substitutions: {
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "palm sugar": ["brown sugar", "coconut sugar"],
                        "tamarind paste": ["lime juice + brown sugar"]
                    },
                    servingSize: 4,
                    allergens: ["peanuts", "eggs", "soy", "fish"],
                    prepTime: "30 minutes",
                    cookTime: "15 minutes",
                    culturalNotes: "Created in the 1930s as part of Thailand's nation-building efforts, Pad Thai has become the country's national dish and a global ambassador of Thai cuisine",
                    pAiringSuggestions: ["lime wedges", "chili flakes", "extra peanuts", "bean sprouts"],
                    dietaryInfo: ["adaptable to vegan", "gluten-free"],
                    spiceLevel: "mild to adjustable",
                    nutrition: {
                        calories: 480,
                        protein: 18,
                        carbs: 68,
                        fat: 16,
                        vitamins: ["A", "C", "E"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Pad Krapow Moo",
                    description: "Stir-fried pork with holy basil and chili",
                    cuisine: "Thai",
                    ingredients: [
                        { name: "ground pork", amount: "400", unit: "g", category: "protein", swaps: ["plant-based ground"] },
                        { name: "holy basil", amount: "2", unit: "cups", category: "herb" },
                        { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
                        { name: "Thai chilies", amount: "6", unit: "pieces", category: "spice" },
                        { name: "oyster sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["mushroom sauce"] },
                        { name: "fish sauce", amount: "1", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "jasmine rice", amount: "2", unit: "cups", category: "grain" },
                        { name: "fried egg", amount: "2", unit: "large", category: "protein", swaps: ["tofu"] }
                    ],
                    nutrition: {
                        calories: 580,
                        protein: 42,
                        carbs: 45,
                        fat: 28,
                        vitamins: ["B12", "K", "A"],
                        minerals: ["Iron", "Zinc"]
                    },
                    timeToMake: "20 minutes",
                    season: ["all"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.50, Water: 0.20, Earth: 0.20, Air: 0.10 }
                },
                {
                    name: "Pla Neung Manao",
                    description: "Steamed fish with lime and chili sauce",
                    cuisine: "Thai",
                    cookingMethods: ["steaming", "sauce making"],
                    tools: [
                        "steamer",
                        "mortar and pestle",
                        "serving plate",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Clean and score fish",
                        "Prepare steamer",
                        "Steam fish until done",
                        "Pound chilies and garlic",
                        "Make lime sauce",
                        "Pour over hot fish"
                    ],
                    ingredients: [
                        { name: "sea bass", amount: "1", unit: "kg", category: "protein", swaps: ["snapper", "tilapia"] },
                        { name: "lime juice", amount: "6", unit: "tbsp", category: "acid" },
                        { name: "Thai chilies", amount: "6", unit: "pieces", category: "spice" },
                        { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
                        { name: "fish sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "cilantro", amount: "1", unit: "cup", category: "herb" },
                        { name: "lemongrass", amount: "2", unit: "stalks", category: "herb" },
                        { name: "chicken stock", amount: "2", unit: "tbsp", category: "liquid", optional: true }
                    ],
                    substitutions: {
                        "sea bass": ["snapper", "cod", "tilapia"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "chicken stock": ["vegetable stock", 'Water']
                    },
                    servingSize: 4,
                    allergens: ["fish"],
                    prepTime: "20 minutes",
                    cookTime: "15 minutes",
                    culturalNotes: "A classic Thai seafood dish that exemplifies the use of fresh ingredients and the balance of spicy, sour, and savory flavors",
                    pAiringSuggestions: ["steamed rice", "som tam", "tom yum soup"],
                    dietaryInfo: ["gluten-free", "low-carb"],
                    spiceLevel: "medium to hot",
                    nutrition: {
                        calories: 280,
                        protein: 35,
                        carbs: 8,
                        fat: 12,
                        vitamins: ["D", "B12", "C"],
                        minerals: ["Selenium", "Omega-3"]
                    },
                    season: ["all"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.40, Earth: 0.10, Air: 0.20 }
                }
            ],
            summer: [
                {
                    name: "Nam Kang Sai",
                    description: "Thai shaved ice dessert with various toppings",
                    cuisine: "Thai",
                    cookingMethods: ["shaving ice", "preparing syrups", "assembling"],
                    tools: [
                        "ice shaver",
                        "saucepans",
                        "strainer",
                        "serving bowls",
                        "measuring cups"
                    ],
                    preparationSteps: [
                        "Prepare colored syrups",
                        "Cook and prepare toppings",
                        "Shave ice",
                        "Layer ingredients",
                        "Add coconut milk",
                        "Serve immediately"
                    ],
                    ingredients: [
                        { name: "shaved ice", amount: "4", unit: "cups", category: "ice" },
                        { name: "red syrup", amount: "60", unit: "ml", category: "syrup" },
                        { name: "green syrup", amount: "60", unit: "ml", category: "syrup" },
                        { name: "palm seeds", amount: "100", unit: "g", category: "fruit" },
                        { name: "red beans", amount: "100", unit: "g", category: "legume" },
                        { name: "grass jelly", amount: "100", unit: "g", category: "jelly" },
                        { name: "sweet corn", amount: "100", unit: "g", category: "vegetable" },
                        { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" }
                    ],
                    substitutions: {
                        "palm seeds": ["lychee", "longan"],
                        "grass jelly": ["agar jelly", "coconut jelly"],
                        "red beans": ["mung beans", "black beans"]
                    },
                    servingSize: 4,
                    allergens: ["tree nuts (coconut)"],
                    prepTime: "30 minutes",
                    cookTime: "20 minutes",
                    chillTime: "60 minutes",
                    culturalNotes: "A popular street dessert during Thailand's hot season. The variety of colors and textures makes it both visually appealing and refreshing",
                    pAiringSuggestions: ["Thai iced tea", "additional coconut milk"],
                    dietaryInfo: ["vegetarian", "vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 5,
                        carbs: 65,
                        fat: 8,
                        vitamins: ["A", "C"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["summer"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.60, Earth: 0.10, Air: 0.20 }
                },
                {
                    name: "Yum Woon Sen",
                    description: "Spicy glass noodle salad with seafood",
                    cuisine: "Thai",
                    ingredients: [
                        { name: "glass noodles", amount: "200", unit: "g", category: "grain" },
                        { name: "shrimp", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "squid", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
                        { name: "ground pork", amount: "100", unit: "g", category: "protein", swaps: ["crumbled tempeh"] },
                        { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "onion", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "celery", amount: "2", unit: "stalks", category: "vegetable" },
                        { name: "lime juice", amount: "4", unit: "tbsp", category: "acid" },
                        { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "Thai chilies", amount: "4", unit: "pieces", category: "spice" }
                    ],
                    nutrition: {
                        calories: 420,
                        protein: 38,
                        carbs: 45,
                        fat: 12,
                        vitamins: ["B12", "C", "D"],
                        minerals: ["Iron", "Zinc"]
                    },
                    timeToMake: "25 minutes",
                    season: ["summer"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.40, Water: 0.30, Earth: 0.10, Air: 0.20 }
                }
            ],
            winter: [
                {
                    name: "Gaeng Massaman Neua",
                    description: "Massaman curry with beef and potatoes",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "braising"],
                    tools: [
                        "large pot",
                        "wooden spoon",
                        "knife",
                        "cutting board",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Brown beef chunks",
                        "Fry curry paste",
                        "Add coconut milk",
                        "Simmer with potatoes",
                        "Add peanuts and tamarind",
                        "Season to taste"
                    ],
                    ingredients: [
                        { name: "beef chuck", amount: "600", unit: "g", category: "protein", swaps: ["jackfruit", "seitan"] },
                        { name: "massaman curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
                        { name: "potatoes", amount: "400", unit: "g", category: "vegetable" },
                        { name: "onions", amount: "2", unit: "medium", category: "vegetable" },
                        { name: "peanuts", amount: "100", unit: "g", category: "nuts" },
                        { name: "tamarind paste", amount: "2", unit: "tbsp", category: "seasoning" },
                        { name: "palm sugar", amount: "3", unit: "tbsp", category: "sweetener" },
                        { name: "cardamom pods", amount: "4", unit: "pieces", category: "spice" },
                        { name: "cinnamon stick", amount: "1", unit: "piece", category: "spice" }
                    ],
                    substitutions: {
                        "beef chuck": ["jackfruit", "seitan", "mushrooms"],
                        "palm sugar": ["brown sugar", "coconut sugar"],
                        "tamarind paste": ["lime juice + brown sugar"]
                    },
                    servingSize: 6,
                    allergens: ["peanuts", "tree nuts (coconut)"],
                    prepTime: "30 minutes",
                    cookTime: "120 minutes",
                    culturalNotes: "A Thai adaptation of Persian cuisine, influenced by Muslim traders. The word 'massaman' is believed to refer to the Muslims who brought this style of curry to Thailand",
                    pAiringSuggestions: ["jasmine rice", "roti", "cucumber relish"],
                    dietaryInfo: ["adaptable to vegan"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 680,
                        protein: 45,
                        carbs: 42,
                        fat: 38,
                        vitamins: ["B12", "A", "E"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.40, Air: 0.10 }
                },
                {
                    name: "Tom Yum Goong Nam Khon",
                    description: "Creamy spicy and sour shrimp soup with mushrooms",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "infusing"],
                    tools: [
                        "soup pot",
                        "strainer",
                        "ladle",
                        "knife",
                        "cutting board"
                    ],
                    preparationSteps: [
                        "Prepare aromatics",
                        "Simmer lemongrass and herbs",
                        "Add mushrooms",
                        "Cook shrimp",
                        "Add coconut milk",
                        "Season with lime and chili"
                    ],
                    ingredients: [
                        { name: "tiger prawns", amount: "500", unit: "g", category: "protein", swaps: ["king oyster mushrooms"] },
                        { name: "straw mushrooms", amount: "200", unit: "g", category: "vegetable" },
                        { name: "lemongrass", amount: "3", unit: "stalks", category: "herb" },
                        { name: "galangal", amount: "6", unit: "slices", category: "spice" },
                        { name: "kaffir lime leaves", amount: "6", unit: "pieces", category: "herb" },
                        { name: "Thai chilies", amount: "8", unit: "pieces", category: "spice" },
                        { name: "evaporated milk", amount: "200", unit: "ml", category: "dAiry", swaps: ["coconut milk"] },
                        { name: "lime juice", amount: "4", unit: "tbsp", category: "acid" },
                        { name: "nam prik pao", amount: "3", unit: "tbsp", category: "seasoning" },
                        { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" }
                    ],
                    substitutions: {
                        "tiger prawns": ["tofu", "mushrooms", "fish"],
                        "evaporated milk": ["coconut milk", "cashew cream"],
                        "nam prik pao": ["roasted chili paste", "sambal oelek"]
                    },
                    servingSize: 4,
                    allergens: ["shellfish", "dAiry"],
                    prepTime: "20 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A richer variation of the classic Tom Yum soup, made creamy with the addition of evaporated milk. Popular in central Thailand",
                    pAiringSuggestions: ["jasmine rice", "seafood dipping sauce", "fresh lime"],
                    dietaryInfo: ["gluten-free", "adaptable to vegan"],
                    spiceLevel: "hot",
                    nutrition: {
                        calories: 420,
                        protein: 45,
                        carbs: 18,
                        fat: 22,
                        vitamins: ["D", "B12", "C"],
                        minerals: ["Zinc", "Iron"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.40, Water: 0.30, Earth: 0.20, Air: 0.10 }
                },
                {
                    name: "Gaeng Panang Neua",
                    description: "Thick, rich panang curry with tender beef",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "stir-frying"],
                    tools: [
                        "wok or large pot",
                        "wooden spoon",
                        "knife",
                        "cutting board",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Heat coconut cream",
                        "Fry curry paste",
                        "Add remaining coconut milk",
                        "Cook beef until tender",
                        "Add aromatics",
                        "Season to taste",
                        "Finish with kaffir lime leaves"
                    ],
                    ingredients: [
                        { name: "beef tenderloin", amount: "500", unit: "g", category: "protein", swaps: ["seitan"] },
                        { name: "panang curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "coconut cream", amount: "400", unit: "ml", category: "liquid" },
                        { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" },
                        { name: "kaffir lime leaves", amount: "6", unit: "pieces", category: "herb" },
                        { name: "Thai basil", amount: "1", unit: "cup", category: "herb" },
                        { name: "palm sugar", amount: "2", unit: "tbsp", category: "sweetener" },
                        { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "peanuts", amount: "1/2", unit: "cup", category: "nuts" }
                    ],
                    substitutions: {
                        "beef tenderloin": ["seitan", "mushrooms", "tofu"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "palm sugar": ["coconut sugar", "brown sugar"]
                    },
                    servingSize: 4,
                    allergens: ["peanuts", "tree nuts (coconut)", "fish"],
                    prepTime: "20 minutes",
                    cookTime: "40 minutes",
                    culturalNotes: "Panang curry is known for its rich, thick consistency and slightly sweeter taste compared to other Thai curries. The name is believed to derive from Penang, Malaysia",
                    pAiringSuggestions: ["jasmine rice", "roti", "cucumber salad"],
                    dietaryInfo: ["adaptable to vegan", "gluten-free"],
                    spiceLevel: "medium",
                    nutrition: {
                        calories: 650,
                        protein: 42,
                        carbs: 22,
                        fat: 45,
                        vitamins: ["B12", "E", "K"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.40, Water: 0.20, Earth: 0.30, Air: 0.10 }
                },
                {
                    name: "Khao Soi Gai",
                    description: "Northern Thai curry noodle soup with chicken",
                    cuisine: "Thai",
                    cookingMethods: ["simmering", "frying", "boiling"],
                    tools: [
                        "large pot",
                        "wok",
                        "strainer",
                        "ladle",
                        "spider skimmer"
                    ],
                    preparationSteps: [
                        "Prepare curry broth",
                        "Cook egg noodles",
                        "Fry crispy noodles",
                        "Cook chicken in curry",
                        "Assemble with toppings",
                        "Serve with condiments"
                    ],
                    ingredients: [
                        { name: "egg noodles", amount: "500", unit: "g", category: "grain", swaps: ["rice noodles"] },
                        { name: "chicken legs", amount: "600", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
                        { name: "khao soi curry paste", amount: "5", unit: "tbsp", category: "seasoning" },
                        { name: "crispy noodles", amount: "100", unit: "g", category: "garnish" },
                        { name: "shallots", amount: "4", unit: "whole", category: "vegetable" },
                        { name: "pickled mustard greens", amount: "100", unit: "g", category: "vegetable" },
                        { name: "lime", amount: "2", unit: "whole", category: "fruit" },
                        { name: "chili oil", amount: "4", unit: "tbsp", category: "oil" }
                    ],
                    substitutions: {
                        "chicken legs": ["tofu", "mushrooms", "seitan"],
                        "egg noodles": ["rice noodles", "wheat noodles"],
                        "pickled mustard greens": ["sauerkraut", "kimchi"],
                        "lime": ["lemon", "vinegar"],
                        "chili oil": ["sriracha", "sambal"]
                    },
                    servingSize: 4,
                    allergens: ["eggs", "wheat", "tree nuts (coconut)"],
                    prepTime: "30 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A specialty of Northern Thailand, particularly Chiang Mai. The dish shows Burmese influence and was historically popular along trade routes",
                    pAiringSuggestions: ["pickled vegetables", "chili paste", "fried shallots"],
                    dietaryInfo: ["adaptable to vegan"],
                    spiceLevel: "medium to hot",
                    nutrition: {
                        calories: 720,
                        protein: 38,
                        carbs: 65,
                        fat: 42,
                        vitamins: ["A", "D", "K"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["lunch", "dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.20, Air: 0.20 }
                }
            ]
        },
        dessert: {
            all: [
                {
                    name: "Khao Niao Mamuang",
                    description: "Sweet sticky rice with fresh mango and coconut cream",
                    cuisine: "Thai",
                    cookingMethods: ["steaming", "simmering"],
                    tools: [
                        "sticky rice steamer",
                        "pot",
                        "cheesecloth or steamer basket",
                        "saucepan",
                        "knife"
                    ],
                    preparationSteps: [
                        "Soak sticky rice",
                        "Steam sticky rice",
                        "Prepare coconut sauce",
                        "Cut fresh mango",
                        "Combine and serve"
                    ],
                    ingredients: [
                        { name: "sticky rice", amount: "2", unit: "cups", category: "grain" },
                        { name: "ripe mangoes", amount: "2", unit: "whole", category: "fruit" },
                        { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                        { name: "palm sugar", amount: "1/2", unit: "cup", category: "sweetener", swaps: ["coconut sugar"] },
                        { name: "salt", amount: "1/4", unit: "tsp", category: "seasoning" },
                        { name: "pandan leaves", amount: "2", unit: "pieces", category: "herb", optional: true }
                    ],
                    substitutions: {
                        "palm sugar": ["coconut sugar", "raw sugar"],
                        "pandan leaves": ["vanilla extract"],
                        "fresh mango": ["ripe peaches", "sweet papaya"]
                    },
                    servingSize: 4,
                    allergens: ["tree nuts (coconut)"],
                    prepTime: "20 minutes",
                    cookTime: "30 minutes",
                    soakTime: "4 hours",
                    culturalNotes: "Thailand's most famous dessert, traditionally eaten during mango season. The combination of sweet sticky rice and ripe mango represents the perfect harmony of flavors and textures",
                    pAiringSuggestions: ["Thai iced tea", "fresh coconut water"],
                    dietaryInfo: ["vegetarian", "vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 380,
                        protein: 5,
                        carbs: 72,
                        fat: 10,
                        vitamins: ["A", "C"],
                        minerals: ["Potassium", "Manganese"]
                    },
                    season: ["spring", "summer"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.30, Earth: 0.40, Air: 0.20 }
                },
                {
                    name: "Tub Tim Grob",
                    description: "water chestnut rubies in coconut milk",
                    cuisine: "Thai",
                    cookingMethods: ["boiling", "chilling"],
                    tools: [
                        "sharp knife",
                        "saucepan",
                        "strainer",
                        "mixing bowls",
                        "serving glasses"
                    ],
                    preparationSteps: [
                        "Dice water chestnuts",
                        "Coat with tapioca flour",
                        "Cook in boiling water",
                        "Prepare coconut syrup",
                        "Chill components",
                        "Assemble with crushed ice"
                    ],
                    ingredients: [
                        { name: "water chestnuts", amount: "200", unit: "g", category: "vegetable" },
                        { name: "tapioca flour", amount: "100", unit: "g", category: "starch" },
                        { name: "red food coloring", amount: "1", unit: "tsp", category: "coloring", optional: true },
                        { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                        { name: "palm sugar", amount: "100", unit: "g", category: "sweetener" },
                        { name: "jackfruit", amount: "100", unit: "g", category: "fruit", optional: true },
                        { name: "crushed ice", amount: "2", unit: "cups", category: "ice" }
                    ],
                    substitutions: {
                        "water chestnuts": ["jicama", "Asian pear"],
                        "palm sugar": ["coconut sugar", "raw sugar"],
                        "jackfruit": ["lychee", "longan"]
                    },
                    servingSize: 4,
                    allergens: ["tree nuts (coconut)"],
                    prepTime: "30 minutes",
                    cookTime: "10 minutes",
                    chillTime: "60 minutes",
                    culturalNotes: "A refreshing dessert popular during hot season. The name 'tub tim' means ruby, referring to the red coloring of the water chestnuts",
                    pAiringSuggestions: ["Thai iced tea", "fresh young coconut"],
                    dietaryInfo: ["vegetarian", "vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 4,
                        carbs: 45,
                        fat: 16,
                        vitamins: ["E", "K"],
                        minerals: ["Manganese", "Copper"]
                    },
                    season: ["summer"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.50, Earth: 0.20, Air: 0.20 }
                },
                {
                    name: "Bua Loi",
                    description: "Rice flour dumplings in warm coconut milk",
                    cuisine: "Thai",
                    cookingMethods: ["rolling", "boiling", "simmering"],
                    tools: [
                        "mixing bowls",
                        "saucepan",
                        "slotted spoon",
                        "measuring cups",
                        "whisk"
                    ],
                    preparationSteps: [
                        "Make rice flour dough",
                        "Color portions if desired",
                        "Roll into small balls",
                        "Boil dumplings",
                        "Prepare coconut sauce",
                        "Combine and serve warm"
                    ],
                    ingredients: [
                        { name: "glutinous rice flour", amount: "200", unit: "g", category: "flour" },
                        { name: "pandan extract", amount: "1", unit: "tsp", category: "flavoring", optional: true },
                        { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                        { name: "palm sugar", amount: "100", unit: "g", category: "sweetener" },
                        { name: "salt", amount: "1/4", unit: "tsp", category: "seasoning" },
                        { name: "ginger", amount: "2", unit: "slices", category: "spice", optional: true }
                    ],
                    substitutions: {
                        "glutinous rice flour": ["regular rice flour", "tapioca starch"],
                        "palm sugar": ["brown sugar", "coconut sugar"],
                        "pandan extract": ["vanilla extract"]
                    },
                    servingSize: 4,
                    allergens: ["tree nuts (coconut)"],
                    prepTime: "25 minutes",
                    cookTime: "15 minutes",
                    culturalNotes: "A comforting dessert often served during festivals and special occasions. The name means 'floating lotus' in Thai, referring to the dumpling's shape",
                    pAiringSuggestions: ["ginger tea", "Chinese donuts"],
                    dietaryInfo: ["vegetarian", "vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 280,
                        protein: 3,
                        carbs: 48,
                        fat: 10,
                        vitamins: ["E"],
                        minerals: ["Calcium", "Iron"]
                    },
                    season: ["all"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Sangkaya Fak Thong",
                    description: "Thai pumpkin custard",
                    cuisine: "Thai",
                    cookingMethods: ["steaming", "baking"],
                    tools: [
                        "steamer",
                        "mixing bowls",
                        "whisk",
                        "knife",
                        "measuring cups"
                    ],
                    preparationSteps: [
                        "Prepare pumpkin",
                        "Mix custard ingredients",
                        "Fill pumpkin",
                        "Steam until set",
                        "Cool slightly",
                        "Slice and serve"
                    ],
                    ingredients: [
                        { name: "kabocha pumpkin", amount: "1", unit: "medium", category: "vegetable" },
                        { name: "eggs", amount: "4", unit: "large", category: "protein" },
                        { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                        { name: "palm sugar", amount: "100", unit: "g", category: "sweetener" },
                        { name: "pandan leaves", amount: "2", unit: "pieces", category: "herb", optional: true },
                        { name: "salt", amount: "1/4", unit: "tsp", category: "seasoning" }
                    ],
                    substitutions: {
                        "kabocha pumpkin": ["butternut squash", "acorn squash"],
                        "palm sugar": ["coconut sugar", "brown sugar"],
                        "pandan leaves": ["vanilla extract"]
                    },
                    servingSize: 8,
                    allergens: ["eggs", "tree nuts (coconut)"],
                    prepTime: "20 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A traditional Thai dessert that combines Chinese steamed egg custard techniques with Thai ingredients. The pumpkin serves both as container and part of the dessert",
                    pAiringSuggestions: ["Thai tea", "coconut ice cream"],
                    dietaryInfo: ["vegetarian", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 220,
                        protein: 6,
                        carbs: 28,
                        fat: 12,
                        vitamins: ["A", "E"],
                        minerals: ["Potassium", "Iron"]
                    },
                    season: ["autumn", "winter"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.30, Earth: 0.40, Air: 0.20 }
                }
            ],
            summer: [
                {
                    name: "Nam Kang Sai",
                    description: "Thai shaved ice dessert with various toppings",
                    cuisine: "Thai",
                    cookingMethods: ["shaving ice", "preparing syrups", "assembling"],
                    tools: [
                        "ice shaver",
                        "saucepans",
                        "strainer",
                        "serving bowls",
                        "measuring cups"
                    ],
                    preparationSteps: [
                        "Prepare colored syrups",
                        "Cook and prepare toppings",
                        "Shave ice",
                        "Layer ingredients",
                        "Add coconut milk",
                        "Serve immediately"
                    ],
                    ingredients: [
                        { name: "shaved ice", amount: "4", unit: "cups", category: "ice" },
                        { name: "red syrup", amount: "60", unit: "ml", category: "syrup" },
                        { name: "green syrup", amount: "60", unit: "ml", category: "syrup" },
                        { name: "palm seeds", amount: "100", unit: "g", category: "fruit" },
                        { name: "red beans", amount: "100", unit: "g", category: "legume" },
                        { name: "grass jelly", amount: "100", unit: "g", category: "jelly" },
                        { name: "sweet corn", amount: "100", unit: "g", category: "vegetable" },
                        { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" }
                    ],
                    substitutions: {
                        "palm seeds": ["lychee", "longan"],
                        "grass jelly": ["agar jelly", "coconut jelly"],
                        "red beans": ["mung beans", "black beans"]
                    },
                    servingSize: 4,
                    allergens: ["tree nuts (coconut)"],
                    prepTime: "30 minutes",
                    cookTime: "20 minutes",
                    chillTime: "60 minutes",
                    culturalNotes: "A popular street dessert during Thailand's hot season. The variety of colors and textures makes it both visually appealing and refreshing",
                    pAiringSuggestions: ["Thai iced tea", "additional coconut milk"],
                    dietaryInfo: ["vegetarian", "vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 5,
                        carbs: 65,
                        fat: 8,
                        vitamins: ["A", "C"],
                        minerals: ["Iron", "Potassium"]
                    },
                    season: ["summer"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.60, Earth: 0.10, Air: 0.20 }
                }
            ]
        },
        snacks: {
            all: [
                {
                    name: "Kluay Tod",
                    description: "Crispy fried banana fritters",
                    cuisine: "Thai",
                    cookingMethods: ["deep-frying", "battering"],
                    tools: [
                        "deep fryer or wok",
                        "mixing bowls",
                        "whisk",
                        "spider strainer",
                        "paper towels"
                    ],
                    preparationSteps: [
                        "Prepare batter",
                        "Coat bananas",
                        "Heat oil",
                        "Fry until golden",
                        "Drain excess oil",
                        "Serve hot"
                    ],
                    ingredients: [
                        { name: "ripe bananas", amount: "8", unit: "medium", category: "fruit" },
                        { name: "rice flour", amount: "200", unit: "g", category: "flour" },
                        { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" },
                        { name: "sesame seeds", amount: "2", unit: "tbsp", category: "seed" },
                        { name: "sugar", amount: "2", unit: "tbsp", category: "sweetener" },
                        { name: "salt", amount: "1/4", unit: "tsp", category: "seasoning" }
                    ],
                    substitutions: {
                        "rice flour": ["all-purpose flour", "gluten-free flour blend"],
                        "coconut milk": ["regular milk", "plant-based milk"],
                        "bananas": ["plantains", "sweet potato"]
                    },
                    servingSize: 4,
                    allergens: ["tree nuts (coconut)", "sesame"],
                    prepTime: "15 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A popular street food snack, often sold by vendors in the afternoon. The crispy exterior and soft, sweet interior make it a beloved treat",
                    pAiringSuggestions: ["Thai iced tea", "honey dip", "vanilla ice cream"],
                    dietaryInfo: ["vegetarian", "vegan"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 280,
                        protein: 3,
                        carbs: 45,
                        fat: 12,
                        vitamins: ["B6", "C"],
                        minerals: ["Potassium", "Magnesium"]
                    },
                    season: ["all"],
                    mealType: ["snack", "dessert"],
                    elementalProperties: { Fire: 0.30, Water: 0.10, Earth: 0.40, Air: 0.20 }
                }
            ]
        }
    },
    traditionalSauces: {
        namPlaWaan: {
            name: "Nam Pla Wan (Sweet Fish Sauce)",
            description: "Sweet, spicy, and salty sauce combining fish sauce with palm sugar and chili",
            base: "fish sauce",
            keyIngredients: ["fish sauce", "palm sugar", "lime juice", "garlic", "chili"],
            culinaryUses: ["dipping sauce", "dressing", "flavor base", "marinade", "condiment"],
            variants: ["Nam Jim seafood", "Nam Jim Jaew", "Nam Jim Gai", "Spicy version", "Mild version"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Neptune", "Mars", "pisces"],
            seasonality: "all",
            preparationNotes: "Balance is key - should achieve equal sweet, sour, and salty notes with heat according to preference",
            technicalTips: "Palm sugar can be melted with a little water to help it dissolve more easily"
        },
        namPhrik: {
            name: "Nam Phrik (Chili Paste)",
            description: "Foundation of Thai cuisine, a versatile chili-based paste with regional variations",
            base: "chili peppers",
            keyIngredients: ["chili peppers", "garlic", "shallots", "fermented shrimp paste", "lime juice"],
            culinaryUses: ["flavor base", "dipping sauce", "stir-fry paste", "marinade", "soup enhancer"],
            variants: ["Nam Phrik Num", "Nam Phrik Ong", "Nam Phrik Kapi", "Nam Phrik Pao", "Nam Phrik Narok"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Sun", "aries"],
            seasonality: "all",
            preparationNotes: "Traditional preparation involves pounding in a mortar and pestle to develop complex flavors",
            technicalTips: "Roasting ingredients before pounding enhances aroma and reduces raw spiciness"
        },
        padThaiSauce: {
            name: "Pad Thai Sauce",
            description: "Sweet-sour-salty sauce that defines Thailand's most famous noodle dish",
            base: "tamarind paste",
            keyIngredients: ["tamarind paste", "fish sauce", "palm sugar", "rice vinegar", "preserved radish"],
            culinaryUses: ["noodle sauce", "stir-fry sauce", "marinade", "dressing", "glaze"],
            variants: ["Traditional", "Vegetarian/Vegan", "Spicy", "Royal-style", "Street vendor style"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Venus", "Mercury", "taurus"],
            seasonality: "all",
            preparationNotes: "Balance of sour from tamarind, sweet from palm sugar, and salty from fish sauce is crucial",
            technicalTips: "Prepare in advance and reduce to concentrate flavors before adding to noodles"
        },
        currySauces: {
            name: "Curry Pastes/Sauces",
            description: "Aromatic spice and herb pastes that form the foundation of Thai curries",
            base: "chilies and aromatics",
            keyIngredients: ["chilies", "galangal", "lemongrass", "kaffir lime", "shallots", "garlic", "shrimp paste"],
            culinaryUses: ["curry base", "stir-fry paste", "marinade", "flavor enhancer", "soup base"],
            variants: ["Green (Kaeng Khiao Wan)", "Red (Kaeng Phet)", "Yellow (Kaeng Kari)", "Massaman", "Panang"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Jupiter", "leo"],
            seasonality: "all",
            preparationNotes: "Traditional preparation requires significant time pounding ingredients to release oils and flavor compounds",
            technicalTips: "Fry paste in coconut cream (the thick part that rises to the top of coconut milk) until aromatic and oil separates"
        },
        srirachaSauce: {
            name: "Sriracha Sauce",
            description: "Fermented chili sauce with garlic and vinegar that has gained worldwide popularity",
            base: "fermented chili peppers",
            keyIngredients: ["red chili peppers", "garlic", "vinegar", "sugar", "salt"],
            culinaryUses: ["condiment", "marinade component", "stir-fry addition", "dipping sauce", "flavor enhancer"],
            variants: ["Original Thai style", "Vietnamese style", "American style", "Extra garlic", "Aged version"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Mercury", "sagittarius"],
            seasonality: "all",
            preparationNotes: "Traditional Thai version is tangier and thinner than the popular American version",
            technicalTips: "Fermentation develops depth of flavor beyond simple chili heat"
        }
    },
    sauceRecommender: {
        forProtein: {
            chicken: ["nam jim gai", "green curry", "prik king", "pad thai sauce", "nam jim jaew"],
            pork: ["nam phrik ong", "red curry", "nam jim jaew", "sweet soy glaze", "tamarind sauce"],
            beef: ["nam tok dressing", "massaman curry", "nam jim jaew", "oyster sauce blend", "panang curry"],
            seafood: ["seafood nam jim", "yellow curry", "lime-chili-garlic sauce", "sweet fish sauce", "green curry"],
            tofu: ["peanut sauce", "massaman curry", "sweet soy glaze", "tamarind sauce", "red curry"]
        },
        forVegetable: {
            leafy: ["nam jim", "sweet fish sauce", "sesame-soy dressing", "coconut-lime", "peanut sauce"],
            root: ["naam phrik phao", "massaman curry", "ginger sauce", "tamarind glaze", "sweet fish sauce"],
            fruiting: ["nam pla wan", "sriracha-lime", "sweet chili sauce", "nam phrik", "lime dressing"],
            herbs: ["coconut milk", "simple fish sauce", "lime dressing", "chili oil", "garlic-pepper sauce"],
            mushroom: ["oyster sauce blend", "nam prik pao", "golden mountain sauce", "black pepper sauce", "light soy"]
        },
        forCookingMethod: {
            grilling: ["nam jim jaew", "nam jim seafood", "tamarind glaze", "sriracha marinade", "sweet fish sauce"],
            stirFrying: ["pad thai sauce", "oyster sauce blend", "holy basil sauce", "black pepper sauce", "golden mountain"],
            steaming: ["lime-garlic-chili", "ginger sauce", "soy-sesame", "nam jim", "seafood dipping sauce"],
            currying: ["curry pastes with coconut milk", "massaman curry", "panang curry", "jungle curry", "khao soi"],
            salads: ["som tam dressing", "yam dressing", "larb dressing", "nam tok", "plaa dressing"]
        },
        byAstrological: { Fire: ["nam phrik", "jungle curry", "dried chili dip", "sriracha", "prik king"],
            Water: ["green curry", "nam jim seafood", "coconut-based sauces", "fish sauce blends", "herb infusions"],
            Earth: ["massaman curry", "peanut sauce", "tamarind-based sauces", "nam phrik ong", "sweet soy"],
            Air: ["lime-based dressings", "herb-infused oils", "light nam pla prik", "citrus vinaigrettes", "lemongrass dips"]
        },
        byRegion: {
            northern: ["nam phrik num", "nam phrik ong", "jaew bong", "sai ua paste", "hang lay curry"],
            northeastern: ["nam jim jaew", "som tam sauce", "larb dressing", "fermented fish sauce", "tamarind dipping"],
            central: ["green curry", "red curry", "nam prik kapi", "pad thai sauce", "sweet chili sauce"],
            southern: ["southern curry paste", "khua kling paste", "nam phrik goong siap", "sator sauce", "gaeng tai pla"]
        },
        byDietary: {
            vegetarian: ["peanut sauce", "sweet soy glaze", "tamarind sauce", "mushroom sauce", "coconut curry"],
            vegan: ["lime-herb dressing", "tamarind-based sauces", "vegetable curry", "sesame-soy dressing", "chili jam"],
            glutenFree: ["nam jim", "green curry", "herb infusions", "fish sauce-based", "coconut-based sauces"],
            dAiryFree: ["all traditional Thai sauces", "curry pastes", "oil-based dressings", "chili dips", "herb infused oils"]
        }
    },
    cookingTechniques: [
        {
            name: "Wok Cooking (Pad)",
            description: "Fast high-heat stir-frying that preserves texture and creates 'wok hei' or breath of the wok",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["wok", "wok spatula", "high BTU burner", "spider strainer", "cleaver"],
            bestFor: ["stir-fries", "noodle dishes", "quick curries", "fried rice", "sautéed vegetables"]
        },
        {
            name: "Pounding (Tam/Dtam)",
            description: "Using mortar and pestle to crush ingredients, releasing essential oils and combining flavors",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["clay or stone mortar", "wooden pestle", "preparation bowls", "strainer"],
            bestFor: ["curry pastes", "som tam", "nam prik", "herb pastes", "spice blends"]
        },
        {
            name: "Steaming (Neung)",
            description: "Gentle cooking with steam to preserve nutrients and delicate textures",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["bamboo steamer", "wok", "cheesecloth", "banana leaves", "steamer rack"],
            bestFor: ["fish", "custards", "dumplings", "sticky rice", "certain vegetables"]
        },
        {
            name: "Grilling (Yang)",
            description: "Direct heat cooking over charcoal for smoky flavor and caramelization",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["charcoal grill", "bamboo skewers", "banana leaf wrappers", "basting brush"],
            bestFor: ["marinated meats", "fish", "skewered foods", "vegetables", "sticky rice in bamboo"]
        },
        {
            name: "Curry Making (Gaeng)",
            description: "Complex process of creating curry from scratch with paste-making and slow simmering",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["mortar and pestle", "heavy pot", "coconut press", "strainer", "wooden spoons"],
            bestFor: ["coconut-based curries", "clear spicy soups", "braised dishes", "complex stews"]
        }
    ],
    regionalCuisines: [
        {
            name: "Northern Thai (Lanna)",
            description: "More mild and less spicy cuisine with Burmese and Lao influences, featuring sticky rice and pork",
            signatureDishes: ["Khao Soi", "Nam Prik Ong", "Sai Ua", "Gaeng Hang Lay", "Khao Lam"],
            keyIngredients: ["sticky rice", "pork", "tomatoes", "ginger", "turmeric", "kaffir lime"],
            cookingTechniques: ["grilling", "stewing", "fermenting", "steaming"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Lanna Kingdom", "Burmese", "Chinese Yunnan", "Lao"],
            philosophicalFoundations: "Connected to Lanna traditions with an emphasis on communal dining and seasonal ingredients"
        },
        {
            name: "Northeastern Thai (Isaan)",
            description: "Intense flavors with Lao influence, featuring fermentation, spicy chilies, and sticky rice",
            signatureDishes: ["Som Tam", "Larb", "Gai Yang", "Nam Tok", "Moo Nam Tok"],
            keyIngredients: ["sticky rice", "chilies", "lime", "fish sauce", "fresh herbs", "fermented fish"],
            cookingTechniques: ["grilling", "pounding", "fermenting", "raw preparations"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Lao", "Khmer", "Vietnamese"],
            philosophicalFoundations: "Emphasizes simple, straightforward preparations that highlight fresh ingredients"
        },
        {
            name: "Central Thai",
            description: "The royal court cuisine with balanced flavors combining sweet, sour, salty, and spicy elements",
            signatureDishes: ["Pad Thai", "Tom Yum Goong", "Gaeng Keow Wan", "Massaman Curry", "Hoy Tod"],
            keyIngredients: ["jasmine rice", "coconut milk", "palm sugar", "fish sauce", "chilies", "galangal"],
            cookingTechniques: ["stir-frying", "curry making", "deep-frying", "slow simmering"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Royal Thai Court", "Chinese", "Persian", "Portuguese"],
            philosophicalFoundations: "Balance and refinement from royal court traditions, with elaborate preparations"
        },
        {
            name: "Southern Thai",
            description: "Intensely spicy and aromatic cuisine with Malaysian influences and abundant seafood",
            signatureDishes: ["Gaeng Tai Pla", "Khua Kling", "Gaeng Som", "Sataw Pad Kapi Goong", "Khao Yam"],
            keyIngredients: ["seafood", "turmeric", "southern bird's eye chilies", "sator beans", "coconut"],
            cookingTechniques: ["slow cooking", "dry currying", "stewing", "fermenting"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Malay", "Indonesian", "Indian"],
            philosophicalFoundations: "Bold approach to flavor showcasing heat, pungency, and freshness of local ingredients"
        },
        {
            name: "Royal Thai Cuisine",
            description: "Refined, artistic cuisine developed in the royal palace with intricate preparation techniques",
            signatureDishes: ["Mee Krob", "Pla Dook Foo", "Chor Muang", "Massaman Curry", "Foi Thong"],
            keyIngredients: ["premium meats", "coconut cream", "palm sugar", "edible flowers", "aromatic spices"],
            cookingTechniques: ["carving", "intricate presentation", "reduction", "slow cooking"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Thai Royal Court", "Ayutthaya Kingdom", "Persian", "European"],
            philosophicalFoundations: "Emphasizes aesthetic beauty, balance of flavors, and sophisticated presentation"
        }
    ],
    elementalProperties: { Fire: 1.00, Water: 0.00, Earth: 0.00, Air: 0.00 }
};
