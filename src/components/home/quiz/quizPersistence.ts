import { initialQuizState, reconcile , DEFAULT_QUIZ_CONTEXT } from "./quizMachine";
import { QUICK_QUESTIONS } from "./quizQuestions";
import type {
  QuizAnswers,
  QuizContext,
  QuizState,
  QuestionLimit,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isQuestionLimit(value: unknown): value is QuestionLimit {
  return value === 8 || value === 12 || value === 16 || value === 20;
}
function parseAnswers(value: unknown): QuizAnswers | null {
  if (!isRecord(value)) return null;
  const answers: QuizAnswers = {};
  for (const [id, chosen] of Object.entries(value)) {
    if (!Array.isArray(chosen)) return null;
    const optionIds: string[] = [];
    for (const item of chosen) {
      if (typeof item !== "string") return null;
      optionIds.push(item);
    }
    answers[id] = optionIds;
  }
  return answers;
}
export function parseSavedQuiz(
  raw: string,
  context: QuizContext = DEFAULT_QUIZ_CONTEXT,
): QuizState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== 2 ||
      (parsed.mode !== "quick" && parsed.mode !== "deep") ||
      !isQuestionLimit(parsed.questionLimit)
    )
      return null;
    const answers = parseAnswers(parsed.answers);
    if (
      !answers ||
      (parsed.status !== "idle" &&
        parsed.status !== "questions" &&
        parsed.status !== "result") ||
      (parsed.currentQuestionId !== null &&
        typeof parsed.currentQuestionId !== "string")
    )
      return null;
    return reconcile(
      {
        ...initialQuizState,
        mode: parsed.mode,
        questionLimit: parsed.questionLimit,
        answers,
        status: parsed.status,
        currentQuestionId: parsed.currentQuestionId,
        hydrated: true,
      },
      context,
    );
  } catch {
    return null;
  }
}
export function migrateLegacyQuiz(
  raw: string,
  context: QuizContext = DEFAULT_QUIZ_CONTEXT,
): QuizState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    const values: unknown = isRecord(parsed) ? parsed.answers : parsed;
    if (!Array.isArray(values) || values.length !== QUICK_QUESTIONS.length)
      return null;
    const answers: QuizAnswers = {};
    for (const [index, value] of values.entries()) {
      const question = QUICK_QUESTIONS[index];
      if (
        !question ||
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0
      )
        return null;
      const option = question.options[value];
      if (!option) return null;
      answers[question.id] = [option.id];
    }
    return reconcile(
      {
        ...initialQuizState,
        answers,
        status: "result",
        hydrated: true,
        currentQuestionId:
          QUICK_QUESTIONS[QUICK_QUESTIONS.length - 1]?.id ?? null,
      },
      context,
    );
  } catch {
    return null;
  }
}
export function serializeQuiz(state: QuizState): string {
  return JSON.stringify({
    version: 2,
    mode: state.mode,
    questionLimit: state.questionLimit,
    answers: state.answers,
    status: state.status,
    currentQuestionId: state.currentQuestionId,
  });
}
