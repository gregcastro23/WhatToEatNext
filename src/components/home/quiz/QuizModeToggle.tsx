"use client";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";

const DEPTHS = [8, 12, 16, 20] as const;
export function QuizModeToggle(): React.JSX.Element {
  const { state, setMode, setQuestionLimit } = useQuiz();
  return (
    <div className={styles.modeControl}>
      <div className={styles.modeToggle} role="group" aria-label="Quiz depth">
        <button
          type="button"
          aria-pressed={state.mode === "quick"}
          onClick={() => setMode("quick")}
        >
          Quick Craft <small>4 questions</small>
        </button>
        <button
          type="button"
          aria-pressed={state.mode === "deep"}
          onClick={() => setMode("deep")}
        >
          Deep Dive <small>Up to 20 questions</small>
        </button>
      </div>
      <div className={styles.depthRow}>
        {state.mode === "deep" ? (
          <div
            role="group"
            aria-label="Maximum questions"
            className={styles.depthChoices}
          >
            <span>Go deeper</span>
            {DEPTHS.map((depth) => (
              <button
                key={depth}
                type="button"
                aria-label={`Up to ${depth} questions`}
                aria-pressed={state.questionLimit === depth}
                onClick={() => setQuestionLimit(depth)}
              >
                {depth}
              </button>
            ))}
          </div>
        ) : (
          <span>A little intuition. A meal that feels like you.</span>
        )}
      </div>
    </div>
  );
}
