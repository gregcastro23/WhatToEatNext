"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  initialQuizState,
  LEGACY_QUIZ_STORAGE_KEY,
  quizReducer,
  QUIZ_STORAGE_KEY,
} from "./quizMachine";
import {
  migrateLegacyQuiz,
  parseSavedQuiz,
  serializeQuiz,
} from "./quizPersistence";
import { getActiveQuestions, getQuestionOptions } from "./quizQuestions";
import { scoreQuiz } from "./quizScoring";
import type {
  QuizContext as Context,
  QuizMode,
  QuestionLimit,
  QuizEngine,
} from "./types";

export function useQuizEngine(context: Context): QuizEngine {
  const [state, dispatch] = useReducer(
    (
      previous: typeof initialQuizState,
      action: Parameters<typeof quizReducer>[1],
    ) => quizReducer(previous, action, context),
    initialQuizState,
  );
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      let saved = null;
      try {
        const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
        saved = raw ? parseSavedQuiz(raw, context) : null;
        if (!saved) {
          const legacy =
            localStorage.getItem(LEGACY_QUIZ_STORAGE_KEY) ??
            localStorage.getItem("alchm:kitchendex:firstmeal:v1");
          saved = legacy ? migrateLegacyQuiz(legacy, context) : null;
        }
      } catch {
        /* Storage may be unavailable; the full quiz still works. */
      }
      dispatch({ type: "HYDRATE", saved });
    } else dispatch({ type: "RECONCILE" });
  }, [context]);
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, serializeQuiz(state));
    } catch {
      /* Optional persistence. */
    }
  }, [state]);
  const questions = useMemo(
    () =>
      getActiveQuestions(
        state.mode,
        state.questionLimit,
        context,
        state.answers,
      ),
    [state.mode, state.questionLimit, context, state.answers],
  );
  const currentIndex = questions.findIndex(
    (question) => question.id === state.currentQuestionId,
  );
  const currentQuestion = questions[currentIndex];
  const currentOptions = currentQuestion
    ? getQuestionOptions(currentQuestion, context, state.answers)
    : [];
  const complete = questions.every(
    (question) => (state.answers[question.id]?.length ?? 0) > 0,
  );
  const reading = useMemo(
    () =>
      state.status === "result" && complete ? scoreQuiz(state, context) : null,
    [state, context, complete],
  );
  return {
    state,
    context,
    questions,
    currentQuestion,
    currentOptions,
    currentIndex,
    reading,
    canAdvance:
      !!currentQuestion && (state.answers[currentQuestion.id]?.length ?? 0) > 0,
    start: (): void => dispatch({ type: "START" }),
    close: (): void => dispatch({ type: "CLOSE" }),
    select: (optionId: string): void => dispatch({ type: "SELECT", optionId }),
    next: (): void => dispatch({ type: "NEXT" }),
    back: (): void => dispatch({ type: "BACK" }),
    restart: (): void => dispatch({ type: "RESTART" }),
    setMode: (mode: QuizMode): void => dispatch({ type: "SET_MODE", mode }),
    setQuestionLimit: (questionLimit: QuestionLimit): void =>
      dispatch({ type: "SET_LIMIT", questionLimit }),
  };
}
const QuizEngineContext = createContext<QuizEngine | null>(null);
export function QuizProvider({
  context,
  children,
}: {
  context: Context;
  children: ReactNode;
}): React.JSX.Element {
  const engine = useQuizEngine(context);
  return (
    <QuizEngineContext.Provider value={engine}>
      {children}
    </QuizEngineContext.Provider>
  );
}
export function useQuiz(): QuizEngine {
  const engine = useContext(QuizEngineContext);
  if (!engine) throw new Error("useQuiz requires QuizProvider");
  return engine;
}
