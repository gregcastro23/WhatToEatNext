"use client";

/**
 * useConversation — DM/circle message thread over adaptive Postgres polling
 * (docs/plans/pr3-messaging-plan.md §5). NO SpacetimeDB: DM/circle bodies must
 * never touch the world-readable live tables, so these threads are Postgres-
 * only. Poll cadence: 5s focused, 30s blurred, paused while hidden.
 *
 * Exposes keyset load-earlier and an optimistic clientKey send.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import { readJson, parseEach } from "@/lib/api/json";
import {
  ConversationMessagesEnvelopeSchema,
  ChatMessageSchema,
  toDomainChatMessage,
  SendMessageResponseSchema,
} from "@/lib/validation/chatResponseSchemas";
import { clientLogger } from "@/utils/clientLogger";

const FOCUSED_MS = 5_000;
const BLURRED_MS = 30_000;

export interface UseConversationResult {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  /** The viewer's DB user id, resolved from the messages endpoint. */
  viewerId: string | null;
  loadEarlier: () => Promise<void>;
  send: (body: string, opts?: { attachmentDataUrl?: string; replyToId?: string }) => Promise<boolean>;
  markRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useConversation(
  conversationId: string | null | undefined,
  opts?: { enabled?: boolean; viewerId?: string | null },
): UseConversationResult {
  const enabled = (opts?.enabled ?? true) && !!conversationId;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(opts?.viewerId ?? null);

  const seenIds = useRef<Set<string>>(new Set());

  const fetchLatest = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages?limit=50`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 403) setError("This conversation is not available.");
        return;
      }
      const envelope = await readJson(res, {
        parse: (x) => ConversationMessagesEnvelopeSchema.parse(x),
      });
      const parsed = parseEach(envelope.messages, (m) =>
        toDomainChatMessage(ChatMessageSchema.parse(m)),
      );
      const ordered = parsed.items.slice().reverse(); // oldest-first
      seenIds.current = new Set(ordered.map((m) => m.id));
      setMessages(ordered);
      setNextCursor(envelope.nextCursor ?? null);
      if (envelope.viewerId) setViewerId(envelope.viewerId);
      setError(null);
    } catch {
      // keep last good window
    }
  }, [conversationId]);

  const refetch = useCallback(async () => {
    await fetchLatest();
  }, [fetchLatest]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    // Named, not an inline IIFE: TypeScript does not reset narrowing across an
    // IIFE, so `cancelled` would read as literal `false` and every unmount guard
    // below would be reported as dead code. Do not inline.
    async function load(): Promise<void> {
      await fetchLatest();
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchLatest]);

  // Adaptive polling: 5s focused, 30s blurred, paused hidden.
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        schedule(BLURRED_MS);
        return;
      }
      void fetchLatest();
      schedule(document.hasFocus() ? FOCUSED_MS : BLURRED_MS);
    };
    const schedule = (ms: number) => {
      timer = setTimeout(tick, ms);
    };

    schedule(document.hasFocus() ? FOCUSED_MS : BLURRED_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void fetchLatest();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, fetchLatest]);

  const loadEarlier = useCallback(async () => {
    if (!conversationId || !nextCursor) return;
    try {
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?limit=50&before=${encodeURIComponent(nextCursor)}`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const envelope = await readJson(res, {
        parse: (x) => ConversationMessagesEnvelopeSchema.parse(x),
      });
      const parsed = parseEach(envelope.messages, (m) =>
        toDomainChatMessage(ChatMessageSchema.parse(m)),
      );
      const older = parsed.items.slice().reverse();
      const fresh = older.filter((m) => !seenIds.current.has(m.id));
      fresh.forEach((m) => seenIds.current.add(m.id));
      setMessages((prev) => [...fresh, ...prev]);
      setNextCursor(envelope.nextCursor ?? null);
    } catch {
      // ignore
    }
  }, [conversationId, nextCursor]);

  const send = useCallback(
    async (
      body: string,
      sendOpts?: { attachmentDataUrl?: string; replyToId?: string },
    ): Promise<boolean> => {
      if (!conversationId) return false;
      const clientKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ body, clientKey, ...sendOpts }),
        });
        if (!res.ok) return false;
        try {
          const data = await readJson(res, {
            parse: (x) => SendMessageResponseSchema.parse(x),
          });
          if (data.message) {
            const domainMsg = toDomainChatMessage(data.message);
            if (!seenIds.current.has(domainMsg.id)) {
              seenIds.current.add(domainMsg.id);
              setMessages((prev) => [...prev, domainMsg]);
            }
          }
        } catch (parseErr) {
          clientLogger.warn("useConversation", "Message send succeeded (200 OK) but response body failed parse, refetching canonical state:", parseErr);
          fetchLatest().catch(() => {});
        }
        return true;
      } catch {
        return false;
      }
    },
    [conversationId, fetchLatest],
  );

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await fetch(`/api/chat/conversations/${conversationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
    } catch {
      // best-effort
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    hasMore: !!nextCursor,
    viewerId,
    loadEarlier,
    send,
    markRead,
    refetch,
  };
}
