import { FEATURE_KEYS } from "@/lib/quiz/catalogContract";
import { ingredientGroup } from "@/lib/quiz/dishLexicon";
import { answerLogLikelihood, offeredChoices } from "./effects";
import { FAMILY_LABELS, FEATURE_WORDS } from "./phrases";
import { dishesInPlay, posterior, type PosteriorInput } from "./posterior";
import type { FeatureKey, QuizChoice, QuizDish, QuizQuestion, QuizRules, ScoredDish } from "./types";

export interface QuizReason {
  question: string;
  answer: string;
  because: string;
}

export interface QuizOutcome {
  hero: ScoredDish;
  alternates: ReadonlyArray<{ tag: string; scored: ScoredDish }>;
  reasons: readonly QuizReason[];
  profile: ReadonlyArray<{ key: FeatureKey; label: string; lift: number }>;
  inPlay: number;
  runnersUp: readonly ScoredDish[];
  skyNote: string | null;
  servings: number | null;
}

function distance(a: QuizDish, b: QuizDish): number {
  let total = 0;
  for (const key of FEATURE_KEYS) total += Math.abs(a.features[key] - b.features[key]);
  return total / FEATURE_KEYS.length + (a.family === b.family ? 0 : 0.08);
}

/** Maximal marginal relevance: likely, but not a near-copy of the hero. */
function diverseAlternate(ranked: readonly ScoredDish[], hero: QuizDish): ScoredDish | null {
  let best: { scored: ScoredDish; score: number } | null = null;
  for (const scored of ranked.slice(1, 30)) {
    const score = Math.sqrt(scored.probability) * (0.35 + distance(scored.dish, hero));
    if (!best || score > best.score) best = { scored, score };
  }
  return best ? best.scored : null;
}

/** The likeliest adventurous dish from a different cuisine family. */
function wildcard(ranked: readonly ScoredDish[], taken: ReadonlySet<string>, hero: QuizDish): ScoredDish | null {
  return (
    ranked
      .slice(1, 80)
      .find(({ dish }) => !taken.has(dish.id) && dish.family !== hero.family && dish.features.adventure >= 0.6) ?? null
  );
}

/** The phrase for the feature through which a choice most favored this dish. */
function becausePhrase(choice: QuizChoice, dish: QuizDish): string {
  let best: { phrase: string; weight: number } | null = null;
  for (const [key, lean] of Object.entries(choice.effect.leans ?? {})) {
    const feature = FEATURE_KEYS.find((candidate) => candidate === key);
    if (!feature) continue;
    const pull = lean * (2 * dish.features[feature] - 1);
    const words = FEATURE_WORDS[feature];
    if (pull > 0 && (!best || pull > best.weight)) best = { phrase: lean > 0 ? words.high : words.low, weight: pull };
  }
  if (best) return `It ${best.phrase}.`;
  return groupPhrase(choice, dish) ?? otherPhrase(choice, dish);
}

function groupPhrase(choice: QuizChoice, dish: QuizDish): string | null {
  for (const [id, weight] of Object.entries(choice.effect.groups ?? {})) {
    const label = ingredientGroup(id)?.label.toLowerCase() ?? id;
    if (weight > 0 && dish.groups.includes(id)) return `It features ${label}.`;
    if (weight < 0 && !dish.groups.includes(id)) return `No ${label} in sight.`;
  }
  return null;
}

function otherPhrase(choice: QuizChoice, dish: QuizDish): string {
  if ((choice.effect.families?.[dish.family] ?? 0) > 0) return `It's ${FAMILY_LABELS[dish.family] ?? dish.family}.`;
  if (choice.effect.like) return "It's the dish you picked in the duel, or its close cousin.";
  if ((choice.effect.excludeGroups ?? []).length) return "None of your hard nos.";
  return "It fits what you chose.";
}

