/**
 * Client-side validator for GET /api/admin/todays-highlights (TodaysHighlightsPanel).
 *
 * @file src/lib/admin/schemas/todaysHighlights.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type {
  TodaysHighlightsPayload,
  TodaysHighlightsResponse,
} from "@/services/todaysHighlightsService";

export const TodaysHighlightsSchema = z.object({
  generatedAt: z.string(),
  metrics: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      today: z.number(),
      yesterday: z.number().nullable(),
      delta: z.number().nullable(),
      hint: z.string().exactOptional(),
      live: z.boolean(),
      goodWhenIncreasing: z.boolean(),
    }),
  ),
  live: z.boolean(),
});

export type TodaysHighlightsView = z.infer<typeof TodaysHighlightsSchema>;

type _TodaysHighlightsDrift = AssertTrue<ServerSatisfies<TodaysHighlightsPayload, TodaysHighlightsView>>;
type _TodaysHighlightsExact = AssertTrue<ServerSatisfies<TodaysHighlightsView, TodaysHighlightsPayload>>;

export const TodaysHighlightsResponseSchema = TodaysHighlightsSchema.extend({
  success: z.literal(true),
});

type _TodaysHighlightsResponseDrift = AssertTrue<
  ServerSatisfies<TodaysHighlightsResponse, z.infer<typeof TodaysHighlightsResponseSchema>>
>;
