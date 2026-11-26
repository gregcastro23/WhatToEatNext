/**
 * The shape of a food guide: how to buy, store, prepare, substitute and cook
 * one food, with a source behind every statement.
 *
 * Owner ruling 2026-11-25: the methods search and the ingredient cards answer
 * from researched, cited guides. The standard they are written to: every value
 * names its basis. So a claim or a number without a source id is invalid here,
 * and `guides.test.ts` holds every guide to the USDA safe-temperature floors.
 */
import { z } from "zod";

export const GUIDE_METHOD_IDS = [
  "oven_bake",
  "roast",
  "pan_fry",
  "saute",
  "stir_fry",
  "deep_fry",
  "air_fry",
  "microwave",
  "grill",
  "broil",
  "boil",
  "simmer",
  "steam",
  "poach",
  "scramble",
  "braise",
  "slow_cook",
  "pressure_cook",
  "rice_cooker",
  "sous_vide",
  "smoke",
] as const;

export type GuideMethodId = (typeof GUIDE_METHOD_IDS)[number];

/** Which USDA safe-minimum rule a food falls under; `none` for plants and dry goods. */
export const SAFETY_CLASSES = [
  "poultry",
  "ground_meat",
  "whole_meat",
  "cured_meat",
  "fish",
  "egg",
  "none",
] as const;

export type SafetyClass = (typeof SAFETY_CLASSES)[number];

export const QUANTITY_KINDS = [
  "oven_temp",
  "surface_temp",
  "liquid_temp",
  "internal_temp",
  "time",
  "rest",
  "ratio",
  "size",
] as const;

export type QuantityKind = (typeof QUANTITY_KINDS)[number];

export const QUANTITY_UNITS = ["°F", "sec", "min", "hr", "day", "week", "month", "in", "cup", "tbsp", "tsp", "qt", "lb", "psi"] as const;

export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

const SourceIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const SourceIdsSchema = z.array(SourceIdSchema).min(1).max(6);
const LineSchema = z.string().trim().min(3).max(400);

export const GuideSourceSchema = z.strictObject({
  id: SourceIdSchema,
  publisher: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(200),
  url: z.url({ protocol: /^https$/ }),
  /** The day the page was read, YYYY-MM-DD. */
  retrieved: z.iso.date(),
});

export const GuideClaimSchema = z.strictObject({
  text: LineSchema,
  sources: SourceIdsSchema,
});

export const GuideQuantitySchema = z
  .strictObject({
    kind: z.enum(QUANTITY_KINDS),
    label: z.string().trim().min(2).max(80),
    min: z.number().finite().nonnegative(),
    /** Null when the source gives one value rather than a range. */
    max: z.number().finite().nonnegative().nullable(),
    unit: z.enum(QUANTITY_UNITS),
    sources: SourceIdsSchema,
  })
  .refine((q) => q.max === null || q.max >= q.min, { message: "max is below min" });

export const GuideSubstitutionSchema = z.strictObject({
  name: z.string().trim().min(2).max(80),
  note: LineSchema,
  sources: SourceIdsSchema,
});

export const GuideMethodSchema = z.strictObject({
  id: z.enum(GUIDE_METHOD_IDS),
  label: z.string().trim().min(2).max(60),
  /** Exactly one method per guide is the recommended one. */
  best: z.boolean(),
  /** Why or when to pick this method. */
  why: GuideClaimSchema,
  quantities: z.array(GuideQuantitySchema).max(10),
  equipment: z.array(z.string().trim().min(2).max(60)).max(8),
  steps: z.array(GuideClaimSchema).min(2).max(12),
  tips: z.array(GuideClaimSchema).max(8),
  doneness: z.array(GuideClaimSchema).max(5),
});

export const FoodGuideSchema = z.strictObject({
  id: SourceIdSchema,
  name: z.string().trim().min(2).max(60),
  /** Other ways a searcher names this food, lower case. */
  aliases: z.array(z.string().trim().min(2).max(60)).max(20),
  /** Ingredient-catalog keys whose cards carry this guide. */
  catalogKeys: z.array(z.string().trim().min(2).max(80)).max(12),
  safetyClass: z.enum(SAFETY_CLASSES),
  summary: GuideClaimSchema,
  selection: z.array(GuideClaimSchema).max(8),
  storage: z.array(GuideClaimSchema).max(8),
  preparation: z.array(GuideClaimSchema).max(8),
  substitutions: z.array(GuideSubstitutionSchema).max(8),
  safety: z.array(GuideClaimSchema).max(8),
  methods: z.array(GuideMethodSchema).min(2).max(7),
  sources: z.array(GuideSourceSchema).min(1).max(20),
});

export type GuideSource = z.infer<typeof GuideSourceSchema>;
export type GuideClaim = z.infer<typeof GuideClaimSchema>;
export type GuideQuantity = z.infer<typeof GuideQuantitySchema>;
export type GuideSubstitution = z.infer<typeof GuideSubstitutionSchema>;
export type GuideMethod = z.infer<typeof GuideMethodSchema>;
export type FoodGuide = z.infer<typeof FoodGuideSchema>;

function claimSources(claims: readonly GuideClaim[]): string[] {
  return claims.flatMap((claim) => claim.sources);
}

function methodSources(method: GuideMethod): string[] {
  return [
    ...claimSources([method.why, ...method.steps, ...method.tips, ...method.doneness]),
    ...method.quantities.flatMap((quantity) => quantity.sources),
  ];
}

/** Every source id a guide's statements cite, with repeats. */
export function citedSourceIds(guide: FoodGuide): string[] {
  const claims = [guide.summary, ...guide.selection, ...guide.storage, ...guide.preparation, ...guide.safety];
  return [
    ...claimSources(claims),
    ...guide.substitutions.flatMap((substitution) => substitution.sources),
    ...guide.methods.flatMap(methodSources),
  ];
}
