import { z } from "zod";
import type { UserNotification } from "@/types/notification";

export const NOTIFICATION_TYPES = [
  "welcome",
  "login_greeting",
  "daily_insight",
  "commensal_request",
  "commensal_accepted",
  "quest_completed",
  "master_quest_broadcast",
  "agent_broadcast",
  "transit_attunement",
  "new_follower",
  "table_invite",
  "table_rsvp",
  "table_going_live",
  "table_memory_posted",
  "table_join_request",
  "reaction_received",
  "comment_received",
  "dm_message",
  "circle_message",
  "table_chat_mention",
] as const;

export const NotificationTypeSchema = z.enum(NOTIFICATION_TYPES);

export const UserNotificationSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    type: NotificationTypeSchema,
    title: z.string(),
    message: z.string(),
    isRead: z.boolean(),
    relatedUserId: z.string().optional(),
    relatedUserName: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    createdAt: z.string(),
    expiresAt: z.string().optional(),
  })
  .passthrough();

export type UserNotificationWire = z.infer<typeof UserNotificationSchema>;

export function toDomainNotification(wire: UserNotificationWire): UserNotification {
  return {
    id: wire.id,
    userId: wire.userId,
    type: wire.type,
    title: wire.title,
    message: wire.message,
    isRead: wire.isRead,
    createdAt: wire.createdAt,
    ...(wire.relatedUserId !== undefined ? { relatedUserId: wire.relatedUserId } : {}),
    ...(wire.relatedUserName !== undefined ? { relatedUserName: wire.relatedUserName } : {}),
    ...(wire.metadata !== undefined ? { metadata: wire.metadata } : {}),
    ...(wire.expiresAt !== undefined ? { expiresAt: wire.expiresAt } : {}),
  };
}

export const NotificationListResponseSchema = z
  .object({
    success: z.boolean().optional(),
    notifications: z.array(UserNotificationSchema).optional().default([]),
    unreadCount: z.number().optional().default(0),
    total: z.number().optional(),
  })
  .passthrough();

export type NotificationListResponseWire = z.infer<
  typeof NotificationListResponseSchema
>;

export const MarkAllReadResponseSchema = z
  .object({
    success: z.boolean().optional(),
    count: z.number().optional().default(0),
    message: z.string().optional(),
  })
  .passthrough();

export type MarkAllReadResponseWire = z.infer<typeof MarkAllReadResponseSchema>;

export const NotificationActionResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    notification: UserNotificationSchema.optional(),
    alreadyGenerated: z.boolean().optional(),
  })
  .passthrough();

export type NotificationActionResponseWire = z.infer<
  typeof NotificationActionResponseSchema
>;
