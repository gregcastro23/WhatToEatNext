import { answerLogLikelihood, hardLimits, type HardLimits } from "./effects";
import type {
  CourseKey,
  QuizAnswers,
  QuizDish,
  QuizMoment,
  QuizQuestion,
  QuizRules,
  ScoredDish,
  TimeOfDay,
} from "./types";

/**
 * How well each course suits the hour, in log-odds. A breakfast dish at
 * breakfast time starts e^1 ≈ 2.7× likelier than a neutral one; dessert is
 * held back until the diner asks for something sweet.
 */
const COURSE_FIT: Readonly<Record<TimeOfDay, Readonly<Record<CourseKey, number>>>> = {
  morning: { breakfast: 1, lunch: 0, dinner: -0.3, dessert: -1.6 },
  afternoon: { breakfast: -0.4, lunch: 0.6, dinner: 0.2, dessert: -1.2 },
  evening: { breakfast: -0.8, lunch: 0.2, dinner: 0.8, dessert: -1.2 },
  night: { breakfast: -0.4, lunch: 0, dinner: 0.4, dessert: -0.4 },
};

/** Largest nudge the table's elemental bias may give one dish, in log-odds. */
const TABLE_NUDGE_CAP = 0.6;

export function allowedByRules(dish: QuizDish, rules: QuizRules, limits: HardLimits): boolean {
  if (rules.diet && !dish.diets.includes(rules.diet)) return false;
  if (rules.allergens.some((allergen) => dish.allergens.includes(allergen))) return false;
  if (dish.groups.some((group) => limits.excludeGroups.has(group))) return false;
  const { maxMinutes } = limits;
  return maxMinutes === null || dish.minutes === null || dish.minutes <= 2 * maxMinutes;
}

function timePenalty(dish: QuizDish, maxMinutes: number | null): number {
  if (maxMinutes === null || dish.minutes === null || dish.minutes <= maxMinutes) return 0;
  return (-1.5 * (dish.minutes - maxMinutes)) / maxMinutes;
}

export function priorLogOdds(dish: QuizDish, moment: QuizMoment): number {
  const fits = dish.courses.map((course) => COURSE_FIT[moment.timeOfDay][course]);
  let prior = fits.length ? Math.max(...fits) : 0;
  if (dish.seasons.includes(moment.season)) prior += 0.2;
  else if (dish.seasons.length > 0) prior -= 0.2;
  const bias = moment.elementalBias;
  if (bias) {
    const total = bias.Fire + bias.Water + bias.Earth + bias.Air;
    if (total > 0) {
      const dot =
        (bias.Fire * dish.elements.Fire +
          bias.Water * dish.elements.Water +
          bias.Earth * dish.elements.Earth +
          bias.Air * dish.elements.Air) /
        total;
      prior += Math.max(-TABLE_NUDGE_CAP, Math.min(TABLE_NUDGE_CAP, 3 * (dot - 0.25)));
    }
  }
  return prior;
}

export interface PosteriorInput {
  dishes: readonly QuizDish[];
  questions: readonly QuizQuestion[];
  answers: QuizAnswers;
  rules: QuizRules;
  moment: QuizMoment;
}

/** Every allowed dish with its probability, most likely first. */
export function posterior(input: PosteriorInput): ScoredDish[] {
  const { dishes, questions, answers, rules, moment } = input;
  const limits = hardLimits(questions, answers);
  const logs: Array<{ dish: QuizDish; log: number }> = [];
  for (const dish of dishes) {
    if (!allowedByRules(dish, rules, limits)) continue;
    let log = priorLogOdds(dish, moment) + timePenalty(dish, limits.maxMinutes);
    for (const question of questions) {
      const chosen = answers[question.id];
      if (chosen) log += answerLogLikelihood(question, chosen, dish, rules);
    }
    logs.push({ dish, log });
  }
  return normalize(logs);
}

function normalize(logs: ReadonlyArray<{ dish: QuizDish; log: number }>): ScoredDish[] {
  if (logs.length === 0) return [];
  const max = Math.max(...logs.map(({ log }) => log));
  const weights = logs.map(({ dish, log }) => ({ dish, weight: Math.exp(log - max) }));
  const total = weights.reduce((sum, { weight }) => sum + weight, 0);
  return weights
    .map(({ dish, weight }) => ({ dish, probability: weight / total }))
    .sort((a, b) => b.probability - a.probability || a.dish.id.localeCompare(b.dish.id));
}

/** Shannon entropy in nats. */
export function entropy(probabilities: readonly number[]): number {
  return -probabilities.reduce((sum, p) => (p > 0 ? sum + p * Math.log(p) : sum), 0);
}

/** "Dishes in play": e^H, the size of a uniform field with the same uncertainty. */
export function dishesInPlay(scored: readonly ScoredDish[]): number {
  return Math.max(1, Math.round(Math.exp(entropy(scored.map(({ probability }) => probability)))));
}

/** The most likely `count` dishes, renormalized: the field selection works on. */
export function topField(scored: readonly ScoredDish[], count: number): ScoredDish[] {
  const top = scored.slice(0, count);
  const total = top.reduce((sum, { probability }) => sum + probability, 0);
  return total > 0 ? top.map((item) => ({ ...item, probability: item.probability / total })) : top;
}
