import { SKIP_ID } from "../engine/effects";
import { MOON_LORE } from "../engine/moonLore";
import { parseSession, rulesFromLegacyDraft, serializeSession } from "../engine/persistence";
import { answeredCount, initialSession, nextSelection, quizReducer, type QuizSessionState } from "../engine/session";
import { computeSky, tightestAspect } from "../engine/sky";
import { skyQuestions } from "../engine/skyQuestions";
import type { QuizQuestion } from "../engine/types";
import { MOMENT } from "./helpers/quizFixtures";

const single: QuizQuestion = {
  id: "q1",
  format: "choice",
  facet: "mood",
  eyebrow: "",
  prompt: "One?",
  choices: [
    { id: "a", label: "A", effect: { leans: { spice: 1 } } },
    { id: "b", label: "B", effect: { leans: { spice: -1 } } },
  ],
};
const second: QuizQuestion = { ...single, id: "q2", prompt: "Two?" };

function started(target = 2): QuizSessionState {
  const begun = quizReducer({ ...initialSession, hydrated: true, isOpen: true, target }, { type: "BEGIN", seed: 9 });
  return quizReducer(begun, { type: "ASK", question: single });
}

describe("session reducer", () => {
  it("asks, answers, advances and reveals at the chosen length", () => {
    let state = started();
    expect(quizReducer(state, { type: "NEXT" })).toBe(state);
    state = quizReducer(state, { type: "SELECT", choiceId: "a" });
    state = quizReducer(state, { type: "NEXT" });
    expect(state.cursor).toBe(state.asked.length);
    state = quizReducer(state, { type: "ASK", question: second });
    state = quizReducer(state, { type: "SKIP" });
    expect(state.answers.q2).toEqual([SKIP_ID]);
    expect(state.phase).toBe("result");
    expect(answeredCount(state)).toBe(2);
  });

  it("goes back through questions to setup, and 'more' extends the quiz", () => {
    let state = quizReducer(started(), { type: "SELECT", choiceId: "b" });
    state = quizReducer(state, { type: "REVEAL" });
    expect(state.phase).toBe("result");
    state = quizReducer(state, { type: "MORE", count: 5 });
    expect(state).toMatchObject({ phase: "asking", target: 6, cursor: 1 });
    const unanswered = quizReducer({ ...state, asked: [single, second], cursor: 1, phase: "result" }, { type: "MORE", count: 5 });
    expect(unanswered.cursor).toBe(1);
    state = quizReducer(quizReducer(state, { type: "BACK" }), { type: "BACK" });
    expect(state.phase).toBe("setup");
  });

  it("ignores a stale ASK and clamps the length", () => {
    const state = started();
    expect(quizReducer(state, { type: "ASK", question: second })).toBe(state);
    expect(quizReducer(state, { type: "SET_TARGET", target: 99 }).target).toBe(30);
    expect(quizReducer(state, { type: "SET_TARGET", target: 1 }).target).toBe(3);
  });

  it("keeps one reaction per rapid-fire item and honors exclusive picks", () => {
    const rapid: QuizQuestion = {
      ...single,
      format: "rapid",
      choices: ["love", "fine", "no"].flatMap((reaction) =>
        ["garlic", "chili"].map((item) => ({ id: `${item}:${reaction}`, item, label: reaction, effect: {} })),
      ),
    };
    expect(nextSelection(rapid, ["garlic:love", "chili:no"], "garlic:no")).toEqual(["chili:no", "garlic:no"]);
    const multi: QuizQuestion = {
      ...single,
      format: "multi",
      choices: [...single.choices, { id: "none", label: "None", effect: {}, exclusive: true }],
    };
    expect(nextSelection(multi, ["a", "b"], "none")).toEqual(["none"]);
    expect(nextSelection(multi, ["none"], "a")).toEqual(["a"]);
  });
});

describe("persistence", () => {
  it("round-trips a session, generated questions included", () => {
    const state = quizReducer(started(), { type: "SELECT", choiceId: "a" });
    const restored = parseSession(serializeSession(state));
    expect(restored).toMatchObject({ phase: "asking", seed: 9, answers: { q1: ["a"] }, asked: [single] });
  });

  it("rejects corrupt drafts and carries v2 dietary rules forward", () => {
    expect(parseSession("{not json")).toBeNull();
    expect(parseSession(JSON.stringify({ version: 2 }))).toBeNull();
    const legacy = JSON.stringify({ version: 2, answers: { diet: ["vegan"], allergens: ["none", "peanuts"] } });
    expect(rulesFromLegacyDraft(legacy)).toEqual({ diet: "vegan", allergens: ["peanuts"] });
    expect(rulesFromLegacyDraft(JSON.stringify({ answers: { hunger: ["fierce"] } }))).toBeNull();
  });
});

describe("the live sky", () => {
  it("computes a plausible snapshot for a fixed instant", () => {
    const sky = computeSky(new Date("2026-10-03T18:00:00Z"));
    expect(sky).not.toBeNull();
    expect(Object.keys(MOON_LORE)).toContain(sky?.moon.sign);
    expect(sky?.sun.sign).toBe("libra");
    expect(sky?.phase.illumination).toBeGreaterThanOrEqual(0);
    expect(sky?.phase.illumination).toBeLessThanOrEqual(1);
    expect(sky?.moon.hoursLeftInSign).toBeLessThanOrEqual(60);
  });

  it("finds the tightest aspect and skips near-constant Sun–Mercury pairs", () => {
    const at = (longitude: number): { sign: string; degree: number; exactLongitude: number } => ({ sign: "aries", degree: longitude % 30, exactLongitude: longitude });
    // Sun–Mercury (0.05°) is the tightest pair; it must be skipped for Moon–Mars (0.1°).
    expect(tightestAspect({ sun: at(10), mercury: at(10.05), moon: at(101.1), mars: at(11) })).toEqual(
      expect.objectContaining({ a: "moon", b: "mars", kind: "square" }),
    );
  });

  it("has a reading with three answers for every Moon sign, and asks no sky question without a sky", () => {
    expect(Object.keys(MOON_LORE)).toHaveLength(12);
    for (const reading of Object.values(MOON_LORE)) expect(reading.choices).toHaveLength(3);
    expect(skyQuestions({ ...MOMENT, sky: null, planetaryHour: null })).toEqual([]);
    expect(skyQuestions({ ...MOMENT, planetaryHour: "Venus" }).map((question) => question.id)).toEqual(["sky-hour-venus"]);
  });
});
