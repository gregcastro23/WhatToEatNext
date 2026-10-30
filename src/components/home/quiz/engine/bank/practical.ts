import { neutral, none, pick, sliderStops } from "./build";
import type { BankQuestion } from "../types";

/**
 * The practical and the personal: time, effort, what you've had too much of,
 * what you never want, and where on the map your appetite is.
 *
 * "Too much of lately" comes from sensory-specific satiety: liking for a food
 * drops after eating it while liking for different foods holds, which is why
 * variety raises appetite (Rolls et al., 1981–1984).
 */
// prettier-ignore
export const PRACTICAL_QUESTIONS: readonly BankQuestion[] = [
  {
    id: "effort",
    format: "slider",
    facet: "effort",
    eyebrow: "Energy check",
    prompt: "How much do you want to cook?",
    choices: sliderStops("effort", "effort", 1.8, ["Assemble only", "Barely", "A normal amount", "Happy to cook", "A real project"]),
  },
  {
    id: "time",
    format: "choice",
    facet: "time",
    eyebrow: "The clock",
    prompt: "When do you need to be eating?",
    choices: [
      pick("15", "⚡", "In 15 minutes", "Fast or nothing", { maxMinutes: 20, leans: { effort: -1 } }),
      pick("30", "⏱️", "In half an hour", "A little room to cook", { maxMinutes: 40 }),
      pick("60", "🕰️", "Within the hour", "Time to let flavors build", { maxMinutes: 75 }),
      pick("slow", "🌙", "No rush at all", "Let it take the evening", { leans: { effort: 0.6, tender: 0.4 } }),
    ],
  },
  {
    id: "satiety",
    format: "multi",
    facet: "satiety",
    eyebrow: "Palate fatigue is real",
    prompt: "What have you had way too much of lately?",
    sub: "We tire of what we just ate, so we'll steer around these.",
    choices: [
      pick("noodles", "🍝", "Pasta & noodles", "Done with them", { groups: { noodles: -1.4 } }),
      pick("rice", "🍚", "Rice bowls", "Rice again?", { groups: { rice: -1.4 } }),
      pick("bread", "🥪", "Sandwiches & bread", "Over it", { groups: { bread: -1.2 }, leans: { handheld: -0.8 } }),
      pick("chicken", "🍗", "Chicken", "Chicken fatigue", { groups: { chicken: -1.4 } }),
      pick("salad", "🥗", "Salads", "Enough leaves", { leans: { fresh: -0.8, green: -0.8 } }),
      pick("heavy", "🧀", "Heavy, cheesy food", "Need a break", { leans: { richness: -1 }, groups: { cheese: -1 } }),
      pick("takeout", "🥡", "Takeout", "Want something homemade", { leans: { handheld: -0.4, effort: 0.4 } }),
      none("open", "Nothing, I'm open", "No palate fatigue"),
    ],
  },
  {
    id: "hard-nos",
    format: "multi",
    facet: "dislikes",
    eyebrow: "No judgment",
    prompt: "Any hard nos?",
    sub: "Anything you pick is taken off the table completely.",
    choices: [
      pick("cilantro", "🌿", "Cilantro", "Tastes like soap", { excludeGroups: ["cilantro"] }),
      pick("mushroom", "🍄", "Mushrooms", "Never", { excludeGroups: ["mushroom"] }),
      pick("olives", "🫒", "Olives", "No thanks", { excludeGroups: ["olives"] }),
      pick("coconut", "🥥", "Coconut", "Not for me", { excludeGroups: ["coconut"] }),
      pick("eggplant", "🍆", "Eggplant", "The texture", { excludeGroups: ["eggplant"] }),
      pick("seafood", "🦐", "Seafood", "Fish or shellfish", { excludeGroups: ["fish", "shellfish"] }),
      pick("beets", "🟣", "Beets", "Earthy in the wrong way", { excludeGroups: ["beets"] }),
      pick("tofu", "🧈", "Tofu", "Not convinced", { excludeGroups: ["tofu"] }),
      pick("raw-onion", "🧅", "Raw onion", "Too sharp", { excludeGroups: ["onion-raw"] }),
      none("none", "I eat everything", "No hard nos"),
    ],
  },
  {
    id: "protein",
    format: "choice",
    facet: "protein",
    eyebrow: "The anchor",
    prompt: "What should anchor the plate?",
    choices: [
      { ...pick("meat", "🥩", "Red meat", "Beef, pork, lamb", { groups: { beef: 1.4, pork: 1.2, lamb: 1.2 } }), hiddenFor: ["vegetarian", "vegan", "pescatarian"] },
      { ...pick("poultry", "🍗", "Poultry", "Chicken, duck, turkey", { groups: { chicken: 1.6 } }), hiddenFor: ["vegetarian", "vegan", "pescatarian"] },
      { ...pick("seafood", "🐟", "From the sea", "Fish and shellfish", { groups: { fish: 1.4, shellfish: 1.4 } }), hiddenFor: ["vegetarian", "vegan"] },
      { ...pick("egg", "🥚", "Eggs", "Runny yolk energy", { groups: { egg: 1.6 } }), hiddenFor: ["vegan"] },
      pick("beans", "🫘", "Beans & lentils", "Earthy and filling", { groups: { beans: 1.6 } }),
      pick("tofu", "🥢", "Tofu & tempeh", "Soaks up flavor", { groups: { tofu: 1.6 } }),
      pick("veg", "🥕", "Let vegetables lead", "Plants at the center", { leans: { green: 1.4 }, groups: { beef: -0.8, pork: -0.8, lamb: -0.8, chicken: -0.8 } }),
      neutral("any", "No preference", "Surprise me"),
    ],
  },
  {
    id: "base",
    format: "choice",
    facet: "base",
    eyebrow: "Underneath it all",
    prompt: "What should it sit on?",
    choices: [
      pick("noodles", "🍜", "Noodles or pasta", "Slurpable", { groups: { noodles: 1.6 } }),
      pick("rice", "🍚", "Rice", "A bowl to build on", { groups: { rice: 1.6 } }),
      pick("bread", "🫓", "Bread", "To tear and mop", { groups: { bread: 1.4 } }),
      pick("potato", "🥔", "Potatoes", "Crispy or mashed", { groups: { potato: 1.6 } }),
      pick("grains", "🌾", "Hearty grains or corn", "Quinoa, polenta, tortillas", { groups: { grains: 1.4, corn: 1.2 } }),
      pick("no-starch", "🥬", "No starch tonight", "Keep it light", { groups: { noodles: -1, rice: -1, bread: -1, potato: -1 }, leans: { green: 0.6 } }),
      neutral("any", "No preference", "Whatever suits the dish"),
    ],
  },
  {
    id: "map",
    format: "multi",
    facet: "cuisine",
    eyebrow: "Spin the globe",
    prompt: "Where on the map is your appetite?",
    sub: "Pick any that tempt you.",
    choices: [
      pick("east-asian", "🥢", "East Asia", "China, Japan, Korea", { families: { "east-asian": 1.4 } }),
      pick("southeast-asian", "🌶️", "Southeast Asia", "Thailand, Vietnam", { families: { "southeast-asian": 1.4 } }),
      pick("south-asian", "🍛", "South Asia", "India and around", { families: { "south-asian": 1.4 } }),
      pick("middle-eastern", "🧆", "The Middle East", "Levant, Persia, the Gulf", { families: { "middle-eastern": 1.4 } }),
      pick("mediterranean", "🫒", "Mediterranean & Europe", "Italy, Greece, France", { families: { mediterranean: 1.4 } }),
      pick("latin-american", "🌮", "Latin America", "Mexico and beyond", { families: { "latin-american": 1.4 } }),
      pick("american", "🍔", "American", "Diners to barbecue", { families: { american: 1.4 } }),
      pick("african", "🥘", "Africa", "North, West, East, South", { families: { african: 1.4 } }),
      pick("eastern-european", "🥟", "Eastern Europe", "Dumplings, borscht", { families: { "eastern-european": 1.4 } }),
      pick("holistic", "🍵", "Clean & macrobiotic", "Whole foods, gentle", { families: { holistic: 1.4 } }),
      none("anywhere", "Anywhere", "Surprise me"),
    ],
  },
];
