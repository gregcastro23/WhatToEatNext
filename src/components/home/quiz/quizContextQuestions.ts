import { option } from "./quizOptionHelpers";
import type { QuizQuestion } from "./types";

export const CONTEXT_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "moment",
    prompt: (context) =>
      `It's ${context.timeOfDay}. What pace suits this meal?`,
    category: "context",
    tier: 2,
    selection: "single",
    options: [
      option("energize", "A fresh start", "Lively, bright and ready", {
        Air: 1,
        Fire: 1,
      }),
      option("steady", "Keep me steady", "Balanced and substantial", {
        Earth: 1,
      }),
      option("unwind", "Help me unwind", "Gentle and familiar", { Water: 1 }),
    ],
  },
  {
    id: "texture",
    prompt: "Which texture sounds right?",
    category: "palate",
    tier: 3,
    selection: "single",
    options: [
      option("crisp", "Crisp & crunchy", "Fresh bite and contrast", { Air: 2 }),
      option("silky", "Silky & soft", "Tender vegetables and smooth textures", {
        Water: 2,
      }),
      option("hearty", "Hearty & chewy", "Plenty to get your teeth into", {
        Earth: 2,
      }),
      option("charred", "Golden & charred", "Deeply colored edges", {
        Fire: 2,
      }),
    ],
  },
  {
    id: "time",
    prompt: "How much kitchen time do you have?",
    category: "preparation",
    tier: 3,
    selection: "single",
    options: [
      option("15", "15 minutes", "A fast assembly or quick pan"),
      option("30", "30 minutes", "A little room to cook"),
      option("60", "An hour", "Let the flavor develop"),
      option("unhurried", "No rush", "Give the meal time"),
    ],
  },
  {
    id: "equipment",
    prompt: "What's ready in your kitchen?",
    subprompt: "Choose all that apply.",
    category: "preparation",
    tier: 3,
    selection: "multiple",
    options: [
      option("stovetop", "A stovetop & pan", "Sear, soften or simmer"),
      option("oven", "An oven", "Roast and bake"),
      {
        ...option("none", "Just a board & bowl", "Fresh assembly, no heat"),
        exclusive: true,
      },
    ],
  },
  {
    id: "sky",
    prompt: (context) =>
      context.planetaryHour
        ? `It's the ${context.planetaryHour} hour. How would you like to meet it?`
        : "What kind of discovery would suit you?",
    subprompt:
      "A culinary preference, separate from the live sky's measured quantities.",
    category: "context",
    tier: 3,
    selection: "single",
    options: [
      option("familiar", "A familiar favorite", "Comfort in what I know", {
        Earth: 1,
      }),
      option("explore", "Something a little new", "Give me a new direction", {
        Air: 1,
      }),
      option(
        "intuitive",
        "Follow my appetite",
        "Let the other answers lead",
        {},
      ),
    ],
  },
  {
    id: "season",
    prompt: (context) => `Which ${context.season} mood fits your plate?`,
    category: "context",
    tier: 4,
    selection: "single",
    options: [
      option("fresh", "Fresh & green", "Tender greens, citrus and herbs", {
        Air: 1,
      }),
      option("roots", "Grounded & earthy", "Carrots, squash and roots", {
        Earth: 1,
      }),
      option("warm", "Warm & fragrant", "Aromatic vegetables and spice", {
        Fire: 1,
      }),
    ],
  },
  {
    id: "weather",
    prompt: (context) =>
      context.weather
        ? `With ${context.weather.condition.toLowerCase()} and ${Math.round(context.weather.temperatureC)}°C outside, what sounds good?`
        : "What temperature should the meal be?",
    category: "context",
    tier: 4,
    selection: "single",
    options: [
      option("warming", "Warming", "A comforting hot plate", {
        Fire: 1,
        Water: 1,
      }),
      option("cooling", "Cooling", "Fresh and room temperature", { Air: 1 }),
      option("either", "Either works", "Let flavor lead"),
    ],
  },
  {
    id: "servings",
    prompt: (context) =>
      context.tableSize > 1
        ? `There are ${context.tableSize} people at your table. How much are we making?`
        : "How many are we feeding?",
    category: "preparation",
    tier: 4,
    selection: "single",
    options: [
      option("table", "Everyone at the table", "Use the table I've set"),
      option("1", "Just me", "One generous serving"),
      option("2", "Two servings", "A pair, or a meal for tomorrow"),
      option("4", "Four servings", "A shared meal"),
    ],
  },
  {
    id: "spice",
    prompt: "How much chili heat?",
    category: "palate",
    tier: 4,
    selection: "single",
    options: [
      option("mild", "Mild", "Aromatic, with no chili burn"),
      option("medium", "A little kick", "A gentle pinch of chili", { Fire: 1 }),
      option("hot", "Bring the heat", "A generous chili finish", { Fire: 2 }),
    ],
  },
  {
    id: "spirit",
    prompt: "Spirit preference: how much lift?",
    subprompt: "Your cooking preference, not a chart-derived quantity.",
    category: "esms",
    tier: 5,
    selection: "single",
    options: [
      option("gentle", "Gentle lift", "Keep the meal quiet", {}, { Spirit: 1 }),
      option(
        "lively",
        "Lively lift",
        "A bright, expressive finish",
        {},
        { Spirit: 3 },
      ),
    ],
  },
  {
    id: "essence",
    prompt: "Essence preference: how aromatic?",
    category: "esms",
    tier: 5,
    selection: "single",
    options: [
      option(
        "subtle",
        "Subtle & delicate",
        "A restrained herbal finish",
        {},
        { Essence: 1 },
      ),
      option(
        "fragrant",
        "Fragrant & expressive",
        "Herbs and aromatics up front",
        {},
        { Essence: 3 },
      ),
    ],
  },
  {
    id: "matter",
    prompt: "Matter preference: how substantial?",
    category: "esms",
    tier: 5,
    selection: "single",
    options: [
      option(
        "light",
        "A lighter plate",
        "More vegetables, a modest base",
        {},
        { Matter: 1 },
      ),
      option(
        "substantial",
        "A substantial plate",
        "More grain and protein",
        {},
        { Matter: 3 },
      ),
    ],
  },
  {
    id: "substance",
    prompt: "Substance preference: how rich?",
    category: "esms",
    tier: 5,
    selection: "single",
    options: [
      option(
        "clean",
        "Clean & simple",
        "A light, clean finish",
        {},
        { Substance: 1 },
      ),
      option(
        "rounded",
        "Rounded & rich",
        "A generous olive-oil finish",
        {},
        { Substance: 3 },
      ),
    ],
  },
];
