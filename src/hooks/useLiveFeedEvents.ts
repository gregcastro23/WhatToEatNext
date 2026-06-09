"use client";

/**
 * useLiveFeedEvents — real-time community feed via the SpacetimeDB
 * `feed_event` table (gated by NEXT_PUBLIC_SPACETIME_LIVE_FEED).
 *
 * NOTE on the "hardened polling over SSE" house rule: this repo prefers
 * polling because long-lived connections terminated *by our Vercel
 * serverless functions* get killed at the platform layer. SpacetimeDB
 * WebSockets are the sanctioned exception — the socket connects directly
 * from the browser to the SpacetimeDB instance (Maincloud/self-hosted),
 * no serverless function holds it open, so serverless timeouts don't
 * apply. The 30s HTTP poll remains in place as the degraded fallback.
 *
 * Returns `null` when not live (flag off / disconnected) so callers can
 * distinguish "no live layer" from "live layer with zero events".
 */

import { track } from "@vercel/analytics";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLiveFeedEnabled } from "@/lib/spacetime/config";
import type { FeedEvent as StdbFeedEventRow } from "@/lib/spacetime/generated/types";

export interface LiveFeedEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorIsAgent: boolean;
  eventType: string;
  metadataPayload: unknown;
  createdAt: string;
}

const MAX_EVENTS = 60;

function mapRow(row: StdbFeedEventRow): LiveFeedEvent {
  let payload: unknown = {};
  try {
    payload = row.payloadJson ? JSON.parse(row.payloadJson) : {};
  } catch {
    payload = { raw: row.payloadJson };
  }
  return {
    id: `stdb-${row.eventId}`,
    actorId: row.actor.toHexString(),
    actorName: row.actorName || "Anonymous Alchemist",
    actorIsAgent: row.actorIsAgent,
    eventType: row.eventType,
    metadataPayload: payload,
    createdAt: row.createdAt.toDate().toISOString(),
  };
}

export function useLiveFeedEvents(): LiveFeedEvent[] | null {
  const enabled = isLiveFeedEnabled();
  const { connection, status } = useSpacetime();
  const [rows, setRows] = useState<StdbFeedEventRow[] | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || status !== "connected" || !connection) {
      setRows(null);
      return;
    }

    const refresh = () => {
      try {
        setRows([...connection.db.feed_event.iter()]);
      } catch {
        // Raced a disconnect; the status change clears state.
      }
    };

    const subscription = connection
      .subscriptionBuilder()
      .onApplied(() => {
        refresh();
        if (!trackedRef.current) {
          trackedRef.current = true;
          track("spacetime_feed_live_attached");
        }
      })
      .subscribe(["SELECT * FROM feed_event"]);

    connection.db.feed_event.onInsert(refresh);
    connection.db.feed_event.onDelete(refresh);

    return () => {
      setRows(null);
      try {
        connection.db.feed_event.removeOnInsert(refresh);
        connection.db.feed_event.removeOnDelete(refresh);
        subscription.unsubscribe();
      } catch {
        // Connection already torn down.
      }
    };
  }, [enabled, status, connection]);

  return useMemo(() => {
    if (rows === null) return null;
    return rows
      .map(mapRow)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, MAX_EVENTS);
  }, [rows]);
}
