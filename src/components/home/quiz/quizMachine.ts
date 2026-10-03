import {
  getActiveQuestions,
  getQuestionOptions,
  QUIZ_QUESTIONS,
} from "./quizQuestions";
import type {
  QuizAnswers,
  QuizContext,
  QuizMode,
  QuizState,
  QuestionLimit,
} from "./types";

export const QUIZ_STORAGE_KEY = "alchm:quiz:v2";
export const LEGACY_QUIZ_STORAGE_KEY = "alchm:firstmeal:v1";
export const DEFAULT_QUIZ_CONTEXT: QuizContext = {
  timeOfDay: "evening",
  season: "autumn",
  tableSize: 1,
  tableGlyphs: "",
  elementalBias: null,
  isAuthenticated: false,
};
export const initialQuizState: QuizState = {
  isOpen: false,
  mode: "quick",
  questionLimit: 20,
  answers: {},
  status: "idle",
  direction: 1,
  hydrated: false,
  currentQuestionId: "hunger",
};

export type QuizAction =
  | { type: "HYDRATE"; saved: QuizState | null }
  | { type: "START" }
  | { type: "CLOSE" }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESTART" }
  | { type: "RECONCILE" }
  | { type: "SELECT"; optionId: string }
  | { type: "SET_MODE"; mode: QuizMode }
  | { type: "SET_LIMIT"; questionLimit: QuestionLimit };

/** Keep valid drafts from inactive modes, but discard invalid dependent answers. */
export function sanitizeAnswers(
  answers: QuizAnswers,
  context: QuizContext,
): QuizAnswers {
  const clean: QuizAnswers = {};
  for (const question of QUIZ_QUESTIONS) {
    if (question.condition && !question.condition(context, clean)) continue;
    const available = getQuestionOptions(question, context, clean);
    const picked = [...new Set(answers[question.id] ?? [])].filter((id) =>
      available.some((item) => item.id === id),
    );
    const exclusive = picked.find((id) =>
      available.some((item) => item.id === id && item.exclusive),
    );
    const valid = exclusive
      ? [exclusive]
      : question.selection === "single"
        ? picked.slice(0, 1)
        : picked;
    if (valid.length) clean[question.id] = valid;
  }
  return clean;
}
export function reconcile(state: QuizState, context: QuizContext): QuizState {
  const answers = sanitizeAnswers(state.answers, context);
  const questions = getActiveQuestions(
    state.mode,
    state.questionLimit,
    context,
    answers,
  );
  const unanswered = questions.find(
    (question) => !answers[question.id]?.length,
  );
  const currentQuestionId = questions.some(
    (question) => question.id === state.currentQuestionId,
  )
    ? state.currentQuestionId
    : ((unanswered ?? questions[0])?.id ?? null);
  return {
    ...state,
    answers,
    currentQuestionId,
    status:
      state.status === "result" && unanswered ? "questions" : state.status,
  };
}
export function quizReducer(
  state: QuizState,
  action: QuizAction,
  context: QuizContext = DEFAULT_QUIZ_CONTEXT,
): QuizState {
  const questions = getActiveQuestions(
    state.mode,
    state.questionLimit,
    context,
    state.answers,
  );
  const index = questions.findIndex(
    (question) => question.id === state.currentQuestionId,
  );
  const current = questions[index];
  switch (action.type) {
    case "HYDRATE":
      return reconcile(
        { ...(action.saved ?? state), isOpen: state.isOpen, hydrated: true },
        context,
      );
    case "START":
      return reconcile(
        {
          ...state,
          isOpen: true,
          status: state.status === "idle" ? "questions" : state.status,
        },
        context,
      );
    case "CLOSE":
      return { ...state, isOpen: false };
    case "RECONCILE":
      return reconcile(state, context);
    case "RESTART":
      return {
        ...initialQuizState,
        mode: state.mode,
        questionLimit: state.questionLimit,
        isOpen: true,
        status: "questions",
        hydrated: state.hydrated,
      };
    case "SET_MODE":
      return reconcile(
        { ...state, mode: action.mode, status: "questions", direction: 1 },
        context,
      );
    case "SET_LIMIT":
      return reconcile(
        {
          ...state,
          questionLimit: action.questionLimit,
          status: "questions",
          direction: 1,
        },
        context,
      );
    case "SELECT": {
      if (!current || state.status !== "questions") return state;
      const options = getQuestionOptions(current, context, state.answers);
      const option = options.find((item) => item.id === action.optionId);
      if (!option) return state;
      const previous = state.answers[current.id] ?? [];
      const selection =
        current.selection === "single" || option.exclusive
          ? [option.id]
          : previous.includes(option.id)
            ? previous.filter((id) => id !== option.id)
            : [
                ...previous.filter(
                  (id) =>
                    !options.some((item) => item.id === id && item.exclusive),
                ),
                option.id,
              ];
      return reconcile(
        { ...state, answers: { ...state.answers, [current.id]: selection } },
        context,
      );
    }
    case "NEXT": {
      if (
        !current ||
        state.status !== "questions" ||
        !state.answers[current.id]?.length
      )
        return state;
      const next = questions[index + 1];
      if (next) return { ...state, currentQuestionId: next.id, direction: 1 };
      const unanswered = questions.find(
        (question) => !state.answers[question.id]?.length,
      );
      return unanswered
        ? { ...state, currentQuestionId: unanswered.id, direction: -1 }
        : { ...state, status: "result", direction: 1 };
    }
    case "BACK": {
      if (state.status === "result")
        return {
          ...state,
          status: "questions",
          currentQuestionId: questions[questions.length - 1]?.id ?? null,
          direction: -1,
        };
      const previous = questions[index - 1];
      return previous
        ? { ...state, currentQuestionId: previous.id, direction: -1 }
        : state;
    }
  }
}
