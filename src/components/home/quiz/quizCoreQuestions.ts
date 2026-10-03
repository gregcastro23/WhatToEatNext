import { option, dietIs, avoids } from "./quizOptionHelpers";
import type { QuizQuestion } from "./types";

export const CORE_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "hunger",
    prompt: "What's the hunger right now?",
    category: "palate",
    tier: 1,
    selection: "single",
    isQuickQuestion: true,
    options: [
      option("fierce", "Fierce — feed me now", "Big, bold, immediate", {
        Fire: 2,
        Earth: 1,
      }),
      option("comfort", "Deep & slow — comfort", "Warmth that takes its time", {
        Earth: 2,
        Water: 1,
      }),
      option("light", "Light & lively", "Fresh and crisp, nothing heavy", {
        Air: 2,
        Fire: 1,
      }),
      option("soothing", "Soothing — a warm bowl", "Something that holds you", {
        Water: 2,
        Earth: 1,
      }),
    ],
  },
  {
    id: "heat",
    prompt: "Pick your cooking heat",
    category: "preparation",
    tier: 1,
    selection: "single",
    isQuickQuestion: true,
    options: [
      option("sear", "Open flame & char", "Sear it, blister it", { Fire: 2 }),
      option("roast", "Low & slow", "Roast and caramelise", { Earth: 2 }),
      option("raw", "Barely any — keep it crisp", "Fresh, chilled, snappy", {
        Air: 2,
      }),
      option("simmer", "Steam & simmer", "Gentle heat, deep broth", {
        Water: 2,
      }),
    ],
  },
  {
    id: "flavor",
    prompt: "Where's the flavor pulling?",
    category: "palate",
    tier: 1,
    selection: "single",
    isQuickQuestion: true,
    options: [
      option("spicy", "Chili, pepper, spice", "Make it burn a little", {
        Fire: 2,
      }),
      option("savory", "Umami, roast, mushroom", "Savory and grounding", {
        Earth: 2,
      }),
      option("bright", "Citrus, herbs, vinegar", "Bright and green", {
        Air: 2,
      }),
      option("rounded", "Cream, broth, brine", "Rounded and soothing", {
        Water: 2,
      }),
    ],
  },
  {
    id: "shape",
    prompt: "The shape of this meal",
    category: "preparation",
    tier: 1,
    selection: "single",
    isQuickQuestion: true,
    options: [
      option("fast", "Fast — 20 minutes, tops", "Hunger wins", {
        Fire: 1,
        Air: 1,
      }),
      option("craft", "A slow craft", "Cooking is the plan", { Earth: 2 }),
      option("people", "Feeding people", "Make it generous", {
        Earth: 1,
        Air: 1,
      }),
      option("ritual", "A quiet ritual", "One bowl, no rush", { Water: 2 }),
    ],
  },
  {
    id: "diet",
    prompt: "What belongs at your table?",
    category: "dietary",
    tier: 2,
    selection: "single",
    options: [
      option(
        "unrestricted",
        "Everything welcome",
        "Plants, fish, eggs and meat",
      ),
      option("vegetarian", "Vegetarian", "Plants, dairy and eggs"),
      option("vegan", "Vegan", "Plants only"),
      option("pescatarian", "Pescatarian", "Plants, fish, dairy and eggs"),
    ],
  },
  {
    id: "allergens",
    prompt: "Anything to keep off the plate?",
    subprompt:
      "Choose all that apply. Check ingredient labels for your own kitchen.",
    category: "dietary",
    tier: 2,
    selection: "multiple",
    options: [
      {
        ...option("none", "No exclusions", "Everything suits me"),
        exclusive: true,
      },
      option("gluten", "Gluten / wheat", "Skip wheat, barley and rye"),
      option("dairy", "Dairy", "Skip milk, butter and cheese"),
      option("eggs", "Eggs", "Skip eggs and egg ingredients"),
      option("soy", "Soy", "Skip tofu and soy sauce"),
      option("peanuts", "Peanuts", "Skip peanuts and peanut oil"),
      option("tree-nuts", "Tree nuts", "Skip nuts and nut ingredients"),
      option("sesame", "Sesame", "Skip seeds, tahini and sesame oil"),
      option("fish", "Fish", "Skip fish and fish sauce"),
      option("shellfish", "Shellfish", "Skip prawns, crab and molluscs"),
    ],
  },
  {
    id: "protein",
    prompt: "What should anchor the meal?",
    category: "dietary",
    tier: 2,
    selection: "single",
    options: [
      option("chickpeas", "Chickpeas & beans", "Plant-based and satisfying", {
        Earth: 1,
      }),
      {
        ...option("tofu", "Tofu", "Tender, versatile plant protein", {
          Water: 1,
        }),
        condition: avoids("soy"),
      },
      {
        ...option("eggs", "Eggs", "Simple, soft or golden", { Water: 1 }),
        condition: (context, answers) =>
          dietIs(
            "unrestricted",
            "vegetarian",
            "pescatarian",
          )(context, answers) && avoids("eggs")(context, answers),
      },
      {
        ...option("fish", "Fish", "Tender and light", { Air: 1 }),
        condition: (context, answers) =>
          dietIs("unrestricted", "pescatarian")(context, answers) &&
          avoids("fish")(context, answers),
      },
      {
        ...option("chicken", "Chicken", "Hearty and familiar", { Fire: 1 }),
        condition: dietIs("unrestricted"),
      },
      option("vegetables", "Let vegetables lead", "A generous vegetable bowl", {
        Air: 1,
      }),
    ],
  },
];
