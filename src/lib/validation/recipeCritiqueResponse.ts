import { z } from "zod";

const CritiqueContentSchema = z.object({
  author: z.string().min(1),
  tip: z.string().min(1),
  agentSlug: z.string().min(1),
  dominantElement: z.string().nullable().optional(),
  contentState: z.enum(["live", "gateway-degraded", "curated"]),
});

export const RecipeCritiqueSchema = z.discriminatedUnion("published", [
  CritiqueContentSchema.extend({
    published: z.literal(true),
    persistedAt: z.string().datetime(),
  }),
  CritiqueContentSchema.extend({
    published: z.literal(false),
    persistedAt: z.never().optional(),
  }),
]);

// `review` preserves the older response alias. New readers consume `critique`.
export const RecipeCritiqueResponseSchema = z.object({
  success: z.literal(true),
  critique: RecipeCritiqueSchema,
  review: CritiqueContentSchema.extend({
    published: z.boolean(),
    postedAt: z.string().datetime().optional(),
  }),
});

export const RecipeCritiqueReaderSchema = RecipeCritiqueResponseSchema.pick({
  success: true,
  critique: true,
});

export type RecipeCritique = z.infer<typeof RecipeCritiqueSchema>;
export type RecipeCritiqueResponse = z.infer<
  typeof RecipeCritiqueResponseSchema
>;
