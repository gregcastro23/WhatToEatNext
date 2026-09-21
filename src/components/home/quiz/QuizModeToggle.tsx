"use client";

import { useId } from "react";
import { useQuiz } from "./QuizProvider";
import styles from "./quiz.module.css";

export interface QuizModeToggleProps {
  compact?: boolean;
}

/** The depth control reserves its footprint even during the four-question track. */
export function QuizModeToggle({ compact = false }: QuizModeToggleProps) {
  const { state, setMode, setQuestionLimit } = useQuiz();
  const depthId = useId();
  const deep = state.mode === "deep";

  return (
    <div className={`${styles.modeToggle}${compact ? ` ${styles.modeCompact}` : ""}`}>
      <div className={styles.modeButtons} role="group" aria-label="Choose quiz depth">
        <button type="button" className={styles.modeButton} aria-pressed={!deep} aria-label="Quick Craft, 4 questions" onClick={() => setMode("quick")}>
          Quick Craft <span className={styles.modeCount} aria-hidden="true">4</span>
        </button>
        <button type="button" className={styles.modeButton} aria-pressed={deep} aria-label={`Deep Dive, up to ${state.questionLimit} questions`} onClick={() => setMode("deep")}>
          Deep Dive <span className={styles.modeCount} aria-hidden="true">{state.questionLimit}</span>
        </button>
      </div>
      <label className={styles.depthControl} htmlFor={depthId} data-inactive={!deep} aria-hidden={!deep || undefined}>
        <span>Explore</span>
        <select
          id={depthId}
          className={styles.depthSelect}
          aria-label="Maximum questions in Deep Dive"
          value={state.questionLimit}
          disabled={!deep}
          onChange={(event) => {
            const limit = Number(event.currentTarget.value);
            if (limit === 8 || limit === 12 || limit === 16 || limit === 20) setQuestionLimit(limit);
          }}
        >
          <option value={8}>Up to 8</option>
          <option value={12}>Up to 12</option>
          <option value={16}>Up to 16</option>
          <option value={20}>Up to 20</option>
        </select>
      </label>
    </div>
  );
}
