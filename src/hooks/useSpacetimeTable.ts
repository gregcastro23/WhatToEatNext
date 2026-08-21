"use client";

/**
 * useSpacetimeTable — Real-time collaborative dinner table hook over SpacetimeDB.
 *
 * Provides live synchronization for:
 * 1. Guest presence (`table_presence`)
 * 2. Collaborative menu item consensus voting (`table_meal_vote`)
 * 3. Active viewing / focus cursor presence (`table_cursor_presence`)
 *
 * Gated by `isLiveTablesEnabled()`. Degrades gracefully to inert state when
 * disconnected or flag is disabled.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLiveTablesEnabled } from "@/lib/spacetime/config";
import type {
  TableCursorPresence as CursorRow,
  TableMealVote as VoteRow,
  TablePresence as PresenceRow,
  TableSession as SessionRow,
} from "@/lib/spacetime/generated/types";

export interface RecipeVoteSummary {
  recipeRef: string;
  recipeName: string;
  totalScore: number;
  upvotes: number;
  downvotes: number;
  voters: Array<{
    name: string;
    score: number;
    memberHex: string;
  }>;
  viewerVote: number; // -1, 0, or 1
}

export interface SlotCursorSummary {
  slotRef: string;
  activeGuests: Array<{
    memberHex: string;
    displayName: string;
    colorHex: string;
    updatedAtMs: number;
  }>;
}

export interface UseSpacetimeTableResult {
  live: boolean;
  session: SessionRow | null;
  presence: PresenceRow[];
  votes: VoteRow[];
  cursors: CursorRow[];
  votesByRecipeRef: Record<string, RecipeVoteSummary>;
  cursorsBySlotRef: Record<string, SlotCursorSummary>;
  viewerHex: string | null;
  voteMeal: (recipeRef: string, recipeName: string, voteScore: number) => Promise<boolean>;
  setCursor: (slotRef: string, colorHex?: string) => Promise<boolean>;
  clearCursor: () => Promise<boolean>;
}

function sqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

const DEFAULT_CURSOR_COLORS = [
  "#F59E0B", // Amber / Spirit
  "#3B82F6", // Blue / Essence
  "#10B981", // Emerald / Matter
  "#EC4899", // Pink / Air
  "#8B5CF6", // Purple / Alchemical
  "#06B6D4", // Cyan / Water
];

function pickColorForIdentity(identityHex: string): string {
  let hash = 0;
  for (let i = 0; i < identityHex.length; i++) {
    hash = (hash << 5) - hash + identityHex.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % DEFAULT_CURSOR_COLORS.length;
  return DEFAULT_CURSOR_COLORS[idx];
}

export function useSpacetimeTable(
  tableId: string | null | undefined,
  _opts?: {
    viewerId?: string | null;
    displayName?: string;
  },
): UseSpacetimeTableResult {

  const enabled = isLiveTablesEnabled();
  const { connection, status, identityHex } = useSpacetime();

  const [session, setSession] = useState<SessionRow | null>(null);
  const [presence, setPresence] = useState<PresenceRow[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [cursors, setCursors] = useState<CursorRow[]>([]);
  const [applied, setApplied] = useState(false);

  const activeSlotRef = useRef<string | null>(null);

  // ── Subscription: session, presence, votes, and cursors ────────────
  useEffect(() => {
    if (!enabled || status !== "connected" || !connection || !tableId) {
      setApplied(false);
      setSession(null);
      setPresence([]);
      setVotes([]);
      setCursors([]);
      return;
    }

    const refresh = (): void => {
      try {
        const sessions = [...connection.db.table_session.iter()] as SessionRow[];
        setSession(sessions.find((s) => s.wtenTableId === tableId) ?? null);

        const presenceRows = ([...connection.db.table_presence.iter()] as PresenceRow[]).filter(
          (p) => p.wtenTableId === tableId,
        );
        setPresence(presenceRows);

        const voteRows = ([...connection.db.table_meal_vote.iter()] as VoteRow[]).filter(
          (v) => v.wtenTableId === tableId,
        );
        setVotes(voteRows);

        const cursorRows = ([...connection.db.table_cursor_presence.iter()] as CursorRow[]).filter(
          (c) => c.wtenTableId === tableId,
        );
        setCursors(cursorRows);
      } catch {
        // Raced a disconnect; the status change resets state.
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
        `SELECT * FROM table_meal_vote WHERE wten_table_id = '${escaped}'`,
        `SELECT * FROM table_cursor_presence WHERE wten_table_id = '${escaped}'`,
      ]);

    connection.db.table_session.onInsert(refresh);
    connection.db.table_session.onUpdate(refresh);
    connection.db.table_session.onDelete(refresh);

    connection.db.table_presence.onInsert(refresh);
    connection.db.table_presence.onUpdate(refresh);
    connection.db.table_presence.onDelete(refresh);

    connection.db.table_meal_vote.onInsert(refresh);
    connection.db.table_meal_vote.onUpdate(refresh);
    connection.db.table_meal_vote.onDelete(refresh);

    connection.db.table_cursor_presence.onInsert(refresh);
    connection.db.table_cursor_presence.onUpdate(refresh);
    connection.db.table_cursor_presence.onDelete(refresh);

    return (): void => {
      setApplied(false);
      try {
        connection.db.table_session.removeOnInsert(refresh);
        connection.db.table_session.removeOnUpdate(refresh);
        connection.db.table_session.removeOnDelete(refresh);

        connection.db.table_presence.removeOnInsert(refresh);
        connection.db.table_presence.removeOnUpdate(refresh);
        connection.db.table_presence.removeOnDelete(refresh);

        connection.db.table_meal_vote.removeOnInsert(refresh);
        connection.db.table_meal_vote.removeOnUpdate(refresh);
        connection.db.table_meal_vote.removeOnDelete(refresh);

        connection.db.table_cursor_presence.removeOnInsert(refresh);
        connection.db.table_cursor_presence.removeOnUpdate(refresh);
        connection.db.table_cursor_presence.removeOnDelete(refresh);

        subscription.unsubscribe();
      } catch {
        // Connection already torn down.
      }
    };
  }, [enabled, status, connection, tableId]);

  // ── Auto-clear cursor on unmount ────────────────────────────────────
  useEffect(() => {
    if (!enabled || !connection || !tableId) return;
    return (): void => {
      if (activeSlotRef.current) {
        try {
          connection.reducers.clearTableCursor({ wtenTableId: tableId }).catch(() => {});
        } catch {
          // Tear down
        }
      }
    };
  }, [enabled, connection, tableId]);


  // ── Aggregated Vote Summaries by Recipe Ref ─────────────────────────
  const votesByRecipeRef = useMemo<Record<string, RecipeVoteSummary>>(() => {
    const map: Record<string, RecipeVoteSummary> = {};

    votes.forEach((v) => {
      const voterHex = v.voter.toHexString();
      const isViewer = identityHex !== null && voterHex === identityHex;

      if (!Object.prototype.hasOwnProperty.call(map, v.recipeRef)) {
        map[v.recipeRef] = {
          recipeRef: v.recipeRef,
          recipeName: v.recipeName,
          totalScore: 0,
          upvotes: 0,
          downvotes: 0,
          voters: [],
          viewerVote: 0,
        };
      }

      const entry = map[v.recipeRef];
      entry.totalScore += v.voteScore;
      if (v.voteScore > 0) entry.upvotes += 1;
      if (v.voteScore < 0) entry.downvotes += 1;

      entry.voters.push({
        name: v.voterName || "Guest",
        score: v.voteScore,
        memberHex: voterHex,
      });

      if (isViewer) {
        entry.viewerVote = v.voteScore;
      }
    });

    return map;
  }, [votes, identityHex]);

  // ── Aggregated Cursors by Slot Ref ───────────────────────────────────
  const cursorsBySlotRef = useMemo<Record<string, SlotCursorSummary>>(() => {
    const map: Record<string, SlotCursorSummary> = {};

    cursors.forEach((c) => {
      const memberHex = c.member.toHexString();
      // Exclude viewer's own cursor from external cursor markers
      if (identityHex !== null && memberHex === identityHex) return;

      const slot = c.currentSlotRef;
      if (!slot) return;

      if (!Object.prototype.hasOwnProperty.call(map, slot)) {
        map[slot] = {
          slotRef: slot,
          activeGuests: [],
        };
      }

      map[slot].activeGuests.push({
        memberHex,
        displayName: c.displayName || "Guest",
        colorHex: c.colorHex || pickColorForIdentity(memberHex),
        updatedAtMs: c.updatedAt.toDate().getTime(),
      });
    });

    return map;
  }, [cursors, identityHex]);

  // ── Actions ──────────────────────────────────────────────────────────
  const voteMeal = useCallback(
    async (recipeRef: string, recipeName: string, voteScore: number): Promise<boolean> => {
      if (!enabled || status !== "connected" || !connection || !tableId) return false;
      const clampedScore = Math.max(-1, Math.min(1, Math.round(voteScore)));

      try {
        await connection.reducers.voteTableMeal({
          wtenTableId: tableId,
          recipeRef,
          recipeName,
          voteScore: clampedScore,
        });
        return true;
      } catch {
        return false;
      }
    },
    [enabled, status, connection, tableId],
  );

  const setCursor = useCallback(
    async (slotRef: string, customColor?: string): Promise<boolean> => {
      if (!enabled || status !== "connected" || !connection || !tableId) return false;
      if (activeSlotRef.current === slotRef) return true;

      activeSlotRef.current = slotRef;
      const color = customColor ?? (identityHex ? pickColorForIdentity(identityHex) : "#F59E0B");


      try {
        await connection.reducers.updateTableCursor({
          wtenTableId: tableId,
          currentSlotRef: slotRef,
          colorHex: color,
        });
        return true;
      } catch {
        return false;
      }
    },
    [enabled, status, connection, tableId, identityHex],
  );

  const clearCursor = useCallback(async (): Promise<boolean> => {
    if (!enabled || status !== "connected" || !connection || !tableId) return false;
    activeSlotRef.current = null;

    try {
      await connection.reducers.clearTableCursor({ wtenTableId: tableId });
      return true;
    } catch {
      return false;
    }
  }, [enabled, status, connection, tableId]);


  return {
    live: enabled && status === "connected" && applied && !!connection,
    session,
    presence,
    votes,
    cursors,
    votesByRecipeRef,
    cursorsBySlotRef,
    viewerHex: identityHex,
    voteMeal,
    setCursor,
    clearCursor,
  };
}

export default useSpacetimeTable;
