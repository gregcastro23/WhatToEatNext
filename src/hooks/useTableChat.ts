"use client";

/**
 * useTableChat — the live Table discussion (docs/plans/pr3-messaging-plan.md
 * §5). Postgres is canonical; SpacetimeDB `table_chat_message` is a live
 * mirror keyed by the table UUID.
 *
 * Delivery:
 * - On entry, POST /api/chat/conversations {kind:'table', tableId} ensures the
 *   conversation and heals a late-joiner's membership, then GET pulls the
 *   canonical window.
 * - When NEXT_PUBLIC_SPACETIME_LIVE_TABLE_CHAT is on and connected, subscribe
 *   to the table's chat rows and merge them by message_uuid; reconcile against
 *   a canonical refetch on mount + every 20s; drop unmatched live rows older
 *   than 30s.
 * - When the flag is off or disconnected, a 10s canonical poll is the delivery
 *   path — table chat always works.
 *
 * SAFETY: the Spacetime publish (publishLiveTableChatMessage) is called ONLY
 * here for kind='table'; DM/circle surfaces never touch it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLiveTableChatEnabled } from "@/lib/spacetime/config";
import {
  publishLiveTableChatDelete,
  publishLiveTableChatMessage,
} from "@/lib/spacetime/liveTableChatPublish";
import type { ChatMessage } from "@/types/chat";

const CANONICAL_RECONCILE_MS = 20_000;
const POLL_FALLBACK_MS = 10_000;
const UNMATCHED_LIVE_TTL_MS = 30_000;

export type ChatConnectionMode = "live" | "polling";

interface LiveRow {
  messageUuid: string;
  senderName: string;
  body: string;
  createdAtMs: number;
  deleted: boolean;
  /** When this client first saw the live row (for the unmatched-TTL drop). */
  seenAtMs: number;
}

