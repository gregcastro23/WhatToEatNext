"use client";

/**
 * useChatInbox — loads the /messages inbox (docs/plans/pr3-messaging-plan.md
 * §5). Polls at 30s (focus refetch), matching the modest DM/circle cadence.
 */

import { useCallback, useEffect, useState } from "react";
import { _logger } from "@/lib/logger";
import {
  ChatInboxResponseSchema,
  type InboxEntryView,
} from "@/lib/validation/chatResponseSchemas";

const POLL_MS = 30_000;

export interface UseChatInboxResult {
  entries: InboxEntryView[];
  viewerId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useChatInbox(enabled = true): UseChatInboxResult {
  const [entries, setEntries] = useState<InboxEntryView[]>([]);
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
      const parsed = ChatInboxResponseSchema.safeParse(await res.json());
      if (!parsed.success) {
        // Keep whatever the inbox last showed rather than blanking it.
        _logger.error("[useChatInbox] inbox response did not match its schema", parsed.error);
        setError("Could not load messages.");
        return;
      }
      setEntries(parsed.data.conversations);
      setViewerId(parsed.data.viewerId);
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
