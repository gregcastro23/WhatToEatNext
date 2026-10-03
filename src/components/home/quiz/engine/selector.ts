import { STATIC_BANK } from "./bank";
import { duelQuestion, rapidQuestion } from "./dynamic";
import { choiceUtility, isSingleChoice, LAMBDA, offeredChoices } from "./effects";
import { entropy, posterior, topField } from "./posterior";
import { stepRandom } from "./rng";
import { skyQuestions } from "./skyQuestions";
import type {
  BankQuestion,
  QuizAnswers,
  QuizDish,
  QuizMoment,
  QuizQuestion,
  QuizRules,
  ScoredDish,
} from "./types";

/**
 * Picks the next question. Each candidate is scored by its expected
 * information gain over the dishes still in play (how much, on average, its
 * answer would shrink the uncertainty), then shaped for variety and pacing.
 */

/** Dishes the gain is computed over: the likeliest 240 hold almost all the mass. */
const FIELD_SIZE = 240;

function softmax(values: readonly number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

/** H(field) − E[H(field | answer)], with answers modeled as softmax over utility. */
export function expectedGain(question: QuizQuestion, field: readonly ScoredDish[], rules: QuizRules): number {
  if (question.format === "rapid") return rapidGain(question, field);
  const options = offeredChoices(question, rules).filter((choice) => !choice.neutral && !choice.exclusive);
  if (options.length < 2) return 0;
  const joint = field.map(({ dish, probability }) =>
    softmax(options.map((choice) => LAMBDA * choiceUtility(choice.effect, dish))).map((p) => p * probability),
  );
  let expected = 0;
  for (const [index] of options.entries()) {
    const column = joint.map((row) => row[index] ?? 0);
    const mass = column.reduce((sum, value) => sum + value, 0);
    if (mass > 0) expected += mass * entropy(column.map((value) => value / mass));
  }
  const gain = entropy(field.map(({ probability }) => probability)) - expected;
  return isSingleChoice(question) ? gain : 0.8 * gain;
}

function rapidGain(question: QuizQuestion, field: readonly ScoredDish[]): number {
  const items = new Set(question.choices.map((choice) => choice.item).filter((item) => item !== undefined));
  let total = 0;
  for (const item of items) {
    const mass = field.reduce((sum, { dish, probability }) => (dish.groups.includes(item) ? sum + probability : sum), 0);
    if (mass > 0 && mass < 1) total -= mass * Math.log(mass) + (1 - mass) * Math.log(1 - mass);
  }
  return 0.5 * total;
}

export interface SelectionInput {
  dishes: readonly QuizDish[];
  asked: readonly QuizQuestion[];
  answers: QuizAnswers;
  rules: QuizRules;
  moment: QuizMoment;
  seed: number;
  target: number;
}

interface Pacing {
  step: number;
  recentFive: readonly string[];
  target: number;
  facets: ReadonlySet<string>;
  lastFormat: string | null;
  skyAsked: number;
  recentFormats: readonly string[];
  countOf: (format: string) => number;
}

function pacingOf(asked: readonly QuizQuestion[], target: number): Pacing {
  return {
    step: asked.length,
    recentFive: asked.slice(-5).map((question) => question.format),
    target,
    facets: new Set(asked.map((question) => question.facet)),
    lastFormat: asked.at(-1)?.format ?? null,
    skyAsked: asked.filter((question) => question.format === "sky").length,
    recentFormats: asked.slice(-3).map((question) => question.format),
    countOf: (format: string): number => asked.filter((question) => question.format === format).length,
  };
}

/** Pacing multiplier: 0 means "not now". */
export function pacingWeight(question: QuizQuestion, pacing: Pacing): number {
  const { step, target } = pacing;
  if (question.format === "sky") {
    const cap = target <= 6 ? 1 : target <= 12 ? 2 : 3;
    if (step === 0 || pacing.skyAsked >= cap) return 0;
    return pacing.skyAsked === 0 ? 3 : 0.8;
  }
  if (question.format === "duel") {
    const ok = step >= 3 && !pacing.recentFormats.includes("duel") && pacing.countOf("duel") < Math.ceil(target / 5);
    return ok ? 1.1 : 0;
  }
  if (question.format === "rapid") {
    const ok = step >= 2 && !pacing.recentFormats.includes("rapid") && pacing.countOf("rapid") < Math.ceil(target / 6);
    return ok ? 1 : 0;
  }
  let weight = pacing.facets.has(question.facet) ? 0.3 : 1;
  if (question.format === pacing.lastFormat) weight *= 0.6;
  // Keep the mix varied: each recent use of this format costs 15%.
  weight *= 0.85 ** pacing.recentFive.filter((format) => format === question.format).length;
  if (question.facet === "dislikes" && step >= 2 && step <= 5) weight *= 2.5;
  return weight;
}

/** Strips bank-only fields so the asked question is plain, storable data. */
export function asAsked(question: BankQuestion): QuizQuestion {
  const { opener: _opener, when: _when, ...plain } = question;
  return plain;
}

function opening(input: SelectionInput, random: () => number): QuizQuestion | null {
  const openers = STATIC_BANK.filter((question) => question.opener && (!question.when || question.when(input.moment)));
  const ranked = openers.map((question) => ({ question, score: random() })).sort((a, b) => b.score - a.score);
  const [first] = ranked;
  return first ? asAsked(first.question) : null;
}

function candidates(input: SelectionInput, field: readonly ScoredDish[], random: () => number): QuizQuestion[] {
  const askedIds = new Set(input.asked.map((question) => question.id));
  const bank = STATIC_BANK.filter((question) => !askedIds.has(question.id) && (!question.when || question.when(input.moment))).map(asAsked);
  const sky = skyQuestions(input.moment).filter((question) => !askedIds.has(question.id));
  const generated = [duelQuestion(field, input.asked, random), rapidQuestion(field, input.asked, random)];
  return [...bank, ...sky, ...generated.filter((question): question is QuizQuestion => question !== null)];
}

/** The next question to ask, or null when nothing useful is left to ask. */
export function nextQuestion(input: SelectionInput): QuizQuestion | null {
  const random = stepRandom(input.seed, input.asked.length);
  if (input.asked.length === 0) return opening(input, random);
  const scored = posterior({ ...input, questions: input.asked });
  if (scored.length === 0) return null;
  const field = topField(scored, FIELD_SIZE);
  const pacing = pacingOf(input.asked, input.target);
  let best: { question: QuizQuestion; score: number } | null = null;
  for (const question of candidates(input, field, random)) {
    const weight = pacingWeight(question, pacing);
    if (weight === 0) continue;
    const score = (0.05 + expectedGain(question, field, input.rules)) * weight * (1 + 0.25 * random());
    if (!best || score > best.score) best = { question, score };
  }
  return best ? best.question : null;
}
