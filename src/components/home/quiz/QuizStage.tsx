"use client";
import { useEffect, useRef } from "react";
import { RecipeQueueProvider } from "@/contexts/RecipeQueueContext";
import { offeredChoices } from "./engine/effects";
import { currentQuestion } from "./engine/session";
import styles from "./quiz.module.css";
import { QuizFooter } from "./QuizFooter";
import { useQuiz } from "./QuizProvider";
import { QuizPulse } from "./QuizPulse";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizResultView } from "./QuizResultView";
import { QuizSetup } from "./QuizSetup";
import { useQuizBrain, type QuizBrain } from "./useQuizBrain";

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

/** Number keys pick, Enter continues, ←/Backspace go back, Escape closes. */
function useQuizKeys(stageRef: React.RefObject<HTMLElement | null>): void {
  const quiz = useQuiz();
  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (!(event.target instanceof Node) || !stageRef.current?.contains(event.target)) return;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (isTyping(event.target)) return;
      const question = currentQuestion(quiz.state);
      if (event.key === "Escape") quiz.close();
      else if (event.key === "Backspace" || event.key === "ArrowLeft") quiz.back();
      else if (question && question.format !== "rapid" && /^[1-9]$/.test(event.key)) {
        const choice = offeredChoices(question, quiz.state.rules)[Number(event.key) - 1];
        if (!choice) return;
        quiz.select(choice.id);
      } else if (question && event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
        quiz.next();
      } else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    return (): void => window.removeEventListener("keydown", handleKey);
  }, [quiz, stageRef]);
}

function StageBody({ brain }: { brain: QuizBrain }): React.JSX.Element {
  const { state } = useQuiz();
  if (state.phase === "setup") return <QuizSetup sky={brain.moment.sky} dishCount={brain.dishes.length} />;
  if (brain.status === "error") {
    return (
      <div className={styles.notice} role="alert">
        <p>We couldn&apos;t load the recipe catalog just now.</p>
        <button type="button" className={styles.secondaryButton} onClick={brain.retry}>
          Try again
        </button>
      </div>
    );
  }
  if (brain.status === "loading") return <p className={styles.notice} role="status">Gathering the recipes…</p>;
  if (state.phase === "result" && brain.outcome) return <QuizResultView brain={brain} outcome={brain.outcome} />;
  const question = currentQuestion(state);
  return question ? <QuizQuestionCard question={question} /> : <p className={styles.notice} role="status">Choosing your next question…</p>;
}

export function QuizStage(): React.JSX.Element | null {
  const quiz = useQuiz();
  const brain = useQuizBrain(quiz);
  const { state } = quiz;
  const stageRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const viewId = state.phase === "asking" ? (currentQuestion(state)?.id ?? "pending") : state.phase;
  useQuizKeys(stageRef);
  // Move focus to each new view's heading, or it falls to <body> and the
  // keyboard shortcuts stop. brain.status: a resumed question renders only
  // once the catalog arrives, without a view change.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    stageRef.current?.querySelector<HTMLElement>("[data-quiz-heading]")?.focus({ preventScroll: true });
  }, [viewId, brain.status]);
  if (!state.isOpen) return null;
  return (
    <RecipeQueueProvider>
      <section id="meal-quiz-stage" ref={stageRef} className={styles.stage} role="dialog" aria-modal={false} aria-label="What are you hungry for?" tabIndex={-1}>
        <header className={styles.stageHeader}>
          <div className={styles.stageHeaderCopy}>
            <span className={styles.eyebrow}>What are you actually hungry for?</span>
          </div>
          <button type="button" className={styles.iconButton} onClick={quiz.close} aria-label="Close the quiz">
            ✕
          </button>
        </header>
        {state.phase === "asking" && <QuizPulse brain={brain} />}
        <div className={styles.stageBody} ref={bodyRef}>
          {/*
            CSS, not framer-motion: AnimatePresence mode="wait" holds the new
            view until the exit animation's requestAnimationFrame callbacks
            run, and rAF stops in hidden or non-compositing pages, so the
            result could never mount. A keyed CSS entrance can't block content.
          */}
          <div key={viewId} className={styles.view} data-direction={state.direction}>
            <StageBody brain={brain} />
          </div>
        </div>
        <QuizFooter brain={brain} />
      </section>
    </RecipeQueueProvider>
  );
}
