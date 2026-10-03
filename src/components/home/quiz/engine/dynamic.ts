import { FEATURE_KEYS } from "@/lib/quiz/catalogContract";
import { INGREDIENT_GROUPS, type IngredientGroup } from "@/lib/quiz/dishLexicon";
import { neutral } from "./bank/build";
import { cuisineLabel, minutesLabel } from "./phrases";
import type { QuizChoice, QuizDish, QuizQuestion, ScoredDish } from "./types";

/**
 * Questions written on the spot from the dishes still in play, so no two
 * quizzes run the same way: a duel between two real front-runners, and
 * rapid-fire reactions to the ingredients that best split the field.
 */

function featureDistance(a: QuizDish, b: QuizDish): number {
  let total = 0;
  for (const key of FEATURE_KEYS) total += Math.abs(a.features[key] - b.features[key]);
  return total / FEATURE_KEYS.length;
}

export const DISH_CHOICE_PREFIX = "dish:";

function dishChoice(dish: QuizDish): QuizChoice {
  return {
    id: `${DISH_CHOICE_PREFIX}${dish.id}`,
    emoji: dish.emoji,
    label: dish.name,
    sub: `${cuisineLabel(dish.cuisine)} · ${minutesLabel(dish.minutes)}`,
    effect: { like: { ...dish.features } },
  };
}

/** Dish ids already shown in earlier duels: each dish duels at most once. */
export function duelledDishIds(asked: readonly QuizQuestion[]): Set<string> {
  const ids = new Set<string>();
  for (const question of asked) {
    if (question.format !== "duel") continue;
    for (const choice of question.choices) {
      if (choice.id.startsWith(DISH_CHOICE_PREFIX)) ids.add(choice.id.slice(DISH_CHOICE_PREFIX.length));
    }
  }
  return ids;
}

/**
 * The pair of front-runners that differ most, weighted by how likely both
 * still are: the duel whose answer moves the most probability.
 */
export function duelQuestion(
  field: readonly ScoredDish[],
  asked: readonly QuizQuestion[],
  random: () => number,
): QuizQuestion | null {
  const used = duelledDishIds(asked);
  const top = field.filter(({ dish }) => !used.has(dish.id)).slice(0, 14);
  let best: { a: QuizDish; b: QuizDish; score: number } | null = null;
  for (const [i, first] of top.entries()) {
    for (const second of top.slice(i + 1)) {
      const weight = Math.sqrt(first.probability * second.probability);
      const score = featureDistance(first.dish, second.dish) * weight * (1 + 0.2 * random());
      if (!best || score > best.score) best = { a: first.dish, b: second.dish, score };
    }
  }
  if (!best) return null;
  return {
    id: `duel-${best.a.id}--${best.b.id}`,
    format: "duel",
    facet: "duel",
    eyebrow: "Two real dishes, one gut call",
    prompt: "Which would you rather eat right now?",
    sub: "Both are still in the running. Your pick pulls the field toward it.",
    choices: [dishChoice(best.a), dishChoice(best.b), neutral("neither", "Neither grabs me", "Keep going")],
  };
}

function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -(p * Math.log(p) + (1 - p) * Math.log(1 - p));
}

export const REACTIONS: ReadonlyArray<{ suffix: string; emoji: string; label: string; weight: number | null }> = [
  { suffix: "love", emoji: "😍", label: "Yes please", weight: 1.4 },
  { suffix: "fine", emoji: "🙂", label: "Fine", weight: null },
  { suffix: "no", emoji: "🙅", label: "Not tonight", weight: -2 },
];

function reactionChoices(group: IngredientGroup): QuizChoice[] {
  return REACTIONS.map(({ suffix, emoji, label, weight }) => ({
    id: `${group.id}:${suffix}`,
    item: group.id,
    emoji,
    label,
    sub: group.label,
    effect: weight === null ? {} : { groups: { [group.id]: weight } },
    neutral: weight === null,
  }));
}

/** Groups already asked about in rapid-fire or ruled out as hard nos. */
export function settledGroups(asked: readonly QuizQuestion[]): Set<string> {
  const groups = new Set<string>();
  for (const question of asked) {
    for (const choice of question.choices) {
      if (choice.item) groups.add(choice.item);
      for (const group of choice.effect.excludeGroups ?? []) groups.add(group);
    }
  }
  return groups;
}

/**
 * Four ingredients whose presence splits the remaining field closest to
 * half-and-half (highest binary entropy), at most two of any one kind.
 */
export function rapidQuestion(
  field: readonly ScoredDish[],
  asked: readonly QuizQuestion[],
  random: () => number,
): QuizQuestion | null {
  const settled = settledGroups(asked);
  const ranked = INGREDIENT_GROUPS.filter((group) => !settled.has(group.id))
    .map((group) => {
      const mass = field.reduce((sum, { dish, probability }) => (dish.groups.includes(group.id) ? sum + probability : sum), 0);
      return { group, score: binaryEntropy(mass) * (1 + 0.3 * random()) };
    })
    .filter(({ score }) => score > 0.25)
    .sort((a, b) => b.score - a.score);
  const items: IngredientGroup[] = [];
  for (const { group } of ranked) {
    if (items.filter((item) => item.kind === group.kind).length < 2) items.push(group);
    if (items.length === 4) break;
  }
  if (items.length < 3) return null;
  return {
    id: `rapid-${items.map((item) => item.id).join("-")}`,
    format: "rapid",
    facet: "ingredients",
    eyebrow: "Rapid fire",
    prompt: "Gut reactions, no overthinking",
    sub: "Tap a face for each. Skip any you don't care about.",
    choices: items.flatMap(reactionChoices),
  };
}
