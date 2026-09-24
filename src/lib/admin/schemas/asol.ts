/**
 * Client-side validator for GET /api/admin/asol.
 *
 * @file src/lib/admin/schemas/asol.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";

const SignatureBreakdownSchema = z.object({
  valid: z.number(),
  unsigned: z.number(),
  untracked: z.number(),
  failed: z.number(),
  reasons: z.record(z.string(), z.number()),
});

const AsolSourceStatsSchema = z.object({
  source: z.string(),
  received: z.number(),
  processed: z.number(),
  inFlight: z.number(),
  liveInFlight: z.number(),
  staleLocks: z.number(),
  failed: z.number(),
  duplicates: z.number(),
  p95LatencyMs: z.number().nullable(),
  signatureBreakdown: SignatureBreakdownSchema,
});

const AsolDeliveryEventSchema = z.object({
  id: z.string(),
  source: z.string(),
  eventId: z.string(),
  eventType: z.string(),
  subjectId: z.string().nullable(),
  status: z.string(),
  attempts: z.number(),
  duplicates: z.number(),
  latencyMs: z.number().nullable(),
  lastError: z.string().nullable(),
  receivedAt: z.string(),
});

const FeedEmitStatusSchema = z.object({
  eventType: z.string(),
  agentEmail: z.string(),
  responseCode: z.number(),
  timestamp: z.string(),
});

const SignatureModeInfoSchema = z.object({
  mode: z.enum(["off", "shadow", "required"]),
  raw: z.string(),
  valid: z.boolean(),
});

const FeedStatusSchema = z.object({
  lastEmit: FeedEmitStatusSchema.nullable(),
  signatureMode: z.string(),
  signatureModeInfo: SignatureModeInfoSchema,
  internalSecretConfigured: z.boolean(),
  syncSecretConfigured: z.boolean(),
  hookSecretConfigured: z.boolean(),
});

export const AsolHealthOverviewSchema = z.object({
  generatedAt: z.string(),
  totalReceived: z.number(),
  totalProcessed: z.number(),
  totalInFlight: z.number(),
  totalLiveInFlight: z.number(),
  totalStaleLocks: z.number(),
  totalFailed: z.number(),
  totalDuplicates: z.number(),
  overallP95LatencyMs: z.number().nullable(),
  sources: z.array(AsolSourceStatsSchema),
  recentEvents: z.array(AsolDeliveryEventSchema),
  feedStatus: FeedStatusSchema,
});

export type AsolHealthOverviewView = z.infer<typeof AsolHealthOverviewSchema>;

type _AsolDrift = AssertTrue<ServerSatisfies<AsolHealthOverview, AsolHealthOverviewView>>;
