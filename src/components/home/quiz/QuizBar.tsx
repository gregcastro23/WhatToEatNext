"use client";

import { useQuiz } from "./QuizProvider";
import styles from "./quiz.module.css";

export function QuizBar({ tunedSuffix = "" }: { tunedSuffix?: string }) {
  const { state, start, close, reading } = useQuiz();
  const answered = Object.keys(state.answers).length;
  return (
    <button
      type="button"
      id="meal-quiz-trigger"
      className={styles.bar}
      aria-expanded={state.isOpen}
      aria-controls="meal-quiz-stage"
      onClick={state.isOpen ? close : () => start()}
      disabled={!state.hydrated}
    >
      <span className={styles.barSymbol} aria-hidden="true">✦</span>
      <span className={styles.barCopy}>
        <strong>{reading ? `${reading.meal.emoji} ${reading.meal.name}` : "Craft tonight’s meal"}</strong>
        <span>{state.mode === "quick" ? "Quick Craft · 4 questions" : `Deep Dive · up to ${state.questionLimit} questions`}{tunedSuffix}</span>
      </span>
      <span className={styles.barAction}>{state.isOpen ? "Close ↑" : reading ? "View →" : answered ? "Resume →" : "Start →"}</span>
    </button>
  );
}
