"use client";
import { useRef } from "react";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";

const COLORS = {
  Fire: "#F87171",
  Water: "#60A5FA",
  Earth: "#34D399",
  Air: "#C084FC",
};
const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
export function QuizQuestionCard(): React.JSX.Element | null {
  const {
    state,
    context,
    currentQuestion: question,
    currentOptions,
    select,
  } = useQuiz();
  const choicesRef = useRef<HTMLDivElement>(null);
  if (!question) return null;
  const selected = state.answers[question.id] ?? [];
  const multiple = question.selection === "multiple";
  const prompt =
    typeof question.prompt === "function"
      ? question.prompt(context, state.answers)
      : question.prompt;
  const selectedIndex = currentOptions.findIndex((option) =>
    selected.includes(option.id),
  );
  return (
    <section
      className={styles.question}
      aria-labelledby="quiz-question-heading"
    >
      <div className={styles.questionIntro}>
        <span className={styles.eyebrow}>
          {question.category} ·{" "}
          {multiple ? "Select all that apply" : "Follow your appetite"}
        </span>
        <h3 id="quiz-question-heading" tabIndex={-1}>
          {prompt}
        </h3>
        <p id="quiz-question-description">
          {question.subprompt ?? "We’ll shape the meal around your choices."}
        </p>
      </div>
      <div
        ref={choicesRef}
        className={styles.options}
        role={multiple ? "group" : "radiogroup"}
        aria-labelledby="quiz-question-heading"
        aria-describedby="quiz-question-description"
      >
        {currentOptions.map((option, index) => (
          <button
            key={option.id}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={selected.includes(option.id)}
            data-quiz-option={option.id}
            tabIndex={multiple || index === Math.max(0, selectedIndex) ? 0 : -1}
            className={styles.option}
            onClick={() => select(option.id)}
            onKeyDown={(event) => {
              if (
                multiple ||
                ![
                  "ArrowRight",
                  "ArrowDown",
                  "ArrowLeft",
                  "ArrowUp",
                  "Home",
                  "End",
                ].includes(event.key)
              )
                return;
              event.preventDefault();
              event.stopPropagation();
              const nextIndex =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? currentOptions.length - 1
                    : (index +
                        (["ArrowLeft", "ArrowUp"].includes(event.key)
                          ? -1
                          : 1) +
                        currentOptions.length) %
                      currentOptions.length;
              const nextOption = currentOptions[nextIndex];
              if (nextOption) {
                select(nextOption.id);
                const buttons =
                  choicesRef.current?.querySelectorAll<HTMLButtonElement>(
                    "button",
                  );
                buttons?.[nextIndex]?.focus({ preventScroll: true });
              }
            }}
          >
            <span className={styles.optionNumber} aria-hidden="true">
              {selected.includes(option.id) ? "✓" : index + 1}
            </span>
            <span className={styles.optionCopy}>
              <strong>{option.label}</strong>
              <small>{option.sub}</small>
            </span>
            <span className={styles.dots} aria-hidden="true">
              {ELEMENTS.filter(
                (el) => (option.weights.elements[el] ?? 0) > 0,
              ).map((el) => (
                <i key={el} style={{ background: COLORS[el] }} />
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
