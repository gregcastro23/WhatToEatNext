import { neutral, pick } from "./build";
import type { BankQuestion } from "../types";

const torn = neutral("torn", "Can't choose", "Both, honestly");

/** Gut-level head-to-heads: two big tiles, decide in a second. */
// prettier-ignore
export const VERSUS_QUESTIONS: readonly BankQuestion[] = [
  {
    id: "v-rich-bright",
    format: "versus",
    facet: "richness",
    eyebrow: "Quick, don't think",
    prompt: "Butter and cream, or lime and herbs?",
    choices: [
      pick("rich", "🧈", "Butter & cream", "Rich, round, glossy", { leans: { richness: 1.6, fresh: -0.7 } }),
      pick("bright", "🍋", "Lime & herbs", "Sharp, green, alive", { leans: { fresh: 1.6, richness: -0.7 } }),
      torn,
    ],
  },
  {
    id: "v-spoon-hands",
    format: "versus",
    facet: "texture",
    eyebrow: "Utensil check",
    prompt: "A spoon or your hands?",
    choices: [
      pick("spoon", "🥄", "A spoon", "Bowls, broths, stews", { leans: { brothy: 1.6, tender: 0.6, handheld: -0.6 } }),
      pick("hands", "🤲", "My hands", "Wraps, buns, dumplings", { leans: { handheld: 1.8, brothy: -0.6 } }),
      torn,
    ],
  },
  {
    id: "v-char-silk",
    format: "versus",
    facet: "texture",
    eyebrow: "Pick a side",
    prompt: "Charred edges or silky and slow?",
    choices: [
      pick("char", "🔥", "Charred edges", "Grill marks and smoke", { leans: { smoky: 1.4, crunch: 0.8, tender: -0.4 } }),
      pick("silk", "🫕", "Silky & slow", "Braised until it gives", { leans: { tender: 1.4, smoky: -0.6 } }),
      torn,
    ],
  },
  {
    id: "v-old-new",
    format: "versus",
    facet: "adventure",
    eyebrow: "Comfort or curiosity",
    prompt: "An old favorite or something you've never had?",
    choices: [
      pick("old", "🏡", "An old favorite", "I know what I like", { leans: { adventure: -1.8 } }),
      pick("new", "🧭", "Never had it", "Surprise me", { leans: { adventure: 1.8 } }),
      torn,
    ],
  },
  {
    id: "v-noodle-rice",
    format: "versus",
    facet: "base",
    eyebrow: "The eternal question",
    prompt: "Noodles or rice?",
    choices: [
      pick("noodles", "🍜", "Noodles", "Slurp", { groups: { noodles: 1.8, rice: -0.6 } }),
      pick("rice", "🍚", "Rice", "Scoop", { groups: { rice: 1.8, noodles: -0.6 } }),
      torn,
    ],
  },
  {
    id: "v-sweet-savory",
    format: "versus",
    facet: "course",
    eyebrow: "The big one",
    prompt: "Sweet or savory?",
    choices: [
      pick("sweet", "🍓", "Sweet", "Dessert counts as dinner", { leans: { sweet: 1.8 }, courses: { dessert: 1.4 } }),
      pick("savory", "🧂", "Savory", "Salt, umami, depth", { leans: { sweet: -1.4, umami: 0.8 }, courses: { dessert: -1 } }),
      torn,
    ],
  },
  {
    id: "v-crunch-melt",
    format: "versus",
    facet: "texture",
    eyebrow: "First bite",
    prompt: "Shatter or melt?",
    choices: [
      pick("shatter", "🥠", "Shatter", "That first crunch", { leans: { crunch: 1.8, tender: -0.6 } }),
      pick("melt", "🫠", "Melt", "Collapses on the tongue", { leans: { tender: 1.8, crunch: -0.6 } }),
      torn,
    ],
  },
];
