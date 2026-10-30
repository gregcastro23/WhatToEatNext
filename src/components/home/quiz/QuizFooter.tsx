"use client";
import { answeredCount, canAdvance, currentQuestion, MAX_QUESTIONS } from "./engine/session";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";
import type { QuizBrain } from "./useQuizBrain";

function SetupFooter(): React.JSX.Element {
  const { state, begin } = useQuiz();
  return (
    <footer className={styles.stageFooter}>
      <span className={styles.keyboardHint}>No account needed · your answers stay in this browser</span>
      <button type="button" className={styles.primaryButton} onClick={begin}>
        Start · {state.target} questions ✦
      </button>
    </footer>
  );
}

function ResultFooter(): React.JSX.Element {
  const quiz = useQuiz();
  return (
    <footer className={styles.stageFooter}>
      <button type="button" className={styles.secondaryButton} onClick={quiz.back}>
        ← Back
      </button>
      <span className={styles.footerGroup}>
        {answeredCount(quiz.state) < MAX_QUESTIONS && (
          <button type="button" className={styles.secondaryButton} onClick={() => quiz.more(5)}>
            Ask me 5 more
          </button>
        )}
        <button type="button" className={styles.secondaryButton} onClick={quiz.restart}>
          Start over ↻
        </button>
      </span>
    </footer>
  );
}

function AskingFooter({ brain }: { brain: QuizBrain }): React.JSX.Element {
  const quiz = useQuiz();
  const { state } = quiz;
  const answered = answeredCount(state);
  const question = currentQuestion(state);
  const pending = question && !state.answers[question.id] ? 1 : 0;
  const isLast = state.cursor >= state.asked.length - 1 && answered + pending >= state.target;
  return (
    <footer className={styles.stageFooter}>
      <span className={styles.footerGroup}>
        <button type="button" className={styles.secondaryButton} onClick={quiz.back}>
          ← Back
        </button>
        <button type="button" className={styles.ghostButton} onClick={quiz.skip} disabled={!question}>
          Skip
        </button>
      </span>
      <span className={styles.footerGroup}>
        {answered >= 2 && !isLast && brain.status === "ready" && (
          <button type="button" className={styles.ghostButton} onClick={quiz.reveal}>
            Reveal now ✦
          </button>
        )}
        <button type="button" className={styles.primaryButton} onClick={quiz.next} disabled={!canAdvance(state)}>
          {isLast ? "Reveal my dish ✦" : "Continue →"}
        </button>
      </span>
    </footer>
  );
}

export function QuizFooter({ brain }: { brain: QuizBrain }): React.JSX.Element {
  const { state } = useQuiz();
  if (state.phase === "setup") return <SetupFooter />;
  if (state.phase === "result") return <ResultFooter />;
  return <AskingFooter brain={brain} />;
}
