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

const FOCUSED_MS = 5_000;
const BLURRED_MS = 30_000;

interface MessagesResponse {
  messages?: ChatMessage[];
  nextCursor?: string | null;
  viewerId?: string | null;
}

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
      const data = (await res.json()) as MessagesResponse;
      const ordered = (data.messages ?? []).slice().reverse(); // oldest-first
      seenIds.current = new Set(ordered.map((m) => m.id));
      setMessages(ordered);
      setNextCursor(data.nextCursor ?? null);
      if (data.viewerId) setViewerId(data.viewerId);
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
    void (async () => {
      await fetchLatest();
      if (!cancelled) setLoading(false);
    })();
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
      const data = (await res.json()) as MessagesResponse;
      const older = (data.messages ?? []).slice().reverse();
      const fresh = older.filter((m) => !seenIds.current.has(m.id));
      fresh.forEach((m) => seenIds.current.add(m.id));
      setMessages((prev) => [...fresh, ...prev]);
      setNextCursor(data.nextCursor ?? null);
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
        const data = (await res.json()) as { message?: ChatMessage };
        if (data.message && !seenIds.current.has(data.message.id)) {
          seenIds.current.add(data.message.id);
          setMessages((prev) => [...prev, data.message!]);
        }
        return true;
      } catch {
        return false;
      }
    },
    [conversationId],
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
