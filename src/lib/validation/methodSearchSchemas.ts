/**
 * Wire contract for GET /api/search/methods: a cited guide when one covers the
 * food, otherwise an honest general answer that says what is missing.
 */
import { z } from "zod";
import { FoodGuideSchema, GUIDE_METHOD_IDS } from "@/lib/cooking/foodGuides/schema";

/** A follow-up search, offered as a button. */
export const MethodSuggestionSchema = z.object({ label: z.string(), query: z.string() });

export const GeneralMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
  description: z.string(),
  equipment: z.array(z.string()),
  tips: z.array(z.string()),
  mistakes: z.array(z.string()),
});

const LinkSchema = z.object({ name: z.string(), href: z.string(), detail: z.string().nullable() });

export const MethodAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("guide"),
    guide: FoodGuideSchema,
    /** The guide method that answers the query. */
    selected: z.enum(GUIDE_METHOD_IDS),
    note: z.string().nullable(),
  }),
  z.object({ kind: z.literal("choose"), note: z.string(), choices: z.array(MethodSuggestionSchema) }),
  z.object({
    kind: z.literal("general"),
    note: z.string(),
    /** The ingredient card or recipes the query named. */
    links: z.array(LinkSchema),
    method: GeneralMethodSchema.nullable(),
    suggestions: z.array(MethodSuggestionSchema),
  }),
]);

export const MethodSearchResponseSchema = z.object({
  success: z.literal(true),
  query: z.string(),
  answer: MethodAnswerSchema,
});

export type MethodSuggestion = z.infer<typeof MethodSuggestionSchema>;
export type GeneralMethod = z.infer<typeof GeneralMethodSchema>;
export type MethodAnswer = z.infer<typeof MethodAnswerSchema>;
export type MethodSearchResponse = z.infer<typeof MethodSearchResponseSchema>;
