/**
 * Craft tonight's meal — the hero's four-tap quiz.
 *
 * Four taps about what the visitor feels like eating right now, each option
 * weighted toward the four elements. The table's composite palate (from
 * "Who's eating tonight?", if present) tips the scales, and the dominant +
 * secondary elements resolve to a curated dish. All fixture data — the live
 * recommenders below the hero are the real engine; this is the on-ramp.
 */

import {
  ELEMENT_ORDER,
  type ElementVector,
  type PalateElement,
} from "@/utils/guestPalate";

const STORAGE_KEY = "alchm:firstmeal:v1";
/** Pre-rename key; answers migrate forward on first load. */
const LEGACY_KEY = "alchm:kitchendex:firstmeal:v1";

export interface QuizOption {
  label: string;
  sub: string;
  weights: Partial<Record<PalateElement, number>>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: readonly QuizOption[];
}

export const FIRST_MEAL_QUIZ: readonly QuizQuestion[] = [
  {
    id: "hunger",
    prompt: "What's the hunger tonight?",
    options: [
      {
        label: "Fierce — feed me now",
        sub: "Big, bold, immediate",
        weights: { Fire: 2, Earth: 1 },
      },
      {
        label: "Deep & slow — comfort",
        sub: "Warmth that takes its time",
        weights: { Earth: 2, Water: 1 },
      },
      {
        label: "Light & lively",
        sub: "Fresh and crisp, nothing heavy",
        weights: { Air: 2, Fire: 1 },
      },
      {
        label: "Soothing — a warm bowl",
        sub: "Something that holds you",
        weights: { Water: 2, Earth: 1 },
      },
    ],
  },
  {
    id: "heat",
    prompt: "Pick tonight's heat",
    options: [
      {
        label: "Open flame & char",
        sub: "Sear it, blister it",
        weights: { Fire: 2 },
      },
      {
        label: "Low & slow",
        sub: "Braise, roast, caramelise",
        weights: { Earth: 2 },
      },
      {
        label: "Barely any — keep it crisp",
        sub: "Raw, chilled, snappy",
        weights: { Air: 2 },
      },
      {
        label: "Steam & simmer",
        sub: "Gentle heat, deep broth",
        weights: { Water: 2 },
      },
    ],
  },
  {
    id: "flavor",
    prompt: "Where's the flavor pulling?",
    options: [
      {
        label: "Chili, pepper, spice",
        sub: "Make it burn a little",
        weights: { Fire: 2 },
      },
      {
        label: "Umami, roast, mushroom",
        sub: "Savory and grounding",
        weights: { Earth: 2 },
      },
      {
        label: "Citrus, herbs, vinegar",
        sub: "Bright and green",
        weights: { Air: 2 },
      },
      {
        label: "Cream, broth, brine",
        sub: "Rounded and oceanic",
        weights: { Water: 2 },
      },
    ],
  },
  {
    id: "shape",
    prompt: "The shape of the evening",
    options: [
      {
        label: "Fast — 20 minutes, tops",
        sub: "Hunger wins",
        weights: { Fire: 1, Air: 1 },
      },
      {
        label: "A slow craft",
        sub: "Cooking is the plan",
        weights: { Earth: 2 },
      },
      {
        label: "Feeding people",
        sub: "Make it generous",
        weights: { Earth: 1, Air: 1 },
      },
      {
        label: "A quiet ritual",
        sub: "One bowl, no rush",
        weights: { Water: 2 },
      },
    ],
  },
] as const;

export interface FirstMeal {
  name: string;
  emoji: string;
  cuisine: string;
  cuisineSlug: string;
  method: string;
  blurb: string;
}

