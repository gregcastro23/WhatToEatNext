import { z } from "zod";
import { clampTarget, initialSession, type QuizSessionState } from "./session";
import {
  QUESTION_FACETS,
  type AllergenKey,
  type ChoiceEffect,
  type DietKey,
  type QuizChoice,
  type QuizQuestion,
  type QuizRules,
} from "./types";

export const QUIZ_STORAGE_KEY = "alchm:quiz:v3";
/** The previous quiz's draft; only its dietary rules are carried forward. */
export const LEGACY_V2_KEY = "alchm:quiz:v2";

const DIETS: readonly DietKey[] = ["vegetarian", "vegan", "pescatarian"];
const ALLERGENS: readonly AllergenKey[] = [
  "gluten", "dairy", "eggs", "soy", "peanuts", "tree-nuts", "sesame", "fish", "shellfish",
];

const numberMap = z.record(z.string(), z.number().finite());
const effectSchema = z.object({
  leans: numberMap.optional(),
  groups: numberMap.optional(),
  families: numberMap.optional(),
  courses: numberMap.optional(),
  like: numberMap.optional(),
  excludeGroups: z.array(z.string()).optional(),
  maxMinutes: z.number().positive().optional(),
  servings: z.number().int().positive().optional(),
});
const choiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  sub: z.string().optional(),
  emoji: z.string().optional(),
  effect: effectSchema,
  neutral: z.boolean().optional(),
  exclusive: z.boolean().optional(),
  hiddenFor: z.array(z.enum(["vegetarian", "vegan", "pescatarian"])).optional(),
  item: z.string().optional(),
});
const questionSchema = z.object({
  id: z.string(),
  format: z.enum(["choice", "multi", "versus", "slider", "rapid", "duel", "sky"]),
  facet: z.enum(QUESTION_FACETS),
  eyebrow: z.string(),
  prompt: z.string(),
  sub: z.string().optional(),
  glyph: z.string().optional(),
  choices: z.array(choiceSchema).min(1),
});
const rulesSchema = z.object({
  diet: z.enum(["vegetarian", "vegan", "pescatarian"]).nullable(),
  allergens: z.array(z.enum(["gluten", "dairy", "eggs", "soy", "peanuts", "tree-nuts", "sesame", "fish", "shellfish"])),
});
const sessionSchema = z.object({
  version: z.literal(3),
  phase: z.enum(["setup", "asking", "result"]),
  target: z.number(),
  seed: z.number().int(),
  rules: rulesSchema,
  asked: z.array(questionSchema),
  answers: z.record(z.string(), z.array(z.string())),
  cursor: z.number().int().nonnegative(),
  summary: z.object({ name: z.string(), emoji: z.string() }).nullable(),
});

type ParsedChoice = z.infer<typeof choiceSchema>;
type ParsedQuestion = z.infer<typeof questionSchema>;

function toEffect(parsed: ParsedChoice["effect"]): ChoiceEffect {
  const effect: ChoiceEffect = {};
  if (parsed.leans) effect.leans = parsed.leans;
  if (parsed.groups) effect.groups = parsed.groups;
  if (parsed.families) effect.families = parsed.families;
  if (parsed.courses) effect.courses = parsed.courses;
  if (parsed.like) effect.like = parsed.like;
  if (parsed.excludeGroups) effect.excludeGroups = parsed.excludeGroups;
  if (parsed.maxMinutes !== undefined) effect.maxMinutes = parsed.maxMinutes;
  if (parsed.servings !== undefined) effect.servings = parsed.servings;
  return effect;
}

function toChoice(parsed: ParsedChoice): QuizChoice {
  const choice: QuizChoice = { id: parsed.id, label: parsed.label, effect: toEffect(parsed.effect) };
  if (parsed.sub !== undefined) choice.sub = parsed.sub;
  if (parsed.emoji !== undefined) choice.emoji = parsed.emoji;
  if (parsed.neutral !== undefined) choice.neutral = parsed.neutral;
  if (parsed.exclusive !== undefined) choice.exclusive = parsed.exclusive;
  if (parsed.hiddenFor !== undefined) choice.hiddenFor = parsed.hiddenFor;
  if (parsed.item !== undefined) choice.item = parsed.item;
  return choice;
}

function toQuestion(parsed: ParsedQuestion): QuizQuestion {
  const question: QuizQuestion = {
    id: parsed.id,
    format: parsed.format,
    facet: parsed.facet,
    eyebrow: parsed.eyebrow,
    prompt: parsed.prompt,
    choices: parsed.choices.map(toChoice),
  };
  if (parsed.sub !== undefined) question.sub = parsed.sub;
  if (parsed.glyph !== undefined) question.glyph = parsed.glyph;
  return question;
}

export function parseSession(raw: string): QuizSessionState | null {
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const { data } = parsed;
    return {
      ...initialSession,
      hydrated: true,
      phase: data.phase,
      target: clampTarget(data.target),
      seed: data.seed,
      rules: data.rules,
      asked: data.asked.map(toQuestion),
      answers: data.answers,
      cursor: Math.min(data.cursor, data.asked.length),
      summary: data.summary,
    };
  } catch {
    return null;
  }
}

export function serializeSession(state: QuizSessionState): string {
  const { phase, target, seed, rules, asked, answers, cursor, summary } = state;
  return JSON.stringify({ version: 3, phase, target, seed, rules, asked, answers, cursor, summary });
}

const legacySchema = z.object({ answers: z.record(z.string(), z.array(z.string())) });

/** Dietary rules from the previous quiz's draft, so returning diners keep them. */
export function rulesFromLegacyDraft(raw: string): QuizRules | null {
  try {
    const parsed = legacySchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const { answers } = parsed.data;
    const diet = DIETS.find((value) => value === answers.diet?.[0]) ?? null;
    const allergens = ALLERGENS.filter((value) => answers.allergens?.includes(value));
    return diet || allergens.length ? { diet, allergens } : null;
  } catch {
    return null;
  }
}
