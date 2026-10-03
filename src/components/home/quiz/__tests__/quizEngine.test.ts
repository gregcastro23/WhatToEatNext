import {
  migrateLegacyQuiz,
  parseSavedQuiz,
  serializeQuiz,
} from "../quizPersistence";
import {
  initialQuizState,
  quizReducer,
  DEFAULT_QUIZ_CONTEXT,
} from "../quizMachine";
import {
  getActiveQuestions,
  getQuestionOptions,
  QUIZ_QUESTIONS,
} from "../quizQuestions";
import { scoreQuiz } from "../quizScoring";
import {
  buildQuizGenerationRequest,
  quizToBuilder,
  quizToRecipe,
  recipeToCart,
  parseGeneratedQuizRecipe,
} from "../quizIntegrations";
import type { QuizState, QuizAnswers } from "../types";

const ctx = { ...DEFAULT_QUIZ_CONTEXT, tableSize: 2 };
function complete(
  mode: "quick" | "deep" = "quick",
  overrides: QuizAnswers = {},
): QuizState {
  let state = quizReducer(
    { ...initialQuizState, mode, hydrated: true },
    { type: "START" },
    ctx,
  );
  for (let i = 0; i < 25 && state.status !== "result"; i += 1) {
    const question = getActiveQuestions(
      state.mode,
      state.questionLimit,
      ctx,
      state.answers,
    ).find((q) => q.id === state.currentQuestionId);
    if (!question) throw new Error("missing question");
    const options = getQuestionOptions(question, ctx, state.answers);
    const choice = overrides[question.id] ?? [options[0]?.id ?? ""];
    for (const optionId of choice)
      state = quizReducer(state, { type: "SELECT", optionId }, ctx);
    state = quizReducer(state, { type: "NEXT" }, ctx);
  }
  return state;
}
describe("adaptive culinary quiz", () => {
  it("completes 4 and 20 question paths and keeps elemental percentages normalized", () => {
    expect(QUIZ_QUESTIONS).toHaveLength(20);
    for (const mode of ["quick", "deep"] as const) {
      const state = complete(mode);
      expect(state.status).toBe("result");
      expect(Object.keys(state.answers)).toHaveLength(
        mode === "quick" ? 4 : 20,
      );
      expect(
        Object.values(scoreQuiz(state, ctx).pct).reduce((a, b) => a + b, 0),
      ).toBe(100);
    }
  });
  it("honors 8/12/16/20 limits and preserves dietary boundaries when switching to Quick", () => {
    for (const limit of [8, 12, 16, 20] as const)
      expect(getActiveQuestions("deep", limit, ctx, {})).toHaveLength(limit);
    const state = complete("deep", {
      diet: ["vegan"],
      allergens: ["soy", "dairy"],
    });
    const quick = quizReducer(state, { type: "SET_MODE", mode: "quick" }, ctx);
    const reading = scoreQuiz(quick, ctx);
    expect(reading.preferences.dietaryStyle).toBe("vegan");
    expect(reading.preferences.excludedAllergens).toEqual(["soy", "dairy"]);
    expect(quick.answers.diet).toEqual(["vegan"]);
  });
  it("prunes incompatible protein after a backward dietary edit", () => {
    let state = complete("deep", { protein: ["chicken"] });
    state = { ...state, status: "questions", currentQuestionId: "diet" };
    state = quizReducer(state, { type: "SELECT", optionId: "vegan" }, ctx);
    expect(state.answers.protein).toBeUndefined();
    const protein = QUIZ_QUESTIONS.find((q) => q.id === "protein");
    if (!protein) throw new Error("missing protein");
    expect(
      getQuestionOptions(protein, ctx, state.answers).map((o) => o.id),
    ).not.toContain("chicken");
  });
  it("treats none as exclusive and never advances an unanswered question", () => {
    const empty = quizReducer(initialQuizState, { type: "START" }, ctx);
    expect(quizReducer(empty, { type: "NEXT" }, ctx).currentQuestionId).toBe(
      "hunger",
    );
    let state: QuizState = {
      ...empty,
      mode: "deep",
      currentQuestionId: "allergens",
    };
    for (const optionId of ["soy", "dairy"])
      state = quizReducer(state, { type: "SELECT", optionId }, ctx);
    expect(state.answers.allergens).toEqual(["soy", "dairy"]);
    state = quizReducer(state, { type: "SELECT", optionId: "none" }, ctx);
    expect(state.answers.allergens).toEqual(["none"]);
    state = quizReducer(state, { type: "SELECT", optionId: "soy" }, ctx);
    expect(state.answers.allergens).toEqual(["soy"]);
  });
  it("migrates legacy order and rejects corrupt storage without trusting saved result status", () => {
    expect(migrateLegacyQuiz('{"answers":[0,1,2,3]}', ctx)?.answers).toEqual({
      hunger: ["fierce"],
      heat: ["roast"],
      flavor: ["bright"],
      shape: ["ritual"],
    });
    expect(migrateLegacyQuiz("[4,0,0,0]", ctx)).toBeNull();
    expect(parseSavedQuiz("{broken", ctx)).toBeNull();
    expect(
      parseSavedQuiz(
        serializeQuiz({ ...initialQuizState, status: "result" }),
        ctx,
      )?.status,
    ).toBe("questions");
    const done = complete();
    expect(parseSavedQuiz(serializeQuiz(done), ctx)?.answers).toEqual(
      done.answers,
    );
  });
  it("respects pan-only equipment and short timing while keeping recipes measured", () => {
    const reading = scoreQuiz(
      complete("deep", {
        heat: ["roast"],
        equipment: ["stovetop"],
        time: ["15"],
        flavor: ["savory"],
      }),
      ctx,
    );
    expect(reading.meal.method).toBe("Sautéing");
    expect(reading.meal.prepMinutes).toBeLessThanOrEqual(15);
    expect(
      reading.meal.suggestedIngredients.every((i) => i.amount > 0 && i.unit),
    ).toBe(true);
    expect(reading.meal.instructions.join(" ")).not.toContain("oven");
  });
  it("keeps planetary ESMS separate from preference points", () => {
    const state = complete();
    expect(
      scoreQuiz(state, {
        ...ctx,
        planetaryESMS: { Spirit: 1000, Essence: 10, Matter: 2, Substance: 3 },
      }).esmsTotals,
    ).toEqual(scoreQuiz(state, ctx).esmsTotals);
  });
  it("hands off a complete deep brief, quantities, allergens and servings", () => {
    const reading = scoreQuiz(
      complete("deep", { diet: ["vegan"], allergens: ["soy", "dairy"] }),
      ctx,
    );
    const payload = buildQuizGenerationRequest(
      reading,
      ctx,
      "quiz-test-request",
    );
    expect(payload.prompt.length).toBeLessThanOrEqual(2000);
    expect(payload.disallowed_ingredients).toEqual(
      expect.arrayContaining(["soy", "dairy"]),
    );
    expect(payload.prompt).toContain("substance");
    const builder = quizToBuilder(reading, ctx);
    expect(builder.quizBrief).toContain("substance");
    expect(builder.allergies).toEqual(expect.arrayContaining(["soy", "dairy"]));
    const recipe = quizToRecipe(reading, ctx);
    expect(recipeToCart(recipe).baseServings).toBe(2);
    expect(recipe.elementalProvenance).toContain("catalog");
    expect(() => parseGeneratedQuizRecipe({ title: "incomplete" })).toThrow();
  });
});
