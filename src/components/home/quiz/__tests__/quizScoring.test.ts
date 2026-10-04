import { answerLogLikelihood, choiceUtility, hardLimits } from "../engine/effects";
import { dishesInPlay, posterior, priorLogOdds } from "../engine/posterior";
import { quizOutcome } from "../engine/result";
import type { QuizMoment, QuizQuestion } from "../engine/types";
import { dish, MOMENT, NO_RULES } from "./helpers/quizFixtures";

const soup = dish("soup", { features: { brothy: 1, warmth: 1 }, groups: ["noodles"] });
const salad = dish("salad", { features: { fresh: 1, warmth: 0 }, family: "mediterranean", groups: ["cilantro"] });
const curry = dish("curry", { features: { spice: 1, warmth: 1, aromatic: 1 }, family: "south-asian", minutes: 90 });

const bowlOrPlate: QuizQuestion = {
  id: "bowl",
  format: "choice",
  facet: "texture",
  eyebrow: "",
  prompt: "Bowl or plate?",
  choices: [
    { id: "bowl", label: "A steaming bowl", effect: { leans: { brothy: 2, warmth: 1 } } },
    { id: "plate", label: "Something crisp", effect: { leans: { fresh: 2 } } },
    { id: "either", label: "Either", effect: {}, neutral: true },
  ],
};

describe("answer likelihoods", () => {
  it("scores utility from features, groups and families", () => {
    expect(choiceUtility({ leans: { brothy: 2 } }, soup)).toBe(2);
    expect(choiceUtility({ leans: { brothy: 2 } }, salad)).toBe(-2);
    expect(choiceUtility({ groups: { noodles: 1.5 } }, soup)).toBe(1.5);
    expect(choiceUtility({ families: { mediterranean: 1 } }, salad)).toBe(1);
  });

  it("is a proper probability over the offered options for single-choice questions", () => {
    for (const subject of [soup, salad, curry]) {
      const total = ["bowl", "plate"].reduce(
        (sum, id) => sum + Math.exp(answerLogLikelihood(bowlOrPlate, [id], subject, NO_RULES)),
        0,
      );
      expect(total).toBeCloseTo(1, 10);
    }
  });

  it("treats a neutral answer as no evidence", () => {
    expect(answerLogLikelihood(bowlOrPlate, ["either"], soup, NO_RULES)).toBe(0);
  });
});

describe("posterior", () => {
  const dishes = [soup, salad, curry];

  it("sums to one and moves toward the answer", () => {
    const before = posterior({ dishes, questions: [], answers: {}, rules: NO_RULES, moment: MOMENT });
    const after = posterior({ dishes, questions: [bowlOrPlate], answers: { bowl: ["bowl"] }, rules: NO_RULES, moment: MOMENT });
    expect(after.reduce((sum, { probability }) => sum + probability, 0)).toBeCloseTo(1, 10);
    const soupBefore = before.find(({ dish: d }) => d.id === "soup")?.probability ?? 0;
    expect(after[0]?.dish.id).toBe("soup");
    expect(after[0]?.probability ?? 0).toBeGreaterThan(soupBefore);
    expect(dishesInPlay(after)).toBeLessThanOrEqual(dishesInPlay(before));
  });

  it("enforces diet, allergens, hard nos and time limits", () => {
    const vegan = dish("vegan", { diets: ["vegan", "vegetarian", "pescatarian"] });
    const peanut = dish("peanut", { diets: ["vegan", "vegetarian", "pescatarian"], allergens: ["peanuts"] });
    const ids = (rules: typeof NO_RULES): string[] =>
      posterior({ dishes: [soup, vegan, peanut], questions: [], answers: {}, rules, moment: MOMENT }).map(({ dish: d }) => d.id);
    expect(ids({ diet: "vegan", allergens: [] })).toEqual(expect.arrayContaining(["vegan", "peanut"]));
    expect(ids({ diet: "vegan", allergens: [] })).not.toContain("soup");
    expect(ids({ diet: null, allergens: ["peanuts"] })).not.toContain("peanut");

    const hardNo: QuizQuestion = { ...bowlOrPlate, id: "nos", format: "multi", choices: [{ id: "cil", label: "Cilantro", effect: { excludeGroups: ["cilantro"] } }] };
    const quick: QuizQuestion = { ...bowlOrPlate, id: "time", choices: [{ id: "15", label: "Fast", effect: { maxMinutes: 20 } }] };
    const left = posterior({ dishes, questions: [hardNo, quick], answers: { nos: ["cil"], time: ["15"] }, rules: NO_RULES, moment: MOMENT });
    expect(left.map(({ dish: d }) => d.id)).toEqual(["soup"]);
    expect(hardLimits([hardNo, quick], { nos: ["cil"], time: ["15"] }).maxMinutes).toBe(20);
  });

  it("prefers breakfast in the morning and holds dessert back", () => {
    const breakfast = dish("eggs", { courses: ["breakfast"] });
    const dessert = dish("cake", { courses: ["dessert"] });
    const morning: QuizMoment = { ...MOMENT, timeOfDay: "morning" };
    expect(priorLogOdds(breakfast, morning)).toBeGreaterThan(priorLogOdds(soup, morning));
    expect(priorLogOdds(dessert, MOMENT)).toBeLessThan(0);
  });

  it("caps the table's elemental nudge", () => {
    const fiery = dish("fiery", { elements: { Fire: 1, Water: 0, Earth: 0, Air: 0 } });
    const bias = { ...MOMENT, elementalBias: { Fire: 1, Water: 0, Earth: 0, Air: 0 } };
    expect(priorLogOdds(fiery, bias) - priorLogOdds(fiery, MOMENT)).toBeCloseTo(0.6, 10);
  });
});

describe("outcome", () => {
  it("names the hero, a diverse alternate and the reasons that favored it", () => {
    const outcome = quizOutcome({
      dishes: [soup, salad, curry, dish("soup-2", { features: { brothy: 0.9, warmth: 1 } })],
      questions: [bowlOrPlate],
      answers: { bowl: ["bowl"] },
      rules: NO_RULES,
      moment: MOMENT,
    });
    expect(outcome?.hero.dish.id).toMatch(/^soup/);
    expect(outcome?.alternates.length).toBeGreaterThan(0);
    expect(outcome?.reasons[0]).toEqual(
      expect.objectContaining({ answer: "A steaming bowl", because: "It is a spoonable, brothy bowl." }),
    );
  });

  it("reports how the diner read the sky", () => {
    const sky: QuizQuestion = {
      ...bowlOrPlate,
      id: "sky-moon-taurus",
      format: "sky",
      facet: "sky",
      eyebrow: "The Moon is in Taurus",
    };
    const outcome = quizOutcome({ dishes: [soup, salad], questions: [sky], answers: { [sky.id]: ["bowl"] }, rules: NO_RULES, moment: MOMENT });
    expect(outcome?.skyNote).toMatch(/The Moon is in Taurus\. You read it as “A steaming bowl”/);
  });

  it("is null when every dish is ruled out", () => {
    expect(quizOutcome({ dishes: [soup], questions: [], answers: {}, rules: { diet: "vegan", allergens: [] }, moment: MOMENT })).toBeNull();
  });
});
