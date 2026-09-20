import { z } from "zod";
import {
  BirthDataSchema,
  NatalChartSchema,
  GroupMemberSchema,
  DiningGroupSchema,
} from "./commensalResponseSchemas";

export const TokenEconomyStateSchema = z
  .object({
    balances: z.object({
      spirit: z.number(),
      essence: z.number(),
      matter: z.number(),
      substance: z.number(),
    }),
    isPremium: z.boolean(),
    streakCount: z.number(),
    lastDailyClaimAt: z.string().nullable().optional(),
  })
  .passthrough();

export const SavedChartSchema = z
  .object({
    id: z.string(),
    ownerId: z.string().optional(),
    label: z.string(),
    chartType: z.enum(["primary", "cosmic_identity", "manual"]).optional(),
    birthData: BirthDataSchema.optional(),
    natalChart: NatalChartSchema.optional(),
    isPrimary: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export const ServerProfileDataSchema = z
  .object({
    id: z.string().optional(),
    userId: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    preferences: z.record(z.string(), z.unknown()).optional(),
    dietaryPreferences: z.record(z.string(), z.unknown()).optional(),
    onboardingComplete: z.boolean().optional(),
    birthData: BirthDataSchema.optional().catch(undefined),
    natalChart: NatalChartSchema.optional().catch(undefined),
    groupMembers: z.array(GroupMemberSchema).optional().catch([]),
    diningGroups: z.array(DiningGroupSchema).optional().catch([]),
    savedCharts: z.array(SavedChartSchema).optional().catch([]),
    tokenEconomy: TokenEconomyStateSchema.optional().catch(undefined),
    stats: z.record(z.string(), z.unknown()).optional().catch(undefined),
  })
  .passthrough();

export const ServerProfileResponseSchema = z
  .object({
    success: z.boolean().optional(),
    profile: ServerProfileDataSchema.optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type ServerProfileResponseWire = z.infer<typeof ServerProfileResponseSchema>;
export type ServerProfileDataWire = z.infer<typeof ServerProfileDataSchema>;
