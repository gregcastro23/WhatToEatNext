import type { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import type { z } from "zod";

/**
 * Featured Recipe of the Month — surfaced in the home-page Promotion block.
 *
 * The object below is typed against the canonical `cosmicRecipeSchema`, so the
 * TypeScript compiler enforces strict schema compliance at build time and the
 * raw value is safe to POST server-to-server to any `CosmicRecipe` consumer.
 *
 * Authoring metadata (designation, author agent, status) lives in
 * `FEATURED_RECIPE_META` rather than inside the recipe payload — the
 * `CosmicRecipe` schema has no fields for those, so folding them in would break
 * strict validation. The Promotion UI reads them from the meta object instead.
 */
export type CosmicRecipe = z.infer<typeof cosmicRecipeSchema>;

export const FEATURED_RECIPE_META = {
  designation: "Featured Recipe of the Month",
  authorAgent: "@mercury.agentic.alchm.kitchen",
  status: "Production Ready",
} as const;

export const featuredRecipe: CosmicRecipe = {
  id: "modernized-pasta-primavera-alchm-edition",
  title: "Modernized Pasta Primavera (Alchm Edition)",
  short_description:
    "A bright, spring-forward primavera where a slow-sweated allium trio, a chili-sparked tomato base, and ribbons of asparagus, peas, and carrot are bound in a glossy starch emulsion and finished with vibrant green tarragon oil. Composed under a Mercury-led sky for additive, never-opposed Water–Earth co-dominance — a tomato-and-wine body grounded by pasta and sweet roots.",
  category: "Dinner",
  cuisine: "Italian-American",
  difficulty: "intermediate",
  yields: 4,
  total_time: 45,
  alignment_score: {
    overall: 92,
    ingredients_fit: 95,
    diet_fit: 88,
    time_fit: 90,
    astro_fit: 94,
  },
  alignment_notes: [
    "Vegetarian as written; contains dry white wine and Pecorino Romano (not vegan or alcohol-free) — see substitutions for vegan and zero-alcohol paths.",
    "Elemental balance reads as Water–Earth co-dominant: the tomato-and-wine body (Water) and the pasta-and-root structure (Earth) reinforce each other, with the chili spark additive and never opposed (No Oppositions protocol).",
    "Total time ~45 min — the tomato simmer and the pasta boil are run concurrently to keep active time tight.",
    "Mafaldine's ruffled edges are chosen for maximum surface area to grip the starchy emulsion; pappardelle or fettuccine substitute cleanly.",
    "Pecorino is assertively salty — season the sauce lightly and adjust only at the very end.",
  ],
  tags: {
    diet: ["vegetarian"],
    cuisine: ["Italian", "Italian-American"],
    meal_type: "Dinner",
    flavor_profile: [
      "bright",
      "savory",
      "umami",
      "sweet",
      "herbaceous",
      "gently spicy",
    ],
    cooking_methods: ["sauté", "deglaze", "simmer", "boil", "emulsify"],
    elements: ["water", "earth", "air", "fire"],
    planets: ["Mercury", "Venus", "Moon"],
  },
  ingredients: [
    {
      name: "Extra-virgin olive oil",
      quantity: "3",
      unit: "tbsp",
      household_description: "a generous glug",
      optional: false,
      substitutions: [
        "Avocado oil — neutral and high-smoke-point, but mutes the fruity Venusian top-notes",
      ],
    },
    {
      name: "Yellow onion, finely diced",
      quantity: "1",
      unit: "medium",
      household_description: "about 1 cup diced",
      optional: false,
      substitutions: [
        "White onion — sharper and brighter, adds more volatile Air",
      ],
    },
    {
      name: "Spring leek, white and pale-green parts, thinly sliced",
      quantity: "1",
      unit: "medium",
      household_description: "about 1 cup sliced",
      optional: false,
      substitutions: [
        "Extra onion — workable, but loses the delicate spring sweetness",
      ],
    },
    {
      name: "Shallots, minced",
      quantity: "2",
      unit: "medium",
      household_description: "about 1/4 cup minced",
      optional: false,
      substitutions: [
        "1 extra garlic clove — deeper and more pungent, less floral",
      ],
    },
    {
      name: "Crushed red chili flakes",
      quantity: "0.5",
      unit: "tsp",
      household_description: "to taste — the catalyst, not the headline",
      optional: false,
      substitutions: [
        "Aleppo pepper — fruitier and gentler Fire",
        "Calabrian chili paste — rounder, more savory heat",
      ],
    },
    {
      name: "Dry Italian white wine (Pinot Grigio or Vermentino)",
      quantity: "0.75",
      unit: "cup",
      household_description: "crisp and dry, nothing oaked",
      optional: false,
      substitutions: [
        "Dry vermouth — more herbaceous",
        "Low-sodium vegetable stock + 1 tsp white wine vinegar — alcohol-free, brighter",
      ],
    },
    {
      name: "Canned Italian crushed tomatoes",
      quantity: "400",
      unit: "g",
      household_description: "about 1 can",
      optional: false,
      substitutions: [
        "Tomato passata — smoother and less rustic in body",
      ],
    },
    {
      name: "Heirloom cherry tomatoes, halved",
      quantity: "250",
      unit: "g",
      household_description: "about 1 1/2 cups",
      optional: false,
      substitutions: [
        "Vine tomatoes, diced — softer, holds less structural identity",
      ],
    },
    {
      name: "Mafaldine pasta",
      quantity: "350",
      unit: "g",
      household_description: "ruffled-edge ribbon pasta",
      optional: false,
      substitutions: [
        "Pappardelle or fettuccine — high surface area for the emulsion",
        "Gluten-free mafaldine or fusilli — to make the dish gluten-free",
      ],
    },
    {
      name: "English sweet peas (fresh or frozen)",
      quantity: "150",
      unit: "g",
      household_description: "about 1 cup",
      optional: false,
      substitutions: [
        "Shelled edamame — firmer and nuttier, more grounding Earth",
      ],
    },
    {
      name: "Carrots, fine matchsticks (julienne)",
      quantity: "2",
      unit: "medium",
      household_description: "about 1 cup julienned",
      optional: false,
      substitutions: [
        "Keep as written — carrots are the central Earth/Water vector",
      ],
    },
    {
      name: "Asparagus, shaved into ribbons",
      quantity: "200",
      unit: "g",
      household_description: "about 1 bunch",
      optional: false,
      substitutions: [
        "Shaved zucchini ribbons — milder, leans more Water",
      ],
    },
    {
      name: "Pecorino Romano, freshly grated",
      quantity: "60",
      unit: "g",
      household_description: "about 3/4 cup, plus more to finish",
      optional: false,
      substitutions: [
        "Parmigiano-Reggiano — nuttier, less sharp and salty",
        "Aged vegan hard cheese — for a vegan version",
      ],
    },
    {
      name: "House-made blanched tarragon oil",
      quantity: "2",
      unit: "tbsp",
      household_description: "vibrant green, temperature-controlled extraction",
      optional: false,
      substitutions: [
        "Basil oil — sweeter, without the anise note",
        "Good olive oil + finely chopped tarragon — simpler, less vivid color",
      ],
    },
    {
      name: "Fresh tarragon micro-leaves",
      quantity: "1",
      unit: "tbsp",
      household_description: "a small handful, for garnish",
      optional: true,
      substitutions: [
        "Chervil or flat-leaf parsley — fresh and green, without the anise",
      ],
    },
    {
      name: "Fine sea salt",
      quantity: "1",
      unit: "tsp",
      household_description: "to taste, plus generously for the pasta water",
      optional: false,
      substitutions: [],
    },
    {
      name: "Reserved starchy pasta cooking water",
      quantity: "0.5",
      unit: "cup",
      household_description: "ladled from the pot before draining",
      optional: false,
      substitutions: [],
    },
  ],
  steps: [
    {
      step_number: 1,
      instruction:
        "Warm the olive oil in a wide, heavy skillet over medium-low heat. Add the diced onion, sliced leek, minced shallot, and chili flakes. Sweat slowly, stirring often, until everything is soft, translucent, and sweet — never browned.",
      time_minutes: 8,
      cooking_method: "sauté",
      tips: [
        "Keep the heat medium-low: browning the alliums trades their volatile Air sweetness for bitterness.",
        "Add a pinch of salt early to draw out moisture and prevent any coloring.",
      ],
    },
    {
      step_number: 2,
      instruction:
        "Raise the heat to medium-high and pour in the white wine, scraping up the fond from the bottom of the pan. Reduce aggressively until only about one-third of the liquid remains and the raw-alcohol smell has cooked off.",
      time_minutes: 5,
      cooking_method: "deglaze",
      tips: [
        "Reducing by two-thirds locks in the wine's aromatic esters without leaving a boozy edge.",
        "Use a wooden spoon to lift the fond — that browned film is concentrated flavor.",
      ],
    },
    {
      step_number: 3,
      instruction:
        "Stir in the canned crushed tomatoes and a pinch of salt. Simmer gently to build a cohesive, glossy sauce layer. In the final 2 minutes, fold in the halved cherry tomatoes so they soften but keep their structural identity.",
      time_minutes: 12,
      cooking_method: "simmer",
      tips: [
        "Hold a gentle simmer, not a hard boil — boiling makes the canned tomato taste tinny.",
        "Add the fresh cherry tomatoes late so they burst slightly but don't collapse into the sauce.",
      ],
    },
    {
      step_number: 4,
      instruction:
        "Meanwhile, cook the mafaldine in well-salted boiling water until 2 minutes shy of al dente. Reserve 1/2 cup of the starchy cooking water, then transfer the pasta directly into the tomato-allium base.",
      time_minutes: 9,
      cooking_method: "boil",
      tips: [
        "Salt the pasta water like the sea — it's the pasta's only chance to season from within.",
        "Move the pasta straight from pot to pan; the clinging starch is what tightens the emulsion.",
      ],
    },
    {
      step_number: 5,
      instruction:
        "Toss vigorously over medium heat, adding splashes of the reserved pasta water until the sauce turns glossy and clings to every ribbon. Fold in the sweet peas and carrot matchsticks.",
      time_minutes: 3,
      cooking_method: "emulsify",
      tips: [
        "The starchy water is the emulsifier — add it gradually until the sauce coats the back of a spoon.",
        "Peas and carrots go in here so they stay bright and just-tender, not mushy.",
      ],
    },
    {
      step_number: 6,
      instruction:
        "Pull the pan off the heat. Fold in the delicate shaved asparagus ribbons and a generous handful of grated Pecorino Romano, letting the residual heat just soften the asparagus.",
      time_minutes: 2,
      cooking_method: "no-cook",
      tips: [
        "Off the heat keeps the asparagus vivid and crisp-tender rather than gray.",
        "Adding the Pecorino away from direct heat keeps it creamy instead of clumping into strings.",
      ],
    },
    {
      step_number: 7,
      instruction:
        "Plate into warm bowls. Finish each portion with a precise drizzle of the vibrant green tarragon oil and a scatter of raw tarragon micro-leaves for aromatic complexity.",
      time_minutes: 2,
      cooking_method: "plate",
      tips: [
        "Warm bowls keep the emulsion loose and glossy all the way to the table.",
        "Drizzle the tarragon oil last so its color and aroma stay vivid on the plate.",
      ],
    },
  ],
  elementalBalance: {
    fire: 14,
    earth: 34,
    water: 35,
    air: 17,
  },
  nutrition: {
    calories: 520,
    protein: 17,
    carbohydrates: 78,
    fat: 16,
  },
  vitamins: ["Vitamin A", "Vitamin C", "Vitamin K", "Folate"],
  minerals: ["Potassium", "Calcium", "Iron", "Manganese"],
  finishing_and_serving: {
    garnish_and_plating:
      "Twirl into warm shallow bowls and finish with a precise drizzle of vibrant green tarragon oil, a scatter of raw tarragon micro-leaves, and an extra shaving of Pecorino Romano.",
    doneness_cues:
      "The sauce should be glossy and cling to the pasta without pooling; peas and carrots bright and just-tender; asparagus crisp-tender from residual heat alone.",
    serving_suggestions:
      "Serve immediately with a crisp glass of the same Pinot Grigio or Vermentino and a simple bitter-green salad.",
  },
  leftovers_and_storage: {
    can_store: true,
    storage_instructions:
      "Cool quickly and refrigerate in an airtight container. Reheat gently with a splash of water to re-loosen the emulsion; add the tarragon oil and fresh micro-leaves only after reheating.",
    storage_lifespan_days: 3,
  },
  astro_explanation: {
    summary:
      "Composed under a Mercury-led spring sky, this primavera channels Mercury's quick, volatile air through the allium trio and Venus's grounded sweetness through the roots, while the Moon lends the tomato-and-wine base its Water body — an additive, self-reinforcing Water–Earth balance with no elemental opposition, a contained chili spark lifting it rather than opposing it.",
    correspondences: [
      "Mercury (@mercury.agentic.alchm.kitchen) governs the volatile Air matrix — onion, leek, and shallot sweated low and slow to release their aromatic, communicative top-notes.",
      "Venus rules the foundational Earth/Water sweetness of carrots and English peas, grounding the dish and amplifying its natural sugars.",
      "The Moon carries the dish's Water body — crushed and cherry tomatoes, the white-wine reduction, and the glossy starch emulsion that binds every ribbon.",
      "Water and Earth read as co-dominant: the tomato-and-wine body and the pasta-and-root structure reinforce each other, with Air carrying aroma and a measured chili spark lifting the sweetness rather than opposing it (the No Oppositions protocol).",
      "Tarragon's anise-bright finish is an aerial, Mercurial flourish that lifts the whole plate at the moment of serving.",
    ],
  },
};
