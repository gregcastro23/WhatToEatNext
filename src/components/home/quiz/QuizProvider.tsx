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
  LEGACY_V2_KEY,
  parseSession,
  QUIZ_STORAGE_KEY,
  rulesFromLegacyDraft,
  serializeSession,
} from "./engine/persistence";
import { newSeed } from "./engine/rng";
import { initialSession, quizReducer, type QuizSessionState } from "./engine/session";
import type { QuizQuestion, QuizRules } from "./engine/types";
import type { QuizContext } from "./types";

/**
 * Quiz state for the homepage. Deliberately light: the reducer, hydration
 * and persistence live here, while the engine (catalog, selection, scoring)
 * loads with the stage only when the quiz is opened.
 */
export interface QuizApi {
  state: QuizSessionState;
  context: QuizContext;
  open: () => void;
  close: () => void;
  setTarget: (target: number) => void;
  setRules: (rules: QuizRules) => void;
  begin: () => void;
  ask: (question: QuizQuestion) => void;
  select: (choiceId: string) => void;
  skip: () => void;
  next: () => void;
  back: () => void;
  reveal: () => void;
  more: (count: number) => void;
  restart: () => void;
  summarize: (summary: { name: string; emoji: string }) => void;
}

function readSaved(): QuizSessionState | null {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    const saved = raw ? parseSession(raw) : null;
    if (saved) return saved;
    const legacy = localStorage.getItem(LEGACY_V2_KEY);
    const rules = legacy ? rulesFromLegacyDraft(legacy) : null;
    return rules ? { ...initialSession, rules } : null;
  } catch {
    return null;
  }
}

export function useQuizApi(context: QuizContext): QuizApi {
  const [state, dispatch] = useReducer(quizReducer, initialSession);
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    dispatch({ type: "HYDRATE", saved: readSaved() });
  }, []);
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, serializeSession(state));
    } catch {
      /* Persistence is optional; the quiz works in memory. */
    }
  }, [state]);
  // Actions are stable for the provider's lifetime; only state and context change.
  const actions = useMemo(
    () => ({
      open: (): void => dispatch({ type: "OPEN" }),
      close: (): void => dispatch({ type: "CLOSE" }),
      setTarget: (target: number): void => dispatch({ type: "SET_TARGET", target }),
      setRules: (rules: QuizRules): void => dispatch({ type: "SET_RULES", rules }),
      begin: (): void => dispatch({ type: "BEGIN", seed: newSeed() }),
      ask: (question: QuizQuestion): void => dispatch({ type: "ASK", question }),
      select: (choiceId: string): void => dispatch({ type: "SELECT", choiceId }),
      skip: (): void => dispatch({ type: "SKIP" }),
      next: (): void => dispatch({ type: "NEXT" }),
      back: (): void => dispatch({ type: "BACK" }),
      reveal: (): void => dispatch({ type: "REVEAL" }),
      more: (count: number): void => dispatch({ type: "MORE", count }),
      restart: (): void => dispatch({ type: "RESTART" }),
      summarize: (summary: { name: string; emoji: string }): void => dispatch({ type: "SUMMARY", summary }),
    }),
    [],
  );
  return useMemo(() => ({ state, context, ...actions }), [state, context, actions]);
}

const QuizApiContext = createContext<QuizApi | null>(null);

export function QuizProvider({
  context,
  children,
}: {
  context: QuizContext;
  children: ReactNode;
}): React.JSX.Element {
  const api = useQuizApi(context);
  return <QuizApiContext.Provider value={api}>{children}</QuizApiContext.Provider>;
}

export function useQuiz(): QuizApi {
  const api = useContext(QuizApiContext);
  if (!api) throw new Error("useQuiz requires QuizProvider");
  return api;
}
