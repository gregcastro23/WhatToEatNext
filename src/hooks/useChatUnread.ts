"use client";

/**
 * useChatUnread — the nav badge count (docs/plans/pr3-messaging-plan.md §5/§6).
 * Aggregates unread across ALL conversation kinds via /api/chat/unread (table
 * chat included — it emits no notification rows, so this endpoint is its only
 * unread source). Refetches at 30s, on focus, and on a chat:refresh event so a
 * send/read updates the badge promptly. useNotifications (60s) is untouched.
 */

import { useCallback, useEffect, useState } from "react";

const CHAT_UNREAD_REFRESH_EVENT = "chat:unread:refresh";
const POLL_MS = 30_000;

export interface UseChatUnreadResult {
  total: number;
  byConversation: Record<string, number>;
  refetch: () => Promise<void>;
}

export function notifyChatUnreadRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHAT_UNREAD_REFRESH_EVENT));
  }
}

export function useChatUnread(enabled = true): UseChatUnreadResult {
  const [total, setTotal] = useState(0);
  const [byConversation, setByConversation] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/chat/unread", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { total?: number; byConversation?: Record<string, number> };
      setTotal(data.total ?? 0);
      setByConversation(data.byConversation ?? {});
    } catch {
      // leave last good value
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const interval = setInterval(() => void load(), POLL_MS);
    const onFocus = () => void load();
    const onRefresh = () => void load();
    window.addEventListener("focus", onFocus);
    window.addEventListener(CHAT_UNREAD_REFRESH_EVENT, onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(CHAT_UNREAD_REFRESH_EVENT, onRefresh);
    };
  }, [enabled, load]);

  return { total, byConversation, refetch: load };
}
