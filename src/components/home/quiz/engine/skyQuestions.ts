import { FEATURE_KEYS } from "@/lib/quiz/catalogContract";
import { neutral, pick } from "./bank/build";
import { MOON_LORE } from "./moonLore";
import { titleCase } from "./phrases";
import type { Leans, QuizChoice, QuizMoment, QuizQuestion, SkySnapshot } from "./types";

/**
 * Questions about the live sky. Each names a real, computed feature of this
 * moment, gives its traditional reading, and asks how it lands for this
 * diner: the same transit means different things to different people, and
 * the answer is theirs.
 */

const notMe = neutral("not-me", "Doesn't land for me tonight", "Leave the sky out of it");

const PLANET_GLYPHS: Readonly<Record<string, string>> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄",
};

/** What each body is traditionally said to govern, in kitchen terms. */
const PLANET_THEMES: Readonly<Record<string, string>> = {
  sun: "vitality", moon: "mood", mercury: "curiosity", venus: "pleasure",
  mars: "drive", jupiter: "appetite for more", saturn: "discipline",
};

function moonTiming(hours: number): string {
  if (hours < 2) return "for less than two more hours";
  if (hours < 36) return `for about ${Math.round(hours)} more hours`;
  return "for the next couple of days";
}

export function moonQuestion(sky: SkySnapshot): QuizQuestion | null {
  const lore = MOON_LORE[sky.moon.sign];
  if (!lore) return null;
  return {
    id: `sky-moon-${sky.moon.sign}`,
    format: "sky",
    facet: "sky",
    glyph: lore.glyph,
    eyebrow: `The Moon is in ${titleCase(sky.moon.sign)} ${moonTiming(sky.moon.hoursLeftInSign)}`,
    prompt: `${lore.reading} How does that land for you tonight?`,
    sub: "Same sky, different people. Your answer is what counts.",
    choices: [...lore.choices, notMe],
  };
}

// prettier-ignore
function phaseChoices(name: string): { title: string; reading: string; choices: QuizChoice[] } {
  if (name === "new moon" || name === "waxing crescent") return { title: "A new Moon", reading: "New Moons are traditionally for beginnings.", choices: [
    pick("fresh-start", "🌱", "A fresh start", "Light and clean", { leans: { fresh: 1, green: 0.8, richness: -0.6 } }),
    pick("seed", "🧪", "Plant a seed: try something new", "A first time for something", { leans: { adventure: 1.2 } }),
  ] };
  if (name === "first quarter" || name === "waxing gibbous") return { title: "A waxing Moon", reading: "A waxing Moon is said to build and gather.", choices: [
    pick("build", "🏗️", "Build me up", "Hearty and fortifying", { leans: { hearty: 1.2, warmth: 0.6 } }),
    pick("momentum", "🏃", "Keep the momentum", "Quick and energizing", { leans: { effort: -1, spice: 0.6, fresh: 0.4 } }),
  ] };
  if (name === "full moon") return { title: "A full Moon", reading: "Full Moons are for abundance and celebration.", choices: [
    pick("celebrate", "🥂", "Celebrate", "Rich and abundant", { leans: { richness: 1, hearty: 0.8, sweet: 0.4 } }),
    pick("glow", "✨", "Glow", "Vivid, colorful, fragrant", { leans: { fresh: 0.8, aromatic: 0.8, spice: 0.4 } }),
  ] };
  return { title: "A waning Moon", reading: "A waning Moon is said to favor letting go and simplifying.", choices: [
    pick("simplify", "🍃", "Simplify", "Fewer ingredients, less fuss", { leans: { effort: -1.4 } }),
    pick("restore", "🛁", "Restore", "Gentle, warm, nourishing", { leans: { brothy: 1, tender: 0.8, spice: -0.6 } }),
  ] };
}

export function phaseQuestion(sky: SkySnapshot): QuizQuestion {
  const { title, reading, choices } = phaseChoices(sky.phase.name);
  const lit = Math.round(sky.phase.illumination * 100);
  return {
    id: `sky-phase-${sky.phase.name.replace(/\s+/g, "-")}`,
    format: "sky",
    facet: "sky",
    glyph: "☽",
    eyebrow: `${title}, ${lit}% lit (${sky.phase.name})`,
    prompt: `${reading} Which pull do you feel?`,
    choices: [...choices, notMe],
  };
}

// prettier-ignore
const ASPECT_CHOICES: Readonly<Record<"tense" | "easy" | "fused", QuizChoice[]>> = {
  tense: [
    pick("lean-in", "🔥", "Lean into the friction", "Heat and char", { leans: { spice: 1.2, smoky: 1 } }),
    pick("soothe", "🫖", "Soothe it", "Soft, warm, kind", { leans: { tender: 1, warmth: 0.8, spice: -0.8 } }),
    pick("channel", "🛠️", "Put it to work", "A project to sink into", { leans: { effort: 1.4 } }),
  ],
  easy: [
    pick("flow", "🌊", "Ride the flow", "Effortless and good", { leans: { effort: -1, fresh: 0.4 } }),
    pick("treat", "🍮", "Treat yourself", "It's an easy day for it", { leans: { richness: 1, sweet: 0.5 } }),
    pick("stretch", "🧭", "Stretch out", "Something adventurous", { leans: { adventure: 1.2 } }),
  ],
  fused: [
    pick("intensify", "💥", "Intensify", "One big, loud flavor", { leans: { umami: 0.8, spice: 0.8, aromatic: 0.8 } }),
    pick("balance", "⚖️", "Balance it out", "Clean and simple", { leans: { fresh: 1, effort: -0.6, richness: -0.6 } }),
  ],
};

