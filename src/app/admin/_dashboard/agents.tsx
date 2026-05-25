"use client";

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { Glyph } from "./atoms";
import { Card } from "./hero";
import { PaAgentSyncPanel } from "./PaAgentSyncPanel";

// ============================================================
// LIVE AGENT NETWORK DATA — fetched from /api/admin/agents/network
// ============================================================
interface AgentRoleSlice {
  id: string;
  label: string;
  agentCount: number;
  events24h: number;
}

interface AgentInteractionEntry {
  sessionId: string;
  agentId1: string;
  agentId2: string;
  agentName1: string;
  agentName2: string;
  timestamp: string;
  preview: string;
}

interface AgentDispatchEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentEmail: string;
  agentName: string | null;
  eventType: string;
  role: string;
}

interface AgentLeaderboardEntry {
  rank: number;
  agentId: string;
  agentEmail: string;
  agentName: string | null;
  events24h: number;
  lastEventAt: string | null;
  dominantElement: string | null;
}

interface AgentNetworkData {
  generatedAt: string;
  totals: {
    total: number;
    live: number;
    idle: number;
    warn: number;
    draining: number;
    live_source: boolean;
  };
  roles: { entries: AgentRoleSlice[]; live: boolean };
  dispatch: { entries: AgentDispatchEntry[]; live: boolean };
  leaderboard: { entries: AgentLeaderboardEntry[]; live: boolean };
  interactions: { entries: AgentInteractionEntry[]; live: boolean };
}

const EMPTY_NETWORK: AgentNetworkData = {
  generatedAt: new Date(0).toISOString(),
  totals: { total: 0, live: 0, idle: 0, warn: 0, draining: 0, live_source: false },
  roles: { entries: [], live: false },
  dispatch: { entries: [], live: false },
  leaderboard: { entries: [], live: false },
  interactions: { entries: [], live: false },
};

/** Stable color cycle so a given role label always gets the same accent. */
const ROLE_COLOR_CYCLE = [
  "var(--accent)",
  "var(--accent-2)",
  "var(--el-water)",
  "var(--el-earth)",
  "var(--el-air)",
  "var(--el-fire)",
  "#D6CFE8",
  "#9FBDE7",
];

function colorForRole(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ROLE_COLOR_CYCLE[Math.abs(hash) % ROLE_COLOR_CYCLE.length];
}

function useAgentNetwork(): { data: AgentNetworkData; live: boolean } {
  const [data, setData] = React.useState<AgentNetworkData>(EMPTY_NETWORK);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/agents/network", { cache: "no-store" });
      if (!res.ok) return { ok: false };
      const json = (await res.json()) as { success: boolean } & AgentNetworkData;
      if (json.success) {
        setData(json);
        return { ok: true };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  }, []);

  useHardenedPolling(poll, { baseIntervalMs: 30_000 });

  const live =
    data.totals.live_source &&
    data.roles.live &&
    data.dispatch.live &&
    data.leaderboard.live &&
    data.interactions.live;

  return { data, live };
}

