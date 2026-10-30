"use client";
import { offeredChoices } from "./engine/effects";
import styles from "./quiz.module.css";
import { ChoiceGrid, RapidFire, SliderQuestion, VersusTiles } from "./QuizFormats";
import { useQuiz } from "./QuizProvider";
import type { QuizQuestion } from "./engine/types";

export function QuizQuestionCard({ question }: { question: QuizQuestion }): React.JSX.Element {
  const { state, select } = useQuiz();
  const choices = offeredChoices(question, state.rules);
  const selected = state.answers[question.id] ?? [];
  const props = { question, choices, selected, onSelect: select };
  return (
    <section className={styles.question} data-format={question.format} aria-labelledby="quiz-question-heading">
      <div className={styles.questionIntro}>
        <span className={styles.eyebrow}>
          {question.glyph && (
            <span className={styles.glyph} aria-hidden="true">
              {question.glyph}
            </span>
          )}
          {question.eyebrow}
        </span>
        <h3 id="quiz-question-heading" data-quiz-heading tabIndex={-1}>
          {question.prompt}
        </h3>
        {question.sub && <p id="quiz-question-description">{question.sub}</p>}
      </div>
      {question.format === "slider" && <SliderQuestion {...props} />}
      {question.format === "rapid" && <RapidFire {...props} />}
      {(question.format === "versus" || question.format === "duel") && <VersusTiles {...props} />}
      {(question.format === "choice" || question.format === "multi" || question.format === "sky") && <ChoiceGrid {...props} />}
    </section>
  );
}
