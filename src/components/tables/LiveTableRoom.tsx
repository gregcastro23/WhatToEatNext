"use client";

/**
 * LiveTableRoom — real-time PRESENCE for a live table over SpacetimeDB,
 * gated by NEXT_PUBLIC_SPACETIME_LIVE_TABLES (pattern: LiveCommensalLobby).
 *
 * Presence only — NO chat. Table chat ships in PR 3 on its Postgres
 * conversations model (docs/plans/tables-program-sequencing.md
 * Reconciliation 1); this component renders the expected-vs-present member
 * list: the authoritative roster comes from Postgres (props.members), the
 * `table_presence` rows only light up who's here now. The client-claimed
 * `wten_user_id` on a presence row is a display hint matched against the
 * Postgres list — never authoritative.
 *
 * Graceful degradation: when the flag is off or the connection isn't live,
 * this renders nothing and the live phase works fine without presence.
 *
 * Reducer choreography (plan §2/§7): the HOST calls the idempotent
 * `ensure_table_session` on entry; guests call `join_table_session` once the
 * session row is visible; everyone `leave_table_session` on exit (a host
 * leaving does NOT close); when the Postgres close lands (status prop flips
 * away from 'live'), the module-side host fires a best-effort
 * `close_table_session` — the authoritative close already happened in
 * Postgres either way.
 */

import { useEffect, useRef, useState } from "react";
import { GlassPanel, LabelXS, PresenceAvatar } from "@/components/tables/ui";
import type { Element } from "@/components/tables/ui/elements";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLiveTablesEnabled } from "@/lib/spacetime/config";
import type {
  TablePresence as PresenceRow,
  TableSession as SessionRow,
} from "@/lib/spacetime/generated/types";
import type { TableMember, TableStatus } from "@/types/table";
import type { JSX } from "react";

export interface LiveTableRoomProps {
  tableId: string;
  tableTitle: string;
  /** Postgres lifecycle status — the authoritative signal. The room only
   * shows for 'live'; a transition live -> memory triggers the module-side
   * best-effort close. */
  tableStatus: TableStatus;
  /** Authoritative roster from Postgres (joined members expected at the table). */
  members: TableMember[];
  viewerId: string | null;
  isHost: boolean;
  className?: string;
}

const SESSION_CLOSED = 2;

/** Single-quote-escape for the subscription SQL literal (the id is our own
 * DB UUID, but never interpolate unescaped). */
function sqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

