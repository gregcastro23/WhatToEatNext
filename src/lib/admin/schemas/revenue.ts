/**
 * Client-side validator for GET /api/admin/revenue.
 *
 * @file src/lib/admin/schemas/revenue.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { StripeRevenuePayload } from "@/services/admin/stripeRevenueTypes";

export const MoneySchema = z.object({ amount: z.number(), currency: z.string() });
export type MoneyView = z.infer<typeof MoneySchema>;

export const RevenueSchema = z.object({
  generatedAt: z.string(),
  configured: z.boolean(),
  mode: z.enum(["live", "test", "unknown"]),
  errors: z.array(z.string()),
  balance: z.object({ available: z.array(MoneySchema), pending: z.array(MoneySchema) }).nullable(),
  subscriptions: z
    .object({
      mrr: z.array(MoneySchema),
      byStatus: z.record(z.string(), z.number()),
      active: z.number(),
      newLast30d: z.number(),
      canceledLast30d: z.number(),
      truncated: z.boolean(),
    })
    .nullable(),
  charges: z
    .object({
      windowDays: z.number(),
      count: z.number(),
      succeeded: z.number(),
      failed: z.number(),
      gross: z.array(MoneySchema),
      refunded: z.array(MoneySchema),
      net: z.array(MoneySchema),
      daily: z.array(z.object({ day: z.string(), gross: z.number(), count: z.number() })),
      dailyCurrency: z.string().nullable(),
      recent: z.array(
        z.object({
          id: z.string(),
          created: z.string(),
          amount: z.number(),
          amountRefunded: z.number(),
          currency: z.string(),
          status: z.string(),
          paid: z.boolean(),
          description: z.string().nullable(),
          email: z.string().nullable(),
          method: z.string().nullable(),
          failureMessage: z.string().nullable(),
          purpose: z.string().nullable(),
        }),
      ),
      truncated: z.boolean(),
    })
    .nullable(),
  checkout: z
    .object({
      windowDays: z.number(),
      byPurpose: z.array(
        z.object({
          purpose: z.string(),
          created: z.number(),
          completed: z.number(),
          expired: z.number(),
          open: z.number(),
          revenue: z.number(),
          currency: z.string().nullable(),
        }),
      ),
      truncated: z.boolean(),
    })
    .nullable(),
  events: z
    .object({
      windowDays: z.number(),
      total: z.number(),
      byType: z.array(z.object({ type: z.string(), count: z.number() })),
      pendingDelivery: z.array(
        z.object({ id: z.string(), type: z.string(), created: z.string(), pendingWebhooks: z.number() }),
      ),
      truncated: z.boolean(),
    })
    .nullable(),
  webhookCoverage: z
    .object({
      status: z.enum(["ok", "degraded", "incident", "unknown"]),
      summary: z.string(),
      live: z.boolean(),
      endpointUrl: z.string().optional(),
      missingEvents: z.array(z.string()),
      missingCriticalEvents: z.array(z.string()),
      unhandledEvents: z.array(z.string()),
      endpointStatus: z.string().optional(),
    })
    .nullable(),
});

export type RevenueView = z.infer<typeof RevenueSchema>;

type _RevenueDrift = AssertTrue<ServerSatisfies<StripeRevenuePayload, RevenueView>>;
