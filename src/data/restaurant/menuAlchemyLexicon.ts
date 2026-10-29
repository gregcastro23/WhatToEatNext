/**
 * Client-safe culinary ingredient, technique & texture lexicon.
 * Pure TypeScript functions with zero node/pg dependencies.
 *
 * @file src/data/restaurant/menuAlchemyLexicon.ts
 */

export type ElementType = "Fire" | "Water" | "Earth" | "Air";

export const INGREDIENT_LEXICON: Array<{
  name: string;
  regex: RegExp;
  element: ElementType;
}> = [
  // Aromatics & Herbs
  { name: "Black Garlic", regex: /\bblack garlic\b/i, element: "Fire" },
  { name: "Garlic", regex: /\bgarlic\b/i, element: "Fire" },
  { name: "Ginger", regex: /\bginger\b/i, element: "Fire" },
  { name: "Shallots", regex: /\bshallots?\b/i, element: "Fire" },
  { name: "Charred Scallions", regex: /\bcharred scallions?\b/i, element: "Fire" },
  { name: "Scallions", regex: /\bscallions?|green onions?\b/i, element: "Air" },
  { name: "Rosemary", regex: /\brosemary\b/i, element: "Fire" },
  { name: "Thyme", regex: /\bthyme\b/i, element: "Earth" },
  { name: "Genovese Basil", regex: /\b(?:genovese )?basil\b/i, element: "Air" },
  { name: "Cilantro", regex: /\bcilantro|coriander\b/i, element: "Air" },
  { name: "Mint", regex: /\bmint\b/i, element: "Air" },
  { name: "Oregano", regex: /\boregano\b/i, element: "Earth" },
  { name: "Dill", regex: /\bdill\b/i, element: "Air" },
  { name: "Fennel Pollen", regex: /\bfennel pollen|wild fennel\b/i, element: "Air" },
  { name: "Parsley", regex: /\bparsley\b/i, element: "Air" },

  // Spices & Chilies
  { name: "Black Truffle", regex: /\b(?:black )?truffles?\b/i, element: "Earth" },
  { name: "Tellicherry Pepper", regex: /\btellicherry|black pepper|peppercorn\b/i, element: "Fire" },
  { name: "Charred Habanero", regex: /\bhabanero\b/i, element: "Fire" },
  { name: "Jalapeño", regex: /\bjalape[nñ]o\b/i, element: "Fire" },
  { name: "Poblano Chili", regex: /\bpoblano\b/i, element: "Fire" },
  { name: "Guajillo Chili", regex: /\bguajillo\b/i, element: "Fire" },
  { name: "Achiote", regex: /\bachiote\b/i, element: "Fire" },
  { name: "Saffron", regex: /\bsaffron\b/i, element: "Fire" },
  { name: "Smoked Paprika", regex: /\b(?:smoked )?paprika\b/i, element: "Fire" },
  { name: "Cumin", regex: /\bcumin\b/i, element: "Earth" },
  { name: "Chili Oil", regex: /\bchili oil|rayu\b/i, element: "Fire" },

  // Vegetables & Mushrooms
  { name: "Wild Mushrooms", regex: /\b(?:wild )?mushrooms?|porcini|chanterelle|morel\b/i, element: "Earth" },
  { name: "Shiitake", regex: /\bshiitake\b/i, element: "Earth" },
  { name: "San Marzano Tomatoes", regex: /\bsan marzano|tomatoes?|pomodoro\b/i, element: "Fire" },
  { name: "Avocado", regex: /\bavocado|guacamole\b/i, element: "Earth" },
  { name: "Castelvetrano Olives", regex: /\b(?:castelvetrano )?olives?\b/i, element: "Earth" },
  { name: "Blood Orange", regex: /\bblood orange|citrus|orange\b/i, element: "Air" },
  { name: "Meyer Lemon", regex: /\b(?:meyer )?lemon|yuzu\b/i, element: "Water" },
  { name: "Lime", regex: /\blime\b/i, element: "Water" },
  { name: "Arugula", regex: /\barugula|rocket\b/i, element: "Air" },

  // Grains, Pasta & Dough
  { name: "Egg Tagliolini", regex: /\btagliolini|tagliatelle|fettuccine|linguine|spaghetti|pasta\b/i, element: "Earth" },
  { name: "Carnaroli Risotto", regex: /\brisotto|carnaroli|arborio rice\b/i, element: "Earth" },
  { name: "Sourdough Crust", regex: /\bsourdough|pizza crust|focaccia|ciabatta\b/i, element: "Fire" },
  { name: "Heirloom Corn Tortillas", regex: /\b(?:heirloom )?corn tortillas?|masa\b/i, element: "Earth" },
  { name: "Alkaline Noodles", regex: /\b(?:alkaline )?ramen noodles?|soba|udon\b/i, element: "Water" },

  // Proteins & Seafood
  { name: "Wagyu Beef", regex: /\bwagyu|prime beef|short ribs?|steak|carne asada\b/i, element: "Earth" },
  { name: "Heritage Pork", regex: /\bheritage pork|al pastor|carnitas|chashu|pork belly|prosciutto\b/i, element: "Earth" },
  { name: "Branzino", regex: /\bbranzino|sea bass|snapper|halibut\b/i, element: "Water" },
  { name: "Wild Salmon", regex: /\bsalmon|trout\b/i, element: "Water" },
  { name: "Octopus", regex: /\boctopus|calamari|squid\b/i, element: "Water" },
  { name: "Jumbo Shrimp", regex: /\bshrimp|prawns?|gambas\b/i, element: "Water" },
  { name: "Organic Chicken", regex: /\bchicken|pollo|poultry\b/i, element: "Air" },

  // Dairy, Cheeses & Emulsions
  { name: "Buffalo Mozzarella", regex: /\b(?:buffalo )?mozzarella|burrata|stracciatella\b/i, element: "Water" },
  { name: "Parmigiano-Reggiano", regex: /\bparmigiano(?:-reggiano)?|parmesan|pecorino\b/i, element: "Earth" },
  { name: "Mountain Butter", regex: /\b(?:mountain )?butter\b/i, element: "Earth" },
  { name: "Bone Marrow", regex: /\bbone marrow\b/i, element: "Earth" },
  { name: "Extra Virgin Olive Oil", regex: /\b(?:extra virgin )?olive oil|agrumato\b/i, element: "Water" },
  { name: "Ajitsuke Tamago", regex: /\b(?:ajitsuke )?tamago|soft-boiled egg|ramen egg\b/i, element: "Water" },
  { name: "Tonkotsu Broth", regex: /\btonkotsu|pork broth|dashi|kombu\b/i, element: "Water" },
];

export const DISH_FEATURE_CHIPS = [
  "🔥 Charred / Wood-Fired",
  "✨ Velvety Sauce",
  "🌿 Fresh Herbaceous Finish",
  "🌶️ Perfect Heat Balance",
  "🍲 Hearty & Grounding",
  "🍋 Zesty & Bright",
  "🥩 Tender & Succulent",
  "🥣 Silky Broth",
];

export function extractIngredientsClient(name: string, description = ""): string[] {
  const combined = `${name} ${description}`.toLowerCase();
  const matched: string[] = [];

  const sortedLexicon = [...INGREDIENT_LEXICON].sort((a, b) => b.name.length - a.name.length);

  for (const entry of sortedLexicon) {
    if (entry.regex.test(combined)) {
      const isSubterm = matched.some((m) => m.toLowerCase().includes(entry.name.toLowerCase()));
      if (!isSubterm) {
        matched.push(entry.name);
      }
    }
  }

  if (matched.length === 0 && description) {
    const parts = description
      .split(/,|\bwith\b|\band\b/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 2 && p.length < 25);
    matched.push(...parts.slice(0, 4));
  }

  return Array.from(new Set(matched));
}
