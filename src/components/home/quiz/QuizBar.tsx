"use client";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";

export function QuizBar({
  tunedSuffix = "",
}: {
  tunedSuffix?: string;
}): React.JSX.Element {
  const { state, start, close, reading } = useQuiz();
  return (
    <button
      id="meal-quiz-trigger"
      type="button"
      className={styles.bar}
      aria-expanded={state.isOpen}
      aria-controls="meal-quiz-stage"
      onClick={state.isOpen ? close : start}
      disabled={!state.hydrated}
    >
      <span className={styles.barSymbol} aria-hidden="true">
        ✦
      </span>
      <span className={styles.barCopy}>
        <strong>
          {reading
            ? `${reading.meal.emoji} ${reading.meal.name}`
            : "Craft tonight’s meal"}
        </strong>
        <span>
          {state.mode === "quick"
            ? "Quick Craft · 4 questions"
            : `Deep Dive · up to ${state.questionLimit} questions`}
          {tunedSuffix}
        </span>
      </span>
      <span className={styles.barAction}>
        {state.isOpen
          ? "Close ↑"
          : reading
            ? "View →"
            : Object.keys(state.answers).length
              ? "Resume →"
              : "Start →"}
      </span>
    </button>
  );
}