/** Keyed `${dominant}-${secondary}` across all 12 ordered element pairs. */
export const FIRST_MEALS: Record<string, FirstMeal> = {
  "Fire-Earth": {
    name: "Mapo tofu over jasmine rice",
    emoji: "🌶️",
    cuisine: "Chinese",
    cuisineSlug: "chinese",
    method: "Wok-seared",
    blurb:
      "Numbing heat with a deep, savory floor — fierce on top, grounded underneath.",
  },
  "Fire-Air": {
    name: "Pad krapow — Thai basil stir-fry",
    emoji: "🔥",
    cuisine: "Thai",
    cuisineSlug: "thai",
    method: "Flash stir-fry",
    blurb:
      "High flame, holy basil, and a fried egg — bright speed with real burn.",
  },
  "Fire-Water": {
    name: "Kimchi jjigae",
    emoji: "🍲",
    cuisine: "Korean",
    cuisineSlug: "korean",
    method: "Rolling simmer",
    blurb: "A bubbling red broth that manages to be both a fire and a bath.",
  },
  "Earth-Fire": {
    name: "Chorizo bolognese rigatoni",
    emoji: "🍝",
    cuisine: "Italian",
    cuisineSlug: "italian",
    method: "Slow sauté",
    blurb:
      "The house classic — paprika smoke folded into a patient, rich ragù.",
  },
  "Earth-Air": {
    name: "Wild mushroom risotto",
    emoji: "🍄",
    cuisine: "Italian",
    cuisineSlug: "italian",
    method: "Patient stir",
    blurb:
      "Forest-floor depth lifted with lemon zest and a green shower of herbs.",
  },
  "Earth-Water": {
    name: "Beef bourguignon",
    emoji: "🥘",
    cuisine: "French",
    cuisineSlug: "french",
    method: "Slow braise",
    blurb:
      "Hours of low heat until the wine, stock and beef stop being separate.",
  },
  "Air-Fire": {
    name: "Baja fish tacos with lime",
    emoji: "🌮",
    cuisine: "Mexican",
    cuisineSlug: "mexican",
    method: "Quick sear",
    blurb: "Crisp, citrus-struck and fast — sunshine with a chili edge.",
  },
  "Air-Earth": {
    name: "Chilled soba, sesame & scallion",
    emoji: "🥢",
    cuisine: "Japanese",
    cuisineSlug: "japanese",
    method: "Chilled toss",
    blurb: "Cool buckwheat with a toasted, nutty anchor — light but not thin.",
  },
  "Air-Water": {
    name: "Summer rolls with nuoc cham",
    emoji: "🌿",
    cuisine: "Vietnamese",
    cuisineSlug: "vietnamese",
    method: "Fresh assembly",
    blurb:
      "No flame at all — herbs, rice paper and a dip that does the talking.",
  },
  "Water-Fire": {
    name: "Tom yum goong",
    emoji: "🍤",
    cuisine: "Thai",
    cuisineSlug: "thai",
    method: "Aromatic boil",
    blurb: "Hot-and-sour broth where lemongrass and chili trade the lead.",
  },
  "Water-Earth": {
    name: "Miso-butter ramen",
    emoji: "🍜",
    cuisine: "Japanese",
    cuisineSlug: "japanese",
    method: "Slow simmer",
    blurb: "A broth with real weight — fermented depth rounded out in butter.",
  },
  "Water-Air": {
    name: "Chilled cucumber-yogurt soup",
    emoji: "🥒",
    cuisine: "Greek",
    cuisineSlug: "greek",
    method: "No-cook whisk",
    blurb: "Cold, bright and calm — dill and lemon over a cool cream base.",
  },
};

export interface FirstMealReading {
  totals: Record<PalateElement, number>;
  /** Display percentages, adjusted to sum to exactly 100. */
  pct: Record<PalateElement, number>;
  dominant: PalateElement;
  secondary: PalateElement;
  meal: FirstMeal;
}

/**
 * Score a completed quiz. `answers[i]` is the chosen option index for
 * question i. When a composite palate is present its normalized vector
 * distributes the same 2-point tip the old single sun-sign element got —
 * a one-hot vector reproduces the legacy behavior exactly, and passing
 * null/undefined is bit-identical to no personalization.
 */
export function scoreFirstMeal(
  answers: readonly number[],
  bias?: ElementVector | null,
): FirstMealReading {
  const totals: Record<PalateElement, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };
  FIRST_MEAL_QUIZ.forEach((q, i) => {
    const option = q.options[answers[i] ?? 0] ?? q.options[0];
    for (const el of ELEMENT_ORDER) {
      totals[el] += option.weights[el] ?? 0;
    }
  });
  if (bias) {
    const biasSum =
      ELEMENT_ORDER.reduce((acc, el) => acc + (bias[el] || 0), 0) || 1;
    for (const el of ELEMENT_ORDER) {
      totals[el] += ((bias[el] || 0) / biasSum) * 2;
    }
  }

  let dominant: PalateElement = ELEMENT_ORDER[0];
  for (const el of ELEMENT_ORDER) {
    if (totals[el] > totals[dominant]) dominant = el;
  }
  let secondary: PalateElement | null = null;
  for (const el of ELEMENT_ORDER) {
    if (el === dominant) continue;
    if (secondary === null || totals[el] > totals[secondary]) secondary = el;
  }
  secondary ??= ELEMENT_ORDER[1];

  const sum = ELEMENT_ORDER.reduce((acc, el) => acc + totals[el], 0) || 1;
  const pct: Record<PalateElement, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };
  let assigned = 0;
  for (const el of ELEMENT_ORDER) {
    pct[el] = Math.round((totals[el] / sum) * 100);
    assigned += pct[el];
  }
  pct[dominant] += 100 - assigned;

  return {
    totals,
    pct,
    dominant,
    secondary,
    meal: FIRST_MEALS[`${dominant}-${secondary}`],
  };
}

/** Load saved quiz answers, migrating the pre-rename key forward. */
export function loadSavedMealAnswers(): number[] | null {
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = window.localStorage.getItem(LEGACY_KEY);
      if (raw) {
        window.localStorage.setItem(STORAGE_KEY, raw);
        window.localStorage.removeItem(LEGACY_KEY);
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { answers?: number[] };
    if (
      Array.isArray(parsed.answers) &&
      parsed.answers.length === FIRST_MEAL_QUIZ.length &&
      parsed.answers.every(
        (a, i) =>
          Number.isInteger(a) &&
          a >= 0 &&
          a < FIRST_MEAL_QUIZ[i].options.length,
      )
    ) {
      return parsed.answers;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveMealAnswers(answers: readonly number[]): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers: [...answers] }),
    );
  } catch {
    /* localStorage unavailable */
  }
}
