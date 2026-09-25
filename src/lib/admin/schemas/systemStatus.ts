/**
 * Client-side validator for GET /api/admin/system-status (SystemStatusPanel).
 *
 * @file src/lib/admin/schemas/systemStatus.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { SystemStatusPayload, SystemStatusResponse } from "@/services/systemStatusService";

export const FlowStatusSchema = z.enum(["OK", "DEGRADED", "INCIDENT", "UNKNOWN"]);

const FlowHealthSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  status: FlowStatusSchema,
  summary: z.string(),
  metrics: z.array(
    z.object({ label: z.string(), value: z.string(), raw: z.number().exactOptional() }),
  ),
  issues: z.array(
    z.object({ at: z.string(), message: z.string(), severity: z.enum(["warn", "error"]) }),
  ),
  checkedAt: z.string(),
  live: z.boolean(),
});

const DependencyHealthSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: FlowStatusSchema,
  summary: z.string(),
  latencyMs: z.number().nullable(),
  checkedAt: z.string(),
});

export const SystemStatusSchema = z.object({
  generatedAt: z.string(),
  overall: FlowStatusSchema,
  flows: z.array(FlowHealthSchema),
  dependencies: z.array(DependencyHealthSchema),
});

export type SystemStatusView = z.infer<typeof SystemStatusSchema>;

type _SystemStatusDrift = AssertTrue<ServerSatisfies<SystemStatusPayload, SystemStatusView>>;
type _SystemStatusExact = AssertTrue<ServerSatisfies<SystemStatusView, SystemStatusPayload>>;

export const SystemStatusResponseSchema = SystemStatusSchema.extend({ success: z.literal(true) });

type _SystemStatusResponseDrift = AssertTrue<
  ServerSatisfies<SystemStatusResponse, z.infer<typeof SystemStatusResponseSchema>>
>;
