import { z } from "zod";
import type { ChatMessage } from "@/types/chat";

export const ChatAttachmentSchema = z
  .object({
    type: z.literal("photo"),
    url: z.string(),
  })
  .passthrough();

export const ChatMessageSchema: z.ZodType<ChatMessage> = z
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
  });

export type ChatMessageWire = ChatMessage;

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

export const ConversationMessagesResponseSchema = z
  .object({
    messages: z.array(ChatMessageSchema).optional(),
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
