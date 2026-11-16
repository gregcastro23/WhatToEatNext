/**
 * Validator for GET /api/admin/overview-pulse — multiplexed snapshot for
 * the three above-the-fold panels on /admin (PulseStrip, LiveActivityPanel,
 * SystemStatusPanel) so the overview page runs a single polling loop.
 *
 * @file src/lib/admin/schemas/overviewPulse.ts
 */

import { z } from "zod";
import { PulseSchema } from "@/lib/admin/schemas/growth";
import { SystemStatusResponseSchema } from "@/lib/admin/schemas/systemStatus";
import { FrictionAlertsSchema, InteractionTalliesSchema } from "@/lib/admin/schemas/traffic";
import { LiveActivityPayloadSchema } from "@/lib/validation/adminResponseSchemas";

export const OverviewPulseResponseSchema = z
  .object({
    success: z.boolean(),
    generatedAt: z.string(),
    pulse: PulseSchema.nullable(),
    liveActivity: LiveActivityPayloadSchema.nullable(),
    systemStatus: SystemStatusResponseSchema.nullable(),
    frictionAlerts: FrictionAlertsSchema.nullable().optional(),
    interactionTallies: InteractionTalliesSchema.nullable().optional(),
  })
  .passthrough();

export type OverviewPulseView = z.infer<typeof OverviewPulseResponseSchema>;