export interface UseTableChatResult {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  conversationId: string | null;
  connectionMode: ChatConnectionMode;
  canSend: boolean;
  send: (body: string, opts?: { attachmentDataUrl?: string; replyToId?: string }) => Promise<boolean>;
  remove: (messageId: string) => Promise<boolean>;
  hostMute: (userId: string, minutes?: number) => Promise<boolean>;
  hostUnmute: (userId: string) => Promise<boolean>;
  hostKick: (userId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

function sqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

export function useTableChat(
  tableId: string | null | undefined,
  opts: { enabled: boolean; viewerId: string | null },
): UseTableChatResult {
  const { enabled, viewerId } = opts;
  const spacetimeEnabled = isLiveTableChatEnabled();
  const { connection, status } = useSpacetime();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [canonical, setCanonical] = useState<ChatMessage[]>([]);
  const [liveRows, setLiveRows] = useState<LiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const conversationIdRef = useRef<string | null>(null);
  conversationIdRef.current = conversationId;

  const live = spacetimeEnabled && status === "connected" && applied && !!connection;
  const connectionMode: ChatConnectionMode = live ? "live" : "polling";

  // ── Ensure conversation + heal membership, then load canonical ──────
  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (!tableId) return null;
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind: "table", tableId }),
      });
      if (!res.ok) {
        setError("This table's discussion isn't available.");
        return null;
      }
      const data = (await res.json()) as { conversation?: { id: string } };
      const id = data.conversation?.id ?? null;
      setConversationId(id);
      return id;
    } catch {
      setError("This table's discussion isn't available.");
      return null;
    }
  }, [tableId]);

  const fetchCanonical = useCallback(async (convId: string): Promise<void> => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages?limit=100`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: ChatMessage[] };
      // API returns newest-first; store oldest-first for display.
      const ordered = (data.messages ?? []).slice().reverse();
      setCanonical(ordered);
      setError(null);
    } catch {
      // Keep the last good window on a transient error.
    }
  }, []);

  const refetch = useCallback(async () => {
    const id = conversationIdRef.current;
    if (id) await fetchCanonical(id);
  }, [fetchCanonical]);

  useEffect(() => {
    if (!enabled || !tableId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const id = await ensureConversation();
      if (cancelled || !id) {
        setLoading(false);
        return;
      }
      await fetchCanonical(id);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, tableId, ensureConversation, fetchCanonical]);

  // ── Canonical reconcile every 20s (both modes) ──────────────────────
  useEffect(() => {
    if (!enabled || !conversationId) return;
    const interval = setInterval(() => void fetchCanonical(conversationId), CANONICAL_RECONCILE_MS);
    return () => clearInterval(interval);
  }, [enabled, conversationId, fetchCanonical]);

  // ── Polling fallback (10s) when NOT live ────────────────────────────
  useEffect(() => {
    if (!enabled || !conversationId || live) return;
    const interval = setInterval(() => void fetchCanonical(conversationId), POLL_FALLBACK_MS);
    return () => clearInterval(interval);
  }, [enabled, conversationId, live, fetchCanonical]);

  // ── Spacetime subscription for this table's chat rows ───────────────
  useEffect(() => {
    if (!enabled || !spacetimeEnabled || status !== "connected" || !connection || !tableId) {
      setApplied(false);
      setLiveRows([]);
      return;
    }

    const refresh = () => {
      try {
        const rows = [...connection.db.table_chat_message.iter()] as Array<{
          wtenTableId: string;
          messageUuid: string;
          senderName: string;
          body: string;
          createdAt: { toDate: () => Date };
          deleted: boolean;
        }>;
        const now = Date.now();
        setLiveRows((prev) => {
          const seen = new Map(prev.map((r) => [r.messageUuid, r.seenAtMs]));
          return rows
            .filter((r) => r.wtenTableId === tableId)
            .map((r) => ({
              messageUuid: r.messageUuid,
              senderName: r.senderName,
              body: r.body,
              createdAtMs: r.createdAt.toDate().getTime(),
              deleted: r.deleted,
              seenAtMs: seen.get(r.messageUuid) ?? now,
            }));
        });
      } catch {
        // Raced a disconnect.
      }
    };

    const escaped = sqlLiteral(tableId);
    const subscription = connection
      .subscriptionBuilder()
      .onApplied(() => {
        setApplied(true);
        refresh();
      })
      .subscribe([`SELECT * FROM table_chat_message WHERE wten_table_id = '${escaped}'`]);

    connection.db.table_chat_message.onInsert(refresh);
    connection.db.table_chat_message.onUpdate(refresh);
    connection.db.table_chat_message.onDelete(refresh);

    return () => {
      setApplied(false);
      try {
        connection.db.table_chat_message.removeOnInsert(refresh);
        connection.db.table_chat_message.removeOnUpdate(refresh);
        connection.db.table_chat_message.removeOnDelete(refresh);
        subscription.unsubscribe();
      } catch {
        // Connection already torn down.
      }
    };
  }, [enabled, spacetimeEnabled, status, connection, tableId]);

  // ── Merge canonical + unmatched live rows (by message_uuid) ─────────
  const messages = useMemo<ChatMessage[]>(() => {
    const canonicalIds = new Set(canonical.map((m) => m.id));
    const now = Date.now();
    const extras: ChatMessage[] = liveRows
      .filter(
        (r) =>
          !canonicalIds.has(r.messageUuid) &&
          !r.deleted &&
          now - r.seenAtMs < UNMATCHED_LIVE_TTL_MS,
      )
      .map(
        (r): ChatMessage => ({
          id: r.messageUuid,
          conversationId: conversationId ?? "",
          senderId: "",
          body: r.body,
          attachments: [],
          createdAt: new Date(r.createdAtMs).toISOString(),
          editedAt: null,
          deletedAt: null,
          senderName: r.senderName,
          pending: true,
        }),
      );
    return [...canonical, ...extras].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [canonical, liveRows, conversationId]);

  // ── Actions ─────────────────────────────────────────────────────────
  const send = useCallback(
    async (
      body: string,
      sendOpts?: { attachmentDataUrl?: string; replyToId?: string },
    ): Promise<boolean> => {
      const id = conversationIdRef.current;
      if (!id) return false;
      const clientKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const res = await fetch(`/api/chat/conversations/${id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            body,
            clientKey,
            replyToId: sendOpts?.replyToId,
            attachmentDataUrl: sendOpts?.attachmentDataUrl,
          }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { message?: ChatMessage; replay?: boolean };
        const message = data.message;
        if (message) {
          // Optimistically show it, then let the canonical refetch confirm.
          setCanonical((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message],
          );
          // Mirror to Spacetime ONLY for table chat, ONLY after PG 200.
          if (!data.replay && live && connection && tableId) {
            publishLiveTableChatMessage(connection, {
              wtenTableId: tableId,
              messageUuid: message.id,
              body: message.body,
              replyToUuid: message.replyToId,
            });
          }
        }
        void refetch();
        return true;
      } catch {
        return false;
      }
    },
    [live, connection, tableId, refetch],
  );

  const remove = useCallback(
    async (messageId: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/chat/messages/${messageId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) return false;
        setCanonical((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, body: "", deletedAt: new Date().toISOString(), attachments: [] } : m)),
        );
        void refetch();
        return true;
      } catch {
        return false;
      }
    },
    [refetch],
  );

  const moderate = useCallback(
    async (payload: Record<string, unknown>): Promise<boolean> => {
      const id = conversationIdRef.current;
      if (!id) return false;
      try {
        const res = await fetch(`/api/chat/conversations/${id}/moderate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [],
  );

  const hostMute = useCallback(
    (userId: string, minutes?: number) => moderate({ action: "mute", userId, minutes: minutes ?? 60 }),
    [moderate],
  );
  const hostUnmute = useCallback(
    (userId: string) => moderate({ action: "unmute", userId }),
    [moderate],
  );
  const hostKick = useCallback(
    async (userId: string) => {
      const ok = await moderate({ action: "kick", userId });
      // Best-effort live kick over Spacetime handled by the host's own client
      // if it holds the identity; the Postgres kick is authoritative regardless.
      return ok;
    },
    [moderate],
  );

  // Reference the live delete publisher so lint/tree-shaking keep it wired for
  // the host-delete path (canonical delete already mirrors via reconcile).
  void publishLiveTableChatDelete;

  return {
    messages,
    loading,
    error,
    conversationId,
    connectionMode,
    canSend: !!conversationId && !!viewerId,
    send,
    remove,
    hostMute,
    hostUnmute,
    hostKick,
    refetch,
  };
}
