/**
 * Kitchen tips for the homepage tip strip. Every tip names its basis.
 *
 * - METHOD tips are quoted verbatim from a cooking method's `expertTips` in
 *   src/data/cooking/methods. kitchenTips.provenance.test proves each one still
 *   round-trips to its source, so a tip can't drift from the method page it
 *   links to. Fix wording at the source, not here.
 * - CITED tips carry a public food-safety source. Every number in them was read
 *   off the linked page on 2026-11-24.
 * - HOUSE tips are kitchen practice and claim no number (the provenance test
 *   rejects a digit in one).
 */

export type MethodTipKey =
  | "roasting"
  | "frying"
  | "broiling"
  | "steaming"
  | "poaching"
  | "stewing"
  | "fermentation"
  | "gelification"
  | "spherification";

export interface CitedTip {
  text: string;
  source: string;
  url: string;
}

export interface HouseTip {
  text: string;
  href: string;
  linkLabel: string;
}

export const METHOD_TIP_PICKS: Readonly<Record<MethodTipKey, readonly string[]>> = {
  roasting: [
    "Dry brine large cuts with salt 24-48 hours before roasting for improved moisture retention and flavor penetration",
    "For crisp-skinned poultry, air-dry uncovered in refrigerator for 12-24 hours before roasting",
    "For perfect crackling on pork, ensure the skin is completely dry before roasting and score in a diamond pattern",
    "Use a two-temperature method for large cuts: start high (450°F) for 20 minutes, then reduce (325°F) until done",
    "Shield thin areas of poultry (wingtips, legs) with foil to prevent burning",
    "Apply glazes in the final 15-20 minutes to prevent burning",
    "When roasting vegetables, preheat the baking sheet for enhanced browning",
    "Apply different herbs at different stages: woody herbs (rosemary, thyme) from the beginning, tender herbs (parsley, basil) after cooking",
    "For whole birds, separate the skin from the breast meat and insert compound butter directly against the meat",
    "For juicier meat, roast bone-in and skin-on whenever possible",
  ],
  frying: [
    "Use fine table salt for immediate post-fry seasoning (adheres better than coarse salt)",
    "For extra-crispy batter, add a small amount (1 tsp per cup) of rice flour or cornstarch",
    "Use carbonated liquid (beer, seltzer) in batter to create additional bubbles and lightness",
    "For extremely crisp results, replace 10-20% of water in batter with vodka (evaporates faster)",
    "Never cover freshly fried foods, steam condenses and destroys crispness",
    "Drain fried items on wire racks instead of paper towels to prevent steam softening",
    "For tempura, do not overmix batter, lumps create lighter, crispier texture",
    "Filter oil through fine mesh and cheesecloth after each use to remove particles",
    "Apply glazes or sauces immediately after draining for better adherence",
    "Test oil readiness with wooden chopstick or bread cube (should bubble steadily, not violently)",
  ],
  broiling: [
    "Pat food dry before broiling to promote browning",
    "Preheat broiler for 5-10 minutes before cooking",
    "Position rack 3-6 inches from heating element depending on food thickness",
    "Watch food constantly as broiling can go from perfect to burnt in seconds",
    "Marinate lean cuts to maintain moisture during broiling",
  ],
  steaming: [
    "For leafy greens, steam them just until they turn bright green and begin to wilt (usually 1-2 minutes)",
    "When steaming layered dishes in bamboo steamers, place longest-cooking items in bottom layer",
    "Line bamboo steamers with cabbage leaves or parchment for delicate dumplings to prevent sticking",
    "For crisp-tender vegetables, immediately transfer to ice bath after steaming",
    "Maintain at least 1 inch of water in the steaming pot at all times to prevent burning",
    "Use citrus slices under fish to create a natural barrier and add subtle flavor",
    "For whole fish, score the thickest parts to ensure even cooking",
  ],
  poaching: [
    "For perfectly poached eggs, create a vortex in acidulated water before adding egg",
    "Add a splash of vinegar to poaching liquid for eggs (1 Tbsp per quart)",
    "Save and reduce poaching liquid for natural, flavorful sauces",
    "For chicken breasts, start in cold liquid and slowly bring to temperature",
    "Control poaching temperature precisely with an instant-read thermometer",
    "Strain and freeze poaching liquid for future use (label with date and ingredients)",
    "The wider and shallower the poaching vessel, the more even the cooking",
  ],
  stewing: [
    "Sear proteins before stewing to develop depth through Maillard reaction",
    "Add vegetables in stages according to their cooking times",
    "For richest flavor, cool completed stew and reheat the following day",
    "Use umami-rich ingredients (tomato paste, mushrooms) for depth",
    "Deglaze browning pan with wine or stock to capture all flavors",
    "Toast spices before adding to release aromatic compounds",
    "Reserve delicate herbs until final 10 minutes of cooking",
    "Add acid (wine, vinegar, citrus) to balance richness",
    "Cut ingredients to similar size for even cooking",
  ],
  fermentation: [
    "For vegetable ferments, use 2% salt by weight for optimal fermentation",
    "Weigh ferments down below brine level to maintain anaerobic conditions",
    "For kimchi, short fermentation (3-5 days) at room temperature followed by refrigeration creates balanced flavors",
    "For yogurt, pre-heat milk to 180°F (82°C) before cooling to incubation temperature to denature proteins",
    "Ferment chili peppers with 3-5% salt to develop complex hot sauce flavors",
  ],
  gelification: [
    "Pre-hydrate powdered hydrocolloids in cold liquids with sugar before heating to prevent clumping",
    "Set gels in silicone molds pre-sprayed with neutral oil for perfect release",
  ],
  spherification: [
    "Create a 'wash bath' of clean water to rinse spheres after calcium bath to remove bitter taste",
    "Use flavored oils to coat finished spheres and prevent them from sticking together",
  ],
};