/** For rapid-fire, the single reaction that most favored this dish. */
function strongestPick(question: QuizQuestion, chosen: readonly string[], dish: QuizDish, rules: QuizRules): QuizChoice | undefined {
  const picks = offeredChoices(question, rules).filter((choice) => chosen.includes(choice.id) && !choice.neutral);
  if (question.format !== "rapid") return picks[0];
  return picks
    .map((choice) => ({ choice, lift: answerLogLikelihood(question, [choice.id], dish, rules) }))
    .sort((a, b) => b.lift - a.lift)[0]?.choice;
}

/** The three answers that most favored the hero over the average dish in play. */
function reasonsFor(
  hero: QuizDish,
  ranked: readonly ScoredDish[],
  questions: readonly QuizQuestion[],
  answers: Readonly<Record<string, readonly string[]>>,
  rules: QuizRules,
): QuizReason[] {
  const field = ranked.slice(0, 60);
  const rows: Array<QuizReason & { lift: number }> = [];
  for (const question of questions) {
    const chosen = answers[question.id] ?? [];
    const picked = strongestPick(question, chosen, hero, rules);
    if (!picked) continue;
    const heroLog = answerLogLikelihood(question, chosen, hero, rules);
    const mean = field.reduce((sum, { dish, probability }) => sum + probability * answerLogLikelihood(question, chosen, dish, rules), 0);
    const answer = picked.item ? `${ingredientGroup(picked.item)?.label ?? picked.item}: ${picked.label}` : picked.label;
    rows.push({ question: question.prompt, answer, because: becausePhrase(picked, hero), lift: heroLog - mean });
  }
  return rows
    .filter((row) => row.lift > 0.05)
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 3)
    .map(({ question, answer, because }) => ({ question, answer, because }));
}

/** Features where the likeliest dishes differ most from the whole catalog. */
function cravingProfile(ranked: readonly ScoredDish[], dishes: readonly QuizDish[]): QuizOutcome["profile"] {
  const top = ranked.slice(0, 25);
  const mass = top.reduce((sum, { probability }) => sum + probability, 0);
  return FEATURE_KEYS.map((key) => {
    const field = top.reduce((sum, { dish, probability }) => sum + dish.features[key] * probability, 0) / (mass > 0 ? mass : 1);
    const base = dishes.reduce((sum, dish) => sum + dish.features[key], 0) / Math.max(1, dishes.length);
    return { key, label: FEATURE_WORDS[key].label, lift: field - base };
  })
    .filter(({ lift }) => lift > 0.08)
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 5);
}

function skyNoteFor(questions: readonly QuizQuestion[], answers: Readonly<Record<string, readonly string[]>>): string | null {
  for (const question of questions) {
    if (question.format !== "sky") continue;
    const picked = question.choices.find((choice) => (answers[question.id] ?? []).includes(choice.id) && !choice.neutral);
    if (picked) return `${question.eyebrow}. You read it as “${picked.label}”, so the field leaned that way.`;
  }
  return null;
}

function servingsFrom(questions: readonly QuizQuestion[], answers: Readonly<Record<string, readonly string[]>>): number | null {
  for (const question of questions) {
    const picked = question.choices.find((choice) => (answers[question.id] ?? []).includes(choice.id));
    if (picked?.effect.servings !== undefined) return picked.effect.servings;
  }
  return null;
}

export function quizOutcome(input: PosteriorInput): QuizOutcome | null {
  const ranked = posterior(input);
  const [hero] = ranked;
  if (!hero) return null;
  const alternates: Array<{ tag: string; scored: ScoredDish }> = [];
  const also = diverseAlternate(ranked, hero.dish);
  if (also) alternates.push({ tag: "Also right for you", scored: also });
  const taken = new Set([hero.dish.id, ...alternates.map(({ scored }) => scored.dish.id)]);
  const wild = wildcard(ranked, taken, hero.dish);
  if (wild) alternates.push({ tag: "The wildcard", scored: wild });
  return {
    hero,
    alternates,
    reasons: reasonsFor(hero.dish, ranked, input.questions, input.answers, input.rules),
    profile: cravingProfile(ranked, input.dishes),
    inPlay: dishesInPlay(ranked),
    runnersUp: ranked.slice(1, 8),
    skyNote: skyNoteFor(input.questions, input.answers),
    servings: servingsFrom(input.questions, input.answers),
  };
}
