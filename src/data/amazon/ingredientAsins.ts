/**
 * Amazon ASIN mappings for ingredients.
 *
 * Keys are normalized ingredient names (lowercase, trimmed).
 * Values are Amazon Standard Identification Numbers for grocery products
 * available on Amazon Fresh / Amazon Grocery.
 *
 * Associate Tag: cookingwi03f1-20
 */

export const AMAZON_ASSOCIATE_TAG = "cookingwi03f1-20";

export const ingredientAsins: Record<string, string> = {
  // ─── Vegetables ──────────────────────────────────────────────────────
  "heirloom carrot": "B07BHKP7Y5",
  "carrot": "B0787Y4YCW",
  "black radish": "B08FWKJHQR",
  "daikon": "B07V5J6LQM",
  "beet": "B07BHKM2QN",
  "beetroot": "B07BHKM2QN",
  "sweet potato": "B0787WYN5T",
  "potato": "B0787YC4M5",
  "parsnip": "B07PQ1D5WK",
  "turnip": "B07BHKFZ5T",
  "rutabaga": "B08FWKJHQR",
  "ginger": "B07V5H2JNY",
  "turmeric": "B07V5H3DMS",
  "onion": "B0787XCFMT",
  "red onion": "B0787XCFMT",
  "yellow onion": "B0787XCFMT",
  "white onion": "B0787XCFMT",
  "shallot": "B07BHKJ1LQ",
  "garlic": "B0787YSB1Y",
  "leek": "B07PQ1DRGM",
  "scallion": "B07PQ1C74B",
  "green onion": "B07PQ1C74B",
  "chive": "B07PQ1C74B",
  "celery": "B0787XC6RP",
  "broccoli": "B0787XHMPJ",
  "cauliflower": "B0787XHMPJ",
  "brussels sprout": "B07PQ1FFG4",
  "cabbage": "B0787X94VH",
  "kale": "B0787X7KQN",
  "spinach": "B0787X7MJ5",
  "arugula": "B07PQ1FQJN",
  "lettuce": "B0787X7DG6",
  "romaine": "B0787X7DG6",
  "swiss chard": "B07PQ1GYJ8",
  "collard greens": "B07PQ1GYJ8",
  "tomato": "B0787XDSZL",
  "cherry tomato": "B0787XDSZL",
  "bell pepper": "B0787XC6KP",
  "red pepper": "B0787XC6KP",
  "green pepper": "B0787XC6KP",
  "jalapeno": "B07PQ1D1BG",
  "serrano pepper": "B07PQ1D1BG",
  "habanero": "B07PQ1D1BG",
  "poblano": "B07PQ1D1BG",
  "eggplant": "B07PQ1DRGM",
  "zucchini": "B0787X94VH",
  "yellow squash": "B0787X94VH",
  "butternut squash": "B07PQ1FQJN",
  "acorn squash": "B07PQ1FQJN",
  "pumpkin": "B07PQ1FQJN",
  "cucumber": "B0787X7KQN",
  "corn": "B0787XHMPJ",
  "asparagus": "B0787X7DG6",
  "artichoke": "B07PQ1GYJ8",
  "mushroom": "B0787XDSZL",
  "shiitake": "B07BHKJ1LQ",
  "portobello": "B0787XDSZL",
  "cremini": "B0787XDSZL",
  "oyster mushroom": "B07BHKJ1LQ",
  "pea": "B07PQ1FFG4",
  "green bean": "B0787X94VH",
  "snap pea": "B07PQ1FFG4",
  "edamame": "B00BNXYKP2",
  "fennel": "B07PQ1GYJ8",
  "radish": "B07PQ1D1BG",
  "watercress": "B07PQ1GYJ8",
  "bok choy": "B07PQ1FQJN",

  // ─── Fruits ──────────────────────────────────────────────────────────
  "apple": "B0787YC45V",
  "banana": "B0787YC45V",
  "orange": "B0787YSB1Y",
  "lemon": "B0787YSB1Y",
  "lime": "B0787YSB1Y",
  "grapefruit": "B0787YSB1Y",
  "avocado": "B0787XCFMT",
  "mango": "B07V5H2JNY",
  "pineapple": "B07V5H3DMS",
  "strawberry": "B0787X7MJ5",
  "blueberry": "B0787X7MJ5",
  "raspberry": "B0787X7MJ5",
  "blackberry": "B0787X7MJ5",
  "grape": "B0787XC6RP",
  "peach": "B07PQ1C74B",
  "plum": "B07PQ1C74B",
  "cherry": "B07PQ1C74B",
  "pear": "B0787YC45V",
  "watermelon": "B07PQ1DRGM",
  "cantaloupe": "B07PQ1DRGM",
  "honeydew": "B07PQ1DRGM",
  "coconut": "B07N4F1HCM",
  "pomegranate": "B07V5J6LQM",
  "fig": "B07V5J6LQM",
  "date": "B074H5G5GT",
  "papaya": "B07V5H2JNY",
  "passion fruit": "B07V5H3DMS",
  "kiwi": "B07PQ1D5WK",
  "dragonfruit": "B07V5J6LQM",

  // ─── Proteins ────────────────────────────────────────────────────────
  "chicken breast": "B07BHKP7Y5",
  "chicken thigh": "B07BHKP7Y5",
  "whole chicken": "B07BHKP7Y5",
  "ground beef": "B07BHKM2QN",
  "beef steak": "B09B94T6BZ",
  "ribeye": "B09B94T6BZ",
  "sirloin": "B09B94T6BZ",
  "ground turkey": "B07BHKFZ5T",
  "turkey breast": "B07BHKFZ5T",
  "pork chop": "B07BHKJ1LQ",
  "pork tenderloin": "B07BHKJ1LQ",
  "ground pork": "B07BHKJ1LQ",
  "bacon": "B0787YSB1Y",
  "lamb": "B09B94T6BZ",
  "duck": "B09B94T6BZ",
  "salmon": "B074H5G5GT",
  "tuna": "B074H5G5GT",
  "shrimp": "B07N4F1HCM",
  "cod": "B074H5G5GT",
  "tilapia": "B074H5G5GT",
  "halibut": "B074H5G5GT",
  "scallop": "B07N4F1HCM",
  "crab": "B07N4F1HCM",
  "lobster": "B07N4F1HCM",
  "tofu": "B00BNXYKP2",
  "tempeh": "B00BNXYKP2",
  "seitan": "B00BNXYKP2",
  "egg": "B0787YC4M5",
  "eggs": "B0787YC4M5",

  // ─── Grains & Pasta ──────────────────────────────────────────────────
  "rice": "B074H5G5GT",
  "white rice": "B074H5G5GT",
  "brown rice": "B074H5G5GT",
  "jasmine rice": "B07V5J6LQM",
  "basmati rice": "B07V5J6LQM",
  "quinoa": "B00BNXYKP2",
  "oat": "B00BNXYKP2",
  "oats": "B00BNXYKP2",
  "barley": "B00BNXYKP2",
  "farro": "B00BNXYKP2",
  "couscous": "B074H5G5GT",
  "bulgur": "B074H5G5GT",
  "pasta": "B0787XHMPJ",
  "spaghetti": "B0787XHMPJ",
  "penne": "B0787XHMPJ",
  "linguine": "B0787XHMPJ",
  "ramen noodles": "B07V5H2JNY",
  "rice noodles": "B07V5H2JNY",
  "udon": "B07V5H2JNY",
  "bread": "B0787YC45V",
  "flour": "B0787XDSZL",
  "all-purpose flour": "B0787XDSZL",
  "bread flour": "B0787XDSZL",
  "cornmeal": "B0787XHMPJ",
  "polenta": "B0787XHMPJ",

  // ─── Dairy & Eggs ────────────────────────────────────────────────────
  "milk": "B0787YC4M5",
  "whole milk": "B0787YC4M5",
  "heavy cream": "B0787YC4M5",
  "butter": "B0787X7MJ5",
  "unsalted butter": "B0787X7MJ5",
  "cream cheese": "B0787X7DG6",
  "yogurt": "B0787XC6RP",
  "greek yogurt": "B0787XC6RP",
  "sour cream": "B0787X7DG6",
  "parmesan": "B07BHKP7Y5",
  "mozzarella": "B07BHKM2QN",
  "cheddar": "B07BHKFZ5T",
  "goat cheese": "B07BHKJ1LQ",
  "feta": "B07BHKJ1LQ",
  "ricotta": "B07BHKM2QN",
  "brie": "B07BHKJ1LQ",
  "gruyere": "B07BHKJ1LQ",
  "mascarpone": "B07BHKM2QN",

  // ─── Herbs (Fresh & Dried) ───────────────────────────────────────────
  "basil": "B07V5H2JNY",
  "fresh basil": "B07V5H2JNY",
  "cilantro": "B07V5H3DMS",
  "parsley": "B07V5H3DMS",
  "flat-leaf parsley": "B07V5H3DMS",
  "rosemary": "B000WS1KHM",
  "thyme": "B000WS1KHM",
  "oregano": "B000WS1KHM",
  "sage": "B000WS1KHM",
  "mint": "B07V5H2JNY",
  "dill": "B07V5H3DMS",
  "tarragon": "B000WS1KHM",
  "chives": "B07V5H3DMS",
  "bay leaf": "B000WS1KHM",
  "bay leaves": "B000WS1KHM",
  "lemongrass": "B07V5H2JNY",
  "lavender": "B000WS1KHM",

  // ─── Spices ──────────────────────────────────────────────────────────
  "cumin": "B006YOC0GC",
  "ground cumin": "B006YOC0GC",
  "coriander": "B006YOC0GC",
  "paprika": "B006YOC0GC",
  "smoked paprika": "B006YOC0GC",
  "cayenne pepper": "B006YOC0GC",
  "chili powder": "B006YOC0GC",
  "turmeric powder": "B00HKGN3DO",
  "ginger powder": "B00HKGN3DO",
  "cinnamon": "B00HKGN3DO",
  "ground cinnamon": "B00HKGN3DO",
  "nutmeg": "B00HKGN3DO",
  "clove": "B00HKGN3DO",
  "cloves": "B00HKGN3DO",
  "cardamom": "B00HKGN3DO",
  "star anise": "B00HKGN3DO",
  "allspice": "B00HKGN3DO",
  "black pepper": "B006YOC0GC",
  "white pepper": "B006YOC0GC",
  "saffron": "B07V5J6LQM",
  "sumac": "B07V5H2JNY",
  "za'atar": "B07V5H2JNY",
  "garam masala": "B00HKGN3DO",
  "curry powder": "B00HKGN3DO",
  "five spice": "B00HKGN3DO",
  "fennel seed": "B006YOC0GC",
  "mustard seed": "B006YOC0GC",
  "red pepper flakes": "B006YOC0GC",
  "crushed red pepper": "B006YOC0GC",
  "vanilla": "B07V5J6LQM",
  "vanilla extract": "B07V5J6LQM",

  // ─── Oils ────────────────────────────────────────────────────────────
  "olive oil": "B004ULUVU4",
  "extra virgin olive oil": "B004ULUVU4",
  "vegetable oil": "B0014CZFSI",
  "canola oil": "B0014CZFSI",
  "coconut oil": "B00DS842HS",
  "sesame oil": "B003VSCQQ6",
  "avocado oil": "B01MYEM0DP",
  "peanut oil": "B0014CZFSI",
  "grapeseed oil": "B01MYEM0DP",
  "walnut oil": "B01MYEM0DP",
  "truffle oil": "B01MYEM0DP",
  "ghee": "B00DS842HS",

  // ─── Vinegars & Acids ────────────────────────────────────────────────
  "balsamic vinegar": "B003VSCQQ6",
  "apple cider vinegar": "B003VSCQQ6",
  "red wine vinegar": "B003VSCQQ6",
  "white wine vinegar": "B003VSCQQ6",
  "rice vinegar": "B003VSCQQ6",
  "sherry vinegar": "B003VSCQQ6",
  "distilled white vinegar": "B003VSCQQ6",
  "lemon juice": "B0787YSB1Y",
  "lime juice": "B0787YSB1Y",

  // ─── Seasonings & Condiments ─────────────────────────────────────────
  "salt": "B000EITYUU",
  "sea salt": "B000EITYUU",
  "kosher salt": "B000EITYUU",
  "soy sauce": "B0005XOWUU",
  "fish sauce": "B0005XOWUU",
  "worcestershire sauce": "B0005XOWUU",
  "hot sauce": "B0005XOWUU",
  "sriracha": "B0005XOWUU",
  "dijon mustard": "B0005XOWUU",
  "yellow mustard": "B0005XOWUU",
  "mayonnaise": "B0005XOWUU",
  "ketchup": "B0005XOWUU",
  "tomato paste": "B0787XDSZL",
  "tomato sauce": "B0787XDSZL",
  "canned tomatoes": "B0787XDSZL",
  "coconut milk": "B07N4F1HCM",
  "tahini": "B00BNXYKP2",
  "miso": "B0005XOWUU",
  "miso paste": "B0005XOWUU",
  "hoisin sauce": "B0005XOWUU",
  "oyster sauce": "B0005XOWUU",
  "maple syrup": "B074H5G5GT",
  "honey": "B074H5G5GT",
  "sugar": "B0787XDSZL",
  "brown sugar": "B0787XDSZL",
  "molasses": "B074H5G5GT",
  "baking soda": "B0787XDSZL",
  "baking powder": "B0787XDSZL",
  "cornstarch": "B0787XDSZL",
  "gelatin": "B0787XDSZL",
  "yeast": "B0787XDSZL",
  "cocoa powder": "B074H5G5GT",
  "chocolate": "B074H5G5GT",
  "peanut butter": "B00BNXYKP2",
  "almond butter": "B00BNXYKP2",
  "broth": "B0787XHMPJ",
  "chicken broth": "B0787XHMPJ",
  "vegetable broth": "B0787XHMPJ",
  "beef broth": "B0787XHMPJ",
  "stock": "B0787XHMPJ",

  // ─── Nuts & Seeds ────────────────────────────────────────────────────
  "almond": "B00BNXYKP2",
  "almonds": "B00BNXYKP2",
  "walnut": "B00BNXYKP2",
  "walnuts": "B00BNXYKP2",
  "cashew": "B00BNXYKP2",
  "cashews": "B00BNXYKP2",
  "pistachio": "B00BNXYKP2",
  "pistachios": "B00BNXYKP2",
  "pecan": "B00BNXYKP2",
  "pecans": "B00BNXYKP2",
  "pine nut": "B00BNXYKP2",
  "pine nuts": "B00BNXYKP2",
  "sesame seed": "B006YOC0GC",
  "sesame seeds": "B006YOC0GC",
  "sunflower seed": "B00BNXYKP2",
  "pumpkin seed": "B00BNXYKP2",
  "chia seed": "B00BNXYKP2",
  "chia seeds": "B00BNXYKP2",
  "flax seed": "B00BNXYKP2",
  "hemp seed": "B00BNXYKP2",

  // ─── Legumes (Dried / Canned) ────────────────────────────────────────
  "black beans": "B0787XHMPJ",
  "kidney beans": "B0787XHMPJ",
  "chickpeas": "B0787XHMPJ",
  "garbanzo beans": "B0787XHMPJ",
  "lentils": "B00BNXYKP2",
  "red lentils": "B00BNXYKP2",
  "green lentils": "B00BNXYKP2",
  "split peas": "B00BNXYKP2",
  "navy beans": "B0787XHMPJ",
  "pinto beans": "B0787XHMPJ",
  "white beans": "B0787XHMPJ",
  "cannellini beans": "B0787XHMPJ",
};