// ============================================================
// AGENT FEED CONTROL ROOM
// ============================================================
export function AgentFeedControlRoom() {
  const { data, live } = useAgentNetwork();
  const { totals, roles, dispatch, leaderboard, interactions } = data;
  const activeDispatches = dispatch.entries.length;

  return (
    <>
    <PaAgentSyncPanel />
    <section style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background:
            "linear-gradient(90deg, color-mix(in oklch, var(--accent), transparent 90%), transparent)",
          border: "1px solid color-mix(in oklch, var(--accent), transparent 60%)",
          borderRadius: "10px 10px 0 0",
          borderBottom: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Glyph name="orbital" size={20} stroke={1.4} style={{ color: "var(--accent)" }} />
          <div>
            <div
              className="t-tag"
              style={{
                color: "var(--accent)",
                fontSize: 9,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              AGENT FEED · CONTROL ROOM
              <LiveDot live={live} />
            </div>
            <div className="t-display" style={{ fontSize: 16, marginTop: -2 }}>
              agents.alchm.kitchen ·{" "}
              <span style={{ color: "var(--accent-2)" }}>
                {totals.total} {totals.total === 1 ? "agent" : "agents"}
              </span>{" "}
              · {roles.entries.length} {roles.entries.length === 1 ? "role" : "roles"} ·{" "}
              {activeDispatches} active dispatches
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <AgentBadge label="LIVE" n={totals.live} color="var(--el-earth)" />
          <AgentBadge label="IDLE" n={totals.idle} color="var(--fg-mute)" />
          <AgentBadge label="WARN" n={totals.warn} color="var(--el-fire)" />
          <AgentBadge label="DRAINING" n={totals.draining} color="var(--accent-2)" />
        </div>
      </div>

      <div
        style={{
          border: "1px solid color-mix(in oklch, var(--accent), transparent 60%)",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          background: "rgba(0,0,0,0.18)",
          padding: 12,
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr 1fr",
          gap: 12,
        }}
      >
        <AgentTopology roles={roles.entries} totalNodes={totals.total} live={roles.live} />
        <AgentRoleDistribution roles={roles.entries} live={roles.live} />
        <AgentDispatchStream entries={dispatch.entries} live={dispatch.live} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12, marginTop: 12 }}>
        <AgentLeaderboard entries={leaderboard.entries} live={leaderboard.live} />
        <AgentInteractionsPanel entries={interactions.entries} live={interactions.live} />
      </div>
    </section>
    </>
  );
}

/**
 * Small live/offline indicator dot. Emerald + pulsing when every subsection
 * resolved from a real source; amber when at least one degraded.
 */
function LiveDot({ live }: { live: boolean }) {
  return (
    <span
      title={live ? "Live data" : "Degraded — some sources unavailable"}
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: 999,
        background: live ? "var(--el-earth)" : "var(--el-fire)",
        boxShadow: `0 0 8px ${live ? "var(--el-earth)" : "var(--el-fire)"}`,
        animation: live ? "pulse 2s ease-in-out infinite" : "none",
      }}
    />
  );
}

