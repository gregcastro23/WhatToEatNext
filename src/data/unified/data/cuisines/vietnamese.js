export const vietnamese = {
    id: "vietnamese",
    name: "Vietnamese",
    description: "Traditional Vietnamese cuisine emphasizing fresh ingredients, herbs, and balanced flavors",
    dishes: {
        breakfast: {
            all: [
                {
                    name: "Phở Bò",
                    description: "Traditional Vietnamese beef noodle soup",
                    cuisine: "Vietnamese",
                    cookingMethods: ["simmering", "boiling", "garnishing"],
                    tools: [
                        "large stock pot",
                        "strainer",
                        "ladle",
                        "serving bowls",
                        "chopsticks"
                    ],
                    preparationSteps: [
                        "Char ginger and onions",
                        "Simmer beef bones",
                        "Toast spices",
                        "Strain broth",
                        "Cook rice noodles",
                        "Assemble bowls",
                        "Add garnishes"
                    ],
                    ingredients: [
                        { name: "beef bones", amount: "2", unit: "kg", category: "protein" },
                        { name: "rice noodles", amount: "500", unit: "g", category: "grain", swaps: ["shirataki noodles"] },
                        { name: "beef slices", amount: "400", unit: "g", category: "protein", swaps: ["tofu", "mushrooms"] },
                        { name: "onion", amount: "2", unit: "large", category: "vegetable" },
                        { name: "ginger", amount: "100", unit: "g", category: "spice" },
                        { name: "star anise", amount: "4", unit: "pieces", category: "spice" },
                        { name: "cinnamon stick", amount: "2", unit: "pieces", category: "spice" },
                        { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" },
                        { name: "Thai basil", amount: "1", unit: "bunch", category: "herb" },
                        { name: "cilantro", amount: "1", unit: "bunch", category: "herb" },
                        { name: "lime", amount: "2", unit: "whole", category: "fruit" },
                        { name: "hoisin sauce", amount: "4", unit: "tbsp", category: "condiment" },
                        { name: "sriracha", amount: "4", unit: "tbsp", category: "condiment" }
                    ],
                    substitutions: {
                        "beef bones": ["chicken bones", "mushroom broth"],
                        "beef slices": ["chicken", "tofu", "mushrooms"],
                        "hoisin sauce": ["soy sauce", "coconut aminos"]
                    },
                    servingSize: 6,
                    allergens: ["soy"],
                    prepTime: "30 minutes",
                    cookTime: "6 hours",
                    culturalNotes: "Phở originated in the early 20th century in northern Vietnam and is considered the national dish. The clear broth is a result of careful simmering and skimming",
                    pAiringSuggestions: ["Vietnamese coffee", "fresh chili peppers", "pickled garlic"],
                    dietaryInfo: ["adaptable to gluten-free", "adaptable to vegan"],
                    spiceLevel: "customizable",
                    nutrition: {
                        calories: 480,
                        protein: 32,
                        carbs: 58,
                        fat: 16,
                        vitamins: ["B12", "C", "A"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["breakfast", "lunch"],
                    elementalProperties: { Fire: 0.20, Water: 0.40, Earth: 0.20, Air: 0.20 }
                },
                {
                    name: "Cháo Gà",
                    description: "Vietnamese chicken rice porridge",
                    cuisine: "Vietnamese",
                    cookingMethods: ["simmering", "poaching"],
                    tools: [
                        "large pot",
                        "ladle",
                        "knife",
                        "cutting board",
                        "small bowls for garnishes"
                    ],
                    preparationSteps: [
                        "Cook rice until very soft",
                        "Poach chicken",
                        "Prepare garnishes",
                        "Season porridge",
                        "Shred chicken",
                        "Assemble bowls"
                    ],
                    ingredients: [
                        { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "chicken", amount: "500", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "ginger", amount: "50", unit: "g", category: "spice" },
                        { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
                        { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                        { name: "black pepper", amount: "1", unit: "tsp", category: "spice" },
                        { name: "fried shallots", amount: "4", unit: "tbsp", category: "garnish" },
                        { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" }
                    ],
                    substitutions: {
                        "chicken": ["turkey", "tofu", "mushrooms"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "fried shallots": ["fried garlic", "crispy onions"]
                    },
                    servingSize: 4,
                    allergens: ["fish"],
                    prepTime: "15 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "Cháo is a comforting breakfast dish often served when someone is feeling unwell. Each region has its own variation",
                    pAiringSuggestions: ["youtiao (fried dough)", "pickled vegetables", "century eggs"],
                    dietaryInfo: ["dAiry-free", "adaptable to gluten-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 320,
                        protein: 28,
                        carbs: 42,
                        fat: 8,
                        vitamins: ["B6", "B12"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"],
                    elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Bánh Cuốn",
                    description: "Steamed rice rolls filled with ground pork and mushrooms",
                    cuisine: "Vietnamese",
                    cookingMethods: ["steaming", "filling", "assembling"],
                    tools: [
                        "steamer",
                        "non-stick pan",
                        "spatula",
                        "mixing bowls",
                        "serving plates"
                    ],
                    preparationSteps: [
                        "Make rice batter",
                        "Prepare filling",
                        "Steam thin layers",
                        "Fill and roll",
                        "Make dipping sauce",
                        "Garnish and serve"
                    ],
                    ingredients: [
                        { name: "rice flour", amount: "300", unit: "g", category: "flour" },
                        { name: "tapioca starch", amount: "50", unit: "g", category: "starch" },
                        { name: "ground pork", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
                        { name: "wood ear mushrooms", amount: "50", unit: "g", category: "vegetable" },
                        { name: "shallots", amount: "4", unit: "whole", category: "vegetable" },
                        { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning" },
                        { name: "fried shallots", amount: "4", unit: "tbsp", category: "garnish" },
                        { name: "Vietnamese herbs", amount: "1", unit: "bunch", category: "herb" }
                    ],
                    substitutions: {
                        "ground pork": ["minced mushrooms", "tofu"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "wood ear mushrooms": ["shiitake mushrooms"]
                    },
                    servingSize: 4,
                    allergens: ["fish"],
                    prepTime: "30 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A beloved breakfast dish from Northern Vietnam, often served with nước chấm dipping sauce and chả lụa (Vietnamese pork sausage)",
                    pAiringSuggestions: ["Vietnamese coffee", "fresh herbs", "chili sauce"],
                    dietaryInfo: ["dAiry-free", "adaptable to vegan"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 280,
                        protein: 15,
                        carbs: 45,
                        fat: 6,
                        vitamins: ["B1", "B6"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["breakfast"],
                    elementalProperties: { Fire: 0.10, Water: 0.30, Earth: 0.30, Air: 0.30 }
                }
            ],
            winter: [
                {
                    name: "Cháo",
                    description: "Vietnamese rice porridge with chicken",
                    cuisine: "Vietnamese",
                    ingredients: [
                        { name: "rice", amount: "1", unit: "cup", category: "grain" },
                        { name: "chicken", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
                        { name: "ginger", amount: "30", unit: "g", category: "spice" },
                        { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" }
                    ],
                    nutrition: {
                        calories: 350,
                        protein: 25,
                        carbs: 45,
                        fat: 8,
                        vitamins: ["B1", "B2"],
                        minerals: ["Iron", "Zinc"]
                    },
                    timeToMake: "45 minutes",
                    season: ["winter"],
                    mealType: ["breakfast"]
                }
            ]
        },
        lunch: {
            all: [
                {
                    name: "Bánh Mì Thịt",
                    description: "Vietnamese sandwich with grilled pork and pickled vegetables",
                    cuisine: "Vietnamese",
                    cookingMethods: ["grilling", "pickling", "assembling"],
                    tools: [
                        "grill or grill pan",
                        "knife",
                        "cutting board",
                        "mixing bowls",
                        "mandoline"
                    ],
                    preparationSteps: [
                        "Marinate pork",
                        "Prepare pickled vegetables",
                        "Grill pork",
                        "Toast baguette",
                        "Make spicy mayo",
                        "Assemble sandwich"
                    ],
                    ingredients: [
                        { name: "baguette", amount: "4", unit: "pieces", category: "grain", swaps: ["gluten-free baguette"] },
                        { name: "pork belly", amount: "400", unit: "g", category: "protein", swaps: ["tofu", "seitan"] },
                        { name: "daikon", amount: "200", unit: "g", category: "vegetable" },
                        { name: "carrots", amount: "200", unit: "g", category: "vegetable" },
                        { name: "cucumber", amount: "1", unit: "large", category: "vegetable" },
                        { name: "cilantro", amount: "1", unit: "bunch", category: "herb" },
                        { name: "pate", amount: "100", unit: "g", category: "spread", swaps: ["mushroom pate"] },
                        { name: "mayonnaise", amount: "4", unit: "tbsp", category: "condiment" },
                        { name: "sriracha", amount: "2", unit: "tbsp", category: "condiment" }
                    ],
                    substitutions: {
                        "pork belly": ["chicken", "tofu", "mushrooms"],
                        "pate": ["mushroom pate", "hummus"],
                        "mayonnaise": ["vegan mayo"]
                    },
                    servingSize: 4,
                    allergens: ["wheat", "eggs"],
                    prepTime: "30 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "Bánh mì represents the French colonial influence on Vietnamese cuisine, combining French baguettes with Vietnamese flavors",
                    pAiringSuggestions: ["Vietnamese iced coffee", "pickled vegetables", "chili sauce"],
                    dietaryInfo: ["adaptable to vegan"],
                    spiceLevel: "mild to medium",
                    nutrition: {
                        calories: 550,
                        protein: 28,
                        carbs: 65,
                        fat: 22,
                        vitamins: ["A", "C"],
                        minerals: ["Iron", "Calcium"]
                    },
                    season: ["all"],
                    mealType: ["lunch"],
                    elementalProperties: { Fire: 0.20, Water: 0.20, Earth: 0.30, Air: 0.30 }
                },
                {
                    name: "Bún Chả",
                    description: "Grilled pork meatballs with rice noodles and herbs",
                    cuisine: "Vietnamese",
                    cookingMethods: ["grilling", "boiling"],
                    tools: [
                        "grill",
                        "mixing bowls",
                        "pot",
                        "strainer",
                        "serving bowls"
                    ],
                    preparationSteps: [
                        "Form meatballs",
                        "Make dipping sauce",
                        "Grill meatballs",
                        "Cook noodles",
                        "Prepare herbs",
                        "Assemble bowls"
                    ],
                    ingredients: [
                        { name: "ground pork", amount: "500", unit: "g", category: "protein" },
                        { name: "rice noodles", amount: "400", unit: "g", category: "grain" },
                        { name: "fish sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
                        { name: "shallots", amount: "4", unit: "pieces", category: "vegetable" },
                        { name: "lettuce", amount: "1", unit: "head", category: "vegetable" },
                        { name: "herbs mix", amount: "2", unit: "cups", category: "herb" },
                        { name: "green papaya", amount: "200", unit: "g", category: "vegetable" },
                        { name: "lime", amount: "2", unit: "pieces", category: "fruit" }
                    ],
                    substitutions: {
                        "ground pork": ["chicken", "turkey", "plant-based meat"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "green papaya": ["carrots", "daikon"]
                    },
                    servingSize: 4,
                    allergens: ["fish"],
                    prepTime: "45 minutes",
                    cookTime: "20 minutes",
                    culturalNotes: "A Hanoi specialty that gained international recognition when Anthony Bourdain and Barack Obama enjoyed it together",
                    pAiringSuggestions: ["Vietnamese beer", "pickled garlic", "chili"],
                    dietaryInfo: ["dAiry-free", "adaptable to gluten-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 480,
                        protein: 32,
                        carbs: 55,
                        fat: 18,
                        vitamins: ["B12", "C"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["spring", "summer"],
                    mealType: ["lunch", "dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Bún Bò Huế",
                    description: "Spicy beef noodle soup from Hue",
                    cuisine: "Vietnamese",
                    cookingMethods: ["simmering", "boiling", "spice preparation"],
                    tools: [
                        "large stock pot",
                        "strainer",
                        "ladle",
                        "serving bowls",
                        "chopsticks"
                    ],
                    preparationSteps: [
                        "Prepare lemongrass broth",
                        "Cook beef and pork",
                        "Make chili oil",
                        "Cook noodles",
                        "Assemble bowls",
                        "Add garnishes"
                    ],
                    ingredients: [
                        { name: "beef shank", amount: "500", unit: "g", category: "protein" },
                        { name: "pork knuckles", amount: "300", unit: "g", category: "protein" },
                        { name: "thick rice noodles", amount: "500", unit: "g", category: "grain" },
                        { name: "lemongrass", amount: "4", unit: "stalks", category: "herb" },
                        { name: "shrimp paste", amount: "2", unit: "tbsp", category: "seasoning" },
                        { name: "annatto seeds", amount: "2", unit: "tbsp", category: "spice" },
                        { name: "Vietnamese herbs", amount: "2", unit: "cups", category: "herb" },
                        { name: "banana flower", amount: "1", unit: "whole", category: "vegetable", optional: true }
                    ],
                    substitutions: {
                        "beef shank": ["brisket", "tofu"],
                        "pork knuckles": ["pork belly", "mushrooms"],
                        "shrimp paste": ["miso paste"]
                    },
                    servingSize: 6,
                    allergens: ["shellfish"],
                    prepTime: "40 minutes",
                    cookTime: "3 hours",
                    culturalNotes: "A regional specialty from the imperial city of Hue, known for its spicy broth and complex flavors",
                    pAiringSuggestions: ["lime wedges", "chili sauce", "fresh herbs"],
                    dietaryInfo: ["dAiry-free"],
                    spiceLevel: "hot",
                    nutrition: {
                        calories: 520,
                        protein: 35,
                        carbs: 65,
                        fat: 18,
                        vitamins: ["B12", "C"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["lunch", "dinner"],
                    elementalProperties: { Fire: 0.40, Water: 0.30, Earth: 0.20, Air: 0.10 }
                }
            ]
        },
        dinner: {
            all: [
                {
                    name: "Cá Kho Tộ",
                    description: "Caramelized fish in clay pot",
                    cuisine: "Vietnamese",
                    cookingMethods: ["braising", "caramelizing"],
                    tools: [
                        "clay pot or heavy pot",
                        "wooden spoon",
                        "knife",
                        "cutting board",
                        "measuring spoons"
                    ],
                    preparationSteps: [
                        "Clean and cut fish",
                        "Make caramel sauce",
                        "Layer ingredients",
                        "Simmer fish",
                        "Reduce sauce",
                        "Garnish and serve"
                    ],
                    ingredients: [
                        { name: "catfish steaks", amount: "800", unit: "g", category: "protein", swaps: ["salmon", "mackerel"] },
                        { name: "sugar", amount: "3", unit: "tbsp", category: "sweetener" },
                        { name: "fish sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "coconut water", amount: "1", unit: "cup", category: "liquid" },
                        { name: "shallots", amount: "4", unit: "whole", category: "vegetable" },
                        { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
                        { name: "ginger", amount: "2", unit: "inches", category: "spice" },
                        { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
                        { name: "black pepper", amount: "1", unit: "tsp", category: "spice" },
                        { name: "chili", amount: "2", unit: "pieces", category: "spice", optional: true }
                    ],
                    substitutions: {
                        "catfish": ["salmon", "mackerel", "tofu"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "coconut Water: ['Water', "stock"]
                    },
                    servingSize: 4,
                    allergens: ["fish"],
                    prepTime: "20 minutes",
                    cookTime: "40 minutes",
                    culturalNotes: "A homestyle dish that exemplifies the Vietnamese caramelization technique. The clay pot helps develop deep flavors and keeps the fish moist",
                    pAiringSuggestions: ["steamed rice", "water spinach", "soup"],
                    dietaryInfo: ["dAiry-free", "gluten-free"],
                    spiceLevel: "mild to medium",
                    nutrition: {
                        calories: 420,
                        protein: 35,
                        carbs: 15,
                        fat: 25,
                        vitamins: ["D", "B12"],
                        minerals: ["Omega-3", "Iron"]
                    },
                    season: ["all"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.30, Air: 0.10 }
                },
                {
                    name: "Cơm Tấm",
                    description: "Broken rice with grilled pork chop and egg",
                    cuisine: "Vietnamese",
                    cookingMethods: ["grilling", "frying", "steaming"],
                    tools: [
                        "grill",
                        "rice cooker",
                        "frying pan",
                        "mixing bowls",
                        "serving plates"
                    ],
                    preparationSteps: [
                        "Marinate pork chops",
                        "Cook broken rice",
                        "Grill pork chops",
                        "Prepare bì (shredded pork)",
                        "Fry eggs",
                        "Assemble plate"
                    ],
                    ingredients: [
                        { name: "broken rice", amount: "2", unit: "cups", category: "grain" },
                        { name: "pork chops", amount: "4", unit: "pieces", category: "protein" },
                        { name: "eggs", amount: "4", unit: "large", category: "protein" },
                        { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
                        { name: "pickled vegetables", amount: "200", unit: "g", category: "vegetable" },
                        { name: "fish sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                        { name: "lemongrass", amount: "2", unit: "stalks", category: "herb" },
                        { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" }
                    ],
                    substitutions: {
                        "pork chops": ["chicken thighs", "tofu steaks"],
                        "fish sauce": ["soy sauce", "coconut aminos"],
                        "broken rice": ["jasmine rice", "brown rice"]
                    },
                    servingSize: 4,
                    allergens: ["fish", "eggs"],
                    prepTime: "30 minutes",
                    cookTime: "45 minutes",
                    culturalNotes: "A Saigon specialty that originated from using broken rice grains that couldn't be sold at full price. Now it's a beloved dish throughout Vietnam",
                    pAiringSuggestions: ["scallion oil", "chili sauce", "soup broth"],
                    dietaryInfo: ["dAiry-free"],
                    spiceLevel: "mild",
                    nutrition: {
                        calories: 650,
                        protein: 45,
                        carbs: 70,
                        fat: 25,
                        vitamins: ["B12", "D"],
                        minerals: ["Iron", "Zinc"]
                    },
                    season: ["all"],
                    mealType: ["dinner"],
                    elementalProperties: { Fire: 0.30, Water: 0.10, Earth: 0.40, Air: 0.20 }
                }
            ]
        },
        dessert: {
            all: [
                {
                    name: "Chè Ba Màu",
                    description: "Three-color dessert with beans, jelly, and coconut milk",
                    cuisine: "Vietnamese",
                    cookingMethods: ["cooking beans", "layering"],
                    tools: [
                        "saucepans",
                        "strainer",
                        "tall glasses",
                        "measuring cups",
                        "spoons"
                    ],
                    preparationSteps: [
                        "Cook red beans",
                        "Prepare mung beans",
                        "Make pandan jelly",
                        "Prepare coconut milk",
                        "Layer ingredients",
                        "Chill before serving"
                    ],
                    ingredients: [
                        { name: "red beans", amount: "200", unit: "g", category: "legume" },
                        { name: "mung beans", amount: "200", unit: "g", category: "legume" },
                        { name: "pandan jelly", amount: "200", unit: "g", category: "jelly" },
                        { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                        { name: "palm sugar", amount: "100", unit: "g", category: "sweetener" },
                        { name: "pandan leaves", amount: "2", unit: "pieces", category: "herb", optional: true },
                        { name: "crushed ice", amount: "2", unit: "cups", category: "ice" }
                    ],
                    substitutions: {
                        "palm sugar": ["brown sugar", "coconut sugar"],
                        "pandan jelly": ["grass jelly", "agar jelly"],
                        "coconut milk": ["almond milk", "oat milk"]
                    },
                    servingSize: 4,
                    allergens: ["tree nuts (coconut)"],
                    prepTime: "30 minutes",
                    cookTime: "1 hour",
                    chillTime: "2 hours",
                    culturalNotes: "A beloved Vietnamese dessert where the three colors represent different textures and flavors. Often enjoyed during hot summer days",
                    pAiringSuggestions: ["Vietnamese coffee", "additional coconut milk"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 320,
                        protein: 8,
                        carbs: 52,
                        fat: 12,
                        vitamins: ["B1", "E"],
                        minerals: ["Iron", "Magnesium"]
                    },
                    season: ["summer"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.30, Air: 0.20 }
                },
                {
                    name: "Chè Chuối",
                    description: "Sweet banana in coconut milk soup",
                    cuisine: "Vietnamese",
                    cookingMethods: ["simmering", "cooking"],
                    tools: [
                        "pot",
                        "wooden spoon",
                        "measuring cups",
                        "serving bowls",
                        "knife"
                    ],
                    preparationSteps: [
                        "Prepare bananas",
                        "Make tapioca pearls",
                        "Cook coconut milk",
                        "Combine ingredients",
                        "Add toppings",
                        "Serve warm or cold"
                    ],
                    ingredients: [
                        { name: "ripe bananas", amount: "6", unit: "medium", category: "fruit" },
                        { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                        { name: "tapioca pearls", amount: "100", unit: "g", category: "starch" },
                        { name: "palm sugar", amount: "80", unit: "g", category: "sweetener" },
                        { name: "pandan leaves", amount: "2", unit: "pieces", category: "herb", optional: true },
                        { name: "sesame seeds", amount: "2", unit: "tbsp", category: "garnish" },
                        { name: "crushed peanuts", amount: "1/2", unit: "cup", category: "garnish", optional: true }
                    ],
                    substitutions: {
                        "palm sugar": ["brown sugar", "coconut sugar"],
                        "coconut milk": ["almond milk", "oat milk"],
                        "pandan leaves": ["vanilla extract"]
                    },
                    servingSize: 6,
                    allergens: ["tree nuts (coconut)", "peanuts"],
                    prepTime: "15 minutes",
                    cookTime: "25 minutes",
                    culturalNotes: "A comforting dessert soup that's often served both hot and cold. The combination of bananas and coconut milk is a classic Vietnamese pAiring",
                    pAiringSuggestions: ["Vietnamese coffee", "sesame crackers"],
                    dietaryInfo: ["vegan", "gluten-free"],
                    spiceLevel: "none",
                    nutrition: {
                        calories: 280,
                        protein: 4,
                        carbs: 42,
                        fat: 12,
                        vitamins: ["B6", "C"],
                        minerals: ["Potassium", "Magnesium"]
                    },
                    season: ["all"],
                    mealType: ["dessert"],
                    elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.30, Air: 0.20 }
                }
            ]
        }
    },
    traditionalSauces: {
        nuocCham: {
            name: "Nước Chấm",
            description: "Quintessential Vietnamese dipping sauce combining fish sauce, lime, sugar, and chili",
            base: "fish sauce",
            keyIngredients: ["fish sauce", "lime juice", "sugar", "garlic", "chili", 'Water'],
            culinaryUses: ["dipping sauce", "dressing", "marinade", "noodle sauce", "flavor enhancer"],
            variants: ["Northern style (less sweet)", "Southern style (sweeter)", "Vegetarian (soy-based)", "Extra spicy", "Garlic-forward"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Neptune", "Mars", "pisces"],
            seasonality: "all",
            preparationNotes: "Balance is critical - should harmonize sweet, sour, salty, and spicy flavors in perfect proportion",
            technicalTips: "Let sit for at least 15 minutes before serving to allow flavors to meld"
        },
        nuocMam: {
            name: "Nước Mắm (Fish Sauce)",
            description: "Fermented anchovy sauce that forms the foundation of Vietnamese cuisine",
            base: "fermented anchovies",
            keyIngredients: ["anchovies", "salt", "time"],
            culinaryUses: ["base for dipping sauces", "seasoning", "marinade", "broth enhancer", "dressing component"],
            variants: ["Phú Quốc (premium)", "Phan Thiết", "Northern style", "Southern style", "Aged premium"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Neptune", "Moon", "scorpio"],
            seasonality: "all",
            preparationNotes: "Traditional production takes at least 12 months of fermentation in wooden barrels",
            technicalTips: "High-quality fish sauce should have a deep amber color and complex aroma beyond just fishiness"
        },
        tuongOt: {
            name: "Tương Ớt (Chili Sauce)",
            description: "Vietnamese-style fermented chili sauce with garlic and vinegar",
            base: "chili peppers",
            keyIngredients: ["red chili peppers", "garlic", "vinegar", "salt", "sugar"],
            culinaryUses: ["condiment", "stir-fry enhancement", "marinade component", "dipping sauce", "soup enhancer"],
            variants: ["Huế style (extra spicy)", "Saigon style", "Garlic-heavy", "Sweet version", "Northern style"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Sun", "aries"],
            seasonality: "all",
            preparationNotes: "Traditional recipes often include fermentation to develop deeper flavor",
            technicalTips: "Roasting or charring chilies first adds complexity and tempers raw heat"
        },
        tuongDen: {
            name: "Tương Đen (Black Bean Sauce)",
            description: "Fermented soybean sauce used in Vietnamese-Chinese fusion dishes",
            base: "fermented soybeans",
            keyIngredients: ["black beans", "soy sauce", "garlic", "sugar", "oil"],
            culinaryUses: ["stir-fry sauce", "marinade", "dipping sauce", "vegetable seasoning", "flavor base"],
            variants: ["Sweet style", "Garlicky style", "Spicy style", "Clear style", "Chinese-influenced"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Saturn", "Jupiter", "capricorn"],
            seasonality: "all",
            preparationNotes: "Often used in dishes showing Chinese culinary influence in Vietnamese cuisine",
            technicalTips: "Toast in oil before using to release aromatics and reduce raw bean flavor"
        },
        saTe: {
            name: "Sa Tế (Vietnamese Sateay Sauce)",
            description: "Aromatic lemongrass and chili paste used in soups and stir-fries",
            base: "lemongrass and chilies",
            keyIngredients: ["lemongrass", "chilies", "garlic", "shallots", "annatto oil", "fish sauce"],
            culinaryUses: ["soup enhancement", "stir-fry sauce", "marinade", "grilling sauce", "flavor paste"],
            variants: ["Northern style", "Huế style (extra spicy)", "Vegetarian (no fish sauce)", "Extra lemongrass", "Chinese-influenced"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            astrologicalInfluences: ["Mars", "Mercury", "leo"],
            seasonality: "all",
            preparationNotes: "Most authentic when chilies and aromatics are pounded by hand in a mortar and pestle",
            technicalTips: "The oil should separate when fried properly, creating a vibrant red layer on top"
        }
    },
    sauceRecommender: {
        forProtein: {
            beef: ["nước chấm", "sa tế", "lime-pepper-salt dip", "ginger fish sauce", "hoisin sauce"],
            pork: ["nước chấm", "nước mắm gừng", "tương đen", "chili fish sauce", "tamarind sauce"],
            chicken: ["ginger fish sauce", "nước chấm", "caramel sauce", "lime-pepper-salt dip", "fermented bean curd"],
            seafood: ["ginger fish sauce", "sour fish sauce", "green chili sauce", "garlic lime sauce", "tamarind dip"],
            tofu: ["nước chấm chay", "tương đen", "ginger soy sauce", "tamarind sauce", "peanut sauce"]
        },
        forVegetable: {
            leafy: ["nước chấm", "lime-garlic sauce", "fermented bean curd", "peanut sauce", "sesame sauce"],
            root: ["gừng nước mắm", "tamarind sauce", "soy-scallion sauce", "coconut sauce", "caramel sauce"],
            herbs: ["simple nước chấm", "lime juice", "chili oil", "peanut sauce", "black pepper dip"],
            mushroom: ["five-spice sauce", "tương đen", "ginger fish sauce", "lemongrass sauce", "sa tế"],
            sprouts: ["light nước chấm", "lime juice dressing", "soy-vinegar dip", "sesame oil", "sweet-sour sauce"]
        },
        forCookingMethod: {
            grilling: ["lime-pepper-salt dip", "nước chấm", "lemongrass sauce", "hoisin sauce", "peanut sauce"],
            boiling: ["ginger fish sauce", "simple nước chấm", "scallion oil", "chili vinegar", "fermented shrimp paste"],
            steaming: ["ginger fish sauce", "soy scallion sauce", "lime juice", "spicy fish sauce", "garlic oil"],
            frying: ["sweet and sour sauce", "nước chấm", "tamarind sauce", "pickled vegetable dip", "sa tế"],
            raw: ["spicy nước chấm", "lime-chili sauce", "salty-sweet fish sauce", "herbs and lime", "mắm nêm"]
        },
        byAstrological: { Fire: ["sa tế", "tương ớt", "spicy nước chấm", "chili oil", "black pepper sauce"],
            Water: ["simple nước mắm", "sour tamarind sauce", "lime juice dressings", "mild nước chấm", "coconut sauces"],
            Earth: ["tương đen", "peanut sauce", "fermented bean curd", "mắm nêm", "mắm ruốc"],
            Air: ["herb-infused dressings", "lime-pepper-salt dip", "citrus vinaigrettes", "scallion oil", "light herb sauces"]
        },
        byDietary: {
            vegan: ["soy sauce dip", "vegan nước chấm", "fermented tofu sauce", "peanut sauce", "tamarind sauce"],
            vegetarian: ["mushroom sauce", "soy-based fish sauce", "sesame-soy dip", "herb oil", "chili-lime sauce"],
            glutenFree: ["rice vinegar dressing", "fish sauce dip", "coconut-based sauces", "lime-chili sauce", "herb sauces"],
            dAiryFree: ["nước chấm", "soy-based dipping sauce", "garlic-lime sauce", "ginger sauce", "chili oil"]
        },
        byRegion: {
            northern: ["simple nước chấm", "mắm tôm", "dipping vinegar", "garlic fish sauce", "scallion oil"],
            central: ["spicy nước chấm", "mắm ruốc huế", "sa tế", "fermented fish", "lime-chili dips"],
            southern: ["sweet nước chấm", "tamarind sauce", "coconut sauces", "caramel sauce", "hoisin sauce"],
            mekong: ["fermented mudfish sauce", "sweet fish sauce", "pineapple fish sauce", "spicy nước mắm", "mắm nêm"]
        }
    },
    cookingTechniques: [
        {
            name: "Kho (Clay Pot Braising)",
            description: "Slow caramelization and braising in a clay pot with fish sauce and caramel",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["clay pot", "wooden spoon", "caramel sauce", "long cooking time"],
            bestFor: ["fish", "pork", "chicken", "tofu", "eggs"]
        },
        {
            name: "Nướng (Grilling)",
            description: "Aromatic grilling over charcoal, often with lemongrass marinades",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["charcoal grill", "bamboo skewers", "banana leaf wrapping", "marinade brush"],
            bestFor: ["pork", "beef", "seafood", "chicken", "meatballs"]
        },
        {
            name: "Xào (Stir-frying)",
            description: "Quick high-heat cooking that preserves fresh flavors and textures",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["wok", "high heat source", "spatula", "prep bowls"],
            bestFor: ["vegetables", "rice noodles", "quick meat dishes", "tofu", "morning glory"]
        },
        {
            name: "Hấp (Steaming)",
            description: "Gentle cooking that preserves natural flavors and nutritional content",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["steamer basket", "banana leaves", "parchment paper", "pot"],
            bestFor: ["fish", "rice cakes", "dumplings", "custards", "fresh vegetables"]
        },
        {
            name: "Cuốn (Rolling/Wrapping)",
            description: "Creating fresh rolls with rice paper or lettuce, emphasizing contrast and freshness",
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            toolsRequired: ["rice paper", "bowl of warm water", "clean work surface", "sharp knife"],
            bestFor: ["spring rolls", "summer rolls", "lettuce wraps", "beef in betel leaf", "rice noodle rolls"]
        }
    ],
    regionalCuisines: [
        {
            name: "Northern Vietnamese",
            description: "More subtle and delicate flavors with Chinese influence and less spice and sugar",
            signatureDishes: ["Phở Hà Nội", "Bún Chả", "Chả Cá Lã Vọng", "Bánh Cuốn", "Xôi"],
            keyIngredients: ["fresh herbs", "black pepper", "freshwater fish", "nước mắm", "fermented shrimp paste"],
            cookingTechniques: ["stir-frying", "grilling", "steaming", "slow simmering"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Chinese", "French colonial", "indigenous Vietnamese"],
            philosophicalFoundations: "Balance and subtlety, with respect for traditional methods and pure flavors"
        },
        {
            name: "Central Vietnamese",
            description: "Bold, spicy flavors influenced by royal cuisine with elaborate presentation",
            signatureDishes: ["Bún Bò Huế", "Bánh Xèo", "Mì Quảng", "Bánh Bèo", "Cơm Hến"],
            keyIngredients: ["lemongrass", "chilies", "shrimp paste", "turmeric", "rice crackers", "fermented fish"],
            cookingTechniques: ["slow cooking", "fermentation", "intricate cutting", "spice preparation"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Royal Vietnamese court", "Thai", "Cham"],
            philosophicalFoundations: "Complex and sophisticated flavors that honor the royal culinary traditions"
        },
        {
            name: "Southern Vietnamese",
            description: "Sweet, vibrant flavors with abundant fresh herbs and tropical ingredients",
            signatureDishes: ["Hủ Tiếu Nam Vang", "Cơm Tấm", "Canh Chua", "Bánh Xèo", "Lẩu"],
            keyIngredients: ["coconut milk", "sugarcane", "tropical fruits", "abundant herbs", "river fish", "tamarind"],
            cookingTechniques: ["simmering", "caramelizing", "quick stir-frying", "fresh preparations"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Khmer", "Chinese", "Thai", "French colonial"],
            philosophicalFoundations: "Embraces abundance and fusion while maintaining the essential Vietnamese balance"
        },
        {
            name: "Mekong Delta",
            description: "Emphasizes freshwater fish, tropical fruits, and rice with Khmer influences",
            signatureDishes: ["Cá Kho Tộ", "Canh Chua Cá", "Bánh Tét", "Mắm (fermented fish dishes)", "Lẩu Mắm"],
            keyIngredients: ["freshwater fish", "elephant ear fish", "rice", "tamarind", "water coconut", "fermented fish"],
            cookingTechniques: ["clay pot cooking", "fermentation", "caramelization", "stewing"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Khmer", "indigenous Vietnamese", "Chinese"],
            philosophicalFoundations: "Connection to river life and the bounty of the delta, with emphasis on preservation techniques"
        },
        {
            name: "Highland Vietnamese",
            description: "Rustic, earthy cuisine utilizing mountain ingredients and ethnic minority traditions",
            signatureDishes: ["Thịt Nướng Cây Rừng", "Cơm Lam", "Gà Nướng", "Thịt Heo Gác Bếp", "Rau Rừng Xào"],
            keyIngredients: ["mountain herbs", "wild vegetables", "bamboo", "game meats", "forest mushrooms"],
            cookingTechniques: ["smoking", "open fire cooking", "bamboo tube cooking", "preserving"],
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            },
            culturalInfluences: ["Ethnic minorities (Ê Đê, H'Mông, Thái)", "Indigenous practices"],
            philosophicalFoundations: "Deep connection to mountain landscapes and ethnic culinary heritage"
        }
    ],
    elementalProperties: { Fire: 0.00, Water: 1.00, Earth: 0.00, Air: 0.00 }
};

export default vietnamese;
