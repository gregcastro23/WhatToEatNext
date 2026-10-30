"use client";
import { answeredCount } from "./engine/session";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";

function actionLabel(isOpen: boolean, phase: string, answered: number): string {
  if (isOpen) return "Close ↑";
  if (phase === "result") return "See it →";
  return answered > 0 ? "Resume →" : "Start →";
}

export function QuizBar({ tunedSuffix = "" }: { tunedSuffix?: string }): React.JSX.Element {
  const { state, open, close } = useQuiz();
  const answered = answeredCount(state);
  const { summary } = state;
  return (
    <button
      id="meal-quiz-trigger"
      type="button"
      className={styles.bar}
      aria-expanded={state.isOpen}
      aria-controls="meal-quiz-stage"
      onClick={state.isOpen ? close : open}
      disabled={!state.hydrated}
    >
      <span className={styles.barSymbol} aria-hidden="true">
        {summary ? summary.emoji : "✦"}
      </span>
      <span className={styles.barCopy}>
        <strong>{summary ? `Tonight: ${summary.name}` : "What are you actually hungry for?"}</strong>
        <span>
          {summary
            ? "Matched from real recipes · retake any time"
            : `A ${state.target}-question quiz that reads the moment and finds a real dish`}
          {tunedSuffix}
        </span>
      </span>
      <span className={styles.barAction}>{actionLabel(state.isOpen, state.phase, answered)}</span>
    </button>
  );
}
