"use client";

import React from "react";
import { Glyph, Sparkline } from "./atoms";
import { seeded } from "./data";
import { Card } from "./hero";
import { PaAgentSyncPanel } from "./PaAgentSyncPanel";

// ============================================================
// AGENT FEED CONTROL ROOM
// ============================================================
export function AgentFeedControlRoom() {
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
            <div className="t-tag" style={{ color: "var(--accent)", fontSize: 9 }}>
              AGENT FEED · CONTROL ROOM
            </div>
            <div className="t-display" style={{ fontSize: 16, marginTop: -2 }}>
              agents.alchm.kitchen ·{" "}
              <span style={{ color: "var(--accent-2)" }}>440 agents</span> · 8 roles · 31 active dispatches
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <AgentBadge label="LIVE" n={412} color="var(--el-earth)" />
          <AgentBadge label="IDLE" n={26} color="var(--fg-mute)" />
          <AgentBadge label="WARN" n={2} color="var(--el-fire)" />
          <AgentBadge label="DRAINING" n={0} color="var(--accent-2)" />
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
        <AgentTopology />
        <AgentRoleDistribution />
        <AgentDispatchStream />
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <AgentSousChefPanel />
        <AgentGalileoPanel />
        <AgentSubstitutionPanel />
        <AgentPantryPanel />
        <AgentProcurementPanel />
        <AgentLineageDossierPanel />
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: 12,
        }}
      >
        <AgentLeaderboard />
        <AgentReasoningTrace />
      </div>
    </section>
    </>
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
function AgentTopology() {
  const ROLES = [
    { id: "sous", label: "SOUS-CHEF", color: "var(--accent)", n: 96 },
    { id: "galileo", label: "GALILEO", color: "var(--accent-2)", n: 42 },
    { id: "sub", label: "SUB · SWAP", color: "var(--el-water)", n: 54 },
    { id: "pantry", label: "PANTRY", color: "var(--el-earth)", n: 78 },
    { id: "procure", label: "PROCURE", color: "var(--el-air)", n: 38 },
    { id: "lineage", label: "LINEAGE", color: "var(--el-fire)", n: 28 },
    { id: "dossier", label: "DOSSIER", color: "#D6CFE8", n: 22 },
    { id: "restaurant", label: "RESTAURANT", color: "var(--accent)", n: 18 },
  ];
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
    const a = (ri / ROLES.length) * 2 * Math.PI - Math.PI / 2;
    const rx = c + Math.cos(a) * ringR;
    const ry = c + Math.sin(a) * ringR;
    for (let i = 0; i < Math.min(role.n / 3, 20); i++) {
      const aa = (i / 20) * 2 * Math.PI;
      const r = 8 + (i % 3) * 8;
      const seed = (ri * 31 + i * 7) % 17;
      const state: Node["state"] = seed === 13 ? "warn" : seed === 7 || seed === 11 ? "idle" : "ok";
      nodes.push({ x: rx + Math.cos(aa) * r, y: ry + Math.sin(aa) * r, role, state });
    }
    nodes.push({ x: rx, y: ry, role, state: "ok", center: true });
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
        <span className="t-tag">FLEET TOPOLOGY · 8 ROLES · 440 NODES</span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>
          BROKER · ROUND-ROBIN + AFFINITY
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
          const a = (i / ROLES.length) * 2 * Math.PI - Math.PI / 2;
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
        {[
          [0, 2],
          [0, 3],
          [1, 7],
          [2, 3],
          [4, 3],
          [5, 2],
          [6, 5],
        ].map(([a, b], i) => {
          const aa = (a / ROLES.length) * 2 * Math.PI - Math.PI / 2;
          const bb = (b / ROLES.length) * 2 * Math.PI - Math.PI / 2;
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
          const a = (i / ROLES.length) * 2 * Math.PI - Math.PI / 2;
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
    </div>
  );
}

// ----- ROLE DISTRIBUTION -----
function AgentRoleDistribution() {
  const roles = [
    { id: "sous", label: "Sous-chef", color: "var(--accent)", live: 88, cap: 96, tasks: 142, util: 0.78 },
    { id: "galileo", label: "Galileo · imagery", color: "var(--accent-2)", live: 40, cap: 42, tasks: 38, util: 0.92 },
    { id: "sub", label: "Substitution", color: "var(--el-water)", live: 52, cap: 54, tasks: 84, util: 0.61 },
    { id: "pantry", label: "Pantry sentinel", color: "var(--el-earth)", live: 72, cap: 78, tasks: 18, util: 0.34 },
    { id: "procure", label: "Procurement", color: "var(--el-air)", live: 36, cap: 38, tasks: 22, util: 0.55 },
    { id: "lineage", label: "Lineage walker", color: "var(--el-fire)", live: 26, cap: 28, tasks: 8, util: 0.18 },
    { id: "dossier", label: "Dossier export", color: "#D6CFE8", live: 20, cap: 22, tasks: 4, util: 0.12 },
    { id: "restaurant", label: "Restaurant creator", color: "var(--accent)", live: 18, cap: 18, tasks: 6, util: 0.41 },
  ];
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
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>last 60s</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {roles.map((r) => (
          <div key={r.id}>
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
              <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)" }}>{r.live}/{r.cap}</span>
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
              <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-faint)" }}>{r.tasks} active tasks</span>
              <span
                className="t-mono"
                style={{ fontSize: 8.5, color: r.util > 0.85 ? "var(--el-fire)" : "var(--fg-faint)" }}
              >
                {r.util > 0.85 ? "near saturation" : r.util < 0.2 ? "low usage" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- DISPATCH STREAM -----
function AgentDispatchStream() {
  const dispatches = [
    { t: "21:46:08.4", agent: "sous-242", role: "sous", task: "session/DP-441 · plate-up coaching", lat: 18, cost: 0.018 },
    { t: "21:46:07.9", agent: "galileo-12", role: "gal", task: "img/recipe-c8f1ad · 1024² · sdxl-alchm-v3", lat: 1240, cost: 0.041 },
    { t: "21:46:07.1", agent: "sub-09", role: "sub", task: "swap/heirloom-tomato → roasted-pepper · fid 0.91", lat: 42, cost: 0.004 },
    { t: "21:46:06.4", agent: "pantry-31", role: "pan", task: "@kemi · expiry sweep · 2 items pushed", lat: 88, cost: 0.002 },
    { t: "21:46:05.8", agent: "proc-04", role: "pro", task: "amz/cart bundle · 06 substances · $84.20", lat: 312, cost: 0.011 },
    { t: "21:46:05.1", agent: "lineage-2", role: "lin", task: "sauce/espagnole → demi-glace · 4-hop walk", lat: 64, cost: 0.003 },
    { t: "21:46:04.6", agent: "sous-118", role: "sous", task: "session/DP-440 · onboard 6 guests", lat: 22, cost: 0.014 },
    { t: "21:46:04.0", agent: "dossier-3", role: "dos", task: "@vera.j premium export · 14p · pdf", lat: 2840, cost: 0.082 },
    { t: "21:46:03.7", agent: "sub-21", role: "sub", task: "swap/black-garlic → fish-sauce · fid 0.86", lat: 38, cost: 0.004 },
    { t: "21:46:03.1", agent: "galileo-08", role: "gal", task: "img/recipe-84a210 · 768² · retry 1/3", lat: 980, cost: 0.022 },
    { t: "21:46:02.4", agent: "restaurant-2", role: "rst", task: "@vera.j concept menu · 12 covers · sketching", lat: 18620, cost: 0.214 },
    { t: "21:46:01.8", agent: "pantry-09", role: "pan", task: "@noor low-stock · sumac · ordered", lat: 64, cost: 0.002 },
  ];
  const roleColor: Record<string, string> = {
    sous: "var(--accent)",
    gal: "var(--accent-2)",
    sub: "var(--el-water)",
    pan: "var(--el-earth)",
    pro: "var(--el-air)",
    lin: "var(--el-fire)",
    dos: "#D6CFE8",
    rst: "var(--accent)",
  };
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
        <span className="t-tag">DISPATCH · LIVE · 1,284/min</span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>● STREAMING</span>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {dispatches.map((d, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto 1fr auto auto",
              gap: 6,
              alignItems: "center",
              padding: "6px 10px",
              borderBottom:
                i === dispatches.length - 1
                  ? "none"
                  : "1px solid color-mix(in oklch, var(--line), transparent 30%)",
              fontFamily: "var(--f-mono)",
              fontSize: 9.5,
            }}
          >
            <span style={{ color: "var(--fg-mute)" }}>{d.t}</span>
            <span
              style={{
                padding: "1px 6px",
                borderRadius: 999,
                border: `1px solid ${roleColor[d.role]}`,
                color: roleColor[d.role],
                fontSize: 8.5,
                letterSpacing: "0.1em",
              }}
            >
              {d.agent}
            </span>
            <span
              style={{
                color: "var(--fg-dim)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {d.task}
            </span>
            <span
              style={{
                color:
                  d.lat > 2000
                    ? "var(--el-fire)"
                    : d.lat > 500
                      ? "var(--accent-2)"
                      : "var(--fg-mute)",
                fontSize: 9,
              }}
            >
              {d.lat < 1000 ? `${d.lat}ms` : `${(d.lat / 1000).toFixed(1)}s`}
            </span>
            <span style={{ color: "var(--accent)", fontSize: 9 }}>${d.cost.toFixed(3)}</span>
          </div>
        ))}
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
          SHOW: <span style={{ color: "var(--fg)" }}>ALL ROLES</span>
        </span>
        <span className="t-mono" style={{ fontSize: 9, color: "var(--fg-mute)" }}>
          $0.42/min · projected $604/day
        </span>
      </div>
    </div>
  );
}

// ----- ROLE CARD WRAPPER -----
function AgentRoleCard({
  title,
  sub,
  color,
  icon,
  badge,
  children,
}: {
  title: string;
  sub: string;
  color: string;
  icon: React.ComponentProps<typeof Glyph>["name"];
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="panel"
      style={{
        padding: 0,
        overflow: "hidden",
        borderColor: `color-mix(in oklch, ${color}, var(--line) 70%)`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid var(--line)",
          background: `linear-gradient(90deg, color-mix(in oklch, ${color}, transparent 88%), transparent)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: `color-mix(in oklch, ${color}, transparent 70%)`,
              border: `1px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Glyph name={icon} size={13} stroke={1.4} style={{ color }} />
          </span>
          <div>
            <div className="t-tag" style={{ fontSize: 9, color }}>{title}</div>
            <div style={{ fontSize: 11, color: "var(--fg-dim)", marginTop: 1 }}>{sub}</div>
          </div>
        </div>
        {badge}
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

function MicroStat({
  label,
  value,
  warn,
  mono,
}: {
  label: string;
  value: string;
  warn?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 6,
        padding: "5px 8px",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="t-tag" style={{ fontSize: 8 }}>{label}</div>
      <div
        className={mono ? "t-mono" : "t-num"}
        style={{ fontSize: mono ? 11 : 13, color: warn ? "var(--el-fire)" : "var(--fg)", marginTop: 1 }}
      >
        {value}
      </div>
    </div>
  );
}

// ----- DEEP ROLE PANELS -----
function AgentSousChefPanel() {
  const sparks = seeded(41, 30, 0.5, 0.92);
  return (
    <AgentRoleCard
      title="SOUS-CHEF"
      sub="live cooking-session companions"
      icon="flask"
      color="var(--accent)"
      badge={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>88 / 96 · 142 sessions</span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
        <MicroStat label="Avg session" value="34m" />
        <MicroStat label="Hand-off" value="3.1%" warn />
        <MicroStat label="CSAT" value="4.74★" />
      </div>
      <div className="t-tag" style={{ marginBottom: 4 }}>TOP LIVE SESSIONS · TIME REMAINING</div>
      {[
        { id: "DP-441", who: "@kemi", recipe: "yoruba egusi", left: "12m", t: 0.6, agent: "sous-242" },
        { id: "DP-440", who: "@ezra", recipe: "matzo brei + spring herbs", left: "28m", t: 0.3, agent: "sous-118" },
        { id: "DP-439", who: "@hiro", recipe: "kaiseki · 4th course", left: "6m", t: 0.85, agent: "sous-088" },
      ].map((s) => (
        <div
          key={s.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 50px 40px",
            gap: 6,
            padding: "5px 0",
            alignItems: "center",
            borderBottom: "1px dashed var(--line)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--accent)" }}>{s.agent}</span>
              <span className="t-mono" style={{ fontSize: 9, color: "var(--accent-2)" }}>{s.who}</span>
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "var(--fg-dim)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.recipe}
            </div>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                width: `${s.t * 100}%`,
                height: "100%",
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent)",
              }}
            />
          </div>
          <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-mute)", textAlign: "right" }}>{s.left}</span>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <div className="t-tag" style={{ marginBottom: 4 }}>SESSIONS · 30M ROLLING</div>
        <Sparkline data={sparks} width={280} height={28} color="var(--accent)" />
      </div>
    </AgentRoleCard>
  );
}

function AgentGalileoPanel() {
  const qSize = 38;
  const burning = 4;
  return (
    <AgentRoleCard
      title="GALILEO · IMAGERY"
      sub="hero image generation pipeline"
      icon="atom"
      color="var(--accent-2)"
      badge={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--accent-2)" }}>40 / 42 · 92% util</span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
        <MicroStat label="Model" value="sdxl-alchm v3.2" mono />
        <MicroStat label="Gen/min" value="22" />
        <MicroStat label="Avg time" value="1.24s" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="t-tag">QUEUE · {qSize} JOBS · {burning} IN-FLIGHT</span>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--el-fire)" }}>fail · 0.6%</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(38, 1fr)", gap: 1.5, marginBottom: 8 }}>
        {Array.from({ length: qSize }, (_, i) => {
          const inFlight = i < burning;
          const failed = i === 11;
          return (
            <div
              key={i}
              style={{
                height: 18,
                borderRadius: 2,
                background: inFlight ? "var(--accent-2)" : failed ? "var(--el-fire)" : "rgba(255,255,255,0.06)",
                boxShadow: inFlight
                  ? "0 0 6px var(--accent-2)"
                  : failed
                    ? "0 0 4px var(--el-fire)"
                    : "none",
                border: "1px solid var(--line)",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginTop: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: `linear-gradient(135deg, color-mix(in oklch, var(--accent-2), transparent ${40 + n * 8}%), color-mix(in oklch, var(--accent), transparent ${20 + n * 10}%)), repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 5px)`,
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <span
              className="t-mono"
              style={{
                fontSize: 7,
                color: "rgba(255,255,255,0.5)",
                padding: "2px 4px",
                letterSpacing: "0.08em",
              }}
            >
              {["miso-eggplant", "branzino", "pho-ga", "kheer", "ribollita"][n - 1]}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
        <MicroStat label="GPU" value="A100 · 78%" />
        <MicroStat label="Cost · 24h" value="$184" />
      </div>
    </AgentRoleCard>
  );
}

function AgentSubstitutionPanel() {
  const swaps = [
    { from: "heirloom tomato", to: "roasted red pepper", fid: 0.91, n: 184 },
    { from: "saffron", to: "annatto + paprika", fid: 0.74, n: 142 },
    { from: "black garlic", to: "miso paste", fid: 0.88, n: 118 },
    { from: "duck fat", to: "browned butter", fid: 0.82, n: 96 },
    { from: "guajillo", to: "ancho", fid: 0.94, n: 84 },
  ];
  return (
    <AgentRoleCard
      title="SUBSTITUTION ENGINE"
      sub="culinary + alchemical fidelity swaps"
      icon="diamond"
      color="var(--el-water)"
      badge={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--el-water)" }}>
          52 / 54 · graph 99.4% intact
        </span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
        <MicroStat label="Swaps/min" value="86" />
        <MicroStat label="Avg fidelity" value="0.864" />
        <MicroStat label="Graph nodes" value="2,901" />
      </div>
      <div className="t-tag" style={{ marginBottom: 4 }}>TOP PAIRS · 24H</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {swaps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 50px",
              alignItems: "center",
              gap: 8,
              padding: "5px 0",
              borderBottom: i === swaps.length - 1 ? "none" : "1px dashed var(--line)",
              fontSize: 10.5,
            }}
          >
            <span
              style={{
                color: "var(--fg-dim)",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "var(--fg-mute)" }}>{s.from}</span>
              <span style={{ color: "var(--el-water)", margin: "0 6px" }}>→</span>
              <span style={{ color: "var(--fg)" }}>{s.to}</span>
            </span>
            <span
              style={{
                padding: "1px 6px",
                borderRadius: 999,
                background: `color-mix(in oklch, var(--el-water), transparent ${(1 - s.fid) * 100}%)`,
                border: "1px solid color-mix(in oklch, var(--el-water), transparent 50%)",
                fontFamily: "var(--f-mono)",
                fontSize: 9,
                color: "var(--fg)",
              }}
            >
              {s.fid.toFixed(2)}
            </span>
            <span className="t-num" style={{ fontSize: 10.5, color: "var(--fg-dim)", textAlign: "right" }}>{s.n}</span>
          </div>
        ))}
      </div>
    </AgentRoleCard>
  );
}

function AgentPantryPanel() {
  return (
    <AgentRoleCard
      title="PANTRY SENTINEL"
      sub="expiry · low-stock · auto-restock"
      icon="mortar"
      color="var(--el-earth)"
      badge={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--el-earth)" }}>72 / 78 · 34% util</span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
        <MicroStat label="Sweeps/h" value="412" />
        <MicroStat label="Push notif" value="184" />
        <MicroStat label="Auto-cart" value="22" />
      </div>
      <div className="t-tag" style={{ marginBottom: 4 }}>EXPIRY · NEXT 48H · PRACTITIONERS PUSHED</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(48, 1fr)", gap: 2, marginBottom: 8 }}>
        {seeded(81, 48, 0.05, 0.7).map((v, i) => (
          <div
            key={i}
            style={{
              height: 14,
              borderRadius: 2,
              background: `color-mix(in oklch, var(--el-earth), transparent ${(1 - v) * 92}%)`,
              border: "1px solid var(--line)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>now</span>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>+12h</span>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>+24h</span>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>+36h</span>
        <span className="t-mono" style={{ fontSize: 8.5, color: "var(--fg-mute)" }}>+48h</span>
      </div>
      <div style={{ marginTop: 8, padding: "6px 8px", border: "1px dashed var(--line)", borderRadius: 6 }}>
        <div className="t-tag" style={{ fontSize: 8 }}>TOP ALERT</div>
        <div style={{ fontSize: 10.5, color: "var(--fg-dim)", marginTop: 2 }}>
          1,284 practitioners · cilantro expiring &lt; 36h · push @ 12:00 local
        </div>
      </div>
    </AgentRoleCard>
  );
}

function AgentProcurementPanel() {
  return (
    <AgentRoleCard
      title="PROCUREMENT"
      sub="amazon fresh · multi-cart bundles"
      icon="triangle-up-bar"
      color="var(--el-air)"
      badge={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--el-air)" }}>36 / 38 · 22 in-flight</span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
        <MicroStat label="Bundles/h" value="64" />
        <MicroStat label="Fulfil rate" value="98.1%" />
        <MicroStat label="Avg basket" value="$48.20" />
      </div>
      <div className="t-tag" style={{ marginBottom: 6 }}>ADAPTER · AMAZON FRESH</div>
      <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "6px 8px", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-dim)" }}>API health</span>
          <span className="t-mono" style={{ fontSize: 9.5, color: "var(--el-earth)" }}>● 220ms · p95 980ms</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-dim)" }}>SKU coverage</span>
          <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg)" }}>2,743 / 2,901 (94.6%)</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-dim)" }}>regions</span>
          <span className="t-mono" style={{ fontSize: 9.5, color: "var(--fg)" }}>US · UK · DE · JP</span>
        </div>
      </div>
      <div className="t-tag" style={{ marginBottom: 4 }}>RECENT BUNDLES</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {[
          { who: "@kemi", n: 6, v: "$84.20", state: "delivered" },
          { who: "@noor", n: 4, v: "$32.80", state: "out for delivery" },
          { who: "@a.bertolucci", n: 11, v: "$112.40", state: "fulfilled" },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 30px 60px 80px",
              padding: "4px 0",
              fontSize: 10.5,
              borderBottom: i === 2 ? "none" : "1px dashed var(--line)",
            }}
          >
            <span style={{ color: "var(--accent-2)", fontFamily: "var(--f-mono)" }}>{b.who}</span>
            <span className="t-mono" style={{ color: "var(--fg-mute)", textAlign: "right" }}>{b.n}</span>
            <span className="t-num" style={{ color: "var(--fg)", textAlign: "right" }}>{b.v}</span>
            <span className="t-mono" style={{ color: "var(--el-earth)", textAlign: "right", fontSize: 9 }}>{b.state}</span>
          </div>
        ))}
      </div>
    </AgentRoleCard>
  );
}

function AgentLineageDossierPanel() {
  return (
    <AgentRoleCard
      title="LINEAGE · DOSSIER"
      sub="sauce derivations · premium exports"
      icon="spiral"
      color="var(--el-fire)"
      badge={
        <span className="t-mono" style={{ fontSize: 9, color: "var(--el-fire)" }}>26 + 20 · 12 active</span>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
        <MicroStat label="Walks/h" value="284" />
        <MicroStat label="Dossiers" value="22" />
        <MicroStat label="Avg depth" value="5.2 hops" />
      </div>
      <div className="t-tag" style={{ marginBottom: 6 }}>SAUCE LINEAGE · LIVE WALK</div>
      <div
        style={{
          padding: "8px 10px",
          border: "1px solid var(--line)",
          borderRadius: 6,
          background: "rgba(0,0,0,0.2)",
          fontFamily: "var(--f-mono)",
          fontSize: 10,
          lineHeight: 1.6,
        }}
      >
        <div style={{ color: "var(--fg-mute)" }}>mother</div>
        <div style={{ color: "var(--accent)" }}>↳ espagnole</div>
        <div style={{ color: "var(--fg-dim)" }}>&nbsp;&nbsp;↳ demi-glace</div>
        <div style={{ color: "var(--fg-dim)" }}>
          &nbsp;&nbsp;&nbsp;&nbsp;↳ bordelaise{" "}
          <span style={{ color: "var(--el-fire)" }}>· match · @vera.j</span>
        </div>
        <div style={{ color: "var(--fg-faint)" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↳ marchand de vin</div>
      </div>
      <div className="t-tag" style={{ marginTop: 8, marginBottom: 4 }}>RECENT DOSSIER EXPORTS</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {[
          { who: "@vera.j", pages: 14, fmt: "pdf", time: "2.8s" },
          { who: "@hiro", pages: 28, fmt: "pdf · annotated", time: "5.4s" },
          { who: "@kemi", pages: 6, fmt: "csv", time: "0.8s" },
        ].map((d, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 40px 100px 40px",
              padding: "4px 0",
              fontSize: 10.5,
              borderBottom: i === 2 ? "none" : "1px dashed var(--line)",
            }}
          >
            <span style={{ color: "var(--accent-2)", fontFamily: "var(--f-mono)" }}>{d.who}</span>
            <span className="t-num" style={{ color: "var(--fg)", textAlign: "right" }}>{d.pages}p</span>
            <span className="t-mono" style={{ color: "var(--fg-mute)", textAlign: "right", fontSize: 9 }}>{d.fmt}</span>
            <span className="t-mono" style={{ color: "var(--el-fire)", textAlign: "right", fontSize: 9 }}>{d.time}</span>
          </div>
        ))}
      </div>
    </AgentRoleCard>
  );
}

// ----- LEADERBOARD + REASONING TRACE -----
function AgentLeaderboard() {
  const top = [
    { rank: 1, id: "sous-242", n: 1284, ok: 99.4, cost: 4.21, color: "var(--accent)" },
    { rank: 2, id: "galileo-12", n: 982, ok: 98.8, cost: 12.4, color: "var(--accent-2)" },
    { rank: 3, id: "sub-09", n: 762, ok: 99.6, cost: 1.84, color: "var(--el-water)" },
    { rank: 4, id: "pantry-31", n: 612, ok: 99.9, cost: 0.42, color: "var(--el-earth)" },
    { rank: 5, id: "sous-118", n: 588, ok: 99.1, cost: 3.18, color: "var(--accent)" },
    { rank: 6, id: "proc-04", n: 412, ok: 98.2, cost: 2.84, color: "var(--el-air)" },
    { rank: 7, id: "lineage-2", n: 384, ok: 99.7, cost: 1.42, color: "var(--el-fire)" },
    { rank: 8, id: "galileo-08", n: 348, ok: 96.4, cost: 8.4, color: "var(--accent-2)", warn: true },
    { rank: 9, id: "dossier-3", n: 84, ok: 100, cost: 6.2, color: "#D6CFE8" },
    { rank: 10, id: "restaurant-2", n: 18, ok: 100, cost: 4.84, color: "var(--accent)" },
  ];
  return (
    <Card
      title="Agent Leaderboard · 24h"
      subtitle="ranked by dispatch volume"
      right={
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
          OPEN ROSTER
        </button>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px 1.4fr 60px 60px 70px",
          padding: "4px 0",
          borderBottom: "1px solid var(--line-hi)",
        }}
      >
        {["#", "Agent", "Tasks", "Success", "Cost"].map((h, i) => (
          <span
            key={h}
            className="t-tag"
            style={{ fontSize: 8.5, textAlign: i >= 2 ? "right" : "left" }}
          >
            {h}
          </span>
        ))}
      </div>
      {top.map((a) => (
        <div
          key={a.id}
          style={{
            display: "grid",
            gridTemplateColumns: "24px 1.4fr 60px 60px 70px",
            padding: "7px 0",
            alignItems: "center",
            borderBottom: "1px solid var(--line)",
            fontFamily: "var(--f-mono)",
            fontSize: 11,
          }}
        >
          <span style={{ color: "var(--fg-mute)", fontSize: 10 }}>{String(a.rank).padStart(2, "0")}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="el-dot" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
            <span style={{ color: "var(--fg)" }}>{a.id}</span>
            {a.warn && (
              <span className="t-mono" style={{ fontSize: 8, color: "var(--el-fire)", letterSpacing: "0.14em" }}>
                RETRY
              </span>
            )}
          </span>
          <span className="t-num" style={{ textAlign: "right", color: "var(--fg-dim)" }}>{a.n.toLocaleString()}</span>
          <span
            className="t-num"
            style={{
              textAlign: "right",
              color: a.ok > 99 ? "var(--el-earth)" : a.ok > 98 ? "var(--fg-dim)" : "var(--el-fire)",
            }}
          >
            {a.ok}%
          </span>
          <span className="t-num" style={{ textAlign: "right", color: "var(--accent)" }}>${a.cost.toFixed(2)}</span>
        </div>
      ))}
    </Card>
  );
}

function AgentReasoningTrace() {
  const lines = [
    { t: 0, k: "PLAN", msg: "Plan: 12-cover menu · spring · NYC sourcing window" },
    { t: 1, k: "QUERY", msg: "natal(@vera.j) → Venus dominant · Taurus rising · earth+water" },
    { t: 2, k: "SKY", msg: "transit · Mars Leo, Venus stationing Rx → tilt towards earth, rooted starch" },
    { t: 3, k: "BIAS", msg: "elemental bias: earth 0.42, water 0.31, fire 0.18, air 0.09" },
    { t: 4, k: "PANTRY", msg: "filter to NYC seasonal · Greenmarket · 184 viable ingredients" },
    { t: 5, k: "SEMS", msg: "target SEMS · S 0.55 · E 0.65 · M 0.50 · S 0.45" },
    { t: 6, k: "DRAFT", msg: "first pass · 1) ramp tart 2) cured trout 3) braised cheek 4) burnt cabbage 5) buttermilk panna cotta" },
    { t: 7, k: "TOOL", msg: "→ substitution-09 · check 'cured trout' availability NYC" },
    { t: 8, k: "TOOL←", msg: "← available · alt salmon if king mackerel unavailable" },
    { t: 9, k: "TOOL", msg: "→ lineage-2 · walk sauce options for braised cheek" },
    { t: 10, k: "TOOL←", msg: "← bordelaise (red wine reduction) · marchand de vin (alt)" },
    { t: 11, k: "BAL", msg: "balance check: S 0.58 ✓ · E 0.66 ✓ · M 0.46 ⚠ low → add root crudité" },
    { t: 12, k: "FIX", msg: "insert 'roasted celeriac · whipped' between 2 and 3 → M 0.52 ✓" },
    { t: 13, k: "GALILEO", msg: "→ galileo-12 · render hero for 6 plates" },
    { t: 14, k: "WAIT", msg: "awaiting 6 images · est 7.4s" },
    { t: 15, k: "DONE", msg: "draft v1 ready · 6 plates · 4 sauces · 14p dossier · awaiting your approve" },
  ];
  const kColor: Record<string, string> = {
    PLAN: "var(--accent)",
    QUERY: "var(--accent-2)",
    SKY: "var(--el-fire)",
    BIAS: "var(--accent)",
    PANTRY: "var(--el-earth)",
    SEMS: "var(--accent)",
    DRAFT: "var(--fg)",
    TOOL: "var(--el-water)",
    "TOOL←": "var(--el-water)",
    BAL: "var(--el-fire)",
    FIX: "var(--el-earth)",
    GALILEO: "var(--accent-2)",
    WAIT: "var(--fg-mute)",
    DONE: "var(--el-earth)",
  };
  return (
    <div
      className="panel-glow"
      style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "10px 14px 6px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <div className="t-tag" style={{ color: "var(--accent)" }}>
            NOW THINKING · restaurant-2 · agent reasoning trace
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 2 }}>
            concept menu · 12 covers · for <span style={{ color: "var(--accent-2)" }}>@vera.j</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
            PAUSE
          </button>
          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
            INTERVENE
          </button>
          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 9 }} type="button">
            FORK
          </button>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "8px 14px 12px",
          maxHeight: 360,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 78,
            top: 14,
            bottom: 14,
            width: 1,
            background: "color-mix(in oklch, var(--accent), transparent 70%)",
          }}
        />
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "30px 70px 1fr",
              gap: 6,
              padding: "4px 0",
              fontFamily: "var(--f-mono)",
              fontSize: 10.5,
              position: "relative",
            }}
          >
            <span style={{ color: "var(--fg-mute)", fontSize: 9 }}>
              +{l.t}.{(l.t * 4) % 10}s
            </span>
            <span
              style={{
                color: kColor[l.k] || "var(--fg)",
                padding: "0 6px",
                borderRadius: 999,
                border: `1px solid ${kColor[l.k] || "var(--line)"}`,
                fontSize: 8.5,
                letterSpacing: "0.14em",
                alignSelf: "start",
                background: "rgba(0,0,0,0.4)",
                textAlign: "center",
              }}
            >
              {l.k}
            </span>
            <span style={{ color: l.k === "DONE" ? "var(--el-earth)" : "var(--fg-dim)" }}>{l.msg}</span>
          </div>
        ))}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "30px 70px 1fr",
            gap: 6,
            padding: "4px 0",
            fontFamily: "var(--f-mono)",
            fontSize: 10.5,
          }}
        >
          <span style={{ color: "var(--accent)", fontSize: 9 }}>+16s</span>
          <span
            style={{
              color: "var(--accent)",
              padding: "0 6px",
              borderRadius: 999,
              border: "1px solid var(--accent)",
              fontSize: 8.5,
              letterSpacing: "0.14em",
              background: "rgba(0,0,0,0.4)",
              textAlign: "center",
            }}
          >
            ▶ NEXT
          </span>
          <span style={{ color: "var(--accent)" }}>
            render dossier · waiting on @gregcastro23 to sign off
            <span
              data-motion
              style={{
                display: "inline-block",
                marginLeft: 6,
                width: 6,
                height: 12,
                background: "var(--accent)",
                verticalAlign: "middle",
                animation: "blink 1s steps(1) infinite",
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
