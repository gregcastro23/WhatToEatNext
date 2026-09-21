import type { QuizAnswers, QuizContext, QuizOption, QuizQuestion } from "./types";

const option = (
  id: string,
  label: string,
  sub: string,
  elements: QuizOption["weights"]["elements"] = {},
  extra: Partial<Omit<QuizOption, "id" | "label" | "sub" | "weights">> = {},
): QuizOption => ({ id, label, sub, weights: { elements }, ...extra });
const preference = (id: string, label: string, sub: string, esms: NonNullable<QuizOption["weights"]["esms"]>): QuizOption => ({ id, label, sub, weights: { elements: {}, esms } });
export const answerIs = (answers: QuizAnswers, id: string, optionId: string): boolean => answers[id]?.includes(optionId) ?? false;

/** Stable option IDs make saved answers resilient to copy and order changes. */
export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "hunger", tier: 1, category: "core", selection: "single", isQuickQuestion: true,
    prompt: (ctx) => `What's the hunger this ${ctx.timeOfDay}?`,
    subprompt: "Start with your appetite. We'll follow your lead.",
    options: [
      option("fierce", "Fierce — feed me now", "Big, bold, immediate", { Fire: 2, Earth: 1 }),
      option("comfort", "Deep & slow comfort", "Warmth that takes its time", { Earth: 2, Water: 1 }),
      option("light", "Light & lively", "Fresh, crisp and bright", { Air: 2, Fire: 1 }),
      option("soothing", "A soothing warm bowl", "Something to settle into", { Water: 2, Earth: 1 }),
    ],
  },
  {
    id: "heat", tier: 1, category: "core", selection: "single", isQuickQuestion: true,
    prompt: "Pick your kind of heat",
    options: [
      option("char", "Open flame & char", "Sear it, blister it", { Fire: 2 }, { cookingMethodTag: "stir-fry" }),
      option("slow", "Low & slow", "Roast and caramelize", { Earth: 2 }, { cookingMethodTag: "roast" }),
      option("crisp", "Keep it cool & crisp", "Fresh, chilled, snappy", { Air: 2 }, { cookingMethodTag: "no-cook" }),
      option("steam", "Steam & simmer", "Gentle heat, deep broth", { Water: 2 }, { cookingMethodTag: "simmer" }),
    ],
  },
  {
    id: "flavor", tier: 1, category: "core", selection: "single", isQuickQuestion: true,
    prompt: "Where's the flavor pulling?",
    options: [
      option("spice", "Chili, pepper, spice", "Turn up the warmth", { Fire: 2 }),
      option("umami", "Umami, roast, mushroom", "Savory and grounding", { Earth: 2 }),
      option("bright", "Citrus, herbs, vinegar", "Bright and green", { Air: 2 }),
      option("rounded", "Creamy, brothy, briny", "Rounded and soothing", { Water: 2 }),
    ],
  },
  {
    id: "shape", tier: 1, category: "core", selection: "single", isQuickQuestion: true,
    prompt: (ctx) => ctx.tableSize > 1 ? `How does a meal for ${ctx.tableSize} feel today?` : "The shape of your meal",
    options: [
      option("fast", "Fast — 20 minutes, tops", "Hunger wins", { Fire: 1, Air: 1 }),
      option("craft", "A slow craft", "Cooking is the plan", { Earth: 2 }),
      option("sharing", "Feeding people", "Make it generous", { Earth: 1, Air: 1 }),
      option("ritual", "A quiet ritual", "One bowl, no rush", { Water: 2 }),
    ],
  },
  {
    id: "planetary-hour", tier: 2, category: "celestial", selection: "single",
    prompt: (ctx) => ctx.planetaryHour ? `It's ${ctx.planetaryHour}'s hour. What mood suits you?` : "What mood should cooking bring?",
    subprompt: "A culinary intention, with the sky as an optional inspiration.",
    options: [
      option("spark", "A little adventure", "Try a bold combination", { Fire: 2 }),
      option("steady", "A familiar favorite", "Reliable and grounding", { Earth: 2 }),
      option("play", "Room to improvise", "A few bright surprises", { Air: 2 }),
      option("soft", "An easy landing", "Gentle, comforting flavors", { Water: 2 }),
    ],
  },
  {
    id: "moon", tier: 2, category: "celestial", selection: "single",
    prompt: (ctx) => ctx.lunarPhase ? `Under a ${ctx.lunarPhase.replaceAll("_", " ")}, what draws you in?` : "Which craving keeps coming back?",
    options: [
      option("toasty", "Toasty & smoky", "Golden edges and depth", { Fire: 1, Earth: 1 }),
      option("fresh", "Fresh & green", "Herbs and seasonal crunch", { Air: 2 }),
      option("silky", "Silky & comforting", "A spoon-friendly meal", { Water: 2 }),
      option("hearty", "Hearty & savory", "A satisfying center", { Earth: 2 }),
    ],
  },
  {
    id: "energy", tier: 2, category: "celestial", selection: "single",
    prompt: (ctx) => ctx.timeOfDay === "night" ? "What pace fits your late-night meal?" : "What pace fits the rest of your day?",
    options: [
      option("active", "Ready for action", "Bright and lively", { Fire: 1, Air: 1 }),
      option("steady", "A steady afternoon", "A generous, balanced plate", { Earth: 1, Water: 1 }),
      option("light", "Keep things light", "Freshness and smaller bites", { Air: 2 }),
      option("unwind", "Time to unwind", "Warmth and an easy finish", { Water: 2 }),
    ],
  },
  {
    id: "temperature", tier: 2, category: "celestial", selection: "single",
    prompt: (ctx) => ctx.weather && Number.isFinite(ctx.weather.temperatureC) ? `It's ${Math.round(ctx.weather.temperatureC)}°C outside. How should the meal feel?` : `For this ${ctx.season} meal, pick a serving temperature`,
    options: [
      option("hot", "Piping hot", "Steam rising from the bowl", { Fire: 1, Water: 1 }),
      option("warm", "Gently warm", "Comfortable and mellow", { Earth: 1, Water: 1 }),
      option("room", "Room temperature", "Let the ingredients speak", { Earth: 1, Air: 1 }),
      option("chilled", "Cool & refreshing", "A crisp, chilled finish", { Air: 1, Water: 1 }),
    ],
  },
  {
    id: "method", tier: 3, category: "thermodynamic", selection: "single",
    prompt: (_ctx, answers) => answerIs(answers, "heat", "crisp") ? "Stay fresh, or add a little cooking?" : "Which cooking rhythm feels right?",
    options: [
      option("stir-fry", "Quick skillet", "A fast toss and a golden sear", { Fire: 2 }, { cookingMethodTag: "stir-fry" }),
      option("roast", "Roast & caramelize", "Let the oven do its thing", { Earth: 2 }, { cookingMethodTag: "roast" }),
      option("no-cook", "Fresh assembly", "Great ingredients, minimal heat", { Air: 2 }, { cookingMethodTag: "no-cook" }),
      option("simmer", "One-pot simmer", "A gently bubbling pot", { Water: 2 }, { cookingMethodTag: "simmer" }),
    ],
  },
  {
    id: "texture", tier: 3, category: "thermodynamic", selection: "single",
    prompt: (_ctx, answers) => answerIs(answers, "hunger", "soothing") ? "What should your comforting bowl feel like?" : "Find your favorite texture",
    options: [
      option("crisp", "Crisp & crunchy", "A little snap in every bite", { Air: 2 }, { textureTag: "crisp" }),
      option("tender", "Tender & yielding", "Soft vegetables and slow comfort", { Earth: 1, Water: 1 }, { textureTag: "tender" }),
      option("silky", "Silky & smooth", "Velvety spoonfuls", { Water: 2 }, { textureTag: "silky" }),
      option("contrast", "A little of everything", "Tender centers, lively edges", { Fire: 1, Air: 1 }, { textureTag: "contrasting" }),
    ],
  },
  {
    id: "pace", tier: 3, category: "thermodynamic", selection: "single",
    prompt: "What's your real cooking budget?",
    options: [
      option("10", "Ten minutes", "Assemble and enjoy", { Air: 1 }),
      option("20", "Twenty minutes", "One quick pan", { Fire: 1 }),
      option("40", "Forty minutes", "A little room to build flavor", { Earth: 1 }),
      option("unhurried", "No clock today", "Enjoy the process", { Water: 1 }),
    ],
  },
  {
    id: "equipment", tier: 3, category: "thermodynamic", selection: "single",
    prompt: "Which tool is ready to go?",
    condition: (answers) => !answerIs(answers, "method", "no-cook") && !answerIs(answers, "pace", "10"),
    subprompt: "We'll skip this when you've chosen fresh assembly.",
    options: [
      option("skillet", "A trusty skillet", "Fast, flexible stovetop cooking", { Fire: 1 }),
      option("oven", "Oven & sheet pan", "Room to roast", { Earth: 1 }),
      option("pot", "A pot & a lid", "Simmer, steam and soften", { Water: 1 }),
      option("flexible", "Whatever it takes", "The kitchen is open", { Air: 1 }),
    ],
  },
  {
    id: "diet", tier: 4, category: "boundary", selection: "single",
    prompt: "How do you like to eat?",
    subprompt: "These boundaries travel with your recipe brief.",
    options: [
      option("unrestricted", "An open table", "Plant and animal ingredients are welcome"),
      option("vegetarian", "Vegetarian", "Plants, dairy and eggs", {}, { dietaryTags: ["vegetarian"] }),
      option("vegan", "Entirely plant-based", "No animal ingredients", {}, { dietaryTags: ["vegan"] }),
      option("pescatarian", "Plants & seafood", "No meat or poultry", {}, { dietaryTags: ["pescatarian"] }),
    ],
  },
  {
    id: "allergens", tier: 4, category: "boundary", selection: "multiple",
    prompt: "Any ingredients to keep out?",
    subprompt: "Select all that apply. Check product labels for your own needs.",
    options: [
      option("none", "No exclusions", "Nothing to omit", {}, { exclusive: true }),
      ...[
        ["milk", "Milk", "Dairy ingredients"], ["egg", "Eggs", "Egg and egg products"],
        ["fish", "Fish", "Fish and fish sauces"], ["shellfish", "Shellfish", "Crustaceans and mollusks"],
        ["tree-nuts", "Tree nuts", "Almonds, walnuts and more"], ["peanut", "Peanuts", "Peanuts and peanut products"],
        ["wheat", "Wheat / gluten", "Wheat, barley and rye"], ["soy", "Soy", "Soybeans and soy products"],
        ["sesame", "Sesame", "Seeds, tahini and sesame oil"],
      ].flatMap(([id, label, sub]) => id && label && sub ? [option(id, label, sub)] : []),
    ],
  },
  {
    id: "protein", tier: 4, category: "boundary", selection: "single",
    prompt: (_ctx, answers) => answerIs(answers, "diet", "vegan") ? "Choose your plant-based anchor" : "What should anchor the plate?",
    options: [
      option("legumes", "Beans & lentils", "Hearty plant-based depth", { Earth: 1 }),
      option("vegetables", "Vegetables first", "Let seasonal produce lead", { Air: 1 }),
      option("tofu", "Tofu or tempeh", "A versatile plant-based center", { Water: 1 }, { condition: (answers) => !answerIs(answers, "allergens", "soy") }),
      option("flexible", "Surprise me", "Within my dietary boundaries", { Fire: 1 }),
    ],
  },
  {
    id: "satiety", tier: 4, category: "boundary", selection: "single",
    prompt: "How generous should this meal feel?",
    options: [
      option("small", "A small, lovely plate", "Just a little", { Air: 1 }),
      option("balanced", "Comfortably satisfied", "A balanced main", { Earth: 1 }),
      option("hearty", "Really generous", "Bring a good appetite", { Earth: 1, Fire: 1 }),
      option("leftovers", "Enough for tomorrow", "Cook once, enjoy twice", { Water: 1 }),
    ],
  },
  {
    id: "spirit", tier: 5, category: "alchemical", selection: "single",
    prompt: "Spirit · how much aromatic lift?", subprompt: "A culinary preference, not a planetary measurement.",
    options: [
      preference("subtle", "Quiet & subtle", "A gentle aroma", { Spirit: 1 }),
      preference("herbal", "Fresh herbs", "A green, fragrant finish", { Spirit: 2 }),
      preference("citrus", "Citrus sparkle", "Zest and a bright squeeze", { Spirit: 3 }),
      preference("aromatic", "Bold aromatics", "A fragrant first impression", { Spirit: 4 }),
    ],
  },
  {
    id: "essence", tier: 5, category: "alchemical", selection: "single",
    prompt: "Essence · what makes it feel complete?",
    options: [
      preference("simple", "Ingredient clarity", "A few good things", { Essence: 1 }),
      preference("seasonal", "Seasonal color", "A colorful mix of produce", { Essence: 2 }),
      preference("layered", "Layers of flavor", "Each bite brings more", { Essence: 3 }),
      preference("abundant", "A generous mix", "Plenty of variety", { Essence: 4 }),
    ],
  },
  {
    id: "matter", tier: 5, category: "alchemical", selection: "single",
    prompt: "Matter · choose your grounding note",
    options: [
      preference("light", "Keep it delicate", "A light foundation", { Matter: 1 }),
      preference("vegetables", "Rooted in vegetables", "Vegetables with substance", { Matter: 2 }),
      preference("beans", "Beans & legumes", "A hearty center", { Matter: 3 }),
      preference("hearty", "A full, hearty bowl", "A meal to settle into", { Matter: 4 }),
    ],
  },
  {
    id: "substance", tier: 5, category: "alchemical", selection: "single",
    prompt: (ctx) => ctx.tableSize > 1 ? "Substance · what brings your table together?" : "Substance · the final savory note",
    options: [
      preference("clean", "Clean & fresh", "Let the ingredients shine", { Substance: 1 }),
      preference("savory", "Savory & mellow", "A warm, rounded finish", { Substance: 2 }),
      preference("roasted", "Toasted depth", "Caramelized, golden notes", { Substance: 3 }),
      preference("rich", "Deeply savory", "A lingering, full finish", { Substance: 4 }),
    ],
  },
];

export function resolveQuestionPrompt(question: QuizQuestion, context: QuizContext, answers: QuizAnswers): string {
  return typeof question.prompt === "function" ? question.prompt(context, answers) : question.prompt;
}
export function getQuestionOptions(question: QuizQuestion, context: QuizContext, answers: QuizAnswers): readonly QuizOption[] {
  return question.options.filter((item) => !item.condition || item.condition(answers, context));
}
