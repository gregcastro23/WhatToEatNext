import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawDairy = {
  greek_yogurt: {
    name: "Greek Yogurt",
    description:
      "Strained yogurt with higher protein content and thick texture.",
    category: "dairy",
    qualities: ["tangy", "creamy", "thick", "protein-rich", "versatile"],
    sustainabilityScore: 6,
    season: ["fall"],
    regionalOrigins: ["mediterranean", "middle_east"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.6,
      Earth: 0.2,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      zodiacInfluence: ["cancer", "taurus"],
      celestialAspects: {
        moonPhase: {
          waxing: "creamier texture, milder flavor",
          full: "peak tanginess and thickness",
          waning: "more digestible, gentler on system",
        },
      },
    },
    lunarPhaseModifiers: {
      "New Moon": {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1,
        },
        preparationTips: [
          "Best for starting new fermentation batches",
          "Ideal for milder yogurt",
        ],
      },
      "Full Moon": {
        elementalBoost: {
          Water: 0.2,
        },
        preparationTips: [
          "Maximum tangy flavor development",
          "Best probiotic activity",
        ],
      },
    },
    nutritionalProfile: {
      serving_size_oz: 6,
      calories: 100,
      protein_g: 17,
      fat_g: 0.7,
      carbs_g: 6.2,
      vitamins: ["Vitamin B12", "Riboflavin", "Vitamin B6"],
      minerals: ["Calcium", "Phosphorus", "Zinc", "Selenium", "Potassium"],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    healthBenefits: {
      "gut health":
        "Contains beneficial probiotics that support digestive health",
      "protein source": "High-quality complete protein for muscle maintenance",
      "bone strength": "Rich calcium content supports skeletal structure",
      satiety: "High protein content increases feeling of fullness",
      "blood sugar": "Lower glycemic impact than regular yogurt",
    },
    varieties: {
      "non-fat": {
        texture: "Less creamy, slightly more tangy",
        moisture: "Lower",
        protein: "Highest",
        uses: "Weight management, higher protein needs",
        notes: "Can be slightly grainy in texture",
      },
      "2% fat": {
        texture: "Balanced creaminess and tang",
        moisture: "Medium",
        protein: "High",
        uses: "All-purpose, good balance of flavor and nutrition",
        notes: "Most versatile variety",
      },
      "full-fat": {
        texture: "Creamiest, smoothest",
        moisture: "Medium-high",
        protein: "Moderate",
        uses: "Rich applications, cooking stability",
        notes: "Best for cooking as less likely to separate",
      },
      strained: {
        texture: "Extra thick, almost cheese-like",
        moisture: "Low",
        protein: "Very high",
        uses: "Labneh-style spreads, ultra-rich applications",
        notes: "Can be hung in cheesecloth for even thicker result",
      },
    },
    culinaryApplications: {
      raw: {
        notes: ["Base for breakfast bowls", "Topping for savory dishes"],
        techniques: ["Top with honey and nuts", "Layer with granola and fruit"],
        dishes: ["Breakfast parfaits", "Fruit bowls", "Topped soups"],
      },
      mix: {
        notes: ["Base for dips and sauces", "Used in marinades"],
        techniques: [
          "Blend with herbs and garlic",
          "Whisk until smooth before incorporating",
        ],
        dishes: [
          "Tzatziki",
          "Creamy herb dips",
          "Protein smoothies",
          "Marinades for chicken",
        ],
      },
      bake: {
        notes: [
          "Adds moisture to baked goods",
          "Can replace sour cream or oil",
        ],
        techniques: [
          "Bring to room temperature before baking",
          "Use in place of buttermilk (thicker result)",
        ],
        dishes: ["Muffins", "Quick breads", "Pancakes", "Cakes"],
      },
      cook: {
        notes: [
          "Use higher fat content for cooking stability",
          "Add at end of cooking or will separate",
        ],
        techniques: [
          "Temper with hot ingredients to prevent curdling",
          "Stabilize with cornstarch for high heat",
        ],
        dishes: ["Creamy sauces", "Stroganoff", "Indian curry finisher"],
      },
    },
    preparation: {
      homemade: {
        ingredients: ["Whole milk", "Live cultures", "Time"],
        process:
          "Heat milk, cool slightly, add culture, incubate, strain through cheesecloth",
        tips: [
          "Longer straining creates thicker yogurt",
          "Save whey for other applications",
        ],
      },
      storebought: {
        selection: "Choose without added thickeners for purest flavor",
        preparation: "Stir before using if separation has occurred",
      },
    },
    storage: {
      container: "Glass or original container",
      duration: "1-2 weeks refrigerated",
      temperature: {
        fahrenheit: 38,
        celsius: 3.3,
      },
      notes: "May continue to increase in tanginess over time",
    },
    culturalSignificance: {
      middle_eastern: {
        role: "Traditional breakfast component and sauce base",
        pairings: "Olive oil, za'atar, honey, nuts",
        dishes: "Labneh, breakfast spreads",
      },
      "modern health": {
        role: "Protein-rich alternative to higher-fat dairy",
        adaptations: "Protein bowls, smoothies, healthier baking",
      },
    },
    affinities: {
      sweet: [
        "honey",
        "maple syrup",
        "berries",
        "stone fruits",
        "granola",
        "nuts",
      ],
      savory: ["cucumber", "mint", "dill", "garlic", "olive oil", "lemon"],
    },
    pairings: [
      "honey",
      "berries",
      "nuts",
      "cucumber",
      "garlic",
      "dill",
      "mint",
      "olive oil",
    ],
    substitutions: ["labneh", "skyr", "cottage_cheese", "thick_coconut_yogurt"],
    idealSeasonings: {
      sweet: ["vanilla", "cinnamon", "cardamom", "honey", "maple"],
      savory: [
        "dill",
        "mint",
        "za'atar",
        "sumac",
        "black pepper",
        "lemon zest",
      ],
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: {"complementary":["salt","acid","fat"],"contrasting":["sweetness","heat"],"toAvoid":[]}
},
  cottage_cheese: {
    name: "Cottage Cheese",
    description:
      "Fresh cheese curd product with mild flavor and varying textures.",
    category: "dairy",
    qualities: ["mild", "soft", "fresh", "protein-rich", "versatile"],
    sustainabilityScore: 5,
    season: ["fall"],
    regionalOrigins: ["europe", "north_america"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      zodiacInfluence: ["taurus", "cancer"],
      celestialAspects: {
        moonPhase: {
          waxing: "enhanced moisture and softness",
          full: "optimal curd formation and flavor",
          waning: "drier texture, easier digestion",
        },
      },
    },
    lunarPhaseModifiers: {
      "New Moon": {
        elementalBoost: {
          Water: 0.15,
          Earth: 0.05,
        },
        preparationTips: [
          "Best for starting fresh batches",
          "More delicate curds form",
        ],
      },
      "Full Moon": {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1,
        },
        preparationTips: ["Optimal curd formation", "Best flavor development"],
      },
    },
    nutritionalProfile: {
      serving_size_oz: 4,
      calories: 110,
      protein_g: 12,
      fat_g: 5,
      carbs_g: 3,
      vitamins: ["Vitamin B12", "Riboflavin", "Vitamin A"],
      minerals: ["Calcium", "Phosphorus", "Selenium", "Sodium"],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    healthBenefits: {
      "muscle support":
        "Rich source of casein protein for slow-release amino acids",
      "bone health": "Excellent calcium source for skeletal maintenance",
      satiety: "High protein and moderate fat content increases fullness",
      metabolism:
        "Contains conjugated linoleic acid (CLA) in full-fat versions",
      recovery: "Popular among athletes for post-workout recovery",
    },
    varieties: {
      "small curd": {
        texture: "Smaller, more uniform pieces",
        moisture: "Medium",
        protein: "Standard",
        uses: "Baking, dips, smoother applications",
        notes: "More versatile for recipes requiring uniform texture",
      },
      "large curd": {
        texture: "Larger, more defined pieces",
        moisture: "Medium",
        protein: "Standard",
        uses: "Direct eating, where texture is desirable",
        notes: "Traditional style, more 'rustic' appearance",
      },
      "dry curd": {
        texture: "Low moisture, distinctly separate curds",
        moisture: "Low",
        protein: "High",
        uses: "Baking, lactose-sensitive diets",
        notes: "Lowest lactose content, least smooth",
      },
      whipped: {
        texture: "Smoother, more blended consistency",
        moisture: "Medium-high",
        protein: "Standard",
        uses: "Spreads, dips, smoother applications",
        notes: "Easier to incorporate into recipes",
      },
    },
    culinaryApplications: {
      raw: {
        notes: ["Eaten plain or with fruits", "Base for protein-rich snacks"],
        techniques: [
          "Drizzle with honey or fruit",
          "Top with cracked black pepper and herbs",
        ],
        dishes: [
          "Cottage cheese bowls",
          "Stuffed avocados",
          "Protein snack plates",
        ],
      },
      mix: {
        notes: [
          "Added to salads",
          "Used in dips",
          "Blended for smoother applications",
        ],
        techniques: [
          "Fold gently to maintain texture",
          "Pulse in food processor for smoother consistency",
        ],
        dishes: [
          "Vegetable dips",
          "Protein-enriched sauces",
          "Waldorf salad variation",
        ],
      },
      bake: {
        notes: [
          "Filling for crepes",
          "Added to casseroles and lasagna",
          "Moisture-adding ingredient",
        ],
        techniques: [
          "Drain excess moisture for baking",
          "Mix with eggs for structure",
        ],
        dishes: [
          "Cottage cheese pancakes",
          "Cheesecake",
          "Lasagna filling",
          "Protein bread",
        ],
      },
      blend: {
        notes: [
          "Can be blended smooth for variety of uses",
          "Adds creaminess without heavy fat",
        ],
        techniques: [
          "Blend until completely smooth",
          "Mix with other ingredients for desired consistency",
        ],
        dishes: [
          "Protein smoothies",
          "Creamy dressings",
          "Healthier 'cream' sauces",
        ],
      },
    },
    preparation: {
      homemade: {
        ingredients: ["Whole milk", "Acid (vinegar or lemon juice)", "Salt"],
        process: "Heat milk, add acid, allow curds to form, drain and rinse",
        tips: [
          "Rinse curds thoroughly to control saltiness",
          "Save whey for baking applications",
        ],
      },
      storebought: {
        selection: "Check date codes, avoid excessive liquid",
        preparation: "Drain excess liquid if desired",
      },
    },
    storage: {
      container: "Original container or airtight glass",
      duration: "5-7 days refrigerated",
      temperature: {
        fahrenheit: 38,
        celsius: 3.3,
      },
      notes:
        "Texture and flavor best when fresh, tends to sour rather than spoil",
    },
    culturalSignificance: {
      european: {
        role: "Traditional fresh cheese in many cuisines",
        pairings: "Fresh herbs, black pepper, fruit preserves",
        dishes: "Blintzes, pierogi filling, breakfast dishes",
      },
      american: {
        role: "Diet food popularized in mid-20th century",
        pairings: "Canned fruit, gelatin salads, crackers",
        dishes: "1950s 'diet plates', retro salads",
      },
      "modern health": {
        role: "Rediscovered as high-protein, whole food",
        adaptations:
          "Protein bowls, savory applications, healthy baking ingredient",
      },
    },
    affinities: {
      sweet: ["peaches", "pineapple", "berries", "honey", "cinnamon", "nutmeg"],
      savory: [
        "tomatoes",
        "cucumbers",
        "bell peppers",
        "herbs",
        "olive oil",
        "black pepper",
      ],
    },
    pairings: [
      "peaches",
      "pineapple",
      "tomatoes",
      "herbs",
      "pepper",
      "everything bagel seasoning",
    ],
    substitutions: ["ricotta", "greek_yogurt", "quark", "fromage blanc"],
    idealSeasonings: {
      sweet: ["cinnamon", "vanilla", "nutmeg", "maple", "honey"],
      savory: [
        "chives",
        "black pepper",
        "dill",
        "garlic powder",
        "everything bagel seasoning",
      ],
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: {"complementary":["salt","acid","fat"],"contrasting":["sweetness","heat"],"toAvoid":[]}
},
  ricotta: {
    name: "Ricotta",
    description:
      "Soft, mild Italian whey cheese with small, fluffy curds and versatile applications.",
    category: "dairy",
    qualities: ["mild", "creamy", "sweet", "delicate", "versatile"],
    sustainabilityScore: 6,
    season: ["fall"],
    regionalOrigins: ["italy", "mediterranean"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      zodiacInfluence: ["cancer", "taurus"],
      celestialAspects: {
        moonPhase: {
          waxing: "increased moisture and softness",
          full: "optimal texture and sweetness",
          waning: "slightly drier, more complex flavor",
        },
      },
    },
    lunarPhaseModifiers: {
      "New Moon": {
        elementalBoost: {
          Water: 0.2,
        },
        preparationTips: [
          "Best for beginning cheese making",
          "Creates most delicate texture",
        ],
      },
      "Full Moon": {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1,
        },
        preparationTips: [
          "Best flavor development",
          "Optimal milk protein composition",
        ],
      },
    },
    nutritionalProfile: {
      serving_size_oz: 4,
      calories: 164,
      protein_g: 11,
      fat_g: 12,
      carbs_g: 4,
      vitamins: ["Vitamin A", "Vitamin B12", "Riboflavin"],
      minerals: ["Calcium", "Phosphorus", "Selenium", "Zinc"],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    healthBenefits: {
      "protein source": "Complete protein with all essential amino acids",
      "bone health": "High calcium content supports skeletal strength",
      digestibility: "Easier to digest than aged cheeses",
      "muscle recovery": "Provides branched-chain amino acids",
      satiety: "Balance of protein and fat increases fullness",
    },
    varieties: {
      "whole milk": {
        texture: "Richest, creamiest",
        moisture: "High",
        fat: "High",
        uses: "Desserts, traditional dishes, eating plain",
        notes: "Traditional and most flavorful variety",
      },
      "part-skim": {
        texture: "Slightly less creamy, more distinct curds",
        moisture: "Medium-high",
        fat: "Medium",
        uses: "All-purpose, balanced nutrition and flavor",
        notes: "Most commonly available commercial variety",
      },
      "sheep milk": {
        texture: "Rich, distinctive",
        moisture: "Medium",
        fat: "High",
        uses: "Specialty applications, authentic Italian dishes",
        notes: "Traditional ricotta type with more complex flavor",
      },
      "buffalo milk": {
        texture: "Very rich, creamy",
        moisture: "High",
        fat: "Very high",
        uses: "Premium applications, special dishes",
        notes: "Luxury variant, most often in southern Italy",
      },
    },
    culinaryApplications: {
      raw: {
        notes: ["Served with honey or fruit", "Spread on bread or toast"],
        techniques: [
          "Drizzle with good olive oil and sea salt",
          "Top with fresh herbs and pepper",
        ],
        dishes: ["Crostini", "Bruschetta", "Fresh fruit accompaniment"],
      },
      mix: {
        notes: ["Mixed into pasta dishes", "Combined with herbs for fillings"],
        techniques: [
          "Room temperature incorporation",
          "Gently fold to maintain texture",
        ],
        dishes: ["Pasta alla Norma", "Dips", "Herb spreads"],
      },
      bake: {
        notes: [
          "Classic ingredient in lasagna",
          "Italian desserts",
          "Cheesecake",
        ],
        techniques: [
          "Drain excess moisture for some applications",
          "Mix with egg for structure in baking",
        ],
        dishes: ["Lasagna", "Cannoli filling", "Cassata", "Cheesecake"],
      },
      stuff: {
        notes: [
          "Traditional filling for pasta and pastries",
          "Holds shape when baked",
        ],
        techniques: [
          "Mix with eggs for stability",
          "Combine with other cheeses for depth",
        ],
        dishes: ["Ravioli", "Manicotti", "Stuffed shells", "Calzone"],
      },
    },
    preparation: {
      homemade: {
        ingredients: [
          "Whole milk",
          "Heavy cream (optional)",
          "Acid (vinegar, lemon juiceor buttermilk)",
        ],
        process: "Heat milk, add acid, let curds form, drain in cheesecloth",
        tips: [
          "Higher fat content creates creamier cheese",
          "Save whey for bread making or soup",
        ],
      },
      storebought: {
        selection:
          "Choose from refrigerated section, avoid shelf-stable varieties for best flavor",
        preparation:
          "Drain excess liquid before using in recipes requiring firmer texture",
      },
    },
    storage: {
      container: "Original container or airtight glass",
      duration: "5-7 days refrigerated",
      temperature: {
        fahrenheit: 38,
        celsius: 3.3,
      },
      notes: "Best used fresh, texture deteriorates over time",
    },
    culturalSignificance: {
      sicilian: {
        role: "Key ingredient in traditional desserts",
        pairings: "Chocolate, pistachios, candied fruit, cinnamon",
        dishes: "Cassata, cannoli, Sicilian cheesecake",
      },
      modern: {
        role: "Versatile low-sodium cheese in contemporary cooking",
        adaptations:
          "Protein-rich breakfast component, sandwich spread, dip base",
      },
    },
    affinities: {
      sweet: [
        "honey",
        "figs",
        "berries",
        "chocolate",
        "citrus zest",
        "vanilla",
      ],
      savory: ["tomatoes", "spinach", "basil", "garlic", "olive oil", "lemon"],
    },
    pairings: [
      "honey",
      "olive_oil",
      "herbs",
      "lemon_zest",
      "tomato_sauce",
      "spinach",
      "pasta",
    ],
    substitutions: ["cottage_cheese", "cream_cheese", "mascarpone", "quark"],
    idealSeasonings: {
      sweet: ["vanilla", "cinnamon", "orange zest", "honey", "pistachios"],
      savory: [
        "basil",
        "black pepper",
        "lemon zest",
        "red pepper flakes",
        "parsley",
      ],
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: {"complementary":["salt","acid","fat"],"contrasting":["sweetness","heat"],"toAvoid":[]}
},
  cream_cheese: {
    name: "Cream Cheese",
    description:
      "Soft, spreadable fresh cheese with mild flavor and smooth texture.",
    category: "dairy",
    qualities: ["creamy", "tangy", "smooth", "spreadable", "rich"],
    sustainabilityScore: 4,
    season: ["fall"],
    regionalOrigins: ["united_states", "europe"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.4,
      Earth: 0.4,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      zodiacInfluence: ["taurus", "cancer", "libra"],
      celestialAspects: {
        moonPhase: {
          waxing: "creamier texture, milder flavor",
          full: "perfect balance of richness and tang",
          waning: "more pronounced tanginess",
        },
      },
    },
    lunarPhaseModifiers: {
      "New Moon": {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1,
        },
        preparationTips: [
          "Best for starting fresh batches",
          "Creates milder flavor profile",
        ],
      },
      "Full Moon": {
        elementalBoost: {
          Earth: 0.2,
        },
        preparationTips: [
          "Optimal richness and texture",
          "Best structure for baking",
        ],
      },
    },
    nutritionalProfile: {
      serving_size_oz: 2,
      calories: 200,
      protein_g: 4,
      fat_g: 20,
      carbs_g: 2,
      vitamins: ["Vitamin A", "Vitamin B12", "Riboflavin"],
      minerals: ["Calcium", "Phosphorus", "Selenium"],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    healthBenefits: {
      "energy dense": "Provides concentrated calories from fat",
      "fat-soluble vitamins": "Contains vitamins A and D",
      "calcium source": "Contributes to daily calcium needs",
      satiety: "High fat content increases feeling of fullness",
    },
    varieties: {
      "full-fat": {
        texture: "Richest, creamiest",
        moisture: "Medium-high",
        fat: "High (33%+)",
        uses: "Cheesecake, frostings, traditional applications",
        notes: "Best flavor and baking performance",
      },
      "reduced-fat": {
        texture: "Slightly less creamy, softer",
        moisture: "High",
        fat: "Medium",
        uses: "Everyday spreading, lighter applications",
        notes: "Common supermarket variety",
      },
      whipped: {
        texture: "Lighter, fluffier",
        moisture: "Medium",
        fat: "Medium-high",
        uses: "Spreading, dipping, when lighter texture desired",
        notes: "Incorporates air, easier to spread cold",
      },
      cultured: {
        texture: "Traditional, more complex",
        moisture: "Medium",
        fat: "High",
        uses: "Gourmet applications, artisanal preparations",
        notes: "More traditional method with complex flavor",
      },
    },
    culinaryApplications: {
      spread: {
        notes: ["Classic bagel topping", "Base for sandwiches and wraps"],
        techniques: [
          "Allow to soften before spreading",
          "Layer thinly for best flavor",
        ],
        dishes: ["Bagels and lox", "Tea sandwiches", "Canapés"],
      },
      mix: {
        notes: [
          "Base for dips and spreads",
          "Mix with herbs or honey for flavored spread",
        ],
        techniques: [
          "Room temperature for easiest mixing",
          "Use paddle attachment not whisk",
        ],
        dishes: ["Veggie dip", "Herb spread", "Flavored compound spreads"],
      },
      bake: {
        notes: [
          "Essential for cheesecake",
          "Structure-adding ingredient for desserts",
        ],
        techniques: [
          "Room temperature for baking",
          "Beat until smooth but don't overbeat",
        ],
        dishes: ["Cheesecake", "Danishes", "Puffs", "Sweet rolls"],
      },
      cook: {
        notes: [
          "Creates creamy sauces",
          "Thickens without flour or cornstarch",
        ],
        techniques: ["Add at end of cooking", "Low heat to prevent separation"],
        dishes: ["Creamy pasta sauces", "Mashed potatoes", "Creamed spinach"],
      },
    },
    preparation: {
      homemade: {
        ingredients: [
          "Whole milk",
          "Heavy cream",
          "Acid (lemon juice or vinegar)",
          "Salt",
        ],
        process: "Heat dairy, add acid, strain, then blend until smooth",
        tips: [
          "Longer straining creates firmer texture",
          "Adding culture develops more complex flavor",
        ],
      },
      storebought: {
        selection: "Choose block style for baking, whipped for spreading",
        preparation: "Bring to room temperature before using in recipes",
      },
    },
    storage: {
      container: "Original foil wrapper or airtight container",
      duration: "2 weeks refrigerated unopened, 1 week once opened",
      temperature: {
        fahrenheit: 38,
        celsius: 3.3,
      },
      notes: "Can be frozen for up to 2 months but texture may change",
    },
    culturalSignificance: {
      american: {
        role: "Iconic breakfast spread popularized in New York",
        pairings: "Bagels, lox, capers, red onion, tomato",
        dishes: "Cheesecake, cream cheese frosting, dips",
      },
      european: {
        role: "Traditional fresh cheese in many regional varieties",
        pairings: "Herbs, fruits, honey, nuts",
        dishes: "Pastries, tarts, savory spreads",
      },
      modern: {
        role: "Versatile ingredient in contemporary cooking and baking",
        adaptations:
          "Vegan alternatives, flavored varieties, as cooking ingredient",
      },
    },
    affinities: {
      sweet: [
        "berries",
        "honey",
        "vanilla",
        "chocolate",
        "cinnamon",
        "caramel",
      ],
      savory: [
        "chives",
        "garlic",
        "dill",
        "smoked salmon",
        "cucumber",
        "olive",
      ],
    },
    pairings: [
      "bagel",
      "berries",
      "honey",
      "smoked_salmon",
      "herbs",
      "cucumber",
      "walnuts",
    ],
    substitutions: [
      "mascarpone",
      "ricotta",
      "neufchatel",
      "quark",
      "greek_yogurt",
    ],
    idealSeasonings: {
      sweet: ["vanilla", "cinnamon", "orange zest", "honey", "maple"],
      savory: [
        "chives",
        "dill",
        "garlic powder",
        "everything bagel seasoning",
        "black pepper",
      ],
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: {"complementary":["salt","acid","fat"],"contrasting":["sweetness","heat"],"toAvoid":[]}
},
  milk: {
    name: "Milk",
    description:
      "Liquid secreted by mammary glands of cows (most commonly *Bos taurus*), providing protein (whey, casein), fat, calcium, and lactose. Pasteurized and homogenized for retail, or left raw for traditional cheeses. Whole milk is ~3.25% fat; 2%, 1%, and skim progressively reduce fat. The foundation of nearly every cheese, butter, yogurt, and cream. Grass-fed milks carry a deeper flavor and higher omega-3/CLA content than commodity milks.",
    category: "dairy",
    subCategory: "milk",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },
    quantityBase: { amount: 240, unit: "ml" },
    scaledElemental: { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.6, Matter: 0.45, Substance: 0.5 },
    kineticsImpact: { thermalDirection: -0.1, forceMagnitude: 0.6 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["cancer", "taurus", "pisces"],
      elementalAffinity: { base: "Water", secondary: "Earth" },
    },
    qualities: ["calcium-rich", "creamy", "versatile", "nourishing", "cooling"],
    varieties: {
      whole: { name: "Whole Milk (3.25%)", characteristics: "Full-fat, rich mouthfeel.", uses: "Coffee, baking, roux, béchamel." },
      two_percent: { name: "2% / Reduced Fat", characteristics: "Lighter mouthfeel, still carries fat-soluble flavor.", uses: "Everyday drinking, cereal." },
      skim: { name: "Skim / Non-fat", characteristics: "Fat removed; watery body.", uses: "Low-fat cooking; not ideal for baking." },
      grass_fed: { name: "Grass-Fed", characteristics: "Deeper yellow color, richer flavor, higher omega-3 / CLA.", uses: "Premium pouring, culturing, fresh cheese." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["creamy", "slightly sweet"], secondary: ["grassy"], notes: "Sensitive to scorching — watch the bottom of the pan." },
      cookingMethods: ["heat", "scald", "ferment", "foam", "culture"],
      cuisineAffinity: ["French", "Italian", "American", "Indian"],
      preparationTips: ["Scald (heat to just-steaming) before adding to yeast or custards.", "Don't boil milk-based sauces — they break and grain."],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml) whole milk",
      calories: 149,
      macros: { protein: 7.7, carbs: 12, fat: 8, fiber: 0, saturatedFat: 4.6, sugar: 12, potassium: 322, sodium: 105, cholesterol: 24 },
      vitamins: { A: 0.15, B12: 0.54, B2: 0.35, D: 0.29 },
      minerals: { calcium: 0.28, phosphorus: 0.22, potassium: 0.09 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["coffee", "tea", "chocolate", "vanilla", "cereal", "honey", "fruit", "spices (cardamom, nutmeg)"],
      contrasting: ["citrus (curdles)", "strong vinegar"],
      toAvoid: ["lemon juice in unheated milk"],
    },
    storage: {
      container: "Original carton in fridge",
      duration: "5–7 days past printed date refrigerated; 3 months frozen",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Freeze in original carton with some headspace for expansion.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  buttermilk: {
    name: "Buttermilk",
    description:
      "Tangy cultured dairy product made by fermenting low-fat milk with *Lactococcus* and related cultures (modern commercial buttermilk) or the liquid left after churning butter (traditional). Thick, creamy, pleasantly sour. Essential for tender biscuits, pancakes, fried chicken marinades, ranch dressing, and soda bread — its acidity activates baking soda for lift and tenderizes gluten.",
    category: "dairy",
    subCategory: "cultured_milk",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },
    quantityBase: { amount: 240, unit: "ml" },
    scaledElemental: { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.55, Matter: 0.4, Substance: 0.45 },
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 0.55 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "virgo"],
      elementalAffinity: { base: "Water", secondary: "Earth" },
    },
    qualities: ["tangy", "creamy", "tenderizing", "activating", "cultured"],
    culinaryProfile: {
      flavorProfile: { primary: ["tangy", "creamy", "slightly sweet"], secondary: ["cultured", "mineral"], notes: "Acidity is its culinary superpower." },
      cookingMethods: ["bake", "marinate", "whip", "mix into batter"],
      cuisineAffinity: ["American Southern", "Irish", "Indian (chaas)"],
      preparationTips: [
        "Substitute: 1 cup milk + 1 Tbsp lemon juice or vinegar, let stand 10 min.",
        "Brilliant marinade for fried chicken — tenderizes and flavors overnight.",
      ],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml)",
      calories: 98,
      macros: { protein: 8.1, carbs: 11.7, fat: 2.2, fiber: 0, saturatedFat: 1.3, sugar: 11.7, potassium: 370, sodium: 257, cholesterol: 10 },
      vitamins: { B12: 0.4, B2: 0.27, D: 0.1 },
      minerals: { calcium: 0.28, phosphorus: 0.22 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["flour", "baking soda", "honey", "cornmeal", "fried chicken", "ranch herbs"],
      contrasting: ["fresh mint", "cucumber"],
      toAvoid: ["extremely rich sauces where acidity fights the dish"],
    },
    storage: {
      container: "Original carton or airtight jar",
      duration: "2 weeks refrigerated",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Freezes well — pour into ice-cube trays for recipe-sized portions.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  butter: {
    name: "Butter",
    description:
      "Rich, yellow-gold dairy fat produced by churning cream until the fat globules separate from the buttermilk. Typically 80–85% fat, with water and milk solids making up the rest. The foundation of French cooking — melts, browns, emulsifies, enriches, glazes, and flakes pastry. European butters (82%+ fat) deliver richer flavor and flakier results; cultured butters add tang and complexity. Grass-fed butter (Kerrygold, Vermont Creamery) carries deeper yellow color and more complex dairy notes.",
    category: "dairy",
    subCategory: "butter",
    regionalOrigins: ["europe", "north_america"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    quantityBase: { amount: 14, unit: "g" },
    scaledElemental: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.6, Matter: 0.7, Substance: 0.65 },
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.75 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Earth", secondary: "Water" },
    },
    qualities: ["rich", "creamy", "fatty", "versatile", "browning", "flavor-carrying"],
    varieties: {
      salted: { name: "Salted Butter", characteristics: "1.5–2% salt; lasts longer, better for table and toast.", uses: "Finishing, sauces where you'd also add salt, spreading." },
      unsalted: { name: "Unsalted Butter", characteristics: "Clean dairy flavor; control over salt in recipes.", uses: "Baking, pastry, sauces where precision matters." },
      european: { name: "European-Style (82%+ fat)", characteristics: "Higher butterfat, richer, flakier when laminated.", uses: "Croissants, laminated pastry, brown butter." },
      cultured: { name: "Cultured Butter", characteristics: "Cream fermented before churning; tangy, complex.", uses: "Toast, beurre blanc, finishing steak." },
      clarified: { name: "Clarified Butter / Ghee", characteristics: "Milk solids and water removed; pure butterfat.", uses: "High-heat sautéing, Indian cuisine, drawn butter." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["creamy", "rich", "buttery"], secondary: ["nutty when browned", "tangy when cultured"], notes: "Flavor intensifies dramatically when browned to beurre noisette." },
      cookingMethods: ["melt", "brown", "emulsify", "laminate", "finish"],
      cuisineAffinity: ["French", "Italian", "American", "Indian (ghee)"],
      preparationTips: [
        "Brown butter: cook over medium until milk solids turn hazelnut-colored; use immediately or cool.",
        "Compound butters (herb, garlic, miso) freeze well for flavor-bomb finishers.",
        "For flaky pastry, keep butter ice-cold; for emulsion sauces, keep just barely soft.",
      ],
    },
    nutritionalProfile: {
      serving_size: "1 Tbsp (14g)",
      calories: 102,
      macros: { protein: 0.1, carbs: 0, fat: 11.5, fiber: 0, saturatedFat: 7.3, sugar: 0, potassium: 3, sodium: 91, cholesterol: 31 },
      vitamins: { A: 0.11, D: 0.07, E: 0.02 },
      minerals: { selenium: 0.01 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["bread", "pasta", "potatoes", "seafood", "herbs", "garlic", "shallots", "wine (for beurre blanc)", "sage"],
      contrasting: ["lemon", "capers", "black pepper"],
      toAvoid: ["strong vinegars during emulsion (break the sauce)"],
    },
    storage: {
      container: "Butter dish or original wrap",
      duration: "1 month refrigerated; 6–9 months frozen",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Room temperature butter is safe 1–2 days in a covered dish; refrigerate in hot kitchens.",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.1, sour: 0, bitter: 0, umami: 0.1, spicy: 0, rich: 0.9 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  goat_cheese: {
    name: "Goat Cheese",
    description:
      "Cheese made from goat's milk (*Capra aegagrus hircus*) with a distinctive tangy, earthy, slightly barnyard flavor and creamy, crumbly-to-spreadable texture. Fresh chèvre is young, bright, and spreadable; aged crottins develop bold pungency and mold rinds. Lower in lactose than cow's milk cheese. A Mediterranean and French staple — the star of warm goat-cheese salad, Greek feta (technically sheep/goat blend), and countless cheeseboards.",
    category: "dairy",
    subCategory: "cheese",
    regionalOrigins: ["france", "mediterranean", "north_america"],
    sustainabilityScore: 7,
    season: ["spring", "summer", "fall"],
    seasonality: ["spring", "summer", "fall"],
    elementalProperties: { Fire: 0.2, Water: 0.35, Earth: 0.35, Air: 0.1 },
    quantityBase: { amount: 28, unit: "g" },
    scaledElemental: { Fire: 0.2, Water: 0.35, Earth: 0.35, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.35, Essence: 0.55, Matter: 0.5, Substance: 0.55 },
    kineticsImpact: { thermalDirection: 0, forceMagnitude: 0.7 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mercury"],
      favorableZodiac: ["taurus", "virgo"],
      elementalAffinity: { base: "Earth", secondary: "Fire" },
    },
    qualities: ["tangy", "earthy", "creamy", "complex", "crumbly"],
    varieties: {
      fresh_chevre: { name: "Fresh Chèvre", characteristics: "Young, spreadable, mild tang.", uses: "Salads, tartines, stuffed dates." },
      crottin: { name: "Crottin de Chavignol", characteristics: "Small aged cheese with bloomy rind.", uses: "Warm goat-cheese salad, cheeseboard." },
      bucheron: { name: "Bûcheron", characteristics: "Semi-aged log with creamy layer just under rind.", uses: "Cheeseboard centerpiece, melted on toast." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["tangy", "earthy", "creamy"], secondary: ["herbal", "faintly goaty"], notes: "Fresh varieties are mild; aged varieties develop pronounced complexity." },
      cookingMethods: ["spread", "crumble", "melt", "bake (breaded warm goat cheese)"],
      cuisineAffinity: ["French", "Mediterranean", "Californian farm-to-table"],
      preparationTips: ["Bring to room temperature for best texture.", "Pair with honey, figs, walnuts, or roasted beets."],
    },
    nutritionalProfile: {
      serving_size: "1 oz (28g)",
      calories: 75,
      macros: { protein: 5.2, carbs: 0.3, fat: 6, fiber: 0, saturatedFat: 4.1, sugar: 0.3, potassium: 14, sodium: 104, cholesterol: 13 },
      vitamins: { A: 0.07, B2: 0.1 },
      minerals: { calcium: 0.04, phosphorus: 0.07 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["honey", "figs", "walnuts", "beets", "herbs", "mild greens", "crusty bread", "sauvignon blanc"],
      contrasting: ["bitter greens", "black pepper", "balsamic reduction"],
      toAvoid: ["overly aggressive red wines"],
    },
    storage: {
      container: "Waxed paper or cheese paper",
      duration: "1–2 weeks refrigerated (fresh); 4 weeks aged",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Fresh chèvre freezes acceptably but loses texture; aged varieties do not freeze well.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  cheddar_cheese: {
    name: "Cheddar Cheese",
    description:
      "Hard cow's-milk cheese originally from the village of Cheddar, Somerset, England. Made via the distinctive 'cheddaring' process: curds are stacked, pressed, and turned repeatedly to expel whey. Flavor develops from mild and buttery (young, 2–3 months) through sharp and crystalline (aged 18+ months). Aged farmhouse cheddars (Cabot Clothbound, Montgomery's, Keen's) are among the world's great cheeses. Essential for grilled cheese, macaroni and cheese, Welsh rarebit, and classic cheeseboards.",
    category: "dairy",
    subCategory: "cheese",
    regionalOrigins: ["england", "north_america", "ireland"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
    quantityBase: { amount: 28, unit: "g" },
    scaledElemental: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.55, Matter: 0.7, Substance: 0.65 },
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.85 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["taurus", "capricorn"],
      elementalAffinity: { base: "Earth", secondary: "Fire" },
    },
    qualities: ["sharp", "firm", "aging", "melting", "crystalline"],
    varieties: {
      mild: { name: "Mild Cheddar (2–3 months)", characteristics: "Buttery, soft, pale yellow.", uses: "Sandwiches, kids' menus." },
      sharp: { name: "Sharp Cheddar (9–12 months)", characteristics: "Bold, tangy, firmer.", uses: "Mac and cheese, grilled cheese." },
      extra_sharp: { name: "Extra Sharp / Aged (18+ months)", characteristics: "Intense, crystalline, complex.", uses: "Cheeseboards, shaving onto soups." },
      clothbound: { name: "Clothbound Farmhouse", characteristics: "Traditional cloth-wrapped aging yields earthy, nutty depth.", uses: "Showcase cheeseboard, pairing with stout or cider." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["sharp", "tangy", "savory"], secondary: ["nutty (aged)", "buttery (young)"], notes: "Flavor deepens dramatically with age." },
      cookingMethods: ["shred and melt", "grate", "slice", "grill"],
      cuisineAffinity: ["British", "American", "Irish"],
      preparationTips: ["Grate cold for even melting.", "Pre-shredded cheese contains anti-caking agents that prevent smooth melts — grate from block when possible."],
    },
    nutritionalProfile: {
      serving_size: "1 oz (28g)",
      calories: 115,
      macros: { protein: 7.1, carbs: 0.9, fat: 9.4, fiber: 0, saturatedFat: 6, sugar: 0.1, potassium: 22, sodium: 184, cholesterol: 30 },
      vitamins: { A: 0.1, B12: 0.14 },
      minerals: { calcium: 0.2, phosphorus: 0.15, zinc: 0.08 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["apples", "bread", "mustard", "chutney", "beer", "cider", "stout", "macaroni", "tomato"],
      contrasting: ["pickles", "tart jams", "whiskey"],
      toAvoid: ["overly delicate whites"],
    },
    storage: {
      container: "Cheese paper or wax-paper then loose plastic",
      duration: "2–3 weeks refrigerated (young); 1–2 months aged",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Surface mold on aged cheddar can be cut off; cheese underneath is fine.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  blue_cheese: {
    name: "Blue Cheese",
    description:
      "Family of cheeses veined with blue or blue-green *Penicillium roqueforti* or *P. glaucum* mold, which develops during aging and contributes the distinctive sharp, salty, pungent flavor. The three classics: French Roquefort (sheep's milk, cave-aged in Aveyron), Italian Gorgonzola (cow's milk, from Piedmont/Lombardy), and English Stilton (cow's milk, PDO-protected). Creamy to crumbly texture. Essential on cheeseboards, in wedge salads, and melted into sauces for steak or pasta.",
    category: "dairy",
    subCategory: "cheese",
    regionalOrigins: ["france", "italy", "england", "denmark"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.35, Water: 0.25, Earth: 0.3, Air: 0.1 },
    quantityBase: { amount: 28, unit: "g" },
    scaledElemental: { Fire: 0.35, Water: 0.25, Earth: 0.3, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.45, Essence: 0.5, Matter: 0.55, Substance: 0.6 },
    kineticsImpact: { thermalDirection: 0.12, forceMagnitude: 0.9 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Pluto"],
      favorableZodiac: ["scorpio", "capricorn"],
      elementalAffinity: { base: "Earth", secondary: "Fire" },
    },
    qualities: ["pungent", "sharp", "salty", "intense", "funky"],
    varieties: {
      roquefort: { name: "Roquefort (AOP)", characteristics: "Sheep's milk; strong, salty, crumbly; cave-aged.", uses: "Salads, roquefort butter, after-dinner with port." },
      gorgonzola_dolce: { name: "Gorgonzola Dolce", characteristics: "Young, sweet, creamy.", uses: "Melted on steaks, pear salads, pasta cream." },
      stilton: { name: "Stilton (PDO)", characteristics: "Crumbly, complex, traditionally British Christmas cheese.", uses: "Cheeseboard with port, soups, dressings." },
      gorgonzola_piccante: { name: "Gorgonzola Piccante", characteristics: "Aged, firmer, sharper.", uses: "Shaving over polenta, intensely flavored sauces." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["pungent", "salty", "sharp"], secondary: ["creamy", "funky", "tangy"], notes: "Flavor intensity scales with age and visible mold veining." },
      cookingMethods: ["crumble", "melt", "whisk into dressing", "blend into butter"],
      cuisineAffinity: ["French", "Italian", "British"],
      preparationTips: ["Wrap tightly so odor doesn't transfer to other foods.", "Bring to room temperature for fullest flavor."],
    },
    nutritionalProfile: {
      serving_size: "1 oz (28g)",
      calories: 100,
      macros: { protein: 6.1, carbs: 0.7, fat: 8.2, fiber: 0, saturatedFat: 5.3, sugar: 0.5, potassium: 73, sodium: 326, cholesterol: 21 },
      vitamins: { A: 0.1, B12: 0.2, B2: 0.1 },
      minerals: { calcium: 0.15, phosphorus: 0.11 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["pears", "walnuts", "honey", "port", "figs", "steak", "spinach", "radicchio"],
      contrasting: ["sauternes", "stout", "dark chocolate", "bacon"],
      toAvoid: ["very delicate white wines"],
    },
    storage: {
      container: "Wax paper then airtight container",
      duration: "2–3 weeks refrigerated",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Pronounced smell is normal. Discard if ammoniated or if white mold appears on cut face.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  heavy_cream: {
    name: "Heavy Cream",
    description:
      "Cow's milk cream with at least 36% butterfat — rich enough to whip to stable peaks and beat into butter. Essential for whipped cream, pastry cream, ganache, Alfredo sauce, and any preparation requiring the creamy body that milk alone can't deliver. Higher-fat cream is more stable under heat (less prone to breaking) than lower-fat half-and-half. Pasture-raised versions carry deeper flavor and color.",
    category: "dairy",
    subCategory: "cream",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.15, Water: 0.4, Earth: 0.4, Air: 0.05 },
    quantityBase: { amount: 60, unit: "ml" },
    scaledElemental: { Fire: 0.15, Water: 0.4, Earth: 0.4, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.7, Matter: 0.65, Substance: 0.6 },
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.75 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Earth", secondary: "Water" },
    },
    qualities: ["rich", "creamy", "whippable", "luxurious", "stable-under-heat"],
    varieties: {
      whipping: { name: "Heavy Whipping Cream (36%+)", characteristics: "Whips to stable peaks; resists breaking.", uses: "Whipped cream, pastry cream, ganache." },
      manufacturing: { name: "Manufacturing / Heavy Cream (40%)", characteristics: "Professional-grade, richer; sometimes available retail.", uses: "Ice cream bases, reductions." },
      light: { name: "Light Cream (20–30%)", characteristics: "Pours richer than half-and-half; doesn't whip.", uses: "Coffee, soups, light pasta sauces." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["rich", "creamy", "sweet"], secondary: ["buttery"], notes: "Doesn't assert itself flavor-wise — carries whatever it accompanies." },
      cookingMethods: ["whip", "reduce", "infuse", "fold"],
      cuisineAffinity: ["French", "Italian", "American"],
      preparationTips: ["Chill bowl and beaters for fastest, firmest whipping.", "Add sugar after soft peaks form.", "Reduce by half for intense velvety pan sauces."],
    },
    nutritionalProfile: {
      serving_size: "2 Tbsp (30ml)",
      calories: 103,
      macros: { protein: 0.9, carbs: 0.8, fat: 11, fiber: 0, saturatedFat: 7, sugar: 0.8, potassium: 23, sodium: 11, cholesterol: 41 },
      vitamins: { A: 0.12 },
      minerals: { calcium: 0.02 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["vanilla", "chocolate", "berries", "coffee", "garlic", "parmesan", "pasta", "mushrooms"],
      contrasting: ["lemon zest", "espresso", "cardamom", "black pepper"],
      toAvoid: ["raw acidic juice in cold cream (curdles)"],
    },
    storage: {
      container: "Original carton",
      duration: "2–3 weeks refrigerated past printed date; 2 months frozen (whipped form)",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Cream that smells off or has clumps should be discarded.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  sour_cream: {
    name: "Sour Cream",
    description:
      "Cultured cream (typically 18–20% fat) fermented with lactic-acid bacteria to a thick, tangy, spoonable consistency. A staple of American, Eastern European, and Mexican cooking. Dollops beautifully on baked potatoes, borscht, chili, and enchiladas; works as the base for sour-cream coffee cake; stabilizes mashed potatoes and adds tender moisture to quick breads. A close cousin of crème fraîche, which is richer (30%+ fat) and gentler-tangy.",
    category: "dairy",
    subCategory: "cultured_cream",
    regionalOrigins: ["eastern_europe", "north_america", "mexico"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.15, Water: 0.45, Earth: 0.35, Air: 0.05 },
    quantityBase: { amount: 30, unit: "g" },
    scaledElemental: { Fire: 0.15, Water: 0.45, Earth: 0.35, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.6, Matter: 0.55, Substance: 0.55 },
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 0.65 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Water", secondary: "Earth" },
    },
    qualities: ["tangy", "creamy", "thick", "cooling", "dolloping"],
    varieties: {
      regular: { name: "Regular (18–20% fat)", characteristics: "Standard thick, tangy.", uses: "Baked potatoes, dips, baking." },
      reduced_fat: { name: "Reduced Fat / Low Fat", characteristics: "Thinner; may break if boiled.", uses: "Everyday use; not ideal for heated applications." },
      mexican_crema: { name: "Mexican Crema", characteristics: "Thinner, pourable, mildly tangy.", uses: "Drizzled over tacos, enchiladas, elotes." },
      creme_fraiche: { name: "Crème Fraîche (30%+ fat)", characteristics: "Richer, milder tang; heat-stable.", uses: "Finishing sauces, topping galettes." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["tangy", "creamy"], secondary: ["buttery"], notes: "Balances fatty dishes beautifully." },
      cookingMethods: ["dollop", "fold into batter", "temper into sauces", "whisk into dressing"],
      cuisineAffinity: ["American", "Eastern European", "Mexican", "Russian"],
      preparationTips: ["Temper slowly into hot liquids to avoid curdling.", "Regular sour cream can break over 180°F — stabilize with a little flour, or use crème fraîche."],
    },
    nutritionalProfile: {
      serving_size: "2 Tbsp (30g)",
      calories: 59,
      macros: { protein: 0.7, carbs: 1.3, fat: 5.8, fiber: 0, saturatedFat: 3.6, sugar: 1.3, potassium: 39, sodium: 15, cholesterol: 20 },
      vitamins: { A: 0.06, B2: 0.05 },
      minerals: { calcium: 0.03 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["baked potato", "chives", "dill", "borscht", "tacos", "enchiladas", "cucumber", "beets"],
      contrasting: ["chipotle", "hot sauce", "horseradish"],
      toAvoid: ["boiling directly into thin sauces — breaks"],
    },
    storage: {
      container: "Original tub",
      duration: "2–3 weeks refrigerated past printed date",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Yellow surface liquid (whey) is normal; stir back in or drain.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  cold_butter: {
    name: "Cold Butter",
    description:
      "Butter straight from the fridge at 34–40°F (1–4°C), firm and pliable enough to cut into flour without melting. Essential state for flaky pastry (pie dough, biscuits, scones) and laminated dough (croissants, puff) — tiny pieces of cold butter melt in the oven, releasing steam that creates distinct, separated layers. The rule is simple: cold butter = flaky; warm butter = dense.",
    category: "dairy",
    subCategory: "butter",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.05, Water: 0.35, Earth: 0.55, Air: 0.05 },
    quantityBase: { amount: 14, unit: "g" },
    scaledElemental: { Fire: 0.05, Water: 0.35, Earth: 0.55, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.15, Essence: 0.55, Matter: 0.75, Substance: 0.7 },
    kineticsImpact: { thermalDirection: -0.15, forceMagnitude: 0.7 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Saturn"],
      favorableZodiac: ["taurus", "capricorn"],
      elementalAffinity: { base: "Earth", secondary: "Water" },
    },
    qualities: ["firm", "flaky-producing", "pastry-ready", "cuttable"],
    culinaryProfile: {
      flavorProfile: { primary: ["creamy", "rich"], secondary: [], notes: "Same flavor as butter — this is a state, not a variety." },
      cookingMethods: ["cut into flour", "grate frozen for biscuits", "laminate into dough"],
      cuisineAffinity: ["French pastry", "American baking"],
      preparationTips: [
        "Cube butter then freeze 10 min before making pie dough.",
        "Grate frozen butter on a box grater for the easiest scone and biscuit dough.",
        "Stop cutting when pieces are pea-sized — any smaller and you lose flake.",
      ],
    },
    storage: {
      container: "Original wrap in fridge",
      duration: "1 month refrigerated; 6 months frozen",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Measure then return immediately to fridge — a few minutes on the counter undoes the purpose.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      nutritionalProfile: { serving_size: "3 oz", calories: 180, macros: { protein: 22, carbs: 0, fat: 10, fiber: 0, saturatedFat: 3 }, vitamins: { B12: 0.4, B6: 0.3, niacin: 0.3 }, minerals: { iron: 0.15, zinc: 0.3, selenium: 0.4 }, source: "category default" },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] }
},
  parmesan: {
    name: "Parmesan (Parmigiano-Reggiano)",
    description:
      "Italian hard, granular cheese — PDO-protected when from Parma, Reggio Emilia, Modena, Bologna, or Mantua. Aged 12–36+ months from raw cow's milk, developing crunchy calcium-lactate crystals and an unmistakable deeply savory, nutty, fruity flavor. The 'King of Cheeses' — shaved over pasta, risotto, salads, and soups; the essential umami boost. Rinds add incredible depth to stocks and minestrone. American-made 'Parmesan' is not the same thing; look for the pin-dot rind mark of genuine Parmigiano-Reggiano.",
    category: "dairy",
    subCategory: "cheese",
    regionalOrigins: ["italy"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.3, Water: 0.15, Earth: 0.45, Air: 0.1 },
    quantityBase: { amount: 28, unit: "g" },
    scaledElemental: { Fire: 0.3, Water: 0.15, Earth: 0.45, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.4, Essence: 0.55, Matter: 0.75, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.9 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Jupiter"],
      favorableZodiac: ["capricorn", "virgo"],
      elementalAffinity: { base: "Earth", secondary: "Fire" },
    },
    qualities: ["nutty", "umami", "crystalline", "aged", "complex"],
    varieties: {
      young: { name: "Young (12–18 months)", characteristics: "Milder, softer, pale yellow.", uses: "Everyday grating, table cheese." },
      aged: { name: "Aged / Stravecchio (24+ months)", characteristics: "Crunchy crystals, pronounced nuttiness.", uses: "Shaving over pasta, eating on its own with balsamic." },
      grana_padano: { name: "Grana Padano", characteristics: "Similar style, less strictly regulated, often more affordable.", uses: "Daily grating." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["nutty", "umami", "salty"], secondary: ["fruity", "pineappley"], notes: "Aged-over-24-month cheeses develop pineapple-like esters." },
      cookingMethods: ["grate", "shave", "simmer rinds in stock"],
      cuisineAffinity: ["Italian"],
      preparationTips: ["Grate fresh — pre-grated cheese loses flavor fast.", "Save rinds in the freezer for stocks and minestrone.", "Microplane for fluffy, melting-ready shreds."],
    },
    nutritionalProfile: {
      serving_size: "1 oz (28g)",
      calories: 111,
      macros: { protein: 10, carbs: 0.9, fat: 7.3, fiber: 0, saturatedFat: 4.7, sugar: 0.2, potassium: 26, sodium: 395, cholesterol: 22 },
      vitamins: { A: 0.08, B12: 0.5 },
      minerals: { calcium: 0.33, phosphorus: 0.2 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["pasta", "risotto", "balsamic", "prosciutto", "pears", "walnuts", "basil", "tomato"],
      contrasting: ["aged balsamic", "honey", "lambrusco"],
      toAvoid: ["overly delicate white fish"],
    },
    storage: {
      container: "Cheese paper, then loose plastic",
      duration: "1–2 months refrigerated; rind can freeze for 6+ months",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Dry crust that forms on cut face can be grated off and used in stocks.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  chocolate_ice_cream: {
    name: "Chocolate Ice Cream",
    description:
      "Frozen dairy dessert built on a custard or Philadelphia-style base flavored with cocoa and/or melted chocolate. Premium versions use heavy cream, egg yolks, sugar, and high-percentage dark chocolate; lower-tier versions use more air (overrun) and stabilizers. French/custard styles are richer and denser; American/Philadelphia styles are cleaner and more chocolate-forward. A beloved flavor worldwide.",
    category: "dairy",
    subCategory: "frozen_dairy",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["summer"],
    seasonality: ["summer", "spring", "fall"],
    elementalProperties: { Fire: 0.1, Water: 0.35, Earth: 0.5, Air: 0.05 },
    quantityBase: { amount: 66, unit: "g" },
    scaledElemental: { Fire: 0.1, Water: 0.35, Earth: 0.5, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.65, Matter: 0.6, Substance: 0.55 },
    kineticsImpact: { thermalDirection: -0.25, forceMagnitude: 0.55 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Earth", secondary: "Water" },
    },
    qualities: ["cold", "sweet", "creamy", "indulgent", "cocoa-rich"],
    culinaryProfile: {
      flavorProfile: { primary: ["chocolate", "sweet", "creamy"], secondary: ["bitter (dark varieties)", "milky"], notes: "Use tempered storage for scoopable texture — rock-hard ice cream lacks flavor release." },
      cookingMethods: ["scoop", "soften briefly", "blend into shakes"],
      cuisineAffinity: ["American", "Italian (gelato)", "French"],
      preparationTips: ["Transfer from freezer 5 min before serving for ideal scoopability.", "Avoid refreezing melted ice cream — texture degrades and food-safety risk rises."],
    },
    nutritionalProfile: {
      serving_size: "1/2 cup (66g)",
      calories: 143,
      macros: { protein: 2.5, carbs: 18.6, fat: 7.3, fiber: 0.8, saturatedFat: 4.5, sugar: 17, potassium: 164, sodium: 50, cholesterol: 22 },
      vitamins: { A: 0.05 },
      minerals: { calcium: 0.07 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["raspberries", "cherries", "espresso", "bourbon", "caramel", "peanut butter", "banana"],
      contrasting: ["chili flakes", "sea salt", "mint"],
      toAvoid: ["citrus that curdles the cream"],
    },
    storage: {
      container: "Sealed tub, plastic pressed to surface",
      duration: "2 months frozen for best quality",
      temperature: { fahrenheit: 0, celsius: -18 },
      notes: "Ice crystals and freezer burn indicate temperature fluctuations or opened-too-long storage.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  evaporated_milk: {
    name: "Evaporated Milk",
    description:
      "Shelf-stable cow's milk with ~60% of its water removed through gentle simmering under vacuum, then canned and sterilized. Concentrates protein, fat, and calcium; develops a subtle caramelized, slightly cooked flavor. Not the same as sweetened condensed milk (which has added sugar). Classic ingredient in Latin American tres leches, pumpkin pie, creamy mac and cheese, and fudge. Reconstitute 1:1 with water for regular-strength milk in a pinch.",
    category: "dairy",
    subCategory: "concentrated_milk",
    regionalOrigins: ["global"],
    sustainabilityScore: 6,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.35, Air: 0.05 },
    quantityBase: { amount: 60, unit: "ml" },
    scaledElemental: { Fire: 0.2, Water: 0.4, Earth: 0.35, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.65, Matter: 0.6, Substance: 0.55 },
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.7 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["cancer", "taurus"],
      elementalAffinity: { base: "Water", secondary: "Earth" },
    },
    qualities: ["concentrated", "shelf-stable", "caramelized", "creamy", "protein-rich"],
    culinaryProfile: {
      flavorProfile: { primary: ["rich", "faintly caramelized"], secondary: ["cooked-milk notes"], notes: "Distinct from fresh milk — subtle caramel character." },
      cookingMethods: ["whisk into custards", "pour over casseroles", "stir into pumpkin pie", "use in tres leches"],
      cuisineAffinity: ["Latin American", "American Southern", "British Caribbean"],
      preparationTips: ["Chilled evaporated milk can whip (not as stable as heavy cream).", "1 can + 1 can water = ~2 cups regular-strength milk."],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup (60ml)",
      calories: 85,
      macros: { protein: 4.3, carbs: 6.3, fat: 4.8, fiber: 0, saturatedFat: 2.9, sugar: 6.3, potassium: 193, sodium: 67, cholesterol: 18 },
      vitamins: { A: 0.06, B12: 0.3, D: 0.25 },
      minerals: { calcium: 0.2, phosphorus: 0.16 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["pumpkin", "vanilla", "cinnamon", "coconut", "caramel", "sponge cake", "pasta bake"],
      contrasting: ["chili powder", "coffee", "lime"],
      toAvoid: ["raw acidic juices before heating"],
    },
    storage: {
      container: "Sealed can pantry; opened in airtight container in fridge",
      duration: "1+ year unopened; 5 days refrigerated opened",
      temperature: { fahrenheit: 68, celsius: 20 },
      notes: "Pour into ice-cube trays and freeze for recipe-sized portions.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  butter_croissant: {
    name: "Butter Croissant",
    description:
      "Classic French laminated viennoiserie: yeasted dough layered with cold butter through a series of folds (tourage) that creates 27+ distinct layers of dough and butter. Baked until shatteringly crisp outside, tender and honey-combed inside. A true butter croissant uses only butter — margarine versions lack the flavor and snap. Considered here as a dairy preparation because butter is structurally foundational. Best eaten within hours of baking.",
    category: "bakery",
    subCategory: "laminated_pastry",
    regionalOrigins: ["france"],
    sustainabilityScore: 4,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    quantityBase: { amount: 67, unit: "g" },
    scaledElemental: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.45, Matter: 0.65, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.15, forceMagnitude: 0.65 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Earth", secondary: "Air" },
    },
    qualities: ["flaky", "buttery", "crisp-outside", "tender-inside", "aromatic"],
    culinaryProfile: {
      flavorProfile: { primary: ["buttery", "yeasted", "toasty"], secondary: ["caramelized", "slightly sweet"], notes: "Fresh-from-the-oven aromatics are a league of their own." },
      cookingMethods: ["warm gently in oven before serving", "split and fill (ham & cheese, almond)"],
      cuisineAffinity: ["French", "global bakery"],
      preparationTips: ["Refresh day-old croissants in a 325°F oven for 5 min to restore crispness.", "The telltale sign of quality: visible layers on the cut face and a pronounced honeycomb interior."],
    },
    nutritionalProfile: {
      serving_size: "1 medium (67g)",
      calories: 272,
      macros: { protein: 5.5, carbs: 31, fat: 14, fiber: 1.7, saturatedFat: 8, sugar: 6.4, potassium: 79, sodium: 312, cholesterol: 38 },
      vitamins: { A: 0.08 },
      minerals: { iron: 0.12, calcium: 0.04 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["butter", "jam", "coffee", "ham", "gruyère", "almond cream", "chocolate"],
      contrasting: ["savory fillings", "fruit compote"],
      toAvoid: ["very wet fillings that soggy the pastry"],
    },
    storage: {
      container: "Paper bag at room temperature",
      duration: "1 day at room temperature; 2 months frozen unbaked or baked",
      temperature: { fahrenheit: 68, celsius: 20 },
      notes: "Do not refrigerate — drying accelerates. Freeze for longer storage.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  french_butter: {
    name: "French Butter",
    description:
      "European-style butter (82%+ butterfat by French law) often cultured before churning for a tangy, complex flavor. The gold standard for pastry (flakier croissants, more tender pie crust) and sauces. Beurre de Charentes-Poitou, Échiré, and Isigny Sainte-Mère are the most celebrated. Noticeably more expensive than American butter (80% fat), and noticeably better for cooking where butter is the star.",
    category: "dairy",
    subCategory: "butter",
    regionalOrigins: ["france"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.2, Water: 0.25, Earth: 0.5, Air: 0.05 },
    quantityBase: { amount: 14, unit: "g" },
    scaledElemental: { Fire: 0.2, Water: 0.25, Earth: 0.5, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.25, Essence: 0.65, Matter: 0.75, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.78 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Earth", secondary: "Water" },
    },
    qualities: ["premium", "high-fat", "cultured", "complex", "flaky-producing"],
    culinaryProfile: {
      flavorProfile: { primary: ["rich", "cultured", "complex"], secondary: ["slightly tangy", "nutty when browned"], notes: "Cultured versions have noticeable lactic tang; uncultured versions are cleaner." },
      cookingMethods: ["finish sauces", "laminate pastry", "spread on bread", "emulsify beurre blanc"],
      cuisineAffinity: ["French", "fine pastry"],
      preparationTips: ["Use for laminated doughs (croissant, pain au chocolat) — higher fat = flakier layers.", "Worth the splurge for finishing a simple steak or roasted vegetables."],
    },
    nutritionalProfile: {
      serving_size: "1 Tbsp (14g)",
      calories: 107,
      macros: { protein: 0.1, carbs: 0, fat: 12, fiber: 0, saturatedFat: 7.7, sugar: 0, potassium: 3, sodium: 5, cholesterol: 32 },
      vitamins: { A: 0.12, D: 0.08, E: 0.03 },
      minerals: {},
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["crusty bread", "radishes", "sea salt", "steak", "seafood", "pastry"],
      contrasting: ["black pepper", "truffle", "fleur de sel"],
      toAvoid: ["drowning it in strong flavors"],
    },
    storage: {
      container: "Original foil wrap",
      duration: "1 month refrigerated; 9 months frozen",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Keep tightly wrapped — butter absorbs fridge odors quickly.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  whole_milk: {
    name: "Whole Milk",
    description:
      "Cow's milk with approximately 3.25% butterfat — the full, unmodified fat content. Richer mouthfeel and better at carrying fat-soluble flavors than reduced-fat milks. Essential in baking (tender crumb), coffee drinks (stable microfoam), béchamel, and custards. Grass-fed whole milk has deeper color and higher omega-3/CLA content. Raw (unpasteurized) whole milk, where legal, has the fullest flavor but carries food-safety considerations.",
    category: "dairy",
    subCategory: "milk",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    quantityBase: { amount: 240, unit: "ml" },
    scaledElemental: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.65, Matter: 0.5, Substance: 0.55 },
    kineticsImpact: { thermalDirection: -0.08, forceMagnitude: 0.65 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["cancer", "taurus"],
      elementalAffinity: { base: "Water", secondary: "Earth" },
    },
    qualities: ["creamy", "full-fat", "versatile", "foaming", "tender-making"],
    culinaryProfile: {
      flavorProfile: { primary: ["creamy", "slightly sweet"], secondary: ["grassy (grass-fed)"], notes: "Richness carries flavor in a way skim milk simply can't." },
      cookingMethods: ["heat", "scald", "foam", "bake", "ferment"],
      cuisineAffinity: ["French", "Italian", "American baking", "Indian"],
      preparationTips: ["Essential for stretching pizza dough and brioche.", "Foams far more stably than skim for lattes."],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml)",
      calories: 149,
      macros: { protein: 7.7, carbs: 12, fat: 8, fiber: 0, saturatedFat: 4.6, sugar: 12, potassium: 322, sodium: 105, cholesterol: 24 },
      vitamins: { A: 0.15, B12: 0.54, B2: 0.35, D: 0.29 },
      minerals: { calcium: 0.28, phosphorus: 0.22 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["coffee", "cereal", "chocolate", "vanilla", "cardamom", "banana"],
      contrasting: ["citrus (curdles in raw form)", "vinegar"],
      toAvoid: ["heating with acid without stabilizer"],
    },
    storage: {
      container: "Original carton",
      duration: "5–7 days past printed date refrigerated",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Keep on a lower fridge shelf, not in the door, for consistent temperature.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  unsalted_butter: {
    name: "Unsalted Butter",
    description:
      "Butter churned without added salt — the baker's and pastry chef's standard, because it allows precise control over salt in the finished product. Typically 80% butterfat in the U.S., 82%+ in European versions. Also called 'sweet butter,' though it's not sweetened — the name refers to the absence of salt. Cleaner, purer dairy flavor than salted butter; spoils faster (salt is a preservative) so turn it over more often or freeze.",
    category: "dairy",
    subCategory: "butter",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.45, Air: 0.05 },
    quantityBase: { amount: 14, unit: "g" },
    scaledElemental: { Fire: 0.2, Water: 0.3, Earth: 0.45, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.6, Matter: 0.7, Substance: 0.65 },
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.75 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Earth", secondary: "Water" },
    },
    qualities: ["clean", "neutral", "pastry-grade", "precise", "fresh"],
    culinaryProfile: {
      flavorProfile: { primary: ["creamy", "clean", "rich"], secondary: ["nutty when browned"], notes: "Lets the cook control salt level independently." },
      cookingMethods: ["cream (baking)", "cut into pastry", "brown", "finish sauces"],
      cuisineAffinity: ["French pastry", "American baking", "global"],
      preparationTips: ["Always use unsalted for baking recipes that specify butter.", "Unsalted spoils faster — check for off smell before use."],
    },
    nutritionalProfile: {
      serving_size: "1 Tbsp (14g)",
      calories: 102,
      macros: { protein: 0.1, carbs: 0, fat: 11.5, fiber: 0, saturatedFat: 7.3, sugar: 0, potassium: 3, sodium: 2, cholesterol: 31 },
      vitamins: { A: 0.11, D: 0.07 },
      minerals: {},
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["flour", "sugar", "eggs", "vanilla", "chocolate", "herbs", "seafood"],
      contrasting: ["sea salt (added separately)", "acid"],
      toAvoid: ["substituting salted butter in pastry without reducing added salt"],
    },
    storage: {
      container: "Original wrap in fridge or butter dish",
      duration: "3 weeks refrigerated; 6–9 months frozen",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Freezes beautifully — buy a case when on sale, freeze what you won't use in a month.",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0, sour: 0, bitter: 0, umami: 0.1, spicy: 0, rich: 0.9 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  clarified_butter: {
    name: "Clarified Butter / Ghee",
    description:
      "Butter melted and gently cooked to separate the golden butterfat from the water and milk solids; the pure fat is strained and used. Ghee (Indian-style) takes this further by simmering until the milk solids brown, imparting a nutty, caramelized flavor. Without milk solids to burn, clarified butter tolerates much higher heat than regular butter (up to ~485°F/250°C). Essential for Indian cooking, Middle Eastern sweets, drawn butter for seafood, and any high-heat sauté requiring butter flavor.",
    category: "dairy",
    subCategory: "butter",
    regionalOrigins: ["india", "middle_east", "france"],
    sustainabilityScore: 6,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.45, Air: 0.05 },
    quantityBase: { amount: 14, unit: "g" },
    scaledElemental: { Fire: 0.4, Water: 0.1, Earth: 0.45, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.35, Essence: 0.55, Matter: 0.8, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.25, forceMagnitude: 0.85 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["leo", "sagittarius"],
      elementalAffinity: { base: "Fire", secondary: "Earth" },
    },
    qualities: ["high-smoke-point", "nutty", "shelf-stable", "pure-fat", "healing (Ayurveda)"],
    varieties: {
      clarified: { name: "French-Style Clarified", characteristics: "Pale gold, milk solids skimmed while still white.", uses: "Seafood drawn butter, French sauces." },
      ghee: { name: "Ghee (Indian)", characteristics: "Deep gold, nutty-caramelized flavor from browned solids.", uses: "Indian cooking, spice tempering, Ayurvedic preparations." },
      brown_ghee: { name: "Cultured Ghee", characteristics: "Made from cultured butter; richer, tangier.", uses: "Premium applications, Ayurvedic medicine." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["nutty", "rich", "buttery"], secondary: ["caramelized (ghee)", "clean (clarified)"], notes: "Flavor deepens with degree of browning." },
      cookingMethods: ["high-heat sauté", "temper spices", "deep-fry in small batches", "brush on bread"],
      cuisineAffinity: ["Indian", "Middle Eastern", "French"],
      preparationTips: [
        "Make your own: melt 1 lb butter, simmer 20 min, strain through cheesecloth.",
        "Keeps at room temperature 2–3 months in a dark jar — unlike fresh butter, no refrigeration required.",
        "Temper whole spices (cumin, mustard, curry leaves) in hot ghee for classic Indian tadka.",
      ],
    },
    nutritionalProfile: {
      serving_size: "1 Tbsp (14g)",
      calories: 112,
      macros: { protein: 0, carbs: 0, fat: 12.7, fiber: 0, saturatedFat: 7.9, sugar: 0, potassium: 0, sodium: 0, cholesterol: 33 },
      vitamins: { A: 0.12, E: 0.03 },
      minerals: {},
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["cumin", "mustard seed", "curry leaves", "rice", "dal", "seafood", "flatbreads"],
      contrasting: ["hing (asafoetida)", "fresh ginger", "garlic"],
      toAvoid: ["very delicate European cream sauces"],
    },
    storage: {
      container: "Airtight glass jar",
      duration: "3 months at room temperature; 1 year refrigerated",
      temperature: { fahrenheit: 68, celsius: 20 },
      notes: "No refrigeration needed — removing the milk solids removes what would spoil.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  gruy_re_cheese: {
    name: "Gruyère Cheese",
    description:
      "Hard Swiss cow's-milk cheese from the canton of Fribourg, aged 5–12 months. Dense, firm, nutty, slightly sweet with mushroom and caramel undertones in older wheels. The definitive melting cheese — essential for fondue, French onion soup gratinée, Croque Monsieur, and quiche Lorraine. Deep complexity makes it equally delicious straight from the cheeseboard. PDO-protected; true Gruyère AOP comes only from Switzerland, though similar 'Alpine-style' cheeses are made elsewhere.",
    category: "dairy",
    subCategory: "cheese",
    regionalOrigins: ["switzerland", "france"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.25, Water: 0.2, Earth: 0.45, Air: 0.1 },
    quantityBase: { amount: 28, unit: "g" },
    scaledElemental: { Fire: 0.25, Water: 0.2, Earth: 0.45, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.35, Essence: 0.55, Matter: 0.7, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.85 },
    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Venus"],
      favorableZodiac: ["sagittarius", "taurus"],
      elementalAffinity: { base: "Earth", secondary: "Fire" },
    },
    qualities: ["nutty", "smooth-melting", "complex", "aged", "firm"],
    varieties: {
      doux: { name: "Gruyère Doux (Mild, 5 months)", characteristics: "Creamy, buttery, mild nuttiness.", uses: "Everyday eating, quiche." },
      reserve: { name: "Gruyère Réserve (10+ months)", characteristics: "Crystalline, deeply savory.", uses: "Fondue, cheeseboard." },
      alpage: { name: "Alpage Gruyère (Summer Alpine)", characteristics: "Produced only from summer-pasture milk; complex herbal notes.", uses: "Premium fondue, cheeseboard showcase." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["nutty", "sweet-savory"], secondary: ["mushroomy", "caramelized"], notes: "The melt is its superpower — stretchy, glossy, never stringy." },
      cookingMethods: ["grate and melt", "shave for cheeseboard", "bake into gratins"],
      cuisineAffinity: ["Swiss", "French", "Savoyard"],
      preparationTips: ["Pair with kirsch for fondue.", "Grate fresh just before using for best flavor."],
    },
    nutritionalProfile: {
      serving_size: "1 oz (28g)",
      calories: 117,
      macros: { protein: 8.5, carbs: 0.4, fat: 9.2, fiber: 0, saturatedFat: 5.4, sugar: 0.1, potassium: 23, sodium: 95, cholesterol: 31 },
      vitamins: { A: 0.1, B12: 0.26 },
      minerals: { calcium: 0.29, phosphorus: 0.18 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["crusty bread", "white wine (Chasselas, Riesling)", "onion", "ham", "cornichons", "pears", "walnuts"],
      contrasting: ["dry cured sausage", "mustard", "grapes"],
      toAvoid: ["very assertive red wines"],
    },
    storage: {
      container: "Cheese paper, then loose plastic",
      duration: "3–4 weeks refrigerated",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Rewrap in fresh paper every few days to prevent drying.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  vanilla_ice_cream: {
    name: "Vanilla Ice Cream",
    description:
      "Frozen dairy dessert flavored with vanilla — bean, paste, or extract. The quintessential flavor, against which all others are measured. Premium versions use real Madagascar or Tahitian vanilla beans (visible specks), egg-yolk custard base, and minimal air (low overrun); budget versions lean on artificial vanillin, stabilizers, and high overrun. Pair with nearly any dessert — pie à la mode, affogato, banana split. Equally satisfying eaten straight from the pint.",
    category: "dairy",
    subCategory: "frozen_dairy",
    regionalOrigins: ["global"],
    sustainabilityScore: 5,
    season: ["summer"],
    seasonality: ["summer", "spring", "fall", "winter"],
    elementalProperties: { Fire: 0.05, Water: 0.4, Earth: 0.5, Air: 0.05 },
    quantityBase: { amount: 66, unit: "g" },
    scaledElemental: { Fire: 0.05, Water: 0.4, Earth: 0.5, Air: 0.05 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.65, Matter: 0.6, Substance: 0.55 },
    kineticsImpact: { thermalDirection: -0.25, forceMagnitude: 0.5 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: { base: "Earth", secondary: "Water" },
    },
    qualities: ["cold", "creamy", "sweet", "vanilla", "classic"],
    varieties: {
      french: { name: "French Vanilla (Custard Base)", characteristics: "Yellow-tinged; rich egg-yolk character.", uses: "Pie à la mode, dense scooping." },
      philadelphia: { name: "Philadelphia-Style (Eggless)", characteristics: "Cleaner vanilla flavor; slightly lighter.", uses: "Pairing with fruit desserts where vanilla should dominate." },
      vanilla_bean: { name: "Vanilla Bean", characteristics: "Visible vanilla specks; deeper, floral flavor.", uses: "Premium scooping, affogato." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["vanilla", "creamy", "sweet"], secondary: ["floral", "custard"], notes: "The right vanilla source transforms what could be bland into something complex." },
      cookingMethods: ["scoop", "soften briefly", "blend into shakes", "pour espresso over"],
      cuisineAffinity: ["American", "Italian (gelato)", "French"],
      preparationTips: ["Temper from freezer 5 min before serving.", "For affogato, pour one shot of hot espresso over a scoop."],
    },
    nutritionalProfile: {
      serving_size: "1/2 cup (66g)",
      calories: 137,
      macros: { protein: 2.3, carbs: 16, fat: 7.3, fiber: 0.5, saturatedFat: 4.5, sugar: 14, potassium: 131, sodium: 53, cholesterol: 29 },
      vitamins: { A: 0.06 },
      minerals: { calcium: 0.08 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["hot pie", "berries", "stone fruit", "espresso", "caramel", "chocolate sauce", "bourbon"],
      contrasting: ["balsamic-macerated strawberries", "olive oil and sea salt"],
      toAvoid: ["boiling hot sauces (melts too fast)"],
    },
    storage: {
      container: "Sealed tub, plastic pressed to surface",
      duration: "2 months frozen for best quality",
      temperature: { fahrenheit: 0, celsius: -18 },
      notes: "Homemade ice cream is best within 2 weeks; store-bought with stabilizers lasts longer.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  yogurt: {
    name: "Yogurt",
    description:
      "Cultured milk product made by fermenting milk with *Lactobacillus bulgaricus* and *Streptococcus thermophilus* at ~110°F (43°C) for several hours. Thick, tangy, probiotic-rich. Regular (non-Greek) yogurt is lighter and pourable; Greek yogurt is strained for thicker texture and higher protein; Icelandic skyr is even thicker. A staple from Greek tzatziki to Indian raita, Bulgarian ayran, and American parfaits. Live-culture yogurts support gut health.",
    category: "dairy",
    subCategory: "cultured_milk",
    regionalOrigins: ["middle_east", "mediterranean", "central_asia", "global"],
    sustainabilityScore: 6,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    quantityBase: { amount: 170, unit: "g" },
    scaledElemental: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.6, Matter: 0.45, Substance: 0.5 },
    kineticsImpact: { thermalDirection: -0.1, forceMagnitude: 0.6 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "virgo"],
      elementalAffinity: { base: "Water", secondary: "Earth" },
    },
    qualities: ["tangy", "creamy", "probiotic", "cooling", "versatile"],
    varieties: {
      regular: { name: "Regular Yogurt", characteristics: "Pourable to spoonable.", uses: "Drinking, smoothies, baking." },
      greek: { name: "Greek Yogurt", characteristics: "Strained; thick, high-protein.", uses: "Dips, substituting for sour cream." },
      icelandic: { name: "Skyr (Icelandic)", characteristics: "Even thicker than Greek; technically a cheese.", uses: "Breakfast, cold soups." },
      bulgarian: { name: "Bulgarian Yogurt", characteristics: "Tangier, more complex flavor.", uses: "Traditional ayran, sour applications." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["tangy", "creamy"], secondary: ["slightly sweet (full-fat)"], notes: "Tang varies dramatically by culture and fermentation time." },
      cookingMethods: ["spoon cold", "temper into hot dishes", "bake into quick breads", "marinate (Indian dishes)"],
      cuisineAffinity: ["Greek", "Turkish", "Indian", "Middle Eastern", "Bulgarian"],
      preparationTips: ["Temper into hot dishes to prevent curdling.", "Strain overnight in cheesecloth to make labneh."],
    },
    nutritionalProfile: {
      serving_size: "6 oz (170g) plain whole milk",
      calories: 104,
      macros: { protein: 6, carbs: 12, fat: 5.5, fiber: 0, saturatedFat: 3.5, sugar: 12, potassium: 255, sodium: 80, cholesterol: 22 },
      vitamins: { B12: 0.5, B2: 0.3 },
      minerals: { calcium: 0.2, phosphorus: 0.16 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["honey", "granola", "berries", "mint", "cucumber", "garlic", "dill", "curry"],
      contrasting: ["chili", "lime", "ginger", "tahini"],
      toAvoid: ["boiling directly without stabilizer"],
    },
    storage: {
      container: "Original tub",
      duration: "2–3 weeks refrigerated past printed date",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Clear liquid on top (whey) is normal; stir in or drain for thicker yogurt.",
    },
      sensoryProfile: { taste: { spicy: 0, sweet: 0.2, sour: 0.7, bitter: 0, salty: 0.1, umami: 0.3 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
  mozzarella: {
    name: "Mozzarella",
    description:
      "Fresh Italian pasta-filata cheese — curds are heated and stretched to create a smooth, elastic, moist white cheese with a delicate milky flavor. Traditional *mozzarella di bufala* is made from water buffalo milk; *fior di latte* is made from cow's milk. Fresh mozzarella is stored in brine or whey; drier aged varieties (low-moisture mozzarella) are the standard for pizza. Essential for Caprese salad, margherita pizza, and pasta al forno.",
    category: "dairy",
    subCategory: "cheese",
    regionalOrigins: ["italy"],
    sustainabilityScore: 5,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    quantityBase: { amount: 28, unit: "g" },
    scaledElemental: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.25, Essence: 0.6, Matter: 0.55, Substance: 0.55 },
    kineticsImpact: { thermalDirection: 0, forceMagnitude: 0.7 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["cancer", "taurus"],
      elementalAffinity: { base: "Water", secondary: "Earth" },
    },
    qualities: ["fresh", "milky", "stretchy", "mild", "melting"],
    varieties: {
      bufala: { name: "Mozzarella di Bufala (DOP)", characteristics: "Richer, tangier, higher fat; water-buffalo milk.", uses: "Caprese, top-tier pizza, fresh eating." },
      fior_di_latte: { name: "Fior di Latte", characteristics: "Cow's milk version of fresh mozzarella.", uses: "Pizza, Caprese, pasta." },
      low_moisture: { name: "Low-Moisture Mozzarella", characteristics: "Drier, saltier, longer-keeping; melts without weeping.", uses: "Pizza, lasagna, melted applications." },
      burrata: { name: "Burrata", characteristics: "Mozzarella shell filled with stracciatella (shredded curd + cream).", uses: "Showcase appetizer with bread, tomato, and oil." },
    },
    culinaryProfile: {
      flavorProfile: { primary: ["milky", "mild", "sweet-creamy"], secondary: ["tangy (bufala)", "briny (fresh)"], notes: "Fresh mozzarella is best at room temperature — cold mutes the flavor." },
      cookingMethods: ["slice fresh", "melt on pizza", "shred for lasagna", "pull apart for pizza Napoletana"],
      cuisineAffinity: ["Italian"],
      preparationTips: ["Drain fresh mozzarella 30 min before using on pizza to prevent a soggy crust.", "Tear rather than slice for rustic presentation."],
    },
    nutritionalProfile: {
      serving_size: "1 oz (28g)",
      calories: 85,
      macros: { protein: 6.3, carbs: 0.6, fat: 6.3, fiber: 0, saturatedFat: 3.7, sugar: 0.3, potassium: 19, sodium: 178, cholesterol: 22 },
      vitamins: { A: 0.06, B12: 0.11 },
      minerals: { calcium: 0.14, phosphorus: 0.1 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["tomato", "basil", "olive oil", "balsamic", "prosciutto", "pizza dough", "eggplant", "garlic"],
      contrasting: ["roasted peppers", "arugula", "lemon zest"],
      toAvoid: ["very acidic marinades (tightens texture)"],
    },
    storage: {
      container: "Fresh: in its brine in fridge; Low-moisture: original wrap",
      duration: "Fresh: 5–7 days; Low-moisture: 2–3 weeks refrigerated",
      temperature: { fahrenheit: 38, celsius: 3 },
      notes: "Fresh mozzarella does not freeze well. Low-moisture freezes for 2–3 months.",
    },
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const dairy: Record<string, IngredientMapping> =
  fixIngredientMappings(rawDairy);
