"use client";

/**
 * useChatInbox — loads the /messages inbox (docs/plans/pr3-messaging-plan.md
 * §5). Polls at 30s (focus refetch), matching the modest DM/circle cadence.
 */

import { useCallback, useEffect, useState } from "react";
import type { InboxEntry } from "@/types/chat";

const POLL_MS = 30_000;

export interface UseChatInboxResult {
  entries: InboxEntry[];
  viewerId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useChatInbox(enabled = true): UseChatInboxResult {
  const [entries, setEntries] = useState<InboxEntry[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/chat/conversations", { credentials: "include" });
      if (!res.ok) {
        setError(res.status === 401 ? "Sign in to see your messages." : "Could not load messages.");
        return;
      }
      const data = (await res.json()) as { conversations?: InboxEntry[]; viewerId?: string | null };
      setEntries(data.conversations ?? []);
      setViewerId(data.viewerId ?? null);
      setError(null);
    } catch {
      setError("Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => void load(), POLL_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, load]);

  return { entries, viewerId, loading, error, refetch: load };
}
