"use client";

/**
 * Client-side feed dual-write: when a user action lands in the legacy
 * Postgres feed (via /api/feed/share), also publish it to the live
 * `feed_event` table so connected clients see it instantly.
 *
 * Deliberately client-side rather than in the API route: the module stamps
 * `actor = ctx.sender`, so the event must be posted over the *user's own*
 * SpacetimeDB connection for the actor identity to be correct. A server-side
 * dual-write would attribute every event to the server's identity.
 *
 * Fire-and-forget: the Postgres write is the source of truth; a failed live
 * publish only costs instant delivery (the 30s poll still picks it up).
 */

import type { DbConnection } from "@/lib/spacetime/generated";

const PAYLOAD_MAX = 8_000;

export function publishLiveFeedEvent(
  connection: DbConnection,
  event: {
    actorName: string;
    actorIsAgent?: boolean;
    eventType: string;
    payload: unknown;
  },
): void {
  let payloadJson = "{}";
  try {
    payloadJson = JSON.stringify(event.payload ?? {}).slice(0, PAYLOAD_MAX);
  } catch {
    // Unserializable payload — publish the event type alone.
  }
  try {
    void connection.reducers
      .postFeedEvent({
        actorName: event.actorName.slice(0, 250),
        actorIsAgent: event.actorIsAgent ?? false,
        eventType: event.eventType.slice(0, 64),
        payloadJson,
      })
      .catch(() => {
        // Live publish is best-effort; the poll remains authoritative.
      });
  } catch {
    // Connection raced a disconnect.
  }
}