function AgentBadge({ label, n, color }: { label: string; n: number; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${color}`,
      }}
    >
      <span className="el-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="t-mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--fg-mute)" }}>
        {label}
      </span>
      <span className="t-num" style={{ fontSize: 11, color: "var(--fg)" }}>{n}</span>
    </div>
  );
}

// ----- TOPOLOGY -----
function AgentTopology({
  roles: roleData,
  totalNodes,
  live,
}: {
  roles: AgentRoleSlice[];
  totalNodes: number;
  live: boolean;
}) {
  // Map the live roles into the shape the SVG renderer expects. When the API
  // returns no roles (empty agent roster or degraded source) we still render
  // the empty topology with a "no agents" hint rather than collapsing.
  const ROLES = (roleData.length > 0 ? roleData : []).map((r) => ({
    id: r.id,
    label: r.label.toUpperCase(),
    color: colorForRole(r.id),
    n: r.agentCount,
  }));
  const SIZE = 360;
  const c = SIZE / 2;
  const ringR = 110;

  interface Node {
    x: number;
    y: number;
    role: (typeof ROLES)[number];
    state: "ok" | "warn" | "idle";
    center?: boolean;
  }
  const nodes: Node[] = [];
  ROLES.forEach((role, ri) => {
    const a = (ri / Math.max(ROLES.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const rx = c + Math.cos(a) * ringR;
    const ry = c + Math.sin(a) * ringR;
    // Render up to one decorative node per agent, capped so dense roles don't
    // crowd the ring. Small roles stay readable.
    const decoCount = Math.min(role.n, 20);
    for (let i = 0; i < decoCount; i++) {
      const aa = (i / Math.max(decoCount, 1)) * 2 * Math.PI;
      const r = 8 + (i % 3) * 8;
      const seed = (ri * 31 + i * 7) % 17;
      const state: Node["state"] = seed === 13 ? "warn" : seed === 7 || seed === 11 ? "idle" : "ok";
      nodes.push({ x: rx + Math.cos(aa) * r, y: ry + Math.sin(aa) * r, role, state });
    }
    if (role.n > 0) {
      nodes.push({ x: rx, y: ry, role, state: "ok", center: true });
    }
  });

  const stateColor: Record<Node["state"], string | null> = {
    ok: null,
    warn: "var(--el-fire)",
    idle: "var(--fg-mute)",
  };

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--line)",
        borderRadius: 10,
        background: "rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 12px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="t-tag">
          FLEET TOPOLOGY · {ROLES.length} {ROLES.length === 1 ? "ROLE" : "ROLES"} · {totalNodes} {totalNodes === 1 ? "NODE" : "NODES"}
        </span>
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--accent)" : "var(--fg-mute)" }}
        >
          {live ? "BROKER · LIVE" : "BROKER · DEGRADED"}
        </span>
      </div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height={300} style={{ display: "block" }}>
        <defs>
          <radialGradient id="atg">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
            <stop offset="80%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={c} cy={c} r={SIZE * 0.42} fill="url(#atg)" />
        {ROLES.map((r, i) => {
          const a = (i / Math.max(ROLES.length, 1)) * 2 * Math.PI - Math.PI / 2;
          const rx = c + Math.cos(a) * ringR;
          const ry = c + Math.sin(a) * ringR;
          return (
            <line
              key={r.id}
              x1={c}
              y1={c}
              x2={rx}
              y2={ry}
              stroke={r.color}
              strokeWidth="0.6"
              opacity="0.45"
            />
          );
        })}
        {/* Inter-role chords are decorative — only render pairs that fall
            inside the live role count. */}
        {[
          [0, 2],
          [0, 3],
          [1, 7],
          [2, 3],
          [4, 3],
          [5, 2],
          [6, 5],
        ]
          .filter(([a, b]) => a < ROLES.length && b < ROLES.length)
          .map(([a, b], i) => {
            const len = Math.max(ROLES.length, 1);
            const aa = (a / len) * 2 * Math.PI - Math.PI / 2;
            const bb = (b / len) * 2 * Math.PI - Math.PI / 2;
            const x1 = c + Math.cos(aa) * ringR;
            const y1 = c + Math.sin(aa) * ringR;
            const x2 = c + Math.cos(bb) * ringR;
            const y2 = c + Math.sin(bb) * ringR;
            return (
              <path
                key={i}
                d={`M${x1} ${y1} Q ${c} ${c} ${x2} ${y2}`}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.5"
              />
            );
          })}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.center ? 6 : 2.4}
            fill={n.state === "ok" ? n.role.color : stateColor[n.state] || n.role.color}
            stroke={n.center ? "rgba(0,0,0,0.5)" : "none"}
            strokeWidth={n.center ? 1 : 0}
            style={{
              filter:
                n.state === "warn"
                  ? "drop-shadow(0 0 4px var(--el-fire))"
                  : n.center
                    ? `drop-shadow(0 0 8px ${n.role.color})`
                    : "none",
            }}
          />
        ))}
        {ROLES.map((r, i) => {
          const a = (i / Math.max(ROLES.length, 1)) * 2 * Math.PI - Math.PI / 2;
          const lx = c + Math.cos(a) * (ringR + 42);
          const ly = c + Math.sin(a) * (ringR + 42);
          return (
            <g key={r.id}>
              <text
                x={lx}
                y={ly - 4}
                fill={r.color}
                fontSize="8.5"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                letterSpacing="1"
              >
                {r.label}
              </text>
              <text x={lx} y={ly + 8} fill="var(--fg-mute)" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                {r.n}
              </text>
            </g>
          );
        })}
        <circle cx={c} cy={c} r="16" fill="var(--bg)" stroke="var(--accent)" strokeWidth="0.8" />
        <circle cx={c} cy={c} r="8" fill="color-mix(in oklch, var(--accent), transparent 55%)" />
        <text
          x={c}
          y={c + 3}
          fill="var(--accent)"
          fontSize="8"
          fontFamily="JetBrains Mono"
          textAnchor="middle"
          letterSpacing="1"
        >
          BROKER
        </text>
      </svg>
      {ROLES.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            className="t-mono"
            style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.1em" }}
          >
            {live ? "no agents in network" : "broker offline"}
          </span>
        </div>
      )}
    </div>
  );
}

// ----- ROLE DISTRIBUTION -----
function AgentRoleDistribution({
  roles: roleData,
  live,
}: {
  roles: AgentRoleSlice[];
  live: boolean;
}) {
  // Approximate utilization as (events24h / agentCount). Capped at 1 so a
  // single very-active agent doesn't push the bar past 100%.
  const totalEvents = roleData.reduce((sum, r) => sum + r.events24h, 0);
  const roles = roleData.map((r) => {
    const util =
      r.agentCount > 0 ? Math.min(1, r.events24h / (r.agentCount * 12)) : 0;
    return {
      id: r.id,
      label: r.label.charAt(0).toUpperCase() + r.label.slice(1),
      color: colorForRole(r.id),
      live: r.agentCount,
      cap: r.agentCount,
      tasks: r.events24h,
      util,
    };
  });
  // Cap rendering to the 8 highest-volume roles to keep parity with the
  // prototype layout when the network grows beyond a handful of roles.
  roles.sort((a, b) => b.live - a.live).splice(8);
  return roles.length > 0 ? renderRoleDistribution(roles, live, totalEvents) : renderEmptyDistribution(live);
}

function renderEmptyDistribution(live: boolean) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "10px 12px",
        background: "rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className="t-tag">ROLE DISTRIBUTION · UTILIZATION</span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          last 24h
        </span>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="t-mono"
          style={{ fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.1em" }}
        >
          {live ? "no agent activity in 24h" : "role data offline"}
        </span>
      </div>
    </div>
  );
}

interface RoleDistributionRow {
  id: string;
  label: string;
  color: string;
  live: number;
  cap: number;
  tasks: number;
  util: number;
}

function renderRoleDistribution(
  roles: RoleDistributionRow[],
  live: boolean,
  totalEvents: number,
) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "10px 12px",
        background: "rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="t-tag">ROLE DISTRIBUTION · UTILIZATION</span>
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--fg-mute)" : "var(--el-fire)" }}
        >
          {live ? `last 24h · ${totalEvents} events` : "DEGRADED"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {roles.map((r) => (
          <RoleRow key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}

function RoleRow({ r }: { r: RoleDistributionRow }) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "16px 1fr auto auto",
          gap: 8,
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <span className="el-dot" style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
        <span style={{ fontSize: 11, color: "var(--fg-dim)" }}>{r.label}</span>
        <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>
          {r.live} {r.live === 1 ? "agent" : "agents"}
        </span>
        <span
          className="t-num"
          style={{
            fontSize: 11,
            color: r.util > 0.85 ? "var(--el-fire)" : "var(--fg)",
            minWidth: 36,
            textAlign: "right",
          }}
        >
          {Math.round(r.util * 100)}%
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 4,
          background: "rgba(255,255,255,0.03)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${r.util * 100}%`,
            height: "100%",
            background: r.color,
            boxShadow: `0 0 8px ${r.color}`,
            opacity: 0.9,
          }}
        />
        {r.util > 0.85 && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: -1,
              bottom: -1,
              width: 2,
              background: "var(--el-fire)",
              boxShadow: "0 0 8px var(--el-fire)",
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-faint)" }}>
          {r.tasks} {r.tasks === 1 ? "event" : "events"} · 24h
        </span>
        <span
          className="t-mono"
          style={{ fontSize: 8.5, color: r.util > 0.85 ? "var(--el-fire)" : "var(--fg-faint)" }}
        >
          {r.util > 0.85 ? "near saturation" : r.util < 0.2 && r.tasks > 0 ? "low usage" : ""}
        </span>
      </div>
    </div>
  );
}

