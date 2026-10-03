import { pick } from "./bank/build";
import type { QuizChoice } from "./types";

/**
 * What each Moon sign is TRADITIONALLY said to stir, as astrologers describe
 * it (the Moon is exalted in Taurus, at home in Cancer, in fall in Scorpio).
 * The quiz never claims the sky changes anyone's appetite: it names the
 * traditional reading and asks how it lands for this diner tonight. The
 * answer is the diner's own preference, and it moves the odds like any other.
 */
export interface MoonReading {
  glyph: string;
  reading: string;
  choices: readonly QuizChoice[];
}

// prettier-ignore
export const MOON_LORE: Readonly<Record<string, MoonReading>> = {
  aries: { glyph: "♈", reading: "Aries is impatient fire: quick, hot, now.", choices: [
    pick("fiery", "🔥", "Fast and fiery", "Heat, char, no waiting", { leans: { spice: 1.2, smoky: 0.8, effort: -1 } }),
    pick("bold-light", "⚡", "Bold but light", "Big flavor, not heavy", { leans: { fresh: 1, spice: 0.6, hearty: -0.6 } }),
    pick("cool-down", "🧊", "I need cooling down", "I'm wired enough already", { leans: { warmth: -1.2, fresh: 0.8, spice: -0.8 } }),
  ] },
  taurus: { glyph: "♉", reading: "The Moon is exalted in Taurus, sign of comfort and pleasure.", choices: [
    pick("indulge", "🧈", "Indulge me", "Rich, slow, luxurious", { leans: { richness: 1.4, tender: 1, sweet: 0.3 } }),
    pick("pretty", "🌸", "Pleasure, but fresh", "Beautiful produce, bright plate", { leans: { fresh: 1.2, green: 0.8, richness: -0.4 } }),
    pick("grounded", "🪨", "Simple and grounding", "Honest food, nothing fussy", { leans: { hearty: 1, adventure: -1, effort: -0.4 } }),
  ] },
  gemini: { glyph: "♊", reading: "Gemini is restless curiosity: variety, little bites, chatter.", choices: [
    pick("snacky", "🥟", "Little bits of everything", "Small, handheld, many", { leans: { handheld: 1.2, adventure: 0.6 } }),
    pick("novel", "🧭", "Something I've never tried", "Feed the curiosity", { leans: { adventure: 1.6 } }),
    pick("quick", "💨", "Quick and light", "My head's elsewhere", { leans: { effort: -1.2, fresh: 0.6, hearty: -0.6 } }),
  ] },
  cancer: { glyph: "♋", reading: "Cancer is the Moon's own sign: home, nurture, nostalgia.", choices: [
    pick("childhood", "🧸", "Childhood comfort", "What someone made for me", { leans: { tender: 1, warmth: 1, adventure: -1.2, richness: 0.5 } }),
    pick("bowl", "🍲", "A big warm bowl", "Hold it with both hands", { leans: { brothy: 1.4, warmth: 1 } }),
    pick("feed-others", "🫶", "Cooking for people I love", "Generous and shared", { leans: { hearty: 0.8, effort: 0.8 } }),
  ] },
  leo: { glyph: "♌", reading: "Leo is generous, golden, a little dramatic.", choices: [
    pick("showstopper", "👑", "A showstopper", "Golden, crisp, impressive", { leans: { crunch: 0.8, richness: 0.8, effort: 0.8 } }),
    pick("feast", "🎉", "Celebration food", "Made for sharing", { leans: { hearty: 0.8, aromatic: 0.6, handheld: 0.4 } }),
    pick("sunny", "☀️", "Sunny but easy", "Warm and bright, low effort", { leans: { warmth: 0.8, fresh: 0.6, effort: -0.8 } }),
  ] },
  virgo: { glyph: "♍", reading: "Virgo is discerning: clean, precise, wholesome.", choices: [
    pick("clean", "🥬", "Clean and nourishing", "Plants, precision, balance", { leans: { green: 1.2, fresh: 0.8, richness: -1 } }),
    pick("crafted", "🔪", "A perfectly crafted dish", "Technique, done right", { leans: { effort: 1, aromatic: 0.6 } }),
    pick("rebel", "😈", "Rebellion: messy and indulgent", "I've been good all week", { leans: { richness: 1.4, crunch: 0.8, green: -0.6 } }),
  ] },
  libra: { glyph: "♎", reading: "Libra wants balance, beauty and a little sweetness.", choices: [
    pick("balanced", "⚖️", "Beautiful and balanced", "Every element in harmony", { leans: { fresh: 0.8, green: 0.6, aromatic: 0.6 } }),
    pick("sweet", "🍰", "Something sweet to share", "Dessert energy", { leans: { sweet: 1.4 }, courses: { dessert: 0.8 } }),
    pick("date", "🕯️", "Date-night elegant", "Something a little special", { leans: { richness: 0.8, effort: 0.6, handheld: -0.6 } }),
  ] },
  scorpio: { glyph: "♏", reading: "The Moon is in fall in Scorpio: deep, intense, all or nothing.", choices: [
    pick("deep", "🌑", "Deep and intense", "Dark, slow, complex", { leans: { umami: 1.4, tender: 0.8, aromatic: 0.8, spice: 0.4 } }),
    pick("cathartic", "🌶️", "Fiery and cathartic", "Sweat it out", { leans: { spice: 1.6 } }),
    pick("hide", "🫥", "Hide out with something simple", "Low effort, familiar", { leans: { effort: -1.2, adventure: -1, warmth: 0.6 } }),
  ] },
  sagittarius: { glyph: "♐", reading: "Sagittarius is the traveler: adventure, abundance, more.", choices: [
    pick("far", "✈️", "Take me somewhere far", "A cuisine I don't know", { leans: { adventure: 1.8 } }),
    pick("abundance", "🍖", "A feast: more is more", "Generous and filling", { leans: { hearty: 1.2, richness: 0.6 } }),
    pick("big-flavor", "🧨", "Big flavor, no fuss", "Spice-forward and easy", { leans: { spice: 0.8, aromatic: 0.8, effort: -0.6 } }),
  ] },
  capricorn: { glyph: "♑", reading: "Capricorn is structure and tradition: classics, done properly.", choices: [
    pick("classic", "📜", "A classic, done properly", "Tradition earns its place", { leans: { adventure: -1, effort: 0.8, hearty: 0.8 } }),
    pick("fuel", "⛰️", "Efficient fuel", "Substantial, no ceremony", { leans: { hearty: 1, effort: -1 } }),
    pick("earthy", "🫚", "Earthy and slow", "Roots and braises", { leans: { tender: 1, umami: 0.8, warmth: 0.8 } }),
  ] },
  aquarius: { glyph: "♒", reading: "Aquarius is the experimenter: cool, unconventional, ahead of itself.", choices: [
    pick("weird", "🛸", "Weird and wonderful", "The stranger the better", { leans: { adventure: 1.8 } }),
    pick("crisp", "❄️", "Cool and crisp", "Clear-headed food", { leans: { warmth: -1, fresh: 1, crunch: 0.6 } }),
    pick("plants", "🌱", "Plant-forward and inventive", "Vegetables doing new things", { leans: { green: 1.2, adventure: 0.8 } }),
  ] },
  pisces: { glyph: "♓", reading: "Pisces is dreamy water: soft edges, the sea, escape.", choices: [
    pick("dreamy", "🌊", "Soft and soothing", "Gentle, warm, no edges", { leans: { tender: 1.2, brothy: 0.8, spice: -0.8 } }),
    pick("sea", "🐚", "Something from the sea", "Fish, shellfish, brine", { groups: { fish: 1.2, shellfish: 1.2 } }),
    pick("escape", "🍫", "Sweet escapism", "Pure comfort", { leans: { sweet: 1.2, richness: 0.6 } }),
  ] },
};
