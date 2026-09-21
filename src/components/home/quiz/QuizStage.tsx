"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import { RecipeQueueProvider } from "@/contexts/RecipeQueueContext";
import { QuizModeToggle } from "./QuizModeToggle";
import { QuizProgressIndicator } from "./QuizProgressIndicator";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizResultView } from "./QuizResultView";
import { useQuiz } from "./QuizProvider";
import styles from "./quiz.module.css";

export const questionSlideVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -24 : 24, opacity: 0 }),
};

/** Keyboard commands are scoped to this surface, leaving the rest of the page usable. */
export function QuizStage() {
  const quiz = useQuiz();
  const { state, currentQuestion, currentOptions, currentIndex, questions, reading } = quiz;
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const viewId = reading ? "result" : currentQuestion?.id;

  useEffect(() => {
    bodyRef.current?.scrollTo?.({ top: 0 });
    const heading = stageRef.current?.querySelector<HTMLElement>(
      reading ? "#quiz-result-heading" : "#quiz-question-heading",
    );
    (heading ?? stageRef.current)?.focus({ preventScroll: true });
  }, [viewId, reading]);

  if (!state.isOpen) return null;

  return (
    <RecipeQueueProvider>
      <section
        id="meal-quiz-stage"
        ref={stageRef}
        className={styles.stage}
        aria-label="Craft your meal"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
          const target = event.target;
          if (target instanceof HTMLElement &&
            (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
          if (event.key === "Escape") {
            event.preventDefault();
            quiz.close();
          } else if (event.key === "Backspace" || event.key === "ArrowLeft") {
            event.preventDefault();
            quiz.back();
          } else if (!reading && /^[1-9]$/.test(event.key)) {
            const option = currentOptions[Number(event.key) - 1];
            if (option) {
              event.preventDefault();
              quiz.select(option.id);
            }
          } else if (!reading && event.key === "Enter" && quiz.canAdvance) {
            // Keep native Enter activation for navigation, links and mode controls.
            const nativeAction = target instanceof HTMLElement &&
              target.closest("a, button:not([data-quiz-option])");
            if (!nativeAction) {
              event.preventDefault();
              quiz.next();
            }
          }
        }}
      >
        <header className={styles.stageHeader}>
          <div className={styles.stageHeaderCopy}>
            <span className={styles.eyebrow}>YOUR NEXT GREAT MEAL</span>
            <QuizModeToggle />
          </div>
          <button type="button" className={styles.iconButton} onClick={quiz.close} aria-label="Close meal quiz">✕</button>
        </header>
        <QuizProgressIndicator />
        <div className={styles.stageBody} ref={bodyRef}>
          <AnimatePresence initial={false} mode="wait" custom={state.direction}>
            <motion.div
              key={viewId}
              custom={state.direction}
              variants={reducedMotion ? undefined : questionSlideVariants}
              initial={reducedMotion ? false : "enter"}
              animate="center"
              exit={reducedMotion ? undefined : "exit"}
              transition={{ duration: reducedMotion ? 0 : 0.14, ease: "easeOut" }}
              onAnimationComplete={() => {
                stageRef.current?.querySelector<HTMLElement>(reading ? "#quiz-result-heading" : "#quiz-question-heading")?.focus({ preventScroll: true });
              }}
            >
              {reading ? <QuizResultView /> : <QuizQuestionCard />}
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className={styles.stageFooter}>
          <button type="button" className={styles.secondaryButton} onClick={quiz.back} disabled={!reading && currentIndex <= 0}>← Back</button>
          <span className={styles.keyboardHint}>{reading ? "Made for your table" : "1–4 choose · Enter continues"}</span>
          {reading ? (
            <button type="button" className={styles.secondaryButton} onClick={quiz.restart}>Recraft ↻</button>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={quiz.next} disabled={!quiz.canAdvance}>
              {currentIndex === questions.length - 1 ? "Reveal my meal ✦" : "Continue →"}
            </button>
          )}
        </footer>
      </section>
    </RecipeQueueProvider>
  );
}
