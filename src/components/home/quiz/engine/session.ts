import { isSingleChoice, SKIP_ID } from "./effects";
import type { QuizAnswers, QuizQuestion, QuizRules } from "./types";

export type QuizPhase = "setup" | "asking" | "result";

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 30;
export const DEFAULT_TARGET = 10;

export interface QuizSessionState {
  isOpen: boolean;
  hydrated: boolean;
  phase: QuizPhase;
  /** How many questions the diner asked for. */
  target: number;
  seed: number;
  rules: QuizRules;
  /** Questions in the order asked; generated ones are stored whole. */
  asked: readonly QuizQuestion[];
  answers: QuizAnswers;
  /** Index into `asked`; equal to asked.length when a new question is due. */
  cursor: number;
  direction: 1 | -1;
  /** The last result, for the hero bar. */
  summary: { name: string; emoji: string } | null;
}

export const initialSession: QuizSessionState = {
  isOpen: false,
  hydrated: false,
  phase: "setup",
  target: DEFAULT_TARGET,
  seed: 1,
  rules: { diet: null, allergens: [] },
  asked: [],
  answers: {},
  cursor: 0,
  direction: 1,
  summary: null,
};

export type QuizAction =
  | { type: "HYDRATE"; saved: QuizSessionState | null }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SET_TARGET"; target: number }
  | { type: "SET_RULES"; rules: QuizRules }
  | { type: "BEGIN"; seed: number }
  | { type: "ASK"; question: QuizQuestion }
  | { type: "SELECT"; choiceId: string }
  | { type: "SKIP" }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "REVEAL" }
  | { type: "MORE"; count: number }
  | { type: "RESTART" }
  | { type: "SUMMARY"; summary: { name: string; emoji: string } };

export function clampTarget(target: number): number {
  return Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Math.round(target)));
}

export function currentQuestion(state: QuizSessionState): QuizQuestion | null {
  return state.phase === "asking" ? (state.asked[state.cursor] ?? null) : null;
}

export function answeredCount(state: Pick<QuizSessionState, "asked" | "answers">): number {
  return state.asked.filter((question) => state.answers[question.id] !== undefined).length;
}

/** Rapid-fire can always advance: an untouched item simply means "fine". */
export function canAdvance(state: QuizSessionState): boolean {
  const question = currentQuestion(state);
  if (!question) return false;
  return question.format === "rapid" || (state.answers[question.id]?.length ?? 0) > 0;
}

export function nextSelection(question: QuizQuestion, previous: readonly string[], choiceId: string): string[] {
  const choice = question.choices.find((item) => item.id === choiceId);
  if (!choice) return [...previous];
  if (isSingleChoice(question) || choice.exclusive) return [choiceId];
  if (question.format === "rapid") {
    const others = previous.filter((id) => question.choices.find((item) => item.id === id)?.item !== choice.item);
    return previous.includes(choiceId) ? others : [...others, choiceId];
  }
  const withoutExclusive = previous.filter((id) => !question.choices.find((item) => item.id === id)?.exclusive);
  return withoutExclusive.includes(choiceId)
    ? withoutExclusive.filter((id) => id !== choiceId)
    : [...withoutExclusive, choiceId];
}

function advance(state: QuizSessionState, answers: QuizAnswers): QuizSessionState {
  const next: QuizSessionState = { ...state, answers, direction: 1 };
  if (state.cursor < state.asked.length - 1) return { ...next, cursor: state.cursor + 1 };
  if (answeredCount(next) >= state.target) return { ...next, phase: "result" };
  return { ...next, cursor: state.asked.length };
}

function back(state: QuizSessionState): QuizSessionState {
  if (state.phase === "result") {
    return { ...state, phase: "asking", cursor: Math.max(0, state.asked.length - 1), direction: -1 };
  }
  if (state.cursor === 0) return { ...state, phase: "setup", direction: -1 };
  return { ...state, cursor: state.cursor - 1, direction: -1 };
}

function select(state: QuizSessionState, choiceId: string): QuizSessionState {
  const question = currentQuestion(state);
  if (!question) return state;
  const selection = nextSelection(question, state.answers[question.id] ?? [], choiceId);
  return { ...state, answers: { ...state.answers, [question.id]: selection } };
}

function skip(state: QuizSessionState): QuizSessionState {
  const question = currentQuestion(state);
  return question ? advance(state, { ...state.answers, [question.id]: [SKIP_ID] }) : state;
}

function next(state: QuizSessionState): QuizSessionState {
  const question = currentQuestion(state);
  if (!question || !canAdvance(state)) return state;
  // An untouched rapid-fire still counts as answered ("all fine").
  const answers = state.answers[question.id] ? state.answers : { ...state.answers, [question.id]: [] };
  return advance(state, answers);
}

type NavigationAction = Extract<QuizAction, { type: "SKIP" | "NEXT" | "BACK" | "REVEAL" | "MORE" | "RESTART" }>;

function navigate(state: QuizSessionState, action: NavigationAction): QuizSessionState {
  switch (action.type) {
    case "SKIP":
      return skip(state);
    case "NEXT":
      return next(state);
    case "BACK":
      return back(state);
    case "REVEAL":
      return answeredCount(state) > 0 ? { ...state, phase: "result", direction: 1 } : state;
    case "MORE": {
      // Resume at a question left unanswered by "Reveal now" before asking new ones.
      const pending = state.asked.findIndex((question) => state.answers[question.id] === undefined);
      const cursor = pending === -1 ? state.asked.length : pending;
      return { ...state, phase: "asking", target: clampTarget(answeredCount(state) + action.count), cursor, direction: 1 };
    }
    case "RESTART":
      return { ...state, phase: "setup", asked: [], answers: {}, cursor: 0, direction: -1, summary: null };
  }
}

export function quizReducer(state: QuizSessionState, action: QuizAction): QuizSessionState {
  switch (action.type) {
    case "HYDRATE":
      return { ...(action.saved ?? state), isOpen: state.isOpen, hydrated: true };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "SET_TARGET":
      return { ...state, target: clampTarget(action.target) };
    case "SET_RULES":
      return { ...state, rules: action.rules };
    case "BEGIN":
      return { ...state, phase: "asking", seed: action.seed, asked: [], answers: {}, cursor: 0, direction: 1, summary: null };
    case "ASK":
      if (state.phase !== "asking" || state.cursor !== state.asked.length) return state;
      return { ...state, asked: [...state.asked, action.question] };
    case "SELECT":
      return select(state, action.choiceId);
    case "SUMMARY":
      return { ...state, summary: action.summary };
    default:
      return navigate(state, action);
  }
}
