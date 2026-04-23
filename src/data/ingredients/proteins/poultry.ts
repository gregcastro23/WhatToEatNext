import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawPoultry: Record<string, Partial<IngredientMapping>> = {
  chicken: {
    name: "Chicken",
    description:
      "Domesticated fowl descended from the red junglefowl (*Gallus gallus domesticus*) of Southeast Asia. The world's most consumed protein, with an exceptionally mild, slightly sweet flesh that carries seasonings and sauces across virtually every global cuisine. White breast meat is lean and quick-cooking; dark thigh and leg meat is richer and forgiving under long heat. Select birds with plump, unblemished skin, pale flesh, and a clean smell; air-chilled or pasture-raised birds yield noticeably better flavor.",
    category: "poultry",
    subCategory: "poultry",
    origin: ["Southeast Asia (domesticated worldwide)"],
    regionalOrigins: ["global"],
    sustainabilityScore: 6,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    quantityBase: { amount: 150, unit: "g" },
    scaledElemental: { Fire: 0.19, Water: 0.31, Air: 0.31, Earth: 0.19 },
    alchemicalProperties: { Spirit: 0.15, Essence: 0.45, Matter: 0.6, Substance: 0.65 },
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.92 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["virgo", "gemini", "libra"],
      elementalAffinity: { base: "Air", secondary: "Water" },
    },
    qualities: ["adaptable", "mild", "versatile", "light", "neutral", "balancing"],
    varieties: {
      broiler: {
        name: "Broiler / Fryer",
        characteristics: "Young, tender bird 7–10 weeks old, 2–5 pounds.",
        uses: "Roasting, frying, grilling, sautéing — the default supermarket chicken.",
      },
      roaster: {
        name: "Roasting Hen",
        characteristics: "Older bird, 3–5 months, 5–7 pounds, with more fat and deeper flavor.",
        uses: "Roasting whole or spatchcocked; richer stock.",
      },
      heritage: {
        name: "Heritage Breed",
        characteristics: "Slow-growing breeds like Bresse or Jersey Giant with firm, dense flesh.",
        uses: "Traditional roasts, poule au pot, demands longer moist cooking.",
      },
      poussin: {
        name: "Poussin",
        characteristics: "Young bird under 4 weeks, 400–500g, extremely tender.",
        uses: "Individual roasts, spatchcocked and grilled.",
      },
    },
    sensoryProfile: {
      taste: { spicy: 0, sweet: 0.1, sour: 0, bitter: 0, salty: 0.1, umami: 0.6 },
      aroma: { floral: 0, fruity: 0.05, herbal: 0, earthy: 0.2, woody: 0.1, spicy: 0 },
      texture: { crisp: 0, tender: 0.8, creamy: 0, chewy: 0.2, crunchy: 0, silky: 0.1 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["mild", "savory", "umami"],
        secondary: ["slightly sweet", "buttery"],
        notes: "Takes on the character of its seasoning. Dark meat is richer and more forgiving than breast.",
      },
      cookingMethods: ["roast", "grill", "poach", "braise", "fry", "sauté", "smoke"],
      cuisineAffinity: ["French", "Italian", "American", "Chinese", "Thai", "Indian", "Mexican", "Middle Eastern"],
      preparationTips: [
        "Dry-brine for 12–24h for crisp skin and seasoned flesh.",
        "Temperature matters more than time: breast 63°C (145°F), thigh 74°C (165°F).",
        "Rest whole birds 15 min before carving; joints 5 min.",
        "Spatchcock to cook whole birds in half the time with more even browning.",
      ],
    },
    nutritionalProfile: {
      serving_size: "5 oz (150g) roasted breast, skin-off",
      calories: 231,
      macros: { protein: 43.5, carbs: 0, fat: 5, fiber: 0, saturatedFat: 1.4, sugar: 0, potassium: 384, sodium: 111, cholesterol: 120 },
      vitamins: { B6: 0.9, niacin: 1.0, B12: 0.5, pantothenic_acid: 0.25 },
      minerals: { selenium: 0.55, phosphorus: 0.38, potassium: 0.11, zinc: 0.15 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["lemon", "garlic", "rosemary", "thyme", "tarragon", "butter", "white wine", "mushrooms", "leeks", "shallots"],
      contrasting: ["chili", "ginger", "soy", "coconut milk", "lime", "mustard"],
      toAvoid: ["overpowering smoked fish", "very assertive blue cheeses on white meat"],
    },
    preparation: {
      methods: ["roast whole", "spatchcock and grill", "braise bone-in", "poach", "fry breasts"],
      fresh: {
        duration: "1–2 days refrigerated",
        storage: "Coldest part of fridge, ≤4°C, on a tray to catch drips.",
        tips: ["Remove giblets promptly.", "Pat dry before seasoning — water is the enemy of crisp skin."],
      },
    },
    storage: {
      container: "Sealed, on a rimmed tray on the bottom shelf",
      duration: "1–2 days fresh; up to 9 months frozen",
      temperature: { fahrenheit: 32, celsius: 0 },
      notes: "Never refreeze thawed raw chicken. Cook within 24h of thawing.",
    },
    safetyThresholds: {
      minimum: { fahrenheit: 165, celsius: 74 },
      notes: "USDA-mandated internal temperature at the thickest point, away from the bone.",
    },
  },

  turkey: {
    name: "Turkey",
    description:
      "Native North American fowl (*Meleagris gallopavo*) domesticated by Indigenous peoples of Mesoamerica and now raised worldwide. Leaner than chicken with a slightly gamier, more savory profile. Heritage breeds (Bourbon Red, Narragansett) offer deeper flavor than the commodity Broad-Breasted White. Whole birds are a centerpiece of fall and winter feasts; breast cuts and ground turkey serve as year-round lean protein staples.",
    category: "poultry",
    subCategory: "poultry",
    origin: ["North America", "Mesoamerica"],
    regionalOrigins: ["americas"],
    sustainabilityScore: 5,
    season: ["fall", "winter"],
    seasonality: ["fall", "winter"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Air: 0.35, Earth: 0.15 },
    quantityBase: { amount: 170, unit: "g" },
    scaledElemental: { Fire: 0.14, Water: 0.36, Air: 0.36, Earth: 0.14 },
    alchemicalProperties: { Spirit: 0.12, Essence: 0.4, Matter: 0.65, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.02, forceMagnitude: 0.88 },
    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Mercury"],
      favorableZodiac: ["sagittarius", "virgo"],
      elementalAffinity: { base: "Air", secondary: "Water" },
    },
    qualities: ["lean", "mild", "versatile", "nutritious", "festive", "high-protein"],
    varieties: {
      broad_breasted_white: {
        name: "Broad-Breasted White",
        characteristics: "Commodity bird bred for rapid growth and large breast muscles.",
        uses: "Holiday roasts; benefits heavily from brining.",
      },
      heritage: {
        name: "Heritage Breeds",
        characteristics: "Bourbon Red, Narragansett, Standard Bronze — slower growth, more dark meat, deeper flavor.",
        uses: "High-end roasts where flavor beats portion size.",
      },
      wild: {
        name: "Wild Turkey",
        characteristics: "Foraged, lean, strongly flavored dark meat throughout.",
        uses: "Braising, smoking, confit; whole roasts are tough without care.",
      },
    },
    sensoryProfile: {
      taste: { sweet: 0.15, salty: 0.1, sour: 0, bitter: 0.05, umami: 0.5, spicy: 0 },
      aroma: { floral: 0, fruity: 0, herbal: 0, earthy: 0.25, woody: 0.15, spicy: 0 },
      texture: { crisp: 0, tender: 0.55, creamy: 0, chewy: 0.3, crunchy: 0, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["mild", "savory", "clean"],
        secondary: ["slightly sweet", "earthy dark meat"],
        notes: "Leaner than chicken, so overcooked breast dries fast. Dark meat is genuinely flavorful.",
      },
      cookingMethods: ["roast", "smoke", "braise", "grill", "deep-fry"],
      cuisineAffinity: ["American", "Mexican", "Mediterranean", "International"],
      preparationTips: [
        "Wet-brine 12–24h for moisture (1 cup kosher salt per gallon water).",
        "Separate cooking of dark/white meat (spatchcock or parts) gives better results than a whole bird.",
        "Pull breast at 63°C (145°F), rest to climb; thigh should reach 74°C (165°F).",
        "Let rest 30+ minutes before carving — the temperature equalizes and juices reabsorb.",
      ],
    },
    nutritionalProfile: {
      serving_size: "6 oz (170g) roasted breast, skin-off",
      calories: 153,
      macros: { protein: 29, carbs: 0, fat: 3.2, fiber: 0, saturatedFat: 1.0, sugar: 0, potassium: 298, sodium: 65 },
      vitamins: { B6: 0.4, niacin: 0.6, B12: 0.5 },
      minerals: { selenium: 0.5, phosphorus: 0.3, zinc: 0.2 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["sage", "thyme", "rosemary", "cranberry", "chestnut", "brown butter", "apple", "maple", "bourbon", "orange"],
      contrasting: ["chipotle", "mole", "harissa", "cumin", "lime"],
    },
    preparation: {
      methods: ["roast whole", "spatchcock", "smoke", "deep-fry (whole)", "confit legs"],
      fresh: {
        duration: "1–2 days refrigerated",
        storage: "Sealed, on the bottom shelf; allow 24h per 4–5 lbs to thaw frozen birds in the fridge.",
        tips: ["Remove giblets and neck from cavity.", "Fully thawed before cooking — no exceptions for food safety."],
      },
    },
    storage: {
      container: "Original packaging or vacuum seal on a tray",
      duration: "1–2 days fresh; up to 12 months frozen whole",
      temperature: { fahrenheit: 32, celsius: 0 },
      notes: "A 14-lb bird takes ~3 days to thaw in the fridge. Never thaw on the counter.",
    },
    safetyThresholds: {
      minimum: { fahrenheit: 165, celsius: 74 },
      notes: "Insert thermometer into thickest part of the thigh, not touching bone.",
    },
  },

  duck: {
    name: "Duck",
    description:
      "Waterfowl (*Anas platyrhynchos domesticus*) prized across Chinese, French, and Southeast Asian traditions for its rich dark meat, thick insulating layer of subcutaneous fat, and legendary crisp skin. Pekin (Long Island) is the everyday breed; Muscovy and Moulard produce deeper flavor and the foie gras / magret of French cuisine. Every part has a use — the fat renders to a cooking medium rivaling olive oil, the carcass makes extraordinary stock, and the legs become confit.",
    category: "poultry",
    subCategory: "poultry",
    origin: ["China (Pekin)", "France (Rouen, Moulard)", "South America (Muscovy)"],
    regionalOrigins: ["asia", "europe"],
    sustainabilityScore: 5,
    season: ["fall", "winter"],
    seasonality: ["fall", "winter"],
    elementalProperties: { Fire: 0.35, Water: 0.25, Air: 0.25, Earth: 0.15 },
    quantityBase: { amount: 150, unit: "g" },
    scaledElemental: { Fire: 0.34, Water: 0.26, Air: 0.26, Earth: 0.14 },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.55, Matter: 0.7, Substance: 0.65 },
    kineticsImpact: { thermalDirection: 0.12, forceMagnitude: 1.05 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Jupiter"],
      favorableZodiac: ["taurus", "libra", "sagittarius"],
      elementalAffinity: { base: "Fire", secondary: "Water" },
    },
    qualities: ["rich", "luxurious", "gamey", "fatty", "flavorful", "succulent"],
    varieties: {
      pekin: {
        name: "Pekin (Long Island)",
        characteristics: "White-feathered, milder flavor, pale flesh, thick fat cap; the standard American/Chinese duck.",
        uses: "Whole roasts (Peking duck), crispy confit legs.",
      },
      muscovy: {
        name: "Muscovy",
        characteristics: "Leaner, stronger flavor, firmer dark flesh; South American origin.",
        uses: "Magret-style seared breasts, slow-cooked legs.",
      },
      moulard: {
        name: "Moulard",
        characteristics: "Pekin × Muscovy hybrid. Very large breasts ideal for foie gras or magret.",
        uses: "Magret, confit, foie gras production.",
      },
    },
    sensoryProfile: {
      taste: { sweet: 0.15, salty: 0.1, sour: 0, bitter: 0.05, umami: 0.65, spicy: 0 },
      aroma: { floral: 0, fruity: 0.1, herbal: 0, earthy: 0.4, woody: 0.2, spicy: 0 },
      texture: { crisp: 0.5, tender: 0.6, creamy: 0, chewy: 0.3, crunchy: 0.2, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["rich", "savory", "umami"],
        secondary: ["sweet", "mineral", "gamey"],
        notes: "Pairs brilliantly with stone fruits and aromatic acid (orange, cherry, plum).",
      },
      cookingMethods: ["roast", "confit", "pan-sear", "smoke", "braise", "cure"],
      cuisineAffinity: ["French", "Chinese", "Vietnamese", "Thai"],
      preparationTips: [
        "Score skin in a tight crosshatch through the fat layer but not the flesh.",
        "Start breasts skin-side down in a cold dry pan to render fat gradually.",
        "Reserve rendered fat — it's the best potato-roasting medium on earth.",
        "Rest magret 8 min before slicing against the grain.",
      ],
    },
    nutritionalProfile: {
      serving_size: "5 oz (150g) roasted, skin-on",
      calories: 337,
      macros: { protein: 19, carbs: 0, fat: 28, fiber: 0, saturatedFat: 9.7, sugar: 0, potassium: 209, sodium: 59 },
      vitamins: { B6: 0.2, niacin: 0.4, B12: 0.3 },
      minerals: { selenium: 0.4, iron: 0.3, zinc: 0.2 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["orange", "cherry", "plum", "fig", "five-spice", "star anise", "hoisin", "cabbage", "potato (in duck fat)", "red wine"],
      contrasting: ["ginger", "green peppercorn", "pomegranate molasses", "sherry vinegar"],
    },
    preparation: {
      methods: ["roast whole", "sear magret", "confit legs", "smoke", "cure for prosciutto-style"],
      fresh: {
        duration: "2 days refrigerated",
        storage: "Sealed on a tray, bottom shelf.",
        tips: ["Pat skin bone-dry; overnight uncovered in the fridge improves crispness.", "Break down whole ducks into parts for faster, more even cooking."],
      },
    },
    storage: {
      container: "Sealed, on a rimmed tray",
      duration: "2 days fresh; up to 6 months frozen",
      temperature: { fahrenheit: 32, celsius: 0 },
      notes: "Confit stored submerged in its own fat keeps 2–3 months refrigerated.",
    },
    safetyThresholds: {
      minimum: { fahrenheit: 135, celsius: 57 },
      notes: "Breast meat is safely served medium-rare (57–60°C); legs must reach 74°C / 165°F.",
    },
  },

  goose: {
    name: "Goose",
    description:
      "Domesticated waterfowl (*Anser anser domesticus*) with exceptionally rich, dark, iron-heavy flesh and an extraordinary layer of fat that, when rendered, rivals duck fat for roasting potatoes and confiting. A traditional centerpiece of European winter feasts (Christmas goose in Germany, Britain, Scandinavia) whose popularity declined with industrial chicken and turkey but endures in heritage cooking.",
    category: "poultry",
    subCategory: "poultry",
    origin: ["Europe", "East Asia"],
    regionalOrigins: ["europe", "asia"],
    sustainabilityScore: 6,
    season: ["fall", "winter"],
    seasonality: ["fall", "winter"],
    elementalProperties: { Fire: 0.4, Water: 0.2, Air: 0.2, Earth: 0.2 },
    quantityBase: { amount: 180, unit: "g" },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.6, Matter: 0.75, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.15, forceMagnitude: 1.1 },
    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Saturn"],
      favorableZodiac: ["sagittarius", "capricorn"],
      elementalAffinity: { base: "Fire", secondary: "Earth" },
    },
    qualities: ["rich", "dense", "iron-heavy", "fatty", "traditional", "festive"],
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.1, sour: 0, bitter: 0.1, umami: 0.7, spicy: 0 },
      aroma: { floral: 0, fruity: 0.1, herbal: 0, earthy: 0.5, woody: 0.25, spicy: 0 },
      texture: { crisp: 0.4, tender: 0.5, creamy: 0, chewy: 0.4, crunchy: 0.15, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["rich", "gamey", "mineral"],
        secondary: ["sweet fat", "iron"],
        notes: "Entire bird is dark meat — think of it as a very rich version of duck leg.",
      },
      cookingMethods: ["roast", "confit", "braise", "cure"],
      cuisineAffinity: ["German", "British", "Scandinavian", "French", "Chinese"],
      preparationTips: [
        "Prick the skin all over (not the flesh) to release fat during roasting.",
        "Ladle off rendered fat every 30 min and reserve — you'll get a liter or more.",
        "A whole goose serves fewer people than you'd expect for its weight (bony frame, lots of fat).",
      ],
    },
    nutritionalProfile: {
      serving_size: "6 oz (170g) roasted, skin-on",
      calories: 360,
      macros: { protein: 29, carbs: 0, fat: 26, fiber: 0, saturatedFat: 8, sugar: 0, potassium: 389, sodium: 78 },
      vitamins: { B6: 0.6, B12: 0.6, riboflavin: 0.3 },
      minerals: { iron: 0.5, selenium: 0.45, zinc: 0.3 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["red cabbage", "apple", "prune", "chestnut", "caraway", "juniper", "orange", "mulled wine", "sauerkraut", "potato dumplings"],
      contrasting: ["pomegranate", "sour cherry", "sherry vinegar"],
    },
    storage: {
      container: "Sealed, on a rimmed tray",
      duration: "1–2 days fresh; 6 months frozen",
      temperature: { fahrenheit: 32, celsius: 0 },
      notes: "A whole frozen goose needs 2–3 days to thaw in the fridge.",
    },
    safetyThresholds: {
      minimum: { fahrenheit: 165, celsius: 74 },
      notes: "All parts should reach 74°C (165°F) — no medium-rare goose.",
    },
  },

  quail: {
    name: "Quail",
    description:
      "Small game bird (*Coturnix japonica* or *Colinus virginianus*) with dark, tender, mildly sweet flesh and a delicate, almost nutty flavor. Each bird serves one as an elegant appetizer or two as a component of a larger plate. Farmed quail are mild and consistent; wild quail carry a more pronounced gamey edge. Cook hot and fast — 10 minutes is often all they need.",
    category: "poultry",
    subCategory: "poultry",
    origin: ["East Asia", "Europe", "North America"],
    regionalOrigins: ["global"],
    sustainabilityScore: 7,
    season: ["fall"],
    seasonality: ["fall", "winter"],
    elementalProperties: { Fire: 0.3, Water: 0.2, Air: 0.35, Earth: 0.15 },
    quantityBase: { amount: 120, unit: "g" },
    alchemicalProperties: { Spirit: 0.25, Essence: 0.5, Matter: 0.55, Substance: 0.6 },
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.85 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "virgo"],
      elementalAffinity: { base: "Air", secondary: "Fire" },
    },
    qualities: ["delicate", "gamey", "small", "tender", "elegant"],
    sensoryProfile: {
      taste: { sweet: 0.2, salty: 0.05, sour: 0, bitter: 0.05, umami: 0.5, spicy: 0 },
      aroma: { floral: 0.05, fruity: 0.1, herbal: 0.1, earthy: 0.35, woody: 0.2, spicy: 0 },
      texture: { crisp: 0.3, tender: 0.8, creamy: 0, chewy: 0.15, crunchy: 0.1, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["delicate", "gamey", "nutty"],
        secondary: ["slightly sweet"],
        notes: "Eat with hands — there's no dignified way to use cutlery.",
      },
      cookingMethods: ["grill", "pan-roast", "spatchcock and broil", "confit", "smoke"],
      cuisineAffinity: ["French", "Italian", "Chinese", "Middle Eastern", "Portuguese"],
      preparationTips: [
        "Spatchcock for even cooking — they're too small to roast whole reliably.",
        "10 minutes total at 230°C (450°F) is usually enough for spatchcocked birds.",
        "Brush with a glaze (honey-soy, pomegranate molasses) during the last 2 min.",
      ],
    },
    nutritionalProfile: {
      serving_size: "4 oz (113g) roasted, skin-on",
      calories: 227,
      macros: { protein: 25, carbs: 0, fat: 14, fiber: 0, saturatedFat: 3.9, sugar: 0, potassium: 237, sodium: 58 },
      vitamins: { B6: 0.6, niacin: 0.4, B12: 0.2 },
      minerals: { iron: 0.25, phosphorus: 0.28, zinc: 0.2 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["grape", "fig", "pomegranate", "muscat wine", "hazelnut", "sage", "brown butter", "bacon", "wild mushroom"],
      contrasting: ["sherry vinegar", "sumac", "preserved lemon"],
    },
    storage: {
      container: "Sealed, flat in a single layer",
      duration: "2 days fresh; 6 months frozen",
      temperature: { fahrenheit: 32, celsius: 0 },
    },
    safetyThresholds: {
      minimum: { fahrenheit: 165, celsius: 74 },
      notes: "Commercial quail is USDA-inspected; some chefs pull earlier on pristine farm product — proceed at your own risk.",
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const poultry: Record<string, IngredientMapping> = fixIngredientMappings(rawPoultry);

// Create a collection of all poultry items
export const _allPoultry = Object.values(poultry);

export default poultry;