// ----- DISPATCH STREAM -----
/** Strip the `@agentic.alchm.kitchen` suffix so the live ticker stays compact. */
function shortAgentHandle(email: string, name: string | null): string {
  if (name) return name;
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

/** Format a recent ISO timestamp as `HH:MM:SS.s` to match the prototype rhythm. */
function formatDispatchTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function AgentDispatchStream({
  entries,
  live,
}: {
  entries: AgentDispatchEntry[];
  live: boolean;
}) {
  // Derive a per-minute rate from the timestamps we have so the header reflects
  // real throughput instead of a fixed "1,284/min".
  const rate = React.useMemo(() => {
    if (entries.length < 2) return entries.length;
    const newest = new Date(entries[0].timestamp).getTime();
    const oldest = new Date(entries[entries.length - 1].timestamp).getTime();
    const spanMs = Math.max(newest - oldest, 1);
    return Math.round((entries.length / spanMs) * 60_000);
  }, [entries]);

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 10,
        background: "rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        height: 372,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "10px 12px 6px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span className="t-tag">
          DISPATCH · {live ? "LIVE" : "DEGRADED"} · {rate}/min
        </span>
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--accent)" : "var(--fg-mute)" }}
        >
          {live ? "● STREAMING" : "○ OFFLINE"}
        </span>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {entries.length === 0 ? (
          <div
            style={{
              padding: "24px 12px",
              textAlign: "center",
              color: "var(--fg-mute)",
              fontFamily: "var(--f-mono)",
              fontSize: 10,
            }}
          >
            {live
              ? "no agent dispatches yet"
              : "dispatch stream offline"}
          </div>
        ) : (
          entries.map((d, i) => (
            <div
              key={d.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto auto 1fr",
                gap: 6,
                alignItems: "center",
                padding: "6px 10px",
                borderBottom:
                  i === entries.length - 1
                    ? "none"
                    : "1px solid color-mix(in oklch, var(--line), transparent 30%)",
                fontFamily: "var(--f-mono)",
                fontSize: 9.5,
              }}
            >
              <span style={{ color: "var(--fg-mute)" }}>{formatDispatchTime(d.timestamp)}</span>
              <span
                style={{
                  padding: "1px 6px",
                  borderRadius: 999,
                  border: `1px solid ${colorForRole(d.role)}`,
                  color: colorForRole(d.role),
                  fontSize: 8.5,
                  letterSpacing: "0.1em",
                }}
                title={d.agentEmail}
              >
                {shortAgentHandle(d.agentEmail, d.agentName)}
              </span>
              <span
                style={{
                  color: "var(--fg-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {d.eventType}
              </span>
            </div>
          ))
        )}
      </div>
      <div
        style={{
          padding: "6px 12px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          SOURCE: <span style={{ color: "var(--fg)" }}>feed_events · is_agent=true</span>
        </span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>
    </div>
  );
}

// ----- LEADERBOARD -----
function elementGlyph(element: string | null): string {
  switch (element?.toLowerCase()) {
    case "fire":
      return "△";
    case "water":
      return "▽";
    case "earth":
      return "⊕";
    case "air":
      return "○";
    default:
      return "—";
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

function AgentLeaderboard({
  entries,
  live,
}: {
  entries: AgentLeaderboardEntry[];
  live: boolean;
}) {
  return (
    <Card
      title="Agent Leaderboard · 24h"
      subtitle="ranked by feed_event volume"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--accent)" : "var(--fg-mute)" }}
        >
          {live ? "● LIVE" : "○ OFFLINE"}
        </span>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px 1.4fr 60px 70px 60px",
          padding: "4px 0",
          borderBottom: "1px solid var(--line-hi)",
        }}
      >
        {["#", "Agent", "Events", "Last Seen", "Element"].map((h, i) => (
          <span
            key={h}
            className="t-tag"
            style={{ fontSize: 8.5, textAlign: i >= 2 ? "right" : "left" }}
          >
            {h}
          </span>
        ))}
      </div>
      {entries.length === 0 ? (
        <div
          style={{
            padding: "24px 0",
            textAlign: "center",
            color: "var(--fg-mute)",
            fontFamily: "var(--f-mono)",
            fontSize: 10,
          }}
        >
          {live ? "no agent activity in 24h" : "leaderboard offline"}
        </div>
      ) : (
        entries.map((a) => {
          const handle = shortAgentHandle(a.agentEmail, a.agentName);
          const stale =
            a.lastEventAt &&
            Date.now() - new Date(a.lastEventAt).getTime() > 3_600_000;
          return (
            <div
              key={a.agentId}
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1.4fr 60px 70px 60px",
                padding: "7px 0",
                alignItems: "center",
                borderBottom: "1px solid var(--line)",
                fontFamily: "var(--f-mono)",
                fontSize: 11,
              }}
            >
              <span style={{ color: "var(--fg-mute)", fontSize: 10 }}>
                {String(a.rank).padStart(2, "0")}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="el-dot"
                  style={{
                    background: colorForRole(handle),
                    boxShadow: `0 0 6px ${colorForRole(handle)}`,
                  }}
                />
                <span style={{ color: "var(--fg)" }} title={a.agentEmail}>
                  {handle}
                </span>
                {stale && (
                  <span
                    className="t-mono"
                    style={{ fontSize: 8, color: "var(--el-fire)", letterSpacing: "0.14em" }}
                  >
                    STALE
                  </span>
                )}
              </span>
              <span className="t-num" style={{ textAlign: "right", color: "var(--fg-dim)" }}>
                {a.events24h.toLocaleString()}
              </span>
              <span
                className="t-mono"
                style={{ textAlign: "right", color: "var(--fg-mute)", fontSize: 9.5 }}
              >
                {relativeTime(a.lastEventAt)}
              </span>
              <span
                style={{
                  textAlign: "right",
                  color: "var(--accent-2)",
                  fontSize: 12,
                }}
                title={a.dominantElement || "no element set"}
              >
                {elementGlyph(a.dominantElement)}
              </span>
            </div>
          );
        })
      )}
    </Card>
  );
}

