/**
 * Client-side validators for /api/users/me/meal-plan. Guarded twice: the
 * server DTO must satisfy the schema (a renamed or newly nullable server field
 * fails `tsc`), and the schema's output must satisfy the hook's MealPlanEntry,
 * so the hook keeps its public type without a cast. Type-only server imports.
 *
 * @file src/lib/validation/mealPlanResponseSchemas.ts
 */

import { z } from "zod";
import type { MealPlanEntry } from "@/hooks/useMealPlan";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type {
  MealPlanAddResponse,
  MealPlanEntryDTO,
  MealPlanListResponse,
} from "@/types/userMealPlan";

export const MealPlanEntrySchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  recipeName: z.string().exactOptional(),
  date: z.string(),
  mealType: z.string().exactOptional(),
  servings: z.number(),
  addedAt: z.number(),
});

type _MealPlanEntryDrift = AssertTrue<ServerSatisfies<MealPlanEntryDTO, z.infer<typeof MealPlanEntrySchema>>>;
type _MealPlanEntryReader = AssertTrue<ServerSatisfies<z.infer<typeof MealPlanEntrySchema>, MealPlanEntry>>;

export const MealPlanListResponseSchema = z.object({
  authenticated: z.boolean(),
  entries: z.array(MealPlanEntrySchema),
});

type _MealPlanListDrift = AssertTrue<
  ServerSatisfies<MealPlanListResponse, z.infer<typeof MealPlanListResponseSchema>>
>;

export const MealPlanAddResponseSchema = z.object({
  authenticated: z.literal(true),
  entry: MealPlanEntrySchema,
});

type _MealPlanAddDrift = AssertTrue<
  ServerSatisfies<MealPlanAddResponse, z.infer<typeof MealPlanAddResponseSchema>>
>;
