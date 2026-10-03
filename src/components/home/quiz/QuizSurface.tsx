"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";

const QuizStage = dynamic(
  () => import("./QuizStage").then((module) => module.QuizStage),
  {
    loading: () => (
      <div className={styles.stage} role="status">
        Preparing your kitchen…
      </div>
    ),
  },
);
export function QuizSurface({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const { state } = useQuiz();
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !state.isOpen)
      document
        .getElementById("meal-quiz-trigger")
        ?.focus({ preventScroll: true });
    wasOpen.current = state.isOpen;
  }, [state.isOpen]);
  return (
    <div className={styles.surface}>
      <div
        className={styles.preview}
        style={{ visibility: state.isOpen ? "hidden" : undefined }}
        inert={state.isOpen}
        aria-hidden={state.isOpen || undefined}
      >
        {children}
      </div>
      {state.isOpen && (
        <div className={styles.overlay}>
          <QuizStage />
        </div>
      )}
    </div>
  );
}