const USDA_DANGER_ZONE =
  "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/danger-zone-40f-140f";
const USDA_TEMPERATURES =
  "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart";
const USDA_THAW =
  "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods";
const FDA_STORAGE = "https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely";
const FOODSAFETY_GOV = "https://www.foodsafety.gov/keep-food-safe/4-steps-to-food-safety";

export const CITED_TIPS: readonly CitedTip[] = [
  {
    text: "Between 40 °F and 140 °F bacteria can double in as little as 20 minutes. Keep cold food cold and hot food hot",
    source: "USDA FSIS",
    url: USDA_DANGER_ZONE,
  },
  {
    text: "Never leave perishable food out for more than 2 hours, or 1 hour when it's above 90 °F",
    source: "USDA FSIS",
    url: USDA_DANGER_ZONE,
  },
  {
    text: "Cool leftovers in shallow containers and get them into the fridge within two hours",
    source: "USDA FSIS",
    url: USDA_DANGER_ZONE,
  },
  {
    text: "Reheat leftovers to 165 °F, or until they're hot and steaming all the way through",
    source: "USDA FSIS",
    url: USDA_DANGER_ZONE,
  },
  {
    text: "Trust a thermometer, not the color: poultry is safe at 165 °F; beef and pork steaks, chops and roasts at 145 °F with a 3-minute rest",
    source: "USDA FSIS",
    url: USDA_TEMPERATURES,
  },
  {
    text: "Ground meat is safe at 160 °F and fish and shellfish at 145 °F, measured with a food thermometer",
    source: "USDA FSIS",
    url: USDA_TEMPERATURES,
  },
  {
    text: "Thaw in the fridge, in cold water changed every 30 minutes, or in the microwave. Never on the counter",
    source: "USDA FSIS",
    url: USDA_THAW,
  },
  {
    text: "Forgot to thaw? It's safe to cook food straight from frozen",
    source: "USDA FSIS",
    url: USDA_THAW,
  },
  {
    text: "Keep the fridge at 40 °F (4 °C) or below and the freezer at 0 °F (-18 °C). An appliance thermometer tells you for sure",
    source: "FDA",
    url: FDA_STORAGE,
  },
  {
    text: "Wash your hands with plain soap for at least 20 seconds, about two rounds of 'Happy Birthday'",
    source: "FoodSafety.gov",
    url: FOODSAFETY_GOV,
  },
  {
    text: "Use separate cutting boards for produce and for raw meat, poultry and seafood",
    source: "FoodSafety.gov",
    url: FOODSAFETY_GOV,
  },
];

export const HOUSE_TIPS: readonly HouseTip[] = [
  {
    text: "Taste as you go and season in layers, not all at the end",
    href: "/sauces",
    linkLabel: "Sauces",
  },
  {
    text: "When the best isn't on hand, the next best works if you think it through: swap by role, acid for acid and fat for fat",
    href: "/ingredients",
    linkLabel: "Ingredient index",
  },
  {
    text: "Read the whole recipe before you light the stove. Prep everything first and you're free to pay attention",
    href: "/recipe-builder",
    linkLabel: "Recipe builder",
  },
  {
    text: "Cook for whoever is at the table. Ask about allergies, diets and traditions before you plan the menu",
    href: "/menu-planner",
    linkLabel: "Menu planner",
  },
  {
    text: "Every cook can teach you something. Ask how their family makes it",
    href: "/cuisines",
    linkLabel: "Cuisine atlas",
  },
  {
    text: "Make the most of what you have: stems become pesto, bones become stock, stale bread becomes crumbs",
    href: "/pantry",
    linkLabel: "Your pantry",
  },
  {
    text: "Weigh instead of scooping. A scale is what makes a recipe repeatable",
    href: "/recipe-builder",
    linkLabel: "Recipe builder",
  },
  {
    text: "First in, first out: move older food to the front when you put the groceries away",
    href: "/pantry",
    linkLabel: "Your pantry",
  },
  {
    text: "Label and date everything that goes into the fridge or freezer",
    href: "/pantry",
    linkLabel: "Your pantry",
  },
  {
    text: "Shop for what's in season first, then decide what to cook",
    href: "/ingredients",
    linkLabel: "Ingredient index",
  },
  {
    text: "Teach one technique to someone this week. Explaining it sharpens your own",
    href: "/cooking-methods",
    linkLabel: "Cooking methods",
  },
  {
    text: "Keep your knives sharp. A sharp blade goes where you aim it; a dull one slips",
    href: "/cooking-methods",
    linkLabel: "Cooking methods",
  },
];