export function aspectQuestion(sky: SkySnapshot): QuizQuestion | null {
  const { aspect } = sky;
  if (!aspect) return null;
  const family = aspect.kind === "conjunction" ? "fused" : aspect.kind === "square" || aspect.kind === "opposition" ? "tense" : "easy";
  const verb = family === "fused" ? "meets" : family === "tense" ? "clashes with" : "flows with";
  const a = titleCase(aspect.a);
  const b = titleCase(aspect.b);
  return {
    id: `sky-aspect-${aspect.a}-${aspect.kind}-${aspect.b}`,
    format: "sky",
    facet: "sky",
    glyph: `${PLANET_GLYPHS[aspect.a] ?? ""}${PLANET_GLYPHS[aspect.b] ?? ""}`,
    eyebrow: `${a} ${aspect.kind} ${b}, ${aspect.orb.toFixed(1)}° from exact`,
    prompt: `${a} (${PLANET_THEMES[aspect.a] ?? aspect.a}) ${verb} ${b} (${PLANET_THEMES[aspect.b] ?? aspect.b}). What do you do with that?`,
    sub: "Some people feel a tension like this as fire, others as fatigue.",
    choices: [...ASPECT_CHOICES[family], notMe],
  };
}

// prettier-ignore
export function retrogradeQuestion(sky: SkySnapshot): QuizQuestion | null {
  const planet = ["mercury", "venus", "mars"].find((body) => sky.retrogrades.includes(body));
  if (!planet) return null;
  const advice: Readonly<Record<string, string>> = {
    mercury: "The classic advice: revisit, don't reinvent.",
    venus: "Said to be a time to return to old loves.",
    mars: "Said to slow drive and stamina. Go easy.",
  };
  return {
    id: `sky-rx-${planet}`,
    format: "sky",
    facet: "sky",
    glyph: `${PLANET_GLYPHS[planet] ?? ""}℞`,
    eyebrow: `${titleCase(planet)} is retrograde`,
    prompt: `${advice[planet] ?? ""} Taking it?`,
    choices: [
      pick("revisit", "🔁", "Yes: an old favorite", "Something I already love", { leans: { adventure: -1.4 } }),
      pick("defy", "🚀", "Defy it: something new", "The sky can't tell me what to eat", { leans: { adventure: 1.4 } }),
      pick("easy", "😌", "Keep it simple", "Nothing that can go wrong", { leans: { effort: -1.2 } }),
      notMe,
    ],
  };
}

/** The kitchen character traditionally given to each planetary hour. */
// prettier-ignore
const HOUR_LORE: Readonly<Record<string, { flavor: string; leans: Leans }>> = {
  Sun: { flavor: "golden, bold and bright", leans: { crunch: 0.8, aromatic: 0.6, fresh: 0.4 } },
  Moon: { flavor: "creamy, soft and nurturing", leans: { tender: 1, richness: 0.6, spice: -0.6 } },
  Mercury: { flavor: "quick, varied, small plates", leans: { handheld: 1, effort: -0.8 } },
  Venus: { flavor: "sweet, sensual and pretty", leans: { sweet: 1, richness: 0.6 } },
  Mars: { flavor: "spicy, seared and fierce", leans: { spice: 1.2, smoky: 0.8 } },
  Jupiter: { flavor: "abundant and generous", leans: { hearty: 1.2, richness: 0.4 } },
  Saturn: { flavor: "slow, aged and earthy", leans: { tender: 0.8, umami: 0.8, effort: 0.6 } },
};

function negate(leans: Leans): Leans {
  const opposite: Leans = {};
  for (const [key, value] of Object.entries(leans)) {
    const feature = FEATURE_KEYS.find((candidate) => candidate === key);
    if (feature) opposite[feature] = -value;
  }
  return opposite;
}

export function hourQuestion(planet: string | null): QuizQuestion | null {
  const lore = planet ? HOUR_LORE[planet] : undefined;
  if (!planet || !lore) return null;
  return {
    id: `sky-hour-${planet.toLowerCase()}`,
    format: "sky",
    facet: "sky",
    glyph: PLANET_GLYPHS[planet.toLowerCase()] ?? "✦",
    eyebrow: `It's the hour of ${planet}`,
    prompt: `Planetary-hour tradition calls ${planet}'s hour ${lore.flavor}. Lean in?`,
    choices: [
      pick("lean-in", "✨", "Lean in", `Make it ${lore.flavor}`, { leans: lore.leans }),
      pick("against", "🔄", "Go the other way", "Contrast is the point", { leans: negate(lore.leans) }),
      notMe,
    ],
  };
}

export function skyQuestions(moment: QuizMoment): QuizQuestion[] {
  const { sky } = moment;
  const fromSky = sky
    ? [moonQuestion(sky), phaseQuestion(sky), aspectQuestion(sky), retrogradeQuestion(sky)]
    : [];
  return [...fromSky, hourQuestion(moment.planetaryHour)].filter(
    (question): question is QuizQuestion => question !== null,
  );
}
