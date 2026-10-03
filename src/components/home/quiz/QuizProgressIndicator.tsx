"use client";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";

export function QuizProgressIndicator(): React.JSX.Element {
  const { state, questions, currentIndex, reading } = useQuiz();
  const total = questions.length;
  const answered = questions.filter(
    (q) => (state.answers[q.id]?.length ?? 0) > 0,
  ).length;
  return (
    <div className={styles.progress}>
      <div className={styles.progressCaption}>
        <span>{state.mode === "quick" ? "Quick Craft" : "Deep Dive"}</span>
        <span aria-live="polite">
          {reading
            ? "Your meal is ready"
            : `Question ${Math.max(1, currentIndex + 1)} of ${total}`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Quiz answers completed"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        className={styles.progressTrack}
      >
        {questions.map((q) => (
          <span
            key={q.id}
            style={{
              background: state.answers[q.id]?.length ? "#fbbf24" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