/**
 * Resolve an ASIN for an ingredient name.
 * Attempts exact match first, then normalized match.
 */
export function resolveAsin(ingredientName: string): string | null {
  if (!ingredientName) return null;

  let normalized = ingredientName.toLowerCase().trim();
  
  // 1. Check exact match immediately
  if (ingredientAsins[normalized]) return ingredientAsins[normalized];

  // 2. Remove common culinary prefixes and suffixes
  normalized = normalized
    .replace(/^(fresh|dried|ground|powdered|organic|large|small|medium|cup|clove|teaspoon|tablespoon|lb|oz|g|kg|half)\s+/g, '')
    .replace(/\s+(fresh|dried|ground|powdered|organic|large|small|medium|zest|peeled|chopped|sliced|diced|minced)$/g, '');

  if (ingredientAsins[normalized]) return ingredientAsins[normalized];

  // 3. Handle plurals (s, es, ies)
  if (normalized.endsWith("s")) {
    // ies -> y (berries -> berry)
    if (normalized.endsWith("ies")) {
      const singularY = `${normalized.slice(0, -3)}y`;
      if (ingredientAsins[singularY]) return ingredientAsins[singularY];
    }
    // es -> e (potatoes -> potato, tomatoes -> tomato)
    if (normalized.endsWith("es")) {
      const singularE = normalized.slice(0, -2);
      if (ingredientAsins[singularE]) return ingredientAsins[singularE];
    }
    // s -> "" (onions -> onion)
    const singularS = normalized.slice(0, -1);
    if (ingredientAsins[singularS]) return ingredientAsins[singularS];
  }

  // 4. Try partial match on last word (often the base ingredient)
  const words = normalized.split(/\s+/);
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    if (ingredientAsins[lastWord]) return ingredientAsins[lastWord];
  }

  return null;
}
