import { none, pick, sliderStops } from "./build";
import type { BankQuestion } from "../types";

/**
 * The senses. Texture and temperature are as decisive as taste: sensory
 * research lists taste, smell, color, shape, texture and temperature as what
 * makes a food appealing in the moment (Rolls, Rowe & Rolls, 1982), and
 * texture researchers sort eaters into four "mouth behaviors": crunchers,
 * chewers, smooshers and suckers (Jeltema, Beckley & Vahalik, 2015).
 */
// prettier-ignore
export const SENSES_QUESTIONS: readonly BankQuestion[] = [
  {
    id: "mouth",
    format: "choice",
    facet: "texture",
    eyebrow: "Food science says there are four of you",
    prompt: "How do you like to eat?",
    sub: "Researchers sort people into four camps by how they handle food in the mouth.",
    choices: [
      pick("cruncher", "🥨", "Cruncher", "Shatter, snap, crackle", { leans: { crunch: 1.8, tender: -0.6 } }),
      pick("chewer", "🍖", "Chewer", "Something to really chew on", { leans: { hearty: 0.8, tender: -0.4 }, groups: { noodles: 0.7, bread: 0.6, beef: 0.5, pork: 0.4 } }),
      pick("smoosher", "🍮", "Smoosher", "Soft, silky, melting", { leans: { tender: 1.8, crunch: -0.7 } }),
      pick("savorer", "🍬", "Savorer", "Let it linger and slowly open up", { leans: { aromatic: 0.9, umami: 0.7, sweet: 0.4 } }),
    ],
  },
  {
    id: "sound",
    format: "choice",
    facet: "texture",
    opener: true,
    eyebrow: "Close your eyes",
    prompt: "Choose the sound of your dinner",
    choices: [
      pick("sizzle", "🔥", "A hard sizzle", "Hot pan, loud sear", { leans: { warmth: 1, smoky: 0.8, crunch: 0.6 } }),
      pick("crackle", "✨", "A crackle", "The first bite breaking", { leans: { crunch: 1.6, richness: 0.4 } }),
      pick("bubble", "🫧", "A slow bubble", "Something simmering for hours", { leans: { brothy: 1.2, tender: 1, warmth: 1 } }),
      pick("hush", "🧊", "Quiet clink of ice", "Something cold and crisp", { leans: { warmth: -1.4, fresh: 1 } }),
    ],
  },
  {
    id: "temperature",
    format: "slider",
    facet: "temperature",
    eyebrow: "Temperature check",
    prompt: "Hot or cold?",
    choices: sliderStops("temp", "warmth", 1.8, ["Ice cold", "Cool", "Either", "Warm", "Piping hot"], { brothy: 0.5 }),
  },
  {
    id: "sparks",
    format: "multi",
    facet: "flavor",
    eyebrow: "Pick any",
    prompt: "Which flavors are calling you?",
    sub: "Choose as many as you like.",
    choices: [
      pick("smoky", "🔥", "Smoky", "Char, grill, smoke", { leans: { smoky: 1.2 }, groups: { smoke: 0.8 } }),
      pick("zesty", "🍋", "Zesty", "Citrus, vinegar, sharp", { leans: { fresh: 1.2 }, groups: { citrus: 0.6 } }),
      pick("garlicky", "🧄", "Garlicky", "Unapologetically", { groups: { garlic: 1.4 } }),
      pick("herby", "🌿", "Herby", "Handfuls of green", { groups: { herbs: 1, cilantro: 0.5 }, leans: { fresh: 0.5 } }),
      pick("funky", "🫙", "Funky", "Fermented, pickled, deep", { groups: { ferment: 1.3, "soy-sauce": 0.4 }, leans: { umami: 0.7 } }),
      pick("sweet-heat", "🍯", "Sweet heat", "Honey meets chili", { leans: { sweet: 0.7, spice: 0.7 } }),
      pick("nutty", "🥜", "Nutty", "Toasted, roasty, rich", { groups: { nuts: 1.2, sesame: 0.8 } }),
      pick("spiced", "🫚", "Warmly spiced", "Cumin, cinnamon, cardamom", { leans: { aromatic: 1.2 }, groups: { "warm-spice": 0.8, "curry-spice": 0.8 } }),
      none("plain", "Keep it simple", "No particular flavor tonight"),
    ],
  },
  {
    id: "spice-level",
    format: "slider",
    facet: "spice",
    eyebrow: "Chili check",
    prompt: "How much heat can you take tonight?",
    choices: sliderStops("spice", "spice", 2, ["None at all", "A whisper", "Some warmth", "Real heat", "Set me on fire"]),
  },
  {
    id: "nourish-treat",
    format: "slider",
    facet: "richness",
    eyebrow: "The angel and the devil",
    prompt: "Tonight's plate leans…",
    choices: sliderStops("treat", "richness", 1.6, ["Nourishing", "Mostly good", "Balanced", "A little treat", "Full indulgence"], { green: -0.9, sweet: 0.4 }),
  },
  {
    id: "adventure-dial",
    format: "slider",
    facet: "adventure",
    eyebrow: "Comfort zone",
    prompt: "How far from the familiar do you want to go?",
    choices: sliderStops("adv", "adventure", 1.8, ["Home turf", "Familiar-ish", "Open", "Curious", "Take me somewhere new"]),
  },
];
