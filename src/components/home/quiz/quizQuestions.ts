import { CONTEXT_QUESTIONS } from "./quizContextQuestions";
import { CORE_QUESTIONS } from "./quizCoreQuestions";
import type {
  QuizAnswers,
  QuizContext,
  QuizOption,
  QuizQuestion,
  QuizMode,
  QuestionLimit,
} from "./types";

/** Dietary boundaries precede finer tuning on every Deep Dive. */
export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  ...CORE_QUESTIONS,
  ...CONTEXT_QUESTIONS,
];

export const QUESTION_LIMITS: readonly QuestionLimit[] = [8, 12, 16, 20];
export const QUICK_QUESTIONS = QUIZ_QUESTIONS.filter(
  (question) => question.isQuickQuestion,
);
export function questionPrompt(
  question: QuizQuestion,
  context: QuizContext,
  answers: QuizAnswers,
): string {
  return typeof question.prompt === "function"
    ? question.prompt(context, answers)
    : question.prompt;
}
export function getQuestionOptions(
  question: QuizQuestion,
  context: QuizContext,
  answers: QuizAnswers,
): readonly QuizOption[] {
  return question.options.filter(
    (item) => !item.condition || item.condition(context, answers),
  );
}
export function getActiveQuestions(
  mode: QuizMode,
  questionLimit: QuestionLimit,
  context: QuizContext,
  answers: QuizAnswers,
): readonly QuizQuestion[] {
  const questions = mode === "quick" ? QUICK_QUESTIONS : QUIZ_QUESTIONS;
  return questions
    .filter(
      (question) => !question.condition || question.condition(context, answers),
    )
    .slice(0, mode === "quick" ? 4 : questionLimit);
}
