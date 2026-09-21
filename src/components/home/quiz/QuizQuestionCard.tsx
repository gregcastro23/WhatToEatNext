"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ELEMENT_ORDER, type PalateElement } from "@/utils/guestPalate";
import { useQuiz } from "./QuizProvider";
import { resolveQuestionPrompt } from "./quizQuestions";
import styles from "./quiz.module.css";

const ELEMENT_COLORS: Record<PalateElement, string> = {
  Fire: "#f87171",
  Earth: "#34d399",
  Air: "#c084fc",
  Water: "#60a5fa",
};

/** Options remain native buttons: Tab/Space select; Stage owns number/Enter shortcuts. */
export function QuizQuestionCard() {
  const { currentQuestion, currentOptions, context, state, select } = useQuiz();
  const reducedMotion = useReducedMotion();

  if (!currentQuestion) {
    return <p className={styles.error} role="alert">This question is unavailable. Recraft your meal to begin again.</p>;
  }

  const selected = state.answers[currentQuestion.id] ?? [];
  const multiple = currentQuestion.selection === "multiple";

  return (
    <div className={styles.questionCard}>
      <div className={styles.questionHeading}>
        <h3 id="quiz-question-heading" className={styles.questionTitle} tabIndex={-1}>
          {resolveQuestionPrompt(currentQuestion, context, state.answers)}
        </h3>
        <p id="quiz-question-description" className={styles.questionDescription}>
          {currentQuestion.subprompt ? `${currentQuestion.subprompt} ` : ""}
          {multiple ? "Choose all that apply, then continue." : "Choose what feels right, then continue."}
        </p>
      </div>
      {currentOptions.length > 0 ? (
        <div className={styles.optionGrid} role="group" aria-labelledby="quiz-question-heading" aria-describedby="quiz-question-description">
          {currentOptions.map((option, index) => {
            const isSelected = selected.includes(option.id);
            const elements = ELEMENT_ORDER.filter((element) => (option.weights.elements[element] ?? 0) > 0);

            return (
              <motion.button
                key={option.id}
                type="button"
                className={styles.option}
                data-quiz-option={option.id}
                aria-pressed={isSelected}
                aria-keyshortcuts={index < 9 ? String(index + 1) : undefined}
                onClick={() => select(option.id)}
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                transition={{ duration: 0.12 }}
              >
                <span className={styles.optionNumber} aria-hidden="true">{isSelected ? "✓" : index < 9 ? index + 1 : "•"}</span>
                <span className={styles.optionCopy}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDescription}>{option.sub}</span>
                </span>
                {elements.length > 0 && (
                  <span className={styles.optionElements} role="img" aria-label={`Elemental affinity: ${elements.join(" and ")}`} title={elements.join(" · ")}>
                    {elements.map((element) => <span key={element} className={styles.elementDot} style={{ backgroundColor: ELEMENT_COLORS[element] }} />)}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <p className={styles.error} role="alert">No choices match this path. Go back to adjust your previous answer.</p>
      )}
    </div>
  );
}
