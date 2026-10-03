import type {
  QuizOption,
  QuizCondition,
  QuizContext,
  QuizAnswers,
  ElementVector,
  ESMSVector,
} from "./types";

export const option = (
  id: string,
  label: string,
  sub: string,
  elements: Partial<ElementVector> = {},
  esms?: Partial<ESMSVector>,
): QuizOption => ({
  id,
  label,
  sub,
  weights: { elements, ...(esms ? { esms } : {}) },
});
export const dietIs =
  (...styles: readonly string[]): QuizCondition =>
  (_: QuizContext, answers: QuizAnswers) =>
    styles.includes(answers.diet?.[0] ?? "unrestricted");
export const avoids =
  (allergen: string): QuizCondition =>
  (_: QuizContext, answers: QuizAnswers) =>
    !answers.allergens?.includes(allergen);
