import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawMeats: Record<string, Partial<IngredientMapping>> = {
  beef: {
    name: "Beef",
    description:
      "Meat from domesticated cattle (*Bos taurus*), the foundation of protein-heavy cuisine across the Americas, Europe, and expanding globally. Flavor and texture vary dramatically by cut, breed, age, diet, and aging. Grass-finished beef has a yellower fat and more mineral, slightly gamey flavor; grain-finished is sweeter and more marbled. Dry-aging (21–60 days) concentrates flavor and tenderizes via enzymatic action. Primal cuts divide into tender quick-cook muscles (loin, rib) and harder-working cuts (chuck, brisket, shank) that reward long moist heat.",
    category: "protein",
    subCategory: "meat",
    origin: ["Americas", "Europe", "Australia", "Japan (Wagyu)"],
    regionalOrigins: ["global"],
    sustainabilityScore: 2,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.2, Air: 0.0 },
    quantityBase: { amount: 200, unit: "g" },
    scaledElemental: { Fire: 0.67, Water: 0.11, Earth: 0.22, Air: 0.0 },
    alchemicalProperties: { Spirit: 0.15, Essence: 0.4, Matter: 0.85, Substance: 0.8 },
    kineticsImpact: { thermalDirection: 0.25, forceMagnitude: 1.18 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["aries", "taurus", "capricorn"],
      elementalAffinity: { base: "Fire", secondary: "Earth" },
    },
    qualities: ["robust", "rich", "substantial", "umami", "mineral", "warming"],
    varieties: {
      ribeye: {
        name: "Ribeye",
        characteristics: "Heavily marbled cut from the rib primal, with the spinalis dorsi 'ribeye cap' as its highlight.",
        uses: "Grilling, pan-searing at high heat; eats beautifully medium-rare.",
      },
      strip: {
        name: "Strip / New York Strip",
        characteristics: "Tender, leaner cut from the short loin with a firm bite and beefy flavor.",
        uses: "Grilling, pan-searing, reverse-searing.",
      },
      tenderloin: {
        name: "Tenderloin / Filet Mignon",
        characteristics: "Smallest, most tender cut; mild flavor, buttery texture.",
        uses: "Quick searing, roasting whole (châteaubriand), carpaccio.",
      },
      chuck: {
        name: "Chuck",
        characteristics: "Hard-working shoulder muscle with abundant connective tissue and rich flavor.",
        uses: "Pot roast, short ribs, ground for burgers, slow braises.",
      },
      brisket: {
        name: "Brisket",
        characteristics: "Long, fibrous, heavily marbled pectoral muscle that transforms under long low heat.",
        uses: "Barbecue smoking, corned beef, pastrami, pot au feu.",
      },
      skirt: {
        name: "Skirt / Hanger / Flank",
        characteristics: "Thin, loose-grained cuts from the plate and abdominals; intense flavor.",
        uses: "Fajitas, carne asada, steak frites — slice across the grain.",
      },
      wagyu: {
        name: "Wagyu",
        characteristics: "Japanese breeds (Kobe, Matsusaka) with extreme intramuscular marbling (BMS 8–12).",
        uses: "Quick sear, thin slice, small portions — the fat itself is the point.",
      },
    },
    sensoryProfile: {
      taste: { spicy: 0, sweet: 0.1, sour: 0, bitter: 0.1, salty: 0.2, umami: 0.9 },
      aroma: { floral: 0, fruity: 0.05, herbal: 0, earthy: 0.6, woody: 0.3, spicy: 0 },
      texture: { crisp: 0.1, tender: 0.5, creamy: 0.1, chewy: 0.4, crunchy: 0, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["savory", "umami", "mineral"],
        secondary: ["sweet (from Maillard crust)", "buttery (from fat)"],
        notes: "Aging, breed, and feed drive enormous flavor differences before you ever season it.",
      },
      cookingMethods: ["grill", "sear", "roast", "braise", "smoke", "sous-vide", "broil"],
      cuisineAffinity: ["American", "French", "Italian", "Japanese", "Korean", "Mexican", "Argentine", "British"],
      preparationTips: [
        "Salt generously 45+ minutes ahead (or 15 minutes is worse than zero) to avoid surface moisture.",
        "Tender cuts: high heat, short time; tough cuts: low heat, long time.",
        "Always rest 5–10 min per inch of thickness.",
        "Slice against the grain — grain direction matters more than knife skill.",
      ],
      doneness: ["rare (52°C/125°F)", "medium-rare (57°C/135°F)", "medium (63°C/145°F)", "medium-well (68°C/155°F)", "well-done (74°C/165°F)"],
    },
    nutritionalProfile: {
      serving_size: "3 oz (85g), 90% lean ground, cooked",
      calories: 213,
      macros: { protein: 22, carbs: 0, fat: 13, fiber: 0, saturatedFat: 5, sugar: 0, potassium: 270, sodium: 60, cholesterol: 75 },
      vitamins: { B12: 1.04, B6: 0.29, niacin: 0.36, riboflavin: 0.12, thiamin: 0.05 },
      minerals: { zinc: 0.47, iron: 0.14, phosphorus: 0.18, selenium: 0.33, magnesium: 0.05 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["garlic", "rosemary", "thyme", "butter", "red wine", "mushroom", "blue cheese", "horseradish", "black pepper", "mustard", "shallot"],
      contrasting: ["chimichurri", "soy sauce", "gochujang", "miso", "coffee rub", "cocoa", "pomegranate molasses"],
      toAvoid: ["delicate floral herbs on heavy braises", "raw citrus on dry-aged cuts"],
    },
    preparation: {
      methods: ["grill over charcoal", "cast-iron sear + butter baste", "reverse sear", "slow braise (low & slow)", "sous-vide + torch finish", "dry age"],
      fresh: {
        duration: "3–5 days refrigerated (larger cuts); 1–2 days ground",
        storage: "Sealed on a tray, coldest part of the fridge (≤2°C).",
        tips: ["Bring steaks to room temperature 30–60 min before cooking.", "Pat bone-dry before seasoning.", "Don't move it until it releases from the pan."],
      },
    },
    storage: {
      container: "Vacuum-sealed or wrapped tightly in butcher paper on a rimmed tray",
      duration: "3–5 days fresh; up to 12 months frozen (vacuum-sealed)",
      temperature: { fahrenheit: 32, celsius: 0 },
      notes: "Dry-aged beef stores dry, uncovered, in a dedicated chamber at 1–3°C and 80–85% humidity.",
    },
    safetyThresholds: {
      minimum: { fahrenheit: 125, celsius: 52 },
      notes: "Whole-muscle cuts are safe at lower internal temps (rare is fine). Ground beef must reach 160°F (71°C).",
    },
  },

  pork: {
    name: "Pork",
    description:
      "Meat from domesticated pig (*Sus scrofa domesticus*), the world's most widely consumed meat by tonnage. Ranges from delicate, clean-flavored loin chops through forgiving, collagen-rich shoulder (ideal for braises and pulled pork) to the transformative fat-and-muscle combinations of belly. Heritage breeds (Berkshire, Mangalitsa, Iberico) produce fat with a higher melting point and deeper flavor than modern commodity pigs bred for leanness. Nearly every culture has a preserved-pork tradition: prosciutto, jamón, chorizo, bacon, guanciale, lardo.",
    category: "protein",
    subCategory: "meat",
    origin: ["East Asia", "Europe", "Spain (Iberico)", "Hungary (Mangalitsa)"],
    regionalOrigins: ["global"],
    sustainabilityScore: 3,
    season: ["fall"],
    seasonality: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.2, Air: 0.0 },
    quantityBase: { amount: 180, unit: "g" },
    scaledElemental: { Fire: 0.39, Water: 0.41, Earth: 0.2, Air: 0.0 },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.5, Matter: 0.75, Substance: 0.7 },
    kineticsImpact: { thermalDirection: 0.18, forceMagnitude: 1.08 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Jupiter"],
      favorableZodiac: ["taurus", "sagittarius", "libra"],
      elementalAffinity: { base: "Water", secondary: "Fire" },
    },
    qualities: ["rich", "savory", "versatile", "fatty", "adaptable", "caramelizing"],
    varieties: {
      loin: {
        name: "Loin (Chops, Roast)",
        characteristics: "Lean, mild, tender; chops are cut from the rack; roasts from the center-cut loin.",
        uses: "Quick pan-searing, roasting; dries out if overcooked.",
      },
      shoulder: {
        name: "Shoulder / Butt",
        characteristics: "Heavily marbled, full of connective tissue and intramuscular fat.",
        uses: "Pulled pork, carnitas, braises, ragù, sausage.",
      },
      belly: {
        name: "Belly",
        characteristics: "Alternating layers of fat and lean; becomes bacon when cured and smoked.",
        uses: "Roast whole, braise, cure for bacon/pancetta, slow-cook for pork belly bao.",
      },
      tenderloin: {
        name: "Tenderloin",
        characteristics: "Small, extremely tender, very lean cut running along the backbone.",
        uses: "Quick roast, medallions, stir-fry.",
      },
      ribs: {
        name: "Ribs (Baby Back, Spare, St. Louis)",
        characteristics: "Meaty cuts from the rib cage, varying in meatiness and fat.",
        uses: "Barbecue, braise, confit, char siu.",
      },
      iberico: {
        name: "Iberico",
        characteristics: "Spanish black pig fed acorns, producing deep crimson flesh and nutty fat.",
        uses: "Cure for jamón; sear secreto and presa cuts quickly.",
      },
    },
    sensoryProfile: {
      taste: { sweet: 0.3, salty: 0.1, sour: 0, bitter: 0, umami: 0.7, spicy: 0 },
      aroma: { floral: 0, fruity: 0.1, herbal: 0, earthy: 0.4, woody: 0.3, spicy: 0 },
      texture: { crisp: 0.3, tender: 0.6, creamy: 0.1, chewy: 0.3, crunchy: 0.2, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["savory", "sweet", "umami"],
        secondary: ["nutty fat", "caramelized crust"],
        notes: "Pork fat caramelizes spectacularly — the basis for crackling, lardons, guanciale, bacon.",
      },
      cookingMethods: ["roast", "braise", "grill", "smoke", "cure", "confit", "pan-sear"],
      cuisineAffinity: ["Chinese", "Italian", "Spanish", "Mexican", "German", "American", "Korean", "Filipino"],
      preparationTips: [
        "Brine loin and chops — they're so lean they have almost no margin for error.",
        "Score skin in a tight grid for crackling; dry completely before roasting.",
        "Shoulder is done when a fork twists freely in the meat — time ranges wildly by cut size.",
        "Ribs are ready when the bones twist loose but the meat doesn't fall off — overcooked ribs disappoint.",
      ],
      doneness: ["medium-rare (63°C/145°F for whole muscle)", "well-done (71°C/160°F for ground or rolled)"],
    },
    nutritionalProfile: {
      serving_size: "3 oz (85g) roasted loin chop",
      calories: 206,
      macros: { protein: 23, carbs: 0, fat: 12, fiber: 0, saturatedFat: 4.4, sugar: 0, potassium: 292, sodium: 48, cholesterol: 65 },
      vitamins: { thiamin: 0.54, B6: 0.21, niacin: 0.28, B12: 0.25, riboflavin: 0.15 },
      minerals: { selenium: 0.47, zinc: 0.15, phosphorus: 0.19, iron: 0.05, potassium: 0.08 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["apple", "sage", "fennel", "mustard", "maple", "cherry", "bourbon", "cabbage", "soy", "ginger", "garlic", "cumin"],
      contrasting: ["lime", "chili", "tamarind", "pomegranate molasses", "gochujang", "star anise"],
    },
    preparation: {
      methods: ["roast whole joint", "slow-braise shoulder", "sear loin chops", "smoke ribs low & slow", "cure for bacon/pancetta"],
      fresh: {
        duration: "3–5 days refrigerated",
        storage: "Sealed on a tray, bottom shelf (≤2°C).",
        tips: ["Bring chops to room temperature before searing.", "Pat skin bone-dry for crackling.", "Don't skip salting: pork breast and belly especially benefit from overnight dry brine."],
      },
    },
    storage: {
      container: "Vacuum-sealed or wrapped tightly",
      duration: "3–5 days fresh; up to 6 months frozen (cured products keep far longer)",
      temperature: { fahrenheit: 32, celsius: 0 },
      notes: "USDA revised pork's safe internal temp to 63°C (145°F) in 2011 — pink, juicy pork loin is safe and preferred.",
    },
    safetyThresholds: {
      minimum: { fahrenheit: 145, celsius: 63 },
      notes: "Ground pork to 160°F (71°C). Cured, shelf-stable products (jamón, prosciutto) are eaten raw.",
    },
  },

  lamb: {
    name: "Lamb",
    description:
      "Meat from young domestic sheep (*Ovis aries*) under one year old (mutton is older animal, stronger flavored). Carries a distinctive grassy, slightly gamey flavor derived from branched-chain fatty acids in the fat — the very quality that makes it divisive. Milk-fed lamb (abbacchio) is palest and most delicate; spring lamb is the traditional Mediterranean Easter centerpiece; grass-finished lamb from New Zealand, Iceland, and Wales is intensely flavored and at its best with minimal fuss.",
    category: "protein",
    subCategory: "meat",
    origin: ["Mediterranean", "Middle East", "New Zealand", "Australia", "Iceland", "Wales"],
    regionalOrigins: ["global"],
    sustainabilityScore: 4,
    season: ["spring", "summer"],
    seasonality: ["spring", "summer"],
    elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0.0 },
    quantityBase: { amount: 160, unit: "g" },
    scaledElemental: { Fire: 0.58, Earth: 0.31, Air: 0.11, Water: 0.0 },
    alchemicalProperties: { Spirit: 0.35, Essence: 0.45, Matter: 0.8, Substance: 0.75 },
    kineticsImpact: { thermalDirection: 0.22, forceMagnitude: 1.15 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["aries", "capricorn"],
      elementalAffinity: { base: "Fire", secondary: "Earth" },
    },
    qualities: ["tender", "gamy", "distinctive", "grassy", "rich", "mineral"],
    varieties: {
      rack: {
        name: "Rack of Lamb",
        characteristics: "Eight cutlets from the rib primal, trimmed 'French' style with bones exposed.",
        uses: "Crown roast, roast whole, broil under a mustard-herb crust.",
      },
      leg: {
        name: "Leg",
        characteristics: "Bone-in or butterflied; the Easter centerpiece of Mediterranean cuisine.",
        uses: "Roast, slow-braise, butterfly and grill.",
      },
      shoulder: {
        name: "Shoulder",
        characteristics: "Collagen-rich working muscle, heavily marbled, deeply flavored.",
        uses: "7-hour shoulder, tagine, braise, slow-roasted kleftiko.",
      },
      loin_chops: {
        name: "Loin Chops",
        characteristics: "Small, tender T-bone-like chops from the lumbar region.",
        uses: "Quick pan-searing or grilling.",
      },
      ground: {
        name: "Ground",
        characteristics: "Varying lean-to-fat ratios, deep flavor.",
        uses: "Kofta, kibbeh, Greek moussaka, lamb burgers, meatballs.",
      },
      shank: {
        name: "Shank",
        characteristics: "Heavily sinewy, collagen-packed lower leg joint.",
        uses: "Braises, osso buco-style preparations, tagines.",
      },
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.1, sour: 0, bitter: 0.1, umami: 0.7, spicy: 0 },
      aroma: { floral: 0, fruity: 0, herbal: 0.3, earthy: 0.5, woody: 0.3, spicy: 0 },
      texture: { crisp: 0.1, tender: 0.65, creamy: 0.05, chewy: 0.4, crunchy: 0, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["gamy", "earthy", "grassy"],
        secondary: ["mineral", "sweet (from fat)", "herbaceous"],
        notes: "Much of the distinctive flavor is in the fat — trim heavily or leave it, but don't meet in the middle.",
      },
      cookingMethods: ["roast", "grill", "braise", "smoke", "tagine", "kebab/skewer"],
      cuisineAffinity: ["Greek", "Middle Eastern", "North African", "Indian", "French", "British", "Icelandic"],
      preparationTips: [
        "Best served medium-rare (57°C/135°F) for tender cuts; braise cuts to pull-apart tender.",
        "Stud legs and shoulders with slivers of garlic and rosemary before roasting.",
        "Mint, preserved lemon, pomegranate — lamb loves sharp/acidic counterpoints.",
        "Render mutton fat low and slow (suet) — it fries potatoes beautifully.",
      ],
      doneness: ["rare (52°C/125°F)", "medium-rare (57°C/135°F)", "medium (63°C/145°F)"],
    },
    nutritionalProfile: {
      serving_size: "3 oz (85g) roasted leg",
      calories: 175,
      macros: { protein: 24, carbs: 0, fat: 8, fiber: 0, saturatedFat: 3, sugar: 0, potassium: 264, sodium: 56, cholesterol: 78 },
      vitamins: { B12: 0.93, niacin: 0.34, B6: 0.07, riboflavin: 0.13, pantothenic_acid: 0.08 },
      minerals: { zinc: 0.3, selenium: 0.37, phosphorus: 0.16, iron: 0.1, copper: 0.06 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["rosemary", "mint", "garlic", "lemon", "anchovy", "yogurt", "cumin", "coriander", "preserved lemon", "pomegranate", "red wine", "white bean"],
      contrasting: ["harissa", "ras el hanout", "mustard", "capers", "olives", "feta"],
      toAvoid: ["delicate white fish companions", "mild fresh cheeses with ground lamb"],
    },
    preparation: {
      methods: ["roast whole leg or shoulder", "pan-sear chops", "grill skewers (kebab)", "slow-braise shank", "tagine"],
      fresh: {
        duration: "3–5 days refrigerated",
        storage: "Sealed on a tray, bottom shelf (≤2°C).",
        tips: ["Remove from fridge 45 min before cooking for even heating.", "Score the fat cap on roasts to let fat render freely.", "Serve on warm plates — lamb fat sets quickly and congeals on cold ones."],
      },
    },
    storage: {
      container: "Vacuum-sealed or wrapped tightly",
      duration: "3–5 days fresh; 6–9 months frozen",
      temperature: { fahrenheit: 32, celsius: 0 },
    },
    safetyThresholds: {
      minimum: { fahrenheit: 125, celsius: 52 },
      notes: "Whole-muscle lamb is safe rare. Ground lamb to 160°F (71°C).",
    },
  },

  veal: {
    name: "Veal",
    description:
      "Meat from young cattle, typically 16–24 weeks old, with pale pink flesh and a delicate, mild flavor between chicken and beef. Rose veal (raised on a mixed diet with outdoor access) has replaced much of the ethically fraught formula-fed 'milk-fed' veal in modern European and North American markets. The gelatin-rich bones and shanks are the basis for classical French demi-glace and Italian osso buco.",
    category: "protein",
    subCategory: "meat",
    origin: ["Europe (France, Italy, Netherlands)", "North America"],
    regionalOrigins: ["europe", "americas"],
    sustainabilityScore: 3,
    season: ["spring", "summer"],
    seasonality: ["spring", "summer"],
    elementalProperties: { Fire: 0.4, Water: 0.35, Earth: 0.2, Air: 0.05 },
    quantityBase: { amount: 170, unit: "g" },
    alchemicalProperties: { Spirit: 0.2, Essence: 0.5, Matter: 0.7, Substance: 0.65 },
    kineticsImpact: { thermalDirection: 0.12, forceMagnitude: 0.98 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mars"],
      favorableZodiac: ["cancer", "aries"],
      elementalAffinity: { base: "Water", secondary: "Fire" },
    },
    qualities: ["delicate", "mild", "tender", "pale", "gelatin-rich"],
    varieties: {
      chop: {
        name: "Veal Chop",
        characteristics: "Tender rib or loin chop with a mild flavor.",
        uses: "Pan-searing, grilling.",
      },
      shank: {
        name: "Shank (Ossobuco)",
        characteristics: "Cross-cut hind shank with a marrow-filled bone center.",
        uses: "Ossobuco — the Milanese classic with gremolata and saffron risotto.",
      },
      scallops: {
        name: "Scallopini / Scaloppine",
        characteristics: "Thin slices pounded to even thickness.",
        uses: "Milanese, piccata, saltimbocca, marsala.",
      },
      bones: {
        name: "Veal Bones",
        characteristics: "Gelatin-rich, mild flavor when roasted.",
        uses: "Classical French stock and demi-glace.",
      },
    },
    sensoryProfile: {
      taste: { sweet: 0.2, salty: 0.05, sour: 0, bitter: 0, umami: 0.5, spicy: 0 },
      aroma: { floral: 0, fruity: 0, herbal: 0, earthy: 0.3, woody: 0.1, spicy: 0 },
      texture: { crisp: 0, tender: 0.85, creamy: 0.05, chewy: 0.2, crunchy: 0, silky: 0.15 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["mild", "delicate", "savory"],
        secondary: ["sweet", "buttery"],
        notes: "Less assertive than beef; excellent carrier for sauces and aromatics.",
      },
      cookingMethods: ["pan-sear", "braise", "roast", "sauté (scallopini)", "stock-making"],
      cuisineAffinity: ["Italian", "French", "Austrian", "German", "Swiss"],
      preparationTips: [
        "Pound scallopini to even 3–4mm thickness for quick sear.",
        "Don't overcook — veal dries out faster than beef.",
        "Shanks for ossobuco should simmer 1.5–2 hours, barely breaking.",
        "Roast veal bones deep brown before stock-making for flavor and color.",
      ],
    },
    nutritionalProfile: {
      serving_size: "3 oz (85g) roasted loin",
      calories: 186,
      macros: { protein: 26, carbs: 0, fat: 8, fiber: 0, saturatedFat: 2.8, sugar: 0, potassium: 259, sodium: 79, cholesterol: 108 },
      vitamins: { B12: 0.55, niacin: 0.45, B6: 0.25, riboflavin: 0.2 },
      minerals: { zinc: 0.25, selenium: 0.3, phosphorus: 0.2 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["sage", "lemon", "butter", "capers", "mushroom", "prosciutto", "marsala wine", "parmesan", "cream", "saffron"],
      contrasting: ["tomato", "olive", "gremolata"],
    },
    storage: {
      container: "Sealed on a tray, bottom shelf",
      duration: "3 days fresh; 4–6 months frozen",
      temperature: { fahrenheit: 32, celsius: 0 },
    },
    safetyThresholds: {
      minimum: { fahrenheit: 145, celsius: 63 },
      notes: "Whole-muscle veal: 63°C. Ground: 71°C / 160°F.",
    },
  },

  venison: {
    name: "Venison",
    description:
      "Meat from deer (typically *Odocoileus* species in North America and *Cervus elaphus* red deer in Europe). Extremely lean, iron-rich, and deeply flavored — gamier than any farmed red meat. Farmed venison is milder and more consistent; wild venison reflects the animal's diet and season. The leanness demands careful cooking: cook hot and fast to medium-rare, or slow-braise tough cuts with added fat.",
    category: "protein",
    subCategory: "meat",
    origin: ["Scotland", "New Zealand", "North America", "Central Europe"],
    regionalOrigins: ["europe", "americas", "oceania"],
    sustainabilityScore: 7,
    season: ["fall", "winter"],
    seasonality: ["fall", "winter"],
    elementalProperties: { Fire: 0.55, Earth: 0.35, Air: 0.1, Water: 0.0 },
    quantityBase: { amount: 170, unit: "g" },
    alchemicalProperties: { Spirit: 0.3, Essence: 0.55, Matter: 0.8, Substance: 0.75 },
    kineticsImpact: { thermalDirection: 0.2, forceMagnitude: 1.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn", "Moon"],
      favorableZodiac: ["sagittarius", "capricorn"],
      elementalAffinity: { base: "Fire", secondary: "Earth" },
    },
    qualities: ["gamy", "lean", "iron-rich", "wild", "earthy", "distinctive"],
    sensoryProfile: {
      taste: { sweet: 0.05, salty: 0.1, sour: 0, bitter: 0.15, umami: 0.85, spicy: 0 },
      aroma: { floral: 0, fruity: 0.05, herbal: 0.1, earthy: 0.75, woody: 0.4, spicy: 0 },
      texture: { crisp: 0, tender: 0.45, creamy: 0, chewy: 0.5, crunchy: 0, silky: 0 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["gamy", "iron-rich", "earthy"],
        secondary: ["mineral", "woody"],
        notes: "Pairs famously with fruits, juniper, and cocoa — counterpoints that cut through the gaminess.",
      },
      cookingMethods: ["pan-sear", "roast", "braise", "smoke", "cure", "grind"],
      cuisineAffinity: ["British", "German", "Nordic", "French", "American"],
      preparationTips: [
        "Always add fat: wrap loin in bacon or lardo; blend ground venison with pork fat.",
        "Marinate tougher cuts in red wine and juniper for 12–24 hours.",
        "Pull off heat 5°C before target — residual heat climbs fast in lean cuts.",
        "Season aggressively — the flavor carries salt and pepper better than most meats.",
      ],
      doneness: ["medium-rare (57°C/135°F) only — anything further dries out badly"],
    },
    nutritionalProfile: {
      serving_size: "3 oz (85g) roasted",
      calories: 134,
      macros: { protein: 26, carbs: 0, fat: 3, fiber: 0, saturatedFat: 1.1, sugar: 0, potassium: 285, sodium: 46, cholesterol: 95 },
      vitamins: { B12: 1.3, niacin: 0.4, B6: 0.3, riboflavin: 0.4 },
      minerals: { iron: 0.2, zinc: 0.3, phosphorus: 0.2, selenium: 0.3 },
      source: "USDA FoodData Central",
    },
    pairingRecommendations: {
      complementary: ["juniper", "rosemary", "blackberry", "blueberry", "red wine", "port", "cocoa", "allspice", "black pepper", "root vegetables", "chestnut"],
      contrasting: ["pomegranate", "sour cherry", "sherry vinegar", "pickled red cabbage"],
    },
    storage: {
      container: "Vacuum-sealed",
      duration: "3 days fresh; up to 12 months frozen",
      temperature: { fahrenheit: 32, celsius: 0 },
      notes: "Wild-harvested venison should be aged 5–14 days at 1–3°C before butchering for tenderness.",
    },
    safetyThresholds: {
      minimum: { fahrenheit: 135, celsius: 57 },
      notes: "Ground venison to 160°F (71°C). Wild game may carry chronic wasting risk in some regions — check local guidance.",
    },
  },
};

export const _meats: Record<string, IngredientMapping> = fixIngredientMappings(rawMeats);
export const _meatNames = Object.keys(rawMeats);
