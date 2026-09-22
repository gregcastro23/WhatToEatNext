/**
 * Client-side validators for GET /api/admin/growth and GET /api/admin/pulse.
 *
 * @file src/lib/admin/schemas/growth.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import { MoneySchema } from "@/lib/admin/schemas/revenue";
import type { AdminPulse } from "@/services/admin/adminPulseService";
import type { GrowthPayload } from "@/services/admin/userGrowthService";

export const GrowthSchema = z.object({
  generatedAt: z.string(),
  live: z.boolean(),
  errors: z.array(z.string()),
  activitySources: z.array(z.string()),
  population: z.object({ humans: z.number(), agents: z.number() }),
  engagement: z.object({
    dau: z.number(),
    wau: z.number(),
    mau: z.number(),
    stickiness: z.number().nullable(),
  }),
  series: z.array(z.object({ day: z.string(), signups: z.number(), active: z.number() })),
  cohorts: z.array(
    z.object({ week: z.string(), size: z.number(), retained: z.array(z.number().nullable()) }),
  ),
  funnel: z.array(z.object({ step: z.string(), count: z.number(), detail: z.string() })),
  recentSignups: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
      createdAt: z.string(),
      onboarded: z.boolean(),
      lastActiveAt: z.string().nullable(),
      events7d: z.number(),
    }),
  ),
  mostActive: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
      events30d: z.number(),
      lastActiveAt: z.string().nullable(),
    }),
  ),
});

export type GrowthView = z.infer<typeof GrowthSchema>;

export const PulseSchema = z.object({
  generatedAt: z.string(),
  errors: z.array(z.string()),
  deploy: z.object({
    sha: z.string().nullable(),
    message: z.string().nullable(),
    author: z.string().nullable(),
    branch: z.string().nullable(),
    env: z.string().nullable(),
  }),
  traffic: z
    .object({
      status: z.enum(["live", "missing-table", "error"]),
      activeNow: z.number(),
      pageviews24h: z.number(),
      visitors24h: z.number(),
      pageviewsPrev24h: z.number(),
      lastVisitAt: z.string().nullable(),
    })
    .nullable(),
  growth: z
    .object({
      live: z.boolean(),
      humans: z.number(),
      agents: z.number(),
      dau: z.number(),
      wau: z.number(),
      mau: z.number(),
      signupsToday: z.number(),
      signups7d: z.number(),
    })
    .nullable(),
  revenue: z
    .object({
      configured: z.boolean(),
      mode: z.enum(["live", "test", "unknown"]),
      mrr: z.array(MoneySchema).nullable(),
      activeSubscriptions: z.number().nullable(),
      net30d: z.array(MoneySchema).nullable(),
      available: z.array(MoneySchema).nullable(),
      failed30d: z.number().nullable(),
      webhookStatus: z.enum(["ok", "degraded", "incident", "unknown"]).nullable(),
      errors: z.array(z.string()),
    })
    .nullable(),
  code: z
    .object({
      tscErrors: z.number().nullable(),
      eslintWarnings: z.number().nullable(),
      eslintErrors: z.number().nullable(),
      readingSha: z.string().nullable(),
      readingAt: z.string().nullable(),
      trackedDebt: z.number().nullable(),
      ciConclusion: z.string().nullable(),
      ciSha: z.string().nullable(),
    })
    .nullable(),
  solana: z
    .object({
      devnetReachable: z.boolean(),
      programDeployed: z.boolean().nullable(),
      paused: z.boolean().nullable(),
      lastTxAt: z.string().nullable(),
      txs7d: z.number().nullable(),
      deployerSol: z.number().nullable(),
      deployerLow: z.boolean(),
      mainnetProgramDeployed: z.boolean().nullable(),
      mainnetStatus: z.string().nullable(),
      commits7d: z.number().nullable(),
    })
    .nullable(),
  base: z
    .object({
      reachable: z.boolean(),
      chain: z.string(),
      minterEth: z.number().nullable(),
      minterLow: z.boolean(),
      claimsPending: z.number().nullable(),
      claimsMinted: z.number().nullable(),
    })
    .nullable(),
});

export type PulseView = z.infer<typeof PulseSchema>;

type _GrowthDrift = AssertTrue<ServerSatisfies<GrowthPayload, GrowthView>>;
type _PulseDrift = AssertTrue<ServerSatisfies<AdminPulse, PulseView>>;
