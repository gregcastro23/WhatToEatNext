import { STATIC_BANK } from "../engine/bank";
import { duelQuestion, rapidQuestion } from "../engine/dynamic";
import { choiceUtility, offeredChoices } from "../engine/effects";
import { posterior } from "../engine/posterior";
import { mulberry32 } from "../engine/rng";
import { nextQuestion, type SelectionInput } from "../engine/selector";
import type { QuizDish, QuizQuestion, SkySnapshot } from "../engine/types";
import { MOMENT, NO_RULES, syntheticCatalog } from "./helpers/quizFixtures";

const catalog = syntheticCatalog(60);

/** A diner who secretly wants `target` and answers every question the way it would. */
function oracleAnswer(question: QuizQuestion, target: QuizDish): string[] {
  const offered = offeredChoices(question, NO_RULES);
  if (question.format === "rapid") {
    const items = [...new Set(offered.map((choice) => choice.item))];
    return items.flatMap((item) => (item ? [`${item}:${target.groups.includes(item) ? "love" : "no"}`] : []));
  }
  const scored = offered
    .filter((choice) => !choice.neutral && !choice.exclusive)
    .filter((choice) => !(choice.effect.excludeGroups ?? []).some((group) => target.groups.includes(group)))
    .sort((a, b) => choiceUtility(b.effect, target) - choiceUtility(a.effect, target));
  const best = scored[0] ?? offered[0];
  return best ? [best.id] : [];
}

function play(target: QuizDish, count: number, seed: number, extra: Partial<SelectionInput> = {}): { asked: QuizQuestion[]; rank: number } {
  const asked: QuizQuestion[] = [];
  const answers: Record<string, string[]> = {};
  for (let step = 0; step < count; step += 1) {
    const question = nextQuestion({ dishes: catalog, asked, answers, rules: NO_RULES, moment: MOMENT, seed, target: count, ...extra });
    if (!question) break;
    asked.push(question);
    answers[question.id] = oracleAnswer(question, target);
  }
  const ranked = posterior({ dishes: catalog, questions: asked, answers, rules: NO_RULES, moment: MOMENT });
  return { asked, rank: ranked.findIndex(({ dish }) => dish.id === target.id) + 1 };
}

describe("question selection", () => {
  it("opens with an opener, deterministically per seed, varied across seeds", () => {
    const base = { dishes: catalog, asked: [], answers: {}, rules: NO_RULES, moment: MOMENT, target: 10 };
    const openers = new Set(STATIC_BANK.filter((question) => question.opener).map((question) => question.id));
    const firsts = Array.from({ length: 30 }, (_, seed) => nextQuestion({ ...base, seed })?.id ?? "");
    expect(firsts.every((id) => openers.has(id))).toBe(true);
    expect(new Set(firsts).size).toBeGreaterThanOrEqual(4);
    expect(nextQuestion({ ...base, seed: 3 })?.id).toBe(nextQuestion({ ...base, seed: 3 })?.id);
  });

  it("never repeats a question and mixes formats", () => {
    const target = catalog[5];
    if (!target) throw new Error("fixture catalog is empty");
    const { asked } = play(target, 20, 11);
    expect(asked).toHaveLength(20);
    expect(new Set(asked.map((question) => question.id)).size).toBe(20);
    expect(new Set(asked.map((question) => question.format)).size).toBeGreaterThanOrEqual(4);
    const firstDuel = asked.findIndex((question) => question.format === "duel");
    expect(firstDuel === -1 || firstDuel >= 3).toBe(true);
  });

  it("asks about the live sky early but within its cap", () => {
    const sky: SkySnapshot = {
      computedAt: "2026-10-03T18:00:00.000Z",
      moon: { sign: "scorpio", degree: 12, hoursLeftInSign: 30 },
      sun: { sign: "libra" },
      phase: { name: "full moon", illumination: 0.98 },
      retrogrades: ["mercury"],
      aspect: { a: "moon", b: "mars", kind: "square", orb: 1.2 },
    };
    const target = catalog[9];
    if (!target) throw new Error("fixture catalog is empty");
    const { asked } = play(target, 6, 21, { moment: { ...MOMENT, sky } });
    const skyAt = asked.map((question, index) => (question.format === "sky" ? index : -1)).filter((index) => index >= 0);
    expect(skyAt).toHaveLength(1);
    expect(skyAt[0]).toBeLessThanOrEqual(3);
  });

  it("finds the dish a diner has in mind", () => {
    const ranks = catalog.slice(0, 24).map((target, index) => play(target, 10, 100 + index).rank);
    const topFive = ranks.filter((rank) => rank >= 1 && rank <= 5).length;
    // Measured 2026-10-03 on this fixture: 24/24 at rank 1 after ten questions
    // (23/24 after five). With answers ignored (λ = 0) the same check fails.
    expect(topFive).toBeGreaterThanOrEqual(20);
  });
});

describe("generated questions", () => {
  const field = posterior({ dishes: catalog, questions: [], answers: {}, rules: NO_RULES, moment: MOMENT });

  it("duels two real front-runners, each at most once", () => {
    const duel = duelQuestion(field, [], mulberry32(1));
    expect(duel?.choices.filter((choice) => choice.id.startsWith("dish:"))).toHaveLength(2);
    const again = duel ? duelQuestion(field, [duel], mulberry32(1)) : null;
    const firstIds = new Set(duel?.choices.map((choice) => choice.id));
    expect(again?.choices.some((choice) => choice.id.startsWith("dish:") && firstIds.has(choice.id))).toBe(false);
  });

  it("rapid-fire asks about 3–4 ingredients with three reactions each", () => {
    const rapid = rapidQuestion(field, [], mulberry32(2));
    const items = new Set(rapid?.choices.map((choice) => choice.item));
    expect(items.size).toBeGreaterThanOrEqual(3);
    expect(items.size).toBeLessThanOrEqual(4);
    expect(rapid?.choices).toHaveLength(items.size * 3);
  });
});

describe("question bank", () => {
  it("has unique ids and at least two answerable options per question", () => {
    const ids = STATIC_BANK.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const question of STATIC_BANK) {
      for (const diet of [null, "vegetarian", "vegan", "pescatarian"] satisfies Array<typeof NO_RULES.diet>) {
        const offered = offeredChoices(question, { diet, allergens: [] }).filter((choice) => !choice.neutral);
        expect(offered.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
