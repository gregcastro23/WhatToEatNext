import { z } from "zod";

export const SAVED_ADAPTATION_SOURCE = "saved-adaptation";
export const AdaptationIngredientSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().finite().positive(),
  unit: z.string().trim().min(1),
  optional: z.boolean().optional(),
});
const BibliographicSourceSchema = z.object({
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  url: z.string(),
  accessed: z.string(),
  notes: z.string().optional(),
});
export const AdaptationRecipeSchema = z.object({
  name: z.string().min(1),
  cuisine: z.string().optional(),
  ingredients: z.array(AdaptationIngredientSchema).min(1),
  instructions: z.array(z.string().trim().min(1)).min(1),
  servingSize: z.number().finite().positive().optional(),
  numberOfServings: z.number().finite().positive().optional(),
  adaptedFrom: BibliographicSourceSchema.optional(),
});
export const HistoricalPreferencesSchema = z
  .object({
    culturalCuisine: z.string().trim().min(1).optional(),
    dietaryPhilosophy: z.string().trim().min(1).optional(),
    staples: z.array(z.string().trim().min(1)).optional(),
    favoriteFoods: z.array(z.string().trim().min(1)).optional(),
    avoidedFoods: z.array(z.string().trim().min(1)).optional(),
    beverages: z.array(z.string().trim().min(1)).optional(),
    foodLore: z.string().trim().min(1).optional(),
  })
  .refine(
    (value) =>
      Object.values(value).some(
        (v) => typeof v === "string" || (Array.isArray(v) && v.length > 0),
      ),
    "Saved preferences are unavailable",
  );

export const ChartPlacementSchema = z.object({
  planet: z.string().min(1),
  sign: z.string().min(1),
  position: z.number().finite().min(0).lt(360),
});
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const FindingSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.string().optional(),
  severity: z.enum(["blocking", "advisory"]),
});
export const AdaptationVerificationSchema = z.object({
  valid: z.literal(true),
  verified: z.boolean(),
  requestedRestrictions: z.array(z.string()),
  evaluatedRestrictions: z.array(z.string()),
  unevaluatedRestrictions: z.array(z.string()),
  unresolvedIngredients: z.array(z.string()),
  notChecked: z.array(z.string()),
  advisoryFindings: z.array(FindingSchema),
});
export const SavedAdaptationSchema = z.object({
  kind: z.literal("saved-adaptation"),
  schemaVersion: z.literal(1),
  id: z.string().uuid(),
  requestFingerprint: hash,
  recipe: AdaptationRecipeSchema,
  receipt: z.object({
    mode: z.literal("vegetarian"),
    original: z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      contentHash: hash,
    }),
    actor: z.object({
      id: z.string().uuid(),
      slug: z.string().min(1),
      name: z.string().min(1),
    }),
    basis: z.object({
      chart: z.object({
        source: z.enum([
          "user_profiles.natal_positions",
          "user_profiles.natal_chart",
        ]),
        digest: hash,
        placements: z.array(ChartPlacementSchema).min(5),
      }),
      preferences: z.object({
        source: z.literal("user_profiles.dietary_preferences"),
        digest: hash,
        values: HistoricalPreferencesSchema,
      }),
      usedPlacementIndices: z.array(z.number().int().nonnegative()).min(1),
      usedPreferenceKeys: z.array(z.string().min(1)).min(1),
    }),
    changes: z.object({
      ingredients: z
        .array(
          z.object({
            index: z.number().int().nonnegative(),
            from: AdaptationIngredientSchema,
            to: AdaptationIngredientSchema,
          }),
        )
        .min(1),
      instructions: z
        .array(
          z.object({
            index: z.number().int().nonnegative(),
            from: z.string(),
            to: z.string(),
          }),
        )
        .min(1),
    }),
    contentHash: hash,
    explanation: z.string().min(1),
    verification: AdaptationVerificationSchema,
    readingsUnavailable: z.array(
      z.enum(["nutrition", "elemental", "esms", "planetary"]),
    ),
  }),
});
export type SavedAdaptation = z.infer<typeof SavedAdaptationSchema>;
export type AdaptationRecipe = z.infer<typeof AdaptationRecipeSchema>;
export type HistoricalPreferences = z.infer<typeof HistoricalPreferencesSchema>;

export const AdaptationRequestSchema = z.object({
  agentSlug: z.literal("leonardo-da-vinci"),
  mode: z.literal("vegetarian"),
  clientRequestId: z.string().uuid(),
});
export const AdaptationSuccessSchema = z.object({
  success: z.literal(true),
  version: SavedAdaptationSchema,
  publication: z.enum(["published", "not-published", "unknown"]),
});
export const AdaptationErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

/** Public generic stores cannot mint WTEN's validated adaptation provenance. */
export function isReservedAdaptation(
  source: string | undefined,
  payload: unknown,
): boolean {
  return (
    source === SAVED_ADAPTATION_SOURCE ||
    z.object({ kind: z.literal("saved-adaptation") }).safeParse(payload).success
  );
}
