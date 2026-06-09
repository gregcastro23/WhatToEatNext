"use client";

/**
 * LiveCommensalLobby — real-time dinner-party sessions over SpacetimeDB
 * (gated by NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL).
 *
 * Create / join / leave sessions with live participant presence from the
 * `commensal_session` + `commensal_member` tables. Host semantics are
 * enforced server-side by the module's reducers: only the host can change a
 * session's status, and a host leaving closes the session. When the flag is
 * off or the connection isn't live, the lobby renders nothing — the page's
 * existing local guest workflow is the fallback.
 */

import { track } from "@vercel/analytics";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLiveCommensalEnabled } from "@/lib/spacetime/config";
import type {
  CommensalMember as MemberRow,
  CommensalSession as SessionRow,
} from "@/lib/spacetime/generated/types";

const STATUS_LABEL: Record<number, { label: string; classes: string }> = {
  0: {
    label: "open",
    classes: "border-emerald-300/40 bg-emerald-400/10 text-emerald-300",
  },
  1: {
    label: "locked",
    classes: "border-amber-300/40 bg-amber-400/10 text-amber-300",
  },
  2: {
    label: "closed",
    classes: "border-white/15 bg-white/5 text-white/40",
  },
};

export default function LiveCommensalLobby() {
  const enabled = isLiveCommensalEnabled();
  const { connection, status, identityHex } = useSpacetime();
  const { data: authSession } = useSession();
  const displayName = authSession?.user?.name ?? "Anonymous Alchemist";

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [applied, setApplied] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!enabled || status !== "connected" || !connection) {
      setApplied(false);
      setSessions([]);
      setMembers([]);
      return;
    }

    const refresh = () => {
      try {
        setSessions([...connection.db.commensal_session.iter()]);
        setMembers([...connection.db.commensal_member.iter()]);
      } catch {
        // Raced a disconnect; status change clears state.
      }
    };

    const subscription = connection
      .subscriptionBuilder()
      .onApplied(() => {
        setApplied(true);
        refresh();
      })
      .subscribe([
        "SELECT * FROM commensal_session",
        "SELECT * FROM commensal_member",
      ]);

    connection.db.commensal_session.onInsert(refresh);
    connection.db.commensal_session.onUpdate(refresh);
    connection.db.commensal_session.onDelete(refresh);
    connection.db.commensal_member.onInsert(refresh);
    connection.db.commensal_member.onDelete(refresh);

    return () => {
      setApplied(false);
      try {
        connection.db.commensal_session.removeOnInsert(refresh);
        connection.db.commensal_session.removeOnUpdate(refresh);
        connection.db.commensal_session.removeOnDelete(refresh);
        connection.db.commensal_member.removeOnInsert(refresh);
        connection.db.commensal_member.removeOnDelete(refresh);
        subscription.unsubscribe();
      } catch {
        // Connection already torn down.
      }
    };
  }, [enabled, status, connection]);

  const membersBySession = useMemo(() => {
    const map = new Map<string, MemberRow[]>();
    for (const member of members) {
      const key = member.sessionId.toString();
      const list = map.get(key) ?? [];
      list.push(member);
      map.set(key, list);
    }
    return map;
  }, [members]);

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) =>
        // Open before locked before closed, newest first within a status.
        a.status !== b.status
          ? a.status - b.status
          : Number(b.sessionId - a.sessionId),
      ),
    [sessions],
  );

  if (!enabled || status !== "connected" || !applied || !connection) {
    return null;
  }

  const handleCreate = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    void connection.reducers
      .createCommensalSession({ title: cleanTitle, displayName })
      .catch((error) => console.warn("[commensal] create failed:", error));
    track("commensal_session_created");
    setTitle("");
  };

  return (
    <div className="glass-card-premium rounded-2xl border border-white/10 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-white/90">
          Live Dinner Parties
          <span
            className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 align-middle font-mono text-[9px] uppercase tracking-wider text-amber-300"
            title="Sessions and presence update in real time over SpacetimeDB"
          >
            ⚡ {sortedSessions.filter((s) => s.status !== 2).length} live
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Name a dinner party…"
            className="w-48 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-alchm-violet focus:outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="rounded-lg border border-alchm-violet bg-alchm-violet/10 px-3 py-1.5 text-sm font-medium text-alchm-violet transition-colors hover:bg-alchm-violet/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Host
          </button>
        </div>
      </div>

      {sortedSessions.length === 0 ? (
        <p className="text-sm text-white/40">
          No live sessions yet — host the first dinner party.
        </p>
      ) : (
        <ul className="space-y-3">
          {sortedSessions.map((session) => {
            const key = session.sessionId.toString();
            const sessionMembers = membersBySession.get(key) ?? [];
            const isHost = identityHex !== null && session.host.toHexString() === identityHex;
            const isMember =
              identityHex !== null &&
              sessionMembers.some((m) => m.member.toHexString() === identityHex);
            const statusInfo = STATUS_LABEL[session.status] ?? STATUS_LABEL[2];
            const closed = session.status === 2;

            return (
              <li
                key={key}
                className={`rounded-xl border border-white/10 bg-white/[0.03] p-4 ${closed ? "opacity-50" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white/90">
                      {session.title}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${statusInfo.classes}`}
                    >
                      {statusInfo.label}
                    </span>
                    {isHost && (
                      <span className="rounded-full border border-alchm-copper/40 bg-alchm-copper/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-alchm-copper">
                        host
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!closed && !isMember && session.status === 0 && (
                      <button
                        onClick={() => {
                          void connection.reducers
                            .joinCommensalSession({
                              sessionId: session.sessionId,
                              displayName,
                            })
                            .catch((error) =>
                              console.warn("[commensal] join failed:", error),
                            );
                          track("commensal_session_joined");
                        }}
                        className="rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-400/20"
                      >
                        Join
                      </button>
                    )}
                    {!closed && isMember && (
                      <button
                        onClick={() => {
                          void connection.reducers
                            .leaveCommensalSession({ sessionId: session.sessionId })
                            .catch((error) =>
                              console.warn("[commensal] leave failed:", error),
                            );
                        }}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/60 hover:bg-white/10"
                        title={
                          isHost
                            ? "Leaving as host closes the session for everyone"
                            : undefined
                        }
                      >
                        {isHost ? "Leave & close" : "Leave"}
                      </button>
                    )}
                    {!closed && isHost && (
                      <button
                        onClick={() => {
                          void connection.reducers
                            .setCommensalSessionStatus({
                              sessionId: session.sessionId,
                              status: session.status === 0 ? 1 : 0,
                            })
                            .catch((error) =>
                              console.warn("[commensal] status failed:", error),
                            );
                        }}
                        className="rounded-lg border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-400/20"
                      >
                        {session.status === 0 ? "Lock" : "Reopen"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {sessionMembers.map((member) => (
                    <span
                      key={member.rowId.toString()}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70"
                    >
                      {member.displayName || "Anonymous Alchemist"}
                    </span>
                  ))}
                  {sessionMembers.length === 0 && (
                    <span className="text-[11px] text-white/30">
                      No one at the table yet
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