export function LiveTableRoom({
  tableId,
  tableTitle,
  tableStatus,
  members,
  viewerId,
  isHost,
  className = "",
}: LiveTableRoomProps): JSX.Element | null {
  const enabled = isLiveTablesEnabled();
  const { connection, status, identityHex } = useSpacetime();

  const [session, setSession] = useState<SessionRow | null>(null);
  const [presence, setPresence] = useState<PresenceRow[]>([]);
  const [applied, setApplied] = useState(false);
  const joinedRef = useRef(false);
  const prevStatusRef = useRef<TableStatus>(tableStatus);

  const selfMember = viewerId
    ? members.find((m) => m.userId === viewerId)
    : undefined;
  const displayName = selfMember?.name || selfMember?.displayName || "Anonymous Alchemist";
  const live = tableStatus === "live";

  // ── Subscription: this table's session + presence rows only ─────────
  useEffect(() => {
    if (!enabled || !live || status !== "connected" || !connection) {
      setApplied(false);
      setSession(null);
      setPresence([]);
      return;
    }

    const refresh = () => {
      try {
        const sessions = [...connection.db.table_session.iter()] as SessionRow[];
        setSession(sessions.find((s) => s.wtenTableId === tableId) ?? null);
        setPresence(
          ([...connection.db.table_presence.iter()] as PresenceRow[]).filter(
            (p) => p.wtenTableId === tableId,
          ),
        );
      } catch {
        // Raced a disconnect; the status change clears state.
      }
    };

    const escaped = sqlLiteral(tableId);
    const subscription = connection
      .subscriptionBuilder()
      .onApplied(() => {
        setApplied(true);
        refresh();
      })
      .subscribe([
        `SELECT * FROM table_session WHERE wten_table_id = '${escaped}'`,
        `SELECT * FROM table_presence WHERE wten_table_id = '${escaped}'`,
      ]);

    connection.db.table_session.onInsert(refresh);
    connection.db.table_session.onUpdate(refresh);
    connection.db.table_session.onDelete(refresh);
    connection.db.table_presence.onInsert(refresh);
    connection.db.table_presence.onDelete(refresh);

    return () => {
      setApplied(false);
      try {
        connection.db.table_session.removeOnInsert(refresh);
        connection.db.table_session.removeOnUpdate(refresh);
        connection.db.table_session.removeOnDelete(refresh);
        connection.db.table_presence.removeOnInsert(refresh);
        connection.db.table_presence.removeOnDelete(refresh);
        subscription.unsubscribe();
      } catch {
        // Connection already torn down.
      }
    };
  }, [enabled, live, status, connection, tableId]);

  // ── Enter: host ensures (idempotent); guests join once the session shows ──
  useEffect(() => {
    if (!enabled || !live || status !== "connected" || !connection || !applied) return;
    if (joinedRef.current) return;

    if (isHost) {
      joinedRef.current = true;
      void connection.reducers
        .ensureTableSession({
          wtenTableId: tableId,
          title: tableTitle,
          wtenUserId: viewerId ?? "",
          displayName,
        })
        .catch((error: unknown) =>
          console.warn("[tables] ensure session failed:", error),
        );
      return;
    }

    if (session && session.status !== SESSION_CLOSED) {
      joinedRef.current = true;
      void connection.reducers
        .joinTableSession({
          wtenTableId: tableId,
          wtenUserId: viewerId ?? "",
          displayName,
        })
        .catch((error: unknown) => console.warn("[tables] join failed:", error));
    }
  }, [
    enabled,
    live,
    status,
    connection,
    applied,
    session,
    isHost,
    tableId,
    tableTitle,
    viewerId,
    displayName,
  ]);

  // ── Exit: leave presence (host leaving does NOT close the session) ──
  useEffect(() => {
    if (!enabled || status !== "connected" || !connection) return;
    return () => {
      if (joinedRef.current) {
        joinedRef.current = false;
        try {
          void connection.reducers
            .leaveTableSession({ wtenTableId: tableId })
            .catch(() => {});
        } catch {
          // Connection already gone — presence row goes stale, harmless.
        }
      }
    };
  }, [enabled, status, connection, tableId]);

  // ── Postgres close landed → module-side host best-effort close ──────
  useEffect(() => {
    const wasLive = prevStatusRef.current === "live";
    prevStatusRef.current = tableStatus;
    if (!wasLive || tableStatus !== "memory") return;
    if (!enabled || status !== "connected" || !connection) return;
    const isModuleHost =
      identityHex !== null && session?.host.toHexString() === identityHex;
    if (!isModuleHost) return;
    try {
      void connection.reducers
        .closeTableSession({ wtenTableId: tableId })
        .catch(() => {});
    } catch {
      // Best-effort by design — the authoritative close already happened.
    }
  }, [tableStatus, enabled, status, connection, identityHex, session, tableId]);

  if (!enabled || !live || status !== "connected" || !applied || !connection) {
    return null;
  }

  // ── Expected vs present ──────────────────────────────────────────────
  const presentUserIds = new Set(
    presence.map((p) => p.wtenUserId).filter((id) => id.length > 0),
  );
  const expected = members.filter((m) => m.rsvpStatus === "joined");
  const ELEMENT_CYCLE: Element[] = ["Fire", "Water", "Earth", "Air"];
  const hereCount = expected.filter((m) => m.userId && presentUserIds.has(m.userId)).length;
  // Presence rows with no matching Postgres member (e.g. a manual guest's
  // device, or an unrecognized hint) still count as "at the table".
  const unmatched = presence.filter(
    (p) => !p.wtenUserId || !expected.some((m) => m.userId === p.wtenUserId),
  );

  return (
    <GlassPanel className={`p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alchm-violet opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-alchm-violet" />
          </span>
          <LabelXS className="text-alchm-violet-bright">At the Table</LabelXS>
        </span>
        <LabelXS className="text-alchm-fg-dim">
          {hereCount + unmatched.length} here · {expected.length} expected
        </LabelXS>
      </div>

      <ul className="flex flex-wrap gap-4">
        {expected.map((member, index) => {
          const here = !!member.userId && presentUserIds.has(member.userId);
          const name = member.name || member.displayName || "Guest";
          return (
            <li key={member.id} className="flex flex-col items-center gap-1.5">
              <PresenceAvatar
                name={name}
                src={member.avatarUrl}
                element={ELEMENT_CYCLE[index % ELEMENT_CYCLE.length]}
                size={48}
                online={here}
                live={here && member.role === "host"}
              />
              <LabelXS className={here ? "text-alchm-fg" : "text-alchm-fg-mute"}>
                {name.split(" ")[0]}
              </LabelXS>
            </li>
          );
        })}
        {unmatched.map((row) => (
          <li key={row.rowId.toString()} className="flex flex-col items-center gap-1.5">
            <PresenceAvatar
              name={row.displayName || "Guest"}
              element="Air"
              size={48}
              online
            />
            <LabelXS className="text-alchm-fg">
              {(row.displayName || "Guest").split(" ")[0]}
            </LabelXS>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}

export default LiveTableRoom;
