/**
 * Client-side validator for the overview's moderation counts, read from
 * GET /api/admin/chat/reports and GET /api/admin/feed/comment-reports.
 *
 * @file src/lib/admin/schemas/moderation.ts
 */

import { z } from "zod";

/**
 * The overview only counts open reports, so it checks that `reports` is an
 * array and nothing about its items (the moderation pages validate those).
 */
export const ReportQueueCountSchema = z.object({ reports: z.array(z.unknown()) });
