import { z } from "zod";
import type { ChatMessage } from "@/types/chat";

export const ChatAttachmentSchema = z
  .object({
    type: z.literal("photo"),
    url: z.string(),
  })
  .passthrough();

export const ChatMessageSchema = z
  .object({
    id: z.string(),
    conversationId: z.string(),
    senderId: z.string(),
    body: z.string(),
    attachments: z.array(ChatAttachmentSchema).optional().default([]),
    replyToId: z.string().optional(),
    clientKey: z.string().optional(),
    createdAt: z.string(),
    editedAt: z.string().nullable().optional().default(null),
    deletedAt: z.string().nullable().optional().default(null),
    senderName: z.string().optional(),
    senderAvatarUrl: z.string().optional(),
    senderIsAgent: z.boolean().optional(),
    pending: z.boolean().optional(),
  })
  .passthrough();

export type ChatMessageWire = z.infer<typeof ChatMessageSchema>;

export function toDomainChatMessage(wire: ChatMessageWire): ChatMessage {
  const result: ChatMessage = {
    id: wire.id,
    conversationId: wire.conversationId,
    senderId: wire.senderId,
    body: wire.body,
    attachments: wire.attachments,
    createdAt: wire.createdAt,
    editedAt: wire.editedAt,
    deletedAt: wire.deletedAt,
  };
  if (wire.replyToId !== undefined) result.replyToId = wire.replyToId;
  if (wire.clientKey !== undefined) result.clientKey = wire.clientKey;
  if (wire.senderName !== undefined) result.senderName = wire.senderName;
  if (wire.senderAvatarUrl !== undefined) result.senderAvatarUrl = wire.senderAvatarUrl;
  if (wire.senderIsAgent !== undefined) result.senderIsAgent = wire.senderIsAgent;
  if (wire.pending !== undefined) result.pending = wire.pending;
  return result;
}

export const TableConversationEnsureResponseSchema = z
  .object({
    conversation: z
      .object({
        id: z.string(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type TableConversationEnsureResponseWire = z.infer<
  typeof TableConversationEnsureResponseSchema
>;

export const ConversationMessagesEnvelopeSchema = z
  .object({
    messages: z.array(z.unknown()).optional().default([]),
    nextCursor: z.string().nullable().optional(),
    viewerId: z.string().nullable().optional(),
  })
  .passthrough();

export const ConversationMessagesResponseSchema = z
  .object({
    messages: z.array(ChatMessageSchema).optional().default([]),
    nextCursor: z.string().nullable().optional(),
    viewerId: z.string().nullable().optional(),
  })
  .passthrough();

export type ConversationMessagesResponseWire = z.infer<
  typeof ConversationMessagesResponseSchema
>;

export const SendMessageResponseSchema = z
  .object({
    message: ChatMessageSchema.optional(),
    replay: z.boolean().optional(),
  })
  .passthrough();

export type SendMessageResponseWire = z.infer<typeof SendMessageResponseSchema>;

export const MessageReportReasonSchema = z.enum([
  "spam",
  "harassment",
  "inappropriate",
  "other",
]);

export const MessageReportStatusSchema = z.enum([
  "open",
  "reviewed",
  "dismissed",
  "actioned",
]);

export const MessageReportSchema = z
  .object({
    id: z.string(),
    messageId: z.string(),
    conversationId: z.string(),
    reporterId: z.string(),
    reason: MessageReportReasonSchema,
    detail: z.string().optional(),
    status: MessageReportStatusSchema,
    createdAt: z.string(),
    resolvedAt: z.string().nullable().optional().default(null),
    resolvedBy: z.string().nullable().optional().default(null),
    messageBody: z.string().optional(),
    messageSenderId: z.string().optional(),
    messageHidden: z.boolean().optional(),
    conversationKind: z.enum(["table", "dm", "circle"]).optional(),
  })
  .passthrough();

export type MessageReportWire = z.infer<typeof MessageReportSchema>;
