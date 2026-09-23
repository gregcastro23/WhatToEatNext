import { z } from "zod";

export const AdminTimelineCategorySchema = z.enum([
  "signup",
  "auth",
  "onboarding",
  "recipe",
  "economy",
  "agent",
  "diary",
  "subscription",
]);

export const AdminTimelineStatusSchema = z.enum(["success", "failure", "info"]);

export const AdminTimelineEventSchema = z
  .object({
    id: z.string(),
    at: z.string(),
    category: AdminTimelineCategorySchema,
    type: z.string(),
    description: z.string(),
    status: AdminTimelineStatusSchema,
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type AdminTimelineEvent = z.infer<typeof AdminTimelineEventSchema>;

export const AdminUserIdentitySchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    roles: z.array(z.string()),
    isActive: z.boolean(),
    isAgent: z.boolean(),
    isAdmin: z.boolean(),
    createdAt: z.string(),
    lastLoginAt: z.string().nullable(),
    loginCount: z.number(),
    dominantElement: z.string().nullable(),
    bio: z.string().nullable(),
    monicaConstant: z.number().nullable(),
    hasCompletedOnboarding: z.boolean(),
    onboardingCompletedAt: z.string().nullable(),
    activeSessions: z.number(),
  })
  .passthrough();

export type AdminUserIdentity = z.infer<typeof AdminUserIdentitySchema>;

export const AdminBalancesSchema = z
  .object({
    spirit: z.number(),
    essence: z.number(),
    matter: z.number(),
    substance: z.number(),
    total: z.number(),
  })
  .passthrough();

export type AdminBalances = z.infer<typeof AdminBalancesSchema>;

export const AdminSubscriptionSchema = z
  .object({
    tier: z.string(),
    status: z.string(),
    currentPeriodEnd: z.string().nullable(),
  })
  .passthrough();

export type AdminSubscription = z.infer<typeof AdminSubscriptionSchema>;

export const AdminLifetimeStatsSchema = z
  .object({
    signIns: z.number(),
    signInFailures: z.number(),
    recipesViewed: z.number(),
    recipesCooked: z.number(),
    diaryEntries: z.number(),
    tokensEarned: z.number(),
    tokensSpent: z.number(),
    agentEvents: z.number(),
  })
  .passthrough();

export type AdminLifetimeStats = z.infer<typeof AdminLifetimeStatsSchema>;

export const AdminUserTimelinePayloadSchema = z
  .object({
    identity: AdminUserIdentitySchema,
    balances: AdminBalancesSchema,
    subscription: AdminSubscriptionSchema.nullable(),
    stats: AdminLifetimeStatsSchema,
    events: z.array(AdminTimelineEventSchema),
    live: z.boolean(),
    generatedAt: z.string(),
  })
  .passthrough();

export type AdminUserTimelinePayload = z.infer<
  typeof AdminUserTimelinePayloadSchema
>;

export const AdminUserTimelineResponseSchema = AdminUserTimelinePayloadSchema.extend(
  {
    success: z.boolean(),
  },
).passthrough();

export type AdminUserTimelineResponse = z.infer<
  typeof AdminUserTimelineResponseSchema
>;

export const AdminSessionRevokeResponseSchema = z
  .object({
    success: z.boolean().optional(),
    revoked: z.number().optional(),
    revocationCheck: z.enum(["on", "off"]).optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type AdminSessionRevokeResponse = z.infer<
  typeof AdminSessionRevokeResponseSchema
>;

export const AdminPatchUserResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type AdminPatchUserResponse = z.infer<
  typeof AdminPatchUserResponseSchema
>;
