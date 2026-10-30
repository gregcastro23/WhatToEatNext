import { neutral, pick, sliderStops } from "./build";
import type { BankQuestion } from "../types";

/**
 * Openers and mood. Grounded in what drives food choice in the moment: the
 * Food Choice Questionnaire's motives (Steptoe et al., 1995: sensory appeal,
 * mood, convenience, health, familiarity…) and the comfort-food literature,
 * which ties cravings to mood and to memories of being cared for.
 */
// prettier-ignore
export const APPETITE_QUESTIONS: readonly BankQuestion[] = [
  {
    id: "hunger-level",
    format: "slider",
    facet: "appetite",
    opener: true,
    eyebrow: "Honest answers only",
    prompt: "How hungry are you, really?",
    sub: "Slide to where your stomach actually is.",
    choices: sliderStops(
      "hunger",
      "hearty",
      1.6,
      ["Barely peckish", "Snacky", "Properly hungry", "Very hungry", "Could eat a horse"],
      { handheld: -0.6, richness: 0.5 },
    ),
  },
  {
    id: "hunger-source",
    format: "choice",
    facet: "mood",
    opener: true,
    eyebrow: "Where it's coming from",
    prompt: "What's behind this hunger?",
    sub: "Why you're eating changes what will hit the spot.",
    choices: [
      pick("body", "🫃", "Pure, physical hunger", "My body is asking for fuel", { leans: { hearty: 1.2, effort: -0.4 } }),
      pick("bored", "🥱", "Boredom", "I want something interesting", { leans: { adventure: 1.4, handheld: 0.4 } }),
      pick("stress", "😮‍💨", "A long day", "I need comfort, not a challenge", { leans: { richness: 0.8, tender: 0.9, warmth: 0.8, adventure: -0.8, effort: -0.6 } }),
      pick("celebrate", "🥂", "Something to celebrate", "Make it feel like an occasion", { leans: { richness: 0.8, aromatic: 0.6, effort: 0.5 } }),
      pick("training", "🏋️", "I just worked out", "Protein, please", { leans: { hearty: 1, sweet: -0.6 }, groups: { chicken: 0.7, beef: 0.6, egg: 0.6, beans: 0.6, tofu: 0.6, fish: 0.6 } }),
      pick("unwell", "🤧", "Under the weather", "Gentle and restoring", { leans: { brothy: 1.4, warmth: 1, tender: 0.6, richness: -0.6, spice: -0.3 } }),
    ],
  },
  {
    id: "scene",
    format: "choice",
    facet: "scene",
    opener: true,
    eyebrow: "Picture it",
    prompt: "Where would you most like to be eating tonight?",
    sub: "Go with the first one that pulls at you.",
    choices: [
      pick("rain", "🌧️", "A window seat in the rain", "Steam rising from a bowl", { leans: { brothy: 1.4, warmth: 1.2, tender: 0.6 } }),
      pick("street", "🏮", "A street-food stall at midnight", "Smoke, noise, something in hand", { leans: { handheld: 1.2, smoky: 0.8, spice: 0.6, adventure: 0.6 } }),
      pick("terrace", "☀️", "A sunny terrace", "Cold glass, bright plates", { leans: { fresh: 1.3, green: 0.8, warmth: -0.8 } }),
      pick("nonna", "🧑‍🍳", "Someone's grandmother's kitchen", "Old recipes, slow pots", { leans: { tender: 1, hearty: 0.8, adventure: -1, effort: 0.4 } }),
      pick("candles", "🕯️", "Candlelight, good wine", "Something a little elegant", { leans: { richness: 0.9, aromatic: 0.6, effort: 0.6, handheld: -0.8 } }),
      pick("couch", "🛋️", "The couch, a good show", "Zero ceremony", { leans: { handheld: 1, effort: -1.2, richness: 0.4 } }),
    ],
  },
  {
    id: "course",
    format: "choice",
    facet: "course",
    eyebrow: "The shape of it",
    prompt: "What kind of eating is this?",
    choices: [
      pick("meal", "🍽️", "A proper meal", "Sit down, plate, the works", { courses: { dinner: 0.8, lunch: 0.5, dessert: -1 }, leans: { sweet: -0.6 } }),
      pick("breakfast", "🍳", "Breakfast-y, whatever the hour", "Eggs, griddles, morning things", { courses: { breakfast: 1.8 } }),
      pick("sweet", "🍰", "Something sweet", "Dessert is the meal", { courses: { dessert: 2.2 }, leans: { sweet: 1.4 } }),
      pick("snack", "🥟", "A snack that counts", "Small, satisfying, in hand", { leans: { handheld: 1.2, hearty: -0.6, effort: -0.4 } }),
    ],
  },
  {
    id: "company",
    format: "choice",
    facet: "company",
    eyebrow: "The table",
    prompt: "Who's eating?",
    choices: [
      pick("solo", "🧍", "Just me", "Cook for one, no compromises", { leans: { effort: -0.4 }, servings: 1 }),
      pick("two", "👥", "The two of us", "Something worth sharing", { leans: { richness: 0.3, effort: 0.3 }, servings: 2 }),
      pick("family", "👨‍👩‍👧", "The family", "Everyone has to be happy", { leans: { hearty: 0.6, adventure: -0.6, spice: -0.4 }, servings: 4 }),
      pick("crowd", "🎉", "A crowd", "Big pots, many hands", { leans: { hearty: 0.6, handheld: 0.5, effort: 0.3 }, servings: 8 }),
    ],
  },
  {
    id: "memory",
    format: "choice",
    facet: "mood",
    opener: true,
    eyebrow: "A little nostalgia",
    prompt: "Which memory would you eat if you could?",
    sub: "Comfort food is mostly memory. Which one is calling?",
    choices: [
      pick("market", "🧺", "A market far from home", "Something you only find there", { leans: { adventure: 1.4, aromatic: 0.6, handheld: 0.4 } }),
      pick("sunday", "🫕", "A long Sunday lunch", "The pot that simmered all day", { leans: { tender: 1.2, hearty: 0.8, adventure: -0.6 } }),
      pick("beach", "🏖️", "A beach shack", "Salt air, fish, lime", { groups: { fish: 1, shellfish: 1, citrus: 0.6 }, leans: { fresh: 0.6 } }),
      pick("diner", "🍟", "A late-night diner", "Crispy, salty, unapologetic", { leans: { crunch: 1, richness: 1, handheld: 0.6 } }),
      pick("garden", "🪴", "A summer garden", "Picked an hour ago", { leans: { green: 1.4, fresh: 1, richness: -0.6 } }),
    ],
  },
  {
    id: "color",
    format: "choice",
    facet: "mood",
    opener: true,
    eyebrow: "Eat with your eyes",
    prompt: "Pick a color for your plate",
    choices: [
      pick("gold", "🟫", "Golden brown", "Crisp edges, roasted, caramelized", { leans: { crunch: 1, richness: 0.6, smoky: 0.6 } }),
      pick("green", "🟩", "Vivid green", "Herbs, leaves, snap", { leans: { green: 1.4, fresh: 1 } }),
      pick("red", "🟥", "Deep red", "Chilies, tomatoes, paprika", { leans: { spice: 1 }, groups: { tomato: 0.8, chili: 0.6 } }),
      pick("cream", "⬜", "Creamy white", "Soft, mellow, soothing", { leans: { tender: 1, richness: 0.6, spice: -0.8 } }),
      pick("rainbow", "🌈", "Every color", "A bit of everything", { leans: { fresh: 0.8, green: 0.6, adventure: 0.6 } }),
    ],
  },
  {
    id: "weather",
    format: "choice",
    facet: "temperature",
    eyebrow: "Outside the window",
    prompt: "What's it doing outside?",
    choices: [
      pick("cold", "🥶", "Cold and grey", "I want to thaw out", { leans: { warmth: 1.2, brothy: 0.8, tender: 0.4 } }),
      pick("hot", "🥵", "Hot and sticky", "Cool me down", { leans: { warmth: -1.2, fresh: 1, richness: -0.6 } }),
      pick("storm", "⛈️", "Wild and stormy", "Batten down, cook something long", { leans: { tender: 1, effort: 0.6, warmth: 0.8 } }),
      neutral("mild", "Mild, perfectly fine", "The weather isn't deciding tonight"),
    ],
  },
];
