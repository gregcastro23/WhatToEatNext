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
  authorAgent: "@mars.agentic.alchm.kitchen",
  status: "Production Ready",
} as const;

export const featuredRecipe: CosmicRecipe = {
  id: "chorizo-bolognese",
  title: "Chorizo Bolognese",
  short_description:
    "A slow-braised, chorizo-forward ragù grounded in Earth and lifted by a Fire heart: spicy fresh chorizo rendered in its own brick-red paprika oil, a soffritto softened in that fat, and a restrained tomato-and-red-wine base braised low and slow, then enriched with butter and milk and tossed through ridged rigatoni. Composed under a Mars-and-Saturn sky — Saturn's long braise and the pasta-and-cheese structure ground it in Earth, Mars's chorizo-and-paprika heat drives it, and the tomato-and-wine Water carries the body rather than opposing it (No Oppositions).",
  category: "Dinner",
  cuisine: "Fusion Italian-Spanish",
  difficulty: "intermediate",
  yields: 6,
  total_time: 120,
  alignment_score: {
    overall: 90,
    ingredients_fit: 94,
    diet_fit: 78,
    time_fit: 74,
    astro_fit: 95,
  },
  alignment_notes: [
    "Not vegetarian and contains dairy (butter, milk, Parmigiano, Pecorino). A vegan path (plant-based chorizo + finely chopped cremini + a splash of soy for umami; vegan butter, oat milk, and aged vegan hard cheese) is given in the substitutions and lands close on the Fire axis.",
    "Earth-grounded with a Fire heart: the rigatoni-and-cheese structure, the mounted butter, and Saturn's long braise make Earth the dominant element, with Water (tomato, wine, milk) close behind, while Mars's spicy chorizo, bloomed paprika, and chili drive the Fire. Under the No Oppositions protocol these elements reinforce one another rather than fighting.",
    "The crushed tomato is kept deliberately restrained (about 1 cup) so the ragù stays chorizo-led rather than turning into a tomato sauce.",
    "The braise is ~90 minutes and mostly hands-off; total time reflects a slow-cooked ragù, not a weeknight sauce.",
    "Rigatoni's ridges and hollow tubes are chosen to trap the chunky chorizo ragù; pappardelle or tagliatelle substitute cleanly.",
    "The Parmigiano-and-Pecorino blend is assertively salty — season the ragù lightly and adjust only at the very end, after the cheese is folded in.",
  ],
  tags: {
    diet: ["high-protein"],
    cuisine: ["Italian", "Spanish", "Fusion"],
    meal_type: "Dinner",
    flavor_profile: ["spicy", "smoky", "savory", "umami", "rich", "herbaceous"],
    cooking_methods: ["sauté", "deglaze", "simmer", "braise", "boil", "emulsify"],
    elements: ["earth", "water", "fire", "air"],
    planets: ["Mars", "Saturn", "Jupiter"],
  },
  ingredients: [
    {
      name: "Fresh Mexican chorizo, casings removed",
      quantity: "500",
      unit: "g",
      household_description: "about 1 lb, crumbled — the Fire heart of the dish",
      optional: false,
      substitutions: [
        "Plant-based chorizo + finely chopped cremini mushrooms — vegan; keeps the Fire, adds earthy umami",
        "Fresh Spanish chorizo, casing removed — smokier and less spicy, a rounder Fire",
      ],
    },
    {
      name: "Extra-virgin olive oil",
      quantity: "1",
      unit: "tbsp",
      household_description: "just enough to start the chorizo rendering",
      optional: false,
      substitutions: [
        "Avocado oil — neutral, higher smoke point, mutes the fruity top-notes",
      ],
    },
    {
      name: "Unsalted butter",
      quantity: "3",
      unit: "tbsp",
      household_description: "2 tbsp for the soffritto, 1 tbsp cold to mount the sauce",
      optional: false,
      substitutions: [
        "Ghee — nuttier, higher smoke point, no milk solids",
      ],
    },
    {
      name: "Yellow onion, finely diced",
      quantity: "1",
      unit: "medium",
      household_description: "about 1 cup diced",
      optional: false,
      substitutions: ["White onion — sharper and brighter, more volatile Air"],
    },
    {
      name: "Carrot, finely diced",
      quantity: "1",
      unit: "medium",
      household_description: "about 1/2 cup diced",
      optional: false,
      substitutions: ["Keep as written — carrot is the soffritto's sweet Earth vector"],
    },
    {
      name: "Celery, finely diced",
      quantity: "2",
      unit: "stalk",
      household_description: "about 1/2 cup diced",
      optional: false,
      substitutions: ["Fennel — anise-bright, leans more Air"],
    },
    {
      name: "Garlic, minced",
      quantity: "3",
      unit: "clove",
      household_description: "about 1 tbsp — raw, for the soffritto's pungency",
      optional: false,
      substitutions: ["Shallot — softer and more floral, less pungent Fire"],
    },
    {
      name: "Confit or roasted garlic cloves",
      quantity: "6",
      unit: "clove",
      household_description: "whole, soft and sweet — smashed into the braise for mellow depth",
      optional: false,
      substitutions: [
        "Slow-roasted garlic — deeper and caramelized, a touch more Earth",
      ],
    },
    {
      name: "Hot smoked paprika (pimentón picante)",
      quantity: "2",
      unit: "tsp",
      household_description: "bloomed in fat for a deeper, smokier Fire",
      optional: false,
      substitutions: [
        "Sweet smoked paprika + a pinch more chili — smokier, dial heat separately",
      ],
    },
    {
      name: "Crushed red chili flakes",
      quantity: "0.5",
      unit: "tsp",
      household_description: "the catalyst — adjust to heat tolerance",
      optional: false,
      substitutions: ["Aleppo pepper — fruitier, gentler Fire"],
    },
    {
      name: "Double-concentrated tomato paste",
      quantity: "3",
      unit: "tbsp",
      household_description: "caramelized for umami depth",
      optional: false,
      substitutions: ["Regular tomato paste — use a bit more; less concentrated"],
    },
    {
      name: "Canned crushed tomatoes",
      quantity: "250",
      unit: "g",
      household_description: "about 1 cup — kept restrained so the ragù stays chorizo-led",
      optional: false,
      substitutions: ["Tomato passata — smoother, less rustic body"],
    },
    {
      name: "Dry red wine",
      quantity: "0.5",
      unit: "cup",
      household_description: "robust and unoaked, e.g. Sangiovese or Tempranillo",
      optional: false,
      substitutions: [
        "Low-sodium beef or vegetable stock + 1 tsp red wine vinegar — alcohol-free",
      ],
    },
    {
      name: "Whole milk",
      quantity: "0.25",
      unit: "cup",
      household_description: "the classic bolognese enrichment",
      optional: false,
      substitutions: ["Unsweetened oat milk — for a dairy-lighter ragù"],
    },
    {
      name: "Bay leaf",
      quantity: "1",
      unit: "leaf",
      household_description: "whole, removed before serving",
      optional: false,
      substitutions: [],
    },
    {
      name: "Fresh oregano, chopped",
      quantity: "1",
      unit: "tbsp",
      household_description: "leaves only — added to the braise for a warm, resinous lift",
      optional: false,
      substitutions: [
        "Dried oregano — use 1 tsp; more concentrated, less green",
      ],
    },
    {
      name: "Ground nutmeg",
      quantity: "0.25",
      unit: "tsp",
      household_description: "a few fresh scrapes",
      optional: false,
      substitutions: ["Freshly grated whole nutmeg — brighter, more aromatic Air"],
    },
    {
      name: "Rigatoni",
      quantity: "400",
      unit: "g",
      household_description: "1 box — ridged tubes to trap the ragù",
      optional: false,
      substitutions: [
        "Pappardelle or tagliatelle — the traditional bolognese ribbons",
        "Gluten-free rigatoni — to make the dish gluten-free",
      ],
    },
    {
      name: "Parmigiano-Reggiano, freshly grated",
      quantity: "45",
      unit: "g",
      household_description: "about 1/2 cup — nutty, umami depth, plus more to finish",
      optional: false,
      substitutions: ["Grana Padano — milder and less expensive, similar nutty Earth"],
    },
    {
      name: "Pecorino Romano, freshly grated",
      quantity: "35",
      unit: "g",
      household_description: "about 1/2 cup — sharp, salty counterpoint to the Parmigiano",
      optional: false,
      substitutions: ["More Parmigiano — softer and less salty overall"],
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
      name: "Black pepper, freshly ground",
      quantity: "0.5",
      unit: "tsp",
      household_description: "to taste",
      optional: false,
      substitutions: [],
    },
    {
      name: "Fresh basil, torn",
      quantity: "2",
      unit: "tbsp",
      household_description: "a small handful, for garnish",
      optional: true,
      substitutions: ["Flat-leaf parsley — greener and grassier, without the sweetness"],
    },
    {
      name: "Oregano oil, for finishing",
      quantity: "1",
      unit: "tsp",
      household_description: "optional drizzle — a bright, herbaceous, aromatic lift",
      optional: true,
      substitutions: [
        "Good olive oil + a little extra fresh oregano — simpler, less intense",
      ],
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
        "Warm the olive oil in a wide, heavy pot over medium heat. Add the crumbled chorizo and cook, breaking it up, until browned and it has released its brick-red paprika oil. Do NOT drain — that rendered fat is the flavor base for everything that follows.",
      time_minutes: 10,
      cooking_method: "sauté",
      tips: [
        "Let the chorizo get some real color — the browned edges are concentrated Fire and umami.",
        "If the chorizo is very lean, leave all the fat; the soffritto cooks in it next.",
      ],
    },
    {
      step_number: 2,
      instruction:
        "Lower the heat to medium-low and melt 2 tbsp of the butter into the chorizo fat, then add the onion, carrot, and celery. Sweat slowly, stirring often, until soft and sweet — never browned. Add the minced garlic in the last minute.",
      time_minutes: 12,
      cooking_method: "sauté",
      tips: [
        "Butter melted into the paprika oil is the classic bolognese fat base — it rounds the chorizo's Fire and carries it through the whole ragù.",
        "Add the raw minced garlic last so it perfumes without scorching into bitterness — the confit cloves go in later for sweet depth.",
      ],
    },
    {
      step_number: 3,
      instruction:
        "Stir in the hot smoked paprika and chili flakes and toast for about 30 seconds until fragrant, then add the tomato paste. Cook, stirring, until the paste darkens a shade and smells sweet-roasted.",
      time_minutes: 4,
      cooking_method: "sauté",
      tips: [
        "Blooming the paprika in fat unlocks its color and smoky depth — don't let it burn.",
        "Caramelizing the paste builds a savory-sweet backbone before any liquid goes in.",
      ],
    },
    {
      step_number: 4,
      instruction:
        "Raise the heat to medium-high and pour in the red wine, scraping up the fond from the bottom of the pot. Reduce until nearly dry and the raw-alcohol smell has cooked off.",
      time_minutes: 6,
      cooking_method: "deglaze",
      tips: [
        "The fond is concentrated flavor — lift every bit with a wooden spoon.",
        "Reduce hard so the wine leaves depth, not a boozy edge.",
      ],
    },
    {
      step_number: 5,
      instruction:
        "Add the crushed tomatoes, the confit (or roasted) garlic cloves lightly smashed, the bay leaf, chopped fresh oregano, nutmeg, and a splash of water. Bring to a bare simmer, then cook low and slow, stirring occasionally and adding a little water if it looks dry, until deep, glossy, and unified.",
      time_minutes: 75,
      cooking_method: "simmer",
      tips: [
        "A bare simmer, not a boil — long and gentle is what turns chorizo and tomato into one ragù.",
        "Smash the confit garlic as it warms so it melts into the sauce as sweet, mellow depth against the chorizo's heat.",
        "Keep the tomato restrained; you want a meat sauce clinging to fat, not a tomato sauce.",
      ],
    },
    {
      step_number: 6,
      instruction:
        "Stir in the milk and let the ragù simmer gently to round the acidity into a silky, cohesive sauce. Taste and season with salt and pepper — go lightly, the Pecorino at the end is salty.",
      time_minutes: 15,
      cooking_method: "simmer",
      tips: [
        "Milk is the classic bolognese move — it softens the edges and gives a tender, velvety body.",
        "Season now but under-salt slightly; adjust only after the cheese goes in.",
      ],
    },
    {
      step_number: 7,
      instruction:
        "Meanwhile, cook the rigatoni in well-salted boiling water until just shy of al dente. Reserve 1/2 cup of the starchy cooking water, then transfer the pasta directly into the ragù with a splash of the water. Toss over medium heat, then swirl in the last 1 tbsp of cold butter until the sauce turns glossy and clings to every tube.",
      time_minutes: 12,
      cooking_method: "emulsify",
      tips: [
        "Salt the pasta water like the sea — it's the pasta's only chance to season from within.",
        "Mounting cold butter off a hard boil is what gives the ragù its final sheen — keep it moving so it emulsifies rather than splits.",
      ],
    },
    {
      step_number: 8,
      instruction:
        "Pull the pot off the heat and fold in the grated Parmigiano and Pecorino. Plate into warm bowls; finish each with more cheese, an optional drizzle of oregano oil, and a scatter of torn fresh basil.",
      time_minutes: 2,
      cooking_method: "plate",
      tips: [
        "Adding the cheeses off the heat keeps them creamy instead of clumping into strings.",
        "Drizzle the oregano oil and add the basil last so their color and aroma stay vivid on the plate.",
      ],
    },
  ],
  elementalBalance: {
    fire: 18,
    earth: 35,
    water: 31,
    air: 16,
  },
  nutrition: {
    calories: 720,
    protein: 32,
    carbohydrates: 60,
    fat: 40,
  },
  vitamins: ["Vitamin A", "Vitamin C", "Vitamin B12", "Niacin", "Vitamin K"],
  minerals: ["Iron", "Zinc", "Calcium", "Potassium", "Phosphorus"],
  finishing_and_serving: {
    garnish_and_plating:
      "Spoon into warm shallow bowls, letting the ragù pool in and around the rigatoni. Finish with a generous shaving of Parmigiano and Pecorino, an optional drizzle of oregano oil, and a scatter of torn fresh basil.",
    doneness_cues:
      "The ragù should be thick and glossy from the mounted butter, clinging to the pasta without watery pooling; the fat should read as chorizo-red, not orange-greasy; the rigatoni al dente with sauce caught inside the tubes.",
    serving_suggestions:
      "Serve immediately with a glass of the same robust red and a sharp, bitter-green salad to cut the richness.",
  },
  leftovers_and_storage: {
    can_store: true,
    storage_instructions:
      "The ragù keeps and deepens. Cool quickly and refrigerate in an airtight container; reheat gently with a splash of water to re-loosen. Store the ragù and pasta separately if you can, and add fresh herbs only after reheating.",
    storage_lifespan_days: 4,
  },
  astro_explanation: {
    summary:
      "Composed under a Mars-and-Saturn sky, this ragù is grounded in Earth — the rigatoni-and-cheese structure, the mounted butter, and Saturn's long, patient braise — with Water close behind in its tomato-and-wine body, and a Fire heart driven by Mars through the spicy chorizo and bloomed paprika. Earth steadies and Fire animates; the elements reinforce one another rather than opposing (the No Oppositions protocol), with Jupiter's butter-and-cheese richness rounding the whole.",
    correspondences: [
      "Saturn governs the dominant Earth — the rigatoni-and-cheese structure, the mounted butter, and the long, patient ~90-minute braise, with sweet, mellow confit garlic melted through it, that concentrates and grounds the sauce.",
      "Mars (@mars.agentic.alchm.kitchen) carries the Fire heart — the paprika-forward fresh chorizo, bloomed hot smoked paprika, and chili flakes that give the ragù its heat and drive.",
      "Water runs close behind Earth, in the crushed tomato, the red-wine reduction, and the milk enrichment that give the ragù its body — reinforcing the Earth and Fire rather than opposing them (the No Oppositions protocol).",
      "Jupiter lends abundance and richness — the butter melted into the base and mounted at the finish, and the generous Parmigiano-and-Pecorino that round the whole into a warm, expansive plate.",
      "Fresh oregano in the braise, a few scrapes of nutmeg, and torn basil and oregano oil at the finish are an aerial, aromatic lift — the Air that keeps a rich, grounding ragù from feeling leaden.",
    ],
  },
};
