/**
 * Client-side validators for /api/agents/unified responses.
 *
 * @file src/lib/validation/agentResponseSchemas.ts
 */

import { z } from "zod";

export const UnifiedAgentChatResponseSchema = z
  .object({
    success: z.boolean().optional(),
    data: z
      .object({
        text: z.string().optional(),
        degraded: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    error: z.string().optional(),
  })
  .passthrough();

export type UnifiedAgentChatResponse = z.infer<typeof UnifiedAgentChatResponseSchema>;

export const UnifiedAgentCreateResponseSchema = z
  .object({
    success: z.boolean().optional(),
    data: z
      .object({
        id: z.string(),
        name: z.string(),
        dominantElement: z.string(),
        monicaConstant: z.number(),
      })
      .passthrough()
      .optional(),
    error: z.string().optional(),
  })
  .passthrough();

export type UnifiedAgentCreateResponse = z.infer<typeof UnifiedAgentCreateResponseSchema>;
