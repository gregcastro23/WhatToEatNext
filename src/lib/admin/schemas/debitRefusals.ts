/**
 * Client-side validator for GET /api/admin/debit-refusals.
 *
 * @file src/lib/admin/schemas/debitRefusals.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { DebitRefusalReport } from "@/services/debitRefusalService";

export const DebitRefusalReportSchema = z.object({
  live: z.boolean(),
  note: z.string().nullable(),
  generatedAt: z.string(),
  windowHours: z.number(),
  recordingSince: z.string().nullable(),
  total: z.number(),
  emptyBasket: z.number(),
  byReason: z.array(
    z.object({
      reason: z.string(),
      refusals: z.number(),
      emptyBasket: z.number(),
      meanShortfallValue: z.number().nullable(),
      shortfallKnown: z.number(),
    }),
  ),
  byHour: z.array(z.object({ hour: z.string(), refusals: z.number(), emptyBasket: z.number() })),
});

export type DebitRefusalReportView = z.infer<typeof DebitRefusalReportSchema>;

type _DebitRefusalDrift = AssertTrue<ServerSatisfies<DebitRefusalReport, DebitRefusalReportView>>;
type _DebitRefusalExact = AssertTrue<ServerSatisfies<DebitRefusalReportView, DebitRefusalReport>>;

export const DebitRefusalResponseSchema = DebitRefusalReportSchema.extend({
  success: z.literal(true),
});