function AgentInteractionsPanel({
  entries,
  live,
}: {
  entries: AgentInteractionEntry[];
  live: boolean;
}) {
  return (
    <Card
      title="Agent-to-Agent Discourses"
      subtitle="live edge view of collective intelligence interactions"
      right={
        <span
          className="t-mono"
          style={{ fontSize: 9, color: live ? "var(--accent)" : "var(--fg-mute)" }}
        >
          {live ? "● LIVE" : "○ OFFLINE"}
        </span>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.6fr auto",
          padding: "4px 0",
          borderBottom: "1px solid var(--line-hi)",
        }}
      >
        {["Source Agent", "Target Agent", "Discussion Preview", "Discourse Thread"].map((h, i) => (
          <span
            key={h}
            className="t-tag"
            style={{ fontSize: 8.5, textAlign: i === 3 ? "right" : "left" }}
          >
            {h}
          </span>
        ))}
      </div>
      {entries.length === 0 ? (
        <div
          style={{
            padding: "24px 0",
            textAlign: "center",
            color: "var(--fg-mute)",
            fontFamily: "var(--f-mono)",
            fontSize: 10,
          }}
        >
          {live ? "no agent discourses recorded" : "discourse stream offline"}
        </div>
      ) : (
        entries.map((interaction) => {
          return (
            <div
              key={interaction.sessionId}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1.6fr auto",
                padding: "8px 0",
                alignItems: "center",
                borderBottom: "1px solid var(--line)",
                fontFamily: "var(--f-mono)",
                fontSize: 11,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  className="el-dot"
                  style={{
                    background: colorForRole(interaction.agentName1),
                    boxShadow: `0 0 6px ${colorForRole(interaction.agentName1)}`,
                  }}
                />
                <span style={{ color: "var(--fg)" }}>
                  {interaction.agentName1}
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  className="el-dot"
                  style={{
                    background: colorForRole(interaction.agentName2),
                    boxShadow: `0 0 6px ${colorForRole(interaction.agentName2)}`,
                  }}
                />
                <span style={{ color: "var(--fg-dim)" }}>
                  {interaction.agentName2}
                </span>
              </span>
              <span
                style={{
                  color: "var(--fg-mute)",
                  fontSize: 10,
                  fontStyle: "italic",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: 10,
                }}
                title={interaction.preview}
              >
                &ldquo;{interaction.preview}&rdquo;
              </span>
              <span style={{ textAlign: "right" }}>
                <a
                  href={`https://agents.alchm.kitchen/gallery/chat/${encodeURIComponent(interaction.sessionId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 9,
                    color: "var(--accent)",
                    textDecoration: "none",
                    border: "1px solid var(--accent)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.2)",
                  }}
                  className="hover-accent"
                >
                  THREAD ↗
                </a>
              </span>
            </div>
          );
        })
      )}
    </Card>
  );
}

