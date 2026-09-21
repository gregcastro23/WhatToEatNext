"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useQuiz } from "./QuizProvider";
import styles from "./quiz.module.css";

/** A continuous track stays legible at every depth, including conditional branches. */
export function QuizProgressIndicator() {
  const { state, questions, currentIndex, progress, isComplete } = useQuiz();
  const reducedMotion = useReducedMotion();
  const total = questions.length;
  const answered = questions.filter((question) => (state.answers[question.id]?.length ?? 0) > 0).length;
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <div className={styles.progress}>
      <div className={styles.progressLabels} aria-hidden="true">
        <span className={styles.progressCurrent}>{isComplete ? "Your meal is ready" : `Question ${Math.min(currentIndex + 1, total)} of ${total}`}</span>
        <span>{answered} answered</span>
      </div>
      <div className={styles.progressTrack} role="progressbar" aria-label="Meal quiz progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress} aria-valuetext={`${answered} of ${total} questions answered`}>
        <motion.div className={styles.progressFill} initial={false} animate={{ scaleX: safeProgress / 100 }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: "easeOut" }} />
      </div>
    </div>
  );
}
