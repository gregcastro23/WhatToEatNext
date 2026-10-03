"use client";
import { answeredCount } from "./engine/session";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";
import type { QuizBrain } from "./useQuizBrain";

/**
 * The live readout while asking: how many dishes are realistically still in
 * play (e^entropy of the field) and who is leading right now.
 */
export function QuizPulse({ brain }: { brain: QuizBrain }): React.JSX.Element {
  const { state } = useQuiz();
  const answered = answeredCount(state);
  const step = Math.min(state.target, Math.max(1, state.cursor + 1));
  const leaders = brain.scored.slice(0, 3);
  return (
    <div className={styles.progress}>
      <div className={styles.progressCaption}>
        <span>
          Question {step} of {state.target}
        </span>
        {brain.status === "ready" && (
          <span aria-live="polite">
            {answered === 0 ? `${brain.scored.length} dishes on the table` : `≈${brain.inPlay} dishes still in play`}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-label="Questions answered"
        aria-valuemin={0}
        aria-valuemax={state.target}
        aria-valuenow={answered}
        className={styles.progressTrack}
      >
        {Array.from({ length: state.target }, (_, index) => (
          <span key={index} data-done={index < answered || undefined} />
        ))}
      </div>
      {answered > 0 && leaders.length > 0 && (
        <p className={styles.leaders}>
          <span className={styles.leadersLabel}>Leading</span>
          {leaders.map(({ dish }) => (
            <span key={dish.id} className={styles.leader} title={dish.name}>
              <span aria-hidden="true">{dish.emoji}</span> {dish.name}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
