import { FEATURE_KEYS, type FeatureKey } from "@/lib/quiz/catalogContract";
import type { ChoiceEffect, QuizChoice, QuizDish, QuizQuestion, QuizRules } from "./types";

/**
 * How strongly one answer moves the odds. With λ = 0.7, picking an option
 * whose utility is 2 points higher for dish A than for dish B multiplies A's
 * odds against B by e^1.4 ≈ 4.
 */
export const LAMBDA = 0.7;
export const SKIP_ID = "__skip";

const SINGLE_FORMATS = new Set(["choice", "versus", "slider", "duel", "sky"]);

export function isSingleChoice(question: QuizQuestion): boolean {
  return SINGLE_FORMATS.has(question.format);
}

function isFeatureKey(value: string): value is FeatureKey {
  return FEATURE_KEYS.some((key) => key === value);
}

/** 1 when the dish's features equal the target, −1 when maximally far. */
function likeness(target: ChoiceEffect["like"], dish: QuizDish): number {
  let distance = 0;
  let count = 0;
  for (const [key, value] of Object.entries(target ?? {})) {
    if (!isFeatureKey(key)) continue;
    distance += Math.abs(dish.features[key] - value);
    count += 1;
  }
  return count === 0 ? 0 : 1 - (2 * distance) / count;
}

/** The utility of one choice for one dish: higher means "this answer fits it". */
export function choiceUtility(effect: ChoiceEffect, dish: QuizDish): number {
  let total = 0;
  for (const [key, lean] of Object.entries(effect.leans ?? {})) {
    if (isFeatureKey(key)) total += lean * (2 * dish.features[key] - 1);
  }
  for (const [group, weight] of Object.entries(effect.groups ?? {})) {
    if (dish.groups.includes(group)) total += weight;
  }
  total += effect.families?.[dish.family] ?? 0;
  for (const course of dish.courses) total += effect.courses?.[course] ?? 0;
  if (effect.like) total += 3 * likeness(effect.like, dish);
  return total;
}

/** The choices a diner was actually shown, given their dietary rules. */
export function offeredChoices(question: QuizQuestion, rules: QuizRules): QuizChoice[] {
  const { diet } = rules;
  return question.choices.filter((choice) => !diet || !choice.hiddenFor?.includes(diet));
}

function logSumExp(values: readonly number[]): number {
  const max = Math.max(...values);
  if (!Number.isFinite(max)) return max;
  return max + Math.log(values.reduce((sum, value) => sum + Math.exp(value - max), 0));
}

/**
 * log P(answer | dish). Single-choice questions use a softmax over the
 * non-neutral options offered, so a dish that suits every option gains
 * nothing. Multi-select and rapid-fire answers add each picked option's
 * utility (multi-select scaled by 1/√n so ticking everything isn't louder).
 */
export function answerLogLikelihood(
  question: QuizQuestion,
  chosenIds: readonly string[],
  dish: QuizDish,
  rules: QuizRules,
): number {
  const offered = offeredChoices(question, rules).filter((choice) => !choice.neutral);
  const chosen = offered.filter((choice) => chosenIds.includes(choice.id));
  if (chosen.length === 0) return 0;
  if (isSingleChoice(question)) {
    const [picked] = chosen;
    if (!picked || offered.length < 2) return 0;
    const logits = offered.map((choice) => LAMBDA * choiceUtility(choice.effect, dish));
    return LAMBDA * choiceUtility(picked.effect, dish) - logSumExp(logits);
  }
  const sum = chosen.reduce((total, choice) => total + choiceUtility(choice.effect, dish), 0);
  const scale = question.format === "rapid" ? 1 : 1 / Math.sqrt(chosen.length);
  return LAMBDA * sum * scale;
}

export interface HardLimits {
  excludeGroups: Set<string>;
  maxMinutes: number | null;
}

/** Collects the hard rules ("hard nos", time limits) from the answers so far. */
export function hardLimits(
  questions: readonly QuizQuestion[],
  answers: Readonly<Record<string, readonly string[]>>,
): HardLimits {
  const excludeGroups = new Set<string>();
  let maxMinutes: number | null = null;
  for (const question of questions) {
    const chosen = answers[question.id] ?? [];
    for (const choice of question.choices) {
      if (!chosen.includes(choice.id)) continue;
      for (const group of choice.effect.excludeGroups ?? []) excludeGroups.add(group);
      const limit = choice.effect.maxMinutes;
      if (limit !== undefined) maxMinutes = Math.min(maxMinutes ?? limit, limit);
    }
  }
  return { excludeGroups, maxMinutes };
}
