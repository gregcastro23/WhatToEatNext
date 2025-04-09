import type { IngredientMapping } from '@/types/alchemy';

export const dairy: Record<string, IngredientMapping> = {
  "greek_yogurt": {
    name: "Greek Yogurt",
    description: "Strained yogurt with higher protein content and thick texture.",
    category: "dairy",
    qualities: ["tangy", "creamy", "thick"],
    sustainabilityScore: 6,
    season: ["all"],
    regionalOrigins: ["mediterranean", "middle_east"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.6,
      Earth: 0.2,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 10,
      fat: 5,
      carbs: 3.6,
      calories: 100
    },
    culinaryApplications: {
      raw: { notes: ["Base for breakfast bowls", "Topping for savory dishes"] },
      mix: { notes: ["Base for dips and sauces", "Used in marinades"] },
      bake: { notes: ["Adds moisture to baked goods"] }
    },
    pairings: ["honey", "berries", "nuts", "cucumber", "garlic"],
    substitutions: ["labneh", "skyr", "cottage_cheese"],
    affinities: ["fruits", "herbs", "spices"]
  },
  "cottage_cheese": {
    name: "Cottage Cheese",
    description: "Fresh cheese curd product with mild flavor and varying textures.",
    category: "dairy",
    qualities: ["mild", "soft", "fresh"],
    sustainabilityScore: 5,
    season: ["all"],
    regionalOrigins: ["europe", "north_america"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 12,
      fat: 4.3,
      carbs: 3.4,
      calories: 98
    },
    culinaryApplications: {
      raw: { notes: ["Eaten plain or with fruits"] },
      mix: { notes: ["Added to salads", "Used in dips"] },
      bake: { notes: ["Filling for crepes", "Added to casseroles and lasagna"] }
    },
    pairings: ["peaches", "pineapple", "tomatoes", "herbs", "pepper"],
    substitutions: ["ricotta", "greek_yogurt"],
    affinities: ["fruits", "vegetables", "herbs"]
  },
  "paneer": {
    name: "Paneer",
    description: "Fresh, non-melting cheese common in South Asian cuisine, made by curdling milk with lemon juice or vinegar.",
    category: "dairy",
    qualities: ["firm", "mild", "versatile", "protein-rich", "cooling"],
    sustainabilityScore: 6,
    season: ["all"],
    regionalOrigins: ["india", "pakistan", "bangladesh", "nepal"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.4,
      Earth: 0.4,
      Air: 0.1
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      zodiacInfluence: ["Cancer", "Taurus"],
      celestialAspects: {
        moonPhase: {
          waxing: "increased moisture retention",
          full: "optimum firmness and texture",
          waning: "drier, more crumbly texture"
        }
      }
    },
    lunarPhaseModifiers: {
      "New Moon": {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1
        },
        preparationTips: ["Add extra acid for better curdling", "Press for shorter time for softer texture"]
      },
      "Full Moon": {
        elementalBoost: {
          Earth: 0.2
        },
        preparationTips: ["Optimal time for making paneer", "Yields best firmness and moisture balance"]
      }
    },
    nutritionalContent: {
      protein: 18,
      fat: 22,
      carbs: 3.4,
      calories: 265,
      calcium: "350mg",
      phosphorus: "138mg",
      selenium: "11μg",
      vitamin_B12: "1.1μg",
      vitamin_D: "12IU",
      probioticContent: "minimal"
    },
    healthBenefits: {
      "complete protein": "Contains all essential amino acids",
      "bone health": "High calcium content supports bone density",
      "digestibility": "Easier to digest than aged cheeses",
      "weight management": "High protein content increases satiety",
      "diabetes friendly": "Low glycemic index, suitable for blood sugar management"
    },
    varieties: {
      "regular": {
        texture: "Firm, slightly crumbly",
        moisture: "Medium",
        uses: "All-purpose, good for curries and grilling",
        notes: "Most commonly available variety"
      },
      "malai paneer": {
        texture: "Soft, creamy, smoother",
        moisture: "High",
        uses: "Malai kofta, creamy dishes, stuffed breads",
        notes: "Made with cream-enriched milk for richer flavor"
      },
      "achari paneer": {
        texture: "Firm with tangy flavor",
        moisture: "Medium-low",
        uses: "Tandoori dishes, skewers, robust curry bases",
        notes: "Infused with pickling spices during curdling"
      },
      "dhaka paneer": {
        texture: "Very firm, less crumbly",
        moisture: "Low",
        uses: "Stir-fries, holds shape well when cooked",
        notes: "Bengali style with extended pressing time"
      }
    },
    culinaryApplications: {
      fry: { 
        notes: ["Lightly fried before adding to curries"],
        techniques: ["Shallow fry until golden", "Cube before frying for even cooking"],
        dishes: ["Paneer tikka masala", "Kadai paneer"]
      },
      grill: { 
        notes: ["Marinated and grilled as tikka"], 
        techniques: ["Marinate for at least 30 minutes", "Skewer for easy handling"],
        dishes: ["Paneer tikka", "Tandoori paneer"]
      },
      curry: { 
        notes: ["Added to spinach for saag paneer", "Used in various curry dishes"],
        techniques: ["Add late in cooking to prevent toughening", "Simmer gently"],
        dishes: ["Palak paneer", "Matar paneer", "Shahi paneer"] 
      },
      stuffing: {
        notes: ["Used as filling for breads and pastries"],
        techniques: ["Crumble or grate for even distribution", "Mix with herbs and spices"],
        dishes: ["Paneer paratha", "Stuffed naan", "Paneer rolls"]
      },
      raw: {
        notes: ["Enjoyed fresh with minimal preparation"],
        techniques: ["Sprinkle with chaat masala or black salt", "Drizzle with lime juice"],
        dishes: ["Paneer salad", "Fresh paneer snack"]
      }
    },
    preparation: {
      homemade: {
        ingredients: ["Whole milk", "Acid (lemon juice, vinegar, yogurt)"],
        process: "Heat milk, add acid, strain curds, press to desired firmness",
        tips: ["Use full-fat milk for best results", "Press longer for firmer texture"]
      },
      storebought: {
        selection: "Choose firm, white blocks with no discoloration",
        preparation: "Soak in warm water before cooking to soften if needed"
      }
    },
    storage: {
      container: "Airtight container with water",
      duration: "1-2 weeks refrigerated",
      temperature: {
        fahrenheit: 35,
        celsius: 1.7
      },
      notes: "Change water every 2-3 days for maximum freshness"
    },
    culturalSignificance: {
      "ayurvedic": {
        dosha: "Balances Vata and Pitta, may increase Kapha",
        properties: "Cooling, grounding, nourishing",
        recommendations: "Best consumed fresh with warming spices"
      },
      "religious": {
        role: "Important protein source in vegetarian Hindu diets",
        festivals: "Commonly prepared during Janmashtami and Holi celebrations",
        traditions: "Offered as prasad (blessed food) in some temples"
      },
      "regional": {
        "North Indian": "Used in rich, creamy curries",
        "Bengali": "Incorporated in sweeter preparations",
        "Punjabi": "Featured in robust, spice-forward dishes"
      }
    },
    affinities: {
      spices: ["cumin", "coriander", "garam masala", "turmeric", "fenugreek"],
      herbs: ["cilantro", "mint", "curry leaves"],
      vegetables: ["spinach", "peas", "bell peppers", "tomatoes", "onions"],
      aromatics: ["ginger", "garlic", "green chilies"]
    },
    pairings: ["spinach", "tomato", "peas", "Indian_spices", "fenugreek"],
    substitutions: ["halloumi", "firm_tofu", "queso_blanco", "queso_fresco"],
    idealSeasonings: {
      primary: ["chaat masala", "black salt", "garam masala"],
      secondary: ["red chili powder", "dried fenugreek leaves (kasuri methi)", "black pepper"]
    }
  },
  "halloumi": {
    name: "Halloumi",
    description: "Semi-hard, brined cheese with high melting point, popular for grilling.",
    category: "dairy",
    qualities: ["salty", "firm", "squeaky"],
    sustainabilityScore: 5,
    season: ["all"],
    regionalOrigins: ["cyprus", "middle_east"],
    elementalProperties: {
      Fire: 0.3,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 22,
      fat: 25,
      carbs: 2.2,
      calories: 330
    },
    culinaryApplications: {
      grill: { notes: ["Grilled until golden with characteristic grill marks"] },
      fry: { notes: ["Pan-fried until crispy outside, soft inside"] },
      raw: { notes: ["Can be eaten raw, though typically cooked"] }
    },
    pairings: ["watermelon", "mint", "lemon", "olive_oil", "za'atar"],
    substitutions: ["paneer", "bread_cheese", "queso_para_freir"],
    affinities: ["mediterranean_flavors", "fresh_herbs", "citrus"]
  }
};

export default dairy; 